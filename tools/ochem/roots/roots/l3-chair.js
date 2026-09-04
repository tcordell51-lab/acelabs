// The Roots of Organic: l3-chair. Cyclohexane chair, axial versus equatorial, up versus down, ring flip.
// No imports. The shell passes THREE in api when meta.needs3D is true.

export const meta = {
  id: 'l3-chair',
  level: 3,
  order: 3,
  needs3D: true,
  title: 'Fence posts and the boat',
  concept: 'Chair conformations',
  tagline: 'Up stays up. Axial and equatorial trade places.',
  story: 'Cyclohexane does not lie flat, it sits in a chair. Two kinds of bonds come off it. Axial bonds point straight up or straight down, alternating around the ring like fence posts. Equatorial bonds angle outward around the belt line, the comfy seats. Big groups, tert-butyl, that little fan shape, isopropyl, want the comfy seat. If you imagine your chair is like a boat, if you have a big, bulky group standing vertically, or axial, it is going to be top-heavy. Now the ring can flip. A ring flip swaps axial and equatorial, but up stays up and down stays down. Axial and equatorial just kind of happen, the thing we want to keep an eye on is our up and down. Rule of thumb: up stays up, and big groups take the comfy seat.',
  moveName: 'Up stays up, then find the comfy seat',
  move: [
    'Find the carbon and ask: is this bond up or down? That never changes.',
    'Then ask: axial (a fence post, straight up or down) or equatorial (angled out, the comfy seat)?',
    'Ring flip: axial becomes equatorial and equatorial becomes axial. Up is still up.',
    'Put the biggest group equatorial and the ring is happiest.'
  ],
  trap: 'Careful: cis and trans are about up and down, not axial and equatorial. Two groups can both be equatorial and still be trans.',
  holdsUp: ['Stability rankings', 'E2 in rings needs an axial leaving group', 'Glucose chairs in bio', 'Wedge-dash to chair conversion'],
  drill: 'Booster OChem: Conformations and Stereochemistry'
};

