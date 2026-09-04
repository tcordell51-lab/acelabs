// The Roots of Organic, Level 2, Root 4: The stability staircase.
// Carbocation stability: neighbors and blankets. No imports (contract).

export const meta = {
  id: 'l2-carbocation',
  level: 2,
  order: 4,
  needs3D: false,
  title: 'The stability staircase',
  concept: 'Carbocation stability',
  tagline: 'One ranking quietly runs half of organic chemistry.',
  story: 'A carbocation holds a positive charge like a hot potato, and two things make it bearable: neighbors and blankets. Neighbors first. Every carbon attached to the charged carbon leans in and donates a little density through its C-H bonds, that is hyperconjugation, so tertiary beats secondary beats primary beats methyl. Count the carbon neighbors, that is your first ranking. But resonance is the blanket, and resonance wins. A charge next to a double bond (allylic) or next to a ring (benzylic) does not live on one carbon, it spreads, and a charge split among roommates hurts nobody. Tertiary benzylic stacks both and sits at the very top. One more thing, and this one is poison: we never want a radical or carbocation touching a double bond. Vinylic goes at the very bottom.',
  moveName: 'Count neighbors, then check for resonance',
  move: [
    'Find the carbon wearing the plus.',
    'Count its carbon neighbors: three beats two beats one beats zero.',
    'Is the plus NEXT TO a double bond or a ring? Allylic or benzylic. Resonance wins over the count.',
    'Is the plus ON a double-bond carbon? Vinylic. Bottom of the stairs, no matter what.'
  ],
  trap: 'Careful: a secondary allylic or benzylic cation beats a plain tertiary, because resonance is the blanket and the blanket beats the neighbor count.',
  holdsUp: ['SN1 speed', 'Where Markovnikov puts the charge', 'Rearrangements', 'Radical halogenation site', 'EAS'],
  drill: 'Booster OChem: The Fundamentals'
};


// ---------- catalog ----------
// Every cation is a small bond graph in a 200 by 130 frame. pts are carbons, bonds are [i, j, order, aromatic?].
// The rank is COMPUTED from the graph (see classify), never typed in, so a drawing and its answer cannot disagree.
function ringPts(cx, cy, R, rot){
  const a = [];
  for (let k = 0; k < 6; k++){ const t = (rot + k * 60) * Math.PI / 180; a.push([+(cx + R * Math.cos(t)).toFixed(1), +(cy - R * Math.sin(t)).toFixed(1)]); }
  return a;
}
function ringBonds(arom, dbl){ const b = []; for (let k = 0; k < 6; k++) b.push([k, (k + 1) % 6, dbl && dbl.some(d => d[0] === k && d[1] === (k + 1) % 6) ? 2 : 1, !!arom]); return b; }
const zig = (n, y0, y1, x0, dx) => Array.from({ length: n }, (_, i) => [x0 + i * dx, i % 2 === 0 ? y0 : y1]);
const chain = n => Array.from({ length: n - 1 }, (_, i) => [i, i + 1, 1]);

