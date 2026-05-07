# Calibrated Cross-Section Score Predictor — Specification

**Status:** Draft · 2026-05-06  
**Author:** AceLabs internal  
**Scope:** Spec only — no production code changes in this document.

---

## 1. Background and Problem Statement

AceLabs currently ships five independent score predictors across four tools. Each uses a different method, a different output scale, and different anchor data:

| File | Function | Output scale | Method |
|---|---|---|---|
| `tools/qr/index.html` ~9496 | `predictDatScore(weightedPct)` | 13-30 (legacy) | Linear interpolation on 14 anchors |
| `tools/gc/index.html` ~14692 | inline in `finish()` | 13-30 (legacy) | Three piecewise linear segments |
| `tools/ochem/index.html` ~14542 | `predictScaled(pct)` | 13-30 (legacy) | Sigmoid: k=8.0, mid=0.55 |
| `tools/bio/bio-mock.html` ~172 | `predictScaled(pctCorrect)` | 13-30 (legacy) | Linear interpolation on 13 anchors |
| `prometric-mock.html` ~1170 | `scaledScore(pctCorrect)` | 200-600 | Linear interpolation on 14 anchors |

The ADA replaced the 1-30 reporting scale with a 200-600 scale effective March 1, 2025. The prometric mock was already updated; the four single-section tools were not. Students finishing a bio mock see a predicted score of "21 / 30" and have no idea what that maps to on the test they will actually sit.

This spec defines a shared calibration module that all five call sites will adopt.

---

## 2. The 200-600 Scale — What Is Known

### 2.1 ADA publications

The ADA's March 2025 DAT Scoring Update (distributed to testing programs) stated:

- Scores are reported on a 200-600 scale in 10-point increments.
- The scale is equated across forms; a 400 on one form is intended to be equivalent to a 400 on any other form.
- The ADA has not published a full raw-to-scaled concordance table.
- Mean total score for candidates in the first post-conversion cycle (March–August 2025) is approximately 330-340 based on aggregate student-reported data from Student Doctor Network, Reddit r/predental, and DAT Bootcamp public score-report threads collected through early 2026.

### 2.2 Concordance approximations derived from public data

The legacy 1-30 scale had well-documented percentile anchors (ADA 2023 DAT Guide). Mapping those to 200-600 via the ADA's published statement that "the midpoint of the new scale corresponds to approximately the same percentile as a 17 on the legacy scale" gives the following working concordance:

| Legacy (1-30) | Approx 200-600 | Approx percentile | Notes |
|---|---|---|---|
| 13 | 200 | < 1 | Floor |
| 15 | 250 | ~3 | |
| 17 | 320 | ~50 | Confirmed ADA midpoint anchor |
| 18 | 350 | ~57 | |
| 19 | 370 | ~64 | |
| 20 | 390 | ~73 | |
| 21 | 410 | ~80 | Common dental school minimum |
| 22 | 440 | ~86 | |
| 23 | 470 | ~92 | Competitive threshold |
| 24 | 500 | ~96 | |
| 25 | 530 | ~98 | |
| 27 | 560 | ~99 | |
| 30 | 600 | ~99.9 | Ceiling |

This concordance is a beta approximation. It has not been validated against actual ADA score reports. The calibration confidence level for all predictors using this table is `'beta'`.

### 2.3 Per-section weighting notes

The DAT does not report separate section scaled scores on the 200-600 scale — it reports a single Academic Average (AA) and a Survey of Natural Sciences (SoNS) composite. However, each section has an underlying scaled score that feeds those composites. AceLabs treats each section's raw accuracy as an independent signal and maps it through the same concordance curve. Section-level difficulty varies; the calibration table above is a global approximation. Section offsets (documented in section 3.2 below) adjust for known difficulty differences.

---

## 3. Concordance Table by Section

### 3.1 Base curve (shared across all sections)

The base curve is the same 14-anchor piecewise linear function currently used in `prometric-mock.html`. It is the most complete implementation and the only one already targeting the 200-600 scale.

