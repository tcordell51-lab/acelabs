// chem.js: chem.molecule, chem.reaction (SmilesDrawer through a light copy of
// tools/ochem/tree/draw.js), chem.mechanism and chem.energy (mechdraw.js,
// reused), chem.lewis (copied Lewis sandbox layout), chem.trend and
// chem.curve (new small plots on repo data / computed curves).
// Ported from the pilot preview (question-system/preview/renderers/chem.js).
// tools/explain/vendor/ochem/ holds build-made copies of tools/ochem/tree/draw.js
// (light theme, bond wedges and stereocenters reported) and mechdraw.js;
// scripts/explainers/build.mjs refreshes them, never edit them by hand.
import { register, C, t, r1, svgOpen, width, badge, arrowDefs, uid, h, esc, DRAWN } from './core.js';
import { drawSmilesGeom, drawSmiles } from '../vendor/ochem/draw.js';
import { drawFigure, drawRcd, injectMdCss } from '../vendor/ochem/mechdraw.js';

const SVGNS = 'http://www.w3.org/2000/svg';
function sv(tag, attrs) { const n = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); return n; }

// Draw a SMILES with atom positions; returns {node, atoms, vb}. Scale is set so
// 1 viewBox unit is about 1.6 px, which keeps 8-unit labels near 13 px.
export function structure(target, smi, o = {}) {
  const g = drawSmilesGeom(target, smi, { bondLength: o.bondLength || 24, label: o.label || 'structure', explicitH: o.explicitH });
  // fit the box to the atoms the drawer actually placed (its own viewBox can be
  // the whole 400 x 300 canvas, which shrinks some molecules to a speck)
  let vb = g.vb;
  if (g.atoms.length) {
    const xs = g.atoms.map((a) => a.x), ys = g.atoms.map((a) => a.y), pad = o.pad || 16;
    vb = [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + 2 * pad, Math.max(...ys) - Math.min(...ys) + 2 * pad];
  }
  g.node.setAttribute('viewBox', vb.map((v) => v.toFixed(1)).join(' '));
  g.vb = vb;
  const scale = o.scale || 1.6;
  g.node.style.width = Math.round(vb[2] * scale) + 'px';
  g.node.style.maxWidth = '100%'; g.node.style.height = 'auto'; g.node.style.display = 'block';
  g.node.setAttribute('aria-hidden', 'true');
  // the drawer recorded this drawing in DRAWN; name what it is for the render gate
  const rec = DRAWN[DRAWN.length - 1];
  if (rec && rec.smi === smi && !rec.role) { rec.role = o.role || 'explainer'; g.record = rec; }
  asciiLabels(g.node);
  return g;
}
// SmilesDrawer writes hydrogen counts and charges with Unicode sub- and
// superscripts (NH2, NH3+). Explainer text stays plain ASCII (house rule, and
// the render gate checks every string), so each such glyph becomes its ASCII
// character in a shifted, smaller tspan: the same look, ASCII underneath.
const SUBS = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };
const SUPS = { '⁺': '+', '⁻': '-', '⁰': '0', '¹': '1', '²': '2', '³': '3' };
function asciiLabels(node) {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  const hits = [];
  while (walker.nextNode()) if (/[⁰-₟²³¹]/.test(walker.currentNode.nodeValue)) hits.push(walker.currentNode);
  hits.forEach((tn) => {
    const frag = document.createDocumentFragment();
    let buf = '';
    const flush = () => { if (buf) { frag.append(document.createTextNode(buf)); buf = ''; } };
    for (const ch of tn.nodeValue) {
      const sub = SUBS[ch], sup = SUPS[ch];
      if (sub == null && sup == null) { buf += ch; continue; }
      flush();
      const ts = document.createElementNS(SVGNS, 'tspan');
      ts.setAttribute('baseline-shift', sub != null ? 'sub' : 'super'); ts.setAttribute('font-size', '75%');
      ts.textContent = sub != null ? sub : sup; frag.append(ts);
    }
    flush();
    tn.parentNode.replaceChild(frag, tn);
  });
}
// Atom i is the i-th heavy atom written in the SMILES (RDKit numbering when the
// SMILES has no explicit [H]). The drawer adds H vertices of its own, so marks
// index the heavy atoms only. A label goes into the widest gap between bonds;
// when that spot would cover an atom label or an earlier mark, or cross bonds,
// the nearest clear direction is used instead (a spec's labelDir always wins).
function markAtom(g, i, text, key, dirDeg) {
  const heavy = g.atoms.filter((a) => a.el !== 'H');
  const a = heavy[i]; if (!a) return;
  const byId = new Map(g.atoms.map((x) => [x.i, x]));
  const ang = (a.nb || []).map((id) => byId.get(id)).filter(Boolean).map((n) => Math.atan2(n.y - a.y, n.x - a.x)).sort((p, q) => p - q);
  let dir = -Math.PI / 2;
  if (ang.length === 1) dir = ang[0] + Math.PI;
  else if (ang.length > 1) { let best = -1; for (let k = 0; k < ang.length; k++) { const p = ang[k], q = k + 1 < ang.length ? ang[k + 1] : ang[0] + 2 * Math.PI; if (q - p > best) { best = q - p; dir = p + (q - p) / 2; } } }
  const size = g.markFont ? g.markFont * (key ? 1.02 : 1) : (key ? 9.6 : 9.4);
  const place = (th) => {
    const d = 13 + size * 0.85, lx = a.x + Math.cos(th) * d, ly = a.y + Math.sin(th) * d + size * 0.37;
    const anchor = Math.cos(th) > 0.35 ? 'start' : Math.cos(th) < -0.35 ? 'end' : 'middle';
    const w = String(text).length * size * (key ? 0.6 : 0.56), x0 = anchor === 'start' ? lx : anchor === 'end' ? lx - w : lx - w / 2;
    return { th, lx, ly, anchor, box: { x0, x1: x0 + w, y0: ly - size * 0.8, y1: ly + size * 0.22 } };
  };
  let pick = place(dirDeg != null ? dirDeg * Math.PI / 180 : dir);
  if (dirDeg == null) {
    const obstacles = textBoxes(g.node);
    const segs = (g.bonds || []).map((b) => [byId.get(b.a), byId.get(b.b)]).filter(([p, q]) => p && q && p.el !== 'H' && q.el !== 'H');
    const cost = (c) => {
      let s = 0;
      obstacles.forEach((o) => { const ix = Math.min(c.box.x1, o.x1) - Math.max(c.box.x0, o.x0), iy = Math.min(c.box.y1, o.y1) - Math.max(c.box.y0, o.y0); if (ix > 0 && iy > 0) s += 40 + ix * iy; });
      segs.forEach(([p, q]) => { for (let t2 = 0.08; t2 < 0.93; t2 += 0.07) { const x = p.x + (q.x - p.x) * t2, y = p.y + (q.y - p.y) * t2; if (x > c.box.x0 + 1 && x < c.box.x1 - 1 && y > c.box.y0 + 1 && y < c.box.y1 - 1) { s += 6; break; } } });
      const da = Math.abs(((c.th - dir) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI);
      return s + da * 3;
    };
    if (cost(pick) > 0.01) for (let k = 0; k < 24; k++) { const c = place(k * Math.PI / 12); if (cost(c) < cost(pick)) pick = c; }
  }
  g.node.append(sv('circle', { cx: a.x, cy: a.y, r: 7.5, fill: 'none', stroke: key ? C.key : C.mute, 'stroke-width': key ? 2.2 : 1.2, 'stroke-dasharray': key ? '' : '2.5 2' }));
  const tx = sv('text', { class: 'mk', x: pick.lx, y: pick.ly, 'text-anchor': pick.anchor, 'font-size': size, 'font-family': 'Arial, Helvetica, sans-serif', 'font-weight': key ? 700 : 400, fill: key ? C.key : C.ink2, 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 3 });
  tx.textContent = text; g.node.append(tx);
}
// Every text box already in a drawing (atom labels, earlier marks), in the
// drawing's own units.
function textBoxes(node) {
  const out = [];
  let inv; try { inv = node.getScreenCTM().inverse(); } catch (e) { return out; }
  node.querySelectorAll('text').forEach((t) => {
    try {
      const b = t.getBBox(); if (!b.width) return;
      const m = inv.multiply(t.getScreenCTM());
      const pts = [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]].map(([x, y]) => ({ x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f }));
      out.push({ x0: Math.min(...pts.map((p) => p.x)), x1: Math.max(...pts.map((p) => p.x)), y0: Math.min(...pts.map((p) => p.y)), y1: Math.max(...pts.map((p) => p.y)) });
    } catch (e) { /* not laid out */ }
  });
  return out;
}
// Mark labels must show at 12 px or more. A wide molecule is shrunk to fit its
// box, so the label size is chosen from the width it will be shown at, and
// checked again after the box is fitted to the labels.
function markFontFor(g, scale, avail) {
  const vbW = g.vb[2] + 70, px = Math.min(scale, (avail || 1e9) / vbW);
  return Math.max(9.4, 12.6 / px);
}
function liftMarks(g, scale, avail) {
  for (let k = 0; k < 3; k++) {
    const vbW = +(g.node.getAttribute('viewBox') || '0 0 1 1').split(/\s+/)[2] || 1;
    const px = Math.min(vbW * scale, avail || 1e9) / vbW;
    let changed = false;
    g.node.querySelectorAll('text.mk').forEach((tx) => { const f = +tx.getAttribute('font-size'); if (f * px < 12.3) { tx.setAttribute('font-size', (12.6 / px).toFixed(2)); changed = true; } });
    if (!changed) return;
    refit(g, scale);
  }
}