export const CATALOG = [
  { id: 'methyl', name: 'methyl cation', pts: [[100, 66]], bonds: [], plus: 0, label: 'CH3' },
  { id: 'ethyl', name: 'ethyl cation', pts: [[55, 82], [145, 46]], bonds: [[0, 1, 1]], plus: 1 },
  { id: 'propyl', name: 'propyl cation', pts: zig(3, 82, 46, 35, 65), bonds: chain(3), plus: 2 },
  { id: 'isopropyl', name: 'isopropyl cation', pts: zig(3, 82, 46, 35, 65), bonds: chain(3), plus: 1 },
  { id: 'secbutyl', name: 'sec-butyl cation', pts: zig(4, 86, 50, 25, 55), bonds: chain(4), plus: 1 },
  { id: 'cyclohexyl', name: 'cyclohexyl cation', pts: ringPts(100, 68, 36, 0), bonds: ringBonds(false), plus: 1 },
  { id: 'cyclopentyl', name: 'cyclopentyl cation', pts: [[100, 32], [136, 58], [122, 100], [78, 100], [64, 58]], bonds: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1], [4, 0, 1]], plus: 0 },
  { id: 'tbutyl', name: 'tert-butyl cation', pts: [[100, 66], [100, 22], [62, 88], [138, 88]], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]], plus: 0 },
  { id: 'methylbutyl', name: '2-methylbutan-2-yl cation', pts: [[30, 90], [85, 56], [140, 90], [195, 56], [85, 14]], bonds: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [1, 4, 1]], plus: 1 },
  { id: 'methylcyclohexyl', name: '1-methylcyclohexyl cation', pts: ringPts(100, 82, 32, 90).concat([[100, 14]]), bonds: ringBonds(false).concat([[0, 6, 1]]), plus: 0 },
  { id: 'vinyl', name: 'vinyl cation', pts: [[50, 82], [140, 46]], bonds: [[0, 1, 2]], plus: 1 },
  { id: 'propenyl', name: 'prop-1-en-2-yl cation', pts: zig(3, 82, 46, 35, 65), bonds: [[0, 1, 2], [1, 2, 1]], plus: 1 },
  { id: 'cyclohexenyl', name: 'cyclohexenyl cation', pts: ringPts(100, 68, 36, 0), bonds: ringBonds(false, [[0, 1]]), plus: 0 },
  { id: 'allyl', name: 'allyl cation', pts: zig(3, 82, 46, 35, 65), bonds: [[0, 1, 2], [1, 2, 1]], plus: 2 },
  { id: 'methylallyl', name: 'but-3-en-2-yl cation (secondary allylic)', pts: zig(4, 86, 50, 25, 55), bonds: [[0, 1, 2], [1, 2, 1], [2, 3, 1]], plus: 2 },
  { id: 'dimethylallyl', name: '2-methylbut-3-en-2-yl cation (tertiary allylic)', pts: zig(4, 76, 40, 25, 55).concat([[135, 118]]), bonds: [[0, 1, 2], [1, 2, 1], [2, 3, 1], [2, 4, 1]], plus: 2 },
  { id: 'benzyl', name: 'benzyl cation', pts: ringPts(62, 70, 32, 0).concat([[146, 70]]), bonds: ringBonds(true).concat([[0, 6, 1]]), plus: 6 },
  { id: 'phenylethyl', name: '1-phenylethyl cation (secondary benzylic)', pts: ringPts(62, 70, 32, 0).concat([[146, 70], [190, 44]]), bonds: ringBonds(true).concat([[0, 6, 1], [6, 7, 1]]), plus: 6 },
  { id: 'cumyl', name: '2-phenylpropan-2-yl cation (tertiary benzylic)', pts: ringPts(62, 70, 32, 0).concat([[146, 70], [186, 44], [186, 96]]), bonds: ringBonds(true).concat([[0, 6, 1], [6, 7, 1], [6, 8, 1]]), plus: 6 }
];

// Read the graph: neighbors, vinylic, allylic, benzylic, and the rank.
export function classify(t){
  const p = t.plus;
  const mine = t.bonds.filter(b => b[0] === p || b[1] === p);
  const nbrs = mine.map(b => b[0] === p ? b[1] : b[0]);
  const vinylic = mine.some(b => b[2] === 2);
  const allylic = !vinylic && nbrs.some(n => t.bonds.some(b => (b[0] === n || b[1] === n) && b[0] !== p && b[1] !== p && b[2] === 2 && !b[3]));
  const benzylic = !vinylic && nbrs.some(n => t.bonds.some(b => (b[0] === n || b[1] === n) && b[3]));
  const resonance = allylic || benzylic;
  const rank = vinylic ? 0 : (resonance ? 4 : 1) + nbrs.length;
  const degree = ['methyl', 'primary', 'secondary', 'tertiary'][nbrs.length];
  const kind = vinylic ? 'vinylic' : benzylic ? degree + ' benzylic' : allylic ? degree + ' allylic' : degree;
  return { nbrs, vinylic, allylic, benzylic, resonance, rank, degree, kind };
}
const CLS = {}; for (const t of CATALOG) CLS[t.id] = classify(t);
export const STAIRS = ['vinyl', 'methyl', 'ethyl', 'isopropyl', 'tbutyl', 'allyl'];

