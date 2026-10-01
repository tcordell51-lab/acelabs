/*
  pat-cubes.js : Cube Counting (PAT questions 61-75).

  Figures are stacks of identical cubes resting on the floor, painted on every
  exposed side EXCEPT the bottom. Questions ask how many cubes have exactly k
  painted sides (choices A-E = 1 to 5 cubes). Several questions share one figure,
  as on the DAT.

  Rules the generator enforces (the DAT's own rules):
  - Hidden cubes exist only where they hold up a cube you can see. Concretely,
    the top cube of every column shows at least 25 percent of its top face to the
    viewer, so every column height can be read from the drawing.
  - The footprint is one connected structure; every figure is 12 to 24 cubes.
  Viewer: looking down along (-1,-1,-1); screen x = (x - y) * 0.866,
  screen y = (x + y) * 0.5 - z. Visible faces are +x (right), +y (front), +z (top).
*/
(function (root) {
  'use strict';
  var PAT = root.PAT || (typeof require === 'function' ? require('./pat-core.js') : null);
  var C = PAT.core;

  function painted(set, c) {
    var x = c[0], y = c[1], z = c[2], n = 0;
    var has = function (a, b, d) { return !!set[a + ',' + b + ',' + d]; };
    if (!has(x + 1, y, z)) n++; if (!has(x - 1, y, z)) n++;
    if (!has(x, y + 1, z)) n++; if (!has(x, y - 1, z)) n++;
    if (!has(x, y, z + 1)) n++;
    return n;
  }
  function rayHitsBox(p, d, box) {
    var t0 = 1e-6, t1 = Infinity;
    for (var k = 0; k < 3; k++) {
      var lo = box[k], hi = box[k] + 1;
      var a = (lo - p[k]) / d[k], b = (hi - p[k]) / d[k];
      if (a > b) { var t = a; a = b; b = t; }
      t0 = Math.max(t0, a); t1 = Math.min(t1, b);
      if (t0 >= t1 - 1e-9) return false;
    }
    return true;
  }
  function faceVisible(cubes, cube, face) {         // fraction of a face visible, 6x6 samples
    var n = 6, vis = 0, d = [1, 1, 1];
    for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
      var a = (i + 0.5) / n, b = (j + 0.5) / n, p;
      if (face === 'top') p = [cube[0] + a, cube[1] + b, cube[2] + 1];
      else if (face === 'front') p = [cube[0] + a, cube[1] + 1, cube[2] + b];
      else p = [cube[0] + 1, cube[1] + a, cube[2] + b];
      var blocked = false;
      for (var k = 0; k < cubes.length; k++) { if (cubes[k] !== cube && rayHitsBox(p, d, cubes[k])) { blocked = true; break; } }
      if (!blocked) vis++;
    }
    return vis / (n * n);
  }

  function makeFigure(rng) {
    for (var att = 0; att < 500; att++) {
      var W = 3 + rng.int(3), D = 3 + rng.int(2);
      var H = {}, total = 0;
      for (var x = 0; x < W; x++) for (var y = 0; y < D; y++) {
        // taller toward the back-left (low x, low y) reads like real DAT stacks and keeps tops visible
        var bias = (W - 1 - x) + (D - 1 - y);
        var h = rng.int(2 + Math.min(3, bias));
        if (rng.chance(0.12)) h = 0;
        H[x + ',' + y] = h; total += h;
      }
      if (total < 12 || total > 24) continue;
      // footprint connected
      var cells = Object.keys(H).filter(function (k) { return H[k] > 0; });
      var seen = {}, st = [cells[0]]; seen[cells[0]] = 1;
      while (st.length) {
        var c = st.pop().split(',').map(Number);
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          var k = (c[0] + d[0]) + ',' + (c[1] + d[1]);
          if (H[k] > 0 && !seen[k]) { seen[k] = 1; st.push(k); }
        });
      }
      if (Object.keys(seen).length !== cells.length) continue;
      // trim empty border rows/cols so the drawing has no phantom space
      var cubes = [], set = {};
      for (var x2 = 0; x2 < W; x2++) for (var y2 = 0; y2 < D; y2++) for (var z = 0; z < H[x2 + ',' + y2]; z++) { cubes.push([x2, y2, z]); set[x2 + ',' + y2 + ',' + z] = 1; }
      // DAT rule: every column top must be readable
      var okTops = cubes.every(function (cb) {
        if (set[cb[0] + ',' + cb[1] + ',' + (cb[2] + 1)]) return true;
        return faceVisible(cubes, cb, 'top') >= 0.25;
      });
      if (!okTops) continue;
      var counts = cubes.map(function (cb) { return painted(set, cb); });
      var hidden = cubes.filter(function (cb) {
        return faceVisible(cubes, cb, 'top') === 0 && faceVisible(cubes, cb, 'front') === 0 && faceVisible(cubes, cb, 'right') === 0;
      });
      var hiddenSet = {}; hidden.forEach(function (cb) { hiddenSet[cb.join(',')] = 1; });
      var hist = {}; counts.forEach(function (n) { hist[n] = (hist[n] || 0) + 1; });
      return { cubes: cubes, counts: counts, hist: hist, hidden: hiddenSet, hiddenCount: hidden.length, W: W, D: D };
    }
    throw new Error('cubes: no figure');
  }

  /* One figure plus `nq` questions on it (distinct k, answers 1-5). */
  function generateSet(seed, nq, label) {
    var rng = C.makeRng(seed);
    for (var att = 0; att < 200; att++) {
      var fig = makeFigure(rng);
      var ks = Object.keys(fig.hist).map(Number).filter(function (k) { return fig.hist[k] >= 1 && fig.hist[k] <= 5; });
      if (ks.length < nq) continue;
      rng.shuffle(ks);
      ks = ks.slice(0, nq).sort(function (a, b) { return a - b; });
      var figure = { cubes: fig.cubes, label: label || 'A', total: fig.cubes.length };
      return ks.map(function (k, qi) {
        var ans = fig.hist[k];
        var hiddenK = 0;
        fig.cubes.forEach(function (cb, i) { if (fig.counts[i] === k && fig.hidden[cb.join(',')]) hiddenK++; });
        return {
          type: 'cubes', seed: seed, sub: qi,
          prompt: 'In Figure ' + figure.label + ', how many cubes have exactly ' + wordN(k) + ' of their exposed sides painted?',
          figure: figure,
          options: [1, 2, 3, 4, 5].map(function (n) { return { count: n, trap: null }; }),
          answer: ans - 1,
          meta: { k: k, hiddenCubes: fig.hiddenCount, hiddenInAnswer: hiddenK, total: fig.cubes.length, figureLabel: figure.label }
        };
      });
    }
    throw new Error('cubes: no question set for seed ' + seed);
  }
  function wordN(k) { return ['zero', 'one', 'two', 'three', 'four', 'five'][k]; }
  function generate(seed) { return generateSet(seed, 1, 'A')[0]; }

  /* ---------- rendering ---------- */
  function figureSVG(figure, opts) {
    opts = opts || {};
    var cubes = figure.cubes.slice();
    var s = 26;
    var P = function (x, y, z) { return [(x - y) * 0.866 * s, (x + y) * 0.5 * s - z * s]; };
    var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    cubes.forEach(function (c) {
      [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]].forEach(function (d) {
        var p = P(c[0] + d[0], c[1] + d[1], c[2] + d[2]);
        minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]); minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]);
      });
    });
    cubes.sort(function (a, b) { return (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]); });   // far to near along the view
    var pad = 8, w = maxX - minX + pad * 2, h = maxY - minY + pad * 2;
    var out = '<svg class="pat-svg" viewBox="' + (minX - pad).toFixed(1) + ' ' + (minY - pad).toFixed(1) + ' ' + w.toFixed(1) + ' ' + h.toFixed(1) + '">';
    function quad(pts, fill) {
      return '<polygon points="' + pts.map(function (q) { var p = P(q[0], q[1], q[2]); return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ') + '" fill="' + fill + '" stroke="#111" stroke-width="1.3" stroke-linejoin="round"/>';
    }
    cubes.forEach(function (c) {
      var x = c[0], y = c[1], z = c[2];
      var hl = opts.highlight && opts.highlight[c.join(',')];
      out += quad([[x, y, z + 1], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]], hl ? '#f3e2a6' : '#ffffff');
      out += quad([[x, y + 1, z], [x + 1, y + 1, z], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]], hl ? '#dcc77f' : '#d9d9d9');
      out += quad([[x + 1, y, z], [x + 1, y + 1, z], [x + 1, y + 1, z + 1], [x + 1, y, z + 1]], hl ? '#c9b26a' : '#b5b5b5');
    });
    return out + '</svg>';
  }
  function renderFigure(item, opts) {
    return '<figure class="pat-panel pat-wide"><div class="pat-paper">' + figureSVG(item.figure, opts) + '</div><figcaption>Figure ' + item.figure.label + '</figcaption></figure>';
  }
  function renderOption(item, i) { var n = item.options[i].count; return '<span class="pat-opt-text">' + n + ' cube' + (n > 1 ? 's' : '') + '</span>'; }
  /* review: which cubes have exactly k painted sides */
  function kCubes(item) {
    var set = {}; item.figure.cubes.forEach(function (c) { set[c.join(',')] = 1; });
    var hl = {}; item.figure.cubes.forEach(function (c) { if (painted(set, c) === item.meta.k) hl[c.join(',')] = 1; });
    return hl;
  }

  PAT.cubes = { generate: generate, generateSet: generateSet, renderFigure: renderFigure, renderOption: renderOption, figureSVG: figureSVG, kCubes: kCubes, painted: painted };
  if (typeof module === 'object' && module.exports) module.exports = PAT;
})(typeof self !== 'undefined' ? self : globalThis);
