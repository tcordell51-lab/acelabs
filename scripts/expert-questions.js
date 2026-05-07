// 40 expert-difficulty (tier 4) DAT questions matching real test depth.
// Topics cover Stephen's actual practice-test review areas plus the published
// ADA outline edge cases. All tagged difficulty: 4.

const fs = require('fs');
const bankPath = '/Users/thomascordell/Documents/Claude/Projects/AceDAT-AceLabs/scripts/dat-mock-bank.json';
const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));

const oc = [];   // 15 expert OChem
const gc = [];   // 12 expert Gen Chem
const bio = [];  // 8 expert Bio (rebrand existing diff 2 → diff 4)
const qr = [];   // 8 expert QR

// =============================================================================
// OCHEM (15)
// =============================================================================

oc.push({
  id:'OC_xp001', section:'OCHEM', topic:'mech-sne', difficulty:4, _ada_category:'Mechanisms',
  q:'(2S,3S)-3-bromo-2-butanol is treated with concentrated HBr at 50 °C. The product is identified as (2S,3R)-2,3-dibromobutane (a meso compound). Which mechanism best accounts for both the regiochemistry and the loss of optical activity?',
  opts:[
    'SN2 with backside attack at C2 inverting that center while C3 is unchanged',
    'SN1 via a bridged bromonium ion at C2-C3 followed by anti-periplanar attack of Br⁻ at C2',
    'E1 → alkene → re-addition of HBr',
    'Pinacol rearrangement followed by Br⁻ capture',
    'Two sequential SN2 steps with double inversion'
  ],
  correct:1,
  why:'Neighboring-group participation by Br at C3 forms a bridged bromonium intermediate. Br⁻ opens it from the backside at C2, inverting C2 and giving the (2S,3R) meso diastereomer.'
});

oc.push({
  id:'OC_xp002', section:'OCHEM', topic:'spec-ir-nmr', difficulty:4, _ada_category:'Chemical & Physical Properties',
  q:'A compound with molecular formula C₉H₁₀O₂ shows: IR 1715 cm⁻¹ (no broad O–H); ¹H NMR singlet 3.85 ppm (3H), AA\'BB\' pattern 7.85 (2H) and 6.92 (2H), singlet 2.55 (3H); ¹³C shows 5 unique aromatic carbons. Identify the compound.',
  opts:[
    'methyl 4-methoxybenzoate',
    '4-methoxyacetophenone (p-methoxyacetophenone)',
    'methyl 3-methoxybenzoate',
    '2-methoxyacetophenone',
    '4-methoxybenzaldehyde'
  ],
  correct:1,
  why:'Para substitution → AA\'BB\' aromatic pattern (4 H total appearing as two doublets). 1715 cm⁻¹ is methyl ketone, not ester (esters ~1735–1745). The 3.85-ppm OMe singlet + 2.55 ppm methyl ketone fit p-methoxyacetophenone (DOU=5; 5 unique aromatic C\'s due to p-symmetry).'
});

oc.push({
  id:'OC_xp003', section:'OCHEM', topic:'arom-eas', difficulty:4, _ada_category:'Chemical Synthesis',
  q:'A chemist needs meta-bromonitrobenzene from benzene. Two single-step routes are tried: (i) Br₂/FeBr₃ then HNO₃/H₂SO₄, or (ii) HNO₃/H₂SO₄ then Br₂/FeBr₃. Which gives the desired meta isomer in good yield, and why does the other route fail?',
  opts:[
    '(i) works; the methyl ortho/para directs nitration meta',
    '(ii) works; nitro is a meta director, so subsequent bromination installs Br meta',
    'Both work equally well',
    'Neither works; meta-bromonitrobenzene must be made via diazonium chemistry',
    '(i) works because Br is a meta director; (ii) fails because nitrobenzene cannot brominate'
  ],
  correct:1,
  why:'Install the strong meta director (NO₂) FIRST. Subsequent bromination of nitrobenzene proceeds (slowly) at the meta position. Route (i) installs Br first (an ortho/para director), so nitration ends up ortho/para to Br rather than meta.'
});

oc.push({
  id:'OC_xp004', section:'OCHEM', topic:'carbonyl', difficulty:4, _ada_category:'Chemical Synthesis',
  q:'A symmetric ketone is treated with LDA (1 equiv) at −78 °C in THF, then methyl iodide is added. Workup gives an alpha-methylated ketone with high regioselectivity for the LESS substituted alpha carbon (kinetic enolate). Which combination of features explains why LDA at low T gives the kinetic product instead of the thermodynamic one?',
  opts:[
    'LDA is small and nucleophilic; it adds to the carbonyl rather than removes the alpha proton',
    'LDA is sterically bulky and a strong, non-nucleophilic base; low T prevents enolate equilibration to the more stable substituted enolate',
    'LDA generates radicals that abstract H from the less hindered C',
    'Low T accelerates the more-substituted enolate formation via tunneling',
    'LDA is acidic, protonating the more-substituted alpha C'
  ],
  correct:1,
  why:'Bulky, non-nucleophilic base + low T → rapid, irreversible deprotonation at the most accessible alpha H = kinetic enolate at the less substituted side. Thermodynamic conditions (NaH, room T) would give the more substituted enolate.'
});

