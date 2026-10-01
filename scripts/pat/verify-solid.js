/*
  verify-solid.js : INDEPENDENT checks for the machined-part PAT items (engine v2).

  Nothing here calls engine code. The verifier has its own:
  - solid kernel: a ray's inside intervals are found by collecting EVERY surface
    crossing of every primitive along the ray, sorting them, and testing the
    whole CSG tree at each midpoint (the engine instead clips primitives
    analytically and combines intervals with set arithmetic);
  - raster line map (a line lies between two neighbouring rays whose ordered
    surface layers differ; visible when the first surface differs);
  - rasterizer for the engine's vector drawings (segment-pair crossing tests);
  - builder for the TFE machined family, written from the family's documented
    parameter table, and an exhaustive search of that family.
*/
'use strict';

const BIGT = 1e6;
const d3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const rr6 = (x) => { const v = Math.round(x * 1e6) / 1e6; return v === 0 ? 0 : v; };

/* ---------------- primitives as implicit tests + crossing finders ---------------- */
function pInside(p, q) {
  switch (p.t) {
    case 'box': return q.every((v, k) => v >= p.lo[k] && v <= p.hi[k]);
    case 'hs': return q.every((v, k) => v >= p.lo[k] && v <= p.hi[k]) && p.planes.every((P) => P[0] * q[0] + P[1] * q[1] + P[2] * q[2] <= P[3]);
    default: {
      const s = q[p.ax];
      if (s < p.s0 || s > p.s1) return false;
      const a = q[(p.ax + 1) % 3] - p.c[0], b = q[(p.ax + 2) % 3] - p.c[1];
      const r = p.t === 'cyl' ? p.r : p.r0 + (p.r1 - p.r0) * (s - p.s0) / (p.s1 - p.s0);
      return a * a + b * b <= r * r;
    }
  }
}
function csgInside(n, q) {
  if (n.t) return pInside(n, q);
  if (n.op === 'u') return n.a.some((k) => csgInside(k, q));
  if (n.op === 'i') return n.a.every((k) => csgInside(k, q));
  return csgInside(n.a[0], q) && !n.a.slice(1).some((k) => csgInside(k, q));
}
function vPlaneKey(n, d) {
  const L = Math.hypot(n[0], n[1], n[2]);
  let a = n.map((x) => x / L), dd = d / L;
  const f = a.find((x) => Math.abs(x) > 1e-9);
  if (f < 0) { a = a.map((x) => -x); dd = -dd; }
  return 'P' + a.map(rr6).join(',') + ',' + rr6(dd);
}
/* all candidate crossings [t, surfaceKey] of one primitive's surfaces with the line o + t dir */
function crossings(p, o, dir, out) {
  const planes = [];
  if (p.t === 'box' || p.t === 'hs') {
    for (let k = 0; k < 3; k++) { const n = [0, 0, 0]; n[k] = 1; planes.push([n, p.lo[k]], [n, p.hi[k]]); }
    if (p.t === 'hs') p.planes.forEach((P) => planes.push([[P[0], P[1], P[2]], P[3]]));
  } else {
    const n = [0, 0, 0]; n[p.ax] = 1; planes.push([n, p.s0], [n, p.s1]);
    const i = (p.ax + 1) % 3, j = (p.ax + 2) % 3, qu = o[i] - p.c[0], qv = o[j] - p.c[1];
    let A, B, Cc, key;
    if (p.t === 'cyl') { A = dir[i] ** 2 + dir[j] ** 2; B = 2 * (qu * dir[i] + qv * dir[j]); Cc = qu * qu + qv * qv - p.r * p.r; key = 'C' + p.ax + ',' + rr6(p.c[0]) + ',' + rr6(p.c[1]) + ',' + rr6(p.r); }
    else {
      const k = (p.r1 - p.r0) / (p.s1 - p.s0), e = p.r0 + k * (o[p.ax] - p.s0), g = k * dir[p.ax];
      A = dir[i] ** 2 + dir[j] ** 2 - g * g; B = 2 * (qu * dir[i] + qv * dir[j] - e * g); Cc = qu * qu + qv * qv - e * e;
      key = 'K' + p.ax + ',' + [p.c[0], p.c[1], p.r0, p.r1, p.s0, p.s1].map(rr6).join(',');
    }
    const nrm = (t) => {
      const q = [o[0] + dir[0] * t, o[1] + dir[1] * t, o[2] + dir[2] * t], n = [0, 0, 0];
      n[i] = q[i] - p.c[0]; n[j] = q[j] - p.c[1];
      if (p.t === 'cone') n[p.ax] = -(p.r1 - p.r0) / (p.s1 - p.s0) * Math.hypot(n[i], n[j]);
      const L = Math.hypot(n[0], n[1], n[2]) || 1; return n.map((x) => x / L);
    };
    if (Math.abs(A) < 1e-14) { if (Math.abs(B) > 1e-14) out.push([-Cc / B, key, nrm(-Cc / B)]); }
    else { const D = B * B - 4 * A * Cc; if (D >= 0) { const s = Math.sqrt(D); [(-B - s) / (2 * A), (-B + s) / (2 * A)].forEach((t) => out.push([t, key, nrm(t)])); } }
  }
  planes.forEach(([n, d]) => { const nd = d3(n, dir); if (Math.abs(nd) > 1e-13) { const L = Math.hypot(n[0], n[1], n[2]); out.push([(d - d3(n, o)) / nd, vPlaneKey(n, d), n.map((x) => x / L)]); } });
}
function primsOf(n, out = []) { if (n.t) out.push(n); else n.a.forEach((k) => primsOf(k, out)); return out; }
/* ordered surface layers along the ray, from the viewer (high t) inward */
function vLayers(node, prims, o, dir, full) {
  const cs = [];
  prims.forEach((p) => crossings(p, o, dir, cs));
  cs.sort((a, b) => a[0] - b[0] || (a[1] < b[1] ? -1 : 1));
  const ts = [];
  cs.forEach((c) => { const L = ts[ts.length - 1]; if (L && c[0] - L[0] < 1e-9) { if (c[1] < L[1]) { L[1] = c[1]; L[2] = c[2]; } } else ts.push(c.slice()); });
  const at = (t) => [o[0] + dir[0] * t, o[1] + dir[1] * t, o[2] + dir[2] * t];
  const state = [];
  for (let k = 0; k <= ts.length; k++) {
    const t = k === 0 ? ts.length ? ts[0][0] - 1 : 0 : k === ts.length ? ts[k - 1][0] + 1 : (ts[k - 1][0] + ts[k][0]) / 2;
    state.push(csgInside(node, at(t)));
  }
  const keys = [];
  for (let k = ts.length - 1; k >= 0; k--) if (state[k] !== state[k + 1]) keys.push(full ? ts[k] : ts[k][1]);
  return keys;
}

