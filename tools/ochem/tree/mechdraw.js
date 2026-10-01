// mechdraw.js - the 2026 organic figures: drawn reaction coordinate diagrams,
// curved (two-electron) and fishhook (one-electron) arrows on real structures,
// multi-step mechanism chains, and the five-choice set player that serves the
// authored 2026 items in the tree and the summit.
//
// The geometry is pure and exported so node tests can check it (rcdModel,
// arrowGeom, freeAngle). The DOM builders take a target element and return
// the <svg> they appended. Structures go through drawSmilesGeom, so arrows
// land on the atoms SmilesDrawer actually drew, numbered in SMILES order,
// which is the numbering the RDKit gate (scripts/ochem2026/verify.py) proves.

import { drawSmilesGeom, drawSmiles } from './draw.js';

const NS = 'http://www.w3.org/2000/svg';
const FALLBACK = { gold: '#C9A84C', goldhi: '#e3c56e', blue: '#5b8def', coral: '#e0705a', green: '#57b487', amber: '#e2a93b', grey: '#8a8577', ink: '#ece6d7', ink2: '#c9c2b0', ink3: '#8f8877', panel: '#16140f', line: 'rgba(236,230,215,.16)', bg: '#0f0e0b' };
function palette(){
  const c = Object.assign({}, FALLBACK);
  if (typeof document === 'undefined') return c;
  const cs = getComputedStyle(document.documentElement);
  for (const k of Object.keys(c)){ const v = cs.getPropertyValue('--' + k).trim(); if (v) c[k] = v; }
  return c;
}
function S(tag, attrs, ...kids){
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})){ if (k === 'text') n.textContent = v; else if (v != null) n.setAttribute(k, v); }
  for (const c of kids.flat()) if (c != null) n.append(c.nodeType ? c : document.createTextNode(String(c)));
  return n;
}
function H(tag, attrs, ...kids){
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})){
    if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v); else if (v != null) n.setAttribute(k, v);
  }
  for (const c of kids.flat()) if (c != null) n.append(c.nodeType ? c : document.createTextNode(String(c)));
  return n;
}
const r1 = v => Math.round(v * 10) / 10;

/* ================================================================== */
/* Reaction coordinate diagrams                                         */
/* ================================================================== */
// spec = {
//   points: [{ kind: 'start'|'ts'|'int'|'end', y: energy, tag?: '1', show?: bool, x?: 0..1 }],
//   alt?:   { points: [...same length, same kinds], label: 'catalyzed' },   drawn dashed
//   marks?: [{ from: i, to: j, label: 'w' }]   a measured gap: from the level of point i up (or down) to point j, drawn at j
//   yLabel?: 'Free energy', xLabel?: 'Reaction progress', xTicks?: ['0','60',...] (conformation plots)
//   names?: { 0: 'reactants', 4: 'products' }  small captions under a point
// }
export function rcdModel(spec, o = {}){
  const W = o.W || 640, Ht = o.H || 330, L = 58, R = 30, T = 30, B = spec.xTicks ? 52 : 44;
  const P = spec.points, n = P.length;
  const all = P.map(p => p.y).concat(spec.alt ? spec.alt.points.map(p => p.y) : []);
  const lo = Math.min(...all), hi = Math.max(...all), pad = (hi - lo) * 0.14 || 10;
  const y0 = lo - pad, y1 = hi + pad * 1.4;
  const flat = spec.xTicks ? 0 : 0.07;                     // reactant and product plateaus
  const xs = P.map((p, i) => p.x != null ? p.x : flat + (1 - 2 * flat) * (i / (n - 1)));
  const px = f => L + (W - L - R) * f;
  const py = v => (Ht - B) - (v - y0) / (y1 - y0) * (Ht - B - T);
  function path(pts){
    const X = pts.map((p, i) => px(xs[i])), Y = pts.map(p => py(p.y));
    let d = spec.xTicks ? 'M ' + r1(X[0]) + ' ' + r1(Y[0]) : 'M ' + r1(px(0)) + ' ' + r1(Y[0]) + ' L ' + r1(X[0]) + ' ' + r1(Y[0]);
    for (let i = 1; i < pts.length; i++){
      const mx = (X[i - 1] + X[i]) / 2;
      d += ' C ' + r1(mx) + ' ' + r1(Y[i - 1]) + ' ' + r1(mx) + ' ' + r1(Y[i]) + ' ' + r1(X[i]) + ' ' + r1(Y[i]);
    }
    if (!spec.xTicks) d += ' L ' + r1(px(1)) + ' ' + r1(Y[Y.length - 1]);
    return d;
  }
  const pts = P.map((p, i) => ({ i, kind: p.kind, x: px(xs[i]), y: py(p.y), v: p.y, tag: p.tag || null, show: !!p.show, name: (spec.names || {})[i] || null }));
  const marks = (spec.marks || []).map(m => {
    const a = pts[m.from], b = pts[m.to];
    return { label: m.label, x: b.x + (m.dx || 0), ya: a.y, yb: b.y, guideFrom: a.x, up: b.v > a.v };
  });
  return { W, H: Ht, L, R, T, B, pts, d: path(P), alt: spec.alt ? { d: path(spec.alt.points), label: spec.alt.label || '' } : null, marks, px, py, yRange: [y0, y1] };
}

