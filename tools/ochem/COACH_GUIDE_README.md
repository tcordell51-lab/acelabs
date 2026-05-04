# OChem Coach Guide — Pick the Plan

This is the coach guide for the AceTheDAT OChem Reaction Maps tool (v1). It mirrors the QR coach guide structure so a coach familiar with one system can pick up the other quickly.

> **Status: starter scaffold.** The cross-subject principles, plan structure, and hub-density framework are filled in. The per-session bundling and per-hub trap-emphasis content is marked TODO and should be filled in by **Tommy** as he runs the first cohort of OChem students through the system.

## What this tool is

The OChem Reaction Maps tool is a gamified hub-based encyclopedia of DAT-tested organic chemistry. 12 functional-group hubs + 10 cross-cutting labs/tools, ~27 hand-animated mechanisms with step-through controls. State lives under the `ochem-rem-v1` localStorage namespace.

The coaching pedagogy follows the same cross-subject principles as QR/Bio/GC (see [ACELABS_COACH_GUIDE.md](../../ACELABS_COACH_GUIDE.md)), with one OChem-specific shift: the work is **reaction-pattern recognition + mechanism narration**, not formula derivation. Students don't *compute* in OChem; they *recognize* and *predict*. The pedagogy emphasizes mechanism narration over numeric calculation.

## Hub inventory (v1)

| # | Hub ID | Family | Notes |
|---|---|---|---|
| 1 | `alkanes` | Alkanes | Foundation — radicals, halogenation, conformations |
| 2 | `subelim` | Substitution + Elimination | The decision-tree chapter (SN1/SN2/E1/E2) |
| 3 | `alkenes` | Alkenes | Markovnikov, hydration, hydrohalogenation, hydrogenation |
| 4 | `alkynes` | Alkynes | Acidity, hydration, reduction, cross-coupling |
| 5 | `alcohols` | Alcohols | Synthesis, oxidation, dehydration, protection |
| 6 | `ethers` | Ethers | Williamson, cleavage, epoxides |
| 7 | `carbonyl` | Aldehydes + Ketones | Nucleophilic addition, enolates, aldol |
| 8 | `acids` | Carboxylic Acids + Derivatives | Esters, amides, anhydrides, acyl chlorides |
| 9 | `amines` | Amines | Synthesis, basicity, Hofmann, diazonium |
| 10 | `aromatic` | Aromatic / EAS | Benzene, EAS directing, NAS |
| 11 | `spec-ir` | IR Spectroscopy | Functional group fingerprints |
| 12 | `spec-nmr` | NMR Spectroscopy | ¹H + ¹³C interpretation |

## Cross-cutting labs / tools

These sit alongside the hubs and provide encyclopedic / drill / synthesis support:

| Tool | What it is |
|---|---|
| `mech-library` | Browseable encyclopedia of all mechanism animations |
| `roadmap` / Master Map | Visual atlas of how all reactions connect |
| `synthesis-lab` | Multi-step synthesis puzzle (forward + retrosynthesis) |
| `reagents` | Reagent reference card — what each reagent does |
| `stereo-lab` | Stereochemistry trainer (R/S, E/Z, chirality) |
| `spec-trainer` | Combined IR + NMR practice problems |
| `flash-deck` | Spaced-repetition flashcards |
| `exam-sim` | Full DAT-format OChem mock |
| `mastery` | Progress dashboard |
| `intro` | Orientation page |

## Three plans

Same structure as QR — 1-month crash, 2-month default, 3-month extra support. OChem plans differ from QR in important ways:

1. **Pattern recognition is the unit, not the formula.** Sessions are organized around mechanism families (hubs), not modules per se.
2. **Cumulative complexity.** Aldol mechanisms (in carbonyl hub) require enolate chemistry which requires acid/base which requires the SN/E decision tree. Sequencing matters.
3. **The reaction maps are encyclopedic, not curricular.** A coach has to impose linear sequence on what's structurally a network. Don't let the student wander.
4. **Spectroscopy late, not early.** IR + NMR (spec-ir, spec-nmr) make sense only after the structure work is solid. Don't try to teach them in week 1.

### 1-month crash (4 sessions / 5 hours)

For students starting at **18–20 range** in OChem who already know basic structure (drawing, stereochem) but freeze on mechanism prediction.

**TODO (Tommy):** Bundle the 12 hubs into 4 sessions. Recommended starting point (the four highest-yield mechanism families):

- **S1:** subelim (SN1/SN2/E1/E2 decision tree) — the highest-leverage single chapter
- **S2:** alkenes (Markovnikov + addition mechanisms) — second-highest yield
- **S3:** aromatic + carbonyl (EAS + nucleophilic addition) — the two patterns DAT loves
- **S4:** Mock + spec-ir + spec-nmr quick-hit + test-day strategy

Other 8 hubs (alkanes, alkynes, alcohols, ethers, acids, amines + the labs) become self-study using the reagent reference, flash deck, and mech-library.

