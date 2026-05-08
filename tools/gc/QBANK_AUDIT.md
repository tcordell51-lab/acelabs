# AceLabs Gen Chem Question Bank — Quality Audit

Source: `/Users/thomascordell/Documents/Claude/Projects/AceDAT-AceLabs/tools/gc/index.html`
Audit date: 2026-05-07
Read-only: no modifications were made to `index.html`.

## Parsing notes

- Parsed cleanly. The bank is the array `BANK` (line 5048) and skills are the array `SKILLS` (line 4984). Both are top-level `const` array literals in the inline script and were extracted by line range and evaluated as JS.
- Field naming differs from the prompt: each question uses `opts` (not `choices`) for the answer array. Audit treats `opts` as the answer array.
- Bank size is **605** (prompt expected ~669).

## Top-line summary

| Metric | Value |
|---|---|
| Total questions | 605 |
| Total skills defined | 39 |
| Check 1: correct index out of bounds | 0 |
| Check 2: missing diag entries for wrong choices | 0 |
| Check 3: duplicate diag text within same question | 132 |
| Check 4: why missing or <=30 chars | 119 |
| Check 5: empty/unknown skills | 0 |
| Check 6: duplicate question IDs | 0 |
| Check 7: diff missing or not in {1,2,3,4} | 0 |

## Check 1 — `correct` index in bounds

Verifies every question's `correct` index resolves to a real entry in `opts`.

| id | correct | opts length |
|---|---|---|
| none | none | none |

## Check 2 — Every wrong choice has a non-empty diag entry

Each non-correct opts index must have a non-empty `diag[i]`.

| id | missing diag idx |
|---|---|
| none | none |

## Check 3 — Duplicate diag text within a question

Two distractor labels that read the same mean two wrong choices test the same misconception. Flagging only.