/* ---------------- views and line maps ---------------- */
const VVIEW = {
  front: { u: [1, 0, 0], v: [0, 0, 1], d: [0, -1, 0] },
  top: { u: [1, 0, 0], v: [0, 1, 0], d: [0, 0, 1] },
  end: { u: [0, 1, 0], v: [0, 0, 1], d: [1, 0, 0] }
};
const GOFF = 0.0137;
function vGrid(win, R) {
  const nu = Math.round((win[2] - win[0]) * R), nv = Math.round((win[3] - win[1]) * R);
  return { nu, nv, R, win, u: (i) => win[0] + (i + 0.5 + GOFF) / R, v: (j) => win[1] + (j + 0.5 + GOFF * 1.7) / R };
}
function vLineMap(node, view, win, R) {
  const V = VVIEW[view], G = vGrid(win, R), prims = primsOf(node), sig = [];
  for (let i = 0; i < G.nu; i++) for (let j = 0; j < G.nv; j++) {
    const u = G.u(i), v = G.v(j);
    const o = [V.u[0] * u + V.v[0] * v, V.u[1] * u + V.v[1] * v, V.u[2] * u + V.v[2] * v];
    sig.push(vLayers(node, prims, o, V.d));
  }
  const cmp = (a, b) => { for (let k = 0; k < Math.max(a.length, b.length); k++) if (a[k] !== b[k]) return k === 0 ? 1 : 2; return 0; };
  const H = new Uint8Array((G.nu - 1) * G.nv), Vv = new Uint8Array(G.nu * (G.nv - 1));
  for (let i = 0; i + 1 < G.nu; i++) for (let j = 0; j < G.nv; j++) H[i * G.nv + j] = cmp(sig[i * G.nv + j], sig[(i + 1) * G.nv + j]);
  for (let i = 0; i < G.nu; i++) for (let j = 0; j + 1 < G.nv; j++) Vv[i * (G.nv - 1) + j] = cmp(sig[i * G.nv + j], sig[i * G.nv + j + 1]);
  return { G, H, V: Vv };
}
/* does the drawing primitive cross the segment P-Q an odd number of times? */
function segCrossCount(pr, P, Q) {
  if (pr.k === 'L' || pr.k === 'P') {
    const pts = pr.k === 'L' ? [pr.a, pr.b] : pr.pts;
    let n = 0;
    for (let k = 0; k + 1 < pts.length; k++) {
      const A = pts[k], B = pts[k + 1];
      const o1 = (B[0] - A[0]) * (P[1] - A[1]) - (B[1] - A[1]) * (P[0] - A[0]);
      const o2 = (B[0] - A[0]) * (Q[1] - A[1]) - (B[1] - A[1]) * (Q[0] - A[0]);
      const o3 = (Q[0] - P[0]) * (A[1] - P[1]) - (Q[1] - P[1]) * (A[0] - P[0]);
      const o4 = (Q[0] - P[0]) * (B[1] - P[1]) - (Q[1] - P[1]) * (B[0] - P[0]);
      if (o1 * o2 < 0 && o3 * o4 < 0) n++;
    }
    return n;
  }
  // arc: points P + s (Q - P) on the circle, s in (0,1), angle inside [a0, a1]
  const dx = Q[0] - P[0], dy = Q[1] - P[1], fx = P[0] - pr.c[0], fy = P[1] - pr.c[1];
  const A = dx * dx + dy * dy, B = 2 * (fx * dx + fy * dy), Cc = fx * fx + fy * fy - pr.r * pr.r, D = B * B - 4 * A * Cc;
  if (D < 0) return 0;
  let n = 0;
  for (const s of [(-B - Math.sqrt(D)) / (2 * A), (-B + Math.sqrt(D)) / (2 * A)]) {
    if (s <= 0 || s >= 1) continue;
    let ang = Math.atan2(fy + dy * s, fx + dx * s);
    while (ang < pr.a0) ang += 2 * Math.PI;
    while (ang >= pr.a0 + 2 * Math.PI) ang -= 2 * Math.PI;
    if (ang <= pr.a1) n++;
  }
  return n;
}
function vVectorMap(prims, G) {
  const H = new Uint8Array((G.nu - 1) * G.nv), Vv = new Uint8Array(G.nu * (G.nv - 1));
  const mark = (arr, k, P, Q) => {
    let st = 0;
    for (const pr of prims) {
      // quick reject on bounding box
      if (pr._bb === undefined) {
        const pts = pr.k === 'L' ? [pr.a, pr.b] : pr.k === 'P' ? pr.pts : [[pr.c[0] - pr.r, pr.c[1] - pr.r], [pr.c[0] + pr.r, pr.c[1] + pr.r]];
        Object.defineProperty(pr, '_bb', { value: [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))], enumerable: false });
      }
      const b = pr._bb;
      if (Math.max(P[0], Q[0]) < b[0] || Math.min(P[0], Q[0]) > b[2] || Math.max(P[1], Q[1]) < b[1] || Math.min(P[1], Q[1]) > b[3]) continue;
      if (segCrossCount(pr, P, Q) % 2 === 1) { if (!pr.dash) { st = 1; break; } st = 2; }
    }
    arr[k] = st;
  };
  for (let i = 0; i + 1 < G.nu; i++) for (let j = 0; j < G.nv; j++) mark(H, i * G.nv + j, [G.u(i), G.v(j)], [G.u(i + 1), G.v(j)]);
  for (let i = 0; i < G.nu; i++) for (let j = 0; j + 1 < G.nv; j++) mark(Vv, i * (G.nv - 1) + j, [G.u(i), G.v(j)], [G.u(i), G.v(j + 1)]);
  return { G, H, V: Vv };
}
function vEnds(prims) {
  const out = [];
  prims.forEach((p) => {
    if (p.k === 'L') out.push(p.a, p.b);
    else if (p.k === 'P') out.push(p.pts[0], p.pts[p.pts.length - 1]);
    else if (p.a1 - p.a0 < 2 * Math.PI - 1e-6) [p.a0, p.a1].forEach((a) => out.push([p.c[0] + p.r * Math.cos(a), p.c[1] + p.r * Math.sin(a)]));
  });
  return out;
}
/* differing pairs, ignoring those within rho of a junction */
function vDiff(A, B, junc, rho = 0.08) {
  const G = A.G; let n = 0;
  const near = (u, v) => junc.some((p) => (p[0] - u) ** 2 + (p[1] - v) ** 2 < rho * rho);
  for (let k = 0; k < A.H.length; k++) if (A.H[k] !== B.H[k]) { const i = Math.floor(k / G.nv), j = k % G.nv; if (!near((G.u(i) + G.u(i + 1)) / 2, G.v(j))) n++; }
  for (let k = 0; k < A.V.length; k++) if (A.V[k] !== B.V[k]) { const i = Math.floor(k / (G.nv - 1)), j = k % (G.nv - 1); if (!near(G.u(i), (G.v(j) + G.v(j + 1)) / 2)) n++; }
  return n;
}
const vKey = (M) => Buffer.from(M.H).toString('base64') + '|' + Buffer.from(M.V).toString('base64');

