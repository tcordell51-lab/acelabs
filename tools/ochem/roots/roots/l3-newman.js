// The Roots of Organic: l3-newman. Newman projections and conformations of butane.
// No imports. The shell passes THREE in api when meta.needs3D is true.

export const meta = {
  id: 'l3-newman',
  level: 3,
  order: 2,
  needs3D: true,
  title: 'The solar eclipse',
  concept: 'Newman projections and conformations',
  tagline: 'Staggered valleys, eclipsed peaks, anti is the bottom of the well.',
  story: 'Look straight down a carbon-carbon bond. The front carbon is a dot with three bonds coming off it, the back carbon is a circle with three bonds. Now, the groups on those two carbons want elbow room, just like on a subway, we do not want somebody sitting right next to us. Staggered, with the back groups tucked between the front ones, is happy. Anti, the two big groups 180 degrees apart, is happiest. Gauche, the big groups only 60 apart, is battling, super not happy, high energy. Eclipsed is a solar eclipse: atoms sitting right on top of each other, the least stable of all. Rule of thumb: staggered valleys, eclipsed peaks, anti is the bottom of the well.',
  moveName: 'Look down the bond, then measure the elbow room',
  move: [
    'Look straight down the carbon-carbon bond. The front carbon is a dot with three bonds, the back carbon is a circle with three bonds.',
    'Find the two biggest groups and read the angle between them: 0 is eclipsed, 60 is gauche, 180 is anti.',
    'Staggered is a valley, eclipsed is a peak. Anti, the big groups as far apart as they can get, is the bottom of the well.',
    'Gauche is staggered but still battling. Staggered does not mean happiest.'
  ],
  trap: 'Careful: gauche is staggered but still strained. Staggered does not mean most stable, anti does.',
  holdsUp: ['Chair conformations', 'E2 needs anti-periplanar', 'Ring strain', 'Why rotation matters in NMR'],
  drill: 'Booster OChem: Conformations and Stereochemistry'
};

