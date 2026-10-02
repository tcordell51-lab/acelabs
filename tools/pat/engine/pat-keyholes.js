/*
  pat-keyholes.js : Keyholes / apertures (PAT questions 1-15).

  An irregular solid and five openings (A-E). Exactly one opening is the
  object's outline seen straight along one of its three axes; the object may be
  turned any way before passing through, so outlines are compared under all
  eight turns and flips of the square.

  GEOMETRY CORE: carried over unchanged from the Studio Aperture Trainer
  (tools/pat/keyholes.html, the golden standard): machined voxel solids, exact
  orthographic silhouettes, and the seven machine-verified trap families.

  TEST-MODE ADDITIONS (below the core):
  - Readable key: the keyed outline must be fully supported by what the
    drawing shows. Every outline cell of the key has visible evidence in the
    pictorial view (no notch or lump that only hidden material creates).
  - Near-miss traps are cut from the KEY outline, so the deciding difference
    is always in a part of the object the student can see.
  - Same-scale drawing: all five openings are drawn at one common scale (the
    DAT draws the object and openings to the same scale), which makes the
    "right shape, wrong size" trap meaningful; it appears in about a third of items.
*/
(function (root) {
'use strict';
var PAT = root.PAT || (typeof require === 'function' ? require('./pat-core.js') : null);
/* ---------- deterministic PRNG ---------- */
function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const ri = (rng, n) => Math.floor(rng() * n);
const rint = (rng, lo, hi) => lo + ri(rng, hi - lo + 1);
const pick = (rng, arr) => arr[ri(rng, arr.length)];

/* ============================================================
   Solid: dense boolean field over N x N x N
   ============================================================ */
function makeSolid(N) {
  return { N, d: new Uint8Array(N * N * N) };
}
const idx = (S, x, y, z) => (x * S.N + y) * S.N + z;
const getV = (S, x, y, z) =>
  (x < 0 || y < 0 || z < 0 || x >= S.N || y >= S.N || z >= S.N) ? 0 : S.d[idx(S, x, y, z)];

function paintBox(S, b, val) {
  for (let x = Math.max(0, b.x0); x < Math.min(S.N, b.x1); x++)
    for (let y = Math.max(0, b.y0); y < Math.min(S.N, b.y1); y++)
      for (let z = Math.max(0, b.z0); z < Math.min(S.N, b.z1); z++)
        S.d[idx(S, x, y, z)] = val;
}
function boxOverlapsSolid(S, b) {
  for (let x = Math.max(0, b.x0); x < Math.min(S.N, b.x1); x++)
    for (let y = Math.max(0, b.y0); y < Math.min(S.N, b.y1); y++)
      for (let z = Math.max(0, b.z0); z < Math.min(S.N, b.z1); z++)
        if (S.d[idx(S, x, y, z)]) return true;
  return false;
}
function solidCount(S) { let n = 0; for (let i = 0; i < S.d.length; i++) n += S.d[i]; return n; }

/* 6-connectivity check over the whole solid */
function solidConnected(S) {
  const N = S.N;
  let start = -1;
  for (let i = 0; i < S.d.length; i++) if (S.d[i]) { start = i; break; }
  if (start < 0) return false;
  const seen = new Uint8Array(S.d.length);
  const stack = [start]; seen[start] = 1; let cnt = 1;
  while (stack.length) {
    const i = stack.pop();
    const z = i % N, y = ((i - z) / N) % N, x = Math.floor(i / (N * N));
    const nb = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
    for (const [dx, dy, dz] of nb) {
      const nx = x + dx, ny = y + dy, nz = z + dz;
      if (nx < 0 || ny < 0 || nz < 0 || nx >= N || ny >= N || nz >= N) continue;
      const j = idx(S, nx, ny, nz);
      if (!S.d[j] || seen[j]) continue;
      seen[j] = 1; cnt++; stack.push(j);
    }
  }
  return cnt === solidCount(S);
}

/* ---------- object generation ----------
   Additive: a chunky base slab plus 1-3 large blocks/ribs.
   Subtractive: rectangular slots cut from a face, plus optional
   through-holes (which never affect any silhouette - the teaching point). */
function randBox(rng, N, minS, maxS) {
  const sx = rint(rng, minS, maxS), sy = rint(rng, minS, maxS), sz = rint(rng, minS, maxS);
  const x0 = rint(rng, 0, N - sx), y0 = rint(rng, 0, N - sy), z0 = rint(rng, 0, N - sz);
  return { x0, y0, z0, x1: x0 + sx, y1: y0 + sy, z1: z0 + sz };
}

function genSolid(rng, cfg) {
  const N = cfg.N;
  const S = makeSolid(N);

  // base slab: wide and low, sitting on z = 0
  const bw = rint(rng, Math.round(N * 0.6), N);
  const bd = rint(rng, Math.round(N * 0.55), N);
  const bh = rint(rng, Math.max(2, Math.round(N * 0.2)), Math.round(N * 0.4));
  const bx = rint(rng, 0, N - bw), by = rint(rng, 0, N - bd);
  paintBox(S, { x0: bx, y0: by, z0: 0, x1: bx + bw, y1: by + bd, z1: bh }, 1);

  // additive blocks - each must touch what already exists
  const adds = cfg.blocks;
  let placed = 0, guard = 0;
  while (placed < adds && guard++ < 400) {
    const b = randBox(rng, N, cfg.minS, cfg.maxS);
    // grow one dimension so parts read as ribs / walls rather than cubes
    const axis = ri(rng, 3);
    if (axis === 0) b.x1 = Math.min(N, b.x0 + rint(rng, Math.round(N * 0.5), N));
    else if (axis === 1) b.y1 = Math.min(N, b.y0 + rint(rng, Math.round(N * 0.5), N));
    else b.z1 = Math.min(N, b.z0 + rint(rng, Math.round(N * 0.45), N));
    // Must genuinely interpenetrate existing material, not merely touch it,
    // so the result fuses into one machined mass instead of a pile of boxes.
    if (!boxOverlapsSolid(S, b)) continue;
    const before = solidCount(S);
    const snapshot = S.d.slice();
    paintBox(S, b, 1);
    const gained = solidCount(S) - before;
    const vol = (b.x1 - b.x0) * (b.y1 - b.y0) * (b.z1 - b.z0);
    // reject if it adds almost nothing (buried) or barely overlaps (a stuck-on lump)
    if (gained < vol * 0.2 || gained > vol * 0.92) { S.d.set(snapshot); continue; }
    placed++;
  }
  if (placed < adds) return null;

  // subtractive slots - cut in from a face so they break the outline
  for (let i = 0; i < cfg.slots; i++) {
    for (let t = 0; t < 60; t++) {
      const b = randBox(rng, N, Math.max(2, cfg.minS - 1), cfg.maxS);
      const face = ri(rng, 6);
      const deep = rint(rng, Math.round(N * 0.35), Math.round(N * 0.8));
      if (face === 0) { b.x0 = 0; b.x1 = deep; }
      else if (face === 1) { b.x1 = N; b.x0 = N - deep; }
      else if (face === 2) { b.y0 = 0; b.y1 = deep; }
      else if (face === 3) { b.y1 = N; b.y0 = N - deep; }
      else if (face === 4) { b.z1 = N; b.z0 = N - deep; }
      else { b.z0 = 0; b.z1 = deep; }
      const before = solidCount(S);
      const snapshot = S.d.slice();
      paintBox(S, b, 0);
      const after = solidCount(S);
      if (after < before * 0.55 || after === before || !solidConnected(S)) { S.d.set(snapshot); continue; }
      break;
    }
  }

  // through-holes: pierce the whole solid along one axis. They never
  // change any silhouette, which is exactly the trap being taught.
  for (let i = 0; i < cfg.holes; i++) {
    for (let t = 0; t < 40; t++) {
      const ax = ri(rng, 3);
      const s1 = rint(rng, 2, Math.max(2, Math.round(N * 0.28)));
      const s2 = rint(rng, 2, Math.max(2, Math.round(N * 0.28)));
      const a = rint(rng, 1, N - s1 - 1), b2 = rint(rng, 1, N - s2 - 1);
      const box = ax === 0 ? { x0: 0, x1: N, y0: a, y1: a + s1, z0: b2, z1: b2 + s2 }
                : ax === 1 ? { x0: a, x1: a + s1, y0: 0, y1: N, z0: b2, z1: b2 + s2 }
                           : { x0: a, x1: a + s1, y0: b2, y1: b2 + s2, z0: 0, z1: N };
      const snapshot = S.d.slice();
      const before = solidCount(S);
      paintBox(S, box, 0);
      if (solidCount(S) === before || !solidConnected(S)) { S.d.set(snapshot); continue; }
      break;
    }
  }

  if (!solidConnected(S)) return null;
  const vol = solidCount(S);
  if (vol < cfg.N * cfg.N * 1.1 || vol > cfg.N * cfg.N * cfg.N * 0.62) return null;
  return S;
}

/* Rotate the voxel field 90 degrees about an axis. Applied randomly at
   generation time so the object is not always presented base-down, which
   otherwise makes "the top view is the footprint" a free shortcut. */
function rotateSolid(S, axis) {
  const N = S.N, out = makeSolid(N);
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) for (let z = 0; z < N; z++) {
    if (!S.d[idx(S, x, y, z)]) continue;
    let nx, ny, nz;
    if (axis === 0)      { nx = x;         ny = N - 1 - z; nz = y; }
    else if (axis === 1) { nx = z;         ny = y;         nz = N - 1 - x; }
    else                 { nx = N - 1 - y; ny = x;         nz = z; }
    out.d[idx(out, nx, ny, nz)] = 1;
  }
  return out;
}
function randomlyOrient(rng, S) {
  let cur = S;
  const n = ri(rng, 4);
  for (let i = 0; i < n; i++) cur = rotateSolid(cur, ri(rng, 3));
  return cur;
}

/* ============================================================
   Exact orthographic silhouettes
   ============================================================ */
function silhouette(S, axis) {
  const N = S.N;
  const g = Array.from({ length: N }, () => new Uint8Array(N));
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) for (let z = 0; z < N; z++) {
    if (!S.d[idx(S, x, y, z)]) continue;
    if (axis === 0) g[N - 1 - z][y] = 1;        // looking along X
    else if (axis === 1) g[N - 1 - z][x] = 1;   // looking along Y
    else g[y][x] = 1;                            // looking down Z
  }
  return trim(toArr(g));
}
const toArr = g => g.map(r => Array.from(r));

