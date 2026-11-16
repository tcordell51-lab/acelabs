#!/usr/bin/env python3
"""Replace The Climb's tier 1 (test 1, 40 questions) with DAT-level originals (2026-11-16).

    python3 scripts/climb-tier1-dat-level.py           check only
    python3 scripts/climb-tier1-dat-level.py --write   write tools/minitests/source/minitest-source.json

Same ten topics per section as before, same order. Every computable key is checked here before
anything is written; the rest are listed for Thomas's review (he signs off on exact questions).
Numeric choices are written in ascending order (the DAT convention; the assembler leaves them in place).
"""
import json
import os
import sys
from fractions import Fraction as F

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'tools', 'minitests', 'source', 'minitest-source.json')

Q = []
def q(section, topic, stem, choices, correct, explanation):
    Q.append({'section': section, 'topic': topic, 'stem': stem, 'choices': choices, 'correct': correct, 'explanation': explanation})

# ---------------------------------------------------------------- Biology
q('bio', 'Biomolecules', 'A protein is treated with a reagent that breaks hydrogen bonds but leaves covalent bonds intact. Which level of its structure is least likely to be disrupted?',
  ['Primary structure', 'Secondary structure', 'Tertiary structure', 'Quaternary structure', 'Every level equally'], 0,
  'Primary structure is the amino acid sequence, held together by covalent peptide bonds, so it survives. Secondary structure (alpha helices and beta sheets) is held entirely by backbone hydrogen bonds, and tertiary and quaternary structure depend partly on hydrogen bonds between side chains and between subunits.')
q('bio', 'Cell structure & organelles', 'A cell cannot add mannose-6-phosphate tags to the hydrolytic enzymes it makes. Where are those enzymes most likely to end up?',
  ['Secreted out of the cell', 'Inside the nucleus', 'In the peroxisomes', 'In the mitochondrial matrix', 'Held in the smooth ER'], 0,
  'In the Golgi, the mannose-6-phosphate tag sends hydrolytic enzymes to the lysosomes. Without the tag they follow the default route of the secretory pathway and leave the cell, which is what happens in I-cell disease. Nothing about the tag sends proteins to the nucleus, peroxisomes or mitochondria.')
q('bio', 'Membrane transport', 'A red blood cell, with an internal solute concentration of about 0.3 M, is placed in a 0.5 M solution of a solute that cannot cross its membrane. What happens?',
  ['Water leaves and the cell shrinks', 'Water enters and the cell swells', 'Solute enters until both sides match', 'No water moves at all', 'Water enters until the cell bursts'], 0,
  'The outside solution is hypertonic, so water moves by osmosis from the cell toward the higher solute concentration, and the cell shrinks (crenates). The solute cannot cross, so only water moves. Swelling and bursting happen in a hypotonic solution.')
q('bio', 'Cellular respiration', 'A poison blocks complex IV of the electron transport chain. Which change is expected in the mitochondria?',
  ['Oxygen use falls and NADH builds up', 'Oxygen use rises to compensate', 'The proton gradient grows steeper', 'ATP synthase runs faster', 'Glycolysis stops for lack of glucose'], 0,
  'Complex IV hands electrons to oxygen. Blocked, the chain backs up: oxygen is no longer consumed, NADH cannot be oxidized and accumulates, proton pumping stops, the gradient collapses and ATP synthesis falls. Glycolysis can continue, with fermentation regenerating NAD+.')
q('bio', 'Photosynthesis', 'A plant is given water labeled with oxygen-18 and unlabeled carbon dioxide. Where does the label appear first?',
  ['In the O₂ the plant releases', 'In the glucose from the Calvin cycle', 'In the CO₂ the plant gives off', 'In RuBP in the stroma', 'In NADPH from photosystem I'], 0,
  'Photosystem II splits water to replace its lost electrons, and the oxygen atoms from water leave as O₂. The oxygen in glucose comes from carbon dioxide fixed in the Calvin cycle, which is why the classic isotope experiments traced released O₂ to water.')