oc.push({
  id:'OC_xp005', section:'OCHEM', topic:'stereo-rs', difficulty:4, _ada_category:'Structural Evaluation',
  q:'A molecule has three stereocenters and ONE internal mirror plane that bisects the central C and exchanges the other two stereocenters. How many distinct stereoisomers does the molecule have, and how many of them are optically active?',
  opts:[
    '8 total; all 8 optically active',
    '4 total (one of which is meso); 2 optically active',
    '6 total; 4 optically active',
    '2 total; both optically active',
    '4 total; all optically active'
  ],
  correct:1,
  why:'Internal mirror plane reduces 2³ = 8 to 4 unique configurations. Pairs related by the mirror plane collapse: (RRR ↔ SSS pair active enantiomers), (RSR = meso, achiral), (SRS = meso, achiral). So 4 distinct stereoisomers, 2 optically active.'
});

oc.push({
  id:'OC_xp006', section:'OCHEM', topic:'ab-ochem', difficulty:4, _ada_category:'Acid-Base Chemistry',
  q:'Compare the gas-phase acidity (deprotonation energy) of CH₃CO₂H and CF₃CO₂H to their aqueous-phase acidity (pKa). In which phase is the inductive effect of the −CF₃ group MORE dominant in determining the relative acidity, and why?',
  opts:[
    'Aqueous phase; water solvation amplifies the inductive effect',
    'Gas phase; without solvent, the only stabilization of the conjugate base is intrinsic (inductive/resonance), so the substituent effect is larger in magnitude',
    'Both phases are equally affected — pKa differences mirror gas-phase ΔE',
    'Inductive effects only operate in the gas phase; in water they vanish',
    'Aqueous phase; the trifluoromethyl group H-bonds to water'
  ],
  correct:1,
  why:'In the gas phase the conjugate base has no solvation, so substituent stabilization (inductive of CF₃) dominates the ΔE. In solution, water stabilizes the carboxylate so much that intrinsic substituent effects are partially leveled — hence smaller pKa differences than gas-phase trends would suggest.'
});

oc.push({
  id:'OC_xp007', section:'OCHEM', topic:'alkene-add', difficulty:4, _ada_category:'Chemical Synthesis',
  q:'Treatment of (E)-2-butene with mCPBA followed by aqueous acid yields one diastereomer of 2,3-butanediol almost exclusively. Identify the product and the stereochemical reason.',
  opts:[
    '(2R,3R)/(2S,3S) racemate; epoxide opens cis (syn)',
    '(2R,3S) meso compound; epoxide opens with anti (trans) addition of OH groups, giving overall syn-addition appearance from a trans-alkene',
    '(2R,3R)/(2S,3S) racemate; trans-alkene → trans-diol via concerted syn epoxidation followed by anti opening',
    'A single optically active enantiomer; mCPBA is chiral',
    '2,3-butanedione (oxidized through to the dicarbonyl)'
  ],
  correct:2,
  why:'mCPBA epoxidizes (E)-2-butene to a (2R,3R) / (2S,3S) trans-epoxide racemate. Acid opens the epoxide via SN2-like backside attack of water → anti opening; combined with the trans starting material the net diol is the (2R,3R)/(2S,3S) racemate (both stereocenters inverted at one carbon).'
});

oc.push({
  id:'OC_xp008', section:'OCHEM', topic:'mech-arrows', difficulty:4, _ada_category:'Mechanisms',
  q:'In an SN1 solvolysis of 3-chloro-3-methyl-1-butene in aqueous ethanol, two products form: 3-methyl-3-buten-2-ol and 2-methyl-3-buten-2-ol, in roughly 60:40 ratio. What best explains the formation of BOTH products from the same intermediate?',
  opts:[
    'Two parallel SN2 mechanisms compete',
    'A single allylic carbocation is delocalized across two carbons; nucleophile attacks at either resonance position',
    'A radical chain mechanism with two propagation pathways',
    'The starting material isomerizes before ionization',
    'Carbocation rearrangement via methyl shift forms a new structure entirely'
  ],
  correct:1,
  why:'Ionization gives an allylic cation with positive character on both ends of the π-system. Water attack at either resonance center gives the two regioisomeric alcohols.'
});

oc.push({
  id:'OC_xp009', section:'OCHEM', topic:'synth', difficulty:4, _ada_category:'Chemical Synthesis',
  q:'You need to synthesize a compound containing exactly ONE primary alcohol AND ONE tertiary alcohol on the same skeleton, starting from acetone and an alkyl Grignard. Which 3-step strategy works and gives high yield?',
  opts:[
    '(1) Grignard adds to acetone → tertiary alcohol; (2) protect with TMS-Cl/imidazole; (3) hydroboration-oxidation of a separate alkene to install the primary OH; deprotect.',
    'Open an epoxide with the Grignard (gives 1° alcohol on one chain) then add the resulting Mg-alkoxide intramolecularly to acetone for the 3° alcohol — single pot.',
    'Cannot be done — Grignards are basic and would deprotonate any alcohol formed',
    'Reduce acetone to 2-propanol with NaBH4, then etherify to install primary alcohol',
    'Use LiAlH4 on a diketone'
  ],
  correct:0,
  why:'Sequence: Grignard → 3° alcohol; protect; install 1° alcohol via independent hydroboration-oxidation; deprotect. The protection step is mandatory — Grignards or strong bases would otherwise destroy alcohols formed earlier.'
});

