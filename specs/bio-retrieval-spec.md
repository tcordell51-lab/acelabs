# Bio Retrieval Question Content Gap — Spec

**Date:** 2026-05-06  
**Author:** AceLabs content audit  
**Status:** SPEC ONLY — no production edits

---

## 1. Catalogue of Stub Locations

`tools/bio/bio-shared.js` defines 26 nodes in the `NODES` object. Each node holds a `retrievals` block with 3 tier slots. Five nodes (`ped`, `hwb`, `cdv`, `nph`, `spc`) already have real question and explanation text. The remaining **23 nodes** each have all three tiers stubbed with literal `"(question)"` / `"(answer)"` placeholders, for a total of **69 stub entries**.

Stubs follow this pattern on every stubbed line:

```js
{ rt:"Right.", wr:"Review the explanation.", q:"(question)", qh:"(answer)", ex:"(question) The correct answer is: ." }
```

Fields:
- `q` — the question prompt shown to the student
- `qh` — the short-form correct answer
- `ex` — the full explanation paragraph (the "why")
- `rt` — feedback on a correct answer (currently generic "Right.")
- `wr` — feedback on a wrong answer (currently generic "Review the explanation.")

### Full Stub Catalogue

| # | Node ID | Node Name | Lines (approx) | Tiers Stubbed | Category |
|---|---------|-----------|----------------|---------------|----------|
| 1 | `rep` | DNA Replication | 47–51 | 1, 2, 3 | Cell & Molecular |
| 2 | `trc` | Transcription | 61–65 | 1, 2, 3 | Cell & Molecular |
| 3 | `tln` | Translation | 75–79 | 1, 2, 3 | Cell & Molecular |
| 4 | `mit` | Mitosis | 89–93 | 1, 2, 3 | Cell & Molecular |
| 5 | `men` | Mendelian Genetics | 103–107 | 1, 2, 3 | Genetics |
| 6 | `ap` | Action Potential | 117–121 | 1, 2, 3 | Physiology |
| 7 | `mei` | Meiosis | 131–135 | 1, 2, 3 | Cell & Molecular |
| 8 | `gly` | Glycolysis | 145–149 | 1, 2, 3 | Biochemistry |
| 9 | `wat` | Water + Biomolecules | 159–163 | 1, 2, 3 | Biochemistry |
| 10 | `car` | Carbohydrates | 173–177 | 1, 2, 3 | Biochemistry |
| 11 | `lip` | Lipids | 187–191 | 1, 2, 3 | Biochemistry |
| 12 | `pro` | Proteins | 201–205 | 1, 2, 3 | Biochemistry |
| 13 | `nuc` | Nucleic Acids | 215–219 | 1, 2, 3 | Biochemistry |
| 14 | `enz` | Enzymes | 229–233 | 1, 2, 3 | Biochemistry |
| 15 | `pve` | Prokaryote vs Eukaryote | 243–247 | 1, 2, 3 | Cell Biology |
| 16 | `org` | Organelles | 257–261 | 1, 2, 3 | Cell Biology |
| 17 | `mtr` | Membrane Transport | 271–275 | 1, 2, 3 | Cell Biology |
| 18 | `sig` | Cell Signaling | 285–289 | 1, 2, 3 | Cell & Molecular |
| 19 | `krb` | Krebs Cycle + ETC | 299–303 | 1, 2, 3 | Biochemistry |
| 20 | `pho` | Photosynthesis | 313–317 | 1, 2, 3 | Biochemistry |
| 21 | `dom` | Three Domains | 327–331 | 1, 2, 3 | Diversity / Evolution |
| 22 | `fer` | Fertilization | 341–345 | 1, 2, 3 | Reproduction |
| 23 | `nse` | Natural Selection | 355–359 | 1, 2, 3 | Evolution |

**Already populated (do not re-author):** `ped` (pedigrees), `hwb` (Hardy-Weinberg), `cdv` (cardiovascular), `nph` (nephron), `spc` (speciation).

---

## 2. Example Questions by Node

Three tiers per node. Each question is followed by a 2–3 sentence explanation and formatted as a JSON-mergeable snippet ready to drop into `bio-shared.js`. Only the fields `q`, `qh`, `ex`, `rt`, and `wr` are shown; the surrounding object key (`1:`, `2:`, `3:`) is already present in the file.

### `rep` — DNA Replication

```json
1: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Helicase unwinds the double helix at the replication fork. Which protein binds immediately to prevent the single strands from re-annealing?",
  "qh": "Single-strand binding proteins (SSBs) stabilize the unwound strands.",
  "ex": "SSB proteins coat each exposed single strand after helicase separates them, keeping the template available for polymerase and preventing hairpin formation. Without SSBs the strands would snap back together, stalling the fork. They are displaced non-destructively as DNA pol III reads each template."
},
2: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "DNA pol III can only extend an existing 3'-OH. Which enzyme lays the starting point on the lagging strand, and what is that starting point called?",
  "qh": "Primase lays down a short RNA primer, providing the 3'-OH that pol III extends.",
  "ex": "Primase synthesizes a short (~10 nt) RNA sequence complementary to the template, creating the 3'-OH that DNA pol III requires for extension. On the lagging strand this happens repeatedly — one primer per Okazaki fragment. DNA pol I later removes each RNA primer and replaces it with DNA; ligase seals the remaining nicks."
},
3: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "A mutation eliminates DNA ligase activity. A cell attempts replication. What is the structural consequence in the daughter chromosomes?",
  "qh": "Okazaki fragments on the lagging strand remain as nicks — the phosphodiester backbone is discontinuous.",
  "ex": "Ligase seals the nick between the 3'-OH of a newly synthesized DNA segment and the 5'-phosphate of the adjacent Okazaki fragment. Without it the lagging strand is a series of short fragments held together only by hydrogen bonds with the template — any slight denaturation would produce single-stranded breaks. This is distinct from a double-strand break but is still lethal to the chromosome over time."
}
```

### `trc` — Transcription

```json
1: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "During bacterial transcription, sigma factor binds RNA polymerase. What specific DNA sequence does the holoenzyme recognize?",
  "qh": "The promoter (specifically the -10 and -35 elements in prokaryotes).",
  "ex": "Sigma factor confers promoter specificity on RNA polymerase core enzyme, directing it to the -10 (Pribnow box, consensus TATAAT) and -35 (TTGACA) elements upstream of the transcription start site. Once the open complex forms and elongation begins, sigma dissociates. Different sigma factors recognize different promoters, allowing global transcription reprogramming (e.g., heat-shock response)."
},
2: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "RNA polymerase in prokaryotes does not need a separate helicase to open the template. How does it separate the two strands at the open complex?",
  "qh": "RNA polymerase itself melts ~13 bp of DNA around the -10 element using energy from ATP hydrolysis and sigma-assisted strand separation.",
  "ex": "The sigma factor makes sequence-specific contacts that destabilize the -10 region, and RNA polymerase itself catalyzes local strand separation (the 'open complex'), unwinding roughly 13 base pairs. No separate helicase is required in prokaryotes. The melted bubble moves with the polymerase during elongation, while topoisomerase I relieves torsional stress ahead of the moving complex."
},
3: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "In intrinsic (rho-independent) termination, transcription stops before a protein factor acts. What structural feature of the nascent RNA triggers release?",
  "qh": "A GC-rich hairpin in the RNA followed by a run of U residues destabilizes the RNA-DNA hybrid and stalls the polymerase.",
  "ex": "The nascent RNA folds into a GC-rich stem-loop just after it exits the polymerase. This hairpin strains the elongation complex and is immediately followed by a poly-U tract (which forms weak rU:dA base pairs with the template). Together these cause the RNA to dissociate from the DNA template. Rho-dependent termination is distinct: the Rho hexamer tracks the RNA and uses ATPase activity to catch and displace a stalled polymerase."
}
```

### `tln` — Translation

