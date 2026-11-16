// Saved progress through the portal sign-in, end to end, in headless Chrome.
//
//   1. The portal hands the student to Ace Labs (/labs/go -> /sign-in/#h=<token>).
//   2. The student answers a practice question wrong: a miss lands in Repair.
//   3. A FRESH browser context (no localStorage, no cookie) signs in again through the portal.
//   4. The miss is still there: it came back from the server copy (Tool State), not the browser.
//
// Local (default, runs now, flag off on the live site does not matter):
//   npm run test:e2e:handoff
// Runs the real gate (netlify/edge-functions/ace-gate.js with ACE_LABS_SIGN_IN=on), the real
// ace-session, ace-session-exchange and ace-progress handlers, an in-memory Tool State table,
// and a stand-in portal that mints the handoff token exactly as the portal's
// netlify/functions/_lib/aceLabsHandoff.js does (HMAC-SHA256, typ ace-labs-handoff, 2 minutes).
//
// Live (after the go-live steps, against the real sites):
//   E2E_PORTAL_EMAIL=... E2E_PORTAL_PASSWORD=... npm run test:e2e:handoff -- --live
//   optional: E2E_PORTAL_URL (default https://acethedat-portal.netlify.app)
//             E2E_ACELABS_URL (default https://acelabs.netlify.app)
// Use a test student (S22). The credentials come from the environment only; nothing is
// printed or stored. The live run writes one real miss to that student's Tool State rows.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LIVE = process.argv.includes('--live');

