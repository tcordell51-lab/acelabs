#!/usr/bin/env node
// scripts/explainers/render-check.mjs: the render gates for every built explainer
// (explainer-standard.md 7.1; production-plan.md section 5, step 6). A port of
// the pilot's shoot.js.
//
//   node scripts/explainers/render-check.mjs              every built explainer
//   node scripts/explainers/render-check.mjs pilot/pilot  one batch (or a qid)
//     --base URL     use a running server for the repo root (default: an
//                    in-process static server on a free port, 127.0.0.1 only)
//     --out DIR      screenshots (default test-screenshots/explainers/, git-ignored)
//     --no-shots     skip the screenshots
//
// For each explainer, tools/explain/preview.html is opened at 390 x 844 (phone,
// touch) and 1280 x 800, student view with its preview pick checked, plus the
// sign-off view at 1280 x 800. Gates, any failure exits 1:
//   - no console errors or warnings, no picture errors, no sideways scroll
//   - every explainer string as rendered, renderer-made text included, passes
//     the copy rules (bank text excepted: choice texts, the key, passage lines)
//   - text in pictures is 12 px or larger (only panels flagged data-small-known
//     are exempt; the build requires a renderer-gap flag for those)
//   - no label on another label, and no line, polyline or ellipse stroke through
//     a label without a halo or a filled backing drawn over the stroke
//   - each picture panel at most 600 px tall on the phone (target 560)
//   - stereo: every structure drawn on the page (question card and explainer)
//     is rebuilt in RDKit from its drawn positions and wedges and must depict
//     its SMILES; every stereocenter card's two readings (the swap rule and the
//     signed volume) must equal RDKit's label for the SMILES and for the drawing
// Writes docs/explainers/render-report.json (with each sidecar's checksum)
// when it runs on every explainer.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { renderedTextIssues } from './copy-rules.mjs';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const NO_SHOTS = args.includes('--no-shots');
const OUTDIR = path.resolve(ROOT, opt('--out') || 'test-screenshots/explainers');
const FILTER = args.filter((a, i) => !a.startsWith('--') && !['--base', '--out'].includes(args[i - 1]));
const SIZES = [{ n: 'phone', w: 390, h: 844, mobile: true }, { n: 'desk', w: 1280, h: 800 }];
const PANEL_MAX = 600;

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const IX = readJson('docs/explainers/index.json');
const GATES = readJson('docs/explainers/gate-report.json');
const qids = Object.keys(IX.items).filter((q) => !FILTER.length || FILTER.includes(q) || FILTER.includes(IX.items[q].batch) || FILTER.includes(IX.items[q].pid));
if (!qids.length) { console.log('render-check: no explainers match ' + FILTER.join(' ')); process.exit(1); }

/* --------------------------------------------------- a static server for the repo */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg' };
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