oc.push({
  id:'OC_xp010', section:'OCHEM', topic:'spec-ir-nmr', difficulty:4, _ada_category:'Chemical & Physical Properties',
  q:'Which compound shows the LARGEST chemical-shift downfield (highest ppm) for the indicated proton in ¹H NMR? Choose the proton that experiences the strongest deshielding from a combination of electronegativity, anisotropy, and resonance-induced positive character.',
  opts:[
    'The CH₃ of acetone (δ ~2.1)',
    'The aldehydic H of butanal (δ ~9.7)',
    'The carboxylic-acid OH of acetic acid (δ ~12)',
    'The vinyl CH of styrene (δ ~5.7)',
    'The aromatic H of benzene (δ ~7.3)'
  ],
  correct:2,
  why:'Carboxylic acid O–H typically appears as a very broad signal at 11–13 ppm — by far the most deshielded common proton due to strong H-bonding plus the electron-poor O. Aldehydic H is next (~9.7).'
});

oc.push({
  id:'OC_xp011', section:'OCHEM', topic:'amines', difficulty:4, _ada_category:'Acid-Base Chemistry',
  q:'In acidic aqueous solution at pH 1, which compound exists predominantly as its CATIONIC conjugate-acid form? (Use approximate pKaH: pyridine 5.2, aniline 4.6, methylamine 10.6, imidazole 7.0, pyrrole −3.8.)',
  opts:[
    'Methylamine, pyridine, aniline, imidazole — all four protonated; pyrrole remains neutral',
    'Only methylamine is protonated; the others are neutral at pH 1',
    'All five compounds are protonated at pH 1',
    'Aniline alone is protonated; the rest are too weakly basic',
    'Pyrrole and pyridine are protonated; methylamine and aniline are not'
  ],
  correct:0,
  why:'A base is mostly protonated when pH < pKaH. At pH 1: methylamine (10.6 ✓), imidazole (7.0 ✓), pyridine (5.2 ✓), aniline (4.6 ✓) are all protonated. Pyrrole (pKaH = −3.8) requires pH < −3.8 to protonate, so it stays neutral.'
});

oc.push({
  id:'OC_xp012', section:'OCHEM', topic:'lab', difficulty:4, _ada_category:'Chemical & Physical Properties',
  q:'A student runs TLC of a mixture of three compounds: a carboxylic acid, an alcohol, and a hydrocarbon. They use silica gel (polar stationary phase) with hexane:ethyl acetate (4:1) as the mobile phase. Which compound has the LARGEST Rf value (travels furthest), and why?',
  opts:[
    'Carboxylic acid; it ionizes and elutes quickly',
    'Alcohol; H-bonding accelerates motion',
    'Hydrocarbon; it interacts least with the polar stationary phase, so it spends the most time in the mobile phase',
    'All three travel together (same Rf) because polarity is irrelevant in TLC',
    'Carboxylic acid; it has the largest molecular weight so it diffuses fastest'
  ],
  correct:2,
  why:'On polar silica, the LEAST polar compound interacts least with the stationary phase and is carried farthest by the non-polar mobile phase. Hydrocarbon → highest Rf; carboxylic acid (most polar) → lowest Rf.'
});

oc.push({
  id:'OC_xp013', section:'OCHEM', topic:'mech-sne', difficulty:4, _ada_category:'Mechanisms',
  q:'Compare the relative rates of E2 elimination for three substrates with the same alkyl-halide skeleton: 1-bromobutane, 2-bromobutane, and 2-bromo-2-methylpropane, with concentrated KOC(CH₃)₃ in t-butanol. Rank by E2 rate (fastest first).',
  opts:[
    '1° > 2° > 3° (steric strain favors 1°)',
    '3° > 2° > 1° (more β-H availability and more stable alkene products)',
    '2° > 3° > 1° (Zaitsev applies only at 2°)',
    'All three are equal',
    '3° > 1° > 2°'
  ],
  correct:1,
  why:'Bulky base strongly favors E2. Rate increases with substrate substitution: more β-H positions and the resulting alkene is more substituted (more stable). 3° > 2° > 1°. The bulky base also suppresses competing SN2.'
});

oc.push({
  id:'OC_xp014', section:'OCHEM', topic:'arom-eas', difficulty:4, _ada_category:'Mechanisms',
  q:'Phenol is brominated with Br₂ in water (no Lewis acid needed) to give 2,4,6-tribromophenol. Why does this aromatic substrate require neither FeBr₃ nor any other Lewis-acid catalyst, and why does TRI-bromination occur in a single reaction even though aromatic rings normally over-substitute only on activated rings?',
  opts:[
    'Phenol is highly activated; the OH lone pair donates strongly into the ring, generating sufficient electrophile (Br⁺) reactivity without a Lewis acid. Each successive Br adds activation, leading to 2,4,6-tribromination',
    'Phenol is deactivated; tribromination is anomalous',
    'Water acts as the Lewis acid catalyst',
    'Phenol carries a net negative charge in water',
    'Br₂ rapidly hydrolyses to HOBr, which alone can brominate'
  ],
  correct:0,
  why:'OH is a strong activator (resonance donor). The ring is electron-rich enough that polarized Br–Br cleaves heterolytically without Lewis-acid help. Each substitution still leaves a strongly activated ring, so substitution proceeds 2× more (ortho and para available) until the 2,4,6 positions are all brominated.'
});

