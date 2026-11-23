// Email accounts and the pass, end to end, in headless Chrome on phone-sized screens.
//
//   npm run test:e2e:accounts                 (local harness only; nothing touches a live site)
//   npm run test:e2e:accounts -- --shots DIR  also save phone screenshots to DIR
//
// The harness runs the real edge gate (ACE_LABS_SIGN_IN=on, ACE_LABS_ACCOUNTS=on), the real
// session, sign-in link, account, checkout, webhook, progress and coach handlers, an in-memory
// account store and Tool State table, a mailbox that catches the sign-in emails, and a fake
// Stripe API. Stripe Checkout itself is a stub page; the "payment" is a webhook event signed with
// a per-run secret, exactly as Stripe signs it.
//
// Checks
//   1. sign in by email link; a new address gets a free account
//   2. free account: the Gen Chem hub runs on the 10-question sample; a miss lands in Repair
//   3. a locked page sends the free account to the paywall; a locked bank answers 402
//   4. a second, fresh phone signs in by a new link and shows the same miss (server copy)
//   5. checkout -> webhook -> account page: the pass is active and the full bank is served
//   6. a coaching student's email opens everything with no payment
//   7. Thomas's coach page lists the accounts and shows the student's miss
//   8. every account screen at 390 and 360 px: no sideways scroll, text 16px or larger, taps 44px or taller
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const shotsArg = process.argv.indexOf('--shots');
const SHOTS = shotsArg > 0 ? path.resolve(process.argv[shotsArg + 1]) : '';
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

let chromium;
try { ({ chromium } = await import('playwright')); } catch { ({ chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core')); }
const exe = process.env.CHROME_PATH || (fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);

const results = [];
function ok(name, detail) { results.push({ name, detail: detail || '' }); console.log('  pass  ' + name + (detail ? '  (' + detail + ')' : '')); }

const ANSWER = {};
for (const f of fs.readdirSync(path.join(ROOT, 'data', 'free')).filter((x) => x.startsWith('sample-'))) for (const it of JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'free', f), 'utf8')).items) ANSWER[it.id] = it.answer;

/* ------------------------------------------------------------------ harness */

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon', '.txt': 'text/plain' };
function staticResponse(urlPath) {
  const p = decodeURIComponent(urlPath);
  if (p.includes('..') || /^\/(node_modules|\.git|netlify|tests|scripts)(\/|$)/.test(p)) return new Response('', { status: 403 });
  let f = path.join(ROOT, p);
  try {
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    else if (!fs.existsSync(f) && fs.existsSync(f + '.html')) f += '.html';
    return new Response(fs.readFileSync(f), { status: 200, headers: { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' } });
  } catch { return new Response('<!doctype html><title>Not found</title>', { status: 404, headers: { 'Content-Type': 'text/html' } }); }
}
function nodeToRequest(req, base, body) {
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) if (v != null) headers.set(k, Array.isArray(v) ? v.join(', ') : v);
  return new Request(new URL(req.url, base), { method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body });
}
async function sendResponse(res, out) {
  const headers = {}; out.headers.forEach((v, k) => { headers[k] = v; });
  const set = typeof out.headers.getSetCookie === 'function' ? out.headers.getSetCookie() : [];
  if (set.length) headers['set-cookie'] = set;
  res.writeHead(out.status, headers); res.end(Buffer.from(await out.arrayBuffer()));
}
function fakeToolState() {
  const rows = []; let n = 0;
  const fetchImpl = async (url, init = {}) => {
    const u = new URL(url); const method = init.method || 'GET';
    if (method === 'GET') {
      const m = /\{Student Portal ID\}='([^']*)'/.exec(u.searchParams.get('filterByFormula') || '');
      return new Response(JSON.stringify({ records: rows.filter((r) => (!m || r.fields['Student Portal ID'] === m[1]) && String(r.fields['Tool Name'] || '').startsWith('acelabs.')).map((r) => ({ id: r.id, fields: { ...r.fields } })) }), { status: 200 });
    }
    const body = JSON.parse(init.body);
    if (method === 'POST') for (const r of body.records) rows.push({ id: `recE2E${String(n++).padStart(11, '0')}`, fields: { ...r.fields } });
    if (method === 'PATCH') for (const r of body.records) { const cur = rows.find((x) => x.id === r.id); if (cur) Object.assign(cur.fields, r.fields); }
    return new Response('{"records":[]}', { status: 200 });
  };
  return { rows, fetchImpl };
}

