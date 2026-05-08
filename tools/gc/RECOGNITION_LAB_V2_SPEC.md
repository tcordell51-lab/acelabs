# Recognition Lab v2 — Build Spec

**Scope.** Upgrade `tools/gc/recognition-lab.html` (v1, vanilla JS, 813 lines, single-file) from a fixed-window timed quiz into an adaptive perceptual-learning module (PLM) with adaptive duration, interleaving, predict-before-reveal commit, and mastery retirement with spaced resurrection.

**Out of scope.** New stimuli authoring, framework migration, server sync, accounts. v2 stays single-file vanilla JS, same theme tokens, same `recognition-stimuli.json` shape (with two additive optional fields, see §3).

**Hard constraints.**
- No emojis (decorative or unicode glyphs).
- No payment language.
- AL light + gold + teal theme — reuse existing `--al-*` tokens; no new colors.
- No modifications to `recognition-lab.html` as part of this spec; spec only.

---

## 1. Adaptive duration algorithm

### 1.1 Goal

Replace the per-stimulus `timeLimitMs` from v1 (currently 7000–11000ms) with a per-user, per-pattern-class **window** that contracts as fluency builds (Kellman/Massey PLM) and expands on regression. The window is the **commit deadline** — the time the student has to lock in an answer.

### 1.2 Per-pattern parameters

The window is governed at the **topic** (pattern class) level, not the individual stimulus. A new top-level config object `RL_ADAPTIVE_DEFAULTS` lives in the page script:

| Topic | Initial (ms) | Floor (ms) | Ceiling (ms) | Cold-start trials |
|---|---|---|---|---|
| Reaction Coordinate | 10000 | 3500 | 12000 | 3 |
| Kinetics Order | 9000 | 3000 | 11000 | 3 |
| Linearized Kinetics | 8500 | 2800 | 10000 | 3 |
| Q vs K | 9000 | 3000 | 11000 | 3 |
| VSEPR | 8000 | 2500 | 10000 | 3 |
| Lewis Validity | 11000 | 4500 | 13000 | 3 |
| Periodic Trends | 9000 | 3000 | 11000 | 3 |
| Dominant IMF | 9000 | 3500 | 11000 | 3 |
| Hybridization | 8500 | 3000 | 10500 | 3 |
| Phase Diagram | 9000 | 3500 | 11000 | 3 |
| Titration Curve | 10000 | 4000 | 12000 | 3 |
| Buffer Region | 10000 | 4000 | 12000 | 3 |
| Galvanic Cell | 11000 | 4500 | 13000 | 3 |
| Heating Curve | 9500 | 3500 | 11000 | 3 |
| Nuclear Decay | 9500 | 3500 | 11000 | 3 |

Values were chosen by anchoring **Initial** ~15% above v1's max and **Floor** at roughly 30–40% of v1 — this aligns with PLM literature (mature recognizers complete classification at 1.5–4 s for chart shapes; novices need 8–12 s).

Per-stimulus `timeLimitMs` in the manifest is now **ignored at runtime** (kept for backwards compat with v1 fallback path; see §8). Authors instead annotate stimuli with an optional `difficulty: "easy" | "standard" | "hard"` (default `"standard"`); the runtime applies a stimulus-level multiplier (easy ×0.85, standard ×1.0, hard ×1.15) **on top of** the per-topic window when rendering.

### 1.3 Window state machine (per topic, per user)

Stored under `gc:reco:adaptive` (§6). Each topic has:

```
{
  window: <ms>,             // current effective window
  streakCorrectFast: <int>, // correct AND ms < window/2, consecutive
  streakWrongOrSlow: <int>, // wrong OR ms > window*0.95, consecutive
  attempts: [...],          // see §6
}
```

### 1.4 Contraction rule

After a trial completes (commit OR timeout):

1. If `attempts.length < cold-start trials (3)` → **no contraction or expansion**. Just record. The runtime uses `Initial` for these trials.
2. Else if **correct AND ms < window / 2** → increment `streakCorrectFast`, reset `streakWrongOrSlow`. If `streakCorrectFast >= 3`:
   - `window = max(floor, round(window * 0.85))` (15% contraction)
   - `streakCorrectFast = 0`
3. Else if **wrong OR ms > window × 0.95** → increment `streakWrongOrSlow`, reset `streakCorrectFast`. If `streakWrongOrSlow >= 2`:
   - `window = min(ceiling, round(window * 1.20))` (20% expansion — recovery is faster than contraction so a single bad streak fully resets the contraction since)
   - `streakWrongOrSlow = 0`