// After marks are added, fit the box to everything drawn (labels included).
function refit(g, scale) {
  try {
    const b = g.node.getBBox(), p = 6;
    g.node.setAttribute('viewBox', [b.x - p, b.y - p, b.width + 2 * p, b.height + 2 * p].map((v) => v.toFixed(1)).join(' '));
    g.node.style.width = Math.round((b.width + 2 * p) * scale) + 'px';
  } catch (e) { /* not in the DOM yet: keep the atom box */ }
}

/* -------- question helper: structures in stems and choices -------- */
// The question card draws a structure the way the served page does: the
// SmilesDrawer settings of tools/mock/full.js (explicit hydrogens off since
// commit 5c5ec38), so the preview shows the picture a student sees on the test.
const SERVED_DRAWER = { width: 300, height: 140, padding: 6, bondThickness: 1.2, bondLength: 18, shortBondLength: 0.85, compactDrawing: true, explicitHydrogens: false, fontSizeLarge: 11, fontSizeSmall: 8,
  themes: { light: { C: '#1a1d20', O: '#cf3b3b', N: '#3a78c4', CL: '#2e8a3e', BR: '#8a4a2a', F: '#3aa83a', I: '#7a3a8a', S: '#a08a1a', P: '#c06a1a', H: '#1a1d20', BACKGROUND: '#fff' } } };