| id | duplicate(s) |
|---|---|
| p6 | idx 0=1 -> "Larger than F." |
| b6 | idx 0=3 -> "No." |
| lw4 | idx 0=1 -> "Period 2."; idx 0=2 -> "Period 2." |
| v5 | idx 0=3 -> "No LP." |
| lr3 | idx 0=2 -> "Off." |
| s5 | idx 0=3 -> "i=1." |
| g1 | idx 0=2 -> "Off by 2." |
| g2 | idx 2=3 -> "Wrong." |
| g3 | idx 1=3 -> "Wrong." |
| g7 | idx 0=2 -> "Off."; idx 0=3 -> "Off." |
| g8 | idx 0=1 -> "Wrong." |
| e3 | idx 2=3 -> "Wrong sign." |
| gb4 | idx 0=1 -> "Reversed." |
| rl4 | idx 2=3 -> "Wrong." |
| ar1 | idx 0=2 -> "No."; idx 0=3 -> "No." |
| ar3 | idx 0=1 -> "No."; idx 0=3 -> "No." |
| ek2 | idx 2=3 -> "Solid." |
| lc1 | idx 0=2 -> "No."; idx 0=3 -> "No." |
| lc3 | idx 0=1 -> "No."; idx 0=3 -> "No." |
| sw1 | idx 0=1 -> "Strong."; idx 0=3 -> "Strong." |
| sw4 | idx 2=3 -> "Neutral." |
| bf4 | idx 1=3 -> "Way off." |
| rp2 | idx 1=2 -> "Wrong." |
| rp3 | idx 1=3 -> "Yes." |
| nr2 | idx 0=1 -> "Wrong." |
| nu1 | idx 0=3 -> "Mass unchanged." |
| nu2 | idx 1=3 -> "Wrong." |
| if5 | idx 1=3 -> "Dipole." |
| x7 | idx 0=3 -> "Off by 10." |
| p-e1 | idx 1=2 -> "Larger." |
| p-e5 | idx 2=3 -> "Less." |
| lw-e2 | idx 0=1 -> "Off." |
| lw-e6 | idx 1=3 -> "Off." |
| lw-e7 | idx 0=1 -> "Wrong."; idx 0=3 -> "Wrong." |
| lw-e10 | idx 0=3 -> "Wrong." |
| hb-e2 | idx 0=1 -> "Diff." |
| qn-e3 | idx 0=3 -> "Off." |
| if-e4 | idx 0=2 -> "Nonpolar."; idx 0=3 -> "Nonpolar." |
| if-e7 | idx 2=3 -> "Wrong." |
| mc-e9 | idx 2=3 -> "Off." |
| mc-e11 | idx 0=2 -> "Off." |
| mc-e16 | idx 0=1 -> "Wrong." |
| mc-e19 | idx 1=2 -> "Heavier." |
| lr-e3 | idx 0=1 -> "Both work." |
| lr-e4 | idx 0=2 -> "Off." |
| lr-e8 | idx 2=3 -> "Off." |
| lr-e11 | idx 0=1 -> "Wrong." |
| lr-e14 | idx 0=2 -> "Off."; idx 0=3 -> "Off." |
| s-e2 | idx 0=1 -> "Off." |
| s-e3 | idx 0=1 -> "Wrong." |
| s-e4 | idx 0=3 -> "Off." |
| s-e5 | idx 1=2 -> "Off."; idx 1=3 -> "Off." |
| s-e8 | idx 0=2 -> "Off."; idx 0=3 -> "Off." |
| s-e9 | idx 0=2 -> "Off."; idx 0=3 -> "Off." |
| s-e11 | idx 0=2 -> "Wrong." |
| s-e12 | idx 0=2 -> "Off." |
| gl-e6 | idx 0=3 -> "Off." |
| gl-e7 | idx 0=3 -> "Off." |
| gl-e8 | idx 0=2 -> "Off." |
| gl-e10 | idx 0=3 -> "Off." |
| gl-e11 | idx 0=1 -> "Off."; idx 0=3 -> "Off." |
| gl-e12 | idx 1=2 -> "Off."; idx 1=3 -> "Off." |
| gl-e13 | idx 0=2 -> "Off." |
| gl-e14 | idx 0=2 -> "Off." |
| gl-e15 | idx 0=2 -> "Most ideal." |
| en-e2 | idx 0=2 -> "No." |
| en-e3 | idx 0=1 -> "Off."; idx 0=3 -> "Off." |
| ca-e2 | idx 0=1 -> "Off."; idx 0=3 -> "Off." |
| gb-e5 | idx 0=1 -> "Off."; idx 0=3 -> "Off." |
| rl-e2 | idx 0=1 -> "Wrong." |
| rl-e5 | idx 1=2 -> "Wrong." |
| rl-e6 | idx 2=3 -> "Increases." |
| ar-e1 | idx 0=1 -> "No."; idx 0=3 -> "No." |
| ar-e2 | idx 1=3 -> "No." |
| ar-e3 | idx 1=3 -> "No." |
| ar-e4 | idx 0=1 -> "Off."; idx 0=3 -> "Off." |
| ek-e2 | idx 2=3 -> "Reversed." |
| ek-e3 | idx 1=3 -> "Off." |
| lc-e4 | idx 0=1 -> "Wrong." |
| ic-e1 | idx 0=2 -> "No." |
| ic-e5 | idx 0=2 -> "Off." |
| ph-e3 | idx 0=1 -> "Off." |
| ph-e10 | idx 0=3 -> "Off." |
| sw-e1 | idx 2=3 -> "Weak." |
| sw-e3 | idx 2=3 -> "Off." |
| sw-e4 | idx 2=3 -> "Strong → weak." |
| sw-e6 | idx 1=3 -> "Weak." |
| bf-e1 | idx 0=3 -> "Way off." |
| bf-e8 | idx 1=3 -> "No." |
| ti-e2 | idx 1=2 -> "Below." |
| gv-e1 | idx 2=3 -> "No." |
| gv-e3 | idx 0=3 -> "Wrong sign." |
| rp-e4 | idx 0=2 -> "Lower."; idx 0=3 -> "Lower." |
| nr-e4 | idx 0=2 -> "Off." |
| nr-e5 | idx 0=1 -> "Off." |
| xx-e4 | idx 2=3 -> "Off." |
| xx-e6 | idx 2=3 -> "Wrong sign." |
| xx-e8 | idx 0=1 -> "Off."; idx 0=3 -> "Off." |
| xx-e13 | idx 0=1 -> "Underestimate." |
| bl1 | idx 2=3 -> "Lewis BASE." |
| bl4 | idx 0=2 -> "Spectator." |
| qn4 | idx 0=1 -> "Valid."; idx 0=3 -> "Valid." |
| imf5 | idx 0=2 -> "Nonpolar." |
| cal5 | idx 1=3 -> "Off by 2." |
| el2 | idx 0=2 -> "Off by 2." |
| hc3 | idx 1=2 -> "Smaller than vap." |
| imf6 | idx 0=3 -> "Ionic — high MP." |
| imf7 | idx 1=3 -> "Polar — won't dissolve in nonpolar." |
| nu5 | idx 2=3 -> "Mass shouldn't change." |
| ar4 | idx 0=2 -> "Off by 10." |
| lc4 | idx 0=1 -> "Partial pressures unchanged." |
| lc5 | idx 0=1 -> "Catalyst doesn't shift." |
| rp5 | idx 1=2 -> "E° doesn't scale." |
| sw5 | idx 2=3 -> "Strong acid is acidic." |
| sw6 | idx 0=2 -> "Strong acid → useless conjugate base."; idx 0=3 -> "Strong acid → useless conjugate base." |
| at-q3 | idx 2=3 -> "Out of order." |
| mc-q2 | idx 0=1 -> "Wrong ratio." |
| lr-q3 | idx 0=1 -> "Off." |
| s-q1 | idx 1=3 -> "Off." |
| s-q2 | idx 1=2 -> "Off." |
| imf-q2 | idx 0=3 -> "London only." |
| sf-q2 | idx 0=1 -> "One interpretation but not certain." |
| gl-q1 | idx 0=1 -> "Same n." |
| gl-q2 | idx 0=2 -> "Off by 2." |
| cal-q1 | idx 0=2 -> "Off."; idx 0=3 -> "Off." |
| rl-q1 | idx 0=2 -> "1st order." |
| rl-q2 | idx 2=3 -> "B doesn't affect." |
| lc-q3 | idx 0=1 -> "Shifts left." |
| ph-q2 | idx 0=2 -> "Acid only." |
| el-q3 | idx 0=2 -> "Off by 2." |
| xx-q1 | idx 0=3 -> "Off." |
| xx-q3 | idx 1=3 -> "Off by 2." |