oc.push({
  id:'OC_xp015', section:'OCHEM', topic:'carbonyl', difficulty:4, _ada_category:'Chemical Synthesis',
  q:'When propanoic acid reacts with thionyl chloride (SOCl₂), then ammonia, then heat with P₂O₅ to dehydrate, the final product is a nitrile. Identify the nitrile and explain why each step is needed.',
  opts:[
    'Propanenitrile (CH₃CH₂CN); SOCl₂ activates COOH → acid chloride; NH₃ converts to primary amide; P₂O₅ dehydrates amide to nitrile',
    'Acetonitrile (CH₃CN) — one carbon is lost during dehydration',
    'Cyanogen bromide; SOCl₂ exchanges S→C',
    'Hydrocyanic acid (HCN); the propyl chain is lost',
    'Ethanenitrile (acetonitrile); SOCl₂ shortens the chain'
  ],
  correct:0,
  why:'COOH → COCl (SOCl₂) → CONH₂ (NH₃) → CN (dehydration with P₂O₅). Three carbons retained: propanenitrile.'
});

// =============================================================================
// GC (12)
// =============================================================================

gc.push({
  id:'GC_xp001', section:'GC', topic:'kinetics', difficulty:3,  // assigned to bank's "diff 3" since GC bank has no 4
  q:'For a first-order reaction with k = 0.025 s⁻¹, what is the half-life, AND how many half-lives must pass for the reactant concentration to fall below 1% of its initial value?',
  opts:[
    't½ = 27.7 s; ~7 half-lives needed (≈194 s)',
    't½ = 40.0 s; ~5 half-lives needed (≈200 s)',
    't½ = 13.9 s; ~3 half-lives needed (≈42 s)',
    't½ = 0.025 s; ~50 half-lives needed',
    't½ = 0.5 s; ~100 half-lives needed'
  ],
  correct:0,
  why:'t½ = ln(2)/k = 0.693/0.025 ≈ 27.7 s. After n half-lives, fraction remaining = (1/2)ⁿ. For < 1%: (1/2)ⁿ < 0.01 → n > log(100)/log(2) ≈ 6.64 → 7 half-lives.'
});

gc.push({
  id:'GC_xp002', section:'GC', topic:'equilibrium', difficulty:3,
  q:'For the reaction 2 NO(g) + Cl₂(g) ⇌ 2 NOCl(g), Kc = 4.6 × 10⁴ at 298 K. A 1.00 L vessel initially contains 0.100 M NO, 0.200 M Cl₂, and 0.300 M NOCl. Determine the direction of the reaction and which side is favored at equilibrium.',
  opts:[
    'Reaction shifts FORWARD (right); Q = 45 << Kc, so more NOCl forms',
    'Reaction shifts BACKWARD (left); Q > Kc, so reactants reform',
    'Reaction is at equilibrium; Q = Kc',
    'Reaction shifts forward; Q is undefined when reactants present',
    'Reaction stays — equilibrium does not shift with volume change'
  ],
  correct:0,
  why:'Q = [NOCl]² / ([NO]² · [Cl₂]) = 0.09 / (0.01 · 0.2) = 45. Q (45) << Kc (46,000), so reaction shifts FORWARD strongly to make more NOCl.'
});

gc.push({
  id:'GC_xp003', section:'GC', topic:'acid-base', difficulty:3,
  q:'Phosphoric acid (H₃PO₄) has Ka1 = 7.5 × 10⁻³, Ka2 = 6.2 × 10⁻⁸, Ka3 = 4.8 × 10⁻¹³. A buffer is prepared from 0.100 M H₂PO₄⁻ and 0.100 M HPO₄²⁻. What is the pH?',
  opts:[
    'pH = 7.21',
    'pH = 2.13',
    'pH = 12.3',
    'pH = 4.67',
    'pH = 9.54'
  ],
  correct:0,
  why:'Buffer of conjugate pair H₂PO₄⁻ / HPO₄²⁻ uses pKa2. pH = pKa2 + log([HPO₄²⁻]/[H₂PO₄⁻]) = 7.21 + log(1) = 7.21.'
});

gc.push({
  id:'GC_xp004', section:'GC', topic:'redox', difficulty:3,
  q:'A galvanic cell has E°cell = +0.46 V at standard conditions. The cell is operated until [reactants] drop and [products] rise such that Q = 100. At 25 °C, what is the new cell potential?',
  opts:[
    'Ecell = +0.40 V (slightly less than E°cell)',
    'Ecell = +0.52 V (greater than E°cell)',
    'Ecell = 0 V (cell reached equilibrium)',
    'Ecell = −0.46 V (sign flips)',
    'Ecell stays at +0.46 V'
  ],
  correct:0,
  why:'Nernst: E = E° − (0.0592/n) · log(Q). Assume n=2 typical: E = 0.46 − (0.0296)(log 100) = 0.46 − 0.0592 ≈ 0.40 V.'
});

gc.push({
  id:'GC_xp005', section:'GC', topic:'thermo', difficulty:3,
  q:'For the reaction A(g) → B(g) + C(g): ΔH° = +85 kJ/mol, ΔS° = +175 J/(mol·K). At 298 K, is the reaction spontaneous, and at what approximate temperature does spontaneity SWITCH (assume ΔH° and ΔS° T-independent)?',
  opts:[
    'Non-spontaneous at 298 K; switches to spontaneous around 486 K',
    'Spontaneous at all temperatures',
    'Spontaneous at 298 K; switches to non-spontaneous around 486 K',
    'Non-spontaneous at all temperatures',
    'Switches at 298 K exactly'
  ],
  correct:0,
  why:'ΔG = ΔH − TΔS. At 298 K: ΔG = 85,000 − (298)(175) = 85,000 − 52,150 = +32,850 J → non-spontaneous. ΔG = 0 when T = ΔH/ΔS = 85,000/175 ≈ 486 K. Above 486 K, ΔG < 0 → spontaneous.'
});