/* ============================================================
   2D grid utilities
   ============================================================ */
function emptyGrid(rows, cols) { return Array.from({ length: rows }, () => new Array(cols).fill(0)); }
function trim(g) {
  let top = 0, bot = g.length - 1, left = 0, right = g[0].length - 1;
  const rowEmpty = r => g[r].every(v => !v);
  const colEmpty = c => g.every(row => !row[c]);
  while (top <= bot && rowEmpty(top)) top++;
  while (bot >= top && rowEmpty(bot)) bot--;
  if (top > bot) return [[0]];
  while (left <= right && colEmpty(left)) left++;
  while (right >= left && colEmpty(right)) right--;
  const out = [];
  for (let r = top; r <= bot; r++) out.push(g[r].slice(left, right + 1));
  return out;
}
const gridStr = g => g.map(r => r.join('')).join('/');
const cloneGrid = g => g.map(r => r.slice());
const area = g => g.reduce((s, r) => s + r.reduce((a, v) => a + (v ? 1 : 0), 0), 0);
function rot90(g) {
  const rows = g.length, cols = g[0].length, out = emptyGrid(cols, rows);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out[c][rows - 1 - r] = g[r][c];
  return out;
}
const flipH = g => g.map(r => r.slice().reverse());

/* Apertures allow free rotation AND mirroring, so equivalence is
   tested across the full dihedral group of 8. */
