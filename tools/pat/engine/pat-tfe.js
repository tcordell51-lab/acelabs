/*
  pat-tfe.js : Top, Front, End view recognition (PAT questions 16-30).

  Two orthographic views are given; choose the missing third view (A-D).
  The missing view rotates between TOP, FRONT and END, as on the DAT.

  Object: a voxel solid (stepped heightmap with tunnels and notches) that is
  ONE face-connected piece (the Studio generator could split into two pieces
  when a tunnel ran along the floor; fixed here). Views are computed with exact
  hidden-line removal: solid where an edge can be seen, dashed where it is
  hidden behind material.

  Every distractor is proven wrong: a slice-by-slice search enumerates every
  connected solid in the box that produces the two GIVEN views, collects the
  missing views those solids produce, and rejects any distractor in that set.
  Coordinates: x = width (left to right), y = depth (front = 0), z = height.
    top   view: u = x, v = y (front of object at the bottom of the drawing)
    front view: u = x, v = z
    end   view: u = y, v = z, seen from the right (end-left = the front)
*/
(function (root) {
  'use strict';
  var PAT = root.PAT || (typeof require === 'function' ? require('./pat-core.js') : null);
  var C = PAT.core;

  /* hidden-line view of a solid given by an accessor O(u,v,w) in screen cells
     (u,v) and depth w; nearHi = the viewer is at the high-w side. */
  function buildView(nu, nv, nw, O, nearHi) {
    var segs = [], u, v, i, w, seq = [];
    if (nearHi) { for (w = nw - 1; w >= 0; w--) seq.push(w); } else { for (w = 0; w < nw; w++) seq.push(w); }
    for (v = 0; v <= nv; v++) for (u = 0; u < nu; u++) {
      var found = false, occl = false;
      for (i = 0; i < seq.length; i++) {
        w = seq[i];
        var a = (v - 1 >= 0) && O(u, v - 1, w), b = (v < nv) && O(u, v, w);
        if (a !== b) { found = true; break; } if (a && b) occl = true;
      }
      if (found) segs.push({ a: [u, v], b: [u + 1, v], dash: occl });
    }
    for (u = 0; u <= nu; u++) for (v = 0; v < nv; v++) {
      var found2 = false, occl2 = false;
      for (i = 0; i < seq.length; i++) {
        w = seq[i];
        var a2 = (u - 1 >= 0) && O(u - 1, v, w), b2 = (u < nu) && O(u, v, w);
        if (a2 !== b2) { found2 = true; break; } if (a2 && b2) occl2 = true;
      }
      if (found2) segs.push({ a: [u, v], b: [u, v + 1], dash: occl2 });
    }
    return segs;
  }
  function views(occ, dims) {
    var NX = dims[0], NY = dims[1], NZ = dims[2];
    var g = function (x, y, z) { return (x < 0 || y < 0 || z < 0 || x >= NX || y >= NY || z >= NZ) ? false : !!occ(x, y, z); };
    return {
      front: buildView(NX, NZ, NY, function (u, v, w) { return g(u, w, v); }, false),
      end: buildView(NY, NZ, NX, function (u, v, w) { return g(w, u, v); }, true),
      top: buildView(NX, NY, NZ, function (u, v, w) { return g(u, v, w); }, true)
    };
  }
  function viewOf(occ, dims, name) { return views(occ, dims)[name]; }
  function segKey(segs) {
    return segs.map(function (s) {
      var a = s.a, b = s.b;
      if (a[0] > b[0] || (a[0] === b[0] && a[1] > b[1])) { var t = a; a = b; b = t; }
      return a[0] + ',' + a[1] + ',' + b[0] + ',' + b[1] + ',' + (s.dash ? 1 : 0);
    }).sort().join('|');
  }

  /* ---------- object generator ---------- */
  function connected(V, dims) {
    var cells = [], k;
    for (var x = 0; x < dims[0]; x++) for (var y = 0; y < dims[1]; y++) for (var z = 0; z < dims[2]; z++) if (V[x][y][z]) cells.push([x, y, z]);
    if (!cells.length) return false;
    var seen = {}, st = [cells[0]]; seen[cells[0].join(',')] = 1;
    while (st.length) {
      var c = st.pop();
      [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].forEach(function (d) {
        var p = [c[0] + d[0], c[1] + d[1], c[2] + d[2]];
        if (p[0] < 0 || p[1] < 0 || p[2] < 0 || p[0] >= dims[0] || p[1] >= dims[1] || p[2] >= dims[2]) return;
        k = p.join(','); if (!seen[k] && V[p[0]][p[1]][p[2]]) { seen[k] = 1; st.push(p); }
      });
    }
    return Object.keys(seen).length === cells.length;
  }
  function fillsBox(V, dims) {        // every face of the bounding box is touched (no phantom margin)
    var NX = dims[0], NY = dims[1], NZ = dims[2];
    function any(f) { for (var x = 0; x < NX; x++) for (var y = 0; y < NY; y++) for (var z = 0; z < NZ; z++) if (V[x][y][z] && f(x, y, z)) return true; return false; }
    return any(function (x) { return x === 0; }) && any(function (x) { return x === NX - 1; }) &&
      any(function (x, y) { return y === 0; }) && any(function (x, y) { return y === NY - 1; }) &&
      any(function (x, y, z) { return z === 0; }) && any(function (x, y, z) { return z === NZ - 1; });
  }
  function makeObject(rng) {
    for (var att = 0; att < 400; att++) {
      var NX = 3 + rng.int(2), NY = 3, NZ = 3;
      var V = [], x, y, z;
      for (x = 0; x < NX; x++) { V.push([]); for (y = 0; y < NY; y++) { V[x].push([]); for (z = 0; z < NZ; z++) V[x][y].push(false); } }
      for (x = 0; x < NX; x++) for (y = 0; y < NY; y++) { var h = 1 + rng.int(NZ); for (z = 0; z < h; z++) V[x][y][z] = true; }
      var feats = [];
      if (rng.chance(0.8)) {           // tunnel straight through along x or y
        for (var t = 0; t < 20; t++) {
          var ax = rng.int(2);
          if (ax === 0) { var y0 = rng.int(NY), z0 = rng.int(NZ - 1), ok = true; for (x = 0; x < NX; x++) if (!V[x][y0][z0] || !V[x][y0][z0 + 1]) ok = false; if (ok) { for (x = 0; x < NX; x++) V[x][y0][z0] = false; feats.push('tunnel'); break; } }
          else { var x0 = rng.int(NX), z1 = rng.int(NZ - 1), ok2 = true; for (y = 0; y < NY; y++) if (!V[x0][y][z1] || !V[x0][y][z1 + 1]) ok2 = false; if (ok2) { for (y = 0; y < NY; y++) V[x0][y][z1] = false; feats.push('tunnel'); break; } }
        }
      }
      if (rng.chance(0.6)) {            // an overhang: carve under a block that stays up
        var xo = rng.int(NX), yo = rng.int(NY);
        if (V[xo][yo][1] && V[xo][yo][0] && rng.chance(0.5)) { V[xo][yo][0] = false; feats.push('overhang'); }
      }
      if (!connected(V, [NX, NY, NZ]) || !fillsBox(V, [NX, NY, NZ])) continue;
      var occ = (function (VV) { return function (a, b, c) { return !!VV[a][b][c]; }; })(V);
      var vs = views(occ, [NX, NY, NZ]);
      var dashes = vs.front.concat(vs.end, vs.top).filter(function (s) { return s.dash; }).length;
      if (dashes < 2) continue;
      return { V: V, dims: [NX, NY, NZ], occ: occ, views: vs, feats: feats };
    }
    throw new Error('tfe: no object');
  }

  /* ---------- solver: every missing view consistent with the two given ---------- */
  function validMissingKeys(dims, given, missing, limit) {
    var NX = dims[0], NY = dims[1], NZ = dims[2], N = dims;
    var sAxis = { end: 0, front: 1, top: 2 }[missing];
    var others = [0, 1, 2].filter(function (k) { return k !== sAxis; });
    var n1 = N[others[0]], n2 = N[others[1]], ns = N[sAxis];
    var vnames = Object.keys(given);
    var axes = { front: [0, 2], top: [0, 1], end: [1, 2] };
    var sIdx = {}; vnames.forEach(function (v) { sIdx[v] = axes[v].indexOf(sAxis); });
    function classOf(v, s) { var i = sIdx[v], a = s.a[i], b = s.b[i]; return a !== b ? { band: Math.min(a, b) } : { line: a }; }
    var tgtBand = {}, tgtLine = {};
    vnames.forEach(function (v) {
      var band = [], line = [], k;
      for (k = 0; k < ns; k++) band.push([]);
      for (k = 0; k <= ns; k++) line.push([]);
      given[v].split('|').filter(Boolean).forEach(function (key) {
        var p = key.split(',').map(Number), s = { a: [p[0], p[1]], b: [p[2], p[3]] }, c = classOf(v, s);
        if (c.band != null) band[c.band].push(key); else line[c.line].push(key);
      });
      tgtBand[v] = band.map(function (a) { return a.sort().join('|'); });
      tgtLine[v] = line.map(function (a) { return a.sort().join('|'); });
    });
    function occFrom(sl) {
      return function (x, y, z) {
        var p = [x, y, z], m = sl[p[sAxis]];
        if (!m) return false;
        return !!(m & (1 << (p[others[0]] * n2 + p[others[1]])));
      };
    }
    function partKey(v, sl, pred) {
      return viewOf(occFrom(sl), dims, v).filter(function (s) { return pred(classOf(v, s)); }).map(function (s) { return segKey([s]); }).sort().join('|');
    }
    var total = 1 << (n1 * n2), cand = [];
    for (var k = 0; k < ns; k++) {
      var list = [];
      for (var m = 0; m < total; m++) {
        var sl = []; for (var q = 0; q < ns; q++) sl.push(0); sl[k] = m;
        var ok = true;
        for (var vi = 0; vi < vnames.length; vi++) { var v = vnames[vi]; if (partKey(v, sl, function (c) { return c.band === k; }) !== tgtBand[v][k]) { ok = false; break; } }
        if (ok) list.push(m);
      }
      cand.push(list);
    }
    var keys = {}, nodes = 0, aborted = false, cur = [];
    for (var q2 = 0; q2 < ns; q2++) cur.push(0);
    function lineOk(k) {
      var sl = []; for (var q = 0; q < ns; q++) sl.push(0);
      if (k - 1 >= 0) sl[k - 1] = cur[k - 1];
      if (k < ns) sl[k] = cur[k];
      for (var vi = 0; vi < vnames.length; vi++) { var v = vnames[vi]; if (partKey(v, sl, function (c) { return c.line === k; }) !== tgtLine[v][k]) return false; }
      return true;
    }
    function isConnected() {
      var occ = occFrom(cur), V = [];
      for (var x = 0; x < NX; x++) { V.push([]); for (var y = 0; y < NY; y++) { V[x].push([]); for (var z = 0; z < NZ; z++) V[x][y].push(occ(x, y, z)); } }
      return connected(V, dims);
    }
    (function dfs(k) {
      if (aborted) return;
      if (++nodes > (limit || 400000)) { aborted = true; return; }
      if (k === ns) {
        if (!lineOk(ns) || !isConnected()) return;
        keys[segKey(viewOf(occFrom(cur), dims, missing))] = 1;
        return;
      }
      for (var i = 0; i < cand[k].length; i++) { cur[k] = cand[k][i]; if (lineOk(k)) dfs(k + 1); }
      cur[k] = 0;
    })(0);
    return { keys: keys, aborted: aborted, nodes: nodes };
  }

  /* ---------- item ---------- */
  function generate(seed) {
    var rng = C.makeRng(seed);
    for (var att = 0; att < 60; att++) {
      var obj = makeObject(rng);
      var r = rng.next(), missing = r < 0.4 ? 'end' : r < 0.7 ? 'front' : 'top';
      var givenNames = ['top', 'front', 'end'].filter(function (n) { return n !== missing; });
      var given = {}; givenNames.forEach(function (n) { given[n] = segKey(obj.views[n]); });
      var sol = validMissingKeys(obj.dims, given, missing);
      if (sol.aborted) continue;
      var truth = obj.views[missing], tKey = segKey(truth);
      if (!sol.keys[tKey]) continue;          // cannot happen unless the solver disagrees with the generator
      var dims = obj.dims, NX = dims[0], NY = dims[1], NZ = dims[2];
      var used = {}; used[tKey] = 1;
      var cands = [];
      // mirror: the object reversed along the axis students most often flip
      var mirror = function (VV) {
        return function (x, y, z) {
          if (missing === 'end' || missing === 'top') return !!VV[x][NY - 1 - y][z];     // front/back swapped
          return !!VV[NX - 1 - x][y][z];                                               // left/right swapped
        };
      };
      cands.push({ segs: viewOf(mirror(obj.V), dims, missing), trap: 'mirror' });
      // hidden edge drawn solid / visible edge drawn dashed
      truth.forEach(function (s, i) {
        var c = truth.map(function (t) { return { a: t.a, b: t.b, dash: t.dash }; });
        c[i] = { a: s.a, b: s.b, dash: !s.dash };
        cands.push({ segs: c, trap: s.dash ? 'dash-as-solid' : 'solid-as-dash', single: true });
      });
      // a step in the wrong place: toggle one or two voxels
      for (var t = 0; t < 40; t++) {
        var VV = obj.V.map(function (a) { return a.map(function (b) { return b.slice(); }); });
        var nT = rng.chance(0.5) ? 1 : 2;
        for (var q = 0; q < nT; q++) { var x = rng.int(NX), y = rng.int(NY), z = rng.int(NZ); VV[x][y][z] = !VV[x][y][z]; }
        if (!connected(VV, dims)) continue;
        cands.push({ segs: viewOf(function (a, b, c) { return !!VV[a][b][c]; }, dims, missing), trap: 'profile' });
      }
      // keep only provably wrong, distinct candidates; take one of each family first
      var fam = {};
      cands.forEach(function (cd) {
        var k = segKey(cd.segs);
        if (sol.keys[k] || used[k]) return;
        if (!cd.segs.length) return;
        cd.key = k; (fam[cd.trap] = fam[cd.trap] || []).push(cd);
      });
      Object.keys(fam).forEach(function (f) { rng.shuffle(fam[f]); });
      // a single dash flip is the subtle DAT trap; prefer the flip that matters (hidden edge drawn solid)
      var order = ['mirror', 'dash-as-solid', 'profile', 'solid-as-dash', 'profile', 'profile'];
      var picked = [], idx = {};
      for (var o = 0; o < order.length && picked.length < 3; o++) {
        var list = fam[order[o]]; if (!list) continue;
        var j = idx[order[o]] || 0;
        while (j < list.length && used[list[j].key]) j++;
        idx[order[o]] = j + 1;
        if (j < list.length) { used[list[j].key] = 1; picked.push(list[j]); }
      }
      if (picked.length < 3) continue;
      var placed = C.placeAnswer(rng, { segs: truth, trap: null }, picked.map(function (p) { return { segs: p.segs, trap: p.trap }; }));
      var dashRuns = mergeRuns(truth).filter(function (s) { return s.dash; }).length;
      return {
        type: 'tfe', seed: seed,
        prompt: 'Choose the correct ' + missing.toUpperCase() + ' view.',
        figure: { dims: dims, missing: missing, given: givenNames.reduce(function (acc, n) { acc[n] = obj.views[n]; return acc; }, {}), V: obj.V },
        options: placed.options,
        answer: placed.answer,
        meta: { missing: missing, hiddenLines: dashRuns, feats: obj.feats, validMissing: Object.keys(sol.keys).length }
      };
    }
    throw new Error('tfe: no item for seed ' + seed);
  }

  /* merge collinear unit segments with the same dash state into runs */
  function mergeRuns(segs) {
    var H = {}, Vt = {};
    segs.forEach(function (s) {
      if (s.a[1] === s.b[1]) { var y = s.a[1], x = Math.min(s.a[0], s.b[0]); (H[y + ':' + (s.dash ? 1 : 0)] = H[y + ':' + (s.dash ? 1 : 0)] || []).push(x); }
      else { var xx = s.a[0], yy = Math.min(s.a[1], s.b[1]); (Vt[xx + ':' + (s.dash ? 1 : 0)] = Vt[xx + ':' + (s.dash ? 1 : 0)] || []).push(yy); }
    });
    var out = [];
    Object.keys(H).forEach(function (k) {
      var p = k.split(':'), y = +p[0], dash = p[1] === '1';
      var xs = H[k].sort(function (a, b) { return a - b; }), st = xs[0], prev = xs[0];
      for (var i = 1; i <= xs.length; i++) {
        if (i < xs.length && xs[i] === prev + 1) { prev = xs[i]; continue; }
        out.push({ a: [st, y], b: [prev + 1, y], dash: dash }); st = xs[i]; prev = xs[i];
      }
    });
    Object.keys(Vt).forEach(function (k) {
      var p = k.split(':'), x = +p[0], dash = p[1] === '1';
      var ys = Vt[k].sort(function (a, b) { return a - b; }), st = ys[0], prev = ys[0];
      for (var i = 1; i <= ys.length; i++) {
        if (i < ys.length && ys[i] === prev + 1) { prev = ys[i]; continue; }
        out.push({ a: [x, st], b: [x, prev + 1], dash: dash }); st = ys[i]; prev = ys[i];
      }
    });
    return out;
  }

  /* ---------- rendering ---------- */
  var CELL = 26;
  function viewSVG(segs, nu, nv, flipV) {
    // flipV: v grows upward on paper for front/end (height); for top, v=y grows toward the BACK (up the page)
    var pad = 10, w = nu * CELL + pad * 2, h = nv * CELL + pad * 2;
    var o = '<svg class="pat-svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">';
    var runs = mergeRuns(segs);
    runs.sort(function (a, b) { return (a.dash ? 0 : 1) - (b.dash ? 0 : 1); });     // solid on top of dashed
    runs.forEach(function (s) {
      var x1 = pad + s.a[0] * CELL, x2 = pad + s.b[0] * CELL;
      var y1 = pad + (nv - s.a[1]) * CELL, y2 = pad + (nv - s.b[1]) * CELL;
      o += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#111" stroke-width="' + (s.dash ? 1.8 : 2.4) + '"' + (s.dash ? ' stroke-dasharray="6 4"' : '') + ' stroke-linecap="butt"/>';
    });
    return o + '</svg>';
  }
  function dimsOf(name, dims) { return name === 'top' ? [dims[0], dims[1]] : name === 'front' ? [dims[0], dims[2]] : [dims[1], dims[2]]; }
  function renderFigure(item) {
    var f = item.figure, d = f.dims;
    function cell(name) {
      if (name === f.missing) return '<div class="tfe-slot tfe-missing"><span>' + name.toUpperCase() + '</span></div>';
      var wh = dimsOf(name, d);
      return '<div class="tfe-slot"><div class="pat-paper">' + viewSVG(f.given[name], wh[0], wh[1]) + '</div><span class="tfe-lab">' + name.toUpperCase() + '</span></div>';
    }
    return '<div class="tfe-board"><div class="tfe-top">' + cell('top') + '</div><div class="tfe-bottom">' + cell('front') + cell('end') + '</div></div>';
  }
  function renderOption(item, i) {
    var wh = dimsOf(item.figure.missing, item.figure.dims);
    return '<div class="pat-paper pat-small">' + viewSVG(item.options[i].segs, wh[0], wh[1]) + '</div>';
  }

  PAT.tfe = { generate: generate, renderFigure: renderFigure, renderOption: renderOption, views: views, segKey: segKey, validMissingKeys: validMissingKeys, mergeRuns: mergeRuns };
  if (typeof module === 'object' && module.exports) module.exports = PAT;
})(typeof self !== 'undefined' ? self : globalThis);
