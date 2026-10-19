# Boyle's law review pilot (2026-10-19)

A single review pilot for **Module 2: Boyle's law, halve the volume**. It lives in its own additive folder and nothing else in the Ace repo links to it. It is **not published**: the page carries `noindex`, and there is no link or redirect pointing at it.

> Netlify publishes the repo root (`publish = "."`). A future manual `netlify deploy --prod` would therefore serve this folder at a guessable URL. Move or exclude it before the next deploy if it must stay private.

## What's here

| Path | What it is |
|---|---|
| `index.html`, `boyle.css`, `boyle-app.js` | Interactive module: the captioned animatic player plus the explore piston and the learning checks. |
| `boyle-model.js` | The pure model, the storyboard with exact narration, the caption cues, and a deterministic particle sim. It has no DOM code and is shared by the page and the tests. |
| `captions.vtt`, `transcript.md` | Generated from the storyboard by `render/build-captions.js`. |
| `exports/boyle-animatic-silent.mp4` | The silent animatic: 55.0 s, 1920×1080, 30 fps, H.264, no audio track, captions burned into the caption band. |
| `exports/poster.png` | Poster frame (t = 45 s). |
| `exports/qa-stills/` | 18 stills: every storyboard boundary plus the midpoint of each scientific transition. |
| `exports/contact-sheet-1fps.png` | One frame per second taken from the final MP4. |
| `exports/screens/` | Responsive screenshots at 1440 px and 390 px (animatic view and explore view). |
| `tests/` | `model.test.js` (node:test), `browser.test.mjs` (Playwright), and `results/`, which holds the output of the last run. |
| `render/` | `render-animatic.mjs` (frame export and ffmpeg encode), `build-captions.js`, `shoot.mjs` (ad-hoc stills). |
| `fonts/` | Inter 4.0 Regular/Medium/Bold (OTF) with `LICENSE-Inter.txt` (SIL OFL 1.1). |

## Run

```
npx serve review-pilots/boyle-2026-10-19     # or any static server; open index.html
node --test review-pilots/boyle-2026-10-19/tests/model.test.js
node --test review-pilots/boyle-2026-10-19/tests/browser.test.mjs
node review-pilots/boyle-2026-10-19/render/build-captions.js
node review-pilots/boyle-2026-10-19/render/render-animatic.mjs [framesDir] [fps]
```

Add `?render=1` to the page URL to get the exact 1920×1080 export frame. `window.__boyle.seek(t)` renders any time deterministically (seed 20261019).

## Model and behaviour

- Ideal gas, sealed. T = 300 K, n = 2/(0.082057×300) ≈ 0.08124 mol, PV = 2.00 L·atm, P = 2/V over V ∈ [0.50, 4.00] L in 0.05 L steps.
- The 24 dots are schematic. Wall collisions are elastic and only flip velocity signs, so each dot's speed, and so the speed distribution, is identical at every volume. Compression does not heat the gas in this isothermal model.
- Wall-contact marks are labelled illustrative.
- Interaction state `{volumeL, revealPressure, running, graphMode, prediction}` is kept separate from playback time.
- The slider, numeric input and presets all write one canonical volume. Invalid input is rejected with a message, never silently clamped. In-range input snaps to 0.05 L and the page says so.
- Replay restarts only the animatic. Reset restores V = 2, hides P, and clears all answers.
- With reduced motion, each step shows as a settled still frame, with no particle motion.

## Test results (last run, in `tests/results/`)

- Model: **17/17 pass**. Covers the preset fixtures, |PV−2| < 1e−10 at all 71 slider stops, input rejection, hyperbolic vs linear graphs, feedback text, transfer tolerance, storyboard and caption coverage, VTT sync, particle count/radius/speed invariance and enclosure, determinism, and contrast ≥ 4.5:1 for every colour pairing used.
- Browser: **16/16 pass**. Covers all shared and object IDs, absolute labelling, presets, keyboard vs preset equivalence, Tab reachability, validation, reveal and graph toggles, replay keeps answers while reset clears them, caption track at every 0.5 s, reduced motion, 1440/390 layout (no horizontal scroll, no graph/caption overlap, interactive text ≥ 16 px), byte-identical repeat renders, seek-order independence (pixel tolerance 1e−4), and zero console errors.

## Known gaps (not done or not claimed)

- **No voice track.** The animatic is silent by design: no TTS was used. Caption timing comes from the storyboard, not from measured audio alignment.
- **Human checks outstanding.** A human has not watched the MP4 at normal speed. Visual QA was done on the 18 stills and the 1 fps contact sheet only.
- **Sign-off required.** Chemistry sign-off is needed before any publication.
- **No accessibility audit.** No WCAG conformance is claimed, and the page has not been tested with a screen reader.
- **Small diagram labels on phones.** At 390 px the diagram's SVG labels shrink to about 12 px. The same values are also shown as ≥ 16 px HTML in the quantities panel and the scene summary.
- **Seek-order rendering.** Chromium can differ by a few anti-aliased pixels when frames are rendered in a different seek order. Same-order renders, which is what the exporter does, are byte-identical.

## Provenance and rights

The script, questions and diagrams are original. OpenStax Chemistry 2e [9.2](https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law) and [9.5](https://openstax.org/books/chemistry-2e/pages/9-5-the-kinetic-molecular-theory) were used only to verify facts. No OpenStax text or figures are copied.

Tool versions: Node 22.22.0; Playwright 1.56.1 with Chromium build 1194 (preinstalled); ffmpeg 6.1.1 (Ubuntu 7:6.1.1-3ubuntu5, libx264); Inter 4.0 (Debian `fonts-inter` 4.0+ds-1, OFL 1.1). No paid tools, external services, purchased assets or new dependencies were used.