4. Else (correct but slow, or any other case) → reset both streaks; window unchanged.

Asymmetric rates (15% down, 20% up) are intentional: PLM literature and practical UX both favor "earn fast, give back fast on wobble" so that students who regress aren't punished by a long climb back to comfortable speed.

### 1.5 Cold-start

Three protected trials per topic. During cold-start the runtime:
- Uses `Initial` window.
- Records attempts but does **not** mutate `window` or streaks.
- Does **not** mark stimuli as retired (§5).

After 3 trials the state machine activates.

### 1.6 v1 → v2 cold-start bootstrap

If v1 mastery data exists (`gc:reco:mastery` keyed by topic with `attempts: [{correct, ms}]`), seed the v2 window for that topic from the v1 rolling stats — see §6.2.

---

## 2. Interleaving rule

### 2.1 Goal

Within a single round (20 mixed / 10 topic / 10 weakness), no two consecutive items share a topic, and topic recency is dampened across longer windows so the same topic doesn't appear every other slot.

### 2.2 Algorithm — weighted random with recency penalty

At round build time, after sampling a candidate pool:

1. Build the candidate pool the same way v1 does (mixed = full bank shuffled; topic = single-topic; weakness = top weak topics).
2. Compute a **per-stimulus weight**:
   - Base weight 1.0.
   - For each of the **last 3 placed items** in the queue, if its topic matches this candidate's topic, multiply weight by 0.0 (slot 1 prior, immediate adjacency), 0.25 (slot 2), 0.6 (slot 3). Beyond the 3rd back, no penalty.
   - If a topic has been retired (§5), its stimuli have weight 0 unless **resurrection-due** (§5.4); a due stimulus gets weight ×1.5.
3. Sample from the weighted pool (without replacement) until the round size is filled.
4. **Strict no-adjacent-duplicate guarantee:** after sampling, do a single linear pass; if `queue[i].topic === queue[i-1].topic`, swap `queue[i]` with the nearest later item whose topic differs from both `queue[i-1]` and `queue[i+1]`. If no swap target exists (because remaining pool is monotopic), accept the duplicate — see fallback.

### 2.3 Fallback when pool is monotopic

Topic-mode rounds (Mode 2) are intentionally monotopic: the no-adjacent rule does not apply. Topic mode is exempt and clearly labeled in the UI ("Topic drill — no interleaving").

For mixed/weakness rounds where fewer topics than slots remain (e.g., the weakness drill targeted only 2 topics and a third drained), accept up to one same-topic adjacency per round before relaxing the rule for the rest.

---

## 3. Variability injection

### 3.1 Goal

Each pattern class needs 8–15 surface-different exemplars to drive schema formation (Bjork). v1 has 3–10 per pattern; some thin (Q-vs-K = 3, Buffer Region = 3, Galvanic Cell = 3, Linearized Kinetics = 3). Rather than hand-author 5× more SVGs, v2 introduces **runtime variant fields** that perturb non-diagnostic surface dimensions of an existing SVG without altering the answer.

### 3.2 Manifest extension (additive)

Two new optional fields per stimulus:

```json
{
  "id": "qk-1",
  "topic": "Q vs K",
  "stimulus": "<svg ...>",
  "variants": {
    "barWidthPx":      [22, 28, 34],
    "barColorOrder":   ["gold-then-teal", "teal-then-gold"],
    "labelSwap":       ["AB", "XY", "PQ"]
  },
  "variantTargets": {
    "barWidthPx":    "rect.bar",
    "barColorOrder": "g.bars",
    "labelSwap":     "text.species-label"
  }
}
```

`variants` is the menu of values; `variantTargets` is the CSS selector inside the inline SVG that the runtime should mutate. Both fields are optional; absence falls back to v1 behavior (render SVG as-is).

### 3.3 Variant dimensions per pattern class

The author backlog is to add `variants` to existing stimuli with these dimensions. **Surface dimensions only — never anything that could change the correct answer.**

