// The Roots of Organic, level 3, root 1: Wedge toward, dash away.
//
// The drawing on the left and the model on the right are the SAME coordinates:
// a regular tetrahedron in Thomas's calibrated pose. R or S is computed from
// the geometry (signed volume of the priority vectors), never authored, so the
// you-try cannot be wrong. Sign convention calibrated against the verified
// worked example in oc-09-stereochemistry (butan-2-ol, S) and re-checked in
// selfTest below.

export const meta = {
  id: 'l3-wedge',
  level: 3,
  order: 1,
  needs3D: true,
  title: 'Wedge toward, dash away',
  concept: 'Wedge and dash, R and S',
  tagline: 'Wedge is toward you, dash is away. That is the whole 3D language.',
  story: 'Wedge is toward you, dash is away. That is the whole 3D language, and everything at this level is just reading it honestly. A stereocenter is a carbon holding four different groups. To name it R or S, do the numbers: rank the groups by the atomic number of the first atom, and when two tie, look at what each one is holding. Trace 1 to 2 to 3. Clockwise reads R, counterclockwise reads S. Then check where H lives. H on a dash is already pointing away, so keep your letter. H on a wedge is pointing at you, so you judged it from the wrong side: flip it. If it ever feels abstract, walk around and look at it. Rule of thumb: do the numbers, trace, then H on a dash keep it, H on a wedge flip it.',
  moveName: 'Do the numbers, trace, then check H',
  move: [
    'Rank the four groups. Highest atomic number on the first atom wins; a tie goes to whoever is holding the heavier set.',
    'Trace 1 to 2 to 3 as drawn. Clockwise reads R, counterclockwise reads S.',
    'Find H. On a dash, keep your letter. On a wedge, flip it.',
    'Two matching groups on the carbon? It is not a stereocenter. No letter at all.'
  ],
  trap: 'Careful: The flip only applies when the LOWEST priority group is pointing at you; a wedge on group 1 or 2 changes nothing about the letter you traced.',
  holdsUp: ['Every R and S question', 'Fischer projections', 'SN2 inversion', 'Enantiomer relationships', 'Meso identification'],
  drill: 'Booster OChem: Conformations and Stereochemistry'
};

/* ------------------------------------------------------------------ */
/* CIP table, pose and the calibrated R/S math                          */
/* ------------------------------------------------------------------ */
const GROUPS = [
  { key: 'Br',    label: 'Br',     rank: 1,  atom: 'Br', why: 'bromine has the highest atomic number here' },
  { key: 'Cl',    label: 'Cl',     rank: 2,  atom: 'Cl', why: 'chlorine outranks any oxygen, nitrogen or carbon group' },
  { key: 'OH',    label: 'OH',     rank: 3,  atom: 'O',  why: 'oxygen beats nitrogen and every carbon group' },
  { key: 'NH2',   label: 'NH2',    rank: 4,  atom: 'N',  why: 'nitrogen beats any carbon group' },
  { key: 'COOH',  label: 'COOH',   rank: 5,  atom: 'C',  why: 'a carbon holding three oxygen bonds beats one holding fewer' },
  { key: 'CHO',   label: 'CHO',    rank: 6,  atom: 'C',  why: 'a carbon with two oxygen bonds beats one with a single oxygen' },
  { key: 'CH2OH', label: 'CH2OH',  rank: 7,  atom: 'C',  why: 'a carbon attached to an oxygen beats one attached only to carbons and hydrogens' },
  { key: 'Et',    label: 'CH2CH3', rank: 8,  atom: 'C',  why: 'ethyl beats methyl because its carbon is attached to another carbon' },
  { key: 'Me',    label: 'CH3',    rank: 9,  atom: 'C',  why: 'methyl is the smallest carbon group' },
  { key: 'H',     label: 'H',      rank: 10, atom: 'H',  why: 'hydrogen is always lowest' }
];

