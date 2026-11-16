// The six new full-length forms built from the private banks (scripts/bank/forms.json).
//
//   GET              -> { ok, forms: [{ id, name, status, approved, needed }] }
//                       students see only forms whose status is 'ready' (every item approved);
//                       Thomas also sees the forms still 'awaiting review', with the count
//   GET ?form=ACE_1  -> { ok, mock } the form in the runner's shape (tools/mock/full.js), only
//                       when it is ready, or for Thomas as a preview
//
// Needs a verified session (sign-in on), or Thomas's review key. With the switch off students
// get no new forms; the four existing full-length tests are unchanged.
import { json, signInEnabled } from '../lib/ace-token.mjs';
import { blobStore, caller, formContent, formStatus, loadJson, readDecisions } from '../lib/ace-bank-store.mjs';

export async function handleForms(req, { env = process.env, store, opts } = {}) {
  if (req.method !== 'GET') return json(405, { ok: false, error: 'GET' });
  const who = await caller(req, env);
  if (!who.reviewer && !who.session) return json(200, { ok: true, forms: [], reason: signInEnabled(env) ? 'sign_in_required' : 'sign_in_off' });
  store = store || await blobStore(env);
  const decisions = await readDecisions(store);
  const all = (((opts && opts.forms) || loadJson('scripts/bank/forms.json')) || {}).forms || [];
  const url = new URL(req.url), want = url.searchParams.get('form');
  const withStatus = all.map((f) => ({ f, s: formStatus(f, decisions, opts) }));
  if (want) {
    const hit = withStatus.find((x) => x.f.id === want);
    if (!hit) return json(404, { ok: false, error: 'no_form' });
    if (hit.s.status !== 'ready' && !who.reviewer) return json(403, { ok: false, error: 'awaiting_review' });
    return json(200, { ok: true, status: hit.s.status, preview: hit.s.status !== 'ready', mock: formContent(hit.f, opts) }, { 'Cache-Control': 'private, no-store' });
  }
  const forms = withStatus.filter((x) => who.reviewer || x.s.status === 'ready').map((x) => x.s);
  return json(200, { ok: true, forms, reviewer: !!who.reviewer }, { 'Cache-Control': 'private, no-store' });
}

export default async (req) => {
  try { return await handleForms(req); } catch (e) { return json(500, { ok: false, error: 'server' }); }
};