/* ----------------------------------------------------------- in the page */
function measure(PANEL_MAX_) {
  const W = document.documentElement.clientWidth;
  const over = [];
  document.querySelectorAll('body *').forEach((n) => { const r = n.getBoundingClientRect(); if (r.width && r.right > W + 1 && getComputedStyle(n).position !== 'fixed') over.push(n.tagName + '.' + (n.className && n.className.baseVal != null ? n.className.baseVal : n.className) + ' right=' + Math.round(r.right)); });
  // text in pictures: SVG text by its drawn size, HTML text by its computed size
  const small = [];
  document.querySelectorAll('.vis svg text').forEach((tx) => { const svg = tx.ownerSVGElement; if (!svg || svg.closest('[data-small-known]')) return; const ctm = tx.getScreenCTM(); if (!ctm) return; const s = parseFloat(getComputedStyle(tx).fontSize); const px = (parseFloat(tx.getAttribute('font-size')) || s) * Math.hypot(ctm.a, ctm.b); if (px < 11.5 && tx.textContent.trim()) small.push(tx.textContent.trim().slice(0, 30) + ' ' + px.toFixed(1) + 'px'); });
  document.querySelectorAll('.vis *:not(svg):not(svg *)').forEach((el) => { if (el.closest('[data-small-known]')) return; const own = [...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()); if (!own) return; const px = parseFloat(getComputedStyle(el).fontSize); if (px < 11.5) small.push(el.textContent.trim().slice(0, 30) + ' ' + px.toFixed(1) + 'px (html)'); });
  // rendered text: every string the explainer shows, renderer-made text included, bank text removed
  const exp = document.querySelector('.exp');
  let text = '';
  if (exp) {
    const clone = exp.cloneNode(true);
    clone.querySelectorAll('.trap-choice, .exp-key, .ev-text').forEach((n) => n.remove());
    text = (clone.innerText || clone.textContent || '') + ' ' + [...clone.querySelectorAll('svg text')].map((t) => t.textContent).join(' ');
  }
  // label collisions inside each drawing: text on text, and text crossed by a stroke (lines, polylines, ellipses)
  const clash = [];
  document.querySelectorAll('.vis svg').forEach((svg) => {
    const texts = [...svg.querySelectorAll('text')].filter((t) => t.textContent.trim()).map((t) => ({ t, b: t.getBoundingClientRect(), halo: t.getAttribute('paint-order') === 'stroke' }));
    for (let i = 0; i < texts.length; i++) for (let k = i + 1; k < texts.length; k++) {
      const a = texts[i].b, b = texts[k].b; const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left), iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ix > 2 && iy > 2) clash.push('text on text: "' + texts[i].t.textContent.slice(0, 18) + '" / "' + texts[k].t.textContent.slice(0, 18) + '"');
    }
    const strokes = [...svg.querySelectorAll('line, polyline, ellipse')].filter((n) => !n.closest('defs, marker, mask') && (parseFloat(n.getAttribute('stroke-width')) || 1) >= 1.2 && n.getAttribute('stroke') && n.getAttribute('stroke') !== 'none');
    const pts = (n) => {
      const m = n.getScreenCTM(); if (!m) return [];
      const P = (x, y) => ({ x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f });
      const out = [];
      if (n.tagName === 'line') { const x1 = +n.getAttribute('x1'), y1 = +n.getAttribute('y1'), x2 = +n.getAttribute('x2'), y2 = +n.getAttribute('y2'); for (let s2 = 0; s2 <= 1.0001; s2 += 0.02) out.push(P(x1 + (x2 - x1) * s2, y1 + (y2 - y1) * s2)); }
      if (n.tagName === 'polyline') { const q = n.getAttribute('points').trim().split(/\s+/).map((v) => v.split(',').map(Number)); for (let i2 = 1; i2 < q.length; i2++) for (let s2 = 0; s2 <= 1.0001; s2 += 0.05) out.push(P(q[i2 - 1][0] + (q[i2][0] - q[i2 - 1][0]) * s2, q[i2 - 1][1] + (q[i2][1] - q[i2 - 1][1]) * s2)); }
      if (n.tagName === 'ellipse') { const cx = +n.getAttribute('cx'), cy = +n.getAttribute('cy'), rx = +n.getAttribute('rx'), ry = +n.getAttribute('ry'); for (let a2 = 0; a2 < 6.2832; a2 += 0.03) out.push(P(cx + rx * Math.cos(a2), cy + ry * Math.sin(a2))); }
      return out;
    };
    const fills = [...svg.querySelectorAll('circle, rect, polygon')].filter((n) => { const f = n.getAttribute('fill'); return f && f !== 'none' && f !== 'transparent' && !/rgba\([^)]*,\s*0?\.\d+\)/.test(f) && !n.closest('defs, mask'); });
    const occluded = (stroke, b) => fills.some((f) => { if (!(stroke.compareDocumentPosition(f) & Node.DOCUMENT_POSITION_FOLLOWING)) return false; const r = f.getBoundingClientRect(); return r.left <= b.left + 1 && r.right >= b.right - 1 && r.top <= b.top + 1 && r.bottom >= b.bottom - 1; });
    strokes.forEach((n) => { const ps = pts(n); texts.forEach(({ t, b, halo }) => { if (halo) return; if (occluded(n, b)) return; const hit = ps.some((q) => q.x > b.left + 1.5 && q.x < b.right - 1.5 && q.y > b.top + 2 && q.y < b.bottom - 2); if (hit) clash.push('stroke through "' + t.textContent.slice(0, 22) + '" (' + n.tagName + ')'); }); });
  });
  const vis = document.querySelector('.vis');
  const panels = [...document.querySelectorAll('.vis-panel')].map((n) => Math.round(n.getBoundingClientRect().height));
  // every drawn structure, with the narrow end of each wedge as SmilesDrawer draws it:
  // the right-hand end when that end is a stereocenter, else the left-hand end
  // (an H vertex the drawer keeps but does not draw, as it does at a stereocenter when explicit
  // hydrogens are off, is left out: the student never sees it, and its position is not laid out.
  // Heavy atoms folded into a label such as CONH2 keep their laid-out positions)
  const drawn = (window.AceExplainDrawn || []).map((d) => {
    const atoms = d.atoms.filter((a) => a.drawn !== false || a.el !== 'H');
    const by = new Map(atoms.map((a) => [a.i, a]));
    return { smi: d.smi, role: d.role || 'explainer (mechanism)', from: d.from, stereo: d.stereo || null,
      atoms: atoms.map((a) => ({ i: a.i, el: a.el, x: a.x, y: a.y })),
      bonds: d.bonds.filter((b) => by.has(b.a) && by.has(b.b)).map((b) => { const A = by.get(b.a), B = by.get(b.b); let narrow = null; if (b.wedge && A && B) { const right = A.x < B.x ? B : A, left = right === A ? B : A; narrow = right.stereo ? right.i : left.i; } return { a: b.a, b: b.b, wedge: b.wedge || '', narrow }; }) };
  });
  return {
    scrollW: document.documentElement.scrollWidth, W, over: over.slice(0, 8), small: [...new Set(small)].slice(0, 12),
    visErr: [...document.querySelectorAll('.vis-err')].map((x) => x.textContent), text, clash: [...new Set(clash)].slice(0, 12),
    visH: vis ? Math.round(vis.getBoundingClientRect().height) : 0, panels, expH: exp ? Math.round(exp.getBoundingClientRect().height) : 0,
    tallPanels: panels.filter((x) => x > PANEL_MAX_), fallback: !!document.querySelector('.exp-fallback'), drawn
  };
}