// Regular tetrahedron (every angle 109.47 degrees) turned 25 degrees about the
// vertical so the upper pair splays left and right. Lower pair reads in plane,
// upper right is the wedge (toward, +z), upper left is the dash (away, -z).
const POSE = [
  [-0.739, -0.577,  0.345],
  [ 0.739, -0.577, -0.345],
  [ 0.345,  0.577,  0.739],
  [-0.345,  0.577, -0.739]
];
function vsub(a, b){ return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function vadd(a, b){ return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
function vscale(a, s){ return [a[0] * s, a[1] * s, a[2] * s]; }
function vcross(a, b){ return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function vdot(a, b){ return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function vlen(a){ return Math.sqrt(vdot(a, a)); }
function vunit(a){ const l = vlen(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
function rotZ(v, a){ const c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]]; }

// pos = four [x,y,z] for priorities 1..4 in order (index 3 is the lowest).
// View from the side opposite the lowest so it points away; 1 to 2 to 3
// clockwise is R. The sign that means R is fixed by calibration (butan-2-ol).
function configFromGeometry(pos){
  const a = vsub(pos[0], pos[3]), b = vsub(pos[1], pos[3]), c = vsub(pos[2], pos[3]);
  const vol = vdot(a, vcross(b, c));
  return vol < 0 ? 'R' : 'S';
}
// What a student reads tracing 1-2-3 straight off the page, ignoring H.
function apparentFromPage(pos){
  const a = pos[0], b = pos[1], c = pos[2];
  const cr = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  return cr < 0 ? 'R' : 'S';
}
function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// tier 1: four distinct groups, H on the wedge or the dash.
// tier 2: one item in five has two matching groups (not a stereocenter).
function makeItem(rng, tier){
  const ri = n => Math.floor(rng() * n);
  const decoy = tier >= 2 && ri(5) === 0;
  const pool = GROUPS.slice(0, 9), chosen = [];
  while (chosen.length < 3){ const g = pool[ri(pool.length)]; if (chosen.indexOf(g) < 0) chosen.push(g); }
  if (decoy) chosen[2] = chosen[1];
  const four = chosen.concat([GROUPS[9]]);
  // H always takes the wedge or the dash (slots 2 and 3): that is how the DAT
  // draws it, and the flip rule is about where H sits in depth.
  const heavy = [0, 1, ri(2) === 0 ? 2 : 3];
  for (let i = heavy.length - 1; i > 0; i--){ const j = ri(i + 1), t = heavy[i]; heavy[i] = heavy[j]; heavy[j] = t; }
  const hSlot = heavy.indexOf(2) >= 0 ? 3 : 2;
  const slots = heavy.concat([hSlot]);
  const angle = ri(4) * (Math.PI / 2), mirror = ri(2) === 1;
  const groups = four.map((g, k) => {
    let p = POSE[slots[k]].slice();
    if (mirror) p[0] = -p[0];
    p = rotZ(p, angle);
    return { key: g.key, label: g.label, rank: g.rank, why: g.why, pos: p, depth: p[2] > 0.5 ? 'wedge' : (p[2] < -0.5 ? 'dash' : 'plane') };
  });
  const order = groups.map((g, i) => i).sort((x, y) => groups[x].rank - groups[y].rank);
  const pos = order.map(i => groups[i].pos);
  const hAt = groups[order[3]].depth;
  const apparent = apparentFromPage(pos);
  const answer = decoy ? 'achiral' : configFromGeometry(pos);
  return {
    kind: decoy ? 'achiral' : 'RS', groups, order, seq: order.slice(0, 3), answer, apparent, hAt,
    wedgeIdx: groups.findIndex(g => g.depth === 'wedge'), dashIdx: groups.findIndex(g => g.depth === 'dash')
  };
}
function mirrorItem(it){
  const groups = it.groups.map(g => ({ key: g.key, label: g.label, rank: g.rank, why: g.why, pos: [-g.pos[0], g.pos[1], g.pos[2]], depth: g.depth }));
  const pos = it.order.map(i => groups[i].pos);
  return configFromGeometry(pos);
}

/* ------------------------------------------------------------------ */
/* Coaching lines (one sentence each, the fixable move named)           */
/* ------------------------------------------------------------------ */
const WHY = {
  flip: 'H is on a wedge, pointing at you, so you judged it from the wrong side. Flip the letter.',
  keep: 'H is on a dash, already pointing away, so the letter you traced is the letter you keep. Do the numbers again: ',
  notCenter: 'Four different groups on one carbon is a stereocenter every time. Look for two matching groups before you call anything achiral.',
  decoy: 'Look again at the four groups. Two of them match, so this carbon is not a stereocenter and has no R or S.',
  dash: 'That one is on a dash, so it is going away from you. The wedge is the bond coming at you.',
  plane: 'That bond is flat in the page. Only the wedge comes toward you; the dash goes away.'
};
function whyRS(it, choice){
  if (it.kind === 'achiral') return WHY.decoy;
  if (choice === 'achiral') return WHY.notCenter;
  if (it.hAt === 'wedge') return WHY.flip;
  return WHY.keep + it.seq.map(i => it.groups[i].label).join(', then ') + '.';
}
function whyToward(it, i){ return it.groups[i].depth === 'dash' ? WHY.dash : WHY.plane; }

/* ------------------------------------------------------------------ */
/* Labels with real subscripts (SVG and HTML)                            */
/* ------------------------------------------------------------------ */
function runs(label){ return String(label).split(/(\d+)/).filter(Boolean).map(r => ({ t: r, sub: /^\d+$/.test(r) })); }
function svgLabel(api, label, x, y, anchor, size, fill, weight){
  const t = api.svg('text', { x, y, 'text-anchor': anchor, 'font-family': 'Georgia, serif', 'font-weight': weight || 600, 'font-size': size, fill });
  let up = 0;
  for (const r of runs(label)){
    if (r.sub){ t.append(api.svg('tspan', { dy: size * 0.28, 'font-size': size * 0.66 }, r.t)); up = -size * 0.28; }
    else { t.append(api.svg('tspan', up ? { dy: up } : {}, r.t)); up = 0; }
  }
  return t;
}
function htmlLabel(api, label){
  const s = api.el('span', {});
  for (const r of runs(label)) s.append(r.sub ? api.el('sub', { text: r.t }) : r.t);
  return s;
}

/* ------------------------------------------------------------------ */
/* 2D: the wedge-dash drawing, exactly as the DAT draws it              */
/* ------------------------------------------------------------------ */
function drawWedgeDash(api, it, opts){
  opts = opts || {};
  const C = [150, 126], L = 74, ink = '#1c1913', gold = api.colors.gold || '#C9A84C';
  const s = api.svg('svg', { viewBox: '0 0 300 250', role: 'img', 'aria-label': 'A carbon with four groups drawn with wedges and dashes' });
  it.groups.forEach((g, gi) => {
    const ex = C[0] + g.pos[0] * L, ey = C[1] - g.pos[1] * L;
    const dx = ex - C[0], dy = ey - C[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, px = -uy, py = ux;
    const lit = opts.lit === gi, col = lit ? '#8a6a12' : ink;
    if (g.depth === 'wedge'){
      s.append(api.svg('polygon', { points: `${C[0]},${C[1]} ${(ex + px * 7).toFixed(1)},${(ey + py * 7).toFixed(1)} ${(ex - px * 7).toFixed(1)},${(ey - py * 7).toFixed(1)}`, fill: col }));
    } else if (g.depth === 'dash'){
      for (let t = 0.18; t <= 1.001; t += 0.14){
        const w = 2 + t * 6, x = C[0] + dx * t, y = C[1] + dy * t;
        s.append(api.svg('line', { x1: (x + px * w).toFixed(1), y1: (y + py * w).toFixed(1), x2: (x - px * w).toFixed(1), y2: (y - py * w).toFixed(1), stroke: col, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
      }
    } else {
      s.append(api.svg('line', { x1: C[0], y1: C[1], x2: ex.toFixed(1), y2: ey.toFixed(1), stroke: col, 'stroke-width': 2.6, 'stroke-linecap': 'round' }));
    }
    const k = opts.badges ? opts.badges.indexOf(gi) : -1;
    const anchor = ux > 0.35 ? 'start' : (ux < -0.35 ? 'end' : 'middle');
    const gap = (anchor === 'middle' ? 22 : 12) + (k >= 0 ? 12 : 0);
    const lx = ex + ux * gap, ly = ey + uy * gap + 6;
    s.append(svgLabel(api, g.label, lx.toFixed(1), ly.toFixed(1), anchor, 17, col));
    if (k >= 0){
      s.append(api.svg('circle', { cx: ex.toFixed(1), cy: ey.toFixed(1), r: 11, fill: gold, stroke: '#3a2c08', 'stroke-width': 1 }));
      s.append(api.svg('text', { x: ex.toFixed(1), y: (ey + 4.5).toFixed(1), 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-weight': 700, 'font-size': 13, fill: '#1a160c' }, String(k + 1)));
    }
  });
  s.append(api.svg('circle', { cx: C[0], cy: C[1], r: 4, fill: ink }));
  return s;
}

/* ------------------------------------------------------------------ */
/* Molecule builder: every hydrogen, ideal sp3 and sp2 geometry          */
/* ------------------------------------------------------------------ */
const BOND = { CC: 1.54, CO: 1.43, CN: 1.47, CCl: 1.77, CBr: 1.94, CH: 1.09, OH: 0.96, NH: 1.01, CO2: 1.23 };
const TET = 109.47 * Math.PI / 180;
const SIZE = { COOH: 6, CH2OH: 5, Et: 5, CHO: 4, NH2: 3, OH: 2, Me: 4, Br: 1, Cl: 1, H: 0 };
const ANCHOR_LEN = { H: BOND.CH, Cl: BOND.CCl, Br: BOND.CBr, OH: BOND.CO, NH2: BOND.CN, Me: BOND.CC, Et: BOND.CC, CH2OH: BOND.CC, CHO: BOND.CC, COOH: BOND.CC };
function frame(u){ const h = Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]; const e1 = vunit(vcross(u, h)), e2 = vcross(u, e1); return [u, e1, e2]; }
function sp3Dirs(back, phase){
  const f = frame(back), u = f[0], e1 = f[1], e2 = f[2], out = [], tilt = Math.PI - TET;
  for (let k = 0; k < 3; k++){ const a = phase + k * 2 * Math.PI / 3; out.push(vunit(vadd(vscale(u, -Math.cos(tilt)), vadd(vscale(e1, Math.sin(tilt) * Math.cos(a)), vscale(e2, Math.sin(tilt) * Math.sin(a)))))); }
  return out;
}
function sp2Dirs(back, phase){
  const f = frame(back), u = f[0], e1 = f[1], e2 = f[2], out = [], tilt = Math.PI / 3;
  for (let k = 0; k < 2; k++){ const a = phase + Math.PI / 2 + k * Math.PI; out.push(vunit(vadd(vscale(u, -Math.cos(tilt)), vadd(vscale(e1, Math.sin(tilt) * Math.cos(a)), vscale(e2, Math.sin(tilt) * Math.sin(a)))))); }
  return out;
}
function grow(key, gi, d, phase, sub, A, Bd){
  const atom = (el, p, role) => A.push({ el, p, group: gi, role: role || '' }) - 1;
  const bond = (a, b, order) => Bd.push({ a, b, order: order || 1 });
  switch (key){
    case 'H': { const h = atom('H', vscale(d, BOND.CH), 'anchor'); bond(-1, h); break; }
    case 'Cl': { const c = atom('Cl', vscale(d, BOND.CCl), 'anchor'); bond(-1, c); break; }
    case 'Br': { const c = atom('Br', vscale(d, BOND.CBr), 'anchor'); bond(-1, c); break; }
    case 'OH': { const o = atom('O', vscale(d, BOND.CO), 'anchor'); bond(-1, o); const od = sp3Dirs(vscale(d, -1), phase)[0]; const h = atom('H', vadd(A[o].p, vscale(od, BOND.OH))); bond(o, h); break; }
    case 'NH2': { const n = atom('N', vscale(d, BOND.CN), 'anchor'); bond(-1, n); const nd = sp3Dirs(vscale(d, -1), phase); for (let k = 0; k < 2; k++){ const h = atom('H', vadd(A[n].p, vscale(nd[k], BOND.NH))); bond(n, h); } break; }
    case 'Me': { const c = atom('C', vscale(d, BOND.CC), 'anchor'); bond(-1, c); sp3Dirs(vscale(d, -1), phase).forEach(dd => { const h = atom('H', vadd(A[c].p, vscale(dd, BOND.CH))); bond(c, h); }); break; }
    case 'Et': {
      const c1 = atom('C', vscale(d, BOND.CC), 'anchor'); bond(-1, c1);
      const ds = sp3Dirs(vscale(d, -1), phase);
      const c2 = atom('C', vadd(A[c1].p, vscale(ds[0], BOND.CC))); bond(c1, c2);
      for (let k = 1; k < 3; k++){ const h = atom('H', vadd(A[c1].p, vscale(ds[k], BOND.CH))); bond(c1, h); }
      sp3Dirs(vscale(ds[0], -1), sub).forEach(dd => { const h = atom('H', vadd(A[c2].p, vscale(dd, BOND.CH))); bond(c2, h); });
      break;
    }
    case 'CH2OH': {
      const c = atom('C', vscale(d, BOND.CC), 'anchor'); bond(-1, c);
      const ds = sp3Dirs(vscale(d, -1), phase);
      const o = atom('O', vadd(A[c].p, vscale(ds[0], BOND.CO))); bond(c, o);
      for (let k = 1; k < 3; k++){ const h = atom('H', vadd(A[c].p, vscale(ds[k], BOND.CH))); bond(c, h); }
      const oh = atom('H', vadd(A[o].p, vscale(sp3Dirs(vscale(ds[0], -1), sub)[0], BOND.OH))); bond(o, oh);
      break;
    }
    case 'CHO': {
      const c = atom('C', vscale(d, BOND.CC), 'anchor'); bond(-1, c);
      const ds = sp2Dirs(vscale(d, -1), phase);
      const o = atom('O', vadd(A[c].p, vscale(ds[0], BOND.CO2))); bond(c, o, 2);
      const h = atom('H', vadd(A[c].p, vscale(ds[1], BOND.CH))); bond(c, h);
      break;
    }
    case 'COOH': {
      const c = atom('C', vscale(d, BOND.CC), 'anchor'); bond(-1, c);
      const ds = sp2Dirs(vscale(d, -1), phase);
      const o1 = atom('O', vadd(A[c].p, vscale(ds[0], BOND.CO2))); bond(c, o1, 2);
      const o2 = atom('O', vadd(A[c].p, vscale(ds[1], BOND.CO))); bond(c, o2);
      const h = atom('H', vadd(A[o2].p, vscale(sp3Dirs(vscale(ds[1], -1), sub)[0], BOND.OH))); bond(o2, h);
      break;
    }
  }
}
// groups: [{ key, pos }] unit directions from the stereocenter.
function buildMolecule(groups){
  const atoms = [{ el: 'C', p: [0, 0, 0], group: null, role: 'center' }], bonds = [];
  const dirs = groups.map(g => vunit(g.pos)), heavy = groups.map(g => g.key !== 'H');
  const relaxed = dirs.map((d, i) => { if (!heavy[i]) return d; let push = [0, 0, 0]; dirs.forEach((e, j) => { if (j !== i && heavy[j]) push = vadd(push, e); }); return vunit(vadd(d, vscale(push, -0.06))); });
  const reserved = groups.map((g, i) => vscale(relaxed[i], ANCHOR_LEN[g.key]));
  const order = groups.map((g, i) => i).sort((a, b) => SIZE[groups[b].key] - SIZE[groups[a].key]);
  const placed = {};
  const dist = (p, q) => Math.sqrt((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2);
  function bestFor(gi){
    const g = groups[gi], d = relaxed[gi]; let best = null, bestScore = -1; const against = [];
    groups.forEach((_, k) => { if (k === gi) return; if (placed[k]) placed[k].A.forEach(a => against.push(a.p)); else against.push(reserved[k]); });
    for (let t = 0; t < 24 * 6; t++){
      const phase = (t % 24) * Math.PI / 12, sub = Math.floor(t / 24) * Math.PI / 3, A = [], Bd = [];
      grow(g.key, gi, d, phase, sub, A, Bd);
      let score = 9;
      for (let i = 1; i < A.length; i++) for (let j = 0; j < against.length; j++){ const dd = dist(A[i].p, against[j]); if (dd < score) score = dd; }
      if (score > bestScore){ bestScore = score; best = { A, B: Bd, score }; }
    }
    return best;
  }
  order.forEach(gi => { placed[gi] = bestFor(gi); });
  for (let round = 0; round < 3; round++){
    let moved = false;
    order.forEach(gi => { const b = bestFor(gi); if (b.score > placed[gi].score + 1e-6){ placed[gi] = b; moved = true; } });
    if (!moved) break;
  }
  groups.forEach((_, gi) => {
    const base = atoms.length;
    placed[gi].A.forEach(a => atoms.push(a));
    placed[gi].B.forEach(b => bonds.push({ a: b.a < 0 ? 0 : b.a + base, b: b.b + base, order: b.order }));
  });
  return { atoms, bonds };
}

/* ------------------------------------------------------------------ */
/* 3D bench: the drawing becomes the molecule                           */
/* ------------------------------------------------------------------ */
const SCALE = 0.78;
const RADIUS = { C: 0.34, N: 0.33, O: 0.32, Cl: 0.44, Br: 0.5, H: 0.2 };
const ELEMENT = { C: { color: 0x2b2926, rough: 0.32 }, H: { color: 0xf4f1e9, rough: 0.42 }, O: { color: 0xc42f1d, rough: 0.28 }, N: { color: 0x2c5ad4, rough: 0.28 }, Cl: { color: 0x3fb257, rough: 0.28 }, Br: { color: 0x8c2810, rough: 0.28 } };
function easeInOut(k){ return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }

// A small studio baked to a prefiltered environment: warm key overhead, cool
// fill left, warm rim behind, a soft bounce from the camera side.
function studioEnvironment(THREE, renderer){
  const pm = new THREE.PMREMGenerator(renderer);
  const room = new THREE.Scene();
  room.add(new THREE.Mesh(new THREE.BoxGeometry(24, 24, 24), new THREE.MeshStandardMaterial({ color: 0x16140f, side: THREE.BackSide, roughness: 1 })));
  const panel = (w, h, color, intensity, pos) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(pos[0], pos[1], pos[2]); m.lookAt(0, 0, 0); room.add(m);
  };
  panel(7, 3.5, 0xfff0d2, 9, [0, 9, 3]);
  panel(3, 7, 0xd6e3ff, 3.5, [-10, 2, 4]);
  panel(4, 5, 0xffe2b0, 5, [8, 3, -8]);
  panel(12, 2, 0xffffff, 1.2, [0, -4, 10]);
  const tex = pm.fromScene(room, 0.04).texture;
  pm.dispose();
  return tex;
}

function makeBench(api, stage){
  const THREE = api.THREE; if (!THREE) return null;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x0e0c08, 1);
    stage.append(renderer.domElement);
  } catch (e){
    stage.append(api.el('p', { class: 'l3w-fallback', text: 'The 3D view needs WebGL, which this browser has turned off. The drawing and the move still stand.' }));
    return null;
  }
  const scene = new THREE.Scene();
  const env = studioEnvironment(THREE, renderer);
  scene.environment = env; scene.background = env; scene.backgroundBlurriness = 1; scene.backgroundIntensity = 0.16;
  const camera = new THREE.PerspectiveCamera(34, 16 / 10, 0.1, 60);
  camera.position.set(0, 0.15, 7.4); camera.lookAt(0, 0, 0);
  const key = new THREE.DirectionalLight(0xfff1d8, 2.4); key.position.set(2.6, 4.2, 5.5); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 20 });
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xcfdcff, 0.55); fill.position.set(-4, 1, 3); scene.add(fill);
  scene.add(new THREE.HemisphereLight(0x9a917f, 0x14120e, 0.35));
  const slab = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: 0x15120b, roughness: 0.92, metalness: 0.06 }));
  slab.position.z = -2.2; slab.receiveShadow = true; scene.add(slab);

  const spin = new THREE.Group(), mol = new THREE.Group(), body = new THREE.Group();
  mol.add(body); spin.add(mol); scene.add(spin);
  const labels = api.el('div', { class: 'l3w-labels' }); stage.append(labels);
  const hint = api.el('span', { class: 'l3w-hint', text: 'Drag to walk around it' }); stage.append(hint);
  const letter = api.el('div', { class: 'l3w-letter' }); stage.append(letter);

  const bondMat = new THREE.MeshStandardMaterial({ color: 0xb9a878, roughness: 0.32, metalness: 0.7, envMapIntensity: 1.0 });
  const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 24, 1, true);
  const state = { atoms: [], bonds: [], labelNodes: [], badgeNodes: [], qAway: new THREE.Quaternion(), tweens: [], timers: [], base: { x: 0, y: 0 }, dragging: false, visible: false, raf: 0, swayFrom: 0 };

  function clear(g){ while (g.children.length){ const c = g.children.pop(); c.traverse && c.traverse(o => { if (o.geometry && o.geometry !== unitCyl) o.geometry.dispose(); if (o.material && o.material !== bondMat) o.material.dispose(); }); } }
  function setBond(mesh, a, b, radius){ const d = b.clone().sub(a), L = d.length(); mesh.position.copy(a).add(b).multiplyScalar(0.5); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); mesh.scale.set(radius, Math.max(L, 0.001), radius); }
  function tween(ms, fn, done){ const t = { t0: performance.now(), ms: api.reduced ? 0 : ms, fn, done }; if (!t.ms){ fn(1); done && done(); return; } state.tweens.push(t); }
  function later(ms, fn){ if (api.reduced){ fn(); return; } state.timers.push(setTimeout(fn, ms)); }
  function cancelAll(){ state.timers.forEach(clearTimeout); state.timers = []; state.tweens = []; }

  function build(groups, order){
    cancelAll(); clear(body); labels.replaceChildren(); state.labelNodes = []; state.badgeNodes = [];
    letter.className = 'l3w-letter'; letter.replaceChildren();
    mol.quaternion.identity(); spin.rotation.set(0, 0, 0); state.base = { x: 0, y: 0 };
    const m = buildMolecule(groups);
    state.atoms = m.atoms.map(a => {
      const e = ELEMENT[a.el], r = RADIUS[a.el];
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), new THREE.MeshPhysicalMaterial({ color: e.color, roughness: e.rough, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.22, envMapIntensity: 1.1 }));
      mesh.castShadow = true; mesh.receiveShadow = true;
      mesh.position.set(a.p[0], a.p[1], a.p[2]).multiplyScalar(SCALE);
      mesh.userData.atom = a; body.add(mesh); return mesh;
    });
    state.bonds = [];
    for (const b of m.bonds){
      const toH = m.atoms[b.a].el === 'H' || m.atoms[b.b].el === 'H', n = b.order === 2 ? 2 : 1;
      for (let k = 0; k < n; k++){
        const mesh = new THREE.Mesh(unitCyl, bondMat); mesh.castShadow = true; mesh.receiveShadow = true;
        const pa = state.atoms[b.a].position.clone(), pb = state.atoms[b.b].position.clone();
        if (n === 2){ const dir = pb.clone().sub(pa).normalize(); const perp = new THREE.Vector3().crossVectors(dir, Math.abs(dir.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)).normalize().multiplyScalar(k ? 0.1 : -0.1); pa.add(perp); pb.add(perp); }
        setBond(mesh, pa, pb, n === 2 ? 0.055 : (toH ? 0.062 : 0.088));
        body.add(mesh); state.bonds.push(mesh);
      }
    }
    for (const mesh of state.atoms){
      const a = mesh.userData.atom; if (a.role !== 'anchor') continue;
      const d = api.el('div', { class: 'l3w-lab' }, htmlLabel(api, groups[a.group].label));
      labels.append(d); state.labelNodes.push({ el: d, mesh, group: a.group });
    }
    const low = groups[order[3]].pos;
    state.qAway = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(low[0], low[1], low[2]).normalize(), new THREE.Vector3(0, 0, -1));
    let rad = 0; for (const mesh of state.atoms) rad = Math.max(rad, mesh.position.length() + RADIUS[mesh.userData.atom.el]);
    const dist = Math.max(5.6, (rad + 0.7) / Math.tan(camera.fov * Math.PI / 360) * 0.98);
    camera.position.set(0, 0.15, dist); camera.lookAt(0, 0, 0);
    state.swayFrom = performance.now();
  }
  function badges(seq){
    state.badgeNodes.forEach(n => n.el.remove()); state.badgeNodes = [];
    seq.forEach((gi, k) => {
      const node = state.labelNodes.find(n => n.group === gi); if (!node) return;
      const d = api.el('div', { class: 'l3w-badge', text: String(k + 1) }); labels.append(d);
      state.badgeNodes.push({ el: d, mesh: node.mesh, group: gi, badge: true });
      later(k * 140, () => d.classList.add('in'));
    });
  }
  function view(name){
    const target = name === 'away' ? state.qAway.clone() : new THREE.Quaternion();
    const from = mol.quaternion.clone(), bx = state.base.x, by = state.base.y;
    tween(900, k => { const e = easeInOut(k); mol.quaternion.slerpQuaternions(from, target, e); state.base = { x: bx * (1 - e), y: by * (1 - e) }; });
    state.swayFrom = performance.now();
  }
  function showLetter(ch, cap){ letter.replaceChildren(ch, api.el('small', { text: cap })); later(20, () => letter.classList.add('in')); }
  function hideLetter(){ letter.classList.remove('in'); }

  // drag to rotate (the sway rides on top of the student's rotation)
  const cv = renderer.domElement; let drag = null;
  cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; state.dragging = true; try { cv.setPointerCapture(e.pointerId); } catch (err) {} });
  const endDrag = () => { drag = null; state.dragging = false; };
  cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);
  cv.addEventListener('pointermove', e => { if (!drag) return; state.base.y += (e.clientX - drag.x) * 0.008; state.base.x += (e.clientY - drag.y) * 0.008; drag = { x: e.clientX, y: e.clientY }; hint.style.opacity = '0'; });

  function project(v){ const p = v.clone().project(camera); const w = stage.clientWidth, h = stage.clientHeight; return { x: (p.x + 1) / 2 * w, y: (1 - p.y) / 2 * h }; }
  function placeLabels(){
    const center = new THREE.Vector3(); mol.getWorldPosition(center); const cs = project(center);
    const camDir = new THREE.Vector3(); camera.getWorldDirection(camDir);
    const h = stage.clientHeight || 400, dist = camera.position.length();
    const pxPerUnit = (h / 2) / (dist * Math.tan(camera.fov * Math.PI / 360));
    for (const n of state.labelNodes.concat(state.badgeNodes)){
      const wp = new THREE.Vector3(); n.mesh.getWorldPosition(wp); const s = project(wp);
      const depth = wp.clone().sub(center).dot(camDir);
      let x = s.x, y = s.y;
      if (!n.badge){
        let dx = s.x - cs.x, dy = s.y - cs.y, L = Math.hypot(dx, dy);
        if (L < 12){ dx = 0; dy = 1; L = 1; s.y += 20; }
        const el = n.mesh.userData.atom.el, rPx = RADIUS[el] * pxPerUnit, gap = el === 'H' ? 20 : 34;
        x = s.x + dx / L * (rPx + gap); y = s.y + dy / L * (rPx + gap);
      }
      n.el.style.left = x.toFixed(1) + 'px'; n.el.style.top = y.toFixed(1) + 'px';
      n.el.style.opacity = depth > 0.9 ? (n.badge ? '0.8' : '0.55') : '';
      n.el.style.zIndex = depth > 0 ? '1' : '3';
    }
  }
  function resize(){ const w = stage.clientWidth || 640, h = Math.max(1, stage.clientHeight || Math.round(w * 10 / 16)); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  function step(){
    const now = performance.now();
    for (const t of state.tweens.slice()){ const k = Math.min(1, (now - t.t0) / t.ms); t.fn(k); if (k >= 1){ state.tweens.splice(state.tweens.indexOf(t), 1); t.done && t.done(); } }
    let sx = 0, sy = 0;
    if (!state.dragging && !api.reduced){ const s = (now - state.swayFrom) / 1000; sy = Math.sin(s * 0.5) * 0.07; sx = Math.sin(s * 0.33) * 0.03; }
    spin.rotation.set(state.base.x + sx, state.base.y + sy, 0);
    renderer.render(scene, camera);
    placeLabels();
  }
  function tick(){ if (!state.visible || document.hidden){ state.raf = 0; return; } state.raf = requestAnimationFrame(tick); step(); }
  function wake(){ if (state.visible && !document.hidden && !state.raf) tick(); }
  if (typeof IntersectionObserver === 'function'){ new IntersectionObserver(es => { state.visible = es.some(e => e.isIntersecting); wake(); }, { threshold: 0.02 }).observe(stage); }
  else { state.visible = true; wake(); }
  document.addEventListener('visibilitychange', wake);
  if (typeof ResizeObserver === 'function') new ResizeObserver(resize).observe(stage); else window.addEventListener('resize', resize);
  resize();
  return { build, badges, view, showLetter, hideLetter, resize };
}

