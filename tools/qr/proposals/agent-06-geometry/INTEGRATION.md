# Agent 06 — Geometry Canvases

Self-contained interactive SVG canvases for the four geometry modules in the AceTheDAT QR study tool. Each file is a standalone HTML page that uses the master CSS variable palette (`--gold`, `--teal`, `--paper`, `--ink`, plus the full `--gold-*`, `--teal-*`, `--paper-*`, `--ink-*`, `--line*`, `--good*`, `--trap*`, `--info*` ramps) and `anime.js` from the same CDN as the master.

## Files

| File | Module section in master | Vehicle |
|---|---|---|
| `tri-inv.html` | `<section id="tri-inv">` | drag triangle vertices, ratio modes, SOHCAHTOA |
| `vol-sa.html` | `<section id="vol-sa">` | cycle 5 solids, dimension sliders, rotation, net |
| `geo-2d.html` | `<section id="geo-2d">` | 6 polygon types, drag verts, circle radius |
| `coord.html` | `<section id="coord">` | drop two points, click-to-test third |

## Drop-in pattern

Each canvas can be embedded into the master `index.html` in two ways:

### 1. Iframe (zero risk to master CSS, recommended for prototype)

```html
<section class="sec" id="tri-inv" data-skill="tri-inv">
  <div class="sec-head">
    <div class="grow">
      <div class="num">QR · TIER 2 · TRIANGLE INVARIANCE</div>
      <h2>Drag the triangle <em>live</em></h2>
    </div>
  </div>
  <iframe src="proposals/agent-06-geometry/tri-inv.html"
          style="width:100%; height:780px; border:1px solid var(--line); border-radius:16px; background:var(--paper)"
          loading="lazy"></iframe>
</section>
```

### 2. Inline (lift only the `.canvas-card` markup + the `<script>` IIFE)

Each script is wrapped in an IIFE and uses unique element IDs prefixed by file (`#tri`, `#shape-layer`, `#solid-layer`, etc.). Most of the IDs are short — if inlining, prefix them per module (e.g. `#tri-svg`, `#vol-svg`) to avoid collisions, then update the JS selectors.

The CSS in each `<style>` block redefines `:root` variables. When inlining, **delete the `:root{}` and `body{...}` blocks** from each canvas file — the master already defines them. Keep the canvas-specific selectors (`.stage`, `.panel`, `.tog`, `.canvas-card`, `.row`, etc.). All canvas-specific selectors are namespaced via `.canvas-card` so they will not leak.

### 3. Light DOM mount with namespacing (production)

For the master, prefix every selector with the section ID:

```css
#tri-inv .canvas-card { ... }
#tri-inv .stage svg .vert { ... }
```

Then drop the SVG markup directly inside the section and call the IIFE on `DOMContentLoaded`.

## Style contract

- Uses **only** master CSS variables for colors. No hex literals appear in fills/strokes that aren't part of the documented ramp.
- No emojis. No unicode glyphs (no checkmarks, stars, arrows). Text-only indicators.
- Vanilla JS, no framework. `anime.js` is loaded but currently unused — reserved for future entrance animations on toggle.
- All canvases are SVG-based (not `<canvas>`). Geometry stays crisp at any zoom and labels stay accessible.
- Touch dragging works via `touchstart`/`touchmove`/`touchend` listeners with `passive:false` and `preventDefault` to suppress page scroll while dragging a vertex.

## Trap coverage (DAT-relevant)

- **tri-inv** — triangle inequality (a+b>c for all three pairs); 30-60-90 and 45-45-90 ratio locks; similar-triangle scale factor; SOHCAHTOA ratios from a chosen vertex.
- **vol-sa** — cube law: V scales k³, SA scales k². Live preview rows for 1×, 2×, 3× scale show the trap of "doubled length, doubled volume" being false.
- **geo-2d** — parallelogram base × **height** (not slant side); trapezoid average-of-parallel-sides; regular polygon (n−2)·180/n; circle C = 2πr vs A = πr².
- **coord** — vertical line "undefined slope" (NOT zero); midpoint averages both coords; distance is Pythagorean.

## Edge cases

- **Degenerate triangle** — `tri-inv` watches all three inequalities with a 0.5 px tolerance and turns the polygon red + flips the validity indicator while still showing computed angles (or zero) gracefully.
- **Vertical line** — `coord` detects `|Δx| < 1e-6` and switches the equation card to `x = c` with "undefined slope" instead of `NaN`.
- **Zero-length side** — `dist`/`angleAt` guards return 0 instead of `NaN`.
- **Cylinder/cone net wrap** — long rectangles in the net are clipped to fit canvas width with a label note.
- **Sphere has no flat net** — explicit text-only message.
- **Regular polygon drag** — dragging any vertex resizes & rotates while keeping regularity (anchored on center).
- **Rectangle, parallelogram, trapezoid** — drag constraints maintain shape class so the labeled formula remains valid.
- **Mobile** — viewBox + `preserveAspectRatio` keeps geometry undistorted on narrow screens; panels collapse to a single column under 820 px.

## What is NOT done

- No save/share/export.
- No keyboard navigation (drag only).
- `anime.js` not yet wired to mode-toggle entrance animations.
- No dark-mode-specific overrides — the canvases inherit the master's dark-theme variables when the master toggles `body[data-theme="dark"]`. Standalone canvas files do not include the dark variables; if you want dark previews while the canvas is open standalone, paste the master's `body[data-theme="dark"]{...}` block.
