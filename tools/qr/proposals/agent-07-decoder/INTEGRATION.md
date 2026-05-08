# Agent 07 — Word Problem Decoder modules

Five self-contained HTML files, one per word-problem skill in the master QR tool.

## Files

| File | Master section | Canonical equation skeleton |
| --- | --- | --- |
| `word-decode.html` | `#word-decode` | `coef · n ± const = result` (general translate-the-sentence) |
| `work-rate.html` | `#work-rate` | `1/t = 1/a + 1/b` (drain variant subtracts) |
| `mixture.html` | `#mixture` | `C₁·V₁ + C₂·V₂ = C_f·V_f` |
| `interest.html` | `#interest` | simple: `A = P(1 + r·t)` ; compound: `A = P(1 + r/n)^(n·t)` |
| `rate-time.html` | `#rate-time` | `d = r·t` (single, two-leg, meeting, catch-up, unit-conversion) |

## The 3-step decoder pattern

Each module shares the same engine:

1. **Highlight** — DAT-style problem rendered with selectable `.token.selectable` spans. Student taps the variables in the prose. `checkPicks()` validates against `expect[]` and marks each pick `correct` or `wrong`.
2. **Build skeleton** — canonical equation with `.slot` placeholders. The picks from step 1 become draggable `.var-pill` chips. Student drags into slots; `checkSkeleton()` validates `slotFills` against `slots`.
3. **Solve & verify** — student types numeric answer + a sanity-check sentence. `checkAnswer()` validates within tolerance, then reveals a worked sanity paragraph (units check, magnitude check, "between sources" check, etc.).

Five problems per module, navigable via the `.qchip` quiz bar at the top. Score persists per session as `0/5`.

## Style adherence

- Uses the master CSS variable palette verbatim (`--gold`, `--teal`, `--paper`, `--good`, `--trap`, etc.) so any module drops into the master without restyling.
- Fonts: Playfair Display (serif), DM Sans (sans), JetBrains Mono (mono) — matches master.
- No emojis, no unicode glyphs. Uses words ("Locked", "Decoded", "Off"), `.label` micro-text, and color cues only.
- Animations via anime.js (token tap pulse, slot fill pulse, celebration reveal).
- Mobile breakpoints at 680px (solve-row collapses to single column) and 980px-style flex-wrap on chip rows.

## Integration paths

### Option A — link out (lowest risk)
Add a "Decoder" button to each of the five sections in `index.html` that links to the proposal file:

```html
<a class="btn gold" href="proposals/agent-07-decoder/work-rate.html" target="_blank">Open the decoder →</a>
```

### Option B — inline as a card
Copy the inner `.wrap` content of any module into the matching `<section data-skill="…">` in `index.html` and rename CSS classes from `.problem`/`.skeleton`/etc. to module-prefixed equivalents (e.g. `.dec-problem`) to avoid collisions with master classes that share names. The module-specific JS (`PROBLEMS`, `state`, `checkPicks`, `checkSkeleton`, `checkAnswer`) can be wrapped in an IIFE so the global `state` does not collide between modules:

```js
(function(){ const PROBLEMS = [...]; const state = {...}; ... })();
```

### Option C — mount as iframe
Each file is fully self-contained, so an `<iframe src="proposals/agent-07-decoder/work-rate.html" style="width:100%;height:1100px;border:0"></iframe>` works without any CSS or JS conflicts.

## Why this attacks 500-tier failure

Word problems are the second-most common reason 500-tier students miss QR points (after raw computation). The freeze-point is *translation* — students cannot map English clauses ("decreased by", "compounded quarterly", "30 minutes later") to symbolic operators. The decoder makes the translation explicit, mechanical, and rehearsed:

- **Step 1** trains the eye to spot variables in prose, eliminating "I don't know where to start."
- **Step 2** locks the canonical skeleton into long-term memory by drag-and-drop assembly across five repetitions.
- **Step 3** computes and adds a metacognitive check — does the answer have the right units and magnitude — addressing the "I solved it but plugged in wrong" failure mode.

Five rounds per module × five modules × three steps = 75 forced translations per session.

## Known gaps / future work

- Touch-drag fallback: HTML5 drag-and-drop on mobile is finicky; a `pointerdown`/`pointermove` shim per slot would harden iOS Safari.
- Sanity-input is currently free-text only; a future pass could parse keywords ("between", "smaller", "linear") and grade.
- Dark-mode parity: variables are defined for light mode only in these files; a `body[data-theme="dark"]` block could be lifted from master if integrated as Option B.
- Problem authoring: the five problems per module are hand-authored but should be reviewed by Sarah/Thomas for DAT fidelity before going live.
