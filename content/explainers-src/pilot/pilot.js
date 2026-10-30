// content/explainers-src/pilot/pilot.js: the 18-question pilot, as the first
// batch built by scripts/explainers/build.mjs. Written in Thomas's coaching
// voice (docs/release-2026-10-30/questions/voice-codex.md) and revised (v3) for
// every problem the three subject experts verified.
//
// Authoring source, never published: /content/explainers-src/* is
// force-redirected in netlify.toml and _redirects, like /docs/*. The build
// copies student fields into content/explainers/ and coach fields (flags,
// changes, demo pick, gate results) into docs/explainers/ only.
//
// The build checks every entry against the real bank (key text, every choice
// text, stem hash, aliases and their premises), runs the copy rules, recomputes
// what it can (PAT answers and slip counts, titration points, trend values,
// Bayes counts, RDKit SMILES, CIP labels and stereo relations, RC quotes and
// proof lines), and scans play-with targets.
// Copy rules: plain ASCII, no em dashes, never "wrong", "incorrect" or "failed",
// never a choice letter (choices are matched by their text). Display markup:
// x^2 and K_a are typeset by the player; the source stays ASCII.
// Choice fields: text (exact bank text), display (how the explainer names a
// structure or figure choice), role, family (closed list,
// scripts/explainers/families.js), trap (optional display label in the coach's
// words), note. Coach-only fields: flags, demoPick (the pick the preview shows).
'use strict';

const PAT_TEST = 'F20261001'; // Full-Length Test 1 PAT seed (tools/mock/data/full-mocks.js mocks[0].pat.seed)