let _served = null;
export function drawChoiceStructure(target, smi, role = 'question') {
  const SD = window.SmilesDrawer;
  if (!SD) throw new Error('SmilesDrawer not loaded');
  if (!_served) _served = new SD.SvgDrawer(SERVED_DRAWER);
  const node = document.createElementNS(SVGNS, 'svg');
  node.setAttribute('aria-label', 'structure');
  node.classList.add('mol', 'mol-served');
  target.append(node);
  let rec = null;
  SD.parse(smi, (tree) => {
    _served.draw(tree, node, 'light');
    const g = _served.preprocessor.graph;
    rec = { smi, role, from: 'served drawer',
      atoms: g.vertices.map((v) => ({ i: v.id, x: v.position.x, y: v.position.y, el: v.value.element, stereo: !!v.value.isStereoCenter, drawn: v.value.isDrawn !== false })),
      bonds: g.edges.map((e) => ({ a: e.sourceId, b: e.targetId, wedge: e.wedge || '', order: e.bondType === '=' ? 2 : e.bondType === '#' ? 3 : e.bondType === '.' ? 0 : 1 })).filter((e) => e.order > 0) };
    DRAWN.push(rec);
  }, (err) => { throw new Error('SMILES did not parse: ' + smi + ' ' + err); });
  // fit the box to what was drawn, at a fixed scale so all choices match. A
  // choice is often drawn before its button joins the page, and a detached SVG
  // measures as empty, so the fit waits for the drawing to be laid out.
  const fit = () => { try { const b = node.getBBox(), p = 6; if (!b.width) return false; node.setAttribute('viewBox', [b.x - p, b.y - p, b.width + 2 * p, b.height + 2 * p].map((v) => v.toFixed(1)).join(' ')); node.style.width = Math.round((b.width + 2 * p) * 1.3) + 'px'; return true; } catch (e) { return false; } };
  if (!fit() && typeof requestAnimationFrame === 'function') { let tries = 0; const again = () => { if (!fit() && ++tries < 120) requestAnimationFrame(again); }; requestAnimationFrame(again); }
  node.removeAttribute('width'); node.removeAttribute('height');
  node.style.maxWidth = '100%'; node.style.height = 'auto'; node.style.display = 'block'; node.style.margin = '0 auto';
  return { node, record: rec };
}

/* ---------------- chem.reaction ---------------- */
register('chem.reaction', (s, box) => {
  const row = h('div', { class: 'rxn' + (width(box) < 520 ? ' rxn-col' : '') });
  box.append(row);
  const avail = box.clientWidth || width(box);
  // explicitH: false draws a structure the way the question card does (no H at a stereocenter)
  const molCell = (m) => { const c = h('div', { class: 'rxn-mol' }); row.append(c); const g = structure(c, m.smi, { label: m.label, bondLength: 26, scale: 1.3, pad: 34, explicitH: m.explicitH }); g.markFont = markFontFor(g, 1.3, avail); (m.marks || []).forEach((k) => markAtom(g, k.atom, k.text, k.key, k.labelDir)); refit(g, 1.3); liftMarks(g, 1.3, avail); c.append(h('div', { class: 'rxn-label', text: m.label })); };
  s.reactants.forEach(molCell);
  row.append(h('div', { class: 'rxn-arrow' }, h('span', { text: s.reagent }), h('i')));
  s.products.forEach(molCell);
  if (s.ladder) box.append(ladderEl(s.ladder));
  if (s.note) box.append(h('p', { class: 'vis-note', text: s.note }));
});
// A ranked list under a structure: the key's row outlined and worded. heading is
// the spec's own words (a pKa ladder, an SN2 ladder); without it, title plus
// "most to least stable", as the pilot's radical ladder reads.
function ladderEl(l) {
  const lad = h('div', { class: 'ladder' }, h('div', { class: 'ladder-t', text: l.heading || (l.title + ', most to least stable') }));
  l.order.forEach((x, i) => lad.append(h('div', { class: 'ladder-r' + (i === l.key ? ' is-key' : '') }, h('b', { text: String(i + 1) }), h('span', { text: x }), i === l.key ? h('em', { text: l.mark || 'here' }) : null)));
  return lad;
}
// A dashed mirror-plane line through two atoms of a drawn molecule (the build
// draws it only on a molecule RDKit calls meso), run past the atoms on both
// ends, with its name in a haloed label.
function mirrorLine(g, pair, label) {
  const heavy = g.atoms.filter((a) => a.el !== 'H');
  const p = heavy[pair[0]], q = heavy[pair[1]]; if (!p || !q) return;
  const dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, ext = 20;
  const x1 = p.x - ux * ext, y1 = p.y - uy * ext, x2 = q.x + ux * ext, y2 = q.y + uy * ext;
  g.node.append(sv('line', { x1, y1, x2, y2, stroke: C.key, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }));
  const tx = sv('text', { class: 'mk', x: x2 + ux * 4, y: y2 + uy * 4 + 3.5, 'text-anchor': ux > 0.35 ? 'start' : ux < -0.35 ? 'end' : 'middle', 'font-size': g.markFont || 9.6, 'font-family': 'Arial, Helvetica, sans-serif', 'font-weight': 700, fill: C.key, 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 3 });
  tx.textContent = label || 'mirror plane'; g.node.append(tx);
}