```json
1: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "The small ribosomal subunit (30S in prokaryotes) binds the mRNA before the large subunit joins. What sequence on prokaryotic mRNA recruits the small subunit?",
  "qh": "The Shine-Dalgarno sequence, which base-pairs with the 3' end of 16S rRNA.",
  "ex": "The Shine-Dalgarno (SD) sequence is a purine-rich region ~5-10 nt upstream of the AUG start codon. It base-pairs with a complementary sequence at the 3' end of 16S rRNA, positioning the ribosome so the initiator fMet-tRNA aligns with AUG in the P site. Eukaryotes lack a Shine-Dalgarno sequence and instead use 5'-cap scanning to find the first AUG in a favorable Kozak context."
},
2: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "During elongation the ribosome has three sites: A, P, and E. In which site does peptide bond formation occur?",
  "qh": "The peptidyl transferase reaction occurs in the A site — the growing chain transfers from the P-site tRNA to the amino acid in the A site.",
  "ex": "Peptidyl transferase (an activity intrinsic to 23S rRNA of the large subunit — a ribozyme) catalyzes transfer of the growing peptide from the P-site tRNA to the amino group of the aminoacyl-tRNA in the A site, forming a new peptide bond. After translocation, the deacylated tRNA moves to the E site, the new peptidyl-tRNA shifts to P, and the A site opens for the next aminoacyl-tRNA."
},
3: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "A nonsense mutation converts a codon to UAA. No release factor is available. What happens to translation?",
  "qh": "Translation stalls with the ribosome stalled at UAA and the truncated peptide still attached to the P-site tRNA — the ribosome cannot terminate.",
  "ex": "Release factors (RF1 recognizes UAA/UAG, RF2 recognizes UAA/UGA in prokaryotes) are required to hydrolyze the peptidyl-tRNA bond and release the polypeptide. Without release factor, the ribosome simply occupies the stop codon and cannot proceed or terminate — a 'stalled ribosome' that would eventually require ribosome rescue (e.g., tmRNA in bacteria). In practice, total RF elimination is lethal; partial loss slows termination and causes read-through."
}
```

### `mit` — Mitosis

```json
1: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "At the start of prophase, chromosomes begin condensing. What structural complex compacts chromatin into visible chromosomes?",
  "qh": "Condensin complexes (SMC proteins) use ATP to fold and compact chromatin into the characteristic rod-shaped mitotic chromosomes.",
  "ex": "Condensins are ring-shaped SMC (Structural Maintenance of Chromosomes) complexes that topologically embrace DNA and drive compaction using ATP. They act in concert with cohesin (which holds sister chromatids together) and topoisomerase II (which resolves DNA tangles during compaction). Loss of condensin results in decondensed, tangled chromosomes that cannot be segregated. Cohesin, by contrast, is stepwise cleaved during mitosis — first from chromosome arms in prophase, then from centromeres at anaphase onset."
},
2: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "The spindle assembly checkpoint (SAC) arrests the cell at metaphase until all kinetochores are properly attached. What molecule is the direct inhibitor of APC/C when the checkpoint is active?",
  "qh": "The Mitotic Checkpoint Complex (MCC), containing Mad2, BubR1, Bub3, and Cdc20, sequesters Cdc20 and inhibits APC/C.",
  "ex": "Any unattached kinetochore generates a 'wait' signal by catalyzing formation of the MCC, which captures Cdc20 and prevents it from activating APC/C (anaphase-promoting complex/cyclosome). APC/C-Cdc20 is required to ubiquitinate securin and cyclin B — without APC/C activation, securin persists and inhibits separase, so cohesin remains intact and chromatids cannot separate. Once all kinetochores achieve bioriented attachment and tension, MCC assembly stops and checkpoint silencing allows rapid APC/C activation."
},
3: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Colchicine depolymerizes spindle microtubules. A cell treated with colchicine during mitosis will arrest in which phase, and why?",
  "qh": "The cell arrests in metaphase because the spindle assembly checkpoint detects unattached kinetochores and prevents anaphase onset.",
  "ex": "Colchicine (and its derivative colcemid) binds tubulin dimers and prevents polymerization, collapsing the mitotic spindle. Unattached kinetochores then generate a perpetual MCC 'wait' signal, arresting the cell in metaphase. This is exploited clinically (cancer chemotherapy, gout treatment) and in cytogenetics (cells accumulate in metaphase, then are spread for karyotyping). Note: the chromosome number is still correct at this arrest point — nondisjunction occurs later if the cell escapes arrest with an aberrant spindle."
}
```

### `men` — Mendelian Genetics

```json
1: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "In a monohybrid cross between two heterozygotes (Aa x Aa), what fraction of offspring are expected to be homozygous dominant?",
  "qh": "1/4 (25%) — one AA out of four possible genotypes (AA, Aa, Aa, aa).",
  "ex": "The Punnett square gives AA : Aa : aa = 1 : 2 : 1. Homozygous dominant (AA) = 1/4. Phenotypically, 3/4 show the dominant trait (AA + Aa) and 1/4 show the recessive trait. The classic error is confusing phenotype ratio (3:1) with genotype ratio (1:2:1) — the DAT tests this distinction directly."
},
2: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "A plant with purple flowers (dominant) is crossed with a white-flowered plant. All F1 offspring show purple flowers. When F1 plants are self-crossed, 3/4 of F2 are purple and 1/4 are white. What were the genotypes of the original parents?",
  "qh": "The purple parent was heterozygous (Pp) and the white parent was homozygous recessive (pp). The F1 cross produces Pp x Pp.",
  "ex": "The F1 being all purple means at least one dominant allele reaches every offspring, so the white parent contributes only p alleles (pp). The 3:1 F2 ratio is diagnostic of a monohybrid Pp x Pp cross. If the purple parent were PP, the F2 would be all purple. A 3:1 ratio in F2 always indicates both F1 parents are heterozygous for a single gene with complete dominance."
},
3: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Two genes assort independently (are on different chromosomes). A dihybrid AaBb individual is selfed. What fraction of offspring will be aabb?",
  "qh": "1/16 — each gene contributes 1/4 chance of homozygous recessive; 1/4 x 1/4 = 1/16.",
  "ex": "The law of independent assortment: treat each gene separately. For Aa x Aa, P(aa) = 1/4. For Bb x Bb, P(bb) = 1/4. Because the genes are on different chromosomes, multiply: 1/4 x 1/4 = 1/16. The full dihybrid F2 ratio is 9:3:3:1 (dominant-dominant : dominant-recessive : recessive-dominant : double recessive). Genes that are linked (on the same chromosome) deviate from this ratio — a fact tested in chi-square problems on the DAT."
}
```

### `ap` — Action Potential

```json
1: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "At rest, a neuron's membrane potential is approximately -70 mV. Which ion gradient is primarily responsible for maintaining this resting potential?",
  "qh": "The outward K+ gradient: K+ leaks out through resting K+ channels down its concentration gradient, leaving negative charges behind.",
  "ex": "The Na+/K+ ATPase maintains high intracellular K+ and high extracellular Na+. At rest, the membrane is far more permeable to K+ than Na+ (through leak channels). K+ flows outward down its concentration gradient, creating the negative interior charge. The equilibrium potential for K+ (approximately -90 mV, calculated by Nernst equation) is slightly more negative than resting potential, reflecting a small opposing Na+ leak inward."
},
2: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "During depolarization, voltage-gated Na+ channels open rapidly. What prevents the membrane from staying depolarized indefinitely?",
  "qh": "Voltage-gated Na+ channels inactivate (fast inactivation gate closes) within milliseconds, and voltage-gated K+ channels open to repolarize the membrane.",
  "ex": "Na+ channels have two gates: an activation gate (opens rapidly at threshold) and an inactivation gate (closes within ~1 ms of opening). Inactivation terminates Na+ influx. Simultaneously, voltage-gated K+ channels open more slowly, driving K+ out and repolarizing the membrane. The brief period when Na+ channels are inactivated (and cannot reopen even if stimulated) is the absolute refractory period — it enforces unidirectional propagation of the action potential."
},
3: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "A toxin blocks voltage-gated K+ channels without affecting Na+ channels. What change would you observe in the action potential waveform?",
  "qh": "The action potential would show a prolonged depolarization (delayed repolarization) — the membrane stays positive longer and the after-hyperpolarization would be reduced or absent.",
  "ex": "Repolarization depends primarily on K+ efflux through voltage-gated K+ channels. Blocking these channels means the membrane cannot return to resting potential quickly — the action potential plateau is extended and the after-hyperpolarization (which depends on persistent K+ efflux after repolarization) is attenuated. The absolute refractory period effectively lengthens, reducing the maximum firing frequency. This is mechanistically similar to what certain class III antiarrhythmic drugs do in cardiac tissue."
}
```

### `mei` — Meiosis

