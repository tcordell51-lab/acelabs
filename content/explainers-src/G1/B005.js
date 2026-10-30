// content/explainers-src/G1/B005.js: batch B005, Full-Length Test 1
// Quantitative Reasoning, first half (19 items: algebra with one unknown,
// fractions, decimals and number sense, a sphere's volume, percents, and
// powers, roots and quadratics). Written in Thomas's coaching voice
// (docs/release-2026-10-30/questions/voice-codex.md) from the independent
// expert's blind solve (docs/explainers/solves/B005.json: 19 of 19 keys agree,
// no key or picture disputes).
//
// Authoring source, never published: /content/explainers-src/* is
// force-redirected like /docs/*. The build (scripts/explainers/build.mjs)
// checks every entry against tools/mock/data/full-mocks.js (key text, every
// choice text, stem hash), runs the copy rules, and recomputes every picture
// with tools/explain/visuals/compute-qr.js: each spec's check block (the key
// and the route behind every trap note, every input found in the stem), the
// worked lines by substitution or by sampling, number-line rays, jumps and test
// points, parabolas from their own a, b and c, place-value columns, fraction
// bars, part-whole bars and cells, the order-of-operations tree, exponent
// chips, sphere measures, and every plain arithmetic claim in the words.
//
// Visuals (production-plan.md, G1 row B005: qr.partwhole 10, qr.work 8,
// qr.geometry 1). The row's counts come from subtopics; four items in the
// fractions-and-number-sense subtopic take qr.work because the idea is not a
// part of a whole: the delivery route is net position on a number line, the
// scientific-notation product and the order of operations are worked lines and
// a tree, and the crate weight is place-value columns. The clinic crates item
// (algebra) takes qr.partwhole groups, because kept and returned crates are
// parts of every clinic's delivery. So: qr.partwhole 7 (groups, bars,
// fractions), qr.work 11, qr.geometry 1. Renderers:
// tools/explain/visuals/qr-work.js.
'use strict';

const FM = 'tools/mock/data/full-mocks.js';
const src = (id, n) => ({ bank: FM, global: 'ACE_FULL_MOCKS', locator: { mock: 'FULL_1', section: 'qr', id }, servedAs: 'Full-Length Test 1, Quantitative Reasoning, question ' + n });
const band = (d) => ({ band: d, from: 'bank field d (1-3)' });
// Play with it: a skill section of the QR engine. The anchor scrolls the page
// to the section (checked in Chromium for every anchor used here).
const QRE = 'tools/qr/index.html';
const qre = (sec, label, expect, more) => ({
  label, href: QRE + '#' + sec, state: { section: sec }, expect: ['id="' + sec + '"'].concat(expect || []),
  routing: 'Works today: the anchor scrolls the QR engine to this skill section, with its pattern card, its picture and its worked examples. A first-visit tour opens on top (Skip closes it), and the section header reads LOCKED until its prerequisites are marked mastered, though everything in it still shows. ' + (more ? more + ' ' : '') + 'The page also carries a timed simulator, a streak counter and mastery counts in its other views; the anchor lands on the section, not on those.'
});