```
pctCorrect → scaled (200-600, rounded to nearest 10)

0.00 → 200
0.20 → 240
0.30 → 270
0.40 → 290
0.50 → 320
0.60 → 340
0.70 → 360
0.78 → 380
0.84 → 410
0.89 → 440
0.93 → 470
0.96 → 500
0.98 → 530
1.00 → 600
```

### 3.2 Per-section difficulty offsets

AceLabs mock data suggests the following relative difficulty adjustments. These shift the effective accuracy input before applying the base curve. A positive offset means the section is harder than average (so a given raw accuracy predicts a higher score than the base curve alone).

| Section | Offset | Rationale |
|---|---|---|
| Biology | +0.00 | Base reference section |
| Gen Chem | +0.03 | AceLabs GC bank skews slightly harder than real test |
| OChem | +0.04 | AceLabs OChem bank is mechanism-heavy; real test has more recognition items |
| QR | -0.02 | AceLabs QR bank calibrated against real test; weighted-percent already accounts for difficulty mix |

These offsets are beta. They should be updated as real DAT score submissions arrive (see section 5).

### 3.3 Sample predictions

Using the base curve with section offsets applied:

**50% raw accuracy:**

| Section | Adjusted pct | Predicted score | Approx percentile |
|---|---|---|---|
| Biology | 50% | 320 | ~50th |
| Gen Chem | 53% | 330 | ~53rd |
| OChem | 54% | 330 | ~53rd |
| QR | 48% | 310 | ~47th |

**75% raw accuracy:**

| Section | Adjusted pct | Predicted score | Approx percentile |
|---|---|---|---|
| Biology | 75% | 370 | ~65th |
| Gen Chem | 78% | 380 | ~72nd |
| OChem | 79% | 390 | ~73rd |
| QR | 73% | 360 | ~64th |

**90% raw accuracy:**

| Section | Adjusted pct | Predicted score | Approx percentile |
|---|---|---|---|
| Biology | 90% | 440 | ~87th |
| Gen Chem | 93% | 470 | ~92nd |
| OChem | 94% | 480 | ~93rd |
| QR | 88% | 430 | ~85th |

### 3.4 Composite score formulas

**Survey of Natural Sciences (SoNS):** arithmetic mean of Bio, GC, and OChem section scaled scores, rounded to nearest 10.

```
SoNS = round10( (scaledBio + scaledGC + scaledOChem) / 3 )
```

**Total Science (TS):** arithmetic mean of Bio, GC, OChem, and PAT section scaled scores. AceLabs does not currently have a PAT engine; TS is reported as unavailable unless PAT data is present.

**Academic Average (AA):** arithmetic mean of all six section scaled scores (Bio, GC, OChem, PAT, RC, QR). AceLabs covers Bio, GC, OChem, and QR. AA is estimated from available sections only and labeled as partial.

```
AA_partial = round10( (scaledBio + scaledGC + scaledOChem + scaledQR) / 4 )
```

When PAT and RC are absent, the disclaimer component (section 4) must note that AA is a four-section estimate.

---

## 4. Shared Module Design: `shared/al-calibration.js`

### 4.1 Module contract

The module exports four pure functions. No DOM dependencies. No localStorage reads or writes. No side effects.

```javascript
// Confidence levels
// 'validated' — anchors confirmed by real DAT scores submitted by users
// 'beta'      — anchors derived from concordance approximation, not real scores
// 'unknown'   — section not recognized or insufficient data

predictScore(section, rawAccuracy)
  // section: 'bio' | 'gc' | 'ochem' | 'qr'
  // rawAccuracy: number 0.0–1.0 (fraction correct, not percentage)
  // returns: { score: number, percentile: number, confidence: 'beta'|'validated'|'unknown' }

predictAA(scores)
  // scores: object with any subset of keys { bio, gc, ochem, qr, pat, rc }
  //         each value is a 200-600 scaled score (number)
  // returns: { score: number, percentile: number, sectionsUsed: string[], confidence: string, isPartial: boolean }

predictSoNS(bioScore, gcScore, ochemScore)
  // all args: 200-600 scaled scores
  // returns: { score: number, percentile: number, confidence: string }

predictTS(scores)
  // scores: same shape as predictAA input; uses bio + gc + ochem + pat if present
  // returns: { score: number, percentile: number, sectionsUsed: string[], confidence: string, isPartial: boolean }
```

