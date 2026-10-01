// Curved arrows, both directions the 2026 spec asks: predict the product from the
// arrows (arrows-forward) and predict the arrows from the product (arrows-reverse).
// Every arrow set below is pushed for real by verify.py.
const L = r => ({ lp: r }), B = (a, b) => ({ bond: [a, b] }), At = r => ({ atom: r });
const A = (f, t) => ({ from: f, to: t });
const sp = (...s) => s.map(x => typeof x === 'string' ? { smi: x } : x);

function fwd(id, difficulty, roots, stem, species, arrows, choices, coach, why){
  return { id, type: 'arrows-forward', difficulty, roots, stem, fig: { kind: 'mech', species: sp(...species), arrows, hideProduct: true },
    choices: choices.map(([text, smiles]) => ({ text, smiles })), correct: 0, verify: { distinct: true }, coach, why };
}
function rev(id, difficulty, roots, stem, species, product, sets, coach, why){
  const S = sp(...species);
  return { id, type: 'arrows-reverse', difficulty, roots, stem, fig: { kind: 'mech', species: S, product: sp(...product) },
    choices: sets.map(arrows => ({ fig: { kind: 'mech', species: S, arrows } })), correct: 0, coach, why };
}
const FWD = 'Follow the curved arrows exactly as drawn. What do they make?';
const REV = 'Which set of curved arrows turns the starting species into the product shown?';

