# Agent 01 Audit: SCORECARD

Audit of `/tools/qr/index.html` (10,427 lines). 41 skill modules scored read-only on five axes (1=missing, 2=stub, 3=basic, 4=good, 5=A-tier). Scoring rubric:

- **Visual** — has a canonical diagram or animation tied to the skill (5 = bespoke, on-pattern; 1 = generic dictionary fallback).
- **Interactive** — drag/click/scrub controls beyond a static image (sliders, presets, click-to-step all count).
- **Traps** — DAT-specific traps explicitly called out by name (every module has a `trap:` field, but quality varies).
- **Compare** — explicit wrong-vs-right setup comparison in the visual or text (rare in this codebase; partial credit when the trap text shows both forms).
- **Sarah** — Sarah-mode tutor notes: count of `sarahTricks` entries plus presence of inline `sarahSays:` in worked steps.

Each axis 1–5; Total /25. **Tier**: A (≥21), B (16–20), C (11–15), D (≤10).

---

## Module table

| ID | Tier | Visual | Interactive | Traps | Compare | Sarah | Total | Notes |
|---|---|---|---|---|---|---|---|---|
| frac-add | B | 5 | 4 | 4 | 3 | 4 | 20 | Bespoke fraction-bar with `animFrac` button; "common floor" + "two piles" tricks |
| frac-dec | B | 5 | 2 | 4 | 3 | 4 | 18 | Eighths strip is a true canonical visual but display-only (no interaction); cross-multiply + anchors |
| pct-of | B | 4 | 4 | 4 | 3 | 4 | 19 | pct-slider with preset percent buttons; 10% anchor + tip shortcut |
| pct-chg | A | 4 | 5 | 5 | 4 | 5 | 23 | price-tag widget with +/-% buttons; **inline sarahSays** on +1/-1 multiplier; `pct-seq trap` named ("most tempting wrong choice") |
| pct-seq | B | 5 | 2 | 5 | 5 | 4 | 21 | sequential-bars SVG literally shows wrong (back-to-100) vs right (96) side by side; static |
| lin-eq | A | 5 | 5 | 5 | 4 | 5 | 24 | qrBalance: full balance-beam with presets, inverse-op buttons, anime() shake; **inline sarahSays**; "n vars = n equations" rule |
| ratios | C | 4 | 4 | 4 | 2 | 3 | 17 | qrRatioBars renderer; part-vs-whole trap named |
| rate-time | B | 4 | 4 | 4 | 3 | 3 | 18 | qrRateGraph with two-vehicle gap; combined-rate trap explicit |
| word-decode | B | 4 | 4 | 5 | 4 | 3 | 20 | qrWordTranslate-rich with 3 presets + custom sentence parser; "less than" reversal called out |
| frac-mul | B | 5 | 4 | 4 | 3 | 3 | 19 | qrFractionGrid (grid-multiply visual); divide-flip trap |
| dec-arith | C | 4 | 4 | 4 | 2 | 3 | 17 | qrNumberLine; place-value trap |
| estim | C | 4 | 4 | 4 | 2 | 3 | 17 | qrEstimLadder; "close-but-wrong" decoy trap |
| mental | C | 3 | 3 | 4 | 2 | 3 | 15 | qrDecomposer (lightest of the QR_RENDERERS); 5 tricks listed but no per-trick visual |
| distrib | B | 4 | 4 | 5 | 3 | 3 | 19 | qrDistribArea (area model for a(b+c)); sign-distribution trap "DAT puts wrong-sign next to right" |
| pemdas | C | 4 | 4 | 4 | 2 | 3 | 17 | qrPemdasStack (priority-stack layout); same-priority L-to-R trap |
| neg-ineq | B | 4 | 4 | 5 | 3 | 3 | 19 | qrIneqFlip: animation of the sign flip on negative divide; flip trap is named twice |
| work-rate | A | 4 | 4 | 5 | 4 | 5 | 22 | qrWorkBars + **inline sarahSays** about "together for 12 hours" vs "their hours sum to 12" — that *is* a wrong-vs-right setup compare |
| mixture | B | 5 | 5 | 4 | 3 | 4 | 21 | qrMixtureBeaker (visual mixing); "make a table" trick + "one-side-stays" |
| interest | B | 5 | 5 | 5 | 4 | 3 | 22 | qrGrowthCurve compares simple (linear) vs compound (exponential) ON SAME AXES — closest thing to a clean wrong/right compare in the file |
| coord | B | 5 | 5 | 4 | 3 | 3 | 20 | qrCoordPlane multimode (distance / slope / triangle / absval); slope-inversion trap |
| units | B | 4 | 4 | 4 | 3 | 3 | 18 | qrUnitFraction with cancel-diagonal animation; flip-the-fraction sanity trap |
| p-flip | B | 5 | 5 | 4 | 3 | 3 | 20 | qrProbTree multi-level tree; "at least → 1 minus none" pattern lock |
| p-andor | A | 5 | 5 | 5 | 4 | 5 | 24 | qrProbVenn + Dice Pyramid widget; **Sarah's favorite trick** verbatim; **inline sarahSays**; OR overlap trap |
| p-cond | B | 5 | 5 | 5 | 3 | 3 | 21 | qrProbTable (medical 2x2); P(A\|B) vs P(B\|A) direction trap explicit |
| count-pc | A | 5 | 5 | 5 | 4 | 5 | 24 | qrCountGrid + **C-Method widget** ("draw a literal C"); **inline sarahSays** twice; podium/pizza decision rule; off-by-r! trap named |
| discr | B | 5 | 5 | 4 | 3 | 3 | 20 | qrParabolaDiscr a/b/c sliders, three presets (two/one/none roots); color-coded by Δ sign |
| harm | B | 4 | 4 | 5 | 4 | 3 | 20 | qrHarmMean shows naive vs true average bars side-by-side; "25 vs 24" trap is the canonical wrong-vs-right |
| zscore | B | 5 | 5 | 5 | 3 | 3 | 21 | qrZCurve with draggable wire; 68/95/99.7 lock; halve-the-tail trap |
| tri-inv | B | 5 | 5 | 4 | 4 | 3 | 21 | qrTriMorph; presets including 1-1-3 collapsed-line case = literal wrong-setup compare |
| vol-sa | B | 5 | 4 | 4 | 3 | 3 | 19 | qrSolidNet with 5 solid types, fold/unfold; cube-law scaling explicit |
| ds | B | 4 | 5 | 4 | 3 | 3 | 19 | qrSlopeRiseRun (slightly off-target — DS module uses a slope visual rather than a sufficiency visual); ±-ambiguity trap |
| exps | A | 4 | 4 | 4 | 3 | 5 | 20 | qrExpRules; **inline sarahSays** about calculator-feasibility filter + hidden-base log analogy |
| absval | A | 5 | 5 | 5 | 4 | 5 | 24 | qrAbsValFold + V-graph; **shield + tornado metaphor** with three inline sarahSays; both methods (easy + hard) shown side by side |
| binomials | B | 5 | 5 | 5 | 4 | 3 | 22 | qrBinomTile (area model showing the 2xy middle term); difference-of-squares trap |
| geo-2d | B | 4 | 4 | 4 | 3 | 3 | 18 | qrShapeMorph; r-vs-d confusion trap; area-vs-perimeter scaling |
| sets | B | 5 | 5 | 4 | 3 | 3 | 20 | qrVenn2Set with three regions; double-count trap |
| desc-stats | B | 4 | 4 | 4 | 4 | 3 | 19 | qrStatSpread; outlier example shows mean-vs-median compare directly in worked step |
| untimed | D | 2 | 3 | 3 | 1 | 2 | 11 | qrMasteryGrid (30-cell unlock gate) is a strategy visual, not a math diagram; only one sarahTrick |
| skip-ret | D | 2 | 3 | 3 | 1 | 2 | 11 | qrTriageBoard; strategic, no math diagram; trap is "sunk cost" — fine, but module is thin |
| guess | D | 2 | 3 | 3 | 1 | 2 | 11 | qrElimFunnel with 4 demo problems; correct count of practice items but very thin module |
| logs | A | 5 | 5 | 5 | 4 | 5 | 24 | log-curve **plus baseball diamond** **plus Baseball Trick widget** (3 visuals); 4 sarahTricks; **2 inline sarahSays**; the laws table renders cleanly via `M.laws` branch |