/* ---------------- stereo, derived from the drawing ---------------- */
// For one stereocenter of a drawn molecule, read the picture the way a student
// does: where each ranked group sits on the page, which bonds are wedges or
// dashes, how H is drawn, which way 1 -> 2 -> 3 turns, and whether to flip.
// Two independent answers: the student rule (trace, then flip when the lowest
// group leans toward you) and the signed volume of the drawn tetrahedron. The
// card text is built only from these, so it can never claim what the picture
// does not show; a mismatch with the spec, or between the two, is an error.
export function deriveStereo(g, center) {
  const heavy = g.atoms.filter((a) => a.el !== 'H');
  const c = heavy[center.atom]; if (!c) throw new Error('stereocenter atom ' + center.atom + ' not drawn');
  const byId = new Map(g.atoms.map((a) => [a.i, a]));
  const nbs = (c.nb || []).map((id) => byId.get(id)).filter(Boolean);
  const bondTo = (n) => g.bonds.find((b) => (b.a === c.i && b.b === n.i) || (b.b === c.i && b.a === n.i));
  const depthOf = (n) => { const b = bondTo(n); const w = b && b.wedge; return w === 'up' ? 1 : w === 'down' ? -1 : 0; };
  const used = new Set();
  const R = center.rank.map((r) => { const n = r.h ? nbs.find((x) => x.el === 'H' && !used.has(x.i)) : nbs.find((x) => x.i === (heavy[r.atom] || {}).i); if (!n) throw new Error('ranked group not bonded to ' + center.name + ': ' + r.name); used.add(n.i); return { n, name: r.name, d: depthOf(n) }; });
  // 1. signed volume (y up, z toward the viewer)
  const L = 24, v = R.map((x) => [x.n.x - c.x, -(x.n.y - c.y), x.d * L]);
  const sub = (p, q) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
  const a1 = sub(v[0], v[3]), a2 = sub(v[1], v[3]), a3 = sub(v[2], v[3]);
  const det = a1[0] * (a2[1] * a3[2] - a2[2] * a3[1]) - a1[1] * (a2[0] * a3[2] - a2[2] * a3[0]) + a1[2] * (a2[0] * a3[1] - a2[1] * a3[0]);
  const byVolume = Math.abs(det) < 1e-6 ? null : det < 0 ? 'R' : 'S';
  // 2. the student method, read off the picture: get H onto the wedge or dash
  // (swap it with the group there if it lies flat), trace 1 -> 2 -> 3, flip if
  // H points at you, and flip once more for each swap. Valid for any drawing.
  const m2 = (t) => ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const turn = (pts) => { const ang = pts.map((p) => Math.atan2(p.y - c.y, p.x - c.x)); return m2(ang[1] - ang[0]) < m2(ang[2] - ang[0]) ? 'cw' : 'ccw'; };   // screen angles grow clockwise
  const low = R[3], h = low.d > 0 ? 'front' : low.d < 0 ? 'back' : 'plane';
  const traceAsDrawn = turn(R.slice(0, 3).map((x) => x.n));
  let swapWith = null, hAfter = h, pos = R.slice(0, 3).map((x) => ({ x: x.n.x, y: x.n.y }));
  if (h === 'plane') {
    const k = R.slice(0, 3).findIndex((x) => x.d < 0) >= 0 ? R.slice(0, 3).findIndex((x) => x.d < 0) : R.slice(0, 3).findIndex((x) => x.d > 0);
    if (k >= 0) { swapWith = { name: R[k].name, bond: R[k].d < 0 ? 'dash' : 'wedge' }; hAfter = R[k].d < 0 ? 'back' : 'front'; pos[k] = { x: low.n.x, y: low.n.y }; }
    else hAfter = 'unclear';
  }
  const trace = turn(pos);
  const asTraced = trace === 'cw' ? 'R' : 'S';
  const flips = (hAfter === 'front' ? 1 : 0) + (swapWith ? 1 : 0);
  const byRule = hAfter === 'unclear' ? null : flips % 2 ? (asTraced === 'R' ? 'S' : 'R') : asTraced;
  return { name: center.name, ranks: R.map((x) => ({ name: x.name, drawn: x.d > 0 ? 'wedge' : x.d < 0 ? 'dash' : 'flat' })), h, swapWith, hAfter, traceAsDrawn, trace, asTraced, flips, byRule, byVolume };
}

function stereoCard(d) {
  const card = h('div', { class: 'cip-card' }, h('div', { class: 'cip-h' }, h('b', { text: d.name }), h('span', { class: 'cip-r', text: d.byRule || '?' })));
  const ol = h('ol');
  d.ranks.forEach((r, i) => ol.append(h('li', {}, h('span', { text: r.name }), r.drawn !== 'flat' ? h('em', { text: 'on the ' + r.drawn }) : i === 3 ? h('em', { text: 'flat' }) : null)));
  const lowName = d.ranks[3].name, turnWord = d.trace === 'cw' ? 'clockwise' : 'counterclockwise';
  const lines = [];
  if (d.h === 'back') lines.push(lowName + ' is on the dash, pointing away. Read the turn as it is.');
  else if (d.h === 'front') lines.push(lowName + ' is on the wedge, pointing at you. Read the turn, then flip it.');
  else if (d.swapWith) lines.push(lowName + ' lies flat. Swap it with ' + d.swapWith.name + ' on the ' + d.swapWith.bond + ': ' + lowName + ' now points ' + (d.hAfter === 'back' ? 'away' : 'at you') + '.');
  else lines.push('No wedge or dash at this center. Redraw it before reading.');
  let tail = '1 to 2 to 3 turns ' + turnWord + ': ' + d.asTraced + '.';
  if (d.hAfter === 'front') tail += ' ' + lowName + ' toward you: flip.';
  if (d.swapWith) tail += ' One swap: flip.';
  if (d.flips) tail += ' Result: ' + d.byRule + '.';
  lines.push(tail);
  card.append(ol, ...lines.map((x, i) => h('p', { class: i ? 'cip-trace' : '', text: x })));
  return card;
}

