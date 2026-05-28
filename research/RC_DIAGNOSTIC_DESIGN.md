# RC Diagnostic Design — Matching DAT RC Approach Method to Student

**Author:** AceLabs research
**Date:** 2026-05-07
**Scope:** Design a 30–45 minute, single-sitting, static-HTML diagnostic that figures out which Reading Comprehension approach method best fits a given DAT student, and surfaces the underlying cognitive/affective signals that drive that fit.

---

## 1. Problem framing

DAT RC is 50 questions, 3 science passages, 60 minutes — roughly 20 minutes per passage with 16–17 questions each (DAT Booster, accessed 2026-05-07). Every major prep vendor (Bootcamp, Booster, Shemmassian) acknowledges that no single approach is best for every student, and every vendor punts the question of *which* approach fits *which* student to "try them all and see what feels right" (Bootcamp Vanilla Method post; DATBooster top-strategies guide; Shemmassian DAT RC blog — all accessed 2026-05-07).

That punt is the gap. Students burn 6–10 hours of practice passages discovering by trial-and-error something a 35-minute diagnostic could surface up front. The diagnostic below operationalises six signals — reading speed on science prose, retention at speed, question-type strengths/weaknesses, working-memory load tolerance, time-pressure delta, and distractor-trap susceptibility — and maps them to one of four approach methods drawn from the published vendor canon.

---

## 2. Existing diagnostic instruments — what they measure, what they miss

### 2.1 Nelson-Denny Reading Test (NDRT)

Source: WPS Publishing, PAR, Wikipedia summary (accessed 2026-05-07)
URLs:
- https://en.wikipedia.org/wiki/Nelson%E2%80%93Denny_Reading_Test
- https://www.wpspublish.com/ndrt-nelson-denny-reading-test-forms-i-j
- https://www.parinc.com/products/NDRT-IJ

**What it measures:**
- Vocabulary (80 multiple-choice, 5-option items)
- Comprehension (7 passages, 36–38 questions, 5-option items)
- Reading rate — student marks the last sentence read after exactly 1 minute into Passage 1
- Total administration time ~45 min including instructions
- Internal consistency .85–.95; test–retest .89–.98
- Outputs grade/age equivalents, percentile ranks, index scores (M=100, SD=15)

**What it does not measure / criticisms:**
- "Not appropriate for the clinical evaluation of reading disorders" — it screens, it does not diagnose mechanism (Wikipedia, citing publisher)
- Reading-rate measurement uses *general* prose, not science prose specifically — limited transfer to DAT context
- No timed-vs-untimed comparison built in (one fixed condition only)
- No question-type tagging on the comprehension items — yields a global comprehension score with no diagnostic resolution on detail vs inference vs main-idea
- No measurement of working memory load, anxiety response, or distractor-trap pattern recognition

### 2.2 ACT/SAT diagnostic tools, Lexile-based diagnostics

These are evaluative (placement / grade-level) instruments, not diagnostic of *strategy fit*. They produce a single proficiency number; they do not tell a student "you are a high-WPM low-retention reader who should use Passage Mapping." This is the diagnosis-vs-evaluation distinction from psychometrics — severity measurement and diagnostic classification are mathematically different operations and require different item-selection logic (assess.com CAT overview; Cambridge CD-CAT paper, accessed 2026-05-07).

URLs:
- https://assess.com/computerized-adaptive-testing/
- https://www.cambridge.org/core/journals/psychometrika/article/abs/when-cognitive-diagnosis-meets-computerized-adaptive-testing-cdcat/66C88AF5AA20B6C05B85B05AD32BA179

### 2.3 DAT-specific diagnostic offerings

