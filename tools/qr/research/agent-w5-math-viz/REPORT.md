# Agent W5 — Interactive Math Visualization

Lane: design principles that make a math visualization actually teach a concept vs decorate it.

## Synthesis from authorities

**GeoGebra:** bidirectional linking — drag the geometry, equation updates; edit equation, geometry updates. Drag-invariance is the lesson.

**Desmos design philosophy:** "Ask for informal analysis before formal analysis." Intellectual need before instruction (Dan Meyer: "make sure students experience the headache before offering aspirin"). Use diverse verbs (calculate, argue, predict, validate, compare).

**Brilliant.org:** learn by doing. Single concept per lesson. Visual-first hands-on intuition. Drag, connect, arrange — not click-the-radio-button.

**3Blue1Brown (Grant Sanderson):** concrete before abstract. Never start with the definition. Be visual by default. Open with the key exercise. Animation as motion-of-attention — every transition shows what changed and what stayed the same.

**Mathigon Polypad:** mathematical playground. Snap-to-grid affordances encode discoverable structure. Annotation alongside manipulation.

## Manipulables research

- Meta-analysis of 66 studies: moderate effect for virtual manipulables.
- Five affordances drive learning: focused constraint, creative variation, simultaneous linking, efficient precision, motivation.
- **Concreteness fading (Goldstone & Son 2005, McNeil & Fyfe 2012):** start concrete, gradually fade to abstract. Pure-concrete fixates on surface; pure-abstract loses meaning. The fade produces transfer.
- Manipulables can hurt when students attend to perceptual features over math (Willingham, Sloutsky).

## Interaction patterns (NN/g, Smashing, Bret Victor)

- Sliders for "approximate not exact"; provide stepper for exact values.
- Touch target ≥ 44×44 pt.
- Labels above the thumb (finger occlusion).
- Cursor states: pointer/grab/grabbing.
- ~100ms motion for feedback responsiveness.
- Bret Victor: "the barrier to exploration is extremely low — simply click and drag."

## 7 hard principles for any new QR widget

1. **Live recompute on drag, never on Submit.** Every linked quantity updates continuously while dragging. Student sees the relationship, not just the answer.
2. **Show the formula updating live, with the changing variable highlighted.** Symbolic and visual are the same object viewed two ways.
3. **Ask for an informal answer before the formal one.** Sketch/estimate/predict first; reveal precise value second.
4. **One concept per widget.** A widget that teaches the unit circle does not also teach SOH-CAH-TOA.
5. **Concrete first, then fade to symbolic.** Last screen looks like a real DAT item.
6. **Snap to math-meaningful states with override.** Sliders snap to integer coefficients, angles to reference angles, vertices to lattice — hold-modifier overrides.
7. **Animate every transition; never cut.** ~100–250ms interpolation. Motion shows invariance.

## Anti-pattern checklist

- Widget requires Submit button to see manipulation result
- Formula rendered as static image; only the picture moves
- Widget opens by displaying the answer
- Slider has no live numeric label, or label below thumb
- Manipulable never connects to symbolic form a DAT item would use
- Animation snaps from A to B with no in-between frames
- Widget teaches three concepts at once with no scaffolding

## Sources

- GeoGebra Tandfonline 2024: https://www.tandfonline.com/doi/full/10.1080/2331186X.2024.2379745
- Desmos Guide 2021: https://blog.desmos.com/articles/desmos-guide-to-building-great-digital-math-2021/
- Brilliant.org About: https://brilliant.org/about/
- 3Blue1Brown About: https://www.3blue1brown.com/about/
- Sanderson Lex Fridman / Dwarkesh interviews
- Mathigon Polypad: https://mathigon.org/
- Manipulables meta-analysis ERIC EJ1154970: https://eric.ed.gov/?id=EJ1154970
- McNeil & Fyfe concreteness fading: https://www.sciencedirect.com/science/article/abs/pii/S0959475214000942
- NN/g sliders: https://www.nngroup.com/articles/gui-slider-controls/
- Bret Victor Explorable Explanations: https://worrydream.com/ExplorableExplanations/

## Executive summary

The single most important visualization principle for QR is **continuous live linking between manipulation and symbolic form**: when the student drags any input, every dependent quantity (formula, value, graph, area) recomputes in real time, with the changing symbol updating in place. Every authority converges on this — GeoGebra dynamic-linking, Desmos connected-representations, Brilliant hands-on primitives, 3Blue1Brown animation-as-attention, Bret Victor reactive documents, manipulables literature on simultaneous linking. It's also what QR rewards specifically: students lose points not because they cannot compute, but because they cannot picture which quantity controls which other quantity. A widget that recomputes only on Submit teaches the answer; a widget that recomputes on drag teaches the relationship — which is the actual transferable skill. Build every QR widget so the student can grab something, drag, and watch the algebra rewrite itself character-by-character. Pair this with concreteness fading so the last screen reads like a DAT item. Everything else (snap-points, motion timing, sliders-vs-steppers, intellectual-need framing) is in service of this one principle.
