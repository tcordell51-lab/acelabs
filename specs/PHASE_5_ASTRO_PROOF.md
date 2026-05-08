# Phase 5 Prototype — Astro + Svelte Proof of Concept

**Status:** Working build verified May 2026.

## What was built

`/astro-proto/` — an isolated Astro project that ports the **Hardy-Weinberg bubble cloud** interactive from vanilla JS (in `bio-shared.js`) to a single Svelte component.

- `astro-proto/astro.config.mjs` — config (outputs to `dist-astro/`)
- `astro-proto/src/components/HwBubble.svelte` — the interactive component (~150 lines)
- `astro-proto/src/pages/index.astro` — the page that hosts it (server-rendered)

## Build numbers

| Metric | Value |
|---|---|
| Build time | 816 ms |
| Total dist size | 72 KB |
| HTML size (server-rendered) | 22 KB |
| Svelte runtime JS | ~30 KB |
| HwBubble component JS | ~12 KB |
| Total JS shipped per page | ~42 KB |
| Page renders without JS | YES (static HTML) |
| Island hydrates only when visible | YES (`client:visible`) |

## Comparison to vanilla equivalent

The same HW bubble in `bio-shared.js`:
- ~250 lines of imperative DOM mutation (HW_BUBBLE_HTML constant + initHwBubbleCloud function)
- Manual `document.getElementById(...).innerHTML = ...` everywhere
- Required global wiring in `init()` + `safe()` wrapper for crash isolation
- Required jsdom + Playwright tests just to verify the init runs

The Svelte version:
- ~150 lines, all declarative (`bind:value={q}`, `$derived`, `{#each}`)
- Zero global state, zero init function, zero crash blast radius
- Works on its own; no test scaffolding needed to verify init
- Reusable on any Astro page via `import HwBubble from '...'`
- Strongly-typed reactive dataflow (Svelte 5 runes)

## Browser test result

Verified via Playwright:
- HTML renders server-side, page is interactive within ~200ms after load
- Slider drag triggers reactive update: q `0.30` → `0.70` correctly recomputes circles, equation, scenario
- Zero JS errors
- Screenshot saved to `test-screenshots/astro-proof.png`

## DX wins observed

1. **Component scope by default.** The Svelte file owns its state, its template, its style. No leakage to other modules.
2. **Reactive math.** `$derived(p * p)` recomputes only when `p` changes, no manual subscription wiring.
3. **No HTML-entity bugs possible.** Svelte's `{...}` interpolation auto-escapes; `{@html ...}` is the explicit opt-in (used once for the scenario string).
4. **Style scoping.** Component styles don't bleed; no need for BEM or CSS modules.
5. **Type checking** would be free if we add TypeScript later (`<script lang="ts">`).
6. **Hot reload** during dev (`npm run dev`) — change a number, see it instantly. No full page reload, no state loss.

## DX costs observed

1. **Build step required.** `npm run build` before deploy (vs zero build for vanilla). Mitigated by: Astro builds in <1s for this proof; full migration likely 10–30s.
2. **One more dependency to maintain.** `node_modules` grew by 138 packages. Not a concern in CI but adds `npm audit` surface.
3. **New mental model.** Svelte 5 runes (`$state`, `$derived`, `$effect`) are different from React hooks or Vue refs. Learning curve ~1 day for a comfortable JS developer.
4. **CSS pipeline split.** This proof inlined component CSS via Svelte's scoped `<style>` block. The existing `bio-shared.css` (1,400+ lines) would need either to be referenced globally OR refactored into per-component scoped CSS. Recommend: keep `bio-shared.css` as a global stylesheet imported once in the Astro layout; refactor to per-component over time.

## Migration cost projection

For the full AceLabs bio engine (6 hubs, ~1.5 MB of vanilla JS, 200+ existing modules):

| Phase | Effort | Outcome |
|---|---|---|
| Scaffold + tooling | 1 weekend | Astro + Svelte + Tailwind/CSS-vars + lint configured |
| Port `bio-bonus.html` (smallest, 11 KB) | 1 weekend | First production-quality Astro page; pattern established |
| Extract 4 highest-drift widgets to Svelte | 1 weekend | `<LabeledArrow>`, `<DiagnosticQuestion>`, `<Tooltip>`, `<MicrographViewer>` |
| Port `bio-cell.html` (largest, 280 KB) | 2 weekends | Validates pattern at scale; the killer test |
| Port remaining 5 hubs | 4-6 weekends | All bio engine on Astro |
| Port QR / GC / OChem | 6-10 weekends | Full AceLabs on Astro |

**Total: ~3–4 months of solo evening/weekend work.** Or 4–6 weekends if the migration is the only priority.

## Recommendation

**Commit to the migration.** The DX win is real and observable. The vanilla approach is a tarpit at AceLabs's current scale (1.5 MB JS, 4,500-line HTML files, repeated copy-paste of the same widget pattern across hubs).

Order of operations:
1. Get one full hub ported end-to-end (`bio-bonus.html` first as the easy test, then `bio-cell.html` as the hard test) before committing to the rest. If `bio-cell.html` ports cleanly, the migration succeeds.
2. Don't migrate the QR / GC / OChem hubs until bio is fully on Astro and the pattern is proven. Those engines have their own legacy state.
3. Keep the existing static site live during migration. Switch the Netlify deploy to Astro only when feature parity is reached.

## Trying it out

```bash
cd astro-proto
npx astro dev          # local dev server with hot reload
npx astro build        # production build → dist-astro/
npx serve ../dist-astro -l 4001   # serve the build locally
```

Open <http://localhost:4001> and drag the slider. Compare to <http://localhost:4000/tools/bio/bio-evolution.html> (the vanilla equivalent inside the existing site).

## Files preserved

- `astro-proto/` — full working scaffold, in-tree
- `dist-astro/` — built output (gitignore-able)
- `test-screenshots/astro-proof.png` — visual confirmation the proof renders
