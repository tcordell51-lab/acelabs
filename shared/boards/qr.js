/* boards/qr.js : Quantitative Reasoning whiteboards (shared/ace-board.js draws them). */
(function (B) {
  'use strict';
  if (!B) return;
  var K = B.kit, t = K.t, line = K.line, arrow = K.arrow, box = K.box, step = K.step, hi = K.hi, dot = K.dot, path = K.path;
  var X = function (v) { return 60 + 600 * v; };
  function tick(v, len, o) { return line([[X(v), 280 - len], [X(v), 280 + len]], o); }
  function lead(v, y1, o) { return line([[X(v), y1], [X(v), y1 < 280 ? 262 : 298]], { c: o, w: 2.5, dash: '3 9' }); }

  /* ---------- Fractions, decimals, percent ---------- */
  B.add({
    id: 'number-line', section: 'qr', title: 'Fractions, decimals, percent: one number line',
    flick: {
      title: 'Bigger or smaller?', up: 'Gets bigger', down: 'Gets smaller',
      cards: [
        { q: 'A positive number, multiplied by 1/2', up: false, why: 'Half of a positive number is smaller.' },
        { q: 'A positive number, divided by 1/2', up: true, why: 'Dividing by 1/2 doubles it.' },
        { q: '0.5, squared', up: false, why: '0.5 × 0.5 = 0.25. Fractions shrink when squared.' },
        { q: '0.25, square rooted', up: true, why: 'The root of 0.25 is 0.5.' },
        { q: '4, squared', up: true, why: '4 × 4 = 16.' },
        { q: 'A negative number, plus 3', up: true, why: 'Adding moves right on the number line.' },
        { q: '-2, multiplied by 3', up: false, why: '-6 sits left of -2.' },
        { q: '-6, divided by 2', up: true, why: '-3 sits right of -6.' },
        { q: 'A positive fraction, when its denominator grows', up: false, why: 'More pieces means each piece is smaller.' },
        { q: 'A positive fraction, when its numerator grows', up: true, why: 'More pieces of the same size.' },
        { q: '-0.5, squared', up: true, why: '0.25 is greater than -0.5.' },
        { q: '10, replaced by its reciprocal', up: false, why: '1/10 = 0.1.' }
      ]
    },
    sub: 'The benchmark conversions worth knowing cold.',
    svg: K.svg(
      line([[40, 280], [690, 280]], { w: 5.5 }), tick(0, 22, { w: 5 }), tick(1, 22, { w: 5 }),
      t(60, 334, '0', { size: 32 }), t(660, 334, '1', { size: 32 }), t(660, 368, '100%', { size: 24, c: 'mute' }),
      tick(0.25, 16, { w: 4.5 }), tick(0.5, 20, { w: 4.5 }), tick(0.75, 16, { w: 4.5 }),
      step(1, t(X(0.25), 244, '1/4', { size: 30, c: 'blue' }), t(X(0.5), 244, '1/2', { size: 30, c: 'blue' }), t(X(0.75), 244, '3/4', { size: 30, c: 'blue' }),
        t(X(0.25), 334, '0.25', { size: 27, c: 'blue' }), t(X(0.5), 334, '0.5', { size: 27, c: 'blue' }), t(X(0.75), 334, '0.75', { size: 27, c: 'blue' }),
        t(X(0.25), 368, '25%', { size: 25, c: 'blue' }), t(X(0.5), 368, '50%', { size: 25, c: 'blue' }), t(X(0.75), 368, '75%', { size: 25, c: 'blue' })),
      step(2, [0.2, 0.4, 0.6, 0.8].map(function (v) { return dot(X(v), 280, 7, { c: 'purple' }) + lead(v, 86, K.col.purple); }).join(''),
        t(X(0.2), 74, '1/5 = 0.2', { size: 26, c: 'purple' }), t(X(0.4), 74, '0.4', { size: 26, c: 'purple' }), t(X(0.6), 74, '0.6', { size: 26, c: 'purple' }), t(X(0.8), 74, '0.8', { size: 26, c: 'purple' })),
      step(3, [1 / 3, 2 / 3].map(function (v) { return dot(X(v), 280, 7, { c: 'rose' }) + lead(v, 194, K.col.rose); }).join(''),
        t(X(1 / 3), 150, '1/3', { size: 27, c: 'rose' }), t(X(1 / 3), 182, '0.333', { size: 25, c: 'rose' }), t(X(2 / 3), 150, '2/3', { size: 27, c: 'rose' }), t(X(2 / 3), 182, '0.667', { size: 25, c: 'rose' })),
      step(4, [0.125, 0.375, 0.625, 0.875].map(function (v) { return dot(X(v), 280, 7, { c: 'green' }) + lead(v, 404, K.col.green); }).join(''),
        t(62, 436, '1/8 = 0.125', { size: 26, c: 'green', a: 's' }), t(X(0.375), 436, '0.375', { size: 26, c: 'green' }), t(X(0.625), 436, '0.625', { size: 26, c: 'green' }), t(X(0.875), 436, '0.875', { size: 26, c: 'green' })),
      step(5, hi(150, 496, 420, 34, { c: 'gold' }), t(360, 522, '8% of 50  =  50% of 8  =  4', { size: 29, c: 'ink' }))
    ),
    predict: { q: 'Which is larger: 3/8 or 0.4?', choices: ['3/8', '0.4', 'They are equal'], answer: 1, why: '3/8 is 0.375, which sits just left of 0.4 on the line.' },
    steps: [
      'Start with halves and quarters: 1/4 = 0.25 = 25%, 1/2 = 0.5 = 50%, 3/4 = 0.75 = 75%.',
      'Fifths: each one is 0.2, or 20%. So 2/5 = 0.4, 3/5 = 0.6, 4/5 = 0.8. Tenths are half of those.',
      'Thirds repeat: 1/3 is about 0.333 (33.3%) and 2/3 is about 0.667 (66.7%).',
      'Eighths are half-quarters: 1/8 = 0.125. Then 3/8 = 0.375, 5/8 = 0.625, 7/8 = 0.875.',
      'Percent means "out of 100", and it commutes: x% of y equals y% of x. Flip to whichever is easier.'
    ],
    tryIt: [
      { q: 'What is 5/8 as a percent?', choices: ['62.5%', '58%', '0.625%'], answer: 0, why: '5/8 = 0.625. Move the decimal two places: 62.5%.' },
      { q: 'What is 16% of 25?', choices: ['40', '0.4', '4'], answer: 2, why: 'Flip it: 25% of 16 is a quarter of 16, which is 4.' },
      { q: 'Put 2/3, 0.6 and 5/8 in order from smallest to largest.', choices: ['5/8, 0.6, 2/3', '0.6, 5/8, 2/3', '2/3, 5/8, 0.6'], answer: 1, why: '0.6, then 5/8 = 0.625, then 2/3 = 0.667.' }
    ],
    more: [{ label: 'Worked solutions you can see', href: '/qr/worked/' }]
  });

  /* ---------- Algebra setup ---------- */
  B.add({
    id: 'algebra-setup', section: 'qr', title: 'Word problem to equation: the setup',
    sub: 'Name it, translate it, solve it, check it.',
    svg: K.svg(
      t(360, 52, 'A jacket and a hat cost $120.', { size: 27 }), t(360, 88, 'The jacket costs $80 more than the hat.', { size: 27 }),
      t(100, 172, 'hat', { size: 28, a: 'e' }), box(120, 132, 130, 62, { r: 8, c: 'blue', w: 5, fill: 'blue', op: 0.12 }),
      t(100, 268, 'jacket', { size: 28, a: 'e' }), box(120, 228, 130, 62, { r: 8, c: 'blue', w: 5, fill: 'blue', op: 0.12 }), box(250, 228, 300, 62, { r: 8, c: 'gold', w: 5, fill: 'gold', op: 0.3 }),
      path('M580 134 Q604 134 604 160 L604 196 Q604 212 622 212 Q604 212 604 228 L604 264 Q604 290 580 290', { c: 'ink', w: 4 }),
      step(1, t(185, 176, 'h', { size: 40, c: 'blue' }), t(185, 272, 'h', { size: 40, c: 'blue' })),
      step(2, t(400, 272, '+ 80', { size: 38, c: 'goldInk' })),
      step(3, t(668, 224, '120', { size: 32, c: 'rose' }), t(360, 356, 'h + (h + 80) = 120', { size: 38, c: 'ink' })),
      step(4, t(360, 412, '2h = 40', { size: 34, c: 'purple' }), hi(290, 438, 140, 38, { c: 'gold' }), t(360, 468, 'h = 20', { size: 38, c: 'purple' })),
      step(5, t(360, 528, 'check:  20 + 100 = 120,  100 − 20 = 80', { size: 25, c: 'green' }))
    ),
    predict: { q: 'Before any algebra: what does the hat cost?', choices: ['$40', '$20', '$60'], answer: 1, why: '$40 is the trap (120 − 80). If the hat were $40 the jacket would be $120 and the total $160.' },
    steps: [
      'Name the thing the question asks for. Let h be the price of the hat. One bar, one letter.',
      'Translate phrase by phrase. "$80 more than the hat" is h + 80. The jacket bar is a hat bar plus 80.',
      '"Cost $120 together" means add them: h + (h + 80) = 120.',
      'Solve: 2h + 80 = 120, so 2h = 40 and h = 20.',
      'Check against the words, not your equation: hat $20, jacket $100. Together $120, and the jacket is $80 more. Then answer what was asked.'
    ],
    tryIt: [
      { q: '"Five less than twice a number is 11." Which equation says this?', choices: ['2x − 5 = 11', '5 − 2x = 11', '2(x − 5) = 11'], answer: 0, why: '"Twice a number" is 2x. "Five less than" that is 2x − 5.' },
      { q: 'Two numbers add to 30 and differ by 6. What is the larger number?', choices: ['12', '24', '18'], answer: 2, why: 'x + (x − 6) = 30 gives 2x = 36, so x = 18. Check: 18 + 12 = 30.' },
      { q: '"x is 20% more than y" means:', choices: ['x = 0.2y', 'x = 1.2y', 'x = y + 20'], answer: 1, why: 'All of y plus 20% of y: 1.0y + 0.2y = 1.2y.' }
    ],
    path: { title: 'Set up a word problem', steps: ['Read what the question asks for', 'Name the unknown with a letter', 'Translate each phrase into math', 'Write one equation', 'Solve it', 'Check the answer against the words'] },
    more: [{ label: 'Worked solutions you can see', href: '/qr/worked/' }]
  });

  /* ---------- Powers and roots ---------- */
  var ST = [[95, 420], [205, 370], [315, 320], [425, 270], [535, 220], [645, 170]], VAL = ['1/4', '1/2', '1', '2', '4', '8'], EXP = ['2^{-2}', '2^{-1}', '2^{0}', '2^{1}', '2^{2}', '2^{3}'];
  B.add({
    id: 'powers-roots', section: 'qr', title: 'Powers, roots and quadratics',
    flick: {
      title: 'Above or below 1?', up: 'Greater than 1', down: 'Less than 1',
      cards: [
        { q: '2^{-1}', up: false, why: 'A negative exponent flips it: 1/2.' },
        { q: '(1/2)^{-2}', up: true, why: 'Flip, then square: 2^{2} = 4.' },
        { q: '9^{1/2}', up: true, why: 'The square root of 9 is 3.' },
        { q: '(1/4)^{1/2}', up: false, why: 'The square root of 1/4 is 1/2.' },
        { q: '10^{-3}', up: false, why: 'That is 0.001.' },
        { q: '(2/3)^{2}', up: false, why: '4/9. A fraction below 1 shrinks when squared.' },
        { q: '(3/2)^{2}', up: true, why: '9/4 = 2.25.' },
        { q: '8^{-1/3}', up: false, why: 'Cube root is 2, then flip: 1/2.' },
        { q: '(0.1)^{-1}', up: true, why: 'The reciprocal of 0.1 is 10.' },
        { q: 'The square root of 0.81', up: false, why: 'It is 0.9. Roots pull numbers toward 1, not past it.' },
        { q: '2^{1/2}', up: true, why: 'About 1.41.' },
        { q: '(1/9)^{-1/2}', up: true, why: 'Flip to 9, then root: 3.' }
      ]
    },
    sub: 'The exponent rules as one staircase, then one factoring move.',
    svg: K.svg(
      line([[40, 444], [40, 420], [150, 420], [150, 370], [260, 370], [260, 320], [370, 320], [370, 270], [480, 270], [480, 220], [590, 220], [590, 170], [700, 170]], { w: 5.5 }),
      ST.map(function (p, i) { return t(p[0], p[1] + 34, EXP[i], { size: 27, c: 'mute' }); }).join(''),
      step(1, ST.map(function (p, i) { return t(p[0], p[1] - 12, VAL[i], { size: 32, c: 'blue' }); }).join(''), t(48, 62, 'each step up: × 2', { size: 27, c: 'blue', a: 's' })),
      step(2, t(48, 108, '2^{2} × 2^{3} = 2^{5}     add', { size: 27, c: 'rose', a: 's' })),
      step(3, t(48, 154, '(2^{3})^{2} = 2^{6}     multiply', { size: 27, c: 'purple', a: 's' })),
      step(4, t(48, 200, '4^{1/2} = 2     half power = root', { size: 26, c: 'green', a: 's' })),
      step(5, t(500, 420, 'x^{2} − 5x + 6', { size: 32, c: 'ink' }), t(500, 466, '= (x − 2)(x − 3)', { size: 32, c: 'ink' }), hi(404, 494, 192, 32, { c: 'gold' }), t(500, 518, 'roots: 2 and 3', { size: 27, c: 'goldInk' }))
    ),
    predict: { q: 'What is 2^{-3}?', choices: ['−8', '1/8', '−6'], answer: 1, why: 'Three steps down from 2^{0} = 1, halving each time: 1/2, 1/4, 1/8. A negative exponent means a reciprocal.' },
    steps: [
      'Each step up multiplies by 2, each step down divides by 2. That is why 2^{0} = 1 and why negative exponents are fractions: 2^{-1} = 1/2.',
      'Multiplying powers of the same base adds the exponents: two steps then three steps is five steps. Dividing subtracts them.',
      'A power of a power multiplies the exponents: (2^{3})^{2} = 2^{6} = 64.',
      'A fractional exponent is a root: 4^{1/2} is the square root of 4. For 8^{2/3}, take the cube root first (2), then square it (4).',
      'To factor x^{2} − 5x + 6, find two numbers that multiply to +6 and add to −5: −2 and −3. Set each factor to zero for the roots.'
    ],
    tryIt: [
      { q: 'Simplify 3^{4} × 3^{2}.', choices: ['3^{6}', '3^{8}', '9^{6}'], answer: 0, why: 'Same base, multiply: add the exponents. 4 + 2 = 6.' },
      { q: 'What is 27^{2/3}?', choices: ['18', '6', '9'], answer: 2, why: 'Cube root of 27 is 3, and 3 squared is 9.' },
      { q: 'What are the roots of x^{2} − 7x + 12 = 0?', choices: ['−3 and −4', '3 and 4', '2 and 6'], answer: 1, why: '(x − 3)(x − 4) = 0: the numbers multiply to 12 and add to 7.' }
    ]
  });

  /* ---------- Trigonometry ---------- */
  B.add({
    id: 'trig-triangle', section: 'qr', title: 'Trigonometry, just enough',
    flick: {
      title: 'Positive or negative?', up: 'Positive', down: 'Negative',
      cards: [
        { q: 'sin 150°', up: true, why: 'Quadrant II: sine (the y value) is positive.' },
        { q: 'cos 150°', up: false, why: 'Quadrant II: cosine (the x value) is negative.' },
        { q: 'tan 150°', up: false, why: 'Positive over negative gives negative.' },
        { q: 'sin 210°', up: false, why: 'Quadrant III: y is negative.' },
        { q: 'tan 225°', up: true, why: 'Quadrant III: negative over negative is positive.' },
        { q: 'cos 300°', up: true, why: 'Quadrant IV: x is positive.' },
        { q: 'sin 330°', up: false, why: 'Quadrant IV: y is negative.' },
        { q: 'tan 300°', up: false, why: 'Negative over positive gives negative.' },
        { q: 'cos 120°', up: false, why: 'Quadrant II: x is negative.' },
        { q: 'cos 45°', up: true, why: 'Quadrant I: everything is positive.' },
        { q: 'sin 100°', up: true, why: 'Just past 90°, still above the x axis.' },
        { q: 'cos 180°', up: false, why: 'It is exactly -1.' }
      ]
    },
    sub: 'One right triangle, three ratios, two special triangles.',
    svg: K.svg(
      line([[160, 440], [560, 440], [560, 140], [160, 440]], { w: 5.5, fill: 'gold', op: 0.1 }),
      line([[532, 440], [532, 412], [560, 412]], { w: 3.5 }),
      path('M216 440 Q216 416 204 406', { c: 'rose', w: 4 }), t(238, 430, 'θ', { size: 30, c: 'rose' }),
      step(1, t(360, 476, 'adjacent', { size: 27, c: 'blue' }), t(574, 300, 'opposite', { size: 27, c: 'purple', a: 's' }), t(336, 268, 'hypotenuse', { size: 27, c: 'green', rot: -37 })),
      step(2, t(36, 58, 'sin = opp / hyp', { size: 28, c: 'ink', a: 's' }), t(36, 98, 'cos = adj / hyp', { size: 28, c: 'ink', a: 's' }), t(36, 138, 'tan = opp / adj', { size: 28, c: 'ink', a: 's' })),
      step(3, t(360, 516, '4', { size: 34, c: 'blue' }), t(610, 344, '3', { size: 34, c: 'purple', a: 's' }), t(404, 208, '5', { size: 34, c: 'green' }), hi(30, 166, 180, 32, { c: 'gold' }), t(36, 190, 'sin θ = 3/5', { size: 28, c: 'goldInk', a: 's' })),
      step(4, t(540, 372, '45-45-90:  1, 1, √2', { size: 23, c: 'ink', a: 'e' }), t(540, 404, '30-60-90:  1, √3, 2', { size: 23, c: 'ink', a: 'e' })),
      step(5, t(36, 238, 'sin 30° = 1/2', { size: 26, c: 'rose', a: 's' }), t(36, 274, 'tan 45° = 1', { size: 26, c: 'rose', a: 's' }))
    ),
    predict: { q: 'In a right triangle, the side opposite θ is 3 and the hypotenuse is 5. What is sin θ?', choices: ['3/5', '4/5', '3/4'], answer: 0, why: 'Sine is opposite over hypotenuse: 3/5.' },
    steps: [
      'Name the sides from the angle you care about: opposite is across from θ, adjacent touches θ, the hypotenuse is across from the right angle.',
      'SOH CAH TOA: sine is opposite over hypotenuse, cosine is adjacent over hypotenuse, tangent is opposite over adjacent.',
      'In a 3-4-5 triangle: sin θ = 3/5, cos θ = 4/5, tan θ = 3/4.',
      'Two triangles to memorize. 45-45-90 has sides 1, 1, √2. 30-60-90 has sides 1, √3, 2, with the 1 across from the 30° angle.',
      'Read the common values off those triangles: sin 30° = 1/2, cos 60° = 1/2, tan 45° = 1. And always sin^{2}θ + cos^{2}θ = 1.'
    ],
    tryIt: [
      { q: 'In the 3-4-5 triangle on the board, what is cos θ?', choices: ['3/5', '5/4', '4/5'], answer: 2, why: 'Cosine is adjacent over hypotenuse: 4/5.' },
      { q: 'A 30-60-90 triangle has a hypotenuse of 10. How long is the side opposite the 30° angle?', choices: ['5', '5√3', '10√3'], answer: 0, why: 'The sides are in the ratio 1 : √3 : 2. The shortest is half the hypotenuse: 5.' },
      { q: 'What is tan 45°?', choices: ['√2', '1', '1/2'], answer: 1, why: 'In a 45-45-90 triangle the two legs are equal, so opposite over adjacent is 1.' }
    ],
    more: [{ label: 'Triangle invariance lab', href: '/tools/qr/proposals/agent-06-geometry/tri-inv.html?from=see' }]
  });
})(typeof window !== 'undefined' ? window.AceBoard : (typeof require === 'function' ? require('../ace-board.js') : null));