let chromium;
try { ({ chromium } = await import('playwright')); } catch { ({ chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core')); }
const exe = process.env.CHROME_PATH || (fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);

function ok(name, detail) { console.log('  pass  ' + name + (detail ? '  (' + detail + ')' : '')); }

// answers for every bank item, so the script can miss on purpose
const ANSWER = {};
for (const f of fs.readdirSync(path.join(ROOT, 'data')).filter((x) => x.endsWith('.json') && x !== 'topics.json' && x !== 'oc-3d.json')) {
  try { for (const it of JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8')).items || []) ANSWER[it.id] = it.answer; } catch { /* not a bank */ }
}

/* ------------------------------------------------------------------ local harness */

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon', '.txt': 'text/plain' };

function staticResponse(urlPath) {
  let p = decodeURIComponent(urlPath);
  if (p.includes('..') || /^\/(node_modules|\.git|netlify|tests|scripts)(\/|$)/.test(p)) return new Response('', { status: 403 });
  let f = path.join(ROOT, p);
  try {
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    else if (!fs.existsSync(f) && fs.existsSync(f + '.html')) f += '.html';
    return new Response(fs.readFileSync(f), { status: 200, headers: { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' } });
  } catch {
    return new Response('<!doctype html><title>Not found</title>', { status: 404, headers: { 'Content-Type': 'text/html' } });
  }
}

function fakeToolState() {
  const rows = [];
  let n = 0;
  const fetchImpl = async (url, init = {}) => {
    const u = new URL(url); const method = init.method || 'GET';
    if (method === 'GET') {
      const m = /\{Student Portal ID\}='([^']*)'/.exec(u.searchParams.get('filterByFormula') || '');
      const hit = rows.filter((r) => (!m || r.fields['Student Portal ID'] === m[1]) && String(r.fields['Tool Name'] || '').startsWith('acelabs.'));
      return new Response(JSON.stringify({ records: hit.map((r) => ({ id: r.id, fields: { ...r.fields } })) }), { status: 200 });
    }
    const body = JSON.parse(init.body);
    if (method === 'POST') for (const r of body.records) rows.push({ id: `recLOCAL${String(n++).padStart(9, '0')}`, fields: { ...r.fields } });
    if (method === 'PATCH') for (const r of body.records) { const cur = rows.find((x) => x.id === r.id); if (cur) Object.assign(cur.fields, r.fields); }
    return new Response(JSON.stringify({ records: [] }), { status: 200 });
  };
  return { rows, fetchImpl };
}

function nodeToRequest(req, base, body) {
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) if (v != null) headers.set(k, Array.isArray(v) ? v.join(', ') : v);
  return new Request(new URL(req.url, base), { method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body });
}
async function sendResponse(res, out) {
  const headers = {};
  out.headers.forEach((v, k) => { headers[k] = v; });
  const set = typeof out.headers.getSetCookie === 'function' ? out.headers.getSetCookie() : [];
  if (set.length) headers['set-cookie'] = set;
  res.writeHead(out.status, headers);
  res.end(Buffer.from(await out.arrayBuffer()));
}
function listen(handler) {
  const server = http.createServer(async (req, res) => {
    const chunks = []; for await (const c of req) chunks.push(c);
    try { await sendResponse(res, await handler(req, Buffer.concat(chunks))); } catch (e) { res.writeHead(500); res.end(String(e && e.message)); }
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port })));
}

const b64u = (b) => Buffer.from(b).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
/** Mints the handoff exactly as the portal does (netlify/functions/_lib/aceLabsHandoff.js signHandoff). */
function portalHandoffToken({ aud, sub, secret }) {
  const now = Math.floor(Date.now() / 1000);
  const payload = { v: 1, typ: 'ace-labs-handoff', iss: 'acethedat-portal', aud, sub, role: 'student', view: null, jti: crypto.randomUUID(), iat: now, exp: now + 120 };
  const body = b64u(JSON.stringify(payload));
  return `${body}.${b64u(crypto.createHmac('sha256', secret).update(body).digest())}`;
}

async function startLocal() {
  const secret = crypto.randomBytes(32).toString('hex');   // per run, never printed
  const store = fakeToolState();
  const { handle } = await import('../../netlify/edge-functions/ace-gate.js');
  const { handleExchange } = await import('../../netlify/functions/ace-session-exchange.mjs');
  const { handleSession } = await import('../../netlify/functions/ace-session.mjs');
  const { handleProgress } = await import('../../netlify/functions/ace-progress.mjs');

  // Ace Labs on "localhost" so Chrome keeps the Secure session cookie over plain http.
  let labsBase = '';
  let portalBase = '';
  const env = () => ({ ACE_LABS_SIGN_IN: 'on', ACE_LABS_HANDOFF_SECRET: secret, AIRTABLE_PAT: 'local-only', ACE_LABS_PORTAL_ORIGIN: portalBase });
  const labs = await listen(async (req, body) => {
    const request = nodeToRequest(req, labsBase, body);
    const p = new URL(request.url).pathname;
    if (p === '/.netlify/functions/ace-session-exchange') return handleExchange(request, { env: env(), jtiStore: null });
    if (p === '/.netlify/functions/ace-session') return handleSession(request, { env: env() });
    if (p === '/.netlify/functions/ace-progress') return handleProgress(request, { env: env(), fetchImpl: store.fetchImpl });
    if (/\.(css|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|otf|mp3|m4a|wav|ogg|mp4|webm|vtt)$/i.test(p)) return staticResponse(p);
    const context = { next: async () => staticResponse(p), rewrite: async (to) => staticResponse(new URL(to, labsBase).pathname) };
    const gated = await handle(request, context, env());
    return gated || staticResponse(p);
  });
  labsBase = `http://localhost:${labs.port}`;

  // The portal, reduced to its /labs/go route for a signed-in student S22.
  const portal = await listen(async (req) => {
    const u = new URL(req.url, 'http://x');
    if (u.pathname !== '/labs/go') return new Response('portal stub', { status: 404 });
    const next = u.searchParams.get('next') || '/';
    const token = portalHandoffToken({ aud: `localhost:${labs.port}`, sub: 'S22', secret });
    return new Response(null, { status: 302, headers: { Location: `${labsBase}/sign-in/?next=${encodeURIComponent(next)}#h=${token}` } });
  });
  portalBase = `http://127.0.0.1:${portal.port}`;
  return { labsBase, portalBase, store, close: () => { labs.server.close(); portal.server.close(); } };
}

/* ------------------------------------------------------------------ the check */

// a Gen Chem practice set on its largest topic (the same pages the study loop uses)
const GC_SIZES = {};
for (const it of JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'gchem.json'), 'utf8')).items) GC_SIZES[it.topic] = (GC_SIZES[it.topic] || 0) + 1;
const PRACTICE = '/gc/?topic=' + encodeURIComponent(Object.keys(GC_SIZES).sort((a, b) => GC_SIZES[b] - GC_SIZES[a])[0]);
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
let local = null;
let labsBase; let portalBase;
if (LIVE) {
  portalBase = (process.env.E2E_PORTAL_URL || 'https://acethedat-portal.netlify.app').replace(/\/+$/, '');
  labsBase = (process.env.E2E_ACELABS_URL || 'https://acelabs.netlify.app').replace(/\/+$/, '');
  if (!process.env.E2E_PORTAL_EMAIL || !process.env.E2E_PORTAL_PASSWORD) {
    console.error('Live run needs E2E_PORTAL_EMAIL and E2E_PORTAL_PASSWORD (a test student) in the environment.');
    process.exit(2);
  }
} else {
  local = await startLocal();
  ({ labsBase, portalBase } = local);
}

