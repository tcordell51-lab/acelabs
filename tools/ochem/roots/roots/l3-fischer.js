// The Roots of Organic, level 3, root 4: Horizontal toward you (Fischer projections).
//
// A Fischer cross is converted to coordinates (horizontal at +z toward the
// viewer, vertical at -z away) and R or S is computed from the geometry with
// the same calibrated signed-volume rule as the wedge root, never authored.
// Swaps and rotations are done on the cross and re-read from the geometry, so
// "one swap flips, 180 keeps, 90 flips" are consequences here, not claims.

export const meta = {
  id: 'l3-fischer',
  level: 3,
  order: 4,
  needs3D: true,
  title: 'Horizontal toward you',
  concept: 'Fischer projections',
  tagline: 'A cross where every horizontal bond comes at you. One swap flips the letter.',
  story: 'A Fischer projection is a cross. Every intersection is a carbon, the horizontal bonds come toward you, and the vertical bonds go back into the page. That is a rule, not something that just happens. R and S is the same move as always: do the numbers, then find the lowest priority. On a vertical bond it already points away, so trace 1 to 2 to 3 and take the letter. On a horizontal bond it points at you, so trace and flip. Two more things to own: swapping any two groups flips the letter, and two swaps bring it back. Turn the whole cross 180 degrees in the plane and nothing changes. Turn it 90 degrees and you broke the rule, so it flipped. Rule of thumb: horizontal toward you, vertical away, one swap flips.',
  moveName: 'Horizontal toward you, vertical away, one swap flips',
  move: [
    'Every horizontal bond comes toward you, every vertical bond goes away. Every intersection is a carbon.',
    'Do the numbers, then find the lowest priority. On a vertical bond, trace 1 to 2 to 3 and keep the letter.',
    'Lowest priority on a horizontal bond? It is pointing at you: trace 1 to 2 to 3 and flip.',
    'Swapping any two groups flips the letter. A 180 turn keeps it. A 90 turn flips it, because it broke horizontal-toward.'
  ],
  trap: 'Careful: A 90 degree rotation of a Fischer projection is a different molecule, because the groups that were coming toward you are now going away.',
  holdsUp: ['Sugars in bio', 'Meso identification', 'Comparing two Fischer projections', 'Every R and S question'],
  drill: 'Booster OChem: Conformations and Stereochemistry'
};

