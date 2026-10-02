/*
  verify.js : INDEPENDENT correctness checks for PAT items.

  None of these functions call generator code. Each one re-derives the
  answer from the raw geometry with a different method than the generator
  uses, then asks two questions of every item:
    1. Is the keyed answer truly correct?
    2. Is any distractor ALSO correct (or visually indistinguishable)?
  Used by the generator audit (scripts/pat/audit.js) and the node tests.
*/
'use strict';

/* ======================================================================
   ANGLES
   ====================================================================== */
function verifyAngles(degs, optionStrings, keyIndex) {
  const issues = [];
  const order = degs.map((d, i) => i).sort((a, b) => degs[a] - degs[b]);
  const truth = order.map((i) => i + 1).join('-');
  const matches = optionStrings.map((o, i) => (o === truth ? i : -1)).filter((i) => i >= 0);
  if (new Set(degs).size !== degs.length) issues.push('two angles are equal, ranking undefined');
  if (matches.length !== 1) issues.push('options matching the true order: ' + matches.length);
  if (keyIndex != null && matches[0] !== keyIndex) issues.push('keyed option is not the true order');
  if (new Set(optionStrings).size !== optionStrings.length) issues.push('duplicate options');
  const sorted = degs.slice().sort((a, b) => a - b);
  const gaps = [sorted[1] - sorted[0], sorted[2] - sorted[1], sorted[3] - sorted[2]];
  return { ok: issues.length === 0, issues, minGap: Math.min.apply(null, gaps), gaps };
}

/* ======================================================================
   TOP / FRONT / END
   Coordinates: x = width (left to right), y = depth (front = 0), z = height.
   front view: u = x, v = z, viewer at y = -inf
   top view:   u = x, v = y, viewer at z = +inf (front of object at the bottom)
   end view:   u = y, v = z, viewer at x = +inf (end-left = the front)
   A segment is {a:[u,v], b:[u,v], dash:bool}; keyOf() makes a canonical string.
   ====================================================================== */
function segKey(segs) {
  return segs.map((s) => {
    let a = s.a, b = s.b;
    if (a[0] > b[0] || (a[0] === b[0] && a[1] > b[1])) { const t = a; a = b; b = t; }
    return a[0] + ',' + a[1] + ',' + b[0] + ',' + b[1] + ',' + (s.dash ? 1 : 0);
  }).sort().join('|');
}

/* Independent hidden-line view: enumerate the REAL 3D edges of the voxel
   solid (4-voxel neighbourhood is not flat), project the ones that are not
   parallel to the line of sight, and decide visibility by marching from the
   edge toward the viewer through the depth slabs in front of it. */
