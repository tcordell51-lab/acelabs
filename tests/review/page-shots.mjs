#!/usr/bin/env node
// tests/review/page-shots.mjs : the review page (/approvals/) in a real browser, under the CSP
// netlify.toml sends for /approvals/*, with the real approvals handler (test keys, memory store)
// answering /.netlify/functions/approvals. Not part of npm test (it needs Chromium):
//
//   node tests/review/page-shots.mjs [--out DIR]
//
// Checks, at 390 x 844 and 1280 x 800:
//   - no CSP violation, console error or page exception on the page (inline script would be refused)
//   - the #k= key leaves the address bar and history, sits in sessionStorage only (not localStorage)
//   - the list opens; an orphan pull (its item left the index) is listed with an Unpull
//   - an explainer preview draws its picture
//   - the Retold night preview frame is sandboxed (allow-scripts, no allow-same-origin), still draws
//     the night, and cannot read the review tab's sessionStorage
// Shots: review-list, review-explainer, review-retold (and -orphans) per width.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { startServer, launchChromium, settle } from '../../scripts/lib/site.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const oi = process.argv.indexOf('--out');
const OUT = oi > 0 ? path.resolve(process.argv[oi + 1]) : path.join(os.tmpdir(), 'acelabs-review-shots');
fs.mkdirSync(OUT, { recursive: true });

const toml = fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8');
const block = toml.split(/^\s*\[\[headers\]\]\s*$/m).find((b) => /for\s*=\s*"\/approvals\/\*"/.test(b)) || '';
const CSP = (block.match(/^\s*Content-Security-Policy\s*=\s*"([^"]+)"/m) || [])[1];
if (!CSP) { console.error('page-shots: no Content-Security-Policy for /approvals/* in netlify.toml'); process.exit(1); }

const INDEX = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/approvals/review-index.json'), 'utf8'));
const { createHandler } = await import(pathToFileURL(path.join(ROOT, 'netlify/functions/approvals.mjs')).href);
const KEY = crypto.randomBytes(32).toString('base64url');
const sha = (k) => crypto.createHash('sha256').update(k, 'utf8').digest('hex');
const mem = new Map();
const store = {
  async get(k, o) { if (!mem.has(k)) return null; const v = mem.get(k); return o && o.type === 'json' ? JSON.parse(v) : v; },
  async set(k, v) { mem.set(k, String(v)); },
  async setJSON(k, v) { mem.set(k, JSON.stringify(v)); },
  async delete(k) { mem.delete(k); },
  async list({ prefix = '' } = {}) { return { blobs: [...mem.keys()].filter((k) => k.startsWith(prefix)).sort().map((key) => ({ key })) }; },
};
const ORPHAN = 'explainer:fm:bio:renamed-qid';
await store.setJSON('pull/' + Buffer.from(ORPHAN).toString('base64url'), { id: ORPHAN, by: 'thomas', at: '2026-11-10T15:00:00.000Z' });
const handler = createHandler({ index: INDEX, keys: { keys: [{ role: 'thomas', scope: 'all', sha256: sha(KEY) }] }, store: () => store });