q('bio', 'Central dogma (DNA->RNA->protein)', "A template DNA strand reads 3'-TACGGATCA-5'. What is the mRNA transcribed from it?",
  ["5'-AUGCCUAGU-3'", "5'-UACGGAUCA-3'", "3'-AUGCCUAGU-5'", "5'-ATGCCTAGT-3'", "5'-UGAUCCGUA-3'"], 0,
  "RNA polymerase reads the template 3' to 5' and builds mRNA 5' to 3', pairing A with U, T with A, C with G and G with C. The complement of 3'-TACGGATCA-5' is 5'-AUGCCUAGU-3'. Copying the template, flipping the ends, or using T in RNA are the usual slips.")
q('bio', 'Mitosis & meiosis', 'An organism has a diploid number of 16 (2n = 16). How many chromosomes and chromatids does one cell hold at metaphase II of meiosis?',
  ['8 chromosomes, 16 chromatids', '16 chromosomes, 32 chromatids', '8 chromosomes, 8 chromatids', '16 chromosomes, 16 chromatids', '4 chromosomes, 8 chromatids'], 0,
  'Meiosis I separates homologs, so each cell entering meiosis II is haploid: 8 chromosomes. The sister chromatids have not yet split (that happens in anaphase II), so each chromosome still has two chromatids: 16 in all.')
q('bio', 'Mendelian genetics', 'In the cross AaBb x aabb, the two genes assort independently and each shows complete dominance. What fraction of the offspring show both dominant phenotypes?',
  ['1/16', '1/8', '1/4', '3/8', '9/16'], 2,
  'Aa x aa gives 1/2 dominant for the first trait, and Bb x bb gives 1/2 dominant for the second. Independent assortment multiplies them: 1/2 x 1/2 = 1/4. 9/16 belongs to a dihybrid cross of two heterozygotes, not this test cross.')
q('bio', 'Evolution & population genetics', 'A population is in Hardy-Weinberg equilibrium, and 16 percent of its members show the recessive phenotype. What percent are heterozygous?',
  ['16%', '24%', '36%', '48%', '60%'], 3,
  'The recessive phenotype is q squared = 0.16, so q = 0.4 and p = 0.6. Heterozygotes are 2pq = 2(0.6)(0.4) = 0.48, or 48 percent. 36 percent is p squared, the homozygous dominant share.')
q('bio', 'Physiology (a body system)', 'Which sequence traces a red blood cell from the right ventricle to the left ventricle?',
  ['Pulmonary artery, lungs, pulmonary vein, left atrium', 'Pulmonary vein, lungs, pulmonary artery, left atrium', 'Aorta, lungs, venae cavae, left atrium', 'Pulmonary artery, lungs, venae cavae, left atrium', 'Pulmonary artery, left atrium, lungs, pulmonary vein'], 0,
  'The right ventricle pumps oxygen-poor blood into the pulmonary artery to the lungs. Oxygen-rich blood returns through the pulmonary veins to the left atrium, then passes the mitral valve into the left ventricle. Arteries carry blood away from the heart and veins carry it back.')

# ---------------------------------------------------------------- General Chemistry
q('gchem', 'Moles & stoichiometry', 'How many grams of water form when 4.0 g of H₂ reacts completely with excess O₂? (H = 1.0 g/mol, O = 16.0 g/mol)',
  ['9.0 g', '18 g', '32 g', '36 g', '72 g'], 3,
  '2H₂ + O₂ gives 2H₂O. 4.0 g of H₂ is 2.0 mol, which makes 2.0 mol of water, and 2.0 mol x 18.0 g/mol = 36 g. 18 g forgets that two moles form; 72 g doubles twice.')
q('gchem', 'Atomic structure & quantum numbers', 'Which set of quantum numbers (n, l, ml, ms) is not allowed?',
  ['(2, 2, 0, +1/2)', '(3, 2, -2, -1/2)', '(2, 1, -1, +1/2)', '(4, 0, 0, -1/2)', '(3, 1, 1, +1/2)'], 0,
  'The angular momentum number l runs from 0 to n - 1, so with n = 2, l can only be 0 or 1. Every other set obeys the rules: ml runs from -l to +l, and ms is +1/2 or -1/2.')
