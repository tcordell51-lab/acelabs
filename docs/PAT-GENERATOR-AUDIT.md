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

---

# Engine v2 (2026-10-01): machined shapes, non-cube nets, multi-fold punching

Driven by the ADA comparison (ace-system `docs/ADA-COMPARISON-2026-09-30.md`, section 5.3).
LOCAL branch `pat-shapes`; not pushed or deployed.

## Versioning (old results still map)

`PAT.test.VERSION = 2`. A test is fully determined by (test id, version, options).
`build(id, { version: 1 })` runs the original generators and is byte-identical to the
pre-v2 engine for all 15 numbered tests and fresh tests (SHA-256 snapshot test). New
attempts record `engine: 2` and `opts`; `test.html` rebuilds every saved attempt with
the version it was taken on (attempts saved before versions existed are v1), so
answers keep mapping onto the same 90 items.

## What v2 adds

| Section | v2 change | Files |
|---|---|---|
| Keyholes | 9 of 15 items are machined parts: profile prisms with chamfered or rounded corners, U, V or arched tops, round or square side notches, plus a slot across the top and/or a cylinder, frustum or cone boss; optional blind hole as a decoy. Exact curved and slanted outlines; line-drawing pictorial with true curved silhouettes. New trap: curve and slant swapped. | `engine/pat-solid.js`, `engine/pat-keyholes-csg.js` |
| TFE | 9 of 15 items are machined parts: 5 x 4 x 3 block with front/back edge chamfer, step or cove; top boss (cylinder, frustum, cone, square) or hole (through, counterbore from top or bottom, square, boss with hole); side round holes, U-slots or a channel; optional quarter turn. Exact hidden-line views (solid vs dashed, circles, nested hidden circles, slants). | `engine/pat-solid.js`, `engine/pat-tfe-csg.js` |
| Pattern folding | 7 of 15 items fold into rectangular prisms, triangular prisms, square pyramids or tetrahedra (random spanning-tree nets, overlap-checked), with shaded faces, dots and directional band/corner marks. Traps: mirror, turned mark, swapped faces, shading on the wrong face, a far-side face shown. | `engine/pat-patternfold-poly.js` |
| Hole punching | Every item has 2 or 3 folds. 5 items per test allow a punch on a diagonal fold edge (a half-hole on the folded sheet that unfolds into one full hole), accepted only when a triangle-level simulation shows every cell is cut whole or not at all. | `engine/pat-holepunch.js` (option-gated) |
| Angle ranking | Optional 1-degree tier (`angles1deg`, off by default; checkbox on the scratch screen). | `engine/pat-angles.js` (option-gated) |

## Independent checks (`scripts/pat/verify-solid.js`, plus `verify.js` for hole punching)

- Own solid kernel: ray intervals from every surface crossing plus whole-tree midpoint
  tests (the engine clips primitives analytically and uses interval arithmetic).
- TFE machined: the verifier rebuilds the object from its parameters with its own family
  builder, rasterizes all three views (a line between neighbouring rays whose surface
  layers differ; visible when the first surface differs), and requires the given views
  and the key to match the engine's vector drawings exactly (junction tolerance only).
  It then enumerates the whole family (1,968 objects per orientation), keeps every
  object whose two given views match, and proves each distractor differs from every
  view those objects can have. The engine runs its own search with different code;
  both agreed on the number of consistent objects in every sampled item.
- Keyholes machined: exact silhouettes along all three axes from the verifier's kernel
  (exact extents, refined at sharp tips), every opening compared under all 8 turns/flips
  at its drawn scale: the key must match a true outline with 0 mismatched samples; each
  distractor must miss every true outline by at least 8 samples or by size. Each feature
  must show at least 20 rays of visible area in the pictorial, and the pictorial lines
  must match an iso raster (crease or depth step at the exact switch point; tangent
  seams are not lines).
- Pattern folding (non-cube): the verifier builds the solid itself and folds the 2D net
  onto it (net to solid; the engine unfolds solid to net), carrying printed marks through
  rigid maps; every complete fold times the 24 quarter-turn poses is a valid drawing.
- Hole punching: triangle-level forward simulation of all 64 triangles; rejects part-holes
  and punches that miss paper.
- Mutation tests confirm each new check is live (wrong key, stretched key, missing
  pictorial lines, flipped dash, missing given-view lines, wrong hole key).

## Audit (`node scripts/pat/audit-engine.js`, 50 fixed seeds per type)

All 11 kinds: **0 problems in 50**. keyholes, tfe, angles, holepunch, cubes, patternfold
(v1 generators) plus keyholesMachined, tfeMachined, holepunchV2, patternfoldPoly, angles1deg.

- TFE machined: missing view end 20, front 16, top 14; consistent objects per item 1 (32),
  2 (1), 3 (15), 9 (2); hidden-line groups 0 to 5.
- Keyholes machined: key axis 15/18/17; boss frustum 21, cylinder 18, cone 11; slots 24.
- Hole punching v2: folds 2/3 = 25/25; diagonal fold in 35; half-hole in 11 of 50.
- Non-cube nets: box 13, triangular prism 13, pyramid 12, tetrahedron 12.
- 1-degree tier: closest pair 1 degree in 50 of 50.

Two failures surfaced during this audit were verifier bugs, both fixed: the pictorial
raster used a cut cylinder's normal with the wrong sign, and it stopped at the first of two
surface changes inside one sample pair. The engine's outlines and keys were correct.

## Remaining fidelity gaps

1. Families are finite. TFE distractors are proven wrong within the 1,968-object family,
   not against every conceivable solid; keyholes are drawn from one profile-prism family.
2. No round surface meets a slanted face or another round surface (no ellipse or saddle
   intersection curves), and no fillets with drawn tangent edges. Rounded keyhole corners
   are drawn without tangent lines, which reads a little soft.
3. Pattern folding: marks are bands, corner triangles, dots and full shading; the official
   test also uses irregular non-convex nets and unshaded line patterns.
4. Hole punching: half-holes only on diagonal folds through cell centres; no punches that
   straddle a straight fold.
5. Generation cost: a v2 test takes about 4 to 5 s of CPU to build in Node (v1: 2.7 s), so
   the loading bar runs longer on slow phones.
6. The prep app PAT bank (`acethedat-prep/site/data/bank/pat.json`, 170 items, text options)
   is not regenerated. That would need an export of engine items with an SVG per option
   (the bank schema carries one `fig` and text options), 5 choices for keyholes and hole
   punching and 4 for TFE, angles and pattern folding, and a 90-item / 60-minute PAT
   timing instead of 45 / 30.
