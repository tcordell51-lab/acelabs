#!/usr/bin/env node
// lite-shots.mjs: the full-length review with explainers (G1-LITE) in a real browser.
//
//   node tests/player/lite-shots.mjs [--out DIR]
//
// Serves the repo with a plain static server (no Netlify redirects, so the stamps
// come from docs/explainers/approvals.json when content/approvals/review-index.json
// is not in the tree), seeds a finished Full-Length Test 1 attempt, and opens the
// review at 390 x 844 and 1280 x 800, light and dark. States shot: a stamped
// explainer in each picture family (Biology tree, OChem mechanism, General
// Chemistry, QR, RC evidence, PAT), a pulled explainer (bank explanation), and
// an open key dispute (Key under review). Fails on a console error, a page
// exception, sideways scroll, or a state that does not show.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const oi = process.argv.indexOf('--out');
const OUT = oi > 0 ? path.resolve(process.argv[oi + 1]) : path.join(os.tmpdir(), 'acelabs-lite-shots');
fs.mkdirSync(OUT, { recursive: true });

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  const rel = decodeURIComponent(u.pathname).replace(/^\/+/, '') || 'index.html';
  const fp = path.join(ROOT, rel);
  if (!fp.startsWith(ROOT + path.sep) || !fs.existsSync(fp) || !fs.statSync(fp).isFile()) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(fp)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(fp).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = 'http://127.0.0.1:' + server.address().port + '/';

// Full-Length Test 1, Natural Sciences positions (bio 1-40, gen chem 41-70, ochem 71-100)
const SHOW = {
  bio: { sec: 'sons', i: 6, qid: 'fm:bio:BIO_d036' },                 // bio.tree
  ochem: { sec: 'sons', i: 73, qid: 'fm:organic:oc-1eq5a2f' },       // override item, stamped explainer
  gc: { sec: 'sons', i: 54, qid: 'fm:generated:gc-ph#14hbxw7' },     // a # qid
  qr: { sec: 'qr', i: 1, qid: 'fm:generated:qr-unit-rate-conversion#ejj15' },
  rc: { sec: 'rc', i: 1 },
  pat: { sec: 'pat', i: 46, qid: 'pat:F20261001:47' }
};
const PULLED = { sec: 'sons', i: 0 };    // Biology question 1, pulled live: the bank explanation shows
const DISPUTED = { sec: 'sons', i: 1 };  // Biology question 2, an open key dispute (injected for the shot)

let failures = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) failures++; };

