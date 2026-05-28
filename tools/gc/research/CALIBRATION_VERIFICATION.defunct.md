> **STATUS: DEFUNCT (2026-05-08).** This document plans/verifies a score-prediction calibration system that has been removed from Ace Labs per a product rule against outcome forecasting in student-visible surfaces. Kept for institutional memory only. Do not act on the contents without confirming the rule has changed.

---

# Calibration Method Verification

Verifies psychometric claims for converting practice-test raw scores to predicted real-exam scaled scores. All sources fetched via live WebSearch / WebFetch on 2026-05-07. URLs accessed 2026-05-07 unless otherwise noted. No DOIs are fabricated; if a source could not be confirmed at the page level, the verdict is UNVERIFIABLE.

---

## Claim 1. Kolen & Brennan minimum sample sizes (N >= 400 linear, N >= 1500 equipercentile, N >= 3000 IRT)

**Verdict: PARTIALLY CONFIRMED (linear and equipercentile thresholds traced to Kolen & Brennan; IRT 3000 is not directly attributed to them in any accessible source).**

- Book confirmed to exist exactly as cited: Kolen, M. J., & Brennan, R. L. (2014). *Test Equating, Scaling, and Linking: Methods and Practices* (3rd ed.). Springer. ISBN 9781493903160, 566 pages.
  - Springer / Cambridge Core review confirming bibliographic detail: https://www.cambridge.org/core/journals/psychometrika/article/abs/m-j-kolen-r-l-brennan-2014-test-equating-scaling-and-linking-methods-and-practices-third-edition-new-york-springer-566-pages-us14900-isbn-9781493903160/261F76DE49AFE7D679717251A31EB38A (accessed 2026-05-07)
  - APA PsycNet record: https://psycnet.apa.org/record/2014-04807-000 (accessed 2026-05-07)
- 400 / 1500 thresholds: corroborated by secondary literature attributing them to Kolen & Brennan. The primary text is paywalled; the available academic PDFs returned binary-only content via WebFetch and could not be page-quoted. Secondary attribution:
  - Practitioner intro citing Kolen & Brennan (2014) and giving its own competing thresholds (linear 100+, equipercentile 200+, IRT "100 to 1000+"): https://thetaminusb.com/2020/10/07/an-intro-to-test-score-equating-what-it-is-when-to-use-it/ (accessed 2026-05-07). This source does NOT match the 400/1500/3000 numbers; it gives smaller minimums.
  - Several review articles (e.g., the equate R-package vignette, ResearchGate review of the 2nd ed.) cite Kolen & Brennan (2004) for "minimum 400 for linear, minimum 1500 for equipercentile" but I could not page-verify in the 3rd ed. text.
- The N >= 3000 for IRT figure: I could not find any source attributing this to Kolen & Brennan. The closest published guidance is general IRT calibration guidance (varies by model, 500-1000 for 3PL is more common). Treat the 3000 number as **not verifiably attributed to Kolen & Brennan**; if you cite it, attribute it to general IRT practice (e.g., De Ayala 2009) instead.

**Action item:** if the 400/1500/3000 numbers are load-bearing, get the physical book and cite the exact page (the chapter-specific recommendations are in Ch. 8 and Ch. 9 of the 3rd ed.).

---

## Claim 2. Holland & Dorans (2006), "Linking and Equating," in Brennan (Ed.) *Educational Measurement* 4th ed., pp. 187-220

**Verdict: CHAPTER EXISTS AS CITED; full text not freely accessible.**

- Brennan (Ed.), *Educational Measurement*, 4th ed., 2006, ACE/Praeger:
  - ERIC catalog record: https://eric.ed.gov/?id=ED493398 (accessed 2026-05-07)
  - Stanford SearchWorks: https://searchworks.stanford.edu/view/6677987 (accessed 2026-05-07)
  - Open Library: https://openlibrary.org/books/OL17201412M/Educational_measurement (accessed 2026-05-07)
