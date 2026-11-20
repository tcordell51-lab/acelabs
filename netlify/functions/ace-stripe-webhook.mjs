// POST /.netlify/functions/ace-stripe-webhook   (Stripe only)
//
// Grants the Ace Labs pass when Stripe says a Checkout Session for it was paid, and takes it back
// on a full refund. The Stripe-Signature header is checked over the raw body bytes with
// STRIPE_WEBHOOK_SECRET before anything is read; a bad or missing signature answers 400 and
// changes nothing.
//
// Events (Stripe > Developers > Webhooks > the Ace Labs endpoint):
//   checkout.session.completed, checkout.session.async_payment_succeeded   grant (once per session)
//   charge.refunded (fully refunded only)                                   revoke that grant
// Anything else, and any Checkout Session that is not tagged metadata.product=acelabs-pass
// (crash course and coaching links share the Stripe account), answers 200 and is ignored.
//
// This function runs whenever its secret is set, even with ACE_LABS_ACCOUNTS off, so a payment
// is always recorded.
import { json } from '../lib/ace-token.mjs';
import { defaultKv, accountById, findOrCreate, grantPass, revokeByPaymentIntent, passDays, validEmail } from '../lib/ace-accounts.mjs';
import { verifyStripeSignature, isPaidPass } from '../lib/ace-stripe.mjs';

export async function handleWebhook(req, { env = process.env, kv, now = Date.now() } = {}) {
  if (req.method !== 'POST') return json(405, { ok: false, error: 'POST only' });
  const secret = env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return json(503, { ok: false, error: 'not_configured' });
  const raw = Buffer.from(await req.arrayBuffer());
  if (raw.length > 512 * 1024) return json(413, { ok: false, error: 'too_large' });
  if (!verifyStripeSignature(raw, req.headers.get('stripe-signature') || '', secret, now)) return json(400, { ok: false, error: 'bad_signature' });
  let ev; try { ev = JSON.parse(raw.toString('utf8')); } catch { return json(400, { ok: false, error: 'bad_json' }); }
  const store = kv || await defaultKv();
  const obj = ev && ev.data && ev.data.object;

  if (ev.type === 'checkout.session.completed' || ev.type === 'checkout.session.async_payment_succeeded') {
    if (!isPaidPass(obj)) return json(200, { ok: true, ignored: 'not_a_paid_pass' });
    let acct = await accountById(store, obj.client_reference_id || (obj.metadata && obj.metadata.acelabs_account));
    const email = (obj.customer_details && obj.customer_details.email) || obj.customer_email || '';
    if (!acct && validEmail(email)) acct = await findOrCreate(store, email, now);   // paid without an account: make one for that address
    if (!acct) return json(200, { ok: true, ignored: 'no_account' });
    const days = Number(obj.metadata && obj.metadata.days) || passDays(env);
    const r = await grantPass(store, acct, { cs: obj.id, pi: typeof obj.payment_intent === 'string' ? obj.payment_intent : '', days, at: obj.created ? obj.created * 1000 : now, amount: obj.amount_total || 0, currency: obj.currency || 'usd', livemode: obj.livemode });
    return json(200, { ok: true, granted: r.added, account: acct.id });
  }
  if (ev.type === 'charge.refunded') {
    if (!obj || !obj.refunded || typeof obj.payment_intent !== 'string') return json(200, { ok: true, ignored: 'partial_or_unknown' });
    const acct = await revokeByPaymentIntent(store, obj.payment_intent);
    return json(200, { ok: true, revoked: !!acct });
  }
  return json(200, { ok: true, ignored: ev.type || 'unknown' });
}

export default async (req) => {
  // 500 makes Stripe retry: right for a storage hiccup, never reached on a bad signature
  try { return await handleWebhook(req); } catch { return json(500, { ok: false, error: 'server' }); }
};