/* ---------------- chem.molecule (with stereocenter cards) ---------------- */
register('chem.molecule', (s, box) => {
  const wrapEl = h('div', { class: 'molrow' });
  box.append(wrapEl);
  const cell = h('div', { class: 'rxn-mol' });
  wrapEl.append(cell);
  const g = structure(cell, s.smi, { label: s.label, bondLength: 28, scale: 1.6, pad: 38 });
  const avail = box.clientWidth || width(box);
  g.markFont = markFontFor(g, 1.6, avail);
  if (s.mirror) mirrorLine(g, s.mirror, s.mirrorLabel);
  (s.centers || []).forEach((c) => markAtom(g, c.atom, c.name, true, c.labelDir));
  (s.marks || []).forEach((k) => markAtom(g, k.atom, k.text, k.key, k.labelDir));
  refit(g, 1.6);
  liftMarks(g, 1.6, avail);
  cell.append(h('div', { class: 'rxn-label', text: s.label }));
  const cards = h('div', { class: 'cip-cards' });
  const derived = [];
  (s.centers || []).forEach((c) => {
    const d = deriveStereo(g, c); derived.push(d);
    const bad = [];
    if (d.byRule !== c.config) bad.push('the drawing reads ' + d.byRule + ' by the rule, the spec says ' + c.config);
    if (d.byVolume !== c.config) bad.push('the drawn geometry gives ' + d.byVolume + ', the spec says ' + c.config);
    if (c.expectDrawn) { const got = { h: d.h, swapWith: d.swapWith ? d.swapWith.name + ' on the ' + d.swapWith.bond : null, trace: d.trace }; for (const k of Object.keys(c.expectDrawn)) if (c.expectDrawn[k] !== got[k]) bad.push(k + ' is ' + got[k] + ' in the drawing, ' + c.expectDrawn[k] + ' in the spec'); }
    if (bad.length) throw new Error(c.name + ': ' + bad.join('; '));
    cards.append(stereoCard(d));
  });
  box.dataset.stereo = JSON.stringify(derived);
  if (g.record) g.record.stereo = derived.map((d, k) => ({ atom: s.centers[k].atom, name: d.name, byRule: d.byRule, byVolume: d.byVolume, spec: s.centers[k].config }));
  if ((s.centers || []).length) wrapEl.append(cards);
  if (s.ladder) box.append(ladderEl(s.ladder));
  if (s.note) box.append(h('p', { class: 'vis-note', text: s.note }));
});

/* ---------------- chem.mechanism / chem.energy (mechdraw.js) ---------------- */
register('chem.mechanism', (s, box, ctx) => {
  injectMdCss();
  if (!s.fig) throw new Error('mechanism figure not resolved by the build');
  const W = width(box);
  drawFigure(box, s.fig, { width: Math.min(520, W - 24), showProduct: s.showProduct !== false });
  box.querySelectorAll('svg').forEach((n) => n.setAttribute('aria-hidden', 'true'));
  // phone: one step at a time, so the picture stays near one screen (coach view shows every step)
  const steps = [...box.querySelectorAll('.md-step')];
  if (s.stepper === 'phone' && W < 560 && steps.length > 1 && !(ctx && ctx.coach)) {
    let i = 0;
    const lab = h('span', { class: 'mstep-n' });
    const prev = h('button', { type: 'button', class: 'mstep-btn', text: 'Previous step' });
    const next = h('button', { type: 'button', class: 'mstep-btn', text: 'Next step' });
    const show = () => { steps.forEach((st, k) => { st.hidden = k !== i; }); lab.textContent = 'Step ' + (i + 1) + ' of ' + steps.length; prev.disabled = i === 0; next.disabled = i === steps.length - 1; };
    prev.addEventListener('click', () => { i = Math.max(0, i - 1); show(); });
    next.addEventListener('click', () => { i = Math.min(steps.length - 1, i + 1); show(); });
    box.append(h('div', { class: 'mstep' }, prev, lab, next));
    show();
  }
});
// chem.energy kinds other than the reaction-coordinate default register here
// (chem-gc.js adds levels, an enthalpy ladder).
export const ENERGY_KINDS = {};
register('chem.energy', (s, box) => {
  if (s.kind && s.kind !== 'rcd') { const fn = ENERGY_KINDS[s.kind]; if (!fn) throw new Error('no chem.energy kind ' + s.kind); return fn(s, box); }
  injectMdCss();
  const W = width(box);
  const svg = drawRcd(box, s, { width: W });
  svg.setAttribute('aria-hidden', 'true');
  // mechdraw sizes its labels for a 640-unit canvas; lift any label that would
  // land under 12 px at this width (phone first)
  const vbw = +svg.getAttribute('viewBox').split(' ')[2], scale = Math.min(W, 720) / vbw;
  svg.querySelectorAll('text').forEach((tx) => { const f = +tx.getAttribute('font-size'); if (f * scale < 12) tx.setAttribute('font-size', (12 / scale).toFixed(1)); tx.setAttribute('font-family', 'Arial, Helvetica, sans-serif'); tx.style.fontFamily = 'Arial, Helvetica, sans-serif'; });
  // keep any label that starts left of the plot clear of the y axis
  try {
    const axis = [...svg.querySelectorAll('line')].find((l) => +l.getAttribute('x1') === +l.getAttribute('x2'));
    if (axis) { const ax = +axis.getAttribute('x1'); svg.querySelectorAll('text').forEach((tx) => { const b = tx.getBBox(); if (b.x < ax + 4 && b.x + b.width > ax + 4 && tx.getAttribute('transform') == null) { const shift = ax + 6 - b.x; tx.setAttribute('x', (+tx.getAttribute('x') + shift).toFixed(1)); } }); }
  } catch (e) { /* not laid out yet */ }
  if (s.qualitative) box.append(h('p', { class: 'vis-note', text: 'Energies are drawn to show order, not measured values.' }));
});

