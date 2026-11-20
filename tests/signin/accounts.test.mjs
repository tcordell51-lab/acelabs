// Email accounts and the Ace Labs pass: the gate with ACE_LABS_ACCOUNTS on, sign-in links,
// who gets what, Stripe Checkout and the webhook, the coach view.
import test from 'node:test';
import assert from 'node:assert/strict';
import { decide } from '../../netlify/lib/ace-gate-core.mjs';
import { SESSION_COOKIE } from '../../netlify/lib/ace-token.mjs';
import { memoryKv, findOrCreate, accountByEmail, accountById, resolveAccess, grantPass, passUntil, issueMagic, consumeMagic, saveAccount, airtableLookups, DAY_MS } from '../../netlify/lib/ace-accounts.mjs';
import { signStripePayload, verifyStripeSignature } from '../../netlify/lib/ace-stripe.mjs';
import { signInEmail, brandProblems } from '../../netlify/lib/ace-mail.mjs';
import { handleMagicRequest } from '../../netlify/functions/ace-magic-request.mjs';
import { handleMagicVerify } from '../../netlify/functions/ace-magic-verify.mjs';
import { handleAccount } from '../../netlify/functions/ace-account.mjs';
import { handleCheckout } from '../../netlify/functions/ace-checkout.mjs';
import { handleWebhook } from '../../netlify/functions/ace-stripe-webhook.mjs';
import { handleCoach } from '../../netlify/functions/ace-coach.mjs';
import { handleSession } from '../../netlify/functions/ace-session.mjs';
import { handleProgress } from '../../netlify/functions/ace-progress.mjs';
import { ON, NOW, sessionToken, req, fakeAirtable } from './helpers.mjs';

const ACC = { ...ON, ACE_LABS_ACCOUNTS: 'on', ACE_LABS_SITE_URL: 'https://acelabs.netlify.app', ACE_LABS_COACH_EMAILS: 'coach@acethedat.com' };
const MS = NOW * 1000;
const WHSEC = 'whsec_test_0123456789abcdef';
const STRIPE = { STRIPE_SECRET_KEY: 'sk_test_x', ACE_LABS_PASS_PRICE_ID: 'price_TEST123', STRIPE_WEBHOOK_SECRET: WHSEC };
const noLookups = { student: async () => null, crash: async () => null };
const go = (r, env = ACC) => decide(r, env, { now: NOW });
const cookieReq = async (p, claims) => req(p, { headers: { cookie: `${SESSION_COOKIE}=${await sessionToken(claims)}` } });
const free = { sub: 'ALABCDEFGHJK', src: 'email', acct: 'ALABCDEFGHJK', plan: 'free', ent: ['free-account'] };
const paid = { ...free, plan: 'pass', ent: ['all'], until: NOW + 30 * 86400 };
const BANKS = ['/tools/mock/data/full-mocks.js', '/shared/dat-mock-tests.js', '/games/ochem-bank-1000.js', '/tools/rc/data/bank.js', '/tools/minitests/bank.js'];

/* ------------------------------------------------------------------ gate */

test('accounts flag alone does nothing while the gate is off; both off: the site is untouched', async () => {
  for (const env of [{ ACE_LABS_ACCOUNTS: 'on' }, {}]) for (const p of ['/', '/data/gchem.json', ...BANKS, '/pass/', '/coach/accounts/'])
    assert.deepEqual(await go(req(p), env), { action: 'pass' });
});

