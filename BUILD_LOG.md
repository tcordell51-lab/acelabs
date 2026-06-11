# Ace Labs — Build Log

One line per overnight/iteration pass. Read this before starting work to avoid
repeating or thrashing. Newest entries at the bottom.

Format: `- YYYY-MM-DD: Built [change]. Why: [score lever]. Verified: [checks]. Follow-ups: [remaining].`

---

- 2026-06-11: Built endocrine retrieval integration — wired the `end` node into the Bio retrieval/spaced-repetition engine (STATE + NODES + wiring list) and expanded its 3 previously-dead prompts to 8 predict-before-reveal items (hormone class/receptor, gland source, insulin/glucagon + PTH/calcitonin antagonist pairs, aldosterone gland→target→effect, and primary-vs-secondary diagnosis via the tropic hormone). Added keyboard operability (Enter/Space) to retrieval options in the shared handler. Why: most endocrine DAT points are recall, not concept — misses now generate SM-2 Ace Cards that resurface high-yield patterns through the due-count flow, which is the actual score lever. Verified: `node --check` on bio-shared.js + all inline physiology scripts; `end` present in STATE/NODES(8 tiers)/wiring list; 8 cards = 8 mastery cells = 8 labels, exactly one correct option each; card question text matches NODES question text (so the spaced-review card reads identically); empty-localStorage safe; no new deps/build files; no global CSS added. Browser run NOT performed (no headless browser available in this environment) — layout/interaction unverified visually. Follow-ups: the same wiring gap leaves other physiology retrieval sections dead (`syn, rfx, brn, snz, rsp, dig, rpd, imn, sf` — authored HTML cards but absent from NODES + wiring list); calcium/glucose push-pull visual loops still pending from the earlier endocrine-visuals backlog.
