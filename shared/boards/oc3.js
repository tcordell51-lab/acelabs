/* boards/oc3.js : Organic Chemistry whiteboards, set three: the Chalk Talks boards (shared/ace-board.js draws them).
   Shapes first (hybrids, Newman, chairs, backside and anti), then the functional groups that had no board
   (alkynes, alcohols and ethers, amines), arrow pushing and aromaticity. Numbers follow OpenStax Organic Chemistry.
   Boards with a 3D model link to it (/oc/models/), where the same molecule sits beside its line drawing. */
(function (B) {
  'use strict';
  if (!B) return;
  var K = B.kit, t = K.t, line = K.line, arrow = K.arrow, box = K.box, circ = K.circ, step = K.step, hi = K.hi, dot = K.dot;
  function wedge(x1, y1, x2, y2, c) { var dx = x2 - x1, dy = y2 - y1, l = Math.sqrt(dx * dx + dy * dy), nx = -dy / l * 9, ny = dx / l * 9; return K.path('M' + x1 + ' ' + y1 + ' L' + (x2 + nx) + ' ' + (y2 + ny) + ' L' + (x2 - nx) + ' ' + (y2 - ny) + ' Z', { w: 3, fill: c || 'ink', op: 1, c: c }); }
  function dash(x1, y1, x2, y2, c) { return line([[x1, y1], [x2, y2]], { w: 5, dash: '3 9', c: c }); }
  function tick(x, y, c) { return line([[x, y], [x + 12, y + 14], [x + 34, y - 18]], { w: 6, c: c || 'green' }); }
  function hex(cx, cy, r, o) { var p = []; for (var i = 0; i <= 6; i++) p.push([Math.round(cx + r * Math.cos((i * 60 - 30) * Math.PI / 180)), Math.round(cy + r * Math.sin((i * 60 - 30) * Math.PI / 180))]); return line(p, o || { w: 6 }); }
  var M3 = function (id, label) { return { label: label || 'Turn it in 3D', href: '/oc/models/?m=' + id }; };

  /* ---------- Hybridization ---------- */
  var HX = [130, 360, 590];
  B.add({
    id: 'hybridization', section: 'ochem', title: 'sp, sp2, sp3: count the groups',
    sub: 'Count what is attached to the atom. The number gives the hybrid, the shape and the angle.',
    svg: K.svg(
      t(130, 150, 'C', { size: 40 }), line([[130, 112], [130, 62]], { w: 6 }), line([[112, 152], [66, 178]], { w: 6 }), wedge(146, 150, 196, 184), dash(150, 132, 204, 112),
      t(360, 150, 'C', { size: 40 }), line([[382, 130], [440, 130]], { w: 6 }), line([[382, 146], [440, 146]], { w: 6 }), line([[342, 122], [304, 76]], { w: 6 }), line([[342, 152], [304, 196]], { w: 6 }),
      t(590, 150, 'C', { size: 40 }), line([[612, 122], [668, 122]], { w: 5 }), line([[612, 138], [668, 138]], { w: 5 }), line([[612, 154], [668, 154]], { w: 5 }), line([[568, 138], [512, 138]], { w: 6 }),
      line([[244, 40], [244, 470]], { w: 3, c: 'mute' }), line([[476, 40], [476, 470]], { w: 3, c: 'mute' }),
      step(1, t(HX[0], 262, '4 groups', { size: 30, c: 'blue' }), t(HX[1], 262, '3 groups', { size: 30, c: 'blue' }), t(HX[2], 262, '2 groups', { size: 30, c: 'blue' })),
      step(2, t(HX[0], 322, 'sp^{3}', { size: 48, c: 'rose' }), t(HX[1], 322, 'sp^{2}', { size: 48, c: 'rose' }), t(HX[2], 322, 'sp', { size: 48, c: 'rose' })),
      step(3, t(HX[0], 376, '109.5°', { size: 32, c: 'green' }), t(HX[1], 376, '120°', { size: 32, c: 'green' }), t(HX[2], 376, '180°', { size: 32, c: 'green' }),
        t(HX[0], 412, 'tetrahedral', { size: 26, c: 'mute' }), t(HX[1], 412, 'flat', { size: 26, c: 'mute' }), t(HX[2], 412, 'linear', { size: 26, c: 'mute' })),
      step(4, t(HX[0], 458, 'no π bond', { size: 28, c: 'purple' }), t(HX[1], 458, '1 π bond', { size: 28, c: 'purple' }), t(HX[2], 458, '2 π bonds', { size: 28, c: 'purple' })),
      step(5, hi(70, 498, 580, 34, { c: 'gold', op: 0.3 }), t(360, 524, 'more s: shorter, stronger, more acidic C-H', { size: 27 }))
    ),
    predict: { q: 'How many electron groups sit on each carbon of ethene, H_{2}C=CH_{2}?', choices: ['2', '3', '4'], answer: 1, why: 'Two C-H bonds and one double bond. A double bond counts as one group, so each carbon has three.' },
    steps: [
      'Count the electron groups on the atom: every atom attached to it counts once (a double or triple bond is still one group), and every lone pair counts once.',
      'Four groups is sp^{3}. Three groups is sp^{2}. Two groups is sp. The exponents add up to the number of groups minus one.',
      'The groups get as far apart as they can: 109.5° in a tetrahedron, 120° in a flat triangle, 180° in a line.',
      'Each p orbital left out of the hybrid makes one π bond. sp^{2} has one p left: a double bond that cannot rotate. sp has two: a triple bond.',
      'An sp orbital is 50% s, sp^{2} is 33%, sp^{3} is 25%. More s character holds the electrons closer, so the bond is shorter and stronger and the C-H is more acidic: ethyne (pK_{a} about 25) beats ethene (44) and ethane (50).'
    ],
    tryIt: [
      { q: 'The carbon in CO_{2} (O=C=O) is:', choices: ['sp', 'sp^{2}', 'sp^{3}'], answer: 0, why: 'Two groups on carbon, the two oxygens. Two groups is sp, linear, 180°.' },
      { q: 'The nitrogen in NH_{3} has three bonds and one lone pair. It is:', choices: ['sp', 'sp^{2}', 'sp^{3}'], answer: 2, why: 'A lone pair counts as a group: 3 + 1 = 4 groups, sp^{3}. The lone pair squeezes the angle to about 107°.' },
      { q: 'Which C-H bond is the most acidic?', choices: ['Ethane, sp^{3}', 'Ethene, sp^{2}', 'Ethyne, sp'], answer: 2, why: 'The sp carbon has the most s character, so it holds the leftover electron pair best. pK_{a} about 25.' }
    ],
    path: { title: 'Find the hybridization of an atom', steps: ['Draw the Lewis structure', 'Count the atoms attached to it', 'Add its lone pairs', 'Four groups is sp3, three is sp2, two is sp', 'Read the shape and the angle from the hybrid'] },
    more: [M3('hybrid')]
  });

  /* ---------- Arrow pushing ---------- */
  B.add({
    id: 'arrow-pushing', section: 'ochem', title: 'Curved arrows: electrons move, atoms follow',
    sub: 'Every mechanism is the same move: an electron pair goes from where it is rich to where it is poor.',
    svg: K.svg(
      t(120, 214, 'HO', { size: 44 }), t(170, 190, '−', { size: 34 }), dot(108, 162, 5), dot(126, 162, 5),
      t(372, 214, 'H_{3}C', { size: 44 }), line([[430, 200], [516, 200]], { w: 6 }), t(556, 214, 'Br', { size: 44 }),
      step(1, t(120, 268, 'rich', { size: 30, c: 'green' }), t(120, 300, 'nucleophile', { size: 26, c: 'green' }), t(388, 268, 'poor', { size: 30, c: 'rose' }), t(388, 300, 'electrophile', { size: 26, c: 'rose' }), t(408, 160, 'δ+', { size: 28, c: 'rose' }), t(560, 268, 'δ−', { size: 28, c: 'blue' })),
      step(2, arrow(134, 150, 382, 168, { c: 'green', w: 5, bend: -52 }), t(250, 76, 'tail on the electrons', { size: 26, c: 'green' })),
      step(3, arrow(476, 192, 566, 172, { c: 'blue', w: 5, bend: -34 }), t(600, 110, 'bond pair', { size: 26, c: 'blue' }), t(600, 140, 'leaves with Br', { size: 26, c: 'blue' })),
      step(4, line([[60, 344], [660, 344]], { w: 3, c: 'mute' }), t(250, 418, 'HO-CH_{3}', { size: 44 }), t(416, 418, '+', { size: 36, c: 'mute' }), t(520, 418, 'Br', { size: 44 }), t(560, 394, '−', { size: 34 }), t(360, 462, 'charge before = charge after', { size: 26, c: 'goldInk' })),
      step(5, hi(80, 500, 560, 34, { c: 'gold', op: 0.3 }), t(360, 526, 'never start an arrow at H^{+} or a + charge', { size: 27 }))
    ),
    predict: { q: 'A curved arrow always starts at:', choices: ['An atom with a positive charge', 'A pair of electrons: a lone pair or a bond', 'A hydrogen atom'], answer: 1, why: 'Arrows show electrons moving. The tail sits on the electrons, and the head points to where they go.' },
    steps: [
      'Find the two players. The nucleophile is electron rich: a lone pair, a negative charge or a π bond. The electrophile is electron poor: here the carbon, because bromine pulls the bond toward itself.',
      'The first arrow starts on the lone pair of oxygen and ends at the carbon. A full arrowhead moves two electrons and makes the new O-C bond.',
      'Carbon cannot hold five bonds, so a second arrow moves the C-Br bonding pair onto bromine. The bond breaks and bromide leaves.',
      'Draw what the arrows made: methanol and bromide. Check the charges: one minus before, one minus after. If the totals differ, an arrow is wrong.',
      'Protons and positive atoms have no electrons to give, so an arrow never starts there. Draw the arrow from the base to the H^{+}, not from the H^{+} to the base.'
    ],
    tryIt: [
      { q: 'A curved arrow with a full (double-barbed) head moves:', choices: ['One electron', 'Two electrons', 'An atom'], answer: 1, why: 'A full head is an electron pair. A half head (fishhook) is one electron, used for radicals.' },
      { q: 'Hydroxide takes the proton from H-Cl. The first arrow runs from:', choices: ['The H to the O', 'A lone pair on O to the H', 'The Cl to the H'], answer: 1, why: 'Tail on the electrons of the base, head at the proton. A second arrow then moves the H-Cl bond onto Cl.' },
      { q: 'An arrow takes a bonding pair away from a neutral carbon and puts it on the neighbor. That carbon is now:', choices: ['Negative', 'Positive', 'Still neutral'], answer: 1, why: 'It lost its share of the pair, so it has six electrons and a + charge: a carbocation.' }
    ],
    path: { title: 'Draw one mechanism step', steps: ['Find the electron-rich atom or bond', 'Find the electron-poor atom', 'Start the arrow on the electrons', 'End it where the new bond forms', 'Break a bond if an atom would pass its octet', 'Recount the formal charges'] }
  });

  /* ---------- Newman projections ---------- */
  var NX = function (p) { return Math.round(410 + p / 360 * 270); }, NY = function (e) { return Math.round(330 - e / 19 * 170); };
  var CURVE = []; for (var p = 0; p <= 360; p += 20) { var r = p * Math.PI / 180; CURVE.push([NX(p), NY(9.7667 + 2.2667 * Math.cos(r) - 0.2667 * Math.cos(2 * r) + 7.2333 * Math.cos(3 * r))]); }
  B.add({
    id: 'newman', section: 'ochem', title: 'Newman projections: staggered and eclipsed',
    sub: 'Look straight down one C-C bond of butane. Turn the back carbon and watch the energy.',
    svg: K.svg(
      line([[190, 314], [190, 356]], { w: 6, c: 'gold' }), line([[110, 164], [74, 143]], { w: 6 }), line([[270, 164], [306, 143]], { w: 6 }),
      circ(190, 210, 92, { w: 5 }), line([[190, 210], [190, 96]], { w: 6, c: 'gold' }), line([[190, 210], [92, 268]], { w: 6 }), line([[190, 210], [288, 268]], { w: 6 }), dot(190, 210, 7),
      t(190, 80, 'CH_{3}', { size: 30, c: 'goldInk' }), t(190, 392, 'CH_{3}', { size: 30, c: 'goldInk' }), t(70, 290, 'H', { size: 30 }), t(310, 290, 'H', { size: 30 }), t(56, 140, 'H', { size: 30 }), t(324, 140, 'H', { size: 30 }),
      line([[410, 150], [410, 336], [690, 336]], { w: 4, c: 'mute' }),
      step(1, K.curve(CURVE, { w: 5, c: 'blue' }), t(420, 138, 'energy', { size: 26, c: 'mute', a: 's' }), t(410, 368, '0°', { size: 26, c: 'mute' }), t(545, 368, '180°', { size: 26, c: 'mute' }), t(676, 368, '360°', { size: 26, c: 'mute' })),
      step(2, dot(NX(180), NY(0), 9, { c: 'green' }), t(420, 412, 'anti, 180°: 0 kJ/mol', { size: 27, c: 'green', a: 's' })),
      step(3, dot(NX(60), NY(3.8), 9, { c: 'purple' }), dot(NX(300), NY(3.8), 9, { c: 'purple' }), t(420, 446, 'gauche, 60°: 3.8', { size: 27, c: 'purple', a: 's' })),
      step(4, dot(NX(120), NY(16), 9, { c: 'orange' }), dot(NX(240), NY(16), 9, { c: 'orange' }), dot(NX(0), NY(19), 9, { c: 'rose' }), dot(NX(360), NY(19), 9, { c: 'rose' }),
        t(420, 480, 'eclipsed, 120°: 16', { size: 27, c: 'orange', a: 's' }), t(420, 514, 'CH_{3} on CH_{3}, 0°: 19', { size: 27, c: 'rose', a: 's' })),
      step(5, hi(40, 452, 300, 34, { c: 'gold', op: 0.3 }), t(190, 478, 'staggered wins', { size: 28 }), t(190, 520, 'big groups go anti', { size: 28, c: 'goldInk' }))
    ),
    predict: { q: 'Which conformation of butane is lowest in energy?', choices: ['Methyls eclipsed', 'Gauche', 'Anti'], answer: 2, why: 'Anti is staggered and puts the two methyls 180° apart, as far from each other as they can get.' },
    steps: [
      'The dot is the front carbon and the circle is the back carbon. Turning the back carbon through 360° gives this energy curve: three valleys (staggered) and three hills (eclipsed).',
      'The drawing on the left is anti: staggered, with the methyls opposite each other. It is the lowest valley, so call it zero.',
      'Turn 120° from anti and the methyls are 60° apart: gauche. Still staggered, but the methyls bump: 3.8 kJ/mol of steric strain.',
      'The hills are eclipsed. A methyl lined up with a hydrogen costs 16 kJ/mol. Methyl lined up with methyl is the highest point, 19 kJ/mol.',
      'Two rules cover most questions: staggered is always lower than eclipsed, and among the staggered ones the biggest groups want to be anti.'
    ],
    tryIt: [
      { q: 'In a Newman projection, the circle stands for:', choices: ['The front carbon', 'The back carbon', 'A double bond'], answer: 1, why: 'The dot in the middle is the front carbon. The circle is the carbon behind it, so its bonds stop at the edge of the circle.' },
      { q: 'Gauche butane is higher in energy than anti butane because of:', choices: ['Torsional strain from eclipsed bonds', 'Steric strain between the two methyls', 'Angle strain'], answer: 1, why: 'Both are staggered, so there is no torsional strain. The methyls are close enough to crowd each other: steric strain.' },
      { q: 'Start at anti butane and turn the back carbon 60°. You reach:', choices: ['Gauche', 'An eclipsed conformation', 'Anti again'], answer: 1, why: 'Staggered and eclipsed alternate every 60°. From 180° to 120° is an eclipsed conformation, methyl over hydrogen.' }
    ],
    path: { title: 'Draw a Newman projection', steps: ['Pick the bond and look straight down it', 'Draw a dot for the front carbon', 'Add its three groups, 120° apart', 'Draw a circle for the back carbon', 'Add the back groups, staggered or eclipsed', 'Put the biggest groups anti for the lowest energy'] },
    more: [M3('newman')]
  });

  /* ---------- Chairs ---------- */
  var RA = [[269, 232], [214, 311], [125, 259], [91, 268], [146, 189], [235, 241]], AA = [[269, 175], [214, 368], [125, 201], [91, 325], [146, 132], [235, 299]], EA = [[318, 263], [232, 304], [94, 303], [42, 237], [128, 196], [266, 197]];
  var RB = [[629, 279], [574, 264], [485, 305], [451, 221], [506, 236], [595, 195]], EB0 = [678, 255];
  function ring(R, o) { return line(R.concat([R[0]]), o || { w: 6 }); }
  function bonds(R, T, o, skip) { var s = ''; for (var i = 0; i < 6; i++) if (!(skip && skip.indexOf(i) >= 0)) s += line([R[i], T[i]], o); return s; }
  B.add({
    id: 'chair-flip', section: 'ochem', title: 'Chairs: axial, equatorial and the ring flip',
    sub: 'Every ring carbon has one bond straight up or down and one out to the side.',
    svg: K.svg(
      ring(RA), ring(RB), arrow(336, 218, 420, 218, { w: 4, c: 'mute' }), arrow(420, 244, 336, 244, { w: 4, c: 'mute' }), t(378, 200, 'flip', { size: 28, c: 'mute' }),
      step(1, bonds(RA, AA, { w: 5, c: 'blue' }, [0]), t(180, 420, 'axial: straight up, down', { size: 27, c: 'blue' })),
      step(2, bonds(RA, EA, { w: 5, c: 'green' }), t(180, 456, 'equatorial: out to the side', { size: 27, c: 'green' })),
      step(3, line([RA[0], AA[0]], { w: 7, c: 'gold' }), t(286, 160, 'CH_{3}', { size: 30, c: 'goldInk' }), t(106, 200, 'H', { size: 28, c: 'rose' }), t(128, 128, 'H', { size: 28, c: 'rose' }),
        line([[150, 116], [244, 150]], { w: 4, c: 'rose', dash: '3 9' }), t(180, 78, '1,3-diaxial: +7.6 kJ/mol', { size: 27, c: 'rose' })),
      step(4, line([RB[0], EB0], { w: 7, c: 'gold' }), t(676, 240, 'CH_{3}', { size: 30, c: 'goldInk', a: 'e' }), t(545, 380, 'equatorial: about 95%', { size: 27, c: 'goldInk' }), t(545, 416, 'of the molecules', { size: 26, c: 'mute' })),
      step(5, hi(60, 498, 600, 34, { c: 'gold', op: 0.3 }), t(360, 524, 'flip: axial ↔ equatorial, up stays up', { size: 27 }))
    ),
    predict: { q: 'On a cyclohexane chair, a big group is more stable when it is:', choices: ['Axial', 'Equatorial', 'The same either way'], answer: 1, why: 'Equatorial points away from the ring. Axial points alongside two axial hydrogens on the same face and bumps into them.' },
    steps: [
      'Axial bonds point straight up or straight down, one per carbon, alternating up, down, up, down around the ring.',
      'Equatorial bonds point out to the side, roughly along the ring. Each carbon has one axial and one equatorial bond.',
      'Put a methyl in an axial spot. It sits right beside the two axial hydrogens on the same face, two carbons away. Those 1,3-diaxial interactions cost 7.6 kJ/mol.',
      'A ring flip moves the same methyl to an equatorial spot, clear of the ring. That chair is lower in energy, so about 95% of methylcyclohexane molecules sit in it. A tert-butyl group is so big that the ring is locked.',
      'In a ring flip every axial bond becomes equatorial and every equatorial bond becomes axial. A group that points up still points up. For two groups, pick the chair with the bigger one equatorial.'
    ],
    tryIt: [
      { q: 'A ring flip turns an axial group that points up into:', choices: ['Axial, pointing down', 'Equatorial, pointing up', 'Equatorial, pointing down'], answer: 1, why: 'Axial and equatorial swap. Up and down never change in a ring flip.' },
      { q: 'trans-1,2-Dimethylcyclohexane is most stable with its two methyls:', choices: ['Both axial', 'Both equatorial', 'One axial, one equatorial'], answer: 1, why: 'Trans on neighboring carbons means one up and one down, which is either both axial or both equatorial. Both equatorial wins.' },
      { q: 'cis-1,2-Dimethylcyclohexane always has:', choices: ['Both methyls equatorial', 'One methyl axial and one equatorial', 'Both methyls axial'], answer: 1, why: 'Cis on neighboring carbons means both up (or both down). On neighbors, that is one axial and one equatorial in either chair.' }
    ],
    path: { title: 'Find the more stable chair', steps: ['Draw the chair and number the ring', 'Place each group up or down from its wedge or dash', 'Mark each group axial or equatorial', 'Flip the ring: every axial becomes equatorial', 'Choose the chair with the biggest group equatorial'] },
    more: [M3('chair')]
  });

  /* ---------- SN2 and E2 shapes ---------- */
  B.add({
    id: 'sn2-e2-shape', section: 'ochem', title: 'SN2 and E2 in 3D: backside and anti',
    sub: 'Two one-step reactions, two geometry rules the DAT loves.',
    svg: K.svg(
      t(48, 204, 'HO', { size: 36 }), t(86, 182, '−', { size: 30 }), t(196, 204, 'C', { size: 40 }), line([[218, 190], [286, 190]], { w: 6 }), t(316, 204, 'Br', { size: 38 }),
      line([[186, 164], [164, 112]], { w: 6 }), wedge(180, 204, 136, 250), dash(176, 190, 130, 168),
      line([[360, 40], [360, 470]], { w: 3, c: 'mute' }), t(180, 60, 'S_{N}2', { size: 36, c: 'blue' }), t(540, 60, 'E2', { size: 36, c: 'rose' }),
      line([[470, 246], [440, 263]], { w: 6 }), line([[610, 246], [640, 263]], { w: 6 }), line([[540, 286], [540, 326]], { w: 6 }),
      circ(540, 206, 80, { w: 5 }), line([[540, 206], [540, 106]], { w: 6 }), line([[540, 206], [454, 156]], { w: 6 }), line([[540, 206], [626, 156]], { w: 6 }), dot(540, 206, 7),
      t(540, 94, 'Br', { size: 34 }), t(540, 358, 'H', { size: 34 }),
      step(1, arrow(100, 160, 180, 172, { c: 'green', w: 5, bend: -24 }), t(180, 300, 'backside: 180° from Br', { size: 26, c: 'green' })),
      step(2, arrow(252, 180, 316, 160, { c: 'blue', w: 5, bend: -26 }), t(70, 404, 'HO', { size: 34 }), line([[98, 390], [150, 390]], { w: 6 }), t(172, 404, 'C', { size: 38 }),
        line([[182, 364], [204, 312]], { w: 6 }), wedge(190, 404, 236, 446), dash(194, 390, 240, 368), t(96, 456, 'inverted', { size: 28, c: 'blue' })),
      step(3, hi(504, 70, 72, 32, { c: 'gold' }), hi(510, 334, 60, 32, { c: 'gold' }), t(540, 404, 'H and Br anti: 180°', { size: 27, c: 'rose' })),
      step(4, t(672, 344, 'B:', { size: 32, c: 'green' }), arrow(650, 340, 566, 346, { c: 'green', w: 5, bend: 18 }), t(540, 444, 'π bond forms, Br^{−} leaves', { size: 26, c: 'rose' })),
      step(5, hi(40, 498, 640, 34, { c: 'gold', op: 0.3 }), t(360, 524, 'S_{N}2 inverts.  E2 needs anti.  Both: one step.', { size: 27 }))
    ),
    predict: { q: 'In an S_{N}2 reaction, the nucleophile attacks the carbon:', choices: ['From the same side as the leaving group', 'From the side opposite the leaving group', 'From either side equally'], answer: 1, why: 'The leaving group blocks its own side. The nucleophile comes in from the back, 180° away.' },
    steps: [
      'S_{N}2: the nucleophile lines up directly behind the carbon, opposite the leaving group. That is backside attack.',
      'As the new bond forms the old one breaks, and the three other groups flip to the other side like an umbrella in the wind. A stereocenter is inverted: R goes to S when the priorities stay in the same order.',
      'E2, seen down the C-C bond: the hydrogen that leaves must sit exactly opposite the leaving group, 180° away and in the same plane. That is anti-periplanar.',
      'The base takes that hydrogen, the C-H electrons swing in to make the π bond, and bromide leaves, all in one step. Which groups end up cis or trans is set by the conformer that reacts.',
      'Both are one step with two species in the rate law. S_{N}2 is blocked by crowding (never tertiary). On a cyclohexane, E2 needs the H and the leaving group both axial.'
    ],
    tryIt: [
      { q: '(R)-2-Bromobutane reacts with HS^{−} by S_{N}2. The product is:', choices: ['(R)-butane-2-thiol', '(S)-butane-2-thiol', 'A racemic mixture'], answer: 1, why: 'Backside attack inverts the center. SH takes the top priority that Br had, so R becomes S.' },
      { q: 'For E2, the hydrogen that leaves must be at what angle to the leaving group?', choices: ['0° (syn)', '60° (gauche)', '180° (anti)'], answer: 2, why: 'Anti-periplanar: 180° apart, in one plane, so the C-H electrons can push into the back of the C-Br bond.' },
      { q: 'On a cyclohexane ring, E2 needs the leaving group and the hydrogen to be:', choices: ['Both equatorial', 'Both axial', 'One axial and one equatorial'], answer: 1, why: 'Only two axial bonds on neighboring carbons, one up and one down, are 180° apart: trans-diaxial.' }
    ],
    path: { title: 'The E2 elimination, step by step', steps: ['Find the leaving group', 'Find a hydrogen on the next carbon', 'Rotate until that hydrogen is anti to the leaving group', 'The base takes the hydrogen', 'The C-H electrons form the pi bond', 'The leaving group departs in the same step'] },
    more: [M3('sn2', 'SN2 in 3D'), M3('e2', 'E2 in 3D')]
  });

  /* ---------- a four-block reagent board, shared by the three functional-group boards ---------- */
  function blocks(head, cells) {
    var s = t(360, 78, head, { size: 46 }) + line([[30, 112], [690, 112]], { w: 4 }) + line([[360, 112], [360, 470]], { w: 3, c: 'mute' }) + line([[30, 300], [690, 300]], { w: 3, c: 'mute' });
    var X = [40, 376], Y = [150, 338], COL = ['rose', 'blue', 'green', 'purple'];
    cells.forEach(function (cell, k) {
      var x = X[k % 2], y = Y[k < 2 ? 0 : 1], g = t(x, y, cell[0], { size: 30, c: COL[k], a: 's' });
      cell.slice(1).forEach(function (l, i) { g += t(x, y + 40 + i * 36, l, { size: 26, a: 's' }); });
      s += step(k + 1, g);
    });
    return s;
  }

  /* ---------- Alkynes ---------- */
  B.add({
    id: 'alkynes', section: 'ochem', title: 'Alkynes: reduce, hydrate, extend',
    sub: 'One triple bond, four things the DAT asks you to do with it.',
    svg: K.svg(
      blocks('R-C≡C-H', [
        ['reduce', 'H_{2}, Pd/C: alkane', 'H_{2}, Lindlar: cis alkene', 'Na, NH_{3}: trans alkene'],
        ['add water', 'HgSO_{4}, H_{3}O^{+}: ketone', 'BH_{3}, then H_{2}O_{2}:', 'aldehyde'],
        ['extend the chain', 'NaNH_{2}: acetylide ion', 'then 1° R-X: new C-C'],
        ['add HX or X_{2}', '2 HX: both X on one C', '2 X_{2}: four X']
      ]),
      step(5, hi(90, 498, 540, 34, { c: 'gold', op: 0.3 }), t(360, 524, 'terminal C-H: sp carbon, pK_{a} 25', { size: 27 }))
    ),
    predict: { q: 'H_{2} with Lindlar catalyst turns an alkyne into:', choices: ['An alkane', 'A cis alkene', 'A trans alkene'], answer: 1, why: 'Lindlar catalyst is poisoned so it stops at the alkene. Both hydrogens add to the same face: cis.' },
    steps: [
      'Three reductions. H_{2} with Pd/C goes all the way to the alkane. H_{2} with Lindlar catalyst stops at the cis alkene (syn addition). Sodium in liquid ammonia gives the trans alkene.',
      'Water adds to give an enol, which turns into a carbonyl. HgSO_{4} in aqueous acid is Markovnikov: a ketone. Hydroboration then oxidation is anti-Markovnikov: a terminal alkyne gives an aldehyde.',
      'A terminal alkyne is acidic enough for NaNH_{2} to remove its proton. The acetylide ion is a strong nucleophile: with a methyl or primary alkyl halide it makes a new carbon-carbon bond by S_{N}2.',
      'HX and X_{2} add twice. Two HX put both halogens on the same carbon (Markovnikov, a geminal dihalide). Two X_{2} give a tetrahalide.',
      'Why the terminal hydrogen comes off: it sits on an sp carbon, 50% s character, pK_{a} about 25. Alkene and alkane C-H bonds (44 and 50) are far too weak as acids for NaNH_{2}.'
    ],
    tryIt: [
      { q: 'Na in liquid NH_{3} reduces 2-butyne to:', choices: ['cis-2-Butene', 'trans-2-Butene', 'Butane'], answer: 1, why: 'Dissolving-metal reduction adds the hydrogens to opposite faces: the trans alkene.' },
      { q: '1-Butyne with HgSO_{4} and aqueous H_{2}SO_{4} gives:', choices: ['Butanal', '2-Butanone', '1-Butanol'], answer: 1, why: 'Markovnikov hydration puts OH on the more substituted carbon. The enol tautomerizes to the ketone.' },
      { q: 'Which base is strong enough to deprotonate a terminal alkyne?', choices: ['NaOH', 'NaNH_{2}', 'NaHCO_{3}'], answer: 1, why: 'The conjugate acid of NH_{2}^{−} is NH_{3}, pK_{a} 38, far weaker than the alkyne (25). Water (15.7) is a stronger acid than the alkyne, so hydroxide cannot do it.' }
    ],
    path: { title: 'Extend a chain with an acetylide', steps: ['Start with a terminal alkyne', 'Add NaNH2 to remove the sp C-H', 'The acetylide ion forms', 'Add a primary alkyl halide', 'SN2 makes the new C-C bond', 'Reduce or hydrate the new alkyne as needed'] }
  });

  /* ---------- Alcohols and ethers ---------- */
  B.add({
    id: 'alcohols-ethers', section: 'ochem', title: 'Alcohols and ethers: oxidize, swap, lose water',
    sub: 'What happens to an OH depends on the carbon that holds it and the reagent you pick.',
    svg: K.svg(
      blocks('R-OH', [
        ['oxidize', '1° + PCC: aldehyde', '1° + H_{2}CrO_{4}: acid', '2°: ketone.  3°: nothing'],
        ['swap the OH', 'SOCl_{2}: R-Cl', 'PBr_{3}: R-Br', 'TsCl: R-OTs'],
        ['lose water', 'H_{2}SO_{4}, heat: alkene', 'Zaitsev product'],
        ['make an ether', 'RO^{−} + 1° R-X', 'Williamson, S_{N}2']
      ]),
      step(5, hi(50, 498, 620, 34, { c: 'gold', op: 0.3 }), t(360, 524, 'epoxide + base: opens at the less crowded C', { size: 27 }))
    ),
    predict: { q: 'PCC turns a primary alcohol into:', choices: ['A carboxylic acid', 'An aldehyde', 'A ketone'], answer: 1, why: 'PCC is the mild oxidant: it stops at the aldehyde. Chromic acid in water carries a primary alcohol on to the carboxylic acid.' },
    steps: [
      'Oxidation depends on the hydrogens on the carbinol carbon. Primary: PCC stops at the aldehyde, chromic acid goes on to the carboxylic acid. Secondary: a ketone either way. Tertiary: no hydrogen to lose, no reaction.',
      'OH is a poor leaving group, so swap it. SOCl_{2} gives the alkyl chloride and PBr_{3} the bromide. TsCl makes a tosylate, a great leaving group, without touching the C-O bond, so the stereocenter is kept.',
      'Strong acid and heat remove water to give an alkene. Secondary and tertiary alcohols go by E1 through a carbocation, so expect the Zaitsev alkene and watch for rearrangements.',
      'Williamson ether synthesis: an alkoxide attacks a methyl or primary alkyl halide by S_{N}2. Put the crowded half in the alkoxide, never in the halide, or you get E2 instead.',
      'Epoxides are strained ethers that open. A strong nucleophile in base attacks the less substituted carbon (S_{N}2). In acid, the nucleophile attacks the more substituted carbon. Both give anti products.'
    ],
    tryIt: [
      { q: 'Chromic acid with a tertiary alcohol gives:', choices: ['A ketone', 'A carboxylic acid', 'No reaction'], answer: 2, why: 'Oxidation removes a hydrogen from the carbon that holds the OH. A tertiary carbon has none.' },
      { q: 'The best Williamson route to tert-butyl methyl ether is:', choices: ['tert-Butoxide + CH_{3}I', 'Methoxide + tert-butyl bromide', 'Either works equally well'], answer: 0, why: 'S_{N}2 needs an uncrowded halide. Methoxide with a tertiary halide gives E2 elimination, not the ether.' },
      { q: 'Methoxide (basic conditions) opens an unsymmetrical epoxide at:', choices: ['The less substituted carbon', 'The more substituted carbon', 'The oxygen'], answer: 0, why: 'In base it is a plain S_{N}2: the nucleophile takes the less crowded carbon, from the side opposite the oxygen.' }
    ],
    path: { title: 'Williamson ether synthesis', steps: ['Split the ether into two halves at the oxygen', 'Make the more crowded half the alcohol', 'Deprotonate it with NaH to get the alkoxide', 'Add the methyl or primary alkyl halide', 'SN2 forms the C-O bond', 'The ether and a halide salt come out'] }
  });

  /* ---------- Amines ---------- */
  B.add({
    id: 'amines', section: 'ochem', title: 'Amines: the lone pair does everything',
    sub: 'Base, nucleophile, hydrogen-bond partner: it is all the lone pair on nitrogen.',
    svg: K.svg(
      dot(388, 34, 5), dot(406, 34, 5),
      blocks('R-NH_{2}', [
        ['base strength', 'alkyl amine: strongest', 'then NH_{3}, then aniline', 'amide: not basic'],
        ['why', 'lone pair in resonance', '= weaker base'],
        ['make one', 'C=O + amine, NaBH_{3}CN', 'Gabriel: 1° amine only'],
        ['spot one', 'RCOCl gives an amide', 'IR N-H: 1° two, 2° one']
      ]),
      step(5, hi(90, 498, 540, 34, { c: 'gold', op: 0.3 }), t(360, 524, '1°, 2°, 3° amine = carbons on N', { size: 27 }))
    ),
    predict: { q: 'Which is the stronger base?', choices: ['Aniline (NH_{2} on a benzene ring)', 'Cyclohexylamine', 'They are equal'], answer: 1, why: 'In aniline the nitrogen lone pair is shared with the ring, so it is less available. Cyclohexylamine keeps its lone pair on nitrogen.' },
    steps: [
      'Rank bases by how available the lone pair is. Alkyl amines are the strongest (conjugate acid pK_{a} about 10 to 11), ammonia is next (9.2), aniline is much weaker (4.6), and an amide is not basic at all.',
      'The reason is always the same: a lone pair that is delocalized by resonance, into a benzene ring or into a C=O, is harder to donate. Alkyl groups push electrons toward nitrogen and help.',
      'Two ways to make an amine. Reductive amination: a carbonyl plus an amine gives an imine, and NaBH_{3}CN reduces it. Gabriel synthesis: phthalimide plus a primary alkyl halide gives only the primary amine, with no over-alkylation.',
      'Amines are nucleophiles: with an acid chloride they give an amide. In the IR, a primary amine shows two N-H stretches near 3300 to 3500 cm^{−1}, a secondary amine shows one, and a tertiary amine shows none.',
      'Amines are classed by how many carbons are on the nitrogen, not by the carbon that holds it. (CH_{3})_{3}N is tertiary. tert-Butylamine, (CH_{3})_{3}C-NH_{2}, is primary.'
    ],
    tryIt: [
      { q: '(CH_{3})_{3}N is what class of amine?', choices: ['Primary', 'Secondary', 'Tertiary'], answer: 2, why: 'Three carbons are bonded to the nitrogen, so it is a tertiary amine.' },
      { q: 'The Gabriel synthesis is used to make:', choices: ['Primary amines', 'Tertiary amines', 'Amides'], answer: 0, why: 'The phthalimide nitrogen can be alkylated only once, so the product after release is a clean primary amine.' },
      { q: 'Amides are far weaker bases than amines because the nitrogen lone pair:', choices: ['Is delocalized into the C=O', 'Sits on an sp^{3} nitrogen', 'Is tied up in hydrogen bonds'], answer: 0, why: 'Resonance with the carbonyl spreads the lone pair onto oxygen, so nitrogen has little left to give a proton.' }
    ],
    path: { title: 'Reductive amination', steps: ['Start with an aldehyde or ketone', 'Add ammonia or an amine', 'The nitrogen attacks the carbonyl carbon', 'Water is lost to give an imine', 'NaBH3CN reduces the C=N bond', 'The amine has one new carbon group on nitrogen'] }
  });

  /* ---------- Aromaticity ---------- */
  var CH = [136, 196, 256, 316];
  B.add({
    id: 'aromaticity', section: 'ochem', title: 'Aromatic or not: four checks',
    sub: 'Benzene passes all four. Miss one and the special stability is gone.',
    svg: K.svg(
      hex(140, 220, 92), circ(140, 220, 54, { w: 5 }),
      box(262, 110, 36, 36, { w: 4, r: 6 }), box(262, 170, 36, 36, { w: 4, r: 6 }), box(262, 230, 36, 36, { w: 4, r: 6 }), box(262, 290, 36, 36, { w: 4, r: 6 }),
      step(1, tick(264, 130), t(316, CH[0], 'a ring', { size: 30, a: 's' }), tick(264, 190), t(316, CH[1], 'flat', { size: 30, a: 's' })),
      step(2, tick(264, 250), t(316, CH[2], 'p orbital on every atom', { size: 28, a: 's' })),
      step(3, tick(264, 310), hi(310, 290, 370, 36, { c: 'gold', op: 0.3 }), t(316, CH[3], '4n + 2 π e^{−}: 2, 6, 10', { size: 28, a: 's' })),
      step(4, line([[30, 352], [690, 352]], { w: 3, c: 'mute' }), t(40, 392, 'benzene, 6 π: aromatic', { size: 27, c: 'green', a: 's' }), t(40, 428, 'cyclobutadiene, 4 π: antiaromatic', { size: 27, c: 'rose', a: 's' }), t(40, 464, 'cyclooctatetraene, 8 π: tub, nonaromatic', { size: 27, c: 'mute', a: 's' })),
      step(5, hi(30, 500, 660, 34, { c: 'gold', op: 0.3 }), t(360, 526, 'pyrrole N pair counts.  pyridine N pair does not.', { size: 26 }))
    ),
    predict: { q: 'How many π electrons does benzene have?', choices: ['3', '6', '12'], answer: 1, why: 'Three double bonds, two π electrons each. Or: six carbons, one p electron each.' },
    steps: [
      'Check one and two: the atoms must form a ring, and the ring must be flat so the p orbitals can line up.',
      'Check three: every atom in the ring needs a p orbital, so the overlap runs all the way around with no sp^{3} atom breaking it.',
      'Check four, Hückel: count the π electrons. 4n + 2 (2, 6, 10, 14) is aromatic. Benzene has 6.',
      'A flat, fully conjugated ring with 4n π electrons (4, 8) is antiaromatic and especially unstable: cyclobutadiene. Cyclooctatetraene avoids that by bending into a tub, so it is simply nonaromatic.',
      'Lone pairs count only when they sit in a p orbital of the ring. Pyrrole needs its nitrogen pair to reach 6, so it counts. In pyridine the pair points outward in an sp^{2} orbital: it does not count, and it is free to act as a base.'
    ],
    tryIt: [
      { q: 'The cyclopentadienyl anion (five-membered ring, flat, 6 π electrons) is:', choices: ['Aromatic', 'Antiaromatic', 'Nonaromatic'], answer: 0, why: 'Ring, flat, a p orbital on all five carbons, and 6 = 4(1) + 2. That is why cyclopentadiene is unusually acidic (pK_{a} about 16).' },
      { q: 'Cyclobutadiene (flat, fully conjugated, 4 π electrons) is:', choices: ['Aromatic', 'Antiaromatic', 'Nonaromatic'], answer: 1, why: 'It passes the first three checks but has 4n π electrons, so it is antiaromatic.' },
      { q: 'In pyridine, the nitrogen lone pair:', choices: ['Is part of the aromatic six', 'Sits in an sp^{2} orbital, outside the π system', 'Makes the ring antiaromatic'], answer: 1, why: 'The ring already has 6 π electrons from its three double bonds. The lone pair lies in the plane of the ring, which is why pyridine is a base.' }
    ],
    path: { title: 'Decide if a ring is aromatic', steps: ['Check that it is a ring', 'Check that it is flat', 'Check for a p orbital on every ring atom', 'Count the pi electrons', '4n + 2 means aromatic', '4n means antiaromatic'] },
    more: [M3('benzene')]
  });
})(typeof window !== 'undefined' ? window.AceBoard : (typeof require === 'function' ? require('../ace-board.js') : null));