function viewByEdges(occ, dims, view) {
  const [NX, NY, NZ] = dims;
  const O = (x, y, z) => (x < 0 || y < 0 || z < 0 || x >= NX || y >= NY || z >= NZ) ? false : !!occ(x, y, z);
  // axis indices 0=x 1=y 2=z. view -> [uAxis, vAxis, depthAxis, nearIsHigh]
  const cfg = { front: [0, 2, 1, false], top: [0, 1, 2, true], end: [1, 2, 0, true] }[view];
  const [UA, VA, DA, nearHi] = cfg;
  const N = [NX, NY, NZ];
  const segMap = new Map();
  for (let A = 0; A < 3; A++) {
    if (A === DA) continue;                       // projects to a point
    const B = (A + 1) % 3, C = (A + 2) % 3;       // the two axes around the edge
    for (let a = 0; a < N[A]; a++) for (let b = 0; b <= N[B]; b++) for (let c = 0; c <= N[C]; c++) {
      const cell = (db, dc) => { const p = [0, 0, 0]; p[A] = a; p[B] = b + db; p[C] = c + dc; return O(p[0], p[1], p[2]); };
      const q = [cell(-1, -1), cell(0, -1), cell(-1, 0), cell(0, 0)]; // (B-,C-) (B+,C-) (B-,C+) (B+,C+)
      const n = q.filter(Boolean).length;
      let real = false;
      if (n === 1 || n === 3) real = true;
      else if (n === 2 && ((q[0] && q[3]) || (q[1] && q[2]))) real = true;   // diagonal pair
      if (!real) continue;
      // edge position: coordinate along A spans [a, a+1]; along B = b, along C = c
      const pos = [0, 0, 0]; pos[A] = a; pos[B] = b; pos[C] = c;
      // the edge's depth coordinate is pos[DA] (integer, since DA is B or C)
      const d = pos[DA];
      // the other screen axis (not A, not DA)
      const S = [0, 1, 2].find((k) => k !== A && k !== DA);
      const s = pos[S];
      // hidden if, in some slab strictly nearer the viewer, the solid fills both sides of the line along S
      let hidden = false;
      const slabs = [];
      if (nearHi) for (let w = d; w < N[DA]; w++) slabs.push(w); else for (let w = d - 1; w >= 0; w--) slabs.push(w);
      for (const w of slabs) {
        const p1 = [0, 0, 0], p2 = [0, 0, 0];
        p1[A] = a; p2[A] = a; p1[DA] = w; p2[DA] = w; p1[S] = s - 1; p2[S] = s;
        if (O(p1[0], p1[1], p1[2]) && O(p2[0], p2[1], p2[2])) { hidden = true; break; }
      }
      // projected segment in (u,v)
      const p0 = [0, 0, 0], p1 = [0, 0, 0];
      p0[A] = a; p1[A] = a + 1; p0[S] = s; p1[S] = s;
      const ua = [p0[UA], p0[VA]], ub = [p1[UA], p1[VA]];
      const k = ua.join(',') + ':' + ub.join(',');
      const prev = segMap.get(k);
      if (!prev) segMap.set(k, { a: ua, b: ub, dash: hidden });
      else if (!hidden) prev.dash = false;              // any visible edge wins
    }
  }
  return Array.from(segMap.values());
}

/* Enumerate every face-connected voxel solid in the box whose two GIVEN views
   match exactly, and return the set of keys of the MISSING view they produce.
   Slices are taken along the axis both given views share, so every segment
   depends on at most two adjacent slices and the search prunes hard. */