test('gate on, accounts off: a signed-in visitor without the entitlement still goes to /sign-in/ (no change)', async () => {
  const d = await go(await cookieReq('/tools/mock/full.html', { ent: [] }), ON);
  assert.equal(d.action, 'redirect'); assert.match(d.location, /^\/sign-in\//);
  assert.equal((await go(await cookieReq('/gc/', free), ON)).action, 'redirect');   // no free-account pages without the accounts flag
});

test('signed out with accounts on: banks 401, locked pages to /sign-in/, free pages open', async () => {
  for (const p of BANKS) assert.equal((await go(req(p))).status, 401, p);
  assert.match((await go(req('/gc/'))).location, /^\/sign-in\/\?next=%2Fgc%2F/);
  for (const p of ['/', '/pass/', '/account/', '/diagnostic.html', '/gc/galvanic/']) assert.equal((await go(req(p))).action, 'pass', p);
});

test('free account: section hubs and Repair open; banks become the 10-question samples', async () => {
  for (const p of ['/gc/', '/bio/', '/oc/', '/qr/drill/', '/repair/', '/progress/']) {
    const d = await go(await cookieReq(p, free)); assert.equal(d.action, 'pass', p); assert.equal(d.private, true, p);
  }
  assert.deepEqual(await go(await cookieReq('/data/gchem.json', free)), { action: 'rewrite', to: '/data/free/sample-gchem.json' });
  assert.deepEqual(await go(await cookieReq('/data/qr-dat.json', free)), { action: 'rewrite', to: '/data/free/sample-qr-dat.json' });
});

test('free account: locked pages go to /pass/, locked banks answer 402, never the file', async () => {
  for (const p of ['/tools/mock/full.html', '/gc/vsepr/', '/tools/ochem/', '/prometric-mock.html']) {
    const d = await go(await cookieReq(p, free)); assert.equal(d.action, 'redirect', p); assert.match(d.location, /^\/pass\/\?next=/, p);
  }
  for (const p of BANKS) { const d = await go(await cookieReq(p, free)); assert.equal(d.action, 'deny', p); assert.equal(d.status, 402, p); }
});

test('pass holder: everything opens, full banks are served; after the pass ends the same session is a free account', async () => {
  for (const p of ['/tools/mock/full.html', ...BANKS, '/data/gchem.json']) assert.equal((await go(await cookieReq(p, paid))).private, true, p);
  const ended = { ...paid, until: NOW - 1 };
  assert.equal((await go(await cookieReq(BANKS[0], ended))).status, 402);
  assert.deepEqual(await go(await cookieReq('/data/bio.json', ended)), { action: 'rewrite', to: '/data/free/sample-bio.json' });
});

test('coach pages: a student with full access is refused; Thomas is let in', async () => {
  assert.equal((await go(await cookieReq('/coach/accounts/', paid))).action, 'redirect');
  assert.equal((await go(await cookieReq('/coach/accounts/', { sub: 'S22', role: 'student', ent: ['all'] }))).action, 'redirect');
  assert.equal((await go(await cookieReq('/coach/accounts/', { sub: 'ALCOACHCOACH', role: 'master', src: 'email', ent: ['all'] }))).private, true);
});

test('a forged session cookie is a signed-out visitor with accounts on too', async () => {
  const forged = await sessionToken(paid, 'another-secret-0123456789-abcdefghijklmn');
  assert.equal((await go(req(BANKS[0], { headers: { cookie: `${SESSION_COOKIE}=${forged}` } }))).status, 401);
});

/* ------------------------------------------------------------------ sign-in links */

function mailbox() { const sent = []; return { sent, mailer: async (m) => { sent.push(m); return true; } }; }
const linkToken = (m) => /#m=([A-Za-z0-9_-]+)/.exec(m.html)[1];

test('sign-in link: emailed, branded, token only in the fragment, works once, makes a free account', async () => {
  const kv = memoryKv(); const box = mailbox();
  const r = await handleMagicRequest(req('/.netlify/functions/ace-magic-request', { method: 'POST', body: { email: 'Maya@School.edu', next: '/gc/' } }), { env: ACC, kv, mailer: box.mailer, now: MS });
  assert.equal(r.status, 200); assert.deepEqual(await r.json(), { ok: true });
  assert.equal(box.sent.length, 1); assert.equal(box.sent[0].to, 'maya@school.edu');
  assert.match(box.sent[0].html, /https:\/\/acelabs\.netlify\.app\/sign-in\/#m=/);
  assert.deepEqual(brandProblems(box.sent[0].html), []);
  assert.ok(!/—|–/.test(box.sent[0].html + box.sent[0].text), 'no em or en dashes');

  const tok = linkToken(box.sent[0]);
  const v = await handleMagicVerify(req('/.netlify/functions/ace-magic-verify', { method: 'POST', body: { token: tok } }), { env: ACC, kv, lookups: noLookups, now: MS + 1000 });
  assert.equal(v.status, 200);
  const body = await v.json();
  assert.equal(body.plan, 'free'); assert.equal(body.role, 'student'); assert.equal(body.next, '/gc/'); assert.match(body.sub, /^AL[A-Z2-9]{10}$/);
  assert.match(v.headers.get('set-cookie'), /^ace_session=.+HttpOnly; Secure/);
  const again = await handleMagicVerify(req('/.netlify/functions/ace-magic-verify', { method: 'POST', body: { token: tok } }), { env: ACC, kv, lookups: noLookups, now: MS + 2000 });
  assert.equal(again.status, 401, 'a link works once');
  assert.ok(await accountByEmail(kv, 'maya@school.edu'));
});

test('sign-in link: expires after 15 minutes; a made-up token fails', async () => {
  const kv = memoryKv();
  const tok = await issueMagic(kv, 'a@b.co', '/', MS);
  assert.equal(await consumeMagic(kv, tok, MS + 16 * 60000), null);
  assert.equal(await consumeMagic(kv, 'x'.repeat(43), MS), null);
});

test('sign-in link requests: same answer for new and known addresses, bad input refused, rate limited, off when the flag is off', async () => {
  const kv = memoryKv(); const box = mailbox();
  const ask = (email, env = ACC, headers = {}) => handleMagicRequest(req('/.netlify/functions/ace-magic-request', { method: 'POST', headers, body: { email } }), { env, kv, mailer: box.mailer, now: MS });
  await findOrCreate(kv, 'known@x.com', MS);
  assert.deepEqual(await (await ask('known@x.com')).json(), await (await ask('new@x.com')).json());
  assert.equal((await ask("o'brien@x.com")).status, 400);
  assert.equal((await ask('not-an-email')).status, 400);
  assert.equal((await ask('a@b.co', ON)).status, 404);
  assert.equal((await ask('a@b.co', ACC, { origin: 'https://evil.example' })).status, 403);
  let last; for (let i = 0; i < 6; i++) last = await ask('spam@x.com');
  assert.equal(last.status, 429);
});

/* ------------------------------------------------------------------ who gets what */

test('access: coach email, coaching student (Portal ID), crash course window, comp, pass, free', async () => {
  const kv = memoryKv();
  const a = await findOrCreate(kv, 'student@x.com', MS);
  assert.equal((await resolveAccess(a, ACC, { now: MS, lookups: noLookups })).plan, 'free');
  const coach = await findOrCreate(kv, 'coach@acethedat.com', MS);
  assert.deepEqual((await resolveAccess(coach, ACC, { now: MS, lookups: noLookups })).role, 'master');
  const coaching = await resolveAccess(a, ACC, { now: MS, lookups: { ...noLookups, student: async () => ({ portalId: 'S35' }) } });
  assert.equal(coaching.plan, 'coaching'); assert.equal(coaching.sub, 'S35'); assert.equal(coaching.until, 0);
  const crashNew = await resolveAccess(a, ACC, { now: MS, lookups: { ...noLookups, crash: async () => ({ since: MS - 10 * DAY_MS }) } });
  assert.equal(crashNew.plan, 'crash'); assert.equal(crashNew.until, MS + 80 * DAY_MS);
  assert.equal((await resolveAccess(a, ACC, { now: MS, lookups: { ...noLookups, crash: async () => ({ since: MS - 91 * DAY_MS }) } })).plan, 'free');
  a.comp = { until: 0 }; assert.equal((await resolveAccess(a, ACC, { now: MS, lookups: noLookups })).plan, 'comp');
  a.comp = null; await grantPass(kv, a, { cs: 'cs_test_1', days: 90, at: MS });
  const p = await resolveAccess(a, ACC, { now: MS, lookups: noLookups });
  assert.equal(p.plan, 'pass'); assert.equal(p.until, MS + 90 * DAY_MS);
});

test('access: a failing Airtable lookup never grants anything', async () => {
  const L = airtableLookups({ AIRTABLE_PAT: 'x' }, async () => { throw new Error('down'); });
  assert.equal(await L.student('a@b.co'), null); assert.equal(await L.crash('a@b.co'), null);
  const L2 = airtableLookups({ AIRTABLE_PAT: 'x' }, async () => new Response(JSON.stringify({ records: [{ fields: { Email: 'someone@else.com', Status: 'Active', 'Portal ID': 'S1' } }] }), { status: 200 }));
  assert.equal(await L2.student('a@b.co'), null, 'a row for another address is ignored');
});

test('pass grants stack and a second purchase starts when the first ends', () => {
  const g = [{ cs: 'a', at: MS, days: 90 }, { cs: 'b', at: MS + DAY_MS, days: 90 }];
  assert.equal(passUntil(g), MS + 180 * DAY_MS);
  assert.equal(passUntil([...g.slice(0, 1), { ...g[1], refunded: true }]), MS + 90 * DAY_MS);
});

/* ------------------------------------------------------------------ Stripe */

async function emailSession(kv, email = 'buyer@x.com', extra = {}) {
  const a = await findOrCreate(kv, email, MS);
  const tok = await sessionToken({ sub: a.id, acct: a.id, src: 'email', role: 'student', plan: 'free', ent: ['free-account'], ...extra });
  return { a, headers: { 'x-ace-session': tok } };
}
function fakeStripe(sessions = {}) {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    if ((init.method || 'GET') === 'POST') return new Response(JSON.stringify({ id: 'cs_test_NEW', url: 'https://checkout.stripe.com/c/pay/cs_test_NEW' }), { status: 200 });
    const id = String(url).split('/').pop();
    return sessions[id] ? new Response(JSON.stringify(sessions[id]), { status: 200 }) : new Response('{"error":{"type":"invalid_request_error"}}', { status: 404 });
  };
  return { calls, fetchImpl };
}
const paidSession = (id, acct, extra = {}) => ({ object: 'checkout.session', id, mode: 'payment', status: 'complete', payment_status: 'paid', client_reference_id: acct, metadata: { product: 'acelabs-pass', acelabs_account: acct, days: '90' }, payment_intent: 'pi_' + id, amount_total: 24900, currency: 'usd', livemode: false, created: NOW, customer_details: { email: 'buyer@x.com' }, ...extra });

test('checkout: needs a session; a one-time payment for this account; refuses live keys and portal sign-ins', async () => {
  const kv = memoryKv(); const st = fakeStripe();
  const call = (headers, env = { ...ACC, ...STRIPE }) => handleCheckout(req('/.netlify/functions/ace-checkout', { method: 'POST', headers, body: {} }), { env, kv, lookups: noLookups, fetchImpl: st.fetchImpl, now: MS });
  assert.equal((await call({})).status, 401);
  const { a, headers } = await emailSession(kv);
  assert.equal((await call(headers, ACC)).status, 503, 'no Stripe key: closed');
  assert.equal((await call(headers, { ...ACC, ...STRIPE, STRIPE_SECRET_KEY: 'sk_live_x' })).status, 503, 'live key locked');
  assert.equal((await call({ 'x-ace-session': await sessionToken() })).status, 409, 'portal students have it already');
  const r = await call(headers);
  assert.equal(r.status, 200); assert.match((await r.json()).url, /^https:\/\/checkout\.stripe\.com\//);
  const form = new URLSearchParams(st.calls[0].init.body);
  assert.equal(form.get('mode'), 'payment'); assert.equal(form.get('client_reference_id'), a.id); assert.equal(form.get('metadata[product]'), 'acelabs-pass');
  assert.equal(form.get('line_items[0][price]'), 'price_TEST123'); assert.equal(form.get('customer_email'), 'buyer@x.com');
  assert.match(form.get('success_url'), /^https:\/\/acelabs\.netlify\.app\/account\/\?paid=\{CHECKOUT_SESSION_ID\}$/);
});

test('checkout confirm: only a paid pass session for this same account grants it', async () => {
  const kv = memoryKv();
  const { a, headers } = await emailSession(kv);
  const st = fakeStripe({ cs_test_PAID: paidSession('cs_test_PAID', a.id), cs_test_OPEN: paidSession('cs_test_OPEN', a.id, { payment_status: 'unpaid' }), cs_test_OTHER: paidSession('cs_test_OTHER', 'ALZZZZZZZZZZ'), cs_test_CRASH: paidSession('cs_test_CRASH', a.id, { metadata: { product: 'crash-course' } }) });
  const confirm = (id) => handleCheckout(req('/.netlify/functions/ace-checkout?confirm=1', { method: 'POST', headers, body: { session_id: id } }), { env: { ...ACC, ...STRIPE }, kv, lookups: noLookups, fetchImpl: st.fetchImpl, now: MS });
  assert.equal((await confirm('cs_test_OPEN')).status, 402);
  assert.equal((await confirm('cs_test_CRASH')).status, 402);
  assert.equal((await confirm('cs_test_OTHER')).status, 403);
  assert.equal((await confirm('not-a-session')).status, 400);
  const ok = await confirm('cs_test_PAID'); const body = await ok.json();
  assert.equal(ok.status, 200); assert.equal(body.plan, 'pass'); assert.equal(body.account.until, NOW * 1000 + 90 * DAY_MS);
  await confirm('cs_test_PAID');
  assert.equal((await accountById(kv, a.id)).pass.grants.length, 1, 'confirming twice grants once');
});

const hook = (payload, env, kv, { sig, now = MS } = {}) => {
  const raw = JSON.stringify(payload);
  return handleWebhook(req('/.netlify/functions/ace-stripe-webhook', { method: 'POST', headers: { 'stripe-signature': sig || signStripePayload(raw, WHSEC, Math.floor(now / 1000)) }, body: raw }), { env, kv, now });
};

test('webhook: the signature is checked first; bad, missing, stale or wrong-secret signatures change nothing', async () => {
  const kv = memoryKv(); const { a } = await emailSession(kv);
  const ev = { id: 'evt_1', type: 'checkout.session.completed', data: { object: paidSession('cs_test_W', a.id) } };
  const env = { ...ACC, ...STRIPE };
  assert.equal((await hook(ev, env, kv, { sig: 't=1,v1=deadbeef' })).status, 400);
  assert.equal((await hook(ev, env, kv, { sig: signStripePayload(JSON.stringify(ev), 'whsec_wrong', NOW) })).status, 400);
  assert.equal((await hook(ev, env, kv, { sig: signStripePayload(JSON.stringify(ev), WHSEC, NOW - 600) })).status, 400, 'older than five minutes');
  assert.equal((await hook(ev, { ...env, STRIPE_WEBHOOK_SECRET: '' }, kv)).status, 503);
  const raw = JSON.stringify(ev); const tampered = raw.replace('"cs_test_W"', '"cs_test_X"');
  assert.equal(verifyStripeSignature(tampered, signStripePayload(raw, WHSEC, NOW), WHSEC, MS), false, 'a changed body fails');
  assert.equal(passUntil((await accountById(kv, a.id)).pass.grants), 0);
});

test('webhook: a paid pass grants once (retries are safe), other sales are ignored, a full refund takes it back, works with accounts off', async () => {
  const kv = memoryKv(); const { a } = await emailSession(kv);
  const env = { ...ON, ...STRIPE };   // ACE_LABS_ACCOUNTS off: a payment is still recorded
  const ev = { id: 'evt_2', type: 'checkout.session.completed', data: { object: paidSession('cs_test_H', a.id) } };
  const r = await hook(ev, env, kv); assert.equal(r.status, 200); assert.equal((await r.json()).granted, true);
  assert.equal((await (await hook(ev, env, kv)).json()).granted, false);
  assert.equal((await accountById(kv, a.id)).pass.grants.length, 1);
  const crash = { id: 'evt_3', type: 'checkout.session.completed', data: { object: paidSession('cs_test_C', a.id, { metadata: {} }) } };
  assert.equal((await (await hook(crash, env, kv)).json()).ignored, 'not_a_paid_pass');
  const partial = { id: 'evt_4', type: 'charge.refunded', data: { object: { refunded: false, payment_intent: 'pi_cs_test_H' } } };
  assert.equal((await (await hook(partial, env, kv)).json()).ignored, 'partial_or_unknown');
  const refund = { id: 'evt_5', type: 'charge.refunded', data: { object: { refunded: true, payment_intent: 'pi_cs_test_H' } } };
  assert.equal((await (await hook(refund, env, kv)).json()).revoked, true);
  assert.equal(passUntil((await accountById(kv, a.id)).pass.grants), 0);
});

test('webhook: a buyer with no account gets one made for the paying address', async () => {
  const kv = memoryKv();
  const ev = { id: 'evt_6', type: 'checkout.session.completed', data: { object: paidSession('cs_test_N', 'ALNOSUCHACCT', { customer_details: { email: 'Fresh@X.com' } }) } };
  assert.equal((await (await hook(ev, { ...ACC, ...STRIPE }, kv)).json()).granted, true);
  assert.ok(passUntil((await accountByEmail(kv, 'fresh@x.com')).pass.grants) > MS);
});

test('account refresh: a pass the webhook recorded opens everything without signing in again', async () => {
  const kv = memoryKv(); const { a, headers } = await emailSession(kv);
  await grantPass(kv, a, { cs: 'cs_test_R', days: 90, at: MS });
  const r = await handleAccount(req('/.netlify/functions/ace-account', { headers }), { env: ACC, kv, lookups: noLookups, now: MS });
  const body = await r.json();
  assert.equal(body.plan, 'pass'); assert.ok(body.token); assert.match(r.headers.get('set-cookie'), /^ace_session=/);
  assert.equal((await go(req(BANKS[0], { headers: { cookie: `${SESSION_COOKIE}=${body.token}` } }))).private, true);
  assert.equal((await handleAccount(req('/.netlify/functions/ace-account'), { env: ACC, kv, now: MS })).status, 401);
});

test('session status: says nothing about accounts while the flag is off', async () => {
  const off = await (await handleSession(req('/.netlify/functions/ace-session'), { env: ON, now: NOW })).json();
  assert.equal(off.accounts, false); assert.equal(off.pass, undefined);
  const on = await (await handleSession(req('/.netlify/functions/ace-session'), { env: { ...ACC, ACE_LABS_PASS_PRICE_LABEL: '$249' }, now: NOW })).json();
  assert.equal(on.accounts, true); assert.deepEqual(on.pass, { price: '$249', days: 90 });
});

/* ------------------------------------------------------------------ progress and the coach view */

test('progress: an email account saves and reads only its own record', async () => {
  const at = fakeAirtable(); const kv = memoryKv(); const { a, headers } = await emailSession(kv);
  const push = await handleProgress(req('/.netlify/functions/ace-progress', { method: 'POST', headers, body: { attempts: [{ id: 'gc_1', section: 'gchem', ok: false, at: MS }], repair: { gc_1: { section: 'gchem', missedAt: MS, reason: 'trap' } } } }), { env: ACC, fetchImpl: at.fetchImpl, now: NOW });
  assert.equal(push.status, 200);
  assert.ok(at.rows.every((r) => r.fields['Student Portal ID'] === a.id));
  assert.equal((await handleProgress(req('/.netlify/functions/ace-progress?student=S22', { headers }), { env: ACC, fetchImpl: at.fetchImpl, now: NOW })).status, 403);
});

test('coach view: Thomas only; lists accounts, shows one student\'s misses, gives and takes back free access', async () => {
  const at = fakeAirtable(); const kv = memoryKv(); const { a, headers } = await emailSession(kv, 'learner@x.com');
  await handleProgress(req('/.netlify/functions/ace-progress', { method: 'POST', headers, body: { attempts: [{ id: 'oc_9', section: 'ochem', ok: false, at: MS }], repair: { oc_9: { section: 'ochem', topicName: 'SN2', missedAt: MS, reason: 'know' } } } }), { env: ACC, fetchImpl: at.fetchImpl, now: NOW });
  const coachTok = await sessionToken({ sub: 'ALCOACHAAAAA', role: 'master', src: 'email', ent: ['all'] });
  const as = (tok, path = '', body) => handleCoach(req('/.netlify/functions/ace-coach' + path, { method: body ? 'POST' : 'GET', headers: { 'x-ace-session': tok }, body }), { env: ACC, kv, fetchImpl: at.fetchImpl, now: MS });
  assert.equal((await as(headers['x-ace-session'])).status, 403, 'a student cannot see the list');
  assert.equal((await as(await sessionToken({ ent: ['all'] }))).status, 403, 'a portal student cannot either');
  const list = await (await as(coachTok)).json();
  assert.deepEqual(list.accounts.map((x) => x.email), ['learner@x.com']);
  const one = await (await as(coachTok, '?account=' + a.id)).json();
  assert.equal(one.progress.open.length, 1); assert.equal(one.progress.open[0].topic, 'SN2'); assert.equal(one.progress.open[0].reason, 'know');
  await grantPass(kv, await accountById(kv, a.id), { cs: 'cs_test_LIST', days: 90, at: MS });
  assert.equal((await (await as(coachTok)).json()).accounts[0].plan, 'pass', 'a fresh payment shows at once in the coach list');
  await as(coachTok, '', { action: 'comp', email: 'learner@x.com', days: 0, note: 'scholarship' });
  assert.equal((await resolveAccess(await accountById(kv, a.id), ACC, { now: MS, lookups: noLookups })).plan, 'comp');
  await as(coachTok, '', { action: 'uncomp', email: 'learner@x.com' });
  assert.equal((await resolveAccess(await accountById(kv, a.id), ACC, { now: MS, lookups: noLookups })).plan, 'pass', 'taking a comp back leaves a paid pass alone');
});

test('the sign-in email uses the one ACE DAT layout and plain words', () => {
  const m = signInEmail({ link: 'https://acelabs.netlify.app/sign-in/#m=abc', minutes: 15 });
  assert.deepEqual(brandProblems(m.html), []);
  assert.match(m.subject, /Ace Labs/);
  assert.ok(!/[\u{1F300}-\u{1FAFF}☀-➿]/u.test(m.html + m.text), 'no emoji');
});

test('account ids never collide with portal ids and pass the student id rule', async () => {
  const kv = memoryKv(); const ids = new Set();
  for (let i = 0; i < 200; i++) { const a = await findOrCreate(kv, `u${i}@x.com`, MS); assert.match(a.id, /^AL[A-Z2-9]{10}$/); ids.add(a.id); }
  assert.equal(ids.size, 200);
  await saveAccount(kv, { ...(await accountByEmail(kv, 'u1@x.com')), lastPlan: 'pass' });
  assert.equal((await accountByEmail(kv, 'u1@x.com')).lastPlan, 'pass');
});
