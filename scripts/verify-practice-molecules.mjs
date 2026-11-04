#!/usr/bin/env node
// verify-practice-molecules.mjs : does every molecule the Sciences + QR practice tests
// (prometric-mock.html, Practice Tests 1 to 3) draw show the molecule it stands for?
//
//   node scripts/verify-practice-molecules.mjs [--json FILE] [--base URL]
//
// Needs Playwright (devDependency) and python3 with RDKit. Not part of npm test.
//
// For every OChem item that draws a structure, the page is run for real (the test is
// started, the item rendered with renderRun()) and each drawing is read back:
//   - SmilesDrawer canvases (q_smiles, opts_smiles): the page's own SmiDrawer is wrapped
//     so the positions and wedges it drew each canvas from are recorded (atom k is atom k
//     of the SMILES); RDKit rebuilds the molecule from those positions and wedges alone
//     and must get the SMILES back, stereo included. The canvas must also hold ink (the
//     picture was painted, not left blank or replaced by the text fallback).
//   - Hand-built figures (q_svg, the curved-arrow items): text labels, bond lines, ring
//     polygons and charge marks are read from the rendered SVG (getBBox) and turned into a
//     graph (label expansion in verify-practice-molecules.py); RDKit compares it with the
//     molecules the stem names (EXPECT below).
// Answer keys and banks are only read.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { startServer, launchChromium } from './lib/site.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const val = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };

// what each hand-built figure should show, from the words of its stem
export const EXPECT = {
  OC_arr001: { smi: '[OH-].CBr', from: 'hydroxide attacking CH3-Br (SN2)' },
  OC_arr002: { smi: 'CCC(C)Br.CC[O-]', from: '2-Bromobutane + KOEt (the ethoxide is drawn as EtO-)' },
  OC_arr003: { smi: 'O=C([O-])[O-]', from: 'the carbonate ion' },
  OC_arr004: { smi: 'CC=C.Br', from: 'Propene + HBr' },
  OC_arr005: { smi: 'CC(C)(C)Cl.CC(C)(C)O', from: 'tert-butyl chloride converts to tert-butanol' },
  OC_arr007: { smi: 'CC(O)C(C)C', from: '3-methyl-2-butanol + HBr (HBr not drawn)' },
  OC_arr008: { smi: 'c1ccccc1.BrBr.Br[Fe](Br)Br', from: 'Benzene + Br2 / FeBr3' },
};
// chiral SMILES for the calibration run (not from the bank): one or two stereocenters, rings, both senses
const CALIBRATE = ['C[C@H](Br)CC', 'C[C@@H](Br)CC', 'N[C@@H](C)C(=O)O', 'OC(=O)[C@@H]1CCCN1', 'C[C@H](O)[C@@H](C)Cl', 'O[C@H]1CCCC[C@@H]1C'];
const LABELS = new Set(['C', 'O', 'N', 'H', 'Cl', 'Br', 'I', 'F', 'CH3', 'H3C', 'CH2', 'CH', 'OH', 'HO', 'NH2', 'SH', 'EtO', 'FeBr3']);