```json
1: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Crossing over occurs during which substage of prophase I, and between which structures?",
  "qh": "Pachytene; crossing over occurs between non-sister chromatids of homologous chromosomes at the synaptonemal complex.",
  "ex": "Prophase I has five substages: leptotene (chromosomes condense), zygotene (homologs begin pairing), pachytene (synapsis complete, crossing over via Holliday junctions), diplotene (synaptonemal complex dissolves, bivalents held by chiasmata), diakinesis (further condensation). Crossing over exchanges segments between non-sister chromatids of the two homologs — not sister chromatids. This generates genetic recombination and is the reason meiosis produces four non-identical haploid cells."
},
2: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "At the end of meiosis I, are the resulting cells haploid or diploid? What is the ploidy of cells entering meiosis II?",
  "qh": "Haploid: each cell has one homolog per chromosome pair (n), but each chromosome still consists of two sister chromatids.",
  "ex": "Meiosis I is the 'reductional division' — it separates homologous chromosomes. Each daughter cell receives one homolog from each pair, making it haploid (n) in terms of chromosome number. However, sister chromatids are still joined at centromeres (cohesin protected there by shugoshin), so each chromosome is still a paired structure. Meiosis II separates sister chromatids (like a mitotic division), producing four haploid cells with single chromatids."
},
3: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Nondisjunction occurs in meiosis I for chromosome 21. How many of the four resulting gametes carry an extra copy of chromosome 21?",
  "qh": "All four gametes are abnormal: two carry two copies of chr 21 and two carry zero copies.",
  "ex": "In meiosis I nondisjunction, both homologs of chromosome 21 travel to the same cell. After meiosis II (which proceeds normally), the cell with two copies produces two n+1 gametes (each with two chr 21), and the cell with zero copies produces two n-1 gametes. Compare to meiosis II nondisjunction, where only two of four gametes are abnormal (one n+1 and one n-1 from the affected division; the other two cells divide normally). This distinction — all four vs two of four abnormal — is a DAT-tested conceptual trap."
}
```

### `gly` — Glycolysis

```json
1: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Net ATP yield per glucose in glycolysis is 2 ATP. Gross ATP is 4. What accounts for the 2 ATP difference?",
  "qh": "The investment phase consumes 2 ATP (hexokinase and PFK reactions) before the payoff phase generates 4 ATP.",
  "ex": "Glycolysis has two phases. The investment phase (steps 1-5) uses 2 ATP — one at hexokinase (glucose to G6P) and one at phosphofructokinase (F6P to F1,6-bisphosphate). This traps glucose in the cell and prepares the 6-carbon molecule for cleavage. The payoff phase (steps 6-10) generates 4 ATP and 2 NADH per glucose (4 ATP from 2 molecules of G3P passing through steps 6-10). Net = 4 - 2 = 2 ATP."
},
2: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Phosphofructokinase-1 (PFK-1) is the primary regulatory enzyme of glycolysis. High ATP inhibits it. What molecule relieves this inhibition when energy is needed?",
  "qh": "AMP (and ADP) allosterically activate PFK-1 by binding to the regulatory site and restoring activity, signaling low energy charge.",
  "ex": "PFK-1 is allosterically inhibited by high ATP and citrate (signaling abundance), and activated by AMP, ADP, and fructose-2,6-bisphosphate (F2,6BP — the most potent activator in liver, regulated by insulin/glucagon via PFK-2). When ATP is high, the cell has sufficient energy and glycolysis slows. When ATP falls and AMP rises (adenylate kinase: 2 ADP = ATP + AMP), AMP signals energy deficit and activates PFK-1, accelerating flux through glycolysis."
},
3: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "A patient has a red blood cell pyruvate kinase deficiency. Their RBCs cannot complete glycolysis. Why is this a lethal situation for the RBC but not most other cell types?",
  "qh": "Mature RBCs lack mitochondria and cannot use oxidative phosphorylation — glycolysis is their only source of ATP.",
  "ex": "Mature erythrocytes have no nucleus, no mitochondria, and no organelles — they rely entirely on anaerobic glycolysis for ATP. Pyruvate kinase catalyzes the final ATP-generating step (PEP to pyruvate + ATP). Without it, ATP falls, the Na+/K+ ATPase fails, the cell swells and lyses — hemolytic anemia results. Other cell types with mitochondria can compensate via oxidative phosphorylation. PK deficiency is the second most common RBC enzymopathy after G6PD deficiency."
}
```

### `wat` — Water + Biomolecules

```json
1: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Water has an unusually high boiling point for its molecular weight. What property of water explains this?",
  "qh": "Hydrogen bonding: each water molecule can form up to 4 hydrogen bonds, requiring substantial energy to overcome in vaporization.",
  "ex": "Water (MW 18) boils at 100°C, far higher than similarly sized molecules like methane (MW 16, bp -162°C). This is because the electronegative oxygen creates partial negative charge, and the two partially positive hydrogens form H-bonds with neighboring molecules. Each water molecule can donate 2 H-bonds and accept 2, creating a dynamic tetrahedral network. Breaking enough of these bonds to vaporize requires high thermal energy — hence the high boiling point, high heat of vaporization, and water's role as a biological temperature buffer."
},
2: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "The four major biological macromolecules are carbohydrates, lipids, proteins, and nucleic acids. Which of these is NOT built from monomers linked by condensation (dehydration synthesis)?",
  "qh": "Lipids — triglycerides are assembled by ester bond formation (also a condensation reaction), but lipids are not polymers built from a repeating monomer unit in the same sense.",
  "ex": "Polysaccharides (glycosidic bonds), proteins (peptide bonds), and nucleic acids (phosphodiester bonds) are all true polymers assembled from repeating monomer units by condensation reactions. Triglycerides are assembled from glycerol and three fatty acids via ester bond formation — also a condensation reaction — but lipids lack a regular repeating monomer structure and are not polymers by the biochemical definition. The DAT sometimes tests this distinction by asking which macromolecule is not a polymer."
},
3: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Ice floats on liquid water because frozen water is less dense than liquid water. What structural feature of ice explains this?",
  "qh": "In ice, each water molecule forms 4 fixed hydrogen bonds in a crystalline lattice, spacing molecules farther apart than the dynamic H-bond network of liquid water.",
  "ex": "Liquid water has a fluctuating H-bond network; molecules are close on average but bonds break and reform continuously. In ice, every molecule is locked into 4 H-bonds in a hexagonal lattice with fixed geometry — this arrangement has more space between molecules than liquid water. Density of ice (~0.917 g/cm3) is lower than liquid water (~1.0 g/cm3). This property is critical for aquatic life: ice insulates the liquid water beneath, preventing lakes from freezing solid."
}
```

### `car` — Carbohydrates

```json
1: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Cellulose and starch are both glucose polymers. One is digestible by humans and one is not. What structural difference accounts for this?",
  "qh": "Starch uses alpha-1,4 (and alpha-1,6) glycosidic bonds (digestible); cellulose uses beta-1,4 glycosidic bonds (not digestible by human amylase).",
  "ex": "Human amylase and related digestive enzymes cleave alpha glycosidic bonds (found in starch and glycogen). Cellulose's beta-1,4 linkage orients adjacent glucose units in alternating flipped positions, creating straight rigid chains that H-bond with neighboring chains. Humans lack cellulase. The structural consequence of beta-linkages — straight fibers — is also why cellulose is the basis of plant cell walls and cotton fiber, while alpha-linked polymers form helical, branched storage polysaccharides."
},
2: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Glycogen is the storage carbohydrate in animals. Compared to plant starch, glycogen is more highly branched. Why does extensive branching benefit rapid glucose mobilization?",
  "qh": "More branch points = more non-reducing ends = more sites where glycogen phosphorylase can simultaneously cleave glucose-1-phosphate.",
  "ex": "Glycogen phosphorylase (activated by epinephrine via cAMP cascade) cleaves glucose residues from the non-reducing ends of glycogen chains. A highly branched structure (branch every ~8-12 residues via alpha-1,6 bonds) produces many non-reducing ends simultaneously accessible to phosphorylase. This allows rapid glucose release during fight-or-flight or exercise. Glycogen branching enzyme creates the branches; debranching enzyme is required to fully degrade them (glycogen phosphorylase cannot cleave the alpha-1,6 bonds itself)."
},
3: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "A patient is diagnosed with von Gierke disease (glucose-6-phosphatase deficiency). Severe hypoglycemia occurs between meals despite abundant glycogen stores. Explain why glycogen cannot rescue blood glucose.",
  "qh": "Without glucose-6-phosphatase, glycogen breakdown produces glucose-6-phosphate, which cannot exit the hepatocyte and cannot enter the bloodstream as free glucose.",
  "ex": "Glycogenolysis (and gluconeogenesis) produces glucose-6-phosphate in the liver. Glucose-6-phosphatase dephosphorylates it to free glucose, which exits via GLUT2 into the blood. Without G6Pase, glucose-6-phosphate accumulates in hepatocytes. The liver can break down glycogen but the product is trapped — it cannot be exported. Result: severe fasting hypoglycemia, hepatomegaly (glycogen/fat accumulation), and lactic acidosis. This is a DAT-style 'what breaks the pathway' clinical integration question."
}
```

