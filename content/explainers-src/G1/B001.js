// content/explainers-src/G1/B001.js: batch B001, Full-Length Test 1 Biology
// (16 items: genetics, body systems, cellular respiration, nerves and
// hormones). Written in Thomas's coaching voice
// (docs/release-2026-10-30/questions/voice-codex.md) from the independent
// expert's blind solve (docs/explainers/solves/B001.json: 16 of 16 keys agree,
// no key or picture disputes).
//
// Authoring source, never published: /content/explainers-src/* is
// force-redirected like /docs/*. The build (scripts/explainers/build.mjs)
// checks every entry against tools/mock/data/full-mocks.js (key text, every
// choice text, stem hash), runs the copy rules, recomputes the pictures it can
// (the Punnett square and the testcross from compute-bio.js, the genetic code,
// the carrier ledger, the sodium budget), and writes the student sidecars and
// the coach records.
//
// Visuals (production-plan.md, G1 row B001): bio.punnett (the X-linked square
// and the linked-gene testcross) and bio.diagram drawings: codon (the third
// genetics item; a Punnett square cannot show a codon), the body-system
// schematics (acid-base, gland-density, gastric-gland, nephron-budget,
// glomerulus), the respiration drawings (step-ladder, etc-chain,
// compare-table) and the nerve and hormone drawings (collecting-duct,
// ap-trace). Renderers: tools/explain/visuals/bio-punnett.js and
// bio-schematics.js.
'use strict';

const FM = 'tools/mock/data/full-mocks.js';
const src = (id, n) => ({ bank: FM, global: 'ACE_FULL_MOCKS', locator: { mock: 'FULL_1', section: 'bio', id }, servedAs: 'Full-Length Test 1, Natural Sciences, question ' + n });
const band = (d) => ({ band: d, from: 'bank field d (1-3)' });
const SWATCH_ETC = [
  { sw: '#7a4fb0', label: 'Complexes I, III, IV pump H+' },
  { sw: '#d9cfe9', label: 'Complex II pumps none' },
  { sw: '#c9a84c', label: 'ATP synthase' },
  { sw: '#6b3aa8', label: 'Electrons: I and II both pass them to Q, then on to III and IV' }
];

