/* guac-walk.js : GuacaMOLE (moles are the pit). The page's practice items, their miss walkthroughs and
   the "Try 3 more like this" variants. One source of truth for gc/guacamole/index.html, the tests and
   the verify run (every number recomputed: docs/walkthrough-verify.csv).

   ITEMS are the recording-kit page's own ladder, unchanged, plus one trap family per wrong choice:
     inverted   flipped the operation (multiplied where it should divide, or the reverse)    gc-inverted
     skip       skipped the pit (grams or liters straight to the answer)                     gc-units
     stop       stopped in the pit, or stopped one step early                                gc-partial
     exit       took the wrong exit (22.4 for grams, molar mass for particles ...)           gc-concept-swap
     atoms      atoms per molecule or a diatomic slip                                        gc-dropped-factor
     coeff      skipped or flipped the coefficients (the magic sauce)                        gc-dropped-factor
   Constants: molar volume 22.4 L/mol at 0 C and 1 atm; Avogadro 6.022 x 10^23 (SI 6.02214076 x 10^23).
   Explanations follow docs/EXPLANATION-STANDARD.md. */
(function (root) {
  'use strict';
  var NA = 6.022e23, VM = 22.4, X = '×', DIV = '÷';
  var ITEMS = [{"id": "E1", "level": "Easy", "tag": "gc_mole_concept", "stem": "How many moles are in 88.0 g of CO<sub>2</sub> (44.0 g/mol)?", "why": "Grams into the pit: divide by molar mass. 88.0 / 44.0 = 2.00 mol.", "ch": [{"t": "3872 mol", "ok": false, "err": "multiplied by molar mass", "go": "p1-board", "goname": "Trick board"}, {"t": "2.00 mol", "ok": true}, {"t": "0.500 mol", "ok": false, "err": "divided the wrong way (44.0 / 88.0)", "go": "p4-interactive", "goname": "Walk it through the pit"}, {"t": "3.93 mol", "ok": false, "err": "used 22.4 L/mol on grams", "go": "p2-whiteboard", "goname": "Whiteboard notes"}]}, {"id": "E2", "level": "Easy", "tag": "gc_mole_concept", "stem": "How many atoms are in 3.00 mol of helium?", "why": "Out of the pit to particles: multiply by 6.022 &times; 10<sup>23</sup>. 3.00 &times; 6.022 &times; 10<sup>23</sup> = 1.81 &times; 10<sup>24</sup>.", "ch": [{"t": "67.2 atoms", "ok": false, "err": "used the liters exit (22.4)", "go": "p1-board", "goname": "Trick board"}, {"t": "12.0 atoms", "ok": false, "err": "multiplied by molar mass (4.0) instead", "go": "p4-interactive", "goname": "Walk it through the pit"}, {"t": "1.81 &times; 10<sup>24</sup> atoms", "ok": true}, {"t": "4.98 &times; 10<sup>-24</sup> atoms", "ok": false, "err": "divided by Avogadro on the way out", "go": "p1-board", "goname": "Trick board"}]}, {"id": "E3", "level": "Easy", "tag": "gc_mole_concept", "stem": "What volume does 0.250 mol of a gas take up at STP?", "why": "Out of the pit to liters at STP: multiply by 22.4 L/mol. 0.250 &times; 22.4 = 5.60 L.", "ch": [{"t": "1.51 &times; 10<sup>23</sup> L", "ok": false, "err": "used the particles exit", "go": "p1-board", "goname": "Trick board"}, {"t": "5.60 L", "ok": true}, {"t": "0.0112 L", "ok": false, "err": "divided moles by 22.4", "go": "p1-board", "goname": "Trick board"}, {"t": "89.6 L", "ok": false, "err": "divided 22.4 by moles", "go": "p4-interactive", "goname": "Walk it through the pit"}]}, {"id": "E4", "level": "Easy", "tag": "gc_mole_concept", "stem": "How many moles are in 9.0 g of water (18.0 g/mol)?", "why": "Grams into the pit: 9.0 / 18.0 = 0.50 mol.", "ch": [{"t": "0.50 mol", "ok": true}, {"t": "0.40 mol", "ok": false, "err": "used 22.4 L/mol on grams", "go": "p2-whiteboard", "goname": "Whiteboard notes"}, {"t": "2.0 mol", "ok": false, "err": "divided the wrong way (18.0 / 9.0)", "go": "p4-interactive", "goname": "Walk it through the pit"}, {"t": "162 mol", "ok": false, "err": "multiplied by molar mass", "go": "p1-board", "goname": "Trick board"}]}, {"id": "E5", "level": "Easy", "tag": "gc_mole_concept", "stem": "You have grams of a gas and need liters at STP. What do you have to pass through on the way?", "why": "Everything goes through the pit. Grams to moles, then moles to liters.", "ch": [{"t": "Density", "ok": false, "err": "brought in a step the board never uses", "go": "p2-whiteboard", "goname": "Whiteboard notes"}, {"t": "Nothing: grams times 22.4 gives liters", "ok": false, "err": "took the shortcut across the flesh", "go": "p6-trap", "goname": "Trap card"}, {"t": "Particles", "ok": false, "err": "thought particles were the bridge", "go": "p1-board", "goname": "Trick board"}, {"t": "Moles", "ok": true}]}, {"id": "T1", "level": "Test level", "tag": "gc_mole_concept", "stem": "How many molecules are in 11.0 g of CO<sub>2</sub> (44.0 g/mol)?", "why": "11.0 / 44.0 = 0.250 mol, then 0.250 &times; 6.022 &times; 10<sup>23</sup> = 1.51 &times; 10<sup>23</sup>.", "ch": [{"t": "6.62 &times; 10<sup>24</sup>", "ok": false, "err": "skipped the pit: grams times Avogadro", "go": "p6-trap", "goname": "Trap card"}, {"t": "2.41 &times; 10<sup>24</sup>", "ok": false, "err": "divided the wrong way (44.0 / 11.0 = 4.00 mol)", "go": "p4-interactive", "goname": "Walk it through the pit"}, {"t": "5.60", "ok": false, "err": "used the liters exit (0.250 &times; 22.4)", "go": "p1-board", "goname": "Trick board"}, {"t": "1.51 &times; 10<sup>23</sup>", "ok": true}]}, {"id": "T2", "level": "Test level", "tag": "gc_mole_concept", "stem": "What is the mass of 5.60 L of O<sub>2</sub> at STP (32.0 g/mol)?", "why": "5.60 / 22.4 = 0.250 mol, then 0.250 &times; 32.0 = 8.00 g.", "ch": [{"t": "8.00 g", "ok": true}, {"t": "179 g", "ok": false, "err": "skipped the pit: liters times molar mass", "go": "p6-trap", "goname": "Trap card"}, {"t": "0.250 g", "ok": false, "err": "stopped in the pit and called moles grams", "go": "p5-idoyoudo", "goname": "I do, we do, you do"}, {"t": "4.00 g", "ok": false, "err": "used 16.0 for O<sub>2</sub> (forgot it is diatomic)", "go": "p2-whiteboard", "goname": "Whiteboard notes"}]}, {"id": "T3", "level": "Test level", "tag": "gc_mole_concept", "stem": "What is the mass of 1.204 &times; 10<sup>24</sup> molecules of CH<sub>4</sub> (16.0 g/mol)?", "why": "1.204 &times; 10<sup>24</sup> / 6.022 &times; 10<sup>23</sup> = 2.00 mol, then 2.00 &times; 16.0 = 32.0 g.", "ch": [{"t": "44.8 g", "ok": false, "err": "used the liters exit", "go": "p1-board", "goname": "Trick board"}, {"t": "32.0 g", "ok": true}, {"t": "8.00 g", "ok": false, "err": "divided by moles instead of multiplying (16.0 / 2.00)", "go": "p4-interactive", "goname": "Walk it through the pit"}, {"t": "2.00 g", "ok": false, "err": "stopped in the pit", "go": "p5-idoyoudo", "goname": "I do, we do, you do"}]}, {"id": "T4", "level": "Test level", "tag": "gc_mole_concept", "stem": "What volume do 3.011 &times; 10<sup>23</sup> molecules of N<sub>2</sub> take up at STP?", "why": "3.011 &times; 10<sup>23</sup> / 6.022 &times; 10<sup>23</sup> = 0.500 mol, then 0.500 &times; 22.4 = 11.2 L.", "ch": [{"t": "44.8 L", "ok": false, "err": "divided 22.4 by moles", "go": "p4-interactive", "goname": "Walk it through the pit"}, {"t": "11.2 L", "ok": true}, {"t": "6.74 &times; 10<sup>24</sup> L", "ok": false, "err": "skipped the pit: particles times 22.4", "go": "p6-trap", "goname": "Trap card"}, {"t": "14.0 L", "ok": false, "err": "used molar mass (28.0) as the exit", "go": "p1-board", "goname": "Trick board"}]}, {"id": "T5", "level": "Test level", "tag": "gc_mole_concept", "stem": "Which has more molecules: 16.0 g of CH<sub>4</sub> or 16.0 g of O<sub>2</sub>?", "why": "Same grams, different pits: CH<sub>4</sub> is 1.00 mol, O<sub>2</sub> is 0.500 mol. More moles, more molecules.", "ch": [{"t": "CH<sub>4</sub>, four times as many", "ok": false, "err": "squared the ratio", "go": "p4-interactive", "goname": "Walk it through the pit"}, {"t": "CH<sub>4</sub>, twice as many", "ok": true}, {"t": "O<sub>2</sub>, twice as many", "ok": false, "err": "compared molar masses, not moles", "go": "p1-board", "goname": "Trick board"}, {"t": "The same number", "ok": false, "err": "compared grams instead of going to the pit", "go": "p6-trap", "goname": "Trap card"}]}, {"id": "H1", "level": "Hard", "tag": "gc_mole_concept", "stem": "N<sub>2</sub> + 3 H<sub>2</sub> to 2 NH<sub>3</sub>. How many grams of NH<sub>3</sub> (17.0 g/mol) form from 6.0 g of H<sub>2</sub> (2.0 g/mol), with N<sub>2</sub> in excess?", "why": "6.0 / 2.0 = 3.0 mol H<sub>2</sub>. Coefficients: 3 H<sub>2</sub> make 2 NH<sub>3</sub>, so 2.0 mol NH<sub>3</sub>. 2.0 &times; 17.0 = 34 g.", "ch": [{"t": "51 g", "ok": false, "err": "skipped the coefficient step (3.0 mol H<sub>2</sub> = 3.0 mol NH<sub>3</sub>)", "go": "p2-whiteboard", "goname": "Whiteboard notes"}, {"t": "34 g", "ok": true}, {"t": "6.0 g", "ok": false, "err": "carried grams straight across", "go": "p6-trap", "goname": "Trap card"}, {"t": "76.5 g", "ok": false, "err": "flipped the coefficient ratio (3/2 instead of 2/3)", "go": "p2-whiteboard", "goname": "Whiteboard notes"}]}, {"id": "H2", "level": "Hard", "tag": "gc_mole_concept", "stem": "How many oxygen atoms are in 22.0 g of CO<sub>2</sub>?", "why": "22.0 / 44.0 = 0.500 mol CO<sub>2</sub>, which holds 1.00 mol O atoms. 1.00 &times; 6.022 &times; 10<sup>23</sup> = 6.02 &times; 10<sup>23</sup>.", "ch": [{"t": "6.02 &times; 10<sup>23</sup>", "ok": true}, {"t": "9.03 &times; 10<sup>23</sup>", "ok": false, "err": "counted all 3 atoms in CO<sub>2</sub>", "go": "p1-board", "goname": "Trick board"}, {"t": "1.32 &times; 10<sup>25</sup>", "ok": false, "err": "skipped the pit: grams times Avogadro", "go": "p6-trap", "goname": "Trap card"}, {"t": "3.01 &times; 10<sup>23</sup>", "ok": false, "err": "counted molecules, not O atoms (each CO<sub>2</sub> has 2)", "go": "p1-board", "goname": "Trick board"}]}, {"id": "H3", "level": "Hard", "tag": "gc_mole_concept", "stem": "A gas sample at STP fills 4.48 L and has a mass of 8.80 g. What is its molar mass?", "why": "4.48 / 22.4 = 0.200 mol. Molar mass = grams per mole = 8.80 / 0.200 = 44.0 g/mol (that fits CO<sub>2</sub>).", "ch": [{"t": "1.96 g/mol", "ok": false, "err": "divided grams by liters (skipped the pit)", "go": "p6-trap", "goname": "Trap card"}, {"t": "0.0227 g/mol", "ok": false, "err": "divided moles by grams", "go": "p4-interactive", "goname": "Walk it through the pit"}, {"t": "39.4 g/mol", "ok": false, "err": "multiplied grams by liters", "go": "p6-trap", "goname": "Trap card"}, {"t": "44.0 g/mol", "ok": true}]}, {"id": "M1", "level": "Mixed", "tag": "gc_limiting_reagent", "stem": "2 H<sub>2</sub> + O<sub>2</sub> to 2 H<sub>2</sub>O. You start with 4.0 g H<sub>2</sub> (2.0 g/mol) and 16.0 g O<sub>2</sub> (32.0 g/mol). How many grams of water (18.0 g/mol) can form?", "why": "Run both lanes to the pit. H<sub>2</sub>: 2.0 mol, gives 2.0 mol water. O<sub>2</sub>: 0.50 mol, gives 1.0 mol water. Smaller wins: 1.0 mol &times; 18.0 = 18 g.", "ch": [{"t": "9.0 g", "ok": false, "err": "used the O<sub>2</sub> lane without the coefficient step", "go": "p2-whiteboard", "goname": "Whiteboard notes"}, {"t": "18 g", "ok": true}, {"t": "20 g", "ok": false, "err": "added the reactant masses", "go": "p6-trap", "goname": "Trap card"}, {"t": "36 g", "ok": false, "err": "ran only the H<sub>2</sub> lane (H<sub>2</sub> is not limiting)", "go": "p2-whiteboard", "goname": "Whiteboard notes"}]}, {"id": "M2", "level": "Mixed", "tag": "gc_ideal_gas", "stem": "A balloon holds 0.500 mol of gas at STP. You add 11.0 g of CO<sub>2</sub> (44.0 g/mol) and bring it back to STP. What is the new volume?", "why": "Get everything into the pit first: 11.0 / 44.0 = 0.250 mol. Total 0.750 mol &times; 22.4 = 16.8 L.", "ch": [{"t": "16.8 L", "ok": true}, {"t": "258 L", "ok": false, "err": "added grams to moles (0.500 + 11.0)", "go": "p6-trap", "goname": "Trap card"}, {"t": "11.2 L", "ok": false, "err": "forgot to add the new gas", "go": "p4-interactive", "goname": "Walk it through the pit"}, {"t": "5.60 L", "ok": false, "err": "counted only the CO<sub>2</sub>", "go": "p1-board", "goname": "Trick board"}]}];
  var CARDS = [["Grams to moles: multiply or divide by molar mass?", "Divide. Moles back to grams: multiply."], ["One mole of anything is how many particles?", "6.022 x 10^23 (Avogadro's number)."], ["One mole of gas at STP takes up how much space? What is STP?", "22.4 L. STP is 0 C (273 K) and 1 atm."], ["What do grams, particles and liters all have to pass through?", "Moles, the pit. No flesh-to-flesh shortcut."], ["22.0 g of CO2 is how many moles?", "0.500 mol (22.0 / 44.0)."]];
  var TRICK = { text: "Moles are king. We always want to get to moles, it's so crucial", src: 'Zoom 2026-09-03 #85955264465 ~0:45:01' };
  var SOURCES = ['GuacaMOLE trick board and the Gen Chem crash-course whiteboard, on this page.',
    'Molar volume 22.4 L/mol at 0 °C and 1 atm. Avogadro 6.022 × 10^23 (SI: 6.02214076 × 10^23).',
    "Thomas's line: Zoom 2026-09-03 #85955264465 ~0:45:01."];
  var FAMILIES = {
    inverted: { bank: 'gc-inverted', name: 'Flipped the operation', fix: 'Into the pit you divide; out of the pit you multiply.' },
    skip: { bank: 'gc-units', name: 'Skipped the pit', fix: 'Go into the pit first: two arrows, never one.' },
    stop: { bank: 'gc-partial', name: 'Stopped too early', fix: 'Moles are halfway, so take the exit they asked for.' },
    exit: { bank: 'gc-concept-swap', name: 'Wrong exit', fix: 'Grams use molar mass, particles 6.022 × 10^{23}, liters 22.4.' },
    atoms: { bank: 'gc-dropped-factor', name: 'Atom count slip', fix: 'Count atoms per molecule before the last step.' },
    coeff: { bank: 'gc-dropped-factor', name: 'Coefficient slip', fix: 'Use the coefficients between the two moles.' }
  };
  // private-bank items with the same trap (by their wrong-choice tags); served only once Thomas approves them
  var POOL_IDS = {
    inverted: ['gc:gc-0001', 'gc:gc-0009', 'gc:gc-0010', 'gc:gc-0430'],
    skip: ['gc:gc-0013', 'gc:gc-0444', 'gc:gc-0736'],
    stop: ['gc:gc-0018', 'gc:gc-0433', 'gc:gc-0438'],
    exit: ['gc:gc-0736'],
    atoms: ['gc:gc-0002', 'gc:gc-0012', 'gc:gc-0742'],
    coeff: ['gc:gc-0735', 'gc:gc-0740']
  };

  /* number formatting: 3 significant figures (sf 2 where the item uses 2), x 10^n past 1000 or under 0.01 */
  function fmt(x, sf) {
    sf = sf || 3; if (!isFinite(x)) return '?'; if (x === 0) return '0';
    var e = Math.floor(Math.log10(Math.abs(x)));
    if (e >= -2 && e <= 3) return x.toFixed(Math.max(0, sf - 1 - e));
    var m = x / Math.pow(10, e); m = Math.round(m * Math.pow(10, sf - 1)) / Math.pow(10, sf - 1); if (m >= 10) { m /= 10; e++; }
    return m.toFixed(sf - 1) + ' ' + X + ' 10^{' + e + '}';
  }
  function fM(M) { return M.toFixed(1); }
  /* the page's HTML choice text, as walkthrough marks (x_2, 10^{23}) */
  function mark(html) { return String(html).replace(/&times;/g, X).replace(/<sup>([^<]*)<\/sup>/g, '^{$1}').replace(/<sub>([^<]*)<\/sub>/g, '_{$1}').replace(/<[^>]+>/g, ''); }

  /* ---- the avocado board: 600 x 790, drawn in code ---- */
  var ST = { g: [130, 120], p: [470, 120], L: [300, 478] };
  var SPOKE = { g: [[178, 152], [238, 214]], p: [[422, 152], [362, 214]], L: [[300, 446], [300, 368]] };
  var FACT = { g: function (M) { return fM(M); }, p: function () { return '6.022 ' + X + ' 10^{23}'; }, L: function () { return '22.4'; } };
  var LINE_Y = [600, 648, 696, 744];
  function base() {
    return [
      { k: 'ellipse', cx: 300, cy: 282, rx: 272, ry: 242, c: 'green', sw: 5, fill: 'green' },
      { k: 'circle', cx: 300, cy: 282, r: 84, c: 'gold', sw: 5, fill: 'gold' },
      { k: 'text', x: 300, y: 296, t: 'MOLES', s: 38, c: 'forest', f: 'mark', a: 'middle' },
      { k: 'text', x: ST.g[0], y: ST.g[1] + 10, t: 'grams', s: 34, c: 'forest', a: 'middle' },
      { k: 'text', x: ST.p[0], y: ST.p[1] + 10, t: 'particles', s: 34, c: 'forest', a: 'middle' },
      { k: 'text', x: ST.L[0], y: ST.L[1] + 10, t: 'liters (STP)', s: 34, c: 'forest', a: 'middle' },
      { k: 'line', x1: SPOKE.g[0][0], y1: SPOKE.g[0][1], x2: SPOKE.g[1][0], y2: SPOKE.g[1][1], c: 'muted', sw: 3, dash: '6 8' },
      { k: 'line', x1: SPOKE.p[0][0], y1: SPOKE.p[0][1], x2: SPOKE.p[1][0], y2: SPOKE.p[1][1], c: 'muted', sw: 3, dash: '6 8' },
      { k: 'line', x1: SPOKE.L[0][0], y1: SPOKE.L[0][1], x2: SPOKE.L[1][0], y2: SPOKE.L[1][1], c: 'muted', sw: 3, dash: '6 8' },
      { k: 'text', x: 118, y: 222, t: 'molar mass', s: 28, c: 'muted', a: 'middle' },
      { k: 'text', x: 486, y: 222, t: '6.022 ' + X + ' 10^{23}', s: 28, c: 'muted', a: 'middle' },
      { k: 'text', x: 318, y: 418, t: '22.4 L/mol', s: 28, c: 'muted' }
    ];
  }
  function off(seg, d) { var dx = seg[1][0] - seg[0][0], dy = seg[1][1] - seg[0][1], L = Math.sqrt(dx * dx + dy * dy); return [[seg[0][0] - dy / L * d, seg[0][1] + dx / L * d], [seg[1][0] - dy / L * d, seg[1][1] + dx / L * d]]; }
  function arrowIn(st, label) { var s = off(SPOKE[st], -14); return [{ k: 'line', x1: s[0][0], y1: s[0][1], x2: s[1][0], y2: s[1][1], c: 'blue', sw: 6, arrow: 'end' }, labelAt(st, label, 'blue')]; }
  function arrowOut(st, label) { var s = off(SPOKE[st], 14); return [{ k: 'line', x1: s[1][0], y1: s[1][1], x2: s[0][0], y2: s[0][1], c: 'gold', sw: 6, arrow: 'end' }, labelAt(st, label, 'gold')]; }
  function labelAt(st, label, c) {
    var pos = { g: [150, 268, 'middle'], p: [450, 268, 'middle'], L: [282, 418, 'end'] }[st];
    return { k: 'text', x: pos[0], y: pos[1], t: label, s: 30, c: c, a: pos[2] };
  }
  function ring(st, c) { var p = ST[st]; return { k: 'ellipse', cx: p[0], cy: p[1], rx: st === 'L' ? 110 : 88, ry: 34, c: c || 'blue', sw: 5 }; }
  function write(i, t, c) { return { k: 'text', x: 300, y: LINE_Y[i], t: t, s: 32, c: c || 'ink', a: 'middle' }; }
  var ARC = { 'g-g': 'M96,92 L70,44 L196,44 L168,92', 'g-p': 'M180,100 L300,58 L420,100', 'g-L': 'M92,160 L104,350 L230,470', 'p-L': 'M508,160 L496,350 L370,470' };
  /* the red road the pick took */
  function redRoad(fam, info, pickText, line) {
    var ops = [], key, m;
    if (fam === 'skip' && info) {
      key = [info[0], info[1]].sort(function (a, b) { return 'gpL'.indexOf(a) - 'gpL'.indexOf(b); }).join('-');
      ops.push({ k: 'path', d: ARC[key], c: 'red', sw: 6 });
      m = { 'g-g': [133, 44], 'g-p': [300, 58], 'g-L': [104, 350], 'p-L': [496, 350] }[key];
      ops.push({ k: 'cross', x: m[0], y: m[1], r: 18, c: 'red', sw: 6 });
    } else if (fam === 'inverted' && info) {
      var s = off(SPOKE[info[0]], info[1] === 'out' ? 14 : -14);
      ops.push({ k: 'line', x1: s[1][0], y1: s[1][1], x2: s[0][0], y2: s[0][1], c: 'red', sw: 6, arrow: 'end' });
      ops.push({ k: 'cross', x: (s[0][0] + s[1][0]) / 2, y: (s[0][1] + s[1][1]) / 2, r: 15, c: 'red', sw: 5 });
    } else if (fam === 'exit' && info) {
      var e = off(SPOKE[info[0]], 26);
      ops.push({ k: 'line', x1: e[1][0], y1: e[1][1], x2: e[0][0], y2: e[0][1], c: 'red', sw: 6, arrow: 'end' });
      ops.push(ring(info[0], 'red'));
    } else if (fam === 'stop') {
      ops.push({ k: 'circle', cx: 300, cy: 282, r: 102, c: 'red', sw: 5 });
    } else {
      ops.push({ k: 'circle', cx: 300, cy: 282, r: 102, c: 'red', sw: 4 });
    }
    var y = LINE_Y[Math.min(line, 3)];
    ops.push({ k: 'text', x: 300, y: y, t: 'your pick: ' + pickText, s: 32, c: 'red', a: 'middle' });
    ops.push({ k: 'line', x1: 150, y1: y - 10, x2: 450, y2: y - 10, c: 'red', sw: 4 });
    return ops;
  }

  /* ---- per-item walk specs. ch[i] = [family, info] for each wrong choice (null at the key). ---- */
  var UNIT = { g: 'g', p: 'particles', L: 'L', mol: 'mol' };
  var SPEC = {
    E1: { kind: 'conv', sub: 'CO_2', M: 44.0, amt: 88.0, from: 'g', to: 'mol', ch: [['inverted', ['g', 'in']], null, ['inverted', ['g', 'in']], ['exit', ['L']]] },
    E2: { kind: 'conv', sub: 'He', M: 4.0, amt: 3.00, from: 'mol', to: 'p', unit: 'atoms', ch: [['exit', ['L']], ['exit', ['g']], null, ['inverted', ['p', 'out']]] },
    E3: { kind: 'conv', sub: 'gas', amt: 0.250, from: 'mol', to: 'L', ch: [['exit', ['p']], null, ['inverted', ['L', 'out']], ['inverted', ['L', 'out']]] },
    E4: { kind: 'conv', sub: 'H_2O', M: 18.0, amt: 9.0, from: 'g', to: 'mol', sf: 2, ch: [null, ['exit', ['L']], ['inverted', ['g', 'in']], ['inverted', ['g', 'in']]] },
    T1: { kind: 'conv', sub: 'CO_2', M: 44.0, amt: 11.0, from: 'g', to: 'p', unit: 'molecules', ch: [['skip', ['g', 'p']], ['inverted', ['g', 'in']], ['exit', ['L']], null] },
    T2: { kind: 'conv', sub: 'O_2', M: 32.0, amt: 5.60, from: 'L', to: 'g', ch: [null, ['skip', ['L', 'g']], ['stop', null], ['atoms', null]] },
    T3: { kind: 'conv', sub: 'CH_4', M: 16.0, amt: 1.204e24, from: 'p', to: 'g', unit: 'g', ch: [['exit', ['L']], null, ['inverted', ['g', 'out']], ['stop', null]] },
    T4: { kind: 'conv', sub: 'N_2', M: 28.0, amt: 3.011e23, from: 'p', to: 'L', ch: [['inverted', ['L', 'out']], null, ['skip', ['p', 'L']], ['exit', ['g']]] },
    E5: { kind: 'e5', ch: [['exit', ['g']], ['skip', ['g', 'L']], ['exit', ['p']], null] },
    T5: { kind: 't5', ch: [['inverted', null], null, ['exit', ['g']], ['skip', ['g', 'p']]] },
    H1: { kind: 'h1', ch: [['coeff', null], null, ['skip', ['g', 'g']], ['coeff', null]] },
    H2: { kind: 'h2', ch: [null, ['atoms', null], ['skip', ['g', 'p']], ['atoms', null]] },
    H3: { kind: 'h3', ch: [['skip', ['g', 'L']], ['inverted', ['L', 'in']], ['skip', ['g', 'L']], null] },
    M1: { kind: 'm1', ch: [['coeff', null], null, ['skip', ['g', 'g']], ['coeff', null]] },
    M2: { kind: 'm2', ch: [null, ['skip', ['g', 'L']], ['stop', null], ['stop', null]] }
  };
  function item(id) { for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].id === id) return ITEMS[i]; return null; }
  function keyIndex(it) { for (var i = 0; i < it.ch.length; i++) if (it.ch[i].ok) return i; return -1; }

  function amtText(sp) { var u = sp.from === 'p' ? 'particles' : UNIT[sp.from]; return fmt(sp.amt, sp.sf) + ' ' + u + (sp.sub === 'gas' ? ' of gas' : ' ' + sp.sub); }
  /* steps + frames for one item; numbers computed here, from the item's own givens */
  function solve(it) {
    var sp = SPEC[it.id], st = [], fr = [], ans, n;
    if (sp.kind === 'conv') {
      var sf = sp.sf || 3, mol = sp.from === 'g' ? sp.amt / sp.M : sp.from === 'p' ? sp.amt / NA : sp.from === 'L' ? sp.amt / VM : sp.amt;
      if (sp.from === 'mol') { st.push('Start in the pit: **' + fmt(sp.amt, sf) + ' mol** ' + (sp.sub === 'gas' ? 'of gas' : sp.sub) + '.'); fr.push([{ k: 'circle', cx: 300, cy: 282, r: 102, c: 'blue', sw: 5 }, write(0, fmt(sp.amt, sf) + ' mol')]); }
      else {
        st.push('Start with what they give you: **' + amtText(sp) + '**.');
        fr.push([ring(sp.from), write(0, amtText(sp))]);
        var fx = FACT[sp.from](sp.M);
        st.push('**Into the pit**: ' + fmt(sp.amt, sf) + ' ' + DIV + ' ' + fx + ' = ' + fmt(mol, sf) + ' mol.');
        fr.push(arrowIn(sp.from, DIV + ' ' + (sp.from === 'g' ? fM(sp.M) : sp.from === 'L' ? '22.4' : 'N_A')).concat([write(1, fmt(sp.amt, sf) + ' ' + DIV + ' ' + fx + ' = ' + fmt(mol, sf) + ' mol')]));
      }
      if (sp.to === 'mol') {
        st.push('**Stop** in the pit: they asked for moles.');
        fr.push([{ k: 'circle', cx: 300, cy: 282, r: 102, c: 'gold', sw: 5 }, write(2, 'answer: ' + fmt(mol, sf) + ' mol', 'forest')]);
        ans = fmt(mol, sf) + ' mol';
      } else {
        var out = sp.to === 'g' ? mol * sp.M : sp.to === 'p' ? mol * NA : mol * VM, fo = FACT[sp.to](sp.M);
        var u = sp.to === 'p' ? (sp.unit || 'particles') : UNIT[sp.to];
        st.push('**Out of the pit**: ' + fmt(mol, sf) + ' ' + X + ' ' + fo + ' = ' + fmt(out, sf) + ' ' + u + '.');
        fr.push(arrowOut(sp.to, X + ' ' + (sp.to === 'g' ? fM(sp.M) : sp.to === 'L' ? '22.4' : 'N_A')).concat([write(2, fmt(mol, sf) + ' ' + X + ' ' + fo + ' = ' + fmt(out, sf), 'forest')]));
        ans = fmt(out, sf) + ' ' + u;
      }
      return { steps: st, frames: fr, answer: amtText(sp) + ' is ' + ans + '.', line: sp.from === 'mol' ? 2 : 3 };
    }
    if (sp.kind === 'e5') {
      st = ['Start in **grams** of the gas.', '**Into the pit**: divide by the molar mass.', '**Out of the pit**: multiply the moles by 22.4 L/mol.'];
      fr = [[ring('g'), write(0, 'grams')], arrowIn('g', DIV + ' molar mass').concat([write(1, 'grams ' + DIV + ' molar mass = mol')]), arrowOut('L', X + ' 22.4').concat([write(2, 'mol ' + X + ' 22.4 = liters', 'forest')])];
      return { steps: st, frames: fr, answer: 'Moles. Grams go into the pit, then out to liters.', line: 3 };
    }
    if (sp.kind === 't5') {
      var a = 16.0 / 16.0, b = 16.0 / 32.0, r = a / b;
      st = ['Same grams, so **go to the pit** for each one.', 'CH_4: 16.0 ' + DIV + ' 16.0 = ' + fmt(a) + ' mol.', 'O_2: 16.0 ' + DIV + ' 32.0 = ' + fmt(b) + ' mol.', '**More moles**, more molecules: CH_4 has ' + (r === 2 ? 'twice as many' : r + ' times as many') + '.'];
      fr = [[ring('g'), write(0, '16.0 g CH_4   vs   16.0 g O_2')], arrowIn('g', DIV + ' 16.0').concat([write(1, 'CH_4: 16.0 ' + DIV + ' 16.0 = ' + fmt(a) + ' mol')]), [write(2, 'O_2: 16.0 ' + DIV + ' 32.0 = ' + fmt(b) + ' mol')], [{ k: 'circle', cx: 300, cy: 282, r: 102, c: 'gold', sw: 5 }, write(3, 'CH_4 : O_2 = ' + r + ' : 1', 'forest')]];
      return { steps: st, frames: fr, answer: 'CH_4 has twice as many molecules: ' + fmt(a) + ' mol against ' + fmt(b) + ' mol.', line: 3 };
    }
    if (sp.kind === 'h1') {
      var mh = 6.0 / 2.0, mn = mh * 2 / 3, g1 = mn * 17.0;
      st = ['Into the pit: 6.0 ' + DIV + ' 2.0 = **' + fmt(mh, 2) + ' mol** H_2.', '**Magic sauce** (coefficients): ' + fmt(mh, 2) + ' ' + X + ' 2/3 = ' + fmt(mn, 2) + ' mol NH_3.', 'Out of the pit: ' + fmt(mn, 2) + ' ' + X + ' 17.0 = **' + fmt(g1, 2) + ' g** NH_3.'];
      fr = [arrowIn('g', DIV + ' 2.0').concat([ring('g'), write(0, '6.0 ' + DIV + ' 2.0 = ' + fmt(mh, 2) + ' mol H_2')]), [{ k: 'circle', cx: 300, cy: 282, r: 102, c: 'blue', sw: 5 }, write(1, fmt(mh, 2) + ' ' + X + ' 2/3 = ' + fmt(mn, 2) + ' mol NH_3')], arrowOut('g', X + ' 17.0').concat([write(2, fmt(mn, 2) + ' ' + X + ' 17.0 = ' + fmt(g1, 2) + ' g', 'forest')])];
      return { steps: st, frames: fr, answer: '6.0 g of H_2 makes ' + fmt(g1, 2) + ' g of NH_3.', line: 3 };
    }
    if (sp.kind === 'h2') {
      var mc = 22.0 / 44.0, mo = mc * 2, at = mo * NA;
      st = ['Into the pit: 22.0 ' + DIV + ' 44.0 = **' + fmt(mc) + ' mol** CO_2.', 'Each CO_2 holds **2 O atoms**: ' + fmt(mo) + ' mol O.', 'Out of the pit: ' + fmt(mo) + ' ' + X + ' 6.022 ' + X + ' 10^{23} = ' + fmt(at) + '.'];
      fr = [arrowIn('g', DIV + ' 44.0').concat([ring('g'), write(0, '22.0 ' + DIV + ' 44.0 = ' + fmt(mc) + ' mol CO_2')]), [write(1, fmt(mc) + ' ' + X + ' 2 = ' + fmt(mo) + ' mol O')], arrowOut('p', X + ' N_A').concat([write(2, fmt(mo) + ' ' + X + ' 6.022 ' + X + ' 10^{23} = ' + fmt(at), 'forest')])];
      return { steps: st, frames: fr, answer: '22.0 g of CO_2 holds ' + fmt(at) + ' O atoms.', line: 3 };
    }
    if (sp.kind === 'h3') {
      n = 4.48 / VM; var mm = 8.80 / n;
      st = ['Liters into the pit: 4.48 ' + DIV + ' 22.4 = **' + fmt(n) + ' mol**.', '**Molar mass** is grams per mole: 8.80 ' + DIV + ' ' + fmt(n) + '.', 'That is ' + fmt(mm) + ' g/mol, which fits CO_2.'];
      fr = [arrowIn('L', DIV + ' 22.4').concat([ring('L'), write(0, '4.48 ' + DIV + ' 22.4 = ' + fmt(n) + ' mol')]), [ring('g'), write(1, '8.80 g ' + DIV + ' ' + fmt(n) + ' mol')], [write(2, '= ' + fmt(mm) + ' g/mol', 'forest')]];
      return { steps: st, frames: fr, answer: 'The molar mass is ' + fmt(mm) + ' g/mol.', line: 3 };
    }
    if (sp.kind === 'm1') {
      var h = 4.0 / 2.0, wh = h * 2 / 2, o = 16.0 / 32.0, wo = o * 2, w = Math.min(wh, wo) * 18.0;
      st = ['H_2 lane: 4.0 ' + DIV + ' 2.0 = ' + fmt(h, 2) + ' mol, makes ' + fmt(wh, 2) + ' mol water.', 'O_2 lane: 16.0 ' + DIV + ' 32.0 = ' + fmt(o, 2) + ' mol, makes ' + fmt(wo, 2) + ' mol water.', '**Smaller wins**: ' + fmt(Math.min(wh, wo), 2) + ' ' + X + ' 18.0 = ' + fmt(w, 2) + ' g water.'];
      fr = [arrowIn('g', DIV + ' 2.0').concat([write(0, 'H_2: ' + fmt(h, 2) + ' mol, ' + fmt(wh, 2) + ' mol water')]), [write(1, 'O_2: ' + fmt(o, 2) + ' mol, ' + fmt(wo, 2) + ' mol water')], arrowOut('g', X + ' 18.0').concat([write(2, fmt(Math.min(wh, wo), 2) + ' ' + X + ' 18.0 = ' + fmt(w, 2) + ' g', 'forest')])];
      return { steps: st, frames: fr, answer: 'O_2 runs out first, so ' + fmt(w, 2) + ' g of water forms.', line: 3 };
    }
    if (sp.kind === 'm2') {
      var nc = 11.0 / 44.0, tot = 0.500 + nc, v = tot * VM;
      st = ['New gas into the pit: 11.0 ' + DIV + ' 44.0 = ' + fmt(nc) + ' mol.', '**Add moles**: 0.500 + ' + fmt(nc) + ' = ' + fmt(tot) + ' mol.', 'Out of the pit: ' + fmt(tot) + ' ' + X + ' 22.4 = ' + fmt(v) + ' L.'];
      fr = [arrowIn('g', DIV + ' 44.0').concat([write(0, '11.0 ' + DIV + ' 44.0 = ' + fmt(nc) + ' mol')]), [{ k: 'circle', cx: 300, cy: 282, r: 102, c: 'blue', sw: 5 }, write(1, '0.500 + ' + fmt(nc) + ' = ' + fmt(tot) + ' mol')], arrowOut('L', X + ' 22.4').concat([write(2, fmt(tot) + ' ' + X + ' 22.4 = ' + fmt(v) + ' L', 'forest')])];
      return { steps: st, frames: fr, answer: 'The balloon now holds ' + fmt(v) + ' L.', line: 3 };
    }
    return null;
  }
  var CHECKS = [
    { q: 'How many moles are in 32.0 g of O_2?', a: '1.00 mol: 32.0 ' + DIV + ' 32.0.' },
    { q: 'How many liters does 2.00 mol of gas fill at STP?', a: '44.8 L: 2.00 ' + X + ' 22.4.' },
    { q: 'How many grams are 0.500 mol of H_2O?', a: '9.00 g: 0.500 ' + X + ' 18.0.' }
  ];
  function trapText(it, i) {
    var c = it.ch[i]; if (!c || c.ok) return null;
    var f = SPEC[it.id].ch[i][0];
    return 'Your pick, ' + mark(c.t) + ', ' + mark(c.err) + '. ' + FAMILIES[f].fix;
  }
  /* The walkthrough for a miss on item id with choice picked (0-3). */
  function explain(id, picked) {
    var it = item(id), s = solve(it), traps = {};
    it.ch.forEach(function (c, i) { traps[i] = c.ok ? null : trapText(it, i); });
    var steps = s.steps.map(function (t, i) { return { text: t, frame: i + 1 }; });
    var frames = s.frames.slice();
    if (picked != null && !it.ch[picked].ok) {
      var spc = SPEC[id].ch[picked];
      steps.push({ text: 'Your pick, **' + mark(it.ch[picked].t) + '**, took the red road.', frame: frames.length + 1 });
      frames.push(redRoad(spc[0], spc[1], mark(it.ch[picked].t), s.line));
    }
    var k = ITEMS.indexOf(it) % CHECKS.length;
    return { explain: { answer: s.answer, trick: TRICK, steps: steps, traps: traps, check: CHECKS[k], sources: SOURCES },
      board: { w: 600, h: 790, label: 'GuacaMOLE board: grams, particles and liters around the moles pit', base: base(), frames: frames },
      family: picked != null && SPEC[id].ch[picked] ? SPEC[id].ch[picked][0] : null };
  }

  /* ---- "Try 3 more like this": 5-choice variants, one trap family, keys computed here ---- */
  var SUBS = [{ f: 'CO_2', M: 44.0 }, { f: 'H_2O', M: 18.0 }, { f: 'O_2', M: 32.0 }, { f: 'N_2', M: 28.0 }, { f: 'NH_3', M: 17.0 }, { f: 'CH_4', M: 16.0 }];
  var MOLS = [0.250, 0.500, 1.50, 2.00, 3.00];
  var ATOMS = [{ f: 'CO_2', M: 44.0, el: 'O', k: 2, t: 3 }, { f: 'H_2O', M: 18.0, el: 'H', k: 2, t: 3 }, { f: 'NH_3', M: 17.0, el: 'H', k: 3, t: 4 }, { f: 'CH_4', M: 16.0, el: 'H', k: 4, t: 5 }];
  var RXN = [
    { eq: 'N_2 + 3 H_2 → 2 NH_3', A: 'H_2', MA: 2.0, B: 'NH_3', MB: 17.0, r: 2 / 3, rt: '2/3' },
    { eq: '2 H_2 + O_2 → 2 H_2O', A: 'O_2', MA: 32.0, B: 'H_2O', MB: 18.0, r: 2, rt: '2/1' },
    { eq: 'CH_4 + 2 O_2 → CO_2 + 2 H_2O', A: 'CH_4', MA: 16.0, B: 'H_2O', MB: 18.0, r: 2, rt: '2/1' },
    { eq: 'N_2 + 3 H_2 → 2 NH_3', A: 'N_2', MA: 28.0, B: 'NH_3', MB: 17.0, r: 2, rt: '2/1' }
  ];
  var COEFF_MOLS = [0.500, 1.50, 3.00];
  function html(m) { return m; }   // AceQuestion renders text: marks stay readable (CO_2 reads as CO2 below)
  var SUP = { '0': '\u2070', '1': '\u00B9', '2': '\u00B2', '3': '\u00B3', '4': '\u2074', '5': '\u2075', '6': '\u2076', '7': '\u2077', '8': '\u2078', '9': '\u2079', '-': '\u207B' };
  /* marks to plain text for the question component: CO_2 to CO2, 10^{23} to superscript digits, x and / to the signs */
  function txt(m) {
    return String(m).replace(/_\{?([0-9]+)\}?/g, '$1').replace(/\^\{?(-?[0-9]+)\}?/g, function (_, d) { return d.split('').map(function (ch) { return SUP[ch] || ch; }).join(''); })
      .replace(/ x /g, ' ' + X + ' ').replace(/ \/ /g, ' ' + DIV + ' ');
  }
  /* variant(fam, a, b): a indexes the substance (or reaction), b the mole amount. Returns null when two
     choices would print the same. */
  function variant(fam, a, b) {
    var rows, stem, why, steps, id = 'gc:guac-more:' + fam + ':' + a + '-' + b;
    if (fam === 'atoms') {
      var A = ATOMS[a], n = MOLS[b], g = n * A.M;
      stem = 'How many ' + A.el + ' atoms are in ' + fmt(g) + ' g of ' + A.f + ' (' + fM(A.M) + ' g/mol)?';
      rows = [[n * A.k * NA, null], [n * NA, 'That counts molecules. Each ' + A.f + ' has ' + A.k + ' ' + A.el + ' atoms.'], [n * A.t * NA, 'That counts every atom. Count only the ' + A.el + ' atoms.'],
        [g * A.k * NA, 'You skipped the pit: grams times Avogadro.'], [n * A.k, 'You stopped in the pit. Multiply by 6.022 ' + X + ' 10^23.']];
      rows = rows.map(function (r) { return [fmt(r[0]) + ' atoms', r[1], r[0]]; });
      why = fmt(g) + ' ' + DIV + ' ' + fM(A.M) + ' = ' + fmt(n) + ' mol, ' + X + ' ' + A.k + ' ' + X + ' 6.022 ' + X + ' 10^23.';
      steps = ['Into the pit: ' + fmt(g) + ' / ' + fM(A.M) + ' = ' + fmt(n) + ' mol.', 'Atoms per molecule: ' + fmt(n) + ' x ' + A.k + ' = ' + fmt(n * A.k) + ' mol ' + A.el + '.', 'Out of the pit: x 6.022 x 10^23 = ' + fmt(n * A.k * NA) + '.'];
    } else if (fam === 'coeff') {
      var R = RXN[a], nA = COEFF_MOLS[b], gA = nA * R.MA, nB = nA * R.r;
      stem = R.eq + '. How many grams of ' + R.B + ' (' + fM(R.MB) + ' g/mol) form from ' + fmt(gA) + ' g of ' + R.A + ' (' + fM(R.MA) + ' g/mol), the other reactant in excess?';
      rows = [[nB * R.MB, null], [nA * R.MB, 'You skipped the coefficients. Use ' + R.rt + ' between the two moles.'], [nA / R.r * R.MB, 'You flipped the coefficient ratio. Wanted over given: ' + R.rt + '.'],
        [gA, 'You carried grams straight across. Grams only change through the pit.'], [nB, 'You stopped at moles of ' + txt(R.B) + '. Multiply by its molar mass.']];
      rows = rows.map(function (r) { return [fmt(r[0]) + ' g', r[1], r[0]]; });
      why = fmt(gA) + ' / ' + fM(R.MA) + ' = ' + fmt(nA) + ' mol, x ' + R.rt + ' = ' + fmt(nB) + ' mol, x ' + fM(R.MB) + ' g/mol.';
      steps = ['Into the pit: ' + fmt(gA) + ' / ' + fM(R.MA) + ' = ' + fmt(nA) + ' mol ' + txt(R.A) + '.', 'Coefficients: ' + fmt(nA) + ' x ' + R.rt + ' = ' + fmt(nB) + ' mol ' + txt(R.B) + '.', 'Out of the pit: ' + fmt(nB) + ' x ' + fM(R.MB) + ' = ' + fmt(nB * R.MB) + ' g.'];
    } else {
      var S = SUBS[a], m = MOLS[b], gs = m * S.M;
      if (fam === 'inverted') {
        stem = 'How many moles are in ' + fmt(gs) + ' g of ' + S.f + ' (' + fM(S.M) + ' g/mol)?';
        rows = [[m, null], [gs * S.M, 'You multiplied by the molar mass. Grams into the pit: divide.'], [S.M / gs, 'You divided the wrong way. The grams you have go on top.'],
          [gs / VM, 'That is the liters exit. Grams use the molar mass.'], [VM / gs, 'That flips the liters exit. Grams use the molar mass.']];
        rows = rows.map(function (r) { return [fmt(r[0]) + ' mol', r[1], r[0]]; });
        why = fmt(gs) + ' / ' + fM(S.M) + ' = ' + fmt(m) + ' mol.';
        steps = ['Start: ' + fmt(gs) + ' g.', 'Into the pit: divide by ' + fM(S.M) + '.', fmt(gs) + ' / ' + fM(S.M) + ' = ' + fmt(m) + ' mol. Stop: they asked for moles.'];
      } else if (fam === 'skip') {
        stem = 'How many molecules are in ' + fmt(gs) + ' g of ' + S.f + ' (' + fM(S.M) + ' g/mol)?';
        rows = [[m * NA, null], [gs * NA, 'You skipped the pit: grams times Avogadro.'], [S.M / gs * NA, 'You divided the wrong way into the pit.'],
          [m, 'You stopped in the pit. That number is moles.'], [m * VM, 'That is the liters exit. Particles use 6.022 x 10^23.']];
        rows = rows.map(function (r) { return [fmt(r[0]), r[1], r[0]]; });
        why = fmt(gs) + ' / ' + fM(S.M) + ' = ' + fmt(m) + ' mol, then x 6.022 x 10^23.';
        steps = ['Into the pit: ' + fmt(gs) + ' / ' + fM(S.M) + ' = ' + fmt(m) + ' mol.', 'Out to particles: x 6.022 x 10^23.', fmt(m) + ' x 6.022 x 10^23 = ' + fmt(m * NA) + '.'];
      } else if (fam === 'stop') {
        stem = 'What volume does ' + fmt(gs) + ' g of ' + S.f + ' (' + fM(S.M) + ' g/mol) fill at STP?';
        rows = [[m * VM, null], [m, 'You stopped in the pit. Take the liters exit: x 22.4.'], [gs * VM, 'You skipped the pit: grams times 22.4.'],
          [S.M / gs * VM, 'You divided the wrong way into the pit.'], [m * NA, 'That is the particles exit. Liters use 22.4.']];
        rows = rows.map(function (r) { return [fmt(r[0]) + ' L', r[1], r[0]]; });
        why = fmt(gs) + ' / ' + fM(S.M) + ' = ' + fmt(m) + ' mol, x 22.4 = ' + fmt(m * VM) + ' L.';
        steps = ['Into the pit: ' + fmt(gs) + ' / ' + fM(S.M) + ' = ' + fmt(m) + ' mol.', 'Do not stop: they asked for liters.', 'Out of the pit: ' + fmt(m) + ' x 22.4 = ' + fmt(m * VM) + ' L.'];
      } else if (fam === 'exit') {
        // the stem prints the particle count to 4 figures; every choice is computed from that printed number
        var p = Number((m * NA).toPrecision(4)); m = p / NA;
        stem = 'What is the mass of ' + fmt(p, 4) + ' molecules of ' + S.f + ' (' + fM(S.M) + ' g/mol)?';
        rows = [[m * S.M, null], [m * VM, 'That is the liters exit. Grams use the molar mass.'], [m, 'You stopped in the pit. Multiply by the molar mass.'],
          [p * S.M, 'You skipped the pit: particles times molar mass.'], [S.M / m, 'You divided the molar mass by the moles. Multiply.']];
        rows = rows.map(function (r) { return [fmt(r[0]) + ' g', r[1], r[0]]; });
        why = fmt(p, 4) + ' / 6.022 x 10^23 = ' + fmt(m) + ' mol, x ' + fM(S.M) + ' = ' + fmt(m * S.M) + ' g.';
        steps = ['Into the pit: ' + fmt(p, 4) + ' / 6.022 x 10^23 = ' + fmt(m) + ' mol.', 'Exit to grams: the molar mass, ' + fM(S.M) + ' g/mol.', fmt(m) + ' x ' + fM(S.M) + ' = ' + fmt(m * S.M) + ' g.'];
      } else return null;
    }
    var texts = rows.map(function (r) { return r[0]; });
    if (texts.some(function (t, i) { return texts.indexOf(t) !== i; })) return null;
    // a fixed order per variant so the key letter moves (no randomness: verify sees what students see)
    var order = [[0, 1, 2, 3, 4], [1, 0, 3, 2, 4], [2, 3, 0, 4, 1], [3, 4, 1, 0, 2], [4, 2, 1, 3, 0]][(a * 3 + b) % 5];
    return { id: id, section: 'gchem', topic: 'stoich', topicName: 'Moles (GuacaMOLE)', skill: 'gc_mole_concept', trapFamily: FAMILIES[fam].bank, localFamily: fam,
      difficulty: fam === 'coeff' || fam === 'atoms' ? 2 : 1, stem: txt(stem), choices: order.map(function (k) { return txt(rows[k][0]); }), answer: order.indexOf(0),
      traps: order.map(function (k) { return rows[k][1] == null ? null : txt(rows[k][1]); }), why: txt(why), steps: steps.map(txt), trick: TRICK.text, generated: true,
      values: order.map(function (k) { return rows[k][2]; }) };
  }
  function grid(fam) { return fam === 'atoms' ? [ATOMS.length, MOLS.length] : fam === 'coeff' ? [RXN.length, COEFF_MOLS.length] : [SUBS.length, MOLS.length]; }
  /* generator(fam, seed)(k): the k-th follow-up in a seeded shuffle of the family's grid */
  function generator(fam, seed) {
    var g = grid(fam), cells = [];
    for (var a = 0; a < g[0]; a++) for (var b = 0; b < g[1]; b++) cells.push([a, b]);
    var s = (seed >>> 0) || 1;
    function R() { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }
    for (var i = cells.length - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)); var t = cells[i]; cells[i] = cells[j]; cells[j] = t; }
    var usable = cells.map(function (c) { return variant(fam, c[0], c[1]); }).filter(Boolean);
    return function (k) { return usable[k % usable.length] || null; };
  }

  var api = { NA: NA, VM: VM, ITEMS: ITEMS, CARDS: CARDS, SPEC: SPEC, FAMILIES: FAMILIES, POOL_IDS: POOL_IDS, TRICK: TRICK, SOURCES: SOURCES,
    fmt: fmt, mark: mark, item: item, keyIndex: keyIndex, solve: solve, explain: explain, trapText: trapText, variant: variant, grid: grid, generator: generator, txt: txt, html: html };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GuacWalk = api;
})(typeof window !== 'undefined' ? window : this);