function tfeValidMissingKeys(dims, given, missing, viewFn, limit) {
  const [NX, NY, NZ] = dims;
  const N = [NX, NY, NZ];
  const sAxis = { end: 0, front: 1, top: 2 }[missing];
  const others = [0, 1, 2].filter((k) => k !== sAxis);           // slice plane axes
  const n1 = N[others[0]], n2 = N[others[1]], ns = N[sAxis];
  const views = Object.keys(given);
  const axes = { front: [0, 2], top: [0, 1], end: [1, 2] };
  // For each given view, which screen coordinate (0 = u, 1 = v) is the slice axis
  const sIdx = {}; views.forEach((v) => { sIdx[v] = axes[v].indexOf(sAxis); });
  const targetSegs = {};
  views.forEach((v) => { targetSegs[v] = new Set(given[v].split('|').filter(Boolean)); });
  const segK = (s) => segKey([s]);
  // classify a segment of view v: within-band k (parallel to s-axis) or on line k
  function classOf(v, s) {
    const i = sIdx[v];
    const a = s.a[i], b = s.b[i];
    if (a !== b) return { band: Math.min(a, b) };          // runs along s axis inside band
    return { line: a };
  }
  const tgtBand = {}, tgtLine = {};
  views.forEach((v) => {
    tgtBand[v] = Array.from({ length: ns }, () => []);
    tgtLine[v] = Array.from({ length: ns + 1 }, () => []);
    for (const k of targetSegs[v]) {
      const p = k.split(',').map(Number);
      const s = { a: [p[0], p[1]], b: [p[2], p[3]], dash: p[4] === 1 };
      const c = classOf(v, s);
      if (c.band != null) tgtBand[v][c.band].push(k); else tgtLine[v][c.line].push(k);
    }
    tgtBand[v] = tgtBand[v].map((arr) => arr.sort().join('|'));
    tgtLine[v] = tgtLine[v].map((arr) => arr.sort().join('|'));
  });
  // build an occupancy accessor from a list of slice masks (index -> mask or 0)
  function occFrom(slices) {
    return (x, y, z) => {
      if (x < 0 || y < 0 || z < 0 || x >= NX || y >= NY || z >= NZ) return false;
      const p = [x, y, z];
      const m = slices[p[sAxis]];
      if (!m) return false;
      return !!(m & (1 << (p[others[0]] * n2 + p[others[1]])));
    };
  }
  function segsOf(v, slices, pred) {
    return viewFn(occFrom(slices), dims, v).filter((s) => pred(classOf(v, s))).map(segK).sort().join('|');
  }
  const total = 1 << (n1 * n2);
  const cand = [];
  for (let k = 0; k < ns; k++) {
    const list = [];
    for (let m = 0; m < total; m++) {
      const sl = new Array(ns).fill(0); sl[k] = m;
      let ok = true;
      for (const v of views) {
        if (segsOf(v, sl, (c) => c.band === k) !== tgtBand[v][k]) { ok = false; break; }
      }
      if (ok) list.push(m);
    }
    cand.push(list);
  }
  const keys = new Set();
  let leaves = 0, nodes = 0, aborted = false;
  const cur = new Array(ns).fill(0);
  function lineOk(k) {           // line k sits between slices k-1 and k
    const sl = new Array(ns).fill(0);
    if (k - 1 >= 0) sl[k - 1] = cur[k - 1];
    if (k < ns) sl[k] = cur[k];
    for (const v of views) if (segsOf(v, sl, (c) => c.line === k) !== tgtLine[v][k]) return false;
    return true;
  }
  function connected() {
    const occ = occFrom(cur);
    let start = null, tot = 0;
    for (let x = 0; x < NX; x++) for (let y = 0; y < NY; y++) for (let z = 0; z < NZ; z++) if (occ(x, y, z)) { tot++; if (!start) start = [x, y, z]; }
    if (!tot) return false;
    const seen = new Set([start.join(',')]); const st = [start];
    while (st.length) {
      const c = st.pop();
      for (const d of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]) {
        const p = [c[0] + d[0], c[1] + d[1], c[2] + d[2]];
        const kk = p.join(',');
        if (!seen.has(kk) && occ(p[0], p[1], p[2])) { seen.add(kk); st.push(p); }
      }
    }
    return seen.size === tot;
  }
  function dfs(k) {
    if (aborted) return;
    if (++nodes > (limit || 2e6)) { aborted = true; return; }
    if (k === ns) {
      if (!lineOk(ns)) return;
      if (!connected()) return;
      leaves++;
      keys.add(segKey(viewFn(occFrom(cur), dims, missing)));
      return;
    }
    for (const m of cand[k]) {
      cur[k] = m;
      if (lineOk(k)) dfs(k + 1);
    }
    cur[k] = 0;
  }
  dfs(0);
  return { keys, leaves, nodes, aborted };
}

/* ======================================================================
   HOLE PUNCHING : forward simulation. Each original hole position is pushed
   through the folds (reflect if it sits on the moving side); it is punched
   iff it lands on a punch. Folds: {kind:'v'|'h'|'d1'|'d2', c:number, moveSide:+1|-1}
   where the signed distance is  v: x-c,  h: y-c,  d1: (x-y)-c,  d2: (x+y)-c.
   ====================================================================== */
function sdist(f, p) {
  if (f.kind === 'v') return p[0] - f.c;
  if (f.kind === 'h') return p[1] - f.c;
  if (f.kind === 'd1') return (p[0] - p[1]) - f.c;
  return (p[0] + p[1]) - f.c;
}
function reflect(f, p) {
  if (f.kind === 'v') return [2 * f.c - p[0], p[1]];
  if (f.kind === 'h') return [p[0], 2 * f.c - p[1]];
  if (f.kind === 'd1') return [p[1] + f.c, p[0] - f.c];     // across x - y = c
  return [f.c - p[1], f.c - p[0]];                           // across x + y = c
}
function holepunchForward(folds, punches) {
  const key = (p) => p[0] + ',' + p[1];
  const punchSet = new Set(punches.map(key));
  const out = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    let p = [i + 0.5, j + 0.5];
    for (const f of folds) { if (Math.sign(sdist(f, p)) === f.moveSide) p = reflect(f, p); }
    if (punchSet.has(key(p))) out.push([i + 0.5, j + 0.5]);
  }
  return out;
}
/* Exact physical check (handles punches on a fold edge): every original
   triangle of the 4 x 4 sheet (each cell cut by both diagonals) is moved by its
   centroid through the folds; it is cut when it ends inside a punched cell.
   Returns {holes, partial, missed}: cells cut whole, cells cut only in part
   (a visible part-hole), and punches that hit no paper. */
