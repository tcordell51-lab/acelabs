// Stripe for the Ace Labs pass. No SDK: two REST calls and the webhook signature check.
//
// TEST MODE ONLY until Thomas decides otherwise: a live secret key (sk_live_...) is refused
// unless ACE_LABS_STRIPE_ALLOW_LIVE=yes, the same lock PAT Lab uses.
//
// Env: STRIPE_SECRET_KEY        sk_test_... (Thomas pastes it in Netlify; never in chat or code)
//      ACE_LABS_PASS_PRICE_ID   price_... of the "Ace Labs pass" one-time price
//      STRIPE_WEBHOOK_SECRET    whsec_... of the Ace Labs webhook endpoint
//      ACE_LABS_STRIPE_ALLOW_LIVE  "yes" only when Thomas switches to live mode
import crypto from 'node:crypto';

export const PRODUCT_TAG = 'acelabs-pass';
const API = 'https://api.stripe.com/v1';

/**
 * Stripe-Signature check over the raw body bytes: t=<unix>,v1=<hex HMAC-SHA256(secret, "t.body")>.
 * Same rule as acethedat-com's stripe-ledger verifySignature (5 minute tolerance).
 */
export function verifyStripeSignature(raw, header, secret, nowMs = Date.now(), toleranceSec = 300) {
  try {
    if (!secret || !header) return false;
    const parts = String(header).split(',').map((p) => p.trim());
    const t = (parts.find((p) => p.startsWith('t=')) || '').slice(2);
    const sigs = parts.filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
    if (!/^\d+$/.test(t) || !sigs.length) return false;
    if (Math.abs(nowMs / 1000 - Number(t)) > toleranceSec) return false;
    const body = Buffer.isBuffer(raw) ? raw : Buffer.from(String(raw), 'utf8');
    const expected = crypto.createHmac('sha256', secret).update(Buffer.concat([Buffer.from(`${t}.`, 'utf8'), body])).digest('hex');
    return sigs.some((sg) => sg.length === expected.length && crypto.timingSafeEqual(Buffer.from(sg), Buffer.from(expected)));
  } catch {
    return false;
  }
}

/** For tests: a header Stripe would send for this body. */
export function signStripePayload(raw, secret, t = Math.floor(Date.now() / 1000)) {
  return `t=${t},v1=${crypto.createHmac('sha256', secret).update(`${t}.${raw}`, 'utf8').digest('hex')}`;
}

/** Why Stripe is not usable right now, or '' when it is. */
export function stripeProblem(env) {
  const key = String(env.STRIPE_SECRET_KEY || '');
  if (!key) return 'stripe_not_configured';
  if (!key.startsWith('sk_test_') && env.ACE_LABS_STRIPE_ALLOW_LIVE !== 'yes') return 'live_mode_locked';
  if (!/^price_[A-Za-z0-9]+$/.test(String(env.ACE_LABS_PASS_PRICE_ID || ''))) return 'price_not_configured';
  return '';
}

async function stripe(env, fetchImpl, path, { method = 'GET', form } = {}) {
  const res = await fetchImpl(`${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, ...(form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}) },
    body: form ? new URLSearchParams(form).toString() : undefined,
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error('stripe answered ' + res.status), { status: 502, stripe: j && j.error && j.error.type });
  return j;
}

/**
 * Checks the configured Stripe price before anyone is sent to pay: active, one-time (never a
 * subscription), USD, and exactly the amount the pass page shows (24900 cents for $249).
 * Returns '' when it matches, or why not. A wrong or recurring price ID never reaches a student.
 */
export async function passPriceProblem(env, fetchImpl, expectedCents) {
  let p;
  try { p = await stripe(env, fetchImpl, `/prices/${encodeURIComponent(env.ACE_LABS_PASS_PRICE_ID)}`); } catch { return 'price_lookup_failed'; }
  if (!p || p.object !== 'price' || !p.active) return 'price_inactive';
  if (p.type !== 'one_time' || p.recurring) return 'price_recurring';
  if (String(p.currency || '').toLowerCase() !== 'usd' || p.unit_amount !== expectedCents) return 'price_mismatch';
  return '';
}

/** One Checkout Session for one account. One-time payment, no subscription, no auto-renew. */
export async function createCheckout(env, fetchImpl, { accountId, email, site, days }) {
  const form = {
    mode: 'payment',
    'line_items[0][price]': env.ACE_LABS_PASS_PRICE_ID,
    'line_items[0][quantity]': '1',
    client_reference_id: accountId,
    customer_email: email,
    'metadata[product]': PRODUCT_TAG,
    'metadata[acelabs_account]': accountId,
    'metadata[days]': String(days),
    'payment_intent_data[metadata][product]': PRODUCT_TAG,
    'payment_intent_data[metadata][acelabs_account]': accountId,
    success_url: `${site}/account/?paid={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/pass/?canceled=1`,
  };
  if (env.ACE_LABS_ALLOW_PROMO_CODES === 'yes') form.allow_promotion_codes = 'true';
  const s = await stripe(env, fetchImpl, '/checkout/sessions', { method: 'POST', form });
  return { id: s.id, url: s.url };
}

export async function retrieveCheckout(env, fetchImpl, id) {
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(String(id || ''))) throw Object.assign(new Error('bad session id'), { status: 400 });
  return stripe(env, fetchImpl, `/checkout/sessions/${id}`);
}

/** A Checkout Session that pays for the Ace Labs pass and is paid. */
export function isPaidPass(s) {
  return !!s && s.object === 'checkout.session' && s.mode === 'payment' && s.payment_status === 'paid'
    && s.metadata && s.metadata.product === PRODUCT_TAG;
}
