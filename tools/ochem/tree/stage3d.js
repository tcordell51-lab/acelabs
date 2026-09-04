// stage3d.js - the shared three-dimensional stage for the tree.
//
// Some mechanism questions are geometry questions wearing a chemistry costume,
// and a flat drawing quietly lies about them: SN2 inverts a center and you
// cannot see the umbrella turn inside out, E2 needs the hydrogen and the
// leaving group anti-periplanar and a flat page cannot show which rotamer
// reacts, and bromine bridges an alkene so the nucleophile has to arrive from
// the far face. Those get a real model.
//
// The renderer, lighting and materials match the roots page and the Chirality
// Bench, so a molecule looks the same wherever a student meets it.

const ATOM = {
  C:  { color: 0x2b2926, r: 0.34, rough: 0.32 },
  H:  { color: 0xf4f1e9, r: 0.20, rough: 0.42 },
  O:  { color: 0xc42f1d, r: 0.32, rough: 0.28 },
  N:  { color: 0x2c5ad4, r: 0.33, rough: 0.28 },
  Br: { color: 0x8c2810, r: 0.50, rough: 0.28 },
  Cl: { color: 0x3fb257, r: 0.44, rough: 0.28 }
};
export const ATOM_COLORS = ATOM;

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
const easeInOut = k => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

/**
 * makeStage(api, opts) -> S
 * opts: { label } for the canvas aria-label.
 * S carries: stage (the element), ok, scene, camera, spin, sway, tween, addLabel,
 * removeLabel, project, atom, bond, group, clear, needs, swayAmp, focus.
 */