export default [
  /* ---------------- predict the product from the arrows ---------------- */
  fwd('af-01', 1, ['l2-arrows'], FWD, ['[C-]#N', 'CCCBr'],
    [A(L('0.0'), B('0.0', '1.2')), A(B('1.2', '1.3'), At('1.3'))],
    [['butanenitrile and bromide', 'CCCC#N.[Br-]'], ['propyl isocyanide and bromide', 'CCC[N+]#[C-].[Br-]'], ['propene, HCN and bromide', 'C=CC.C#N.[Br-]'], ['2-methylpropanenitrile and bromide', 'CC(C)C#N.[Br-]'], ['no change at all', 'CCCBr.[C-]#N']],
    'The tail is the carbon lone pair, so carbon, not nitrogen, makes the new bond to the carbon that held bromine.',
    'The lone pair on the cyanide carbon attacks the carbon bonded to bromine, and the C to Br bond electrons leave with bromine. Attack, kick it off, attach: one SN2 step gives butanenitrile and bromide. The isocyanide would need the arrow to start on nitrogen.'),

  fwd('af-02', 1, ['l2-arrows', 'l2-bully'], FWD, ['[H-]', 'CC(C)=O'],
    [A(L('0.0'), B('0.0', '1.1')), A(B('1.1', '1.3'), At('1.3'))],
    [['isopropoxide, the alkoxide', 'CC(C)[O-]'], ['2-propanol, neutral', 'CC(C)O'], ['an enolate plus hydrogen gas', 'C=C(C)[O-].[HH]'], ['a carbanion with H on oxygen', 'C[C-](C)O'], ['no change, the hydride stays free', 'CC(C)=O.[H-]']],
    'The hydride lands on the carbonyl carbon and the pi electrons go up onto oxygen, so oxygen ends with a negative charge.',
    'Rich attacks poor: the hydride attacks the partially positive carbonyl carbon and the pi bond swings onto the oxygen, the electron bully. That leaves an alkoxide, isopropoxide. 2-propanol only appears after a separate proton transfer, which is not drawn here.'),

  fwd('af-03', 1, ['l2-arrows', 'l2-bully'], FWD, ['[CH3-]', 'CC=O'],
    [A(L('0.0'), B('0.0', '1.1')), A(B('1.1', '1.2'), At('1.2'))],
    [['isopropoxide', 'CC(C)[O-]'], ['isopropyl alcohol', 'CC(C)O'], ['an enolate and methane', 'C=C[O-].C'], ['a methyl ether carbanion, attack at oxygen', 'C[CH-]OC'], ['no change', 'CC=O.[CH3-]']],
    'Methyl attacks the carbonyl carbon and the pi bond goes onto oxygen: the product still carries the negative charge, now on oxygen.',
    'The carbanion is the electron-rich partner and the carbonyl carbon is the electron-poor one. The new C to C bond forms and the pi electrons move onto oxygen, giving isopropoxide. Workup acid would make isopropyl alcohol, but no proton arrow is drawn.'),

  fwd('af-04', 2, ['l2-resonance'], 'The arrows move electrons within one species. Which drawing do they lead to?', ['[CH2-]C(C)=O'],
    [A(L('0.0'), B('0.0', '0.1')), A(B('0.1', '0.3'), At('0.3'))],
    [['the oxyanion form', 'C=C(C)[O-]'], ['the neutral enol', 'C=C(C)O'], ['acetone', 'CC(C)=O'], ['the same carbanion, unchanged', '[CH2-]C(C)=O'], ['a carbanion on the far methyl carbon', 'C=C([CH2-])O']],
    'In resonance only electrons move: the lone pair makes a C=C and the C=O pi electrons become a lone pair on oxygen.',
    'The carbanion lone pair becomes a new pi bond between the two carbons, and the carbonyl pi bond moves onto oxygen. Same atoms, same connections, new electron address: the oxyanion form of the enolate. No hydrogen moved, so the enol and acetone are out.'),

  fwd('af-05', 2, ['l2-resonance', 'l2-carbocation'], 'The arrow moves electrons within one species. Which drawing does it lead to?', ['CC=C[CH2+]'],
    [A(B('0.1', '0.2'), B('0.2', '0.3'))],
    [['a secondary allylic cation', 'C[CH+]C=C'], ['the same primary cation', 'CC=C[CH2+]'], ['a vinylic cation', 'CC[C+]=C'], ['a primary cation, double bond moved down the chain', '[CH2+]CC=C'], ['an allyl anion', 'C[CH-]C=C']],
    'The pi bond swings toward the plus, so the double bond moves over one and the plus lands where the pi bond used to start.',
    'The pi electrons slide toward the empty orbital, making a new double bond to the end carbon. The carbon that gave up its pi electrons is now the electron-poor one, so the plus sits on the secondary carbon. It is the same ion, drawn the other way, and the secondary form is the bigger resonance contributor.'),

  fwd('af-06', 1, ['l2-acidity', 'l2-arrows'], FWD, ['[OH-]', 'CC(=O)O[H]'],
    [A(L('0.0'), B('0.0', '1.4')), A(B('1.3', '1.4'), At('1.3'))],
    [['acetate ion and a water molecule', 'CC(=O)[O-].O'], ['acetic acid and hydroxide, unchanged', 'CC(=O)O.[OH-]'], ['a tetrahedral addition product', 'CC(O)(O)[O-]'], ['a carbanion next to the carbonyl, and water', '[CH2-]C(=O)O.O'], ['peracetic acid and hydride', 'CC(=O)OO.[H-]']],
    'The base grabs the H, and the O to H bond electrons stay on oxygen: that is a proton transfer.',
    'Hydroxide uses a lone pair to grab the acidic hydrogen, and the old O to H bond electrons become a lone pair on oxygen. The acid becomes acetate and the base becomes water. The arrows touch the hydrogen, not the carbonyl carbon, so no addition happens.'),

  fwd('af-07', 2, ['l2-acidity'], FWD, ['CC(C)(C)[O-]', '[H]SCC'],
    [A(L('0.4'), B('0.4', '1.0')), A(B('1.0', '1.1'), At('1.1'))],
    [['ethanethiolate and tert-butanol', 'CC[S-].CC(C)(C)O'], ['ethyl tert-butyl sulfide and hydroxide', 'CCSC(C)(C)C.[OH-]'], ['ethanethiol and tert-butoxide, unchanged', 'CCS.CC(C)(C)[O-]'], ['a carbanion beside sulfur, and tert-butanol', 'C[CH-]S.CC(C)(C)O'], ['ethylene, H2S and tert-butoxide', 'C=C.S.CC(C)(C)[O-]']],
    'The arrow lands on the hydrogen of the S to H bond, so it is a proton transfer that makes the thiolate.',
    'tert-Butoxide pulls the S to H proton off ethanethiol and the bond electrons stay on sulfur. A thiol (pKa about 10) is a far stronger acid than tert-butanol (about 18), because the big sulfur atom spreads the negative charge. Nothing touches carbon.'),

  fwd('af-08', 1, ['l2-carbocation'], FWD, ['CC(C)(C)Br'],
    [A(B('0.1', '0.4'), At('0.4'))],
    [['tert-butyl cation and bromide', 'C[C+](C)C.[Br-]'], ['tert-butyl carbanion and Br+', 'C[C-](C)C.[Br+]'], ['isobutylene and HBr', 'C=C(C)C.Br'], ['a tert-butyl radical and a bromine atom', 'C[C](C)C.[Br]'], ['a primary cation and bromide', '[CH2+]C(C)C.[Br-]']],
    'Both electrons of the C to Br bond go with bromine, so bromine leaves as bromide and carbon is left electron poor.',
    'A full arrow moves two electrons. Here the whole C to Br bond leaves on bromine, the electronegative atom, so bromine becomes bromide and the carbon is left with an empty orbital: the tertiary carbocation, step one of SN1 and E1. Splitting the bond one electron each way would need two fishhooks.'),

  fwd('af-09', 1, ['l2-carbocation'], FWD, ['O', 'C[C+](C)C'],
    [A(L('0.0'), B('0.0', '1.1'))],
    [['a protonated tert-butanol', 'CC(C)(C)[OH2+]'], ['tert-butanol, neutral', 'CC(C)(C)O'], ['isobutylene and hydronium', 'C=C(C)C.[OH3+]'], ['tert-butoxide', 'CC(C)(C)[O-]'], ['no change, water just sits there', 'C[C+](C)C.O']],
    'Water gives a lone pair to the plus carbon, so oxygen now has three bonds and carries the plus.',
    'The water lone pair attacks the empty orbital of the cation. Oxygen ends with three bonds and one lone pair, so it holds the positive charge: an oxonium ion. Losing that proton to a second water is a separate arrow, so neutral tert-butanol is one step later.'),

  fwd('af-10', 2, ['l2-carbocation', 'l2-arrows'], FWD, ['O', '[H]C[C+](C)C'],
    [A(L('0.0'), B('0.0', '1.0')), A(B('1.0', '1.1'), B('1.1', '1.2'))],
    [['isobutylene and hydronium', 'C=C(C)C.[OH3+]'], ['the oxonium ion, water adds', 'CC(C)(C)[OH2+]'], ['isobutylene and water, no charge anywhere', 'C=C(C)C.O'], ['isobutylene and hydroxide', 'C=C(C)C.[OH-]'], ['no change', 'C[C+](C)C.O']],
    'Water takes the beta H, and that C to H bond swings in to fill the empty orbital as the new pi bond.',
    'This is the E1 finish. Water pulls off a hydrogen on the carbon next to the plus, and the C to H bond electrons become the pi bond of the alkene. The charge does not vanish: the proton now sits on water, as hydronium.'),

  fwd('af-11', 3, ['l2-arrows', 'l3-newman'], FWD, ['CC[O-]', '[H]C(C)C(C)(C)Br'],
    [A(L('0.2'), B('0.2', '1.0')), A(B('1.0', '1.1'), B('1.1', '1.3')), A(B('1.3', '1.6'), At('1.6'))],
    [['2-methyl-2-butene, trisubstituted', 'CC=C(C)C.CCO.[Br-]'], ['2-methyl-1-butene', 'C=C(C)CC.CCO.[Br-]'], ['an ethyl tert-pentyl ether', 'CCOC(C)(C)CC.[Br-]'], ['a carbocation with no alkene yet', 'CC[C+](C)C.CC[O-].[Br-]'], ['no reaction, both partners untouched', 'CCC(C)(C)Br.CC[O-]']],
    'Three arrows, one step: base takes the H, the C to H bond becomes the pi bond, and the C to Br bond leaves. The H that was taken decides where the double bond goes.',
    'Ethoxide takes the hydrogen on the CH carbon, those bond electrons form the pi bond toward the carbon holding bromine, and bromide leaves, all at once: E2. Because the drawn hydrogen is on the internal carbon, the double bond lands between the internal carbons, giving 2-methyl-2-butene (with ethanol and bromide).'),

  fwd('af-12', 2, ['l2-carbocation'], FWD, ['C=CC', '[H]Br'],
    [A(B('0.0', '0.1'), B('0.0', '1.0')), A(B('1.0', '1.1'), At('1.1'))],
    [['2-propyl cation and bromide', 'C[CH+]C.[Br-]'], ['a primary cation and bromide', '[CH2+]CC.[Br-]'], ['2-bromopropane already', 'CC(C)Br'], ['1-bromopropane', 'BrCCC'], ['a carbanion and Br+', 'C[CH-]C.[Br+]']],
    'The pi bond grabs the H and puts it on the end carbon, so the empty orbital is left on the middle carbon.',
    'The pi electrons attack the hydrogen of HBr and the H to Br bond leaves on bromine. The new C to H bond is to the end carbon, so the middle carbon loses its share of the pi bond and becomes the secondary cation, the Markovnikov one. Bromide has not attacked yet; that is the next arrow.'),

  fwd('af-13', 1, ['l2-carbocation'], FWD, ['[Br-]', 'C[CH+]C'],
    [A(L('0.0'), B('0.0', '1.1'))],
    [['2-bromopropane', 'CC(C)Br'], ['1-bromopropane', 'CCCBr'], ['propene and HBr', 'C=CC.Br'], ['a carbanion and Br+', 'C[CH-]C.[Br+]'], ['cyclopropane and HBr', 'C1CC1.Br']],
    'Bromide gives a lone pair to the plus carbon, the middle one, so bromine ends up on carbon two.',
    'Rich attacks poor: bromide donates a lone pair into the empty orbital on the middle carbon. The new C to Br bond is on carbon two, so the product is 2-bromopropane and nothing is left charged.'),

  fwd('af-14', 2, ['l2-carbocation'], FWD, ['C[CH+]C([H])(C)C'],
    [A(B('0.2', '0.3'), B('0.1', '0.3'))],
    [['a tertiary cation', 'CC[C+](C)C'], ['the same secondary cation', 'C[CH+]C(C)C'], ['a primary cation', '[CH2+]C(C)CC'], ['an alkene and H+', 'CC=C(C)C.[H+]'], ['a tertiary carbanion', 'CC[C-](C)C']],
    'The H moves with its bond electrons to the plus carbon, so the plus moves to the carbon the H just left.',
    'This is a 1,2-hydride shift. The C to H bond electrons, hydrogen and all, slide over to the empty orbital next door. The carbon that lost the hydrogen lost a bond, so it now carries the plus, and it is tertiary: more neighbors helping lift the couch.'),

  fwd('af-15', 3, ['l2-carbocation'], FWD, ['C[CH+]C(C)(C)C'],
    [A(B('0.2', '0.3'), B('0.1', '0.3'))],
    [['a tertiary cation', 'CC(C)[C+](C)C'], ['the same secondary cation', 'C[CH+]C(C)(C)C'], ['a primary cation', '[CH2+]C(C)C(C)C'], ['an alkene and H+', 'CC(C)=C(C)C.[H+]'], ['a tertiary carbanion', 'CC(C)[C-](C)C']],
    'A methyl shifts with its bond electrons to the plus carbon, so the plus moves to the carbon it left, which now has three carbon neighbors.',
    'There is no hydrogen on the carbon next door, so a methyl group moves instead: a 1,2-methyl shift. The methyl takes its bond electrons to the empty orbital, and the carbon it left becomes the plus, now with three carbon neighbors. Same idea as a hydride shift, a heavier traveler.'),

  fwd('af-16', 2, ['l2-arrows', 'l2-bully'], FWD, ['C[O-]', 'CC(=O)Cl'],
    [A(L('0.1'), B('0.1', '1.1')), A(B('1.1', '1.2'), At('1.2'))],
    [['the tetrahedral intermediate', 'COC(C)([O-])Cl'], ['methyl acetate and chloride', 'COC(C)=O.[Cl-]'], ['the same intermediate, but neutral', 'COC(C)(O)Cl'], ['a carbanion beside the carbonyl, plus methanol', '[CH2-]C(=O)Cl.CO'], ['no change', 'CC(=O)Cl.C[O-]']],
    'Two arrows: attack the carbonyl carbon and push the pi bond onto oxygen. Chloride has not left yet.',
    'Methoxide attacks the carbonyl carbon and the pi bond moves onto oxygen, giving the tetrahedral intermediate with chloride still attached. Collapse and loss of chloride is a second step with its own arrows, so methyl acetate is not what these two arrows make.'),

  fwd('af-17', 2, ['l2-arrows'], FWD, ['COC(C)([O-])Cl'],
    [A(L('0.4'), B('0.4', '0.2')), A(B('0.2', '0.5'), At('0.5'))],
    [['methyl acetate and chloride', 'COC(C)=O.[Cl-]'], ['acetyl chloride and methoxide', 'CC(=O)Cl.C[O-]'], ['methyl chloroformate and a methyl anion', 'COC(=O)Cl.[CH3-]'], ['methyl acetate and HCl', 'COC(C)=O.Cl'], ['no change', 'COC(C)([O-])Cl']],
    'The oxygen lone pair rebuilds the C=O and the bond to chlorine is the one that breaks.',
    'The negative oxygen pushes a lone pair back down to remake the carbonyl. Carbon cannot hold five bonds, so one bond must leave, and the arrow picks the C to Cl bond. Chloride, the best leaving group, departs and the ester remains. Kicking out methoxide would need the second arrow on the C to O bond instead.'),

  fwd('af-18', 3, ['l2-acidity', 'l2-resonance'], FWD, ['CC(C)[N-]C(C)C', '[H]CC(C)=O'],
    [A(L('0.3'), B('0.3', '1.0')), A(B('1.0', '1.1'), B('1.1', '1.2')), A(B('1.2', '1.4'), At('1.4'))],
    [['enolate and the amine', 'C=C(C)[O-].CC(C)NC(C)C'], ['the amide added to the carbonyl', 'CC(C)N(C(C)C)C(C)(C)[O-]'], ['the enol, base unchanged', 'C=C(C)O.CC(C)[N-]C(C)C'], ['the enol and the amine', 'C=C(C)O.CC(C)NC(C)C'], ['no change', 'CC(C)=O.CC(C)[N-]C(C)C']],
    'The base takes the alpha H, the C to H electrons become the C=C, and the C=O pi electrons go onto oxygen.',
    'LDA, drawn as its nitrogen anion, grabs an alpha hydrogen. Those bond electrons form a C=C and the carbonyl pi bond moves onto oxygen, giving the enolate and neutral diisopropylamine. LDA is bulky, so it takes a proton instead of adding to the carbonyl.'),

  fwd('af-19', 3, ['l2-arrows', 'l1-unsat'], 'Cyclopentadiene and ethylene react as drawn. What do the arrows make?', ['C1=CC=CC1', 'C=C'],
    [A(B('0.2', '0.3'), B('0.3', '1.0')), A(B('1.0', '1.1'), B('1.1', '0.0')), A(B('0.0', '0.1'), B('0.1', '0.2'))],
    [['norbornene', 'C1CC2C=CC1C2'], ['norbornane', 'C1CC2CCC1C2'], ['norbornadiene', 'C1=CC2C=CC1C2'], ['3-vinylcyclopentene', 'C=CC1C=CCC1'], ['no change, both alkenes survive', 'C1=CC=CC1.C=C']],
    'Three arrows in a circle: two new sigma bonds to the ends of the diene and one new pi bond in the middle.',
    'Each arrow moves a pi bond one position around the ring of six atoms. The diene ends bond to the two ethylene carbons, and the old diene middle becomes the one remaining double bond. Cyclopentadiene is locked s-cis, so it makes the bicyclic norbornene in one concerted step.'),

  fwd('af-20', 3, ['l2-arrows'], FWD, ['C[O-]', 'CC1CO1'],
    [A(L('0.1'), B('0.1', '1.2')), A(B('1.2', '1.3'), At('1.3'))],
    [['the alkoxide with methoxy on the end carbon', 'COCC(C)[O-]'], ['the alkoxide with methoxy on the inner carbon', 'COC(C)C[O-]'], ['1-methoxy-2-propanol, neutral', 'COCC(C)O'], ['propane-1,2-diol', 'CC(O)CO'], ['no change', 'CC1CO1.C[O-]']],
    'The arrow lands on the CH2 carbon, so methoxy goes on the end and the ring oxygen keeps the charge.',
    'Under basic conditions the nucleophile hits the less hindered epoxide carbon, the CH2, in an SN2. The C to O ring bond breaks onto oxygen, which ends as an alkoxide on the inner carbon. The neutral alcohol only appears after a later proton transfer.'),

  fwd('af-21', 1, ['l2-arrows'], FWD, ['CC(C)=O', '[H][OH2+]'],
    [A(L('0.3'), B('0.3', '1.0')), A(B('1.0', '1.1'), At('1.1'))],
    [['protonated acetone and water', 'CC(C)=[OH+].O'], ['acetone and hydronium, unchanged', 'CC(C)=O.[OH3+]'], ['acetone hydrate and H+', 'CC(C)(O)O.[H+]'], ['protonated acetone and hydroxide', 'CC(C)=[OH+].[OH-]'], ['the enol and hydronium', 'C=C(C)O.[OH3+]']],
    'The carbonyl oxygen uses a lone pair to take the proton; the plus moves from hydronium to the carbonyl oxygen.',
    'The carbonyl oxygen lone pair grabs a proton from hydronium, and the O to H bond electrons stay on water. Now the carbonyl oxygen has three bonds and the plus, which makes the carbonyl carbon even more electron poor. This is the usual first arrow of acid catalysis.'),

  fwd('af-22', 2, ['l2-arrows', 'l2-bully'], FWD, ['[C-]#N', 'CCC=O'],
    [A(L('0.0'), B('0.0', '1.2')), A(B('1.2', '1.3'), At('1.3'))],
    [['the cyanohydrin alkoxide', 'CCC([O-])C#N'], ['the cyanohydrin, neutral', 'CCC(O)C#N'], ['the isocyanide adduct, nitrogen attacking', '[C-]#[N+]C([O-])CC'], ['a carbanion with cyanide on oxygen', 'N#CO[CH-]CC'], ['no change', 'CCC=O.[C-]#N']],
    'Cyanide carbon attacks the carbonyl carbon; the pi bond goes onto oxygen, which keeps the negative charge for now.',
    'The cyanide carbon lone pair attacks the aldehyde carbon and the C=O pi electrons move onto oxygen. That is the alkoxide of the cyanohydrin. Protonation to the neutral cyanohydrin is a separate proton transfer that is not drawn.'),

  fwd('af-23', 2, ['l2-arrows'], FWD, ['CC[O-]', 'CI'],
    [A(L('0.2'), B('0.2', '1.0')), A(B('1.0', '1.1'), At('1.1'))],
    [['ethyl methyl ether and iodide', 'CCOC.[I-]'], ['ethyl methyl ether and HI', 'CCOC.I'], ['ethyl hypoiodite and a methyl anion', 'CCOI.[CH3-]'], ['ethanol and a CH2I carbanion', 'CCO.[CH2-]I'], ['no change, the two just meet', 'CC[O-].CI']],
    'Oxygen attacks the methyl carbon and the C to I bond leaves on iodine: one SN2 step.',
    'Ethoxide is the nucleophile and methyl iodide is the unhindered electrophile. The O to C bond forms as the C to I bond breaks onto iodine, so the products are ethyl methyl ether and iodide: the Williamson ether synthesis.'),

  fwd('af-24', 2, ['l2-resonance'], 'The arrow moves electrons within one species. Which drawing does it lead to?', ['CO[CH2+]'],
    [A(L('0.1'), B('0.1', '0.2'))],
    [['an oxocarbenium ion', 'C=[O+]C'], ['the same carbocation, unchanged', 'CO[CH2+]'], ['a carbanion beside oxygen', 'CO[CH2-]'], ['dimethyl ether', 'COC'], ['a neutral radical beside oxygen', '[CH2]OC']],
    'The oxygen lone pair fills the empty orbital, making a C=O double bond, so oxygen now carries the plus.',
    'A lone pair on oxygen next to an empty orbital is the best kind of helper. It moves in to make a pi bond, so every atom now has an octet and the plus sits on oxygen. That oxocarbenium form is why ethers and acetals stabilize a neighboring cation.'),

  fwd('af-25', 1, ['l2-acidity'], FWD, ['[NH2-]', 'CC#C[H]'],
    [A(L('0.0'), B('0.0', '1.3')), A(B('1.2', '1.3'), At('1.2'))],
    [['the acetylide and ammonia', 'CC#[C-].N'], ['propyne and ammonia, no charge', 'CC#C.N'], ['an ynamine and hydride', 'CC#CN.[H-]'], ['a propargyl carbanion and ammonia', '[CH2-]C#C.N'], ['no change', 'CC#C.[NH2-]']],
    'The amide takes the terminal alkyne H and the C to H electrons stay on that sp carbon.',
    'The terminal alkyne hydrogen is the acidic one (pKa about 25) because the sp carbon holds the electrons close. The amide ion, NH2- (conjugate acid ammonia, pKa about 38), is strong enough to take it. The arrows give the acetylide anion and ammonia.'),

  fwd('af-26', 1, ['l2-carbocation'], FWD, ['CC(C)(C)[OH2+]'],
    [A(B('0.1', '0.4'), At('0.4'))],
    [['tert-butyl cation and water', 'C[C+](C)C.O'], ['tert-butanol and H+', 'CC(C)(C)O.[H+]'], ['isobutylene and hydronium', 'C=C(C)C.[OH3+]'], ['a primary cation and water', '[CH2+]C(C)C.O'], ['no change, the oxonium stays', 'CC(C)(C)[OH2+]']],
    'The C to O bond leaves with oxygen, so water departs as a neutral molecule and the carbon keeps the plus.',
    'Protonating the alcohol turned a poor leaving group into water, a great one. The arrow sends the C to O bond electrons onto oxygen, so neutral water leaves and the tertiary carbon is left as a carbocation. That is the slow step of SN1 and E1 for alcohols in acid.'),

  /* ---------------- predict the arrows from the product ---------------- */
  rev('ar-01', 1, ['l2-arrows'], REV, ['[OH-]', 'CBr'], ['CO', '[Br-]'], [
    [A(L('0.0'), B('0.0', '1.0')), A(B('1.0', '1.1'), At('1.1'))],
    [A(L('0.0'), B('0.0', '1.0'))],
    [A(L('0.0'), B('0.0', '1.1')), A(B('1.0', '1.1'), At('1.0'))],
    [A(L('0.0'), B('0.0', '1.0')), A(B('1.0', '1.1'), At('1.0'))],
    [A(L('1.1'), B('1.1', '0.0')), A(B('1.0', '1.1'), At('1.1'))]
  ], 'Arrows start at electrons: the hydroxide lone pair goes to carbon, and the C to Br bond goes to bromine.',
    'SN2 needs exactly two arrows. The tail of the first sits on the oxygen lone pair and its head on carbon. The second starts on the C to Br bond and ends on bromine. With only the first arrow, carbon would have five bonds, and sending the C to Br pair onto carbon leaves a carbanion beside a bromine cation.'),

  rev('ar-02', 3, ['l2-arrows', 'l3-newman'], REV, ['CC(C)(C)[O-]', '[H]CC(C)Br'], ['C=CC', 'CC(C)(C)O', '[Br-]'], [
    [A(L('0.4'), B('0.4', '1.0')), A(B('1.0', '1.1'), B('1.1', '1.2')), A(B('1.2', '1.4'), At('1.4'))],
    [A(L('0.4'), B('0.4', '1.0')), A(B('1.2', '1.4'), At('1.4'))],
    [A(L('0.4'), B('0.4', '1.2')), A(B('1.2', '1.4'), At('1.4'))],
    [A(L('0.4'), B('0.4', '1.0')), A(B('1.0', '1.1'), B('1.1', '1.2'))],
    [A(L('0.4'), B('0.4', '1.0')), A(B('1.0', '1.1'), At('1.1')), A(B('1.2', '1.4'), At('1.4'))]
  ], 'E2 is three arrows at once: base to H, C to H bond into the new pi bond, C to Br bond onto bromine.',
    'The alkene appears between the carbon that lost H and the carbon that lost bromine, so one arrow must carry the C to H bond into that C to C region. Drop it and the hydrogen is left holding two bonds; send that pair onto carbon instead and you strand a carbanion beside a carbocation; drop the bromine arrow and carbon ends with five bonds. Attack at carbon gives an ether, not an alkene.'),

  rev('ar-03', 1, ['l2-carbocation'], REV, ['CC(C)(C)Br'], ['C[C+](C)C', '[Br-]'], [
    [A(B('0.1', '0.4'), At('0.4'))],
    [A(B('0.1', '0.4'), At('0.1'))],
    [Object.assign(A(B('0.1', '0.4'), At('0.1')), { fish: true }), Object.assign(A(B('0.1', '0.4'), At('0.4')), { fish: true })],
    [A(B('0.0', '0.1'), At('0.0'))],
    [A(B('0.1', '0.4'), At('0.4')), A(B('0.0', '0.1'), B('0.1', '0.4'))]
  ], 'To make a cation and bromide, both bond electrons must go to bromine: one full arrow, bond to bromine.',
    'Heterolysis toward the electronegative atom is one full-headed arrow from the C to Br bond to bromine. Sending the pair to carbon makes a carbanion; two fishhooks split the bond into radicals; breaking a C to C bond is a different reaction entirely.'),

  rev('ar-04', 1, ['l2-carbocation'], REV, ['O', 'C[C+](C)C'], ['CC(C)(C)[OH2+]'], [
    [A(L('0.0'), B('0.0', '1.1'))],
    [A(L('0.0'), B('0.0', '1.1')), A(B('1.0', '1.1'), At('1.1'))],
    [A(L('0.0'), B('0.0', '1.0'))],
    [A(L('0.0'), B('0.0', '1.1')), A(B('1.0', '1.1'), At('1.0'))],
    [A(B('1.1', '1.0'), B('1.1', '0.0'))]
  ], 'One arrow: water lone pair to the plus carbon. The arrow head lands where the new bond forms.',
    'Capturing a cation is a single bond-forming arrow from the oxygen lone pair to the electron-poor carbon. Pointing at a methyl carbon gives carbon five bonds, and breaking a C to C bond, onto the plus carbon or off of it, changes the skeleton the product keeps. Electrons never flow out of the cation toward water.'),

  rev('ar-05', 2, ['l2-carbocation'], REV, ['C=CC', '[H]Br'], ['C[CH+]C', '[Br-]'], [
    [A(B('0.0', '0.1'), B('0.0', '1.0')), A(B('1.0', '1.1'), At('1.1'))],
    [A(B('0.0', '0.1'), B('0.1', '1.0')), A(B('1.0', '1.1'), At('1.1'))],
    [A(B('1.0', '1.1'), B('1.0', '0.0')), A(B('0.0', '0.1'), At('0.1'))],
    [A(B('0.0', '0.1'), B('0.0', '1.0'))],
    [A(L('1.1'), B('1.1', '0.1')), A(B('0.0', '0.1'), At('0.0'))]
  ], 'The pi bond is the nucleophile: it attacks H, and the H to Br bond leaves on bromine. H goes to the end carbon.',
    'The secondary cation forms only if the proton lands on the CH2 end, so the pi bond arrow has its tail on the CH2 end of the double bond and its head on the hydrogen. A tail on the middle-carbon end puts H there and gives the primary cation. Arrows that start on the H to Br bond and push toward the alkene run backward.'),

  rev('ar-06', 1, ['l2-carbocation'], REV, ['[Br-]', 'C[CH+]C'], ['CC(C)Br'], [
    [A(L('0.0'), B('0.0', '1.1'))],
    [A(L('0.0'), B('0.0', '1.0'))],
    [A(B('1.0', '1.1'), At('1.1'))],
    [A(B('1.0', '1.1'), B('1.1', '0.0'))],
    [A(L('0.0'), B('0.0', '1.1')), A(B('1.0', '1.1'), At('1.0'))]
  ], 'Bromide lone pair to the plus carbon, the middle one. Nothing else moves.',
    'One arrow from the bromide lone pair to the middle carbon forms the C to Br bond and cancels both charges. Aiming at an end carbon makes a five-bond carbon, and breaking a C to C bond, in either direction, would wreck the skeleton the product keeps.'),

  rev('ar-07', 2, ['l2-carbocation'], REV, ['C[CH+]C([H])(C)C'], ['CC[C+](C)C'], [
    [A(B('0.2', '0.3'), B('0.1', '0.3'))],
    [A(B('0.2', '0.3'), At('0.3'))],
    [A(B('0.2', '0.4'), B('0.1', '0.4'))],
    [A(B('0.2', '0.3'), B('0.1', '0.2'))],
    [A(B('0.1', '0.2'), B('0.2', '0.3'))]
  ], 'A 1,2-hydride shift is one arrow: from the C to H bond next door to the plus carbon.',
    'The product puts a second H on the old cation carbon and the plus on the carbon that lost it, so the H travels with its pair: one arrow from that C to H bond toward the plus carbon. Moving a methyl instead gives a different secondary cation, and turning the C to H electrons into a C=C makes an alkene plus a free proton.'),

  rev('ar-08', 2, ['l2-arrows'], REV, ['COC(C)([O-])Cl'], ['COC(C)=O', '[Cl-]'], [
    [A(L('0.4'), B('0.4', '0.2')), A(B('0.2', '0.5'), At('0.5'))],
    [A(L('0.4'), B('0.4', '0.2')), A(B('0.2', '0.1'), At('0.1'))],
    [A(B('0.2', '0.5'), At('0.5'))],
    [A(L('0.4'), B('0.4', '0.2')), A(B('0.2', '0.3'), At('0.3'))],
    [A(L('0.4'), B('0.4', '0.2'))]
  ], 'Collapse: the oxygen lone pair remakes C=O and the C to Cl bond leaves on chlorine.',
    'The tetrahedral intermediate falls apart by pushing the oxyanion lone pair back down and expelling the best leaving group. The product keeps the methoxy and loses chloride, so the second arrow must start on the C to Cl bond. Without it, carbon would have five bonds.'),

  rev('ar-09', 3, ['l2-acidity', 'l2-resonance'], REV, ['[OH-]', '[H]CC(C)=O'], ['C=C(C)[O-]', 'O'], [
    [A(L('0.0'), B('0.0', '1.0')), A(B('1.0', '1.1'), B('1.1', '1.2')), A(B('1.2', '1.4'), At('1.4'))],
    [A(L('0.0'), B('0.0', '1.2')), A(B('1.2', '1.4'), At('1.4'))],
    [A(L('0.0'), B('0.0', '1.0')), A(B('1.0', '1.1'), B('1.1', '1.2'))],
    [A(L('1.4'), B('1.4', '0.0')), A(B('1.0', '1.1'), B('1.1', '1.2'))],
    [A(L('0.0'), B('0.0', '1.0')), A(B('1.2', '1.4'), At('1.4'))]
  ], 'To reach the oxyanion enolate: base takes the alpha H, that bond becomes C=C, and the C=O pi bond goes onto oxygen.',
    'Three arrows: hydroxide to the alpha hydrogen, the C to H bond into a new C=C, and the carbonyl pi bond up onto oxygen. Leave out the last arrow and the carbonyl carbon would hold five bonds. Hydroxide attacking the carbonyl carbon is addition, not enolate formation.'),

  rev('ar-10', 3, ['l2-arrows', 'l1-unsat'], REV, ['C1=CC=CC1', 'C=C'], ['C1CC2C=CC1C2'], [
    [A(B('0.2', '0.3'), B('0.3', '1.0')), A(B('1.0', '1.1'), B('1.1', '0.0')), A(B('0.0', '0.1'), B('0.1', '0.2'))],
    [A(B('0.2', '0.3'), B('0.3', '1.0')), A(B('1.0', '1.1'), B('1.1', '0.0'))],
    [A(B('0.2', '0.3'), B('0.3', '1.0')), A(B('1.0', '1.1'), B('1.1', '0.4')), A(B('0.0', '0.1'), B('0.1', '0.2'))],
    [A(B('0.2', '0.3'), B('0.3', '1.0')), A(B('1.0', '1.1'), B('1.1', '0.0')), A(B('0.0', '0.1'), At('0.1'))],
    [A(B('0.2', '0.3'), B('0.3', '1.0')), A(B('0.0', '0.1'), B('0.1', '0.2'))]
  ], 'A Diels-Alder is three arrows in a loop: diene end to dienophile, dienophile pi to the other diene end, and the leftover diene pi into the middle.',
    'Three pi bonds go in and two sigma bonds plus one pi bond come out, so you need all three arrows, each moving one pi bond one position around the six-atom ring. Stopping at two leaves charges stranded, and bonding to the saturated CH2 gives that carbon five bonds.'),

  rev('ar-11', 3, ['l2-arrows'], REV, ['C[O-]', 'CC1CO1'], ['COCC(C)[O-]'], [
    [A(L('0.1'), B('0.1', '1.2')), A(B('1.2', '1.3'), At('1.3'))],
    [A(L('0.1'), B('0.1', '1.1')), A(B('1.1', '1.3'), At('1.3'))],
    [A(L('0.1'), B('0.1', '1.2')), A(B('1.1', '1.3'), At('1.3'))],
    [A(L('0.1'), B('0.1', '1.2'))],
    [A(L('0.1'), B('0.1', '1.2')), A(B('1.2', '1.3'), At('1.2'))]
  ], 'Basic epoxide opening: attack the CH2 carbon and break that same carbon bond to the ring oxygen.',
    'The product has methoxy on the end carbon and the negative oxygen on the inner carbon, so methoxide attacks the CH2 and the CH2 to O bond breaks onto oxygen, a backside SN2. Attacking the inner carbon gives the other regioisomer, and breaking the other ring bond leaves the attacked carbon with five bonds.'),

  rev('ar-12', 2, ['l2-arrows'], REV, ['CC(C)=O', '[H][OH2+]'], ['CC(C)=[OH+]', 'O'], [
    [A(L('0.3'), B('0.3', '1.0')), A(B('1.0', '1.1'), At('1.1'))],
    [A(L('0.3'), B('0.3', '1.0'))],
    [A(B('1.0', '1.1'), B('1.0', '0.3')), A(B('0.1', '0.3'), At('0.1'))],
    [A(L('1.1'), B('1.1', '0.1')), A(B('0.1', '0.3'), At('0.3'))],
    [A(L('0.3'), B('0.3', '1.1')), A(B('1.0', '1.1'), At('1.0'))]
  ], 'Proton transfer: the carbonyl oxygen lone pair grabs H, and the H to O bond stays on water.',
    'Arrows start where electrons are. The carbonyl oxygen lone pair attacks the hydrogen of hydronium and the O to H bond electrons fall back onto the water oxygen. Water attacking the carbonyl carbon is addition, not protonation, and an oxygen lone pair aimed at the hydronium oxygen makes a peroxide-like O to O bond instead of moving the proton.'),

  rev('ar-13', 1, ['l2-arrows', 'l2-bully'], REV, ['[CH3-]', 'C=O'], ['CC[O-]'], [
    [A(L('0.0'), B('0.0', '1.0')), A(B('1.0', '1.1'), At('1.1'))],
    [A(L('0.0'), B('0.0', '1.1')), A(B('1.0', '1.1'), At('1.0'))],
    [A(L('0.0'), B('0.0', '1.0'))],
    [A(B('1.0', '1.1'), B('1.0', '0.0'))],
    [A(L('0.0'), B('0.0', '1.0')), A(B('1.0', '1.1'), At('1.0'))]
  ], 'Carbanion to the carbonyl carbon, C=O pi bond onto oxygen. Two arrows.',
    'The product has a new C to C bond and the negative charge on oxygen. That takes one arrow from the carbanion lone pair to the carbonyl carbon and one from the pi bond to oxygen. Sending the pi electrons to carbon would leave carbon overloaded and oxygen short.'),

  rev('ar-14', 1, ['l2-arrows', 'l2-bully'], REV, ['[H-]', 'O=C1CCCCC1'], ['[O-]C1CCCCC1'], [
    [A(L('0.0'), B('0.0', '1.1')), A(B('1.1', '1.0'), At('1.0'))],
    [A(L('0.0'), B('0.0', '1.0')), A(B('1.0', '1.1'), At('1.1'))],
    [A(L('0.0'), B('0.0', '1.1'))],
    [A(B('1.0', '1.1'), B('1.1', '0.0'))],
    [A(B('1.1', '1.0'), At('1.0'))]
  ], 'Hydride to the carbonyl carbon, pi bond onto oxygen.',
    'Reduction by a hydride source is attack plus pi bond to oxygen. The new C to H bond is on the old carbonyl carbon and oxygen holds the charge. One arrow alone gives carbon five bonds; the pi bond alone gives a carbocation, not the alkoxide.'),

  rev('ar-15', 1, ['l2-acidity'], REV, ['N', 'CC(=O)O[H]'], ['CC(=O)[O-]', '[NH4+]'], [
    [A(L('0.0'), B('0.0', '1.4')), A(B('1.3', '1.4'), At('1.3'))],
    [A(L('0.0'), B('0.0', '1.1')), A(B('1.1', '1.2'), At('1.2'))],
    [A(L('0.0'), B('0.0', '1.4'))],
    [A(B('1.3', '1.4'), At('1.4')), A(L('0.0'), B('0.0', '1.4'))],
    [A(L('1.3'), B('1.3', '0.0')), A(B('1.3', '1.4'), At('1.3'))]
  ], 'Ammonia lone pair to the acidic H; the O to H bond electrons stay on oxygen.',
    'A proton transfer between oxygen and nitrogen is usually faster than any other step available. Ammonia uses its lone pair on the hydrogen, and the O to H bond becomes a lone pair on the carboxylate oxygen. Attack at the carbonyl carbon is a different, much slower reaction.'),

  rev('ar-16', 2, ['l2-carbocation'], REV, ['O', '[H]C[C+](C)C'], ['C=C(C)C', '[OH3+]'], [
    [A(L('0.0'), B('0.0', '1.0')), A(B('1.0', '1.1'), B('1.1', '1.2'))],
    [A(L('0.0'), B('0.0', '1.2'))],
    [A(L('0.0'), B('0.0', '1.0'))],
    [A(L('0.0'), B('0.0', '1.0')), A(B('1.0', '1.1'), At('1.1'))],
    [A(B('1.0', '1.1'), B('1.1', '1.2'))]
  ], 'E1 finish: water takes the beta H and that C to H bond swings in as the new pi bond.',
    'The alkene forms between the carbon that lost H and the old cation carbon, so the second arrow carries the C to H electrons into that C to C bond. Water attacking the cation gives the oxonium ion instead, and without the water arrow the proton has nowhere to go.'),

  rev('ar-17', 3, ['l2-resonance'], REV, ['CC=C[CH2+]'], ['C[CH+]C=C'], [
    [A(B('0.1', '0.2'), B('0.2', '0.3'))],
    [A(B('0.1', '0.2'), B('0.0', '0.1'))],
    [A(B('0.0', '0.1'), B('0.1', '0.2'))],
    [A(B('0.1', '0.2'), At('0.1'))],
    [A(B('0.2', '0.3'), B('0.1', '0.2'))]
  ], 'Resonance arrow: the pi bond moves toward the empty orbital, one position over.',
    'The double bond in the product sits between the last two carbons and the plus is on carbon two. One arrow does it: the pi electrons slide from the C2 to C3 bond into the C3 to C4 bond. Single bonds never move in resonance.'),

  rev('ar-18', 1, ['l2-arrows'], REV, ['CC[O-]', 'CI'], ['CCOC', '[I-]'], [
    [A(L('0.2'), B('0.2', '1.0')), A(B('1.0', '1.1'), At('1.1'))],
    [A(L('0.2'), B('0.2', '1.1')), A(B('1.0', '1.1'), At('1.0'))],
    [A(L('0.2'), B('0.2', '1.0'))],
    [A(B('1.0', '1.1'), At('1.0')), A(L('0.2'), B('0.2', '1.0'))],
    [A(L('1.1'), B('1.1', '0.2')), A(B('1.0', '1.1'), At('1.1'))]
  ], 'Williamson ether: oxygen attacks the methyl carbon, C to I bond onto iodine.',
    'The ether needs an O to C bond and iodide leaving. Arrow one goes from the oxygen lone pair to the carbon, arrow two from the C to I bond to iodine. Pointing the oxygen at iodine, or sending the C to I pair to carbon, gives other products.'),

  rev('ar-19', 2, ['l2-arrows', 'l2-bully'], REV, ['[C-]#N', 'CC=O'], ['CC([O-])C#N'], [
    [A(L('0.0'), B('0.0', '1.1')), A(B('1.1', '1.2'), At('1.2'))],
    [A(L('0.1'), B('0.1', '1.1')), A(B('1.1', '1.2'), At('1.2'))],
    [A(L('0.0'), B('0.0', '1.1'))],
    [A(L('0.0'), B('0.0', '1.2')), A(B('1.1', '1.2'), At('1.1'))],
    [A(L('0.0'), B('0.0', '1.1')), A(B('1.1', '1.2'), At('1.1'))]
  ], 'The cyanide carbon lone pair attacks the carbonyl carbon and the pi bond goes to oxygen.',
    'The product has a C to C bond to the nitrile carbon, so the tail must sit on the carbon lone pair of cyanide, not the nitrogen one. The pi bond then moves onto oxygen. Attack through nitrogen gives an isocyanide, and attack on oxygen makes the wrong connection.'),

  rev('ar-20', 3, ['l2-arrows'], REV, ['C[O-]', 'CC(=O)Cl'], ['COC(C)([O-])Cl'], [
    [A(L('0.1'), B('0.1', '1.1')), A(B('1.1', '1.2'), At('1.2'))],
    [A(L('0.1'), B('0.1', '1.1')), A(B('1.1', '1.3'), At('1.3'))],
    [A(L('0.1'), B('0.1', '1.1'))],
    [A(L('0.1'), B('0.1', '1.2')), A(B('1.1', '1.2'), At('1.1'))],
    [A(L('0.1'), B('0.1', '1.1')), A(B('1.1', '1.2'), At('1.1'))]
  ], 'Addition first: methoxide to the carbonyl carbon, pi bond up to oxygen. Chloride stays for now.',
    'The product still holds chlorine and has a negative oxygen, so this is the addition half of acyl substitution. Kicking chloride out in the same breath would give the ester, which is not the product shown. A lone arrow makes carbon five-bonded.'),

  rev('ar-21', 3, ['l2-carbocation'], REV, ['C[CH+]C(C)(C)C'], ['CC(C)[C+](C)C'], [
    [A(B('0.2', '0.3'), B('0.1', '0.3'))],
    [A(B('0.2', '0.3'), At('0.3'))],
    [A(B('0.1', '0.2'), B('0.2', '0.3'))],
    [A(B('0.0', '0.1'), B('0.1', '0.2'))],
    [A(B('0.2', '0.3'), B('0.1', '0.2'))]
  ], 'A methyl shift is one arrow from the C to CH3 bond next door to the plus carbon.',
    'The product carries a new methyl on the old cation carbon and the plus on the carbon that gave it up. The methyl moves with its bond electrons: one arrow from that C to C bond toward the plus carbon. Letting the methyl leave as an anion, or moving bonds the other way, does not make this cation.'),

  rev('ar-22', 2, ['l2-resonance'], REV, ['CO[CH2+]'], ['C=[O+]C'], [
    [A(L('0.1'), B('0.1', '0.2'))],
    [A(L('0.1'), B('0.1', '0.2')), A(B('0.1', '0.2'), At('0.1'))],
    [A(B('0.1', '0.2'), At('0.1'))],
    [A(B('0.0', '0.1'), B('0.1', '0.2'))],
    [A(L('0.1'), B('0.1', '0.0'))]
  ], 'Oxygen lone pair into the C to O bond region, making the C=O pi bond.',
    'The product has a C=O double bond and the plus on oxygen, so a lone pair on oxygen became the new pi bond to the electron-poor carbon. Moving a sigma bond, pushing electrons onto carbon, or undoing the new pi bond with a second arrow changes the atoms or cancels the move rather than redrawing the ion.')
];