function canonical(g) {
  let cur = trim(g), best = null;
  for (let i = 0; i < 4; i++) {
    for (const v of [cur, flipH(cur)]) {
      const s = gridStr(trim(v));
      if (best === null || s < best) best = s;
    }
    cur = rot90(cur);
  }
  return best;
}
/* ============================================================
   Confusability metric: best intersection-over-union between two
   shapes, maximised over the 8 symmetries and small translations.
   Rows are packed into ints so the inner loop is bitwise.
   ============================================================ */
function popcount(v) {
  v = v - ((v >> 1) & 0x55555555);
  v = (v & 0x33333333) + ((v >> 2) & 0x33333333);
  return (((v + (v >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
}
function toBits(g) {
  return g.map(r => { let v = 0; for (let c = 0; c < r.length; c++) if (r[c]) v |= (1 << c); return v; });
}
function transformsOf(g) {
  const out = []; let cur = trim(g);
  for (let i = 0; i < 4; i++) { out.push(cur); out.push(flipH(cur)); cur = rot90(cur); }
  return out;
}
function bestIoU(a, b) {
  const A = trim(a), aBits = toBits(A), aRows = A.length;
  let best = 0;
  for (const t of transformsOf(b)) {
    const tBits = toBits(t), tRows = t.length;
    const drLo = -2, drHi = aRows - tRows + 2;
    const dcLo = -2, dcHi = A[0].length - t[0].length + 2;
    for (let dr = drLo; dr <= drHi; dr++) {
      for (let dc = dcLo; dc <= dcHi; dc++) {
        let inter = 0, uni = 0;
        const lo = Math.min(0, dr), hi = Math.max(aRows, tRows + dr);
        for (let i = lo; i < hi; i++) {
          const av = (i >= 0 && i < aRows) ? aBits[i] : 0;
          const j = i - dr;
          let bv = (j >= 0 && j < tRows) ? tBits[j] : 0;
          if (bv) bv = dc >= 0 ? (bv << dc) : (bv >>> -dc);
          if (!av && !bv) continue;
          inter += popcount(av & bv); uni += popcount(av | bv);
        }
        if (uni && inter / uni > best) best = inter / uni;
      }
    }
  }
  return best;
}

function isConnected(g) {
  const rows = g.length, cols = g[0].length;
  let sr = -1, sc = -1, total = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
    if (g[r][c]) { total++; if (sr < 0) { sr = r; sc = c; } }
  if (!total) return false;
  const seen = new Set([sr + ',' + sc]); const st = [[sr, sc]];
  while (st.length) {
    const [r, c] = st.pop();
    for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || !g[nr][nc]) continue;
      const k = nr + ',' + nc; if (seen.has(k)) continue;
      seen.add(k); st.push([nr, nc]);
    }
  }
  return seen.size === total;
}
function hasEnclosedHole(g) {
  const rows = g.length, cols = g[0].length;
  const seen = emptyGrid(rows + 2, cols + 2); const st = [[0, 0]]; seen[0][0] = 1;
  const filled = (r, c) => (r < 1 || c < 1 || r > rows || c > cols) ? false : !!g[r - 1][c - 1];
  while (st.length) {
    const [r, c] = st.pop();
    for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr > rows + 1 || nc > cols + 1) continue;
      if (seen[nr][nc] || filled(nr, nc)) continue;
      seen[nr][nc] = 1; st.push([nr, nc]);
    }
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
    if (!g[r][c] && !seen[r + 1][c + 1]) return true;
  return false;
}
/* Reject shapes with 1-cell hairs or diagonal-only pinches:
   they render as slivers and read as drawing artefacts. */
function isChunky(g, minRun) {
  const rows = g.length, cols = g[0].length;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (!g[r][c]) continue;
    let h = 1, v = 1;
    for (let k = c - 1; k >= 0 && g[r][k]; k--) h++;
    for (let k = c + 1; k < cols && g[r][k]; k++) h++;
    for (let k = r - 1; k >= 0 && g[k][c]; k--) v++;
    for (let k = r + 1; k < rows && g[k][c]; k++) v++;
    if (h < minRun && v < minRun) return false;
  }
  return true;
}
function isSaneOutline(g, minRun) {
  const t = trim(g);
  return area(t) >= 12 && isConnected(t) && t.length >= 3 && t[0].length >= 3
      && isChunky(t, minRun || 2);
}

/* ============================================================
   Boundary tracing -> real polygons (long edges, no cell seams)
   ============================================================ */
function tracePolygons(g) {
  const rows = g.length, cols = g[0].length;
  const on = (r, c) => (r >= 0 && c >= 0 && r < rows && c < cols) ? g[r][c] : 0;
  const edges = new Map();               // "x,y" -> [ [x2,y2], ... ]
  const push = (a, b) => {
    const k = a[0] + ',' + a[1];
    if (!edges.has(k)) edges.set(k, []);
    edges.get(k).push(b);
  };
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (!g[r][c]) continue;
    if (!on(r - 1, c)) push([c, r], [c + 1, r]);
    if (!on(r, c + 1)) push([c + 1, r], [c + 1, r + 1]);
    if (!on(r + 1, c)) push([c + 1, r + 1], [c, r + 1]);
    if (!on(r, c - 1)) push([c, r + 1], [c, r]);
  }
  const loops = [];
  while (edges.size) {
    const startKey = edges.keys().next().value;
    let cur = startKey.split(',').map(Number);
    const loop = [cur];
    while (true) {
      const k = cur[0] + ',' + cur[1];
      const outs = edges.get(k);
      if (!outs || !outs.length) break;
      const nxt = outs.pop();
      if (!outs.length) edges.delete(k);
      cur = nxt;
      if (cur[0] === loop[0][0] && cur[1] === loop[0][1]) break;
      loop.push(cur);
    }
    if (loop.length >= 4) loops.push(simplify(loop));
  }
  return loops;
}
function simplify(pts) {
  const out = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p = pts[(i - 1 + n) % n], q = pts[i], r = pts[(i + 1) % n];
    const cross = (q[0] - p[0]) * (r[1] - q[1]) - (q[1] - p[1]) * (r[0] - q[0]);
    if (cross !== 0) out.push(q);
  }
  return out.length >= 3 ? out : pts;
}

/* ============================================================
   Feature-scale distractors
   ============================================================ */
