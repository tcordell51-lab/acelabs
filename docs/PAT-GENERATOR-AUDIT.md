# PAT generator correctness audit

Date: 2026-09-30. Scope: the six PAT Studio generators in `tools/pat/` and the new
test engine in `tools/pat/engine/` that powers `tools/pat/test.html`.

## Method

- **The real Studio code was audited, not a copy.** `scripts/pat/legacy.js` slices the
  generator functions out of each Studio page by name and runs them in a sandbox, so
  the audit exercises exactly what students run.
- **50 fixed seeds per type** (`scripts/pat/audit-legacy.js`, seeds 1000 + 37k).
- **Independent verifiers** (`scripts/pat/verify.js`) never call generator code. Each
  re-derives the answer with a different method, then asks two questions of every
  item: is the key truly correct, and is any distractor also correct?

| Type | Independent check |
|---|---|
| Keyholes | Silhouettes recomputed from the voxel solid along all three axes and compared under all 8 turns and flips. A similarity test catches a "true outline at a different scale", which looks identical when options are drawn to fit. An outline-evidence test marks outline cells the pictorial drawing cannot show (hidden notches or hidden material). |
| TFE | Views rebuilt from the real 3D edges of the solid (4-voxel neighbourhood test) with their own visibility test. A slice-by-slice search then enumerates **every** face-connected solid in the box that gives the two given views, collects the third views those solids produce, and flags any distractor in that set. |
| Angle ranking | True order recomputed from the degree values; exactly one option may match. |
| Hole punching | Forward simulation: each of the 16 hole positions is pushed through the folds (reflect when on the moving side) and is punched iff it lands on a punch. Supports diagonal folds. |
| Cube counting | Painted faces recounted. Ray casting from each column's top face toward the viewer checks the DAT rule that hidden cubes only exist where they hold up a cube you can see. |
| Pattern folding | The net is folded by rolling a cube under the paper (a different method from the generator's frame propagation), then the cube is drawn in all 24 orientations. An option is valid iff its drawing matches one of them. |

- **Visual spot-check:** contact sheets of 10 items per type (key outlined) rendered with
  headless Chrome and looked at by eye. `scripts/pat/audit-engine.js --sheet out.html`
  rebuilds them.

## Results: Studio generators (before, then after the fixes on this branch)

| Generator | Before | Bug found | Fix | After |
|---|---|---|---|---|
| Keyholes (`keyholes.html`) | 42 / 50 flagged | The keyed outline often included outline cells the drawing cannot show (a notch or lump created only by material hidden behind the object). The count is an upper bound: some of those cells can be inferred by continuing a straight edge, but some cannot. No item had a second true outline among its options, and no distractor was a true outline at a different scale. | `buildItem` now picks the answer only from axes whose outline is fully supported by the drawing (`outlineEvidence`). | 0 / 50 |
| TFE (`tfe.html`) | 5 / 50 | The "connected" check seeded its flood fill from every floor cube, so an object could be **two separate pieces** (a tunnel carved along the floor split it). No distractor was ever a valid end view. | Flood fill now starts from one cube; the solid must be one piece. | 0 / 50 |
| Angle ranking (`angles.html`) | 0 / 50 | Keys always correct. Calibration note only: at the default dial every gap is exactly 5 degrees, easier than the real test. The dial still goes to 2 degrees. | None needed (the test engine uses mixed 2 to 6 degree gaps). | 0 / 50 |
| Hole punching (`holepunch.html`) | 50 / 50 | Keys always correct (forward simulation agrees on all 50), but every item offered **4 choices; the DAT offers 5**. No diagonal folds. | Fifth choice added (one-hole-off near misses keep the pool full), answers lettered A to E. | 0 / 50 |
| Cube counting (`cubes.html`) | 29 / 50 | Painted counts always correct, but **29 of 50 figures hid a column completely** behind taller columns in front. A hidden cube that holds nothing up breaks the DAT rule, so the keyed count could not be read from the picture. | Figures are rejected unless every column's top face shows at least 25 percent toward the viewer. | 0 / 50 |
| Pattern folding (`patternfold.html`) | 0 / 50 | Keys correct and no distractor matched any of the 24 orientations. Only 4 of the 11 cube nets are used. | None needed (the test engine uses all 11 nets). | 0 / 50 |

## Results: test engine (`tools/pat/engine/`)

`node scripts/pat/audit-engine.js` (seeds 9000 + 101k) and the `npm run test:pat` suite:
**0 problems in 50 items for every type**, and **0 problems across all 1,350 items of
the 15 numbered tests**. The suite also mutates a key in each type and confirms the
verifiers catch it, so a green run means the checks are live.

What the engine adds beyond the Studio generators:

- **Keyholes:** key outline fully readable from the drawing; near-miss traps are cut from
  the key outline; all openings drawn at one common scale, plus a "right shape, wrong
  size" trap in about a third of items (the DAT states openings are drawn to scale).
  Five choices.
- **TFE:** the missing view rotates among top, front and end; every distractor is
  proven impossible by the exhaustive search above (traps: front/back swap, hidden edge
  drawn solid, visible edge drawn dashed, a misplaced step). Four choices.
- **Angle ranking:** gaps of 2 to 6 degrees weighted toward 2 to 4, a common drawing
  scale across the four panels, a third of items with deliberately misleading arm
  lengths, and distractors that swap the closest pairs first. Four choices.
- **Hole punching:** a triangle-mesh fold model that supports horizontal, vertical and
  45 degree diagonal folds exactly; 1 to 3 folds; no half-holes. Five choices
  (skipped unfold, wrong mirror line, flipped sheet, one hole off, dropped hole).
- **Cube counting:** 12 to 24 cubes per figure, 3 or 4 questions per figure, the
  hidden-cube rule enforced by ray casting. Five choices (1 to 5 cubes).
- **Pattern folding:** all 11 cube nets in random turns and flips, seven face markings,
  distractors checked against all 24 orientations. Four choices.

Distribution over the 50 audit items: TFE missing view end 21, front 19, top 10;
angle closest gap 2 deg 28, 3 deg 20, 4 deg 2; hole punching 1/2/3 folds 17/17/16
with 25 including a diagonal; cube figures 12 to 23 cubes with 1 to 8 hidden
supporting cubes; nets 1-4-1 25, 2-3-1 20, 3-3 3, 2-2-2 2.

## Where generated items still fall short of real-DAT quality

1. **TFE objects are voxel solids.** Every line is horizontal or vertical. The real test
   uses sloped faces, curves and circles, and its objects read as machined parts. The
   hidden-line logic and the distractor proofs are exact, but the visual vocabulary is
   narrower than the DAT's.
2. **Pattern folding is cubes only.** The real section also folds prisms, pyramids and
   irregular solids, and many of its patterns are unshaded shapes. Every item here is a
   marked cube net.
3. **Keyhole objects come from one family** (boxes, slots and through-cuts on a voxel
   grid). Real items include curved and angled parts. Most answer outlines are strongly
   asymmetric (49 of 50 have no exact symmetry), so the "symmetric outline" split in the
   analyzer is usually a near-symmetry split.
4. **Hole punching has no half-holes** (punches on a folded edge). They are avoided by
   design so every key is exact; the real test occasionally uses them.
5. **Angle ranking draws plain lines** and does not reproduce the real test's exact
   stroke weight and panel size; the 2 to 3 degree gaps match the hard end of the DAT.
6. **Outline evidence is conservative.** It treats any outline cell without direct
   visual support as unreadable, so it rejects some keyhole objects a person could read
   by continuing a straight edge. That costs variety, not correctness.

## How to rerun

```
npm run audit:pat      # Studio generators (current code) then the test engine
npm run test:pat       # node --test: seeds, key correctness, analyzer, store
```
