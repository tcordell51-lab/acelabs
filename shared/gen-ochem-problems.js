/* Ace Labs OChem Problem Generator
   Templated MCQ generator producing ~250 problems across DAT OChem topics
   at difficulty 1-4. Output is a JSON array writable to disk.
   Run: node shared/gen-ochem-problems.js > shared/ochem-problems.json
*/

let _id = 1;
const ID = (pre) => pre + String(_id++).padStart(3,'0');
const ri = (lo, hi) => Math.floor(Math.random()*(hi-lo+1))+lo;
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
const shuf = arr => arr.map(v=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(v=>v[1]);
const buildP = (skill, diff, q, correct, distractors, why, diag={}) => {
  const all = [correct, ...distractors].slice(0,4);
  const sh = shuf(all.map((v,i)=>({v,orig:i})));
  const cIdx = sh.findIndex(o=>o.orig===0);
  return {id: ID(skill.replace(/-/g,'').slice(0,3)), skill, diff, q, opts: sh.map(o=>o.v), correct: cIdx, why};
};

const GEN = {};

/* === Mechanism: SN1/SN2/E1/E2 === */
GEN['mech-sne'] = (diff) => {
  const tpls = [
    {q:'A primary alkyl halide reacts with a strong nucleophile (e.g., NaCN). Mechanism?', a:'SN2', d:['SN1','E1','E2'], w:'Primary substrate + strong nucleophile = SN2. SN1 needs a stable carbocation (3°/2°).'},
    {q:'A tertiary alkyl halide is heated in ethanol. Mechanism?', a:'E1 (with some SN1)', d:['SN2 only','E2 only','SN1 only'], w:'Tertiary + protic solvent + heat = E1 dominant; SN1 competes. SN2 blocked by sterics.'},
    {q:'A secondary substrate with a strong, bulky base (e.g., t-BuOK). Mechanism?', a:'E2 (Hofmann product)', d:['SN2','SN1','E1'], w:'Bulky base favors elimination over substitution; favors less-substituted alkene (Hofmann).'},
    {q:'A secondary substrate with NaOH in DMSO. Mechanism?', a:'SN2', d:['SN1','E1','E2 only'], w:'Polar aprotic solvent + strong nucleophile = SN2 favored.'},
    {q:'A tertiary substrate with weak nucleophile in polar protic solvent. Mechanism?', a:'SN1', d:['SN2','E2','none'], w:'Tertiary + protic solvent + weak nuc = SN1. Stable carbocation, solvent stabilizes.'},
    {q:'SN2 reaction stereochemistry at the reactive center?', a:'Inversion (Walden)', d:['Retention','Racemization','No change'], w:'SN2 backside attack → inversion of configuration.'},
    {q:'SN1 reaction stereochemistry at the reactive center?', a:'Racemization (mixture)', d:['Inversion','Retention','No change'], w:'Carbocation is planar; nucleophile attacks both faces → racemic mix.'},
    {q:'Rate-limiting step of SN2?', a:'One concerted step (bimolecular)', d:['Carbocation formation','Loss of H','Two-step ionization'], w:'SN2 is concerted: rate = k[sub][nuc]. Bimolecular.'},
    {q:'Rate-limiting step of SN1?', a:'Loss of leaving group (carbocation formation)', d:['Nucleophile attack','Concerted','H abstraction'], w:'SN1 is unimolecular: rate = k[sub]. Slow ionization, then fast attack.'},
    {q:'E2 vs E1: which requires base in the rate equation?', a:'E2', d:['E1','Both','Neither'], w:'E2 is bimolecular (concerted, anti-periplanar). E1 is unimolecular (carbocation first).'}
  ];
  const t = pick(tpls);
  return buildP('mech-sne', diff, t.q, t.a, t.d, t.w);
};

/* === Stereochemistry: R/S === */
GEN['stereo-rs'] = (diff) => {
  const tpls = [
    {q:'Priority of -OH vs -NH2 vs -CH3 vs -H?', a:'OH > NH2 > CH3 > H', d:['NH2 > OH > CH3 > H','OH > CH3 > NH2 > H','H > CH3 > NH2 > OH'], w:'CIP priority by atomic number: O(8) > N(7) > C(6) > H(1).'},
    {q:'A chiral carbon with priorities 1→2→3 going clockwise (lowest priority pointing away). Configuration?', a:'R', d:['S','meso','no chirality'], w:'Clockwise with lowest pointing back = R (rectus).'},
    {q:'A chiral carbon with priorities 1→2→3 counterclockwise (lowest priority pointing away). Configuration?', a:'S', d:['R','meso','no chirality'], w:'Counterclockwise with lowest pointing back = S (sinister).'},
    {q:'Lowest priority is pointing TOWARD you. The visible 1→2→3 sweeps clockwise. True configuration?', a:'S (flip)', d:['R','no chirality','meso'], w:'When low priority points TOWARD you, flip the visual answer.'},
    {q:'How many stereocenters in (2R, 3S)-2,3-dibromobutane?', a:'2', d:['1','0','4'], w:'Both C2 and C3 have four different groups → 2 stereocenters.'},
    {q:'Compound has internal mirror plane and 2 stereocenters. What is it?', a:'Meso compound', d:['Enantiomer','Diastereomer','Racemic'], w:'Meso: stereocenters with internal symmetry → achiral overall despite chiral centers.'}
  ];
  const t = pick(tpls);
  return buildP('stereo-rs', diff, t.q, t.a, t.d, t.w);
};

/* === Alkenes: Markovnikov + Hydroboration + Oxidation === */
GEN['alkene-add'] = (diff) => {
  const tpls = [
    {q:'Propene + HBr (no peroxides). Major product?', a:'2-bromopropane (Markovnikov)', d:['1-bromopropane','3-bromopropane','propane'], w:'Markovnikov: H to less-substituted C, Br to more-substituted C (forms more stable carbocation).'},
    {q:'Propene + HBr + peroxides. Major product?', a:'1-bromopropane (anti-Markovnikov)', d:['2-bromopropane','propane','propanol'], w:'Peroxides → radical mechanism → anti-Markovnikov (only with HBr).'},
    {q:'Propene + BH3 then H2O2/OH-. Major product?', a:'1-propanol (anti-Markovnikov, syn)', d:['2-propanol','propane','propanal'], w:'Hydroboration-oxidation = anti-Markovnikov hydration with syn addition.'},
    {q:'Propene + H2O / H+. Major product?', a:'2-propanol (Markovnikov)', d:['1-propanol','propane','propanal'], w:'Acid-catalyzed hydration follows Markovnikov: OH to more-substituted C.'},
    {q:'Propene + cold dilute KMnO4. Major product?', a:'1,2-propanediol (syn diol)', d:['Propanal','Propanoic acid','Propane'], w:'Cold dilute KMnO4 = syn dihydroxylation. Hot KMnO4 cleaves to ketones/acids.'},
    {q:'Cyclohexene + O3 then Zn/H2O. Major product?', a:'Hexanedial (open-chain dialdehyde)', d:['Cyclohexanol','Hexanoic acid','Cyclohexanone'], w:'Ozonolysis with reductive workup (Zn/H2O or Me2S) gives aldehydes/ketones, not acids.'},
    {q:'Propene + Br2 in CCl4. Major product?', a:'1,2-dibromopropane (anti-addition)', d:['1,1-dibromopropane','2,2-dibromopropane','3-bromopropene'], w:'Bromonium ion intermediate forces anti-addition.'},
    {q:'Propene + H2 / Pd-C. Product?', a:'Propane', d:['1-propanol','propanal','propanoic acid'], w:'Catalytic hydrogenation: syn addition of H-H across the alkene.'}
  ];
  const t = pick(tpls);
  return buildP('alkene-add', diff, t.q, t.a, t.d, t.w);
};

/* === Alkynes === */
GEN['alkyne'] = (diff) => {
  const tpls = [
    {q:'2-Butyne + H2 / Lindlar. Product geometry?', a:'cis-2-butene', d:['trans-2-butene','butane','1-butene'], w:'Lindlar (poisoned Pd) stops at cis-alkene (syn addition, partial reduction).'},
    {q:'2-Butyne + Na / NH3 (l). Product geometry?', a:'trans-2-butene', d:['cis-2-butene','butane','1-butene'], w:'Dissolving metal reduction = trans-alkene (anti, single-electron mechanism).'},
    {q:'Terminal alkyne (1-butyne) + NaNH2. Product?', a:'Acetylide anion (deprotonated)', d:['Vinyl anion','Allyl anion','No reaction'], w:'Terminal alkyne pKa ~25; NaNH2 (pKa NH3 ~38) deprotonates → acetylide.'},
    {q:'Acetylene + 2 HBr. Product?', a:'1,1-dibromoethane (geminal)', d:['1,2-dibromoethane','vinyl bromide','ethane'], w:'Markovnikov twice: both Hs go to terminal C, Br goes to interior C twice → geminal dibromide.'},
    {q:'1-Butyne + H2O / H2SO4 / HgSO4. Major product?', a:'2-butanone (methyl ketone)', d:['Butanal','1-butanol','2-butanol'], w:'Acid-catalyzed hydration of terminal alkyne → methyl ketone via enol tautomerization (Markovnikov).'}
  ];
  const t = pick(tpls);
  return buildP('alkyne', diff, t.q, t.a, t.d, t.w);
};

/* === Aromatics: EAS === */
GEN['arom-eas'] = (diff) => {
  const tpls = [
    {q:'Benzene + Br2 / FeBr3. Product?', a:'Bromobenzene', d:['1,2-dibromobenzene','1,2-dibromocyclohexane','benzyl bromide'], w:'EAS halogenation: Lewis acid activates Br2 to bromonium electrophile.'},
    {q:'Benzene + HNO3 / H2SO4. Product?', a:'Nitrobenzene', d:['Aniline','Nitrocyclohexane','Benzoic acid'], w:'Nitration: H2SO4 generates NO2+ (nitronium) electrophile.'},
    {q:'Toluene + Br2 / FeBr3. Major product?', a:'p-bromotoluene (with some o-)', d:['m-bromotoluene','benzyl bromide','m-cresol'], w:'-CH3 is an ortho/para director (alkyl group, weak activator).'},
    {q:'Nitrobenzene + Br2 / FeBr3. Major product?', a:'m-bromonitrobenzene', d:['p-bromonitrobenzene','o-bromonitrobenzene','no reaction'], w:'-NO2 is a meta director (deactivator).'},
    {q:'Activator (ortho/para directors) examples?', a:'-OH, -NH2, -OR, -NHR, alkyl', d:['-NO2, -SO3H, -CN','-COOH, -CHO, -NO2','-Br, -Cl, -F'], w:'Lone-pair donors and alkyl groups activate AND direct ortho/para.'},
    {q:'Halogens (-Cl, -Br, -F) on benzene are unique because...', a:'Deactivating BUT ortho/para directing', d:['Activating, meta directing','Deactivating, meta directing','Activating, ortho/para'], w:'Inductively withdraw (deactivate) but resonance donates lone pair (o/p direct).'},
    {q:'Friedel-Crafts alkylation cannot use what substrate?', a:'Strongly deactivated rings (e.g., nitrobenzene)', d:['Benzene','Toluene','Anisole'], w:'F-C requires sufficient ring electron density. Nitro-substituted rings won\'t react.'}
  ];
  const t = pick(tpls);
  return buildP('arom-eas', diff, t.q, t.a, t.d, t.w);
};

/* === Alcohols / Ethers / Epoxides === */
GEN['alc-eth'] = (diff) => {
  const tpls = [
    {q:'1-Propanol + PCC. Product?', a:'Propanal (aldehyde, no over-oxidation)', d:['Propanoic acid','2-propanol','propene'], w:'PCC = mild oxidation: 1° alcohol → aldehyde (stops there).'},
    {q:'1-Propanol + Jones reagent (CrO3/H2SO4). Product?', a:'Propanoic acid', d:['Propanal','Acetone','2-propanol'], w:'Jones is harsh oxidation: 1° alcohol → carboxylic acid.'},
    {q:'2-Propanol + PCC or Jones. Product?', a:'Acetone (ketone)', d:['Propanoic acid','Propane','Propanal'], w:'2° alcohols stop at ketone (no further oxidation possible).'},
    {q:'tert-Butanol with conc. H2SO4 + heat. Product?', a:'Isobutylene (alkene via dehydration)', d:['tert-Butyl ether','2-butanone','tert-butyl chloride'], w:'Acid + heat = E1 dehydration; tertiary substrate is fast.'},
    {q:'Williamson ether synthesis preferred starting material?', a:'Primary alkyl halide + alkoxide', d:['Tertiary alkyl halide + alcohol','Secondary halide + acid','Aldehyde + alcohol'], w:'SN2-based; works only on 1° (sometimes 2°) substrate. Tertiary fails (E2 instead).'},
    {q:'Epoxide + HBr. Where does Br go?', a:'More-substituted carbon (acid-catalyzed)', d:['Less-substituted carbon','Both equally','No reaction'], w:'Acid opens epoxide via SN1-like at the more substituted C. Base/nucleophile alone opens at less-substituted (SN2).'},
    {q:'Epoxide + NaOMe (base). Where does OMe attack?', a:'Less-substituted carbon (SN2)', d:['More-substituted carbon','Both equally','No reaction'], w:'Strong base/nucleophile = SN2 at less-hindered C.'}
  ];
  const t = pick(tpls);
  return buildP('alc-eth', diff, t.q, t.a, t.d, t.w);
};

/* === Carbonyls === */
GEN['carbonyl'] = (diff) => {
  const tpls = [
    {q:'Aldehyde + Grignard reagent (RMgBr) then H2O. Product?', a:'2° alcohol', d:['1° alcohol','3° alcohol','ketone'], w:'Grignard adds R- to carbonyl C → after workup, secondary alcohol from aldehyde.'},
    {q:'Ketone + Grignard then H2O. Product?', a:'3° alcohol', d:['1° alcohol','2° alcohol','aldehyde'], w:'Ketone + Grignard → tertiary alcohol (3 R groups on the carbon).'},
    {q:'Formaldehyde + Grignard then H2O. Product?', a:'1° alcohol', d:['2° alcohol','3° alcohol','aldehyde'], w:'Formaldehyde has 2 H\'s; one R group added → primary alcohol.'},
    {q:'Aldehyde + 2 equiv ethanol / H+. Product?', a:'Acetal', d:['Hemiacetal','Ester','Ether'], w:'1 equiv → hemiacetal; 2 equiv with acid → acetal (loss of water).'},
    {q:'Ketone + LiAlH4 then H2O. Product?', a:'2° alcohol', d:['1° alcohol','3° alcohol','aldehyde'], w:'LAH reduces ketone → 2° alcohol (and aldehyde → 1° alcohol).'},
    {q:'Aldol condensation between 2 acetone molecules (mild base)?', a:'Diacetone alcohol → mesityl oxide on dehydration', d:['Acetic acid','Methyl ester','Imine'], w:'Enolate of one ketone attacks carbonyl of another. Acid/heat dehydrates to α,β-unsaturated.'}
  ];
  const t = pick(tpls);
  return buildP('carbonyl', diff, t.q, t.a, t.d, t.w);
};

/* === Carboxylic acids and derivatives === */
GEN['acids'] = (diff) => {
  const tpls = [
    {q:'Carboxylic acid + alcohol + H+. Reaction name and product?', a:'Fischer esterification → ester + H2O', d:['Saponification → soap','Hydrolysis → acid','Aldol → β-hydroxy ester'], w:'Acid-catalyzed; equilibrium driven by removing H2O or excess alcohol.'},
    {q:'Ester + NaOH (saponification). Products?', a:'Carboxylate salt + alcohol', d:['Acid + ester','Aldehyde + alcohol','Ester + water'], w:'Base hydrolysis is irreversible (deprotonates the acid product).'},
    {q:'Reactivity ladder of carboxylic acid derivatives (most → least reactive)?', a:'Acid chloride > anhydride > ester > amide', d:['Amide > ester > anhydride > acid chloride','Ester > acid chloride > amide > anhydride','Anhydride > amide > ester > acid chloride'], w:'Higher reactivity = better leaving group + less resonance donation from heteroatom.'},
    {q:'Acid chloride + amine. Product?', a:'Amide + HCl', d:['Ester','Anhydride','Acid'], w:'Nucleophilic acyl substitution: amine displaces Cl-. Cl- is a great leaving group.'},
    {q:'Why are carboxylic acids more acidic than alcohols?', a:'Conjugate base (carboxylate) is resonance-stabilized', d:['CH bond is weak','Inductive effect only','OH bond is stronger'], w:'Carboxylate negative charge spreads over 2 oxygens; alkoxide has localized charge.'}
  ];
  const t = pick(tpls);
  return buildP('acids', diff, t.q, t.a, t.d, t.w);
};

/* === Amines === */
GEN['amines'] = (diff) => {
  const tpls = [
    {q:'Order of basicity: 1°, 2°, 3° aliphatic amines vs. NH3?', a:'2° > 1° ≈ 3° > NH3 (in water; gas-phase: 3°>2°>1°)', d:['NH3 > 1° > 2° > 3°','3° > 2° > 1° > NH3 always','All equal'], w:'In water, solvation matters: 2° gives best balance of donation + solvation. Gas phase shows pure inductive trend: 3°>2°>1°.'},
    {q:'Aniline (PhNH2) is __ basic than methylamine (CH3NH2).', a:'Less', d:['More','Equally','Cannot compare'], w:'Aniline\'s lone pair is conjugated into the ring → less available for protonation.'},
    {q:'Hofmann elimination uses what conditions?', a:'Bulky base, gives less-substituted alkene', d:['Acid, gives Zaitsev','Heat alone, gives Zaitsev','SN2 conditions'], w:'Hofmann (with quaternary ammonium): bulky/excessive base picks accessible H → Hofmann (less substituted) alkene.'},
    {q:'Reductive amination of acetone + methylamine + NaBH3CN. Product?', a:'N-methyl-2-propanamine (secondary amine)', d:['Acetonitrile','Imine (no reduction)','Tertiary amine'], w:'Imine forms reversibly; NaBH3CN selectively reduces it (won\'t reduce ketone) → secondary amine.'}
  ];
  const t = pick(tpls);
  return buildP('amines', diff, t.q, t.a, t.d, t.w);
};

/* === Spectroscopy === */
GEN['spec-ir-nmr'] = (diff) => {
  const tpls = [
    {q:'IR peak at 1715 cm⁻¹ (sharp, strong). What functional group?', a:'C=O (ketone)', d:['O-H','N-H','C≡C'], w:'C=O stretch is ~1700-1750 cm⁻¹ depending on FG (acid ~1710, ester ~1740, amide ~1680).'},
    {q:'IR broad peak at 3200-3550 cm⁻¹. What FG?', a:'O-H (alcohol)', d:['C-H','C=O','C-N'], w:'Broad O-H from H-bonding (alcohols/water). Carboxylic acids: even broader, 2500-3300.'},
    {q:'In 1H NMR, what does a triplet (3H) coupled to a quartet (2H) typically indicate?', a:'Ethyl group (-CH2-CH3)', d:['Methyl ester (-OCH3)','Vinyl (CH=CH)','Phenyl (ArH)'], w:'-CH3 (3H, triplet from 2 neighbors) + -CH2- (2H, quartet from 3 neighbors) = ethyl pattern.'},
    {q:'Aromatic protons typical 1H NMR shift?', a:'6.5-8.5 ppm', d:['0-1 ppm','3-4 ppm','9-10 ppm'], w:'Aromatic ring current deshields → downfield (6.5-8.5). Above 9 = aldehyde.'},
    {q:'Carbonyl C in 13C NMR typically appears at?', a:'160-220 ppm (downfield)', d:['0-30 ppm','50-90 ppm','100-150 ppm'], w:'C=O is most deshielded carbon: aldehydes/ketones ~190-210, esters/acids ~165-180.'},
    {q:'Degrees of unsaturation formula for CxHy?', a:'(2x+2-y)/2', d:['Just count rings','x+y/2','y/x'], w:'Each ring or pi bond = 1 DoU. Add for N, subtract for halogens (extended formulas).'}
  ];
  const t = pick(tpls);
  return buildP('spec-ir-nmr', diff, t.q, t.a, t.d, t.w);
};

/* === Synthesis (multi-step) === */
GEN['synth'] = (diff) => {
  const tpls = [
    {q:'Convert 1-bromopropane to 1-propanol. Best one-step reagent?', a:'NaOH (aq) — SN2', d:['NaOMe','HCl','PCC'], w:'1° alkyl halide + hydroxide = SN2 substitution. Direct.'},
    {q:'Convert benzene to nitrobenzene. Reagents?', a:'HNO3 / H2SO4 (nitration)', d:['Br2/FeBr3','HCl/AlCl3','KMnO4'], w:'EAS with nitronium electrophile.'},
    {q:'Convert ethanol to ethyl chloride. Best reagent?', a:'SOCl2 (or HCl/ZnCl2)', d:['NaOH','PCC','LiAlH4'], w:'SOCl2 converts -OH to -Cl with retention of stereochemistry (clean).'},
    {q:'Convert propanal to 1-propanol. Reagent?', a:'NaBH4 (mild reduction)', d:['Jones','PCC','Br2'], w:'NaBH4 reduces aldehydes/ketones to alcohols. Selective (won\'t touch esters).'},
    {q:'Convert ethene to 1,2-ethanediol. Reagent?', a:'Cold dilute KMnO4 (or OsO4)', d:['Hot KMnO4','HBr','H2/Pd'], w:'Syn dihydroxylation. Hot KMnO4 cleaves the alkene further.'},
    {q:'Convert 1-butyne to 2-butanone. Reagents?', a:'H2O / H2SO4 / HgSO4 (Markovnikov hydration)', d:['Lindlar','Na/NH3','BH3'], w:'Acid-catalyzed hydration of terminal alkyne → methyl ketone (via enol tautomer).'},
    {q:'Convert acetylene to cis-2-butene. Reagents (multi-step)?', a:'1) NaNH2, then CH3I (×2). 2) H2 / Lindlar.', d:['Br2 then Zn','HBr (peroxides)','LiAlH4'], w:'Step 1 alkylates terminal alkyne to 2-butyne. Step 2 reduces to cis-alkene with Lindlar.'}
  ];
  const t = pick(tpls);
  return buildP('synth', diff, t.q, t.a, t.d, t.w);
};

/* === Lab techniques === */
GEN['lab'] = (diff) => {
  const tpls = [
    {q:'Best technique to separate two miscible liquids with different boiling points?', a:'Distillation (simple or fractional)', d:['Recrystallization','Chromatography','Filtration'], w:'BP difference > 25°C: simple distillation. Smaller difference: fractional column.'},
    {q:'Best technique to purify a solid based on solubility differences?', a:'Recrystallization', d:['Distillation','Chromatography','Centrifugation'], w:'Dissolve hot, cool slowly → pure crystals form preferentially.'},
    {q:'Best technique to separate compounds based on polarity?', a:'Column chromatography (silica + organic eluent)', d:['Distillation','Filtration','Decantation'], w:'Polar silica retains polar compounds longer; nonpolar compounds elute first.'},
    {q:'TLC: a compound traveled 4 cm; solvent traveled 8 cm. Rf?', a:'0.5', d:['2.0','4.0','0.25'], w:'Rf = distance compound / distance solvent = 4/8 = 0.5.'},
    {q:'Liquid-liquid extraction relies on what property?', a:'Differential solubility between two immiscible solvents', d:['Boiling point','Crystal lattice energy','Polarity of stationary phase'], w:'Compound partitions based on its solubility (Kd) in two phases (e.g., ether vs water).'},
    {q:'Acid-base extraction: how to remove a carboxylic acid from a neutral organic mixture?', a:'Wash with NaHCO3 (aq) — deprotonates only acid → goes to aqueous', d:['Wash with HCl','Wash with NaCl','Distill'], w:'Carboxylates are water-soluble; neutral organics stay in organic phase. Acidify aq. layer to recover.'}
  ];
  const t = pick(tpls);
  return buildP('lab', diff, t.q, t.a, t.d, t.w);
};

/* === Acid-base in OChem === */
GEN['ab-ochem'] = (diff) => {
  const tpls = [
    {q:'Most acidic H? Acetic acid, ethanol, ethane.', a:'Acetic acid (pKa ~5)', d:['Ethanol','Ethane','All equal'], w:'Carboxylic acid (pKa ~5) >> alcohol (~16) >> alkane (~50). Resonance stabilization of carboxylate.'},
    {q:'Why is HCl (pKa -7) more acidic than acetic acid (pKa 5)?', a:'Cl- is more stable conjugate base than acetate', d:['HCl is heavier','Acetic acid has H bonds','Cl is less electronegative'], w:'Charge density on Cl- (large atom) is more spread out than on acetate (still localized on O).'},
    {q:'Order of basicity: NH3, OH-, F-, alkyl?', a:'Alkyl > NH3 > OH- > F- (gas phase)', d:['F- > OH- > NH3 > alkyl','All equal','OH- > F- > NH3 > alkyl'], w:'Less electronegative atom holds the negative charge less well → higher basicity.'},
    {q:'Terminal alkyne pKa vs alkene pKa?', a:'~25 vs ~44 (alkyne more acidic)', d:['Both 50','Both 25','Alkene more acidic'], w:'sp C-H is more acidic than sp2 due to higher s-character → orbital closer to nucleus → more stable conjugate base.'},
    {q:'Benzoic acid + sodium hydroxide. Reaction?', a:'Forms sodium benzoate + water (acid-base)', d:['Forms ester','Forms ether','No reaction'], w:'Strong base deprotonates the carboxylic acid (pKa ~4.2 << pKa of water 15.7).'},
    {q:'Inductive effect: which is the strongest acid? Cl-CH2-COOH, F-CH2-COOH, Br-CH2-COOH, CH3-COOH', a:'F-CH2-COOH (most EW)', d:['Cl-CH2-COOH','Br-CH2-COOH','CH3-COOH'], w:'F is most electronegative → strongest -I effect → most stabilized carboxylate → strongest acid.'}
  ];
  const t = pick(tpls);
  return buildP('ab-ochem', diff, t.q, t.a, t.d, t.w);
};

/* === Plan ===
Per skill, total problems by difficulty (target ~250 total) */
const PLAN = {
  'mech-sne':[8,12,6,4],
  'stereo-rs':[6,8,5,3],
  'alkene-add':[8,10,6,4],
  'alkyne':[5,7,4,2],
  'arom-eas':[7,10,6,3],
  'alc-eth':[6,9,5,3],
  'carbonyl':[6,8,5,3],
  'acids':[5,7,4,2],
  'amines':[4,6,4,2],
  'spec-ir-nmr':[6,8,5,3],
  'synth':[6,8,5,3],
  'lab':[5,6,4,2],
  'ab-ochem':[5,7,4,2]
};

const out = [];
let total = 0;
for (const skill in PLAN){
  const counts = PLAN[skill];
  for (let d=1; d<=4; d++){
    const n = counts[d-1] || 0;
    for (let i=0; i<n; i++){
      try { out.push(GEN[skill](d)); total++; } catch(e){ console.error('FAIL', skill, d, e.message); }
    }
  }
}
console.error('Generated', total, 'OChem problems');
process.stdout.write(JSON.stringify(out, null, 2));
