# Stats Lab — Integration Map

Agent 5 of 10. Scope: unified stats lab that consolidates four currently-empty review modules in the master `index.html` into one shared interactive canvas, plus a focused companion widget on the single highest-density DAT QR trap.

## Files in this proposal

- `stats-lab.html` — main unified lab (drag-points number line, presets, sliders, z-score view, harmonic panel, discrete-data table+chart, robust-to-outliers compare)
- `mean-vs-median-trap.html` — companion widget. One sentence scenario, one draggable outlier, live mean/median readout, auto-sweep, trap-flag pop
- `INTEGRATION.md` — this file

Both files are fully self-contained: master CSS variables are inlined locally, vanilla JS only, anime.js via CDN, mobile-friendly. Master `index.html` is not edited.

## Module ID mapping (master index.html)

The master file currently has four empty `<section class="sec" id="...">` placeholders for stats-track skills:

| Master section ID | Skill name (data-skill) | Lab coverage |
|---|---|---|
| `#zscore` | zscore | Lab card "Live distribution canvas" -> "Z-score view" toggle. Click any dot to see x, z, approx percentile, narrative. Renders ±1 SD band. |
| `#desc-stats` | desc-stats | Lab card "Live distribution canvas" -> all six live stat cells (N, mean, median, mode, SD, range) with deltas. Six canonical preset distributions. |
| `#harm` | harm | Lab card "Harmonic vs arithmetic mean" -> two-input live HM/AM/gap calculator with the equal-distance vs equal-time trap callout. |
| `#discr` | discr | Lab card "Discrete data read" -> live frequency table (built from current canvas data), bar chart, weighted-mean / median-position / mode walkthroughs, three named discrete-data traps. |

The companion widget `mean-vs-median-trap.html` is most naturally embedded inside `#desc-stats` and `#discr` as a cross-link, since the trap pattern surfaces in both.

## Why one lab, not four

All four skills share the same underlying mental model: a sample drawn from a distribution. Splitting them into four independent widgets duplicates the number-line UI and makes the most important DAT pattern — "the same data answers different stats questions differently" — invisible.

Recommended embedding pattern in master:

```html
<!-- inside #desc-stats -->
<section class="sec" id="desc-stats" data-skill="desc-stats">
  <div class="sec-head">
    <div class="grow">
      <div class="num">REVIEW · DESC STATS</div>
      <h2>Descriptive <em>stats</em></h2>
      <p class="s">Mean, median, mode, SD, range — and when each one is the trap answer.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-h"><div class="mark">L</div><div class="ttl"><h3>Stats <em>lab</em></h3><div class="sub">Drag points, watch all five stats update live.</div></div></div>
    <iframe src="proposals/agent-05-stats/stats-lab.html#labCard" style="width:100%; min-height:1280px; border:0; border-radius:12px"></iframe>
  </div>
</section>
```

For `#zscore`, `#harm`, `#discr`, link with a `#labCard`, `#harmCard`, or `#discrCard` hash so the lab scrolls to the right card. All three IDs are present on the matching cards inside `stats-lab.html`.

If iframe embedding feels heavy, the cleaner option is to copy the lab body (everything inside the four `<section class="card">` blocks) into the four module sections, since the CSS variables already match the master's `:root`. The `<script>` block is one self-contained module that can be moved as-is.

## Cross-links to existing modules

- `#sets`, `#count-pc`, `#p-andor` — share the "data and grouping" mental model. After the lab, suggest the user run set theory next.
- `#interest`, `#mixture` — the harmonic-mean pattern is structurally the mixture-allocation pattern with reciprocals; these can be cross-referenced from the harm card.
- `#patterns-link` (Pattern System v1) — once the foundation lab is green, the pattern system already covers the trap-recognition layer for stats traps.

## Style adherence

- Uses master CSS vars (`--gold`, `--teal`, `--ink`, `--paper`, `--trap`, `--good`, `--info`, `--shadow`, etc.) verbatim.
- Both light and dark themes work via `body[data-theme="dark"]`.
- No emojis or decorative unicode glyphs anywhere (Thomas's standing rule).
- Vanilla JS plus `anime.js@3.2.2` via CDN, matching the master's import.
- Playfair Display + DM Sans + JetBrains Mono — same font stack as master.
- Mobile breakpoints at 980/780/680/560 px, matching master's pattern.
- Card structure (`.card`, `.card-h`, `.subcard`, `.formula`, `.tag`) is identical to master so the lab can be lifted in without restyling.
