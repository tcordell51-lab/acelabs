/*
  pat-patternfold.js : Pattern Folding (PAT questions 76-90).

  A flat pattern (one of ALL 11 cube nets, shown in a random turn or flip)
  with markings on its faces. Choose the one cube (A-D) the pattern folds into.
  Any cube orientation counts, exactly as on the DAT, so every distractor is
  checked against all 24 orientations of the folded cube and rejected if any
  orientation draws the same picture.

  World is right-handed: X right, Y up the page, Z toward the viewer. The
  pattern lies printed side up and folds INTO the page, so printed faces end up
  outside. Cube drawings use an isometric view from (+1,+1,+1):
  screen x = (Y - X) * 0.866, screen y = (X + Y) * 0.5 - Z  (+X lower-left,
  +Y lower-right, +Z top).
*/
(function (root) {
  'use strict';
  var PAT = root.PAT || (typeof require === 'function' ? require('./pat-core.js') : null);
  var C = PAT.core;

  /* ---------- vector helpers ---------- */
  function neg(p) { return [-p[0], -p[1], -p[2]]; }
  function add(a, b, k) { return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]; }
  function mv(R, v) { return [R[0][0] * v[0] + R[0][1] * v[1] + R[0][2] * v[2], R[1][0] * v[0] + R[1][1] * v[1] + R[1][2] * v[2], R[2][0] * v[0] + R[2][1] * v[1] + R[2][2] * v[2]]; }
  function mm(A, B) { var Cm = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) for (var k = 0; k < 3; k++) Cm[i][j] += A[i][k] * B[k][j]; return Cm; }
  var ROTS = (function () {
    var gens = [[[1, 0, 0], [0, 0, -1], [0, 1, 0]], [[0, 0, 1], [0, 1, 0], [-1, 0, 0]], [[0, -1, 0], [1, 0, 0], [0, 0, 1]]];
    var out = {}, st = [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]];
    while (st.length) { var R = st.pop(), k = JSON.stringify(R); if (out[k]) continue; out[k] = R; gens.forEach(function (G) { st.push(mm(G, R)); }); }
    return Object.keys(out).map(function (k) { return out[k]; });
  })();

  /* ---------- the 11 cube nets, enumerated (not typed in) ---------- */
  function normCells(cells) {
    var mx = Math.min.apply(null, cells.map(function (c) { return c[0]; })), my = Math.min.apply(null, cells.map(function (c) { return c[1]; }));
    return cells.map(function (c) { return [c[0] - mx, c[1] - my]; }).sort(function (a, b) { return a[1] - b[1] || a[0] - b[0]; });
  }
  function cellsKey(cells) { return normCells(cells).map(function (c) { return c.join(','); }).join(';'); }
  function d4cells(cells) {
    var out = [], cur = cells;
    for (var r = 0; r < 4; r++) {
      out.push(normCells(cur)); out.push(normCells(cur.map(function (c) { return [-c[0], c[1]]; })));
      cur = cur.map(function (c) { return [-c[1], c[0]]; });
    }
    return out;
  }
  function freeKey(cells) { return d4cells(cells).map(cellsKey).sort()[0]; }

  /* frame propagation: fold each cell about its shared edge, into the page */
  var STEP = {
    right: function (f) { return { u: neg(f.n), v: f.v, n: f.u }; },
    left: function (f) { return { u: f.n, v: f.v, n: neg(f.u) }; },
    down: function (f) { return { u: f.u, v: neg(f.n), n: f.v }; },
    up: function (f) { return { u: f.u, v: f.n, n: neg(f.v) }; }
  };
  function foldFrames(net) {
    var map = {}; net.forEach(function (c, i) { map[c[0] + ',' + c[1]] = i; });
    var frames = new Array(net.length).fill(null);
    // anchor = first cell: printed side up = outward +Z; cell a-axis = +X; b-axis (down the page) = -Y
    frames[0] = { u: [1, 0, 0], v: [0, -1, 0], n: [0, 0, 1] };
    var q = [0];
    while (q.length) {
      var i = q.shift(), c = net[i], f = frames[i];
      [[1, 0, 'right'], [-1, 0, 'left'], [0, 1, 'down'], [0, -1, 'up']].forEach(function (d) {
        var j = map[(c[0] + d[0]) + ',' + (c[1] + d[1])];
        if (j == null || frames[j]) return;
        frames[j] = STEP[d[2]](f); q.push(j);
      });
    }
    if (frames.some(function (f) { return !f; })) return null;
    var seen = {};
    for (var k = 0; k < frames.length; k++) { var key = frames[k].n.join(','); if (seen[key]) return null; seen[key] = 1; }
    return frames;
  }
  var NETS = (function () {
    var shapes = { '0,0': [[0, 0]] }, level = [[[0, 0]]];
    for (var n = 2; n <= 6; n++) {
      var next = {}, nl = [];
      level.forEach(function (cells) {
        var occ = {}; cells.forEach(function (c) { occ[c.join(',')] = 1; });
        cells.forEach(function (c) {
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
            var p = [c[0] + d[0], c[1] + d[1]]; if (occ[p.join(',')]) return;
            var nc = normCells(cells.concat([p])), k = freeKey(nc);
            if (next[k]) return; next[k] = 1; nl.push(nc);
          });
        });
      });
      level = nl;
    }
    return level.filter(function (cells) { return foldFrames(cells); });
  })();

  function netType(cells) {
    var occ = {}; cells.forEach(function (c) { occ[c.join(',')] = 1; });
    var best = 0;
    cells.forEach(function (c) {
      var r = 1; while (occ[(c[0] + r) + ',' + c[1]]) r++; best = Math.max(best, r);
      var s = 1; while (occ[c[0] + ',' + (c[1] + s)]) s++; best = Math.max(best, s);
    });
    var w = 1 + Math.max.apply(null, cells.map(function (c) { return c[0]; })), h = 1 + Math.max.apply(null, cells.map(function (c) { return c[1]; }));
    if (best >= 4) return '1-4-1';
    if (best === 3) return (Math.max(w, h) === 5) ? '3-3' : '2-3-1';
    return '2-2-2';
  }

  /* ---------- markings (cell coords a,b in [0,1], b runs down the page) ---------- */
  function circle(cx, cy, r) { var p = []; for (var i = 0; i < 16; i++) { var t = i * Math.PI / 8; p.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); } return p; }
  var MARKS = {
    solid:  { polys: [[[0, 0], [1, 0], [1, 1], [0, 1]]], dir: false },
    blank:  { polys: [], dir: false },
    tri:    { polys: [[[0, 0], [1, 0], [0, 1]]], dir: true },
    band:   { polys: [[[0, 0], [1, 0], [1, 0.3], [0, 0.3]]], dir: true },
    corner: { polys: [[[0.58, 0.1], [0.9, 0.1], [0.9, 0.42], [0.58, 0.42]]], dir: true },
    half:   { polys: [[[0, 0], [0.5, 0], [0.5, 1], [0, 1]]], dir: true },
    dot:    { polys: [circle(0.5, 0.5, 0.2)], dir: false }
  };

  /* local cube polygons (cube = [0,1]^3) for each net cell's marking */
  function cubeFaces(net, frames, marks) {
    return net.map(function (c, i) {
      var f = frames[i], ctr = add([0.5, 0.5, 0.5], f.n, 0.5);
      return { n: f.n, polys: MARKS[marks[i]].polys.map(function (poly) { return poly.map(function (ab) { return add(add(ctr, f.u, ab[0] - 0.5), f.v, ab[1] - 0.5); }); }) };
    });
  }
  function rotFaces(faces, R) {
    return faces.map(function (fc) { return { n: mv(R, fc.n).map(Math.round), polys: fc.polys.map(function (poly) { return poly.map(function (p) { return add(mv(R, add(p, [-0.5, -0.5, -0.5], 1)), [0.5, 0.5, 0.5], 1); }); }) }; });
  }
  function proj(p) { return [(p[1] - p[0]) * 0.866, (p[0] + p[1]) * 0.5 - p[2]]; }
  function visible(faces) { return faces.filter(function (fc) { return fc.n[0] === 1 || fc.n[1] === 1 || fc.n[2] === 1; }); }
  function drawingOf(faces) {
    var polys = [];
    visible(faces).forEach(function (fc) { fc.polys.forEach(function (poly) { polys.push(poly.map(proj)); }); });
    return polys;
  }
  function sig(polys2d) {
    return polys2d.map(function (pts) { return pts.map(function (q) { return (Math.round(q[0] * 1000) / 1000) + ':' + (Math.round(q[1] * 1000) / 1000); }).sort().join(' '); }).sort().join(' / ');
  }

  /* ---------- distractor builders (operate on visible faces in 3D) ---------- */
  function cloneFaces(fs) { return fs.map(function (f) { return { n: f.n.slice(), polys: f.polys.map(function (p) { return p.map(function (q) { return q.slice(); }); }) }; }); }
  function faceRot(n, quarter) {        // rotate about the face normal through the face centre
    var k = n[0] ? 0 : n[1] ? 1 : 2, R = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    for (var t = 0; t < quarter; t++) {
      var G = k === 0 ? [[1, 0, 0], [0, 0, -1], [0, 1, 0]] : k === 1 ? [[0, 0, 1], [0, 1, 0], [-1, 0, 0]] : [[0, -1, 0], [1, 0, 0], [0, 0, 1]];
      R = mm(G, R);
    }
    return R;
  }
  function moveFace(face, toN) {          // carry a face's marking onto another face position
    // find a proper rotation taking face.n to toN (choose the one that is a 90 degree turn about a cube axis)
    for (var i = 0; i < ROTS.length; i++) {
      var R = ROTS[i], m = mv(R, face.n);
      if (m[0] === toN[0] && m[1] === toN[1] && m[2] === toN[2]) {
        var tr = 0; for (var d = 0; d < 3; d++) tr += R[d][d];
        if (tr === 1 || (tr === -1)) {          // a 90 or 180 degree turn
          return { n: toN.slice(), polys: face.polys.map(function (p) { return p.map(function (q) { return add(mv(R, add(q, [-0.5, -0.5, -0.5], 1)), [0.5, 0.5, 0.5], 1); }); }) };
        }
      }
    }
    return null;
  }
  function spinFace(face, quarter) {
    var R = faceRot(face.n, quarter), c = add([0.5, 0.5, 0.5], face.n, 0.5);
    return { n: face.n.slice(), polys: face.polys.map(function (p) { return p.map(function (q) { return add(mv(R, add(q, c, -1)), c, 1); }); }) };
  }

  function generate(seed) {
    var rng = C.makeRng(seed);
    for (var att = 0; att < 300; att++) {
      var base = rng.pick(NETS);
      var variants = d4cells(base);
      var net = variants[rng.int(variants.length)];
      // anchor: put a random cell first so the fold starts anywhere (frames are anchor-independent up to rotation)
      var order = rng.shuffle(net.map(function (c, i) { return i; }));
      net = order.map(function (i) { return net[i]; });
      var frames = foldFrames(net);
      if (!frames) continue;
      // markings: at least 3 directional, at most one each of blank / solid / dot
      var pool = rng.shuffle(['tri', 'tri', 'band', 'band', 'corner', 'half', 'solid', 'blank', 'dot']);
      var marks = [], counts = {};
      for (var i = 0; i < pool.length && marks.length < 6; i++) {
        var m = pool[i];
        if ((m === 'blank' || m === 'solid' || m === 'dot') && counts[m]) continue;
        marks.push(m); counts[m] = (counts[m] || 0) + 1;
      }
      if (marks.length < 6) continue;
      if (marks.filter(function (m) { return MARKS[m].dir; }).length < 3) continue;
      var faces = cubeFaces(net, frames, marks);
      var valid = {};
      ROTS.forEach(function (R) { valid[sig(drawingOf(rotFaces(faces, R)))] = 1; });
      // the shown answer: a random orientation whose three visible faces include >= 2 marked ones
      var R0 = null, tries = 0;
      while (tries++ < 40) {
        var Rc = rng.pick(ROTS), vf = visible(rotFaces(faces, Rc));
        if (vf.filter(function (f) { return f.polys.length; }).length >= 2 && vf.some(function (f) { return f.polys.length && marksAt(f, faces, Rc, marks) !== 'solid'; })) { R0 = Rc; break; }
      }
      if (!R0) continue;
      var shown = rotFaces(faces, R0);
      var vis = visible(shown);
      var opposite = {};                    // opposite face of each visible face, in this orientation
      shown.forEach(function (f) { opposite[f.n.join(',')] = f; });
      var cands = [];
      // mirror image (reflect through the plane X = Y): the classic impossible fold
      cands.push({ faces: vis.map(function (f) { return { n: [f.n[1], f.n[0], f.n[2]], polys: f.polys.map(function (p) { return p.map(function (q) { return [q[1], q[0], q[2]]; }); }) }; }), trap: 'mirror' });
      // one face turned a quarter or half
      vis.forEach(function (f, fi) {
        if (!f.polys.length) return;
        [1, 2, 3].forEach(function (qt) {
          var v2 = cloneFaces(vis); v2[fi] = spinFace(f, qt);
          cands.push({ faces: v2, trap: 'rotation' });
        });
      });
      // two visible faces trade places
      for (var a = 0; a < 3; a++) for (var b = a + 1; b < 3; b++) {
        var v3 = cloneFaces(vis), fa = moveFace(vis[a], vis[b].n), fb = moveFace(vis[b], vis[a].n);
        if (fa && fb) { v3[b] = fa; v3[a] = fb; cands.push({ faces: v3, trap: 'neighbor' }); }
      }
      // a visible face shows what is on its OPPOSITE face
      vis.forEach(function (f, fi) {
        var opp = opposite[neg(f.n).join(',')];
        if (!opp) return;
        [0, 1, 2, 3].forEach(function (qt) {
          var mvd = moveFace(opp, f.n); if (!mvd) return;
          var v4 = cloneFaces(vis); v4[fi] = spinFace(mvd, qt);
          cands.push({ faces: v4, trap: 'opposite' });
        });
      });
      var correctSig = sig(drawingOf(vis));
      var used = {}; used[correctSig] = 1;
      rng.shuffle(cands);
      // prefer one of each trap family before repeats
      var byTrap = {}, picked = [];
      cands.forEach(function (cd) {
        var s = sig(drawingOf(cd.faces));
        if (valid[s] || used[s]) return;
        cd.sig = s;
        (byTrap[cd.trap] = byTrap[cd.trap] || []).push(cd);
      });
      var fams = rng.shuffle(Object.keys(byTrap));
      // the mirror trap is the signature DAT trap; include it whenever it is a real distractor
      if (byTrap.mirror) { fams = ['mirror'].concat(fams.filter(function (f) { return f !== 'mirror'; })); }
      var round = 0;
      while (picked.length < 3 && round < 6) {
        fams.forEach(function (fm) {
          if (picked.length >= 3) return;
          var list = byTrap[fm]; if (!list || !list[round]) return;
          if (used[list[round].sig]) return;
          used[list[round].sig] = 1; picked.push(list[round]);
        });
        round++;
      }
      if (picked.length < 3) continue;
      var placed = C.placeAnswer(rng, { polys: drawingOf(vis), trap: null }, picked.map(function (p) { return { polys: drawingOf(p.faces), trap: p.trap }; }));
      return {
        type: 'patternfold', seed: seed,
        prompt: 'Which cube can be formed by folding the pattern? (Printed side faces out.)',
        figure: { net: net, marks: marks },
        options: placed.options,
        answer: placed.answer,
        meta: { netType: netType(net), marks: marks.slice(), traps: placed.options.map(function (o) { return o.trap; }) }
      };
    }
    throw new Error('patternfold: no item for seed ' + seed);
  }
  function marksAt(f, faces, R, marks) {
    for (var i = 0; i < faces.length; i++) { var n = mv(R, faces[i].n).map(Math.round); if (n.join(',') === f.n.join(',')) return marks[i]; }
    return null;
  }

  /* ---------- rendering ---------- */
  var MARK_FILL = '#3b3b3b';
  function netSVG(net, marks) {
    var s = 40, pad = 6;
    var w = (1 + Math.max.apply(null, net.map(function (c) { return c[0]; }))) * s + pad * 2;
    var h = (1 + Math.max.apply(null, net.map(function (c) { return c[1]; }))) * s + pad * 2;
    var o = '<svg class="pat-svg" viewBox="0 0 ' + w + ' ' + h + '">';
    net.forEach(function (c, i) {
      var x = pad + c[0] * s, y = pad + c[1] * s;
      o += '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" fill="#fff" stroke="#111" stroke-width="1.6"/>';
      MARKS[marks[i]].polys.forEach(function (poly) {
        o += '<polygon points="' + poly.map(function (ab) { return (x + ab[0] * s).toFixed(1) + ',' + (y + ab[1] * s).toFixed(1); }).join(' ') + '" fill="' + MARK_FILL + '"/>';
      });
      o += '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" fill="none" stroke="#111" stroke-width="1.6"/>';
    });
    return o + '</svg>';
  }
  function cubeSVG(polys2d) {
    var s = 60, P = function (q) { return [q[0] * s, q[1] * s]; };
    var cube = [
      { pts: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], fill: '#ffffff' },
      { pts: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]], fill: '#e4e4e4' },
      { pts: [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]], fill: '#cfcfcf' }
    ];
    var o = '<svg class="pat-svg" viewBox="-58 -66 116 132">';
    cube.forEach(function (f) { o += '<polygon points="' + f.pts.map(function (p) { var q = P(proj(p)); return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' ') + '" fill="' + f.fill + '" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/>'; });
    polys2d.forEach(function (poly) { o += '<polygon points="' + poly.map(function (q) { var r = P(q); return r[0].toFixed(1) + ',' + r[1].toFixed(1); }).join(' ') + '" fill="' + MARK_FILL + '"/>'; });
    cube.forEach(function (f) { o += '<polygon points="' + f.pts.map(function (p) { var q = P(proj(p)); return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' ') + '" fill="none" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/>'; });
    return o + '</svg>';
  }
  function renderFigure(item) { return '<figure class="pat-panel pat-wide"><div class="pat-paper">' + netSVG(item.figure.net, item.figure.marks) + '</div><figcaption>Pattern</figcaption></figure>'; }
  function renderOption(item, i) { return '<div class="pat-paper pat-small">' + cubeSVG(item.options[i].polys) + '</div>'; }

  PAT.patternfold = {
    generate: generate, renderFigure: renderFigure, renderOption: renderOption, NETS: NETS, MARKS: MARKS, netType: netType,
    _internal: { foldFrames: foldFrames, cubeFaces: cubeFaces, rotFaces: rotFaces, drawingOf: drawingOf, sig: sig, ROTS: ROTS }
  };
  if (typeof module === 'object' && module.exports) module.exports = PAT;
})(typeof self !== 'undefined' ? self : globalThis);
