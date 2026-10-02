/*
  pat-patternfold-poly.js : pattern folding for non-cube solids (engine v2).

  Solids: rectangular prisms (three different edge lengths), triangular
  prisms (equilateral ends), square pyramids and regular tetrahedra. A net is
  a random spanning tree of the solid's faces, unfolded flat and rejected if
  two faces overlap. The pattern lies printed side up and folds INTO the page,
  so printed faces end up outside (the same rule as the cube items).

  Markings: some faces shaded, a dot, and directional marks (a band along one
  particular edge, or a small triangle in one particular corner), so mirror
  images and turned faces are real traps.

  The answer is the folded solid drawn in a standard pose (one of the 24
  quarter-turn poses of its resting position). Every distractor is checked
  against every pose of the folded solid, including the poses reached through
  the solid's own symmetries, and rejected if any pose draws the same picture.
*/
(function (root) {
  'use strict';
  var PAT = root.PAT || (typeof require === 'function' ? require('./pat-core.js') : null);
  var C = PAT.core;

  var dot = function (a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; };
  var sub = function (a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; };
  var addv = function (a, b, s) { return [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s]; };
  var cross = function (a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; };
  var unit = function (a) { var l = Math.sqrt(dot(a, a)); return [a[0] / l, a[1] / l, a[2] / l]; };
  var mv = function (M, v) { return [dot(M[0], v), dot(M[1], v), dot(M[2], v)]; };
  var mm = function (A, B) { return [0, 1, 2].map(function (i) { return [0, 1, 2].map(function (j) { return A[i][0] * B[0][j] + A[i][1] * B[1][j] + A[i][2] * B[2][j]; }); }); };

  var ROTS = (function () {
    var gens = [[[1, 0, 0], [0, 0, -1], [0, 1, 0]], [[0, 0, 1], [0, 1, 0], [-1, 0, 0]], [[0, -1, 0], [1, 0, 0], [0, 0, 1]]];
    var out = {}, st = [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]];
    while (st.length) { var R = st.pop(), k = JSON.stringify(R); if (out[k]) continue; out[k] = R; gens.forEach(function (G) { st.push(mm(G, R)); }); }
    return Object.keys(out).map(function (k) { return out[k]; });
  })();

  /* ---------- solids (faces CCW seen from outside) ---------- */
  var S3 = Math.sqrt(3);
  function solid(kind, dims) {
    var V, F;
    if (kind === 'box') {
      var a = dims[0], b = dims[1], c = dims[2];
      V = []; for (var i = 0; i < 8; i++) V.push([(i & 1) * a, ((i >> 1) & 1) * b, ((i >> 2) & 1) * c]);
      F = [[0, 2, 6, 4], [1, 3, 7, 5], [0, 1, 5, 4], [2, 3, 7, 6], [0, 1, 3, 2], [4, 5, 7, 6]];
    } else if (kind === 'triprism') {
      var L = dims[0];
      V = [[0, 0, 0], [0, 2, 0], [0, 1, S3], [L, 0, 0], [L, 2, 0], [L, 1, S3]];
      F = [[0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5]];
    } else if (kind === 'pyramid') {
      var h = dims[0];
      V = [[0, 0, 0], [2, 0, 0], [2, 2, 0], [0, 2, 0], [1, 1, h]];
      F = [[0, 1, 2, 3], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]];
    } else {
      V = [[0, 0, 0], [2, 0, 0], [1, S3, 0], [1, S3 / 3, 2 * Math.sqrt(2 / 3)]];
      F = [[0, 1, 2], [0, 1, 3], [1, 2, 3], [2, 0, 3]];
    }
    var cen = [0, 0, 0]; V.forEach(function (v) { cen = addv(cen, v, 1 / V.length); });
    F = F.map(function (f) {
      var n = cross(sub(V[f[1]], V[f[0]]), sub(V[f[2]], V[f[0]]));
      return dot(n, sub(V[f[0]], cen)) < 0 ? f.slice().reverse() : f;
    });
    return { kind: kind, dims: dims, V: V, F: F, cen: cen };
  }
  function faceNormal(pts) { return unit(cross(sub(pts[1], pts[0]), sub(pts[2], pts[0]))); }

  /* ---------- markings (computed from a face's vertex list, in 2D or 3D alike) ---------- */
  function centroid(P) { var c = P[0].map(function () { return 0; }); P.forEach(function (p) { c = c.map(function (x, i) { return x + p[i] / P.length; }); }); return c; }
  function lerp(a, b, t) { return a.map(function (x, i) { return x + (b[i] - x) * t; }); }
  function markPolys(mark, P) {
    if (!mark || mark.k === 'blank' || mark.k === 'solid') return [];
    var n = P.length, c = centroid(P), k = mark.a % n;
    if (mark.k === 'band') return [[P[k], P[(k + 1) % n], lerp(P[(k + 1) % n], c, 0.32), lerp(P[k], c, 0.32)]];
    if (mark.k === 'corner') return [[P[k], lerp(P[k], P[(k + 1) % n], 0.38), lerp(P[k], P[(k + n - 1) % n], 0.38)]];
    // dot: a small regular 12-gon around the centroid, in the face plane
    var e1 = P[1].map(function (x, i) { return x - P[0][i]; }), l1 = Math.sqrt(e1.reduce(function (s, x) { return s + x * x; }, 0));
    e1 = e1.map(function (x) { return x / l1; });
    var e2;
    if (P[0].length === 2) e2 = [-e1[1], e1[0]];
    else { var nn = faceNormal(P); e2 = cross(nn, e1); }
    var out = [];
    for (var i = 0; i < 12; i++) { var t = i * Math.PI / 6; out.push(c.map(function (x, j) { return x + 0.22 * (Math.cos(t) * e1[j] + Math.sin(t) * e2[j]); })); }
    return [out];
  }

  /* ---------- unfolding ---------- */
  function adjacency(sd) {
    var edges = {};
    sd.F.forEach(function (f, fi) { f.forEach(function (v, k) { var w = f[(k + 1) % f.length], key = Math.min(v, w) + '-' + Math.max(v, w); (edges[key] = edges[key] || []).push(fi); }); });
    var adj = sd.F.map(function () { return []; });
    Object.keys(edges).forEach(function (k) { var e = edges[k], vw = k.split('-').map(Number); adj[e[0]].push([e[1], vw]); adj[e[1]].push([e[0], vw]); });
    return adj;
  }
  function rot90(v) { return [-v[1], v[0]]; }
  function place2D(sd, fi, a, b, A2, B2) {
    // map face fi into the plane so that its vertex a -> A2 and b -> B2, printed (outward) side up
    var f = sd.F[fi], P = f.map(function (i) { return sd.V[i]; }), n = faceNormal(P);
    var pa = sd.V[a], e1 = unit(sub(sd.V[b], pa)), e2 = cross(n, e1);
    var dx = B2[0] - A2[0], dy = B2[1] - A2[1], l = Math.hypot(dx, dy), E1 = [dx / l, dy / l], E2 = rot90(E1);
    return f.map(function (i) { var q = sub(sd.V[i], pa), x = dot(q, e1), y = dot(q, e2); return [A2[0] + x * E1[0] + y * E2[0], A2[1] + x * E1[1] + y * E2[1]]; });
  }
  function unfold(sd, rng) {
    var adj = adjacency(sd), n = sd.F.length, root0 = rng.int(n), pos = new Array(n).fill(null), parent = new Array(n).fill(-1);
    // root: its first edge along +x
    var f0 = sd.F[root0], P0 = f0.map(function (i) { return sd.V[i]; }), nn = faceNormal(P0), e1 = unit(sub(P0[1], P0[0])), e2 = cross(nn, e1);
    pos[root0] = P0.map(function (p) { var q = sub(p, P0[0]); return [dot(q, e1), dot(q, e2)]; });
    var frontier = [root0], seen = {}; seen[root0] = 1;
    while (frontier.length) {
      var opts = [];
      frontier.forEach(function (fi) { adj[fi].forEach(function (x) { if (!seen[x[0]]) opts.push([fi, x[0], x[1]]); }); });
      if (!opts.length) break;
      var o = rng.pick(opts), fi = o[0], gj = o[1], vw = o[2];
      // shared edge as it appears in the parent (CCW) is a->b; the child runs b->a
      var pf = sd.F[fi], ia = pf.indexOf(vw[0]), ib = pf.indexOf(vw[1]), a, b;
      if ((ia + 1) % pf.length === ib) { a = vw[0]; b = vw[1]; } else { a = vw[1]; b = vw[0]; }
      var A2 = pos[fi][pf.indexOf(a)], B2 = pos[fi][pf.indexOf(b)];
      pos[gj] = place2D(sd, gj, b, a, B2, A2);
      parent[gj] = fi; seen[gj] = 1; frontier.push(gj);
    }
    return { pos: pos, parent: parent };
  }
  function polysOverlap(A, B) {
    var axes = [];
    [A, B].forEach(function (P) { P.forEach(function (p, i) { var q = P[(i + 1) % P.length]; axes.push([-(q[1] - p[1]), q[0] - p[0]]); }); });
    for (var k = 0; k < axes.length; k++) {
      var ax = axes[k], pa = A.map(function (p) { return p[0] * ax[0] + p[1] * ax[1]; }), pb = B.map(function (p) { return p[0] * ax[0] + p[1] * ax[1]; });
      var L = Math.hypot(ax[0], ax[1]);
      if (Math.max.apply(null, pa) <= Math.min.apply(null, pb) + 1e-6 * L || Math.max.apply(null, pb) <= Math.min.apply(null, pa) + 1e-6 * L) return false;
    }
    return true;
  }

  /* ---------- drawing a pose ---------- */
  function proj(p) { return [(p[1] - p[0]) * 0.866, (p[0] + p[1]) * 0.5 - p[2]]; }
  var VIEWV = unit([1, 1, 1]);
  /* faces: [{P:[3D pts], mark}] ; M: 3x3 (rotation, or rotation times a reflection) */
  function drawPose(faces, M) {
    var out = { faces: [], marks: [], edgeOn: false };
    faces.forEach(function (f) {
      var P = f.P.map(function (p) { return mv(M, p); });
      var n = faceNormal(P), det = M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
      if (det < 0) n = n.map(function (x) { return -x; });
      var c = dot(n, VIEWV);
      if (Math.abs(c) < 0.1) out.edgeOn = true;
      if (c <= 0) return;
      out.faces.push({ pts: P.map(proj), shade: f.mark.k === 'solid', nz: n });
      markPolys(f.mark, P).forEach(function (q) { out.marks.push(q.map(proj)); });
    });
    // normalize: the drawing's box starts at (0, 0)
    var xs = [], ys = [];
    out.faces.forEach(function (f) { f.pts.forEach(function (p) { xs.push(p[0]); ys.push(p[1]); }); });
    var x0 = Math.min.apply(null, xs), y0 = Math.min.apply(null, ys), sh = function (p) { return [Math.round((p[0] - x0) * 1e4) / 1e4, Math.round((p[1] - y0) * 1e4) / 1e4]; };
    out.faces.forEach(function (f) { f.pts = f.pts.map(sh); });
    out.marks = out.marks.map(function (q) { return q.map(sh); });
    return out;
  }
  function sig(d) {
    var r = function (p) { return Math.round(p[0] * 1000) + ':' + Math.round(p[1] * 1000); };
    return d.faces.map(function (f) { return 'F' + (f.shade ? 1 : 0) + f.pts.map(r).sort().join(' '); }).sort().join('/') + '|' + d.marks.map(function (q) { return q.map(r).sort().join(' '); }).sort().join('/');
  }
  /* rotations that map the solid onto itself (about its centroid) */
  function symmetries(sd) {
    var V = sd.V.map(function (v) { return sub(v, sd.cen); }), out = [], keyOf = function (p) { return p.map(function (x) { return Math.round(x * 1e5); }).join(','); };
    var set = {}; V.forEach(function (v) { set[keyOf(v)] = 1; });
    var i0 = 0, i1 = 1, i2 = -1;
    for (var k = 2; k < V.length; k++) if (Math.sqrt(dot(cross(sub(V[1], V[0]), sub(V[k], V[0])), cross(sub(V[1], V[0]), sub(V[k], V[0])))) > 1e-6) { i2 = k; break; }
    var frame = function (a, b, c) { var e1 = unit(sub(b, a)), e3 = unit(cross(sub(b, a), sub(c, a))), e2 = cross(e3, e1); return [e1, e2, e3]; };
    var Fs = frame(V[i0], V[i1], V[i2]), seen = {};
    for (var a = 0; a < V.length; a++) for (var b = 0; b < V.length; b++) for (var c = 0; c < V.length; c++) {
      if (a === b || b === c || a === c) continue;
      var Ft = frame(V[a], V[b], V[c]);
      // Q = Ft^T * Fs  (maps source frame vectors onto target frame vectors)
      var Q = [0, 1, 2].map(function (r) { return [0, 1, 2].map(function (s) { return Ft[0][r] * Fs[0][s] + Ft[1][r] * Fs[1][s] + Ft[2][r] * Fs[2][s]; }); });
      if (!V.every(function (v) { return set[keyOf(mv(Q, v))]; })) continue;
      var key = Q.map(function (r) { return r.map(function (x) { return Math.round(x * 1e5); }).join(','); }).join(';');
      if (!seen[key]) { seen[key] = 1; out.push(Q); }
    }
    return out;
  }
  function centered(faces, sd) { return faces.map(function (f) { return { P: f.P.map(function (p) { return sub(p, sd.cen); }), mark: f.mark }; }); }

  var KINDS = [
    { kind: 'box', dims: [[1, 2, 3], [1, 1, 2], [2, 2, 1], [1, 2, 2]] },
    { kind: 'triprism', dims: [[2.5], [3]] },
    { kind: 'pyramid', dims: [[1.6], [2]] },
    { kind: 'tetra', dims: [[0]] }
  ];

  function generate(seed, opts) {
    opts = opts || {};
    var rng = C.makeRng(seed);
    for (var att = 0; att < 300; att++) {
      var K = opts.kind ? KINDS.filter(function (k) { return k.kind === opts.kind; })[0] : rng.pick(KINDS), dims = rng.pick(K.dims);
      var sd = solid(K.kind, dims), nf = sd.F.length;
      // markings: 1-2 shaded faces, at least two directional marks, maybe a dot
      var kinds = [], nShade = nf >= 5 ? rng.pick([1, 2]) : 1;
      for (var s = 0; s < nShade; s++) kinds.push('solid');
      kinds.push(rng.pick(['band', 'corner']), rng.pick(['band', 'corner']));
      if (rng.chance(0.6)) kinds.push('dot');
      while (kinds.length < nf) kinds.push(rng.chance(0.5) ? rng.pick(['band', 'corner']) : 'blank');
      kinds = rng.shuffle(kinds.slice(0, nf));
      var marks = kinds.map(function (k, i) { return { k: k, a: rng.int(sd.F[i].length) }; });
      var U = unfold(sd, rng);
      if (U.pos.some(function (p) { return !p; })) continue;
      var bad = false;
      for (var i = 0; i < nf && !bad; i++) for (var j = i + 1; j < nf && !bad; j++) if (polysOverlap(U.pos[i], U.pos[j])) bad = true;
      if (bad) continue;
      // turn the whole net by a random quarter turn (never flipped: the printed side stays up)
      var qt = rng.int(4);
      var net = U.pos.map(function (P) { return P.map(function (p) { var q = p; for (var t = 0; t < qt; t++) q = [-q[1], q[0]]; return q; }); });
      var xs = [], ys = []; net.forEach(function (P) { P.forEach(function (p) { xs.push(p[0]); ys.push(p[1]); }); });
      var nx0 = Math.min.apply(null, xs), ny0 = Math.min.apply(null, ys);
      net = net.map(function (P) { return P.map(function (p) { return [Math.round((p[0] - nx0) * 1e6) / 1e6, Math.round((p[1] - ny0) * 1e6) / 1e6]; }); });
      // marked 3D faces, centred on the solid's centroid
      var faces = centered(sd.F.map(function (f, i) { return { P: f.map(function (v) { return sd.V[v]; }), mark: marks[i] }; }), sd);
      var syms = symmetries(sd), valid = {};
      ROTS.forEach(function (R) { syms.forEach(function (Q) { valid[sig(drawPose(faces, mm(R, Q)))] = 1; }); });
      // the answer pose: no face edge-on, at least two marked faces in view, one directional
      var R0 = null;
      for (var tr = 0; tr < 40 && !R0; tr++) {
        var Rc = rng.pick(ROTS), d0 = drawPose(faces, Rc);
        if (d0.edgeOn) continue;
        var vis = faces.filter(function (f) { var n = faceNormal(f.P.map(function (p) { return mv(Rc, p); })); return dot(n, VIEWV) > 0; });
        if (vis.filter(function (f) { return f.mark.k !== 'blank'; }).length >= 2 && vis.some(function (f) { return f.mark.k === 'band' || f.mark.k === 'corner'; })) R0 = Rc;
      }
      if (!R0) continue;
      var key = drawPose(faces, R0), keySig = sig(key);
      var visIdx = faces.map(function (f, i) { return i; }).filter(function (i) { return dot(faceNormal(faces[i].P.map(function (p) { return mv(R0, p); })), VIEWV) > 0; });
      var hidIdx = faces.map(function (f, i) { return i; }).filter(function (i) { return visIdx.indexOf(i) < 0; });
      var cands = [];
      var withMarks = function (fn) { return faces.map(function (f, i) { return { P: f.P, mark: fn(i, f.mark) }; }); };
      cands.push({ d: drawPose(faces, mm(R0, [[-1, 0, 0], [0, 1, 0], [0, 0, 1]])), trap: 'mirror', mirrorOf: true });
      visIdx.forEach(function (i) {
        var m = faces[i].mark;
        if (m.k === 'band' || m.k === 'corner') [1, 2, 3].forEach(function (d) { if (d < faces[i].P.length) cands.push({ d: drawPose(withMarks(function (j, mk) { return j === i ? { k: mk.k, a: mk.a + d } : mk; }), R0), trap: 'rotation' }); });
      });
      visIdx.forEach(function (i) { visIdx.forEach(function (j) { if (i < j) cands.push({ d: drawPose(withMarks(function (k, mk) { return k === i ? faces[j].mark : k === j ? faces[i].mark : mk; }), R0), trap: 'neighbor' }); }); });
      visIdx.forEach(function (i) { hidIdx.forEach(function (j) { if (faces[j].mark.k !== faces[i].mark.k || faces[j].mark.a !== faces[i].mark.a) cands.push({ d: drawPose(withMarks(function (k, mk) { return k === i ? faces[j].mark : mk; }), R0), trap: faces[j].mark.k === 'solid' || faces[i].mark.k === 'solid' ? 'shade' : 'hidden' }); }); });
      var byTrap = {}, used = {}; used[keySig] = 1;
      rng.shuffle(cands).forEach(function (cd) { var sg = sig(cd.d); if (valid[sg] || used[sg] || cd.d.edgeOn) return; cd.sig = sg; (byTrap[cd.trap] = byTrap[cd.trap] || []).push(cd); });
      var fams = rng.shuffle(Object.keys(byTrap));
      if (byTrap.mirror) fams = ['mirror'].concat(fams.filter(function (f) { return f !== 'mirror'; }));
      var picked = [], round = 0;
      while (picked.length < 3 && round < 8) {
        fams.forEach(function (fm) { if (picked.length >= 3) return; var l = byTrap[fm]; if (!l || !l[round] || used[l[round].sig]) return; used[l[round].sig] = 1; picked.push(l[round]); });
        round++;
      }
      if (picked.length < 3) continue;
      var strip = function (d) { return { faces: d.faces.map(function (f) { return { pts: f.pts, shade: f.shade, tone: f.nz[2] > 0.5 ? 0 : f.nz[0] > f.nz[1] ? 1 : 2 }; }), marks: d.marks }; };
      var placed = C.placeAnswer(rng, Object.assign(strip(key), { trap: null }), picked.map(function (p) { return Object.assign(strip(p.d), { trap: p.trap }); }));
      return {
        type: 'patternfold', seed: seed,
        prompt: 'Which figure can be formed by folding the pattern? (Printed side faces out.)',
        figure: { kind: 'poly', solid: { kind: sd.kind, dims: sd.dims }, net: net.map(function (P, i) { return { pts: P, shade: marks[i].k === 'solid', marks: markPolys(marks[i], P) }; }) },
        options: placed.options,
        answer: placed.answer,
        meta: { netType: sd.kind === 'box' ? 'prism' : sd.kind === 'triprism' ? 'triangular prism' : sd.kind === 'pyramid' ? 'pyramid' : 'tetrahedron', solid: sd.kind, marks: marks.map(function (m) { return m.k; }), traps: placed.options.map(function (o) { return o.trap; }) }
      };
    }
    throw new Error('patternfold poly: no item for seed ' + seed);
  }

  /* ---------- rendering ---------- */
  var INK = '#3b3b3b', TONES = ['#ffffff', '#e4e4e4', '#cfcfcf'];
  function bboxOf(polys) { var xs = [], ys = []; polys.forEach(function (P) { P.forEach(function (p) { xs.push(p[0]); ys.push(p[1]); }); }); return [Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs), Math.max.apply(null, ys)]; }
  function pts(P, X, Y) { return P.map(function (p) { return X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join(' '); }
  function netSVG(fig) {
    var s = 34, pad = 6, b = bboxOf(fig.net.map(function (f) { return f.pts; })), X = function (x) { return pad + (x - b[0]) * s; }, Y = function (y) { return pad + (b[3] - y) * s; };
    var w = (b[2] - b[0]) * s + pad * 2, h = (b[3] - b[1]) * s + pad * 2, o = '<svg class="pat-svg" viewBox="0 0 ' + w.toFixed(0) + ' ' + h.toFixed(0) + '">';
    fig.net.forEach(function (f) { o += '<polygon points="' + pts(f.pts, X, Y) + '" fill="' + (f.shade ? INK : '#fff') + '" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/>'; });
    fig.net.forEach(function (f) { f.marks.forEach(function (m) { o += '<polygon points="' + pts(m, X, Y) + '" fill="' + INK + '"/>'; }); });
    fig.net.forEach(function (f) { o += '<polygon points="' + pts(f.pts, X, Y) + '" fill="none" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/>'; });
    return o + '</svg>';
  }
  function solidSVG(op) {
    var s = 40, pad = 6, b = bboxOf(op.faces.map(function (f) { return f.pts; })), X = function (x) { return pad + (x - b[0]) * s; }, Y = function (y) { return pad + (y - b[1]) * s; };
    var w = (b[2] - b[0]) * s + pad * 2, h = (b[3] - b[1]) * s + pad * 2, o = '<svg class="pat-svg" viewBox="0 0 ' + w.toFixed(0) + ' ' + h.toFixed(0) + '">';
    op.faces.forEach(function (f) { o += '<polygon points="' + pts(f.pts, X, Y) + '" fill="' + (f.shade ? INK : TONES[f.tone || 0]) + '" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/>'; });
    op.marks.forEach(function (m) { o += '<polygon points="' + pts(m, X, Y) + '" fill="' + INK + '"/>'; });
    op.faces.forEach(function (f) { o += '<polygon points="' + pts(f.pts, X, Y) + '" fill="none" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/>'; });
    return o + '</svg>';
  }
  function renderFigure(item) { return '<figure class="pat-panel pat-wide"><div class="pat-paper">' + netSVG(item.figure) + '</div><figcaption>Pattern</figcaption></figure>'; }
  function renderOption(item, i) { return '<div class="pat-paper pat-small">' + solidSVG(item.options[i]) + '</div>'; }

  PAT.patternfoldPoly = { generate: generate, renderFigure: renderFigure, renderOption: renderOption, solid: solid, markPolys: markPolys, KINDS: KINDS, _internal: { drawPose: drawPose, sig: sig, symmetries: symmetries, ROTS: ROTS } };
  if (typeof module === 'object' && module.exports) module.exports = PAT;
})(typeof self !== 'undefined' ? self : globalThis);