/* ------------------------------------------------------------------ */
/* Styles for this root (scoped by prefix)                              */
/* ------------------------------------------------------------------ */
const CSS = `
.l3w-grid{display:grid;grid-template-columns:5fr 7fr;gap:14px;align-items:stretch}
.l3w-paper{background:radial-gradient(120% 90% at 50% 40%,#f6efdd,#e5dbc3);border-radius:10px;padding:10px 12px;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 1px rgba(60,40,10,.14),0 16px 30px -18px rgba(0,0,0,.9);min-height:200px}
.l3w-paper svg{width:100%;height:auto;max-height:360px}
.l3w-stage{position:relative;aspect-ratio:16/10;background:#0e0c08;border:1px solid var(--line);border-radius:10px;overflow:hidden;box-shadow:0 30px 60px -30px rgba(0,0,0,.8),inset 0 0 0 1px rgba(255,255,255,.02)}
.l3w-stage canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:grab;border-radius:0}
.l3w-stage canvas:active{cursor:grabbing}
.l3w-labels{position:absolute;inset:0;pointer-events:none}
.l3w-lab{position:absolute;left:0;top:0;transform:translate(-50%,-50%);font-family:Georgia,serif;font-weight:600;font-size:16px;line-height:1;color:#f4efe2;background:rgba(18,16,11,.78);padding:4px 8px 5px;border-radius:6px;white-space:nowrap;box-shadow:0 1px 6px rgba(0,0,0,.5);transition:opacity .25s}
.l3w-lab sub{font-size:.68em;line-height:0;vertical-align:-.3em}
.l3w-badge{position:absolute;left:0;top:0;width:22px;height:22px;border-radius:50%;background:linear-gradient(180deg,#f3e2a6,#c9a84c);color:#1a160c;font-family:ui-monospace,Menlo,monospace;font-weight:700;font-size:12px;display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.7),0 0 0 2px rgba(18,16,11,.85);opacity:0;transform:translate(-50%,-50%) scale(.4);transition:opacity .35s,transform .45s cubic-bezier(.2,1.4,.4,1)}
.l3w-badge.in{opacity:1;transform:translate(-50%,-50%) scale(1)}
.l3w-letter{position:absolute;right:16px;bottom:10px;font-family:Georgia,serif;font-size:60px;line-height:1;color:var(--goldhi);text-shadow:0 0 22px rgba(230,208,138,.55),0 2px 10px rgba(0,0,0,.8);opacity:0;transition:opacity .4s;pointer-events:none;text-align:right}
.l3w-letter.in{opacity:1}
.l3w-letter small{display:block;font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink2);text-shadow:none;margin-top:4px}
.l3w-hint{position:absolute;left:12px;top:10px;font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink3);pointer-events:none;transition:opacity .6s}
.l3w-fallback{color:var(--ink3);font-size:14px;padding:16px}
.l3w-cap{color:var(--ink2);font-size:15px;margin:10px 0 0;min-height:1.5em}
.l3w-cap b{color:var(--goldhi);font-weight:600}
.l3w-link{font-size:13px;color:var(--ink3);margin:8px 0 0}
.l3w-fig{max-width:300px;margin:0 0 4px;padding:6px 10px}
.l3w-fig svg{max-height:250px}
@media (max-width:760px){.l3w-grid{grid-template-columns:1fr}}
`;