/* ---------------- the TFE machined family, from its parameter table ----------------
   Block W x D x H = 5 x 4 x 3; y = 0 is the front, z up.
   Edge treatments of the front (y = 0) and back (y = 4) top edges, 1 unit deep:
     chamfer = 45-degree face, step = 1 x 1 rebate, cove = concave quarter circle of radius 1
     centred on the edge.
   Top feature at (x, 2), x in {1.5, 3.5}; boss height 1:
     cyl r .75 | cylhole = cyl + through hole r .4 | frustum r .8 -> .45 | frustumhole = frustum +
     through hole r .3 | cone r .8 | hole r .5 through | cbore = r .7 one deep from the top + r .35
     through | cboreb = r .7 one deep from the bottom + r .35 through | sqhole 1 x 1 through |
     sqboss 1.2 x 1.2.
   Side feature: yhole (front to back, r .5, centre z 1, x in {1.5, 3.5}) | xhole (end to end,
     r .5, y 2, z 1) | uslotR / uslotL (vertical half round r .6 in the x = 5 / x = 0 end, y 2) |
     channel (bottom groove x 2.3 to 2.7, 1 high, front to back).
   Excluded: yhole under a through feature at the same x; xhole with any through feature.
   rot 1 = quarter turn about z: (x, y, z) -> (y, 5 - x, z).                                   */