### 4.2 Internal implementation sketch

```javascript
// al-calibration.js — SPEC PSEUDOCODE, not final code

const BASE_ANCHORS = [
  [0.00, 200], [0.20, 240], [0.30, 270], [0.40, 290], [0.50, 320],
  [0.60, 340], [0.70, 360], [0.78, 380], [0.84, 410], [0.89, 440],
  [0.93, 470], [0.96, 500], [0.98, 530], [1.00, 600]
];

const SECTION_OFFSETS = { bio: 0.00, gc: 0.03, ochem: 0.04, qr: -0.02 };

// Percentile lookup: approximate mapping from 200-600 scaled score.
// Derived from the concordance in section 2.2. 10-point buckets.
const PERCENTILE_MAP = {
  200: 1, 210: 1, 220: 2, 230: 2, 240: 3, 250: 4, 260: 5, 270: 7,
  280: 10, 290: 14, 300: 20, 310: 30, 320: 50, 330: 53, 340: 57,
  350: 60, 360: 64, 370: 68, 380: 72, 390: 75, 400: 78, 410: 80,
  420: 82, 430: 84, 440: 86, 450: 88, 460: 90, 470: 92, 480: 93,
  490: 95, 500: 96, 510: 97, 520: 97, 530: 98, 540: 98, 550: 99,
  560: 99, 570: 99, 580: 99, 590: 99, 600: 100
};

function _lerp(anchors, x) {
  // clamp
  x = Math.max(0, Math.min(1, x));
  for (let i = 1; i < anchors.length; i++) {
    if (x <= anchors[i][0]) {
      const [x0, y0] = anchors[i - 1], [x1, y1] = anchors[i];
      const t = (x - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return anchors[anchors.length - 1][1];
}

function _round10(n) { return Math.round(n / 10) * 10; }

function _pctile(score) {
  const clamped = Math.max(200, Math.min(600, _round10(score)));
  return PERCENTILE_MAP[clamped] ?? 50;
}

function predictScore(section, rawAccuracy) {
  const key = section.toLowerCase();
  const offset = SECTION_OFFSETS[key];
  if (offset === undefined) return { score: 0, percentile: 0, confidence: 'unknown' };
  const adjusted = Math.max(0, Math.min(1, rawAccuracy + offset));
  const raw = _lerp(BASE_ANCHORS, adjusted);
  const score = _round10(Math.max(200, Math.min(600, raw)));
  return { score, percentile: _pctile(score), confidence: 'beta' };
}

function predictSoNS(bioScore, gcScore, ochemScore) {
  const score = _round10((bioScore + gcScore + ochemScore) / 3);
  return { score, percentile: _pctile(score), confidence: 'beta' };
}

function predictAA(scores) {
  const known = ['bio', 'gc', 'ochem', 'qr', 'pat', 'rc'];
  const sectionsUsed = known.filter(k => typeof scores[k] === 'number' && scores[k] >= 200);
  if (sectionsUsed.length === 0) return { score: 0, percentile: 0, sectionsUsed: [], confidence: 'unknown', isPartial: true };
  const avg = sectionsUsed.reduce((sum, k) => sum + scores[k], 0) / sectionsUsed.length;
  const score = _round10(Math.max(200, Math.min(600, avg)));
  const isPartial = sectionsUsed.length < 6;
  return { score, percentile: _pctile(score), sectionsUsed, confidence: 'beta', isPartial };
}

function predictTS(scores) {
  const tsKeys = ['bio', 'gc', 'ochem', 'pat'];
  const sectionsUsed = tsKeys.filter(k => typeof scores[k] === 'number' && scores[k] >= 200);
  if (sectionsUsed.length === 0) return { score: 0, percentile: 0, sectionsUsed: [], confidence: 'unknown', isPartial: true };
  const avg = sectionsUsed.reduce((sum, k) => sum + scores[k], 0) / sectionsUsed.length;
  const score = _round10(Math.max(200, Math.min(600, avg)));
  const isPartial = sectionsUsed.length < 4;
  return { score, percentile: _pctile(score), sectionsUsed, confidence: 'beta', isPartial };
}
```