export function drawRcd(target, spec, o = {}){
  const C = palette(), M = rcdModel(spec, o);
  const s = S('svg', { viewBox: '0 0 ' + M.W + ' ' + M.H, class: 'md-rcd', role: 'img', 'aria-label': o.label || 'a reaction coordinate diagram', preserveAspectRatio: 'xMidYMid meet' });
  const mono = 'ui-monospace, Menlo, Consolas, monospace';
  // axes with arrowheads
  s.append(S('line', { x1: M.L - 14, y1: M.H - M.B, x2: M.L - 14, y2: M.T - 12, stroke: C.ink3, 'stroke-width': 1.3 }));
  s.append(S('path', { d: 'M ' + (M.L - 18) + ' ' + (M.T - 6) + ' L ' + (M.L - 14) + ' ' + (M.T - 14) + ' L ' + (M.L - 10) + ' ' + (M.T - 6), fill: 'none', stroke: C.ink3, 'stroke-width': 1.3 }));
  s.append(S('line', { x1: M.L - 14, y1: M.H - M.B, x2: M.W - 8, y2: M.H - M.B, stroke: C.ink3, 'stroke-width': 1.3 }));
  s.append(S('path', { d: 'M ' + (M.W - 16) + ' ' + (M.H - M.B - 4) + ' L ' + (M.W - 8) + ' ' + (M.H - M.B) + ' L ' + (M.W - 16) + ' ' + (M.H - M.B + 4), fill: 'none', stroke: C.ink3, 'stroke-width': 1.3 }));
  const ymid = (M.H - M.B + M.T) / 2;
  s.append(S('text', { x: 16, y: ymid, fill: C.ink3, 'font-family': mono, 'font-size': 11, 'letter-spacing': '.08em', transform: 'rotate(-90 16 ' + ymid + ')', 'text-anchor': 'middle', text: (spec.yLabel || 'Energy').toUpperCase() }));
  s.append(S('text', { x: (M.L + M.W - M.R) / 2, y: M.H - 10, fill: C.ink3, 'font-family': mono, 'font-size': 11, 'letter-spacing': '.08em', 'text-anchor': 'middle', text: (spec.xLabel || 'Reaction progress').toUpperCase() }));
  if (spec.xTicks){
    spec.xTicks.forEach((t, i) => { const x = M.px(i / (spec.xTicks.length - 1)); s.append(S('text', { x, y: M.H - M.B + 15, fill: C.ink3, 'font-family': mono, 'font-size': 10.5, 'text-anchor': 'middle', text: t })); });
  }
  // guides for shown values
  for (const p of M.pts) if (p.show){
    s.append(S('line', { x1: M.L - 14, y1: p.y, x2: p.x, y2: p.y, stroke: C.ink3, 'stroke-width': 0.8, 'stroke-dasharray': '2 4', opacity: 0.8 }));
    s.append(S('text', { x: M.L - 18, y: p.y + 4, fill: C.ink2, 'font-family': mono, 'font-size': 10.5, 'text-anchor': 'end', text: String(p.v) }));
  }
  if (M.alt){
    s.append(S('path', { d: M.alt.d, fill: 'none', stroke: C.blue, 'stroke-width': 2, 'stroke-dasharray': '6 5', 'stroke-linecap': 'round' }));
  }
  s.append(S('path', { d: M.d, fill: 'none', stroke: C.gold, 'stroke-width': 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  // measured gaps: a dashed guide from the lower level, a two-headed bar, a letter
  for (const m of M.marks){
    const top = Math.min(m.ya, m.yb), bot = Math.max(m.ya, m.yb);
    s.append(S('line', { x1: m.guideFrom, y1: m.ya, x2: m.x + 6, y2: m.ya, stroke: C.ink3, 'stroke-width': 1, 'stroke-dasharray': '3 3' }));
    s.append(S('line', { x1: m.x, y1: top + 5, x2: m.x, y2: bot - 5, stroke: C.goldhi, 'stroke-width': 1.5 }));
    s.append(S('path', { d: 'M ' + (m.x - 4) + ' ' + (top + 7) + ' L ' + m.x + ' ' + top + ' L ' + (m.x + 4) + ' ' + (top + 7) + ' Z', fill: C.goldhi }));
    s.append(S('path', { d: 'M ' + (m.x - 4) + ' ' + (bot - 7) + ' L ' + m.x + ' ' + bot + ' L ' + (m.x + 4) + ' ' + (bot - 7) + ' Z', fill: C.goldhi }));
    const ty = (top + bot) / 2 + 5;
    s.append(S('rect', { x: m.x + 5, y: ty - 13, width: 18, height: 18, rx: 4, fill: C.panel, stroke: C.goldhi, 'stroke-width': 1 }));
    s.append(S('text', { x: m.x + 14, y: ty + 1, fill: C.goldhi, 'font-family': 'Georgia, serif', 'font-style': 'italic', 'font-size': 13, 'text-anchor': 'middle', text: m.label }));
  }
  // numbered points
  for (const p of M.pts){
    if (!p.tag && !p.name) continue;
    if (p.tag){
      const above = p.kind === 'ts' || (p.kind !== 'int' && p.kind !== 'min');
      const cy = above ? p.y - 16 : p.y + 17;
      s.append(S('circle', { cx: p.x, cy, r: 9, fill: C.panel, stroke: C.ink2, 'stroke-width': 1.1 }));
      s.append(S('text', { x: p.x, y: cy + 4, fill: C.ink, 'font-family': mono, 'font-size': 11, 'text-anchor': 'middle', text: p.tag }));
    }
    if (p.name) s.append(S('text', { x: p.x, y: p.y + (p.tag && (p.kind === 'int' || p.kind === 'min') ? 38 : 18), fill: C.ink3, 'font-family': 'Georgia, serif', 'font-size': 11.5, 'text-anchor': 'middle', text: p.name }));
  }
  if (M.alt && M.alt.label){
    s.append(S('line', { x1: M.W - 170, y1: M.T - 6, x2: M.W - 146, y2: M.T - 6, stroke: C.blue, 'stroke-width': 2, 'stroke-dasharray': '6 5' }));
    s.append(S('text', { x: M.W - 140, y: M.T - 2, fill: C.ink2, 'font-family': 'Georgia, serif', 'font-size': 12, text: M.alt.label }));
  }
  if (target) target.append(s);
  return s;
}

/* ================================================================== */
/* Curved arrows on structures                                          */
/* ================================================================== */
const ang = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
/** The widest open direction around an atom, avoiding its bonds and any taken directions (radians). */
export function freeAngle(atom, nbPts, taken = [], prefer){
  const used = nbPts.map(p => ang(atom, p)).concat(taken);
  if (!used.length) return prefer != null ? prefer : -Math.PI / 2;
  let best = 0, bestGap = -1;
  for (let k = 0; k < 24; k++){
    const t = -Math.PI + k * Math.PI / 12;
    const gap = Math.min(...used.map(u => Math.abs(((t - u) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI)));
    const score = gap + (prefer != null ? -0.15 * Math.abs(((t - prefer) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI) : 0);
    if (score > bestGap + 1e-6){ bestGap = score; best = t; }
  }
  return best;
}
/** A curved arrow from tail to head, bowing toward side (+1/-1 relative to the tail-to-head direction). */
export function arrowGeom(tail, head, side, fish, o = {}){
  const dx = head.x - tail.x, dy = head.y - tail.y, L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  const amp = Math.max(o.minAmp || 13, Math.min(L * 0.42, o.maxAmp || 44)) * side;
  const cx = (tail.x + head.x) / 2 + nx * amp, cy = (tail.y + head.y) / 2 + ny * amp;
  const tx = head.x - cx, ty = head.y - cy, tl = Math.hypot(tx, ty) || 1, ux = tx / tl, uy = ty / tl;
  const hl = 7.5, hw = 3.6;
  const bx = head.x - ux * hl, by = head.y - uy * hl;
  // the shaft stops inside the head so the tip stays sharp
  const sx = head.x - ux * hl * 0.6, sy = head.y - uy * hl * 0.6;
  const d = 'M ' + r1(tail.x) + ' ' + r1(tail.y) + ' Q ' + r1(cx) + ' ' + r1(cy) + ' ' + r1(sx) + ' ' + r1(sy);
  // the head: full is a triangle, a fishhook keeps only the barb on the outside of the curve
  const px = -uy, py = ux;                      // perpendicular to the end tangent
  const outer = (px * nx + py * ny) * side > 0 ? 1 : -1;
  const headD = fish
    ? 'M ' + r1(head.x) + ' ' + r1(head.y) + ' L ' + r1(bx + px * hw * 1.25 * outer) + ' ' + r1(by + py * hw * 1.25 * outer) + ' L ' + r1(bx + ux * 1.2) + ' ' + r1(by + uy * 1.2) + ' Z'
    : 'M ' + r1(head.x) + ' ' + r1(head.y) + ' L ' + r1(bx + px * hw) + ' ' + r1(by + py * hw) + ' L ' + r1(bx - px * hw) + ' ' + r1(by - py * hw) + ' Z';
  return { d, headD, ctrl: { x: cx, y: cy } };
}

function refParts(r){ const [s, a] = String(r).split('.').map(Number); return { s, a }; }

/* ---- structures for arrow figures: SmilesDrawer places the atoms, we draw them ---- */
// SmilesDrawer's own text cannot be mirrored, and an arrow figure has to turn a
// molecule so the attacking atom faces its partner. So the figure takes the atom
// positions from SmilesDrawer and draws bonds, labels and charges itself, in the
// house style, which also keeps every label upright whichever way it turns.
const ELC = { O: 'coral', N: 'blue', S: 'amber', P: 'amber', Br: '#c47a4a', Cl: '#3fb257', F: '#9ad39a', I: '#a06bd6', Mg: 'grey', Li: 'grey', Na: 'grey', K: 'grey', B: '#d8a0a0' };
const VALENCE = { C: 4, N: 3, O: 2, S: 2, P: 3, F: 1, Cl: 1, Br: 1, I: 1, B: 3, H: 1 };
let _scratch = null;
export function structGeom(smi){
  if (typeof document === 'undefined') return null;
  if (!_scratch){ _scratch = document.createElementNS(NS, 'svg'); _scratch.setAttribute('style', 'position:absolute;left:-9999px;top:0;width:10px;height:10px'); document.body.append(_scratch); }
  const g = drawSmilesGeom(_scratch, smi, { bondLength: 30 });
  g.node.remove();
  const atoms = g.atoms.map(a => Object.assign({}, a));
  // two or three atoms drawn as labels hide their bonds at the normal length; stretch them
  if (atoms.length && atoms.length <= 3){ const cx = atoms.reduce((t, a) => t + a.x, 0) / atoms.length, cy = atoms.reduce((t, a) => t + a.y, 0) / atoms.length; for (const a of atoms){ a.x = cx + (a.x - cx) * 1.45; a.y = cy + (a.y - cy) * 1.45; } }
  const order = {}; for (const b of g.bonds){ order[a2(b.a, b.b)] = b.order; }
  for (const at of atoms){
    const bsum = at.nb.reduce((t, j) => t + (order[a2(at.i, j)] || 1), 0);
    let h;
    if (at.hc != null) h = at.hc;
    else { let v = VALENCE[at.el] || 0; if (at.el === 'C' && at.q) v = 3; else if ('NOSP'.includes(at.el)) v += at.q; h = Math.max(0, v - bsum); }
    at.h = h;
    at.labeled = at.el !== 'C' || at.nb.length === 0;
  }
  return { atoms, bonds: g.bonds };
}
function a2(a, b){ return a < b ? a + '-' + b : b + '-' + a; }
function colorOf(C, el){ const k = ELC[el]; if (!k) return C.ink; return C[k] || k; }

// transform t: { mx: bool, my: bool } about the atoms' center
function transformed(geo, t){
  const xs = geo.atoms.map(a => a.x), ys = geo.atoms.map(a => a.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  return geo.atoms.map(a => ({ x: t.mx ? 2 * cx - a.x : a.x, y: t.my ? 2 * cy - a.y : a.y }));
}

function drawStruct(layer, C, geo, P, rad){
  const { atoms, bonds } = geo;
  const at = i => atoms[i], pos = i => P[i];
  const g = S('g', { class: 'md-struct' });
  const shrink = (i, toward) => at(i).labeled ? 9.5 : 0;
  for (const b of bonds){
    const A = pos(b.a), B = pos(b.b), dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    const sa = shrink(b.a), sb = shrink(b.b);
    const x1 = A.x + ux * sa, y1 = A.y + uy * sa, x2 = B.x - ux * sb, y2 = B.y - uy * sb;
    const line = (ox, oy, t1, t2) => g.append(S('line', { x1: r1(x1 + ox + ux * t1), y1: r1(y1 + oy + uy * t1), x2: r1(x2 + ox - ux * t2), y2: r1(y2 + oy - uy * t2), stroke: C.ink, 'stroke-width': 1.7, 'stroke-linecap': 'round' }));
    const nx = -uy, ny = ux;
    if (b.order === 1) line(0, 0, 0, 0);
    else if (b.order === 3){ line(0, 0, 0, 0); line(nx * 3.6, ny * 3.6, 0, 0); line(-nx * 3.6, -ny * 3.6, 0, 0); }
    else {
      // which side are the other neighbors on? draw the second line inside there, else center both
      let side = 0;
      for (const [i, other] of [[b.a, b.b], [b.b, b.a]]) for (const j of at(i).nb){ if (j === other) continue; const q = pos(j); side += Math.sign((q.x - A.x) * nx + (q.y - A.y) * ny); }
      if (side === 0 || (at(b.a).labeled && at(b.b).labeled)){ line(nx * 2.4, ny * 2.4, 0, 0); line(-nx * 2.4, -ny * 2.4, 0, 0); }
      else { const sgn = side > 0 ? 1 : -1; line(0, 0, 0, 0); line(nx * 4.6 * sgn, ny * 4.6 * sgn, at(b.a).labeled ? 0 : 4, at(b.b).labeled ? 0 : 4); }
    }
  }
  atoms.forEach((a, i) => {
    const p = pos(i), col = colorOf(C, a.el);
    a.hSide = 0;
    if (a.labeled){
      // hydrogens go on the side away from the bonds; an isolated O, S or halogen writes them first (H2O, HBr)
      let mdx = 0; for (const j of a.nb) mdx += pos(j).x - p.x;
      const hLeft = a.nb.length ? mdx > 0.5 : 'OSFClBrI'.includes(a.el) && a.el !== 'C' && a.el !== 'N';
      a.hSide = a.h ? (hLeft ? -1 : 1) : 0;
      const t = S('text', { x: r1(p.x), y: r1(p.y + 4.6), fill: col, 'font-family': 'Arial, Helvetica, sans-serif', 'font-size': 13.5, 'text-anchor': 'middle' });
      t.append(S('tspan', { text: a.el }));
      g.append(t);
      if (a.h){
        const w = a.el.length > 1 ? 9 : 5;
        const hx = hLeft ? p.x - w - (a.h > 1 ? 10 : 5) : p.x + w + 4.5;
        const ht = S('text', { x: r1(hx), y: r1(p.y + 4.6), fill: col, 'font-family': 'Arial, Helvetica, sans-serif', 'font-size': 13.5, 'text-anchor': 'middle' });
        ht.append(S('tspan', { text: 'H' }));
        if (a.h > 1) ht.append(S('tspan', { 'font-size': 9.5, dy: 3.5, text: String(a.h) }));
        g.append(ht);
      }
    }
  });
  layer.append(g);
}
function chargeMark(layer, C, p, q, t){
  const col = q > 0 ? C.coral : C.blue, R = 5, x = p.x + Math.cos(t) * 12, y = p.y + Math.sin(t) * 12;
  layer.append(S('circle', { cx: r1(x), cy: r1(y), r: R, fill: C.panel, stroke: col, 'stroke-width': 1.2 }));
  layer.append(S('line', { x1: r1(x - 2.8), y1: r1(y), x2: r1(x + 2.8), y2: r1(y), stroke: col, 'stroke-width': 1.4, 'stroke-linecap': 'round' }));
  if (q > 0) layer.append(S('line', { x1: r1(x), y1: r1(y - 2.8), x2: r1(x), y2: r1(y + 2.8), stroke: col, 'stroke-width': 1.4, 'stroke-linecap': 'round' }));
}

/**
 * drawMech(target, spec, o)
 * spec = {
 *   species: [{ smi, lp?: [atomIdx], rad?: [atomIdx], name? }],
 *   arrows?: [{ from: {lp:'s.a'}|{bond:['s.a','s.b']}|{e:'s.a'}, to: {atom:'s.a'}|{bond:['s.a','s.b']}, fish?: bool, bend?: 1|-1 }],
 *   product?: [{ smi, lp?, rad? }], reagent?: 'text over the reaction arrow'
 * }
 * o.hideProduct shows a box with a question mark in the product's place.
 */
export function drawMech(target, spec, o = {}){
  const C = palette();
  const outer = S('svg', { class: 'md-mech', role: 'img', 'aria-label': o.label || 'a mechanism step with curved arrows', preserveAspectRatio: 'xMidYMid meet' });
  if (target) target.append(outer);
  const arrows = spec.arrows || [];
  const lpWanted = spec.species.map(sp => new Set(sp.lp || []));
  for (const ar of arrows) if (ar.from.lp){ const { s, a } = refParts(ar.from.lp); if (lpWanted[s]) lpWanted[s].add(a); }
  const radWanted = spec.species.map(sp => new Set(sp.rad || []));
  for (const ar of arrows) if (ar.from.e){ const { s, a } = refParts(ar.from.e); if (radWanted[s]) radWanted[s].add(a); }

  const PAD = 16, GAP = (spec.arrows || []).length ? 46 : 34;
  function make(list, lpSets, radSets){
    return list.map((sp, i) => {
      const geo = structGeom(sp.smi) || { atoms: [], bonds: [] };
      return { sp, geo, lp: lpSets ? lpSets[i] : new Set(sp.lp || []), rad: radSets ? radSets[i] : new Set(sp.rad || []), t: sp.flip ? { mx: /x/.test(sp.flip), my: /y/.test(sp.flip) } : { mx: false, my: false }, P: null, box: null, X: 0, Y: 0 };
    });
  }
  function boxOf(p){
    const xs = p.P.map(q => q.x), ys = p.P.map(q => q.y);
    if (!xs.length) return [0, 0, 40, 40];
    return [Math.min(...xs) - PAD, Math.min(...ys) - PAD, Math.max(...xs) - Math.min(...xs) + 2 * PAD, Math.max(...ys) - Math.min(...ys) + 2 * PAD];
  }
  const left = make(spec.species, lpWanted, radWanted);
  const right = spec.product ? make(spec.product) : [];
  const hideProduct = !!o.hideProduct && right.length === 0;

  // turn each reacting species so the atoms its arrows reach face their partner
  const cross = arrows.map(ar => {
    const s1 = ar.from.lp || ar.from.e || (ar.from.bond && ar.from.bond[0]);
    const tg = ar.to.atom || (ar.to.bond && (ar.to.bond.find(r => refParts(r).s !== refParts(s1).s) || ar.to.bond[1]));
    return [s1, tg];
  }).filter(([a, b]) => a && b && refParts(a).s !== refParts(b).s);
  const leaving = arrows.filter(ar => ar.from.bond && ar.to.atom && ar.from.bond.includes(ar.to.atom)).map(ar => ar.to.atom);
  const choices = [{ mx: false, my: false }, { mx: true, my: false }, { mx: false, my: true }, { mx: true, my: true }];
  function layoutRow(parts, x0, mid){
    let X = x0; const plus = [];
    parts.forEach((p, i) => { p.box = boxOf(p); p.X = X; p.Y = mid - p.box[3] / 2; X += p.box[2]; if (i < parts.length - 1){ plus.push({ x: X + GAP / 2, y: mid }); X += GAP; } });
    return { end: X, plus };
  }
  const GP = (parts, ref) => { const { s, a } = refParts(ref); const p = parts[s]; if (!p || !p.P[a]) return null; return { x: p.X + p.P[a].x - p.box[0], y: p.Y + p.P[a].y - p.box[1], atom: p.geo.atoms[a], part: p, s, a }; };
  if (left.length > 1 && left.length <= 4 && cross.length && !spec.species.some(sp => sp.flip)){
    let best = null, bestCost = Infinity;
    const n = left.length, total = Math.pow(4, n);
    for (let code = 0; code < total; code++){
      let c = code; left.forEach(p => { p.t = choices[c % 4]; c = Math.floor(c / 4); p.P = transformed(p.geo, p.t); });
      layoutRow(left, 0, 0);
      let cost = 0; for (const [a, b] of cross){ const A = GP(left, a), B = GP(left, b); if (A && B) cost += Math.hypot(A.x - B.x, A.y - B.y); }
      // a leaving group should point away from whoever is attacking (backside attack reads right)
      for (const lg of leaving) for (const [a, b] of cross){ const A = GP(left, a), B = GP(left, b), Lg = GP(left, lg); if (A && B && Lg && refParts(lg).s === B.s) cost -= 0.6 * Math.hypot(A.x - Lg.x, A.y - Lg.y); }
      cost += code * 1e-6;                                         // prefer fewer flips on ties
      if (cost < bestCost - 0.5){ bestCost = cost; best = left.map(p => p.t); }
    }
    left.forEach((p, i) => { p.t = best[i]; });
  }
  for (const p of left.concat(right)) p.P = transformed(p.geo, p.t);

  const rowH = parts => parts.length ? Math.max(...parts.map(p => boxOf(p)[3])) : 70;
  const lh = rowH(left), rh = right.length ? rowH(right) : 70;
  const rowWidth = parts => parts.reduce((w, p) => w + boxOf(p)[2], 0) + Math.max(0, parts.length - 1) * GAP;
  const rxnW = spec.reagent ? Math.max(76, spec.reagent.length * 6.8 + 24) : 60;
  const leftW = rowWidth(left), rightW = right.length ? rowWidth(right) : (hideProduct ? 70 : 0);
  const avail = o.width || (target && target.clientWidth) || 640;
  const scaleWanted = o.scale || 1.6;
  const oneRowW = leftW + (rightW ? rxnW + rightW : 0);
  const wrap = rightW && avail < oneRowW * scaleWanted * 0.8 && !o.noWrap;
  const top = 48, midL = top + lh / 2;
  const L1 = layoutRow(left, 8, midL);
  let X = L1.end, plus = L1.plus.slice(), rxn = null, qbox = null;
  if (rightW){
    let RX, midR;
    if (!wrap){ rxn = { x1: X + 10, x2: X + rxnW - 10, y: midL, vertical: false }; RX = X + rxnW; midR = midL; }
    else { const cx = 8 + Math.max(leftW, rightW) / 2; rxn = { x: cx, y1: top + lh + 16, y2: top + lh + 54, vertical: true }; RX = 8 + (Math.max(leftW, rightW) - rightW) / 2; midR = top + lh + 70 + rh / 2; }
    if (right.length){ const L2 = layoutRow(right, RX, midR); plus = plus.concat(L2.plus); X = L2.end; }
    else { qbox = { x: RX, y: midR - 32, w: 66, h: 64 }; X = RX + 66; }
  }

  const layer = S('g', {}); outer.append(layer);
  const marksLayer = S('g', {});
  for (const p of left.concat(right)){
    const P = p.P.map(q => ({ x: p.X + q.x - p.box[0], y: p.Y + q.y - p.box[1] }));
    p.G = P;
    drawStruct(layer, C, p.geo, P);
  }
  for (const q of plus) layer.append(S('text', { x: q.x, y: q.y + 6, fill: C.ink2, 'font-family': 'Georgia, serif', 'font-size': 20, 'text-anchor': 'middle', text: '+' }));
  if (rxn){
    if (!rxn.vertical){
      layer.append(S('line', { x1: rxn.x1, y1: rxn.y, x2: rxn.x2 - 2, y2: rxn.y, stroke: C.ink2, 'stroke-width': 1.6 }));
      layer.append(S('path', { d: 'M ' + (rxn.x2 - 9) + ' ' + (rxn.y - 4.5) + ' L ' + rxn.x2 + ' ' + rxn.y + ' L ' + (rxn.x2 - 9) + ' ' + (rxn.y + 4.5) + ' Z', fill: C.ink2 }));
      if (spec.reagent) layer.append(S('text', { x: (rxn.x1 + rxn.x2) / 2, y: rxn.y - 8, fill: C.ink2, 'font-family': 'Georgia, serif', 'font-size': 12, 'text-anchor': 'middle', text: spec.reagent }));
    } else {
      layer.append(S('line', { x1: rxn.x, y1: rxn.y1, x2: rxn.x, y2: rxn.y2 - 2, stroke: C.ink2, 'stroke-width': 1.6 }));
      layer.append(S('path', { d: 'M ' + (rxn.x - 4.5) + ' ' + (rxn.y2 - 9) + ' L ' + rxn.x + ' ' + rxn.y2 + ' L ' + (rxn.x + 4.5) + ' ' + (rxn.y2 - 9) + ' Z', fill: C.ink2 }));
      if (spec.reagent) layer.append(S('text', { x: rxn.x + 10, y: (rxn.y1 + rxn.y2) / 2 + 4, fill: C.ink2, 'font-family': 'Georgia, serif', 'font-size': 12, text: spec.reagent }));
    }
  }
  if (qbox){
    layer.append(S('rect', { x: qbox.x, y: qbox.y, width: qbox.w, height: qbox.h, rx: 8, fill: 'none', stroke: C.goldhi, 'stroke-width': 1.3, 'stroke-dasharray': '5 4' }));
    layer.append(S('text', { x: qbox.x + qbox.w / 2, y: qbox.y + qbox.h / 2 + 9, fill: C.goldhi, 'font-family': 'Georgia, serif', 'font-size': 26, 'text-anchor': 'middle', text: '?' }));
  }
  outer.append(marksLayer);
  const ptOf = (parts, ref) => { const { s, a } = refParts(ref); const p = parts[s]; if (!p || !p.G[a]) return null; return { x: p.G[a].x, y: p.G[a].y, atom: p.geo.atoms[a], part: p, s, a }; };

  // electron marks: charges first, then lone pairs (two dots) and radicals (one dot), each in the widest open gap
  const marks = new Map();
  const dirsUsed = new Map();
  function openDir(parts, s, a, prefer){
    const p = parts[s], at = p.geo.atoms[a], c = p.G[a];
    const nb = at.nb.map(j => p.G[j]).filter(Boolean);
    const taken = (dirsUsed.get(p.sp.smi + s + ':' + a + (parts === left ? 'L' : 'R')) || []).slice();
    if (at.hSide) taken.push(at.hSide > 0 ? 0 : Math.PI);
    if (at.labeled && at.el.length > 1){ taken.push(0, Math.PI); }
    const t = freeAngle(c, nb, taken, prefer);
    dirsUsed.set(p.sp.smi + s + ':' + a + (parts === left ? 'L' : 'R'), taken.concat([t]));
    return { c, t, at };
  }
  function markAt(parts, side, s, a, kind){
    const p = parts[s]; if (!p || !p.G[a]) return null;
    const { c, t, at } = openDir(parts, s, a, -Math.PI / 2);
    const dist = at.labeled ? 11.5 : 8;
    const m = { x: c.x + Math.cos(t) * dist, y: c.y + Math.sin(t) * dist, t };
    const px = -Math.sin(t), py = Math.cos(t);
    if (kind === 'lp') marksLayer.append(S('circle', { cx: r1(m.x + px * 3), cy: r1(m.y + py * 3), r: 2, fill: C.blue }), S('circle', { cx: r1(m.x - px * 3), cy: r1(m.y - py * 3), r: 2, fill: C.blue }));
    else marksLayer.append(S('circle', { cx: r1(m.x), cy: r1(m.y), r: 2.6, fill: C.amber }));
    marks.set(side + ':' + s + '.' + a + ':' + kind, m);
    return m;
  }
  for (const [parts, side] of [[left, 'L'], [right, 'R']]){
    parts.forEach((p, s) => p.geo.atoms.forEach((at, a) => { if (at.q){ const { c, t } = openDir(parts, s, a, -Math.PI / 4); chargeMark(marksLayer, C, c, at.q, t); } }));
    parts.forEach((p, s) => { for (const a of p.lp) markAt(parts, side, s, a, 'lp'); for (const a of p.rad) markAt(parts, side, s, a, 'rad'); });
  }

  // arrows
  const extent = [];
  const allPts = []; left.forEach(p => p.G.forEach(q => allPts.push(q)));
  const centroid = { x: allPts.reduce((t, q) => t + q.x, 0) / (allPts.length || 1), y: allPts.reduce((t, q) => t + q.y, 0) / (allPts.length || 1) };
  const usedBondSide = new Map();
  arrows.forEach(ar => {
    let tail = null, srcAtoms = [], bondKey = null, bondMid = null;
    if (ar.from.lp){ tail = marks.get('L:' + ar.from.lp + ':lp'); srcAtoms = [ar.from.lp]; }
    else if (ar.from.e){ tail = marks.get('L:' + ar.from.e + ':rad'); srcAtoms = [ar.from.e]; }
    else if (ar.from.bond){ const a = ptOf(left, ar.from.bond[0]), b = ptOf(left, ar.from.bond[1]); if (a && b){ tail = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; bondMid = { a, b }; } srcAtoms = ar.from.bond; bondKey = ar.from.bond.slice().sort().join('|'); }
    let head = null, tgt = null;
    if (ar.to.atom){ tgt = ptOf(left, ar.to.atom); }
    else if (ar.to.bond){
      const [ra, rb] = ar.to.bond, a = ptOf(left, ra), b = ptOf(left, rb);
      const bonded = a && b && a.part === b.part && a.atom.nb.includes(b.atom.i);
      if (bonded) head = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      else if (srcAtoms.includes(ra)) tgt = b; else if (srcAtoms.includes(rb)) tgt = a;
      else if (a && b){
        // electrons from a bond reaching out to a new partner: land on whichever new-bond atom is not in the source
        const inSrc = r => bondMid && (r === ar.from.bond[0] || r === ar.from.bond[1]);
        tgt = inSrc(ra) ? b : inSrc(rb) ? a : null;
        if (!tgt) head = { x: a.x * 0.35 + b.x * 0.65, y: a.y * 0.35 + b.y * 0.65 };
      }
    }
    if (!tail || (!head && !tgt)) return;
    if (tgt && !head){
      const off = tgt.atom.labeled ? 10 : 5, dx = tail.x - tgt.x, dy = tail.y - tgt.y, L = Math.hypot(dx, dy) || 1;
      head = { x: tgt.x + dx / L * off, y: tgt.y + dy / L * off };
    }
    const mx = (tail.x + head.x) / 2, my = (tail.y + head.y) / 2, dx = head.x - tail.x, dy = head.y - tail.y, L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L, ny = dx / L;
    let side = ((mx - centroid.x) * nx + (my - centroid.y) * ny) >= 0 ? 1 : -1;
    if (Math.abs(nx) < 0.3 && L > 40) side = ny < 0 ? 1 : -1;     // long, nearly flat arrows bow upward
    // two arrows out of one bond (homolysis, a pi bond splitting) leave on opposite faces of it
    if (bondKey){
      const prev = usedBondSide.get(bondKey);
      if (prev){
        const pv = prev.n;                                     // the normal the first one bowed toward
        const myN = { x: nx * side, y: ny * side };
        if (pv.x * myN.x + pv.y * myN.y > 0) side = -side;
      }
      usedBondSide.set(bondKey, { n: { x: nx * side, y: ny * side } });
      // start a little off the bond on the side it bows to, so two tails do not sit on one point
      tail = { x: tail.x + nx * side * 3, y: tail.y + ny * side * 3 };
    }
    if (ar.bend === -1) side = -side;
    const geo = arrowGeom(tail, head, side, !!ar.fish, { minAmp: L < 26 ? 11 : 14, maxAmp: 46 });
    extent.push({ x: (tail.x + 2 * geo.ctrl.x + head.x) / 4, y: (tail.y + 2 * geo.ctrl.y + head.y) / 4 }, tail, head);
    marksLayer.append(S('path', { d: geo.d, fill: 'none', stroke: C.goldhi, 'stroke-width': 1.8, 'stroke-linecap': 'round', class: ar.fish ? 'md-fish' : 'md-arrow' }));
    marksLayer.append(S('path', { d: geo.headD, fill: C.goldhi, class: 'md-head' }));
  });

  const xs = [], ys = [];
  for (const p of left.concat(right)) for (const q of p.G){ xs.push(q.x - 16, q.x + 16); ys.push(q.y - 16, q.y + 16); }
  if (qbox){ xs.push(qbox.x, qbox.x + qbox.w); ys.push(qbox.y, qbox.y + qbox.h); }
  if (rxn){ if (rxn.vertical){ ys.push(rxn.y2); } else { xs.push(rxn.x2); } }
  for (const q of extent){ xs.push(q.x - 4, q.x + 4); ys.push(q.y - 6, q.y + 6); }
  const minX = Math.min(...xs) - 6, maxX = Math.max(...xs) + 6, minY = Math.min(...ys) - 6, maxY = Math.max(...ys) + 6;
  const vbW = maxX - minX, vbH = maxY - minY;
  outer.setAttribute('viewBox', [minX, minY, vbW, vbH].map(r1).join(' '));
  outer.style.width = '100%';
  outer.style.maxWidth = Math.round(vbW * scaleWanted) + 'px';
  outer.style.height = 'auto';
  outer.style.display = 'block';
  return outer;
}

/** A mechanism as a numbered list of steps, each a drawMech row, ending in the product. */
export function drawChain(target, chain, o = {}){
  const C = palette();
  const box = H('div', { class: 'md-chain' });
  if (target) target.append(box);
  chain.steps.forEach((st, i) => {
    const row = H('div', { class: 'md-step' + (o.hide === i ? ' md-hidden' : '') });
    row.append(H('span', { class: 'md-step-n', text: 'Step ' + (i + 1) + (st.name ? ': ' + st.name : '') }));
    box.append(row);
    if (o.hide === i){ row.append(H('div', { class: 'md-q', text: 'This step is the question.' })); return; }
    drawMech(row, { species: st.species, arrows: st.arrows }, { width: o.width, label: 'step ' + (i + 1) });
  });
  if (chain.product && o.showProduct !== false){
    const row = H('div', { class: 'md-step' });
    row.append(H('span', { class: 'md-step-n', text: chain.productName || 'Product' }));
    drawMech(row, { species: chain.product }, { width: o.width, label: 'the product' });
    box.append(row);
  }
  return box;
}

/** Draw any 2026 figure into a target: a mechanism, a chain, or a diagram. */
export function drawFigure(target, fig, o = {}){
  if (!fig) return null;
  if (fig.kind === 'rcd') return drawRcd(target, fig, o);
  if (fig.kind === 'mech') return drawMech(target, fig, o);
  if (fig.kind === 'chain') return drawChain(target, fig, o);
  return null;
}

export const MD_CSS = `
.md-rcd{display:block;width:100%;max-width:720px;height:auto;margin:4px auto}
.md-mech{margin:2px auto}
.md-chain{display:flex;flex-direction:column;gap:10px}
.md-step{border:1px solid var(--line);border-radius:10px;padding:8px 10px 6px;background:rgba(255,255,255,.015)}
.md-step-n{display:block;font-family:var(--mono, ui-monospace, Menlo, monospace);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3)}
.md-q{font-family:Georgia,serif;color:var(--goldhi);padding:14px 4px;font-size:16px}
.md-hidden{border-style:dashed;border-color:var(--goldhi)}
.md-set{display:flex;flex-direction:column;gap:12px}
.md-set .md-meta{display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px;font-family:var(--mono, ui-monospace, Menlo, monospace);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3)}
.md-set .md-stem{font-size:17px;line-height:1.55;margin:0;color:var(--ink)}
.md-set .md-fig{border:1px solid var(--line);border-radius:12px;padding:10px;background:rgba(255,255,255,.02);overflow:hidden}
.md-set .md-rxn{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap}
.md-set .md-rxn .md-reagent{font-family:Georgia,serif;color:var(--ink2);font-size:14px;text-align:center;border-bottom:1.5px solid var(--ink2);padding:0 10px 3px;min-width:70px}
.md-set .md-rxn svg.mol{width:200px;max-width:100%;height:auto}
.md-set .md-opts{display:grid;gap:8px}
.md-set .md-opts.figs{grid-template-columns:1fr}
@media (min-width:760px){.md-set .md-opts.structs{grid-template-columns:1fr 1fr}}
.md-set .md-opt{display:flex;gap:10px;align-items:center;text-align:left;min-height:48px;padding:10px 12px;border-radius:10px;border:1px solid var(--line);background:rgba(255,255,255,.02);color:var(--ink);font:inherit;font-size:15.5px;cursor:pointer;width:100%}
.md-set .md-opt:hover{border-color:var(--goldhi)}
.md-set .md-opt:focus-visible{outline:2px solid var(--goldhi);outline-offset:2px}
.md-set .md-opt.picked{border-color:var(--gold);background:rgba(201,168,76,.08)}
.md-set .md-opt.ok{border-color:var(--green);background:rgba(87,180,135,.08)}
.md-set .md-opt.no{opacity:.55}
.md-set .md-opt .k{flex:none;width:28px;height:28px;border-radius:50%;border:1px solid var(--ink3);display:grid;place-items:center;font-family:var(--mono, ui-monospace, Menlo, monospace);font-size:12.5px;color:var(--ink2)}
.md-set .md-opt .body{flex:1;min-width:0}
.md-set .md-opt .body svg{display:block}
.md-set .md-opt svg.mol{width:190px;max-width:100%;height:auto}
.md-set .md-actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.md-set .md-verdict{font-family:Georgia,serif;font-size:20px}
.md-set .md-verdict.good{color:var(--goldhi)}
.md-set .md-verdict.notyet{color:var(--ink)}
.md-set .md-why{color:var(--ink2);font-size:15px;line-height:1.6;margin:0;max-width:72ch}
.md-legend{display:flex;gap:16px;flex-wrap:wrap;font-family:var(--mono, ui-monospace, Menlo, monospace);font-size:11.5px;color:var(--ink3);letter-spacing:.03em;margin-top:6px}
.md-legend span{display:inline-flex;align-items:center;gap:6px}
.md-legend svg{width:30px;height:16px}
`;
let _css = false;
export function injectMdCss(){ if (_css || typeof document === 'undefined') return; _css = true; const st = document.createElement('style'); st.id = 'md-style'; st.textContent = MD_CSS; document.head.append(st); }

/** The arrow legend: full arrow, fishhook, lone pair, single electron. */
export function legend(){
  const C = palette();
  const mk = (draw, text) => { const s = S('svg', { viewBox: '0 0 30 16' }); draw(s); return H('span', {}, s, text); };
  const full = arrowGeom({ x: 3, y: 13 }, { x: 27, y: 13 }, -1, false, { minAmp: 7, maxAmp: 7 });
  const fish = arrowGeom({ x: 3, y: 13 }, { x: 27, y: 13 }, -1, true, { minAmp: 7, maxAmp: 7 });
  return H('div', { class: 'md-legend' },
    mk(s => s.append(S('path', { d: full.d, fill: 'none', stroke: C.goldhi, 'stroke-width': 1.7 }), S('path', { d: full.headD, fill: C.goldhi })), 'full head: two electrons move'),
    mk(s => s.append(S('path', { d: fish.d, fill: 'none', stroke: C.goldhi, 'stroke-width': 1.7 }), S('path', { d: fish.headD, fill: C.goldhi })), 'fishhook: one electron moves'),
    mk(s => s.append(S('circle', { cx: 12, cy: 8, r: 2.2, fill: C.blue }), S('circle', { cx: 18, cy: 8, r: 2.2, fill: C.blue })), 'lone pair'),
    mk(s => s.append(S('circle', { cx: 15, cy: 8, r: 2.6, fill: C.amber })), 'single electron (radical)'));
}

/* ================================================================== */
/* The set player: one authored 2026 item at a time, five choices        */
/* ================================================================== */
const LET = 'ABCDE';
/** Render the stem area of an item (figure and reaction row) into a node. Used by the set player and the summit. */
export function renderItemFigure(target, it, o = {}){
  injectMdCss();
  if (it.fig){ const f = H('div', { class: 'md-fig' }); target.append(f); drawFigure(f, it.fig, { width: o.width || target.clientWidth || 640, hideProduct: it.fig.hideProduct, hide: it.fig.hide }); }
  if (it.sub || it.reagent || it.prod){
    const row = H('div', { class: 'md-rxn' });
    if (it.sub){ const b = H('div', {}); drawSmiles(b, it.sub, { width: 240, height: 150, label: 'starting material' }); row.append(b); }
    if (it.reagent) row.append(H('div', { class: 'md-reagent', text: it.reagent }));
    if (it.prod){ const b = H('div', {}); drawSmiles(b, it.prod, { width: 240, height: 150, label: 'product' }); row.append(b); }
    else if (it.sub && it.reagent) row.append(H('div', { class: 'md-q', text: '?' }));
    target.append(row);
  }
}
/** Render one choice body (text, a structure, or a figure). */
export function renderChoiceBody(target, c, i, o = {}){
  if (c.fig){ drawFigure(target, c.fig, { width: o.width || 560, label: 'choice ' + LET[i], noWrap: true }); if (c.text) target.append(H('div', { text: c.text })); }
  else if (c.smiles){ drawSmiles(target, c.smiles, { width: 220, height: 130, label: 'choice ' + LET[i] }); if (c.text) target.append(H('div', { text: c.text })); }
  else target.append(document.createTextNode(c.text));
}

export function mountSet(slot, items, api, o = {}){
  injectMdCss();
  const wrap = H('div', { class: 'md-set' });
  slot.append(wrap);
  if (!items || !items.length){ wrap.append(H('p', { class: 'md-why', text: 'This set is being written.' })); return { next(){} }; }
  const order = api && api.shuffle ? api.shuffle(items.map((_, i) => i)) : items.map((_, i) => i);
  let at = 0, picked = -1, checked = false, first = true, solved = false;
  function render(){
    wrap.textContent = '';
    const it = items[order[at % order.length]];
    wrap.append(H('div', { class: 'md-meta' }, H('span', { text: (o.title || 'Test format') + ' · ' + ((at % order.length) + 1) + ' of ' + order.length }), H('span', { text: it.typeName || '' })));
    wrap.append(H('p', { class: 'md-stem', text: it.stem }));
    renderItemFigure(wrap, it, { width: wrap.clientWidth });
    const kinds = it.choices.some(c => c.fig) ? ' figs' : it.choices.some(c => c.smiles) ? ' structs' : '';
    const opts = H('div', { class: 'md-opts' + kinds, role: 'group', 'aria-label': 'answer choices' });
    it.choices.forEach((c, i) => {
      const cls = 'md-opt' + (picked === i ? ' picked' : '') + (solved && i === it.correct ? ' ok' : '') + (solved && i !== it.correct ? ' no' : '');
      const body = H('span', { class: 'body' });
      const b = H('button', { type: 'button', class: cls, 'aria-pressed': String(picked === i), disabled: solved ? '' : null, onclick: () => { picked = i; checked = false; render(); } }, H('span', { class: 'k', text: LET[i] }), body);
      opts.append(b);
      renderChoiceBody(body, c, i, { width: 520 });
    });
    wrap.append(opts);
    const actions = H('div', { class: 'md-actions' });
    if (!solved){
      actions.append(H('button', { type: 'button', class: 'primary', text: 'Lock it in', disabled: picked < 0 ? '' : null, onclick: commit }));
      if (checked && picked !== it.correct) actions.append(H('span', { class: 'md-verdict notyet', text: 'Not yet.' }));
    } else {
      actions.append(H('span', { class: 'md-verdict good', text: 'You can read it.' }));
      actions.append(H('button', { type: 'button', class: 'primary', text: 'Another one', onclick: next }));
    }
    wrap.append(actions);
    if (solved && it.why) wrap.append(H('p', { class: 'md-why', text: it.why }));
  }
  function commit(){
    const it = items[order[at % order.length]];
    const ok = picked === it.correct;
    if (first){ if (api && api.report) api.report(ok); first = false; }
    checked = true;
    if (ok){ solved = true; if (api && api.clearCoach) api.clearCoach(); }
    else if (api && api.coach) api.coach(it.coach);
    render();
  }
  function next(){ at++; picked = -1; checked = false; first = true; solved = false; if (api && api.clearCoach) api.clearCoach(); render(); }
  render();
  return { next, get index(){ return at; } };
}

// What step k itself makes: the next step's species without the ones that join
// there (adds are listed last), plus whatever leaves the stage after step k.
function madeBy(chain, k){
  if (k === chain.steps.length - 1) return chain.product;
  const nx = chain.steps[k + 1], n = (nx.adds || []).length;
  const kept = nx.species.slice(0, nx.species.length - n);
  const gone = (chain.steps[k].drops || []).map(smi => ({ smi, rad: /^\[(Br|Cl|I)\]$/.test(smi) ? [0] : [] }));
  return kept.concat(gone);
}
/** A step-through stage: show a chain one step at a time with a caption per step. */
export function mountStepper(slot, chains, o = {}){
  injectMdCss();
  const C = palette();
  let cur = chains[0], k = 0;
  const box = H('div', { class: 'md-stepper' });
  const fig = H('div', { class: 'md-fig', style: { border: '1px solid var(--line)', borderRadius: '12px', padding: '10px', background: 'rgba(255,255,255,.02)' } });
  const cap = H('div', { style: { marginTop: '10px', minHeight: '4.4em' } });
  const chips = H('div', { class: 'controls', role: 'group', 'aria-label': 'pick a mechanism', style: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' } });
  const nav = H('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px', alignItems: 'center' } });
  box.append(fig, nav, cap, chips, legend());
  slot.append(box);
  function draw(){
    fig.textContent = '';
    const st = cur.steps[k];
    if (st) drawMech(fig, { species: st.species, arrows: st.arrows, product: madeBy(cur, k), reagent: st.reagent || null }, { width: fig.clientWidth || 640, label: cur.name + ', step ' + (k + 1) });
    cap.textContent = '';
    cap.append(H('div', { style: { fontFamily: 'Georgia, serif', color: C.goldhi, fontSize: '18px' }, text: cur.name + ' · step ' + (k + 1) + ' of ' + cur.steps.length + (st && st.name ? ': ' + st.name : '') }), H('p', { style: { margin: '4px 0 0', color: C.ink2, fontSize: '15px', maxWidth: '72ch', lineHeight: '1.55' }, text: (st && st.say) || '' }));
    nav.textContent = '';
    nav.append(H('button', { type: 'button', class: 'secondary', text: 'Previous step', disabled: k === 0 ? '' : null, onclick: () => { k--; draw(); } }));
    nav.append(H('button', { type: 'button', class: 'primary', text: k === cur.steps.length - 1 ? 'From the top' : 'Next step', onclick: () => { k = k === cur.steps.length - 1 ? 0 : k + 1; draw(); } }));
    chips.textContent = '';
    for (const c of chains) chips.append(H('button', { type: 'button', class: 'chip' + (c === cur ? ' on' : ''), 'aria-pressed': String(c === cur), text: c.chip || c.name, onclick: () => { cur = c; k = 0; draw(); } }));
  }
  draw();
  let lastW = 0;
  if (typeof window !== 'undefined') window.addEventListener('resize', () => { const w = fig.clientWidth; if (w && Math.abs(w - lastW) > 40){ lastW = w; draw(); } });
  return { draw };
}
