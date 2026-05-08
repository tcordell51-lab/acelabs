# Agent 03 — Pattern Path comparator widgets

Each demo is a self-contained HTML file using the master `index.html` CSS variables (gold/teal/trap/good palette, Playfair/DM Sans/JetBrains Mono fonts, paper backgrounds, shadow tokens). Drop the inner `<section>` body of each demo into the matching empty stub in `index.html`.

## Master-section mapping

| Module slug | Master HTML stub (line) | Demo file | Trap encoded |
|---|---|---|---|
| `distrib` | `<section class="sec" id="distrib" data-skill="distrib"></section>` (1850) | `distrib.html` | Distributing the multiplier to only the first term inside parens, especially when there is a leading minus that must travel across both terms. |
| `pemdas` | `<section class="sec" id="pemdas" data-skill="pemdas"></section>` (1851) | `pemdas.html` | Treating M before D and A before S, instead of left-to-right within each tier. |
| `neg-ineq` | `<section class="sec" id="neg-ineq" data-skill="neg-ineq"></section>` (1852) | `neg-ineq.html` | Multiplying or dividing both sides of an inequality by a negative number without flipping the inequality direction. |
| `work-rate` | `<section class="sec" id="work-rate" data-skill="work-rate"></section>` (1853) | `work-rate.html` | Averaging the two completion times instead of adding the rates and inverting (two pumps cannot be slower than one). |
| `mixture` | `<section class="sec" id="mixture" data-skill="mixture"></section>` (1854) | `mixture.html` | Averaging two concentrations instead of weighting each by its volume. |
| `interest` | `<section class="sec" id="interest" data-skill="interest"></section>` (1855) | `interest.html` | Using simple interest (P + Prt) when the problem says compounded — missing the "growth on growth" multiplier. |
| `coord` | `<section class="sec" id="coord" data-skill="coord"></section>` (1856) | `coord.html` | Treating the perpendicular slope as just a sign-flip instead of the full negative reciprocal (flip the fraction AND the sign). |
| `units` | `<section class="sec" id="units" data-skill="units"></section>` (1857) | `units.html` | Multiplying when you should divide because the conversion fraction is upside-down — units don't cancel diagonally. |
| `p-flip` | `<section class="sec" id="p-flip" data-skill="p-flip"></section>` (1858) | `p-flip.html` | Computing P(at least one) by adding individual P(success), instead of 1 − P(none). |
| `p-andor` | `<section class="sec" id="p-andor" data-skill="p-andor"></section>` (1859) | `p-andor.html` | Flipping the operations: + for AND and · for OR. AND multiplies (or counts overlap); OR adds (subtract overlap if not exclusive). |
| `p-cond` | `<section class="sec" id="p-cond" data-skill="p-cond"></section>` (1860) | `p-cond.html` | Keeping the original total in the denominator after a "given" clause, instead of restricting to the conditioning event. |
| `count-pc` | `<section class="sec" id="count-pc" data-skill="count-pc"></section>` (1861) | `count-pc.html` | Using C(n,k) when distinct labels (president/VP/treasurer) make order matter — must use P(n,k). |
| `discr` | `<section class="sec" id="discr" data-skill="discr"></section>` (1862) | `discr.html` | Running the full quadratic formula when the question only asks the *count* of real roots — the sign of b² − 4ac is enough. |
| `harm` | `<section class="sec" id="harm" data-skill="harm"></section>` (1863) | `harm.html` | Arithmetic-averaging two speeds for an equal-distance round trip, instead of using the harmonic mean (more time at the slower speed pulls the average down). |

## Integration steps

1. Open each demo file. Copy the inner `<section class="sec">…</section>` block (the one inside `<body>`) **without** the `<head>`/CSS — the master HTML already supplies all the styles and tokens.
2. Replace the matching empty stub in `tools/qr/index.html`. Keep the `id` and `data-skill` attributes on the outer `<section>`.
3. The `<style>` and `<script>` blocks at the top/bottom of each demo are scoped only to that comparator; the JS uses ID-based selectors (`#cmp`, `#expl`, `#drill`, `#resetBtn`) so multiple comparators on one page need a per-section ID-prefix pass before merging. (Each demo wraps its JS in an IIFE, so the only conflict is element IDs.)
4. The shared CSS in each demo duplicates a small subset of the master's variables and component classes (`.card`, `.sec-head`, `.tag`). When merged into `index.html`, the duplicated class definitions are no-ops — the master already defines them identically. Only the comparator-specific classes (`.compare`, `.setup`, `.expl`, `.drill`, `.dq`, `.prob`) are net-new and should be added once to the master CSS block.

## Pattern (shared across all 14)

Each comparator follows the exact same student-flow:

1. **DAT-style problem** in a gold-bordered `.prob` block at the top.
2. **Setup A vs Setup B** side-by-side. One bakes the canonical trap; the other is correct.
3. Click reveals: trap setup turns red (var(--trap)), correct setup turns green (var(--good)). Verdict line appears under each.
4. **Trap-pattern explanation** drops in below — what the trap is, why it works on test day, and a bordered "Lock-line" with the rule.
5. **3 follow-up drill problems** unlock, all hitting the same trap with different numbers, to build recognition speed.
6. Reset button to retry.

## Files

- `mixture.html` — hand-authored canonical example (also fed into the build)
- `distrib.html`, `pemdas.html`, `neg-ineq.html`, `work-rate.html`, `interest.html`, `coord.html`, `units.html`, `p-flip.html`, `p-andor.html`, `p-cond.html`, `count-pc.html`, `discr.html`, `harm.html` — generated from `_build.js`
- `_build.js` — Node script that holds the per-module content and stamps it into the shared shell
- `_shell.css` — reference copy of the shared CSS variables (not loaded by demos)