/* ------------------------------------------------------------------ */
/* Pure parts (node-safe): dihedral naming, the energy curve, butane   */
/* coordinates, item generators.                                       */
/* ------------------------------------------------------------------ */
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const vlen = a => Math.hypot(a[0], a[1], a[2]);
const unit = a => { const l = vlen(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const COS_T = -1 / 3, SIN_T = Math.sqrt(8) / 3;

export const STATIONS = [
  { deg: 0, key: 'ecl-mm', name: 'eclipsed (methyl-methyl)', kind: 'eclipsed', e: 4.5, line: 'A solar eclipse. The two methyls sit right on top of each other. Least stable of all.' },
  { deg: 60, key: 'gauche', name: 'gauche', kind: 'staggered', e: 0.9, line: 'Staggered, but the methyls are only 60 apart. Battling, super not happy, high energy for a valley.' },
  { deg: 120, key: 'ecl-mh', name: 'eclipsed (methyl-H)', kind: 'eclipsed', e: 3.8, line: 'Eclipsed again, a peak. Methyl over hydrogen this time, so not quite as bad as methyl over methyl.' },
  { deg: 180, key: 'anti', name: 'anti', kind: 'staggered', e: 0, line: 'The two big groups as far apart as they can get. Happiest. The bottom of the well.' },
  { deg: 240, key: 'ecl-mh', name: 'eclipsed (methyl-H)', kind: 'eclipsed', e: 3.8, line: 'Eclipsed again, a peak. Methyl over hydrogen this time, so not quite as bad as methyl over methyl.' },
  { deg: 300, key: 'gauche', name: 'gauche', kind: 'staggered', e: 0.9, line: 'Staggered, but the methyls are only 60 apart. Battling, super not happy, high energy for a valley.' }
];
export const NAMES = [
  { key: 'ecl-mm', name: 'eclipsed (methyl-methyl)' },
  { key: 'gauche', name: 'gauche' },
  { key: 'ecl-mh', name: 'eclipsed (methyl-H)' },
  { key: 'anti', name: 'anti' }
];
export const norm = d => ((d % 360) + 360) % 360;
export const angDist = (a, b) => { const x = Math.abs(norm(a) - norm(b)); return Math.min(x, 360 - x); };
export function station(d){
  const x = norm(d), k = Math.round(x / 60) % 6;
  const delta = ((x - 60 * k + 540) % 360) - 180;
  return Object.assign({ k, delta }, STATIONS[k]);
}
export function conformation(d){
  const s = station(d), exact = Math.abs(s.delta) <= 12;
  return { key: s.key, name: s.name, kind: s.kind, exact, label: exact ? s.name : 'near ' + s.name, delta: s.delta, e: energy(d), line: s.line };
}
// potential energy in kcal/mol above anti, smooth between the six stations
export function energy(d){
  const x = norm(d), k = Math.floor(x / 60), t = (x - 60 * k) / 60, s = (1 - Math.cos(Math.PI * t)) / 2;
  const e0 = STATIONS[k].e, e1 = STATIONS[(k + 1) % 6].e;
  return e0 + (e1 - e0) * s;
}
export const accept = (d, degs) => degs.some(g => angDist(d, g) <= 15);

function remaining(a, u, v, phase){
  return [0, 1, 2].map(k => { const p = phase + k * 2 * Math.PI / 3; return unit(add(mul(a, COS_T), mul(add(mul(u, Math.cos(p)), mul(v, Math.sin(p))), SIN_T))); });
}
function azimuth(d, axis, u, v){ const p = sub(d, mul(axis, dot(d, axis))); if (vlen(p) < 1e-6) return 0; return Math.atan2(dot(p, v), dot(p, u)); }

// Butane with the C2-C3 bond on the z axis, C2 toward the viewer. The front methyl
// sits at 12 o'clock; the back methyl is `deg` counterclockwise from it as seen
// from the front.
export function butaneAtoms(deg){
  const phi = deg * Math.PI / 180;
  const atoms = [], bonds = [];
  const C2 = [0, 0, 0.77], C3 = [0, 0, -0.77];
  atoms.push({ el: 'C', tag: 'C2', pos: C2, side: 'front' }); atoms.push({ el: 'C', tag: 'C3', pos: C3, side: 'back' }); bonds.push({ a: 0, b: 1 });
  const front = ang => [SIN_T * Math.cos(ang), SIN_T * Math.sin(ang), 1 / 3];
  const back = ang => [SIN_T * Math.cos(ang), SIN_T * Math.sin(ang), -1 / 3];
  const f = [0, 1, 2].map(k => front(Math.PI / 2 + k * 2 * Math.PI / 3));
  const b = [0, 1, 2].map(k => back(Math.PI / 2 + phi + k * 2 * Math.PI / 3));
  function methyl(ci, cpos, d, tag, side){
    const pos = add(cpos, mul(d, 1.54)), idx = atoms.length;
    atoms.push({ el: 'C', tag, pos, side }); bonds.push({ a: ci, b: idx });
    const bd = mul(d, -1);
    let u = sub([0, 1, 0], mul(bd, dot([0, 1, 0], bd))); if (vlen(u) < 1e-6) u = [1, 0, 0]; u = unit(u); const v = unit(cross(bd, u));
    const az = azimuth(side === 'front' ? [0, 0, -1] : [0, 0, 1], bd, u, v);
    for (const hd of remaining(bd, u, v, az + Math.PI / 3)){ const hi = atoms.length; atoms.push({ el: 'H', pos: add(pos, mul(hd, 1.09)), side }); bonds.push({ a: idx, b: hi }); }
  }
  methyl(0, C2, f[0], 'C1', 'front');
  for (const d of f.slice(1)){ const hi = atoms.length; atoms.push({ el: 'H', pos: add(C2, mul(d, 1.09)), side: 'front', onAxis: true }); bonds.push({ a: 0, b: hi }); }
  methyl(1, C3, b[0], 'C4', 'back');
  for (const d of b.slice(1)){ const hi = atoms.length; atoms.push({ el: 'H', pos: add(C3, mul(d, 1.09)), side: 'back', onAxis: true }); bonds.push({ a: 1, b: hi }); }
  return { atoms, bonds };
}
function dihedral(p0, p1, p2, p3){
  const b0 = sub(p0, p1), b1 = unit(sub(p2, p1)), b2 = sub(p3, p2);
  const v = sub(b0, mul(b1, dot(b0, b1))), w = sub(b2, mul(b1, dot(b2, b1)));
  const x = dot(v, w), y = dot(cross(b1, v), w);
  return Math.atan2(y, x) * 180 / Math.PI;
}

function shuffleWith(rng, arr){ const b = arr.slice(); for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
const TARGETS = [
  { key: 'anti', degs: [180], text: 'anti' },
  { key: 'gauche', degs: [60, 300], text: 'gauche' },
  { key: 'ecl-mm', degs: [0], text: 'eclipsed, methyl right over methyl' }
];
export function genItem(kind, rng){
  if (kind === 'S'){
    const r = rng(), t = r < 0.5 ? TARGETS[0] : r < 0.8 ? TARGETS[1] : TARGETS[2];
    let start = 0, guard = 0;
    do { start = Math.floor(rng() * 360); guard++; } while (t.degs.some(g => angDist(start, g) < 40) && guard < 50);
    return { kind, target: t.key, degs: t.degs, text: t.text, start, prompt: 'Turn the back carbon until the two methyls are ' + t.text + '.' };
  }
  const k = Math.floor(rng() * 6), jitter = Math.round((rng() * 2 - 1) * 8), deg = norm(60 * k + jitter);
  return { kind: 'N', deg, answer: STATIONS[k].key, options: shuffleWith(rng, NAMES.map(n => n.key)), prompt: 'Name this conformation.' };
}

export function selfTest(){
  try {
    let s = 11;
    const rng = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    // naming over 200 random dihedrals, plus the boundaries
    for (let i = 0; i < 200; i++){
      const d = rng() * 720 - 360, st = station(d), x = norm(d);
      const k = Math.floor((x + 30) / 60) % 6;
      if (st.k !== k) throw new Error('station at ' + d.toFixed(2));
      if (Math.abs(st.delta) > 30 + 1e-9) throw new Error('delta ' + st.delta);
      if (conformation(d).exact !== (Math.abs(st.delta) <= 12)) throw new Error('exact flag');
      const e = energy(d); if (e < -1e-9 || e > 4.5 + 1e-9) throw new Error('energy range');
      if (Math.abs(energy(d) - energy(-d)) > 1e-9) throw new Error('energy symmetry');
    }
    const edges = [[29.99, 0], [30, 1], [89.99, 1], [90, 2], [149.99, 2], [150, 3], [209.99, 3], [210, 4], [269.99, 4], [270, 5], [329.99, 5], [330, 0], [359.99, 0], [-15, 0], [-31, 5]];
    for (const [d, k] of edges) if (station(d).k !== k) throw new Error('boundary ' + d);
    if (energy(180) !== 0 || energy(0) !== 4.5 || energy(60) !== 0.9 || energy(120) !== 3.8) throw new Error('station energies');
    if (!(energy(60) < energy(120) && energy(120) < energy(0))) throw new Error('energy order');
    if (!(energy(180) < energy(60))) throw new Error('anti lowest');
    for (const d of [90, 150, 210]) if (!(energy(d) > energy(180) && energy(d) < energy(0))) throw new Error('between');
    // butane geometry
    for (const deg of [0, 37, 60, 120, 180, 250, 300, 359]){
      const m = butaneAtoms(deg), at = m.atoms;
      const P = t => at.find(a => a.tag === t).pos;
      const dh = Math.abs(dihedral(P('C1'), P('C2'), P('C3'), P('C4')));
      const want = Math.min(norm(deg), 360 - norm(deg));
      if (Math.abs(dh - want) > 1e-6) throw new Error('dihedral ' + deg + ' gave ' + dh.toFixed(3));
      for (const b of m.bonds){ const L = vlen(sub(at[b.a].pos, at[b.b].pos)); const want = at[b.a].el === 'H' || at[b.b].el === 'H' ? 1.09 : 1.54; if (Math.abs(L - want) > 1e-9) throw new Error('bond length'); }
      if (at.length !== 14 || m.bonds.length !== 13) throw new Error('butane atom count');
      for (const ci of [0, 1]){
        const nb = m.bonds.filter(b => b.a === ci || b.b === ci).map(b => unit(sub(at[b.a === ci ? b.b : b.a].pos, at[ci].pos)));
        if (nb.length !== 4) throw new Error('central carbon bonds');
        for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++){ const g = Math.acos(dot(nb[i], nb[j])) * 180 / Math.PI; if (Math.abs(g - 109.4712) > 0.01) throw new Error('tetrahedral angle ' + g.toFixed(3)); }
      }
    }
    const dmm = deg => { const m = butaneAtoms(deg); const P = t => m.atoms.find(a => a.tag === t).pos; return vlen(sub(P('C1'), P('C4'))); };
    if (!(dmm(0) < dmm(60) && dmm(60) < dmm(180))) throw new Error('methyl distance order');
    // items
    let tried = 0;
    for (let i = 0; i < 200; i++){
      const kind = i % 2 ? 'N' : 'S', it = genItem(kind, rng); tried++;
      if (kind === 'S'){
        if (accept(it.start, it.degs)) throw new Error('S starts solved');
        for (const g of it.degs){ if (!accept(g + 14, it.degs) || !accept(g - 14, it.degs)) throw new Error('S accept window'); if (accept(g + 16, it.degs) && !it.degs.some(o => angDist(g + 16, o) <= 15)) throw new Error('S accept too wide'); }
      } else {
        if (it.options.filter(o => o === it.answer).length !== 1) throw new Error('N answer not unique');
        if (station(it.deg).key !== it.answer) throw new Error('N answer mismatch');
        if (it.options.length !== 4) throw new Error('N options');
      }
    }
    if (!accept(350, [0]) || !accept(10, [0]) || accept(200, [180])) throw new Error('accept wrap');
    s = 5; const a1 = JSON.stringify(genItem('N', rng)); s = 5; const a2 = JSON.stringify(genItem('N', rng)); if (a1 !== a2) throw new Error('not deterministic');
    return { ok: true, tried, notes: '200 dihedrals named, 8 butane geometries checked' };
  } catch (e){ return { ok: false, tried: 0, notes: e.message }; }
}

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */
const P = 'l3n';
const CSS = `
.${P}-row{display:grid;grid-template-columns:minmax(0,1.9fr) minmax(0,1fr);gap:14px;align-items:start}
.${P}-side{display:grid;gap:10px;min-width:0}
.${P}-panel{background:#0e0c08;border:1px solid var(--line);border-radius:12px;padding:8px 8px 6px;box-shadow:0 30px 60px -30px rgba(0,0,0,.8)}
.${P}-panel svg{width:100%;height:auto;display:block}
.${P}-panel .t{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink3);margin:2px 4px 4px}
.${P}-stage{position:relative;width:100%;aspect-ratio:16/10;background:#0e0c08;border:1px solid var(--line);border-radius:12px;overflow:hidden;box-shadow:0 30px 60px -30px rgba(0,0,0,.8),inset 0 0 0 1px rgba(255,255,255,.02);cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}
.${P}-stage.drag{cursor:grabbing}
.${P}-fallback{position:absolute;inset:0;display:grid;place-items:center;color:var(--ink2);padding:24px;text-align:center}
.${P}-labels{position:absolute;inset:0;pointer-events:none}
.${P}-lab{position:absolute;left:0;top:0;font-family:var(--serif);font-weight:600;font-size:17px;line-height:1;color:#f4efe2;background:rgba(18,16,11,.8);padding:5px 9px 6px;border-radius:7px;white-space:nowrap;box-shadow:0 1px 6px rgba(0,0,0,.5);transition:opacity .25s;text-align:center}
.${P}-lab sub{font-size:.62em;vertical-align:-.25em;margin-left:1px}
.${P}-lab small{display:block;font-family:var(--mono);font-weight:400;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin-top:4px}
.${P}-hud{position:absolute;left:12px;top:12px;pointer-events:none;background:rgba(20,18,12,.78);padding:7px 11px;border-radius:9px;max-width:58%}
.${P}-hud b{display:block;font-family:var(--serif);font-weight:400;font-size:18px;color:var(--goldhi);line-height:1.15}
.${P}-hud span{display:block;font-size:12.5px;line-height:1.35;color:var(--ink2);margin-top:3px}
.${P}-help{position:absolute;right:12px;top:12px;font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3);background:rgba(20,18,12,.72);padding:6px 9px;border-radius:8px;pointer-events:none}
.${P}-cap{position:absolute;left:12px;right:12px;bottom:12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;pointer-events:none}
.${P}-cap b{font-family:var(--serif);font-weight:400;font-size:21px;color:#f4efe2;background:rgba(20,18,12,.84);padding:7px 13px;border-radius:9px;line-height:1.15}
.${P}-cap .kind{font-family:var(--mono);font-size:12px;letter-spacing:.1em;text-transform:uppercase;padding:8px 11px;border-radius:9px;color:#1a160c}
.${P}-cap .note{flex-basis:100%;font-size:13px;color:var(--ink2);background:rgba(20,18,12,.78);padding:5px 10px;border-radius:7px;width:max-content;max-width:100%}
.${P}-ctl{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-top:12px}
.${P}-ctl .slider input{width:260px}
.${P}-ctl output{font-family:var(--mono);font-size:13px;color:var(--goldhi);min-width:3ch;display:inline-block;text-align:right}
.${P}-try{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;align-items:center}
.${P}-try .${P}-panel{max-width:330px;margin:0 auto;width:100%}
.${P}-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:10px}
@media (max-width:760px){.${P}-row{grid-template-columns:1fr}.${P}-side{grid-template-columns:1fr 1fr}.${P}-try{grid-template-columns:1fr}}
`;
function injectCSS(){
  if (document.getElementById(P + '-css')) return; const s = document.createElement('style'); s.id = P + '-css'; s.textContent = CSS; document.head.appendChild(s);
}

const SCALE = 0.78;
const RADIUS = { C: 0.34, H: 0.2 };
const ELEMENT = { C: { color: 0x2b2926, rough: 0.32 }, H: { color: 0xf4f1e9, rough: 0.42 } };
const easeInOut = k => k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;

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

function makeStage(api){
  const THREE = api.THREE;
  const stage = api.el('div', { class: P + '-stage' });
  let renderer = null;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); } catch (e){ renderer = null; }
  if (!renderer){ stage.append(api.el('div', { class: P + '-fallback', text: 'This model needs WebGL, which this browser has turned off. The move and the trap still stand.' })); return { stage, ok: false }; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x0e0c08, 1);
  const canvas = renderer.domElement; Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block', borderRadius: '0' });
  canvas.setAttribute('aria-label', 'Butane in three dimensions, drag to turn');
  stage.append(canvas);
  const labels = api.el('div', { class: P + '-labels' }); stage.append(labels);
  const scene = new THREE.Scene();
  const env = studioEnvironment(THREE, renderer);
  scene.environment = env; scene.background = env; scene.backgroundBlurriness = 1; scene.backgroundIntensity = 0.12;
  const camera = new THREE.PerspectiveCamera(34, 1.6, 0.1, 60);
  camera.position.set(0, 0, 8); camera.lookAt(0, 0, 0);
  const key = new THREE.DirectionalLight(0xfff1d8, 2.4); key.position.set(2.6, 4.2, 5.5); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 20 });
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xcfdcff, 0.55); fill.position.set(-4, 1, 3); scene.add(fill);
  scene.add(new THREE.HemisphereLight(0x9a917f, 0x14120e, 0.35));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.42 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -2.4; floor.receiveShadow = true; scene.add(floor);
  const sway = new THREE.Group(), spin = new THREE.Group(); sway.add(spin); scene.add(sway);

  const S = { stage, ok: true, renderer, scene, camera, spin, sway, floor, labels, tweens: [], labelNodes: [], visible: true, dragging: false, needs: true, swayAmp: 1, onDrag: null, t0: performance.now() };
  S.resize = () => { const w = stage.clientWidth || 960, h = stage.clientHeight || Math.round(w / 1.6); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); S.needs = true; };
  S.tween = (ms, fn, done) => { if (api.reduced || ms <= 0){ fn(1); done && done(); S.needs = true; return; } S.tweens.push({ t0: performance.now(), ms, fn, done }); };
  S.project = v => { const p = v.clone().project(camera); const w = stage.clientWidth, h = stage.clientHeight; return { x: (p.x + 1) / 2 * w, y: (1 - p.y) / 2 * h, z: p.z }; };
  S.addLabel = (el, at, opts = {}) => { labels.append(el); const n = { el, at, opts }; S.labelNodes.push(n); return n; };
  S.placeLabels = () => {
    if (!S.labelNodes.length) return;
    const camDir = new THREE.Vector3(); camera.getWorldDirection(camDir);
    const center = new THREE.Vector3(); spin.getWorldPosition(center);
    const tmp = new THREE.Vector3();
    for (const n of S.labelNodes){
      n.at(tmp); const s = S.project(tmp);
      const depth = tmp.clone().sub(center).dot(camDir);
      let x = s.x + (n.opts.dx || 0), y = s.y + (n.opts.dy || 0);
      if (n.opts.radial){ const cs = S.project(center); let dx = s.x - cs.x, dy = s.y - cs.y, L = Math.hypot(dx, dy); if (L < 10){ dx = 0; dy = -1; L = 1; } x = s.x + dx / L * n.opts.radial; y = s.y + dy / L * n.opts.radial; }
      const hh = stage.clientHeight || 600; y = Math.min(Math.max(y, 22), hh - 70);
      let op = depth > 0.8 ? 0.6 : 1;
      if (n.opts.avoid && n.opts.avoid.x != null){ const ddx = x - n.opts.avoid.x, ddy = y - n.opts.avoid.y; if (Math.hypot(ddx, ddy) < 34){ x += 62; y += 6; op = 0.45; } }
      n.x = x; n.y = y;
      n.el.style.transform = 'translate(-50%,-50%) translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      n.el.style.opacity = String(op);
      n.el.style.zIndex = depth > 0 ? '1' : '3';
    }
  };
  let drag = null, moved = 0;
  canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; moved = 0; S.dragging = true; stage.classList.add('drag'); try { canvas.setPointerCapture(e.pointerId); } catch (err) {} });
  const end = () => { drag = null; S.dragging = false; stage.classList.remove('drag'); };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved += Math.abs(dx) + Math.abs(dy);
    const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx * 0.008), qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy * 0.008);
    spin.quaternion.premultiply(qy).premultiply(qx); drag = { x: e.clientX, y: e.clientY }; S.needs = true;
    if (moved >= 6 && S.onDrag) S.onDrag();
  });
  if (typeof ResizeObserver !== 'undefined'){ new ResizeObserver(() => S.resize()).observe(stage); } else window.addEventListener('resize', () => S.resize());
  if (typeof IntersectionObserver !== 'undefined'){ new IntersectionObserver(es => { for (const x of es){ S.visible = x.isIntersecting; if (S.visible) S.needs = true; } }, { threshold: 0 }).observe(stage); }
  const tick = () => {
    if (S.visible){
      const now = performance.now();
      for (const t of S.tweens.slice()){ const k = Math.min(1, (now - t.t0) / t.ms); t.fn(easeInOut(k)); if (k >= 1){ S.tweens.splice(S.tweens.indexOf(t), 1); t.done && t.done(); } S.needs = true; }
      if (!api.reduced && !S.dragging && S.swayAmp > 0){ const s = (now - S.t0) / 1000; sway.rotation.y = Math.sin(s * 0.5) * 0.07 * S.swayAmp; sway.rotation.x = Math.sin(s * 0.33) * 0.03 * S.swayAmp; S.needs = true; }
      if (S.needs){ renderer.render(scene, camera); S.placeLabels(); S.needs = false; }
    }
    requestAnimationFrame(tick);
  };
  S.resize(); requestAnimationFrame(tick);
  return S;
}
function setBond(THREE, mesh, a, b, radius){
  const d = b.clone().sub(a), L = d.length();
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  mesh.scale.set(radius, Math.max(L, 0.001), radius);
}