## Check 4 — `why` present and longer than 30 characters

Flags explanations missing entirely or trimmed length <= 30. Lots of these are terse cross-references like "Same as A." or "See B."

| id | len | why |
|---|---|---|
| at5 | 18 | "Planck: E=hf=hc/λ." |
| at6 | 20 | "2n²=18 (3s²3p⁶3d¹⁰)." |
| at8 | 30 | "Lyman series: ends at n=1, UV." |
| b1 | 28 | "Polarity ∝ ΔEN. O-H largest." |
| b2 | 16 | "ΔEN≈2.2 — ionic." |
| b5 | 23 | "H bonded to F → H-bond." |
| lw1 | 14 | "4 + 2(6) = 16." |
| v2 | 15 | "6 bonds, 0 LPs." |
| m1 | 10 | "36/18 = 2." |
| m2 | 18 | "0.5×6×10²³=3×10²³." |
| m4 | 12 | "2×22.4=44.8." |
| m5 | 11 | "0.25×44=11." |
| m6 | 30 | "mol=4.4/44=0.1; mol×NA=6×10²²." |
| lr3 | 15 | "42.5/50×100=85." |
| lr4 | 28 | "2 mol NH₃ × 17 g/mol = 34 g." |
| s1 | 14 | "M=0.5/0.250=2." |
| s2 | 28 | "M₁V₁=M₂V₂ → V₂=600/0.5=1200." |
| s3 | 27 | "ΔTf=i·Kf·m=2(1.86)(1)=3.72." |
| s6 | 30 | "mol EtOH=1, H₂O=4. X=1/5=0.20." |
| g2 | 22 | "P/T const → T×2 → P×2." |
| g3 | 22 | "Boyle: 1×10=P×2 → P=5." |
| g4 | 21 | "X·P_total=(2/5)(5)=2." |
| g5 | 24 | "Graham: √(32/4)=√8=2.83." |
| e1 | 24 | "q=mcΔT=100×0.45×60=2700." |
| e2 | 23 | "Hess: −110+(−283)=−393." |
| e3 | 14 | "2×(−286)=−572." |
| e4 | 21 | "Reversing flips sign." |
| e5 | 18 | "0.5×(−2800)=−1400." |
| en2 | 29 | "Solid→liquid → more disorder." |
| en4 | 25 | "Produces gas from liquid." |
| gb1 | 17 | "Both terms favor." |
| gb3 | 30 | "T_tip=ΔH/ΔS=−40000/−100=400 K." |
| gb4 | 22 | "ΔG°=−nFE°=0 when E°=0." |
| gb5 | 8 | "ln(1)=0." |
| rl1 | 14 | "(2²)(½)=4×½=2." |
| rl2 | 14 | "t½=0.693/k=10." |
| rl3 | 27 | "k=Ae^(-Ea/RT). Exponential." |
| rl4 | 13 | "[A]=−kt+[A]₀." |
| ar1 | 26 | "Lowers Ea both directions." |
| ar2 | 27 | "ΔH=Ea_fwd−Ea_rev=50−80=−30." |
| ek2 | 16 | "Solids excluded." |
| ek3 | 19 | "Need more products." |
| ek4 | 14 | "Reverse → 1/K." |
| lc3 | 28 | "Partial pressures unchanged." |
| ic1 | 23 | "x=√(Ka·C)=√(10⁻⁶)=10⁻³." |
| ic3 | 26 | "√(1.8×10⁻⁵×0.1)=1.34×10⁻³." |
| ph1 | 13 | "−log(10⁻³)=3." |
| ph2 | 11 | "14−8.3=5.7." |
| ph3 | 26 | "Kb=Kw/Ka=10⁻¹⁴/(1.8×10⁻⁵)." |
| ph4 | 27 | "Conjugate identity at 25°C." |
| bf1 | 20 | "Half-neutralization." |
| bf4 | 29 | "Pick pKa within ±1 of target." |
| ks1 | 18 | "s²=10⁻¹⁰ → s=10⁻⁵." |
| gv1 | 14 | "Red Cat An Ox." |
| rp1 | 14 | "Highest E°red." |
| nr2 | 20 | "Cell at equilibrium." |
| nu1 | 14 | "Mass −4, Z −2." |
| nu2 | 9 | "(½)³=1/8." |
| nu4 | 27 | "γ photon — penetrates lead." |
| hb2 | 28 | "3 bonds + 1 LP = steric # 4." |
| at-e1 | 24 | "mass − Z = 35 − 17 = 18." |
| at-e5 | 29 | "S has 16 p; gained 2 e⁻ → 18." |
| lw-e1 | 24 | "O(6) + 2(H, 1 each) = 8." |
| lw-e2 | 19 | "C(4) + 4(H, 1) = 8." |
| lw-e5 | 22 | "FC = 4 − 0 − ½(8) = 0." |
| v-e1 | 20 | "Steric # 2 → linear." |
| v-e2 | 12 | "Tetrahedral." |
| qn-e1 | 30 | "n² = 4 orbitals (1×2s + 3×2p)." |
| mc-e1 | 18 | "mol = 22/44 = 0.5." |
| mc-e3 | 30 | "STP molar volume = 22.4 L/mol." |
| mc-e4 | 30 | "0.5 × 6.022×10²³ = 3.011×10²³." |
| mc-e5 | 23 | "23 + 16 + 1 = 40 g/mol." |
| mc-e6 | 16 | "14/28 = 0.5 mol." |
| mc-e12 | 20 | "12/44 × 100 = 27.3%." |
| mc-e15 | 16 | "100/58.5 ≈ 1.71." |
| lr-e4 | 18 | "4.2/5 × 100 = 84%." |
| lr-e6 | 24 | "actual = 0.75 × 8 = 6 g." |
| lr-e9 | 19 | "78/100 × 100 = 78%." |
| lr-e11 | 20 | "45/50 × 100 = 90.0%." |
| lr-e14 | 20 | "16/22 × 100 = 72.7%." |
| s-e1 | 26 | "M = mol/L = 0.2/0.5 = 0.4." |
| s-e2 | 30 | "mol = M × V = 2 × 0.250 = 0.5." |
| s-e4 | 20 | "M = 0.5/0.250 = 2.0." |
| s-e7 | 30 | "%w/w = 20/(20+80) × 100 = 20%." |
| s-e9 | 25 | "mol = 0.4 × 0.025 = 0.01." |
| s-e11 | 19 | "χ = 1/(1+9) = 0.10." |
| gl-e1 | 28 | "P/T = constant (Gay-Lussac)." |
| gl-e2 | 20 | "0.5 × 22.4 = 11.2 L." |
| gl-e3 | 27 | "K = °C + 273. 27+273 = 300." |
| gl-e4 | 26 | "2(4) = P₂(8) → P₂ = 1 atm." |
| gl-e5 | 27 | "Sum: 0.6+0.3+0.1 = 1.0 atm." |
| gl-e8 | 30 | "χ = P_i/P_T = 0.21/1.0 = 0.21." |
| gl-e12 | 28 | "χ_N₂ = 0.5/(0.5+1.5) = 0.25." |
| en-e1 | 29 | "Exo = releases heat → ΔH < 0." |
| en-e2 | 29 | "Reference state defined as 0." |
| en-e3 | 30 | "q = mcΔT = 50×2.0×10 = 1000 J." |
| en-e4 | 21 | "Reversing flips sign." |
| ca-e1 | 22 | "25 × 4.18 × 10 = 1045." |
| ent-e1 | 19 | "Increased disorder." |
| gb-e1 | 21 | "ΔG < 0 → spontaneous." |
| gb-e6 | 29 | "ΔH wins at low T (TΔS small)." |
| rl-e1 | 29 | "Exponent on [A] is the order." |
| rl-e4 | 30 | "rate (M/s) = k. k must be M/s." |
| ek-e1 | 22 | "K = [B]/[A] = 4/2 = 2." |
| ek-e3 | 15 | "Q = 4/(1)² = 4." |
| ek-e6 | 20 | "Δn = 2 − (2+1) = −1." |
| ph-e1 | 27 | "[H⁺] = 0.01 = 10⁻². pH = 2." |
| ph-e3 | 20 | "pH = −log(10⁻⁵) = 5." |
| ph-e4 | 19 | "pH+pOH=14. 14−3=11." |
| ph-e6 | 29 | "pOH = 14−9 = 5. [OH⁻] = 10⁻⁵." |
| ph-e8 | 20 | "[H⁺]=0.1=10⁻¹. pH=1." |
| ph-e9 | 20 | "Below pH 7 = acidic." |
| sw-e2 | 18 | "Group 1 hydroxide." |
| bf-e1 | 29 | "Pick pKa within ±1 of target." |
| bf-e2 | 22 | "log(1) = 0 → pH = pKa." |
| gv-e2 | 24 | "+E° → −ΔG → spontaneous." |
| nu-e1 | 11 | "(½)² = 1/4." |
| xx-e1 | 22 | "M = 0.5/0.250 = 2.0 M." |
| nu-q1 | 22 | "(1/2)⁴ = 1/16 = 6.25%." |