/* ------------------------------------------------------------------ */
/* CIP table and the calibrated R/S math                                */
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
function vsub(a, b){ return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function vadd(a, b){ return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
function vscale(a, s){ return [a[0] * s, a[1] * s, a[2] * s]; }
function vcross(a, b){ return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function vdot(a, b){ return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function vlen(a){ return Math.sqrt(vdot(a, a)); }
function vunit(a){ const l = vlen(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
// pos = four [x,y,z] for priorities 1..4 (index 3 lowest). vol < 0 is R,
// calibrated against butan-2-ol (S) and re-checked in selfTest.
function configFromGeometry(pos){
  const a = vsub(pos[0], pos[3]), b = vsub(pos[1], pos[3]), c = vsub(pos[2], pos[3]);
  return vdot(a, vcross(b, c)) < 0 ? 'R' : 'S';
}
function apparentFromPage(pos){ const a = pos[0], b = pos[1], c = pos[2]; const cr = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]); return cr < 0 ? 'R' : 'S'; }
function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ------------------------------------------------------------------ */
/* The Fischer cross as geometry                                        */
/* ------------------------------------------------------------------ */
// Slot order: top, right, bottom, left. Horizontal toward (+z), vertical away
// (-z), and the four directions form a regular tetrahedron.
const SLOTS = ['top', 'right', 'bottom', 'left'];
const FPOS = [[0, 0.816, -0.577], [0.816, 0, 0.577], [0, -0.816, -0.577], [-0.816, 0, 0.577]];
const SLOT2D = [[0, 1], [1, 0], [0, -1], [-1, 0]];
function isHorizontal(slot){ return slot === 1 || slot === 3; }
// slots: array of 4 group objects in slot order. Returns { config, order, apparent, lowSlot }.
function readCross(slots){
  const order = [0, 1, 2, 3].sort((a, b) => slots[a].rank - slots[b].rank);
  const pos = order.map(s => FPOS[s]);
  const flat = order.map(s => [SLOT2D[s][0], SLOT2D[s][1], 0]);
  return { config: configFromGeometry(pos), apparent: apparentFromPage(flat), order, seq: order.slice(0, 3), lowSlot: order[3] };
}
function swapSlots(slots, i, j){ const s = slots.slice(); const t = s[i]; s[i] = s[j]; s[j] = t; return s; }
function rot180(slots){ return [slots[2], slots[3], slots[0], slots[1]]; }
function rot90(slots){ return [slots[3], slots[0], slots[1], slots[2]]; }   // clockwise on the page: left goes to top, top to right

function randomSlots(rng){
  const ri = n => Math.floor(rng() * n);
  const pool = GROUPS.slice(0, 9), chosen = [];
  while (chosen.length < 3){ const g = pool[ri(pool.length)]; if (chosen.indexOf(g) < 0) chosen.push(g); }
  const four = chosen.concat([GROUPS[9]]);
  for (let i = four.length - 1; i > 0; i--){ const j = ri(i + 1), t = four[i]; four[i] = four[j]; four[j] = t; }
  return four;
}
// variant: 'plain' | 'swap' | 'rot90'
function makeItem(rng, variant){
  const ri = n => Math.floor(rng() * n);
  const slots = randomSlots(rng);
  const base = readCross(slots);
  let pair = null, after = slots, answer = base.config;
  if (variant === 'swap'){
    const i = ri(4); let j = ri(3); if (j >= i) j++;
    pair = [Math.min(i, j), Math.max(i, j)];
    after = swapSlots(slots, pair[0], pair[1]);
    answer = readCross(after).config;
  } else if (variant === 'rot90'){
    after = rot90(slots);
    answer = readCross(after).config;
  }
  return { variant, slots, pair, after, base, answer };
}

/* ------------------------------------------------------------------ */
/* Coaching                                                             */
/* ------------------------------------------------------------------ */
function whyMiss(it){
  const b = it.base, names = b.seq.map(s => it.slots[s].label).join(' to ');
  if (it.variant === 'swap') return 'One swap flips the letter. This cross reads ' + b.config + ', so after the swap it is ' + it.answer + '.';
  if (it.variant === 'rot90') return 'A 90 degree turn breaks horizontal-toward, so the letter flips: this cross reads ' + b.config + ', the turned one reads ' + it.answer + '.';
  if (isHorizontal(b.lowSlot)) return 'H is on a horizontal bond, coming at you. Trace ' + names + ' (' + b.apparent + ' as drawn), then flip it.';
  return 'H is on a vertical bond, already going away. Trace ' + names + ' and keep what you read: ' + b.config + '.';
}

/* ------------------------------------------------------------------ */
/* Labels with real subscripts                                          */
/* ------------------------------------------------------------------ */
function runs(label){ return String(label).split(/(\d+)/).filter(Boolean).map(r => ({ t: r, sub: /^\d+$/.test(r) })); }
function svgLabel(api, label, x, y, anchor, size, fill){
  const t = api.svg('text', { x, y, 'text-anchor': anchor, 'font-family': 'Georgia, serif', 'font-weight': 600, 'font-size': size, fill });
  let up = 0;
  for (const r of runs(label)){
    if (r.sub){ t.append(api.svg('tspan', { dy: size * 0.28, 'font-size': size * 0.66 }, r.t)); up = -size * 0.28; }
    else { t.append(api.svg('tspan', up ? { dy: up } : {}, r.t)); up = 0; }
  }
  return t;
}
function htmlLabel(api, label){ const s = api.el('span', {}); for (const r of runs(label)) s.append(r.sub ? api.el('sub', { text: r.t }) : r.t); return s; }

/* ------------------------------------------------------------------ */
/* 2D: the Fischer cross                                                */
/* ------------------------------------------------------------------ */
const CX = 150, CY = 150, ARM = 78;
function slotPoint(s){ return [CX + SLOT2D[s][0] * ARM, CY - SLOT2D[s][1] * ARM]; }
function labelSpot(s){ const gap = isHorizontal(s) ? 12 : 22; const p = slotPoint(s); return { x: p[0] + SLOT2D[s][0] * gap, y: p[1] - SLOT2D[s][1] * gap + 6, anchor: s === 1 ? 'start' : (s === 3 ? 'end' : 'middle') }; }
// opts: { depth, badges (seq of slot indices), lit (slot indices), group (return inner g) }
function drawCross(api, slots, opts){
  opts = opts || {};
  const ink = '#1c1913', gold = api.colors.gold || '#C9A84C', litInk = '#8a6a12';
  const s = api.svg('svg', { viewBox: '0 0 300 300', role: 'img', 'aria-label': 'A Fischer projection: a cross with four groups' });
  const g = api.svg('g', {}); s.append(g);
  if (opts.depth){
    for (const h of [1, 3]){ const p = slotPoint(h), px = 0, py = 1; g.append(api.svg('polygon', { points: `${CX},${CY} ${p[0]},${p[1] + 7 * py} ${p[0]},${p[1] - 7 * py}`, fill: ink })); }
    for (const v of [0, 2]){ const p = slotPoint(v); for (let t = 0.14; t <= 1.001; t += 0.12){ const w = 2 + t * 6, y = CY + (p[1] - CY) * t; g.append(api.svg('line', { x1: CX - w, y1: y.toFixed(1), x2: CX + w, y2: y.toFixed(1), stroke: ink, 'stroke-width': 2.4, 'stroke-linecap': 'round' })); } }
  } else {
    g.append(api.svg('line', { x1: CX, y1: CY - ARM, x2: CX, y2: CY + ARM, stroke: ink, 'stroke-width': 2.6, 'stroke-linecap': 'round' }));
    g.append(api.svg('line', { x1: CX - ARM, y1: CY, x2: CX + ARM, y2: CY, stroke: ink, 'stroke-width': 2.6, 'stroke-linecap': 'round' }));
  }
  const labels = [];
  slots.forEach((grp, si) => {
    const L = labelSpot(si), lit = (opts.lit || []).indexOf(si) >= 0;
    if (lit){ const p = slotPoint(si); g.append(api.svg('circle', { cx: L.x, cy: L.y - 6, r: 20, fill: 'rgba(201,168,76,.28)', stroke: gold, 'stroke-width': 1.5 })); void p; }
    const t = svgLabel(api, grp.label, L.x, L.y, L.anchor, 19, lit ? litInk : ink);
    t.dataset.slot = String(si); g.append(t); labels.push(t);
    const k = opts.badges ? opts.badges.indexOf(si) : -1;
    if (k >= 0){
      const p = slotPoint(si), bx = p[0] + (isHorizontal(si) ? 0 : 0), by = p[1];
      g.append(api.svg('circle', { cx: bx, cy: by, r: 11, fill: gold, stroke: '#3a2c08', 'stroke-width': 1 }));
      g.append(api.svg('text', { x: bx, y: by + 4.5, 'text-anchor': 'middle', 'font-family': 'ui-monospace, Menlo, monospace', 'font-weight': 700, 'font-size': 13, fill: '#1a160c' }, String(k + 1)));
    }
  });
  if (opts.group) opts.group.g = g; if (opts.group) opts.group.labels = labels;
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
function sp3Dirs(back, phase){ const f = frame(back), u = f[0], e1 = f[1], e2 = f[2], out = [], tilt = Math.PI - TET; for (let k = 0; k < 3; k++){ const a = phase + k * 2 * Math.PI / 3; out.push(vunit(vadd(vscale(u, -Math.cos(tilt)), vadd(vscale(e1, Math.sin(tilt) * Math.cos(a)), vscale(e2, Math.sin(tilt) * Math.sin(a)))))); } return out; }
function sp2Dirs(back, phase){ const f = frame(back), u = f[0], e1 = f[1], e2 = f[2], out = [], tilt = Math.PI / 3; for (let k = 0; k < 2; k++){ const a = phase + Math.PI / 2 + k * Math.PI; out.push(vunit(vadd(vscale(u, -Math.cos(tilt)), vadd(vscale(e1, Math.sin(tilt) * Math.cos(a)), vscale(e2, Math.sin(tilt) * Math.sin(a)))))); } return out; }
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
    case 'Et': { const c1 = atom('C', vscale(d, BOND.CC), 'anchor'); bond(-1, c1); const ds = sp3Dirs(vscale(d, -1), phase); const c2 = atom('C', vadd(A[c1].p, vscale(ds[0], BOND.CC))); bond(c1, c2); for (let k = 1; k < 3; k++){ const h = atom('H', vadd(A[c1].p, vscale(ds[k], BOND.CH))); bond(c1, h); } sp3Dirs(vscale(ds[0], -1), sub).forEach(dd => { const h = atom('H', vadd(A[c2].p, vscale(dd, BOND.CH))); bond(c2, h); }); break; }
    case 'CH2OH': { const c = atom('C', vscale(d, BOND.CC), 'anchor'); bond(-1, c); const ds = sp3Dirs(vscale(d, -1), phase); const o = atom('O', vadd(A[c].p, vscale(ds[0], BOND.CO))); bond(c, o); for (let k = 1; k < 3; k++){ const h = atom('H', vadd(A[c].p, vscale(ds[k], BOND.CH))); bond(c, h); } const oh = atom('H', vadd(A[o].p, vscale(sp3Dirs(vscale(ds[0], -1), sub)[0], BOND.OH))); bond(o, oh); break; }
    case 'CHO': { const c = atom('C', vscale(d, BOND.CC), 'anchor'); bond(-1, c); const ds = sp2Dirs(vscale(d, -1), phase); const o = atom('O', vadd(A[c].p, vscale(ds[0], BOND.CO2))); bond(c, o, 2); const h = atom('H', vadd(A[c].p, vscale(ds[1], BOND.CH))); bond(c, h); break; }
    case 'COOH': { const c = atom('C', vscale(d, BOND.CC), 'anchor'); bond(-1, c); const ds = sp2Dirs(vscale(d, -1), phase); const o1 = atom('O', vadd(A[c].p, vscale(ds[0], BOND.CO2))); bond(c, o1, 2); const o2 = atom('O', vadd(A[c].p, vscale(ds[1], BOND.CO))); bond(c, o2); const h = atom('H', vadd(A[o2].p, vscale(sp3Dirs(vscale(ds[1], -1), sub)[0], BOND.OH))); bond(o2, h); break; }
  }
}
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
  for (let round = 0; round < 3; round++){ let moved = false; order.forEach(gi => { const b = bestFor(gi); if (b.score > placed[gi].score + 1e-6){ placed[gi] = b; moved = true; } }); if (!moved) break; }
  groups.forEach((_, gi) => { const base = atoms.length; placed[gi].A.forEach(a => atoms.push(a)); placed[gi].B.forEach(b => bonds.push({ a: b.a < 0 ? 0 : b.a + base, b: b.b + base, order: b.order })); });
  return { atoms, bonds };
}

/* ------------------------------------------------------------------ */
/* 3D bench with rigid-group morphing                                   */
/* ------------------------------------------------------------------ */
const SCALE = 0.78;
const RADIUS = { C: 0.34, N: 0.33, O: 0.32, Cl: 0.44, Br: 0.5, H: 0.2 };
const ELEMENT = { C: { color: 0x2b2926, rough: 0.32 }, H: { color: 0xf4f1e9, rough: 0.42 }, O: { color: 0xc42f1d, rough: 0.28 }, N: { color: 0x2c5ad4, rough: 0.28 }, Cl: { color: 0x3fb257, rough: 0.28 }, Br: { color: 0x8c2810, rough: 0.28 } };
function easeInOut(k){ return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
function studioEnvironment(THREE, renderer){
  const pm = new THREE.PMREMGenerator(renderer);
  const room = new THREE.Scene();
  room.add(new THREE.Mesh(new THREE.BoxGeometry(24, 24, 24), new THREE.MeshStandardMaterial({ color: 0x16140f, side: THREE.BackSide, roughness: 1 })));
  const panel = (w, h, color, intensity, pos) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide })); m.position.set(pos[0], pos[1], pos[2]); m.lookAt(0, 0, 0); room.add(m); };
  panel(7, 3.5, 0xfff0d2, 9, [0, 9, 3]); panel(3, 7, 0xd6e3ff, 3.5, [-10, 2, 4]); panel(4, 5, 0xffe2b0, 5, [8, 3, -8]); panel(12, 2, 0xffffff, 1.2, [0, -4, 10]);
  const tex = pm.fromScene(room, 0.04).texture; pm.dispose(); return tex;
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
  } catch (e){ stage.append(api.el('p', { class: 'l3f-fallback', text: 'The 3D view needs WebGL, which this browser has turned off. The cross and the move still stand.' })); return null; }
  const scene = new THREE.Scene();
  const env = studioEnvironment(THREE, renderer);
  scene.environment = env; scene.background = env; scene.backgroundBlurriness = 1; scene.backgroundIntensity = 0.16;
  const camera = new THREE.PerspectiveCamera(34, 16 / 10, 0.1, 60); camera.position.set(0, 0.15, 7.4); camera.lookAt(0, 0, 0);
  const key = new THREE.DirectionalLight(0xfff1d8, 2.4); key.position.set(2.6, 4.2, 5.5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 20 }); scene.add(key);
  const fill = new THREE.DirectionalLight(0xcfdcff, 0.55); fill.position.set(-4, 1, 3); scene.add(fill);
  scene.add(new THREE.HemisphereLight(0x9a917f, 0x14120e, 0.35));
  const slab = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: 0x15120b, roughness: 0.92, metalness: 0.06 })); slab.position.z = -2.2; slab.receiveShadow = true; scene.add(slab);
  const spin = new THREE.Group(), mol = new THREE.Group(), body = new THREE.Group(); mol.add(body); spin.add(mol); scene.add(spin);
  const labels = api.el('div', { class: 'l3f-labels' }); stage.append(labels);
  const hint = api.el('span', { class: 'l3f-hint', text: 'Drag to walk around it' }); stage.append(hint);
  const letter = api.el('div', { class: 'l3f-letter' }); stage.append(letter);
  const bondMat = new THREE.MeshStandardMaterial({ color: 0xb9a878, roughness: 0.32, metalness: 0.7, envMapIntensity: 1.0 });
  const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 24, 1, true);
  const S = { atoms: [], bonds: [], labelNodes: [], badgeNodes: [], low: 0, tweens: [], timers: [], base: { x: 0, y: 0 }, dragging: false, visible: false, raf: 0, swayFrom: 0 };
  function clear(g){ while (g.children.length){ const c = g.children.pop(); c.traverse && c.traverse(o => { if (o.geometry && o.geometry !== unitCyl) o.geometry.dispose(); if (o.material && o.material !== bondMat) o.material.dispose(); }); } }
  function setBond(mesh, a, b, radius){ const d = b.clone().sub(a), L = d.length(); mesh.position.copy(a).add(b).multiplyScalar(0.5); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); mesh.scale.set(radius, Math.max(L, 0.001), radius); }
  function layoutBonds(){
    for (const b of S.bonds){
      const pa = S.atoms[b.userData.a].position.clone(), pb = S.atoms[b.userData.b].position.clone();
      if (b.userData.offset){ const dir = pb.clone().sub(pa).normalize(); const perp = new THREE.Vector3().crossVectors(dir, Math.abs(dir.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)).normalize().multiplyScalar(b.userData.offset); pa.add(perp); pb.add(perp); }
      setBond(b, pa, pb, b.userData.radius);
    }
  }
  function tween(ms, fn, done){ const t = { t0: performance.now(), ms: api.reduced ? 0 : ms, fn, done }; if (!t.ms){ fn(1); done && done(); return; } S.tweens.push(t); }
  function later(ms, fn){ if (api.reduced){ fn(); return; } S.timers.push(setTimeout(fn, ms)); }
  function cancelAll(){ S.timers.forEach(clearTimeout); S.timers = []; S.tweens = []; }
  function build(groups, low){
    cancelAll(); clear(body); labels.replaceChildren(); S.labelNodes = []; S.badgeNodes = []; S.low = low;
    letter.className = 'l3f-letter'; letter.replaceChildren();
    mol.quaternion.identity(); spin.rotation.set(0, 0, 0); S.base = { x: 0, y: 0 };
    const m = buildMolecule(groups);
    S.atoms = m.atoms.map(a => {
      const e = ELEMENT[a.el], r = RADIUS[a.el];
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), new THREE.MeshPhysicalMaterial({ color: e.color, roughness: e.rough, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.22, envMapIntensity: 1.1 }));
      mesh.castShadow = true; mesh.receiveShadow = true; mesh.position.set(a.p[0], a.p[1], a.p[2]).multiplyScalar(SCALE); mesh.userData.atom = a; body.add(mesh); return mesh;
    });
    S.bonds = [];
    for (const b of m.bonds){
      const toH = m.atoms[b.a].el === 'H' || m.atoms[b.b].el === 'H', n = b.order === 2 ? 2 : 1;
      for (let k = 0; k < n; k++){ const mesh = new THREE.Mesh(unitCyl, bondMat); mesh.castShadow = true; mesh.receiveShadow = true; mesh.userData = { a: b.a, b: b.b, radius: n === 2 ? 0.055 : (toH ? 0.062 : 0.088), offset: n === 2 ? (k ? 0.1 : -0.1) : 0 }; body.add(mesh); S.bonds.push(mesh); }
    }
    layoutBonds();
    for (const mesh of S.atoms){ const a = mesh.userData.atom; if (a.role !== 'anchor') continue; const d = api.el('div', { class: 'l3f-lab' }, htmlLabel(api, groups[a.group].label)); labels.append(d); S.labelNodes.push({ el: d, mesh, group: a.group }); }
    let rad = 0; for (const mesh of S.atoms) rad = Math.max(rad, mesh.position.length() + RADIUS[mesh.userData.atom.el]);
    const dist = Math.max(5.6, (rad + 0.7) / Math.tan(camera.fov * Math.PI / 360) * 0.98);
    camera.position.set(0, 0.15, dist); camera.lookAt(0, 0, 0);
    S.swayFrom = performance.now();
  }
  function anchorOf(gi){ return S.atoms.find(m => m.userData.atom.group === gi && m.userData.atom.role === 'anchor'); }
  function badges(seq){
    S.badgeNodes.forEach(n => n.el.remove()); S.badgeNodes = [];
    seq.forEach((gi, k) => { const mesh = anchorOf(gi); if (!mesh) return; const d = api.el('div', { class: 'l3f-badge', text: String(k + 1) }); labels.append(d); S.badgeNodes.push({ el: d, mesh, group: gi, badge: true }); later(k * 140, () => d.classList.add('in')); });
  }
  function qAway(){ const a = anchorOf(S.low); const v = a ? a.position.clone().normalize() : new THREE.Vector3(0, 0, 1); return new THREE.Quaternion().setFromUnitVectors(v, new THREE.Vector3(0, 0, -1)); }
  function view(name, done){
    const target = name === 'away' ? qAway() : new THREE.Quaternion();
    const from = mol.quaternion.clone(), bx = S.base.x, by = S.base.y;
    tween(900, k => { const e = easeInOut(k); mol.quaternion.slerpQuaternions(from, target, e); S.base = { x: bx * (1 - e), y: by * (1 - e) }; }, done);
    S.swayFrom = performance.now();
  }
  // a real rotation about the viewing axis, then baked into the atoms
  function turnZ(angle, ms, done){
    const from = mol.quaternion.clone(), bx = S.base.x, by = S.base.y;
    tween(ms, k => { const e = easeInOut(k); const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle * e); mol.quaternion.copy(q.multiply(from)); S.base = { x: bx * (1 - e), y: by * (1 - e) }; }, () => { bake(); done && done(); });
  }
  function bake(){ const q = mol.quaternion.clone(); for (const m of S.atoms) m.position.applyQuaternion(q); mol.quaternion.identity(); layoutBonds(); }
  // swing whole substituents rigidly about the center to new directions
  function morph(dirs, ms, done){
    const groups = {};
    for (const m of S.atoms){ const gi = m.userData.atom.group; if (gi == null) continue; if (!groups[gi]){ const a = anchorOf(gi); const cur = a.position.clone().normalize(); const tgt = new THREE.Vector3(dirs[gi][0], dirs[gi][1], dirs[gi][2]).normalize(); groups[gi] = { q: new THREE.Quaternion().setFromUnitVectors(cur, tgt), members: [] }; } groups[gi].members.push({ m, start: m.position.clone() }); }
    const I = new THREE.Quaternion();
    tween(ms, k => { const e = easeInOut(k); for (const gi in groups){ const g = groups[gi], q = new THREE.Quaternion().slerpQuaternions(I, g.q, e); for (const mm of g.members) mm.m.position.copy(mm.start).applyQuaternion(q); } layoutBonds(); }, done);
  }
  function showLetter(ch, cap){ letter.replaceChildren(ch, api.el('small', { text: cap })); later(20, () => letter.classList.add('in')); }
  function hideLetter(){ letter.classList.remove('in'); }
  const cv = renderer.domElement; let drag = null;
  cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; S.dragging = true; try { cv.setPointerCapture(e.pointerId); } catch (err) {} });
  const endDrag = () => { drag = null; S.dragging = false; };
  cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);
  cv.addEventListener('pointermove', e => { if (!drag) return; S.base.y += (e.clientX - drag.x) * 0.008; S.base.x += (e.clientY - drag.y) * 0.008; drag = { x: e.clientX, y: e.clientY }; hint.style.opacity = '0'; });
  function project(v){ const p = v.clone().project(camera); const w = stage.clientWidth, h = stage.clientHeight; return { x: (p.x + 1) / 2 * w, y: (1 - p.y) / 2 * h }; }
  function placeLabels(){
    const center = new THREE.Vector3(); mol.getWorldPosition(center); const cs = project(center);
    const camDir = new THREE.Vector3(); camera.getWorldDirection(camDir);
    const h = stage.clientHeight || 400, dist = camera.position.length(), pxPerUnit = (h / 2) / (dist * Math.tan(camera.fov * Math.PI / 360));
    for (const n of S.labelNodes.concat(S.badgeNodes)){
      const wp = new THREE.Vector3(); n.mesh.getWorldPosition(wp); const s = project(wp); const depth = wp.clone().sub(center).dot(camDir);
      let x = s.x, y = s.y;
      if (!n.badge){ let dx = s.x - cs.x, dy = s.y - cs.y, L = Math.hypot(dx, dy); if (L < 12){ dx = 0; dy = 1; L = 1; s.y += 20; } const el = n.mesh.userData.atom.el, rPx = RADIUS[el] * pxPerUnit, gap = el === 'H' ? 20 : 34; x = s.x + dx / L * (rPx + gap); y = s.y + dy / L * (rPx + gap); }
      n.el.style.left = x.toFixed(1) + 'px'; n.el.style.top = y.toFixed(1) + 'px';
      n.el.style.opacity = depth > 0.9 ? (n.badge ? '0.8' : '0.55') : ''; n.el.style.zIndex = depth > 0 ? '1' : '3';
    }
  }
  function resize(){ const w = stage.clientWidth || 640, h = Math.max(1, stage.clientHeight || Math.round(w * 10 / 16)); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  function step(){
    const now = performance.now();
    for (const t of S.tweens.slice()){ const k = Math.min(1, (now - t.t0) / t.ms); t.fn(k); if (k >= 1){ S.tweens.splice(S.tweens.indexOf(t), 1); t.done && t.done(); } }
    let sx = 0, sy = 0; if (!S.dragging && !api.reduced){ const s = (now - S.swayFrom) / 1000; sy = Math.sin(s * 0.5) * 0.07; sx = Math.sin(s * 0.33) * 0.03; }
    spin.rotation.set(S.base.x + sx, S.base.y + sy, 0);
    renderer.render(scene, camera); placeLabels();
  }
  function tick(){ if (!S.visible || document.hidden){ S.raf = 0; return; } S.raf = requestAnimationFrame(tick); step(); }
  function wake(){ if (S.visible && !document.hidden && !S.raf) tick(); }
  if (typeof IntersectionObserver === 'function'){ new IntersectionObserver(es => { S.visible = es.some(e => e.isIntersecting); wake(); }, { threshold: 0.02 }).observe(stage); } else { S.visible = true; wake(); }
  document.addEventListener('visibilitychange', wake);
  if (typeof ResizeObserver === 'function') new ResizeObserver(resize).observe(stage); else window.addEventListener('resize', resize);
  resize();
  return { build, badges, view, turnZ, morph, showLetter, hideLetter, setLow(gi){ S.low = gi; } };
}