### `lip` — Lipids

```json
1: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Saturated and unsaturated fatty acids differ in their melting points. Which has a higher melting point, and why?",
  "qh": "Saturated fatty acids have higher melting points because their straight chains pack tightly, maximizing van der Waals interactions.",
  "ex": "Saturated fatty acids have no double bonds — all carbons have maximum hydrogen substituents. This allows the chains to adopt a fully extended zigzag configuration and pack closely together, increasing van der Waals contact area. Unsaturated fatty acids have one or more cis double bonds, introducing a rigid kink. Kinked chains cannot pack as tightly, reducing van der Waals forces and lowering the melting point. This is why animal fats (high saturated FA content) are solid at room temperature and vegetable oils (high unsaturated FA) are liquid."
},
2: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Phospholipids are amphipathic. How does this property directly enable the formation of a cell membrane bilayer?",
  "qh": "The hydrophilic phosphate heads face aqueous environments (cytoplasm and extracellular fluid) while the hydrophobic fatty acid tails face each other, burying them from water and stabilizing the bilayer.",
  "ex": "Amphipathic means having both hydrophilic and hydrophobic regions. In an aqueous environment, the thermodynamically favorable arrangement is for hydrophobic tails to minimize contact with water — this is achieved by two layers of phospholipids oriented tail-to-tail, with heads facing out on both sides. This 'hydrophobic effect' (entropy-driven exclusion of nonpolar groups from water) is the primary driving force for bilayer formation. Cholesterol inserts between fatty acid tails to modulate fluidity."
},
3: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "A patient is prescribed a statin (HMG-CoA reductase inhibitor) to lower LDL cholesterol. Cholesterol is essential for cell membranes. Why doesn't cholesterol elimination kill cells?",
  "qh": "Statins reduce de novo cholesterol synthesis in the liver, which upregulates LDL receptors — cells increase uptake of circulating LDL cholesterol, lowering blood LDL without depleting intracellular cholesterol.",
  "ex": "Statins inhibit HMG-CoA reductase, the rate-limiting step in cholesterol biosynthesis. Decreased intracellular cholesterol in hepatocytes triggers SREBP processing, which upregulates LDL receptor expression on the hepatocyte surface. More LDL receptors remove more LDL particles from circulation. The liver still obtains cholesterol via LDL uptake, and cells throughout the body continue to receive adequate cholesterol. The net effect is lower circulating LDL without intracellular cholesterol depletion — a pharmacologically clean separation of blood levels from cellular supply."
}
```

### `pro` — Proteins

```json
1: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "The primary structure of a protein is its amino acid sequence. What type of bond links amino acids in a polypeptide chain?",
  "qh": "Peptide bonds — covalent amide bonds formed between the carboxyl group of one amino acid and the amino group of the next, with loss of water.",
  "ex": "Peptide bond formation is a condensation (dehydration) reaction catalyzed by the ribosomal peptidyl transferase (an rRNA ribozyme). The bond is a C(=O)-N linkage with partial double-bond character due to resonance — this restricts rotation around the C-N bond, creating the planar peptide unit. Rotation is only free around the N-Cα and Cα-C bonds (phi and psi angles), which defines the Ramachandran plot. The primary structure ultimately determines all higher levels of structure."
},
2: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Alpha-helices and beta-sheets are secondary structures. Both are stabilized by the same type of bond. What is it?",
  "qh": "Hydrogen bonds between backbone carbonyl oxygens and backbone amide hydrogens — not between side chains.",
  "ex": "Secondary structure is defined by regular, repeating patterns of backbone H-bonds. In an alpha-helix, the carbonyl oxygen of residue n H-bonds with the amide NH of residue n+4 (right-handed helix, ~3.6 residues/turn). In a beta-sheet, adjacent extended strands H-bond laterally. Critically, these are backbone H-bonds — they are independent of the R groups (side chains). Side chain identity influences which secondary structures a protein adopts (helix-breaker Pro, for example), but the stabilizing bonds themselves are backbone-to-backbone."
},
3: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Sickle-cell anemia arises from a single amino acid substitution (Glu6Val in beta-globin). How does this change in primary structure cause red blood cells to sickle?",
  "qh": "Valine is hydrophobic; under low O2, the Val6 of one deoxyhemoglobin fits into a hydrophobic pocket on a neighboring molecule, driving polymerization into rigid fibers that deform the RBC.",
  "ex": "Glu (charged, hydrophilic) at position 6 is replaced by Val (nonpolar). In deoxyhemoglobin (T-state), a hydrophobic pocket is exposed on the beta-subunit surface. The mutant Val6 fits snugly into this pocket on an adjacent HbS molecule, and chains of HbS polymerize into long fibers. These fibers distort the RBC into a sickle shape, increasing viscosity, causing vaso-occlusion, and triggering hemolysis. Oxygenated HbS does not polymerize — symptoms worsen during hypoxic episodes. This is the canonical example of how primary structure dictates pathological quaternary structure."
}
```

### `nuc` — Nucleic Acids

```json
1: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "A nucleotide consists of three components. Name them.",
  "qh": "A pentose sugar, a nitrogenous base, and one to three phosphate groups.",
  "ex": "The three components of a nucleotide are: (1) a five-carbon (pentose) sugar — deoxyribose in DNA (2'-H) or ribose in RNA (2'-OH); (2) a nitrogenous base — purine (adenine, guanine) or pyrimidine (cytosine, thymine [DNA] or uracil [RNA]); and (3) a phosphate group (one to three; ATP has three). The nucleoside is just sugar + base. Adding phosphate(s) gives a nucleotide (nucleoside monophosphate, diphosphate, or triphosphate). Phosphodiester bonds join nucleotides in a chain, linking the 3'-OH of one sugar to the 5'-phosphate of the next."
},
2: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Purines are double-ring bases; pyrimidines are single-ring. Which bases in DNA are purines, and which are pyrimidines?",
  "qh": "Purines: adenine and guanine. Pyrimidines: cytosine and thymine. (Memory: CUT the PY — pyrimidines are Cytosine, Uracil, Thymine.)",
  "ex": "Chargaff's rules: in any double-stranded DNA, %A = %T and %G = %C. This is because A pairs with T (2 H-bonds) and G pairs with C (3 H-bonds) — always a purine paired with a pyrimidine, keeping the helix a uniform width. A:T = 2 H-bonds, G:C = 3 H-bonds (GC pairs are stronger — higher GC content = higher Tm). RNA replaces thymine with uracil (lacks the 5-methyl group of thymine). The DAT frequently asks which bases pair and how many H-bonds each pair forms."
},
3: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Why can't RNA serve as a stable long-term genetic storage molecule the way DNA can?",
  "qh": "The 2'-OH group on ribose makes RNA susceptible to hydrolysis via 2'-OH attack on the adjacent phosphodiester bond — RNA is inherently unstable compared to DNA.",
  "ex": "The 2'-OH of ribose is a built-in nucleophile. Under basic conditions (or given enough time), the 2'-OH attacks the adjacent phosphodiester bond in an intramolecular reaction, cleaving the RNA backbone. DNA lacks the 2'-OH (deoxyribose), making it orders of magnitude more resistant to hydrolysis. This is why DNA is the molecule of heredity — it must persist through cell divisions and decades of organism life. RNA is single-stranded and short-lived by design, suited for transient information transfer (mRNA half-life minutes to hours)."
}
```

### `enz` — Enzymes

