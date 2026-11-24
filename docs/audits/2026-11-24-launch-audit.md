# Launch audit, 2026-11-24

Every question a pass holder can reach in the hub banks (data/bio.json, gchem.json, ochem.json, qr-dat.json, qr-climb.json: 1,161 items) was re-checked for a correct key, real checkable facts, 2026 DAT scope and teaching value. Every numeric key was recomputed. Fixes went into the source banks (games/bio.json, games/gchem.json, scripts/dat-mock-bank.json, tools/minitests/source/minitest-source.json) and the served banks were rebuilt from them.

| Set | Checked | Fixed | No trap note (not rewritten) |
|---|---|---|---|
| Biology | 157 | 11 | 72 |
| Gen Chem (part 1) | 173 | 11 | 80 |
| Gen Chem (part 2) | 173 | 9 | 74 |
| Gen Chem (part 3) | 171 | 12 | 105 |
| OChem (part 1) | 193 | 15 | 115 |
| OChem (part 2) | 193 | 31 | 110 |
| QR | 101 | 1 | 41 |

Key changes (the keyed answer was wrong or the item had no right answer): bio:BIO_xp001, gc:GC_p6, oc:OC_lb033, oc:OC_xp007.

Excluded from delivery (out of 2026 DAT scope): oc:OC_xp006, removed from scripts/dat-mock-bank.json and listed in scripts/bank/scope-exclusions.json.

## Every finding