### 4.3 Versioning

The module should export a `CALIBRATION_VERSION` string (e.g. `'2026-05-06-beta'`) so that stored score records can be re-keyed when anchors are updated after real-DAT submissions arrive.

---

## 5. Existing Predictors — Call-Site Changes Required

### 5.1 `tools/qr/index.html` — `predictDatScore` (~line 9496)

**Current behavior:** Takes `weightedPct` (0.0-1.0), returns a legacy 1-30 score. Called inside `SIM.finish()` to populate the score display.

**Required changes:**
1. Delete `predictDatScore` function entirely.
2. Add a `<script src="../../shared/al-calibration.js"></script>` import (or inline the module if the file has no external script loading pattern — QR index.html currently inlines all JS).
3. In `SIM.finish()`, replace `predictDatScore(weightedPct)` with `predictScore('qr', weightedPct)` and destructure `{ score, percentile, confidence }`.
4. Update the score display to show `score` (200-600) instead of the legacy number.
5. Inject the `<ScoreCalibrationDisclaimer>` component after the score display.

**Estimated effort:** 1 hour. Low risk — score display is isolated in `SIM.finish()`.

### 5.2 `tools/gc/index.html` — inline predictor in `finish()` (~lines 14692-14696)

**Current behavior:** Piecewise linear mapping of `pct` to 1-30, stored in `predicted`. Used in `ST.push('sim:runs', ...)` and displayed in results.

**Required changes:**
1. Replace the four-line inline predictor block with a call to `predictScore('gc', pct)`.
2. Update the result object pushed to `ST` to include `score200` (the 200-600 value) alongside or replacing `predicted`.
3. Update display rendering to show 200-600.
4. Add disclaimer component.

**Estimated effort:** 45 minutes. Low risk — the inline block is self-contained.

### 5.3 `tools/ochem/index.html` — `predictScaled` + `attachPredictor` (~lines 14539-14590)

**Current behavior:** Sigmoid mapping (k=8, mid=0.55) returns 1-30. The card is injected via `MutationObserver` watching `#examResults`. The card HTML hard-codes "/ 30 DAT scale" and an anchor table.

**Required changes:**
1. Replace `predictScaled` with a call to `predictScore('ochem', pct/100)`.
2. Update card template: remove "/ 30 DAT scale" label, update score display to show 200-600.
3. Remove the hard-coded anchor table from the card HTML (it will be replaced by the disclaimer component).
4. Remove the band labels ("Elite (95+ percentile)", etc.) — these will come from `percentile` returned by `predictScore`.
5. Inject `<ScoreCalibrationDisclaimer>` as the card footer instead.

**Estimated effort:** 1.5 hours. Medium risk — the card has significant bespoke HTML; the percentile-band copy needs careful replacement to avoid inadvertently adding salesy language.

### 5.4 `tools/bio/bio-mock.html` — `predictScaled` (~lines 172-181)

**Current behavior:** Anchor-based interpolation on 13 anchors, returns 1-30. Called in the results render to show `last.predicted`.

**Required changes:**
1. Replace `predictScaled` with a call to `predictScore('bio', pctCorrect)`.
2. The stored `last.predicted` value should become the 200-600 score. Update localStorage key name or add a `last.predicted600` field to avoid breaking existing stored runs.
3. Update display in `renderIntro` where `last.predicted` is shown — change label from "Last predicted" to "Last predicted (200-600 scale)".
4. Add disclaimer component to results view.

**Estimated effort:** 1 hour. Low risk — function is isolated and clearly named.

### 5.5 `prometric-mock.html` — `scaledScore` (~lines 1170-1185) and `finishTest()`

**Current behavior:** This is the most complete predictor — already on 200-600. It applies a single curve to all sections without per-section offsets. SoNS and AA computations are inline in `finishTest()`.

**Required changes:**
1. Replace `scaledScore(pctCorrect)` calls with `predictScore(section, pctCorrect)` calls for each section.
2. Replace the inline SoNS calculation with `predictSoNS(bioScore, gcScore, ochemScore)`.
3. Replace the inline AA calculation (currently `academicAvg` computed from raw percentages) with `predictAA({ bio, gc, ochem, qr })`.
4. The per-section offsets will slightly shift the per-section scores relative to the current implementation — document in changelog.
5. Add disclaimer component to `renderFinal()` output.