const FW = 5, FD = 4, FH = 3;
const FTHRU = new Set(['cylhole', 'frustumhole', 'hole', 'cbore', 'cboreb', 'sqhole']);
function famMembers() {
  const out = [], E = ['none', 'chamfer', 'step', 'cove'];
  const tops = [{ k: 'none', x: 0 }];
  for (const k of ['cyl', 'cylhole', 'frustum', 'frustumhole', 'cone', 'hole', 'cbore', 'cboreb', 'sqhole', 'sqboss']) for (const x of [1.5, 3.5]) tops.push({ k, x });
  const sides = [{ k: 'none', x: 0 }, { k: 'yhole', x: 1.5 }, { k: 'yhole', x: 3.5 }, { k: 'xhole', x: 0 }, { k: 'uslotR', x: 0 }, { k: 'uslotL', x: 0 }, { k: 'channel', x: 0 }];
  for (const ef of E) for (const eb of E) for (const top of tops) for (const side of sides) {
    if (side.k === 'yhole' && FTHRU.has(top.k) && side.x === top.x) continue;
    if (side.k === 'xhole' && FTHRU.has(top.k)) continue;
    out.push({ ef, eb, top, side });
  }
  return out;
}
function famSolid(p, rot) {
  // built directly in the rotated frame: X(x, y) gives world coordinates
  const turn = rot === 1;
  const box = (x0, y0, z0, x1, y1, z1) => {
    if (!turn) return { t: 'box', lo: [x0, y0, z0], hi: [x1, y1, z1] };
    return { t: 'box', lo: [y0, FW - x1, z0], hi: [y1, FW - x0, z1] };
  };
  const vc = (x, y, r, s0, s1) => turn ? { t: 'cyl', ax: 2, c: [y, FW - x], r, s0, s1 } : { t: 'cyl', ax: 2, c: [x, y], r, s0, s1 };
  const vk = (x, y, r0, r1) => ({ t: 'cone', ax: 2, c: turn ? [y, FW - x] : [x, y], r0, r1, s0: FH, s1: FH + 1 });
  // a cylinder along the original x axis (from x = -0.5 to W + 0.5) at (y, z)
  const xc = (y, z, r) => turn ? { t: 'cyl', ax: 1, c: [z, y], r, s0: -0.5, s1: FW + 0.5 } : { t: 'cyl', ax: 0, c: [y, z], r, s0: -0.5, s1: FW + 0.5 };
  // along the original y axis at (x, z)
  const yc = (x, z, r) => turn ? { t: 'cyl', ax: 0, c: [FW - x, z], r, s0: -0.5, s1: FD + 0.5 } : { t: 'cyl', ax: 1, c: [z, x], r, s0: -0.5, s1: FD + 0.5 };
  // chamfer: original plane y - z <= 1 - H (front) or -y - z <= -(D + H - 1) (back); turned, y_orig = X_world
  const ch = (back) => {
    const b = back ? box(-0.5, FD - 1, FH - 1, FW + 0.5, FD, FH) : box(-0.5, 0, FH - 1, FW + 0.5, 1, FH);
    const n = back ? [0, -1, -1] : [0, 1, -1], d = back ? -(FD + FH - 1) : 1 - FH;
    const nw = turn ? [n[1], -n[0], n[2]] : n;
    return Object.assign(b, { t: 'hs', planes: [[nw[0], nw[1], nw[2], d]] });
  };
  const adds = [box(0, 0, 0, FW, FD, FH)], subs = [];
  [['ef', false], ['eb', true]].forEach(([f, back]) => {
    const k = p[f];
    if (k === 'chamfer') subs.push(ch(back));
    if (k === 'step') subs.push(back ? box(-0.5, FD - 1, FH - 1, FW + 0.5, FD + 0.5, FH + 0.5) : box(-0.5, -0.5, FH - 1, FW + 0.5, 1, FH + 0.5));
    if (k === 'cove') subs.push(xc(back ? FD : 0, FH, 1));
  });
  const x = p.top.x, y = FD / 2;
  switch (p.top.k) {
    case 'cyl': adds.push(vc(x, y, 0.75, FH, FH + 1)); break;
    case 'cylhole': adds.push(vc(x, y, 0.75, FH, FH + 1)); subs.push(vc(x, y, 0.4, -0.5, FH + 1.5)); break;
    case 'frustum': adds.push(vk(x, y, 0.8, 0.45)); break;
    case 'frustumhole': adds.push(vk(x, y, 0.8, 0.45)); subs.push(vc(x, y, 0.3, -0.5, FH + 1.5)); break;
    case 'cone': adds.push(vk(x, y, 0.8, 0)); break;
    case 'hole': subs.push(vc(x, y, 0.5, -0.5, FH + 0.5)); break;
    case 'cbore': subs.push(vc(x, y, 0.7, FH - 1, FH + 0.5), vc(x, y, 0.35, -0.5, FH + 0.5)); break;
    case 'cboreb': subs.push(vc(x, y, 0.7, -0.5, 1), vc(x, y, 0.35, -0.5, FH + 0.5)); break;
    case 'sqhole': subs.push(box(x - 0.5, y - 0.5, -0.5, x + 0.5, y + 0.5, FH + 0.5)); break;
    case 'sqboss': adds.push(box(x - 0.6, y - 0.6, FH, x + 0.6, y + 0.6, FH + 1)); break;
    default: break;
  }
  switch (p.side.k) {
    case 'yhole': subs.push(yc(p.side.x, 1, 0.5)); break;
    case 'xhole': subs.push(xc(y, 1, 0.5)); break;
    case 'uslotR': subs.push(vc(FW, y, 0.6, -0.5, FH + 0.5)); break;
    case 'uslotL': subs.push(vc(0, y, 0.6, -0.5, FH + 0.5)); break;
    case 'channel': subs.push(box(2.3, -0.5, -0.5, 2.7, FD + 0.5, 1)); break;
    default: break;
  }
  const u = adds.length > 1 ? { op: 'u', a: adds } : adds[0];
  return subs.length ? { op: 'd', a: [u].concat(subs) } : u;
}
function famWindow(view, rot) {
  const X = rot ? FD : FW, Y = rot ? FW : FD, Z = FH + 1, m = 0.25;
  return view === 'front' ? [-m, -m, X + m, Z + m] : view === 'top' ? [-m, -m, X + m, Y + m] : [-m, -m, Y + m, Z + m];
}
const FAM_R = 5;
const famCache = {};
function famTable(rot) {
  if (famCache[rot]) return famCache[rot];
  const members = famMembers(), keys = { top: [], front: [], end: [] };
  members.forEach((p) => {
    const sol = famSolid(p, rot);
    for (const v of ['top', 'front', 'end']) keys[v].push(vKey(vLineMap(sol, v, famWindow(v, rot), FAM_R)));
  });
  return (famCache[rot] = { members, keys });
}

