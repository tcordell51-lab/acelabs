# AceLabs Strategic Research Synthesis (May 2026)

10 parallel research agents scrubbed the web for best-in-class educational interactives, DAT/MCAT competitive landscape, cognitive science, animation tooling, spaced-repetition implementations, gamification patterns, mobile-first medical-edu UX, accessibility/design-system standards, modern web stack tradeoffs, and drag-drop alternatives.

## Market position

**No DAT prep tool ships interactive bio diagrams with integrated spaced repetition.**
- Bootcamp / Booster: video lessons + MCQ Qbanks (zero interactive diagrams)
- AAMC / UWorld: Qbank + minimal explanations
- Anki / AnKing / Lightyear: text cards (no system-level mental model)
- Feralis: canonical bio resource — but a dead PDF

AceLabs's thesis (Riya-mode interactive bio with embedded recall + scrubbers + integrated spaced rep) maps directly onto a gap no incumbent has filled.

## Convergent themes (cited by 4+ independent agents)

1. **Drag-drop is the wrong primitive everywhere.** WCAG 2.5.7 violation, finger occludes target on touch, 3× error rates on mobile, Ponce/Mayer 2021 measured worse learning. Five major tools (PhET, Brilliant, Quizlet, Duolingo, Khan) publicly removed drag-drop.
2. **Slider-driven real-time response is the gold standard.** PhET signature pattern. Bohr curve and Michaelis-Menten in AceLabs already work this way.
3. **Layered depth on a single canvas.** HHMI Basic/Advanced toggle; Concord organism→cell→molecule zoom. Don't navigate away.
4. **FSRS-6 not SM-2.** 20–30% fewer reviews for the same retention. `ts-fsrs` is browser-runnable, MIT.
5. **Auto-generate cards from missed retrievals.** #1 reason students leave Bootcamp for Anki — pre-made decks don't reflect what *this* student missed.
6. **No public leaderboards, no mascots.** Hanus & Fox 2015: gamified group had lower exam scores.
7. **Predicted DAT bio sub-score is the killer motivator** for this audience.
8. **Wong palette for color encoding.** Blue-correct (`#0072B2`) + Vermillion-incorrect (`#D55E00`).
9. **Direct labels on diagrams, never legends.** Tufte + Mayer's contiguity principle.
10. **GSAP is now free for commercial use** (post-Webflow acquisition).
11. **Astro + Svelte islands** when AceLabs migrates the stack.

## Anti-patterns to avoid (cited by 3+ agents)

- Drag-drop with arbitrary slot magnetism
- Cartoon mascots, level-up sounds, confetti
- Streak shame ("YOUR STREAK ENDS IN 3 HOURS")
- Public leaderboards
- Lecture videos > 10 min
- Side-legend labels separated from diagrams
- Red/green status without iconography
- Hand-rolled JS strings instead of components

## 6-phase roadmap

### Phase 1 — Quality floor (1–2 weeks)
- Adopt **Wong color palette** + **AAA contrast** site-wide
- Audit every diagram: **direct labels on structures**
- Replace HTML-entity hacks with proper Unicode + `.innerHTML`
- Mobile: single-column under 600px, **44px minimum touch targets**

### Phase 2 — Replace every drag-drop (3–4 weeks)
- **Sequencing** → numbered radio matrix or up/down sortable list
- **Categorization** → tap-to-tag chips
- **Anatomy labeling** → tap-to-reveal then chip-pick (study/test toggle)
- **Pathway exploration** → branching choose-your-own-pathway
- **Continuous biology** → keep scrubber/slider (already done well)

See [PHASE_2_DRAGDROP_REPLACEMENT.md](../PHASE_2_DRAGDROP_REPLACEMENT.md) for module-by-module spec.

### Phase 3 — Spaced rep done right (2–3 weeks)
- Wire up `ts-fsrs` for FSRS-6 scheduling
- Default desired retention **0.90**, daily caps 15 new / 200 review max
- **Auto-spawn Ace Cards from missed retrieval Qs** with one-tap approval
- Add image occlusion for ~30 highest-yield ADA bio diagrams
- Vacation mode + leech detection at threshold 4

### Phase 4 — Score motivation + dashboard (2 weeks)
- **Predicted DAT bio sub-score** updated weekly
- **Topic-mastery rings** per ADA outline topic
- **Forgiving "study days this month"** counter (no shame)
- Notifications max 3/week

### Phase 5 — Tech stack migration (6–10 weeks evenings)
- Prototype `bio-bonus.html` in Astro + Svelte islands
- Extract `<LabeledArrow>`, `<DiagnosticQuestion>`, `<Tooltip>`, `<MicrographViewer>`
- Port hubs by descending widget-drift, not size
- Add GSAP only where Svelte transitions can't reach

### Phase 6 — Steal the killer features (ongoing)
- **Pause-and-predict** on every animation (HHMI pattern)
- **Find-the-bottleneck reverse engineering** for metabolic pathways
- **Compare-two-runs slider** for physiological scenarios
- **Faded worked examples** for every quantitative bio topic

