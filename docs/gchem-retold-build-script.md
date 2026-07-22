# GChem, Retold — One-Shot Build Script

*The recipe for cloning what we proved on OChem "Retold" into a General Chemistry tool, in a single orchestrated pass. Written to be executed, not admired. Do not build yet — this is the plan.*

---

## 0. What we are building

A DAT General Chemistry study tool that is architecturally identical to `tools/organic/index.html` ("OChem, Retold") but teaches gen chem. Same front door, same three modes, same coach layer, same personal Map moat, same coach-audio in Thomas's cloned voice, same quality bar. Lives at `tools/gchem/index.html`. Synced to the Booster GChem bank, night for night.

The only thing that changes is the **content** and the **spine**. Everything else is a proven shell we lift wholesale.

---

## 1. The doctrine (why OChem Retold worked — the transferable method)

These are the non-negotiables. They are what made the tool a 10, and they are subject-agnostic.

1. **One spine, stated once and compounded.** OChem had "electron-rich attacks electron-poor." Every night was that sentence in a new costume, and the capstone said it back. GChem needs its own true spine (Section 2) and must compound it, not just state it.
2. **Recognition over memorization.** The student's takeaway is a *recognition move* ("find the green, find the red"), not a fact list. Every quiz tests **transfer to an unseen case**, never "repeat the sentence you just read."
3. **Every load-bearing term is defined inline, in layman's words, at first use.** The OChem audit's single biggest finding was undefined vocabulary. Never let a word do work before it is defined. Plain words, not jargon-first.
4. **The `walk` text is the voiceover.** It must stand alone as audio, eyes closed — no "look at this," no "the middle frame." If a scene's meaning lives only in the picture, the walk has failed.
5. **The voice is crystal clear and never jargon.** No "delta plus / delta minus" — say "partially positive / partially negative." On-screen glyphs can stay technical; the spoken words must be plain.
6. **Skeletal-correct, honest visuals.** Every structure/diagram drawn to standard. Color grammar is reserved: a color means one thing all the way through (in OChem green = electron-rich, red = electron-poor, gold = UI/progress). Pick GChem's grammar in Section 4 and never break it.
7. **Wrong-answer coaching everywhere.** Every quiz carries an `errs[]` array: one short, specific "here is your misconception" line per wrong option. This is the diagnosing-the-mistake pedagogy; it is not optional per scene.
8. **The Map is the moat.** A personal, fog-of-war territory the student fills in by finishing nights, drawn from a local ledger. Nobody else has it. GChem's Map is the equation web (Section 4).
9. **Don't ship below 10/10.** The acceptance gate (Section 7) is the same 4-pass audit we ran on OChem. Zero chemistry errors, every term defined, capstone lands, average >= 9.5.

---

## 2. The GChem spine

OChem had one mechanistic truth. Gen chem is broader, so the spine is a **question you ask first**, not a single reaction:

> **Every gen chem problem is one of two questions: "how many particles?" or "which way does the energy go?" Name the question, and the equation is obvious.**

- **Count the particles.** The *mole* is the only bridge between grams you can weigh and particles that react. Stoichiometry, gases, solutions, redox balancing — all particle counting.
- **Follow the energy downhill.** Systems fall toward the lowest **free energy**: `ΔG = ΔH − TΔS`. Thermochem, phase, solubility, equilibrium, acids/bases, kinetics (the exception — see below), and electrochemistry are all energy bookkeeping.