q('gchem', 'Periodic trends', 'Which lists these ions in order of increasing radius: Mg²⁺, Na⁺, F⁻, O²⁻?',
  ['Mg²⁺ < Na⁺ < F⁻ < O²⁻', 'O²⁻ < F⁻ < Na⁺ < Mg²⁺', 'Na⁺ < Mg²⁺ < O²⁻ < F⁻', 'F⁻ < O²⁻ < Mg²⁺ < Na⁺', 'Mg²⁺ < Na⁺ < O²⁻ < F⁻'], 0,
  'All four ions have 10 electrons. With the same electron count, more protons pull the cloud in tighter: Mg (12 protons) is smallest, then Na (11), F (9), and O (8) is largest.')
q('gchem', 'Bonding, Lewis & VSEPR', 'What is the molecular geometry of XeF₄, and is the molecule polar?',
  ['Square planar, nonpolar', 'Tetrahedral, nonpolar', 'Seesaw shaped, polar', 'Square pyramidal, polar', 'Square planar, polar'], 0,
  'Xenon has four bonds and two lone pairs: six electron domains, octahedral. The lone pairs sit opposite each other, leaving the four fluorines in a square plane. The four bond dipoles cancel, so the molecule is nonpolar.')
q('gchem', 'Gas laws', 'A 2.0 L sample of gas at 300 K and 1.0 atm is heated to 450 K, and its pressure rises to 1.5 atm. What is its new volume?',
  ['0.89 L', '1.3 L', '2.0 L', '3.0 L', '4.5 L'], 2,
  'Combined gas law: V2 = V1 x (P1/P2) x (T2/T1) = 2.0 L x (1.0/1.5) x (450/300) = 2.0 L. The temperature rise alone would give 3.0 L, and the pressure rise alone 1.3 L; together they cancel.')
q('gchem', 'Thermochemistry', 'C(s) + O₂(g) → CO₂(g) has ΔH = -394 kJ, and CO(g) + ½O₂(g) → CO₂(g) has ΔH = -283 kJ. What is ΔH for C(s) + ½O₂(g) → CO(g)?',
  ['-677 kJ', '-394 kJ', '-111 kJ', '+111 kJ', '+283 kJ'], 2,
  "Hess's law: keep the first equation and reverse the second (CO₂ → CO + ½O₂, ΔH = +283 kJ). Adding them gives C + ½O₂ → CO with ΔH = -394 + 283 = -111 kJ. -677 kJ adds the two without reversing.")
q('gchem', 'Kinetics', 'A reaction has the rate law rate = k[A]²[B]. What happens to the rate when [A] is doubled and [B] is halved?',
  ['It is halved', 'It stays the same', 'It doubles', 'It quadruples', 'It increases eightfold'], 2,
  'Doubling [A] multiplies the rate by 2 squared = 4, and halving [B] multiplies it by 1/2. Together: 4 x 1/2 = 2, so the rate doubles.')
q('gchem', 'Equilibrium', 'For N₂(g) + 3H₂(g) ⇌ 2NH₃(g), ΔH = -92 kJ. Which change shifts the equilibrium toward more NH₃?',
  ['Lowering the temperature', 'Raising the temperature', 'Increasing the volume', 'Adding a catalyst', 'Adding helium at constant volume'], 0,
  'The forward reaction releases heat, so cooling favors it. A larger volume favors the side with more gas moles (the left: 4 versus 2). A catalyst speeds both directions equally, and an inert gas at constant volume changes no partial pressure.')
q('gchem', 'Acids, bases & pH', 'What is the pH of a 0.010 M solution of NaOH at 25 °C?',
  ['2.0', '7.0', '10.0', '12.0', '13.0'], 3,
  'NaOH is a strong base, so [OH-] = 0.010 M and pOH = 2.0. At 25 °C, pH + pOH = 14, so pH = 12.0. 2.0 is the pOH, the usual slip.')