## Drag-drop replacement cheat sheet

| Goal | Replacement | Source |
|---|---|---|
| Place enzymes in pathway order | Numbered radio matrix OR up/down sortable list | Khan, Microsoft Mobile Eng |
| "What happens next" in a process | Pause-and-pick walkthrough | HHMI |
| Diagnose a broken pathway | Find-the-bottleneck reverse engineering | Iwasa Animation Lab |
| Sort organisms into kingdoms | Tap-to-tag with category chips | Quizlet Learn |
| Polar vs nonpolar / pro vs eu | Toggle-per-item | — |
| Continuous attribute (pH, temp) | Slider | PhET |
| Label a cell / heart / nephron | Tap-to-reveal then chip-pick | BioDigital, Learn.Genetics |
| Spell-the-part-name practice | Type-to-label with autocomplete | Quizlet typed-response |
| Trace a metabolic pathway | Branching choose-your-own-pathway | Brilliant |
| Action potential / cell cycle / mitosis | Scrubber animation (KEEP) | PhET, Bostock |
| Compare two physiological conditions | Dual-track scrubber | PhET |
| Re-order steps of meiosis | Tap-to-place numbered slots | Duolingo |

## Wong color palette + AAA tokens

```css
/* Surfaces */
--surface-bg:        #F7F3E9;  /* warm cream */
--surface-elevated:  #FFFDF7;
--border-subtle:     #D9D2BD;

/* Ink */
--ink-primary:    #1A1F1B;  /* 14.8:1 on cream — AAA */
--ink-secondary:  #3D4A3F;  /* 8.1:1 — AAA */
--ink-tertiary:   #5C6B5E;  /* 5.2:1 — AA only */

/* Brand */
--brand-primary:  #1F3A2E;  /* dark green, 12.2:1 — AAA */
--brand-hover:    #2A4F3E;
--brand-accent:   #009E73;  /* Wong bluish-green for charts */

/* Wong-derived semantic — color-blind safe */
--status-correct:    #0072B2;  /* Wong blue — pair with checkmark */
--status-incorrect:  #D55E00;  /* Wong vermillion — pair with x */
--status-caution:    #E69F00;  /* Wong orange — pair with triangle */
--status-info:       #56B4E9;  /* Wong sky — pair with i */
```

## Typography scale (1.25 modular, 16px base)

| Token | Size/Leading | Font | Use |
|---|---|---|---|
| display | 40/48 | Playfair 600 | Hero only |
| h2 | 32/40 | Playfair 600 | Section |
| h3 | 24/32 | Playfair 600 | Subsection |
| h4 | 18/24 | Inter 600 | Card title |
| body | 17/27 | Inter 400 | Coach notes, prose |
| stem | 18/28 | Inter 400 | Question stems |
| label | 14/20 | Inter 500 | UI labels |
| caption | 13/18 | Inter 400 | Meta |
| code | 15/24 | JetBrains Mono | Formulas, gene names |

## Tech stack recommendation

**Stay vanilla until you commit, then migrate to Astro + Svelte islands.**

Decision tree:
- Solo, < 3 mo horizon: stay vanilla, extract Web Components for reuse
- Solo, > 6 mo horizon, content keeps growing: **Astro + Svelte**
- Team grows to 2+: Astro + Svelte mandatory
- Real-time multiplayer needed: SvelteKit
- Physics-grade 60fps simulations: PhET's Scenery or Pixi.js

**Animation library: GSAP** (now free post-Webflow acquisition). Plugins included: DrawSVG, MorphSVG, MotionPath. Pair with raw SVG + D3 for charts. Skip Lottie, Three.js, anime.js, SVG.js.

## FSRS implementation summary

- Library: `ts-fsrs` (MIT, browser-runnable)
- Per-card state: `{difficulty, stability, last_review, due, state}`
- Per-student weights: 19 floats, fitted via gradient descent after ~800–1000 reviews
- Default desired retention: **0.90**
- Card formats (in priority order): cloze (70%), image occlusion (25%), basic Q→A (5%)
- Daily limits: **15 new / 200 review max** (3-month timeline)
- Burnout prevention: vacation mode, leech detection at 4 lapses, 3-grade UI (Again/Good/Easy)

## Audience truth

DAT-prep students are 20–24 year-old college students, stressed, time-pressured (3–6 month windows), already intrinsically motivated (they want dental school). What works:
- Reduces friction to next correct rep
- Makes score trajectory visible
- Respects their seriousness

What insults them:
- Cartoon mascots
- "Level up!" celebrations after 5 questions
- Public leaderboards
- Guilt-driven streak notifications

## See also

- Individual agent reports (raw output): preserved in chat history May 2026 session
- [PHASE_2_DRAGDROP_REPLACEMENT.md](../PHASE_2_DRAGDROP_REPLACEMENT.md) — module-by-module replacement plan
- [bio-shared.css design tokens](../../tools/bio/bio-shared.css) — Wong palette implementation