function holepunchTriangles(folds, punches) {
  const cellOf = (p) => Math.floor(p[0]) + ',' + Math.floor(p[1]);
  const pset = new Set(punches.map(cellOf)), hit = new Set(), count = {};
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    const c = [i + 0.5, j + 0.5];
    for (const off of [[0, -1 / 3], [1 / 3, 0], [0, 1 / 3], [-1 / 3, 0]]) {
      let p = [c[0] + off[0], c[1] + off[1]];
      for (const f of folds) { if (Math.sign(sdist(f, p)) === f.moveSide) p = reflect(f, p); }
      const k = cellOf(p);
      if (pset.has(k)) { hit.add(k); count[i + ',' + j] = (count[i + ',' + j] || 0) + 1; }
    }
  }
  const holes = [], partial = [];
  for (const k of Object.keys(count)) { const [a, b] = k.split(',').map(Number); (count[k] === 4 ? holes : partial).push([a + 0.5, b + 0.5]); }
  return { holes, partial, missed: [...pset].filter((k) => !hit.has(k)) };
}
const holeKey = (pts) => pts.map((p) => p[0] + ',' + p[1]).sort().join('|');

/* ======================================================================
   CUBE COUNTING
   cubes: [[x,y,z]], viewer direction (1,1,1) in the generator's iso
   (screen x = (x - y), screen y = (x + y)/2 - z). A cube's painted count is
   its exposed faces except the bottom one when it rests on the floor or a cube.
   ====================================================================== */
function cubePaintedCounts(cubes) {
  const S = new Set(cubes.map((c) => c.join(',')));
  const has = (x, y, z) => S.has(x + ',' + y + ',' + z);
  return cubes.map(([x, y, z]) => {
    let n = 0;
    for (const d of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1]]) if (!has(x + d[0], y + d[1], z + d[2])) n++;
    if (z > 0 && !has(x, y, z - 1)) n++;              // a floating cube's bottom is exposed
    return n;
  });
}
/* fraction of a cube's top face visible from the viewer, by ray casting */
function rayHitsBox(p, d, box) {
  let t0 = 1e-6, t1 = Infinity;
  for (let k = 0; k < 3; k++) {
    const lo = box[k], hi = box[k] + 1;
    if (Math.abs(d[k]) < 1e-12) { if (p[k] <= lo || p[k] >= hi) return false; continue; }
    let a = (lo - p[k]) / d[k], b = (hi - p[k]) / d[k];
    if (a > b) { const t = a; a = b; b = t; }
    t0 = Math.max(t0, a); t1 = Math.min(t1, b);
    if (t0 >= t1 - 1e-9) return false;
  }
  return true;
}
function topFaceVisibility(cubes, cube, dir) {
  const d = dir || [1, 1, 1];
  const n = 8; let vis = 0, tot = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const p = [cube[0] + (i + 0.5) / n, cube[1] + (j + 0.5) / n, cube[2] + 1];
    tot++;
    if (!cubes.some((c) => c !== cube && rayHitsBox(p, d, c))) vis++;
  }
  return vis / tot;
}
/* Ambiguity: every column's top cube must show at least `minFrac` of its top
   face, otherwise a student cannot know that column's height. Also any cube
   that is invisible AND supports nothing breaks the DAT hidden-cube rule. */
function verifyCubeFigure(cubes, minFrac, dir) {
  const issues = [];
  const S = new Set(cubes.map((c) => c.join(',')));
  const tops = cubes.filter(([x, y, z]) => !S.has(x + ',' + y + ',' + (z + 1)));
  let hiddenTops = 0;
  for (const t of tops) {
    const v = topFaceVisibility(cubes, t, dir);
    if (v < (minFrac == null ? 0.2 : minFrac)) hiddenTops++;
  }
  if (hiddenTops) issues.push(hiddenTops + ' column top(s) not visible enough to read the column height');
  return { ok: issues.length === 0, issues, hiddenTops };
}

