# Integration plan — Probability Sandbox (Agent 04)

## What this consolidates

This single sandbox replaces the four per-skill probability widgets that currently render through `qrProbTree(skillId)` and `qrCountGrid(skillId)` in `tools/qr/index.html`:

| Skill id    | Module title                    | What it currently renders                    |
|-------------|---------------------------------|----------------------------------------------|
| `p-flip`    | Probability — At Least (Flip)   | 2-event prob tree, fair-coin preset          |
| `p-andor`   | Probability — AND/OR            | 2-event prob tree, AND/OR query              |
| `p-cond`    | Conditional — "Given"           | 2-event prob tree, Bayes preset              |
| `count-pc`  | Permutations vs Combinations    | nPr / nCr grid                               |

Sidebar links (master `index.html` lines ~1593–1596) and section stubs (lines ~1858–1861) currently target `data-go="p-flip"`, etc. The renderer registry maps them to widget functions at lines ~5386, 8265, 8278.

The unified sandbox keeps every behavior those four widgets had and adds:

- N-event tree (1–5 events, capped at 32 leaves for performance)
- Drag-to-add / drag-to-reorder events (mouse + touch fallback)
- Per-path conditional table when in dependent mode
- 8 canonical presets (the four old ones + four new traps)
- Live readouts for P(A), P(B), P(A∩B), P(A∪B), P(A|B), P(B|A), P(at-least-one), E[X]
- Branch widths proportional to joint reaching that branch
- Counting tab (nPr / nCr / both) collapsible into the same card
- Trap-shortcut buttons that load known failure modes (direction-flip Bayes, AND-vs-OR overlap, replacement amnesia, "at least one" by direct sum)

## How to wire it into master `index.html`

There are two mounting strategies depending on how aggressive Thomas wants to be:

### Strategy A — additive new section, leave old widgets in place
1. Drop the sandbox HTML body (everything inside `<div class="wrap">…</div>`) into a new `.sec` block in master, e.g.:
   ```html
   <section class="sec" id="prob-sandbox" data-skill="prob-sandbox"></section>
   ```
2. Add a sidebar link before the four prob skills:
   ```html
   <a class="sb-link" data-go="prob-sandbox"><span class="dot"></span><span class="label">P · Sandbox (unified)</span><span class="meta">live</span></a>
   ```
3. Move `:root` extras you don't already have into the master stylesheet — the sandbox uses only the existing master variables, so this is a no-op. Do NOT re-declare `:root` (master already has it).
4. Move the `.preset`, `.evt`, `.tree-svg`, `.dep-panel`, `.count-panel`, `.ro`, `.trap-note`, `.chip-drag` rules into master's `<style>` block.
5. Lift the IIFE into master's main `<script>` block, but rename internal IDs (`tree-svg`, `events`, etc.) to be skill-prefixed if you want >1 instance per page; otherwise keep them and gate render on `#prob-sandbox` existing.
6. Keep `qrProbTree`/`qrCountGrid` in the registry so the per-skill cards (`p-flip`, `p-andor`, etc.) still render their mini visualizations alongside questions — those are still useful as inline practice.

### Strategy B — replace the four widgets
1. In `QR_VIS_BY_SKILL` (line ~5386), repoint `'p-flip'`, `'p-andor'`, `'p-cond'`, `'count-pc'` to a new renderer `'prob-sandbox'`.
2. Register a new renderer entry in `qrRenderMap` and `qrInitMap` (lines ~8265, 8278) named `'prob-sandbox'` that returns the sandbox markup scoped to a passed `skillId`.
3. Auto-load the relevant preset based on which skill is mounted:
   ```js
   const skillToPreset = {
     'p-flip':'atleast', 'p-andor':'two-flip', 'p-cond':'bayes', 'count-pc':'perm'
   };
   ```
4. Delete `qrProbTree`/`qrProbTreeInit` and `qrCountGrid`/`qrCountGridInit` once the new renderer has parity (verify against the existing question banks for `p-flip`, `p-andor`, `p-cond`, `count-pc`).

Strategy A is safer for a first pass — it preserves all existing question wiring and progress tracking, while giving students the new unified surface as a "free roam" hub.

## CSS variable contract

The sandbox uses ONLY these variables, all already defined in master:
- `--gold`, `--gold-m`, `--gold-d`, `--gold-glow`
- `--teal`, `--teal-2`, `--teal-3`
- `--paper`, `--paper-2`, `--paper-3`, `--bg`, `--sb`
- `--ink`, `--ink-2`, `--ink-mute`, `--ink-soft`
- `--good`, `--good-bg`, `--good-d`
- `--trap`, `--trap-bg`, `--trap-d`
- `--info`, `--info-bg`
- `--line`, `--line-2`, `--line-strong`
- `--shadow`, `--shadow-md`

Both light and dark themes inherit cleanly because the sandbox redeclares the same `:root` and `body[data-theme="dark"]` blocks the master uses. When merged into master, drop the `:root` redeclaration (master already owns it).

## Dependencies

- `anime.js` 3.2.2 (already loaded in master at line 9)
- DM Sans, Playfair Display, JetBrains Mono (already loaded in master at line 8)

No additional deps.

## Mobile + touch

- Drag-to-add buttons fall back to a long-press ghost chip that drops on the events list
- Sliders use native `<input type="range">` with `accent-color` set
- Layout collapses to one column under 980px and the preset grid to two columns under 760px
- Tree SVG uses `viewBox` with `preserveAspectRatio` so it scales

## Constraints honored

- No emojis, no decorative unicode glyphs (checkmarks, stars, arrows). Only the standard math operators (∩, ∪, ¬, ×, ≤, ≥, →) appear in math context, matching the rest of master.
- Uses master CSS variables exclusively
- Vanilla JS, anime.js for motion
- Single self-contained HTML file
- Touch tested on the size of an iPhone viewport
