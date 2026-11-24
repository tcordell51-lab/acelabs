/* boards/oc2.js : Organic Chemistry whiteboards, set two (shared/ace-board.js draws them). */
(function (B) {
  'use strict';
  if (!B) return;
  var K = B.kit, t = K.t, line = K.line, arrow = K.arrow, box = K.box, circ = K.circ, step = K.step, hi = K.hi, dot = K.dot, curve = K.curve;

  /* ---------- Nomenclature ---------- */
  var CH = [[110, 270], [196, 216], [282, 270], [368, 216], [454, 270]];
  B.add({
    id: 'nomenclature', section: 'ochem', title: 'Naming: four moves',
    sub: 'Chain, number, branches, suffix.',
    svg: K.svg(
      line(CH, { w: 6 }), line([[196, 216], [196, 150]], { w: 6 }), t(196, 132, 'OH', { size: 34 }), line([[368, 216], [368, 140]], { w: 6 }),
      step(1, hi(104, 222, 356, 60, { c: 'gold', op: 0.25 }), t(596, 96, '1 meth', { size: 27, c: 'blue' }), t(596, 132, '2 eth', { size: 27, c: 'blue' }), t(596, 168, '3 prop', { size: 27, c: 'blue' }), t(596, 204, '4 but', { size: 27, c: 'blue' }), hi(540, 218, 112, 34, { c: 'gold' }), t(596, 240, '5 pent', { size: 27, c: 'blue' }), t(596, 276, '6 hex', { size: 27, c: 'blue' })),
      step(2, CH.map(function (p, i) { return t(p[0], p[1] + (i % 2 ? 50 : 44), String(i + 1), { size: 30, c: 'rose' }); }).join('')),
      step(3, circ(368, 132, 26, { c: 'purple', w: 3.5 }), t(456, 140, '4-methyl', { size: 28, c: 'purple' })),
      step(4, t(300, 400, '4-methyl-2-pentanol', { size: 42 }), t(300, 446, 'branch       chain + suffix', { size: 26, c: 'mute' })),
      step(5, t(360, 520, 'acid > aldehyde > ketone > alcohol > amine', { size: 27, c: 'green' }))
    ),
    predict: { q: 'How many carbons are in the parent chain of this molecule?', choices: ['4', '5', '6'], answer: 1, why: 'The longest chain that carries the OH has five carbons: pent. The sixth carbon is a branch.' },
    steps: [
      'Find the longest carbon chain that contains the main functional group. Five carbons: pent.',
      'Number the chain from the end that gives the main functional group the lowest number. The OH lands on carbon 2.',
      'Name each branch with its carbon number. A one-carbon branch on carbon 4 is 4-methyl.',
      'Put it together: branches first (alphabetical), then the chain, then the suffix for the main group. An alcohol ends in ol.',
      'When there is more than one functional group, the highest priority one takes the suffix: carboxylic acid, then aldehyde, ketone, alcohol, amine. The rest become prefixes such as hydroxy or oxo.'
    ],
    tryIt: [
      { q: 'CH_{3}CH_{2}CH_{2}CHO is named:', choices: ['Butanal', 'Butanone', '1-butanol'], answer: 0, why: 'Four carbons with an aldehyde at the end: butanal. Aldehydes take the suffix al and are always carbon 1.' },
      { q: 'What is the suffix for a ketone?', choices: ['al', 'one', 'oic acid'], answer: 1, why: 'Ketones end in one, as in propanone (acetone).' },
      { q: 'A molecule has both an OH and a COOH. Which group gets the suffix?', choices: ['The OH', 'The COOH', 'Whichever has the lower number'], answer: 1, why: 'A carboxylic acid outranks an alcohol, so the name ends in oic acid and the OH becomes hydroxy.' }
    ],
    path: { title: 'Name an organic molecule', steps: ['Find the highest priority functional group', 'Find the longest chain that contains it', 'Number from the end nearest that group', 'Name and number each branch', 'List branches alphabetically', 'Add the chain name and suffix'] }
  });

  /* ---------- Stereochemistry ---------- */
  B.add({
    id: 'stereo', section: 'ochem', title: 'R or S, E or Z',
    sub: 'Rank the groups, then look at the turn.',
    svg: K.svg(
      t(200, 272, 'C', { size: 36 }), line([[200, 236], [200, 172]], { w: 6 }), t(200, 156, 'Br', { size: 34 }),
      K.path('M218 276 L290 316 L282 330 Z', { w: 3, fill: 'ink', op: 1 }), t(318, 344, 'Cl', { size: 34 }),
      K.path('M182 276 L110 316 L118 330 Z', { w: 3, fill: 'ink', op: 1 }), t(84, 344, 'F', { size: 34 }),
      line([[186, 244], [138, 204]], { w: 5, dash: '3 9' }), t(120, 200, 'H', { size: 30, c: 'mute' }),
      line([[500, 222], [600, 222]], { w: 6 }), line([[500, 236], [600, 236]], { w: 6 }),
      line([[500, 229], [452, 170]], { w: 6 }), line([[500, 229], [452, 288]], { w: 6 }), line([[600, 229], [648, 170]], { w: 6 }), line([[600, 229], [648, 288]], { w: 6 }),
      t(436, 160, 'Br', { size: 32 }), t(440, 318, 'H', { size: 32 }), t(664, 160, 'Cl', { size: 32 }), t(660, 318, 'H', { size: 32 }),
      step(1, t(238, 150, '1', { size: 30, c: 'rose', a: 's' }), t(350, 340, '2', { size: 30, c: 'rose', a: 's' }), t(54, 340, '3', { size: 30, c: 'rose', a: 'e' }), t(98, 198, '4', { size: 28, c: 'mute', a: 'e' })),
      step(2, t(200, 430, 'lowest (H) points away', { size: 27, c: 'blue' })),
      step(3, arrow(246, 176, 312, 288, { c: 'green', w: 5, bend: -34 }), arrow(280, 372, 122, 372, { c: 'green', w: 5, bend: -30 }), hi(120, 452, 160, 44, { c: 'gold' }), t(200, 486, 'clockwise: R', { size: 32, c: 'green' })),
      step(4, hi(410, 138, 60, 30, { c: 'gold' }), hi(636, 138, 60, 30, { c: 'gold' }), t(550, 400, 'same side: Z', { size: 32, c: 'purple' }), t(550, 440, 'opposite: E', { size: 28, c: 'purple' })),
      step(5, t(550, 510, 'n centers: up to 2^{n}', { size: 27, c: 'goldInk' }))
    ),
    predict: { q: 'Which group on this carbon gets priority 1?', choices: ['F', 'Cl', 'Br', 'H'], answer: 2, why: 'Priority follows atomic number. Bromine (35) beats chlorine (17), fluorine (9) and hydrogen (1).' },
    steps: [
      'Rank the four groups on the stereocenter by atomic number of the attached atom: highest is 1. On a tie, move out to the next atoms.',
      'Turn the molecule so the lowest priority group (4) points away from you. Here H is already on the dashed bond, going back.',
      'Trace 1 to 2 to 3. Clockwise is R. Counterclockwise is S. If group 4 points toward you instead, take the opposite of what you see.',
      'Double bonds: on each carbon pick the higher priority group. Same side is Z (together). Opposite sides is E.',
      'A molecule with n stereocenters has up to 2^{n} stereoisomers. Mirror images that do not superimpose are enantiomers. Stereoisomers that are not mirror images are diastereomers. A meso compound has stereocenters but an internal mirror plane, so it is achiral.'
    ],
    tryIt: [
      { q: 'You trace 1 to 2 to 3 counterclockwise, with group 4 pointing away. The center is:', choices: ['R', 'S', 'Cannot tell'], answer: 1, why: 'Counterclockwise with the lowest group in back is S.' },
      { q: 'Enantiomers differ in:', choices: ['Boiling point', 'The direction they rotate plane-polarized light', 'Molecular formula'], answer: 1, why: 'Enantiomers share every physical property except the direction they rotate plane-polarized light (and how they meet other chiral things).' },
      { q: 'A compound with 3 stereocenters and no meso form has how many stereoisomers?', choices: ['3', '6', '8'], answer: 2, why: '2^{3} = 8.' }
    ],
    path: { title: 'Assign R or S', steps: ['Find the carbon with four different groups', 'Rank the groups by atomic number', 'Break ties by moving outward', 'Point the lowest priority group away', 'Trace 1 to 2 to 3', 'Clockwise is R, counterclockwise is S'] },
    more: [{ label: 'Chirality game', href: '/games/chirality/' }]
  });

  /* ---------- Acids and bases: the pKa ladder ---------- */
  var LAD = [['HCl', '−7'], ['H_{3}O^{+}', '−1.7'], ['RCOOH', '5'], ['phenol', '10'], ['H_{2}O', '15.7'], ['ROH', '16'], ['alkyne C-H', '25'], ['NH_{3}', '38'], ['alkane C-H', '50']];
  B.add({
    id: 'pka-ladder', section: 'ochem', title: 'The pK_{a} ladder',
    sub: 'Nine rungs that settle most acid-base questions.',
    svg: K.svg(
      line([[150, 44], [150, 530]], { w: 5 }),
      LAD.map(function (r, i) { var y = 70 + i * 55; return line([[136, y], [164, y]], { w: 4 }) + t(180, y + 10, r[0], { size: 28, a: 's' }); }).join(''),
      step(1, LAD.map(function (r, i) { return t(124, 80 + i * 55, r[1], { size: 28, c: 'rose', a: 'e' }); }).join('')),
      step(2, arrow(400, 500, 400, 70, { c: 'rose', w: 6 }), t(550, 100, 'low pK_{a}:', { size: 28, c: 'rose' }), t(550, 136, 'stronger acid', { size: 28, c: 'rose' })),
      step(3, t(550, 220, 'reactions run toward', { size: 26, c: 'blue' }), t(550, 254, 'the higher pK_{a}', { size: 28, c: 'blue' })),
      step(4, t(550, 336, 'A: atom', { size: 30, c: 'goldInk' }), t(550, 378, 'R: resonance', { size: 30, c: 'goldInk' }), t(550, 420, 'I: induction', { size: 30, c: 'goldInk' }), t(550, 462, 'O: orbital', { size: 30, c: 'goldInk' }))
    ),
    predict: { q: 'Which is the stronger acid: acetic acid (a carboxylic acid) or ethanol (an alcohol)?', choices: ['Acetic acid', 'Ethanol', 'About equal'], answer: 0, why: 'Acetic acid has pK_{a} about 5 and ethanol about 16. Acetate is stabilized by resonance over two oxygens.' },
    steps: [
      'Know these rungs: strong mineral acids below zero, carboxylic acids about 5, phenols about 10, water and alcohols about 16, terminal alkynes 25, amines about 38, alkanes about 50.',
      'Lower pK_{a} means a stronger acid, which means a more stable conjugate base. Each rung is a factor of ten.',
      'An acid-base reaction favors the side with the weaker acid, the one with the higher pK_{a}. A base can only fully deprotonate acids below its own conjugate acid on the ladder.',
      'To compare two acids, compare their conjugate bases with ARIO. Atom: bigger or more electronegative holds charge better. Resonance spreads it out. Induction: nearby electron-withdrawing groups help. Orbital: more s character helps (sp beats sp^{2} beats sp^{3}).'
    ],
    tryIt: [
      { q: 'Can hydroxide (conjugate acid H_{2}O, pK_{a} 15.7) fully deprotonate a terminal alkyne (pK_{a} 25)?', choices: ['Yes', 'No'], answer: 1, why: 'The reaction would make the stronger acid (water) from the weaker one. You need a stronger base, such as NaNH_{2}.' },
      { q: 'Which is more acidic?', choices: ['CH_{3}COOH', 'CF_{3}COOH'], answer: 1, why: 'Three fluorines pull electron density away and stabilize the conjugate base: induction.' },
      { q: 'Why is phenol (pK_{a} 10) more acidic than cyclohexanol (pK_{a} 16)?', choices: ['Resonance in the conjugate base', 'A bigger atom holds the charge', 'More s character'], answer: 0, why: 'Phenoxide spreads its negative charge into the ring. The charge in cyclohexanol\'s conjugate base is stuck on oxygen.' }
    ],
    flick: {
      title: 'Acidity', up: 'More acidic', down: 'Less acidic',
      cards: [
        { q: 'Add a fluorine next to the acidic group', up: true, why: 'Induction: fluorine pulls electron density and stabilizes the conjugate base.' },
        { q: 'Move the chlorine farther from the COOH', up: false, why: 'Induction fades with distance.' },
        { q: 'The conjugate base gains a resonance structure', up: true, why: 'Spreading the charge stabilizes the base, so the acid is stronger.' },
        { q: 'Switch the acidic atom from O to S (same group, bigger atom)', up: true, why: 'A larger atom spreads the negative charge over more volume.' },
        { q: 'Switch the C-H from sp^{3} carbon to sp carbon', up: true, why: 'More s character holds the lone pair closer to the nucleus.' },
        { q: 'Add an electron-donating alkyl group near the acidic H', up: false, why: 'Donating groups destabilize the negative charge.' },
        { q: 'Switch the acidic atom from N to O (same row)', up: true, why: 'Oxygen is more electronegative and handles the negative charge better.' },
        { q: 'Go from cyclohexanol to phenol', up: true, why: 'Phenoxide is stabilized by resonance into the ring.' },
        { q: 'pK_{a} changes from 5 to 16', up: false, why: 'Higher pK_{a} is a weaker acid.' },
        { q: 'Add a nitro group para to the OH of phenol', up: true, why: 'Nitro withdraws by resonance and stabilizes the phenoxide.' },
        { q: 'Go from a carboxylic acid to an alcohol', up: false, why: 'The alkoxide has no resonance. pK_{a} rises from about 5 to about 16.' },
        { q: 'The conjugate base becomes less stable', up: false, why: 'A less stable conjugate base means a weaker acid.' },
        { q: 'Go from ethane to ethyne (acetylene)', up: true, why: 'sp carbon: pK_{a} drops from about 50 to 25.' }
      ]
    },
    more: [{ label: 'Acids, bases and the titration curve', href: '/see/?b=acid-base' }, { label: 'Acid-base cardio', href: '/tools/ochem/#acid-base-cardio' }]
  });

  /* ---------- Spectroscopy ---------- */
  var WX = function (wn) { return 60 + (4000 - wn) / 3500 * 600; };
  B.add({
    id: 'spectroscopy', section: 'ochem', title: 'IR and NMR: reading the peaks',
    sub: 'IR tells you the functional group. NMR tells you the hydrogens.',
    svg: K.svg(
      line([[60, 340], [670, 340]], { w: 4 }), [4000, 3000, 2000, 1000].map(function (w) { return line([[WX(w), 332], [WX(w), 348]], { w: 3.5 }) + t(WX(w) + (w === 4000 ? 14 : 0), 378, String(w), { size: 26, c: 'mute' }); }).join(''),
      curve([[60, 84], [100, 86], [124, 120], [150, 190], [180, 196], [206, 130], [224, 88], [234, 90], [240, 168], [247, 92], [300, 84], [362, 86], [369, 138], [376, 86], [440, 84], [448, 110], [453, 276], [459, 108], [470, 86], [500, 90], [512, 170], [524, 110], [540, 200], [556, 120], [574, 230], [590, 140], [610, 190], [630, 110], [660, 96]], { w: 4.5 }),
      t(590, 300, 'fingerprint', { size: 26, c: 'mute' }),
      step(1, t(150, 236, 'O-H 3300', { size: 27, c: 'blue' }), t(150, 268, 'broad', { size: 27, c: 'blue' })),
      step(2, t(256, 300, 'C-H 3000', { size: 27, c: 'green' })),
      step(3, t(350, 190, 'triple', { size: 27, c: 'purple' }), t(350, 222, '2200', { size: 27, c: 'purple' })),
      step(4, hi(400, 290, 110, 34, { c: 'gold' }), t(455, 316, 'C=O 1700', { size: 27, c: 'rose' })),
      step(5, t(360, 436, 'NMR: one signal per kind of H', { size: 28 }), t(360, 478, 'n neighbors split it into n + 1', { size: 27, c: 'goldInk' }), t(360, 520, 'aromatic H: 7 to 8      CHO: 9 to 10', { size: 27, c: 'teal' }))
    ),
    predict: { q: 'A strong, sharp IR peak near 1700 cm^{−1} means the molecule has a:', choices: ['Carbonyl (C=O)', 'Hydroxyl (O-H)', 'Triple bond'], answer: 0, why: 'The C=O stretch near 1700 is the most recognizable peak in IR: strong and sharp.' },
    steps: [
      'O-H shows up as a broad trough around 3200 to 3600. N-H is in the same place but sharper. A carboxylic acid O-H is very broad, 2500 to 3300.',
      'C-H stretches sit right around 3000: just below for sp^{3} carbon, just above for sp^{2}.',
      'Triple bonds, C≡C and C≡N, absorb around 2100 to 2260. Little else shows up there.',
      'C=O is the strong sharp peak near 1700. C=C is weaker, near 1650. Below 1500 is the fingerprint region: unique, but hard to read.',
      'Proton NMR in four ideas: the number of signals is the number of different kinds of H. The area is how many H. The splitting is neighbors plus one. The shift tells the environment: alkyl 1 to 2, next to O 3 to 4, aromatic 7 to 8, aldehyde 9 to 10, acid 10 to 12 ppm.'
    ],
    tryIt: [
      { q: 'An IR spectrum has a broad peak at 3350 and no peak near 1700. The compound is most likely:', choices: ['A ketone', 'An alcohol', 'An alkane'], answer: 1, why: 'Broad at 3350 is O-H. No C=O rules out an acid, so it is an alcohol.' },
      { q: 'In CH_{3}CH_{2}Br, the CH_{3} signal is split into a:', choices: ['Singlet', 'Triplet', 'Quartet'], answer: 1, why: 'The CH_{3} has two neighbors on the CH_{2}. n + 1 = 3: a triplet.' },
      { q: 'How many proton NMR signals does acetone, CH_{3}COCH_{3}, show?', choices: ['1', '2', '6'], answer: 0, why: 'All six hydrogens are equivalent by symmetry, so there is one signal.' }
    ],
    path: { title: 'Read an IR spectrum', steps: ['Look near 1700 for C=O', 'Look at 3200 to 3600 for O-H or N-H', 'Check whether that peak is broad or sharp', 'Look near 2200 for a triple bond', 'Check just above 3000 for sp^{2} C-H', 'Ignore the fingerprint region'] },
    more: [{ label: 'Spectroscopy trainer', href: '/tools/ochem/#spec-trainer' }]
  });

  /* ---------- Alkene reaction map ---------- */
  function spoke(x, y, r1, r2, col) { return t(x, y, r1, { size: 28, c: col }) + t(x, y + 34, r2, { size: 26 }); }
  B.add({
    id: 'alkene-map', section: 'ochem', title: 'Alkene reactions: one map',
    sub: 'Every arrow adds across the double bond. Ask where, and which face.',
    svg: K.svg(
      box(280, 236, 160, 70, { w: 5, c: 'ink', fill: 'gold', op: 0.25 }), t(360, 284, 'C = C', { size: 38 }),
      arrow(290, 232, 180, 150, { w: 4 }), arrow(360, 230, 360, 150, { w: 4 }), arrow(430, 232, 540, 150, { w: 4 }),
      arrow(290, 310, 180, 386, { w: 4 }), arrow(360, 312, 360, 404, { w: 4 }), arrow(430, 310, 540, 386, { w: 4 }),
      step(1, spoke(130, 100, 'HBr', 'Markovnikov', 'rose')),
      step(2, spoke(360, 100, 'H_{3}O^{+}', 'Mark. alcohol', 'blue'), spoke(590, 100, 'BH_{3}, H_{2}O_{2}', 'anti-Mark., syn', 'blue')),
      step(3, spoke(130, 420, 'Br_{2}', 'anti dibromide', 'purple'), spoke(360, 440, 'H_{2}, Pd', 'syn: alkane', 'purple')),
      step(4, spoke(590, 420, 'O_{3}', 'cut: two C=O', 'green')),
      step(5, t(360, 534, 'alkyne:  Lindlar → cis      Na, NH_{3} → trans', { size: 27, c: 'goldInk' }))
    ),
    predict: { q: 'HBr adds to propene. Where does the Br end up?', choices: ['On the end carbon (CH_{2})', 'On the middle carbon', 'Equal mix of both'], answer: 1, why: 'Markovnikov: H adds to the carbon that already has more hydrogens, so the Br goes on the more substituted carbon, through the more stable carbocation.' },
    steps: [
      'HX: the H goes to the carbon with more hydrogens and the halide goes to the more substituted carbon. That is Markovnikov, and it runs through the more stable carbocation, so watch for rearrangements.',
      'Two ways to an alcohol. Acid and water gives the Markovnikov alcohol. Hydroboration then oxidation gives the anti-Markovnikov alcohol, with H and OH added to the same face (syn).',
      'Br_{2} adds one Br to each carbon from opposite faces (anti), through a bromonium ion. H_{2} with a metal catalyst adds both hydrogens to the same face (syn).',
      'Ozonolysis cuts the double bond in two and caps each carbon with an oxygen: two carbonyls.',
      'Alkynes can stop at the alkene. H_{2} with Lindlar catalyst gives the cis alkene. Sodium in liquid ammonia gives the trans alkene.'
    ],
    tryIt: [
      { q: '1-methylcyclohexene with BH_{3} then H_{2}O_{2}, NaOH. The OH ends up on:', choices: ['The carbon bearing the methyl', 'The less substituted alkene carbon', 'Both carbons'], answer: 1, why: 'Hydroboration is anti-Markovnikov: the OH goes on the less substituted carbon.' },
      { q: 'Br_{2} adds to cyclohexene. The two Br atoms are:', choices: ['Cis', 'Trans', 'On the same carbon'], answer: 1, why: 'Anti addition: the second bromine attacks the bromonium ion from the opposite face, so they end up trans.' },
      { q: 'Ozonolysis of 2-butene (then a reductive workup) gives:', choices: ['Two molecules of acetaldehyde', 'One molecule of butanal', 'Butane-2,3-diol'], answer: 0, why: 'Cut CH_{3}CH=CHCH_{3} in the middle and cap each end with O: two CH_{3}CHO.' }
    ],
    path: { title: 'Predict an alkene addition product', steps: ['Find the two alkene carbons', 'Identify what the reagent adds', 'Decide which carbon gets which piece: Markovnikov or anti', 'Check for a carbocation that could rearrange', 'Decide the faces: syn or anti', 'Draw the product with stereochemistry'] },
    more: [{ label: 'SN1, SN2, E1 or E2', href: '/see/?b=sn-e-decide' }, { label: 'Reaction wheels', href: '/tools/ochem/?game=wheel' }]
  });

  /* ---------- Carbonyl reactions ---------- */
  B.add({
    id: 'carbonyl', section: 'ochem', title: 'Carbonyls: one attack, two endings',
    sub: 'The carbon is electron-poor. Everything follows from that.',
    svg: K.svg(
      t(130, 274, 'C', { size: 38 }), line([[122, 232], [122, 170]], { w: 6 }), line([[138, 232], [138, 170]], { w: 6 }), t(130, 154, 'O', { size: 38 }),
      line([[112, 280], [66, 320]], { w: 6 }), t(50, 350, 'R', { size: 34 }), line([[148, 280], [194, 320]], { w: 6 }), t(210, 350, 'Z', { size: 34 }),
      arrow(250, 262, 336, 262, { w: 5 }),
      t(440, 274, 'C', { size: 38 }), line([[440, 232], [440, 170]], { w: 6 }), t(440, 154, 'O', { size: 38 }),
      line([[422, 280], [376, 320]], { w: 6 }), t(360, 350, 'R', { size: 34 }), line([[458, 280], [504, 320]], { w: 6 }), t(520, 350, 'Z', { size: 34 }), line([[440, 286], [440, 336]], { w: 6 }),
      step(1, t(176, 262, 'δ+', { size: 30, c: 'rose' }), t(176, 150, 'δ−', { size: 30, c: 'blue' })),
      step(2, t(44, 216, 'Nu:', { size: 32, c: 'purple' }), arrow(70, 220, 112, 252, { c: 'purple', w: 4.5 }), t(440, 370, 'Nu', { size: 32, c: 'purple' }), t(476, 142, '−', { size: 34, c: 'blue' })),
      step(3, arrow(540, 222, 604, 164, { c: 'green', w: 5 }), t(610, 96, 'nothing leaves:', { size: 26, c: 'green' }), t(610, 132, 'add H^{+}, alcohol', { size: 26, c: 'green' })),
      step(4, arrow(540, 300, 604, 360, { c: 'rose', w: 5 }), t(626, 400, 'Z leaves,', { size: 27, c: 'rose' }), t(626, 434, 'C=O returns', { size: 27, c: 'rose' })),
      step(5, t(360, 520, 'acid chloride > anhydride > ester > amide', { size: 28, c: 'goldInk' }))
    ),
    predict: { q: 'A nucleophile attacks a carbonyl group. Which atom does it bond to?', choices: ['The oxygen', 'The carbon', 'Either one'], answer: 1, why: 'Oxygen pulls the shared electrons toward itself, leaving the carbon partially positive. Nucleophiles go to the carbon.' },
    steps: [
      'Oxygen is more electronegative, so the C=O carbon carries a partial positive charge and the oxygen a partial negative.',
      'The nucleophile attacks the carbon. The pi electrons move up onto oxygen, giving a tetrahedral intermediate with O^{−}.',
      'Aldehydes and ketones have no leaving group (H and R do not leave). The O^{−} picks up a proton: an alcohol. That is nucleophilic addition, as with NaBH_{4} or a Grignard reagent.',
      'Acid derivatives carry a leaving group Z (Cl, OR, NH_{2}). The O^{−} reforms the C=O and pushes Z out. That is nucleophilic acyl substitution.',
      'Reactivity follows the leaving group: acid chlorides are the most reactive, then anhydrides, then esters and acids, with amides last. You can go down this list easily, not up.'
    ],
    tryIt: [
      { q: 'NaBH_{4} reduces a ketone to a:', choices: ['Primary alcohol', 'Secondary alcohol', 'Carboxylic acid'], answer: 1, why: 'Hydride adds to the carbonyl carbon, which already has two carbon groups, so the product is a secondary alcohol.' },
      { q: 'Which is the most reactive toward a nucleophile?', choices: ['An amide', 'An ester', 'An acid chloride'], answer: 2, why: 'Chloride is the best leaving group of the three, and it donates the least by resonance.' },
      { q: 'An ester reacts with water and acid to give:', choices: ['A carboxylic acid and an alcohol', 'Two alcohols', 'An aldehyde and an alcohol'], answer: 0, why: 'Hydrolysis is acyl substitution with water as the nucleophile: the OR leaves as an alcohol.' }
    ],
    path: { title: 'Nucleophilic acyl substitution', steps: ['Nucleophile attacks the carbonyl carbon', 'Pi electrons move up to oxygen', 'Tetrahedral intermediate forms', 'Oxygen pushes its electrons back down', 'The leaving group departs', 'C=O is restored with the new group attached'] },
    more: [{ label: 'Enolates and the alpha carbon', href: '/see/?b=enolates' }, { label: 'Reaction wheels', href: '/tools/ochem/?game=wheel' }]
  });

  /* ---------- Synthesis roadmap ---------- */
  function node(x, y, s, col) { return box(x - 82, y - 32, 164, 64, { w: 5, c: col || 'ink' }) + t(x, y + 11, s, { size: 30 }); }
  B.add({
    id: 'synthesis', section: 'ochem', title: 'Synthesis roadmap: getting from A to B',
    sub: 'Six stations. Know the trains between them.',
    svg: K.svg(
      node(110, 96, 'alkane'), node(360, 96, 'R-X'), node(610, 96, 'alkene'), node(360, 280, 'alcohol', 'blue'), node(170, 464, 'C=O', 'rose'), node(550, 464, 'acid', 'rose'),
      arrow(196, 96, 272, 96, { w: 4.5 }), arrow(446, 96, 522, 96, { w: 4.5 }), arrow(360, 132, 360, 242, { w: 4.5 }), arrow(590, 132, 448, 258, { w: 4.5 }), arrow(320, 316, 214, 426, { w: 4.5 }), arrow(400, 316, 506, 426, { w: 4.5 }),
      step(1, t(234, 46, 'Br_{2}, light', { size: 27, c: 'purple' })),
      step(2, t(484, 46, 'base: E2', { size: 27, c: 'green' }), t(346, 196, 'OH^{−}: S_{N}2', { size: 26, c: 'green', a: 'e' })),
      step(3, t(548, 218, 'H_{3}O^{+}', { size: 28, c: 'blue', a: 's' })),
      step(4, t(246, 372, 'PCC', { size: 28, c: 'rose', a: 'e' }), t(474, 372, 'CrO_{3}', { size: 28, c: 'rose', a: 's' })),
      step(5, hi(120, 508, 480, 36, { c: 'gold' }), t(360, 536, 'RMgBr + C=O: new C-C bond', { size: 28 }))
    ),
    predict: { q: 'You have a primary alcohol and want the aldehyde, without going on to the acid. Which reagent?', choices: ['PCC', 'CrO_{3}, H_{2}SO_{4}, water', 'NaBH_{4}'], answer: 0, why: 'PCC is a mild oxidant that stops at the aldehyde. Chromic acid in water continues to the carboxylic acid. NaBH_{4} is a reducing agent.' },
    steps: [
      'Alkanes are unreactive. The way in is free radical halogenation: Br_{2} and light put a bromine on the most substituted carbon.',
      'An alkyl halide is the hub. A strong bulky base eliminates to the alkene (E2). A good nucleophile such as hydroxide substitutes (S_{N}2) on a primary or methyl carbon.',
      'Alkenes and alcohols interconvert: add water with acid to hydrate, or heat an alcohol with concentrated acid to dehydrate.',
      'Oxidation climbs the ladder. PCC takes a primary alcohol to an aldehyde and a secondary alcohol to a ketone. Chromic acid takes a primary alcohol all the way to the carboxylic acid. Hydride reagents climb back down.',
      'To build a bigger skeleton you need a new carbon to carbon bond. A Grignard reagent adds its carbon to a carbonyl and gives an alcohol. Plan backward from the product: retrosynthesis.'
    ],
    tryIt: [
      { q: 'Which reagent turns a secondary alcohol into a ketone?', choices: ['PCC', 'NaBH_{4}', 'HBr'], answer: 0, why: 'PCC oxidizes a secondary alcohol to a ketone. NaBH_{4} would do the reverse.' },
      { q: 'A Grignard reagent adds to formaldehyde (H_{2}C=O). After acid workup you get a:', choices: ['Primary alcohol', 'Secondary alcohol', 'Tertiary alcohol'], answer: 0, why: 'Formaldehyde gives a primary alcohol. Other aldehydes give secondary, and ketones give tertiary.' },
      { q: 'To convert 2-bromopropane to propene, use:', choices: ['Water', 'A strong base such as potassium tert-butoxide', 'PCC'], answer: 1, why: 'A strong, bulky base favors E2 elimination to the alkene.' }
    ],
    path: { title: 'Plan a synthesis', steps: ['Compare the carbon skeletons of start and target', 'Decide whether a new C-C bond is needed', 'Identify the functional group in the target', 'Work backward one step at a time', 'Check each step for selectivity', 'Write the route forward with reagents'] },
    more: [{ label: 'Alkene reactions: one map', href: '/see/?b=alkene-map' }, { label: 'Carbonyls: one attack, two endings', href: '/see/?b=carbonyl' }]
  });
})(typeof window !== 'undefined' ? window.AceBoard : (typeof require === 'function' ? require('../ace-board.js') : null));