/* ---------- in the page ---------- */
function hook() {
  window.__drawn = [];
  const P = window.SmiDrawer && window.SmiDrawer.prototype;
  if (!P || P.__wrapped) return !!P;
  const orig = P.svgToCanvas;
  P.svgToCanvas = function (svg, canvas) {
    try {
      const g = this.drawer.preprocessor.graph;
      window.__drawn.push({
        canvasId: canvas && canvas.id,
        atoms: g.vertices.map((v) => ({ i: v.id, el: v.value.element, x: v.position.x, y: v.position.y, stereo: !!v.value.isStereoCenter, drawn: v.value.isDrawn !== false })),
        bonds: g.edges.map((e) => ({ a: e.sourceId, b: e.targetId, wedge: e.wedge || '', order: e.bondType === '=' ? 2 : e.bondType === '#' ? 3 : e.bondType === '.' ? 0 : 1 })),
      });
    } catch (e) { window.__drawn.push({ canvasId: canvas && canvas.id, error: String(e) }); }
    return orig.apply(this, arguments);
  };
  P.__wrapped = true;
  return true;
}
function readItem() {
  const ink = (c) => { try { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 0 && (d[i] < 200 || d[i + 1] < 200 || d[i + 2] < 200)) n++; return n; } catch (e) { return -1; } };
  const canvases = [...document.querySelectorAll('#pmRun canvas.pm-mol-canvas')].map((c) => ({ id: c.id, smi: c.getAttribute('data-smiles'), opt: c.getAttribute('data-opt'), mol: c.getAttribute('data-mol'), ink: ink(c), w: c.width, h: c.height }));
  const figs = [...document.querySelectorAll('#pmRun .pm-q .pm-svg svg')].map((svg) => {
    const box = (t) => { const b = t.getBBox(); return { text: t.textContent.trim(), x: b.x + b.width / 2, y: b.y + b.height / 2, x0: b.x, y0: b.y, x1: b.x + b.width, y1: b.y + b.height }; };
    return {
      texts: [...svg.querySelectorAll('text.atom')].map(box),
      charges: [...svg.querySelectorAll('text.chg')].map(box),
      lines: [...svg.querySelectorAll('line')].map((l) => ({ x1: +l.getAttribute('x1'), y1: +l.getAttribute('y1'), x2: +l.getAttribute('x2'), y2: +l.getAttribute('y2'), cls: l.getAttribute('class') || '' })),
      polygons: [...svg.querySelectorAll('polygon')].map((p) => p.getAttribute('points').trim().split(/\s+/).map((xy) => xy.split(',').map(Number))),
      circles: [...svg.querySelectorAll('circle')].map((c) => ({ cx: +c.getAttribute('cx'), cy: +c.getAttribute('cy'), r: +c.getAttribute('r') })),
    };
  });
  return { canvases, figs, drawn: window.__drawn.splice(0) };
}

