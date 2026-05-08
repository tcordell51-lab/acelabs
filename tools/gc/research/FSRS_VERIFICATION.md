# FSRS Spaced-Repetition Scheduler — Claim Verification

**Verifier:** Claude Code (Opus 4.7, 1M)
**Access date:** 2026-05-07
**Method:** WebSearch + WebFetch (live, not cached training data). Where a tool returned a 403/404 or insufficient detail, I fall back to corroborating multiple independent sources.

---

## 1. Anki adoption

**Claim:** FSRS was added to Anki as an option in 2023; it is now the default scheduler in Anki desktop / AnkiWeb / AnkiMobile as of late 2024/2025.

**Verdict:** **PARTIALLY CONFIRMED / NEEDS NUANCE**

- **Added in 2023: CONFIRMED.** Anki 23.10 (released ~Nov 1, 2023) was "the first official version with FSRS built-in" per the LessWrong "History of FSRS for Anki" post. FSRS has been available on desktop, AnkiWeb, AnkiMobile (iOS), and AnkiDroid since the 23.10 cycle.
- **Default by late 2024/2025: AMBIGUOUS — sources disagree.**
  - As of January–February 2024, the Anki forum thread "Why isn't FSRS the default scheduler?" includes a reply from dae (Anki's creator) explaining that FSRS was *not* the default at that time because integration kinks remained.
  - GitHub issue ankitects/anki#3616 (opened ~late 2024) proposed enabling FSRS by default in "the next non-trivial (not 24.11.x) update" — confirming it was still opt-in through 24.11.
  - Multiple secondary blog posts (studycardsai, slidetoanki, iatroX 2026 guides) state FSRS "has been the default since 23.10," which contradicts the primary-source forum thread and issue. These appear to be inaccurate.
  - I could not confirm from Anki's own release notes a specific version that flipped FSRS to default-on for new users. The release notes I fetched mention FSRS-6 improvements in 25.07 / 25.09 but do not quote a "FSRS is now enabled by default" line.

**Bottom line:** FSRS is shipped in every Anki client and is *recommended*, but I cannot confirm from primary sources that it is the default-on scheduler for new users as of this writing. Treat the "default" claim as unverified.

**Sources:**
- https://forums.ankiweb.net/t/why-isnt-fsrs-the-default-scheduler/40455 (accessed 2026-05-07)
- https://github.com/ankitects/anki/issues/3616 (accessed 2026-05-07)
- https://www.lesswrong.com/posts/G7fpGCi8r7nCKXsQk/the-history-of-fsrs-for-anki (accessed 2026-05-07)
- https://docs.ankiweb.net/deck-options.html (accessed 2026-05-07) — describes FSRS as "an alternative to Anki's legacy SM-2 algorithm"

---

## 2. Latest version

**Claim:** FSRS-4.5 was current around 2023; FSRS-5 may have followed.

**Verdict:** **CORRECTED.** FSRS-5 did follow, and FSRS-6 is now current.

| Version | Release | Notes |
|---|---|---|
| FSRS-4.5 | 2023-12-26 | Flatter forgetting curve |
| FSRS-5 | 2024-07-10 | Adds short-term review effects, improved initial difficulty (~4% prediction-error reduction); 19 parameters |
| FSRS-6 | 2025 (available in Anki since 25.07) | 21 parameters; better short-term review handling and forgetting-rate modeling |

**Sources:**
- https://www.lesswrong.com/posts/G7fpGCi8r7nCKXsQk/the-history-of-fsrs-for-anki (FSRS-4.5 and FSRS-5 dates; accessed 2026-05-07)
- https://expertium.github.io/Algorithm.html ("FSRS-6 is available in Anki since version 25.07"; accessed 2026-05-07)
- https://github.com/ankitects/anki/pull/3929 (Feat/FSRS-6 PR by L-M-Sherlock)
- https://github.com/open-spaced-repetition/awesome-fsrs/wiki/ABC-of-FSRS ("The most recent version of FSRS, FSRS-6, uses 21 parameters")

---

## 3. Validation paper (Ye et al. KDD '22)

**Claim:** Ye, J., Su, J., & Cao, Y. (2022). *A Stochastic Shortest Path Algorithm for Optimizing Spaced Repetition Scheduling.* KDD '22. https://dl.acm.org/doi/10.1145/3534678.3539081

**Verdict:** **CONFIRMED.**

- Title, authors, and DOI all match. The paper is "A Stochastic Shortest Path Algorithm for Optimizing Spaced Repetition Scheduling," published in *Proceedings of the 28th ACM SIGKDD Conference on Knowledge Discovery and Data Mining* (KDD '22), Aug 14–18, 2022, Washington DC. Pages 4381–4390.
- Authors: Junyao Ye, Jingyong Su, Yilong Cao.
- The DOI 10.1145/3534678.3539081 resolves correctly to ACM Digital Library.
- Note: this paper presents the **SSP-MMC** scheduler (precursor / sister algorithm to FSRS) using MaiMemo data; it is *not* an FSRS-as-such validation paper. FSRS itself does not appear to have its own peer-reviewed paper — Jarrett Ye's published peer-reviewed work is this KDD paper. If the citation is being used to back FSRS, that is a slight overreach: it backs the underlying memory model and SSP optimization, not FSRS-5/6 specifically.

**Sources:**
- https://dl.acm.org/doi/10.1145/3534678.3539081 (accessed 2026-05-07)
- https://github.com/maimemo/SSP-MMC (companion code repo)
- https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/VAGUL0 (replication data)

---

## 4. Default weights

**Claim:** Find the published default weights for the current FSRS version (vector of ~17–21 numbers).

**Verdict:** **CONFIRMED — for both FSRS-5 (19 params) and FSRS-6 (21 params).**

### FSRS-5 defaults (19 parameters)
Quoted from prior FSRS documentation / fsrs-rs:

```
0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046,
1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315,
2.9898, 0.51655, 0.6621
```

### FSRS-6 defaults (21 parameters) — current
Quoted verbatim from py-fsrs / PyPI page (fsrs 6.3.1, published 2026-03-10):

```
(0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001,
 1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014,
 1.8729, 0.5425, 0.0912, 0.0658, 0.1542)
```

**Caveat:** I was unable to fetch the raw `scheduler.py` file directly (404), so the FSRS-6 numeric tuple comes from the PyPI rendering of the same package's README/docstring. Two independent searches returned the same 21-tuple, which strongly supports it, but for production use you should pin to a specific py-fsrs version and read the value at `Scheduler.DEFAULT_PARAMETERS` rather than copy-pasting from this doc.

**Sources:**
- https://pypi.org/project/fsrs/ (accessed 2026-05-07; latest version 6.3.1, released 2026-03-10)
- https://github.com/open-spaced-repetition/fsrs-rs (FSRS-5 defaults)
- https://expertium.github.io/Algorithm.html

---

## 5. Browser-only / vanilla-JS implementations

**Claim:** Find FSRS ports usable without a build step.

**Verdict:** **CONFIRMED — `ts-fsrs` is the canonical recommendation.**

| Package | License | Latest | Last release | Bundle/deps | Build-step-free? |
|---|---|---|---|---|---|
| **ts-fsrs** (`open-spaced-repetition/ts-fsrs`) | MIT | v5.3.2 | 2025-03-31 | Pure TS, zero runtime deps. Ships ESM + CJS + UMD | YES — usable directly via `<script type="module">` from jsDelivr: `import * as tsFsrs from 'https://cdn.jsdelivr.net/npm/ts-fsrs@latest/+esm'` |
| **fsrs.js** (`open-spaced-repetition/fsrs.js`) | MIT | (older) | Maintainers explicitly redirect users to ts-fsrs: "the major maintainer of `fsrs.js` becomes busy and cannot maintain the project" | n/a | Deprecated in spirit; do not adopt for new work |
| **@open-spaced-repetition/binding** (`fsrs-rs` napi/wasm binding) | MIT | 0.3.0 | 2025-03-31 | Wraps Rust `fsrs-rs` via napi-rs / WASM; for the *optimizer*, not just the scheduler | Browser-capable via WASM but requires bundler/worker setup; NOT zero-build |
| **fsrs-browser** (`open-spaced-repetition/fsrs-browser`) | MIT | n/a | Active | Browser-targeted optimizer + scheduler with WASM | Not a drop-in vanilla-JS module |
| **@squeakyrobot/fsrs**, `mcfarljw/fsrs` | MIT | Forks of ts-fsrs | n/a | Same shape | Same as ts-fsrs |

**Recommendation for AceLabs (no build step):** use `ts-fsrs` via jsDelivr ESM CDN. It has no runtime dependencies, is ~600+ stars, MIT, and is the only mature option that actually ships a UMD/ESM bundle you can drop into a `<script type="module">`.

I could not confirm an exact unpacked KB size from npm (the npm page returned 403 to WebFetch). The repo lists no runtime dependencies, so the published bundle is essentially the compiled scheduler logic — small, on the order of low double-digit KB minified, but treat that as approximate until you `npm view ts-fsrs` locally.

**Sources:**
- https://github.com/open-spaced-repetition/ts-fsrs (accessed 2026-05-07)
- https://github.com/open-spaced-repetition/ts-fsrs/releases (v5.3.2, 2025-03-31)
- https://github.com/open-spaced-repetition/fsrs.js (deprecation note in README)
- https://github.com/open-spaced-repetition/fsrs-browser
- https://www.jsdelivr.com/package/npm/ts-fsrs (CDN)

---

## 6. Half-life regression vs FSRS

**Claim:** Has Settles & Meeder's HLR been compared head-to-head with FSRS?

**Verdict:** **CONFIRMED — FSRS substantially outperforms HLR in published benchmarks.**

- The `srs-benchmark` project (https://github.com/open-spaced-repetition/srs-benchmark) and Jarrett Ye / Expertium's "Benchmark of Spaced Repetition Algorithms" both include HLR as a baseline alongside FSRS, SM-2, and others.
- Per Expertium's benchmark write-up:
  - HLR's AUC on the Anki dataset is **0.6333** (Expertium notes Duolingo themselves reported only 0.54 in the original paper, "not that impressive either").
  - FSRS-6 with recency weighting shows "substantially lower log loss" than HLR.
  - The "superiority matrix" shows FSRS variants beating HLR across nearly all user collections evaluated.
- Caveat: the Anki-side benchmark uses HLR with only interval lengths and grades, not Duolingo's linguistic features. Expertium acknowledges HLR likely performs somewhat better in Duolingo's own setting.
- Original HLR paper: Settles & Meeder, *A Trainable Spaced Repetition Model for Language Learning*, ACL 2016 — https://research.duolingo.com/papers/settles.acl16.pdf

**Sources:**
- https://expertium.github.io/Benchmark.html (accessed 2026-05-07)
- https://github.com/open-spaced-repetition/srs-benchmark
- https://github.com/ankitects/fsrs-benchmark
- https://research.duolingo.com/papers/settles.acl16.pdf
- https://github.com/duolingo/halflife-regression

---

## Summary table

| # | Claim | Verdict |
|---|---|---|
| 1 | Added to Anki in 2023 | CONFIRMED |
| 1 | Currently the default scheduler | UNVERIFIED — primary sources say it's still opt-in through at least 24.11; "default since 23.10" claim circulating in blogs appears wrong |
| 2 | FSRS-4.5 → FSRS-5 → FSRS-6 progression | CORRECTED to current state (FSRS-6 is current; py-fsrs 6.3.1 published 2026-03-10) |
| 3 | Ye, Su, Cao 2022 KDD paper at DOI 10.1145/3534678.3539081 | CONFIRMED (note: it's the SSP-MMC paper, not strictly an FSRS validation) |
| 4 | Default weights are a vector of ~17–21 numbers | CONFIRMED — 21 for FSRS-6, 19 for FSRS-5; values quoted above |
| 5 | Vanilla-JS / no-build implementations exist | CONFIRMED — `ts-fsrs` via jsDelivr ESM is the recommended path |
| 6 | HLR has been compared to FSRS | CONFIRMED — FSRS outperforms HLR in benchmarks |

## Single most useful URL to keep on hand

**https://expertium.github.io/Algorithm.html** — Jarrett Ye / Expertium's technical explanation of FSRS. It documents algorithm versions, parameter counts, current state in Anki, and is updated alongside releases. Pair it with **https://github.com/open-spaced-repetition/awesome-fsrs** as the index for implementations and papers.
