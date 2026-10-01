// Acid-base equilibria, chemoselectivity, alpha-carbonyl and multi-step synthesis.
// Original items for the 2026 organic spec. Every structure is RDKit-checked by the build;
// equilibrium sides are checked against the reference pKa table in verify.py.
const ACID = ['l2-acidity'];
const SEL = ['l1-groups', 'l2-bully'];
const ALPHA = ['l2-acidity', 'l2-arrows'];
const SYN = ['l1-groups', 'l2-arrows'];

export default [
  /* ------------------------------------------------------------ */
  /* Acid-base: which side, which products, which base              */
  /* ------------------------------------------------------------ */
  {
    id: 'eq-01', type: 'equilibrium', roots: ACID, difficulty: 1,
    stem: 'Acetic acid is mixed with sodium hydroxide: CH3COOH + OH- in equilibrium with CH3COO- + H2O. Which side does the equilibrium favor?',
    choices: [
      { text: 'Products, since water is the weaker acid' },
      { text: 'Reactants, since hydroxide is a strong base and stays as hydroxide' },
      { text: 'Neither side, since both acids have similar strengths in water' },
      { text: 'Reactants, since acetic acid is only a weak acid' },
      { text: 'Products, since acetate is a stronger base than hydroxide' }
    ],
    correct: 0,
    verify: { eq: { leftAcid: 'CC(=O)O', rightAcid: 'O', favors: 'right' } },
    coach: 'Find the acid on each side and compare their pKa values; the equilibrium runs toward the weaker acid.',
    why: 'Acetic acid has a pKa near 4.8 and water near 15.7, so water is the far weaker acid and the products win. Weak acid does not mean it will not react with a strong base: hydroxide pulls the proton off easily. Acetate is the weaker base, not the stronger one.'
  },
  {
    id: 'eq-02', type: 'equilibrium', roots: ACID, difficulty: 2,
    stem: 'Acetylene is treated with sodium hydroxide: acetylene + OH- in equilibrium with the acetylide anion + H2O. Which side does the equilibrium favor?',
    choices: [
      { text: 'Products, since an sp carbon holds a negative charge well' },
      { text: 'Reactants, since water is the stronger acid' },
      { text: 'Products, since hydroxide is the strongest base in water' },
      { text: 'Neither side, the pKa values are within one unit of each other' },
      { text: 'Products, since the acetylide is stabilized by resonance into the triple bond' }
    ],
    correct: 1,
    verify: { eq: { leftAcid: 'C#C', rightAcid: 'O', favors: 'left' } },
    coach: 'Compare the two acids: acetylene near 25 against water near 15.7. The side with the weaker acid wins.',
    why: 'Water (pKa about 15.7) is billions of times stronger as an acid than acetylene (pKa about 25), so the reaction runs backward and hydroxide makes almost no acetylide. That is why you need NaNH2 for a terminal alkyne. The sp orbital point is real, but it only gets acetylene to 25, not below water.'
  },
  {
    id: 'eq-03', type: 'equilibrium', roots: ACID, difficulty: 1,
    stem: 'Acetylene is treated with sodium amide: acetylene + NH2- in equilibrium with the acetylide anion + NH3. Which side does the equilibrium favor?',
    choices: [
      { text: 'Reactants, since amide is a weak base' },
      { text: 'Reactants, since ammonia is the stronger acid of the two' },
      { text: 'Products, since ammonia is the weaker acid' },
      { text: 'Neither side, since nitrogen and carbon are neighbors on the table' },
      { text: 'Reactants, since a carbanion is never favored over a nitrogen anion' }
    ],
    correct: 2,
    verify: { eq: { leftAcid: 'C#C', rightAcid: 'N', favors: 'right' } },
    coach: 'Acetylene is near 25, ammonia near 38. The proton ends up on whichever base holds it tighter, which is the weaker acid side.',
    why: 'Ammonia (pKa about 38) is a much weaker acid than acetylene (pKa about 25), so amide rips the proton off and the acetylide forms almost completely. The sp carbon holds the negative charge better than the sp3 nitrogen of amide here, because fifty percent s character outweighs the electronegativity gap.'
  },
  {
    id: 'eq-04', type: 'equilibrium', roots: ACID, difficulty: 2,
    stem: 'A student shakes phenol with aqueous sodium bicarbonate: C6H5OH + HCO3- in equilibrium with C6H5O- + H2CO3. Which side is favored, and does phenol move into the water layer?',
    choices: [
      { text: 'Products; phenol is an acid, so bicarbonate pulls it into water' },
      { text: 'Products; phenoxide is stabilized by resonance into the ring' },
      { text: 'Neither; the two pKa values are the same' },
      { text: 'Reactants; phenol mostly stays put' },
      { text: 'Products; carbonic acid falls apart to CO2, which drags it forward' }
    ],
    correct: 3,
    verify: { eq: { leftAcid: 'Oc1ccccc1', rightAcid: 'O=C(O)O', favors: 'left' } },
    coach: 'Bicarbonate only deprotonates acids stronger than carbonic acid, pKa about 6.4. Phenol sits near 10.',
    why: 'Carbonic acid (pKa about 6.4) is a stronger acid than phenol (pKa about 10), so the equilibrium sits on the reactant side and phenol stays in the organic layer. That is exactly how an extraction separates a carboxylic acid (pulled out by bicarbonate) from a phenol (needs NaOH). Phenoxide resonance is real, it is just not enough.'
  },
  {
    id: 'eq-05', type: 'equilibrium', roots: ACID, difficulty: 2,
    stem: 'Benzoic acid is shaken with aqueous sodium bicarbonate: C6H5COOH + HCO3- in equilibrium with C6H5COO- + H2CO3. Which side is favored?',
    choices: [
      { text: 'Reactants, since bicarbonate is too weak a base for any acid' },
      { text: 'Reactants, since benzoic acid does not dissolve in water at all' },
      { text: 'Neither, since a benzene ring cancels the acidity of COOH' },
      { text: 'Reactants, since carbonic acid is the stronger acid' },
      { text: 'Products, since carbonic acid is the weaker acid' }
    ],
    correct: 4,
    verify: { eq: { leftAcid: 'O=C(O)c1ccccc1', rightAcid: 'O=C(O)O', favors: 'right' } },
    coach: 'Benzoic acid is near 4.2 and carbonic acid near 6.4; the weaker acid, carbonic acid, sits on the side that wins.',
    why: 'Benzoic acid (pKa about 4.2) is stronger than carbonic acid (pKa about 6.4), so bicarbonate deprotonates it and the benzoate salt moves into water. The carboxylate is stabilized by resonance over two oxygens, the R in CARDIO, which is why carboxylic acids pass the bicarbonate test and phenols do not.'
  },
  {
    id: 'eq-06', type: 'equilibrium', roots: ACID, difficulty: 2,
    stem: 'Acetone is stirred with sodium hydroxide in water. Which side of the equilibrium CH3COCH3 + OH- in equilibrium with the enolate + H2O is favored?',
    choices: [
      { text: 'Reactants, with only a small amount of enolate present' },
      { text: 'Products, since the enolate is stabilized by resonance onto oxygen' },
      { text: 'Products, since hydroxide is a strong base' },
      { text: 'Products completely, which is why acetone dissolves in base' },
      { text: 'Neither, since the alpha hydrogen is not acidic at all' }
    ],
    correct: 0,
    verify: { eq: { leftAcid: 'CC(C)=O', rightAcid: 'O', favors: 'left' } },
    coach: 'Acetone is near 19 and water near 15.7: hydroxide makes a little enolate, never all of it.',
    why: 'Water (pKa about 15.7) is the stronger acid, so the equilibrium lies to the left. A small, constantly renewed amount of enolate is still present, which is all an aldol reaction needs. To make the enolate completely, use LDA, whose conjugate acid has a pKa near 36.'
  },
  {
    id: 'eq-07', type: 'equilibrium', roots: ACID, difficulty: 2,
    stem: 'Acetone is treated with LDA, lithium diisopropylamide, at -78 C. The conjugate acid of LDA is diisopropylamine. Which side of the deprotonation equilibrium is favored?',
    choices: [
      { text: 'Reactants, since LDA is too bulky to reach the alpha hydrogen' },
      { text: 'Products, essentially completely' },
      { text: 'Reactants, since the cold temperature stops the proton transfer' },
      { text: 'Neither, since an amine and a ketone are about equally acidic' },
      { text: 'Reactants, since nitrogen is more electronegative than carbon' }
    ],
    correct: 1,
    verify: { eq: { leftAcid: 'CC(C)=O', rightAcid: 'CC(C)NC(C)C', favors: 'right' } },
    coach: 'Acetone is about 19, diisopropylamine about 36: seventeen units downhill means the enolate forms completely.',
    why: 'Diisopropylamine is a far weaker acid than acetone, so LDA removes the alpha proton essentially quantitatively. Bulk keeps LDA from attacking the carbonyl carbon, but it can still reach a hydrogen on the edge of the molecule. Proton transfers stay fast even at -78 C.'
  },
  {
    id: 'eq-08', type: 'equilibrium', roots: ACID, difficulty: 2,
    stem: 'tert-Butanol is treated with sodium hydride: (CH3)3COH + H- gives (CH3)3CO- + H2. Which side is favored?',
    choices: [
      { text: 'Reactants, since hydride is a nucleophile, not a base' },
      { text: 'Reactants, since tert-butoxide is a stronger base than hydride' },
      { text: 'Products, with H2 bubbling out' },
      { text: 'Neither, since an alcohol cannot lose a proton to a hydride' },
      { text: 'Reactants, since tert-butanol is a stronger acid than water and holds on' }
    ],
    correct: 2,
    verify: { eq: { leftAcid: 'CC(C)(C)O', rightAcid: '[HH]', favors: 'right' } },
    coach: 'Hydrogen gas is a pathetic acid, pKa about 35, against tert-butanol near 18. The proton goes to hydride.',
    why: 'H2 (pKa about 35) is far weaker as an acid than tert-butanol (pKa about 18), so hydride deprotonates the alcohol and the gas escapes, which pushes it further. NaH acts as a base, not a nucleophile. tert-Butanol is actually a weaker acid than water, which is the opposite of one distractor.'
  },
  {
    id: 'eq-09', type: 'equilibrium', roots: ACID, difficulty: 1,
    stem: 'Ammonium chloride is mixed with sodium hydroxide: NH4+ + OH- in equilibrium with NH3 + H2O. Which side is favored?',
    choices: [
      { text: 'Reactants, since ammonium is a positive ion and holds its proton' },
      { text: 'Reactants, since water is the stronger acid' },
      { text: 'Neither, since both are nitrogen and oxygen acids' },
      { text: 'Products, since water is the weaker acid' },
      { text: 'Reactants, since ammonia is the stronger acid of the two' }
    ],
    correct: 3,
    verify: { eq: { leftAcid: '[NH4+]', rightAcid: 'O', favors: 'right' } },
    coach: 'Ammonium is near 9.2 and water near 15.7, so hydroxide takes the proton and ammonia is released.',
    why: 'Ammonium (pKa about 9.2) is the stronger acid and water (15.7) the weaker one, so products are favored. This is how a basic wash frees an amine from its ammonium salt: hydroxide pulls the proton and the neutral amine goes back to the organic layer.'
  },
  {
    id: 'eq-10', type: 'equilibrium', roots: ACID, difficulty: 2,
    stem: 'Which base can deprotonate 1-butyne essentially completely?',
    choices: [
      { text: 'Sodium hydroxide, NaOH' },
      { text: 'Sodium ethoxide, NaOCH2CH3' },
      { text: 'Sodium bicarbonate, NaHCO3' },
      { text: 'Triethylamine, (CH3CH2)3N' },
      { text: 'Sodium amide, NaNH2' }
    ],
    correct: 4,
    coach: 'A base works only if its conjugate acid is weaker than the alkyne, pKa above 25. Look at the acid each base would become.',
    why: 'A terminal alkyne has a pKa near 25. Sodium amide becomes ammonia (pKa about 38), far weaker, so the acetylide forms completely. Hydroxide becomes water (15.7) and ethoxide becomes ethanol (16), both stronger acids than the alkyne, so they barely touch it. Bicarbonate and triethylamine are weaker still.'
  },
  {
    id: 'eq-11', type: 'equilibrium', roots: ACID, difficulty: 2,
    stem: 'Judge the conjugate base. Which compound is the strongest acid?',
    choices: [
      { smiles: 'CC(=O)O' },
      { smiles: 'Oc1ccccc1' },
      { smiles: 'CCO' },
      { smiles: 'CC(C)=O' },
      { smiles: 'C#CC' }
    ],
    correct: 0,
    verify: { distinct: true },
    coach: 'Draw each conjugate base and ask where the negative charge lives: on oxygen and spread by resonance beats everything here.',
    why: 'Acetate spreads its charge over two equal oxygens, so acetic acid (pKa about 4.8) wins. Phenoxide spreads charge into the ring but mostly onto carbon (about 10). Ethoxide has no resonance (about 16). The enolate of acetone puts charge on carbon and oxygen (about 19), and the propynide anion sits on carbon (about 25).'
  },
  {
    id: 'eq-12', type: 'equilibrium', roots: ACID, difficulty: 2,
    stem: 'Acetic acid and methylamine are mixed at room temperature. What forms?',
    choices: [
      { smiles: 'CNC(C)=O.O' },
      { smiles: 'CC(=O)[O-].C[NH3+]' },
      { smiles: 'CC(O)=[OH+].C[NH-]' },
      { smiles: 'CC(O)(O)NC' },
      { smiles: 'CC(=O)OC.N' }
    ],
    correct: 1,
    verify: { distinct: true },
    coach: 'An acid meeting an amine at room temperature does the fastest thing first: the proton moves from the acid to the nitrogen lone pair.',
    why: 'Acetic acid (pKa about 4.8) hands its proton to methylamine, whose conjugate acid has a pKa near 10.6, so the salt methylammonium acetate forms. The amide plus water needs strong heating or an activated acid derivative. Moving the proton the other way would make a strong acid and a strong base, which is uphill.'
  },
  {
    id: 'eq-13', type: 'equilibrium', roots: ACID, difficulty: 3,
    stem: 'HCl gas is bubbled into water: HCl + H2O in equilibrium with Cl- + H3O+. Which side is favored, and what is the strongest acid that can exist in the water?',
    choices: [
      { text: 'Reactants; HCl stays whole and is the strongest acid present' },
      { text: 'Neither; HCl and hydronium are equally strong in water' },
      { text: 'Products; hydronium ion, H3O+' },
      { text: 'Products; HCl itself remains the strongest acid in solution' },
      { text: 'Reactants; chloride is a stronger base than water' }
    ],
    correct: 2,
    verify: { eq: { leftAcid: 'Cl', rightAcid: '[OH3+]', favors: 'right' } },
    coach: 'HCl (about -7) is far stronger than hydronium (about -1.7), so it ionizes completely, and hydronium is all that is left to act as the acid.',
    why: 'Any acid stronger than hydronium gives its proton to water completely, so the products are favored and hydronium becomes the strongest acid that can exist in water. That is called leveling. Chloride is a very weak base because its conjugate acid is so strong.'
  },

  /* ------------------------------------------------------------ */
  /* Chemoselectivity: what it touches, what it leaves alone         */
  /* ------------------------------------------------------------ */
  {
    id: 'cs-01', type: 'chemoselect', roots: SEL, difficulty: 1,
    stem: 'Methyl 4-acetylbenzoate is treated with NaBH4 in methanol at room temperature. What is the major product?',
    sub: 'CC(=O)c1ccc(C(=O)OC)cc1', reagent: 'NaBH4, CH3OH',
    choices: [
      { smiles: 'CC(O)c1ccc(C(=O)OC)cc1' },
      { smiles: 'CC(O)c1ccc(CO)cc1' },
      { smiles: 'CC(=O)c1ccc(CO)cc1' },
      { smiles: 'CCc1ccc(C(=O)OC)cc1' },
      { smiles: 'CC(O)c1ccc(C(=O)O)cc1' }
    ],
    correct: 0,
    verify: { distinct: true },
    coach: 'NaBH4 is the gentle hydride: it reduces ketones and aldehydes and leaves esters alone.',
    why: 'Borohydride is a mild hydride donor. The ketone carbonyl is electron poor enough to take a hydride, but the ester carbonyl is calmed by resonance from its OCH3 oxygen, so it survives. Only the ketone becomes a secondary alcohol. Reducing both takes LiAlH4.'
  },
  {
    id: 'cs-02', type: 'chemoselect', roots: SEL, difficulty: 1,
    stem: 'Methyl 4-acetylbenzoate is treated with excess LiAlH4 in ether, followed by an aqueous acid workup. What is the major product?',
    sub: 'CC(=O)c1ccc(C(=O)OC)cc1', reagent: '1. LiAlH4 (excess)  2. H3O+',
    choices: [
      { smiles: 'CC(O)c1ccc(C(=O)OC)cc1' },
      { smiles: 'CC(O)c1ccc(CO)cc1' },
      { smiles: 'CC(=O)c1ccc(CO)cc1' },
      { smiles: 'CCc1ccc(C)cc1' },
      { smiles: 'CC(O)c1ccc(C=O)cc1' }
    ],
    correct: 1,
    verify: { distinct: true },
    coach: 'LiAlH4 is the strong hydride: with excess it reduces the ketone and takes the ester all the way to a primary alcohol.',
    why: 'Lithium aluminum hydride is strong enough to reduce esters. The ester goes through an aldehyde, which is more reactive than the ester and is reduced again at once, ending as a CH2OH. The ketone becomes a secondary alcohol. Neither carbonyl is reduced all the way to CH2, which needs Clemmensen or Wolff-Kishner conditions.'
  },
  {
    id: 'cs-03', type: 'chemoselect', roots: SEL, difficulty: 2,
    stem: 'A student adds one equivalent of CH3MgBr to 4-hydroxy-2-butanone, HOCH2CH2COCH3, then works up with acid, and recovers mostly starting material. Why?',
    choices: [
      { text: 'Grignards do not add to ketones, only to aldehydes' },
      { text: 'The ketone is too hindered for the methyl group to reach' },
      { text: 'The O-H proton destroyed the Grignard first' },
      { text: 'The alcohol oxygen attacked the Grignard magnesium and formed an ether' },
      { text: 'The acid workup reversed the addition back to the ketone' }
    ],
    correct: 2,
    coach: 'A Grignard is a very strong base before it is a nucleophile; any O-H, N-H or COOH proton gets taken first.',
    why: 'The Grignard carbon behaves like a carbanion with a conjugate acid, methane, near pKa 50. The alcohol proton (about 16) is far more acidic, so the first equivalent simply makes methane and a magnesium alkoxide. Nothing is left to add to the ketone. Protect the alcohol or use a second equivalent.'
  },
  {
    id: 'cs-04', type: 'chemoselect', roots: SEL, difficulty: 3,
    stem: 'Which sequence turns methyl 4-acetylbenzoate into 4-acetylbenzyl alcohol, reducing the ester while keeping the ketone?',
    sub: 'CC(=O)c1ccc(C(=O)OC)cc1', prod: 'CC(=O)c1ccc(CO)cc1',
    choices: [
      { text: '1. NaBH4, CH3OH  2. H3O+' },
      { text: '1. LiAlH4  2. H3O+' },
      { text: '1. LiAlH4  2. HOCH2CH2OH, H+  3. H3O+' },
      { text: '1. HOCH2CH2OH, H+  2. NaBH4, CH3OH  3. H3O+, warm' },
      { text: '1. HOCH2CH2OH, H+  2. LiAlH4  3. H3O+' }
    ],
    correct: 4,
    coach: 'Hide the ketone as an acetal first, reduce the ester with the strong hydride, then take the acetal off with aqueous acid.',
    why: 'The ketone is more reactive than the ester, so no hydride alone can reduce only the ester. Ethylene glycol with acid turns the ketone into a cyclic acetal, which ignores hydride and base. LiAlH4 then reduces the ester to CH2OH, and aqueous acid restores the ketone. NaBH4 would not touch the ester at all.'
  },
  {
    id: 'cs-05', type: 'chemoselect', roots: ['l1-groups', 'l3-ez'], difficulty: 2,
    stem: 'Hept-1-en-5-yne is treated with H2 and Lindlar catalyst (one equivalent of H2). What is the major product?',
    sub: 'CC#CCCC=C', reagent: 'H2, Lindlar catalyst',
    choices: [
      { smiles: 'C/C=C/CCC=C' },
      { smiles: 'CCCCCC=C' },
      { smiles: 'CC#CCCCC' },
      { smiles: 'CCCCCCC' },
      { smiles: 'C/C=C\\CCC=C' }
    ],
    correct: 4,
    verify: { distinct: true },
    coach: 'Lindlar is a poisoned catalyst: it stops an alkyne at the cis alkene and does not touch alkenes.',
    why: 'The poisoned palladium adsorbs the alkyne much more strongly than an alkene, adds both hydrogens from the same face, and lets the new alkene go before it is reduced further. The triple bond becomes a cis double bond and the terminal alkene is untouched. The trans alkene comes from Na in NH3.'
  },
  {
    id: 'cs-06', type: 'chemoselect', roots: ['l1-groups', 'l1-unsat'], difficulty: 1,
    stem: 'Hept-1-en-5-yne is stirred under excess H2 with Pd on carbon. What is the product?',
    sub: 'CC#CCCC=C', reagent: 'H2 (excess), Pd/C',
    choices: [
      { smiles: 'C/C=C\\CCC=C' },
      { smiles: 'CCCCCCC' },
      { smiles: 'CC#CCCCC' },
      { smiles: 'C/C=C/CCCC' },
      { smiles: 'CCCCCC=C' }
    ],
    correct: 1,
    verify: { distinct: true },
    coach: 'Unpoisoned palladium with excess hydrogen saturates every carbon-carbon pi bond.',
    why: 'Plain Pd/C is not selective: the alkyne takes two equivalents of H2 and the alkene takes one, so the product is heptane. Stopping at the cis alkene requires the poisoned Lindlar catalyst.'
  },
  {
    id: 'cs-07', type: 'chemoselect', roots: SEL, difficulty: 1,
    stem: '2-Phenylethanol is treated with PCC in CH2Cl2. What is the major product?',
    sub: 'OCCc1ccccc1', reagent: 'PCC, CH2Cl2',
    choices: [
      { smiles: 'O=C(O)Cc1ccccc1' },
      { smiles: 'CC(=O)c1ccccc1' },
      { smiles: 'O=CCc1ccccc1' },
      { smiles: 'C=Cc1ccccc1' },
      { smiles: 'O=C(O)c1ccccc1' }
    ],
    correct: 2,
    verify: { distinct: true },
    coach: 'PCC is the gentle oxidant with no water around: a primary alcohol stops at the aldehyde.',
    why: 'PCC removes two hydrogens from the alcohol carbon. Without water, the aldehyde cannot form the hydrate that a second oxidation needs, so it stops there. Chromic acid (Jones) in water carries it on to phenylacetic acid. The carbon skeleton never changes.'
  },
  {
    id: 'cs-08', type: 'chemoselect', roots: SEL, difficulty: 1,
    stem: '2-Phenylethanol is treated with Jones reagent (CrO3, H2SO4, acetone, water). What is the major product?',
    sub: 'OCCc1ccccc1', reagent: 'CrO3, H2SO4, H2O',
    choices: [
      { smiles: 'O=CCc1ccccc1' },
      { smiles: 'O=C(O)c1ccccc1' },
      { smiles: 'CC(=O)c1ccccc1' },
      { smiles: 'O=C(O)Cc1ccccc1' },
      { smiles: 'OC(O)Cc1ccccc1' }
    ],
    correct: 3,
    verify: { distinct: true },
    coach: 'Jones is the strong oxidant in water: a primary alcohol goes all the way to the carboxylic acid, same carbon count.',
    why: 'In water the aldehyde forms a hydrate, a gem diol, which chromic acid oxidizes again, so the primary alcohol ends as phenylacetic acid. The benzylic carbon is not cleaved here, so benzoic acid would need a different reagent such as hot KMnO4.'
  },
  {
    id: 'cs-09', type: 'chemoselect', roots: ['l1-groups', 'l2-induction'], difficulty: 3,
    stem: 'Limonene is treated with one equivalent of mCPBA. Which epoxide forms as the major product?',
    sub: 'CC1=CCC(CC1)C(C)=C', reagent: 'mCPBA (1 equiv)',
    choices: [
      { smiles: 'CC1=CCC(CC1)C1(C)CO1' },
      { smiles: 'CC12CCC(CC1O2)C1(C)CO1' },
      { smiles: 'CC1(O)CCC(CC1O)C(C)=C' },
      { smiles: 'CC1=CCC(CC1)C(C)(O)CO' },
      { smiles: 'CC12CCC(CC1O2)C(C)=C' }
    ],
    correct: 4,
    verify: { distinct: true },
    coach: 'The peroxyacid is electron poor, so it goes to the most electron rich alkene: the one with the most alkyl groups on it.',
    why: 'Epoxidation is rich attacks poor: the alkene pi electrons attack the electrophilic oxygen of mCPBA. The ring alkene is trisubstituted and the isopropenyl alkene only disubstituted, so the ring alkene is richer and reacts first. With one equivalent, the ring epoxide is the major product. Diols need water and acid after the epoxide.'
  },
  {
    id: 'cs-10', type: 'chemoselect', roots: ['l2-resonance', 'l2-bully'], difficulty: 2,
    stem: 'Methyl 4-(chlorocarbonyl)benzoate is treated with one equivalent of CH3NH2 and pyridine at 0 C. What is the major product?',
    sub: 'COC(=O)c1ccc(C(=O)Cl)cc1', reagent: 'CH3NH2 (1 equiv), pyridine',
    choices: [
      { smiles: 'CNC(=O)c1ccc(C(=O)Cl)cc1' },
      { smiles: 'CNC(=O)c1ccc(C(=O)NC)cc1' },
      { smiles: 'CNC(=O)c1ccc(C(=O)OC)cc1' },
      { smiles: 'COC(=O)c1ccc(C(=O)O)cc1' },
      { smiles: 'CNCc1ccc(C(=O)OC)cc1' }
    ],
    correct: 2,
    verify: { distinct: true },
    coach: 'Rank the two acyl groups: an acid chloride is far more reactive than an ester, so one equivalent of amine goes there.',
    why: 'Chloride is a weak base and a great leaving group, and it gives the carbonyl almost no resonance help, so the acid chloride carbon is the most electron poor. The ester is calmed by its OCH3 lone pair. The amine attacks the acid chloride, chloride leaves, and pyridine soaks up the HCl. The ester survives.'
  },
  {
    id: 'cs-11', type: 'chemoselect', roots: SEL, difficulty: 2,
    stem: 'Which aryl bromide can be turned directly into a Grignard reagent with Mg in dry ether?',
    choices: [
      { smiles: 'Brc1ccc(O)cc1' },
      { smiles: 'Brc1ccc(C(=O)O)cc1' },
      { smiles: 'Brc1ccc(OC)cc1' },
      { smiles: 'Brc1ccc(C=O)cc1' },
      { smiles: 'Brc1ccc(CO)cc1' }
    ],
    correct: 2,
    verify: { distinct: true },
    coach: 'A Grignard cannot live in the same molecule as an acidic proton or a carbonyl; an ether is the only group here it ignores.',
    why: 'The phenol O-H, the carboxylic acid and the benzylic alcohol all carry acidic protons that would protonate the Grignard as it forms. The aldehyde would be attacked by the Grignard of a neighboring molecule. The methyl ether has neither, which is why ethers are the solvent for Grignard chemistry.'
  },

  /* ------------------------------------------------------------ */
  /* Alpha-carbonyl                                                   */
  /* ------------------------------------------------------------ */
  {
    id: 'al-01', type: 'alpha', roots: ALPHA, difficulty: 2,
    stem: '2-Methylcyclohexanone is treated with LDA at -78 C, then with CH3I. What is the major product?',
    sub: 'CC1CCCCC1=O', reagent: '1. LDA, -78 C  2. CH3I',
    choices: [
      { smiles: 'CC1(C)CCCCC1=O' },
      { smiles: 'COC1=C(C)CCCC1' },
      { smiles: 'CC1CCCC(C)C1=O' },
      { smiles: 'CC1CCCCC1(C)O' },
      { smiles: 'CC1CC(C)CCC1=O' }
    ],
    correct: 2,
    verify: { distinct: true },
    coach: 'LDA in the cold is bulky and fast: it takes the most reachable alpha hydrogen, on the less substituted side, the kinetic enolate.',
    why: 'LDA grabs a proton from the CH2 alpha carbon, which is less hindered than the CH carrying the methyl, and at -78 C nothing equilibrates. That kinetic enolate then attacks CH3I in an SN2, putting the new methyl on the other alpha carbon: 2,6-dimethylcyclohexanone. Thermodynamic conditions would favor 2,2-dimethyl.'
  },
  {
    id: 'al-02', type: 'alpha', roots: ALPHA, difficulty: 2,
    stem: '2-Methylcyclohexanone is held with a small amount of NaOCH2CH3 in ethanol at room temperature, so its enolates can interconvert. Which enolate predominates?',
    choices: [
      { text: 'The one with the double bond toward the methyl carbon' },
      { text: 'The one with the double bond toward the CH2 carbon, since it forms faster' },
      { text: 'Equal amounts of both, since the base is not bulky' },
      { text: 'An enolate on the methyl group itself, outside the ring' },
      { text: 'Neither, since ethoxide is too weak to make any enolate' }
    ],
    correct: 0,
    coach: 'When the enolates can trade back and forth, the more stable one wins, and more alkyl groups on the double bond means more stable.',
    why: 'Ethoxide makes only small amounts of enolate, and ethanol reprotonates it constantly, so the two enolates equilibrate. The more substituted enolate, with its C=C toward the methyl-bearing carbon, is more stable, just like a more substituted alkene. That is thermodynamic control. The CH2-side enolate forms faster, which only matters under LDA kinetic conditions.'
  },
  {
    id: 'al-03', type: 'alpha', roots: ALPHA, difficulty: 2,
    stem: 'Propanal is treated with dilute NaOH at 5 C. What is the aldol addition product?',
    sub: 'CCC=O', reagent: 'NaOH (dilute), 5 C',
    choices: [
      { smiles: 'CCC=C(C)C=O' },
      { smiles: 'CCC(O)C(C)C=O' },
      { smiles: 'CCC(O)CCC=O' },
      { smiles: 'CCCO' },
      { smiles: 'CCC(C=O)C(O)CC' }
    ],
    correct: 1,
    verify: { distinct: true },
    coach: 'The alpha carbon of one aldehyde attacks the carbonyl carbon of the other; the new C-C bond joins alpha to carbonyl carbon.',
    why: 'Hydroxide makes a little enolate at C2 of propanal. That rich carbon attacks the poor carbonyl carbon of a second propanal, and the alkoxide picks up a proton: 3-hydroxy-2-methylpentanal, six carbons. In the cold it stops there; heating would dehydrate it to the enal, 2-methylpent-2-enal.'
  },
  {
    id: 'al-04', type: 'alpha', roots: ALPHA, difficulty: 2,
    stem: 'Benzaldehyde and acetone, one equivalent each, are heated with NaOH in ethanol and water. What is the major product?',
    choices: [
      { smiles: 'CC(=O)CC(O)c1ccccc1' },
      { smiles: 'O=C(/C=C/c1ccccc1)/C=C/c1ccccc1' },
      { smiles: 'CC(=O)/C=C/c1ccccc1' },
      { smiles: 'CC(C)=CC(C)=O' },
      { smiles: 'O=C/C=C/c1ccccc1' }
    ],
    correct: 2,
    verify: { distinct: true },
    coach: 'Only acetone has alpha hydrogens, so it is the enolate; benzaldehyde is the better electrophile, and heat removes water to make the conjugated enone.',
    why: 'Benzaldehyde has no alpha hydrogen, so it can only be attacked. The acetone enolate adds to it, and with heat the beta-hydroxy ketone loses water to form the alkene conjugated to both the ring and the carbonyl: benzalacetone, the E isomer of 4-phenylbut-3-en-2-one. A second condensation needs a second equivalent of benzaldehyde.'
  },
  {
    id: 'al-05', type: 'alpha', roots: ALPHA, difficulty: 2,
    stem: 'Ethyl acetate is treated with sodium ethoxide in ethanol, then with aqueous acid. What is the Claisen product?',
    sub: 'CCOC(C)=O', reagent: '1. NaOCH2CH3, CH3CH2OH  2. H3O+',
    choices: [
      { smiles: 'CC(=O)CC(C)=O' },
      { smiles: 'CCOC(=O)CC(=O)OCC' },
      { smiles: 'CC(O)CC(=O)OCC' },
      { smiles: 'CCOC(=O)CC(C)=O' },
      { smiles: 'CCOC(=O)C(C)C(=O)OCC' }
    ],
    correct: 3,
    verify: { distinct: true },
    coach: 'In a Claisen the enolate attacks an ester and ethoxide is kicked off, so the product is a beta-keto ester, not a beta-hydroxy one.',
    why: 'The enolate of ethyl acetate attacks the carbonyl of a second molecule. Unlike an aldol, the tetrahedral intermediate has a leaving group, ethoxide, which is kicked out to give ethyl acetoacetate. Ethoxide then deprotonates the doubly alpha CH2, which drives the reaction, and the acid workup returns the neutral beta-keto ester.'
  },
  {
    id: 'al-06', type: 'alpha', roots: ALPHA, difficulty: 2,
    stem: 'Ethyl acetoacetate is treated with 1. NaOCH2CH3, 2. CH3CH2Br, 3. H3O+ and heat. What is the final product?',
    sub: 'CCOC(=O)CC(C)=O', reagent: '1. NaOEt  2. CH3CH2Br  3. H3O+, heat',
    choices: [
      { smiles: 'CCC(C(C)=O)C(=O)OCC' },
      { smiles: 'CCCC(=O)O' },
      { smiles: 'CCC(C)=O' },
      { smiles: 'CCCCC(C)=O' },
      { smiles: 'CCCC(C)=O' }
    ],
    correct: 4,
    verify: { distinct: true },
    coach: 'Acetoacetic ester synthesis: alkylate the middle carbon, then hydrolysis and heat knock off the CO2, leaving a methyl ketone.',
    why: 'Ethoxide removes a proton from the CH2 between the two carbonyls (pKa about 11). That enolate does SN2 on ethyl bromide. Aqueous acid hydrolyzes the ester to a beta-keto acid, which loses CO2 on heating. What is left is CH3CO plus CH2 plus the new ethyl: 2-pentanone. The malonic ester route would give an acid instead.'
  },
  {
    id: 'al-07', type: 'alpha', roots: ALPHA, difficulty: 2,
    stem: 'Diethyl malonate is treated with 1. NaOCH2CH3, 2. benzyl bromide, 3. H3O+ and heat. What is the final product?',
    sub: 'CCOC(=O)CC(=O)OCC', reagent: '1. NaOEt  2. PhCH2Br  3. H3O+, heat',
    choices: [
      { smiles: 'OC(=O)CCc1ccccc1' },
      { smiles: 'OC(=O)Cc1ccccc1' },
      { smiles: 'CCOC(=O)C(Cc1ccccc1)C(=O)OCC' },
      { smiles: 'OC(=O)C(Cc1ccccc1)C(=O)O' },
      { smiles: 'CC(=O)CCc1ccccc1' }
    ],
    correct: 0,
    verify: { distinct: true },
    coach: 'Malonic ester synthesis ends as a carboxylic acid: the new group plus CH2 plus one COOH, after one CO2 leaves.',
    why: 'Ethoxide deprotonates the CH2 between the two esters, the enolate does SN2 on benzyl bromide, then acid hydrolyzes both esters to a diacid. Heating a 1,3-diacid loses one CO2. The result is benzyl plus CH2 plus COOH: 3-phenylpropanoic acid. Stopping before heat would leave the diacid.'
  },
  {
    id: 'al-08', type: 'alpha', roots: ALPHA, difficulty: 2,
    stem: 'Acetophenone is treated with excess I2 in aqueous NaOH, then acidified. What forms?',
    sub: 'CC(=O)c1ccccc1', reagent: '1. I2 (excess), NaOH  2. H3O+',
    choices: [
      { smiles: 'O=C(CI)c1ccccc1' },
      { smiles: 'O=C(C(I)(I)I)c1ccccc1' },
      { smiles: 'Ic1ccc(C(C)=O)cc1' },
      { smiles: 'O=Cc1ccccc1.IC(I)I' },
      { smiles: 'O=C(O)c1ccccc1.IC(I)I' }
    ],
    correct: 4,
    verify: { distinct: true },
    coach: 'Haloform: in base every alpha hydrogen on the methyl is replaced, then hydroxide kicks off CI3- and the ketone becomes an acid.',
    why: 'Each iodination makes the remaining alpha hydrogens more acidic, so in base the methyl goes all the way to CI3. Hydroxide then attacks the carbonyl and the CI3 anion leaves, stabilized by three iodines. Proton transfer gives iodoform, a yellow solid, and benzoate, which acid turns into benzoic acid.'
  },
  {
    id: 'al-09', type: 'alpha', roots: ['l2-resonance', 'l2-arrows'], difficulty: 3,
    stem: 'Diethyl malonate and one equivalent of methyl vinyl ketone are treated with catalytic NaOCH2CH3. What is the major product?',
    sub: 'C=CC(C)=O', reagent: 'CH2(CO2Et)2, NaOEt (cat.)',
    choices: [
      { smiles: 'C=CC(C)(O)C(C(=O)OCC)C(=O)OCC' },
      { smiles: 'CCOC(=O)C(CCC(C)=O)C(=O)OCC' },
      { smiles: 'CC(=O)CCCC(=O)O' },
      { smiles: 'CCOC(=O)C(CCC(C)=O)(CCC(C)=O)C(=O)OCC' },
      { smiles: 'CCOC(=O)C(=CCC(C)=O)C(=O)OCC' }
    ],
    correct: 1,
    verify: { distinct: true },
    coach: 'A soft, stabilized enolate adds to the far end of an enone, the beta carbon, which resonance makes partially positive.',
    why: 'Resonance pushes the enone electrons toward oxygen and leaves the beta carbon partially positive. The malonate enolate is very stabilized, so it adds reversibly at the carbonyl but irreversibly at the beta carbon: 1,4 addition, the Michael reaction. Protonation gives the keto diester. The 5-oxohexanoic acid needs hydrolysis and heat that were not used.'
  },

  /* ------------------------------------------------------------ */
  /* Multi-step synthesis                                              */
  /* ------------------------------------------------------------ */
  {
    id: 'sy-01', type: 'synthesis', roots: ['l2-carbocation', 'l1-groups'], difficulty: 2,
    stem: 'Which sequence makes propylbenzene from benzene in good yield?',
    sub: 'c1ccccc1', prod: 'CCCc1ccccc1',
    choices: [
      { text: '1. CH3CH2CH2Cl, AlCl3' },
      { text: '1. CH3CH2COCl, AlCl3  2. NaBH4, CH3OH' },
      { text: '1. CH3CH2COCl, AlCl3  2. Zn(Hg), HCl' },
      { text: '1. CH3CH2COCl, AlCl3  2. LiAlH4  3. H3O+, cold' },
      { text: '1. Br2, FeBr3  2. CH3CH2CH2Br, light' }
    ],
    correct: 2,
    coach: 'A straight chain on a ring: acylate first (no rearrangement), then remove the carbonyl oxygen completely.',
    why: 'Friedel-Crafts alkylation with a primary propyl chloride rearranges to the isopropyl cation and gives cumene. Acylation uses a resonance-stabilized acylium ion that never rearranges, and Clemmensen reduction (Zn(Hg), HCl) turns the C=O into CH2. NaBH4 or LiAlH4 would only stop at the alcohol.'
  },
  {
    id: 'sy-02', type: 'synthesis', roots: ['l2-resonance', 'l1-groups'], difficulty: 2,
    stem: 'Benzene is treated with 1. CH3COCl, AlCl3, then 2. HNO3, H2SO4. What is the major product?',
    sub: 'c1ccccc1', reagent: '1. CH3COCl, AlCl3  2. HNO3, H2SO4',
    choices: [
      { smiles: 'CC(=O)c1ccc([N+](=O)[O-])cc1' },
      { smiles: 'CC(=O)c1ccccc1[N+](=O)[O-]' },
      { smiles: 'CC(O)c1cccc([N+](=O)[O-])c1' },
      { smiles: 'CC(=O)c1cccc([N+](=O)[O-])c1' },
      { smiles: 'O=[N+]([O-])c1ccccc1' }
    ],
    correct: 3,
    verify: { distinct: true },
    coach: 'The acyl group goes on first, and a carbonyl on a ring pulls electrons out, so it sends the nitro group meta.',
    why: 'Acylation gives acetophenone. The acetyl group withdraws electron density by resonance, which puts partial positive charge at the ortho and para carbons, so nitration happens at the meta position: 3-nitroacetophenone. Order matters: nitrate first and the ring would be too poor for Friedel-Crafts at all.'
  },
  {
    id: 'sy-03', type: 'synthesis', roots: SYN, difficulty: 2,
    stem: 'Bromobenzene is treated with 1. Mg, ether 2. CH3CHO 3. H3O+ 4. PCC. What is the final product?',
    sub: 'Brc1ccccc1', reagent: '1. Mg  2. CH3CHO  3. H3O+  4. PCC',
    choices: [
      { smiles: 'CC(O)c1ccccc1' },
      { smiles: 'CC(=O)c1ccccc1' },
      { smiles: 'O=CCc1ccccc1' },
      { smiles: 'O=C(O)c1ccccc1' },
      { smiles: 'O=C(O)Cc1ccccc1' }
    ],
    correct: 1,
    verify: { distinct: true },
    coach: 'Build the carbon skeleton first with the Grignard, read which carbon became the alcohol, then oxidize that alcohol.',
    why: 'Phenylmagnesium bromide attacks the carbonyl carbon of acetaldehyde, and acid workup gives 1-phenylethanol, a secondary alcohol. PCC oxidizes a secondary alcohol to a ketone, acetophenone. A secondary alcohol cannot go on to an acid, and the phenyl is attached to the former carbonyl carbon, not the methyl.'
  },
  {
    id: 'sy-04', type: 'synthesis', roots: ['l3-isomers', 'l2-carbocation'], difficulty: 3,
    stem: 'Cyclohexanol is treated with 1. H2SO4, heat 2. OsO4, then NaHSO3, H2O. What is the product? (A chiral structure shown stands for the racemate where one forms.)',
    sub: 'OC1CCCCC1', reagent: '1. H2SO4, heat  2. OsO4  3. NaHSO3, H2O',
    choices: [
      { smiles: 'O[C@H]1CCCC[C@@H]1O' },
      { smiles: 'O=C1CCCCC1' },
      { smiles: 'O[C@@H]1CCCC[C@@H]1O' },
      { smiles: 'C1CCC2OC2C1' },
      { smiles: 'OC1CCCC(O)C1' }
    ],
    correct: 2,
    verify: { distinct: true },
    coach: 'Acid and heat dehydrate to cyclohexene; OsO4 adds both oxygens from the same face, so the diol is cis.',
    why: 'Concentrated acid with heat eliminates water (E1) to give cyclohexene. Osmium tetroxide adds across the alkene in one concerted step from one face, so both OH groups end up cis: the meso cis-1,2-diol. Trans diol comes from an epoxide opened with aqueous acid.'
  },
  {
    id: 'sy-05', type: 'synthesis', roots: ['l3-isomers', 'l2-arrows'], difficulty: 3,
    stem: 'Cyclohexene is treated with 1. mCPBA 2. H3O+. What is the product? (A chiral structure shown stands for the racemate where one forms.)',
    sub: 'C1=CCCCC1', reagent: '1. mCPBA  2. H3O+',
    choices: [
      { smiles: 'O[C@@H]1CCCC[C@@H]1O' },
      { smiles: 'O[C@H]1CCCC[C@@H]1O' },
      { smiles: 'C1CCC2OC2C1' },
      { smiles: 'OC1CCCCC1' },
      { smiles: 'O=C1CCCCC1' }
    ],
    correct: 1,
    verify: { distinct: true },
    coach: 'The epoxide is opened from the back face, like an SN2, so the two OH groups end up trans.',
    why: 'mCPBA delivers one oxygen to one face, making the epoxide. Acid protonates the epoxide oxygen, and water attacks the carbon from the opposite face, the backside, which opens the ring with inversion. The two OH groups end up trans, as a racemic pair. OsO4 is the reagent for the cis diol.'
  },
  {
    id: 'sy-06', type: 'synthesis', roots: SYN, difficulty: 2,
    stem: 'Which Grignard reagent and carbonyl compound give 2-methyl-2-butanol, (CH3)2C(OH)CH2CH3, after acid workup?',
    choices: [
      { text: 'CH3MgBr and butanal' },
      { text: 'CH3CH2MgBr and acetaldehyde' },
      { text: 'CH3CH2MgBr and acetone' },
      { text: '(CH3)2CHMgBr and formaldehyde' },
      { text: 'Excess CH3MgBr and ethyl acetate' }
    ],
    correct: 2,
    coach: 'Work backward: the OH carbon was the carbonyl carbon, and one of the groups on it came from the Grignard.',
    why: 'The alcohol carbon carries two methyls and an ethyl. Cut off the ethyl and the carbonyl that remains is acetone, so ethylmagnesium bromide plus acetone works. CH3MgBr with butanal gives 2-pentanol, ethyl with acetaldehyde gives 2-butanol, isopropyl with formaldehyde gives 2-methyl-1-propanol, and excess CH3MgBr with ethyl acetate gives tert-butanol.'
  },
  {
    id: 'sy-07', type: 'synthesis', roots: ['l3-ez', 'l2-acidity'], difficulty: 2,
    stem: '1-Butyne is treated with 1. NaNH2 2. CH3CH2Br 3. H2, Lindlar catalyst. What is the final product?',
    sub: 'C#CCC', reagent: '1. NaNH2  2. CH3CH2Br  3. H2, Lindlar',
    choices: [
      { smiles: 'CC/C=C/CC' },
      { smiles: 'CCC#CCC' },
      { smiles: 'CCCCCC' },
      { smiles: 'CC/C=C\\CC' },
      { smiles: 'C=CCCCC' }
    ],
    correct: 3,
    verify: { distinct: true },
    coach: 'Make the acetylide, add two carbons by SN2, then Lindlar stops the new internal alkyne at the cis alkene.',
    why: 'Amide removes the terminal alkyne proton. The acetylide does SN2 on ethyl bromide to make 3-hexyne. Lindlar adds two hydrogens to the same face and stops at the alkene: cis-3-hexene. Na in NH3 would give trans, and H2 with plain Pd would go to hexane.'
  },
  {
    id: 'sy-08', type: 'synthesis', roots: ['l2-carbocation', 'l1-groups'], difficulty: 2,
    stem: 'Which sequence converts 1-butene into 1-butanol?',
    sub: 'C=CCC', prod: 'OCCCC',
    choices: [
      { text: '1. H2O, H2SO4' },
      { text: '1. Hg(OAc)2, H2O  2. NaBH4' },
      { text: '1. BH3, THF  2. H2O2, NaOH' },
      { text: '1. HBr (no peroxide)  2. NaOH, H2O' },
      { text: '1. O3, then (CH3)2S  2. NaBH4, CH3OH' }
    ],
    correct: 2,
    coach: 'An OH on the less substituted carbon means anti-Markovnikov: hydroboration-oxidation.',
    why: 'Boron, the electron-poor end of B-H, bonds to the less substituted, less crowded carbon while H goes to the other carbon; oxidation then swaps boron for OH with the same placement, giving 1-butanol. Acid hydration, oxymercuration and HBr all put the new group on C2 (Markovnikov). Ozonolysis cuts the chain.'
  },
  {
    id: 'sy-09', type: 'synthesis', roots: SYN, difficulty: 2,
    stem: 'Toluene is treated with 1. KMnO4, heat, then H3O+ 2. SOCl2 3. NH3 (excess). What is the final product?',
    sub: 'Cc1ccccc1', reagent: '1. KMnO4, heat; H3O+  2. SOCl2  3. NH3',
    choices: [
      { smiles: 'NC(=O)Cc1ccccc1' },
      { smiles: 'Nc1ccccc1' },
      { smiles: 'O=C(Cl)c1ccccc1' },
      { smiles: 'O=C(O)c1ccccc1' },
      { smiles: 'NC(=O)c1ccccc1' }
    ],
    correct: 4,
    verify: { distinct: true },
    coach: 'Follow the one carbon: hot KMnO4 makes it a COOH, SOCl2 makes the acid chloride, and ammonia turns that into the amide.',
    why: 'Hot permanganate oxidizes the benzylic methyl all the way to benzoic acid. Thionyl chloride swaps the OH for Cl, giving the very reactive benzoyl chloride, and ammonia attacks it (attack, kick off chloride) to give benzamide. Getting to aniline would take a Hofmann rearrangement, which was not used.'
  }
];