## Check 5 — `skills` non-empty and all entries resolve

Every skill ID in `q.skills` must appear in the SKILLS array (39 valid IDs).

| id | reason | bad ids |
|---|---|---|
| none | none | none |

## Check 6 — Unique question IDs

| id | count |
|---|---|
| none | none |

## Check 7 — `diff` is one of {1,2,3,4}

| id | diff |
|---|---|
| none | none |

## Check 8 — Coverage by skill

Each question can be tagged with multiple skills. "Primary" count uses the first entry of `skills[]` (the canonical owner). "Tagged" count is any appearance.

Thresholds: under 5 (mock cannot draw a stable sample) and over 40 (likely over-represented vs. blueprint). Both based on PRIMARY count, since secondary tags inflate it.

### Skills with fewer than 5 primary questions

| skill id | name | primary | tagged |
|---|---|---|---|
| colligative | Colligative Properties | 0 | 4 |
| guess | Educated Guessing | 0 | 0 |
| lab-techniques | Lab Techniques | 0 | 0 |
| skip-ret | Skip-and-Return Strategy | 0 | 0 |
| untimed | Untimed Mastery Checkpoint | 0 | 0 |

### Skills with more than 40 primary questions

| skill id | name | primary | tagged |
|---|---|---|---|
| none | none | none | none |

