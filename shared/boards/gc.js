/* boards/gc.js : General Chemistry whiteboards (shared/ace-board.js draws them).
   Every number here is DAT-scope and checked: 22.4 L/mol at STP, 6.022 x 10^23, E cell = E cathode - E anode. */
(function (B) {
  'use strict';
  if (!B) return;
  var K = B.kit, t = K.t, line = K.line, arrow = K.arrow, box = K.box, circ = K.circ, step = K.step, hi = K.hi, dot = K.dot, curve = K.curve;

  /* ---------- 1. The mole bridge ---------- */
  B.add({
    id: 'mole-bridge', section: 'gchem', title: 'The mole bridge',
    sub: 'Grams, particles, gas liters and molarity all cross through moles.',
    svg: K.svg(
      circ(360, 285, 56, { c: 'ink', w: 5, fill: 'gold', op: 0.22 }), t(360, 297, 'MOLES', { size: 32 }),
      box(20, 250, 150, 70, { c: 'blue', fill: 'blue', op: 0.08 }), t(95, 296, 'GRAMS', { size: 30, c: 'blue' }),
      box(550, 250, 150, 70, { c: 'rose', fill: 'rose', op: 0.08 }), t(625, 296, 'PARTICLES', { size: 25, c: 'rose' }),
      box(265, 28, 190, 70, { c: 'purple', fill: 'purple', op: 0.08 }), t(360, 74, 'GAS at STP', { size: 28, c: 'purple' }),
      box(265, 468, 190, 70, { c: 'green', fill: 'green', op: 0.08 }), t(360, 514, 'SOLUTION', { size: 28, c: 'green' }),
      arrow(176, 274, 298, 274, { c: 'blue' }), arrow(298, 298, 176, 298, { c: 'blue' }),
      arrow(422, 274, 544, 274, { c: 'rose' }), arrow(544, 298, 422, 298, { c: 'rose' }),
      arrow(348, 224, 348, 106, { c: 'purple' }), arrow(372, 106, 372, 224, { c: 'purple' }),
      arrow(348, 346, 348, 462, { c: 'green' }), arrow(372, 462, 372, 346, { c: 'green' }),
      step(1, t(280, 236, '÷ molar mass', { size: 24, c: 'blue', a: 'e' }), t(280, 352, '× molar mass', { size: 24, c: 'blue', a: 'e' })),
      step(2, t(440, 236, '× 6.022 × 10^{23}', { size: 23, c: 'rose', a: 's' }), t(440, 356, '÷ 6.022 × 10^{23}', { size: 23, c: 'rose', a: 's' })),
      step(3, t(336, 172, '× 22.4 L', { size: 24, c: 'purple', a: 'e' }), t(386, 172, '÷ 22.4 L', { size: 24, c: 'purple', a: 's' })),
      step(4, t(336, 412, '÷ liters', { size: 24, c: 'green', a: 'e' }), t(386, 412, 'M × liters', { size: 24, c: 'green', a: 's' })),
      step(5, circ(360, 285, 72, { c: 'gold', w: 7 }), t(120, 130, 'A to B?', { size: 28, c: 'goldInk' }), t(120, 166, 'mole ratio', { size: 28, c: 'goldInk' }), arrow(196, 160, 300, 236, { c: 'gold', bend: -18 }))
    ),
    predict: { q: 'You have grams of one compound and want particles of it. Which stop can you never skip?', choices: ['Moles', 'Liters', 'Molarity'], answer: 0, why: 'Every conversion crosses the mole. There is no direct bridge between the outer islands.' },
    steps: [
      'Grams to moles: divide by molar mass. Moles back to grams: multiply by it.',
      'Moles to particles: multiply by Avogadro\'s number, 6.022 × 10^{23} per mole.',
      'A gas at STP (0 °C, 1 atm): one mole fills 22.4 L. Multiply moles by 22.4 to get liters.',
      'Solutions: molarity is moles per liter. Moles = M × liters of solution.',
      'Changing substance A into substance B? Only moles can cross, using the mole ratio from the balanced equation.'
    ],
    tryIt: [
      { q: 'How many moles are in 36.0 g of H_{2}O (18.0 g/mol)?', choices: ['0.500 mol', '2.00 mol', '648 mol'], answer: 1, why: 'Grams to moles: 36.0 ÷ 18.0 = 2.00 mol.' },
      { q: '0.50 mol of CO_{2} gas at STP fills what volume?', choices: ['44.8 L', '22.4 L', '11.2 L'], answer: 2, why: '0.50 mol × 22.4 L/mol = 11.2 L.' },
      { q: 'How many moles of NaCl are in 250 mL of a 2.0 M solution?', choices: ['0.50 mol', '8.0 mol', '500 mol'], answer: 0, why: 'M × liters: 2.0 × 0.250 L = 0.50 mol. Convert mL to L first.' }
    ],
    path: { title: 'Grams of A to grams of B', steps: ['Start with grams of A', 'Divide by the molar mass of A', 'Moles of A', 'Multiply by the mole ratio B over A', 'Moles of B', 'Multiply by the molar mass of B'] },
    more: [{ label: 'GuacaMOLE: the full walk-through', href: '/gc/guacamole/' }]
  });

  /* ---------- 2. Acid-base: the titration curve ---------- */
  var Y = function (pH) { return 480 - pH * 30; };
  B.add({
    id: 'acid-base', section: 'gchem', title: 'Proton traffic: the titration curve',
    sub: 'Weak acid, strong base. Four landmarks on one curve.',
    svg: K.svg(
      line([[90, 50], [90, 480], [690, 480]], { w: 4 }),
      t(124, 64, 'pH', { size: 30 }), t(400, 532, 'mL of NaOH added', { size: 26 }),
      line([[82, Y(7)], [690, Y(7)]], { c: 'mute', w: 2.5, dash: '3 12' }), t(64, Y(7) + 10, '7', { size: 26, c: 'mute' }),
      t(64, Y(14) + 10, '14', { size: 24, c: 'mute' }), t(64, 490, '0', { size: 24, c: 'mute' }),
      curve([[90, Y(2.9)], [112, Y(3.7)], [160, Y(4.3)], [240, Y(4.76)], [320, Y(5.3)], [362, Y(6.0)], [382, Y(7.0)], [390, Y(8.7)], [398, Y(10.4)], [420, Y(11.5)], [480, Y(12.1)], [580, Y(12.4)], [680, Y(12.5)]], { c: 'ink', w: 5.5 }),
      step(1, dot(90, Y(2.9), 9, { c: 'rose' }), t(106, Y(2.9) + 36, 'weak acid HA', { size: 24, c: 'rose', a: 's' })),
      step(2, hi(150, Y(4.76) - 22, 190, 46, { c: 'gold' }), t(246, Y(4.76) + 58, 'buffer zone', { size: 27, c: 'goldInk' })),
      step(3, dot(240, Y(4.76), 9, { c: 'blue' }), line([[240, Y(4.76)], [240, 480]], { c: 'blue', w: 2.5, dash: '3 10' }), t(232, Y(4.76) - 34, 'halfway: pH = pK_{a}', { size: 27, c: 'blue' })),
      step(4, dot(390, Y(8.7), 10, { c: 'purple' }), line([[390, Y(8.7)], [390, 480]], { c: 'purple', w: 2.5, dash: '3 10' }), t(408, Y(8.7) + 8, 'equivalence', { size: 27, c: 'purple', a: 's' }), t(408, Y(8.7) + 38, 'pH above 7', { size: 25, c: 'purple', a: 's' })),
      step(5, curve([[90, Y(1.0)], [240, Y(1.5)], [340, Y(2.2)], [376, Y(3.2)], [386, Y(5.0)], [390, Y(7.0)], [394, Y(9.4)], [402, Y(10.8)], [420, Y(11.5)]], { c: 'green', w: 4, dash: '10 9' }), dot(390, Y(7), 8, { c: 'green' }), t(408, Y(7) + 34, 'strong acid: pH 7', { size: 24, c: 'green', a: 's' }))
    ),
    predict: { q: 'Acetic acid (a weak acid) is titrated with NaOH. At the equivalence point, the pH is:', choices: ['Below 7', 'Exactly 7', 'Above 7'], answer: 2, why: 'All the HA has become its conjugate base A^{-}, a weak base. The solution is basic.' },
    steps: [
      'The start: only weak acid HA. It ionizes a little, so the pH starts higher than a strong acid of the same concentration.',
      'The flat stretch is the buffer zone. HA and A^{-} are both present, so added base barely moves the pH.',
      'Halfway to equivalence, [HA] = [A^{-}]. Henderson-Hasselbalch collapses to pH = pK_{a}.',
      'Equivalence: moles of base equal moles of acid. Only A^{-} is left, so the pH is above 7.',
      'A strong acid starts lower, has no buffer zone, and reaches equivalence at exactly pH 7.'
    ],
    tryIt: [
      { q: 'A weak acid has pK_{a} = 4.76. What is the pH at the half-equivalence point?', choices: ['2.38', '4.76', '7.00'], answer: 1, why: 'At half-equivalence [HA] = [A^{-}], so pH = pK_{a} = 4.76.' },
      { q: 'A buffer resists pH change best when:', choices: ['pH is close to the pK_{a}', 'pH is exactly 7', 'the acid is a strong acid'], answer: 0, why: 'A buffer needs a weak acid and its conjugate base in similar amounts: pH within about 1 of pK_{a}.' },
      { q: 'What is the pH of 0.010 M HCl?', choices: ['1', '2', '12'], answer: 1, why: 'HCl is strong, so [H^{+}] = 0.010 = 10^{-2} M. pH = −log(10^{-2}) = 2.' }
    ],
    path: { title: 'Weak acid titration, start to finish', steps: ['Weak acid alone: pH set by K_{a}', 'Buffer zone: HA and A^{-} together', 'Half-equivalence: pH = pK_{a}', 'Equivalence: only A^{-}, pH above 7', 'Excess strong base sets the pH'] }
  });

  /* ---------- 3. Equilibrium ---------- */
  B.add({
    id: 'equilibrium', section: 'gchem', title: 'Balance and the push-back',
    sub: 'Q against K, then Le Chatelier on one reaction.',
    svg: K.svg(
      line([[60, 150], [660, 150]], { w: 5 }), line([[360, 128], [360, 172]], { w: 5 }),
      t(360, 112, 'K', { size: 40, c: 'goldInk' }), t(60, 196, 'small Q', { size: 24, c: 'mute', a: 's' }), t(660, 196, 'big Q', { size: 24, c: 'mute', a: 'e' }),
      t(360, 330, 'N_{2} + 3H_{2}  ⇌  2NH_{3} + heat', { size: 36 }),
      line([[80, 352], [640, 352]], { c: 'mute', w: 2, dash: '3 10' }),
      step(1, dot(190, 150, 11, { c: 'blue' }), arrow(170, 60, 330, 60, { c: 'blue', w: 5 }), t(60, 72, 'Q < K', { size: 30, c: 'blue', a: 's' }), t(60, 106, 'make products', { size: 24, c: 'blue', a: 's' })),
      step(2, dot(530, 150, 11, { c: 'rose' }), arrow(550, 60, 390, 60, { c: 'rose', w: 5 }), t(660, 72, 'Q > K', { size: 30, c: 'rose', a: 'e' }), t(660, 106, 'make reactants', { size: 24, c: 'rose', a: 'e' })),
      step(3, circ(360, 150, 24, { c: 'gold', w: 7 }), t(360, 232, 'Q = K: rates equal', { size: 27, c: 'goldInk' })),
      step(4, t(80, 404, 'add N_{2}', { size: 28, c: 'blue', a: 's' }), arrow(250, 396, 360, 396, { c: 'blue', w: 5 })),
      step(5, t(80, 456, 'squeeze', { size: 28, c: 'purple', a: 's' }), arrow(250, 448, 360, 448, { c: 'purple', w: 5 }), t(380, 458, '4 gas mol to 2', { size: 25, c: 'purple', a: 's' })),
      step(6, t(80, 508, 'heat it', { size: 28, c: 'rose', a: 's' }), arrow(360, 500, 250, 500, { c: 'rose', w: 5 }), t(380, 510, 'and K changes', { size: 25, c: 'rose', a: 's' }))
    ),
    predict: { q: 'Right now Q is smaller than K. Which way does the reaction run?', choices: ['Toward products', 'Toward reactants', 'It does not move'], answer: 0, why: 'Q < K means too few products for equilibrium, so the forward reaction wins until Q climbs to K.' },
    steps: [
      'Q is the same ratio as K, measured right now. Q < K: not enough product yet, so the reaction runs forward.',
      'Q > K: too much product. The reaction runs in reverse until Q falls back to K.',
      'Q = K: equilibrium. The forward and reverse rates are equal, so concentrations stop changing.',
      'Le Chatelier: add a reactant and the system uses it up. Adding N_{2} shifts right.',
      'Raise the pressure by shrinking the volume and it shifts to the side with fewer gas moles: 4 on the left, 2 on the right.',
      'Heat is a product here (exothermic). Adding heat shifts left. Temperature is the only stress that changes K itself.'
    ],
    tryIt: [
      { q: 'For this exothermic reaction, raising the temperature does what?', choices: ['Shifts right, K increases', 'Shifts left, K decreases', 'No shift, K is constant'], answer: 1, why: 'Treat heat as a product. Adding it pushes the reaction left, and K gets smaller.' },
      { q: 'A catalyst is added to a system at equilibrium. What happens?', choices: ['It shifts toward products', 'K gets larger', 'No shift: both rates speed up equally'], answer: 2, why: 'A catalyst lowers the barrier both ways. Equilibrium is reached faster, in the same place.' },
      { q: 'For a dissolved salt, the ion product Q is larger than K_{sp}. What happens?', choices: ['A precipitate forms', 'More solid dissolves', 'Nothing changes'], answer: 0, why: 'Q > K_{sp} means too many ions in solution. The reaction runs back toward the solid.' }
    ],
    path: { title: 'Solve an ICE table', steps: ['Write the balanced equation', 'I: fill in the initial concentrations', 'C: change by −x and +x times each coefficient', 'E: add the I and C rows', 'Plug the E row into the K expression', 'Solve for x'] }
  });

  /* ---------- 4. The energy ledger ---------- */
  B.add({
    id: 'energy-ledger', section: 'gchem', title: 'The energy ledger',
    sub: 'Enthalpy on the left, the Gibbs quadrant on the right.',
    svg: K.svg(
      arrow(44, 480, 44, 120, { w: 4 }), t(44, 100, 'H', { size: 32 }),
      line([[66, 190], [150, 190]], { w: 6 }), line([[250, 400], [340, 400]], { w: 6 }),
      t(124, 172, 'reactants', { size: 25 }), t(296, 440, 'products', { size: 25 }),
      box(410, 150, 290, 290, { r: 6, w: 4 }), line([[555, 150], [555, 440]], { w: 3 }), line([[410, 295], [700, 295]], { w: 3 }),
      t(482, 136, 'ΔS +', { size: 28, c: 'blue' }), t(628, 136, 'ΔS −', { size: 28, c: 'blue' }),
      t(396, 232, 'ΔH −', { size: 28, c: 'rose', a: 'e' }), t(396, 378, 'ΔH +', { size: 28, c: 'rose', a: 'e' }),
      step(1, line([[156, 190], [326, 190]], { c: 'mute', w: 2.5, dash: '3 10' }), arrow(308, 198, 308, 392, { c: 'rose', w: 5 }), t(296, 270, 'ΔH < 0', { size: 28, c: 'rose', a: 'e' }), t(296, 302, 'heat out', { size: 24, c: 'rose', a: 'e' })),
      step(2, line([[100, 196], [100, 322]], { c: 'purple', w: 3.5, dash: '9 9' }), line([[66, 326], [150, 326]], { c: 'purple', w: 5 }), line([[150, 330], [250, 398]], { c: 'purple', w: 3.5, dash: '9 9' }), t(66, 366, 'Hess:', { size: 24, c: 'purple', a: 's' }), t(66, 394, 'steps add', { size: 24, c: 'purple', a: 's' })),
      step(3, t(555, 66, 'ΔG = ΔH − TΔS', { size: 36 }), hi(416, 44, 280, 34, { c: 'gold' })),
      step(4, t(482, 236, 'always', { size: 30, c: 'green' }), t(628, 382, 'never', { size: 30, c: 'rose' })),
      step(5, t(628, 236, 'low T', { size: 30, c: 'goldInk' }), t(482, 382, 'high T', { size: 30, c: 'goldInk' }), t(555, 490, 'ΔG < 0 means spontaneous', { size: 25, c: 'ink' }))
    ),
    predict: { q: 'A reaction releases heat and makes more gas (ΔH < 0, ΔS > 0). When is it spontaneous?', choices: ['Only at high temperature', 'At every temperature', 'Never'], answer: 1, why: 'ΔG = ΔH − TΔS. A negative ΔH minus a positive TΔS is negative at any T.' },
    steps: [
      'ΔH is products minus reactants. Products lower than reactants: heat leaves, ΔH is negative, exothermic.',
      'Hess\'s law: H is a state function. Take any route between the same two levels and the step ΔH values add to the same total.',
      'Spontaneity is decided by Gibbs free energy: ΔG = ΔH − TΔS, with T in kelvin.',
      'Two corners need no math. Heat out and disorder up: always spontaneous. Heat in and disorder down: never.',
      'The other two depend on T. Both negative: spontaneous when cold. Both positive: spontaneous when hot, because TΔS grows with T.'
    ],
    tryIt: [
      { q: 'ΔH = +40 kJ and ΔS = +100 J/K. Above what temperature is the reaction spontaneous?', choices: ['0.40 K', '400 K', '4000 K'], answer: 1, why: 'ΔG = 0 at T = ΔH/ΔS = 40,000 J ÷ 100 J/K = 400 K. Match the units first.' },
      { q: 'A → B has ΔH = −100 kJ. B → C has ΔH = +30 kJ. What is ΔH for A → C?', choices: ['−130 kJ', '+70 kJ', '−70 kJ'], answer: 2, why: 'Hess\'s law: add the steps. −100 + 30 = −70 kJ.' },
      { q: 'Ice melts on its own at 25 °C. Which signs describe melting?', choices: ['ΔH > 0 and ΔS > 0', 'ΔH < 0 and ΔS < 0', 'ΔH < 0 and ΔS > 0'], answer: 0, why: 'Melting absorbs heat and raises disorder. It is the "high T" corner: spontaneous above 0 °C.' }
    ]
  });

  /* ---------- 5. Gases ---------- */
  var gasDots = [[110, 330], [170, 300], [215, 350], [130, 400], [200, 420], [160, 360], [230, 300], [105, 440], [185, 455], [240, 400]];
  B.add({
    id: 'gases', section: 'gchem', title: 'Gases: one equation, four dials',
    sub: 'PV = nRT, the laws inside it, partial pressures and KMT.',
    svg: K.svg(
      line([[80, 150], [80, 480], [270, 480], [270, 150]], { w: 5 }),
      line([[84, 250], [266, 250]], { w: 7 }), line([[175, 250], [175, 170]], { w: 6 }), line([[140, 170], [210, 170]], { w: 6 }),
      gasDots.map(function (p, i) { return dot(p[0], p[1], 8, { c: i % 3 === 0 ? 'mute' : 'mute' }); }).join(''),
      t(500, 96, 'PV = nRT', { size: 58 }),
      step(1, arrow(175, 78, 175, 150, { c: 'rose', w: 6 }), t(320, 180, 'squeeze: V down, P up', { size: 28, c: 'rose', a: 's' })),
      step(2, K.path('M150 540 Q160 505 175 525 Q186 498 200 540', { c: 'orange', w: 5 }), t(320, 240, 'heat: T up, V up', { size: 28, c: 'orange', a: 's' }), t(320, 270, '(T in kelvin)', { size: 23, c: 'orange', a: 's' })),
      step(3, t(320, 334, 'P_{1}V_{1} / T_{1} = P_{2}V_{2} / T_{2}', { size: 28, c: 'ink', a: 's' }), hi(314, 310, 370, 34, { c: 'gold' })),
      step(4, gasDots.filter(function (p, i) { return i % 3 === 0; }).map(function (p) { return dot(p[0], p[1], 9, { c: 'blue' }); }).join(''), gasDots.filter(function (p, i) { return i % 3 !== 0; }).map(function (p) { return dot(p[0], p[1], 9, { c: 'purple' }); }).join(''),
        t(320, 404, 'P total = P_{A} + P_{B}', { size: 28, c: 'blue', a: 's' }), t(320, 436, 'P_{A} = mole fraction × P total', { size: 23, c: 'blue', a: 's' })),
      step(5, gasDots.slice(0, 6).map(function (p, i) { return line([[p[0] + 12, p[1] - 4], [p[0] + 28, p[1] - 12 + (i % 2) * 14]], { c: 'green', w: 3 }); }).join(''), t(320, 500, 'average KE depends on T only', { size: 26, c: 'green', a: 's' }))
    ),
    predict: { q: 'Temperature is held constant and the piston is pushed until the volume is halved. The pressure:', choices: ['Halves', 'Stays the same', 'Doubles'], answer: 2, why: 'Boyle\'s law: at constant n and T, P and V are inversely related. Half the room, twice the collisions.' },
    steps: [
      'Boyle: hold n and T, push the piston. Volume down, pressure up: P_{1}V_{1} = P_{2}V_{2}.',
      'Charles: hold n and P, add heat. The gas expands in step with the kelvin temperature: V_{1}/T_{1} = V_{2}/T_{2}.',
      'Put them together when the amount of gas is fixed: the combined gas law. Always convert °C to K first.',
      'Dalton: in a mixture each gas pushes on its own. Partial pressures add, and each one is its mole fraction times the total.',
      'Kinetic molecular theory: average kinetic energy depends only on T. At the same T, lighter molecules move faster.'
    ],
    tryIt: [
      { q: 'A gas fills 2.0 L at 300 K. It is heated to 600 K at constant pressure. New volume?', choices: ['1.0 L', '4.0 L', '2.0 L'], answer: 1, why: 'Charles: V/T is constant. Doubling the kelvin temperature doubles the volume: 4.0 L.' },
      { q: 'A tank holds 0.25 mol He and 0.75 mol Ne at 2.0 atm total. What is the partial pressure of He?', choices: ['0.50 atm', '1.5 atm', '0.25 atm'], answer: 0, why: 'Mole fraction of He is 0.25 ÷ 1.00 = 0.25. 0.25 × 2.0 atm = 0.50 atm.' },
      { q: 'H_{2} and O_{2} are at the same temperature. Which molecules move faster on average?', choices: ['O_{2}', 'They move at the same speed', 'H_{2}'], answer: 2, why: 'Same T means the same average kinetic energy. The lighter H_{2} must move faster to match it.' }
    ]
  });

  /* ---------- 6. Kinetics ---------- */
  B.add({
    id: 'kinetics', section: 'gchem', title: 'How fast, not how far',
    sub: 'The energy hill, the catalyst shortcut and the rate law.',
    svg: K.svg(
      line([[80, 60], [80, 490], [690, 490]], { w: 4 }), t(40, 280, 'energy', { size: 26, rot: -90 }), t(400, 536, 'reaction progress', { size: 26 }),
      curve([[90, 330], [170, 330], [230, 300], [290, 170], [330, 130], [370, 170], [430, 330], [490, 396], [560, 400], [680, 400]], { w: 5.5 }),
      step(1, t(160, 368, 'reactants', { size: 26, c: 'ink' }), t(610, 438, 'products', { size: 26, c: 'ink' }), line([[430, 330], [650, 330]], { c: 'mute', w: 2.5, dash: '3 10' }), arrow(640, 334, 640, 396, { c: 'rose', w: 4, head: 11 }), t(660, 374, 'ΔH', { size: 26, c: 'rose', a: 's' })),
      step(2, line([[170, 330], [330, 330]], { c: 'mute', w: 2.5, dash: '3 10' }), arrow(330, 326, 330, 138, { c: 'blue', w: 5, both: true }), t(206, 246, 'E_{a}', { size: 36, c: 'blue' }), t(290, 104, 'transition state', { size: 25, c: 'blue' })),
      step(3, curve([[200, 322], [250, 290], [290, 236], [330, 216], [370, 240], [420, 322]], { c: 'green', w: 4.5, dash: '10 9' }), t(540, 240, 'catalyst:', { size: 27, c: 'green' }), t(540, 272, 'lower hill, same ΔH', { size: 24, c: 'green' })),
      step(4, t(556, 76, 'rate = k[A]^{m}[B]^{n}', { size: 30, c: 'purple' }), hi(434, 54, 246, 32, { c: 'gold' })),
      step(5, t(560, 118, 'm, n: from data only', { size: 24, c: 'purple' }), t(560, 148, 'slow step sets rate', { size: 24, c: 'purple' }))
    ),
    predict: { q: 'A catalyst is added. What changes on this diagram?', choices: ['The hill gets lower', 'The products drop lower', 'The reactants start higher'], answer: 0, why: 'A catalyst gives a new path with a lower activation energy. The start and end levels do not move.' },
    steps: [
      'The two flat levels are thermodynamics: products minus reactants is ΔH. It says nothing about speed.',
      'The hill is kinetics. Activation energy E_{a} is the climb from reactants to the transition state. A taller hill means a slower reaction.',
      'A catalyst lowers the hill for both directions. Faster reaction, same ΔH, same equilibrium.',
      'The rate law: rate = k[A]^{m}[B]^{n}. Raising the temperature raises k.',
      'The orders m and n come from experiment, not from the coefficients. In a mechanism, the slow step sets the rate.'
    ],
    tryIt: [
      { q: 'Doubling [A] with everything else fixed makes the rate four times faster. The order in A is:', choices: ['1', '2', '4'], answer: 1, why: '2^{m} = 4, so m = 2. Second order in A.' },
      { q: 'For rate = k[A][B]^{2}, what is the overall order?', choices: ['3', '2', '1'], answer: 0, why: 'Add the exponents: 1 + 2 = 3.' },
      { q: 'The half-life of a first-order reaction:', choices: ['Gets longer as the reactant runs out', 'Depends on the starting concentration', 'Stays constant'], answer: 2, why: 'First order: t_{1/2} = 0.693/k. It does not depend on concentration.' }
    ],
    more: [{ label: 'Recognition lab: read the graphs fast', href: '/tools/gc/recognition-lab.html' }]
  });

  /* ---------- 7. Redox and the two cells ---------- */
  B.add({
    id: 'redox', section: 'gchem', title: 'The charge ledger: redox and cells',
    sub: 'One zinc-copper cell. Who loses electrons, where they go, what voltage.',
    svg: K.svg(
      line([[90, 300], [90, 480], [290, 480], [290, 300]], { w: 5 }), line([[430, 300], [430, 480], [630, 480], [630, 300]], { w: 5 }),
      K.path('M96 350 Q140 340 190 350 Q240 360 284 350', { c: 'blue', w: 3 }), K.path('M436 350 Q480 340 530 350 Q580 360 624 350', { c: 'blue', w: 3 }),
      box(170, 210, 42, 230, { r: 4, c: 'mute', fill: 'mute', op: 0.3 }), box(508, 210, 42, 230, { r: 4, c: 'orange', fill: 'orange', op: 0.3 }),
      line([[191, 210], [191, 120], [529, 120], [529, 210]], { w: 4 }),
      circ(360, 120, 26, { w: 4, fill: '#FDFCF8', op: 1 }), t(360, 131, 'V', { size: 28 }),
      K.path('M262 400 L262 270 Q262 250 282 250 L438 250 Q458 250 458 270 L458 400', { c: 'purple', w: 14, op: 1 }),
      step(1, t(132, 276, 'Zn', { size: 32, c: 'ink' }), t(40, 40, 'ANODE: oxidation', { size: 26, c: 'rose', a: 's' }), t(40, 524, 'Zn → Zn^{2+} + 2e^{-}', { size: 26, c: 'rose', a: 's' })),
      step(2, t(590, 276, 'Cu', { size: 32, c: 'ink' }), t(680, 40, 'CATHODE: reduction', { size: 26, c: 'blue', a: 'e' }), t(680, 524, 'Cu^{2+} + 2e^{-} → Cu', { size: 26, c: 'blue', a: 'e' })),
      step(3, arrow(230, 104, 320, 104, { c: 'gold', w: 5 }), arrow(400, 104, 490, 104, { c: 'gold', w: 5 }), t(275, 138, 'e^{-}', { size: 28, c: 'goldInk' }), t(360, 238, 'salt bridge', { size: 24, c: 'purple' })),
      step(4, t(360, 72, 'E° = cathode − anode', { size: 24, c: 'ink' }), t(360, 190, '+1.10 V', { size: 34, c: 'green' }), hi(298, 166, 124, 32, { c: 'gold' })),
      step(5, t(366, 322, 'battery on:', { size: 21, c: 'purple' }), t(366, 350, 'electrolytic,', { size: 21, c: 'purple' }), t(366, 378, 'E° < 0', { size: 21, c: 'purple' }))
    ),
    predict: { q: 'Electrons leave the electrode where which process happens?', choices: ['Reduction', 'Oxidation', 'Neither: ions carry the charge in the wire'], answer: 1, why: 'Oxidation is loss of electrons. They leave the anode and travel through the wire to the cathode.' },
    steps: [
      'Zinc is oxidized: it loses two electrons and its oxidation number rises from 0 to +2. Oxidation always happens at the anode.',
      'Copper ions are reduced: they gain two electrons and plate out as Cu metal. Reduction always happens at the cathode.',
      'Electrons run through the wire from anode to cathode. The salt bridge lets ions move so neither beaker builds up charge.',
      'Cell voltage: E° cell = E° cathode − E° anode = 0.34 − (−0.76) = +1.10 V. Positive means spontaneous: a galvanic cell.',
      'An electrolytic cell is the same picture run by a battery. E° cell is negative, so the reaction is forced. Oxidation is still at the anode.'
    ],
    tryIt: [
      { q: 'What is the oxidation number of Mn in MnO_{4}^{-}?', choices: ['+4', '+7', '+2'], answer: 1, why: 'Four oxygens at −2 give −8. The ion is −1 overall, so Mn is +7.' },
      { q: 'E°(Cu^{2+}/Cu) = +0.34 V and E°(Zn^{2+}/Zn) = −0.76 V. What is E° for the zinc-copper cell?', choices: ['+1.10 V', '+0.42 V', '−1.10 V'], answer: 0, why: 'Cathode minus anode: 0.34 − (−0.76) = +1.10 V.' },
      { q: 'In an electrolytic cell, where does reduction happen?', choices: ['At the anode', 'In the salt bridge', 'At the cathode'], answer: 2, why: 'Reduction is at the cathode in every cell. Only the sign of the electrodes and the spontaneity change.' }
    ],
    path: { title: 'Balance a redox reaction in acid', steps: ['Split into two half-reactions', 'Balance atoms other than O and H', 'Balance O by adding H_{2}O', 'Balance H by adding H^{+}', 'Balance charge by adding electrons', 'Match the electrons and add the halves'] },
    more: [{ label: 'Galvanic cell lab: predict, then run it', href: '/gc/galvanic/' }]
  });
})(typeof window !== 'undefined' ? window.AceBoard : (typeof require === 'function' ? require('../ace-board.js') : null));