function bandScale(rng, g, mag) {
  const t = trim(g);
  const horiz = rng() < 0.5;
  const src = horiz ? t : rot90(t);
  const rows = src.length;
  const k = Math.max(1, Math.round(rows * (0.14 + mag * 0.26)));
  const at = ri(rng, Math.max(1, rows - k));
  const out = [];
  const grow = rng() < 0.5;
  for (let r = 0; r < rows; r++) {
    out.push(src[r].slice());
    if (grow && r === at) for (let i = 0; i < k; i++) out.push(src[r].slice());
  }
  let res = out;
  if (!grow) {
    res = [];
    for (let r = 0; r < rows; r++) if (r < at || r >= at + k) res.push(src[r].slice());
    if (res.length < 3) return null;
  }
  return horiz ? res : rot90(rot90(rot90(res)));
}

/* Fill a notch: find an empty rectangle biting into the shape and solidify it. */
function fillNotch(rng, g, mag) {
  const t = cloneGrid(trim(g));
  const rows = t.length, cols = t[0].length;
  const cands = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (t[r][c]) continue;
    let nb = 0;
    for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && t[nr][nc]) nb++;
    }
    if (nb >= 2) cands.push([r, c]);
  }
  if (!cands.length) return null;
  const [r0, c0] = pick(rng, cands);
  const span = 1 + Math.round(mag * 3);
  const h = rint(rng, 1, span), w = rint(rng, 1, span);
  for (let r = r0; r < Math.min(rows, r0 + h); r++)
    for (let c = c0; c < Math.min(cols, c0 + w); c++) t[r][c] = 1;
  return t;
}

/* Carve a new notch in from an edge. */
function carveNotch(rng, g, mag) {
  const t = cloneGrid(trim(g));
  const rows = t.length, cols = t[0].length;
  const side = ri(rng, 4);
  const lim = Math.min(rows, cols);
  const depth = rint(rng, 1, Math.max(1, Math.round(lim * (0.12 + mag * 0.45))));
  const width = rint(rng, 1, Math.max(1, Math.round(lim * (0.12 + mag * 0.40))));
  if (side === 0) { const c0 = ri(rng, Math.max(1, cols - width)); for (let r = 0; r < depth; r++) for (let c = c0; c < c0 + width && c < cols; c++) t[r][c] = 0; }
  else if (side === 1) { const c0 = ri(rng, Math.max(1, cols - width)); for (let r = rows - depth; r < rows; r++) if (r >= 0) for (let c = c0; c < c0 + width && c < cols; c++) t[r][c] = 0; }
  else if (side === 2) { const r0 = ri(rng, Math.max(1, rows - width)); for (let c = 0; c < depth; c++) for (let r = r0; r < r0 + width && r < rows; r++) t[r][c] = 0; }
  else { const r0 = ri(rng, Math.max(1, rows - width)); for (let c = cols - depth; c < cols; c++) if (c >= 0) for (let r = r0; r < r0 + width && r < rows; r++) t[r][c] = 0; }
  return t;
}

/* Extend a limb outward: right features, impossible combination. */
function growLimb(rng, g, mag) {
  const t = trim(g);
  const rows = t.length, cols = t[0].length;
  const pad = emptyGrid(rows + 6, cols + 6);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) pad[r + 3][c + 3] = t[r][c];
  const side = ri(rng, 4);
  const len = rint(rng, 1, Math.max(1, 1 + Math.round(mag * 2)));
  const wid = rint(rng, 1, Math.max(1, Math.round(Math.min(rows, cols) * (0.12 + mag * 0.35))));
  if (side === 0) { const c0 = 3 + ri(rng, Math.max(1, cols - wid)); for (let r = 3 - len; r < 3; r++) for (let c = c0; c < c0 + wid; c++) pad[r][c] = 1; }
  else if (side === 1) { const c0 = 3 + ri(rng, Math.max(1, cols - wid)); for (let r = rows + 3; r < rows + 3 + len; r++) for (let c = c0; c < c0 + wid; c++) pad[r][c] = 1; }
  else if (side === 2) { const r0 = 3 + ri(rng, Math.max(1, rows - wid)); for (let c = 3 - len; c < 3; c++) for (let r = r0; r < r0 + wid; r++) pad[r][c] = 1; }
  else { const r0 = 3 + ri(rng, Math.max(1, rows - wid)); for (let c = cols + 3; c < cols + 3 + len; c++) for (let r = r0; r < r0 + wid; r++) pad[r][c] = 1; }
  return pad;
}

/* Punch an interior rectangle -> floating island -> impossible aperture. */
function islandTrap(rng, g, mag) {
  const t = cloneGrid(trim(g));
  const rows = t.length, cols = t[0].length;
  if (rows < 5 || cols < 5) return null;
  const h = rint(rng, 1, Math.max(1, Math.round(rows / 3 * (0.4 + mag))));
  const w = rint(rng, 1, Math.max(1, Math.round(cols / 3 * (0.4 + mag))));
  const tries = [];
  for (let r = 1; r + h < rows; r++) for (let c = 1; c + w < cols; c++) tries.push([r, c]);
  for (let i = tries.length - 1; i > 0; i--) { const j = ri(rng, i + 1); [tries[i], tries[j]] = [tries[j], tries[i]]; }
  for (const [r0, c0] of tries) {
    let solid = true;
    for (let r = r0 - 1; r <= r0 + h && solid; r++)
      for (let c = c0 - 1; c <= c0 + w; c++) if (!t[r][c]) { solid = false; break; }
    if (!solid) continue;
    const cp = cloneGrid(t);
    for (let r = r0; r < r0 + h; r++) for (let c = c0; c < c0 + w; c++) cp[r][c] = 0;
    if (hasEnclosedHole(cp)) return cp;
  }
  return null;
}

