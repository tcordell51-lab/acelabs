// The Roots of Organic, level 3, root 5: All four must flip.
//
// Enantiomers, diastereomers, identical, meso. Every R/S label here is
// computed from geometry (Fischer cross converted to coordinates, or a zigzag
// with the wedge depth solved per center), and the relationship is computed by
// counting flips with the symmetric-molecule meso case handled explicitly:
// for a symmetric two-center molecule, R,S and S,R are the same meso compound,
// R,R and S,S are enantiomers, and R,R versus R,S are diastereomers.

export const meta = {
  id: 'l3-isomers',
  level: 3,
  order: 5,
  needs3D: false,
  title: 'All four must flip',
  concept: 'Enantiomers, diastereomers, meso',
  tagline: 'Label every center, then count the flips.',
  story: 'Two drawings, same formula, same connections. How are they related? Label every stereocenter R or S in both molecules, then count the flips. If every center flips, all four must flip, they are mirror images: enantiomers. If some flip and some stay, if 3 flip and 1 remains the same, that is what we call a diastereomer. If none flip, they are identical, even if the drawing looks different. Walk behind me and look at my hands: same hands. Then meso: a molecule with stereocenters and an internal mirror plane. We can fold those over, like a hot dog bun, one half lands on the other, so it is optically inactive even though it has centers. Rule of thumb: R and S every center, then count the flips.',
  moveName: 'R and S every center, then count the flips',
  move: [
    'Label every stereocenter R or S in both drawings. Do the numbers at each one.',
    'Count the flips. All flip: enantiomers, mirror images. Some flip: diastereomers. None flip: identical, even if the drawing looks different.',
    'Symmetric molecule with one R and one S? Fold it like a hot dog bun. The halves land on each other: meso, optically inactive.',
    'Counting stereoisomers is two to the n centers, minus the doubles that meso removes.'
  ],
  trap: 'Careful: Optically inactive does not mean no stereocenters; a meso compound has them, they just cancel across the internal mirror plane.',
  holdsUp: ['Every isomer-relationship question', 'Meso identification', 'Counting stereoisomers, two to the n', 'Tartaric acid and the sugars'],
  drill: 'Booster OChem: Conformations and Stereochemistry'
};