/* ---------------- chem.lewis ---------------- */
register('chem.lewis', (s, box) => {
  const L = window.LewisLayout; if (!L) throw new Error('lewis-layout.js not loaded');
  const m = s.molecule, W = width(box), wide = W >= 560;
  const MW = 320, MH = 250, cx = MW / 2, cy = 104;
  let pos;
  if (s.layoutAngles) {            // a spec can set the drawing angles (pyramid: lone pair up, three legs down)
    pos = {}; pos[m.centralAtom] = { x: cx, y: cy };
    m.bondPattern.forEach((b, i) => { const a = s.layoutAngles[i] * Math.PI / 180, nm = b.atomA === m.centralAtom ? b.atomB : b.atomA; pos[nm] = { x: cx + Math.cos(a) * 92, y: cy + Math.sin(a) * 92 }; });
  } else pos = L.layoutPositions(m, cx, cy, 86);
  let g = '';
  for (const b of m.bondPattern) g += L.renderBond(pos[b.atomA], pos[b.atomB], b.order);
  // terminal atoms: spread the pairs evenly on the side away from the bond
  const terminalPairs = (atom, n) => {
    const b = m.bondPattern.find((x) => x.atomA === atom || x.atomB === atom); const other = b.atomA === atom ? b.atomB : b.atomA;
    const away = Math.atan2(pos[atom].y - pos[other].y, pos[atom].x - pos[other].x), out = [];
    const spread = n === 3 ? [-Math.PI / 2, 0, Math.PI / 2] : n === 2 ? [-Math.PI / 3, Math.PI / 3] : [0];
    spread.forEach((da) => { const a = away + da, r = 31, cx2 = pos[atom].x + Math.cos(a) * r, cy2 = pos[atom].y + Math.sin(a) * r, px = -Math.sin(a) * 4.2, py = Math.cos(a) * 4.2; out.push({ x: cx2 + px, y: cy2 + py }, { x: cx2 - px, y: cy2 - py }); });
    return out;
  };
  // central pairs at set angles (a spec can place them: XeF4 top and bottom, ClF3 on the left)
  const centralPairs = (n) => { const p = pos[m.centralAtom], out = []; s.centralPairAngles.slice(0, n).forEach((deg) => { const a = deg * Math.PI / 180, cx2 = p.x + Math.cos(a) * 37, cy2 = p.y + Math.sin(a) * 37, px = -Math.sin(a) * 4.6, py = Math.cos(a) * 4.6; out.push({ x: cx2 + px, y: cy2 + py }, { x: cx2 - px, y: cy2 - py }); }); return out; };
  for (const [atom, n] of Object.entries(m.lonePairCounts)) {
    if (!n) continue;
    const central = atom === m.centralAtom;
    const dots = central && s.centralPairAngles ? centralPairs(n) : (s.spreadTerminalPairs && !central) ? terminalPairs(atom, n) : L.lonePairOffsets(atom, m, pos, pos[atom], n, 24);
    dots.forEach((d) => { g += `<circle class="lp-dot${central ? ' is-key' : ''}" cx="${r1(d.x)}" cy="${r1(d.y)}" r="${central ? 4.4 : 2.6}"/>`; });
    if (central) {
      // one dashed outline per pair; the label names the count and sits by the first pair
      let first = null;
      for (let k = 0; k < dots.length; k += 2) {
        const pr = dots.slice(k, k + 2), xs = pr.map((d) => d.x), ys = pr.map((d) => d.y);
        const x0 = Math.min(...xs) - 9, y0 = Math.min(...ys) - 9, x1 = Math.max(...xs) + 9, y1 = Math.max(...ys) + 9;
        if (!first) first = { x0, y0, x1, y1 };
        g += `<rect x="${r1(x0)}" y="${r1(y0)}" width="${r1(x1 - x0)}" height="${r1(y1 - y0)}" rx="8" fill="none" stroke="${C.key}" stroke-width="2" stroke-dasharray="4 3"/>`;
      }
      const label = n + ' lone pair' + (n === 1 ? '' : 's');
      g += s.pairLabelSide === 'left' ? badge(first.x0 - 8, (first.y0 + first.y1) / 2 + 5, label, { size: 13.5, anchor: 'end' })
        : s.pairLabelSide === 'top' ? badge(pos[m.centralAtom].x, Math.min(...dots.map((d) => d.y)) - 17, label, { size: 13.5, anchor: 'middle' })
          : badge(first.x1 + 8, (first.y0 + first.y1) / 2 + 5, label, { size: 13.5 });
    }
  }
  for (const [name, p] of Object.entries(pos)) {
    const el = L.atomElement(name);
    g += `<g><circle class="atom-circle${name === m.centralAtom ? ' is-central' : ''}" cx="${r1(p.x)}" cy="${r1(p.y)}" r="24"/><text class="atom-label" x="${r1(p.x)}" y="${r1(p.y)}">${esc(el)}</text></g>`;
  }
  const mol = `<svg class="ls-canvas" viewBox="0 0 ${MW} ${MH}" width="100%" style="max-width:${MW}px;display:block;margin:0 auto" aria-hidden="true">${g}</svg>`;
  // the ledger, every line built from the spec: group from the valence count
  // (main group), bonds counted on the central atom, extra lines from the spec
  const lg = s.ledger;
  const group = lg.group != null ? lg.group : lg.valence <= 2 ? lg.valence : lg.valence + 10;
  const cb = m.bondPattern.filter((b) => b.atomA === m.centralAtom || b.atomB === m.centralAtom);
  const bondWords = cb.every((b) => b.order === 1) ? 'Used in ' + cb.length + ' single bond' + (cb.length === 1 ? '' : 's') : 'Used in bonds';
  const extraKey = (lg.extra || []).some((x) => x.key);
  const ledger = h('div', { class: 'ledger' },
    h('div', { class: 'ledger-h', text: 'Ledger for ' + lg.atom }),
    h('div', { class: 'ledger-r' }, h('span', { text: 'Valence electrons (group ' + group + ')' }), h('b', { text: String(lg.valence) })),
    h('div', { class: 'ledger-r' }, h('span', { text: bondWords }), h('b', { text: '- ' + lg.inBonds })),
    h('div', { class: 'ledger-r is-sum' }, h('span', { text: 'Left over' }), h('b', { text: (lg.valence - lg.inBonds) + ' electrons' })),
    h('div', { class: 'ledger-r ' + (extraKey ? 'is-sum' : 'is-key') }, h('span', { text: 'Lone pairs on ' + lg.atom }), h('b', { text: String((lg.valence - lg.inBonds) / 2) })),
    ...(lg.extra || []).map((x) => h('div', { class: 'ledger-r' + (x.key ? ' is-key' : '') }, h('span', { text: x.label }), h('b', { text: x.value }))),
    h('div', { class: 'ledger-f', text: 'Shape: ' + m.molecularGeometry.replace(/-/g, ' ') }));
  const row = h('div', { class: wide ? 'lewis-row wide' : 'lewis-row' });
  const mcell = h('div', { class: 'lewis-mol', html: mol });
  row.append(mcell, ledger);
  box.append(row);
  // s.fit: crop the canvas to the drawing, so a phone panel keeps the steps within reach
  if (s.fit) { try { const sv = mcell.querySelector('svg'), bb = sv.getBBox(), pad = 8; sv.setAttribute('viewBox', [bb.x - pad, bb.y - pad, bb.width + 2 * pad, bb.height + 2 * pad].map((v) => v.toFixed(1)).join(' ')); sv.style.maxWidth = Math.ceil(bb.width + 2 * pad) + 'px'; } catch (e) { /* not laid out */ } }
  LEWIS_EXTRAS.forEach((fn) => fn(s, box));
});
// add-ons drawn under a Lewis structure (chem-gc.js: the domain-count ladder)
export const LEWIS_EXTRAS = [];

