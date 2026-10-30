// content/explainers-src/G1/B006.js: batch B006, Full-Length Test 1
// Quantitative Reasoning, the second half of the section's planned items (20
// written here: counting and conditional probability, ratios and unit changes,
// spread and z scores, the coordinate plane, a circle with an inscribed
// triangle, the unit circle, mixtures, interest, rates and work). The 21st
// planned item, fm:written:qr-11-1ntn2bl (Law of Cosines), is pilot QR-2 and
// stays in the pilot.
// Written in Thomas's coaching voice
// (docs/release-2026-10-30/questions/voice-codex.md) from the independent
// expert's blind solve (docs/explainers/solves/B006.json: 21 of 21 keys agree,
// no key or picture disputes, nothing held).
//
// Authoring source, never published: /content/explainers-src/* is
// force-redirected like /docs/*. The build (scripts/explainers/build.mjs)
// checks every entry against tools/mock/data/full-mocks.js (key text, every
// choice text, stem hash), runs the copy rules, and recomputes every picture:
// each spec's check block (the key and the route behind every trap note, with
// the inputs found in the stem; compute-qr.js) and the arithmetic in the
// explainer's own words, then what the picture draws (compute-qr-plot.js for
// slots, mixtures, variance, z scores, slope, distance, the unit circle and
// the inscribed triangle; compute-qr.js for bars and worked lines; the Bayes
// tree counts in build.mjs).
//
// Visuals (production-plan.md, G1 row B006: qr.tree 9, qr.partwhole 3,
// qr.dataset 3, qr.work 2, qr.plane 2, qr.geometry 2), picked per item from
// the row's types: qr.tree for the three counting and probability items and
// the three mixtures (kinds slots and mix, new in tools/explain/visuals/
// qr-plot.js); qr.partwhole bars for ratio, unit, round-trip, interest, rate
// and work items; qr.work for the unit ladder and the average-speed ledger;
// qr.dataset for spread and z; qr.plane for slope and distance. Two items take
// qr.plane where the row says qr.geometry, because the picture is a figure on
// axes: the unit circle (the quadrant decides the sign) and the circle with
// its inscribed triangle (drawn by qr-plot.js, which reads the choices written
// in pi). The slope item sits under the coordinate plane, not statistics,
// as the expert noted.
'use strict';

const FM = 'tools/mock/data/full-mocks.js';
const src = (id, n) => ({ bank: FM, global: 'ACE_FULL_MOCKS', locator: { mock: 'FULL_1', section: 'qr', id }, servedAs: 'Full-Length Test 1, Quantitative Reasoning, question ' + n });
const band = (d) => ({ band: d, from: 'bank field d (1-3)' });
// Play with it: a skill view of the QR engine. No URL opens one view yet, so
// every routing note says what the route needs (checked in Chromium for every
// view used here).
const QRE = 'tools/qr/index.html';
const CLOCK = 'The skill page opens with a Try first question on a 5-minute clock that can be skipped, and the page also holds a timed simulator elsewhere; the visual itself is untimed.';
const qre = (view, label, state, expect, more) => ({
  label, href: QRE, state: Object.assign({ view }, state || {}), expect,
  routing: 'Needs a route: the view opens from data-go="' + view + '"' + (more ? '; ' + more : '') + '. ' + CLOCK
});