### Full coverage table (all skills)

| skill id | name | primary | tagged |
|---|---|---|---|
| mole-conv | Mole Conversions | 33 | 41 |
| gas-laws | Gas Laws | 32 | 36 |
| lim-react | Limiting Reactant | 26 | 27 |
| ph-basics | Acid-Base — pH/pOH/Ka/Kb | 25 | 33 |
| solutions | Solutions & Concentration | 24 | 32 |
| atomic | Atomic Structure | 23 | 27 |
| imf-rank | Intermolecular Forces | 22 | 22 |
| bonding | Bonding Basics | 21 | 24 |
| buffers | Acid-Base — Buffers (HH) | 20 | 24 |
| eq-kc | Equilibrium — Kc & Kp | 20 | 28 |
| titration | Acid-Base — Titration Curves | 20 | 21 |
| lewis | Lewis Structures | 19 | 26 |
| periodic | Periodic Trends | 19 | 21 |
| enthalpy | Thermo — Enthalpy (ΔH/Hess) | 18 | 27 |
| gibbs | Thermo — Gibbs ΔG | 18 | 23 |
| hybridization | Hybridization (sp/sp²/sp³) | 18 | 18 |
| strong-weak | Acid-Base — Strong vs Weak | 18 | 28 |
| calorimetry | Calorimetry (q=mcΔT) | 17 | 22 |
| nernst | Electrochem — Nernst Eqn | 17 | 17 |
| arrhenius | Kinetics — Arrhenius + Catalysis | 15 | 16 |
| eq-ice | Equilibrium — ICE Table | 15 | 16 |
| ksp | Solubility Equilibria (Ksp) | 15 | 15 |
| rate-laws | Kinetics — Rate Laws | 15 | 21 |
| vsepr | VSEPR & Geometry | 15 | 21 |
| eq-lechat | Equilibrium — Le Châtelier | 14 | 19 |
| nuclear | Nuclear Chemistry | 14 | 14 |
| red-pot | Std Reduction Potentials | 14 | 18 |
| sig-figs | Sig Figs & Measurement | 14 | 17 |
| entropy | Thermo — Entropy (ΔS) | 13 | 14 |
| galvanic | Electrochem — Galvanic Cells | 13 | 22 |
| quantum-numbers | Quantum Numbers + Photons | 13 | 14 |
| phase-diag | Phase Diagrams | 9 | 10 |
| electrolysis | Electrolysis (Faraday) | 8 | 8 |
| heating-curve | Heating & Cooling Curves | 8 | 9 |
| colligative | Colligative Properties | 0 | 4 |
| guess | Educated Guessing | 0 | 0 |
| lab-techniques | Lab Techniques | 0 | 0 |
| skip-ret | Skip-and-Return Strategy | 0 | 0 |
| untimed | Untimed Mastery Checkpoint | 0 | 0 |