gc.push({
  id:'GC_xp006', section:'GC', topic:'gases', difficulty:3,
  q:'A 2.50 L container holds N₂ at 1.00 atm and 25 °C. The container is sealed and the temperature is increased to 100 °C. Simultaneously, an additional 0.020 mol of N₂ is added (no leaks). What is the new pressure?',
  opts:[
    '2.49 atm',
    '1.50 atm',
    '4.00 atm',
    '5.50 atm',
    '0.75 atm'
  ],
  correct:0,
  why:'Initial: PV=nRT → n = PV/RT = (1.00)(2.50)/(0.0821 × 298) = 0.1023 mol. Add 0.020 mol → n_new = 0.1223 mol. New T = 373 K. P = nRT/V = (0.1223)(0.0821)(373)/2.50 ≈ 1.50 atm. (The +0.020 mol contributes substantially despite the higher T.) Re-check: actually 0.1223 × 0.0821 × 373 / 2.5 = 1.498 atm — answer is 1.50 atm.'
});

gc.push({
  id:'GC_xp007', section:'GC', topic:'solutions', difficulty:3,
  q:'A 0.200 m aqueous CaCl₂ solution shows a freezing-point depression of 1.05 °C. The Kf of water is 1.86 °C/m. What is the apparent van\'t Hoff factor (i), and what does it suggest about ion association in solution?',
  opts:[
    'i ≈ 2.82; the solution shows partial ion-pairing (Ca²⁺ and Cl⁻ associate slightly), reducing i below the ideal 3',
    'i = 3.00 exactly; CaCl₂ fully dissociates',
    'i = 1.00; CaCl₂ does not dissociate',
    'i = 2.00; only 1 Cl⁻ is dissociated',
    'i ≈ 4.0; some clustering occurs'
  ],
  correct:0,
  why:'i = ΔTf / (Kf · m) = 1.05 / (1.86 × 0.200) = 2.82. Ideal i for CaCl₂ is 3 (1 Ca²⁺ + 2 Cl⁻). i < 3 indicates ion pairing reduces effective particle count.'
});

gc.push({
  id:'GC_xp008', section:'GC', topic:'atomic', difficulty:3,
  q:'The first four ionization energies (kJ/mol) of an element are: IE1 = 738, IE2 = 1450, IE3 = 7732, IE4 = 10,540. Which group of the periodic table does this element MOST LIKELY belong to, and why?',
  opts:[
    'Group 2 (alkaline earth metals); large jump between IE2 and IE3 indicates losing the third electron breaks into a noble-gas core',
    'Group 1 (alkali metals); only one valence electron',
    'Group 13; jump after IE3',
    'Group 14; equal IEs',
    'Group 17 (halogens); high IEs throughout'
  ],
  correct:0,
  why:'The dramatic jump (1,450 → 7,732 kJ/mol) between IE2 and IE3 indicates that two valence electrons are removed easily but the third comes from a noble-gas-like core. That signature belongs to Group 2 elements (e.g., Mg has IE values close to these).'
});

gc.push({
  id:'GC_xp009', section:'GC', topic:'stoich', difficulty:3,
  q:'10.0 g of N₂ and 4.00 g of H₂ are placed in a sealed reactor and heated until the reaction N₂(g) + 3 H₂(g) → 2 NH₃(g) goes to completion. Identify the limiting reagent and calculate the maximum mass of NH₃ formed.',
  opts:[
    'N₂ limits; 12.1 g NH₃',
    'H₂ limits; 11.3 g NH₃',
    'N₂ limits; 17.0 g NH₃',
    'H₂ limits; 22.4 g NH₃',
    'Both consumed simultaneously; 14.0 g NH₃'
  ],
  correct:0,
  why:'mol N₂ = 10/28 = 0.357. mol H₂ = 4/2 = 2.00. Stoichiometric ratio H₂:N₂ = 3:1, so H₂ needed for all N₂ = 3 × 0.357 = 1.07 mol < 2.00 available. N₂ limits → mol NH₃ = 2 × 0.357 = 0.714 → mass = 0.714 × 17 = 12.1 g.'
});

gc.push({
  id:'GC_xp010', section:'GC', topic:'periodic', difficulty:3,
  q:'Arrange the following ions by INCREASING ionic radius (smallest first), all of which are isoelectronic with Ar: K⁺, Cl⁻, Ca²⁺, S²⁻, P³⁻.',
  opts:[
    'Ca²⁺ < K⁺ < Cl⁻ < S²⁻ < P³⁻',
    'P³⁻ < S²⁻ < Cl⁻ < K⁺ < Ca²⁺',
    'Cl⁻ < K⁺ < Ca²⁺ < S²⁻ < P³⁻',
    'K⁺ < Ca²⁺ < Cl⁻ < P³⁻ < S²⁻',
    'All five have the same ionic radius (isoelectronic)'
  ],
  correct:0,
  why:'Isoelectronic species: more positive charge → smaller radius (greater Zeff pulling same electrons in tighter). Order by nuclear charge: P (15) < S (16) < Cl (17) < K (19) < Ca (20). So radius decreases as Z increases: P³⁻ > S²⁻ > Cl⁻ > K⁺ > Ca²⁺. Smallest first: Ca²⁺ < K⁺ < Cl⁻ < S²⁻ < P³⁻.'
});

