// content/explainers-src/G1/B003.js: batch B003, Full-Length Test 1 General
// Chemistry (30 items, Natural Sciences questions 41 to 70: equilibrium,
// free energy, gases, kinetics, acid-base, bonding, phases and solutions,
// electrochemistry, thermochemistry, the mole, atomic structure, sig figs).
// Written in Thomas's coaching voice
// (docs/release-2026-10-30/questions/voice-codex.md) from the independent
// expert's blind solve (docs/explainers/solves/B003.json: 30 of 30 keys agree,
// no key or picture disputes).
//
// Authoring source, never published: /content/explainers-src/* is
// force-redirected like /docs/*. The build (scripts/explainers/build.mjs)
// checks every entry against tools/mock/data/full-mocks.js (key text, every
// choice text, stem hash), runs the copy rules, and recomputes every picture
// with tools/explain/visuals/compute-gc.js: the key and every trap route a
// note claims (verify blocks), conversion chains link by link, gas states and
// mixtures from PV = nRT, the CO2 phase region, the Gibbs crossover, half-lives,
// Nernst and log K, level ladders, ion electron counts, formula masses, sig
// figs and Lewis domain counts.
//
// Visuals (production-plan.md, G1 row B003: chem.ledger 8, chem.ledger:ice 3,
// chem.gas 4, chem.curve:ph 4, chem.curve:rate 2, chem.energy 3, chem.lewis 3,
// chem.cell 2, chem.orbital 1). Five items take a different type from the same
// row because the row's type cannot show the idea: the Gibbs crossover is a
// dG-against-T line (chem.curve gibbs, not an energy hump); the CO2 phase
// question gets the phase diagram itself (chem.curve phase, not a ledger); the
// E-to-K item is a ruler pairing volts with powers of ten (chem.cell e-to-k);
// the blood-buffer item is the equilibrium chain pushed by losing CO2
// (chem.ledger shift, not a pH curve); and HF against HCl is two molecule pairs
// and the force between them (chem.ledger imf, not one Lewis structure).
// Renderers: tools/explain/visuals/chem-gc.js, plus the Lewis and curve
// dispatch in chem.js.
'use strict';

const FM = 'tools/mock/data/full-mocks.js';
const src = (id, n) => ({ bank: FM, global: 'ACE_FULL_MOCKS', locator: { mock: 'FULL_1', section: 'gc', id }, servedAs: 'Full-Length Test 1, Natural Sciences, question ' + n });
const band = (d) => ({ band: d, from: 'bank field d (1-3)' });
// Play with it: a module of the Gen Chem hub. The anchor scrolls the hub to the
// module and its live picture (checked in Chromium for every anchor used here).
const HUB = 'tools/gc/index.html';
const hub = (anchor, label, expect, more) => ({
  label, href: HUB + '#' + anchor, state: { module: anchor }, expect,
  routing: 'Works today: the anchor scrolls the Gen Chem hub to this module and its live picture. ' + (more ? more + ' ' : '') + 'The hub also carries a clock, correct counts and streak badges in its drill, test and sidebar views; the anchor lands on the module, not on those.'
});
const GAS = (label) => hub('tool-gas', label, ['id="tool-gas"', 'gasSolveFor']);