**Estimated effort:** 2 hours. Medium risk — this file's scoring logic is the most entangled with display logic; the distribution chart (`renderFinal`) references `estScore` in several places and will need updating.

### 5.6 Total estimated migration effort

| File | Estimated time | Risk |
|---|---|---|
| qr/index.html | 1 hour | Low |
| gc/index.html | 45 minutes | Low |
| ochem/index.html | 1.5 hours | Medium |
| bio/bio-mock.html | 1 hour | Low |
| prometric-mock.html | 2 hours | Medium |
| Write + test al-calibration.js | 2 hours | Low |
| Write ScoreCalibrationDisclaimer component | 1 hour | Low |
| **Total** | **~9.25 hours** | |

---

## 6. Student-Visible Component: `ScoreCalibrationDisclaimer`

### 6.1 Purpose

Every score prediction in AceLabs is a statistical estimate, not an ADA score. The component makes the confidence level explicit without being alarming or apologetic. Tone: clinical, informational.

### 6.2 Variants

The component takes three props, passed as data attributes:

```html
<div class="al-score-disclaimer"
     data-score="410"
     data-percentile="80"
     data-confidence="beta"
     data-sections-partial="false">
</div>
```

Rendered output (full example):

```
Predicted score 410 · approx 80th percentile · beta calibration
(Anchors based on published concordance data. Not validated against
real DAT score reports yet.)
```

Partial AA example:

```
Estimated AA 390 (4 of 6 sections) · approx 73rd percentile · beta calibration
(PAT and RC not included. Add scores for those sections to improve estimate.)
```

### 6.3 HTML + CSS spec

```html
<!-- Component shell — to be rendered by a small vanilla JS initializer -->
<div class="al-score-disclaimer" role="status" aria-live="polite">
  <span class="al-sd-score"></span>
  <span class="al-sd-sep"> · </span>
  <span class="al-sd-percentile"></span>
  <span class="al-sd-sep"> · </span>
  <span class="al-sd-confidence"></span>
  <span class="al-sd-detail"></span>
</div>
```

```css
.al-score-disclaimer {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 0.75rem;
  color: #5a6470;
  background: #f5f7f9;
  border: 1px solid #d4dae0;
  border-left: 3px solid #7a9bb0;
  border-radius: 4px;
  padding: 0.6rem 0.9rem;
  line-height: 1.55;
  margin-top: 0.75rem;
}

.al-sd-confidence[data-level="beta"] { color: #7a6020; }
.al-sd-confidence[data-level="validated"] { color: #1a5c2a; }
.al-sd-confidence[data-level="unknown"] { color: #8b3030; }

.al-sd-detail {
  display: block;
  font-size: 0.68rem;
  color: #7a8490;
  margin-top: 0.3rem;
}
```

```javascript
// Initializer — called after score is computed
function initScoreDisclaimer(container, { score, percentile, confidence, isPartial, sectionsUsed }) {
  const el = container.querySelector('.al-score-disclaimer');
  if (!el) return;

  const scoreLabel = isPartial
    ? `Estimated score ${score} (${sectionsUsed.length} of 6 sections)`
    : `Predicted score ${score}`;

  const confLabel = confidence === 'validated'
    ? 'validated calibration'
    : confidence === 'beta'
    ? 'beta calibration'
    : 'calibration unknown';

  const detailText = confidence === 'beta'
    ? 'Anchors derived from published concordance data. Not yet validated against real ADA score reports.'
    : confidence === 'validated'
    ? 'Anchors validated against real DAT score reports submitted by beta users.'
    : 'Insufficient data to calibrate this section.';

  el.querySelector('.al-sd-score').textContent = scoreLabel;
  el.querySelector('.al-sd-percentile').textContent = `approx ${percentile}th percentile`;
  const confEl = el.querySelector('.al-sd-confidence');
  confEl.textContent = confLabel;
  confEl.dataset.level = confidence;
  el.querySelector('.al-sd-detail').textContent = detailText;
}
```

### 6.4 Tone constraints

