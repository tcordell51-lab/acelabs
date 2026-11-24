/* boards/qr2.js : Quantitative Reasoning whiteboards, set two (shared/ace-board.js draws them). */
(function (B) {
  'use strict';
  if (!B) return;
  var K = B.kit, t = K.t, line = K.line, arrow = K.arrow, box = K.box, circ = K.circ, step = K.step, hi = K.hi, dot = K.dot, curve = K.curve;

  /* ---------- Unit conversions ---------- */
  B.add({
    id: 'units', section: 'qr', title: 'Unit conversions: the train track',
    sub: 'Multiply by 1 until the units you do not want are gone.',
    svg: K.svg(
      t(360, 76, '90 km/h  =  ?  m/s', { size: 38 }),
      line([[40, 232], [680, 232]], { w: 5 }), line([[232, 160], [232, 304]], { w: 4 }), line([[456, 160], [456, 304]], { w: 4 }),
      t(136, 212, '90 km', { size: 36 }), t(136, 282, '1 h', { size: 36 }),
      step(1, t(344, 212, '1000 m', { size: 36, c: 'blue' }), t(344, 282, '1 km', { size: 36, c: 'blue' })),
      step(2, line([[136, 218], [182, 184]], { c: 'rose', w: 4.5 }), line([[340, 288], [386, 254]], { c: 'rose', w: 4.5 })),
      step(3, t(568, 212, '1 h', { size: 36, c: 'purple' }), t(568, 282, '3600 s', { size: 36, c: 'purple' }), line([[134, 288], [166, 254]], { c: 'rose', w: 4.5 }), line([[566, 218], [598, 184]], { c: 'rose', w: 4.5 })),
      step(4, t(360, 384, '90 × 1000 ÷ 3600', { size: 32 }), hi(276, 404, 168, 46, { c: 'gold' }), t(360, 440, '= 25 m/s', { size: 40, c: 'green' })),
      step(5, t(360, 520, 'area: convert twice.  1 yd^{2} = 3 × 3 = 9 ft^{2}', { size: 27, c: 'goldInk' }))
    ),
    predict: { q: 'A car travels 90 km/h. About how many meters does it cover each second?', choices: ['2.5', '25', '250'], answer: 1, why: '90 km is 90,000 m and an hour is 3,600 s. 90,000 ÷ 3,600 = 25 m/s.' },
    steps: [
      'Write what you have as a fraction, then multiply by a conversion written as a fraction equal to 1. Put the unit you want to remove on the opposite level.',
      'Units cancel like numbers. Kilometers on top, kilometers on the bottom: gone.',
      'Keep going until only the units you want remain. Hours cancel the same way.',
      'Now do the arithmetic: multiply everything on top, divide by everything on the bottom. 90,000 ÷ 3,600 = 25.',
      'Squared and cubed units need the factor squared or cubed. One yard is 3 feet, so one square yard is 9 square feet and one cubic yard is 27 cubic feet.'
    ],
    tryIt: [
      { q: 'How many minutes are in 2.5 hours?', choices: ['125', '150', '250'], answer: 1, why: '2.5 h × 60 min per h = 150 min.' },
      { q: 'A rug is 2 square yards. How many square feet is that?', choices: ['6', '12', '18'], answer: 2, why: '1 yd^{2} = 9 ft^{2}, so 2 yd^{2} = 18 ft^{2}.' },
      { q: '60 miles per hour is how many feet per second? (1 mile = 5,280 ft)', choices: ['44', '88', '176'], answer: 1, why: '60 × 5,280 ÷ 3,600 = 88 ft/s.' }
    ],
    path: { title: 'Convert any unit', steps: ['Write the given quantity as a fraction', 'Pick a conversion factor that cancels the unwanted unit', 'Place it so that unit is on the opposite level', 'Cancel the units', 'Repeat until only the target units remain', 'Multiply the tops and divide by the bottoms'] },
    more: [{ label: 'Fractions, decimals, percent', href: '/see/?b=number-line' }]
  });

  /* ---------- Probability ---------- */
  B.add({
    id: 'probability', section: 'qr', title: 'Probability: the tree',
    sub: 'Multiply along a branch. Add across branches.',
    svg: K.svg(
      t(130, 64, '3 red, 2 blue', { size: 30 }), t(130, 100, 'draw 2, no put-back', { size: 26, c: 'mute' }),
      dot(60, 290, 9), line([[60, 290], [236, 180]], { w: 4.5 }), line([[60, 290], [236, 400]], { w: 4.5 }),
      line([[300, 172], [470, 116]], { w: 4.5 }), line([[300, 172], [470, 228]], { w: 4.5 }), line([[300, 408], [470, 352]], { w: 4.5 }), line([[300, 408], [470, 464]], { w: 4.5 }),
      step(1, t(128, 214, '3/5', { size: 30, c: 'rose' }), t(128, 384, '2/5', { size: 30, c: 'blue' }), circ(268, 176, 24, { c: 'rose', w: 4, fill: 'rose', op: 0.2 }), t(268, 186, 'R', { size: 28, c: 'rose' }), circ(268, 404, 24, { c: 'blue', w: 4, fill: 'blue', op: 0.2 }), t(268, 414, 'B', { size: 28, c: 'blue' })),
      step(2, t(378, 122, '2/4', { size: 28, c: 'rose' }), t(378, 226, '2/4', { size: 28, c: 'blue' }), t(378, 352, '3/4', { size: 28, c: 'rose' }), t(378, 466, '1/4', { size: 28, c: 'blue' })),
      step(3, hi(486, 96, 190, 40, { c: 'gold' }), t(490, 126, 'RR = 3/10', { size: 30, a: 's' })),
      step(4, t(490, 238, 'RB = 3/10', { size: 30, c: 'purple', a: 's' }), t(490, 362, 'BR = 3/10', { size: 30, c: 'purple', a: 's' }), t(600, 300, 'add: 3/5', { size: 28, c: 'purple' })),
      step(5, t(490, 474, 'BB = 1/10', { size: 30, c: 'green', a: 's' }), t(360, 534, 'at least one red = 1 − 1/10 = 9/10', { size: 28, c: 'green' }))
    ),
    predict: { q: 'A bag has 3 red and 2 blue marbles. You draw two without replacement. What is the probability both are red?', choices: ['9/25', '3/10', '6/25'], answer: 1, why: 'First red: 3/5. Then only 2 of the remaining 4 are red: 2/4. Multiply: 6/20 = 3/10. The 9/25 answer forgets the bag changed.' },
    steps: [
      'First draw: 3 of the 5 marbles are red, so P(red) = 3/5 and P(blue) = 2/5.',
      'Second draw: the bag has changed. After a red, 2 of 4 are red. After a blue, 3 of 4 are red. That is what "without replacement" means.',
      'AND means multiply along the branch: red and then red is 3/5 × 2/4 = 3/10.',
      'OR means add the branches that count. One of each color can happen two ways: 3/10 + 3/10 = 3/5.',
      '"At least one" is easiest as 1 minus "none". At least one red = 1 − P(both blue) = 1 − 1/10 = 9/10. All four branches always add to 1.'
    ],
    tryIt: [
      { q: 'A fair coin is flipped 3 times. What is the probability of at least one head?', choices: ['1/2', '3/4', '7/8'], answer: 2, why: 'P(no heads) = (1/2)^{3} = 1/8, so at least one head is 1 − 1/8 = 7/8.' },
      { q: 'Two fair dice are rolled. What is the probability the sum is 7?', choices: ['1/6', '1/12', '7/36'], answer: 0, why: 'Six of the 36 outcomes sum to 7 (1+6, 2+5, 3+4 and their reverses): 6/36 = 1/6.' },
      { q: 'How many ways can 3 people be chosen from 5, when order does not matter?', choices: ['10', '15', '60'], answer: 0, why: '5 × 4 × 3 = 60 ordered picks, divided by 3! = 6 orderings of the same three: 10.' }
    ],
    path: { title: 'Solve a multi-step probability question', steps: ['List the stages in order', 'Decide: with or without replacement', 'Write the probability of each branch', 'Multiply along each branch that fits', 'Add the branches that fit', 'Check: is 1 minus the opposite easier?'] },
    more: [{ label: 'Probability Sandbox', href: '/tools/qr/proposals/agent-04-prob-tree/probability-sandbox.html' }]
  });

  /* ---------- Statistics ---------- */
  var SXv = function (v) { return 80 + 56 * v; };
  B.add({
    id: 'statistics', section: 'qr', title: 'Mean, median, mode and spread',
    sub: 'Five numbers on a line: 2, 4, 4, 5, 10.',
    svg: K.svg(
      line([[60, 330], [670, 330]], { w: 5 }), [0, 2, 4, 6, 8, 10].map(function (v) { return line([[SXv(v), 322], [SXv(v), 340]], { w: 3.5 }) + t(SXv(v), 374, String(v), { size: 27, c: 'mute' }); }).join(''),
      dot(SXv(2), 308, 13, { c: 'blue' }), dot(SXv(4), 308, 13, { c: 'blue' }), dot(SXv(4), 278, 13, { c: 'blue' }), dot(SXv(5), 308, 13, { c: 'blue' }), dot(SXv(10), 308, 13, { c: 'blue' }),
      step(1, arrow(SXv(4), 196, SXv(4), 252, { c: 'purple', w: 4.5 }), t(SXv(4), 180, 'median 4', { size: 29, c: 'purple' })),
      step(2, t(SXv(4), 142, 'mode 4', { size: 29, c: 'teal' })),
      step(3, K.path('M' + SXv(5) + ' 336 L' + (SXv(5) - 20) + ' 366 L' + (SXv(5) + 20) + ' 366 Z', { c: 'rose', w: 4, fill: 'rose', op: 0.4 }), t(SXv(5) + 4, 420, 'mean 5: the balance point', { size: 28, c: 'rose' })),
      step(4, circ(SXv(10), 308, 26, { c: 'goldInk', w: 4 }), t(SXv(10) - 20, 250, 'outlier', { size: 28, c: 'goldInk' }), arrow(SXv(8.6), 300, SXv(5.6), 300, { c: 'goldInk', w: 3.5, dash: '4 8' })),
      step(5, t(360, 486, 'SD: typical distance from the mean', { size: 28, c: 'green' }), t(360, 528, 'add 5 to all: SD same.  double all: SD doubles', { size: 26, c: 'green' }))
    ),
    predict: { q: 'For the data 2, 4, 4, 5, 10, which is larger: the mean or the median?', choices: ['The mean', 'The median', 'They are equal'], answer: 0, why: 'The mean is 25 ÷ 5 = 5. The median, the middle value, is 4. The 10 drags the mean up.' },
    steps: [
      'Median: put the values in order and take the middle one. With an even count, average the two middle values.',
      'Mode: the value that shows up most often.',
      'Mean: add them up and divide by how many. 25 ÷ 5 = 5. It is where the number line would balance.',
      'An outlier pulls the mean toward itself but barely moves the median. Skewed right, as here: mean greater than median.',
      'Standard deviation measures spread: roughly how far a typical value is from the mean. Adding a constant to every value shifts the mean but not the spread. Multiplying every value by k multiplies both.'
    ],
    tryIt: [
      { q: 'What is the median of 1, 3, 5, 100?', choices: ['4', '5', '27.25'], answer: 0, why: 'Even count: average the two middle values, (3 + 5) ÷ 2 = 4.' },
      { q: 'The mean of four numbers is 6. A fifth number, 11, is added. What is the new mean?', choices: ['7', '8.5', '6.5'], answer: 0, why: 'The four sum to 24. Add 11 to get 35, and 35 ÷ 5 = 7.' },
      { q: 'Every score in a class is raised by 5 points. The standard deviation:', choices: ['Rises by 5', 'Stays the same', 'Is multiplied by 5'], answer: 1, why: 'Everything shifts together, so the spread around the mean does not change.' }
    ],
    path: { title: 'Find the missing value from a mean', steps: ['Multiply the mean by the count to get the total', 'Add up the values you know', 'Subtract to find what is missing', 'Check by recomputing the mean'] },
    more: [{ label: 'Stats lab', href: '/tools/qr/proposals/agent-05-stats/stats-lab.html' }]
  });

  /* ---------- Geometry: area and volume ---------- */
  B.add({
    id: 'geometry', section: 'qr', title: 'Area and volume: six shapes',
    sub: 'Most formulas are "base area times height", or a fraction of it.',
    svg: K.svg(
      box(70, 60, 180, 130, { r: 3, w: 5 }), line([[70, 190], [250, 60]], { w: 4, c: 'blue' }),
      circ(360, 126, 66, { w: 5 }), line([[360, 126], [426, 126]], { w: 4, c: 'blue' }), dot(360, 126, 6), t(392, 116, 'r', { size: 28, c: 'blue' }),
      circ(590, 72, 62, 17, { w: 5 }), line([[528, 72], [528, 180]], { w: 5 }), line([[652, 72], [652, 180]], { w: 5 }), curve([[528, 180], [560, 195], [590, 198], [620, 195], [652, 180]], { w: 5 }),
      line([[60, 432], [140, 292], [220, 432]], { w: 5 }), circ(140, 432, 80, 17, { w: 5 }),
      circ(360, 366, 70, { w: 5 }), circ(360, 366, 70, 18, { w: 3, c: 'mute', dash: '4 8' }),
      box(520, 392, 40, 40, { r: 2, w: 4.5 }), box(590, 352, 80, 80, { r: 2, w: 4.5 }),
      step(1, t(160, 240, 'bh,  1/2 bh', { size: 27, c: 'blue' })),
      step(2, t(360, 240, 'πr^{2},  2πr', { size: 27, c: 'purple' })),
      step(3, t(590, 240, 'πr^{2}h', { size: 30, c: 'green' })),
      step(4, t(140, 488, '1/3 πr^{2}h', { size: 28, c: 'rose' }), t(360, 488, '4/3 πr^{3}', { size: 28, c: 'rose' })),
      step(5, t(596, 488, 'length ×2', { size: 27, c: 'goldInk' }), t(360, 536, 'double every length: area ×4, volume ×8', { size: 27, c: 'goldInk' }))
    ),
    predict: { q: 'A square\'s side is doubled. Its area is multiplied by:', choices: ['2', '4', '8'], answer: 1, why: 'Area depends on length squared. 2^{2} = 4.' },
    steps: [
      'Rectangle: base times height. A triangle is half of the rectangle around it: 1/2 × base × height, with the height measured straight up.',
      'Circle: area is πr^{2}, distance around is 2πr. Use π as about 3.14, or 22/7 when it cancels nicely.',
      'Any prism or cylinder: area of the base times the height. A cylinder is πr^{2}h. A box is length × width × height.',
      'Pointed shapes hold one third of the prism around them: cone 1/3 πr^{2}h. A sphere is 4/3 πr^{3} with surface area 4πr^{2}.',
      'Scaling: if every length is multiplied by k, areas are multiplied by k^{2} and volumes by k^{3}.'
    ],
    tryIt: [
      { q: 'A triangle has base 10 and height 6. Its area is:', choices: ['60', '30', '16'], answer: 1, why: '1/2 × 10 × 6 = 30.' },
      { q: 'A cylinder has radius 3 and height 5. Its volume is:', choices: ['15π', '30π', '45π'], answer: 2, why: 'π × 3^{2} × 5 = 45π.' },
      { q: 'The radius of a sphere is tripled. Its volume is multiplied by:', choices: ['3', '9', '27'], answer: 2, why: 'Volume depends on length cubed. 3^{3} = 27.' }
    ],
    path: { title: 'Solve an area or volume question', steps: ['Sketch the shape and label what is given', 'Pick the formula', 'Check the units match', 'Find any missing length first', 'Substitute and simplify', 'Sanity-check the size of the answer'] },
    more: [{ label: 'Right triangles and trig', href: '/see/?b=trig-triangle' }, { label: '2D geometry explorer', href: '/tools/qr/proposals/agent-06-geometry/geo-2d.html' }]
  });

  /* ---------- Data sufficiency ---------- */
  function q(x, y, s) { return box(x - 88, y - 30, 176, 60, { w: 4.5 }) + t(x, y + 10, s, { size: 27 }); }
  function leaf(x, y, s, col) { return circ(x, y, 30, { w: 5, c: col, fill: col, op: 0.18 }) + t(x, y + 13, s, { size: 36, c: col }); }
  function yn(x, y, s) { return t(x, y, s, { size: 26, c: 'mute' }); }
  B.add({
    id: 'data-sufficiency', section: 'qr', title: 'Data sufficiency: the decision tree',
    sub: 'You are not asked for the answer. Only whether you could get it.',
    svg: K.svg(
      q(360, 56, '(1) alone?'), q(180, 180, '(2) alone?'), q(540, 180, '(2) alone?'), q(620, 310, 'together?'),
      line([[300, 88], [200, 148]], { w: 4 }), line([[420, 88], [520, 148]], { w: 4 }), yn(226, 110, 'yes'), yn(494, 110, 'no'),
      line([[150, 212], [100, 272]], { w: 4 }), line([[210, 212], [262, 272]], { w: 4 }), yn(98, 240, 'yes'), yn(262, 240, 'no'),
      line([[510, 212], [458, 272]], { w: 4 }), line([[570, 212], [606, 278]], { w: 4 }), yn(458, 240, 'yes'), yn(614, 240, 'no'),
      line([[590, 342], [556, 396]], { w: 4 }), line([[650, 342], [676, 396]], { w: 4 }), yn(540, 366, 'yes'), yn(694, 366, 'no'),
      circ(90, 306, 30, { w: 4, c: 'mute' }), circ(270, 306, 30, { w: 4, c: 'mute' }), circ(450, 306, 30, { w: 4, c: 'mute' }), circ(548, 430, 30, { w: 4, c: 'mute' }), circ(680, 430, 30, { w: 4, c: 'mute' }),
      step(1, leaf(90, 306, 'D', 'green'), leaf(270, 306, 'A', 'blue')),
      step(2, leaf(450, 306, 'B', 'blue')),
      step(3, leaf(548, 430, 'C', 'purple'), leaf(680, 430, 'E', 'rose')),
      step(4, t(250, 444, 'x = ?', { size: 34 }), t(250, 486, '(1) x^{2} = 9      (2) x > 0', { size: 28 })),
      step(5, hi(96, 506, 308, 36, { c: 'gold' }), t(250, 532, 'only together: C', { size: 29, c: 'purple' }))
    ),
    predict: { q: 'What is x?  (1) x^{2} = 9.  (2) x > 0.  Is statement (1) alone enough?', choices: ['Yes', 'No'], answer: 1, why: 'x^{2} = 9 allows x = 3 or x = −3. Two possible values is not sufficient.' },
    steps: [
      'Test statement (1) by itself, as if (2) did not exist. If it is enough, the answer is A or D. Then test (2) alone: if it is also enough, D (each alone). If not, A.',
      'If (1) alone failed but (2) alone works, the answer is B.',
      'Only when both fail on their own do you combine them. Together enough: C. Still not enough: E.',
      'Example: x^{2} = 9 gives two values, so (1) fails. x > 0 gives infinitely many, so (2) fails.',
      'Together: x is 3 or −3, and positive, so x = 3. One value: sufficient together. Answer C. For a yes or no question, "always no" is just as sufficient as "always yes".'
    ],
    tryIt: [
      { q: 'What is x?  (1) 2x + 1 = 7.  (2) x^{2} = 9.', choices: ['A: (1) alone', 'B: (2) alone', 'C: both together', 'D: each alone'], answer: 0, why: '(1) gives x = 3, one value. (2) gives 3 or −3. Only (1) is sufficient: A.' },
      { q: 'Is n even?  (1) n is a multiple of 4.  (2) n is a multiple of 6.', choices: ['A: (1) alone', 'C: both together', 'D: each alone', 'E: not enough'], answer: 2, why: 'Any multiple of 4 is even, and any multiple of 6 is even. Each alone answers the question: D.' },
      { q: 'What is x + y?  (1) x = 5.  (2) y is positive.', choices: ['A: (1) alone', 'B: (2) alone', 'C: both together', 'E: not enough'], answer: 3, why: 'Even together, y could be any positive number, so the sum is not fixed: E.' }
    ],
    path: { title: 'Work a data sufficiency question', steps: ['Read the question: value, or yes or no?', 'Simplify the question before the statements', 'Test statement (1) alone', 'Forget (1). Test statement (2) alone', 'Combine only if both failed', 'Pick the letter from the tree'] },
    more: [{ label: 'Quantitative comparison', href: '/see/?b=quant-compare' }]
  });

  /* ---------- Quantitative comparison ---------- */
  B.add({
    id: 'quant-compare', section: 'qr', title: 'Quantitative comparison: try to flip it',
    sub: 'Do not compute more than you need. Try to break the pattern.',
    svg: K.svg(
      line([[160, 204], [560, 204]], { w: 6 }), K.path('M360 204 L330 300 L390 300 Z', { w: 5, fill: 'gold', op: 0.3, c: 'goldInk' }),
      line([[160, 204], [160, 226]], { w: 4 }), line([[560, 204], [560, 226]], { w: 4 }),
      box(80, 226, 160, 80, { w: 5, c: 'blue' }), box(480, 226, 160, 80, { w: 5, c: 'rose' }),
      t(160, 150, 'Quantity A', { size: 28, c: 'blue' }), t(560, 150, 'Quantity B', { size: 28, c: 'rose' }),
      t(160, 282, 'x^{2}', { size: 40, c: 'blue' }), t(560, 280, 'x', { size: 40, c: 'rose' }),
      step(1, t(360, 368, 'A bigger    B bigger    equal    cannot tell', { size: 27 })),
      step(2, t(360, 76, 'do the same thing to both sides', { size: 28, c: 'green' })),
      step(3, t(170, 440, 'x = 2:   4 > 2', { size: 30, c: 'blue' })),
      step(4, t(540, 440, 'x = 1/2:   1/4 < 1/2', { size: 30, c: 'rose' })),
      step(5, hi(146, 494, 428, 40, { c: 'gold' }), t(360, 522, 'it flipped: cannot be determined', { size: 29 }))
    ),
    predict: { q: 'Quantity A is x^{2}. Quantity B is x. Nothing else is given about x. Which is greater?', choices: ['Quantity A', 'Quantity B', 'They are equal', 'It cannot be determined'], answer: 3, why: 'For x = 2, A is bigger. For x = 1/2, B is bigger. For x = 1 they are equal. The relationship changes, so it cannot be determined.' },
    steps: [
      'There are always the same four answers: A is greater, B is greater, they are equal, or the relationship cannot be determined from what is given.',
      'Simplify like an equation: add or subtract the same thing on both sides, or multiply and divide both by a positive number. Never multiply by a variable whose sign you do not know.',
      'Plug in an easy number first. With x = 2, A is 4 and B is 2, so A looks bigger.',
      'Now try to break it with a different kind of number: zero, one, a negative, a fraction between 0 and 1, something huge. With x = 1/2, B is bigger.',
      'If two legal values give two different results, the answer is "cannot be determined". If both quantities are pure numbers with no variables, it can always be determined.'
    ],
    tryIt: [
      { q: 'Quantity A: 3/7.  Quantity B: 5/12.', choices: ['A is greater', 'B is greater', 'They are equal', 'Cannot be determined'], answer: 0, why: 'Cross-multiply: 3 × 12 = 36 and 5 × 7 = 35. 36 > 35, so 3/7 is greater.' },
      { q: 'x is positive.  Quantity A: x + 5.  Quantity B: x + 3.', choices: ['A is greater', 'B is greater', 'They are equal', 'Cannot be determined'], answer: 0, why: 'Subtract x from both sides: 5 versus 3. A is always greater.' },
      { q: 'Quantity A: 2x.  Quantity B: 3x.  (x can be any real number.)', choices: ['A is greater', 'B is greater', 'They are equal', 'Cannot be determined'], answer: 3, why: 'x = 1 makes B bigger, x = −1 makes A bigger, and x = 0 makes them equal.' }
    ],
    path: { title: 'Work a quantitative comparison', steps: ['Read both quantities and any conditions', 'Simplify both sides the same way', 'Plug in an easy number', 'Plug in 0, 1, a negative and a fraction', 'If the result ever changes: cannot be determined', 'If it never changes, pick that relationship'] },
    more: [{ label: 'Data sufficiency: the decision tree', href: '/see/?b=data-sufficiency' }]
  });
})(typeof window !== 'undefined' ? window.AceBoard : (typeof require === 'function' ? require('../ace-board.js') : null));