/* ======================================================================
   PATTERN FOLDING (cube nets) : visual check.
   The net is drawn in screen space (x right, y down). It lies printed side up;
   folding goes INTO the page (away from the viewer), so the cube sits under
   the anchor cell and the paper wraps it, printed side out. We roll a cube
   under the paper cell by cell (equivalent to folding), record each face's
   marking in cube-local coordinates, then render all 24 orientations with a
   right-handed isometric projection (+X lower-left, +Y lower-right, +Z top)
   and collect the 2D drawings. An option is valid iff its drawing is one of them.
   ====================================================================== */
function matMul(A, B) { const C = [[0,0,0],[0,0,0],[0,0,0]]; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) C[i][j] += A[i][k] * B[k][j]; return C; }
function matVec(A, v) { return [0, 1, 2].map((i) => A[i][0] * v[0] + A[i][1] * v[1] + A[i][2] * v[2]); }
function transpose(A) { return [0, 1, 2].map((i) => [0, 1, 2].map((j) => A[j][i])); }
const ROT_X = [[1,0,0],[0,0,-1],[0,1,0]], ROT_Y = [[0,0,1],[0,1,0],[-1,0,0]], ROT_Z = [[0,-1,0],[1,0,0],[0,0,1]];
function all24() {
  const out = new Map(); const st = [[[1,0,0],[0,1,0],[0,0,1]]];
  while (st.length) {
    const R = st.pop(); const k = JSON.stringify(R);
    if (out.has(k)) continue; out.set(k, R);
    for (const G of [ROT_X, ROT_Y, ROT_Z]) st.push(matMul(G, R));
  }
  return Array.from(out.values());
}
/* net: [[col,row]], marks: per cell array of polygons in cell coords [a,b] (b down).
   Returns local-cube polygons: [{normal:[..], pts:[[x,y,z]...]}] in local coords centred at origin. */
function foldNetByRolling(net, marks) {
  const idx = new Map(net.map((c, i) => [c[0] + ',' + c[1], i]));
  const n = net.length;
  // state per visited cell: rotation R (local->world, about cube centre) and centre position
  const state = new Array(n).fill(null);
  const a0 = 0;
  const world = (c, r, a, b) => [c + a, -(r + b), 0];        // paper point in world (Y up)
  state[a0] = { R: [[1,0,0],[0,1,0],[0,0,1]], ctr: [net[a0][0] + 0.5, -(net[a0][1] + 0.5), -0.5] };
  const faces = [];
  const q = [a0]; const seen = new Set([a0]);
  while (q.length) {
    const i = q.shift(); const st = state[i];
    // record this cell's marks onto the face currently touching the paper
    const Rt = transpose(st.R);
    const toLocal = (p) => matVec(Rt, [p[0] - st.ctr[0], p[1] - st.ctr[1], p[2] - st.ctr[2]]);
    const normal = matVec(Rt, [0, 0, 1]).map(Math.round);
    faces.push({ cell: i, normal, polys: marks[i].map((poly) => poly.map(([a, b]) => toLocal(world(net[i][0], net[i][1], a, b)))) });
    // neighbours: right (+X), left (-X), screen-down (row+1 => -Y), screen-up (row-1 => +Y)
    const dirs = [[1, 0, [1, 0]], [-1, 0, [-1, 0]], [0, 1, [0, -1]], [0, -1, [0, 1]]];
    for (const [dc, dr, w] of dirs) {
      const j = idx.get((net[i][0] + dc) + ',' + (net[i][1] + dr));
      if (j == null || seen.has(j)) continue;
      // roll under the paper toward world direction w = [wx, wy]: rotation about the top edge
      // (dx,dz) -> (-dz, dx) for +X ; generalised: for direction e, v' = v rotated so -Z -> e, e -> +Z
      let G;
      if (w[0] === 1) G = [[0,0,-1],[0,1,0],[1,0,0]];
      else if (w[0] === -1) G = [[0,0,1],[0,1,0],[-1,0,0]];
      else if (w[1] === 1) G = [[1,0,0],[0,0,-1],[0,1,0]];
      else G = [[1,0,0],[0,0,1],[0,-1,0]];
      const R = matMul(G, st.R);
      const ctr = [st.ctr[0] + w[0], st.ctr[1] + w[1], -0.5];
      state[j] = { R, ctr }; seen.add(j); q.push(j);
    }
  }
  if (seen.size !== n) return null;
  const normals = new Set(faces.map((f) => f.normal.join(',')));
  if (normals.size !== 6) return null;
  return faces;
}
function projectRH(p) { return [(p[1] - p[0]) * 0.866, (p[0] + p[1]) * 0.5 - p[2]]; }
function drawingSig(polys2d) {
  return polys2d.map((pts) => pts.map((q) => (Math.round(q[0] * 1000) / 1000) + ':' + (Math.round(q[1] * 1000) / 1000)).sort().join(' ')).sort().join(' / ');
}
/* all valid drawings of the folded cube; cube placed at [0,1]^3 */
function validCubeDrawings(faces) {
  const sigs = new Set();
  for (const R of all24()) {
    const polys = [];
    for (const f of faces) {
      const nrm = matVec(R, f.normal);
      if (!(nrm[0] === 1 || nrm[1] === 1 || nrm[2] === 1)) continue;   // visible: +X, +Y, +Z
      for (const poly of f.polys) polys.push(poly.map((p) => { const r = matVec(R, p); return projectRH([r[0] + 0.5, r[1] + 0.5, r[2] + 0.5]); }));
    }
    sigs.add(drawingSig(polys));
  }
  return sigs;
}