/* Full check of one machined TFE item. Returns a list of problems. */
function checkTfeMachined(it, opt = {}) {
  const p = [], f = it.figure, rot = f.rot, R = 24, K = 3;
  const own = famSolid(f.params, rot);
  for (const v of ['top', 'front', 'end']) {
    const win = famWindow(v, rot);
    if (vKey(vLineMap(own, v, win, 12)) !== vKey(vLineMap(f.csg, v, win, 12))) p.push('item solid is not the family member its parameters name (' + v + ')');
  }
  const truth = {};
  for (const v of ['top', 'front', 'end']) truth[v] = vLineMap(own, v, famWindow(v, rot), R);
  for (const v of Object.keys(f.given)) {
    const n = vDiff(truth[v], vVectorMap(f.given[v], truth[v].G), vEnds(f.given[v]));
    if (n) p.push('given ' + v + ' view differs from the solid in ' + n + ' places');
  }
  const key = it.options[it.answer].prims;
  const kn = vDiff(truth[f.missing], vVectorMap(key, truth[f.missing].G), vEnds(key));
  if (kn) p.push('keyed view differs from the true ' + f.missing + ' view in ' + kn + ' places');
  if (opt.family !== false) {
    const T = famTable(rot), given = Object.keys(f.given);
    const want = given.map((v) => vKey(vLineMap(own, v, famWindow(v, rot), FAM_R)));
    const cons = [];
    T.members.forEach((m, i) => { if (given.every((v, k) => T.keys[v][i] === want[k])) cons.push(m); });
    // exact fine check of the survivors' given views, then their missing views
    const valid = [];
    cons.forEach((m) => {
      const sol = famSolid(m, rot);
      const same = given.every((v) => { const a = vLineMap(sol, v, famWindow(v, rot), R); return vKey(a) === vKey(truth[v]); });
      if (same) valid.push(vLineMap(sol, f.missing, famWindow(f.missing, rot), R));
    });
    if (!valid.length) p.push('no family member reproduces the given views');
    it.options.forEach((o, i) => {
      if (i === it.answer) return;
      const M = vVectorMap(o.prims, truth[f.missing].G), J = vEnds(o.prims);
      const close = valid.map((vm) => vDiff(vm, M, J)).filter((n) => n < K).length;
      if (close) p.push('distractor ' + i + ' (' + o.trap + ') matches a view a consistent object could have');
    });
    p.validCount = valid.length;
  }
  const maps = it.options.map((o) => ({ M: vVectorMap(o.prims, truth[f.missing].G), J: vEnds(o.prims) }));
  for (let a = 0; a < maps.length; a++) for (let b = a + 1; b < maps.length; b++) if (vDiff(maps[a].M, maps[b].M, maps[a].J.concat(maps[b].J)) < K) p.push('options ' + a + ' and ' + b + ' look the same');
  if (it.options.length !== 4) p.push('TFE must have 4 choices');
  return p;
}