const ENTRIES = [
  /* ===================== Algebra: one and two unknowns ===================== */
  {
    qid: 'fm:qr-a:dis1285',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.algebra.distributive',
    difficulty: band(3),
    source: src('qr-a:dis1285', 9),
    keyText: '12',
    answer: { line: 'Each clinic keeps 5 - 2 = 3 crates, and there are 4 clinics: 4 x 3 = 12.' },
    steps: [
      'Find the net for one clinic first. 5 in, 2 back, 3 kept.',
      'Then multiply by the clinics: 4 x 3 = 12 crates kept.',
      'Check it the long way: 4 x 5 = 20 delivered, 4 x 2 = 8 returned, 20 - 8 = 12. The return happens at every clinic, so it gets multiplied too.'
    ],
    choices: [
      { text: '3', role: 'trap', family: 'one-step-short', trap: 'One clinic only', note: '3 is what one clinic keeps. The stem asks for all four clinics together, so multiply by 4.' },
      { text: '8', role: 'trap', family: 'other-question', trap: 'The returned pile', note: '8 is every crate sent back, 4 x 2. A true count, but of the other pile. The question asks what the clinics kept.' },
      { text: '12', role: 'key', note: 'Three kept at each of four clinics.' },
      { text: '16', role: 'trap', family: 'other-unit', trap: 'Took off 4, not 8', note: '20 - 4 = 16 takes off one crate per clinic. Each clinic sent back 2, so 4 x 2 = 8 crates come off the 20.' },
      { text: '18', role: 'trap', family: 'half-right', trap: 'Returned only once', note: '4 x 5 - 2 multiplies the deliveries but takes the 2 back only once. Every clinic returned 2, so the 2 gets multiplied by 4 as well.' }
    ],
    lockIt: 'A give-back in every group gets multiplied too: 4(5 - 2) = 4 x 5 - 4 x 2.',
    hook: null,
    playWith: qre('distrib', 'Distribution area model: set a, b and c and see a(b + c) split into ab + ac', ['Big rectangle area']),
    video: { slot: 'qr.algebra.distributive', title: 'The multiplier touches every term', id: null, start: null },
    visual: {
      type: 'qr.partwhole',
      style: 'groups',
      focus: 'kept-column',
      groups: 4,
      groupName: 'Clinic',
      each: [{ label: 'kept', n: 3, kind: 'key' }, { label: 'returned', n: 2, kind: 'off' }],
      columns: [
        { part: 0, label: 'kept: 4 x 3 = 12', key: true, choice: '12' },
        { part: 1, label: 'returned: 4 x 2 = 8', trap: true, choice: '8' }
      ],
      check: { vars: { clinics: 4, got: 5, back: 2 }, key: 'clinics*(got - back)', routes: [{ choice: '3', expr: 'got - back' }, { choice: '8', expr: 'clinics*back' }, { choice: '16', expr: 'clinics*got - clinics' }, { choice: '18', expr: 'clinics*got - back' }] },
      reuse: 'new: qr.partwhole style groups (tools/explain/visuals/qr-work.js); the build recomputes the key, every trap route and both column totals',
      alt: 'Four rows, one per clinic, of 5 crate squares: 3 solid kept squares and 2 hatched returned squares in each. A bracket under the kept columns reads kept, 4 x 3 = 12, outlined as the answer; a bracket under the returned columns reads 4 x 2 = 8.',
      caption: 'Read down the kept columns: 3 in every row, 4 rows. The hatched columns are the 8 crates that went back.'
    },
    demoPick: '18',
    flags: []
  },
  {
    qid: 'fm:qr-a:neg1332',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.algebra.inequalities',
    difficulty: band(3),
    source: src('qr-a:neg1332', 20),
    keyText: 'x > 0',
    answer: { line: 'Divide both sides by -3 and the sign flips: x > 0.' },
    steps: [
      'Spot the negative you divide by. Getting x alone means dividing both sides by -3, and dividing by a negative flips the inequality.',
      'Flip it: x > 0. Zero divided by -3 is still 0.',
      'Test a point on each side. x = 1 gives -3 < 0, true. x = -1 gives 3 < 0, false. Positive x works.',
      'x = 0 gives 0 < 0, which is false. So 0 stays out, and the sign stays strict.'
    ],
    choices: [
      { text: 'x = 0', role: 'trap', family: 'other-question', trap: 'The boundary only', note: '0 is where -3x equals 0, the edge of the answer. It does not satisfy -3x < 0, since 0 < 0 is false.' },
      { text: 'x ≤ 0', role: 'trap', family: 'reversed', trap: 'The opposite side', note: 'This is exactly where -3x is 0 or more. Test x = -1: -3(-1) = 3, and 3 is not less than 0.' },
      { text: 'x > 0', role: 'key', note: 'Divide by -3, flip the sign.' },
      { text: 'x < 0', role: 'trap', family: 'missed-exception', trap: 'Forgot the flip', note: 'This divides by -3 as if it were positive and keeps the sign. Dividing by a negative is the one move that flips an inequality.' },
      { text: 'x ≥ 0', role: 'trap', family: 'half-right', trap: 'Let 0 in', note: 'The direction is right, but 0 sneaks in. -3(0) = 0, and 0 is not less than 0, so the sign stays strict.' }
    ],
    lockIt: 'Multiply or divide an inequality by a negative and the sign flips. Then test a point.',
    hook: null,
    playWith: qre('neg-ineq', 'Negatives and Inequalities stepper: step through -2x < 6 and watch the sign flip at the divide', ['ineqStep']),
    video: { slot: 'qr.algebra.inequalities', title: 'Divide by a negative, flip the sign', id: null, start: null },
    visual: {
      type: 'qr.work',
      focus: 'ray-right-of-zero',
      lines: { v: 'x', rows: [
        { expr: '-3x < 0', tag: 'start' },
        { expr: 'x > 0', move: 'divide both sides by -3: flip the sign', key: true, choice: 'x > 0', tag: 'the answer' }
      ] },
      numberline: {
        min: -4, max: 4, step: 1,
        labels: [{ v: -4, label: '-4' }, { v: -2, label: '-2' }, { v: 0, label: '0', bold: true }, { v: 2, label: '2' }, { v: 4, label: '4' }],
        rays: [{ from: 0, dir: 1, open: true, key: true, label: 'x > 0', choice: 'x > 0' }],
        tests: [
          { x: -1, f: '-3x', rel: '<', rhs: 0, holds: false, label: 'x = -1: 3 < 0, false' },
          { x: 1, f: '-3x', rel: '<', rhs: 0, holds: true, label: 'x = 1: -3 < 0, true' }
        ]
      },
      check: { v: 'x', keyIneq: { f: '-3x', rel: '<', rhs: '0' }, routes: [{ choice: 'x = 0', ineq: { f: '-3x', rel: '=', rhs: '0' } }, { choice: 'x ≤ 0', ineq: { f: '-3x', rel: '>=', rhs: '0' } }, { choice: 'x < 0', ineq: { f: 'x', rel: '<', rhs: '0/(-3)' } }, { choice: 'x ≥ 0', ineq: { f: '-3x', rel: '<=', rhs: '0' } }] },
      reuse: 'new: qr.work blocks lines and numberline (tools/explain/visuals/qr-work.js); the build samples every line and the ray against the stem inequality and checks both test points',
      alt: 'Two worked lines: -3x < 0, then x > 0 after dividing by -3 and flipping the sign, outlined as the answer. Below, a number line from -4 to 4 with an open circle at 0 and a bold ray to the right; a test point at -1 reads false and one at 1 reads true.',
      caption: 'The open circle keeps 0 out. The test point on the ray passes, and the one left of 0 does not.'
    },
    demoPick: 'x < 0',
    flags: [
      { kind: 'stem-style', text: 'Shorthand stem (7 words). Suggested wording for Thomas to review (not applied): "Which inequality describes every value of x for which -3x < 0?" Key unchanged.' },
      { kind: 'bank-copy', text: 'The bank why uses capitalized FLIP, and the bank stores no trap notes for this item, so every note here is written fresh.' }
    ]
  },
  {
    qid: 'fm:qr-a:abs1739',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.algebra.absolute-value',
    difficulty: band(3),
    source: src('qr-a:abs1739', 22),
    keyText: '14 or 6',
    answer: { line: 'Exactly 4 degrees from 10 means one step of 4 each way: 14 or 6.' },
    steps: [
      'Picture 10 on a number line. Exactly 4 away is a distance, and a distance runs both ways.',
      'Step 4 up: 10 + 4 = 14. Step 4 down: 10 - 4 = 6.',
      'In algebra that is |x - 10| = 4, so x - 10 = 4 or x - 10 = -4. Same two answers.'
    ],
    choices: [
      { text: '14 or 6', role: 'key', note: 'One step of 4 on each side of 10.' },
      { text: '-6 or 6', role: 'trap', family: 'half-right', trap: 'Measured from 0', note: '6 is real. -6 comes from putting the plus-or-minus on x itself, as if the distance ran from 0. It runs from the setting, 10.' },
      { text: '14', role: 'trap', family: 'one-step-short', trap: 'Only the warm side', note: '14 is 4 degrees above the setting. The room could just as well be 4 degrees below it, at 6.' },
      { text: '4 or -4', role: 'trap', family: 'other-question', trap: 'The gaps, not temperatures', note: '4 and -4 are the gaps x - 10, how far the room sits above or below 10. The stem asks for the temperatures, x itself.' },
      { text: '6 or -14', role: 'trap', family: 'sign-slip', trap: 'Setting and gap swapped', note: 'This solves |x + 4| = 10: the 10 and the 4 swapped, and the sign on the center lost. 6 survives by luck; -14 is 24 degrees from the setting.' }
    ],
    lockIt: 'Exactly d away from c means two answers: c + d and c - d.',
    hook: null,
    playWith: qre('absval', 'Absolute value number line: drag x and read its distance from 0', ['Drag x'], 'The section measures distance from 0; this item measures it from 10, the same idea with the center moved.'),
    video: { slot: 'qr.algebra.absolute-value', title: 'Absolute value is a distance', id: null, start: null },
    visual: {
      type: 'qr.work',
      focus: 'both-landing-points',
      lines: { v: 'x', rows: [
        { expr: '|x - 10| = 4', tag: '4 away from 10' },
        { expr: 'x - 10 = 4 or x - 10 = -4', move: 'a distance runs both ways' },
        { expr: 'x = 14 or x = 6', move: 'add 10 to each', key: true, choice: '14 or 6', tag: 'the answer' }
      ] },
      numberline: {
        min: 0, max: 16, step: 1,
        labels: [{ v: 0, label: '0' }, { v: 2, label: '2' }, { v: 4, label: '4' }, { v: 6, label: '6' }, { v: 8, label: '8' }, { v: 10, label: '10', bold: true }, { v: 12, label: '12' }, { v: 14, label: '14' }, { v: 16, label: '16' }],
        jumps: [{ from: 10, by: -4, label: '4 down', key: true, choice: '14 or 6' }, { from: 10, by: 4, label: '4 up', key: true, choice: '14 or 6' }],
        points: [{ x: 6, key: true, label: 'x = 6', choice: '14 or 6' }, { x: 10, label: 'setting: 10', open: true }, { x: 14, key: true, label: 'x = 14', choice: '14 or 6' }]
      },
      check: { vars: { set: 10, gap: 4 }, keySet: ['set + gap', 'set - gap'], routes: [{ choice: '-6 or 6', set: ['set - gap', '-(set - gap)'] }, { choice: '14', set: ['set + gap'] }, { choice: '4 or -4', set: ['gap', '-gap'] }, { choice: '6 or -14', set: ['set - gap', '-set - gap'] }] },
      reuse: 'new: qr.work blocks lines and numberline (tools/explain/visuals/qr-work.js); the build recomputes both landing points and every trap pair',
      alt: 'Worked lines split |x - 10| = 4 into two cases, giving x = 14 or x = 6, outlined. Below, a number line from 0 to 16 with the setting at 10 and two arcs of 4 leaving it, down to 6 and up to 14, both outlined as the answer.',
      caption: 'Both arcs are 4 long. A distance from the setting lands once on each side of it.'
    },
    demoPick: '14',
    flags: [
      { kind: 'bank-copy', text: 'The bank trap note on "6 or -14" ("solves the positive branch correctly and then subtracts the constant on the negative branch") does not reproduce the choice: the positive branch gives 14, which the choice lacks. The route that gives 6 and -14 is |x + 4| = 10 (setting and distance swapped); the note here names that. The bank why also carries the plus-minus and minus glyphs.' },
      { kind: 'note', text: 'Concept-first rule: "6 or -14" needs two slips (setting and gap swapped, sign on the center lost), so it is a weak distractor. A one-slip option, "14 or -6" (the sign on the second answer), would test the same idea more cleanly. Key unchanged.' }
    ]
  },
  {
    qid: 'fm:qr-a:lin1255',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.algebra.linear-equations',
    difficulty: band(2),
    source: src('qr-a:lin1255', 24),
    keyText: '-3',
    answer: { line: 'Collect x on one side and the numbers on the other: -4x = 12, so x = -3.' },
    steps: [
      'Put the x terms on one side first. Subtract x from both sides: -4x - 2 = 10.',
      'Then the numbers. Add 2 to both sides: -4x = 12.',
      'Divide by -4: x = -3. A positive divided by a negative is negative.',
      'Check it in the original: -3(-3) - 2 = 7 and -3 + 10 = 7. Both sides match.'
    ],
    choices: [
      { text: '-6', role: 'trap', family: 'operation-flip', trap: 'Added the x instead', note: 'Adding x to -3x gives -2x = 12, so x = -6. To clear x off the right side, subtract it from both sides: -3x - x = -4x.' },
      { text: '-4', role: 'trap', family: 'one-step-short', trap: 'Stopped at the -4', note: '-4 is the number in front of x after collecting, -4x = 12. One move is left: divide 12 by -4.' },
      { text: '-3', role: 'key', note: 'Twelve divided by -4.' },
      { text: '-2', role: 'trap', family: 'sign-slip', trap: 'Moved the 2 unchanged', note: 'Carrying the -2 across without changing its sign gives -4x = 10 - 2 = 8, so x = -2. Add 2 to both sides instead: 10 + 2 = 12.' },
      { text: '3', role: 'trap', family: 'sign-slip', trap: 'Dropped the minus', note: 'The setup -4x = 12 is right, but 12 divided by -4 is -3. A positive over a negative comes out negative.' }
    ],
    lockIt: 'Same move to both sides: x terms to one side, numbers to the other, then divide.',
    hook: null,
    playWith: qre('lin-eq', 'Linear Equations balance: pick 5x - 7 = 2x + 8 and keep both pans level one move at a time', ['5x-7=2x+8', 'Inverse PEMDAS']),
    video: { slot: 'qr.algebra.linear-equations', title: 'One move, both sides', id: null, start: null },
    visual: {
      type: 'qr.work',
      focus: 'x-equals-minus-3',
      lines: {
        v: 'x',
        rows: [
          { expr: '-3x - 2 = x + 10', tag: 'start' },
          { expr: '-4x - 2 = 10', move: 'subtract x from both sides' },
          { expr: '-4x = 12', move: 'add 2 to both sides' },
          { expr: 'x = -3', move: 'divide both sides by -4', key: true, choice: '-3', tag: 'the answer' }
        ],
        exits: [
          { at: 1, label: 'Add x instead of subtracting it and you get -2x - 2 = 10, which leads to -6.', choice: '-6', value: '12/(-3 + 1)' },
          { at: 2, label: 'Divide by 4 instead of -4 and the minus drops: you land on 3.', choice: '3', value: '12/4' }
        ]
      },
      check: { vars: { a: -3, b: -2, c: 10 }, v: 'x', key: '(c - b)/(a - 1)', keySolves: '-3x - 2 = x + 10', routes: [{ choice: '-6', expr: '(c - b)/(a + 1)' }, { choice: '-4', expr: 'a - 1' }, { choice: '-2', expr: '(c + b)/(a - 1)' }, { choice: '3', expr: '(c - b)/(1 - a)' }] },
      reuse: 'new: qr.work block lines (tools/explain/visuals/qr-work.js); the build checks every line is true at x = -3 and recomputes every trap route',
      alt: 'Four worked lines: -3x - 2 = x + 10, then -4x - 2 = 10 after subtracting x, then -4x = 12 after adding 2, then x = -3 after dividing by -4, outlined as the answer. Two dashed side notes show adding x leading to -6 and dropping the minus leading to 3.',
      caption: 'Each arrow is one move made on both sides. The dashed notes mark the two places this setup most often slips.'
    },
    demoPick: '3',
    flags: [
      { kind: 'bank-copy', text: 'The bank trap note on -4 is a substitution check ("Substituting -4 gives 10 on the left and 6 on the right"), not the route a student takes; the note here names the route (stopping at the coefficient). The bank why uses an arrow glyph.' }
    ]
  },

  /* ================= Fractions, decimals and number sense ================= */
  {
    qid: 'fm:qr-a:fam5',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.numbers.fractions',
    difficulty: band(2),
    source: src('qr-a:fam5', 4),
    keyText: '1',
    answer: { line: 'Forward 4/6 and 5/6, back 3/6: 4/6 + 5/6 - 3/6 = 6/6, which is 1 mile.' },
    steps: [
      'Picture the route as a line out from the start. Forward legs move you out; doubling back moves you in.',
      'Put every leg in sixths: 2/3 = 4/6, 5/6 stays, 1/2 = 3/6.',
      'Out: 4/6 + 5/6 = 9/6. Back: 9/6 - 3/6 = 6/6 = 1 mile.',
      'Sense check: 1.5 miles out, half a mile back, 1 mile from the start.'
    ],
    choices: [
      { text: '7/6', role: 'trap', family: 'miscount', trap: 'Renamed 1/2 as 2/6', note: 'Renaming 1/2 as 2/6 takes back too little: 9/6 - 2/6 = 7/6. Half of six sixths is 3/6.' },
      { text: '2', role: 'trap', family: 'other-question', trap: 'Miles driven', note: '2 is every mile the driver covered, 4/6 + 5/6 + 3/6. True, but the stem asks how far from the start, so the half mile back comes off.' },
      { text: '5/6', role: 'trap', family: 'miscount', trap: 'Renamed 1/2 as 4/6', note: 'Renaming 1/2 as 4/6 takes back too much: 9/6 - 4/6 = 5/6. Half a mile is 3/6, not 4/6.' },
      { text: '3/4', role: 'trap', family: 'operation-flip', trap: 'Halved instead', note: 'Reading doubles back 1/2 as halve the distance gives 3/2 x 1/2 = 3/4. Doubling back is a half-mile trip, so subtract it.' },
      { text: '1', role: 'key', note: 'Out 9/6, back 3/6: 6/6 from the start.' }
    ],
    lockIt: 'Distance from the start is net: legs out add, legs back subtract. Rename to one denominator first.',
    hook: null,
    playWith: qre('frac-add', 'Fractions, add and subtract: press Show why to see 1/2 split into quarters before adding', ['Show why']),
    video: { slot: 'qr.numbers.fractions', title: 'Adding fractions: one floor first', id: null, start: null },
    visual: {
      type: 'qr.work',
      focus: 'lands-on-1',
      numberline: {
        min: 0, max: 2, step: '1/6',
        labels: [{ v: 0, label: 'start' }, { v: '1/2', label: '1/2' }, { v: 1, label: '1', bold: true }, { v: '3/2', label: '3/2' }, { v: 2, label: '2' }],
        jumps: [{ from: 0, by: '4/6', label: '+ 4/6' }, { from: '4/6', by: '5/6', label: '+ 5/6' }, { from: '9/6', by: '-3/6', label: 'back 3/6', key: true, choice: '1' }],
        points: [{ x: 1, key: true, label: '1 mile from the start', choice: '1' }, { x: 2, trap: true, label: '2: miles driven', choice: '2' }]
      },
      check: { vars: { a: '2/3', b: '5/6', c: '1/2' }, key: 'a + b - c', routes: [{ choice: '7/6', expr: '4/6 + 5/6 - 2/6' }, { choice: '2', expr: 'a + b + c' }, { choice: '5/6', expr: '4/6 + 5/6 - 4/6' }, { choice: '3/4', expr: '(a + b)*c' }] },
      reuse: 'new: qr.work block numberline (tools/explain/visuals/qr-work.js); the build checks every arc lands where it is drawn and recomputes every trap route in sixths',
      alt: 'A number line in sixths from the start to 2 miles. Arcs go forward 4/6 and then 5/6 to 3/2, and a third arc comes back 3/6 to land on 1, outlined as the answer. A dashed marker at 2 shows the total miles driven.',
      caption: 'Follow the arcs, not the odometer. Out to 3/2 and back to 1: the last arc decides where the driver stands.'
    },
    demoPick: '2',
    flags: [
      { kind: 'stem-style', text: 'The stem assumes the route runs in a straight line; legs that turn would change the distance from the start. Suggested wording for Thomas to review (not applied): "How many miles along the route is the driver from the start?" Key unchanged.' },
      { kind: 'bank-copy', text: 'The bank trap note on 3/4 ("You drifted into fourths") names no route. The note here names the one that lands on 3/4: reading "doubles back 1/2" as halving, 3/2 x 1/2.' },
      { kind: 'note', text: 'The bank stores 7/6 and 5/6 as the two renaming slips (1/2 as 2/6 and as 4/6); the notes follow the bank. 5/6 is also the second leg on its own, a number from the stem.' }
    ]
  },
  {
    qid: 'fm:qr-a:dec1107',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.numbers.decimals',
    difficulty: band(3),
    source: src('qr-a:dec1107', 5),
    keyText: '22.2',
    answer: { line: 'Left means the route minus what is covered: 37.8 - 15.6 = 22.2 km.' },
    steps: [
      'Estimate first: about 38 - 16 = 22 km left. That places the decimal point.',
      'Line up the points and subtract column by column. Tenths: 8 - 6 = 2. Whole kilometers: 37 - 15 = 22.',
      'So 22.2 km are left. What is left has to be shorter than the whole route.'
    ],
    choices: [
      { text: '2.22', role: 'trap', family: 'unit-slip', trap: 'Point slid left', note: 'Right digits, point one place too far left. The estimate says about 22 km are left, not about 2.' },
      { text: '22.2', role: 'key', note: 'The route minus the part covered.' },
      { text: '22.3', role: 'trap', family: 'miscount', trap: 'Tenths slip', note: 'A slip in the tenths column: 8 tenths minus 6 tenths is 2 tenths, not 3. No rule leads to the 3.' },
      { text: '53.4', role: 'trap', family: 'operation-flip', trap: 'Added the distances', note: '37.8 + 15.6 = 53.4 adds the covered part to the route. Left means take away, and what is left cannot be longer than the route.' },
      { text: '222', role: 'trap', family: 'unit-slip', trap: 'Dropped the point', note: 'Right digits with the point dropped. A 37.8 km route cannot have 222 km left.' }
    ],
    lockIt: 'Line up the decimal points, subtract column by column, and let an estimate place the point.',
    hook: null,
    playWith: qre('dec-arith', 'Decimal Arithmetic number line: set two decimals, pick an operation and watch the step land', ['Add/subtract by stepping']),
    video: { slot: 'qr.numbers.decimals', title: 'Decimals: line up the points', id: null, start: null },
    visual: {
      type: 'qr.partwhole',
      style: 'bars',
      focus: 'left-piece',
      max: 56,
      rows: [{ title: 'The route: 37.8 km', total: 37.8, pieces: [{ n: 15.6, kind: 'base', label: 'covered 15.6' }, { n: 22.2, kind: 'key', label: 'left 22.2', choice: '22.2' }] }],
      ghosts: [{ at: 53.4, row: 0, past: true, label: '53.4: longer than the route', choice: '53.4' }],
      check: { vars: { route: 37.8, done: 15.6 }, key: 'route - done', routes: [{ choice: '2.22', expr: '(route - done)/10' }, { choice: '53.4', expr: 'route + done' }, { choice: '222', expr: '(route - done)*10' }], noRoute: [{ choice: '22.3' }] },
      reuse: 'new: qr.partwhole style bars (tools/explain/visuals/qr-work.js); the build checks the pieces add to the route and recomputes every trap route',
      alt: 'One bar for the 37.8 km route, split into 15.6 km covered and 22.2 km left; the left piece is outlined as the answer. A dashed box running past the end of the bar marks 53.4, longer than the whole route.',
      caption: 'The outlined piece is what is left. Anything longer than the whole bar, like 53.4, cannot be what remains.'
    },
    demoPick: '53.4',
    flags: [
      { kind: 'note', text: 'Concept-first rule: 22.3 has no single-rule route (a tenths-column slip), so it tests care more than an idea. Key unchanged.' }
    ]
  },
  {
    qid: 'fm:qr-a:fra1028',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.numbers.fractions',
    difficulty: band(3),
    source: src('qr-a:fra1028', 7),
    keyText: '48/35',
    answer: { line: 'Rename both over 35: 20/35 + 28/35 = 48/35, a bit more than one tank.' },
    steps: [
      'Estimate first: a little over half a tank plus most of a tank is more than 1 tank. Any choice under 1 is out.',
      'Find a common denominator: 7 x 5 = 35.',
      'Rename the tops: 4/7 = 20/35 and 4/5 = 28/35.',
      'Add the tops and keep the 35: 20/35 + 28/35 = 48/35, about 1.37 tanks.'
    ],
    choices: [
      { text: '11/7', role: 'trap', family: 'miscount', trap: 'Rounded 4/5 up to 1', note: '11/7 is 1 + 4/7, as if the second hour moved a whole tank. It moved 4/5 of one, which is 28/35.' },
      { text: '16/35', role: 'trap', family: 'operation-flip', trap: 'Multiplied instead', note: '4/7 x 4/5 = 16/35 multiplies the hours. Two hours of pumping add, and a product of two fractions under 1 is smaller than either.' },
      { text: '8/12', role: 'trap', family: 'half-right', trap: 'Added tops and bottoms', note: 'Adding the tops is fine; adding the bottoms is not. 8/12 is 2/3, less than the second hour alone.' },
      { text: '8/35', role: 'trap', family: 'one-step-short', trap: 'Never renamed the tops', note: '35 is the right denominator, but the tops never changed. 4/7 becomes 20/35 and 4/5 becomes 28/35, not 4/35 each.' },
      { text: '48/35', role: 'key', note: '20/35 + 28/35: one tank and 13/35 more.' }
    ],
    lockIt: 'Add fractions over one common denominator: rename the tops, add them, keep the bottom.',
    hook: null,
    playWith: qre('frac-add', 'Fractions, add and subtract: press Show why to see 1/2 split into quarters before adding', ['Show why']),
    video: { slot: 'qr.numbers.fractions', title: 'Adding fractions: one floor first', id: null, start: null },
    visual: {
      type: 'qr.partwhole',
      style: 'fractions',
      focus: 'past-one-tank',
      rows: [
        { label: 'Hour 1: 4/7 of a tank = 20/35', num: 4, den: 7, over: '20/35' },
        { label: 'Hour 2: 4/5 of a tank = 28/35', num: 4, den: 5, over: '28/35' }
      ],
      total: { num: 48, den: 35, label: 'Both hours, poured in order: 48/35', choice: '48/35', key: true, tag: '48/35: one full tank and 13/35' },
      tankLabels: ['tank 1: full', 'tank 2: 13/35'],
      check: { vars: { a: '4/7', b: '4/5' }, key: 'a + b', routes: [{ choice: '11/7', expr: '1 + a' }, { choice: '16/35', expr: 'a*b' }, { choice: '8/12', expr: '(4 + 4)/(7 + 5)' }, { choice: '8/35', expr: '4/35 + 4/35' }] },
      reuse: 'new: qr.partwhole style fractions (tools/explain/visuals/qr-work.js); the build checks each renaming, the poured total and every trap route',
      alt: 'Two fraction bars: 4 of 7 cells filled for hour 1 and 4 of 5 cells for hour 2. Below, both amounts pour into tanks in order: tank 1 fills completely and tank 2 holds 13/35, outlined together as 48/35.',
      caption: 'Watch the second tank. The pour runs past one full tank, so every choice under 1 is out.'
    },
    demoPick: '8/12',
    flags: [
      { kind: 'bank-copy', text: 'The bank why ends "Combine: 48/35 = 48/35", which repeats itself; it could read "20/35 + 28/35 = 48/35".' },
      { kind: 'note', text: 'Concept-first rule: 11/7 has no single-rule route (1 + 4/7, as if 4/5 were a whole tank); the bank reads it as rounding 4/5 up, which the note follows. Key unchanged.' }
    ]
  },
  {
    qid: 'fm:generated:qr-sci-notation-product#b96vmp',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.numbers.scientific-notation',
    difficulty: band(2),
    source: src('generated:qr-sci-notation-product#b96vmp', 12),
    keyText: '3.5 × 10⁰',
    answer: { line: 'Fronts multiply to 35, powers add to 10^-1, and 35 x 10^-1 in proper form is 3.5 x 10^0.' },
    steps: [
      'Split the job. Multiply the front numbers: 5 x 7 = 35.',
      'Add the exponents: -6 + 5 = -1. So far, 35 x 10^-1.',
      'Fix the front. 35 = 3.5 x 10^1, so the front shrinks by 10 and the exponent grows by 1: 3.5 x 10^0.',
      'Sense check: 5 millionths of 700000 is 3.5.'
    ],
    choices: [
      { text: '1.2 × 10⁰', role: 'trap', family: 'operation-flip', trap: 'Added the fronts', note: '5 + 7 = 12 adds the front numbers. In a product the fronts multiply: 5 x 7 = 35.' },
      { text: '3.5 × 10⁻¹', role: 'trap', family: 'one-step-short', trap: 'Moved the point only', note: 'Turning 35 into 3.5 shrinks the front by 10, so the exponent must rise by 1. Stopping at 10^-1 makes the number 10 times too small.' },
      { text: '3.5 × 10⁻²', role: 'trap', family: 'reversed', trap: 'Moved the exponent down', note: 'A smaller front number needs a larger power of ten. Moving the exponent from -1 down to -2 shrinks the number a second time.' },
      { text: '3.5 × 10⁻³⁰', role: 'trap', family: 'operation-flip', trap: 'Multiplied the exponents', note: '-6 x 5 = -30 multiplies the exponents. When powers of ten multiply, their exponents add: -6 + 5 = -1.' },
      { text: '3.5 × 10⁰', role: 'key', note: '35 x 10^-1, with the front put between 1 and 10.' }
    ],
    lockIt: 'Multiply the fronts, add the exponents, then slide the front between 1 and 10.',
    hook: null,
    playWith: qre('exps', 'Exponent Laws: pick multiply, set the base and both powers, and watch the exponents add', ["'exps':{"]),
    video: { slot: 'qr.numbers.scientific-notation', title: 'Scientific notation: fronts multiply, powers add', id: null, start: null },
    visual: {
      type: 'qr.work',
      focus: 'renormalize',
      lines: {
        rows: [
          { expr: '(5 x 10^-6)(7 x 10^5)', tag: 'start' },
          { expr: '5 x 7 = 35', move: 'multiply the fronts' },
          { expr: '10^-6 x 10^5 = 10^-1', move: 'add the exponents: -6 + 5' },
          { expr: '35 x 10^-1', move: 'put them together' },
          { expr: '3.5 x 10^0', move: 'front down by 10, exponent up by 1', key: true, choice: '3.5 × 10⁰', tag: 'the answer' }
        ],
        exits: [
          { at: 2, label: 'Multiply the exponents instead and you get 10^-30.', choice: '3.5 × 10⁻³⁰', value: '3.5*10^(-6*5)' },
          { at: 3, label: 'Write 3.5 x 10^-1 here and the number is 10 times too small.', choice: '3.5 × 10⁻¹', value: '3.5*10^-1' }
        ]
      },
      check: { vars: { a: 5, m: -6, b: 7, n: 5 }, key: 'a*b*10^(m + n)', routes: [{ choice: '1.2 × 10⁰', expr: '(a + b)*10^(m + n)' }, { choice: '3.5 × 10⁻¹', expr: 'a*b/10*10^(m + n)' }, { choice: '3.5 × 10⁻²', expr: 'a*b/10*10^(m + n - 1)' }, { choice: '3.5 × 10⁻³⁰', expr: 'a*b/10*10^(m*n)' }] },
      reuse: 'new: qr.work block lines (tools/explain/visuals/qr-work.js); the build checks each line, that the key is in proper form, and every trap route',
      alt: 'Worked lines: the fronts 5 x 7 = 35, the exponents -6 + 5 = -1, together 35 times ten to the -1, then 3.5 times ten to the 0, outlined as the answer. Two dashed side notes show multiplying the exponents and stopping at ten to the -1.',
      caption: 'Look at the last arrow: the front drops by 10 while the exponent climbs by 1, so the value never changes.'
    },
    demoPick: '3.5 × 10⁻¹',
    flags: [
      { kind: 'bank-copy', text: 'The bank trap notes use capitalized emphasis (UP, LARGER, ADD) and the multiplication glyph; the notes here are plain case and ASCII.' }
    ]
  },
  {
    qid: 'fm:qr-a:dec1108',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.numbers.decimals',
    difficulty: band(3),
    source: src('qr-a:dec1108', 14),
    keyText: '23.8',
    answer: { line: 'Both parts of 1.1 come out, the 1 and the 0.1: 24.9 - 1.1 = 23.8 kg.' },
    steps: [
      'Estimate first: a little over 1 kg out of nearly 25 leaves just under 24.',
      'Line up the points. Tenths: 9 - 1 = 8. Ones and tens: 24 - 1 = 23.',
      'So the crate weighs 23.8 kg. Every digit of 1.1 comes off its own column.'
    ],
    choices: [
      { text: '2.38', role: 'trap', family: 'unit-slip', trap: 'Point slid left', note: 'Right digits, point one place too far left. Taking about 1 kg from about 25 leaves about 24, not about 2.' },
      { text: '23.8', role: 'key', note: 'The 1 and the 0.1 both come off.' },
      { text: '23.9', role: 'trap', family: 'half-right', trap: 'Took off only the 1', note: '24.9 - 1 = 23.9 takes off the 1 but leaves the 0.1 behind. All 1.1 kg came out.' },
      { text: '26.0', role: 'trap', family: 'operation-flip', trap: 'Added the packing', note: '24.9 + 1.1 = 26.0 adds the packing back in. It was taken out, so subtract.' },
      { text: '238', role: 'trap', family: 'unit-slip', trap: 'Dropped the point', note: 'Right digits with the point dropped: 238 kg is ten times the whole crate.' }
    ],
    lockIt: 'Subtract decimals place by place: each digit taken out comes off its own column.',
    hook: null,
    playWith: qre('dec-arith', 'Decimal Arithmetic number line: set two decimals, pick an operation and watch the step land', ['Add/subtract by stepping']),
    video: { slot: 'qr.numbers.decimals', title: 'Decimals: line up the points', id: null, start: null },
    visual: {
      type: 'qr.work',
      focus: 'both-digits-off',
      columns: {
        places: { int: ['tens', 'ones'], dec: ['tenths'] },
        rows: [{ digits: '24.9' }, { digits: '1.1', sign: '-', move: true, note: '1 one, 1 tenth' }],
        result: { digits: '23.8', choice: '23.8', key: true, note: 'the answer' },
        ghosts: [{ digits: '23.9', choice: '23.9', note: 'only the 1 came off' }]
      },
      check: { vars: { w: 24.9, out: 1.1 }, key: 'w - out', routes: [{ choice: '2.38', expr: '(w - out)/10' }, { choice: '23.9', expr: 'w - 1' }, { choice: '26.0', expr: 'w + out' }, { choice: '238', expr: '(w - out)*10' }] },
      reuse: 'new: qr.work block columns (tools/explain/visuals/qr-work.js); the build recomputes the columns and every trap route',
      alt: 'Place-value columns with the decimal points lined up: 24.9 minus 1.1, with both digits of 1.1 marked, gives 23.8, outlined as the answer. A dashed row below shows 23.9, where only the 1 came off.',
      caption: 'Both marked digits of 1.1 leave their own columns. Take off only the 1 and you land on 23.9.'
    },
    demoPick: '23.9',
    flags: []
  },
  {
    qid: 'fm:qr-a:pem1303',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.numbers.order-of-operations',
    difficulty: band(2),
    source: src('qr-a:pem1303', 19),
    keyText: '39',
    answer: { line: 'Exponent first, then multiply, then add: 9 + 30 = 39.' },
    steps: [
      'Split the line at the plus sign. 3^2 and 6 x 5 are two blocks that only meet at the end.',
      'Do the exponent: 3^2 = 3 x 3 = 9. Squared means times itself, not times 2.',
      'Do the multiplication: 6 x 5 = 30. Add last: 9 + 30 = 39.'
    ],
    choices: [
      { text: '33', role: 'trap', family: 'half-right', trap: 'Dropped the square', note: 'Multiplying before adding is right, but the square went missing: 3 + 30 = 33. 3^2 is 9.' },
      { text: '36', role: 'trap', family: 'operation-flip', trap: 'Squared as times 2', note: 'Reading 3^2 as 3 x 2 = 6 gives 6 + 30 = 36. Squaring multiplies 3 by itself: 9.' },
      { text: '39', role: 'key', note: 'Nine plus thirty.' },
      { text: '45', role: 'trap', family: 'reversed', trap: 'Added before multiplying', note: '(3 + 6) x 5 = 45 adds before it multiplies, and drops the square too. Multiplication comes before addition wherever it sits in the line.' },
      { text: '90', role: 'trap', family: 'miscount', trap: 'Multiplied everything', note: '3 x 6 x 5 = 90 treats every sign as a multiply and skips the square. No single rule leads here.' }
    ],
    lockIt: 'Exponents, then multiplication and division, then addition and subtraction. Split at the plus signs first.',
    hook: null,
    playWith: qre('pemdas', 'PEMDAS stepper: pick 2 + 3 x 4 or (2 + 3) x 4 and see which step goes first', ['Same priority? Left to right']),
    video: { slot: 'qr.numbers.order-of-operations', title: 'Order of operations: split at the plus', id: null, start: null },
    visual: {
      type: 'qr.work',
      focus: 'add-last',
      tree: {
        pieces: [{ expr: '3^2', value: 9, how: '1. exponent: 3 x 3' }, { op: '+' }, { expr: '6 x 5', value: 30, how: '2. multiply' }],
        result: { value: 39, how: '3. add last', choice: '39', key: true, tag: 'the answer' }
      },
      check: { key: '3^2 + 6*5', routes: [{ choice: '33', expr: '3 + 6*5' }, { choice: '36', expr: '3*2 + 6*5' }, { choice: '45', expr: '(3 + 6)*5' }, { choice: '90', expr: '3*6*5' }] },
      reuse: 'new: qr.work block tree (tools/explain/visuals/qr-work.js); the build recomputes each box, the whole line and every trap route',
      alt: 'An order-of-operations tree: 3 squared and 6 x 5 sit in two boxes with a plus sign between them. Steps marked 1 and 2 turn them into 9 and 30, and step 3 adds them into 39, outlined as the answer.',
      caption: 'The plus sign splits the line into two blocks. Finish each block, then add them last.'
    },
    demoPick: '36',
    flags: [
      { kind: 'note', text: 'Concept-first rule: 45 needs two slips (left to right, and the square dropped) and 90 follows no single rule. The one-slip left-to-right value, (9 + 6) x 5 = 75, is not offered and would test order of operations more cleanly. Key unchanged.' }
    ]
  },

  /* ================== Geometry: area, perimeter, volume ================== */
  {
    qid: 'fm:qr-a:vol1676',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.geometry.volume',
    difficulty: band(2),
    source: src('qr-a:vol1676', 36),
    keyText: '268.08',
    answer: { line: 'Volume fills the inside, so the radius is cubed: (4/3) pi r^3 with r = 4 is 256 pi / 3, about 268.08.' },
    steps: [
      'Know which measure the stem wants. Volume is the space inside, so the radius gets cubed: V = (4/3) pi r^3.',
      'Cube the radius: 4^3 = 64. Times 4/3 is 256/3, about 85.3.',
      'Multiply by pi: 256 pi / 3 is 268.08 to the hundredth.',
      'Estimate to check: with pi about 3, the volume is about 256, so 268 fits.'
    ],
    choices: [
      { text: '50.27', role: 'trap', family: 'neighbor-fact', trap: 'Area of a circle', note: 'pi r^2 is 16 pi, the area of a flat circle of radius 4. A flat measure comes in square units; the stem asks for cubic.' },
      { text: '67.02', role: 'trap', family: 'half-right', trap: 'Squared, not cubed', note: '(4/3) pi r^2 keeps the right constant but squares the radius. Volume multiplies three lengths, so cube it.' },
      { text: '201.06', role: 'trap', family: 'neighbor-fact', trap: 'The surface area', note: '4 pi r^2 is 64 pi, the ball\'s surface, its skin. The volume is the space inside.' },
      { text: '268.08', role: 'key', note: '(4/3) pi times 64.' },
      { text: '804.25', role: 'trap', family: 'one-step-short', trap: 'Never divided by 3', note: '4 pi r^3 is 256 pi, which skips the divide by 3. It is exactly 3 times the volume.' }
    ],
    lockIt: 'Squared radius: a flat or skin measure. Cubed radius: volume, V = (4/3) pi r^3.',
    hook: null,
    playWith: qre('vol-sa', 'Volume and Surface: pick the sphere and compare how its volume and surface area grow', ["'sphere'", 'V/SA scaling'], 'The section is marked as optional review there (see the flag).'),
    video: { slot: 'qr.geometry.volume', title: 'Area, surface, volume: count the lengths', id: null, start: null },
    visual: {
      type: 'qr.geometry',
      shape: 'sphere',
      focus: 'volume',
      r: 4,
      unit: 'mm',
      measures: [
        { kind: 'area', label: 'flat circle', formula: 'pi r^2', choice: '50.27' },
        { kind: 'surface', label: 'the skin', formula: '4 pi r^2', choice: '201.06' },
        { kind: 'volume', label: 'the inside', formula: '(4/3) pi r^3', choice: '268.08', key: true }
      ],
      check: { vars: { r: 4 }, key: '4/3*pi*r^3', routes: [{ choice: '50.27', expr: 'pi*r^2' }, { choice: '67.02', expr: '4/3*pi*r^2' }, { choice: '201.06', expr: '4*pi*r^2' }, { choice: '804.25', expr: '4*pi*r^3' }] },
      reuse: 'new: qr.geometry shape sphere (tools/explain/visuals/qr-work.js); the build recomputes all three measures and every trap route',
      alt: 'Three panels for radius 4 mm: a flat disk, pi r squared = 50.27 square mm; a sphere outline, its skin, 4 pi r squared = 201.06 square mm; and a filled sphere, its inside, (4/3) pi r cubed = 268.08 cubic mm, outlined as the answer.',
      caption: 'Each panel counts lengths: radius squared for the flat circle and the skin, radius cubed for the inside. Only the outlined one is a volume.'
    },
    demoPick: '201.06',
    flags: [
      { kind: 'bank-copy', text: 'The bank why is one formula line with the pi glyph, and the bank stores no trap notes for this item; every note here is written fresh.' },
      { kind: 'play-target', text: 'tools/qr/index.html marks its Volume / Surface section "Optional review: not on the current DAT. Geometry, trigonometry and unit conversions were removed from the Quantitative Reasoning section." Full-Length Test 1 still serves this sphere item. The coverage audit (decisions doc, item 5) decides whether geometry stays in QR; if it goes, this item is a candidate to retire or replace. Key unchanged.' }
    ]
  },

  /* ==================== Percentages and percent change ==================== */
  {
    qid: 'fm:qr-a:pct1163',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.percent.change',
    difficulty: band(3),
    source: src('qr-a:pct1163', 1),
    keyText: '174.9',
    answer: { line: '45 percent off leaves 55 percent to pay: 318 x 0.55 = 174.90.' },
    steps: [
      'Turn the discount into what you pay: 100 - 45 = 55 percent of the price.',
      'Multiply once: 318 x 0.55 = 174.90. One step, no subtracting.',
      'Estimate: a bit more than half of 318, which is 159. So about 175.'
    ],
    choices: [
      { text: '143.1', role: 'trap', family: 'other-question', trap: 'The discount itself', note: '318 x 0.45 = 143.10 is the amount taken off. A true number, but the stem asks for the price you pay.' },
      { text: '174.9', role: 'key', note: 'The 55 percent you pay.' },
      { text: '273', role: 'trap', family: 'other-unit', trap: 'Took off $45', note: '318 - 45 = 273 takes off 45 dollars. The markdown is 45 percent, which is 143.10 on this price.' },
      { text: '303.69', role: 'trap', family: 'unit-slip', trap: 'Took off 4.5 percent', note: 'This takes off 4.5 percent, 14.31. The decimal slid one place: 45 percent is 0.45, not 0.045.' },
      { text: '363', role: 'trap', family: 'operation-flip', trap: 'Added $45', note: '318 + 45 = 363 raises the price, and by dollars instead of percent. A markdown brings the price down.' }
    ],
    lockIt: 'A cut of p percent leaves 100 - p percent: multiply by that one decimal.',
    hook: null,
    playWith: qre('pct-chg', 'Percent change: start from $50, tap a rise or a cut, and watch the price and its multiplier', ['(start)']),
    video: { slot: 'qr.percent.change', title: 'Percent change in one multiply', id: null, start: null },
    visual: {
      type: 'qr.partwhole',
      style: 'bars',
      focus: 'price-paid',
      rows: [{
        title: 'The $318 price in ten cells of 10 percent (31.80 each)',
        total: 318,
        pieces: [
          { n: 174.9, kind: 'key', cells: 31.8, pct: 55, label: 'you pay 55 percent: 174.90', choice: '174.9' },
          { n: 143.1, kind: 'off', cells: 31.8, pct: 45, label: '45 percent off: 143.10', choice: '143.1' }
        ]
      }],
      check: { vars: { price: 318, off: 45 }, key: 'price*(1 - off/100)', routes: [{ choice: '143.1', expr: 'price*off/100' }, { choice: '273', expr: 'price - off' }, { choice: '303.69', expr: 'price*(1 - off/1000)' }, { choice: '363', expr: 'price + off' }] },
      reuse: 'new: qr.partwhole style bars with cells (tools/explain/visuals/qr-work.js); the build checks both pieces against their percents of 318 and every trap route',
      alt: 'One bar for the $318 price, cut into ten cells of 31.80, each 10 percent. The first five and a half cells, 55 percent or 174.90, are outlined as the price you pay; the last four and a half cells, hatched, are the 45 percent taken off, 143.10.',
      caption: 'The outlined cells are what you pay. The hatched cells are the discount, a true number for another question.'
    },
    demoPick: '143.1',
    flags: [
      { kind: 'stem-style', text: 'The stem prices the tablet in dollars ($318) but the choices are bare numbers with no cents (143.1, 174.9). Suggested choices for Thomas to review (not applied): dollars to the cent, such as $174.90 and $143.10. Key unchanged.' },
      { kind: 'note', text: 'Concept-first rule: 363 needs two slips (direction, and dollars for percent), so it is a weak distractor. Key unchanged.' }
    ]
  },
  {
    qid: 'fm:qr-a:pct1184',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.percent.successive',
    difficulty: band(2),
    source: src('qr-a:pct1184', 15),
    keyText: '103.13',
    answer: { line: 'Each change acts on the bill as it stands: 125 x 1.10 x 0.75 = 103.125, or $103.13.' },
    steps: [
      'Start with the rise: 125 x 1.10 = 137.50.',
      'Then take 25 percent off the new amount: 137.50 x 0.75 = 103.125.',
      'Round to the cent: $103.13. The fall is bigger than the rise, and it acts on a bigger base, so the bill ends below $125.'
    ],
    choices: [
      { text: '93.75', role: 'trap', family: 'half-right', trap: 'Skipped the rise', note: '125 x 0.75 = 93.75 applies the cut to the starting bill and leaves the 10 percent rise out.' },
      { text: '103.13', role: 'key', note: 'The cut taken off the raised bill.' },
      { text: '106.25', role: 'trap', family: 'assumed-equal', trap: 'Netted the percents', note: 'Netting +10 and -25 into one 15 percent drop treats both as percents of 125. The 25 percent comes off 137.50, so it takes off more.' },
      { text: '137.5', role: 'trap', family: 'one-step-short', trap: 'Stopped after the rise', note: '137.50 is the bill after the 10 percent rise. One step is left: take 25 percent off it.' },
      { text: '171.88', role: 'trap', family: 'read-backward', trap: 'Fall read as rise', note: '125 x 1.10 x 1.25 = 171.875 treats the 25 percent fall as a second rise. A fall multiplies by 0.75.' }
    ],
    lockIt: 'Successive percents multiply, and each one acts on the amount as it stands then.',
    hook: null,
    playWith: qre('pct-seq', 'Sequential Percent: see $100 rise 20 percent, then fall 20 percent, and land on $96', ['not 0%']),
    video: { slot: 'qr.percent.successive', title: 'Back-to-back percents multiply', id: null, start: null },
    visual: {
      type: 'qr.partwhole',
      style: 'bars',
      focus: 'second-bar',
      rows: [
        { title: 'Rise 10 percent: 125 becomes 137.50', total: 137.5, totalChoice: '137.5', pieces: [{ n: 125, kind: 'base', label: 'bill 125' }, { n: 12.5, kind: 'add', pct: 10, of: 'first', label: '+10 percent: 12.50' }] },
        { title: 'Then fall 25 percent of 137.50', from: 'prev', total: 137.5, pieces: [{ n: 103.125, kind: 'key', label: '103.13', choice: '103.13' }, { n: 34.375, kind: 'off', pct: 25, label: '25 percent off: 34.38' }] }
      ],
      ghosts: [{ at: 106.25, row: 1, label: '106.25: 15 percent off 125', choice: '106.25' }],
      check: { vars: { bill: 125, up: 10, down: 25 }, key: 'bill*(1 + up/100)*(1 - down/100)', routes: [{ choice: '93.75', expr: 'bill*(1 - down/100)' }, { choice: '106.25', expr: 'bill*(1 + up/100 - down/100)' }, { choice: '137.5', expr: 'bill*(1 + up/100)' }, { choice: '171.88', expr: 'bill*(1 + up/100)*(1 + down/100)' }] },
      reuse: 'new: qr.partwhole style bars (tools/explain/visuals/qr-work.js); the build checks the rise as 10 percent of 125, the cut as 25 percent of 137.50, the ghost mark and every trap route',
      alt: 'Two bars on one scale. The first is the 125 bill plus a 12.50 rise, 137.50 in all. The second is 137.50 split into 103.13, outlined as the answer, and a hatched 25 percent cut of 34.38, with a dashed mark at 106.25 where netting the percents would land.',
      caption: 'The cut comes off the longer second bar, so it takes more than the rise added. That is why the bill ends below 106.25.'
    },
    demoPick: '106.25',
    flags: [
      { kind: 'bank-copy', text: 'The bank why ends "Naively adding gives 106.25, which is wrong": a house-banned word and a diaeresis glyph. Not lifted.' }
    ]
  },
  {
    qid: 'fm:qr-a:pct1127',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.percent.of',
    difficulty: band(2),
    source: src('qr-a:pct1127', 34),
    keyText: '166.6',
    answer: { line: 'Percent of means multiply by the decimal: 0.35 x 476 = 166.6.' },
    steps: [
      'Split it into 10 percent pieces. 10 percent of 476 is 47.6.',
      '30 percent is 3 x 47.6 = 142.8. 5 percent is half of 47.6, which is 23.8.',
      'Add the pieces: 142.8 + 23.8 = 166.6. Same as 0.35 x 476 in one step.'
    ],
    choices: [
      { text: '16.66', role: 'trap', family: 'unit-slip', trap: 'Point one place off', note: '16.66 is 3.5 percent of 476. The decimal slid one place: 35 percent is 0.35, not 0.035.' },
      { text: '166.6', role: 'key', note: 'Three and a half tenths of 476.' },
      { text: '309.4', role: 'trap', family: 'other-question', trap: 'The other 65 percent', note: '309.4 is what is left after taking 35 percent away, 0.65 x 476. True, but the stem asks for the 35 percent itself.' },
      { text: '511', role: 'trap', family: 'operation-flip', trap: 'Added 35', note: '476 + 35 = 511 adds the 35 on. Percent of means a part of 476, so the answer is smaller than 476.' },
      { text: '16660', role: 'trap', family: 'unit-slip', trap: 'Never divided by 100', note: '35 x 476 = 16660 skips the divide by 100. A part of 476 cannot be bigger than 476.' }
    ],
    lockIt: 'Percent of a number: multiply by the percent over 100. Ten percent pieces make it head math.',
    hook: null,
    playWith: qre('pct-of', 'Percent of a Number: click a percent and see that share of 80', ['click a percent to see it']),
    video: { slot: 'qr.percent.of', title: 'Percent of: build it from tenths', id: null, start: null },
    visual: {
      type: 'qr.partwhole',
      style: 'bars',
      focus: 'thirty-five-percent',
      rows: [{
        title: '476 in ten cells of 10 percent (47.6 each)',
        total: 476,
        pieces: [
          { n: 166.6, kind: 'key', cells: 47.6, pct: 35, label: '35 percent: 166.6', choice: '166.6' },
          { n: 309.4, kind: 'base', cells: 47.6, pct: 65, label: 'the other 65 percent: 309.4', choice: '309.4' }
        ]
      }],
      check: { vars: { p: 35, n: 476 }, key: 'p/100*n', routes: [{ choice: '16.66', expr: 'p/1000*n' }, { choice: '309.4', expr: '(100 - p)/100*n' }, { choice: '511', expr: 'n + p' }, { choice: '16660', expr: 'p*n' }] },
      reuse: 'new: qr.partwhole style bars with cells (tools/explain/visuals/qr-work.js); the build checks both pieces against their percents of 476 and every trap route',
      alt: 'One bar for 476 cut into ten cells of 47.6, each 10 percent. The first three and a half cells, 166.6, are outlined as 35 percent; the other six and a half cells are the remaining 65 percent, 309.4.',
      caption: 'Count the outlined cells: three tenths and a half. The rest of the bar answers a different question.'
    },
    demoPick: '309.4',
    flags: [
      { kind: 'stem-style', text: 'Shorthand stem (6 words): "What is 35 percent of 476?" It reads like a real QR computation item; flagged for the record, no rewording suggested. Key unchanged.' }
    ]
  },
  {
    qid: 'fm:qr-a:pct1160',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.percent.change',
    difficulty: band(3),
    source: src('qr-a:pct1160', 39),
    keyText: '49.21',
    answer: { line: 'A 33 percent rise makes the new bill 133 percent of the old: 37 x 1.33 = 49.21.' },
    steps: [
      'Turn the rise into one multiplier: 100 + 33 = 133 percent, or 1.33.',
      'Multiply: 37 x 1.33 = 49.21.',
      'Estimate: about a third more than 37 is about 37 + 12 = 49. It fits.'
    ],
    choices: [
      { text: '4', role: 'trap', family: 'read-backward', trap: 'Rise read as drop', note: '37 - 33 = 4 turns the rise into a drop, and dollars for percent. The bill goes up.' },
      { text: '12.21', role: 'trap', family: 'other-question', trap: 'The rise alone', note: '12.21 is 33 percent of 37, the size of the rise. It still has to join the old bill: 37 + 12.21 = 49.21.' },
      { text: '38.22', role: 'trap', family: 'unit-slip', trap: 'A 3.3 percent rise', note: '37 x 1.033 is a 3.3 percent rise. The decimal slid one place: 33 percent is 0.33, so multiply by 1.33.' },
      { text: '49.21', role: 'key', note: 'The old bill plus a third, near enough.' },
      { text: '70', role: 'trap', family: 'other-unit', trap: 'Added $33', note: '37 + 33 = 70 adds 33 dollars. The rise is 33 percent of 37, which is 12.21 dollars.' }
    ],
    lockIt: 'A rise of p percent multiplies by 1 + p/100, making the new amount 100 + p percent.',
    hook: null,
    playWith: qre('pct-chg', 'Percent change: start from $50, tap a rise or a cut, and watch the price and its multiplier', ['(start)']),
    video: { slot: 'qr.percent.change', title: 'Percent change in one multiply', id: null, start: null },
    visual: {
      type: 'qr.partwhole',
      style: 'bars',
      focus: 'whole-new-bill',
      rows: [{
        title: 'Old bill $37 = 100 percent, plus a 33 percent rise',
        key: true,
        choice: '49.21',
        keyLabel: 'new bill: 133 percent = 49.21',
        pieces: [{ n: 37, kind: 'base', label: 'old bill 37' }, { n: 12.21, kind: 'add', pct: 33, of: 'first', label: '+33 percent: 12.21', choice: '12.21' }]
      }],
      check: { vars: { bill: 37, up: 33 }, key: 'bill*(1 + up/100)', routes: [{ choice: '4', expr: 'bill - up' }, { choice: '12.21', expr: 'bill*up/100' }, { choice: '38.22', expr: 'bill*(1 + up/1000)' }, { choice: '70', expr: 'bill + up' }] },
      reuse: 'new: qr.partwhole style bars (tools/explain/visuals/qr-work.js); the build checks the rise as 33 percent of 37, the whole bar against the key and every trap route',
      alt: 'One bar: the old $37 bill, then a 12.21 piece for the 33 percent rise added on its end. The whole bar, 49.21 or 133 percent of the old bill, is outlined as the answer.',
      caption: 'The outline runs over both pieces. The rise alone, 12.21, is only the add-on.'
    },
    demoPick: '12.21',
    flags: [
      { kind: 'stem-style', text: 'The stem prices the bill in dollars ($37) but the choices are bare numbers (4, 70). Suggested choices for Thomas to review (not applied): dollars to the cent, such as $49.21. Key unchanged.' },
      { kind: 'note', text: 'Concept-first rule: 4 needs two slips (direction, and dollars for percent), so it is a weak distractor. Key unchanged.' }
    ]
  },

  /* ==================== Powers, roots and quadratics ==================== */
  {
    qid: 'fm:generated:qr-roots-sum-product#1wt0ylw',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.quadratics.roots',
    difficulty: band(2),
    source: src('generated:qr-roots-sum-product#1wt0ylw', 10),
    keyText: '18',
    answer: { line: 'The roots are 2 and 9, and 2 x 9 = 18. For x^2 + bx + c, the product is just c.' },
    steps: [
      'Read what is asked. The product of the roots, not the roots themselves.',
      'Factor: two numbers that multiply to 18 and add to 11 are 2 and 9, so (x - 2)(x - 9) = 0.',
      'Multiply the roots: 2 x 9 = 18. With a 1 in front of x^2, that is the constant term every time.'
    ],
    choices: [
      { text: '18', role: 'key', note: '2 x 9, the constant term.' },
      { text: '−18', role: 'trap', family: 'sign-slip', trap: 'Put a minus on c', note: 'The minus sign belongs to the sum, -b/a. The product is c/a = 18/1 = 18, sign kept.' },
      { text: '11', role: 'trap', family: 'other-question', trap: 'The sum of the roots', note: '2 + 9 = 11 is the sum of the roots, -b. A true fact about this equation, but the stem asks for the product.' },
      { text: '7', role: 'trap', family: 'other-question', trap: 'The gap between roots', note: '9 - 2 = 7 is how far apart the roots are. The stem never asks for that.' },
      { text: '−11', role: 'trap', family: 'neighbor-fact', trap: 'Read b off the page', note: '-11 is the coefficient b as printed. The roots add to -b, which is 11, and multiply to c, which is 18; -11 answers neither.' }
    ],
    lockIt: 'For x^2 + bx + c = 0, the roots multiply to c and add to -b.',
    hook: null,
    playWith: qre('discr', 'Quadratic Discriminant section: the quadratic formula, the root count rule and worked examples', ["'discr':{"], 'There is no module on the sum and product of roots yet (tool-gap flag).'),
    video: { slot: 'qr.quadratics.roots', title: 'Roots multiply to c, add to -b', id: null, start: null },
    visual: {
      type: 'qr.work',
      focus: 'product-row',
      lines: { v: 'x', at: [2, 9], rows: [
        { expr: 'x^2 - 11x + 18 = 0', tag: 'start' },
        { expr: '(x - 2)(x - 9) = 0', move: 'two numbers: times to 18, plus to 11' },
        { expr: 'x = 2 or x = 9', move: 'each factor can be 0' }
      ] },
      rows: { rows: [
        { label: 'Multiply the roots: 2 x 9', expr: '2*9', value: 18, note: 'the constant term, c', key: true, choice: '18' },
        { label: 'Add the roots: 2 + 9', expr: '2 + 9', value: 11, note: 'the sum, -b: another question', trap: true, choice: '11' },
        { label: 'Subtract them: 9 - 2', expr: '9 - 2', value: 7, note: 'the gap, asked by no one', trap: true, choice: '7' }
      ] },
      check: { vars: { B: -11, C: 18 }, quad: { a: 1, b: 'B', c: 'C' }, key: 'c/a', routes: [{ choice: '−18', expr: '-c/a' }, { choice: '11', expr: '-b/a' }, { choice: '7', expr: 'r2 - r1' }, { choice: '−11', expr: 'b' }] },
      reuse: 'new: qr.work blocks lines and rows (tools/explain/visuals/qr-work.js); the build solves the quadratic, checks every line at x = 2 and x = 9, every row and every trap route',
      alt: 'Worked lines turn x squared - 11x + 18 = 0 into (x - 2)(x - 9) = 0, so x = 2 or x = 9. A ledger below multiplies the roots, 2 x 9 = 18, outlined as the answer and named as the constant term; it also lists the sum 11 and the gap 7.',
      caption: 'The outlined row is the product. The rows under it are true numbers for other questions.'
    },
    demoPick: '11',
    flags: [
      { kind: 'stem-style', text: 'Capitalized emphasis: "PRODUCT" (the real DAT uses plain case outside EXCEPT, NOT and LEAST). Suggested wording for Thomas to review (not applied): "What is the product of the solutions of x^2 - 11x + 18 = 0?" Key unchanged.' },
      { kind: 'bank-copy', text: 'The bank trap note on 11 uses capitalized SUM; the bank note on -11 ("mixed up which coefficient goes with which") is read here as taking b itself.' },
      { kind: 'tool-gap', text: 'The QR engine has no module on the sum and product of roots; the play-with link opens the Quadratic Discriminant section. A small factor-pair picker (roots r and s, with r + s and r x s shown against b and c) would be the exact play-with state.' }
    ]
  },
  {
    qid: 'fm:qr-a:exp1720',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.powers.exponent-rules',
    difficulty: band(3),
    source: src('qr-a:exp1720', 16),
    keyText: '78125',
    answer: { line: 'Same base, so count the 5s: one 5 times six 5s is seven 5s, 5^7 = 78125.' },
    steps: [
      'Count the factors. 5^1 is one 5; 5^6 is six 5s multiplied together.',
      'Put them side by side: seven 5s in a row, so 5^1 x 5^6 = 5^7. Add the exponents; the base stays 5.',
      'Evaluate: 5^6 = 15625, and one more 5 gives 5 x 15625 = 78125.'
    ],
    choices: [
      { text: '0', role: 'trap', family: 'miscount', trap: 'No route here', note: 'No rule gives 0. Multiplying positive numbers can never make 0.' },
      { text: '15625', role: 'trap', family: 'operation-flip', trap: 'Multiplied the exponents', note: '1 x 6 = 6 multiplies the exponents and lands on 5^6. Multiplying powers of one base adds the exponents: 1 + 6 = 7.' },
      { text: '15630', role: 'trap', family: 'operation-flip', trap: 'Added the values', note: '5 + 15625 = 15630 adds the two powers. The stem multiplies them: 5 x 15625 = 78125.' },
      { text: '78125', role: 'key', note: 'Seven 5s multiplied.' },
      { text: '6103515625', role: 'trap', family: 'half-right', trap: 'Multiplied the bases too', note: 'Adding the exponents is right, but the base must stay 5. Multiplying 5 x 5 into 25 gives 25^7, far too big.' }
    ],
    lockIt: 'Same base multiplied: add the exponents and keep the base.',
    hook: null,
    playWith: qre('exps', 'Exponent Laws: pick multiply, set the base and both powers, and watch the exponents add', ["'exps':{"]),
    video: { slot: 'qr.powers.exponent-rules', title: 'Exponent laws: count the factors', id: null, start: null },
    visual: {
      type: 'qr.work',
      focus: 'seven-fives',
      chips: { token: '5', groups: [{ label: '5^1', n: 1, note: 'one 5' }, { label: '5^6', n: 6, note: 'six 5s' }], result: { label: 'seven 5s: 5^7 = 78125', n: 7, choice: '78125', key: true } },
      rows: { rows: [
        { label: 'Multiply the exponents: 5^6', expr: '5^(1*6)', value: 15625, note: 'six 5s: one went missing', trap: true, choice: '15625' },
        { label: 'Multiply the bases too: 25^7', expr: '25^7', value: 6103515625, note: 'the base has to stay 5', trap: true, choice: '6103515625' }
      ] },
      check: { vars: { b: 5, m: 1, n: 6 }, key: 'b^(m + n)', routes: [{ choice: '15625', expr: 'b^(m*n)' }, { choice: '15630', expr: 'b^m + b^n' }, { choice: '6103515625', expr: '(b*b)^(m + n)' }], noRoute: [{ choice: '0' }] },
      reuse: 'new: qr.work blocks chips and rows (tools/explain/visuals/qr-work.js); the build counts the chips, evaluates 5^7 and every trap route',
      alt: 'Seven circles each marked 5: one under a bracket labeled 5 to the 1 and six under a bracket labeled 5 to the 6. A bracket over all seven reads seven 5s, 5 to the 7 = 78125, outlined as the answer. Two rows below show multiplying the exponents and multiplying the bases.',
      caption: 'Count the circles. One 5 and six 5s make seven 5s, so the exponents add.'
    },
    demoPick: '15625',
    flags: [
      { kind: 'stem-style', text: 'Caret exponents in the stem ("5^1 x 5^6"). tools/mock/full.js shows the stem as plain text, so the served question reads with carets, not superscripts; the explainer player typesets ^ but the test page does not. Suggested fix for Thomas to review (not applied): superscript digits in the stem, as other bank items use. Key unchanged.' },
      { kind: 'note', text: 'Concept-first rule: 0 has no route a student would take, so it is a weak distractor. Key unchanged.' }
    ]
  },
  {
    qid: 'fm:qr-a:dis1600',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.quadratics.discriminant',
    difficulty: band(3),
    source: src('qr-a:dis1600', 18),
    keyText: 'two real roots',
    answer: { line: 'b^2 - 4ac = 16 - 4 = 12. Positive, so the parabola crosses the x-axis twice: two real roots.' },
    steps: [
      'Find the discriminant, b^2 - 4ac, with a = 1, b = -4 and c = 1.',
      'Square first: (-4)^2 = 16, a positive. Then 16 - 4(1)(1) = 12.',
      'Read the sign. Positive means two real roots, zero means one, negative means none.',
      'Check: the roots are 2 plus or minus root 3, two real numbers.'
    ],
    choices: [
      { text: 'no real roots', role: 'trap', family: 'sign-slip', trap: 'Squared the minus away', note: 'Reading (-4)^2 as -16 makes the discriminant -16 - 4 = -20. A negative number squared is positive, so it is 16 - 4 = 12.' },
      { text: 'two imaginary roots', role: 'trap', family: 'other-conditions', trap: 'The negative case', note: 'Imaginary roots come from a negative discriminant. This one is +12, so both roots are real.' },
      { text: 'one real and one imaginary root', role: 'trap', family: 'half-right', trap: 'A mixed pair', note: 'This mix never happens for a quadratic with real coefficients. Imaginary roots always come as a matched pair, so the roots are both real or both imaginary.' },
      { text: 'one real root', role: 'trap', family: 'other-conditions', trap: 'The zero case', note: 'One repeated root needs a discriminant of exactly 0, where the parabola just touches the axis. Here it is 12.' },
      { text: 'two real roots', role: 'key', note: 'A positive discriminant, 12.' }
    ],
    lockIt: 'Sign of b^2 - 4ac: positive, two real roots; zero, one; negative, none.',
    hook: null,
    playWith: qre('discr', 'Quadratic Discriminant section: the sign rule, worked examples and practice', ["'discr':{"], 'The section has no live picture yet (tool-gap flag).'),
    video: { slot: 'qr.quadratics.discriminant', title: 'The discriminant counts the roots', id: null, start: null },
    visual: {
      type: 'qr.work',
      focus: 'crosses-twice',
      lines: { rows: [
        { expr: '(-4)^2 - 4(1)(1)', note: 'b^2 - 4ac', tag: 'start' },
        { expr: '16 - 4 = 12', move: 'square first: (-4)^2 is +16' },
        { expr: '12 > 0', move: 'read the sign', key: true, choice: 'two real roots', tag: 'two real roots' }
      ] },
      parabolas: { yMax: 6, yMin: -4, xHalf: 3, cases: [
        { a: 1, b: -4, c: 1, cond: 'b^2 - 4ac = 12', outcome: 'two real roots', sub: 'x^2 - 4x + 1', key: true, choice: 'two real roots' },
        { a: 1, b: -4, c: 4, cond: 'b^2 - 4ac = 0', outcome: 'one real root', sub: 'x^2 - 4x + 4', choice: 'one real root' },
        { a: 1, b: -4, c: 7, cond: 'b^2 - 4ac = -12', outcome: 'no real roots', sub: 'x^2 - 4x + 7', choice: 'no real roots' }
      ] },
      check: { quad: { a: 1, b: -4, c: 1 }, keyCase: true, routes: [{ choice: 'no real roots', disc: '-(4^2) - 4*1*1' }, { choice: 'two imaginary roots', case: 'negative' }, { choice: 'one real root', case: 'zero' }], noRoute: [{ choice: 'one real and one imaginary root' }] },
      reuse: 'new: qr.work blocks lines and parabolas (tools/explain/visuals/qr-work.js); each parabola is drawn from its own a, b and c, and the build checks every outcome against its discriminant',
      alt: 'Worked lines compute (-4) squared - 4(1)(1) = 16 - 4 = 12, which is positive. Three parabolas follow: x squared - 4x + 1 crosses the x-axis twice and is outlined as the answer; x squared - 4x + 4 touches it once; x squared - 4x + 7 never reaches it.',
      caption: 'Count where each curve meets the axis. The outlined one, this equation, crosses twice because its discriminant is positive.'
    },
    demoPick: 'no real roots',
    flags: [
      { kind: 'bank-copy', text: 'The bank why uses the Delta and minus glyphs, and its trap note on "no real roots" restates the rule without naming the route (squaring -4 to -16).' },
      { kind: 'tool-gap', text: 'The QR engine Quadratic Discriminant section has an empty picture slot (visualType word-translate with no data). A parabola with a, b and c sliders and its discriminant shown live would make this play-with target exact.' }
    ]
  },
  {
    qid: 'fm:qr-a:di3',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.quadratics.discriminant',
    difficulty: band(2),
    source: src('qr-a:di3', 27),
    keyText: 'k < 9',
    answer: { line: 'Two real solutions need b^2 - 4ac > 0: 36 - 4k > 0, so k < 9.' },
    steps: [
      'Set the condition first. Two real solutions means a positive discriminant: (-6)^2 - 4(1)(k) > 0.',
      'Simplify: 36 - 4k > 0, so 36 > 4k, and k < 9.',
      'Picture it. The vertex sits at height k - 9, below the axis exactly when k < 9, so the curve crosses twice.'
    ],
    choices: [
      { text: 'k < 9', role: 'key', note: 'The discriminant 36 - 4k stays positive.' },
      { text: 'k = 9', role: 'trap', family: 'other-conditions', trap: 'The touching point', note: 'At k = 9 the discriminant is exactly 0 and the parabola just touches the axis: one repeated root, not two.' },
      { text: 'k < 36', role: 'trap', family: 'one-step-short', trap: 'Dropped the 4', note: 'This solves 36 - k > 0, as if 4ac were just c. The 4 stays: 36 - 4k > 0 gives k < 9.' },
      { text: 'k > 9', role: 'trap', family: 'missed-exception', trap: 'Forgot the flip', note: 'Dividing -4k > -36 by -4 without flipping gives k > 9. The flip is required, and k > 9 is exactly where there are no real solutions.' },
      { text: 'k ≥ 0', role: 'trap', family: 'neighbor-fact', trap: 'Tested k instead', note: 'This puts the not-negative test on k instead of on b^2 - 4ac. k = 9 and k = 20 both pass it, and neither gives two real solutions.' }
    ],
    lockIt: 'Two real roots means b^2 - 4ac > 0. Set that up first, then solve for the unknown.',
    hook: null,
    playWith: qre('discr', 'Quadratic Discriminant section: the sign rule, worked examples and practice', ["'discr':{"], 'The section has no live picture yet (tool-gap flag on the discriminant item in this batch).'),
    video: { slot: 'qr.quadratics.discriminant', title: 'The discriminant counts the roots', id: null, start: null },
    visual: {
      type: 'qr.work',
      focus: 'k-below-9',
      lines: { v: 'k', rows: [
        { expr: '36 - 4k > 0', tag: 'b^2 - 4ac > 0' },
        { expr: '36 > 4k', move: 'add 4k to both sides' },
        { expr: 'k < 9', move: 'divide both sides by 4', key: true, choice: 'k < 9', tag: 'the answer' }
      ] },
      parabolas: { yMax: 6, yMin: -5, xHalf: 3.2, cases: [
        { a: 1, b: -6, c: 5, param: 'c', cond: 'k < 9 (k = 5 here)', outcome: 'two real roots', sub: 'vertex below the axis', key: true, choice: 'k < 9' },
        { a: 1, b: -6, c: 9, param: 'c', cond: 'k = 9', outcome: 'one real root', sub: 'vertex on the axis', choice: 'k = 9' },
        { a: 1, b: -6, c: 13, param: 'c', cond: 'k > 9 (k = 13 here)', outcome: 'no real roots', sub: 'vertex above the axis', choice: 'k > 9' }
      ] },
      check: { vars: { b: -6 }, v: 'k', keyIneq: { f: 'b^2 - 4k', rel: '>', rhs: '0' }, routes: [{ choice: 'k = 9', ineq: { f: 'b^2 - 4k', rel: '=', rhs: '0' } }, { choice: 'k < 36', ineq: { f: 'b^2 - k', rel: '>', rhs: '0' } }, { choice: 'k > 9', ineq: { f: 'b^2 - 4k', rel: '<', rhs: '0' } }], noRoute: [{ choice: 'k ≥ 0' }] },
      reuse: 'new: qr.work blocks lines and parabolas (tools/explain/visuals/qr-work.js); the build samples every line against the key, draws each parabola from its own k and checks it sits in the region it names',
      alt: 'Three worked lines take 36 - 4k > 0 to k < 9, outlined as the answer. Three parabolas follow: with k = 5 the vertex sits below the x-axis and the curve crosses twice, outlined; at k = 9 it touches once; with k = 13 it floats above the axis.',
      caption: 'Raising k lifts the whole curve. It crosses twice only while the vertex, at height k - 9, stays below the axis.'
    },
    demoPick: 'k > 9',
    flags: [
      { kind: 'note', text: 'Concept-first rule: k >= 0 has no single-slip route, so it is a weak distractor. Key unchanged.' }
    ]
  }
];

module.exports = { group: 'G1', batch: 'B005', title: 'Full-Length Test 1, Quantitative Reasoning, first half (19 items)', entries: ENTRIES };