/* ======================================================================
   KEYHOLES : silhouettes recomputed from the voxel solid, compared under the
   8 symmetries of the square, plus a similarity check (same outline at a
   different scale is visually identical when options are drawn to fit).
   ====================================================================== */
function trimG(g) {
  let r0 = 0, r1 = g.length - 1, c0 = 0, c1 = g[0].length - 1;
  const rowE = (r) => g[r].every((v) => !v), colE = (c) => g.every((row) => !row[c]);
  while (r0 <= r1 && rowE(r0)) r0++; while (r1 >= r0 && rowE(r1)) r1--;
  if (r0 > r1) return [[0]];
  while (c0 <= c1 && colE(c0)) c0++; while (c1 >= c0 && colE(c1)) c1--;
  const out = []; for (let r = r0; r <= r1; r++) out.push(g[r].slice(c0, c1 + 1).map((v) => (v ? 1 : 0)));
  return out;
}
function rotG(g) { const R = g.length, C = g[0].length; const o = []; for (let c = 0; c < C; c++) { o.push([]); for (let r = R - 1; r >= 0; r--) o[c].push(g[r][c]); } return o; }
function flipG(g) { return g.map((r) => r.slice().reverse()); }
function d4(g) { const out = []; let cur = trimG(g); for (let i = 0; i < 4; i++) { out.push(cur, flipG(cur)); cur = rotG(cur); } return out; }
const gStr = (g) => g.map((r) => r.join('')).join('/');
function canonG(g) { return d4(g).map(gStr).sort()[0]; }
/* run-length compress rows and columns; returns {shape, rows:[runs], cols:[runs]} */
function compress(g) {
  const t = trimG(g);
  const rowsK = [], rowRuns = []; let prev = null;
  for (const r of t) { const s = r.join(''); if (s === prev) rowRuns[rowRuns.length - 1]++; else { rowsK.push(r); rowRuns.push(1); prev = s; } }
  const cols = rowsK[0].length; const colKeep = [], colRuns = []; let prevC = null;
  for (let c = 0; c < cols; c++) { const s = rowsK.map((r) => r[c]).join(''); if (s === prevC) colRuns[colRuns.length - 1]++; else { colKeep.push(c); colRuns.push(1); prevC = s; } }
  const shape = rowsK.map((r) => colKeep.map((c) => r[c]).join('')).join('/');
  return { shape, rowRuns, colRuns };
}
function similar(a, b) {      // same outline up to a uniform scale (any D4 symmetry)
  const A = compress(a);
  for (const t of d4(b)) {
    const B = compress(t);
    if (A.shape !== B.shape) continue;
    if (A.rowRuns.length !== B.rowRuns.length || A.colRuns.length !== B.colRuns.length) continue;
    const k = A.rowRuns[0] / B.rowRuns[0];
    const all = A.rowRuns.every((v, i) => Math.abs(v / B.rowRuns[i] - k) < 1e-9) && A.colRuns.every((v, i) => Math.abs(v / B.colRuns[i] - k) < 1e-9);
    if (all) return true;
  }
  return false;
}
function silhouettesOf(occ, N) {
  const mk = () => Array.from({ length: N }, () => new Array(N).fill(0));
  const gx = mk(), gy = mk(), gz = mk();
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) for (let z = 0; z < N; z++) {
    if (!occ(x, y, z)) continue;
    gx[z][y] = 1; gy[z][x] = 1; gz[y][x] = 1;
  }
  return [gx, gy, gz].map(trimG);
}
/* Fill every voxel that is hidden from the drawing's viewpoint (all sample
   rays toward the viewer blocked). "No hidden irregularities" means a student
   must assume these are solid; if that changes a silhouette, the item depends
   on something the picture cannot show. */