const secret = crypto.randomBytes(32).toString('hex');
const whsec = 'whsec_' + crypto.randomBytes(16).toString('hex');
const { memoryKv, accountByEmail } = await import('../../netlify/lib/ace-accounts.mjs');
const { signStripePayload } = await import('../../netlify/lib/ace-stripe.mjs');
const { handle } = await import('../../netlify/edge-functions/ace-gate.js');
const H = {
  'ace-session': (await import('../../netlify/functions/ace-session.mjs')).handleSession,
  'ace-progress': (await import('../../netlify/functions/ace-progress.mjs')).handleProgress,
  'ace-magic-request': (await import('../../netlify/functions/ace-magic-request.mjs')).handleMagicRequest,
  'ace-magic-verify': (await import('../../netlify/functions/ace-magic-verify.mjs')).handleMagicVerify,
  'ace-account': (await import('../../netlify/functions/ace-account.mjs')).handleAccount,
  'ace-checkout': (await import('../../netlify/functions/ace-checkout.mjs')).handleCheckout,
  'ace-stripe-webhook': (await import('../../netlify/functions/ace-stripe-webhook.mjs')).handleWebhook,
  'ace-coach': (await import('../../netlify/functions/ace-coach.mjs')).handleCoach,
};

const kv = memoryKv();
const store = fakeToolState();
const mail = [];
const stripeSessions = {};
const mailer = async (m) => { mail.push(m); return true; };
// coaching.student = Status Active, paused.student = Status Inactive (the Status filter itself is unit tested)
const COACHING = { 'coaching.student@example.com': 'S35', 'paused.student@example.com': 'S36' };
const lookups = { student: async (e) => (COACHING[e] ? { portalId: COACHING[e] } : null), crash: async () => null };
// nothing a coaching student sees may talk about money
const MONEY = /\$|\bpay|price|buy|purchase|checkout|refund|charge|cost|subscription/i;
const stripeFetch = async (url, init = {}) => {
  if (String(url).includes('/v1/prices/')) return new Response(JSON.stringify({ object: 'price', id: 'price_LOCAL', active: true, type: 'one_time', recurring: null, currency: 'usd', unit_amount: 24900 }), { status: 200 });
  if ((init.method || 'GET') === 'POST') {
    const form = new URLSearchParams(init.body); const id = 'cs_test_E2E' + crypto.randomBytes(4).toString('hex');
    stripeSessions[id] = { object: 'checkout.session', id, mode: 'payment', status: 'complete', payment_status: 'paid', client_reference_id: form.get('client_reference_id'), customer_email: form.get('customer_email'),
      metadata: { product: form.get('metadata[product]'), acelabs_account: form.get('metadata[acelabs_account]'), days: form.get('metadata[days]') }, payment_intent: 'pi_' + id, amount_total: 24900, currency: 'usd', livemode: false, created: Math.floor(Date.now() / 1000), success: form.get('success_url') };
    return new Response(JSON.stringify({ id, url: 'https://checkout.stripe.com/c/pay/' + id }), { status: 200 });
  }
  const id = String(url).split('/').pop();
  return stripeSessions[id] ? new Response(JSON.stringify(stripeSessions[id]), { status: 200 }) : new Response('{}', { status: 404 });
};