q('gchem', 'Electrochemistry', 'A galvanic cell is built from Ag⁺/Ag (E° = +0.80 V) and Cu²⁺/Cu (E° = +0.34 V). Which statement is true?',
  ['Cu is oxidized; E°cell = +0.46 V', 'Ag is oxidized; E°cell = +0.46 V', 'Cu is oxidized; E°cell = +1.14 V', 'Ag is oxidized; E°cell = +1.14 V', 'Cu is reduced; E°cell = -0.46 V'], 0,
  'Silver has the higher reduction potential, so Ag⁺ is reduced at the cathode and copper is oxidized at the anode. E°cell = E°cathode - E°anode = 0.80 - 0.34 = +0.46 V. Adding the potentials (1.14 V) is the trap.')

# ---------------------------------------------------------------- Organic Chemistry
q('ochem', 'IUPAC nomenclature', 'What is the IUPAC name of CH₃CH(CH₃)CH₂CH(CH₂CH₃)CH₃?',
  ['2,4-dimethylhexane', '4-ethyl-2-methylpentane', '2-ethyl-4-methylpentane', '3,5-dimethylhexane', '2,4-dimethylpentane'], 0,
  'The longest chain runs through the ethyl group: six carbons, a hexane. Numbered from the end nearer the branches, the methyls sit on carbons 2 and 4. Names built on pentane miss the longer chain, and 3,5 numbers from the wrong end.')
q('ochem', 'Stereochemistry (R/S, chirality)', 'How many stereoisomers exist for 2,3-dibromobutane?',
  ['1', '2', '3', '4', '8'], 2,
  'There are two stereocenters, so at most 2 squared = 4. But the two ends of the molecule are identical, so the (2R,3S) and (2S,3R) forms are one and the same meso compound. That leaves the (R,R) and (S,S) enantiomers plus the meso form: 3.')
q('ochem', 'SN1/SN2/E1/E2', 'Which compound reacts fastest with sodium iodide in acetone, an SN2 reaction?',
  ['CH₃CH₂Br', '(CH₃)₃CBr', '(CH₃)₂CHBr', 'CH₃CH₂Cl', 'CH₃CH₂F'], 0,
  'SN2 needs an unhindered carbon and a good leaving group. Bromoethane is primary, and bromide leaves far better than chloride or fluoride. The tertiary bromide is too crowded for backside attack, and the secondary one is slower than the primary.')
q('ochem', 'Alkene addition reactions', 'What is the major product when 2-methylpropene reacts with HBr with no peroxides present?',
  ['2-bromo-2-methylpropane', '1-bromo-2-methylpropane', '2-bromobutane', '1,2-dibromo-2-methylpropane', '2-methylpropan-2-ol'], 0,
  'H⁺ adds first to the carbon with more hydrogens, giving the more stable tertiary carbocation; bromide then bonds to that carbon (Markovnikov addition). The 1-bromo product forms only by the radical route that peroxides start.')
q('ochem', 'Aromaticity & EAS', 'Toluene is nitrated with HNO₃ and H₂SO₄. What are the main products?',
  ['Ortho- and para-nitrotoluene', 'Meta-nitrotoluene alone', 'Ortho- and meta-nitrotoluene', 'Para-nitrobenzoic acid', 'Nitrobenzene and methanol'], 0,
  'The methyl group donates electron density and activates the ring, and it directs the incoming nitro group to the ortho and para positions, where the carbocation intermediate is best stabilized. Meta products come from deactivating groups such as -NO₂ or -COOH.')
q('ochem', 'Alcohols & carbonyls', 'Which reagent oxidizes a primary alcohol to an aldehyde and stops there?',
  ['PCC in CH₂Cl₂', 'KMnO₄ with heat', 'CrO₃ in aqueous acid', 'NaBH₄ in methanol', 'LiAlH₄, then H₃O⁺'], 0,
  'PCC is a mild oxidant used without water, so the aldehyde is not hydrated and oxidized further. Permanganate and chromic acid in water go on to the carboxylic acid. NaBH₄ and LiAlH₄ are reducing agents.')
q('ochem', 'Acidity & pKa', 'Which compound is the strongest acid?',
  ['CF₃COOH', 'CH₃COOH', 'ClCH₂COOH', 'C₆H₅OH', 'CH₃CH₂OH'], 0,
  'All three carboxylic acids are stronger than phenol and ethanol because the carboxylate is resonance stabilized. Among them, three fluorines pull electron density from the carboxylate most strongly, stabilizing it best, so trifluoroacetic acid is strongest.')
