/*
  pat-solid.js : geometry kernel for the machined-part PAT items (engine v2).

  Solids are small CSG trees over exact primitives, so slanted faces, round
  holes, cylinders, cones and frustums are represented exactly (no voxels):
    {t:'box',  lo:[x,y,z], hi:[x,y,z]}
    {t:'hs',   lo, hi, planes:[[nx,ny,nz,d], ...]}   box AND every n.p <= d
    {t:'cyl',  ax:0|1|2, c:[c1,c2], r, s0, s1}       axis-aligned cylinder
    {t:'cone', ax, c, r0, r1, s0, s1}                frustum (r1 may be 0)
    {op:'u'|'i'|'d', a:[node, ...]}                  union / intersection /
                                                     first minus the rest
  c1, c2 are the centre coordinates on axes (ax+1)%3 and (ax+2)%3.

  What the kernel provides:
  - inside(node, p) and exact ray intervals (analytic per primitive, then CSG
    interval arithmetic), each interval end tagged with the surface it lies on.
  - Vector hidden-line removal for any parallel view: candidate curves are every
    plane-plane line, every circle where a round surface meets a plane at right
    angles to its axis, every line where a plane parallel to a cylinder's axis
    meets it, and every contour (silhouette) line of a round surface. Each
    candidate is sampled, kept where it is a real crease of the solid (or a
    contour), and split into visible and hidden runs by casting rays toward
    the viewer; run ends are found by bisection.
  - A raster "line map" for the same view (rays on a fixed grid; a line lies
    between two neighbouring rays whose surface layers differ, visible when the
    first surface differs). Used for fast family searches and to compare
    drawings, with a tolerance only at line junctions.
  Supported intersections are exactly the ones above; the item families never
  let a round surface meet a slanted plane or another round surface.
*/
(function (root) {
  'use strict';
  var PAT = root.PAT || (typeof require === 'function' ? require('./pat-core.js') : null);

  var BIG = 1e6;
  var dot = function (a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; };
  var sub = function (a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; };
  var add = function (a, b, s) { s = s == null ? 1 : s; return [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s]; };
  var cross = function (a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; };
  var len = function (a) { return Math.sqrt(dot(a, a)); };
  var unit = function (a) { var l = len(a); return l < 1e-15 ? [0, 0, 0] : [a[0] / l, a[1] / l, a[2] / l]; };
  var E = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  var r6 = function (x) { var v = Math.round(x * 1e6) / 1e6; return v === 0 ? 0 : v; };

  /* ---------------- primitives ---------------- */
  function isPrim(n) { return !!n.t; }
  function leaves(node, out) {
    out = out || [];
    if (isPrim(node)) out.push(node); else node.a.forEach(function (k) { leaves(k, out); });
    return out;
  }
  function primBox(p) {
    if (p.t === 'box' || p.t === 'hs') return [p.lo.slice(), p.hi.slice()];
    var r = p.t === 'cyl' ? p.r : Math.max(p.r0, p.r1), i = (p.ax + 1) % 3, j = (p.ax + 2) % 3, lo = [0, 0, 0], hi = [0, 0, 0];
    lo[p.ax] = p.s0; hi[p.ax] = p.s1; lo[i] = p.c[0] - r; hi[i] = p.c[0] + r; lo[j] = p.c[1] - r; hi[j] = p.c[1] + r;
    return [lo, hi];
  }
  function coneR(p, s) { return p.r0 + (p.r1 - p.r0) * (s - p.s0) / (p.s1 - p.s0); }
  function primInside(p, q) {
    if (p.t === 'box' || p.t === 'hs') {
      for (var k = 0; k < 3; k++) if (q[k] < p.lo[k] || q[k] > p.hi[k]) return false;
      if (p.t === 'hs') for (var m = 0; m < p.planes.length; m++) { var P = p.planes[m]; if (P[0] * q[0] + P[1] * q[1] + P[2] * q[2] > P[3]) return false; }
      return true;
    }
    var s = q[p.ax];
    if (s < p.s0 || s > p.s1) return false;
    var u = q[(p.ax + 1) % 3] - p.c[0], v = q[(p.ax + 2) % 3] - p.c[1];
    var r = p.t === 'cyl' ? p.r : coneR(p, s);
    return u * u + v * v <= r * r;
  }
  function inside(node, q) {
    if (isPrim(node)) return primInside(node, q);
    var a = node.a, i;
    if (node.op === 'u') { for (i = 0; i < a.length; i++) if (inside(a[i], q)) return true; return false; }
    if (node.op === 'i') { for (i = 0; i < a.length; i++) if (!inside(a[i], q)) return false; return true; }
    if (!inside(a[0], q)) return false;
    for (i = 1; i < a.length; i++) if (inside(a[i], q)) return false;
    return true;
  }

  /* planes of a primitive: outward normal n, inside n.p <= d */
  function primPlanes(p) {
    var out = [], k;
    if (p.t === 'box' || p.t === 'hs') {
      for (k = 0; k < 3; k++) { var m = [0, 0, 0]; m[k] = -1; out.push([m, -p.lo[k]]); var q = [0, 0, 0]; q[k] = 1; out.push([q, p.hi[k]]); }
      if (p.t === 'hs') p.planes.forEach(function (P) { var l = len(P); out.push([[P[0] / l, P[1] / l, P[2] / l], P[3] / l]); });
    } else {
      var a = [0, 0, 0]; a[p.ax] = -1; out.push([a, -p.s0]);
      var b = [0, 0, 0]; b[p.ax] = 1; out.push([b, p.s1]);
    }
    return out;
  }
  function planeKey(n, d) {
    var s = 1;
    for (var k = 0; k < 3; k++) { if (Math.abs(n[k]) > 1e-9) { s = n[k] > 0 ? 1 : -1; break; } }
    return 'P' + r6(n[0] * s) + ',' + r6(n[1] * s) + ',' + r6(n[2] * s) + ',' + r6(d * s);
  }
  function sideKey(p) {
    return p.t === 'cyl' ? 'C' + p.ax + ',' + r6(p.c[0]) + ',' + r6(p.c[1]) + ',' + r6(p.r)
      : 'K' + p.ax + ',' + r6(p.c[0]) + ',' + r6(p.c[1]) + ',' + r6(p.r0) + ',' + r6(p.r1) + ',' + r6(p.s0) + ',' + r6(p.s1);
  }

  function hide(o, k, v) { Object.defineProperty(o, k, { value: v, enumerable: false, writable: true }); return v; }
  /* ---------------- ray intervals ---------------- */
  /* one primitive: at most one interval (all primitives are convex) */
  function prep(p) {
    if (p._pp) return p._pp;
    var pl = primPlanes(p), n = pl.length, P = { nx: new Float64Array(n), ny: new Float64Array(n), nz: new Float64Array(n), d: new Float64Array(n), k: [], round: p.t === 'cyl' || p.t === 'cone' };
    for (var i = 0; i < n; i++) { P.nx[i] = pl[i][0][0]; P.ny[i] = pl[i][0][1]; P.nz[i] = pl[i][0][2]; P.d[i] = pl[i][1]; P.k.push(planeKey(pl[i][0], pl[i][1])); }
    if (P.round) {
      P.sk = sideKey(p); P.i = (p.ax + 1) % 3; P.j = (p.ax + 2) % 3;
      var bb = primBox(p); P.lo = bb[0]; P.hi = bb[1];
    }
    return hide(p, '_pp', P);
  }
  function primRay(p, o, d) {
    var P = prep(p), t0 = -BIG, t1 = BIG, k0 = null, k1 = null, n = P.d.length;
    if (P.round) {          // quick reject against the bounding box (all axes)
      var a0 = -BIG, a1 = BIG;
      for (var q = 0; q < 3; q++) {
        if (d[q] === 0) { if (o[q] < P.lo[q] || o[q] > P.hi[q]) return null; continue; }
        var ta = (P.lo[q] - o[q]) / d[q], tb = (P.hi[q] - o[q]) / d[q];
        if (ta > tb) { var tt = ta; ta = tb; tb = tt; }
        if (ta > a0) a0 = ta; if (tb < a1) a1 = tb;
        if (a0 > a1) return null;
      }
    }
    for (var m = 0; m < n; m++) {
      var nd = P.nx[m] * d[0] + P.ny[m] * d[1] + P.nz[m] * d[2], pd = P.d[m] - (P.nx[m] * o[0] + P.ny[m] * o[1] + P.nz[m] * o[2]);
      if (nd < 1e-13 && nd > -1e-13) { if (pd < 0) return null; continue; }
      var t = pd / nd;
      if (nd > 0) { if (t < t1) { t1 = t; k1 = P.k[m]; } } else if (t > t0) { t0 = t; k0 = P.k[m]; }
      if (t0 >= t1) return null;
    }
    if (!P.round) return [t0, t1, k0, k1];
    var i = P.i, j = P.j, qu = o[i] - p.c[0], qv = o[j] - p.c[1], du = d[i], dv = d[j], sk = P.sk;
    if (p.t === 'cyl') {
      var A = du * du + dv * dv, B = 2 * (qu * du + qv * dv), Cq = qu * qu + qv * qv - p.r * p.r;
      if (A < 1e-14) { if (Cq > 0) return null; return [t0, t1, k0, k1]; }
      var disc = B * B - 4 * A * Cq;
      if (disc <= 0) return null;
      var sq = Math.sqrt(disc), r1 = (-B - sq) / (2 * A), r2 = (-B + sq) / (2 * A);
      if (r1 > t0) { t0 = r1; k0 = sk; }
      if (r2 < t1) { t1 = r2; k1 = sk; }
      return t0 < t1 ? [t0, t1, k0, k1] : null;
    }
    // frustum: convex, so the inside set along the line is one interval; find it from the roots
    var kk = (p.r1 - p.r0) / (p.s1 - p.s0), e = p.r0 + kk * (o[p.ax] - p.s0), g = kk * d[p.ax];
    var A2 = du * du + dv * dv - g * g, B2 = 2 * (qu * du + qv * dv - e * g), C2 = qu * qu + qv * qv - e * e;
    var cands = [[t0, k0], [t1, k1]];
    if (Math.abs(A2) < 1e-14) { if (Math.abs(B2) > 1e-14) cands.push([-C2 / B2, sk]); }
    else { var D2 = B2 * B2 - 4 * A2 * C2; if (D2 > 0) { var s2 = Math.sqrt(D2); cands.push([(-B2 - s2) / (2 * A2), sk], [(-B2 + s2) / (2 * A2), sk]); } }
    cands = cands.filter(function (c) { return c[0] >= t0 - 1e-12 && c[0] <= t1 + 1e-12; }).sort(function (x, y) { return x[0] - y[0]; });
    var res = null;
    for (var c = 0; c + 1 < cands.length; c++) {
      var ta2 = cands[c][0], tb2 = cands[c + 1][0];
      if (tb2 - ta2 < 1e-12) continue;
      var tm = (ta2 + tb2) / 2;
      if (primInside(p, [o[0] + d[0] * tm, o[1] + d[1] * tm, o[2] + d[2] * tm])) {
        if (!res) res = [ta2, tb2, cands[c][1], cands[c + 1][1]];
        else if (Math.abs(res[1] - ta2) < 1e-12) { res[1] = tb2; res[3] = cands[c + 1][1]; }
      }
    }
    return res;
  }
  function ivUnion(A, B) {
    var all = A.concat(B).sort(function (a, b) { return a[0] - b[0]; }), out = [];
    all.forEach(function (iv) {
      var L = out[out.length - 1];
      if (L && iv[0] <= L[1] + 1e-12) { if (iv[1] > L[1]) { L[1] = iv[1]; L[3] = iv[3]; } }
      else out.push(iv.slice());
    });
    return out;
  }
  function ivInter(A, B) {
    var out = [], i = 0, j = 0;
    while (i < A.length && j < B.length) {
      var a = A[i], b = B[j], lo = a[0] > b[0] ? a : b, hi = a[1] < b[1] ? a : b;
      var t0 = Math.max(a[0], b[0]), t1 = Math.min(a[1], b[1]);
      if (t1 - t0 > 1e-12) out.push([t0, t1, lo[2], hi[3]]);
      if (a[1] < b[1]) i++; else j++;
    }
    return out;
  }
  function ivDiff(A, B) {
    var out = [];
    A.forEach(function (a) {
      var cur = [a.slice()];
      B.forEach(function (b) {
        var nx = [];
        cur.forEach(function (c) {
          if (b[1] <= c[0] + 1e-12 || b[0] >= c[1] - 1e-12) { nx.push(c); return; }
          if (b[0] - c[0] > 1e-12) nx.push([c[0], b[0], c[2], b[2]]);
          if (c[1] - b[1] > 1e-12) nx.push([b[1], c[1], b[3], c[3]]);
        });
        cur = nx;
      });
      out = out.concat(cur);
    });
    return out.sort(function (x, y) { return x[0] - y[0]; });
  }
  function ray(node, o, d) {
    if (node.t) { var iv = primRay(node, o, d); return iv && iv[1] - iv[0] > 1e-12 ? [iv] : []; }
    var a = node.a, k, acc;
    if (node.op === 'u') {
      acc = [];
      for (k = 0; k < a.length; k++) { var r = ray(a[k], o, d); if (r.length) acc = acc.length ? ivUnion(acc, r) : r; }
      return acc;
    }
    if (node.op === 'i') {
      acc = ray(a[0], o, d);
      for (k = 1; k < a.length && acc.length; k++) acc = ivInter(acc, ray(a[k], o, d));
      return acc;
    }
    acc = ray(a[0], o, d);
    if (!acc.length) return acc;
    var rest = [];
    for (k = 1; k < a.length; k++) { var r2 = ray(a[k], o, d); if (r2.length) rest = rest.length ? ivUnion(rest, r2) : r2; }
    return rest.length ? ivDiff(acc, rest) : acc;
  }

  /* ---------------- transforms (signed permutations) ---------------- */
  /* T = {m: 3x3 signed permutation, o: offset}; p' = m p + o */
  function tPoint(T, p) { var m = T.m; return [0, 1, 2].map(function (r) { return m[r][0] * p[0] + m[r][1] * p[1] + m[r][2] * p[2] + T.o[r]; }); }
  function tVec(T, v) { var m = T.m; return [0, 1, 2].map(function (r) { return m[r][0] * v[0] + m[r][1] * v[1] + m[r][2] * v[2]; }); }
  function transform(node, T) {
    if (!isPrim(node)) return { op: node.op, a: node.a.map(function (k) { return transform(k, T); }) };
    var p = node;
    if (p.t === 'box' || p.t === 'hs') {
      var A = tPoint(T, p.lo), B = tPoint(T, p.hi);
      var out = { t: p.t, lo: [0, 1, 2].map(function (k) { return Math.min(A[k], B[k]); }), hi: [0, 1, 2].map(function (k) { return Math.max(A[k], B[k]); }) };
      if (p.t === 'hs') out.planes = p.planes.map(function (P) { var n = tVec(T, P); return [n[0], n[1], n[2], P[3] + dot(n, T.o)]; });
      return out;
    }
    var ea = E[p.ax], na = tVec(T, ea), k = na[0] ? 0 : na[1] ? 1 : 2, sg = na[k];
    var C = [0, 0, 0]; C[(p.ax + 1) % 3] = p.c[0]; C[(p.ax + 2) % 3] = p.c[1];
    var C2 = tPoint(T, C), s0 = sg * p.s0 + T.o[k], s1 = sg * p.s1 + T.o[k];
    var q = { t: p.t, ax: k, c: [C2[(k + 1) % 3], C2[(k + 2) % 3]], s0: Math.min(s0, s1), s1: Math.max(s0, s1) };
    if (p.t === 'cyl') q.r = p.r; else { q.r0 = sg > 0 ? p.r0 : p.r1; q.r1 = sg > 0 ? p.r1 : p.r0; }
    return q;
  }
  function bboxOf(node) {
    var lo = [BIG, BIG, BIG], hi = [-BIG, -BIG, -BIG];
    // the solid's extent: sample-free bound from additive leaves of the first operand chain
    (function walk(n, positive) {
      if (isPrim(n)) { if (!positive) return; var b = primBox(n); for (var k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], b[0][k]); hi[k] = Math.max(hi[k], b[1][k]); } return; }
      if (n.op === 'u') n.a.forEach(function (c) { walk(c, positive); });
      else if (n.op === 'd') { walk(n.a[0], positive); }
      else n.a.forEach(function (c) { walk(c, positive); });
    })(node, true);
    return [lo, hi];
  }
  /* tight extent of the actual solid, measured with rays along each axis */
  function extentOf(node, step) {
    var b = bboxOf(node), lo = [BIG, BIG, BIG], hi = [-BIG, -BIG, -BIG], h = step || 0.05;
    for (var ax = 0; ax < 3; ax++) {
      var i = (ax + 1) % 3, j = (ax + 2) % 3, d = E[ax];
      for (var u = b[0][i] + h / 2; u < b[1][i]; u += h) for (var v = b[0][j] + h / 2; v < b[1][j]; v += h) {
        var o = [0, 0, 0]; o[i] = u; o[j] = v;
        var iv = ray(node, o, d);
        if (!iv.length) continue;
        lo[ax] = Math.min(lo[ax], iv[0][0]); hi[ax] = Math.max(hi[ax], iv[iv.length - 1][1]);
      }
    }
    return [lo.map(r6), hi.map(r6)];
  }

  /* ---------------- views ---------------- */
  /* eu, ev: screen axes (u right; v up for axis views, down for the pictorial);
     d: unit direction TOWARD the viewer. */
  var VIEWS = {
    front: { name: 'front', eu: [1, 0, 0], ev: [0, 0, 1], d: [0, -1, 0], axis: 1 },
    top: { name: 'top', eu: [1, 0, 0], ev: [0, 1, 0], d: [0, 0, 1], axis: 2 },
    end: { name: 'end', eu: [0, 1, 0], ev: [0, 0, 1], d: [1, 0, 0], axis: 0 }
  };
  var ISO = (function () { var d = unit([1, 1, 1 / 0.92]); return { name: 'iso', eu: [0.866, -0.866, 0], ev: [0.5, 0.5, -0.92], d: d }; })();
  function proj(V, p) { return [dot(p, V.eu), dot(p, V.ev)]; }
  /* inverse: 3D point on the plane through the origin perpendicular-ish to d with P(p) = (u,v) */
  function unproj(V, u, v) {
    if (!V._inv) {
      var M = [V.eu, V.ev, V.d], det = dot(M[0], cross(M[1], M[2]));
      var c0 = cross(M[1], M[2]), c1 = cross(M[2], M[0]), c2 = cross(M[0], M[1]);
      V._inv = [c0.map(function (x) { return x / det; }), c1.map(function (x) { return x / det; }), c2.map(function (x) { return x / det; })];
    }
    var I = V._inv;
    return [I[0][0] * u + I[1][0] * v, I[0][1] * u + I[1][1] * v, I[0][2] * u + I[1][2] * v];
  }

  /* ---------------- 3D candidate curves ---------------- */
  function curvePoint(c, s) {
    if (c.k === 'L') return add(c.a, sub(c.b, c.a), s);
    var th = c.th0 + (c.th1 - c.th0) * s, p = [0, 0, 0];
    p[c.ax] = c.s; p[(c.ax + 1) % 3] = c.c[0] + c.r * Math.cos(th); p[(c.ax + 2) % 3] = c.c[1] + c.r * Math.sin(th);
    return p;
  }
  function curveTangent(c, s) {
    if (c.k === 'L') return unit(sub(c.b, c.a));
    var th = c.th0 + (c.th1 - c.th0) * s, t = [0, 0, 0];
    t[(c.ax + 1) % 3] = -Math.sin(th); t[(c.ax + 2) % 3] = Math.cos(th);
    return t;
  }
  function curveLen(c) { return c.k === 'L' ? len(sub(c.b, c.a)) : Math.abs(c.th1 - c.th0) * c.r; }
  function perpBasis(t) {
    var a = Math.abs(t[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    var u = unit(cross(t, a)), v = cross(t, u);
    return [u, v];
  }
  /* real edge of the solid at p (curve tangent t): the solid around p, seen in the
     plane across the curve, is neither empty, full, nor a flat half-plane */
  var NDIR = 8;
  function isCrease(S, p, t) {
    var B = perpBasis(t), ins = [], n = 0, eps = 1e-4;
    for (var k = 0; k < NDIR; k++) {
      var th = (k + 0.5) * 2 * Math.PI / NDIR, q = add(add(p, B[0], eps * Math.cos(th)), B[1], eps * Math.sin(th));
      var v = inside(S, q); ins.push(v); if (v) n++;
    }
    if (n === 0 || n === NDIR) return false;
    var tr = [];
    for (var k2 = 0; k2 < NDIR; k2++) if (ins[k2] !== ins[(k2 + 1) % NDIR]) tr.push(k2);
    if (tr.length === 2 && n === NDIR / 2 && (tr[1] - tr[0]) === NDIR / 2) return false;
    return true;
  }
  function clipLine(P0, dir, lo, hi) {
    var t0 = -BIG, t1 = BIG;
    for (var k = 0; k < 3; k++) {
      if (Math.abs(dir[k]) < 1e-12) { if (P0[k] < lo[k] - 1e-9 || P0[k] > hi[k] + 1e-9) return null; continue; }
      var a = (lo[k] - P0[k]) / dir[k], b = (hi[k] - P0[k]) / dir[k];
      if (a > b) { var tt = a; a = b; b = tt; }
      t0 = Math.max(t0, a); t1 = Math.min(t1, b);
    }
    if (t1 - t0 < 1e-6) return null;
    return [add(P0, dir, t0), add(P0, dir, t1)];
  }
  function boxInter(A, B, pad) {
    var lo = [0, 0, 0], hi = [0, 0, 0];
    for (var k = 0; k < 3; k++) { lo[k] = Math.max(A[0][k], B[0][k]) - pad; hi[k] = Math.min(A[1][k], B[1][k]) + pad; if (lo[k] > hi[k]) return null; }
    return [lo, hi];
  }
  function candidates(S) {
    var prims = leaves(S), planes = [], out = [];
    var sb = bboxOf(S), sbox = [sb[0].map(function (x) { return x - 0.01; }), sb[1].map(function (x) { return x + 0.01; })];
    prims.forEach(function (p, pi) {
      var pb = primBox(p);
      primPlanes(p).forEach(function (pl) { planes.push({ n: pl[0], d: pl[1], box: pb, pi: pi }); });
    });
    // plane-plane lines (clipped to both owners' boxes and the solid's box)
    for (var a = 0; a < planes.length; a++) for (var b = a + 1; b < planes.length; b++) {
      var A = planes[a], Bp = planes[b], dir = cross(A.n, Bp.n), dl = len(dir);
      if (dl < 1e-9) continue;
      var bx = boxInter(A.box, Bp.box, 1e-6); if (!bx) continue;
      bx = boxInter(bx, sbox, 0); if (!bx) continue;
      // point on both planes: (d1 (n2 x u) + d2 (u x n1)) / |u|^2 with u = n1 x n2
      var u3 = dir, P0 = add(cross(Bp.n, u3).map(function (x) { return x * A.d; }), cross(u3, A.n), Bp.d).map(function (x) { return x / (dl * dl); });
      dir = [dir[0] / dl, dir[1] / dl, dir[2] / dl];
      var seg = clipLine(P0, dir, bx[0], bx[1]);
      if (seg) out.push({ k: 'L', a: seg[0], b: seg[1] });
    }
    // round primitives
    prims.forEach(function (p) {
      if (p.t !== 'cyl' && p.t !== 'cone') return;
      var pb = primBox(p), ea = E[p.ax];
      planes.forEach(function (pl) {
        if (!boxInter(pb, pl.box, 1e-6)) return;
        var c = dot(pl.n, ea);
        if (Math.abs(Math.abs(c) - 1) < 1e-9) {                       // plane across the axis: a circle
          var s = pl.d / c;
          if (s < p.s0 - 1e-9 || s > p.s1 + 1e-9) return;
          var r = p.t === 'cyl' ? p.r : coneR(p, Math.min(p.s1, Math.max(p.s0, s)));
          if (r < 1e-6) return;
          for (var q = 0; q < 4; q++) out.push({ k: 'C', ax: p.ax, c: p.c, s: s, r: r, th0: q * Math.PI / 2, th1: (q + 1) * Math.PI / 2 });
        } else if (Math.abs(c) < 1e-9 && p.t === 'cyl') {             // plane along the axis: up to two lines
          var i = (p.ax + 1) % 3, j = (p.ax + 2) % 3, ni = pl.n[i], nj = pl.n[j];
          var dd = pl.d - ni * p.c[0] - nj * p.c[1], nn = Math.sqrt(ni * ni + nj * nj);
          var dist = dd / nn; if (Math.abs(dist) > p.r + 1e-9) return;
          var h = Math.sqrt(Math.max(0, p.r * p.r - dist * dist)), fx = ni / nn, fy = nj / nn;
          [h, -h].forEach(function (hh, z) {
            if (z === 1 && h < 1e-9) return;
            var u = p.c[0] + fx * dist - fy * hh, v = p.c[1] + fy * dist + fx * hh;
            var a3 = [0, 0, 0], b3 = [0, 0, 0]; a3[p.ax] = p.s0; b3[p.ax] = p.s1; a3[i] = b3[i] = u; a3[j] = b3[j] = v;
            out.push({ k: 'L', a: a3, b: b3 });
          });
        }
      });
    });
    return out;
  }

  /* sample a parametric state function on [0,1] and return runs with bisected ends */
  function runs(fn, n) {
    var ss = [], st = [];
    for (var k = 0; k < n; k++) { var s = (k + 0.5) / n; ss.push(s); st.push(fn(s)); }
    var out = [], start = 0;
    for (var k2 = 1; k2 <= n; k2++) {
      if (k2 < n && st[k2] === st[start]) continue;
      var a, b;
      if (start > 0) a = bisect(fn, ss[start - 1], ss[start], st[start - 1]);
      else { var f0 = fn(0); a = f0 === st[0] ? 0 : bisect(fn, 0, ss[0], f0); }
      if (k2 < n) b = bisect(fn, ss[k2 - 1], ss[k2], st[k2 - 1]);
      else { var f1 = fn(1); b = f1 === st[n - 1] ? 1 : bisect(fn, ss[n - 1], 1, st[n - 1]); }
      out.push({ s0: a, s1: b, state: st[start] });
      start = k2;
    }
    return out;
  }
  function bisect(fn, a, b, sa) {
    for (var i = 0; i < 16; i++) { var m = (a + b) / 2; if (fn(m) === sa) a = m; else b = m; }
    return (a + b) / 2;
  }

  /* crease pieces: view independent, cached on the solid */
  function creases(S) {
    if (S._creases) return S._creases;
    var out = [];
    candidates(S).forEach(function (c) {
      var L = curveLen(c); if (L < 1e-6) return;
      var n = Math.max(6, Math.ceil(L / 0.1));
      runs(function (s) { return isCrease(S, curvePoint(c, s), curveTangent(c, s)) ? 1 : 0; }, n).forEach(function (r) {
        if (r.state !== 1 || r.s1 - r.s0 < 1e-9) return;
        var piece = c.k === 'L' ? { k: 'L', a: curvePoint(c, r.s0), b: curvePoint(c, r.s1) }
          : { k: 'C', ax: c.ax, c: c.c, s: c.s, r: c.r, th0: c.th0 + (c.th1 - c.th0) * r.s0, th1: c.th0 + (c.th1 - c.th0) * r.s1 };
        if (curveLen(piece) > 1e-4) out.push(piece);
      });
    });
    Object.defineProperty(S, '_creases', { value: out, enumerable: false, writable: true });
    return out;
  }
  /* contour (silhouette) lines of round surfaces for view direction d */
  function contours(S, V) {
    var out = [];
    leaves(S).forEach(function (p) {
      if (p.t !== 'cyl' && p.t !== 'cone') return;
      var i = (p.ax + 1) % 3, j = (p.ax + 2) % 3, A = V.d[i], B = V.d[j], kk = p.t === 'cone' ? -(p.r1 - p.r0) / (p.s1 - p.s0) : 0, Cc = kk * V.d[p.ax];
      // n(th) ~ cos(th) e_i + sin(th) e_j + kk e_ax ; n.d = 0
      var R = Math.sqrt(A * A + B * B);
      if (R < 1e-9 || Math.abs(Cc) >= R) return;
      var phi = Math.atan2(B, A), base = Math.acos(-Cc / R);
      [phi + base, phi - base].forEach(function (th) {
        var nrm = [0, 0, 0]; nrm[i] = Math.cos(th); nrm[j] = Math.sin(th); nrm[p.ax] = kk;
        var a3 = [0, 0, 0], b3 = [0, 0, 0], r0 = p.t === 'cyl' ? p.r : p.r0, r1 = p.t === 'cyl' ? p.r : p.r1;
        a3[p.ax] = p.s0; b3[p.ax] = p.s1;
        a3[i] = p.c[0] + r0 * Math.cos(th); a3[j] = p.c[1] + r0 * Math.sin(th);
        b3[i] = p.c[0] + r1 * Math.cos(th); b3[j] = p.c[1] + r1 * Math.sin(th);
        out.push({ k: 'L', a: a3, b: b3, nrm: unit(nrm) });
      });
    });
    return out;
  }
  function blocked(S, q, d) {
    var iv = ray(S, q, d);
    for (var k = 0; k < iv.length; k++) { var a = Math.max(iv[k][0], 1e-7); if (iv[k][1] - a > 1e-3) return true; }
    return false;
  }
  /* visible at p: from at least one side of the projected curve, nothing is in front */
  function visibleAt(S, V, p, t) {
    var m = cross(V.d, t), ml = len(m);
    if (ml < 1e-9) m = perpBasis(V.d)[0]; else m = [m[0] / ml, m[1] / ml, m[2] / ml];
    var dl = 2e-4;
    return !blocked(S, add(p, m, dl), V.d) || !blocked(S, add(p, m, -dl), V.d);
  }

  /* ---------------- 2D drawing ---------------- */
  /* drawing primitives: {k:'L', a:[u,v], b, dash} {k:'A', c, r, a0, a1, dash} (a1 > a0, ccw in u,v)
     {k:'P', pts:[[u,v]...], dash} */
  function piece2D(V, c, s0, s1, dash) {
    if (c.k === 'L') {
      var A = proj(V, curvePoint(c, s0)), B = proj(V, curvePoint(c, s1));
      if (Math.hypot(A[0] - B[0], A[1] - B[1]) < 1e-6) return null;
      return { k: 'L', a: A.map(r6), b: B.map(r6), dash: dash };
    }
    var ea = E[c.ax], along = Math.abs(dot(ea, V.d));
    var th0 = c.th0 + (c.th1 - c.th0) * s0, th1 = c.th0 + (c.th1 - c.th0) * s1;
    if (along < 1e-6) {
      var P0 = proj(V, curvePoint(c, s0)), P1 = proj(V, curvePoint(c, s1));
      if (Math.hypot(P0[0] - P1[0], P0[1] - P1[1]) < 1e-6) return null;
      return { k: 'L', a: P0.map(r6), b: P1.map(r6), dash: dash };
    }
    var ctr = [0, 0, 0]; ctr[c.ax] = c.s; ctr[(c.ax + 1) % 3] = c.c[0]; ctr[(c.ax + 2) % 3] = c.c[1];
    if (along > 1 - 1e-9) {
      var C2 = proj(V, ctr), e1 = proj(V, E[(c.ax + 1) % 3]), e2 = proj(V, E[(c.ax + 2) % 3]);
      var orient = e1[0] * e2[1] - e1[1] * e2[0];
      var ang = function (th) { return Math.atan2(e1[1] * Math.cos(th) + e2[1] * Math.sin(th), e1[0] * Math.cos(th) + e2[0] * Math.sin(th)); };
      var a0 = ang(orient > 0 ? th0 : th1), a1 = ang(orient > 0 ? th1 : th0);
      while (a1 <= a0 + 1e-12) a1 += 2 * Math.PI;
      return { k: 'A', c: C2.map(r6), r: r6(c.r), a0: a0, a1: a1, dash: dash };
    }
    var pts = [], n = Math.max(4, Math.ceil(Math.abs(th1 - th0) / (Math.PI / 48)));
    for (var k = 0; k <= n; k++) pts.push(proj(V, curvePoint(c, s0 + (s1 - s0) * k / n)));
    return { k: 'P', pts: pts, dash: dash };
  }
  /* full hidden-line drawing of solid S in view V. opts.visibleOnly drops hidden runs. */
  function drawing(S, V, opts) {
    opts = opts || {};
    var prims = [];
    function emit(c, fnState) {
      var L = curveLen(c), n = Math.max(4, Math.ceil(L / 0.05));
      runs(fnState, n).forEach(function (r) {
        if (!r.state || r.s1 - r.s0 < 1e-9) return;
        if (opts.visibleOnly && r.state === 2) return;
        var pc = piece2D(V, c, r.s0, r.s1, r.state === 2);
        if (pc) prims.push(pc);
      });
    }
    creases(S).forEach(function (c) {
      if (c.k === 'L' && len(cross(unit(sub(c.b, c.a)), V.d)) < 1e-9) return;   // seen end-on
      emit(c, function (s) { return visibleAt(S, V, curvePoint(c, s), curveTangent(c, s)) ? 1 : 2; });
    });
    contours(S, V).forEach(function (c) {
      var t = unit(sub(c.b, c.a));
      if (len(cross(t, V.d)) < 1e-9) return;
      emit(c, function (s) {
        var p = curvePoint(c, s);
        if (inside(S, add(p, c.nrm, 1e-4)) === inside(S, add(p, c.nrm, -1e-4))) return 0;
        return visibleAt(S, V, p, t) ? 1 : 2;
      });
    });
    return dedupe(prims);
  }
  function dedupe(prims) {
    var seen = {}, out = [];
    prims.forEach(function (p) {
      var k;
      if (p.k === 'L') { var a = p.a.join(','), b = p.b.join(','); k = 'L' + (a < b ? a + ';' + b : b + ';' + a); }
      else if (p.k === 'A') k = 'A' + p.c.join(',') + ':' + p.r + ':' + S6(p.a0) + ':' + S6(p.a1);
      else return out.push(p);
      k += p.dash ? 'h' : 'v';
      if (!seen[k]) { seen[k] = 1; out.push(p); }
    });
    return out;
  }
  function S6(a) { var x = a % (2 * Math.PI); if (x < 0) x += 2 * Math.PI; return Math.round(x * 1e5); }

  /* ---------------- raster line maps ---------------- */
  /* window: [u0, v0, u1, v1]; R rays per unit. Ray positions are offset off the
     unit grid so no ray ever sits exactly on a feature line. */
  var OFF = 0.0137;
  function grid(win, R) {
    var nu = Math.round((win[2] - win[0]) * R), nv = Math.round((win[3] - win[1]) * R);
    return { nu: nu, nv: nv, R: R, win: win, u: function (i) { return win[0] + (i + 0.5 + OFF) / R; }, v: function (j) { return win[1] + (j + 0.5 + OFF * 1.7) / R; } };
  }
  function layerSig(S, V, u, v) {
    var o = unproj(V, u, v), iv = ray(S, o, V.d), ks = [];
    for (var k = iv.length - 1; k >= 0; k--) { ks.push(iv[k][3], iv[k][2]); }
    return ks;
  }
  /* pair states: 0 none, 1 visible line, 2 hidden line. horizontal pairs then vertical pairs */
  function lineMap(S, V, win, R) {
    var G = grid(win, R), sig = new Array(G.nu * G.nv);
    for (var i = 0; i < G.nu; i++) for (var j = 0; j < G.nv; j++) sig[i * G.nv + j] = layerSig(S, V, G.u(i), G.v(j));
    var H = new Uint8Array((G.nu - 1) * G.nv), Vv = new Uint8Array(G.nu * (G.nv - 1));
    var cmp = function (a, b) {
      var n = Math.max(a.length, b.length);
      for (var k = 0; k < n; k++) if (a[k] !== b[k]) return k === 0 ? 1 : 2;
      return 0;
    };
    for (var i2 = 0; i2 + 1 < G.nu; i2++) for (var j2 = 0; j2 < G.nv; j2++) H[i2 * G.nv + j2] = cmp(sig[i2 * G.nv + j2], sig[(i2 + 1) * G.nv + j2]);
    for (var i3 = 0; i3 < G.nu; i3++) for (var j3 = 0; j3 + 1 < G.nv; j3++) Vv[i3 * (G.nv - 1) + j3] = cmp(sig[i3 * G.nv + j3], sig[i3 * G.nv + j3 + 1]);
    return { G: G, H: H, V: Vv };
  }
  /* rasterize a vector drawing onto the same pairs (odd crossings per primitive) */
  function crossingsOnLine(pr, horiz, c) {
    // intersections of primitive with v = c (horiz) or u = c; returns the other coordinate
    var out = [];
    var segs = pr.k === 'L' ? [[pr.a, pr.b]] : pr.k === 'P' ? pr.pts.slice(1).map(function (q, i) { return [pr.pts[i], q]; }) : null;
    if (segs) {
      segs.forEach(function (sg) {
        var a = sg[0], b = sg[1], ka = horiz ? 1 : 0, kb = horiz ? 0 : 1;
        if ((a[ka] - c) * (b[ka] - c) >= 0) return;
        out.push(a[kb] + (b[kb] - a[kb]) * (c - a[ka]) / (b[ka] - a[ka]));
      });
      return out;
    }
    var k1 = horiz ? 1 : 0, k2 = horiz ? 0 : 1, dd = c - pr.c[k1];
    if (Math.abs(dd) >= pr.r) return out;
    var h = Math.sqrt(pr.r * pr.r - dd * dd);
    [h, -h].forEach(function (x) {
      var pt = [0, 0]; pt[k1] = c; pt[k2] = pr.c[k2] + x;
      var ang = Math.atan2(pt[1] - pr.c[1], pt[0] - pr.c[0]);
      while (ang < pr.a0) ang += 2 * Math.PI;
      while (ang > pr.a0 + 2 * Math.PI) ang -= 2 * Math.PI;
      if (ang < pr.a1) out.push(pt[k2]);
    });
    return out;
  }
  function vectorMap(prims, G) {
    var H = new Uint8Array((G.nu - 1) * G.nv), Vv = new Uint8Array(G.nu * (G.nv - 1));
    prims.forEach(function (pr) {
      var st = pr.dash ? 2 : 1, togH = {}, togV = {};
      for (var j = 0; j < G.nv; j++) crossingsOnLine(pr, true, G.v(j)).forEach(function (u) {
        var i = Math.floor((u - G.win[0]) * G.R - 0.5 - OFF); if (i < 0 || i + 1 >= G.nu) return;
        var k = i * G.nv + j; togH[k] = !togH[k];
      });
      for (var i2 = 0; i2 < G.nu; i2++) crossingsOnLine(pr, false, G.u(i2)).forEach(function (v) {
        var j2 = Math.floor((v - G.win[1]) * G.R - 0.5 - OFF * 1.7); if (j2 < 0 || j2 + 1 >= G.nv) return;
        var k = i2 * (G.nv - 1) + j2; togV[k] = !togV[k];
      });
      Object.keys(togH).forEach(function (k) { if (togH[k] && (H[k] === 0 || H[k] === 2)) H[k] = st === 1 ? 1 : (H[k] || 2); });
      Object.keys(togV).forEach(function (k) { if (togV[k] && (Vv[k] === 0 || Vv[k] === 2)) Vv[k] = st === 1 ? 1 : (Vv[k] || 2); });
    });
    return { G: G, H: H, V: Vv };
  }
  function endpoints(prims) {
    var pts = [];
    prims.forEach(function (p) {
      if (p.k === 'L') pts.push(p.a, p.b);
      else if (p.k === 'P') pts.push(p.pts[0], p.pts[p.pts.length - 1]);
      else if (p.a1 - p.a0 < 2 * Math.PI - 1e-6) pts.push([p.c[0] + p.r * Math.cos(p.a0), p.c[1] + p.r * Math.sin(p.a0)], [p.c[0] + p.r * Math.cos(p.a1), p.c[1] + p.r * Math.sin(p.a1)]);
    });
    return pts;
  }
  /* count of differing pairs that are not within rho of a junction point */
  function mapDiff(A, B, junctions, rho) {
    var G = A.G, n = 0, rr = (rho || 0.08) * (rho || 0.08);
    var near = function (u, v) { for (var k = 0; k < junctions.length; k++) { var dx = junctions[k][0] - u, dy = junctions[k][1] - v; if (dx * dx + dy * dy < rr) return true; } return false; };
    for (var k = 0; k < A.H.length; k++) if (A.H[k] !== B.H[k]) { var i = Math.floor(k / G.nv), j = k % G.nv; if (!near((G.u(i) + G.u(i + 1)) / 2, G.v(j))) n++; }
    for (var k2 = 0; k2 < A.V.length; k2++) if (A.V[k2] !== B.V[k2]) { var i2 = Math.floor(k2 / (G.nv - 1)), j2 = k2 % (G.nv - 1); if (!near(G.u(i2), (G.v(j2) + G.v(j2 + 1)) / 2)) n++; }
    return n;
  }
  function mapKey(M) { var s = ''; for (var k = 0; k < M.H.length; k++) s += M.H[k]; s += '|'; for (var k2 = 0; k2 < M.V.length; k2++) s += M.V[k2]; return s; }

  /* ---------------- outlines (apertures) ---------------- */
  function hits(S, V, u, v) { return ray(S, unproj(V, u, v), V.d).length > 0; }
  /* visible drawing pieces that separate "ray hits the solid" from "ray misses" */
  function outlinePieces(S, V) {
    var out = [], cand = [];
    // every projected crease and contour (an outline piece is visible by definition)
    creases(S).forEach(function (c) {
      if (c.k === 'L' && len(cross(unit(sub(c.b, c.a)), V.d)) < 1e-9) return;
      var pc = piece2D(V, c, 0, 1, false); if (pc) cand.push(pc);
    });
    contours(S, V).forEach(function (c) { var pc = piece2D(V, c, 0, 1, false); if (pc) cand.push(pc); });
    dedupe(cand).forEach(function (pr) {
      var pts = pr.k === 'L' ? [pr.a, pr.b] : pr.k === 'A' ? arcPts(pr, Math.PI / 90) : pr.pts;
      for (var k = 0; k + 1 < pts.length; k++) {
        var a = pts[k], b = pts[k + 1], du = b[0] - a[0], dv = b[1] - a[1], l = Math.hypot(du, dv);
        if (l < 1e-9) continue;
        var nu = -dv / l, nv = du / l;
        var st = function (s) {
          var u = a[0] + du * s, v = a[1] + dv * s;
          return hits(S, V, u + nu * 1e-3, v + nv * 1e-3) !== hits(S, V, u - nu * 1e-3, v - nv * 1e-3) ? 1 : 0;
        };
        runs(st, Math.max(2, Math.ceil(l / 0.1))).forEach(function (r) {
          if (r.state === 1 && (r.s1 - r.s0) * l > 1e-6) out.push([[a[0] + du * r.s0, a[1] + dv * r.s0], [a[0] + du * r.s1, a[1] + dv * r.s1]]);
        });
      }
    });
    return out;
  }
  function arcPts(pr, step) {
    var n = Math.max(2, Math.ceil((pr.a1 - pr.a0) / step)), pts = [];
    for (var k = 0; k <= n; k++) { var a = pr.a0 + (pr.a1 - pr.a0) * k / n; pts.push([pr.c[0] + pr.r * Math.cos(a), pr.c[1] + pr.r * Math.sin(a)]); }
    return pts;
  }
  /* chain short segments into closed loops: snap, split at T-junctions, drop
     duplicate pieces, then walk the graph (every vertex of a clean outline has degree 2) */
  function loops(segs) {
    var reps = [], sn = function (p) {
      for (var i = 0; i < reps.length; i++) if (Math.abs(reps[i][0] - p[0]) < 2e-3 && Math.abs(reps[i][1] - p[1]) < 2e-3) return reps[i];
      var r = [Math.round(p[0] * 1e4) / 1e4, Math.round(p[1] * 1e4) / 1e4]; reps.push(r); return r;
    };
    segs = segs.map(function (s) { return [sn(s[0]), sn(s[1])]; }).filter(function (s) { return s[0][0] !== s[1][0] || s[0][1] !== s[1][1]; });
    var pts = [], seenP = {};
    segs.forEach(function (s) { s.forEach(function (p) { var k = p.join(','); if (!seenP[k]) { seenP[k] = 1; pts.push(p); } }); });
    var atoms = {};
    segs.forEach(function (s) {
      var a = s[0], b = s[1], dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy, ts = [0, 1];
      pts.forEach(function (p) {
        var t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2;
        if (t <= 1e-9 || t >= 1 - 1e-9) return;
        var ex = a[0] + dx * t - p[0], ey = a[1] + dy * t - p[1];
        if (ex * ex + ey * ey < 4e-6) ts.push(t);
      });
      ts.sort(function (x, y) { return x - y; });
      for (var i = 0; i + 1 < ts.length; i++) {
        var P = sn([a[0] + dx * ts[i], a[1] + dy * ts[i]]), Q = sn([a[0] + dx * ts[i + 1], a[1] + dy * ts[i + 1]]);
        var k1 = P.join(','), k2 = Q.join(',');
        if (k1 === k2) continue;
        atoms[k1 < k2 ? k1 + ';' + k2 : k2 + ';' + k1] = [P, Q];
      }
    });
    var list = Object.keys(atoms).map(function (k) { return atoms[k]; }), adj = {};
    list.forEach(function (s, i) { [0, 1].forEach(function (e) { var k = s[e].join(','); (adj[k] = adj[k] || []).push([i, e]); }); });
    // close tiny gaps (cone tips, tangent points): pair up dangling ends closer than 0.03
    var dang = Object.keys(adj).filter(function (k) { return adj[k].length === 1; }).map(function (k) { return k.split(',').map(Number); });
    while (dang.length >= 2) {
      var best = null;
      for (var a = 0; a < dang.length; a++) for (var b = a + 1; b < dang.length; b++) { var dd = Math.hypot(dang[a][0] - dang[b][0], dang[a][1] - dang[b][1]); if (!best || dd < best[2]) best = [a, b, dd]; }
      if (best[2] > 0.03) break;
      var P2 = dang[best[0]], Q2 = dang[best[1]], ni = list.length;
      list.push([P2, Q2]); adj[P2.join(',')].push([ni, 0]); adj[Q2.join(',')].push([ni, 1]);
      dang = dang.filter(function (x, i) { return i !== best[0] && i !== best[1]; });
    }
    if (Object.keys(adj).some(function (k) { return adj[k].length !== 2; })) return null;
    var used = new Array(list.length).fill(false), out = [];
    for (var i = 0; i < list.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      var loop = [list[i][0]], end = list[i][1], start = list[i][0].join(',');
      while (end.join(',') !== start) {
        loop.push(end);
        var nx = adj[end.join(',')].filter(function (x) { return !used[x[0]]; })[0];
        if (!nx) return null;
        used[nx[0]] = true;
        end = list[nx[0]][1 - nx[1]];
      }
      out.push(simplify(loop));
    }
    return out;
  }
  function simplify(pts) {
    var out = [];
    for (var i = 0; i < pts.length; i++) {
      var p = pts[(i - 1 + pts.length) % pts.length], q = pts[i], r = pts[(i + 1) % pts.length];
      var cr = (q[0] - p[0]) * (r[1] - q[1]) - (q[1] - p[1]) * (r[0] - q[0]);
      var l1 = Math.hypot(q[0] - p[0], q[1] - p[1]), l2 = Math.hypot(r[0] - q[0], r[1] - q[1]);
      if (Math.abs(cr) > 1e-7 * Math.max(1e-9, l1 * l2) || l1 < 1e-9) out.push([r6(q[0]), r6(q[1])]);
    }
    return out;
  }
  function pointInLoops(L, u, v) {
    var c = false;
    L.forEach(function (pts) {
      for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        var a = pts[i], b = pts[j];
        if ((a[1] > v) !== (b[1] > v) && u < (b[0] - a[0]) * (v - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
      }
    });
    return c;
  }
  function loopsBox(L) {
    var b = [BIG, BIG, -BIG, -BIG];
    L.forEach(function (pts) { pts.forEach(function (p) { b[0] = Math.min(b[0], p[0]); b[1] = Math.min(b[1], p[1]); b[2] = Math.max(b[2], p[0]); b[3] = Math.max(b[3], p[1]); }); });
    return b;
  }
  function loopsArea(L) {
    var a = 0;
    L.forEach(function (pts) { for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) a += (pts[j][0] + pts[i][0]) * (pts[j][1] - pts[i][1]); });
    return Math.abs(a) / 2;
  }

  /* ---------------- SVG helpers ---------------- */
  function primPath(pr, X, Y) {
    var f = function (x) { return x.toFixed(2); };
    if (pr.k === 'L') return 'M' + f(X(pr.a[0])) + ' ' + f(Y(pr.a[1])) + 'L' + f(X(pr.b[0])) + ' ' + f(Y(pr.b[1]));
    if (pr.k === 'P') return 'M' + pr.pts.map(function (p) { return f(X(p[0])) + ' ' + f(Y(p[1])); }).join('L');
    var pts = arcPts(pr, Math.PI / 60);
    return 'M' + pts.map(function (p) { return f(X(p[0])) + ' ' + f(Y(p[1])); }).join('L');
  }

  PAT.solid = {
    inside: inside, ray: ray, leaves: leaves, transform: transform, tPoint: tPoint, bboxOf: bboxOf, extentOf: extentOf,
    VIEWS: VIEWS, ISO: ISO, proj: proj, unproj: unproj,
    creases: creases, contours: contours, drawing: drawing,
    grid: grid, lineMap: lineMap, vectorMap: vectorMap, endpoints: endpoints, mapDiff: mapDiff, mapKey: mapKey,
    hits: hits, outlinePieces: outlinePieces, loops: loops, pointInLoops: pointInLoops, loopsBox: loopsBox, loopsArea: loopsArea,
    arcPts: arcPts, primPath: primPath, r6: r6
  };
  if (typeof module === 'object' && module.exports) module.exports = PAT;
})(typeof self !== 'undefined' ? self : globalThis);
