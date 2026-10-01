/*
  pat-tfe-csg.js : machined-part Top/Front/End items (engine v2).

  The object is a 5 x 4 x 3 block (optionally turned a quarter turn) with
  real machining features, so the views carry slanted lines, circles, nested
  hidden circles and curved cut-outs, as the official samples do:
    front and back top edges : none | chamfer (45 degrees) | step | cove (concave quarter round)
    top feature (x = 1.5 or 3.5, centred in depth) :
      cylinder boss | boss with a through hole | frustum | frustum with a hole | cone |
      round through hole | counterbore from the top | counterbore from the bottom |
      square through hole | square boss
    side feature : round hole front-to-back (x = 1.5 or 3.5) | round hole end-to-end |
      U-slot in the left or right end | bottom channel
  Views are exact hidden-line drawings from the geometry kernel (pat-solid.js).

  Every distractor is proven wrong inside this family: the engine enumerates
  every member of the family (about two thousand objects), keeps the ones whose
  two GIVEN views match the item's exactly, and rejects any distractor that
  matches a missing view one of those objects could produce. The independent
  verifier (scripts/pat/verify.js) repeats the search with its own code.
*/
(function (root) {
  'use strict';
  var PAT = root.PAT || (typeof require === 'function' ? require('./pat-core.js') : null);
  var C = PAT.core, S = PAT.solid;

  var W = 5, D = 4, H = 3;
  var EDGES = ['none', 'chamfer', 'step', 'cove'];
  var TOPS = ['none', 'cyl', 'cylhole', 'frustum', 'frustumhole', 'cone', 'hole', 'cbore', 'cboreb', 'sqhole', 'sqboss'];
  var SIDES = ['none', 'yhole', 'xhole', 'uslotR', 'uslotL', 'channel'];
  var THROUGH = { cylhole: 1, frustumhole: 1, hole: 1, cbore: 1, cboreb: 1, sqhole: 1 };
  var XS = [1.5, 3.5];

  function compatible(p) {
    if (p.side.k === 'yhole' && THROUGH[p.top.k] && p.side.x === p.top.x) return false;
    if (p.side.k === 'xhole' && THROUGH[p.top.k]) return false;
    return true;
  }
  /* all members of the family, in a fixed order */
  var FAMILY = (function () {
    var out = [];
    EDGES.forEach(function (ef) { EDGES.forEach(function (eb) {
      var tops = [{ k: 'none', x: 0 }];
      TOPS.slice(1).forEach(function (k) { XS.forEach(function (x) { tops.push({ k: k, x: x }); }); });
      var sides = [{ k: 'none', x: 0 }, { k: 'yhole', x: 1.5 }, { k: 'yhole', x: 3.5 }, { k: 'xhole', x: 0 }, { k: 'uslotR', x: 0 }, { k: 'uslotL', x: 0 }, { k: 'channel', x: 0 }];
      tops.forEach(function (t) { sides.forEach(function (s) { var p = { ef: ef, eb: eb, top: t, side: s }; if (compatible(p)) out.push(p); }); });
    }); });
    return out;
  })();
  function pkey(p) { return p.ef + '/' + p.eb + '/' + p.top.k + '@' + p.top.x + '/' + p.side.k + '@' + p.side.x; }

  function vcyl(x, y, r, s0, s1) { return { t: 'cyl', ax: 2, c: [x, y], r: r, s0: s0, s1: s1 }; }
  /* canonical-frame CSG for one member */
  function build(p) {
    var adds = [{ t: 'box', lo: [0, 0, 0], hi: [W, D, H] }], subs = [], cy = D / 2, x = p.top.x;
    [['ef', 0], ['eb', 1]].forEach(function (e) {
      var k = p[e[0]], back = e[1] === 1;
      if (k === 'chamfer') subs.push(back ? { t: 'hs', lo: [-0.5, D - 1, H - 1], hi: [W + 0.5, D, H], planes: [[0, -1, -1, -(D + H - 1)]] }
        : { t: 'hs', lo: [-0.5, 0, H - 1], hi: [W + 0.5, 1, H], planes: [[0, 1, -1, 1 - H]] });
      else if (k === 'step') subs.push(back ? { t: 'box', lo: [-0.5, D - 1, H - 1], hi: [W + 0.5, D + 0.5, H + 0.5] } : { t: 'box', lo: [-0.5, -0.5, H - 1], hi: [W + 0.5, 1, H + 0.5] });
      else if (k === 'cove') subs.push({ t: 'cyl', ax: 0, c: [back ? D : 0, H], r: 1, s0: -0.5, s1: W + 0.5 });
    });
    var t = p.top.k;
    if (t === 'cyl' || t === 'cylhole') adds.push(vcyl(x, cy, 0.75, H, H + 1));
    if (t === 'frustum' || t === 'frustumhole') adds.push({ t: 'cone', ax: 2, c: [x, cy], r0: 0.8, r1: 0.45, s0: H, s1: H + 1 });
    if (t === 'cone') adds.push({ t: 'cone', ax: 2, c: [x, cy], r0: 0.8, r1: 0, s0: H, s1: H + 1 });
    if (t === 'sqboss') adds.push({ t: 'box', lo: [x - 0.6, cy - 0.6, H], hi: [x + 0.6, cy + 0.6, H + 1] });
    if (t === 'cylhole') subs.push(vcyl(x, cy, 0.4, -0.5, H + 1.5));
    if (t === 'frustumhole') subs.push(vcyl(x, cy, 0.3, -0.5, H + 1.5));
    if (t === 'hole') subs.push(vcyl(x, cy, 0.5, -0.5, H + 0.5));
    if (t === 'cbore') subs.push(vcyl(x, cy, 0.7, H - 1, H + 0.5), vcyl(x, cy, 0.35, -0.5, H + 0.5));
    if (t === 'cboreb') subs.push(vcyl(x, cy, 0.7, -0.5, 1), vcyl(x, cy, 0.35, -0.5, H + 0.5));
    if (t === 'sqhole') subs.push({ t: 'box', lo: [x - 0.5, cy - 0.5, -0.5], hi: [x + 0.5, cy + 0.5, H + 0.5] });
    var s = p.side.k;
    if (s === 'yhole') subs.push({ t: 'cyl', ax: 1, c: [1, p.side.x], r: 0.5, s0: -0.5, s1: D + 0.5 });
    if (s === 'xhole') subs.push({ t: 'cyl', ax: 0, c: [cy, 1], r: 0.5, s0: -0.5, s1: W + 0.5 });
    if (s === 'uslotR') subs.push(vcyl(W, cy, 0.6, -0.5, H + 0.5));
    if (s === 'uslotL') subs.push(vcyl(0, cy, 0.6, -0.5, H + 0.5));
    if (s === 'channel') subs.push({ t: 'box', lo: [2.3, -0.5, -0.5], hi: [2.7, D + 0.5, 1] });
    var u = adds.length === 1 ? adds[0] : { op: 'u', a: adds };
    return subs.length ? { op: 'd', a: [u].concat(subs) } : u;
  }
  /* orientation: 0 as built, 1 a quarter turn about the vertical (dims become D x W) */
  var ROT = [
    { m: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], o: [0, 0, 0] },
    { m: [[0, 1, 0], [-1, 0, 0], [0, 0, 1]], o: [0, W, 0] }
  ];
  function solidOf(p, rot) { return S.transform(build(p), ROT[rot]); }
  function dimsOf(rot) { return rot ? [D, W, H + 1] : [W, D, H + 1]; }
  /* fixed drawing window per view (object extent plus a margin) */
  function windowOf(view, rot) {
    var d = dimsOf(rot), m = 0.25;
    if (view === 'front') return [-m, -m, d[0] + m, d[2] + m];
    if (view === 'top') return [-m, -m, d[0] + m, d[1] + m];
    return [-m, -m, d[1] + m, d[2] + m];
  }
  var R_COARSE = 6, R_FINE = 24, K_DIFF = 4;

  /* ---------- family search with probe pairs (fast, exact on survivors) ---------- */
  var memberCache = {};
  function member(i, rot) {
    var k = rot + ':' + i;
    return memberCache[k] || (memberCache[k] = solidOf(FAMILY[i], rot));
  }
  function pairStateAt(Sd, V, G, sigCache, horiz, idx) {
    var i, j, i2, j2;
    if (horiz) { i = Math.floor(idx / G.nv); j = idx % G.nv; i2 = i + 1; j2 = j; }
    else { i = Math.floor(idx / (G.nv - 1)); j = idx % (G.nv - 1); i2 = i; j2 = j + 1; }
    var sg = function (a, b) {
      var key = a * 4096 + b;
      if (!(key in sigCache)) {
        var o = S.unproj(V, G.u(a), G.v(b)), iv = S.ray(Sd, o, V.d), ks = [];
        for (var q = iv.length - 1; q >= 0; q--) ks.push(iv[q][3], iv[q][2]);
        sigCache[key] = ks;
      }
      return sigCache[key];
    };
    var A = sg(i, j), B = sg(i2, j2), n = Math.max(A.length, B.length);
    for (var k = 0; k < n; k++) if (A[k] !== B[k]) return k === 0 ? 1 : 2;
    return 0;
  }
  function consistentMembers(target, rot, givenNames, rng) {
    var maps = givenNames.map(function (n) { return S.lineMap(target, S.VIEWS[n], windowOf(n, rot), R_COARSE); });
    var probes = maps.map(function (M) {
      var ps = [];
      for (var k = 0; k < M.H.length; k++) if (M.H[k] || rng.chance(0.08)) ps.push([true, k, M.H[k]]);
      for (var k2 = 0; k2 < M.V.length; k2++) if (M.V[k2] || rng.chance(0.08)) ps.push([false, k2, M.V[k2]]);
      return ps;
    });
    var keys = maps.map(S.mapKey), out = [];
    for (var i = 0; i < FAMILY.length; i++) {
      var Sd = member(i, rot), ok = true;
      for (var v = 0; v < givenNames.length && ok; v++) {
        var V = S.VIEWS[givenNames[v]], G = maps[v].G, cache = {}, ps = probes[v];
        for (var q = 0; q < ps.length; q++) if (pairStateAt(Sd, V, G, cache, ps[q][0], ps[q][1]) !== ps[q][2]) { ok = false; break; }
      }
      if (!ok) continue;
      for (var v2 = 0; v2 < givenNames.length && ok; v2++) if (S.mapKey(S.lineMap(Sd, S.VIEWS[givenNames[v2]], windowOf(givenNames[v2], rot), R_COARSE)) !== keys[v2]) ok = false;
      if (ok) out.push(i);
    }
    return out;
  }

  /* ---------- drawing groups (for dash-flip traps) ---------- */
  function groups(prims) {
    var g = {};
    prims.forEach(function (p, i) {
      var k;
      if (p.k === 'A') k = 'A' + p.c.join(',') + ':' + p.r;
      else { var dx = p.b[0] - p.a[0], dy = p.b[1] - p.a[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l; if (nx < -1e-9 || (Math.abs(nx) < 1e-9 && ny < 0)) { nx = -nx; ny = -ny; } k = 'L' + S.r6(nx) + ',' + S.r6(ny) + ':' + S.r6(nx * p.a[0] + ny * p.a[1]); }
      k += p.dash ? ':h' : ':v';
      (g[k] = g[k] || []).push(i);
    });
    return Object.keys(g).map(function (k) { return g[k]; });
  }

  function interesting(p) {
    var n = (p.ef !== 'none') + (p.eb !== 'none') + (p.side.k !== 'none');
    return p.top.k !== 'none' && n >= 1 && n <= 2;
  }

  function generate(seed) {
    var rng = C.makeRng(seed);
    for (var att = 0; att < 40; att++) {
      var p;
      do { p = rng.pick(FAMILY); } while (!interesting(p));
      var rot = rng.int(2);
      var r = rng.next(), missing = r < 0.4 ? 'end' : r < 0.7 ? 'front' : 'top';
      var givenNames = ['top', 'front', 'end'].filter(function (n) { return n !== missing; });
      var Sd = solidOf(p, rot), views = {}, bad = false;
      ['top', 'front', 'end'].forEach(function (n) {
        views[n] = S.drawing(Sd, S.VIEWS[n]);
        // self-check: the vector drawing must match the raster line map exactly
        var M = S.lineMap(Sd, S.VIEWS[n], windowOf(n, rot), R_FINE);
        if (S.mapDiff(M, S.vectorMap(views[n], M.G), S.endpoints(views[n])) !== 0) bad = true;
      });
      if (bad) continue;
      var cons = consistentMembers(Sd, rot, givenNames, rng);
      var MV = S.VIEWS[missing], win = windowOf(missing, rot);
      var valid = cons.map(function (i) { return S.lineMap(member(i, rot), MV, win, R_FINE); });
      var G = valid[0].G;
      var truth = views[missing];
      // candidate distractors
      var cands = [];
      var mir = missing === 'front' ? { m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]], o: [dimsOf(rot)[0], 0, 0] } : { m: [[1, 0, 0], [0, -1, 0], [0, 0, 1]], o: [0, dimsOf(rot)[1], 0] };
      cands.push({ prims: S.drawing(S.transform(Sd, mir), MV), trap: 'mirror' });
      groups(truth).forEach(function (gr) {
        var flipped = truth.map(function (q, i) { return gr.indexOf(i) >= 0 ? Object.assign({}, q, { dash: !q.dash }) : q; });
        cands.push({ prims: flipped, trap: truth[gr[0]].dash ? 'dash-as-solid' : 'solid-as-dash' });
      });
      var alts = [];
      EDGES.forEach(function (e) { if (e !== p.ef) alts.push(Object.assign({}, p, { ef: e })); if (e !== p.eb) alts.push(Object.assign({}, p, { eb: e })); });
      TOPS.forEach(function (k) { if (k !== 'none' && k !== p.top.k) alts.push(Object.assign({}, p, { top: { k: k, x: p.top.x } })); });
      if (p.top.k !== 'none') alts.push(Object.assign({}, p, { top: { k: p.top.k, x: 5 - p.top.x } }));
      SIDES.forEach(function (k) { if (k !== p.side.k) alts.push(Object.assign({}, p, { side: { k: k, x: k === 'yhole' ? rng.pick(XS) : 0 } })); });
      rng.shuffle(alts).slice(0, 10).forEach(function (q) {
        if (!compatible(q)) return;
        cands.push({ prims: S.drawing(solidOf(q, rot), MV), trap: (q.ef === 'none' && p.ef !== 'none') || (q.eb === 'none' && p.eb !== 'none') || (q.side.k === 'none' && p.side.k !== 'none') ? 'dropped' : 'feature' });
      });
      // keep only distractors proven different from every valid missing view
      var fam = {};
      cands.forEach(function (cd) {
        if (!cd.prims.length) return;
        cd.map = S.vectorMap(cd.prims, G); cd.junc = S.endpoints(cd.prims);
        for (var v = 0; v < valid.length; v++) if (S.mapDiff(valid[v], cd.map, cd.junc) < K_DIFF) return;
        (fam[cd.trap] = fam[cd.trap] || []).push(cd);
      });
      Object.keys(fam).forEach(function (f) { rng.shuffle(fam[f]); });
      var order = ['mirror', 'dash-as-solid', 'feature', 'solid-as-dash', 'dropped', 'feature', 'dash-as-solid'];
      var picked = [], idx = {};
      for (var o = 0; o < order.length && picked.length < 3; o++) {
        var list = fam[order[o]]; if (!list) continue;
        var j = idx[order[o]] || 0;
        while (j < list.length && picked.some(function (pk) { return S.mapDiff(pk.map, list[j].map, pk.junc.concat(list[j].junc)) < K_DIFF; })) j++;
        idx[order[o]] = j + 1;
        if (j < list.length) picked.push(list[j]);
      }
      if (picked.length < 3) continue;
      var placed = C.placeAnswer(rng, { prims: truth, trap: null }, picked.map(function (pk) { return { prims: pk.prims, trap: pk.trap }; }));
      var hidden = groups(truth).filter(function (gr) { return truth[gr[0]].dash; }).length;
      return {
        type: 'tfe', seed: seed,
        prompt: 'Choose the correct ' + missing.toUpperCase() + ' view.',
        figure: { kind: 'machined', family: 'tfe-machined-v1', params: p, rot: rot, csg: Sd, missing: missing, given: givenNames.reduce(function (acc, n) { acc[n] = views[n]; return acc; }, {}), windows: { top: windowOf('top', rot), front: windowOf('front', rot), end: windowOf('end', rot) } },
        options: placed.options,
        answer: placed.answer,
        meta: { missing: missing, hiddenLines: hidden, shape: 'machined', feats: [p.ef, p.eb, p.top.k, p.side.k], validMissing: cons.length }
      };
    }
    throw new Error('tfe machined: no item for seed ' + seed);
  }

  /* ---------- rendering ---------- */
  var CELL = 26;
  function viewSVG(prims, win) {
    var pad = 8, w = (win[2] - win[0]) * CELL + pad * 2, h = (win[3] - win[1]) * CELL + pad * 2;
    var X = function (u) { return pad + (u - win[0]) * CELL; }, Y = function (v) { return pad + (win[3] - v) * CELL; };
    var o = '<svg class="pat-svg tfe-fixed" viewBox="0 0 ' + w.toFixed(0) + ' ' + h.toFixed(0) + '" width="' + w.toFixed(0) + '" height="' + h.toFixed(0) + '">';
    prims.slice().sort(function (a, b) { return (a.dash ? 0 : 1) - (b.dash ? 0 : 1); }).forEach(function (p) {
      o += '<path d="' + S.primPath(p, X, Y) + '" fill="none" stroke="#111" stroke-width="' + (p.dash ? 1.7 : 2.3) + '"' + (p.dash ? ' stroke-dasharray="5 3.5"' : '') + ' stroke-linecap="butt" stroke-linejoin="round"/>';
    });
    return o + '</svg>';
  }
  function renderFigure(item) {
    var f = item.figure;
    function cell(name) {
      var win = f.windows[name], w = (win[2] - win[0]) * CELL + 16, h = (win[3] - win[1]) * CELL + 16;
      if (name === f.missing) return '<div class="tfe-slot"><div class="tfe-missing" style="width:' + (w + 20) + 'px;height:' + (h + 20) + 'px"><span>' + name.toUpperCase() + '</span></div><span class="tfe-lab">&nbsp;</span></div>';
      return '<div class="tfe-slot"><div class="pat-paper">' + viewSVG(f.given[name], win) + '</div><span class="tfe-lab">' + name.toUpperCase() + '</span></div>';
    }
    return '<div class="tfe-board"><div class="tfe-top">' + cell('top') + '</div><div class="tfe-bottom">' + cell('front') + cell('end') + '</div></div>';
  }
  function renderOption(item, i) { return '<div class="pat-paper pat-small">' + viewSVG(item.options[i].prims, item.figure.windows[item.figure.missing]) + '</div>'; }

  PAT.tfeCSG = { generate: generate, renderFigure: renderFigure, renderOption: renderOption, FAMILY: FAMILY, build: build, solidOf: solidOf, windowOf: windowOf, pkey: pkey, groups: groups, R_FINE: R_FINE, K_DIFF: K_DIFF, ROT: ROT };
  if (typeof module === 'object' && module.exports) module.exports = PAT;
})(typeof self !== 'undefined' ? self : globalThis);
