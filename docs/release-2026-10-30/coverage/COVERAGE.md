# DAT coverage: is Ace Labs comprehensive? (audit of 2026-10-30)

For Thomas. Internal. Repos read: `/home/user/acelabs` (read only, nothing edited) and `/home/user/AceDatPortal/src/scheduling/curriculum/subtopics.js` (the 280 canonical subtopics). Every count below was computed by a script, not counted by eye; the scripts and data are listed at the end.

## The honest answer

Not yet. Of the 280 canonical subtopics, 98 (35 percent) meet all five parts of the FULL definition today: 141 are PARTIAL, 39 THIN and 2 MISSING (Beer's law and GC reaction types). Weighted by where the real test spends its items, only about 28 percent of a full DAT sitting lands on a FULL subtopic. The good news is that this is mostly finishing work, not blank pages. Only those 2 of the 280 have nothing at all, and 251 of the 295 lessons the plan needs can be adapted from teaching that already exists (Retold nights, hub nodes, engine modules, the Tree, trainers, Sheets).

The gaps, in order of test-day cost, are:

- **Explanations.** They are 42 percent of the weighted gap: across the 12,381 served question records, 2,786 have no explanation and 3,607 have one line.
- **Too few questions** on the thin topics.
- **Practice tests that do not sample the DAT** the way the ADA builds it. The diagnostic and the three Prometric-style forms contain no Biology outside Cell and Molecular, the QR forms contain no quantitative-comparison items and only one data-sufficiency item, and the four full-length OChem mocks put 80 of their 120 items in synthesis.

The subtopic list is also not yet the official outline. 15 outline topics have no canonical id, so a student's misses on them cannot be logged, scheduled or checked. And 11 QR geometry, trig and conversion subtopics are probably outside the current outline but still fill the scored QR forms.

So a student using Ace Labs today gets strong coverage of cell and molecular biology, the classic GC calculations, OChem reactions and Reading. Coverage is thin, or never tested, for:

- anatomy and physiology, plants and ecology
- several GC areas
- the QR formats
- PAT review explanations

Ace Labs is comprehensive when the plan below is built and the proposed coverage gate passes in strict mode. Until then, no page should claim full coverage.

## Where each section stands

Definition used (yours). A subtopic is FULL only when all five hold:

1. A teaching unit a student can reach teaches it at DAT depth.
2. It has a visual or interactive tool.
3. At least 8 DAT-style questions are tagged to it.
4. At least 8 of those have a real explanation.
5. It sits on the full-length tests in proportion to its weight.

PARTIAL means some of the five hold. THIN means only a mention, or under 3 questions. MISSING means nothing at all.

| Section | Listed subtopics | FULL | PARTIAL | THIN | MISSING | Percent at FULL | Outline topics with no id | Share of a sitting on FULL subtopics |
|---|---|---|---|---|---|---|---|---|
| Biology | 80 | 23 | 37 | 20 | 0 | 29% | 2 | 26% |
| General Chemistry | 64 | 28 | 27 | 7 | 2 | 44% | 6 | 36% |
| Organic Chemistry | 82 | 42 | 33 | 7 | 0 | 51% | 5 | 43% |
| Quantitative Reasoning | 40 | 0 | 35 | 5 | 0 | 0% | 2 | 0% |
| Reading Comprehension | 8 | 5 | 3 | 0 | 0 | 63% | 0 | 90% |
| Perceptual Ability | 6 | 0 | 6 | 0 | 0 | 0% | 0 | 0% |
| **All** | **280** | **98** | **141** | **39** | **2** | **35%** | **15** | **28%** |

"Share of a sitting" means the expected items on one real DAT (Bio 40, GC 30, OC 30, QR 40, RC 50, PAT 90) that fall on FULL subtopics. The weights are listed under the ranking below.

**Biology (80)**: strong in Cell and Molecular, weak everywhere else.

| ADA category | Subtopics | FULL | PARTIAL | THIN | MISSING | At FULL |
|---|---|---|---|---|---|---|
| Cell and Molecular | 21 | 15 | 4 | 2 | 0 | 71% |
| Genetics | 13 | 3 | 9 | 1 | 0 | 23% |
| Evolution and Ecology | 10 | 1 | 6 | 3 | 0 | 10% |
| Diversity of Life | 10 | 1 | 5 | 4 | 0 | 10% |
| Structure and Function of Systems | 26 | 3 | 13 | 10 | 0 | 12% |

Structure and Function is about a third of the Bio section by third-party estimates (the ADA publishes no percentages). Its 26 subtopics hold 125 DAT-style questions, against 380 for Cell and Molecular, and none of them appears in the diagnostic or the Prometric forms. The lymphatic system has 0 questions in any bank. Transpiration also has 0. Plant hormones, female reproductive anatomy, biomes and biogeochemical cycles have 0 DAT-style questions each.

**General Chemistry (64)**: the calculation core is FULL; Nuclear, Laboratory and Periodic Properties have no FULL rows.

| ADA area | Subtopics | FULL | PARTIAL | THIN | MISSING | At FULL |
|---|---|---|---|---|---|---|
| Atomic and Molecular Structure | 9 | 6 | 3 | 0 | 0 | 67% |
| Periodic Properties | 1 | 0 | 1 | 0 | 0 | 0% |
| Stoichiometry and General Concepts | 6 | 2 | 2 | 1 | 1 | 33% |
| Gases | 4 | 2 | 2 | 0 | 0 | 50% |
| Liquids and Solids | 5 | 1 | 3 | 1 | 0 | 20% |
| Solutions | 5 | 2 | 2 | 1 | 0 | 40% |
| Acids and Bases | 6 | 4 | 2 | 0 | 0 | 67% |
| Chemical Equilibria | 4 | 3 | 1 | 0 | 0 | 75% |
| Thermodynamics and Thermochemistry | 5 | 4 | 1 | 0 | 0 | 80% |
| Chemical Kinetics | 6 | 2 | 2 | 2 | 0 | 33% |
| Oxidation-Reduction | 5 | 2 | 3 | 0 | 0 | 40% |
| Nuclear Reactions | 4 | 0 | 2 | 2 | 0 | 0% |
| Laboratory | 4 | 0 | 3 | 0 | 1 | 0% |

No GC question anywhere asks a student to balance an ordinary equation or classify a reaction type. Fission, fusion and binding energy are taught in the engine `nuclear` module but have 0 questions.

**Organic Chemistry (82)**: the reaction core is FULL; the areas the 2026 outline emphasises are weakest.

| ADA 2026 area | Subtopics | FULL | PARTIAL | THIN | MISSING | At FULL |
|---|---|---|---|---|---|---|
| Mechanisms | 13 | 6 | 6 | 1 | 0 | 46% |
| Chemical synthesis | 40 | 27 | 11 | 2 | 0 | 68% |
| Acid-base chemistry | 4 | 1 | 3 | 0 | 0 | 25% |
| Chemical and physical properties | 9 | 3 | 4 | 2 | 0 | 33% |
| Structural evaluation | 16 | 5 | 9 | 2 | 0 | 31% |

Of the 33 PARTIAL rows, 16 fail only criterion 5: they are not on the timed forms or not in the diagnostic pool.

**Quantitative Reasoning (40)**: broad but shallow.

| List category | Subtopics | FULL | PARTIAL | THIN | MISSING |
|---|---|---|---|---|---|
| Arithmetic and numerical | 7 | 0 | 7 | 0 | 0 |
| Algebra | 7 | 0 | 6 | 1 | 0 |
| Word problems | 5 | 0 | 5 | 0 | 0 |
| Probability and counting | 6 | 0 | 5 | 1 | 0 |
| Statistics | 4 | 0 | 4 | 0 | 0 |
| Unit conversions (probably not in current outline) | 1 | 0 | 1 | 0 | 0 |
| Geometry (probably not in current outline) | 6 | 0 | 5 | 1 | 0 |
| Trigonometry (probably not in current outline) | 4 | 0 | 2 | 2 | 0 |

The 0 FULL comes almost entirely from explanations. 33 subtopics have a teaching unit and 31 a tool, but only 402 of 1,083 distinct DAT-style QR items (37 percent) carry a real explanation. The QR audit also required 80 percent of a subtopic's items to be explained. Under the 8-item rule the other sections used, 13 QR subtopics would be FULL (see the gate section).

**Reading Comprehension (8)**: the strongest section.

| Group | Subtopics | FULL | PARTIAL | THIN | MISSING |
|---|---|---|---|---|---|
| Question types (main idea, detail, inference, tone, vocab, structure) | 6 | 5 | 1 | 0 | 0 |
| Strategy (search vs read, timing) | 2 | 0 | 2 | 0 | 0 |

Vocab in context has one line of teaching. The two strategy subtopics are taught well but have no measured items. RC is not in the diagnostic.

**Perceptual Ability (6)**: one fix away from FULL in all six. Teaching, trainers and 225 generated items per type are in place, with 15 per type in each full mock. Every row fails only criterion 4: the review explanation is a template line (median 4 to 18 words after choosing the key). Cube counting has 0 of 900 distractors trap-tagged, and 98 of the 105 non-cube pattern-folding items show a note calling the solid a cube. PAT is not in the diagnostic.

## The gaps, ranked by what they cost students on test day

**Method** (`scripts/gap-cost.mjs`): exposure = expected items on one real DAT sitting x a weakness score from 0 to 1, shown as items and as a percent of that section's raw score.

- **Weakness score**: the weighted share of the five criteria not met, counting partial as half. Weights: teaching 0.30, questions 0.25, explanations 0.20, test placement 0.15, visual 0.10. Add 0.10 when the topic is in the outline but has no canonical id.
- **Bio weights**: third-party category midpoints, split evenly inside each category.
- **GC weights**: equal per ADA area (the ADA publishes none).
- **OC weights**: the repo's 2026 blueprint (7/9/4/6/4 per 30).
- **QR weights**: the current outline's five named areas, assumed equal at 8 items each. Geometry, trig and conversions get 0.
- **RC weights**: the question-type mix of the four full-mock RC sections.
- **PAT weights**: 15 items per subtest.

This is a ranking index, not a predicted score loss. Each subtopic-and-criterion cell is counted in exactly one gap. The 18 gaps sum to 42.8 weighted items per 280-item sitting.

| Rank | Gap | Exposure (items per sitting) | Percent of section score | What drives it | Fix and size |
|---|---|---|---|---|---|
| 1 | PAT review explanations are a template line | 9.00 | 10.0% of PAT | explanations, all six subtests | 6 per-type worked-explainer templates in the generator (covers all 1,350 fixed-test items and every drill); trap tags on 900 cube-counting distractors; fix the "cube" note on 98 non-cube nets. Cheapest high-exposure fix in the plan. |
| 2 | Bio Structure and Function content | 3.89 | 9.7% of Bio | questions 2.02, explanations 1.35, teaching 0.39 | Lymphatic (0 questions), female reproductive (0 DAT-style), male reproductive, integumentary, autonomic (the registry routes its repair to the reflex-arc node, which never mentions the divisions), feedback loops, cardiac cycle, innate immunity, menstrual cycle. 101 questions to reach 8 per subtopic (57 can be rewrites of short items already tagged), 23 explanations on existing items, 5 units lifted from existing material, 5 visuals. |
| 3 | QR quantitative comparison, data sufficiency and data figures are missing from the timed forms and the list | 3.80 | 9.5% of QR | test placement 2.40, no id 1.20 | Rebuild the 7 QR forms drawing on `shared/qr-formats-bank.js` (220 items, 60 QC, 60 DS, 60 DI with rendered figures, all with worked explanations), which feeds no test today; add `qr_quant_comparison` and `qr_data_sufficiency`; fix the engine `ds` module, whose visual, lock line and 20 of 23 items are about slope. |
| 4 | OC thin and partial topics | 2.68 | 8.9% of OC | questions 1.27, explanations 1.06 | Nucleophilicity (0 DAT-style; trends taught nowhere), polarity (0), IMFs (1), anti-periplanar, Lucas test (nothing but a quiz distractor), conjugate-base stability, priority order (2), E1, leaving groups. 92 questions to 8; 4 lessons written new. |
| 5 | Bio plants, protists, biomes, cycles and evolution | 3.22 | 8.0% of Bio | questions 1.35, explanations 1.13, teaching 0.61 | Transpiration (0 questions, two short paragraphs), plant hormones (one line of teaching, 0 DAT-style), plant reproduction (1 DAT-style), biogeochemical cycles and biomes (0 DAT-style), protists. 83 questions to reach 8 (43 can be rewrites), 22 explanations, 6 units (2 starting from a mention only), 3 visuals. |
| 6 | OC full mocks off the 2026 weights; the 2026 item types have no id and never reach a form | 2.17 | 7.2% of OC | test placement 1.77, no id 0.24 | The full mocks hold 80 synthesis items (about 36 expected), 3 acid-base (16) and 8 spectroscopy and lab (24), and no curved-arrow, reaction-coordinate, combined-mechanism, chemoselectivity or acid-base-equilibrium item. Recompose to 7/9/4/6/4 by moving about 40 synthesis items; add 5 ids; put the 2026-format set (203 items) in the diagnostic pool. |
| 7 | GC remaining PARTIAL rows | 2.10 | 7.0% of GC | explanations 0.91, questions 0.63, teaching 0.48 | Vapor pressure, density, kinetic molecular theory, common ion, polyprotic acids, recrystallization, resonance (no GC teaching at all), solubility rules (its visual is the QR word-problem dictionary), electrolytic cells. |
| 8 | QR one-line explanations in the engine bank | 2.40 | 6.0% of QR | explanations | The QR engine bank (1,020 records, copied into the pool, Prometric and games) explains in a median 11 words. 499 upgrades to pass at 80 percent; 681 to upgrade every distinct DAT-style item. |
| 9 | GC topics taught but never asked | 1.68 | 5.6% of GC | questions 0.79, explanations 0.51 | Fission and fusion (0), binding energy (0), rate factors (0), balancing equations (0), solids (1), net ionic (2), mechanisms and rate-determining step (2). 51 questions bring all 7 to 8. |
| 10 | GC outline areas missing or misfiled | 1.52 | 5.1% of GC | teaching 0.43, questions 0.40 | Beer's law and reaction types (MISSING); laws of thermodynamics (1 question); acid and base strength, solubility factors, lab measurement and error (34 records with no id), photons and spectra. |
| 11 | GC timed forms skew away from Periodic, Liquids and Solids, Nuclear and Lab | 1.49 | 5.0% of GC | test placement | Periodic Properties: 0 of the 120 full-mock GC items. On all 7 timed forms (210 GC items, about 16 expected per area): Liquids and Solids 6, Nuclear 4. 43 slots to add; pool items for the 9 subtopics the diagnostic can never sample. |
| 12 | Bio: the diagnostic and Prometric forms test only Cell and Molecular; the full mocks are unbalanced | 1.94 | 4.8% of Bio | test placement | `scripts/compose-tests.js` line 210 and `diagnostic.html` line 998 keep only `_rewritten` or `_expert` pool items, and only Cell and Molecular items were ever rewritten. 56 of 80 Bio subtopics can never appear in the diagnostic, and 57 have no Prometric item. Photosynthesis takes 16 full-mock items (1.8 expected). Explain the 350 unexplained pool Bio items, then rebuild the forms and re-place 48 slots. |
| 13 | QR thin algebra and statistics topics | 1.83 | 4.6% of QR | questions 0.88, teaching 0.65 | Sequences (3 items, no teaching, no tool), scientific notation, functions and graphs (graphical analysis is an outline item), expected value (2 items), number properties (14 good items, one-line teaching, on no form). 9 tools. |
| 14 | Bio genetics, plus genomics missing from the list | 1.52 | 3.8% of Bio | questions 0.64, explanations 0.62 | Genomics: 0 questions and 1 teaching mention. Also epistasis (7 short of 8), gene regulation, biotechnology, dihybrid crosses, linkage. |
| 15 | GC descriptive periodic chemistry (families, transition elements) | 1.00 | 3.3% of GC | all five, plus no id | Periodic Properties is a whole ADA area held by one subtopic. New id, lesson, visual and 12 questions. |
| 16 | Bio cell and molecular, plus bioenergetics missing from the list | 1.13 | 2.8% of Bio | teaching 0.38, questions 0.32 | Bioenergetics: 2 question stems mention free energy or coupling. Apoptosis: a mention only. Endosymbiosis is thin. |
| 17 | QR other topics under-placed on the forms | 0.65 | 1.6% of QR | test placement | Covered by the form rebuild in rank 3. |
| 18 | RC vocab in context has one line of teaching | 0.75 | 1.5% of RC | teaching | One lesson. |

What the ranking says:

- **By criterion**, explanations are 17.8 of the 42.8 weighted items (42 percent; PAT alone is 9.0 of it). Question counts are 8.6 (20 percent), test placement 8.3 (19 percent), teaching 4.7 (11 percent), missing ids 1.8, visuals 1.7. Ace Labs is short on finished explanations far more than on teaching.
- **Two of the top three gaps are cheap**: one PAT generator change, and recomposing the QR forms from a pool that already exists. Both fall late in the build order (QR fourth, PAT fifth). They could be pulled forward without disturbing the Bio-first sequence; that is your call.
- **The test-form gaps (ranks 6, 11, 12) rank below their visibility**, because the model treats wrong placement as a measurement problem. That understates it: the diagnostic feeds the scheduler, so a subtopic the diagnostic can never sample is a subtopic the plan can never route a student to.
- **Sensitivity.** With all five criteria weighted equally, 17 of the top 20 subtopics stay in the top 20. The QR outline reading is what matters. Under the legacy QR weights (with geometry and trig), the top QR gaps become sequences, unit circle, functions, law of sines and cosines and unit conversions, and QC and DS drop to zero. So the outline decision below sets QR's priorities.

## What the outline check found

**Sources and what was blocked.** I could not open the ADA documents. www.ada.org does not resolve from this sandbox, and neither do kaptest.com, bootcamp.com, boosterprep.com, testpreppal.com, prehealthadvising.wp.txstate.edu or as.vanderbilt.edu. I tried www.ada.org (the OChem specification PDF) and as.vanderbilt.edu again today; both failed. www.ada.org has to be allowed in the session's network settings before the Candidate Guide and the specification PDFs can be read directly. The check therefore rests on two kinds of source:

- public search-result extracts
- the repo's own transcription of the 2026 Candidate Guide (fetched 2026-05-07, PDF dated 12/11/2025) in `tools/gc/research/BLUEPRINT_VERIFICATION.md`

**Biology.** The ADA specifications (effective January 2022) have five categories: Cell and Molecular, Diversity of Life, Structure and Function of Systems, Genetics, and Evolution and Ecology. Genetics now includes developmental mechanisms, genomics, gene expression and epigenetics. Origin of Life and the separate Developmental Biology category were removed. Nothing on the list falls outside the outline.

Gaps in the list:

- **Missing**: bioenergetics (thermodynamics) and genomics, both with essentially no content (above).
- **Folded into other entries, so misses cannot be told apart**: epigenetics, developmental mechanisms (Ace Labs has dedicated nodes for them), drift and gene flow, phylogenetics, experimental cell biology.

Label and structure problems:

- `bio_fermentation` is labelled "Fermentation (anaerobic respiration)". Those are two different processes, so the label teaches a misconception.
- The list keeps the pre-2022 six-category shape (`bio_development_reproduction`).
- It files Hardy-Weinberg under Genetics, where the ADA puts population genetics under Evolution and Ecology.

**General Chemistry.** There are 13 ADA areas, no published weights, and no change since at least 2019. The list lacks six named topics:

- lab equipment, measurement and error analysis (the GC Laboratory area as the ADA words it)
- laws of thermodynamics
- descriptive periodic chemistry
- solubility factors
- acid and base strength
- photons and atomic spectra

The list's four GC lab subtopics are really OChem separations plus Beer's law: all 96 of their questions sit in OChem banks. Unit cells are beyond DAT depth, and normality is taught nowhere.

**Organic Chemistry and the 2026 change.** The ADA's new specification ("Updated 08/13/2025", anticipated implementation April 2026; OAT from June 2026) cuts the outline from seven areas to five:

- Mechanisms
- Chemical synthesis (now grouped by number of steps)
- Acid-base chemistry
- Chemical and physical properties
- Structural evaluation

It names curved arrows, single and combined mechanisms, reaction coordinate diagrams, multi-step synthesis, and predicting acid-base equilibria. The ADA calls this a renaming with a fuller subtopic list, not a content change.

The list reflects it only in part. The 2026-06-02 pass added `oc_arrow_pushing`, `oc_reaction_energy` and `oc_thermo_kinetic`, but:

- These 2026 item types still have no id: combined mechanisms, multi-step synthesis, chemoselectivity, acid-base equilibria and combined spectra. Ace Labs already has items for all of them.
- 337 underlying questions in the banks have no canonical home, mostly one-step families such as hydrogenation, alkyne additions and enolate alkylation.
- The 12 display categories still follow the old functional-group chapters.
- No subtopic records its 2026 area.
- `oc_mass_spec` is kept, though it is in neither the old nor the new outline (the Tree and The Summit already filter it out).

The per-area item counts in the new specification could not be checked. The 7/9/4/6/4 weights are the repo's own.

**Quantitative Reasoning.** The current outline, as quoted in extracts of the 2026 Candidate Guide, names:

- algebra, including graphical analysis
- data analysis, interpretation and sufficiency
- quantitative comparison
- probability and statistics
- applied word problems

The list has no id for quantitative comparison or data sufficiency. It keeps 11 subtopics the current outline does not name (unit conversions 1, geometry 6, trigonometry 4). A search summary reports an ADA staff answer that no QR item is devoted solely to geometry or trig, and the QR engine already marks them off-spec in code (`OFFSPEC_SKILLS`, `tools/qr/index.html` line 3061). Yet they fill 27 of 160 full-mock QR items, 19 of 120 Prometric QR items and 20 of 100 Climb QR items. Student-facing copy also contradicts the current outline, for example "The whole DAT trig section reduces to four moves" (`tools/qr/index.html` line 6096). Default 5 in `docs/ace-system-decisions.md` waits on this audit, but the audit cannot confirm it without the PDF. Please read the QR page of the Candidate Guide once ada.org is reachable.

**Reading Comprehension.** The outline names no question types (3 passages, 50 items, 60 minutes), so the 8 RC subtopics are Ace's own taxonomy. EXCEPT/NOT (71 items) and application (30) are folded into detail and inference.

**PAT.** The six subtests map one to one onto the list. No gap.

**What the site claims.** `shared/scope.js` tells students content is "revised against the current ADA outline". Today that is only partly true: the QR forms follow the legacy outline and the OChem full mocks predate the 2026 weights. I found no page that claims full coverage. `tools/bio/index.html` says plainly that it is not "a complete DAT Biology course". Keep it that way: add "full coverage", "complete DAT" and "covers every" to `STALE_PHRASES` in `shared/scope.js` until the gate below passes in strict mode.

## The plan to full coverage, in build order

Sizes are counted to two levels:

- **The FULL bar** (the five criteria).
- **The lesson-map standard** in `docs/ace-system-decisions.md`: every subtopic gets one five-step lesson (warm-up, Call it first, a visual-first explainer with something to play with, about 5 checks plus review variants, Ace Cards) with 8 to 12 items, and every question gets a detailed explainer and a visual.

None of the 280 subtopics has a five-step lesson yet, so every one needs one. "Adapt" means existing teaching can be reworked into the lesson; "write" means new teaching. Each section's totals include its proposed outline ids.

| Order | Section | Lessons (adapt + write) | Visuals or tools to build | DAT-style questions: to 8 / to 12 | Explanations: upgrades to the FULL bar / to the lesson standard | Explainer visuals | Test forms and list |
|---|---|---|---|---|---|---|---|
| 1 | Biology | 82 (66 + 16) | 14 | 232 / 460 | 65 / 1,314 | 1,510 | Rebuild the 3 Prometric Bio sections; widen the diagnostic filter; re-place 48 full-mock slots. Add `bio_bioenergetics` and `bio_genomics` (optionally split epigenetics, developmental mechanisms, drift); rename fermentation; give the 12 node-less subtopics a registry node. |
| 2 | General Chemistry | 70 (55 + 15) | 14, plus 13 add-ons to manipulate | 131 / 262 | 29 / 1,021 | 1,090 | Add 43 slots; seed the pool for 9 subtopics. Add 6 ids, starting with `gc_lab_measurement_error`; replace the Solubility Rules visual; give 314 problems a fifth choice. |
| 3 | Organic Chemistry | 87 (82 + 5) | 6, plus a new home for the Reaction Maps trainers | 92 / 193 | 8 / 1,640 | 1,891 | Recompose the 4 full mocks to the 2026 weights (46 slots); pool items for 21 subtopics; add the 2026-format set to the pool. Add 5 ids; widen ids for the one-step families; merge the two qualitative-test ids; retire `oc_mass_spec`; add an `ada2026` field; give 165 problems a fifth choice. |
| 4 | Quantitative Reasoning | 42 (35 + 7) | 12 (9 new, 3 replacing misfit visuals) | 55 / 109 | 499 / 790 | 1,127 | Rebuild all 7 QR forms with QC, DS and DI from the formats pool. Add 2 ids. If the outline is confirmed: demote the 11 geometry, trig and conversion subtopics to supporting skills (11 fewer lessons, 4 fewer tools, 30 fewer questions). |
| 5 | Perceptual Ability | 6 (6 + 0) | 0 | 0 / 0 | 6 generator templates / same | drawn by the templates | Add a PAT block to the diagnostic; trap tags on 900 cube-counting distractors; fix 98 pattern-folding notes. |
| 6 | Reading Comprehension | 8 (7 + 1) | 0 (a vocab swap-in tool is optional) | 16 measured strategy items | 52 / 52 | 750 only if the proof-line highlight is not accepted as the visual | Add an RC block to the diagnostic; reword the 246 distractor notes that say "wrong". |
| | **All** | **295 (251 + 44)** | **46, plus 13 add-ons** | **526 / 1,040** | **653 plus 6 templates / about 4,800** | **about 5,600** | |

Notes on the sizes:

- **Biology** needs 232 questions to reach 8 per subtopic: 218 for the listed subtopics plus 14 for the two new ids. 121 of the 218 can be rewrites of short flashcard items already tagged to the subtopic, so 97 are written new.
- **"To the lesson standard"** is existing items short of a detailed explainer plus every new item. Bio 876 + 438. GC 759 + 262. OC 1,447 + 193. QR 681 + 109.
- **Explainer visuals.** Bio: the 1,072 items with no visual plus the new items, as counted by the Bio audit. GC: 998 DAT-style problems minus the 170 that have a visual, plus the new items. OC: every exam-register problem, since none has a visual-first explainer, plus the new items.
- **Rough scale, using the per-unit assumptions in the GC audit** (adapt a lesson 3 h, write one 6 h, an interactive visual 8 h, a new concept-first question with a detailed explainer and visual 40 min, an explanation upgrade with a visual 20 min): about 3,400 hours before your sign-off time. The 3,815 explanation upgrades are the largest line, at about 1,270 hours. This is for scale only; nothing here measured authoring speed.

Within each section, the order that buys the most coverage soonest:

- **Biology**:
  1. Structure and Function questions and explanations.
  2. Plants, cycles and biomes.
  3. Explain the 350 unexplained pool items (95 genetics, 115 physiology, 50 diversity, 25 development, 50 evolution, 15 cell), then rebuild the Prometric Bio sections and widen the diagnostic, which those items unlock.
  4. Add bioenergetics and genomics.
  5. Fix the autonomic repair routing and the 69 placeholder retrieval cards.
- **General Chemistry**:
  1. The 51 questions for the 7 THIN rows.
  2. Add the 6 outline ids.
  3. Teach reaction types, Beer's law (or fold it into lab data analysis) and GC resonance.
  4. Rebalance the forms toward Periodic, Liquids and Solids, Nuclear and Lab.
  5. Upgrade explanations on the pool versions of engine problems.
- **Organic Chemistry**:
  1. Recompose the full mocks to the 2026 weights and add the 5 ids. Both are composition and list work on items that already exist.
  2. Questions for the 7 THIN rows.
  3. The 4 new lessons (dienes and conjugation, nucleophilicity trends, anti-periplanar, qualitative tests).
  4. Rehome the Reaction Maps trainers in the lesson map before that page becomes a reference page.
- **Quantitative Reasoning**:
  1. Your outline decision.
  2. The form rebuild from the formats pool.
  3. Explanation upgrades on the engine bank.
  4. Sequences, functions and expected value.
- **PAT**: the six explainer templates, then lessons.
- **RC**: the vocab lesson, then strategy measures.

Decisions only you can make:

1. **Confirm the QR outline** (geometry, trig, conversions; the QC and DS share) and the OChem 2026 item counts from the ADA PDFs, once www.ada.org is allowed.
2. **Approve the list changes in `subtopics.js`.** Adding ids is safe for the portal; renaming or retiring `bio_fermentation` and `oc_mass_spec` touches Ace Log history and the `canonicalize-topic` vocabulary, so map old ids to new.
3. **Pick the explanation rule for the gate:** 8 explained items per subtopic (what the Bio, GC and OC audits used) or also 80 percent of items explained (what the QR audit used; I recommend it).
4. **Decide whether the two cheap high-exposure fixes** (PAT templates, QR form rebuild) jump the build order.

## Proposed gate: `scripts/gate-coverage.mjs` in acelabs

**Goal.** `npm test` fails when any outline subtopic falls below FULL, so coverage is enforced by machine, not by memory.

**Why it cannot be written against the repo today.** No question in acelabs carries a canonical subtopic id; none of the 280 ids appears anywhere in the repo. The banks use their own vocabularies:

- the DAT mock pool: 72 Bio, 42 GC, 14 OChem and 48 QR topic tags
- the full mocks: tagged by Retold night ("The center of the universe: alkenes")

This audit had to classify every item with keyword rules (about 90 to 97 percent agreement on hand-checked samples). That is good enough to measure, but not to gate. So the gate comes with a small data layer, built once from this audit's outputs:

| File in acelabs (proposed) | What it holds | Bootstrapped from |
|---|---|---|
| `shared/dat-outline.json` | Every outline subtopic: id, section, ADA area (OC also its 2026 area), `inOutline` (true, `pending` or false), weight per sitting. It holds the 280 listed ids plus the 15 proposed ones. | `subtopics.js` via a `scripts/sync-outline.mjs` (the portal stays the owner of the vocabulary), plus the outline tables in this audit |
| `data/coverage/tags.json` | Question id to subtopic id, for every served bank, copies collapsed (pool = Prometric = Game Central) | The audit's classified files (`bio-classified.json`, `gc-classified.json`, `oc/oc-classified.json`, the QR classifier), hand-reviewed per batch; new items must carry a tag when they are written |
| Explainer sidecars keyed by question id (already the decisions-doc design) | Explanation level, visual present, signed off | The census levels |
| The lesson map (One Loop build), and until then `data/coverage/units.json` | Per subtopic: teaching units with depth (dedicated, partial, mention), visuals and play tools; every reference must resolve to a file and anchor that exists | The audit's hand maps (`scripts/bio-units-map.js`, `scripts/oc-manual.js`, the GC and QR matrix columns) |
| The real forms | `tools/mock/data/full-mocks.js`, `shared/dat-mock-tests.js`, and the diagnostic's draw rule | Read directly, so a filter like `diagnostic.html` line 998 shows up in the gate |

**Two scripts.** `scripts/build-coverage-manifest.mjs` collects the repo into `coverage-manifest.json`, loading the banks in a `vm` sandbox the way `gate-count-claims.mjs` does. `scripts/gate-coverage.mjs` judges the manifest with the FULL definition written once for every section:

- **c1 teaching**: a dedicated unit (partial = only inside a broader unit).
- **c2 visual**: one made for the subtopic (partial = only a shared one).
- **c3 questions**: 8+ DAT-style items, using the repo's exam-register rule from `scripts/compose-full-mocks.mjs` plus 4 or more choices, moving to 5.
- **c4 explanations**: 8+ of those with an explanation of 25+ words, optionally also 80 percent of the subtopic's items.
- **c5 tests**: on the full-length forms at no less than half the expected share.

An outline topic with no id is rated NOT LISTED and always fails strict mode. Rows marked `inOutline: 'pending'` (QR geometry and trig until you decide) are reported but not gated. Diagnostic reach (at least one pool item) is a warning; today 103 gated subtopics have none (Bio 56, GC 9, OC 21, QR 17).

**Modes**, on the same pattern as `gate-house-glyphs.mjs --baseline`:

- **No flags (strict)**: exit 1 if any gated subtopic is below FULL. This is the end state.
- **`--baseline scripts/coverage-baseline.json` (ratchet)**: exit 1 if any of these happen:
  - a FULL subtopic drops below FULL
  - any criterion falls (yes to partial, or partial to no)
  - an outline subtopic disappears
  - a new outline subtopic arrives below FULL without being added to the baseline in review
  - the below-FULL count rises
  - a row is below FULL in a section listed in `--strict-sections`
- **`--write-baseline FILE`**: locks in gains after a batch ships.
- **`--report`**: prints every row with its missing criteria.

**Wiring.** Add `node scripts/gate-coverage.mjs --baseline scripts/coverage-baseline.json --expl-share 0.8` to `test:banks` in `package.json`. Add `--strict-sections bio` when Biology ships, then `bio,gc`, and so on. When the last section ships, drop `--baseline` and the gate is strict. A second level, `--standard lesson`, can then check the decisions-doc standard per section: a complete five-step lesson, 8 to 12 items, and a detailed explainer, visual and sign-off on every item.

**Keeping it honest.**

- Copies count once.
- Only served items count, meaning items reachable from a page.
- Any hand verdict (teaching depth, a strategy subtopic with no measurable items) must carry a reviewer and a date, and is printed as a warning.
- The keyword classifier re-runs as a cross-check, and its disagreements with `tags.json` are printed. They do not fail the build, because the classifier is about 90 percent accurate.
- The gate can also feed `validate-scope.js`, so no page claims full coverage while the gate runs in ratchet mode.

**Prototype, written and run here** (`coverage/scripts/gate-coverage.mjs` and `coverage/scripts/build-manifest-from-audit.mjs`; the manifest is built from this audit's matrices because the repo has no tags yet). On today's data:

- **8-explained-items rule**: 114 of 283 gated subtopics are FULL and 169 are below.
- **Adding the 80 percent rule**: 85 FULL and 198 below.
- The 283 gated rows are the 280 listed ids, less the 11 pending QR rows and the off-outline `oc_mass_spec`, plus the 15 proposed ids.
- These differ from the 98 of 280 in the tables above only because the section audits set two thresholds differently. QR required 80 percent explained (13 QR rows pass at 8 items but fail at 80 percent; at 80 percent, 14 GC rows and 2 Bio rows fail too). GC and OC also required a diagnostic-pool item (3 OC rows). One rule set for every section is exactly what the gate fixes.
- Ratchet runs against the 80 percent baseline:
  - an unchanged manifest passes
  - removing explained items from `bio_krebs` and deleting `gc_nernst` fails, with 4 named problems
  - writing the RC vocab lesson passes and reports 1 newly FULL row to lock in
  - declaring RC done fails on the 2 strategy rows
  - strict mode fails with 198 rows listed

## Files

All under `/tmp/claude-0/-home-user/d13d0ec6-4383-5048-8c7c-ddae9950f2ae/scratchpad/coverage/`.

**Section matrices** (row-level evidence for every subtopic):

- `/tmp/claude-0/-home-user/d13d0ec6-4383-5048-8c7c-ddae9950f2ae/scratchpad/coverage/bio-matrix.md`
- `/tmp/claude-0/-home-user/d13d0ec6-4383-5048-8c7c-ddae9950f2ae/scratchpad/coverage/gc-matrix.md`
- `/tmp/claude-0/-home-user/d13d0ec6-4383-5048-8c7c-ddae9950f2ae/scratchpad/coverage/oc-matrix.md`
- `/tmp/claude-0/-home-user/d13d0ec6-4383-5048-8c7c-ddae9950f2ae/scratchpad/coverage/qr-rc-pat-matrix.md`

Each has a JSON twin.

**Ranking**:

- Script: `/tmp/claude-0/-home-user/d13d0ec6-4383-5048-8c7c-ddae9950f2ae/scratchpad/coverage/scripts/gap-cost.mjs`
- Output: `/tmp/claude-0/-home-user/d13d0ec6-4383-5048-8c7c-ddae9950f2ae/scratchpad/coverage/gap-cost.json` (every row, cluster and gap, with the sensitivity runs)

**Area tables**: `/tmp/claude-0/-home-user/d13d0ec6-4383-5048-8c7c-ddae9950f2ae/scratchpad/coverage/scripts/area-tables.mjs`

**Gate prototype**:

- `/tmp/claude-0/-home-user/d13d0ec6-4383-5048-8c7c-ddae9950f2ae/scratchpad/coverage/scripts/gate-coverage.mjs`
- `/tmp/claude-0/-home-user/d13d0ec6-4383-5048-8c7c-ddae9950f2ae/scratchpad/coverage/scripts/build-manifest-from-audit.mjs`
- `/tmp/claude-0/-home-user/d13d0ec6-4383-5048-8c7c-ddae9950f2ae/scratchpad/coverage/coverage-manifest.json`
- Baseline and ratchet test manifests: `/tmp/claude-0/-home-user/d13d0ec6-4383-5048-8c7c-ddae9950f2ae/scratchpad/coverage/gate-demo/`

**Re-run**: from the scripts folder, run `node gap-cost.mjs && node build-manifest-from-audit.mjs && node gate-coverage.mjs --expl-share 0.8`.

**Question census** (bank-level counts behind the explanation figures): `/tmp/claude-0/-home-user/d13d0ec6-4383-5048-8c7c-ddae9950f2ae/scratchpad/question-system/census.md`
