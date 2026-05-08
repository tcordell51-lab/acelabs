# Agent W7 — Mastery Learning + Diagnostic Assessment

Lane: educational-research tradition (mastery learning, formative assessment, learning progressions, productive failure, scaffold fade).

## Mastery threshold research

- **Bloom (1968):** ~90–95% of students can reach top quintile with enough time + corrective instruction. Operational threshold typically 80% on unit test, ~1/3 base time for corrective work, parallel re-test.
- **Bloom (1984) 2 Sigma claim does NOT replicate.** Modern tutoring meta-analysis (Nickow, Oreopoulos, Quan 2020, 96 RCTs): mean d = 0.37, none reach 2σ. Bloom's tutoring arm used stricter mastery threshold than classroom arm — confound.
- **Guskey & Gates (1985):** 35/38 studies positive, mean ES ≈ 0.78. Math d = 0.72 (Kulik 1990).
- **Practical thresholds:** 80–90% common; 80% is the research convention. Bloom's loop = teach → formative test → corrective (~1/3 base time) → re-test on parallel form. After 3 cycles failing, switch intervention (reteach, prereq backtrack, tutor) — not more retries.

## Formative assessment (Black & Wiliam 1998)

250+ studies; effective formative assessment produced 0.4–0.7 SD gains. Key features: frequent low-stakes checks; specific feedback on task and process (not the person); student self-assessment; evidence used to *adjust instruction*.

**Dipstick vs deep-dive:** dipstick = fast exit-ticket "are you tracking?"; deep-dive = engineered item with **targeted distractors**, each mapped to a specific misconception. The wrong answer IS the diagnosis.

## Hattie effect sizes (Visible Learning, hinge d = 0.40)

| Influence | d |
|---|---|
| Self-reported grades / student expectations | 1.33 |
| Response to intervention | 1.07 |
| Formative evaluation | ~0.90 |
| Classroom discussion | 0.82 |
| Deliberate practice | 0.79 |
| Feedback | 0.73 |
| Metacognitive strategies | 0.69 |
| Spaced vs massed practice | 0.60 |
| **Mastery learning** | **0.57** |
| Worked examples | 0.57 |
| Direct instruction | 0.59 |

**The assessment-and-feedback loop matters more than the mastery threshold.** Formative evaluation (~0.90) and feedback (0.73) outrank mastery learning (0.57).

## Competency-based education ops (relevant operational analogs)

**WGU:** progress on demonstrated competence not seat-time. Per-term tuition. Course mentors coach; evaluators score blind. Granular competency map per program. ~$15K/yr.

**Khan Academy mastery:** v1 (2011) was binary "10 in a row" — flawed. v2 current is probabilistic with tiers: **Attempted → Familiar → Proficient → Mastered**. Items interleaved with prior skills; mastery can *regress*. 2024 streaks reintroduced separate from mastery prediction.

**Lesson:** modern CBE moved from binary thresholds to graded levels with re-checks that can downgrade.

## Learning progressions (Confrey, Daro, Mosher)

- Empirically validated ordered sequence of increasingly sophisticated understandings.
- Trajectory-based diagnostics place student at a *level* and prescribe next step.
- Two students at 60% can be qualitatively different.

For QR: a prereq DAG captures order but not level within a topic.

## Wrong-answer pedagogy + Productive Failure