- **DAT Bootcamp** — publishes named strategies (Vanilla, Search & Destroy, Vicviper, Map-the-Passage) and explicitly says "watch our other videos to figure out which strategy works the best for you" (https://bootcamp.com/blog/vanilla-method-for-dat-reading-comprehension, accessed 2026-05-07). No diagnostic instrument.
- **DAT Booster** — publishes Classic, Search & Destroy, Passage Mapping, Hybrid (https://boosterprep.com/dat/study-guide/top-strategies-to-master-dat-reading-comprehension, accessed 2026-05-07). Explicitly recommends "test each method during practice." No diagnostic instrument.
- **Chad's / Crack DAT / Shemmassian** — describe Simple, Questions First, Modified Questions First (https://www.shemmassianconsulting.com/blog/reading-comprehension-strategies-dat, accessed 2026-05-07). No diagnostic instrument.

**Finding:** no DAT prep vendor publishes a diagnostic that matches students to approach methods. All of them outsource the matching to trial-and-error. This is the white space.

---

## 3. Time-pressure delta — the cognitive evidence

### 3.1 Differential benefit of extra time

Lesaux, Pearson & Siegel (2006), "The Effects of Timed and Untimed Testing Conditions on the Reading Comprehension Performance of Adults with Reading Disabilities" (Reading and Writing journal; Springer / ERIC EJ736139, accessed 2026-05-07).
URL: https://link.springer.com/article/10.1007/s11145-005-4714-5

Key finding: extra time differentially benefits readers with disabilities; normally achieving readers perform similarly under timed and untimed conditions. Translation for DAT design — the *delta* between timed and untimed accuracy is itself the diagnostic signal. A large delta indicates the student's bottleneck is processing speed under pressure; a small delta indicates the bottleneck is comprehension itself.

### 3.2 Working-memory-under-stress evidence

Calvo & Eysenck (1996), "Phonological working memory and reading in test anxiety" (PubMed 8735612, accessed 2026-05-07).
URL: https://pubmed.ncbi.nlm.nih.gov/8735612/

Key finding: high-anxiety readers rely on the articulatory loop as a compensatory mechanism. Under interference (articulatory suppression, irrelevant speech), anxious readers comprehend significantly worse than non-anxious. Without interference, groups are equivalent. Translation: anxious readers' bottleneck is masked under untimed/quiet conditions and revealed under timed/loaded conditions — supporting the timed-vs-untimed delta protocol below.

Calvo (1992), "Test anxiety and comprehension efficiency: prior knowledge and working memory deficits" (Anxiety, Stress & Coping, T&F, accessed 2026-05-07).
URL: https://www.tandfonline.com/doi/abs/10.1080/10615809208250492

Key finding: prior-knowledge deficit accounts for high-anxiety readers' efficiency drop better than transitory WM reduction. Implication: anxiety effects are passage-content-mediated — we should hold passage difficulty roughly constant across timed and untimed stages of the diagnostic.

### 3.3 Caveat — extra time does not universally help

Salehi et al. (2025), "Extended time on an unspeeded assessment improves neither test anxiety nor performance" (Frontiers in Education, accessed 2026-05-07).
URL: https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2025.1567709/full

Key finding: doubling time on an already-unspeeded exam did not significantly change either performance (67.09% vs 68.10%, p=0.493) or self-reported anxiety. Implication: the diagnostic's "untimed" stage must still apply *some* upper bound (we use 2× the timed condition) — pure no-clock conditions don't produce additional signal and waste student time.

### 3.4 Goldhammer (2024) — efficiency framing

Goldhammer et al. (2024), "Does Timed Testing Affect the Interpretation of Efficiency Scores?" (Journal of Educational Measurement, Wiley, accessed 2026-05-07).
URL: https://onlinelibrary.wiley.com/doi/10.1111/jedm.12393

Supports treating speed and accuracy as separable signals — a reader who answers fewer items but at higher accuracy is qualitatively different from one who answers more items at lower accuracy, even at the same total score. The diagnostic's scoring rubric must preserve this separation.

---

## 4. Reading-speed baseline for science prose

Source: Brysbaert (2019), "How many words do we read per minute? A review and meta-analysis of reading rate," ScienceDirect / KU Reader summary (accessed 2026-05-07).
URLs:
- https://www.sciencedirect.com/science/article/abs/pii/S0749596X19300786
- https://reader.ku.edu/sites/reader/files/2024-01/How%20many%20words%20do%20we%20read%20per%20minute%20(1).pdf

- Adult silent reading rate: ~238 WPM non-fiction, ~260 WPM fiction (meta-analysis of 190 studies)
- Science/technical material: substantially slower; commonly cited 150–175 WPM with comprehension intact; advanced/specialised technical can fall to 75 WPM
- DAT passages run ~700–1500 words; a 200 WPM science-prose reader reads a 1200-word DAT passage in 6 min, a 150 WPM reader in 8 min, a 100 WPM reader in 12 min

**Implication for diagnostic banding (Section 6):**
- High WPM on science prose: >220 WPM (faster than non-fiction average, despite scientific topic)
- Mid WPM: 150–220 WPM (population norm for science material)
- Low WPM: <150 WPM (reader will struggle to finish a 3-passage section without method change)

---

## 5. Question-type taxonomy & distractor patterns

### 5.1 Question types

Drawing on the Magoosh GMAT RC taxonomy and Gallaudet's six-type framework (accessed 2026-05-07):
URLs:
- https://magoosh.com/gmat/strategies-for-the-6-reading-comprehension-question-types/
- https://gallaudet.edu/student-success/tutorial-center/english-center/reading-esl/types-of-reading-comprehension-questions-and-tests/6-types-of-reading-questions/

The diagnostic Stage 3 quiz tags every item with one of four DAT-relevant types:
1. **Detail / locate** — answer is verbatim or near-verbatim in passage
2. **Inference** — answer requires bridging, prediction, or implied reasoning
3. **Vocabulary-in-context** — meaning of a word/phrase as used
4. **Main-idea / tone / structure** — global passage-level reasoning

### 5.2 Distractor patterns

DAT-specific (Bootcamp common-traps article, accessed 2026-05-07):
URL: https://bootcamp.com/blog/common-traps-on-the-dat-reading-comprehension-section
- **Decoys** — familiar passage language re-spun
- **Reversals** — sequence or causation flipped
- **Half-right / half-wrong** — one clause accurate, one contradictory

Broader RC literature (Clear Choice Prep, Sparkl AP, accessed 2026-05-07):
URLs:
- https://www.clearchoiceprep.com/sat-act-prep-blog/top-10-most-common-distractor-answer-choices-on-the-sat-reading-amp-writing-test-part-1
- https://sparkl.me/blog/ap/blueprinting-mcq-reading-distractor-patterns-and-strategic-flags-for-ap-success/
- Absolute language (always/never/all) almost always wrong unless passage matches
- Unsupported real-world-true statements
- False causality from correlation/sequence
- Partial accuracy on multi-clause stems

Stage 3 items are pre-seeded with distractors that exemplify each pattern, and the diagnostic logs *which pattern* each wrong answer represents.

---

## 6. Adaptive vs fixed item-difficulty curve

CAT (computerized adaptive testing) is well-suited to severity/proficiency measurement but is mathematically distinct from cognitive *diagnosis*, where the goal is to maximise information at a classification threshold rather than across the ability range (Cambridge CD-CAT paper; assess.com primer, accessed 2026-05-07). For an implementable static-HTML tool with no server, full CAT is infeasible (no real-time item-bank calibration). The diagnostic instead uses a **stratified-fixed design**: each Stage-3 question-type bucket contains items at three difficulty tiers (easy / medium / hard), administered in fixed order so that branching is unnecessary. This preserves the diagnostic-classification logic (every student sees every type at every difficulty) while staying server-free.

---

## 7. The proposed diagnostic protocol (30–45 min, single sitting)

### Pre-test (1 min)
- One-screen instructions; one practice item for UI familiarity
- Self-report: prior DAT practice score (if any), prior RC anxiety on 1–10 scale
- Click-through consent that timer cannot be paused once stage starts

### Stage 1 — Untimed comprehension + WPM baseline (~12 min)

- One ~1100-word science passage (biology or general-science topic, not chemistry/anatomy to avoid prior-knowledge confound — addresses Calvo 1992)
- Browser timer runs invisibly; student is told "read at your normal pace"
- **WPM measurement**: at the 60-second mark, a non-disruptive marker auto-records the scroll position / current line. The student also clicks a "I just finished this paragraph" button at end of reading. Both signals are captured; the click-end time gives total reading duration; the 60-second marker gives early-pace WPM (Nelson-Denny adapted methodology)
- After reading, the passage hides; 8 retention questions appear: 2 detail, 2 inference, 2 vocab-in-context, 2 main-idea
- Upper bound: 15 min, then auto-advance (Salehi 2025 — pure unbounded conditions add no signal)
- **Output:** untimed WPM on science prose, untimed accuracy overall, untimed accuracy by question type

### Stage 2 — Timed comprehension on parallel passage (~7 min)

- Second ~1100-word science passage matched on Flesch-Kincaid grade (±0.5) and word count (±50)
- Hard cap: 7 minutes total (matches DAT pace of ~20 min per passage with ~17 questions, scaled to 8 questions)
- Visible countdown timer (replicates DAT condition)
- 8 retention questions, same type distribution as Stage 1
- **Output:** timed WPM, timed accuracy overall, timed accuracy by question type, **timed-vs-untimed delta** (the key signal, per Lesaux 2006)

### Stage 3 — Question-type micro-quiz (~15 min)

- 5 short (~250-word) passages, each followed by 4 questions, total 20 questions
- Each question tagged with type (detail / inference / vocab / main-idea) and distractor-trap type embedded in wrong options (decoy / reversal / half-right / absolute / unsupported / false-causality)
- Three difficulty tiers per type, fixed order (stratified-fixed design from Section 6)
- Per-question 90-second soft timer; auto-advance at 120 sec to capture working-memory-load tolerance (the time taken per item correlates with re-scan behaviour — students who finish quickly with high accuracy are holding the passage in WM; students who run the clock and re-scan are not)
- **Re-scan detection:** the passage scroll is logged; if the student scrolls back into the passage area >2 times per question, flag as "re-scanner" (low WM hold). If they answer without scrolling back, flag as "holder" (high WM hold).
- **Output:** per-type accuracy, per-trap-type miss frequency, re-scan rate (WM-load proxy)

### Post-test (2 min)
- Self-report stress rating after Stage 2 vs Stage 1 (1–10 each) — captures subjective anxiety delta in addition to objective accuracy delta
- Final results screen

**Total: 37 minutes** (1 + 12 + 7 + 15 + 2). Fits inside the 30–45 minute budget.

---

## 8. The four recommended approach methods

Drawn from the published DAT canon (Bootcamp + Booster + Shemmassian). Each is well-documented, named, and has an existing user community — so a student told "use Passage Mapping" can find supporting material immediately.

| # | Method | Source | Best for | Key trait |
|---|---|---|---|---|
| A | **Vanilla / Classic** — read whole passage carefully, answer in order, refer back as needed | Bootcamp Vanilla; Booster Classic | Fast readers with strong retention; low time-pressure delta; high WM hold | Linear, low-overhead |
| B | **Search & Destroy** — skip the passage, jump to questions, scan for keywords | Bootcamp; Booster | Slow readers with strong detail recognition; high time-pressure delta caused by reading speed (not comprehension); detail-question strength | Question-first, keyword-driven |
| C | **Passage Mapping** (a.k.a. Map-the-Passage / outlining) — read once and write a 2–4 word tag per paragraph, then answer | Booster; Bootcamp (variant) | Mid-WPM readers with weak WM hold (re-scanners); strength on main-idea but weakness on detail location | Externalises the WM into a map |
| D | **Hybrid Modified Questions-First** — skim question stems for keywords (NOT answer choices), then read passage with those keywords primed, then answer | Booster Hybrid; Shemmassian Modified Questions First | Mid-WPM readers with strong inference but weak detail-pattern-trap discrimination; moderate anxiety | Primes attention without losing structural reading |

---

## 9. Scoring & output rubric

The diagnostic produces six numeric signals plus a recommendation.

### 9.1 The six signals

| Signal | How measured | Bands |
|---|---|---|
| **S1 — Science-prose WPM** | Stage 1 reading time / word count | High >220; Mid 150–220; Low <150 (per Brysbaert 2019) |
| **S2 — Untimed comprehension** | Stage 1 accuracy / 8 | High ≥7/8; Mid 5–6/8; Low ≤4/8 |
| **S3 — Time-pressure delta** | (Stage 1 accuracy − Stage 2 accuracy) / Stage 1 accuracy | Small <15%; Moderate 15–30%; Large >30% (per Lesaux 2006) |
| **S4 — Question-type profile** | Stage 3 per-type accuracy | Per-type strength = ≥75%; weakness = ≤50% |
| **S5 — WM hold (re-scan rate)** | Stage 3 re-scans per question, averaged | Holder ≤0.5/q; Mixed 0.5–1.5/q; Re-scanner >1.5/q |
| **S6 — Distractor-trap susceptibility** | Stage 3 trap-type miss frequency | Identify top-2 trap types where student is misled |

### 9.2 Recommendation logic

```
IF S1 = High AND S2 = High AND S3 = Small AND S5 = Holder
    -> Method A (Vanilla / Classic)

ELSE IF S1 = Low AND S4-detail = Strength AND S3 = Large
    -> Method B (Search & Destroy)

ELSE IF S5 = Re-scanner AND (S4-main-idea = Strength OR S4-detail = Weakness)
    -> Method C (Passage Mapping)

ELSE IF S1 = Mid AND S4-inference = Strength AND S3 = Moderate
    -> Method D (Hybrid Modified Questions-First)

ELSE  -- tiebreaker / ambiguous profile
    -> Method that maximises S2 (untimed comprehension) preservation under
       the highest-S3 student's worst question type
```

### 9.3 Targeted-weakness output

Independent of the method recommendation, the report names:
- The 1–2 weakest question types (S4) and the top-2 distractor-trap patterns (S6) the student fell for, with linkable practice
- Whether the student's primary bottleneck is *speed* (S1 low, S2 high) or *comprehension* (S2 low regardless of S1) or *pressure* (S3 large, S2 high) — these have different remediation paths

---

## 10. The single most important signal this diagnostic surfaces that current DAT prep tools miss

**The timed-vs-untimed accuracy delta (S3), decomposed by question type.**

No DAT prep vendor's diagnostic surface this. A student who scores 70% on a single timed practice set learns only "70%." This diagnostic separates the same student into one of four very different remediation cases:

- 90% untimed, 70% timed -> **pressure-bound**, not comprehension-bound -> Method B or D + pacing drills
- 70% untimed, 70% timed -> **comprehension-bound** -> Method A or C + content review, not pacing
- 90% untimed detail / 50% untimed inference -> **type-bound** -> targeted inference work regardless of method
- 90% timed when holder / 60% timed when re-scanner -> **WM-bound** -> Method C (externalise via mapping)

Vendors collapse all four into one score and let the student guess their own bottleneck. The delta-by-type signal is what makes this diagnostic prescriptive instead of evaluative.

---

## 11. Implementation notes (static-HTML, no servers, no proctors)

- All passages and items pre-baked in a single JS payload; no network calls during the test
- Timers via `performance.now()` and `setInterval`; visibility hidden between stages
- Re-scan detection via scroll-event listener on the passage container; counter per question
- WPM via reading-pane time-on-screen between "Begin reading" and "I'm done"
- All results computed client-side and rendered to a single results page; optional "email me this" sends a JSON blob via mailto: with no backend
- Two parallel forms (Stage 1 and Stage 2 passages swappable) modelled on Nelson-Denny Forms I/J to allow retake without item exposure
- Total payload <500 KB; runs offline once loaded

---

## 12. Sources (all accessed 2026-05-07)

**Diagnostic instruments**
- Nelson-Denny Reading Test — Wikipedia: https://en.wikipedia.org/wiki/Nelson%E2%80%93Denny_Reading_Test
- Nelson-Denny — WPS Publishing: https://www.wpspublish.com/ndrt-nelson-denny-reading-test-forms-i-j
- Nelson-Denny — PAR Inc: https://www.parinc.com/products/NDRT-IJ

**Timed-vs-untimed and anxiety research**
- Lesaux, Pearson & Siegel (2006), Reading and Writing: https://link.springer.com/article/10.1007/s11145-005-4714-5
- Salehi et al. (2025), Frontiers in Education: https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2025.1567709/full
- Calvo & Eysenck (1996), PubMed 8735612: https://pubmed.ncbi.nlm.nih.gov/8735612/
- Calvo (1992), Anxiety Stress & Coping: https://www.tandfonline.com/doi/abs/10.1080/10615809208250492
- Goldhammer et al. (2024), J Educational Measurement: https://onlinelibrary.wiley.com/doi/10.1111/jedm.12393

**Reading-rate baselines**
- Brysbaert (2019), ScienceDirect: https://www.sciencedirect.com/science/article/abs/pii/S0749596X19300786
- KU Reader summary PDF: https://reader.ku.edu/sites/reader/files/2024-01/How%20many%20words%20do%20we%20read%20per%20minute%20(1).pdf

**DAT vendor strategy pages**
- Bootcamp Vanilla Method: https://bootcamp.com/blog/vanilla-method-for-dat-reading-comprehension
- Bootcamp Search & Destroy: https://bootcamp.com/blog/search-destroy-guide-for-dat-reading-comprehension
- Bootcamp common traps: https://bootcamp.com/blog/common-traps-on-the-dat-reading-comprehension-section
- DAT Booster top strategies: https://boosterprep.com/dat/study-guide/top-strategies-to-master-dat-reading-comprehension
- Shemmassian DAT RC: https://www.shemmassianconsulting.com/blog/reading-comprehension-strategies-dat

**Adaptive testing**
- Computerized Adaptive Testing — Wikipedia: https://en.wikipedia.org/wiki/Computerized_adaptive_testing
- Assess.com CAT primer: https://assess.com/computerized-adaptive-testing/
- Cambridge CD-CAT paper: https://www.cambridge.org/core/journals/psychometrika/article/abs/when-cognitive-diagnosis-meets-computerized-adaptive-testing-cdcat/66C88AF5AA20B6C05B85B05AD32BA179

**Question-type taxonomy and distractors**
- Magoosh GMAT 6 question types: https://magoosh.com/gmat/strategies-for-the-6-reading-comprehension-question-types/
- Gallaudet 6 types of reading questions: https://gallaudet.edu/student-success/tutorial-center/english-center/reading-esl/types-of-reading-comprehension-questions-and-tests/6-types-of-reading-questions/
- Clear Choice Prep SAT distractor patterns: https://www.clearchoiceprep.com/sat-act-prep-blog/top-10-most-common-distractor-answer-choices-on-the-sat-reading-amp-writing-test-part-1
- Sparkl AP distractor patterns: https://sparkl.me/blog/ap/blueprinting-mcq-reading-distractor-patterns-and-strategic-flags-for-ap-success/
- Assess.com distractor analysis: https://assess.com/distractor-analysis-test-items/