export function makeStage(api, opts = {}){
  const THREE = api.THREE;
  const stage = api.el('div', { class: 's3d-stage' });
  let renderer = null;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); } catch (e){ renderer = null; }
  if (!renderer){
    stage.append(api.el('div', { class: 's3d-fallback', text: 'This model needs WebGL, which this browser has turned off. The drawing and the move above still stand.' }));
    return { stage, ok: false, tween(){}, addLabel(){ return {}; }, removeLabel(){}, atom(){ return null; }, bond(){ return null; }, clear(){}, focus(){} };
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x0e0c08, 1);
  const canvas = renderer.domElement;
  Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block' });
  canvas.setAttribute('aria-label', opts.label || 'A molecule in three dimensions. Drag to turn it.');
  stage.append(canvas);
  const labels = api.el('div', { class: 's3d-labels' }); stage.append(labels);

  const scene = new THREE.Scene();
  const env = studioEnvironment(THREE, renderer);
  scene.environment = env; scene.background = env; scene.backgroundBlurriness = 1; scene.backgroundIntensity = 0.12;
  const camera = new THREE.PerspectiveCamera(34, 1.6, 0.1, 60);
  camera.position.set(0, 0.2, 8.4); camera.lookAt(0, 0, 0);
  const key = new THREE.DirectionalLight(0xfff1d8, 2.4); key.position.set(2.6, 4.2, 5.5); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 22 });
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xcfdcff, 0.55); fill.position.set(-4, 1, 3); scene.add(fill);
  scene.add(new THREE.HemisphereLight(0x9a917f, 0x14120e, 0.35));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.4 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -2.6; floor.receiveShadow = true; scene.add(floor);
  const sway = new THREE.Group(), spin = new THREE.Group(); sway.add(spin); scene.add(sway);

  const bondGeo = new THREE.CylinderGeometry(1, 1, 1, 20, 1, true);
  const bondMat = new THREE.MeshStandardMaterial({ color: 0xb9a878, roughness: 0.32, metalness: 0.7, envMapIntensity: 1 });

  const S = { stage, ok: true, renderer, scene, camera, spin, sway, labels, tweens: [], labelNodes: [], visible: true, dragging: false, needs: true, swayAmp: 1, t0: performance.now(), THREE };

  S.resize = () => { const w = stage.clientWidth || 900, h = stage.clientHeight || Math.round(w / 1.6); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); S.needs = true; };
  S.tween = (ms, fn, done) => { if (api.reduced || ms <= 0){ fn(1); done && done(); S.needs = true; return; } S.tweens.push({ t0: performance.now(), ms, fn, done }); };
  S.project = v => { const p = v.clone().project(camera); return { x: (p.x + 1) / 2 * (stage.clientWidth || 900), y: (1 - p.y) / 2 * (stage.clientHeight || 560), z: p.z }; };
  S.addLabel = (el, at, o = {}) => { labels.append(el); const n = { el, at, opts: o }; S.labelNodes.push(n); S.needs = true; return n; };
  S.removeLabel = n => { const i = S.labelNodes.indexOf(n); if (i >= 0) S.labelNodes.splice(i, 1); if (n.el) n.el.remove(); };
  S.clearLabels = () => { while (S.labelNodes.length) S.removeLabel(S.labelNodes[0]); };

  /** A ball. `to` is a THREE.Vector3 or [x,y,z]. */
  S.atom = (el, to, parent) => {
    const a = ATOM[el] || ATOM.C;
    const m = new THREE.Mesh(new THREE.SphereGeometry(a.r, 40, 28), new THREE.MeshPhysicalMaterial({ color: a.color, roughness: a.rough, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.22, envMapIntensity: 1.1 }));
    m.castShadow = true; m.receiveShadow = true;
    m.position.copy(to.isVector3 ? to : new THREE.Vector3(to[0], to[1], to[2]));
    m.userData.el = el;
    (parent || spin).add(m); S.needs = true; return m;
  };
  /** A stick between two points (Vector3 or arrays). */
  S.bond = (a, b, radius, parent, mat) => {
    const A = a.isVector3 ? a : new THREE.Vector3(a[0], a[1], a[2]);
    const B = b.isVector3 ? b : new THREE.Vector3(b[0], b[1], b[2]);
    const m = new THREE.Mesh(bondGeo, mat || bondMat);
    m.castShadow = true; m.receiveShadow = true;
    S.place(m, A, B, radius == null ? 0.085 : radius);
    (parent || spin).add(m); S.needs = true; return m;
  };
  S.place = (mesh, a, b, radius) => {
    const A = a.isVector3 ? a : new THREE.Vector3(a[0], a[1], a[2]);
    const B = b.isVector3 ? b : new THREE.Vector3(b[0], b[1], b[2]);
    const d = B.clone().sub(A), L = d.length();
    mesh.position.copy(A).add(B).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    mesh.scale.set(radius, Math.max(L, 0.001), radius);
    S.needs = true;
  };
  /** A dashed guide line, for a bond that is forming or breaking. */
  S.ghostBond = (a, b, color, parent) => {
    const A = a.isVector3 ? a : new THREE.Vector3(a[0], a[1], a[2]);
    const B = b.isVector3 ? b : new THREE.Vector3(b[0], b[1], b[2]);
    const g = new THREE.Group(); const n = 7, dir = B.clone().sub(A);
    for (let i = 0; i < n; i++){
      if (i % 2) continue;
      const p = A.clone().add(dir.clone().multiplyScalar(i / n)), q = A.clone().add(dir.clone().multiplyScalar((i + 1) / n));
      const seg = new THREE.Mesh(bondGeo, new THREE.MeshBasicMaterial({ color: color || 0xe6d08a, transparent: true, opacity: 0.85, toneMapped: false }));
      S.place(seg, p, q, 0.05); g.add(seg);
    }
    (parent || spin).add(g); S.needs = true; return g;
  };
  S.group = parent => { const g = new THREE.Group(); (parent || spin).add(g); return g; };
  S.clear = g => { const target = g || spin; while (target.children.length){ const c = target.children.pop(); c.traverse && c.traverse(o => { if (o.geometry && o.geometry !== bondGeo) o.geometry.dispose(); }); } S.needs = true; };
  /** Turn the model so `dir` points at the camera (or away, with `away`). */
  S.focus = (dir, away, ms) => {
    const from = spin.quaternion.clone();
    const target = new THREE.Quaternion().setFromUnitVectors(dir.clone().normalize(), new THREE.Vector3(0, 0, away ? -1 : 1));
    S.tween(ms == null ? 900 : ms, k => { spin.quaternion.slerpQuaternions(from, target, k); S.needs = true; });
  };
  S.reset = ms => { const from = spin.quaternion.clone(), to = new THREE.Quaternion(); S.tween(ms == null ? 700 : ms, k => { spin.quaternion.slerpQuaternions(from, to, k); S.needs = true; }); };

  let drag = null;
  canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; S.dragging = true; stage.classList.add('drag'); try { canvas.setPointerCapture(e.pointerId); } catch (err) {} });
  const end = () => { drag = null; S.dragging = false; stage.classList.remove('drag'); };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx * 0.008);
    const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy * 0.008);
    spin.quaternion.premultiply(qy).premultiply(qx); drag = { x: e.clientX, y: e.clientY }; S.needs = true;
  });
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => S.resize()).observe(stage); else window.addEventListener('resize', () => S.resize());
  if (typeof IntersectionObserver !== 'undefined') new IntersectionObserver(es => { for (const x of es){ S.visible = x.isIntersecting; if (S.visible) S.needs = true; } }, { threshold: 0 }).observe(stage);

  const placeLabels = () => {
    if (!S.labelNodes.length) return;
    const camDir = new THREE.Vector3(); camera.getWorldDirection(camDir);
    const center = new THREE.Vector3(); spin.getWorldPosition(center);
    const tmp = new THREE.Vector3(), hh = stage.clientHeight || 560;
    for (const n of S.labelNodes){
      n.at(tmp); const s = S.project(tmp);
      const depth = tmp.clone().sub(center).dot(camDir);
      let x = s.x + (n.opts.dx || 0), y = s.y + (n.opts.dy || 0);
      if (n.opts.radial){ const cs = S.project(center); let dx = s.x - cs.x, dy = s.y - cs.y, L = Math.hypot(dx, dy); if (L < 10){ dx = 0; dy = -1; L = 1; } x = s.x + dx / L * n.opts.radial; y = s.y + dy / L * n.opts.radial; }
      y = Math.min(Math.max(y, 18), hh - 24);
      n.el.style.transform = 'translate(-50%,-50%) translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      n.el.style.opacity = n.opts.fade === false ? '1' : (depth > 0.8 ? '0.55' : '1');
      n.el.style.zIndex = depth > 0 ? '1' : '3';
    }
  };
  const tick = () => {
    if (S.visible){
      const now = performance.now();
      for (const t of S.tweens.slice()){ const k = Math.min(1, (now - t.t0) / t.ms); t.fn(easeInOut(k)); if (k >= 1){ S.tweens.splice(S.tweens.indexOf(t), 1); t.done && t.done(); } S.needs = true; }
      if (!api.reduced && !S.dragging && S.swayAmp > 0){ const s = (now - S.t0) / 1000; sway.rotation.y = Math.sin(s * 0.5) * 0.07 * S.swayAmp; sway.rotation.x = Math.sin(s * 0.33) * 0.03 * S.swayAmp; S.needs = true; }
      if (S.needs){ renderer.render(scene, camera); placeLabels(); S.needs = false; }
    }
    requestAnimationFrame(tick);
  };
  S.resize(); requestAnimationFrame(tick);
  return S;
}

