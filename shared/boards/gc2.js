/* boards/gc2.js : General Chemistry whiteboards, set two (shared/ace-board.js draws them). */
(function (B) {
  'use strict';
  if (!B) return;
  var K = B.kit, t = K.t, line = K.line, arrow = K.arrow, box = K.box, circ = K.circ, step = K.step, hi = K.hi, dot = K.dot, curve = K.curve, rect = K.rect;

  /* ---------- Measurement and sig figs ---------- */
  var RX = function (v) { return 80 + 560 * (v - 2); };
  B.add({
    id: 'sig-figs', section: 'gchem', title: 'Sig figs: what the ruler really knows',
    sub: 'Read every certain digit, then estimate exactly one more.',
    svg: K.svg(
      box(60, 150, 600, 74, { r: 8, w: 4.5 }),
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (i) { return line([[RX(2 + i / 10), 150], [RX(2 + i / 10), i % 5 ? 176 : 194]], { w: i % 5 ? 3 : 4.5 }); }).join(''),
      t(80, 262, '2', { size: 32 }), t(360, 262, '2.5', { size: 28, c: 'mute' }), t(640, 262, '3 cm', { size: 32 }),
      rect(80, 100, RX(2.35) - 80, 34, { c: 'blue', w: 4, fill: 'blue', op: 0.2 }), line([[RX(2.35), 100], [RX(2.35), 196]], { c: 'blue', w: 3, dash: '4 8' }),
      step(1, t(480, 76, '2.35 cm', { size: 44, c: 'blue' }), t(480, 122, '2 and 3 sure, 5 estimated', { size: 26, c: 'blue' })),
      step(2, t(190, 344, '0.00520', { size: 44 }), line([[112, 330], [184, 330]], { c: 'rose', w: 5 }), hi(194, 314, 74, 40, { c: 'gold' }), t(190, 388, '3 sig figs', { size: 28, c: 'rose' }),
        t(530, 344, '100.0', { size: 44 }), hi(470, 314, 120, 40, { c: 'gold' }), t(530, 388, '4 sig figs', { size: 28, c: 'rose' })),
      step(3, t(360, 458, '× ÷  fewest sig figs:  2.35 × 1.2 = 2.8', { size: 28, c: 'purple' })),
      step(4, t(360, 520, '+ −  fewest decimals:  12.11 + 0.3 = 12.4', { size: 28, c: 'green' }))
    ),
    predict: { q: 'How many significant figures are in 0.00520?', choices: ['6', '5', '3', '2'], answer: 2, why: 'Leading zeros only place the decimal. The 5, the 2 and the trailing zero after the decimal count: three.' },
    steps: [
      'A measurement is every digit you are sure of plus one estimated digit. The bar ends between 2.3 and 2.4, so you write 2.35 cm: three sig figs.',
      'Zeros: leading zeros never count, zeros between digits always count, and trailing zeros count when a decimal point is shown.',
      'Multiply or divide: the answer keeps as many sig figs as the weakest number. 2.35 × 1.2 = 2.82, reported as 2.8.',
      'Add or subtract: the answer keeps as many decimal places as the weakest number. 12.11 + 0.3 = 12.41, reported as 12.4.'
    ],
    tryIt: [
      { q: '4.50 × 2.0 = ? (correct sig figs)', choices: ['9', '9.0', '9.00'], answer: 1, why: '2.0 has two sig figs, so the product keeps two: 9.0.' },
      { q: 'How many sig figs are in 1020.0?', choices: ['3', '4', '5'], answer: 2, why: 'A decimal point is shown, so every digit counts, the zeros included: five.' },
      { q: '15.22 + 1.1 = ? (correct sig figs)', choices: ['16.32', '16.3', '16'], answer: 1, why: '1.1 is known to one decimal place, so the sum is too: 16.3.' }
    ],
    path: { title: 'Report a calculated answer', steps: ['Do the full calculation without rounding', 'Count sig figs (× ÷) or decimal places (+ −) in each input', 'Find the weakest input', 'Round the answer once, at the end', 'Attach the unit'] },
    more: [{ label: 'The mole bridge', href: '/see/?b=mole-bridge' }]
  });

  /* ---------- Lab technique ---------- */
  B.add({
    id: 'lab-glassware', section: 'gchem', title: 'Lab glassware: which one for the job',
    sub: 'Four pieces, four levels of trust.',
    svg: K.svg(
      line([[30, 400], [690, 400]], { w: 4, c: 'mute' }),
      line([[50, 250], [50, 400], [190, 400], [190, 250]], { w: 5 }), line([[52, 310], [188, 310]], { c: 'blue', w: 3 }),
      line([[240, 150], [240, 400], [300, 400], [300, 150]], { w: 5 }), [0, 1, 2, 3, 4, 5].map(function (i) { return line([[240, 360 - i * 36], [262, 360 - i * 36]], { w: 3 }); }).join(''),
      circ(430, 338, 62, { w: 5 }), line([[415, 280], [415, 150]], { w: 5 }), line([[445, 280], [445, 150]], { w: 5 }), line([[408, 200], [452, 200]], { c: 'rose', w: 4 }),
      line([[595, 60], [595, 350], [605, 380], [605, 398]], { w: 5 }), line([[625, 60], [625, 350], [615, 380], [615, 398]], { w: 5 }), [0, 1, 2, 3, 4, 5, 6].map(function (i) { return line([[595, 90 + i * 36], [611, 90 + i * 36]], { w: 3 }); }).join(''), line([[580, 364], [640, 364]], { w: 6, c: 'goldInk' }),
      t(120, 440, 'beaker', { size: 27 }), t(270, 440, 'cylinder', { size: 27 }), t(432, 440, 'vol. flask', { size: 27 }), t(610, 440, 'buret', { size: 27 }),
      step(1, curve([[242, 222], [270, 238], [298, 222]], { c: 'blue', w: 4 }), line([[304, 238], [376, 238]], { c: 'blue', w: 3, dash: '4 8' }), dot(384, 238, 8, { c: 'blue' }),
        t(200, 100, 'read the bottom of the curve', { size: 27, c: 'blue' }), t(200, 134, 'at eye level', { size: 27, c: 'blue' })),
      step(2, t(120, 478, 'rough', { size: 27, c: 'rose' }), t(270, 478, 'better', { size: 27, c: 'rose' }), t(432, 478, 'exact', { size: 27, c: 'green' }), t(610, 478, 'to 0.01 mL', { size: 27, c: 'green' })),
      step(3, hi(350, 500, 164, 34, { c: 'gold' }), t(432, 526, 'make solutions', { size: 27, c: 'purple' })),
      step(4, hi(560, 500, 100, 34, { c: 'gold' }), t(610, 526, 'titrate', { size: 27, c: 'purple' }), t(170, 526, 'buret: final − initial', { size: 26, c: 'purple' }))
    ),
    predict: { q: 'You need exactly 250.0 mL of 0.100 M NaCl. Which glassware do you make it in?', choices: ['A 250 mL beaker', 'A 250 mL graduated cylinder', 'A 250 mL volumetric flask'], answer: 2, why: 'A volumetric flask has one etched line and holds one volume very exactly. That is what a known molarity needs.' },
    steps: [
      'Water climbs the glass and curves. Read the bottom of the meniscus with your eye level with it, and estimate one digit past the smallest mark.',
      'Beaker marks are rough guides. A graduated cylinder is better. A volumetric flask and a buret are the careful tools.',
      'Volumetric flask: dissolve the solute, then fill to the line. One exact volume, so one exact molarity.',
      'Buret: delivers any volume you choose, read to 0.01 mL. The volume delivered in a titration is the final reading minus the initial reading.'
    ],
    tryIt: [
      { q: 'A buret reads 12.35 mL at the start and 30.85 mL at the endpoint. Volume delivered?', choices: ['43.20 mL', '18.50 mL', '30.85 mL'], answer: 1, why: 'Final minus initial: 30.85 − 12.35 = 18.50 mL.' },
      { q: 'Four trials give 9.10, 9.11, 9.10 and 9.12 when the true value is 10.00. The data are:', choices: ['Accurate and precise', 'Precise but not accurate', 'Accurate but not precise'], answer: 1, why: 'They agree with each other (precise) but all miss the true value (not accurate). That pattern points to a systematic error.' },
      { q: 'When diluting a concentrated acid, you should:', choices: ['Add the acid slowly to water', 'Add water quickly to the acid', 'Either order is fine'], answer: 0, why: 'Add acid to water. The large volume of water absorbs the heat released, so nothing boils and spatters.' }
    ],
    path: { title: 'Run a titration', steps: ['Rinse and fill the buret with titrant', 'Record the initial reading', 'Add indicator to the flask of analyte', 'Add titrant, swirling, until the color just stays', 'Record the final reading', 'Subtract to get volume, then use mole ratios'] },
    more: [{ label: 'Acids, bases and the titration curve', href: '/see/?b=acid-base' }]
  });

  /* ---------- Quantum numbers and electron configuration ---------- */
  function orbs(x, y, n) { var s = ''; for (var i = 0; i < n; i++) s += rect(x + i * 48, y, 42, 42, { w: 3.5 }); return s; }
  function up(x, y, col) { return arrow(x + 14, y + 36, x + 14, y + 7, { c: col, w: 3.5, head: 9 }); }
  function dn(x, y, col) { return arrow(x + 28, y + 7, x + 28, y + 36, { c: col, w: 3.5, head: 9 }); }
  B.add({
    id: 'quantum', section: 'gchem', title: 'Quantum numbers and electron configuration',
    sub: 'Every electron has an address. Fill from the bottom.',
    svg: K.svg(
      arrow(40, 520, 40, 70, { w: 4 }), t(40, 52, 'E', { size: 30 }),
      orbs(118, 476, 1), t(108, 508, '1s', { size: 27, a: 'e' }),
      orbs(118, 396, 1), t(108, 428, '2s', { size: 27, a: 'e' }), orbs(196, 366, 3), t(344, 398, '2p', { size: 27, a: 's' }),
      orbs(118, 286, 1), t(108, 318, '3s', { size: 27, a: 'e' }), orbs(196, 256, 3), t(344, 288, '3p', { size: 27, a: 's' }),
      orbs(118, 176, 1), t(108, 208, '4s', { size: 27, a: 'e' }), orbs(196, 126, 5), t(440, 158, '3d', { size: 27, a: 's' }),
      step(1, t(480, 228, 'n: shell 1, 2, 3', { size: 27, c: 'blue', a: 's' }), t(480, 266, 'l: shape s p d f', { size: 27, c: 'blue', a: 's' })),
      step(2, t(480, 314, 'm_{l}: which box', { size: 27, c: 'purple', a: 's' }), t(480, 352, 'm_{s}: up or down', { size: 27, c: 'purple', a: 's' })),
      step(3, up(118, 476, K.col.green), dn(118, 476, K.col.green), up(118, 396, K.col.green), dn(118, 396, K.col.green)),
      step(4, up(196, 366, K.col.rose), up(244, 366, K.col.rose), up(292, 366, K.col.rose), hi(474, 400, 232, 38, { c: 'gold' }), t(590, 428, 'N: 1s^{2}2s^{2}2p^{3}', { size: 29, c: 'rose' })),
      step(5, t(590, 484, 'Cr: 4s^{1}3d^{5}', { size: 28, c: 'goldInk' }), t(590, 524, 'Cu: 4s^{1}3d^{10}', { size: 28, c: 'goldInk' }))
    ),
    predict: { q: 'How many orbitals are in a d subshell?', choices: ['3', '5', '7', '10'], answer: 1, why: 'For d, l = 2, so m_{l} runs −2, −1, 0, +1, +2: five orbitals, holding ten electrons.' },
    steps: [
      'n is the shell: size and energy. l is the subshell shape and runs from 0 to n − 1: 0 is s, 1 is p, 2 is d, 3 is f.',
      'm_{l} picks the orbital and runs from −l to +l, so s has 1 box, p has 3, d has 5, f has 7. m_{s} is the spin, +1/2 or −1/2: two electrons per box, opposite spins.',
      'Aufbau: fill the lowest energy first. 1s, 2s, 2p, 3s, 3p, then 4s before 3d.',
      'Hund: in a set of equal boxes, put one electron in each before pairing any. Nitrogen has three unpaired 2p electrons.',
      'Two exceptions to know: chromium and copper promote one 4s electron to get a half-filled or filled d set.'
    ],
    tryIt: [
      { q: 'What is the maximum number of electrons in the n = 3 shell?', choices: ['8', '18', '32'], answer: 1, why: '2n^{2} = 18: two in 3s, six in 3p, ten in 3d.' },
      { q: 'Which set of quantum numbers (n, l, m_{l}) is impossible?', choices: ['(2, 1, 0)', '(3, 2, −2)', '(2, 2, 1)'], answer: 2, why: 'l can only run up to n − 1. With n = 2, l is 0 or 1, never 2.' },
      { q: 'What is the ground state configuration of Fe (Z = 26)?', choices: ['[Ar] 4s^{2} 3d^{6}', '[Ar] 3d^{8}', '[Ar] 4s^{2} 4p^{6}'], answer: 0, why: 'Argon covers 18 electrons. The next two go in 4s and the last six in 3d.' }
    ],
    path: { title: 'Filling order of the orbitals', steps: ['1s', '2s', '2p', '3s', '3p', '4s', '3d'] },
    more: [{ label: 'Periodic trends', href: '/see/?b=periodic-trends' }]
  });

  /* ---------- Periodic trends ---------- */
  B.add({
    id: 'periodic-trends', section: 'gchem', title: 'Periodic trends: two arrows',
    sub: 'Radius goes one way. Almost everything else goes the other.',
    svg: K.svg(
      line([[150, 120], [196, 120], [196, 166], [242, 166], [242, 240], [440, 240], [440, 166], [564, 166], [564, 120], [610, 120], [610, 380], [150, 380], [150, 120]], { w: 5 }),
      t(173, 154, 'H', { size: 26 }), t(587, 154, 'He', { size: 26 }), t(541, 200, 'F', { size: 28 }), t(173, 368, 'Fr', { size: 26 }),
      step(1, arrow(590, 412, 170, 412, { c: 'blue', w: 6 }), arrow(640, 130, 640, 370, { c: 'blue', w: 6 }), t(380, 448, 'radius grows', { size: 29, c: 'blue' })),
      step(2, arrow(170, 90, 590, 90, { c: 'purple', w: 6 }), arrow(120, 370, 120, 130, { c: 'purple', w: 6 }), t(380, 66, 'ionization energy rises', { size: 29, c: 'purple' })),
      step(3, hi(516, 180, 44, 30, { c: 'gold' }), t(380, 296, 'F pulls hardest: EN 4.0', { size: 28, c: 'rose' })),
      step(4, t(390, 342, 'across: more protons, same shell', { size: 26, c: 'goldInk' })),
      step(5, t(360, 514, 'Na^{+} < Na          Cl < Cl^{−}', { size: 32, c: 'green' }))
    ),
    predict: { q: 'Which atom is larger: sodium (Na) or chlorine (Cl)? They are in the same period.', choices: ['Na', 'Cl', 'They are the same size'], answer: 0, why: 'Across a period the protons increase but the shell stays the same, so the electrons are pulled in. Na, on the left, is larger.' },
    steps: [
      'Atomic radius grows down a group (a new shell each row) and toward the left of a period. Francium corner: biggest.',
      'Ionization energy, the cost of removing an electron, runs the opposite way: it rises up a group and to the right. Small atoms hold on tighter.',
      'Electronegativity follows ionization energy. Fluorine is the most electronegative element. Noble gases are left out.',
      'The reason for both: going across, protons are added but shielding barely changes, so effective nuclear charge rises. Going down, new shells add distance and shielding.',
      'Ions: a cation is smaller than its atom and an anion is larger. With equal electrons, more protons means smaller.'
    ],
    tryIt: [
      { q: 'Which has the highest first ionization energy?', choices: ['Na', 'Mg', 'Cl', 'Ar'], answer: 3, why: 'Ionization energy rises across a period. Argon, a noble gas with a full shell, is highest in period 3.' },
      { q: 'Rank by radius, smallest first: O^{2−}, F^{−}, Na^{+} (all have 10 electrons).', choices: ['Na^{+}, F^{−}, O^{2−}', 'O^{2−}, F^{−}, Na^{+}', 'F^{−}, Na^{+}, O^{2−}'], answer: 0, why: 'Same electrons, so more protons pull harder. Na has 11 protons, F has 9, O has 8.' },
      { q: 'Which is the most electronegative?', choices: ['C', 'N', 'O', 'S'], answer: 2, why: 'Electronegativity rises up and to the right. Oxygen (3.5) is second only to fluorine.' }
    ],
    flick: {
      title: 'Periodic trends', up: 'Increases', down: 'Decreases',
      cards: [
        { q: 'Atomic radius, going left to right across a period', up: false, why: 'More protons pull the same shell in tighter.' },
        { q: 'Atomic radius, going down a group', up: true, why: 'Each row adds a whole new shell.' },
        { q: 'First ionization energy, going left to right across a period', up: true, why: 'Higher effective nuclear charge holds electrons tighter.' },
        { q: 'First ionization energy, going down a group', up: false, why: 'The outer electron is farther away and more shielded.' },
        { q: 'Electronegativity, going left to right across a period', up: true, why: 'Smaller atoms with more protons pull shared electrons harder.' },
        { q: 'Electronegativity, going down a group', up: false, why: 'The bonding electrons sit farther from the nucleus.' },
        { q: 'Effective nuclear charge, going left to right across a period', up: true, why: 'Protons are added while shielding stays about the same.' },
        { q: 'Metallic character, going down a group', up: true, why: 'Outer electrons are lost more easily.' },
        { q: 'Metallic character, going left to right across a period', up: false, why: 'Atoms hold their electrons tighter toward the right.' },
        { q: 'Size, when Na loses an electron to become Na^{+}', up: false, why: 'A cation loses its outer shell and is smaller than the atom.' },
        { q: 'Size, when Cl gains an electron to become Cl^{−}', up: true, why: 'Extra electron repulsion with the same protons swells the anion.' },
        { q: 'Radius along O^{2−}, F^{−}, Na^{+}, Mg^{2+} (all 10 electrons)', up: false, why: 'Same electrons, more protons each step: smaller.' },
        { q: 'Number of valence electrons, going left to right in the main groups', up: true, why: 'One more valence electron per group.' },
        { q: 'Acid strength of HF, HCl, HBr, HI, going down the group', up: true, why: 'The H to X bond gets longer and weaker, so the proton leaves more easily.' }
      ]
    },
    more: [{ label: 'Quantum numbers and electron configuration', href: '/see/?b=quantum' }, { label: 'Periodic trends explorer', href: '/tools/gc/trends.html' }]
  });

  /* ---------- Bonding, Lewis, VSEPR ---------- */
  function mol(cx, cy, C, arms) {
    var s = t(cx, cy + 12, C, { size: 34 });
    arms.forEach(function (a) {
      var r = a[0] * Math.PI / 180, cs = Math.cos(r), sn = Math.sin(r), o = a[2] ? 5 : 0;
      [o, -o].slice(0, a[2] ? 2 : 1).forEach(function (k) { s += line([[cx + 22 * cs - k * sn, cy + 22 * sn + k * cs], [cx + 56 * cs - k * sn, cy + 56 * sn + k * cs]], { w: 4 }); });
      s += t(cx + 78 * cs, cy + 78 * sn + 11, a[1], { size: 30 });
    });
    return s;
  }
  function lp(cx, cy, deg) { var r = deg * Math.PI / 180, cs = Math.cos(r), sn = Math.sin(r); return dot(cx + 30 * cs - 7 * sn, cy + 30 * sn + 7 * cs, 5, { c: 'rose' }) + dot(cx + 30 * cs + 7 * sn, cy + 30 * sn - 7 * cs, 5, { c: 'rose' }); }
  B.add({
    id: 'bonding', section: 'gchem', title: 'Lewis to shape: count the domains',
    sub: 'Electron groups push apart. Lone pairs push hardest.',
    svg: K.svg(
      mol(130, 110, 'C', [[180, 'O', 1], [0, 'O', 1]]), mol(360, 120, 'B', [[-90, 'F'], [30, 'F'], [150, 'F']]), mol(590, 110, 'C', [[-90, 'H'], [0, 'H'], [90, 'H'], [180, 'H']]),
      mol(170, 380, 'N', [[180, 'H'], [0, 'H'], [90, 'H']]), mol(420, 366, 'O', [[150, 'H'], [30, 'H']]),
      step(1, lp(170, 380, -90), lp(420, 366, -125), lp(420, 366, -55)),
      step(2, t(130, 234, '2 groups', { size: 27, c: 'blue' }), t(360, 234, '3 groups', { size: 27, c: 'blue' }), t(590, 234, '4 groups', { size: 27, c: 'blue' }), t(170, 500, '4 groups', { size: 27, c: 'blue' }), t(420, 500, '4 groups', { size: 27, c: 'blue' })),
      step(3, t(130, 268, 'linear 180°', { size: 26, c: 'purple' }), t(360, 268, 'trigonal 120°', { size: 26, c: 'purple' }), t(585, 268, 'tetrahedral 109.5°', { size: 26, c: 'purple' })),
      step(4, t(170, 534, 'pyramidal 107°', { size: 26, c: 'rose' }), t(420, 534, 'bent 104.5°', { size: 26, c: 'rose' })),
      step(5, t(618, 352, 'NH_{3}, H_{2}O:', { size: 27, c: 'green' }), t(618, 386, 'polar', { size: 30, c: 'green' }), t(618, 446, 'CO_{2}, BF_{3},', { size: 27, c: 'goldInk' }), t(618, 480, 'CH_{4}: nonpolar', { size: 27, c: 'goldInk' }))
    ),
    predict: { q: 'What is the shape of a water molecule?', choices: ['Linear', 'Bent', 'Tetrahedral'], answer: 1, why: 'Oxygen has four electron groups (two bonds, two lone pairs). The groups are tetrahedral, but the atoms you see make a bent shape.' },
    steps: [
      'Draw the Lewis structure first and do not forget the lone pairs on the central atom: one on N in ammonia, two on O in water.',
      'Count electron groups around the central atom. A lone pair is one group. A double or triple bond is still one group.',
      'The groups spread as far apart as they can: 2 is linear (180°), 3 is trigonal planar (120°), 4 is tetrahedral (109.5°).',
      'Name the shape by the atoms only. With four groups, one lone pair gives trigonal pyramidal (about 107°) and two give bent (about 104.5°). Lone pairs squeeze the angle.',
      'Polarity: if the bond dipoles are arranged symmetrically they cancel. Lone pairs on the center usually break the symmetry.'
    ],
    tryIt: [
      { q: 'A central atom with three electron groups and no lone pairs has what hybridization?', choices: ['sp', 'sp^{2}', 'sp^{3}'], answer: 1, why: 'Count the groups: 2 is sp, 3 is sp^{2}, 4 is sp^{3}.' },
      { q: 'Which molecule is polar?', choices: ['CO_{2}', 'BF_{3}', 'NH_{3}', 'CCl_{4}'], answer: 2, why: 'The lone pair on nitrogen makes ammonia a pyramid, so its dipoles do not cancel. The other three are symmetric.' },
      { q: 'How many sigma and pi bonds are in O=C=O?', choices: ['2 sigma, 2 pi', '4 sigma, 0 pi', '2 sigma, 0 pi'], answer: 0, why: 'Every double bond is one sigma plus one pi. Two double bonds: two sigma, two pi.' }
    ],
    path: { title: 'From formula to shape', steps: ['Count valence electrons', 'Draw the Lewis structure', 'Count electron groups on the central atom', 'Pick the group geometry', 'Hide the lone pairs to name the shape', 'Check symmetry for polarity'] },
    more: [{ label: 'VSEPR Viewer', href: '/gc/vsepr/' }, { label: 'Lewis sandbox: build it yourself', href: '/tools/gc/lewis-sandbox.html' }]
  });

  /* ---------- Solutions and colligative properties ---------- */
  B.add({
    id: 'solutions', section: 'gchem', title: 'Colligative properties: count the particles',
    sub: 'It is how many, not what kind.',
    svg: K.svg(
      line([[60, 170], [60, 470], [300, 470], [300, 170]], { w: 5 }), curve([[62, 250], [120, 244], [180, 252], [240, 246], [298, 250]], { c: 'blue', w: 4 }),
      [[100, 300], [150, 350], [210, 310], [255, 380], [120, 420], [190, 430], [250, 300], [90, 370]].map(function (p, i) { return dot(p[0], p[1], 9, { c: i % 2 ? 'rose' : 'purple' }); }).join(''),
      line([[520, 90], [520, 480]], { w: 6 }), circ(520, 500, 18, { w: 5, fill: 'rose', op: 0.5 }),
      line([[504, 170], [536, 170]], { w: 4 }), t(492, 180, '100°', { size: 27, a: 'e' }), line([[504, 400], [536, 400]], { w: 4 }), t(492, 410, '0°', { size: 27, a: 'e' }),
      step(1, t(180, 76, 'NaCl → Na^{+} + Cl^{−}', { size: 28, c: 'purple' }), t(180, 124, 'i = 2', { size: 34, c: 'purple' })),
      step(2, arrow(552, 400, 552, 448, { c: 'blue', w: 6 }), t(630, 438, 'freezes', { size: 27, c: 'blue' }), t(630, 470, 'lower', { size: 27, c: 'blue' }), hi(556, 262, 152, 40, { c: 'gold' }), t(632, 292, 'ΔT = iKm', { size: 32 })),
      step(3, arrow(552, 170, 552, 122, { c: 'rose', w: 6 }), t(630, 128, 'boils', { size: 27, c: 'rose' }), t(630, 160, 'higher', { size: 27, c: 'rose' })),
      step(4, arrow(90, 236, 90, 190, { c: 'green', w: 4 }), arrow(270, 236, 270, 190, { c: 'green', w: 4 }), t(180, 218, 'less vapor', { size: 27, c: 'green' })),
      step(5, t(180, 524, 'Π = iMRT', { size: 32, c: 'goldInk' }))
    ),
    predict: { q: 'Three 1 m solutions in water: glucose, NaCl, CaCl_{2}. Which freezes at the lowest temperature?', choices: ['Glucose', 'NaCl', 'CaCl_{2}'], answer: 2, why: 'CaCl_{2} breaks into three ions, so it puts the most particles in the water: i = 3.' },
    steps: [
      'Count particles, not formula units. The van \'t Hoff factor i is how many pieces one unit makes: glucose 1, NaCl 2, CaCl_{2} 3.',
      'Freezing point drops: ΔT_{f} = i K_{f} m. For water K_{f} is 1.86 °C per molal. m is molality: moles of solute per kilogram of solvent.',
      'Boiling point rises by the same logic: ΔT_{b} = i K_{b} m, with K_{b} = 0.512 °C per molal for water. The liquid range widens at both ends.',
      'Vapor pressure falls, because solute particles take up surface. Raoult: P = X(solvent) × P° of the pure solvent.',
      'Osmotic pressure, the push of water across a membrane toward the solute, is Π = iMRT. Here M is molarity.'
    ],
    tryIt: [
      { q: 'What is the freezing point of 1.0 m NaCl in water? (K_{f} = 1.86)', choices: ['−1.86 °C', '−3.72 °C', '+3.72 °C'], answer: 1, why: 'ΔT = 2 × 1.86 × 1.0 = 3.72 °C below the normal 0 °C.' },
      { q: '100 mL of 2.0 M HCl is diluted to 400 mL. New concentration?', choices: ['0.50 M', '8.0 M', '0.25 M'], answer: 0, why: 'M1V1 = M2V2: (2.0)(100) = M2(400), so M2 = 0.50 M.' },
      { q: 'Molality is moles of solute per:', choices: ['Liter of solution', 'Kilogram of solvent', 'Kilogram of solution'], answer: 1, why: 'Molality uses the mass of the solvent only, so it does not change with temperature.' }
    ],
    flick: {
      title: 'Solutions', up: 'Goes up', down: 'Goes down',
      cards: [
        { q: 'Boiling point of water, when salt is dissolved in it', up: true, why: 'Boiling point elevation: ΔT_{b} = i K_{b} m.' },
        { q: 'Freezing point of water, when salt is dissolved in it', up: false, why: 'Freezing point depression: ΔT_{f} = i K_{f} m.' },
        { q: 'Vapor pressure of water, when sugar is dissolved in it', up: false, why: 'Raoult: less solvent at the surface, less vapor.' },
        { q: 'Osmotic pressure, when more solute is added', up: true, why: 'Π = iMRT rises with concentration.' },
        { q: 'Freezing point drop, switching 1 m glucose for 1 m NaCl', up: true, why: 'i goes from 1 to 2, doubling the particles.' },
        { q: 'Solubility of a gas in water, when the water is heated', up: false, why: 'Gases escape warm liquids. Think of flat warm soda.' },
        { q: 'Solubility of a gas in water, when its pressure above the water rises', up: true, why: 'Henry\'s law: solubility is proportional to the gas pressure.' },
        { q: 'Solubility of most solid salts, when the water is heated', up: true, why: 'Most solids dissolve better in hot water.' },
        { q: 'Molarity, when water is added to a solution', up: false, why: 'Same moles in more volume: M1V1 = M2V2.' },
        { q: 'Boiling point rise, switching 1 m NaCl for 1 m CaCl_{2}', up: true, why: 'i goes from 2 to 3.' },
        { q: 'Vapor pressure of a solution, when the mole fraction of solvent rises', up: true, why: 'P = X(solvent) × P°: more solvent, more vapor.' },
        { q: 'Boiling point of the solution, when some solvent evaporates away', up: true, why: 'The solution gets more concentrated, so molality rises.' }
      ]
    },
    more: [{ label: 'The mole bridge', href: '/see/?b=mole-bridge' }]
  });

  /* ---------- Nuclear ---------- */
  B.add({
    id: 'nuclear', section: 'gchem', title: 'Nuclear decay: four moves and a half-life',
    sub: 'Balance the top numbers. Balance the bottom numbers.',
    svg: K.svg(
      box(280, 30, 160, 70, { w: 5 }), t(360, 78, 'A,  Z', { size: 34 }),
      arrow(300, 104, 110, 208, { w: 4 }), arrow(340, 104, 280, 208, { w: 4 }), arrow(380, 104, 440, 208, { w: 4 }), arrow(420, 104, 610, 208, { w: 4 }),
      box(26, 214, 164, 64, { w: 4 }), box(200, 214, 164, 64, { w: 4 }), box(374, 214, 164, 64, { w: 4 }), box(548, 214, 150, 64, { w: 4 }),
      line([[110, 530], [650, 530]], { w: 4 }), rect(150, 380, 70, 150, { c: 'blue', w: 4, fill: 'blue', op: 0.25 }), t(185, 366, '1', { size: 28, c: 'blue' }),
      step(1, t(176, 150, 'α', { size: 38, c: 'rose' }), t(108, 258, 'A−4, Z−2', { size: 28, c: 'rose' })),
      step(2, t(286, 172, 'β^{−}', { size: 34, c: 'purple' }), t(282, 258, 'Z+1', { size: 30, c: 'purple' })),
      step(3, t(440, 172, 'β^{+}', { size: 34, c: 'green' }), t(456, 258, 'Z−1', { size: 30, c: 'green' })),
      step(4, t(548, 150, 'γ', { size: 38, c: 'goldInk' }), t(623, 258, 'no change', { size: 27, c: 'goldInk' })),
      step(5, rect(290, 455, 70, 75, { c: 'blue', w: 4, fill: 'blue', op: 0.25 }), t(325, 441, '1/2', { size: 28, c: 'blue' }), rect(430, 492.5, 70, 37.5, { c: 'blue', w: 4, fill: 'blue', op: 0.25 }), t(465, 478, '1/4', { size: 28, c: 'blue' }),
        rect(570, 511.2, 70, 18.8, { c: 'blue', w: 4, fill: 'blue', op: 0.25 }), t(605, 496, '1/8', { size: 28, c: 'blue' }),
        arrow(228, 340, 282, 340, { c: 'mute', w: 3 }), t(255, 326, 't_{1/2}', { size: 26, c: 'mute' }))
    ),
    predict: { q: 'After three half-lives, what fraction of a radioactive sample remains?', choices: ['1/3', '1/6', '1/8', '1/9'], answer: 2, why: 'Each half-life cuts what is left in half: 1/2, then 1/4, then 1/8.' },
    steps: [
      'Alpha decay throws out a helium nucleus (2 protons, 2 neutrons). Mass number drops by 4, atomic number by 2. Example: U-238 becomes Th-234.',
      'Beta minus decay turns a neutron into a proton and emits an electron. Mass number stays, atomic number goes up 1. Example: C-14 becomes N-14.',
      'Positron emission and electron capture both turn a proton into a neutron. Mass number stays, atomic number goes down 1.',
      'Gamma emission is only energy leaving an excited nucleus. Neither number changes.',
      'Half-life: the time for half the sample to decay, always the same for a given isotope. After n half-lives the fraction left is (1/2)^{n}.'
    ],
    tryIt: [
      { q: 'Th-234 (Z = 90) undergoes beta minus decay. What forms?', choices: ['Pa-234 (Z = 91)', 'Ac-234 (Z = 89)', 'Ra-230 (Z = 88)'], answer: 0, why: 'Beta minus keeps the mass number and raises the atomic number by one: element 91, protactinium.' },
      { q: 'An isotope has a half-life of 10 days. How much of an 80 g sample is left after 30 days?', choices: ['40 g', '20 g', '10 g'], answer: 2, why: '30 days is three half-lives: 80, 40, 20, 10 g.' },
      { q: 'Po-210 (Z = 84) decays to Pb-206 (Z = 82). What was emitted?', choices: ['An alpha particle', 'A beta particle', 'A positron'], answer: 0, why: 'Mass down 4 and atomic number down 2 is the signature of an alpha particle.' }
    ],
    path: { title: 'Balance a nuclear equation', steps: ['Write mass number (top) and atomic number (bottom) for every particle', 'Make the top numbers equal on both sides', 'Make the bottom numbers equal on both sides', 'Use the new atomic number to name the element', 'Check the particle: alpha, beta, positron or gamma'] }
  });
})(typeof window !== 'undefined' ? window.AceBoard : (typeof require === 'function' ? require('../ace-board.js') : null));
