# OChem Engine Deep Analysis

**Date:** 2026-05-07
**File audited:** `tools/ochem/index.html` (~19,994 lines, 27 sections)
**Rubric:** Content / Visual / Interaction / Scope / Sync, each 1-5.
**Decision per section:** Ship · Polish · Rebuild · Trim.

---

## Executive read

OChem is in better shape than expected after today's chaotic agent runs. **18 sections rate Ship as-is; 9 need Polish; zero need Rebuild.** The gold-standard hubs (02 Alkenes, 04 SN/E atlas, 07 EAS, 08 Carbonyl) are genuinely excellent. The CARDIO section that originally raised concern turned out to be properly built (Plate I-A pKa landmark ladder is dense and accurate). Today's 10/10 + DAT-scoping passes added real value: Strecker, ¹³C NMR ribbon, Mass Spec section, Lindlar/Na-NH₃ combined card, Wolff-Kishner/Clemmensen executioner card.

The 9 Polish items are minor. None block launch. Biggest single UX improvement is the **sidebar reorder** (changes nothing about content, transforms the new-student experience).

---

## Section-by-section ratings

| # | Section | Content | Visual | Interaction | Scope | Sync | Decision |
|---|---|---|---|---|---|---|---|
| 1 | Intro (`#intro`) | 5 | 4 | 3 | 4 | 4 | Polish |
| 2 | Hubs Grid (`#hubs`) | 4 | 4 | 4 | 3 | 3 | Polish |
| 3 | Exam Sim (`#exam-sim`) | 5 | 5 | 5 | 5 | 5 | Ship |
| 4 | Stereo Lab (`#stereo-lab`) — 5 tabs | 5 | 4 | 4 | 5 | 4 | Polish |
| 5 | Spec Trainer IR+NMR (`#spec-trainer`) | 5 | 5 | 5 | 5 | 5 | Ship |
| 6 | Mass Spec (`#mass-spec`) | 4 | 3 | 2 | 4 | 3 | Polish |
| 7 | Mastery Dashboard (`#mastery`) | 4 | 5 | 4 | 4 | 5 | Ship |
| 8 | Roadmap (`#roadmap`) | 5 | 5 | 5 | 5 | 5 | Ship |
| 9 | Mech Library (`#mech-library`) | 5 | 5 | 5 | 5 | 5 | Ship |
| 10 | Synthesis Lab (`#synthesis-lab`) | 5 | 5 | 5 | 5 | 5 | Ship |
| 11 | Flashcard Deck (`#flash-deck`) | 4 | 5 | 4 | 4 | 5 | Ship |
| 12 | Bonding (`#bonding`) | 5 | 5 | 5 | 5 | 5 | Ship |
| 13 | Nomenclature (`#nomenclature`) | 5 | 5 | 5 | 5 | 5 | Ship |
| 14 | Acid-Base CARDIO (`#acid-base-cardio`) | 5 | 5 | 4 | 5 | 5 | Ship |
| 15 | Hub 01 Alkanes (`#alkanes`) | 4 | 5 | 5 | 5 | 5 | Ship |
| 16 | Hub 02 Alkenes (`#alkenes`) gold | 5 | 5 | 5 | 5 | 5 | Ship |
| 17 | Hub 03 Alkynes (`#alkynes`) | 4 | 4 | 4 | 5 | 4 | Polish |
| 18 | Hub 04 SN/E Decision (`#subelim`) | 5 | 4.5 | 3.5 | 5 | 4 | Polish |
| 19 | Hub 05 Alcohols (`#alcohols`) | 5 | 5 | 5 | 5 | 5 | Ship |
| 20 | Hub 06 Ethers/Epoxides (`#ethers`) | 5 | 5 | 5 | 5 | 5 | Ship |
| 21 | Hub 07 EAS Aromatic (`#aromatic`) gold | 5 | 5 | 5 | 5 | 5 | Ship |
| 22 | Hub 08 Carbonyl (`#carbonyl`) gold | 5 | 5 | 5 | 5 | 5 | Ship |
| 23 | Hub 09 Carboxylic Acids (`#acids`) | 5 | 4 | 4 | 5 | 5 | Polish |
| 24 | Hub 10 Amines (`#amines`) | 4 | 4 | 3 | 5 | 4 | Polish |
| 25 | Lab Techniques (`#lab-techniques`) | 5 | 5 | 5 | 5 | 5 | Ship |
| 26 | Alpha & Condensation (`#alpha-condensation`) | 5 | 5 | 5 | 5 | 5 | Ship |
| 27 | Reagent Quick Reference (`#reagents`) | 5 | 4 | 4 | 5 | 4 | Polish |