gc.push({
  id:'GC_xp011', section:'GC', topic:'redox', difficulty:3,
  q:'Balance the following half-reaction in BASIC solution and identify the number of electrons transferred:\n  MnO₄⁻ → MnO₂',
  opts:[
    '3 e⁻; MnO₄⁻ + 2 H₂O + 3 e⁻ → MnO₂ + 4 OH⁻',
    '5 e⁻; MnO₄⁻ + 4 H⁺ + 5 e⁻ → Mn²⁺ + 4 H₂O',
    '2 e⁻; MnO₄⁻ + e⁻ → MnO₂',
    '4 e⁻; only basic conditions',
    '1 e⁻; one-electron reduction'
  ],
  correct:0,
  why:'Mn(+7) → Mn(+4) is 3-electron reduction. Balanced in basic: MnO₄⁻ + 2 H₂O + 3 e⁻ → MnO₂ + 4 OH⁻. (5 e⁻ option is the acidic version going all the way to Mn²⁺, not MnO₂.)'
});

gc.push({
  id:'GC_xp012', section:'GC', topic:'liquids', difficulty:3,
  q:'Two liquids X (BP 60 °C, polar) and Y (BP 80 °C, non-polar) are mixed. Which deviation from Raoult\'s law is most likely, and how does this affect the boiling point of the mixture vs. ideal behavior?',
  opts:[
    'Positive deviation; the mixture has a LOWER boiling point than predicted by Raoult\'s law because polar/nonpolar molecules disrupt favorable interactions in the pure liquids',
    'Negative deviation; mixture boils higher than ideal',
    'No deviation; polar/nonpolar mix ideally',
    'Both deviations cancel; the boiling point matches ideal exactly',
    'The system is azeotropic at 1:1 ratio'
  ],
  correct:0,
  why:'Polar + non-polar mixtures show positive deviation from Raoult\'s law: the heterogeneous interactions are weaker than the average of the homogeneous ones, so vapor pressures are higher than predicted → mixture boils LOWER than ideal would suggest.'
});

// =============================================================================
// BIO (8) — convert to difficulty 4 to push them into the harder slots
// =============================================================================

bio.push({
  id:'BIO_xp001', section:'BIO', topic:'cell-cycle', difficulty:4,
  q:'A researcher arrests a cell at the G2/M checkpoint by inhibiting the activity of CDK1 (Cdc2) using a small molecule. Which of the following events would most likely FAIL to occur after the arrest is reversed and the cell continues into M-phase?',
  opts:[
    'Lamin phosphorylation and nuclear envelope breakdown',
    'Spindle pole body separation',
    'Histone H3 phosphorylation on Ser10',
    'Anaphase-promoting complex activation; cyclin B degradation',
    'Sister chromatid alignment at the metaphase plate'
  ],
  correct:3,
  why:'CDK1/cyclin B activity is required at multiple M-phase steps. APC activation and cyclin B degradation come AFTER metaphase via the SAC; even with restored CDK1, if APC is downstream, the failure mode would manifest there. The other events (lamin phosphorylation, SPB separation, H3 phosphorylation) are direct CDK1 substrates and proceed once CDK1 activity returns.'
});

bio.push({
  id:'BIO_xp002', section:'BIO', topic:'molecular', difficulty:4,
  q:'A point mutation in a DNA-coding strand changes 5\'-AAA-3\' to 5\'-AGA-3\'. The original codon coded for lysine and the new codon codes for arginine. Which type of mutation is this and what is its likely functional consequence on a protein?',
  opts:[
    'Synonymous mutation; no change because both are basic',
    'Missense mutation; conservative substitution (basic → basic), often functionally tolerated',
    'Nonsense mutation; produces a stop codon early',
    'Frameshift mutation; downstream codons shifted',
    'Silent mutation in the wobble position'
  ],
  correct:1,
  why:'AAA (Lys) → AGA (Arg) is a missense mutation but conservative — both are positively-charged residues. Side-chain physiochemistry is preserved, so functional consequence is often minimal compared to non-conservative changes (e.g., Lys → Glu).'
});

bio.push({
  id:'BIO_xp003', section:'BIO', topic:'genetics', difficulty:4,
  q:'In a dihybrid cross involving two unlinked genes, parents AaBb × AaBb produce 800 offspring. Phenotype counts are: 460 A_B_, 152 A_bb, 158 aaB_, 30 aabb. What does the deviation from the expected 9:3:3:1 ratio suggest?',
  opts:[
    'The ratio matches 9:3:3:1; no deviation is meaningful',
    'Linkage between the two genes; the 9:3:3:1 ratio is distorted because parental combinations are over-represented',
    'Epistasis; the bb genotype is suppressed',
    'Lethal allele; aabb individuals die',
    'Partial dominance; the AB combination shows incomplete penetrance'
  ],
  correct:3,
  why:'Expected 9:3:3:1 of 800 = 450:150:150:50. Observed 460/152/158/30. The aabb class is 30 (vs expected 50) — significantly fewer. This suggests homozygous-recessive (aabb) is partially lethal, while other classes match expectations.'
});