/* ---------- a hand-built figure as a graph ---------- */
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const boxDist = (p, t) => Math.hypot(Math.max(t.x0 - p[0], 0, p[0] - t.x1), Math.max(t.y0 - p[1], 0, p[1] - t.y1));
const boxGap = (a, b) => Math.hypot(Math.max(a.x0 - b.x1, 0, b.x0 - a.x1), Math.max(a.y0 - b.y1, 0, b.y0 - a.y1));
export function figureGraph(fig) {
  const atoms = []; const notes = [];
  for (const t of fig.texts) { if (LABELS.has(t.text)) atoms.push({ id: atoms.length, label: t.text, x: t.x, y: t.y, box: t, charge: 0 }); else notes.push(t.text); }
  const labels = atoms.slice();
  for (const c of fig.charges) {
    const q = /[⊖−-]/.test(c.text) ? -1 : /[⊕+]/.test(c.text) ? 1 : 0; if (!q) continue;
    let best = null; for (const a of labels) { const d = boxGap(c, a.box); if (d <= 16 && (!best || d < best.d)) best = { a, d }; }
    if (best) best.a.charge += q; else notes.push('charge mark ' + c.text + ' next to no label');
  }
  // ring polygons: their corners are skeletal carbons
  const aromatic = []; const ringBonds = [];
  for (const poly of fig.polygons) {
    const ids = poly.map(([x, y]) => { const a = { id: atoms.length, skeletal: true, x, y }; atoms.push(a); return a.id; });
    for (let k = 0; k < ids.length; k++) ringBonds.push([ids[k], ids[(k + 1) % ids.length]]);
    const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length, cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
    if (fig.circles.some((c) => dist([c.cx, c.cy], [cx, cy]) < 6)) aromatic.push(ids);
  }
  // joints: line ends that two or more lines share, and ring corners
  const ends = fig.lines.flatMap((l) => [[l.x1, l.y1], [l.x2, l.y2]]);
  const joints = atoms.filter((a) => a.skeletal).map((a) => ({ p: [a.x, a.y], id: a.id }));
  for (const e of ends) {
    if (ends.filter((f) => dist(e, f) <= 3).length < 2) continue;
    if (joints.some((j) => dist(j.p, e) <= 3)) continue;
    const a = { id: atoms.length, skeletal: true, x: e[0], y: e[1] }; atoms.push(a); joints.push({ p: e, id: a.id });
  }
  // a line end belongs to what the line points at: look 6 px past the end, along the line
  const endAtom = (p, from) => {
    const len = dist(p, from) || 1, q = [p[0] + 6 * (p[0] - from[0]) / len, p[1] + 6 * (p[1] - from[1]) / len];
    let lab = null; for (const a of labels) { const d = boxDist(q, a.box); if (d <= 10 && (!lab || d < lab.d)) lab = { a, d }; }
    let jt = null; for (const j of joints) { const d = Math.min(dist(q, j.p), dist(p, j.p)); if (d <= 8 && (!jt || d < jt.d)) jt = { j, d }; }
    if (jt && (!lab || jt.d <= lab.d)) return jt.j.id;
    if (lab) return lab.a.id;
    const a = { id: atoms.length, skeletal: true, x: p[0], y: p[1] }; atoms.push(a); joints.push({ p, id: a.id }); return a.id;
  };
  const order = new Map();
  const key = (a, b) => (a < b ? a + '-' + b : b + '-' + a);
  for (const l of fig.lines) {
    const a = endAtom([l.x1, l.y1], [l.x2, l.y2]), b = endAtom([l.x2, l.y2], [l.x1, l.y1]);
    if (a === b) { notes.push('a line with both ends on one atom'); continue; }
    order.set(key(a, b), (order.get(key(a, b)) || 0) + 1);
  }
  for (const [a, b] of ringBonds) if (!order.has(key(a, b))) order.set(key(a, b), 1);
  const bonds = [...order].map(([k, n]) => { const [a, b] = k.split('-').map(Number); return { a, b, order: Math.min(n, 3) }; });
  return { atoms: atoms.map(({ box, ...a }) => a), bonds, aromatic, notes };
}

