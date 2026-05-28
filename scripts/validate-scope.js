#!/usr/bin/env node
/* =====================================================================
   Ace Labs · scope/canonical-counts validation
   ---------------------------------------------------------------------
   Fails the npm script with a non-zero exit code when:

   - A user-facing HTML page contains a stale phrase from scope.js
     (e.g. "5 fixed tests", "full simulation", "score predictor", ...)
   - The mock count claim drifts between scope.js and any HTML page
     that hard-codes a number near "fixed tests" or "fixed tests"
   - Home (ace-labs.html) is missing the scope strip + disclaimer
     placeholders that shared/scope.js renders into
   - mocks-catalog.html or prometric-mock.html is missing the scope
     strip placeholder
   - scope.html does not exist

   Run via: npm run validate:scope
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT  = path.resolve(__dirname, '..');
const SCOPE = require(path.join(ROOT, 'shared', 'scope.js'));

const errors   = [];
const warnings = [];
const err  = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const readText = (p) => {
  try { return fs.readFileSync(p, 'utf8'); }
  catch (e) { err('Cannot read ' + p + ': ' + e.message); return ''; }
};

/* ---- 1. scope.html exists ---------------------------------------- */
if (!fs.existsSync(path.join(ROOT, 'scope.html'))) {
  err('scope.html missing — required by scope-strip and disclaimer links');
}

/* ---- 2. shared/scope.js loads cleanly + has expected shape ------- */
['LAST_VERIFIED','COVERED','NOT_COVERED','MOCKS','DIAGNOSTIC',
 'SCORE','DISCLAIMERS','COPY','STALE_PHRASES','USER_FACING_HTML']
  .forEach((k) => {
    if (!(k in SCOPE)) err('scope.js missing required export: ' + k);
  });

/* ---- 3. Stale-phrase scan in user-facing HTML -------------------- */
// scope.js itself contains the phrase list as string literals — exclude it.
// Also exclude the validator script. Honor STALE_PHRASE_ALLOWED_PATHS.
function isAllowed(filePath) {
  const rel = path.relative(ROOT, filePath);
  return SCOPE.STALE_PHRASE_ALLOWED_PATHS.some((p) => rel.startsWith(p) || rel === p);
}

// Strip HTML tags from the ~30 chars before a match so negation tokens like
// "not a" can be matched even when split across spans. We keep word boundaries
// by collapsing tags to a single space.
function stripTags(s) {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function isNegated(text, idx) {
  if (!SCOPE.NEGATION_PATTERNS || !SCOPE.NEGATION_PATTERNS.length) return false;
  // Take a 60-char window before the match, strip tags, then test patterns
  // anchored at end-of-string (the $ in each pattern).
  const winStart = Math.max(0, idx - 60);
  const window = stripTags(text.slice(winStart, idx));
  return SCOPE.NEGATION_PATTERNS.some((rx) => rx.test(window));
}

SCOPE.USER_FACING_HTML.forEach((rel) => {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) {
    warn('Listed user-facing page does not exist: ' + rel);
    return;
  }
  const text = readText(p);
  const lower = text.toLowerCase();
  SCOPE.STALE_PHRASES.forEach((phrase) => {
    const needle = phrase.toLowerCase();
    // Walk every occurrence; a single page can contain the phrase multiple times
    // (some negated, some not). Each non-negated occurrence is an error.
    let idx = lower.indexOf(needle);
    while (idx !== -1) {
      if (!isNegated(text, idx)) {
        const start = Math.max(0, idx - 30);
        const end   = Math.min(text.length, idx + phrase.length + 30);
        const excerpt = text.slice(start, end).replace(/\s+/g, ' ').trim();
        err(rel + ': stale phrase "' + phrase + '" — context: …' + excerpt + '…');
      }
      idx = lower.indexOf(needle, idx + needle.length);
    }
  });
});

/* ---- 4. Mock count claim consistency ----------------------------- */
// Scan each user-facing HTML for a number directly preceding "fixed tests"
// or "Prometric" + count claims. Anything that disagrees with scope.MOCKS.count
// is an error.
const claimedMockCounts = {};
SCOPE.USER_FACING_HTML.forEach((rel) => {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return;
  const text = readText(p);
  // Patterns like "3 fixed tests", "5 fixed tests", "3 practice tests"
  const pats = [
    /(\d+)\s*fixed\s+tests/gi,
    /(\d+)\s*Prometric\s+tests/gi,
    /(\d+)\s*practice\s+tests/gi
  ];
  pats.forEach((rx) => {
    let m;
    while ((m = rx.exec(text)) !== null) {
      const n = parseInt(m[1], 10);
      if (!claimedMockCounts[rel]) claimedMockCounts[rel] = [];
      claimedMockCounts[rel].push({ n, ctx: m[0] });
    }
  });
});

const truth = SCOPE.MOCKS.count;
Object.keys(claimedMockCounts).forEach((rel) => {
  claimedMockCounts[rel].forEach((c) => {
    if (c.n !== truth) {
      err(rel + ': mock count claim "' + c.ctx + '" disagrees with scope.MOCKS.count (' + truth + ')');
    }
  });
});

/* ---- 5. Required scope-strip / disclaimer placeholders ----------- */
const required = [
  { file: 'ace-labs.html',       needs: ['alScopeStrip', 'alDisclaimer', 'shared/scope.js'] },
  { file: 'mocks-catalog.html',  needs: ['alScopeStrip', 'alDisclaimer', 'shared/scope.js'] },
  { file: 'prometric-mock.html', needs: ['alScopeStrip', 'shared/scope.js'] }
];
required.forEach(({ file, needs }) => {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) { err('Required file missing: ' + file); return; }
  const text = readText(p);
  needs.forEach((n) => {
    if (!text.includes(n)) {
      err(file + ': missing required scope hook "' + n + '"');
    }
  });
});

/* ---- 6. Home links to scope.html --------------------------------- */
const home = readText(path.join(ROOT, 'ace-labs.html'));
if (!/href\s*=\s*["']scope\.html["']/.test(home)) {
  err('ace-labs.html does not link to scope.html');
}

/* ---- 7. Footer disclaimer language is consistent ----------------- */
// Look for the canonical "not affiliated with the American Dental Association"
// substring on home + scope.html. Both should reference it.
['ace-labs.html', 'scope.html'].forEach((rel) => {
  const text = readText(path.join(ROOT, rel));
  if (!/American\s+Dental\s+Association/i.test(text)) {
    warn(rel + ': missing the "American Dental Association" affiliation disclaimer string');
  }
});

/* ---- Report ------------------------------------------------------ */
console.log('Ace Labs scope validation');
console.log('  pages scanned:    ' + SCOPE.USER_FACING_HTML.length);
console.log('  stale phrases:    ' + SCOPE.STALE_PHRASES.length);
console.log('  canonical mocks:  ' + truth + ' fixed tests · ' +
            SCOPE.MOCKS.questionsPerTest + ' Q · ' + SCOPE.MOCKS.minutesPerTest + ' min');
console.log('  last verified:    ' + SCOPE.LAST_VERIFIED);
console.log('');

if (warnings.length) {
  console.log('Warnings:');
  warnings.forEach((w) => console.log('  - ' + w));
  console.log('');
}

if (errors.length) {
  console.log('FAIL — ' + errors.length + ' error' + (errors.length === 1 ? '' : 's') + ':');
  errors.forEach((e) => console.log('  - ' + e));
  process.exit(1);
}

console.log('OK — scope claims consistent across all user-facing HTML.');
