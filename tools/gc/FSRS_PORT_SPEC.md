# FSRS Port Spec — DAT Gen Chem

**Status:** Draft, for engineer hand-off
**Target file (read-only for this task):** `/Users/thomascordell/Documents/Claude/Projects/AceDAT-AceLabs/tools/gc/index.html`
**Output of this work:** patch the existing `SR` object plus a small surrounding ecosystem (settings hook, migration hook, feature flag). No new files. No build step.
**Algorithm target:** FSRS-5 (current published default as of late 2024; weights below). FSRS-4.5 fallback weight set is included in case 5 is rejected during review.

---

## TL;DR

Replace the SM-2-style scheduler in `tools/gc/index.html` (lines ~4937-4971) with an FSRS DSR scheduler that takes a student-supplied DAT test date as a hard ceiling on review intervals. Keep the public surface (`SR.schedule`, `SR.due`, `SR.state`, `SR.getDuePool`) compatible so the rest of the app does not change. Add a one-time migration from existing SM-2 records, a `gc:meta:testDate` capture in the existing settings/student panel, and a `gc:meta:srAlgorithm` feature flag for rollback.

---

## 1. New per-item data shape

The SR map (still at `localStorage` key `<ns>:sr`, where `<ns>` is `gc-rem-v1` or the per-student namespace) keeps the same outer shape — an object keyed by `probId`. The per-item record is replaced with FSRS DSR fields plus admin fields needed for migration, debugging, and rollback.

Per-item record (FSRS):

