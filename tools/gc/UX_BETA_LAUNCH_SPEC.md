# GC Engine · UX Beta Launch Spec

Combined build spec for three pre-launch passes against the Gen Chem engine and its companion pages:

1. Anxiety-aware copy pass
2. Mobile audit
3. Service-worker / offline pass

This is a **specification**, not implementation. No HTML/JS is modified by adopting this doc. Read [ANXIETY_AWARE_DESIGN.md](../../ANXIETY_AWARE_DESIGN.md) first — it defines the architectural moves (Stuck Triage, Confidence Ratings, No-Timer-Until-Floor, Identity Hero, End-on-a-Win) that this pass extends with copy + mobile + offline polish.

## Files in scope

| Surface | Path | Lines | Notes |
|---|---|---|---|
| Engine (single-file SPA) | `tools/gc/index.html` | ~18,579 | Houses BANK, SIM, PACE, DRILL, LOCKMOD, STUCK, IMF/VSEPR/HB/ION quizzes |
| Traps library | `tools/gc/traps.html` | 529 | Misconception filter/search; renders `wrongChoiceText` |
| Recognition lab | `tools/gc/recognition-lab.html` | 813 | Hard 8s timer per stim, auto-fail on timeout |
| Periodic trends | `tools/gc/trends.html` | 1387 | "Pick the higher" drill with countdown bar |
| Lewis sandbox | `tools/gc/lewis-sandbox.html` | 1386 | Five sequential stages; hint-based feedback |
| Parent landing | `ace-labs.html` | 263 | Shared frame; viewport sets the precedent |

## Hard project constraints (re-stated)

- No emojis: no decorative, no unicode glyphs (`✓`, `⚠`, `★`, `🔥`, etc.). Replace with text or AL-themed SVG marks.
- No payment language anywhere students can see (no `$`, `paid`, `package`, `installment`, `balance`).
- Match the AL theme: light parchment, gold (`var(--gold)`/`var(--gold-d)`), teal (`var(--teal)`).
- This pass is spec-only. Implementation lands in a separate PR.

---

# Part A · Anxiety-Aware Copy Pass

Grounded in Beilock & Carr / DeCaro on stress-induced choking, Yeager/Dweck on growth-mindset framing, and SDT on informational vs. controlling feedback. The engine already has the right *architecture* (Stuck modal at line ~14750, LOCKMOD at line ~14422, confidence captures, no-timer foundations). What it doesn't have is uniformly diagnostic, non-evaluative *copy*.

## A1. Find-and-replace inventory (15 pairs)

Each row: file (line if pinned) · find phrase · replace phrase · rationale (one sentence).