// the browser: env PW_CHROMIUM, else env CHROME, else /opt/pw-browsers/chromium, else Playwright's own
const EXE = [process.env.PW_CHROMIUM, process.env.CHROME, '/opt/pw-browsers/chromium'].filter(Boolean).find((f) => { try { return fs.statSync(f).isFile(); } catch { return false; } });
const browser = await chromium.launch(EXE ? { executablePath: EXE, args: process.getuid && process.getuid() === 0 ? ['--no-sandbox'] : [] } : {});
try {
  for (const scheme of ['light', 'dark']) {
    for (const [W, H] of [[390, 844], [1280, 800]]) {
      const ctx = await browser.newContext({ viewport: { width: W, height: H }, colorScheme: scheme, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      // a 404 the browser logs is an error too, except REVIEW's review index on a tree without it
      // (the stamps then come from docs/explainers/approvals.json)
      const missing = [];
      page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource: the server responded with a status of 404/.test(m.text())) errors.push(m.text()); });
      page.on('response', (r) => { if (r.status() >= 500) errors.push(r.status() + ' ' + r.url()); if (r.status() === 404) missing.push(r.url().replace(BASE, '/')); });
      // the live pull list: one explainer pulled
      let pulledQid = null;
      await page.route('**/.netlify/functions/approvals*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ pulls: pulledQid ? ['explainer:' + pulledQid.replace(/#/g, '.')] : [] }) }));
      // a structure that falls back to its SMILES text is not drawn: count those
      await page.addInitScript(() => {
        const f = CanvasRenderingContext2D.prototype.fillText;
        window.__smilesText = 0;
        CanvasRenderingContext2D.prototype.fillText = function () { if (this.font === '14px monospace' && this.canvas && this.canvas.hasAttribute('data-smiles')) window.__smilesText++; return f.apply(this, arguments); };
      });
      await page.goto(BASE + 'tools/mock/full.html');
      await page.waitForFunction(() => window.AceExplainerLite && window.__fullMock);
      const ids = await page.evaluate(([P, D]) => {
        const m = window.ACE_FULL_MOCKS.mocks[0], sons = [...m.sections.bio, ...m.sections.gc, ...m.sections.ochem];
        return { pulled: 'fm:' + sons[P.i].id, disputed: 'fm:' + sons[D.i].id };
      }, [PULLED, DISPUTED]);
      pulledQid = ids.pulled;
      // a finished attempt: a pick other than the key on every item, so every item is listed
      await page.evaluate(([D]) => {
        window.AceExplainerLite.configure({ disputes: [D] });
        const m = window.ACE_FULL_MOCKS.mocks[0], sons = [...m.sections.bio, ...m.sections.gc, ...m.sections.ochem];
        const off = (k) => (k + 1) % 5;
        const answers = { sons: sons.map((x) => off(x.correct)), pat: new Array(90).fill(0), rc: new Array(50).fill(0), qr: m.sections.qr.map((x) => off(x.correct)) };
        const att = { id: 'fm-shot', mockId: 'FULL_1', ts: Date.UTC(2026, 10, 9, 15), answers, spent: {}, elapsed: { sons: 5000, pat: 3300, rc: 3200, qr: 2400, brk: 300 }, done: { sons: {}, pat: {}, rc: {}, qr: {} }, record: { testId: 'FULL_1', testName: 'Full-Length Test 1', kind: 'full-length', ts: Date.UTC(2026, 10, 9, 15), totalCorrect: 40, totalQs: 280, sections: {}, subjects: {}, breakSec: 300 } };
        localStorage.setItem('acelabs.fullmock.v1.attempts', JSON.stringify([att]));
      }, [ids.disputed]);
      await page.reload();
      await page.waitForFunction(() => window.AceExplainerLite);
      await page.evaluate(([D]) => window.AceExplainerLite.configure({ disputes: [D] }), [ids.disputed]);
      await page.click('[data-att="fm-shot"]');
      await page.waitForSelector('#report .report', { timeout: 60000 });
      const tag = `${W}-${scheme}`;
      await page.screenshot({ path: path.join(OUT, `report-top-${tag}.png`) });
      for (const sec of ['sons', 'pat', 'rc', 'qr']) {
        await page.evaluate((s) => { const d = document.querySelector('details[data-sec="' + s + '"]'); d.open = true; d.dispatchEvent(new Event('toggle')); }, sec);
      }
      // every listed card decided
      await page.waitForFunction(() => [...document.querySelectorAll('.miss')].every((c) => c.hasAttribute('data-lite') || c.hasAttribute('data-lite-fallback')), null, { timeout: 90000 });
      // which list position holds each item (only misses are listed; every item is a miss here except PAT/RC keyed 0)
      const pos = await page.evaluate(() => {
        const out = {};
        document.querySelectorAll('details[data-sec]').forEach((d) => { [...d.querySelectorAll('.miss')].forEach((c, k) => { out[c.getAttribute('data-lite-qid')] = { sec: d.dataset.sec, k, state: c.getAttribute('data-lite') || c.getAttribute('data-lite-fallback'), h: c.querySelector('.h').textContent }; }); });
        return out;
      });
      const shots = [];
      for (const [name, s] of Object.entries(SHOW)) {
        let p = s.qid && pos[s.qid];
        if (!p) p = Object.values(pos).find((x) => x.sec === s.sec && x.state === 'explainer');
        ok(p && p.state === 'explainer', `${tag} ${name}: explainer shows (${p ? p.h + ', ' + p.state : 'not listed'})`);
        if (!p) continue;
        const loc = page.locator(`details[data-sec="${p.sec}"] .miss`).nth(p.k);
        await loc.scrollIntoViewIfNeeded();
        const f = path.join(OUT, `explainer-${name}-${tag}.png`);
        await loc.screenshot({ path: f });
        shots.push(f);
      }
      // every structure in the review draws (blank before the fix: 0 of 61)
      const mol = await page.evaluate(() => {
        const cs = [...document.querySelectorAll('#report canvas[data-smiles]')];
        const inked = cs.filter((c) => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] && (d[i] < 200 || d[i + 1] < 200 || d[i + 2] < 200)) n++; return n > 40; }).length;
        return { n: cs.length, inked, text: window.__smilesText };
      });
      ok(mol.n > 0 && mol.inked === mol.n && mol.text === 0, `${tag} every review structure draws (${mol.inked} of ${mol.n}, ${mol.text} as text)`);
      for (const [name, sel] of [['stem', 'canvas[data-smiles]'], ['choices', '.a .pm-mol canvas']]) {
        const k = await page.evaluate((q) => [...document.querySelectorAll('details[data-sec="sons"] .miss')].findIndex((c) => c.querySelector(q)), sel);
        if (k < 0) continue;
        const loc = page.locator('details[data-sec="sons"] .miss').nth(k);
        await loc.scrollIntoViewIfNeeded();
        await loc.screenshot({ path: path.join(OUT, `structures-${name}-${tag}.png`) });
      }
      const pp = pos[ids.pulled];
      ok(pp && pp.state === 'pulled', `${tag} pulled item falls back to the bank explanation (${pp && pp.state})`);
      if (pp) await page.locator(`details[data-sec="${pp.sec}"] .miss`).nth(pp.k).screenshot({ path: path.join(OUT, `pulled-${tag}.png`) });
      const dp = pos[ids.disputed];
      ok(dp && dp.state === 'dispute', `${tag} disputed item shows Key under review (${dp && dp.state})`);
      if (dp) {
        const t = await page.locator(`details[data-sec="${dp.sec}"] .miss`).nth(dp.k).locator('.a').textContent();
        ok(/Key under review/.test(t) && !/Correct:/.test(t), `${tag} dispute line replaces the answer mark`);
        const held = await page.locator(`details[data-sec="${dp.sec}"] .miss`).nth(dp.k).evaluate((c) => ({ why: [...c.querySelectorAll('.why')].some((w) => !w.hidden), note: (c.querySelector('.key-held') || {}).textContent || '' }));
        ok(!held.why && /returns once the answer key is confirmed/.test(held.note), `${tag} dispute hides the bank explanation`);
        await page.locator(`details[data-sec="${dp.sec}"] .miss`).nth(dp.k).screenshot({ path: path.join(OUT, `dispute-${tag}.png`) });
      }
      const counts = await page.evaluate(() => ({ card: document.querySelector('#report .sec-card').textContent, note: /left out of these counts/.test(document.getElementById('report').textContent) }));
      ok(/\/ 99/.test(counts.card) && counts.note, `${tag} the disputed item is left out of the raw count (${counts.card})`);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      ok(sw <= W, `${tag} no sideways scroll (${sw})`);
      const st = await page.evaluate(() => { const c = {}; document.querySelectorAll('.miss').forEach((x) => { const k = x.getAttribute('data-lite') || x.getAttribute('data-lite-fallback'); c[k] = (c[k] || 0) + 1; }); return c; });
      console.log('  ' + tag + ' states: ' + JSON.stringify(st));
      const bad404 = missing.filter((u) => u !== '/content/approvals/review-index.json');
      ok(bad404.length === 0, `${tag} no missing files` + (missing.length ? ' (404: ' + [...new Set(missing)].join(', ') + ')' : ''));
      ok(errors.length === 0, `${tag} no console errors or page exceptions` + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}
console.log('  shots in ' + OUT);
console.log(failures ? `FAIL: ${failures}` : 'PASS');
process.exit(failures ? 1 : 0);
