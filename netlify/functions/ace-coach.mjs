// The coach view of Ace Labs accounts. Thomas only (a session with role master: his portal
// sign-in, or the email sign-in with an address in ACE_LABS_COACH_EMAILS). X-Ace-Session header.
//
// GET  /.netlify/functions/ace-coach                    -> every account: email, plan, pass end, last sign-in
// GET  /.netlify/functions/ace-coach?account=AL...       -> that account plus its misses (Repair) and recent answers
// POST /.netlify/functions/ace-coach  { action: 'comp', email, days, note }   -> give the pass free (days 0 = no end)
// POST /.netlify/functions/ace-coach  { action: 'uncomp', email }             -> take a comp back
//
// Misses come from the same place the student's own Repair page reads them: Tool State in the
// portal base, under the account id (or the Portal ID for a coaching student).
import { json, accountsEnabled, sessionFromRequest } from '../lib/ace-token.mjs';
import { defaultKv, accountById, findOrCreate, saveAccount, passUntil, validEmail, DAY_MS } from '../lib/ace-accounts.mjs';
import { airtableConfigured, loadProgress } from '../lib/ace-progress-store.mjs';
import { sameOrigin } from './ace-magic-request.mjs';

// The plan now: a pass or a comp counts at once (the student need not sign in again to show it);
// coaching, crash and coach come from the last sign-in, when the portal lookups ran.
export function planNow(a, now = Date.now()) {
  if (['coach', 'coaching'].includes(a.lastPlan)) return a.lastPlan;
  if (a.comp && (!a.comp.until || a.comp.until > now)) return 'comp';
  if (passUntil(a.pass && a.pass.grants) > now) return 'pass';
  return a.lastPlan === 'crash' ? 'crash' : 'free';
}

function row(a) {
  return { id: a.id, email: a.email, created: a.created, lastLogin: a.lastLogin, plan: planNow(a), passUntil: passUntil(a.pass && a.pass.grants), comp: a.comp || null, portalId: a.portalId || null };
}

export function missesFrom(state, attempts) {
  const open = [], cleared = [];
  for (const [id, e] of Object.entries((state && state.repair) || {})) {
    const m = { id, section: e.section, topic: e.topicName || e.topic, trap: e.trap || '', reason: e.reason, missedAt: e.missedAt || e.lastMiss || 0, wins: (e.wins || []).length, due: e.due || 0, cleared: e.cleared || 0 };
    (e.cleared ? cleared : open).push(m);
  }
  open.sort((a, b) => b.missedAt - a.missedAt); cleared.sort((a, b) => b.cleared - a.cleared);
  const answers = (attempts || []).length, right = (attempts || []).filter((a) => a.ok).length;
  return { open, cleared: cleared.slice(0, 50), clearedCount: cleared.length, answers, right };
}

export async function handleCoach(req, { env = process.env, kv, fetchImpl = fetch, now = Date.now() } = {}) {
  if (!accountsEnabled(env)) return json(404, { ok: false, error: 'accounts_off' });
  const s = await sessionFromRequest(req, env, { now: Math.floor(now / 1000), headerOnly: true });
  if (!s) return json(401, { ok: false, error: 'sign_in_required' });
  if (s.role !== 'master') return json(403, { ok: false, error: 'coach_only' });
  const store = kv || await defaultKv();
  const url = new URL(req.url);

  if (req.method === 'GET') {
    const id = url.searchParams.get('account');
    if (id) {
      const a = await accountById(store, id);
      if (!a) return json(404, { ok: false, error: 'no_account' });
      let progress = null;
      if (airtableConfigured(env)) { const { state, attempts } = await loadProgress(a.portalId || a.id, env, fetchImpl); progress = missesFrom(state, attempts); }
      return json(200, { ok: true, account: row(a), progress });
    }
    const accounts = [];
    for (const k of (await store.list('acct/')).slice(0, 2000)) { const v = await store.get(k); try { accounts.push(row(JSON.parse(v))); } catch { /* skip a damaged record */ } }
    accounts.sort((x, y) => (y.lastLogin || y.created) - (x.lastLogin || x.created));
    return json(200, { ok: true, accounts });
  }

  if (req.method === 'POST') {
    if (!sameOrigin(req)) return json(403, { ok: false, error: 'origin' });
    let body; try { body = JSON.parse((await req.text()).slice(0, 4096) || '{}'); } catch { return json(400, { ok: false, error: 'bad_json' }); }
    if (!validEmail(body.email)) return json(400, { ok: false, error: 'bad_email' });
    const a = await findOrCreate(store, body.email, now);
    if (body.action === 'comp') {
      const days = Math.max(0, Math.min(800, Math.round(Number(body.days) || 0)));
      a.comp = { until: days ? now + days * DAY_MS : 0, note: String(body.note || '').slice(0, 200), by: s.sub, at: now };
    } else if (body.action === 'uncomp') {
      a.comp = null;
    } else return json(400, { ok: false, error: 'bad_action' });
    await saveAccount(store, a);
    return json(200, { ok: true, account: row(a) });
  }
  return json(405, { ok: false, error: 'GET or POST' });
}

export default async (req) => {
  try { return await handleCoach(req); } catch (e) { return json(e && e.status && e.status < 600 ? e.status : 500, { ok: false, error: 'server' }); }
};