/* ------------------------------------------------------------------ */
/* Geometry and the calibrated R/S math                                 */
/* ------------------------------------------------------------------ */
function vsub(a, b){ return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function vcross(a, b){ return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function vdot(a, b){ return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
// vol < 0 is R, calibrated against butan-2-ol (S); re-checked in selfTest.
function configFromGeometry(pos){ const a = vsub(pos[0], pos[3]), b = vsub(pos[1], pos[3]), c = vsub(pos[2], pos[3]); return vdot(a, vcross(b, c)) < 0 ? 'R' : 'S'; }
function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const flip = c => c === 'R' ? 'S' : 'R';
const eq = (x, y) => x.length === y.length && x.every((v, i) => v === y[i]);

// Each molecule: a chain read left to right (or top to bottom in a Fischer),
// with a substituent X and an implicit H on every stereocenter. `pri` is the
// CIP order at each center over its four neighbours: X, H, L (the neighbour
// toward the first end) and R (toward the last end). Every order below is
// textbook: first atom, then the attached set, then the next sphere.
const MOLS = [
  { id: 'dibromobutane', name: '2,3-dibromobutane', symmetric: true, ends: ['CH3', 'CH3'], X: ['Br', 'Br'],
    pri: [['X', 'R', 'L', 'H'], ['X', 'L', 'R', 'H']] },
  { id: 'tartaric', name: 'tartaric acid', symmetric: true, ends: ['COOH', 'COOH'], X: ['OH', 'OH'],
    pri: [['X', 'L', 'R', 'H'], ['X', 'R', 'L', 'H']] },
  { id: 'butanediol', name: '2,3-butanediol', symmetric: true, ends: ['CH3', 'CH3'], X: ['OH', 'OH'],
    pri: [['X', 'R', 'L', 'H'], ['X', 'L', 'R', 'H']] },
  { id: 'dichloropentane', name: '2,3-dichloropentane', symmetric: false, ends: ['CH3', 'CH2CH3'], X: ['Cl', 'Cl'],
    pri: [['X', 'R', 'L', 'H'], ['X', 'L', 'R', 'H']] },
  { id: 'tribromohexane', name: '2,3,4-tribromohexane', symmetric: false, ends: ['CH3', 'CH2CH3'], X: ['Br', 'Br', 'Br'],
    pri: [['X', 'R', 'L', 'H'], ['X', 'R', 'L', 'H'], ['X', 'L', 'R', 'H']] }
];
const molById = id => MOLS.find(m => m.id === id);

// Fischer: vertical bonds away (-z), horizontal toward (+z). sides[ci] is the
// side ('L' or 'R') the substituent sits on; H takes the other side.
const F_TOP = [0, 0.816, -0.577], F_BOTTOM = [0, -0.816, -0.577], F_LEFT = [-0.816, 0, 0.577], F_RIGHT = [0.816, 0, 0.577];
function fischerConfigs(mol, sides){
  return mol.pri.map((p, ci) => { const vec = { L: F_TOP, R: F_BOTTOM, X: sides[ci] === 'L' ? F_LEFT : F_RIGHT, H: sides[ci] === 'L' ? F_RIGHT : F_LEFT }; return configFromGeometry(p.map(id => vec[id])); });
}

// Zigzag: chain atoms in the page, substituent on a wedge (+1) or dash (-1)
// pointing out from the bend, H on the same 2D direction at the other depth.
function chainPoints(n){ const pts = []; for (let i = 0; i < n + 2; i++) pts.push([i * 62, i % 2 === 0 ? -20 : 20]); return pts; }
function unit2(v){ const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; }
function bisector(pts, i){ const P = pts[i], n1 = unit2([pts[i - 1][0] - P[0], pts[i - 1][1] - P[1]]), n2 = unit2([pts[i + 1][0] - P[0], pts[i + 1][1] - P[1]]); return { n1, n2, b: unit2([-(n1[0] + n2[0]), -(n1[1] + n2[1])]) }; }
function zigzagConfig(mol, ci, d){
  const pts = chainPoints(mol.X.length), i = ci + 1, { n1, n2, b } = bisector(pts, i);
  const vec = { L: [n1[0], n1[1], 0], R: [n2[0], n2[1], 0], X: [b[0] * 0.577, b[1] * 0.577, d * 0.816], H: [b[0] * 0.577, b[1] * 0.577, -d * 0.816] };
  return configFromGeometry(mol.pri[ci].map(id => vec[id]));
}
function solveDepths(mol, target){ return target.map((t, ci) => zigzagConfig(mol, ci, 1) === t ? 1 : -1); }

/* ------------------------------------------------------------------ */
/* The relationship, by counting flips                                  */
/* ------------------------------------------------------------------ */
function relate(mol, a, b){
  const fa = a.map(flip), ra = a.slice().reverse(), rfa = fa.slice().reverse();
  if (mol.symmetric){
    const meso = eq(a, rfa);                     // its own mirror image, read from the other end
    if (eq(b, a) || eq(b, ra)) return meso ? 'meso' : 'identical';
    if (eq(b, fa) || eq(b, rfa)) return 'enantiomers';
    return 'diastereomers';
  }
  if (eq(b, a)) return 'identical';
  if (eq(b, fa)) return 'enantiomers';
  return 'diastereomers';
}
function flips(a, b){ return a.filter((c, i) => c !== b[i]).length; }

const LABEL = { enantiomers: 'Enantiomers, mirror images', diastereomers: 'Diastereomers', identical: 'Identical, the same molecule', meso: 'The same meso compound', constitutional: 'Constitutional isomers' };
function choicesFor(rel){
  const keys = rel === 'meso' ? ['enantiomers', 'diastereomers', 'constitutional', 'meso'] : ['enantiomers', 'diastereomers', 'identical', 'meso'];
  return keys.map(k => ({ key: k, label: LABEL[k], ok: k === rel }));
}
function makeItem(rng){
  const ri = n => Math.floor(rng() * n);
  const mol = MOLS[ri(MOLS.length)], n = mol.X.length;
  const a = Array.from({ length: n }, () => (ri(2) ? 'R' : 'S'));
  const modes = ['same', 'mirror', 'flipone', 'flipone'].concat(mol.symmetric ? ['reverse', 'mirror'] : [], n === 3 ? ['fliptwo'] : []);
  const mode = modes[ri(modes.length)];
  let b;
  if (mode === 'same') b = a.slice();
  else if (mode === 'mirror') b = a.map(flip);
  else if (mode === 'reverse') b = a.slice().reverse();
  else if (mode === 'flipone'){ b = a.slice(); const k = ri(n); b[k] = flip(b[k]); }
  else { b = a.map(flip); const k = ri(n); b[k] = flip(b[k]); }
  const rel = relate(mol, a, b);
  return { molId: mol.id, a, b, rel, depthsA: solveDepths(mol, a), depthsB: solveDepths(mol, b), choices: choicesFor(rel) };
}

/* ------------------------------------------------------------------ */
/* Coaching                                                             */
/* ------------------------------------------------------------------ */
const COUNT = 'Count the flips. All flip, enantiomers. Some flip, diastereomers. None flip, identical.';
function whyMiss(it, key){
  const mol = molById(it.molId), n = it.a.length, k = flips(it.a, it.b);
  if (key === 'constitutional') return 'Same atoms, same connections; only the wedges differ. That is a stereoisomer question: count the flips.';
  if (key === 'meso'){
    if (!mol.symmetric) return 'Meso needs a symmetric molecule with an internal mirror plane. This one has ' + mol.ends[0] + ' on one end and ' + mol.ends[1] + ' on the other, so there is no plane. ' + COUNT;
    return 'Meso needs one R and one S on the symmetric pair, in both drawings. Here ' + k + ' of ' + n + ' flipped. ' + COUNT;
  }
  if (it.rel === 'meso') return 'Every label flipped, but this molecule is symmetric: R,S read from the other end is S,R. Fold it like a hot dog bun. It is the same meso compound.';
  if (it.rel === 'enantiomers') return 'Every center flipped, all ' + n + ' of them. All flip means mirror images: enantiomers.';
  if (it.rel === 'diastereomers') return 'Only ' + k + ' of ' + n + ' flipped. Some flip and some stay, that is what we call a diastereomer.';
  return 'No label flipped, so it is the same molecule even if the drawing looks different. Walk behind me and look at my hands.';
}

/* ------------------------------------------------------------------ */
/* Labels with real subscripts                                          */
/* ------------------------------------------------------------------ */
function runs(label){ return String(label).split(/(\d+)/).filter(Boolean).map(r => ({ t: r, sub: /^\d+$/.test(r) })); }
function svgLabel(api, label, x, y, anchor, size, fill, attrs){
  const t = api.svg('text', Object.assign({ x, y, 'text-anchor': anchor, 'font-family': 'Georgia, serif', 'font-weight': 600, 'font-size': size, fill }, attrs || {}));
  let up = 0;
  for (const r of runs(label)){ if (r.sub){ t.append(api.svg('tspan', { dy: size * 0.28, 'font-size': size * 0.66 }, r.t)); up = -size * 0.28; } else { t.append(api.svg('tspan', up ? { dy: up } : {}, r.t)); up = 0; } }
  return t;
}
function htmlLabel(api, label){ const s = api.el('span', {}); for (const r of runs(label)) s.append(r.sub ? api.el('sub', { text: r.t }) : r.t); return s; }

/* ------------------------------------------------------------------ */
/* The Fischer pair (visual)                                            */
/* ------------------------------------------------------------------ */
const YS = [62, 150, 250, 338], ARM = 66, MID = 200;
function fischerLayout(mol, sides, cx){
  const configs = fischerConfigs(mol, sides);
  const centers = mol.X.map((x, ci) => { const y = YS[ci + 1], left = sides[ci] === 'L'; return { x: cx, y, n: ci + 2, config: configs[ci], xg: { label: x, x: cx + (left ? -ARM : ARM) }, hg: { label: 'H', x: cx + (left ? ARM : -ARM) } }; });
  return { cx, mol, sides, centers, configs };
}
function renderFischer(api, L, opts){
  opts = opts || {};
  const g = api.svg('g', { class: opts.cls || '' });
  const ink = api.colors.ink, ink2 = api.colors.ink2, gold = api.colors.goldhi, ink3 = api.colors.ink3;
  g.append(api.svg('line', { x1: L.cx, y1: YS[0] + 14, x2: L.cx, y2: YS[3] - 14, stroke: ink2, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
  g.append(svgLabel(api, L.mol.ends[0], L.cx, YS[0] + 6, 'middle', 19, ink));
  g.append(svgLabel(api, L.mol.ends[1], L.cx, YS[3] + 6, 'middle', 19, ink));
  for (const c of L.centers){
    g.append(api.svg('line', { x1: c.x - ARM + 16, y1: c.y, x2: c.x + ARM - 16, y2: c.y, stroke: ink2, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
    const xl = svgLabel(api, c.xg.label, c.xg.x, c.y + 6, 'middle', 19, ink); xl.dataset.role = 'X'; xl.dataset.n = String(c.n); g.append(xl);
    const hl = svgLabel(api, 'H', c.hg.x, c.y + 6, 'middle', 19, ink); hl.dataset.role = 'H'; hl.dataset.n = String(c.n); g.append(hl);
    g.append(api.svg('text', { x: c.x + 12, y: c.y - 12, 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': 10, fill: ink3 }, 'C' + c.n));
    g.append(api.svg('text', { x: c.x + 30, y: c.y - 10, 'font-family': 'Georgia, serif', 'font-style': 'italic', 'font-weight': 700, 'font-size': 19, fill: gold, class: opts.flash ? 'l3i-flash' : '' }, c.config));
  }
  return g;
}
function easeInOut(k){ return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }

/* ------------------------------------------------------------------ */
/* The zigzag pair (you try)                                            */
/* ------------------------------------------------------------------ */
function drawZigzag(api, g, mol, configs, depths, cxMid, oy, tag){
  const ink = api.colors.ink, ink2 = api.colors.ink2, gold = api.colors.goldhi, ink3 = api.colors.ink3;
  const pts = chainPoints(mol.X.length), width = pts[pts.length - 1][0], ox = cxMid - width / 2;
  const P = p => [ox + p[0], oy - p[1]];
  for (let i = 0; i < pts.length - 1; i++){ const a = P(pts[i]), b = P(pts[i + 1]); g.append(api.svg('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: ink2, 'stroke-width': 2.6, 'stroke-linecap': 'round' })); }
  const e0 = P(pts[0]), e1 = P(pts[pts.length - 1]);
  g.append(svgLabel(api, mol.ends[0], e0[0] - 9, e0[1] + 6, 'end', 17, ink));
  g.append(svgLabel(api, mol.ends[1], e1[0] + 9, e1[1] + 6, 'start', 17, ink));
  mol.X.forEach((x, ci) => {
    const i = ci + 1, { b } = bisector(pts, i), C = P(pts[i]);
    const bs = [b[0], -b[1]], ex = C[0] + bs[0] * 36, ey = C[1] + bs[1] * 36, px = -bs[1], py = bs[0];
    if (depths[ci] > 0) g.append(api.svg('polygon', { points: `${C[0]},${C[1]} ${(ex + px * 6).toFixed(1)},${(ey + py * 6).toFixed(1)} ${(ex - px * 6).toFixed(1)},${(ey - py * 6).toFixed(1)}`, fill: ink }));
    else for (let t = 0.2; t <= 1.001; t += 0.16){ const w = 1.5 + t * 5.5, X = C[0] + (ex - C[0]) * t, Y = C[1] + (ey - C[1]) * t; g.append(api.svg('line', { x1: (X + px * w).toFixed(1), y1: (Y + py * w).toFixed(1), x2: (X - px * w).toFixed(1), y2: (Y - py * w).toFixed(1), stroke: ink, 'stroke-width': 2.2, 'stroke-linecap': 'round' })); }
    g.append(svgLabel(api, x, ex + bs[0] * 16, ey + bs[1] * 16 + 6, 'middle', 17, ink));
    const lx = C[0] - bs[0] * 26, ly = C[1] - bs[1] * 26 + 6;
    g.append(api.svg('text', { x: lx - 9, y: ly - 1, 'text-anchor': 'end', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': 10, fill: ink3 }, String(ci + 2)));
    g.append(api.svg('text', { x: lx - 5, y: ly, 'text-anchor': 'start', 'font-family': 'Georgia, serif', 'font-style': 'italic', 'font-weight': 700, 'font-size': 19, fill: gold }, configs[ci]));
  });
  g.append(api.svg('text', { x: cxMid, y: 22, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': 11, 'letter-spacing': 2, fill: ink3 }, tag));
}
function drawPair(api, it){
  const mol = molById(it.molId);
  const s = api.svg('svg', { viewBox: '0 0 900 236', role: 'img', 'aria-label': 'Two drawings of ' + mol.name + ' with R and S labels at every stereocenter' });
  const g = api.svg('g', {}); s.append(g);
  drawZigzag(api, g, mol, it.a, it.depthsA, 225, 130, 'MOLECULE A');
  drawZigzag(api, g, mol, it.b, it.depthsB, 675, 130, 'MOLECULE B');
  s.append(api.svg('line', { x1: 450, y1: 40, x2: 450, y2: 216, stroke: api.colors.line, 'stroke-width': 1 }));
  return s;
}

/* ------------------------------------------------------------------ */
/* Styles                                                               */
/* ------------------------------------------------------------------ */
const CSS = `
.l3i-wrap{position:relative;background:radial-gradient(60% 80% at 50% 45%,rgba(201,168,76,.06),transparent 70%);border-radius:10px}
.l3i-wrap svg{width:100%;height:auto}
.l3i-cap{color:var(--ink2);font-size:15px;margin:10px 0 0;min-height:1.5em}
.l3i-cap b{color:var(--goldhi);font-weight:600}
.l3i-row{margin-top:8px}
.l3i-fig{margin:0 0 6px;background:radial-gradient(60% 80% at 50% 45%,rgba(201,168,76,.05),transparent 70%)}
.l3i-fig svg{width:100%;height:auto;max-height:260px}
.l3i-sub{color:var(--ink3);font-size:14px;margin:-6px 0 8px}
@keyframes l3iFlash{0%{opacity:0;transform:scale(1.9)}55%{opacity:1;transform:scale(1.2)}100%{opacity:1;transform:scale(1)}}
.l3i-flash{animation:l3iFlash .8s ease-out both;transform-box:fill-box;transform-origin:center}
.l3i-fade{transition:opacity .4s}
`;

/* ------------------------------------------------------------------ */
/* mount                                                                */
/* ------------------------------------------------------------------ */
export function mount(slots, api){
  slots.visual.append(api.el('style', { text: CSS }));
  const wrap = api.el('div', { class: 'l3i-wrap' });
  const svg = api.svg('svg', { viewBox: '0 0 900 410', role: 'img', 'aria-label': 'Two Fischer projections side by side with R and S at every center' });
  wrap.append(svg);
  const rowEx = api.el('div', { class: 'controls l3i-row' }), rowStart = api.el('div', { class: 'controls l3i-row' }), rowDo = api.el('div', { class: 'controls l3i-row' });
  const caption = api.el('p', { class: 'l3i-cap' });
  slots.visual.append(wrap, rowEx, rowStart, rowDo, caption);

  const V = { mol: molById('dibromobutane'), left: ['L', 'L'], right: ['L', 'L'], busy: false, mode: 'same' };
  const LX = 235, RX = 665;
  let gLeft = null, gRight = null, mirrorLine = null, foldLayer = null, headline = null;
  function setCaption(parts){ caption.replaceChildren(...parts.map(p => typeof p === 'string' ? p : (p.lab != null ? api.el('b', {}, htmlLabel(api, p.lab)) : api.el('b', { text: p.b })))); }
  function verdictText(rel){ return rel === 'meso' ? 'the same meso compound' : (rel === 'identical' ? 'identical' : rel); }
  function draw(opts){
    opts = opts || {};
    svg.replaceChildren();
    gLeft = renderFischer(api, fischerLayout(V.mol, V.left, LX), { flash: !!opts.flashLeft });
    gRight = renderFischer(api, fischerLayout(V.mol, V.right, RX), { flash: !!opts.flashRight });
    mirrorLine = api.svg('g', { class: 'l3i-fade', style: { opacity: V.mode === 'mirror' ? '1' : '0' } },
      api.svg('line', { x1: 450, y1: 34, x2: 450, y2: 356, stroke: api.colors.gold, 'stroke-width': 1.5, 'stroke-dasharray': '6 6' }),
      api.svg('text', { x: 450, y: 22, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': 11, 'letter-spacing': 2, fill: api.colors.gold }, 'MIRROR'));
    foldLayer = api.svg('g', {});
    const rel = relate(V.mol, fischerConfigs(V.mol, V.left), fischerConfigs(V.mol, V.right));
    headline = api.svg('text', { x: 450, y: 396, 'text-anchor': 'middle', 'font-family': 'Georgia, serif', 'font-size': 24, fill: api.colors.goldhi }, verdictText(rel));
    svg.append(api.svg('text', { x: LX, y: 22, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': 11, 'letter-spacing': 2, fill: api.colors.ink3 }, 'LEFT'),
      api.svg('text', { x: RX, y: 22, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': 11, 'letter-spacing': 2, fill: api.colors.ink3 }, 'RIGHT'),
      gLeft, gRight, mirrorLine, foldLayer, headline);
    return rel;
  }
  function tween(ms, fn, done){ if (api.reduced){ fn(1); done && done(); return; } const t0 = performance.now(); const go = () => { const k = Math.min(1, (performance.now() - t0) / ms); fn(easeInOut(k)); if (k < 1) requestAnimationFrame(go); else done && done(); }; requestAnimationFrame(go); }
  function chip(label, fn, pressed){ return api.el('button', { type: 'button', class: 'chip', 'aria-pressed': pressed == null ? null : String(pressed), onclick: fn }, label); }
  const exChips = ['dibromobutane', 'tartaric', 'dichloropentane'].map(id => chip(molById(id).name, () => loadMol(id), id === V.mol.id));
  rowEx.append(api.el('span', { class: 'eyebrow', text: 'Example' }), ...exChips);
  const chipMeso = chip('Start meso', () => { V.left = ['L', 'L']; V.right = V.left.slice(); V.mode = 'same'; refresh(); }, true);
  const chipChiral = chip('Start chiral', () => { V.left = ['L', 'R']; V.right = V.left.slice(); V.mode = 'same'; refresh(); }, false);
  rowStart.append(api.el('span', { class: 'eyebrow', text: 'Left molecule' }), chipMeso, chipChiral);
  const chipMirror = chip('Mirror', mirror), chipFlip = chip('Flip one center', flipOne), chipSame = chip('Same drawing', () => { V.right = V.left.slice(); V.mode = 'same'; refresh(); }), chipFold = chip('Fold', fold);
  rowDo.append(api.el('span', { class: 'eyebrow', text: 'Do' }), chipMirror, chipFlip, chipSame, chipFold);

  function loadMol(id){
    V.mol = molById(id); V.left = ['L', 'L']; V.right = ['L', 'L']; V.mode = 'same';
    exChips.forEach((c, i) => c.setAttribute('aria-pressed', String(['dibromobutane', 'tartaric', 'dichloropentane'][i] === id)));
    rowStart.style.display = V.mol.symmetric ? '' : 'none';
    refresh();
  }
  function refresh(){
    chipMeso.setAttribute('aria-pressed', String(V.left[0] === V.left[1])); chipChiral.setAttribute('aria-pressed', String(V.left[0] !== V.left[1]));
    const rel = draw();
    const cf = fischerConfigs(V.mol, V.left);
    const lab = cf.join(',');
    if (V.mode === 'same'){
      if (V.mol.symmetric && rel === 'meso') setCaption(['Left is ', { b: lab }, ' with both ', { lab: V.mol.X[0] }, ' groups on the same side: that is the meso form of ', V.mol.name, '. Right is the same drawing, nothing flipped. Press Mirror, or Fold.']);
      else if (V.mol.symmetric) setCaption(['Left is ', { b: lab }, ' with the ', { lab: V.mol.X[0] }, ' groups on opposite sides: the chiral form. Right is the same drawing, nothing flipped. Press Mirror to see its enantiomer, or Fold to see the halves miss.']);
      else setCaption(['Left is ', { b: lab }, '. ', V.mol.name, ' has ', { lab: V.mol.ends[0] }, ' on one end and ', { lab: V.mol.ends[1] }, ' on the other, so it can never be meso. Right is the same drawing, nothing flipped.']);
    }
  }
  function mirror(){
    if (V.busy) return; V.busy = true; V.mode = 'mirror';
    const before = fischerConfigs(V.mol, V.right);
    const target = V.left.map(s => s === 'L' ? 'R' : 'L');
    mirrorLine.style.opacity = '1';
    // glide the right molecule's horizontal groups across their center
    const L0 = fischerLayout(V.mol, V.right, RX), L1 = fischerLayout(V.mol, target, RX);
    const nodes = [...gRight.querySelectorAll('text[data-role]')];
    tween(800, k => {
      for (const t of nodes){ const n = Number(t.dataset.n), role = t.dataset.role, c0 = L0.centers[n - 2], c1 = L1.centers[n - 2]; const x0 = role === 'X' ? c0.xg.x : c0.hg.x, x1 = role === 'X' ? c1.xg.x : c1.hg.x; t.setAttribute('x', (x0 + (x1 - x0) * k).toFixed(1)); }
    }, () => {
      V.right = target; V.busy = false;
      const rel = draw({ flashRight: true }); const after = fischerConfigs(V.mol, V.right);
      const n = after.length;
      if (rel === 'meso') setCaption(['Every label flipped, ', { b: before.join(',') }, ' became ', { b: after.join(',') }, '. But walk around it: read from the other end it is ', { b: before.join(',') }, ' again. Same molecule: ', { b: 'the same meso compound' }, '. Its mirror image is itself.']);
      else setCaption(['Every label flipped, ', { b: before.join(',') }, ' became ', { b: after.join(',') }, '. All ', String(n), ' flipped, all four must flip: mirror images that do not match, ', { b: 'enantiomers' }, '.']);
    });
  }
  function flipOne(){
    if (V.busy) return; V.busy = true; V.mode = 'flipone';
    const before = fischerConfigs(V.mol, V.right);
    const target = V.left.slice(); target[1] = target[1] === 'L' ? 'R' : 'L';
    const L0 = fischerLayout(V.mol, V.right, RX), L1 = fischerLayout(V.mol, target, RX);
    const nodes = [...gRight.querySelectorAll('text[data-role]')].filter(t => t.dataset.n === '3');
    tween(700, k => { for (const t of nodes){ const c0 = L0.centers[1], c1 = L1.centers[1]; const x0 = t.dataset.role === 'X' ? c0.xg.x : c0.hg.x, x1 = t.dataset.role === 'X' ? c1.xg.x : c1.hg.x; t.setAttribute('x', (x0 + (x1 - x0) * k).toFixed(1)); } }, () => {
      V.right = target; V.busy = false;
      const rel = draw({ flashRight: true }); const after = fischerConfigs(V.mol, V.right), k = flips(fischerConfigs(V.mol, V.left), after);
      if (rel === 'diastereomers') setCaption(['Swapped the two groups on C3 only: ', { b: before.join(',') }, ' became ', { b: after.join(',') }, '. ', String(k), ' flipped and ', String(after.length - k), ' stayed. If 3 flip and 1 remains the same, that is what we call a ', { b: 'diastereomer' }, '. Same here with 1 and 1.']);
      else setCaption(['Swapped the two groups on C3: ', { b: before.join(',') }, ' became ', { b: after.join(',') }, '. Relationship: ', { b: verdictText(rel) }, '.']);
    });
  }
  function fold(){
    if (V.busy) return; V.busy = true; V.mode = 'fold';
    const L = fischerLayout(V.mol, V.left, LX);
    const ink = api.colors.ink, gold = api.colors.goldhi, amber = api.colors.amber;
    foldLayer.replaceChildren();
    foldLayer.append(api.svg('line', { x1: LX - 120, y1: MID, x2: LX + 120, y2: MID, stroke: api.colors.gold, 'stroke-width': 1.5, 'stroke-dasharray': '6 6' }),
      api.svg('text', { x: LX + 126, y: MID + 4, 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': 11, 'letter-spacing': 2, fill: api.colors.gold }, 'FOLD'));
    const ghost = api.svg('g', { opacity: 0.9 }); foldLayer.append(ghost);
    const c2 = L.centers[0], c3 = L.centers[1];
    const topNodes = [...gLeft.querySelectorAll('text')].filter(t => Number(t.getAttribute('y')) < MID).concat([...gLeft.querySelectorAll('line')].filter(l => Number(l.getAttribute('y1')) < MID && Number(l.getAttribute('y2')) < MID));
    const y = (y0, k) => MID + (y0 - MID) * Math.cos(Math.PI * k);
    tween(1000, k => {
      ghost.replaceChildren();
      const ya = y(YS[0], k), yb = y(c2.y, k), sq = Math.abs(Math.cos(Math.PI * k));
      ghost.append(api.svg('line', { x1: LX, y1: ya + 14 * sq, x2: LX, y2: MID, stroke: gold, 'stroke-width': 2, 'stroke-linecap': 'round' }));
      ghost.append(api.svg('line', { x1: LX - ARM + 16, y1: yb, x2: LX + ARM - 16, y2: yb, stroke: gold, 'stroke-width': 2, 'stroke-linecap': 'round' }));
      ghost.append(svgLabel(api, V.mol.ends[0], LX, ya + 6, 'middle', 19, gold));
      ghost.append(svgLabel(api, c2.xg.label, c2.xg.x, yb + 6, 'middle', 19, gold));
      ghost.append(svgLabel(api, 'H', c2.hg.x, yb + 6, 'middle', 19, gold));
      for (const t of topNodes) t.setAttribute('opacity', String(1 - 0.6 * k));
    }, () => {
      V.busy = false;
      const endsMatch = V.mol.ends[0] === V.mol.ends[1], sideMatch = V.left[0] === V.left[1];
      const halo = (x, yy, ok) => api.svg('circle', { cx: x, cy: yy, r: 22, fill: 'none', stroke: ok ? gold : amber, 'stroke-width': 2, opacity: 0.9 });
      foldLayer.append(halo(LX, YS[3], endsMatch), halo(c2.xg.x, c3.y, sideMatch), halo(c2.hg.x, c3.y, sideMatch));
      if (endsMatch && sideMatch){ headline.textContent = 'meso: the halves match'; setCaption(['Folded like a hot dog bun: ', { lab: V.mol.ends[0] }, ' lands on ', { lab: V.mol.ends[1] }, ', ', { lab: V.mol.X[0] }, ' lands on ', { lab: V.mol.X[1] }, ', H on H. An internal mirror plane, so the two centers cancel: ', { b: 'meso, optically inactive' }, ', even though it has stereocenters.']); }
      else if (!endsMatch){ headline.textContent = 'no internal mirror plane'; setCaption(['Folded: ', { lab: V.mol.ends[0] }, ' lands on ', { lab: V.mol.ends[1] }, '. The ends differ, so the halves can never match. ', { b: 'No meso here' }, '; every stereoisomer of this molecule is chiral.']); }
      else { headline.textContent = 'no internal mirror plane'; setCaption(['Folded: the ', { lab: V.mol.X[0] }, ' groups land on opposite sides. The halves do not match, no internal mirror plane, so this form is ', { b: 'chiral' }, '. Press Start meso to fold the one that works.']); }
      void ink;
    });
  }
  loadMol('dibromobutane');

  /* ---------------- you try ---------------- */
  const host = slots.try;
  let cur = null;
  function next(){ cur = { it: makeItem(api.rng), done: false, misses: 0 }; render(); }
  function render(){
    api.clearCoach(); host.replaceChildren();
    const it = cur.it, mol = molById(it.molId), box = api.el('div', { class: 'item' });
    box.append(api.el('p', { class: 'prompt', text: 'How are these two related?' }));
    box.append(api.el('p', { class: 'l3i-sub' }, 'Both drawings are ', mol.name, '. The R and S labels are given; count the flips.'));
    box.append(api.el('div', { class: 'l3i-fig' }, drawPair(api, it)));
    const grid = api.el('div', { class: 'opts' }), verdict = api.el('div', { class: 'verdict' }), after = api.el('div', { class: 'controls' });
    it.choices.forEach((o, i) => { const b = api.el('button', { type: 'button', class: 'opt', onclick: () => choose(b, o) }, api.el('span', { class: 'k', text: 'ABCD'[i] }), api.el('span', { text: o.label })); grid.append(b); });
    function choose(btn, o){
      if (cur.done) return; btn.classList.add('picked');
      if (o.ok){
        cur.done = true; btn.classList.add('ok'); for (const b of grid.querySelectorAll('button')) b.disabled = true;
        verdict.className = 'verdict good'; verdict.textContent = 'You can read it.';
        if (cur.misses === 0) api.report(true); api.clearCoach();
        after.append(api.el('button', { type: 'button', class: 'primary', onclick: next }, 'Another one'));
      } else {
        cur.misses++; if (cur.misses === 1) api.report(false);
        btn.disabled = true; verdict.className = 'verdict notyet'; verdict.textContent = 'Not yet.'; api.coach(whyMiss(it, o.key));
      }
    }
    box.append(grid, verdict, after); host.append(box);
  }
  next();
}

/* ------------------------------------------------------------------ */
/* selfTest: node-safe                                                  */
/* ------------------------------------------------------------------ */
export function selfTest(){
  const notes = []; const fail = m => notes.push(m);
  // calibration: butan-2-ol (CH3 left, CH2CH3 right, OH dash up, H wedge down) is S
  if (configFromGeometry([[0, 0.577, -0.816], [0.816, -0.577, 0], [-0.816, -0.577, 0], [0, 0.577, 0.816]]) !== 'S') fail('calibration: butan-2-ol must be S');
  // meso-2,3-dibromobutane in a Fischer (both Br on the same side) is (2R,3S); Br on opposite sides is (R,R) or (S,S)
  const dbb = molById('dibromobutane');
  const mesoLL = fischerConfigs(dbb, ['L', 'L']); if (mesoLL.join('') !== 'RS' && mesoLL.join('') !== 'SR') fail('meso dibromobutane must read R,S, got ' + mesoLL.join(''));
  const chiLR = fischerConfigs(dbb, ['L', 'R']); if (chiLR[0] !== chiLR[1]) fail('dibromobutane with Br on opposite sides must be R,R or S,S');
  // tartaric acid: the atom says (2R,3S) is meso and (2R,3R) is chiral
  const tar = molById('tartaric');
  const tLL = fischerConfigs(tar, ['L', 'L']); if (tLL[0] === tLL[1]) fail('tartaric acid with OH on the same side must be meso (R,S)');
  const tLR = fischerConfigs(tar, ['L', 'R']); if (tLR[0] !== tLR[1]) fail('tartaric acid with OH on opposite sides must be R,R or S,S');
  // mirroring every center (swap sides at every center) flips every label
  for (const mol of MOLS) for (let mask = 0; mask < (1 << mol.X.length); mask++){
    const sides = mol.X.map((_, i) => (mask >> i) & 1 ? 'R' : 'L'), m = sides.map(s => s === 'L' ? 'R' : 'L');
    const c = fischerConfigs(mol, sides), cm = fischerConfigs(mol, m);
    if (!eq(cm, c.map(flip))) fail(mol.id + ': mirror must flip every center');
    // zigzag: the solved depths reproduce the labels, and the other depth flips
    const d = solveDepths(mol, c);
    c.forEach((t, ci) => { if (zigzagConfig(mol, ci, d[ci]) !== t) fail(mol.id + ': solved depth wrong'); if (zigzagConfig(mol, ci, -d[ci]) !== flip(t)) fail(mol.id + ': flipping the wedge must flip the center'); });
  }
  // the classifier on its whole domain
  for (const mol of MOLS){
    const n = mol.X.length, all = [];
    for (let mask = 0; mask < (1 << n); mask++) all.push(Array.from({ length: n }, (_, i) => (mask >> i) & 1 ? 'S' : 'R'));
    for (const a of all) for (const b of all){
      const r = relate(mol, a, b), r2 = relate(mol, b, a);
      if (r !== r2) fail(mol.id + ': relation must be symmetric ' + a + ' ' + b);
      if (eq(a, b) && r !== 'identical' && r !== 'meso') fail(mol.id + ': same labels must be identical or meso');
      if (eq(b, a.map(flip)) && r !== 'enantiomers' && r !== 'meso') fail(mol.id + ': all flipped must be enantiomers or meso');
      if (r === 'meso' && !mol.symmetric) fail(mol.id + ': meso needs symmetry');
      if (r === 'meso' && !(eq(a, a.map(flip).reverse()) && eq(b, b.map(flip).reverse()))) fail(mol.id + ': meso pair must both be meso forms');
      if (!mol.symmetric){ const k = flips(a, b); if ((k === 0) !== (r === 'identical') || (k === n) !== (r === 'enantiomers') || (k > 0 && k < n) !== (r === 'diastereomers')) fail(mol.id + ': flip count rule'); }
    }
    if (mol.symmetric && n === 2){
      if (relate(mol, ['R', 'S'], ['S', 'R']) !== 'meso') fail(mol.id + ': R,S vs S,R must be the same meso compound');
      if (relate(mol, ['R', 'R'], ['S', 'S']) !== 'enantiomers') fail(mol.id + ': R,R vs S,S must be enantiomers');
      if (relate(mol, ['R', 'R'], ['R', 'S']) !== 'diastereomers') fail(mol.id + ': R,R vs R,S must be diastereomers');
      if (relate(mol, ['R', 'R'], ['R', 'R']) !== 'identical') fail(mol.id + ': R,R vs R,R must be identical');
    }
  }
  // generated items: unique answer, reproducible, drawings honest, every relation occurs
  let tried = 0; const seen = {};
  for (let seed = 1; seed <= 240; seed++){
    const it = makeItem(mulberry32(seed)), mol = molById(it.molId); tried++;
    seen[it.rel] = (seen[it.rel] || 0) + 1;
    if (it.choices.filter(c => c.ok).length !== 1) fail('seed ' + seed + ': answer not unique');
    if (!it.choices.some(c => c.key === it.rel)) fail('seed ' + seed + ': answer missing');
    it.a.forEach((t, ci) => { if (zigzagConfig(mol, ci, it.depthsA[ci]) !== t) fail('seed ' + seed + ': drawing A disagrees with its labels'); });
    it.b.forEach((t, ci) => { if (zigzagConfig(mol, ci, it.depthsB[ci]) !== t) fail('seed ' + seed + ': drawing B disagrees with its labels'); });
    if (JSON.stringify(makeItem(mulberry32(seed))) !== JSON.stringify(it)) fail('seed ' + seed + ': not reproducible');
  }
  for (const k of ['enantiomers', 'diastereomers', 'identical', 'meso']) if (!seen[k]) fail('relation never generated: ' + k);
  return { ok: notes.length === 0, tried, notes: notes.join('; ') || ('calibration S ok, meso R,S ok, ' + Object.entries(seen).map(([k, v]) => v + ' ' + k).join(', ')) };
}
