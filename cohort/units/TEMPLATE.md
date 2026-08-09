# The Unit — canonical template

Every cohort/crash-course lesson is a **unit**. This is the standard each new unit clones.
Reference unit (the gold standard): **`oc-acids-cardio/`**. Don't ship a unit that doesn't clear this bar.

## The one rule (why this isn't Stick Lessons)
A unit must be **the single best place in all of Ace Labs to learn its concept**, and it must
**route reps OUT** to the live engine / Retold / Climb / Booster — never duplicate them.
Teach here, drill there, prove here, fix in the Ace Log.

## A unit is one content atom, rendered three ways
Author + verify the content ONCE, then render:

| File | Format | Used for |
|---|---|---|
| `lesson.html` | **Studio-stages** interactive lesson (screen, animated) | self-paced study, cohort pre-work / redo |
| `workbook.html` + `workbook.pdf` | **Markable print workbook** (HTML → PDF) | crash-course handout, live mark-up |
| `slides.html` *(optional)* | coach live-slide deck | the coach presenting live |

Two axes of reuse: **format** (above) × **pricing wrapper** (cohort / crash / founder / drop-in).
Build the atom once; sell it every way.

## The 4-beat spine (both lesson and workbook follow it)
1. **Anchor** — the one idea + one killer visual + a physical-story analogy. *This is what gets taught live.*
2. **The Move** — the named procedure, **walked ONE STEP PER BEAT** (the CARDIO reference walks C · A · R · D/I · O, one letter per screen, each with a drawn example so a coach can teach each step live).
3. **The Reps** — a few inline; the bulk **routed** to the engine / Retold / Climb / Booster.
4. **The Proof** — commit-before-reveal DAT items → calibration → misses to the Ace Log.

**Locked reference (v6 · `oc-acids-cardio/lesson.html`, Priya SHIP-AS-IS):** engine `sk-*` skeletal visuals;
**every teaching beat is ACTIVE** via tap-to-fill **fill-in-the-blanks** (student supplies the key term, not passive
reading); **You-do questions DRAW the compounds** (real skeletal structures in a labeled panel, like the real DAT — not
text names); **everything is RETRYABLE** (redo any blank, per-question Try-again, "Redo all" with attempt tracking);
DAT-scoped only (no MCAT-level aromatic para/meta nuance). This is the bar every unit clones.

## Craft floor (every unit, no exceptions)
- Thomas's teaching DNA: **drawing-first, one physical-story analogy, a named move, hand-the-pen.**
- The proof engine: **commit-before-reveal** (answer + confidence before Check), per-distractor rationale,
  end calibration, error-type triage + one-line-rule capture.
- Brand: dark+gold, Georgia display, section rail color (OChem purple `#c49af0`, GChem/… per section),
  both light+dark themes. Workbook = light/cream print-optimized. **No emojis/glyphs. No payment language.
  No score predictors** (calibration = practice metrics only). Encouraging tone. DAT scale 200-600.

## Production pipeline (who does what)
1. **Cleo** (content-creator) authors the unit's content atom in Thomas's voice.
2. **Priya** (dat-sme) adversarially fact-checks — every claim, every keyed answer, every distractor. 0 blockers to ship.
3. Render the formats: `lesson.html` (Studio deck) + `workbook.html` → `workbook.pdf`
   (`chrome --headless --print-to-pdf`, print CSS with `break-after:page` per `.page`).
4. **Gus** (qa-auditor) verifies the rendered formats (no dead links, renders clean, routes work).
5. Thomas signs off voice/feel + scope; then place + commit. **Deploy only on Thomas's explicit go.**

## File convention
```
cohort/units/<section>-<slug>/
  lesson.html        # Studio-stages interactive lesson
  workbook.html      # print source
  workbook.pdf       # generated (do not hand-edit)
  slides.html        # optional coach deck
```
Wire the unit into the hub by pointing the relevant week/track cell at `units/<slug>/lesson.html`
(see `W[]` in `index.html`). Crash-course packaging links the `workbook.pdf` as the handout.

See `../CURRICULUM.md` for the full unit catalog and build order.