/* ---------- the Newman projection as SVG ---------- */
function drawNewman(api, deg, opts = {}){
  const c = api.colors, W = 300, Hh = 216, cx = 150, cy = 100;
  const svg = api.svg('svg', { viewBox: '0 0 ' + W + ' ' + Hh, role: 'img', 'aria-label': 'Newman projection of butane down the C2 C3 bond, dihedral ' + Math.round(norm(deg)) + ' degrees' });
  const pt = (r, a) => [cx + r * Math.cos(a * Math.PI / 180), cy - r * Math.sin(a * Math.PI / 180)];
  const st = station(deg);
  let drawn = norm(deg);
  if (st.kind === 'eclipsed' && Math.abs(st.delta) < 8) drawn = norm(st.deg + 12);
  const label = (r, a, text, big) => { const [x, y] = pt(r, a); svg.append(api.svg('text', { x: x.toFixed(1), y: (y + 1).toFixed(1), 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: big ? c.ink : c.ink2, style: { fontFamily: 'Georgia, serif', fontSize: big ? '14px' : '13px', fontWeight: big ? '700' : '400' } }, big ? ['CH', api.svg('tspan', { 'baseline-shift': 'sub', style: { fontSize: '10px' }, text: '3' })] : text)); };
  // the dihedral arc between the two methyls
  if (opts.showAngle){
    const a0 = 90, a1 = 90 + norm(deg), big = norm(deg) > 180 ? 1 : 0;
    const [x0, y0] = pt(56, a0), [x1, y1] = pt(56, a1);
    if (norm(deg) > 0.5) svg.append(api.svg('path', { d: 'M' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' A56 56 0 ' + big + ' 0 ' + x1.toFixed(1) + ' ' + y1.toFixed(1), fill: 'none', stroke: c.gold, 'stroke-width': 2, 'stroke-dasharray': '3 3', opacity: 0.9 }));
    const small = norm(deg) < 28, [mx, my] = pt(small ? 24 : 56, small ? 270 : 90 + norm(deg) / 2);
    svg.append(api.svg('rect', { x: (mx - 15).toFixed(1), y: (my - 8).toFixed(1), width: 30, height: 16, rx: 5, fill: 'rgba(18,16,11,.9)', stroke: 'rgba(201,168,76,.5)' }));
    svg.append(api.svg('text', { x: mx.toFixed(1), y: (my + 1).toFixed(1), 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: c.goldhi, style: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '10px', fontWeight: '600' }, text: String(Math.round(norm(deg))) }));
  }
  // back carbon: circle with three bonds from its rim
  const backAngles = [0, 120, 240].map(k => 90 + drawn + k);
  backAngles.forEach((a, k) => { const [x1, y1] = pt(42, a), [x2, y2] = pt(80, a); svg.append(api.svg('line', { x1: x1.toFixed(1), y1: y1.toFixed(1), x2: x2.toFixed(1), y2: y2.toFixed(1), stroke: k === 0 ? c.ink : c.ink2, 'stroke-width': k === 0 ? 3 : 2.2, 'stroke-linecap': 'round' })); });
  svg.append(api.svg('circle', { cx, cy, r: 42, fill: '#171410', stroke: c.ink3, 'stroke-width': 2 }));
  // front carbon: dot with three bonds
  const frontAngles = [90, 210, 330];
  frontAngles.forEach((a, k) => { const [x2, y2] = pt(62, a); svg.append(api.svg('line', { x1: cx, y1: cy, x2: x2.toFixed(1), y2: y2.toFixed(1), stroke: k === 0 ? c.ink : c.ink2, 'stroke-width': k === 0 ? 3 : 2.2, 'stroke-linecap': 'round' })); });
  svg.append(api.svg('circle', { cx, cy, r: 4.5, fill: c.goldhi }));
  frontAngles.forEach((a, k) => label(74, a, k === 0 ? 'CH3' : 'H', k === 0));
  backAngles.forEach((a, k) => label(92, a, k === 0 ? 'CH3' : 'H', k === 0));
  if (opts.legend !== false){
    svg.append(api.svg('text', { x: 6, y: Hh - 5, fill: c.ink3, style: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '9px', letterSpacing: '.1em' }, text: 'DOT = FRONT CARBON' }));
    svg.append(api.svg('text', { x: W - 6, y: Hh - 5, 'text-anchor': 'end', fill: c.ink3, style: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '9px', letterSpacing: '.1em' }, text: 'CIRCLE = BACK CARBON' }));
  }
  return svg;
}

