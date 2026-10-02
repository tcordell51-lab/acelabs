/* Headless render test for shared/qr-figures.js.
   Renders 20 pool figures (every chart type, multi-series, negative bars,
   horizontal bars, decimals, labeled lines, pies) at 1280px and 390px in light
   and dark themes and checks, in a real browser:
     - no horizontal page scroll, figure fits its column
     - the SVG was re-laid-out for the actual container width (hydrated)
     - every text label sits inside the drawing
     - no two text labels collide
     - smallest rendered text is at least 11px at 390px
   Also smoke-tests the QR engine's four DAT-format modules at 390px.
   Screenshots go to test-screenshots/qr-figures/ (gitignored).
   Run: npm run test:qr-figures */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(ROOT, 'test-screenshots', 'qr-figures');
fs.mkdirSync(OUT, { recursive: true });
const IDS = ['di-001', 'di-006', 'di-012', 'di-014', 'di-007', 'di-026', 'di-032', 'di-017', 'di-021', 'di-025', 'di-020', 'di-019',
  'di-033', 'di-043', 'di-047', 'di-038', 'di-041', 'di-045', 'di-051', 'di-058'];
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = 'http://localhost:' + server.address().port;

const problems = [];
const browser = await chromium.launch();
try {
  for (const width of [1280, 390]) {
    for (const theme of ['light', 'dark']) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
      const errs = []; page.on('pageerror', (e) => errs.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
      await page.goto(`${base}/tests/qr-formats/figures.html?theme=${theme}&ids=${IDS.join(',')}`);
      await page.waitForFunction((n) => document.querySelectorAll('figure.qrfig[data-hydrated]').length === n, IDS.length, { timeout: 10000 });
      const rep = await page.evaluate(() => {
        const out = { scroll: document.documentElement.scrollWidth, figs: [] };
        document.querySelectorAll('.slot').forEach((slot) => {
          const fig = slot.querySelector('figure'); const svg = fig.querySelector('svg');
          const vb = svg.viewBox.baseVal; const scale = svg.getBoundingClientRect().width / vb.width;
          const cs = getComputedStyle(fig); const inner = fig.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
          const texts = [...svg.querySelectorAll('text')];
          const boxes = texts.map((t) => { const b = t.getBBox(); const m = t.getCTM(); const rot = t.getAttribute('transform'); return { s: t.textContent, x: b.x, y: b.y, w: b.width, h: b.height, rot: !!rot, fs: parseFloat(t.getAttribute('font-size')) }; });
          const outside = boxes.filter((b) => !b.rot && (b.x < -1 || b.y < -1 || b.x + b.w > vb.width + 1 || b.y + b.h > vb.height + 1)).map((b) => b.s);
          const collide = [];
          for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i], b = boxes[j]; if (a.rot || b.rot) continue;
            const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x); const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
            if (ox > 1.5 && oy > 1.5) collide.push(a.s + ' / ' + b.s);
          }
          out.figs.push({ id: slot.dataset.id, figW: fig.getBoundingClientRect().width, svgW: svg.getBoundingClientRect().width, inner, vbW: vb.width, minPx: Math.min(...boxes.map((b) => b.fs * scale)), outside, collide, texts: boxes.length });
        });
        return out;
      });
      const tag = `${width}-${theme}`;
      if (rep.scroll > width) problems.push(`${tag}: page scrolls horizontally (${rep.scroll}px)`);
      rep.figs.forEach((f) => {
        if (f.figW > width) problems.push(`${tag} ${f.id}: figure wider than viewport`);
        if (f.svgW > f.inner + 1 || (Math.abs(f.svgW - Math.min(f.inner, 640)) > 2 && Math.abs(f.svgW - f.vbW) > 2)) problems.push(`${tag} ${f.id}: svg ${f.svgW}px not laid out for its ${f.inner}px column`);
        if (width === 390 && f.minPx < 11) problems.push(`${tag} ${f.id}: smallest text renders at ${f.minPx.toFixed(1)}px`);
        if (f.outside.length) problems.push(`${tag} ${f.id}: text outside drawing: ${f.outside.join(', ')}`);
        if (f.collide.length) problems.push(`${tag} ${f.id}: labels collide: ${f.collide.slice(0, 4).join(' | ')}`);
      });
      errs.forEach((e) => problems.push(`${tag}: console error ${e}`));
      await page.screenshot({ path: path.join(OUT, `figures-${tag}.png`), fullPage: true });
      console.log(`${tag}: ${rep.figs.length} figures checked`);
      await page.close();
    }
  }

  // QR engine modules at phone width
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(`${base}/tools/qr/index.html`);
  await page.waitForTimeout(1200);
  await page.evaluate(() => { try { ONBOARD.skip(); } catch (e) { /* first visit only */ } });
  for (const id of ['qc-compare', 'ds-format', 'data-figs', 'applied-wp']) {
    await page.evaluate((i) => QR_FORMATS_MODULE.startPractice(i), id);
    await page.waitForTimeout(250);
    const w = await page.evaluate((i) => { const s = document.getElementById(i); const r = s.getBoundingClientRect(); return { right: r.right, sw: s.scrollWidth, cw: s.clientWidth }; }, id);
    if (w.sw > w.cw + 1) problems.push(`engine 390 ${id}: section content overflows (${w.sw} > ${w.cw})`);
    await page.locator('#' + id).screenshot({ path: path.join(OUT, `engine-390-${id}.png`) });
  }
  errs.forEach((e) => problems.push('engine: ' + e));
  await page.close();
} finally {
  await browser.close();
  server.close();
}
if (problems.length) { console.log(problems.join('\n')); console.log(`\n${problems.length} problem(s)`); process.exit(1); }
console.log('All figure render checks passed. Screenshots: test-screenshots/qr-figures/');
