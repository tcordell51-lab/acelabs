# OChem, Retold — Build-Ready Synthesis Report
Compiled 2026-07-16 from seven verified research streams (Booster/Bootcamp field study, MOC/Chad/TOCT profiles, interactive-tool survey, learning-science literature, student-voice mining, design-language patterns, chem-conventions, moat validation). All claims carry dates/URLs in the underlying streams; refuted or unverifiable items are flagged.

---

## 1. SCORECARD — Retold today vs. the best of each reference

| Dimension | Best-in-class (who) | Retold today | Verdict |
|---|---|---|---|
| Unifying thesis | MOC "yin and yang" nucleophile/electrophile framing (masterorganicchemistry.com, 2012-06-05); student consensus "follow the electrons" (verified Traceofbass, r/OrganicChemistry, 2020-06-30) | Green-vs-red electron story across 13 nights | **LEAD.** Our spine IS the validated click-model; nobody else builds a whole course on it |
| Mechanism interactivity | Alchemie Mechanisms v1 (drag electrons, real-time bonds, $9.99, 260+ puzzles) — but iOS 3.2/5, stale since 2022-06-11; its 2.0 roadmap (arrow + riding electrons, unshipped, no date per alchem.ie fetched 2026-07-16) is what we ship today | Animated steppers + tap-the-attacker builder, live | **LEAD**, fragile — Alchemie 2.0 converges on us |
| Wrong-answer feedback | ChemInteractive (cheminteractive.ie): named error classes (arrow backwards, octet violation, uninvolved atom) | Right/wrong + reveal | **GAP.** Documented failure mode of shallow feedback (Chirality-2 study, J.Chem.Ed. 2025, 102(4):1410) |
| Structure-rendering craft | ACS Document 1996 geometry (confirmed current, researcher-resources.acs.org, fetched 2026-07-16); Nature arrow discipline (nature.com nr-chemical-structures-guide.pdf) | smiles-drawer defaults (labels too small, strokes off-ratio) | **GAP**, cheapest to close — see §3 |
| Color grammar | Clayden 2nd ed.: each hue = one semantic role for 1500 pages; arXiv 2504.15539 trace-the-pair coloring | Green/red exists but pairs don't keep color through intermediates; EPM collision unaddressed | **PARTIAL** |
| Visual polish / editorial design | Booster ("absolutely beautiful… custom illustrations," SDN 2025-09-12); Quanta type stack | Cream/gold/serif editorial, Fraunces+Hanken available from portal | **PARITY-plus** — but Booster's polish is decoration, ours can carry meaning |
| Depth of "why" | Bootcamp/Dr. Mike ("god-tier," r/predental 2024-10-18) — but "memorizing instead of understanding… boring and draining" (r/predental 2022-11-28, verified verbatim) | Mechanism-first by design | **LEAD** on depth-per-minute, the exact axis both incumbents fail |
| Retention layer | Quantum Country mnemonic medium (~54 days retention per question for ~95 min review, numinous.productions/ttft 2019); ReactionFlash 4.8/5 over a decade | None — nights don't re-ask prior nights | **GAP** — and no OChem product ships this |
| Motivation / game feel | Brilliant×ustwo (Level Gameboard, designed encouragement for struggling learners — verified ustwo.com/work/brilliant); Duolingo streak (+3.6x course completion, blog.duolingo.com) | Linear night list, no celebration/ritual states | **GAP** |
| DAT-spec fit | Nobody — ADA's April 2026 spec adds curved-arrow mechanisms + reaction coordinate diagrams; both incumbents answered with passive video (bootcamp.com 2026 update; boosterprep.com 2026 changes) | Built for exactly this | **OPEN LANE.** Say "built for the 2026 spec" out loud |
| Non-reaction spine (acidity, resonance, NMR, lab tests) | Bootcamp CARDIO checklist (verified lessons 2.3-2.7) | Not covered (alkene-reaction-centric) | **GAP** — 2026 test-takers report these dominate the real exam (SDN 2026-06-23, 2026-06-25) |

**Net:** Retold already owns the two hardest things (thesis + live interactive mechanisms). The gaps are all closable with craft: feedback quality, rendering precision, retention loop, motivation layer, spec-breadth.

---

## 2. THE RANKED LIST — 15 upgrades, learning-impact × feasibility