/* ------------------------------------------------------------------ run */
const { chromium } = require(path.join(ROOT, 'node_modules/playwright'));
const exe = process.env.EXPLAINERS_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const srv = opt('--base') ? null : await serve();
const BASE = (opt('--base') || 'http://127.0.0.1:' + srv.address().port + '/').replace(/\/?$/, '/');
const PREVIEW = BASE + 'tools/explain/preview.html';
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });

const jobs = [];
for (const qid of qids) {
  for (const s of SIZES) jobs.push({ qid, kind: 'student', s, url: PREVIEW + '?qid=' + encodeURIComponent(qid), file: IX.items[qid].batch.replace(/\//g, '-') + '/' + qid.replace(/:/g, '__') + '-' + s.n });
  jobs.push({ qid, kind: 'coach', s: SIZES[1], url: PREVIEW + '?qid=' + encodeURIComponent(qid) + '&coach=1', file: IX.items[qid].batch.replace(/\//g, '-') + '/' + qid.replace(/:/g, '__') + '-signoff' });
}
if (!FILTER.length) for (const s of SIZES) jobs.push({ qid: null, kind: 'index', s, url: PREVIEW, file: 'index-' + s.n });

async function runJob(j) {
  const ctx = await browser.newContext({ viewport: { width: j.s.w, height: j.s.h }, deviceScaleFactor: 1, isMobile: !!j.s.mobile, hasTouch: !!j.s.mobile });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
  p.on('requestfailed', (r) => errs.push('request failed: ' + r.url()));
  p.on('response', (r) => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ': ' + r.url()); });
  await p.goto(j.url, { waitUntil: 'networkidle' });
  await p.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 20000 }).catch(() => errs.push('never ready'));
  await p.waitForTimeout(300);
  const lay = await p.evaluate(measure, PANEL_MAX);
  if (!NO_SHOTS) {
    const base = path.join(OUTDIR, j.file);
    fs.mkdirSync(path.dirname(base), { recursive: true });
    await p.screenshot({ path: base + '-view.png' });
    await p.addStyleTag({ content: '.dat-top,.dat-foot,.q-card,.rc-pass{position:static !important}' });   // full page: pin the sticky bars
    const vis = await p.$('.vis'); if (vis) await vis.screenshot({ path: base + '-vis.png' });
    await p.screenshot({ path: base + '.png', fullPage: true });
  }
  await ctx.close();
  return Object.assign(j, { errs, lay });
}
const results = [];
const POOL = 4;
for (let i = 0; i < jobs.length; i += POOL) results.push(...await Promise.all(jobs.slice(i, i + POOL).map(runJob)));
await browser.close();
if (srv) srv.close();

/* ---------------------------------------------------- RDKit: what each drawing shows */
const drawnKey = (d) => JSON.stringify([d.smi, d.atoms, d.bonds]);
const uniq = new Map();
results.forEach((r) => (r.lay.drawn || []).forEach((d) => { if (!uniq.has(drawnKey(d))) uniq.set(drawnKey(d), d); }));
const drawnList = [...uniq.values()];
let drawnOut = [];
if (drawnList.length) {
  const tmp = fs.mkdtempSync(path.join(process.env.EXPLAINERS_TMP || os.tmpdir(), 'explainers-drawn-'));
  fs.writeFileSync(path.join(tmp, 'in.json'), JSON.stringify(drawnList.map((d) => ({ drawn: { smi: d.smi, atoms: d.atoms, bonds: d.bonds } }))));
  execFileSync('python3', ['-I', path.join(HERE, 'rdkit-check.py'), path.join(tmp, 'in.json'), path.join(tmp, 'out.json')], { stdio: ['ignore', 'inherit', 'inherit'] });
  drawnOut = JSON.parse(fs.readFileSync(path.join(tmp, 'out.json'), 'utf8')).map((x) => x.drawn);
  fs.rmSync(tmp, { recursive: true, force: true });
}
const drawnResult = new Map(drawnList.map((d, i) => [drawnKey(d), drawnOut[i]]));
function stereoIssues(d) {
  const r = drawnResult.get(drawnKey(d)); const out = [];
  if (!r || !r.ok) { out.push(d.role + ' ' + d.smi + ': RDKit could not read the drawing (' + (r ? r.error : 'no result') + ')'); return { out, r }; }
  if (!r.same) out.push(d.role + ' ' + d.smi + ': the picture depicts ' + r.drawnSmiles + ', not its SMILES');
  for (const [atom, lab] of Object.entries(r.cipSmiles)) if (r.cipDrawn[atom] !== lab) out.push(d.role + ' ' + d.smi + ': atom ' + atom + ' is ' + lab + ' in the SMILES and ' + (r.cipDrawn[atom] || 'unassigned') + ' as drawn');
  (d.stereo || []).forEach((c) => {
    const want = r.cipSmiles[String(c.atom)];
    if (c.byRule !== want || c.byVolume !== want || r.cipDrawn[String(c.atom)] !== want) out.push('stereo card ' + c.name + ': rule ' + c.byRule + ', volume ' + c.byVolume + ', RDKit ' + want + ' (SMILES) and ' + r.cipDrawn[String(c.atom)] + ' (drawing)');
  });
  return { out, r };
}

/* --------------------------------------------------------------- report */
const report = { schema: 'ace.explainer-render-gates/1', sizes: SIZES.map((s) => s.w + 'x' + s.h), panelMax: PANEL_MAX, summary: null, items: {}, pages: {} };
let bad = 0;
for (const r of results) {
  const L = r.lay, issues = [];
  r.errs.forEach((e) => issues.push('console: ' + e.slice(0, 240)));
  if (L.scrollW > L.W) issues.push('sideways scroll ' + L.scrollW + ' > ' + L.W + ' (' + L.over.join('; ') + ')');
  L.visErr.forEach((e) => issues.push('picture: ' + e));
  if (r.kind === 'student') {
    if (L.fallback) issues.push('the player would fall back to the bank explanation (guard or publish state)');
    L.small.forEach((s) => issues.push('small text: ' + s));
    renderedTextIssues(L.text).forEach((c) => issues.push('copy: ' + c));
    L.clash.forEach((c) => issues.push('clash: ' + c));
    if (r.s.mobile) L.tallPanels.forEach((x) => issues.push('panel ' + x + ' px tall on the phone (max ' + PANEL_MAX + ')'));
  }
  const drawn = [];
  (L.drawn || []).forEach((d) => { const { out, r: rr } = stereoIssues(d); issues.push(...out.map((x) => 'stereo: ' + x)); drawn.push({ role: d.role, smi: d.smi, same: rr ? !!rr.same : false, cip: rr && rr.cipSmiles, cards: (d.stereo || []).map((c) => c.name + ' ' + c.byRule) }); });
  const ok = issues.length === 0; if (!ok) bad++;
  const entry = { ok, expH: L.expH, visH: L.visH, panels: L.panels, issues, drawn: r.s.mobile || r.kind !== 'student' ? undefined : drawn };
  if (r.qid) { const it = report.items[r.qid] || (report.items[r.qid] = { batch: IX.items[r.qid].batch, pid: IX.items[r.qid].pid, checksum: (GATES.items[r.qid] || {}).checksum || null, ok: true }); it[r.kind === 'coach' ? 'signoff' : r.s.n] = entry; it.ok = it.ok && ok; }
  else report.pages[r.file] = entry;
  console.log((ok ? 'ok ' : '!! ') + (r.qid ? IX.items[r.qid].pid + ' ' + r.qid + ' ' + (r.kind === 'coach' ? 'sign-off' : r.s.n) : r.file) + (L.expH ? '  explainer ' + L.expH + 'px, picture ' + L.visH + 'px (panels ' + L.panels.join(', ') + ')' : ''));
  issues.forEach((x) => console.log('   ' + x));
}
const items = Object.values(report.items);
report.summary = { explainers: items.length, pass: items.filter((x) => x.ok).length, pages: results.length, pagesFailing: bad, structuresChecked: drawnList.length, stereoCards: drawnList.reduce((a, d) => a + (d.stereo || []).length, 0) };
if (!FILTER.length) fs.writeFileSync(path.join(ROOT, 'docs/explainers/render-report.json'), JSON.stringify(report, null, 1) + '\n');
console.log('render gates: ' + report.summary.pass + ' of ' + report.summary.explainers + ' explainers pass on ' + results.length + ' page loads; ' + report.summary.structuresChecked + ' drawn structures checked in RDKit, ' + report.summary.stereoCards + ' stereo cards' + (NO_SHOTS ? '' : '; screenshots in ' + path.relative(ROOT, OUTDIR)));
if (bad) process.exitCode = 1;