q('ochem', 'Resonance & stability', 'Which carbocation is the most stable?',
  ['C₆H₅CH₂⁺ (benzyl)', 'CH₃CH₂CH₂⁺ (propyl)', 'CH₃CH₂⁺ (ethyl)', 'CH₂=CH⁺ (vinyl)', 'C₆H₅⁺ (phenyl)'], 0,
  'The benzyl cation spreads its positive charge over the ring by resonance. Propyl and ethyl are primary, with only a little stabilization from neighboring C-H bonds, and the vinyl and phenyl cations hold the charge in an sp² orbital that cannot overlap with any pi system, which makes them very unstable.')
q('ochem', 'IR & H-NMR spectroscopy', 'A compound with formula C₃H₆O shows a strong IR band near 1715 cm⁻¹ and a single peak in its ¹H NMR spectrum. What is it?',
  ['Propanone', 'Propanal', 'Prop-2-en-1-ol', 'Methoxyethene', 'Cyclopropanol'], 0,
  'A strong band near 1715 cm⁻¹ is a ketone C=O. Propanone (acetone) has six equivalent hydrogens, so its NMR spectrum shows one peak. Propanal has a C=O but three sets of hydrogens, including the aldehyde H near 9.7 ppm; the alcohols would show a broad O-H band instead.')
q('ochem', 'Synthesis / roadmap', 'Which sequence converts bromobenzene into benzoic acid?',
  ['Mg, then CO₂, then H₃O⁺', 'Hot aqueous NaOH', 'KMnO₄ with heat', 'NaCN in DMSO, then H₃O⁺ and heat', 'CH₃Cl and AlCl₃, then H₃O⁺'], 0,
  'Magnesium turns bromobenzene into a Grignard reagent, which attacks CO₂ to give a carboxylate; acid workup gives benzoic acid. Aryl halides do not undergo SN2 with cyanide, and permanganate oxidizes alkyl side chains, which bromobenzene does not have.')

# ---------------------------------------------------------------- Quantitative Reasoning (every key computed below)
q('qr', 'Fractions & decimals', 'What is the value of (2/3 + 0.75) ÷ 1 1/6?',
  ['14/17', '17/14', '55/42', '17/12', '119/72'], 1,
  'Add first: 2/3 + 3/4 = 8/12 + 9/12 = 17/12. Then divide by 7/6: 17/12 x 6/7 = 17/14. 55/42 comes from dividing before adding, and 119/72 from multiplying by 7/6 instead of dividing.')
q('qr', 'Algebra & equations', 'If 3(2x - 5) = 4x + 7, what is the value of x?',
  ['-4', '2.2', '6', '11', '22'], 3,
  'Distribute: 6x - 15 = 4x + 7. Subtract 4x and add 15: 2x = 22, so x = 11. Distributing the 3 to only the first term gives 6, and forgetting to divide by 2 gives 22.')
q('qr', 'Ratios & proportions', 'A map uses a scale of 1.5 cm to 12 km. Two towns are 7.5 cm apart on the map. How far apart are they in kilometers?',
  ['18 km', '48 km', '60 km', '90 km', '112.5 km'], 2,
  '7.5 cm is 7.5 / 1.5 = 5 scale units, and 5 x 12 km = 60 km. Multiplying 7.5 by 12 skips the 1.5 cm in the scale and gives 90 km.')
q('qr', 'Percentages', 'A price rises by 20 percent and then falls by 20 percent. The final price is what percent of the original?',
  ['80%', '96%', '100%', '104%', '120%'], 1,
  'Multiply the factors: 1.20 x 0.80 = 0.96, so the final price is 96 percent of the original. The fall is 20 percent of a larger number, so the two changes do not cancel.')
q('qr', 'Exponents & roots', 'What is the value of 8^(2/3) × 4^(-1/2)?',
  ['1/2', '1', '2', '4', '8'], 2,
  '8^(1/3) = 2, so 8^(2/3) = 4. 4^(1/2) = 2, so 4^(-1/2) = 1/2. The product is 4 x 1/2 = 2.')