```json
1: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "An enzyme lowers the activation energy of a reaction but does not change the overall free energy change (delta G). What does this mean for the reaction's equilibrium?",
  "qh": "The equilibrium is unchanged — the enzyme speeds up both the forward and reverse reactions equally, not shifting the equilibrium position.",
  "ex": "Delta G determines whether a reaction is thermodynamically favorable (delta G < 0 = spontaneous) and the equilibrium constant (K_eq). Enzymes lower the activation energy (Ea) — the energy hill between reactants and transition state — so the reaction reaches equilibrium faster. They do not change delta G, K_eq, or the final ratio of products to reactants at equilibrium. An enzyme will therefore accelerate both the forward reaction and the reverse reaction proportionally. It cannot make a thermodynamically unfavorable reaction favorable."
},
2: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "A competitive inhibitor and a noncompetitive inhibitor both reduce enzyme velocity at a given substrate concentration. How do they differ in their effect on Km and Vmax?",
  "qh": "Competitive inhibitor: Km increases (apparent), Vmax unchanged. Noncompetitive inhibitor: Km unchanged, Vmax decreases.",
  "ex": "Competitive inhibitors bind the active site and compete with substrate — adding more substrate outcompetes them, so Vmax is preserved but more substrate is needed to reach half-Vmax (apparent Km rises). Noncompetitive inhibitors bind a separate allosteric site regardless of substrate occupancy — they reduce enzyme activity at all substrate concentrations, lowering Vmax, but do not affect how well the enzyme binds substrate (Km unchanged). Uncompetitive inhibitors (bind only enzyme-substrate complex) are rarer: both Km and Vmax decrease proportionally."
},
3: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "A feedback-inhibited pathway: the final product of a metabolic chain binds the first enzyme allosterically and shuts it down. What is the advantage of inhibiting the FIRST enzyme rather than the last?",
  "qh": "Inhibiting the first enzyme prevents unnecessary accumulation of all intermediates in the pathway — it is the most efficient regulatory checkpoint.",
  "ex": "Committed step inhibition (feedback inhibition of the first committed step) is efficient because it stops the entire pathway at the entry point. If the final product inhibited the last enzyme instead, all upstream intermediates would accumulate — wasting energy and potentially causing off-pathway reactions. The first enzyme is the 'gatekeeper'; once past it, the cell has committed resources. Classic example: threonine deaminase is the first committed step to isoleucine; isoleucine (the final product) inhibits threonine deaminase allosterically."
}
```

### `pve` — Prokaryote vs Eukaryote

```json
1: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Which feature do prokaryotes and eukaryotes share?",
  "qh": "Both have ribosomes, a plasma membrane, DNA as genetic material, and carry out transcription and translation.",
  "ex": "Despite lacking a nucleus and membrane-bound organelles, prokaryotes share the fundamental processes: DNA replication, transcription, and translation at ribosomes. Both use the same genetic code (nearly universal). Key differences: prokaryotes have 70S ribosomes (30S + 50S subunits), circular DNA without histones (though histone-like proteins exist), no nuclear envelope, and often a cell wall (peptidoglycan in bacteria). Eukaryotes have 80S ribosomes (40S + 60S), linear chromosomes with histones, nuclear envelope, and membrane-bound organelles."
},
2: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "A student claims bacteria have no DNA-organizing proteins because they lack histones. Is this correct?",
  "qh": "Incorrect — bacteria have histone-like proteins (HU, H-NS, IHF) that compact and organize the nucleoid, though they are structurally distinct from eukaryotic histones.",
  "ex": "Eukaryotic chromatin wraps DNA around octamers of H2A, H2B, H3, H4 histones with H1 linker histone — forming nucleosomes. Bacteria lack true histones but have nucleoid-associated proteins (NAPs) such as HU, IHF, Fis, and H-NS that bend, bridge, and compact the circular chromosome into the nucleoid. Without any compaction, a bacterial chromosome's contour length (~1.5 mm for E. coli) would not fit in a 2 µm cell. This is a common trap: 'no histones' does not mean 'no chromosome organization.'"
},
3: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Chloramphenicol inhibits the 50S ribosomal subunit. A patient is given chloramphenicol for a bacterial infection. Why might it also suppress mitochondrial function?",
  "qh": "Mitochondria have 70S ribosomes (50S + 30S subunits) derived from an ancestral proteobacterium — drugs that target 70S ribosomes can also inhibit mitochondrial protein synthesis.",
  "ex": "The endosymbiotic theory holds that mitochondria (and chloroplasts) descended from bacterial endosymbionts. Mitochondria retain circular DNA and 70S ribosomes. Chloramphenicol, which specifically inhibits the 50S subunit peptidyl transferase, can therefore inhibit mitochondrial ribosome function — causing mitochondrial toxicity (bone marrow suppression, 'gray baby syndrome' in neonates whose mitochondria process the drug differently). This is why aminoglycosides (30S) and chloramphenicol (50S) can cause mitochondrial side effects while drugs targeting 80S (eukaryotic cytosolic ribosomes) do not."
}
```

### `org` — Organelles

```json
1: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Which organelle makes ATP in eukaryotes, and what is the evidence that it originated from an endosymbiotic bacterium?",
  "qh": "Mitochondria make ATP via oxidative phosphorylation. Evidence: double membrane, own circular DNA, 70S ribosomes, binary fission division.",
  "ex": "The endosymbiotic theory (Lynn Margulis) is supported by: (1) mitochondria have two membranes (outer from host envelopment, inner derived from bacterial membrane); (2) circular DNA with no introns resembling alpha-proteobacteria; (3) 70S ribosomes susceptible to bacterial antibiotics; (4) they reproduce by binary fission, not de novo synthesis; (5) their phylogeny places them as derived alpha-proteobacteria. Chloroplasts show the same evidence and are descended from cyanobacteria."
},
2: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "A secreted glycoprotein travels from synthesis to exocytosis. List the organelles in order.",
  "qh": "Rough ER (synthesis + N-linked glycosylation) → Golgi (modification + sorting) → secretory vesicle → plasma membrane (exocytosis).",
  "ex": "Secretory pathway: ribosomes on rough ER co-translationally insert the protein into the ER lumen (signal sequence recognized by SRP). N-linked glycosylation begins in the ER. Vesicles bud off and fuse with the cis-Golgi face. The protein moves through cis → medial → trans Golgi stacks, with further glycan modification, phosphorylation, and sulfation. The trans-Golgi network (TGN) sorts proteins: lysosomal proteins (mannose-6-phosphate tag → lysosomes), plasma membrane proteins (vesicles → PM), secretory proteins (regulated or constitutive exocytosis)."
},
3: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Lysosomal enzymes are functional at pH ~5 but inactive at cytoplasmic pH ~7.2. What maintains the acidic lumen of the lysosome, and what happens if this pH maintenance fails?",
  "qh": "V-type H+ ATPases pump protons into the lysosome, maintaining pH ~5. Failure allows the acidic hydrolases to become inactive — undigested materials accumulate (lysosomal storage disease).",
  "ex": "Vacuolar-type H+ ATPases (V-ATPases) on the lysosomal membrane use ATP to pump H+ into the lumen, maintaining pH 4.5-5. The low pH activates all the acid hydrolases (proteases, lipases, glycosidases, nucleases) that degrade cargo delivered by autophagy, endocytosis, and phagocytosis. If V-ATPase fails or the membrane becomes leaky, pH rises, hydrolases are inactivated, and undigested substrates accumulate — the mechanism of lysosomal storage diseases (e.g., Tay-Sachs: beta-hexosaminidase A deficiency; Gaucher: glucocerebrosidase deficiency)."
}
```

### `mtr` — Membrane Transport