/* ------------------------------------------------------------------ */
/* Styles                                                               */
/* ------------------------------------------------------------------ */
const CSS = `
.l3f-grid{display:grid;grid-template-columns:4fr 8fr;gap:14px;align-items:stretch}
.l3f-grid .l3f-stage{align-self:start;width:100%}
.l3f-paper{background:radial-gradient(120% 90% at 50% 40%,#f6efdd,#e5dbc3);border-radius:10px;padding:10px 12px;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 1px rgba(60,40,10,.14),0 16px 30px -18px rgba(0,0,0,.9);min-height:200px;position:relative}
.l3f-paper svg{width:100%;height:auto;max-height:340px}
.l3f-stage{position:relative;aspect-ratio:16/10;background:#0e0c08;border:1px solid var(--line);border-radius:10px;overflow:hidden;box-shadow:0 30px 60px -30px rgba(0,0,0,.8),inset 0 0 0 1px rgba(255,255,255,.02)}
.l3f-stage canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:grab;border-radius:0}
.l3f-stage canvas:active{cursor:grabbing}
.l3f-labels{position:absolute;inset:0;pointer-events:none}
.l3f-lab{position:absolute;left:0;top:0;transform:translate(-50%,-50%);font-family:Georgia,serif;font-weight:600;font-size:16px;line-height:1;color:#f4efe2;background:rgba(18,16,11,.78);padding:4px 8px 5px;border-radius:6px;white-space:nowrap;box-shadow:0 1px 6px rgba(0,0,0,.5);transition:opacity .25s}
.l3f-lab sub{font-size:.68em;line-height:0;vertical-align:-.3em}
.l3f-badge{position:absolute;left:0;top:0;width:22px;height:22px;border-radius:50%;background:linear-gradient(180deg,#f3e2a6,#c9a84c);color:#1a160c;font-family:ui-monospace,Menlo,monospace;font-weight:700;font-size:12px;display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.7),0 0 0 2px rgba(18,16,11,.85);opacity:0;transform:translate(-50%,-50%) scale(.4);transition:opacity .35s,transform .45s cubic-bezier(.2,1.4,.4,1)}
.l3f-badge.in{opacity:1;transform:translate(-50%,-50%) scale(1)}
.l3f-letter{position:absolute;right:16px;bottom:10px;font-family:Georgia,serif;font-size:60px;line-height:1;color:var(--goldhi);text-shadow:0 0 22px rgba(230,208,138,.55),0 2px 10px rgba(0,0,0,.8);opacity:0;transition:opacity .4s;pointer-events:none;text-align:right}
.l3f-letter.in{opacity:1}
.l3f-letter small{display:block;font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink2);text-shadow:none;margin-top:4px}
.l3f-hint{position:absolute;left:12px;top:10px;font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink3);pointer-events:none;transition:opacity .6s}
.l3f-tag{position:absolute;left:12px;top:8px;font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#7a6a3a}
.l3f-fallback{color:var(--ink3);font-size:14px;padding:16px}
.l3f-cap{color:var(--ink2);font-size:15px;margin:10px 0 0;min-height:1.5em}
.l3f-cap b{color:var(--goldhi);font-weight:600}
.l3f-row{margin-top:8px}
.l3f-row .eyebrow{margin-right:4px}
.l3f-fig{max-width:280px;margin:0 0 4px;padding:6px 10px}
.l3f-fig svg{max-height:270px}
@media (max-width:760px){.l3f-grid{grid-template-columns:1fr}}
`;

