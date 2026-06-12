# DAT QR — Content-Alignment Blueprint & Tool Audit (2026)

**Date:** 2026-06-12
**Method:** 5-angle deep research (official ADA spec, prep-provider topic breakdowns, 2023–2026 SDN test-taker reports, archetype/trap survey, timing/over-tested survey), cross-verified. Audited against the live 45-skill `SKILLS` taxonomy in `tools/qr/index.html`.
**Purpose:** Align the QR tool's coverage and weighting to the *actual* exam, and rank the highest-leverage optimizations.

---

## 1. Verified exam blueprint

**Format (HIGH confidence):** 40 questions, 45 minutes (~67 s/question), 5 choices each, fixed-form (not adaptive), QR runs **last** on test day (fatigue is real), no penalty for guessing. On-screen **basic** calculator (QR-only). No formula sheet. No calculus.

**Score scale:** Legacy 1–30 was replaced by **200–600** (10-pt increments) effective **2025-03-01**. The scoring change was **scoring-only — QR content/format/timing were explicitly unchanged.** 600 ≈ legacy 30 ≈ 99th percentile ≈ 39–40/40 correct.

**ADA's own framing:** "30 mathematical problems + 10 applied (word) problems." The widely-circulated 7-category distribution below is the prep-provider consensus (Kaplan/Booster/CrackDAT/Orgoman all reproduce it; it sums to 40). Treat single-digit categories as ±1–2 per form.

| Category | ~#Q / 40 | Share | Notes |
|---|---|---|---|
| **Word problems** | 10 | 25% | Largest category. Rate-time-distance, work/rate, mixture, interest, percent scenarios. Often blends other categories. Reportedly cluster **near the end** of the section. |
| **Algebra** | 9 | 22.5% | Linear/quadratic, inequalities, exponents/roots, absolute value, ratios & proportions, graphical analysis. Reportedly cluster **near the beginning**. |
| **Numerical calculations** | 6 | 15% | Fractions, decimals, percentages (incl. sequential), scientific notation, approximation/estimation. |
| **Probability & statistics** | 4 | 10% | Probability rules, permutations/combinations, descriptive stats, normal/empirical rule, **data interpretation**. Reports say it **repeats** and is under-prepared. |
| **Geometry** | 4 | 10% | 2D area/perimeter, 3D volume/SA, coordinate. **De-emphasized since the 2017 reform** (see below). |
| **Trigonometry** | 4 | 10% | SOHCAHTOA, special right triangles, basic identities only. **De-emphasized / often skippable** per test-takers (see below). |
| **Conversions** | 3 | 7.5% | Temp/time/weight/distance. Both metric & imperial. Top careless-error source (wrong final units). |

### The most important nuance: the 2017 reform
Multiple test-taker threads (and prep framing) indicate the 2017 QR revision **cut standalone trig/geometry emphasis and added "critical-thinking" item types: data analysis, data interpretation, data sufficiency, and quantitative comparison.** Kaplan's public outline still prints trig 4 / geometry 4 (likely stale). Reconciling the sources:
- **Trig/geometry:** lower real yield than their nominal 10% each; students report "a handful (~1–3)" and some deliberately skip trig. **Don't over-invest.**
- **Data interpretation / data sufficiency / quantitative comparison:** now core, **under-prepared**, and a time sink. (Caveat: "increasing year-over-year" is *not* well-sourced — better stated as "expanded since 2017 and now a pillar.")
- DAT Bootcamp's current framing of the three QR pillars: **algebra, word problems, and data analysis.**

### Calculator & timing reality (HIGH confidence)
- On-screen basic four-function (±, ×, ÷; √/%/reciprocal per some sources). **Slow**, pops over the question, must be dragged. Keyboard number-pad entry is **center-dependent** (works at some Prometric centers, not others — do **not** assert "mouse-only" as universal; advise verifying at the Test Drive).
- Top-scorer habit + every provider's advice: **minimize calculator use**; mental math + estimation + back-solving are faster.
- **Timing is the dominant failure mode**, not difficulty. The universal complaint is running out of time with a few questions left; the cause is **getting stuck on one problem**. Consensus tactic: two-pass / "mark-and-move" — if you don't see the path in a few seconds, guess+mark+move; leave ~5 min to return.
- **Calibration:** the *real* QR is widely reported **easier than Booster/Bootcamp** practice (majority view; a minority found theirs representative). Practice difficulty should not be artificially brutal without framing.

---

## 2. Audit of the 45-skill tool vs. the blueprint

Mapping current `SKILLS` to blueprint categories:

| Blueprint category (yield) | Covered by current skills | Verdict |
|---|---|---|
| Word problems (25%) | word-decode, rate-time, work-rate, mixture, interest, harm | **Strong** ✓ |
| Algebra (22.5%) | lin-eq, distrib, binomials, neg-ineq, absval, discr, exps, ratios, logs | **Strong** ✓ |
| Numerical calc / % (15%) | frac-add, frac-mul, frac-dec, dec-arith, estim, mental, pct-of, pct-chg, pct-seq, pemdas | **Strong** ✓ (missing: scientific notation) |
| Probability & stats (10%) | p-flip, p-andor, p-cond, count-pc, zscore, desc-stats, sets, data-interp | **Strong / deepest** ✓ |
| Geometry (10%, de-emphasized) | geo-2d, vol-sa, coord, tri-inv | Adequate; mild **over-build** vs. yield |
| Trigonometry (≤10%, de-emphasized) | trig, tri-inv | **Over-weighted** — 2 skills for a skippable topic |
| Conversions (7.5%) | units | Present (thin); high careless-error topic |
| **Critical-thinking item types (2017)** | data-interp ✓, ds ✓, **quantitative comparison ✗** | **GAP** |

### Findings, ranked by leverage
1. **GAP — Quantitative Comparison is entirely absent** (0 occurrences in `index.html`). It's a 2017-reform item *format*, under-prepared, and the tool already has its sibling `ds` (data sufficiency) but not QC. **Highest-leverage single addition.**
2. **MIS-WEIGHTING — diagnostic/practice/"Weak set" routing should follow yield, not equal weight.** Up-weight Word Problems, Algebra, Numerical/%, and the data-analysis item types; down-weight Trig (it currently occupies 2 of 45 skills, `trig` + `tri-inv`). Verify the 22-Q diagnostic's cross-loading reflects the 25/22.5/15/10 reality and doesn't spend scarce diagnostic items on trig/logs.
3. **DIFFICULTY CALIBRATION — real QR ≈ easier than Booster/Bootcamp.** Ensure the timed sim's difficulty is test-faithful, or explicitly frame hard practice as "tougher than the real thing" so students calibrate confidence correctly (anxiety-aware).
4. **CALCULATOR — already well-aligned** (Calculator Tax mode exists; research strongly validates the "slow, avoid it" policy). One correction: present keyboard input as **center-dependent**, not universally mouse-only.
5. **MINOR — add scientific-notation arithmetic** (part of Numerical Calculations) and strengthen the `units` skill's "answer-in-wrong-final-units" trap, the single most-cited careless error.
6. **TRAP FIDELITY — confirm distractors are built from the predictable wrong method:** arithmetic-mean (not harmonic) average speed; sequential percent off the *original* base; permutation/combination confusion; missing the complement in "at least"; diameter-for-radius; area vs. perimeter; k²/k³ scaling. (The tool already has dedicated skills for most: harm, pct-seq, count-pc, p-flip, vol-sa.)

---

## 3. Recommended build order
1. **Quantitative Comparison module + skill node** (closes the one true content-format gap; pairs with `ds`).
2. **Blueprint-weighted diagnostic & practice mix** (re-weight to yield; cap trig/log diagnostic share).
3. **Test-faithful difficulty framing** on the timed sim (calibration + anxiety).
4. **Scientific-notation skill** + `units` trap emphasis (small, completes Numerical Calculations).

All compose additively on the existing tool — no rewrite. Constraints from `MASTER_GAMEPLAN.md` still hold (no emojis/loss-aversion mechanics, anxiety-aware, mobile-friendly).

---

## Sources (selected)
- ADA DAT User Manual / Candidate Guide (40 items; "30 mathematical + 10 applied"; 2016 critical-thinking items; no calculus; metric+imperial; calculator provided): ada.org DAT guides.
- ADA score-reporting change (200–600 scale, 2025-03-01; content unchanged): ada.org; ADEA Admission Officers FAQ; kaptest.com/study/dat/dat-scoring-change.
- Topic distribution (9/6/3/4/4/4/10): kaptest.com "What's Tested on the DAT: Quantitative Reasoning"; boosterprep.com/dat/study-guide/dat-quantitative-reasoning; CrackDAT (Medium); orgoman.com DAT math 2026.
- 2017 reform / trig-geometry de-emphasis + data-analysis/QC additions; trig "still appears but reduced"; logs/perms-combos/graphs present: SDN threads "QR no trig & geometry??", "March 2025 DAT breakdown (460 AA)", "2024 DAT Breakdown 26AA".
- Calculator slow / center-dependent keyboard; timing = dominant failure mode; mark-and-move two-pass: SDN "Possible to use keyboard for the QR calculator", "Suggestions in studying for the QR section"; bootcamp.com "Boost Your QR Score by Correctly Using the Mark Feature".
- Archetypes/traps (harmonic mean, combined work rate, complement, perms/combos, empirical rule, k²/k³ scaling, radius/diameter, unit-final-answer): bootcamp.com QR formulas; boosterprep.com QR; shemmassianconsulting.com probability-statistics-dat; effortlessmath.com QR; orgoman.com top-10 mistakes.

*Confidence flags and source disagreements (trig frequency; "data interp increasing"; calculator keyboard) are documented inline above.*