- **bio:BIO_cm020** (factual error): The stem says insulin is glycosylated and sulfated in the Golgi. Insulin is neither; it is packed into secretory granules, where proinsulin is cut into insulin.
- **bio:BIO_cm041** (factual error): The explanation says Okazaki fragments are 1 to 2 kb long in eukaryotes. They are about 100 to 200 nucleotides in eukaryotes; the 1,000 to 2,000 nucleotide figure is for bacteria.
- **bio:BIO_cm052** (factual error): The stem and explanation call water rise in a 30 m tree capillary action. Capillarity alone lifts water only a short distance; the column is pulled up by transpiration, which works because of cohesion and adhesion (cohesion-tension theory).
- **bio:BIO_cm065** (factual error): The explanation says thermophilic bacteria have GC-rich, more stable genomes. Whole-genome GC content does not track growth temperature; only structural RNAs such as rRNA and tRNA stems get more GC-rich in thermophiles.
- **bio:BIO_cm081** (factual error): The explanation says each active G alpha s turns on about 10 adenylyl cyclases. Each G alpha s binds and activates one adenylyl cyclase, and the other numbers given are not checkable.
- **bio:BIO_cm136** (factual error): The stem says pancreatic lipase cleaves all three ester bonds, and the explanation then talks about monoglycerides. Pancreatic lipase mainly cuts the bonds at carbons 1 and 3, giving a monoglyceride plus two free fatty acids.
- **bio:BIO_cm138** (factual error): The explanation calls statins a 30 billion dollar a year drug class, an unsourced figure that is not needed for the question.
- **bio:BIO_cm141** (factual error): The keyed choice says reverse transcriptase is part of the capsid. It is an enzyme packaged inside the capsid with the RNA genome, not a capsid building block.
- **bio:BIO_xp001** (wrong key): Once the CDK1 inhibitor is removed, every listed event can happen, including APC/C activation, so there is no correct answer, and the explanation contradicts itself. Spindle pole body and H3 Ser10 phosphorylation are also beyond DAT scope; rebuilt as a clean item.
- **bio:BIO_xp003** (factual error): The keyed choice says aabb individuals die, yet 30 aabb offspring survived; the data show reduced viability, not full lethality, and the explanation says partial lethality, which contradicts the choice.
- **bio:BIO_xp006** (factual error): The keyed choice says losing TPI halves the ATP yield. Gross ATP halves (4 to 2), but after the 2 ATP invested, net yield falls from 2 to 0.
- **gc:GC_p6** (ambiguous): The stem asks for the smallest covalent radius but keys neon, which has no covalent radius (noble gases are measured differently, and some tables put Ne's radius at or above F's). Fluorine is an equally defensible answer, so swap Ne out.
- **gc:GC_at6** (factual error): The why says confusing 2n² with 2n+1 gives 8 or 9, but 2n+1 is 7 for n = 3. The 9 actually comes from n² (the number of orbitals in the shell).
- **gc:GC_b2** (factual error): The why labels Na's electronegativity as 'ΔEN 0.93'. 0.93 is Na's electronegativity; the difference (ΔEN) is 2.23.
- **gc:GC_b5** (factual error): The stem says 'pure liquid HF at 20°C boils at 19.5°C', which contradicts itself: at 20°C and 1 atm HF is above its boiling point.
- **gc:GC_s2** (weak explanation): The trap note ('forgetting to invert the ratio gives 600 mL, using 6/0.5 = 12 then × 50') is garbled arithmetic that does not describe a real student mistake.
- **gc:GC_g7** (weak explanation): The trap note says 'halving correctly gives 0.10 mol (a one-step error)', which is self-contradictory and does not say what mistake produces 0.10.
- **gc:GC_lr5** (weak explanation): The trap note says subtracting the wrong way gives 'a negative or 0.5 result', but 3.0 − 4.5 = −1.5, so it never explains where the 0.5 choice comes from.
- **gc:GC_ca1** (factual error): The why says forgetting to multiply by mass gives 1045 J, but 4.18 × 25 = 104.5 J. The 1045 J choice comes from a slipped decimal, not from dropping the mass.
- **gc:GC_b-h1** (weak explanation): The why contradicts itself mid-sentence ('Triple bond (3) < benzene (1.5) < double (2) ordering... actually 3 > 2 > 1.5 > 1'), which will confuse students.
- **gc:GC_ks-h1** (factual error): The trap note says forgetting the (2s)² factor gives 1.0 × 10⁻⁶, but s³ = 1.1 × 10⁻¹² gives 1.0 × 10⁻⁴. The 1.0 × 10⁻⁶ choice actually comes from treating the salt as 1:1 (s = √Ksp).
- **gc:GC_nu1** (factual error): The why says 'β decay (Z+1) gives ²³⁴Pa instead', but β⁻ decay of U-238 keeps A = 238 and gives ²³⁸Np. ²³⁴Pa only appears if you change A by 4 and Z by just 1, which matches no single decay.
- **gc:GC_lw-e4** (weak explanation): The explanation contains a visible self-correction ('8 around S, but bonding electrons = 12). Wait:') that reads like scratch work and will confuse students about how many bonding electrons S has.
- **gc:GC_v-e4** (factual error): The explanation gives the idealized angles (axial F at 180°, equatorial F at ~120°) as if they were the real SF4 angles. The lone pair squeezes them to about 173 and 102°, which is the whole point of lone-pair repulsion.
- **gc:GC_mc-e1** (factual error): The explanation says the common error is '22/44 = 2 (inverted)', but 22/44 is 0.5, the correct answer. The inverted setup is 44/22 = 2.
- **gc:GC_mc-e15** (ambiguous): The stem calls the sample a '100.0 g infusion of normal saline that contains pure NaCl'. Normal saline is about 0.9% NaCl, so 100 g of saline holds only about 0.9 g NaCl; the stem contradicts itself. The why also mislabels the distractors (58.5/100 is 0.585, not 5.85).
- **gc:GC_mc-e16** (factual error): The explanation says 'reading 7:2 inverted gives 3.0 or 2.0', but the inverted ratio 2/7 gives about 0.29 mol, so this distractor reasoning is wrong.
- **gc:GC_ca-e1** (factual error): The explanation says 'doubling ΔT (mistaking final T for ΔT) gives ~3135 J'. Using 30 °C as ΔT triples it (3135 J); doubling ΔT gives 2090 J, which is the actual distractor in choice 2.
- **gc:GC_gb-e1** (ambiguous): The stem calls the value a 'standard Gibbs free-energy change' but then says it applies 'under the reaction conditions'. A negative standard ΔG only means K > 1; spontaneity under actual conditions depends on ΔG, so the stem mixes up ΔG and ΔG°, a distinction the DAT tests.
- **gc:GC_ar-e1** (factual error): The stem calls 2 H2O2(aq) -> 2 H2O(l) + O2(g) a 'gas-phase decomposition' although the reactant is aqueous. The why also calls K_eq a state function; K is set by ΔG° but is not itself a state function.
- **gc:GC_lc-e4** (factual error): The explanation ends with 'Q and K both change identically', which is wrong. K changes only with temperature, and for Δn(gas) = 0 compressing the system leaves Q unchanged too, which is why there is no shift.
- **gc:GC_ti-e3** (factual error): The explanation gives concentrated H2SO4 as an example of a diprotic acid that shows two equivalence points. A sulfuric acid titration normally shows only one visible jump because its second Ka (about 1 x 10^-2) is too large to separate, and 'in concentrated form' is meaningless here.
- **gc:GC_gv-e3** (weak explanation): The explanation only states the result and which metal is the cathode; it shows no arithmetic and does not say why the sign or the 0.42 V distractors are wrong.
- **gc:GC_rp-e3** (factual error): The explanation says Zn is below Cu in the activity series. In the standard activity series (most active metals at the top), Zn sits above Cu, which is exactly why Zn displaces Cu2+.
- **gc:GC_imf2** (weak explanation): The explanation says London forces track molar mass, then concludes Ne (MW 20) boils below CH4 (MW 16), which contradicts its own reasoning and would actually predict the trap order CH4 < Ne. The real reason is polarizability: both have 10 electrons, but CH4's electrons are spread over a larger molecule.
- **gc:GC_b7** (factual error): The stem says NH4+ has four N-H covalent bonds 'with a fifth coordinate covalent bond' when formed from NH3 + H+. NH4+ has only four N-H bonds; the coordinate bond is one of those four, not a fifth. The stem also calls HCl(g) a solid.
- **gc:GC_ic5** (factual error): The keyed choice and explanation put the failure point at Ka/[HA]0 > ~10^-3, but at Ka/[HA]0 = 10^-3 the ionization is only about 3%, so the approximation still holds. The 5% rule actually fails when Ka/[HA]0 exceeds about 2.5 x 10^-3 (the familiar [HA]0/Ka < 400 test).
- **gc:GC_imf-q2** (factual error): The explanation says acetone 'cannot H-bond donate strongly'; acetone has no O-H or N-H, so it cannot donate a hydrogen bond at all. It also never addresses methanol, the H-bonding distractor a student is most likely to pick.
- **gc:GC_cal-q3** (factual error): The stem says '(mass cancels)', which is wrong: the sample mass does not cancel, it is the number you divide by to get energy per gram. This can mislead students on the setup.
- **gc:GC_ic-q2** (factual error): The keyed choice reads 'x/[A]0 = 80%', a notation typo for x/[HA]0 that students could misread as the conjugate base concentration.
- **gc:GC_ks-q2** (weak explanation): The explanation names a trap value of 2.4 x 10^-6 that is not among the choices (choice 3 is 2.4 x 10^-4), and its note about 'using 4 x in the wrong place' giving 5.6e-6 is unclear. Replace choice 3 with the real sqrt(Ksp) trap and rewrite the explanation.
- **gc:GC_nu-q2** (factual error): The explanation says C-14 decay is the basis of natural N-14 production. That is backwards: C-14 is made in the atmosphere from N-14 by cosmic-ray neutrons, and natural nitrogen-14 is overwhelmingly primordial, not produced by C-14 decay.
- **gc:GC_xp006** (weak explanation): The arithmetic and key are correct (1.50 atm), but the explanation ends with a stray 'Re-check: actually ...' line that reads like scratch work and confuses students.
- **oc:OC_mec030** (factual error): The keyed choice and the why give the wrong reason for the Hughes result. Two inversions returning a molecule to R would make racemization slower than exchange, not twice as fast.
- **oc:OC_ami188** (factual error): The keyed choice of a 'strong, bulky base' is wrong for Hofmann elimination: the base is plain hydroxide and the bulky group is the trimethylammonium leaving group. The stem substrate also carries an extra bromine on C2, which makes no sense for a Hofmann question.
- **oc:OC_ami189** (factual error): The keyed choice calls primary and tertiary amines approximately equal in water, but the stem's own pKaH values (10.6 vs 9.8) show primary is clearly more basic. The ranking should be 2 deg > 1 deg > 3 deg > NH3.
- **oc:OC_ami191** (factual error): The keyed choice calls primary and tertiary amines approximately equal in water, but the stem's own pKaH values (10.6 vs 9.8) show primary is clearly more basic. The ranking should be 2 deg > 1 deg > 3 deg > NH3.
- **oc:OC_ami192** (factual error): The keyed choice calls primary and tertiary amines approximately equal in water, but the stem's own pKaH values (10.6 vs 9.8) show primary is clearly more basic. The ranking should be 2 deg > 1 deg > 3 deg > NH3.
- **oc:OC_alk092** (factual error): The why says terminal alkynes always give methyl ketones and never aldehydes. Acetylene itself, the simplest terminal alkyne, gives acetaldehyde.
- **oc:OC_alc143** (factual error): The stem says a secondary alcohol cannot be over-oxidized because it 'lacks an alpha-hydrogen-bearing carbonyl carbon'. Acetone does have alpha hydrogens; the real reason is that the ketone's carbonyl carbon has no H on it.
- **oc:OC_car151** (factual error): The why says only adding two carbon nucleophiles to an ester gives a tertiary alcohol. A single Grignard addition to a ketone also gives a tertiary alcohol.
- **oc:OC_mec024** (factual error): The stem says rearranged product is detected, but the 2,3-dimethyl-2-butyl cation can only undergo a degenerate hydride shift that gives the same cation and the same products. No rearranged product can be seen.
- **oc:OC_mec021** (weak explanation): The why claims observable rearrangement helps diagnose the slow step, but the stem never mentions rearrangement and the tert-amyl cation is already tertiary, so no rearrangement to a more stable cation is expected.
- **oc:OC_alk097** (weak explanation): The question asks why the ketone is favored over its tautomer, but the keyed choice gives a muddled reason about the more substituted enol. The real reason is that the keto form, with its strong C=O bond, is far more stable than the enol.
- **oc:OC_alk081** (factual error): Choice 4, '(E,E)-1,3-butadiene', is not a real stereoisomer label because neither double bond in butadiene can be E or Z. A wrong stereodescriptor teaches bad stereochemistry even in a distractor.
- **oc:OC_alk088** (factual error): Choice 4, '(E,E)-1,3-butadiene', is not a real stereoisomer label because neither double bond in butadiene can be E or Z.
- **oc:OC_alk091** (factual error): Choice 4 calls a mixture of (E)- and (Z)-2-butene 'racemic'. E and Z isomers are diastereomers, not enantiomers, so the word racemic is wrong.
- **oc:OC_aro119** (factual error): Choice 4, '2,4-dinitrobenzene', is not a valid name; the two nitro groups would be numbered 1,3. Nomenclature is tested on the DAT, so a bad name should not appear even as a distractor.
- **oc:OC_ami196** (factual error): The stem gives pKaH values of 10.6 for methylamine and 9.8 for trimethylamine, then keys an answer saying 1 deg is about equal to 3 deg. With these numbers the order is clearly 2 deg > 1 deg > 3 deg > NH3.
- **oc:OC_ami201** (factual error): The stem gives pKaH values of 10.6 for methylamine and 9.8 for trimethylamine, then keys an answer saying 1 deg is about equal to 3 deg. With these numbers the order is clearly 2 deg > 1 deg > 3 deg > NH3.
- **oc:OC_syn226** (factual error): The keyed choice offers Lucas reagent (HCl/ZnCl2) as an equally good one-step route for ethanol, but Lucas reagent reacts very slowly with primary alcohols (that is the basis of the Lucas test), so it is not a clean or reliable method here.
- **oc:OC_syn229** (factual error): The keyed choice offers Lucas reagent (HCl/ZnCl2) as an equally good one-step route for ethanol, but Lucas reagent reacts very slowly with primary alcohols (that is the basis of the Lucas test), so it is not a clean or reliable method here. The why also contradicts the key by calling Lucas the alternative for 2 deg/3 deg alcohols.
- **oc:OC_syn231** (factual error): The keyed choice offers Lucas reagent (HCl/ZnCl2) as an equally good one-step route for ethanol, but Lucas reagent reacts very slowly with primary alcohols (that is the basis of the Lucas test), so it is not a clean or reliable method here.
- **oc:OC_syn242** (factual error): The keyed choice offers Lucas reagent (HCl/ZnCl2) as an equally good one-step route for ethanol, but Lucas reagent reacts very slowly with primary alcohols (that is the basis of the Lucas test), so it is not a clean or reliable method here.
- **oc:OC_lab248** (ambiguous): With only a neutral hydrocarbon and a carboxylic acid present, 1 M NaOH would also remove just the acid, so both the NaHCO3 and NaOH choices work. The NaOH choice refers to phenols that are not in the mixture.
- **oc:OC_abo265** (factual error): Ammonia is neutral, so it is a much weaker gas-phase base than OH- or F-; the keyed order alkyl > NH3 > OH- > F- is wrong and no choice is correct as written. The comparison only works if NH3 is replaced by the amide ion NH2-.
- **oc:OC_abo271** (factual error): Neutral NH3 is ranked above OH- and F-, which is wrong because a neutral base is much weaker than these anions, so no choice is correct. The stem also says trends down a row when it means across a row.
- **oc:OC_abo272** (factual error): Neutral NH3 is ranked above the anions OH- and F-, which is wrong (charge outranks atom in CARDIO), so the keyed order is false. Replacing NH3 with NH2- makes the intended periodic-trend question correct.
- **oc:OC_abo282** (factual error): Neutral NH3 is ranked as a stronger base than OH- and F-, which is wrong because those anions are far more basic than a neutral amine. The question needs NH2- in place of NH3.
- **oc:OC_abo278** (factual error): The stem sets the comparison in DMSO but the why quotes aqueous pKa values (4.76 and 16). In DMSO acetic acid is about 12 and ethanol about 29; the order is the same but the numbers are wrong for the solvent named.
- **oc:OC_ab010** (weak explanation): The stem asks what fraction is protonated, but no choice gives a fraction, and the Keq in the key (10^-4.7) does not follow from the pKa(H2O) of 15.7 the stem supplies (that would give about 10^-6.5). The 10^-4.75 value is Kb from Kw.
- **oc:OC_sp019** (factual error): A molecular ion at m/z 78 cannot contain bromine, since a single 79Br atom already weighs 79. The M/M+2 pair needs masses that fit a bromo compound.
- **oc:OC_lb033** (ambiguous): Both phenol and aniline stay in the ether after a NaHCO3 wash, so the single-answer key of phenol is incomplete; the aniline choice even says so.
- **oc:OC_cb052** (weak explanation): The why says the alpha-H is acidic because of the beta-OH, which is wrong; it is acidic because it sits next to the C=O. The E1cb step is otherwise described correctly.
- **oc:OC_arr001** (ambiguous): The stem refers to starting materials and arrows that are not shown and names no reactants, so a student cannot tell what reacts.
- **oc:OC_arr008** (factual error): The keyed choice describes the first arrow as going from the Br-Br bond to FeBr3. In correct arrow pushing, the first arrow starts at a bromine lone pair and points to Fe; the Br-Br bond breaks when the arene attacks.
- **oc:OC_lf004** (factual error): The why reverses the isomer ratio. Nitration of toluene gives roughly 58 percent ortho, 38 percent para and 4 percent meta, so ortho, not para, is the larger product.
- **oc:OC_lf008** (factual error): Isopropylmagnesium bromide plus butan-2-one gives 2,3-dimethylpentan-3-ol, not 2-methylpentan-2-ol; no choice gives the stated target from 2-bromopropane. The stem target must change to match the key.
- **oc:OC_lf009** (factual error): 2-Chloro-2,3-dimethylbutane ionizes to a tertiary cation whose only useful shift is a degenerate hydride shift giving the same cation, so no different tertiary alcohol forms, and a methyl shift would make a less stable secondary cation. The scenario only works with a secondary substrate such as 3-chloro-2,2-dimethylbutane.
- **oc:OC_lf011** (factual error): The key (3 and 4) is right, but the why miscounts: it says the four CH ring carbons of p-xylene give 2 environments (they give 1), and that o-xylene has 4 aromatic environments plus a methyl yet totals 4 (it has 3 aromatic plus 1 methyl).
- **oc:OC_xp001** (factual error): Threo (2S,3S)-3-bromo-2-butanol reacts with HBr through a bridged bromonium ion that is achiral, so Br- opens it at either carbon to give racemic (2R,3R)/(2S,3S)-2,3-dibromobutane (the classic Winstein result), not the meso compound. As written, a meso product would actually fit the simple SN2 choice, so the key does not match the stem.
- **oc:OC_xp002** (factual error): 4-Methoxyacetophenone is an aryl ketone, so conjugation puts its C=O near 1675-1685 cm-1, not 1715, and a para-disubstituted ring shows 4 unique aromatic carbons, not 5. The why repeats both errors.
- **oc:OC_xp004** (factual error): The stem says a symmetric ketone is methylated at its less substituted alpha carbon, but a symmetric ketone has two equivalent alpha carbons, so kinetic versus thermodynamic selectivity cannot arise.
- **oc:OC_xp005** (factual error): The count (4 total, 2 optically active) is right, but the why labels are wrong: RSR is not meso. In a molecule like 2,3,4-pentanetriol the chiral pair has C2 and C4 alike (2R,4R and 2S,4S), and the two meso forms have C2 and C4 opposite with the central carbon r or s.
- **oc:OC_xp006** (out of scope): Comparing gas-phase deprotonation energies with aqueous pKa values and solvent leveling of substituent effects goes beyond the DAT acid-base outline, which tests relative acidity in solution.
- **oc:OC_xp007** (wrong key): Anti dihydroxylation of a trans alkene gives the meso diol: the racemic trans-epoxide from (E)-2-butene is opened with inversion at one carbon, giving (2R,3S)-2,3-butanediol. The keyed racemate is what syn dihydroxylation (OsO4) of the trans alkene would give.
- **oc:OC_xp008** (factual error): One product is misnamed. The allylic cation from 3-chloro-3-methyl-1-butene is attacked at C3 to give 2-methyl-3-buten-2-ol and at C1 to give 3-methyl-2-buten-1-ol; 3-methyl-3-buten-2-ol cannot form from this cation.
- **oc:OC_xp009** (weak explanation): The stem says an alkyl Grignard, yet the key needs an alkene to hydroborate, and it calls a four-step plan 3-step. The why says protection is needed because Grignards would destroy the alcohol, but no Grignard is present when the primary OH is installed.
- **oc:OC_xp014** (factual error): The keyed choice says each added Br increases activation, but bromine is a deactivating group. Tribromination happens because the OH group is so strongly activating that the ring stays reactive even after one or two Br atoms are added.
- **qr:climb-mdaeqn** (factual error): The key (54) is right, but the takeaway says 25 percent off then 10 percent off is a 46 percent total cut. The real total cut is 32.5 percent (54 is 67.5 percent of 80), so the explanation teaches a wrong number.

## Still weak (not fixed tonight)

- About 600 explanations never say why the most tempting wrong choice is wrong. They are correct, just thinner than docs/EXPLANATION-STANDARD.md asks.
- OChem is repetitive (about 10 propene + HBr items, 10 benzene bromination, 9 terminal alkyne deprotonation, several word-for-word repeats) and light on spectroscopy and lab technique.
- QR has no true data sufficiency or quantitative comparison items; the four "Data sufficiency" items are discriminant algebra.
- Four Gen Chem near-duplicate pairs: GC_cal4/GC_cal7, GC_pd4/GC_pd-q3, GC_nu-e3/GC_nu-q2, GC_rp-e2/GC_rp4.
