/*
  pat-keyholes-csg.js : machined-part apertures (engine v2).

  The object is a profile prism: a w x h end profile pushed back L units, whose
  profile carries slanted and curved features (chamfered or rounded corners, a
  U, V or arched top, a round or square side notch). A second feature runs along
  another axis so the other outlines are not plain rectangles: a slot cut across
  the top, and/or a cylinder, frustum or cone boss on the back face. A blind
  round hole may be drilled as a decoy: holes never change an outline.
  The object is shown in a random one of the 24 turns, drawn as an exact line
  drawing (visible edges only, true curved silhouettes).

  Openings are the exact outlines (arcs and slants) traced from the geometry
  kernel, all drawn at the object's scale. Distractors are outlines of the
  object with one feature dropped, swapped curve for slant, resized, or added,
  plus the right shape at the wrong size; each must differ from all three true
  outlines under every turn and flip.
*/
(function (root) {
  'use strict';
  var PAT = root.PAT || (typeof require === 'function' ? require('./pat-core.js') : null);
  var C = PAT.core, S = PAT.solid;

  /* ---------- the 24 turns (signed permutations with determinant +1) ---------- */
  var TURNS = (function () {
    var out = [], perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
    perms.forEach(function (pm) {
      [[1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1], [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1]].forEach(function (sg) {
        var m = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        for (var r = 0; r < 3; r++) m[r][pm[r]] = sg[r];
        var det = m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
        if (det === 1) out.push(m);
      });
    });
    return out;
  })();
  /* turns that keep the profile face (+y) and the top (+z) toward the viewer (+x, +y, +z) */
  var SHOWN = TURNS.map(function (m, i) { return i; }).filter(function (i) {
    var m = TURNS[i], ey = [m[0][1], m[1][1], m[2][1]], ez = [m[0][2], m[1][2], m[2][2]];
    return ey.every(function (x) { return x >= 0; }) && ez.every(function (x) { return x >= 0; });
  });

  /* ---------- object from parameters (canonical frame: profile in x-z, depth along y) ---------- */
  function build(p) {
    var w = p.w, h = p.h, L = p.L, adds = [{ t: 'box', lo: [0, 0, 0], hi: [w, L, h] }], subs = [];
    var Y0 = -0.5, Y1 = L + 0.5;
    ['tl', 'tr'].forEach(function (c) {
      var f = p[c]; if (!f) return;
      var left = c === 'tl', s = f.s;
      if (f.k === 'chamfer') {
        // remove the corner triangle beyond the line through (corner - s along x) and (corner - s along z)
        // TL: remove z - x >= h - s ; TR: remove z + x >= w + h - s
        var pl = left ? [1, 0, -1, s - h] : [-1, 0, -1, -(w + h - s)];
        subs.push({ t: 'hs', lo: [left ? -0.5 : w - s, Y0, h - s], hi: [left ? s : w + 0.5, Y1, h + 0.5], planes: [pl] });
      } else if (f.k === 'round') {
        var cx = left ? s : w - s;
        subs.push({ op: 'd', a: [{ t: 'box', lo: [left ? -0.5 : w - s, Y0, h - s], hi: [left ? s : w + 0.5, Y1, h + 0.5] }, { t: 'cyl', ax: 1, c: [h - s, cx], r: s, s0: Y0 - 0.5, s1: Y1 + 0.5 }] });
      }
    });
    if (p.mid) {
      var m = p.mid, x0 = w / 2;
      if (m.k === 'U') subs.push({ t: 'box', lo: [x0 - 0.6, Y0, h - 1.2], hi: [x0 + 0.6, Y1, h + 0.5] }, { t: 'cyl', ax: 1, c: [h - 1.2, x0], r: 0.6, s0: Y0, s1: Y1 });
      if (m.k === 'V') subs.push({ t: 'hs', lo: [x0 - 0.8, Y0, h - 1.2], hi: [x0 + 0.8, Y1, h + 0.5], planes: [[-1.5, 0, -1, -(h + 1.5 * x0 - 1.2)], [1.5, 0, -1, 1.5 * x0 + 1.2 - h]] });
      if (m.k === 'arch') adds.push({ t: 'cyl', ax: 1, c: [h, x0], r: 1, s0: 0, s1: L });
    }
    ['sl', 'sr'].forEach(function (c) {
      var f = p[c]; if (!f) return;
      var xs = c === 'sl' ? 0 : w;
      if (f.k === 'semi') subs.push({ t: 'cyl', ax: 1, c: [1, xs], r: 0.6, s0: Y0, s1: Y1 });
      if (f.k === 'sq') subs.push({ t: 'box', lo: [xs - 0.6, Y0, 0.5], hi: [xs + 0.6, Y1, 1.5] });
    });
    if (p.slot) subs.push({ t: 'box', lo: [-0.5, p.slot.y, h - 1], hi: [w + 0.5, p.slot.y + 1, h + 1.5] });
    if (p.boss) {
      var b = p.boss, bx = b.x, bz = b.z;
      if (b.k === 'cyl') adds.push({ t: 'cyl', ax: 1, c: [bz, bx], r: 0.6, s0: L, s1: L + 1 });
      if (b.k === 'frustum') adds.push({ t: 'cone', ax: 1, c: [bz, bx], r0: 0.75, r1: 0.4, s0: L, s1: L + 1 });
      if (b.k === 'cone') adds.push({ t: 'cone', ax: 1, c: [bz, bx], r0: 0.75, r1: 0, s0: L, s1: L + 1.2 });
    }
    if (p.hole) subs.push({ t: 'cyl', ax: 2, c: [p.hole.x, p.hole.y], r: 0.4, s0: p.h - 1, s1: p.h + 0.5 });
    var u = adds.length > 1 ? { op: 'u', a: adds } : adds[0];
    return subs.length ? { op: 'd', a: [u].concat(subs) } : u;
  }
  function orient(node, turn) {
    var T = { m: TURNS[turn], o: [0, 0, 0] }, t1 = S.transform(node, T), b = S.bboxOf(t1);
    return S.transform(t1, { m: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], o: [-b[0][0], -b[0][1], -b[0][2]] });
  }

  /* ---------- random parameters ---------- */
  function randParams(rng) {
    var p = { w: rng.pick([4, 5]), h: rng.pick([3, 4]), L: rng.pick([3, 4]) };
    var cornerKinds = ['chamfer', 'round'];
    var slots = rng.shuffle(['tl', 'tr', 'mid', 'side']).slice(0, rng.pick([2, 2, 3]));
    slots.forEach(function (s) {
      if (s === 'tl' || s === 'tr') p[s] = { k: rng.pick(cornerKinds), s: rng.pick([1, 1.5]) };
      if (s === 'mid' && p.w === 5) p.mid = { k: rng.pick(['U', 'V', 'arch']) };
      if (s === 'side') { var side = rng.chance(0.5) ? 'sl' : 'sr'; p[side] = { k: rng.pick(['semi', 'sq']) }; }
    });
    if (p.sl && p.tl) delete p.sl;
    if (p.sr && p.tr) delete p.sr;
    if (p.mid && p.mid.k === 'arch' && ((p.tl && p.tl.s > 1) || (p.tr && p.tr.s > 1))) p.mid = null;
    if (rng.chance(0.6)) p.slot = { y: rng.pick([0.5, 1, p.L - 2]) };
    if (!p.slot || rng.chance(0.5)) p.boss = { k: rng.pick(['cyl', 'frustum', 'cone']), x: p.w / 2, z: rng.pick([1, 1.2]) };
    if (rng.chance(0.3) && !p.mid && !p.slot) p.hole = { x: p.w / 2, y: p.L / 2 };
    return p;
  }
  function profileCount(p) { return ['tl', 'tr', 'mid', 'sl', 'sr'].filter(function (k) { return p[k]; }).length; }

  /* ---------- outlines ---------- */
  var AXV = [S.VIEWS.end, S.VIEWS.front, S.VIEWS.top];     // silhouette axis 0 = along x, 1 = along y, 2 = along z
  function outline(sol, axis) {
    var L = S.loops(S.outlinePieces(sol, AXV[axis]));
    if (!L || L.length !== 1 || L[0].length < 3) return null;
    var b = S.loopsBox(L);
    return L.map(function (pts) { return pts.map(function (q) { return [S.r6(q[0] - b[0]), S.r6(b[3] - q[1])]; }); });   // y down, origin top-left
  }
  function d4(L, turns, flip) {
    var out = L;
    for (var t = 0; t < turns; t++) out = out.map(function (pts) { return pts.map(function (q) { return [-q[1], q[0]]; }); });
    if (flip) out = out.map(function (pts) { return pts.map(function (q) { return [-q[0], q[1]]; }); });
    var b = S.loopsBox(out);
    return out.map(function (pts) { return pts.map(function (q) { return [S.r6(q[0] - b[0]), S.r6(q[1] - b[1])]; }); });
  }
  /* raster of an outline at R samples per unit */
  function raster(L, R) {
    var b = S.loopsBox(L), nu = Math.round(b[2] * R), nv = Math.round(b[3] * R), g = [];
    for (var j = 0; j < nv; j++) { var row = []; for (var i = 0; i < nu; i++) row.push(S.pointInLoops(L, (i + 0.5) / R, (j + 0.5) / R) ? 1 : 0); g.push(row); }
    return { w: b[2], h: b[3], g: g };
  }
  /* cheap silhouette raster straight from rays (rows top to bottom), trimmed */
  function rayRaster(sol, axis, R) {
    var V = AXV[axis], b = S.bboxOf(sol), ui = V.eu.indexOf(1), vi = V.ev.indexOf(1), g = [];
    for (var v = b[1][vi] - 0.5 / R; v > b[0][vi]; v -= 1 / R) {
      var row = [];
      for (var u = b[0][ui] + 0.5 / R; u < b[1][ui]; u += 1 / R) row.push(S.hits(sol, V, u, v) ? 1 : 0);
      g.push(row);
    }
    return trimG(g);
  }
  function trimG(g) {
    var r0 = 0, r1 = g.length - 1, c0 = 0, c1 = g[0].length - 1;
    var rowE = function (r) { return g[r].every(function (x) { return !x; }); }, colE = function (c) { return g.every(function (row) { return !row[c]; }); };
    while (r0 <= r1 && rowE(r0)) r0++; while (r1 >= r0 && rowE(r1)) r1--;
    if (r0 > r1) return [[0]];
    while (c0 <= c1 && colE(c0)) c0++; while (c1 >= c0 && colE(c1)) c1--;
    return g.slice(r0, r1 + 1).map(function (row) { return row.slice(c0, c1 + 1); });
  }
  function gRot(g) { var R = g.length, Cc = g[0].length, o = []; for (var c = 0; c < Cc; c++) { o.push([]); for (var r = R - 1; r >= 0; r--) o[c].push(g[r][c]); } return o; }
  function gFlip(g) { return g.map(function (r) { return r.slice().reverse(); }); }
  function gIoU(A, B) {
    var best = 0, cur = B;
    for (var t = 0; t < 4; t++) {
      [cur, gFlip(cur)].forEach(function (Bt) {
        for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
          var inter = 0, uni = 0, H = Math.max(A.length, Bt.length + dy) + 2, Wd = Math.max(A[0].length, Bt[0].length + dx) + 2;
          for (var j = Math.min(0, dy); j < H; j++) for (var i = Math.min(0, dx); i < Wd; i++) {
            var a = (A[j] && A[j][i]) ? 1 : 0, bj = j - dy, bi = i - dx, bb = (Bt[bj] && Bt[bj][bi]) ? 1 : 0;
            if (a && bb) inter++; if (a || bb) uni++;
          }
          if (uni && inter / uni > best) best = inter / uni;
        }
      });
      cur = gRot(cur);
    }
    return best;
  }
  function gSame(A, B) {
    var cur = B, ka = JSON.stringify(A);
    for (var t = 0; t < 4; t++) { if (JSON.stringify(cur) === ka || JSON.stringify(gFlip(cur)) === ka) return true; cur = gRot(cur); }
    return false;
  }
  /* best IoU over the 8 turns/flips, small shifts allowed (confusability) */
  function iou(A, B) {
    var best = 0;
    for (var t = 0; t < 4; t++) for (var f = 0; f < 2; f++) {
      var Bt = raster(d4(B.L, t, !!f), 8), Ag = A.r8.g;
      for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) {
        var inter = 0, uni = 0, H = Math.max(Ag.length, Bt.g.length + dy) + 2, Wd = Math.max(Ag[0].length, Bt.g[0].length + dx) + 2;
        for (var j = Math.min(0, dy); j < H; j++) for (var i = Math.min(0, dx); i < Wd; i++) {
          var a = (Ag[j] && Ag[j][i]) ? 1 : 0, bj = j - dy, bi = i - dx, bb = (Bt.g[bj] && Bt.g[bj][bi]) ? 1 : 0;
          if (a && bb) inter++; if (a || bb) uni++;
        }
        if (uni && inter / uni > best) best = inter / uni;
      }
    }
    return best;
  }
  /* same outline (any turn/flip, same scale)? sample comparison away from the boundary */
  function sameOutline(A, B) {
    if (Math.abs(S.loopsArea(A) - S.loopsArea(B)) > 0.05) return false;
    for (var t = 0; t < 4; t++) for (var f = 0; f < 2; f++) {
      var Bt = d4(B, t, !!f), ba = S.loopsBox(A), bb = S.loopsBox(Bt);
      if (Math.abs(ba[2] - bb[2]) > 0.02 || Math.abs(ba[3] - bb[3]) > 0.02) continue;
      var bad = 0;
      for (var v = 0.03125; v < ba[3]; v += 0.0625) for (var u = 0.03125; u < ba[2]; u += 0.0625) if (S.pointInLoops(A, u, v) !== S.pointInLoops(Bt, u, v)) bad++;
      if (bad <= 6) return true;
    }
    return false;
  }

  /* ---------- feature evidence: every feature shows somewhere in the drawing ---------- */
  /* rays of the drawing whose first hit lies on each feature (cut: the empty side of the
     surface is inside the cut; boss: the solid side is inside the boss) */
  function featureEvidence(sol, feats, signs) {
    var V = S.ISO, b = S.bboxOf(sol), corners = [], counts = feats.map(function () { return 0; });
    for (var x = 0; x < 2; x++) for (var y = 0; y < 2; y++) for (var z = 0; z < 2; z++) corners.push(S.proj(V, [b[x][0], b[y][1], b[z][2]]));
    var us = corners.map(function (c) { return c[0]; }), vs = corners.map(function (c) { return c[1]; });
    for (var u = Math.min.apply(null, us) + 0.031; u < Math.max.apply(null, us); u += 0.1) for (var v = Math.min.apply(null, vs) + 0.029; v < Math.max.apply(null, vs); v += 0.1) {
      var o = S.unproj(V, u, v), iv = S.ray(sol, o, V.d);
      if (!iv.length) continue;
      var t = iv[iv.length - 1][1], p = [o[0] + V.d[0] * t, o[1] + V.d[1] * t, o[2] + V.d[2] * t];
      feats.forEach(function (f, i) {
        var q = [p[0] + V.d[0] * 2e-3 * signs[i], p[1] + V.d[1] * 2e-3 * signs[i], p[2] + V.d[2] * 2e-3 * signs[i]];
        if (S.inside(f, q)) counts[i]++;
      });
    }
    return counts;
  }

  var TRAPS2 = { FILL: 'Dropped feature', CURVE: 'Curve and slant swapped', SCALE: 'Wrong proportions', CARVE: 'Added notch', MIRROR: 'Near-mirror', SIZE: 'Right shape, wrong size' };

  function variants(p, rng) {
    var out = [], clone = function () { return JSON.parse(JSON.stringify(p)); };
    ['tl', 'tr', 'mid', 'sl', 'sr', 'slot', 'boss'].forEach(function (k) {
      if (!p[k]) return;
      var q = clone(); delete q[k]; out.push([q, 'FILL']);
    });
    ['tl', 'tr'].forEach(function (k) {
      var q;
      if (p[k]) { q = clone(); q[k].k = p[k].k === 'round' ? 'chamfer' : 'round'; out.push([q, 'CURVE']); q = clone(); q[k].s = p[k].s === 1 ? 1.5 : 1; out.push([q, 'SCALE']); }
      else if (!(k === 'tl' ? p.sl : p.sr)) { q = clone(); q[k] = { k: rng.pick(['chamfer', 'round']), s: 1 }; out.push([q, 'CARVE']); }
    });
    if (p.mid) { var q2 = clone(); q2.mid.k = p.mid.k === 'U' ? 'V' : p.mid.k === 'V' ? 'U' : 'U'; out.push([q2, 'CURVE']); }
    ['sl', 'sr'].forEach(function (k) { if (p[k]) { var q3 = clone(); q3[k].k = p[k].k === 'semi' ? 'sq' : 'semi'; out.push([q3, 'CURVE']); } });
    if (p.boss) { var q4 = clone(); q4.boss.k = p.boss.k === 'cyl' ? 'frustum' : 'cyl'; out.push([q4, 'CURVE']); }
    if (p.slot) { var q5 = clone(); q5.slot.y = p.slot.y === 0.5 ? 1.5 : 0.5; out.push([q5, 'SCALE']); }
    var q6 = clone(); q6.w = p.w === 5 ? 4 : 5; if (!q6.mid || q6.w === 5) out.push([q6, 'SCALE']);
    var q7 = clone(); q7.h = p.h === 4 ? 3 : 4; out.push([q7, 'SCALE']);
    return out;
  }
  function legal(p) {
    if (p.mid && p.w !== 5) return false;
    if ((p.sl && p.tl) || (p.sr && p.tr)) return false;
    if (p.mid && p.mid.k === 'arch' && ((p.tl && p.tl.s > 1) || (p.tr && p.tr.s > 1))) return false;
    if (p.boss && p.boss.z + 0.75 > p.h - 1 && (p.slot || p.mid)) return false;
    return true;
  }

  function generate(seed, level) {
    var rng = C.makeRng(seed);
    for (var att = 0; att < 200; att++) {
      var p = randParams(rng);
      if (!legal(p) || profileCount(p) < 2) continue;
      var turn = rng.pick(SHOWN), sol = orient(build(p), turn);
      // cheap screen first: no plain-rectangle outline, three different outlines
      var scr = [0, 1, 2].map(function (a) { return rayRaster(sol, a, 4); });
      if (scr.some(function (g) { return g.every(function (r) { return r.every(function (x) { return x; }); }); })) continue;
      if (gSame(scr[0], scr[1]) || gSame(scr[0], scr[2]) || gSame(scr[1], scr[2])) continue;
      var sils = [0, 1, 2].map(function (a) { return outline(sol, a); });
      if (sils.some(function (s) { return !s; })) continue;
      // three distinct outlines, none a plain rectangle
      var ok = true;
      for (var a = 0; a < 3 && ok; a++) {
        var bx = S.loopsBox(sils[a]);
        if (Math.abs(S.loopsArea(sils[a]) - bx[2] * bx[3]) < 0.05) ok = false;
        for (var b2 = a + 1; b2 < 3 && ok; b2++) if (sameOutline(sils[a], sils[b2])) ok = false;
      }
      if (!ok) continue;
      // every feature must be seen in the drawing
      var feats = [], signs = [];
      if (sol.op === 'd') { if (sol.a[0].op === 'u') sol.a[0].a.slice(1).forEach(function (f) { feats.push(f); signs.push(-1); }); sol.a.slice(1).forEach(function (f) { feats.push(f); signs.push(1); }); }
      else if (sol.op === 'u') sol.a.slice(1).forEach(function (f) { feats.push(f); signs.push(-1); });
      var hidden = featureEvidence(sol, feats, signs).some(function (n) { return n < 30; });
      if (hidden) continue;
      var keyAxis = rng.int(3), key = sils[keyAxis];
      var keyR = { L: key, r8: raster(key, 8) };
      // candidates
      var cands = [], keyG = rayRaster(sol, keyAxis, 4), silG = [0, 1, 2].map(function (a) { return a === keyAxis ? keyG : rayRaster(sol, a, 4); });
      // screen every variant on cheap rasters, then trace exact outlines for the closest few
      var pre = [];
      variants(p, rng).forEach(function (vt) {
        if (!legal(vt[0])) return;
        var vs = orient(build(vt[0]), turn), g = rayRaster(vs, keyAxis, 4);
        if (silG.some(function (sg) { return gSame(sg, g); })) return;
        var x = gIoU(keyG, g);
        if (x >= 0.985 || x < 0.55) return;
        pre.push({ vs: vs, trap: vt[1], iou: x });
      });
      pre.sort(function (a, b) { return b.iou - a.iou; });
      pre.slice(0, 7).forEach(function (c) {
        var o = outline(c.vs, keyAxis);
        if (!o || sils.some(function (s2) { return sameOutline(s2, o); })) return;
        cands.push({ loops: o, trap: c.trap, iou: c.iou });
      });
      if (cands.length < 3) continue;
      cands.sort(function (x, y) { return y.iou - x.iou; });
      var useSize = rng.chance(0.35), need = useSize ? 3 : 4, chosen = [];
      // closest first, one per trap family where possible, all distinct from each other
      var fams = {};
      cands.forEach(function (c) {
        if (chosen.length >= need) return;
        if (fams[c.trap] && cands.filter(function (z) { return !fams[z.trap]; }).length + chosen.length >= need) return;
        if (chosen.some(function (z) { return sameOutline(z.loops, c.loops); })) return;
        chosen.push(c); fams[c.trap] = 1;
      });
      cands.forEach(function (c) { if (chosen.length < need && chosen.indexOf(c) < 0 && !chosen.some(function (z) { return sameOutline(z.loops, c.loops); })) chosen.push(c); });
      if (chosen.length < need) continue;
      var kTurns = rng.int(4), kFlip = rng.chance(0.5);
      var options = [{ loops: d4(key, kTurns, kFlip), scale: 1, trap: null }];
      chosen.forEach(function (c, i) {
        var mirror = i === 0 && rng.chance(0.4);
        options.push({ loops: mirror ? d4(c.loops, kTurns, !kFlip) : d4(c.loops, rng.int(4), rng.chance(0.5)), scale: 1, trap: mirror ? 'MIRROR' : c.trap });
      });
      if (useSize) options.push({ loops: d4(key, rng.int(4), rng.chance(0.5)), scale: rng.chance(0.5) ? 1.3 : 0.75, trap: 'SIZE' });
      rng.shuffle(options);
      var answer = options.findIndex(function (o) { return !o.trap; });
      var draw = S.drawing(sol, S.ISO, { visibleOnly: true });
      var fill = S.loops(S.outlinePieces(sol, S.ISO));
      return {
        type: 'keyholes', seed: seed,
        prompt: 'The object may be turned any way. Which opening would it pass through exactly?',
        figure: { kind: 'machined', params: p, turn: turn, csg: sol, lines: draw, fill: fill },
        options: options,
        answer: answer,
        meta: { difficulty: level || 'hard', shape: 'machined', keyAxis: keyAxis, keySymmetry: 1, mirrorCloseness: 0, traps: options.map(function (o) { return o.trap; }), evidence: [0, 0, 0] }
      };
    }
    throw new Error('keyholes machined: no item for seed ' + seed);
  }
  /* ---------- rendering ---------- */
  var UNIT = 24;
  function objectSVG(fig) {
    var pts = [];
    fig.lines.forEach(function (p) { (p.k === 'L' ? [p.a, p.b] : p.k === 'P' ? p.pts : S.arcPts(p, 0.2)).forEach(function (q) { pts.push(q); }); });
    var u0 = Math.min.apply(null, pts.map(function (q) { return q[0]; })), u1 = Math.max.apply(null, pts.map(function (q) { return q[0]; }));
    var v0 = Math.min.apply(null, pts.map(function (q) { return q[1]; })), v1 = Math.max.apply(null, pts.map(function (q) { return q[1]; }));
    var pad = 8, X = function (u) { return pad + (u - u0) * UNIT; }, Y = function (v) { return pad + (v - v0) * UNIT; };
    var w = (u1 - u0) * UNIT + pad * 2, h = (v1 - v0) * UNIT + pad * 2;
    var o = '<svg class="pat-svg" viewBox="0 0 ' + w.toFixed(1) + ' ' + h.toFixed(1) + '" style="max-width:' + Math.round(w) + 'px">';
    if (fig.fill) o += '<path d="' + fig.fill.map(function (L) { return 'M' + L.map(function (q) { return X(q[0]).toFixed(2) + ' ' + Y(q[1]).toFixed(2); }).join('L') + 'Z'; }).join('') + '" fill="#fff"/>';
    fig.lines.forEach(function (p) { o += '<path d="' + S.primPath(p, X, Y) + '" fill="none" stroke="#111" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'; });
    return o + '</svg>';
  }
  function optionBox(item) {
    var m = 0;
    item.options.forEach(function (o) { var b = S.loopsBox(o.loops); m = Math.max(m, b[2] * o.scale, b[3] * o.scale); });
    return Math.ceil(m) + 1;
  }
  function openingSVG(loops, scale, box) {
    var b = S.loopsBox(loops), s = scale || 1, ox = (box - b[2] * s) / 2, oy = (box - b[3] * s) / 2;
    var d = loops.map(function (L) { return 'M' + L.map(function (q) { return (ox + q[0] * s).toFixed(3) + ' ' + (oy + q[1] * s).toFixed(3); }).join(' L') + ' Z'; }).join(' ');
    return '<svg class="pat-svg" viewBox="0 0 ' + box + ' ' + box + '" style="max-width:' + (box * UNIT) + 'px"><path d="' + d + '" fill="#fff" fill-rule="evenodd" stroke="#111" stroke-width="0.07" stroke-linejoin="miter"/></svg>';
  }
  function renderFigure(item) { return '<figure class="pat-panel pat-wide"><div class="pat-paper">' + objectSVG(item.figure) + '</div><figcaption>Object</figcaption></figure>'; }
  function renderOption(item, i) { var o = item.options[i]; return '<div class="pat-paper pat-small pat-hole">' + openingSVG(o.loops, o.scale, optionBox(item)) + '</div>'; }

  if (PAT.keyholes && PAT.keyholes.TRAPS && !PAT.keyholes.TRAPS.CURVE) PAT.keyholes.TRAPS.CURVE = { label: 'Curve and slant swapped', note: 'The right outline with one curved edge drawn as a slant or square corner (or the other way round). Arcs stay arcs and slants stay slants in every view.' };
  PAT.keyholesCSG = { generate: generate, renderFigure: renderFigure, renderOption: renderOption, build: build, orient: orient, outline: outline, TURNS: TURNS, SHOWN: SHOWN, TRAPS: TRAPS2, featureEvidence: featureEvidence };
  if (typeof module === 'object' && module.exports) module.exports = PAT;
})(typeof self !== 'undefined' ? self : globalThis);
