import { canonSources as sourceRecords } from './canon/manifest.mjs';

// Selected DAT Canon teaching is integrated into the existing guide for each
// objective. Original bank items remain unchanged and are never lesson examples.
// This scoped internal review is not external SME certification.
const byId = Object.fromEntries(sourceRecords.map(s => [s.id, s]));
const mappings = {
  'bio-cell-organelles': ['bio-cargo'],
  'gc-equilibrium-q-k': ['gc-equilibrium'],
  'oc-substitution-elimination': ['oc-sn2-conditions', 'oc-sn2-path'],
  'pat-hole-punching': ['pat.one-fold', 'pat.two-folds'],
  'qr-work-rates': ['qr.rates'],
  'rc-passage-map': ['rc.purpose', 'rc.evidence']
};
const limits = {
  'bio-cell-organelles': 'Conventional secretion of nuclear-encoded proteins, plus cytosolic retention. Information in the nucleus is distinguished from protein location; insulin precursor processing is explicit.',
  'gc-equilibrium-q-k': 'Ideal concentration model for A + B <=> 2 C at fixed temperature and volume. Q/K direction and one ICE example; no claim that all liquids are omitted from equilibrium expressions.',
  'oc-substitution-elimination': 'Only ordinary saturated-carbon SN2 substrate, solvent, concerted mechanism, rate and inversion principles. No broad SN1/E1/E2 decision engine is adopted.',
  'pat-hole-punching': 'Grid method, reverse-order unfolding and one or two perpendicular full half-folds. Separate 6-by-6 teaching examples preserve reserved 4-by-4 assessment cases. Quarter and diagonal folds are outside this adaptation.',
  'qr-work-rates': 'Constant independent inflow and outflow in matching units, with the amount remaining to a stated target. Fraction and reciprocal prerequisites remain available.',
  'rc-passage-map': 'A short passage map and evidence-location strategy. Flags are navigation aids, not proof or an exclusive recommended exam strategy. No full-length RC validation.'
};
export const canonSources = sourceRecords.map(s => ({
  ...s, sourceRepository: 'ace-system', sourceSchema: 'ace-visual-canon/1',
  sourceFile: `data/canon/${s.id}.json`, sourceInspectedOn: '2026-11-03',
  sourceLocallyModified: true, sourceVoiceReview: 'pending-in-source',
  objectiveIds: mappings[s.id], adaptationVersion: 2,
  reviewStatus: 'internal-reviewed', reviewScope: limits[s.id],
  externalSMEReview: false, importsSourceRuntime: false, importsSourceAssessments: false,
  modelScope: 'Any interactive model must declare its own narrower coverage; the full Canon hero is not imported.'
}));

const term = (term, meaning) => ({ term, meaning });
function attach(base, sourceId, fields) {
  const source = canonSources.find(s => s.id === sourceId);
  return {
    ...base, ...fields, version: base.version + 2,
    // Keep the fully reviewed original teaching case available when the Canon
    // worked example replaces it; it is instruction, never a reserved question.
    supportingExample: fields.workedExample ? base.workedExample : undefined,
    reviewStatus: 'internal-reviewed', originalReviewStatus: base.reviewStatus,
    canonIntegration: 'integrated-selected-scope',
    canon: { id: source.id, title: source.title, version: source.version,
      sourceSha256: source.sourceSha256, sourceRelativePath: source.sourceRelativePath,
      excerptPath: source.sourceFile, adaptationVersion: source.adaptationVersion,
      reviewStatus: source.reviewStatus, reviewScope: source.reviewScope },
    sourceUrls: [...new Set([...(base.sourceUrls || []), ...(fields.sourceUrls || [])])]
  };
}