/* ------------------------------------------------------------------ */
/* mount                                                                */
/* ------------------------------------------------------------------ */
export function mount(slots, api){
  slots.visual.append(api.el('style', { text: CSS }));
  const paper = api.el('div', { class: 'l3w-paper' });
  const stage = api.el('div', { class: 'l3w-stage', 'aria-label': 'The same molecule in three dimensions. Drag to rotate.' });
  const grid = api.el('div', { class: 'l3w-grid' }, paper, stage);
  const controls = api.el('div', { class: 'controls' });
  const caption = api.el('p', { class: 'l3w-cap' });
  const link = api.el('p', { class: 'l3w-link' }, api.el('a', { href: '../../../games/chirality/', text: 'Play the full Chirality Bench' }), ' for the animated reveal, round after round.');
  slots.visual.append(grid, controls, caption, link);
  const bench = makeBench(api, stage);

  const vis = { item: null, numbered: false, view: 'page' };
  const chipPage = api.el('button', { type: 'button', class: 'chip', 'aria-pressed': 'true', onclick: () => setView('page') }, 'Face the page');
  const chipAway = api.el('button', { type: 'button', class: 'chip', 'aria-pressed': 'false', onclick: () => setView('away') }, 'H away');
  const chipNum = api.el('button', { type: 'button', class: 'chip', 'aria-pressed': 'false', onclick: doNumbers }, 'Do the numbers');
  const chipNew = api.el('button', { type: 'button', class: 'chip', onclick: () => load(makeItem(api.rng, 1)) }, 'Another molecule');
  controls.append(chipPage, chipAway, chipNum, chipNew);

  function setCaption(parts){ caption.replaceChildren(...parts.map(p => typeof p === 'string' ? p : (p.lab != null ? api.el('b', {}, htmlLabel(api, p.lab)) : api.el('b', { text: p.b })))); }
  function redraw(){ paper.replaceChildren(drawWedgeDash(api, vis.item, { badges: vis.numbered ? vis.item.seq : null })); }
  function load(it){
    vis.item = it; vis.numbered = false; vis.view = 'page';
    chipNum.setAttribute('aria-pressed', 'false'); chipPage.setAttribute('aria-pressed', 'true'); chipAway.setAttribute('aria-pressed', 'false');
    redraw();
    if (bench){ bench.build(it.groups, it.order); bench.hideLetter(); }
    const w = it.groups[it.wedgeIdx].label, d = it.groups[it.dashIdx].label;
    setCaption(['The ', { lab: w }, ' is on the wedge, coming toward you. The ', { lab: d }, ' is on the dash, going away. Drag the model to walk around it, then do the numbers.']);
  }
  function names(it){ const out = []; it.seq.forEach((gi, k) => { if (k) out.push(', '); out.push((k + 1) + ' '); out.push({ lab: it.groups[gi].label }); }); return out; }
  function describe(){
    const it = vis.item;
    if (vis.view === 'away'){
      setCaption(['Now H points away. Trace '].concat(names(it), [' straight: ', { b: it.answer }, '. That is the letter.']));
      if (bench) bench.showLetter(it.answer, 'H away');
    } else {
      const tail = it.hAt === 'wedge' ? ['H is on a ', { b: 'wedge' }, ', pointing at you, so flip it: ', { b: it.answer }, '.'] : ['H is on a ', { b: 'dash' }, ', already pointing away, so keep it: ', { b: it.answer }, '.'];
      setCaption(['Priorities: '].concat(names(it), ['. Off the page it traces ', { b: it.apparent }, '. '], tail));
      if (bench) bench.hideLetter();
    }
  }
  function doNumbers(){
    vis.numbered = true; chipNum.setAttribute('aria-pressed', 'true'); redraw();
    if (bench) bench.badges(vis.item.seq);
    describe();
  }
  function setView(name){
    vis.view = name; chipPage.setAttribute('aria-pressed', String(name === 'page')); chipAway.setAttribute('aria-pressed', String(name === 'away'));
    if (bench) bench.view(name);
    if (vis.numbered) describe();
    else setCaption(name === 'away' ? ['H points away from you now. Do the numbers and trace 1 to 2 to 3 to read the letter straight.'] : ['Facing the page: wedge toward you, dash away. Do the numbers to badge the priorities.']);
  }
  load(makeItem(api.rng, 1));

  /* ---------------- you try ---------------- */
  const host = slots.try;
  let count = 0, cur = null;
  function next(){
    count++;
    const kind = count % 2 === 1 ? 'toward' : 'rs';
    cur = { it: makeItem(api.rng, kind === 'rs' ? 2 : 1), kind, done: false, misses: 0 };
    render();
  }
  function render(){
    api.clearCoach(); host.replaceChildren();
    const { it, kind } = cur;
    const box = api.el('div', { class: 'item' });
    box.append(api.el('p', { class: 'prompt', text: kind === 'toward' ? 'Which group is pointing at you?' : 'R or S?' }));
    box.append(api.el('div', { class: 'l3w-paper l3w-fig' }, drawWedgeDash(api, it, {})));
    const opts = kind === 'toward'
      ? api.shuffle(it.groups.map((g, i) => i)).map(i => ({ node: htmlLabel(api, it.groups[i].label), ok: i === it.wedgeIdx, why: whyToward(it, i) }))
      : [{ node: 'R', ok: it.answer === 'R', why: whyRS(it, 'R') }, { node: 'S', ok: it.answer === 'S', why: whyRS(it, 'S') }, { node: 'Achiral, not a stereocenter', ok: it.answer === 'achiral', why: whyRS(it, 'achiral') }];
    const grid = api.el('div', { class: 'opts' }), verdict = api.el('div', { class: 'verdict' }), after = api.el('div', { class: 'controls' });
    opts.forEach((o, i) => {
      const b = api.el('button', { type: 'button', class: 'opt', onclick: () => choose(b, o) }, api.el('span', { class: 'k', text: 'ABCD'[i] }), api.el('span', {}, o.node));
      grid.append(b);
    });
    function choose(btn, o){
      if (cur.done) return;
      btn.classList.add('picked');
      if (o.ok){
        cur.done = true; btn.classList.add('ok');
        for (const b of grid.querySelectorAll('button')) b.disabled = true;
        verdict.className = 'verdict good'; verdict.textContent = 'You can read it.';
        if (cur.misses === 0) api.report(true);
        api.clearCoach();
        after.append(
          api.el('button', { type: 'button', class: 'primary', onclick: next }, 'Another one'),
          api.el('button', { type: 'button', class: 'secondary', onclick: () => { load(it); if (it.kind === 'RS') doNumbers(); slots.visual.scrollIntoView({ block: 'nearest', behavior: api.reduced ? 'auto' : 'smooth' }); } }, 'See this one in 3D')
        );
      } else {
        cur.misses++; if (cur.misses === 1) api.report(false);
        btn.disabled = true;
        verdict.className = 'verdict notyet'; verdict.textContent = 'Not yet.';
        api.coach(o.why);
      }
    }
    box.append(grid, verdict, after); host.append(box);
  }
  next();
}