const ENTRIES = [
  /* ===================== Probability and counting ===================== */
  {
    qid: 'fm:qr-a:cou1579',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.probability.permutations',
    difficulty: band(3),
    source: src('qr-a:cou1579', 29),
    keyText: '720',
    answer: { line: 'Ten runners can take first, nine are left for second, eight for third: 10 x 9 x 8 = 720.' },
    steps: [
      'Ask the gate question first: does order matter? First, second and third are different places, so swapping two runners makes a new result.',
      'Fill the slots one at a time. 10 runners can take first. One is gone, so 9 can take second, then 8 can take third.',
      'Multiply the choices: 10 x 9 x 8 = 720. Slots multiply. They never add.'
    ],
    choices: [
      { text: '13', role: 'trap', family: 'operation-flip', trap: 'Added the counts', note: '10 + 3 adds the runners to the places. Each slot multiplies the choices, so the count grows fast.' },
      { text: '30', role: 'trap', family: 'other-question', trap: 'Runners times places', note: '30 counts the ways to put one runner in one place: 10 x 3. A finish fills all three places from a shrinking pool: 10, then 9, then 8.' },
      { text: '120', role: 'trap', family: 'other-question', trap: 'Ignored the order', note: '120 counts the groups of three with order ignored. Each group lines up 3 x 2 x 1 = 6 ways, and 120 x 6 = 720.' },
      { text: '720', role: 'key', note: 'Three shrinking slots: 10 x 9 x 8.' },
      { text: '1000', role: 'trap', family: 'other-conditions', trap: 'Let runners repeat', note: '10 x 10 x 10 lets one runner take two places. Once a runner places, they leave the pool.' }
    ],
    lockIt: 'Order matters: multiply the shrinking pool, slot by slot. Order ignored: divide out the orders.',
    hook: null,
    playWith: qre('count-pc', 'Permutations vs Combinations: slide n and r and switch between Permutation and Combination to see the counts split', { mode: 'P', n: 8, r: 3 }, ['qrCountMode', 'qrcount-vr-'], 'its n and r sliders need a state reader, and n stops at 8, so 10 runners cannot be set'),
    video: { slot: 'qr.probability.permutations', title: 'Permutations: fill the slots', id: null, start: null },
    visual: {
      type: 'qr.tree', kind: 'slots',
      focus: 'product',
      pool: 10, slots: ['1st', '2nd', '3rd'], firstWord: 'can take it', leftWord: 'left',
      result: { choice: '720', key: true, label: '10 x 9 x 8 = 720 orders' },
      groups: { n: 120, orders: 6, choice: '120', label: '120 stops at groups: which three made the top three, not in what order.', ordersLabel: 'Each group lines up 3 x 2 x 1 = 6 ways: 120 x 6 = 720.' },
      repeat: { choice: '1000', label: '10 x 10 x 10 = 1000 would let one runner take two places.' },
      check: { vars: { n: 10, r: 3 }, derived: ['n', 'r'], key: 'n*(n-1)*(n-2)', routes: [{ choice: '13', expr: 'n+r' }, { choice: '30', expr: 'n*r' }, { choice: '120', expr: 'n*(n-1)*(n-2)/6' }, { choice: '1000', expr: 'n^r' }] },
      reuse: 'new: qr.tree kind slots (tools/explain/visuals/qr-plot.js); the build recomputes the product, the groups and the repeat count',
      alt: 'Three slots for first, second and third, each showing the 10 runners as dots with one more greyed out per slot, so the choices read 10, 9 and 8. The product 10 x 9 x 8 = 720 is outlined. Notes below split 720 into 120 groups times 6 orders and show that 1000 needs repeats.',
      caption: 'Watch the pool shrink: each slot has one fewer runner to choose from.'
    },
    demoPick: '120',
    flags: [
      { kind: 'note', text: 'Near-duplicate of fm:generated:qr-perm-vs-comb#y9j3s6, served two questions later in the same section (29 and 31): both ask for an ordered top three with the same five distractor routes. Thomas may want one swapped for a combination or a restriction item. Key unchanged.' },
      { kind: 'tool-gap', text: 'The Permutations vs Combinations view stops n at 8, so this item (10 runners) cannot be set on it; a max of 12 would cover it.' }
    ]
  },
  {
    qid: 'fm:generated:qr-perm-vs-comb#y9j3s6',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.probability.permutations',
    difficulty: band(2),
    source: src('generated:qr-perm-vs-comb#y9j3s6', 31),
    keyText: '210',
    answer: { line: 'Seven can win 1st, six are left for 2nd, five for 3rd: 7 x 6 x 5 = 210.' },
    steps: [
      'Ask whether order matters. 1st, 2nd and 3rd are different awards, so the same three runners in a new order is a new result.',
      'Fill the slots: 7 choices for 1st, 6 for 2nd, 5 for 3rd. Multiply: 7 x 6 x 5 = 210.',
      'Check it with groups. 35 groups of three, each lined up 6 ways: 35 x 6 = 210.'
    ],
    choices: [
      { text: '6', role: 'trap', family: 'other-question', trap: 'Only the shuffles', note: '6 is 3 x 2 x 1, the ways to line up three runners you already picked. It skips choosing which three of the seven.' },
      { text: '21', role: 'trap', family: 'other-question', trap: 'Runners times places', note: '21 counts the ways to give one runner one award: 7 x 3. A finish gives out all three awards from a shrinking pool: 7, then 6, then 5.' },
      { text: '35', role: 'trap', family: 'other-question', trap: 'Ignored the order', note: '35 counts the groups of three when order does not matter. The awards differ, so each group lines up 6 ways.' },
      { text: '210', role: 'key', note: 'Three shrinking slots: 7 x 6 x 5.' },
      { text: '343', role: 'trap', family: 'other-conditions', trap: 'Let runners repeat', note: '7 x 7 x 7 lets one runner win two places. A runner who places leaves the pool.' }
    ],
    lockIt: 'Different prizes mean order matters: multiply the shrinking pool. Same prize: divide out the orders.',
    hook: null,
    playWith: qre('count-pc', 'Permutations vs Combinations: set n to 7 and r to 3, then switch from Permutation to Combination', { mode: 'P', n: 7, r: 3 }, ['qrCountMode', 'qrcount-vr-'], 'its n and r sliders need a state reader'),
    video: { slot: 'qr.probability.permutations', title: 'Permutations: fill the slots', id: null, start: null },
    visual: {
      type: 'qr.tree', kind: 'slots',
      focus: 'product',
      pool: 7, slots: ['1st', '2nd', '3rd'], firstWord: 'can win it', leftWord: 'left',
      result: { choice: '210', key: true, label: '7 x 6 x 5 = 210 ways' },
      groups: { n: 35, orders: 6, choice: '35', label: '35 stops at groups: which three placed, not in what order.', ordersLabel: 'Each group lines up 3 x 2 x 1 = 6 ways: 35 x 6 = 210.' },
      repeat: { choice: '343', label: '7 x 7 x 7 = 343 would let one runner win twice.' },
      check: { vars: { n: 7, r: 3 }, key: 'n*(n-1)*(n-2)', routes: [{ choice: '6', expr: 'r*(r-1)*(r-2)' }, { choice: '21', expr: 'n*r' }, { choice: '35', expr: 'n*(n-1)*(n-2)/6' }, { choice: '343', expr: 'n^r' }] },
      reuse: 'new: qr.tree kind slots (tools/explain/visuals/qr-plot.js)',
      alt: 'Three slots for 1st, 2nd and 3rd, each showing the 7 runners as dots with one more greyed out per slot, so the choices read 7, 6 and 5. The product 7 x 6 x 5 = 210 is outlined. Notes below split 210 into 35 groups times 6 orders and show that 343 needs repeats.',
      caption: 'Each award takes one runner out of the pool: 7, then 6, then 5.'
    },
    demoPick: '35',
    flags: [
      { kind: 'note', text: 'Near-duplicate of fm:qr-a:cou1579, served two questions earlier (29 and 31): same skill, same five distractor routes. Coach only.' },
      { kind: 'bank-copy', text: 'The bank trap note on 35 shouts ORDER in capitals; the explainer uses plain case.' }
    ]
  },
  {
    qid: 'fm:qr-a:pc3c',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.probability.conditional',
    difficulty: band(2),
    source: src('qr-a:pc3c', 40),
    keyText: '~88%',
    answer: { line: 'Of every 72 students who pass, 63 studied: 63/72 = 0.875, about 88 percent.' },
    steps: [
      'Turn the percents into people. Picture 100 students: 70 study and 30 do not.',
      'Count the passers in each group. 90 percent of 70 is 63, and 30 percent of 30 is 9. That makes 72 passers.',
      'Read the given: passed. Now your world is just those 72 students. 63 of them studied: 63/72 = 0.875, about 88 percent.',
      'Check it: a pass is evidence of studying, so the answer should climb above the 70 percent you started with.'
    ],
    choices: [
      { text: '90%', role: 'trap', family: 'flipped-condition', trap: 'Flipped the given', note: '90 percent is the chance a student who studied passes. The question runs the other way: given a pass, how likely is it the student studied?' },
      { text: '60%', role: 'trap', family: 'operation-flip', trap: 'Subtracted the rates', note: '90 - 30 = 60 compares the two pass rates. It is a gap between groups, not a share of the passers.' },
      { text: '~88%', role: 'key', note: '63 studiers among 72 passers.' },
      { text: '~72%', role: 'trap', family: 'one-step-short', trap: 'Stopped at the total', note: '72 percent is the share of all students who pass, the bottom of the ratio. One more step: what share of those 72 studied?' },
      { text: '70%', role: 'trap', family: 'other-question', trap: 'Ignored the evidence', note: '70 percent is the share who study before you know anyone passed. A pass is evidence, so the share climbs.' }
    ],
    lockIt: 'Given B means only the B cases count: both over all of B. Turn percents into people first.',
    hook: null,
    playWith: qre('p-cond', 'Conditional probability table: slide the base rate and the two test rates and read the given row', {}, ['qrProbTable', 'qrpt-vprev-'], 'its three sliders need a state reader, and the base-rate slider stops at 50, so 70 percent studying cannot be set'),
    video: { slot: 'qr.probability.conditional', title: 'Conditional probability with a crowd of 10,000', id: null, start: null },
    visual: {
      type: 'qr.tree',
      focus: 'numerator',
      root: { label: '100 students', n: 100 },
      branches: [
        { label: 'study', rate: '70 percent', n: 70, children: [{ label: 'pass', rate: '90 percent', n: 63, role: 'numerator' }, { label: 'do not pass', rate: '10 percent', n: 7 }] },
        { label: 'do not study', rate: '30 percent', n: 30, children: [{ label: 'pass', rate: '30 percent', n: 9, role: 'denominator' }, { label: 'do not pass', rate: '70 percent', n: 21 }] }
      ],
      result: { text: 'P(studied given passed) = 63 / 72 = 0.875, about 88%' },
      check: { vars: { s: 70, a: 90, b: 30 }, key: '100*s*a/(s*a+(100-s)*b)', routes: [{ choice: '90%', expr: 'a' }, { choice: '60%', expr: 'a-b' }, { choice: '~72%', expr: '(s*a+(100-s)*b)/100' }, { choice: '70%', expr: 's' }] },
      reuse: 'the pilot qr.tree (QR-3), on 100 students so every count is whole',
      alt: 'A tree from 100 students: 70 study, of whom 63 pass and 7 do not; 30 do not study, of whom 9 pass and 21 do not. The 63 studiers who pass are outlined as the numerator and the 9 other passers dashed as the rest of the denominator: 63 of 72, about 88 percent.',
      caption: 'Once you know the student passed, only the two pass boxes in the middle matter: 63 of 72.'
    },
    demoPick: '90%',
    flags: [
      { kind: 'stem-style', text: 'The stem ends in notation shorthand, "P(studied | passed)?". Suggested wording for Thomas to review (not applied): "A student is chosen at random and passed. What is the probability that the student studied?" Key unchanged.' },
      { kind: 'tool-gap', text: 'The conditional probability table names its sliders for a disease test and caps the base rate at 50, so the 70 percent study rate cannot be set. A base rate up to 99 would make this the exact play-with state.' }
    ]
  },

  /* ===================== Ratios and proportions ===================== */
  {
    qid: 'fm:generated:qr-unit-rate-conversion#ejj15',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.ratios.unit-conversion',
    difficulty: band(2),
    source: src('generated:qr-unit-rate-conversion#ejj15', 2),
    keyText: '30 m/s',
    answer: { line: '108 km is 108,000 m, and one hour is 3600 s: 108,000 / 3600 = 30 m/s.' },
    steps: [
      'Write the rate as a fraction: 108 km on top, 1 hour on the bottom. Then change one unit at a time.',
      'Top: kilometers to meters is x 1000, so 108,000 m per hour. Bottom: one hour is 60 x 60 = 3600 seconds.',
      'Divide: 108,000 / 3600 = 30 m/s. The shortcut for next time: km/h divided by 3.6.',
      'Check the size. Far fewer meters fit in one second than in an hour. 389 m/s would beat the speed of sound.'
    ],
    choices: [
      { text: '0.03 m/s', role: 'trap', family: 'other-question', trap: 'Kilometers per second', note: '108 / 3600 = 0.03 is the speed in kilometers per second. The meters never came in: multiply by 1000.' },
      { text: '1.08 × 10⁵ m/s', role: 'trap', family: 'one-step-short', trap: 'Stopped at meters per hour', note: '108,000 is meters per hour. The kilometers became meters, but the hour never became seconds. Divide by 3600.' },
      { text: '1800 m/s', role: 'trap', family: 'other-question', trap: 'Stopped at minutes', note: '108,000 / 60 = 1800 is meters per minute. One more divide by 60 reaches seconds.' },
      { text: '389 m/s', role: 'trap', family: 'operation-flip', trap: 'Multiplied by 3.6', note: '108 x 3.6 = 388.8 multiplies by the shortcut. Meters per second is the smaller number, so divide by 3.6.' },
      { text: '30 m/s', role: 'key', note: '108,000 m in 3600 s.' }
    ],
    lockIt: 'Change one unit at a time with factors worth 1, then ask whether the size makes sense.',
    hook: null,
    playWith: qre('units', 'Unit Conversions: pick a system and two units and watch the factors worth 1 cancel', {}, ['qrUfSystem', 'qruf-chain-'], 'it converts one unit at a time, so a speed (km/h to m/s) takes two passes, and the view labels itself optional review'),
    video: { slot: 'qr.ratios.unit-conversion', title: 'Unit changes: one factor at a time', id: null, start: null },
    visual: {
      type: 'qr.work',
      focus: 'per-second',
      title: 'One unit at a time',
      lines: {
        rows: [
          { expr: '108 km per hour', note: 'the speed as a fraction' },
          { move: 'x 1000 m per km', expr: '108,000 m per hour' },
          { move: '/ 60 minutes per hour', expr: '1800 m per minute' },
          { move: '/ 60 seconds per minute', expr: '30 m per second', key: true, tag: 'the answer', choice: '30 m/s' }
        ],
        exits: [
          { at: 0, label: '108 / 3600 = 0.03 skips the meters: kilometers per second', choice: '0.03 m/s', value: '108/3600' },
          { at: 0, label: '108 x 3.6 = 389 multiplies where the shortcut divides', choice: '389 m/s', value: '108*3.6' },
          { at: 1, label: '1.08 x 10^5 stops here: still per hour', choice: '1.08 × 10⁵ m/s', value: '108*1000' },
          { at: 2, label: '1800 stops here: per minute', choice: '1800 m/s', value: '108*1000/60' }
        ]
      },
      check: { vars: { v: 108 }, key: 'v*1000/3600', routes: [{ choice: '0.03 m/s', expr: 'v/3600' }, { choice: '1.08 × 10⁵ m/s', expr: 'v*1000' }, { choice: '1800 m/s', expr: 'v*1000/60' }, { choice: '389 m/s', expr: 'v*3.6' }] },
      reuse: 'qr.work lines block (tools/explain/visuals/qr-work.js, batch B005): a unit ladder with exits',
      alt: 'A ladder from 108 km per hour: times 1000 gives 108,000 m per hour, divide by 60 gives 1800 m per minute, divide by 60 again gives 30 m per second, outlined. Side notes show where 0.03 skips a rung, 389 turns the factor over, and 1.08 x 10^5 and 1800 stop.',
      caption: 'Climb one unit at a time. Each trap is a rung someone stopped at, skipped or turned over.'
    },
    demoPick: '1800 m/s',
    flags: [
      { kind: 'bank-copy', text: 'The bank trap notes shout HOUR and MINUTES in capitals; the explainer uses plain case.' },
      { kind: 'note', text: 'True to life: 108 km/h is motorway speed for a cyclist. A car or a train would read truer. Key unchanged.' },
      { kind: 'note', text: 'The QR engine labels its Unit Conversions view optional review, not on the current DAT, while Full-Length Test 1 serves this item and fm:qr-a:uni1479 in QR. Thomas to say which holds.' }
    ]
  },
  {
    qid: 'fm:qr-a:rat1352',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.ratios.parts',
    difficulty: band(2),
    source: src('qr-a:rat1352', 6),
    keyText: '8',
    answer: { line: '2 + 7 = 9 equal parts of 4 miles each. The shorter leg is 2 parts: 8 miles.' },
    steps: [
      'Add the ratio terms first: 2 + 7 = 9 equal parts make the whole route.',
      'Find one part: 36 / 9 = 4 miles.',
      'Take the parts you need. The shorter leg is 2 parts: 2 x 4 = 8. Check: 8 + 28 = 36.'
    ],
    choices: [
      { text: '4', role: 'trap', family: 'one-step-short', trap: 'One part only', note: '4 miles is a single part. The shorter leg is two parts, so double it.' },
      { text: '8', role: 'key', note: 'Two of the nine 4-mile parts.' },
      { text: '9', role: 'trap', family: 'other-unit', trap: 'Counted parts', note: '9 is how many parts the route splits into, not miles. Each part is worth 4 miles.' },
      { text: '18', role: 'trap', family: 'assumed-equal', trap: 'Split it evenly', note: 'Half of 36 is 18, an even split. A 2 to 7 ratio gives the drivers very different legs.' },
      { text: '28', role: 'trap', family: 'other-question', trap: 'The longer leg', note: '28 is the longer leg, 7 parts of 4. The stem asks for the shorter one.' }
    ],
    lockIt: 'Ratio of parts: add the terms, find one part, then take the parts you need.',
    hook: null,
    playWith: qre('ratios', 'Ratios and Proportions: in Ratio scale mode, set the two terms and scale them together', { mode: 'ratio' }, ['qrRatioMode', 'Ratio scale']),
    video: { slot: 'qr.ratios.parts', title: 'Ratios: add the parts, find one part', id: null, start: null },
    visual: {
      type: 'qr.partwhole', style: 'bars',
      focus: 'shorter-leg',
      rows: [
        { title: '36 miles in 2 + 7 = 9 equal parts', pieces: [{ n: 8, kind: 'key', key: true, cells: 4, label: 'shorter leg: 2 parts = 8', choice: '8' }, { n: 28, kind: 'part', cells: 4, label: 'longer leg: 7 parts = 28', choice: '28' }], total: 36, foot: 'One part = 36 / 9 = 4 miles' }
      ],
      ghosts: [{ at: 18, row: 0, label: 'even split: 18', choice: '18' }],
      check: { vars: { d: 36, a: 2, b: 7 }, key: 'd*a/(a+b)', routes: [{ choice: '4', expr: 'd/(a+b)' }, { choice: '9', expr: 'a+b' }, { choice: '18', expr: 'd/2' }, { choice: '28', expr: 'd*b/(a+b)' }] },
      reuse: 'qr.partwhole style bars (tools/explain/visuals/qr-work.js, batch B005)',
      alt: 'One bar for the 36-mile route cut into 9 equal cells of 4 miles. The first 2 cells, the 8-mile shorter leg, are outlined; the other 7 cells make the 28-mile leg. A dashed mark at 18 shows where an even split would fall.',
      caption: 'Count the cells: 2 of the 9 equal parts are the shorter leg.'
    },
    demoPick: '28',
    flags: [
      { kind: 'note', text: 'The bank stores no trap notes for this item; the notes for 4, 9, 18 and 28 come from the expert routes (one part, the part count, an even split, the longer leg).' }
    ]
  },
  {
    qid: 'fm:qr-a:uni1479',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.ratios.unit-conversion',
    difficulty: band(3),
    source: src('qr-a:uni1479', 13),
    keyText: '204',
    answer: { line: 'Each minute is 60 seconds, so 3.4 minutes is 3.4 x 60 = 204 seconds.' },
    steps: [
      'Ask which way the number moves. Seconds are smaller than minutes, so the count gets bigger: multiply by 60.',
      'Split it if that helps. 3 minutes is 180 seconds, and 0.4 of a minute is 0.4 x 60 = 24 seconds.',
      'Add them: 180 + 24 = 204 seconds.'
    ],
    choices: [
      { text: '0.06', role: 'trap', family: 'operation-flip', trap: 'Divided by 60', note: '3.4 / 60 turns minutes into hours. Going to a smaller unit means more of them, so multiply.' },
      { text: '20.4', role: 'trap', family: 'unit-slip', trap: 'Dropped a zero', note: '3.4 x 6 = 20.4 uses 6 in place of 60. A minute holds 60 seconds.' },
      { text: '63.4', role: 'trap', family: 'operation-flip', trap: 'Added the 60', note: '3.4 + 60 adds the factor. A conversion factor multiplies or divides. It never adds.' },
      { text: '184', role: 'trap', family: 'unit-slip', trap: 'Read .4 as 4 seconds', note: '184 reads 3.4 minutes as 3 minutes 4 seconds. The .4 is four tenths of a minute: 24 seconds.' },
      { text: '204', role: 'key', note: '3 full minutes plus four tenths of one.' }
    ],
    lockIt: 'Big unit to small unit: multiply. A decimal minute is tenths of 60 seconds, not seconds.',
    hook: null,
    playWith: qre('units', 'Unit Conversions: pick the TIME system and convert between hours, minutes and seconds', { system: 'time' }, ['qrUfSystem', 'qruf-chain-'], 'the view labels itself optional review'),
    video: { slot: 'qr.ratios.unit-conversion', title: 'Unit changes: one factor at a time', id: null, start: null },
    visual: {
      type: 'qr.partwhole', style: 'bars',
      focus: 'total-seconds',
      rows: [
        { title: '3 whole minutes and 0.4 of a minute', pieces: [{ n: 60, kind: 'part', label: '60' }, { n: 60, kind: 'part', label: '60' }, { n: 60, kind: 'part', label: '60' }, { n: 24, kind: 'add', cells: 6, label: '0.4 min = 24 s' }] },
        { title: 'The same time in seconds', pieces: [{ n: 204, kind: 'key', key: true, label: '204 seconds', choice: '204' }] }
      ],
      ghosts: [{ at: 184, row: 1, label: '3 min 4 s = 184', choice: '184' }],
      check: { vars: { m: 3.4 }, key: 'm*60', routes: [{ choice: '0.06', expr: 'm/60' }, { choice: '20.4', expr: 'm*6' }, { choice: '63.4', expr: 'm+60' }, { choice: '184', expr: '3*60+4' }] },
      reuse: 'qr.partwhole style bars (tools/explain/visuals/qr-work.js, batch B005)',
      alt: 'Top bar: three 60-second blocks for the 3 whole minutes and a 24-second block, cut into 4 cells of 6 seconds, for the 0.4. The bottom bar, the same length and outlined, is 204 seconds. A dashed mark at 184 shows where reading .4 as 4 seconds lands.',
      caption: 'The last block is four tenths of a minute, 4 cells of 6 seconds, not 4 seconds.'
    },
    demoPick: '184',
    flags: [
      { kind: 'bank-copy', text: 'The bank trap note on 0.06 says it "sends the count the wrong way": a house-banned word, not lifted.' },
      { kind: 'note', text: 'Difficulty: the bank marks this d 3 for one multiplication by 60; generous. The 184 route (reading .4 as 4 seconds) is the real test here.' }
    ]
  },

  /* ===================== Statistics and reading data ===================== */
  {
    qid: 'fm:qr-a:dsm5',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.data.spread',
    difficulty: band(2),
    source: src('qr-a:dsm5', 25),
    keyText: '0',
    answer: { line: 'Every weight equals the mean, so every distance from the mean is 0. No spread, no variance.' },
    steps: [
      'Name what variance measures: how far the values spread out from their mean.',
      'Find the mean. Four weights of 3 grams average to 3 grams.',
      'Measure each distance: 3 - 3 = 0 for every sample. Squared, still 0. The average of zeros is 0.'
    ],
    choices: [
      { text: '0', role: 'key', note: 'Four identical values: no spread at all.' },
      { text: '1', role: 'trap', family: 'miscount', trap: 'No spread is not 1', note: 'No rule lands on 1. Identical values sit no distance from the mean, so the variance is 0.' },
      { text: '3', role: 'trap', family: 'other-question', trap: 'Gave the mean', note: '3 grams is the mean, where every dot sits. Variance asks how far the dots sit from it.' },
      { text: '9', role: 'trap', family: 'one-step-short', trap: 'Squared the value', note: '9 is 3 squared, the average of the squared weights. Variance subtracts the squared mean too: 9 - 9 = 0.' },
      { text: '12', role: 'trap', family: 'other-question', trap: 'Gave the total', note: '12 grams is the total weight, 4 x 3. Spread has nothing to do with the total.' }
    ],
    lockIt: 'Variance measures spread from the mean. Identical values sit 0 away, so their variance is 0.',
    hook: null,
    playWith: qre('desc-stats', 'Descriptive Statistics: type 3, 3, 3, 3 into the data box, press Load and turn on the spread band', { data: [3, 3, 3, 3] }, ['qrstat-input-', 'qrStatLoad', 'qrStatToggle']),
    video: { slot: 'qr.data.spread', title: 'Variance: how far from the mean', id: null, start: null },
    visual: {
      type: 'qr.dataset', kind: 'dots',
      focus: 'zero-spread',
      min: 0, max: 6, step: 1,
      rows: [
        { label: 'The four samples: 3, 3, 3, 3', values: [3, 3, 3, 3], key: true, choice: '0', tag: 'every distance 0: variance 0', zeroLabel: 'All four dots sit on the mean.' },
        { label: 'For contrast: 1, 3, 3, 5', values: [1, 3, 3, 5], ghost: true, variance: 2, tag: 'variance 2 (average squared gap)' }
      ],
      unitLabel: 'weights in grams',
      check: { vars: { w: 3, n: 4 }, derived: ['n'], key: '0', routes: [{ choice: '3', expr: 'w' }, { choice: '9', expr: 'w^2' }, { choice: '12', expr: 'n*w' }], noRoute: [{ choice: '1' }] },
      reuse: 'new: qr.dataset kind dots (tools/explain/visuals/qr-plot.js); the build recomputes each row\'s mean and variance',
      alt: 'Two dot plots on a 0 to 6 gram line. The outlined top plot stacks all four samples at 3, right on the mean line, so every distance is 0 and the variance is 0. A dashed contrast plot of 1, 3, 3, 5 has dots 2 away on each side and a variance of 2, the average squared gap.',
      caption: 'Look at the top plot: every dot sits on the mean, so there is nothing to spread.'
    },
    demoPick: '9',
    flags: [
      { kind: 'note', text: 'Weak distractor: 1 has no route (the bank note only says the variance is zero rather than one). Thomas may want it swapped for a real slip, such as 0.75 or 3 squared minus 3.' }
    ]
  },
  {
    qid: 'fm:qr-a:zsc1638',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.data.z-score',
    difficulty: band(3),
    source: src('qr-a:zsc1638', 30),
    keyText: '-1.15',
    answer: { line: '77 sits 23 visitors below the mean, and 23 is 1.15 standard deviations of 20. Below means negative: -1.15.' },
    steps: [
      'Find the distance from the mean first: 77 - 100 = -23 visitors.',
      'Measure that distance in standard deviations: -23 / 20 = -1.15.',
      'Check the sign. 77 is below the average day, so z has to be negative.'
    ],
    choices: [
      { text: '-23', role: 'trap', family: 'one-step-short', trap: 'Raw distance only', note: '-23 is the distance in visitors. A z score counts standard deviations, so divide by 20.' },
      { text: '-1.15', role: 'key', note: '23 visitors below, in steps of 20.' },
      { text: '-0.23', role: 'trap', family: 'other-unit', trap: 'Divided by the mean', note: '-23 / 100 measures the gap against the mean. A z score uses the standard deviation, 20, as its ruler.' },
      { text: '1.15', role: 'trap', family: 'sign-slip', trap: 'Lost the minus', note: 'Right size, but 77 is below the mean, so the z score is negative.' },
      { text: '3.85', role: 'trap', family: 'half-right', trap: 'Skipped the mean', note: '77 / 20 = 3.85 divides by the SD but never subtracts the mean. A z score measures from the mean, not from zero.' }
    ],
    lockIt: 'z = (value - mean) / SD: the distance from the mean, counted in standard deviations. Below is negative.',
    hook: null,
    playWith: qre('zscore', 'Z-Scores: drag the handles on the bell curve and read the z of each value', {}, ['qrz-handles-', 'qrZPreset']),
    video: { slot: 'qr.data.z-score', title: 'z scores: steps of one standard deviation', id: null, start: null },
    visual: {
      type: 'qr.dataset', kind: 'normal',
      focus: 'value',
      mean: 100, sd: 20, value: 77, unit: 'visitors', span: 3,
      valueLabel: '77 visitors',
      gapLabel: '77 is 23 visitors below the mean: 23 / 20 = 1.15 standard deviations.',
      zLabel: 'z = -1.15',
      marks: [{ choice: '-1.15', key: true }],
      check: { vars: { mu: 100, sd: 20, x: 77 }, key: '(x-mu)/sd', routes: [{ choice: '-23', expr: 'x-mu' }, { choice: '-0.23', expr: '(x-mu)/mu' }, { choice: '1.15', expr: '(mu-x)/sd' }, { choice: '3.85', expr: 'x/sd' }] },
      reuse: 'new: qr.dataset kind normal (tools/explain/visuals/qr-plot.js); the build recomputes z',
      alt: 'A bell curve over 40 to 160 visitors with one tick per standard deviation of 20, each labeled with its z. An outlined line at 77 sits between 60 and 80; the shaded stretch to the mean at 100 is 23 visitors, 1.15 standard deviations: z = -1.15.',
      caption: 'Count the steps of 20 from the mean: 77 is a little more than one step left, so z is about -1.15.'
    },
    demoPick: '1.15',
    flags: [
      { kind: 'bank-copy', text: 'The bank trap note on 1.15 says "Right size, wrong side" (a house-banned word), and the note on -23 calls it "the raw gap in points" when the unit is visitors. Neither is lifted.' }
    ]
  },

  /* ===================== The coordinate plane ===================== */
  {
    qid: 'fm:qr-a:ds1700',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.coordinate.slope',
    difficulty: band(3),
    source: src('qr-a:ds1700', 37),
    keyText: '0.29',
    answer: { line: 'Rise -2 over run -7: two negatives divide to a positive, 2/7, about 0.29.' },
    steps: [
      'Set an order and keep it: second point minus first, on the top and on the bottom.',
      'Rise: -14 - (-12) = -2. Run: -16 - (-9) = -7. Minus a negative is plus.',
      'Slope is rise over run: -2 / -7 = 2/7, about 0.29.',
      'Check the picture. Going left 7 drops 2, which is the same as going right 7 and rising 2. Positive slope.'
    ],
    choices: [
      { text: '-9', role: 'trap', family: 'operation-flip', trap: 'Added rise and run', note: '-2 + (-7) = -9 adds the rise and the run. Slope is a ratio: rise divided by run.' },
      { text: '-0.29', role: 'trap', family: 'sign-slip', trap: 'Mixed the order', note: 'Taking y in one order and x in the other flips the sign. Keep the same order on top and bottom.' },
      { text: '0.08', role: 'trap', family: 'sign-slip', trap: 'Lost the double negative', note: '0.08 writes the run as -16 - 9 = -25, losing the minus on -9. Minus a negative adds: -16 + 9 = -7.' },
      { text: '0.29', role: 'key', note: 'Down 2 for every 7 to the left: up to the right.' },
      { text: '3.5', role: 'trap', family: 'reversed', trap: 'Run over rise', note: '-7 / -2 = 3.5 puts the run over the rise. Slope is rise over run.' }
    ],
    lockIt: 'Slope is rise over run, both taken in the same order. Two negatives divide to a positive.',
    hook: null,
    playWith: qre('coord', 'Coordinate Plane: in Slope mode, drag the two points and watch rise over run', { mode: 'slope' }, ['qrCoordMode', 'qrgrid-'], 'its grid runs from -6 to 6, so these two points sit off it'),
    video: { slot: 'qr.coordinate.slope', title: 'Slope: rise over run, signs and all', id: null, start: null },
    visual: {
      type: 'qr.plane', kind: 'slope',
      focus: 'rises-right',
      x: [-18, 1], y: [-16, 1], every: 4,
      points: [{ x: -9, y: -12 }, { x: -16, y: -14 }],
      result: { choice: '0.29', key: true, label: 'rise / run = -2 / -7 = 0.29' },
      foot: 'Left 7 and down 2 is the same move as right 7 and up 2: the cable rises to the right.',
      check: { vars: { x1: -9, y1: -12, x2: -16, y2: -14 }, key: '(y2-y1)/(x2-x1)', routes: [{ choice: '-9', expr: '(y2-y1)+(x2-x1)' }, { choice: '-0.29', expr: '(y2-y1)/(x1-x2)' }, { choice: '0.08', expr: '(y2-y1)/(x2-9)' }, { choice: '3.5', expr: '(x2-x1)/(y2-y1)' }] },
      reuse: 'new: qr.plane kind slope (tools/explain/visuals/qr-plot.js); the build recomputes the slope',
      alt: 'A grid in the third quadrant with the points (-9, -12) and (-16, -14). An arrow runs 7 left, labeled run -7, then 2 down, labeled rise -2. The outlined line through both points climbs to the right: rise over run is -2 / -7 = 0.29.',
      caption: 'Follow the two arrows: left 7, then down 2. Both are negative, so the slope is positive.'
    },
    demoPick: '-0.29',
    flags: [
      { kind: 'note', text: 'The bank files this under Statistics and reading data; it is a coordinate-plane slope item, so its sidecar and video slot sit under qr.coordinate. The stem asks for the nearest hundredth while -9 and 3.5 are not written to hundredths; harmless.' }
    ]
  },
  {
    qid: 'fm:qr-a:coo1459',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.coordinate.distance',
    difficulty: band(3),
    source: src('qr-a:coo1459', 3),
    keyText: '7.81',
    answer: { line: 'The gaps are 6 across and 5 up, so the distance is root (36 + 25) = root 61, about 7.81.' },
    steps: [
      'Draw the hidden right triangle: 9 - 3 = 6 across and 5 - 0 = 5 up. The distance is its long side.',
      'Use Pythagoras: 6^2 + 5^2 = 36 + 25 = 61, so the distance is root 61.',
      'Estimate the root. 7^2 = 49 and 8^2 = 64, so root 61 sits just under 8: 7.81.'
    ],
    choices: [
      { text: '3.32', role: 'trap', family: 'half-right', trap: 'Never squared', note: 'Adding the gaps first and then taking the root gives root 11, about 3.32. Square the gaps, then add.' },
      { text: '6', role: 'trap', family: 'other-question', trap: 'Horizontal gap only', note: '6 is just the gap across. The points also sit 5 apart up and down.' },
      { text: '7.81', role: 'key', note: 'The long side of a 6 by 5 right triangle.' },
      { text: '11', role: 'trap', family: 'other-question', trap: 'Walked the grid', note: '6 + 5 = 11 walks along the grid lines. The straight line cuts the corner, so it is shorter.' },
      { text: '61', role: 'trap', family: 'one-step-short', trap: 'Forgot the root', note: '61 is the distance squared. Take the square root: about 7.81.' }
    ],
    lockIt: 'Distance between two points: the gaps are the legs of a right triangle. Square, add, take the root.',
    hook: null,
    playWith: qre('coord', 'Coordinate Plane: in Distance mode, drag the two points and watch the legs and the straight line', { mode: 'distance' }, ['qrCoordMode', 'qrgrid-'], 'it needs a state reader to place (3, 0) and (9, 5)'),
    video: { slot: 'qr.coordinate.distance', title: 'Distance: the hidden right triangle', id: null, start: null },
    visual: {
      type: 'qr.plane', kind: 'distance',
      focus: 'hypotenuse',
      x: [0, 10], y: [-1, 6], every: 2,
      points: [{ x: 3, y: 0 }, { x: 9, y: 5 }],
      result: { choice: '7.81', key: true, label: 'straight line: root 61, about 7.81' },
      walk: { choice: '11', label: 'Walking the grid lines, 6 + 5 = 11, goes around the corner. The straight line is shorter.' },
      check: { vars: { x1: 3, y1: 0, x2: 9, y2: 5 }, key: 'sqrt((x2-x1)^2+(y2-y1)^2)', routes: [{ choice: '3.32', expr: 'sqrt((x2-x1)+(y2-y1))' }, { choice: '6', expr: 'x2-x1' }, { choice: '11', expr: '(x2-x1)+(y2-y1)' }, { choice: '61', expr: '(x2-x1)^2+(y2-y1)^2' }] },
      reuse: 'new: qr.plane kind distance (tools/explain/visuals/qr-plot.js); the build recomputes the distance',
      alt: 'A grid with the points (3, 0) and (9, 5). Dashed legs run 6 across and 5 up to a right-angle corner, and the outlined straight line between the points is root 61, about 7.81. A note shows that the grid walk of 6 + 5 = 11 is longer.',
      caption: 'The two dashed legs are 6 and 5. The outlined line cuts the corner, so it is shorter than 11.'
    },
    demoPick: '11',
    flags: [
      { kind: 'note', text: 'The bank stores no trap notes for this item; the notes for 3.32, 6, 11 and 61 come from the expert routes.' }
    ]
  },
  {
    qid: 'fm:qr-b:QR_xp005',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.geometry.circles',
    difficulty: band(3),
    source: src('qr-b:QR_xp005', 23),
    keyText: '(25π/4) − 6',
    answer: { line: 'The hypotenuse 5 is the diameter, so r = 2.5 and the circle is 25pi/4. Take away the triangle\'s 6.' },
    steps: [
      'Name the region first: inside the circle, outside the triangle. That is circle minus triangle.',
      'The hypotenuse is a diameter, so the radius is 5 / 2 = 2.5. Circle: pi x 2.5^2 = 6.25pi, which is 25pi/4.',
      'Triangle: the legs are the base and the height, so (1/2)(3)(4) = 6.',
      'Subtract: 25pi/4 - 6, about 19.6 - 6 = 13.6. An area has to come out positive.'
    ],
    choices: [
      { text: '(25π/4) − 6', role: 'key', display: '25pi/4 minus 6', note: 'Circle of radius 2.5 minus the triangle.' },
      { text: '(25π/2) − 6', role: 'trap', family: 'half-right', display: '25pi/2 minus 6', trap: 'Circle area doubled', note: 'The 6 is right, but 25pi/2 is twice this circle. With a radius of 2.5, pi r^2 is 25pi/4.' },
      { text: '6 − (25π/4)', role: 'trap', family: 'sign-slip', display: '6 minus 25pi/4', trap: 'Subtracted backward', note: 'Triangle minus circle comes out negative, about -13.6. The circle is the bigger shape, so it goes first.' },
      { text: '5π − 12', role: 'trap', family: 'other-unit', display: '5pi minus 12', trap: 'Used perimeters', note: '5pi is the circumference and 12 is the perimeter, 3 + 4 + 5: lengths, not areas. The region asks for an area.' },
      { text: '25π − 6', role: 'trap', family: 'neighbor-fact', display: '25pi minus 6', trap: 'Diameter as radius', note: '25pi uses the diameter, 5, as the radius. The radius is half the hypotenuse: 2.5.' }
    ],
    lockIt: 'Shaded region: whole minus part. A right triangle in a circle puts its hypotenuse on a diameter.',
    hook: null,
    playWith: qre('geo-2d', '2D Geometry: pick Circle and slide r to watch the area grow as r squared', { shape: 'circle', r: 2.5 }, ['qrShapePick', 'qrshape-ctrl-'], 'the view labels itself optional review'),
    video: { slot: 'qr.geometry.circles', title: 'Circles: radius first, then area', id: null, start: null },
    visual: {
      type: 'qr.plane', kind: 'inscribed',
      focus: 'region',
      legs: [3, 4], hyp: 5,
      diameterLabel: 'hypotenuse 5 = diameter',
      rows: [
        { label: 'circle: pi x 2.5^2 = 25pi/4', value: 'circle' },
        { label: 'triangle: (1/2)(3)(4) = 6', value: 'triangle', about: false },
        { label: 'shaded: 25pi/4 - 6', value: 'region', key: true, choice: '(25π/4) − 6' }
      ],
      result: { choice: '(25π/4) − 6', key: true },
      check: { vars: { a: 3, b: 4, c: 5 }, key: 'pi*(c/2)^2 - a*b/2', routes: [{ choice: '(25π/2) − 6', expr: 'pi*c^2/2 - a*b/2' }, { choice: '6 − (25π/4)', expr: 'a*b/2 - pi*(c/2)^2' }, { choice: '5π − 12', expr: 'pi*c - (a+b+c)' }, { choice: '25π − 6', expr: 'pi*c^2 - a*b/2' }] },
      reuse: 'new: qr.plane kind inscribed (tools/explain/visuals/qr-plot.js); the build recomputes the circle, the triangle and the region and reads the choices written in pi',
      alt: 'A circle with a 3-4-5 right triangle inside it: the hypotenuse of 5 runs through the center as a diameter, the radius is 2.5, and the right angle touches the circle. The region inside the circle and outside the triangle is shaded; boxes give the circle 25pi/4, the triangle 6, and the outlined difference.',
      caption: 'The hypotenuse runs through the center, so it is a diameter. The shaded space is circle minus triangle.'
    },
    demoPick: '25π − 6',
    flags: [
      { kind: 'stem-style', text: 'The stem shouts CIRCLE, INSIDE and OUTSIDE in capitals, and "such that the hypotenuse is a diameter" states a principle (a right triangle inscribed in a circle always has its hypotenuse on a diameter), while "(and hypotenuse 5)" hands over the 3-4-5 step. Suggested wording for Thomas to review (not applied): "A right triangle with legs 3 and 4 is inscribed in a circle. What is the area of the region inside the circle but outside the triangle?" Key unchanged.' },
      { kind: 'note', text: 'Weak distractor: (25pi/2) - 6 needs a formula slip (pi d^2 / 2) or two slips; the note names it only as twice the circle.' }
    ]
  },

  /* ===================== Trigonometry, just enough ===================== */
  {
    qid: 'fm:written:qr-11-rn4znq',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.trig.identities',
    difficulty: band(3),
    source: src('written:qr-11-rn4znq', 32),
    keyText: '-0.96',
    answer: { line: 'sin^2 = 1 - 0.0784 = 0.9216, so the size is 0.96. Quadrant III makes it negative: -0.96.' },
    steps: [
      'Split the job. The identity gives the size of the sine; the quadrant gives its sign.',
      'Size: sin^2 + cos^2 = 1, so sin^2 = 1 - 0.28^2 = 1 - 0.0784 = 0.9216. Its root is 0.96.',
      'Sign: in quadrant III both x and y are negative, and the sine is the y value. So sin = -0.96.'
    ],
    choices: [
      { text: '-0.96', role: 'key', note: 'Size from the identity, sign from quadrant III.' },
      { text: '-0.9216', role: 'trap', family: 'one-step-short', trap: 'Forgot the root', note: '-0.9216 is sin^2 with a minus sign. Take the square root: 0.96.' },
      { text: '-0.72', role: 'trap', family: 'half-right', trap: 'Skipped the squares', note: 'The sign is right, but 1 - 0.28 = 0.72 subtracts the size of cos, not its square. The identity squares both.' },
      { text: '0.72', role: 'trap', family: 'miscount', trap: 'Two slips', note: '0.72 stacks two slips: no squares and no minus sign. Square first, then read the quadrant.' },
      { text: '0.96', role: 'trap', family: 'other-conditions', trap: 'Quadrant II sign', note: 'Right size, but a positive sine with a negative cosine is quadrant II. In quadrant III the y value is negative.' }
    ],
    lockIt: 'Identity for the size, quadrant for the sign. In quadrant III, sine and cosine are both negative.',
    hook: '0.28 and 0.96: the 7-24-25 triangle, shrunk by 25.',
    playWith: qre('trig', 'Trigonometry: SOHCAHTOA, the identity and the special angles, with worked and practice questions', {}, ['SOHCAHTOA', 'data-go="trig"'], 'the view labels itself optional review and has no unit circle of its own'),
    video: { slot: 'qr.trig.identities', title: 'The unit circle: size from the identity, sign from the quadrant', id: null, start: null },
    visual: {
      type: 'qr.plane', kind: 'unit-circle',
      focus: 'quadrant-3',
      cos: -0.28, quadrant: 3,
      pointLabel: '(-0.28, -0.96)',
      ghost: { quadrant: 2, label: '0.96 is quadrant II', choice: '0.96' },
      result: { choice: '-0.96', key: true, label: 'sin = -0.96' },
      foot: 'The identity gives the size, 0.96. Quadrant III, below the x axis, gives the minus sign.',
      check: { vars: { c: -0.28 }, key: '-sqrt(1-c^2)', routes: [{ choice: '-0.9216', expr: '-(1-c^2)' }, { choice: '-0.72', expr: '-(1+c)' }, { choice: '0.72', expr: '1+c' }, { choice: '0.96', expr: 'sqrt(1-c^2)' }] },
      reuse: 'new: qr.plane kind unit-circle (tools/explain/visuals/qr-plot.js); the build recomputes the point from the cosine and the quadrant',
      alt: 'A unit circle with each quadrant labeled by the signs of sine and cosine; quadrant III, both negative, is outlined. The point (-0.28, -0.96) sits on the circle there: cos -0.28 along the x axis and sin -0.96 straight down. A dashed mirror point at (-0.28, 0.96) marks quadrant II.',
      caption: 'Find the point in quadrant III. It sits below the x axis, so its sine is negative.'
    },
    demoPick: '0.96',
    flags: [
      { kind: 'bank-copy', text: 'The bank trap note on 0.96 says "wrong sign": a house-banned word, not lifted. The bank why\'s 7-24-25 tell is true and is the memory cue here.' },
      { kind: 'tool-gap', text: 'The QR engine\'s Trigonometry view has no unit circle; a quadrant-sign circle with a draggable point would be the exact play-with state.' }
    ]
  },

  /* ===================== The setup mindset ===================== */
  {
    qid: 'fm:qr-b:QR_xp006',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.word-problems.mixtures',
    difficulty: band(3),
    source: src('qr-b:QR_xp006', 21),
    keyText: '20 L',
    answer: { line: '20 L of 25% and 15 L of 60% hold 5 + 9 = 14 L of acid, which is 40% of 35 L.' },
    steps: [
      'Picture a seesaw first. 40 sits 15 above 25 and 20 below 60, so the mix leans toward the 25% side: more than half is the 25% solution.',
      'Set the amounts: x liters of 25%, and the rest of the 35 liters at 60%. Track only the acid: 0.25x + 0.60(35 - x) = 0.40(35) = 14.',
      'Solve: 0.25x + 21 - 0.60x = 14, so 0.35x = 7 and x = 20 L.',
      'Check it: 20 L of 25% holds 5 L of acid and 15 L of 60% holds 9 L. 14 L in 35 L is 40%.'
    ],
    choices: [
      { text: '12 L', role: 'trap', family: 'miscount', trap: 'No clean route', note: 'No single slip lands on 12. With 12 L of the 25% solution the mix comes out at 48%, above the target.' },
      { text: '10 L', role: 'trap', family: 'miscount', trap: 'No clean route', note: 'No single slip lands on 10 either. 10 L of the 25% solution makes a 50% mix: too much of the strong one.' },
      { text: '25 L', role: 'trap', family: 'miscount', trap: 'Reused the 25', note: '25 L likely reuses the 25 from 25%. It would make a 35% mix, below the target.' },
      { text: '15 L', role: 'trap', family: 'other-question', trap: 'The other solution', note: '15 L is how much of the 60% solution goes in. The stem asks for the 25% solution, the bigger pour.' },
      { text: '20 L', role: 'key', note: 'The bigger pour, because 40% sits closer to 25%.' }
    ],
    lockIt: 'A mix lands between its parts, closer to the bigger pour. Track the solute, not the liquid.',
    hook: null,
    playWith: qre('mixture', 'Mixture Setups: set 25% at 80 and 60% at 60 (the same 4 to 3 split) and watch the blend land on 40%', { cA: 25, vA: 80, cB: 60, vB: 60 }, ['qrmb-vcA-', 'qrmb-vvB-'], 'its four sliders need a state reader; volumes step by 20, so the 20 L and 15 L pours are set as 80 and 60'),
    video: { slot: 'qr.word-problems.mixtures', title: 'Mixtures: the seesaw', id: null, start: null },
    visual: {
      type: 'qr.tree', kind: 'mix',
      focus: 'bigger-pour',
      unit: 'L', wholeLabel: 'of 40% acid', soluteLabel: 'acid', dp: 0,
      pours: [{ v: 20, pct: 25, key: true, choice: '20 L', tag: 'the answer' }, { v: 15, pct: 60, trap: true, choice: '15 L', tag: 'other pour' }],
      total: { v: 35 }, target: 40,
      result: { tag: 'the target' },
      lever: { min: 20, max: 65, title: 'The seesaw: the mix leans toward the bigger pour', mixLabel: 'mix', balance: true, foot: '20 L x 15 apart = 15 L x 20 apart, so the seesaw balances at 40%.' },
      check: { vars: { a: 25, b: 60, V: 35, m: 40 }, key: 'V*(b-m)/(b-a)', routes: [{ choice: '15 L', expr: 'V*(m-a)/(b-a)' }, { choice: '25 L', expr: 'a' }], noRoute: [{ choice: '12 L' }, { choice: '10 L' }] },
      reuse: 'new: qr.tree kind mix (tools/explain/visuals/qr-plot.js); the build recomputes the acid in each pour, the 40% target and the balance',
      alt: '35 L of 40% acid splits into 20 L at 25%, outlined as the answer, and 15 L at 60%; they hold 5 L and 9 L of acid, 14 L in all. Below, a seesaw from 25% to 60% balances at 40%, 15 from the bigger pour and 20 from the smaller.',
      caption: 'Read the seesaw: 40% sits closer to 25%, so the 25% pour is the bigger one.'
    },
    demoPick: '15 L',
    flags: [
      { kind: 'note', text: 'Weak distractors: 12 L, 10 L and 25 L have no single-slip route (they would make 48, 50 and 35 percent mixes) and the bank stores no trap notes; only 15 L is a real pull. Thomas may want two of them replaced: 17.5 L, the equal split, is the classic missing trap.' },
      { kind: 'note', text: 'Concept-first rule: one linear equation, light enough. The explainer teaches the seesaw first and the equation second.' }
    ]
  },
  {
    qid: 'fm:qr-a:men1234',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.word-problems.setup',
    difficulty: band(3),
    source: src('qr-a:men1234', 35),
    keyText: '46',
    answer: { line: 'A round trip is there and back: 23 + 23 = 46 km.' },
    steps: [
      'Read the words before the numbers. Round trip means there and back: two legs of 23 km.',
      'Double it in pieces: 20 x 2 = 40 and 3 x 2 = 6, so 40 + 6 = 46 km.',
      'Check the size: each leg is a little over 20 km, so the round trip is a little over 40 and under 50. 46 fits.'
    ],
    choices: [
      { text: '36', role: 'trap', family: 'miscount', trap: 'Ten light', note: '36 is ten short of 46, a slip in the adding with no rule behind it. 40 + 6 = 46.' },
      { text: '40', role: 'trap', family: 'one-step-short', trap: 'Doubled the tens only', note: '40 doubles the 20 and leaves out 3 x 2. Add the 6: 46.' },
      { text: '46', role: 'key', note: 'Two legs of 23.' },
      { text: '56', role: 'trap', family: 'miscount', trap: 'Ten over', note: '56 is ten past 46, a phantom carry. 23 + 23 needs no carry at all.' },
      { text: '146', role: 'trap', family: 'miscount', trap: 'Extra digit', note: '146 adds a hundred that is not there. Two legs of 23 km stay under 50.' }
    ],
    lockIt: 'Round trip means there and back: double the one-way distance.',
    hook: null,
    playWith: qre('mental', 'Mental Math Tricks: type 23 x 2 and use Distribute to split it into 20 and 3', { trick: 'distribute', a: 23, b: 2 }, ['qrDecPreset', 'Distribute (10+rest)'], 'its two number boxes need a state reader'),
    video: { slot: 'qr.word-problems.setup', title: 'Turning words into an equation', id: null, start: null },
    visual: {
      type: 'qr.partwhole', style: 'bars',
      focus: 'round-trip',
      rows: [
        { title: 'There and back', pieces: [{ n: 23, kind: 'part', label: 'there 23' }, { n: 23, kind: 'part', label: 'back 23' }] },
        { title: 'The round trip', pieces: [{ n: 46, kind: 'key', key: true, label: '46 km', choice: '46' }] }
      ],
      ghosts: [{ at: 40, row: 1, label: 'tens only: 40', choice: '40' }],
      check: { vars: { d: 23 }, key: '2*d', routes: [{ choice: '40', expr: '2*20' }], noRoute: [{ choice: '36' }, { choice: '56' }, { choice: '146' }] },
      reuse: 'qr.partwhole style bars (tools/explain/visuals/qr-work.js, batch B005)',
      alt: 'Top bar: two 23 km legs end to end, there and back. The bottom bar, the same length and outlined, is the 46 km round trip. A dashed mark at 40 shows where doubling only the tens stops.',
      caption: 'Lay the two legs end to end: the round trip bar matches them exactly.'
    },
    demoPick: '40',
    flags: [
      { kind: 'true-to-life', text: 'Difficulty: the bank marks this d 3, but doubling 23 is far below DAT QR level, and all four distractors are arithmetic slips (ten light, ten over, tens only, an extra hundred) with no concept behind them. Thomas may want a real setup item in its place.' },
      { kind: 'bank-copy', text: 'The bank why "(20 + 3) x 2 = 40 + 6" never states 46; the explainer supplies the last step.' }
    ]
  },

  /* ===================== Word problems: mixtures, interest, money ===================== */
  {
    qid: 'fm:qr-a:mix1417',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.word-problems.mixtures',
    difficulty: band(3),
    source: src('qr-a:mix1417', 8),
    keyText: '7.22',
    answer: { line: '20 + 12.5 = 32.5 mL of vinegar in 450 mL of dressing: about 7.22 percent.' },
    steps: [
      'Count the vinegar, not the dressing. 10 percent of 200 mL is 20 mL, and 5 percent of 250 mL is 12.5 mL.',
      'Add the parts and the whole: 32.5 mL of vinegar in 200 + 250 = 450 mL.',
      'Divide: 32.5 / 450 = 0.0722, about 7.22 percent.',
      'Check it: there is more of the 5 percent dressing, so the mix sits below the halfway mark of 7.5.'
    ],
    choices: [
      { text: '7.22', role: 'key', note: '32.5 mL of vinegar in 450 mL.' },
      { text: '7.5', role: 'trap', family: 'assumed-equal', trap: 'Plain average', note: '7.5 averages 10 and 5 as if the pours were equal. There is more of the 5 percent dressing, so the mix leans toward 5.' },
      { text: '7.78', role: 'trap', family: 'reversed', trap: 'Swapped the weights', note: '7.78 puts the 10 percent on the 250 mL pour and the 5 percent on the 200 mL pour. The bigger pour pulls the mix toward its own strength.' },
      { text: '32.5', role: 'trap', family: 'one-step-short', trap: 'Stopped at the vinegar', note: '32.5 is milliliters of vinegar, not a percent. Divide by the 450 mL total.' },
      { text: '33.75', role: 'trap', family: 'miscount', trap: 'Two slips', note: '33.75 is 7.5 percent of 450 mL: the plain average turned back into milliliters. Two slips stacked.' }
    ],
    lockIt: 'Mix strength is total solute over total volume. It lands between the parts, nearer the bigger pour.',
    hook: null,
    playWith: qre('mixture', 'Mixture Setups: set each solution\'s strength and volume and watch the blend land against the plain midpoint', {}, ['qrmb-vcA-', 'qrmb-vvB-'], 'its four sliders need a state reader; volumes step by 20, so 250 mL cannot be set exactly'),
    video: { slot: 'qr.word-problems.mixtures', title: 'Mixtures: the seesaw', id: null, start: null },
    visual: {
      type: 'qr.tree', kind: 'mix',
      focus: 'mix-strength',
      unit: 'mL', wholeLabel: 'of dressing', soluteLabel: 'vinegar', dp: 2,
      pours: [{ v: 200, pct: 10 }, { v: 250, pct: 5 }],
      result: { choice: '7.22', key: true },
      lever: { min: 4, max: 11, title: 'The mix leans toward the bigger pour', mixLabel: 'mix', marks: [{ at: 7.5, label: 'plain average 7.5', choice: '7.5' }, { at: 7.78, label: 'swapped 7.78', choice: '7.78', expr: '(250*10+200*5)/450' }] },
      check: { vars: { v1: 200, p1: 10, v2: 250, p2: 5 }, key: '(v1*p1+v2*p2)/(v1+v2)', routes: [{ choice: '7.5', expr: '(p1+p2)/2' }, { choice: '7.78', expr: '(v2*p1+v1*p2)/(v1+v2)' }, { choice: '32.5', expr: '(v1*p1+v2*p2)/100' }, { choice: '33.75', expr: '(v1+v2)*(p1+p2)/2/100' }] },
      reuse: 'new: qr.tree kind mix (tools/explain/visuals/qr-plot.js); the build recomputes the vinegar in each pour and the mix',
      alt: '450 mL of dressing splits into 200 mL at 10%, holding 20 mL of vinegar, and 250 mL at 5%, holding 12.5 mL; together 32.5 mL of 450, about 7.22%, outlined. A seesaw from 5% to 10% puts the mix left of the plain average 7.5, toward the bigger pour; 7.78 sits past it.',
      caption: 'Look under the seesaw: the mix sits left of 7.5 because the 5% pour is the bigger one.'
    },
    demoPick: '7.5',
    flags: [
      { kind: 'note', text: 'Weak distractor: 33.75 stacks two slips (the plain average, then turned back into milliliters).' }
    ]
  },
  {
    qid: 'fm:generated:qr-compound-interest#1d9ugnl',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.word-problems.interest',
    difficulty: band(2),
    source: src('generated:qr-compound-interest#1d9ugnl', 11),
    keyText: '$1440.00',
    answer: { line: 'Each year multiplies the balance by 1.2: 1000 x 1.2 x 1.2 = 1440 dollars.' },
    steps: [
      'Turn 20 percent growth into a multiplier: each year, the balance times 1.2.',
      'Year 1: 1000 x 1.2 = 1200. Year 2: 1200 x 1.2 = 1440.',
      'See why it beats simple interest. Year 2 pays 240, not 200, because last year\'s interest earns interest too.'
    ],
    choices: [
      { text: '$440.00', role: 'trap', family: 'other-question', trap: 'Interest only', note: '440 is the interest earned over the two years. The stem asks for the balance: 1000 + 440.' },
      { text: '$1200.00', role: 'trap', family: 'one-step-short', trap: 'One year only', note: '1200 is the balance after one year. Two years means two multipliers.' },
      { text: '$1400.00', role: 'trap', family: 'other-conditions', trap: 'Simple interest', note: '1000 + 2 x 200 = 1400 is simple interest, where only the first 1000 earns. Compounding pays interest on the interest.' },
      { text: '$1440.00', role: 'key', note: 'Two years of x 1.2.' },
      { text: '$1728.00', role: 'trap', family: 'one-step-too-far', trap: 'Three years', note: '1728 is three years of growth, 1000 x 1.2 x 1.2 x 1.2. Stop at two.' }
    ],
    lockIt: 'Compound growth multiplies by (1 + rate) once per period, so interest earns interest.',
    hook: null,
    playWith: qre('interest', 'Interest and Growth: switch between Simple and Compound and watch the compound curve pull away', { mode: 'compound' }, ['qrGrowMode', 'qrgrow-ctrl-']),
    video: { slot: 'qr.word-problems.interest', title: 'Compound interest: interest on interest', id: null, start: null },
    visual: {
      type: 'qr.partwhole', style: 'bars',
      focus: 'balance',
      rows: [
        { title: 'Start', pieces: [{ n: 1000, kind: 'base', label: '1000' }] },
        { title: 'After year 1: times 1.2', pieces: [{ n: 1000, kind: 'base', label: '1000' }, { n: 200, kind: 'add', pct: 20, of: 'prev', label: '+200' }], total: 1200 },
        { title: 'After year 2: times 1.2 again', pieces: [{ n: 1200, kind: 'base', label: '1200' }, { n: 240, kind: 'add', pct: 20, of: 'prev', label: '+240' }], total: 1440 },
        { title: 'The balance', pieces: [{ n: 1440, kind: 'key', key: true, label: '1440 dollars', choice: '$1440.00' }] }
      ],
      ghosts: [{ at: 1400, row: 3, label: 'simple: 1400', choice: '$1400.00' }, { at: 1728, row: 3, label: 'three years: 1728', choice: '$1728.00' }],
      check: { vars: { P: 1000, r: 20, t: 2 }, key: 'P*(1+r/100)^t', routes: [{ choice: '$440.00', expr: 'P*(1+r/100)^t - P' }, { choice: '$1200.00', expr: 'P*(1+r/100)' }, { choice: '$1400.00', expr: 'P*(1+t*r/100)' }, { choice: '$1728.00', expr: 'P*(1+r/100)^3' }] },
      reuse: 'qr.partwhole style bars (tools/explain/visuals/qr-work.js, batch B005)',
      alt: 'Four bars on one scale: 1000 at the start; 1000 plus 200 after year 1; 1200 plus 240 after year 2, the 240 earned on the whole 1200; and the outlined balance of 1440. Dashed marks show simple interest at 1400 and three years at 1728.',
      caption: 'Compare the two blue pieces: year 2 earns 240, more than 200, because it earns on 1200.'
    },
    demoPick: '$1400.00',
    flags: [
      { kind: 'bank-copy', text: 'The bank trap notes shout BALANCE and SIMPLE in capitals; the explainer uses plain case.' }
    ]
  },
  {
    qid: 'fm:qr-a:mix1419',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.word-problems.mixtures',
    difficulty: band(3),
    source: src('qr-a:mix1419', 26),
    keyText: '17.5',
    answer: { line: '25 + 10 = 35 g of sugar in 200 mL: 17.5 percent. Equal pours land halfway between 25 and 10.' },
    steps: [
      'Count the sugar. A 25 percent solution holds 25 g in every 100 mL, and a 10 percent one holds 10 g: 35 g of sugar.',
      'Divide by the whole: 35 / 200 = 0.175, so 17.5 percent.',
      'Check it with the seesaw. Equal pours balance in the middle, so here the plain average works: (25 + 10) / 2 = 17.5.'
    ],
    choices: [
      { text: '8.75', role: 'trap', family: 'one-step-too-far', trap: 'Halved twice', note: '8.75 halves 17.5 again. Two 100 mL portions make 200 mL, so divide 35 by 200 once.' },
      { text: '12.5', role: 'trap', family: 'half-right', trap: 'Ignored the 10%', note: '12.5 treats the 10 percent solution as plain water and halves 25. The second solution brings sugar too.' },
      { text: '15', role: 'trap', family: 'operation-flip', trap: 'Subtracted the strengths', note: '25 - 10 = 15 takes the gap between the strengths. A mix averages them.' },
      { text: '17.5', role: 'key', note: '35 g of sugar in 200 mL.' },
      { text: '35', role: 'trap', family: 'one-step-short', trap: 'Never divided', note: '35 is the grams of sugar. Divide by the 200 mL total to get the percent.' }
    ],
    lockIt: 'Equal amounts mix to the plain average. Unequal amounts lean toward the bigger pour.',
    hook: null,
    playWith: qre('mixture', 'Mixture Setups: set 25% at 100 and 10% at 100 and watch the blend land on 17.5%', { cA: 25, vA: 100, cB: 10, vB: 100 }, ['qrmb-vcA-', 'qrmb-vvB-'], 'its four sliders need a state reader'),
    video: { slot: 'qr.word-problems.mixtures', title: 'Mixtures: the seesaw', id: null, start: null },
    visual: {
      type: 'qr.tree', kind: 'mix',
      focus: 'midpoint',
      unit: 'mL', soluteUnit: 'g', wholeLabel: 'of solution', soluteLabel: 'sugar', dp: 1,
      pours: [{ v: 100, pct: 25 }, { v: 100, pct: 10 }],
      result: { choice: '17.5', key: true },
      lever: { min: 6, max: 29, title: 'Equal pours balance in the middle', mixLabel: 'mix', balance: true },
      check: { vars: { v: 100, a: 25, b: 10 }, key: '(v*a+v*b)/(2*v)', routes: [{ choice: '8.75', expr: '(a+b)/4' }, { choice: '12.5', expr: 'a/2' }, { choice: '15', expr: 'a-b' }, { choice: '35', expr: 'a+b' }] },
      reuse: 'new: qr.tree kind mix (tools/explain/visuals/qr-plot.js)',
      alt: '200 mL splits into 100 mL at 25%, holding 25 g of sugar, and 100 mL at 10%, holding 10 g; together 35 g in 200 mL, 17.5%, outlined. On a seesaw from 10% to 25%, the two equal pours balance at the midpoint, 17.5, each 7.5 away.',
      caption: 'Equal pours, equal weights: the seesaw balances halfway, at 17.5.'
    },
    demoPick: '15',
    flags: [
      { kind: 'note', text: 'The bank stores no trap notes for this item; the notes for 8.75, 12.5, 15 and 35 come from the expert routes.' }
    ]
  },

  /* ===================== Word problems: rates, distance, work ===================== */
  {
    qid: 'fm:qr-a:rt3',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.word-problems.rates',
    difficulty: band(2),
    source: src('qr-a:rt3', 17),
    keyText: '2.5 hr',
    answer: { line: 'The gap closes 50 + 30 = 80 miles every hour, so 200 miles takes 200 / 80 = 2.5 hours.' },
    steps: [
      'Follow the gap, not one car. Driving toward each other, both cars eat into it, so the speeds add: 80 mph.',
      'Time to meet is the gap over the closing speed: 200 / 80 = 2.5 hours.',
      'Check it: in 2.5 hours one car drives 125 miles and the other 75. 125 + 75 = 200.'
    ],
    choices: [
      { text: '2.5 hr', role: 'key', note: '200 miles closed at 80 mph.' },
      { text: '5 hr', role: 'trap', family: 'operation-flip', trap: 'Averaged the speeds', note: '5 hours uses 40 mph, the average of the two speeds. Toward each other, the speeds add: 80 mph.' },
      { text: '6.67 hr', role: 'trap', family: 'other-conditions', trap: 'Slower car alone', note: '200 / 30 is the slower car closing the whole gap alone, as if the other were parked. Both are moving.' },
      { text: '2 hr', role: 'trap', family: 'miscount', trap: 'No clean route', note: 'No single slip lands on 2 hours: that needs a closing speed of 100. The speeds add to 80.' },
      { text: '4 hr', role: 'trap', family: 'other-conditions', trap: 'Faster car alone', note: '200 / 50 is the faster car covering the whole gap alone. The other car closes 30 miles of it every hour too.' }
    ],
    lockIt: 'Moving toward each other, the speeds add. Time to meet is the gap over the closing speed.',
    hook: null,
    playWith: qre('rate-time', 'Rate x Time = Distance: in Distance / Time mode, set two rates and run the movers until their lines cross', { mode: 'travel' }, ['qrRateMode', 'qrRateRun'], 'its rate sliders need a state reader'),
    video: { slot: 'qr.word-problems.rates', title: 'Rates: watch the gap', id: null, start: null },
    visual: {
      type: 'qr.partwhole', style: 'bars',
      focus: 'meet-time',
      rows: [
        { title: 'Hours: the gap shrinks 80 miles each hour', pieces: [{ n: 1, kind: 'part', label: '80 mi' }, { n: 1, kind: 'part', label: '80 mi' }, { n: 0.5, kind: 'add', label: '40 mi' }], total: 2.5 },
        { title: 'Hours until they meet', pieces: [{ n: 2.5, kind: 'key', key: true, label: 'meet at 2.5 hours', choice: '2.5 hr' }] }
      ],
      ghosts: [{ at: 2, row: 0, label: '2: needs 100 mph', choice: '2 hr' }, { at: 4, row: 1, label: '4: fast car alone', choice: '4 hr' }, { at: 5, row: 1, label: '5: speeds averaged', choice: '5 hr' }, { at: 6.67, row: 1, label: '6.67: slow car alone', choice: '6.67 hr' }],
      check: { vars: { d: 200, a: 50, b: 30 }, key: 'd/(a+b)', routes: [{ choice: '5 hr', expr: 'd/((a+b)/2)' }, { choice: '6.67 hr', expr: 'd/b' }, { choice: '4 hr', expr: 'd/a' }], noRoute: [{ choice: '2 hr' }] },
      reuse: 'qr.partwhole style bars (tools/explain/visuals/qr-work.js, batch B005), drawn in hours',
      alt: 'A bar in hours: the gap closes 80 miles in hour 1, 80 in hour 2 and the last 40 in half an hour; a dashed mark at 2 hours leaves 40 miles open. The outlined bar below ends at 2.5 hours, where the cars meet; dashed marks at 4, 5 and 6.67 hours show the other traps.',
      caption: 'Each hour both cars close the gap together. Two full hours and a half use up all 200 miles.'
    },
    demoPick: '5 hr',
    flags: [
      { kind: 'stem-style', text: 'Fragment "One at 50 mph, the other 30 mph." and "When do they meet?" asks for a time of day while every choice is a duration. Suggested wording for Thomas to review (not applied): "One drives at 50 mph and the other at 30 mph. After how many hours do they meet?" Key unchanged.' },
      { kind: 'bank-copy', text: 'The bank why shouts COMBINED in capitals, and its trap note on 2 hr ("used 200/100 instead of 200/80") names no reason; the explainer calls it a slip with no clean route.' }
    ]
  },
  {
    qid: 'fm:generated:qr-average-speed#y5q2s1',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.word-problems.rates',
    difficulty: band(2),
    source: src('generated:qr-average-speed#y5q2s1', 28),
    keyText: '60 mph',
    answer: { line: '360 miles in 3.6 + 2.4 = 6 hours is 60 mph. The slow leg takes longer, so it pulls the average down.' },
    steps: [
      'Name the rule: average speed is total distance over total time, not the average of the two speeds.',
      'Time each leg: 180 / 50 = 3.6 hours out, and 180 / 75 = 2.4 hours back.',
      'Whole trip: 360 miles in 6 hours. 360 / 6 = 60 mph.',
      'Check it: more hours at 50 mph than at 75, so the answer sits below the midpoint of 62.5.'
    ],
    choices: [
      { text: '68.8 mph', role: 'trap', family: 'miscount', trap: 'No clean route', note: 'No standard slip lands on 68.8. It sits above the midpoint, but the slow leg\'s extra hours pull the average below 62.5.' },
      { text: '61.2 mph', role: 'trap', family: 'other-question', trap: 'Geometric mean', note: '61.2 is the root of 50 x 75, the geometric mean of the speeds. Average speed is total distance over total time.' },
      { text: '30 mph', role: 'trap', family: 'half-right', trap: 'One-way distance', note: '30 uses the right total time, 6 hours, but only one leg of distance, 180 miles. The trip is 360 miles.' },
      { text: '62.5 mph', role: 'trap', family: 'assumed-equal', trap: 'Plain average', note: '62.5 averages 50 and 75 as if the driver spent equal time at each. The 50 mph leg takes longer, so it counts more.' },
      { text: '60 mph', role: 'key', note: '360 miles in 6 hours.' }
    ],
    lockIt: 'Average speed is total distance over total time. Equal distances give the slower speed more weight.',
    hook: null,
    playWith: qre('harm', 'Harmonic Mean: set the out and back rates to 50 and 75 and compare the plain average bar with the true average rate', { a: 50, b: 75 }, ['qrharm-bh-', 'qrharm-bm-'], 'its two rate sliders need a state reader'),
    video: { slot: 'qr.word-problems.rates', title: 'Rates: watch the gap', id: null, start: null },
    visual: {
      type: 'stack',
      focus: 'total-time',
      panels: [
        {
          type: 'qr.partwhole', style: 'bars',
          rows: [{ title: 'The 6 hours of driving', pieces: [{ n: 3.6, kind: 'part', label: '3.6 h out at 50' }, { n: 2.4, kind: 'add', label: '2.4 h back at 75' }], total: 6 }],
          ghosts: [{ at: 3, row: 0, label: 'equal time, 3 h each, gives 62.5' }],
          check: { vars: { d: 180, a: 50, b: 75 }, key: '2*d/(d/a+d/b)', routes: [{ choice: '61.2 mph', expr: 'sqrt(a*b)' }, { choice: '30 mph', expr: 'd/(d/a+d/b)' }, { choice: '62.5 mph', expr: '(a+b)/2' }], noRoute: [{ choice: '68.8 mph' }] }
        },
        {
          type: 'qr.work',
          rows: { rows: [
            { label: 'Out: 180 miles at 50 mph', value: '3.6 h' },
            { label: 'Back: 180 miles at 75 mph', value: '2.4 h' },
            { label: 'Whole trip: 360 miles in 6 h', value: '60 mph', key: true, choice: '60 mph' },
            { label: 'Plain average of 50 and 75', note: 'assumes equal time at each speed', value: '62.5 mph', trap: true, choice: '62.5 mph' }
          ] },
          check: { vars: { d: 180, a: 50, b: 75 }, key: '2*d/(d/a+d/b)', routes: [{ choice: '61.2 mph', expr: 'sqrt(a*b)' }, { choice: '30 mph', expr: 'd/(d/a+d/b)' }, { choice: '62.5 mph', expr: '(a+b)/2' }], noRoute: [{ choice: '68.8 mph' }] }
        }
      ],
      reuse: 'qr.partwhole style bars and the qr.work rows block (tools/explain/visuals/qr-work.js, batch B005)',
      alt: 'A bar of the 6 hours of driving: 3.6 hours out at 50 mph and 2.4 hours back at 75, with a dashed mark at 3 hours where equal time would sit. A ledger below: out 3.6 h, back 2.4 h, whole trip 360 miles in 6 h is 60 mph, outlined; the plain average, 62.5, assumes equal time.',
      caption: 'The bar is longer on the 50 mph side: more time at 50 drags the average down to 60.'
    },
    demoPick: '62.5 mph',
    flags: [
      { kind: 'note', text: 'Weak distractors: 68.8 mph has no route the expert or the bank could find; 61.2 mph is the geometric mean, a true number but a rare student route.' },
      { kind: 'bank-copy', text: 'The bank trap on 68.8 is "Estimate slip" with no route, and the note on 62.5 shouts TIME in capitals. The 61.2 note (geometric mean) is true.' },
      { kind: 'play-target', text: 'The Harmonic Mean view labels its plain-average bar with the word "wrong" (Naive average (a+b)/2, wrong). The explainer links to it; Thomas may want that label reworded to house style.' }
    ]
  },
  {
    qid: 'fm:qr-a:wor1397',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.word-problems.work',
    difficulty: band(3),
    source: src('qr-a:wor1397', 38),
    keyText: '2.22',
    answer: { line: 'Rates add: 1/5 + 1/4 = 9/20 of the stack per hour, so the whole stack takes 20/9, about 2.22 hours.' },
    steps: [
      'Turn each time into a rate. Picture a stack of 20 forms: one student enters 4 an hour, the other 5.',
      'Rates add, times do not. Together they enter 4 + 5 = 9 forms an hour.',
      'Two hours clear 18 forms, and the last 2 take 2/9 of an hour. Total: 20/9, about 2.22 hours.',
      'Check it: together has to beat the faster student alone, 4 hours. 2.22 does.'
    ],
    choices: [
      { text: '0.45', role: 'trap', family: 'one-step-short', trap: 'Stopped at the rate', note: '0.45 is the combined rate, 9/20 of the stack per hour. Flip it to get the hours: 20/9.' },
      { text: '2.22', role: 'key', note: '20 forms at 9 an hour.' },
      { text: '4', role: 'trap', family: 'other-conditions', trap: 'One worker alone', note: '4 hours is the faster student working alone. A helper has to shorten the job.' },
      { text: '4.5', role: 'trap', family: 'operation-flip', trap: 'Averaged the times', note: '4.5 averages the two times. Two people working together finish faster than either one alone.' },
      { text: '9', role: 'trap', family: 'operation-flip', trap: 'Added the times', note: '5 + 4 = 9 adds the times, as if each entered a whole stack in turn. Rates add; times do not.' }
    ],
    lockIt: 'Working together: add the rates, then flip. Together always beats the faster worker alone.',
    hook: null,
    playWith: qre('work-rate', 'Work / Rate Setups: set the two solo times to 5 and 4 hours and watch the combined bar', { tA: 5, tB: 4 }, ['qrwb-vtA-', 'qrwb-vtB-'], 'its two sliders need a state reader'),
    video: { slot: 'qr.word-problems.work', title: 'Work together: rates add', id: null, start: null },
    visual: {
      type: 'qr.partwhole', style: 'bars',
      focus: 'together',
      rows: [
        { title: 'Hours: 20 forms, 9 entered each hour', pieces: [{ n: 1, kind: 'part', label: '9 forms' }, { n: 1, kind: 'part', label: '9 forms' }, { n: 0.2222222, kind: 'add', label: '2 forms' }] },
        { title: 'Hours to clear the stack together', pieces: [{ n: 2.2222222, kind: 'key', key: true, label: '2.22 hours', choice: '2.22' }] }
      ],
      ghosts: [{ at: 4, row: 1, label: 'faster alone: 4', choice: '4' }, { at: 4.5, row: 1, label: 'averaged: 4.5', choice: '4.5' }],
      check: { vars: { a: 5, b: 4 }, key: '1/(1/a+1/b)', routes: [{ choice: '0.45', expr: '1/a+1/b' }, { choice: '4', expr: 'b' }, { choice: '4.5', expr: '(a+b)/2' }, { choice: '9', expr: 'a+b' }] },
      reuse: 'qr.partwhole style bars (tools/explain/visuals/qr-work.js, batch B005), drawn in hours',
      alt: 'A bar in hours: 9 of 20 forms entered in hour 1, 9 more in hour 2, and the last 2 in 2/9 of an hour. The outlined bar below ends at 2.22 hours; dashed marks at 4 and 4.5 hours show the faster student alone and the averaged times.',
      caption: 'Together they clear 9 forms an hour, so the bar stops at 2.22 hours, well before the faster student\'s 4.'
    },
    demoPick: '4.5',
    flags: [
      { kind: 'note', text: 'The 20-form stack is the explainer\'s own friendly number (5 and 4 both divide 20); the stem never sizes the stack, and the answer does not depend on it.' }
    ]
  }
];