**Tally:** 18 Ship · 9 Polish · 0 Rebuild · 0 Trim.

---

## The 9 Polish items — improvement plans

### 1. Intro section (`#intro`) — Polish (10 min)
**Issue:** Stats row says "10 Hubs · 92 Reactions · 60 MCQs · 9 Mechanisms · 6 ¹H/¹³C spectra" but the Hubs Grid section two screens later says "16 hubs." Reaction count is stale (now ~94 with Strecker + Lindlar combined card).

**Fix:**
- Reconcile to "10 functional-group hubs + 6 foundation sections"
- Recount reactions via grep `class="rxn-card"`
- Add a returning-student link "Already studying? Skip to your weakest hub →"

### 2. Hubs Grid (`#hubs`) — Polish (5 min)
**Issue:** Kicker says "Optional view · Roadmap" — undermines the section. Conflicts with intro count.

**Fix:**
- Promote to "Master roadmap"
- Reconcile count
- Verify prereq edges reflect recommended order

### 3. Stereo Lab (`#stereo-lab`) — Polish (15-20 min)
**Issue:** 5 tabs is a lot. Fischer R/S Drill + Isomer Decision Tree were stuck in worktree most of yesterday — verify their handlers actually wired.

**Fix:**
- Open in browser, click each of the 5 tabs, confirm content renders
- Add a "Stereo Lab tour" pill that guides through tabs in order: R/S → Newman → Fischer → Optical Activity → Decision Tree

### 4. Mass Spec (`#mass-spec`) — Polish (30 min) — most needed
**Issue:** Just landed; static text + table only. Sync break with the rest of the engine which is interactive.

**Fix:**
- Add interactive: dropdown of 6 preset compounds (chloroethane, bromoethane, acetone, ethanol, propanol, cyclohexane). Selecting updates a hand-authored stick-spectrum SVG.
- "Why M+2 matters for halogens" callout with isotope ratios.
- 3-spectra mini-quiz: "Cl, Br, or neither?"

### 5. Hub 03 Alkynes — Polish (45 min)
**Issue:** Lindlar/Na-NH₃ combined card is solid. But hub overall lighter than Hub 02 — only ~5-6 reactions visible.

**Fix:**
- Add a smaller Hub 03 atlas plate matching Hub 02's Plate III pattern
- Surface "C in Catalyst = Cis" Sarah-trick prominently
- Add internal vs terminal alkyne distinction box

### 6. Hub 04 SN/E Decision Wizard — Polish (90 min, biggest piece)
**Issue:** Plate V atlas tree is gold (5/5). Decision Wizard companion is structural-but-thin: text-prompt-style, no SVG molecules at each step. Right next to a rich atlas it looks bolted on.

**Fix:**
- At each wizard step, render small skeletal SVG of the species being asked about (CH₃Br for methyl, R-CH₂-Br for primary, etc.)
- Verdict screen renders as a proper rxn-card with substrate + reagent + arrow + product + mechanism summary chips
- "Show me 2 examples" reveal pulls 2 worked examples from existing 5 SN/E MCQs

### 7. Hub 09 Reactivity Ladder — Polish (30 min)
**Issue:** Saponification card is rich. NAS removed. Reactivity ladder (acid chloride → anhydride → ester → amide) might still be a static list.

**Fix:**
- Render as a hand-drawn vertical ladder with skeletal structures at each rung
- Color-grade by reactivity: red top (acid chloride) → green bottom (amide)
- "Convert UP is hard, DOWN is easy" rule callout

### 8. Hub 10 Amines — Polish (15-20 min)
**Issue:** Strecker just landed; verify it matches Gabriel + azide + reductive amination card patterns visually.

**Fix:**
- Open Hub 10 in browser, verify Strecker card uses same rxn-card class + DAT-context box as siblings
- If missing context box, add: "DAT-tested context: 'synthesize alanine from acetaldehyde'"
- Verify basicity ranker interactive works (3° > 1° > aryl > pyridine > pyrrole > amide)

### 9. Reagent Quick Reference — Polish (45 min)
**Issue:** Long table even after color-coding by class. No filter to find "reagents that make X."

**Fix:**
- Single-row filter chip bar above the table: "All · → alcohols · → carbonyls · → alkenes · → amines · → acids · stereo · oxidation · reduction"
- Each chip filters by `data-product` attribute
- Search box that filters by reagent name

---

## Pedagogical ordering recommendation