### 2-month default (8 sessions / 10 hours)

For students in the **17–20 range** in OChem.

**TODO (Tommy):** Distribute the 12 hubs across 8 sessions. Recommended starting point:

- **S1:** Diagnostic + alkanes (foundation: radicals, conformations, structural intuition)
- **S2:** subelim (SN1/SN2/E1/E2) — give it the full session
- **S3:** alkenes + alkynes (paired — they share addition logic)
- **S4:** alcohols + ethers (paired — synthesis + transformation)
- **S5:** carbonyl (aldehydes + ketones) — full session, sets up enolate work
- **S6:** acids (carboxylic acids + derivatives — esters, amides, anhydrides)
- **S7:** amines + aromatic (paired — both involve heteroatom or ring chemistry)
- **S8:** Mock + spec-ir + spec-nmr + test-day strategy

### 3-month extra support (12 sessions / 15 hours)

For students in the **14–18 range** in OChem or who froze on OChem in undergrad.

**TODO (Tommy):** Expand to 12 sessions with one hub per session for the trickiest and pairings only for the simpler ones. Suggested split:

- **S1:** Diagnostic + structure + drawing fundamentals (intro hub + alkanes)
- **S2:** alkanes deep-dive (radicals, halogenation, conformations)
- **S3:** subelim — part 1 (SN1 vs SN2 decision tree)
- **S4:** subelim — part 2 (E1 vs E2 + when SN/E compete)
- **S5:** alkenes
- **S6:** alkynes + alcohols
- **S7:** ethers + carbonyl intro
- **S8:** carbonyl deep-dive (enolates, aldol, Claisen)
- **S9:** acids + derivatives (esters, amides, etc.)
- **S10:** amines + aromatic
- **S11:** spec-ir + spec-nmr (full session for spectroscopy — earned, not forced)
- **S12:** Mock + cumulative review + test-day strategy

## OChem-specific coaching principles

In addition to the cross-subject principles in ACELABS_COACH_GUIDE:

### 1. Mechanism narration > memorization

Students who memorize "this reaction gives this product" plateau around 19. Students who narrate the mechanism aloud — "the nucleophile attacks here because…, the leaving group leaves because…, the proton transfer happens because…" — push to 22+. Make narration mandatory in worked examples. The `mech-library` is the visual support for this.

### 2. Decision wizards (especially subelim)

The SN1/SN2/E1/E2 decision tree in the `subelim` hub is the single highest-leverage coaching moment in all of OChem. Walk through substrate / nucleophile / base / solvent EXPLICITLY for the first 2 weeks of any plan that includes substitution/elimination. Don't let students guess.

### 3. Reagent reference, not memorization

Don't ask students to memorize "what does PCC do?" — ask them to look it up the first 20 times in the `reagents` reference. After 20 lookups, recall sticks. Memorization without application doesn't stick.

### 4. Spectroscopy late, not early

IR + NMR (`spec-ir`, `spec-nmr`) are the last topics for a reason. They make sense only after the structure work is solid. Don't try to teach spectroscopy in week 1 even if a student asks — they'll freeze. Bank a "looking forward to spectroscopy" anchor early in the program and deliver it as a reward in the final sessions.

### 5. Use the master map (roadmap) for cross-hub questions

The DAT loves cross-hub questions: a synthesis puzzle that requires alkene chemistry to set up alcohol chemistry to set up oxidation. The `roadmap` / Master Map visualizes how reactions connect. Open it explicitly when a synthesis question comes up. Students who treat each hub as siloed plateau.

### 6. Synthesis Lab is the high end of mastery

The `synthesis-lab` (multi-step synthesis puzzle) is where students transition from "I know the reactions" to "I can plan a synthesis." Save it for sessions 7+ (in the 8-session plan) or sessions 10+ (in the 12-session plan). It's the final-mile workout, not an early-prep tool.

## Per-hub trap-emphasis library (TODO)

For each of the 12 hubs, document:

- **Top trap** — the single mechanism-misprediction the DAT puts in distractors (e.g., "Markovnikov vs anti-Markovnikov direction on alkene additions — the DAT will offer both as choices")
- **Most common stumble + unsticker** — when a student freezes on a hub-specific mechanism
- **Win to bank** — the specific mastery moment per hub

The QR coach guide ([COACH_PREP_CHECKLISTS.md](../../../AceDAT-QR-Remediation/COACH_PREP_CHECKLISTS.md)) is the structural template.

## See also

- [ACELABS_COACH_GUIDE.md](../../ACELABS_COACH_GUIDE.md) — cross-subject principles
- [ACELABS_RECOMMENDED_STACK.md](../../ACELABS_RECOMMENDED_STACK.md) — full DAT stack including OChem
- [QR Coach Guide README](../../../AceDAT-QR-Remediation/COACH_GUIDE_README.md) — structural template