---

## Bottom 10 — modules in worst shape, with what each needs most

These are the routing targets for fixer-agents. Listed worst first.

1. **untimed** (11/25) — Strategy module, no math content visualization. Needs: a real "untimed mastery grid" feedback loop (currently exists but feels detached from any skill); add a second sarahTrick on diagnosing the rush habit; add explicit "rushed answer vs careful answer" compare.
2. **skip-ret** (11/25) — Triage board exists but only as a static board. Needs: a live timer demo showing 90-second skip threshold; concrete worked example of a 4-question section with skip decisions; second/third sarahTrick on returning order.
3. **guess** (11/25) — Elimination funnel works but is only 4 demo problems with no Sarah voice anchoring. Needs: explicit "blank vs guess" expected-value compare; sarahTrick on elimination order ("magnitude → units → sign → specificity"); a worked 4-choice elimination with each filter step.
4. **mental** (15/25) — qrDecomposer is the thinnest of the canonical visuals. Needs: per-trick mini-visual (×11 split-and-add diagram, n5² lattice, halve-and-double pair); the five tricks deserve five micro-widgets; expand sarahTricks to one per trick.
5. **dec-arith** (17/25) — Number line is generic. Needs: a "line up the decimals" column-arithmetic visual showing aligned-vs-misaligned decimal points (the canonical wrong-vs-right setup for this skill); decimal-multiplication place-counter widget; second sarahTrick on multiplication place-shift.
6. **estim** (17/25) — Ladder is fine but doesn't show the "answer-choice elimination" use case. Needs: a multi-choice question with bracket overlay (estimate → eliminate); compare-style "rounded vs exact" arithmetic side by side; one sarahTrick on bias-direction tracking (round both up = result biased high).
7. **pemdas** (17/25) — Priority stack is OK but worked examples don't show the L-to-R same-priority trap with a wrong/right compare. Needs: "10 − 3 + 1" wrong-vs-right side-by-side widget (the −3+1 trap); a third sarahTrick on negative-as-additive-inverse.
8. **ratios** (17/25) — Bar widget exists; the part-to-whole vs two-categories distinction (the actual DAT trap) isn't visualized. Needs: toggle between "parts of a whole" and "two categories" modes; explicit wrong-vs-right setup compare; inverse-proportion sarahSays.
9. **geo-2d** (18/25) — Shape-morph exists but the canonical r-vs-d trap (the trap field literally calls out 25π vs 100π) isn't shown visually. Needs: side-by-side area calc with d entered vs r entered; one more sarahTrick on the perimeter-vs-circumference confusion.
10. **rate-time** (18/25) — The two-vehicle gap visualization is buried in `qrRateGraph` but doesn't have a clean "approaching vs same-direction" toggle. Needs: a meeting-time visual with both scenarios as toggleable presets; an "average speed" worked example showing total/total vs naive average wrong-vs-right.