export const STAGE_CSS = `
/* The pairing: what the test prints, beside what it actually is. A student has
   to be able to look from one to the other without translating. */
.s3d-pair{display:grid;grid-template-columns:minmax(0,0.8fr) minmax(0,1.2fr);gap:14px;align-items:start}
.s3d-paper{background:linear-gradient(180deg,#f3ecda,#e6ddc6);border:1px solid rgba(201,168,76,.35);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:8px;box-shadow:0 20px 40px -28px rgba(0,0,0,.9)}
.s3d-paper .head{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#7a6a48}
.s3d-paper .row{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;flex:1}
.s3d-paper .mol path,.s3d-paper .mol line,.s3d-paper .mol polygon{stroke:#1c1913}
.s3d-paper .arrow{display:flex;flex-direction:column;align-items:center;gap:2px;min-width:74px}
.s3d-paper .arrow .reagent{font-family:var(--mono);font-size:11px;color:#3d3527;text-align:center}
.s3d-paper .arrow .line{width:64px;height:2px;background:#3d3527;position:relative}
.s3d-paper .arrow .line::after{content:'';position:absolute;right:-1px;top:-5px;border:6px solid transparent;border-left:9px solid #3d3527}
.s3d-paper .cap{font-family:Georgia,serif;font-size:13px;color:#4a4132;text-align:center;line-height:1.35}
.s3d-paper .cap b{color:#1c1913;font-weight:600}
@media (max-width:760px){.s3d-pair{grid-template-columns:1fr}}

.s3d-stage{position:relative;width:100%;aspect-ratio:16/10;background:#0e0c08;border:1px solid var(--line);border-radius:12px;overflow:hidden;box-shadow:0 30px 60px -30px rgba(0,0,0,.8),inset 0 0 0 1px rgba(255,255,255,.02);cursor:grab}
.s3d-stage.drag{cursor:grabbing}
.s3d-fallback{position:absolute;inset:0;display:grid;place-items:center;color:var(--ink2);padding:24px;text-align:center}
.s3d-labels{position:absolute;inset:0;pointer-events:none}
.s3d-lab{position:absolute;left:0;top:0;font-family:var(--serif);font-weight:600;font-size:18px;color:#f4efe2;background:rgba(18,16,11,.78);padding:4px 8px 5px;border-radius:7px;white-space:nowrap;transition:opacity .25s;box-shadow:0 1px 6px rgba(0,0,0,.5)}
.s3d-lab sub{font-size:.62em;vertical-align:-.25em}
.s3d-lab.gold{color:var(--goldhi);box-shadow:0 0 0 1px rgba(230,208,138,.6),0 1px 6px rgba(0,0,0,.5)}
.s3d-lab.blue{color:#8fb4ff}
.s3d-lab.small{font-family:var(--mono);font-size:11px;letter-spacing:.06em;font-weight:400}
.s3d-cap{position:absolute;left:12px;bottom:12px;right:12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;pointer-events:none}
.s3d-cap b{font-family:var(--serif);font-weight:400;font-size:19px;color:#f4efe2;background:rgba(18,16,11,.84);padding:6px 12px;border-radius:9px}
.s3d-cap .tag{font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;padding:6px 10px;border-radius:9px;color:#1a160c;background:linear-gradient(180deg,var(--goldhi),var(--gold))}
.s3d-hint{position:absolute;right:12px;top:12px;font-family:var(--mono);font-size:10px;letter-spacing:.1em;color:var(--ink3);background:rgba(18,16,11,.7);padding:5px 9px;border-radius:8px;pointer-events:none}
@media (max-width:640px){
  .s3d-stage{aspect-ratio:4/3}
  .s3d-cap b{font-size:14px;padding:4px 9px}
  .s3d-cap .tag{font-size:9px;padding:4px 7px}
  .s3d-lab{font-size:14px}
  .s3d-hint{font-size:9px}
}
`;

/* ------------------------------------------------------------------ */
/* Geometry helpers, shared by the mechanism models                     */
/* ------------------------------------------------------------------ */
export const TET = 109.47 * Math.PI / 180;
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const vlen = a => Math.sqrt(dot(a, a));
export const unit = a => { const l = vlen(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

/** Three directions at the tetrahedral angle from `back`, phased around it. */
export function tetraAround(back, phase){
  const a = unit(back);
  let u = Math.abs(a[1]) < 0.9 ? cross(a, [0, 1, 0]) : cross(a, [1, 0, 0]);
  u = unit(u); const v = unit(cross(a, u));
  const tilt = Math.PI - TET;
  return [0, 1, 2].map(k => {
    const p = (phase || 0) + k * 2 * Math.PI / 3;
    return unit(add(mul(a, -Math.cos(tilt)), add(mul(u, Math.sin(tilt) * Math.cos(p)), mul(v, Math.sin(tilt) * Math.sin(p)))));
  });
}
export { add as vadd, mul as vmul, dot as vdot, cross as vcross, vlen };