// Fixes from the expert review of B006 (coach record only). The family
// operation-flip keeps its id, missType and definition; its display name, the
// tag printed beside every operation-flip trap card, is now "Flipped the
// operation" (scripts/explainers/families.js and explainer-standard.md 3.1).
// "Added instead of subtracted" was untrue beside the labels below.
const RENAME = (label) => 'Review fix: the operation-flip tag beside "' + label + '" now reads "Flipped the operation" (families.js and standard 3.1; was "Added instead of subtracted", untrue for this route). Card text unchanged';
// Round 2 (the re-review): one block, men1234's step count, and six optional
// notes; each entry below that starts "Re-review" is from that round.
const RUNNERS = (n, r, ways) => 'Re-review suggestion taken: the ' + (n * r) + ' card ("Runners times places") is family other-question (was miscount, which is defined as a count with no single rule, while the note names one: ' + n + ' x ' + r + '). The note now says what ' + (n * r) + ' does count, ' + ways + ', ' + n + ' x ' + r + ', which is true; label and check route unchanged';
const CHANGES = {
  'fm:qr-a:cou1579': [RENAME('Added the counts'), RUNNERS(10, 3, 'the ways to put one runner in one place')],
  'fm:generated:qr-perm-vs-comb#y9j3s6': [RUNNERS(7, 3, 'the ways to give one runner one award')],
  'fm:qr-a:zsc1638': ['Re-review suggestion taken: the gap bracket on the bell (tools/explain/visuals/qr-plot.js, normal()) sits low in the shading, under the curve at every point, and is labeled with the gap, 23 (it was unlabeled and drawn near the top, where it crossed the bell like a stray line)'],
  'fm:qr-a:men1234': [
    'Re-review fix: a third step checks the size (each leg a little over 20 km, so the round trip is a little over 40 and under 50; 46 fits). It was the only G1 sidecar with fewer than 3 steps',
    'Re-review suggestion taken: the 56 note says "a phantom carry" (was "a carrying slip", which the next sentence contradicted: 23 + 23 needs no carry)'
  ],
  'fm:qr-a:pc3c': [RENAME('Subtracted the rates')],
  'fm:generated:qr-unit-rate-conversion#ejj15': [
    RENAME('Multiplied by 3.6'),
    'Review suggestion taken: the caption says each trap is a rung someone stopped at, skipped or turned over (0.03 skips the x 1000 rung); the alt names what each side note does'
  ],
  'fm:qr-a:uni1479': [
    RENAME('Divided by 60') + '; the same for "Added the 60"',
    'Review fix: the 63.4 note says a conversion factor multiplies or divides and never adds (was "Changing units ... never adds", untrue for Celsius to kelvin or Fahrenheit)'
  ],
  'fm:qr-a:ds1700': [RENAME('Added rise and run')],
  'fm:written:qr-11-rn4znq': ['Review fix: the -0.72 note says 1 - 0.28 subtracts the size of cos, not its square (was "subtracts cos", but cos is -0.28 here, and 1 - (-0.28) = 1.28)'],
  'fm:qr-a:dsm5': ['Review suggestion taken: the contrast row tag reads "variance 2 (average squared gap)" (was "spread out: variance 2"; the longer "spread out: variance 2 (average squared gap)" ran past the left edge of the panel at 390 px), and the alt says the same, so a student taught the n - 1 formula (2.67) sees which variance is meant'],
  'fm:qr-a:mix1419': [
    RENAME('Subtracted the strengths'),
    'Review suggestion taken: the sugar is counted in grams (a sugar percent is grams per 100 mL): answer line, step 1, the key and 35 notes, the alt, and the picture (new optional soluteUnit on qr.tree kind mix: "25 g", "35 g in 200 mL"). The bank why says mL; it is not edited'
  ],
  'fm:qr-a:rt3': [
    RENAME('Averaged the speeds'),
    'Review suggestion taken: the half-hour piece in the top bar reads "40 mi" like the two "80 mi" pieces (was "40")',
    'Re-review suggestion taken: the 2 hr ghost sits on the top bar, at the end of hour 2 where 40 miles are still open (was on the bottom bar, where the tag layout put the 4 hr tag across the 5 hr leader, so two dashed lines hung from one tag); the 4, 5 and 6.67 ghosts stay on the bottom bar, each leader under its own tag. The alt says so'
  ],
  'fm:qr-a:wor1397': [
    RENAME('Added the times'),
    'Review fix: the 9 note says adding the times is as if each entered a whole stack in turn (was "as if one waited for the other", which on one shared stack does not give 9 hours)',
    'Re-review suggestion taken: the 4.5 card ("Averaged the times") is family operation-flip (was assumed-equal), like rt3\'s 5 hr card ("Averaged the speeds"): an average used where the rates must add. assumed-equal stays on the weighting traps, mix1417 7.5 and y5q2s1 62.5, which treat unequal amounts as equal',
    'Re-review suggestion taken: the last piece of the top bar reads "2 forms" (was "2"), like rt3\'s "40 mi"'
  ]
};

module.exports = { group: 'G1', batch: 'B006', title: 'Full-Length Test 1, Quantitative Reasoning, second half (20 items)', entries: ENTRIES, changes: CHANGES };
