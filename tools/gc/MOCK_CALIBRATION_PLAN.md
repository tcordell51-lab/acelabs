# AceLabs Gen Chem Mock Score Predictor — Calibration Plan

Status: planning doc, beta launch. Predictor lives in `tools/gc/index.html` (score function lines 15073–15079, percentile table line 15083, beta caveat line 15124). Do not modify the predictor while collecting baseline data; calibration is downstream of evidence we do not yet have.

## 1. Data to collect per beta user

| Field | Type | Source |
|---|---|---|
| `user_id` | string | auto, from portal session |
| `mock_run_id` | string | auto, generated at `SIM.finish` |
| `mock_date` | datetime | auto |
| `mock_pct_correct` | float (0–1) | auto |
| `n_attempted` | int | auto |
| `n_total` | int | auto |
| `time_spent_sec` | int | auto, from `s.elapsed` |
| `predicted_score` | int (1–30) | auto |
| `predicted_pct` | int | auto |
| `actual_dat_gc_score` | int (1–30) | user-entered, post-DAT |
| `dat_test_date` | date | user-entered |
| `days_mock_to_dat` | int | derived |
| `prior_study_weeks` | int | user-entered (one-time at intake) |
| `accommodation_15x` | bool | user-entered (intake) |
| `confounders_note` | text (free, optional) | user-entered (illness, anxiety, etc.) |
| `submission_channel` | enum (email / in-app / coach) | auto |

## 2. How to collect it

Create Airtable table `MockCalibration_GC` in base `appDXSpdJuc3WvtYU`. Schema:

| Field | Airtable type |
|---|---|
| `user_id` | Single line text (linked to Students table) |
| `mock_run_id` | Single line text (primary) |
| `mock_date` | Date with time |
| `mock_pct_correct` | Number (precision 0.01) |
| `n_attempted`, `n_total` | Number (integer) |
| `time_spent_sec` | Number (integer) |
| `predicted_score`, `predicted_pct` | Number (integer) |
| `actual_dat_gc_score` | Number (integer, 1–30) |
| `dat_test_date` | Date |
| `days_mock_to_dat` | Formula |
| `prior_study_weeks` | Number |
| `accommodation_15x` | Checkbox |
| `confounders_note` | Long text |
| `submission_channel` | Single select |
| `flagged_outlier` | Checkbox (manual review) |

Collection paths, in order of yield:

1. Auto-write the predictor row at `SIM.finish` via portal-side fetch to an Airtable proxy (no PAT in client). Row arrives with `actual_dat_gc_score` blank.
2. In-app prompt 14 days after the mock attempt: a single-field "What did you score on the real DAT GC?" form on next portal load. Pre-fills `mock_run_id` from the user's most recent run.
3. Post-DAT email seven days after each student's known test date (pulled from the Schedule base) asking for their actual GC scaled score and a one-line free-text note for confounders.
4. Coach-entered fallback: tutors can fill the row from a session note when a student tells them their score verbally.

Tag rows missing `actual_dat_gc_score` after 60 days as `expired` and exclude from fit.

## 3. Statistical threshold for recalibration

Do not refit until all three hold:

- N >= 40 paired (predicted, actual) rows with `flagged_outlier = false` and `accommodation_15x = false` (the standard-time cohort is fit first; 1.5x is fit separately or pooled with an indicator once N_15x >= 15).
- At least 5 rows in each of the four current segments: <50%, 50–80%, 80–95%, >=95% mock-percent-correct.
- Residual standard deviation of (actual - predicted) on the current model has stabilized: rolling SD across the last 10 rows is within 15% of the SD across all rows.

Guardrail: if residual SD exceeds 3.0 scaled-score points at any N >= 20, raise the beta warning to a hard "directional only" badge but still do not refit until N = 40. A noisy fit on small N is worse than a transparent rough one.

Explicit rule: do not recalibrate until N >= 40 standard-time paired rows AND segment minimums are met AND residual SD has stabilized. Anything earlier is illustrative only.

## 4. Recalibration math

Two options:

- Option A: refit the 4-segment piecewise. Re-anchor the three breakpoints (currently 50/80/95% mapping to 17/22/25) by minimizing squared residuals on the paired data, holding monotonicity. Output is interpretable, matches how the function is shaped today, easy to ship as a code change.
- Option B: LOWESS smoothing over the (mock_pct_correct, actual_score) cloud, span 0.5, then snap to integer scaled scores. Captures non-linearity better and avoids forcing breakpoints.

Recommendation: Option A. The piecewise form is already what the code expresses, the audience reads "predicted 22" not a curve, and at N = 40 LOWESS is undersmoothed and the span choice dominates the fit. Ship LOWESS only if Option A's residual SD stays above 2.5 after a clean refit.

Outliers: drop a row from the fit if any of these are true and noted in `confounders_note` or coach intake — illness on test day, documented anxiety event, sub-30-min mock (rushed), or `time_spent_sec` < 0.4 * `n_total` * 60. Mark `flagged_outlier = true`, keep the row in Airtable, exclude from fit. Do not silently delete.

## 5. Until-then UX

The current caveat sits at line 15124 as a 11.5px muted footnote under the result tiles — too quiet. Move the disclosure into or directly adjacent to the predicted-score tile (line 15120), same font weight as the tile label. Three short alternatives, pick one:

- "Predicted DAT GC (beta) — directional estimate from internal mocks. Your real DAT score will differ."
- "Beta predictor. This is calibrated against our own mock bank, not against ADE's official scale. Treat it as a study signal, not a forecast."
- "Beta — internal-mock estimate. We are still validating this against real DAT scores. Use it to track trend, not to set expectations."

Place the chosen line as a second `.l` row inside the predicted-score `sim-result-tile` at line 15120, in the existing muted color, no new colors and no glyphs. The footnote at line 15124 can shorten to a one-line link: "How this is calibrated."

## 6. Cutover criteria

Drop the beta tag when all hold:

- N >= 80 paired rows, standard-time, post-outlier-exclusion.
- Residual SD of (actual - predicted) <= 2.0 scaled-score points overall.
- Mean signed residual within +/- 0.5 (no systematic over- or under-prediction).
- No segment of the piecewise has fewer than 10 rows or residual SD above 2.5.
- A second cohort of 20 fresh rows, collected after the refit, reproduces the residual SD within 0.4 (out-of-sample check).

Until then the predictor stays labeled beta and the in-tile language stays visible.