function hiddenFill(occ, N, dir) {
  const d = dir || [1, 1, 1.087];
  const cells = []; for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) for (let z = 0; z < N; z++) if (occ(x, y, z)) cells.push([x, y, z]);
  let bb = [N, N, N, -1, -1, -1];
  for (const c of cells) for (let k = 0; k < 3; k++) { bb[k] = Math.min(bb[k], c[k]); bb[k + 3] = Math.max(bb[k + 3], c[k]); }
  const filled = new Set(cells.map((c) => c.join(',')));
  const added = [];
  // march along the ray in small steps and test occupancy (cheap and robust)
  const blocked = (p) => {
    for (let t = 0.05; t < 3 * N; t += 0.05) {
      const q = [p[0] + d[0] * t, p[1] + d[1] * t, p[2] + d[2] * t];
      const ix = Math.floor(q[0]), iy = Math.floor(q[1]), iz = Math.floor(q[2]);
      if (ix >= N || iy >= N || iz >= N) return false;
      if (occ(ix, iy, iz)) return true;
    }
    return false;
  };
  const samples = [0.2, 0.5, 0.8];
  for (let x = bb[0]; x <= bb[3]; x++) for (let y = bb[1]; y <= bb[4]; y++) for (let z = bb[2]; z <= bb[5]; z++) {
    if (occ(x, y, z)) continue;
    let all = true;
    for (const a of samples) { for (const b of samples) { for (const c of samples) { if (!blocked([x + a, y + b, z + c])) { all = false; break; } } if (!all) break; } if (!all) break; }
    if (all) { filled.add(x + ',' + y + ',' + z); added.push([x, y, z]); }
  }
  return { occ: (x, y, z) => filled.has(x + ',' + y + ',' + z), added };
}

/* Outline evidence. A student reads the outline from what the drawing shows,
   assuming hidden parts simply continue ("no hidden irregularities"). Two ways
   an item can break that:
   (E1) a notch: an outline cell is empty, yet if every hidden void were solid
        it would be filled, and NO voxel on that line of sight is visibly empty;
   (E2) a hidden lump: an outline cell is filled only by voxels that show no
        face at all in the drawing.
   Returns a list of human-readable problems (empty = fine). */