/* ------------------------------------------------------------------ */
/* mount                                                                */
/* ------------------------------------------------------------------ */
export function mount(slots, api){
  slots.visual.append(api.el('style', { text: CSS }));
  const paper = api.el('div', { class: 'l3f-paper' }, api.el('span', { class: 'l3f-tag', text: 'Fischer projection' }));
  const stage = api.el('div', { class: 'l3f-stage', 'aria-label': 'The same molecule in three dimensions. Drag to rotate.' });
  const grid = api.el('div', { class: 'l3f-grid' }, paper, stage);
  const rowCross = api.el('div', { class: 'controls l3f-row' });
  const rowSwap = api.el('div', { class: 'controls l3f-row' });
  const rowModel = api.el('div', { class: 'controls l3f-row' });
  const caption = api.el('p', { class: 'l3f-cap' });
  slots.visual.append(grid, rowCross, rowSwap, rowModel, caption);
  const bench = makeBench(api, stage);

  // the truth: four group objects, and where[gi] = slot index for group gi
  const V = { groups: [], where: [0, 1, 2, 3], numbered: false, depth: false, swapMode: false, pick: null, busy: false, view: 'page' };
  const slotsNow = () => { const s = [null, null, null, null]; V.groups.forEach((g, gi) => { s[V.where[gi]] = g; }); return s; };
  const seqGroups = () => V.groups.map((g, i) => i).sort((a, b) => V.groups[a].rank - V.groups[b].rank);

  function setCaption(parts){ caption.replaceChildren(...parts.map(p => typeof p === 'string' ? p : (p.lab != null ? api.el('b', {}, htmlLabel(api, p.lab)) : api.el('b', { text: p.b })))); }
  let svgHold = null;
  function renderCross(){
    const s = slotsNow(), r = readCross(s);
    const hold = {};
    const svgEl = drawCross(api, s, { depth: V.depth, badges: V.numbered ? r.seq : null, lit: V.pick != null ? [V.pick] : [], group: hold });
    const tag = paper.firstChild; paper.replaceChildren(tag, svgEl); svgHold = hold;
    return r;
  }
  function chip(label, fn, pressed){ return api.el('button', { type: 'button', class: 'chip', 'aria-pressed': pressed == null ? null : String(pressed), onclick: fn }, label); }
  const chipNum = chip('Do the numbers', doNumbers, false);
  const chipSwap = chip('Swap two groups', toggleSwap, false);
  const chip180 = chip('Rotate 180', () => rotate(180));
  const chip90 = chip('Rotate 90', () => rotate(90));
  const chipNew = chip('New molecule', () => load(randomSlots(api.rng)));
  rowCross.append(api.el('span', { class: 'eyebrow', text: 'The cross' }), chipNum, chipSwap, chip180, chip90, chipNew);
  const chipPage = chip('Face the page', () => setView('page'), true);
  const chipAway = chip('H away', () => setView('away'), false);
  const chipDepth = chip('Show the depth', () => { V.depth = !V.depth; chipDepth.setAttribute('aria-pressed', String(V.depth)); renderCross(); if (V.depth) setCaption(['Drawn with depth: the horizontal bonds are wedges (toward you), the vertical bonds are dashes (away). A Fischer cross is just this drawing with the wedges and dashes agreed on in advance.']); }, false);
  rowModel.append(api.el('span', { class: 'eyebrow', text: 'The model' }), chipPage, chipAway, chipDepth);

  function describe(prefix){
    const s = slotsNow(), r = readCross(s), low = s[r.lowSlot].label;
    const names = []; r.seq.forEach((si, k) => { if (k) names.push(', '); names.push((k + 1) + ' '); names.push({ lab: s[si].label }); });
    const where = isHorizontal(r.lowSlot) ? 'horizontal' : 'vertical';
    const tail = isHorizontal(r.lowSlot)
      ? [' As drawn it traces ', { b: r.apparent }, '. ', { lab: low }, ' is on a ', { b: where }, ' bond, pointing at you, so flip it: ', { b: r.config }, '.']
      : [' As drawn it traces ', { b: r.apparent }, '. ', { lab: low }, ' is on a ', { b: where }, ' bond, already going away, so keep it: ', { b: r.config }, '.'];
    setCaption((prefix || []).concat(['Priorities: '], names, ['.'], tail));
    if (bench) bench.showLetter(r.config, 'horizontal toward you');
  }
  function doNumbers(){ if (V.busy) return; V.numbered = true; chipNum.setAttribute('aria-pressed', 'true'); renderCross(); if (bench) bench.badges(seqGroups().slice(0, 3)); describe(); }
  function load(four){
    V.groups = four.map(g => ({ key: g.key, label: g.label, rank: g.rank })); V.where = [0, 1, 2, 3]; V.numbered = false; V.pick = null; V.swapMode = false; V.view = 'page';
    chipNum.setAttribute('aria-pressed', 'false'); chipSwap.setAttribute('aria-pressed', 'false'); chipPage.setAttribute('aria-pressed', 'true'); chipAway.setAttribute('aria-pressed', 'false');
    rowSwap.replaceChildren();
    const r = renderCross();
    if (bench){ bench.build(V.groups.map((g, gi) => ({ key: g.key, label: g.label, pos: FPOS[V.where[gi]].slice() })), seqGroups()[3]); bench.hideLetter(); }
    const s = slotsNow();
    setCaption(['Horizontal bonds come toward you: ', { lab: s[3].label }, ' and ', { lab: s[1].label }, ' are in front. Vertical bonds go away: ', { lab: s[0].label }, ' and ', { lab: s[2].label }, ' are behind. Drag the model and check it, then do the numbers.']);
    void r;
  }
  function setView(name){
    if (V.busy) return; V.view = name; chipPage.setAttribute('aria-pressed', String(name === 'page')); chipAway.setAttribute('aria-pressed', String(name === 'away'));
    if (bench) bench.view(name);
    if (name === 'away') setCaption(['H points away from you now. Trace 1 to 2 to 3 and read the letter straight; it matches what the cross gave you after the flip rule.']);
    else if (V.numbered) describe(); else setCaption(['Facing the page, exactly like the cross: horizontal toward you, vertical away.']);
  }
  function toggleSwap(){
    if (V.busy) return; V.swapMode = !V.swapMode; V.pick = null; chipSwap.setAttribute('aria-pressed', String(V.swapMode)); rowSwap.replaceChildren();
    if (V.swapMode){
      rowSwap.append(api.el('span', { class: 'eyebrow', text: 'Pick two' }));
      const s = slotsNow();
      s.forEach((g, si) => rowSwap.append(api.el('button', { type: 'button', class: 'chip', 'aria-pressed': 'false', onclick: () => pickSlot(si) }, SLOTS[si] + ': ', htmlLabel(api, g.label))));
      setCaption(['Pick any two groups. One swap flips the letter, two swaps bring it back. Watch the model: the two groups trade places in space.']);
    }
    renderCross();
  }
  function pickSlot(si){
    if (V.busy) return;
    const chips = [...rowSwap.querySelectorAll('button')];
    if (V.pick == null){ V.pick = si; chips[si].setAttribute('aria-pressed', 'true'); renderCross(); return; }
    if (V.pick === si){ V.pick = null; chips[si].setAttribute('aria-pressed', 'false'); renderCross(); return; }
    const a = V.pick, b = si; V.pick = null;
    doSwap(a, b);
  }
  function tween2D(ms, fn, done){ if (api.reduced){ fn(1); done && done(); return; } const t0 = performance.now(); const go = () => { const k = Math.min(1, (performance.now() - t0) / ms); fn(easeInOut(k)); if (k < 1) requestAnimationFrame(go); else done && done(); }; requestAnimationFrame(go); }
  function doSwap(a, b){
    const before = readCross(slotsNow()).config;
    V.busy = true;
    const ga = V.where.indexOf(a), gb = V.where.indexOf(b);
    // 2D: the two labels glide to each other's spot
    const la = svgHold && svgHold.labels.find(t => t.dataset.slot === String(a)), lb = svgHold && svgHold.labels.find(t => t.dataset.slot === String(b));
    const A = labelSpot(a), B = labelSpot(b);
    tween2D(650, k => { if (la){ la.setAttribute('x', (A.x + (B.x - A.x) * k).toFixed(1)); la.setAttribute('y', (A.y + (B.y - A.y) * k).toFixed(1)); } if (lb){ lb.setAttribute('x', (B.x + (A.x - B.x) * k).toFixed(1)); lb.setAttribute('y', (B.y + (A.y - B.y) * k).toFixed(1)); } });
    // 3D: the two substituents swing to each other's direction
    const dirs = V.groups.map((g, gi) => FPOS[V.where[gi]].slice()); dirs[ga] = FPOS[b].slice(); dirs[gb] = FPOS[a].slice();
    const finish = () => {
      V.where[ga] = b; V.where[gb] = a; V.busy = false;
      const chips = [...rowSwap.querySelectorAll('button')]; chips.forEach(c => c.setAttribute('aria-pressed', 'false'));
      if (V.swapMode){ rowSwap.replaceChildren(); V.swapMode = false; chipSwap.setAttribute('aria-pressed', 'false'); }
      const r = renderCross();
      if (bench){ bench.setLow(seqGroups()[3]); if (V.numbered) bench.badges(seqGroups().slice(0, 3)); }
      const s = slotsNow();
      const pre = ['Swapped ', { lab: s[b].label }, ' and ', { lab: s[a].label }, '. One swap flips: ', { b: before }, ' became ', { b: r.config }, '. '];
      if (V.numbered) describe(pre); else { setCaption(pre.concat(['Swap them back and it returns.'])); if (bench) bench.showLetter(r.config, 'after one swap'); }
    };
    if (bench) bench.morph(dirs, 900, finish); else setTimeout(finish, api.reduced ? 0 : 650);
  }
  function rotate(deg){
    if (V.busy) return; V.busy = true;
    const before = readCross(slotsNow()).config;
    const g = svgHold && svgHold.g;
    tween2D(800, k => { if (g) g.setAttribute('transform', `rotate(${(-deg * k).toFixed(2)} ${CX} ${CY})`); });
    const finish90 = () => {
      V.where = V.where.map(w => (w + 1) % 4);
      const dirs = V.groups.map((gr, gi) => FPOS[V.where[gi]].slice());
      const done = () => { V.busy = false; const r = renderCross(); if (bench){ bench.setLow(seqGroups()[3]); if (V.numbered) bench.badges(seqGroups().slice(0, 3)); } const pre = ['Turned 90: the two groups that were coming at you landed on vertical bonds, so the rule sends them away, and the two that were away come forward. That is a different molecule: ', { b: before }, ' became ', { b: r.config }, '. ']; if (V.numbered) describe(pre); else { setCaption(pre); if (bench) bench.showLetter(r.config, 'after a 90 turn'); } };
      if (bench) bench.morph(dirs, 1100, done); else done();
    };
    const finish180 = () => { V.where = V.where.map(w => (w + 2) % 4); V.busy = false; const r = renderCross(); if (bench && V.numbered) bench.badges(seqGroups().slice(0, 3)); const pre = ['Turned 180 in the plane: horizontal is still horizontal, still toward you. Same molecule, still ', { b: r.config }, '. ']; if (V.numbered) describe(pre); else { setCaption(pre); if (bench) bench.showLetter(r.config, 'after a 180 turn'); } };
    if (bench) bench.turnZ(-deg * Math.PI / 180, 800, deg === 90 ? finish90 : finish180);
    else setTimeout(deg === 90 ? finish90 : finish180, api.reduced ? 0 : 800);
  }
  load(randomSlots(api.rng));

  /* ---------------- you try ---------------- */
  const host = slots.try;
  let count = 0, cur = null;
  function next(){
    count++;
    const variant = count % 5 === 0 ? 'rot90' : (count % 3 === 2 ? 'swap' : 'plain');
    cur = { it: makeItem(api.rng, variant), done: false, misses: 0 };
    render();
  }
  function render(){
    api.clearCoach(); host.replaceChildren();
    const it = cur.it, box = api.el('div', { class: 'item' });
    let prompt;
    if (it.variant === 'swap') prompt = api.el('p', { class: 'prompt' }, 'After swapping the two gold groups, ', htmlLabel(api, it.slots[it.pair[0]].label), ' and ', htmlLabel(api, it.slots[it.pair[1]].label), ', the configuration is');
    else if (it.variant === 'rot90') prompt = api.el('p', { class: 'prompt', text: 'Turn this cross 90 degrees in the plane and read it as a Fischer projection again. The configuration is' });
    else prompt = api.el('p', { class: 'prompt', text: 'R or S from this Fischer projection?' });
    box.append(prompt);
    box.append(api.el('div', { class: 'l3f-paper l3f-fig' }, drawCross(api, it.slots, { lit: it.pair || [] })));
    const opts = [{ node: 'R', ok: it.answer === 'R' }, { node: 'S', ok: it.answer === 'S' }];
    const grid = api.el('div', { class: 'opts' }), verdict = api.el('div', { class: 'verdict' }), after = api.el('div', { class: 'controls' });
    opts.forEach((o, i) => { const b = api.el('button', { type: 'button', class: 'opt', onclick: () => choose(b, o) }, api.el('span', { class: 'k', text: 'AB'[i] }), api.el('span', {}, o.node)); grid.append(b); });
    function choose(btn, o){
      if (cur.done) return;
      btn.classList.add('picked');
      if (o.ok){
        cur.done = true; btn.classList.add('ok'); for (const b of grid.querySelectorAll('button')) b.disabled = true;
        verdict.className = 'verdict good'; verdict.textContent = 'You can read it.';
        if (cur.misses === 0) api.report(true); api.clearCoach();
        after.append(api.el('button', { type: 'button', class: 'primary', onclick: next }, 'Another one'),
          api.el('button', { type: 'button', class: 'secondary', onclick: () => { load(it.slots); doNumbers(); slots.visual.scrollIntoView({ block: 'nearest', behavior: api.reduced ? 'auto' : 'smooth' }); } }, 'See this one in 3D'));
      } else {
        cur.misses++; if (cur.misses === 1) api.report(false);
        btn.disabled = true; verdict.className = 'verdict notyet'; verdict.textContent = 'Not yet.'; api.coach(whyMiss(it));
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
  if (configFromGeometry([[0, 0.85, -0.5], [0.9, 0, -0.3], [-0.9, 0, -0.3], [0, -0.6, 0.8]]) !== 'S') fail('calibration (loose drawing) must be S');
  // the Fischer directions form a regular tetrahedron
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++){ const ang = Math.acos(vdot(vunit(FPOS[i]), vunit(FPOS[j]))) * 180 / Math.PI; if (Math.abs(ang - 109.47) > 0.3) fail('FPOS angle ' + i + j + ' = ' + ang.toFixed(2)); }
  // a textbook check: (R)-glyceraldehyde as a Fischer projection is CHO top, OH right, H left, CH2OH bottom
  const gl = { CHO: GROUPS[5], OH: GROUPS[2], H: GROUPS[9], CH2OH: GROUPS[6] };
  if (readCross([gl.CHO, gl.OH, gl.CH2OH, gl.H]).config !== 'R') fail('D-glyceraldehyde (OH right) must be R');
  if (readCross([gl.CHO, gl.H, gl.CH2OH, gl.OH]).config !== 'S') fail('L-glyceraldehyde (OH left) must be S');
  // every arrangement of a few quads: swap flips, 180 keeps, 90 flips, mirror flips, the 2D rule holds
  const quads = [[GROUPS[0], GROUPS[2], GROUPS[8], GROUPS[9]], [GROUPS[1], GROUPS[3], GROUPS[7], GROUPS[9]], [GROUPS[4], GROUPS[5], GROUPS[6], GROUPS[9]], [GROUPS[2], GROUPS[4], GROUPS[7], GROUPS[9]]];
  const perms = []; (function gen(a, k){ if (k === a.length){ perms.push(a.slice()); return; } for (let i = k; i < a.length; i++){ [a[k], a[i]] = [a[i], a[k]]; gen(a, k + 1); [a[k], a[i]] = [a[i], a[k]]; } })([0, 1, 2, 3], 0);
  let tried = 0;
  for (const q of quads) for (const p of perms){
    const s = p.map(i => q[i]), r = readCross(s); tried++;
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) if (readCross(swapSlots(s, i, j)).config === r.config) fail('swap ' + i + j + ' must flip');
    if (readCross(rot180(s)).config !== r.config) fail('rot180 must keep');
    if (readCross(rot90(s)).config === r.config) fail('rot90 must flip');
    if (readCross(rot90(rot90(rot90(rot90(s))))).config !== r.config) fail('four rot90 must return');
    if (readCross(swapSlots(s, 1, 3)).config === r.config) fail('mirror (left-right) must flip');
    const expect = isHorizontal(r.lowSlot) ? (r.apparent === 'R' ? 'S' : 'R') : r.apparent;
    if (expect !== r.config) fail('2D Fischer rule broke for ' + s.map(g => g.key).join(','));
  }
  // generated items
  let plain = 0, swaps = 0, rots = 0;
  for (let seed = 1; seed <= 210; seed++){
    const variant = seed % 5 === 0 ? 'rot90' : (seed % 3 === 2 ? 'swap' : 'plain');
    const it = makeItem(mulberry32(seed), variant); tried++;
    if (variant === 'plain') plain++; else if (variant === 'swap') swaps++; else rots++;
    if (new Set(it.slots.map(g => g.key)).size !== 4 || !it.slots.some(g => g.key === 'H')) fail('seed ' + seed + ': four distinct groups with H');
    if (it.answer !== 'R' && it.answer !== 'S') fail('seed ' + seed + ': answer');
    if (variant !== 'plain' && it.answer === it.base.config) fail('seed ' + seed + ': ' + variant + ' must flip');
    if (variant === 'plain' && it.answer !== readCross(it.slots).config) fail('seed ' + seed + ': plain answer');
    if (JSON.stringify(makeItem(mulberry32(seed), variant)) !== JSON.stringify(it)) fail('seed ' + seed + ': not reproducible');
  }
  const letters = new Set(); for (let s = 1; s <= 40; s++) letters.add(makeItem(mulberry32(s), 'plain').answer); if (letters.size !== 2) fail('both letters must occur');
  return { ok: notes.length === 0, tried, notes: notes.join('; ') || ('calibration S ok, glyceraldehyde ok, 96 arrangements, ' + plain + ' plain, ' + swaps + ' swap, ' + rots + ' rot90') };
}