const ENTRIES = [
  /* ===================== Beyond Mendel and molecular tools ===================== */
  {
    qid: 'fm:bio:BIO_g064',
    premises: ['X-linked recessive'],
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.genetics.sex-linked',
    difficulty: band(2),
    source: src('bio:BIO_g064', 3),
    keyText: 'All sons affected, all daughters carriers',
    answer: { line: 'Both of the mother\'s X chromosomes carry the allele, so every child gets one. Sons have no second X to mask it.' },
    steps: [
      'Write the parents first: he is X^N Y, and she is X^n X^n, with the allele on both X chromosomes.',
      'Every child gets one X from her, and both of hers carry n. So every child gets an n.',
      'Sons get the Y from him. X^n Y has nothing to mask the n, so every son is colorblind.',
      'Daughters get his X^N, which covers the n. X^N X^n sees color normally and carries the allele.'
    ],
    choices: [
      { text: 'All daughters affected and all sons unaffected', role: 'trap', family: 'reversed', trap: 'Swapped the sexes', note: 'This flips who gets what. The father gives each daughter his normal X, which covers the allele, and gives each son only a Y.' },
      { text: '25% affected each', role: 'trap', family: 'other-conditions', trap: 'Carrier by carrier ratio', note: 'One in four is the autosomal carrier by carrier cross, where each parent passes the allele by chance. Here the mother passes it to every child.' },
      { text: 'All sons normal', role: 'trap', family: 'neighbor-fact', trap: 'True of the daughters', note: 'Normal vision is true of the daughters. A son takes his only X from his mother, and both of hers carry the allele.' },
      { text: 'No effect', role: 'trap', family: 'missed-exception', trap: 'One normal allele masks it', note: 'Masking needs a second allele. Sons have one X, so nothing covers the recessive allele, and every daughter still carries it.' },
      { text: 'All sons affected, all daughters carriers', role: 'key', note: 'Sons: X^n from her plus his Y. Daughters: X^n from her plus his X^N.' }
    ],
    lockIt: 'X-linked recessive: an affected mother gives every son the trait and every daughter the allele.',
    hook: 'Criss-cross: mother to son.',
    playWith: { label: 'Punnett solver: choose Sex-linked, then cross XnXn with XNY', href: 'tools/bio/bio-genetics.html', state: { visualizer: 'initPunnett', mode: 'xlinked', p1: 'XnXn', p2: 'XNY' }, expect: ['initPunnett', 'data-pmode="xlinked"'], routing: 'Works today: the Punnett solver is the first Genetics lab tab and opens by default. Presetting the mode and the genotypes needs a small state reader.' },
    video: { slot: 'bio.genetics.sex-linked', title: 'X-linked crosses: follow the X', id: null, start: null },
    visual: {
      type: 'bio.punnett',
      cross: { mode: 'xlinked', p1: 'XnXn', p2: 'XNY', p1Label: 'Mother', p2Label: 'Father', statusWords: { affected: 'colorblind', carrier: 'carrier', unaffected: 'normal vision' }, countWords: { affected: 'colorblind', carrier: 'carriers', unaffected: 'normal vision' } },
      claim: { sons: 'affected', daughters: 'carrier' },
      focus: 'every-child',
      reuse: 'Pure port of the Punnett solver state (renderPunnett, gametesFromGenotype, combineGametes, phenotypeOf in tools/bio/bio-shared.js); both maternal X chromosomes kept, so the square shows four children',
      alt: 'A Punnett square crossing a colorblind mother, whose two X chromosomes both carry the allele, with a father whose X is normal. Both daughters are carriers with normal vision and both sons are colorblind. A box under the square, outlined as the answer, counts 2 of 2 sons colorblind and 2 of 2 daughters carriers.',
      caption: 'Read it row by row: the father\'s X makes carrier daughters, his Y makes colorblind sons.'
    },
    demoPick: '25% affected each',
    flags: [
      { kind: 'stem-style', text: 'Choice texts are shorthand and not parallel ("25% affected each", "No effect", "All sons normal"). Suggested wording for Thomas to review (not applied): "One in four children is affected, sons and daughters alike", "The children are unaffected and carry no allele", "All sons have normal color vision". Key unchanged.' }
    ]
  },
  {
    qid: 'fm:bio:BIO_g015',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.molecular.mutations',
    difficulty: band(2),
    source: src('bio:BIO_g015', 29),
    keyText: 'Silent',
    answer: { line: 'The code has synonyms. A base swap that lands on another codon for the same amino acid leaves the protein untouched.' },
    steps: [
      'Read what changed: one base pair, and the protein came out identical.',
      'Know the code is redundant. Most amino acids have several codons, often differing only in the third base.',
      'Name it by the protein. Same protein: silent. One amino acid swapped: missense. Early stop: nonsense.'
    ],
    choices: [
      { text: 'Missense', role: 'trap', family: 'neighbor-fact', trap: 'One amino acid swapped', note: 'Missense is the next box over: the new codon spells a different amino acid, so the sequence changes. Here it did not.' },
      { text: 'Silent', role: 'key', note: 'The new codon is a synonym, so the same amino acid goes in.' },
      { text: 'Frameshift', role: 'trap', family: 'other-conditions', trap: 'Needs bases added or lost', note: 'A frameshift comes from inserting or deleting bases in a number not divisible by three. A single swap keeps the reading frame.' },
      { text: 'Nonsense', role: 'trap', family: 'other-conditions', trap: 'Needs a stop codon', note: 'Nonsense is the case where the new codon is a stop, which cuts the protein short. This protein came out whole.' },
      { text: 'Transversion', role: 'trap', family: 'other-question', trap: 'Names the chemistry', note: 'Transversion describes the swap itself, a purine for a pyrimidine. It says nothing about the protein, and the protein is what the stem asks about.' }
    ],
    lockIt: 'Name point mutations by the protein: same, swapped or stopped. Same protein is silent.',
    hook: null,
    playWith: { label: 'Mutation sim: press Silent, then Missense, and compare the protein each one makes', href: 'tools/bio/bio-genetics.html#node-mutations', state: { visualizer: 'initMutationSim', mutation: 'silent' }, expect: ['initMutationSim', 'data-mut="silent"', 'data-mut="missense"'], routing: 'The page and the mutations node work today. The Mutation Sim is a Genetics lab tab with no deep link yet; the anchor opens the mutations node.' },
    video: { slot: 'bio.molecular.mutations', title: 'Point mutations: name them by the protein', id: null, start: null },
    visual: {
      type: 'bio.diagram',
      diagram: 'codon',
      labels: ['before', 'after', 'synonyms', 'outcomes'],
      focus: 'silent',
      title: 'One base pair changes (mRNA shown)',
      codon: { from: 'GCU', to: 'GCC' },
      outcomes: [
        { when: 'Same protein', name: 'Silent', key: true },
        { when: 'One amino acid swapped', name: 'Missense' },
        { when: 'Early stop codon', name: 'Nonsense' },
        { when: 'Reading frame shifted', name: 'Frameshift' }
      ],
      aside: 'Transversion names the base swap itself, a purine for a pyrimidine, not what the protein does.',
      reuse: 'new; amino acids computed from the standard genetic code (tools/explain/visuals/compute-bio.js), the same code the Mutation Sim translates with',
      alt: 'Two codon cards, before GCU and after GCC, with the changed third base outlined; both code for Ala. A row lists all four Ala codons with both marked. Below, outcomes are sorted by what the protein does, and Same protein, Silent is outlined as the answer.',
      caption: 'Find the changed base, then read what the protein did. Both codons spell the same amino acid.'
    },
    demoPick: 'Missense',
    flags: []
  },
  {
    qid: 'fm:bio:BIO_g061',
    premises: ['centimorgans'],
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.genetics.linkage',
    difficulty: band(2),
    source: src('bio:BIO_g061', 37),
    keyText: '25%',
    answer: { line: 'A centimorgan is defined as 1 percent recombinant offspring, so 25 centimorgans reads straight across as 25%.' },
    steps: [
      'Know the definition first: 1 map unit, or centimorgan, is 1 percent recombinant offspring.',
      'Read straight across. 25 centimorgans means about 25% of testcross offspring are recombinant.',
      'Check it against the ceiling. Recombinants never pass 50%, and 25 sits under it.',
      'The third gene changes nothing here.'
    ],
    choices: [
      { text: '5%', role: 'trap', family: 'other-conditions', trap: 'Genes linked more tightly', note: 'No rule turns 25 map units into 5%. That value fits genes about 5 centimorgans apart, linked far more tightly.' },
      { text: '12.5%', role: 'trap', family: 'one-step-too-far', trap: 'Halved the distance', note: '12.5% is one recombinant class. There are two, and together they make 25%.' },
      { text: '25%', role: 'key', note: 'Map units are percent recombinants, by definition.' },
      { text: '50%', role: 'trap', family: 'other-conditions', trap: 'Unlinked genes', note: '50% is what genes show when they assort independently, unlinked or very far apart. These two are linked at 25 map units.' },
      { text: '75%', role: 'trap', family: 'other-question', trap: 'The parental share', note: '75% is the parental offspring, 100 minus 25. It also sits above the 50% ceiling, so it can never be a recombination frequency.' }
    ],
    lockIt: 'One map unit is 1 percent recombinant offspring, up to a ceiling of 50 percent.',
    hook: null,
    playWith: { label: 'Linkage map: type 25 as the gene A to gene B recombination frequency and see it as 25 cM', href: 'tools/bio/bio-genetics.html#node-linkage', state: { visualizer: 'initLinkage', rfAB: 25 }, expect: ['initLinkage', 'id="rfAB"'], routing: 'The page and the linkage node work today. The Linkage Map is a Genetics lab tab with no deep link yet, and its value needs a state reader.' },
    video: { slot: 'bio.genetics.linkage', title: 'Map units are recombinants', id: null, start: null },
    visual: {
      type: 'bio.punnett',
      cross: { mode: 'testcross', genes: ['G', 'H'], mapDistance: 25 },
      rule: '1 map unit means 1 percent recombinant offspring.',
      parentalLabel: 'Parental, old pairings',
      recombinantLabel: 'Recombinant, new pairings',
      scale: { title: 'Recombination frequency, percent', notes: ['The bar at 50 is the ceiling: genes that far apart act unlinked.'] },
      focus: 'recombinant-classes',
      reuse: 'Port of the Punnett solver state with linked genes (renderPunnett in tools/bio/bio-shared.js; map distance as in initLinkage); classes computed by compute-bio.js',
      alt: 'A chromosome with genes G and H 25 map units apart. Below, four testcross offspring classes: two parental at 37.5% each, 75% together, and two recombinant at 12.5% each, outlined as the answer, 25% together. A scale from 0 to 100 marks 25 and a ceiling bar at 50.',
      caption: 'Add the two recombinant rows: 12.5 plus 12.5 is 25, the same number as the map distance.'
    },
    demoPick: '12.5%',
    flags: [
      { kind: 'bank-copy', text: 'The bank why says "The word approximate matters at larger distances", but this stem does not contain the word approximate. Wording only; bank text untouched, key unchanged.' },
      { kind: 'note', text: 'Concept-first rule: the 5% choice has no real misconception behind it (no rule turns 25 cM into 5). A rewrite candidate for a misconception-based distractor, such as a double-crossover reading; key unchanged.' }
    ]
  },

  /* ============================ Body systems at work ============================ */
  {
    qid: 'fm:bio:BIO_p044',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.physiology.respiratory',
    difficulty: band(2),
    source: src('bio:BIO_p044', 2),
    keyText: 'Respiratory alkalosis',
    answer: { line: 'Fast, deep breathing blows off CO2. Less CO2 means less H+, so pH rises, and the lungs did it.' },
    steps: [
      'Follow the CO2. Rapid, deep breathing at rest blows it off faster than the body makes it.',
      'Less CO2 pulls the carbonic acid equilibrium to the left. That uses up H+, so pH rises: alkalosis.',
      'Ask what moved it. The lungs did, so the label is respiratory.'
    ],
    choices: [
      { text: 'Metabolic acidosis', role: 'trap', family: 'reversed', trap: 'Cause and effect swapped', note: 'Metabolic acidosis, from ketones or lactic acid, drives fast breathing as the fix. Here the breathing came first and caused the change.' },
      { text: 'Respiratory acidosis', role: 'trap', family: 'other-conditions', trap: 'Breathing too slowly', note: 'That is hypoventilation: CO2 builds up, H+ rises and pH falls. Blowing CO2 off runs the other way.' },
      { text: 'Metabolic alkalosis from a loss of hydrogen ions', role: 'trap', family: 'half-right', trap: 'Right direction, other cause', note: 'Alkalosis holds. But H+ lost from the gut, as in vomiting, is metabolic, and here CO2 left through the lungs.' },
      { text: 'No pH change', role: 'trap', family: 'one-step-short', trap: 'Stopped at the breathing', note: 'Breathing is a fast pH lever: change how much CO2 you exhale and blood pH moves within minutes.' },
      { text: 'Respiratory alkalosis', role: 'key', note: 'Ventilation moved pH up: respiratory alkalosis.' }
    ],
    lockIt: 'Ask which way pH moved and what moved it. Lungs moving CO2 means respiratory.',
    hook: 'Hold your breath: acidosis. Overbreathe: alkalosis.',
    playWith: { label: 'Respiratory node: read how blowing off CO2 leads to respiratory alkalosis', href: 'tools/bio/bio-physiology.html#node-respiratory', state: { node: 'respiratory' }, expect: ['node-respiratory', 'respiratory alkalosis'], routing: 'Works today.' },
    video: { slot: 'bio.physiology.respiratory', title: 'Breathing sets blood pH', id: null, start: null },
    visual: {
      type: 'bio.diagram',
      diagram: 'acid-base',
      labels: ['equation', 'shift', 'respiratory-acidosis', 'respiratory-alkalosis', 'metabolic-acidosis', 'metabolic-alkalosis'],
      focus: 'respiratory-alkalosis',
      driver: 'Fast, deep breathing: CO2 out through the lungs',
      equation: ['CO2 + H2O', 'H2CO3', 'H+ + HCO3-'],
      shift: 'left',
      shiftLabel: 'less CO2 pulls it left',
      result: 'H+ is used up, so pH rises',
      grid: {
        rows: ['Respiratory', 'Metabolic'],
        cols: ['Acidosis', 'Alkalosis'],
        cells: [
          { r: 0, c: 0, cause: 'Breathing too slowly: CO2 builds up' },
          { r: 0, c: 1, cause: 'Breathing too fast: CO2 blown off', key: true },
          { r: 1, c: 0, cause: 'Acid gained or HCO3- lost, as with ketones' },
          { r: 1, c: 1, cause: 'Stomach acid lost, as with vomiting' }
        ]
      },
      reuse: 'new schematic; the equation as in the Respiratory node of tools/bio/bio-physiology.html',
      alt: 'The carbonic acid equation, CO2 plus water, carbonic acid, H+ plus bicarbonate, with CO2 leaving through the lungs and an arrow showing the shift to the left. Below, a two by two grid sorts acidosis and alkalosis by respiratory or metabolic cause, and respiratory alkalosis, breathing too fast, is outlined as the answer.',
      caption: 'Start at the lungs: CO2 out pulls the equation left. Then find the cell where breathing raised pH.'
    },
    demoPick: 'Metabolic acidosis',
    flags: []
  },
  {
    qid: 'fm:bio:BIO_p090',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.physiology.integumentary',
    difficulty: band(2),
    source: src('bio:BIO_p090', 4),
    keyText: 'Palms, soles, axillae',
    answer: { line: 'Palms and soles have the densest eccrine sweat glands, and the axillae are where the apocrine glands cluster.' },
    steps: [
      'Picture the map. Sweat glands are not spread evenly: density changes several-fold from one region to the next.',
      'Palms and soles lead for eccrine glands, the watery, cooling kind. That is why nervous sweat shows up in your hands first.',
      'Add the axillae (armpits) for the other kind: apocrine glands cluster there. Together they make the concentrated set.',
      'Cross off the low-density sites.'
    ],
    choices: [
      { text: 'Back', role: 'trap', family: 'looks-bigger', trap: 'Big area, low density', note: 'The back is a big surface, so it can shed a lot of sweat in total. Per patch of skin, its glands are sparse.' },
      { text: 'Palms, soles, axillae', role: 'key', note: 'Eccrine density leads on the palms and soles; apocrine glands cluster in the axillae.' },
      { text: 'Spread at the same density over the entire body surface', role: 'trap', family: 'assumed-equal', trap: 'Even spread', note: 'Density varies several-fold, from hundreds of glands per square centimeter on the palm to far fewer on the trunk.' },
      { text: 'Eyelids', role: 'trap', family: 'neighbor-fact', trap: 'Oil glands, not sweat', note: 'The lid margin is busy with glands, but they are mostly oil-making. Eyelid skin itself carries few sweat glands.' },
      { text: 'Lips', role: 'trap', family: 'reversed', trap: 'Bottom of the list', note: 'The red margin of the lips has essentially no sweat glands, one reason lips dry out. It sits at the bottom, not the top.' }
    ],
    lockIt: 'Eccrine glands: densest on the palms and soles. Apocrine glands: the axillae.',
    hook: null,
    playWith: { label: 'Skin lab: open Skin layers and appendages to see eccrine and apocrine sweat glands', href: 'tools/bio/bio-physiology.html', state: { visualizer: 'initBodySkin', mode: 'layers' }, expect: ['initBodySkin', 'data-skin="layers"', 'eccrine sweat gland', 'apocrine'], routing: 'Works today: Skin and Skeleton is a physiology lab tab with no deep link yet; Skin layers is its first mode.' },
    video: { slot: 'bio.physiology.integumentary', title: 'Skin glands: eccrine, apocrine, oil', id: null, start: null },
    visual: {
      type: 'bio.diagram',
      diagram: 'gland-density',
      labels: ['palms-soles', 'forehead', 'axillae', 'back', 'eyelids', 'lips'],
      focus: 'palms-soles-axillae',
      scaleTitle: 'Eccrine sweat glands per patch of skin',
      levels: ['none', 'few', 'some', 'many', 'most'],
      rows: [
        { site: 'Palms and soles', level: 4, note: 'Densest eccrine glands: watery sweat, grip', key: true },
        { site: 'Forehead', level: 3, note: 'Dense eccrine glands' },
        { site: 'Axillae', level: 2, note: 'Apocrine glands cluster here', extra: 'apocrine', key: true },
        { site: 'Back', level: 1, note: 'Big surface, sparse glands' },
        { site: 'Eyelids', level: 1, note: 'Mostly oil glands at the lid margin' },
        { site: 'Lips, red margin', level: 0, note: 'No sweat glands' }
      ],
      footnote: 'The dots rank eccrine density. The axillae make the answer for their apocrine glands.',
      reuse: 'new schematic; gland types as in the Skin and Skeleton lab (initBodySkin in tools/bio/bio-shared.js)',
      alt: 'Six skin sites ranked by eccrine sweat gland density with dots: palms and soles most, forehead many, axillae some plus an apocrine tag, back few, eyelids few, lips none. Palms and soles and the axillae are outlined as the answer.',
      caption: 'Top row for eccrine density, the apocrine tag for the axillae: together they are the answer choice.'
    },
    demoPick: 'Back',
    flags: [
      { kind: 'bank-copy', text: 'The key text pairs palms and soles (eccrine glands) with the axillae (apocrine glands), and the bank why says glands are densest on the palms, soles and axillae without that split. The explainer splits the gland types. Optional for Thomas: the key text could name the gland types; any change is his, in the bank. Key unchanged.' }
    ]
  },
  {
    qid: 'fm:bio:BIO_p019',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.physiology.digestive',
    difficulty: band(2),
    source: src('bio:BIO_p019', 21),
    keyText: 'Parietal cells',
    answer: { line: 'Parietal cells pump H+ into the stomach with their H+/K+ ATPase, and Cl- follows. They also make intrinsic factor.' },
    steps: [
      'Sort the cells by their products.',
      'Parietal cells make the acid with a proton pump, plus intrinsic factor for vitamin B12.',
      'Chief cells make pepsinogen, which the acid switches on. Mucous cells make mucus, and G cells make gastrin.'
    ],
    choices: [
      { text: 'Chief cells', role: 'trap', family: 'neighbor-fact', trap: 'The enzyme maker', note: 'Chief cells sit right beside parietal cells, which is why they pull. They release pepsinogen, the enzyme precursor the acid then activates.' },
      { text: 'Goblet cells', role: 'trap', family: 'neighbor-fact', trap: 'Intestine, not stomach', note: 'Goblet cells make mucus in the intestine and airways. The stomach\'s mucus comes from its own surface and neck cells.' },
      { text: 'Parietal cells', role: 'key', note: 'The proton pump of the parietal cell; Cl- follows the H+.' },
      { text: 'Mucous neck cells', role: 'trap', family: 'neighbor-fact', trap: 'The acid shield', note: 'They make the mucus that protects the lining from the acid, not the acid itself.' },
      { text: 'G cells', role: 'trap', family: 'one-step-short', trap: 'The signal, not the source', note: 'G cells release gastrin, the hormone that tells parietal cells to make acid. Pick them and you stop one step before the source.' }
    ],
    lockIt: 'Parietal for acid, chief for enzyme: the acid turns pepsinogen into pepsin.',
    hook: null,
    playWith: { label: 'Digestive lab: open Stomach to see HCl, pepsin and intrinsic factor', href: 'tools/bio/bio-physiology.html', state: { visualizer: 'initBodyDigestive', mode: 'stomach' }, expect: ['initBodyDigestive', 'data-dig="stomach"'], routing: 'Works today: Digestive is a physiology lab tab with no deep link yet; the Stomach mode needs one press.' },
    video: { slot: 'bio.physiology.digestive', title: 'The stomach lining, cell by cell', id: null, start: null },
    visual: {
      type: 'bio.diagram',
      diagram: 'gastric-gland',
      labels: ['mucous-neck', 'parietal', 'chief', 'g-cell', 'goblet'],
      focus: 'parietal',
      lumenLabel: 'Stomach lumen',
      acidLabel: 'HCl',
      cells: [
        { id: 'neck', n: 1, label: 'Mucous neck cells: mucus' },
        { id: 'parietal', n: 2, label: 'Parietal cells: HCl and intrinsic factor', key: true },
        { id: 'chief', n: 3, label: 'Chief cells: pepsinogen' },
        { id: 'g', n: 4, label: 'G cells: gastrin, the signal to make acid', where: 'Antrum glands' },
        { id: 'goblet', n: 5, label: 'Goblet cells: mucus in the intestine and airways', where: 'Small intestine' }
      ],
      reuse: 'new schematic, styled to match the physiology hub',
      alt: 'A gastric gland cut lengthwise: mucous neck cells near the top, parietal cells in the middle, numbered 2 and marked as the answer, with an arrow carrying HCl into the stomach lumen, and chief cells at the base. An inset shows cells found elsewhere: a G cell in the antrum glands and a goblet cell in the small intestine.',
      caption: 'Follow the HCl arrow back to the cell it starts from. Each number names one choice.'
    },
    demoPick: 'Chief cells',
    flags: []
  },
  {
    qid: 'fm:bio:BIO_p057',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.physiology.nephron',
    difficulty: band(2),
    source: src('bio:BIO_p057', 23),
    keyText: '~65%',
    answer: { line: 'The proximal tubule is the workhorse. It reclaims about two thirds of the filtered sodium, with water following.' },
    steps: [
      'Picture the filtered sodium as a budget the nephron spends, segment by segment.',
      'The proximal tubule spends most of it: about two thirds, with water following.',
      'Then the thick ascending limb takes about a quarter, and the distal tubule and collecting duct fine-tune the last few percent.',
      'Bulk early, fine-tuning late.'
    ],
    choices: [
      { text: '~25%', role: 'trap', family: 'neighbor-fact', trap: 'The loop\'s share', note: 'About a quarter is the thick ascending limb, the second-largest site. It is a real share, just for the next segment down.' },
      { text: '~45%', role: 'trap', family: 'assumed-equal', trap: 'Spread the work evenly', note: 'Just under half undersells the proximal tubule. Its brush border and dense mitochondria let it reclaim about two thirds before the loop.' },
      { text: '~5%', role: 'trap', family: 'neighbor-fact', trap: 'The fine-tuning share', note: 'About 5 percent is the distal tubule, the fine-tuning end of the nephron, not the bulk.' },
      { text: '~65%', role: 'key', note: 'About two thirds of the filtered sodium, in the first segment.' },
      { text: '~95%', role: 'trap', family: 'other-question', trap: 'The whole nephron', note: 'Nearly all filtered sodium is reclaimed across the whole nephron. The stem asks about one segment, the proximal tubule.' }
    ],
    lockIt: 'Proximal tubule: about two thirds. Thick ascending limb: about a quarter. The distal end fine-tunes the rest.',
    hook: null,
    playWith: { label: 'Nephron lab: tap each segment to see what it reclaims, starting with the proximal tubule', href: 'tools/bio/bio-physiology.html', state: { visualizer: 'initNephron', segment: 'pct' }, expect: ['initNephron', 'data-seg="pct"', 'NEPHRON_DATA'], routing: 'Works today: Nephron is a physiology lab tab with no deep link yet; a segment opens on tap.' },
    video: { slot: 'bio.physiology.nephron', title: 'The nephron: filter, reclaim, fine-tune', id: null, start: null },
    visual: {
      type: 'bio.diagram',
      diagram: 'nephron-budget',
      labels: ['proximal-tubule', 'thick-ascending-limb', 'distal-tubule', 'collecting-duct'],
      focus: 'proximal-tubule',
      segments: [
        { id: 'pct', n: 1, label: 'Proximal tubule', share: 65, key: true },
        { id: 'tal', n: 2, label: 'Thick ascending limb', share: 25 },
        { id: 'dct', n: 3, label: 'Distal tubule', share: 5 },
        { id: 'cd', n: 4, label: 'Collecting duct', share: 4 }
      ],
      shareWord: 'about',
      budgetTitle: 'Every 100 Na+ filtered at the glomerulus',
      restLabel: 'left in urine',
      urineLabel: 'urine',
      reuse: 'new schematic; shares as in the Nephron lab data in tools/bio/bio-shared.js (about 65 percent in the proximal tubule)',
      alt: 'A nephron drawn as a tube: capsule, the proximal tubule numbered 1 and marked as the answer, the thick ascending limb 2, the distal tubule 3, the collecting duct 4. Below, a strip splits 100 filtered sodium ions: 65 proximal tubule, 25 thick ascending limb, 5 distal tubule, 4 collecting duct, 1 left in urine.',
      caption: 'Read the strip left to right: the first segment takes the biggest bite, and each later one takes less.'
    },
    demoPick: '~25%',
    flags: [
      { kind: 'note', text: 'Concept-first rule: the ~45% choice has a weak misconception behind it. A rewrite candidate (for example the share of filtered water reclaimed past the loop); key unchanged.' }
    ]
  },
  {
    qid: 'fm:bio:BIO_p056',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.physiology.nephron',
    difficulty: band(2),
    source: src('bio:BIO_p056', 35),
    keyText: 'Hydrostatic pressure',
    answer: { line: 'Blood pressure in the glomerular capillaries pushes water and small solutes into the capsule. It is bulk flow, and it costs no ATP.' },
    steps: [
      'Name the forces at the glomerulus. Blood pressure pushes fluid out, while plasma proteins pull it back and capsule fluid pushes back.',
      'Look at the plumbing. A wide afferent arteriole in and a narrow efferent one out hold that blood pressure high.',
      'So the push wins. Net filtration is hydrostatic pressure minus the two opposing forces.'
    ],
    choices: [
      { text: 'Colloid osmotic pressure of the plasma proteins', role: 'trap', family: 'reversed', trap: 'The pull-back force', note: 'The plasma proteins stay in the capillary, and their osmotic pull draws fluid back in. It works against filtration, not for it.' },
      { text: 'Active transport', role: 'trap', family: 'neighbor-fact', trap: 'Belongs to the tubule', note: 'Active transport does its work later, when the tubule reabsorbs. Filtration itself spends no ATP.' },
      { text: 'Aquaporin gradient', role: 'trap', family: 'neighbor-fact', trap: 'Water channels downstream', note: 'The aquaporins ADH controls sit in the collecting duct, far downstream. Nothing called an aquaporin gradient drives filtration.' },
      { text: 'Hydrostatic pressure', role: 'key', note: 'Capillary blood pressure drives bulk flow into the capsule.' },
      { text: 'Diffusion only', role: 'trap', family: 'other-conditions', trap: 'One gradient per solute', note: 'Diffusion moves each solute down its own gradient, as in gas exchange. Filtration pushes water and small solutes through together, in bulk.' }
    ],
    lockIt: 'Filtration is pressure: blood pressure pushes out, plasma proteins pull back, and the push wins.',
    hook: 'Wide in, narrow out: pressure stays high.',
    playWith: { label: 'Nephron lab: tap the glomerulus to see blood pressure push fluid into the capsule', href: 'tools/bio/bio-physiology.html', state: { visualizer: 'initNephron', segment: 'glom' }, expect: ['initNephron', 'data-seg="glom"', 'blood pressure pushes'], routing: 'Works today: Nephron is a physiology lab tab with no deep link yet; the glomerulus opens on tap.' },
    video: { slot: 'bio.physiology.nephron', title: 'The nephron: filter, reclaim, fine-tune', id: null, start: null },
    visual: {
      type: 'bio.diagram',
      diagram: 'glomerulus',
      labels: ['afferent', 'efferent', 'hydrostatic', 'oncotic', 'capsule'],
      focus: 'hydrostatic',
      parts: [
        { id: 'afferent', n: 1, label: 'Afferent arteriole: wide, blood in' },
        { id: 'efferent', n: 2, label: 'Efferent arteriole: narrow, holds the pressure up' },
        { id: 'hydrostatic', n: 3, label: 'Hydrostatic pressure: blood pushes fluid out', key: true },
        { id: 'oncotic', n: 4, label: 'Colloid osmotic pressure: plasma proteins pull fluid back' },
        { id: 'capsule', n: 5, label: 'Capsule pressure: filtrate already there pushes back' }
      ],
      net: 'Net filtration: the push out minus both opposing forces',
      reuse: 'new schematic, styled to match the Nephron lab',
      alt: 'The glomerulus inside Bowman\'s capsule: a wide afferent arteriole brings blood in and a narrow efferent arteriole carries it out. Thick arrows from the capillary tuft into the capsule, numbered 3 and marked as the answer, show hydrostatic pressure pushing fluid out; thin arrows show the plasma protein pull and capsule pressure pushing back.',
      caption: 'Compare the arrow sizes: the push out is the big one, held high by the narrow exit.'
    },
    demoPick: 'Colloid osmotic pressure of the plasma proteins',
    flags: [
      { kind: 'note', text: 'Concept-first rule: "Aquaporin gradient" is not a real term, so the choice reads as filler rather than a misconception. A rewrite candidate (for example "Osmosis driven by the salty medulla"); key unchanged.' }
    ]
  },

  /* ============================ Cellular respiration ============================ */
  {
    qid: 'fm:written:bio-4-jwpv4p',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.cell.respiration.fermentation',
    difficulty: band(2),
    source: src('written:bio-4-jwpv4p', 28),
    keyText: 'Ethanol and carbon dioxide',
    answer: { line: 'Yeast run alcoholic fermentation: pyruvate gives off CO2, which lifts the dough, and ends as ethanol, which bakes off.' },
    steps: [
      'Name the pathway. Yeast without oxygen run alcoholic fermentation.',
      'Pyruvate loses CO2 and becomes acetaldehyde. That gas is what lifts the dough.',
      'Acetaldehyde takes the electrons from NADH and becomes ethanol. NAD+ goes back to glycolysis, and the ethanol bakes off.'
    ],
    choices: [
      { text: 'Lactate and water', role: 'trap', family: 'other-conditions', trap: 'Muscle\'s route', note: 'Lactate fermentation runs in muscle and some bacteria, and it releases no gas. Nothing would lift the dough.' },
      { text: 'Ethanol and carbon dioxide', role: 'key', note: 'CO2 lifts the dough; ethanol bakes off.' },
      { text: 'Acetyl-CoA and carbon dioxide', role: 'trap', family: 'neighbor-fact', trap: 'The aerobic link step', note: 'The link reaction also strips CO2 from pyruvate, but it makes acetyl-CoA and needs oxygen downstream. Fermentation ends in ethanol.' },
      { text: 'Pyruvate and hydrogen gas', role: 'trap', family: 'one-step-short', trap: 'Stopped at pyruvate', note: 'Pyruvate is where glycolysis ends and fermentation starts. And yeast give off no hydrogen gas.' },
      { text: 'Ethanol and oxygen', role: 'trap', family: 'half-right', trap: 'Half the pair', note: 'Ethanol holds, but fermentation neither uses nor makes oxygen. The gas in the dough is CO2.' }
    ],
    lockIt: 'Yeast fermentation: pyruvate to CO2 plus ethanol. Muscle: pyruvate to lactate, no gas.',
    hook: null,
    playWith: { label: 'Glycolysis node: follow pyruvate into fermentation and the products it ends in', href: 'tools/bio/bio-cell.html#node-glycolysis', state: { node: 'glycolysis' }, expect: ['node-glycolysis', 'ethanol', 'lactate'], routing: 'Works today.' },
    video: { slot: 'bio.cell.respiration.fermentation', title: 'Fermentation: keep glycolysis running', id: null, start: null },
    visual: {
      type: 'bio.diagram',
      diagram: 'step-ladder',
      labels: ['glucose', 'pyruvate', 'acetaldehyde', 'ethanol', 'co2'],
      focus: 'co2-and-ethanol',
      nodes: [
        { label: 'Glucose' },
        { label: '2 pyruvate', branch: 'In muscle instead: pyruvate to lactate, no gas' },
        { label: '2 acetaldehyde' },
        { label: '2 ethanol', role: 'key', tag: 'answer', note: 'The alcohol that bakes off in the oven' }
      ],
      steps: [
        { label: 'Glycolysis', tag: '2 ATP, 2 NADH', role: 'earn' },
        { label: 'Pyruvate gives off CO2', tag: 'CO2 lifts the dough', role: 'key' },
        { label: 'Acetaldehyde takes the electrons from NADH', tag: 'NAD+ back to glycolysis', role: 'earn' }
      ],
      reuse: 'new schematic; the pathway as in the Glycolysis node of tools/bio/bio-cell.html',
      alt: 'A ladder from glucose through glycolysis to 2 pyruvate, then a step where pyruvate gives off CO2, outlined, to 2 acetaldehyde, then a step where NADH hands over its electrons, ending at 2 ethanol, outlined as the answer. A dashed side box shows muscle turning pyruvate into lactate with no gas.',
      caption: 'The two outlined products answer both halves of the stem: CO2 for the rise, ethanol for the alcohol.'
    },
    demoPick: 'Lactate and water',
    flags: []
  },
  {
    qid: 'fm:written:bio-4-dmpc6',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.cell.respiration.glycolysis',
    difficulty: band(2),
    source: src('written:bio-4-dmpc6', 31),
    keyText: 'Hexokinase and phosphofructokinase',
    answer: { line: 'Hexokinase and phosphofructokinase-1 each move a phosphate from ATP onto the sugar. Those are the two ATP the first half spends.' },
    steps: [
      'Find the first-half kinases: enzymes that move a phosphate from ATP onto the sugar.',
      'There are two: hexokinase makes glucose-6-phosphate, and phosphofructokinase-1 makes fructose-1,6-bisphosphate.',
      'Watch the direction. The payoff kinases run the other way, taking phosphate off to make ATP.'
    ],
    choices: [
      { text: 'Glyceraldehyde-3-phosphate dehydrogenase and phosphoglycerate kinase', role: 'trap', family: 'reversed', trap: 'The payoff pair', note: 'These two earn: one makes NADH and the next makes ATP. The dehydrogenase adds a phosphate too, but from inorganic phosphate, not ATP.' },
      { text: 'Hexokinase and pyruvate kinase', role: 'trap', family: 'half-right', trap: 'One spender, one earner', note: 'Hexokinase spends ATP, but pyruvate kinase is the last payoff step, and it makes ATP.' },
      { text: 'Aldolase and triose phosphate isomerase', role: 'trap', family: 'neighbor-fact', trap: 'Right half, no ATP', note: 'These are first-half steps, right after the spending. They split the sugar and reshuffle one piece, with no ATP.' },
      { text: 'Phosphoglucose isomerase and enolase', role: 'trap', family: 'neighbor-fact', trap: 'The rearrangers', note: 'One rearranges the sugar and the other removes water. Neither touches ATP.' },
      { text: 'Hexokinase and phosphofructokinase', role: 'key', note: 'The two first-half kinases each spend one ATP.' }
    ],
    lockIt: 'Spenders: hexokinase and phosphofructokinase. Earners: phosphoglycerate kinase and pyruvate kinase.',
    hook: null,
    playWith: { label: 'Glycolysis node: find the two steps that spend ATP', href: 'tools/bio/bio-cell.html#node-glycolysis', state: { node: 'glycolysis' }, expect: ['node-glycolysis', 'Hexokinase', 'phosphofructokinase'], routing: 'Works today.' },
    video: { slot: 'bio.cell.respiration.glycolysis', title: 'Glycolysis: spend two, earn four', id: null, start: null },
    visual: {
      type: 'bio.diagram',
      diagram: 'step-ladder',
      labels: ['investment-phase', 'payoff-phase'],
      focus: 'atp-spending-steps',
      nodes: [
        { label: 'Glucose', phase: 'First half: the investment' },
        { label: 'Glucose-6-phosphate' },
        { label: 'Fructose-6-phosphate' },
        { label: 'Fructose-1,6-bisphosphate' },
        { label: '2 glyceraldehyde-3-phosphate', phase: 'Second half: the payoff' },
        { label: '2 1,3-bisphosphoglycerate' },
        { label: '2 3-phosphoglycerate' },
        { label: '2 phosphoenolpyruvate' },
        { label: '2 pyruvate' }
      ],
      steps: [
        { label: 'Hexokinase', tag: 'spends 1 ATP', role: 'key' },
        { label: 'Phosphoglucose isomerase', tag: 'no ATP', role: 'none' },
        { label: 'Phosphofructokinase-1', tag: 'spends 1 ATP', role: 'key' },
        { label: 'Aldolase, then triose phosphate isomerase', tag: 'split, no ATP', role: 'none' },
        { label: 'Glyceraldehyde-3-phosphate dehydrogenase', tag: 'makes NADH', role: 'earn' },
        { label: 'Phosphoglycerate kinase', tag: 'makes ATP', role: 'earn' },
        { label: 'Mutase, then enolase', tag: 'water out, no ATP', role: 'none' },
        { label: 'Pyruvate kinase', tag: 'makes ATP', role: 'earn' }
      ],
      reuse: 'new schematic; the steps as in the Glycolysis node of tools/bio/bio-cell.html',
      alt: 'Glycolysis as a ladder of nine molecules from glucose to 2 pyruvate. In the first half, hexokinase and phosphofructokinase-1 are tagged spends 1 ATP and outlined as the answer; every other step is tagged no ATP, makes NADH or makes ATP, with the payoff half below.',
      caption: 'Scan the tags in the first half: only two steps spend ATP. Every other enzyme in the choices carries a different tag.'
    },
    demoPick: 'Hexokinase and pyruvate kinase',
    flags: [
      { kind: 'bank-copy', text: 'The bank why gives "both reactions add a phosphate onto the sugar" as the tell. Glyceraldehyde-3-phosphate dehydrogenase also adds a phosphate (inorganic phosphate, no ATP), so that tell points at the payoff pair too. The explainer phrases it as a phosphate moved from ATP. Bank text untouched; key unchanged.' }
    ]
  },
  {
    qid: 'fm:written:bio-4-158brxy',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.cell.respiration.etc',
    difficulty: band(2),
    source: src('written:bio-4-158brxy', 34),
    keyText: '18',
    answer: { line: 'Six NADH at 2.5 is 15, two FADH2 at 1.5 is 3, and 15 plus 3 is 18.' },
    steps: [
      'Split the carriers onto separate lines. FADH2 enters at complex II, past complex I\'s pump, so it earns less.',
      'NADH line: 6 x 2.5 = 15.',
      'FADH2 line: 2 x 1.5 = 3. Add the lines: 18.'
    ],
    choices: [
      { text: '12', role: 'trap', family: 'assumed-equal', trap: 'All at the low rate', note: 'This gives all eight carriers the FADH2 rate: 8 x 1.5 = 12. NADH enters earlier and earns more.' },
      { text: '15', role: 'trap', family: 'one-step-short', trap: 'Left out FADH2', note: '15 is the NADH line alone. The 2 FADH2 still add 3.' },
      { text: '18', role: 'key', note: '15 from NADH plus 3 from FADH2.' },
      { text: '20', role: 'trap', family: 'one-step-too-far', trap: 'Added the GTP', note: 'Adding the 2 GTP the cycle makes directly lands here, but the stem counts the carriers alone. Giving FADH2 the NADH rate lands here too.' },
      { text: '24', role: 'trap', family: 'assumed-equal', trap: 'Old whole numbers', note: 'This counts all eight carriers at 3, the old whole number for NADH. The stem sets the modern 2.5 and 1.5.' }
    ],
    lockIt: 'Keep NADH and FADH2 on separate lines: about 2.5 and 1.5 ATP each.',
    hook: null,
    playWith: { label: 'Krebs and ETC node: follow NADH and FADH2 to the complexes in the inner membrane', href: 'tools/bio/bio-cell.html#node-krebs', state: { node: 'krebs' }, expect: ['node-krebs', 'FADH'], routing: 'Works today.' },
    video: { slot: 'bio.cell.respiration.etc', title: 'Where each step of respiration happens', id: null, start: null },
    visual: {
      type: 'bio.diagram',
      diagram: 'etc-chain',
      labels: ['complex-I', 'complex-II', 'complex-III', 'complex-IV', 'atp-synthase', 'ledger'],
      focus: 'ledger-total',
      complexes: [
        { name: 'I', pumps: true, entry: 'NADH' },
        { name: 'II', pumps: false, entry: 'FADH2' },
        { name: 'III', pumps: true },
        { name: 'IV', pumps: true, exit: 'O2' }
      ],
      carrier: 'Q',
      synthase: { name: 'ATP synthase', state: 'working' },
      regions: { top: 'Intermembrane space', bottom: 'Matrix' },
      ledger: [
        { carrier: 'NADH', n: 6, rate: 2.5, note: 'enters at I' },
        { carrier: 'FADH2', n: 2, rate: 1.5, note: 'enters at II' }
      ],
      totalLabel: 'Total',
      swatches: SWATCH_ETC,
      reuse: 'new schematic, matching the pilot mitochondrion (complexes I to IV, II pumps none, ATP synthase); ledger computed by compute-bio.js',
      alt: 'The inner membrane with complexes I to IV and ATP synthase: NADH enters at complex I and FADH2 at complex II, which pumps no H+, and both pass electrons to Q. Below, a ledger: 6 NADH times 2.5 is 15, 2 FADH2 times 1.5 is 3, and the total, 18, is outlined as the answer.',
      caption: 'See where each carrier enters: FADH2 skips complex I\'s pump, so its line earns less.'
    },
    demoPick: '20',
    flags: [
      { kind: 'bank-copy', text: 'The bank trap note for 20 says it "uses the older textbook values of 3 ATP per NADH and 1 ATP per FADH2". The older values were 3 and 2 (giving 22, not a choice). The explainer uses the real routes to 20 (adding the 2 GTP, or FADH2 at the NADH rate). Bank text untouched; key unchanged.' }
    ]
  },
  {
    qid: 'fm:written:bio-4-1hr4sgo',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.cell.respiration.etc',
    difficulty: band(3),
    source: src('written:bio-4-1hr4sgo', 38),
    keyText: 'It slows, because the gradient builds and pumping against it gets harder',
    answer: { line: 'The chain and ATP synthase are coupled through the gradient. Plug the synthase and the gradient backs up, so electron flow slows.' },
    steps: [
      'Trace the protons. The chain pumps them out of the matrix, and ATP synthase is their main way back in.',
      'Plug the synthase and protons pile up outside. The gradient gets steeper.',
      'Pumping against a steeper gradient gets harder, so electron flow slows, and so does oxygen use.'
    ],
    choices: [
      { text: 'It increases, because protons are no longer being used up', role: 'trap', family: 'other-conditions', trap: 'What an uncoupler does', note: 'Speeding up is what an uncoupler does: it drains the gradient. A plug keeps the gradient full, which slows the pumps.' },
      { text: 'It slows, because the gradient builds and pumping against it gets harder', role: 'key', note: 'The gradient couples the two halves.' },
      { text: 'It is unchanged, because the chain and ATP synthase work independently of each other', role: 'trap', family: 'one-step-short', trap: 'Missed the coupling', note: 'It reads complexes untouched and stops there. The two halves are coupled through the gradient, which is the point of oxidative phosphorylation.' },
      { text: 'It slows, because oxygen can no longer accept electrons', role: 'trap', family: 'half-right', trap: 'Right result, other reason', note: 'It does slow, but that reason belongs to a complex IV poison such as cyanide. Oxygen is still there; the block sits at the synthase.' },
      { text: 'It increases briefly and then stops as the matrix becomes acidic', role: 'trap', family: 'reversed', trap: 'Matrix gets less acidic', note: 'Protons are pumped out of the matrix, so the matrix grows less acidic, not more. And nothing here speeds up.' }
    ],
    lockIt: 'The chain and the synthase share one gradient: block the way back and the pumps back up.',
    hook: 'Plug the drain and the pumps stall.',
    playWith: { label: 'Krebs and ETC node: follow the H+ gradient from the pumps to ATP synthase', href: 'tools/bio/bio-cell.html#node-krebs', state: { node: 'krebs' }, expect: ['node-krebs', 'gradient', 'ATP synthase'], routing: 'Works today.' },
    video: { slot: 'bio.cell.respiration.etc', title: 'Where each step of respiration happens', id: null, start: null },
    visual: {
      type: 'bio.diagram',
      diagram: 'etc-chain',
      labels: ['complex-I', 'complex-II', 'complex-III', 'complex-IV', 'atp-synthase', 'gradient'],
      focus: 'plugged-synthase',
      complexes: [
        { name: 'I', pumps: true, entry: 'NADH' },
        { name: 'II', pumps: false, entry: 'FADH2' },
        { name: 'III', pumps: true },
        { name: 'IV', pumps: true, exit: 'O2' }
      ],
      carrier: 'Q',
      synthase: { name: 'ATP synthase', state: 'plugged', plugLabel: 'Oligomycin plug' },
      regions: { top: 'Intermembrane space', bottom: 'Matrix' },
      chain: [
        { text: 'The plug closes the main way back in for H+' },
        { text: 'H+ piles up outside: the gradient steepens' },
        { text: 'The pumps push against it, so electron flow slows', key: true }
      ],
      swatches: SWATCH_ETC,
      reuse: 'new schematic, matching the pilot mitochondrion (complexes I to IV, II pumps none, ATP synthase)',
      alt: 'The inner membrane with complexes I, III and IV pumping H+ outward, their arrows dashed, and ATP synthase blocked by an oligomycin plug. Extra H+ crowds the intermembrane space. Three numbered cards follow: the plug closes the way back, H+ piles up, and pumping against it slows electron flow, outlined as the answer.',
      caption: 'Start at the plug, then follow the H+ that cannot get back. The pumps are stuck pushing uphill.'
    },
    demoPick: 'It increases, because protons are no longer being used up',
    flags: []
  },
  {
    qid: 'fm:written:bio-4-ih7vz8',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.cell.respiration.fermentation',
    difficulty: band(3),
    source: src('written:bio-4-ih7vz8', 39),
    keyText: 'Fermentation uses no electron transport chain and builds no proton gradient',
    answer: { line: 'Both run without oxygen, but only anaerobic respiration keeps a membrane chain and a gradient. Fermentation has neither.' },
    steps: [
      'Ask where the electrons from NADH go. That one question splits the two.',
      'Anaerobic respiration sends them down a membrane chain to sulfate or nitrate. The chain builds a gradient that drives ATP synthase.',
      'Fermentation hands them straight to an organic molecule, pyruvate or acetaldehyde. No chain, no gradient, only the 2 ATP from glycolysis.'
    ],
    choices: [
      { text: 'Fermentation uses a chain too, but with oxygen as the final acceptor', role: 'trap', family: 'other-conditions', trap: 'That is aerobic', note: 'A chain that ends at oxygen is aerobic respiration. Fermentation has no chain at all.' },
      { text: 'Fermentation uses no electron transport chain and builds no proton gradient', role: 'key', note: 'No chain and no gradient: that is the line between them.' },
      { text: 'It produces less ATP per glucose than fermentation does', role: 'trap', family: 'reversed', trap: 'Ranked the other way', note: 'A chain plus a gradient out-earns fermentation, which keeps only the 2 ATP from glycolysis. Anaerobic respiration makes more, not less.' },
      { text: 'Fermentation passes electrons to nitrate, while anaerobic respiration passes them to pyruvate', role: 'trap', family: 'read-backward', trap: 'Swapped the acceptors', note: 'This swaps the two acceptors. The stem itself hands nitrate and sulfate to the bacteria with the chain.' },
      { text: 'It is the same process under a different name', role: 'trap', family: 'assumed-equal', trap: 'Both lack oxygen', note: 'Both run without oxygen, which is why they blur together. One uses a membrane chain and a gradient; the other does not.' }
    ],
    lockIt: 'Anaerobic respiration keeps the chain and the gradient; fermentation has neither.',
    hook: null,
    playWith: { label: 'Glycolysis node: compare fermentation with respiration', href: 'tools/bio/bio-cell.html#node-glycolysis', state: { node: 'glycolysis' }, expect: ['node-glycolysis', 'anaerobic', 'ferment'], routing: 'Works today.' },
    video: { slot: 'bio.cell.respiration.fermentation', title: 'Fermentation: keep glycolysis running', id: null, start: null },
    visual: {
      type: 'bio.diagram',
      diagram: 'compare-table',
      labels: ['chain', 'gradient', 'acceptor', 'atp', 'oxygen'],
      focus: 'chain-and-gradient',
      columns: ['Anaerobic respiration', 'Fermentation'],
      keyCol: 1,
      rows: [
        { label: 'Electron transport chain', cells: ['Yes, in the membrane', 'None'], key: true },
        { label: 'Proton gradient', cells: ['Yes, it drives ATP synthase', 'None'], key: true },
        { label: 'Who takes the electrons', cells: ['Sulfate or nitrate', 'An organic molecule: pyruvate or acetaldehyde'] },
        { label: 'ATP per glucose', cells: ['More: glycolysis plus the chain', '2, from glycolysis only'] },
        { label: 'Oxygen', cells: ['Not used', 'Not used'] }
      ],
      footnote: 'A chain that ends at oxygen is aerobic respiration, a third process.',
      reuse: 'new compare table',
      alt: 'A two-column table comparing anaerobic respiration and fermentation row by row. The electron transport chain and proton gradient rows are outlined as the answer: yes for anaerobic respiration, none for fermentation. Other rows show the electron acceptor, sulfate or nitrate against an organic molecule, more ATP against 2, and no oxygen for either.',
      caption: 'Read the two outlined rows: the chain and the gradient are what fermentation lacks.'
    },
    demoPick: 'It is the same process under a different name',
    flags: []
  },

  /* ===================== Control systems: nerves and hormones ===================== */
  {
    qid: 'fm:originals:ab-5547ba43c3',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.physiology.endocrine',
    difficulty: band(2),
    source: src('originals:ab-5547ba43c3', 19),
    keyText: 'Fewer aquaporins in the collecting duct, so more dilute urine is produced',
    answer: { line: 'ADH puts water channels into the collecting duct. Less ADH means fewer channels, so water stays in the urine.' },
    steps: [
      'Name the hormone\'s job. ADH, the water saver, inserts aquaporins into the collecting duct.',
      'Alcohol blocks its release, so fewer channels go in. Water stays in the tubule.',
      'Result: more urine, and more dilute.'
    ],
    choices: [
      { text: 'Less glucose reabsorption in the proximal tubule', role: 'trap', family: 'other-conditions', trap: 'The diabetes picture', note: 'Glucose spills into urine when blood glucose overwhelms the proximal transporters, as in diabetes mellitus. ADH does not handle glucose.' },
      { text: 'A higher filtration rate at the glomerulus with no change in urine concentration', role: 'trap', family: 'neighbor-fact', trap: 'A step ADH skips', note: 'Filtration is a nearby step that ADH does not set. And urine concentration is exactly what changes.' },
      { text: 'More aquaporins in the collecting duct, so less urine is produced', role: 'trap', family: 'reversed', trap: 'ADH still present', note: 'That is ADH at work. Blocking its release runs the other way.' },
      { text: 'Fewer aquaporins in the collecting duct, so more dilute urine is produced', role: 'key', note: 'No ADH, fewer water channels: the water leaves in the urine.' },
      { text: 'More Na+ reabsorption in the distal tubule, so blood pressure rises', role: 'trap', family: 'neighbor-fact', trap: 'Aldosterone\'s job', note: 'Sodium reabsorption in the distal nephron is the effect of aldosterone, the neighboring hormone, not ADH.' }
    ],
    lockIt: 'ADH saves water by adding aquaporins. Less ADH: more urine, and more dilute.',
    hook: null,
    playWith: { label: 'Nephron lab: tap the collecting duct to see ADH insert aquaporins', href: 'tools/bio/bio-physiology.html', state: { visualizer: 'initNephron', segment: 'cd' }, expect: ['initNephron', 'data-seg="cd"', 'aquaporin'], routing: 'Works today: Nephron is a physiology lab tab with no deep link yet; the collecting duct opens on tap.' },
    video: { slot: 'bio.physiology.endocrine', title: 'Hormones: who signals whom', id: null, start: null },
    visual: {
      type: 'bio.diagram',
      diagram: 'collecting-duct',
      labels: ['adh-present', 'adh-blocked', 'aquaporins'],
      focus: 'adh-blocked',
      lead: 'The salty tissue around the duct pulls water out through any open channel.',
      panels: [
        { title: 'ADH present', channels: 6, urine: 'Out the end: less urine, concentrated', channelText: 'Many aquaporins: water leaves the duct', urineWidth: 2 },
        { title: 'Alcohol blocks ADH release', channels: 1, urine: 'Out the end: more urine, dilute', channelText: 'Few aquaporins: water stays in the duct', urineWidth: 5, key: true }
      ],
      swatches: [{ sw: '#1f57b5', label: 'Aquaporin water channel' }],
      reuse: 'new schematic; the collecting duct as in the Nephron lab data in tools/bio/bio-shared.js',
      alt: 'Two views of the collecting duct. With ADH, many blue aquaporin channels let water leave the duct and a thin stream of concentrated urine flows on. With ADH release blocked by alcohol, outlined as the answer, one channel is open, water stays in the duct, and a thick stream of dilute urine flows on.',
      caption: 'Count the blue channels in each duct, then compare the urine leaving the end.'
    },
    demoPick: 'More aquaporins in the collecting duct, so less urine is produced',
    flags: [
      { kind: 'bank-copy', text: 'Bank trap notes use capitals for emphasis ("when it IS present"). Coach view only; bank text untouched, key unchanged.' }
    ]
  },
  {
    qid: 'fm:originals:ab-8da5ad8639',
    premises: ['voltage-gated Na+ channels'],
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.physiology.action-potential',
    difficulty: band(3),
    source: src('originals:ab-8da5ad8639', 33),
    keyText: 'The neuron can no longer fire action potentials',
    answer: { line: 'Voltage-gated Na+ channels carry the upstroke. Block them and no spike can start, though the resting potential stays put.' },
    steps: [
      'Name the channel\'s job. Voltage-gated Na+ channels open at threshold and let Na+ rush in: that is the upstroke.',
      'Block them and no Na+ rushes in. No upstroke, no action potential.',
      'The resting potential stays near normal. The K+ leak channels and the Na+/K+ pump that set it are untouched.'
    ],
    choices: [
      { text: 'Neurotransmitter release increases at the terminal', role: 'trap', family: 'reversed', trap: 'Release falls instead', note: 'No action potential reaches the terminal, so release falls, not rises.' },
      { text: 'The resting potential immediately rises to 0 mV', role: 'trap', family: 'neighbor-fact', trap: 'Rest is set elsewhere', note: 'The resting potential belongs to the K+ leak channels and the pump, which the toxin leaves alone. Rest stays near -70 mV.' },
      { text: 'The neuron fires action potentials continuously', role: 'trap', family: 'other-conditions', trap: 'Channels held open', note: 'Continuous firing is what a toxin that holds Na+ channels open would do. This one blocks them.' },
      { text: 'Repolarization fails, so the membrane stays positive', role: 'trap', family: 'neighbor-fact', trap: 'The K+ step', note: 'Repolarization is the job of the K+ channels, and here it never gets the chance. The spike never starts, so the membrane never goes positive.' },
      { text: 'The neuron can no longer fire action potentials', role: 'key', note: 'No Na+ entry, no upstroke, no spike.' }
    ],
    lockIt: 'Na+ in makes the upstroke; K+ out brings it down. Block the Na+ channels and nothing fires.',
    hook: null,
    playWith: { label: 'Action potential lab: press play and watch Na+ carry the upstroke and K+ bring it down', href: 'tools/bio/bio-physiology.html', state: { visualizer: 'initActionPotential' }, expect: ['initActionPotential', 'id="apPlay"'], routing: 'Works today: Action Potential is a physiology lab tab with no deep link yet. The trace plays only when the student presses play.' },
    video: { slot: 'bio.physiology.action-potential', title: 'The action potential, channel by channel', id: null, start: null },
    visual: {
      type: 'bio.diagram',
      diagram: 'ap-trace',
      labels: ['normal', 'blocked'],
      focus: 'blocked',
      rest: -70,
      threshold: -55,
      peak: 30,
      thresholdLabel: 'threshold',
      traces: [
        { label: 'Normal neuron', kind: 'spike' },
        { label: 'With tetrodotoxin', kind: 'blocked', key: true }
      ],
      marks: { up: 'Na+ in', down: 'K+ out', blocked: 'no upstroke', rest: 'rest stays near -70' },
      reuse: 'new plot; values as in the Action Potential lab of tools/bio/bio-physiology.html (rest -70 mV, threshold -55 mV, peak +30 mV)',
      alt: 'Two membrane potential traces. The normal neuron rests at -70 mV, reaches the -55 mV threshold, shoots up to +30 mV as Na+ flows in, and falls back as K+ flows out. With tetrodotoxin, outlined as the answer, the same stimulus gives only a small bump with no upstroke, and rest stays near -70 mV.',
      caption: 'Compare the two traces at threshold: one takes off, the blocked one sags back to rest.'
    },
    demoPick: 'The resting potential immediately rises to 0 mV',
    flags: [
      { kind: 'bank-copy', text: 'Bank trap notes use capitals for emphasis ("The toxin BLOCKS them"). Coach view only; bank text untouched, key unchanged.' }
    ]
  },
  {
    qid: 'fm:originals:ab-0de0fec7bd',
    servesAlso: [],
    section: 'bio',
    subtopic: 'bio.physiology.action-potential',
    difficulty: band(2),
    source: src('originals:ab-0de0fec7bd', 36),
    keyText: 'It fires action potentials more frequently',
    answer: { line: 'Every action potential is all or none, the same height every time. So a stronger stimulus shows up as more spikes per second.' },
    steps: [
      'Know the rule: an action potential is all or none, the same size and shape every time.',
      'So a single neuron cannot signal louder with a bigger spike. It signals more often.',
      'Stronger stimulus, higher firing frequency. The nervous system can also recruit more neurons.'
    ],
    choices: [
      { text: 'The resting potential becomes more negative', role: 'trap', family: 'reversed', trap: 'Rest moves the other way', note: 'A stronger stimulus depolarizes the cell. A more negative rest would make it harder to fire, not easier.' },
      { text: 'It fires action potentials more frequently', role: 'key', note: 'Strength is coded as frequency.' },
      { text: 'Each action potential becomes taller', role: 'trap', family: 'missed-exception', trap: 'Bigger input, bigger spike', note: 'Graded potentials do grow with the input, which is why this pulls. The action potential is the all-or-none exception: always the same height.' },
      { text: 'The action potential travels faster down the same axon', role: 'trap', family: 'other-conditions', trap: 'Speed set by the axon', note: 'Conduction speed comes from axon diameter and myelin, not stimulus strength. A faster signal means a different axon.' },
      { text: 'Each action potential lasts longer', role: 'trap', family: 'neighbor-fact', trap: 'Graded potential behavior', note: 'A receptor potential lasts as long as the stimulus does. The action potential\'s duration is fixed by its channels.' }
    ],
    lockIt: 'Action potentials never grow. A stronger stimulus means more of them per second.',
    hook: 'Louder means more often, not bigger.',
    playWith: { label: 'Action potential lab: play one spike and see its fixed height and shape', href: 'tools/bio/bio-physiology.html', state: { visualizer: 'initActionPotential' }, expect: ['initActionPotential', 'id="apPlay"'], routing: 'Works today: Action Potential is a physiology lab tab with no deep link yet. It shows one spike; there is no spike-train view yet (tool-gap).' },
    video: { slot: 'bio.physiology.action-potential', title: 'The action potential, channel by channel', id: null, start: null },
    visual: {
      type: 'bio.diagram',
      diagram: 'ap-trace',
      labels: ['weak', 'strong'],
      focus: 'strong',
      rest: -70,
      threshold: -55,
      peak: 30,
      thresholdLabel: 'threshold',
      stimulusLabel: 'stimulus',
      countWord: 'action potentials',
      traces: [
        { label: 'Weak stimulus', kind: 'train', count: 3, strength: 0.3, strengthWord: 'weak' },
        { label: 'Strong stimulus', kind: 'train', count: 8, strength: 1, strengthWord: 'strong', key: true }
      ],
      reuse: 'new plot; spike shape as in the Action Potential lab of tools/bio/bio-physiology.html',
      alt: 'Two traces of the same neuron over the same stretch of time. Under a weak stimulus it fires 3 action potentials; under a strong stimulus, outlined as the answer, it fires 8. A dotted line across the peaks shows every spike reaches the same height.',
      caption: 'Count the spikes, then check the dotted line: more spikes, same height.'
    },
    demoPick: 'Each action potential becomes taller',
    flags: [
      { kind: 'tool-gap', text: 'The Action Potential lab plays a single spike. A spike-train view (stimulus strength against firing frequency) would make this the exact play-with target.' },
      { kind: 'bank-copy', text: 'Bank trap note uses capitals for emphasis ("HARDER to fire"). Coach view only; bank text untouched, key unchanged.' }
    ]
  }
];