q('qr', 'Geometry (area/volume)', 'A cone is carved out of a cylinder with the same radius, 3, and the same height, 8. What volume of the cylinder remains?',
  ['24π', '48π', '64π', '72π', '96π'], 1,
  'The cylinder holds πr²h = π(9)(8) = 72π. A cone with the same base and height is one third of that, 24π. What remains is 72π - 24π = 48π.')
q('qr', 'Trigonometry', 'In a right triangle, tan θ = 5/12. What is sin θ?',
  ['5/13', '5/12', '12/13', '13/12', '12/5'], 0,
  'tan θ = opposite/adjacent = 5/12, so the hypotenuse is √(25 + 144) = 13. sin θ = opposite/hypotenuse = 5/13. 12/13 is cos θ.')
q('qr', 'Probability', 'Two fair six-sided dice are rolled. What is the probability that their sum is 8?',
  ['1/12', '1/9', '5/36', '1/6', '2/11'], 2,
  'There are 36 equally likely outcomes, and five give a sum of 8: (2,6), (3,5), (4,4), (5,3), (6,2). So the probability is 5/36. 2/11 treats the eleven possible sums as equally likely, which they are not.')
q('qr', 'Statistics (mean/median/SD)', 'The mean of five numbers is 12. When a sixth number is added, the mean becomes 13. What is the sixth number?',
  ['13', '15', '18', '20', '78'], 2,
  'The five numbers sum to 5 x 12 = 60. Six numbers with a mean of 13 sum to 78. The sixth number is 78 - 60 = 18.')
q('qr', 'Word problems (rate/work/mixture)', 'Pipe A fills a tank in 6 hours and pipe B fills it in 3 hours. How long do they take to fill it together?',
  ['1.5 hours', '2 hours', '3 hours', '4.5 hours', '9 hours'], 1,
  'Add the rates: 1/6 + 1/3 = 1/6 + 2/6 = 1/2 of the tank per hour, so together they take 2 hours. Averaging the times (4.5 hours) is the classic trap.')