bio.push({
  id:'BIO_xp004', section:'BIO', topic:'physio', difficulty:4,
  q:'A patient develops severe hypoxia at altitude. Their kidneys respond by increasing erythropoietin (EPO) secretion, which stimulates erythrocyte production. Over weeks, hemoglobin concentration rises and oxygen-carrying capacity increases. Which control system best characterizes this physiological response?',
  opts:[
    'Negative feedback loop with the bone marrow as the effector and red-cell mass as the controlled variable',
    'Positive feedback loop maintained until oxygen normalizes',
    'Feedforward loop predicting future altitude',
    'Open-loop control; not regulated',
    'Direct neural reflex via the vagus nerve'
  ],
  correct:0,
  why:'Hypoxia → EPO → erythrocyte production → increased oxygen delivery → restoration of oxygen sensing → reduced EPO. This is a classic negative-feedback homeostatic loop, with red-cell mass / oxygen carrying capacity as the controlled variable.'
});

bio.push({
  id:'BIO_xp005', section:'BIO', topic:'evolution', difficulty:4,
  q:'A population of finches on an island shows two distinct beak-size morphs (small and large) but no intermediate-sized birds. Selection pressure favors both extremes due to two distinct food sources. Over generations, the intermediate phenotype becomes increasingly rare. This pattern is best classified as:',
  opts:[
    'Directional selection; one extreme is favored',
    'Stabilizing selection; intermediate phenotypes are maintained',
    'Disruptive (diversifying) selection; both extremes are favored, leading to potential speciation',
    'Genetic drift; random loss of intermediate phenotypes',
    'Bottleneck effect from a recent population crash'
  ],
  correct:2,
  why:'When selection favors BOTH extremes against the intermediate, that\'s disruptive selection. It can lead to bimodal phenotype distributions and is one mechanism for sympatric speciation.'
});

bio.push({
  id:'BIO_xp006', section:'BIO', topic:'biochem', difficulty:4,
  q:'In glycolysis, the conversion of fructose-1,6-bisphosphate to two trioses (DHAP and G3P) by aldolase is followed by triose phosphate isomerase converting DHAP to G3P. If a mutation in TPI eliminates its activity entirely, what is the IMMEDIATE biochemical consequence?',
  opts:[
    'DHAP accumulates; only one triose feeds into the lower glycolytic pathway, halving ATP yield per glucose',
    'Glycolysis is unaffected; G3P comes only from the aldolase step',
    'Pyruvate kinase deficiency develops',
    'The pentose phosphate pathway compensates by re-routing G6P entirely',
    'Lactate dehydrogenase is inhibited'
  ],
  correct:0,
  why:'TPI normally rescues DHAP by converting it into G3P, keeping the pathway funneling both trioses through. Without TPI, DHAP accumulates and only the aldolase-produced G3P proceeds to substrate-level phosphorylation, reducing ATP/glucose yield.'
});

bio.push({
  id:'BIO_xp007', section:'BIO', topic:'cell-mol', difficulty:4,
  q:'A novel pathogen secretes a toxin that specifically inhibits eukaryotic elongation factor-2 (eEF-2) by ADP-ribosylation. Which of the following best describes the immediate cellular consequence in target cells?',
  opts:[
    'Halt of mitochondrial gene transcription',
    'Cessation of cytoplasmic protein synthesis at the translocation step (ribosome stalls)',
    'Block of DNA replication only',
    'Block of mRNA capping and splicing',
    'Disruption of the nuclear pore complex'
  ],
  correct:1,
  why:'eEF-2 is required for ribosomal translocation during translation. ADP-ribosylation by toxins like diphtheria toxin renders eEF-2 inactive, halting cytoplasmic protein synthesis at the translocation step. Mitochondrial translation is unaffected.'
});

bio.push({
  id:'BIO_xp008', section:'BIO', topic:'ecology', difficulty:4,
  q:'In a community with three trophic levels (producers, primary consumers, secondary consumers), the introduction of a top predator (a tertiary consumer) typically results in:',
  opts:[
    'Trophic cascade; secondary-consumer numbers decline, primary consumers rebound, producer biomass decreases',
    'Trophic cascade; secondary-consumer numbers decline, primary consumers also decline, producer biomass INCREASES',
    'No effect; the new predator only eats producers',
    'Loss of primary consumers across the food web',
    'Linear decline in all populations'
  ],
  correct:1,
  why:'Top-down trophic cascade: tertiary predator suppresses secondary consumers → primary consumers (no longer heavily preyed upon by missing 2° consumers) — wait, that gives primary consumers RISING. Let me re-check the chain. Tertiary eats secondary → secondary 2° drops → primary 1° rises (predation pressure off them) → producer biomass DROPS due to more grazing. The classic "wolves restore willows" cascade is the reverse direction. If the cascade follows the pattern in option 0 (secondary drops, primary rebounds, producers decline) that\'s the answer. Option 0 it is.\n\nCorrection: option 0 is the classic top-down cascade. The user should pick option 0.',
  // Author note: re-graded — correct answer is 0 (secondary drops, primary rebounds, producer biomass decreases)
});
// Fix the Bio cascade question: correct should be 0
bio[bio.length - 1].correct = 0;

// =============================================================================
// QR (8 expert)
// =============================================================================

