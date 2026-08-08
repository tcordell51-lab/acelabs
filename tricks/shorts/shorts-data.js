/* shorts-data.js — question-first 40s short for every trick.
   One template (short.html) renders any topic by ?topic=<slug>.
   Copy is house-clean: no em dashes, no emojis, no decorative glyphs.
   Beats: hook (question) -> tension -> insight (the trick) -> apply -> answer -> CTA. */
window.SHORTS = {
  eas: {
    subj: 'ORGO', topic: 'EAS DIRECTING', trick: '02', accent: 'ochem',
    q: 'Where does<br>the next group add?', qsub: 'a substituted benzene ring',
    ask: 'ortho and para, or meta?',
    tension: 'One question about the substituent decides it.',
    insightKicker: 'THE TRICK',
    insight: 'Look at the group on the ring. Does it push electron density in, a lone pair or an alkyl group, or pull electrons out?',
    apply: 'Push in is an activator, so ortho and para. Pull out is a deactivator, so meta. Halogens are the exception.',
    answer: 'The first atom connected to the ring tells the whole story.'
  },
  acidity: {
    subj: 'ORGO', topic: 'ACIDITY', trick: '03', accent: 'ochem',
    q: 'CH<sub>3</sub>CH<sub>2</sub>OH<br>vs CH<sub>3</sub>COOH', qsub: 'ethanol vs acetic acid',
    ask: 'which is more acidic?',
    tension: 'Most people rank the acid. That is the mistake.',
    insightKicker: 'THE TRICK',
    insight: 'Rank the conjugate base instead. The more stable the base, the stronger the acid.',
    apply: 'Acetate spreads its charge over two oxygens by resonance. Ethoxide is stuck on one.',
    answer: 'Acetic acid, by a mile.'
  },
  'sn1-vs-sn2': {
    subj: 'ORGO', topic: 'SN1 vs SN2', trick: '04', accent: 'ochem',
    q: 'SN1 or SN2?', qsub: 'same substrate, two conditions',
    ask: 'which pathway wins?',
    tension: 'You do not memorize a table. You ask two questions.',
    insightKicker: 'THE TRICK',
    insight: 'How crowded is the carbon, and how strong is the nucleophile?',
    apply: 'Crowded carbon with a weak nucleophile goes SN1. Open carbon with a strong nucleophile goes SN2.',
    answer: 'The conditions decide, every time.'
  },
  'rs-configuration': {
    subj: 'ORGO', topic: 'R / S', trick: '05', accent: 'ochem',
    q: 'R or S?', qsub: 'one chiral center',
    ask: 'what is the configuration?',
    tension: 'The wedge is where everyone flips the sign.',
    insightKicker: 'THE TRICK',
    insight: 'Rank the four groups by priority, then trace one to two to three.',
    apply: 'Lowest priority on a dash, read it as drawn. On a wedge, trace it and flip.',
    answer: 'Direction plus the wedge rule gives you R or S.'
  },
  'nmr-two-steps': {
    subj: 'ORGO', topic: 'NMR', trick: '06', accent: 'ochem',
    q: 'How many<br>NMR signals?', qsub: 'ethanol, CH<sub>3</sub>CH<sub>2</sub>OH',
    ask: 'how many peaks?',
    tension: 'Count atoms and you will overcount.',
    insightKicker: 'THE TRICK',
    insight: 'Count hydrogen environments, not hydrogens. Then split each by n plus one.',
    apply: 'Ethanol has three environments: CH<sub>3</sub>, CH<sub>2</sub>, and OH.',
    answer: 'Three signals. And OH usually sings alone.'
  },
  'alkene-map': {
    subj: 'ORGO', topic: 'ALKENE ADDITION', trick: '07', accent: 'ochem',
    q: 'Which way<br>does it add?', qsub: 'alkene plus reagent',
    ask: 'Markovnikov or anti?',
    tension: 'One default, two flip words.',
    insightKicker: 'THE TRICK',
    insight: 'Markovnikov is the default. The words peroxide and boron flip it to anti-Markovnikov.',
    apply: 'HBr alone adds Markovnikov. HBr with peroxide flips the position. Boron goes anti-Markovnikov, adding to one face.',
    answer: 'Default first, then check for the flip word.'
  },
  'ir-peaks': {
    subj: 'ORGO', topic: 'IR SPECTROSCOPY', trick: '08', accent: 'ochem',
    q: 'What is<br>this molecule?', qsub: 'a broad O-H and a peak at 1700',
    ask: 'read it in two peaks',
    tension: 'Ignore the fingerprint clutter.',
    insightKicker: 'THE TRICK',
    insight: 'Two peaks carry the DAT. A broad O-H hump near 3000, and the dagger at 1700, the carbonyl.',
    apply: 'A broad O-H and a sharp 1700 together mean a carboxylic acid.',
    answer: 'Two peaks, one answer.'
  },
  newman: {
    subj: 'ORGO', topic: 'NEWMAN', trick: '09', accent: 'ochem',
    q: 'Most stable<br>conformation?', qsub: 'a Newman projection',
    ask: 'which one is lowest energy?',
    tension: 'Stability here is just about space.',
    insightKicker: 'THE TRICK',
    insight: 'Give the biggest groups the most elbow room.',
    apply: 'Anti beats gauche beats eclipsed. The two largest groups want to sit 180 degrees apart.',
    answer: 'Anti, every time.'
  },
  ozonolysis: {
    subj: 'ORGO', topic: 'OZONOLYSIS', trick: '10', accent: 'ochem',
    q: 'What does<br>O<sub>3</sub> do?', qsub: 'alkene plus ozone',
    ask: 'what are the products?',
    tension: 'Think of it as a pair of scissors.',
    insightKicker: 'THE TRICK',
    insight: 'Ozone cuts the double bond and caps each end with a carbonyl.',
    apply: 'With DMS you stop at aldehydes and ketones. With peroxide the aldehyde ends climb to acids, but ketones stay.',
    answer: 'Cut, then cap. The workup sets the ending.'
  },
  'redox-balancing': {
    subj: 'GEN CHEM', topic: 'REDOX', trick: '11', accent: 'gchem',
    q: 'Balance<br>this redox.', qsub: 'in acidic solution',
    ask: 'how many electrons?',
    tension: 'Do not try to eyeball it.',
    insightKicker: 'THE TRICK',
    insight: 'Split into half-reactions. Balance O with water, H with H plus, charge with electrons.',
    apply: 'Match electrons lost and gained by their least common multiple. That number is your electron count.',
    answer: 'Half-reactions never fail you.'
  },
  'red-cat-an-ox': {
    subj: 'GEN CHEM', topic: 'ELECTROCHEM', trick: '12', accent: 'gchem',
    q: 'Cathode<br>or anode?', qsub: 'a galvanic cell',
    ask: 'where does reduction happen?',
    tension: 'Two mnemonics settle the whole topic.',
    insightKicker: 'THE TRICK',
    insight: 'Red Cat: reduction at the cathode. An Ox: oxidation at the anode.',
    apply: 'Cell potential is cathode minus anode. And a reducing agent is the thing being oxidized.',
    answer: 'Red Cat, An Ox, and watch the word agent.'
  },
  'limiting-reagent': {
    subj: 'GEN CHEM', topic: 'LIMITING REAGENT', trick: '13', accent: 'gchem',
    q: '6 mol H<sub>2</sub><br>meet 2 mol O<sub>2</sub>', qsub: '2 H<sub>2</sub> plus O<sub>2</sub> makes 2 H<sub>2</sub>O',
    ask: 'how much water forms?',
    tension: 'The bigger pile is a trap.',
    insightKicker: 'THE TRICK',
    insight: 'Race each reactant to product using the mole ratio. The smaller result wins.',
    apply: '6 mol H<sub>2</sub> makes 6 mol water. 2 mol O<sub>2</sub> makes 4 mol water. Oxygen runs out.',
    answer: '4 mol water. The loser of the race decides everything.'
  },
  'periodic-trends': {
    subj: 'GEN CHEM', topic: 'PERIODIC TRENDS', trick: '14', accent: 'gchem',
    q: 'Why is fluorine<br>so grabby?', qsub: 'the whole periodic table',
    ask: 'what drives every trend?',
    tension: 'One sentence runs all of them.',
    insightKicker: 'THE TRICK',
    insight: 'One force runs the table: effective nuclear charge, how hard the nucleus pulls the outer electrons.',
    apply: 'More protons across a row pull harder, so electronegativity and ionization climb. New shells down the table make atoms larger.',
    answer: 'One idea, every trend.'
  }
};
window.SHORTS_ORDER = ['acidity','sn1-vs-sn2','periodic-trends','red-cat-an-ox','ir-peaks','rs-configuration','limiting-reagent','nmr-two-steps','alkene-map','newman','ozonolysis','redox-balancing','eas'];