/* ---------------- chem.trend ---------------- */
register('chem.trend', (s, box) => {
  const W = width(box), H = W < 520 ? 318 : 326;
  const L = 52, R = 16, T = 34, B = 78, pw = W - L - R, ph = H - T - B;
  const vals = s.values, n = vals.length, ymax = 1600;
  const X = (i) => L + (pw * (i + 0.5)) / n, Y = (v) => T + ph - (v / ymax) * ph;
  let g = '';
  for (let v = 0; v <= ymax; v += 400) { g += `<line x1="${L}" x2="${W - R}" y1="${r1(Y(v))}" y2="${r1(Y(v))}" stroke="#e3e8e5"/>` + t(L - 8, Y(v) + 4, String(v), { size: 12, anchor: 'end', fill: C.mute }); }
  g += t(12, T + ph / 2, 'kJ/mol', { size: 12, fill: C.ink2, anchor: 'middle' }).replace('<text ', `<text transform="rotate(-90 12 ${r1(T + ph / 2)})" `);
  const pts = vals.map((v, i) => [X(i), Y(v.v)]);
  g += `<polyline points="${pts.map((p) => r1(p[0]) + ',' + r1(p[1])).join(' ')}" fill="none" stroke="${C.ink2}" stroke-width="2"/>`;
  // dips: circled, numbered, with the lower value written under its point
  const below = new Set();
  s.dips.forEach(([a, b], n) => {
    const i = vals.findIndex((v) => v.sym === a), j = vals.findIndex((v) => v.sym === b);
    below.add(j);
    const mx = (pts[i][0] + pts[j][0]) / 2, my = (pts[i][1] + pts[j][1]) / 2;
    const rx = (pts[j][0] - pts[i][0]) / 2 + 14, ry = Math.abs(pts[j][1] - pts[i][1]) / 2 + 14;
    g += `<ellipse cx="${r1(mx)}" cy="${r1(my)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="rgba(155,69,0,.05)" stroke="${C.trap}" stroke-width="1.6" stroke-dasharray="5 3"/>`;
    g += t(mx, Math.min(my + ry + 34, T + ph - 4), 'dip ' + (n + 1), { size: 12.5, anchor: 'middle', weight: 700, fill: C.trap }).replace('<text ', '<text paint-order="stroke" stroke="#fff" stroke-width="4" stroke-linejoin="round" ');
  });
  vals.forEach((v, i) => {
    const hl = s.highlight.includes(v.sym);
    g += `<circle cx="${r1(pts[i][0])}" cy="${r1(pts[i][1])}" r="${hl ? 6.5 : 4}" fill="${hl ? C.key : '#9aa59f'}" stroke="#fff" stroke-width="1.5"/>`;
    g += t(pts[i][0], below.has(i) ? pts[i][1] + 22 : pts[i][1] - 12, String(v.v), { size: 12, anchor: 'middle', fill: hl ? C.ink : C.mute, weight: hl ? 700 : 400 }).replace('<text ', '<text paint-order="stroke" stroke="#fff" stroke-width="4" stroke-linejoin="round" ');
    g += t(pts[i][0], T + ph + 20, v.sym, { size: 14, anchor: 'middle', weight: hl ? 700 : 400, fill: hl ? C.key : C.mute });
    const rk = (s.rank || []).indexOf(v.sym);
    if (rk >= 0) g += `<circle cx="${r1(pts[i][0])}" cy="${T + ph + 38}" r="10" fill="${C.keyBg}" stroke="${C.key}" stroke-width="1.6"/>` + t(pts[i][0], T + ph + 42.5, String(rk + 1), { size: 12.5, anchor: 'middle', weight: 700, fill: C.key });
  });
  g += t(L, 18, 'First ionization energy across period 3', { size: 13, weight: 700, fill: C.ink2 });
  if (s.rank) g += t(W - R, H - 6, 'circled: rank in the answer, 1 = lowest', { size: 12, anchor: 'end', fill: C.key });
  box.innerHTML = svgOpen(W, H) + g + '</svg>';
});

