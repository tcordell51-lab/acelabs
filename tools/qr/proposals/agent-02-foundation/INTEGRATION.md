# Agent 02 — Foundation Tier Widget Integration

This package proposes 13 canonical interactive widgets, one per Foundation-tier
skill module. Each demo is a self-contained HTML file that loads in isolation;
none touches global state or shared variables.

## Where each widget slots in

The master file `tools/qr/index.html` already declares 13 empty Foundation-tier
section shells (lines 1837-1849). Each widget is intended to be inserted as the
**Visual** subcard of its section's Concept stage (stage 0), replacing the
existing `<div id="vis-${skillId}"></div>` placeholder rendered by
`renderVisual()` at line 5311.

| Skill ID | Master HTML anchor | Existing visual hook | Proposed widget file |
|---|---|---|---|
| `frac-add` | `<section class="sec" id="frac-add">` (line 1837) | `visualType:'fraction-bar'` (line 3673) | `frac-add.html` |
| `frac-dec` | `<section class="sec" id="frac-dec">` (line 1838) | `visualType:'decimal-strip'` (line 3717) | `frac-dec.html` |
| `pct-of` | `<section class="sec" id="pct-of">` (line 1839) | `visualType:` (line 3751 block) | `pct-of.html` |
| `pct-chg` | `<section class="sec" id="pct-chg">` (line 1840) | `visualType:` (line 3794 block) | `pct-chg.html` |
| `pct-seq` | `<section class="sec" id="pct-seq">` (line 1841) | `visualType:` (line 3852 block) | `pct-seq.html` |
| `lin-eq` | `<section class="sec" id="lin-eq">` (line 1842) | `visualType:` (line 3893 block) | `lin-eq.html` |
| `ratios` | `<section class="sec" id="ratios">` (line 1843) | `visualType:` (line 3944 block) | `ratios.html` |
| `rate-time` | `<section class="sec" id="rate-time">` (line 1844) | `visualType:` (line 3986 block) | `rate-time.html` |
| `word-decode` | `<section class="sec" id="word-decode">` (line 1845) | `visualType:'word-translate-rich'` (line 5385) | `word-decode.html` |
| `frac-mul` | `<section class="sec" id="frac-mul">` (line 1846) | `visualType:` (line 4027 block) | `frac-mul.html` |
| `dec-arith` | `<section class="sec" id="dec-arith">` (line 1847) | `visualType:` (line 4063 block) | `dec-arith.html` |
| `estim` | `<section class="sec" id="estim">` (line 1848) | `visualType:` (line 4097 block) | `estim.html` |
| `mental` | `<section class="sec" id="mental">` (line 1849) | `visualType:` (line 4128 block) | `mental.html` |

## Integration approach

These widgets are designed to drop into the **Concept stage** (stage 0) of the
existing 6-stage scaffold (`Concept → Worked → Faded → Faded → Independent →
Mastery`). The current renderer at line 5283-5300 lays out a 2-column row whose
right side is a `subcard.info` containing `<div id="vis-${skillId}"></div>`.

Each widget HTML is structured so that:

1. The interactive surface (everything inside `.card`) can be lifted out of the
   demo page and dropped into that visual `<div>` directly. The demo's outer
   `.wrap > h1 + .lede` is page chrome and is discarded on integration.
2. The existing CSS variables (`--gold`, `--paper`, `--teal`, `--trap-bg`,
   `--shadow`, etc.) are used throughout — no new variables introduced. A single
   `<style>` block per widget can be merged into the master stylesheet under a
   skill-namespaced prefix (the demos already prefix all classes: `fa-`, `fd-`,
   `po-`, `pc-`, `ps-`, `le-`, `rt-`, `wd-`, `fm-`, `da-`, `es-`, `mt-`).
3. Trap callouts are kept inside each demo so the page renders standalone. On
   integration, the trap text already lives in the master file's `MODULES`
   table (e.g. `MODULES['frac-add'].trap` at line 3701) — the widget's local
   trap-card would be removed and the master `.subcard.trap` (rendered at
   line 5296) would carry that copy instead.

## Suggested wiring (pseudo-code)

In `renderVisual(skillId)` (around line 5311), replace the current
`visualType` switch for the 13 Foundation skills with a mount call:

```js
const FOUND_WIDGETS = {
  'frac-add':  initFracAddWidget,
  'frac-dec':  initFracDecWidget,
  'pct-of':    initPctOfWidget,
  // ...
};
const mount = document.getElementById('vis-' + skillId);
if (FOUND_WIDGETS[skillId]) FOUND_WIDGETS[skillId](mount);
```

Each `init*Widget(mount)` function would inject the widget's `<div class="card">…</div>`
fragment and call its setup script, scoping handlers to the mount node.

## Constraints honored

- Vanilla JS only. anime.js is loaded by the master file but none of these 13
  widgets depend on it (CSS transitions are sufficient).
- No emojis or unicode glyphs anywhere.
- Touch + click handling on every interactive element (drag, scrub, paint).
- Mobile responsive via grid / flex with 640-980px breakpoints.
- Each widget runs independently — no shared globals, no localStorage writes.
- Every widget targets at least 60 seconds of meaningful interaction (most
  cycle 4-12 rounds and reset cleanly).

## Trap-callout source of truth

The `<div class="trap-card">` block at the bottom of each standalone demo
mirrors the `MODULES[skill].trap` text from the master file. On integration
those duplicates are removed; the master `.subcard.trap` (rendered automatically
in stage 0) is the canonical home for trap copy.