# ---------------------------------------------------------------- checks
def checks():
    out = []
    def ok(i, cond, what):
        out.append((i, bool(cond), what))
    by = {(x['section'], x['topic']): (k, x) for k, x in enumerate(Q)}
    def key(sec, topic):
        k, x = by[(sec, topic)]
        return k, x['choices'][x['correct']]
    # QR, all ten
    k, a = key('qr', 'Fractions & decimals'); ok(k, F(a) == (F(2, 3) + F(3, 4)) / (1 + F(1, 6)), 'fraction arithmetic')
    k, a = key('qr', 'Algebra & equations'); x = F(a); ok(k, 3 * (2 * x - 5) == 4 * x + 7, 'linear equation')
    k, a = key('qr', 'Ratios & proportions'); ok(k, float(a.split()[0]) == 7.5 / 1.5 * 12, 'scale')
    k, a = key('qr', 'Percentages'); ok(k, abs(float(a[:-1]) / 100 - 1.2 * 0.8) < 1e-12, 'successive percent')
    k, a = key('qr', 'Exponents & roots'); ok(k, abs(float(F(a)) - 8 ** (2 / 3) * 4 ** -0.5) < 1e-12, 'exponents')
    k, a = key('qr', 'Geometry (area/volume)'); ok(k, int(a[:-1]) == 9 * 8 - 9 * 8 // 3, 'cylinder minus cone, in units of π')
    k, a = key('qr', 'Trigonometry'); ok(k, F(a) == F(5, 13), 'sin from tan 5/12 (5-12-13)')
    k, a = key('qr', 'Probability'); ok(k, F(a) == F(sum(1 for i in range(1, 7) for j in range(1, 7) if i + j == 8), 36), 'two dice')
    k, a = key('qr', 'Statistics (mean/median/SD)'); ok(k, int(a) == 6 * 13 - 5 * 12, 'added value from means')
    k, a = key('qr', 'Word problems (rate/work/mixture)'); ok(k, float(a.split()[0]) == 1 / (F(1, 6) + F(1, 3)), 'work rate')
    # computable science keys
    k, a = key('bio', 'Central dogma (DNA->RNA->protein)')
    tmpl = 'TACGGATCA'; comp = ''.join({'A': 'U', 'T': 'A', 'C': 'G', 'G': 'C'}[c] for c in tmpl)
    ok(k, a == "5'-" + comp + "-3'", 'transcription of the 3-to-5 template')
    k, a = key('bio', 'Evolution & population genetics'); qq = 0.16 ** 0.5; ok(k, abs(float(a[:-1]) / 100 - 2 * qq * (1 - qq)) < 1e-9, 'Hardy-Weinberg 2pq')
    k, a = key('bio', 'Mendelian genetics'); ok(k, F(a) == F(1, 2) * F(1, 2), 'test cross product rule')
    k, a = key('gchem', 'Moles & stoichiometry'); ok(k, float(a.split()[0]) == 4.0 / 2.0 * 18.0, 'grams of water')
    k, a = key('gchem', 'Gas laws'); ok(k, abs(float(a.split()[0]) - 2.0 * (1.0 / 1.5) * (450 / 300)) < 1e-9, 'combined gas law')
    k, a = key('gchem', 'Thermochemistry'); ok(k, int(a.split()[0]) == -394 + 283, "Hess's law")
    k, a = key('gchem', 'Kinetics'); ok(k, a == 'It doubles' and 2 ** 2 * 0.5 == 2, 'rate law')
    k, a = key('gchem', 'Acids, bases & pH'); ok(k, float(a) == 14 - 2.0, 'pH of 0.010 M NaOH')
    k, a = key('gchem', 'Electrochemistry'); ok(k, '+0.46' in a and abs(0.80 - 0.34 - 0.46) < 1e-9, 'E cell')
    try:
        from rdkit import Chem
        from rdkit.Chem.EnumerateStereoisomers import EnumerateStereoisomers
        k, a = key('ochem', 'Stereochemistry (R/S, chirality)')
        n = len({Chem.MolToSmiles(m) for m in EnumerateStereoisomers(Chem.MolFromSmiles('CC(Br)C(Br)C'))})
        ok(k, int(a) == n, 'stereoisomers of 2,3-dibromobutane by RDKit (%d)' % n)
        k, a = key('ochem', 'IUPAC nomenclature')
        m = Chem.MolFromSmiles('CC(C)CC(CC)C')
        dm = Chem.GetDistanceMatrix(m); ok(k, int(dm.max()) + 1 == 6 and a.endswith('hexane'), 'longest chain is six carbons (RDKit)')
    except ImportError:
        pass
    return out


def main():
    assert len(Q) == 40 and all(len(x['choices']) == 5 for x in Q)
    for x in Q:
        assert len(set(x['choices'])) == 5, x['stem']
        L = [len(c) for c in x['choices']]; d = [l for i, l in enumerate(L) if i != x['correct']]
        if L[x['correct']] > 1.15 * (sum(d) / 4):
            print('length tell:', x['stem'][:60], L)
    res = checks()
    bad = [r for r in res if not r[1]]
    for i, good, what in res:
        print('%-4s %-6s %s' % ('ok' if good else 'FAIL', Q[i]['section'], what))
    print('%d of 40 keys checked in code, %d failed. The other %d are for Thomas to review.' % (len(res), len(bad), 40 - len(res)))
    if bad:
        sys.exit(1)
    if '--write' in sys.argv:
        src = json.load(open(SRC))
        t1 = src['tests'][0]
        assert t1['n'] == 1 and t1['tier'] == 1
        old_topics = [x['topic'] for x in t1['questions']]
        assert old_topics == [x['topic'] for x in Q], 'topic order changed'
        t1['questions'] = Q
        t1['note'] = 'Tier 1 rewritten at DAT level on 2026-11-16 (scripts/climb-tier1-dat-level.py). Earlier recall items are in git history.'
        json.dump(src, open(SRC, 'w'), indent=1, ensure_ascii=False)
        print('wrote', SRC)


if __name__ == '__main__':
    main()