/* ---------- the energy curve as SVG ---------- */
function drawEnergy(api, deg){
  const c = api.colors, W = 320, Hh = 130, x0 = 14, x1 = 308, yTop = 24, yBot = 96;
  const X = d => x0 + d / 360 * (x1 - x0), Y = e => yBot - e / 5 * (yBot - yTop);
  const svg = api.svg('svg', { viewBox: '0 0 ' + W + ' ' + Hh, role: 'img', 'aria-label': 'Potential energy of butane against the dihedral angle, with a marker at ' + Math.round(norm(deg)) + ' degrees' });
  const defs = api.svg('defs', {}, api.svg('linearGradient', { id: P + '-fill', x1: 0, y1: 0, x2: 0, y2: 1 }, api.svg('stop', { offset: '0%', 'stop-color': c.amber, 'stop-opacity': 0.28 }), api.svg('stop', { offset: '100%', 'stop-color': c.green, 'stop-opacity': 0.04 })));
  svg.append(defs);
  let d = '', area = 'M' + X(0) + ' ' + yBot;
  for (let a = 0; a <= 360; a += 3){ const x = X(a).toFixed(1), y = Y(energy(a)).toFixed(1); d += (a ? ' L' : 'M') + x + ' ' + y; area += ' L' + x + ' ' + y; }
  area += ' L' + X(360) + ' ' + yBot + ' Z';
  svg.append(api.svg('path', { d: area, fill: 'url(#' + P + '-fill)' }));
  svg.append(api.svg('line', { x1: x0, y1: yBot, x2: x1, y2: yBot, stroke: c.line, 'stroke-width': 1 }));
  for (let a = 0; a <= 360; a += 60){ svg.append(api.svg('line', { x1: X(a), y1: yBot, x2: X(a), y2: yBot + 4, stroke: c.ink3 })); svg.append(api.svg('text', { x: X(a), y: yBot + 20, 'text-anchor': 'middle', fill: c.ink3, style: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '9px' }, text: String(a) })); }
  svg.append(api.svg('path', { d, fill: 'none', stroke: c.ink2, 'stroke-width': 2, 'stroke-linejoin': 'round' }));
  for (const s of STATIONS){ svg.append(api.svg('circle', { cx: X(s.deg), cy: Y(s.e), r: 3, fill: s.kind === 'eclipsed' ? c.amber : c.green })); }
  svg.append(api.svg('circle', { cx: X(360), cy: Y(4.5), r: 3, fill: c.amber }));
  const tag = (a, text, above, anchor) => svg.append(api.svg('text', { x: X(a) + (anchor === 'start' ? 3 : 0), y: above ? Y(energy(a)) - 6 : Y(energy(a)) + 12, 'text-anchor': anchor || 'middle', fill: above ? c.amber : c.green, style: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '8px', letterSpacing: '.08em' }, text }));
  tag(0, 'ECLIPSED', true, 'start'); tag(120, 'ECLIPSED', true); tag(240, 'ECLIPSED', true); tag(60, 'GAUCHE', false); tag(300, 'GAUCHE', false); tag(180, 'ANTI', false);
  // the marker, with a tick on the axis instead of a line through the labels
  const mx = X(norm(deg)), my = Y(energy(deg));
  svg.append(api.svg('circle', { cx: mx, cy: my, r: 8, fill: c.gold, opacity: 0.25 }));
  svg.append(api.svg('circle', { cx: mx, cy: my, r: 4.5, fill: c.goldhi, stroke: '#1a160c', 'stroke-width': 1.5 }));
  const eTxt = energy(deg).toFixed(1) + ' kcal/mol above anti';
  svg.append(api.svg('rect', { x: x1 - 118, y: 1, width: 118, height: 13, rx: 4, fill: 'rgba(18,16,11,.9)', stroke: 'rgba(201,168,76,.45)' }));
  svg.append(api.svg('text', { x: x1 - 59, y: 10.5, 'text-anchor': 'middle', fill: c.goldhi, style: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '8.5px', fontWeight: '600' }, text: eTxt }));
  return svg;
}