| Pattern class | Variant dimensions (2–4 each) |
|---|---|
| Reaction Coordinate | substrate label (R/P, A/B, X/Y), x-axis tick density, gold vs teal trace color, slight horizontal compression (0.85×–1.15×) |
| Kinetics Order | y-axis label ([A], [B], [X]), trace color, time-axis units label (s, min, h) |
| Linearized Kinetics | y-axis label species, trace color, gridline on/off |
| Q vs K | bar widths, color order (gold-leading vs teal-leading), species labels, axis-baseline gap |
| VSEPR | rotation (0 / 90 / 180 / 270), central atom color (teal-d / gc / gold-d), peripheral-atom label letter (X, Y, A) |
| Lewis Validity | atom labels (within element class), bond rotation, lone-pair dot offset (±2px) |
| Periodic Trends | period bar color, arrow weight, axis tick label step |
| Dominant IMF | molecular label (within IMF class), structure rotation, trace color |
| Hybridization | rotation, atom label letters, bond color |
| Phase Diagram | color of phase regions (within AL palette), tick-mark density, T/P axis label units |
| Titration Curve | y-axis pH gridline density, trace color, baseline color |
| Buffer Region | shaded buffer band color (gold-bg / teal-3 light), axis tick density, trace label |
| Galvanic Cell | electrode label letters, salt-bridge color, electron-flow arrow weight |
| Heating Curve | x-axis units (s vs min), trace color, plateau gridline on/off |
| Nuclear Decay | parent/daughter label letters, decay arrow color, axis tick density |

### 3.4 Runtime variant selection

When `renderQuestion()` builds the stimulus:

