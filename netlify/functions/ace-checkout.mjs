// POST /.netlify/functions/ace-checkout   (X-Ace-Session header)          -> { ok, url }
//   Starts Stripe Checkout for the Ace Labs pass ($249 once, 90 days, no auto-renew), for the
//   signed-in email account. Refuses (503) when the Stripe price is not that exact one-time price.
// POST /.netlify/functions/ace-checkout?confirm=1   Body: { session_id }  -> a fresh session
//   Where Stripe sends the buyer back (/account/?paid=cs_...). Confirms that Checkout Session with
//   Stripe, checks it is this account's, records the pass (same record the webhook writes, once)
//   and answers with a session that opens everything. Whichever of the two arrives first wins.
//
// Test mode only unless ACE_LABS_STRIPE_ALLOW_LIVE=yes. See netlify/lib/ace-stripe.mjs.
//
// With ACE_LABS_PASS_LINK set (Payment Link mode, no secret key), the first call answers with the
// Payment Link for this account, and ?confirm=1 cannot ask Stripe: it answers with this account's
// own state, 200 once the webhook has recorded the pass and 402 { error: 'pending' } until then.
import { json, accountsEnabled, sessionFromRequest } from '../lib/ace-token.mjs';
import { defaultKv, accountById, resolveAccess, mintAccountSession, sessionBody, grantPass, passDays, passPriceCents, siteUrl } from '../lib/ace-accounts.mjs';
import { stripeProblem, passPriceProblem, createCheckout, retrieveCheckout, isPaidPass, passLink, passLinkProblem, passLinkUrl } from '../lib/ace-stripe.mjs';
import { sameOrigin } from './ace-magic-request.mjs';
import { accountView } from './ace-account.mjs';

export async function handleCheckout(req, { env = process.env, kv, lookups, fetchImpl = fetch, now = Date.now() } = {}) {
  if (req.method !== 'POST') return json(405, { ok: false, error: 'POST only' });
  if (!accountsEnabled(env)) return json(404, { ok: false, error: 'accounts_off' });
  if (!sameOrigin(req)) return json(403, { ok: false, error: 'origin' });
  const s = await sessionFromRequest(req, env, { now: Math.floor(now / 1000), headerOnly: true });
  if (!s) return json(401, { ok: false, error: 'sign_in_required' });
  if (s.src !== 'email') return json(409, { ok: false, error: 'portal_account' });   // portal students already have everything
  const linkMode = !!passLink(env);
  const problem = linkMode ? passLinkProblem(env) : stripeProblem(env);
  if (problem) return json(503, { ok: false, error: problem });
  const store = kv || await defaultKv();
  const acct = await accountById(store, s.acct);
  if (!acct) return json(401, { ok: false, error: 'no_account' });

  if (linkMode) {
    const access = await resolveAccess(acct, env, { now, lookups });
    if (new URL(req.url).searchParams.get('confirm')) {
      if (access.plan === 'free') return json(402, { ok: false, error: 'pending' });
      const m = await mintAccountSession(acct, access, env, Math.floor(now / 1000));
      return json(200, { ...sessionBody(m), account: accountView(acct, access) }, { 'Set-Cookie': m.cookie });
    }
    if (['coach', 'coaching'].includes(access.plan) || (access.plan === 'comp' && !access.until)) return json(409, { ok: false, error: 'already_included', plan: access.plan });
    return json(200, { ok: true, url: passLinkUrl(env, { accountId: acct.id, email: acct.email }) });
  }

  if (new URL(req.url).searchParams.get('confirm')) {
    let body; try { body = JSON.parse((await req.text()).slice(0, 2048) || '{}'); } catch { return json(400, { ok: false, error: 'bad_json' }); }
    let cs;
    try { cs = await retrieveCheckout(env, fetchImpl, String(body.session_id || '')); } catch (e) { return json(e.status === 400 ? 400 : 502, { ok: false, error: e.status === 400 ? 'bad_session' : 'stripe' }); }
    if (!isPaidPass(cs)) return json(402, { ok: false, error: 'not_paid' });
    const owner = cs.client_reference_id || (cs.metadata && cs.metadata.acelabs_account);
    if (owner !== acct.id) return json(403, { ok: false, error: 'not_yours' });
    const days = Number(cs.metadata && cs.metadata.days) || passDays(env);
    await grantPass(store, acct, { cs: cs.id, pi: typeof cs.payment_intent === 'string' ? cs.payment_intent : '', days, at: (cs.created ? cs.created * 1000 : now), amount: cs.amount_total || 0, currency: cs.currency || 'usd', livemode: cs.livemode });
    const access = await resolveAccess(acct, env, { now, lookups });
    const m = await mintAccountSession(acct, access, env, Math.floor(now / 1000));
    return json(200, { ...sessionBody(m), account: accountView(acct, access) }, { 'Set-Cookie': m.cookie });
  }

  const access = await resolveAccess(acct, env, { now, lookups });
  if (['coach', 'coaching'].includes(access.plan) || (access.plan === 'comp' && !access.until)) return json(409, { ok: false, error: 'already_included', plan: access.plan });
  const priceProblem = await passPriceProblem(env, fetchImpl, passPriceCents(env));
  if (priceProblem) return json(503, { ok: false, error: priceProblem });
  const out = await createCheckout(env, fetchImpl, { accountId: acct.id, email: acct.email, site: siteUrl(env, req), days: passDays(env) });
  return json(200, { ok: true, url: out.url });
}

export default async (req) => {
  try { return await handleCheckout(req); } catch (e) { return json(e && e.status && e.status < 600 ? e.status : 500, { ok: false, error: 'server' }); }
};