- The Holland & Dorans chapter is widely cited at pp. 187-220 with that exact title. Page range and chapter identity are confirmed.
- Does the chapter specifically address prediction (vs. equating proper) for small samples? **PARTIALLY CONFIRMED.** Holland & Dorans's framework explicitly distinguishes three categories: predicting, scale aligning, and equating - i.e., they treat prediction as a different (weaker) thing than equating. This is corroborated by secondary citations of the chapter; see e.g. https://www.tandfonline.com/doi/full/10.1080/15366361003749068 (Dorans, "Thinking About Linking," accessed 2026-05-07). However, I could not retrieve the chapter text itself to confirm whether it gives explicit small-sample prediction guidance. The chapter is behind a paywall (book sold via ACE/Praeger).
- For our N=80 use case the more directly relevant Holland-tradition reference is probably **Livingston & Kim (2009), "The Circle-Arc Method for Equating in Small Samples," *Journal of Educational Measurement***, https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1745-3984.2009.00084.x (accessed 2026-05-07), and the underlying ETS Research Report RR-08-39: https://files.eric.ed.gov/fulltext/EJ1111225.pdf (accessed 2026-05-07).

---

## Claim 3. Harrell rule of 10-20 events per predictor, *Regression Modeling Strategies* 2nd ed., 2015

**Verdict: CONFIRMED that the rule is associated with Harrell. The specific 10-20 phrasing is a paraphrase; Harrell's stated recommendation is "at least 15 EPP."**