// ---------- item generator (pure, node-safe) ----------
export function gen(rng){
  for (let tries = 0; tries < 500; tries++){
    const pool = CATALOG.slice();
    const picked = [];
    while (picked.length < 4 && pool.length){ const i = Math.floor(rng() * pool.length); picked.push(pool.splice(i, 1)[0]); }
    const ranks = picked.map(t => CLS[t.id].rank);
    if (new Set(ranks).size !== 4) continue;
    // never let a primary resonance cation (rank 5) meet a plain secondary or tertiary (3, 4): too close to call honestly
    if (ranks.includes(5) && (ranks.includes(3) || ranks.includes(4))) continue;
    const least = rng() < 0.3;
    const target = least ? Math.min(...ranks) : Math.max(...ranks);
    return { least, ids: picked.map(t => t.id), answer: ranks.indexOf(target) };
  }
  return null;
}

function mulberry(seed){ let s = seed | 0; return function(){ s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

export function selfTest(){
  let tried = 0;
  // the graph reads back what each drawing intends
  const expect = { methyl: [0, 'methyl'], ethyl: [1, 'primary'], propyl: [1, 'primary'], isopropyl: [2, 'secondary'], secbutyl: [2, 'secondary'], cyclohexyl: [2, 'secondary'], cyclopentyl: [2, 'secondary'], tbutyl: [3, 'tertiary'], methylbutyl: [3, 'tertiary'], methylcyclohexyl: [3, 'tertiary'], vinyl: [1, 'vinylic'], propenyl: [2, 'vinylic'], cyclohexenyl: [2, 'vinylic'], allyl: [1, 'primary allylic'], methylallyl: [2, 'secondary allylic'], dimethylallyl: [3, 'tertiary allylic'], benzyl: [1, 'primary benzylic'], phenylethyl: [2, 'secondary benzylic'], cumyl: [3, 'tertiary benzylic'] };
  for (const t of CATALOG){
    const c = CLS[t.id], e = expect[t.id];
    if (!e) return { ok: false, tried, notes: 'no expectation for ' + t.id };
    if (c.nbrs.length !== e[0] || c.kind !== e[1]) return { ok: false, tried, notes: t.id + ' reads as ' + c.kind + ' with ' + c.nbrs.length + ' neighbors' };
    if (c.nbrs.length > 3) return { ok: false, tried, notes: t.id + ' has a carbon with too many bonds' };
    for (const b of t.bonds) if (b[0] >= t.pts.length || b[1] >= t.pts.length) return { ok: false, tried, notes: t.id + ' bond to a missing point' };
  }
  // the rank is a strict total order on the catalog up to class ties, and follows the three rules
  const r = id => CLS[id].rank;
  if (!(r('vinyl') < r('methyl') && r('methyl') < r('ethyl') && r('ethyl') < r('isopropyl') && r('isopropyl') < r('tbutyl'))) return { ok: false, tried, notes: 'neighbor ladder broken' };
  if (!(r('tbutyl') < r('methylallyl') && r('methylallyl') < r('cumyl') && r('phenylethyl') < r('cumyl'))) return { ok: false, tried, notes: 'resonance does not win' };
  if (r('cumyl') !== Math.max(...CATALOG.map(t => r(t.id)))) return { ok: false, tried, notes: 'tertiary benzylic is not the top' };
  if (r('cyclohexenyl') !== 0 || r('propenyl') !== 0) return { ok: false, tried, notes: 'vinylic is not the bottom' };
  const rng = mulberry(21);
  let leasts = 0;
  for (let i = 0; i < 400; i++){
    const it = gen(rng); tried++;
    if (!it) return { ok: false, tried, notes: 'generator gave up' };
    const ranks = it.ids.map(r);
    if (new Set(ranks).size !== 4) return { ok: false, tried, notes: 'tie inside an item' };
    if (ranks.includes(5) && (ranks.includes(3) || ranks.includes(4))) return { ok: false, tried, notes: 'primary resonance met plain secondary or tertiary' };
    // strict total order within the item: sorted ranks strictly increase, and the answer is the unique extreme
    const sorted = ranks.slice().sort((a, b) => a - b);
    for (let k = 1; k < 4; k++) if (!(sorted[k - 1] < sorted[k])) return { ok: false, tried, notes: 'not strictly ordered' };
    const target = it.least ? sorted[0] : sorted[3];
    if (ranks.filter(x => x === target).length !== 1 || ranks[it.answer] !== target) return { ok: false, tried, notes: 'answer not unique' };
    if (it.least) leasts++;
  }
  const a = gen(mulberry(4)), b = gen(mulberry(4));
  if (JSON.stringify(a) !== JSON.stringify(b)) return { ok: false, tried, notes: 'not reproducible' };
  return { ok: true, tried, notes: (tried - leasts) + ' most-stable, ' + leasts + ' least-stable, catalog ' + CATALOG.length };
}

// ---------- drawing ----------
let uid = 0;
function labelText(api, x, y, label, fill, size){
  const t = api.svg('text', { x, y: y + size * 0.36, 'text-anchor': 'middle', 'font-family': 'Georgia, serif', 'font-size': String(size), fill });
  for (const r of label.match(/[A-Za-z]+|\d+/g) || []){
    if (/\d/.test(r)) t.append(api.svg('tspan', { dy: String(size * 0.28), 'font-size': String(size * 0.7), text: r }), api.svg('tspan', { dy: String(-size * 0.28), text: '' }));
    else t.append(api.svg('tspan', { text: r }));
  }
  return t;
}
// Draw one cation. Returns the group and a point lookup in svg coordinates.
function drawCation(api, t, opts){
  const { svg } = api, C = api.colors;
  const S = opts.scale || 1, ox = opts.ox || 0, oy = opts.oy || 0;
  const P = i => ({ x: ox + t.pts[i][0] * S, y: oy + t.pts[i][1] * S });
  const g = svg('g', {});
  const w = 2.6 * S, ink = opts.ink || C.ink2;
  // ring center for inner aromatic lines
  let rc = null;
  const aromIdx = new Set(); t.bonds.forEach(b => { if (b[3]){ aromIdx.add(b[0]); aromIdx.add(b[1]); } });
  if (aromIdx.size){ let sx = 0, sy = 0; for (const i of aromIdx){ const p = P(i); sx += p.x; sy += p.y; } rc = { x: sx / aromIdx.size, y: sy / aromIdx.size }; }
  const labelR = t.label ? 20 * S : 0;
  t.bonds.forEach((b, k) => {
    const a = P(b[0]), c = P(b[1]);
    const dx = c.x - a.x, dy = c.y - a.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    g.append(svg('line', { x1: a.x, y1: a.y, x2: c.x, y2: c.y, stroke: ink, 'stroke-width': String(w), 'stroke-linecap': 'round' }));
    const inner = (side) => svg('line', { x1: a.x + dx * 0.15 - uy * 5 * S * side, y1: a.y + dy * 0.15 + ux * 5 * S * side, x2: c.x - dx * 0.15 - uy * 5 * S * side, y2: c.y - dy * 0.15 + ux * 5 * S * side, stroke: ink, 'stroke-width': String(w), 'stroke-linecap': 'round' });
    if (b[3] && k % 2 === 0 && rc){ const mx = (a.x + c.x) / 2, my = (a.y + c.y) / 2; const side = ((rc.x - mx) * -uy + (rc.y - my) * ux) > 0 ? 1 : -1; g.append(inner(side)); }
    else if (b[2] === 2){
      if (rc && b[3] === false && aromIdx.size === 0){ g.append(inner(1)); }
      else if (t.bonds.length >= 5 && t.pts.length === 6 && !b[3]){ const cx0 = t.pts.reduce((s, p) => s + p[0], 0) / 6, cy0 = t.pts.reduce((s, p) => s + p[1], 0) / 6; const cc = { x: ox + cx0 * S, y: oy + cy0 * S }; const mx = (a.x + c.x) / 2, my = (a.y + c.y) / 2; const side = ((cc.x - mx) * -uy + (cc.y - my) * ux) > 0 ? 1 : -1; g.append(inner(side)); }
      else g.append(inner(1));
    }
  });
  if (t.label) g.append(labelText(api, P(0).x, P(0).y, t.label, C.ink, 20 * S));
  // the plus badge, placed away from the bonds
  const p = P(t.plus);
  const taken = t.bonds.filter(b => b[0] === t.plus || b[1] === t.plus).map(b => { const o = P(b[0] === t.plus ? b[1] : b[0]); return Math.atan2(-(o.y - p.y), o.x - p.x) * 180 / Math.PI; });
  if (t.pts.length > 2){ const mx = t.pts.reduce((a, q) => a + q[0], 0) / t.pts.length, my = t.pts.reduce((a, q) => a + q[1], 0) / t.pts.length; const cm = { x: ox + mx * S, y: oy + my * S }; if (Math.hypot(cm.x - p.x, cm.y - p.y) > 4) taken.push(Math.atan2(-(cm.y - p.y), cm.x - p.x) * 180 / Math.PI); }
  const cands = [90, 270, 45, 135, 315, 225, 0, 180];
  const gapTo = deg => taken.reduce((m, q) => Math.min(m, Math.abs(((deg - q) % 360 + 540) % 360 - 180)), 999);
  let deg = 90, best = -1; for (const c of cands){ const q = gapTo(c); if (q > best){ best = q; deg = c; } }
  const tt = deg * Math.PI / 180, d = (labelR ? 26 : 16) * S, R = 7.5 * S;
  const cx = p.x + Math.cos(tt) * d, cy = p.y - Math.sin(tt) * d;
  const plus = svg('g', {});
  plus.append(svg('circle', { cx, cy, r: R, fill: 'none', stroke: C.coral, 'stroke-width': String(1.8 * S) }));
  plus.append(svg('line', { x1: cx - R * 0.55, y1: cy, x2: cx + R * 0.55, y2: cy, stroke: C.coral, 'stroke-width': String(2 * S), 'stroke-linecap': 'round' }));
  plus.append(svg('line', { x1: cx, y1: cy - R * 0.55, x2: cx, y2: cy + R * 0.55, stroke: C.coral, 'stroke-width': String(2 * S), 'stroke-linecap': 'round' }));
  g.append(plus);
  if (!t.label) g.append(svg('circle', { cx: p.x, cy: p.y, r: 3.2 * S, fill: C.coral }));
  return { g, P, badge: { x: cx, y: cy } };
}

const STEP_TEXT = {
  vinyl: ['Vinylic', 'The plus sits ON a double-bond carbon. Its empty orbital points sideways to the pi bond, so those pi electrons cannot reach in to help. We never want a radical or carbocation touching a double bond. Poison, bottom of the stairs.'],
  methyl: ['Methyl', 'Zero carbon neighbors. Nobody leans in, nobody lends a hand. The hot potato sits on one carbon with no help at all.'],
  ethyl: ['Primary', 'One carbon neighbor. Its C-H bonds lean toward the empty orbital and donate a little density. That is hyperconjugation: one helper.'],
  isopropyl: ['Secondary', 'Two carbon neighbors, two sets of C-H bonds leaning in. Two helpers.'],
  tbutyl: ['Tertiary', 'Three carbon neighbors, three helpers each lending a little. This is the best a plain alkyl cation can do.'],
  allyl: ['Allylic or benzylic', 'The plus sits NEXT TO a pi bond (or a ring), so the charge spreads over more than one carbon. That is the blanket, and resonance wins over the neighbor count. Tertiary benzylic stacks both and is the top of the whole staircase.']
};

export function mount(slots, api){
  const { el, svg } = api, C = api.colors;
  const byId = {}; for (const t of CATALOG) byId[t.id] = t;

  // ---------- VISUAL: the staircase ----------
  const W = 800, H = 400, stepW = 118, x0 = 34, baseY = 372, rise = 44;
  let selected = 'tbutyl';
  const stage = el('div', {});
  const infoTitle = el('div', { style: { fontFamily: 'Georgia, serif', fontSize: '19px', color: C.goldhi, marginTop: '10px' } });
  const infoText = el('p', { style: { margin: '4px 0 0', color: C.ink2, fontSize: '15px', minHeight: '3.6em' } });
  let overlay = null, geo = {};

  function build(){
    stage.replaceChildren();
    const id = 'stair' + (++uid);
    const root = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Six carbocations on a staircase from least to most stable' });
    root.append(svg('defs', {}, svg('marker', { id: id + 'b', viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto' }, svg('path', { d: 'M0 0 L10 5 L0 10 z', fill: C.blue }))));
    root.append(svg('text', { x: x0, y: 18, 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '12', fill: C.ink3, text: 'LESS STABLE' }));
    root.append(svg('text', { x: W - x0, y: 18, 'text-anchor': 'end', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '12', fill: C.ink3, text: 'MORE STABLE' }));
    STAIRS.forEach((sid, i) => {
      const t = byId[sid], top = baseY - (i + 1) * rise, x = x0 + i * stepW;
      const on = sid === selected;
      const g = svg('g', { role: 'button', tabindex: '0', 'aria-label': STEP_TEXT[sid][0] + ' step', 'aria-pressed': on ? 'true' : 'false', style: { cursor: 'pointer' } });
      g.append(svg('rect', { x, y: top, width: stepW - 6, height: baseY - top, rx: 6, fill: on ? 'rgba(201,168,76,.14)' : C.card, stroke: on ? C.gold : C.line, 'stroke-width': on ? '2' : '1' }));
      g.append(svg('line', { x1: x, y1: top, x2: x + stepW - 6, y2: top, stroke: sid === 'vinyl' ? C.amber : sid === 'allyl' ? C.gold : C.grey, 'stroke-width': '3' }));
      const label = STEP_TEXT[sid][0];
      g.append(svg('text', { x: x + (stepW - 6) / 2, y: top + 20, 'text-anchor': 'middle', 'font-family': 'Georgia, serif', 'font-size': label.length > 10 ? '12' : '14', fill: on ? C.goldhi : C.ink, text: label }));
      const c = CLS[sid];
      g.append(svg('text', { x: x + (stepW - 6) / 2, y: top + 36, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '11', fill: C.ink3, text: c.vinylic ? 'poison' : c.resonance ? 'blanket' : c.nbrs.length + (c.nbrs.length === 1 ? ' neighbor' : ' neighbors') }));
      const sc = 0.58, mol = drawCation(api, t, { scale: sc, ox: x + (stepW - 6 - 200 * sc) / 2, oy: top - 130 * sc - 2, ink: C.ink2 });
      g.append(mol.g);
      geo[sid] = { P: mol.P, t };
      const choose = () => { selected = sid; build(); };
      g.addEventListener('click', choose);
      g.addEventListener('mouseenter', () => { if (selected !== sid){ selected = sid; build(); } });
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); choose(); } });
      root.append(g);
    });
    overlay = svg('g', {});
    root.append(overlay);
    stage.append(root);
    animate(id);
    infoTitle.textContent = STEP_TEXT[selected][0] + (CLS[selected].vinylic || CLS[selected].resonance ? '' : ': ' + CLS[selected].nbrs.length + (CLS[selected].nbrs.length === 1 ? ' helper' : ' helpers'));
    infoText.textContent = STEP_TEXT[selected][1];
    chips.forEach(ch => ch.setAttribute('aria-pressed', ch.dataset.id === selected ? 'true' : 'false'));
  }
  function animate(id){
    const { P, t } = geo[selected], c = CLS[selected], p = P(t.plus);
    const D = api.reduced ? 0 : 1;
    if (c.vinylic){
      // the empty orbital drawn sideways to the pi bond: it cannot overlap
      const o = P(t.bonds[0][0] === t.plus ? t.bonds[0][1] : t.bonds[0][0]);
      const ux = (o.x - p.x), uy = (o.y - p.y), L = Math.hypot(ux, uy);
      const nx = -uy / L, ny = ux / L;
      const lobe = s => svg('ellipse', { cx: p.x + nx * 11 * s, cy: p.y + ny * 11 * s, rx: 6, ry: 10, transform: 'rotate(' + (Math.atan2(ny, nx) * 180 / Math.PI + 90) + ' ' + (p.x + nx * 11 * s) + ' ' + (p.y + ny * 11 * s) + ')', fill: 'none', stroke: C.amber, 'stroke-width': '1.6', 'stroke-dasharray': '3 3' });
      overlay.append(lobe(1), lobe(-1));
      overlay.append(svg('text', { x: p.x, y: p.y - 30, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '10', fill: C.amber, text: 'empty, sideways' }));
      return;
    }
    if (c.resonance){
      // the blanket: gold spread over the atoms that share the charge (the pi bond carbons and the plus)
      const ids = [t.plus].concat(c.nbrs.filter(n => t.bonds.some(b => (b[0] === n || b[1] === n) && b[2] === 2)).flatMap(n => t.bonds.filter(b => (b[0] === n || b[1] === n) && b[2] === 2).flatMap(b => [b[0], b[1]])));
      const cover = [...new Set(ids)].map(P);
      const share = [t.plus].concat(c.nbrs.flatMap(n => t.bonds.filter(b => (b[0] === n || b[1] === n) && b[2] === 2 && !b[3]).map(b => b[0] === n ? b[1] : b[0])));
      const pts = cover;
      const cx = pts.reduce((s, q) => s + q.x, 0) / pts.length, cy = pts.reduce((s, q) => s + q.y, 0) / pts.length;
      const spread = Math.max(...pts.map(q => Math.hypot(q.x - cx, q.y - cy))) + 16;
      const blanket = svg('ellipse', { cx, cy, rx: spread, ry: 22, fill: C.gold, opacity: '0', style: { transition: 'opacity ' + (600 * D) + 'ms, rx ' + (600 * D) + 'ms' } });
      overlay.append(blanket);
      const far = pts.find(q => Math.hypot(q.x - p.x, q.y - p.y) > 20) || p;
      const ghost = svg('g', { opacity: '0', style: { transition: 'opacity ' + (600 * D) + 'ms' } });
      ghost.append(svg('circle', { cx: far.x + (far.x > p.x ? 12 : -12), cy: far.y - 12, r: 6, fill: 'none', stroke: C.gold, 'stroke-width': '1.6', 'stroke-dasharray': '2 2' }));
      ghost.append(svg('line', { x1: far.x + (far.x > p.x ? 12 : -12) - 3.3, y1: far.y - 12, x2: far.x + (far.x > p.x ? 12 : -12) + 3.3, y2: far.y - 12, stroke: C.gold, 'stroke-width': '1.6' }));
      ghost.append(svg('line', { x1: far.x + (far.x > p.x ? 12 : -12), y1: far.y - 15.3, x2: far.x + (far.x > p.x ? 12 : -12), y2: far.y - 8.7, stroke: C.gold, 'stroke-width': '1.6' }));
      overlay.append(ghost);
      overlay.append(svg('text', { x: cx, y: cy - 34, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '10', fill: C.goldhi, text: 'plus shared by ' + [...new Set(share)].length + ' carbons' }));
      setTimeout(() => { blanket.setAttribute('opacity', '0.22'); ghost.setAttribute('opacity', '1'); }, 30);
      return;
    }
    // hyperconjugation: the empty p orbital as two dashed lobes, and a blue arrow from every neighbor into it
    const lobe = s => svg('ellipse', { cx: p.x, cy: p.y + 13 * s, rx: 6, ry: 10, fill: 'none', stroke: C.grey, 'stroke-width': '1.4', 'stroke-dasharray': '3 3' });
    overlay.append(lobe(1), lobe(-1));
    const paths = c.nbrs.map(n => {
      const q = P(n);
      const dx = p.x - q.x, dy = p.y - q.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      const side = (-uy * 1 + 0) >= 0 ? 1 : -1;   // sit on the upper side of the bond
      const off = 7 * side;
      const sx = q.x + ux * L * 0.22 - uy * off, sy = q.y + uy * L * 0.22 + ux * off;
      const ex = p.x - ux * L * 0.3 - uy * off, ey = p.y - uy * L * 0.3 + ux * off;
      const path = svg('path', { d: 'M' + sx.toFixed(1) + ' ' + sy.toFixed(1) + ' L' + ex.toFixed(1) + ' ' + ey.toFixed(1), fill: 'none', stroke: C.blue, 'stroke-width': '2.4', 'stroke-linecap': 'round', 'marker-end': 'url(#' + id + 'b)' });
      overlay.append(path);
      return path;
    });
    if (!paths.length){ overlay.append(svg('text', { x: p.x, y: p.y - 34, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-size': '10', fill: C.ink3, text: 'no helpers' })); return; }
    const lens = paths.map(pa => { try { return pa.getTotalLength(); } catch (e){ return 60; } });
    paths.forEach((pa, i) => { pa.style.transition = 'none'; pa.setAttribute('stroke-dasharray', String(lens[i])); pa.style.strokeDashoffset = String(lens[i]); });
    void overlay.getBoundingClientRect();
    paths.forEach((pa, i) => { pa.style.transition = 'stroke-dashoffset ' + (500 * D) + 'ms ease-out ' + (i * 120 * D) + 'ms'; pa.style.strokeDashoffset = '0'; });
  }
  const chips = STAIRS.map(sid => el('button', { class: 'chip', type: 'button', dataset: { id: sid }, text: STEP_TEXT[sid][0], onClick: () => { selected = sid; build(); } }));
  slots.visual.append(stage, el('div', { class: 'controls', role: 'group', 'aria-label': 'Pick a step' }, el('span', { class: 'eyebrow', text: 'hover or tap a step' }), ...chips), infoTitle, infoText);
  build();

  // ---------- YOU TRY ----------
  let item = null, firstTry = true, done = false;
  const tryBox = el('div', { class: 'item' });
  slots.try.append(tryBox);

  function describe(id){
    const c = CLS[id];
    if (c.vinylic) return 'vinylic (the plus is on a double-bond carbon)';
    if (c.resonance) return c.kind + ' (' + c.nbrs.length + (c.nbrs.length === 1 ? ' neighbor' : ' neighbors') + ' plus the blanket)';
    return c.kind + ' (' + c.nbrs.length + (c.nbrs.length === 1 ? ' neighbor' : ' neighbors') + ')';
  }
  function coachFor(pickId, ansId, least){
    const pc = CLS[pickId], ac = CLS[ansId];
    if (!least && pc.vinylic) return 'That one is vinylic: the plus sits on a double-bond carbon. We never want a carbocation touching a double bond. It is the bottom of the stairs, not the top.';
    if (least && ac.vinylic) return 'Look for the plus ON a double-bond carbon. Vinylic is poison and always the least stable, below even methyl.';
    if (!least && ac.resonance && !pc.resonance) return 'Count neighbors, then check for resonance. Resonance wins: the answer is ' + describe(ansId) + ', so its charge spreads over more than one carbon, and that beats ' + describe(pickId) + '.';
    if (least && pc.resonance) return 'That one has the blanket (' + describe(pickId) + '), so it is near the top, not the bottom. The least stable is ' + describe(ansId) + '.';
    return 'Count the carbon neighbors on the plus carbon. You picked ' + describe(pickId) + '; the answer is ' + describe(ansId) + '.';
  }
  function next(){
    tryBox.replaceChildren(); api.clearCoach();
    item = gen(api.rng); firstTry = true; done = false;
    tryBox.append(el('p', { class: 'prompt', text: item.least ? 'Which carbocation is LEAST stable?' : 'Which carbocation is most stable?' }));
    const box = el('div', { class: 'opts' });
    const names = [];
    const btns = item.ids.map((id, i) => {
      const t = byId[id];
      const s = svg('svg', { viewBox: '0 0 200 130', width: '100%', style: { display: 'block', maxHeight: '120px' }, 'aria-hidden': 'true' });
      s.append(drawCation(api, t, { scale: 1, ox: 0, oy: 0, ink: C.ink2 }).g);
      const name = el('span', { style: { display: 'block', textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: '13px', color: C.ink2, minHeight: '1.2em' }, text: '' });
      names.push(name);
      const btn = el('button', { class: 'opt', type: 'button', 'aria-label': t.name }, el('span', { class: 'k', text: 'ABCD'[i] }), el('span', { style: { display: 'block' } }, s, name));
      btn.addEventListener('click', () => {
        if (done) return;
        btns.forEach(x => x.classList.remove('picked')); btn.classList.add('picked');
        if (i === item.answer){
          btn.classList.add('ok'); btns.forEach(x => { x.disabled = true; });
          item.ids.forEach((iid, k) => { names[k].textContent = describe(iid); });
          done = true; api.report(firstTry); api.clearCoach();
          tryBox.append(el('div', { class: 'verdict good', text: 'You can read it.' }), el('div', { class: 'controls' }, el('button', { class: 'primary', type: 'button', text: 'Another one', onClick: next })));
        } else {
          if (firstTry) api.report(false); firstTry = false;
          if (!tryBox.querySelector('.verdict')) tryBox.append(el('div', { class: 'verdict notyet', text: 'Not yet.' }));
          api.coach(coachFor(id, item.ids[item.answer], item.least));
        }
      });
      return btn;
    });
    box.append(...btns);
    tryBox.append(box);
  }
  next();
}