## Check 9 — Difficulty distribution per skill

Counts use PRIMARY skill assignment. Skills missing tier 1 (foundation) or tier 4 (test-day edge) entries are flagged. Note: the bank uses diff levels 1-4 where 1 = foundation and 4 = test-day edge.

### Skills missing tier 1 (no diff:1 question)

| skill id | name | primary count |
|---|---|---|
| none | none | none |

### Skills missing tier 4 (no diff:4 question)

| skill id | name | primary count |
|---|---|---|
| arrhenius | Kinetics — Arrhenius + Catalysis | 15 |
| atomic | Atomic Structure | 23 |
| bonding | Bonding Basics | 21 |
| calorimetry | Calorimetry (q=mcΔT) | 17 |
| electrolysis | Electrolysis (Faraday) | 8 |
| enthalpy | Thermo — Enthalpy (ΔH/Hess) | 18 |
| entropy | Thermo — Entropy (ΔS) | 13 |
| eq-ice | Equilibrium — ICE Table | 15 |
| eq-lechat | Equilibrium — Le Châtelier | 14 |
| galvanic | Electrochem — Galvanic Cells | 13 |
| gas-laws | Gas Laws | 32 |
| gibbs | Thermo — Gibbs ΔG | 18 |
| heating-curve | Heating & Cooling Curves | 8 |
| hybridization | Hybridization (sp/sp²/sp³) | 18 |
| imf-rank | Intermolecular Forces | 22 |
| ksp | Solubility Equilibria (Ksp) | 15 |
| lewis | Lewis Structures | 19 |
| mole-conv | Mole Conversions | 33 |
| nuclear | Nuclear Chemistry | 14 |
| periodic | Periodic Trends | 19 |
| ph-basics | Acid-Base — pH/pOH/Ka/Kb | 25 |
| phase-diag | Phase Diagrams | 9 |
| quantum-numbers | Quantum Numbers + Photons | 13 |
| rate-laws | Kinetics — Rate Laws | 15 |
| red-pot | Std Reduction Potentials | 14 |
| sig-figs | Sig Figs & Measurement | 14 |
| solutions | Solutions & Concentration | 24 |
| strong-weak | Acid-Base — Strong vs Weak | 18 |
| titration | Acid-Base — Titration Curves | 20 |
| vsepr | VSEPR & Geometry | 15 |