const TRAPS = {
  MIRROR: { label: 'Near-mirror',
    note: 'Displayed as the mirror image of the key, but subtly altered. Mirroring IS legal for apertures - so if it were a true mirror it would also be correct. Two options that are exact mirrors of each other are therefore both wrong; this one is a mirror that does not quite match.' },
  FILL:   { label: 'Dropped feature',
    note: 'A real view with a notch filled in. The most common miss - almost all of it is correct, so it reads as familiar.' },
  CARVE:  { label: 'Added notch',
    note: 'A real view with an extra bite taken out. The object would still pass, but an aperture must match a view exactly.' },
  LIMB:   { label: 'Impossible combination',
    note: 'Real features from this object, extended into an outline no single view produces.' },
  SCALE:  { label: 'Wrong scale',
    note: 'Correct shape, wrong proportions - one band stretched or compressed. Caught only by comparing dimensions, never by outline.' },
  ISLAND: { label: 'Impossible aperture (island)',
    note: 'Contains a floating interior region. A hole cut in a plate cannot have a disconnected island - invalid on sight, a free elimination.' },
  FOREIGN:{ label: 'Unrelated silhouette',
    note: 'A genuine view of a different solid. Usually eliminable on overall footprint alone.' }
};

/* ============================================================
   Item assembly
   ============================================================ */
const DIFFICULTY = {
  easy:   { N: 11, blocks: 1, slots: 1, holes: 1, minS: 4, maxS: 7, minRun: 2,
            pool: ['ISLAND','FOREIGN','SCALE','FILL','CARVE','MIRROR'], targets: [0.74, 0.70, 0.60, 0.50] },
  medium: { N: 10, blocks: 2, slots: 2, holes: 1, minS: 3, maxS: 6, minRun: 2,
            pool: ['FILL','CARVE','SCALE','FOREIGN','LIMB','ISLAND','MIRROR'], targets: [0.84, 0.80, 0.68, 0.57] },
  hard:   { N: 12, blocks: 3, slots: 2, holes: 1, minS: 3, maxS: 7, minRun: 2,
            pool: ['FILL','CARVE','LIMB','SCALE','ISLAND','MIRROR'], targets: [0.90, 0.86, 0.74, 0.63] },
  brutal: { N: 14, blocks: 3, slots: 3, holes: 2, minS: 3, maxS: 8, minRun: 2,
            pool: ['FILL','CARVE','LIMB','SCALE','ISLAND','MIRROR'], targets: [0.93, 0.90, 0.80, 0.68] }
};

function applyTransform(g, turns, flip) {
  let out = trim(g);
  for (let i = 0; i < turns; i++) out = rot90(out);
  if (flip) out = flipH(out);
  return trim(out);
}
function randomTransform(rng, g) {
  return applyTransform(g, ri(rng, 4), rng() < 0.5);
}

function makeCandidate(rng, name, sils, cfg, mag, key) {
  if (name === 'MIRROR') {
    const g = rng() < 0.5 ? fillNotch(rng, key, mag) : carveNotch(rng, key, mag);
    return g;
  }
  const src = sils[ri(rng, 3)];
  if (name === 'FILL')    return fillNotch(rng, src, mag);
  if (name === 'CARVE')   return carveNotch(rng, src, mag);
  if (name === 'LIMB')    return growLimb(rng, src, mag);
  if (name === 'SCALE')   return bandScale(rng, src, mag);
  if (name === 'ISLAND')  return islandTrap(rng, src, mag);
  if (name === 'FOREIGN') { const o = genSolid(rng, cfg); return o ? silhouette(o, ri(rng, 3)) : null; }
  return null;
}

function buildItem(seed, difficulty) {
  const cfg = DIFFICULTY[difficulty] || DIFFICULTY.medium;
  const rng = makeRng(seed);

  for (let attempt = 0; attempt < 300; attempt++) {
    let S = genSolid(rng, cfg);
    if (!S) continue;
    S = randomlyOrient(rng, S);

    const sils = [0, 1, 2].map(a => silhouette(S, a));
    if (!sils.every(g => isSaneOutline(g, cfg.minRun))) continue;
    if (sils.some(hasEnclosedHole)) continue;
    const cans = sils.map(canonical);
    if (new Set(cans).size !== 3) continue;
    if (sils.some(s => area(s) === s.length * s[0].length)) continue;

    const truth = new Set(cans);
    const answerAxis = ri(rng, 3);
    const answer = sils[answerAxis];
    const keyArea = area(answer);
    const used = new Set([canonical(answer)]);

    // Balance the key's area rank: choose uniformly how many distractors
    // must be smaller than it, so "never pick the biggest" carries no signal.
    const nSmaller = ri(rng, 5);
    const sides = [];
    for (let i = 0; i < 4; i++) sides.push(i < nSmaller ? -1 : +1);
    for (let i = sides.length - 1; i > 0; i--) { const j = ri(rng, i + 1); [sides[i], sides[j]] = [sides[j], sides[i]]; }

    // Slot i must land near targets[i]; which trap fills it is decided by
    // whichever type can hit that confusability, so no trap owns "the twin".
    const pool = cfg.pool.slice();
    for (let i = pool.length - 1; i > 0; i--) { const j = ri(rng, i + 1); [pool[i], pool[j]] = [pool[j], pool[i]]; }

    const chosen = [];
    let ok = true;
    for (let slot = 0; slot < 4 && ok; slot++) {
      const target = cfg.targets[slot];
      const side = sides[slot];
      let best = null, bestErr = Infinity, bestTrap = null, bestIdx = -1;

      for (let pi = 0; pi < pool.length; pi++) {
        const name = pool[pi];
        for (let tries = 0; tries < 15; tries++) {
          // magnitude sweep: small edits -> high IoU, large edits -> low
          const mag = Math.min(1, (tries + rng() * 0.9) / 15);
          let cand = makeCandidate(rng, name, sils, cfg, mag, answer);
          if (!cand) continue;
          cand = trim(cand);
          const wantHole = (name === 'ISLAND');
          if (hasEnclosedHole(cand) !== wantHole) continue;
          if (!wantHole && !isSaneOutline(cand, cfg.minRun)) continue;
          if (wantHole && (area(cand) < 12 || !isConnected(cand))) continue;
          const cc = canonical(cand);
          if (truth.has(cc) || used.has(cc)) continue;
          const a = area(cand);
          if (a === keyArea) continue;
          if ((a < keyArea ? -1 : +1) !== side) continue;
          const iou = bestIoU(answer, cand);
          if (iou >= 0.995) continue;                 // visually identical - unfair
          if (iou > target + 0.06) continue;           // don't overshoot the difficulty band
          const err = Math.abs(iou - target);
          if (err < bestErr) { bestErr = err; best = cand; bestTrap = name; bestIdx = pi; }
        }
        if (bestErr < 0.10) break;                    // first type that fits the band wins
      }
      if (!best) { ok = false; break; }
      used.add(canonical(best));
      pool.splice(bestIdx, 1);
      chosen.push({ grid: best, trap: bestTrap });
    }
    if (!ok) continue;

    // The key gets a random presentation; the near-mirror distractor is
    // presented as that presentation's mirror, so the student has to decide
    // whether it is a legal mirror or a genuinely different outline.
    const kTurns = ri(rng, 4), kFlip = rng() < 0.5;
    const options = [{ grid: applyTransform(answer, kTurns, kFlip), correct: true, trap: null, axis: answerAxis }];
    for (const c of chosen) {
      const g = c.trap === 'MIRROR'
        ? applyTransform(c.grid, kTurns, !kFlip)
        : randomTransform(rng, c.grid);
      options.push({ grid: g, correct: false, trap: c.trap, axis: null });
    }

    for (let i = options.length - 1; i > 0; i--) {
      const j = ri(rng, i + 1); [options[i], options[j]] = [options[j], options[i]];
    }
    return { seed, difficulty, solid: S, N: S.N, options,
             answerIndex: options.findIndex(o => o.correct), answerAxis, trueSilhouettes: sils };
  }
  return null;
}