export function integrateCanon(original) {
  const guides = Object.fromEntries(Object.entries(original).map(([id,g]) => [id, {
    ...g, reviewStatus:'internal-reviewed', originalReviewStatus:g.reviewStatus,
    canonIntegration:'pending', canon:null
  }]));
  const set = (id, source, fields) => { guides[id] = attach(original[id], source, fields); };
  const membraneTerms=[term('Membrane','A thin boundary that separates one compartment from another. Its permeability determines which substances can cross.'),term('Concentration','The amount of a substance in a stated volume. A concentration comparison uses matching units.'),term('Net movement','The difference between movement in the two directions. Particles may cross both ways even when net movement is zero.'),term('mOsm','Milliosmoles: a measure based on the number of dissolved particles. In this lesson compare values stated per liter; tonicity depends on particles that effectively cannot cross the membrane under the stated conditions.')];
  for(const id of ['bio-diffusion','bio-transport','bio-osmosis','bio-tonicity','bio-animal','bio-plant']){const g=guides[id],have=new Set(g.terms.map(t=>t.term.toLowerCase()));g.terms=[...g.terms,...membraneTerms.filter(t=>!have.has(t.term.toLowerCase()))];g.version+=1;}

  set('bio-cargo', 'bio-cell-organelles', {
    core: 'Ask where the protein ends up. For a conventionally secreted protein, the nucleus supplies instructions: a gene is copied into mRNA, which leaves through nuclear pores. A ribosome outside the nucleus reads that message and builds the protein chain. Targeting information directs the growing chain into rough ER. Vesicles carry cargo to Golgi for processing and sorting, then secretory vesicles deliver it to the cell membrane for release. A soluble enzyme that stays in cytosol does not need to enter ER or Golgi. Free and ER-associated ribosomes belong to a common pool; they are not permanently different kinds of protein builders.',
    terms: [...original['bio-cargo'].terms,
      term('Pancreatic beta cell', 'A cell in the pancreas that makes and releases the hormone insulin.'),
      term('Gene and transcription', 'A gene is a stretch of DNA carrying information. Transcription copies information from DNA into RNA.'),
      term('mRNA', 'Messenger RNA: an RNA message that a ribosome reads when building a protein.'),
      term('Precursor', 'An earlier form that is processed into the final product. The first insulin-related protein chain is not yet mature insulin.')],
    assumptions: ['Follow nuclear-encoded proteins in a nucleated animal cell.', 'The secreted protein uses conventional ER/Golgi trafficking; the comparison enzyme stays soluble in cytosol without an organelle-targeting signal.', 'Membranes remain intact, so soluble cargo inside ER or vesicles does not spill into cytosol.', 'Insulin is made as a precursor and processed before release. This example follows compartments, not individual processing enzymes.'],
    workedExample: {
      prompt: 'A pancreatic beta cell makes insulin for release into the blood. Trace the instructions first, then the protein precursor, and identify the final release step.',
      steps: ['Destination first: insulin will leave the cell.', 'In the nucleus, information from the insulin gene is copied into mRNA. The mRNA exits through nuclear pores; the protein does not begin its trip inside the nucleus.', 'A ribosome builds the insulin precursor and directs its growing chain into rough ER.', 'Cargo travels from ER to Golgi and into secretory granules. Processing produces mature insulin before release.', 'When secretion is triggered, a granule fuses with the plasma membrane and releases insulin outside: exocytosis.', 'A cytosolic enzyme is also built by a ribosome, but it does not enter the ER/Golgi shipping route.'],
      answer: 'Instructions: nuclear DNA -> mRNA -> ribosome. Protein route: rough ER -> Golgi -> secretory granule -> exocytosis.'
    },
    commonMistake: 'The nucleus supplies information; the protein does not travel through it on its way to the ER. Golgi sorts and processes cargo but does not translate mRNA.',
    nextAction: 'Name the destination, then trace information and protein movement separately.',
    sourceUrls: ['https://www.ncbi.nlm.nih.gov/books/NBK26841/', 'https://pubmed.ncbi.nlm.nih.gov/7309796/', 'https://pubmed.ncbi.nlm.nih.gov/4729519/', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2114904/']
  });

  set('gc-equilibrium', 'gc-equilibrium-q-k', {
    core: 'Use the Canon sequence: Q first, then ICE. Q is the reaction ratio using the mixture now; K is its equilibrium value at a specified temperature. For A + B <=> 2 C, Q = [C]^2 / ([A][B]). In this model Q < K favors net forward change, Q > K net reverse change, and Q = K dynamic equilibrium. At equilibrium forward and reverse reactions continue at equal rates. ICE means Initial, Change, Equilibrium; its changes follow the balanced coefficients.',
    terms: [...original['gc-equilibrium'].terms,
      term('Square brackets', '[A] means the concentration of A, measured here in moles per liter (M).'),
      term('ICE table', 'A table recording starting concentrations, their linked changes, and the resulting equilibrium concentrations.'),
      term('Square and square root', 'Squaring multiplies a number by itself: 2 squared is 4. A positive square root reverses that operation for a positive quantity: the positive square root of 4 is 2.'),
      term('Coefficient', 'A number in a balanced reaction. The 2 before C means two C form for each A and B used.'),
      term('x in an ICE table', 'The concentration change assigned to one unit of reaction progress; other changes are multiplied by their coefficients.')],
    assumptions: ['Ideal dilute concentration model, fixed temperature and volume, closed mixture, and only A + B <=> 2 C.', 'All three concentrations are positive and the reaction can approach equilibrium.', 'For a specified reaction and standard states, K depends on temperature; adding a species changes Q rather than K.', 'Pure solids and pure liquids have constant activity and are omitted in the usual expression. Dissolved species are included; not every substance in a liquid mixture is omitted.'],
    workedExample: {
      prompt: 'For A + B <=> 2 C, K = 4.0. Initially [A] = [B] = [C] = 1.0 M. What is [C] at equilibrium?',
      steps: ['Calculate Q now: 1.0^2 / (1.0 x 1.0) = 1.0. Since 1.0 < 4.0, predict net formation of C.', 'Use the reaction coefficients: [A] = 1.0 - x, [B] = 1.0 - x, and [C] = 1.0 + 2x.', 'At equilibrium, (1.0 + 2x)^2 / (1.0 - x)^2 = 4.0. The ratio is positive because concentrations are positive. Its square is 4, so the ratio is the positive square root, 2: (1.0 + 2x)/(1.0 - x) = 2.0.', 'Multiply both sides by the positive denominator (1.0 - x): 1.0 + 2x = 2.0(1.0 - x) = 2.0 - 2x.', 'Add 2x to both sides, then subtract 1.0 from both sides: 4x = 1.0. Divide both sides by 4: x = 0.25 M.', 'Then [A] = [B] = 0.75 M and [C] = 1.5 M. Check: 1.5^2 / (0.75 x 0.75) = 4.0.'],
      answer: '[C] = 1.5 M at equilibrium; forward and reverse reaction rates are equal, not zero.'
    },
    commonMistake: 'Do not replace the +2x change for C with +x. Equal forward and reverse rates do not require equal concentrations.',
    nextAction: 'Write the reaction ratio, compare Q with K, then apply the balanced coefficients to each change.',
    sourceUrls: ['https://openstax.org/books/chemistry-2e/pages/13-2-equilibrium-constants']
  });

  set('oc-sn2-conditions', 'oc-substitution-elimination', {
    terms: [...original['oc-sn2-conditions'].terms, term('SN2', 'Bimolecular nucleophilic substitution: the electron-pair donor joins while the leaving group departs in one reaction event.'), term('Secondary carbon', 'The carbon of interest is directly bonded to two other carbon atoms. Count neighboring carbons, not all atoms.'), term('Saturated carbon', 'Here, a tetrahedral carbon joined to its neighbors by single bonds.'), term('Solvent', 'The surrounding liquid that dissolves the reacting substances.'), term('NaCN and CN−', 'NaCN is sodium cyanide. In this example its cyanide ion, CN−, is the electron-pair donor; sodium is the counterion.'), term('DMSO', 'Dimethyl sulfoxide, the polar aprotic solvent named in this example.'), term('R/S notation', 'A naming label for a three-dimensional arrangement. Assigning it requires priority rules; it is not a plus/minus electric charge.')],
    core: 'Carbon first, then the reagent. Find the carbon bonded to the leaving group and ask how crowded it is. Ordinary methyl and primary substrates are less hindered for SN2; tertiary saturated carbons block this pathway. Then consider nucleophile, leaving group and solvent together. A good nucleophile in a polar aprotic solvent can support SN2, but a solvent name alone never decides the mechanism.',
    assumptions: ['Ordinary saturated alkyl substrates, a suitable leaving group, and the stated reagent and solvent.', 'This guide reviews the SN2 portion of the Canon. It does not adopt a universal decision table for SN1, E1 or E2.', 'Secondary substrates can have competing pathways; the specific cyanide/DMSO example supports substitution under the stated teaching conditions.'],
    workedExample: {
      prompt: 'The Canon case uses (R)-2-bromobutane with NaCN in DMSO. What features support the proposed SN2 pathway?',
      steps: ['The carbon bonded to Br is secondary. This does not automatically rule out SN2, but crowding must be considered.', 'CN- supplies an electron pair and is a good nucleophile with relatively weak basicity in this comparison.', 'DMSO is polar aprotic and does not hydrogen-bond to this anion as a protic solvent would.', 'Consider these conditions together, with Br as the leaving group: SN2 is the proposed pathway.'],
      answer: 'The substrate, cyanide nucleophile, bromide leaving group and DMSO solvent jointly support the stated SN2 case.'
    },
    commonMistake: 'DMSO does not make an ordinary tertiary alkyl substrate undergo SN2. Do not generalize this selected case into an answer for every substrate/reagent combination.',
    nextAction: 'Locate the leaving-group carbon before weighing the reagent and solvent.',
    sourceUrls: ['https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction']
  });
  set('oc-sn2-path', 'oc-substitution-elimination', {
    terms: [...original['oc-sn2-path'].terms, term('Concerted', 'Bond formation and bond breaking occur in the same reaction event, with no intermediate between them.'), term('Backside attack', 'The electron-pair donor approaches the reacting carbon from the side opposite the departing group.'), term('Inversion', 'The three-dimensional arrangement turns to the opposite orientation at the reacting center; naming labels still need a new priority check.')],
    core: 'SN2 joins bond formation and bond breaking in one concerted event. The nucleophile attacks opposite the leaving group, inverting geometry at the reacting center. The elementary rate law includes both reactant concentrations: rate = k[substrate][nucleophile]. Inversion is a geometric result; assign product priorities before deciding whether an R/S label changes.',
    assumptions: ['A single SN2 pathway at a saturated tetrahedral center, with fixed temperature and other conditions.', 'In the selected cyanide case, the carbon of CN bonds to the substrate; product priorities must be evaluated again.'],
    workedExample: {
      prompt: 'Continue the Canon case: (R)-2-bromobutane reacts by SN2 with CN-. State the product, the geometric change and the effect of doubling both reactant concentrations.',
      steps: ['CN replaces Br through backside attack in the same event as C-Br bond breaking.', 'The reacting center inverts. The product is 2-methylbutanenitrile.', 'For this particular product, the cyano carbon outranks ethyl, which outranks methyl, with H last. Reassigning these priorities gives (S). Inversion need not always change an R/S label in other reactions.', 'The rate is multiplied by 2 for substrate and 2 for nucleophile: 2 x 2 = 4.'],
      answer: '(S)-2-methylbutanenitrile in this case, with inversion; doubling both concentrations makes the stated SN2 rate four times as large.'
    },
    commonMistake: 'Do not draw a carbocation intermediate for the one-step SN2 event or memorize inversion as an automatic R-to-S rule.',
    nextAction: 'Track the electron pair, the leaving bond, the three-dimensional inversion and the concentrations separately.',
    sourceUrls: ['https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction', 'https://openstax.org/books/organic-chemistry/pages/5-5-sequence-rules-for-specifying-configuration']
  });

  for (const id of ['pat.one-fold', 'pat.two-folds']) set(id, 'pat-hole-punching', {
    core: 'Use the Canon Grid Method: mark the punch on the folded packet, identify which piece crossed which crease, then undo the last fold first. Reflect only the holes in the paper layers covered by that moving piece. The grid records positions so you can work one crease at a time. In these full half-fold examples, every punched layer is represented; a partial flap would require a different coverage check.',
    assumptions: [...original[id].assumptions, 'For the worked grid, row 1 is at the top and column 1 is at the left; row numbers increase downward and column numbers increase to the right. The stated folds move the left half rightward, then the bottom half upward.','The lesson keeps a separate six-by-six worked example; the practice and check questions have their own diagrams.', 'The adapted interactive scope is one or two perpendicular full half-folds, not the Canon quarter-flap or diagonal extensions.'],
    nextAction: 'Say which piece crossed which line, reverse the fold order, and reflect only the covered hole positions.'
  });

  set('qr.rates', 'qr-work-rates', {
    core: 'Rates add. Times do not. Put every flow into the same amount-per-time unit, add contributions that help and subtract those that oppose. Then find the amount still needed and divide it by the net rate. This is the Canon tank method: mark the amount now, mark the target, and track the gap between them. For one whole job taking T time units, 1/T is the rate in jobs per time unit. Fractions and their units still need to agree.',
    terms: [...original['qr.rates'].terms, term('Net flow', 'The overall inflow after subtracting outflow, using the same units.'), term('Percent', 'A quantity per hundred. Eighty percent means 80/100 = 0.80 of the whole.')],
    assumptions: ['The hose and leak maintain constant independent rates throughout this interval.', 'The tank starts at 12 gallons; both flows operate together and the target is below its 60-gallon capacity.', 'For a higher target, a zero or negative net inflow cannot reach it under these assumptions.'],
    workedExample: {
      prompt: 'The Canon tank holds 12 gallons out of a 60-gallon capacity. A hose adds 7 gallons per minute and a leak removes 3 gallons per minute. How long until it is 80% full?',
      steps: ['Convert the target: 80% = 0.80, and 0.80 x 60 gallons = 48 gallons.', 'Find the gap still to fill: 48 - 12 = 36 gallons.', 'Combine signed rates: +7 - 3 = +4 gallons per minute.', 'Divide amount by rate: 36 gallons / (4 gallons per minute) = 9 minutes.', 'Check the state at 9 minutes: 12 + 9 x 4 = 48 gallons. The units and target agree.'],
      answer: '9 minutes. The tank reaches 48 gallons, which is 80% of 60 gallons.'
    },
    commonMistake: 'Do not add a drain to an inflow or fill the whole capacity when the target is only partway full. Use the gap from the current amount.',
    nextAction: 'Write current amount, target amount and each signed rate before doing arithmetic.'
  });

  const rcCase = {
    prompt: 'The Canon mini-passage describes desert ants. Its paragraphs introduce the homeward trip, describe direction cues, compare leg-length conditions, then connect distance and direction. In the comparison, ants on stilts passed the nest; ants with trimmed legs stopped short. Locate evidence for what happened to ants on stilts.',
    steps: ['Map the paragraph jobs instead of trying to memorize every line.', 'Use the distinctive word "stilts" to locate the comparison paragraph.', 'Read the whole comparison and its nearby context. Separate the stilts condition from the trimmed-leg condition.', 'Restate the evidence: the stilts group passed the nest. Do not borrow the adjacent result for the other group.'],
    answer: 'The passage reports that the stilts group overshot the nest. This is evidence from the supplied text, not an inference from outside ant knowledge.'
  };
  set('rc.purpose', 'rc-passage-map', {
    core: 'Read for meaning and make a short map of each paragraph: what topic does it discuss, and what job does it do? The Canon flags provide locations to return to, such as a comparison or definition. Connect those paragraph jobs to identify the whole passage purpose. A collection of highlighted facts alone does not establish the author\'s main point.',
    assumptions: ['A shortened teaching passage illustrates a navigation strategy, not a complete DAT-length passage.', 'Topic words and paragraph roles are aids; purpose must still fit the whole passage and its limits.'],
    workedExample: {
      prompt: 'The Canon ant mini-passage introduces a homeward-navigation problem, explains direction cues, reports a leg-length comparison, and connects direction with distance. What main purpose fits those paragraph jobs?',
      steps: ['The opening frames the navigation problem.', 'The next sections describe cues and a comparison relevant to that problem.', 'The ending connects the two kinds of information.', 'Choose a purpose covering that explanation, not a detail such as the date or a claim that all animal navigation works the same way.'],
      answer: 'To explain how the passage\'s direction and distance information contribute to the ants\' homeward navigation.'
    },
    commonMistake: 'A passage about how these ants navigate does not establish how all animals navigate. A detail about the leg-length comparison is narrower than the whole passage purpose.',
    nextAction: 'Write a few words for each paragraph\'s topic and job, then connect them into one supported purpose.'
  });
  set('rc.evidence', 'rc-passage-map', {
    core: 'Use a passage map to get back to evidence. A distinctive question word can guide you to a relevant paragraph, but then read the statement and its context. Check which condition, group and qualification it belongs to before selecting an answer. The Canon\'s short flags help you find text; the text itself, not a matching keyword, must support the answer.',
    assumptions: ['This worked case summarizes the supplied Canon mini-passage; answer only from that passage.', 'Detail lookup is one skill. Other questions require multiple sentences or paragraphs, so the nearest keyword alone is insufficient.'],
    workedExample: rcCase,
    commonMistake: 'Do not transfer a nearby group\'s result to the group asked about. Finding a keyword is a navigation step, not proof.',
    nextAction: 'Locate, reread the relevant context, identify the tested group or condition, and restate only what the passage supports.'
  });
  return guides;
}
