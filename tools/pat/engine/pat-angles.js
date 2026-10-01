/*
  pat-angles.js : Angle Ranking (PAT questions 31-45).

  Four angles, rank smallest to largest, four ordering choices (A-D).
  Calibration (real-DAT level, not easier): the three gaps between
  neighbouring angles are drawn from 2-6 degrees, weighted toward 2-4, so
  most items contain at least one pair within 3 degrees. Arm lengths vary
  independently of the angle, and about a third of items deliberately give
  the smaller angles the longer arms (the arm-length illusion).
  Distractors swap the CLOSEST pairs first, so every wrong choice is the
  kind of mistake a fast eye actually makes.
*/
(function (root) {
  'use strict';
  var PAT = root.PAT || (typeof require === 'function' ? require('./pat-core.js') : null);
  var C = PAT.core;

  var GAP_BAG = [2, 2, 3, 3, 3, 4, 4, 4, 5, 6];

  function orderKey(order) { return order.map(function (i) { return i + 1; }).join('-'); }

  function generate(seed, opts) {
    opts = opts || {};
    var rng = C.makeRng(seed);
    var gaps = [rng.pick(GAP_BAG), rng.pick(GAP_BAG), rng.pick(GAP_BAG)];
    if (Math.min(gaps[0], gaps[1], gaps[2]) > 3 && rng.chance(0.7)) gaps[rng.int(3)] = rng.pick([2, 3]);
    var span = gaps[0] + gaps[1] + gaps[2];
    var lo = 14 + rng.int(150 - span - 14);              // smallest angle 14..(150-span), largest <= ~150
    var sorted = [lo, lo + gaps[0], lo + gaps[0] + gaps[1], lo + span];
    // place the four sorted angles into panels 1-4 at random
    var perm = rng.shuffle([0, 1, 2, 3]);                 // perm[panel] = rank
    var degs = perm.map(function (rank) { return sorted[rank]; });
    var misleading = rng.chance(0.35);
    var arms = degs.map(function (d) {
      var rank = sorted.indexOf(d);
      var base = misleading ? 98 - rank * 11 : 64 + rng.int(34);
      var a = base + rng.int(8) - 4, b = base - 6 - rng.int(22);
      return rng.chance(0.5) ? [a, b] : [b, a];
    });
    var rots = degs.map(function (d) { return rng.int(360); });
    // true order: panels sorted by degrees
    var order = [0, 1, 2, 3].sort(function (a, b) { return degs[a] - degs[b]; });
    var correct = orderKey(order);
    // candidate distractors: swap rank-adjacent pairs, closest pairs first
    var pairs = [[0, 1, gaps[0]], [1, 2, gaps[1]], [2, 3, gaps[2]]].sort(function (a, b) { return a[2] - b[2]; });
    function swapRanks(o, r1, r2) { var c = o.slice(); var t = c[r1]; c[r1] = c[r2]; c[r2] = t; return c; }
    var cands = [];
    pairs.forEach(function (p) { cands.push({ order: swapRanks(order, p[0], p[1]), trap: 'swap', gap: p[2], ranks: [p[0], p[1]] }); });
    cands.push({ order: swapRanks(swapRanks(order, 0, 1), 2, 3), trap: 'double', gap: Math.min(gaps[0], gaps[2]), ranks: [0, 1, 2, 3] });
    cands.push({ order: [order[1], order[2], order[0], order[3]], trap: 'shift', gap: gaps[0] + gaps[1], ranks: [0, 1, 2] });
    cands.push({ order: [order[0], order[2], order[3], order[1]], trap: 'shift', gap: gaps[1] + gaps[2], ranks: [1, 2, 3] });
    var seen = {}; seen[correct] = 1;
    var distractors = [];
    for (var i = 0; i < cands.length && distractors.length < 3; i++) {
      var k = orderKey(cands[i].order);
      if (seen[k]) continue; seen[k] = 1;
      distractors.push({ text: k, trap: cands[i].trap, gap: cands[i].gap });
    }
    var placed = C.placeAnswer(rng, { text: correct, trap: null, gap: null }, distractors);
    var acute = degs.filter(function (d) { return d < 90; }).length;
    return {
      type: 'angles', seed: seed,
      prompt: 'Rank the four angles from SMALLEST to LARGEST.',
      figure: { degs: degs, arms: arms, rots: rots },
      options: placed.options,
      answer: placed.answer,
      meta: {
        gaps: gaps, minGap: Math.min(gaps[0], gaps[1], gaps[2]), misleadingArms: misleading,
        mix: acute === 4 ? 'acute' : acute === 0 ? 'obtuse' : 'mixed', sorted: sorted
      }
    };
  }

  /* For a chosen (wrong) ordering, the smallest degree gap among the pairs the
     student put in the wrong order. This is the analyzer's "gap size" tag. */
  function missedGap(item, optionIndex) {
    var chosen = item.options[optionIndex].text.split('-').map(function (s) { return parseInt(s, 10) - 1; });
    var pos = {}; chosen.forEach(function (p, i) { pos[p] = i; });
    var d = item.figure.degs, best = null;
    for (var a = 0; a < 4; a++) for (var b = 0; b < 4; b++) {
      if (a === b || d[a] >= d[b]) continue;          // a truly smaller than b
      if (pos[a] > pos[b]) { var g = d[b] - d[a]; if (best === null || g < best) best = g; }
    }
    return best;
  }

  /* ---------- rendering (light paper panel, ink lines) ---------- */
  /* One common scale for all four panels (so relative arm lengths stay true),
     each angle centred on the bounding box of its vertex and two arm tips. */
  function geom(item, i) {
    var f = item.figure, d = f.degs[i], rot = f.rots[i], arm = f.arms[i];
    var a1 = rot * Math.PI / 180, a2 = (rot + d) * Math.PI / 180;
    var pts = [[0, 0], [arm[0] * Math.cos(a1), -arm[0] * Math.sin(a1)], [arm[1] * Math.cos(a2), -arm[1] * Math.sin(a2)]];
    var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    return { pts: pts, w: Math.max.apply(null, xs) - Math.min.apply(null, xs), h: Math.max.apply(null, ys) - Math.min.apply(null, ys),
      cx: (Math.max.apply(null, xs) + Math.min.apply(null, xs)) / 2, cy: (Math.max.apply(null, ys) + Math.min.apply(null, ys)) / 2 };
  }
  function panelSVG(item, i, size) {
    var S = size || 200, fit = 0;
    for (var k = 0; k < 4; k++) { var gk = geom(item, k); fit = Math.max(fit, gk.w, gk.h); }
    var sc = (S * 0.84) / fit, g = geom(item, i);
    var P = g.pts.map(function (p) { return [S / 2 + (p[0] - g.cx) * sc, S / 2 + (p[1] - g.cy) * sc]; });
    return '<svg class="pat-svg" viewBox="0 0 ' + S + ' ' + S + '" role="img" aria-label="Angle ' + (i + 1) + '">' +
      '<line x1="' + P[0][0].toFixed(1) + '" y1="' + P[0][1].toFixed(1) + '" x2="' + P[1][0].toFixed(1) + '" y2="' + P[1][1].toFixed(1) + '" stroke="#111" stroke-width="2.4" stroke-linecap="round"/>' +
      '<line x1="' + P[0][0].toFixed(1) + '" y1="' + P[0][1].toFixed(1) + '" x2="' + P[2][0].toFixed(1) + '" y2="' + P[2][1].toFixed(1) + '" stroke="#111" stroke-width="2.4" stroke-linecap="round"/>' +
      '</svg>';
  }
  function renderFigure(item) {
    var h = '<div class="pat-angles">';
    for (var i = 0; i < 4; i++) h += '<figure class="pat-panel"><div class="pat-paper">' + panelSVG(item, i) + '</div><figcaption>' + (i + 1) + '</figcaption></figure>';
    return h + '</div>';
  }
  function renderOption(item, i) { return '<span class="pat-opt-text">' + C.esc(item.options[i].text) + '</span>'; }
  /* review overlay: each angle with its true size */
  function renderTruth(item) {
    var h = '<div class="pat-angles">';
    var d = item.figure.degs;
    for (var i = 0; i < 4; i++) h += '<figure class="pat-panel"><div class="pat-paper">' + panelSVG(item, i) + '</div><figcaption>' + (i + 1) + ' : ' + d[i] + ' degrees</figcaption></figure>';
    return h + '</div>';
  }

  PAT.angles = { generate: generate, missedGap: missedGap, renderFigure: renderFigure, renderOption: renderOption, renderTruth: renderTruth, panelSVG: panelSVG };
  if (typeof module === 'object' && module.exports) module.exports = PAT;
})(typeof self !== 'undefined' ? self : globalThis);