**Distractor analysis:** each distractor maps to a specific misconception (Craig Barton's diagnosticquestions.com is the largest public corpus). Distractor-specific feedback yields gains of d ≈ 0.2–0.4 over correct-answer-only feedback.

**Manu Kapur Productive Failure:** present complex novel problem BEFORE instruction. Students struggle, generate often-wrong solutions, then receive consolidating instruction.
- **Sinha & Kapur (2021)** meta-analysis, 166 comparisons, ~12,000 students: PF beats instruction-first by **d = 0.36**, high-fidelity reaches **d = 0.58**.
- Larger effects for older (secondary+) learners — directly relevant to DAT cohort.
- Mechanism: failed attempts activate prior knowledge, surface misconceptions, create gaps subsequent instruction fills durably.
- Caveat: PF requires real consolidating instruction afterward.

## Scaffold fade-out

- Wood, Bruner & Ross (1976): scaffolding is by definition *temporary*.
- McNeill et al. (2006) JLS: faded-scaffold group beats continuous-scaffold on transfer items where scaffolds are absent.
- Belland et al. (2017) meta-analysis: ES ≈ 0.46.

**Timing:** *contingent fading* — remove scaffold when learner can articulate the procedure / choose strategies / complete the step unaided once. Evidence-based, not time-based.

For QR: full worked example → worked with one blank step → analogous with hint → analogous cold → near-transfer cold → far-transfer cold.

## 5 recommendations for the QR tool

1. **Replace binary mastery with 4 tiered levels.** Attempted → Familiar → Proficient → Mastered. Probabilistic estimator; allow regression. Proficient when P(next correct) ≥ 0.85; Mastered requires that sustained across **two interleaved re-checks separated by ≥ 24 hours** (combines mastery threshold with spacing). Kills streak-luck false positives.

2. **Diagnostic distractors driving misconception-specific feedback.** Every QR item gets `distractor_misconception` per choice plus a misconception-keyed feedback string. Aggregate to surface each student's *top three error patterns* — deeper diagnostic than per-skill mastery.

3. **Productive Failure entry on conceptually rich topics.** Front-load a single hard PF problem before instruction (5-min cap, no hints, no penalty), then show worked solution + walkthrough. Sinha & Kapur d = 0.36–0.58. Reserve PF for conceptually rich problems, not procedural drills.

4. **Scaffold ladder per skill, contingent fade.** 5-rung ladder: worked example → worked with blank → guided practice → independent → transfer. Promote on clean trial; on regression drop one rung.

5. **Make the assessment loop the product.** Hattie's strongest signal isn't mastery learning — it's formative evaluation (~0.90) and feedback (0.73). Daily-updated misconception heatmap, time-on-skill vs threshold ratio, auto-trigger deep-dive diagnostic on stuck (≥3 corrective cycles without proficiency). Wiliam's dipstick→deep-dive escalation.

## Sources

- Bloom (1968) Learning for Mastery: https://eric.ed.gov/?id=ED053419
- Bloom (1984) 2 Sigma Problem: https://journals.sagepub.com/doi/10.3102/0013189X013006004
- Guskey & Gates (1985): https://uknowledge.uky.edu/context/edp_facpub/article/1017/viewcontent/Guskey_Synthesis_of_research.pdf
- Kulik, Kulik, Bangert-Drowns (1990): https://journals.sagepub.com/doi/10.3102/00346543060002265
- Black & Wiliam (1998) Inside the Black Box: http://edci770.pbworks.com/w/file/fetch/48124468/BlackWiliam_1998.pdf
- Hattie effect sizes: https://visible-learning.org/hattie-ranking-influences-effect-sizes-learning-achievement/
- Khan Academy mastery levels: https://support.khanacademy.org/hc/en-us/articles/5548760867853
- Sinha & Kapur (2021) PF meta-analysis: https://journals.sagepub.com/doi/full/10.3102/00346543211019105
- Manu Kapur Productive Failure: https://www.manukapur.com/productive-failure/
- McNeill et al. (2006) Fading Scaffolds: https://www.tandfonline.com/doi/abs/10.1207/s15327809jls1502_1
- Belland et al. (2017) scaffolding meta: https://pmc.ncbi.nlm.nih.gov/articles/PMC5347356/
- Craig Barton Diagnostic Questions: https://tipsforteachers.co.uk/diagnostic-questions/

## Executive summary

The educational-research literature converges on a clear hierarchy: **the assessment-and-feedback loop matters more than the mastery threshold itself.** Hattie ranks formative evaluation at d ≈ 0.90 and feedback at d = 0.73, while mastery learning sits at d = 0.57 — all above the 0.40 hinge but with the loop dominating. Bloom's 2σ tutoring claim does not replicate; modern tutoring meta-analyses find d ≈ 0.37.

**Strongest single piece of evidence:** Sinha & Kapur (2021) Productive Failure meta-analysis across 166 experimental comparisons and ~12,000 students — d = 0.36 baseline, up to 0.58 at high fidelity, with stronger effects for secondary-and-older learners (the DAT cohort).

**Implication:** the current QR binary mastered/not gate is a 1990s Khan-v1 design. Upgrade to (1) 4-tier mastery model with probabilistic transitions and possible regression, (2) misconception-tagged distractors driving error-specific feedback, (3) Productive Failure entry on conceptually rich topics, (4) contingent-fade scaffold ladder, and (5) misconception heatmap that makes the formative loop the visible product, not the threshold.