const ENTRIES = [
  /* ============================ BIOLOGY ============================ */
  {
    pid: 'BIO-1',
    qid: 'fm:bio:BIO_g011',
    premises: ['recessive', 'Hardy-Weinberg'],
    servesAlso: [
      { qid: 'pool:BIO_g011', relation: 'same problem, shorthand stem, 4 of these 5 choices (also games/bio.json)', reviewed: false }
    ],
    section: 'bio',
    subtopic: 'bio.genetics.hardy-weinberg',
    difficulty: { band: 2, from: 'bank field d (1-3)' },
    source: { bank: 'tools/mock/data/full-mocks.js', global: 'ACE_FULL_MOCKS', locator: { mock: 'FULL_1', section: 'bio', id: 'bio:BIO_g011' }, servedAs: 'Full-Length Test 1, Natural Sciences, question 1' },
    keyText: '0.01',
    answer: { line: 'One allele in 100 is recessive. Affected people are q squared, so the allele is the square root.' },
    steps: [
      'Read the word affected first. A recessive disorder only shows in aa people, so 1 in 10,000 is q squared. Not q.',
      'Write it as a decimal: q squared = 0.0001. Undo the square: q = 0.01. Check it: 0.01 x 0.01 = 0.0001.',
      'Stop where the stem stops. It asks for q, so you are done. Carriers would be the next step: 2pq, about 1 in 50.'
    ],
    choices: [
      { text: '0.0001', role: 'trap', family: 'other-question', note: 'This is q squared, the share of people who are affected. It pulls because it is the number the stem hands you. The stem asks for the allele.' },
      { text: '0.001', role: 'trap', family: 'unit-slip', trap: 'Decimal shift, not a root', note: 'Sliding the decimal point is not a square root. The root of 1 in 10,000 is 1 in 100.' },
      { text: '0.01', role: 'key', note: 'The square root of 0.0001: one allele in 100.' },
      { text: '0.1', role: 'trap', family: 'one-step-too-far', trap: 'Rooted twice', note: 'Rooting twice lands here: the root of 0.0001 is 0.01, and the root of that is 0.1. One root undoes one square.' },
      { text: '0.99', role: 'trap', family: 'one-step-too-far', note: 'This is p, which is 1 - q. Good math, but the stem stopped at q.' }
    ],
    lockIt: 'Affected recessives give you q squared. Take the square root to get the allele.',
    hook: 'People are squares. Alleles are roots.',
    playWith: { label: 'Hardy-Weinberg calculator: type 0.0001 into q squared and watch p, q and 2pq update', href: 'tools/bio/bio-genetics.html#node-hardy-weinberg', state: { visualizer: 'initHardyWeinberg', hwQ2: 0.0001 }, expect: ['initHardyWeinberg'], routing: 'The anchor works today. Setting q squared to 0.0001 needs a small state reader on the hub page.' },
    video: { slot: 'bio.genetics.hardy-weinberg', title: 'Hardy-Weinberg: from affected people to the allele', id: null, start: null },
    visual: {
      type: 'bio.hardy-weinberg',
      q2: 0.0001,
      show: ['allele-grid', 'ladder'],
      gridTitle: '100 alleles from the gene pool',
      focus: 'q',
      reuse: 'Pure port of the Hardy-Weinberg visualizer state (initHardyWeinberg / updateHW in tools/bio/bio-shared.js, inputs hwP and hwQ2)',
      alt: 'Left: a 10 by 10 grid of 100 alleles with one recessive allele shaded, so q is 1 in 100. Right: a ladder from q squared = 0.0001, 1 person in 10,000, through a square root to q = 0.01, the answer, then on to p = 0.99.',
      caption: 'Find the one shaded allele. Two of them have to meet to make one affected person.'
    },
    demoPick: '0.0001',
    flags: [
      { kind: 'bank-copy', text: 'Alias pool:BIO_g011 (scripts/dat-mock-bank.json, also games/bio.json) reads "1 in 10,000 affected. Allele frequency q = ?". It never says recessive or Hardy-Weinberg, and under a dominant reading 0.01 is not the answer. The alias is held: this explainer serves only the full-mock copy until the pool stem is reworded. Key unchanged.' }
    ]
  },
  {
    pid: 'BIO-2',
    qid: 'fm:written:bio-3-1rvt47w',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.cell.membrane.tonicity',
    difficulty: { band: 3, from: 'bank field d (1-3)' },
    source: { bank: 'tools/mock/data/full-mocks.js', global: 'ACE_FULL_MOCKS', locator: { mock: 'FULL_4', section: 'bio', id: 'written:bio-3-1rvt47w' }, servedAs: 'Full-Length Test 4, Natural Sciences, question 27' },
    keyText: 'It stays the same, because the outside is also 300 mOsm',
    answer: { line: '0.15 M NaCl is 300 mOsm, the same as the inside, so water has no net reason to move.' },
    steps: [
      'Count particles, not formula units. NaCl splits into Na+ and Cl-, so 0.15 M becomes 0.15 x 2 = 0.30 osmol per liter.',
      '0.30 osmol per liter is 300 mOsm. The inside is 300 mOsm too.',
      'Same on both sides is isotonic. Water still crosses, but equally both ways. No net flow, no change in volume.'
    ],
    choices: [
      { text: 'It stays the same, because the outside is also 300 mOsm', role: 'key', note: '0.15 M x 2 particles = 300 mOsm. A match for the inside.' },
      { text: 'It swells, because sodium enters and water follows it in', role: 'trap', family: 'other-conditions', trap: 'Moved the salt, not water', note: 'Swelling is what a solute that crosses, like urea, would cause. Na+ gets pumped back out, so it acts as if it stays outside, and 300 against 300 moves no water.' },
      { text: 'It shrinks, because 300 mOsm of NaCl outdraws the cytoplasm', role: 'trap', family: 'half-right', trap: 'Equal read as greater', note: 'The 300 is right. But 300 equals 300, and water only moves toward a difference.' },
      { text: 'It swells, because 150 mOsm outside is well below the 300 mOsm inside', role: 'trap', family: 'other-unit', trap: 'Counted units, not particles', note: '150 is the NaCl before it splits. Each unit gives two ions, so the outside is 300.' },
      { text: 'It shrinks, because 0.15 M NaCl comes to 600 mOsm', role: 'trap', family: 'one-step-too-far', trap: 'Doubled twice', note: 'NaCl gives two particles, not four. 0.15 x 2 = 0.30 osmol per liter, which is 300 mOsm.' }
    ],
    lockIt: 'Osmolarity is molarity times particles. Water moves only when the two sides differ.',
    hook: 'Count the ions: NaCl gives 2, CaCl2 gives 3, glucose gives 1.',
    playWith: { label: 'Tonicity simulator: set the outside to match the inside and watch the red cells hold their shape', href: 'tools/bio/bio-cell.html#node-membrane', state: { visualizer: 'initTonicity', cellType: 'animal', externalSolute: 50 }, expect: ['initTonicity'], routing: 'The anchor works today. The slider value needs a state reader.' },
    video: { slot: 'bio.cell.membrane.tonicity', title: 'Tonicity: count the particles first', id: null, start: null },
    visual: {
      type: 'stack',
      alt: 'Top: a tally turning 0.15 M NaCl into 0.15 M Na+ plus 0.15 M Cl-, 300 mOsm outside, next to 300 mOsm inside, an even balance. Bottom: a light microscope view of red blood cells in a matched solution, normal biconcave discs, with no net water flow.',
      caption: 'Count ions, then compare. Equal on both sides, so the cells keep their normal disc shape.',
      panels: [
        { type: 'bio.osmolarity', solute: { formula: 'NaCl', molarity: 0.15, ions: ['Na+', 'Cl-'] }, inside: 300, units: 'mOsm', reuse: 'new' },
        { type: 'bio.real', view: 'tonicity', params: { cellType: 'animal', externalSolute: 50 }, smallTextKnown: 'renderer-gap flag', reuse: 'BioReal.tonicity() in tools/bio/bio-real.js (externalSolute 50 = matched to the inside; viewBox 0 0 400 320 as in bio-shared.js)' }
      ]
    },
    demoPick: 'It swells, because 150 mOsm outside is well below the 300 mOsm inside',
    flags: [
      { kind: 'bank-copy', text: 'Bank trap note for the 600 mOsm choice reads "This multiplies by four, 0.15 M NaCl yields 0.30 osmol per liter." (a run-on). Wording only; key unchanged.' },
      { kind: 'true-to-life', text: 'Uses the BioReal red cell view. Per the decisions doc, Thomas signs off every true-to-life view.' },
      { kind: 'renderer-gap', text: 'BioReal.tonicity() draws its own labels (LIGHT MICROSCOPE, scale bar, solute strip) at about 9 px on a 390 px phone, because its 400-unit drawing is shown about 330 px wide. The fix belongs in tools/bio/bio-real.js (a phone layout or larger label sizes); the explainer caption carries the point meanwhile. This is the one known exception to the 12 px rule in the pilot.' }
    ]
  },
  {
    pid: 'BIO-3',
    qid: 'fm:written:bio-4-10vm1b1',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.cell.respiration.etc',
    difficulty: { band: 1, from: 'bank field d (1-3)' },
    source: { bank: 'tools/mock/data/full-mocks.js', global: 'ACE_FULL_MOCKS', locator: { mock: 'FULL_3', section: 'bio', id: 'written:bio-4-10vm1b1' }, servedAs: 'Full-Length Test 3, Natural Sciences, question 35' },
    keyText: 'Inner mitochondrial membrane',
    answer: { line: 'The chain builds a proton gradient, and only the inner membrane is tight enough to hold one.' },
    steps: [
      'Start from the job. The chain pumps H+ to build a gradient, and a gradient needs a wall protons cannot leak through.',
      'Only one membrane qualifies. The outer membrane is full of porins and leaks. The inner membrane is tight, and its folds, the cristae, hold complexes I to IV and ATP synthase.',
      'So all four complexes sit in the inner membrane. I, III and IV pump H+ from the matrix into the intermembrane space.'
    ],
    choices: [
      { text: 'Cytosol, alongside the glycolytic enzymes', role: 'trap', family: 'neighbor-fact', trap: 'Where glycolysis runs', note: 'Glycolysis runs in the cytosol, so it sounds close. The chain needs a sealed membrane, and the cytosol has none.' },
      { text: 'Intermembrane space', role: 'trap', family: 'neighbor-fact', trap: 'Where the protons go', note: 'H+ gets pumped into this space, which is why it pulls. The pumps sit in the membrane beside it.' },
      { text: 'Inner mitochondrial membrane', role: 'key', note: 'The one tight, folded membrane. The only place a gradient can be built and held.' },
      { text: 'Mitochondrial matrix', role: 'trap', family: 'neighbor-fact', trap: 'Where Krebs runs', note: 'The matrix holds most Krebs enzymes. The one exception, succinate dehydrogenase, is complex II, and it sits in the inner membrane too.' },
      { text: 'Outer mitochondrial membrane', role: 'trap', family: 'neighbor-fact', trap: 'Leaky membrane', note: 'Porins let small molecules through the outer membrane, so it cannot hold a proton gradient.' }
    ],
    lockIt: 'A gradient needs a tight membrane. In mitochondria, that is the inner membrane.',
    hook: 'Pumps in the wall, protons in the gap.',
    playWith: { label: 'Krebs and ETC node: follow NADH from the matrix to the complexes in the inner membrane', href: 'tools/bio/bio-cell.html#node-krebs', state: { node: 'krebs' }, expect: ['node-krebs'], routing: 'Works today.' },
    video: { slot: 'bio.cell.respiration.etc', title: 'Where each step of respiration happens', id: null, start: null },
    visual: {
      type: 'bio.diagram',
      diagram: 'mitochondrion',
      labels: ['cytosol', 'outer-membrane', 'intermembrane-space', 'inner-membrane', 'matrix'],
      focus: 'inner-membrane',
      extras: ['etc-complexes-I-IV', 'atp-synthase', 'proton-flow', 'proton-return-through-synthase'],
      reuse: 'new schematic (no pure mitochondrion renderer exists yet), styled to match the Cell hub',
      alt: 'A cutaway of a mitochondrion with all five places from the choices labeled: cytosol outside, outer membrane, intermembrane space, the folded inner membrane, and matrix. Complexes I to IV and ATP synthase sit in the inner membrane, which is outlined as the answer. Arrows show H+ pumped into the intermembrane space and flowing back through ATP synthase.',
      caption: 'Every place named in the choices, on one picture. Follow the H+ arrows: out through the pumps, back through ATP synthase.'
    },
    demoPick: 'Inner mitochondrial membrane',
    flags: []
  },

  /* ========================= GENERAL CHEMISTRY ========================= */
  {
    pid: 'GC-1',
    qid: 'fm:gchem-a:lw-e3',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.bonding.lewis.lone-pairs',
    difficulty: { band: 1, from: 'bank field d (1-3)' },
    source: { bank: 'tools/mock/data/full-mocks.js', global: 'ACE_FULL_MOCKS', locator: { mock: 'FULL_3', section: 'gc', id: 'gchem-a:lw-e3' }, servedAs: 'Full-Length Test 3, Natural Sciences, question 68' },
    keyText: '1',
    answer: { line: 'P brings 5 valence electrons, spends 3 on bonds, and keeps 2 as one lone pair.' },
    steps: [
      'Count the central atom first. P is in group 15, so it brings 5 valence electrons.',
      'Spend them on bonds. Three P-Cl single bonds use 3 of the 5.',
      'What is left becomes lone pairs: 5 - 3 = 2 electrons, which is 1 pair. That pair is why PCl3 is a pyramid and not flat.'
    ],
    choices: [
      { text: '0', role: 'trap', family: 'other-conditions', trap: 'Forgot the leftover pair', note: '0 fits BF3, where B brings only 3 electrons. P brings 5, so 2 are left after 3 bonds.' },
      { text: '1', role: 'key', note: '5 valence - 3 in bonds = 2 electrons = 1 pair.' },
      { text: '2', role: 'trap', family: 'other-unit', trap: 'Electrons, not pairs', note: '2 is the leftover electron count. Two electrons make one pair.' },
      { text: '3', role: 'trap', family: 'neighbor-fact', trap: 'Read an outer atom', note: '3 is the bonding pairs on P, and the lone pairs on each Cl. The stem asks for lone pairs on P.' },
      { text: '10', role: 'trap', family: 'one-step-too-far', trap: 'Counted the whole molecule', note: '9 pairs on the chlorines plus 1 on P is 10. Only the central atom was asked.' }
    ],
    lockIt: 'Central lone pairs = (valence electrons - one per bond) / 2.',
    hook: 'Three bonds plus one pair: NH3 and PCl3, same pyramid.',
    playWith: { label: 'Lewis sandbox: build NH3, the same three-bonds-plus-one-pair pattern', href: 'tools/gc/lewis-sandbox.html', state: { molecule: 'nh3' }, expect: ['layoutPositions'], routing: 'Page works today. PCl3 is not in tools/gc/lewis-molecules.json yet, and the sandbox has no URL parameter for the molecule.' },
    video: { slot: 'gc.bonding.lewis.lone-pairs', title: 'Counting lone pairs on the central atom', id: null, start: null },
    visual: {
      type: 'chem.lewis',
      molecule: {
        id: 'pcl3', formula: 'PCl3', name: 'Phosphorus trichloride', charge: 0, totalValenceElectrons: 26, centralAtom: 'P',
        bondPattern: [{ atomA: 'P', atomB: 'Cl1', order: 1 }, { atomA: 'P', atomB: 'Cl2', order: 1 }, { atomA: 'P', atomB: 'Cl3', order: 1 }],
        lonePairCounts: { P: 1, Cl1: 3, Cl2: 3, Cl3: 3 },
        electronGeometry: 'tetrahedral', molecularGeometry: 'trigonal-pyramidal'
      },
      focus: 'central-lone-pairs',
      layoutAngles: [155, 90, 25],
      spreadTerminalPairs: true,
      ledger: { atom: 'P', valence: 5, inBonds: 3 },
      reuse: 'Copy of the Lewis sandbox layout and drawing functions (tools/gc/lewis-sandbox.html); record shape matches tools/gc/lewis-molecules.json',
      alt: 'Lewis structure of PCl3: phosphorus in the center with single bonds to three chlorines, each chlorine holding three lone pairs, and one outlined lone pair on top of phosphorus. A ledger reads: P has 5 valence electrons, 3 used in bonds, 2 left, which is 1 lone pair.',
      caption: 'The pair on top is the one asked about. It pushes the three Cl down into a pyramid.'
    },
    demoPick: '3',
    flags: [
      { kind: 'stem-style', text: 'Stem is shorthand ("Lone pairs on central P in PCl3?"), not DAT style. Suggested wording for Thomas to review (not applied): "How many lone pairs of electrons are on the central phosphorus atom in phosphorus trichloride, PCl3?" Key unchanged.' },
      { kind: 'tool-gap', text: 'PCl3 is not in tools/gc/lewis-molecules.json, and the sandbox cannot open a molecule from the URL. Adding both lets this link open the exact molecule.' }
    ]
  },
  {
    pid: 'GC-2',
    qid: 'climb:t9:q13',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.periodic.ionization-energy',
    difficulty: { band: 3, from: 'The Climb tier 9 of 10 (this bank has no per-item difficulty)' },
    source: { bank: 'tools/minitests/bank.js', global: 'MINITEST_BANK', locator: { testIndex: 8, questionIndex: 12 }, servedAs: 'The Climb, mini-test 9, question 13' },
    keyText: 'Al < Mg < Si < S < P',
    answer: { line: 'Ionization energy rises across period 3, but it dips twice: at Al and at S.' },
    steps: [
      'Here is the trend: across a period, more protons pull on the same shell, so first ionization energy rises.',
      'Dip 1, Mg to Al. Al loses an electron from 3p, which sits higher than Mg\'s filled 3s. Easier to remove, so Al comes in under Mg.',
      'Dip 2, P to S. P has three unpaired 3p electrons. S has to pair its fourth, and that repulsion makes one easier to pull off.',
      'Put both dips into the rise: Al (578) < Mg (738) < Si (786) < S (1000) < P (1012), in kJ/mol.'
    ],
    choices: [
      { text: 'Al < Mg < Si < S < P', role: 'key', note: 'The rising trend with both dips in place.' },
      { text: 'Mg < Al < Si < P < S', role: 'trap', family: 'missed-exception', note: 'This is the plain left-to-right rise. It pulls because it is the rule you learned first. This item tests both exceptions.' },
      { text: 'Al < Mg < Si < P < S', role: 'trap', family: 'half-right', trap: 'Caught one dip', note: 'It has the s-to-p dip at Al but misses the pairing dip at S.' },
      { text: 'Mg < Al < Si < S < P', role: 'trap', family: 'half-right', trap: 'Caught the other dip', note: 'It has the pairing dip at S but misses the dip at Al.' },
      { text: 'S < P < Si < Al < Mg', role: 'trap', family: 'read-backward', note: 'This is the plain trend read in decreasing order, which is also the size order. The stem asks for increasing.' }
    ],
    lockIt: 'In periods 2 and 3, first ionization energy rises across the period, with dips at group 13 and group 16.',
    hook: null,
    playWith: { label: 'Periodic trends map: switch to first ionization energy and look along period 3', href: 'tools/gc/trends.html', state: { trend: 'ie1', highlight: ['Mg', 'Al', 'Si', 'P', 'S'] }, expect: ['trends-data.json'], routing: 'Page works today. The trend and the highlight need a state reader.' },
    video: { slot: 'gc.periodic.ionization-energy', title: 'Ionization energy: one trend, two dips', id: null, start: null },
    visual: {
      type: 'chem.trend',
      property: 'ie1',
      series: ['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'],
      highlight: ['Mg', 'Al', 'Si', 'P', 'S'],
      rank: ['Al', 'Mg', 'Si', 'S', 'P'],
      dips: [['Mg', 'Al'], ['P', 'S']],
      dataRef: 'tools/gc/trends-data.json (elements[].ie1, kJ/mol); values are filled in by the build',
      reuse: 'new small plot on trends-data.json',
      alt: 'Line chart of first ionization energy across period 3, from Na to Ar. It rises overall from 496 to 1521 kJ/mol but drops twice: from Mg at 738 to Al at 578, and from P at 1012 to S at 1000. The five elements in the question carry rank numbers 1 to 5: Al, Mg, Si, S, P.',
      caption: 'Follow the rank numbers under the symbols: the two dips put Al first and S fourth.'
    },
    demoPick: 'Mg < Al < Si < P < S',
    flags: [
      { kind: 'stem-style', text: 'The stem hands the student a hint ("including the well-known irregularities within a period") and sets INCREASING in capitals. Suggested wording for Thomas to review (not applied): "Rank Mg, Al, Si, P and S in order of increasing first ionization energy." Key unchanged.' },
      { kind: 'note', text: 'The bank explanation gives Si as 787 kJ/mol and tools/gc/trends-data.json has 786; NIST lists 786.5. Both roundings are fine; no action.' },
      { kind: 'id-gap', text: 'The Climb has no item ids, so this qid is positional (test 9, question 13). Adding ids to tools/minitests/source/minitest-source.json would make it stable.' }
    ]
  },
  {
    pid: 'GC-3',
    qid: 'fm:gchem-b:GC_ti-h1',
    servesAlso: [],
    section: 'gc',
    subtopic: 'gc.acid-base.titration',
    difficulty: { band: 3, from: 'bank field d (1-3)' },
    source: { bank: 'tools/mock/data/full-mocks.js', global: 'ACE_FULL_MOCKS', locator: { mock: 'FULL_4', section: 'gc', id: 'gchem-b:GC_ti-h1' }, servedAs: 'Full-Length Test 4, Natural Sciences, question 49' },
    keyText: '4.74',
    answer: { line: 'Halfway to equivalence, [A^-] = [HA], so pH = pKa = 4.74.' },
    steps: [
      'Start from what halfway means: half the acetic acid is now acetate, so [A^-] = [HA].',
      'Henderson-Hasselbalch: pH = pKa + log([A^-]/[HA]) = pKa + log 1 = pKa.',
      'pKa = -log(1.8 x 10^-5). That K_a sits between 10^-5 and 10^-4, so pKa is between 4 and 5. Only 4.74 fits.'
    ],
    choices: [
      { text: '2.87', role: 'trap', family: 'other-question', trap: 'Start of the curve', note: 'This is the pH before any NaOH goes in: 0.100 M acetic acid alone. A real point on the curve, at another moment.' },
      { text: '4.74', role: 'key', note: 'The halfway point sits mid-buffer, where acid and conjugate base are equal.' },
      { text: '7.00', role: 'trap', family: 'other-conditions', trap: 'Strong-acid habit', note: 'pH 7 at equivalence is the strong acid, strong base case. Here pH 7 comes just before equivalence, and halfway you are in the buffer.' },
      { text: '8.72', role: 'trap', family: 'other-question', trap: 'Equivalence, not half', note: 'At equivalence every HA has become A^-, a weak base, so the pH sits above 7. That is 8.72. The stem asks about halfway.' },
      { text: '9.26', role: 'trap', family: 'neighbor-fact', trap: 'pKb for pKa', note: '14 - 4.74 = 9.26 is the pKb of acetate. The buffer equation for the acid uses pKa.' }
    ],
    lockIt: 'At the half-equivalence point of a weak acid titration, pH = pKa.',
    hook: null,
    playWith: { label: 'Titration curves: drag the volume of base and watch the buffer region and both landmarks', href: 'tools/gc/index.html', state: { view: 'titration' }, expect: ['data-go="titration"'], routing: 'Needs a route: the view opens from the sidebar (data-go="titration"), not from the URL. The page also holds timed modes elsewhere; the titration view itself has no clock.' },
    video: { slot: 'gc.acid-base.titration', title: 'Reading a weak acid titration curve', id: null, start: null },
    visual: {
      type: 'chem.curve',
      kind: 'titration',
      analyte: { kind: 'weak-acid', molarity: 0.100, volumeMl: 25.0, Ka: 1.8e-5 },
      titrant: { kind: 'strong-base', molarity: 0.100 },
      xMaxMl: 40,
      marks: [
        { at: 'start', choice: '2.87' },
        { at: 'half-equivalence', choice: '4.74', key: true },
        { at: 'equivalence', choice: '8.72' }
      ],
      reuse: 'new small plotter; the curve is computed from the parameters by exact charge balance, so each mark lands on the true curve',
      alt: 'Titration curve of 25.0 mL of 0.100 M acetic acid with 0.100 M NaOH: pH from about 3 to 12 against 0 to 40 mL of base. It starts at pH 2.87, rises gently through the buffer region, passes pH 4.74 at 12.5 mL, the marked answer, and jumps to pH 8.72 at 25 mL, the equivalence point.',
      caption: 'Three of the choices are landmarks on this curve: start, halfway and equivalence. Only halfway answers the question.'
    },
    demoPick: '8.72',
    flags: [
      { kind: 'bank-copy', text: 'This bank item has no per-choice trap notes (traps is null). The pilot notes are the first.' },
      { kind: 'stem-style', text: 'The stem prints "K_a" with an underscore (the player now typesets it as a subscript at display time) and states [HA] = [A-] for the student, which gives away the principle being tested. Suggested wording for Thomas to review (not applied): "A 25.0 mL sample of 0.100 M acetic acid (Ka = 1.8 x 10^-5) is titrated with 0.100 M NaOH. What is the pH at the half-equivalence point?" Key unchanged.' }
    ]
  },

  /* ========================= ORGANIC CHEMISTRY ========================= */
  {
    pid: 'OC-1',
    qid: 'fm:organic:oc-dbrfsk',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.radicals.halogenation-selectivity',
    difficulty: { band: 1, from: 'bank field d (1-3)' },
    source: { bank: 'tools/mock/data/full-mocks.js', global: 'ACE_FULL_MOCKS', locator: { mock: 'FULL_1', section: 'ochem', id: 'organic:oc-dbrfsk' }, servedAs: 'Full-Length Test 1, Natural Sciences, question 78' },
    keyText: 'CCC(Br)c1ccccc1',
    answer: { line: 'Light means radicals, and the benzylic radical is the most stable, so Br lands on the carbon touching the ring.' },
    steps: [
      'Name the reaction from the reagents. Br2 with light (hv) is radical substitution: light splits Br2, and a Br atom pulls off one H.',
      'Br takes the H that leaves the most stable radical. Pull an H from the carbon touching the ring and the radical spreads into the ring by resonance.',
      'Br then bonds there: (1-bromopropyl)benzene. The ring stays as it is. Br on the ring needs Br2 with FeBr3.'
    ],
    choices: [
      { text: 'CCCc1ccccc1Br', display: 'Br on the ring, next to the chain (ortho)', role: 'trap', family: 'other-conditions', note: 'Br on the ring comes from Br2 with FeBr3, electrophilic aromatic substitution. Light does not start that.' },
      { text: 'BrCCCc1ccccc1', display: 'Br on the end carbon of the chain', role: 'trap', family: 'reversed', trap: 'Least stable radical', note: 'Pulling H from the end CH3 makes a primary radical, the least stable spot on the chain.' },
      { text: 'CCCc1ccc(Br)cc1', display: 'Br on the ring, across from the chain (para)', role: 'trap', family: 'other-conditions', note: 'The para product also needs FeBr3. With only light, the ring is left alone.' },
      { text: 'CCC(Br)c1ccccc1', display: '(1-bromopropyl)benzene, Br on the benzylic carbon', role: 'key', note: 'The benzylic radical is stabilized by the ring, so Br lands there.' },
      { text: 'CC(Br)Cc1ccccc1', display: 'Br on the middle carbon of the chain', role: 'trap', family: 'close-second', trap: 'Secondary, not benzylic', note: 'The middle carbon gives a secondary radical. Decent, but with no resonance into the ring it loses to the benzylic one.' }
    ],
    lockIt: 'Radical bromination puts Br at the most stable radical: benzylic or allylic, then tertiary, secondary, primary.',
    hook: 'Light plus Br2: Br goes benzylic, if that carbon has an H.',
    playWith: { label: 'Tree, radicals and pericyclic: radical reactions by reagent', href: 'tools/ochem/tree/', state: { module: 't4-radical-pericyclic' }, expect: [], routing: 'Needs a route: the tree opens modules from its own menu, not from the URL.' },
    video: { slot: 'oc.radicals.halogenation-selectivity', title: 'Radical bromination: which H goes', id: null, start: null },
    visual: {
      type: 'chem.reaction',
      reactants: [{ smi: 'CCCc1ccccc1', label: 'propylbenzene', marks: [{ atom: 2, text: 'benzylic', key: true }, { atom: 1, text: 'secondary' }, { atom: 0, text: 'primary' }] }],
      reagent: 'Br2, hv',
      products: [{ smi: 'CCC(Br)c1ccccc1', label: '(1-bromopropyl)benzene', marks: [{ atom: 2, text: 'Br on the benzylic C', key: true }] }],
      ladder: { title: 'Radical stability', order: ['benzylic or allylic', 'tertiary', 'secondary', 'primary'], key: 0 },
      reuse: 'SmilesDrawer through a light-theme copy of tools/ochem/tree/draw.js (drawSmilesGeom for atom positions)',
      alt: 'Propylbenzene, with its three chain carbons labeled benzylic, secondary and primary, reacts with Br2 and light to give (1-bromopropyl)benzene, with Br on the carbon next to the ring. A ladder ranks radical stability: benzylic or allylic, then tertiary, secondary, primary.',
      caption: 'Three kinds of chain H. Only the benzylic one leaves a radical the ring can share.'
    },
    demoPick: 'CCCc1ccc(Br)cc1',
    flags: [
      { kind: 'letter-cite', text: 'Bank explanation calls the key "option A". In the served order the key is the fourth choice (index 3); the letter comes from the order before shuffling. Key verified as (1-bromopropyl)benzene and unchanged; the explanation should drop the letter.' }
    ]
  },
  {
    pid: 'OC-2',
    qid: 'fm:own-organic:ace-0002',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.carbocations.rearrangement',
    difficulty: { band: 2, from: 'bank field d (1-3)' },
    source: { bank: 'tools/mock/data/full-mocks.js', global: 'ACE_FULL_MOCKS', locator: { mock: 'FULL_1', section: 'ochem', id: 'own-organic:ace-0002' }, servedAs: 'Full-Length Test 1, Natural Sciences, question 82' },
    keyText: 'CCC(C)(C)Br',
    answer: { line: 'The secondary cation slides a hydride over and becomes tertiary before bromide arrives.' },
    steps: [
      'Protonate the alkene the Markovnikov way. H+ adds to the end carbon, and the plus charge sits on C2: a secondary cation.',
      'Look next door. C3 is tertiary and carries an H. That H slides over with its bonding pair, a 1,2-hydride shift, and the plus moves to C3.',
      'Bromide attacks the tertiary cation. Number from the other end and that carbon is C2: 2-bromo-2-methylbutane.'
    ],
    choices: [
      { text: 'BrCCC(C)C', display: '1-bromo-3-methylbutane (Br on the end carbon)', role: 'trap', family: 'other-conditions', trap: 'Peroxide path', note: 'Br on the end carbon comes from HBr with peroxides, a radical path. There is no peroxide here.' },
      { text: 'CCC(C)(C)O', display: '2-methylbutan-2-ol (an alcohol)', role: 'trap', family: 'other-conditions', trap: 'Water as the nucleophile', note: 'An alcohol needs water to trap the cation. The only nucleophile in this flask is bromide.' },
      { text: 'CCC(C)(C)Br', display: '2-bromo-2-methylbutane', role: 'key', note: 'Hydride shift first, then bromide on the tertiary carbon.' },
      { text: 'CC(Br)C(C)C', display: '2-bromo-3-methylbutane', role: 'trap', family: 'one-step-short', trap: 'No shift', note: 'This is Markovnikov without the rearrangement. It pulls because it is the first cation you draw. Some of this forms, but most cations shift before bromide arrives.' },
      { text: 'CC=C(C)C', display: '2-methylbut-2-ene (an alkene)', role: 'trap', family: 'other-conditions', trap: 'Elimination, not addition', note: 'Losing H+ from the cation gives this alkene. With bromide right there and no heat, addition wins.' }
    ],
    lockIt: 'A cation shifts a hydride or methyl when the move makes it more stable, then the nucleophile adds.',
    hook: 'Secondary next to tertiary? Expect a shift.',
    playWith: { label: 'Tree, combined mechanism: this exact reaction, step by step with arrows (item ch-07)', href: 'tools/ochem/tree/', state: { module: 't5-mech-chain', item: 'ch-07' }, expect: [], routing: 'Needs a route to open a module and an item from the URL.' },
    video: { slot: 'oc.carbocations.rearrangement', title: 'Carbocation shifts', id: null, start: null },
    visual: {
      type: 'stack',
      alt: 'Three mechanism steps with curved arrows: the alkene takes H+ from HBr to form a secondary cation; a hydride shifts from the neighboring carbon, moving the charge to a tertiary carbon; bromide attacks to give 2-bromo-2-methylbutane. Below, an energy diagram shows the tertiary cation sitting lower than the secondary one.',
      caption: 'Step through the arrows, then look below: the tertiary cation sits lower, so the charge moves before bromide arrives.',
      panels: [
        { type: 'chem.mechanism', ref: { file: 'tools/ochem/tree/shared/set-2026.js', id: 'ch-07', field: 'fig' }, showProduct: false, stepper: 'phone', reuse: 'drawChain() in tools/ochem/tree/mechdraw.js with showProduct false; figure copied by the build from 2026 set item ch-07 (same reaction, arrows proven by scripts/ochem2026/verify.py)' },
        { type: 'chem.energy', yLabel: 'Energy', xLabel: 'Reaction progress', points: [
          { kind: 'start', y: 0 }, { kind: 'ts', y: 62, tag: '1' }, { kind: 'int', y: 38 }, { kind: 'ts', y: 44, tag: '2' }, { kind: 'int', y: 20 }, { kind: 'ts', y: 27, tag: '3' }, { kind: 'end', y: -30 }
        ], names: { 0: 'alkene + HBr', 2: 'secondary cation', 4: 'tertiary cation', 6: 'product' }, qualitative: true, reuse: 'drawRcd() in tools/ochem/tree/mechdraw.js' }
      ]
    },
    demoPick: 'CC(Br)C(C)C',
    flags: [
      { kind: 'bank-copy', text: 'Bank explanation says "The skeleton you started with is not the skeleton you finish with." A 1,2-hydride shift keeps the carbon skeleton (3-methylbut-1-ene and 2-bromo-2-methylbutane share it); only H, the charge and the Br position move. Wording only; key unchanged. Suggested: "The charge you started with is not where it ends up."' }
    ]
  },
  {
    pid: 'OC-3',
    qid: 'fm:organic:oc-1juifa8',
    servesAlso: [],
    section: 'ochem',
    subtopic: 'oc.stereo.r-s',
    difficulty: { band: 2, from: 'bank field d (1-3)' },
    source: { bank: 'tools/mock/data/full-mocks.js', global: 'ACE_FULL_MOCKS', locator: { mock: 'FULL_2', section: 'ochem', id: 'organic:oc-1juifa8' }, servedAs: 'Full-Length Test 2, Natural Sciences, question 78' },
    keyText: '(2R, 3R)',
    answer: { line: 'Swap H onto the dash or wedge at each center and both read R. The ends differ, so it is (2R, 3R), chiral.' },
    steps: [
      'Start with C2. Rank by atomic number: Br (1), then C3, which carries Cl (2), then CH3 (3), then H (4).',
      'At C2, H lies flat and Br sits on the dash. Swap them so H points away. Trace 1 to 2 to 3: counterclockwise, S. Flip once for the swap: R.',
      'C3: Cl (1), C2 with its Br (2), CH3 (3), H (4). Swap H with Cl on the wedge. Trace: clockwise, R. Flip for H toward you, flip for the swap: R.',
      'Meso check. Meso needs matching halves, and one end has Br while the other has Cl. No mirror plane: chiral, not meso.'
    ],
    choices: [
      { text: '(2R, 3S)', role: 'trap', family: 'reversed', trap: 'Flipped for the Cl wedge', relation: 'diastereomer', note: 'The wedge at C3 holds Cl, not H. Swap them and the two flips cancel, so C3 reads as traced: R.' },
      { text: '(2S, 3S) - and the molecule is meso', role: 'trap', family: 'reversed', trap: 'Mirror image, plus meso', relation: 'enantiomer', note: 'Both letters reversed is the enantiomer. With Br on one center and Cl on the other, this molecule cannot be meso.' },
      { text: '(2S, 3R)', role: 'trap', family: 'reversed', trap: 'Traced C2 as drawn', relation: 'diastereomer', note: 'C3 is right, C2 is not. This is C2 traced as drawn, with H still flat. Swap H onto the dash first, then flip once for the swap.' },
      { text: '(2R, 3R)', role: 'key', relation: 'same', note: 'Both centers R, and no mirror plane.' },
      { text: '(2R, 3R) - and the molecule is meso', role: 'trap', family: 'half-right', trap: 'Right letters, extra claim', relation: 'same', note: 'The letters match, but meso needs matching ends. Br and Cl differ, so the molecule is chiral.' }
    ],
    lockIt: 'Assign each stereocenter on its own. Meso needs matching groups on both centers and a mirror plane.',
    hook: 'Every swap flips the letter. Count your flips.',
    playWith: { label: 'Roots, wedges and dashes: turn a stereocenter in 3D and read R or S', href: 'tools/ochem/roots/', state: { root: 'l3-wedge' }, expect: [], routing: 'Needs a route to open one root from the URL. The root teaches H on a wedge or a dash only, not the swap for a flat H; see flags.' },
    video: { slot: 'oc.stereo.r-s', title: 'R and S in three moves', id: null, start: null },
    visual: {
      type: 'chem.molecule',
      smi: 'C[C@@H](Br)[C@H](Cl)C',
      label: '2-bromo-3-chlorobutane',
      centers: [
        { atom: 1, name: 'C2', rank: [{ atom: 2, name: 'Br' }, { atom: 3, name: 'C3 (has Cl)' }, { atom: 0, name: 'CH3' }, { h: true, name: 'H' }], config: 'R', expectDrawn: { h: 'plane', swapWith: 'Br on the dash', trace: 'ccw' }, labelDir: 0 },
        { atom: 3, name: 'C3', rank: [{ atom: 4, name: 'Cl' }, { atom: 1, name: 'C2 (has Br)' }, { atom: 5, name: 'CH3' }, { h: true, name: 'H' }], config: 'R', expectDrawn: { h: 'plane', swapWith: 'Cl on the wedge', trace: 'cw' } }
      ],
      note: 'Not meso: one end has Br, the other Cl.',
      verify: 'RDKit CIP labeler on the stem SMILES and stereo relations of every choice (run by the build); card text derived in the browser from the drawn wedges and positions, and checked against the spec',
      reuse: 'SmilesDrawer through a light-theme copy of tools/ochem/tree/draw.js; small new card for each stereocenter, built from the drawing',
      alt: 'The molecule 2-bromo-3-chlorobutane as drawn: Br on a dash at C2, Cl on a wedge at C3, and H flat at both centers. One card per center ranks the four groups, swaps H onto the dash or wedge, counts the flips, and marks each center R.',
      caption: 'H lies flat at both centers. Swap it onto the dash at C2 and the wedge at C3, then count the flips.'
    },
    demoPick: '(2R, 3R) - and the molecule is meso',
    flags: [
      { kind: 'internal-note-shown', text: 'Bank explanation shows students a reviewer note: "Keyed correct=0 is right; the meso distractors are good traps." Index 0 is the order before shuffling; the served key is index 3, "(2R, 3R)", which RDKit confirms. Key unchanged; that sentence should come out of the explanation.' },
      { kind: 'stem-drawing', text: 'Since commit 5c5ec38 the served stem (tools/mock/full.js, explicit hydrogens off) is the DAT-style zigzag with implicit H: Br on a dash at C2, Cl on a wedge at C3. The render gate confirms it depicts the SMILES, (2R, 3R). The explainer picture still draws H explicitly, flat at both centers, and the steps teach the swap on that picture, so the student sees H in the explainer but not in the stem. Thomas to choose: keep the explicit-H explainer picture (it shows where each H is), or redraw it with implicit H to match the stem and rewrite steps 2 and 3. Key unchanged.' },
      { kind: 'play-target', text: 'tools/ochem/roots/roots/l3-wedge.js teaches H on a wedge or a dash only, not H in the plane, and its copy (line 123, and the story at line 18) says "judged it from the wrong side", which breaks the house rule. Suggested replacement: "H is on a wedge, pointing at you, so you read it from the front. Flip the letter."' }
    ]
  },

  /* ======================= QUANTITATIVE REASONING ======================= */
  {
    pid: 'QR-1',
    qid: 'qrf:di-023',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.data.part-over-whole',
    difficulty: { band: 1, from: 'bank field diff (1-4)' },
    source: { bank: 'shared/qr-formats-bank.js', global: 'QR_FORMATS_DATA', locator: { id: 'di-023' }, servedAs: 'QR engine, Data Interpretation set (tools/qr/index.html via qr-formats-module.js)' },
    keyText: '53%',
    answer: { line: 'The weekend bars add to 53 and the whole chart adds to 100, so the weekend is 53 out of 100.' },
    steps: [
      'Set it up as part over whole. Add the part first: Saturday 28 + Sunday 25 = 53.',
      'Then add every bar for the whole: 12 + 9 + 11 + 15 + 28 + 25 = 100. The chart counts hundreds of visitors, but the units cancel.',
      '53 out of 100 is 53%.'
    ],
    choices: [
      { text: '43%', role: 'trap', family: 'neighbor-fact', trap: 'Shifted the weekend', note: 'Friday plus Saturday is 15 + 28 = 43. The stem asks for Saturday and Sunday.' },
      { text: '47%', role: 'trap', family: 'other-question', note: '47 is the other part, Tuesday through Friday. It is what is left after the weekend, not the weekend.' },
      { text: '50%', role: 'trap', family: 'looks-bigger', trap: 'Eyeballed it', note: 'The two tall bars look like about half the chart. A fine first check, but the exact share is 53.' },
      { text: '53%', role: 'key', note: '5,300 weekend visitors out of 10,000 in all.' },
      { text: '56%', role: 'trap', family: 'miscount', trap: 'Counted Saturday twice', note: '28 + 28 is 56. Sunday\'s bar is 25, not 28.' }
    ],
    lockIt: 'Percent of a total: add the part, add the whole, divide.',
    hook: null,
    playWith: { label: 'QR engine, Data Interpretation set: more chart questions in the same format', href: 'tools/qr/index.html', state: { module: 'formats', format: 'di' }, expect: ['qr-formats-module.js'], routing: 'Needs a route to open the formats module from the URL. The page also holds a timed simulator elsewhere; the formats module itself is untimed.' },
    video: { slot: 'qr.data.part-over-whole', title: 'Reading a chart: part over whole', id: null, start: null },
    visual: {
      type: 'qr.partwhole',
      style: 'strip',
      total: 100,
      parts: [{ label: 'Sat', n: 28, key: true }, { label: 'Sun', n: 25, key: true }],
      rest: { label: 'Tue to Fri', n: 47 },
      bracket: 'weekend: 53 of 100',
      unit: 'hundred visitors',
      annotateQuestion: { highlight: ['Sat', 'Sun'] },
      reuse: 'new strip; the question chart itself (shared/qr-figures.js) gets the Sat and Sun bars outlined after Check, through the same highlight wrapper',
      alt: 'A bar 100 units long split by day: Tuesday to Friday 47, Saturday 28, Sunday 25. A bracket over Saturday and Sunday reads weekend, 53 of 100. On the question chart above, the Saturday and Sunday bars are outlined.',
      caption: 'The two outlined bars on the chart are the bracket here: 53 of the 100 units the chart holds.'
    },
    demoPick: '47%',
    flags: [
      { kind: 'inferred-traps', text: 'The bank stores a reason only for 47% (the weekday share). The pilot notes for 43% (Friday plus Saturday) and 56% (Saturday twice) come from the arithmetic, not from a stored note; 50% is read as an eyeball estimate.' },
      { kind: 'stem-style', text: 'The stem asks about "the week\'s visitors" but the chart runs Tuesday to Sunday, with no Monday. Suggested wording for Thomas to review (not applied): "What percent of the visitors shown came on Saturday or Sunday?", or a chart title saying the museum is closed Mondays. Key unchanged.' }
    ]
  },
  {
    pid: 'QR-2',
    qid: 'fm:written:qr-11-1ntn2bl',
    servesAlso: [],
    section: 'qr',
    subtopic: 'qr.trig.law-of-cosines',
    difficulty: { band: 3, from: 'bank field d (1-3)' },
    source: { bank: 'tools/mock/data/full-mocks.js', global: 'ACE_FULL_MOCKS', locator: { mock: 'FULL_1', section: 'qr', id: 'written:qr-11-1ntn2bl' }, servedAs: 'Full-Length Test 1, Quantitative Reasoning, question 33' },
    keyText: '√39, about 6.2',
    answer: { line: '74 - 35 = 39, so the third side is root 39, about 6.2.' },
    steps: [
      'Spot the setup: two sides and the angle between them call for the Law of Cosines, c^2 = a^2 + b^2 - 2ab cos C.',
      'Plug in: 25 + 49 - 2(5)(7)(cos 60) = 74 - 70(1/2) = 74 - 35 = 39.',
      'c = root 39. Since 6^2 = 36 and 6.5^2 = 42.25, it is a little over 6: about 6.2.',
      'Check it: 60 degrees is narrower than 90, so the side has to come out shorter than root 74, the right-angle answer.'
    ],
    choices: [
      { text: '2', role: 'trap', family: 'other-conditions', trap: 'Dropped the cosine', note: '74 - 70 = 4, and root 4 is 2: that treats cos 60 as 1, the angle closed to 0. Cos 60 is 1/2, so subtract 35.' },
      { text: '√109, about 10.4', role: 'trap', family: 'operation-flip', note: '74 + 35 is what a 120 degree angle gives, since cos 120 = -1/2. A narrow angle makes the side shorter.' },
      { text: '√39, about 6.2', role: 'key', note: '74 - 35 = 39.' },
      { text: '12', role: 'trap', family: 'other-conditions', trap: 'Added the sides', note: '5 + 7 = 12 is the side when the angle opens all the way to 180 degrees. A triangle never gets there.' },
      { text: '√74, about 8.6', role: 'trap', family: 'other-conditions', trap: 'Treated as a right triangle', note: 'Pythagoras is the Law of Cosines at exactly 90 degrees. This angle is 60.' }
    ],
    lockIt: 'Law of Cosines: c^2 = a^2 + b^2 - 2ab cos C. Pythagoras plus a correction for the angle.',
    hook: null,
    playWith: { label: 'QR engine, trigonometry module', href: 'tools/qr/index.html', state: { skill: 'trig' }, expect: ['trig'], routing: 'Needs a route to open one skill from the URL. The page also holds a timed simulator elsewhere; the module itself is untimed.' },
    video: { slot: 'qr.trig.law-of-cosines', title: 'Law of Cosines: Pythagoras with a correction', id: null, start: null },
    visual: {
      type: 'qr.triangle',
      a: 5, b: 7, angleDeg: 60,
      solveFor: 'c',
      compare: [{ angleDeg: 90, label: 'root 74' }, { angleDeg: 120, label: 'root 109' }],
      reuse: 'new, drawn to scale',
      alt: 'A triangle drawn to scale with sides 5 and 7 meeting at a 60 degree angle; the third side, root 39 or about 6.2, is marked as the answer. Dashed copies with the angle opened to 90 and 120 degrees show the third side growing to root 74 and root 109.',
      caption: 'Watch the dashed sides: open the angle and the third side grows, from root 39 to root 74 to root 109.'
    },
    demoPick: '√74, about 8.6',
    flags: []
  },
  {
    pid: 'QR-3',
    qid: 'pool:QR_pco1554',
    premises: ['2%', '99%', '90%'],
    servesAlso: [
      { qid: 'pm:MOCK_2:qr:20', relation: 'exact copy: Practice Test 2 (prometric-mock.html), Quantitative Reasoning, question 20', reviewed: true },
      { qid: 'games:qr:QR_pco1554', relation: 'exact copy: games/qr.json', reviewed: true },
      { qid: 'qre:pco1554', relation: 'same problem in the QR engine bank: 4 of these 5 choices, other order', reviewed: false }
    ],
    section: 'qr',
    subtopic: 'qr.probability.conditional',
    difficulty: { band: 3, from: 'bank field difficulty (1-4)' },
    source: { bank: 'shared/dat-mock-tests.js', global: 'DAT_MOCK_TESTS', locator: { test: 'MOCK_2', section: 'qr', id: 'QR_pco1554' }, servedAs: 'Practice Test 2 (prometric-mock.html), Quantitative Reasoning, question 20' },
    keyText: '0.17',
    answer: { line: 'Out of every 1,178 positive tests, only 198 come from sick people: about 0.17.' },
    steps: [
      'Turn the percents into people. Picture 10,000 of them: 2 percent, or 200, have the disease; 9,800 do not.',
      'Sensitivity 99 percent: 198 of the 200 sick people test positive. Specificity 90 percent: 8,820 of the 9,800 healthy people test negative, so 980 test positive anyway.',
      'All positives: 198 + 980 = 1,178. Sick ones among them: 198.',
      '198 / 1,178 is about 0.17. Most positives are false alarms, because the disease is rare.'
    ],
    choices: [
      { text: '0.99', role: 'trap', family: 'flipped-condition', note: '0.99 is the chance a sick person tests positive. The question runs the other way: given a positive test, how likely is the disease?' },
      { text: '0.9', role: 'trap', family: 'other-question', trap: 'Used the specificity', note: '0.9 is the chance a healthy person tests negative. A true number about a different group.' },
      { text: '0.17', role: 'key', note: '198 sick positives out of 1,178 positives.' },
      { text: '0.02', role: 'trap', family: 'one-step-short', trap: 'Base rate only', note: '0.02 is the chance before any test. A positive result raises it, to about 0.17.' },
      { text: '0.50', role: 'trap', family: 'assumed-equal', trap: 'Two outcomes, assumed even', note: 'Sick or not sick is two outcomes, but not two equal ones. The counts decide.' }
    ],
    lockIt: 'P(A given B) = cases with both over all cases with B. Rare condition: false positives can outnumber true ones.',
    hook: 'Turn percents into people. 10,000 keeps them whole.',
    playWith: { label: 'Conditional probability table: set prevalence 2, sensitivity 99, specificity 90', href: 'tools/qr/index.html', state: { view: 'p-cond', prev: 2, sens: 99, spec: 90 }, expect: ['qrProbTable', 'data-go="p-cond"'], routing: 'Needs a route: the view opens from data-go="p-cond", and the three sliders need a state reader. The page also holds a timed simulator elsewhere; this view is untimed.' },
    video: { slot: 'qr.probability.conditional', title: 'Conditional probability with a crowd of 10,000', id: null, start: null },
    visual: {
      type: 'qr.tree',
      root: { label: '10,000 people', n: 10000 },
      branches: [
        { label: 'disease', rate: '2 percent', n: 200, children: [{ label: 'test +', rate: '99 percent', n: 198, role: 'numerator', mark: 'true positive' }, { label: 'test -', rate: '1 percent', n: 2 }] },
        { label: 'no disease', rate: '98 percent', n: 9800, children: [{ label: 'test +', rate: '10 percent', n: 980, role: 'denominator', mark: 'false positive' }, { label: 'test -', rate: '90 percent', n: 8820 }] }
      ],
      result: { text: 'P(disease given +) = 198 / (198 + 980) = 0.17', value: 0.17 },
      reuse: 'new',
      alt: 'Tree from 10,000 people: 200 with the disease, of whom 198 test positive and 2 negative; 9,800 without it, of whom 980 test positive and 8,820 negative. Branch labels give the rates, 2 and 98 percent, then 99 and 1, 10 and 90. The outlined true positives over both outlined positive leaves give 198 of 1,178, about 0.17.',
      caption: 'Once the test is positive, only the two outlined positive leaves matter: 198 true positives out of 1,178.'
    },
    demoPick: '0.99',
    flags: [
      { kind: 'missing-explanation', text: 'Bank item has no explanation at all (no why field) in the pool, the Prometric form or games/qr.json. This pilot entry is the first explainer for it.' },
      { kind: 'stem-style', text: 'Stem is shorthand, not DAT style. Suggested wording for Thomas to review (not applied): "A disease affects 2 percent of a population. A screening test is positive for 99 percent of people who have the disease and negative for 90 percent of people who do not. If a randomly chosen person tests positive, what is the probability that the person has the disease?" Key unchanged.' }
    ]
  },

  /* ======================= PERCEPTUAL ABILITY ======================= */
  {
    pid: 'PAT-1',
    qid: 'pat:F20261001:37',
    canonical: { gen: 'angles', seed: 737153687 },
    servesAlso: [],
    section: 'pat',
    subtopic: 'pat.angles.close-pairs',
    difficulty: { band: 3, from: 'engine meta: closest gap 2 degrees, misleading arm lengths' },
    source: { bank: 'tools/pat/engine/pat-test.js', global: 'PAT', locator: { test: PAT_TEST, n: 37 }, servedAs: 'Full-Length Test 1, Perceptual Ability, question 37 (angle ranking)' },
    keyText: '2-4-1-3',
    answer: { line: 'Smallest to largest, the angles are 23, 25, 31 and 34 degrees: 2, 4, 1, 3.' },
    steps: [
      'Read the choices first. They start with 2 or 4 and end with 1 or 3, so two close calls decide it.',
      'Angle 2 against 4: 23 against 25. The long arms on 2 make it look bigger; judge the corner.',
      'Angle 1 against 3: 31 against 34. The short arms on 3 make it look smaller.',
      'Two choices survive. 4 against 1 is 6 degrees apart, the easy call, so 2-4-1-3.'
    ],
    choices: [
      { text: '4-2-1-3', role: 'trap', family: 'pat:angles:swap', trap: 'Long arms looked bigger', note: 'Angles 2 and 4 differ by 2 degrees, 23 against 25. The long arms on angle 2 make it look like the bigger one.' },
      { text: '2-4-1-3', role: 'key', note: '23, 25, 31, 34 degrees.' },
      { text: '2-4-3-1', role: 'trap', family: 'pat:angles:swap', trap: 'Short arms looked smaller', note: 'Angle 3 is 34 degrees and angle 1 is 31. The short arms on angle 3 make it look smaller than it is.' },
      { text: '2-1-4-3', role: 'trap', family: 'pat:angles:swap', trap: 'Rushed the middle', note: 'Angle 4 is 25 degrees and angle 1 is 31, the widest gap in the set. This swap comes from settling the ends and then rushing the middle.' }
    ],
    lockIt: 'Rank by the opening at the vertex, never arm length. Let the choices tell you which close calls matter.',
    hook: null,
    playWith: { label: 'Angle ranking studio, teach mode, close gaps of 2 degrees', href: 'tools/pat/angles.html?gap=2&mode=teach', state: { gap: 2, mode: 'teach' }, expect: ['mode'], routing: 'Works today: the page reads gap and mode from the URL. It shows a timer pill in teach mode; see flags.' },
    video: { slot: 'pat.angles.close-pairs', title: 'Angle ranking: let the choices pick the close calls', id: null, start: null },
    visual: {
      type: 'pat.angles',
      item: { test: PAT_TEST, n: 37 },
      view: ['truth', 'fan'],
      reuse: 'PAT engine (tools/pat/engine/pat-angles.js): panelSVG() for each angle as drawn, with the true sizes from the item; the equal-arm fan is new',
      alt: 'Top: the four angles as drawn in the question, labeled with their true sizes: 1 is 31 degrees, 2 is 23, 3 is 34, 4 is 25. Bottom: the same four angles redrawn from one vertex with equal arms, each arm numbered, fanned in order 2, 4, 1, 3.',
      caption: 'Same angles, equal arms, one corner. The close pairs are 2 and 4 at the bottom, 1 and 3 at the top.'
    },
    demoPick: '2-4-3-1',
    flags: [
      { kind: 'trap-names', text: 'Engine trap labels shown to students include "wrong" (tools/pat/engine/pat-test.js TRAP_NAMES: holepunch "Mirrored across the wrong line", keyholes "Right shape, wrong size" and "Wrong proportions", pattern folding "A face turned the wrong way" and "Shading on the wrong face", TFE "A step in the wrong place"). House-safe names, one per engine tag, are in explainer-standard.md, section 3.3.' },
      { kind: 'timer', text: 'tools/pat/angles.html shows a timer pill ("0.0s, aim 20s") even in teach mode, where its clock starts and then stops, and its mode label and drill coach line contain em dashes. House rule: no timers outside full timed tests. A no-clock teach mode is needed before explainers link students there.' }
    ]
  },
  {
    pid: 'PAT-2',
    qid: 'pat:F20261001:47',
    canonical: { gen: 'holepunch', seed: 3039805555, arg: { folds: 2 } },
    servesAlso: [],
    section: 'pat',
    subtopic: 'pat.holepunch.unfold-in-reverse',
    difficulty: { band: 2, from: 'engine meta: 2 straight folds, 2 punches, 4 holes' },
    source: { bank: 'tools/pat/engine/pat-test.js', global: 'PAT', locator: { test: PAT_TEST, n: 47 }, servedAs: 'Full-Length Test 1, Perceptual Ability, question 47 (hole punching)' },
    keyText: 'holes:2.5,0.5|2.5,3.5|3.5,0.5|3.5,3.5',
    answer: { line: 'Unfold in reverse. Fold 2 adds no holes; fold 1 mirrors the top row into the bottom row. Four holes in the two right columns.' },
    steps: [
      'Work backward. Undo the last fold first, and mirror any hole on its flap across that crease.',
      'Undo fold 2, the left strip folded over. The punches are in the two right columns, which that strip never covered. Nothing new: still 2 holes, top row.',
      'Undo fold 1, the bottom half folded up. Both layers were punched, so each top-row hole gets a partner in the bottom row, the same distance from the crease.',
      'Final sheet: 4 holes, top and bottom rows, in the two right columns.'
    ],
    choices: [
      { text: 'holes:0.5,0.5|0.5,3.5|1.5,0.5|1.5,3.5', display: 'two left columns, top and bottom rows', role: 'trap', family: 'pat:holepunch:flipped', note: 'The answer\'s pattern, mirrored left to right. The punches sat on the right side of the folded paper, and nothing moves them left.' },
      { text: 'holes:0.5,2.5|0.5,3.5|3.5,2.5|3.5,3.5', display: 'outer columns, bottom two rows', role: 'trap', family: 'pat:holepunch:flipped', trap: 'Read the sheet turned', note: 'The answer\'s pattern turned a quarter turn: its two columns became two rows.' },
      { text: 'holes:2.5,0.5|2.5,3.5|3.5,0.5|3.5,3.5', display: 'two right columns, top and bottom rows', role: 'key', note: 'Fold 2 adds nothing; fold 1 mirrors the top row into the bottom row.' },
      { text: 'holes:2.5,0.5|3.5,0.5', display: 'two holes, top row only', role: 'trap', family: 'pat:holepunch:wrong-line', note: 'Two ways land here: mirroring across the fold 2 crease, which adds nothing, or leaving fold 1 closed. Fold 1 opens across its own crease and doubles the holes.' },
      { text: 'holes:2.5,0.5|2.5,2.5|3.5,0.5|3.5,3.5', display: 'four holes, one in the third row', role: 'trap', family: 'pat:holepunch:shifted', note: 'A mirrored hole sits as far below the crease as the original sits above it. Top row maps to bottom row, not the third row.' }
    ],
    lockIt: 'Unfold in reverse. Each unfold mirrors the holes on its flap across the crease; holes off the flap stay single.',
    hook: null,
    playWith: { label: 'Hole punching studio, two folds, with the unfold step-through', href: 'tools/pat/holepunch.html?lv=2', state: { lv: 2 }, expect: ['lv'], routing: 'Works today, but the studio starts a running timer on load; see flags.' },
    video: { slot: 'pat.holepunch.unfold-in-reverse', title: 'Hole punching: unfold in reverse', id: null, start: null },
    visual: {
      type: 'pat.unfold',
      item: { test: PAT_TEST, n: 47 },
      reuse: 'PAT engine item (tools/pat/engine/pat-holepunch.js: folds, flaps, punches); the step-by-step unfold strip is new',
      alt: 'Three squares, left to right: the folded paper with two punches in the top row; fold 2 opened, still two holes; fold 1 opened, the holes mirrored into the bottom row. Four holes end in the two right columns. Creases are dashed.',
      caption: 'Open the folds in reverse and watch the rings: only fold 1 adds holes.'
    },
    demoPick: 'holes:2.5,0.5|3.5,0.5',
    flags: [
      { kind: 'engine-tag', text: 'The engine tags the two-hole choice wrong-line (mirrored across the other crease). That mirror adds nothing here, so the same sheet is also what you get by leaving fold 1 closed. The explainer keeps the engine family, so the results screen and the explainer count it the same way, and names both readings in the note.' },
      { kind: 'timer', text: 'tools/pat/holepunch.html starts a running timer on load (startTimer, pill "aim 22s"). House rule: no timers outside full timed tests. A no-clock teach mode is needed before explainers link students there.' }
    ]
  },
  {
    pid: 'PAT-3',
    qid: 'pat:F20261001:62',
    canonical: { gen: 'cubes', seed: 954492747, arg: ['A', 4], index: 1 },
    servesAlso: [],
    section: 'pat',
    subtopic: 'pat.cubes.hidden-cubes',
    difficulty: { band: 3, from: 'engine meta: the only cube in the answer is hidden' },
    source: { bank: 'tools/pat/engine/pat-test.js', global: 'PAT', locator: { test: PAT_TEST, n: 62 }, servedAs: 'Full-Length Test 1, Perceptual Ability, question 62 (cube counting, Figure A)' },
    keyText: '1 cube',
    answer: { line: 'Only one cube has exactly one painted side, and you cannot see it: the bottom cube in the middle of the back row.' },
    steps: [
      'Know the paint rule: every exposed side is painted except the bottom. That includes the two back sides you cannot see, the ones facing upper left and upper right in the drawing.',
      'Count floor by floor, bottom up, and write each cube\'s number of painted sides. The floor maps in the picture do this for you.',
      'One cube has exactly one: the bottom cube in the middle of the back row, under the tall tower. Neighbors cover its top and three sides; only the side facing upper right is open.',
      'Hidden cubes count. Any cube holding up a cube you can see is really there.'
    ],
    choices: [
      { text: '1 cube', role: 'key', note: 'The hidden cube under the tower, its upper-right side painted.' },
      { text: '2 cubes', role: 'trap', family: 'pat:cubes:hidden-faces', trap: 'Skipped the upper-right sides', slip: 'skip-back', note: 'Leave out the hidden sides facing upper right and 2 cubes come out with one painted side. Those back sides get paint too.' },
      { text: '3 cubes', role: 'trap', family: 'pat:cubes:hidden-faces', trap: 'Skipped the upper-left sides', slip: 'skip-left', note: 'Leave out the hidden sides facing upper left and 3 cubes come out with one painted side. Hidden sides still get paint.' },
      { text: '4 cubes', role: 'trap', family: 'pat:cubes:hidden-faces', trap: 'Counted visible sides only', slip: 'visible-only', note: 'Count only the top and the two front sides you can see, and 4 cubes show exactly one. The rule counts every exposed side but the bottom.' },
      { text: '5 cubes', role: 'trap', family: 'miscount', slip: 'none', note: 'No single slip gives 5 here. Recount floor by floor and write each cube\'s number down.' }
    ],
    lockIt: 'Paint every exposed side but the bottom, count floor by floor, and count the hidden cubes that hold others up.',
    hook: null,
    playWith: { label: 'Cube counting studio, teach mode', href: 'tools/pat/cubes.html?lv=2', state: { lv: 2, mode: 'teach' }, expect: ['teach'], routing: 'Works today. It opens in teach mode with the clock idle, but a timer pill still shows; see flags.' },
    video: { slot: 'pat.cubes.hidden-cubes', title: 'Cube counting: the floor map method', id: null, start: null },
    visual: {
      type: 'pat.cubes',
      item: { test: PAT_TEST, n: 62 },
      view: ['floor1', 'layers'],
      reuse: 'PAT engine (tools/pat/engine/pat-cubes.js): figureSVG() on floor 1 alone, and painted(); the floor maps are new',
      alt: 'Left: floor 1 of Figure A on its own, with the floors above lifted off; the middle cube of the back row is outlined and marked 1, its painted side facing upper right. Right: four floor maps, bottom to top, each cube showing its number of painted sides.',
      caption: 'Lift off the upper floors and the one-side cube shows: back row, middle, its open side facing upper right.'
    },
    demoPick: '4 cubes',
    flags: [
      { kind: 'derived-traps', text: 'PAT cube options carry no trap tags in the engine. The notes for 2, 3 and 4 cubes are computed by the build: skipping the hidden sides facing upper right gives 2 one-side cubes, skipping those facing upper left gives 3, counting only the visible sides gives 4. No single slip gives 5. The families pat:cubes:hidden-faces and miscount are proposed engine tags.' },
      { kind: 'timer', text: 'tools/pat/cubes.html opens in teach mode (MODE defaults to teach) and its clock runs only in drill, but the timer pill ("0.0s, aim 25s") still shows. House rule: no timers outside full timed tests.' }
    ]
  },

  /* ======================= READING COMPREHENSION ======================= */
  {
    pid: 'RC-1',
    qid: 'rc:rc-o15-q01',
    servesAlso: [],
    section: 'rc',
    subtopic: 'rc.detail',
    difficulty: { band: 1, from: 'question type (detail); the RC bank has no difficulty field' },
    source: { bank: 'tools/rc/data/bank.js', global: 'ACE_RC_BANK', locator: { passage: 'rc-o15', id: 'rc-o15-q01' }, servedAs: 'Full-Length Test 1, Reading Comprehension, passage 1, question 1' },
    keyText: 'it pictured the four bases repeating in a fixed order along the chain',
    answer: { line: 'Paragraph 2 says Levene pictured the four bases repeating in a fixed order, and a molecule that monotonous seemed too dull to carry instructions.' },
    steps: [
      'Find the term. The tetranucleotide hypothesis is named in paragraph 2, sentence 3.',
      'Read the whole sentence, not just the name. The reason comes after the name, highlighted in the picture: a fixed repeating order that seemed too dull to carry instructions.',
      'Match the reason. One choice says the fixed, repeating order almost word for word.'
    ],
    choices: [
      { text: 'it suggested that DNA occurred only in the nuclei of blood cells', role: 'trap', family: 'rc-misplaced', note: 'White blood cells are where Miescher isolated DNA, paragraph 2, sentence 1. A real detail about another person, and the choice adds only.' },
      { text: 'it held that DNA contained far fewer parts than the proteins it was compared with', role: 'trap', family: 'rc-half-supported', note: 'Proteins did have more kinds of building blocks. But the hypothesis was about the order of the bases, not a count of parts.' },
      { text: 'it pictured the four bases repeating in a fixed order along the chain', role: 'key', note: 'Paragraph 2, sentence 3, nearly word for word.' },
      { text: 'it showed that the proportions of the bases differed from species to species', role: 'trap', family: 'read-backward', note: 'That is Chargaff\'s finding in paragraph 3, and it is what brought the hypothesis down.' },
      { text: 'it proposed that the molecule was a single short chain rather than a long one', role: 'trap', family: 'rc-outside', note: 'Tetra sounds small, but the passage never ties the hypothesis to chain length.' }
    ],
    lockIt: 'Detail questions: find the term, read the whole sentence around it, match the reason it gives.',
    hook: null,
    playWith: { label: 'Reading player: this passage on its own, with highlighting and cross-out', href: 'tools/rc/index.html#start/passage/rc-o15', state: { passage: 'rc-o15' }, expect: ['rc.js'], routing: 'Works today, but the player shows an elapsed clock, a pace bar and a correct-count headline; see flags.' },
    video: { slot: 'rc.detail', title: 'Detail questions: find, read whole, match', id: null, start: null },
    visual: {
      type: 'rc.evidence',
      passage: 'rc-o15',
      spans: [
        { p: 2, s: 3, quote: 'Levene proposed that the four bases simply repeated in a fixed order along the chain, the tetranucleotide hypothesis, and a molecule that monotonous seemed too dull to carry hereditary instructions', role: 'key', note: 'the reason: a fixed, repeating order, too dull to carry instructions' },
        { p: 2, s: 1, quote: 'Friedrich Miescher isolated DNA from the nuclei of white blood cells in 1869', role: 'trap', choice: 'it suggested that DNA occurred only in the nuclei of blood cells', note: 'where the misplaced detail comes from' },
        { p: 3, s: 3, quote: 'the proportions of the bases differed from one species to another', role: 'trap', choice: 'it showed that the proportions of the bases differed from species to species', note: 'where the reversed choice comes from' }
      ],
      reuse: 'Passage text and proof lines from tools/rc/data/bank.js; highlight style matches the highlighter in tools/rc/rc.js',
      alt: 'Excerpts from paragraphs 2 and 3. Paragraph 2, sentence 3 is highlighted whole as the answer: Levene proposed the four bases repeated in a fixed order, too dull to carry instructions. Lighter marks show where two tempting choices came from: white blood cells in paragraph 2, sentence 1, and proportions that differ by species in paragraph 3, sentence 3.',
      caption: 'The proof line, read whole, plus where two tempting choices were borrowed from.'
    },
    demoPick: 'it showed that the proportions of the bases differed from species to species',
    flags: [
      { kind: 'bank-copy', text: 'This passage\'s distractor notes label choices "Wrong detail", "Wrong paragraph" and "Wrong target"; 246 notes across the RC bank contain "wrong". The pilot uses the RC families in explainer-standard.md, section 3.2.' },
      { kind: 'play-target', text: 'The RC player (tools/rc/rc.js) shows an elapsed clock, a per-passage pace bar, 10 and 12 minute cues, and an "N of M correct" results headline, even for a single passage. House rule: no timers or scores outside full timed tests. A calm mode is needed before explainers link students there.' }
    ]
  },
  {
    pid: 'RC-2',
    qid: 'rc:rc-o15-q05',
    servesAlso: [],
    section: 'rc',
    subtopic: 'rc.except',
    difficulty: { band: 2, from: 'question type (EXCEPT); the RC bank has no difficulty field' },
    source: { bank: 'tools/rc/data/bank.js', global: 'ACE_RC_BANK', locator: { passage: 'rc-o15', id: 'rc-o15-q05' }, servedAs: 'Full-Length Test 1, Reading Comprehension, passage 1, question 5' },
    keyText: 'the number of chains in the molecule',
    answer: { line: 'Paragraph 6 lists four things the photo gave. Paragraph 12 says it did not give the number of chains.' },
    steps: [
      'Flip the job: on an EXCEPT question four choices are in the passage. You are hunting the one that is not.',
      'Check off four in one sentence. Paragraph 6, sentence 4 lists a helix, the climb per turn, the spacing between bases and the diameter.',
      'Paragraph 12, sentence 2 settles it in one line: the photo said helix, gave three numbers, and "did not say how many chains there were."'
    ],
    choices: [
      { text: 'the distance the helix climbs in one full turn', role: 'stated', family: 'rc-stated', note: 'Paragraph 6: the spacing between the dashes gave the climb per turn.' },
      { text: 'the spacing between stacked bases', role: 'stated', family: 'rc-stated', note: 'Paragraph 6: the smudges at top and bottom gave the 3.4 angstrom spacing.' },
      { text: 'the diameter of the molecule', role: 'stated', family: 'rc-stated', note: 'Paragraph 6: the width of the pattern gave the diameter.' },
      { text: 'the fact that the molecule is a helix', role: 'stated', family: 'rc-stated', note: 'Paragraph 6: the X of dashes meant a helix.' },
      { text: 'the number of chains in the molecule', role: 'key', note: 'Paragraph 12: the photo did not say how many chains there were.' }
    ],
    lockIt: 'EXCEPT: check off every choice the passage supports. The one left standing is the answer.',
    hook: null,
    playWith: { label: 'Reading player: this passage on its own, with highlighting and cross-out', href: 'tools/rc/index.html#start/passage/rc-o15', state: { passage: 'rc-o15' }, expect: ['rc.js'], routing: 'Works today, but the player shows an elapsed clock, a pace bar and a correct-count headline; see flags.' },
    video: { slot: 'rc.except', title: 'EXCEPT questions: check off four', id: null, start: null },
    visual: {
      type: 'rc.evidence',
      passage: 'rc-o15',
      spans: [
        { p: 6, s: 4, quote: 'The X of dashes meant a helix', role: 'stated', choice: 'the fact that the molecule is a helix' },
        { p: 6, s: 4, quote: 'the spacing between the dashes gave the distance the helix climbs in one full turn', role: 'stated', choice: 'the distance the helix climbs in one full turn' },
        { p: 6, s: 4, quote: 'the 3.4 angstrom spacing between stacked bases', role: 'stated', choice: 'the spacing between stacked bases' },
        { p: 6, s: 4, quote: 'the width of the pattern gave the molecule\'s diameter', role: 'stated', choice: 'the diameter of the molecule' },
        { p: 12, s: 2, quote: 'it did not say how many chains there were', role: 'key', choice: 'the number of chains in the molecule' }
      ],
      reuse: 'Passage text and the per-choice proof lines already stored in tools/rc/data/bank.js',
      alt: 'Paragraph 6, sentence 4 with four phrases marked, each tagged with the served letter of the choice it supports: helix, climb per turn, spacing between bases, diameter. Below, paragraph 12, sentence 2 is highlighted as the answer: the photo did not say how many chains there were.',
      caption: 'Four choices check off in one sentence of paragraph 6. The fifth is denied in paragraph 12.'
    },
    demoPick: 'the spacing between stacked bases',
    flags: [
      { kind: 'play-target', text: 'The RC player (tools/rc/rc.js) shows an elapsed clock, a per-passage pace bar, 10 and 12 minute cues, and an "N of M correct" results headline, even for a single passage. House rule: no timers or scores outside full timed tests.' }
    ]
  },
  {
    pid: 'RC-3',
    qid: 'rc:rc-o15-q07',
    servesAlso: [],
    section: 'rc',
    subtopic: 'rc.inference',
    difficulty: { band: 3, from: 'question type (inference across two paragraphs); the RC bank has no difficulty field' },
    source: { bank: 'tools/rc/data/bank.js', global: 'ACE_RC_BANK', locator: { passage: 'rc-o15', id: 'rc-o15-q07' }, servedAs: 'Full-Length Test 1, Reading Comprehension, passage 1, question 7' },
    keyText: 'the A form of the molecule rather than DNA in general',
    answer: { line: 'Paragraph 7 says the notice was for the crystalline helix, and paragraph 6 says the crystalline form is the A form.' },
    steps: [
      'Find the notice. Paragraph 7, sentence 3: a mock death notice "for the crystalline DNA helix," a joke often read, unfairly, as denying DNA was helical at all.',
      'Chase the key word back. Crystalline was defined in paragraph 6, sentence 1: the ordered, crystalline arrangement "she called the A form."',
      'Join the two. The notice was about the A form, not DNA in general. That is why the author calls the broad reading unfair.'
    ],
    choices: [
      { text: 'the A form of the molecule rather than DNA in general', role: 'key', note: 'Crystalline in paragraph 7 is the A form from paragraph 6.' },
      { text: 'the three-chain model built in Cambridge the previous year', role: 'trap', family: 'rc-misplaced', note: 'The Cambridge model is in paragraph 8, and the notice was about a form of DNA, not a model.' },
      { text: 'the B form, which Franklin had not yet photographed', role: 'trap', family: 'rc-timeline', note: 'Photo 51, the B form image, was taken in May 1952, two months before the notice.' },
      { text: 'Astbury\'s early patterns from poorly ordered fibers', role: 'trap', family: 'rc-other-paragraph', note: 'Astbury\'s patterns are in paragraph 4 and have no link to the notice.' },
      { text: 'the end of Franklin\'s collaboration with Gosling', role: 'trap', family: 'rc-contradicted', note: 'She and Gosling sent the notice together, and in paragraph 10 they publish together, so the collaboration went on.' }
    ],
    lockIt: 'Inference: the answer is not stated, but every piece of it is in the text.',
    hook: 'Join the lines; add no facts.',
    playWith: { label: 'Reading player: this passage on its own, with highlighting and cross-out', href: 'tools/rc/index.html#start/passage/rc-o15', state: { passage: 'rc-o15' }, expect: ['rc.js'], routing: 'Works today, but the player shows an elapsed clock, a pace bar and a correct-count headline; see flags.' },
    video: { slot: 'rc.inference', title: 'Inference questions: join two lines', id: null, start: null },
    visual: {
      type: 'rc.evidence',
      passage: 'rc-o15',
      spans: [
        { p: 7, s: 3, quote: 'a mock death notice for the crystalline DNA helix', role: 'key', tag: '1' },
        { p: 6, s: 1, quote: 'ordered, crystalline arrangement she called the A form', role: 'key', tag: '2' }
      ],
      link: { from: '1', to: '2', label: 'crystalline = the A form' },
      reuse: 'Passage text and both proof lines from tools/rc/data/bank.js',
      alt: 'Two highlighted lines joined by a connector labeled crystalline equals the A form: line 1, paragraph 7, sentence 3, the mock death notice for the crystalline DNA helix, and line 2, paragraph 6, sentence 1, the crystalline arrangement she called the A form.',
      caption: 'Line 1 plus line 2: the notice was about the A form.'
    },
    demoPick: 'the B form, which Franklin had not yet photographed',
    flags: [
      { kind: 'play-target', text: 'The RC player (tools/rc/rc.js) shows an elapsed clock, a per-passage pace bar, 10 and 12 minute cues, and an "N of M correct" results headline, even for a single passage. House rule: no timers or scores outside full timed tests.' }
    ]
  }
];