- `s` — number — **stability** (days). Time interval at which retrievability is expected to be 90%.
- `d` — number — **difficulty** in `[1, 10]`. FSRS internal difficulty (not the bank's `diff` star rating).
- `due` — number — Unix ms timestamp when this card is next due.
- `lastReview` — number — Unix ms timestamp of the most recent review (used to compute elapsed days for retrievability).
- `reps` — integer — total review count (informational; not used in FSRS math but kept for analytics and the "first review" branch).
- `lapses` — integer — count of `Again` ratings (rating == 1). Used by FSRS post-lapse stability formula.
- `state` — string enum — `'new' | 'learning' | 'review' | 'relearning'`. Determines which FSRS branch fires.
- `lastRating` — integer in `{1,2,3,4}` — most recent rating (Again/Hard/Good/Easy).
- `seed` — string — `'fsrs-v1-init'` for fresh cards, `'fsrs-v1-mig'` for SM-2 migrated cards, `'fsrs-v1-clamped'` if the most recent schedule was clamped by the test-date ceiling. Pure debug aid.
- `_legacy` — object (optional) — only present on migrated records. Holds the pre-migration `{ef, interval, due, reps, lastQ}` so a rollback to SM-2 is lossless. Cleared by the cleanup pass once we're confident in FSRS.

Top-level shape stays `{ <probId>: <itemRecord>, ... }`. No nesting changes; the outer key/format is unchanged so existing `SR.state()` callers keep working.

---

## 2. Default weights for FSRS-5

FSRS is parameterized by `w[0..18]` (FSRS-5 has 19 weights; FSRS-4.5 had 17). Use the published defaults — do not optimize per-user (see Scope, section 10).

**Primary target — FSRS-5 default weights (`w`):**

```
w = [
  0.40255, 1.18385, 3.173, 15.69105,
  7.1949,  0.5345,  1.4604, 0.0046,
  1.54575, 0.1192,  1.01925, 1.9395,
  0.11, 0.29605, 2.2698, 0.2315,
  2.9898, 0.51655, 0.6621
]
```

Constants:

- `DECAY = -0.5`
- `FACTOR = 19/81` (so `Math.pow(0.9, 1/DECAY) - 1 === FACTOR`)
- `requestRetention` (default target retention) = `0.90` — and overridable via `gc:meta:targetRetention` (number in `[0.80, 0.97]`). Out-of-range values fall back to 0.90.

**Fallback — FSRS-4.5 default weights (use if reviewer prefers 4.5):**

```
w_4_5 = [
  0.5701, 1.4436, 4.1386, 10.9355,
  5.1443, 1.2006, 0.8627, 0.0362,
  1.629, 0.1342, 1.0166, 2.1174,
  0.0839, 0.3204, 1.4676, 0.219,
  2.8237
]
```

If using 4.5, drop the two extra short-term-memory weights (`w[17]`, `w[18]`) and the short-term init branch is unused; the difficulty-update formula is the simpler 4.5 form.

Pick one set at implementation time and put the active set behind a single `FSRS_WEIGHTS` constant near the top of the SR module so swapping is a one-line change.

---

## 3. Migration from existing SM-2 state

Trigger the migration once, on first load after the FSRS code ships, gated by a stamp at `<ns>:sr:migratedAt`. Idempotent — running twice is a no-op.

**Per-item conversion:**

For each `(probId, oldRec)` in the existing SR map where `oldRec` has the SM-2 shape `{ef, interval, due, reps, lastQ}`:

1. **If the `probId` is no longer in `BANK_BY_ID`** — drop the record entirely. Log to a `migration.dropped` array on `gc:meta:fsrsMigration` so we can audit. Do not preserve orphans; they'd just rot.
2. **If `oldRec.reps === 0` (never successfully reviewed)** — initialize as fresh:
   - `state = 'new'`, `s = 0`, `d = 0`, `due = now`, `lastReview = 0`, `reps = 0`, `lapses = 0`.
3. **Otherwise** — seed FSRS from SM-2:
   - `s_new = max(0.1, oldRec.interval)` — SM-2's `interval` is days, which is precisely what FSRS stability is measured in. The clamp prevents zero-stability seeds from divide-by-zero in the retrievability formula.
   - `d_new = clamp01to10( 11 - 2 * oldRec.ef )` — SM-2's ease factor maps roughly inverse to FSRS difficulty. EF=2.5 (the SM-2 default) → `d=6`. EF=1.3 (worst) → `d≈8.4`. EF=3.0 (very strong) → `d=5`. The exact mapping has no theoretical basis — it's a heuristic — but it preserves rank order, which is what matters for the first post-migration review.
   - `due_new = oldRec.due` — preserve the existing due date so review scheduling doesn't lurch on migration day.
   - `lastReview = oldRec.due - oldRec.interval * 86400000` (back-compute the implied last-review timestamp).
   - `state = 'review'` (out of learning, into the steady-state branch).
   - `reps = oldRec.reps`, `lapses = 0` (SM-2 didn't track lapses cleanly; start at 0).
   - `lastRating = oldRec.lastQ >= 4 ? 3 : (oldRec.lastQ >= 3 ? 3 : 1)` (SM-2 quality 0–5 collapses into FSRS 1–4: bad → Again, ok → Good).
   - `seed = 'fsrs-v1-mig'`.
   - `_legacy = { ...oldRec }`.

**Handle bank churn:**

- If a `probId` is in the SR map but not in `BANK_BY_ID` (problem retired, slug renamed) — drop with a log entry as in (1).
- If a problem is in the bank but not in the SR map — that's normal (never reviewed); no action.

**Post-migration:** clamp every newly-computed `due` against the test-date ceiling (see section 5). Stamp `<ns>:sr:migratedAt = Date.now()` and write a one-shot summary to `<ns>:sr:migrationLog` `{migratedCount, droppedCount, clampedCount, timestamp}`.

---

## 4. Test-date capture

**Storage key:** `gc:meta:testDate` (NOT student-namespaced — kept at the global meta level, the same level as `gc:meta:version`, since a student's test date is a property of the workspace and should follow them across student-switches if that ever happens; revisit if multi-student support needs per-student dates).

**Stored as:** ISO date string `'YYYY-MM-DD'`. No time component (we treat the test date as a hard 23:59:59 local-time boundary; see clamping rules).

**Capture point:**

- Add a labeled date input in the existing Student modal (`#studentModal`, defined around line 4690 in `index.html`) just under the active-student header. Label: *"Your DAT test date"*. Subtext: *"Used to pace reviews so what you've learned is fresh on test day."*
- Theme: use existing CSS variables — `--paper-2` background, `--line` border, `--gold-d` accent on focus. Match the styling of existing form rows in the modal.
- On change, write to `gc:meta:testDate` and trigger a re-render of the Today card and a re-clamp of all SR `due` values (one pass over `state()`).

**Optional second capture:** an inline banner on the Today page that appears only when no test date is set: *"Set your test date to keep reviews on schedule →"*, linking to the modal. Dismissible (writes `gc:meta:testDateBannerDismissed = true`); reappears once a week if still unset.

**Graceful behavior when not set:**

- Missing or invalid date → `targetDate = null` → scheduler runs with no upper clamp (pure FSRS, intervals capped only at a global `MAX_INTERVAL_DAYS = 365`).
- The Today card shows reviews as before; nothing breaks.
- One subtle UI cue: the existing checkpoint meta dot (`#sbCheckMeta`) shows `retention` normally; with a test date set it shows `retention · Nd` where N is the days remaining. With no test date set, behavior unchanged.

---

## 5. Deadline-aware scheduling

The deadline acts as a hard ceiling on `due` and a soft pressure on the target retention used during interval computation.

**Pseudocode (clamping, per-card after FSRS computes a candidate `due`):**

```
function clampDue(candidateDueMs, lastReviewMs, item, testDateMs, targetRetention=0.90) {
  if (testDateMs == null) {
    // No deadline mode — only the global cap.
    return min(candidateDueMs, lastReviewMs + MAX_INTERVAL_DAYS * DAY_MS);
  }

  const daysToTest = (testDateMs - now) / DAY_MS;

  // Edge: test date is in the past.
  if (daysToTest <= 0) {
    // Stop scheduling new reviews. Mark item as 'post-test' — SR.due() filters these out.
    return TEST_PASSED_SENTINEL;  // a constant > testDateMs; due() treats this as 'never'
  }

  // Edge: test is <3 days out — squeeze every card into the remaining window.
  if (daysToTest < 3) {
    // Linear cram: spread reviews across remaining days, cap interval at floor(daysToTest/2).
    const cramInterval = max(0.5, daysToTest / 2);  // half a day minimum
    return now + cramInterval * DAY_MS;
  }

  // Normal: compute the latest moment at which retrievability would still be >= targetRetention
  // at testDateMs. R(t) = (1 + FACTOR * t/s)^DECAY  where t is days since last review.
  // Solve for the t at which R = targetRetention => t_max = s * ((targetRetention^(1/DECAY)) - 1) / FACTOR.
  // Then the latest *due* is lastReview + t_max, but never beyond testDate.
  const t_max_days = item.s * (Math.pow(targetRetention, 1/DECAY) - 1) / FACTOR;
  const retentionCeiling = lastReviewMs + t_max_days * DAY_MS;
  const deadlineCeiling = testDateMs;
  const ceiling = min(retentionCeiling, deadlineCeiling);

  if (candidateDueMs > ceiling) {
    item.seed = 'fsrs-v1-clamped';
    return ceiling;
  }
  return candidateDueMs;
}
```

**Edge cases (explicit):**

- **After test date passes** — `SR.due()` returns an empty array regardless of internal state. The Today card shows a one-time post-test banner: *"Test date passed. Reviews paused — clear the date or set a new one in your settings."* The internal state is preserved (so a rebooked test can resume), nothing is deleted.
- **Bank shorter than the SR queue** — already handled by the existing `DRILL.start` waterfall (Tier 1 SR-due → Tier 2 attempted → Tier 3 fresh from started skills → Tier 4 anything). FSRS doesn't change this; just make sure `SR.due()` returns a deduplicated array (it already does).
- **Test date <3 days out** — cram mode (above). Every card gets squeezed; no card is scheduled past the test date, even if FSRS would naturally want a 5-day interval. This intentionally over-reviews near the end — that's the right failure mode.
- **Test date set retroactively to the past** — treat as test-passed (return empty due queue).
- **Test date moves forward (rebooked)** — re-clamp pass: iterate every item, recompute its `due` by re-running `clampDue` against the new test date (no re-rating needed — we only relax or tighten the ceiling). Run this on every write to `gc:meta:testDate`.
- **Target retention moves** — same: re-clamp pass.

**Interval boundaries:**

- `MIN_INTERVAL_DAYS = 0` (a card can be due immediately after an `Again` rating)
- `MAX_INTERVAL_DAYS = 365` (global cap, applied even when no test date is set)
- All FSRS-computed intervals are passed through `Math.max(MIN, Math.min(MAX, computed))` and then through `clampDue`.

---

## 6. JS implementation sketch

Replace the `SR` object body. Keep the constant `SR` so external references (`SR.due()`, `SR.schedule(...)`) continue to resolve. Keep this self-contained — no new dependencies, no module system, no async.

**Public API (kept compatible):**

- `SR.state()` → returns the SR map (object keyed by probId). Same contract as today.
- `SR.save(s)` → persists the SR map. Same contract as today.
- `SR.schedule(probId, correct, conf)` → keep this signature for backward compatibility; internally maps `(correct, conf)` to an FSRS rating in `{1,2,3,4}` using the same logic the SM-2 version used (`correct && conf>=4 → 4 (Easy)`, `correct && conf>=3 → 3 (Good)`, `correct → 3 (Good)`, `!correct && conf>=4 → 1 (Again, confidently wrong)`, `!correct → 2 (Hard)`).
- `SR.due()` → array of probIds whose `due <= now` AND whose `due !== TEST_PASSED_SENTINEL` AND whose probId still exists in `BANK_BY_ID`. Same contract.
- `SR.getDuePool()` → array of bank entries. Same contract.

**New internal helpers (not exported, all pure):**

- `_initialStability(rating)` → `Math.max(0.1, w[rating - 1])`
- `_initialDifficulty(rating)` → `clamp01to10(w[4] - Math.exp(w[5] * (rating - 1)) + 1)`
- `_retrievability(elapsedDays, stability)` → `Math.pow(1 + FACTOR * elapsedDays / stability, DECAY)`
- `_nextStabilityOnRecall(d, s, r, rating)` — FSRS-5 success formula using `w[8..16]`.
- `_nextStabilityOnLapse(d, s, r)` — FSRS-5 lapse formula using `w[11..14]`.
- `_nextDifficulty(d, rating)` — FSRS-5 difficulty update using `w[6], w[7]`.
- `_nextInterval(stability, targetRetention)` → days until R reaches target.
- `_clampDue(candidateDueMs, lastReviewMs, item)` — section 5 logic.
- `_migrateOne(oldRec, probId)` — section 3 logic.
- `_migrateAll()` — top-level migration runner; idempotent via `<ns>:sr:migratedAt` stamp.

**New public methods:**

- `SR.migrate()` → idempotent; safe to call on every page load. Internally calls `_migrateAll()`.
- `SR.reclamp()` → re-runs `_clampDue` over every item. Called on test-date change and target-retention change.
- `SR.algorithm()` → returns `'fsrs'` or `'sm2'` based on `gc:meta:srAlgorithm` (default `'fsrs'`). The dispatch is internal: `schedule` and `due` branch on this flag (see section 8).

**Line budget:** the new SR module should fit in <250 lines. The existing SM-2 implementation is ~30 lines; FSRS adds the weights array, ~6 internal helpers (~80 lines), the migration logic (~40 lines), the clamp logic (~30 lines), the rollback dispatch (~20 lines), and the public API (~30 lines). Comment density target: every formula gets a 1-line "what it computes" comment plus a citation to the FSRS spec section.

---

## 7. UI integration points

**Read first:** the existing review/drill/Today flow lives at:
- `SR` definition: `tools/gc/index.html` lines ~4937-4971
- `DRILL` (drill in progress): lines ~15700-15833
- `TODAY` (today's set composer): lines ~15839-16000
- `CHECKPOINT` (retention probes): around line 16620
- Sidebar Today/Checkpoint dots: lines 3316, 3321 (`sbTodayMeta`, `sbCheckMeta`)
- Today card: line 3551 (`#todayCard`)
- Student modal: line ~4683 (`#studentModal`)

**Additive changes only:**

1. **Student modal** — add a labeled date-input row for test date (section 4). Reuses existing modal CSS classes — no new selectors.
2. **Today card subtext** — when a test date is set and `daysToTest <= 14`, prepend a small line: *"`<N>` days to test — reviews are pacing for `<targetRetention*100>`% retention by then."* When `daysToTest <= 3` add the cram-mode notice: *"Cram mode: every card cycles before test day."* Reuse the existing `#todaySub` element so layout doesn't change.
3. **Sidebar `sbCheckMeta`** — already shows `retention` text. Append `· Nd` when test date set; leave as-is otherwise.
4. **Settings/Student modal** — add a small *"Review pacing"* row with two read-only readouts: *Target retention* (e.g., 90%) and *Algorithm* (`FSRS-5` / `SM-2`). Optionally a single "Reset SR" button that triggers `SR.migrate()` to re-run migration from `_legacy` (used only if migration goes sideways). Match the existing modal row pattern (the export/import rows are the closest precedent).
5. **No changes to** `DRILL.start`, `DRILL.startWithPool`, `TODAY.compose`, `TODAY.refresh`, `CHECKPOINT.*`. The contract of `SR.due()` and `SR.schedule()` is preserved, so those modules keep working unmodified.

**Theme conformance:**
- All copy in DM Sans body weight, headings in Playfair Display where surrounding context already uses it.
- Accents: `--gold-d` for in-light-theme accents, `--gold-m` for dark-theme. Borders `--line`. Backgrounds `--paper-2`. No new color tokens.
- No emojis (no decorative, no unicode glyphs like checkmarks/stars in the new copy).
- No payment/financial language anywhere.

---

## 8. Rollback

**Feature flag:** `localStorage` key `gc:meta:srAlgorithm` with values `'fsrs'` (default) or `'sm2'`.

**Dispatch pattern in `SR`:**

```
SR.schedule(probId, correct, conf) {
  const algo = SR.algorithm();
  if (algo === 'sm2') return SR._scheduleSM2(probId, correct, conf);
  return SR._scheduleFSRS(probId, correct, conf);
}
SR.due() { ...same dispatch... }
```

Keep both `_scheduleSM2` and `_scheduleFSRS` resident in the module. The SM-2 implementation is the existing code, copy-pasted into a private method. Cost: ~30 extra lines, kept indefinitely until we trust FSRS.

**Switching to SM-2 (rollback path):**

1. Set `gc:meta:srAlgorithm = 'sm2'`.
2. For every record in the SR map: if `_legacy` is present, restore the SM-2 fields from it (`{ef, interval, due, reps, lastQ}`). Records without `_legacy` (created post-FSRS) are converted: `ef = clamp(2.5, 1.3, 11 - 2*d/2)`, `interval = max(1, round(s))`, `reps = reps`, `lastQ = lastRating === 4 ? 5 : lastRating === 3 ? 4 : lastRating === 2 ? 2 : 1`, `due = due` (same).
3. Clear `<ns>:sr:migratedAt`. (Re-running `SR.migrate()` later would otherwise no-op.)

**Switching back to FSRS:** set the flag to `'fsrs'`, delete `<ns>:sr:migratedAt` to force re-migration, and the next page load handles it.

**Where the toggle lives:** *not in the student-facing UI*. Add a hidden console-only command `window.__SR_setAlgorithm('sm2'|'fsrs')` to reduce surface area for accidental flips. Document this in the spec only — no in-UI button.

---

## 9. Validation tests

A `tools/gc/fsrs-tests.html` (separate single-file test harness, optional but strongly recommended) or inline `console.assert` block should verify:

1. **Identity** — calling `SR.schedule(id, correct=true, conf=5)` on a fresh card sets `state` to `'review'`, `s > 0`, `due > now`. Subsequent `SR.due()` does not include this id until `now >= due`.
2. **Retention at test date** — for any card with `due` set and a test date in the future, the predicted retrievability at test-date midnight is `>= targetRetention` (within floating-point tolerance of 0.5%).
3. **No item past test date** — for every item in `SR.state()`, `due <= testDateMs` (unless `due === TEST_PASSED_SENTINEL`). Fails any time we'd otherwise schedule a card after the test.
4. **Migration preserves first-review timing** — for every SM-2-migrated item, the new FSRS `due` is within ±20% of the old `due` (in days from `lastReview`). This is the user-visible "did review schedule lurch?" check.
5. **Migration is idempotent** — running `_migrateAll()` twice produces the same SR map (deep-equal, modulo `migratedAt` timestamp).
6. **Orphaned items are dropped** — if `BANK_BY_ID` is missing a key that exists in the pre-migration SR map, that key is absent post-migration AND counted in `migrationLog.droppedCount`.
7. **Cram mode bound** — when `daysToTest === 2`, no item gets a `due` more than 1 day out and the smallest interval is `>= 0.5` days. (Avoids the degenerate "due every 5 minutes" case.)
8. **Post-test pause** — when `testDate` is in the past, `SR.due()` returns `[]` regardless of internal state.
9. **Lapse drops stability** — calling `_scheduleFSRS(id, correct=false, conf=...)` on a card with `s = 30` produces a new `s` strictly less than 30 and increments `lapses` by 1.
10. **Difficulty bounds** — across 1000 random rating sequences, `d` always stays in `[1, 10]`. (Catches a sign error in the difficulty update.)
11. **Rollback round-trip** — for any item migrated FSRS → SM-2 → FSRS, the final SR record matches the post-initial-migration record (within the floating-point tolerance), assuming no review happened in between.
12. **Public-API stability** — calling the old SM-2 dispatch (`gc:meta:srAlgorithm = 'sm2'`) on fresh data produces the same `due` values as the original implementation byte-for-byte. (Guards against the rollback path silently drifting.)

Tests run in the browser via a one-time `?fsrsTest=1` URL flag that injects a hidden `<div id="fsrs-tests">` and writes pass/fail counts. No build step.

---

## 10. Scope / non-scope

**In scope:**

- Replace `SR` body with FSRS-5 implementation.
- One-time, idempotent migration from SM-2 records.
- Test-date capture in the Student modal.
- `targetRetention` default 0.90 with a hidden override.
- Feature-flag dispatch for SM-2 fallback.
- 8-12 invariant tests (section 9).
- Spec-conformant copy: no emojis, no payment language, AL theme tokens only.

**Out of scope (do NOT do in this pass):**

- **No FSRS optimizer.** We use the published default weights. No per-user weight training, no telemetry, no upload of review logs anywhere. This is a browser-only deterministic scheduler.
- **No cross-user training.** Reviews never leave the device.
- **Do not touch the other Ace Labs engines.** Bio (Riya), QR, OChem (v1, canonical) keep their existing SR (or lack thereof). If FSRS proves itself in Gen Chem we port it section by section in subsequent specs.
- **Do not redesign the review UI.** No new pages, no new sidebar entries, no new dashboards. The flag, the test-date input, and the small Today/sidebar copy tweaks are the only visible additions.
- **Do not change `DRILL`, `TODAY`, `CHECKPOINT`** beyond what section 7 calls for.
- **Do not switch algorithms based on time of day, week, or any heuristic.** The flag is operator-controlled.
- **Do not delete `_legacy` data automatically.** It stays until we explicitly ship a cleanup pass — that's a separate task.
- **Do not introduce a build step, bundler, npm package, or external script.** Vanilla JS in the existing `<script>` block.
- **Do not ship FSRS-6 or any unreleased variant.** Stay on the published FSRS-5 (or 4.5 if review prefers it).

---

## Implementation order (suggested)

1. Add `FSRS_WEIGHTS`, constants, and pure helpers (`_retrievability`, `_initialStability`, etc.) — no behavior change yet.
2. Add `_scheduleFSRS`, `_dueFSRS`, `_clampDue` behind the flag, default still `'sm2'`.
3. Add `_migrateAll` and run once in dev with the flag flipped manually; verify the 12 invariants.
4. Wire up the test-date input in the student modal.
5. Flip default to `'fsrs'` for new installs (existing installs migrate on next load).
6. Ship; monitor via the `migrationLog`.

**Effort estimate:** see report.