```json
1: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Simple diffusion and facilitated diffusion are both passive. What distinguishes them?",
  "qh": "Simple diffusion requires no protein; molecules cross the lipid bilayer directly. Facilitated diffusion requires a channel or carrier protein but still moves down the electrochemical gradient without ATP.",
  "ex": "Simple diffusion: small nonpolar or small uncharged polar molecules (O2, CO2, ethanol, urea) pass directly through the lipid bilayer. Rate is proportional to concentration gradient. Facilitated diffusion: larger, polar, or charged molecules (glucose via GLUT transporters, ions via channels) cannot cross the bilayer unaided — proteins provide a pathway. Both are passive (no ATP), both obey the second law (move from high to low concentration / electrochemical potential). Facilitated diffusion shows saturation kinetics (Vmax) because carrier/channel proteins can be saturated."
},
2: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "The Na+/K+ ATPase pumps 3 Na+ out and 2 K+ in per cycle. Why is this stoichiometry important for the resting membrane potential?",
  "qh": "The 3:2 ratio makes the pump electrogenic — it exports more positive charge than it imports, contributing a small but real hyperpolarizing current to the resting membrane potential.",
  "ex": "The Na+/K+ ATPase is electrogenic because it exports net 1 positive charge per cycle (3 Na+ out, 2 K+ in). This directly contributes a small hyperpolarizing current (~-5 mV contribution to resting potential, on top of the ~-65 mV from K+ diffusion). More importantly, the pump maintains the gradients (high K+ in, high Na+ out) that allow K+ leak channels to establish the resting potential. Ouabain (digitalis-related) blocks the pump by binding the extracellular K+ site — used to increase cardiac contractility in heart failure by raising intracellular Na+, which reduces Ca2+ extrusion via NCX."
},
3: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Aquaporins transport water but exclude ions and protons. How does a channel selectively permit water but reject the very similar H3O+ (hydronium)?",
  "qh": "The aquaporin selectivity filter has a narrow constriction and an electrostatic barrier (positively charged Arg residue) that repels the positive charge of H3O+ and forces water molecules to reorient, breaking proton transfer chains.",
  "ex": "Aquaporins achieve selectivity through two mechanisms: (1) size exclusion — the narrow selectivity filter (NPA motifs) only allows water's ~2.8 Å diameter; (2) electrostatic repulsion — a conserved arginine creates a positive electrostatic field that repels protons (H+/H3O+) and prevents proton hopping (Grotthuss mechanism). Water molecules must rotate as they traverse the channel, disrupting the hydrogen-bond chain needed for proton conduction. This is why red blood cells can rapidly equilibrate water osmotically via AQP1 without losing membrane potential — a remarkable molecular sieve."
}
```

### `sig` — Cell Signaling

```json
1: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Epinephrine binds a beta-adrenergic receptor (a GPCR). What is the first intracellular molecule produced, and what enzyme makes it?",
  "qh": "cAMP (cyclic AMP), produced by adenylyl cyclase, which is activated by the Gs alpha subunit after it exchanges GDP for GTP.",
  "ex": "Epinephrine binds the beta-2 receptor → Gs protein (alpha subunit exchanges GDP for GTP) → alpha-Gs activates adenylyl cyclase → ATP is converted to cAMP. cAMP activates protein kinase A (PKA), which phosphorylates downstream targets (glycogen phosphorylase kinase, lipase, etc.). The signal is terminated by: (1) Gs alpha's intrinsic GTPase hydrolyzes GTP to GDP → alpha-Gs inactivates; (2) phosphodiesterase degrades cAMP to AMP. Caffeine inhibits phosphodiesterase, prolonging cAMP signal."
},
2: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Insulin binds a receptor tyrosine kinase (RTK). How does RTK signaling differ mechanistically from GPCR signaling in its immediate post-receptor steps?",
  "qh": "RTK ligand binding causes receptor dimerization and trans-autophosphorylation of tyrosine residues on the cytoplasmic domain — no G protein intermediary; phosphotyrosines directly recruit adaptor proteins.",
  "ex": "GPCRs: ligand → conformation change → G protein exchange GDP/GTP → G protein subunits activate enzymes (adenylyl cyclase, PLC). RTKs: ligand binding → receptor dimerization → trans-autophosphorylation of tyrosine residues in the intracellular kinase domain → phosphotyrosines recruit SH2-domain-containing adaptor proteins (Grb2, IRS-1) → activate Ras/MAPK or PI3K/Akt pathways. RTKs directly carry enzymatic activity; GPCRs are transducers that rely on associated G proteins. Insulin specifically activates PI3K → PIP3 → Akt → GLUT4 translocation."
},
3: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Steroid hormones (cortisol, aldosterone, estrogen) act differently from peptide hormones. Where is their receptor, and why can they act in this location?",
  "qh": "Intracellular (cytoplasm or nucleus) — steroids are lipid-soluble and cross the plasma membrane directly, so the receptor need not be on the cell surface.",
  "ex": "Steroids are derived from cholesterol — lipophilic, nonpolar. They diffuse freely across the lipid bilayer. Intracellular receptors (nuclear receptor superfamily) are transcription factors in disguise: ligand binding causes a conformation change, receptor dimerization, nuclear translocation (if cytoplasmic), and direct binding to hormone response elements (HREs) in DNA, activating or repressing gene transcription. The time course is therefore slow (hours) compared to GPCR or RTK signaling (seconds to minutes). Aldosterone upregulates ENaC and Na+/K+ ATPase gene expression in the distal nephron via this mechanism."
}
```

### `krb` — Krebs Cycle + ETC

```json
1: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "One turn of the Krebs cycle yields how many NADH, FADH2, and ATP/GTP?",
  "qh": "3 NADH, 1 FADH2, 1 ATP (or GTP) per turn. Acetyl-CoA feeds 2 carbons; 2 CO2 are released.",
  "ex": "Per acetyl-CoA entering: isocitrate dehydrogenase and alpha-ketoglutarate dehydrogenase each produce 1 NADH; malate dehydrogenase produces 1 NADH (total 3 NADH). Succinate dehydrogenase produces 1 FADH2 (and is complex II of the ETC). Succinyl-CoA synthetase produces 1 GTP (= 1 ATP equivalent). Two CO2 are released per turn, accounting for the 2 carbons from acetyl-CoA. One glucose produces 2 pyruvate → 2 acetyl-CoA (via PDH) → 2 turns of Krebs = 6 NADH + 2 FADH2 + 2 GTP from Krebs alone."
},
2: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "The ETC (electron transport chain) creates an electrochemical proton gradient. Where are protons pumped to, and where does ATP synthase use them?",
  "qh": "Protons are pumped from the mitochondrial matrix to the intermembrane space (IMS) by complexes I, III, and IV. ATP synthase (complex V) lets protons flow back into the matrix to synthesize ATP.",
  "ex": "NADH donates electrons to complex I (NADH dehydrogenase), which pumps 4 H+ to the IMS. Ubiquinol carries electrons to complex III (cytochrome bc1), which pumps 4 H+. Cytochrome c carries electrons to complex IV (cytochrome c oxidase), which pumps 2 H+ and combines electrons with O2 and H+ to form water. The resulting proton-motive force (approximately 200 mV across the inner mitochondrial membrane) drives H+ through ATP synthase's F0 channel; rotation of the F1 subunit synthesizes ATP. FADH2 enters at complex II (no pumping) — hence fewer ATP per FADH2."
},
3: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Cyanide blocks complex IV of the ETC, preventing O2 from serving as the terminal electron acceptor. What happens to the proton gradient and ATP synthesis?",
  "qh": "The proton gradient collapses immediately (ETC stops pumping protons), and ATP synthesis ceases — cells die rapidly from ATP depletion despite adequate O2 delivery.",
  "ex": "Cyanide (and CO, and azide) binds the heme a3-CuB center of cytochrome c oxidase (complex IV), competitively blocking O2 binding. With complex IV stopped, the entire ETC backs up: NADH and FADH2 cannot donate electrons, electron carriers become fully reduced, proton pumping ceases, the proton gradient dissipates, and ATP synthase stops. The Krebs cycle also backs up (no NAD+ regeneration). Cells switch to anaerobic glycolysis briefly, but this is inadequate — particularly for neurons and cardiac muscle. Antidote: hydroxocobalamin or nitrites (generate methemoglobin, which competes with cytochrome c oxidase for cyanide binding)."
}
```

### `pho` — Photosynthesis

