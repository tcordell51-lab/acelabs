/* galvanic-walk.js : the galvanic lab's science, its miss walkthrough and its follow-ups.
   One source of truth for the page (gc/galvanic/index.html), tests/shell/ace-walkthrough.test.js
   and the verify run (every number recomputed; docs/walkthrough-verify.csv).

   Standard reduction potentials at 25 C, volts: OpenStax Chemistry 2e, Appendix L
   (Cu2+/Cu is +0.337 V in Appendix L; Table 17.1 rounds it to +0.34 V).
   Explanations follow docs/EXPLANATION-STANDARD.md. Thomas's lines are his recorded words
   (reports/teaching-system/gchem/playbook.md 9.3 and 9.4); nothing here is attributed to him
   that he did not say. */
(function (root) {
  'use strict';
  var HALF = [
    { id: 'Ag', ion: 'Ag⁺', ionT: 'Ag^+', n: 1, e: 0.7996, metal: 'silver', color: '#c9ccd1', sol: null },
    { id: 'Cu', ion: 'Cu²⁺', ionT: 'Cu^{2+}', n: 2, e: 0.337, metal: 'copper', color: null, sol: '#7fb6d6' },
    { id: 'Pb', ion: 'Pb²⁺', ionT: 'Pb^{2+}', n: 2, e: -0.1262, metal: 'lead', color: '#7d8188', sol: null },
    { id: 'Sn', ion: 'Sn²⁺', ionT: 'Sn^{2+}', n: 2, e: -0.1375, metal: 'tin', color: '#b8bcc2', sol: null },
    { id: 'Ni', ion: 'Ni²⁺', ionT: 'Ni^{2+}', n: 2, e: -0.257, metal: 'nickel', color: '#a7a596', sol: '#9fcf9a' },
    { id: 'Fe', ion: 'Fe²⁺', ionT: 'Fe^{2+}', n: 2, e: -0.447, metal: 'iron', color: '#6f6a64', sol: '#cfe3b8' },
    { id: 'Zn', ion: 'Zn²⁺', ionT: 'Zn^{2+}', n: 2, e: -0.7618, metal: 'zinc', color: null, sol: null },
    { id: 'Al', ion: 'Al³⁺', ionT: 'Al^{3+}', n: 3, e: -1.662, metal: 'aluminum', color: '#d6d8dc', sol: null },
    { id: 'Mg', ion: 'Mg²⁺', ionT: 'Mg^{2+}', n: 2, e: -2.372, metal: 'magnesium', color: '#e3e4e6', sol: null }
  ];
  var byId = {}; HALF.forEach(function (h) { byId[h.id] = h; });
  var MINUS = '−';
  var TRICK = { text: 'Electrons always flow from the anode to the cathode.', src: 'Zoom 2026-04-28 #84183655423 ~0:48:29' };
  var TRICK_RULE = { text: 'Reduction is at the cathode, red cat. The oxidation occurs at the anode and ox.', src: 'Zoom 2026-04-28 #84183655423 ~0:14:46' };
  var SOURCES = ['OpenStax Chemistry 2e, 17.2 Galvanic Cells and 17.3 Electrode and Cell Potentials.',
    'Potentials: OpenStax Chemistry 2e, Appendix L, 25 °C.',
    "Thomas's line: Zoom 2026-04-28 #84183655423 ~0:48:29 (Gen Chem playbook 9.3)."];

  /* E as printed: the table's own digits, a true minus sign. */
  function fmtE(x, plus) { var s = Math.abs(x).toFixed(x === 0.337 ? 3 : 4).replace(/0+$/, '').replace(/\.$/, ''); return (x < 0 ? MINUS : (plus === false ? '' : '+')) + s; }
  function fmtCell(x) { return (x > 0 ? '+' : x < 0 ? MINUS : '') + Math.abs(x).toFixed(3); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function cell(leftId, rightId) {
    var L = byId[leftId], R = byId[rightId];
    if (!L || !R || L.id === R.id) return null;
    var cathode = L.e > R.e ? 'left' : 'right';
    var cat = cathode === 'left' ? L : R, an = cathode === 'left' ? R : L;
    return { L: L, R: R, cathode: cathode, cat: cat, an: an, ecell: cat.e - an.e, dir: cathode === 'right' ? 'lr' : 'rl' };
  }
  function dirWords(d) { return d === 'lr' ? 'left to right' : 'right to left'; }
  function ecellLine(c) { return fmtE(c.cat.e, false) + ' ' + MINUS + ' ' + (c.an.e < 0 ? '(' + fmtE(c.an.e) + ')' : fmtE(c.an.e, false)); }

  /* The five steps, in the order the board draws them. Bold: one key term each. */
  function steps(c) {
    return [
      { text: 'Write both **reduction potentials**: ' + c.L.id + ' ' + fmtE(c.L.e) + ' V, ' + c.R.id + ' ' + fmtE(c.R.e) + ' V.', frame: 1 },
      { text: 'Higher one is **reduced**: ' + c.cat.id + ' is the cathode, ' + c.an.id + ' the anode.', frame: 2 },
      { text: '**Electrons** go anode to cathode: ' + c.an.id + ' to ' + c.cat.id + ', ' + dirWords(c.dir) + '.', frame: 3 },
      { text: '**Salt bridge**: anions drift to ' + c.an.id + ', cations drift to ' + c.cat.id + '.', frame: 4 },
      { text: '**E cell** = ' + ecellLine(c) + ' = ' + fmtCell(c.ecell) + ' V. Positive: galvanic.', frame: 5 }
    ];
  }
  /* A different pair for "Check yourself": the anode is the lower potential. */
  function checkFor(c) {
    var pairs = [['Ag', 'Ni'], ['Cu', 'Mg'], ['Pb', 'Al'], ['Ag', 'Fe']];
    for (var i = 0; i < pairs.length; i++) {
      var a = byId[pairs[i][0]], b = byId[pairs[i][1]];
      if ([a.id, b.id].indexOf(c.L.id) >= 0 && [a.id, b.id].indexOf(c.R.id) >= 0) continue;
      var lo = a.e < b.e ? a : b;
      return { q: cap(a.metal) + ' and ' + b.metal + ': which one is the anode?', a: cap(lo.metal) + '. Its potential is lower, so it is oxidized.' };
    }
    return null;
  }

  /* The wrong-direction call in the lab: picked is 'lr' or 'rl'. */
  function explain(c) {
    var wrong = c.dir === 'lr' ? 'rl' : 'lr', traps = {};
    traps[c.dir] = null;
    traps[wrong] = 'You sent electrons from ' + c.cat.metal + ' to ' + c.an.metal + '. Direction comes from the potentials, not the picture.';
    return { answer: 'Electrons flow from ' + c.an.metal + ' to ' + c.cat.metal + ': ' + dirWords(c.dir) + '.', trick: TRICK, steps: steps(c), traps: traps, check: checkFor(c), sources: SOURCES };
  }

  /* ---- the board: 600 x 830, drawn in code from the cell ---- */
  var X = { left: 155, right: 445 };
  function board(c) {
    var lx = X.left, rx = X.right, anX = c.cathode === 'left' ? rx : lx, catX = c.cathode === 'left' ? lx : rx;
    var hi = c.L.e > c.R.e ? c.L : c.R, lo = hi === c.L ? c.R : c.L;
    function metalFill(h) { return h.id === 'Cu' ? 'copper' : 'metal'; }
    var base = [
      { k: 'rect', x: 54, y: 440, w: 202, h: 141, c: 'blue', fill: 'sol', ink: false },
      { k: 'rect', x: 344, y: 440, w: 202, h: 141, c: 'blue', fill: 'sol', ink: false },
      { k: 'path', d: 'M50,400 L50,585 L260,585 L260,400', c: 'forest', sw: 5 },
      { k: 'path', d: 'M340,400 L340,585 L550,585 L550,400', c: 'forest', sw: 5 },
      { k: 'path', d: 'M56,440 L110,436 L160,443 L210,436 L254,440', c: 'blue', sw: 3 },
      { k: 'path', d: 'M346,440 L400,436 L450,443 L500,436 L544,440', c: 'blue', sw: 3 },
      { k: 'rect', x: 135, y: 350, w: 40, h: 200, c: 'ink', sw: 4, fill: metalFill(c.L) },
      { k: 'rect', x: 425, y: 350, w: 40, h: 200, c: 'ink', sw: 4, fill: metalFill(c.R) },
      { k: 'path', d: 'M200,505 L200,345 L400,345 L400,505', c: 'gold', sw: 5 },
      { k: 'path', d: 'M230,505 L230,375 L370,375 L370,505', c: 'gold', sw: 5 },
      { k: 'path', d: 'M155,350 L155,300 L270,300', c: 'ink', sw: 4 },
      { k: 'circle', cx: 300, cy: 300, r: 30, c: 'ink', sw: 4, fill: 'cream' },
      { k: 'text', x: 300, y: 312, t: 'V', s: 32, c: 'ink', f: 'mark', a: 'middle' },
      { k: 'path', d: 'M330,300 L445,300 L445,350', c: 'ink', sw: 4 },
      { k: 'text', x: 95, y: 530, t: c.L.id, s: 36, c: 'ink', a: 'middle' },
      { k: 'text', x: 505, y: 530, t: c.R.id, s: 36, c: 'ink', a: 'middle' }
    ];
    var f1 = [
      { k: 'line', x1: 70, y1: 205, x2: 70, y2: 50, c: 'muted', sw: 4, arrow: 'end' },
      { k: 'text', x: 92, y: 48, t: 'reduction potential, E°', s: 28, c: 'muted' },
      { k: 'line', x1: 56, y1: 95, x2: 86, y2: 95, c: 'ink', sw: 4 },
      { k: 'text', x: 106, y: 106, t: hi.id + '  ' + fmtE(hi.e) + ' V', s: 34, c: 'ink' },
      { k: 'line', x1: 56, y1: 175, x2: 86, y2: 175, c: 'ink', sw: 4 },
      { k: 'text', x: 106, y: 186, t: lo.id + '  ' + fmtE(lo.e) + ' V', s: 34, c: 'ink' }
    ];
    var f2 = [
      { k: 'ellipse', cx: 196, cy: 96, rx: 112, ry: 34, c: 'gold', sw: 5 },
      { k: 'text', x: 332, y: 106, t: 'Red Cat: cathode', s: 32, c: 'green' },
      { k: 'text', x: 332, y: 186, t: 'An Ox: anode', s: 32, c: 'red' },
      { k: 'text', x: catX, y: 642, t: 'cathode, reduced', s: 30, c: 'green', a: 'middle' },
      { k: 'text', x: anX, y: 642, t: 'anode, oxidized', s: 30, c: 'red', a: 'middle' }
    ];
    var a1 = anX < catX ? anX + 20 : anX - 20, a2 = anX < catX ? catX - 20 : catX + 20;
    var f3 = [
      { k: 'line', x1: a1, y1: 250, x2: a2, y2: 250, c: 'blue', sw: 6, arrow: 'end', head: 20 },
      { k: 'text', x: 300, y: 236, t: 'e^-  ' + dirWords(c.dir), s: 30, c: 'blue', a: 'middle' }
    ];
    var mid = 300, toAn = anX < catX ? 246 : 354, toCat = anX < catX ? 354 : 246;
    var f4 = [
      { k: 'line', x1: mid, y1: 360, x2: toAn, y2: 360, c: 'red', sw: 4, arrow: 'end', head: 13 },
      { k: 'line', x1: mid, y1: 360, x2: toCat, y2: 360, c: 'blue', sw: 4, arrow: 'end', head: 13 },
      { k: 'text', x: anX, y: 702, t: 'anions → ' + c.an.id, s: 30, c: 'red', a: 'middle' },
      { k: 'text', x: catX, y: 702, t: 'cations → ' + c.cat.id, s: 30, c: 'blue', a: 'middle' }
    ];
    var f5 = [
      { k: 'text', x: 300, y: 758, t: 'E cell = ' + ecellLine(c), s: 32, c: 'forest', a: 'middle' },
      { k: 'text', x: 300, y: 806, t: '= ' + fmtCell(c.ecell) + ' V   positive: galvanic', s: 32, c: 'forest', a: 'middle' },
      { k: 'line', x1: 150, y1: 816, x2: 320, y2: 816, c: 'gold', sw: 5 }
    ];
    return { w: 600, h: 830, label: 'Galvanic cell: ' + c.L.id + ' on the left, ' + c.R.id + ' on the right', base: base, frames: [f1, f2, f3, f4, f5] };
  }

  /* ---- the lab's own check question, now with a trap for every wrong choice ---- */
  function plainSteps(c) { return steps(c).map(function (s) { return s.text.replace(/\*\*/g, ''); }); }
  function checkItem(c, at) {
    var A = c.an.metal, C = c.cat.metal;
    var right = 'Electrons travel through the wire from the ' + A + ' electrode to the ' + C + ' electrode.';
    var wrong = [
      ['Electrons travel through the wire from the ' + C + ' electrode to the ' + A + ' electrode.', 'That is backwards. Electrons leave the anode, ' + A + ', and go to ' + C + '.'],
      ['The ' + A + ' electrode is the cathode and gains mass as the cell runs.', cap(A) + ' has the lower potential, so it is oxidized: the anode, and it loses mass.'],
      ['Electrons travel through the salt bridge to complete the circuit.', 'Electrons stay in the wire. Ions carry the charge through the salt bridge.'],
      ['E°cell equals E°anode minus E°cathode, so the cell potential is negative.', 'The order is cathode minus anode. A working galvanic cell is positive.']
    ];
    var choices = wrong.map(function (w) { return w[0]; }), traps = wrong.map(function (w) { return w[1]; });
    choices.splice(at, 0, right); traps.splice(at, 0, null);
    return { id: 'gc:galvanic:' + c.an.id + '-' + c.cat.id, section: 'gchem', topic: 'electrochem-lab', topicName: 'Galvanic cells', skill: 'gc_galvanic',
      stem: 'A galvanic cell is built from a ' + c.L.ion + '|' + c.L.id + ' half-cell and a ' + c.R.ion + '|' + c.R.id + ' half-cell under standard conditions. Which statement about the operating cell is true?',
      choices: choices, answer: at, traps: traps,
      why: 'Electrons go from ' + A + ' to ' + C + ' through the wire, so E°cell = ' + fmtCell(c.ecell) + ' V.',
      steps: plainSteps(c), trick: TRICK.text };
  }
  /* The walkthrough for a miss on the check question: same steps and board, its own traps. */
  function explainCheck(c, item) {
    var e = explain(c), traps = {};
    item.traps.forEach(function (t, i) { traps[i] = t; });
    e.traps = traps; e.answer = 'Electrons go from ' + c.an.metal + ' to ' + c.cat.metal + ' through the wire.';
    return e;
  }

  /* ---- "Try 3 more like this": same subtopic (gc_galvanic), same trap family (anode and cathode
     swapped, so the electron direction flips: gc-concept-swap with gc-direction). The cathode is put
     on the LEFT so the left-to-right habit is wrong every time. Keys come from the potentials. ---- */
  var FAMILY = 'gc-concept-swap', SUBTOPIC = 'gc_galvanic';
  // private-bank items with the same trap (wrong tags anode-cathode-swap, electron-flow-reversed,
  // electron-direction, an-ox-red-cat-swap, oxidation-at-cathode); served only once Thomas approves them
  var POOL_IDS = ['gc:gc-0289', 'gc:gc-0352', 'gc:gc-0357', 'gc:gc-0989'];
  function pairs(minGap) {
    var out = [];
    HALF.forEach(function (a) { HALF.forEach(function (b) { if (a.id < b.id && Math.abs(a.e - b.e) >= minGap) out.push([a.id, b.id]); }); });
    return out;
  }
  function half(h) { return h.ionT + '|' + h.id + ' (E° = ' + fmtE(h.e) + ' V)'; }
  function variant(type, aId, bId, seed) {
    var A = byId[aId], B = byId[bId], cat = A.e > B.e ? A : B, an = cat === A ? B : A;
    var c = cell(cat.id, an.id);      // cathode on the left
    var stem = 'A galvanic cell has a ' + half(c.L) + ' half-cell on the left and a ' + half(c.R) + ' half-cell on the right. ';
    var rows;
    if (type === 'flow') {
      stem += 'Which way do electrons flow through the wire?';
      rows = [
        ['From the ' + an.metal + ' electrode to the ' + cat.metal + ' electrode', null],
        ['From the ' + cat.metal + ' electrode to the ' + an.metal + ' electrode', 'Backwards. ' + cap(an.metal) + ' has the lower potential, so electrons start there.'],
        ['From left to right, because the left half-cell is the anode', 'Here the left half-cell is the cathode. Use the potentials, not the picture.'],
        ['Through the salt bridge, from the ' + an.metal + ' side to the ' + cat.metal + ' side', 'Electrons stay in the wire. Ions carry the charge through the salt bridge.'],
        ['No electrons flow, because E°cell is negative', 'Cathode minus anode is ' + fmtCell(c.ecell) + ' V. Positive, so it runs.']
      ];
    } else if (type === 'anode') {
      stem += 'Which electrode is the anode?';
      rows = [
        ['The ' + an.metal + ' electrode, because its reduction potential is lower', null],
        ['The ' + cat.metal + ' electrode, because its reduction potential is higher', 'Higher potential is reduced. That makes ' + cat.metal + ' the cathode.'],
        ['The electrode on the left, because electrons start on the left', 'The left one here is ' + cat.metal + ', the cathode. Position never decides it.'],
        ['The ' + cat.metal + ' electrode, because it gains mass as the cell runs', 'Gaining mass marks the cathode, where ions plate out. The anode loses mass.'],
        ['Neither; the salt bridge acts as the anode', 'The salt bridge only moves ions. One electrode is always the anode.']
      ];
    } else {
      stem += 'Which electrode gains mass as the cell runs?';
      rows = [
        ['The ' + cat.metal + ' electrode, because its ions are reduced to metal', null],
        ['The ' + an.metal + ' electrode, because it is oxidized', 'Oxidized metal goes into solution as ions. The anode loses mass.'],
        ['The electrode on the right, because electrons flow left to right', 'Electrons flow ' + an.metal + ' to ' + cat.metal + ' here: right to left. Check the potentials.'],
        ['Both electrodes gain the same mass', 'One side is oxidized and one is reduced. Only the cathode gains.'],
        ['Neither, because electrode mass never changes', 'Metal leaves the anode and plates onto the cathode. Mass moves.']
      ];
    }
    // seeded shuffle so the key letter moves
    var R = rngOf(seed), order = [0, 1, 2, 3, 4];
    for (var i = 4; i > 0; i--) { var j = Math.floor(R() * (i + 1)); var t = order[i]; order[i] = order[j]; order[j] = t; }
    var choices = order.map(function (k) { return rows[k][0]; }), traps = order.map(function (k) { return rows[k][1]; });
    return { id: 'gc:galvanic-more:' + type + ':' + an.id + '-' + cat.id, section: 'gchem', topic: 'electrochem-lab', topicName: 'Galvanic cells', skill: SUBTOPIC,
      trapFamily: FAMILY, difficulty: type === 'flow' ? 1 : 2, stem: stem, choices: choices, answer: order.indexOf(0), traps: traps,
      why: cap(cat.metal) + ' has the higher potential: cathode. ' + cap(an.metal) + ' is the anode.',
      steps: plainSteps(c), trick: TRICK.text, generated: true, key: { anode: an.id, cathode: cat.id, type: type } };
  }
  function rngOf(seed) { var a = (seed >>> 0) || 1; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var TYPES = ['flow', 'anode', 'mass'];
  /* generator(c, seed)(k): the k-th follow-up, never the pair just missed, never a pair closer than 0.1 V. */
  function generator(c, seed) {
    var R = rngOf(seed || 1), list = pairs(0.1).filter(function (p) { return !(p.indexOf(c.L.id) >= 0 && p.indexOf(c.R.id) >= 0); });
    for (var i = list.length - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)); var t = list[i]; list[i] = list[j]; list[j] = t; }
    return function (k) { var p = list[k % list.length]; return variant(TYPES[k % 3], p[0], p[1], (seed || 1) + k * 7919); };
  }

  var api = { HALF: HALF, byId: byId, fmtE: fmtE, fmtCell: fmtCell, cell: cell, steps: steps, explain: explain, board: board, checkItem: checkItem, explainCheck: explainCheck,
    variant: variant, generator: generator, pairs: pairs, TYPES: TYPES, FAMILY: FAMILY, SUBTOPIC: SUBTOPIC, POOL_IDS: POOL_IDS, TRICK: TRICK, TRICK_RULE: TRICK_RULE, SOURCES: SOURCES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GalvanicWalk = api;
})(typeof window !== 'undefined' ? window : this);
