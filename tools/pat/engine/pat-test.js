/*
  pat-test.js : full 90-question PAT assembly + the review analyzers.

  build(testId)         -> 90 items in real order (15 per section), fully
                           reproducible: Test N always produces the same items.
  buildAsync(id, onP)   -> same, yielding between items so the page stays live.
  analyze(test, attempt)-> section scores, time per section, per-type error
                           patterns and 2-3 next steps per weak type.
  Raw counts only: no scaled scores, no predictions.
*/
(function (root) {
  'use strict';
  var PAT = root.PAT || (typeof require === 'function' ? require('./pat-core.js') : null);
  var C = PAT.core;

  var NUMBERED = 15;
  function seedFor(testId) {
    if (typeof testId === 'number') return C.hashStr('acethedat-pat-test-' + testId);
    var m = /^F(\d+)$/.exec(String(testId));
    if (m) return parseInt(m[1], 10) >>> 0;
    throw new Error('unknown test id ' + testId);
  }
  function labelFor(testId) { return typeof testId === 'number' ? 'PAT Test ' + testId : 'Fresh test ' + String(testId).slice(1); }
  function freshId() { return 'F' + ((Math.random() * 4294967295) >>> 0); }

  /* the plan of generator calls for one test: deterministic from the seed */
  function plan(seed) {
    var rng = C.makeRng(C.childSeed(seed, 'plan'));
    var kh = rng.shuffle(['medium', 'medium', 'medium', 'hard', 'hard', 'hard', 'hard', 'hard', 'hard', 'hard', 'brutal', 'brutal', 'brutal', 'hard', 'medium']);
    var hp = rng.shuffle([1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3]);
    var steps = [];
    for (var i = 0; i < 15; i++) steps.push({ type: 'keyholes', seed: C.childSeed(seed, 'kh' + i), arg: kh[i] });
    for (var j = 0; j < 15; j++) steps.push({ type: 'tfe', seed: C.childSeed(seed, 'tfe' + j) });
    for (var k = 0; k < 15; k++) steps.push({ type: 'angles', seed: C.childSeed(seed, 'ang' + k) });
    for (var l = 0; l < 15; l++) steps.push({ type: 'holepunch', seed: C.childSeed(seed, 'hp' + l), arg: hp[l] });
    [['A', 4], ['B', 4], ['C', 4], ['D', 3]].forEach(function (fg) { steps.push({ type: 'cubes', seed: C.childSeed(seed, 'cube' + fg[0]), arg: fg }); });
    for (var m = 0; m < 15; m++) steps.push({ type: 'patternfold', seed: C.childSeed(seed, 'pf' + m) });
    return steps;
  }
  function runStep(st) {
    if (st.type === 'keyholes') return [PAT.keyholes.generate(st.seed, st.arg)];
    if (st.type === 'tfe') return [PAT.tfe.generate(st.seed)];
    if (st.type === 'angles') return [PAT.angles.generate(st.seed)];
    if (st.type === 'holepunch') return [PAT.holepunch.generate(st.seed, { folds: st.arg })];
    if (st.type === 'cubes') return PAT.cubes.generateSet(st.seed, st.arg[1], st.arg[0]);
    if (st.type === 'patternfold') return [PAT.patternfold.generate(st.seed)];
    throw new Error('step ' + st.type);
  }
  function finish(testId, seed, items) {
    items.forEach(function (it, i) { it.n = i + 1; });
    if (items.length !== 90) throw new Error('test has ' + items.length + ' items');
    return { id: String(testId), testId: testId, seed: seed, label: labelFor(testId), items: items };
  }
  function build(testId) {
    var seed = seedFor(testId), items = [];
    plan(seed).forEach(function (st) { items.push.apply(items, runStep(st)); });
    return finish(testId, seed, items);
  }
  function buildAsync(testId, onProgress) {
    var seed = seedFor(testId), steps = plan(seed), items = [], i = 0;
    return new Promise(function (resolve, reject) {
      function tick() {
        try {
          var until = Date.now() + 40;
          while (i < steps.length && Date.now() < until) { items.push.apply(items, runStep(steps[i])); i++; }
          if (onProgress) onProgress(items.length / 90);
          if (i < steps.length) setTimeout(tick, 0); else resolve(finish(testId, seed, items));
        } catch (e) { reject(e); }
      }
      setTimeout(tick, 0);
    });
  }

  /* Thomas order: start at 31 (angle ranking), run to 90, then ONE jump back to 1-30. */
  function order(mode) {
    var o = [], i;
    if (mode === 'thomas') { for (i = 31; i <= 90; i++) o.push(i); for (i = 1; i <= 30; i++) o.push(i); }
    else for (i = 1; i <= 90; i++) o.push(i);
    return o;
  }

  /* ---------------- analyzers ---------------- */
  var CANON = 'https://acethedat-portal.netlify.app/canon/sheets/';
  var LINKS = {
    keyholes: { studio: 'keyholes.html', canon: CANON + 'pat-keyholes.html' },
    tfe: { studio: 'tfe.html', canon: CANON + 'pat-top-front-end.html' },
    angles: { studio: 'angles.html', canon: CANON + 'pat-angle-ranking.html' },
    holepunch: { studio: 'holepunch.html', canon: CANON + 'pat-hole-punching.html' },
    cubes: { studio: 'cubes.html', canon: CANON + 'pat-cube-counting.html' },
    patternfold: { studio: 'patternfold.html', canon: CANON + 'pat-pattern-folding.html' }
  };
  var TRAP_NAMES = {
    keyholes: { FILL: 'Dropped feature', CARVE: 'Added notch', LIMB: 'Impossible combination', SCALE: 'Wrong proportions', ISLAND: 'Floating island', MIRROR: 'Near-mirror', FOREIGN: 'Different object', SIZE: 'Right shape, wrong size' },
    tfe: { mirror: 'Front and back (or left and right) swapped', 'dash-as-solid': 'Hidden edge drawn solid', 'solid-as-dash': 'Visible edge drawn dashed', profile: 'A step in the wrong place' },
    angles: { swap: 'Swapped a close pair', double: 'Swapped two pairs', shift: 'Misplaced one angle by two spots' },
    holepunch: { 'missed-unfold': 'Skipped one unfold', 'wrong-line': 'Mirrored across the wrong line', flipped: 'Read the sheet flipped', shifted: 'One hole off by a cell', dropped: 'One hole missing' },
    cubes: {},
    patternfold: { mirror: 'Mirror image cube', rotation: 'A face turned the wrong way', neighbor: 'Two faces traded places', opposite: 'Opposite faces shown side by side' }
  };

  function bucketRows(items, attempt, keyFn, labels) {
    var rows = {};
    items.forEach(function (it) {
      var k = keyFn(it); if (k == null) return;
      var r = rows[k] || (rows[k] = { key: k, label: labels ? labels(k) : String(k), correct: 0, total: 0 });
      r.total++; if (attempt.answers[it.n - 1] === it.answer) r.correct++;
    });
    return Object.keys(rows).map(function (k) { return rows[k]; });
  }
  function trapRows(type, items, attempt) {
    var t = {};
    items.forEach(function (it) {
      var a = attempt.answers[it.n - 1];
      if (a == null || a === it.answer) return;
      var trap = it.options[a] && it.options[a].trap;
      if (!trap) return;
      t[trap] = (t[trap] || 0) + 1;
    });
    return Object.keys(t).map(function (k) { return { key: k, label: (TRAP_NAMES[type] || {})[k] || k, count: t[k] }; }).sort(function (a, b) { return b.count - a.count; });
  }

  var PATTERN = {
    keyholes: function (items, at) {
      var LB = { sym: 'Symmetric outline', near: 'Nearly symmetric outline', asym: 'Clearly lopsided outline' };
      return { title: 'By symmetry of the answer outline', rows: bucketRows(items, at, function (it) {
        return (it.meta.keySymmetry > 1 || it.meta.mirrorCloseness >= 0.999) ? 'sym' : it.meta.mirrorCloseness >= 0.82 ? 'near' : 'asym';
      }, function (k) { return LB[k]; }).sort(function (a, b) { return ['sym', 'near', 'asym'].indexOf(a.key) - ['sym', 'near', 'asym'].indexOf(b.key); }) };
    },
    tfe: function (items, at) {
      return { title: 'By hidden lines in the answer', rows: bucketRows(items, at, function (it) { var h = it.meta.hiddenLines; return h === 0 ? '0' : h <= 2 ? '1-2' : '3+'; }, function (k) { return k === '0' ? 'No hidden lines' : k + ' hidden lines'; }).sort(function (a, b) { return a.key < b.key ? -1 : 1; }),
        extra: { title: 'By missing view', rows: bucketRows(items, at, function (it) { return it.meta.missing; }, function (k) { return k.charAt(0).toUpperCase() + k.slice(1) + ' view missing'; }) } };
    },
    angles: function (items, at) {
      return { title: 'By closest gap in the set', rows: bucketRows(items, at, function (it) { var g = it.meta.minGap; return g <= 2 ? '2' : g === 3 ? '3' : '4+'; }, function (k) { return k === '4+' ? '4 or more degrees apart' : k + ' degrees apart'; }).sort(function (a, b) { return a.key < b.key ? -1 : 1; }),
        missedGaps: items.map(function (it) { var a = at.answers[it.n - 1]; return (a == null || a === it.answer) ? null : PAT.angles.missedGap(it, a); }).filter(function (g) { return g != null; }) };
    },
    holepunch: function (items, at) {
      return { title: 'By number of folds', rows: bucketRows(items, at, function (it) { return it.meta.folds; }, function (k) { return k + (k === 1 || k === '1' ? ' fold' : ' folds'); }).sort(function (a, b) { return a.key - b.key; }),
        extra: { title: 'By fold direction', rows: bucketRows(items, at, function (it) { return it.meta.diagonal ? 'diag' : 'straight'; }, function (k) { return k === 'diag' ? 'Includes a diagonal fold' : 'Straight folds only'; }) } };
    },
    cubes: function (items, at) {
      return { title: 'By hidden cubes', rows: bucketRows(items, at, function (it) { return it.meta.hiddenInAnswer > 0 ? 'hid' : 'vis'; }, function (k) { return k === 'hid' ? 'Answer includes cubes you cannot see' : 'Every counted cube is visible'; }),
        extra: { title: 'By painted sides asked', rows: bucketRows(items, at, function (it) { return it.meta.k; }, function (k) { return k + ' painted side' + (+k === 1 ? '' : 's'); }).sort(function (a, b) { return a.key - b.key; }) } };
    },
    patternfold: function (items, at) {
      return { title: 'By net type', rows: bucketRows(items, at, function (it) { return it.meta.netType; }, function (k) { return k + ' net'; }) };
    }
  };

  function weakestRow(rows) {
    var best = null;
    rows.forEach(function (r) { if (r.total < 2) return; var miss = r.total - r.correct; if (!best || miss / r.total > (best.total - best.correct) / best.total) best = r; });
    return best && best.correct < best.total ? best : null;
  }

  /* 2-3 plain next steps for a section, chosen from its own error pattern */
  function nextSteps(type, pat, traps) {
    var L = LINKS[type], s = [], wr = weakestRow(pat.rows), topTrap = traps[0];
    var studio = function (q) { return L.studio + (q || ''); };
    if (type === 'keyholes') {
      if (wr && (wr.key === 'sym' || wr.key === 'near')) s.push({ text: 'Symmetric and nearly symmetric outlines are where the misses sit. Before you look at the choices, name each true view (top, front, end), then compare two look-alike choices against EACH OTHER, not against the object.', href: studio() });
      else if (wr) s.push({ text: 'Lopsided outlines were the tricky ones. Spend 5 seconds orienting, then trace only the outline: the inside features are traps.', href: studio() });
      if (topTrap && topTrap.key === 'SIZE') s.push({ text: 'You picked a right-shape, wrong-size opening. Check proportions last: width against height, then against the object.', href: studio() });
      else if (topTrap) s.push({ text: 'Your misses leaned toward "' + topTrap.label + '". Run the Aperture Trainer on Hard and watch for that trap in its tally.', href: studio() });
      s.push({ text: 'Review the keyholes method on one page, then do one timed set of 15 at about 45 seconds each.', href: L.canon });
    } else if (type === 'tfe') {
      if (wr && wr.key !== '0') s.push({ text: 'Items with ' + wr.label.toLowerCase() + ' cost the most. Ask of every line: can I see it from here? If not, it is dashed. Settle solid vs dashed before anything else.', href: studio() });
      if (topTrap && topTrap.key === 'mirror') s.push({ text: 'You flipped front and back. On the END view, end-left is always the FRONT of the object. Say it out loud on the next ten.', href: studio() });
      else if (topTrap) s.push({ text: 'Most misses were "' + topTrap.label.toLowerCase() + '". Match height to the FRONT and depth to the TOP, one pairing at a time.', href: studio() });
      s.push({ text: 'Walk the inspector\'s three stops on the TFE sheet, then drill 10 in Guided mode before going timed.', href: L.canon });
    } else if (type === 'angles') {
      var g = pat.missedGaps.length ? Math.min.apply(null, pat.missedGaps) : null;
      if (g != null) s.push({ text: 'Your misses came from angles about ' + g + ' degree' + (g === 1 ? '' : 's') + ' apart. Set the trainer\'s gap dial to ' + (g <= 2 ? 2 : g <= 3 ? 3 : 5) + ' and do 20 quick reps.', href: studio('?gap=' + (g <= 2 ? 2 : g <= 3 ? 3 : 5)) });
      s.push({ text: 'Lock the clear smallest and largest first, then argue only the close middle pair. Knife for acute, laptop for obtuse.', href: studio('?mode=teach') });
      s.push({ text: 'Trust the first read. About 20 seconds per item; staring longer tends to talk you out of a right answer.', href: L.canon });
    } else if (type === 'holepunch') {
      if (wr) s.push({ text: wr.label + ' cost the most. Draw the grid, then undo the folds in reverse, one crease at a time: what piece, over what line?', href: studio('?lv=' + (String(wr.key) === '3' ? 3 : 2)) });
      if (pat.extra && weakestRow(pat.extra.rows) && weakestRow(pat.extra.rows).key === 'diag') s.push({ text: 'Diagonal folds were the sticking point. A diagonal crease mirrors a hole across the diagonal: row becomes column. Mark it on the grid before moving on.', href: L.canon });
      else if (topTrap) s.push({ text: 'Your misses leaned toward "' + topTrap.label.toLowerCase() + '". Read your finished grid against the choices only at the very end.', href: studio() });
      s.push({ text: 'Pre-draw your 15 grids before the section so each item starts on a clean grid.', href: L.canon });
    } else if (type === 'cubes') {
      if (wr && wr.key === 'hid') s.push({ text: 'The misses involved cubes you cannot see. Count bottom to top, front to back, left to right, and number the hidden supporting cubes too.', href: studio() });
      var ex = pat.extra ? weakestRow(pat.extra.rows) : null;
      if (ex) s.push({ text: 'Questions about ' + ex.label + ' were the miss. Tally every cube once in the T-chart, then check that the tally total equals the cube count.', href: studio() });
      s.push({ text: 'Remember the bottom face on the floor is never painted. One clean sweep per figure answers all of its questions.', href: L.canon });
    } else if (type === 'patternfold') {
      if (wr) s.push({ text: wr.label + 's were the toughest. Do not fold the whole net: find the odd face, then check the two faces that touch it.', href: studio() });
      if (topTrap && topTrap.key === 'mirror') s.push({ text: 'You chose a mirror-image cube. Faces fold INTO the page; a correct cube never flips how a half-shade leans.', href: studio() });
      else if (topTrap) s.push({ text: 'Most misses were "' + topTrap.label.toLowerCase() + '". Pair the answer choices that look alike and compare those two first.', href: studio() });
      s.push({ text: 'Run the pattern-folding sheet, then a timed set of 15 at about 50 seconds each.', href: L.canon });
    }
    return s.slice(0, 3);
  }

  function analyze(test, attempt) {
    var sections = PAT.SECTIONS.map(function (sec) {
      var items = test.items.slice(sec.from - 1, sec.to);
      var correct = 0, answered = 0, time = 0;
      items.forEach(function (it) {
        var a = attempt.answers[it.n - 1];
        if (a != null) answered++;
        if (a === it.answer) correct++;
        time += (attempt.timeSpent && attempt.timeSpent[it.n - 1]) || 0;
      });
      var pat = PATTERN[sec.type](items, attempt);
      var traps = trapRows(sec.type, items, attempt);
      return {
        type: sec.type, name: sec.name, from: sec.from, to: sec.to, correct: correct, of: items.length,
        answered: answered, timeSec: Math.round(time), pattern: pat, traps: traps,
        steps: correct < items.length ? nextSteps(sec.type, pat, traps) : [],
        links: LINKS[sec.type]
      };
    });
    var total = sections.reduce(function (a, s) { return a + s.correct; }, 0);
    var answered = sections.reduce(function (a, s) { return a + s.answered; }, 0);
    // "weak" = the sections with the most misses (up to three), never more than needed
    var weak = sections.filter(function (s) { return s.correct < s.of; }).sort(function (a, b) { return (a.correct / a.of) - (b.correct / b.of); }).slice(0, 3).map(function (s) { return s.type; });
    return { total: total, of: 90, answered: answered, sections: sections, weak: weak };
  }

  PAT.test = { NUMBERED: NUMBERED, seedFor: seedFor, labelFor: labelFor, freshId: freshId, plan: plan, build: build, buildAsync: buildAsync, order: order, analyze: analyze, LINKS: LINKS, TRAP_NAMES: TRAP_NAMES };
  if (typeof module === 'object' && module.exports) module.exports = PAT;
})(typeof self !== 'undefined' ? self : globalThis);