/** One browser context through the portal handoff, ending on `next` signed in. */
async function signedInContext(next) {
  const context = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  const page = await context.newPage();
  page.on('dialog', (d) => d.accept());
  if (LIVE) {
    await page.goto(portalBase + '/login', { waitUntil: 'load' });
    await page.fill('input[type="email"]', process.env.E2E_PORTAL_EMAIL);
    await page.fill('input[type="password"]', process.env.E2E_PORTAL_PASSWORD);
    await Promise.all([page.waitForURL((u) => !/\/login/.test(u.pathname), { timeout: 30000 }), page.click('button[type="submit"]')]);
  }
  await page.goto(`${portalBase}/labs/go?next=${encodeURIComponent(next)}`, { waitUntil: 'load' });
  await page.waitForURL((u) => u.toString().startsWith(labsBase) && !u.pathname.startsWith('/sign-in'), { timeout: 30000 });
  await page.waitForLoadState('load');
  const session = await page.evaluate(() => (window.AceSession && window.AceSession.current()) || null);
  assert.ok(session && session.role === 'student' && session.sub, 'signed in to Ace Labs through the portal');
  assert.equal(new URL(page.url()).searchParams.get('student'), null, 'no student id in the Ace Labs address');
  return { context, page, sub: session.sub };
}

const failures = [];
try {
  // 1 + 2: handoff, then miss one practice question on purpose
  const first = await signedInContext(PRACTICE);
  ok('the portal handoff signs the student in to Ace Labs', 'student ' + first.sub);
  const { page } = first;
  await page.waitForSelector('#stage [data-item]', { timeout: 30000 });
  const before = await page.evaluate(() => window.AceRecord.repairList().open.map((e) => e.id));
  assert.equal(before.length, 0, 'a new student starts with nothing in Repair');
  const id = await page.getAttribute('#stage [data-item]', 'data-item');
  assert.ok(id in ANSWER, 'the served question is in a bank: ' + id);
  const choices = await page.locator('#stage [role="radio"]').count();
  await page.locator('#stage [role="radio"]').nth((ANSWER[id] + 1) % choices).click();
  await page.click('#stage button[data-act="check"]');
  await page.waitForSelector('#stage button[data-act="next"]');
  const missKeys = await page.evaluate(() => window.AceRecord.repairList().open.map((e) => e.id));
  assert.equal(missKeys.length, 1, 'exactly one miss is in Repair in this browser');
  ok('answered a question wrong: the miss is in Repair', id + ' -> ' + missKeys.join(', '));

  // wait for the save to reach the server
  const saved = await page.waitForFunction(() => window.AceSession.flush().then(() => true), null, { timeout: 30000 }).then(() => true, () => false);
  assert.ok(saved, 'the miss was saved to the server');
  if (local) {
    const rec = local.store.rows.find((r) => r.fields['Student Portal ID'] === 'S22' && r.fields['Tool Name'] === 'acelabs.record.0');
    assert.ok(rec, 'a Tool State row acelabs.record.0 exists for S22');
    const state = JSON.parse(rec.fields['State JSON']);
    for (const k of missKeys) assert.ok(state.repair[k], 'the server copy holds the miss ' + k);
    assert.ok(local.store.rows.some((r) => r.fields['Tool Name'] === 'acelabs.attempts.0' && r.fields['State JSON'].includes(id)), 'the answer is in the answer log');
    ok('saved to Tool State under the student id from the session', 'acelabs.record.0 + acelabs.attempts.0');
  }
  await first.context.close();

  // 3 + 4: a brand new browser context, no local copy at all
  const second = await signedInContext('/repair/');
  assert.equal(second.sub, first.sub, 'same student');
  await second.page.waitForFunction((keys) => {
    const open = window.AceRecord && window.AceRecord.repairList().open.map((e) => e.id);
    return open && keys.every((k) => open.includes(k));
  }, missKeys, { timeout: 30000 });
  const shown = await second.page.textContent('#n-open').catch(() => null);
  ok('a fresh browser context shows the same miss after signing in again', 'open in Repair: ' + (shown == null ? 'n/a' : shown.trim()));
  await second.context.close();
} catch (e) {
  failures.push(e);
  console.error('  FAIL  ' + (e && e.message));
} finally {
  await browser.close();
  if (local) local.close();
}
if (failures.length) process.exit(1);
console.log('handoff persistence: all checks passed' + (LIVE ? ' (live)' : ' (local harness)'));
