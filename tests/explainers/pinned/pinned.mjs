// tests/explainers/pinned/pinned.mjs: the explainers Thomas praised, pinned byte for byte.
//
//   node tests/explainers/pinned/pinned.mjs           compare (exit 1 on any byte change)
//   node tests/explainers/pinned/pinned.mjs --write   re-take the golden files (only with Thomas's yes)
//
// Each pinned explainer is opened in tools/explain/preview.html (student view, its preview
// pick) at 390 x 844 (phone, touch) and 1280 x 800, and its picture, the .vis figure with
// every SVG in it, is compared with the golden file <qid>-<width>.vis.golden in this folder (the figure markup; not
// an .html or .svg name, so the site gates do not read it as a page).
// Element ids are renamed in order of appearance first (scripts/explainers/stamps.mjs
// normalizeVis): the structure drawer makes a random id prefix on every draw.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const require = createRequire(import.meta.url);
const { normalizeVis } = await import(pathToFileURL(path.join(ROOT, 'scripts/explainers/stamps.mjs')).href);

export const PINNED = [
  { qid: 'fm:organic:oc-1o9d4eq', what: 'hydroboration (B004)' },
  { qid: 'fm:qr-a:dis1285', what: 'clinic crates (B005)' }
];
const SIZES = [{ w: 390, h: 844, mobile: true }, { w: 1280, h: 800 }];
export const goldenPath = (qid, w) => path.join(HERE, qid.replace(/:/g, '__').replace(/#/g, '~') + '-' + w + '.vis.golden');

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      const full = path.join(ROOT, p);
      if (!full.startsWith(ROOT + path.sep) || !fs.existsSync(full) || !fs.statSync(full).isFile()) { res.writeHead(404); res.end('not found'); return; }
      res.writeHead(200, { 'content-type': MIME[path.extname(full).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
      fs.createReadStream(full).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

// { qid, w, html } for every pinned explainer at every width
export async function renderPinned() {
  const { chromium } = require(path.join(ROOT, 'node_modules/playwright'));
  const exe = process.env.EXPLAINERS_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const srv = await serve();
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const out = [];
  try {
    for (const { qid } of PINNED) for (const s of SIZES) {
      const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 1, isMobile: !!s.mobile, hasTouch: !!s.mobile });
      const p = await ctx.newPage();
      await p.goto('http://127.0.0.1:' + srv.address().port + '/tools/explain/preview.html?qid=' + encodeURIComponent(qid), { waitUntil: 'networkidle' });
      await p.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 20000 });
      await p.waitForTimeout(300);
      const html = await p.$eval('.vis', (n) => n.outerHTML).catch(() => null);
      out.push({ qid, w: s.w, html: html == null ? null : normalizeVis(html) + '\n' });
      await ctx.close();
    }
  } finally { await browser.close(); srv.close(); }
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const write = process.argv.includes('--write');
  let bad = 0;
  for (const r of await renderPinned()) {
    const g = goldenPath(r.qid, r.w);
    if (r.html == null || !/<svg/.test(r.html)) { console.log('!! ' + r.qid + ' ' + r.w + ': no picture drawn'); bad++; continue; }
    if (write) { fs.writeFileSync(g, r.html); console.log('wrote ' + path.relative(ROOT, g)); continue; }
    const want = fs.existsSync(g) ? fs.readFileSync(g, 'utf8') : null;
    if (want === r.html) console.log('ok ' + r.qid + ' ' + r.w);
    else { console.log('!! ' + r.qid + ' ' + r.w + ': ' + (want == null ? 'no golden file' : 'differs from ' + path.relative(ROOT, g))); bad++; }
  }
  if (bad) process.exitCode = 1;
}
