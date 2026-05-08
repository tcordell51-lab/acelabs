# Phase 2 — Drag-Drop Replacement Plan

**Goal:** replace all 31 existing drag-drop sandboxes with the right mechanic per the research cheat-sheet. Touch-friendly, WCAG 2.5.7 compliant, pedagogically sharper.

**Research basis:** [SUMMARY.md](./research/SUMMARY.md) §"Drag-drop is the wrong primitive" + cheat-sheet table.

## Replacement mechanics (the toolbox)

| Mechanic | When to use | Example built |
|---|---|---|
| **A. Numbered radio matrix** | Sequencing tasks where order matters and items have stable identity | TBD |
| **B. Up/down sortable list** | Sequencing where adjacency reasoning is the lesson | TBD |
| **C. Pause-and-pick walkthrough** | Process narratives where temporal causality is the lesson | TBD |
| **D. Tap-to-tag chips** | Categorization where each item belongs to one category | TBD |
| **E. Toggle-per-item** | Binary classification (polar/nonpolar, etc.) | Tonicity slider (similar) |
| **F. Tap-to-reveal then chip-pick** | Anatomy labeling — study mode then test mode | Brain region click-reveal |
| **G. Type-to-label autocomplete** | When spelling/recall is part of the goal | TBD |
| **H. Branching choose-your-own-pathway** | Pathway exploration where decisions cascade | TBD |
| **I. Find-the-bottleneck reverse-engineer** | Pathway already shown; ask which step is broken | TBD |
| **J. Slider-driven real-time response** | Continuous biology (concentration, voltage, time) | HW bubble, Tonicity, Bohr, Cardiac, Cross-bridge, Krebs, Z-scheme, RNA, Probability tree |
| **K. Compare-two-runs slider** | Side-by-side scenarios with one parameter different | TBD |
| **L. Step-through scrubber with embedded picks** | Animation paused at decision points | TBD |

## Module-by-module replacement plan

### bio-cell.html (17 sandboxes)

| Node | Current | Replacement | Why |
|---|---|---|---|
| `node-replication` | 7-token enzyme drag → fork | **Mechanic L: scrubber + embedded picks** | Process narrative; order matters; current viz already a fork — keep the fork, drag = scrub |
| `node-transcription` | 5-token drag → bubble | **Mechanic L: scrubber** | Same logic as replication |
| `node-translation` | 5-token drag → ribosome | **Mechanic L: scrubber** | Same |
| `node-mitosis` | 5-token PMAT drag | **Mechanic A: numbered radio matrix** + scrubber | Discrete ordered states (PMAT) — radio for the sequence quiz, scrubber for the visualization |
| `node-glycolysis` | 5-token drag | **Already replaced** by `initKrebsScrubber` — extend to glycolysis-only sub-scrubber |
| `node-water` | 5-token classify by molecule type | **Mechanic D: tap-to-tag chips** | Categorization, not sequencing |
| `node-carbs` | 5-token drag | **Mechanic D: tap-to-tag chips** | Same |
| `node-lipids` | 5-token drag | **Mechanic D: tap-to-tag chips** | Same |
| `node-proteins` | 5-token drag | **Mechanic D: tap-to-tag chips** | Same |
| `node-nucleic` | 5-token drag | **Mechanic D: tap-to-tag chips** | Same |
| `node-enzymes` | 5-token drag | **Already replaced** by Michaelis-Menten slider |
| `node-prokaryote` | 5-token classifier | **Mechanic E: toggle-per-item** (Pro/Eu) | Binary classification |
| `node-organelles` | 5-token drag → cell | **Mechanic F: tap-to-reveal then chip-pick** | Anatomy labeling on a cell SVG |
| `node-membrane` | 5-token transport mode classifier | **Already replaced** by tonicity slider (categorization branch deferred) — add chip-tag for transport modes |
| `node-signaling` | 5-token receptor classifier | **Mechanic D: tap-to-tag chips** | Categorization (GPCR/RTK/steroid/ligand-gated) |
| `node-krebs` | 5-token phase order | **Already replaced** by `initKrebsScrubber` |
| `node-photo` | 5-token phase order | **Already replaced** by `initZScheme` |

### bio-genetics.html (5 sandboxes)

| Node | Current | Replacement | Why |
|---|---|---|---|
| `node-mendelian` | 4-token drag (genotype/phenotype) | **Already replaced** by Punnett solver (existing) — supplement with probability-tree (built) |
| `node-meiosis` | 5-token phase drag | **Mechanic A: numbered radio matrix** | Discrete ordered phases |
| `node-linkage` | 5-token drag | **Mechanic J: slider** (recombination frequency 0-50%) | Continuous biology — RF is genuinely continuous |
| `node-pedigrees` | 5-token pattern classifier | **Mechanic H: branching diagnostic tree** | Per brainstorm — pedigree decision tree was tier-A |
| `node-hardy-weinberg` | 5-token drag | **Already replaced** by HW bubble cloud |