/* ===================== TEST-MODE ADDITIONS ===================== */
/* Outline evidence, per silhouette axis (0 = along x / end, 1 = along y /
   front, 2 = along z / top). Counts outline cells whose state the pictorial
   view cannot support. View direction matches renderObject: (1, 1, 1.087). */
function outlineEvidence(S) {
  const N = S.N, d = [1, 1, 1.087];
  const occ = (x, y, z) => (x < 0 || y < 0 || z < 0 || x >= N || y >= N || z >= N) ? 0 : S.d[idx(S, x, y, z)];
  const blocked = (p) => {
    for (let t = 0.04; t < 3 * N; t += 0.04) {
      const ix = Math.floor(p[0] + d[0] * t), iy = Math.floor(p[1] + d[1] * t), iz = Math.floor(p[2] + d[2] * t);
      if (ix >= N || iy >= N || iz >= N) return false;
      if (occ(ix, iy, iz)) return true;
    }
    return false;
  };
  const S3 = [0.2, 0.5, 0.8];
  const mE = new Map(), mF = new Map(), mH = new Map();
  const emptyVisible = (x, y, z) => {
    const k = x + ',' + y + ',' + z; if (mE.has(k)) return mE.get(k);
    let v = false;
    outer: for (const a of S3) for (const b of S3) for (const c of S3) if (!blocked([x + a, y + b, z + c])) { v = true; break outer; }
    mE.set(k, v); return v;
  };
  const hiddenVoid = (x, y, z) => {               // empty AND every sample ray blocked
    const k = x + ',' + y + ',' + z; if (mH.has(k)) return mH.get(k);
    const v = !occ(x, y, z) && !emptyVisible(x, y, z);
    mH.set(k, v); return v;
  };
  const solidVisible = (x, y, z) => {
    const k = x + ',' + y + ',' + z; if (mF.has(k)) return mF.get(k);
    let v = false;
    outer: for (const f of [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) {
      if (occ(x + f[0], y + f[1], z + f[2])) continue;
      for (const a of S3) for (const b of S3) {
        const p = f[0] ? [x + 1 + 1e-3, y + a, z + b] : f[1] ? [x + a, y + 1 + 1e-3, z + b] : [x + a, y + b, z + 1 + 1e-3];
        if (!blocked(p)) { v = true; break outer; }
      }
    }
    mF.set(k, v); return v;
  };
  // object bounding box (hidden voids only count inside it)
  let bb = [N, N, N, -1, -1, -1];
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) for (let z = 0; z < N; z++) if (occ(x, y, z)) { bb = [Math.min(bb[0], x), Math.min(bb[1], y), Math.min(bb[2], z), Math.max(bb[3], x), Math.max(bb[4], y), Math.max(bb[5], z)]; }
  const inBB = (c) => c[0] >= bb[0] && c[1] >= bb[1] && c[2] >= bb[2] && c[0] <= bb[3] && c[1] <= bb[4] && c[2] <= bb[5];
  const counts = [];
  for (let a = 0; a < 3; a++) {
    const line = (i, j) => { const arr = []; for (let t = 0; t < N; t++) arr.push(a === 0 ? [t, i, j] : a === 1 ? [i, t, j] : [i, j, t]); return arr; };
    const fill = [];
    for (let i = 0; i < N; i++) { fill.push([]); for (let j = 0; j < N; j++) fill[i].push(line(i, j).some((c) => occ(c[0], c[1], c[2]))); }
    const F = (i, j) => (i >= 0 && j >= 0 && i < N && j < N) ? fill[i][j] : false;
    let n = 0;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const nb = [F(i - 1, j), F(i + 1, j), F(i, j - 1), F(i, j + 1)];
      if (!(fill[i][j] ? nb.some((v) => !v) : nb.some((v) => v))) continue;
      const L = line(i, j);
      if (!fill[i][j]) {
        if (!L.some((c) => inBB(c) && hiddenVoid(c[0], c[1], c[2]))) continue;
        if (!L.some((c) => !occ(c[0], c[1], c[2]) && !hiddenVoid(c[0], c[1], c[2]) && inBB(c) && emptyVisible(c[0], c[1], c[2]))) n++;
      } else if (!L.some((c) => occ(c[0], c[1], c[2]) && solidVisible(c[0], c[1], c[2]))) n++;
    }
    counts.push(n);
  }
  return counts;
}

