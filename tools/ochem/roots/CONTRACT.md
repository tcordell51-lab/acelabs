# The Roots of Organic: module contract

One file per root at `roots/<id>.js`, an ES module with NO imports. The shell
(`index.html` + `shell.js`) renders the story, the named move, the trap and the
"holds up" chips from `meta`; the module renders only the VISUAL and the YOU TRY.

## Export shape

```js
export const meta = {
  id: 'l2-carbocation',            // must equal the filename without .js
  level: 2,                        // 1 = see the molecule, 2 = where electrons want to go, 3 = see it in 3D
  order: 4,                        // position within the level (1-based)
  needs3D: false,                  // true only if mount() uses api.THREE
  title: 'The stability staircase',
  concept: 'Carbocation stability',
  tagline: 'One ranking quietly runs half of organic chemistry.',
  story: '...',                    // 60 to 140 words, Thomas voice, plain text, no HTML
  moveName: 'Count neighbors, then check for resonance',
  move: ['Count the carbon neighbors on the charged carbon.', '...'],   // 2 to 5 plain-text steps
  trap: 'Careful: ...',            // one sentence, starts with "Careful:"
  holdsUp: ['SN1 speed', 'Where Markovnikov puts the charge', 'Rearrangements'],  // 3 to 6 chips
  drill: 'Booster OChem: Conformations and Stereochemistry'   // the bank to run AFTER owning this root
};

// slots.visual and slots.try are empty <div>s the shell owns. Fill them.
export function mount(slots, api){ ... }

// Node-safe (no document, no window). Generate at least 200 instances of your
// "you try" item and assert the answer function is consistent (for example, the
// correct option is unique, the same seed gives the same item, invariants hold).
export function selfTest(){ return { ok: true, tried: 200, notes: '' }; }
```

## api

```js
api = {
  rng(),                 // seeded [0,1). Use it for everything random so items are reproducible
  seed(n),               // reseed
  pick(arr), shuffle(arr),
  colors: { gold, goldhi, blue, coral, green, amber, grey, ink, ink2, ink3, bg, panel, line },
  THREE,                 // the Three.js r170 namespace, only when meta.needs3D is true, else null
  el(tag, attrs, ...children),   // DOM helper: attrs object (class, text, html NOT allowed, dataset, on* handlers), children strings or nodes
  svg(tag, attrs, ...children),  // same for SVG namespace
  reduced,               // prefers-reduced-motion
  report(ok),            // call ONCE per generated item after the student commits; ok = correct on first try
  coach(text),           // show one coaching line under the try area (shell renders it in the house style)
  clearCoach()
};
```

## The color code (Monica's visual guide, keep it)

gold = the answer, the thing to keep · blue = electron rich · coral = electron poor ·
green = stable, favorable, downhill · amber = high energy, strained · grey = inert scaffolding.
Use `api.colors`, never hard-coded hex.

## The visual

Manipulable, not a picture. The student turns, drags, toggles, slides, or taps. Every
visual has at least one control. 3D visuals (needs3D) get a `<canvas>` from
`api.THREE.WebGLRenderer`, size it to the slot width with a 16:10 aspect, listen to
`resize`, cap devicePixelRatio at 2, honor `api.reduced` (no auto-rotation), and render
only when the slot is on screen (IntersectionObserver). Use MeshStandardMaterial,
environment-free lighting is fine (hemisphere + two directionals). Dispose on nothing;
the page is static.

2D visuals are inline SVG built with `api.svg`, viewBox-based so they scale. Text in
SVG uses `font-family: Georgia, serif` for labels and the mono stack for numbers.

## The you try

Generated, never hand-authored. The answer is COMPUTED from the same data that drew the
item, so it cannot be wrong. Show one item at a time with a clear prompt, tappable
choices or a direct interaction, a commit, then: on correct, a short gold "You can read
it." line and an "Another one" button; on a miss, "Not yet." plus ONE coaching sentence
that names the fixable move (via api.coach), and let them try the same item again. Call
api.report(ok) exactly once per item, with ok = true only when correct on the first try.
Minimum 44px tap targets. Keyboard reachable (buttons, not divs with click handlers).

## Voice (Thomas)

Plain words. Define every term inline at first use. Warm, direct, a little conversational
("right?", "does that make sense?" sparingly). Name what is a rule versus what "just kind
of happens." Compress each topic into one rule of thumb at the end of the story. Use his
analogies verbatim where they exist:
- resonance and stability = helping lift a couch, more helpers means more stable
- atoms want a full octet, "F has seven and wants one more"
- gauche and eclipsed = groups want elbow room; gauche is "battling, super not happy"; eclipsed = a solar eclipse; "just like on a subway, we do not want somebody sitting right next to us"
- sp2 120 degrees = a peace sign, a Mercedes sign, 360 over 3
- the carbonyl oxygen is "the electron bully", it hogs the electrons; "visualize it more than memorize it"
- axial groups = a sail, top heavy; "axial and equatorial just kind of happen, keep an eye on up and down"
- enantiomer versus identical = "walk around and look at it" / "walk behind me"
- "all four must flip" for enantiomers; meso folds "like a hot dog bun"
- "count your carbons, 1-2-3-4"; "do the numbers" for CIP priority; "H on a dash keep it, H on a wedge flip it"
- "we never want a radical or carbocation touching a double bond" (vinylic is poison)
- nucleophile move = "attack, kick it off, attach"
- acidity: "judge the conjugate base, not the acid"; CARDIO = Charge, Atom, Resonance, Dipole induction, Orbital

## Hard rules (the validator rejects the page otherwise)

- No emojis, no decorative glyphs, no em dashes, no en dashes, no ellipsis character, no arrows or checkmarks as characters. Plain hyphen and middle dot only. Say "to" not an arrow.
- No payment words: dollar, price, pay, paid, balance, package, subscription, purchase, credit.
- No pace shaming: behind, off pace, overdue, late, catch up, streak, falling behind.
- No score prediction: predicted, projected, percentile, readiness, on track.
- Never "wrong" or "incorrect" as a headline; a miss is "Not yet."
- Zero network. No fetch, no XMLHttpRequest, no external URLs, no CDN. No imports at all in a module file (the shell passes THREE).
- No localStorage inside a module (the shell keeps progress under one key).
- No innerHTML with generated strings. Build DOM with api.el / api.svg.
- Chemistry must be right. When in doubt, shrink the generator's domain to what you can prove.
- Do not edit any file outside your own `roots/<id>.js` files.

## Testing your module

```
cd ~/code/dat-game-forge
node tools/test-roots.mjs <id>            # runs selfTest() in node, must print OK
node tools/shoot-roots.mjs <id>           # screenshots dev.html?root=<id> to shots/roots-<id>.png (headless, software GL)
```
Look at the screenshot. If it would not impress Thomas, it is not done. Iterate.
