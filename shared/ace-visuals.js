/* ace-visuals.js : every interactive visual on Ace Labs, in one list (inventory 2026-11-16, whiteboards 2026-11-24).

     AceVisuals.tools      [{ id, section, group, step, title, path, topics, blurb, does, next, links }]
     AceVisuals.sections   [{ id, name, start, path: [{ step, title, href }], groups: [name, ...] }]
     AceVisuals.match(q)   q = a miss or a question: { section, topic, topicName, concept, skill }
                           -> { id, title, url, label, board? } for the best visual, or null. Null
                              means "show no button": a wrong visual is worse than none.
     AceVisuals.chip(q, from)      the "See it" chip as an element (null when nothing matches)
     AceVisuals.chipHTML(q, from)  the same chip as an HTML string ('' when nothing matches)
                           A chip for a whiteboard (tool.board) opens the board in a bottom sheet
                           in place (shared/ace-board.js, loaded on first tap); any other visual
                           is a plain link.

   Matching is by the topic phrases below, inside the question's own section only. A deep link
   (links[]) wins over its parent tool, and a longer phrase wins over a shorter one.
   Loaded by /labs/, /see/, /review/, /repair/ and every question player. Also runs in node (tests/shell/ace-visuals.test.js). */
(function (root) {
  'use strict';

  var OC = '/tools/ochem/';
  var CELL = '/tools/bio/bio-cell.html', GEN = '/tools/bio/bio-genetics.html', PHYS = '/tools/bio/bio-physiology.html';
  var DEVO = '/tools/bio/bio-devo.html', DIV = '/tools/bio/bio-diversity.html', EVO = '/tools/bio/bio-evolution.html';
  var QRP = '/tools/qr/proposals/';
  function L(label, path, topics) { return { label: label, path: path, topics: topics }; }
  /* A whiteboard: data in shared/boards/*.js, drawn by shared/ace-board.js, full page at /see/?b=<id>. */
  function B(id, section, title, blurb, topics) {
    return { id: 'bd-' + id, board: id, section: section, group: 'Whiteboards', step: 'see', title: title, path: '/see/?b=' + id,
      blurb: blurb, does: 'Predict first, then watch it drawn step by step.', next: 'Then answer the three quick questions under it.', topics: topics };
  }

  var TOOLS = [
    /* ---------- Whiteboards (2026-11-24): one drawn board per high-yield topic ---------- */
    B('mole-bridge', 'gchem', 'The mole bridge', 'Grams, particles, gas liters and molarity all cross through moles.',
      ['mole bridge', 'mole', 'mole conv', 'mole conversion', 'mole concept', 'stoichiometry', 'stoich', 'limiting reactant', 'limiting reagent', 'lim react', 'percent yield',
       'empirical', 'molecular formula', 'balancing chemical equation', 'molarity', 'molarity molality normality', 'solution', 'solution concentration', 'dilution', 'dilution calculation', 'avogadro', 'molar mass']),
    B('acid-base', 'gchem', 'Proton traffic: the titration curve', 'Weak acid, strong base, four landmarks on one curve.',
      ['proton traffic', 'acid base', 'acid', 'ph', 'poh', 'ph poh', 'ph basic', 'ka kb', 'conjugate pair', 'strong weak', 'strong v weak', 'titration', 'titration curve',
       'buffer', 'henderson hasselbalch', 'indicator', 'bronsted', 'lewis acid', 'equivalence point', 'pka']),
    B('equilibrium', 'gchem', 'Balance and the push-back', 'Q against K, then Le Chatelier on one reaction.',
      ['balance push back', 'equilibrium', 'equilibria', 'eq kc', 'eq ice', 'eq lechat', 'ice table', 'le chatelier', 'lechatelier', 'keq', 'kc kp', 'keq kp ksp', 'ksp',
       'solubility equilibria', 'solubility product', 'reaction quotient']),
    B('energy-ledger', 'gchem', 'The energy ledger', 'Enthalpy levels, Hess\'s law and the Gibbs quadrant.',
      ['energy ledger', 'enthalpy', 'calorimetry', 'heat capacity', 'hess', 'heat of reaction', 'thermochemistry', 'thermo', 'thermodynamic', 'entropy', 'gibbs', 'free energy',
       'downhill entropy free energy', 'spontaneity']),
    B('gases', 'gchem', 'Gases: one equation, four dials', 'PV = nRT, the laws inside it, partial pressures and KMT.',
      ['gases', 'gas law', 'ideal gas', 'ideal gas law', 'partial pressure', 'dalton', 'boyle', 'charles', 'kinetic molecular theory', 'graham', 'real gas']),
    B('kinetics', 'gchem', 'How fast, not how far', 'The energy hill, the catalyst shortcut and the rate law.',
      ['how fast not how far', 'kinetic', 'chemical kinetic', 'rate law', 'reaction order', 'integrated rate law', 'arrhenius', 'activation energy', 'catalyst',
       'reaction coordinate', 'factor affecting reaction rate', 'reaction rate']),
    B('redox', 'gchem', 'The charge ledger: redox and cells', 'One zinc-copper cell: who loses electrons, where they go, what voltage.',
      ['charge ledger', 'redox', 'oxidation state', 'oxidation number', 'balancing redox', 'electrochemistry', 'electrochem', 'nernst', 'nernst equation', 'electrolysis', 'electrolytic', 'electrolysis stoichiometry', 'faraday law', 'galvanic voltaic cell', 'electrochem galvanic cell', 'std reduction potential', 'standard reduction potential']),
    B('respiration', 'bio', 'Cellular respiration: follow the glucose', 'Four stages, two places, about 30 to 32 ATP.',
      ['cellular respiration', 'respiration', 'glycolysis', 'kreb', 'kreb cycle', 'citric acid cycle', 'electron transport', 'electron transport chain', 'oxidative phosphorylation',
       'chemiosmosis', 'fermentation', 'atp yield', 'metabolism']),
    B('photosynthesis', 'bio', 'Photosynthesis: two linked factories', 'Light reactions feed the Calvin cycle.',
      ['photosynthesis', 'calvin cycle', 'calvin', 'light reaction', 'light dependent', 'chloroplast', 'photosystem']),
    B('central-dogma', 'bio', 'The central dogma: DNA to RNA to protein', 'Replication, transcription, processing and translation, each in its place.',
      ['central dogma', 'transcription', 'translation', 'transcription translation', 'gene expression', 'protein synthesis', 'rna processing', 'splicing']),
    B('nephron', 'bio', 'The nephron and its hormones', 'Filter, take back, concentrate. ADH and aldosterone tune the end.',
      ['nephron', 'kidney', 'renal', 'excretory', 'excretory system', 'urinary', 'adh', 'aldosterone', 'osmoregulation']),
    B('sn-e-decide', 'ochem', 'SN1, SN2, E1 or E2? The decision board', 'Read the carbon, then the reagent. Nine boxes, four answers.',
      ['sn1', 'sn2', 'e1', 'e2', 'sn1 sn2', 'sn1 sn2 e1 e2', 'substitution elimination', 'substitution versus elimination', 'substitution', 'elimination', 'nucleophilic substitution', 'sub elim']),
    B('eas-directors', 'ochem', 'EAS directors: where the next group lands', 'Donors send it ortho and para. Withdrawers send it meta.',
      ['ortho para', 'meta director', 'directing group', 'directing effect', 'eas director', 'activator', 'deactivator', 'activating group']),
    B('enolates', 'ochem', 'The alpha carbon wakes up', 'An acidic hydrogen, an enolate, and a new carbon to carbon bond.',
      ['alpha carbon wake up', 'alpha carbon', 'enolate', 'enol', 'aldol', 'aldol condensation', 'claisen', 'claisen condensation', 'alpha hydrogen', 'keto enol', 'alpha proton acidity']),
    B('number-line', 'qr', 'Fractions, decimals, percent: one number line', 'The benchmark conversions worth knowing cold.',
      ['fraction', 'decimal', 'fraction decimal', 'fraction decimal number sense', 'number sense', 'estimation', 'estim', 'approximation', 'approximation estimation', 'percentage', 'percentages and percent change', 'percent change', 'numerical calculation']),
    B('algebra-setup', 'qr', 'Word problem to equation: the setup', 'Name it, translate it, solve it, check it.',
      ['setup mindset', 'translation setup', 'translation', 'algebra', 'algebra equation', 'algebra one two unknown', 'linear equation', 'lin eq', 'system of equation', 'inequality', 'absolute value', 'rate distance and work problem', 'rate problem', 'work problem', 'mixture problem', 'setting up word problems', 'mixture interest and money problem', 'distance rate time']),
    B('powers-roots', 'qr', 'Powers, roots and quadratics', 'The exponent rules as one staircase, then one factoring move.',
      ['power root quadratic', 'exponent', 'exponent root', 'exponent root logarithm', 'root', 'quadratic', 'quadratic factoring formula', 'factoring', 'scientific notation', 'radical', 'exps']),
    B('trig-triangle', 'qr', 'Trigonometry, just enough', 'One right triangle, three ratios, two special triangles.',
      ['trigonometry', 'trig', 'trigonometry just enough', 'sohcahtoa', 'unit circle', 'special angle', 'special right', 'sine', 'cosine', 'tangent']),

    /* ---------- Whiteboards, set two (2026-11-24): the remaining Gen Chem, Biology, OChem and QR topics, plus PAT and Reading ---------- */
    B('sig-figs', 'gchem', 'Sig figs: what the ruler really knows', 'Certain digits plus one estimate, then the two rounding rules.',
      ['sig fig', 'sig figs and measurement', 'significant figure', 'measurement', 'two questions measurement and the lab', 'scientific notation', 'rounding', 'uncertainty']),
    B('lab-glassware', 'gchem', 'Lab glassware: which one for the job', 'Beaker, cylinder, volumetric flask, buret: how far to trust each.',
      ['lab technique', 'measurement and lab technique', 'lab techniques general', 'glassware', 'buret', 'volumetric flask', 'meniscus', 'lab safety', 'accuracy and precision', 'laboratory']),
    B('quantum', 'gchem', 'Quantum numbers and electron configuration', 'Four quantum numbers, the filling order, Hund and two exceptions.',
      ['quantum number', 'quantum numbers photons', 'quantum numbers orbitals', 'electron configuration', 'orbital', 'aufbau', 'hund', 'pauli', 'atomic structure and nuclear chemistry', 'subshell']),
    B('periodic-trends', 'gchem', 'Periodic trends: two arrows', 'Radius one way, ionization energy and electronegativity the other.',
      ['periodic trend', 'periodic', 'periodic trends and bonding', 'periodic trends radius ie en e affinity', 'ionization energy', 'electronegativity', 'atomic radius', 'electron affinity', 'effective nuclear charge', 'zeff']),
    B('bonding', 'gchem', 'Lewis to shape: count the domains', 'Electron groups set the geometry. Lone pairs set the shape and the polarity.',
      ['bonding', 'bonding basic', 'lewis structure', 'lewis structures formal charge', 'vsepr and geometry', 'vsepr molecular geometry', 'molecular geometry', 'hybridization', 'hybridization sigma pi bond', 'molecular polarity', 'bond molecular polarity dipole', 'formal charge', 'electron domain', 'molecular shape']),
    B('solutions', 'gchem', 'Colligative properties: count the particles', 'Freezing point, boiling point, vapor pressure and osmotic pressure from one idea.',
      ['colligative', 'colligative property', 'colligative properties raoult s fp bp osmotic', 'solutions and colligative properties', 'freezing point depression', 'boiling point elevation', 'osmotic pressure', 'raoult', 'vapor pressure lowering', 'van t hoff', 'molality']),
    B('nuclear', 'gchem', 'Nuclear decay: four moves and a half-life', 'Alpha, beta, positron, gamma, and what a half-life does.',
      ['nuclear', 'nuclear chemistry', 'nuclear half life', 'radioactive decay', 'radioactivity', 'alpha beta gamma positron decay', 'alpha decay', 'beta decay', 'positron', 'half life nuclear']),
    B('cell-membrane', 'bio', 'The membrane: who gets across, and how', 'Simple diffusion, channels, pumps and osmosis on one bilayer.',
      ['membrane', 'membranes and transport', 'membrane transport', 'the membrane and what crosses it', 'diffusion', 'active transport', 'facilitated diffusion', 'sodium potassium pump', 'phospholipid bilayer']),
    B('cell-export', 'bio', 'Organelles: how a protein leaves the cell', 'Nucleus, rough ER, Golgi, vesicle, membrane.',
      ['organelle', 'cell organelles function', 'cell structure and organelles', 'cell structure', 'endomembrane', 'golgi', 'endoplasmic reticulum', 'lysosome', 'secretory pathway', 'exocytosis', 'prokaryotes and eukaryotes', 'prokaryote vs eukaryote cell']),
    B('genetics', 'bio', 'Crosses and pedigrees', 'A Punnett square, the ratios, and how to read a pedigree.',
      ['mendelian', 'mendelian genetics', 'genetics', 'genetics general', 'punnett', 'dihybrid', 'dihybrid cross', 'monohybrid', 'pedigree', 'test cross', 'inheritance', 'sex linked', 'x linked', 'beyond mendel and molecular tools']),
    B('hardy-weinberg', 'bio', 'Hardy-Weinberg: one square', 'Allele frequencies on the sides, genotype frequencies as areas.',
      ['hardy weinberg', 'hardy', 'population genetics', 'allele frequency', 'gene pool', 'genetic drift', 'microevolution', 'evolution and hardy weinberg']),
    B('taxonomy', 'bio', 'The tree of life and the ranks', 'Three domains, four eukaryotic kingdoms, eight ranks.',
      ['taxonomy', 'diversity of life', 'diversity', 'classification', 'three domain', 'kingdom', 'phylogeny', 'binomial', 'archaea', 'tree of life']),
    B('development', 'bio', 'From one cell to three layers', 'Cleavage, blastula, gastrula, and what each germ layer becomes.',
      ['development', 'developmental', 'developmental biology', 'embryo', 'embryology', 'gastrulation', 'germ layer', 'cleavage', 'blastula', 'neurulation', 'organogenesis', 'reproduction and development', 'development reproduction']),
    B('endocrine', 'bio', 'Hormone axes and negative feedback', 'Hypothalamus, pituitary, gland, and the loop that shuts it off.',
      ['endocrine', 'endocrine system', 'hormone', 'pituitary', 'hypothalamus', 'negative feedback', 'thyroid', 'hormone axis', 'control systems nerves and hormones']),
    B('muscle', 'bio', 'Sliding filaments: how a muscle shortens', 'One sarcomere, calcium, the power stroke and what ATP does.',
      ['muscle', 'muscle contraction', 'sarcomere', 'sliding filament', 'musculoskeletal', 'skeletal muscle', 'actin myosin', 'muscular system']),
    B('immune', 'bio', 'The immune response, start to finish', 'Innate first, then helper T cells, B cells, killer T cells and memory.',
      ['immune', 'immune system', 'immunity', 'antibody', 'lymphocyte', 'b cell', 't cell', 'innate immunity', 'adaptive immunity', 'lymphatic', 'immunology']),
    B('biotech', 'bio', 'PCR and gel electrophoresis', 'Three temperatures to copy DNA, one gel to sort it by size.',
      ['lab technique', 'biotechnology', 'biotechnology lab pcr gel cloning microscopy', 'pcr', 'gel electrophoresis', 'electrophoresis', 'blot', 'restriction enzyme', 'cloning', 'recombinant dna', 'molecular tool']),
    B('nomenclature', 'ochem', 'Naming: four moves', 'Chain, number, branches, suffix.',
      ['nomenclature', 'naming', 'iupac', 'iupac nomenclature', 'functional group', 'structure and nomenclature']),
    B('stereo', 'ochem', 'R or S, E or Z', 'Rank the groups, send the lowest back, read the turn.',
      ['stereochemistry', 'stereo r', 'r s assignment', 'e z designation', 'chirality', 'chirality basic', 'enantiomer', 'enantiomers vs diastereomer', 'diastereomer', 'meso compound', 'optical activity racemic mixture', 'stereocenter', 'chiral', 'conformations stereochemistry']),
    B('pka-ladder', 'ochem', 'The pK_{a} ladder', 'Nine rungs, one rule for direction, and ARIO for comparing acids.',
      ['pka', 'pka relative acidity', 'acids and bases in ochem', 'acid base', 'acidity', 'relative acidity', 'inductive resonance effects on acidity', 'structure acids and bases', 'acidity stability structure', 'conjugate base', 'ario']),
    B('spectroscopy', 'ochem', 'IR and NMR: reading the peaks', 'Four IR regions worth knowing, and proton NMR in four ideas.',
      ['spectroscopy', 'ir and nmr', 'ir spectroscopy', 'infrared', 'nmr', '1h nmr', '1h nmr shifts multiplicity', '13c nmr', 'spectroscopy and lab technique', 'spectroscopy lab technique', 'chemical shift', 'splitting']),
    B('alkene-map', 'ochem', 'Alkene reactions: one map', 'Six reagents around one double bond: where each piece lands, and on which face.',
      ['alkene', 'alkene addition', 'alkene addition reaction', 'markovnikov', 'markovnikov rule', 'anti markovnikov', 'hydroboration', 'hydroboration oxidation', 'halogenation anti addition', 'ozonolysis', 'hydrogenation', 'acid catalyzed hydration', 'dihydroxylation']),
    B('carbonyl', 'ochem', 'Carbonyls: one attack, two endings', 'Addition for aldehydes and ketones, substitution for acid derivatives.',
      ['carbonyl', 'carbonyl chemistry', 'aldehydes and ketones', 'ketones aldehydes', 'carboxylic acids and derivatives', 'carboxylic acid derivative', 'carboxylic acid derivatives and amines', 'acid derivative reactivity order', 'nucleophilic addition', 'acyl substitution', 'saponification', 'fischer esterification', 'reduction lialh4 nabh4', 'grignard reagent', 'hemiacetals acetal', 'imines enamine']),
    B('synthesis', 'ochem', 'Synthesis roadmap: getting from A to B', 'Six functional groups and the reagents that connect them.',
      ['synthesis', 'synthesis general', 'retrosynthesis', 'multistep synthesis', 'roadmap', 'functional group interconversion']),
    B('hybridization', 'ochem', 'sp, sp2, sp3: count the groups', 'Count what is attached. The number gives the hybrid, the shape and the angle.',
      ['hybridization', 'hybrid orbital', 'sp3', 'sp2', 'sp hybrid', 'orbital hybridization', 'bond angle', 'sigma and pi bond', 'molecular geometry of carbon']),
    B('arrow-pushing', 'ochem', 'Curved arrows: electrons move, atoms follow', 'Tail on the electrons, head where they go. Then recount the charges.',
      ['arrow pushing', 'curved arrow', 'electron pushing', 'mechanism arrow', 'nucleophile electrophile', 'nucleophiles and electrophiles', 'formal charge', 'reaction mechanism basic']),
    B('newman', 'ochem', 'Newman projections: staggered and eclipsed', 'Look down one bond of butane, turn the back carbon, watch the energy.',
      ['newman', 'newman projection', 'conformation', 'conformer', 'conformational analysis', 'gauche', 'staggered', 'eclipsed', 'torsional strain', 'anti conformation']),
    B('chair-flip', 'ochem', 'Chairs: axial, equatorial and the ring flip', 'One bond up or down, one out to the side. Big groups go equatorial.',
      ['chair conformation', 'chair flip', 'ring flip', 'axial', 'equatorial', 'axial equatorial', 'cyclohexane conformation', '1 3 diaxial', 'cycloalkane']),
    B('sn2-e2-shape', 'ochem', 'SN2 and E2 in 3D: backside and anti', 'Backside attack inverts. E2 needs the hydrogen anti to the leaving group.',
      ['backside attack', 'inversion of configuration', 'walden inversion', 'anti periplanar', 'antiperiplanar', 'e2 stereochemistry', 'sn2 stereochemistry', 'trans diaxial']),
    B('alkynes', 'ochem', 'Alkynes: reduce, hydrate, extend', 'One triple bond, four things the DAT asks you to do with it.',
      ['alkyne', 'alkyne reaction', 'alkyne reduction lindlar vs na nh3', 'lindlar', 'acetylide', 'terminal alkyne', 'alkyne hydration', 'dissolving metal reduction']),
    B('alcohols-ethers', 'ochem', 'Alcohols and ethers: oxidize, swap, lose water', 'What happens to an OH depends on its carbon and the reagent you pick.',
      ['alcohol', 'alcohols and ether', 'ether', 'epoxide', 'alcohol oxidation', 'alcohol dehydration', 'williamson ether synthesis', 'williamson', 'pcc', 'tosylate', 'epoxide opening']),
    B('amines', 'ochem', 'Amines: the lone pair does everything', 'Base, nucleophile, hydrogen-bond partner: all the lone pair on nitrogen.',
      ['amine', 'amine basicity', 'reductive amination', 'gabriel synthesis', 'aniline', 'amide basicity', 'basicity of amine']),
    B('aromaticity', 'ochem', 'Aromatic or not: four checks', 'Ring, flat, a p orbital on every atom, and 4n + 2 pi electrons.',
      ['huckel', 'huckel rule', 'antiaromatic', 'aromatic or not', 'aromatic heterocycle', '4n 2', 'benzene structure', 'pi electron count']),
    B('units', 'qr', 'Unit conversions: the train track', 'Multiply by 1 until the unwanted units cancel.',
      ['unit conversion', 'conversion', 'unit', 'dimensional analysis', 'ratios proportions and unit conversion']),
    B('probability', 'qr', 'Probability: the tree', 'Multiply along a branch, add across branches, and use 1 minus the opposite.',
      ['probability', 'probability and counting', 'basic probability', 'probability general', 'p andor', 'p cond', 'conditional probability', 'combination', 'permutation', 'counting']),
    B('statistics', 'qr', 'Mean, median, mode and spread', 'Five numbers on a line, and what an outlier does to each measure.',
      ['statistic', 'statistics and data analysis', 'mean median mode range', 'mean', 'median', 'standard deviation', 'desc stats', 'average', 'data interpretation', 'statistics mean median sd']),
    B('geometry', 'qr', 'Area and volume: six shapes', 'Base area times height, the one-third shapes, and how scaling works.',
      ['geometry', 'geometry area volume', 'area', 'volume', 'surface area', 'geo 2d', 'vol sa', 'polygons interior angle area', 'circle', 'perimeter']),
    B('data-sufficiency', 'qr', 'Data sufficiency: the decision tree', 'Test each statement alone, combine only if both fail.',
      ['data sufficiency', 'qr ds', 'sufficiency']),
    B('quant-compare', 'qr', 'Quantitative comparison: try to flip it', 'Simplify both sides, then test odd numbers to break the pattern.',
      ['quantitative comparison', 'qr qc', 'quant comparison']),
    B('pat-keyholes', 'pat', 'Keyholes: three outlines, one fits', 'Front, top and end outlines, and the size trap.',
      ['keyhole', 'keyholes', 'aperture', 'apertures']),
    B('pat-tfe', 'pat', 'Top, front, end: three flat views', 'How the views line up, and what solid and dashed lines mean.',
      ['tfe', 'top front end', 'view recognition', 'orthographic']),
    B('pat-angles', 'pat', 'Angle ranking: look at the corner', 'Ignore the legs, pin the extremes, eliminate.',
      ['angle', 'angles', 'angle ranking', 'angle discrimination']),
    B('pat-holepunch', 'pat', 'Hole punching: unfold in reverse', 'Mirror the holes across each fold, last fold first.',
      ['holepunch', 'hole punch', 'hole punching', 'paper folding']),
    B('pat-cubes', 'pat', 'Cube counting: tally every cube', 'Count hidden cubes, then painted faces one cube at a time.',
      ['cube', 'cubes', 'cube counting']),
    B('pat-patternfold', 'pat', 'Pattern folding: neighbors and opposites', 'Which faces touch, which never do, and how to eliminate.',
      ['patternfold', 'pattern fold', 'pattern folding', 'form development', '3d form development']),
    B('rc-map', 'rc', 'Map the passage first', 'A few words per paragraph, landmarks marked, main idea in one line.',
      ['mainidea', 'main idea', 'passage map', 'map', 'structure', 'organization']),
    B('rc-question-types', 'rc', 'Four question types, four moves', 'Detail, inference, tone and purpose, except and not.',
      ['detail', 'detail question', 'inference', 'tone', 'purpose', 'except', 'not', 'function', 'function question', 'application', 'question type', 'author attitude']),
    B('rc-pacing', 'rc', 'Pacing: 60 minutes, three passages', 'Twenty minutes a passage, two checkpoints, no blanks.',
      ['pacing', 'timing', 'time management', 'time']),

    /* ---------- Organic Chemistry ---------- */
    { id: 'oc-wheels', section: 'ochem', group: 'Reactions and mechanisms', step: 'try', featured: true,
      title: 'Reaction wheels', path: OC + '?game=wheel',
      blurb: 'Twenty-three wheels, one starting material in the middle of each.',
      does: 'Pick the reagent for every spoke until the wheel is full.', next: 'Then run the same family in The Summit.',
      topics: ['reaction wheel', 'reagent', 'reaction'],
      links: [
        L('Terminal alkene wheel', OC + '?game=wheel&wheel=alkene_terminal', ['terminal alkene']),
        L('Internal alkene wheel', OC + '?game=wheel&wheel=alkene_internal', ['internal alkene']),
        L('Terminal alkyne wheel', OC + '?game=wheel&wheel=alkyne_terminal', ['terminal alkyne']),
        L('Internal alkyne wheel', OC + '?game=wheel&wheel=alkyne_internal', ['internal alkyne']),
        L('Primary alkyl halide wheel', OC + '?game=wheel&wheel=halide_primary', ['primary alkyl halide']),
        L('Secondary alkyl halide wheel', OC + '?game=wheel&wheel=halide_secondary', ['alkyl halide', 'secondary alkyl halide']),
        L('Tertiary alkyl halide wheel', OC + '?game=wheel&wheel=halide_tertiary', ['tertiary alkyl halide']),
        L('Primary alcohol wheel', OC + '?game=wheel&wheel=alcohol_primary', ['primary alcohol']),
        L('Secondary alcohol wheel', OC + '?game=wheel&wheel=alcohol_secondary', ['secondary alcohol']),
        L('Tertiary alcohol wheel', OC + '?game=wheel&wheel=alcohol_tertiary', ['tertiary alcohol']),
        L('Acid chloride wheel', OC + '?game=wheel&wheel=acid_chloride', ['acid chloride', 'acyl chloride']),
        L('Epoxide wheel', OC + '?game=wheel&wheel=epoxide', ['epoxide']),
        L('Benzene wheel', OC + '?game=wheel&wheel=benzene', ['benzene', 'electrophilic aromatic substitution', 'eas']),
        L('Aniline wheel', OC + '?game=wheel&wheel=aniline', ['aniline']),
        L('Aldehyde wheel', OC + '?game=wheel&wheel=aldehyde', ['aldehyde']),
        L('Ketone wheel', OC + '?game=wheel&wheel=ketone', ['ketone']),
        L('Ester wheel', OC + '?game=wheel&wheel=ester', ['ester']),
        L('Carboxylic acid wheel', OC + '?game=wheel&wheel=acid', ['carboxylic acid']),
        L('Amide wheel', OC + '?game=wheel&wheel=amide', ['amide']),
        L('Nitrile wheel', OC + '?game=wheel&wheel=nitrile', ['nitrile']),
        L('Toluene wheel', OC + '?game=wheel&wheel=toluene', ['toluene', 'benzylic']),
        L('Alkane wheel', OC + '?game=wheel&wheel=alkane', ['radical halogenation']),
        L('Conjugated diene wheel', OC + '?game=wheel&wheel=diene', ['conjugated diene', 'diene'])
      ] },
    { id: 'oc-maps', section: 'ochem', group: 'Reactions and mechanisms', step: 'see', featured: true,
      title: 'Reaction Maps', path: OC + '#hubs',
      blurb: 'Eighteen hubs, each one a map of what a functional group turns into.',
      does: 'Open a hub and follow each arrow from reagent to product.', next: 'Then spin that hub\'s reaction wheel.',
      topics: ['reaction map', 'functional group'],
      links: [
        L('Alkenes hub', OC + '#alkenes', ['alkene', 'alkene addition', 'addition reaction']),
        L('Alkynes hub', OC + '#alkynes', ['alkyne']),
        L('Alkanes hub', OC + '#alkanes', ['alkane', 'conformation', 'newman projection', 'radical']),
        L('Substitution and elimination hub', OC + '#subelim', ['sn1', 'sn2', 'e1', 'e2', 'substitution', 'elimination']),
        L('Alcohols hub', OC + '#alcohols', ['alcohol']),
        L('Ethers and epoxides hub', OC + '#ethers', ['ether']),
        L('Aromatic hub', OC + '#aromatic', ['aromatic', 'aromaticity']),
        L('Aldehydes and ketones hub', OC + '#carbonyl', ['carbonyl']),
        L('Acids and derivatives hub', OC + '#acids', ['acid derivative', 'acyl']),
        L('Amines hub', OC + '#amines', ['amine']),
        L('Alpha and condensation hub', OC + '#alpha-condensation', ['aldol', 'enolate', 'claisen', 'condensation']),
        L('Bonding and resonance hub', OC + '#bonding', ['resonance', 'bonding', 'hybridization', 'stability', 'structural evaluation']),
        L('Nomenclature hub', OC + '#nomenclature', ['nomenclature', 'iupac', 'naming']),
        L('Acid-base hub', OC + '#acid-base-cardio', ['acidity', 'pka', 'acid base', 'acid base chemistry']),
        L('Lab techniques hub', OC + '#lab-techniques', ['lab technique', 'extraction', 'chromatography', 'distillation', 'chemical and physical property'])
      ] },
    { id: 'oc-mech', section: 'ochem', group: 'Reactions and mechanisms', step: 'see',
      title: 'Mechanism library', path: OC + '#mech-library',
      blurb: 'The core mechanisms, drawn arrow by arrow.',
      does: 'Step through the arrows of one mechanism at a time.', next: 'Then name the product on its reaction wheel.',
      topics: ['mechanism', 'arrow pushing', 'curved arrow'] },
    { id: 'oc-diels', section: 'ochem', group: 'Reactions and mechanisms', step: 'see',
      title: 'Diels-Alder', path: OC + '#diels-alder',
      blurb: 'The three-arrow cycloaddition, diene plus dienophile.',
      does: 'Watch the three arrows close the ring.', next: 'Then try the conjugated diene wheel.',
      topics: ['diels alder', 'diels alder reaction', 'cycloaddition', 'dienophile'] },
    { id: 'oc-roots', section: 'ochem', group: 'Reactions and mechanisms', step: 'see',
      title: 'The Roots of Organic', path: '/tools/ochem/roots/',
      blurb: 'The eighteen ideas every reaction stands on.',
      does: 'Work through the roots, level by level.', next: 'Then climb The Tree.',
      topics: ['root of organic', 'nucleophile', 'electrophile'] },
    { id: 'oc-tree', section: 'ochem', group: 'Reactions and mechanisms', step: 'try',
      title: 'The Tree of Organic', path: '/tools/ochem/tree/',
      blurb: 'Trunk, branches and canopy: the roots applied to reagents, mechanisms and synthesis.',
      does: 'Work one module at a time, from the trunk up.', next: 'Then take The Summit.',
      topics: ['tree of organic'] },
    { id: 'oc-decide', section: 'ochem', group: 'Reactions and mechanisms', step: 'try',
      title: 'The Two Decisions', path: '/tools/ochem/decide/',
      blurb: 'Two decision trees: stereo relationships, and substitution or elimination.',
      does: 'Run a question down the tree, one fork at a time.', next: 'Then open the SN and E hub in Reaction Maps.',
      topics: ['substitution versus elimination', 'decision tree'] },
    { id: 'oc-synth', section: 'ochem', group: 'Reactions and mechanisms', step: 'test',
      title: 'Synthesis lab', path: OC + '#synthesis-lab',
      blurb: 'Multi-step routes from start to target.',
      does: 'Chain the reagents that get you from start to target.', next: 'Then take The Summit.',
      topics: ['synthesis', 'roadmap', 'multi step', 'chemical synthesis'] },
    { id: 'oc-chirality', section: 'ochem', group: 'Stereochemistry and 3D', step: 'try',
      title: 'Chirality Bench', path: '/games/chirality/',
      blurb: 'A 3D model beside the wedge-and-dash drawing.',
      does: 'Call R or S on the model before you look.', next: 'Then run the Stereochemistry lab.',
      topics: ['chirality', 'chiral', 'stereochemistry', 'r s', 'stereocenter', 'enantiomer', 'diastereomer', 'optical activity'] },
    { id: 'oc-3d', section: 'ochem', group: 'Stereochemistry and 3D', step: 'see',
      title: '3D beside the drawing', path: '/oc/3d/',
      blurb: 'Seven stereocenters and two chairs, model next to drawing.',
      does: 'Turn the model and match it to the DAT drawing.', next: 'Then call R or S on the Chirality Bench.',
      topics: ['chair', 'wedge and dash', 'fischer projection', 'cyclohexane', '3d'] },
    { id: 'oc-models', section: 'ochem', group: 'Stereochemistry and 3D', step: 'try',
      title: 'OChem 3D models', path: '/oc/models/',
      blurb: 'Seven models to turn and run, each beside its line drawing and the words.',
      does: 'Flip a chair, turn a Newman, run SN2 and E2.', next: 'Then read the matching Chalk Talk.',
      topics: ['3d model', 'ring flip model', 'hybrid orbital model', 'newman model'] },
    { id: 'oc-stereo-lab', section: 'ochem', group: 'Stereochemistry and 3D', step: 'test',
      title: 'Stereochemistry lab', path: OC + '#stereo-lab',
      blurb: 'The stereo hub inside Reaction Maps.',
      does: 'Assign and compare stereocenters across drawings.', next: 'Then take The Summit.',
      topics: ['meso', 'stereoisomer'] },
    { id: 'oc-spec', section: 'ochem', group: 'Structure and spectroscopy', step: 'try',
      title: 'Spec trainer', path: OC + '#spec-trainer',
      blurb: 'IR and NMR spectra you read for the functional group.',
      does: 'Read the peaks and name the structure.', next: 'Then check the fragment in Mass spec.',
      topics: ['spectroscopy', 'ir', 'nmr', 'h nmr'],
      links: [L('Mass spec', OC + '#mass-spec', ['mass spec', 'mass spectrometry'])] },
    { id: 'oc-summit', section: 'ochem', group: 'Practice', step: 'test',
      title: 'The Summit', path: '/tools/ochem/summit/',
      blurb: 'Thirty OChem questions in one sitting.',
      does: 'Answer thirty, then read which areas you missed.', next: 'Each miss lands in Review with a See it button.',
      topics: [] },

    /* ---------- General Chemistry ---------- */
    { id: 'gc-vsepr', section: 'gchem', group: 'Structure and bonding', step: 'see',
      title: 'VSEPR in 3D', path: '/gc/vsepr/',
      blurb: 'Thirteen molecules from CO2 to XeF4.',
      does: 'Count domains, call the shape, then turn the model.', next: 'Then build one in the Lewis sandbox.',
      topics: ['vsepr', 'geometry', 'molecular shape', 'hybridization', 'bond angle', 'shape sticky force'] },
    { id: 'gc-lewis', section: 'gchem', group: 'Structure and bonding', step: 'try',
      title: 'Lewis sandbox', path: '/tools/gc/lewis-sandbox.html',
      blurb: 'A five-stage build: electrons, skeleton, lone pairs, geometry, polarity.',
      does: 'Build the structure stage by stage.', next: 'Then drill shapes in the Recognition lab.',
      topics: ['lewis', 'lewis structure', 'bonding', 'formal charge', 'polarity', 'octet', 'why atoms bond', 'resonance structure'] },
    { id: 'gc-trends', section: 'gchem', group: 'Structure and bonding', step: 'see',
      title: 'Periodic trends', path: '/tools/gc/trends.html',
      blurb: 'A heatmap of the table, a speed drill and an isoelectronic ranker.',
      does: 'Switch the trend and watch the table recolor, then rank.', next: 'Then take a Gen Chem set.',
      topics: ['periodic', 'periodic trend', 'electronegativity', 'ionization energy', 'atomic radius', 'electron affinity', 'atomic structure', 'electron configuration'] },
    { id: 'gc-galvanic', section: 'gchem', group: 'Electrochemistry', step: 'see',
      title: 'Galvanic cell', path: '/gc/galvanic/',
      blurb: 'Nine half-cells you can pair up.',
      does: 'Call the electron flow, then watch it run.', next: 'Then take a Gen Chem set on electrochemistry.',
      topics: ['galvanic', 'galvanic cell', 'reduction potential', 'std reduction potential', 'voltaic', 'anode', 'cathode'] },
    { id: 'gc-recognition', section: 'gchem', group: 'Graphs and diagrams', step: 'try',
      title: 'Recognition lab', path: '/tools/gc/recognition-lab.html',
      blurb: 'Graphs, structures and diagrams against a short timer.',
      does: 'Name what the picture shows, fast.', next: 'Then take a Gen Chem set.',
      topics: ['phase diagram', 'heating curve', 'heating and cooling curve', 'nuclear', 'nuclear decay', 'nuclear half life', 'intermolecular force', 'imf', 'vapor pressure', 'phase change', 'liquid'] },
    { id: 'gc-guacamole', section: 'gchem', group: 'Structure and bonding', step: 'try',
      title: 'GuacaMOLE', path: '/gc/guacamole/',
      blurb: 'Mole conversions as a walk: grams, moles, particles.',
      does: 'Pick the next conversion step and walk the path.', next: 'Then open the mole bridge board.',
      topics: ['guacamole', 'mole game', 'mole walk'] },

    /* ---------- Biology ---------- */
    { id: 'bio-plates', section: 'bio', group: 'Cell', step: 'see',
      title: 'Biology plates', path: '/bio/see/',
      blurb: 'Unlabeled plates, from the eye to the chloroplast.',
      does: 'Name the part first; then the labels draw in.', next: 'Then open the matching hub below.',
      topics: ['plate', 'label the diagram'] },
    { id: 'bio-cell', section: 'bio', group: 'Cell', step: 'see',
      title: 'Cell and molecular hub', path: CELL,
      blurb: 'Nineteen animated nodes, from water to photosynthesis.',
      does: 'Open a node and play its animation.', next: 'Then take a Biology set.',
      topics: ['cell', 'molecular biology', 'biomolecule'],
      links: [
        L('Water', CELL + '#node-water', ['water']),
        L('Carbohydrates', CELL + '#node-carbs', ['carbohydrate']),
        L('Lipids', CELL + '#node-lipids', ['lipid']),
        L('Proteins', CELL + '#node-proteins', ['protein']),
        L('Nucleic acids', CELL + '#node-nucleic', ['nucleic acid']),
        L('Enzymes', CELL + '#node-enzymes', ['enzyme']),
        L('Prokaryotes and eukaryotes', CELL + '#node-prokaryote', ['prokaryote', 'eukaryote', 'cell type']),
        L('Organelles', CELL + '#node-organelles', ['organelle', 'cell structure']),
        L('Cytoskeleton', CELL + '#node-cytoskeleton', ['cytoskeleton']),
        L('Membranes', CELL + '#node-membrane', ['membrane', 'membrane transport']),
        L('Cell signaling', CELL + '#node-signaling', ['signaling', 'cell signaling']),
        L('Glycolysis', CELL + '#node-glycolysis', ['glycolysis']),
        L('Krebs and electron transport', CELL + '#node-krebs', ['kreb', 'kreb cycle', 'electron transport', 'cellular respiration']),
        L('Photosynthesis', CELL + '#node-photo', ['photosynthesis']),
        L('Mitosis', CELL + '#node-mitosis', ['mitosis', 'cell cycle']),
        L('DNA replication', CELL + '#node-replication', ['replication', 'dna replication']),
        L('Transcription', CELL + '#node-transcription', ['transcription', 'central dogma']),
        L('Translation', CELL + '#node-translation', ['translation'])
      ] },
    { id: 'bio-osmosis', section: 'bio', group: 'Cell', step: 'try',
      title: 'Osmosis lab', path: '/tools/bio/bio-osmosis.html',
      blurb: 'A cell in a solution you control.',
      does: 'Change the solution and watch the water move.', next: 'Then open Membranes in the Cell hub.',
      topics: ['osmosis', 'tonicity', 'hypotonic', 'hypertonic', 'isotonic'] },
    { id: 'bio-micrographs', section: 'bio', group: 'Cell', step: 'test',
      title: 'Micrograph ID', path: '/tools/bio/bio-micrographs.html',
      blurb: 'Micrograph-style images to identify.',
      does: 'Name the structure from the image.', next: 'Then take a Biology set.',
      topics: ['micrograph', 'histology'] },
    { id: 'bio-genetics', section: 'bio', group: 'Genetics', step: 'see',
      title: 'Genetics hub', path: GEN,
      blurb: 'Nine nodes, from Mendel to gene regulation.',
      does: 'Open a node and work its cross or pedigree.', next: 'Then take a Biology set.',
      topics: ['genetic', 'heredity'],
      links: [
        L('Mendelian crosses', GEN + '#node-mendelian', ['mendelian', 'mendelian genetic', 'punnett']),
        L('Meiosis', GEN + '#node-meiosis', ['meiosis']),
        L('Linkage', GEN + '#node-linkage', ['linkage', 'recombination']),
        L('Pedigrees', GEN + '#node-pedigrees', ['pedigree']),
        L('Hardy-Weinberg', GEN + '#node-hardy-weinberg', ['hardy weinberg', 'population genetic']),
        L('Gene regulation', GEN + '#node-gene-regulation', ['gene regulation', 'operon']),
        L('Mutations', GEN + '#node-mutations', ['mutation']),
        L('Beyond Mendel', GEN + '#node-non-mendelian', ['non mendelian', 'epistasis', 'epistasis polygenic trait', 'polygenic', 'incomplete dominance', 'codominance'])
      ] },
    { id: 'bio-physiology', section: 'bio', group: 'Body systems', step: 'see',
      title: 'Body Systems', path: PHYS,
      blurb: 'Thirteen systems with moving diagrams: heart, nephron, lungs and more.',
      does: 'Open a system and play it through.', next: 'Then label a plate from that system.',
      topics: ['body system', 'physiology', 'anatomy', 'structure and function'],
      links: [
        L('Cardiovascular', PHYS + '#node-cardiovascular', ['cardiovascular', 'heart', 'circulatory', 'blood']),
        L('Nephron', PHYS + '#node-nephron', ['nephron', 'kidney', 'renal', 'excretory']),
        L('Respiratory', PHYS + '#node-respiratory', ['respiratory', 'lung']),
        L('Endocrine', PHYS + '#node-endocrine', ['endocrine', 'hormone']),
        L('Digestive', PHYS + '#node-digestive', ['digestive', 'digestion']),
        L('Reproductive', PHYS + '#node-reproductive', ['reproductive', 'reproduction']),
        L('Action potential', PHYS + '#node-action-potential', ['action potential', 'neuron', 'nervous']),
        L('Brain regions', PHYS + '#node-brain-regions', ['brain', 'brain region', 'brain region function']),
        L('Special senses', PHYS + '#node-special-senses', ['special sense', 'eye', 'ear']),
        L('Sliding filament', PHYS + '#node-sliding-filament', ['sliding filament', 'muscle', 'sarcomere', 'muscular', 'muscular system'])
      ] },
    { id: 'bio-immune', section: 'bio', group: 'Body systems', step: 'see',
      title: 'Innate vs adaptive immunity', path: '/tools/bio/bio-immune-cells.html',
      blurb: 'The immune cells, sorted by which arm they belong to.',
      does: 'Pick a cell and see which arm it works for.', next: 'Then open Body Systems.',
      topics: ['immune', 'immunity', 'antibody', 'lymphocyte'] },
    { id: 'bio-diversity', section: 'bio', group: 'Diversity', step: 'see',
      title: 'Diversity of Life hub', path: DIV,
      blurb: 'Domains, plants, animals and phylogenetic trees.',
      does: 'Open a node and place the group on the tree.', next: 'Then take a Biology set.',
      topics: ['diversity', 'taxonomy', 'classification', 'kingdom'],
      links: [
        L('Plants', DIV + '#node-plants', ['plant']),
        L('Animals', DIV + '#node-animals', ['animal', 'phyla']),
        L('Phylogenetics', DIV + '#node-phylogenetics', ['phylogenetic', 'phylogeny', 'cladogram'])
      ] },
    { id: 'bio-devo', section: 'bio', group: 'Development', step: 'see',
      title: 'Developmental Biology hub', path: DEVO,
      blurb: 'Fertilization through organogenesis.',
      does: 'Step the embryo from one stage to the next.', next: 'Then take a Biology set.',
      topics: ['development', 'developmental', 'embryo', 'embryology'],
      links: [
        L('Fertilization', DEVO + '#node-fertilization', ['fertilization', 'cleavage']),
        L('Gastrulation', DEVO + '#node-gastrulation', ['gastrulation', 'germ layer']),
        L('Organogenesis', DEVO + '#node-organogenesis', ['organogenesis', 'neurulation'])
      ] },
    { id: 'bio-evolution', section: 'bio', group: 'Evolution', step: 'see',
      title: 'Evolution and Ecology hub', path: EVO,
      blurb: 'Selection, speciation, ecology and behavior.',
      does: 'Open a node and run its model.', next: 'Then take a Biology set.',
      topics: ['evolution', 'ecology'],
      links: [
        L('Natural selection', EVO + '#node-natural-selection', ['natural selection', 'selection']),
        L('Speciation', EVO + '#node-speciation', ['speciation']),
        L('Ecology', EVO + '#node-ecology', ['ecosystem', 'biome', 'population ecology']),
        L('Behavior', EVO + '#node-behavior', ['behavior'])
      ] },

    /* ---------- Perceptual Ability ---------- */
    { id: 'pat-keyholes', section: 'pat', group: 'Keyholes', step: 'try',
      title: 'Aperture trainer', path: '/tools/pat/keyholes.html',
      blurb: 'A solid and five openings.', does: 'Pick the opening the solid passes through.', next: 'Then take the ninety-question PAT.',
      topics: ['keyhole', 'aperture'] },
    { id: 'pat-tfe', section: 'pat', group: 'Top, front, end', step: 'try',
      title: 'Top, front, end', path: '/tools/pat/tfe.html',
      blurb: 'Solid means seen, dashed means hidden.', does: 'Find the missing view from the other two.', next: 'Then turn the shape in Six Views.',
      topics: ['tfe', 'top front end', 'view recognition'] },
    { id: 'pat-six-views', section: 'pat', group: 'Top, front, end', step: 'see',
      title: 'Six Views', path: '/games/six-views/',
      blurb: 'The shape in 3D after you answer.', does: 'Answer, then spin the solid to check.', next: 'Then drill Top, front, end.',
      topics: ['six view', 'orthographic'] },
    { id: 'pat-angles', section: 'pat', group: 'Angle ranking', step: 'try',
      title: 'Angle discrimination', path: '/tools/pat/angles.html',
      blurb: 'Four angles a few degrees apart.', does: 'Rank them smallest to largest.', next: 'Then take the ninety-question PAT.',
      topics: ['angle', 'angle ranking'] },
    { id: 'pat-holepunch', section: 'pat', group: 'Hole punching', step: 'try',
      title: 'Hole punching', path: '/tools/pat/holepunch.html',
      blurb: 'The grid method, fold by fold.', does: 'Unfold the paper and mark every hole.', next: 'Then take the ninety-question PAT.',
      topics: ['holepunch', 'hole punching', 'hole punch'] },
    { id: 'pat-cubes', section: 'pat', group: 'Cube counting', step: 'try',
      title: 'Cube counting', path: '/tools/pat/cubes.html',
      blurb: 'The T-chart for painted faces.', does: 'Tally each cube by its painted sides.', next: 'Then take the ninety-question PAT.',
      topics: ['cube', 'cube counting'] },
    { id: 'pat-patternfold', section: 'pat', group: 'Pattern folding', step: 'try',
      title: 'Pattern folding', path: '/tools/pat/patternfold.html',
      blurb: 'Flat patterns and the solid each one makes.', does: 'Match the flat pattern to its solid.', next: 'Then take the ninety-question PAT.',
      topics: ['patternfold', 'pattern folding', 'pattern fold'] },

    /* ---------- Quantitative Reasoning ---------- */
    { id: 'qr-worked', section: 'qr', group: 'Percent, ratio and word problems', step: 'see',
      title: 'Worked solutions you can see', path: '/qr/worked/',
      blurb: 'Six problem families with the method drawn step by step.',
      does: 'Answer first, then watch the method drawn.', next: 'Then drill the same family in QR practice.',
      topics: ['percent', 'percentage', 'percent change', 'percent increase decrease', 'ratio', 'proportion', 'work rate', 'work', 'mixture', 'word problem', 'altitude'] },
    { id: 'qr-probability', section: 'qr', group: 'Probability', step: 'try',
      title: 'Probability Sandbox', path: QRP + 'agent-04-prob-tree/probability-sandbox.html',
      blurb: 'One tree for every probability question.',
      does: 'Build the tree branch by branch and read the answer off it.', next: 'Then drill probability in QR practice.',
      topics: ['probability', 'conditional', 'probability tree', 'permutation', 'combination', 'p cond', 'p andor', 'count pc', 'counting principle', 'expected value', 'p expected'] },
    { id: 'qr-stats', section: 'qr', group: 'Statistics', step: 'try',
      title: 'Stats Lab', path: QRP + 'agent-05-stats/stats-lab.html',
      blurb: 'Points you can move, with z-scores and the harmonic mean.',
      does: 'Move a point and watch mean, median and spread shift.', next: 'Then try the mean versus median trap.',
      topics: ['statistic', 'median', 'standard deviation', 'descriptive statistic', 'desc stats', 'z score', 'zscore', 'harmonic mean', 'harm', 'normal distribution'] },
    { id: 'qr-mean-median', section: 'qr', group: 'Statistics', step: 'see',
      title: 'Mean versus median trap', path: QRP + 'agent-05-stats/mean-vs-median-trap.html',
      blurb: 'What one outlier does to each.',
      does: 'Drag the outlier and see which one moves.', next: 'Then open the Stats Lab.',
      topics: ['mean v median', 'outlier', 'skew'] },
    { id: 'qr-geo-2d', section: 'qr', group: 'Geometry', step: 'try',
      title: '2D Geometry', path: QRP + 'agent-06-geometry/geo-2d.html',
      blurb: 'Circles and squares with corners you drag.',
      does: 'Drag a corner and watch area and perimeter change.', next: 'Then open Volume and surface area.',
      topics: ['geometry', '2d geometry', 'geo 2d', 'circle', 'area', 'perimeter', 'polygon'] },
    { id: 'qr-triangle', section: 'qr', group: 'Geometry', step: 'see',
      title: 'Triangle invariance', path: QRP + 'agent-06-geometry/tri-inv.html',
      blurb: 'A triangle you can reshape, with the triangle inequality checked live.',
      does: 'Drag a vertex and watch sides and angles recompute.', next: 'Then open 2D Geometry.',
      topics: ['triangle', 'triangle invariance', 'tri inv', 'triangle inequality'] },
    { id: 'qr-coord', section: 'qr', group: 'Geometry', step: 'see',
      title: 'Coordinate plane', path: QRP + 'agent-06-geometry/coord.html',
      blurb: 'Two points, their slope, distance and midpoint.',
      does: 'Move the two points and read the slope and distance.', next: 'Then open 2D Geometry.',
      topics: ['coordinate', 'coordinate plane', 'coord', 'coordinate geometry', 'slope', 'midpoint', 'distance formula'] },
    { id: 'qr-volume', section: 'qr', group: 'Geometry', step: 'see',
      title: 'Volume and surface area', path: QRP + 'agent-06-geometry/vol-sa.html',
      blurb: 'Solids in 3D and the cube law.',
      does: 'Scale the solid and compare volume to surface.', next: 'Then drill geometry in QR practice.',
      topics: ['volume', 'surface area', 'volume surface', 'vol sa', 'cube law', '3d solid'] },

    /* ---------- Reading ---------- */
    { id: 'rc-map', section: 'rc', group: 'Passage maps', step: 'see',
      title: 'Map it, then find the line', path: '/rc/map/',
      blurb: 'A passage you map before you answer.',
      does: 'Name each paragraph\'s job; then every answer lights up its line.', next: 'Then take a timed passage.',
      topics: ['detail', 'detail question', 'mainidea', 'main idea', 'function', 'function question', 'passage map', 'except'] }
  ];

  var SECTIONS = [
    { id: 'ochem', name: 'Organic Chemistry', color: '#6b4fa0',
      start: 'Start here: see a reaction family on its map, then fill its wheel from memory.',
      path: [{ step: 'See it', title: 'Reaction Maps', href: OC + '#hubs' }, { step: 'Try it', title: 'Reaction wheels', href: OC + '?game=wheel' }, { step: 'Test it', title: 'The Summit', href: '/tools/ochem/summit/' }],
      groups: ['Whiteboards', 'Reactions and mechanisms', 'Stereochemistry and 3D', 'Structure and spectroscopy', 'Practice'] },
    { id: 'gchem', name: 'General Chemistry', color: '#2f5f9e',
      start: 'Start here: turn the molecule first, then build it yourself.',
      path: [{ step: 'See it', title: 'VSEPR in 3D', href: '/gc/vsepr/' }, { step: 'Try it', title: 'Lewis sandbox', href: '/tools/gc/lewis-sandbox.html' }, { step: 'Test it', title: 'Ten-question Gen Chem set', href: '/gc/?run=daily' }],
      groups: ['Whiteboards', 'Structure and bonding', 'Electrochemistry', 'Graphs and diagrams'] },
    { id: 'bio', name: 'Biology', color: '#2f7d4f',
      start: 'Start here: label a plate cold, then open the hub for whatever you could not name.',
      path: [{ step: 'See it', title: 'Biology plates', href: '/bio/see/' }, { step: 'Try it', title: 'Osmosis lab', href: '/tools/bio/bio-osmosis.html' }, { step: 'Test it', title: 'Biology set', href: '/bio/' }],
      groups: ['Whiteboards', 'Cell', 'Genetics', 'Body systems', 'Diversity', 'Development', 'Evolution'] },
    { id: 'pat', name: 'Perceptual Ability', color: '#a8641f',
      start: 'Start here: pick the subtest you miss most and train only that one today.',
      path: [{ step: 'See it', title: 'Six Views', href: '/games/six-views/' }, { step: 'Try it', title: 'Top, front, end', href: '/tools/pat/tfe.html' }, { step: 'Test it', title: 'Ninety-question PAT', href: '/tools/pat/test.html' }],
      groups: ['Whiteboards', 'Keyholes', 'Top, front, end', 'Angle ranking', 'Hole punching', 'Cube counting', 'Pattern folding'] },
    { id: 'qr', name: 'Quantitative Reasoning', color: '#a3405c',
      start: 'Start here: watch one method drawn, then rebuild it on a new problem.',
      path: [{ step: 'See it', title: 'Worked solutions', href: '/qr/worked/' }, { step: 'Try it', title: 'Probability Sandbox', href: QRP + 'agent-04-prob-tree/probability-sandbox.html' }, { step: 'Test it', title: 'QR practice', href: '/qr/drill/' }],
      groups: ['Whiteboards', 'Percent, ratio and word problems', 'Probability', 'Statistics', 'Geometry'] },
    { id: 'rc', name: 'Reading Comprehension', color: '#1f7a70',
      start: 'Start here: map one passage before you read a single question.',
      path: [{ step: 'See it', title: 'Map it, then find the line', href: '/rc/map/' }, { step: 'Try it', title: 'Map a second passage', href: '/rc/map/' }, { step: 'Test it', title: 'Timed passages', href: '/tools/rc/' }],
      groups: ['Whiteboards', 'Passage maps'] }
  ];

  /* Any section spelling the tools use -> one code (same rule as shared/ace-route.js). */
  function section(s) {
    var k = String(s || '').toLowerCase().replace(/[^a-z]/g, '');
    if (/^(bio|biology)/.test(k)) return 'bio';
    if (/^(gc|gchem|genchem|generalchem)/.test(k)) return 'gchem';
    if (/^(oc|ochem|orgo|organic)/.test(k)) return 'ochem';
    if (/^(qr|quant)/.test(k)) return 'qr';
    if (/^(pat|perceptual)/.test(k)) return 'pat';
    if (/^(rc|reading)/.test(k)) return 'rc';
    return null;
  }
  function norm(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/)
      .filter(function (w) { return w && w !== 'and' && w !== 'the' && w !== 'of'; })
      .map(function (w) { return w.length > 3 ? w.replace(/ies$/, 'y').replace(/(sses)$/, 'ss').replace(/([^s])s$/, '$1') : w; })
      .join(' ');
  }
  function score(text, topics) {
    var best = 0;
    for (var i = 0; i < topics.length; i++) {
      var p = norm(topics[i]);
      if (p && text.indexOf(' ' + p + ' ') >= 0) { var s = p.split(' ').length * 100 + p.length; if (s > best) best = s; }
    }
    return best;
  }
  /* OChem reaction misses open the exact spoke of the reaction wheel when the question names the
     reagent: ?game=wheel&wheel=<substrate>&spoke=<reagent key> (the wheel's own deep link). Each row:
     [regex on the stem, wheel, spoke, label]. Keys are checked against
     tools/ochem/wheel/wheel-structures.json in tests/shell/ace-visuals.test.js. First match wins. */
  var SPOKES = [
    [/peroxide|ROOR/i, 'alkene_terminal', 'hbr_peroxide', 'HBr with peroxide, anti-Markovnikov'],
    [/BH3|9-BBN|hydroborat/i, 'alkene_terminal', 'bh3_h2o2', 'Hydroboration, then H2O2'],
    [/Hg\(OAc\)2|oxymercur|HgSO4/i, 'alkene_terminal', 'hg_h2o', 'Oxymercuration'],
    [/mCPBA|peroxy ?acid/i, 'alkene_terminal', 'mcpba', 'mCPBA epoxidation'],
    [/OsO4/i, 'alkene_terminal', 'oso4', 'OsO4 dihydroxylation'],
    [/\bO3\b|ozonoly/i, 'alkene_terminal', 'o3_zn', 'Ozonolysis'],
    [/lindlar/i, 'alkyne_terminal', 'h2_lindlar', 'Lindlar hydrogenation'],
    [/Na\s*(\/|in|,)\s*NH3|dissolving metal/i, 'alkyne_terminal', 'na_nh3', 'Na in NH3'],
    [/Br2.*H2O|halohydrin/i, 'alkene_terminal', 'br2_h2o', 'Halohydrin'],
    [/HNO3/i, 'benzene', 'hno3_h2so4', 'Nitration of benzene'],
    [/SO3/i, 'benzene', 'so3_h2so4', 'Sulfonation of benzene'],
    [/AlCl3.*(acyl|RCOCl|chloride)|acylation/i, 'benzene', 'rcocl_alcl3', 'Friedel-Crafts acylation'],
    [/AlCl3|alkylation/i, 'benzene', 'rx_alcl3', 'Friedel-Crafts alkylation'],
    [/FeBr3|FeCl3/i, 'benzene', 'x2_fe', 'Halogenation of benzene'],
    [/wittig|ylide/i, 'aldehyde', 'wittig_ch2', 'Wittig'],
    [/DIBAL/i, 'ester', 'dibal_cold', 'DIBAL-H, cold'],
    [/NaBH4/i, 'aldehyde', 'nabh4', 'NaBH4 reduction'],
    [/LiAlH4|LAH/i, 'aldehyde', 'lah', 'LiAlH4 reduction'],
    [/MgBr|MgCl|grignard/i, 'aldehyde', 'rmgbr_h', 'Grignard addition'],
    [/acetal|TsOH|equivalents? of (m|)ethanol/i, 'aldehyde', '2_roh_h', 'Acetal formation'],
    [/PCC/i, 'alcohol_primary', 'pcc', 'PCC oxidation'],
    [/jones|chromic|CrO3|Na2Cr2O7/i, 'alcohol_secondary', 'jones', 'Jones oxidation'],
    [/SOCl2/i, 'alcohol_primary', 'socl2', 'SOCl2'],
    [/PBr3/i, 'alcohol_primary', 'pbr3', 'PBr3'],
    [/t-?BuOK|tert-butoxide/i, 'halide_tertiary', 'tbuok', 'Bulky base, E2'],
    [/H2\s*(\/|over|with|,)\s*(Pd|Pt|Ni)\b/, 'alkene_terminal', 'h2_pt', 'Hydrogenation'],
    [/HBr|HCl/, 'alkene_terminal', 'hbr', 'HBr, Markovnikov'],
    [/Br2|Cl2/, 'alkene_terminal', 'br2', 'Br2 addition']
  ];
  function spoke(q) {
    if (!q || section(q.section) !== 'ochem' || !q.stem) return null;
    for (var i = 0; i < SPOKES.length; i++) if (SPOKES[i][0].test(q.stem)) {
      var r = SPOKES[i];
      return { id: 'oc-wheels', title: 'Reaction wheels', url: OC + '?game=wheel&wheel=' + r[1] + '&spoke=' + r[2], label: r[3] + ' on its wheel', wheel: r[1], spoke: r[2] };
    }
    return null;
  }
  function match(q) {
    if (!q) return null;
    var sec = section(q.section); if (!sec) return null;
    var sp = spoke(q); if (sp) return sp;
    var text = ' ' + [q.topic, q.topicName, q.concept, q.skill].map(norm).filter(Boolean).join(' | ') + ' ';
    if (text.trim() === '') return null;
    var best = null, top = 0;
    TOOLS.forEach(function (t) {
      if (t.section !== sec) return;
      var s = score(text, t.topics); if (s && t.board) s += 60;   // a whiteboard beats a hub deep link on the same phrase
      if (s > top) { top = s; best = { id: t.id, title: t.title, url: t.path, label: t.title }; if (t.board) best.board = t.board; }
      (t.links || []).forEach(function (l) {
        var d = score(text, l.topics); if (d) d += 50;   // a deep link beats a one-word tool topic
        if (d > top) { top = d; best = { id: t.id, title: t.title, url: l.path, label: l.label }; }
      });
    });
    return best;
  }
  /* The "See it" link for a miss, as an element; null when nothing matches. Opens from a miss,
     so the tool page can offer the way back (?from=review|repair is read by ace-cream-wrap.js). */
  function withFrom(url, from) {
    if (!from) return url;
    var h = url.indexOf('#'), base = h < 0 ? url : url.slice(0, h), hash = h < 0 ? '' : url.slice(h);
    return base + (base.indexOf('?') < 0 ? '?' : '&') + 'from=' + encodeURIComponent(from) + hash;
  }

  /* The "See it" chip. One look everywhere (gold pill, 44px tap target), on right and wrong
     answers alike. A whiteboard opens in a bottom sheet over the page; anything else is a link. */
  var EYE = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  var CSS = '.see-chip{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 16px;margin:8px 0 0;border-radius:999px;border:0;background:#C9A84C;color:#0d2018 !important;font:700 15px/1.2 "DM Sans",system-ui,-apple-system,sans-serif;text-decoration:none !important;cursor:pointer;max-width:100%;text-align:left;box-sizing:border-box}' +
    '.see-chip:hover{background:#d6b862}.see-chip svg{flex:none;width:18px;height:18px}.see-chip span{min-width:0;overflow-wrap:anywhere}.see-chip{padding-block:8px;border-radius:22px}' +
    '.see-chip:focus-visible{outline:3px solid #1B3A2D;outline-offset:2px}';
  function esc(x) { return String(x == null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function style() {
    if (typeof document === 'undefined' || document.getElementById('see-chip-css')) return;
    var st = document.createElement('style'); st.id = 'see-chip-css'; st.textContent = CSS; (document.head || document.documentElement).appendChild(st);
  }
  function chipHTML(q, from) {
    var m = match(q); if (!m) return '';
    style();
    return '<a class="see-chip" href="' + esc(withFrom(m.url, from)) + '"' + (m.board ? ' data-see-board="' + esc(m.board) + '"' : '') +
      ' data-see-from="' + esc(from || '') + '" data-see-id="' + esc(m.id) + '">' + EYE + '<span>See it: ' + esc(m.label) + '</span></a>';
  }
  function chip(q, from) {
    var h = chipHTML(q, from); if (!h) return null;
    var d = document.createElement('div'); d.innerHTML = h; return d.firstChild;
  }
  /* Open a board in the bottom sheet, loading the engine on first use. Falls back to the full page. */
  function openBoard(id, from, href) {
    var go = function () { if (href) root.location.href = href; };
    var run = function () { try { root.AceBoard.ready(function () { if (!root.AceBoard.get(id)) return go(); root.AceBoard.open(id, { from: from }); }); } catch (e) { go(); } };
    if (root.AceBoard) return run();
    var sc = document.createElement('script'); sc.src = '/shared/ace-board.js?v=5'; sc.onload = run; sc.onerror = go; document.head.appendChild(sc);
  }
  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target && e.target.closest ? e.target.closest('[data-see-board]') : null; if (!a) return;
      e.preventDefault();
      try { if (root.AceRecord && root.AceRecord.event) root.AceRecord.event('see-chip', { board: a.getAttribute('data-see-board'), from: a.getAttribute('data-see-from') || '' }); } catch (x) {}
      openBoard(a.getAttribute('data-see-board'), a.getAttribute('data-see-from') || '', a.getAttribute('href'));
    });
  }

  var api = { tools: TOOLS, sections: SECTIONS, match: match, spoke: spoke, SPOKES: SPOKES, section: section, norm: norm, withFrom: withFrom, chip: chip, chipHTML: chipHTML, openBoard: openBoard };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.AceVisuals = api;
})(typeof window !== 'undefined' ? window : null);