let base = '';
const env = () => ({ ACE_LABS_SIGN_IN: 'on', ACE_LABS_ACCOUNTS: 'on', ACE_LABS_HANDOFF_SECRET: secret, AIRTABLE_PAT: 'local-only', ACE_LABS_SITE_URL: base, ACE_LABS_COACH_EMAILS: 'coach@example.com',
  STRIPE_SECRET_KEY: 'sk_test_local', ACE_LABS_PASS_PRICE_ID: 'price_LOCAL', STRIPE_WEBHOOK_SECRET: whsec, ACE_LABS_PASS_PRICE_LABEL: '$249', ACE_LABS_PASS_DAYS: '90' });
const server = http.createServer(async (req, res) => {
  const chunks = []; for await (const c of req) chunks.push(c);
  try {
    const request = nodeToRequest(req, base, Buffer.concat(chunks));
    const p = new URL(request.url).pathname;
    const fn = p.startsWith('/.netlify/functions/') ? p.slice('/.netlify/functions/'.length) : '';
    let out;
    if (fn && H[fn]) out = await H[fn](request, { env: env(), kv, mailer, lookups, fetchImpl: fn === 'ace-checkout' ? stripeFetch : store.fetchImpl, jtiStore: null });
    else if (fn) out = new Response('{}', { status: 404 });
    else if (/\.(css|png|gif|webp|avif|svg|ico|woff2?|ttf|otf)$/i.test(p)) out = staticResponse(p);   // the edge excludedPath: photos, audio and video go through the gate
    else {
      const context = { next: async () => staticResponse(p), rewrite: async (to) => staticResponse(new URL(to, base).pathname) };
      out = (await handle(request, context, env())) || staticResponse(p);
    }
    await sendResponse(res, out);
  } catch (e) { res.writeHead(500); res.end(String(e && e.message)); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
base = `http://localhost:${server.address().port}`;

/* ------------------------------------------------------------------ browser helpers */

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
async function phone(width = 390) {
  const context = await browser.newContext({ viewport: { width, height: width === 360 ? 780 : 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await context.route(/^https?:\/\/(?!localhost)/, (route) => {
    const u = route.request().url();
    if (u.startsWith('https://checkout.stripe.com/')) return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><meta name="viewport" content="width=device-width"><title>Stripe test checkout</title><p style="font:18px sans-serif;padding:20px">Stripe test checkout (local stub)</p>' });
    return route.abort();   // fonts and anything else outside the harness
  });
  const page = await context.newPage();
  page.on('dialog', (d) => d.accept());
  return { context, page };
}
async function shot(page, name) { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true }); }

/** No sideways scroll, every visible text 16px+, every visible tap target 44px+. */
async function mobileCheck(page, label, scope) {
  const r = await page.evaluate((scopeSel) => {
    const root = scopeSel ? document.querySelectorAll(scopeSel) : [document.body];
    const vis = (el) => { const s = getComputedStyle(el); const b = el.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0 && !el.closest('[hidden]'); };
    const small = [], tiny = [];
    root.forEach((r0) => {
      const all = [r0, ...r0.querySelectorAll('*')];
      for (const el of all) {
        if (!vis(el)) continue;
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (own && parseFloat(getComputedStyle(el).fontSize) < 16) small.push(el.tagName + ':' + el.textContent.trim().slice(0, 30) + ' ' + getComputedStyle(el).fontSize);
        if (el.matches('a[href], button, input, select, textarea') && el.getBoundingClientRect().height < 44) tiny.push(el.tagName + ':' + (el.textContent || el.id).trim().slice(0, 30) + ' ' + Math.round(el.getBoundingClientRect().height) + 'px');
      }
    });
    return { overflow: document.documentElement.scrollWidth - window.innerWidth, small, tiny, w: window.innerWidth };
  }, scope || null);
  assert.ok(r.overflow <= 1, `${label}: page scrolls sideways by ${r.overflow}px at ${r.w}px`);
  assert.deepEqual(r.small, [], `${label}: text under 16px at ${r.w}px`);
  assert.deepEqual(r.tiny, [], `${label}: tap targets under 44px at ${r.w}px`);
  return r.w;
}
const checked = [];
async function check(page, label, scope) { const w = await mobileCheck(page, label, scope); checked.push(label + ' @' + w); }

/** Sign in on this page by email link; returns the session. */
async function emailSignIn(page, email, next = '/') {
  await page.goto(`${base}/sign-in/?next=${encodeURIComponent(next)}`, { waitUntil: 'load' });
  await page.waitForSelector('#s-email:not([hidden])');
  const before = mail.length;
  await page.fill('#email', email);
  await page.click('#send');
  await page.waitForSelector('#s-sent:not([hidden])');
  assert.equal(mail.length, before + 1, 'one sign-in email sent');
  const link = /href="([^"]+#m=[A-Za-z0-9_-]+)"/.exec(mail[mail.length - 1].html)[1];
  assert.ok(link.startsWith(base + '/sign-in/#m='), 'the link goes to this site with the token in the fragment');
  return { link, verify: async () => {
    await page.goto(link, { waitUntil: 'load' });
    await page.waitForURL((u) => !u.pathname.startsWith('/sign-in'), { timeout: 20000 });
    await page.waitForLoadState('load');
    // Repair and Progress reload once when the server copy arrives: read the session across that
    for (let i = 0; ; i++) {
      try { await page.waitForFunction(() => window.AceSession && window.AceSession.current()); return await page.evaluate(() => window.AceSession.current()); }
      catch (e) { if (i >= 3 || !/context was destroyed|navigation/i.test(String(e && e.message))) throw e; await page.waitForLoadState('load'); }
    }
  } };
}

/* ------------------------------------------------------------------ the run */

const failures = [];
try {
  // 1. sign-in screens at both widths
  for (const w of [390, 360]) {
    const { context, page } = await phone(w);
    await page.goto(`${base}/sign-in/?next=%2Fgc%2F`, { waitUntil: 'load' });
    await page.waitForSelector('#s-email:not([hidden])');
    await check(page, 'sign-in'); await shot(page, `01-sign-in-${w}`);
    await page.fill('#email', `look${w}@example.com`); await page.click('#send');
    await page.waitForSelector('#s-sent:not([hidden])');
    await check(page, 'check your email'); await shot(page, `02-check-email-${w}`);
    await page.goto(`${base}/pass/`, { waitUntil: 'load' }); await page.waitForSelector('#s-pass:not([hidden])');
    await check(page, 'pass, signed out'); await shot(page, `03-pass-signed-out-${w}`);
    await context.close();
  }
  ok('sign-in, check-your-email and signed-out pass screens fit both phone widths');

  // 1b. a free lab, signed out, at 390: its photo plates come through the gate; narration does not
  {
    const { context, page } = await phone(390);
    await page.goto(`${base}/bio/see/`, { waitUntil: 'load' });
    await page.waitForFunction(() => [...document.images].filter((i) => /\/art\/plates\/.+\.jpg/.test(i.src)).length > 0);
    await page.evaluate(() => Promise.all([...document.images].filter((i) => /\/art\/plates\//.test(i.src)).map((i) => (i.loading === 'lazy' && i.scrollIntoView(), i.decode().catch(() => null)))));
    const r = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth - window.innerWidth,
      broken: [...document.images].filter((i) => /\/art\/plates\/.+\.jpg/.test(i.src) && i.complete && i.naturalWidth === 0).map((i) => i.src),
      loaded: [...document.images].filter((i) => /\/art\/plates\/.+\.jpg/.test(i.src) && i.naturalWidth > 0).length }));
    assert.ok(r.overflow <= 1, `/bio/see/ scrolls sideways by ${r.overflow}px at 390px`);
    assert.deepEqual(r.broken, [], 'free plates blocked by the gate');
    assert.ok(r.loaded >= 1, 'no plate loaded');
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot(page, '00-free-lab-bio-see-390');
    const audio = await page.evaluate(async () => (await fetch('/tools/gchem/audio/n1-s1.mp3')).status);
    const photo = await page.evaluate(async () => (await fetch('/gc/guacamole/img/board.jpg')).status);
    assert.equal(audio, 401, 'narration MP3 signed out'); assert.equal(photo, 401, 'locked lab photo signed out');
    await context.close();
    ok('free lab /bio/see/ at 390: no sideways scroll, plates load through the gate; narration MP3 and locked photos answer 401', r.loaded + ' plates');
  }

  // 2. a new student signs in by link and gets a free account
  const A = await phone(390);
  const s1 = await (await emailSignIn(A.page, 'maya@example.com', '/gc/')).verify();
  assert.equal(s1.plan, 'free'); assert.match(s1.sub, /^AL/);
  assert.equal(new URL(A.page.url()).pathname, '/gc/');
  ok('email sign-in link makes a free account and lands on the page asked for', s1.sub);

  // free account on the Gen Chem hub: sample banner, 10-question sample bank
  await A.page.waitForSelector('#ace-sample');
  const bank = await A.page.evaluate(() => fetch('/data/gchem.json', { credentials: 'same-origin' }).then((r) => r.json()));
  assert.equal(bank.sample, true); assert.equal(bank.items.length, 10);
  await check(A.page, 'hub sample banner', '#ace-sample'); await shot(A.page, '04-free-hub-390');
  ok('free account: the Gen Chem hub runs on the 10-question sample, with a banner', bank.items.length + ' of ' + bank.fullCount);

  // a miss on a sample question
  const topic = bank.items[0].topic;
  await A.page.goto(`${base}/gc/?topic=${encodeURIComponent(topic)}`, { waitUntil: 'load' });
  await A.page.waitForSelector('#stage [data-item]', { timeout: 30000 });
  const id = await A.page.getAttribute('#stage [data-item]', 'data-item');
  assert.ok(id in ANSWER, 'the question is from the sample: ' + id);
  const n = await A.page.locator('#stage [role="radio"]').count();
  await A.page.locator('#stage [role="radio"]').nth((ANSWER[id] + 1) % n).click();
  await A.page.click('#stage button[data-act="check"]');
  await A.page.waitForSelector('#stage button[data-act="next"]');
  const misses = await A.page.evaluate(() => window.AceRecord.repairList().open.map((e) => e.id));
  assert.equal(misses.length, 1);
  await A.page.waitForFunction(() => window.AceSession.flush().then(() => true), null, { timeout: 30000 });
  await A.page.waitForFunction(() => window.AceRecord.pending() === 0, null, { timeout: 30000 }).catch(() => null);
  assert.ok(store.rows.some((r) => r.fields['Student Portal ID'] === s1.sub && r.fields['Tool Name'] === 'acelabs.record.0' && JSON.parse(r.fields['State JSON']).repair[misses[0]]), 'the miss is in Tool State under the account id');
  ok('a miss on a sample question lands in Repair and is saved to the account', misses[0]);

  // 3. locked page -> paywall; locked bank -> 402
  await A.page.goto(`${base}/tools/mock/full.html`, { waitUntil: 'load' });
  assert.equal(new URL(A.page.url()).pathname, '/pass/');
  await A.page.waitForSelector('#s-pass:not([hidden])');
  assert.equal(await A.page.textContent('#price'), '$249');
  assert.equal(await A.page.textContent('#terms'), '90 days of full access. One payment, no subscription. It does not renew.');
  await check(A.page, 'paywall'); await shot(A.page, '05-paywall-390');
  const st402 = await A.page.evaluate(() => fetch('/shared/dat-mock-tests.js', { credentials: 'same-origin' }).then((r) => r.status));
  assert.equal(st402, 402);
  ok('free account: a locked page opens the paywall; a locked bank answers 402', 'mock test page, dat-mock-tests.js');

  await A.page.goto(`${base}/account/`, { waitUntil: 'load' }); await A.page.waitForSelector('#s-acct:not([hidden])');
  assert.equal(await A.page.textContent('#a-plan'), 'Free account');
  await check(A.page, 'account, free'); await shot(A.page, '06-account-free-390');

  // 4. a second phone: fresh context, new link, same miss
  const B = await phone(360);
  const s2 = await (await emailSignIn(B.page, 'MAYA@example.com', '/repair/')).verify();
  assert.equal(s2.sub, s1.sub, 'same account from a second device');
  // Repair reloads itself once when the server copy arrives, so retry across that reload
  for (let i = 0; ; i++) {
    try { await B.page.waitForFunction((keys) => { const o = window.AceRecord && window.AceRecord.repairList().open.map((e) => e.id); return o && keys.every((k) => o.includes(k)); }, misses, { timeout: 30000 }); break; }
    catch (e) { if (i >= 3 || !/context was destroyed|navigation/i.test(String(e && e.message))) throw e; await B.page.waitForLoadState('load'); }
  }
  await shot(B.page, '07-repair-second-phone-360');
  await B.context.close();
  ok('a second phone signs in by its own link and shows the same miss in Repair', 'server copy, not this browser');

  // 5. buy the pass: checkout -> Stripe (stub) -> webhook -> back to the account page
  await A.page.goto(`${base}/pass/`, { waitUntil: 'load' }); await A.page.waitForSelector('#buy:not([hidden])');
  await Promise.all([A.page.waitForURL(/checkout\.stripe\.com/), A.page.click('#buy')]);
  const csId = new URL(A.page.url()).pathname.split('/').pop();
  const cs = stripeSessions[csId];
  assert.ok(cs && cs.client_reference_id === s1.sub && cs.metadata.product === 'acelabs-pass');
  const raw = JSON.stringify({ id: 'evt_e2e', type: 'checkout.session.completed', data: { object: cs } });
  const wh = await fetch(`${base}/.netlify/functions/ace-stripe-webhook`, { method: 'POST', headers: { 'stripe-signature': signStripePayload(raw, whsec) }, body: raw });
  assert.equal(wh.status, 200); assert.equal((await wh.json()).granted, true);
  const bad = await fetch(`${base}/.netlify/functions/ace-stripe-webhook`, { method: 'POST', headers: { 'stripe-signature': signStripePayload(raw, 'whsec_forged') }, body: raw });
  assert.equal(bad.status, 400);
  await A.page.goto(cs.success.replace('{CHECKOUT_SESSION_ID}', csId), { waitUntil: 'load' });
  await A.page.waitForSelector('#paid:not([hidden])', { timeout: 20000 });
  assert.equal(await A.page.textContent('#a-plan'), 'Ace Labs pass');
  await check(A.page, 'account, pass active'); await shot(A.page, '08-account-pass-390');
  const full = await A.page.evaluate(() => fetch('/data/gchem.json', { credentials: 'same-origin' }).then((r) => r.json()));
  assert.ok(!full.sample && full.items.length > 10);
  assert.equal(await A.page.evaluate(() => fetch('/shared/dat-mock-tests.js', { credentials: 'same-origin' }).then((r) => r.status)), 200);
  assert.equal((await accountByEmail(kv, 'maya@example.com')).pass.grants.length, 1, 'webhook and return page granted it once');
  ok('checkout, signed webhook and return page: the pass is active and the full banks open', full.items.length + ' Gen Chem items');
  await A.context.close();

  // 6. coaching students (current and paused): everything, no money language, on their portal id
  for (const [email, w, tag] of [['coaching.student@example.com', 390, 'coaching'], ['coaching.student@example.com', 360, 'coaching'], ['paused.student@example.com', 390, 'paused'], ['paused.student@example.com', 360, 'paused']]) {
    const C = await phone(w);
    const s3 = await (await emailSignIn(C.page, email, '/account/')).verify();
    assert.equal(s3.plan, 'coaching'); assert.equal(s3.sub, COACHING[email]);
    await C.page.waitForSelector('#s-acct:not([hidden])');
    assert.equal(await C.page.textContent('#a-plan'), 'Included with your coaching');
    assert.equal(await C.page.isVisible('#get'), false, 'no Get the pass button');
    const acctText = await C.page.evaluate(() => document.body.innerText);
    assert.ok(!MONEY.test(acctText), 'account page, ' + tag + ': ' + (acctText.match(MONEY) || [''])[0]);
    await check(C.page, 'account, ' + tag); await shot(C.page, `09-account-${tag}-${w}`);
    await C.page.goto(`${base}/pass/`, { waitUntil: 'load' }); await C.page.waitForSelector('#s-have:not([hidden])');
    const passText = await C.page.evaluate(() => document.body.innerText);
    assert.ok(!MONEY.test(passText), 'pass page, ' + tag + ': ' + (passText.match(MONEY) || [''])[0]);
    assert.match(passText, /comes with your AceTheDAT coaching/);
    await check(C.page, 'pass page, ' + tag); await shot(C.page, `14-pass-${tag}-${w}`);
    await C.context.close();
  }
  ok('current and paused coaching students get everything free on their portal id, with no money language', 'S35, S36 at 390 and 360');

  // 7. the coach page
  const T = await phone(390);
  await (await emailSignIn(T.page, 'coach@example.com', '/coach/accounts/')).verify();
  await T.page.waitForSelector('#s-list:not([hidden])');
  const rows = await T.page.locator('#list button.row').count();
  assert.ok(rows >= 3);
  await check(T.page, 'coach list'); await shot(T.page, '10-coach-list-390');
  await T.page.locator('#list button.row', { hasText: 'maya@example.com' }).click();
  await T.page.waitForSelector('#s-one:not([hidden])');
  assert.equal(await T.page.locator('#o-open .card').count(), 1);
  assert.equal(await T.page.locator('#o-rows dd').first().textContent(), 'Pass', 'the paid pass shows in the coach view');
  await check(T.page, 'coach student'); await shot(T.page, '11-coach-student-390');
  await T.context.close();
  ok("Thomas's coach page lists the accounts and shows the student's open miss", rows + ' accounts');
  const T2 = await phone(360);
  await (await emailSignIn(T2.page, 'coach@example.com', '/coach/accounts/')).verify();
  await T2.page.waitForSelector('#s-list:not([hidden])');
  await check(T2.page, 'coach list'); await shot(T2.page, '10-coach-list-360');
  await T2.context.close();

  // a student cannot open the coach page
  const D = await phone(360);
  await (await emailSignIn(D.page, 'nosy@example.com', '/')).verify();
  await D.page.goto(`${base}/coach/accounts/`, { waitUntil: 'load' });
  assert.ok(new URL(D.page.url()).pathname.startsWith('/sign-in'));
  assert.equal(await D.page.evaluate(() => fetch('/.netlify/functions/ace-coach', { headers: { 'X-Ace-Session': window.AceSession.current().token } }).then((r) => r.status)), 403);
  await D.page.goto(`${base}/account/`, { waitUntil: 'load' }); await D.page.waitForSelector('#s-acct:not([hidden])');
  await check(D.page, 'account, free'); await shot(D.page, '12-account-free-360');
  await D.page.goto(`${base}/pass/?next=%2Ftools%2Fochem%2F`, { waitUntil: 'load' }); await D.page.waitForSelector('#s-pass:not([hidden])');
  await check(D.page, 'paywall'); await shot(D.page, '13-paywall-360');
  await D.context.close();
  ok('a student cannot open the coach page or its data');

  ok('mobile checks', checked.length + ' screens: ' + [...new Set(checked)].join(', '));
} catch (e) {
  failures.push(e);
  console.error('  FAIL  ' + (e && e.stack || e));
} finally {
  await browser.close();
  server.close();
}
if (SHOTS) fs.writeFileSync(path.join(SHOTS, 'results.json'), JSON.stringify({ passed: results, failed: failures.map((e) => String(e && e.message)) }, null, 2));
if (failures.length) process.exit(1);
console.log('accounts e2e: all checks passed (local harness)');