/* ------------------------------------------------------------------ */
/* Pure geometry (node-safe). y is up. The chair is built from ideal   */
/* tetrahedral angles, so axial and equatorial come out of the math,   */
/* and the flat drawing is a projection of the same coordinates.       */
/* ------------------------------------------------------------------ */
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const vlen = a => Math.hypot(a[0], a[1], a[2]);
const unit = a => { const l = vlen(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const angleDeg = (a, b) => Math.acos(Math.max(-1, Math.min(1, dot(unit(a), unit(b))))) * 180 / Math.PI;
const COS_T = -1 / 3, SIN_T = Math.sqrt(8) / 3;
const CC = 1.54, R = CC / Math.sqrt(1.125), HC = R * Math.sqrt(1 / 32);   // ring radius and half-height for exact 109.47 angles
const Q3 = HC * Math.sqrt(6), Q2 = 0.56;                                   // chair amplitude, twist-boat amplitude on the flip path
const BETA = Math.acos(1 / Math.sqrt(3));                                  // half the tetrahedral angle, 54.7356 degrees
export const AVALUE = { Me: 1.7, tBu: 4.9 };
export const GROUPS = { Me: { name: 'methyl', short: 'CH3', a: 1.7 }, tBu: { name: 'tert-butyl', short: 'tBu', a: 4.9 } };

// ring carbons along the flip path: t = 0 chair A (even carbons up), t = 1 chair B, t = 0.5 twist-boat
export function ringCarbons(t){
  const q3 = Q3 * Math.cos(Math.PI * t), q2 = Q2 * Math.sin(Math.PI * t);
  const ys = [];
  for (let j = 0; j < 6; j++) ys.push(Math.sqrt(1 / 6) * q3 * (j % 2 ? -1 : 1) + Math.sqrt(1 / 3) * q2 * Math.cos(Math.PI / 6 + 2 * Math.PI * j / 3));
  // breathe the radius so the bonds stay 1.54 on average along the flip path (exact at both chairs)
  let m = 0; for (let j = 0; j < 6; j++){ const dy = ys[j] - ys[(j + 1) % 6]; m += dy * dy; } m /= 6;
  const r = Math.sqrt(CC * CC - m);
  const out = [];
  for (let j = 0; j < 6; j++){ const th = j * Math.PI / 3; out.push([r * Math.cos(th), ys[j], r * Math.sin(th)]); }
  return out;
}
// the two substituent directions at every carbon, named by up and down (never by axial)
export function slotDirs(C){
  return C.map((p, j) => {
    const b1 = unit(sub(C[(j + 5) % 6], p)), b2 = unit(sub(C[(j + 1) % 6], p));
    const m = unit(mul(add(b1, b2), -1));
    let n = unit(cross(b1, b2)); if (n[1] < 0) n = mul(n, -1);
    const cb = Math.cos(BETA), sb = Math.sin(BETA);
    return { up: unit(add(mul(m, cb), mul(n, sb))), down: unit(sub(mul(m, cb), mul(n, sb))), b1, out: m };
  });
}
// the table: in chair A the even carbons are up carbons, and an up carbon's up bond is axial
export function isAxial(j, ud, chairB){ const upCarbon = (j % 2 === 0) !== !!chairB; return ud === 'up' ? upCarbon : !upCarbon; }
export const stateOf = (j, ud, chairB) => ({ ud, ax: isAxial(j, ud, chairB) ? 'axial' : 'equatorial' });
export function strain(subs, chairB){ return subs.reduce((s, x) => s + (isAxial(x.j, x.ud, chairB) ? GROUPS[x.g].a : 0), 0); }

// the flat drawing: the classic chair, seen from the front and a little above
// (a 16 degree turn and a longer axial stub keep all twelve bond ends well apart for tapping)
const ELEV = 16 * Math.PI / 180, AZ = 16 * Math.PI / 180, STUB_AX = 1.2, STUB_EQ = 0.85;
export function project2D(p){
  const x = p[0] * Math.cos(AZ) - p[2] * Math.sin(AZ), z = p[0] * Math.sin(AZ) + p[2] * Math.cos(AZ);
  return [x, -(p[1] * Math.cos(ELEV) - z * Math.sin(ELEV))];
}
export function chair2D(chairB){
  const C = ringCarbons(chairB ? 1 : 0), D = slotDirs(C);
  const ring = C.map(project2D);
  const stubs = [];
  C.forEach((p, j) => { for (const ud of ['up', 'down']){ const ax = isAxial(j, ud, chairB), L = ax ? STUB_AX : STUB_EQ; const [x2, y2] = project2D(add(p, mul(D[j][ud], L))); const [lx, ly] = project2D(add(p, mul(D[j][ud], L + 0.36))); stubs.push({ j, ud, x1: ring[j][0], y1: ring[j][1], x2, y2, lx, ly, axial: ax, front: p[2] > 0.01 }); } });
  return { ring, stubs };
}

/* ---------- item generators ---------- */
function shuffleWith(rng, arr){ const b = arr.slice(); for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
const FLIP_OPTS = ['equatorial up', 'axial down', 'equatorial down', 'axial up'];
export function genItem(kind, rng){
  const chairB = rng() < 0.5;
  if (kind === 'T'){
    return { kind, chairB, g: 'tBu', prompt: 'Put the tert-butyl in the comfy seat.' };
  }
  if (kind === 'F'){
    const j = Math.floor(rng() * 6), ud = rng() < 0.5 ? 'up' : 'down';
    const before = stateOf(j, ud, chairB), after = stateOf(j, ud, !chairB);
    return { kind, chairB, j, ud, g: 'Me', before, answer: after.ax + ' ' + after.ud, options: shuffleWith(rng, FLIP_OPTS), prompt: 'After a ring flip, this ' + before.ax + '-' + before.ud + ' methyl becomes:' };
  }
  // M: the two chairs of one molecule, which is more stable
  const count = rng() < 0.35 ? 1 : 2;
  const subs = [];
  const j1 = Math.floor(rng() * 6);
  subs.push({ j: j1, ud: rng() < 0.5 ? 'up' : 'down', g: rng() < 0.5 ? 'Me' : 'tBu' });
  if (count === 2){ let j2 = Math.floor(rng() * 5); if (j2 >= j1) j2++; subs.push({ j: j2, ud: rng() < 0.5 ? 'up' : 'down', g: rng() < 0.5 ? 'Me' : 'tBu' }); }
  const sA = strain(subs, false), sB = strain(subs, true);
  const answer = sA < sB - 1e-9 ? 'A' : sB < sA - 1e-9 ? 'B' : 'same';
  return { kind: 'M', subs, sA, sB, answer, options: ['A', 'B', 'same'], prompt: 'Which chair is more stable?' };
}

export function selfTest(){
  try {
    // geometry at both chairs
    for (const t of [0, 1]){
      const C = ringCarbons(t), D = slotDirs(C);
      for (let j = 0; j < 6; j++){
        const L = vlen(sub(C[j], C[(j + 1) % 6])); if (Math.abs(L - CC) > 1e-9) throw new Error('ring bond ' + L);
        const b1 = sub(C[(j + 5) % 6], C[j]), b2 = sub(C[(j + 1) % 6], C[j]);
        if (Math.abs(angleDeg(b1, b2) - 109.4712) > 0.001) throw new Error('ring angle ' + angleDeg(b1, b2));
        for (const ud of ['up', 'down']){
          const d = D[j][ud];
          if (Math.abs(angleDeg(d, b1) - 109.4712) > 0.001 || Math.abs(angleDeg(d, b2) - 109.4712) > 0.001) throw new Error('slot angle');
          const ax = isAxial(j, ud, t === 1);
          const vertical = Math.abs(Math.abs(d[1]) - 1) < 1e-6;
          if (ax !== vertical) throw new Error('table disagrees with geometry at C' + (j + 1) + ' ' + ud + ' chair ' + (t ? 'B' : 'A'));
          if (ud === 'up' && d[1] <= 0) throw new Error('up slot points down');
          if (ud === 'down' && d[1] >= 0) throw new Error('down slot points up');
          if (!ax && Math.abs(d[1]) > 0.34) throw new Error('equatorial too steep');
        }
        if (Math.abs(angleDeg(D[j].up, D[j].down) - 109.4712) > 0.001) throw new Error('H C H angle');
      }
    }
    // the flip keeps up and down, swaps axial and equatorial
    for (let j = 0; j < 6; j++) for (const ud of ['up', 'down']){ const a = stateOf(j, ud, false), b = stateOf(j, ud, true); if (a.ud !== b.ud || a.ax === b.ax) throw new Error('flip table'); }
    // the twist boat in the middle has the D2 pattern, and the path never breaks a bond badly
    const mid = ringCarbons(0.5).map(c => c[1]);
    if (!(Math.abs(mid[0] - mid[3]) < 1e-9 && Math.abs(mid[1] - mid[4]) < 1e-9 && Math.abs(mid[2]) < 1e-9 && Math.abs(mid[5]) < 1e-9 && mid[0] > 0.2 && mid[1] < -0.2)) throw new Error('twist boat shape');
    let pathDev = 0;
    for (let k = 0; k <= 40; k++){ const C = ringCarbons(k / 40); for (let j = 0; j < 6; j++){ const L = vlen(sub(C[j], C[(j + 1) % 6])); pathDev = Math.max(pathDev, Math.abs(L - CC) / CC); if (L < 1.40 || L > 1.68) throw new Error('flip path bond ' + L.toFixed(3)); } }
    // the flat drawing keeps its twelve tap targets apart
    let minSep = 1e9;
    for (const chairB of [false, true]){
      const F = chair2D(chairB);
      for (let i = 0; i < 12; i++) for (let k = i + 1; k < 12; k++){ const a = F.stubs[i], b = F.stubs[k]; minSep = Math.min(minSep, Math.hypot(a.x2 - b.x2, a.y2 - b.y2)); }
      for (const s of F.stubs){ if (s.axial && Math.abs(s.x2 - s.x1) > 1e-9) throw new Error('axial stub not vertical in the drawing'); }
    }
    if (minSep < 0.5) throw new Error('tap targets too close: ' + minSep.toFixed(2));
    // items
    let s = 3;
    const rng = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    let tried = 0; const seen = { A: 0, B: 0, same: 0 };
    for (let i = 0; i < 210; i++){
      const kind = 'TFM'[i % 3], it = genItem(kind, rng); tried++;
      if (kind === 'T'){ const eq = chair2D(it.chairB).stubs.filter(x => !x.axial); if (eq.length !== 6) throw new Error('comfy seats'); }
      else if (kind === 'F'){
        if (it.options.filter(o => o === it.answer).length !== 1) throw new Error('F answer not unique');
        if (it.answer.split(' ')[1] !== it.ud) throw new Error('F changed up and down');
        if (it.answer.split(' ')[0] === it.before.ax) throw new Error('F kept axial');
      } else {
        seen[it.answer]++;
        const a = strain(it.subs, false), b = strain(it.subs, true);
        if ((it.answer === 'A') !== (a < b) || (it.answer === 'B') !== (b < a)) throw new Error('M answer');
        if (it.subs.length === 2 && it.subs[0].j === it.subs[1].j) throw new Error('M same carbon');
      }
    }
    if (!seen.A || !seen.B || !seen.same) throw new Error('M answers not varied: ' + JSON.stringify(seen));
    s = 8; const a1 = JSON.stringify(genItem('M', rng)); s = 8; const a2 = JSON.stringify(genItem('M', rng)); if (a1 !== a2) throw new Error('not deterministic');
    return { ok: true, tried, notes: 'chair angles exact, table matches geometry, tap targets ' + minSep.toFixed(2) + ' apart, flip path bonds within ' + (pathDev * 100).toFixed(1) + '%' };
  } catch (e){ return { ok: false, tried: 0, notes: e.message }; }
}

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */
const P = 'l3c';
const CSS = `
.${P}-stage{position:relative;width:100%;aspect-ratio:16/10;background:#0e0c08;border:1px solid var(--line);border-radius:12px;overflow:hidden;box-shadow:0 30px 60px -30px rgba(0,0,0,.8),inset 0 0 0 1px rgba(255,255,255,.02);cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}
.${P}-stage.drag{cursor:grabbing}
.${P}-stage.hot{cursor:pointer}
.${P}-fallback{position:absolute;inset:0;display:grid;place-items:center;color:var(--ink2);padding:24px;text-align:center}
.${P}-labels{position:absolute;inset:0;pointer-events:none}
.${P}-lab{position:absolute;left:0;top:0;font-family:var(--serif);font-weight:600;font-size:16px;line-height:1;color:#f4efe2;background:rgba(18,16,11,.82);padding:5px 9px 6px;border-radius:7px;white-space:nowrap;box-shadow:0 1px 6px rgba(0,0,0,.5);transition:opacity .25s;text-align:center}
.${P}-lab small{display:block;font-family:var(--mono);font-weight:400;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin-top:4px}
.${P}-num{font-family:var(--mono);font-weight:600;font-size:11px;padding:2px 5px 3px;color:var(--goldhi);background:rgba(18,16,11,.72);box-shadow:0 0 0 1px rgba(201,168,76,.35)}
.${P}-hud{position:absolute;left:12px;top:12px;pointer-events:none;background:rgba(20,18,12,.78);padding:7px 11px;border-radius:9px;max-width:58%}
.${P}-hud b{display:block;font-family:var(--serif);font-weight:400;font-size:18px;color:var(--goldhi);line-height:1.15}
.${P}-hud span{display:block;font-size:12.5px;line-height:1.35;color:var(--ink2);margin-top:3px}
.${P}-help{position:absolute;right:12px;top:12px;font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3);background:rgba(20,18,12,.72);padding:6px 9px;border-radius:8px;pointer-events:none}
.${P}-cap{position:absolute;left:12px;right:12px;bottom:12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;pointer-events:none}
.${P}-cap b{font-family:var(--serif);font-weight:400;font-size:21px;color:#f4efe2;background:rgba(20,18,12,.84);padding:7px 13px;border-radius:9px;line-height:1.15}
.${P}-cap .kind{font-family:var(--mono);font-size:12px;letter-spacing:.1em;text-transform:uppercase;padding:8px 11px;border-radius:9px;color:#1a160c}
.${P}-rows{display:grid;gap:8px;margin-top:12px}
.${P}-rows .lbl{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink3);margin-right:4px}
.${P}-legend{display:flex;gap:14px;flex-wrap:wrap;font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3);margin-top:10px}
.${P}-legend i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;vertical-align:-1px}
.${P}-flat{position:relative;margin:0 auto;width:100%}
.${P}-flat svg{width:100%;height:auto;display:block}
.${P}-hit{position:absolute;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:1px solid transparent;background:transparent;padding:0;cursor:pointer}
.${P}-hit:hover,.${P}-hit:focus-visible{border-color:var(--gold);background:rgba(201,168,76,.12)}
.${P}-hit.picked{border-color:var(--goldhi);box-shadow:0 0 0 2px rgba(230,208,138,.35)}
.${P}-hit.ok{border-color:var(--good);box-shadow:0 0 0 2px rgba(87,180,135,.35);background:rgba(87,180,135,.12)}
.${P}-hit:disabled{cursor:default}
.${P}-hit:disabled:hover{border-color:transparent;background:transparent}
.${P}-pair{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:6px 0 4px}
.${P}-pair .name{font-family:var(--serif);font-size:18px;color:var(--goldhi);margin:0 0 4px;text-align:center}
.${P}-panel{background:#0e0c08;border:1px solid var(--line);border-radius:12px;padding:8px}
.${P}-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:10px}
@media (max-width:640px){.${P}-pair{grid-template-columns:1fr}}
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
  canvas.setAttribute('aria-label', 'A cyclohexane chair in three dimensions, drag to turn, tap a hydrogen to place a group');
  stage.append(canvas);
  const labels = api.el('div', { class: P + '-labels' }); stage.append(labels);
  const scene = new THREE.Scene();
  const env = studioEnvironment(THREE, renderer);
  scene.environment = env; scene.background = env; scene.backgroundBlurriness = 1; scene.backgroundIntensity = 0.12;
  const camera = new THREE.PerspectiveCamera(34, 1.6, 0.1, 60);
  const key = new THREE.DirectionalLight(0xfff1d8, 2.4); key.position.set(2.6, 4.2, 5.5); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 20 });
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xcfdcff, 0.55); fill.position.set(-4, 1, 3); scene.add(fill);
  scene.add(new THREE.HemisphereLight(0x9a917f, 0x14120e, 0.35));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.42 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -2.4; floor.receiveShadow = true; scene.add(floor);
  const sway = new THREE.Group(), spin = new THREE.Group(); sway.add(spin); scene.add(sway);

  const S = { stage, ok: true, renderer, scene, camera, spin, sway, floor, labels, tweens: [], labelNodes: [], visible: true, dragging: false, needs: true, swayAmp: 1, tapTargets: [], onTap: null, t0: performance.now() };
  S.resize = () => { const w = stage.clientWidth || 960, h = stage.clientHeight || Math.round(w / 1.6); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); S.needs = true; };
  S.tween = (ms, fn, done) => { if (api.reduced || ms <= 0){ fn(1); done && done(); S.needs = true; return; } S.tweens.push({ t0: performance.now(), ms, fn, done }); };
  S.project = v => { const p = v.clone().project(camera); const w = stage.clientWidth, h = stage.clientHeight; return { x: (p.x + 1) / 2 * w, y: (1 - p.y) / 2 * h, z: p.z }; };
  S.addLabel = (el, at, opts = {}) => { labels.append(el); const n = { el, at, opts }; S.labelNodes.push(n); return n; };
  S.removeLabel = n => { const i = S.labelNodes.indexOf(n); if (i >= 0) S.labelNodes.splice(i, 1); n.el.remove(); };
  S.placeLabels = () => {
    if (!S.labelNodes.length) return;
    const camDir = new THREE.Vector3(); camera.getWorldDirection(camDir);
    const center = new THREE.Vector3(); spin.getWorldPosition(center);
    const tmp = new THREE.Vector3(), hh = stage.clientHeight || 600;
    for (const n of S.labelNodes){
      n.at(tmp); const s = S.project(tmp);
      const depth = tmp.clone().sub(center).dot(camDir);
      const ody = typeof n.opts.dy === 'function' ? n.opts.dy() : (n.opts.dy || 0);
      let x = s.x + (n.opts.dx || 0), y = s.y + ody;
      if (n.opts.radial){ const cs = S.project(center); let dx = s.x - cs.x, dy = s.y - cs.y, L = Math.hypot(dx, dy); if (L < 10){ dx = 0; dy = -1; L = 1; } x = s.x + dx / L * n.opts.radial; y = s.y + dy / L * n.opts.radial; }
      if (n.opts.clamp !== false) y = Math.min(Math.max(y, 22), hh - 70);
      n.el.style.transform = 'translate(-50%,-50%) translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      n.el.style.opacity = n.opts.fade === false ? '1' : (depth > 0.8 ? '0.6' : '1');
      n.el.style.zIndex = depth > 0 ? '1' : '3';
    }
  };
  let drag = null, moved = 0;
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const pickAt = e => { const r = canvas.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); const hits = ray.intersectObjects(S.tapTargets.filter(o => o.visible), false); return hits.length ? hits[0].object : null; };
  canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; moved = 0; S.dragging = true; stage.classList.add('drag'); try { canvas.setPointerCapture(e.pointerId); } catch (err) {} });
  const end = e => { if (drag && moved < 6 && S.onTap && e) S.onTap(pickAt(e)); drag = null; S.dragging = false; stage.classList.remove('drag'); };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', () => end(null));
  canvas.addEventListener('pointermove', e => {
    if (drag){
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved += Math.abs(dx) + Math.abs(dy);
      const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx * 0.008), qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy * 0.008);
      spin.quaternion.premultiply(qy).premultiply(qx); drag = { x: e.clientX, y: e.clientY }; S.needs = true;
    } else if (S.tapTargets.length){ stage.classList.toggle('hot', !!pickAt(e)); }
  });
  canvas.addEventListener('pointerleave', () => stage.classList.remove('hot'));
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
const V3 = (THREE, a) => new THREE.Vector3(a[0], a[1], a[2]);
// the three tetrahedral directions around an axis, with a phase measured from a reference direction
function tetraAround(backDir, refDir, phaseOff){
  const a = unit(backDir);
  let u = sub(refDir, mul(a, dot(refDir, a))); if (vlen(u) < 1e-6) u = cross(a, Math.abs(a[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]);
  u = unit(u); const v = unit(cross(a, u));
  return [0, 1, 2].map(k => { const p = phaseOff + k * 2 * Math.PI / 3; return unit(add(mul(a, COS_T), mul(add(mul(u, Math.cos(p)), mul(v, Math.sin(p))), SIN_T))); });
}

/* ---------- the flat chair as SVG ---------- */
function drawChair(api, chairB, opts = {}){
  const c = api.colors, F = chair2D(chairB), PX = opts.px || 90, pad = 0.38;
  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
  const bump = (x, y) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); };
  for (const s of F.stubs){ bump(s.x2, s.y2); bump(s.lx, s.ly); }
  const W = (maxX - minX + 2 * pad) * PX, Hh = (maxY - minY + 2 * pad) * PX;
  const X = x => (x - minX + pad) * PX, Y = y => (y - minY + pad) * PX;
  const svg = api.svg('svg', { viewBox: '0 0 ' + W.toFixed(1) + ' ' + Hh.toFixed(1), role: 'img', 'aria-label': 'A cyclohexane chair drawn flat' + (opts.subs && opts.subs.length ? ' with substituents' : '') });
  const subs = opts.subs || [];
  const subAt = (j, ud) => subs.find(x => x.j === j && x.ud === ud);
  // stubs first, faint unless carrying a group
  for (const s of F.stubs){
    const g = subAt(s.j, s.ud), isMark = opts.mark && opts.mark.j === s.j && opts.mark.ud === s.ud;
    const lit = g || isMark;
    if (!lit && opts.stubs === 'none') continue;
    const litColor = opts.lit && opts.lit.j === s.j && opts.lit.ud === s.ud ? opts.lit.color : null;
    svg.append(api.svg('line', { x1: X(s.x1).toFixed(1), y1: Y(s.y1).toFixed(1), x2: X(s.x2).toFixed(1), y2: Y(s.y2).toFixed(1), stroke: litColor || (lit ? c.ink : c.ink2), 'stroke-width': lit ? 2.8 : 1.9, 'stroke-linecap': 'round', opacity: lit ? 1 : 0.85 }));
    if (g){
      const label = GROUPS[g.g].short;
      const [tx, ty] = [X(s.lx), Y(s.ly)];
      svg.append(api.svg('text', { x: tx.toFixed(1), y: (ty + 1).toFixed(1), 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: litColor || c.ink, style: { fontFamily: 'Georgia, serif', fontSize: '17px', fontWeight: '700' } }, label === 'CH3' ? ['CH', api.svg('tspan', { 'baseline-shift': 'sub', style: { fontSize: '12px' }, text: '3' })] : label));
    }
  }
  // the ring, front bonds heavier
  for (let j = 0; j < 6; j++){
    const a = F.ring[j], b = F.ring[(j + 1) % 6];
    svg.append(api.svg('line', { x1: X(a[0]).toFixed(1), y1: Y(a[1]).toFixed(1), x2: X(b[0]).toFixed(1), y2: Y(b[1]).toFixed(1), stroke: c.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  }
  if (opts.numbers){ const cxr = F.ring.reduce((p, q) => p + q[0], 0) / 6, cyr = F.ring.reduce((p, q) => p + q[1], 0) / 6; for (let j = 0; j < 6; j++){ const [x, y] = F.ring[j]; const dx = x - cxr, dy = y - cyr, L = Math.hypot(dx, dy) || 1; svg.append(api.svg('text', { x: (X(x) + dx / L * 15).toFixed(1), y: (Y(y) + dy / L * 15 + 4).toFixed(1), 'text-anchor': 'middle', fill: c.goldhi, style: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '12px', fontWeight: '600' }, text: String(j + 1) })); } }
  if (opts.mark){ const s = F.stubs.find(x => x.j === opts.mark.j && x.ud === opts.mark.ud); svg.append(api.svg('circle', { cx: X(s.x2).toFixed(1), cy: Y(s.y2).toFixed(1), r: 0.2 * PX, fill: 'rgba(201,168,76,.12)', stroke: c.gold, 'stroke-width': 2.5 })); }
  if (opts.tappable){ for (const s of F.stubs){ if (opts.picked && opts.picked.j === s.j && opts.picked.ud === s.ud) continue; svg.append(api.svg('circle', { cx: X(s.x2).toFixed(1), cy: Y(s.y2).toFixed(1), r: 0.19 * PX, fill: 'none', stroke: c.line, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' })); } }
  if (opts.picked){ const s = F.stubs.find(x => x.j === opts.picked.j && x.ud === opts.picked.ud); svg.append(api.svg('circle', { cx: X(s.x2).toFixed(1), cy: Y(s.y2).toFixed(1), r: 0.2 * PX, fill: opts.pickedOk ? 'rgba(87,180,135,.14)' : 'rgba(230,208,138,.1)', stroke: opts.pickedOk ? c.green : c.goldhi, 'stroke-width': 2.5 })); }
  const wrap = api.el('div', { class: P + '-flat', style: { aspectRatio: W.toFixed(1) + ' / ' + Hh.toFixed(1), maxWidth: (opts.maxWidth || 600) + 'px' } }, svg);
  return { wrap, svg, stubs: F.stubs, pct: s => ({ left: (X(s.x2) / W * 100).toFixed(2) + '%', top: (Y(s.y2) / Hh * 100).toFixed(2) + '%' }) };
}

export function mount(slots, api){
  const THREE = api.THREE;
  injectCSS();
  const c = api.colors;
  const S = makeStage(api);
  slots.visual.append(S.stage);
  const goldC = new THREE.Color(c.gold), blueC = new THREE.Color(c.blue), amberC = new THREE.Color(c.amber);

  // state
  let chairB = false, t = 0, showAx = false, showEq = false;
  let group = 'tBu', slot = { j: 0, ud: 'up' };   // the placed substituent; null slot = none
  let flipping = false;

  let ringMeshes = [], ringBonds = [], slots3 = [], hud = null, cap = null, subLabel = null, sail = null, sailMat = null;
  const hMats = [];
  if (S.ok){
    hud = api.el('div', { class: P + '-hud' }, api.el('b', { text: 'Cyclohexane chair' }), api.el('span', { text: 'Axial bonds stand straight up or down like fence posts. Equatorial bonds angle out around the belt line.' }));
    const help = api.el('div', { class: P + '-help', text: 'Drag to turn · tap a hydrogen to seat the group' });
    cap = api.el('div', { class: P + '-cap' });
    S.stage.append(hud, help, cap);
    const mol = new THREE.Group(); S.spin.add(mol);
    S.mol = mol;
    const bondMat = new THREE.MeshStandardMaterial({ color: 0xb9a878, roughness: 0.32, metalness: 0.7, envMapIntensity: 1.0 });
    const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 24, 1, true);
    const geo = { C: new THREE.SphereGeometry(RADIUS.C, 48, 32), H: new THREE.SphereGeometry(RADIUS.H, 40, 28) };
    const atomMat = el => new THREE.MeshPhysicalMaterial({ color: ELEMENT[el].color, roughness: ELEMENT[el].rough, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.22, envMapIntensity: 1.1 });
    const mesh = (g, m) => { const x = new THREE.Mesh(g, m); x.castShadow = true; x.receiveShadow = true; return x; };
    for (let j = 0; j < 6; j++){ const m = mesh(geo.C, atomMat('C')); mol.add(m); ringMeshes.push(m); const b = mesh(unitCyl, bondMat); mol.add(b); ringBonds.push(b); }
    // ring numbers
    ringMeshes.forEach((m, j) => { const lab = api.el('div', { class: P + '-lab ' + P + '-num', text: String(j + 1) }); S.addLabel(lab, out => { out.copy(m.position); mol.localToWorld(out); }, { dx: 0, dy: () => (m.position.y >= 0 ? -22 : 22), fade: true, clamp: false }); });
    // twelve slots: a group each, oriented by the live ring geometry
    for (let j = 0; j < 6; j++) for (const ud of ['up', 'down']){
      const g = new THREE.Group(); mol.add(g);
      const hm = atomMat('H'); hMats.push(hm);
      const h = mesh(geo.H, hm); h.position.set(0, 1.09 * SCALE, 0); h.userData = { j, ud, kind: 'H' }; g.add(h);
      const hb = mesh(unitCyl, bondMat); setBond(THREE, hb, new THREE.Vector3(0, 0, 0), h.position, 0.062); g.add(hb);
      // methyl
      const me = new THREE.Group(); me.visible = false; g.add(me);
      const meC = mesh(geo.C, atomMat('C')); meC.position.set(0, 1.54 * SCALE, 0); me.add(meC);
      const meB = mesh(unitCyl, bondMat); setBond(THREE, meB, new THREE.Vector3(0, 0, 0), meC.position, 0.088); me.add(meB);
      for (const d of tetraAround([0, -1, 0], [1, 0, 0], Math.PI / 3)){ const hp = V3(THREE, d).multiplyScalar(1.09 * SCALE).add(meC.position); const hh = mesh(geo.H, atomMat('H')); hh.position.copy(hp); me.add(hh); const bb = mesh(unitCyl, bondMat); setBond(THREE, bb, meC.position, hp, 0.062); me.add(bb); }
      // tert-butyl
      const tb = new THREE.Group(); tb.visible = false; g.add(tb);
      const tbC = mesh(geo.C, atomMat('C')); tbC.position.set(0, 1.54 * SCALE, 0); tb.add(tbC);
      const tbB = mesh(unitCyl, bondMat); setBond(THREE, tbB, new THREE.Vector3(0, 0, 0), tbC.position, 0.088); tb.add(tbB);
      for (const d of tetraAround([0, -1, 0], [1, 0, 0], Math.PI / 3)){
        const cp = V3(THREE, d).multiplyScalar(1.54 * SCALE).add(tbC.position);
        const cm = mesh(geo.C, atomMat('C')); cm.position.copy(cp); tb.add(cm);
        const cb = mesh(unitCyl, bondMat); setBond(THREE, cb, tbC.position, cp, 0.088); tb.add(cb);
        for (const hd of tetraAround(mul(d, -1), [0, -1, 0], Math.PI / 3)){ const hp = V3(THREE, hd).multiplyScalar(1.09 * SCALE).add(cp); const hh = mesh(geo.H, atomMat('H')); hh.position.copy(hp); tb.add(hh); const bb = mesh(unitCyl, bondMat); setBond(THREE, bb, cp, hp, 0.062); tb.add(bb); }
      }
      slots3.push({ j, ud, g, h, hb, me, tb, hm, tip: meC.position.clone() });
      S.tapTargets.push(h);
    }
    // the sail
    sailMat = new THREE.MeshPhysicalMaterial({ color: amberC, emissive: amberC, emissiveIntensity: 0.55, roughness: 0.4, transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false });
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3)); sg.setIndex([0, 1, 2]); sg.computeVertexNormals();
    sail = new THREE.Mesh(sg, sailMat); sail.visible = false; sail.renderOrder = 8; mol.add(sail);
    S.camera.position.set(0, 3.6, 8.9); S.camera.lookAt(0, 0.15, 0);
    S.spin.quaternion.setFromEuler(new THREE.Euler(0, -0.28, 0));
    S.floor.position.y = -2.2;
    S.onTap = m => { if (!m || m.userData.kind !== 'H' || flipping) return; if (!group) group = 'tBu'; place(m.userData.j, m.userData.ud); };
  }

  function pose(){
    if (!S.ok) return;
    const C = ringCarbons(t), D = slotDirs(C);
    ringMeshes.forEach((m, j) => m.position.set(C[j][0] * SCALE, C[j][1] * SCALE, C[j][2] * SCALE));
    ringBonds.forEach((b, j) => setBond(THREE, b, ringMeshes[j].position, ringMeshes[(j + 1) % 6].position, 0.088));
    for (const s of slots3){
      const d = D[s.j][s.ud];
      let x = sub(D[s.j].b1, mul(d, dot(D[s.j].b1, d))); x = unit(x); const z = unit(cross(x, d));
      const M = new THREE.Matrix4().makeBasis(V3(THREE, x), V3(THREE, d), V3(THREE, z));
      s.g.quaternion.setFromRotationMatrix(M); s.g.position.copy(ringMeshes[s.j].position);
    }
    if (sail && sail.visible && slot){
      const j = slot.j;
      const p0 = ringMeshes[j].position.clone(), d = V3(THREE, D[j][slot.ud]), out = V3(THREE, D[j].out);
      const p1 = p0.clone().add(d.clone().multiplyScalar(3.3 * SCALE)), p2 = p0.clone().add(d.clone().multiplyScalar(1.2 * SCALE)).add(out.multiplyScalar(2.0 * SCALE));
      const arr = sail.geometry.attributes.position.array; [p0, p1, p2].forEach((p, i) => { arr[i * 3] = p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = p.z; });
      sail.geometry.attributes.position.needsUpdate = true; sail.geometry.computeVertexNormals();
    }
    S.needs = true;
  }
  function paint(){
    if (!S.ok) return;
    for (const s of slots3){
      const ax = isAxial(s.j, s.ud, chairB);
      const lit = (ax && showAx) ? goldC : (!ax && showEq) ? blueC : null;
      s.hm.color.set(lit || ELEMENT.H.color); s.hm.emissive.set(lit || 0x000000); s.hm.emissiveIntensity = lit ? 0.55 : 0;
      const here = slot && slot.j === s.j && slot.ud === s.ud && group;
      s.h.visible = !here; s.hb.visible = !here; s.me.visible = !!here && group === 'Me'; s.tb.visible = !!here && group === 'tBu';
    }
    if (subLabel){ S.removeLabel(subLabel); subLabel = null; }
    if (slot && group){
      const st = stateOf(slot.j, slot.ud, chairB), s = slots3.find(q => q.j === slot.j && q.ud === slot.ud);
      const el = api.el('div', { class: P + '-lab' }, GROUPS[group].name, api.el('small', { text: 'C' + (slot.j + 1) + ' · ' + st.ud + ' · ' + st.ax }));
      subLabel = S.addLabel(el, out => { out.copy(s.tip); s.g.localToWorld(out); }, { radial: 46 });
      sail.visible = st.ax === 'axial';
      cap.replaceChildren(
        api.el('b', { text: GROUPS[group].name + ' on C' + (slot.j + 1) + ' · ' + st.ud + ' · ' + st.ax }),
        api.el('span', { class: 'kind', text: st.ax === 'axial' ? 'top-heavy' : 'comfy seat', style: { background: st.ax === 'axial' ? c.amber : c.green } }));
      hud.lastChild.textContent = st.ax === 'axial' ? 'Standing vertical, like a sail on a boat. Top-heavy. A ring flip would seat it.' : 'Angled out around the belt line. The comfy seat. This is where a big group wants to be.';
    } else {
      sail.visible = false;
      cap.replaceChildren(api.el('b', { text: 'Tap any hydrogen to put a group there.' }));
      hud.lastChild.textContent = 'Axial bonds stand straight up or down like fence posts. Equatorial bonds angle out around the belt line.';
    }
    pose();
    syncChips();
  }
  function place(j, ud){ slot = { j, ud }; paint(); }
  function flip(){
    if (!S.ok || flipping) return;
    flipping = true;
    const from = t, to = chairB ? 0 : 1;
    if (S.ok){ hud.lastChild.textContent = 'Through the twist boat and over to the other chair. Watch: up stays up, axial and equatorial trade places.'; }
    S.tween(1200, k => { t = from + (to - from) * k; pose(); }, () => { chairB = !chairB; t = to; flipping = false; paint(); });
  }

  // chips
  const chips = {};
  const chip = (text, key, on) => { const b = api.el('button', { type: 'button', class: 'chip', text, 'aria-pressed': 'false', onClick: on }); if (key) chips[key] = b; return b; };
  const rowA = api.el('div', { class: 'controls', style: { marginTop: '0' } },
    chip('Ring flip', 'flip', flip),
    chip('Show axial', 'ax', () => { showAx = !showAx; paint(); }),
    chip('Show equatorial', 'eq', () => { showEq = !showEq; paint(); }));
  const rowB = api.el('div', { class: 'controls', style: { marginTop: '0' } },
    api.el('span', { class: 'lbl', text: 'Group' }),
    chip('None', 'g-none', () => { group = null; paint(); }),
    chip('Methyl', 'g-Me', () => { group = 'Me'; if (!slot) slot = { j: 0, ud: 'up' }; paint(); }),
    chip('tert-Butyl', 'g-tBu', () => { group = 'tBu'; if (!slot) slot = { j: 0, ud: 'up' }; paint(); }),
    api.el('span', { class: 'lbl', text: 'on', style: { marginLeft: '8px' } }),
    ...[0, 1, 2, 3, 4, 5].map(j => chip('C' + (j + 1), 'j' + j, () => { if (!group) group = 'tBu'; place(j, slot ? slot.ud : 'up'); })),
    chip('up', 'up', () => { if (!group) group = 'tBu'; place(slot ? slot.j : 0, 'up'); }),
    chip('down', 'down', () => { if (!group) group = 'tBu'; place(slot ? slot.j : 0, 'down'); }));
  function syncChips(){
    chips.ax.setAttribute('aria-pressed', String(showAx)); chips.eq.setAttribute('aria-pressed', String(showEq));
    chips['g-none'].setAttribute('aria-pressed', String(!group)); chips['g-Me'].setAttribute('aria-pressed', String(group === 'Me')); chips['g-tBu'].setAttribute('aria-pressed', String(group === 'tBu'));
    for (let j = 0; j < 6; j++) chips['j' + j].setAttribute('aria-pressed', String(!!(group && slot && slot.j === j)));
    chips.up.setAttribute('aria-pressed', String(!!(group && slot && slot.ud === 'up'))); chips.down.setAttribute('aria-pressed', String(!!(group && slot && slot.ud === 'down')));
  }
  slots.visual.append(api.el('div', { class: P + '-rows' }, rowA, rowB));
  slots.visual.append(api.el('div', { class: P + '-legend' },
    api.el('span', {}, api.el('i', { style: { background: c.gold } }), 'axial, the fence posts'),
    api.el('span', {}, api.el('i', { style: { background: c.blue } }), 'equatorial, the comfy seats'),
    api.el('span', {}, api.el('i', { style: { background: c.amber } }), 'the sail: top-heavy'),
    api.el('span', {}, api.el('i', { style: { background: c.green } }), 'seated')));
  if (S.ok){ showAx = true; paint(); } else syncChips();

  /* ---------------- you try ---------------- */
  let n = 0;
  const host = slots.try;
  function next(){
    host.replaceChildren(); api.clearCoach();
    const kind = 'TFM'[n % 3]; n++;
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
    if (kind === 'T'){
      const holder = api.el('div', {});
      const render = state => {
        const subs = state.picked ? [{ j: state.picked.j, ud: state.picked.ud, g: 'tBu' }] : [];
        const flat = drawChair(api, item.chairB, { tappable: true, picked: state.picked, pickedOk: state.ok, subs, numbers: true, lit: state.picked ? { j: state.picked.j, ud: state.picked.ud, color: state.ok ? c.green : c.goldhi } : null });
        holder.replaceChildren(flat.wrap);
        for (const s of flat.stubs){
          const pos = flat.pct(s);
          const b = api.el('button', { type: 'button', class: P + '-hit' + (state.picked && state.picked.j === s.j && state.picked.ud === s.ud ? (state.ok ? ' ok' : ' picked') : ''), style: { left: pos.left, top: pos.top }, 'aria-label': 'C' + (s.j + 1) + ' ' + s.ud + ' position', onClick: () => {
            if (done) return;
            const ok = !s.axial;
            render({ picked: { j: s.j, ud: s.ud }, ok });
            finish(ok);
            if (!ok) api.coach('That one is axial, a fence post, straight ' + s.ud + '. The comfy seat is the equatorial bond: angled out from the ring, around the belt line.');
          } });
          if (done) b.disabled = true;
          flat.wrap.append(b);
        }
      };
      render({});
      box.append(api.el('p', { style: { color: c.ink2, fontSize: '14px', margin: '0 0 8px' }, text: 'Tap one of the twelve positions. Any comfy seat counts.' }), holder, verdict, actions);
    } else if (kind === 'F'){
      const flat = drawChair(api, item.chairB, { subs: [{ j: item.j, ud: item.ud, g: 'Me' }], mark: { j: item.j, ud: item.ud }, numbers: true, maxWidth: 440 });
      const opts = api.el('div', { class: 'opts' });
      const buttons = item.options.map((o, i) => api.el('button', { type: 'button', class: 'opt' }, api.el('span', { class: 'k', text: 'ABCD'[i] }), api.el('span', { text: o })));
      buttons.forEach((b, i) => b.addEventListener('click', () => {
        if (done) return;
        b.classList.add('picked');
        const ok = item.options[i] === item.answer;
        if (ok){ b.classList.add('ok'); for (const x of buttons) x.disabled = true; } else b.disabled = true;
        finish(ok);
        if (!ok) api.coach('Up stays up, down stays down. Axial and equatorial trade places. So ' + item.before.ax + ' ' + item.before.ud + ' becomes ' + item.answer + '.');
      }));
      buttons.forEach(b => opts.append(b));
      box.append(api.el('p', { style: { color: c.ink2, fontSize: '14px', margin: '0 0 8px' }, text: 'The marked methyl on C' + (item.j + 1) + ' is ' + item.before.ax + ' and ' + item.before.ud + ' right now.' }), flat.wrap, opts, verdict, actions);
    } else {
      const pair = api.el('div', { class: P + '-pair' },
        api.el('div', {}, api.el('p', { class: 'name', text: 'Chair A' }), api.el('div', { class: P + '-panel' }, drawChair(api, false, { subs: item.subs, px: 80, numbers: true }).wrap)),
        api.el('div', {}, api.el('p', { class: 'name', text: 'Chair B' }), api.el('div', { class: P + '-panel' }, drawChair(api, true, { subs: item.subs, px: 80, numbers: true }).wrap)));
      const opts = api.el('div', { class: 'opts' });
      const texts = { A: 'Chair A', B: 'Chair B', same: 'They are equal' };
      const buttons = item.options.map((o, i) => api.el('button', { type: 'button', class: 'opt' }, api.el('span', { class: 'k', text: 'ABC'[i] }), api.el('span', { text: texts[o] })));
      buttons.forEach((b, i) => b.addEventListener('click', () => {
        if (done) return;
        b.classList.add('picked');
        const ok = item.options[i] === item.answer;
        if (ok){ b.classList.add('ok'); for (const x of buttons) x.disabled = true; } else b.disabled = true;
        finish(ok);
        if (!ok){
          const axA = item.subs.filter(x => isAxial(x.j, x.ud, false)).map(x => GROUPS[x.g].name), axB = item.subs.filter(x => isAxial(x.j, x.ud, true)).map(x => GROUPS[x.g].name);
          api.coach('Count what is standing up. Chair A has ' + (axA.length ? axA.join(' and ') + ' axial' : 'nothing axial') + '. Chair B has ' + (axB.length ? axB.join(' and ') + ' axial' : 'nothing axial') + '. Less weight standing up wins, and tert-butyl weighs the most.');
        }
      }));
      buttons.forEach(b => opts.append(b));
      box.append(api.el('p', { style: { color: c.ink2, fontSize: '14px', margin: '0 0 8px' }, text: 'Same molecule, the two chairs it flips between. tBu is tert-butyl.' }), pair, opts, verdict, actions);
    }
    host.append(box);
  }
  next();
}