```json
1: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "In the light-dependent reactions, water is split to release electrons. Which photosystem directly oxidizes water?",
  "qh": "Photosystem II (PSII) — the oxygen-evolving complex (OEC) within PSII splits water: 2H2O → O2 + 4H+ + 4e-.",
  "ex": "PSII contains the oxygen-evolving complex (OEC), a Mn4CaO5 cluster that accumulates four oxidizing equivalents (S-states 0-4) before releasing O2. Each photon absorbed at P680 ejects an electron into the electron transport chain; four photons are needed per O2 released. The electrons eventually reach PSI via plastoquinone, cytochrome b6f (which pumps protons into the thylakoid lumen), and plastocyanin. The proton gradient drives ATP synthase (CF0-CF1). Common misconception: O2 is a byproduct of water splitting, not of CO2 fixation."
},
2: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "The Calvin cycle fixes CO2 using RuBisCO. What three-carbon molecule is the first stable product, and what happens to it?",
  "qh": "3-phosphoglycerate (3-PGA) — 6 molecules are produced per CO2 fixation cycle; they are reduced using ATP and NADPH to G3P, which is used to regenerate RuBP and build sugars.",
  "ex": "RuBisCO (ribulose-1,5-bisphosphate carboxylase/oxygenase) catalyzes CO2 + RuBP (5C) → 2 molecules of 3-PGA (3C each). Three turns of the Calvin cycle fix 3 CO2 and produce 6 3-PGA. These are reduced to G3P using 9 ATP and 6 NADPH (from light reactions). 5 of 6 G3P molecules regenerate 3 RuBP (using 3 ATP); 1 net G3P exits the cycle as product for glucose synthesis. RuBisCO also has oxygenase activity (photorespiration) — it can fix O2 instead of CO2, wasting energy. C4 and CAM plants minimize photorespiration."
},
3: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "A plant is suddenly moved from light to darkness. What happens to the Calvin cycle in the minutes immediately following?",
  "qh": "The Calvin cycle halts: ATP and NADPH from light reactions are no longer produced, and RuBP is not regenerated — CO2 cannot be fixed. Intermediates (3-PGA, G3P) accumulate briefly then deplete.",
  "ex": "The Calvin cycle requires a continuous supply of ATP and NADPH from the light reactions. In darkness, photosystem excitation stops; no water splitting, no electron flow, no proton gradient, no ATP synthesis. RuBP regeneration requires ATP; within minutes, RuBP is depleted (fixed into 3-PGA by remaining RuBisCO but not regenerated). 3-PGA accumulates then also depletes (G3P interconversion limited by NADPH). C3 plants also experience increased photorespiration in bright light; C4 plants (corn, sugarcane) use bundle-sheath CO2 concentration to minimize this. Starch in the chloroplast stroma is then mobilized for energy."
}
```

### `dom` — Three Domains

```json
1: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "What single feature places Archaea in a separate domain from Bacteria, despite both being prokaryotes?",
  "qh": "Archaea have ether-linked isoprenoid membrane lipids (not ester-linked fatty acids as in Bacteria), a distinct cell wall chemistry, and different RNA polymerase structure closer to eukaryotes.",
  "ex": "Despite similar cell morphology (no nucleus, similar size), Archaea differ fundamentally from Bacteria: (1) membrane lipids use ether bonds (not ester bonds) and branched isoprenoid chains (not straight-chain fatty acids) — isoprenoid ether lipids are stable at extremes of temperature and pH; (2) Archaea lack peptidoglycan (use pseudopeptidoglycan or S-layers); (3) Archaea have a multi-subunit RNA polymerase more homologous to eukaryotic RNAP II; (4) ribosomal protein and gene sequence phylogeny places Archaea as more closely related to Eukarya than to Bacteria. This is why eukaryotes evolved from an archaeal ancestor."
},
2: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Fungi are classified in Domain Eukarya but are more closely related to animals than to plants. What structural feature uniquely identifies fungi?",
  "qh": "Chitin cell walls (a polymer of N-acetylglucosamine) — plants have cellulose walls, animals have no cell wall, bacteria have peptidoglycan.",
  "ex": "Fungi are heterotrophs (absorptive nutrition via secreted exoenzymes, not photosynthesis), have chitin-reinforced cell walls, and reproduce by spores. Molecular phylogeny (ribosomal RNA, protein sequences) consistently groups Fungi + Animalia as Opisthokonta — more closely related to each other than to plants. Practical DAT implication: antifungal drugs target fungi-specific targets (ergosterol in the membrane via azoles/polyenes; chitin synthesis; beta-glucan synthesis via echinocandins) to avoid harming the host's cholesterol-based membranes."
},
3: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "A researcher discovers an organism in a deep-sea hydrothermal vent that lacks a nucleus, uses ether-linked lipids, and is more resistant to high temperature than any known bacterium. To which domain does it most likely belong?",
  "qh": "Archaea — specifically a hyperthermophilic archaeon (e.g., Pyrolobus fumarii); ether-linked isoprenoid lipids + prokaryotic organization + extreme thermostability is the Archaea fingerprint.",
  "ex": "Ether-linked isoprenoid lipids are the biochemical signature of Archaea. Hyperthermophiles (optimal growth >80°C) are disproportionately archaeal; their membranes can even form a lipid monolayer (tetraether lipids span the entire membrane) at extreme temperatures, preventing membrane disruption. Deep-sea vents harbor diverse Archaea: Pyrolobus fumarii grows at 113°C. Note: some hyperthermophilic bacteria (Aquificales, Thermotoga) exist, but ether-linked lipids + extremely high temperature points strongly to Archaea. The absence of a nucleus rules out Eukarya; the lipid chemistry rules out Bacteria."
}
```

### `fer` — Fertilization

```json
1: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "The fast block to polyspermy occurs within seconds of sperm-egg contact. What is the electrical mechanism?",
  "qh": "Depolarization of the egg plasma membrane from -70 mV to +20 mV — the positive membrane potential prevents additional sperm from fusing.",
  "ex": "The egg resting membrane potential is approximately -70 mV. When the first sperm contacts the egg, ion channels open (Na+ influx), rapidly depolarizing the membrane to +20 mV. This positive potential prevents additional sperm from fusing — the 'fast block.' It is fast (within 1-3 seconds) but temporary. The slow/permanent block (cortical reaction) then establishes the fertilization envelope over the next ~60 seconds, providing permanent polyspermy prevention. In species with voltage-clamped eggs (experimentally held at -70 mV), polyspermy occurs — confirming the fast block."
},
2: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "The cortical reaction prevents polyspermy permanently. What triggers it, and what does it produce?",
  "qh": "Sperm-egg fusion triggers a Ca2+ wave from the endoplasmic reticulum, causing cortical granule exocytosis. Enzymes harden the zona pellucida (forming the fertilization envelope), blocking additional sperm.",
  "ex": "Sperm binding to the egg activates PLC-zeta (from sperm), generating IP3. IP3 triggers Ca2+ release from the egg ER, propagating a Ca2+ wave across the egg. Elevated Ca2+ causes cortical granules (vesicles beneath the plasma membrane) to fuse with the plasma membrane (exocytosis). Cortical granule contents include ovoperoxidase (cross-links zona proteins), ovastacin (cleaves ZP2 receptor, preventing sperm binding), and other enzymes that physically harden the zona pellucida into the fertilization envelope. Ca2+ ionophores (or other artificial Ca2+ triggers) can activate parthenogenesis."
},
3: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "After fertilization, the zygote undergoes cleavage divisions. Unlike normal cell division, cleavage divisions do not increase total cell mass. What is the consequence for cell size and nuclear-to-cytoplasmic ratio?",
  "qh": "Cells (blastomeres) get progressively smaller; the nuclear-to-cytoplasm ratio increases, approaching the ratio typical of somatic cells.",
  "ex": "Cleavage is a series of rapid mitotic divisions without intervening growth phases (no G1, no significant G2 in early cleavage). Total cytoplasm volume is fixed (from the egg). Each division halves cell size: 1 large zygote → 2 → 4 → 8... blastomeres. The large egg had a very low nucleus:cytoplasm ratio; by the blastula stage (64-128 cells in many species), each blastomere has a nuclear-to-cytoplasm ratio similar to normal somatic cells. This ratio normalization is thought to signal the transition from maternal-to-zygotic transcription (midblastula transition in frogs at ~4000 cells)."
}
```

### `nse` — Natural Selection