(units, frac-dec, desc-stats are runner-up candidates if budget allows.)

---

## Top 5 — best modules to model on

Working examples for other agents to copy. All score ≥22/25.

1. **logs (24/25)** — gold standard. Three layered visuals (log-curve graph, baseball diamond, Baseball Trick conversion widget), four sarahTricks (Baseball, "he's little he stays" backup, count-the-zeros, magnitudes), two inline `sarahSays` baked into worked steps, the only module that uses the `M.laws` table renderer. Pattern: visual → tutor metaphor → backup metaphor → context generalization. Copy this for any module that has a memorable Sarah trick.
2. **absval (24/25)** — shield + tornado metaphor is fully rendered: V-graph fold visual + sliders, three inline `sarahSays` walking through both the "easy method" and "hard/opposite tornado method" (literal wrong-vs-right compare in step text), three sarahTricks layered (shield/tornado, isolate first, equation-±). Copy this when a skill has two procedural paths students confuse.
3. **count-pc (24/25)** — C-Method widget renders a literal "C" with the larger number on the left, expansion on top and r! on bottom; explicit "same digits top and bottom" self-check in the visual readout; two inline `sarahSays` plus podium/pizza decision rule plus shuffle-test confirm. Copy for any skill with a formula students should replace with a picture.
4. **lin-eq (24/25)** — qrBalance is the most polished interaction in the file: anime()-driven beam shake when applying inverse ops, four presets covering distribution and PEMDAS edge cases, illegal ops auto-hidden, **inline sarahSays** about "n variables = n equations." Copy for any skill that's procedurally step-by-step.
5. **p-andor (24/25)** — Dice Pyramid widget is verbatim Sarah's favorite trick (1-2-3-4-5-6-5-4-3-2-1 over 36); qrProbVenn renders the overlap subtraction visually; OR/AND distinction has its own sarahSays in the King-of-Hearts worked step. Copy when a skill has a "table or pyramid you draw every time" component.

(Honorable mentions: **pct-chg, work-rate, harm, interest** all 21–22 and use the same "two parallel curves on the same axes" wrong-vs-right pattern that other modules should adopt.)

---

## Methodology notes

- Visual scoring distinguishes between bespoke `QR_RENDERERS` entries (most score 4–5) and the inline `'word-translate'` fallback (the dictionary table — would score 1–2). All 41 modules are routed through either VISUAL_BY_SKILL or the inline switch, so no module is fully unrendered, but `untimed`, `skip-ret`, `guess` use strategy-shaped visuals not math-shaped ones.
- "Compare" is the weakest axis across the whole tool. Only `pct-seq` (sequential bars), `harm` (naive-vs-harmonic bars), `interest` (simple-vs-compound curves), `tri-inv` (collapsed-line preset), `desc-stats` (outlier mean-vs-median worked step), and `absval` (easy method vs tornado method) actually render the wrong setup next to the right one. Most modules describe the trap in prose only.
- Inline `sarahSays` appears in only 8 modules (pct-chg, lin-eq, work-rate, p-andor, count-pc, exps, absval, logs). These are also the modules that scored 5 on the Sarah axis. Adding inline `sarahSays` to worked-example steps is the highest-leverage Sarah-axis upgrade for any module currently at 3.
- All 41 modules have a non-empty `trap:` field and at least one `sarahTricks` entry, so no module scores below 2 on Traps or Sarah.
