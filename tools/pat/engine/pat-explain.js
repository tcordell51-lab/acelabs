/*
  pat-explain.js : per-item worked explanations for every PAT question type.

  PAT.explain(item, chosen) -> { answer, steps: [{ text }], traps: { optionIndex: text },
                                 trapKeys: { optionIndex: key }, check: { q, a }, sources, type }
  PAT.explain.html(ex, { chosen })  -> the review panel markup (styles: tools/pat/pat-explain.css)
  PAT.explain.trapOf(item, i)       -> the trap family of option i (cube counting is computed here)
  PAT.explain.figure(item)          -> the review figure (pattern folding: faces numbered)

  Every number and fact in the text is computed from the item itself (the same data
  the engines generate and the verifiers check). Nothing here draws a random number,
  so explaining an item never changes it: saved attempts still map seed for seed.
  The shape follows docs/EXPLANATION-STANDARD.md: the answer, 3 to 5 steps, one trap
  line per wrong choice, check yourself, sources. No trick line: none is recorded for
  PAT, and none is invented.
*/
(function (root) {
  'use strict';
  var PAT = root.PAT || (typeof require === 'function' ? require('./pat-core.js') : null);
  var LET = ['A', 'B', 'C', 'D', 'E'];
  var SOURCES = ['Every number above is computed from this question\'s own figure by the Ace PAT engine.'];

  function ch(i) { return 'Choice ' + LET[i]; }
  function pl(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function listAnd(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function r1(x) { var v = Math.round(x * 10) / 10; return String(v); }
  function S(t) { return { text: t }; }

  /* ================= angle ranking ================= */
  function parseOrder(t) { return String(t).split('-').map(function (s) { return parseInt(s, 10) - 1; }); }
  function angles(it) {
    var d = it.figure.degs, ord = [0, 1, 2, 3].sort(function (a, b) { return d[a] - d[b]; });
    var nm = function (i) { return i + 1; };
    var gaps = [0, 1, 2].map(function (r) { return { r: r, g: d[ord[r + 1]] - d[ord[r]] }; });
    var close = gaps.slice().sort(function (a, b) { return a.g - b.g || a.r - b.r; })[0];
    var lo = ord[close.r], hi = ord[close.r + 1];
    var steps = [
      S('True sizes: ' + d.map(function (x, i) { return nm(i) + ' = ' + x; }).join(', ') + ' degrees.'),
      S('Lock the ends: **' + nm(ord[0]) + '** is smallest, ' + nm(ord[3]) + ' is largest.'),
      S('Closest pair: angle ' + nm(lo) + ' at ' + d[lo] + ' and angle ' + nm(hi) + ' at ' + d[hi] + ', ' + close.g + ' apart.')
    ];
    var arms = it.figure.arms;
    if (arms) {
      var len = arms.map(function (a) { return a[0] + a[1]; });
      var longest = len.indexOf(Math.max.apply(null, len));
      if (longest !== ord[3]) steps.push(S('Ignore arm length: angle ' + nm(longest) + ' has the longest arms but is ' + (longest === ord[0] ? 'the smallest.' : 'not the largest.')));
    }
    steps.push(S('So the order is **' + ord.map(nm).join('-') + '**.'));
    var traps = {}, keys = {};
    it.options.forEach(function (o, i) {
      if (i === it.answer) return;
      var p = parseOrder(o.text), pos = {}, inv = [];
      p.forEach(function (x, k) { pos[x] = k; });
      for (var a = 0; a < 4; a++) for (var b = 0; b < 4; b++) if (a !== b && pos[a] < pos[b] && d[a] > d[b]) inv.push([a, b]);
      var t, diff = [0, 1, 2, 3].filter(function (k) { return p[k] !== ord[k]; });
      var swapTxt = function (x, y) { var sm = d[x] < d[y] ? x : y, lg = sm === x ? y : x; return 'Swaps ' + nm(lg) + ' and ' + nm(sm) + ': angle ' + nm(sm) + ' is ' + d[sm] + ' degrees, angle ' + nm(lg) + ' is ' + d[lg] + ', so ' + nm(sm) + ' comes first.'; };
      var cnt = {}; inv.forEach(function (v) { cnt[v[0]] = (cnt[v[0]] || 0) + 1; cnt[v[1]] = (cnt[v[1]] || 0) + 1; });
      var hub = inv.length > 1 ? Object.keys(cnt).filter(function (k) { return cnt[k] === inv.length; }).map(Number)[0] : null;
      if (diff.length === 2) { t = swapTxt(p[diff[0]], p[diff[1]]); keys[i] = 'swap'; }
      else if (diff.length === 4 && p[diff[0]] === ord[diff[1]] && p[diff[1]] === ord[diff[0]] && p[diff[2]] === ord[diff[3]]) {
        var A = [p[diff[0]], p[diff[1]]], B = [p[diff[2]], p[diff[3]]];
        t = 'Swaps two pairs: ' + A.map(nm).sort().join(' and ') + ' (' + Math.abs(d[A[0]] - d[A[1]]) + ' apart), ' + B.map(nm).sort().join(' and ') + ' (' + Math.abs(d[B[0]] - d[B[1]]) + ' apart).';
        keys[i] = 'double';
      } else if (hub != null) {
        var others = inv.map(function (v) { return v[0] === hub ? v[1] : v[0]; });
        var bigger = inv[0][0] === hub;
        t = 'Angle ' + nm(hub) + ' is ' + d[hub] + ' degrees, ' + (bigger ? 'larger' : 'smaller') + ' than ' + listAnd(others.map(function (x) { return nm(x) + ' (' + d[x] + ')'; })) + ', so it goes ' + (bigger ? 'after' : 'before') + ' them.';
        keys[i] = 'shift';
      } else {
        t = pl(inv.length, 'pair') + ' out of order. The true order is ' + ord.map(nm).join('-') + '.';
        keys[i] = 'order';
      }
      traps[i] = t;
    });
    return {
      answer: 'Smallest to largest: ' + ord.map(nm).join(', ') + ', from ' + d[ord[0]] + ' up to ' + d[ord[3]] + ' degrees.',
      steps: steps, traps: traps, trapKeys: keys,
      check: { q: 'How far apart are the two closest angles here?', a: close.g + ' degrees: angle ' + nm(lo) + ' and angle ' + nm(hi) + '.' }
    };
  }

  /* ================= cube counting ================= */
  function cubeFacts(it) {
    if (it._cubeFacts) return it._cubeFacts;
    var cubes = it.figure.cubes, set = {}, C = PAT.cubes;
    cubes.forEach(function (c) { set[c.join(',')] = 1; });
    var has = function (x, y, z) { return !!set[x + ',' + y + ',' + z]; };
    var counts = cubes.map(function (c) { return C.painted(set, c); });
    var hidden = cubes.map(function (c) { return C.faceVisible(cubes, c, 'top') === 0 && C.faceVisible(cubes, c, 'front') === 0 && C.faceVisible(cubes, c, 'right') === 0; });
    var hist = {}; counts.forEach(function (n) { hist[n] = (hist[n] || 0) + 1; });
    var k = it.meta.k, ans = hist[k] || 0, hiddenK = 0, bottom = 0, seen = 0, nHidden = 0;
    cubes.forEach(function (c, i) {
      if (hidden[i]) nHidden++;
      if (counts[i] === k && hidden[i]) hiddenK++;
      if (counts[i] + (c[2] === 0 ? 1 : 0) === k) bottom++;
      var v = (!has(c[0] + 1, c[1], c[2]) ? 1 : 0) + (!has(c[0], c[1] + 1, c[2]) ? 1 : 0) + (!has(c[0], c[1], c[2] + 1) ? 1 : 0);
      if (v === k) seen++;
    });
    var f = { counts: counts, hist: hist, k: k, ans: ans, hiddenK: hiddenK, bottom: bottom, seen: seen, nHidden: nHidden, total: cubes.length };
    try { Object.defineProperty(it, '_cubeFacts', { value: f, enumerable: false }); } catch (e) { /* frozen item: recompute */ }
    return f;
  }
  function otherK(f, n) { var ks = Object.keys(f.hist).map(Number).filter(function (j) { return j !== f.k && f.hist[j] === n; }); return ks.length ? ks[0] : null; }
  function atLeast(f) { var s = 0; Object.keys(f.hist).forEach(function (j) { if (+j >= f.k) s += f.hist[j]; }); return s; }
  function cubeTrap(it, i) {
    if (i === it.answer) return null;
    var f = cubeFacts(it), n = it.options[i].count;
    if (f.hiddenK && n === f.ans - f.hiddenK) return 'hidden';
    if (f.k > 0 && n === (f.hist[f.k - 1] || 0)) return 'fewer';
    if (n === (f.hist[f.k + 1] || 0)) return 'more';
    if (n === f.bottom && f.bottom !== f.ans) return 'bottom';
    if (n === f.seen && f.seen !== f.ans) return 'seen';
    if (Math.abs(n - f.ans) === 1) return 'off';
    if (otherK(f, n) != null) return 'otherk';
    if (n === atLeast(f) && n !== f.ans) return 'atleast';
    return 'far';
  }
  function sides(k) { return pl(k, 'painted side'); }
  function cubes(it) {
    var f = cubeFacts(it), k = f.k, ans = f.ans;
    var ks = Object.keys(f.hist).map(Number).sort(function (a, b) { return a - b; });
    var traps = {}, keys = {};
    it.options.forEach(function (o, i) {
      var t = cubeTrap(it, i); if (!t) return;
      var n = o.count;
      keys[i] = t;
      traps[i] = {
        hidden: 'Counts only cubes you can see: ' + pl(f.hiddenK, 'hidden cube') + ' also ' + (f.hiddenK === 1 ? 'has ' : 'have ') + sides(k) + '.',
        fewer: n + ' is the count for exactly ' + sides(k - 1) + ', not ' + k + '. Read the right row of the tally.',
        more: n + ' is the count for exactly ' + sides(k + 1) + ', not ' + k + '. Read the right row of the tally.',
        bottom: 'Counts the bottom as painted: then ' + n + ' cubes would show ' + k + '. Bottom faces are never painted.',
        seen: 'Counts only top, front and right sides. Back and left sides are painted too.',
        off: 'One cube ' + (n > ans ? 'too many' : 'short') + ': exactly ' + pl(ans, 'cube') + ' ' + (ans === 1 ? 'has ' : 'have ') + sides(k) + '.',
        otherk: n + ' is the count for exactly ' + sides(otherK(f, n)) + ', not ' + k + '. Read the right row of the tally.',
        atleast: n + ' cubes have ' + k + ' or more painted sides. The question asks for exactly ' + k + '.',
        far: (n > ans ? 'Too many by ' + (n - ans) + ': only ' : 'Short by ' + (ans - n) + ': ') + pl(ans, 'cube') + ' ' + (ans === 1 ? 'has' : 'have') + ' exactly ' + sides(k) + '. Recount with a tally.'
      }[t];
    });
    var other = ks.filter(function (x) { return x !== k; });
    var k2 = other.length ? other[other.length - 1] : k;
    return {
      answer: pl(ans, 'cube') + ' ' + (ans === 1 ? 'has' : 'have') + ' exactly ' + sides(k) + '.',
      steps: [
        S('Number all ' + f.total + ' cubes, bottom layer first: ' + (f.nHidden ? f.nHidden + ' cannot be seen.' : 'every one shows.')),
        S('Never painted: any bottom face, or a side touching another cube.'),
        S('Exactly ' + sides(k) + ': **' + pl(ans, 'cube') + '**' + (f.hiddenK ? ', ' + f.hiddenK + ' of them hidden.' : '.')),
        S('Tally by painted sides: ' + ks.map(function (x) { return x + ':' + f.hist[x]; }).join(', ') + '; total ' + f.total + '.')
      ],
      traps: traps, trapKeys: keys,
      check: { q: 'Same figure: how many cubes have exactly ' + sides(k2) + '?', a: f.hist[k2] + ', read off the same tally.' }
    };
  }

  /* ================= hole punching ================= */
  function cname(p) { return 'row ' + (Math.floor(p[1]) + 1) + ', column ' + (Math.floor(p[0]) + 1); }
  function hkey(p) { return p[0] + ',' + p[1]; }
  function hset(a) { var s = {}; a.forEach(function (p) { s[hkey(p)] = p; }); return s; }
  function crease(f) { return f.kind === 'v' ? 'vertical crease' : f.kind === 'h' ? 'horizontal crease' : 'diagonal crease'; }
  function unfoldChain(it) {
    var HP = PAT.holepunch._internal, st = it.figure.steps, holes = it.figure.punches.slice(), counts = [holes.length];
    for (var s = st.length - 1; s >= 0; s--) {
      var flap = {}; st[s].flap.forEach(function (t) { var q = t.split(','); flap[q[0] + ',' + q[1]] = 1; });
      var out = holes.slice();
      holes.forEach(function (h) {
        var m = HP.reflectP(st[s].fold, h), i = Math.floor(m[0]), j = Math.floor(m[1]);
        if (i < 0 || j < 0 || i > 3 || j > 3 || !flap[i + ',' + j]) return;
        out.push(m);
      });
      holes = []; var seen = {};
      out.forEach(function (p) { var k = hkey(p); if (!seen[k]) { seen[k] = 1; holes.push(p); } });
      counts.push(holes.length);
    }
    return { holes: holes, counts: counts };
  }
  function holepunch(it) {
    var st = it.figure.steps, F = st.length, punches = it.figure.punches, key = it.options[it.answer].holes, H = key.length;
    var chain = unfoldChain(it), ksig = Object.keys(hset(key)).sort().join('|');
    var good = Object.keys(hset(chain.holes)).sort().join('|') === ksig;
    var steps = [];
    var half = it.meta && it.meta.halfHoles;
    if (half && punches.length === 1) steps.push(S('Punch at ' + cname(punches[0]) + ': it sits on a diagonal fold edge.'));
    else if (punches.length === 1) steps.push(S('Punch: 1 hole through every layer, at ' + cname(punches[0]) + '.'));
    else if (punches.length === 2) steps.push(S('Punches at ' + cname(punches[0]) + ' and ' + cname(punches[1]) + '.'));
    else steps.push(S('Punch: ' + punches.length + ' holes through every layer of the folded paper.'));
    if (good) {
      for (var s = F - 1; s >= 0; s--) {
        var a = chain.counts[F - 1 - s], b = chain.counts[F - s];
        steps.push(S('Undo fold ' + (s + 1) + ' (' + crease(st[s].fold) + '): ' + (a === b ? 'still ' + pl(b, 'hole') : pl(a, 'hole') + ' becomes ' + b) + '.'));
      }
    } else {
      steps.push(S('Undo the folds in reverse, the last fold first.'));
      steps.push(S('Each undo **mirrors** every hole across that crease.'));
    }
    if (half && punches.length > 1) steps.splice(1, 0, S('The punch at ' + cname(punches[0]) + ' sits on a diagonal fold edge.'));
    steps.push(S('Unfolded: **' + pl(H, 'hole') + '**, one for every layer the punch cut.'));
    if (steps.length > 5) steps.pop();
    var HP = PAT.holepunch._internal, traps = {}, keys = {};
    var skipSig = function (sk) {
      var h = punches.slice();
      for (var s2 = F - 1; s2 >= 0; s2--) if (s2 !== sk) h = HP.unfoldLoose(h, st[s2].fold);
      return Object.keys(hset(h)).sort().join('|');
    };
    var alt = function (f) { return f.kind === 'v' ? { kind: 'h', c: f.c, moveSide: f.moveSide } : f.kind === 'h' ? { kind: 'v', c: f.c, moveSide: f.moveSide } : f.kind === 'd1' ? { kind: 'd2', c: 4 + f.c, moveSide: f.moveSide } : { kind: 'd1', c: f.c - 4, moveSide: f.moveSide }; };
    var wrongSig = function (w) {
      var h = punches.slice();
      for (var s3 = F - 1; s3 >= 0; s3--) h = HP.unfoldLoose(h, s3 === w ? alt(st[s3].fold) : st[s3].fold);
      return Object.keys(hset(h)).sort().join('|');
    };
    it.options.forEach(function (o, i) {
      if (i === it.answer) return;
      var os = hset(o.holes), ks = hset(key), osig = Object.keys(os).sort().join('|');
      var miss = key.filter(function (p) { return !os[hkey(p)]; }), extra = o.holes.filter(function (p) { return !ks[hkey(p)]; });
      var n = o.holes.length, tr = o.trap, t = null, j;
      var swapTxt = miss.length === 1 && extra.length === 1 ? cname(extra[0]) + ' should be ' + cname(miss[0]) + '.' : null;
      if (tr === 'missed-unfold') {
        for (j = 0; j < F && !t; j++) if (skipSig(j) === osig) t = 'Skips undoing fold ' + (j + 1) + ': ' + (n === H ? 'the holes land in the wrong cells.' : pl(n, 'hole') + ', but opening every fold gives ' + H + '.');
        if (!t) t = 'Skips one unfold: ' + (n === H ? 'the holes land in the wrong cells.' : pl(n, 'hole') + ', but opening every fold gives ' + H + '.');
      } else if (tr === 'wrong-line') {
        for (j = 0; j < F && !t; j++) if (wrongSig(j) === osig) t = 'Mirrors fold ' + (j + 1) + ' across the wrong line. ' + (swapTxt ? cap(swapTxt) : 'Mirror each hole across the crease it folded over.');
        if (!t) t = 'Mirrors a hole across the wrong line. ' + (swapTxt ? cap(swapTxt) : 'Mirror each hole across the crease it folded over.');
      } else if (tr === 'flipped') {
        var fl = [['left to right', function (p) { return [4 - p[0], p[1]]; }], ['top to bottom', function (p) { return [p[0], 4 - p[1]]; }], ['across the diagonal', function (p) { return [p[1], p[0]]; }]];
        fl.forEach(function (x) { if (!t && Object.keys(hset(key.map(x[1]))).sort().join('|') === osig) t = 'The right pattern flipped ' + x[0] + '. Keep the paper the way it was folded.'; });
        if (!t) t = 'The right pattern read flipped. Keep the paper the way it was folded.';
      } else if (tr === 'shifted') {
        if (n < H && miss.length === 1) t = 'One hole slid onto another, so ' + cname(miss[0]) + ' is left empty. The answer has ' + H + ' holes.';
        else t = 'One hole is a cell off: ' + (swapTxt || 'mark the punch in its exact cell.');
      } else if (tr === 'dropped') {
        t = 'Missing the hole at ' + (miss[0] ? cname(miss[0]) : 'one spot') + ': ' + pl(n, 'hole') + ', the answer has ' + H + '.';
      }
      if (!t) {
        if (n !== H) t = pl(n, 'hole') + ', but the unfolded paper has ' + H + '. Undo every fold, one crease at a time.';
        else t = 'Right count, wrong places: ' + (swapTxt || 'mirror each hole across its own crease.');
      }
      traps[i] = t; keys[i] = tr || (n !== H ? 'count' : 'place');
    });
    return {
      answer: 'Unfolded, the paper shows ' + pl(H, 'hole') + ', mirrored across ' + pl(F, 'crease') + '.',
      steps: steps, traps: traps, trapKeys: keys,
      check: { q: 'Which fold do you undo first?', a: 'Fold ' + F + ', the last fold made.' }
    };
  }

  /* ================= top, front, end ================= */
  var ORIENT = {
    end: 'END view: seen from the right side, so its left edge is the FRONT.',
    top: 'TOP view: seen from above, with the FRONT edge at the bottom.',
    front: 'FRONT view: seen straight on from the front; left stays left.'
  };
  var MIRROR_TXT = {
    end: 'flipped front to back. End-left is always the FRONT of the object.',
    top: 'flipped front to back. The front sits at the bottom of the top view.',
    front: 'flipped left to right. Left on the object stays left in the front view.'
  };
  var PROFILE_TXT = { end: 'Heights must match the FRONT, depths the TOP.', top: 'Widths must match the FRONT, depths the END.', front: 'Widths must match the TOP, heights the END.' };
  var EDGE_W = { none: 'square', chamfer: 'a 45 degree slant', step: 'a step', cove: 'a curved cove' };
  var EDGE_ADJ = { chamfer: 'slanted', step: 'stepped', cove: 'curved' };
  var TOP_W = { cyl: 'round boss', cylhole: 'round boss with a hole', frustum: 'tapered boss', frustumhole: 'tapered boss with a hole', cone: 'cone', hole: 'round hole', cbore: 'counterbored hole', cboreb: 'hole counterbored from below', sqhole: 'square hole', sqboss: 'square boss' };
  var TOP_AT = { hole: ' through the top', cbore: ' in the top', cboreb: '', sqhole: ' through the top' };
  function topAt(k) { return 'a ' + TOP_W[k] + (TOP_AT[k] != null ? TOP_AT[k] : ' on top'); }
  var SIDE_W = { yhole: 'round hole through the side', xhole: 'round hole end to end', uslotR: 'U-slot in one end', uslotL: 'U-slot in one end', channel: 'channel across the bottom' };
  function featureList(p) {
    var out = [];
    if (p.top && p.top.k !== 'none') out.push(topAt(p.top.k));
    if (p.ef !== 'none' || p.eb !== 'none') {
      var e = [p.ef, p.eb].filter(function (x) { return x !== 'none'; });
      if (e.length === 2 && e[0] === e[1]) out.push('two ' + EDGE_ADJ[e[0]] + ' top edges');
      else e.forEach(function (x) { out.push('a ' + EDGE_ADJ[x] + ' top edge'); });
    }
    if (p.side && p.side.k !== 'none') out.push('a ' + SIDE_W[p.side.k]);
    return out;
  }
  function tfeParamDiff(p, q) {
    if (p.ef !== q.ef || p.eb !== q.eb) {
      var a = p.ef !== q.ef ? p.ef : p.eb, b = p.ef !== q.ef ? q.ef : q.eb;
      if (b === 'none') return 'Leaves out ' + EDGE_W[a] + ' on a top edge. Every edge shows in all three views.';
      if (a === 'none') return 'Adds ' + EDGE_W[b] + ' to a top edge that is square on the object.';
      return 'Shows a top edge with ' + EDGE_W[b] + '; on the object it has ' + EDGE_W[a] + '.';
    }
    if (p.top.k !== q.top.k) return 'Shows ' + topAt(q.top.k) + '; the object has ' + topAt(p.top.k) + '.';
    if (p.top.x !== q.top.x) return 'Puts the ' + TOP_W[p.top.k] + ' at the other end of the top. Line it up with the given views.';
    if (p.side.k !== q.side.k) {
      if (q.side.k === 'none') return 'Leaves out the ' + SIDE_W[p.side.k] + '. It shows in every view, dashed when hidden.';
      if (p.side.k === 'none') return 'Adds a ' + SIDE_W[q.side.k] + ' that the object does not have.';
      if (SIDE_W[p.side.k] === SIDE_W[q.side.k]) return 'Moves the U-slot to the other end of the object.';
      return 'Shows a ' + SIDE_W[q.side.k] + '; the object has a ' + SIDE_W[p.side.k] + '.';
    }
    if (p.side.x !== q.side.x) return 'Moves the ' + SIDE_W[p.side.k] + ' to the other side. Line it up with the given views.';
    return null;
  }
  function tfeMachinedAlts(it) {
    var TC = PAT.tfeCSG, SL = PAT.solid, p = it.figure.params, rot = it.figure.rot, MV = SL.VIEWS[it.figure.missing], alts = [];
    var cl = function (o) { return JSON.parse(JSON.stringify(Object.assign({}, p, o))); };
    TC.EDGES.forEach(function (e) { if (e !== p.ef) alts.push(cl({ ef: e })); if (e !== p.eb) alts.push(cl({ eb: e })); });
    TC.TOPS.forEach(function (k) { if (k !== 'none' && k !== p.top.k) alts.push(cl({ top: { k: k, x: p.top.x } })); });
    if (p.top.k !== 'none') alts.push(cl({ top: { k: p.top.k, x: 5 - p.top.x } }));
    TC.SIDES.forEach(function (k) {
      if (k === p.side.k && k !== 'yhole') return;
      if (k === 'yhole') TC.XS.forEach(function (x) { if (!(p.side.k === 'yhole' && p.side.x === x)) alts.push(cl({ side: { k: k, x: x } })); });
      else alts.push(cl({ side: { k: k, x: 0 } }));
    });
    return alts.filter(TC.compatible).map(function (q) { return { q: q, key: JSON.stringify(SL.drawing(TC.solidOf(q, rot), MV)) }; });
  }
  function tfe(it) {
    var f = it.figure, miss = f.missing, M = miss.toUpperCase(), truth = it.options[it.answer], mach = f.kind === 'machined';
    var count = function (o) {
      if (mach) { var g = PAT.tfeCSG.groups(o.prims), c = { dash: 0, solid: 0, curve: 0 }; g.forEach(function (gr) { var p = o.prims[gr[0]]; if (p.dash) c.dash++; else c.solid++; if (p.k === 'A') c.curve++; }); return c; }
      var r = PAT.tfe.mergeRuns(o.segs); return { dash: r.filter(function (s) { return s.dash; }).length, solid: r.filter(function (s) { return !s.dash; }).length };
    };
    var tc = count(truth), steps = [S(ORIENT[miss])];
    var hidTxt = tc.dash ? 'It has **' + pl(tc.dash, 'dashed line') + '**: edges hidden behind material.' : 'It has **no dashed lines**: nothing is hidden from that side.';
    if (mach) {
      var fl = featureList(f.params), ft;
      if (!fl.length) fl = ['a plain block, no holes or cuts'];
      var nf2 = fl.length;
      do { ft = 'Features: ' + listAnd(fl.slice(0, nf2)) + (nf2 < fl.length ? ', and more.' : '.'); nf2--; } while (nf2 > 0 && (ft.length > 80 || ft.split(' ').length > 13));
      steps.push(S(ft));
      steps.push(S('Every feature shows in all three views; hidden parts are dashed.'));
      steps.push(S(hidTxt.replace('It has', 'The true ' + M + ' view has')));
    } else {
      var d = f.dims;
      steps.push(S({ end: 'Width is the depth from the TOP (' + d[1] + '); height from the FRONT (' + d[2] + ').', top: 'Width comes from the FRONT (' + d[0] + '); depth from the END view (' + d[1] + ').', front: 'Width comes from the TOP (' + d[0] + '); height from the END view (' + d[2] + ').' }[miss]));
      steps.push(S('It has ' + pl(tc.solid, 'solid line') + ': edges you can see from that side.'));
      steps.push(S(hidTxt));
    }
    steps.push(S('Only ' + ch(it.answer) + ' matches both given views line for line.'));
    var traps = {}, keys = {}, alts = null;
    var segSet = function (segs) { var s = {}; segs.forEach(function (q) { var a = q.a.join(','), b = q.b.join(','); s[a < b ? a + '|' + b : b + '|' + a] = 1; }); return s; };
    it.options.forEach(function (o, i) {
      if (i === it.answer) return;
      var tr = o.trap, oc = count(o), t = null;
      if (tr === 'mirror') t = ch(i) + ' is the true view ' + MIRROR_TXT[miss];
      else if (tr === 'dash-as-solid') t = 'Draws a hidden edge solid: ' + pl(oc.dash, 'dashed line') + ' here, the true view has ' + tc.dash + '.';
      else if (tr === 'solid-as-dash') t = 'Draws a visible edge dashed: ' + pl(oc.dash, 'dashed line') + ' here, the true view has ' + tc.dash + '. You can see that edge.';
      else if (tr === 'profile' && !mach) {
        var A = segSet(truth.segs), B = segSet(o.segs), diff = 0;
        Object.keys(A).forEach(function (k) { if (!B[k]) diff++; }); Object.keys(B).forEach(function (k) { if (!A[k]) diff++; });
        t = 'A step is in the wrong place: ' + pl(diff, 'unit of edge', 'units of edge') + (diff === 1 ? ' differs' : ' differ') + ' from the true view. ' + PROFILE_TXT[miss];
      } else if (mach && (tr === 'feature' || tr === 'dropped')) {
        if (!alts) alts = tfeMachinedAlts(it);
        var key = JSON.stringify(o.prims), hit = alts.filter(function (a) { return a.key === key; })[0];
        t = hit ? tfeParamDiff(f.params, hit.q) : null;
        if (!t) t = tr === 'dropped' ? 'A feature is left out. Every hole, boss and cut shows in all three views.' : 'A feature has the wrong shape, size or place. Line it up with the given views.';
      }
      if (!t) t = 'It does not match the given views. ' + PROFILE_TXT[miss];
      traps[i] = t; keys[i] = tr;
    });
    return {
      answer: 'The true ' + M + ' view, with ' + (tc.dash ? pl(tc.dash, 'hidden (dashed) line') : 'no hidden lines') + '.',
      steps: steps, traps: traps, trapKeys: keys,
      check: { q: 'How many dashed lines does the true ' + M + ' view have?', a: tc.dash + (tc.dash ? ': each is an edge behind material.' : ': nothing is hidden from that side.') }
    };
  }

  /* ================= keyholes ================= */
  var AX = ['end', 'front', 'top'];
  function gridCorners(g) {
    var R = g.length, Cc = g[0].length, n = 0, on = function (r, c) { return r >= 0 && c >= 0 && r < R && c < Cc && g[r][c] ? 1 : 0; };
    for (var r = 0; r <= R; r++) for (var c = 0; c <= Cc; c++) {
      var a = on(r - 1, c - 1), b = on(r - 1, c), d = on(r, c - 1), e = on(r, c), s = a + b + d + e;
      if (s === 1 || s === 3) n++; else if (s === 2 && a === e) n += 2;
    }
    return n;
  }
  function gridTransforms(g) {
    var G = PAT.keyholes._grid, out = [], cur = G.trim(g);
    for (var i = 0; i < 4; i++) { out.push({ g: cur, flip: false, t: i }); out.push({ g: G.flipH(cur), flip: true, t: i }); cur = G.rot90(cur); }
    return out;
  }
  function gridDiff(key, g) {
    var best = null;
    gridTransforms(g).forEach(function (T) {
      if (T.g.length !== key.length || T.g[0].length !== key[0].length) return;
      var add = 0, rem = 0;
      for (var r = 0; r < key.length; r++) for (var c = 0; c < key[0].length; c++) { var a = key[r][c] ? 1 : 0, b = T.g[r][c] ? 1 : 0; if (b && !a) add++; if (a && !b) rem++; }
      if (!best || add + rem < best.add + best.rem) best = { add: add, rem: rem, flip: T.flip, t: T.t };
    });
    return best;
  }
  var KH_FEAT = {
    tl: function (f) { return 'the ' + (f.s > 1 ? 'large ' : '') + (f.k === 'round' ? 'rounded' : 'slanted') + ' corner'; },
    mid: function (f) { return { U: 'the U-shaped groove on top', V: 'the V-shaped groove on top', arch: 'the arched top' }[f.k]; },
    sl: function (f) { return f.k === 'semi' ? 'the half-round notch at the base' : 'the square notch at the base'; },
    slot: function () { return 'the slot across the top'; },
    boss: function (f) { return { cyl: 'the round boss', frustum: 'the tapered boss', cone: 'the cone' }[f.k]; }
  };
  KH_FEAT.tr = KH_FEAT.tl; KH_FEAT.sr = KH_FEAT.sl;
  function khParamDiff(p, q) {
    var keys = ['tl', 'tr', 'mid', 'sl', 'sr', 'slot', 'boss'];
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (p[k] && !q[k]) return 'leaves out ' + KH_FEAT[k](p[k]) + ', which the key outline shows';
      if (!p[k] && q[k]) return 'adds ' + KH_FEAT[k](q[k]).replace(/^the /, 'a ') + ' the object does not have';
      if (p[k] && q[k] && JSON.stringify(p[k]) !== JSON.stringify(q[k])) {
        if (k === 'slot') return 'moves the slot along the top';
        if ((k === 'tl' || k === 'tr') && p[k].k === q[k].k) return 'makes a cut corner ' + (q[k].s > p[k].s ? 'bigger' : 'smaller') + ' than on the object';
        return 'swaps ' + KH_FEAT[k](p[k]) + ' for ' + KH_FEAT[k](q[k]).replace(/^the /, 'a ') + '. Curves stay curves, slants stay slants';
      }
    }
    if (p.w !== q.w) return 'makes the block ' + q.w + ' units wide instead of ' + p.w;
    if (p.h !== q.h) return 'makes the block ' + q.h + ' units tall instead of ' + p.h;
    return null;
  }
  var KH_FAMILY = { FILL: 'leaves out one feature of the object', CARVE: 'adds a notch the object does not have', SCALE: 'gives one part the wrong size', CURVE: 'draws a curve as a slant, or a slant as a curve', LIMB: 'joins real features into an outline no single view makes', FOREIGN: 'is the outline of a different object', MIRROR: 'is a mirror image with one part changed' };
  function sameLoops(A, B) {
    var SL = PAT.solid, KC = PAT.keyholesCSG;
    if (Math.abs(SL.loopsArea(A) - SL.loopsArea(B)) > 0.05) return false;
    var ba = SL.loopsBox(A);
    for (var t = 0; t < 4; t++) for (var f = 0; f < 2; f++) {
      var Bt = KC.d4(B, t, !!f), bb = SL.loopsBox(Bt);
      if (Math.abs(ba[2] - bb[2]) > 0.02 || Math.abs(ba[3] - bb[3]) > 0.02) continue;
      var bad = 0, tot = 0;
      for (var v = 0.0625; v < ba[3]; v += 0.125) for (var u = 0.0625; u < ba[2]; u += 0.125) { tot++; if (SL.pointInLoops(A, u, v) !== SL.pointInLoops(Bt, u, v)) bad++; }
      if (bad <= 3) return { t: t, flip: !!f };
    }
    return null;
  }
  function sameDims(a, b, c, d) { var num = function (p, q) { return p - q; }, x = [a, b].sort(num), y = [c, d].sort(num); return Math.abs(x[0] - y[0]) < 0.06 && Math.abs(x[1] - y[1]) < 0.06; }
  function keyholes(it) {
    var mach = it.figure.kind === 'machined', axis = it.meta.keyAxis, name = AX[axis], key, w, h, corners = null, KC = PAT.keyholesCSG, SL = PAT.solid;
    if (mach) {
      var sol = KC.orient(KC.build(it.figure.params), it.figure.turn);
      key = KC.outline(sol, axis);
      var bx = key ? SL.loopsBox(key) : SL.loopsBox(it.options[it.answer].loops);
      w = r1(bx[2]); h = r1(bx[3]);
    } else {
      key = PAT.keyholes.trueOutlines(it)[axis];
      w = key[0].length; h = key.length; corners = gridCorners(key);
    }
    var hasSize = it.options.some(function (o) { return o.trap === 'SIZE'; });
    var steps = [
      S('Look straight along each axis: top, front and end give 3 outlines.'),
      S('The key is the **' + name + '** outline: ' + w + ' by ' + h + ' units' + (corners ? ', ' + corners + ' corners.' : '.'))
    ];
    var how = 'turned';
    var gd = !mach ? gridDiff(key, it.options[it.answer].grid) : key ? sameLoops(it.options[it.answer].loops, key) : null;
    if (gd && gd.flip) how = gd.t === 0 ? 'flipped over' : 'turned and flipped';
    else if (gd && gd.t === 0) how = 'as drawn';
    steps.push(S(ch(it.answer) + ' is that outline ' + how + ': same size, same edges.'));
    if (mach) steps.push(S(it.figure.params.hole ? 'The drilled hole is a decoy: a hole never changes an outline.' : 'Arcs stay arcs and slants stay slants in every outline.'));
    else steps.push(S('Inside edges never change an outline; trace only the outer edge.'));
    if (hasSize) steps.push(S('Openings share the object\'s scale, so the size must match too.'));
    var traps = {}, keys = {}, vars = null;
    it.options.forEach(function (o, i) {
      if (i === it.answer) return;
      var tr = o.trap, t = null;
      keys[i] = tr;
      if (tr === 'SIZE') { t = 'The right outline at ' + o.scale + ' times the size: too ' + (o.scale > 1 ? 'big' : 'small') + ' to pass exactly.'; traps[i] = t; return; }
      if (tr === 'ISLAND') { traps[i] = 'It has a floating piece inside. A cut plate cannot hold an island, so cross it off.'; return; }
      if (mach) {
        if (!vars) {
          vars = [];
          var p = it.figure.params;
          [function (a) { return a[0]; }, function (a) { return a[a.length - 1]; }].forEach(function (pk) {
            KC.variants(p, { pick: pk }).forEach(function (vt) { if (KC.legal(vt[0])) vars.push(vt[0]); });
          });
        }
        var desc = null;
        for (var v = 0; v < vars.length && !desc; v++) {
          var ol = KC.outline(KC.orient(KC.build(vars[v]), it.figure.turn), axis);
          if (ol && sameLoops(o.loops, ol)) desc = khParamDiff(it.figure.params, vars[v]);
        }
        var ob = SL.loopsBox(o.loops), dims = r1(ob[2]) + ' by ' + r1(ob[3]);
        if (tr === 'MIRROR') t = 'Drawn mirrored, which is legal, but it ' + (desc || 'has one part changed') + '.';
        else t = cap(desc || KH_FAMILY[tr] || 'does not match any view of the object') + '.';
        if (t.length < 110 && t.split(/[.!?] /).length < 2 && !sameDims(+ob[2], +ob[3], +w, +h)) t += ' It is ' + dims + '; the key is ' + w + ' by ' + h + '.';
      } else {
        var g = o.grid, ow = g[0].length, oh = g.length, same = gridDiff(key, g);
        var sz = sameDims(ow, oh, w, h) ? 'Same size as the key, but the edges differ.' : 'It is ' + ow + ' by ' + oh + '; the key is ' + w + ' by ' + h + '.';
        if (tr === 'FOREIGN') t = 'The outline of a different object: it matches none of the 3 views.';
        else if (tr === 'LIMB') t = 'Joins real features into an outline no single view makes.' + (same ? '' : ' ' + sz);
        else if (tr === 'MIRROR') t = 'A mirror of the key with ' + (same ? pl(same.add + same.rem, 'square') + ' changed' : 'one part changed') + '. A true mirror would fit.';
        else if (same && tr === 'FILL') t = 'Fills in a notch the key has: ' + pl(same.add, 'extra unit square') + ' of area.';
        else if (same && tr === 'CARVE') t = 'Cuts a notch the key does not have: ' + pl(same.rem, 'unit square') + ' missing.';
        else if (tr === 'SCALE') t = 'One part is stretched or squeezed. ' + (same || sameDims(ow, oh, w, h) ? 'Compare widths band by band.' : sz);
        else if (tr === 'FILL') t = 'Fills in part of the outline. ' + sz;
        else if (tr === 'CARVE') t = 'Cuts away part of the outline. ' + sz;
        if (!t) t = same ? 'Differs from the key in ' + pl(same.add + same.rem, 'unit square') + '.' : 'It matches no view of the object. ' + sz;
      }
      traps[i] = t;
    });
    return {
      answer: 'The ' + name + ' outline, ' + w + ' by ' + h + ' units, ' + (how === 'as drawn' ? 'exactly as drawn.' : how + ' to fit the opening.'),
      steps: steps.slice(0, 5), traps: traps, trapKeys: keys,
      check: { q: 'Which view of the object is the key opening?', a: 'The ' + name + ' view, seen straight on.' }
    };
  }

  /* ================= pattern folding ================= */
  var SOLID_NAME = { box: 'box', triprism: 'triangular prism', pyramid: 'pyramid', tetra: 'tetrahedron' };
  function mv(R, v) { return [R[0][0] * v[0] + R[0][1] * v[1] + R[0][2] * v[2], R[1][0] * v[0] + R[1][1] * v[1] + R[1][2] * v[2], R[2][0] * v[0] + R[2][1] * v[1] + R[2][2] * v[2]]; }
  function eqv(a, b) { return Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6 && Math.abs((a[2] || 0) - (b[2] || 0)) < 1e-6; }
  /* face numbers: reading order on the drawn pattern (rows top to bottom, then left to right) */
  function numberCells(cells, flipY) {
    var idx = cells.map(function (c, i) { return i; });
    idx.sort(function (a, b) { var ya = flipY ? -cells[a][1] : cells[a][1], yb = flipY ? -cells[b][1] : cells[b][1]; return (Math.abs(ya - yb) > 0.35 ? ya - yb : 0) || cells[a][0] - cells[b][0]; });
    var num = []; idx.forEach(function (i, r) { num[i] = r + 1; });
    return num;
  }
  function pickFact(facts, vis, involve, allVisible) {
    var ok = function (fc) { return vis.indexOf(fc.face) >= 0 && (!allVisible || fc.refs.every(function (r) { return vis.indexOf(r) >= 0; })); };
    var touches = function (fc) { return involve.indexOf(fc.face) >= 0 || fc.refs.some(function (r) { return involve.indexOf(r) >= 0; }); };
    return facts.filter(function (fc) { return fc.dir && ok(fc) && touches(fc); })[0] || facts.filter(function (fc) { return fc.dir && touches(fc) && vis.indexOf(fc.face) >= 0; })[0] || null;
  }

  function cubeFold(it) {
    var PF = PAT.patternfold, I = PF._internal, net = it.figure.net, marks = it.figure.marks;
    var frames = I.foldFrames(net), faces = I.cubeFaces(net, frames, marks), num = numberCells(net, false);
    var byN = function (n) { for (var i = 0; i < 6; i++) if (eqv(frames[i].n, n)) return i; return -1; };
    var opp = frames.map(function (f) { return byN(I.neg(f.n)); });
    var N = function (i) { return num[i]; };
    var facts = net.map(function (c, i) {
      var f = frames[i], top = byN(I.neg(f.v)), bot = byN(f.v), left = byN(I.neg(f.u)), right = byN(f.u), m = marks[i];
      if (m === 'tri') return { face: i, dir: true, refs: [top, left], text: 'Face ' + N(i) + '\'s triangle fills the corner by faces ' + N(top) + ' and ' + N(left) + '.', short: 'its triangle must fill the corner by faces ' + N(top) + ' and ' + N(left) };
      if (m === 'band') return { face: i, dir: true, refs: [top], text: 'Face ' + N(i) + '\'s band runs along its edge with face ' + N(top) + '.', short: 'its band must run along face ' + N(top) };
      if (m === 'corner') return { face: i, dir: true, refs: [top, right], text: 'Face ' + N(i) + '\'s small square sits in the corner by faces ' + N(top) + ' and ' + N(right) + '.', short: 'its small square must sit by faces ' + N(top) + ' and ' + N(right) };
      if (m === 'half') return { face: i, dir: true, refs: [left], text: 'Face ' + N(i) + '\'s shaded half lies along face ' + N(left) + '.', short: 'its shaded half must lie along face ' + N(left) };
      return { face: i, dir: false, refs: [], text: 'Face ' + N(i) + (m === 'solid' ? ' is fully shaded.' : m === 'dot' ? ' has a dot.' : ' is blank.') };
    });
    var key = it.options[it.answer], ksig = I.sig(key.polys);
    var Rs = I.ROTS.filter(function (R) { return I.sig(I.drawingOf(I.rotFaces(faces, R))) === ksig; });
    var pairs = [], seenP = {};
    for (var i = 0; i < 6; i++) if (!seenP[i]) { seenP[i] = seenP[opp[i]] = 1; pairs.push([N(i), N(opp[i])].sort()); }
    pairs.sort(function (a, b) { return a[0] - b[0]; });
    var steps = [S('Opposites never show together: ' + pairs.map(function (p) { return p[0] + ' and ' + p[1]; }).join(', ') + '.')];
    var vis = [], pos = {};
    if (Rs.length) {
      var shown = I.rotFaces(faces, Rs[0]);
      shown.forEach(function (fc, k) { if (fc.n[2] === 1) pos.top = k; else if (fc.n[0] === 1) pos.left = k; else if (fc.n[1] === 1) pos.right = k; });
      vis = [pos.top, pos.left, pos.right];
      steps.push(S(ch(it.answer) + ': face ' + N(pos.top) + ' on top, ' + N(pos.left) + ' on the left, ' + N(pos.right) + ' on the right.'));
      var f1 = pickFact(facts, vis, vis, true), f2 = f1 ? pickFact(facts.filter(function (x) { return x !== f1; }), vis, vis, true) : null;
      if (!f1) f1 = facts.filter(function (x) { return vis.indexOf(x.face) >= 0; })[0];
      [f1, f2].forEach(function (x) { if (x) steps.push(S(x.text)); });
    }
    steps.push(S('Every edge match holds in ' + ch(it.answer) + ', so it folds from the pattern.'));
    if (steps.length > 5) steps.splice(4, steps.length - 5);
    while (steps.length < 3) steps.splice(steps.length - 1, 0, S('Check what each visible face touches along its shared edges.'));
    /* identify each distractor by rebuilding the generator's candidates under the key's turn */
    var traps = {}, keys = {};
    var FAM = { mirror: 'A mirror image of the folded cube. Folding never makes a mirror image.', rotation: 'One face is turned the wrong way. Check what it touches along its shared edges.', neighbor: 'Two faces traded places. Check what each one touches on the pattern.', opposite: 'A face shows the mark of its opposite face. Check each face against its neighbors.' };
    it.options.forEach(function (o, oi) {
      if (oi === it.answer) return;
      var osig = I.sig(o.polys), found = null, hits = [], same = function () { return hits.filter(function (h) { return h.trap === o.trap; })[0]; };
      Rs.forEach(function (R) {
        if (same()) return;
        var sh = I.rotFaces(faces, R), vi = [];
        sh.forEach(function (fc, k) { if (fc.n[0] === 1 || fc.n[1] === 1 || fc.n[2] === 1) vi.push(k); });
        var vf = vi.map(function (k) { return sh[k]; });
        var test = function (cand, info) { if (!same() && I.sig(I.drawingOf(cand)) === osig) { info.vis = vi; hits.push(info); } };
        test(vf.map(function (f) { return { n: [f.n[1], f.n[0], f.n[2]], polys: f.polys.map(function (p) { return p.map(function (q) { return [q[1], q[0], q[2]]; }); }) }; }), { trap: 'mirror' });
        vf.forEach(function (f, a) { if (f.polys.length) [1, 2, 3].forEach(function (qt) { var v2 = I.cloneFaces(vf); v2[a] = I.spinFace(f, qt); test(v2, { trap: 'rotation', face: vi[a], qt: qt }); }); });
        for (var a = 0; a < 3; a++) for (var b = a + 1; b < 3; b++) {
          var fa = I.moveFace(vf[a], vf[b].n), fb = I.moveFace(vf[b], vf[a].n);
          if (fa && fb) { var v3 = I.cloneFaces(vf); v3[b] = fa; v3[a] = fb; test(v3, { trap: 'neighbor', faces: [vi[a], vi[b]] }); }
        }
        vf.forEach(function (f, a) {
          var oj = -1; sh.forEach(function (g, k) { if (eqv(g.n, I.neg(f.n))) oj = k; });
          if (oj < 0) return;
          [0, 1, 2, 3].forEach(function (qt) { var m = I.moveFace(sh[oj], f.n); if (!m) return; var v4 = I.cloneFaces(vf); v4[a] = I.spinFace(m, qt); test(v4, { trap: 'opposite', face: vi[a], opp: oj }); });
        });
      });
      found = same() || hits[0] || null;
      var t = null, tr = o.trap;
      if (found) {
        var fv = found.vis;
        if (found.trap === 'mirror') t = ch(oi) + ' is the mirror image: its left and right faces swap and flip. No fold does that.';
        else if (found.trap === 'rotation') { var fr = facts[found.face]; t = 'Face ' + N(found.face) + ' is turned ' + (found.qt === 2 ? 'a half turn' : 'a quarter turn') + (fr.dir ? ': ' + fr.short + '.' : '. Check its shared edges.'); }
        else if (found.trap === 'neighbor') { var fn = pickFact(facts, fv, found.faces, false); t = 'Faces ' + N(found.faces[0]) + ' and ' + N(found.faces[1]) + ' traded places. ' + (fn ? fn.text : 'Check what each one touches on the pattern.'); }
        else if (found.trap === 'opposite') { var fo = pickFact(facts.filter(function (x) { return x.face !== found.face; }), fv, [found.face], false); t = 'Face ' + N(found.opp) + '\'s mark is drawn in face ' + N(found.face) + '\'s place, its opposite. ' + (fo ? fo.text : 'Check each face against its neighbors.'); }
        keys[oi] = found.trap;
      }
      if (!t) { t = FAM[tr] || 'It does not fold from this pattern. Check each face against its neighbors.'; keys[oi] = tr; }
      traps[oi] = t;
    });
    var ans = vis.length ? 'The cube with faces ' + N(pos.top) + ', ' + N(pos.left) + ' and ' + N(pos.right) + ' in view, every mark on its true edge.' : 'The one cube the pattern folds into, every mark on its true edge.';
    var q0 = 0;
    return {
      answer: ans, steps: steps, traps: traps, trapKeys: keys,
      check: { q: 'Which face sits opposite face ' + N(q0) + '?', a: 'Face ' + N(opp[q0]) + '.' }, labels: num
    };
  }

  function polyFold(it) {
    var PP = PAT.patternfoldPoly, I = PP._internal, fig = it.figure, kind = fig.solid.kind, name = SOLID_NAME[kind] || 'solid';
    var sd = PP.solid(kind, fig.solid.dims), nf = sd.F.length;
    var marks = fig.net.map(function (f) {
      if (f.shade) return { k: 'solid', a: 0 };
      if (!f.marks.length) return { k: 'blank', a: 0 };
      var m0 = f.marks[0], k = m0.length === 4 ? 'band' : m0.length === 3 ? 'corner' : 'dot', a = 0;
      if (k !== 'dot') for (var j = 0; j < f.pts.length; j++) if (eqv(f.pts[j], m0[0])) a = j;
      return { k: k, a: a };
    });
    var faces = I.centered(sd.F.map(function (f, i) { return { P: f.map(function (v) { return sd.V[v]; }), mark: marks[i] }; }), sd);
    var cents = fig.net.map(function (f) { var x = 0, y = 0; f.pts.forEach(function (p) { x += p[0]; y += p[1]; }); return [x / f.pts.length, y / f.pts.length]; });
    var num = numberCells(cents, true), N = function (i) { return num[i]; };
    var adj = I.adjacency(sd);
    var across = function (i, k) {   // the face across edge k of face i
      var f = sd.F[i], a = f[k], b = f[(k + 1) % f.length];
      for (var q = 0; q < adj[i].length; q++) { var vw = adj[i][q][1]; if ((vw[0] === a && vw[1] === b) || (vw[0] === b && vw[1] === a)) return adj[i][q][0]; }
      return -1;
    };
    var facts = marks.map(function (m, i) {
      var n = sd.F[i].length;
      if (m.k === 'band') { var y = across(i, m.a % n); return { face: i, dir: true, refs: [y], text: 'Face ' + N(i) + '\'s band runs along its edge with face ' + N(y) + '.', short: 'it must run along face ' + N(y) }; }
      if (m.k === 'corner') { var y1 = across(i, (m.a + n - 1) % n), y2 = across(i, m.a % n); return { face: i, dir: true, refs: [y1, y2], text: 'Face ' + N(i) + '\'s corner mark points to the corner by faces ' + Math.min(N(y1), N(y2)) + ' and ' + Math.max(N(y1), N(y2)) + '.', short: 'it must point to faces ' + Math.min(N(y1), N(y2)) + ' and ' + Math.max(N(y1), N(y2)) }; }
      return { face: i, dir: false, refs: [], text: 'Face ' + N(i) + (m.k === 'solid' ? ' is fully shaded.' : m.k === 'dot' ? ' has a dot.' : ' is blank.') };
    });
    var tri = sd.F.filter(function (f) { return f.length === 3; }).length, quad = nf - tri;
    var shape = kind === 'box' ? '6 rectangles' : kind === 'triprism' ? '2 triangles and 3 rectangles' : kind === 'pyramid' ? '1 square and 4 triangles' : '4 triangles';
    var steps = [S('The pattern has ' + shape + ': it folds into a **' + name + '**.')];
    if (kind === 'box') {
      var pairs = [], seen = {};
      for (var i = 0; i < nf; i++) {
        if (seen[i]) continue;
        var ni = I.faceNormal(faces[i].P);
        for (var j = i + 1; j < nf; j++) { var nj = I.faceNormal(faces[j].P); if (!seen[j] && ni[0] * nj[0] + ni[1] * nj[1] + ni[2] * nj[2] < -0.999) { seen[i] = seen[j] = 1; pairs.push([N(i), N(j)].sort()); } }
      }
      pairs.sort(function (a, b) { return a[0] - b[0]; });
      steps.push(S('Opposites never show together: ' + pairs.map(function (p) { return p[0] + ' and ' + p[1]; }).join(', ') + '.'));
    } else if (kind === 'triprism') {
      var ends = []; sd.F.forEach(function (f, k) { if (f.length === 3) ends.push(N(k)); });
      ends.sort();
      steps.push(S('Triangles ' + ends[0] + ' and ' + ends[1] + ' are the two ends; they never show together.'));
    } else if (kind === 'pyramid') {
      var base = -1; sd.F.forEach(function (f, k) { if (f.length === 4) base = k; });
      steps.push(S('Face ' + N(base) + ' is the square base; the 4 triangles meet at the tip.'));
    } else steps.push(S('Each face of a tetrahedron touches the other 3 faces.'));
    var key = it.options[it.answer], ksig = I.sig(key);
    var Rs = I.ROTS.filter(function (R) { return I.sig(I.drawPose(faces, R)) === ksig; });
    var visOf = function (R) { var out = []; faces.forEach(function (f, k) { var n = I.faceNormal(f.P.map(function (p) { return I.mv(R, p); })); if (n[0] * I.VIEWV[0] + n[1] * I.VIEWV[1] + n[2] * I.VIEWV[2] > 0) out.push(k); }); return out; };
    var vis = Rs.length ? visOf(Rs[0]) : [];
    if (vis.length) {
      var vn = vis.map(N).sort(function (a, b) { return a - b; });
      steps.push(S(ch(it.answer) + ' shows faces ' + listAnd(vn.map(String)) + '.'));
      var f1 = pickFact(facts, vis, vis, true) || facts.filter(function (x) { return vis.indexOf(x.face) >= 0 && x.dir; })[0] || facts.filter(function (x) { return vis.indexOf(x.face) >= 0; })[0];
      if (f1) steps.push(S(f1.text));
    }
    steps.push(S('In ' + ch(it.answer) + ' every mark sits on its true edge.'));
    while (steps.length > 5) steps.splice(steps.length - 2, 1);
    var traps = {}, keys = {};
    var FAM = {
      mirror: 'A mirror image of the ' + name + '. Folding never makes a mirror image.',
      rotation: 'A mark is turned onto the wrong edge. Check what it touches on the pattern.',
      neighbor: 'Two faces traded marks. Check what each one touches on the pattern.',
      shade: 'The shading sits on the wrong face. Find the shaded face on the pattern.',
      hidden: 'A face shows a mark from a face that is out of view here.',
      opposite: 'A face shows the mark of a face it never touches.'
    };
    it.options.forEach(function (o, oi) {
      if (oi === it.answer) return;
      var osig = I.sig(o), found = null, hits = [], same = function () { return hits.filter(function (h) { return h.trap === o.trap; })[0]; };
      Rs.forEach(function (R) {
        if (same()) return;
        var vi = visOf(R), hid = faces.map(function (f, k) { return k; }).filter(function (k) { return vi.indexOf(k) < 0; });
        var withMarks = function (fn) { return faces.map(function (f, k) { return { P: f.P, mark: fn(k, f.mark) }; }); };
        var test = function (fs, M, info) { if (!same() && I.sig(I.drawPose(fs, M)) === osig) { info.vis = vi; hits.push(info); } };
        test(faces, I.mm(R, [[-1, 0, 0], [0, 1, 0], [0, 0, 1]]), { trap: 'mirror' });
        vi.forEach(function (i2) {
          var m = faces[i2].mark;
          if (m.k === 'band' || m.k === 'corner') [1, 2, 3].forEach(function (dd) { if (dd < faces[i2].P.length) test(withMarks(function (k, mk) { return k === i2 ? { k: mk.k, a: mk.a + dd } : mk; }), R, { trap: 'rotation', face: i2 }); });
        });
        vi.forEach(function (a) { vi.forEach(function (b) { if (a < b) test(withMarks(function (k, mk) { return k === a ? faces[b].mark : k === b ? faces[a].mark : mk; }), R, { trap: 'neighbor', faces: [a, b] }); }); });
        vi.forEach(function (a) { hid.forEach(function (b) { test(withMarks(function (k, mk) { return k === a ? faces[b].mark : mk; }), R, { trap: faces[b].mark.k === 'solid' || faces[a].mark.k === 'solid' ? 'shade' : 'hidden', face: a, from: b }); }); });
      });
      found = same() || hits[0] || null;
      var t = null, tr = o.trap;
      if (found) {
        var fv = found.vis;
        if (found.trap === 'mirror') t = ch(oi) + ' is a mirror image of the ' + name + '. Folding never makes a mirror image.';
        else if (found.trap === 'rotation') { var fr = facts[found.face]; t = 'Face ' + N(found.face) + '\'s ' + (marks[found.face].k === 'band' ? 'band is on the wrong edge: ' : 'corner mark is in the wrong corner: ') + fr.short + '.'; }
        else if (found.trap === 'neighbor') { var fn = pickFact(facts, fv, found.faces, false); t = 'Faces ' + N(found.faces[0]) + ' and ' + N(found.faces[1]) + ' traded marks. ' + (fn ? fn.text : 'Check what each one touches on the pattern.'); }
        else if (found.trap === 'shade') t = marks[found.from].k === 'solid' ? 'Face ' + N(found.face) + ' is drawn shaded, but on the pattern face ' + N(found.from) + ' is the shaded one.' : 'Face ' + N(found.face) + ' is shaded on the pattern, but here it is not.';
        else if (found.trap === 'hidden') t = 'Face ' + N(found.face) + ' shows the mark of face ' + N(found.from) + ', which is out of view here.';
        keys[oi] = found.trap;
      }
      if (!t) { t = FAM[tr] || 'It does not fold from this pattern. Check each face against its neighbors.'; keys[oi] = tr; }
      traps[oi] = t;
    });
    var qf = facts.filter(function (x) { return x.dir; })[0];
    return {
      answer: 'The ' + name + ' that shows ' + (vis.length ? 'faces ' + listAnd(vis.map(N).sort(function (a, b) { return a - b; }).map(String)) : 'the marked faces') + ', every mark on its true edge.',
      steps: steps, traps: traps, trapKeys: keys,
      check: qf ? { q: 'Which face does face ' + N(qf.face) + '\'s ' + (marks[qf.face].k === 'band' ? 'band' : 'corner mark') + ' touch?', a: qf.refs.length === 1 ? 'Face ' + N(qf.refs[0]) + '.' : 'Faces ' + Math.min(N(qf.refs[0]), N(qf.refs[1])) + ' and ' + Math.max(N(qf.refs[0]), N(qf.refs[1])) + '.' } : { q: 'How many faces does this ' + name + ' have?', a: nf + '.' },
      labels: num, quadCount: quad
    };
  }
  function patternfold(it) { return it.figure && it.figure.kind === 'poly' ? polyFold(it) : cubeFold(it); }

  /* ================= public ================= */
  var BUILD = { angles: angles, cubes: cubes, holepunch: holepunch, tfe: tfe, keyholes: keyholes, patternfold: patternfold };
  function explain(it, chosen) {
    var ex = BUILD[it.type](it);
    ex.type = it.type; ex.picked = chosen == null ? null : chosen; ex.key = it.answer;
    ex.sources = SOURCES.slice();
    return ex;
  }
  function trapOf(it, i) {
    if (i == null || i === it.answer) return null;
    if (it.type === 'cubes') return cubeTrap(it, i);
    return (it.options[i] && it.options[i].trap) || null;
  }

  /* ---------- markup ---------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function rich(s) { return esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>'); }
  function html(ex, o) {
    o = o || {};
    var chosen = o.chosen == null ? ex.picked : o.chosen, miss = chosen != null && chosen !== ex.key;
    var h = '<section class="pat-ex' + (miss ? ' is-miss' : '') + '" data-type="' + esc(ex.type) + '">';
    if (miss && ex.traps[chosen]) h += '<div class="pex-mine"><span class="pex-k">Why ' + LET[chosen] + ' is wrong</span><p>' + rich(ex.traps[chosen]) + '</p></div>';
    if (o.note) h += '<p class="pex-note">' + esc(o.note) + '</p>';
    if (chosen == null && o.open !== false) h += '<p class="pex-note">Left open. On test day, a guess is always worth putting down.</p>';
    h += '<div class="pex-answer"><span class="pex-k">The answer: ' + LET[ex.key] + '</span><p>' + rich(ex.answer) + '</p></div>';
    h += '<div class="pex-how"><span class="pex-k">How to get there</span><ol class="pex-steps">' + ex.steps.map(function (s, i) { return '<li data-frame="' + (i + 1) + '">' + rich(s.text || s) + '</li>'; }).join('') + '</ol></div>';
    var rest = Object.keys(ex.traps).map(Number).filter(function (i) { return !(miss && i === chosen); }).sort(function (a, b) { return a - b; });
    if (rest.length) h += '<details class="pex-traps"' + (o.trapsOpen ? ' open' : '') + '><summary>' + (miss ? 'Why the other choices are wrong' : 'Why each wrong choice is wrong') + '</summary><ul>' + rest.map(function (i) { return '<li><b>' + LET[i] + '</b><span>' + rich(ex.traps[i]) + '</span></li>'; }).join('') + '</ul></details>';
    if (ex.check) h += '<div class="pex-check"><span class="pex-k">Check yourself</span><p>' + rich(ex.check.q) + '</p><details><summary>Show answer</summary><p>' + rich(ex.check.a) + '</p></details></div>';
    h += '<details class="pex-src"><summary>Sources</summary><p>' + ex.sources.map(esc).join(' ') + '</p></details>';
    return h + '</section>';
  }

  /* review figure: pattern folding gets its faces numbered so the steps can name them */
  function labelSVG(svg, pts) {
    var lab = pts.map(function (p) { return '<g class="pex-lab"><circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="9" fill="#fff" stroke="#8a6d1e" stroke-width="1.4"/><text x="' + p[0].toFixed(1) + '" y="' + (p[1] + 4).toFixed(1) + '" text-anchor="middle" font-size="12" font-weight="700" font-family="DM Sans,Arial,sans-serif" fill="#5c4810">' + p[2] + '</text></g>'; }).join('');
    return svg.replace(/<\/svg>\s*$/, lab + '</svg>');
  }
  function figure(it, ex) {
    if (it.type !== 'patternfold') return null;
    ex = ex || explain(it, null);
    var num = ex.labels; if (!num) return null;
    var svg, pts;
    if (it.figure.kind === 'poly') {
      var fig = it.figure, s = 34, pad = 6, xs = [], ys = [];
      fig.net.forEach(function (f) { f.pts.forEach(function (p) { xs.push(p[0]); ys.push(p[1]); }); });
      var x0 = Math.min.apply(null, xs), y1 = Math.max.apply(null, ys);
      pts = fig.net.map(function (f, i) {
        var cx = 0, cy = 0; f.pts.forEach(function (p) { cx += p[0]; cy += p[1]; }); cx /= f.pts.length; cy /= f.pts.length;
        var mark = f.marks[0];
        if (mark && mark.length === 12) cy -= 0.38;            // a dot sits at the centroid: keep the number off it
        return [pad + (cx - x0) * s, pad + (y1 - cy) * s, num[i]];
      });
      svg = PAT.patternfoldPoly.renderFigure(it);
    } else {
      var net = it.figure.net, marks = it.figure.marks;
      pts = net.map(function (c, i) {
        var off = { tri: [0.7, 0.7], band: [0.5, 0.66], corner: [0.3, 0.7], half: [0.75, 0.5], dot: [0.5, 0.2] }[marks[i]] || [0.5, 0.5];
        return [6 + (c[0] + off[0]) * 40, 6 + (c[1] + off[1]) * 40, num[i]];
      });
      svg = PAT.patternfold.renderFigure(it);
    }
    var m = /<svg[\s\S]*<\/svg>/.exec(svg);
    if (!m) return svg;
    return svg.replace(m[0], labelSVG(m[0], pts)).replace('<figcaption>Pattern</figcaption>', '<figcaption>Pattern, faces numbered for the steps</figcaption>');
  }

  /* ================= studio drills =================
     The four studio drills (tools/pat/{holepunch,tfe,patternfold,keyholes}.html) generate their
     own items in the page. PAT.explain.drill(kind, data, chosen) explains one of those items from
     plain data the page hands over AFTER generation. It is a pure function: it draws no random
     numbers and changes nothing it is given, so a seed still reproduces the same item.
       holepunch   { folds:[{axis,c,side}], punches:[[x,y]], sets:[[[x,y]]], options:[[[x,y]]], answer }
       tfe         { feat, options:[{ ok, tax, hidden }], answer }
       patternfold { faces:{ top, front, right, bottom, back, left }, options:[{ ok, why }], answer }
       keyholes    { view, options:[{ correct, trap }], traps:{ CODE:{ label, note } }, answer }       */
  function strip(t) { return String(t).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(); }
  function sent(t) { t = strip(t).replace(/\s+-\s+/g, ': '); t = cap(t); return /[.!?]$/.test(t) ? t : t + '.'; }
  function dHole(d) {
    var F = d.folds.length, key = d.options[d.answer], H = key.length, ks = Object.keys(hset(key)).sort().join('|');
    var sig = function (a) { return Object.keys(hset(a)).sort().join('|'); };
    var steps = [S('Start folded: **' + pl(d.punches.length, 'punch', 'punches') + '** at ' + listAnd(d.punches.map(cname)) + '.')];
    for (var i = 0; i < F && steps.length < 4; i++) {
      var f = d.folds[F - 1 - i], n = d.sets[i + 1].length;
      steps.push(S('Unfold ' + (f.axis === 'v' ? 'the vertical' : 'the horizontal') + ' crease: mirror across it. Now **' + pl(n, 'hole') + '**.'));
    }
    if (steps.length < 3) steps.push(S('Only layers under the punch get a hole. Count them.'));
    steps.push(S('Fully open: **' + pl(H, 'hole') + '**. Match the grid, cell by cell.'));
    var early = d.sets.length > 1 ? sig(d.sets[d.sets.length - 2]) : '', mirV = sig(key.map(function (q) { return [4 - q[0], q[1]]; })), mirH = sig(key.map(function (q) { return [q[0], 4 - q[1]]; }));
    var traps = {};
    d.options.forEach(function (o, k) {
      if (k === d.answer) return;
      var g = sig(o), hs = hset(o), kh = hset(key), extra = o.filter(function (q) { return !kh[hkey(q)]; }), lost = key.filter(function (q) { return !hs[hkey(q)]; });
      if (g === early) traps[k] = 'It stops one unfold early: ' + pl(o.length, 'hole') + ', not ' + H + '. The last crease still has to be mirrored.';
      else if (g === mirV || g === mirH) traps[k] = 'The whole sheet is flipped. The count is right, but every hole sits on the wrong side of the crease.';
      else if (!extra.length && lost.length) traps[k] = 'It is missing the hole at ' + cname(lost[0]) + ': ' + pl(o.length, 'hole') + ', not ' + H + '.';
      else if (extra.length && !lost.length) traps[k] = 'It adds a hole at ' + cname(extra[0]) + ' that no layer under the punch can make.';
      else if (extra.length === 1 && lost.length === 1) traps[k] = 'One hole is a cell off: it shows ' + cname(extra[0]) + ', but the mirror lands on ' + cname(lost[0]) + '.';
      else traps[k] = 'Its holes do not mirror across the creases: ' + cname(extra[0] || o[0]) + ' has no partner from any unfold.';
    });
    return { answer: 'Open sheet: ' + pl(H, 'hole') + ', one for each layer under a punch.',
      steps: steps, traps: traps,
      check: { q: 'How many holes show once the paper is fully open?', a: H + '. Each unfold mirrors the holes that sat under that flap.' } };
  }
  var TFE_TRAP = {
    mirror: 'Front and back are swapped. On the end view, the left edge is the front of the object.',
    dash: 'A hidden edge is drawn solid. An edge you cannot see from the end must be dashed.',
    height: 'A step is in the wrong place. Heights come from the front view, depths from the top view.'
  };
  function dTfe(d) {
    var key = d.options[d.answer], traps = {};
    d.options.forEach(function (o, k) { if (k !== d.answer) traps[k] = TFE_TRAP[o.tax] || 'Its outline disagrees with the front or the top view along one edge.'; });
    return { answer: key && key.hidden ? 'It keeps the front heights and the top depths, and dashes the hidden edges.' : 'It keeps the front heights and the top depths, with nothing hidden.',
      steps: [S('Stand at the right end. **End-left** is the front of the object.'),
        S('Read every height off the front view.'),
        S('Read every depth off the top view.'),
        S(key && key.hidden ? 'Edges behind material are **dashed**. This one has them.' : 'Nothing hides behind material here, so expect **no dashes**.')],
      traps: traps,
      check: { q: 'On the end view, which side is the front of the object?', a: 'The left side. Depth runs left to right, front to back.' } };
  }
  var PF_NAME = { tri: 'half-shade', band: 'edge band', corner: 'corner square', solid: 'shaded', blank: 'blank' };
  function dFold(d) {
    var f = d.faces, nm = function (k) { return PF_NAME[f[k]] || f[k]; }, traps = {};
    d.options.forEach(function (o, k) { if (k !== d.answer) traps[k] = sent(o.why || 'One face does not match the net'); });
    return { answer: 'Top ' + nm('top') + ', front ' + nm('front') + ', right ' + nm('right') + ', as the net folds.',
      steps: [S('Pair the look-alike choices. Find the one face that differs.'),
        S('**Opposites** never show together: ' + nm('top') + ' sits across from ' + nm('bottom') + '.'),
        S('Also across: ' + nm('front') + ' from ' + nm('back') + ', ' + nm('left') + ' from ' + nm('right') + '.'),
        S('A mark keeps touching the **same edge** on the cube as on the net.')],
      traps: traps,
      check: { q: 'Which face sits opposite the ' + nm('top') + ' top face?', a: 'The ' + nm('bottom') + ' face. A choice that shows both at once is out.' } };
  }
  function dKey(d) {
    var view = strip(d.view || '').replace(/\s*\(.*\)\s*$/, '').toLowerCase() || 'one straight-on view', traps = {};
    d.options.forEach(function (o, k) {
      if (k === d.answer) return;
      var t = d.traps && d.traps[o.trap];
      traps[k] = t ? cap(strip(t.label)) + ': ' + strip(t.note).split(/(?<=[.!?])\s+/)[0].replace(/\s+-\s+/g, ': ') : 'Its outline matches no straight-on view of the object.';
    });
    return { answer: 'It is the object\'s ' + view + ', outline and proportions both exact.',
      steps: [S('An opening fits only if it equals **one straight-on view**.'),
        S('Picture the top, the front and the end outlines.'),
        S('Turning or mirror-flipping the opening is allowed. Changing it is not.'),
        S('Match notches first, then **proportions**. This one is the ' + view + '.')],
      traps: traps,
      check: { q: 'Which view of the object does the correct opening match?', a: 'The ' + view + '. Any turn or mirror of it would pass too.' } };
  }
  var DRILL = { holepunch: dHole, tfe: dTfe, patternfold: dFold, keyholes: dKey };
  function drill(kind, data, chosen) {
    var ex = DRILL[kind](data);
    ex.type = kind; ex.picked = chosen == null ? null : chosen; ex.key = data.answer;
    ex.sources = ['Every line above is computed from this drill item by the Ace PAT engine.'];
    return ex;
  }
  /* The panel a drill page shows after an answer: the worked explanation, then the See it chip. */
  function drillHTML(kind, data, chosen) {
    var h = html(drill(kind, data, chosen), { chosen: chosen, open: false });
    var V = typeof window !== 'undefined' && window.AceVisuals;
    var chip = V && V.chipHTML ? V.chipHTML({ section: 'pat', topic: kind }, 'set') : '';
    return h + (chip ? '<p class="pex-see">' + chip + '</p>' : '');
  }

  explain.html = html; explain.trapOf = trapOf; explain.figure = figure; explain.SOURCES = SOURCES;
  explain.drill = drill; explain.drillHTML = drillHTML;
  PAT.explain = explain;
  if (typeof module === 'object' && module.exports) module.exports = PAT;
})(typeof self !== 'undefined' ? self : globalThis);