let failures = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) failures++; };
const srv = await startServer(ROOT);
const browser = await launchChromium();
const EXP = INDEX.items.find((x) => x.kind === 'explainer' && x.section === 'ochem');
const NIGHT = INDEX.items.find((x) => x.id === 'retold:bio:1');
const domId = (id) => '#it-' + id.replace(/[^A-Za-z0-9_-]/g, '_');
try {
  for (const [W, H] of [[390, 844], [1280, 800]]) {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    // The sandboxed Retold frame is an opaque origin: its CORS fetches (self-hosted fonts, the pull
    // lists, narration cues and audio) are refused, so the coach preview shows the night's text
    // and pictures in the fallback font, without narration. Those frame-only notes are expected;
    // the review page's own errors are not.
    const frameNote = /from origin 'null' has been blocked by CORS policy|net::ERR_FAILED/;
    let frameNotes = 0;
    page.on('console', (m) => { if (m.type() !== 'error') return; if (frameNote.test(m.text())) frameNotes++; else errors.push(m.text()); });
    await page.addInitScript(() => {
      window.__csp = [];
      document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(e.violatedDirective + ' ' + e.blockedURI));
    });
    // the page as Netlify serves it: the site CSP (from startServer) plus the /approvals/* one
    await page.route(/\/approvals\/(index\.html)?(\?.*)?$/, async (route) => {
      const r = await route.fetch();
      const headers = { ...r.headers(), 'content-security-policy': [r.headers()['content-security-policy'], CSP].filter(Boolean).join(', ') };
      await route.fulfill({ response: r, headers });
    });
    await page.route('**/.netlify/functions/approvals*', async (route) => {
      const q = route.request();
      const req = new Request(q.url(), { method: q.method(), headers: q.headers(), body: q.method() === 'POST' ? q.postData() : undefined });
      const res = await handler(req, { ip: '127.0.0.1' });
      await route.fulfill({ status: res.status, headers: Object.fromEntries(res.headers), body: await res.text() });
    });
    const tag = String(W);
    await page.goto(srv.url + '/approvals/#k=' + KEY);
    await page.waitForSelector('#listBox:not([hidden])', { timeout: 20000 });
    const where = await page.evaluate(() => ({ href: location.href, ss: sessionStorage.getItem('acelabs.review.key'), ls: Object.keys(localStorage).filter((k) => /review/.test(k)) }));
    ok(!where.href.includes('#') && !where.href.includes(KEY), `${tag} the key left the address bar (${where.href.replace(srv.url, '')})`);
    ok(where.ss === KEY && where.ls.length === 0, `${tag} the key sits in sessionStorage only`);
    // replaceState, not a new entry: going back leaves the page (about:blank), never to the keyed URL
    await page.goBack();
    const back = page.url();
    ok(!back.includes(KEY), `${tag} history holds no keyed URL (back goes to ${back})`);
    await page.goForward();
    await page.waitForSelector('#listBox:not([hidden])', { timeout: 20000 });
    ok(!page.url().includes(KEY), `${tag} forward: still no key in the address bar`);
    const orph = await page.evaluate(() => ({ shown: !document.getElementById('orphanBox').hidden, text: document.getElementById('orphans').textContent }));
    ok(orph.shown && orph.text.includes('explainer:fm:bio:renamed-qid') && /Unpull/.test(orph.text), `${tag} the orphan pull is listed with an Unpull`);
    await page.screenshot({ path: path.join(OUT, `review-list-${tag}.png`) });
    await page.locator('#orphanBox').screenshot({ path: path.join(OUT, `review-orphans-${tag}.png`) });

    // an explainer preview: the picture draws under the strict CSP
    await page.fill('#q', EXP.id);
    const ex = page.locator(domId(EXP.id));
    await ex.locator('button', { hasText: 'Show preview' }).click();
    await page.waitForFunction((sel) => { const b = document.querySelector(sel + ' .x-vis'); return b && b.querySelector('svg, canvas, figure'); }, domId(EXP.id), { timeout: 30000 });
    await settle(page, 300);
    const vis = await ex.locator('.x-vis').evaluate((b) => ({ svg: b.querySelectorAll('svg').length, err: !!b.querySelector('.vis-err') }));
    ok(vis.svg > 0 && !vis.err, `${tag} the explainer preview draws its picture (${vis.svg} svg)`);
    await ex.screenshot({ path: path.join(OUT, `review-explainer-${tag}.png`) });

    // the Retold night: sandboxed frame, still draws, cannot reach the key
    await page.fill('#q', NIGHT.id);
    const nl = page.locator(domId(NIGHT.id));
    await nl.locator('button', { hasText: 'Show preview' }).click();
    const fr = nl.locator('iframe');
    await fr.waitFor({ timeout: 10000 });
    ok(await fr.getAttribute('sandbox') === 'allow-scripts', `${tag} the Retold frame is sandboxed: allow-scripts only`);
    const frame = await (await fr.elementHandle()).contentFrame();
    await frame.waitForLoadState('load');
    await frame.waitForTimeout(1500);
    const inside = await frame.evaluate(() => {
      let parentKey = 'readable', own = 'readable';
      try { parentKey = window.parent.sessionStorage.getItem('acelabs.review.key'); } catch (e) { parentKey = 'blocked'; }
      try { sessionStorage.getItem('x'); } catch (e) { own = 'blocked'; }
      return { origin: String(self.origin), parentKey, own, text: (document.body && document.body.innerText || '').trim().length, nights: document.querySelectorAll('li[data-night]').length };
    });
    ok(inside.origin === 'null' && inside.parentKey === 'blocked', `${tag} the frame is an opaque origin and cannot read the key (${inside.origin}, parent ${inside.parentKey})`);
    ok(inside.text > 200, `${tag} the night still draws in the sandboxed frame (${inside.text} characters, ${inside.nights} night rows)`);
    await nl.scrollIntoViewIfNeeded();
    await nl.screenshot({ path: path.join(OUT, `review-retold-${tag}.png`) });

    const csp = await page.evaluate(() => window.__csp);
    ok(csp.length === 0, `${tag} no CSP violation on the review page` + (csp.length ? ': ' + csp.slice(0, 3).join(' | ') : ''));
    ok(errors.length === 0, `${tag} no console errors or page exceptions` + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : '') + (frameNotes ? ' (' + frameNotes + ' CORS notes from the sandboxed frame)' : ''));
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    ok(sw <= W, `${tag} no sideways scroll (${sw})`);
    await ctx.close();
  }
} finally {
  await browser.close();
  await srv.close();
}
console.log('  shots in ' + OUT);
console.log(failures ? `FAIL: ${failures}` : 'PASS');
process.exit(failures ? 1 : 0);