// What changed in each entry after the expert review (v2 -> v3). Coach record only.
const CHANGES = {
  'BIO-1': ['Alias pool:BIO_g011 held: its stem omits "recessive" and "Hardy-Weinberg" (premises gate); bank-copy flag added', 'Grid header now "100 alleles from the gene pool"', '0.1 note now names the likeliest source, rooting twice', 'Families: unit-slip and one-step-too-far, labels kept', 'Caption says where to look instead of repeating the answer line'],
  'BIO-2': ['Sodium trap relabeled "Moved the salt, not water", family other-conditions, note explains the permeant-solute case', 'Hook rewritten: "Count the ions: NaCl gives 2, CaCl2 gives 3, glucose gives 1."', 'BioReal small labels kept as the one flagged exception (fix belongs in tools/bio/bio-real.js)'],
  'BIO-3': ['Matrix note corrected: succinate dehydrogenase (complex II) is a Krebs enzyme in the inner membrane', 'Step 3: all four complexes sit in the inner membrane; I, III and IV pump', 'Visual: four complexes labeled I to IV (II pumps none); the return H+ arrow now runs through the ATP synthase stalk into the matrix, in the H+ color; small arrowheads', 'Families: neighbor-fact for all four traps; video slot equals subtopic', 'Hook trimmed to "Pumps in the wall, protons in the gap."'],
  'GC-1': ['lockIt: "(valence electrons - one per bond) / 2"', 'Notes for 0 (BF3 contrast) and 3 (bonding pairs on P, pairs on each Cl) rewritten to name the pull', 'Families: other-conditions, other-unit (concept), neighbor-fact, one-step-too-far', 'Caption says what the picture adds; P pair drawn larger, Cl pairs spread around each atom; video slot equals subtopic'],
  'GC-2': ['lockIt scoped to periods 2 and 3', 'Last choice: family read-backward, note "the plain trend read in decreasing order"', 'Middle choices: family half-right', 'Visual: rank numbers 1 to 5 under the question elements, label halos, dip ellipses clear of the labels', 'Stem-style flag (hint in the stem); Si rounding note softened to no action; hook dropped'],
  'GC-3': ['Caption: three landmarks, only halfway answers', 'Step 1 opens with a move; step 3 brackets pKa between 4 and 5 without a calculator', 'Note for 7.00 rewritten; key note no longer repeats pH = pKa; hook dropped', 'Halfway label moved clear of the 25 mL line; label reads "halfway: 4.74"', 'Stem-style flag (K_a underscore, principle stated in the stem); K_a typeset by the player', 'Families: other-question, other-conditions, neighbor-fact; video slot equals subtopic'],
  'OC-1': ['Product mark moved to the benzylic carbon ("Br on the benzylic C"), no longer over the Br letters', 'Marks and lockIt say secondary and primary in words', 'Hook: "Light plus Br2: Br goes benzylic, if that carbon has an H."', 'Caption says what to look at; families other-conditions, reversed, close-second; video slot equals subtopic'],
  'OC-2': ['Step 3 explains the renumbering to 2-bromo-2-methylbutane', 'No-shift note: "Some of this forms, but most cations shift before bromide arrives."', 'lockIt: a cation shifts when the move makes it more stable', 'Visual: product panel off, mechanism a stepper on phones, energy labels "secondary cation" and "tertiary cation" in sans, start label clear of the axis', 'Families: other-conditions and one-step-short'],
  'OC-3': ['P0 build: stem-drawing flag updated for 5c5ec38 (the served stem now draws implicit H); the explainer picture and steps are unchanged pending Thomas', 'BLOCKING item fixed. Method switched to the swap: get H onto the dash or wedge, trace, count flips; matches the picture as drawn', 'Note on (2S, 3R) corrected: a diastereomer, from tracing C2 as drawn; (2S, 3S) note: the enantiomer, and this molecule cannot be meso', 'False general claim about two halogens and meso removed', 'Stereo cards now built from the drawing (wedges, positions) and checked against RDKit and a signed-volume reading; no fixed "in back" or "clockwise" text', 'Step 1 opens with a move; relations checked by RDKit; play-target flag for the l3-wedge root ("wrong side" copy, no flat-H case); stem-drawing flag'],
  'QR-1': ['Visual: the 10 x 10 grid and the copied chart replaced by a 100-unit strip with text labels and a bracket, plus the question chart outlined after Check', 'Key note: "5,300 weekend visitors out of 10,000 in all."', 'Step 1 opens with a move; the "chart starts on Tuesday" patch removed from step 3 and raised as a stem-style flag', 'Families: neighbor-fact, other-question, looks-bigger, miscount; hook dropped'],
  'QR-2': ['Renderer: ghost sides drawn after the main triangle, so root 74 and root 109 reach the far vertex; labels clear of the arms with halos', 'Note for 2 finishes the arithmetic (root 4 is 2) and names the 0 degree limit; note for 12 names the 180 degree limit', 'Step 1 opens with a move; answer line is the result only; hook dropped', 'Families: other-conditions and operation-flip'],
  'QR-3': ['Crowd of 10,000, so every count is a whole person (198, 2, 980, 8,820)', 'Tree shows branch rates; the numerator leaf outlined solid, the denominator leaves dashed, both with word tags', 'playWith now points at the QR engine p-cond view (qrProbTable), which can set prevalence, sensitivity and specificity', 'Families: flipped-condition, other-question, one-step-short, assumed-equal'],
  'PAT-1': ['Steps rewritten: read the choices first; the hard calls are the ends (2 vs 4, 1 vs 3); the middle is the easy 6 degree gap', 'lockIt no longer tells students to lock the ends', 'All three traps in the engine family "Swapped a close pair", labels say why each pulls; 2-1-4-3 now has its pull', 'Fan arms numbered on phones (not color alone); truth panels four across; timer flag for angles.html; hook dropped'],
  'PAT-2': ['Notes say "the answer\'s pattern" (no "right" in two senses); turned note: a quarter turn, columns became rows', 'Families equal the engine tags (flipped, wrong-line, shifted); the wrong-line note names both readings', 'Alt rewritten: 42 words, 3 sentences', 'Timer flag names holepunch.html only; hook dropped'],
  'PAT-3': ['Visual: x-ray outline replaced by floor 1 on its own with the answer cube outlined and its painted side marked; maps cue which edge is which; labels driven by k', 'Face words by screen direction: the hidden sides face upper left and upper right', 'Slip counts recomputed by the build (2, 3, 4; none gives 5); missType concept via family pat:cubes:hidden-faces', 'Routing note corrected: cubes.html opens in teach mode, clock idle, pill visible'],
  'RC-1': ['P0 build: trap label "Reversed" dropped (one word; labels run 2 to 5 words); the family name Read backward shows instead', 'Blood-cells note: no outside "first", names the extreme "only"; short-chain note names the "tetra" pull', 'Key span extended through "too dull to carry hereditary instructions"', 'Step 2 points to the picture instead of re-quoting; hook dropped', 'Play-target flag: the RC player shows a clock, a pace bar and a correct-count headline'],
  'RC-2': ['Step 1 opens with a move; step 3 notes that paragraph 12, sentence 2 settles all five', 'Stated choices use family rc-stated (missType n/a); the player adds the EXCEPT cross-off line when the pick is a stated choice', 'Hook dropped; play-target flag'],
  'RC-3': ['Span tags are 1 and 2, not A and B; caption "Line 1 plus line 2"', 'lockIt no longer claims every inference joins two sentences', 'Hook: "Join the lines; add no facts."; Gosling note cites paragraph 10', 'Play-target flag']
};

module.exports = {
  schema: 'ace.explainer-src/1',
  group: 'pilot',
  batch: 'pilot',
  title: 'Explainer pilot: 18 real questions, 3 per section',
  entries: ENTRIES,
  changes: CHANGES
};