The current sidebar order is **structural** (intro → tools → foundation → hubs by topic number). Wrong for a learner. Recommended ordering:

### Week 1: Foundation (3-4 days)
1. **Intro / Roadmap**
2. **Bonding & Resonance** — without this, nothing else works
3. **Nomenclature** — read structures before reacting them
4. **Acid-Base CARDIO** — drives every mechanism decision downstream

### Week 2-3: Functional groups in pedagogical order (8-10 days)
5. **Hub 01 Alkanes** — radical halogenation only, easiest
6. **Hub 02 Alkenes** — π bond as nucleophile, establishes Markov + syn/anti pattern
7. **Hub 03 Alkynes** — same patterns + Lindlar/Na-NH₃ trick
8. **Hub 04 SN/E** — requires CARDIO + alkene knowledge
9. **Hub 05 Alcohols** — Swiss Army knife
10. **Hub 06 Ethers & Epoxides** — Williamson + epoxide opening
11. **Stereo Lab** — moved EARLIER (not buried in tools); needed before drawing wedge products

### Week 4: Aromatic + carbonyl (5-7 days)
12. **Hub 07 EAS** — directing effects, requires resonance
13. **Hub 08 Carbonyl** — biggest hub
14. **Hub 09 Carboxylic Acids** — derivatives + ladder
15. **Hub 10 Amines** — basicity, synthesis
16. **Alpha & Condensation** — aldol, Claisen, Michael (requires Hub 08)

### Week 5: Identification + lab (5 days)
17. **Spec Trainer** — IR + NMR + DoU
18. **Mass Spec** — lightweight, after spec
19. **Lab Techniques** — qual tests + extraction + TLC
20. **Synthesis Lab** — multi-step puzzles
21. **Reagent QR** — review/lookup, used as needed
22. **Mech Library** — review, used as needed

### Week 6: Test-week mode
23. **Mastery Dashboard** — see weak hubs
24. **Flashcard Deck** — daily SR drilling
25. **Exam Simulator** — repeat until pacing locks

---

## Sidebar reorder

**Current:** tools (Mech Library, Synthesis Lab, Flashcard Deck, Stereo Lab, Spec, Exam Sim, Mastery) BEFORE foundation (Bonding, Nomenclature, CARDIO) BEFORE hubs.

**Recommended:**
```
01 START HERE
  - Introduction
  - Master Roadmap
02 FOUNDATION (week 1)
  - Bonding & Resonance
  - Nomenclature
  - Acid-Base CARDIO
03 FUNCTIONAL GROUPS (weeks 2-4)
  - 01 Alkanes
  - 02 Alkenes
  - 03 Alkynes
  - 04 SN/E Decision
  - 05 Alcohols
  - 06 Ethers & Epoxides
  - Stereo Lab            ← moved earlier
  - 07 Aromatic (EAS)
  - 08 Aldehydes & Ketones
  - 09 Carboxylic Acids
  - 10 Amines
  - Alpha & Condensation
04 IDENTIFY & EXTRACT (week 5)
  - Spectroscopy Trainer
  - Mass Spectrometry
  - Lab Techniques
05 PRACTICE (ongoing + week 6)
  - Mechanism Library
  - Synthesis Lab
  - Reagent Quick Reference
  - Flashcard Deck
  - Mastery Dashboard
  - Exam Simulator
```

Reorder doesn't move content — just relabels groups + moves Stereo Lab earlier. ~30 min in the sidebar nav block.

---

## Top 10 priority improvements (by score impact + effort)

1. **Sidebar reorder + foundation grouping** (30 min) — biggest UX shift for new students
2. **Hub 04 SN/E Decision Wizard polish** (90 min) — original visual concern
3. **Hub 03 Alkynes atlas plate** (45 min) — match Hub 02 visual density
4. **Mass Spec interactive** (30 min) — compound-dropdown stick-spectrum
5. **Reagent QR filter chips** (45 min) — make the reference usable mid-problem
6. **Stat-row reconciliation in intro + hubs** (10 min) — fix 10-vs-16 hub count
7. **Hub 09 reactivity ladder visual** (30 min) — hand-drawn vertical ladder
8. **Stereo Lab tour pill** (15 min) — guide through 5 tabs
9. **Hub 10 Strecker parity check** (15 min) — match siblings structurally
10. **Hub 02 Alkenes ozonolysis workup callout** (10 min) — Zn/H₂O vs H₂O₂ vs Me₂S

**Total polish: ~5.5 hours.** All ship-additive. After this OChem is 5/5 across every dimension.
