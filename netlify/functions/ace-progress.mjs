// GET  /.netlify/functions/ace-progress             -> the signed-in student's own progress
// GET  /.netlify/functions/ace-progress?student=ID  -> a coach reading the one student the
//                                                     portal put in their session (read only)
// POST /.netlify/functions/ace-progress  Body: { attempts: [...], items: {id: item}, repair: {id: entry}, days: {day: counts} }
//
// The student id is the verified session's own id. It is never read from the body. A
// student who names any other id is refused. Requires the X-Ace-Session header: the
// cookie alone is not accepted here, so another site cannot write through a visitor's browser.
//
// Storage: Airtable, Tool State table (see netlify/lib/ace-progress-store.mjs). The
// browser's localStorage is only a cache of this.
// Env: ACE_LABS_SIGN_IN, ACE_LABS_HANDOFF_SECRET, AIRTABLE_PAT.
import { json, signInEnabled, sessionFromRequest, STUDENT_ID } from '../lib/ace-token.mjs';
import { airtableConfigured, loadProgress, savePush } from '../lib/ace-progress-store.mjs';

const MAX_BODY = 512 * 1024;

export async function handleProgress(req, { env = process.env, fetchImpl = fetch, now } = {}) {
  if (!signInEnabled(env)) return json(404, { ok: false, error: 'sign_in_off' });
  const session = await sessionFromRequest(req, env, { now, headerOnly: true });
  if (!session) return json(401, { ok: false, error: 'sign_in_required' });
  if (!airtableConfigured(env)) return json(503, { ok: false, error: 'not_configured' });

  const url = new URL(req.url);
  const asked = (url.searchParams.get('student') || '').trim();

  if (req.method === 'GET') {
    let studentId;
    if (session.role === 'student') {
      if (asked && asked !== session.sub) return json(403, { ok: false, error: 'not_permitted' });
      studentId = session.sub;
    } else {
      // A coach session carries at most one student id, checked by the portal against
      // the coach's own students when it minted the handoff.
      if (!asked || !session.view || asked !== session.view) return json(403, { ok: false, error: 'not_permitted' });
      studentId = session.view;
    }
    if (!STUDENT_ID.test(studentId)) return json(403, { ok: false, error: 'not_permitted' });
    const { state, attempts } = await loadProgress(studentId, env, fetchImpl);
    return json(200, { ok: true, student: studentId, record: state, attempts });
  }

  if (req.method === 'POST') {
    if (session.role !== 'student') return json(403, { ok: false, error: 'read_only' });   // coaches never write a student's progress
    if (!STUDENT_ID.test(session.sub)) return json(403, { ok: false, error: 'not_permitted' });
    const text = await req.text();
    if (text.length > MAX_BODY) return json(413, { ok: false, error: 'too_large' });
    let body; try { body = JSON.parse(text || '{}'); } catch { return json(400, { ok: false, error: 'bad_json' }); }
    const named = String(body.student || body.studentId || asked || '').trim();
    if (named && named !== session.sub) return json(403, { ok: false, error: 'not_permitted' });
    const { saved, state } = await savePush(session.sub, body, env, fetchImpl);
    return json(200, { ok: true, saved, updated: state.updated });
  }
  return json(405, { ok: false, error: 'GET or POST' });
}

export default async (req) => {
  try { return await handleProgress(req); } catch (e) { return json(e && e.status && e.status < 600 ? e.status : 500, { ok: false, error: 'server' }); }
};