### bio-physiology.html (4 sandboxes)

| Node | Current | Replacement | Why |
|---|---|---|---|
| `node-action-potential` | 5-token ion event drag | **Mechanic L: scrubber + embedded picks** | Continuous biology + ordered events; AP curve already exists |
| `node-synaptic` | 5-token drag | **Mechanic L: scrubber** + parameter sliders for NT type, postsynaptic Vm | Continuous + ordered |
| `node-cardiovascular` | 5-token chamber/valve drag | **Mechanic F: tap-to-reveal anatomy** + cardiac scrubber (already built) | Anatomy labeling |
| `node-nephron` | 5-token segment drag | **Mechanic J: slider** (dehydration → overhydration) + tap-to-reveal segment | Continuous (ADH/aldosterone) + anatomy |

### bio-diversity.html (2 sandboxes)

| Node | Current | Replacement | Why |
|---|---|---|---|
| `node-domains` | 5-token domain classifier | **Mechanic D: tap-to-tag chips** | Categorization |
| `node-bacterial-gene-transfer` | 5-token drag | **Mechanic L: scrubber** with three-pathway toggle | Process narrative |

### bio-devo.html (1 sandbox)

| Node | Current | Replacement | Why |
|---|---|---|---|
| `node-fertilization` | 5-token sequence drag | **Mechanic A: numbered radio matrix** + animated walkthrough | Discrete ordered events; current static SVG OK |

### bio-evolution.html (2 sandboxes)

| Node | Current | Replacement | Why |
|---|---|---|---|
| `node-natural-selection` | 5-token mode classifier | **Mechanic J: slider** for selection coefficient `s` + selection-mode toggle | Continuous biology — selection sim per brainstorm tier-B |
| `node-speciation` | 5-token speciation-mode drag | **Mechanic D: tap-to-tag chips** + animated scenario | Categorization + scenario animator (tier-B) |

## Build order

**Wave 1 — kill the most-visible drag-drops** (the screenshots the user shared):
1. `node-replication` — replace with fork scrubber
2. `node-transcription` — replace with bubble scrubber
3. `node-translation` — replace with ribosome scrubber

**Wave 2 — the high-traffic biochemistry hub**:
4. `node-water`, `node-carbs`, `node-lipids`, `node-proteins`, `node-nucleic` — all 5 to tap-to-tag chips (one shared mechanic)

**Wave 3 — anatomy labeling**:
5. `node-organelles` — tap-to-reveal cell anatomy
6. `node-cardiovascular` — tap-to-reveal heart anatomy
7. `node-mitosis` — radio matrix for PMAT order

**Wave 4 — pedagogically high-impact**:
8. `node-pedigrees` — branching diagnostic tree (per tier-A brainstorm)
9. `node-natural-selection` — slider for selection coefficient
10. `node-meiosis` — radio matrix + scrubber
11. `node-fertilization` — radio matrix + animated walkthrough

**Wave 5 — remaining**:
12-31. Everything else, in author order

## Shared infrastructure to build

Three reusable mechanics that multiple modules will consume:

### `<RadioMatrix>` (Mechanic A)
- HTML structure: `<div data-radio-matrix="X">` with `<div data-row>` per item, columns auto-rendered as radio inputs for ordinal positions (1-N)
- JS: capture row→column selections, validate against correct order, score on submit
- ARIA: each row labeled, radios grouped per row

### `<TapToTag>` (Mechanic D)
- HTML structure: `<div data-tag-source>` with items + `<div data-tag-targets>` with category chips
- JS: tap source → tap target → pair animates, locks. Wrong pair shakes + unlocks.
- ARIA: source items and chips both keyboard-focusable

### `<TapToReveal>` (Mechanic F)
- HTML structure: SVG with `<g data-region="X">` regions + side panel `<div data-reveal-panel>`
- JS: click region → side panel populates from data dict
- Already built for brain explorer (`initBrainExplorer`) — generalize

## Acceptance criteria (per replacement)

- ✓ Zero drag-drop tokens remain
- ✓ All interactions work via tap on touch devices (no long-press, no scroll-conflict)
- ✓ All interactive elements are ≥44×44 px
- ✓ Keyboard-navigable
- ✓ Browser test (`npm run test:browser`) passes
- ✓ Screen reader can announce state changes (`aria-live`)
- ✓ Wong-palette status colors used (blue=correct, vermillion=incorrect, +iconography)
- ✓ Direct labels on diagrams; no side legends

## Estimated effort

~1 day per module after the three shared mechanics are built. Three mechanics ≈ 1 day each. **Total: ~5 weeks of focused work** for all 31, or **2 weeks for waves 1–3 (the visible-first pass)**.
