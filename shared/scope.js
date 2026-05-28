/* =====================================================================
   Ace Labs · canonical scope + counts registry
   ---------------------------------------------------------------------
   Single source of truth for cross-engine product claims:

   - Which DAT sections Ace Labs covers (Bio, GC, OChem, QR)
   - Which sections it does NOT cover (PAT, Reading Comprehension)
   - The mock count (3 fixed Prometric-style practice tests)
   - Per-engine bank counts as displayed on home + tile copy
   - Standard disclaimer text constants
   - Last-verified date

   Used by:
     ace-labs.html       — home hero, tile copy, mock CTA, scope strip
     mocks-catalog.html  — mock count badge, bank caps, disclaimer
     prometric-mock.html — intro disclaimer, instructions screen
     scope.html          — full scope/evidence page renderer
     scripts/validate-scope.js — fails CI when HTML drifts from these claims

   IMPORTANT — keep this file load-order safe. It defines exactly one
   global, ACE_SCOPE, with no DOM access. Safe to load on every page.
   ===================================================================== */
(function (root) {
  'use strict';

  /* ---- Last verified ----------------------------------------------- */
  var LAST_VERIFIED = '2026-05-27';

  /* ---- Sections ---------------------------------------------------- */
  // Real DAT (per ADA Candidate Guide): Survey of Natural Sciences,
  // PAT, optional break, Reading Comprehension, Quantitative Reasoning.
  // Ace Labs ships banks for Sciences (Bio + GC + OChem) + QR only.
  var COVERED = [
    { key:'bio',   name:'Biology',           shortName:'Bio',
      bankCount: 158, bankLabel:'expert + rewritten pool',
      route:'tools/bio/index.html' },
    { key:'gc',    name:'General Chemistry', shortName:'Gen Chem',
      bankCount: 605, bankLabel:'engine bank',
      route:'tools/gc/index.html' },
    { key:'ochem', name:'Organic Chemistry', shortName:'OChem',
      bankCount: 388, bankLabel:'engine bank',
      route:'tools/ochem/index.html' },
    { key:'qr',    name:'Quantitative Reasoning', shortName:'QR',
      bankCount: 767, bankLabel:'engine bank',
      route:'tools/qr/index.html' }
  ];

  var NOT_COVERED = [
    { key:'pat', name:'Perceptual Ability Test',  shortName:'PAT',
      reason:'image bank not yet shipped' },
    { key:'rc',  name:'Reading Comprehension',    shortName:'RC',
      reason:'passage bank not yet shipped' }
  ];

  /* ---- Mocks ------------------------------------------------------- */
  // 3 fixed Prometric-style practice tests. Each test draws 140 unique
  // problems with zero overlap → 420 unique problems across all 3.
  // Sciences (40 Bio + 30 GC + 30 OChem · 90 min) + QR (40 Q · 45 min).
  // Total seat time per test: 135 min (no break in Ace Labs version,
  // since PAT/RC are not present and the real DAT break is between
  // PAT and RC, not between Sciences and QR).
  var MOCKS = {
    count: 3,
    questionsPerTest: 140,
    minutesPerTest: 135,
    uniqueQuestionsTotal: 420,
    sectionMix: 'Sciences (40 Bio + 30 GC + 30 OChem · 90 min) followed by QR (40 Q · 45 min)',
    breakNote: 'Ace Labs does not include the official DAT 30-minute break, since the real-DAT break sits between PAT and RC and Ace Labs does not ship those sections.'
  };

  /* ---- Diagnostic -------------------------------------------------- */
  // Cross-section diagnostic. NOTE: today the diagnostic is a 60-Q /
  // 45-min test. The audit-prescribed 15-min diagnostic is a future
  // feature; do not claim it here until it ships.
  var DIAGNOSTIC = {
    questions: 60,
    minutes: 45,
    sections: ['bio', 'gc', 'ochem', 'qr']
  };

  /* ---- Score language --------------------------------------------- */
  // ADA scaled score (200-600) replaced the legacy 1-30 scale on
  // 2025-03-01. Practice estimates in Ace Labs are NOT psychometrically
  // equated; they are directional pacing-and-accuracy reads only.
  var SCORE = {
    scaleMin: 200,
    scaleMax: 600,
    scaleEffective: '2025-03-01',
    legacyScale: '1-30 (retired 2025-02-28)',
    estimateNote: 'Practice estimates are directional only — not psychometrically equated, not an ADA score report.'
  };

  /* ---- Disclaimers ------------------------------------------------- */
  var DISCLAIMERS = {
    notAffiliated:
      'Ace Labs is not affiliated with the American Dental Association (ADA) or Prometric.',
    repairTool:
      'Ace Labs is a supplemental Bio, Gen Chem, OChem, and QR repair tool. Keep using your main DAT prep source.',
    noPatRc:
      'Ace Labs does not include PAT (Perceptual Ability Test) or Reading Comprehension prep.',
    practiceEstimate:
      'Scores shown in Ace Labs are unofficial practice estimates, not ADA score reports.',
    noReviewerCredentials:
      'Reviewer credentials: not yet published. Content is authored by AceTheDAT and revised against the current ADA outline.'
  };

  /* ---- Standard copy phrases (use these instead of stale ones) ---- */
  var COPY = {
    // Replaces "full simulation" / "mirrors the actual"
    practiceTestPhrase:        'covered-section practice test',
    // Replaces "Prometric mock" when the surrounding language is loose
    practiceTestPhraseFormal:  'Prometric-style practice test for the covered sections',
    // Replaces "score predictor" / "predicted DAT score"
    estimatePhrase:            'practice estimate',
    // Replaces "calibrated mocks" / "DAT-ready"
    mockLabel:                 'covered-section practice tests',
    // Replaces "academic average"
    academicProxyPhrase:       'covered-section accuracy proxy (not the official Academic Average)'
  };

  /* ---- Stale phrases the validator scans for ---------------------- */
  // The validator counts occurrences of these in user-facing HTML and
  // fails CI when any appear above-threshold. Keep this list in sync
  // with the audit acceptance criteria.
  //
  // Phrases here are written in their PROBLEMATIC form (a positive claim).
  // The validator pre-strips HTML/JS comments and ALSO checks a small
  // negation window before each match — phrases preceded by "not the
  // official", "not a", "is not", or "n't" within ~30 chars are allowed.
  // So "Academic Average" still triggers, but "not the official Academic
  // Average" does not.
  var STALE_PHRASES = [
    '5 fixed tests',
    'full simulation',
    'mirrors actual',
    'mirrors the actual',
    'Academic Average',
    'DAT-ready',
    'DAT ready',
    'calibrated mocks',
    'every DAT-tested',
    'score predictor',
    'predicts your score',
    'predicted DAT score'
  ];

  // Negation window patterns. Match within ~30 chars BEFORE a phrase to
  // mark it as allowed (a negation/disclaimer rather than a positive claim).
  var NEGATION_PATTERNS = [
    /\bnot\s+the\s+official\b\s*$/i,
    /\bnot\s+a\b\s*$/i,
    /\bnot\s+an\b\s*$/i,
    /\bis\s+not\b\s*$/i,
    /\bare\s+not\b\s*$/i,
    /\bisn'?t\b\s*$/i,
    /\baren'?t\b\s*$/i,
    /\bno\b\s*$/i,
    /\b(?:replaces|retired)\s+the\s+legacy\b\s*$/i
  ];
  // Some phrases are allowed in research/spec docs but never on
  // user-facing pages. Keep this list of allowed paths in sync with
  // the validator. Anything else triggers an error.
  var STALE_PHRASE_ALLOWED_PATHS = [
    'specs/',
    'tools/gc/research/',
    'tools/gc/QBANK_AUDIT.md',
    'tools/gc/MOCK_CALIBRATION_PLAN.md',
    'tools/gc/FSRS_PORT_SPEC.md',
    'tools/gc/MISCONCEPTION_TAXONOMY_SPEC.md',
    'tools/gc/RECOGNITION_LAB_V2_SPEC.md',
    'tools/gc/UX_BETA_LAUNCH_SPEC.md',
    'ACELABS_RECOMMENDED_STACK.md',
    'ACELABS_COACH_GUIDE.md',
    'ACELABS_STUDENT_FAQ.md',
    'ANXIETY_AWARE_DESIGN.md',
    'README.md'
  ];

  /* ---- User-facing HTML files the validator checks ---------------- */
  var USER_FACING_HTML = [
    'ace-labs.html',
    'onboarding.html',
    'mocks-catalog.html',
    'prometric-mock.html',
    'diagnostic.html',
    'calendar.html',
    'cheat-sheets.html',
    'test-day-readiness.html',
    'test-week.html',
    'for-retakers.html',
    'unified-mock.html',
    'scope.html'
  ];

  /* ---- Helpers ----------------------------------------------------- */
  function coveredKeys()      { return COVERED.map(function(s){ return s.key; }); }
  function notCoveredKeys()   { return NOT_COVERED.map(function(s){ return s.key; }); }
  function coveredNames()     { return COVERED.map(function(s){ return s.shortName; }); }
  function notCoveredNames()  { return NOT_COVERED.map(function(s){ return s.shortName; }); }
  function bankCount(key) {
    var s = COVERED.filter(function(x){ return x.key === key; })[0];
    return s ? s.bankCount : null;
  }
  function mockCountClaim() {
    return MOCKS.count + ' fixed Prometric-style practice tests';
  }

  // Render the standard scope strip as inline HTML. Pages can drop this
  // anywhere a scope reminder belongs (typically directly under hero).
  function scopeStripHTML() {
    var covered = COVERED.map(function(s){ return s.shortName; }).join(' · ');
    var notCov  = NOT_COVERED.map(function(s){ return s.shortName; }).join(' / ');
    return [
      '<div class="al-scope-strip" role="note" aria-label="Scope">',
      '  <span class="al-scope-label">Covered</span>',
      '  <span class="al-scope-value">' + covered + '</span>',
      '  <span class="al-scope-sep" aria-hidden="true">·</span>',
      '  <span class="al-scope-label al-scope-label-warn">Not covered</span>',
      '  <span class="al-scope-value al-scope-value-warn">' + notCov + '</span>',
      '  <span class="al-scope-sep" aria-hidden="true">·</span>',
      '  <span class="al-scope-meta">Supplemental repair tool · not affiliated with ADA or Prometric</span>',
      '  <a class="al-scope-link" href="scope.html">Full scope</a>',
      '</div>'
    ].join('\n');
  }

  // Render the standard footer disclaimer block.
  function disclaimerHTML() {
    return [
      '<div class="al-disclaimer" role="note">',
      '  <p><b>Honest scope.</b> ' + DISCLAIMERS.repairTool + ' ' + DISCLAIMERS.noPatRc + '</p>',
      '  <p>' + DISCLAIMERS.practiceEstimate + ' ' + DISCLAIMERS.notAffiliated + '</p>',
      '  <p class="al-disclaimer-meta">Last verified ' + LAST_VERIFIED + ' &middot; <a href="scope.html">Scope &amp; evidence</a></p>',
      '</div>'
    ].join('\n');
  }

  /* ---- Export ------------------------------------------------------ */
  var scope = {
    LAST_VERIFIED: LAST_VERIFIED,
    COVERED: COVERED,
    NOT_COVERED: NOT_COVERED,
    MOCKS: MOCKS,
    DIAGNOSTIC: DIAGNOSTIC,
    SCORE: SCORE,
    DISCLAIMERS: DISCLAIMERS,
    COPY: COPY,
    STALE_PHRASES: STALE_PHRASES,
    NEGATION_PATTERNS: NEGATION_PATTERNS,
    STALE_PHRASE_ALLOWED_PATHS: STALE_PHRASE_ALLOWED_PATHS,
    USER_FACING_HTML: USER_FACING_HTML,
    coveredKeys: coveredKeys,
    notCoveredKeys: notCoveredKeys,
    coveredNames: coveredNames,
    notCoveredNames: notCoveredNames,
    bankCount: bankCount,
    mockCountClaim: mockCountClaim,
    scopeStripHTML: scopeStripHTML,
    disclaimerHTML: disclaimerHTML
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = scope;
  root.ACE_SCOPE = scope;

})(typeof window !== 'undefined' ? window : globalThis);
