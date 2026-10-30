# Production plan: DAT-real questions, an explainer and a visual for every question

Draft for Thomas, 2026-10-30. Builds on dat-interface.md (the real DAT screen),
census.md (every bank), explainer-standard.md version 2 (the record and visual
rules) and the 18-question pilot (pilot.json, preview/), which three subject
experts re-solved and reviewed. Nothing in the acelabs repo was changed; every
number below was computed from the banks loaded read-only in a node vm
(production-scripts/plan-batches.js writes batches.json).

## 0. The short version

| | Count |
|---|---|
| Question records served to students today | 12,438 in 42 sets (backup pool, prototype drills and CASPer left out) |
| Exact copies, which only need an alias check | 3,836 |
| Items to write from scratch | 6,957 |
| Rewrites that start from an earlier explainer ("adapt") | 1,082 |
| Items that already have per-choice notes and a picture, needing house-rule migration only (Retold courses, video checks, QR pacing pages) | 563 |
| PAT: generated, so explained by 6 templates (one per subtest), checked by sample on every test seed | 1,710 fixed-seed items today, plus unlimited Studio items |
| Production batches | 368: 318 write batches (about 25 items each), 26 migration batches, 24 PAT template batches |
| Order | Full-Length Test 1 (the free practice test) first, then the diagnostics, then the other full tests, the practice tests, The Climb, RC, the format sets, the section engines, the rest |
| Renderers | 53 visual types: 23 exist after the pilot or reuse repo code, 5 port or extend repo code, 25 are new and small (section 4) |
| Picture defects found while planning | 50 stereocenters drawn as their mirror image (45 molecules, on 6 full-mock OChem items and 22 OChem 1000 items); section 7 and picture-disputes.json |

---

## 1. One DAT-style question player

### 1.1 What it is

One shared component, `shared/dat-player/` (ES modules plus one CSS file),
that every question surface in Ace Labs mounts. It is built from
`tools/mock/full.js` (the interface study's recommendation: it already runs all
four sections in order with the right counts, clocks, PAT option counts, the RC
split, Arial, working Alt keys, grouped review and pause-safe resume), with the
highlighter and cross-out moved in from `tools/rc/rc.js`, and the explainer
loader and visual renderers from the pilot.

```
mountDatPlayer(host, {
  mode: 'practice' | 'set' | 'test',
  sections: [{ kind: 'sns' | 'pat' | 'rc' | 'qr', items: [...served items...], minutes }],
  timer: 'off' | 'optional' | 'on',          // practice: off; set: optional (Test phase only); test: on
  onAnswer, onFinish                          // the Ace Log and the scheduler listen here; no scores leave the player
})
```

Every bank gets a small adapter that turns its items into the served-item shape
the pilot build already uses (`{qid, stem, choices[], key, figure?, smiles?,
passage?, patItem?}`); the census loaders and build-pilot.js `resolve()` are the
starting point.

### 1.2 Three modes

| Mode | Used for | Clock | After each answer | At the end |
|---|---|---|---|---|
| Practice | Lesson checks, warm-ups, drills, diagnostics, engine modules, The Climb in Build phase | None. Upper right reads "Untimed practice" | Check button, then the explainer and its visual under the question (phone) or beside it (1100 px and wider) | A plain list of the items: Confirmed / Needs review, no score, no percent |
| Set | Section sets in the last 3 weeks (decisions doc: optional timer, off by default) | Off unless the student turns it on; then "Time remaining" | Nothing until the set ends | Review screen, then each item with its explainer |
| Test | Full-Length Tests 1 to 4, Practice Tests 1 to 3 | Real clocks: 90 / 60 / 30 break / 60 / 45 | Nothing (as on the real test) | Review screen during the test; after it ends, the review with every explainer |

No streaks, points, percentages, confidence ratings before feedback, or score
headlines in any mode. A test report shows raw counts in neutral color
("31 of 40") per section, never graded colors.

### 1.3 Screen, every section

From the interface study (dat-interface.md, sections 2 to 4). Items marked
[verify] are the open questions for the tutorial walk in dat-interface.md
section 7; the player ships with the choice shown and changes in one place if
the walk says otherwise.

- Top bar: "Question 12 of 100" upper left; "Time remaining 1:02:13" upper
  right in Set and Test modes, "Untimed practice" in Practice. Center: the
  section name [verify]; no brand block, no X, no gear, no subject chips, no
  topic or difficulty line.
- Bottom bar, left to right: Previous, Next, Mark, Review, then Exhibit
  (sciences) or Calculator (QR), and End Section on the Review screen only
  [verify]. Next on the last item opens the Review screen; the label stays
  "Next".
- Answer choices: letters A to E with round radio buttons, one best answer;
  click the row or the button. Right-click (or a Cross out button on touch)
  strikes a choice through without changing the answer.
- Highlighter: select text, press Highlight; tap a highlight to remove it.
  RC passages first, stems too [verify which sections allow it].