**The recognition move** (GChem's "find the green, find the red"): *"Am I counting particles or following energy downhill? Which one is this?"*

**The one deliberate twist** the tool hammers: **kinetics is the exception.** Whether a reaction goes (ΔG) and how fast it goes (the hill in the way) are different questions. Teaching that split is where most students break; the tool makes it a named beat.

**The capstone payoff** (the equation web, below): by the end, the student sees that `ΔG = −RT·lnK = −nF·E°cell` — spontaneity, equilibrium, and cell voltage are the *same downhill measured three ways*. That is the "you learned one thing, not a hundred" moment.

---

## 3. The nights

GChem is genuinely bigger than the OChem bank, so it maps to **14 nights** (OChem was 13). Lock the exact list and order to the **Booster GChem chapter order** before building; this is the recommended spine-first ordering. Each night = one Booster topic, one unifying sentence, and the DAT trap it is built to kill.

| # | Title | Booster topic | The one sentence | Kills the trap |
|---|-------|---------------|------------------|----------------|
| 1 | **The Two Questions** | Fundamentals / units / measurement | "Every problem is *how many particles* or *which way does energy go* — name it first." | Blindly plugging numbers without knowing what is being asked |
| 2 | **The Mole Bridge** | Stoichiometry | "The mole is the only bridge from grams to particles; every stoich problem crosses it." | Gram-to-gram shortcuts; limiting-reagent confusion |
| 3 | **The Quantum Address** | Atomic structure, electron config, light | "Every electron has an address and always takes the cheapest empty room first." | Aufbau/Hund/Pauli as three rules instead of one |
| 4 | **One Cause, Every Trend** | Periodic trends | "One thing — how hard the nucleus pulls the outer electrons — sets radius, ionization energy, and electronegativity. Same story, three tellings." | Memorizing three trend charts separately |
| 5 | **Why Atoms Bond** | Bonding, Lewis, formal charge | "Atoms bond to reach a lower-energy filled shell — trade electrons (ionic) or share them (covalent); the bigger the pull-gap, the more it's a trade." | Ionic vs covalent as a hard line instead of a spectrum |
| 6 | **Shape and the Sticky Forces** | VSEPR, hybridization, IMFs | "Electron groups spread as far apart as they can (the shape); shape + polarity set the sticky forces, and sticky forces set every physical property." | Treating boiling point / solubility as facts to memorize |
| 7 | **Gases** | Gas laws, KMT | "A gas is particles counted while they fly; PV=nRT ties pressure, volume, temperature, and count into one line." | Forgetting to convert to Kelvin; partial-pressure mix-ups |
| 8 | **States and Solutions** | Phases, phase diagrams, colligative, solubility | "Melt, boil, or dissolve is a tug-of-war between sticky forces and disorder — phase changes and dissolving are the same fight." | Colligative properties as rote formulas |
| 9 | **The Energy Ledger** | Thermochemistry | "Heat is energy moving; enthalpy is the ledger, and Hess's law says the ledger only cares about start and finish, never the path." | Sign errors; path-dependence confusion |
| 10 | **Downhill** | Thermodynamics: entropy, Gibbs | "Everything spontaneous runs downhill in free energy: ΔG = ΔH − TΔS. Enthalpy and entropy fight; temperature is the referee." | "Exothermic = spontaneous" |
| 11 | **How Fast, Not How Far** | Kinetics | "Whether it goes (ΔG) and how fast it goes are different questions. Kinetics is only the hill in the way, never the valley beyond it." | Conflating thermodynamics with rate; "catalyst shifts equilibrium" |
| 12 | **Balance and the Push-Back** | Equilibrium, Le Chatelier, Ksp | "At equilibrium the reaction still runs both ways at equal speed; push it and it shifts to undo the push. Q vs K says which way." | Thinking equilibrium = stopped; Le Chatelier as memorized cases |
| 13 | **Proton Traffic** | Acids, bases, buffers, titration | "Acids and bases are proton traffic, and it's all one equilibrium: strong goes all the way, weak sits at balance, a buffer refuses to let pH move." | pH math without the equilibrium picture; buffer confusion |
| 14 | **The Charge Ledger + Capstone** | Redox and electrochemistry | "Redox is electron bookkeeping; a battery just makes those electrons walk through a wire. ΔG, K, and cell voltage are the same downhill in three costumes." | Balancing redox blindly; sign of E°cell; **and the finale ties the whole equation web together** |

Nuclear chemistry folds into Night 3 (a 1-2 scene coda on the nucleus). Lab / measurement / sig-figs threads through Night 1 and Night 9. If Booster splits or merges any of these, follow Booster — the sync is the promise.

Each night ships **6-7 scenes** (OChem's proven density), including at least: one spine-callback scene, one "master move" scene with a worked visual, one common-trap scene, and a transfer quiz on every scene.

---

## 4. The architecture to clone (lift from `tools/organic/`)

Do not reinvent any of this. Copy the OChem shell and swap the data.

- **Data shape.** `NIGHTS[n] = { t, booster, lede, scenes:[ {n, t, svg, walk, teach, q:{stem, opts[], errs[], correct, explain}} ] }`. Identical schema.
- **Three modes.** "Walk it yourself" (student) and "Teach mode" (coach), plus the front door. Coach chrome vanishes in walk mode. Reuse the coach layer verbatim: `P` = gold pen, `C` = clear, `Space`/`R` = reveal next scene, arrows scroll, `#coachHint`, `#coachReps` "Drill it now" strip.
- **Renderer.** smiles-drawer for molecules where relevant, but GChem leans on **hand-authored SVG diagrams** (energy diagrams, phase diagrams, orbital boxes, ICE tables, cell schematics, titration curves). Same HiDPI 2x canvas approach; same molcard/molrow/caption CSS.
- **Color grammar (pick and lock).** Proposed: **warm/orange = energy released / exothermic / downhill**, **cool/blue = energy absorbed / endothermic / uphill**, **gold = UI/progress**, and reserve **green/red only if** a night needs a rich/poor idea (acids/bases). Decide once, enforce everywhere. (This mirrors OChem reserving green/red for electron semantics.)
- **The Map = the equation web (the moat).** Nodes are the master quantities: **ΔG, K, Q, E°cell, Ksp, ΔH, ΔS, pH, Ka, rate/Ea**. Edges are the equations that link them: `ΔG=ΔH−TΔS`, `ΔG=−RT·lnK`, `ΔG=−nF·E°`, Nernst, Henderson-Hasselbalch, `Ksp` as a K, `Q` vs `K`. Fog-of-war: each edge lights up when its night is completed (ledger-driven). The finished web *is* the revelation that all of GChem is one connected system — the exact analog of OChem's reaction map, and just as unowned by any competitor.
- **Ledger.** Local keys `atDAT_gchem_retold_nN` (scene commits) + a wheel/spoke key if we add drill wheels. `renderMap()` reads the ledger to fill the web. Same read-only aggregator pattern as `shared/ochem-ledger.js`.
- **Coach audio.** Reuse `audio/generate.mjs` pointed at the new `index.html`, same cloned voice `8wDRDuMDgxEoTr8RxAWE` ("Thomas Coach", 13.3-min clone). Same player: reveals PLAY COACH on a fetch-existence check, one clip at a time, silent until a clip exists. Naming `n<night>-s<scene>.mp3`.
- **Student-scope propagation, deploy path, and the syntax validator** all lift unchanged. Keep the node validator (compile-check the `NIGHTS` block) as the gate after every authoring pass.

---

## 5. Scene-authoring rules (the per-scene quality bar)

Every scene must satisfy all of these, or it fails review:

- The `walk` teaches the *why*, not just the rule, and **stands alone as audio**.
- Every new term is defined inline in plain words the first time it appears.
- The visual is skeletal/diagram-correct and obeys the color grammar. No color used for two meanings.
- The `q` tests **transfer** (apply to a case the walk did not spell out), and carries a full `errs[]` array.
- The `teach` line is coach-facing: hand-the-pen, "make them say it before the reveal."
- No unescaped apostrophes inside the single-quoted strings (they break the whole `NIGHTS` object — the one bug that cost us a reload on OChem). Use "it is," escape, or reword.
- Spoken text is jargon-free and unambiguous (no "delta plus"; write "partially positive").

---

## 6. The one-shot execution plan (the Workflow)

One orchestrated run, six phases. This is the actual "one-shot."

- **Phase A — Scaffold (inline, no agents).** Copy `tools/organic/index.html` to `tools/gchem/index.html`. Strip the 13 OChem nights and the reaction Map graph; keep every piece of chrome (header, modes, coach layer, coach-reps strip, audio player, ledger reader, student-scope, CSS). Drop in the 14-night skeleton and the equation-web Map graph (nodes + edges + which night unlocks each edge). Commit the empty, valid shell; run the validator (must pass with 0 scenes).
- **Phase B — Author (pipeline, 14 agents, one per night).** Each agent gets: the night's row from Section 3, the schema, the Section 5 rules, and 2-3 example scenes lifted from OChem as the gold standard. It returns validated scene JS for its night via a StructuredOutput schema (so the shape is guaranteed). Nights author in parallel; no barrier.
- **Phase C — Adversarial chemistry verify (pipeline stage, per night).** As each night finishes authoring, an independent verifier tries to **refute** every factual claim and re-derives every quiz's correct answer + checks each `errs` line. This is the guard against exactly the errors we found in OChem (the NMR OH mistake, the SOCl2 stereochem). Any refuted claim loops back for a fix. Gate: zero surviving chemistry errors.
- **Phase D — Assemble + render gate.** Concatenate verified nights into `index.html`; run the node validator (syntax); load every night in real Chrome and confirm all scenes render, all canvases/SVGs draw, zero console errors. Wire and render-check the equation-web Map filling from a seeded ledger.
- **Phase E — Coach audio.** `generate.mjs --force` in the cloned voice; validate clip count and durations; spot-play 3 clips across nights. Hold the mp3 commit until Thomas signs off on the sound (same gate as OChem).
- **Phase F — Acceptance audit (Section 7).** Run the 4-pass comprehensiveness audit. Fix anything under bar. Repeat until 10/10. Only then ship content live; ship audio on Thomas's word.

Vehicle: a single `Workflow` script (multi-agent), because 14 nights x ~6 scenes x (author + verify) is ~168 agent-tasks that must fan out and gate deterministically. That is precisely what a workflow is for — and it keeps the chemistry-verify pass adversarial and independent, which is where one-shot quality is won or lost.

---

## 7. Acceptance gate (same rubric that got OChem to 10)

Four parallel audit passes (nights 1-4, 5-7, 8-11, 12-14), each answering one question: *if a student reads/hears only these scenes, do they walk away actually understanding, or are there gaps they'd trip on?* Each pass scores every night /10 and flags, with quotes: undefined terms, skipped steps, claims without a why, memorization quizzes, audio-dead scenes, chemistry errors. Ship criteria:

- Average >= 9.5, no single night < 9.
- **Zero** chemistry errors surviving the adversarial pass.
- Every load-bearing term defined inline.
- The Night 14 capstone provably ties the equation web together and says the spine back.
- Every quiz tests transfer and has full wrong-answer coaching.

If any criterion misses, fix and re-audit. Don't ship below 10/10.

---

## 8. Before we pull the trigger — what I need from you

1. **Lock the night list to Booster.** Confirm the 14 nights + order above, or hand me Booster's GChem chapter list and I'll snap to it exactly.
2. **Bless the spine.** "Count the particles / follow the energy downhill," with kinetics as the named exception, and the `ΔG = −RT·lnK = −nF·E°` equation-web capstone. If a different framing sits better in your voice, say so now — the spine is load-bearing.
3. **Bless the Map.** The equation web as the moat (vs. some other territory — e.g., a periodic-table-based map).
4. **Green-light the voice.** Reuse the same "Thomas Coach" clone for GChem audio.
5. **Any GChem must-haves** the DAT leans on that you want guaranteed coverage of (e.g., the specific constants/equation sheet conventions, sig-fig rules, the exact redox-balancing method you teach).

Answer those five and I can one-shot the whole thing against this script in a single workflow run.
