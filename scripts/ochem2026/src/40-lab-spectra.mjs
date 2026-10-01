// Lab techniques, 13C NMR, and combined spectra for the 2026 organic set.
// No mass spectrometry: it is in neither the old nor the 2026 DAT organic spec.
export default [
  /* ------------------------------------------------------------------ */
  /* Lab techniques                                                       */
  /* ------------------------------------------------------------------ */
  {
    id: 'lab-01', type: 'lab', roots: ['l1-groups'], difficulty: 1,
    stem: 'A student spots five benzene derivatives on a silica gel TLC plate and develops it in 4:1 hexane and ethyl acetate. Which compound has the highest Rf value?',
    choices: [{ text: 'toluene' }, { text: 'benzoic acid' }, { text: 'benzyl alcohol' }, { text: 'benzaldehyde' }, { text: 'phenol' }],
    correct: 0,
    coach: 'Silica is polar and sticky. The least polar compound gets held the least, so it runs the farthest up the plate.',
    why: 'Silica gel is covered in polar O-H groups, so polar compounds cling to it and barely move, while nonpolar compounds ride the solvent up. Toluene has no polar group at all, so it travels farthest and has the highest Rf. Benzoic acid, the strongest hydrogen bonder here, stays nearest the baseline.'
  },
  {
    id: 'lab-02', type: 'lab', roots: ['l1-groups'], difficulty: 1,
    stem: 'Five eight-carbon compounds are run on the same silica gel TLC plate in a moderately polar solvent. Which one shows the lowest Rf value?',
    choices: [{ text: 'octanoic acid' }, { text: 'octane' }, { text: '2-octanone' }, { text: '1-chlorooctane' }, { text: '1-octanol' }],
    correct: 0,
    coach: 'Lowest Rf means stuck to the silica the hardest, and the carboxylic acid is the best hydrogen bonder on the list.',
    why: 'A carboxylic acid both donates and accepts hydrogen bonds through two oxygens, so it grips the polar silica harder than the alcohol, the ketone, the alkyl chloride or the alkane. The tighter the grip, the shorter the trip, so octanoic acid has the lowest Rf. 1-Octanol is close, but the O-H of the acid is more polarized and its C=O adds a second strong hydrogen-bond acceptor, so the acid holds on tighter.'
  },
  {
    id: 'lab-03', type: 'lab', roots: ['l1-groups'], difficulty: 2,
    stem: 'A TLC plate run in pure hexane leaves every spot near the baseline. The student reruns it in 1:1 hexane and ethyl acetate. What happens to the spots?',
    choices: [
      { text: 'Every Rf value goes up' },
      { text: 'Every Rf goes down' },
      { text: 'Every Rf stays the same' },
      { text: 'Polar spots rise, nonpolar spots fall' },
      { text: 'The spot order reverses' }
    ],
    correct: 0,
    coach: 'A more polar solvent competes with the compounds for the silica and pulls everything off it faster, so every spot climbs.',
    why: 'Ethyl acetate is far more polar than hexane, so it competes for the polar sites on the silica and carries every compound farther up the plate. All Rf values rise. The order usually stays the same, because the least polar compound is still held least by the silica.'
  },
  {
    id: 'lab-04', type: 'lab', roots: ['l1-groups'], difficulty: 2,
    stem: 'A mixture of nonane, 2-nonanone and 1-nonanol is loaded on a silica gel column and eluted with hexane, then with increasing amounts of ethyl acetate. In what order do the compounds come off the column?',
    choices: [
      { text: 'nonane, 2-nonanone, 1-nonanol' },
      { text: '1-nonanol, 2-nonanone, nonane' },
      { text: '2-nonanone, nonane, 1-nonanol' },
      { text: 'nonane, 1-nonanol, 2-nonanone' },
      { text: 'all three together, since they have the same carbon count' }
    ],
    correct: 0,
    coach: 'On a polar column the least polar compound leaves first; rank them hydrocarbon, then ketone, then alcohol.',
    why: 'Column chromatography on silica works like a TLC plate turned on its side: the stationary phase is polar, so the least polar compound spends the most time in the moving solvent and elutes first. Nonane has no polar group, the ketone carbonyl only accepts hydrogen bonds, and the alcohol both donates and accepts, so the alcohol comes off last.'
  },
  {
    id: 'lab-05', type: 'lab', roots: ['l2-acidity'], difficulty: 2,
    stem: 'A diethyl ether solution contains benzoic acid, phenol and naphthalene. It is shaken with saturated aqueous sodium bicarbonate. What ends up in the aqueous layer?',
    choices: [
      { text: 'sodium benzoate only' },
      { text: 'sodium benzoate and sodium phenoxide' },
      { text: 'sodium phenoxide only' },
      { text: 'dissolved naphthalene' },
      { text: 'nothing, bicarbonate is too weak' }
    ],
    correct: 0,
    coach: 'Bicarbonate only deprotonates acids stronger than carbonic acid: the carboxylic acid at pKa about 4 yes, phenol at about 10 no.',
    why: 'Bicarbonate is a weak base; its conjugate acid, carbonic acid, has a pKa near 6.4. Benzoic acid (pKa about 4.2) is the stronger acid, so it is deprotonated to sodium benzoate, an ionic salt that moves into the water. Phenol (pKa about 10) is too weak an acid to be pulled over by bicarbonate, and naphthalene has no acidic proton at all, so both stay in the ether.'
  },
  {
    id: 'lab-06', type: 'lab', roots: ['l2-acidity'], difficulty: 2,
    stem: 'After a bicarbonate wash has removed a carboxylic acid, the ether layer still holds phenol and naphthalene. Which aqueous wash pulls the phenol into the water and leaves the naphthalene in the ether?',
    choices: [{ text: '1 M aqueous NaOH' }, { text: 'another saturated NaHCO3 wash' }, { text: '1 M aqueous HCl' }, { text: 'saturated NaCl (brine)' }, { text: 'plain distilled water' }],
    correct: 0,
    coach: 'Phenol (pKa about 10) needs a base whose conjugate acid is weaker: hydroxide (water, pKa about 15.7) works, bicarbonate (carbonic acid, pKa about 6.4) does not.',
    why: 'Phenol has a pKa near 10. Hydroxide is the conjugate base of water (pKa about 15.7), so the equilibrium lies far toward sodium phenoxide, a salt that dissolves in water. Bicarbonate already failed to deprotonate it, acid only protonates bases, and brine or water alone leave a neutral phenol mostly in the ether.'
  },
  {
    id: 'lab-07', type: 'lab', roots: ['l2-acidity'], difficulty: 2,
    stem: 'Aniline and toluene are dissolved in diethyl ether, and the solution is washed with 1 M HCl. The aqueous layer is set aside. How is the aniline recovered from that aqueous layer?',
    choices: [
      { text: 'Add NaOH until basic, then extract with ether' },
      { text: 'Add more HCl, then extract with ether' },
      { text: 'Evaporate the water; the residue is pure aniline' },
      { text: 'Add NaHCO3 until it stops bubbling, then filter off solid aniline hydrochloride' },
      { text: 'Extract the acidic layer directly with ether' }
    ],
    correct: 0,
    coach: 'Acid turned the amine into a water-loving salt; base turns it back into the neutral amine, which then goes back into ether.',
    why: 'HCl protonates aniline to anilinium chloride, an ionic salt that moves into the water while toluene stays in the ether. To get the amine back you remove that extra proton with a base such as NaOH; neutral aniline is no longer water friendly, so a fresh ether extraction pulls it out. Evaporating the acidic water would leave the salt, not the free amine.'
  },
  {
    id: 'lab-08', type: 'lab', roots: ['l1-groups'], difficulty: 1,
    stem: 'A product is extracted from water into dichloromethane (density about 1.33 g/mL) in a separatory funnel. Where is the product after the layers separate?',
    choices: [
      { text: 'In the bottom, denser layer' },
      { text: 'In the top layer, organic floats' },
      { text: 'In the top layer, DCM is less polar' },
      { text: 'Split evenly between the layers' },
      { text: 'In the layer that is larger by volume' }
    ],
    correct: 0,
    coach: 'Layers stack by density, not by polarity: dichloromethane is denser than water, so the organic layer is on the bottom.',
    why: 'The denser liquid sinks. Dichloromethane (about 1.33 g/mL) is denser than water (1.00 g/mL), so the organic layer, which holds the product, sits at the bottom. Diethyl ether (about 0.71 g/mL) is the opposite case and floats, which is where the idea that organic layers are always on top comes from.'
  },
  {
    id: 'lab-09', type: 'lab', roots: ['l1-groups'], difficulty: 2,
    stem: 'A student is choosing a solvent to recrystallize a crude solid. Which solvent behavior is ideal?',
    choices: [
      { text: 'The solid dissolves poorly cold but well when hot' },
      { text: 'The solid dissolves well both cold and hot' },
      { text: 'The solid dissolves poorly both cold and hot' },
      { text: 'The solid dissolves well cold but poorly when hot, so heating makes crystals form' },
      { text: 'The solvent boils far above the melting point of the solid' }
    ],
    correct: 0,
    coach: 'Recrystallization runs on a solubility swing: dissolve it hot, then let it fall out as the solution cools.',
    why: 'You dissolve the crude solid in the minimum amount of hot solvent, then cool it; the compound comes out as crystals because it is much less soluble cold, while the small amount of impurity stays dissolved. A solvent that dissolves the compound at every temperature gives no crystals, and one that dissolves it at no temperature cannot purify it. A solvent boiling above the melting point makes the solid melt into an oil instead of dissolving.'
  },
  {
    id: 'lab-10', type: 'lab', roots: ['l1-groups'], difficulty: 2,
    stem: 'During a recrystallization, a student dissolves the crude solid in three times the minimum volume of hot solvent, then cools it in ice. What is the most likely result?',
    choices: [
      { text: 'A low recovery, since product stays dissolved' },
      { text: 'Less pure crystals, since solvent traps impurities' },
      { text: 'A higher recovery, since more solvent dissolves more' },
      { text: 'A lower melting point for the crystals that form' },
      { text: 'No change, since excess solvent all evaporates on cooling' }
    ],
    correct: 0,
    coach: 'Whatever stays dissolved in the cold solvent is lost, and more solvent means more of the product stays dissolved.',
    why: 'Even cold, a solvent holds some of the compound. Using far more solvent than needed means a larger share of the product stays in solution after cooling and is lost with the filtrate, so the recovery drops. Purity is not hurt by extra solvent; if anything impurities stay dissolved even more easily.'
  },
  {
    id: 'lab-11', type: 'lab', roots: ['l1-groups'], difficulty: 2,
    stem: 'A mixture of heptane (bp 98 degrees C) and toluene (bp 111 degrees C) must be separated. Which technique fits best?',
    choices: [
      { text: 'fractional distillation' },
      { text: 'simple distillation' },
      { text: 'extraction with aqueous NaOH' },
      { text: 'recrystallization from cold ethanol' },
      { text: 'vacuum distillation, since both boil near 100 degrees C' }
    ],
    correct: 0,
    coach: 'Boiling points closer than about 25 degrees need a fractionating column; each plate in it acts like another distillation.',
    why: 'Thirteen degrees is too close for one vaporize-condense cycle to give clean fractions, so simple distillation hands back a mixture. A fractionating column provides many cycles in a row and enriches the lower boiling heptane at the top. Neither liquid is acidic, and both are liquids, so extraction and recrystallization do not apply; neither boils high enough to need reduced pressure.'
  },
  {
    id: 'lab-12', type: 'lab', roots: ['l1-groups'], difficulty: 2,
    stem: 'A liquid boils at 290 degrees C at 1 atm but starts to decompose near 220 degrees C. Why does vacuum distillation let a chemist purify it?',
    choices: [
      { text: 'Lower pressure lowers the boiling point, so it distills cooler' },
      { text: 'Lower pressure raises its vapor pressure at every temperature' },
      { text: 'The vacuum removes oxygen, so it no longer decomposes when hot' },
      { text: 'Lower pressure raises the decomposition temperature above 290 degrees C' },
      { text: 'Lower pressure separates the liquid by polarity instead of volatility' }
    ],
    correct: 0,
    coach: 'A liquid boils when its vapor pressure matches the pressure above it; drop the outside pressure and it boils at a lower temperature.',
    why: 'Boiling happens when the vapor pressure of the liquid equals the external pressure. Pumping the pressure down means the liquid reaches that lower target at a much lower temperature, so it distills below the point where it decomposes. Its vapor pressure at a given temperature does not change; only the target it has to reach does.'
  },
  {
    id: 'lab-13', type: 'lab', roots: ['l1-groups'], difficulty: 1,
    stem: 'A pure compound melts sharply at 122 to 123 degrees C. A student\'s crude sample of the same compound is tested. What melting behavior signals that the crude sample is impure?',
    choices: [
      { text: 'It melts lower, over a wider range' },
      { text: 'It melts higher, over a wider range' },
      { text: 'It melts higher, over a narrower range' },
      { text: 'It melts at exactly 122 to 123 degrees C' },
      { text: 'It melts lower, over a narrower range than the pure compound' }
    ],
    correct: 0,
    coach: 'Impurities disrupt the crystal lattice, so the solid falls apart sooner and over a spread of temperatures.',
    why: 'An impurity breaks up the orderly packing of the crystal, so less energy is needed to start melting it, and different regions melt at different temperatures. That gives melting point depression plus broadening. A sharp range at the literature value is the sign of a pure sample.'
  },

  /* ------------------------------------------------------------------ */
  /* 13C NMR                                                              */
  /* ------------------------------------------------------------------ */
  {
    id: 'cn-01', type: 'cnmr', roots: ['l1-skeletal'], difficulty: 1,
    stem: 'How many signals appear in the broadband-decoupled 13C NMR spectrum of 3-pentanone, CH3CH2C(=O)CH2CH3?',
    sub: 'CCC(=O)CC',
    choices: [{ text: '3' }, { text: '2' }, { text: '4' }, { text: '5, one for every carbon' }, { text: '6' }],
    correct: 0, verify: { c13: 'CCC(=O)CC' },
    coach: 'Count kinds of carbon, not carbons: a mirror plane through the carbonyl makes the two ethyl groups identical.',
    why: 'The molecule is symmetric about the carbonyl carbon. The two CH3 carbons are equivalent, the two CH2 carbons are equivalent, and the carbonyl carbon is unique, so there are three signals: about 211, 35 and 8 ppm.'
  },
  {
    id: 'cn-02', type: 'cnmr', roots: ['l1-skeletal'], difficulty: 1,
    stem: 'How many signals appear in the 13C NMR spectrum of para-xylene (1,4-dimethylbenzene)?',
    sub: 'Cc1ccc(C)cc1',
    choices: [{ text: '3' }, { text: '2' }, { text: '4' }, { text: '5' }, { text: '8, one per carbon' }],
    correct: 0, verify: { c13: 'Cc1ccc(C)cc1' },
    coach: 'Find the symmetry first: para substitution makes both methyls, both substituted ring carbons and all four CH ring carbons match.',
    why: 'para-Xylene has two mirror planes. The two methyl carbons are one environment, the two ring carbons that carry methyls are a second, and the four ring CH carbons are a third. Three signals: one near 21 ppm and two in the aromatic region.'
  },
  {
    id: 'cn-03', type: 'cnmr', roots: ['l1-skeletal'], difficulty: 2,
    stem: 'How many signals appear in the 13C NMR spectrum of toluene?',
    sub: 'Cc1ccccc1',
    choices: [{ text: '5' }, { text: '3' }, { text: '4' }, { text: '6' }, { text: '7, one per carbon' }],
    correct: 0, verify: { c13: 'Cc1ccccc1' },
    coach: 'Walk the ring from the substituent: ipso, ortho, meta, para, and the ortho pair and meta pair each count once.',
    why: 'A monosubstituted benzene has a mirror plane through the substituent and the para carbon. That gives four ring environments (ipso, the two ortho, the two meta, para) plus the methyl carbon, so five signals.'
  },
  {
    id: 'cn-04', type: 'cnmr', roots: ['l1-skeletal'], difficulty: 1,
    stem: 'How many signals appear in the 13C NMR spectrum of tert-butyl methyl ether, (CH3)3C-O-CH3?',
    sub: 'COC(C)(C)C',
    choices: [{ text: '3' }, { text: '2' }, { text: '4' }, { text: '5, one per carbon' }, { text: '1' }],
    correct: 0, verify: { c13: 'COC(C)(C)C' },
    coach: 'The three methyls on the tert-butyl carbon are identical; the methyl on oxygen is a different neighborhood.',
    why: 'There is the O-CH3 carbon, the quaternary carbon bonded to oxygen, and the three equivalent methyls of the tert-butyl group. Three signals; the two carbons bonded to oxygen appear near 49 ppm (O-CH3) and 73 ppm (the quaternary C-O) and the tert-butyl methyls near 27 ppm.'
  },
  {
    id: 'cn-05', type: 'cnmr', roots: ['l1-skeletal'], difficulty: 2,
    stem: 'Each choice is an isomer of C6H14. Which one shows exactly two signals in its 13C NMR spectrum?',
    choices: [{ smiles: 'CC(C)C(C)C' }, { smiles: 'CCCCCC' }, { smiles: 'CC(C)CCC' }, { smiles: 'CCC(C)CC' }, { smiles: 'CC(C)(C)CC' }],
    correct: 0, verify: { c13Each: 2, formulaEach: 'C6H14', distinct: true },
    coach: 'Look for the most symmetric skeleton; two signals needs every carbon to be one of only two kinds.',
    why: '2,3-Dimethylbutane is symmetric through its central bond: the four methyls are one environment and the two CH carbons are the other, so two signals. Hexane gives three, 3-methylpentane and 2,2-dimethylbutane give four, and 2-methylpentane gives five.'
  },
  {
    id: 'cn-06', type: 'cnmr', roots: ['l1-skeletal', 'l1-groups'], difficulty: 2,
    stem: 'Each choice is an isomer of C4H8O2. Which one shows exactly three signals in its 13C NMR spectrum?',
    choices: [{ smiles: 'CC(C)C(=O)O' }, { smiles: 'CCOC(C)=O' }, { smiles: 'CCC(=O)OC' }, { smiles: 'CCCC(=O)O' }, { smiles: 'C1COCCO1' }],
    correct: 0, verify: { c13Each: 3, formulaEach: 'C4H8O2', distinct: true },
    coach: 'Two identical methyls on one carbon collapse into one signal; count kinds, not carbons.',
    why: '2-Methylpropanoic acid has two equivalent methyls, one CH and one carboxyl carbon: three signals. Ethyl acetate, methyl propanoate and butanoic acid each have four different carbons, and 1,4-dioxane is so symmetric that all four carbons give a single signal.'
  },
  {
    id: 'cn-07', type: 'cnmr', roots: ['l2-bully'], difficulty: 1,
    stem: 'In the 13C NMR spectrum of ethyl acetate, CH3C(=O)OCH2CH3, which carbon appears farthest downfield?',
    sub: 'CCOC(C)=O',
    choices: [
      { text: 'the C=O carbon of the ester' },
      { text: 'the O-CH2 carbon of the ethyl group' },
      { text: 'the CH3 bonded to the carbonyl' },
      { text: 'the CH3 at the end of the ethyl group' },
      { text: 'all four appear within a few ppm' }
    ],
    correct: 0,
    coach: 'The carbonyl carbon is bonded to two oxygens; the electron bully strips it the most, so it sits highest, near 170 ppm.',
    why: 'A carbonyl carbon is double bonded to oxygen and, in an ester, also single bonded to a second oxygen, so it is badly deshielded and appears near 171 ppm. The O-CH2 carbon is next, near 60 ppm, and the two methyls sit in the alkyl region below 25 ppm.'
  },
  {
    id: 'cn-08', type: 'cnmr', roots: ['l2-bully'], difficulty: 2,
    stem: 'An unknown shows a 13C NMR signal at 210 ppm. Which carbon best accounts for it?',
    choices: [
      { text: 'a ketone C=O' },
      { text: 'an ester C=O' },
      { text: 'an aromatic C-H carbon' },
      { text: 'a nitrile carbon' },
      { text: 'a carbon single bonded to an alcohol oxygen' }
    ],
    correct: 0,
    coach: 'Above 200 ppm is ketone and aldehyde country; esters, acids and amides sit lower, around 160 to 185.',
    why: 'Ketone carbonyl carbons appear around 205 to 220 ppm. In an ester the second oxygen donates electron density into the carbonyl by resonance, which pulls its signal back to about 165 to 175 ppm. Aromatic carbons sit near 110 to 150, nitriles near 115 to 120, and C-O single bond carbons near 50 to 80.'
  },
  {
    id: 'cn-09', type: 'cnmr', roots: ['l2-bully'], difficulty: 1,
    stem: 'A 13C NMR signal appears at 63 ppm. Which kind of carbon is the best fit?',
    choices: [
      { text: 'a carbon single bonded to oxygen' },
      { text: 'an alkene carbon' },
      { text: 'a ketone carbonyl carbon' },
      { text: 'a CH3 carbon in a plain alkane chain' },
      { text: 'a nitrile carbon' }
    ],
    correct: 0,
    coach: 'Learn the ladder: alkyl 0 to 50, C-O 50 to 90, alkene and aromatic 100 to 150, carbonyl 160 to 220.',
    why: 'A single bond to oxygen pulls electron density off carbon and moves it into the 50 to 90 ppm range, typical for alcohols and ethers. Alkene carbons sit near 100 to 150, ketone carbonyls above 200, nitriles near 115 to 120, and plain alkyl carbons below about 50.'
  },
  {
    id: 'cn-10', type: 'cnmr', roots: ['l1-skeletal', 'l1-unsat'], difficulty: 2,
    stem: 'What does the 13C NMR spectrum of propanenitrile, CH3CH2CN, show?',
    sub: 'CCC#N',
    choices: [
      { text: '3 signals, one near 120 ppm' },
      { text: '3 signals, one near 205 ppm' },
      { text: '2 signals, one near 120 ppm' },
      { text: '3 signals, all of them below 40 ppm' },
      { text: '4 signals, including one for the nitrogen near 300 ppm' }
    ],
    correct: 0, verify: { c13: 'CCC#N' },
    coach: 'Every carbon here is different, and the nitrile carbon lands in the 115 to 120 ppm zone it shares with aromatic carbons.',
    why: 'Propanenitrile has three different carbons, so three signals. The sp nitrile carbon appears near 120 ppm, while the CH2 and CH3 sit near 11 and 10 ppm. 13C NMR shows only carbon, so nitrogen gives no signal, and nothing here is a carbonyl.'
  },
  {
    id: 'cn-11', type: 'cnmr', roots: ['l1-skeletal', 'l1-groups'], difficulty: 3,
    stem: 'A compound with formula C5H10O shows three signals in its 13C NMR spectrum, one of them near 211 ppm. Which structure fits?',
    choices: [{ smiles: 'CCC(=O)CC' }, { smiles: 'CCCC(C)=O' }, { smiles: 'CCCCC=O' }, { smiles: 'CC(C)C(C)=O' }, { smiles: 'CC(C)CC=O' }],
    correct: 0, verify: { c13Each: 3, formulaEach: 'C5H10O', distinct: true },
    coach: 'The 211 ppm signal says carbonyl; three signals for five carbons says the skeleton must be symmetric.',
    why: '3-Pentanone is symmetric about its carbonyl, so its five carbons give three signals, and the ketone carbonyl lands near 211 ppm. 2-Pentanone and pentanal have five different carbons each, while 3-methyl-2-butanone and 3-methylbutanal each have four signals because only their two methyls match.'
  },
  {
    id: 'cn-12', type: 'cnmr', roots: ['l1-skeletal'], difficulty: 2,
    stem: 'Which compound shows exactly two signals in its 13C NMR spectrum?',
    choices: [{ smiles: 'Clc1ccc(Cl)cc1' }, { smiles: 'Clc1ccccc1Cl' }, { smiles: 'Clc1cccc(Cl)c1' }, { smiles: 'Clc1ccccc1' }, { smiles: 'c1ccccc1' }],
    correct: 0, verify: { c13Each: 2, distinct: true },
    coach: 'Para places the two groups on one axis; that symmetry leaves only the carbons with chlorine and the carbons with hydrogen.',
    why: '1,4-Dichlorobenzene has two kinds of carbon: the two bonded to chlorine and the four bonded to hydrogen, so two signals. The ortho isomer gives three, the meta isomer four, chlorobenzene four, and benzene only one.'
  },

  /* ------------------------------------------------------------------ */
  /* Combined spectra                                                     */
  /* ------------------------------------------------------------------ */
  {
    id: 'ms-01', type: 'multi-spec', roots: ['l1-groups', 'l1-unsat'], difficulty: 2,
    stem: 'A compound C4H8O2 shows a very broad IR absorption from 2500 to 3300 cm-1 and a strong band at 1710 cm-1. Its 1H NMR spectrum shows a 6H doublet near 1.2 ppm, a 1H septet near 2.6 ppm and a 1H broad singlet near 12 ppm. Which structure fits?',
    choices: [{ smiles: 'CC(C)C(=O)O' }, { smiles: 'CCCC(=O)O' }, { smiles: 'CCOC(C)=O' }, { smiles: 'CCC(=O)OC' }, { smiles: 'COCC(C)=O' }],
    correct: 0, verify: { formulaEach: 'C4H8O2', distinct: true },
    coach: 'Kill choices one clue at a time: the very broad O-H plus 12 ppm says carboxylic acid, then the doublet and septet say isopropyl.',
    why: 'The O-H stretch spread across 2500 to 3300 cm-1 together with a signal near 12 ppm is the signature of a carboxylic acid, which removes the two esters and the methoxy ketone. A 6H doublet next to a 1H septet is an isopropyl group, so 2-methylpropanoic acid fits. Butanoic acid would show a triplet, a sextet and a triplet instead.'
  },
  {
    id: 'ms-02', type: 'multi-spec', roots: ['l1-groups', 'l2-bully'], difficulty: 3,
    stem: 'A compound C4H8O2 shows a strong IR band at 1740 cm-1 and no O-H stretch. Its 1H NMR spectrum shows a 3H singlet near 3.7 ppm, a 2H quartet near 2.3 ppm and a 3H triplet near 1.1 ppm. Which structure fits?',
    choices: [{ smiles: 'CCC(=O)OC' }, { smiles: 'CCOC(C)=O' }, { smiles: 'CCCC(=O)O' }, { smiles: 'CC(C)C(=O)O' }, { smiles: 'CCCOC=O' }],
    correct: 0, verify: { formulaEach: 'C4H8O2', distinct: true },
    coach: 'Both esters have a singlet, quartet and triplet, so read where the singlet sits: a methyl on oxygen lands near 3.7 ppm.',
    why: 'The 1740 band without O-H points to an ester, ruling out the two acids. Propyl formate would show a formyl H near 8 ppm and a three-signal propyl chain. Ethyl acetate and methyl propanoate both give a singlet, a quartet and a triplet, but in ethyl acetate the quartet is the O-CH2 near 4.1 ppm and the singlet is the acetyl CH3 near 2.0 ppm. Here the singlet sits near 3.7 ppm, so the methyl is on oxygen: methyl propanoate.'
  },
  {
    id: 'ms-03', type: 'multi-spec', roots: ['l1-groups'], difficulty: 1,
    stem: 'A compound C3H6O shows a strong IR band at 1715 cm-1 and nothing near 2720 cm-1. Its 1H NMR spectrum shows a single peak, a 6H singlet near 2.1 ppm. Which structure fits?',
    choices: [{ smiles: 'CC(C)=O' }, { smiles: 'CCC=O' }, { smiles: 'C=CCO' }, { smiles: 'C=COC' }, { smiles: 'C1COC1' }],
    correct: 0, verify: { formulaEach: 'C3H6O', distinct: true },
    coach: 'A carbonyl with no aldehyde C-H stretch near 2720 is a ketone, and one 6H singlet means two identical methyls.',
    why: 'The 1715 band is a C=O, which leaves acetone and propanal. Propanal would show the aldehyde C-H pair near 2720 and 2820 cm-1 and an aldehyde proton near 9.8 ppm. Acetone has two equivalent methyls with no neighbors, so its entire 1H spectrum is one 6H singlet.'
  },
  {
    id: 'ms-04', type: 'multi-spec', roots: ['l1-groups'], difficulty: 2,
    stem: 'A compound C3H6O shows IR bands at 2720, 2820 and 1730 cm-1. Its 1H NMR spectrum includes a 1H triplet near 9.8 ppm. Which structure fits?',
    choices: [{ smiles: 'CCC=O' }, { smiles: 'CC(C)=O' }, { smiles: 'C=CCO' }, { smiles: 'C=COC' }, { smiles: 'C1COC1' }],
    correct: 0, verify: { formulaEach: 'C3H6O', distinct: true },
    coach: 'The 2720 and 2820 pair plus a proton near 9.8 ppm is the aldehyde fingerprint.',
    why: 'The pair of C-H stretches near 2720 and 2820 cm-1 and the 1H signal near 9.8 ppm both belong to an aldehyde H. It is a triplet because the CH2 next door carries two H, and n plus 1 is 3. That is propanal. Acetone has the carbonyl but no aldehyde H, and the other three isomers have no carbonyl at all.'
  },
  {
    id: 'ms-05', type: 'multi-spec', roots: ['l1-groups', 'l1-skeletal'], difficulty: 2,
    stem: 'A compound C4H10O shows a broad IR band near 3350 cm-1. Its 13C NMR spectrum shows only two signals. Which structure fits?',
    choices: [{ smiles: 'CC(C)(C)O' }, { smiles: 'CCOCC' }, { smiles: 'CCCCO' }, { smiles: 'CCC(C)O' }, { smiles: 'CC(C)CO' }],
    correct: 0, verify: { formulaEach: 'C4H10O', distinct: true },
    coach: 'Use the IR to keep only the alcohols, then use the carbon count of signals to find the most symmetric one.',
    why: 'The broad band near 3350 cm-1 is an alcohol O-H, which removes diethyl ether even though it also has two carbon signals. Among the alcohols, tert-butanol has three equivalent methyls and one quaternary C-O carbon, so it alone gives two 13C signals. 1-Butanol and 2-butanol give four and 2-methyl-1-propanol gives three.'
  },
  {
    id: 'ms-06', type: 'multi-spec', roots: ['l1-groups', 'l1-skeletal'], difficulty: 2,
    stem: 'A compound C4H10O shows no IR absorption between 3200 and 3600 cm-1. Its 1H NMR spectrum shows only a 4H quartet near 3.4 ppm and a 6H triplet near 1.2 ppm. Which structure fits?',
    choices: [{ smiles: 'CCOCC' }, { smiles: 'CCCOC' }, { smiles: 'COC(C)C' }, { smiles: 'CC(C)(C)O' }, { smiles: 'CCCCO' }],
    correct: 0, verify: { formulaEach: 'C4H10O', distinct: true },
    coach: 'No O-H stretch means an ether; a single quartet and triplet with a 4 to 6 ratio means two identical ethyl groups.',
    why: 'With no O-H band the two alcohols are out. Methyl propyl ether and methyl isopropyl ether would each show a 3H singlet for the O-CH3 near 3.3 ppm. Diethyl ether has two equivalent ethyl groups: the O-CH2 protons give a 4H quartet near 3.4 ppm and the CH3 protons a 6H triplet near 1.2 ppm.'
  },
  {
    id: 'ms-07', type: 'multi-spec', roots: ['l1-groups', 'l1-unsat'], difficulty: 2,
    stem: 'A compound C8H8O shows a strong IR band near 1690 cm-1, no band near 2720 cm-1 and no O-H stretch. Its 1H NMR spectrum shows a 3H singlet near 2.6 ppm and 5H between 7.4 and 8.0 ppm. Which structure fits?',
    choices: [{ smiles: 'CC(=O)c1ccccc1' }, { smiles: 'O=CCc1ccccc1' }, { smiles: 'Cc1ccc(C=O)cc1' }, { smiles: 'C1OC1c1ccccc1' }, { smiles: 'C=Cc1ccc(O)cc1' }],
    correct: 0, verify: { formulaEach: 'C8H8O', distinct: true },
    coach: 'A conjugated ketone sits near 1690; five aromatic H means a monosubstituted ring, and a 3H singlet near 2.6 is a methyl on a carbonyl.',
    why: 'No 2720 band rules out both aldehydes, no carbonyl removes the epoxide, and no O-H removes the vinyl phenol. Acetophenone has a carbonyl conjugated with the ring, which lowers its stretch to about 1690 cm-1, a monosubstituted ring with five aromatic H, and a methyl next to the carbonyl that gives a 3H singlet near 2.6 ppm.'
  },
  {
    id: 'ms-08', type: 'multi-spec', roots: ['l1-groups', 'l1-skeletal'], difficulty: 3,
    stem: 'A compound C8H8O2 shows a very broad IR absorption from 2500 to 3300 cm-1 and a strong band near 1690 cm-1. Its 1H NMR spectrum shows a 3H singlet near 2.4 ppm, two 2H doublets between 7.2 and 8.0 ppm, and a 1H broad singlet near 12.5 ppm. Which structure fits?',
    choices: [{ smiles: 'Cc1ccc(C(=O)O)cc1' }, { smiles: 'Cc1cccc(C(=O)O)c1' }, { smiles: 'O=C(O)Cc1ccccc1' }, { smiles: 'COC(=O)c1ccccc1' }, { smiles: 'CC(=O)Oc1ccccc1' }],
    correct: 0, verify: { formulaEach: 'C8H8O2', distinct: true },
    coach: 'The broad O-H and 12.5 ppm say acid; two clean 2H doublets in the aromatic region say a para-disubstituted ring.',
    why: 'The very broad O-H band and the proton near 12.5 ppm mark a carboxylic acid, removing the two esters. Phenylacetic acid would show five aromatic H and a 2H singlet for its CH2. Of the two toluic acids, only the para isomer is symmetric enough to give two 2H doublets; the meta isomer has four different aromatic H. The 3H singlet near 2.4 ppm is the ring methyl.'
  },
  {
    id: 'ms-09', type: 'multi-spec', roots: ['l1-unsat', 'l1-skeletal'], difficulty: 3,
    stem: 'A compound C5H8 shows a sharp IR band near 3300 cm-1 and a weak band near 2120 cm-1. Its 13C NMR spectrum shows four signals. Which structure fits?',
    choices: [{ smiles: 'CC(C)C#C' }, { smiles: 'CCCC#C' }, { smiles: 'CCC#CC' }, { smiles: 'C1=CCCC1' }, { smiles: 'C=CC(C)=C' }],
    correct: 0, verify: { formulaEach: 'C5H8', distinct: true },
    coach: 'A sharp 3300 with a band near 2120 means a terminal alkyne; then count carbon kinds to pick the branched one.',
    why: 'A sharp C-H stretch near 3300 cm-1 plus a C-C triple bond stretch near 2120 cm-1 means a terminal alkyne, removing the internal alkyne, cyclopentene and isoprene. 1-Pentyne has five different carbons, while 3-methyl-1-butyne has two equivalent methyls, one CH and two alkyne carbons: four signals.'
  },
  {
    id: 'ms-10', type: 'multi-spec', roots: ['l1-groups', 'l1-skeletal'], difficulty: 2,
    stem: 'A compound C4H8O shows a strong IR band at 1715 cm-1 and nothing near 2720 cm-1 or above 3200 cm-1. Its 13C NMR spectrum shows four signals, one near 209 ppm. Which structure fits?',
    choices: [{ smiles: 'CCC(C)=O' }, { smiles: 'CCCC=O' }, { smiles: 'CC(C)C=O' }, { smiles: 'C1CCOC1' }, { smiles: 'C=CCCO' }],
    correct: 0, verify: { formulaEach: 'C4H8O', distinct: true },
    coach: 'Carbonyl but no aldehyde C-H means ketone, and the ketone signal above 200 ppm agrees.',
    why: 'The 1715 band with no 2720 band means a ketone, which removes butanal and 2-methylpropanal. Tetrahydrofuran has no carbonyl and only two 13C signals, and 3-buten-1-ol would show an O-H stretch. 2-Butanone has four different carbons, its carbonyl near 209 ppm.'
  }
];