export function mount(slots, api){
  const THREE = api.THREE;
  injectCSS();
  const c = api.colors;
  const S = makeStage(api);
  const row = api.el('div', { class: P + '-row' });
  const side = api.el('div', { class: P + '-side' });
  const newmanPanel = api.el('div', { class: P + '-panel' }, api.el('div', { class: 't', text: 'Newman projection, same dihedral' }));
  const energyPanel = api.el('div', { class: P + '-panel' }, api.el('div', { class: 't', text: 'Energy versus dihedral' }));
  side.append(newmanPanel, energyPanel);
  row.append(S.stage, side);
  slots.visual.append(row);

  let deg = 180, newmanSvg = null, energySvg = null;
  const cap = S.ok ? api.el('div', { class: P + '-cap' }) : null;
  function drawSide(){
    const n = drawNewman(api, deg, { showAngle: true }); if (newmanSvg) newmanSvg.replaceWith(n); else newmanPanel.append(n); newmanSvg = n;
    const e = drawEnergy(api, deg); if (energySvg) energySvg.replaceWith(e); else energyPanel.append(e); energySvg = e;
  }

  // 3D butane
  let atomMeshes = [], bondMeshes = [];
  const AX = (x, y, z, a) => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(x, y, z), a);
  const DEFAULT_Q = AX(1, 0, 0, 0.26).multiply(AX(0, 1, 0, -0.3)).multiply(AX(0, 0, 1, -1.08)).multiply(AX(0, 1, 0, Math.PI / 2));
  let newmanOn = false;
  let lookChip = null;
  if (S.ok){
    const hud = api.el('div', { class: P + '-hud' }, api.el('b', { text: 'Butane, down the C2 to C3 bond' }), api.el('span', { text: '' }));
    S.hud = hud;
    const help = api.el('div', { class: P + '-help', text: 'Drag to turn' });
    S.stage.append(hud, help, cap);
    const mol = new THREE.Group(); S.spin.add(mol);
    const bondMat = new THREE.MeshStandardMaterial({ color: 0xb9a878, roughness: 0.32, metalness: 0.7, envMapIntensity: 1.0 });
    const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 24, 1, true);
    const geo = { C: new THREE.SphereGeometry(RADIUS.C, 48, 32), H: new THREE.SphereGeometry(RADIUS.H, 40, 28) };
    const m0 = butaneAtoms(deg);
    atomMeshes = m0.atoms.map(a => {
      const el = ELEMENT[a.el];
      const mesh = new THREE.Mesh(geo[a.el], new THREE.MeshPhysicalMaterial({ color: el.color, roughness: el.rough, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.22, envMapIntensity: 1.1 }));
      mesh.castShadow = true; mesh.receiveShadow = true; mesh.userData.atom = a; mol.add(mesh); return mesh;
    });
    bondMeshes = m0.bonds.map(b => { const mesh = new THREE.Mesh(unitCyl, bondMat); mesh.castShadow = true; mesh.receiveShadow = true; mesh.userData.b = b; mol.add(mesh); return mesh; });
    // a faint sight line down the C2 C3 bond, so "look down the bond" has something to aim at
    const axisMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(c.gold), transparent: true, opacity: 0.16, toneMapped: false, depthWrite: false });
    const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 7.5, 12, 1, true), axisMat); axis.rotation.x = Math.PI / 2; axis.renderOrder = 5; mol.add(axis);
    const labFront = api.el('div', { class: P + '-lab' }, 'CH', api.el('sub', { text: '3' }), api.el('small', { text: 'front' }));
    const labBack = api.el('div', { class: P + '-lab' }, 'CH', api.el('sub', { text: '3' }), api.el('small', { text: 'back' }));
    const c1 = atomMeshes.find(m => m.userData.atom.tag === 'C1'), c4 = atomMeshes.find(m => m.userData.atom.tag === 'C4');
    const nFront = S.addLabel(labFront, out => { out.copy(c1.position); mol.localToWorld(out); }, { radial: 40 });
    S.addLabel(labBack, out => { out.copy(c4.position); mol.localToWorld(out); }, { radial: 40, avoid: nFront });
    S.camera.position.set(0, 0, 6.7); S.camera.lookAt(0, -0.1, 0); S.floor.position.y = -2.3;
    S.spin.quaternion.copy(DEFAULT_Q);
    S.onDrag = () => { if (newmanOn){ newmanOn = false; S.swayAmp = 1; S.spin.position.y = 0; lookChip && lookChip.setAttribute('aria-pressed', 'false'); } };
  }
  function pose(){
    if (!S.ok) return;
    const m = butaneAtoms(deg);
    m.atoms.forEach((a, i) => atomMeshes[i].position.set(a.pos[0] * SCALE, a.pos[1] * SCALE, a.pos[2] * SCALE));
    bondMeshes.forEach(mesh => { const b = mesh.userData.b; const toH = m.atoms[b.a].el === 'H' || m.atoms[b.b].el === 'H'; setBond(THREE, mesh, atomMeshes[b.a].position, atomMeshes[b.b].position, toH ? 0.062 : 0.088); });
    S.needs = true;
  }
  function caption(){
    if (!cap) return;
    const cf = conformation(deg);
    const col = cf.key === 'anti' ? c.green : cf.kind === 'eclipsed' ? c.amber : c.amber;
    cap.replaceChildren(
      api.el('b', { text: 'Dihedral ' + Math.round(norm(deg)) + ' · ' + cf.label }),
      api.el('span', { class: 'kind', text: cf.kind + (cf.kind === 'staggered' ? ' valley' : ' peak'), style: { background: col } }));
    if (S.hud) S.hud.lastChild.textContent = cf.line;
  }
  function setDeg(d, fromSlider){
    deg = norm(d);
    if (!fromSlider){ slider.value = String(Math.round(deg)); }
    out.value = String(Math.round(deg));
    pose(); drawSide(); caption();
  }
  function tweenDeg(target){
    const from = deg; let delta = ((target - from + 540) % 360) - 180;
    if (api.reduced){ setDeg(target); return; }
    S.tween(560, k => setDeg(from + delta * k));
  }

  // controls
  const slider = api.el('input', { type: 'range', min: '0', max: '360', step: '1', value: '180', 'aria-label': 'Dihedral angle between the two methyls', onInput: () => setDeg(Number(slider.value), true) });
  const out = api.el('output', { text: '180' });
  const ctl = api.el('div', { class: P + '-ctl' },
    api.el('label', { class: 'slider' }, 'Dihedral ', slider, out, ' degrees'),
    api.el('div', { class: 'controls', style: { marginTop: '0' } },
      lookChip = api.el('button', { type: 'button', class: 'chip', text: 'Look down the bond', 'aria-pressed': 'false', onClick: () => {
        if (!S.ok) return;
        newmanOn = !newmanOn;
        lookChip.setAttribute('aria-pressed', String(newmanOn));
        const q0 = S.spin.quaternion.clone(), q1 = newmanOn ? new THREE.Quaternion() : DEFAULT_Q.clone();
        const y0 = S.spin.position.y, y1 = newmanOn ? -0.55 : 0;
        S.swayAmp = 0; S.sway.rotation.set(0, 0, 0);
        S.tween(900, k => { S.spin.quaternion.slerpQuaternions(q0, q1, k); S.spin.position.y = y0 + (y1 - y0) * k; }, () => { S.swayAmp = newmanOn ? 0 : 1; });
      } }),
      ...[[0, 'Eclipsed 0'], [60, 'Gauche 60'], [120, 'Eclipsed 120'], [180, 'Anti 180']].map(([d, t]) => api.el('button', { type: 'button', class: 'chip', text: t, onClick: () => tweenDeg(d) }))));
  slots.visual.append(ctl);
  setDeg(180);

  /* ---------------- you try ---------------- */
  let n = 0;
  const host = slots.try;
  function next(){
    host.replaceChildren(); api.clearCoach();
    const kind = n % 2 ? 'N' : 'S'; n++;
    const item = genItem(kind, api.rng);
    const box = api.el('div', { class: 'item' });
    box.append(api.el('p', { class: 'prompt', text: item.prompt }));
    const verdict = api.el('div', { class: 'verdict' }), actions = api.el('div', { class: P + '-actions' });
    let reported = false, done = false;
    const finish = ok => {
      if (!reported){ api.report(ok); reported = true; }
      if (ok){ done = true; verdict.className = 'verdict good'; verdict.textContent = 'You can read it.'; actions.append(api.el('button', { type: 'button', class: 'primary', text: 'Another one', onClick: next })); }
      else { verdict.className = 'verdict notyet'; verdict.textContent = 'Not yet.'; }
    };
    if (kind === 'S'){
      let d = item.start;
      const panel = api.el('div', { class: P + '-panel' });
      let svg = drawNewman(api, d, { showAngle: true }); panel.append(svg);
      const sl = api.el('input', { type: 'range', min: '0', max: '360', step: '1', value: String(d), 'aria-label': 'Turn the back carbon' });
      const o = api.el('output', { text: String(d) });
      sl.addEventListener('input', () => { if (done) return; d = Number(sl.value); o.value = String(d); const s2 = drawNewman(api, d, { showAngle: true }); svg.replaceWith(s2); svg = s2; });
      const lock = api.el('button', { type: 'button', class: 'primary', text: 'Lock it in', onClick: () => {
        if (done) return;
        const ok = accept(d, item.degs);
        finish(ok);
        if (ok){ lock.disabled = true; sl.disabled = true; const s2 = drawNewman(api, d, { showAngle: true }); svg.replaceWith(s2); svg = s2; }
        else api.coach(item.target === 'anti' ? 'Anti is the two big groups as far apart as they can get: 180 degrees apart, one straight up, one straight down.' : item.target === 'gauche' ? 'Gauche is staggered with the two methyls next door, 60 degrees apart. Elbow room, but not much.' : 'Eclipsed is the eclipse: the back methyl hides directly under the front one, 0 degrees apart.');
      } });
      const right = api.el('div', {},
        api.el('div', { class: 'slider', style: { marginBottom: '12px' } }, api.el('label', {}, 'Back carbon ', sl, ' ', o, ' degrees')),
        api.el('p', { style: { color: c.ink2, fontSize: '14px', margin: '0 0 10px' }, text: 'Slide until the two CH3 groups are ' + item.text + ', then lock it in.' }),
        lock, verdict, actions);
      box.append(api.el('div', { class: P + '-try' }, panel, right));
    } else {
      const panel = api.el('div', { class: P + '-panel' }, drawNewman(api, item.deg, { showAngle: false }));
      const opts = api.el('div', { class: 'opts', style: { gridTemplateColumns: '1fr' } });
      const buttons = item.options.map((o, i) => api.el('button', { type: 'button', class: 'opt' }, api.el('span', { class: 'k', text: 'ABCD'[i] }), api.el('span', { text: NAMES.find(x => x.key === o).name })));
      buttons.forEach((b, i) => b.addEventListener('click', () => {
        if (done) return;
        b.classList.add('picked');
        const ok = item.options[i] === item.answer;
        if (ok){ b.classList.add('ok'); for (const x of buttons) x.disabled = true; } else b.disabled = true;
        finish(ok);
        if (!ok){
          const st = station(item.deg);
          api.coach(st.kind === 'eclipsed' ? 'Eclipsed is the eclipse: back bonds lined up directly under the front bonds. Then ask what is hiding under the front methyl: another methyl, or a hydrogen.' : 'Staggered, so it is a valley. Now measure the two methyls: 60 apart is gauche, 180 apart, straight up and straight down, is anti.');
        }
      }));
      buttons.forEach(b => opts.append(b));
      box.append(api.el('div', { class: P + '-try' }, panel, api.el('div', {}, opts, verdict, actions)));
    }
    host.append(box);
  }
  next();
}
