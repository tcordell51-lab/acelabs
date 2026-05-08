# Agent W1 — Official DAT QR Specs and 600-Tier Realities

Research lane: official ADA specifications for the DAT Quantitative Reasoning section, plus the realities of the new 200-600 score scale and what a "600 QR" actually means in 2026.

---

## Overview

The DAT Quantitative Reasoning (QR) section is a 40-question, 45-minute math test administered by the ADA's Department of Testing Services. It is the only DAT section that provides an on-screen calculator (basic four-function with a few extras). As of March 1, 2025, the ADA replaced the legacy 1-30 scale with a new 200-600 scale (10-point increments). The new top score, 600 QR, corresponds to a legacy "30" — the same ceiling, just renumbered.

A 600 QR is the absolute ceiling of the section. Per the ADA's own concordance table, every legacy QR raw scaled score from 28 through 30 collapses into the new 580-600 band, meaning we are not just teaching "how to do 95th-percentile math" — we are teaching how to get nearly every single one of the 40 questions right under heavy time pressure (~67 seconds per question average, with several multi-step word problems that realistically eat 90-120 seconds each).

---

## Official structure

- **Question count:** 40 multiple-choice questions (5 answer choices each).
- **Time limit:** 45 minutes. Average pace: ~67 seconds per question.
- **Format:** Linear, fixed-form CBT (NOT computerized adaptive). All test-takers in a sitting see the same form.
- **Position in test day:** QR is the LAST scored section of the DAT, after SNS, PAT, and RC. Fatigue is real.
- **Scoring:** No penalty for wrong answers. Raw correct count converted to scaled score on 200-600 scale.
- **Calculator:** On-screen, basic four-function, mouse-click only.

## Score scale (ADA concordance table)

| New scale | Old QR | Approx. percentile |
|-----------|--------|--------------------|
| 200       | 4      | <1                 |
| 300       | 13     | ~10                |
| 400       | 18     | ~50 (avg)          |
| 460       | 21     | ~85                |
| 500       | 24     | ~90                |
| 540       | 26     | ~97                |
| 580       | 29     | ~99                |
| 600       | 30     | 99+                |

A 600 QR likely requires 39-40 correct of 40.

## ADA topic distribution

| Topic | # Q | % |
|---|---|---|
| Algebra | 9 | 22.5% |
| Numerical Calculations | 6 | 15.0% |
| Conversions | 3 | 7.5% |
| Probability and Statistics | 4 | 10.0% |
| Geometry | 4 | 10.0% |
| Trigonometry | 4 | 10.0% |
| Word Problems | 10 | 25.0% |

**Algebra + Word Problems = 48% of the section.**

## Calculator constraints

- Basic 4-function + sqrt + % + 1/x + memory only.
- **No trig, no log, no exponents beyond squares.**
- Mouse-click only — no keyboard input.
- Implication: trig + log questions require memorized exact values. Calculator is intentionally a time sink.

## 5 Implications for the QR tool

1. **Mirror official 40-Q / 45-min full-section sim as default mode.** Timer-on by default; explicit opt-in for untimed.
2. **Weight question bank to match ADA distribution exactly** (22.5% algebra, 25% word problems, etc.). Algebra + word problems are 48% — bank reflects that.
3. **Ship a click-only, intentionally-annoying calculator** that mirrors the testing center. Telemetry on calculator usage.
4. **Build a memorization core** for calculator-impossible content: unit circle exact values, common log values, sqrt of small non-perfects, common conversions.
5. **"Back-half stamina" mode** — require 30-45 min of warm-up drilling before entering the full QR sim. QR is the last section of the DAT; no prep tool simulates fatigue.

## Sources

- ADA — DAT page: https://www.ada.org/education/testing/exams/dental-admission-test-dat
- ADA — Score Reporting Scale (PDF): https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat_scorereportingscale.pdf
- ADEA — Concordance Table (PDF): https://www.adea.org/docs/default-source/adea-main/application-services/sample-dat-concordance-table.pdf
- DAT Booster QR study guide: https://boosterprep.com/dat/study-guide/dat-quantitative-reasoning
- Kaplan QR section breakdown: https://www.kaptest.com/study/dat/whats-tested-on-the-dat-quantitative-reasoning-2/
- Orgoman / DAT Destroyer percentile guide: https://orgoman.com/blogs/dental-admissions-test-and-road-to-dental-school-acceptance/dat-percentiles-how-to-interpret-your-score-and-improve-your-chances
- DAT Cracker QR breakdown: https://datcracker.com/blog/dat-breakdown-quantitative-reasoning-2015-02-16/
- Disco Dent percentile table (PDF): https://www.discodent.com/pdf/dat-percentile-table.pdf
- ADA Sample Test Items: https://datprep.com/wp-content/uploads/2022/04/ADA.org_-DAT-Sample-Test-Items.pdf

## Executive summary

40 questions, 45 minutes, 67.5 seconds/Q. Fixed-form (no CAT). Algebra + word problems = 48%; trig and prob/stats are 10% each but a 600 student can't drop any. Calculator is click-only basic four-function — no trig, no log, no keyboard. New 200-600 scale launched March 2025; 600 = legacy 30 = 99+ percentile = ~39-40 of 40 raw. QR runs LAST on test day, so fatigue is a real factor most prep tools ignore. To build a 600-targeting QR tool: default-on timer mirroring 40Q/45min sim, ADA-weighted question bank, intentionally-faithful click-only calculator, spaced-repetition memorization core for calculator-impossible content, and a back-half stamina mode that simulates the fatigue of running QR last.
