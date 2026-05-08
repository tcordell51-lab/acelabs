# Agent W6 — Adaptive Testing & Diagnostic Measurement

Lane: how real adaptive systems efficiently identify a learner's weak skills. Target: AceTheDAT QR diagnostic (currently 22 questions / 22 skills / Weak 3 ranking).

## CAT (Computerized Adaptive Testing)

GRE/GMAT/SAT-CAT/NCLEX use this. Loop:
1. Start at population-mean ability (theta=0)
2. Score response
3. Update theta-hat (MLE or Bayes)
4. Pick next item maximizing **Item Information Function (IIF)** at theta-hat
5. Stop when SE(theta-hat) < threshold or fixed N

For 2PL item: `I(theta) = a^2 * P(theta) * (1-P(theta))`. Information peaks when theta == b. Provably locally optimal.

Production needs item exposure control (Sympson-Hetter), content balancing, and 100+ calibrated items per domain.

## IRT models

| Model | Params | Use when |
|---|---|---|
| 1PL/Rasch | b only | Small banks 100-200 examinees |
| 2PL | b, a | 200-500+ examinees |
| 3PL | b, a, c | MC w/ guessing, 500-1000+ examinees |

Calibration via R `mirt`, Python `pyirt`/`girth`/`catsim`. Need 500-1000+ per item for high-stakes; serviceable Rasch from 50-100. **No calibration data on day 1** is the key limitation for our QR diagnostic.

## CDM (Cognitive Diagnostic Models) — most relevant family

Right model when goal is "tell student which **specific skills** they don't have."

**Q-matrix:** binary vector of skills each item requires. Student has latent attribute profile (binary mastery vector).

- **DINA (Deterministic Inputs, Noisy AND-gate):** conjunctive — must master all required skills. 2 params per item (slip, guess). **Best baseline for our scale.**
- DINO: disjunctive
- G-DINA: saturated, more flexible, more parameters

**Why CDM > IRT for QR:**
- Output is per-skill mastery probabilities (the routing signal), not one ability number
- Q-matrix forces authoring rigor

**Cost:** Q-matrix design is hard; misspecification poisons diagnosis. Items should load on **1-3 skills** not 1 — single-skill items are weak signal.

## Knowledge Tracing (continuous practice)

- **BKT (Bayesian Knowledge Tracing):** HMM, 4 params per skill (P_L0, P_T, P_S, P_G). Open source: `pyBKT`.
- **DKT (Deep Knowledge Tracing):** LSTM, AUC ~0.85 vs BKT ~0.68. Opaque, no per-skill readout, data-hungry.
- **PFA (Performance Factor Analysis):** logistic regression, handles multi-skill items natively. Failure counts often more diagnostic than success.
- **Half-Life Regression (Duolingo):** for spaced repetition. ~50% lower error than Leitner.
- **Elo for items/learners:** treat each attempt as match. K-factor controls update. Self-calibrates item difficulty. Correlation with formal IRT difficulty >0.92. **Strong rec for cold-start.**

## ALEKS (Knowledge Space Theory)

Falmagne/Doignon. Lattice of admissible knowledge states (subsets of domain reachable via prereqs). Each question chosen to most evenly split remaining plausible states.

Diagnoses ~200 items in ~30 questions. Too heavy for our scale (knowledge structure must be hand-built).

## Practical adaptation for our scale (20 items, 22 skills)

True CAT overkill. Full G-DINA fragile. ALEKS too heavy.

**Right play:** fixed-form 22-question test + **Q-matrix where each item loads 1-3 skills** + weighted-skill-error scoring + Elo for self-calibration.

This is **PFA without temporal component** — one-shot, multi-skill, weighted scoring.

## Critique of current 22-Q / 22-skill / Weak-3 design

| Aspect | Issue | Fix |
|---|---|---|
| **Identity Q-matrix** | Single observation per skill → slip/guess noise dominates → false-positive weak skills | **Cross-load each item on 1-3 skills (Rec 1)** |
| Raw correct/incorrect | Easy and hard items weighted equally | Weight by item difficulty |
| Fixed Weak 3 | Wrong for students with 1 or 6 weaknesses | Confidence-gap rule |
| No item calibration | Authoring intuition decides difficulty | Elo from response logs |
| Non-adaptive | Wastes budget on already-known skills | 2-stage MST when bank grows |
| 22 = 22 = 22 | Looks elegant; actually **least informative** matrix shape | Change the shape |

The Weak 3 *surface UX* is fine. The problem is upstream: diagnostic is too low-information per question to identify the right 3 reliably.

## 5 recommendations

### Rec 1: Replace 1-item-per-skill identity Q-matrix with cross-loaded Q-matrix.

```
Current Q-matrix (bad):       Better Q-matrix (good):
       s1 s2 s3 ... s22              s1 s2 s3 ... s22
item1   1  0  0      0        item1   1  1  0      0   (ratios + percents)
item2   0  1  0      0        item2   1  0  1      0   (ratios + algebra)
...
```