/* ---------- run ---------- */
async function main() {
  const server = val('--base') ? null : await startServer(ROOT);
  const base = (val('--base') || server.url).replace(/\/$/, '');
  const browser = await launchChromium();
  const rows = []; const pageErrors = []; const calib = [];
  for (let t = 0; t < 3; t++) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    page.on('pageerror', (e) => pageErrors.push(`test ${t + 1}: ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error' || /SmilesDrawer could not draw/.test(m.text())) pageErrors.push(`test ${t + 1}: ${m.text().split('\n')[0]}`); });
    await page.goto(base + '/prometric-mock.html', { waitUntil: 'load' });
    if (!(await page.evaluate(hook))) throw new Error('SmiDrawer did not load');
    const list = await page.evaluate((ti) => {
      STATE.testIdx = ti; STATE.testId = window.DAT_MOCK_TESTS[ti].id;
      actuallyStartTest(window.DAT_MOCK_TESTS[ti]);
      return SECTIONS[0].items.map((it, i) => ({ i, id: it.id, sub: it._sub, q: !!it.q_smiles, o: (it.opts_smiles || []).filter(Boolean).length, svg: !!it.q_svg })).filter((x) => x.q || x.o || x.svg);
    }, t);
    for (const it of list) {
      await page.evaluate((i) => { STATE.itemIdx = i; renderRun(); }, it.i);
      // the canvas is painted from an image of the SVG, after an onload: wait for ink
      let got;
      for (let k = 0; k < 30; k++) { await page.waitForTimeout(100); got = await page.evaluate(readItem); if (got.canvases.every((c) => c.ink > 0 || c.mol === 'fallback')) break; await page.evaluate((d) => { window.__drawn.unshift(...d); }, got.drawn); }
      const byCanvas = new Map(got.drawn.map((d) => [d.canvasId, d]));
      for (const c of got.canvases) {
        const d = byCanvas.get(c.id);
        rows.push({ test: t + 1, item: it.i + 1, id: it.id, part: c.opt == null ? 'stem' : 'choice ' + 'ABCDE'[+c.opt], kind: 'smiles', smi: c.smi, painted: c.ink > 0 && c.mol === 'drawn', ink: c.ink, size: c.w + 'x' + c.h, geom: d && !d.error ? { atoms: d.atoms.filter((a) => a.drawn || a.el !== 'H'), bonds: d.bonds.filter((b) => b.order > 0) } : null, hookError: d && d.error });
      }
      got.figs.forEach((f, k) => rows.push({ test: t + 1, item: it.i + 1, id: it.id, part: 'stem figure' + (got.figs.length > 1 ? ' ' + (k + 1) : ''), kind: 'figure', fig: figureGraph(f), painted: f.lines.length + f.texts.length > 0 }));
    }
    await page.close();
  }
  // calibration: chiral SMILES drawn by the same page code and settings, so the read-back is shown to see
  // stereo (each is also checked mirrored, where the reader must say it is not the SMILES)
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(base + '/prometric-mock.html', { waitUntil: 'load' });
    await page.evaluate(hook);
    await page.evaluate((list) => {
      const d = document.createElement('div'); d.id = 'pmRun'; d.innerHTML = list.map((s) => '<div class="pm-mol"><canvas class="pm-mol-canvas" data-smiles="' + s + '"></canvas></div>').join(''); document.body.appendChild(d);
      renderMoleculeCanvases(d);
    }, CALIBRATE);
    await page.waitForTimeout(600);
    const got = await page.evaluate(readItem);
    const byCanvas = new Map(got.drawn.map((d) => [d.canvasId, d]));
    for (const c of got.canvases) {
      const d = byCanvas.get(c.id);
      const geom = d && !d.error ? { atoms: d.atoms.filter((a) => a.drawn || a.el !== 'H'), bonds: d.bonds.filter((b) => b.order > 0) } : null;
      calib.push({ smi: c.smi, painted: c.ink > 0 && c.mol === 'drawn', geom });
    }
    await page.close();
  }
  await browser.close(); if (server) await server.close();

  // narrow end of each wedge, as SmilesDrawer draws it: the right-hand atom when it is a stereocenter, else the left
  const drawnJob = (smi, geom, mirror) => {
    if (!geom) return { drawn: { smi, atoms: [], bonds: [] } };
    const by = new Map(geom.atoms.map((a) => [a.i, a]));
    const bonds = geom.bonds.filter((b) => by.has(b.a) && by.has(b.b)).map((b) => { const A = by.get(b.a), B = by.get(b.b); let narrow = null; if (b.wedge) { const right = A.x < B.x ? B : A, left = right === A ? B : A; narrow = right.stereo ? right.i : left.i; } return { a: b.a, b: b.b, wedge: b.wedge, narrow }; });
    return { drawn: { smi, atoms: geom.atoms.map((a) => (mirror ? { ...a, x: -a.x } : a)), bonds } };
  };
  const jobs = rows.map((r) => (r.kind === 'figure' ? { figure: { expect: (EXPECT[r.id] || {}).smi || '', atoms: r.fig.atoms, bonds: r.fig.bonds, aromatic: r.fig.aromatic } } : drawnJob(r.smi, r.geom, false)));
  const calibAt = jobs.length;
  for (const c of calib) jobs.push(drawnJob(c.smi, c.geom, false), drawnJob(c.smi, c.geom, true));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'practice-mols-'));
  fs.writeFileSync(path.join(tmp, 'in.json'), JSON.stringify(jobs));
  execFileSync('python3', ['-I', path.join(ROOT, 'scripts', 'verify-practice-molecules.py'), path.join(tmp, 'in.json'), path.join(tmp, 'out.json')], { stdio: 'inherit' });
  const out = JSON.parse(fs.readFileSync(path.join(tmp, 'out.json'), 'utf8'));
  fs.rmSync(tmp, { recursive: true, force: true });

  let bad = 0; const report = [];
  rows.forEach((r, k) => {
    const o = out[k].drawn || out[k].figure || out[k];
    const ok = !!o.ok && r.painted;
    if (!ok) bad++;
    const rec = { test: r.test, item: r.item, id: r.id, part: r.part, kind: r.kind, smiles: r.kind === 'figure' ? (EXPECT[r.id] || {}).smi : r.smi, painted: r.painted, depicts: o.drawnSmiles || null, same: !!o.same, wedges: o.wedges || 0, cipSmiles: o.cipSmiles || {}, cipDrawn: o.cipDrawn || {}, error: o.error || r.hookError || null, notes: r.fig ? r.fig.notes : undefined, ok };
    report.push(rec);
    const stereo = Object.keys(rec.cipSmiles).length ? ' stereo ' + JSON.stringify(rec.cipSmiles) + ' drawn ' + JSON.stringify(rec.cipDrawn) : ' no stereocenter specified, ' + rec.wedges + ' wedge(s) drawn';
    console.log(`${ok ? 'OK  ' : 'FAIL'}  Practice Test ${r.test} Sciences ${String(r.item).padStart(3)}  ${r.id.padEnd(10)} ${r.part.padEnd(12)} ${r.kind.padEnd(7)} ${String(rec.smiles).padEnd(28)} depicts ${rec.depicts}${r.kind === 'smiles' ? stereo + (r.painted ? '' : ' NOT PAINTED (ink ' + r.ink + ')') : ''}${rec.error ? '  ' + rec.error : ''}`);
  });
  const calibration = calib.map((c, k) => {
    const as = out[calibAt + 2 * k].drawn || {}, mir = out[calibAt + 2 * k + 1].drawn || {};
    const ok = c.painted && as.ok === true && mir.same === false;
    if (!ok) bad++;
    console.log(`${ok ? 'OK  ' : 'FAIL'}  calibration ${c.smi.padEnd(24)} drawn: ${as.same ? 'reads as its SMILES' : 'reads as ' + as.drawnSmiles} ${JSON.stringify(as.cipDrawn || {})}; mirrored: ${mir.same === false ? 'reads as ' + mir.drawnSmiles + ' (caught)' : 'NOT caught'}${as.error ? '  ' + as.error : ''}`);
    return { smiles: c.smi, painted: c.painted, readsAsSmiles: !!as.same, cipSmiles: as.cipSmiles || {}, cipDrawn: as.cipDrawn || {}, mirrorCaught: mir.same === false, ok };
  });
  for (const e of pageErrors) console.log('page: ' + e);
  const okRows = report.filter((r) => r.ok).length;
  console.log(`verify-practice-molecules: ${report.length} drawings (${report.filter((r) => r.kind === 'smiles').length} SmilesDrawer, ${report.filter((r) => r.kind === 'figure').length} hand-built figures), ${okRows} depict their molecule, ${report.length - okRows} do not; calibration ${calibration.filter((c) => c.ok).length} of ${calibration.length} read right and caught mirrored`);
  if (val('--json')) fs.writeFileSync(path.resolve(val('--json')), JSON.stringify({ when: new Date().toISOString(), drawings: report, calibration, pageErrors }, null, 1) + '\n');
  return bad || pageErrors.length ? 1 : 0;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main().then((c) => process.exit(c), (e) => { console.error('verify-practice-molecules: ' + (e.stack || e)); process.exit(2); });
