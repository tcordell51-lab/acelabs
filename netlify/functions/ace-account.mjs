// GET /.netlify/functions/ace-account   (X-Ace-Session header)
//
// The signed-in account: email, plan, pass end. For an email account it also works the access
// out again and answers with a fresh session, so a pass paid a minute ago (webhook) or a comp
// Thomas just set takes effect without signing in again.
// A portal sign-in answers { src: 'portal' }: that account lives in the portal.
import { json, accountsEnabled, sessionFromRequest } from '../lib/ace-token.mjs';
import { defaultKv, accountById, resolveAccess, mintAccountSession, saveAccount, sessionBody, passUntil, passDays } from '../lib/ace-accounts.mjs';

export function accountView(acct, access) {
  return {
    email: acct.email, id: acct.id, created: acct.created, plan: access.plan, until: access.until || 0,
    passUntil: passUntil(acct.pass && acct.pass.grants), payments: (acct.pass && acct.pass.grants || []).filter((g) => !g.refunded).length,
  };
}

export async function handleAccount(req, { env = process.env, kv, lookups, now = Date.now() } = {}) {
  if (req.method !== 'GET') return json(405, { ok: false, error: 'GET only' });
  if (!accountsEnabled(env)) return json(404, { ok: false, error: 'accounts_off' });
  const s = await sessionFromRequest(req, env, { now: Math.floor(now / 1000), headerOnly: true });
  if (!s) return json(401, { ok: false, error: 'sign_in_required' });
  if (s.src !== 'email') return json(200, { ok: true, src: 'portal', role: s.role, passDays: passDays(env) });
  const store = kv || await defaultKv();
  const acct = await accountById(store, s.acct);
  if (!acct) return json(401, { ok: false, error: 'no_account' });
  const access = await resolveAccess(acct, env, { now, lookups });
  if (acct.lastPlan !== access.plan) { acct.lastPlan = access.plan; await saveAccount(store, acct); }
  const m = await mintAccountSession(acct, access, env, Math.floor(now / 1000));
  return json(200, { ...sessionBody(m), account: accountView(acct, access), passDays: passDays(env) }, { 'Set-Cookie': m.cookie });
}

export default async (req) => {
  try { return await handleAccount(req); } catch { return json(500, { ok: false, error: 'server' }); }
};