function outlineEvidence(occ, N, dir) {
  const d = dir || [1, 1, 1.087];
  const blocked = (p) => {
    for (let t = 0.04; t < 3 * N; t += 0.04) {
      const ix = Math.floor(p[0] + d[0] * t), iy = Math.floor(p[1] + d[1] * t), iz = Math.floor(p[2] + d[2] * t);
      if (ix >= N || iy >= N || iz >= N) return false;
      if (occ(ix, iy, iz)) return true;
    }
    return false;
  };
  const S3 = [0.2, 0.5, 0.8];
  const memoE = new Map(), memoF = new Map();
  const emptyVisible = (x, y, z) => {
    const k = x + ',' + y + ',' + z; if (memoE.has(k)) return memoE.get(k);
    let v = false;
    for (const a of S3) { for (const b of S3) { for (const c of S3) { if (!blocked([x + a, y + b, z + c])) { v = true; break; } } if (v) break; } if (v) break; }
    memoE.set(k, v); return v;
  };
  const solidVisible = (x, y, z) => {
    const k = x + ',' + y + ',' + z; if (memoF.has(k)) return memoF.get(k);
    let v = false;
    const faces = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    for (const f of faces) {
      if (occ(x + f[0], y + f[1], z + f[2])) continue;
      for (const a of S3) { for (const b of S3) {
        const p = f[0] ? [x + 1 + 1e-3, y + a, z + b] : f[1] ? [x + a, y + 1 + 1e-3, z + b] : [x + a, y + b, z + 1 + 1e-3];
        if (!blocked(p)) { v = true; break; }
      } if (v) break; }
      if (v) break;
    }
    memoF.set(k, v); return v;
  };
  const hf = hiddenFill(occ, N, d);
  const out = [];
  const names = ['end (along x)', 'front (along y)', 'top (along z)'];
  // line of sight for silhouette axis a at 2D cell (i,j)
  const lineCells = (a, i, j) => {
    const arr = [];
    for (let t = 0; t < N; t++) arr.push(a === 0 ? [t, i, j] : a === 1 ? [i, t, j] : [i, j, t]);
    return arr;
  };
  const counts = [];
  for (let a = 0; a < 3; a++) {
    let e1 = 0, e2 = 0;
    const fill = [];
    for (let i = 0; i < N; i++) { fill.push([]); for (let j = 0; j < N; j++) fill[i].push(lineCells(a, i, j).some((c) => occ(c[0], c[1], c[2]))); }
    const F = (i, j) => (i >= 0 && j >= 0 && i < N && j < N) ? fill[i][j] : false;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      // only cells on the outline matter: a filled cell with an empty neighbour, or an empty cell with a filled neighbour
      const nb = [F(i - 1, j), F(i + 1, j), F(i, j - 1), F(i, j + 1)];
      const onOutline = fill[i][j] ? nb.some((v) => !v) : nb.some((v) => v);
      if (!onOutline) continue;
      const line = lineCells(a, i, j);
      if (!fill[i][j]) {
        const filledMax = line.some((c) => hf.occ(c[0], c[1], c[2]));
        if (!filledMax) continue;
        const seen = line.some((c) => !hf.occ(c[0], c[1], c[2]) && emptyVisible(c[0], c[1], c[2]));
        if (!seen) e1++;
      } else {
        const seen = line.some((c) => occ(c[0], c[1], c[2]) && solidVisible(c[0], c[1], c[2]));
        if (!seen) e2++;
      }
    }
    counts.push(e1 + e2);
    if (e1) out.push(names[a] + ': ' + e1 + ' outline notch cell(s) with no visible evidence');
    if (e2) out.push(names[a] + ': ' + e2 + ' outline cell(s) drawn only by hidden material');
  }
  out.counts = counts;
  return out;
}
function verifyKeyholes(occ, N, optionGrids, keyIndex, opts) {
  const o = opts || {};
  const issues = [];
  const sils = silhouettesOf(occ, N);
  const truth = new Set(sils.map(canonG));
  const valid = optionGrids.map((g, i) => (truth.has(canonG(g)) ? i : -1)).filter((i) => i >= 0);
  if (valid.length !== 1) issues.push('options matching a true outline: ' + valid.length);
  if (valid[0] !== keyIndex) issues.push('keyed option is not a true outline');
  if (o.scaleNormalized) {
    optionGrids.forEach((g, i) => {
      if (i === keyIndex) return;
      if (sils.some((s) => similar(g, s))) issues.push('option ' + 'ABCDE'[i] + ' is a true outline at a different scale (looks identical when drawn to fit)');
    });
  }
  const cans = optionGrids.map(canonG);
  if (new Set(cans).size !== cans.length) issues.push('two options are the same outline');
  if (o.checkHidden !== false) {
    const ev = outlineEvidence(occ, N, o.dir);
    if (ev.length) issues.push('outline depends on geometry the drawing cannot show: ' + ev.join('; '));
  }
  return { ok: issues.length === 0, issues, sils };
}

module.exports = {
  verifyAngles,
  segKey, viewByEdges, tfeValidMissingKeys,
  holepunchForward, holepunchTriangles, holeKey, sdist, reflect,
  cubePaintedCounts, topFaceVisibility, verifyCubeFigure,
  foldNetByRolling, validCubeDrawings, drawingSig, projectRH, all24, matVec,
  trimG, canonG, similar, silhouettesOf, hiddenFill, outlineEvidence, verifyKeyholes
};