```json
1: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "In directional selection, what happens to the population's phenotype distribution over time?",
  "qh": "The distribution shifts toward one extreme — the mean phenotype moves in the direction favored by selection, and genetic variation is gradually reduced at the selected locus.",
  "ex": "Directional selection occurs when individuals at one extreme of the phenotypic range have higher fitness. Over generations, allele frequencies shift, the population mean moves toward the favored extreme, and total variation may decrease (though mutation, migration, and recombination can replenish it). Classic example: antibiotic resistance — bacteria with any resistance survive, susceptible ones die, so the population mean shifts to high resistance. Contrast with stabilizing selection (intermediate phenotype favored, variation decreases) and disruptive selection (both extremes favored, variation increases, potentially leading to speciation)."
},
2: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Heterozygote advantage (balancing selection) can maintain two alleles in a population indefinitely. What is the classic DAT example?",
  "qh": "Sickle-cell anemia (HbS allele) in malaria-endemic regions: heterozygotes (HbA/HbS) are more resistant to malaria than HbA/HbA homozygotes, yet do not suffer full sickle-cell disease like HbS/HbS.",
  "ex": "In malaria-endemic Africa, HbA/HbA individuals are fully susceptible to Plasmodium falciparum; HbS/HbS individuals suffer severe sickle-cell anemia and reduced fitness. HbA/HbS heterozygotes have a fitness advantage over both homozygotes — reduced malaria severity AND no sickle-cell disease. Natural selection maintains both alleles (balancing/heterozygote advantage). In non-malaria regions, HbS offers no advantage and its frequency declines. This directly demonstrates that allele fitness is environment-dependent — a key conceptual point on the DAT."
},
3: {
  "rt": "Right.",
  "wr": "Review the explanation.",
  "q": "Genetic drift has a disproportionately large effect in small populations. Why?",
  "qh": "In small populations, random sampling errors are large relative to population size — rare alleles can be lost or fixed by chance, not by fitness differences.",
  "ex": "Genetic drift is the change in allele frequency due to random sampling of gametes. In a large population, sampling errors average out (like flipping a coin 10,000 times gives ~50% heads). In a small population (10 individuals = 20 alleles), a single allele at 10% frequency has only 2 copies — random failure to reproduce can eliminate it in one generation. Two extreme forms: founder effect (new population from few individuals — high drift, loss of variation, possible fixation of rare alleles) and population bottleneck (catastrophic reduction — e.g., cheetahs have extreme genetic homogeneity from historical bottleneck). Drift is non-adaptive: it can fix harmful alleles or lose beneficial ones."
}
```

---

## 3. Priority Ranking

Populate in this order. Each session targets one node (3 questions).

| Priority | Node | Rationale |
|----------|------|-----------|
| 1 | `rep` (DNA Replication) | Flagship Cell & Molecular node; highest student traffic; errors here cascade to trc/tln comprehension |
| 2 | `trc` (Transcription) | Direct downstream of replication; DAT heavily tests prokaryotic vs eukaryotic differences |
| 3 | `tln` (Translation) | Completes the central dogma triad; ribosome site questions are consistent DAT targets |
| 4 | `gly` (Glycolysis) | High DAT frequency; connects to krb and fer; substrate-level phosphorylation traps are common |
| 5 | `krb` (Krebs + ETC) | Most ATP comes from here; students consistently confuse NADH yields and complex inhibitors |
| 6 | `men` (Mendelian Genetics) | Genetics flagship node; dihybrid crosses and ratio interpretation are tested repeatedly |
| 7 | `mei` (Meiosis) | Nondisjunction + crossing-over questions appear on nearly every DAT |
| 8 | `enz` (Enzymes) | Km/Vmax and inhibitor types are high-yield; supports nearly every other biochemistry node |
| 9 | `sig` (Cell Signaling) | GPCR/RTK/steroid distinction is tested; connects to `ap` and `org` content |
| 10 | `pro` (Proteins) | Protein structure levels + sickle-cell are perennial DAT content; supports OChem context too |

Nodes `pho`, `dom`, `fer`, `nse`, `pve`, `org`, `mtr`, `wat`, `car`, `lip`, `nuc`, `mit`, `ap` rank lower not because they are unimportant but because student dwell time on Cell & Molecular and Genetics nodes is higher in the current session data pattern.

---

## 4. Craft Notes: Bio Question Voice

### Framing
Every question should be structured as a setup followed by an ask. Do not open with a naked factual question ("What is the function of helicase?"). Instead: set a scenario or provide a constraining fact, then ask the student to reason.

Example of weak framing: "What does ADH do?"  
Example of strong framing: "A patient stops secreting ADH (vasopressin) after head trauma. Their urine output rises dramatically and is very dilute. Which collecting duct change explains this?"

### Clinical Context Anchors
Use these real clinical scenarios as recurring hooks — they are DAT-realistic and memorable:
- **Nephron / water balance:** dehydration, SIADH (excess ADH), diabetes insipidus (no ADH), Conn's syndrome (excess aldosterone), loop diuretics (furosemide = NKCC2 blocker)
- **Hypoxia:** EPO upregulation in kidney, shift of O2-Hb dissociation curve, cyanide poisoning (ETC block)
- **Hormone signaling:** glucagon vs insulin (GPCR cAMP vs RTK Akt), cortisol stress response (steroid, nuclear receptor), epinephrine fight-or-flight
- **Red blood cell disorders:** sickle cell (primary structure→quaternary consequences), G6PD deficiency (NADPH depletion + oxidative hemolysis), pyruvate kinase deficiency (glycolysis-only cells)
- **Antibiotic mechanism:** targets that distinguish prokaryotic 70S from eukaryotic 80S; mitochondrial toxicity of some antibiotics (endosymbiotic origin)

### Distractor Design (4-5 per question)
Distractors must target real student errors, not random wrong answers. Categories:

1. **One level off:** student knows the right pathway but names the wrong player (confuses primase with pol I; confuses sigma factor with the promoter itself)
2. **Terminology swap:** confuses similar-sounding terms (NADH vs FADH2 yield, Km vs Vmax effect, depolarization vs repolarization)
3. **Direction error:** knows the molecule but reverses the direction (Na+ out vs in, ADH acts on PCT not collecting duct)
4. **Correct fact, wrong context:** accurate statement that does not answer the specific question (e.g., "ATP is used" — true but not the answer to "what inhibits PFK-1?")
5. **Plausible-seeming extrapolation:** extends a true rule incorrectly (e.g., "mitochondria have 80S ribosomes because they are in eukaryotes" — seductive, wrong)

### The "Why" Paragraph
Every explanation must:
- Name the trap ("students often confuse X with Y because...")
- Give the mechanistic reason, not just the definition
- Include one comparative anchor (distinguish from an adjacent concept or similar case)
- Stay under 5 sentences — this is a retrieval card, not a chapter

---

## 5. Authoring Approach

### Recommendation: Hand-Author at 5-10 Questions Per Session

Given that OChem v1's craft protocol established a mandatory slow-authoring discipline, the same standard applies here. The reasons are identical:

- **Retrieval question quality directly determines learning outcomes.** A hollow or misleading question is worse than no question — it trains wrong reasoning.
- **DAT question voice is specific.** Clinical setup → constrained ask → answer that requires mechanistic reasoning, not just vocabulary recall. AI-generated questions tend to be generic; hand-authored questions catch the specific traps students fall into.
- **Distractors are the hardest part.** Good distractors require knowing which wrong answers are pedagogically useful vs. which are just random. This cannot be templated.

### Session Protocol

Adopt the following gates:

1. **One node per session.** Three questions (Tier 1, 2, 3) per node.
2. **Draft all three before editing any.** Write questions raw, then edit for clarity and DAT voice.
3. **The "student error test":** For each distractor, ask "have I seen a student make this specific error?" If no, replace it with one you have.
4. **The "one-sentence answer test":** The correct answer (qh field) must be expressible in one sentence. If it takes two, the question is asking two things — split it.
5. **Proof against the node's stage labels.** Each question should connect to a named stage in the node (if applicable) — the student just placed that element, so the question should deepen it.
6. **Confirm rt and wr fields are specific.** "Right." and "Review the explanation." are the current placeholders — replace with a 1-sentence confirmation that names the correct concept (see existing `ped` and `nph` nodes for reference).

### On AI Assistance
AI can be used at the **draft** stage — generating candidate questions that a human then edits, rejects, or rewrites. It should not be used to finalize questions without review. The risk is AI producing technically correct but pedagogically flat questions that do not probe the actual failure modes students exhibit. All 69 stub questions should be reviewed by Thomas before deployment.

### Target Throughput
At 5-10 questions per session (roughly 1-2 nodes per session), full coverage of the 23 stubbed nodes requires approximately 12-23 sessions. At one session per week, that is 3-6 months. Prioritizing the top 10 nodes (section 3 above) covers the highest-traffic content within the first 5-6 sessions.

---

*End of spec. No production files were modified.*