// Fixes from the expert review and the re-review of B001 (coach record only).
const CHANGES = {
  'fm:bio:BIO_g064': [
    'Step 1 says the allele sits on both X chromosomes (was "colorblind on both X chromosomes")',
    'Re-review: step 1 is one sentence, "Write the parents first: he is X^N Y, and she is X^n X^n, with the allele on both X chromosomes." (father first, so no genotype splits across a phone line)'
  ],
  'fm:bio:BIO_g061': [
    '5% family set to other-conditions (was unit-slip), label "Genes linked more tightly", to match its note (genes about 5 cM apart)',
    'Re-review: the 12.5% note opens "12.5% is one recombinant class.", so the first sentence a phone shows stands on its own'
  ],
  'fm:bio:BIO_p044': ['Re-review: the No pH change note opens "Breathing is a fast pH lever" (was "CO2 is the fastest pH lever the body has"; chemical buffers act faster, in seconds, then breathing, then the kidneys)'],
  'fm:bio:BIO_p090': ['Step 3 glosses the axillae as the armpits'],
  'fm:bio:BIO_p019': [
    'Step 1 is "Sort the lining by what each cell makes." ("One cell, one job" contradicted step 2: parietal cells make HCl and intrinsic factor)',
    'Alt text: the parietal cells are numbered 2 and marked as the answer (they were never outlined)',
    'Picture: the HCl label moved off the top mucous cell into the stomach lumen band, the arrow now runs up into the lumen, and the lumen label sits at the band\'s right end',
    'Re-review: step 1 is "Sort the cells by their products." (6 words, so the explainer keeps a short line; plural, because parietal cells make two)'
  ],
  'fm:bio:BIO_p057': [
    'Lock it in names both bulk sites: proximal tubule about two thirds, thick ascending limb about a quarter, the distal end fine-tunes the rest (it had put the thick ascending limb under fine-tuning)',
    'Alt text: the proximal tubule is numbered 1 and marked as the answer',
    'Re-review: nephron-budget draws the answer badge left of marker 1, clear of the descending limb (it sat over the grey tube)'
  ],
  'fm:bio:BIO_p056': [
    'Aquaporin gradient note: the aquaporins ADH controls sit in the collecting duct (it had implied aquaporins exist only there)',
    'Step 1: plasma proteins pull fluid back, capsule fluid pushes back; step 3 and the picture\'s net line say "opposing forces" (was "pull-backs", but capsule pressure pushes)',
    'Diffusion only label is "One gradient per solute" (was "One solute at a time"; the review\'s "Each solute on its own gradient" is 6 words, over the 5-word label budget)',
    'Alt text: the hydrostatic arrows are numbered 3 and marked as the answer',
    'Re-review: step 1 is two sentences, "Blood pressure pushes fluid out, while plasma proteins pull it back and capsule fluid pushes back."'
  ],
  'fm:written:bio-4-dmpc6': ['Caption: every other enzyme in the choices carries a different tag (was "sits elsewhere", but three of them are first-half enzymes)'],
  'fm:written:bio-4-158brxy': [
    'etc-chain picture: complex II is a short box on the matrix half; the electron path from I runs through the upper membrane over II to Q, II\'s own arrow feeds Q, and Q passes on to III and IV (the old curve ran from I into II, showing the linear I-II-III misconception)',
    'The working ATP synthase\'s H+ arrow runs down through the stalk to the head, with its own H+ label',
    'Alt text and the electron swatch name Q',
    'Re-review: the 24 note says "at 3, the old whole number for NADH" (the old FADH2 value was 2), and the hook is dropped because the caption already says FADH2 skips complex I\'s pump'
  ],
  'fm:written:bio-4-1hr4sgo': [
    'Same etc-chain fix: no electron line from complex I into complex II; both feed Q',
    'Step 1 and chain card 1: ATP synthase is the main way back in for H+ (was "only"; there is basal proton leak)'
  ],
  'fm:originals:ab-0de0fec7bd': ['ap-trace: every label is drawn after the trace, and each spike train starts after a lead-in at rest that holds the threshold label left of the first spike, so no spike stroke crosses it; the stimulus bar starts where the firing starts']
};

module.exports = {
  schema: 'ace.explainer-src/1',
  group: 'G1',
  batch: 'B001',
  title: 'Full-Length Test 1, Biology: genetics, body systems, respiration, nerves and hormones',
  entries: ENTRIES,
  changes: CHANGES
};
