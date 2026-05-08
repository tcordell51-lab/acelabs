# Agent 08 — Pacing & Meta-Strategy Integration

These two widgets replace the static text in the Tier 3 meta-strategy modules of the master `tools/qr/index.html`.

## File map

| Master location | Replace with |
|---|---|
| `index.html` line 1874, `<section id="untimed">` | (no replacement — keep the existing `untimed` content as the gate-keeper module; both widgets are unlocked AFTER untimed gate clears) |
| `index.html` line 1875, `<section id="skip-ret">` | **`pacing-sim.html`** — Widget A, Pacing Simulator |
| `index.html` line 1876, `<section id="guess">` | **`guess-ev.html`** — Widget B, Guess vs Blank EV Calculator |

## Master-file touch points

The following entries in the master JS data structures point at the modules we are replacing. They are **referenced by skill id**, not by section content, so the integration is a pure swap of the section innerHTML — no re-keying is needed.

- `MODS['skip-ret']` (line ~4918) — `worked`, `faded`, `practice`, `sarahTricks`, `formula` blocks supply the static lesson copy currently used to build that section. After integration, the lesson card stays at the top of the section and Widget A is appended **below** it as the live demo.
- `MODS['guess']` (line ~4944) — same pattern; the Eliminate-then-guess copy is preserved, Widget B becomes the live demo.
- `vizFor` map (line ~5389): `'skip-ret':'triage-board'` and `'guess':'elim-funnel'`. Both widgets here are richer interactive replacements. Recommend updating that map to `'skip-ret':'pacing-sim'` and `'guess':'guess-ev'` and adding two new render branches to whatever function consumes `vizFor` — these will mount the iframe / inline HTML for the new widgets.
- Sidebar entry (line 1613): `<a class="sb-link" data-go="skip-ret">Skip & Return</a>` already links to the section. No change.
- Roadmap node (line 2327) and progress array (line 9903 / 10412): `'untimed','skip-ret','guess'` — no change. The widgets do not alter the skill graph.

## Recommended integration order

1. Keep the existing `MODS['skip-ret']` and `MODS['guess']` lesson copy as the **header** of each section (formula card, worked example, Sarah-trick callouts).
2. Below the lesson copy, mount Widget A inside the `#skip-ret` section and Widget B inside the `#guess` section. Both widgets are self-contained (vanilla JS + anime.js + master CSS variables) and can be inlined directly or loaded as `<iframe>` placeholders during prototyping.
3. The pacing simulator emits a logical event when the student finishes a sim section. Recommend wiring a callback that flips `progress['skip-ret']` to `partial` after the first run and `done` after a run with zero unanswered questions. (Hook intentionally not wired in this prototype — left to the integrator.)
4. The EV calculator has no pass/fail state; recommend marking `progress['guess']` as `done` when the student has interacted with both sliders at least once (any non-default position).

## Why this split is correct

- **`untimed`** is a *philosophy* module ("don't add the timer until 80% accuracy"). It is correctly served by static lesson copy + the existing 80% gate — adding an interactive widget here would actually undercut its message.
- **`skip-ret`** is a *behavior* module (the 90-second rule, the return queue, the half-time check). Behavior modules need a simulator. The Pacing Simulator forces the student to *make* the decision under a clock, which is the only way the lesson sticks.
- **`guess`** is a *math* module (no penalty for wrong → guess EV > blank EV, always). Math modules need a calculator that lets the student see the curve move. The slider-based EV calc shows the cost of blanking in raw points and approximate scaled points.

## Style compliance

- All CSS variables sourced from `:root` in master `index.html` (gold, teal, trap, paper, ink, etc.).
- No emojis or unicode glyphs anywhere — Thomas's rule.
- Vanilla JS + anime.js (loaded from the same jsDelivr URL the master uses).
- Mobile breakpoints at 760px on both widgets.
- Self-contained — each file opens standalone.

## Files in this proposal

- `pacing-sim.html` — Widget A (Pacing Simulator)
- `guess-ev.html` — Widget B (Guess vs Blank EV Calculator)
- `INTEGRATION.md` — this file