/* symmetry order of an outline under the 8 turns/flips (1, 2, 4 or 8) */
function symmetryOrder(g) {
  const base = gridStr(trim(g));
  return transformsOf(g).filter((t) => gridStr(trim(t)) === base).length;
}

/* how close an outline is to its own mirror image (best IoU over the four
   turns of the flipped outline, small shifts allowed). 1 = mirror-symmetric. */
function mirrorCloseness(g) {
  const A = trim(g), aR = A.length, aC = A[0].length;
  let best = 0, cur = flipH(A);
  for (let r = 0; r < 4; r++) {
    const B = trim(cur), bR = B.length, bC = B[0].length;
    for (let dr = -1; dr <= 1 + Math.max(0, aR - bR); dr++) for (let dc = -1; dc <= 1 + Math.max(0, aC - bC); dc++) {
      let inter = 0, uni = 0;
      const R = Math.max(aR, bR + dr) + 1, Cc = Math.max(aC, bC + dc) + 1;
      for (let i = Math.min(0, dr); i < R; i++) for (let j = Math.min(0, dc); j < Cc; j++) {
        const av = (i >= 0 && j >= 0 && i < aR && j < aC) ? A[i][j] : 0;
        const bi = i - dr, bj = j - dc;
        const bv = (bi >= 0 && bj >= 0 && bi < bR && bj < bC) ? B[bi][bj] : 0;
        if (av && bv) inter++; if (av || bv) uni++;
      }
      if (uni && inter / uni > best) best = inter / uni;
    }
    cur = rot90(cur);
  }
  return best;
}

const TEST_LEVELS = {
  medium: DIFFICULTY.medium, hard: DIFFICULTY.hard, brutal: DIFFICULTY.brutal
};