### Full diff distribution per skill (primary)

| skill id | name | total | d1 | d2 | d3 | d4 |
|---|---|---|---|---|---|---|
| arrhenius | Kinetics — Arrhenius + Catalysis | 15 | 4 | 4 | 7 | 0 |
| atomic | Atomic Structure | 23 | 6 | 11 | 6 | 0 |
| bonding | Bonding Basics | 21 | 6 | 8 | 7 | 0 |
| buffers | Acid-Base — Buffers (HH) | 20 | 3 | 10 | 6 | 1 |
| calorimetry | Calorimetry (q=mcΔT) | 17 | 3 | 8 | 6 | 0 |
| colligative | Colligative Properties | 0 | 0 | 0 | 0 | 0 |
| electrolysis | Electrolysis (Faraday) | 8 | 1 | 4 | 3 | 0 |
| enthalpy | Thermo — Enthalpy (ΔH/Hess) | 18 | 4 | 8 | 6 | 0 |
| entropy | Thermo — Entropy (ΔS) | 13 | 5 | 5 | 3 | 0 |
| eq-ice | Equilibrium — ICE Table | 15 | 1 | 6 | 8 | 0 |
| eq-kc | Equilibrium — Kc & Kp | 20 | 3 | 9 | 7 | 1 |
| eq-lechat | Equilibrium — Le Châtelier | 14 | 3 | 7 | 4 | 0 |
| galvanic | Electrochem — Galvanic Cells | 13 | 5 | 5 | 3 | 0 |
| gas-laws | Gas Laws | 32 | 6 | 16 | 10 | 0 |
| gibbs | Thermo — Gibbs ΔG | 18 | 3 | 7 | 8 | 0 |
| guess | Educated Guessing | 0 | 0 | 0 | 0 | 0 |
| heating-curve | Heating & Cooling Curves | 8 | 2 | 3 | 3 | 0 |
| hybridization | Hybridization (sp/sp²/sp³) | 18 | 4 | 8 | 6 | 0 |
| imf-rank | Intermolecular Forces | 22 | 5 | 13 | 4 | 0 |
| ksp | Solubility Equilibria (Ksp) | 15 | 1 | 7 | 7 | 0 |
| lab-techniques | Lab Techniques | 0 | 0 | 0 | 0 | 0 |
| lewis | Lewis Structures | 19 | 5 | 10 | 4 | 0 |
| lim-react | Limiting Reactant | 26 | 4 | 13 | 8 | 1 |
| mole-conv | Mole Conversions | 33 | 9 | 17 | 7 | 0 |
| nernst | Electrochem — Nernst Eqn | 17 | 3 | 5 | 7 | 2 |
| nuclear | Nuclear Chemistry | 14 | 4 | 6 | 4 | 0 |
| periodic | Periodic Trends | 19 | 5 | 10 | 4 | 0 |
| ph-basics | Acid-Base — pH/pOH/Ka/Kb | 25 | 8 | 12 | 5 | 0 |
| phase-diag | Phase Diagrams | 9 | 3 | 5 | 1 | 0 |
| quantum-numbers | Quantum Numbers + Photons | 13 | 4 | 5 | 4 | 0 |
| rate-laws | Kinetics — Rate Laws | 15 | 2 | 9 | 4 | 0 |
| red-pot | Std Reduction Potentials | 14 | 3 | 8 | 3 | 0 |
| sig-figs | Sig Figs & Measurement | 14 | 4 | 9 | 1 | 0 |
| skip-ret | Skip-and-Return Strategy | 0 | 0 | 0 | 0 | 0 |
| solutions | Solutions & Concentration | 24 | 7 | 12 | 5 | 0 |
| strong-weak | Acid-Base — Strong vs Weak | 18 | 5 | 9 | 4 | 0 |
| titration | Acid-Base — Titration Curves | 20 | 5 | 10 | 5 | 0 |
| untimed | Untimed Mastery Checkpoint | 0 | 0 | 0 | 0 | 0 |
| vsepr | VSEPR & Geometry | 15 | 5 | 8 | 2 | 0 |

