/*
  pat-holepunch.js : Hole Punching (PAT questions 46-60).

  A square sheet (4 x 4 hole positions) is folded one to three times, then
  punched. Choose the unfolded sheet (A-E).

  Geometry model: every unit cell is split into four triangles by its two
  diagonals. Horizontal, vertical AND 45-degree diagonal fold lines all run
  along triangle edges, so every fold maps triangles exactly onto triangles
  and the folded shape is always an exact union of triangles. A fold is legal
  only when the moving flap lands entirely on paper that stays put (as on the
  DAT). Punches go through cell centres whose whole cell is covered; on the
  way back out, a mirrored hole must land on a whole cell of the flap, so
  there are never half-holes or holes hanging off the paper edge.
  Fold record: {kind:'v'|'h'|'d1'|'d2', c, moveSide:+1|-1}; the signed
  distance is v: x-c, h: y-c, d1: (x-y)-c, d2: (x+y)-c (y runs DOWN the page).
*/
(function (root) {
  'use strict';
  var PAT = root.PAT || (typeof require === 'function' ? require('./pat-core.js') : null);
  var C = PAT.core;

  var TRI = ['N', 'E', 'S', 'W'];
  function triVerts(i, j, t) {
    var c = [i + 0.5, j + 0.5];
    if (t === 'N') return [c, [i, j], [i + 1, j]];
    if (t === 'E') return [c, [i + 1, j], [i + 1, j + 1]];
    if (t === 'S') return [c, [i + 1, j + 1], [i, j + 1]];
    return [c, [i, j + 1], [i, j]];
  }
  function centroid(v) { return [(v[0][0] + v[1][0] + v[2][0]) / 3, (v[0][1] + v[1][1] + v[2][1]) / 3]; }
  function sdist(f, p) {
    if (f.kind === 'v') return p[0] - f.c;
    if (f.kind === 'h') return p[1] - f.c;
    if (f.kind === 'd1') return (p[0] - p[1]) - f.c;
    return (p[0] + p[1]) - f.c;
  }
  function reflectP(f, p) {
    if (f.kind === 'v') return [2 * f.c - p[0], p[1]];
    if (f.kind === 'h') return [p[0], 2 * f.c - p[1]];
    if (f.kind === 'd1') return [p[1] + f.c, p[0] - f.c];
    return [f.c - p[1], f.c - p[0]];
  }
  function triFromCentroid(p) {
    var i = Math.floor(p[0]), j = Math.floor(p[1]);
    var dx = p[0] - (i + 0.5), dy = p[1] - (j + 0.5);
    var t = Math.abs(dy) > Math.abs(dx) ? (dy < 0 ? 'N' : 'S') : (dx > 0 ? 'E' : 'W');
    return i + ',' + j + ',' + t;
  }
  function triCentroid(key) { var p = key.split(','); return centroid(triVerts(+p[0], +p[1], p[2])); }
  function reflectTri(f, key) { return triFromCentroid(reflectP(f, triCentroid(key))); }
  function fullSheet() { var s = {}; for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) TRI.forEach(function (t) { s[i + ',' + j + ',' + t] = 1; }); return s; }

  /* All candidate fold lines that cross the shape, with each moving side. */
  function candidateFolds(shape) {
    var out = [];
    var lines = [];
    for (var c = 1; c <= 3; c++) { lines.push({ kind: 'v', c: c }); lines.push({ kind: 'h', c: c }); }
    for (var k = -3; k <= 3; k++) lines.push({ kind: 'd1', c: k });
    for (var k2 = 1; k2 <= 7; k2++) lines.push({ kind: 'd2', c: k2 });
    lines.forEach(function (L) {
      [1, -1].forEach(function (side) {
        var f = { kind: L.kind, c: L.c, moveSide: side };
        var flap = [], rest = {};
        Object.keys(shape).forEach(function (key) {
          if (Math.sign(sdist(f, triCentroid(key))) === side) flap.push(key); else rest[key] = 1;
        });
        if (!flap.length || !Object.keys(rest).length) return;
        for (var i = 0; i < flap.length; i++) if (!rest[reflectTri(f, flap[i])]) return;   // flap must land on paper
        out.push({ fold: f, flap: flap, rest: rest });
      });
    });
    return out;
  }
  function cellFull(shape, i, j) { return TRI.every(function (t) { return shape[i + ',' + j + ',' + t]; }); }
  function cellCount(set, i, j) { var n = 0; TRI.forEach(function (t) { if (set[i + ',' + j + ',' + t]) n++; }); return n; }

  /* Unfold one fold: every hole stays; each hole whose mirror cell is (wholly)
     part of the flap gains a mirrored hole. Returns null on a partial cell. */
  function unfoldOnce(holes, f, flapSet) {
    var out = holes.slice(), bad = false;
    holes.forEach(function (h) {
      var m = reflectP(f, h);
      var i = Math.floor(m[0]), j = Math.floor(m[1]);
      if (i < 0 || j < 0 || i > 3 || j > 3) return;
      var n = cellCount(flapSet, i, j);
      if (n === 0) return;
      if (n !== 4) { bad = true; return; }
      out.push(m);
    });
    if (bad) return null;
    var seen = {}, ded = [];
    out.forEach(function (p) { var k = p[0] + ',' + p[1]; if (!seen[k]) { seen[k] = 1; ded.push(p); } });
    return ded;
  }
  /* Triangle-level forward simulation: push every original triangle through the
     folds (all layers on the moving side move); a triangle is cut when it ends in a
     punched cell. Each original cell must be cut whole (4 triangles) or not at all,
     otherwise the unfolded sheet would show a part-hole: then return null. */
  function triangleHoles(steps, punches) {
    var pc = {}; punches.forEach(function (p) { pc[Math.floor(p[0]) + ',' + Math.floor(p[1])] = 1; });
    var cut = {}, hit = {};
    for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) TRI.forEach(function (t) {
      var pos = i + ',' + j + ',' + t;
      steps.forEach(function (st) { if (st.flap[pos]) pos = reflectTri(st.fold, pos); });
      var q = pos.split(','), ck = q[0] + ',' + q[1];
      if (pc[ck]) { cut[i + ',' + j] = (cut[i + ',' + j] || 0) + 1; hit[ck] = 1; }
    });
    if (Object.keys(pc).some(function (k) { return !hit[k]; })) return null;
    var out = [];
    for (var k in cut) { if (cut[k] !== 4) return null; var a = k.split(',').map(Number); out.push([a[0] + 0.5, a[1] + 0.5]); }
    return out;
  }
  var hk = function (pts) { return pts.map(function (p) { return p[0] + ',' + p[1]; }).sort().join('|'); };

  function generate(seed, opts) {
    opts = opts || {};
    var rng = C.makeRng(seed);
    for (var attempt = 0; attempt < 400; attempt++) {
      var nF = opts.folds || (function () { var r = rng.next(); return r < 0.15 ? 1 : r < 0.6 ? 2 : 3; })();
      var shape = fullSheet(), steps = [], ok = true;
      for (var k = 0; k < nF; k++) {
        var cands = candidateFolds(shape);
        if (!cands.length) { ok = false; break; }
        var diag = cands.filter(function (c) { return c.fold.kind === 'd1' || c.fold.kind === 'd2'; });
        var orth = cands.filter(function (c) { return c.fold.kind === 'v' || c.fold.kind === 'h'; });
        var pool = (diag.length && rng.chance(opts.halfHoles ? 0.7 : 0.35)) ? diag : (orth.length ? orth : diag);
        var ch = rng.pick(pool);
        var flapSet = {}; ch.flap.forEach(function (t) { flapSet[t] = 1; });
        steps.push({ fold: ch.fold, before: shape, after: ch.rest, flap: flapSet });
        shape = ch.rest;
      }
      if (!ok) continue;
      var cells = [];
      for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) if (cellFull(shape, i, j)) cells.push([i + 0.5, j + 0.5]);
      if (!cells.length) continue;
      var nP = cells.length > 1 && rng.chance(0.3) ? 2 : 1;
      rng.shuffle(cells);
      var punches = cells.slice(0, nP), nHalf = 0;
      var holes = punches.slice(), chain = [holes], bad = false;
      if (opts.halfHoles) {
        // a punch may sit on a diagonal fold edge, through a half-covered cell
        var halves = [];
        for (var hi = 0; hi < 4; hi++) for (var hj = 0; hj < 4; hj++) {
          var tri = TRI.filter(function (t) { return shape[hi + ',' + hj + ',' + t]; });
          if (tri.length === 2 && (TRI.indexOf(tri[1]) - TRI.indexOf(tri[0]) === 1 || (tri[0] === 'N' && tri[1] === 'W'))) halves.push([hi + 0.5, hj + 0.5]);
        }
        if (halves.length && rng.chance(0.75)) { punches[0] = rng.pick(halves); nHalf = 1; }
        holes = triangleHoles(steps, punches);
        if (!holes) continue;
        chain = [punches, holes];
      } else {
        for (var s = steps.length - 1; s >= 0; s--) {
          holes = unfoldOnce(holes, steps[s].fold, steps[s].flap);
          if (!holes) { bad = true; break; }
          chain.push(holes);
        }
      }
      if (bad) continue;
      if (holes.length < 2 || holes.length > 12) continue;
      var dis = makeDistractors(rng, steps, punches, holes);
      if (!dis) continue;
      var placed = C.placeAnswer(rng, { holes: holes, trap: null }, dis);
      var extraMeta = opts.halfHoles ? { halfHoles: nHalf } : {};
      var diagonal = steps.some(function (st) { return st.fold.kind === 'd1' || st.fold.kind === 'd2'; });
      return {
        type: 'holepunch', seed: seed,
        prompt: 'The paper is folded, then punched. Which choice shows the paper unfolded?',
        figure: {
          steps: steps.map(function (st) { return { fold: st.fold, before: Object.keys(st.before), after: Object.keys(st.after), flap: Object.keys(st.flap) }; }),
          punches: punches
        },
        options: placed.options,
        answer: placed.answer,
        meta: { folds: steps.length, diagonal: diagonal, holes: holes.length, punches: punches.length, chain: chain.map(function (h) { return h.length; }), halfHoles: extraMeta.halfHoles }
      };
    }
    throw new Error('holepunch: no item for seed ' + seed);
  }

  /* Distractors, all the real mistakes: forgetting one unfold, mirroring across
     the wrong line, reading the whole sheet flipped, one hole off by a cell,
     a dropped hole. Every one is checked distinct from the key and each other. */
  function makeDistractors(rng, steps, punches, answer) {
    var key = hk(answer), seen = {}; seen[key] = 1;
    var out = [];
    function add(holes, trap) {
      if (!holes || holes.length < 1 || holes.length > 16) return;
      var inb = holes.every(function (p) { return p[0] > 0 && p[0] < 4 && p[1] > 0 && p[1] < 4; });
      if (!inb) return;
      var s = {}, ded = []; holes.forEach(function (p) { var k = p[0] + ',' + p[1]; if (!s[k]) { s[k] = 1; ded.push(p); } });
      var k2 = hk(ded); if (seen[k2]) return; seen[k2] = 1;
      out.push({ holes: ded, trap: trap });
    }
    // 1. skip one unfold (each fold in turn)
    var skips = [];
    for (var sk = 0; sk < steps.length; sk++) {
      var h = punches.slice(), ok = true;
      for (var s = steps.length - 1; s >= 0; s--) {
        if (s === sk) continue;
        var nx = unfoldLoose(h, steps[s].fold); h = nx;
      }
      skips.push(h);
    }
    // 2. mirror one unfold across the wrong line (perpendicular / other diagonal)
    var wrongs = [];
    for (var w = 0; w < steps.length; w++) {
      var f = steps[w].fold, alt;
      if (f.kind === 'v') alt = { kind: 'h', c: f.c, moveSide: f.moveSide };
      else if (f.kind === 'h') alt = { kind: 'v', c: f.c, moveSide: f.moveSide };
      else if (f.kind === 'd1') alt = { kind: 'd2', c: 4 + f.c, moveSide: f.moveSide };
      else alt = { kind: 'd1', c: f.c - 4, moveSide: f.moveSide };
      var h2 = punches.slice();
      for (var s2 = steps.length - 1; s2 >= 0; s2--) h2 = unfoldLoose(h2, s2 === w ? alt : steps[s2].fold);
      wrongs.push(h2);
    }
    // 3. whole sheet read flipped
    var flips = [
      answer.map(function (p) { return [4 - p[0], p[1]]; }),
      answer.map(function (p) { return [p[0], 4 - p[1]]; }),
      answer.map(function (p) { return [p[1], p[0]]; })
    ];
    // 4. one hole nudged a cell
    var nudges = [];
    for (var n = 0; n < 6; n++) {
      var idx = rng.int(answer.length), d = rng.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
      var hh = answer.map(function (p, i) { return i === idx ? [p[0] + d[0], p[1] + d[1]] : p; });
      nudges.push(hh);
    }
    // 5. one hole dropped
    var drop = answer.slice(); drop.splice(rng.int(drop.length), 1);
    var pool = [];
    skips.forEach(function (x) { pool.push([x, 'missed-unfold']); });
    wrongs.forEach(function (x) { pool.push([x, 'wrong-line']); });
    flips.forEach(function (x) { pool.push([x, 'flipped']); });
    rng.shuffle(pool);
    // prefer same hole count first (no free eliminations by counting), then the rest
    pool.sort(function (a, b) { return (a[0].length === answer.length ? 0 : 1) - (b[0].length === answer.length ? 0 : 1); });
    pool.forEach(function (p) { if (out.length < 3) add(p[0], p[1]); });
    nudges.forEach(function (x) { if (out.length < 4) add(x, 'shifted'); });
    if (out.length < 4 && answer.length >= 3) add(drop, 'dropped');
    pool.forEach(function (p) { if (out.length < 4) add(p[0], p[1]); });
    if (out.length < 4) return null;
    return out.slice(0, 4);
  }
  /* unfold without the partial-cell guard (for building wrong answers) */
  function unfoldLoose(holes, f) {
    var out = holes.slice();
    holes.forEach(function (h) {
      if (Math.sign(sdist(f, h)) === -f.moveSide) {
        var m = reflectP(f, h);
        if (m[0] > 0 && m[0] < 4 && m[1] > 0 && m[1] < 4) out.push(m);
      }
    });
    return out;
  }

  /* ---------- rendering ---------- */
  function polySet(keys, scale, ox, oy, fill, stroke, dash) {
    var set = {}; keys.forEach(function (k) { set[k] = 1; });
    var h = '';
    keys.forEach(function (k) {
      var p = k.split(','), v = triVerts(+p[0], +p[1], p[2]);
      h += '<polygon points="' + v.map(function (q) { return (ox + q[0] * scale).toFixed(1) + ',' + (oy + q[1] * scale).toFixed(1); }).join(' ') + '" fill="' + fill + '" stroke="' + fill + '" stroke-width="0.6"/>';
    });
    // outline: triangle edges not shared with another triangle in the set
    var edges = {};
    keys.forEach(function (k) {
      var p = k.split(','), v = triVerts(+p[0], +p[1], p[2]);
      for (var e = 0; e < 3; e++) {
        var a = v[e], b = v[(e + 1) % 3];
        var ek = [a.join(':'), b.join(':')].sort().join('|');
        edges[ek] = (edges[ek] || 0) + 1;
      }
    });
    Object.keys(edges).forEach(function (ek) {
      if (edges[ek] !== 1) return;
      var ab = ek.split('|').map(function (s) { return s.split(':').map(Number); });
      h += '<line x1="' + (ox + ab[0][0] * scale).toFixed(1) + '" y1="' + (oy + ab[0][1] * scale).toFixed(1) + '" x2="' + (ox + ab[1][0] * scale).toFixed(1) + '" y2="' + (oy + ab[1][1] * scale).toFixed(1) + '" stroke="' + stroke + '" stroke-width="2"' + (dash ? ' stroke-dasharray="5 4"' : '') + ' stroke-linecap="round"/>';
    });
    return h;
  }
  var CLIP = 0;
  function stepSVG(st, punches, isLast) {
    var S = 30, ox = 15, oy = 15, size = 4 * S + 30;
    var h = '<svg class="pat-svg" viewBox="0 0 ' + size + ' ' + size + '">';
    // the flap's original position, dashed (where the paper came from)
    h += polySet(st.flap, S, ox, oy, 'none', '#6b6b6b', true);
    h += polySet(st.after, S, ox, oy, '#ffffff', '#111', false);
    if (isLast) {
      var cid = 'hpclip' + (++CLIP);
      h += '<clipPath id="' + cid + '">' + st.after.map(function (k) { var q = k.split(','), v = triVerts(+q[0], +q[1], q[2]); return '<polygon points="' + v.map(function (z) { return (ox + z[0] * S).toFixed(1) + ',' + (oy + z[1] * S).toFixed(1); }).join(' ') + '"/>'; }).join('') + '</clipPath>';
      punches.forEach(function (p) { h += '<circle cx="' + (ox + p[0] * S) + '" cy="' + (oy + p[1] * S) + '" r="7" fill="#111" clip-path="url(#' + cid + ')"/>'; });
    }
    return h + '</svg>';
  }
  function renderFigure(item) {
    var st = item.figure.steps, h = '<div class="pat-fold-steps">';
    st.forEach(function (s, i) {
      h += '<figure class="pat-panel"><div class="pat-paper">' + stepSVG(s, item.figure.punches, i === st.length - 1) + '</div><figcaption>' + (i === st.length - 1 ? 'Fold ' + (i + 1) + ', then punch' : 'Fold ' + (i + 1)) + '</figcaption></figure>';
    });
    return h + '</div>';
  }
  function sheetSVG(holes) {
    var S = 30, o = 6, size = 4 * S + 12;
    var h = '<svg class="pat-svg" viewBox="0 0 ' + size + ' ' + size + '"><rect x="' + o + '" y="' + o + '" width="' + 4 * S + '" height="' + 4 * S + '" fill="#fff" stroke="#111" stroke-width="2"/>';
    holes.forEach(function (p) { h += '<circle cx="' + (o + p[0] * S) + '" cy="' + (o + p[1] * S) + '" r="7" fill="#111"/>'; });
    return h + '</svg>';
  }
  function renderOption(item, i) { return '<div class="pat-paper pat-small">' + sheetSVG(item.options[i].holes) + '</div>'; }

  PAT.holepunch = {
    generate: generate, renderFigure: renderFigure, renderOption: renderOption, sheetSVG: sheetSVG,
    _internal: { triangleHoles: triangleHoles, candidateFolds: candidateFolds, reflectP: reflectP, sdist: sdist, fullSheet: fullSheet }
  };
  if (typeof module === 'object' && module.exports) module.exports = PAT;
})(typeof self !== 'undefined' ? self : globalThis);
