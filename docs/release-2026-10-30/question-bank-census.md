# Ace Labs question bank census

Date: 2026-10-30. Repo: `/home/user/acelabs` (read only; nothing there was edited). In quoted items and explanations, em and en dashes are shown as plain hyphens; everything else is verbatim. Every bank below was loaded in a node `vm` sandbox (JS globals, inline `const` literals sliced out of the HTML, the NIGHTS lesson scripts, the ES-module generators), not read by eye. The analysis scripts are in `census-scripts/` next to this file; the per-bank numbers, full topic lists and the overlap pairs are in `census-data.json`.

## Totals

**Totals: 45 stored multiple-choice sets holding 14,853 question records; 12,381 of those are served to students (the rest are a backup copy, 36 unlinked prototype drills and the 5-item CASPer set, which is not DAT). After collapsing exact copies (the Game Central banks and the Prometric forms are copies of the mock pool; the pool's QR section is the QR engine bank), about 8,536 distinct presented items remain. 845 of those are DAT-style rewrites of GC and OChem engine items and about 394 full-mock items are rewrites of repo items, so the count of distinct underlying problems is about 7,300. On top of that: PAT and the OChem Tree are generated (15 fixed PAT tests = 1,350 items, plus 4 x 90 in the full mocks, plus unlimited Studio drills; 25 procedural OChem generators plus 18 Roots try-it generators).**

Across the served sets: explanation none 2,786, one line 3,607, short paragraph 3,938, detailed with per-choice reasoning 2,046; 3,336 records carry any visual. So today roughly 1 record in 6 has a detailed per-choice explainer and about 1 in 4 has a visual of any kind.

## How the columns were measured

- **Items**: question records as stored. Copies are counted in their own row and collapsed only in the totals and the overlap section.
- **Choices per item**: length of the options array as served (QC and DS items in the QR formats pool use the fixed 4 and 5 option sets).
- **Explanation level** (plain text after stripping HTML): *none* = no explanation and no per-choice notes; *one line* = under 25 words; *short paragraph* = 25 words or more without per-choice reasoning; *detailed with per-choice* = 25 words or more AND either an explicit note for every distractor with a median of 4+ words, or an explanation that names all (or all but one) of the distractors by a word unique to that choice or by its letter. The inline test is a heuristic and a lower bound: it cannot read structure (SMILES) choices, and it misses paraphrased distractors (spot checks of The Climb found several "short" items that do discuss every choice). *Notes only* = per-choice notes but no explanation.
- **Explicit per-choice notes**: items carrying a field with one note per wrong option (`diag`, `distractorNotes`, `traps`, `errs`, `hint`, `rationale`). Many of these notes are 1 to 3 words ("Off.", "Wrong direction."), which is why a bank can have notes on every item and still few "detailed" items.
- **Visual**: anything drawn with the item (SMILES drawing, inline or generated SVG, rendered chart, pedigree spec, scene picture, stimulus). Visuals that only sit nearby on the page are named as such ("node visualizer above the card").
- **Shorthand stems**: the full-mock composer's own exam-register rule (`scripts/compose-full-mocks.mjs`): under 6 words, ends in "= ?", or `x=y` shorthand. It measures how far a bank is from DAT wording.

## 1. Test forms and diagnostics

| Bank | File | Items | Sections | Choices per item | Explanation: none / one line / short paragraph / detailed with per-choice | Items with explicit per-choice notes | Items with a visual (kinds) | Shorthand stems |
|---|---|---|---|---|---|---|---|---|
| Prometric practice tests (3 fixed forms) | `shared/dat-mock-tests.js` | 420 | BIO 120, GC 90, QR 120, OCHEM 90 | 5 | 106 / 14 / 285 / 15 | 0 | 32 (SMILES drawing 20; SMILES choices 25; drawn svg 7) | 53 |
| Full-length DAT mocks, Sciences + QR (4 forms) | `tools/mock/data/full-mocks.js` | 560 | BIO 160, GC 120, OCHEM 120, QR 160 | 5 | 0 / 166 / 146 / 248 | 366 (all distractors) | 115 (SMILES drawing 115; structure choices 59) | 0 |
| The Climb (10 mini tests x 40) | `tools/minitests/bank.js` | 400 | BIO 100, GC 100, OCHEM 100, QR 100 | 5 | 0 / 0 / 170 / 230 | 0 | 12 (figure svg 12) | 13 |
| DAT mock pool (diagnostic.html draws from it) | `scripts/dat-mock-bank.json` | 2,430 | QR 1,017, GC 517, BIO 508, OCHEM 388 | 4: 1,223, 5: 1,189, 3: 17, 2: 1 | 1,346 / 46 / 997 / 41 | 0 | 183 (SMILES drawing 147; SMILES choices 125; drawn svg 8) | 633 |
| Bio Pulse Check | `tools/bio/bio-diagnostic.html` | 25 | BIO 25 | 4 | 0 / 19 / 5 / 1 | 0 | 0 | 2 |
| Bio Weakness Scan | `tools/bio/bio-mock.html` | 45 | BIO 45 | 4 | 0 / 39 / 6 / 0 | 0 | 0 | 8 |
| QR engine diagnostic | `tools/qr/index.html` | 28 | QR 28 | 4 | 0 / 21 / 0 / 7 | 28 (all distractors) | 0 | 11 |
| Gen Chem engine diagnostic | `tools/gc/index.html` | 33 | GC 33 | 4 | 0 / 26 / 0 / 7 | 33 (all distractors) | 0 | 18 |
| QR Friday Mini-Mock | `tools/qr/proposals/agent-08-pacing/friday-mini-mock.html` | 22 | QR 22 | 4 | 0 / 22 / 0 / 0 | 0 | 0 | 3 |

## 2. Section engine banks

| Bank | File | Items | Sections | Choices per item | Explanation: none / one line / short paragraph / detailed with per-choice | Items with explicit per-choice notes | Items with a visual (kinds) | Shorthand stems |
|---|---|---|---|---|---|---|---|---|
| QR engine bank | `tools/qr/index.html` | 1,020 | QR 1,020 | 4: 932, 5: 75, 3: 12, 6: 1 | 0 / 977 / 25 / 18 | 253 (all distractors) | 0 | 399 |
| QR formats pool (QC, DS, DI, AW) | `shared/qr-formats-bank.js` | 220 | QR 220 | 5: 160, 4: 60 | 0 / 0 / 205 / 15 | 179 some, 0 all | 60 (rendered table (shared/qr-figures.js) 14; rendered bar (shared/qr-figures.js) 17; rendered pie (shared/qr-figures.js) 14; rendered line (shared/qr-figures.js) 15) | 1 |
| QR Pattern Library chunk probes (recognize + generalize) | `tools/qr/index.html` | 62 | QR 62 | 4 | 0 / 56 / 6 / 0 | 0 | 0 | 41 |
| QR Productive Failure problems | `tools/qr/index.html` | 8 | QR 8 | 4 | 0 / 0 / 0 / 8 | 8 (all distractors) | 0 | 0 |
| Gen Chem engine bank | `tools/gc/index.html` | 627 | GC 627 | 4 | 0 / 508 / 44 / 75 | 627 (all distractors) | 0 | 248 |
| Gen Chem Recognition Lab stimuli | `tools/gc/recognition-stimuli.json` | 62 | GC 62 | 4 | 0 / 57 / 0 / 5 | 62 (all distractors) | 62 (svg stimulus 62) | 18 |
| Periodic Trends drill pool | `tools/gc/trends-data.json` | 41 | GC 41 | 2 | 0 / 40 / 1 / 0 | 0 | 41 (periodic table highlight (trends.html) 41) | 0 |
| OChem engine bank (Reaction Maps exam sim and hubs) | `shared/ochem-bank.js` | 1,230 | OCHEM 1,230 | 4 | 0 / 1,229 / 1 / 0 | 0 | 700 (generated molecule drawing (mol spec) 700) | 116 |
| OChem verified bank (1000 series) | `games/ochem-bank-1000.js` | 1,194 | OCHEM 1,194 | 5: 1,173, 4: 21 | 0 / 26 / 1,009 / 159 | 0 | 1,194 (SMILES drawing 1,188; structure choices 716) | 59 |
| OChem 2026-format set | `tools/ochem/bank/ochem-2026-pool.js` | 203 | OCHEM 203 | 5 | 0 / 0 / 183 / 20 | 0 | 167 (reaction row (SMILES) 34; SMILES choices 86; drawn figure (mech) 64; figure choices 29; drawn figure (rcd) 33; drawn figure (chain) 17) | 0 |
| Ace bank (Thomas-authored OChem) | `tools/ochem/bank/ace-bank.js` | 10 | OCHEM 10 | 5 | 0 / 0 / 10 / 0 | 0 | 8 (structure choices 6; SMILES drawing 6) | 0 |
| OChem v2 course engine bank | `tools/ochem/v2/index.html` | 80 | OCHEM 80 | 4 | 0 / 65 / 0 / 15 | 80 (all distractors) | 0 | 6 |
| OChem predict-the-step (mechanism step-throughs) | `tools/ochem/index.html` | 22 | OCHEM 22 | 3: 17, 4: 5 | 0 / 5 / 0 / 17 | 22 (all distractors) | 22 (mechanism step-through animation 22) | 2 |
| OChem Reaction Maps name-the-reaction items | `tools/ochem/index.html` | 8 | OCHEM 8 | 4 | 0 / 1 / 7 / 0 | 0 | 0 | 3 |
| Reading Comprehension bank (45 passages) | `tools/rc/data/bank.js` | 750 | RC 750 | 5 | 0 / 52 / 0 / 698 | 750 (all distractors) | 0 | 2 |
| Bio A&P review session quiz | `tools/bio/bio-ap-bootcamp.html` | 60 | BIO 60 | 4 | 0 / 15 / 43 / 2 | 0 | 0 | 1 |

## 3. In-lesson checks

| Bank | File | Items | Sections | Choices per item | Explanation: none / one line / short paragraph / detailed with per-choice | Items with explicit per-choice notes | Items with a visual (kinds) | Shorthand stems |
|---|---|---|---|---|---|---|---|---|
| Bio, Retold scene checks | `tools/bio-retold/index.html` | 105 | BIO 105 | 4 | 0 / 0 / 9 / 96 | 105 some, 104 all | 105 (scene svg above the check 105) | 0 |
| Gen Chem, Retold scene checks | `tools/gchem/index.html` | 98 | GC 98 | 4 | 0 / 0 / 0 / 98 | 98 (all distractors) | 98 (scene svg above the check 98) | 0 |
| OChem, Retold scene checks | `tools/organic/index.html` | 79 | OCHEM 79 | 4 | 0 / 30 / 25 / 24 | 39 (all distractors) | 75 (scene svg above the check 75) | 9 |
| QR, Retold scene checks | `tools/qr-retold/index.html` | 91 | QR 91 | 4 | 0 / 14 / 6 / 71 | 91 (all distractors) | 91 (scene svg above the check 91) | 2 |
| Reading, Retold scene checks | `tools/rc-retold/index.html` | 64 | RC 64 | 4 | 0 / 6 / 0 / 58 | 64 (all distractors) | 64 (scene svg above the check 64) | 0 |
| PAT, Retold scene checks | `tools/pat-retold/index.html` | 63 | PAT 63 | 4 | 0 / 1 / 0 / 62 | 63 (all distractors) | 63 (scene svg above the check 63) | 0 |
| Bio hub retrieval prompts (3 per node) | `tools/bio/bio-{cell,genetics,physiology,diversity,devo,evolution}.html` | 177 | BIO 177 | 4 | 69 / 0 / 99 / 9 | 0 | 177 (node visualizer above the card (bio-shared.js) 177) | 10 |
| Bio stick layer predict and check | `tools/bio/bio-stick-data.js` | 30 | BIO 30 | 3 | 0 / 18 / 0 / 12 | 30 (all distractors) | 30 (stick-figure animation follows (frames) 15; still frame 15) | 1 |
| Bio pedigree puzzles | `tools/bio/bio-shared.js` | 10 | BIO 10 | 6 | 0 / 7 / 3 / 0 | 0 | 10 (drawn pedigree (spec) 10) | 0 |
| Bio conditioning quiz | `tools/bio/bio-shared.js` | 8 | BIO 8 | 4 | 8 / 0 / 0 / 0 | 0 | 0 | 0 |
| Trick videos end-of-video checks | `tricks/videos/js/*.js` | 27 | OCHEM 19, GC 8 | 3 | 0 / 27 / 0 / 0 | 0 | 27 (inside an animated explainer video 27) | 5 |
| QR pacing simulator items | `tools/qr/proposals/agent-08-pacing/pacing-sim.html` | 17 | QR 17 | 5 | 0 / 17 / 0 / 0 | 0 | 0 | 5 |
| QR elimination drill problems | `tools/qr/index.html` | 4 | QR 4 | 5 | 4 / 0 / 0 / 0 | 0 | 0 | 0 |
| Gen Chem elimination drill | `tools/gc/index.html` | 3 | GC 3 | 4 | 0 / 2 / 0 / 0 (+1 notes only) | 3 some, 1 all | 0 | 1 |

## 4. Copies, backups, prototypes and non-DAT

| Bank | File | Items | Sections | Choices per item | Explanation: none / one line / short paragraph / detailed with per-choice | Items with explicit per-choice notes | Items with a visual (kinds) | Shorthand stems |
|---|---|---|---|---|---|---|---|---|
| Game Central BIO bank | `games/bio.json` | 508 | BIO 508 | 4: 350, 5: 158 | 350 / 0 / 143 / 15 | 0 | 0 | 205 |
| Game Central GC bank | `games/gchem.json` | 517 | GC 517 | 5 | 0 / 24 / 474 / 19 | 0 | 0 | 23 |
| Game Central QR bank | `games/qr.json` | 1,017 | QR 1,017 | 4: 813, 5: 191, 3: 13 | 903 / 77 / 36 / 1 | 0 | 0 | 396 |
| DAT mock pool backup (not served) | `scripts/dat-mock-bank.backup.json` | 2,431 | QR 1,018, GC 517, BIO 508, OCHEM 388 | 4: 1,350, 5: 1,063, 3: 16, 2: 1, 6: 1 | 1,360 / 46 / 986 / 39 | 0 | 183 (SMILES drawing 147; SMILES choices 125; drawn svg 8) | 633 |
| QR pattern comparators (prototype pages) | `tools/qr/proposals/agent-03-patterns/_build.js` | 39 | QR 39 | 4 | 0 / 39 / 0 / 0 | 0 | 0 | 7 |
| CASPer arcade (not DAT) | `tools/casper/index.html` | 5 | CASPER 5 | 4 | 0 / 5 / 0 / 0 | 0 | 0 | 0 |

## 5. Generated (procedural) items

| Generator | Where | What it makes | How the answer is produced | Explanation | Visual |
|---|---|---|---|---|---|
| PAT test engine | `tools/pat/engine/pat-*.js` via `tools/pat/test.html` (15 numbered tests, seeds from `PAT.test.seedFor(n)`) and `tools/mock/full.html` (seeds F20261001 to F20261004) | 90 items per test in six subtests of 15: Keyholes (5 choices), Top-Front-End (4), Angle Ranking (4), Hole Punching (5), Cube Counting (5), Pattern Folding (4). Test 1 built in node: 90 items, keys spread 23/23/13/24/7 over A to E | Computed from the generated 3D voxel solid, fold model or angle values; every distractor is built by a named trap (front/back swap, hidden edge drawn solid, wrong fold line, mirror cube...). Checked by independent verifiers in `scripts/pat/verify*.js` and `npm run test:pat` (docs/PAT-GENERATOR-AUDIT.md: 0 problems in 1,350 items of the 15 tests) | Template text at review (`explain()` in test.html): one line about the key plus the trap note for the option the student chose; every distractor carries a trap tag (cube counting has none) | The item is the figure; review re-draws the truth (true angle sizes, highlighted cubes) |
| PAT Studio drills | `tools/pat/{keyholes,tfe,angles,holepunch,cubes,patternfold}.html` (inline `gen`/`buildItem`) | Unlimited drills per subtest | Same idea, older generators; audited by `scripts/pat/audit-legacy.js` (fixes listed in docs/PAT-GENERATOR-AUDIT.md) | Per-page feedback | Figures |
| OChem Tree, procedural modules | `tools/ochem/tree/modules/*.js` `makeItem(api)` (25 modules: t4-alkene, t4-alkyne, t4-subelim, t4-alcohol, t4-carbonyl, t4-acid-deriv, t4-alpha, t4-aromatic, t4-radical-pericyclic, t5-proton, t5-sn-e, t5-addition, t5-acyl, t5-eas, t5-coordinate, t5-combined, t6-two-step, t6-retro, t6-selectivity, t7-ir, t7-hnmr, t7-cnmr, t7-multi, t7-properties, t7-lab) | 4-choice items (product, reagent, mechanism, cation, regiochemistry, IR/NMR reads, lab). 300 draws per module gave 200 to 300 distinct items each | Computed from the verified reaction table `tools/ochem/tree/shared/reactions.js` (125 reactions); distractors are sibling reactions of the same family; each module's `selfTest` checks 200+ items | One-sentence `coach` line only; no `why` | Substrate, product and choices drawn from SMILES |
| OChem Tree, set-serving modules | `t5-arrows-forward` (26), `t5-arrows-reverse` (21), `t5-fishhook` (22), `t5-rcd` (27), `t5-mech-chain` (17), `t5-conform` (13) | 5-choice items served from the hand-authored 2026 set (counted in section 2) | Authored key, RDKit-checked arrows | `why` + `coach` | Mechanism, RCD and chain figures |
| OChem Summit | `tools/ochem/summit/` (`build.js`) | 30-item sections mixing the verified 1000-series bank, the 2026 set and Tree generators (at most 12 test-format items per section, mass spec filtered) | From the sources above | From the sources above | From the sources above |
| OChem Roots "you try" | `tools/ochem/roots/roots/*.js` (18 roots; 6 export `gen(rng)`) | One generated try-it per visit inside `mount()` | Rule functions per root (carbocation rank, CARDIO acidity, resonance major form, E/Z, R/S...); `selfTest` tries 200 to 4,336 instances | Coach line per root | Interactive 2D or 3D drawing |
| Six Views, Chirality Bench | `games/six-views/`, `games/chirality/` | TFE view drills; R/S calls | Built from a voxel object / a priority table | Per-trap `why` (six views), priority `why` (chirality) | Drawn |

## 6. Other practice prompts (not multiple choice, listed for completeness)

| Set | Where | Count |
|---|---|---|
| GC numeric try-its with worked steps | `tools/gc/index.html` TRY_BANK | 41 |
| GC worked examples and faded (fill-the-blank) steps | `tools/gc/index.html` MODULES (41 modules) | 149 worked, 102 faded |
| QR worked examples and faded steps | `tools/qr/index.html` MODULES (45 modules) | 112 worked, 91 faded |
| OChem v2 worked and faded | `tools/ochem/v2/index.html` CONTENT (10 topics) | 30 worked, 28 faded |
| OChem Reaction Maps drills | `tools/ochem/index.html`: RS_PROBLEMS 14, IR_SPECTRA 10, NMR_SPECTRA 10, UNKNOWN_DRILLS 5, NAME_ROUNDS 7, CARDIO_PAIRS 8, AMINE_PAIRS 8, FISCHER_PROBLEMS 6, DT_CASES 8, TRAINER_FRAGMENTS 5, LESSONS 10 (beats pull MCQs from the hub bank) | about 91 |
| QR word-problem decoders (prototype, unlinked) | `tools/qr/proposals/agent-07-decoder/*.html` | 25 numeric |
| Bio micrograph ID cards, germ-layer sort | `tools/bio/bio-micrographs.html` (8), `bio-shared.js` GERM_BANK (27) | 35 |
| GC Lewis sandbox molecules | `tools/gc/lewis-molecules.json` | 18 |
| Video topic decks (hooks and formulas, no questions) | `tools/qr/tiktoks/topics.js` 37, `tools/gc/tiktoks/topics.js` 29, `tricks/series/topics.js` 14, `topics-sci.js` 27, `tricks/shorts/shorts-data.js` 14 | 121 |
| Authoring inputs already merged into the pool | `scripts/expert-questions.js` (ids `*_xp`: 15 OChem, 12 GC, 8 Bio, 8 QR), `scripts/longform-questions.js` (`*_lf`: 15 OChem, 10 GC), `scripts/arrow-questions.js` (`OC_arr`: 8 with drawn SVG), `scripts/rewrite-questions.js` (LLM rewrite pass that produced the `_rewritten` stems), `scripts/debias/edits/*.json` (choice edits) | n/a |
| Derived, not authored | `tools/gc/traps-library.json` (1,815 trap rows built from the GC engine bank `diag`), `tools/mock/verification/{verified,rejected}.json` (834 / 164 blind re-solve verdicts), `tools/rc/verification/blind/*.json` | n/a |

## 7. Bank by bank: format, coverage, explanations, visuals

### Prometric practice tests (3 fixed forms)

- File: `shared/dat-mock-tests.js` (window.DAT_MOCK_TESTS). Rendered by: prometric-mock.html (served); read by scripts/gate-answer-bias.mjs and scripts/compose-full-mocks.mjs (exclusion list).
- Format: `window.DAT_MOCK_TESTS = [{id, name, sections:{bio:[40], gc:[30], ochem:[30], qr:[40]}}]`; item `{id, section, topic, difficulty, q, opts[5], correct, why, _rewritten, q_smiles?, opts_smiles?, q_svg?, _ada_category?}`.
- One item, as stored:

```json
{"id":"BIO_cm094","section":"BIO","topic":"mitosis","difficulty":2,"q":"After DNA replication in S phase, each chromosome consists of two identical sister chromatids held together along their length, with the strongest attachment at the centromere. A multiprotein complex physically clamps the sister chromatids together until anaphase, when it is cleaved by separase. Which protein complex is this?","opts":["Cohesin, a ring-shaped SMC complex of proteins","The kinetochore, a protein disk at the centromere","Condensin, an SMC complex that compacts chromosomes","Lamins, intermediate filaments of the nuclear lamina","Histone H1, the linker histone between nucleosomes"],"correct":0,"why":"Cohesin is a ring-shaped protein complex ... Condensin compacts chromosomes (a separate role).","_rewritten":true}
```

- Items 420; sections BIO 120, GC 90, QR 120, OCHEM 90; 111 subtopics: mech-sne 14; ab-ochem 12; stereo-rs 12; membrane 10; alkene-add 10; lab 9; spec-ir-nmr 9; organelles 8; enzymes 8; mitosis 7; cell-types 7; lab 7; gas-laws 7; pemdas 7; mech-arrows 7; biomolecules 6; krebs 6; photo 6; replication 6; pct-of 6; ratios 6; translation 6; signaling 5; proteins 5; glycolysis 5; ... (111 topics in all, full list in census-data.json).
- Choices: 5.
- Explanations (none / line / short / detailed): 106 / 14 / 285 / 15 (by section: BIO 0/0/108/12; GC 0/5/84/1; QR 106/1/12/1; OCHEM 0/8/81/1); median 35 words; 5 run 60+ words; explicit per-choice notes on 0. 2 explanations cite answer letters.
- Typical explanation (short, BIO_cm075): "The nucleolus is a dense subnuclear region where RNA polymerase I transcribes rRNA genes and where rRNA is assembled with ribosomal proteins to form pre-ribosomal subunits. These are exported to the cytoplasm for final maturation. Its prominence reflects ribosome demand."
- Visuals: 32 (SMILES drawing 20; SMILES choices 25; drawn svg 7).
- All 420 items are pool items by id (zero overlap between the three forms). QR is the weak section: 106 of 120 QR items have no explanation at all and 47 have shorthand stems such as `{"id":"QR_fd2","q":"5/8 = ?","opts":["0.58","0.375","0.65","0.6","0.625"],"correct":4}`. The review screen shows `why` only when present, so those items show nothing.
- OChem visuals: 20 SMILES stems and 25 SMILES choice sets drawn by `shared/smiles-drawer.min.js`, 7 hand-drawn SVG arrow stems. No Bio, GC or QR item has a figure.

### Full-length DAT mocks (4 forms)

- File: `tools/mock/data/full-mocks.js (composed by scripts/compose-full-mocks.mjs from an external prep-app pool)` (window.ACE_FULL_MOCKS). Rendered by: tools/mock/full.html + full.js (PAT from tools/pat/engine seeds F20261001-4, RC from tools/rc/data/bank.js sections rc-s12 to rc-s15).
- Format: `window.ACE_FULL_MOCKS = {version, rules, mocks:[{id, name, sections:{bio,gc,ochem,qr}, pat:{seed}, rc:{section}}]}`; item `{id, sub, stop, topic, nights, d, q, opts[5], correct, why, traps[5] (null on the key), qs (stem SMILES), os (structure choices), src}`.
- One item, as stored:

```json
{"id":"qr-a:fam5","sub":"QR","topic":"Fractions, decimals and number sense","d":2,"q":"A delivery route runs 2/3 of a mile, then 5/6 of a mile further, then doubles back 1/2 of a mile. How many miles is the driver from the start?","opts":["7/6","2","5/6","3/4","1"],"correct":4,"why":"LCD = 6. 4/6 + 5/6 - 3/6 = 6/6 = 1.","traps":["You rescaled 1/2 as 2/6 instead of 3/6, leaving one sixth too much.","You added all three instead of subtracting the last one...","You rescaled 1/2 as 4/6 instead of 3/6...","You drifted into fourths...",null],"qs":null,"os":false,"src":"qr-a"}
```

- Items 560; sections BIO 160, GC 120, OCHEM 120, QR 160; 50 subtopics: Fractions, decimals and number sense 25; Cellular respiration 22; Body systems at work 21; The membrane and what crosses it 21; The center of the universe: alkenes 20; The mole bridge 19; Photosynthesis 17; Proton traffic 16; The alpha carbon wakes up 16; Percentages and percent change 16; Algebra: one and two unknowns 16; Powers, roots and quadratics 16; Replication and mitosis 14; Control systems: nerves and hormones 13; Gases 13; Beyond Mendel and molecular tools 12; States and solutions 12; Balance and the push-back 12; Reading the machines: spectroscopy, lab and synthesis 12; The four questions: substitution and elimination 12; The reactivity ladder: acid derivatives 12; Ratios and proportions 12; Word problems: mixtures, interest, money 12; Word problems: rates, distance, work 12; Statistics and reading data 12; Probability and counting 11; Evolution 8; Reproduction and development 8; Diversity of life 8; Meiosis 8; Ecology and behavior 8; Why atoms bond 8; How fast, not how far 8; The charge ledger 8; The energy ledger 8; The only reaction in organic chemistry 8; The switchboard: alcohols, ethers, epoxides 8; Different arrows: radicals and Diels-Alder 8; The ring that refuses: aromatics 8; Pay twice, plus the acidic H: alkynes 8; Triangles and the coordinate plane 8; The setup mindset 8; Trigonometry, just enough 8; The quantum address, plus nuclear 4; Shape and the sticky forces 4; The two questions: measurement and the lab 4; Downhill: entropy and free energy 4; Molecules in 3D 4; The hungry carbon: aldehydes and ketones 4; Geometry: area, perimeter, volume 4.
- Choices: 5.
- Explanations (none / line / short / detailed): 0 / 166 / 146 / 248 (by section: BIO 0/0/1/159; GC 0/44/52/24; OCHEM 0/9/90/21; QR 0/113/3/44); median 38 words; 127 run 60+ words; explicit per-choice notes on 366 (all distractors). 32 explanations cite answer letters.
- Typical explanation (detailed, bio:BIO_g011@FULL_1): "This is a Hardy-Weinberg question wearing a sentence as a disguise. For a recessive condition, the word affected describes homozygous recessive individuals, so the number you are handed is q squared, not q. One in 10,000 is 0.0001, and the square root of that is 0.01. Any time a stem gives you the frequency of affected recessive individuals, take the square root first, then build p and the carrier frequency off that ..."
- Visuals: 115 (SMILES drawing 115; structure choices 59).
- Sources (`src`): bio 76, written 82, originals 18, gchem-b 58, generated 63, gchem-a 27, organic 113, own-organic 3, qr-a 114, qr-b 6. By id or stem, 394 items trace to repo banks (pool 140, QR engine 114, OChem 1000-series 110, GC engine 27, Ace bank 3), reworded to exam register; 166 (written 82, generated 63, originals 18, organic 3) exist only here. The composer draws from an external prep-app pool (`~/code/acethedat-prep/site/data/bank`) that is not in this repo.
- Plus per form: one PAT section of 90 generated items and one 3-passage RC section (rc-s12 to rc-s15) from the RC bank.
- Bio is the strongest section (159 of 160 detailed); QR has 113 one-line explanations, though every QR item carries per-choice trap notes.

### The Climb (10 rungs x 40)

- File: `tools/minitests/bank.js (source tools/minitests/source/minitest-source.json)` (window.MINITEST_BANK). Rendered by: tools/minitests/index.html.
- Format: `window.MINITEST_BANK = {version, tests:[{n, tier, questions:[40]}]}`; item `{section, topic, stem, choices[5], correct, explanation, figureSvg?}`. 10 per section per rung, tiers 1 to 10.
- One item, as stored:

```json
{"section":"bio","topic":"Biomolecules","stem":"Which of the following is the monomer (building block) from which proteins are constructed?","choices":["Nucleotide","Monosaccharide","Fatty acid","Glycerol","Amino acid"],"correct":4,"explanation":"Proteins are polymers of amino acids joined by peptide bonds, so the amino acid is the correct monomer. Each distractor is deliberately the monomer of a DIFFERENT biomolecule class: nucleotides build nucleic acids (DNA/RNA), monosaccharides build carbohydrates, and fatty acids plus glycerol combine to form lipids (triglycerides)..."}
```

- Items 400; sections BIO 100, GC 100, OCHEM 100, QR 100; 43 subtopics: Biomolecules 10; Cell structure & organelles 10; Membrane transport 10; Cellular respiration 10; Photosynthesis 10; Central dogma (DNA->RNA->protein) 10; Mitosis & meiosis 10; Mendelian genetics 10; Evolution & population genetics 10; Moles & stoichiometry 10; Atomic structure & quantum numbers 10; Periodic trends 10; Bonding, Lewis & VSEPR 10; Gas laws 10; Thermochemistry 10; Kinetics 10; Equilibrium 10; Acids, bases & pH 10; Electrochemistry 10; IUPAC nomenclature 10; Stereochemistry (R/S, chirality) 10; SN1/SN2/E1/E2 10; Alkene addition reactions 10; Aromaticity & EAS 10; Alcohols & carbonyls 10; Acidity & pKa 10; Resonance & stability 10; IR & H-NMR spectroscopy 10; Synthesis / roadmap 10; Fractions & decimals 10; Algebra & equations 10; Ratios & proportions 10; Percentages 10; Exponents & roots 10; Geometry (area/volume) 10; Trigonometry 10; Probability 10; Statistics (mean/median/SD) 10; Word problems (rate/work/mixture) 10; Physiology (a body system) 7; Physiology (cardiovascular system) 1; Physiology (circulatory system) 1; Physiology (renal system) 1.
- Choices: 5.
- Explanations (none / line / short / detailed): 0 / 0 / 170 / 230 (by section: BIO 0/0/53/47; GC 0/0/45/55; OCHEM 0/0/28/72; QR 0/0/44/56); median 81 words; 361 run 60+ words; explicit per-choice notes on 0. 94 explanations cite answer letters.
- Typical explanation (detailed, climb1-1): "Proteins are polymers of amino acids joined by peptide bonds, so the amino acid is the correct monomer. Each distractor is deliberately the monomer of a DIFFERENT biomolecule class: nucleotides build nucleic acids (DNA/RNA), monosaccharides build carbohydrates, and fatty acids plus glycerol combine to form lipids (triglycerides). A student who confuses which subunit goes with which macromolecule would be tempted by t..."
- Visuals: 12 (figure svg 12).
- The most consistently explained bank: median 81 words, 361 of 400 run 60+ words, and most explanations walk every distractor. 94 explanations cite letters ("so E is correct", "0.34 (A)"); in all 69 where the key's letter can be read off, it matches the served key. `tools/minitests/source/minitest-source.json` holds the same 400 before re-lettering (276 differ in order).
- Only 12 items carry a figure SVG.

### DAT mock pool

- File: `scripts/dat-mock-bank.json` (JSON {qr, gc, bio, ochem}). Rendered by: diagnostic.html (fetch, draws 15 Bio + 15 GC + 15 OChem + up to 15 QR); scripts/compose-tests.js built the Prometric forms from it.
- Format: `{qr:[1017], gc:[517], bio:[508], ochem:[388]}`; item `{id, section, topic, difficulty, q, opts, correct, why?, _rewritten?, q_smiles?, opts_smiles?, q_svg?}`.
- One item, as stored:

```json
{"id":"BIO_g001","section":"BIO","topic":"mendel","difficulty":2,"q":"Aa × Aa cross with complete dominance gives what <em>phenotypic ratio</em>?","opts":["1:2:1","3:1 (dominant:recessive)","9:3:3:1","1:1"],"correct":1}
```

- Items 2,430; sections QR 1,017, GC 517, BIO 508, OCHEM 388; 176 subtopics: frac-add 43; lin-eq 42; carbonyl 41; pct-chg 40; frac-mul 40; pct-of 39; alkene-add 38; arom-eas 36; spec-ir-nmr 36; pct-seq 35; mech-sne 34; word-decode 33; ratios 33; rate-time 33; ab-ochem 32; logs 31; frac-dec 30; dec-arith 30; mole-conv 30; stereo-rs 30; lab 30; distrib 27; estim 26; mental 26; pemdas 26; ... (176 topics in all, full list in census-data.json).
- Choices: 4: 1,223, 5: 1,189, 3: 17, 2: 1.
- Explanations (none / line / short / detailed): 1,346 / 46 / 997 / 41 (by section: QR 996/3/17/1; GC 0/24/474/19; BIO 350/0/143/15; OCHEM 0/19/363/6); median 0 words; 13 run 60+ words; explicit per-choice notes on 0. 11 explanations cite answer letters.
- Visuals: 183 (SMILES drawing 147; SMILES choices 125; drawn svg 8).
- Lineage: GC 495 of 517 are DAT-style rewrites of GC engine items (same id with a `GC_` prefix; engine "How many protons in 56/26 Fe?" became a 40-word mass-spectrometer stem); OChem 350 of 388 are rewrites of OChem engine items (`OC_` prefix); QR 1,009 of 1,017 are the QR engine items verbatim (`QR_` prefix, 996 without any explanation); Bio 508 come from a Bio set not otherwise in the repo (ids `BIO_cm/p/g/d/e/dev`), and 350 of them have no explanation and 4 choices. The rest are the expert, long-form and arrow items from the authoring scripts.
- diagnostic.html filters it (Bio `_rewritten`, all GC and OChem, QR with `_xp` id or a `why`) and samples 15 per section. The QR filter now yields 21, so the diagnostic serves 60 questions while its static copy and `shared/scope.js` DIAGNOSTIC still say 53 (8 QR).

### QR engine bank

- File: `tools/qr/index.html (inline const BANK, line 3091)` (const BANK). Rendered by: tools/qr/index.html (module practice, Pattern Library, timed sim, Friday drill).
- Format: `const BANK = [{id, skills[], diff, q, opts, correct, why, diag:{index: note}}]` inline in the page.
- One item, as stored:

```json
{"id":"un2","skills":["units"],"diff":2,"q":"Convert 250 mL to liters.","opts":["0.25 L","25 L","2.5 L","2500 L"],"correct":0,"why":"1000 mL = 1 L. 250 / 1000 = 0.25 L.","diag":{"1":"Wrong direction.","2":"Decimal off.","3":"Wrong direction by 10."}}
```

- Items 1,020; sections QR 1,020; 43 subtopics: frac-add 43; lin-eq 42; frac-mul 40; pct-of 39; pct-chg 39; pct-seq 35; word-decode 33; ratios 33; rate-time 33; logs 31; frac-dec 30; dec-arith 30; distrib 27; estim 26; mental 26; pemdas 26; neg-ineq 26; mixture 23; interest 23; coord 23; units 23; p-flip 23; p-andor 23; count-pc 23; discr 23; harm 23; zscore 23; tri-inv 23; vol-sa 23; ds 23; exps 23; work-rate 22; absval 22; p-cond 21; binomials 10; geo-2d 10; skip-ret 9; guess 9; sets 9; desc-stats 9; untimed 8; trig 5; data-interp 5.
- Choices: 4: 932, 5: 75, 3: 12, 6: 1.
- Explanations (none / line / short / detailed): 0 / 977 / 25 / 18; median 11 words; 0 run 60+ words; explicit per-choice notes on 253 (all distractors). 28 explanations cite answer letters.
- Typical explanation (line, fa1): "Find a common denominator (4). 1/4 + 2/4 = 3/4."
- Visuals: 0.
- 914 distinct stems in 1,020 records (90 exact stem-plus-choice repeats); `shared/scope.js` claims 925 distinct. 399 stems are shorthand. 932 items have 4 choices, while the repo's own DAT-spec research (tools/qr/research/agent-w1-dat-specs/REPORT.md) says QR uses 5.
- No item has its own figure; 36 skills have a lesson visual (`VISUAL_BY_SKILL`) shown in the module, not with the question.

### QR formats pool (QC, DS, DI, AW)

- File: `shared/qr-formats-bank.js (+ .json; source scripts/qr-formats/src/{qc,ds,di,aw}.js)` (window.QR_FORMATS_DATA). Rendered by: tools/qr/index.html via tools/qr/qr-formats-module.js (four DAT-format modules); tests/qr-formats/figures.html.
- Format: `window.QR_FORMATS_DATA = {formats, choices:{qc:[4 fixed], ds:[5 fixed]}, items:[{id, format, skill, topic, diff, stem, colA/colB (qc), s1/s2 (ds), figure (di), opts (null for qc/ds), correct, move, why, diag:{index: note}}]}`; 60 QC, 60 DS, 60 DI, 40 AW.
- One item, as stored:

```json
{"id":"di-001","format":"di","skill":"data-figs","topic":"percent","diff":2,"stem":"According to the table, by what percent did total enrollment in the program increase from 2021 to 2023?","figure":{"type":"table","title":"Students enrolled in a summer science program","columns":["Year","Biology","Chemistry","Physics"],"rows":[["2021",120,80,50],["2022",150,90,60],["2023",165,72,63]]},"opts":["8%","12.5%","16.7%","18%","20%"],"correct":4,"move":"Percent change = (new - old) / old. The old value is always the denominator.","why":"Add each row first. 2021: 120 + 80 + 50 = 250 ... The trap is dividing by the newer total: 50 / 300 is about 16.7%.","diag":{"2":"You divided the change by the 2023 total. Percent change always divides by the starting value."}}
```

- Items 220; sections QR 220; 48 subtopics: di:percent 27; qc:exponents 12; ds:number-properties 10; ds:statistics 9; di:ratios 9; qc:statistics 8; di:statistics 8; ds:equations 7; ds:inequalities 7; di:data 7; aw:work 7; qc:ratios 6; aw:mixture 6; aw:percent 6; aw:rates 6; qc:percent 5; aw:interest 5; qc:probability 4; qc:algebra 4; qc:inequalities 4; qc:number-properties 4; ds:absolute-value 4; di:rates 4; aw:ratios 4; qc:counting 3; ds:ratios 3; ds:percent 3; ds:exponents 3; ds:functions 3; di:graphical 3; aw:probability 3; qc:absolute-value 2; qc:functions 2; qc:graphical 2; qc:equations 2; ds:rates 2; ds:work 2; ds:sequences 2; ds:probability 2; aw:statistics 2; qc:sequences 1; qc:interest 1; ds:algebra 1; ds:interest 1; ds:mixture 1; di:exponents 1; di:interest 1; aw:counting 1.
- Choices: 5: 160, 4: 60.
- Explanations (none / line / short / detailed): 0 / 0 / 205 / 15; median 62 words; 126 run 60+ words; explicit per-choice notes on 179 some, 0 all.
- Typical explanation (short, qc-001): "Sign first: an odd power keeps the negative, an even power makes it positive. Do not calculate, read the signs. x is negative. Cubing a negative number keeps it negative (three negatives multiply to a negative), so x³ < 0. Squaring any nonzero number makes it positive, so x² > 0. A negative number is always less than a positive number, so Quantity B is greater for every allowed x. Quick test: x = -1/2 gives x³ = -1/8..."
- Visuals: 60 (rendered table (shared/qr-figures.js) 14; rendered bar (shared/qr-figures.js) 17; rendered pie (shared/qr-figures.js) 14; rendered line (shared/qr-figures.js) 15).
- Built and key-checked by `scripts/qr-formats/build.js` (exact arithmetic). Every item has `move` + a worked `why` (median 62 words); `diag` names the most tempting wrong answer on 179 items. Every DI item has a rendered figure (`shared/qr-figures.js`: 14 tables, 17 bar, 15 line, 14 pie). Not used by any mock yet.

### Gen Chem engine bank

- File: `tools/gc/index.html (inline const BANK, line 5139)` (const BANK). Rendered by: tools/gc/index.html (module drills, mock sim, adaptive practice); tools/gc/traps.html via traps-library.json (derived).
- Format: `const BANK = [{id, skills[], diff, q, opts[4], correct, why, diag:{index: note}}]` inline.
- One item, as stored:

```json
{"id":"lw-e6","skills":["lewis"],"diff":2,"q":"Total valence e⁻ in PO₄³⁻?","opts":["28","30","32","34"],"correct":2,"why":"P(5) + 4·O(6) + 3 (charge) = 32.","diag":{"0":"No charge.","1":"Off.","3":"Off."}}
```

- Items 627; sections GC 627; 37 subtopics: mole-conv 34; gas-laws 31; lim-react 26; ph-basics 25; solutions 24; atomic 23; imf-rank 22; bonding 21; eq-kc 20; buffers 20; titration 20; periodic 19; lewis 19; enthalpy 18; gibbs 18; strong-weak 18; hybridization 18; nernst 17; calorimetry 17; vsepr 15; rate-laws 15; arrhenius 15; eq-ice 15; ksp 15; eq-lechat 14; red-pot 14; nuclear 14; sig-figs 14; entropy 13; galvanic 13; quantum-numbers 13; colligative 12; phase-diag 9; electrolysis 8; heating-curve 8; sol-rules 5; no-calc 5.
- Choices: 4.
- Explanations (none / line / short / detailed): 0 / 508 / 44 / 75; median 14 words; 6 run 60+ words; explicit per-choice notes on 627 (all distractors).
- Typical explanation (line, at1): "Z=26 → 26 protons. Subscript on isotope notation = atomic #."
- Visuals: 0.
- 627 items (`shared/scope.js` and tools/gc/QBANK_AUDIT.md say 605). Every wrong choice has a diag note, but the notes are terse; 248 stems are shorthand and 590 use non-ASCII glyphs (subscripts, arrows). No visuals.

### OChem engine bank (Reaction Maps)

- File: `shared/ochem-bank.js` (window.OCHEM_BANK). Rendered by: tools/ochem/index.html (exam sim, hub drills); unified-mock.html (legacy, 301 to prometric-mock.html).
- Format: `window.OCHEM_BANK = [{id, skill, diff, format, mol?, q, opts[4], correct, why}]`; `mol` is a generator spec (`{type:"alkene", args:[4,1]}`) drawn on the page.
- One item, as stored:

```json
{"id":"alk1079","skill":"alkene-add","diff":4,"format":"skeletal","mol":{"type":"alkene","args":[5,3]},"q":"Major product of <b>3-heptene</b> + <b>H2O / H2SO4</b>?","opts":["Markovnikov OH (rearrangements possible)","Epoxide","anti-Markovnikov OH","Diol"],"correct":0,"why":"Acid-cat hydration via cation; Markovnikov; rearranges."}
```

- Items 1,230; sections OCHEM 1,230; 13 subtopics: alkene-add 540; mech-sne 144; arom-eas 94; carbonyl 88; alc-eth 62; stereo-rs 59; spec-ir-nmr 46; acids 43; ab-ochem 42; lab 38; synth 28; alkyne 26; amines 20.
- Choices: 4.
- Explanations (none / line / short / detailed): 0 / 1,229 / 1 / 0; median 8 words; 0 run 60+ words; explicit per-choice notes on 0.
- Typical explanation (line, mec001): "Carbocation is planar; nucleophile attacks both faces → racemic mix."
- Visuals: 700 (generated molecule drawing (mol spec) 700).
- Template-built: alkene addition alone is 540 items; 994 distinct stems and 206 exact repeats. Formats: skeletal 680, condensed 500, name 30, Fischer 11, Newman 9. 1,229 one-line explanations (median 8 words); the choices are described outcomes, not structures.

### OChem verified bank (1000 series)

- File: `games/ochem-bank-1000.js` (window.OCHEM_DB). Rendered by: games/play.html?subject=ochem; tools/ochem/tree (bankItems via bank-map.js GROUP_MAP); tools/ochem/summit (Summit sections).
- Format: `window.OCHEM_DB = [{q, q_smiles, opts_are_structures, opts[5], correct, why, difficulty, keep, scope_ok, smiles_valid, group, issue}]` (no ids).
- One item, as stored:

```json
{"q":"Neopentyl bromide (2,2-dimethyl-1-bromopropane, drawn) is treated with NaI in acetone. Which product, if any, forms, and what governs the rate?","q_smiles":"CC(C)(C)CBr","opts_are_structures":true,"opts":["CCC(C)(C)I","COCC(C)(C)C","CCC(C)(C)C","CC(C)(C)CI","CC(C)(C)CO"],"correct":3,"why":"Iodide is a strong nucleophile and the C-Br carbon is primary, so the only available path is SN2 ... neopentyl alcohol and neopentyl methyl ether use the wrong nucleophile; and 2,2-dimethylbutane adds a carbon and has no halogen at all.","difficulty":2,"keep":true,"group":"sn1-sn2","issue":"None; SN2 with no rearrangement correct..."}
```

- Items 1,194; sections OCHEM 1,194; 51 subtopics: claisen 32; malonic-acetoacetic 32; oxidation-reduction-overview 31; e1-e2 29; carbocation-rearrangement 29; michael 28; acid-base-pka 27; sn1-sn2 24; sub-vs-elim 24; alkene-radical-hbr 24; alkene-hydration 24; alkene-ozonolysis 24; alkyne-reduction-alkylation 24; carbonyl-grignard-hydride 24; carbonyl-acetal-imine 24; ester-formation-hydrolysis 24; acyl-substitution 24; eas-reactions 24; aromatic-other 24; amine-synthesis 24; amine-reactions 24; stereo-relationships 24; hybridization-geometry 24; spectroscopy-ir 24; spectroscopy-ms-dou 24; lab-techniques 24; functional-group-id 24; alkene-epoxidation-diol 23; alkyne-addition 23; alkyne-hydration 23; alcohol-oxidation 23; alcohol-substitution-dehydration 23; wittig 23; aldol 23; carboxylic-reduction-decarb 23; eas-directing 23; aromaticity 23; resonance-stability 23; spectroscopy-nmr 23; multistep-synthesis 23; alkene-halogenation 22; alkene-hydrogenation 21; ether-epoxide 21; enolate-alkylation-halogenation 21; diels-alder 21; pericyclic-other 21; radical-reactions 20; nomenclature 20; alkene-hx 17; stereo-rs-ez 13; misc 10.
- Choices: 5: 1,173, 4: 21.
- Explanations (none / line / short / detailed): 0 / 26 / 1,009 / 159; median 62 words; 638 run 60+ words; explicit per-choice notes on 0. 47 explanations cite answer letters.
- Typical explanation (short, odb-0): "A secondary halide with a strong, small anionic nucleophile (hydroxide) in a polar aprotic solvent (DMSO) reacts by SN2: backside attack with inversion at the stereocenter. Because OH takes over the top CIP priority that Br held, the physical inversion also flips the descriptor, so (R)-2-bromobutane gives (S)-2-butanol. (R)-2-Butanol would require retention, which SN2 cannot give; 1-butanol and 2-methyl-1-propanol pu..."
- Visuals: 1,194 (SMILES drawing 1,188; structure choices 716).
- The richest OChem explanations (median 62 words, 638 run 60+). 716 items have structure choices, so the per-choice heuristic cannot see them; read by hand, those explanations usually walk the distractors, so the true detailed count is well above 159. Every item has a drawn SMILES stem or choices. 659 items carry a non-"None" reviewer `issue` note. 323 explanations use the word "wrong" (house rule).

### OChem 2026-format set

- File: `tools/ochem/bank/ochem-2026-pool.js (also tools/ochem/tree/shared/set-2026.js and scripts/ochem2026/ochem-2026-pool.json; source scripts/ochem2026/src/*.mjs)` (window.OCHEM_2026_POOL / export SET2026). Rendered by: tools/ochem/tree/ and tools/ochem/summit/ (import SET2026 from set-2026.js); the pool .js file has no page that loads it (tests only).
- Format: Authored in `scripts/ochem2026/src/*.mjs` (`export default [item]`), gated by `build.mjs` (RDKit arrow proofs), exported three times. Item `{id, type, home, area, typeName, roots[], difficulty, stem, fig?, sub?, reagent?, prod?, choices:[5 x {text?, smiles?, fig?}], correct, verify, coach, why}`.
- One item, as stored:

```json
{"id":"af-01","type":"arrows-forward","stem":"Follow the curved arrows exactly as drawn. What do they make?","fig":{"kind":"mech","species":[{"smi":"[C-]#N"},{"smi":"CCCBr"}],"arrows":["lp 0.0 -> bond 0.0-1.2","bond 1.2-1.3 -> atom 1.3"],"hideProduct":true},"choices":[{"text":"butanenitrile and bromide","smiles":"CCCC#N.[Br-]"},{"text":"2-methylpropanenitrile and bromide"},{"text":"no change at all"},{"text":"propyl isocyanide and bromide"},{"text":"propene, HCN and bromide"}],"correct":0,"coach":"The tail is the carbon lone pair, so carbon, not nitrogen, makes the new bond...","why":"The lone pair on the cyanide carbon attacks the carbon bonded to bromine... The isocyanide would need the arrow to start on nitrogen."}
```

- Items 203; sections OCHEM 203; 15 subtopics: Reaction coordinate diagram 27; Curved arrows, predict the product 26; Curved arrows, predict the arrows 21; Combined mechanism 17; Conformations 13; Acid-base equilibrium 13; Lab techniques 13; 13C NMR 12; Chemoselectivity 11; Combined spectra 10; Alpha-carbonyl 9; Fishhook arrows, predict the product 9; Multi-step synthesis 9; Fishhook arrows, predict the arrows 8; Radical mechanism 5.
- Choices: 5.
- Explanations (none / line / short / detailed): 0 / 0 / 183 / 20; median 49 words; 24 run 60+ words; explicit per-choice notes on 0.
- Typical explanation (short, al-01): "LDA grabs a proton from the CH2 alpha carbon, which is less hindered than the CH carrying the methyl, and at -78 C nothing equilibrates. That kinetic enolate then attacks CH3I in an SN2, putting the new methyl on the other alpha carbon: 2,6-dimethylcyclohexanone. Thermodynamic conditions would favor 2,2-dimethyl."
- Visuals: 167 (reaction row (SMILES) 34; SMILES choices 86; drawn figure (mech) 64; figure choices 29; drawn figure (rcd) 33; drawn figure (chain) 17).
- The closest thing in the repo to the 2026 DAT OChem spec (arrow pushing both directions, RCDs, fishhooks, combined spectra). `why` is 2 to 4 sentences by rule (key plus the strongest distractor), so most land in "short". 167 of 203 have a drawn figure (64 mechanism, 33 reaction coordinate, 17 radical chain, 34 reaction rows). `tools/ochem/bank/ochem-2026-pool.js` is loaded by no page (tests only); the Tree and Summit import `set-2026.js`.

### Reading Comprehension bank

- File: `tools/rc/data/bank.js (built by scripts/build-rc-bank.mjs from tools/rc/data/passages/*.json)` (window.ACE_RC_BANK). Rendered by: tools/rc/index.html (rc.js player, timed sections + untimed), tools/mock/full.html (RC section).
- Format: `window.ACE_RC_BANK = {types, passages:{id:{title, topic, field, source, words, paragraphs[[sentences]], questions[]}}, order, sections[15 x 3 passages]}`; question `{id, type, stem, choices[5], key, proof:[{paragraph, sentence, quote}], why, distractorNotes[5] (null on key)}`.
- One item, as stored:

```json
{"id":"rc-o01-q01","type":"detail","stem":"According to the passage, the amount of oxygen available to the body falls at high altitude because","choices":["the fraction of oxygen in the air drops as the air thins with elevation","total air pressure falls while the oxygen fraction stays the same","oxygen molecules are less able to cross into the blood in cold, dry air","low pressure acts on the body in ways unrelated to oxygen","the lungs take in less air with each breath at high elevation"],"key":1,"proof":[{"paragraph":1,"sentence":2,"quote":"the partial pressure of a gas is its fraction times the total pressure, the oxygen available to the body falls with it"}],"why":"Paragraph 1 says the air still holds about 21 percent oxygen ...","distractorNotes":["Reversed: paragraph 1 says the fraction stays at about 21 percent.",null,"Outside the passage: nothing is said about cold air...","This is the idea Paul Bert ruled out at the end of paragraph 1.","Reversed: paragraph 3 says breathing becomes deeper and faster, not shallower."]}
```

- Items 750; sections RC 750; 8 subtopics: detail 270; inference 116; function 71; except 71; tone 64; vocab 64; mainidea 64; application 30.
- Choices: 5.
- Explanations (none / line / short / detailed): 0 / 52 / 0 / 698; median 35 words; 1 run 60+ words; explicit per-choice notes on 750 (all distractors).
- Typical explanation (detailed, rc-o01-q01): "Paragraph 1 says the air still holds about 21 percent oxygen and that barometric pressure falls with altitude; since partial pressure is fraction times total pressure, it is the pressure, not the fraction, that drops."
- Visuals: 0.
- 45 passages (26 original, 19 migrated from the prep app, about 1,366 words each, 25 fields led by history of science 6 and physiology 4), 750 questions. Every question has a validated proof line and a note for every distractor, so it is the only bank where every item is already "explainer plus evidence". 246 distractor notes contain "wrong". No figures, as on the real RC.

### Retold lesson checks (six courses; the item, topic and level lines below are for OChem, Retold)

- File: `tools/organic/index.html (NIGHTS[n].scenes[].q)` (NIGHTS). Rendered by: tools/organic/index.html (narrated nights; audio/cues.json).
- Format: `NIGHTS[n] = {t, booster, lede, scenes:[{n, t, svg, walk, teach, q:{stem, opts[4], errs[4] (null on key), correct, explain}}]}` in each course page; one check per scene. Counts: Bio 105 (14 nights), Gen Chem 98 (14), OChem 79 (13), QR 91 (14), RC 64 (10), PAT 63 (10) = 500.
- One item, as stored:

```json
{"stem":"In this one sentence, who moves first?","opts":["The electron-poor species reaches out and takes electrons","The electron-rich species attacks - electrons always flow FROM rich TO poor","They collide randomly and either can start","The solvent decides who moves"],"errs":["THE BACKWARDS ARROW - THE POOR SPECIES HAS NO ELECTRONS TO REACH WITH",null,"THE COIN-FLIP MYTH - ELECTRONS FLOW RICH TO POOR, NEVER RANDOMLY","BLAMING THE SOLVENT - SOLVENT SETS THE SPEED, NOT THE DIRECTION"],"correct":1,"explain":"Arrows in organic chemistry are electron movement, and electrons live on the rich species - so the rich one always throws the first punch. The green attacks the red, never the reverse."}
```

- Items 79; sections OCHEM 79; 13 subtopics: Night 1: The Only Reaction in Organic Chemistry 10; Night 4: The Four Questions 7; Night 13: Reading the Machines 7; Night 2: Names Are Directions 6; Night 5: The Center of the Universe 6; Night 7: The Hungry Carbon 6; Night 9: The Switchboard 6; Night 11: The Ring That Refuses 6; Night 3: Molecules in 3D 5; Night 6: Pay Twice, Plus the Acidic H 5; Night 8: The Reactivity Ladder 5; Night 10: The Alpha Carbon Wakes Up 5; Night 12: Different Arrows 5.
- Choices: 4.
- Explanations (none / line / short / detailed): 0 / 30 / 25 / 24; median 26 words; 0 run 60+ words; explicit per-choice notes on 39 (all distractors).
- Typical explanation (line, n1s5): "Concerted means one moment where both half-bonds exist: O-C forming, C-Br breaking. No intermediate, no cation - that single fact separates SN2 from SN1."
- Visuals: 75 (scene svg above the check 75).
- Levels by course (none/line/short/detailed): Bio 0 / 0 / 9 / 96; GC 0 / 0 / 0 / 98; OChem 0 / 30 / 25 / 24; QR 0 / 14 / 6 / 71; RC 0 / 6 / 0 / 58; PAT 0 / 1 / 0 / 62. The per-choice reasoning is the all-caps trap label in `errs` (6 to 12 words). OChem is thinnest: 40 of 79 checks have no `errs`.
- Every scene has a teaching SVG above the check (OChem 75 of 79), plus narration in `walk` and `audio/cues.json`: these are already the raw material for videos. 4 choices everywhere, not the DAT's 5.

### Bio hub retrieval prompts

- File: `tools/bio/bio-{cell,genetics,physiology,diversity,devo,evolution}.html (cards) + tools/bio/bio-shared.js NODES[*].retrievals (feedback)` (HTML .retrieval-card + const NODES). Rendered by: the six Bio hub pages (confidence picker "Guess / Locked in" shown before feedback).
- Format: Cards are HTML in the six hub pages (`<div class="retrieval-card" data-q="N">` with 4 `.opt[data-correct]`), three per node; feedback text lives in `bio-shared.js` `NODES[node].retrievals[N] = {q, qh, rt (on a hit), wr (on a miss), ex (deep explanation)}`.
- One item, as stored:

```html
<div class="retrieval-card" data-q="1"> Q: "Two heterozygous parents (Aa x Aa) plan to have two children. What is the probability that BOTH children will be affected (homozygous recessive)?" A 1/4 | B 1/8 | C 1/16 (data-correct="true") | D 1/2
```

- Items 177; sections BIO 177; 57 subtopics: genetics/mut 6; physiology/imn 6; cell/rep 3; cell/trc 3; cell/rnp 3; cell/tln 3; cell/mit 3; cell/gly 3; cell/wat 3; cell/car 3; cell/lip 3; cell/pro 3; cell/nuc 3; cell/enz 3; cell/pve 3; cell/org 3; cell/cyt 3; cell/mtr 3; cell/sig 3; cell/krb 3; cell/pho 3; genetics/prb 3; genetics/men 3; genetics/mei 3; genetics/lco 3; genetics/ped 3; genetics/hwb 3; genetics/nmn 3; genetics/grg 3; physiology/ap 3; physiology/syn 3; physiology/rfx 3; physiology/brn 3; physiology/snz 3; physiology/cdv 3; physiology/nph 3; physiology/rsp 3; physiology/end 3; physiology/dig 3; physiology/rpd 3; physiology/sf 3; diversity/dom 3; diversity/plt 3; diversity/anm 3; diversity/vrt 3; diversity/phy 3; diversity/bgt 3; devo/fer 3; devo/gas 3; devo/organogenesis 3; devo/stm 3; devo/dif 3; evolution/nse 3; evolution/spc 3; evolution/eco 3; evolution/com 3; evolution/beh 3.
- Choices: 4.
- Explanations (none / line / short / detailed): 69 / 0 / 99 / 9; median 109 words; 108 run 60+ words; explicit per-choice notes on 0. 1 explanations cite answer letters.
- Typical explanation (short, bio-cell:rep:1): "Helicase unzips the double helix, which over-twists the DNA ahead of the fork. Topoisomerase cuts one or both strands, rotates around, and rejoins them - relieving the supercoiling so the fork can keep moving. Quinolone antibiotics target bacterial topoisomerase. Helicase unwinding (~3,000 base pairs per minute in E. coli) creates positive supercoils ahead of the fork - imagine twisting one end of a phone cord. Witho..."
- Visuals: 177 (node visualizer above the card (bio-shared.js) 177).
- 177 cards (cell 57, physiology 42, genetics 30, diversity 18, devo 15, evolution 15); 108 have authored feedback (median 109 words across `wr` + `ex`), 69 fall back to "The correct answer is: X. Repair details are still being authored for this prompt."
- A "Guess / Locked in" confidence picker appears before feedback (house rule: no confidence gating before feedback). The node visualizer sits above each card; the card has no figure of its own.

### Bio Weakness Scan (the Pulse Check has the same shape; its row is in table 1)

- File: `tools/bio/bio-mock.html (const BANK, line 116)` (const BANK). Rendered by: tools/bio/bio-mock.html.
- Format: `const BANK` / `const QUESTIONS` = `[{hub, node, q, opts[4], correct, why}]` inline in `bio-mock.html` (45) and `bio-diagnostic.html` (25).
- One item, as stored:

```json
{"hub":"Cell","node":"org","q":"Which structure does NOT have a double membrane?","opts":["mitochondrion","chloroplast","nucleus","peroxisome"],"correct":3,"why":"Peroxisomes have a single membrane. The other three have two."}
```

- Items 45; sections BIO 45; 30 subtopics: Genetics/mut 3; Physiology/end 3; Cell/lip 2; Cell/org 2; Cell/krb 2; Genetics/men 2; Genetics/lco 2; Genetics/ped 2; Genetics/hwb 2; Diversity/dom 2; Diversity/anm 2; Devo/gas 2; Evolution/nse 2; Cell/mit 1; Cell/grg 1; Cell/pro 1; Cell/trc 1; Cell/mtr 1; Cell/gly 1; Cell/tln 1; Cell/sig 1; Genetics/prb 1; Physiology/rsp 1; Physiology/ap 1; Physiology/nph 1; Physiology/imn 1; Physiology/cdv 1; Physiology/rpd 1; Physiology/sf 1; Evolution/spc 1.
- Choices: 4.
- Explanations (none / line / short / detailed): 0 / 39 / 6 / 0; median 14 words; 1 run 60+ words; explicit per-choice notes on 0.
- Typical explanation (line, scan-1): "Peroxisomes have a single membrane. The other three have two."
- Visuals: 0.
- Mostly one-line explanations, 4 choices, no visuals. The Weakness Scan collects a confidence rating per answer (`MK_STATE.confidence`). Overlap with the pool: 2 stems.

### OChem v2 course engine bank

- File: `tools/ochem/v2/index.html (const BANK, line 365)` (const BANK (map)). Rendered by: tools/ochem/v2/index.html (linked from ace-labs.html as "Classic course engine").
- Format: `const BANK = {id: {skill, diff, q, opts[4], correct, why, diag}}` inline; linked from ace-labs.html as "Classic course engine".
- One item, as stored:

```json
{"st1":{"skill":"stereo","diff":1,"q":"A carbon must have how many different groups to be a stereocenter (chirality center)?","opts":["Two","Three","Four different groups","Any four groups"],"correct":2,"why":"A tetrahedral carbon is a stereocenter when all four attached groups are different...","diag":{"0":"Two different groups cannot give a non-superimposable mirror image.","1":"Three different groups (plus one repeat) is not a stereocenter.","3":"Four groups is necessary but they must be DIFFERENT from one another."}}}
```

- Items 80; sections OCHEM 80; 9 subtopics: stereo 13; aromatic 10; subelim 9; acidbase 8; spec 8; labtech 8; rcd 8; alkene 8; carbonyl 8.
- Choices: 4.
- Explanations (none / line / short / detailed): 0 / 65 / 0 / 15; median 18 words; 0 run 60+ words; explicit per-choice notes on 80 (all distractors).
- Typical explanation (line, st2): "CIP ranks by atomic number at the first point of difference. Br (35) > O (8) > N (7) > C (6). Bromine wins."
- Visuals: 0.

### Gen Chem Recognition Lab

- File: `tools/gc/recognition-stimuli.json` (JSON array (fetched)). Rendered by: tools/gc/recognition-lab.html (per-item timeLimitMs countdown).
- Format: `[{id, topic, stimulus (SVG), question, options[4], correct, why, diag, timeLimitMs}]` fetched by `recognition-lab.html`.
- One item, as stored:

```json
{"id":"rxc-1","topic":"Reaction Coordinate","stimulus":"<svg>...</svg>","question":"Reaction coordinate shown. Classify the reaction.","options":["Endothermic, no catalyst","Endothermic, with catalyst","Exothermic, with catalyst (low Ea)","Exothermic, no catalyst (high Ea)"],"correct":2,"why":"Products sit below reactants on the y-axis (exothermic), and the activation hump is shallow...","diag":{"0":"Products are below reactants here, not above...","1":"..."}}
```

- Items 62; sections GC 62; 15 subtopics: VSEPR 10; Reaction Coordinate 5; Dominant IMF 5; Lewis Validity 4; Periodic Trends 4; Hybridization 4; Phase Diagram 4; Titration Curve 4; Nuclear Decay 4; Kinetics Order 3; Linearized Kinetics 3; Q vs K 3; Buffer Region 3; Galvanic Cell 3; Heating Curve 3.
- Choices: 4.
- Explanations (none / line / short / detailed): 0 / 57 / 0 / 5; median 20 words; 0 run 60+ words; explicit per-choice notes on 62 (all distractors).
- Typical explanation (line, rxc-1): "Products sit below reactants on the y-axis (exothermic), and the activation hump is shallow, indicating a catalyst lowered Ea."
- Visuals: 62 (svg stimulus 62).
- Every item is a picture-first question, the model for "a visual on every question". Each has a per-item time limit (default 8 s), which conflicts with untimed practice.

### Smaller sets

- **QR Pattern Library probes** (`PAT_CHUNKS`, 31 chunks x recognize + generalize = 62): `{"q":"0.625 × 8 = ?","opts":["3","4","5","6"],"correct":2,"why":"0.625 = 5/8, so 0.625 × 8 = 40/8 = 5..."}`. Speed facts; 41 shorthand stems.
- **QR Productive Failure** (8): `{title, prompt, options:[{label, correct, trap, rationale}], youDid, canonical}`; every option has a rationale, the only QR set that is fully "detailed".
- **QR Friday Mini-Mock** (22, 4 choices, one-line `why`, 22-minute countdown) and **Pacing simulator** (17, 5 choices, `tip`): live pages under `tools/qr/proposals/agent-08-pacing/`, linked from the home page, tests hub and the QR engine. 3 Friday items repeat QR formats stems.
- **OChem predict-the-step** (`PREDICT_DATA`, 8 mechanisms, 22 steps, 3 to 4 choices with a `hint` per choice) and **name-the-reaction** (`ITEMS`, 8).
- **Bio**: A&P review quiz (60, one per body system x 6, `explain`), stick-layer predict/check pairs (15 x 2, 3 choices, `traps` per choice, each next to a stick-figure animation or still), pedigree puzzles (10, choose among 6 inheritance modes, drawn pedigree), conditioning quiz (8, no explanation).
- **GC**: diagnostic (33), elimination widget (3), Periodic Trends pairs (41 two-choice "which is larger", one-line `reason`, shown on the periodic table).
- **Trick videos** (`tricks/videos/js/*.js` `const qs`, 13 videos, 27 checks, 3 choices, one-line `why`).
- **QR pattern comparators** (`proposals/agent-03-patterns/_build.js`, 13 pages x 3): only `pemdas.html` (3) is embedded in the QR engine; the other 36 are unlinked prototypes.
- **CASPer arcade** (5): situational judgment, not DAT; listed only so the census is complete.

## 8. Duplicates and overlaps

Lineage (by id and by normalized stem):

```
QR engine BANK (1,020) --verbatim, id "QR_"+id--> pool.qr (1,017) --exact copy--> games/qr.json (1,017)
GC engine BANK (627) ----DAT-style rewrite, 495 ids--> pool.gc (517) --exact copy--> games/gchem.json (517)
OChem engine bank (1,230) --rewrite, 350 ids------> pool.ochem (388)
Bio source outside repo ---------------------------> pool.bio (508) --exact copy--> games/bio.json (508)
expert / long-form / arrow scripts (*_xp, *_lf, OC_arr) --> pool
pool (2,430) --compose-tests.js, debiased--> shared/dat-mock-tests.js (420, all pool ids, 3 disjoint forms)
pool <-> dat-mock-bank.backup.json: 2,141 of 2,171 stems shared (backup is the pre-debias copy, 1 more QR item)
external prep-app pool (built from pool, QR engine, GC engine, 1000-series, Ace bank + new items)
     --compose-full-mocks.mjs, reworded, re-keyed--> tools/mock/data/full-mocks.js (560)
scripts/ochem2026/src --> ochem-2026-pool.json = tools/ochem/bank/ochem-2026-pool.js = tools/ochem/tree/shared/set-2026.js (203 each)
scripts/qr-formats/src --> shared/qr-formats-bank.js = shared/qr-formats-bank.json (220 each)
tools/rc/data/passages/*.json --> tools/rc/data/bank.js (750)
tools/minitests/source/minitest-source.json --assemble, re-lettered--> tools/minitests/bank.js (400)
```

Exact normalized-stem matches between banks (stems of 12+ characters; each pair once; copies of copies left out):

| Bank A | Bank B | Shared stems | Share of A | Share of B |
|---|---|---|---|---|
| qrEngine | pool | 742 | 98% | 34% |
| pool | prometric | 404 | 19% | 100% |
| ochem1000 | full | 111 | 9% | 20% |
| qrEngine | prometric | 91 | 12% | 20% |
| pool | full | 71 | 3% | 13% |
| full | gcEngine | 26 | 5% | 4% |
| full | qrEngine | 8 | 1% | 1% |
| climb | ochem1000 | 7 | 2% | 0% |
| gcEngine | gcDiag | 7 | 1% | 21% |
| pool | bioRetrieval | 6 | 0% | 3% |
| pool | qrDiag | 3 | 0% | 15% |
| ace | full | 3 | 30% | 1% |
| qrFormats | qrFriday | 3 | 1% | 16% |
| qrEngine | qrDiag | 3 | 0% | 15% |
| pool | bioScan | 2 | 0% | 4% |
| ochemEngine | ochemV2 | 2 | 0% | 1% |

The three Game Central banks match their pool sections 100% (bio 507 of 507 stems, gchem 517 of 517, qr 758 of 758 long stems) and are left out above.

Notes: QR stems are often under 12 characters ("1/4 + 1/2 = ?"), so by stem at any length the QR engine and pool.qr share 1,001 of 1,020 stems, and by id 1,009. The Climb, the RC bank, the QR formats pool, the OChem 2026 set, every Retold course and the Bio retrieval cards are essentially unique (under 3% overlap with anything). The full mocks share no stem with The Climb or the Prometric forms, as their composer requires.

Within-bank repeats: exact stem-and-choice repeats in the OChem engine bank (206) and the QR engine bank (90, carried into pool.qr and games/qr.json). The OChem 2026 set (21) and RC (58 stems) also repeat wording, but those are figure-driven or generic stems ("The main idea of the passage is") on different figures or passages, so they are not true duplicates.

## 9. Things for Thomas to look at (reported, not changed)

1. **Full-length mock OChem explanations cite stale letters.** 32 explanations in `tools/mock/data/full-mocks.js` cite option letters (31 OChem, 1 Bio). The composer re-orders choices to spread keys, but these letters still point at the source order. Confirmed example: FULL_1 OChem Q8 (`organic:oc-dbrfsk`): the served key is D, `CCC(Br)c1ccccc1`, which is correct, but the explanation calls it "(1-bromopropyl)benzene (option A)". FULL_1 OChem Q21 says "keyed option A" for a key served at D. In 12 items the served key letter is never cited or the "keyed option" letter disagrees: F1 ochem Q8, F1 ochem Q11, F1 ochem Q13, F1 ochem Q21, F2 ochem Q7, F2 ochem Q10, F3 ochem Q5, F3 ochem Q8, F3 ochem Q30, F4 ochem Q1, F4 ochem Q23, F4 ochem Q30. The other 19 cite all or most letters and need a read by hand. The keys look right; the explanation text needs re-lettering or de-lettering. The composer checks letter references only in the choices, not in `why`.
2. **Prometric QR has no explanations**: 106 of the 120 QR items across the three forms show no explanation on review, and 47 use flashcard stems ("5/8 = ?").
3. **Count claims that drifted from the banks** (`shared/scope.js`): GC "605" (bank has 627); OChem "388 engine bank" (388 is the pool's OChem section; the engine bank has 1,230 and the 1000-series bank 1,194); QR "925 distinct" (914 distinct stems in 1,020); diagnostic "53 questions, 8 QR" (it now serves 60, 15 QR, because the pool has 21 QR items with explanations). Bio "158" equals the pool Bio items that have an explanation.
4. **Answer-choice count**: the repo's DAT-spec notes say QR items have 5 choices, but the QR engine is mostly 4-choice (932 of 1,020), the QC format uses 4 fixed choices, and every Retold, Bio quiz, Bio retrieval, GC engine and OChem engine item uses 4. The Prometric forms, The Climb, the full mocks, RC, the 2026 OChem set and the 1000-series bank use 5. Worth deciding the target per section before rebuilding.
5. **Renderers that conflict with the anxiety-aware rules** for practice: `games/play.html` (60 s per question countdown, score, streak) serves 3,236 items; `tools/minitests/index.html` shows a STREAK counter; `tools/gc/recognition-lab.html` times every stimulus (default 8 s); the Friday Mini-Mock and pacing simulator run countdowns outside a full mock; Bio retrieval cards ask for confidence before showing feedback and the Bio Weakness Scan collects a confidence rating per answer; `diagnostic.html` shows prior results as percentages.
6. **Wording that breaks house rules inside items** (feedback text containing "wrong", "incorrect" or "failed"): OChem 1000-series 323, RC 246, QR engine 122, GC engine 122, Climb 73, full mocks 61, Retold 74 across courses. Em or en dashes appear in 59 Prometric items, 173 pool items and 140 GC engine items. Non-ASCII glyphs (subscripts, arrows, the multiplication sign) are common in the GC, QR and OChem engine banks. Full per-bank counts are in `census-data.json`.
7. **Bio retrieval placeholders**: 69 of 177 hub retrieval cards have no authored feedback yet.

## 10. What I could not reach

- `www.ada.org` (the DAT Candidate Guide PDF) and `en.wikipedia.org` do not resolve from this sandbox, so the real-exam reference points above come from the repo's own notes (`shared/scope.js`, `tools/mock/full.js` section table: Natural Sciences 100 Q / 90 min, PAT 90 / 60, RC 50 / 60, QR 40 / 45; `tools/qr/research/agent-w1-dat-specs/REPORT.md`). Search result consulted: [ADA DAT examinee guide (PDF, not fetched)](https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_examinee_guide.pdf).
- The external prep-app pool the full-mock composer reads (`~/code/acethedat-prep/site/data/bank`) and the Bio source behind `pool.bio` are not in this repo, so 166 full-mock items and the 508 pool Bio items cannot be traced further.

## Reproduce

`census-scripts/` holds the analysis: `lit.js` (literal slicer), `load.js` (vm loaders), `scan.js` (repo-wide finder of question-shaped arrays), `census.js` (normalizers and stats), `overlap.js`, `ochem-gen.mjs` (Tree and Roots sampling), `pat.js` / `pat2.js` (PAT engine), `gen-md.js` (this file). Run `node census.js census-data.json && node overlap.js && node gen-md.js` from that folder (the small JSON inputs gen-md.js reads are included). Note that gen-md.js writes its output to the scratchpad path it was built for.

**Totals: 14,853 stored question records in 45 sets; 12,381 served; about 8,536 distinct presented items (about 7,300 distinct underlying problems); explanation levels across served records none 2,786 / one line 3,607 / short 3,938 / detailed 2,046; 3,336 with a visual; plus generated PAT (1,350 fixed + 360 full-mock + unlimited drills) and OChem Tree items (25 generators).**