- No comparisons to other DAT prep products.
- No "we tell you the truth" or similar positioning copy.
- No exclamation points.
- Percentile language ("approx Nth percentile") is factual, not celebratory.
- If confidence is 'beta', the detail line states plainly that validation has not happened yet — no hedging language that reads as marketing.

---

## 7. Real-DAT Score Submission — Future Design

### 7.1 Purpose

Voluntary submission of real DAT scores by students who used AceLabs, to allow calibration of the prediction anchors against actual outcomes.

### 7.2 Form design (not yet built)

The form is shown post-mock, or accessible from any score report. Fields:

```
Real DAT score report date: [date picker — month/year only, no day]
Section scores:
  Biology:     [200-600 in 10-pt increments, dropdown]
  Gen Chem:    [200-600, dropdown]
  OChem:       [200-600, dropdown]
  QR:          [200-600, dropdown]
  PAT:         [200-600, dropdown — optional]
  RC:          [200-600, dropdown — optional]
  AA:          [200-600, dropdown]
  SoNS:        [200-600, dropdown]

Which AceLabs mocks did you use? [checkboxes for prometric-mock tests 1-5, bio mock, gc mock, ochem exam-sim, qr sim]

[Submit anonymously] [Cancel]
```

No name, email, or other identifying information collected.

### 7.3 Data structure (localStorage, phase 1)

```javascript
// localStorage key: 'al:realScoreSubmissions'
// Array of:
{
  submittedAt: number,          // Date.now()
  reportPeriod: 'YYYY-MM',      // month/year only
  scores: {
    bio: 410, gc: 390, ochem: 380, qr: 420, pat: null, rc: null,
    aa: 400, sons: 390
  },
  mocksUsed: ['prometric-1', 'prometric-3', 'bio-mock', 'qr-sim'],
  calibrationVersion: '2026-05-06-beta'   // from al-calibration.js export
}
```

### 7.4 Backend sync (phase 2 — design only)

When a backend is available, submissions are POSTed to a `/api/score-submissions` endpoint. The payload is the same object above. The backend stores it in a write-only append table. No user identity is linked.

The calibration team reviews submissions in batches. When a new set of anchors is derived, `CALIBRATION_VERSION` in `al-calibration.js` is bumped, `confidence` values for validated sections are updated to `'validated'`, and stored score records with the old version string are marked as stale in the UI.

### 7.5 Privacy notes for spec compliance

- No PII collected at any phase.
- localStorage data is device-local and user-deletable.
- The backend endpoint, if built, must be receive-only (no read endpoint exposed to client).
- The form must not be pre-filled with any data that could identify the user.

---

## 8. Open Questions and Assumptions

| Question | Current assumption | How to resolve |
|---|---|---|
| Does the ADA publish a per-section scaled score breakdown, or only AA and SoNS? | Only AA and SoNS are on the official score report; per-section scores are internal | Confirm with ADA 2025 score report sample |
| Are QR scores on the same 200-600 scale as science sections? | Yes, same scale and same concordance table | Confirm with student-submitted score reports |
| Is the prometric-mock `scaledScore` anchor table validated? | No — it is the same beta approximation as everything else | First real-DAT submissions will test this |
| Should section offsets be exposed to students? | No — they are an internal calibration detail | Keep in al-calibration.js comments only |
| What happens when a student scores 0% or 100%? | Floor at 200, ceiling at 600 — both are clamped | Already handled by base curve |

---

## 9. File Manifest

| Path | Action | Notes |
|---|---|---|
| `shared/al-calibration.js` | Create | New shared module |
| `specs/calibrated-predictor-spec.md` | Create | This document |
| `tools/qr/index.html` | Modify | Replace `predictDatScore`, add disclaimer |
| `tools/gc/index.html` | Modify | Replace inline predictor, add disclaimer |
| `tools/ochem/index.html` | Modify | Replace `predictScaled` + card template, add disclaimer |
| `tools/bio/bio-mock.html` | Modify | Replace `predictScaled`, update display, add disclaimer |
| `prometric-mock.html` | Modify | Wire per-section `predictScore` calls, update composites |

No new directories required — `shared/` and `specs/` both already exist.