1. Inject the raw SVG (as v1 does).
2. If `variants` present: for each variant key, pick one value with a per-stimulus deterministic seed (`hash(stimulusId + roundIndex + qIdx)`) so that within a round the same item renders consistently if revisited (won't be — strict forward queue — but the determinism makes debugging tractable).
3. Resolve `variantTargets[key]` against the inserted SVG (`elStimulus.querySelectorAll(selector)`) and apply:
   - For `barWidthPx`-style numeric → set the matching attribute (`width`, `stroke-width`, etc.) — the convention is **the variant key name encodes the attribute it targets**; see implementation note.
   - For color-order strings → look up two AL token CSS values and apply via `fill`/`stroke`.
   - For label strings → set `textContent` of the matched node(s).
4. Variants do **not** alter `correct`, `options`, `why`, or `diag`.

**Implementation note.** Add a small `RL_VARIANT_HANDLERS` lookup table in the page script keyed by variant-key name → `(elements, value) => void`. This keeps SVGs author-friendly: authors annotate selectors and value menus, the runtime knows how to apply each named dimension.

### 3.5 Fallback if a stimulus has no `variants`

Render exactly as v1. No surprises for older stimuli.

---

## 4. Predict-before-reveal pattern

### 4.1 Three options

(a) **Hard commit-by-tap.** Student must tap an answer (or press 1–4) before the window closes. Timeout = no commit = marked wrong.

(b) **Soft auto-reveal.** At timeout, the correct answer is shown; no penalty beyond the latency record (which already drives mastery).

(c) **Hybrid — locked-then-options.** First 60% of the window: keys 1–4 are armed but options visible (commit-only). Last 40%: a "Show options" button appears that reveals the answer **for half-credit** if pressed; otherwise still commit-required, and a no-press timeout = wrong.

### 4.2 Recommendation: (a) Hard commit-by-tap.

**Why (a).**

1. **Predict-before-reveal is the lever.** The whole reason v2 exists is to force the student to *commit* to a recognition before the diagram explains itself. Option (b) lets the student wait the timer out and read the reveal — which produces the wrong learning signal (passive recognition memory, not active retrieval). PLM and testing-effect literature both depend on commitment.
2. **Simpler UX, fewer states.** v1's UI is already dense. (c) introduces a mid-trial state change (button appearing) that fights the AL clean-card aesthetic and forces students to track two clocks.
3. **Safety net is already built.** Window expansion (§1.4) protects students who genuinely can't keep up — two slow trials in a row push the window back up by 20%. So "punishing" timeouts as wrong doesn't trap students; it adapts.
4. **Cold-start is already gentle.** First 3 trials per topic have the longest window. Students aren't beaten up before the algorithm has data.

**Copy for the lockout.** When the timer expires with no commit:

> Time. Marked wrong — but only because no answer was committed. Your window for this pattern stretches if this happens again.

(Plain language. No emojis, no payment language, no scolding.)

### 4.3 Anti-thrash safeguard

Implement a minimum 250ms delay between rendering options and accepting input, to prevent accidental same-key carryover from the previous trial's reveal screen.

---

## 5. Mastery retirement

### 5.1 Threshold

A stimulus is **retired** when it has been answered **at least 8 times** AND, over the **last 8 attempts**:

- Accuracy ≥ 90% (i.e., ≥7/8 correct), AND
- Median RT < (topic floor + 500ms).

Retirement is per-stimulus, not per-topic — the schema is what masters, but retirement at the stimulus level keeps low-quality stimuli from being treated as conquered while high-quality ones still drill.

### 5.2 Retirement effect

Retired stimuli leave the active sampling pool. They are **not deleted**. The page must surface a "retired count" per topic in the UI (§7).

### 5.3 Resurrection schedule

Retired stimuli are scheduled for resurrection at fixed intervals from retirement timestamp:

- **Pass 1:** retirement + 7 days
- **Pass 2:** retirement + 14 days (after pass-1 success)
- **Pass 3:** retirement + 30 days (after pass-2 success)
- **Pass 4 and beyond:** +60 days each, capped (no further extension).

A resurrection trial is a single trial inserted into the next round's queue (§2.2: due retired items get weight ×1.5 in the candidate pool). If the student answers it correctly within the topic's current floor + 500ms, the resurrection passes and the next interval applies. Otherwise the stimulus is **un-retired** entirely and re-enters normal rotation; its retirement counter resets.

### 5.4 FSRS note

If/when FSRS lands in a shared module, swap the fixed 7/14/30/60 ladder for FSRS scheduling. Spec uses fixed ladders for now to ship without that dependency. The data shape (§6) already records `retiredAt`, `lastResurrected`, `passCount` so FSRS migration is a state-only change.

### 5.5 What if all stimuli in a topic are retired?

The topic drops out of weakness-mode candidates and out of mixed-mode unless a resurrection is due. In topic mode, picking a fully-retired topic surfaces a banner: "All stimuli for this topic are in spaced review. Next review available in N days." Plus an "override and drill anyway" link that runs them as non-counting practice (no retirement-state mutation).

---

## 6. Per-user data shape (localStorage)

### 6.1 New key: `gc:reco:adaptive`

```json
{
  "Reaction Coordinate": {
    "window": 7800,
    "streakCorrectFast": 1,
    "streakWrongOrSlow": 0,
    "attempts": [
      { "stimulusId": "rxc-1", "correct": true,  "ms": 4200, "ts": 1746500000000 },
      { "stimulusId": "rxc-3", "correct": false, "ms": 9100, "ts": 1746500120000 }
    ],
    "retired": {
      "rxc-2": { "retiredAt": 1746480000000, "passCount": 0, "due": 1747084800000, "lastResurrected": null }
    }
  },
  "VSEPR": { "...": "..." }
}
```

`attempts` is bounded to last 50 per topic (matches v1 `ROLLING_N`). `retired` is keyed by stimulusId.

### 6.2 Existing keys

- `gc:reco:history` — keep as v1, untouched. v2 still appends round records.
- `gc:reco:mastery` — keep as v1 for read compatibility; v2 writes to it as well so a v2 → v1 rollback is non-destructive. The truth-of-record for v2 is `gc:reco:adaptive`.

### 6.3 Migration / cold-start bootstrap

On v2 boot:

1. Read existing `gc:reco:adaptive`. If present and shape-valid → use it.
2. Else read `gc:reco:mastery`. For each topic with ≥3 attempts:
   - Compute v1 median RT. Map to a starting window: `seedWindow = clamp(median + 1500, floor, ceiling)`. The +1500ms cushion prevents an immediately-tight window from a sample of fast-but-noisy v1 trials.
   - Set `streakCorrectFast = 0`, `streakWrongOrSlow = 0`, `attempts = []` (do **not** copy v1 attempts forward; they don't have stimulusId in usable form).
3. Topics absent from v1 mastery → use `Initial` from §1.2 and full cold-start.
4. Bump `gc:meta:version` to `'2'`. (v1 sets it to `'1'` on first load; v2 only migrates if version is `'1'` or absent.)

Migration is one-way. If a student loads v1 again after v2, v2's adaptive key is ignored by v1 (v1 doesn't know it exists), and v1's writes to `gc:reco:mastery` will be re-bootstrapped on next v2 load — but only if `gc:reco:adaptive` was somehow cleared. Otherwise v2 prefers its own state.

---

## 7. UI changes from v1

Additive only. No layout overhaul.

### 7.1 Per-pattern fluency indicator

On the **drill view header**, replace the v1 progress pill `Question 3 of 20` with a two-pill row:

- Left pill (existing): `Question 3 of 20`.
- Right pill (new): `Fluency · <topic-shortcode> · 7/10` — where the integer is `floor(10 * (1 - (window - floor) / (initial - floor)))`, clamped to 0–10. So a window at floor reads 10/10; at initial reads 0/10. Updates every render.

Style: same `.rl-progress-pill` chrome, with the integer in `--al-gold-d`.

### 7.2 Retired-set badge

On the **summary view** per-topic table (`#rlSumTable`), add a 5th column: **Retired** — `2 / 5` (retired / total in topic). Numeric, no badges, no glyphs. Color-treat the cell when retired ≥ 50% of topic with the existing `.acc.high` class (gold-d).

### 7.3 Predict-before-reveal lockout copy

When timeout fires with no commit, populate the existing `.rl-reveal` panel with the §4.2 copy under a `Trap` label (reuse the existing `.miscon` style). No new DOM nodes, no new colors.

### 7.4 Cold-start banner

In the drill view, if the **current topic** is in cold-start (attempts < 3), show a one-line banner above the card:

> Calibrating · 3 trials before the timer adapts.

Style: same `.rl-progress-pill` shrunk, full-width, `--al-ink-mute` text.

### 7.5 Mode card (intro view)

Mode 2 ("Topic drill") subcopy gets an addendum: `(no interleaving)`. Mode 3 ("Weakness drill") subcopy adds: `Adapts to your fluency.` Otherwise mode cards unchanged.

### 7.6 What is **not** added

- No per-stimulus difficulty badges.
- No "retired" pill on a stimulus during the drill (would tip off the answer).
- No window-in-ms display.
- No new top-nav entry. Same `recognition-lab.html` URL.

---

## 8. Backwards compatibility

### 8.1 v1 localStorage on first v2 load

- `gc:reco:history` present → keep, append.
- `gc:reco:mastery` present → use for §6.3 cold-start bootstrap.
- `gc:meta:version === '1'` or absent → run migration, then write `'2'`.
- `gc:reco:adaptive` absent → build from §6.3 step 2 (or §6.3 step 3 for unseen topics).

No reset, no prompt to the student, no banner. Migration runs silently on boot before the intro view paints.

### 8.2 Rolled-back student (v2 → v1)

If a student opens v1 after using v2, v1 ignores `gc:reco:adaptive`. v1 still reads `gc:reco:mastery` which v2 has been keeping current. The student's v1 weakness drill works as before. Resuming v2 then re-reads `gc:reco:adaptive` (still present) — the v2 timeline is preserved.

### 8.3 v1 stimuli without `variants` / `difficulty`

Render as v1. Apply default `standard` multiplier (1.0×) on the topic window.

### 8.4 v1 stimuli with `timeLimitMs`

Ignore at runtime; topic window governs. Field stays in the manifest for backwards compat and as authoring guidance.

### 8.5 Corrupt v2 state

If `JSON.parse(gc:reco:adaptive)` throws or shape-validates badly → quarantine to `gc:reco:adaptive:corrupt:<ts>` and rebootstrap from v1 mastery as if first v2 load. Do not lose data; do not prompt the student.

---

## 9. Implementation notes (non-binding)

- The page stays a single HTML file. New JS lives in the existing IIFE.
- New constants near the top: `ADAPTIVE_KEY = 'gc:reco:adaptive'`, `RL_ADAPTIVE_DEFAULTS` (§1.2), `RL_VARIANT_HANDLERS` (§3.4), `RETIREMENT_LADDER = [7, 14, 30, 60]` (days).
- New helpers: `loadAdaptive()`, `saveAdaptive()`, `migrateFromV1()`, `windowFor(topic, stim)`, `recordAttempt(topic, stim, correct, ms)`, `applyVariants(svgRoot, stim, seed)`, `pickQueueWithInterleave(pool, n)`, `dueResurrections(topic, now)`.
- `renderQuestion()` changes: read window from adaptive state instead of `stim.timeLimitMs`; apply variants after innerHTML; render fluency pill and cold-start banner.
- `onAnswer()` changes: after recording the result, call the state machine (§1.4) and the retirement check (§5.1) before advancing.
- Theme: only existing `--al-*` tokens. No new CSS variables. Fluency pill uses `--al-gold-d`. Retired-cell highlight uses `.acc.high`. Cold-start banner uses `--al-ink-mute`. Lockout copy uses `--al-needs-review`.

---

## 10. Open questions for the next iteration

- Should the fluency pill animate when the window contracts (small flash)? Default: no — silent adaptation is less stress.
- Should "Mode 4 — Resurrection drill" surface explicitly (a round of only due retirements)? Default: no for v2, fold into mixed via weight ×1.5 (§2.2). Revisit after live data.
- Should difficulty multiplier be authored or auto-fit from per-stimulus accuracy across all users? Out of scope without server.
- FSRS parameters when ported: hold for shared module.