| # | Surface (file:line) | Find | Replace | Rationale |
|---|---|---|---|---|
| 1 | `index.html` ~13626 | `Pick an answer first.` (alert) | `No answer locked in yet — choose one and we'll walk through it together.` | Removes the imperative tone; reframes as a guided next step rather than a correction. |
| 2 | `index.html` ~15004 | `Tier locked. Complete the previous tier with 80% accuracy first.` | `Next tier opens once you're at 80% on this one. Run a few more — you're closer than the bar suggests.` | Replaces gating language ("locked"/"complete") with progress framing; SDT-informational. |
| 3 | `index.html` ~15797 | `Drill complete · {n}-day streak.` (alert + 🔥) | `Drill done for today. {n}-day rhythm — see you tomorrow.` | Drops emoji, reframes streak as "rhythm" (process language), and replaces the celebratory `complete` flash with calm closure. |
| 4 | `index.html` ~15798 | `Done for today.` / `Streak: {n} days. Come back tomorrow.` | `That's a wrap on today. {n}-day rhythm. Tomorrow's queue is already lining up.` | Removes the directive `Come back`; signals continuity, not obligation. |
| 5 | `index.html` ~15404 | `Mock complete.` (large H3) | `You finished the mock. Let's look at it.` | Replaces evaluative finality with collaborative review framing — primes the student to engage with the breakdown rather than fixate on the score. |
| 6 | `index.html` ~15426 | `Your answer: {opts[chosen]}` (red) + `Correct: {opts[correct]}` (green) | `What you picked: {opts[chosen]}` + `Where it lands: {opts[correct]}` | Drops the binary correct/your-answer evaluative pair; frames as positions on a problem, not verdicts. |
| 7 | `index.html` ~5080-onward (BANK `diag`) | Single-word diagnoses: `"Wrong."`, `"Wrong sign."`, `"Wrong arith."`, `"Off."`, `"Reversed."` | Replace each with the *misconception* it represents (e.g. `"Sign flipped — check whether the reaction is exo or endo."`, `"Computation error in the last division — redo with the molar mass."`, `"Direction reversed — re-read the prompt's `low → high`."`) | The QBANK_AUDIT already flags these dozens of bare-`"Wrong."` diags. They violate Yeager/Dweck — the student learns nothing from "Wrong." Each needs the *concept* attached. (Treat as a bulk pass; ~30 entries flagged in QBANK_AUDIT.md.) |
| 8 | `recognition-lab.html` ~677 | `Timed out — read the cue first, decide second.` | `Time ran out — that's a recognition signal, not a verdict. Same cue next round, slower.` | Hard timeouts trigger anxiety spirals; reframe as a diagnostic about cue-reading speed, not failure. |
| 9 | `recognition-lab.html` ~975 (and similar) | `Almost. Double-check each bond order.` | `Close — one bond is off. Walk back from the central atom's octet.` | "Almost" is hedge-praise; the replacement is informational and points to the next move. |
| 10 | `trends.html` ~1092 | `<strong>Time.</strong>` / `<strong>Not quite.</strong>` | `<strong>Clock ran.</strong>` / `<strong>Let's look at this one.</strong>` | "Not quite" is the canonical Yeager replacement target; "Time." reads as buzzer-style judgment. |
| 11 | `traps.html` ~245 | `The misconceptions behind every wrong choice.` (H1) | `The misconceptions behind every distractor.` | "Wrong choice" is the student's identity; "distractor" is the test-writer's instrument. Subtle but the student feels the difference. |
| 12 | `traps.html` ~396 / 186 | `Trap` chip on red `wrong`-styled choice | Keep the `Trap` label (it's already non-judgmental about the *student*). Verify no `incorrect`/`wrong choice` copy bleeds into the description. | Already OK — call out so it's *not* swept up in the global rename. |
| 13 | `index.html` ~4452 | `40 questions. DAT pace. No breaks. Predicted scaled score at the end. Don't take this until your pacing ladder is at 60s/Q across most patterns — otherwise it'll just rattle you.` | `40 questions at DAT pace. We hold the score until you've reviewed every miss. Take this once your pacing ladder is at 60s/Q — earlier just trains anxiety, not pace.` | Same content, but (a) signals the score-staging from A3, and (b) replaces "rattle you" with the pedagogical reason. |
| 14 | `index.html` ~3396 / ~3558 / sidebar | `🔥 0d` / `🔥` flame for streak | Text-only `n-day rhythm` + small gold dot SVG (`var(--gold-d)`); see A4 for the full streak language overhaul | Honors the no-emoji rule; drops loss-aversion framing of "fire going out". |
| 15 | `index.html` ~14431 | `<div class="stat">${done?'✓':'?'}</div>` in LOCKMOD prereqs | Replace `✓` with text `done` in a small AL-gold pill; `?` with `not yet` in muted ink. | Glyphs banned per project memory; text reads more humanly anyway. |
| 16 | `lewis-sandbox.html` ~438 | `Every wrong answer surfaces a concept hint instead of a stub.` | `Every miss surfaces a concept hint, not a stub.` | "Miss" is process; "wrong answer" is identity. |
| 17 | `index.html` ~15081 | `Below 80%. Practice more at the current tier; come back when you're solid.` | `You're under 80% on this tier. The shape of the misses is the signal — review them and run again.` | Removes the imperative; points the student at the diagnostic surface rather than telling them to go away. |

That's 17 — five over the floor, deliberately, because the BANK `diag` pass (row 7) is the highest-impact and the streak overhaul (row 14) needs both a copy *and* a glyph fix.

## A2. Timer policy

Inventory of every countdown surface:

| Surface | File:line | Today's behavior | Recommendation | Rationale |
|---|---|---|---|---|
| Mock global timer | `index.html` ~15235, ~15281 | Always-visible `MM:SS left` next to a clock glyph | **(b) Toggleable, default ON for first run, persistent toggle thereafter.** Keep the visible state for students explicitly running a timed simulation; expose a "Hide clock" toggle inside the mock UI; remember the choice in `gc:ui:mockClock`. | Anxiety-prone students benefit from the option; calibrating students need it on. Sticky-toggle respects autonomy without breaking diagnostic value. |
| Pacing ladder per-Q timer | `index.html` ~15036, ~15045 | Inline countdown `{n}s`, turns red ≤5s | **(c) Hidden until late warning.** Show only when ≤10 s remain on a tier ≥ 60s/Q; show full countdown at higher tiers as student approaches DAT pace. | The ladder's pedagogy is incremental tightening; making the timer omnipresent at every tier conflicts with the "no time pressure on unmastered material" principle. |
| Recognition lab countdown bar | `recognition-lab.html` ~346, ~620–633 | 8 s bar, warns at 75% elapsed, hard timeout = wrong | **(b) Toggleable, default ON, but timeout becomes "no answer locked in" rather than counted as wrong.** Add a "Practice mode (no timer)" toggle that surfaces every 25 stims if accuracy < 60%. | The lab is *built* for time-pressured pattern recognition; turning it off destroys the drill. But the auto-fail wording is the choking trigger — split the timer presence from the punishment. |
| Trends drill countdown | `trends.html` ~293, ~1056 | 4–5 s countdown bar, timeout counted as wrong | **(b) Toggleable, default ON, with same "Practice mode" gate as recognition lab.** | Same logic — pattern-recognition drills need pressure to mean anything; let the student opt into untimed retries. |
| Diagnostic | `index.html` ~14524 | No timer (already correct) | (no change) | Already aligned with A2 — diagnostic is identity-safe. |
| Stuck-modal breath box | `index.html` ~14834 | 60s box-breathing timer; not anxiety-evaluative | (no change) | This is a *settle* timer, not a *score* timer. Out of scope. |

**Summary:** the engine has 4 evaluative timers. Two go to **toggleable-default-on** (mock, recognition), one goes to **late-warning-only** (pacing ladder mid-tiers), one is fine. No timer should be removed outright — that breaks the pedagogy.

## A3. Score-reveal staging

Today, `SIM.finish()` (~line 15402) immediately renders: predicted scaled score → topic breakdown → wrong-answer review. The student sees the number before processing the misses. Beilock & Carr / DeCaro: this maximizes evaluative-threat priming for the next run.

**Proposed staging — three reveal cards, student-paced:**

1. **Card 1: "Walk through your misses."** Renders the per-question review (current bottom of the screen) at the top, with no score. Continue button: `I've looked at each one`.
2. **Card 2: Per-topic breakdown.** Renders the topic-strength grid (already built). Continue button: `Show the score`.
3. **Card 3: Predicted score + percentile.** Renders the existing scaled-score tile + percentile note. The "Take another" CTA lives here.

State: store the active reveal stage in `SIM._state.reveal = 1|2|3`; default 1 on `finish()`. Add a `Skip to score` link on Card 1 for students who want the old behavior. Persist last-used preference per student (`gc:ui:scoreReveal = staged|immediate`).

**Surfaces this applies to:**

- `SIM.finish` mock-result card (`index.html` ~15402) — primary target.
- `PACE.finish` ("Pacing run complete", line ~15077) — apply a *lighter* version: reveal "what you missed" before "{X} of {Y}; threshold cleared/not cleared".
- Recognition-lab `finishRound` (`recognition-lab.html`) — already shows misconceptions per-question; add a "summary" gate before the round-total tile.
- Trends drill `finishDrill` (`trends.html` ~1106) — add per-trend breakdown *before* the score line.

**Not staged:** in-flow `imf-card`, `ion-opt`, `vp-quiz-opt` reveals — these are immediate-feedback drills by design and staging would break flow.

## A4. Streak / loss-aversion check

Inventory:

| Surface | File:line | Today |
|---|---|---|
| Sidebar streak chip (flame + Nd) | `index.html` ~3396 | `🔥 0d`, animated flame |
| Today-streak hero pill | `index.html` ~3558, CSS ~2810 | `🔥` + N + "day streak" label |
| Drill completion alert | `index.html` ~15797 | `Drill complete · {n}-day streak.` |
| Drill-done card | `index.html` ~15798 | `Streak: {n} days. Come back tomorrow.` |
| Insights tile | `index.html` ~15568 | `{n} 🔥` "Day streak" |
| Insights narrative | `index.html` ~15691 | `{n}-day streak 🔥 — daily drill is the single highest-leverage habit. Keep it.` |
| Ion drill / drill home | `index.html` ~4188, ~4506 | "Streak: 0" / "Streak: 0 days" copy |

**Issues:**

1. Emoji glyphs (`🔥`) violate the project rule — must come out everywhere.
2. The phrasing is *loss-aversion-shaped*: "streak" implies "if you miss a day, you broke it". That's the Duolingo trap. Yeager/Dweck-aligned alternative is *consistency framing*, with a built-in **freeze day**.

**Proposed model:**

- Rename `streak` (visible label) to `rhythm` everywhere. Internal storage key (`drill:streak`) can stay; only UI copy changes.
- Add a `drill:freezeDays` integer (default 1 per 7 days, capped at 2 in the bank). When a student misses a day, the app silently spends a freeze before resetting. Surface this as: `Day skipped — freeze used. Rhythm continues.` (toast, not modal.)
- When freezes run out and rhythm resets, the message is **never** "You lost your streak." It is `New rhythm starts today. {n}-day rhythm last time.` Stored as `drill:rhythm:best` so the student keeps the prior best as a record, not a loss.
- Replace the `🔥` glyph with a small filled-circle SVG in `var(--gold-d)`. CSS already has `.streak-fire` — repurpose to `.rhythm-mark`.
- Insights narrative: `{n}-day rhythm — daily drill is the single highest-leverage habit. Keep it going at your pace.` Drops the emoji and the imperative `Keep it.` ending.

**Effort note:** ~20 string changes across 6 surfaces, plus a small `freezeDays` accounting routine in the drill-finish handler. Roughly 2 engineer-hours.

---

# Part B · Mobile Audit Checklist

Verify each item across `index.html`, `traps.html`, `recognition-lab.html`, `trends.html`, `lewis-sandbox.html` (and `ace-labs.html` for the entry frame). Each item: pattern · check · pass criterion · fix sketch.

| # | Pattern | Check | Pass criterion | Fix sketch (if fails) |
|---|---|---|---|---|
| 1 | **Viewport meta tag presence** | All 6 files declare `<meta name="viewport" content="width=device-width, initial-scale=1.0">`. (`index.html:5`, `traps.html:5`, `recognition-lab.html:5`, `trends.html:5`, `lewis-sandbox.html:5`, `ace-labs.html:5`.) | All present. Confirmed in survey. | (Pass.) |
| 2 | **No `user-scalable=no` / `maximum-scale=1`** | Search every file for `user-scalable` and `maximum-scale`. | None found. iOS pinch-zoom must remain enabled — disabling it is a WCAG SC 1.4.4 violation. | If found: remove. Period. |
| 3 | **Primary CTA in thumb zone (bottom 1/3 of viewport on mobile)** | On mock-runner (`index.html` SIM render ~15281), drill (~15029), pacing ladder, the primary "Continue / Submit" buttons sit at the top of the card, not the bottom of the screen — students reach with a thumb on tall phones. | Primary action is `position: sticky; bottom: 0` (with safe-area inset) on viewports `< 760px`, OR is the bottom-most button in a flex column. | Wrap the primary CTA in a `.mobile-action-bar` that sticks to bottom on `@media (max-width: 760px)` with `padding-bottom: env(safe-area-inset-bottom)`. |
| 4 | **≥ 48 × 48 px tap targets on answer buttons** | Inspect `.opt`, `.imf-card`, `.vp-quiz-opt`, `.ion-opt`, `.rl-opt`, `.tr-choice-row`, `.pt-drill-card`, lewis stage buttons. The `.btn.sm` class (`index.html:131`) is `font-size:12px; padding:4px 10px` — likely under 48 px tall. | Computed height ≥ 48 px AND width ≥ 48 px on mobile widths. | Add a `@media (max-width: 760px)` block setting `min-height: 48px; min-width: 48px; padding: 12px 16px` on every interactive class above. |
| 5 | **No swipe-only flows; tap-to-flip cards** | Audit recognition-lab, trends drill, ion drill, IMF cards for any `touchstart`/`touchmove` swipe handlers without an equivalent tap path. | Every card-flip / next-question action is reachable by tap. Swipes (if any) are additive. | If a swipe-only handler is present, add a tap fallback. (Survey: no swipe handlers detected — likely a pass.) |
| 6 | **No horizontal carousels for primary content** | Inspect `next-up-grid` (`index.html` ~14400), tier cards, mock catalog, traps grid. | Primary skill cards / mock options reflow vertically on mobile, not in a horizontally scrolling carousel. | If a `display: flex; overflow-x: auto` ships on a primary-content grid, switch to `grid-template-columns: 1fr` on `< 760px`. |
| 7 | **Inputs are ≥ 16px to prevent iOS auto-zoom** | Check all `<input>`, `<textarea>`, `<select>` for explicit `font-size`. Notably the diagnostic answer input, mock skip-flag inputs, student-name input (`index.html` ~4742), JSON-import file inputs, OChem note input. | All form-control `font-size` ≥ 16px on mobile. | Add `input, textarea, select { font-size: 16px; }` in a `@media (max-width: 760px)` block. |
| 8 | **Hover-only affordances banned** | Tooltip-on-hover ("Locked sidebar link tooltip on hover" per `index.html` ~1199) — does it have a tap path on mobile? | Every tooltip / hover-only reveal is reachable by tap on touch devices. | Add `:focus-within` / `aria-describedby` patterns; convert hover-tooltips to tap-to-toggle on `@media (hover: none)`. |
| 9 | **Modal escape path: backdrop tap + visible close** | Inspect LOCKMOD (`index.html` ~14454), STUCK modal (~14750), celebration modal, locked-node modal. | Each modal closes on (a) explicit close button AND (b) backdrop tap. ESC on keyboard is a bonus. | Add `onclick` handler on the `.modal-backdrop` element delegating to `.close()`. Verify the close button is ≥ 48 px and not behind the iOS notch. |
| 10 | **Fixed-bottom-bar safe-area-inset awareness** | If item 3 ships a sticky bottom action bar, OR the existing `.tb` topbar wraps to bottom on small screens — does it respect `env(safe-area-inset-bottom)`? | All `position: fixed/sticky` elements at top/bottom respect `safe-area-inset-*`. | `padding-bottom: max(12px, env(safe-area-inset-bottom));` on the relevant container. |
| 11 | **Focus rings preserved on touch** | Search for `outline: none` / `:focus { outline: 0 }` rules without `:focus-visible` fallbacks. | `:focus-visible` rings present on all interactive elements; `:focus` outlines never globally suppressed. | Replace any blanket `outline: 0` with `:focus:not(:focus-visible) { outline: 0 }` and define a visible `:focus-visible` style. |
| 12 | **No double-tap-to-zoom on action buttons** | iOS double-taps a button to zoom unless the button declares `touch-action: manipulation`. Check primary buttons (`.btn`, `.opt`, `.imf-card`, etc.). | Primary interactive elements have `touch-action: manipulation`. | Add `touch-action: manipulation` to `.btn`, `.opt`, `.imf-card`, `.rl-opt`, `.pt-drill-card`, `.ion-opt`, `.vp-quiz-opt`. |
| 13 | **Keyboard appearance management** | When the diagnostic / IMF / OChem-note input opens the iOS keyboard, the active question stays visible (not pushed under the keyboard). | Question card scrolls into view on `focus`; `scrollIntoView({block: 'center'})` fires after the keyboard animates. | Add a `focusin` listener on form fields inside drills that calls `scrollIntoView` with a 250ms delay. |
| 14 | **`rem` / dynamic-type units on text** | Audit `font-size` declarations: are body-copy sizes in `rem`/`em`, or fixed `px`? (Quick scan: most engine CSS uses `px`.) | Body-copy font-sizes use `rem`; allows users with iOS/Android Dynamic Type to scale. | Convert key body-copy classes (`.lede`, `.muted`, `.q`, `.opt .txt`, `.tr-choice-text`) from `px` to `rem` (1rem = 16px baseline). Headings can stay `px` if they're explicitly designed; copy must scale. |
| 15 | **Engine sidebar collapse on mobile** | The `.app` grid declares `grid-template-columns: 288px 1fr` (`index.html:54`). On `< 760px` does the 288 px sidebar collapse? | Sidebar becomes a slide-out drawer (or a top nav row) below 760 px; the main column fills the viewport. | Add `@media (max-width: 760px)` block: `.app { grid-template-columns: 1fr } .sb { transform: translateX(-100%); transition: transform 0.2s; } .sb.open { transform: translateX(0); }` plus a hamburger toggle in `.tb`. **This is the single biggest predicted mobile failure.** |

**Predicted highest-risk failure:** Item 15 — the engine's `.app` sidebar is fixed 288 px and there's no evidence in the surveyed CSS of a mobile-collapse rule. On a 390 px-wide iPhone, that's 74% of horizontal real estate burned on a sidebar before the student sees a problem. Until this ships, the engine is effectively desktop-only — the rest of the audit is moot if the layout itself doesn't fit.

---

# Part C · Service-Worker / Offline Pass

Engine line 18550–18552 already attempts to register `sw.js`, but no `sw.js` file exists in `tools/gc/` — the registration silently fails (caught in the `.catch`). This pass defines what `sw.js` should be.

## C1. Scope decision — what to precache

**Cache:**

- The 5 HTML shells: `index.html`, `traps.html`, `recognition-lab.html`, `trends.html`, `lewis-sandbox.html`
- Companion JSON manifests: `traps-library.json`, `recognition-stimuli.json`, `lewis-molecules.json`, `trends-data.json`
- All inline-referenced fonts (Google Fonts URLs already fetched at runtime — let the browser HTTP cache handle these; do not precache cross-origin)
- The parent `ace-labs.html` (so the user can land on the dashboard offline and route in)
- Any sibling shared CSS / JS file referenced by `<link>`/`<script src>` from the above (audit during implementation; the engine appears to be largely self-contained inline)

**Don't cache:**

- `tiktoks/` HTML — these are ephemeral marketing assets, not study tools
- Other AceLabs tools (QR, Bio, OChem) — they are out of scope for this engine's SW (they should ship their own SW with their own scope when their UX-beta lands)
- Any future telemetry endpoints (network-only)

**Scope:** `/tools/gc/` — register the SW with `{ scope: '/tools/gc/' }` so it does not intercept QR/Bio/OChem fetches on the same origin. The parent landing `ace-labs.html` is one level up; intentionally cache it inside the GC SW only as a *fallback shell* fetched via `cross-scope: true` flag — see C6.

## C2. Strategy per resource type

| Resource | Strategy | Rationale |
|---|---|---|
| HTML shells (the 5 `.html` files) | **Cache-first**, with a SWR background refresh | Engine UI is huge and stable; latency win from cache-first is enormous. Background refresh keeps the cached copy current. |
| Companion JSON banks (`traps-library.json`, `recognition-stimuli.json`, `lewis-molecules.json`, `trends-data.json`) | **Stale-while-revalidate** | Banks change between weekly content drops. SWR serves yesterday's cached copy fast, fetches fresh in the background, swaps for next visit. Aligns with web.dev 2024 cookbook for content that changes but never urgently. |
| Inline-referenced fonts (Google Fonts CDN) | **Network-first**, cached after first hit | Cross-origin; respect their CDN cache headers. |
| Future telemetry endpoints (e.g. `/api/event`) | **Network-only** | Telemetry must never be served from cache; queue offline events with Background Sync if added later. |
| `localStorage`-shaped student state | (out of scope for SW) | All student state in this engine is `localStorage` — SW doesn't touch it. The earlier dedupe + ghost-reconciler work owns this. |

## C3. Versioning + invalidation

Engine reads/writes `gc:meta:version` (per the user's auto-memory note about earlier work). The SW pairs with this:

- SW declares `const CACHE_VERSION = 'gc-v{X}-{ISO-DATE}';`. Bump `{X}` on every content drop.
- On `install`, the SW opens `caches.open(CACHE_VERSION)` and pre-populates with the C1 list.
- On `activate`, the SW deletes any cache whose name doesn't equal `CACHE_VERSION` (cleans up stale prior versions).
- The engine's runtime check: when `index.html` boots and finds `gc:meta:version` (in localStorage) doesn't match a `<meta name="gc-bank-version" content="…">` baked into the HTML at build time, the engine calls `navigator.serviceWorker.controller?.postMessage({type: 'PURGE_BANKS'})` which makes the SW evict only the four JSON manifests (not the shells). Shells get refreshed naturally via SWR.
- Manual escape hatch: a "Clear cached content" link in the engine's footer that posts `{type: 'PURGE_ALL'}` and reloads.

## C4. Bundle-size estimate

Rough budget (uncompressed; gzip would roughly halve):

| Asset | Lines | Est. uncompressed |
|---|---|---|
| `index.html` | 18,579 | ~1.4 MB |
| `traps.html` | 529 | ~30 KB |
| `recognition-lab.html` | 813 | ~50 KB |
| `trends.html` | 1,387 | ~80 KB |
| `lewis-sandbox.html` | 1,386 | ~80 KB |
| `ace-labs.html` (fallback shell) | 263 | ~12 KB |
| `traps-library.json` | (not measured) | ~80 KB |
| `recognition-stimuli.json` | | ~80 KB |
| `lewis-molecules.json` | | ~40 KB |
| `trends-data.json` | | ~40 KB |
| **Total uncompressed** | | **~1.9 MB** |
| **Gzipped over the wire** | | **~700 KB** |

A modern phone has 1–2 GB of available browser-storage budget (per origin). Pre-caching ~2 MB is fine — well under any quota. **Verdict: precache everything.** No need to be clever about lazy-loading shells.

## C5. Install / prompt UX

**Recommendation: do not prompt. Document "Add to Home Screen" instead.**

Reasons:

1. AceLabs is a paid-context study tool inside a coached program. Students don't browse and self-discover it; coaches send them the link. A custom install-prompt UI would interrupt that handoff.
2. Pre-meds are the demographic *least* charmed by install prompts — they read it as adware.
3. iOS Safari doesn't honor `beforeinstallprompt` anyway; on iOS the only path is "Share → Add to Home Screen" via Safari's native UI. Building a custom prompt only helps Android, and even there the platform-native prompt has improved.

**What to ship:**

- A `manifest.webmanifest` at `/tools/gc/manifest.webmanifest` declaring name, short_name (`Gen Chem`), theme_color (`var(--gold-d)`), background_color (parchment), `display: standalone`, icons (192/512 PNG, gold "AL" mark on parchment).
- Linked from the engine `<head>`: `<link rel="manifest" href="manifest.webmanifest">`.
- A one-line footer note in the engine: `Tip — open in Safari / Chrome and pick "Add to Home Screen" for offline use.` No modal, no dismiss-state to track.

**Future:** if AceLabs ships a "tools at a glance" home that's not the marketing site, *that* is where a global PWA-install prompt could live. Not in this engine.

## C6. `service-worker.js` file scope

**Path:** `tools/gc/sw.js` (the engine's existing line-18551 registration already targets this path).

**Why not project root:** putting a SW at `/sw.js` (project root) would scope it to the entire AceLabs origin, which would intercept QR, Bio, OChem, the marketing pages, and all onboarding HTML. That's a much bigger blast radius than this beta wants. Each tool ships its own SW, scoped to its own subdirectory. The tradeoff: the parent `ace-labs.html` is outside the GC SW's scope and won't be served from the GC cache when the user navigates to `/ace-labs.html` directly. We accept this — the user will be online when they hit the dashboard for the first time, and from then on each tool's SW handles its own offline.

**Skeleton (spec only — not implementation):**

```
// tools/gc/sw.js
const CACHE_VERSION = 'gc-v1-2026-05-07';
const PRECACHE = [
  './',
  './index.html',
  './traps.html',
  './recognition-lab.html',
  './trends.html',
  './lewis-sandbox.html',
  './traps-library.json',
  './recognition-stimuli.json',
  './lewis-molecules.json',
  './trends-data.json',
  './manifest.webmanifest'
];

self.addEventListener('install', e => { /* open cache, addAll(PRECACHE), skipWaiting */ });
self.addEventListener('activate', e => { /* delete non-CACHE_VERSION caches, clients.claim() */ });
self.addEventListener('fetch', e => { /* dispatch by URL pattern: shells = cache-first+SWR, *.json = SWR, default = network-first-with-cache-fallback */ });
self.addEventListener('message', e => { /* handle PURGE_BANKS, PURGE_ALL */ });
```

**Registration in engine `<head>` (already exists at line 18550):**

```
if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)){
  navigator.serviceWorker.register('sw.js', {scope: './'}).catch(err => console.warn('[SW] register failed:', err));
}
```

The `{scope: './'}` is implicit but spell it out for the next reader.

---

# Effort Estimate + Sequencing

| Part | Sub-task | Engineer-hours |
|---|---|---|
| **A** Anxiety copy | A1 17 find/replace pairs (mostly string changes) | 3 |
| | A1 BANK `diag` rewrite (~30 entries from QBANK_AUDIT) — *content* work, slower | 5 |
| | A2 Timer toggles + late-warning behavior (4 surfaces) | 4 |
| | A3 Score-reveal staging (SIM, PACE, recognition, trends) | 4 |
| | A4 Streak → rhythm rename + freeze-day logic | 2 |
| | **Part A total** | **18 h** |
| **B** Mobile audit | Run the 15-item checklist against all 6 files | 3 |
| | Fix sidebar collapse (item 15) | 3 |
| | Fix tap targets / `font-size: 16px` inputs / sticky bottom CTA (items 3, 4, 7, 12) | 4 |
| | Fix focus rings, hover-only affordances, modal escape (items 8, 9, 11) | 2 |
| | `rem`-conversion pass (item 14) | 2 |
| | **Part B total** | **14 h** |
| **C** Service worker | Author `sw.js` per skeleton | 4 |
| | Author `manifest.webmanifest` + icons | 2 |
| | Wire `gc:meta:version` purge handshake | 2 |
| | Cross-browser test (iOS Safari, Android Chrome, desktop Chrome/Firefox/Safari) | 3 |
| | **Part C total** | **11 h** |
| | **Combined** | **~43 h** |

## Recommended sequence

1. **Part B item 15 first** (sidebar collapse) — half a day. The mobile layout has to fit before any of the copy work matters; otherwise the beta cohort can't see the changes on the device they actually use.
2. **Part A1, A4, and the BANK diag rewrite** — week one of beta. Pure copy, low blast radius, every change is cheap to revert.
3. **Part B remainder** — week one parallel, since it's CSS-only and doesn't touch JS state.
4. **Part A2 + A3** — week two. These add UI state (timer toggle, reveal stage) and need to be tested with at least 5 students before the change ships to the full cohort.
5. **Part C** — week two or three. SW is the lowest-urgency item: the engine works fine online today. Ship after copy + mobile so students who hit offline get the fully polished version cached, not the in-flight one.

**Risk callouts:**

- The BANK `diag` rewrite (A1 row 7) is the single largest content task in the spec. 5 engineer-hours is optimistic if "diagnostic" rewrites require Tommy's voice — could double if it needs review pass with the coach.
- The score-reveal staging (A3) has the highest student-experience swing but also the highest regression risk — every existing mock-result interaction touches `SIM.finish`. Ship behind a feature flag (`gc:ui:scoreReveal=staged`) and roll out gradually.
- The SW (Part C) ships *with* a manual escape hatch in the footer (per C3). Without that, a bad cache version can brick the engine for anyone with a stale SW — and the only way out is "clear site data" via dev tools, which a student will not do.

## What this spec deliberately does *not* cover

- The five universal pieces from `ANXIETY_AWARE_DESIGN.md` (Stuck triage, confidence ratings, no-timer-until-floor, identity hero, end-on-a-win) — those are architectural and already partially shipped. This pass is the *polish layer* on top.
- New BANK content. Diag rewrites are the only content touched.
- Tutor-side / coach dashboard copy (`coachActivity`, line 4544 etc.) — separate audit.
- Marketing site or onboarding HTML — separate property.
- Dark-mode contrast pass — flagged for next round.