/* ---------------- machined KEYHOLES ---------------- */
const ISOV = (() => { const d = [1, 1, 1 / 0.92], L = Math.hypot(...d); return { u: [0.866, -0.866, 0], v: [0.5, 0.5, -0.92], d: d.map((x) => x / L) }; })();
function solve3(rows, rhs) {
  const [a, b, c] = rows, det = d3(a, [b[1] * c[2] - b[2] * c[1], b[2] * c[0] - b[0] * c[2], b[0] * c[1] - b[1] * c[0]]);
  const col = (k) => { const m = rows.map((r, i) => r.map((x, j) => (j === k ? rhs[i] : x))); return d3(m[0], [m[1][1] * m[2][2] - m[1][2] * m[2][1], m[1][2] * m[2][0] - m[1][0] * m[2][2], m[1][0] * m[2][1] - m[1][1] * m[2][0]]) / det; };
  return [col(0), col(1), col(2)];
}
/* line map in the pictorial direction, visible lines only */
function vIsoMap(node, win, R) {
  const G = vGrid(win, R), prims = primsOf(node), sig = [];
  for (let i = 0; i < G.nu; i++) for (let j = 0; j < G.nv; j++) {
    const o = solve3([ISOV.u, ISOV.v, ISOV.d], [G.u(i), G.v(j), 0]);
    sig.push(vLayers(node, prims, o, ISOV.d, true));
  }
  const cmp = (a, b) => {
    if (!a.length || !b.length) return a.length === b.length ? 0 : 1;
    const A = a[0], B = b[0];
    if (A[1] === B[1]) return 0;
    if (!A[2] || !B[2]) return 1;
    const cosang = d3(A[2], B[2]);
    return cosang < Math.cos(10 * Math.PI / 180) || Math.abs(A[0] - B[0]) > 0.2 ? 1 : 0;
  };
  const H = new Uint8Array((G.nu - 1) * G.nv), Vv = new Uint8Array(G.nu * (G.nv - 1));
  for (let i = 0; i + 1 < G.nu; i++) for (let j = 0; j < G.nv; j++) H[i * G.nv + j] = cmp(sig[i * G.nv + j], sig[(i + 1) * G.nv + j]);
  for (let i = 0; i < G.nu; i++) for (let j = 0; j + 1 < G.nv; j++) Vv[i * (G.nv - 1) + j] = cmp(sig[i * G.nv + j], sig[i * G.nv + j + 1]);
  return { G, H, V: Vv };
}
/* lines present in one map with no line of the other map within tol (both directions) */
function nearMiss(A, B, tol) {
  const G = A.G, pos = (arr, horiz) => { const out = []; for (let k = 0; k < arr.length; k++) if (arr[k]) { if (horiz) { const i = Math.floor(k / G.nv), j = k % G.nv; out.push([(G.u(i) + G.u(i + 1)) / 2, G.v(j)]); } else { const i = Math.floor(k / (G.nv - 1)), j = k % (G.nv - 1); out.push([G.u(i), (G.v(j) + G.v(j + 1)) / 2]); } } return out; };
  const a = pos(A.H, true).concat(pos(A.V, false)), b = pos(B.H, true).concat(pos(B.V, false));
  const cell = (q) => Math.floor(q[0] / tol) + ',' + Math.floor(q[1] / tol), idx = (pts) => { const m = {}; pts.forEach((q) => { (m[cell(q)] = m[cell(q)] || []).push(q); }); return m; };
  const ia = idx(a), ib = idx(b);
  const has = (m, q) => { const cx = Math.floor(q[0] / tol), cy = Math.floor(q[1] / tol); for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (const r of m[(cx + dx) + ',' + (cy + dy)] || []) if (Math.hypot(r[0] - q[0], r[1] - q[1]) <= tol) return true; return false; };
  return a.filter((q) => !has(ib, q)).length + b.filter((q) => !has(ia, q)).length;
}
/* exact extent of the solid along each axis (first entry / last exit over a ray grid) */
function vExtent(node) {
  const prims = primsOf(node), lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (let ax = 0; ax < 3; ax++) {
    const i = (ax + 1) % 3, j = (ax + 2) % 3, d = [0, 0, 0]; d[ax] = 1;
    // first entry and last exit of the ray through (u, v) along the axis
    const span = (u, v) => {
      const o = [0, 0, 0]; o[i] = u; o[j] = v; o[ax] = -50;
      const cs = []; prims.forEach((p) => crossings(p, o, d, cs));
      cs.sort((a, b) => a[0] - b[0]);
      let f = null, l = null;
      for (let k = 0; k + 1 < cs.length; k++) {
        const t0 = cs[k][0], t1 = cs[k + 1][0];
        if (t1 - t0 > 1e-9 && csgInside(node, [o[0] + d[0] * (t0 + t1) / 2, o[1] + d[1] * (t0 + t1) / 2, o[2] + d[2] * (t0 + t1) / 2])) { if (f === null) f = t0 - 50; l = t1 - 50; }
      }
      return f === null ? null : [f, l];
    };
    // coarse grid, then zoom in around the best ray (finds sharp tips exactly)
    for (const which of [0, 1]) {
      let best = null, bu = 0, bv = 0, step = 0.125;
      for (let u = -0.5 + 0.0613; u < 7.5; u += step) for (let v = -0.5 + 0.0591; v < 7.5; v += step) {
        const sp = span(u, v); if (!sp) continue;
        const val = which ? sp[1] : -sp[0];
        if (best === null || val > best) { best = val; bu = u; bv = v; }
      }
      for (let it = 0; it < 14; it++) {
        const s0 = step; step /= 4; let nb = best, nu = bu, nv = bv;
        for (let a = -4; a <= 4; a++) for (let b = -4; b <= 4; b++) {
          const sp = span(bu + a * step, bv + b * step); if (!sp) continue;
          const val = which ? sp[1] : -sp[0];
          if (val > nb) { nb = val; nu = bu + a * step; nv = bv + b * step; }
        }
        best = nb; bu = nu; bv = nv; if (s0 < 1e-7) break;
      }
      if (which) hi[ax] = best; else lo[ax] = -best;
    }
  }
  return { lo, hi };
}
/* silhouette along axis a, as a sampler in the opening's frame (u right, v down, origin top-left) */
function vSilhouette(node, a, ext) {
  const V = [VVIEW.end, VVIEW.front, VVIEW.top][a], prims = primsOf(node);
  const ui = V.u.indexOf(1), vi = V.v.indexOf(1);
  const w = ext.hi[ui] - ext.lo[ui], h = ext.hi[vi] - ext.lo[vi];
  const hit = (u, v) => {        // u from the left, v down from the top
    const o = [0, 0, 0]; o[ui] = ext.lo[ui] + u; o[vi] = ext.hi[vi] - v; o[a] = -50;
    const d = [0, 0, 0]; d[a] = 1;
    return vLayers(node, prims, o, d).length > 0;
  };
  return { w, h, hit };
}
function polyIn(loops, x, y) {
  let wn = 0;
  for (const L of loops) for (let i = 0; i < L.length; i++) {
    const a = L[i], b = L[(i + 1) % L.length];
    if (a[1] <= y) { if (b[1] > y && (b[0] - a[0]) * (y - a[1]) - (x - a[0]) * (b[1] - a[1]) > 0) wn++; }
    else if (b[1] <= y && (b[0] - a[0]) * (y - a[1]) - (x - a[0]) * (b[1] - a[1]) < 0) wn--;
  }
  return wn !== 0;
}
function polyDist(loops, x, y) {
  let best = 1e9;
  for (const L of loops) for (let i = 0; i < L.length; i++) {
    const a = L[i], b = L[(i + 1) % L.length], dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
    const t = l2 ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / l2)) : 0;
    best = Math.min(best, Math.hypot(a[0] + dx * t - x, a[1] + dy * t - y));
  }
  return best;
}
/* the 8 turns/flips of an opening, each normalized to its own box at the opening's scale */
function vD4(loops, scale) {
  const out = [];
  for (let r = 0; r < 4; r++) for (const f of [false, true]) {
    let L = loops.map((P) => P.map((q) => [q[0] * scale, q[1] * scale]));
    for (let k = 0; k < r; k++) L = L.map((P) => P.map((q) => [q[1], -q[0]]));
    if (f) L = L.map((P) => P.map((q) => [-q[0], q[1]]));
    const xs = L.flat().map((q) => q[0]), ys = L.flat().map((q) => q[1]), x0 = Math.min(...xs), y0 = Math.min(...ys);
    L = L.map((P) => P.map((q) => [q[0] - x0, q[1] - y0]));
    out.push({ L, w: Math.max(...xs) - x0, h: Math.max(...ys) - y0 });
  }
  return out;
}
/* mismatched samples between an opening (any turn/flip) and a true silhouette; Infinity if sizes differ */
function outlineMismatch(sil, loops, scale) {
  let best = Infinity;
  for (const T of vD4(loops, scale)) {
    if (Math.abs(T.w - sil.w) > 0.03 || Math.abs(T.h - sil.h) > 0.03) continue;
    let bad = 0;
    for (let v = 0.0391; v < sil.h; v += 0.0625) for (let u = 0.0313; u < sil.w; u += 0.0625) {
      if (polyDist(T.L, u, v) < 0.02) continue;
      if (polyIn(T.L, u, v) !== sil.hit(u, v)) bad++;
    }
    best = Math.min(best, bad);
  }
  return best;
}
function checkKeyholesMachined(it) {
  const p = [], f = it.figure, sol = f.csg, ext = vExtent(sol);
  const sils = [0, 1, 2].map((a) => vSilhouette(sol, a, ext));
  // each opening against each true outline
  it.options.forEach((o, i) => {
    const mm = sils.map((s) => outlineMismatch(s, o.loops, o.scale || 1));
    const best = Math.min(...mm);
    if (i === it.answer) {
      if (best !== 0) p.push('keyed opening is not a true outline (' + best + ' samples off)');
      if (mm[it.meta.keyAxis] !== 0) p.push('meta.keyAxis does not match the key');
    } else if (best < 8) p.push('distractor ' + i + ' (' + o.trap + ') is within ' + best + ' samples of a true outline');
    if (o.trap === 'SIZE' && Math.abs((o.scale || 1) - 1) < 0.25) p.push('size trap too close to true size');
  });
  // no hidden irregularities: every feature shows a real area in the drawing
  const feats = [], signs = [];
  if (sol.op === 'd') { if (sol.a[0].op === 'u') sol.a[0].a.slice(1).forEach((x) => { feats.push(x); signs.push(-1); }); sol.a.slice(1).forEach((x) => { feats.push(x); signs.push(1); }); }
  else if (sol.op === 'u') sol.a.slice(1).forEach((x) => { feats.push(x); signs.push(-1); });
  const corners = [];
  for (const x of [ext.lo[0], ext.hi[0]]) for (const y of [ext.lo[1], ext.hi[1]]) for (const z of [ext.lo[2], ext.hi[2]]) corners.push([d3([x, y, z], ISOV.u), d3([x, y, z], ISOV.v)]);
  const win = [Math.min(...corners.map((c) => c[0])) - 0.2, Math.min(...corners.map((c) => c[1])) - 0.2, Math.max(...corners.map((c) => c[0])) + 0.2, Math.max(...corners.map((c) => c[1])) + 0.2];
  const prims = primsOf(sol), counts = feats.map(() => 0);
  for (let u = win[0] + 0.043; u < win[2]; u += 0.09) for (let v = win[1] + 0.037; v < win[3]; v += 0.09) {
    const o = solve3([ISOV.u, ISOV.v, ISOV.d], [u, v, 0]);
    const cs = []; prims.forEach((q) => crossings(q, o, ISOV.d, cs));
    cs.sort((a, b) => b[0] - a[0]);
    const at = (t) => [o[0] + ISOV.d[0] * t, o[1] + ISOV.d[1] * t, o[2] + ISOV.d[2] * t];
    let tHit = null;
    for (let k = 0; k + 1 < cs.length; k++) if (cs[k][0] - cs[k + 1][0] > 1e-9 && csgInside(sol, at((cs[k][0] + cs[k + 1][0]) / 2))) { tHit = cs[k][0]; break; }
    if (tHit === null) continue;
    feats.forEach((g, i) => { if (csgInside(g, at(tHit + 2e-3 * signs[i]))) counts[i]++; });
  }
  counts.forEach((n, i) => { if (n < 20) p.push('feature ' + i + ' barely shows in the drawing (' + n + ' samples)'); });
  // the drawing itself shows the object: visible lines match an iso raster
  const pts = f.lines.flatMap((q) => (q.k === 'L' ? [q.a, q.b] : q.k === 'P' ? q.pts : [[q.c[0] - q.r, q.c[1] - q.r], [q.c[0] + q.r, q.c[1] + q.r]]));
  const dw = [Math.min(...pts.map((q) => q[0])) - 0.3, Math.min(...pts.map((q) => q[1])) - 0.3, Math.max(...pts.map((q) => q[0])) + 0.3, Math.max(...pts.map((q) => q[1])) + 0.3];
  const M = vIsoMap(sol, dw, 16), VM = vVectorMap(f.lines.map((q) => Object.assign({}, q, { dash: false })), M.G);
  const dn = nearMiss(M, VM, 0.075);
  if (dn) p.push('pictorial drawing differs from the solid in ' + dn + ' places');
  const cans = it.options.map((o) => o);
  for (let a = 0; a < cans.length; a++) for (let b = a + 1; b < cans.length; b++) {
    const A = vD4(cans[a].loops, cans[a].scale || 1)[0];
    const silA = { w: A.w, h: A.h, hit: (u, v) => polyIn(A.L, u, v) };
    if (outlineMismatch(silA, cans[b].loops, cans[b].scale || 1) < 8) p.push('options ' + a + ' and ' + b + ' are the same opening');
  }
  if (it.options.length !== 5) p.push('keyholes must have 5 choices');
  return p;
}

module.exports = { checkKeyholesMachined, vExtent, vSilhouette, outlineMismatch, vIsoMap, csgInside, vLayers, vLineMap, vVectorMap, vDiff, vEnds, vKey, vGrid, primsOf, famMembers, famSolid, famWindow, famTable, checkTfeMachined, VVIEW };