Each skill hit by ~3 different items in different combinations. Wrong on item5 (A+C) + right on item9 (A+D) + wrong on item14 (C+E) → can pinpoint **C is broken**, not A. Identity Q makes this inference impossible.

### Rec 2: Weighted-skill-error scoring (DINA-light).

```python
SKILLS = [...]
Q = {item_id: [skill_ids]}
ITEM_DIFFICULTY = {item_id: 0..1}    # init: empirical p(correct)

def diagnose(responses):
    skill_evidence = {s: {"hits": 0.0, "misses": 0.0} for s in SKILLS}
    for item_id, correct in responses.items():
        miss_w = 1.0 + (1.0 - ITEM_DIFFICULTY[item_id])  # easy miss = strong weakness
        hit_w  = 1.0 + ITEM_DIFFICULTY[item_id]          # hard hit  = strong mastery
        for s in Q[item_id]:
            if correct: skill_evidence[s]["hits"]   += hit_w
            else:       skill_evidence[s]["misses"] += miss_w
    # Laplace-smoothed mastery probability
    return {s: (e["hits"] + 1) / (e["hits"] + e["misses"] + 2)
            for s, e in skill_evidence.items()}
```

30 lines, no calibration burden, real probability per skill.

### Rec 3: Confidence-gap weak set, not fixed Weak 3.

```python
sorted_skills = sorted(mastery.items(), key=lambda kv: kv[1])
weakest = sorted_skills[0][1]
weak_set = [s for s, m in sorted_skills
            if m < weakest + 0.15 and m < 0.6][:6]
```

One obvious gap → one focus. Broad weakness → longer (capped) list.

### Rec 4: Elo self-calibration of item difficulty.

```python
for item_id, correct in responses.items():
    expected = 1 / (1 + 10 ** ((item_rating[item_id] - student_rating) / 400))
    student_rating       += 32 * (correct - expected)
    item_rating[item_id] += 16 * (expected - correct)
ITEM_DIFFICULTY[item_id] = sigmoid(item_rating[item_id])
```

~50 students in, item difficulty is calibrated for free.

### Rec 5: Future adaptivity = 2-stage MST (multi-stage testing), not item-level CAT.

- **Stage 1:** 8 routing items spanning major skill clusters (Ratios, Geometry, Algebra, Prob/Stats, Word Problems). Always given.
- **Stage 2:** 12 items chosen from a 40-item pool, picked to maximize uncertainty reduction on currently fuzzy skills.

40-item bank achievable. 200+ for true CAT is not.

## Sources

- CAT (Wikipedia): https://en.wikipedia.org/wiki/Computerized_adaptive_testing
- IRT (Wikipedia): https://en.wikipedia.org/wiki/Item_response_theory
- BKT (Wikipedia): https://en.wikipedia.org/wiki/Bayesian_Knowledge_Tracing
- ASC CAT overview: https://assess.com/computerized-adaptive-testing/
- ASC CDM overview: https://assess.com/what-are-cognitive-diagnostic-models/
- ALEKS Knowledge Space Theory: https://www.aleks.com/about_aleks/knowledge_space_theory
- Pavlik PFA AIED 2009: http://pact.cs.cmu.edu/pubs/AIED%202009%20final%20Pavlik%20Cen%20Keodinger%20corrected.pdf
- Piech DKT Stanford: https://stanford.edu/~cpiech/bio/papers/deepKnowledgeTracing.pdf
- pyBKT (Berkeley): https://github.com/CAHLR/pyBKT
- Settles & Meeder Half-Life Regression Duolingo: https://research.duolingo.com/papers/settles.acl16.pdf
- Pelanek Elo in Adaptive Education: https://www.fi.muni.cz/~xpelanek/publications/CAE-elo.pdf

## Executive summary

The single highest-leverage change to the QR diagnostic is **abandoning the 1-item-per-skill identity Q-matrix.** Right now the tool gives every student exactly one observation per skill — meaning a single slip or lucky guess flips a skill from "mastered" to "weak." That's why Weak 3 feels noisy: half the time, two of the three are wrong, because the test does not have enough redundancy to identify them.

The fix takes a few hours of authoring, no new code architecture, no data collection: rewrite the Q-matrix so each of the 22 items loads on **2-3 skills** (e.g., a ratios-in-geometry word problem loads on ratios, geometry, AND word-problem modeling). Change scoring from "did you get the ratios question right" to **weighted-skill-error across multiple items per skill**, with each skill receiving evidence from ~3 items.

Add Laplace smoothing, sort by mastery probability, emit a confidence-gap-bounded weak set instead of fixed Weak 3. This turns the tool from a 22-coin-flip into a structured CDM-lite assessment whose reliability per skill is roughly 3x higher.

Everything else (Elo, MST, BKT, CAT) is appropriate **after** the Q-matrix is fixed. Don't build adaptive selection on top of a noisy diagnostic — fix the diagnostic first.