- Mark: its own state color, not shared with open tools.
- Review screen: every question number with its status (Answered, Marked,
  Incomplete) and three buttons, Review All, Review Marked, Review Incomplete;
  in a review mode Next and Previous step only through that subset. End Section
  asks for confirmation and names the open count ("You have 3 open questions. A
  guess can only help.").
- Alt shortcuts (Alt+N, P, M, R, X, C) as in full.js; harmless if the real test
  lacks them.
- An optional, untimed Tutorial before section 1 (two sample items that let
  the student try every button and tool), with Skip.
- Explainer (Practice, and the post-test review): the standard's order. Status,
  answer, picture, steps, traps, Lock it in, memory cue, Play with it, Watch,
  Report. Phone: the pick in full, other traps one line each behind "Show every
  note in full". Desktop at 1100 px and up: question left, explainer right.

### 1.4 Layout per section

| Section | Real test | Player layout |
|---|---|---|
| Survey of the Natural Sciences | 100 items, 90 minutes, one clock; Bio 1-40, GC 41-70, OC 71-100; Exhibit gives the periodic table; no calculator | One 100-item block, no subject headings or chips. Exhibit opens one periodic table transcribed cell by cell from the ADA 2026 Candidate Guide (fixes "Rt" for 104 and Fr 215.00), available on all 100 items. No reagent sheet. Structures drawn by the shared drawer and checked by the stereo gate (section 7) |
| Perceptual Ability | 90 items, 60 minutes, six subtests of 15 in fixed order (keyholes, top-front-end, angle ranking, hole punching, cube counting, pattern folding); 5, 4, 4, 5, 5, 4 choices | Figure above, option grid below (wide options for hole punching); no tools; Previous crosses subtest boundaries; one cube figure serves its run of items. Directions screen per subtest [verify whether timed]. PAT practice in Studio pages runs untimed in this player's Practice mode |
| Break | Optional 30 minutes after PAT; resumes on its own | Break screen with "Time remaining"; at 0 the RC section starts directly (no waiting intro) |
| Reading Comprehension | 3 passages, 50 items, 60 minutes; passage and question on screen together; passage scrolls; highlighting | Desktop: passage left (about 54 percent, scrolls on its own, title and numbered paragraphs [verify]), question right. Phone: Passage and Question tabs. Highlighter and cross-out from rc.js. In Practice the explainer opens under the question and its evidence picture highlights the proof lines; the passage stays in place |
| Quantitative Reasoning | 40 items, 45 minutes, basic pop-up calculator, mouse only | Calculator button in the bottom bar; one calculator window copied from prometric-mock.html's layout (memory, sqrt, %, 1/x, mouse only), draggable, opening where it does not cover the choices. Charts drawn by shared/qr-figures.js |

### 1.5 Pages that switch to the player

| Page | Today | Mode after the switch | Notes |
|---|---|---|---|
| tools/mock/full.html (Full-Length Tests 1 to 4) | The best match to the real test | Test, review with explainers | Base of the player; gains highlighter, cross-out, review modes, tutorial, one table, one calculator |
| prometric-mock.html (Practice Tests 1 to 3) | SNS + QR only; topic and difficulty on every item; OChem reagent sheet; pulsing timer; 37 em dashes; "failed" message | Test (SNS and QR sections) | Runtime retired; its three forms load into the player. Keep its calculator layout |
| diagnostic.html | Draws 15 random pool items per section | Practice | Frozen to one 60-item form (batch group G2) so every item is explained |
| tools/minitests/index.html (The Climb) | STREAK counter | Practice (Set in the Test phase) | Streak removed |
| tools/bio/bio-mock.html, tools/bio/bio-diagnostic.html | Own quiz screens; Weakness Scan collects a confidence rating | Practice | Confidence rating moves after feedback or goes |
| Bio hub retrieval cards (six bio-*.html hubs) | "Guess / Locked in" confidence picker before feedback | Practice, inline mount | Picker removed (house rule) |
| tools/qr/index.html (module practice, 22-item diagnostic, Pattern Library probes, timed simulator) and tools/qr/qr-formats-module.js | Own screens | Practice; the simulator becomes a Set | One player for all QR item screens |
| tools/qr/proposals/agent-08-pacing/friday-mini-mock.html, pacing-sim.html | 22-minute countdown; timed pacing drill, linked from the hubs | Set with the optional timer (Test phase only) | Move out of proposals/ |
| tools/gc/index.html (drills, adaptive diagnostic, mock sim), tools/gc/recognition-lab.html | Diagnostic asks for confidence first; Recognition Lab counts down 8 s per item | Practice; mock sim becomes a Set | Countdown removed or turned into an opt-in Test-phase drill |
| tools/ochem/index.html (exam sim, hub drills), tools/ochem/v2/, tools/ochem/tree/ and summit/ item screens | Own screens | Practice; Summit sections and the exam sim become Sets | Tree keeps its lesson flow; its question screens mount the player |
| tools/rc/index.html (RC player) | Elapsed clock, pace bar, 10 and 12 minute cues, "N of M correct" headline even for one passage | Practice for single passages, Set for timed sections | Its highlighter and cross-out become the player's |
| tools/pat/test.html (15 PAT tests) and the six Studio pages | Tests are timed; Studio pages show a timer pill (holepunch starts it on load) | Test for the 15 tests; Practice for Studios | Timer pills removed from Studios |
| games/play.html (Game Central) | 60 s per question timer, score, streak | Practice ("play" sets); or keep as an opt-in game outside the study system | Needs Thomas's call: as built it breaks three house rules |
| tools/*-retold/ (six narrated courses), tricks/videos/*.html | Scene checks inside lessons | Unchanged screens; their checks get sidecars through migration (G10) | These are lessons, not DAT screens |

---

## 2. Sidecars and files

The record shapes are in explainer-standard.md section 2; the layout in its
section 5.2. In the repo:

```
content/explainers-src/<group>/<batch>.js        authoring source per batch (like pilot-src.js)
scripts/explainers/build.mjs                     port of build-pilot.js: gates, recomputation, outputs
scripts/explainers/families.js                   the closed trap-family list
scripts/explainers/rdkit-check.py                SMILES, CIP and stereo relations (needs python3 + RDKit)
content/explainers/<section>/<sub>/<qid>.json    student sidecars (published)
content/explainers/index-<section>.json          qid and active aliases -> file, status, checksum
content/videos/index.json                        slot -> {id, title, duration, questions}
docs/explainers/coach/<qid>.json                 coach records (never published: /docs/* is force-redirected)
docs/explainers/key-disputes.json, picture-disputes.json, gap-list.json
shared/dat-player/                               the player
shared/visuals/                                  the renderers (core.js + bio, chem, qr, pat, rc modules)
```

- One sidecar per question; a batch is one source file, so a pull request is one
  batch.
- The guard (key text, stem hash, choice texts) ties each sidecar to the bank as
  it is. A bank edit makes the record stale and the player falls back to the
  bank's own explanation until the record is re-approved.
- Bank, keys and existing explanations are never edited by this system. Stem
  rewordings, letter-citing explanations and reviewer notes shown to students
  go to Thomas as flags.
- Shared pieces the pilot proved are needed in the repo: a `highlight` option in
  shared/qr-figures.js; the bond `wedge` field in tools/ochem/tree/draw.js
  drawSmilesGeom; ids for The Climb (tools/minitests/source/minitest-source.json)
  and the OChem 1000 bank; a no-clock teach mode in the PAT Studios; a calm mode
  in the RC player; PCl3 and a URL parameter in the Lewis sandbox; state readers
  (`#node-x?state=`) on the Bio hubs and URL routes into the QR, GC and OChem
  engines, so Play with it opens the exact state.

---

## 3. Production batches

### 3.1 How the order was set

1. Full-Length Test 1 first. It is the one full practice test in the free
   public tier (decisions doc), so its explainers are what most students see
   first. Its PAT section is the first use of the six PAT templates.
2. Diagnostics next: every new student starts with one. diagnostic.html is
   frozen to one 60-item form (15 per science section and QR, from Practice Test
   3) so every item is explained; the QR, GC and two Bio diagnostics follow.
3. Full-Length Tests 2 to 4, then Practice Tests 1 to 3: the timed tests coached
   students take in the Test phase.
4. The Climb, then the RC bank, then the DAT-format sets (QR formats, the 2026
   OChem set, the Ace bank).
5. The section engines behind lesson checks and warm-ups (QR, GC, OChem 1000),
   then the rest (pool Bio, the OChem engine bank, game copies, lesson cards,
   small sets), then migration of the Retold checks.

Usage data does not exist yet per item, so within groups 8 and 9 the order is by
bank role. Once the player logs which qids fall back to the bank's own
explanation (the gap list), batches in groups 8 to 10 are reordered by real
use and by Ace Log misses.

Each item is classed once, in this order: copy (same stem and choice set as an
item already planned; no writing, it becomes an alias after the alias checks),
adapt (shares a lineage id with an earlier item, such as the pool's DAT-style
rewrite of a GC engine item; the writer starts from that explainer), or new.
Batches hold about 25 items of one bank and section, cut at subtopic (RC:
passage) boundaries; sign-off is two sittings of about 12 (section 5).

Template candidates: 1,116 stored items sit in families whose stems differ only
in numbers (QR engine: 46 families, 680 items, for example the 13 Bayes items
pco1543 to pco1555; OChem engine bank: 45 families, 270 items, for example
"major product of (alkene) with HBr"; pool: 44). Writing one explainer template
per family with the numbers computed and recomputed by the build is faster and
safer than 1,116 hand-written explainers. batches.json lists the families.

The 18 pilot items count as done once Thomas approves them: 7 sit in G1 (and the
3 PAT entries are the template models for G1's PAT batches), 5 in G3, 1 in G4,
1 in G5 and 1 in G7.

### 3.2 Groups and batches

Group totals (write and adapt items, batches):

| Group | Items to write / adapt / migrate | Write batches | Template batches | Copies (alias only) |
|---|---|---|---|---|
| G1 Full-Length Test 1 | 190 | 8 | 6 | 0 |
| G2 Diagnostics | 191 | 9 | 0 | 0 |
| G3 Full-Length Tests 2 to 4 | 570 | 24 | 18 | 0 |
| G4 Practice Tests 1 to 3 | 360 | 16 | 0 | 60 |
| G5 The Climb | 400 | 16 | 0 | 0 |
| G6 RC bank (outside the full tests) | 550 | 22 | 0 | 0 |
| G7 DAT-format sets | 410 | 17 | 0 | 23 |
| G8 Section engines (QR, GC, OChem 1000) | 2,653 | 100 | 0 | 188 |
| G9 Pool, games, OChem engine, lesson checks | 2,715 | 106 | 0 | 3,562 |
| G10 Retold, video checks, QR pacing pages | 563 (migration) | 26 | 0 | 3 |
| Total | 8,602 | 344 | 24 | 3,836 |

Batch by batch for G1 to G4, and by bank for G5 to G10 (full list with every
qid: batches.json). "Visual types needed" counts items per visual type
(section 4).

### G1. Full-Length Test 1 (free public tier) (B001 to B014)

The one full practice test every visitor can take; the first explainers most students will ever see.

Served records 190: 190 new, 0 adapt (a rewrite of an item explained earlier), 0 copies (alias only); 6 PAT template batches. By bank: full 140, rc 50.

| Batch | Bank, section | Items (new / adapt) | Subtopics | Visual types needed |
|---|---|---|---|---|
| B001 | full, BIO | 16 (16 / 0) | Beyond Mendel and molecular tools; Body systems at work; Cellular respiration; Control systems: nerves and hormones | bio.diagram:cell 5, bio.diagram:organelle-pathway 5, bio.punnett 3, bio.diagram:nerve-endocrine 3 |
| B002 | full, BIO | 24 (24 / 0); 1 done in the pilot | Diversity of life; Ecology and behavior; Evolution; Meiosis; Photosynthesis; +3 more | bio.diagram:membrane 6, bio.diagram:chromosomes 5, bio.diagram:organelle-pathway 5, bio.tree 4, bio.chart 2, bio.diagram:embryo 2 |
| B003 | full, GC | 30 (30 / 0) | Balance and the push-back; Downhill: entropy and free energy; Gases; How fast, not how far; Proton traffic; +8 more | chem.ledger 8, chem.gas 4, chem.curve:ph 4, chem.ledger:ice 3, chem.energy 3, chem.lewis 3, chem.curve:rate 2, chem.cell 2, chem.orbital 1 |
| B004 | full, OCHEM | 30 (30 / 0); 2 done in the pilot | Different arrows: radicals and Diels-Alder; Molecules in 3D; Pay twice, plus the acidic H: alkynes; Reading the machines: spectroscopy, lab and synthesis; The alpha carbon wakes up; +7 more | chem.reaction 14, chem.mechanism 7, chem.molecule 5, chem.spectrum 3, chem.molecule:stereo 1 |
| B005 | full, QR | 19 (19 / 0) | Algebra: one and two unknowns; Fractions, decimals and number sense; Geometry: area, perimeter, volume; Percentages and percent change; Powers, roots and quadratics | qr.partwhole 10, qr.work 8, qr.geometry 1 |
| B006 | full, QR | 21 (21 / 0); 1 done in the pilot | Probability and counting; Ratios and proportions; Statistics and reading data; The setup mindset; Triangles and the coordinate plane; +3 more | qr.tree 9, qr.partwhole 3, qr.dataset 3, qr.work 2, qr.plane 2, qr.geometry 2 |
| B007 | rc, RC | 28 (28 / 0); 3 done in the pilot | rc-o15; rc-p10 | rc.evidence 28 |
| B008 | rc, RC | 22 (22 / 0) | rc-p10; rc-p19 | rc.evidence 22 |
| B009 | pat-engine, PAT (FULL_1) | 15 generated per test | keyholes | pat.keyholes (write the template from the engine data, then sign off a sample of 12 generated items) |
| B010 | pat-engine, PAT (FULL_1) | 15 generated per test | tfe | pat.tfe (write the template from the engine data, then sign off a sample of 12 generated items) |
| B011 | pat-engine, PAT (FULL_1) | 15 generated per test | angles | pat.angles (write the template from the engine data, then sign off a sample of 12 generated items) |
| B012 | pat-engine, PAT (FULL_1) | 15 generated per test | holepunch | pat.holepunch (write the template from the engine data, then sign off a sample of 12 generated items) |
| B013 | pat-engine, PAT (FULL_1) | 15 generated per test | cubes | pat.cubes (write the template from the engine data, then sign off a sample of 12 generated items) |
| B014 | pat-engine, PAT (FULL_1) | 15 generated per test | patternfold | pat.patternfold (write the template from the engine data, then sign off a sample of 12 generated items) |

### G2. Diagnostics (B015 to B023)

Every new student starts here (free tier). diagnostic.html is frozen to one 60-item form drawn from Practice Test 3, plus the four engine diagnostics.

Served records 191: 191 new, 0 adapt (a rewrite of an item explained earlier), 0 copies (alias only). By bank: prometric 60, qrDiag 28, gcDiag 33, bioPulse 25, bioScan 45.

| Batch | Bank, section | Items (new / adapt) | Subtopics | Visual types needed |
|---|---|---|---|---|
| B015 | bioPulse, BIO | 25 (25 / 0) | Cell & Molecular/enz; Cell & Molecular/krb; Cell & Molecular/mit; Cell & Molecular/mtr; Cell & Molecular/org; +16 more | bio.diagram:cell 5, bio.tree 5, bio.diagram:embryo 2, bio.chart 1, bio.diagram:organelle-pathway 1, bio.diagram:chromosomes 1, bio.diagram:membrane 1, chem.molecule 1, bio.diagram:dna 1, bio.hardy-weinberg 1, bio.pedigree 1, bio.punnett 1, bio.diagram:heart 1, bio.diagram:nerve-endocrine 1, bio.diagram:nephron 1, bio.diagram:lung 1 |
| B016 | bioScan, BIO | 20 (20 / 0) | Cell/gly; Cell/grg; Cell/krb; Cell/lip; Cell/mit; +9 more | bio.tree 4, bio.diagram:organelle-pathway 3, bio.diagram:dna 3, chem.molecule 3, bio.diagram:cell 2, bio.diagram:embryo 2, bio.diagram:chromosomes 1, bio.diagram:membrane 1, bio.diagram:nerve-endocrine 1 |
| B017 | bioScan, BIO | 25 (25 / 0) | Evolution/nse; Evolution/spc; Genetics/hwb; Genetics/lco; Genetics/men; +11 more | bio.diagram:cell 6, bio.tree 3, bio.punnett 3, bio.diagram:nerve-endocrine 3, bio.hardy-weinberg 2, bio.pedigree 2, bio.diagram:heart 1, bio.diagram:immune 1, bio.diagram:nephron 1, bio.diagram:embryo 1, bio.diagram:lung 1, bio.real 1 |
| B018 | gcDiag, GC | 33 (33 / 0) | arrhenius; atomic; bonding; buffers; calorimetry; +28 more | chem.lewis 5, chem.ledger 5, chem.curve:ph 4, chem.energy 4, chem.cell 4, chem.ledger:ice 4, chem.curve:rate 2, chem.curve:phase 2, chem.orbital 1, chem.gas 1, chem.trend 1 |
| B019 | prometric, BIO | 15 (15 / 0) | biomolecules; carbs; cell-types; enzymes; eukaryotic-reg; +10 more | bio.diagram:dna 4, chem.molecule 3, bio.diagram:organelle-pathway 3, bio.diagram:cell 2, bio.chart 2, bio.diagram:membrane 1 |
| B020 | prometric, GC | 15 (15 / 0) | atomic; bonding; enthalpy; eq-ice; gas-laws; +10 more | chem.ledger 4, chem.orbital 2, chem.lewis 2, chem.energy 2, chem.ledger:ice 1, chem.gas 1, chem.cell 1, chem.curve:ph 1, chem.curve:phase 1 |
| B021 | prometric, OCHEM | 15 (15 / 0) | ab-ochem; alkene-add; amines; arom-eas; lab; +4 more | chem.molecule 3, chem.reaction 3, chem.mechanism 3, chem.molecule:stereo 3, chem.lab 2, chem.spectrum 1 |
| B022 | prometric, QR | 15 (15 / 0) | coord; count-pc; discr; estim; frac-add; +10 more | qr.work 5, qr.partwhole 4, qr.geometry 2, qr.work:rate-table 2, qr.plane 1, qr.tree 1 |
| B023 | qrDiag, QR | 28 (28 / 0) | coord; count-pc; dec-arith; desc-stats; estim; +21 more | qr.partwhole 9, qr.work 7, qr.tree 4, qr.work:rate-table 3, qr.dataset 2, qr.plane 1, qr.geometry 1, qr.numberline 1 |

### G3. Full-Length Tests 2 to 4 (B024 to B065)

Timed tests coached students take in the Test phase; explainers appear in the review after each test.

Served records 570: 567 new, 3 adapt (a rewrite of an item explained earlier), 0 copies (alias only); 18 PAT template batches (same six PAT templates, new seeds: a 12-item sample per template is re-checked, nothing new to write). By bank: full 420, rc 150.

| Batch | Bank, section | Items (new / adapt) | Subtopics | Visual types needed |
|---|---|---|---|---|
| B024 | full, BIO | 25 (25 / 0) | Beyond Mendel and molecular tools; Body systems at work | bio.diagram:cell 16, bio.punnett 9 |
| B025 | full, BIO | 27 (27 / 0); 1 done in the pilot | Cellular respiration; Control systems: nerves and hormones | bio.diagram:organelle-pathway 17, bio.diagram:nerve-endocrine 10 |
| B026 | full, BIO | 24 (24 / 0) | Diversity of life; Ecology and behavior; Evolution; Meiosis | bio.tree 12, bio.chart 6, bio.diagram:chromosomes 6 |
| B027 | full, BIO | 23 (23 / 0) | Photosynthesis; Replication and mitosis | bio.diagram:organelle-pathway 12, bio.diagram:chromosomes 11 |
| B028 | full, BIO | 21 (21 / 0); 1 done in the pilot | Reproduction and development; The membrane and what crosses it | bio.diagram:membrane 15, bio.diagram:embryo 6 |
| B029 | full, GC | 21 (20 / 1) | Balance and the push-back; Downhill: entropy and free energy; Gases | chem.ledger:ice 9, chem.gas 9, chem.energy 3 |
| B030 | full, GC | 21 (21 / 0); 1 done in the pilot | How fast, not how far; Proton traffic; Shape and the sticky forces | chem.curve:ph 12, chem.curve:rate 6, chem.lewis 3 |
| B031 | full, GC | 21 (20 / 1) | States and solutions; The charge ledger; The energy ledger | chem.ledger 9, chem.cell 6, chem.energy 6 |
| B032 | full, GC | 27 (26 / 1); 1 done in the pilot | The mole bridge; The quantum address, plus nuclear; The two questions: measurement and the lab; Why atoms bond | chem.ledger 18, chem.lewis 6, chem.orbital 3 |
| B033 | full, OCHEM | 24 (24 / 0); 1 done in the pilot | Different arrows: radicals and Diels-Alder; Molecules in 3D; Pay twice, plus the acidic H: alkynes; Reading the machines: spectroscopy, lab and synthesis | chem.spectrum 9, chem.mechanism 6, chem.molecule 6, chem.molecule:stereo 3 |
| B034 | full, OCHEM | 26 (26 / 0) | The alpha carbon wakes up; The center of the universe: alkenes | chem.reaction 26 |
| B035 | full, OCHEM | 19 (19 / 0) | The center of the universe: alkenes; The four questions: substitution and elimination; The hungry carbon: aldehydes and ketones; The only reaction in organic chemistry | chem.mechanism 15, chem.reaction 4 |
| B036 | full, OCHEM | 21 (21 / 0) | The reactivity ladder: acid derivatives; The ring that refuses: aromatics; The switchboard: alcohols, ethers, epoxides | chem.reaction 12, chem.molecule 9 |
| B037 | full, QR | 27 (27 / 0) | Algebra: one and two unknowns; Fractions, decimals and number sense | qr.partwhole 15, qr.work 12 |
| B038 | full, QR | 27 (27 / 0) | Fractions, decimals and number sense; Geometry: area, perimeter, volume; Percentages and percent change; Powers, roots and quadratics | qr.partwhole 16, qr.work 8, qr.geometry 3 |
| B039 | full, QR | 21 (21 / 0) | Powers, roots and quadratics; Probability and counting; Ratios and proportions | qr.partwhole 9, qr.tree 8, qr.work 4 |
| B040 | full, QR | 21 (21 / 0) | Statistics and reading data; The setup mindset; Triangles and the coordinate plane | qr.dataset 9, qr.work 6, qr.plane 6 |
| B041 | full, QR | 24 (24 / 0) | Trigonometry, just enough; Word problems: mixtures, interest, money; Word problems: rates, distance, work | qr.tree 18, qr.geometry 6 |
| B042 | rc, RC | 28 (28 / 0) | rc-o07; rc-o18 | rc.evidence 28 |
| B043 | rc, RC | 23 (23 / 0) | rc-o18; rc-o19 | rc.evidence 23 |
| B044 | rc, RC | 28 (28 / 0) | rc-p01; rc-p05 | rc.evidence 28 |
| B045 | rc, RC | 22 (22 / 0) | rc-p05; rc-p14 | rc.evidence 22 |
| B046 | rc, RC | 28 (28 / 0) | rc-p15; rc-p17 | rc.evidence 28 |
| B047 | rc, RC | 21 (21 / 0) | rc-p17; rc-p18 | rc.evidence 21 |
| B048 | pat-engine, PAT (FULL_2) | 15 generated per test | keyholes | pat.keyholes (template already approved: re-check a 12-item sample) |
| B049 | pat-engine, PAT (FULL_2) | 15 generated per test | tfe | pat.tfe (template already approved: re-check a 12-item sample) |
| B050 | pat-engine, PAT (FULL_2) | 15 generated per test | angles | pat.angles (template already approved: re-check a 12-item sample) |
| B051 | pat-engine, PAT (FULL_2) | 15 generated per test | holepunch | pat.holepunch (template already approved: re-check a 12-item sample) |
| B052 | pat-engine, PAT (FULL_2) | 15 generated per test | cubes | pat.cubes (template already approved: re-check a 12-item sample) |
| B053 | pat-engine, PAT (FULL_2) | 15 generated per test | patternfold | pat.patternfold (template already approved: re-check a 12-item sample) |
| B054 | pat-engine, PAT (FULL_3) | 15 generated per test | keyholes | pat.keyholes (template already approved: re-check a 12-item sample) |
| B055 | pat-engine, PAT (FULL_3) | 15 generated per test | tfe | pat.tfe (template already approved: re-check a 12-item sample) |
| B056 | pat-engine, PAT (FULL_3) | 15 generated per test | angles | pat.angles (template already approved: re-check a 12-item sample) |
| B057 | pat-engine, PAT (FULL_3) | 15 generated per test | holepunch | pat.holepunch (template already approved: re-check a 12-item sample) |
| B058 | pat-engine, PAT (FULL_3) | 15 generated per test | cubes | pat.cubes (template already approved: re-check a 12-item sample) |
| B059 | pat-engine, PAT (FULL_3) | 15 generated per test | patternfold | pat.patternfold (template already approved: re-check a 12-item sample) |
| B060 | pat-engine, PAT (FULL_4) | 15 generated per test | keyholes | pat.keyholes (template already approved: re-check a 12-item sample) |
| B061 | pat-engine, PAT (FULL_4) | 15 generated per test | tfe | pat.tfe (template already approved: re-check a 12-item sample) |
| B062 | pat-engine, PAT (FULL_4) | 15 generated per test | angles | pat.angles (template already approved: re-check a 12-item sample) |
| B063 | pat-engine, PAT (FULL_4) | 15 generated per test | holepunch | pat.holepunch (template already approved: re-check a 12-item sample) |
| B064 | pat-engine, PAT (FULL_4) | 15 generated per test | cubes | pat.cubes (template already approved: re-check a 12-item sample) |
| B065 | pat-engine, PAT (FULL_4) | 15 generated per test | patternfold | pat.patternfold (template already approved: re-check a 12-item sample) |

### G4. Practice Tests 1 to 3 (Sciences and QR sections) (B066 to B081)

Section-length practice tests; once explained, prometric-mock.html moves onto the shared player.

Served records 420: 358 new, 2 adapt (a rewrite of an item explained earlier), 60 copies (alias only). By bank: prometric 420 (60 copies).

| Batch | Bank, section | Items (new / adapt) | Subtopics | Visual types needed |
|---|---|---|---|---|
| B066 | prometric, BIO | 24 (24 / 0) | biomolecules; carbs; cell-types; cytoskeleton; enzymes; +1 more | bio.diagram:cell 8, chem.molecule 7, bio.chart 7, bio.diagram:dna 2 |
| B067 | prometric, BIO | 28 (28 / 0) | glycolysis; krebs; lab; lipids; membrane | bio.diagram:organelle-pathway 9, bio.diagram:membrane 9, bio.chart 6, chem.molecule 4 |
| B068 | prometric, BIO | 25 (25 / 0) | mitosis; mutation; nucleic; operon; organelles; +1 more | bio.diagram:chromosomes 7, bio.diagram:cell 7, bio.diagram:dna 6, bio.diagram:organelle-pathway 5 |
| B069 | prometric, BIO | 28 (28 / 0) | proteins; repair; replication; signaling; transcription; +2 more | bio.diagram:dna 16, bio.diagram:nerve-endocrine 5, chem.molecule 4, bio.diagram:membrane 3 |
| B070 | prometric, GC | 21 (21 / 0) | acid-base; arrhenius; atomic; bonding; buffers; +5 more | chem.curve:ph 4, chem.energy 4, chem.ledger:ice 4, chem.curve:rate 3, chem.cell 3, chem.orbital 2, chem.lewis 1 |
| B071 | prometric, GC | 23 (21 / 2) | eq-kc; eq-lechat; equilibrium; gas-laws; hybridization; +5 more | chem.ledger:ice 7, chem.gas 6, chem.lewis 6, chem.ledger 3, chem.curve:rate 1 |
| B072 | prometric, GC | 23 (23 / 0) | liquids; mole-conv; nernst; nuclear; periodic; +4 more | chem.ledger 9, chem.trend 4, chem.curve:ph 3, chem.cell 2, chem.orbital 2, chem.curve:rate 2, chem.lewis 1 |
| B073 | prometric, GC | 8 (8 / 0) | solutions; strong-weak; titration; vsepr | chem.ledger 3, chem.lewis 3, chem.curve:ph 2 |
| B074 | prometric, OCHEM | 24 (24 / 0) | ab-ochem; acids; alc-eth; alkene-add | chem.molecule 12, chem.reaction 12 |
| B075 | prometric, OCHEM | 28 (28 / 0) | arom-eas; carbonyl; lab; mech-arrows; mech-sne | chem.mechanism 13, chem.reaction 8, chem.lab 7 |
| B076 | prometric, OCHEM | 23 (23 / 0) | mech-sne; spec-ir-nmr; stereo-rs; synth | chem.molecule:stereo 9, chem.spectrum 8, chem.mechanism 5, chem.reaction 1 |
| B077 | prometric, QR | 25 (25 / 0) | absval; algebra; binomials; coord; count-pc; +4 more | qr.work 17, qr.numberline 3, qr.tree 3, qr.plane 2 |
| B078 | prometric, QR | 24 (24 / 0) | estim; exps; frac-add; frac-dec; frac-mul; +4 more | qr.partwhole 13, qr.work 7, qr.work:rate-table 3, qr.tree 1 |
| B079 | prometric, QR | 23 (23 / 0); 1 done in the pilot | logs; mental; mixture; neg-ineq; p-andor; +4 more | qr.partwhole 13, qr.tree 5, qr.work 4, qr.numberline 1 |
| B080 | prometric, QR | 23 (23 / 0) | pct-seq; pemdas; rate-time; ratios; tri-inv; +2 more | qr.work 10, qr.partwhole 8, qr.work:rate-table 4, qr.geometry 1 |
| B081 | prometric, QR | 10 (10 / 0) | vol-sa; word-decode; work-rate; zscore | qr.geometry 4, qr.work:rate-table 3, qr.work 2, qr.dataset 1 |

### G5. The Climb (10 mini-tests) (B082 to B097)

Mixed 40-item mini-tests used through the Blend phase; already the best-explained bank (median 81 words), so writers start from its stored explanations.

Served records 400: 400 new, 0 adapt (a rewrite of an item explained earlier), 0 copies (alias only). By bank: climb 400.

| Batches | Bank, section | Items (new / adapt) | Visual types needed |
|---|---|---|---|
| B082 to B085 (4) | climb, BIO | 100 (100 / 0) | bio.diagram:organelle-pathway 20, bio.diagram:cell 17, chem.molecule 10, bio.diagram:dna 10, bio.hardy-weinberg 10, bio.diagram:membrane 10, bio.punnett 10, bio.diagram:chromosomes 10, bio.diagram:heart 2, bio.diagram:nephron 1 |
| B086 to B089 (4) | climb, GC | 100 (100 / 0) | chem.curve:ph 10, chem.orbital 10, chem.lewis 10, chem.cell 10, chem.ledger:ice 10, chem.gas 10, chem.curve:rate 10, chem.ledger 10, chem.trend 10, chem.energy 10 |
| B090 to B093 (4) | climb, OCHEM | 100 (100 / 0) | chem.molecule 40, chem.reaction 30, chem.spectrum 10, chem.mechanism 10, chem.molecule:stereo 10 |
| B094 to B097 (4) | climb, QR | 100 (100 / 0) | qr.partwhole 30, qr.work 20, qr.tree 20, qr.geometry 15, qr.dataset 10, qr.figure 5 |

### G6. Reading Comprehension bank (passages outside the full tests) (B098 to B119)

Every RC item already has proof lines and distractor notes; this is mostly migration to families and the evidence picture.

Served records 550: 550 new, 0 adapt (a rewrite of an item explained earlier), 0 copies (alias only). By bank: rc 550.

| Batches | Bank, section | Items (new / adapt) | Visual types needed |
|---|---|---|---|
| B098 to B119 (22) | rc, RC | 550 (550 / 0) | rc.evidence 550 |

### G7. DAT-format sets: QR formats, OChem 2026 set, Ace bank (B120 to B136)

The newest DAT-style items (2026 OChem spec; QR comparison, sufficiency, data and word formats).

Served records 433: 409 new, 1 adapt (a rewrite of an item explained earlier), 23 copies (alias only). By bank: qrFormats 220, ochem2026 203 (21 copies), ace 10 (2 copies).

| Batches | Bank, section | Items (new / adapt) | Visual types needed |
|---|---|---|---|
| B120 | ace, OCHEM | 8 (7 / 1) | chem.mechanism 4, chem.reaction 4 |
| B121 to B127 (7) | ochem2026, OCHEM | 182 (182 / 0) | chem.mechanism 65, chem.reaction 29, chem.energy 27, chem.spectrum 22, chem.molecule 13, chem.molecule:stereo 13, chem.lab 13 |
| B128 to B136 (9) | qrFormats, QR | 220 (220 / 0) | qr.figure 62, qr.work 57, qr.partwhole 41, qr.dataset 19, qr.work:rate-table 17, qr.tree 13, qr.numberline 11 |

### G8. Section engines: QR, Gen Chem, OChem 1000 (B137 to B236)

The banks behind lesson checks, warm-ups and section drills; most pool and game items are copies or rewrites of these.

Served records 2841: 2271 new, 382 adapt (a rewrite of an item explained earlier), 188 copies (alias only). By bank: qrEngine 1020 (97 copies), gcEngine 627 (3 copies), ochem1000 1194 (88 copies).

| Batches | Bank, section | Items (new / adapt) | Visual types needed |
|---|---|---|---|
| B137 to B160 (24) | gcEngine, GC | 624 (467 / 157) | chem.ledger 128, chem.lewis 94, chem.curve:ph 82, chem.ledger:ice 69, chem.energy 66, chem.cell 52, chem.orbital 36, chem.gas 31, chem.curve:rate 30, chem.trend 19, chem.curve:phase 17 |
| B161 to B201 (41) | ochem1000, OCHEM | 1106 (1106 / 0) | chem.reaction 708, chem.mechanism 138, chem.molecule 134, chem.spectrum 70, chem.molecule:stereo 34, chem.lab 22 |
| B202 to B236 (35) | qrEngine, QR | 923 (698 / 225) | qr.work 320, qr.partwhole 273, qr.tree 101, qr.work:rate-table 61, qr.geometry 57, qr.numberline 42, qr.dataset 32, qr.plane 23, qr.venn 9, qr.figure 5 |

### G9. Pool, games, OChem engine and lesson checks (B237 to B342)

What remains: pool Bio, OChem engine items, game copies (mostly aliases), the Bio hub retrieval cards and small lesson sets.

Served records 6277: 2021 new, 694 adapt (a rewrite of an item explained earlier), 3562 copies (alias only). By bank: pool 2430 (1310 copies), games-bio 508 (508 copies), games-gc 517 (517 copies), games-qr 1017 (1016 copies), ochemEngine 1230 (206 copies), bioRetrieval 177 (5 copies), bioAP 60, ochemV2 80, ochemItems 8, ochemPredict 22, gcRecog 62, gcTrends 41, gcElim 3, qrChunks 62, qrPF 8, qrElim 4, bioStick 30, bioPedigree 10, bioCond 8.

| Batches | Bank, section | Items (new / adapt) | Visual types needed |
|---|---|---|---|
| B237 to B238 (2) | bioAP, BIO | 60 (60 / 0) | bio.diagram:heart 12, bio.diagram:nerve-endocrine 12, bio.real 12, bio.diagram:digestive 6, bio.diagram:nephron 6, bio.diagram:embryo 6, bio.diagram:lung 6 |
| B239 | bioCond + bioPedigree, BIO | 18 (18 / 0) | bio.pedigree 10, bio.chart 8 |
| B240 to B247 (8) | bioRetrieval, BIO | 172 (167 / 5) | bio.tree 33, bio.diagram:cell 24, bio.diagram:dna 21, bio.diagram:nerve-endocrine 18, bio.diagram:embryo 17, chem.molecule 9, bio.diagram:organelle-pathway 9, bio.diagram:chromosomes 6, bio.punnett 6, bio.diagram:immune 5, bio.chart 3, bio.diagram:membrane 3, bio.pedigree 3, bio.diagram:digestive 3, bio.diagram:nephron 3, bio.diagram:lung 3, bio.real 3, bio.hardy-weinberg 2, bio.diagram:heart 1 |
| B248 | bioStick, BIO | 30 (2 / 28) | bio.diagram:cell 6, bio.real 6, bio.diagram:membrane 4, bio.diagram:nerve-endocrine 4, bio.diagram:embryo 2, bio.tree 2, bio.hardy-weinberg 2, bio.diagram:heart 2, bio.diagram:nephron 2 |
| B249 | games-qr, QR | 1 (0 / 1) | qr.numberline 1 |
| B250 | gcElim, GC | 3 (3 / 0) | chem.ledger 3 |
| B251 to B252 (2) | gcRecog, GC | 62 (62 / 0) | chem.lewis 23, chem.curve:ph 7, chem.curve:phase 7, chem.curve:rate 6, chem.energy 5, chem.ledger 4, chem.trend 4, chem.cell 3, chem.ledger:ice 3 |
| B253 to B254 (2) | gcTrends, GC | 41 (41 / 0) | chem.trend 32, chem.lewis 7, chem.ledger 2 |
| B255 to B291 (37) | ochemEngine, OCHEM | 1024 (877 / 147) | chem.reaction 742, chem.mechanism 123, chem.molecule 59, chem.molecule:stereo 43, chem.spectrum 30, chem.lab 27 |
| B292 | ochemItems + ochemPredict, OCHEM | 30 (30 / 0) | chem.reaction 24, chem.mechanism 6 |
| B293 to B295 (3) | ochemV2, OCHEM | 80 (80 / 0) | chem.reaction 26, chem.molecule:stereo 13, chem.mechanism 9, chem.molecule 8, chem.lab 8, chem.energy 8, chem.spectrum 8 |
| B296 to B310 (15) | pool, BIO | 387 (312 / 75) | bio.tree 63, bio.diagram:dna 42, bio.chart 39, bio.diagram:embryo 34, bio.diagram:nerve-endocrine 32, bio.diagram:cell 26, bio.punnett 24, bio.diagram:chromosomes 20, bio.diagram:heart 17, bio.pedigree 15, bio.real 12, bio.diagram:lung 11, bio.diagram:digestive 10, bio.diagram:immune 10, bio.diagram:nephron 10, chem.molecule 7, bio.diagram:organelle-pathway 7, bio.hardy-weinberg 6, bio.diagram:membrane 2 |
| B311 to B325 (15) | pool, GC | 370 (12 / 358) | chem.ledger 72, chem.lewis 62, chem.curve:ph 51, chem.energy 40, chem.cell 32, chem.ledger:ice 27, chem.orbital 23, chem.curve:rate 19, chem.gas 18, chem.trend 16, chem.curve:phase 10 |
| B326 to B336 (11) | pool, OCHEM | 298 (298 / 0) | chem.reaction 174, chem.molecule 35, chem.spectrum 27, chem.mechanism 23, chem.lab 21, chem.molecule:stereo 18 |
| B337 to B339 (3) | pool, QR | 65 (3 / 62) | qr.partwhole 18, qr.plane 17, qr.work 11, qr.numberline 8, qr.tree 8, qr.dataset 1, qr.work:rate-table 1, qr.geometry 1 |
| B340 to B341 (2) | qrChunks, QR | 62 (44 / 18) | qr.partwhole 20, qr.work 14, qr.geometry 10, qr.tree 10, qr.work:rate-table 8 |
| B342 | qrElim + qrPF, QR | 12 (12 / 0) | qr.work 5, qr.tree 2, qr.work:rate-table 2, qr.partwhole 2, qr.dataset 1 |

### G10. Retold courses, trick-video checks, QR pacing pages (B343 to B368)

These already carry per-choice notes and a scene picture; the work is house-rule migration (families, "wrong" wording) rather than writing.

Served records 566: 563 new, 0 adapt (a rewrite of an item explained earlier), 3 copies (alias only). By bank: retold-BIO 105, retold-GC 98, retold-OCHEM 79, retold-QR 91, retold-RC 64, retold-PAT 63, videos 27, qrFriday 22 (3 copies), qrPacing 17.

| Batches | Bank, section | Items (new / adapt) | Visual types needed |
|---|---|---|---|
| B343 | qrFriday, QR | 19 (19 / 0) | qr.work 8, qr.partwhole 8, qr.tree 3 |
| B344 | qrPacing, QR | 17 (17 / 0) | qr.work 17 |
| B345 to B348 (4) | retold-BIO, BIO | 105 (105 / 0) | bio.tree 16, bio.punnett 15, bio.diagram:cell 15, bio.diagram:organelle-pathway 15, bio.diagram:chromosomes 15, bio.diagram:nerve-endocrine 8, bio.diagram:embryo 7, bio.diagram:membrane 7, bio.diagram:dna 7 |
| B349 to B353 (5) | retold-GC, GC | 98 (98 / 0) | chem.ledger 21, chem.energy 14, chem.lewis 14, chem.curve:rate 7, chem.ledger:ice 7, chem.curve:ph 7, chem.cell 7, chem.orbital 7, chem.trend 7, chem.gas 7 |
| B354 to B356 (3) | retold-OCHEM, OCHEM | 79 (79 / 0) | chem.reaction 34, chem.mechanism 22, chem.molecule 11, chem.spectrum 7, chem.molecule:stereo 5 |
| B357 to B359 (3) | retold-PAT, PAT | 63 (63 / 0) | pat.* 63 |
| B360 to B363 (4) | retold-QR, QR | 91 (91 / 0) | qr.work 25, qr.geometry 21, qr.tree 19, qr.partwhole 19, qr.dataset 7 |
| B364 to B366 (3) | retold-RC, RC | 64 (64 / 0) | rc.evidence 64 |
| B367 | videos, GC | 8 (8 / 0) | chem.cell 4, chem.ledger 2, chem.trend 2 |
| B368 | videos, OCHEM | 19 (19 / 0) | chem.reaction 9, chem.spectrum 4, chem.molecule 2, chem.molecule:stereo 2, chem.mechanism 2 |

---

## 4. Visuals: what to build (reuse first)

Counts are items to write or adapt that need each type (batches.json,
`visualTotals`; PAT counted per test seed).

| Visual type | Items | Status | Renderer |
|---|---|---|---|
| chem.reaction | 1,860 | Reuse | SmilesDrawer via the light copy of tools/ochem/tree/draw.js; marks and reagent arrow from the pilot |
| rc.evidence | 814 | Built in the pilot | Proof lines from tools/rc/data/bank.js, numbered tags |
| qr.work (and qr.work:rate-table) | 673 | New | A worked-line strip: the setup in words, then each line of algebra; rate table for rate, work and mixture items |
| qr.partwhole | 511 | Built in the pilot | Grid or strip with text labels and a bracket |
| chem.mechanism | 451 | Reuse | drawChain / drawFigure in mechdraw.js; stepper on phones; 2026 figures where they exist |
| chem.molecule (and :stereo) | 539 | Reuse plus the stereo gate | Stereo cards read off the drawing (standard 4.4) |
| chem.ledger (and :ice) | 445 | New | Dimensional-analysis chain; ICE table; unit-factor ledger like the pilot's Lewis ledger |
| chem.lewis | 240 | Copied in the pilot | Lewis sandbox layout functions |
| qr.tree | 225 | Built in the pilot | Counts, branch rates, numerator and denominator roles |
| chem.spectrum | 199 | New | Stick IR and 1H NMR plots with peak labels; tools/ochem/tree t7 modules hold the data shapes |
| chem.energy | 192 | Reuse | drawRcd in mechdraw.js, labels lifted and in sans |
| chem.curve (ph, rate, phase) | 312 | Built for titration; extend | Curves computed from parameters |
| bio.tree | 142 | New, port | Cladogram; initCladogramBuilder and initTree in bio-shared.js hold the logic |
| bio.diagram (cell, dna, chromosomes, organelle-pathway, nerve-endocrine, embryo, membrane, heart, nephron, lung, digestive, immune) | 799 | Mitochondrion built in the pilot; the rest new | One schematic library with numbered markers and HTML legends; reuse the matching hub visualizers' drawings where they can render from state (initCellAtlas, initDnaFork, initNephron, initCardiac, initEndocrine, initEmbryoTimeline, initBodyImmune and others) |
| chem.cell | 126 | New | Galvanic or electrolytic cell: electrodes, salt bridge, electron flow, half-reactions |
| qr.geometry | 124 | Extend qr.triangle | Shapes drawn to scale, ghost comparisons on top |
| chem.lab | 100 | New | Separatory funnel, TLC plate, distillation, recrystallization |
| chem.trend | 95 | Built in the pilot | trends-data.json, rank numbers |
| chem.gas, chem.orbital | 174 | New | Piston and particle box; orbital boxes and electron configurations |
| qr.dataset | 85 | New | Dot plot, box plot, normal curve with z marks |
| bio.chart | 74 | New | Enzyme kinetics, population growth, survivorship (port initKinetics, initPopGrowth, initSurvivorship) |
| qr.figure | 72 | Reuse | shared/qr-figures.js with highlight, annotating the question's own chart |
| bio.punnett, bio.pedigree | 102 | Port | initPunnett and initPedigree state ports; PEDIGREE_PUZZLES spec |
| qr.numberline, qr.plane, qr.venn | 128 | Number line built; plane and Venn new | |
| bio.real | 34 | Reuse | BioReal views (sarcomere TEM, red cells); fix the phone label size in bio-real.js first |
| bio.hardy-weinberg | 23 | Built in the pilot | |
| PAT (six subtests) | 360 per four seeds, plus 63 Retold PAT checks | Angles, hole punching and cube counting built in the pilot; keyholes, top-front-end and pattern folding reuse the engines' truth views | Templates filled from engine item data |

Order of renderer work follows the batches: G1 needs bio.diagram (cell,
chromosomes, membrane, nerve-endocrine, embryo), bio.tree, bio.chart,
bio.punnett, chem.ledger, chem.gas, chem.cell, chem.orbital, chem.spectrum,
qr.work, qr.dataset, qr.plane, qr.geometry and the three remaining PAT views.
Once those exist, 94 percent of the items in later batches (7,902 of 8,412) have
a renderer; the rest wait on eleven small types (organ schematics, chem.lab,
qr.venn, rate tables, bio.pedigree).

---

## 5. Verification protocol, per batch

Roles: a writer (an agent working from the voice codex and the standard), an
independent expert (a separate agent run that never sees the writer's draft
before it solves), and Thomas.

1. Freeze. The batch file lists its qids and the hashes of the bank files they
   come from. A bank change during the batch restarts it.
2. Blind solve. The expert solves every item from the served question alone (the
   player's adapter output: stem, figure, choices as served) and records its
   answer, the reasoning and how sure it is. Structures are checked in RDKit,
   PAT answers recomputed from the engine, RC answers tied to proof lines.
3. Key check. Where the expert's answer differs from the key, the item goes to
   docs/explainers/key-disputes.json with both answers and the reasoning, and
   its explainer is held. The key is never changed in the batch. Thomas rules;
   only he edits a bank key, in its own commit. Pictures that contradict a key
   (a mirrored stereocenter, a figure that disagrees with its stem) go to
   picture-disputes.json the same way.
4. Draft. The writer writes the batch source: steps, every choice note with its
   family, Lock it in, visual spec, play-with target, flags (stem style, bank
   copy issues, tool gaps).
5. Build gates (explainer-standard.md 7.1): bank match, copy rules, families,
   recomputation, RDKit, stereo relations, alias premises, stem-style flags,
   play-with targets, no coach data in published files. Every gate passes or the
   batch does not move.
6. Render gates: screenshots at 390 x 844 and 1280 x 800, rendered-text copy
   check, 12 px text, label collisions, panel height, stereo cards against RDKit,
   no console errors, no sideways scroll.
7. Expert review. The expert reads every explainer and picture against its own
   solve, the way the pilot review did: key agrees, every sentence true at DAT
   level, every trap note true and naming the real pull, family right, picture
   true and matching its alt text, caption says where to look, nothing repeats.
   Verdicts per item: keyAgrees, explanationAccurate, visualAccurate, with the
   problem and the fix. Any false verdict blocks the item.
8. Fix and re-gate. The writer applies the fixes; steps 5 to 7 run again on
   changed items.
9. Thomas signs off in two sittings of about 12 items (about 10 minutes each),
   with the five checks (key, first move, traps, picture with alt, voice) and
   Approve, Hold or Dispute on each card. Approve stamps the checksum.
10. Merge. One pull request per batch with the source file, generated sidecars,
    coach records, gate report and screenshots. Published only when every item
    in it is approved; held items stay on the bank's own explanation.

Thomas's time: G1 to G4 hold 57 write batches and 6 PAT template batches, about
114 sittings plus 6 template sign-offs, roughly 20 hours. If that is too much,
a proposal for G5 onward (Thomas decides): one 10-minute sitting per batch that
covers every flagged item, every item the expert changed, and a random sample of
8, with bulk approval of the rest when the sample passes; any Hold sends the
whole batch back. The decisions doc's rule (nothing new reaches students without
his approval) still holds, since he approves every batch.

What the pilot review shows to expect: in 18 items the experts found no key
disputes, but 4 of 18 explainers and 5 of 18 pictures had a verified problem
(one blocking: OC-3's stereo cards). Step 7 is not optional.

---

## 6. Gates to add to npm test

`npm test` today runs test:gates, test:banks, test:unit and test:init (node
only). The explainer gates join it in two tiers: fast node gates on every run,
and browser plus RDKit gates in `npm run test:all` and the build.

Added to `test:banks` (node, every run):

| Script | Checks | Fails when |
|---|---|---|
| scripts/explainers/gate-schema.mjs | Every student sidecar and coach record against its schema (explainer-standard.md section 2) | A required field is missing or has an unexpected shape |
| scripts/explainers/gate-guard.mjs | Every approved sidecar's key text, stem hash and choice texts against the current bank | An approved record is stale (a bank changed under it) |
| scripts/explainers/gate-coverage.mjs | Every served item in a released group has an approved sidecar or an entry in docs/explainers/gap-list.json; coverage per group never drops below scripts/explainers/coverage-baseline.json | A released item has neither; coverage fell |
| scripts/explainers/gate-copy.mjs | Plain ASCII (bank text excepted), no em or en dashes, no wrong / incorrect / failed, no letters cited (including spec tags and "fact A"), no competitor names (reuses check-no-competitor-names.mjs), no "%" after a student result, budgets (answer 25, step 40, note 35, Lock it in 20, hook 12, alt 60 words in 1 to 3 sentences, caption 25, label 2 to 5 words), step 1 verb, every choice noted, one key | Any rule breaks |
| scripts/explainers/gate-families.mjs | Every non-key choice has a family from families.js; missType matches; PAT families equal the engine tags; rc-stated only on stated choices | Any mismatch |
| scripts/explainers/gate-visual-spec.mjs | Every record has a visual of a known type with a renderer in shared/visuals; alt and caption present; spec under 4 KB; focus set; no letter tags; node-recomputable values recomputed (trend, titration, Law of Cosines, Bayes trees, PAT answers and slip counts, RC quotes and proof lines) | A spec is missing, oversized, or a recomputation disagrees |
| scripts/explainers/gate-recorded.mjs | The RDKit and render results recorded by the build (docs/explainers/gate-report.json) match the current sidecar checksums | A sidecar changed after its RDKit or render checks ran |
| scripts/explainers/gate-publish.mjs | No flags, review, routing or gate fields under content/; /docs/* still force-redirected in netlify.toml and _redirects; key and picture disputes only under docs/ | Coach data could reach a student |
| scripts/explainers/gate-sizes.mjs | Sidecar at most 6 KB; index per section at most 200 KB; cached SVG at most 40 KB (60 KB true-to-life) | Over budget |
| scripts/explainers/gate-video-slots.mjs | video.slot equals subtopic; every slot in content/videos/index.json exists in the lesson map | A slot is unknown |
| scripts/explainers/gate-play-targets.mjs | Every playWith href exists; its expect strings are in the target or its scripts; timer, clock, pace bar, score or streak markers on a target are acknowledged in the coach record | A label promises what the target lacks, or a timer goes unmentioned |
| gate-house-glyphs.mjs (existing) | Extended to content/explainers and shared/visuals | |

Added to `test:all` and run by the build (Playwright, python3 + RDKit):

| Script | Checks |
|---|---|
| scripts/explainers/build.mjs --check | RDKit: every SMILES parses, CIP labels, stereo relations of stereo choices and the relation words in notes |
| scripts/explainers/test-render.mjs | The pilot's shoot.js gates on every changed sidecar at both sizes: errors, sideways scroll, rendered-text copy rules, 12 px text, label collisions, panel height at most 600 px on the phone |
| scripts/explainers/test-stereo-pictures.mjs | Every stereo SMILES drawn on a student page (stems, structure choices, explainers) read off the SmilesDrawer drawing with the settings each page uses and compared with RDKit; calibrated against RDKit reading the same 2D drawings |
| scripts/explainers/test-player.mjs | The player in all three modes and four section layouts: review modes step through subsets, the break hands off to RC, no clock in Practice, no score headline anywhere |

Baseline: coverage starts at the 18 pilot items and grows by batch; the gates
never accept a drop. A record can be published only through an approved review
stamp whose checksum matches the file.

---

## 7. Found while planning: mirrored stereo pictures

Building the stereo gate for OC-3 showed that SmilesDrawer 2.4.2
(shared/smiles-drawer.min.js) sometimes draws the mirror image of the SMILES it
is given. Method: every stereo SMILES on a student page (201 molecules, 275
R/S centers) was drawn, the configuration each picture shows was read off its 2D
positions and wedges, and the result was compared with RDKit's label for the
SMILES. The reader was first checked against RDKit reading the same 2D drawings:
it agreed on all 25 true R/S centers of a 20-molecule calibration set.

| Drawer setting | Pages | Centers drawn mirrored | Molecules |
|---|---|---|---|
| Explicit hydrogens on (the library default) | tools/mock/full.js, prometric-mock.html, games/play.html | 50 of 275 | 45 distinct (15 appear in the full mocks, 44 in OChem 1000; some in both) |
| Explicit hydrogens off | tools/ochem/tree/draw.js drawSmiles | 5 of 275 | 3 (OChem 1000) |

Items that matter most (picture-disputes.json has every picture):

- FULL_2 OChem question 1 (organic:oc-1fquwbw, SN2 of (R)-2-bromobutane): the
  stem is drawn right, but the keyed product (S) is drawn as R and the R choice
  as S. A student who applies inversion to the pictures picks the R choice and is
  marked as a miss.
- FULL_4 OChem question 9 (organic:oc-1khayk8, Fischer esterification with
  retention): the stem acid is drawn right, but the keyed product is drawn as
  its mirror image and the inverted choice looks like retention.
- FULL_3 OChem question 5 (organic:oc-1jzd8nw, menthyl chloride E2): one of the
  three stereocenters is drawn mirrored, so the stem shows a diastereomer; the
  E2 outcome depends on that geometry.
- FULL_1 OChem 30, FULL_3 OChem 18, FULL_4 OChem 1: the stem text names (S) or
  (R) and the picture shows the other; the choices are mirrored with the stem,
  so the relation the item tests survives.
- 22 items in games/ochem-bank-1000.js (44 molecules), shown in Game Central
  and pulled into the Tree and Summit.

No key was changed. Fix options for Thomas: render stereo structures from
RDKit-computed 2D coordinates and wedges (pre-rendered SVG at build time, the
build already runs RDKit), or patch SmilesDrawer's wedge assignment; either way
the stereo-picture gate above blocks a release until every drawn center matches.

---

## 8. Other open items

- The tutorial walk (dat-interface.md section 7) settles the [verify] items:
  title bar, End on question screens, highlight scope, cross-out, Exhibit scope,
  RC orientation and paragraph numbers, PAT directions screens, the cube-counting
  wording ("exactly zero" painted sides).
- Thomas's calls already raised in the pilot flags: stem rewordings (GC-1, GC-2,
  GC-3, QR-1, QR-3), the OC-3 stem drawing, Game Central's timer and streak,
  the PAT Studio timer pills, the RC player's clock and score headline, "wrong"
  in the PAT engine trap names and the RC bank notes, and the l3-wedge root's
  copy.
- Concepts over math: science items with heavy arithmetic get a concept-first
  rewrite or a lighter variant flagged during the blind solve; keys unchanged
  unless Thomas approves.
- Videos: video-plan.md.