/* ------------------------------------------------------------------ */
/* selfTest: node-safe, no DOM, no THREE                                 */
/* ------------------------------------------------------------------ */
export function selfTest(){
  const notes = [];
  const fail = m => { notes.push(m); };
  // 1. Calibration: butan-2-ol with CH3 left, CH2CH3 right (in plane), OH on a
  //    dash up, H on a wedge down is S. Two honest tetrahedral placements of
  //    that drawing, one regular and one loosely drawn; both must read S.
  const calA = configFromGeometry([[0, 0.577, -0.816], [0.816, -0.577, 0], [-0.816, -0.577, 0], [0, 0.577, 0.816]]);
  const calB = configFromGeometry([[0, 0.85, -0.5], [0.9, 0, -0.3], [-0.9, 0, -0.3], [0, -0.6, 0.8]]);
  if (calA !== 'S' || calB !== 'S') fail('calibration: butan-2-ol must be S, got ' + calA + '/' + calB);
  // and the mirror image of that drawing is R
  if (configFromGeometry([[0, 0.577, -0.816], [-0.816, -0.577, 0], [0.816, -0.577, 0], [0, 0.577, 0.816]]) !== 'R') fail('calibration mirror must be R');
  // 2. The pose is a regular tetrahedron
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++){ const ang = Math.acos(vdot(vunit(POSE[i]), vunit(POSE[j]))) * 180 / Math.PI; if (Math.abs(ang - 109.47) > 0.3) fail('pose angle ' + i + j + ' = ' + ang.toFixed(2)); }
  // 3. Generated domain
  let tried = 0, rs = 0, decoys = 0, wedgeH = 0, dashH = 0;
  for (let seed = 1; seed <= 260; seed++){
    const rng = mulberry32(seed), it = makeItem(rng, seed % 2 ? 1 : 2); tried++;
    const wedges = it.groups.filter(g => g.depth === 'wedge').length, dashes = it.groups.filter(g => g.depth === 'dash').length;
    if (wedges !== 1 || dashes !== 1) fail('seed ' + seed + ': need exactly one wedge and one dash');
    if (it.groups[it.order[3]].key !== 'H') fail('seed ' + seed + ': lowest must be H');
    if (it.hAt !== 'wedge' && it.hAt !== 'dash') fail('seed ' + seed + ': H must be on the wedge or the dash');
    if (it.kind === 'RS'){
      rs++;
      const distinct = new Set(it.groups.map(g => g.key)).size; if (distinct !== 4) fail('seed ' + seed + ': RS item needs four distinct groups');
      // the H-flip rule, implicit in the geometry
      if (it.hAt === 'wedge'){ wedgeH++; if (it.answer === it.apparent) fail('seed ' + seed + ': H on a wedge must flip the traced letter'); }
      else { dashH++; if (it.answer !== it.apparent) fail('seed ' + seed + ': H on a dash must keep the traced letter'); }
      // mirroring every center flips
      if (mirrorItem(it) === it.answer) fail('seed ' + seed + ': mirror image must flip R/S');
      // choices unique
      const oks = ['R', 'S', 'achiral'].filter(c => c === it.answer).length; if (oks !== 1) fail('seed ' + seed + ': answer not unique');
    } else {
      decoys++;
      const keys = it.groups.map(g => g.key); if (new Set(keys).size !== 3) fail('seed ' + seed + ': decoy needs one matching pair');
      if (it.answer !== 'achiral') fail('seed ' + seed + ': decoy answer');
    }
    // toward question: exactly one correct
    if (it.groups.filter((g, i) => i === it.wedgeIdx).length !== 1) fail('seed ' + seed + ': toward answer not unique');
    // determinism
    const again = makeItem(mulberry32(seed), seed % 2 ? 1 : 2);
    if (JSON.stringify(again) !== JSON.stringify(it)) fail('seed ' + seed + ': not reproducible');
  }
  if (rs < 150 || decoys < 10 || wedgeH < 40 || dashH < 40) fail('domain too thin: rs ' + rs + ' decoys ' + decoys + ' wedgeH ' + wedgeH + ' dashH ' + dashH);
  // 4. Both letters occur
  const letters = new Set(); for (let s = 1; s <= 40; s++){ const it = makeItem(mulberry32(s), 1); letters.add(it.answer); } if (letters.size !== 2) fail('both R and S must occur');
  return { ok: notes.length === 0, tried, notes: notes.join('; ') || ('calibration S ok, ' + rs + ' R/S, ' + decoys + ' decoys, H on wedge ' + wedgeH + ', H on dash ' + dashH) };
}