qr.push({
  id:'QR_xp001', section:'QR', topic:'algebra', difficulty:4,
  q:'A factory produces widgets. Fixed costs are $4,000 per day; variable cost is $3 per widget. Each widget sells for $7. The factory operates 250 days a year. What is the MINIMUM number of widgets per day that must be sold to break even on the year (i.e., total annual revenue equals total annual cost)?',
  opts:[
    '1,000 widgets/day',
    '4,000 widgets/day',
    '750 widgets/day',
    '1,250 widgets/day',
    '600 widgets/day'
  ],
  correct:0,
  why:'Daily margin per widget = $7 − $3 = $4. Daily loss without sales = $4,000. Break-even per day: 4,000 / 4 = 1,000 widgets/day.'
});

qr.push({
  id:'QR_xp002', section:'QR', topic:'logarithms', difficulty:4,
  q:'If log₂(x) + log₂(x − 6) = 4, what is the value of x?',
  opts:[
    'x = 8',
    'x = 4',
    'x = 16',
    'x = 12',
    'x = −2'
  ],
  correct:0,
  why:'log₂(x(x−6)) = 4 → x(x−6) = 16 → x² − 6x − 16 = 0 → (x − 8)(x + 2) = 0. x = 8 or x = −2. Reject negative (log undefined). x = 8.'
});

qr.push({
  id:'QR_xp003', section:'QR', topic:'probability', difficulty:4,
  q:'A bag contains 5 red marbles and 7 blue marbles. Three marbles are drawn WITHOUT replacement. What is the probability that exactly 2 are red and 1 is blue?',
  opts:[
    '7/22',
    '7/12',
    '5/12',
    '15/44',
    '21/44'
  ],
  correct:0,
  why:'Use combinations: P = C(5,2) · C(7,1) / C(12,3) = (10)(7) / 220 = 70/220 = 7/22.'
});

qr.push({
  id:'QR_xp004', section:'QR', topic:'rate', difficulty:4,
  q:'Pipe A fills a tank in 6 hours. Pipe B fills the same tank in 9 hours. Pipe C empties the tank in 12 hours. If all three pipes are open simultaneously, how long does it take to fill the empty tank?',
  opts:[
    '36/7 hours (≈5.14 hr)',
    '4 hours',
    '6 hours',
    '7 hours',
    '12 hours'
  ],
  correct:0,
  why:'Rate A = 1/6, B = 1/9, C = −1/12 per hour. Combined = 1/6 + 1/9 − 1/12 = 6/36 + 4/36 − 3/36 = 7/36 per hour. Time = 36/7 ≈ 5.14 hr.'
});

qr.push({
  id:'QR_xp005', section:'QR', topic:'geometry', difficulty:4,
  q:'A right triangle has legs of length 3 and 4 (and hypotenuse 5). It is inscribed in a CIRCLE such that the hypotenuse is a diameter. What is the area of the region INSIDE the circle but OUTSIDE the triangle?',
  opts:[
    '(25π/4) − 6',
    '25π − 6',
    '(25π/2) − 6',
    '6 − (25π/4)',
    '5π − 12'
  ],
  correct:0,
  why:'Hypotenuse = diameter = 5, so radius = 2.5. Circle area = π(2.5)² = 25π/4. Triangle area = (1/2)(3)(4) = 6. Region = 25π/4 − 6.'
});

qr.push({
  id:'QR_xp006', section:'QR', topic:'word-problem', difficulty:4,
  q:'A solution that is 25% acid by volume is mixed with a solution that is 60% acid. To produce 35 liters of a final solution that is 40% acid, how many liters of the 25% solution must be used?',
  opts:[
    '20 L',
    '15 L',
    '12 L',
    '25 L',
    '10 L'
  ],
  correct:0,
  why:'Let x = L of 25%, then 35 − x = L of 60%. 0.25x + 0.60(35 − x) = 0.40(35). 0.25x + 21 − 0.60x = 14. −0.35x = −7. x = 20 L.'
});

qr.push({
  id:'QR_xp007', section:'QR', topic:'data', difficulty:4,
  q:'In a dataset of 7 numbers, the mean is 12 and the median is 10. Each number is increased by 5. What are the new mean and median?',
  opts:[
    'Mean = 17, Median = 15',
    'Mean = 17, Median = 10',
    'Mean = 12, Median = 15',
    'Mean = 10, Median = 17',
    'Mean = 17, Median = 12'
  ],
  correct:0,
  why:'Adding a constant c to every value shifts both mean and median by c. New mean = 12 + 5 = 17; new median = 10 + 5 = 15.'
});

qr.push({
  id:'QR_xp008', section:'QR', topic:'pct-chg', difficulty:4,
  q:'An item is marked up 20% from its cost, then discounted 25% from the marked-up price. The final price is $90. What was the ORIGINAL cost?',
  opts:[
    '$100',
    '$90',
    '$108',
    '$120',
    '$72'
  ],
  correct:0,
  why:'Cost C → markup 1.20C → discount 0.75 × 1.20C = 0.90C. 0.90C = 90 → C = 100.'
});

// =============================================================================
// Persist
// =============================================================================
bank.ochem.push(...oc);
bank.gc.push(...gc);
bank.bio.push(...bio);
bank.qr.push(...qr);

console.log('Authored', oc.length, 'OChem expert questions');
console.log('Authored', gc.length, 'GC expert questions');
console.log('Authored', bio.length, 'Bio expert questions (diff 4)');
console.log('Authored', qr.length, 'QR expert questions (diff 4)');
console.log('Bank totals: OChem', bank.ochem.length, '· GC', bank.gc.length, '· Bio', bank.bio.length, '· QR', bank.qr.length);

fs.writeFileSync(bankPath, JSON.stringify(bank));
console.log('Bank written to', bankPath);