const ENTRIES = [
  /* ===================== Balance and the push-back ===================== */
  {
    qid: 'fm:gchem-b:GC_ek-h1',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.equilibrium.kp-kc',
    difficulty: band(3),
    source: src('gchem-b:GC_ek-h1', 53),
    keyText: '0.19',
    answer: { line: 'Gas moles drop from 2 to 1, so dn = -1 and you divide K_c by RT. 4.7 over about 24.5 is 0.19.' },
    steps: [
      'Count gas moles first. Two NO2 on the left, one N2O4 on the right: dn = 1 - 2 = -1.',
      'Know what dn = -1 does. K_p = K_c x (RT)^-1, so you divide by RT once. Fewer gas moles on the product side puts K_p below K_c.',
      'Estimate RT: 0.0821 x 298 is about 24.5. Then 4.7 / 24.5 is a little under 0.2: 0.19.'
    ],
    choices: [
      { text: '0.0085', role: 'trap', family: 'miscount', trap: 'Divided too far', note: 'Dividing by RT twice gives about 0.008, near this choice, but no single rule lands on 0.0085. dn = -1 means one division, not two.' },
      { text: '0.19', role: 'key', note: 'One division by RT for one mole of gas lost.' },
      { text: '4.7', role: 'trap', family: 'assumed-equal', trap: 'K_p taken as K_c', note: 'K_p equals K_c only when dn = 0. Here the gas moles drop by one, so the RT factor is real.' },
      { text: '41', role: 'trap', family: 'miscount', trap: 'No single rule', note: 'No one slip turns 4.7 into 41. It sits above K_c, and losing gas moles means K_p has to land below K_c.' },
      { text: '115', role: 'trap', family: 'sign-slip', trap: 'Multiplied by RT', note: '4.7 x 24.5 = 115 is what dn = +1 would give. The minus sign on dn means divide by RT.' }
    ],
    lockIt: 'K_p = K_c (RT)^dn. Fewer gas moles on the product side puts K_p below K_c.',
    hook: null,
    playWith: hub('eq-kc', 'Kc / Kp module: slide Q against K and watch which way the reaction shifts', ['id="eq-kc"', "visualType:'qk-bars'"], 'The module has a Q-against-K slider; there is no K_c to K_p converter yet (tool-gap flag).'),
    video: { slot: 'gc.equilibrium.kp-kc', title: 'K_p and K_c: count the gas moles', id: null, start: null },
    visual: {
      type: 'chem.ledger',
      focus: 'kp-below-kc',
      tokens: { left: [{ f: 'NO2', n: 2 }], right: [{ f: 'N2O4', n: 1 }], leftLabel: '2 mol gas', rightLabel: '1 mol gas', note: 'dn = 1 - 2 = -1' },
      rows: { title: 'K_p from K_c', rows: [
        { label: 'dn = -1, so K_p = K_c x (RT)^-1', value: 'divide by RT' },
        { label: 'RT = 0.0821 x 298', value: 'about 24.5' },
        { label: 'K_p = 4.7 / 24.5', value: '0.19', key: true }
      ] },
      scale: { log: true, min: 0.005, max: 200, title: 'Every choice on one line (log scale)', ticks: [{ v: 0.01, label: '0.01' }, { v: 0.1, label: '0.1' }, { v: 1, label: '1' }, { v: 10, label: '10' }, { v: 100, label: '100' }], marks: [
        { v: 0.0085, label: '0.0085', choice: '0.0085' },
        { v: 0.19, label: 'K_p = 0.19', choice: '0.19', key: true },
        { v: 4.7, label: 'K_c = 4.7', choice: '4.7', ref: true },
        { v: 41, label: '41', choice: '41' },
        { v: 115, label: '115', choice: '115' }
      ], axisLabel: 'losing gas moles: K_p lands left of K_c' },
      verify: { vars: { Kc: 4.7, R: 0.0821, T: 298 }, key: 'Kc / (R*T)', routes: [{ choice: '115', expr: 'Kc*R*T' }, { choice: '4.7', expr: 'Kc' }], noRoute: [{ choice: '0.0085' }, { choice: '41' }] },
      reuse: 'new: chem.ledger blocks in tools/explain/visuals/chem-gc.js (tokens, rows, scale); the build recomputes K_p and the two routed traps',
      alt: 'Two NO2 particles on the left and one N2O4 on the right, so gas moles drop by one. A ledger divides Kc by RT, about 24.5, to get Kp = 0.19, outlined. A log number line places every choice, with 0.19 left of Kc = 4.7.',
      caption: 'Count the particles first. One mole of gas lost means Kp lands left of Kc on the line.'
    },
    demoPick: '115',
    flags: [
      { kind: 'stem-style', text: 'The stem prints K_c and K_p with underscores (the player typesets them) and hands over the formula and dn = -1, so the item tests arithmetic more than the idea. Suggested wording for Thomas to review (not applied): "For 2 NO2(g) <=> N2O4(g) at 298 K, Kc = 4.7. What is Kp?" Key unchanged.' },
      { kind: 'note', text: 'Concept-first rule: dividing by 0.0821 x 298 is calculator work in a no-calculator section, and 0.0085 and 41 have no single-slip route (the notes say so). A lighter variant asks whether Kp is above or below Kc, or gives RT as about 25. Key unchanged.' },
      { kind: 'bank-copy', text: 'The stem value Kc = 4.7 M^-1 is a made-up number (the measured dimerization constant at 298 K is about 200 M^-1). Fine as an exercise; the explainer never calls it the real value.' },
      { kind: 'tool-gap', text: 'The Kc / Kp module has a Q-against-K slider but no Kc to Kp converter. A dn and RT slider would make this the exact play-with state.' }
    ]
  },
  {
    qid: 'fm:gchem-b:GC_ek-e7',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.equilibrium.k-manipulation',
    difficulty: band(3),
    source: src('gchem-b:GC_ek-e7', 64),
    keyText: 'K_1^2 = 25',
    answer: { line: 'Coefficients become exponents in K. Double every coefficient and every exponent doubles, so K is squared: 5.0^2 = 25.' },
    steps: [
      'Write K_1 first: K_1 = [B] / [A]. Each coefficient becomes an exponent.',
      'Double the equation and the exponents double: K_2 = [B]^2 / [A]^2 = (K_1)^2.',
      'Square it: 5.0^2 = 25. Same chemistry, same mixture; only the way you wrote the equation changed K.'
    ],
    choices: [
      { text: 'K_1^2 = 25', role: 'key', note: 'Twice the coefficients, twice the exponents: (5.0)^2 = 25.' },
      { text: '1/K_1 = 0.20', role: 'trap', family: 'other-conditions', trap: 'Reversed the reaction', note: '1/K is the move for writing the reaction backward, B to A. This one still runs A to B, with doubled coefficients.' },
      { text: 'K_1/2 = 2.5', role: 'trap', family: 'operation-flip', trap: 'Divided by 2', note: 'Halving K treats the 2 as a divisor. Coefficients become exponents, so the 2 lands as a power.' },
      { text: 'K_1 = 5.0', role: 'trap', family: 'assumed-equal', trap: 'Treated K as fixed', note: 'K depends on how the equation is written. The same mixture gives a new number once every exponent doubles.' },
      { text: '2K_1 = 10', role: 'trap', family: 'operation-flip', trap: 'Multiplied by 2', note: '5 x 2 = 10 treats the power as a factor. Doubling the exponents squares K; it does not double it.' }
    ],
    lockIt: 'Reverse a reaction: 1/K. Multiply its coefficients by n: K^n. Add two reactions: multiply their K values.',
    hook: null,
    playWith: hub('tool-ice', 'ICE Table Calculator: double every coefficient, halve x so the concentrations match, and watch Kc square', ['id="tool-ice"', 'icecCalc']),
    video: { slot: 'gc.equilibrium.k-manipulation', title: 'Rewriting an equation: what happens to K', id: null, start: null },
    visual: {
      type: 'chem.ledger',
      focus: 'multiply-by-n',
      rows: { title: 'Same mixture, two ways to write it', rows: [
        { label: 'A <=> B', value: 'K_1 = [B]/[A] = 5.0' },
        { label: '2A <=> 2B', value: 'K_2 = [B]^2/[A]^2' },
        { label: 'So K_2 = (K_1)^2 = 5.0^2', value: '25', sum: true }
      ] },
      rules: { title: 'Three rewrites and what each does to K', rows: [
        { when: 'Reverse it: B to A', then: '1/K', tag: '1/K_1 = 0.20 answers this move, not this item', trap: true, choice: '1/K_1 = 0.20' },
        { when: 'Multiply every coefficient by n', then: 'K^n', tag: 'Here n = 2: K_2 = (5.0)^2 = 25', key: true, choice: 'K_1^2 = 25' },
        { when: 'Add two reactions', then: 'K_1 x K_2', tag: 'Not used here' }
      ] },
      verify: { vars: { K1: 5.0 }, key: 'K1^2', routes: [{ choice: '1/K_1 = 0.20', expr: '1/K1' }, { choice: 'K_1/2 = 2.5', expr: 'K1/2' }, { choice: 'K_1 = 5.0', expr: 'K1' }, { choice: '2K_1 = 10', expr: '2*K1' }] },
      reuse: 'new: chem.ledger rows and rules blocks (tools/explain/visuals/chem-gc.js)',
      alt: 'A ledger writes K1 = [B]/[A] = 5.0, then the doubled equation, where both exponents become 2, so K2 = K1 squared = 25. Below, three rewrites and their effect on K: reverse gives 1/K, multiply coefficients by n gives K to the n, outlined with n = 2, and adding reactions multiplies the K values.',
      caption: 'Find the rewrite that matches the change. Doubling coefficients is the K-to-the-n row, so square K.'
    },
    demoPick: '2K_1 = 10',
    flags: [
      { kind: 'stem-style', text: 'The stem and choices print K_1 and K_2 with underscores (the player typesets them as subscripts). No rewording asked.' },
      { kind: 'bank-copy', text: 'The bank explanation says doubling K "is the most common error"; there is no data behind the claim, and this explainer does not repeat it. Bank text untouched, key unchanged.' }
    ]
  },
  {
    qid: 'fm:gchem-b:GC_ks-e2',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.equilibrium.ksp',
    difficulty: band(2),
    source: src('gchem-b:GC_ks-e2', 69),
    keyText: '7.0x10^(-3) M',
    answer: { line: 'One Ca^2+ and one SO4^2- per formula unit, so Ksp = s^2. The root of 4.9 x 10^-5 is 7.0 x 10^-3 M.' },
    steps: [
      'Write the ICE row for the ions. Each CaSO4 that dissolves adds one Ca^2+ and one SO4^2-, so both sit at s.',
      'Set up Ksp: [Ca^2+][SO4^2-] = s x s = s^2. Solubility is the square root of Ksp.',
      'Make the root easy. 4.9 x 10^-5 = 49 x 10^-6, and its root is 7 x 10^-3 M.'
    ],
    choices: [
      { text: '2.4x10^(-5) M', role: 'trap', family: 'operation-flip', trap: 'Halved instead of rooted', note: 'Halving Ksp gives about 2.4 x 10^-5. Ksp = s^2 calls for a square root, not a division by 2.' },
      { text: '4.9x10^(-5) M', role: 'trap', family: 'one-step-short', trap: 'Stopped at Ksp', note: 'That is Ksp itself. Ksp is s squared, so one square root is still owed.' },
      { text: '1.4x10^(-2) M', role: 'trap', family: 'other-unit', trap: 'Counted both ions', note: 'This is 2s, counting both ions. Molar solubility counts formula units dissolved, and each makes one of each ion.' },
      { text: '2.4x10^(-3) M', role: 'trap', family: 'miscount', trap: 'No single rule', note: 'No one slip produces this; it looks like the halved Ksp with its power of ten moved. The whole move is one square root.' },
      { text: '7.0x10^(-3) M', role: 'key', note: 'The square root of 49 x 10^-6 is 7 x 10^-3 M.' }
    ],
    lockIt: 'For a 1:1 salt, Ksp = s^2, so the molar solubility is the square root of Ksp.',
    hook: 'Make the exponent even, then take the root.',
    playWith: hub('ksp', 'Solubility (Ksp) module: pick a salt and slide the ion concentration past saturation', ["visualType:'ksp-bar'", 'kspConc']),
    video: { slot: 'gc.equilibrium.ksp', title: 'Ksp and molar solubility', id: null, start: null },
    visual: {
      type: 'chem.ledger',
      focus: 'equilibrium-row',
      ice: { rxn: 'CaSO4(s) <=> Ca^2+ + SO4^2-', cols: ['CaSO4(s)', 'Ca^2+', 'SO4^2-'], rows: { I: ['solid', '0', '0'], C: ['- s', '+ s', '+ s'], E: ['solid', 's', 's'] }, keyCells: [['E', 1], ['E', 2]] },
      rows: { rows: [
        { label: 'Ksp = [Ca^2+][SO4^2-]', value: 's x s = s^2' },
        { label: 'Ksp = 4.9 x 10^-5', value: '= 49 x 10^-6' },
        { label: 's = root of 49 x 10^-6', value: '7.0 x 10^-3 M', key: true, choice: '7.0x10^(-3) M' }
      ] },
      verify: { vars: { Ksp: 4.9e-5 }, key: 'sqrt(Ksp)', routes: [{ choice: '4.9x10^(-5) M', expr: 'Ksp' }, { choice: '1.4x10^(-2) M', expr: '2*sqrt(Ksp)' }, { choice: '2.4x10^(-5) M', expr: 'Ksp/2' }], noRoute: [{ choice: '2.4x10^(-3) M' }] },
      reuse: 'new: chem.ledger ice and rows blocks (tools/explain/visuals/chem-gc.js)',
      alt: 'An ICE table for calcium sulfate dissolving: the solid stays, and both ions rise from 0 to s, outlined in the equilibrium row. A ledger sets Ksp = s times s = s squared, rewrites 4.9 x 10 to the -5 as 49 x 10 to the -6, and outlines s = 7.0 x 10 to the -3 M.',
      caption: 'Read the Equilibrium row: both ions are s. So Ksp is s squared, and s is its root.'
    },
    demoPick: '4.9x10^(-5) M',
    flags: [
      { kind: 'stem-style', text: 'The stem states [Ca2+] = [SO4 2-] = s and Ksp = s^2, the step the item should test. Suggested wording for Thomas to review (not applied): end the stem after "with Ksp = 4.9 x 10^-5. What is the molar solubility of CaSO4?" Key unchanged.' },
      { kind: 'note', text: 'Concept-first rule: 2.4x10^(-3) M has no single-slip route (the note says so). A rewrite candidate drawn from a real misconception, such as the cube-root habit for a 1:2 salt; key unchanged.' }
    ]
  },

  /* ================== Downhill: entropy and free energy ================== */
  {
    qid: 'fm:gchem-b:GC_gb-q1',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.thermo.gibbs',
    difficulty: band(3),
    source: src('gchem-b:GC_gb-q1', 70),
    keyText: 'Below 800 K',
    answer: { line: 'Both dH and dS are negative: the enthalpy helps, the entropy fights harder as T rises. dG crosses zero at 800 K.' },
    steps: [
      'Read the signs first. dH < 0 helps the reaction; dS < 0 fights it, and the -T dS penalty grows with temperature.',
      'So it runs cold and stops hot. Find the switch: set dG = 0, so T = dH / dS.',
      'Match the units, then divide: -120,000 J over -150 J/K is 800 K. Below 800 K, dG is negative.'
    ],
    choices: [
      { text: 'Below 800 K', role: 'key', note: 'dG = 0 at 800 K, and below it the negative dH wins.' },
      { text: 'Below 80 K', role: 'trap', family: 'unit-slip', trap: 'Power of ten off', note: 'The direction is right, but the crossover is off by a factor of ten. 120,000 J over 150 J/K is 800 K.' },
      { text: 'Spontaneous at all T', role: 'trap', family: 'one-step-short', trap: 'Read only dH', note: 'All temperatures needs dH < 0 and dS > 0. Here dS is negative, so at high T the -T dS term wins.' },
      { text: 'Below 120 K', role: 'trap', family: 'other-question', trap: 'Used the dH number', note: '120 is the size of dH in kJ, not a temperature. The crossover is dH divided by dS.' },
      { text: 'Above 800 K only', role: 'trap', family: 'reversed', trap: 'Flipped the side', note: 'With dS < 0, heating makes dG more positive. High T is where the reaction stops, so the range is below 800 K.' }
    ],
    lockIt: 'dH and dS both negative: spontaneous below T = dH / dS. Both positive: spontaneous above it.',
    hook: null,
    playWith: hub('gibbs', 'Gibbs module: set dH and dS both negative, slide T, and watch dG change sign', ["visualType:'gibbs-quadrant'", 'gibbsUpdate']),
    video: { slot: 'gc.thermo.gibbs', title: 'Free energy: the crossover temperature', id: null, start: null },
    visual: {
      type: 'chem.curve',
      kind: 'gibbs',
      focus: 'below-crossover',
      dH: -120, dS: -150, Tmax: 1200,
      xTicks: [0, 400, 800, 1200], yTicks: [-120, -80, -40, 0, 40],
      belowLabel: 'dG < 0: runs', aboveLabel: 'dG > 0: stops', crossLabel: 'dG = 0 at 800 K',
      rangeLabel: 'Below 800 K', otherRangeLabel: 'Above 800 K',
      range: { choice: 'Below 800 K', key: true }, other: { choice: 'Above 800 K only' },
      verify: { vars: { dH: -120000, dS: -150 }, key: 'dH / dS', routes: [{ choice: 'Below 120 K', expr: 'abs(dH)/1000' }, { choice: 'Below 80 K', expr: 'dH/dS/10' }] },
      reuse: 'new: chem.curve kind gibbs (tools/explain/visuals/chem-gc.js); the line is dG = dH - T dS from the stem values, and the build recomputes the crossover',
      alt: 'A line plot of dG against temperature for dH = -120 kJ and dS = -150 J/K. The line starts at -120 kJ, rises, and crosses zero at 800 K, marked; the shaded part below zero is the spontaneous range, outlined under the axis as Below 800 K.',
      caption: 'Follow the line up: it crosses zero at 800 K. Everything left of the crossing is the spontaneous side.'
    },
    demoPick: 'Above 800 K only',
    flags: [
      { kind: 'stem-style', text: 'The stem states the spontaneity rule and tells the student to set dG = 0, which hands over the method. Suggested wording for Thomas to review (not applied): "A reaction has dH = -120 kJ/mol and dS = -150 J/(mol K). Over what temperature range is it spontaneous?" Key unchanged.' }
    ]
  },

  /* =============================== Gases =============================== */
  {
    qid: 'fm:generated:gc-combined-gas#1gsc28u',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.gases.combined-gas-law',
    difficulty: band(2),
    source: src('generated:gc-combined-gas#1gsc28u', 54),
    keyText: '1.13 L',
    answer: { line: 'Four times the pressure shrinks the gas to 1/4; cooling to 300 K shrinks it to 3/4 more. 6 x 3/16 = 1.13 L.' },
    steps: [
      'Convert to kelvin first: 127 degrees C is 400 K and 27 degrees C is 300 K. Gas laws only work in kelvin.',
      'Push one change at a time. Pressure goes up 4 times, so the volume falls to 1/4.',
      'Then the temperature falls from 400 K to 300 K, so the volume falls to 3/4 again. 6 L x 1/4 x 3/4 = 1.125 L, about 1.13 L.'
    ],
    choices: [
      { text: '1.13 L', role: 'key', note: 'Both changes shrink the gas: 6 x 1/4 x 3/4.' },
      { text: '2 L', role: 'trap', family: 'reversed', trap: 'Temperature ratio flipped', note: 'This uses 400/300, as if cooling made the gas expand. Colder gas takes less room, so the factor is 3/4.' },
      { text: '18 L', role: 'trap', family: 'reversed', trap: 'Pressure ratio flipped', note: 'This multiplies by 4 instead of dividing. Squeezing a gas harder makes it smaller.' },
      { text: '0.319 L', role: 'trap', family: 'unit-slip', trap: 'Used Celsius', note: '6 x 1/4 x 27/127 is about 0.319. A Celsius ratio means nothing to a gas; convert both temperatures to kelvin.' },
      { text: '1.5 L', role: 'trap', family: 'one-step-short', trap: 'Skipped the cooling', note: '6 / 4 = 1.5 handles the pressure only. The temperature also dropped, which shrinks the gas a little more.' }
    ],
    lockIt: 'Volume follows kelvin temperature and runs opposite to pressure. Apply each ratio in the direction the gas moves.',
    hook: null,
    playWith: GAS('Gas Law Slider: choose Solve for V, then raise P and lower T and watch V shrink'),
    video: { slot: 'gc.gases.combined-gas-law', title: 'The combined gas law, one change at a time', id: null, start: null },
    visual: {
      type: 'chem.gas',
      focus: 'after-volume',
      states: [
        { label: 'Before', V: 6, P: 1, T: 400, lines: ['1 atm', '400 K'], Vlabel: 'V = 6 L' },
        { label: 'After', V: 1.125, P: 4, T: 300, lines: ['4 atm', '300 K'], Vlabel: 'V = 1.13 L', key: true, choice: '1.13 L' }
      ],
      factors: [{ cause: 'P x 4', effect: 'V x 1/4' }, { cause: '400 to 300 K', effect: 'V x 3/4' }],
      verify: { vars: { V1: 6, P1: 1, P2: 4, T1: 400, T2: 300 }, key: 'V1*P1/P2*T2/T1', routes: [{ choice: '2 L', expr: 'V1*P1/P2*T1/T2' }, { choice: '18 L', expr: 'V1*P2/P1*T2/T1' }, { choice: '0.319 L', expr: 'V1*P1/P2*27/127' }, { choice: '1.5 L', expr: 'V1*P1/P2' }] },
      reuse: 'new: chem.gas cylinders (tools/explain/visuals/chem-gc.js); piston heights drawn to scale from the volumes the build recomputes',
      alt: 'Two gas cylinders drawn to scale. Before: 1 atm and 400 K, with the piston high at 6 L. After: 4 atm and 300 K, with the piston low at 1.13 L, outlined; between them, pressure times 4 shrinks the volume to 1/4 and cooling to 300 K shrinks it to 3/4.',
      caption: 'Read the middle column: each change shrinks the gas. Apply both shrinks to the 6 L.'
    },
    demoPick: '1.5 L',
    flags: []
  },
  {
    qid: 'fm:generated:gc-ideal-gas#1nvtbkr',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.gases.ideal-gas-law',
    difficulty: band(2),
    source: src('generated:gc-ideal-gas#1nvtbkr', 60),
    keyText: '246 L',
    answer: { line: 'At 500 K and 0.5 atm one mole fills 82.1 L, so three moles fill three times that: 246 L.' },
    steps: [
      'Convert first: 227 degrees C + 273 = 500 K.',
      'Find one mole\'s room: RT / P = 0.0821 x 500 / 0.5 = 82.1 L. Hot, thin gas is big.',
      'Three moles take three times the room: 3 x 82.1 = 246 L.'
    ],
    choices: [
      { text: '246 L', role: 'key', note: 'Three moles at 82.1 L each.' },
      { text: '82.1 L', role: 'trap', family: 'other-question', trap: 'One mole, not three', note: '82.1 L is the room one mole takes at these conditions. The stem has three moles.' },
      { text: '112 L', role: 'trap', family: 'unit-slip', trap: 'Used Celsius', note: '3 x 0.0821 x 227 / 0.5 is about 112. Gas laws need kelvin, 500 K here.' },
      { text: '24900 L', role: 'trap', family: 'unit-slip', trap: 'R in joules', note: 'R = 8.314 goes with joules and pascals. With liters and atm, R is 0.0821.' },
      { text: '61.6 L', role: 'trap', family: 'operation-flip', trap: 'Multiplied by P', note: 'This multiplies by 0.5 atm instead of dividing. Lower pressure lets the gas spread out, so P goes underneath.' }
    ],
    lockIt: 'V = nRT / P, with T in kelvin and R = 0.0821 for liters and atm.',
    hook: null,
    playWith: GAS('Gas Law Slider: choose Solve for V, then set n = 3, T = 500 K and P = 0.5 atm'),
    video: { slot: 'gc.gases.ideal-gas-law', title: 'PV = nRT: moles, kelvin and the right R', id: null, start: null },
    visual: {
      type: 'chem.gas',
      focus: 'three-moles',
      states: [
        { label: '3 mol of gas', V: 246.3, n: 3, P: 0.5, T: 500, parts: 3, partLabel: '1 mol: 82.1 L', lines: ['n = 3 mol', 'T = 500 K', 'P = 0.5 atm'], Vlabel: 'V = 246 L', key: true, choice: '246 L' }
      ],
      verify: { vars: { n: 3, R: 0.0821, T: 500, P: 0.5 }, key: 'n*R*T/P', routes: [{ choice: '82.1 L', expr: 'R*T/P' }, { choice: '112 L', expr: 'n*R*227/P' }, { choice: '24900 L', expr: 'n*8.314*T/P' }, { choice: '61.6 L', expr: 'n*R*T*P' }] },
      reuse: 'new: chem.gas cylinder split into moles (tools/explain/visuals/chem-gc.js); V recomputed from nRT / P by the build',
      alt: 'A cylinder of 3 moles of gas split into three equal stacked bands, each labeled 1 mol: 82.1 L. Beside it: n = 3 mol, T = 500 K, P = 0.5 atm, and the total, V = 246 L, outlined.',
      caption: 'Each band is one mole at these conditions. Count the bands: three moles, three times 82.1 L.'
    },
    demoPick: '82.1 L',
    flags: []
  },
  {
    qid: 'fm:gchem-a:gl-e12',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.gases.dalton',
    difficulty: band(2),
    source: src('gchem-a:gl-e12', 65),
    keyText: '0.25',
    answer: { line: 'A mole fraction is a gas\'s share of the total pressure: 0.5 out of 2.0 atm is 0.25.' },
    steps: [
      'Add the pressures first: 0.5 + 1.5 = 2.0 atm in total.',
      'Know Dalton\'s rule: each gas pushes in proportion to its moles, so its pressure share is its mole share.',
      'Nitrogen\'s share: 0.5 / 2.0 = 0.25. One part in four.'
    ],
    choices: [
      { text: '0.20', role: 'trap', family: 'miscount', trap: 'Total miscounted', note: 'This divides by 2.5, counting the nitrogen twice in the total. The total is 0.5 + 1.5 = 2.0 atm.' },
      { text: '0.25', role: 'key', note: '0.5 out of 2.0 atm is one part in four.' },
      { text: '0.33', role: 'trap', family: 'other-question', trap: 'N2 against O2', note: '0.5 / 1.5 compares nitrogen with oxygen. A mole fraction compares nitrogen with the whole mixture.' },
      { text: '0.50', role: 'trap', family: 'one-step-short', trap: 'Pressure, not share', note: '0.5 is nitrogen\'s partial pressure in atm. The fraction still needs it divided by the 2.0 atm total.' },
      { text: '0.75', role: 'trap', family: 'neighbor-fact', trap: 'Oxygen\'s share', note: '1.5 / 2.0 = 0.75 belongs to oxygen. Nitrogen is the smaller piece of this mixture.' }
    ],
    lockIt: 'Mole fraction = partial pressure / total pressure. Add every gas before you divide.',
    hook: null,
    playWith: hub('gas-laws', 'Gas Laws module: move the P, V, n and T sliders and watch the ideal gas law hold', ['id="gas-laws"', "visualType:'gas-slider'"], 'The module has one gas at a time; there is no mixture view yet (tool-gap flag).'),
    video: { slot: 'gc.gases.dalton', title: 'Dalton: partial pressures and mole fractions', id: null, start: null },
    visual: {
      type: 'chem.gas',
      focus: 'nitrogen-share',
      mixture: {
        gases: [
          { name: 'N2', P: 0.5, dots: 4, legend: '0.5 atm', barText: 'N2: 0.5', key: true, choice: '0.25' },
          { name: 'O2', P: 1.5, dots: 12, legend: '1.5 atm', barText: 'O2: 1.5', choice: '0.75' }
        ],
        barLabel: 'Pressure (atm)', totalLabel: 'total 2.0 atm', keyLabel: 'N2: 0.5 / 2.0 = 0.25'
      },
      verify: { vars: { pN: 0.5, pO: 1.5 }, key: 'pN/(pN+pO)', routes: [{ choice: '0.20', expr: 'pN/(pN+pN+pO)' }, { choice: '0.33', expr: 'pN/pO' }, { choice: '0.50', expr: 'pN' }, { choice: '0.75', expr: 'pO/(pN+pO)' }] },
      reuse: 'new: chem.gas mixture box and pressure bar (tools/explain/visuals/chem-gc.js); particles drawn in the mole ratio',
      alt: 'A gas box with 4 nitrogen particles and 12 oxygen particles. Below, a pressure bar splits the 2.0 atm total into nitrogen 0.5 and oxygen 1.5, and the nitrogen piece is outlined: 0.5 / 2.0 = 0.25.',
      caption: 'Look at the bar: nitrogen is one of four equal pieces of the total. That piece is its mole fraction.'
    },
    demoPick: '0.33',
    flags: [
      { kind: 'stem-style', text: 'The stem is telegraphic with no verb ("Mole fraction of N2 in mixture: 0.5 atm N2 + 1.5 atm O2?"). Suggested wording for Thomas to review (not applied): "A mixture holds N2 at 0.5 atm and O2 at 1.5 atm. What is the mole fraction of N2?" Key unchanged.' },
      { kind: 'tool-gap', text: 'The Gas Laws module handles one gas at a time. A two-gas mixture view with a split pressure bar would make this the exact play-with state.' }
    ]
  },
  {
    qid: 'fm:gchem-b:GC_lf005',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.gases.dalton',
    difficulty: band(3),
    source: src('gchem-b:GC_lf005', 66),
    keyText: '2.46 atm',
    answer: { line: 'Each gas pushes as if it had the flask alone. O2 alone: 0.500 x 0.0821 x 300 / 5.00 = 2.46 atm.' },
    steps: [
      'Use the O2 alone. Each gas in a mixture pushes as if the others were not there.',
      'Convert: 27 degrees C is 300 K. Then P = nRT / V = 0.500 x 0.0821 x 300 / 5.00.',
      'Simplify: 0.0821 x 30 = 2.46 atm. Check it: O2 is 2/3 of the moles, and 2/3 of the 3.69 atm total is 2.46.'
    ],
    choices: [
      { text: '3.69 atm', role: 'trap', family: 'other-question', trap: 'Total, not O2', note: '3.69 atm is both gases together, 0.750 mol. The stem asks for oxygen\'s share.' },
      { text: '12.3 atm', role: 'trap', family: 'one-step-short', trap: 'Forgot the volume', note: '0.500 x 0.0821 x 300 = 12.3 is nRT before dividing by the 5.00 L flask. Pressure needs the volume underneath.' },
      { text: '1.23 atm', role: 'trap', family: 'neighbor-fact', trap: 'Nitrogen\'s pressure', note: '1.23 atm is the N2 partial pressure, from its 0.250 mol. Oxygen has twice the moles, so twice the pressure.' },
      { text: '2.46 atm', role: 'key', note: 'O2\'s own moles in the whole flask.' },
      { text: '4.92 atm', role: 'trap', family: 'other-unit', trap: 'Counted O atoms', note: 'This uses 1.00 mol, the oxygen atoms. Gas pressure counts free particles, and each O2 molecule is one.' }
    ],
    lockIt: 'Partial pressure = that gas\'s moles x RT / V. The other gases in the flask do not change it.',
    hook: null,
    playWith: GAS('Gas Law Slider: choose Solve for P, then set n = 0.5, V = 5 L and T = 300 K for the O2 alone'),
    video: { slot: 'gc.gases.dalton', title: 'Dalton: partial pressures and mole fractions', id: null, start: null },
    visual: {
      type: 'chem.gas',
      focus: 'oxygen-share',
      mixture: {
        V: 5.00, T: 300,
        gases: [
          { name: 'N2', n: 0.25, P: 1.2309, dots: 5, legend: '0.250 mol', barText: 'N2: 1.23', choice: '1.23 atm' },
          { name: 'O2', n: 0.5, P: 2.4618, dots: 10, legend: '0.500 mol', barText: 'O2: 2.46', key: true, choice: '2.46 atm' }
        ],
        box: ['5.00 L at 300 K'],
        barLabel: 'Pressure (atm)', totalLabel: 'total 3.69 atm', keyLabel: 'O2 alone: 2.46 atm'
      },
      verify: { vars: { nN: 0.25, nO: 0.5, R: 0.08206, T: 300, V: 5 }, key: 'nO*R*T/V', routes: [{ choice: '3.69 atm', expr: '(nN+nO)*R*T/V' }, { choice: '12.3 atm', expr: 'nO*R*T' }, { choice: '1.23 atm', expr: 'nN*R*T/V' }, { choice: '4.92 atm', expr: '2*nO*R*T/V' }] },
      reuse: 'new: chem.gas mixture box and pressure bar (tools/explain/visuals/chem-gc.js); each partial pressure recomputed from nRT / V',
      alt: 'A 5.00 L flask at 300 K with 5 nitrogen particles and 10 oxygen particles. A pressure bar splits the 3.69 atm total into nitrogen 1.23 and oxygen 2.46 atm, and the oxygen piece is outlined.',
      caption: 'Oxygen has twice nitrogen\'s particles, so it takes two of the three shares of the total pressure.'
    },
    demoPick: '3.69 atm',
    flags: []
  },

  /* ======================= How fast, not how far ======================= */
  {
    qid: 'fm:generated:gc-first-order-half-life#1xyppx6',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.kinetics.half-life',
    difficulty: band(2),
    source: src('generated:gc-first-order-half-life#1xyppx6', 42),
    keyText: '10 min',
    answer: { line: 'First-order half-life is 0.693 / k, whatever amount you start with: 0.693 / 0.0693 = 10 min.' },
    steps: [
      'Name the order first. First order means the half-life is 0.693 / k, with no starting amount in it.',
      'Divide: 0.693 / 0.0693 = 10. The digits match, so it is a clean factor of ten.',
      'Picture it: every 10 minutes, half of what is left is gone. 1, then 1/2, then 1/4.'
    ],
    choices: [
      { text: '28.9 min', role: 'trap', family: 'miscount', trap: 'Used 2 for ln 2', note: '2 / 0.0693 is about 28.9. Half-life carries ln 2, which is 0.693, not 2.' },
      { text: '0.1 min', role: 'trap', family: 'operation-flip', trap: 'Division upside down', note: '0.0693 / 0.693 = 0.1 flips the fraction. A bigger k means a faster reaction and a shorter half-life, so k goes underneath.' },
      { text: '10 min', role: 'key', note: '0.693 / 0.0693 = 10 min.' },
      { text: '14.4 min', role: 'trap', family: 'other-question', trap: 'That is 1/k', note: '1 / k = 14.4 min is a real time, where about 37 percent is left. Half is gone sooner, at 0.693 / k.' },
      { text: '0.048 min', role: 'trap', family: 'operation-flip', trap: 'Multiplied by k', note: '0.693 x 0.0693 = 0.048 multiplies where it should divide. A slow k cannot give a half-life of seconds.' }
    ],
    lockIt: 'First order: half-life = 0.693 / k, the same from any starting amount.',
    hook: null,
    playWith: hub('rate-laws', 'Rate Laws module: pick first order, slide k, and read the half-life', ["visualType:'order-curves'", 'ocPick']),
    video: { slot: 'gc.kinetics.half-life', title: 'Half-life and reaction order', id: null, start: null },
    visual: {
      type: 'chem.curve',
      kind: 'decay',
      focus: 'first-half-life',
      k: 0.0693, tMax: 40, unit: 'min', xTicks: [0, 10, 20, 30, 40], xLabel: 'time (min)', yLabel: 'fraction left',
      keyLabel: 'half-life: 10 min', half: { choice: '10 min', key: true },
      ghost: { t: 14.43, label: '1/k = 14.4 min: 37 percent left', choice: '14.4 min' },
      verify: { vars: { k: 0.0693 }, key: '0.693/k', routes: [{ choice: '28.9 min', expr: '2/k' }, { choice: '0.1 min', expr: 'k/0.693' }, { choice: '14.4 min', expr: '1/k' }, { choice: '0.048 min', expr: '0.693*k' }] },
      reuse: 'new: chem.curve kind decay (tools/explain/visuals/chem-gc.js); the curve is exp(-kt) from the stem k, and the build recomputes ln 2 / k',
      alt: 'A first-order decay curve: the fraction left starts at 1 and halves every 10 minutes, to 1/2 at 10, 1/4 at 20 and 1/8 at 30. The first half-life, 10 min, is outlined; a separate mark at 14.4 min shows 1/k, where about 37 percent is left.',
      caption: 'Read the dashed steps: equal 10-minute drops, each halving what is left. The first one is the half-life.'
    },
    demoPick: '14.4 min',
    flags: [
      { kind: 'bank-copy', text: 'Bank trap notes use capitals for emphasis ("FASTER", "SHORTER"). Coach view only; bank text untouched, key unchanged.' }
    ]
  },
  {
    qid: 'fm:gchem-b:GC_rl-e6',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.kinetics.half-life',
    difficulty: band(3),
    source: src('gchem-b:GC_rl-e6', 52),
    keyText: 'First order',
    answer: { line: 'Only first order has a half-life with no starting concentration in it, so only first order keeps it constant.' },
    steps: [
      'Know the three half-lives. Zero order: [A]_0 / 2k. First order: 0.693 / k. Second order: 1 / (k[A]_0).',
      'Look for [A]_0. Only the first-order form leaves it out, so only first order gives the same half-life from any start.',
      'Picture the decay: zero order\'s halvings come faster, second order\'s come slower, first order\'s come evenly spaced.'
    ],
    choices: [
      { text: 'Second order', role: 'trap', family: 'neighbor-fact', trap: 'Halvings stretch out', note: 'Second-order half-life is 1 / (k[A]_0). As the concentration falls, each half-life gets longer.' },
      { text: 'Third order', role: 'trap', family: 'neighbor-fact', trap: 'Stretches even faster', note: 'Third order slows even more as [A] falls, so each half-life is longer than the last.' },
      { text: 'Half order', role: 'trap', family: 'neighbor-fact', trap: 'Halvings shrink', note: 'At half order the half-life shrinks as [A] falls, more gently than zero order. It still depends on the start.' },
      { text: 'Zero order', role: 'trap', family: 'neighbor-fact', trap: 'Constant rate, not half-life', note: 'Zero order runs at a constant rate, which tempts you here. Its half-life is [A]_0 / 2k, so each halving comes sooner.' },
      { text: 'First order', role: 'key', note: '0.693 / k has no [A]_0 in it.' }
    ],
    lockIt: 'A half-life that ignores the starting concentration means first order.',
    hook: null,
    playWith: hub('rate-laws', 'Rate Laws module: pick zero, first and second order and compare the half-life each one shows', ["visualType:'order-curves'", 'ocPick']),
    video: { slot: 'gc.kinetics.half-life', title: 'Half-life and reaction order', id: null, start: null },
    visual: {
      type: 'chem.curve',
      kind: 'half-lives',
      focus: 'first-order-row',
      tMax: 48,
      orders: [
        { order: 0, k: 0.03125, title: 'Zero order', says: 'each half-life shorter', choice: 'Zero order' },
        { order: 1, k: 0.0433217, title: 'First order', says: 'every half-life the same', key: true, choice: 'First order' },
        { order: 2, k: 0.0625, title: 'Second order', says: 'each half-life longer', choice: 'Second order' }
      ],
      foot: 'Numbers: the time each halving takes. All three start with the same first half-life.',
      reuse: 'new: chem.curve kind half-lives (tools/explain/visuals/chem-gc.js); curves from the integrated rate laws, halvings computed per order',
      alt: 'Three decay curves that each lose their first half in 16 time units. Zero order\'s next halvings take 8, then 4; first order, outlined, takes 16 every time; second order\'s next halving takes 32.',
      caption: 'Read the numbers under each curve. Only the first-order row repeats the same time for every halving.'
    },
    demoPick: 'Zero order',
    flags: [
      { kind: 'stem-style', text: 'The stem prints [A]_0 and t_(1/2) with underscores, capitalizes CONSTANT, and names the method ("Using the integrated rate-law dependence"). Suggested wording for Thomas to review (not applied): "A reaction\'s half-life stays the same whatever the starting concentration of A. What is the order of the reaction in A?" Key unchanged.' }
    ]
  },

  /* ============================ Proton traffic ============================ */
  {
    qid: 'fm:gchem-b:GC_ph-e10',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.acid-base.ph',
    difficulty: band(3),
    source: src('gchem-b:GC_ph-e10', 44),
    keyText: '12.3',
    answer: { line: 'Two OH^- per Ba(OH)2 makes [OH^-] = 0.020 M, between 0.01 and 0.1. So pOH is 1.70 and pH is 12.3.' },
    steps: [
      'Count the hydroxide first. Each Ba(OH)2 releases two OH^-, so 0.010 M of it gives 0.020 M OH^-.',
      'Place it on the log ruler. 0.020 is 2 x 10^-2, so pOH = 2 - log 2 = 2 - 0.30 = 1.70.',
      'Flip to pH: 14 - 1.70 = 12.3. A strong base this concentrated belongs above pH 12.'
    ],
    choices: [
      { text: '11.0', role: 'trap', family: 'miscount', trap: 'No single rule', note: 'No one slip from 0.010 or 0.020 M lands here; pH 11 needs [OH^-] = 0.001 M. Check the decade first.' },
      { text: '12.0', role: 'trap', family: 'other-unit', trap: 'Counted formula units', note: 'pH 12.0 comes from 0.010 M, the Ba(OH)2 itself. Each formula unit gives two OH^-, so [OH^-] is 0.020 M.' },
      { text: '12.3', role: 'key', note: 'pOH 1.70, so pH = 14 - 1.70 = 12.3.' },
      { text: '12.7', role: 'trap', family: 'sign-slip', trap: 'Counted from the other decade', note: 'This puts pOH at 1 + 0.30 = 1.3. 0.020 sits nearer 0.01, so count down from 2: 2 - 0.30 = 1.70.' },
      { text: '13.0', role: 'trap', family: 'unit-slip', trap: 'Power of ten off', note: 'pH 13 needs [OH^-] = 0.1 M, five times this solution. 0.020 M gives pOH 1.70.' }
    ],
    lockIt: 'Count every OH^- per formula unit, take pOH from [OH^-], then pH = 14 - pOH.',
    hook: null,
    playWith: hub('ph-basics', 'pH / pOH module: slide pH and read [H+], [OH-] and pOH together', ["visualType:'ph-ladder'", 'plSlider']),
    video: { slot: 'gc.acid-base.ph', title: 'pH and pOH on the log ruler', id: null, start: null },
    visual: {
      type: 'chem.curve',
      kind: 'ph-scale',
      focus: 'ph-12.3',
      min: 11, max: 14,
      topTitle: '[OH^-] and pOH',
      topTicks: [{ pOH: 1, label: '0.1 M', sub: 'pOH 1' }, { pOH: 2, label: '0.01 M', sub: 'pOH 2' }, { pOH: 3, label: '0.001 M', sub: 'pOH 3' }],
      given: { pOH: 1.70, label: '0.020 M: pOH 1.70', anchor: 'start' },
      bottomTitle: 'pH = 14 - pOH',
      ticks: [11, 12, 13, 14],
      marks: [
        { pH: 11.0, label: '11.0', choice: '11.0' },
        { pH: 12.0, label: '12.0', choice: '12.0' },
        { pH: 12.3, label: 'pH 12.3', key: true, choice: '12.3' },
        { pH: 12.7, label: '12.7', choice: '12.7' },
        { pH: 13.0, label: '13.0', choice: '13.0' }
      ],
      verify: { vars: { c: 0.010 }, key: '14 + log(2*c)', routes: [{ choice: '12.0', expr: '14 + log(c)' }, { choice: '12.7', expr: '14 - (1 + log(2))' }, { choice: '13.0', expr: '14 + log(10*c)' }], noRoute: [{ choice: '11.0' }] },
      reuse: 'new: chem.curve kind ph-scale (tools/explain/visuals/chem-gc.js): two aligned rulers, pH and pOH, from the stem concentration',
      alt: 'Two aligned rulers. On top, hydroxide concentration and pOH: 0.020 M sits at pOH 1.70, between 0.01 M and 0.1 M. A dashed line carries it down to the pH ruler at 12.3, outlined, with the other choices 11.0, 12.0, 12.7 and 13.0 marked nearby.',
      caption: 'Find 0.020 M on the top ruler, nearer 0.01 than 0.1. Drop straight down to read the pH.'
    },
    demoPick: '12.0',
    flags: [
      { kind: 'stem-style', text: 'The stem gives [OH-] = 0.020 M and both formulas, so the two-hydroxides step is done for the student. Suggested wording for Thomas to review (not applied): "What is the pH of a 0.010 M Ba(OH)2 solution at 25 degrees C?" Key unchanged.' },
      { kind: 'note', text: 'Concept-first rule: 11.0 has no single-slip route (the note says so). A rewrite candidate drawn from a real misconception, such as pH 1.7, the pOH read as the pH; key unchanged.' }
    ]
  },
  {
    qid: 'fm:gchem-b:GC_bf-q3',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.acid-base.buffers',
    difficulty: band(3),
    source: src('gchem-b:GC_bf-q3', 49),
    keyText: '4.52',
    answer: { line: 'HCl turns some A^- into HA, so the ratio drops to 1:3. pH = 5.00 + log(1/3) = 5.00 - 0.48 = 4.52.' },
    steps: [
      'Start from the 1:1 buffer: equal A^- and HA puts the pH at the pKa, 5.00.',
      'Follow the acid. HCl turns 0.05 mol of A^- into HA, so [A^-] : [HA] = 0.05 : 0.15 = 1 : 3.',
      'Plug the ratio in: pH = 5.00 + log(1/3) = 5.00 - 0.48 = 4.52. Down a little, not a crash; the buffer took the hit.'
    ],
    choices: [
      { text: '4.00', role: 'trap', family: 'unit-slip', trap: 'Ratio 1:10, not 1:3', note: 'A drop of one full unit needs a 1:10 ratio. Here it is 1:3, and log 3 is about 0.48.' },
      { text: '4.52', role: 'key', note: 'Ratio 1:3, so log(1/3) = -0.48.' },
      { text: '4.74', role: 'trap', family: 'neighbor-fact', trap: 'Acetic acid\'s pKa', note: '4.74 is the pKa of acetic acid, a number you have seen often. This buffer\'s pKa is 5.00.' },
      { text: '5.00', role: 'trap', family: 'one-step-short', trap: 'pH before the HCl', note: '5.00 is the pH at the 1:1 start. After the HCl the base is outnumbered, so the pH drops below the pKa.' },
      { text: '5.48', role: 'trap', family: 'reversed', trap: 'Ratio flipped', note: 'This uses [HA]/[A^-] = 3, which raises the pH. Acid went in, so the pH has to fall.' }
    ],
    lockIt: 'Buffer pH = pKa + log([A^-]/[HA]). Added acid lowers the ratio, so the pH dips below the pKa.',
    hook: null,
    playWith: hub('buffers', 'Buffers module: press + HCl and watch the ratio and the pH move', ["visualType:'hh-slider'", 'bufAddAcid']),
    video: { slot: 'gc.acid-base.buffers', title: 'Buffers: the ratio sets the pH', id: null, start: null },
    visual: {
      type: 'chem.curve',
      kind: 'buffer',
      focus: 'ratio-1-to-3',
      pKa: 5.00,
      xTicks: [{ v: 0.25, label: '1:3' }, { v: 0.5, label: '1:1' }, { v: 0.75, label: '3:1' }], xLabel: '[A^-] : [HA]',
      yTicks: [4, 4.5, 5, 5.5, 6],
      marks: [
        { f: 0.5, label: 'before HCl: 5.00', dx: 9, dy: 20, choice: '5.00' },
        { f: 0.25, label: 'after HCl: 4.52', key: true, dx: 9, dy: 30, choice: '4.52' },
        { f: 0.75, label: 'flipped: 5.48', anchor: 'end', dx: -9, dy: -10, choice: '5.48' },
        { f: 0.0909091, label: '1:10 gives 4.00', dx: 9, dy: 24, choice: '4.00' }
      ],
      verify: { vars: { pKa: 5.00, A: 0.05, HA: 0.15 }, key: 'pKa + log(A/HA)', routes: [{ choice: '5.48', expr: 'pKa + log(HA/A)' }, { choice: '5.00', expr: 'pKa' }, { choice: '4.00', expr: 'pKa + log(1/10)' }] },
      reuse: 'new: chem.curve kind buffer (tools/explain/visuals/chem-gc.js): Henderson-Hasselbalch across the buffer region, marks computed from the ratios',
      alt: 'A buffer curve: pH against the share of the buffer in its base form, rising through pH 5.00 at a 1:1 ratio. Before the HCl the buffer sits at 1:1, pH 5.00; after it, at 1:3, pH 4.52, outlined. A flipped 3:1 ratio would give 5.48, and 1:10 would give 4.00.',
      caption: 'Slide left along the curve from 1:1 to 1:3. The drop is small because you stay inside the buffer.'
    },
    demoPick: '5.48',
    flags: [
      { kind: 'stem-style', text: 'The stem gives the new [HA] and [A-] after the HCl, so the buffer bookkeeping is done for the student. Suggested wording for Thomas to review (not applied): end at "receives 0.05 mol of HCl. What is the new pH?" Key unchanged.' },
      { kind: 'bank-copy', text: 'The bank explanation says the pH would crash "to ~1" without the buffer; 0.05 mol of HCl in 1.00 L of water gives pH 1.3. Coach view only; this explainer does not repeat the figure.' }
    ]
  },
  {
    qid: 'fm:generated:gc-ph#14hbxw7',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.acid-base.ph',
    difficulty: band(2),
    source: src('generated:gc-ph#14hbxw7', 55),
    keyText: '13',
    answer: { line: 'NaOH is a strong base, so [OH^-] = 10^-1 M and pOH = 1. pH = 14 - 1 = 13.' },
    steps: [
      'Name the solution first: NaOH, a strong base. It splits fully, so [OH^-] = 1.0 x 10^-1 M.',
      'Read pOH off the exponent: 10^-1 gives pOH 1.',
      'Flip to pH: 14 - 1 = 13. Strong bases sit high.'
    ],
    choices: [
      { text: '1', role: 'trap', family: 'other-question', trap: 'That is the pOH', note: '1 is the pOH, the hydroxide\'s number. The stem asks for pH, so finish with 14 - 1.' },
      { text: '7', role: 'trap', family: 'neighbor-fact', trap: 'Neutral water', note: 'pH 7 is neutral water, or a salt like NaCl. A strong base pushes the pH far above 7.' },
      { text: '12', role: 'trap', family: 'unit-slip', trap: 'Exponent read as 2', note: 'pH 12 would need [OH^-] = 10^-2 M. Here it is 10^-1 M, so pOH is 1.' },
      { text: '13', role: 'key', note: 'pOH 1, so pH 13.' },
      { text: '15', role: 'trap', family: 'operation-flip', trap: 'Added the pOH', note: '14 + 1 = 15 adds the pOH. pH and pOH add up to 14, so pH = 14 - 1.' }
    ],
    lockIt: 'Strong base: pOH = -log[OH^-], then pH = 14 - pOH.',
    hook: null,
    playWith: hub('ph-basics', 'pH / pOH module: slide pH to 13 and read [OH-] and pOH', ["visualType:'ph-ladder'", 'plSlider']),
    video: { slot: 'gc.acid-base.ph', title: 'pH and pOH on the log ruler', id: null, start: null },
    visual: {
      type: 'chem.curve',
      kind: 'ph-scale',
      focus: 'ph-13',
      min: 0, max: 15, beyond: 14,
      topTitle: '[OH^-] and pOH',
      topTicks: [{ pOH: 1, label: '0.1 M', sub: 'pOH 1' }, { pOH: 7, label: '10^-7 M', sub: 'pOH 7' }, { pOH: 13, label: '10^-13 M', sub: 'pOH 13' }],
      given: { pOH: 1, label: '0.10 M: pOH 1', anchor: 'end' },
      bottomTitle: 'pH = 14 - pOH',
      ticks: [0, 2, 4, 6, 8, 10, 12, 14],
      marks: [
        { pH: 1, label: '1', choice: '1' },
        { pH: 7, label: '7', choice: '7' },
        { pH: 12, label: '12', choice: '12' },
        { pH: 13, label: 'pH 13', key: true, choice: '13' },
        { pH: 15, label: '15: past 14', choice: '15' }
      ],
      verify: { vars: { c: 0.1 }, key: '14 + log(c)', routes: [{ choice: '1', expr: '-log(c)' }, { choice: '12', expr: '14 + log(c/10)' }, { choice: '15', expr: '14 - log(c)' }] },
      reuse: 'new: chem.curve kind ph-scale (tools/explain/visuals/chem-gc.js)',
      alt: 'Two aligned rulers: hydroxide concentration and pOH on top, where 0.10 M sits at pOH 1, and pH below. A dashed line drops to pH 13, outlined; the choices 1, 7 and 12 sit lower, and 15 sits past the end at 14.',
      caption: 'Start on the top ruler at 0.10 M, pOH 1. Drop straight down: the same spot reads pH 13.'
    },
    demoPick: '1',
    flags: []
  },
  {
    qid: 'fm:originals:ab-ec59a41c94',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.acid-base.buffers',
    difficulty: band(3),
    source: src('originals:ab-ec59a41c94', 61),
    keyText: 'It rises, because removing CO2 lowers carbonic acid',
    answer: { line: 'Breathing out CO2 pulls the carbonic acid chain back toward CO2. That uses up H^+, so the blood turns less acidic.' },
    steps: [
      'Write the chain first. CO2 and water make carbonic acid, which splits into H^+ and HCO3^-. Each step runs both ways.',
      'Pull out CO2. Hyperventilating removes it, so the chain shifts back toward CO2 to replace it.',
      'That shift uses up H^+ and carbonic acid. Fewer H^+ means a higher pH: respiratory alkalosis.'
    ],
    choices: [
      { text: 'It falls, because less bicarbonate is made', role: 'trap', family: 'half-right', trap: 'Right shift, other result', note: 'Bicarbonate does dip a little as the chain shifts back. But H^+ is used up too, so the pH climbs.' },
      { text: 'It does not change, because blood is buffered', role: 'trap', family: 'missed-exception', trap: 'Buffer as a wall', note: 'A buffer softens added acid or base. Here the acid\'s own source, CO2, is leaving, and that moves the pH.' },
      { text: 'It rises, because hyperventilating adds extra bicarbonate to the blood', role: 'trap', family: 'half-right', trap: 'Right result, other reason', note: 'The pH does rise, but not from added bicarbonate. Bicarbonate drops a little; the rise comes from H^+ being used up.' },
      { text: 'It falls, because CO2 is a base', role: 'trap', family: 'reversed', trap: 'CO2 read as a base', note: 'CO2 makes carbonic acid in water, so it acts as an acid. Losing an acid makes the blood less acidic.' },
      { text: 'It rises, because removing CO2 lowers carbonic acid', role: 'key', note: 'Less CO2, less carbonic acid, less H^+: pH up.' }
    ],
    lockIt: 'Remove a species and the equilibrium shifts to make more of it. Blowing off CO2 raises blood pH.',
    hook: null,
    playWith: hub('eq-lechat', 'Le Chatelier module: remove a product and watch the equilibrium shift to replace it', ["visualType:'lechat-shift'", 'lcStress'], 'The module runs the ammonia equilibrium, not the blood buffer (tool-gap flag).'),
    video: { slot: 'gc.acid-base.buffers', title: 'Buffers: the ratio sets the pH', id: null, start: null },
    visual: {
      type: 'chem.ledger',
      focus: 'shift-left',
      shift: {
        species: ['CO2 + H2O', 'H2CO3', 'H^+ + HCO3^-'], removed: 0, removedLabel: 'breathed out', direction: 'left',
        shiftLabel: 'the chain shifts left to replace CO2',
        effects: [{ text: 'H2CO3 falls' }, { text: 'H^+ used up: pH rises', key: true, choice: 'It rises, because removing CO2 lowers carbonic acid' }]
      },
      reuse: 'new: chem.ledger shift block (tools/explain/visuals/chem-gc.js): an equilibrium chain pushed by a removed species',
      alt: 'The carbonic acid chain: CO2 and water, then carbonic acid, then hydrogen ion and bicarbonate, linked by equilibrium arrows. An arrow lifts CO2 out of the first box, breathed out, and a long arrow under the chain points left. Below: carbonic acid falls and, outlined, hydrogen ion used up, pH rises.',
      caption: 'Start where CO2 leaves, then follow the long arrow left. Everything to its right, hydrogen ion included, gets pulled back.'
    },
    demoPick: 'It does not change, because blood is buffered',
    flags: [
      { kind: 'bank-copy', text: 'The bank trap note on "CO2 is a base" capitalizes ACID for emphasis. Coach view only; bank text untouched, key unchanged.' },
      { kind: 'tool-gap', text: 'The Le Chatelier module runs the ammonia equilibrium only. A carbonic acid chain with a breathe-out control would make this the exact play-with state.' }
    ]
  },

  /* ===================== Shape and the sticky forces ===================== */
  {
    qid: 'fm:gchem-b:GC_hb5',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.bonding.hybridization',
    difficulty: band(3),
    source: src('gchem-b:GC_hb5', 50),
    keyText: 'sp³d²',
    answer: { line: 'Xe carries 4 bonds and 2 lone pairs: 6 electron domains. Six domains means octahedral electron geometry, sp^{3}d^{2}.' },
    steps: [
      'Count domains on Xe first: 4 Xe-F bonds plus 2 lone pairs make 6.',
      'Match the count: 2 is sp, 3 is sp^{2}, 4 is sp^{3}, 5 is sp^{3}d, 6 is sp^{3}d^{2}. Hybridization follows domains, not just bonds.',
      'Six domains sit octahedral. The two lone pairs take opposite corners, so the four F atoms lie flat: square planar.'
    ],
    choices: [
      { text: 'sp³d²', role: 'key', note: 'Six domains: one s, three p and two d orbitals.' },
      { text: 'sp³', role: 'trap', family: 'one-step-short', trap: 'Counted bonds only', note: 'Four bonds alone would be sp^{3}. The two lone pairs need orbitals too, which makes six domains.' },
      { text: 'sp³d', role: 'trap', family: 'neighbor-fact', trap: 'Five domains', note: 'sp^{3}d fits five domains, as in XeF2, SF4 or ClF3. Xe here has six.' },
      { text: 'dsp²', role: 'trap', family: 'neighbor-fact', trap: 'Square planar metals', note: 'dsp^{2} labels square planar transition-metal complexes such as Pt(NH3)2Cl2. It matches the shape, not the six domains on Xe.' },
      { text: 'sp³d³', role: 'trap', family: 'miscount', trap: 'One domain too many', note: 'sp^{3}d^{3} is seven domains, as in IF7. Xe has 4 bonds and 2 pairs, so six.' }
    ],
    lockIt: 'Hybridization counts domains, bonds plus lone pairs: 4 is sp^{3}, 5 is sp^{3}d, 6 is sp^{3}d^{2}.',
    hook: null,
    playWith: hub('vsepr-predictor', 'VSEPR Predictor: set 4 bonded atoms and 2 lone pairs and read the shape and steric number', ['id="vsprBonded"', 'id="vsprLP"']),
    video: { slot: 'gc.bonding.hybridization', title: 'Hybridization from domain counts', id: null, start: null },
    visual: {
      type: 'chem.lewis',
      focus: 'domains',
      molecule: {
        id: 'xef4', formula: 'XeF4', name: 'Xenon tetrafluoride', charge: 0, totalValenceElectrons: 36, centralAtom: 'Xe',
        bondPattern: [{ atomA: 'Xe', atomB: 'F1', order: 1 }, { atomA: 'Xe', atomB: 'F2', order: 1 }, { atomA: 'Xe', atomB: 'F3', order: 1 }, { atomA: 'Xe', atomB: 'F4', order: 1 }],
        lonePairCounts: { Xe: 2, F1: 3, F2: 3, F3: 3, F4: 3 },
        electronGeometry: 'octahedral', molecularGeometry: 'square-planar'
      },
      layoutAngles: [-30, 30, 150, 210],
      centralPairAngles: [270, 90],
      pairLabelSide: 'top',
      spreadTerminalPairs: true,
      fit: true,
      ledger: { atom: 'Xe', valence: 8, inBonds: 4, extra: [{ label: 'Domains: 4 bonds + 2 lone pairs', value: '6', key: true }] },
      domains: { title: 'Domains and the hybridization they take', ladder: [
        { n: 2, label: 'sp' }, { n: 3, label: 'sp^{2}' }, { n: 4, label: 'sp^{3}', choice: 'sp³' }, { n: 5, label: 'sp^{3}d', choice: 'sp³d' }, { n: 6, label: 'sp^{3}d^{2}', key: true, choice: 'sp³d²' }, { n: 7, label: 'sp^{3}d^{3}', choice: 'sp³d³' }
      ] },
      reuse: 'Copy of the Lewis sandbox layout and drawing functions (tools/gc/lewis-sandbox.html), lone pairs placed opposite each other; domain ladder from tools/explain/visuals/chem-gc.js',
      alt: 'Lewis structure of XeF4: xenon in the center with single bonds to four fluorines, each holding three lone pairs, and two outlined lone pairs on xenon, one above and one below. A ledger reads 8 valence electrons, 4 in bonds, 2 lone pairs, 6 domains. A ladder of domain counts outlines 6: sp3d2.',
      caption: 'Count every domain on Xe, the two outlined pairs included. Then find that count on the ladder.'
    },
    demoPick: 'sp³',
    flags: [
      { kind: 'stem-style', text: 'The stem gives four bonds, two lone pairs and their axial placement, which is the whole domain count. Suggested wording for Thomas to review (not applied): "What is the hybridization of the central atom in XeF4?" Key unchanged.' }
    ]
  },

  /* ========================= States and solutions ========================= */
  {
    qid: 'fm:gchem-b:GC_pd5',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.phases.phase-diagram',
    difficulty: band(3),
    source: src('gchem-b:GC_pd5', 48),
    keyText: 'Gas',
    answer: { line: '1 atm is below CO2\'s triple-point pressure, 5.11 atm, where liquid cannot exist. At 298 K the sample sits in the gas region.' },
    steps: [
      'Locate the point: 1 atm and 298 K. Compare the pressure with the triple point first: 1 atm is well under 5.11 atm.',
      'Know what that means. Below the triple-point pressure only solid and gas exist; liquid CO2 needs more than 5.11 atm.',
      'Check the temperature: 298 K is far above 195 K, where dry ice sublimes at 1 atm. So the point is gas.'
    ],
    choices: [
      { text: 'Supercritical fluid', role: 'trap', family: 'neighbor-fact', trap: 'Needs heat and pressure', note: 'Supercritical CO2 needs T above 304 K and P above 73 atm. 1 atm is nowhere near.' },
      { text: 'Mixture of solid and liquid', role: 'trap', family: 'neighbor-fact', trap: 'On the melting line', note: 'Solid and liquid coexist only on the melting line, which starts at the triple point, 5.11 atm. This point sits far below it.' },
      { text: 'Solid', role: 'trap', family: 'other-conditions', trap: 'Dry ice, colder', note: 'At 1 atm CO2 is solid only below about 195 K, as dry ice. At 298 K it has long since sublimed.' },
      { text: 'Gas', role: 'key', note: 'Under the curves at 298 K and 1 atm: gas.' },
      { text: 'Liquid', role: 'trap', family: 'missed-exception', trap: 'Water habit', note: 'Water is liquid at room conditions, so liquid feels natural. CO2 is the exception: its liquid needs more than 5.11 atm.' }
    ],
    lockIt: 'Below the triple-point pressure there is no liquid: the substance goes straight between solid and gas.',
    hook: 'Dry ice skips the puddle.',
    playWith: hub('phase-diag', 'Phase Diagrams module: pick CO2, set 298 K and 1 atm, and read the current phase', ["visualType:'phase-pt'", 'pdSub']),
    video: { slot: 'gc.phases.phase-diagram', title: 'Reading a phase diagram', id: null, start: null },
    visual: {
      type: 'chem.curve',
      kind: 'phase',
      focus: 'gas-region',
      Tmin: 150, Tmax: 380, Pmin: 0.3, Pmax: 300,
      xTicks: [150, 200, 250, 300, 350], yTicks: [{ v: 1, label: '1' }, { v: 10, label: '10' }, { v: 100, label: '100' }],
      point: { T: 298, P: 1 },
      labels: [
        { T: 172, P: 40, text: 'Solid', region: true, choice: 'Solid' },
        { T: 262, P: 140, text: 'Liquid', region: true, choice: 'Liquid' },
        { T: 262, P: 4, text: 'Gas', region: true, choice: 'Gas', key: true },
        { T: 376, P: 160, lines: ['supercritical', 'fluid'], region: true, anchor: 'end', choice: 'Supercritical fluid' },
        { T: 223, P: 2.4, text: 'triple point, 5.11 atm', anchor: 'start' },
        { T: 308, P: 45, text: 'critical point', anchor: 'start' }
      ],
      pointLabel: { text: '298 K, 1 atm', dx: -10, dy: 24, anchor: 'end' },
      reuse: 'new: chem.curve kind phase (tools/explain/visuals/chem-gc.js): boundary lines fitted through the measured CO2 points (compute-gc.js), and the build recomputes the region of the stem point',
      alt: 'The CO2 phase diagram, pressure on a log scale against temperature, with the triple point at 216.6 K and 5.11 atm and the critical point at 304 K and 73 atm. A dashed line marks 1 atm, entirely below the liquid region. The point at 298 K and 1 atm sits in the shaded gas region, outlined.',
      caption: 'Find the dashed 1 atm line: it runs under the triple point, so it never touches liquid. The point lands in gas.'
    },
    demoPick: 'Liquid',
    flags: [
      { kind: 'bank-copy', text: 'The bank explanation says the diagram shows "solid below the sublimation curve and gas above" and that 298 K and 1 atm is "above the sublimation curve". On the standard diagram (pressure up, temperature right) that is reversed: gas lies below and to the right of the boundary lines, and at 298 K the line that matters is the liquid-gas line, about 64 atm there. Bank text untouched; the explainer and picture put the point in the gas region, under the curves. Key unchanged.' },
      { kind: 'stem-style', text: 'The stem says the point falls "well below the triple-point pressure but above its temperature", which nearly reads the diagram for the student. Suggested wording for Thomas to review (not applied): drop that clause. Key unchanged.' }
    ]
  },
  {
    qid: 'fm:generated:gc-dilution#1tmuuzr',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.solutions.dilution',
    difficulty: band(2),
    source: src('generated:gc-dilution#1tmuuzr', 57),
    keyText: '50 mL',
    answer: { line: 'Water adds volume, not solute. Halving the concentration doubles the volume to 100 mL, so you add 50 mL.' },
    steps: [
      'Follow the solute: adding water changes the volume, never the moles of HCl.',
      'Halve the concentration and the volume doubles: 1 M to 0.5 M takes 50 mL to 100 mL. That is M1V1 = M2V2.',
      'Answer what was asked: water added = 100 - 50 = 50 mL.'
    ],
    choices: [
      { text: '25 mL', role: 'trap', family: 'reversed', trap: 'Shrank the volume', note: 'Halving the volume would concentrate the acid. Diluting always makes the solution bigger.' },
      { text: '150 mL', role: 'trap', family: 'operation-flip', trap: 'Added 50 to the total', note: '150 adds the starting 50 mL on top of the 100 mL final volume. The 100 mL already includes the first 50.' },
      { text: '50 mL', role: 'key', note: '100 mL total minus the 50 mL you started with.' },
      { text: '51 mL', role: 'trap', family: 'miscount', trap: 'No single rule', note: 'No rule lands on 51; it reads as a rounding slip. The clean numbers give exactly 50 mL.' },
      { text: '100 mL', role: 'trap', family: 'other-question', trap: 'Final volume', note: '100 mL is the final volume of the solution. The stem asks how much water you add to get there.' }
    ],
    lockIt: 'Dilution keeps moles fixed: M1V1 = M2V2. Water added = final volume - starting volume.',
    hook: null,
    playWith: hub('solutions', 'Solutions module: choose Solve for V2, then set M1 = 1, V1 = 50 and M2 = 0.5', ["visualType:'dilution-beakers'", 'dilSolve']),
    video: { slot: 'gc.solutions.dilution', title: 'Dilution: same solute, more water', id: null, start: null },
    visual: {
      type: 'chem.ledger',
      focus: 'added-water',
      beakers: {
        items: [
          { label: '50 mL', sub: '1 M HCl', mL: 50 },
          { label: '100 mL', sub: '0.5 M HCl', mL: 100, added: 50, addedLabel: '+ 50 mL water', key: true, choice: '50 mL' }
        ],
        dots: 10, dotsLabel: 'the same solute in both beakers'
      },
      rows: { rows: [
        { label: '1 M x 50 mL = 0.5 M x V2', value: 'V2 = 100 mL' },
        { label: 'Water added = 100 - 50', value: '50 mL', sum: true }
      ] },
      verify: { vars: { M1: 1, V1: 50, M2: 0.5 }, key: 'M1*V1/M2 - V1', routes: [{ choice: '100 mL', expr: 'M1*V1/M2' }, { choice: '150 mL', expr: 'M1*V1/M2 + V1' }, { choice: '25 mL', expr: 'V1/2' }], noRoute: [{ choice: '51 mL' }] },
      reuse: 'new: chem.ledger beakers and rows blocks (tools/explain/visuals/chem-gc.js); liquid heights drawn to scale',
      alt: 'Two beakers holding the same solute particles. The first holds 50 mL of 1 M HCl; the second holds 100 mL of 0.5 M HCl, with its top 50 mL, the added water, hatched and outlined. Below, 1 x 50 = 0.5 x V2 gives 100 mL, and 100 - 50 = 50 mL of water.',
      caption: 'Same particles, twice the room. The hatched band on top is the water you add.'
    },
    demoPick: '100 mL',
    flags: [
      { kind: 'stem-style', text: 'The stem capitalizes ADDED for emphasis. Suggested wording for Thomas to review (not applied): "How many mL of water must be added to 50 mL of 1 M HCl to make a 0.5 M solution?" in plain case. Key unchanged.' },
      { kind: 'bank-copy', text: 'The bank trap note on 51 mL is the generic "Arithmetic slip", and the note on 100 mL capitalizes FINAL. Coach view only; bank text untouched.' },
      { kind: 'note', text: 'Concept-first rule: 51 mL has no misconception behind it (the note says so). A rewrite candidate drawn from a real misconception, such as 200 mL from reading 0.5 M as a quarter of the strength; key unchanged.' }
    ]
  },
  {
    qid: 'fm:gchem-a:col-q11',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.solutions.colligative',
    difficulty: band(3),
    source: src('gchem-a:col-q11', 59),
    keyText: '1.29',
    answer: { line: 'i counts particles per formula unit, read off the freezing drop: 0.24 / (1.86 x 0.10) is about 1.29, between 1 and 2.' },
    steps: [
      'Know what i measures: particles in solution per formula unit. Full splitting of MgSO4 would give 2.',
      'Compare the drops. The ideal i = 2 drop is 0.372; the real drop is 0.24, a little under two thirds of it.',
      'Scale i the same way: 2 x 0.24 / 0.372 is about 1.29. Some Mg^2+ and SO4^2- stay paired, so there are fewer particles.'
    ],
    choices: [
      { text: '1.00', role: 'trap', family: 'neighbor-fact', trap: 'No splitting at all', note: 'i = 1 fits a nonelectrolyte like sucrose, which would drop the freezing point only 0.186 degrees. MgSO4 drops it more, so it does make ions.' },
      { text: '1.29', role: 'key', note: 'Measured drop over Kf x m: 0.24 / 0.186.' },
      { text: '1.55', role: 'trap', family: 'reversed', trap: 'Ratio flipped', note: '1.55 is 0.372 / 0.24, ideal over measured. i is the measured drop over Kf x m.' },
      { text: '1.86', role: 'trap', family: 'other-question', trap: 'That is Kf', note: '1.86 is Kf for water, a constant from the stem. i is a count of particles, found from the drop.' },
      { text: '2.00', role: 'trap', family: 'missed-exception', trap: 'Ideal, not measured', note: '2.00 is the ideal value for full splitting. The measured drop is smaller, so the real i is smaller: ions pair up.' }
    ],
    lockIt: 'i = measured dTf / (Kf x m). Ion pairing pulls i below the ideal ion count.',
    hook: null,
    playWith: hub('colligative', 'Colligative module: compare i = 1 and i = 2 at the same molality and watch the freezing drop double', ["visualType:'colligative-explorer'", 'ceUpdate']),
    video: { slot: 'gc.solutions.colligative', title: 'Colligative properties and the van \'t Hoff factor', id: null, start: null },
    visual: {
      type: 'chem.ledger',
      focus: 'measured-bar',
      bars: { title: 'Freezing-point drop at 0.10 m', max: 0.40, rows: [
        { label: 'i = 1: no ions (like sucrose)', value: 0.186, display: '0.186', choice: '1.00' },
        { label: 'MgSO4 as measured: i = 1.29', value: 0.24, display: '0.24', key: true, choice: '1.29' },
        { label: 'i = 2: every unit split', value: 0.372, display: '0.372', choice: '2.00' }
      ] },
      rows: { rows: [{ label: 'i = 0.24 / (1.86 x 0.10) = 0.24 / 0.186', value: '1.29', sum: true }], foot: 'Between 1 and 2: some ions stay paired.' },
      verify: { vars: { dT: 0.24, Kf: 1.86, m: 0.10, ideal: 0.372 }, key: 'dT/(Kf*m)', routes: [{ choice: '1.55', expr: 'ideal/dT' }, { choice: '1.86', expr: 'Kf' }, { choice: '2.00', expr: 'ideal/(Kf*m)' }, { choice: '1.00', expr: '0.186/(Kf*m)' }] },
      reuse: 'new: chem.ledger bars and rows blocks (tools/explain/visuals/chem-gc.js); bar lengths to scale',
      alt: 'Three bars for the freezing-point drop at 0.10 m: 0.186 degrees if nothing splits (i = 1), 0.372 if every unit splits (i = 2), and the measured 0.24 for MgSO4 between them, outlined as i = 1.29. A ledger line divides 0.24 by 1.86 x 0.10.',
      caption: 'The measured bar sits between the two ideal bars. Its i sits between 1 and 2 the same way.'
    },
    demoPick: '2.00',
    flags: [
      { kind: 'note', text: 'Concept-first rule: 0.24 / 0.186 is not a head step in a no-calculator section. A lighter variant gives a measured drop of 0.279 (i = 1.5). Key unchanged.' },
      { kind: 'bank-copy', text: 'The bank trap note on 1.00 says "that is wrong", which the house rule bars, and the notes capitalize IDEAL. Coach view only; bank text untouched.' },
      { kind: 'stem-style', text: 'The stem prints i_eff with an underscore (the player typesets it) and ends on "The effective van\'t Hoff factor i_eff is:". Suggested wording for Thomas to review (not applied): "What is the effective van\'t Hoff factor of MgSO4 in this solution?" Key unchanged.' }
    ]
  },

  /* ============================= The charge ledger ============================= */
  {
    qid: 'fm:gchem-a:nr3',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.electrochem.nernst',
    difficulty: band(2),
    source: src('gchem-a:nr3', 45),
    keyText: '0.059 V',
    answer: { line: 'Same metal both sides, so the standard potential is 0. The 100-fold gap makes the voltage: (0.0592 / 2) x log 100 = 0.059 V.' },
    steps: [
      'Spot the setup: copper in both beakers. A concentration cell starts from a standard potential of 0.',
      'Ask which way it runs. Cu^2+ plates out on the concentrated side, and the dilute side dissolves to catch up. A running cell reads positive.',
      'Use Nernst: E = (0.0592 / n) log(1.0 / 0.01) = (0.0592 / 2) x 2 = 0.059 V.'
    ],
    choices: [
      { text: '0.118 V', role: 'trap', family: 'miscount', trap: 'Used n = 1', note: '0.0592 x 2 = 0.118 leaves out n. Cu^2+ takes two electrons, so the 0.0592 is halved first.' },
      { text: '−0.059 V', role: 'trap', family: 'sign-slip', trap: 'Ran it backward', note: 'Flipping the ratio to 0.01 / 1.0 makes the dilute side the cathode. Copper plates out where Cu^2+ is concentrated, so the cell reads positive.' },
      { text: '0', role: 'trap', family: 'neighbor-fact', trap: 'Standard potential only', note: '0 is the standard potential of a concentration cell. The concentrations differ 100 times, so the cell still makes a voltage.' },
      { text: '0.059 V', role: 'key', note: '(0.0592 / 2) x 2 = 0.059 V.' },
      { text: '0.030 V', role: 'trap', family: 'one-step-short', trap: 'Dropped the log', note: '0.0592 / 2 = 0.030 stops before multiplying by log 100, which is 2.' }
    ],
    lockIt: 'A concentration cell has zero standard potential; its voltage is (0.0592 / n) log(concentrated / dilute).',
    hook: null,
    playWith: hub('nernst', 'Nernst module: set the standard potential to 0, n to 2 and log Q to -2, and read E', ["visualType:'nernst-slider'", 'nsUpdate']),
    video: { slot: 'gc.electrochem.nernst', title: 'Concentration cells and the Nernst equation', id: null, start: null },
    visual: {
      type: 'chem.cell',
      view: 'concentration',
      focus: 'meter',
      n: 2, anodeM: 0.01, cathodeM: 1.0,
      meter: '0.059 V', meterChoice: { choice: '0.059 V', key: true },
      anodeLines: ['0.01 M Cu^2+', 'anode', 'Cu dissolves'],
      cathodeLines: ['1.0 M Cu^2+', 'cathode', 'Cu^2+ plates out'],
      rows: { rows: [
        { label: 'Standard potential, same metal both sides', value: '0' },
        { label: 'E = (0.0592 / 2) x log(1.0 / 0.01)', value: '0.0296 x 2' },
        { label: 'Cell voltage', value: '0.059 V', sum: true }
      ] },
      verify: { vars: { n: 2, c: 1.0, d: 0.01 }, key: '(0.0592/n)*log(c/d)', routes: [{ choice: '0.118 V', expr: '0.0592*log(c/d)' }, { choice: '−0.059 V', expr: '(0.0592/n)*log(d/c)' }, { choice: '0.030 V', expr: '0.0592/n' }, { choice: '0', expr: '0' }] },
      reuse: 'new: chem.cell concentration view (tools/explain/visuals/chem-gc.js); the build recomputes Nernst and checks the cathode is the concentrated side',
      alt: 'A concentration cell: two beakers with copper electrodes, 0.01 M Cu2+ on the left as the anode where copper dissolves and 1.0 M on the right as the cathode where copper plates out, joined by a salt bridge. Electrons run left to right through the wire to a meter reading 0.059 V, outlined.',
      caption: 'Only the concentration differs between the beakers. The meter\'s voltage comes from that 100-fold gap alone.'
    },
    demoPick: '0.118 V',
    flags: [
      { kind: 'stem-style', text: 'The stem ends on the fragment "E_cell?" (shorthand, raw underscore). Suggested wording for Thomas to review (not applied): "...and 1.0 M (right). What is the cell potential at 25 degrees C?" Key unchanged.' }
    ]
  },
  {
    qid: 'fm:gchem-b:GC_nr-e5',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.electrochem.e-to-k',
    difficulty: band(3),
    source: src('gchem-b:GC_nr-e5', 46),
    keyText: '10^17',
    answer: { line: 'A positive standard potential means K is above 1. log K = 2 x 0.50 / 0.0592, about 17, so K is about 10^17.' },
    steps: [
      'Read the sign first. A positive standard potential means the reaction runs forward on its own, so K is above 1.',
      'Size it: log K = nE / 0.0592. With n = 2, every 0.0296 V is one power of ten.',
      'Count the powers: 0.50 / 0.0296 is about 17. So K is about 10^17, far toward products.'
    ],
    choices: [
      { text: '10^10', role: 'trap', family: 'unit-slip', trap: 'Rounded 0.0592 to 0.1', note: 'Using 0.1 for 0.0592 gives log K = 1.0 / 0.1 = 10. That rounding costs seven powers of ten.' },
      { text: '10', role: 'trap', family: 'miscount', trap: 'No single rule', note: 'K = 10 would need a potential of only about 0.03 V. Half a volt with two electrons is many powers of ten more.' },
      { text: '10^5', role: 'trap', family: 'miscount', trap: 'No single rule', note: 'No single slip gives 10^5; dropping n gives about 10^8.5. Count 0.0296 V per power of ten instead.' },
      { text: '10^17', role: 'key', note: 'log K is about 17.' },
      { text: '10^(-17)', role: 'trap', family: 'sign-slip', trap: 'Other side of 1', note: 'Right size, other side of 1. A positive standard potential favors products, so K sits far above 1.' }
    ],
    lockIt: 'Positive standard potential means K above 1; log K = nE / 0.0592.',
    hook: null,
    playWith: hub('nernst', 'Nernst module: set the standard potential to 0.50 V and n to 2, slide log Q to 6, and see E stay well above 0', ["visualType:'nernst-slider'", 'nsUpdate'], 'The log Q slider stops at 6, so it shows that K lies beyond 10^6, not the full 10^17.'),
    video: { slot: 'gc.electrochem.e-to-k', title: 'Cell potential and K', id: null, start: null },
    visual: {
      type: 'chem.cell',
      view: 'e-to-k',
      focus: 'k-ruler',
      n: 2, E: 0.50, eMax: 0.6,
      topLabel: 'Standard potential (V)', eTicks: [-0.5, 0, 0.5],
      kTicks: [-20, -10, 0, 10, 20],
      givenLabel: '0.50 V given',
      marks: [
        { logK: -17, label: '10^-17', choice: '10^(-17)' },
        { logK: 1, label: '10', choice: '10' },
        { logK: 5, label: '10^5', choice: '10^5' },
        { logK: 10, label: '10^10', choice: '10^10' },
        { logK: 16.89, label: 'K = 10^17', key: true, choice: '10^17' }
      ],
      bottomLabel: 'n = 2: each 0.0296 V is one power of ten in K',
      verify: { vars: { n: 2, E: 0.50 }, key: '10^(n*E/0.0592)', routes: [{ choice: '10^10', expr: '10^(n*E/0.1)' }, { choice: '10^(-17)', expr: '10^(-n*E/0.0592)' }], noRoute: [{ choice: '10' }, { choice: '10^5' }] },
      reuse: 'new: chem.cell e-to-k view (tools/explain/visuals/chem-gc.js): two aligned rulers, volts and powers of ten, from log K = nE / 0.0592',
      alt: 'Two aligned rulers: standard potential in volts on top and K as powers of ten below, with 0 V lined up with K = 1. The given 0.50 V drops straight down to K = 10 to the 17, outlined. The other choices sit at 10 to the -17, 10, 10 to the 5 and 10 to the 10.',
      caption: 'Start at 0.50 V on the top ruler and drop straight down. Positive volts land far out on the K above 1 side.'
    },
    demoPick: '10^(-17)',
    flags: [
      { kind: 'stem-style', text: 'The stem states log K = nE/0.0592, which hands over the method. Suggested wording for Thomas to review (not applied): "A galvanic cell has a standard potential of +0.50 V with 2 electrons transferred. What is K for the cell reaction at 25 degrees C?" Key unchanged.' },
      { kind: 'note', text: 'Concept-first rule: 10 and 10^5 have no single-slip route (the notes say so). Rewrite candidates drawn from real misconceptions, such as 10^8.5 (n left out) or K below 1 for a small positive potential; key unchanged.' },
      { kind: 'bank-copy', text: 'The bank explanation cites 10^8.5 for forgetting n, which is not a served choice. Coach view only; bank text untouched.' }
    ]
  },

  /* ============================== The energy ledger ============================== */
  {
    qid: 'fm:gchem-b:GC_en-q2',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.thermo.enthalpy-formation',
    difficulty: band(3),
    source: src('gchem-b:GC_en-q2', 56),
    keyText: '-908 kJ',
    answer: { line: 'Measure both sides from the elements: products sit at -1092 kJ, reactants at -184 kJ. dH is the drop between them, -908 kJ.' },
    steps: [
      'Put the elements at zero. Each formation enthalpy says how far a compound sits below or above them; O2 sits at 0.',
      'Weigh each side by its coefficients. Products: 4(+90) + 6(-242) = -1092 kJ. Reactants: 4(-46) = -184 kJ.',
      'dH is products minus reactants: -1092 - (-184) = -908 kJ. Products sit lower, so heat comes out.'
    ],
    choices: [
      { text: '-184 kJ', role: 'trap', family: 'other-question', trap: 'Reactants level only', note: '-184 kJ is where the reactants sit. dH is the step from the reactants down to the products.' },
      { text: '-724 kJ', role: 'trap', family: 'miscount', trap: 'Counted NH3 twice', note: '-1092 + 368 counts the ammonia term twice. Subtract the reactant sum once: -1092 - (-184).' },
      { text: '+908 kJ', role: 'trap', family: 'reversed', trap: 'Reactants minus products', note: 'Right size, opposite sign. Products sit below reactants, so heat comes out and dH is negative.' },
      { text: '-1092 kJ', role: 'trap', family: 'one-step-short', trap: 'Products level only', note: '-1092 kJ is the products\' level, measured from the elements. Subtract the reactants\' level to get the step between them.' },
      { text: '-908 kJ', role: 'key', note: 'From -184 down to -1092: a drop of 908 kJ.' }
    ],
    lockIt: 'dH = products\' formation enthalpies minus reactants\'. Elements in their standard state count 0.',
    hook: null,
    playWith: hub('enthalpy', 'Enthalpy / Hess module: slide dH negative and watch the products drop below the reactants', ["visualType:'rxn-coord'", 'rcUpdate']),
    video: { slot: 'gc.thermo.enthalpy-formation', title: 'Enthalpy from formation values', id: null, start: null },
    visual: {
      type: 'chem.energy',
      kind: 'levels',
      focus: 'reactants-to-products',
      points: [
        { id: 'el', y: 0, valueLabel: '0 kJ' },
        { id: 'r', y: -184, valueLabel: '-184 kJ', choice: '-184 kJ' },
        { id: 'p', y: -1092, valueLabel: '-1092 kJ', choice: '-1092 kJ' }
      ],
      names: { 0: 'Elements: N2, H2, O2', 1: '4 NH3 + 5 O2', 2: '4 NO + 6 H2O' },
      arrows: [{ from: 'r', to: 'p', x: 0.667, key: true, label: 'dH = -908 kJ', value: -908, anchor: 'end', choice: '-908 kJ' }],
      verify: { vars: { NO: 90, H2O: -242, NH3: -46 }, key: '(4*NO + 6*H2O) - 4*NH3', routes: [{ choice: '-184 kJ', expr: '4*NH3' }, { choice: '-724 kJ', expr: '(4*NO + 6*H2O) - 2*4*NH3' }, { choice: '+908 kJ', expr: '4*NH3 - (4*NO + 6*H2O)' }, { choice: '-1092 kJ', expr: '4*NO + 6*H2O' }] },
      reuse: 'new: chem.energy kind levels (tools/explain/visuals/chem-gc.js): an enthalpy ladder drawn to scale; the build recomputes the sums and the arrow',
      alt: 'An enthalpy ladder drawn to scale: the elements at 0 kJ, the reactants 4 NH3 + 5 O2 at -184 kJ, and the products 4 NO + 6 H2O at -1092 kJ. An outlined arrow runs from the reactants down to the products: dH = -908 kJ.',
      caption: 'Both levels are measured from the elements. The answer is the arrow between them, not either level.'
    },
    demoPick: '-1092 kJ',
    flags: [
      { kind: 'note', text: 'Concept-first rule: 6 x 242 and the two sums are several steps for a no-calculator section. A lighter variant uses friendlier values or asks only for the sign of dH. Key unchanged.' },
      { kind: 'stem-style', text: 'The stem prints dH_rxn and dH_f with underscores (the player typesets them) and states the products-minus-reactants formula. Suggested wording for Thomas to review (not applied): end at "...O2 = 0. What is dH for the reaction as written?" Key unchanged.' }
    ]
  },
  {
    qid: 'fm:gchem-b:GC_en-q3',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.thermo.hess',
    difficulty: band(2),
    source: src('gchem-b:GC_en-q3', 68),
    keyText: '-70 kJ',
    answer: { line: 'Double step 1 to make 2 B, then add step 2: 2(-50) + 30 = -70 kJ.' },
    steps: [
      'Match the middle species first. Step 2 needs 2 B, so run step 1 twice: 2 A to 2 B, dH = -100 kJ.',
      'Add step 2 as written: 2 B to C, +30 kJ. The 2 B cancels.',
      'Add the energies the same way: -100 + 30 = -70 kJ for 2 A to C.'
    ],
    choices: [
      { text: '+70 kJ', role: 'trap', family: 'sign-slip', trap: 'Sign dropped', note: 'Right size, opposite sign. The big step down, -100 kJ, outweighs the small step up.' },
      { text: '-130 kJ', role: 'trap', family: 'reversed', trap: 'Ran step 2 backward', note: '-100 - 30 treats step 2 as reversed. It is used as written, 2 B to C, so its +30 stays positive.' },
      { text: '-20 kJ', role: 'trap', family: 'one-step-short', trap: 'Forgot to double', note: '-50 + 30 uses step 1 once. One A makes only one B, and step 2 needs two.' },
      { text: '+30 kJ', role: 'trap', family: 'other-question', trap: 'Step 2 alone', note: '+30 kJ is the second step by itself. The combined reaction adds both steps.' },
      { text: '-70 kJ', role: 'key', note: 'Down 100, up 30: net -70 kJ.' }
    ],
    lockIt: 'Hess\'s law: scale each step\'s dH with its equation, flip the sign if you reverse it, then add.',
    hook: null,
    playWith: hub('enthalpy', 'Enthalpy / Hess module: slide dH and watch where the products sit against the reactants', ["visualType:'rxn-coord'", 'rcUpdate']),
    video: { slot: 'gc.thermo.hess', title: 'Hess\'s law: scale, flip, add', id: null, start: null },
    visual: {
      type: 'chem.energy',
      kind: 'levels',
      focus: 'net-arrow',
      points: [
        { id: 'a', y: 0, valueLabel: '0 kJ' },
        { id: 'b', y: -100, valueLabel: '-100 kJ' },
        { id: 'c', y: -70, valueLabel: '-70 kJ' }
      ],
      names: { 0: '2 A', 1: '2 B', 2: 'C' },
      arrows: [
        { from: 'a', to: 'b', x: 0.333, label: '-100: step 1 x 2', value: -100 },
        { from: 'b', to: 'c', x: 0.667, label: '+30: step 2', value: 30 },
        { from: 'a', to: 'c', x: 0.985, key: true, label: '-70 kJ', value: -70, anchor: 'end', choice: '-70 kJ' }
      ],
      verify: { vars: { h1: -50, h2: 30 }, key: '2*h1 + h2', routes: [{ choice: '+70 kJ', expr: '-(2*h1 + h2)' }, { choice: '-130 kJ', expr: '2*h1 - h2' }, { choice: '-20 kJ', expr: 'h1 + h2' }, { choice: '+30 kJ', expr: 'h2' }] },
      reuse: 'new: chem.energy kind levels (tools/explain/visuals/chem-gc.js)',
      alt: 'An enthalpy ladder: 2 A at 0, 2 B at -100 kJ, and C at -70 kJ. Arrows step from 2 A down 100 kJ (step 1 doubled) and back up 30 kJ (step 2); an outlined arrow from 2 A straight to C reads -70 kJ.',
      caption: 'Follow the two small arrows, down then up. The outlined arrow is their sum: where C sits from 2 A.'
    },
    demoPick: '-20 kJ',
    flags: [
      { kind: 'stem-style', text: 'The stem tells the student to multiply step 1 by 2 and add, the whole Hess move. Suggested wording for Thomas to review (not applied): drop the parenthetical so the item tests the move. Key unchanged.' }
    ]
  },

  /* =============================== The mole bridge =============================== */
  {
    qid: 'fm:generated:gc-atoms-count#xz6wsz',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.stoichiometry.moles',
    difficulty: band(2),
    source: src('generated:gc-atoms-count#xz6wsz', 43),
    keyText: '2.41 × 10²⁴',
    answer: { line: '16 g of CH4 is 1 mol, with 4 H per molecule: 4 mol of H atoms, or 2.41 x 10^24 of them.' },
    steps: [
      'Convert grams to moles first: 16 g / 16 g per mol = 1 mol of CH4.',
      'Count H per molecule: each CH4 holds 4, so 1 mol of CH4 holds 4 mol of H atoms.',
      'Turn moles into atoms: 4 x 6.02 x 10^23 = 2.41 x 10^24. The count must grow.'
    ],
    choices: [
      { text: '4', role: 'trap', family: 'one-step-short', trap: 'Stopped at moles', note: '4 is the moles of H atoms, and the H count in one molecule. One more step turns moles into atoms: x 6.02 x 10^23.' },
      { text: '9.63 × 10²⁴', role: 'trap', family: 'unit-slip', trap: 'Grams used as moles', note: '16 x 6.02 x 10^23 treats 16 g as 16 mol. Divide by the molar mass first: 16 g is 1 mol.' },
      { text: '1.51 × 10²³', role: 'trap', family: 'operation-flip', trap: 'Divided by 4', note: 'This divides by 4 instead of multiplying. Each molecule carries 4 H, so there are more atoms than molecules.' },
      { text: '6.02 × 10²³', role: 'trap', family: 'other-unit', trap: 'Counted molecules', note: '6.02 x 10^23 is the number of CH4 molecules. The stem asks for H atoms, 4 in each.' },
      { text: '2.41 × 10²⁴', role: 'key', note: '4 mol of H atoms x 6.02 x 10^23.' }
    ],
    lockIt: 'Grams to moles, moles to molecules, then multiply by the atoms each molecule holds.',
    hook: null,
    playWith: hub('mole-conv', 'Mole Conversions module: pick a compound, type its grams, and climb from moles to particles', ["visualType:'mole-ladder'", 'moleSet'], 'CH4 is not one of the module\'s compounds (tool-gap flag).'),
    video: { slot: 'gc.stoichiometry.moles', title: 'From grams to atoms', id: null, start: null },
    visual: {
      type: 'chem.ledger',
      focus: 'atoms-box',
      chain: [
        { value: 16, display: '16 g', unit: 'CH4' },
        { op: '/', by: 16, label: 'divide by 16 g per mol', value: 1, display: '1 mol', unit: 'CH4 molecules' },
        { op: 'x', by: 4, label: 'x 4 H per CH4', value: 4, display: '4 mol', unit: 'H atoms' },
        { op: 'x', by: 6.02e23, label: 'x 6.02 x 10^23 per mol', value: 2.408e24, display: '2.41 x 10^24', unit: 'H atoms', key: true, choice: '2.41 × 10²⁴' }
      ],
      exits: [
        { at: 1, label: 'Times 6.02 x 10^23 from here counts molecules: 6.02 x 10^23', choice: '6.02 × 10²³' },
        { at: 2, label: 'Stop here and 4 is moles of H, not a count of atoms', choice: '4' }
      ],
      verify: { vars: { g: 16, M: 16, NA: 6.02e23 }, key: 'g/M*4*NA', routes: [{ choice: '4', expr: 'g/M*4' }, { choice: '9.63 × 10²⁴', expr: 'g*NA' }, { choice: '1.51 × 10²³', expr: 'g/M*6.022e23/4' }, { choice: '6.02 × 10²³', expr: 'g/M*NA' }] },
      reuse: 'new: chem.ledger chain block (tools/explain/visuals/chem-gc.js); the build recomputes every link',
      alt: 'A conversion chain: 16 g of CH4, divided by 16 g per mol, gives 1 mol of molecules; times 4 H per molecule gives 4 mol of H atoms; times Avogadro\'s number gives 2.41 x 10 to the 24 H atoms, outlined. Side notes mark where stopping early gives 4, or one mole of molecules.',
      caption: 'Walk the chain top to bottom. The dashed notes show where two of the traps stop short.'
    },
    demoPick: '6.02 × 10²³',
    flags: [
      { kind: 'stem-style', text: 'The stem capitalizes ATOMS for emphasis. Suggested wording for Thomas to review (not applied): "How many hydrogen atoms are in 16 g of CH4?" in plain case. Key unchanged.' },
      { kind: 'bank-copy', text: 'The bank trap notes capitalize MORE and MOLECULES for emphasis. Coach view only; bank text untouched.' },
      { kind: 'tool-gap', text: 'The Mole Conversions module offers H2O, CO2, NaCl, glucose, NH3 and O2 but not CH4, and it stops at molecules. An atoms-per-molecule step and CH4 would make this the exact play-with state.' }
    ]
  },
  {
    qid: 'fm:generated:gc-limiting#6s11gt',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.stoichiometry.limiting-reactant',
    difficulty: band(2),
    source: src('generated:gc-limiting#6s11gt', 51),
    keyText: '4 mol',
    answer: { line: 'Ask what each reactant could make. H2 runs out after 4 mol of NH3, so 4 mol is the most that can form.' },
    steps: [
      'Ask each reactant what it could make. 4 mol N2 x 2 NH3 per N2 = 8 mol NH3.',
      'Now H2: 6 mol H2 x 2 NH3 per 3 H2 = 4 mol NH3.',
      'The smaller one wins. H2 runs out first, so 4 mol NH3 forms and some N2 is left over.'
    ],
    choices: [
      { text: '10 mol', role: 'trap', family: 'operation-flip', trap: 'Added the reactants', note: '4 + 6 adds the reactant moles. Moles are not conserved through a reaction; the mole ratio decides.' },
      { text: '2 mol', role: 'trap', family: 'one-step-short', trap: 'Stopped at 6 / 3', note: '6 / 3 = 2 is the H2 moles per coefficient, one step from the answer. Multiply by NH3\'s coefficient, 2.' },
      { text: '8 mol', role: 'trap', family: 'reversed', trap: 'N2 as the limit', note: '8 mol is what the N2 could make. H2 runs out long before that, so N2 is the reactant in excess.' },
      { text: '4 mol', role: 'key', note: 'H2 runs out first: 6 x 2/3 = 4 mol.' },
      { text: '5 mol', role: 'trap', family: 'miscount', trap: 'No single rule', note: 'No ratio from this equation gives 5. Compare what each reactant can make: 8 and 4.' }
    ],
    lockIt: 'Limiting reactant: find what each reactant could make. The smaller amount is the yield.',
    hook: null,
    playWith: hub('lim-react', 'Limiting Reactant module: set 4 mol with coefficient 1 and 6 mol with coefficient 3, and see which runs out', ["visualType:'limrxn-bars'", 'limUpdate']),
    video: { slot: 'gc.stoichiometry.limiting-reactant', title: 'Limiting reactant: what each one can make', id: null, start: null },
    visual: {
      type: 'chem.ledger',
      focus: 'shorter-bar',
      bars: { title: 'What each reactant could make', max: 9, rows: [
        { label: 'From 4 mol N2: 4 x 2', value: 8, display: '8 mol NH3', choice: '8 mol' },
        { label: 'From 6 mol H2: 6 x 2/3', value: 4, display: '4 mol NH3', key: true, choice: '4 mol' }
      ], markAt: 4, markLabel: 'H2 runs out here' },
      verify: { vars: { N2: 4, H2: 6 }, key: 'H2*2/3', routes: [{ choice: '10 mol', expr: 'N2+H2' }, { choice: '2 mol', expr: 'H2/3' }, { choice: '8 mol', expr: 'N2*2' }], noRoute: [{ choice: '5 mol' }] },
      reuse: 'new: chem.ledger bars block (tools/explain/visuals/chem-gc.js); bar lengths to scale',
      alt: 'Two bars for what each reactant could make: 4 mol of N2 could make 8 mol of NH3, and 6 mol of H2 could make only 4 mol, outlined, where a dashed line marks that H2 runs out.',
      caption: 'Compare the bar lengths. The shorter bar is the reactant that runs out, and it sets the yield.'
    },
    demoPick: '8 mol',
    flags: [
      { kind: 'stem-style', text: 'The stem is the equation on its own line, then "If 4 mol of N2 reacts with 6 mol of H2, how many moles of NH3 can form?" Fine for the DAT look; no rewording asked.' },
      { kind: 'bank-copy', text: 'The bank trap note on 5 mol is the generic "Arithmetic slip", and the note on 8 mol capitalizes EXCESS. Coach view only; bank text untouched.' },
      { kind: 'note', text: 'Concept-first rule: 5 mol has no misconception behind it (the note says so). A rewrite candidate drawn from a real misconception, such as 12 mol from 4 mol N2 x 3; key unchanged.' }
    ]
  },
  {
    qid: 'fm:gchem-b:GC_mc-h1',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.stoichiometry.moles',
    difficulty: band(3),
    source: src('gchem-b:GC_mc-h1', 58),
    keyText: '3.0 × 10²³',
    answer: { line: '4.50 g of water is a quarter mole of molecules, each carrying 2 H, so half a mole of H atoms: 3.0 x 10^23.' },
    steps: [
      'Convert grams to moles: 4.50 g / 18.0 g per mol = 0.250 mol of H2O.',
      'Count H per molecule: 2. So 0.250 mol of water holds 0.500 mol of H atoms.',
      'Turn moles into atoms: 0.500 x 6.02 x 10^23 = 3.0 x 10^23.'
    ],
    choices: [
      { text: '6.0 × 10²³', role: 'trap', family: 'miscount', trap: 'A full mole', note: '6.0 x 10^23 is one whole mole of atoms. 4.50 g of water holds only half a mole of H.' },
      { text: '1.5 × 10²⁴', role: 'trap', family: 'unit-slip', trap: 'Power of ten off', note: 'This reads like the molecule count, 1.5 x 10^23, with its power of ten pushed up by one. Recheck the exponent at the last step.' },
      { text: '3.0 × 10²³', role: 'key', note: '0.500 mol of H atoms x 6.02 x 10^23.' },
      { text: '9.0 × 10²³', role: 'trap', family: 'miscount', trap: 'No single rule', note: 'No single slip gives 9.0 x 10^23; it would need 1.5 mol of H. Follow the chain: 0.250 mol of water, then 0.500 mol of H.' },
      { text: '1.5 × 10²³', role: 'trap', family: 'other-unit', trap: 'Counted molecules', note: '1.5 x 10^23 is the number of water molecules. Each holds 2 H atoms, so double it.' }
    ],
    lockIt: 'Count atoms per molecule before Avogadro: water carries 2 H, so double the molecule count.',
    hook: null,
    playWith: hub('mole-conv', 'Mole Conversions module: H2O is preset; type 4.5 g and read the moles and the molecules', ["visualType:'mole-ladder'", 'moleSet']),
    video: { slot: 'gc.stoichiometry.moles', title: 'From grams to atoms', id: null, start: null },
    visual: {
      type: 'chem.ledger',
      focus: 'atoms-box',
      chain: [
        { value: 4.5, display: '4.50 g', unit: 'H2O' },
        { op: '/', by: 18, label: 'divide by 18.0 g per mol', value: 0.25, display: '0.250 mol', unit: 'H2O molecules' },
        { op: 'x', by: 2, label: 'x 2 H per H2O', value: 0.5, display: '0.500 mol', unit: 'H atoms' },
        { op: 'x', by: 6.022e23, label: 'x 6.02 x 10^23 per mol', value: 3.011e23, display: '3.0 x 10^23', unit: 'H atoms', key: true, choice: '3.0 × 10²³' }
      ],
      exits: [{ at: 1, label: 'Times 6.02 x 10^23 from here counts molecules: 1.5 x 10^23', choice: '1.5 × 10²³' }],
      verify: { vars: { g: 4.5, M: 18, NA: 6.022e23 }, key: 'g/M*2*NA', routes: [{ choice: '1.5 × 10²³', expr: 'g/M*NA' }, { choice: '6.0 × 10²³', expr: 'NA' }, { choice: '1.5 × 10²⁴', expr: 'g/M*NA*10' }], noRoute: [{ choice: '9.0 × 10²³' }] },
      reuse: 'new: chem.ledger chain block (tools/explain/visuals/chem-gc.js); the build recomputes every link',
      alt: 'A conversion chain: 4.50 g of water, divided by 18.0 g per mol, gives 0.250 mol of molecules; times 2 H per molecule gives 0.500 mol of H atoms; times Avogadro\'s number gives 3.0 x 10 to the 23 H atoms, outlined. A side note marks the molecule count, 1.5 x 10 to the 23.',
      caption: 'The middle step, 2 H per water, is the one the traps skip. Follow the chain through it.'
    },
    demoPick: '1.5 × 10²³',
    flags: [
      { kind: 'bank-copy', text: 'The bank explanation calls the factor of 2 "the most common error point"; there is no data behind it, and this explainer does not repeat it. Bank text untouched.' },
      { kind: 'note', text: 'Concept-first rule: 9.0 x 10^23 has no single-slip route (the note says so). A rewrite candidate drawn from a real misconception, such as 4.5 x 10^23 from three atoms per molecule; key unchanged.' }
    ]
  },
  {
    qid: 'fm:generated:gc-molecular-formula#13jl0t8',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.stoichiometry.formulas',
    difficulty: band(2),
    source: src('generated:gc-molecular-formula#13jl0t8', 62),
    keyText: 'C₂H₄O₂',
    answer: { line: 'One CH2O unit weighs 30 g/mol and the molecule weighs 60, so it holds two units: C2H4O2.' },
    steps: [
      'Find the empirical unit\'s mass first: CH2O is 12 + 2 + 16 = 30 g/mol.',
      'Divide the molar mass by it: 60 / 30 = 2 units per molecule.',
      'Multiply every subscript by 2: C2H4O2. That is acetic acid.'
    ],
    choices: [
      { text: 'C₅H₁₀O₅', role: 'trap', family: 'miscount', trap: 'Five units', note: 'C5H10O5 weighs 150, five CH2O units, a sugar like ribose. 60 g/mol holds only two.' },
      { text: 'C₂H₄O₂', role: 'key', note: 'Two CH2O units: 2 x 30 = 60.' },
      { text: 'CH₂O', role: 'trap', family: 'one-step-short', trap: 'Stopped at the unit', note: 'CH2O is the empirical formula itself, 30 g/mol. The molecule weighs 60, so the multiplier is still owed.' },
      { text: 'C₄H₈O₄', role: 'trap', family: 'one-step-too-far', trap: 'Doubled twice', note: 'C4H8O4 weighs 120, four units. Doubling once gives 60; doubling again overshoots.' },
      { text: 'C₃H₆O₃', role: 'trap', family: 'miscount', trap: 'Three units', note: 'C3H6O3 weighs 90, three units, the formula of lactic acid. Divide 60 by 30 to get the count.' }
    ],
    lockIt: 'Molecular formula = empirical formula x (molar mass / empirical mass).',
    hook: null,
    playWith: hub('tool-mw', 'Molar Mass Calculator: type CH2O, then C2H4O2, and compare the two weights', ['id="tool-mw"', 'mwCalc']),
    video: { slot: 'gc.stoichiometry.formulas', title: 'Empirical to molecular formula', id: null, start: null },
    visual: {
      type: 'chem.ledger',
      focus: 'two-units',
      formulas: {
        title: 'CH2O units stacked against 60 g/mol', unitMass: 30, molarMass: 60,
        rows: [
          { n: 1, formula: 'CH_{2}O', mass: 30, choice: 'CH₂O' },
          { n: 2, formula: 'C_{2}H_{4}O_{2}', mass: 60, key: true, choice: 'C₂H₄O₂' },
          { n: 3, formula: 'C_{3}H_{6}O_{3}', mass: 90, choice: 'C₃H₆O₃' },
          { n: 4, formula: 'C_{4}H_{8}O_{4}', mass: 120, choice: 'C₄H₈O₄' },
          { n: 5, formula: 'C_{5}H_{10}O_{5}', mass: 150, choice: 'C₅H₁₀O₅' }
        ],
        targetLabel: '60 g/mol', unitLabel: 'one block = one CH2O unit, 30 g/mol'
      },
      reuse: 'new: chem.ledger formulas block (tools/explain/visuals/chem-gc.js); the build weighs every formula',
      alt: 'Five rows of stacked CH2O blocks, from one block to five, weighing 30, 60, 90, 120 and 150 g/mol. A dashed line marks 60 g/mol, the stem\'s molar mass, and the two-block row, C2H4O2, is outlined.',
      caption: 'Each block is one CH2O unit. Only the row that ends exactly on the 60 g/mol line is the molecule.'
    },
    demoPick: 'C₄H₈O₄',
    flags: [
      { kind: 'bank-copy', text: 'The bank trap note on C5H10O5 opens "Wrong multiplier.", which the house rule bars. Coach view only; bank text untouched.' }
    ]
  },

  /* ================== The quantum address, plus nuclear ================== */
  {
    qid: 'fm:gchem-b:GC_at-h1',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.atomic.electron-configuration',
    difficulty: band(3),
    source: src('gchem-b:GC_at-h1', 47),
    keyText: 'Ca²⁺ (Z = 20)',
    answer: { line: 'Every choice holds 18 electrons, so all five match argon. Only Ca^2+ also carries a +2 charge.' },
    steps: [
      'Count electrons as Z minus charge for every choice: Ca^2+ 20 - 2, Sc^3+ 21 - 3, Cl^- 17 + 1, S^2- 16 + 2, K^+ 19 - 1. All 18.',
      'So isoelectronic does not decide it. All five match argon\'s 18.',
      'Read the second condition: a +2 charge. Only Ca^2+ is both.'
    ],
    choices: [
      { text: 'Ca²⁺ (Z = 20)', role: 'key', note: '20 protons, 18 electrons: +2.' },
      { text: 'Sc³⁺ (Z = 21)', role: 'trap', family: 'half-right', trap: 'Right count, +3', note: 'Sc^3+ does have 18 electrons, so it matches argon. Its charge is +3, not +2.' },
      { text: 'Cl⁻ (Z = 17)', role: 'trap', family: 'half-right', trap: 'Right count, -1', note: 'Cl^- gains one electron to reach 18. Its charge is -1, not +2.' },
      { text: 'S²⁻ (Z = 16)', role: 'trap', family: 'sign-slip', trap: 'A 2, but negative', note: 'S^2- matches argon and carries a 2, which pulls. The sign is negative; the stem asks for +2.' },
      { text: 'K⁺ (Z = 19)', role: 'trap', family: 'half-right', trap: 'Right count, +1', note: 'K^+ loses one electron to reach 18. Its charge is +1, not +2.' }
    ],
    lockIt: 'Electrons = Z minus charge. Isoelectronic means equal electrons, so check the charge separately.',
    hook: null,
    playWith: hub('atomic', 'Atomic Structure module: pick Ca, press +2, and count the electrons left', ["visualType:'atom-builder'", 'atomSetCharge']),
    video: { slot: 'gc.atomic.electron-configuration', title: 'Electron counts and isoelectronic ions', id: null, start: null },
    visual: {
      type: 'chem.orbital',
      focus: 'charge-column',
      title: 'Argon count: 18 electrons, [Ne] 3s^2 3p^6',
      config: [{ sub: '1s', boxes: 1, e: 2 }, { sub: '2s', boxes: 1, e: 2 }, { sub: '2p', boxes: 3, e: 6 }, { sub: '3s', boxes: 1, e: 2 }, { sub: '3p', boxes: 3, e: 6 }],
      columns: ['Ion', 'Z', 'Charge', 'Electrons', '+2 and 18?'],
      ions: [
        { name: 'Ca^2+', Z: 20, charge: 2, key: true, note: 'yes', choice: 'Ca²⁺ (Z = 20)' },
        { name: 'Sc^3+', Z: 21, charge: 3, note: 'no', choice: 'Sc³⁺ (Z = 21)' },
        { name: 'K^+', Z: 19, charge: 1, note: 'no', choice: 'K⁺ (Z = 19)' },
        { name: 'Cl^-', Z: 17, charge: -1, note: 'no', choice: 'Cl⁻ (Z = 17)' },
        { name: 'S^2-', Z: 16, charge: -2, note: 'no', choice: 'S²⁻ (Z = 16)' }
      ],
      electrons: 18, charge: 2,
      reuse: 'new: chem.orbital boxes and ion table (tools/explain/visuals/chem-gc.js); the build recomputes Z minus charge for every row',
      alt: 'Orbital boxes for 18 electrons, filled through 3s and 3p, the argon configuration. Below, a table lists each choice with Z, charge and electrons: every ion has 18, and only Ca2+, outlined, carries +2.',
      caption: 'Read the electrons column first: all 18. Then read the charge column for the one +2.'
    },
    demoPick: 'S²⁻ (Z = 16)',
    flags: [
      { kind: 'stem-style', text: 'The stem capitalizes BOTH and AND for emphasis. Suggested wording for Thomas to review (not applied): plain case, "Which ion is isoelectronic with Ar and carries a +2 charge?" Key unchanged.' },
      { kind: 'bank-copy', text: 'The bank explanation names only K+ and S2- as the other 18-electron species and says they are "failing the +2 requirement", which the house rule bars. Sc3+ and Cl- also have 18 electrons; the picture shows all five at 18 so the charge decides. Coach view only; bank text untouched.' }
    ]
  },

  /* ============ The two questions: measurement and the lab ============ */
  {
    qid: 'fm:gchem-b:GC_sf-e2',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.lab.sig-figs',
    difficulty: band(2),
    source: src('gchem-b:GC_sf-e2', 67),
    keyText: '6.0',
    answer: { line: 'A product keeps the fewest sig figs of its inputs. 4.0 has two, so 6 is written 6.0.' },
    steps: [
      'Count each input first: 1.50 has 3 sig figs, 4.0 has 2.',
      'Multiply: 1.50 x 4.0 = 6. Then keep the fewest, 2.',
      'Write 6 with two sig figs: 6.0. The zero after the point counts.'
    ],
    choices: [
      { text: '6', role: 'trap', family: 'unit-slip', trap: 'Dropped the zero', note: '6 alone shows one sig fig. The answer needs two, so the zero after the point stays.' },
      { text: '6.0', role: 'key', note: 'Two sig figs, from 4.0.' },
      { text: '6.00', role: 'trap', family: 'reversed', trap: 'Kept the most', note: '6.00 keeps three, the count of 1.50. A product keeps the fewest, which is 4.0\'s two.' },
      { text: '6.000', role: 'trap', family: 'miscount', trap: 'Four sig figs', note: 'Four sig figs matches no input and no rule. The fewest input count is two.' },
      { text: '6.0000', role: 'trap', family: 'operation-flip', trap: 'Added the counts', note: 'Five sig figs comes from adding 3 + 2. Multiplying keeps the smaller count; it never adds them.' }
    ],
    lockIt: 'Multiply or divide: keep the fewest sig figs. Add or subtract: keep the fewest decimal places.',
    hook: null,
    playWith: hub('tool-sigfig', 'Sig Figs tool: type 1.50, 4.0 and 6.0 and read each count', ['id="tool-sigfig"', 'sfCalc']),
    video: { slot: 'gc.lab.sig-figs', title: 'Significant figures in products', id: null, start: null },
    visual: {
      type: 'chem.ledger',
      focus: 'two-sig-figs',
      sigfigs: [
        { text: '1.50', sf: 3, input: true, note: 'input' },
        { text: '4.0', sf: 2, input: true, note: 'input: the fewest' },
        { rule: 'Multiply: keep the fewest, 2' },
        { text: '6', sf: 1, note: 'one too few', choice: '6' },
        { text: '6.0', sf: 2, key: true, note: 'matches 4.0', choice: '6.0' },
        { text: '6.00', sf: 3, note: 'kept the most', choice: '6.00' },
        { text: '6.000', sf: 4, choice: '6.000' },
        { text: '6.0000', sf: 5, note: '3 + 2 added', choice: '6.0000' }
      ],
      reuse: 'new: chem.ledger sigfigs block (tools/explain/visuals/chem-gc.js); the build counts every number\'s sig figs',
      alt: 'Each number drawn as digit boxes with the significant digits filled: 1.50 has 3 and 4.0 has 2, the fewest. Below, 6, 6.0, 6.00, 6.000 and 6.0000 show 1 to 5 sig figs, and 6.0, with 2, is outlined.',
      caption: 'Count the filled boxes. The answer row has to match the input with the fewest.'
    },
    demoPick: '6.00',
    flags: [
      { kind: 'stem-style', text: 'The stem capitalizes FEWEST, states the rule and gives each input\'s sig fig count, which gives the answer away. Suggested wording for Thomas to review (not applied): "Calculate 1.50 x 4.0 and report it with the correct number of significant figures." Key unchanged.' }
    ]
  },

  /* ============================ Why atoms bond ============================ */
  {
    qid: 'fm:gchem-b:GC_lw-e10',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.bonding.lewis.lone-pairs',
    difficulty: band(3),
    source: src('gchem-b:GC_lw-e10', 41),
    keyText: '2',
    answer: { line: 'Cl brings 7 valence electrons, spends 3 on the Cl-F bonds, and keeps 4 as two lone pairs.' },
    steps: [
      'Count the central atom first. Cl is in group 17, so it brings 7 valence electrons.',
      'Spend them on bonds: three Cl-F single bonds use 3 of the 7, leaving 4.',
      'Pair them up: 4 electrons make 2 lone pairs. Three bonds plus two pairs is five domains, with the pairs equatorial: a T.'
    ],
    choices: [
      { text: '0', role: 'trap', family: 'one-step-short', trap: 'Counted only bonds', note: 'With no lone pairs ClF3 would be a flat triangle, like BF3. Cl has 4 electrons left after bonding.' },
      { text: '1', role: 'trap', family: 'neighbor-fact', trap: 'One-pair shapes', note: 'One lone pair goes with the seesaw of SF4, or the pyramid of NH3. A T shape takes two.' },
      { text: '2', role: 'key', note: '7 - 3 = 4 electrons = 2 pairs.' },
      { text: '3', role: 'trap', family: 'neighbor-fact', trap: 'Read a fluorine', note: 'Three lone pairs sit on each F, or on Xe in linear XeF2. The stem asks about the central Cl.' },
      { text: '4', role: 'trap', family: 'other-unit', trap: 'Electrons, not pairs', note: '4 is the leftover electron count. Two electrons make one pair, so 4 electrons are 2 pairs.' }
    ],
    lockIt: 'Lone pairs on the center = (its valence electrons - one per bond) / 2.',
    hook: 'Three bonds plus two pairs: T-shaped.',
    playWith: hub('vsepr-predictor', 'VSEPR Predictor: set 3 bonded atoms and 2 lone pairs and read the T shape', ['id="vsprBonded"', 'id="vsprLP"']),
    video: { slot: 'gc.bonding.lewis.lone-pairs', title: 'Counting lone pairs on the central atom', id: null, start: null },
    visual: {
      type: 'chem.lewis',
      focus: 'central-lone-pairs',
      molecule: {
        id: 'clf3', formula: 'ClF3', name: 'Chlorine trifluoride', charge: 0, totalValenceElectrons: 28, centralAtom: 'Cl',
        bondPattern: [{ atomA: 'Cl', atomB: 'F1', order: 1 }, { atomA: 'Cl', atomB: 'F2', order: 1 }, { atomA: 'Cl', atomB: 'F3', order: 1 }],
        lonePairCounts: { Cl: 2, F1: 3, F2: 3, F3: 3 },
        electronGeometry: 'trigonal-bipyramidal', molecularGeometry: 'T-shape'
      },
      layoutAngles: [180, 0, 90],
      centralPairAngles: [225, 315],
      pairLabelSide: 'top',
      spreadTerminalPairs: true,
      fit: true,
      ledger: { atom: 'Cl', valence: 7, inBonds: 3, extra: [{ label: 'Domains: 3 bonds + 2 lone pairs', value: '5' }] },
      reuse: 'Copy of the Lewis sandbox layout and drawing functions (tools/gc/lewis-sandbox.html), with the T drawn as F left, right and below and both pairs above',
      alt: 'Lewis structure of ClF3: chlorine in the center with single bonds to fluorines on the left, right and below, each fluorine holding three lone pairs, and two outlined lone pairs on chlorine above. A ledger reads 7 valence electrons, 3 in bonds, 4 left over, 2 lone pairs, 5 domains.',
      caption: 'The two outlined pairs are the answer. With three bonds they make five domains, which bends ClF3 into a T.'
    },
    demoPick: '4',
    flags: [
      { kind: 'stem-style', text: 'The stem gives 7 valence electrons, 3 bonds and the trigonal bipyramid, which hands over the count. Suggested wording for Thomas to review (not applied): "How many lone pairs are on the central atom of ClF3?" Key unchanged.' }
    ]
  },
  {
    qid: 'fm:gchem-a:b-e7',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.bonding.imf',
    difficulty: band(2),
    source: src('gchem-a:b-e7', 63),
    keyText: 'Stronger H-bonding in HF',
    answer: { line: 'H on F lets HF molecules hydrogen bond. That pull is far stronger than the extra London force HCl gets from its extra electrons.' },
    steps: [
      'Name the strongest force in each liquid first. HF has H bonded to F, so it hydrogen bonds; HCl has only dipole-dipole and London forces.',
      'Weigh the trade. HCl is heavier, so its London forces are bigger, but a hydrogen bond outweighs that gain.',
      'More pull between molecules means more heat to separate them: HF boils near 20 degrees C, HCl near -85.'
    ],
    choices: [
      { text: 'Metallic bonding', role: 'trap', family: 'neighbor-fact', trap: 'Bonding in metals', note: 'Metallic bonding holds metals together with a shared sea of electrons. HF and HCl are small molecules.' },
      { text: 'HF has stronger London forces', role: 'trap', family: 'reversed', trap: 'London forces swapped', note: 'London forces grow with electron count, so HCl has the stronger ones. HF wins on hydrogen bonding instead.' },
      { text: 'Stronger H-bonding in HF', role: 'key', note: 'Hydrogen bonds outweigh HCl\'s extra London force.' },
      { text: 'HCl is ionic', role: 'trap', family: 'other-conditions', trap: 'Ionizes only in water', note: 'HCl splits into ions when dissolved in water. Pure HCl is a polar covalent molecule.' },
      { text: 'HF is denser', role: 'trap', family: 'neighbor-fact', trap: 'Density is not a cause', note: 'Density does not set a boiling point. How hard the molecules pull on each other does.' }
    ],
    lockIt: 'H on N, O or F means hydrogen bonding, which beats a heavier molecule\'s extra London forces.',
    hook: null,
    playWith: hub('imf-rank', 'Intermolecular Forces module: rank molecules by boiling point, then check to see the forces behind the order', ["visualType:'imf-rank'", 'imfCheck']),
    video: { slot: 'gc.bonding.imf', title: 'Intermolecular forces and boiling points', id: null, start: null },
    visual: {
      type: 'chem.ledger',
      focus: 'hydrogen-bond',
      imf: { pairs: [
        { title: 'HF', x: 'F', hbond: true, force: 'hydrogen bond', bp: 'boils near 20 degrees C', key: true, choice: 'Stronger H-bonding in HF' },
        { title: 'HCl', x: 'Cl', big: true, hbond: false, force: 'dipole-dipole only', bp: 'boils near -85 degrees C' }
      ] },
      note: 'HCl has more electrons, so more London force. The hydrogen bond in HF still wins.',
      reuse: 'new: chem.ledger imf block (tools/explain/visuals/chem-gc.js): two molecule pairs and the force between them',
      alt: 'Two rows of molecule pairs. HF, outlined: H-F next to H-F with a bold dashed hydrogen bond between the F of one and the H of the next; it boils near 20 degrees C. HCl: H-Cl next to H-Cl with only a faint dipole-dipole link; it boils near -85 degrees C.',
      caption: 'Compare the links between molecules. The bold hydrogen bond in HF takes more heat to break than the faint pull in HCl.'
    },
    demoPick: 'HF has stronger London forces',
    flags: [
      { kind: 'stem-style', text: 'The stem abbreviates boiling point as "BP". Suggested wording for Thomas to review (not applied): "Why does HF boil at a higher temperature than HCl, even though HCl is heavier?" Key unchanged.' }
    ]
  }
];

module.exports = { group: 'G1', batch: 'B003', title: 'Full-Length Test 1, General Chemistry (30 items)', entries: ENTRIES };
