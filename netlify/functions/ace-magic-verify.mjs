// POST /.netlify/functions/ace-magic-verify   Body: { token }
//
// Step two of the email sign-in. Uses the one-time link (single use, 15 minutes), finds or
// creates the account for that address, works out what it opens (free, pass, coaching, crash
// course, comp, coach; see netlify/lib/ace-accounts.mjs) and answers with an Ace Labs session:
// the same signed token and HttpOnly cookie the portal sign-in gives, so the gate, progress sync
// and sign-out work the same way for both.
import { json, accountsEnabled } from '../lib/ace-token.mjs';
import { safeNext } from '../lib/ace-access.mjs';
import { defaultKv, consumeMagic, findOrCreate, resolveAccess, mintAccountSession, saveAccount, sessionBody } from '../lib/ace-accounts.mjs';
import { sameOrigin } from './ace-magic-request.mjs';

export async function handleMagicVerify(req, { env = process.env, kv, lookups, now = Date.now() } = {}) {
  if (req.method !== 'POST') return json(405, { ok: false, error: 'POST only' });
  if (!accountsEnabled(env)) return json(404, { ok: false, error: 'accounts_off' });
  if (!sameOrigin(req)) return json(403, { ok: false, error: 'origin' });
  let body; try { body = JSON.parse((await req.text()).slice(0, 4096) || '{}'); } catch { return json(400, { ok: false, error: 'bad_json' }); }
  const store = kv || await defaultKv();
  const link = await consumeMagic(store, String(body.token || ''), now);
  if (!link) return json(401, { ok: false, error: 'link_expired' });

  const acct = await findOrCreate(store, link.email, now);
  const access = await resolveAccess(acct, env, { now, lookups });
  acct.lastLogin = now; acct.lastPlan = access.plan; if (access.portalId) acct.portalId = access.portalId;
  await saveAccount(store, acct);
  const m = await mintAccountSession(acct, access, env, Math.floor(now / 1000));
  return json(200, { ...sessionBody(m), next: safeNext(link.next) }, { 'Set-Cookie': m.cookie });
}

export default async (req) => {
  try { return await handleMagicVerify(req); } catch (e) { return json(e && e.status === 503 ? 503 : 500, { ok: false, error: 'server' }); }
};