/* ---------------- chem.curve (titration) ---------------- */
// Other curve kinds register here (chem-gc.js: gibbs, decay, half-lives,
// ph-scale, buffer, phase).
export const CURVE_KINDS = {};
register('chem.curve', (s, box) => {
  if (s.kind !== 'titration') { const fn = CURVE_KINDS[s.kind]; if (!fn) throw new Error('no chem.curve kind ' + s.kind); return fn(s, box); }
  const W = width(box), H = W < 520 ? 300 : 320;
  const L = 44, R = 18, T = 20, B = 46, pw = W - L - R, ph = H - T - B;
  const X = (v) => L + (v / s.xMaxMl) * pw, Y = (p) => T + ph - (p / 14) * ph;
  let g = '';
  const veq = s.analyte.molarity * s.analyte.volumeMl / s.titrant.molarity;
  g += `<rect x="${r1(X(veq * 0.2))}" y="${T}" width="${r1(X(veq * 0.8) - X(veq * 0.2))}" height="${ph}" fill="#eef7f2"/>`;
  g += t(X(veq * 0.5), T + 16, 'buffer region', { size: 12, anchor: 'middle', fill: C.key });
  for (let p = 0; p <= 14; p += 2) { g += `<line x1="${L}" x2="${W - R}" y1="${r1(Y(p))}" y2="${r1(Y(p))}" stroke="#e6ebe8"/>` + t(L - 7, Y(p) + 4, String(p), { size: 12, anchor: 'end', fill: C.mute }); }
  for (let v = 0; v <= s.xMaxMl; v += 10) g += t(X(v), T + ph + 18, String(v), { size: 12, anchor: 'middle', fill: C.mute });
  g += t(L + pw / 2, H - 6, 'mL of NaOH added', { size: 12.5, anchor: 'middle', fill: C.ink2 });
  g += t(14, T + ph / 2, 'pH', { size: 12.5, anchor: 'middle', fill: C.ink2 });
  g += `<polyline points="${s.curve.map((c) => r1(X(c[0])) + ',' + r1(Y(c[1]))).join(' ')}" fill="none" stroke="${C.blue}" stroke-width="2.4"/>`;
  s.marks.forEach((m) => {
    const x = X(m.vb), y = Y(m.pH);
    g += `<line x1="${r1(x)}" x2="${r1(x)}" y1="${r1(y)}" y2="${T + ph}" stroke="${m.key ? C.key : '#9aa59f'}" stroke-dasharray="3 3"/>`;
    g += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${m.key ? 6.5 : 5}" fill="${m.key ? C.key : '#fff'}" stroke="${m.key ? C.key : C.ink2}" stroke-width="2"/>`;
    const label = m.at === 'start' ? 'start: ' + m.choice : m.at === 'equivalence' ? 'equivalence: ' + m.choice : 'halfway: ' + m.choice;
    // labels sit below the curve, where the plot is empty, and never across another mark's line
    if (m.key) { const veqX = X(veq), lw = label.length * 12.5 * 0.53 + 14; const bx = x + 8 + lw > veqX - 4 ? Math.max(L + 4, veqX - 8 - lw) : x + 8; g += badge(bx, y + 36, label, { size: 12.5 }); }
    else if (m.at === 'start') g += t(x + 8, y + 22, label, { size: 12.5, fill: C.ink2, weight: 700 });
    else g += t(x - 10, y + 22, label, { size: 12.5, anchor: 'end', fill: C.ink2, weight: 700 });
  });
  box.innerHTML = svgOpen(W, H) + g + '</svg>';
});

export { drawSmiles };