/* Test-mode item: readable key, near-misses cut from the key, common scale. */
function generate(seed, difficulty) {
  const level = difficulty || 'hard';
  const cfg = TEST_LEVELS[level] || DIFFICULTY.hard;
  const rng = makeRng(seed);
  for (let attempt = 0; attempt < 400; attempt++) {
    let S = genSolid(rng, cfg);
    if (!S) continue;
    S = randomlyOrient(rng, S);
    const sils = [0, 1, 2].map((a) => silhouette(S, a));
    if (!sils.every((g) => isSaneOutline(g, cfg.minRun))) continue;
    if (sils.some(hasEnclosedHole)) continue;
    const cans = sils.map(canonical);
    if (new Set(cans).size !== 3) continue;
    if (sils.some((s) => area(s) === s.length * s[0].length)) continue;
    const ev = outlineEvidence(S);
    const readable = [0, 1, 2].filter((a) => ev[a] === 0);
    if (!readable.length) continue;
    const answerAxis = readable[ri(rng, readable.length)];
    const answer = sils[answerAxis];
    const keyArea = area(answer);
    const truth = new Set(cans);
    const used = new Set([canonical(answer)]);
    const useSize = rng() < 0.35;
    const nSlots = useSize ? 3 : 4;
    const nSmaller = ri(rng, nSlots + 1);
    const sides = [];
    for (let i = 0; i < nSlots; i++) sides.push(i < nSmaller ? -1 : +1);
    for (let i = sides.length - 1; i > 0; i--) { const j = ri(rng, i + 1); [sides[i], sides[j]] = [sides[j], sides[i]]; }
    const pool = cfg.pool.slice();
    for (let i = pool.length - 1; i > 0; i--) { const j = ri(rng, i + 1); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const keySils = [answer, answer, answer];              // near-miss traps are cut from the key
    const chosen = [];
    let ok = true;
    for (let slot = 0; slot < nSlots && ok; slot++) {
      const target = cfg.targets[slot];
      const side = sides[slot];
      let best = null, bestErr = Infinity, bestTrap = null, bestIdx = -1;
      for (let pi = 0; pi < pool.length; pi++) {
        const name = pool[pi];
        for (let tries = 0; tries < 15; tries++) {
          const mag = Math.min(1, (tries + rng() * 0.9) / 15);
          let cand = makeCandidate(rng, name, keySils, cfg, mag, answer);
          if (!cand) continue;
          cand = trim(cand);
          const wantHole = (name === 'ISLAND');
          if (hasEnclosedHole(cand) !== wantHole) continue;
          if (!wantHole && !isSaneOutline(cand, cfg.minRun)) continue;
          if (wantHole && (area(cand) < 12 || !isConnected(cand))) continue;
          const cc = canonical(cand);
          if (truth.has(cc) || used.has(cc)) continue;
          const a = area(cand);
          if (a === keyArea) continue;
          if ((a < keyArea ? -1 : +1) !== side) continue;
          const iou = bestIoU(answer, cand);
          if (iou >= 0.995) continue;
          if (iou > target + 0.06) continue;
          const err = Math.abs(iou - target);
          if (err < bestErr) { bestErr = err; best = cand; bestTrap = name; bestIdx = pi; }
        }
        if (bestErr < 0.10) break;
      }
      if (!best) { ok = false; break; }
      used.add(canonical(best));
      pool.splice(bestIdx, 1);
      chosen.push({ grid: best, trap: bestTrap, scale: 1 });
    }
    if (!ok) continue;
    if (useSize) chosen.push({ grid: answer, trap: 'SIZE', scale: rng() < 0.5 ? 1.32 : 0.74 });
    const kTurns = ri(rng, 4), kFlip = rng() < 0.5;
    const options = [{ grid: applyTransform(answer, kTurns, kFlip), correct: true, trap: null, scale: 1 }];
    for (const c of chosen) {
      const g = c.trap === 'MIRROR' ? applyTransform(c.grid, kTurns, !kFlip) : randomTransform(rng, c.grid);
      options.push({ grid: g, correct: false, trap: c.trap, scale: c.scale });
    }
    for (let i = options.length - 1; i > 0; i--) { const j = ri(rng, i + 1); [options[i], options[j]] = [options[j], options[i]]; }
    const answerIndex = options.findIndex((o) => o.correct);
    return {
      type: 'keyholes', seed,
      prompt: 'The object may be turned any way. Which opening would it pass through exactly?',
      figure: { N: S.N, d: Array.from(S.d) },
      options: options.map((o) => ({ grid: o.grid, scale: o.scale, trap: o.trap })),
      answer: answerIndex,
      meta: { difficulty: level, keyAxis: answerAxis, keySymmetry: symmetryOrder(answer), mirrorCloseness: Math.round(mirrorCloseness(answer) * 100) / 100, traps: options.map((o) => o.trap), evidence: ev }
    };
  }
  throw new Error('keyholes: no item for seed ' + seed);
}

/* ---------- rendering for the test ---------- */
const FACE_AXES = [
  { n: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1], fill: '#E9E6DE' },
  { n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, 1], fill: '#C9C5BA' },
  { n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0], fill: '#FFFFFF' }
];
const add3 = (a, b, s) => [a[0] + b[0] * (s || 1), a[1] + b[1] * (s || 1), a[2] + b[2] * (s || 1)];
const UNIT = 13;                                    // px per voxel edge, object and openings alike
function objectSVG(fig) {
  const N = fig.N, k = UNIT, dd = fig.d;
  const W = k * 0.866, H = k * 0.5, Vv = k * 0.92;
  const P = (p) => [(p[0] - p[1]) * W, (p[0] + p[1]) * H - p[2] * Vv];
  const at = (x, y, z) => (x < 0 || y < 0 || z < 0 || x >= N || y >= N || z >= N) ? 0 : dd[(x * N + y) * N + z];
  const order = [];
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) for (let z = 0; z < N; z++) if (dd[(x * N + y) * N + z]) order.push([x, y, z]);
  order.sort((a, b) => (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]));
  const items = [];
  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
  for (const base of order) {
    for (const F of FACE_AXES) {
      const nb = add3(base, F.n);
      if (at(nb[0], nb[1], nb[2])) continue;
      const c = [nb, add3(nb, F.u), add3(add3(nb, F.u), F.v), add3(nb, F.v)].map(P);
      const cx = (c[0][0] + c[1][0] + c[2][0] + c[3][0]) / 4, cy = (c[0][1] + c[1][1] + c[2][1] + c[3][1]) / 4;
      const inf = c.map((p) => [cx + (p[0] - cx) * 1.03, cy + (p[1] - cy) * 1.03]);
      inf.forEach((p) => { minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]); minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); });
      items.push({ pts: inf, fill: F.fill });
      const flat = (t) => { const a = add3(base, t), b = add3(a, F.n); return at(a[0], a[1], a[2]) && !at(b[0], b[1], b[2]); };
      if (!flat(F.u)) items.push({ a: c[1], b: c[2] });
      if (!flat(add3([0, 0, 0], F.u, -1))) items.push({ a: c[3], b: c[0] });
      if (!flat(F.v)) items.push({ a: c[2], b: c[3] });
      if (!flat(add3([0, 0, 0], F.v, -1))) items.push({ a: c[0], b: c[1] });
    }
  }
  const pad = 8, w = maxX - minX + pad * 2, h = maxY - minY + pad * 2;
  let svg = '<svg class="pat-svg" viewBox="' + (minX - pad).toFixed(1) + ' ' + (minY - pad).toFixed(1) + ' ' + w.toFixed(1) + ' ' + h.toFixed(1) + '" style="max-width:' + Math.round(w) + 'px">';
  for (const o of items) {
    if (o.pts) svg += '<polygon points="' + o.pts.map((p) => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' ') + '" fill="' + o.fill + '"/>';
    else svg += '<line x1="' + o.a[0].toFixed(2) + '" y1="' + o.a[1].toFixed(2) + '" x2="' + o.b[0].toFixed(2) + '" y2="' + o.b[1].toFixed(2) + '" stroke="#111" stroke-width="1.2" stroke-linecap="round"/>';
  }
  return svg + '</svg>';
}
/* every opening shares one viewBox, so CSS scaling keeps them at one scale */
function optionBox(item) {
  let m = 0;
  item.options.forEach((o) => { m = Math.max(m, o.grid.length * o.scale, o.grid[0].length * o.scale); });
  return Math.ceil(m) + 2;
}
function openingSVG(grid, scale, box) {
  const rows = grid.length, cols = grid[0].length, s = scale || 1;
  const ox = (box - cols * s) / 2, oy = (box - rows * s) / 2;
  const loops = tracePolygons(grid);
  const d = loops.map((L) => 'M' + L.map((p) => (ox + p[0] * s).toFixed(3) + ' ' + (oy + p[1] * s).toFixed(3)).join(' L') + ' Z').join(' ');
  return '<svg class="pat-svg" viewBox="0 0 ' + box + ' ' + box + '" style="max-width:' + (box * UNIT) + 'px"><path d="' + d + '" fill="#fff" fill-rule="evenodd" stroke="#111" stroke-width="' + (0.17).toFixed(2) + '" stroke-linejoin="miter"/></svg>';
}
function renderFigure(item) {
  if (item.figure && item.figure.kind === 'machined') return PAT.keyholesCSG.renderFigure(item);
  return '<figure class="pat-panel pat-wide"><div class="pat-paper">' + objectSVG(item.figure) + '</div><figcaption>Object</figcaption></figure>';
}
function renderOption(item, i) {
  if (item.figure && item.figure.kind === 'machined') return PAT.keyholesCSG.renderOption(item, i);
  const o = item.options[i];
  return '<div class="pat-paper pat-small pat-hole">' + openingSVG(o.grid, o.scale, optionBox(item)) + '</div>';
}
/* review: the three true outlines */
function trueOutlines(item) {
  const S = { N: item.figure.N, d: Uint8Array.from(item.figure.d) };
  return [0, 1, 2].map((a) => silhouette(S, a));
}

PAT.keyholes = {
  generate, renderFigure, renderOption, outlineEvidence, symmetryOrder, mirrorCloseness, trueOutlines, openingSVG, objectSVG,
  TRAPS, _legacy: { buildItem, silhouette, canonical, trim, makeRng, genSolid, randomlyOrient, DIFFICULTY }
};
if (typeof module === 'object' && module.exports) module.exports = PAT;

})(typeof self !== 'undefined' ? self : globalThis);