- Book confirmed: Harrell, F. E. (2015). *Regression Modeling Strategies* (2nd ed.). Springer.
  - Springer page: https://link.springer.com/book/10.1007/978-3-319-19425-7 (accessed 2026-05-07)
  - Full PDF (institutional mirror, not Springer's): https://nibmehub.com/opac-service/pdf/read/Regression%20Modeling%20Strategies-%202nd%20edition-%202015.pdf (accessed 2026-05-07; PDF text extraction failed via WebFetch, which is why I cannot give an exact page quote).
- The "10 events per predictor" rule is the *original* rule, attributed by Harrell to Peduzzi et al. and Concato et al.; Harrell's own current recommendation is **at least 15 EPP**, with 20 EPP often required. Confirmed via:
  - Riley et al. 2019, "Minimum sample size for developing a multivariable prediction model: PART II," https://pmc.ncbi.nlm.nih.gov/articles/PMC6519266/ (accessed 2026-05-07): "Harrell generally recommends at least 15 EPP" and notes that "others identify situations where at least 20 EPP or up to 50 EPP are required."
  - Wikipedia "One in ten rule": https://en.wikipedia.org/wiki/One_in_ten_rule (accessed 2026-05-07).
- The page number in *Regression Modeling Strategies* 2nd ed. for Harrell's EPP discussion is approximately **Section 4.4 (around pp. 71-75) and Section 5.0**; I could not page-quote due to PDF extraction failure. Riley et al.'s framework (criterion-based, not EPP-based) is now the more current best practice.

---

## Claim 4. Public methodology disclosures from major test prep companies

**Verdict (overall): NONE of these companies publish a real psychometric methodology document. Magoosh and UWorld disclose the most; Kaplan, Princeton Review, and AAMC's prep materials disclose the least.**

| Company | Public methodology doc? | URL | What's actually disclosed |
|---|---|---|---|
| **Kaplan (DAT)** | No | https://www.kaptest.com/study/dat/dat-score-predictor-what-is-your-dat-academic-average-score/ (accessed 2026-05-07) | Marketing copy only. The "predictor" is a 12-question quiz; no disclosure of regression or calibration sample. Article has no visible date. |
| **Princeton Review** | No | https://www.princetonreview.com/college-rankings/ranking-methodology (accessed 2026-05-07) | Page describes only the *college-ranking* methodology, not score predictors. No public score-predictor methodology document found. Anecdotal data (from third-party review sites) suggests their MCAT practice tests deflate by ~15 points; no official confirmation. |
| **Magoosh** | Partial | https://magoosh.zendesk.com/hc/en-us/articles/203445619-How-does-the-GRE-Score-Predictor-feature-on-the-Dashboard-work-Is-it-accurate (Help Center; the page returned 403 to direct fetch but is summarized in WebSearch results, accessed 2026-05-07) | Says: "feedback from previous students' actual GRE scores ... formulating a predicted score based on the resultant correlation," collected since 2009. They claim ~50 questions to stabilize within a 5-point range. No N, no method name, no calibration check published. |
| **UWorld (NCLEX)** | Yes (light) | https://nursing.uworld.com/nclex/self-assessment/ (accessed 2026-05-07) | Explicitly mentions IRT: "the exam utilizes Item Response Theory (IRT) to correlate your raw score with a specific probability of passing" and "developed by expert psychometricians." No sample sizes; no validation paper linked. UWorld CPA "SmartPath" is described as data-pattern analysis: https://accounting.uworld.com/cpa-review/our-difference/smartpath/ (accessed 2026-05-07). |
| **AAMC (MCAT)** | Yes (highest among this group) | https://students-residents.aamc.org/register-mcat-exam/publication-chapters/mcat-exam-scoring (accessed 2026-05-07) plus https://www.aamc.org/services/mcat-admissions-officers/mcat-validity-research (accessed 2026-05-07) | Public-facing pages describe equating verbally ("compensates for small variations in difficulty") but **do NOT explicitly mention IRT** on any current public page I could reach. The deeper technical reference is the older AAMC monograph: Hendrickson, A. B., & Kolen, M. J. (1999), "IRT Equating of the MCAT" (cited in the AAMC bibliography https://www.aamc.org/services/mcat-admissions-officers/bibliography ; accessed 2026-05-07). The 2024 MCAT Validity Data Report exists at https://www.aamc.org/media/78266/download but text extraction failed via WebFetch (PDF binary), so I cannot quote sample sizes. |

---

## Claim 5. AAMC MCAT FL -> MCAT scaled equating: IRT and sample sizes

**Verdict: PARTIALLY CONFIRMED. AAMC does equate via IRT (per a 1999 AAMC technical monograph and per IRT-tradition standard practice), but current public AAMC pages do not state this explicitly, and sample sizes are not publicly disclosed.**

- Most recent public AAMC scoring page: https://students-residents.aamc.org/register-mcat-exam/publication-chapters/mcat-exam-scoring (accessed 2026-05-07). Describes equating only in plain language.
- "MCAT Validity Data Report" (July 2024): https://www.aamc.org/media/78266/download (accessed 2026-05-07; PDF binary, not text-extractable in this session - flag as **UNVERIFIABLE for IRT/sample-size language pending direct human read**).
- Historical IRT confirmation: Hendrickson & Kolen (1999), "IRT Equating of the MCAT," AAMC, cited via the AAMC annotated bibliography https://www.aamc.org/services/mcat-admissions-officers/bibliography (accessed 2026-05-07). This is the closest formal IRT confirmation I could find. AAMC has not (publicly) published a more recent technical equating manual.
- No publicly accessible "scaled-score concordance" document was found; AAMC's 2025 percentile rank table is at https://students-residents.aamc.org/media/18846/download (accessed 2026-05-07) but it gives percentile ranks, not concordance.

---

## Claim 6. NBME equating transparency / most recent USMLE Step 1 or COMLEX technical report

**Verdict: PARTIALLY CONFIRMED that NBME uses IRT and equates by form; no full standalone "USMLE Step 1 technical report" is publicly hosted.**

- NBME explicitly describes IRT-based scoring and equating in score-interpretation guides (the closest thing to a technical manual that is public):
  - Clinical Science Score Interpretation Guide (April 2024): https://www.nbme.org/sites/default/files/2024-04/Clinical_Science_Score_Interpretation_Guide.pdf (accessed 2026-05-07).
  - Common Questions about NBME CBSSA Score Report Changes (2022): https://www.nbme.org/sites/default/files/2022-02/For_Examinees_Common_Questions_2022_Score_Report_Changes_Updated.pdf (accessed 2026-05-07).
  - Comprehensive Basic Science Self-Assessment Sample (2022): https://www.nbme.org/sites/default/files/2022-06/Comprehensive_Basic_Science_Self-Assessment_Sample.pdf (accessed 2026-05-07).
- 2024 USMLE Annual Report (hosted by FSMB): https://www.fsmb.org/siteassets/usmle-step3/pdfs/2024-annual-report-on-the-usmle.pdf (accessed 2026-05-07; PDF binary, text extraction failed in this session - URL confirmed live).
- NBME Research Library landing page: https://www.nbme.org/research-library (accessed 2026-05-07; returned 403 to WebFetch but indexed by Google).
- **Bottom line:** NBME does not publish a single comprehensive technical-manual PDF the way ETS sometimes does. The published documents are score-interpretation guides + peer-reviewed papers by NBME staff. No public sample-size figure for Step 1 equating; no public form-equating tables.

---

## Claim 7. 2022-2025 guidance on small-sample prediction (N < 200) for high-stakes prep

**Verdict: CONFIRMED that recent guidance explicitly moves AWAY from blanket EPP rules and toward criterion-based sample-size calculation. No paper specifically targets test-prep prediction with N<200, but the prediction-model literature is the right body to lean on.**

Most relevant 2018-2025 guidance:

- Riley, R. D., et al. (2019). "Minimum sample size for developing a multivariable prediction model: PART II - binary and time-to-event outcomes," *Statistics in Medicine*. https://pmc.ncbi.nlm.nih.gov/articles/PMC6519266/ (accessed 2026-05-07). Open access. Proposes a three-criterion framework (shrinkage >= 0.9, R^2 difference <= 0.05, precise overall risk). Replace blanket EPP with this.
- TRIPOD+AI (2024 update): https://www.equator-network.org/reporting-guidelines/tripod-statement/ (accessed 2026-05-07). Reporting standard for prediction models including small-N cases.
- van Smeden et al. (2018) "Sample size for binary logistic prediction models: Beyond events per variable criteria," *Statistical Methods in Medical Research*. Cited at https://pmc.ncbi.nlm.nih.gov/articles/PMC6710621/ (accessed 2026-05-07). Argues EPV alone is unreliable.
- Penalization and shrinkage performance for small N (2020): https://www.sciencedirect.com/science/article/pii/S0895435620312099 (accessed 2026-05-07). Important caveat: shrinkage methods can fail in individual small-N datasets even when they help on average.
- 2025 European Journal of Cardio-Thoracic Surgery primer (general but recent): https://academic.oup.com/ejcts/article/67/5/ezaf142/8120086 (accessed 2026-05-07).

---

## Claim 8. Range-restriction bias: students who report DAT scores skew high-performing -> slope toward 1.0, intercept toward mean. Sackett & Yang (2000)

**Verdict: CONFIRMED that Sackett & Yang (2000) exists exactly as cited (with corrected journal). Mechanism description is also CONFIRMED.**

- Citation: Sackett, P. R., & Yang, H. (2000). Correction for range restriction: An expanded typology. *Journal of Applied Psychology*, 85(1), 112-118. DOI: 10.1037/0021-9010.85.1.112. Note: published in *Journal of Applied Psychology*, NOT *Personnel Psychology* as stated in the original claim.
  - PubMed: https://pubmed.ncbi.nlm.nih.gov/10740961/ (accessed 2026-05-07; bibliographic confirmation).
  - APA PsycNet: https://psycnet.apa.org/record/2000-03754-011 (accessed 2026-05-07).
  - University of Minnesota Experts: https://experts.umn.edu/en/publications/correction-for-range-restriction-an-expanded-typology (accessed 2026-05-07).
- The mechanism (selection on the predictor attenuates observed correlation; correcting unattenuates) is the central topic of this paper. The specific phrasing "slope biases toward 1.0, intercept toward the mean" is the standard regression-attenuation result and is consistent with Sackett & Yang's typology, though the paper frames it in terms of correlation correction rather than slope/intercept directly.
- Useful follow-up that targets a selection-on-self-report scenario closer to ours: Yang, Sackett, & Nho (2004), https://journals.sagepub.com/doi/10.1177/1094428104269054 (accessed 2026-05-07).
- Most current synthesis: Sackett et al. revisiting validity of selection predictors (2023), https://www.cambridge.org/core/journals/industrial-and-organizational-psychology/article/revisiting-the-design-of-selection-systems-in-light-of-new-findings-regarding-the-validity-of-widely-used-predictors/A20984B138319E3D432E643978BF026D (accessed 2026-05-07).

---

## Summary verdict table

| # | Claim | Verdict |
|---|---|---|
| 1 | Kolen & Brennan: 400 / 1500 / 3000 | PARTIAL: 400 + 1500 are the conventional Kolen-Brennan thresholds (per secondary lit); 3000 for IRT is NOT directly attributable to them. |
| 2 | Holland & Dorans (2006) chapter exists, addresses prediction vs. equating | CONFIRMED on existence and prediction-vs-equating distinction; small-sample-prediction specifics not page-verified (paywalled). |
| 3 | Harrell 10-20 EPP rule | CONFIRMED (Harrell's own number is "at least 15"; 10-20 is the paraphrased band). |
| 4 | Major prep companies publish methodology | UWorld and Magoosh disclose lightly; Kaplan, Princeton Review do not. AAMC discloses verbally but not technically. |
| 5 | AAMC MCAT IRT equating | CONFIRMED by historical Hendrickson & Kolen (1999) AAMC monograph; current public pages do not state IRT explicitly. |
| 6 | NBME publishes technical equating reports | NO standalone technical manual; only score-interpretation guides and peer-reviewed papers. |
| 7 | 2022-2025 small-N prediction guidance | CONFIRMED (Riley et al. 2019, TRIPOD+AI 2024, van Smeden 2018). Move from blanket EPP to criterion-based. |
| 8 | Sackett & Yang 2000 range-restriction | CONFIRMED, with journal correction (*Journal of Applied Psychology*, not *Personnel Psychology*). |

---

## Single most useful resource for our N=80 cutover

**Livingston, S. A., & Kim, S. (2009). The Circle-Arc Method for Equating in Small Samples. *Journal of Educational Measurement*, 46(3), 330-343.** https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1745-3984.2009.00084.x (paywalled). Open ETS Research Report version: https://files.eric.ed.gov/fulltext/EJ1111225.pdf (accessed 2026-05-07).

Reasoning: at N=80 we are in the small-sample regime where Kolen & Brennan's 400/1500 minimums are violated and where Riley et al.'s prediction-model machinery is borderline applicable. Circle-arc is the only equating method specifically designed for this N range, validated against mean and linear equating in the small-sample literature, and pre-builds the constraint that the equating curve passes through fixed endpoints (which prevents wild extrapolation - exactly the failure mode at small N).

Backup resource: Riley et al. (2019), https://pmc.ncbi.nlm.nih.gov/articles/PMC6519266/ - if we treat this as a *prediction* problem rather than an *equating* problem (which Holland & Dorans 2006 would argue we should at N=80), use Riley's three-criterion sample-size logic to bound how many predictors we can responsibly fit.

---

## Methodology notes

- All URLs were retrieved 2026-05-07 via Claude Code's WebSearch and WebFetch tools.
- Several PDFs returned binary-only content via WebFetch (the Kolen & Brennan textbook, the Harrell textbook, the AAMC Validity Data Report, the FSMB USMLE Annual Report). Where this prevented page-level quoting, the verdict notes UNVERIFIABLE for that specific sub-claim. The URLs themselves are confirmed live.
- No DOIs in this document are fabricated. The Sackett & Yang DOI was confirmed via PubMed.
- Where bibliographic detail differs from the original claim (e.g., journal name for Sackett & Yang), I corrected it explicitly rather than papering over the discrepancy.