**1. Adopt ACS drawing geometry in smiles-drawer (pure config).**
Change: at `bondLength: 30` set `bondThickness: 1.25` (4.2% of bond), `bondSpacing: 5.4` (18%), atom-label font ≈20px (ACS ratio 0.69× bond length — small heteroatom labels are the #1 tell of amateur rendering), sans-serif only inside structures. Why: ACS 1996 confirmed as THE current professional standard (Wikipedia MoS + Revvity + live Chemical Reviews guidelines, all fetched 2026-07-16). One afternoon; permanently upgrades every structure on every page.

**2. Error-class feedback on every missed commit.**
Change: wrong answers return (a) the named error class — "arrow drawn backwards," "arrow from atom instead of electrons," "octet violation," "attack at an uninvolved atom" — (b) the animated correct electron flow, (c) the overall reaction stated in one sentence. Why: ChemInteractive's checker pattern is the most complete implementation found; Chirality-2's 2025 J.Chem.Ed. study documents that immediate-but-unexplained feedback actively frustrates students; the OCRA app's #1 user complaint was "just says incorrect" (r/OrganicChemistry 2023-01-22). This is where the learning happens.

**3. Trace-the-pair color persistence.**
Change: the green attacking lone pair stays green as it becomes the new sigma bond, through every intermediate into the product; the red breaking bond fades red. Why: arXiv 2504.15539 (2025) formalizes arrow-and-created-bond sharing one color so a student can follow a specific pair through a whole transformation; it's the Clayden grammar upgraded into motion, and it makes our color system do teaching work no competitor's decoration does.

**4. Static paper-notation frame after every animated step.**
Change: each stepper step ends frozen on the traditional static curved-arrow diagram (exactly what they'll see on paper/the DAT), dwellable before the next click. Why: Tversky's Apprehension Principle (IJHCS 2002, verified); animation benefit is spatial-ability-moderated (Aldahmash & Abraham 2009, n=142, verified; CERP 2020); and it's Alchemie reviewers' explicit unmet ask — v1's screen-to-paper transfer gap is what 2.0 exists to fix.

**5. Backward fading of arrow placement across nights.**
Change: Night N shows the full stepper; subsequent appearances blank the FINAL arrow for the student to place, then the last two, until they build the mechanism unaided. Fade the target skill (arrow placement) first; keep scaffolds on mastered parts. Why: Renkl & Atkinson 2003 — fading beat example-problem pairs on near transfer, mediated by fewer errors during learning. Structural, not cosmetic: this is the curriculum's spine.

**6. Spaced re-commit night openers.**
Change: each night opens with 3-5 quick re-asks drawn from prior nights' missed commits on expanding intervals; include one trivially easy opener (engagement check). Why: Quantum Country's measured economics (~54 days retention/question, ~95 min total review); "Duolingo for reactions" is the openly requested product (r/chemistry 2025-05-29); fixes the universal "I knew this yesterday" decay. No OChem product ships it.

**7. Catalog → accumulating personal reaction map.**
Change: rebuild the 13-reaction alkene page as a connected functional-group map ("spider") whose nodes/edges fill in as the student clears scenes; every edge links back to the exact scene where it was learned (MOC map-to-mechanism links; Synthetic Map's clickable nodes). Why: the perfect-600-OC scorer credits hand-drawn flowcharts over flashcards (r/DAT 2025-08-19, 79 pts); moat-check verified NO product offers a personal accumulating map (nearest interactive maps — StudyOrgo, Luminous Learner — are universal, non-accumulating). This is the moat feature.

**8. Booster's 4-slot "Key Info" stat-line on every catalog card.**
Change: fixed schema under every reaction — stereospecificity / regiospecificity / rearrangements? / intermediate — plus a Bootcamp-style reagent-fingerprint callout ("the BH3 is the tell"). Why: it's the one convention DAT students already study from (Booster reaction sheet, 15pp, verified); consistency = free recognition, and the fingerprint line trains reagent-only identification, the actual test skill.

**9. Design the wrong-answer moment + a 200-400ms correct-commit flourish.**
Change: correct = brief gold state-machine flourish, then out of the way; wrong = encouraging line + one-sentence electron-logic hint, then retry — never a penalty state. Why: ustwo×Brilliant (verified) built dedicated components for encouraging struggling learners and calibrated celebration to never break concentration; matches the standing no-negative-language rule exactly.

**10. First 60 seconds of every night = a motivating puzzle + solved win; takeaways before detail.**
Change: open with the question the mechanism answers (concrete before abstract), get one commit answered, THEN name the reaction; a 3-4 bullet takeaways panel precedes any mechanism. Why: 3b1b's motivation-in-30-seconds criterion (SoME1, 2021-07-16) + MOC's takeaways-first template — the two most-loved formats in the niche agree on the opening move.

**11. One "why did the electrons move?" prompt after correct arrows — scaffolded in from Night ~4.**
Change: after a correct tap/arrow, one-line self-explanation prompt (tap-to-select, not free text, early on). Why: correct arrows do not imply causal understanding ("Arrows on the Page Are Not a Good Gauge," J.Chem.Ed. 2020); Chi 1989 self-explanation effect. Delay to mid-course because drawing + explaining simultaneously overloads low-prior-knowledge students (IDEALS study).

**12. Nature arrow craft on every hand-authored mechanism.**
Change: curved arrows run centre-of-lone-pair/breaking-bond → centre-of-forming-bond, hand-tuned paths (Nature explicitly tells authors not to use template arrows); enlarge charge glyphs ~1.3×, never circle them; emphasize with color never bold (bold reads as stereochemistry); wedges narrow-end-at-stereocenter. Why: verified verbatim in Nature's structure guide (PDF, fetched 2026-07-16); arrow-endpoint precision is the professional-quality marker.

**13. Night Map gameboard + completion ritual.**
Change: render the 13 nights as a spatial route with color/state-coded nodes (Brilliant/Rive pattern, verified rive.app 2024-05-02); end each night with a ritual screen: what-you-now-know + one-line tease of tomorrow's reaction + "Night N of 13"; nights can be banked/made up without shame (Duolingo's slack-beats-rigidity finding). Why: streak mechanics 3.6x course completion; the tease is the come-back hook.

**14. Lock the color grammar + one EPM reconciliation scene.**
Change: ban green/red from every non-semantic use in the whole app (UI chrome, states, charts); add one explicit moment teaching that our red = electron-POOR is the opposite of the EPM convention (red = electron-RICH) they'll meet in Booster and on the DAT. Why: color coding only cuts cognitive load when the mapping is absolutely stable (Ozcelik 2010, eye-tracking); the EPM collision is a real misread risk flagged in the conventions stream.

**15. Details-on-demand + cross-notation commits.**
Change: any atom/group tappable for its one-sentence electron story (orbital depth lives in tappable asides, MOC's footnote pattern); and drill each catalog reaction in skeletal AND condensed/molecular notation. Why: Shneiderman details-on-demand via Distill 2020; the notation-translation gap is a direct, untrained student complaint (r/predental 2025-01-29) — nobody drills it.

*(Content-scope note, outside the visual/interaction 15: add the non-reaction spine — acidity ranking as a CARDIO-style named checklist, resonance validity, carbocation stability, IR/NMR values, lab tests — as short scenes. 2026 test-taker breakdowns say these, not reactions, dominated the real exam. A reactions-only course will get mocked as incomplete.)*

---

## 3. CHEMISTRY-DRAWING SETTINGS TO ADOPT (the numbers)

ACS Document 1996 ratios (confirmed still current, 2026-07-16; no "ACS 2020" stylesheet exists). Unit-independent ratios, then smiles-drawer values at `bondLength: 30`:

| Property | ACS ratio (of bond length) | smiles-drawer @ 30 |
|---|---|---|
| Chain angle | 120° | (default) |
| Line width | 4.2% | `bondThickness: 1.25` |
| Double-bond gap | 18% | `bondSpacing: 5.4` |
| Bold wedge width | 14% | 4.2 |
| Hash spacing | 17% | 5.1 |
| Atom-label margin | 11% | 3.3 |
| Atom-label font | 69% | ≈20px, Arial/Helvetica sans — never serif inside diagrams |

Caveat from verification: Nature shares 120°/18%/0.6pt but uses a SHORTER 10.8pt bond, not 14.4pt — so treat the ratios (not absolute points) as the law; they hold at any render size.

**Colors on the cream canvas:** framework + carbons in the ink color (Clayden inversion: quiet field, full-contrast actors). Heteroatom labels in Jmol CPK darkened for light background: N #3050F8, O ≈#D40D0D, S ≈#B8A038 (never pure yellow), Cl darkened from #1FF01F, Br #A62929. CPK = element identity ONLY; green/red = electron semantics ONLY; gold = the event. Three color languages, zero overlap.

**Arrows/charges (Nature, verified):** centre-to-centre curved arrows, hand-positioned; charges on the formally charged atom, enlarged, never circled; distinct arrow types reserved for equilibrium vs resonance vs mechanism.

**Typography roles (Quanta pattern):** Fraunces high-opsz (+ touch of WONK) for scene titles; Fraunces low-opsz or Hanken Grotesk for reading text; Hanken for UI chrome; sans-only in diagrams. The Fraunces+Hanken pairing is already self-hosted for the portal premium pass — free brand coherence.

---

## 4. MOAT VERDICT (adversarially verified 2026-07-16)

| Differentiator | Verdict |
|---|---|
| **Accumulating personal reaction map** | **UNOWNED — strongest moat.** No product accumulates a map per student. Closest: Synthetic Map (J.Chem.Ed. 2024, 10.1021/acs.jchemed.4c00592) is fixed-per-course, semi-abandoned (broken TLS, bizland cert, confirmed live); StudyOrgo/Luminous Learner are interactive but universal. MOC has sold the static version since 2012 — demand proven, personalization unbuilt. |
| **Coach-recorded audio per interactive scene** | **UNOWNED.** Nearest analogs are passive (Sketchy narration over video; Yale 2008 podcast). Nothing attaches a real coach's voice to commit-gated scenes. |
| **Commit-gated narrative course** | **UNOWNED as a combination.** Brilliant gates but has no OChem course (only gen-chem "The Chemical Reaction"); Sketchy has narrative but is passive; Alchemie gates puzzles with zero narrative. |
| **Tap-to-draw arrows on real structures** | **NOT globally novel** (Alchemie v1, realochem.study, ChemInteractive) — **but first-in-DAT is real and time-boxed.** ADA's April 2026 spec added curved-arrow mechanisms + reaction coordinate diagrams as their own subtopic; both incumbents responded with passive video (Bootcamp even tells students the DAT "won't ask you to draw mechanisms step-by-step"). Alchemie 2.0 — whose entire announced roadmap is what Retold ships — remains unshipped with no date. Also: build RCDs interactively; nobody has. |

One flagged citation: the "plus meets minus" 2026 Reddit quotes (claisen33 26-pt comment, aminot123) could NOT be verified and show attribution red flags. The thesis itself stands on the verified Traceofbass 2020 quote + MOC's canonical framing — use those in marketing copy, not the 2026 quotes.

---

## 5. THREE THINGS NOT TO DO (despite temptation)

**1. Do not add more motion.** No ambient animation, no cinematic transitions, no auto-playing mechanisms, no moving backgrounds. Every "animation win" in the literature that collapsed did so because motion outran apprehension (Tversky 2002, verified); Mayer's segmenting effect (d≈0.98) requires learner-clicked single steps; 3b1b's rule is "every movement has an identifiable purpose." Motion belongs to electron pairs, exclusively. The camera never moves. Booster proves "beautiful" without "why" gets called disjointed and less thorough (predentaladvice.com, upd. 2026-07-08).

**2. Do not gamify beyond the gameboard + ritual.** No XP, no leaderboards, no loss-aversion streak penalties, no red failure states. Seeing Theory proves restraint itself retains ("beauty is the retention mechanic"); ustwo's core finding was that celebration must never break STEM concentration; Duolingo's own data shows flexible slack beats rigid rules; and the no-pace-shaming rule makes punitive mechanics off-limits anyway. The night counter, banked nights, and a 300ms flourish are the whole layer.

**3. Do not announce or promise unshipped content.** Alchemie went from beloved ("feel how reactions work," top-of-class testimonials) to 3.2/5 through exactly one mistake: paid users waiting 4 years for promised updates (App Store, last update 2022-06-11, verified). ReactionFlash holds 4.8/5 over a decade by shipping steadily (v5.3, 2025-11-05). Ship Night N complete before Night N+1 is mentioned anywhere in the product; the "13 nights" frame is safe only if all 13 exist. Corollary inside the course: don't front-load free-form arrow drawing plus open why-prompts on early nights — the overload boundary for novices is documented (IDEALS); constrained taps first, generation faded in.