## Check 10 — Top 10 and bottom 10 by primary count

### Top 10

| skill id | name | primary |
|---|---|---|
| mole-conv | Mole Conversions | 33 |
| gas-laws | Gas Laws | 32 |
| lim-react | Limiting Reactant | 26 |
| ph-basics | Acid-Base — pH/pOH/Ka/Kb | 25 |
| solutions | Solutions & Concentration | 24 |
| atomic | Atomic Structure | 23 |
| imf-rank | Intermolecular Forces | 22 |
| bonding | Bonding Basics | 21 |
| buffers | Acid-Base — Buffers (HH) | 20 |
| eq-kc | Equilibrium — Kc & Kp | 20 |

### Bottom 10

| skill id | name | primary |
|---|---|---|
| untimed | Untimed Mastery Checkpoint | 0 |
| skip-ret | Skip-and-Return Strategy | 0 |
| lab-techniques | Lab Techniques | 0 |
| guess | Educated Guessing | 0 |
| colligative | Colligative Properties | 0 |
| heating-curve | Heating & Cooling Curves | 8 |
| electrolysis | Electrolysis (Faraday) | 8 |
| phase-diag | Phase Diagrams | 9 |
| quantum-numbers | Quantum Numbers + Photons | 13 |
| galvanic | Electrochem — Galvanic Cells | 13 |
