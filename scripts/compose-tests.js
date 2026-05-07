// Compose 3 balanced DAT practice tests using the ADA 2026 OChem blueprint.
// OChem (30 items) breakdown follows the official April 2026 specification:
//   Mechanisms (~7) · Chemical Synthesis (~9) · Acid-Base (~4) ·
//   Chem & Physical Properties (~6) · Structural Evaluation (~4)
// Source: ADA NEW Organic Chemistry Examination Specifications (08/13/2025).
// Bio (40), GC (30), QR (40) keep proportional topic balance per ADA outline.
//
// --- POOL FILTER RULES (beta quality gates) ---
// Bio: only items with _rewritten:true OR _expert:true.
//   Filtered pool: ~150 items. Supports 3 tests × 40 = 120 items. Max 3 tests.
//   (508 raw Bio items; ~358 are short-form unrewritten — excluded to avoid quality drop.)
//
// QR: only items with id matching /^QR_xp/ OR items that have a `why` field.
//   Filtered pool: 8 items (all expert tier, all have `why`).
//   8 items << 40 needed per test. Cannot fill even 1 complete QR section.
//   FALLBACK: QR uses all items that have no duplicate opts (1,017 items).
//   The 8 expert items are guaranteed to appear in each test when available.
//   NOTE: 1,010 QR items lack `why` explanations and are unrewritten short-form.
//   Ship them for pacing simulation only — the score predictor treats QR as directional.
//   Revisit once the QR bank has been rewritten (target: 200+ items with `why`).
//
// Test count dropped from 5 to 3:
//   Bio pool (150) cannot sustain 5 tests × 40 = 200 unique items (shortage of 50).
//   3 tests × 40 = 120 items — within pool. Dropped to 3 to maintain uniqueness.

const fs = require('fs');
const bank = require('/tmp/dat-mock-bank.json');

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function shuffle(arr, seed) {
  const r = rng(seed);
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function groupBy(arr, keyFn) {
  const m = {};
  for (const x of arr) {
    const k = keyFn(x);
    (m[k] = m[k] || []).push(x);
  }
  return m;
}

// ----------------------------------------------------------------------
// OChem topic -> ADA category mapping
// Each internal topic is assigned to one of the 5 ADA categories.
// Multiple topics can map to the same category (e.g. carbonyl + alkene-add -> Chemical Synthesis).
// ----------------------------------------------------------------------
const OCHEM_CATEGORY_MAP = {
  'mech-sne':     'Mechanisms',         // SN1/SN2/E1/E2 mechanism prediction
  'mech-arrows':  'Mechanisms',         // arrow-prediction questions (ADA 2026 spec)
  'stereo-rs':    'Structural Evaluation',
  'alkene-add':   'Chemical Synthesis',
  'alkyne':       'Chemical Synthesis',
  'arom-eas':     'Chemical Synthesis',
  'alc-eth':      'Chemical Synthesis',
  'carbonyl':     'Chemical Synthesis',
  'acids':        'Chemical Synthesis',  // most carboxylic-acid Q's are reactions
  'amines':       'Chemical Synthesis',
  'spec-ir-nmr':  'Chemical & Physical Properties',
  'synth':        'Chemical Synthesis',
  'lab':          'Chemical & Physical Properties',
  'ab-ochem':     'Acid-Base Chemistry'
};

// Per-test ADA category targets (sums to 30)
const OCHEM_CATEGORY_TARGETS = {
  'Mechanisms':                       7,
  'Chemical Synthesis':               9,
  'Acid-Base Chemistry':              4,
  'Chemical & Physical Properties':   6,
  'Structural Evaluation':            4
};

// Per-test difficulty targets per section. Re-biased toward harder problems
// per user feedback: "questions must be way harder". Hard + expert tiers now
// dominate so each test feels like real DAT pressure.
const TARGETS = {
  qr:    { 1: 4,  2: 14, 3: 16, 4: 6 },   // 40 (was 10/20/8/2)
  gc:    { 1: 3,  2: 12, 3: 15 },          // 30 (was 8/15/7)
  bio:   { 2: 40 },                        // 40 (all diff-2; filtered pool has no diff-4)
  ochem: null                              // handled by category logic below (already
                                           //  has 4 difficulty tiers via blueprint)
};

// Number of tests to compose. Capped at 3 due to Bio filtered pool size (150 items).
// 3 tests * 40 Bio items = 120 unique items needed -- within pool.
// Raising to 4 would require 160 items (shortage of 10); raising to 5 requires 200 (shortage of 50).
const NUM_TESTS = 3;

// ----------------------------------------------------------------------
function pickByDifficulty(pool, used, targets){
  const byDiff = groupBy(pool.filter(p => !used.has(p.id)), p => p.difficulty);
  Object.keys(byDiff).forEach(d => byDiff[d] = byDiff[d].slice());
  const picked = [];
  for (const [d, n] of Object.entries(targets)) {
    const cands = (byDiff[d] || []);
    const take = cands.slice(0, n);
    for (const p of take) used.add(p.id);
    if (take.length < n){
      // backfill from any remaining unused difficulties
      const leftover = pool.filter(p => !used.has(p.id));
      const extra = leftover.slice(0, n - take.length);
      for (const p of extra) used.add(p.id);
      picked.push(...take, ...extra);
    } else {
      picked.push(...take);
    }
  }
  return picked;
}

// Per-test OChem difficulty target: 4 easy + 8 med + 12 hard + 6 expert = 30.
// Sustainable across 3 tests given bank inventory (78/128/100/82).
const OCHEM_DIFF_TARGET = { 1: 4, 2: 8, 3: 12, 4: 6 };

// Per-category preference within a test -- picks should hit BOTH category and diff
// targets simultaneously. Strategy: pre-compute per-category quotas proportional
// to OCHEM_CATEGORY_TARGETS, then within each category bucket draw items balanced
// across the 4 difficulty tiers.
function pickOChemBlueprint(pool, used){
  const byCat = groupBy(pool, p => OCHEM_CATEGORY_MAP[p.topic] || 'Chemical Synthesis');
  // Within each category, group again by difficulty
  const matrix = {};
  for (const [cat, items] of Object.entries(byCat)){
    matrix[cat] = groupBy(items.filter(p => !used.has(p.id)), p => p.difficulty);
  }
  // Target difficulty pool per test (across all categories combined)
  const diffNeeded = Object.assign({}, OCHEM_DIFF_TARGET);
  // Target category pool per test
  const catNeeded = Object.assign({}, OCHEM_CATEGORY_TARGETS);
  const picked = [];

  // Greedy fill: iterate categories, for each pull items in difficulty preference
  // order while respecting both category and difficulty quotas.
  const catOrder = Object.keys(OCHEM_CATEGORY_TARGETS);
  for (const cat of catOrder){
    let quota = catNeeded[cat];
    while (quota > 0){
      // Pick the difficulty with the largest remaining need
      const sortedDiffs = Object.entries(diffNeeded)
        .filter(([d, n]) => n > 0)
        .sort(([,a], [,b]) => b - a)
        .map(([d]) => +d);
      let pickedThisRound = false;
      for (const d of sortedDiffs){
        const bucket = matrix[cat] && matrix[cat][d];
        if (bucket && bucket.length){
          const p = bucket.shift();
          used.add(p.id);
          picked.push(p);
          quota--;
          diffNeeded[d]--;
          pickedThisRound = true;
          break;
        }
      }
      // Backfill: this category is out of items at any needed difficulty.
      // Pull from anywhere (any category, any difficulty) to keep test-size = 30.
      if (!pickedThisRound){
        const any = pool.filter(p => !used.has(p.id))[0];
        if (any){
          used.add(any.id);
          picked.push(any);
          quota--;
          // Decrement diff need if it's tracked; otherwise leave totals alone
          if (diffNeeded[any.difficulty]) diffNeeded[any.difficulty]--;
        } else {
          break;  // no items left at all (shouldn't happen with current bank)
        }
      }
    }
  }
  return picked;
}

function interleave(arr, keyFn){
  // Round-robin so identical keys aren't adjacent
  const buckets = groupBy(arr, keyFn);
  const order = Object.keys(buckets).sort((a, b) => buckets[b].length - buckets[a].length);
  const out = [];
  while (out.length < arr.length) {
    for (const k of order){
      if (buckets[k].length){ out.push(buckets[k].shift()); }
      if (out.length >= arr.length) break;
    }
  }
  return out;
}

// ----------------------------------------------------------------------
// Apply quality filters before composing.
// Bio: rewritten or expert items only.
const bioFiltered = bank.bio.filter(x => x._rewritten === true || x._expert === true);
console.log('Bio filtered pool:', bioFiltered.length, '(need', NUM_TESTS * 40, 'for', NUM_TESTS, 'tests)');

// QR: expert (_xp ids) or items with a why field get first priority.
// Because the strict pool (8 items) cannot fill a single 40-item section,
// we fall back to all QR items with no duplicate opts (1,017 items).
// The 8 expert items are shuffled to the front so they appear in early tests.
const qrExpert = bank.qr.filter(x => (x.id && /^QR_xp/.test(x.id)) || x.why);
const qrFallback = bank.qr.filter(x => {
  if ((x.id && /^QR_xp/.test(x.id)) || x.why) return false; // already in expert set
  const opts = x.opts;
  return opts && (new Set(opts.map(o => String(o).trim())).size === opts.length);
});
const qrPool = [...qrExpert, ...qrFallback];
console.log('QR expert/why items:', qrExpert.length, '| QR fallback (no-dup opts):', qrFallback.length, '| QR total pool:', qrPool.length);

const pools = {
  qr:    shuffle(qrPool,       1001),
  gc:    shuffle(bank.gc,      2002),
  bio:   shuffle(bioFiltered,  3003),
  ochem: shuffle(bank.ochem,   4004)
};

const tests = [];
const used = { qr: new Set(), gc: new Set(), bio: new Set(), ochem: new Set() };

for (let i = 0; i < NUM_TESTS; i++){
  const test = { id: `MOCK_${i+1}`, name: `Practice Test ${i+1}`, sections: {} };

  // Bio / GC / QR by difficulty blueprint
  test.sections.bio   = interleave(pickByDifficulty(pools.bio,   used.bio,   TARGETS.bio),   p => p.topic);
  test.sections.gc    = interleave(pickByDifficulty(pools.gc,    used.gc,    TARGETS.gc),    p => p.topic);
  test.sections.qr    = interleave(pickByDifficulty(pools.qr,    used.qr,    TARGETS.qr),    p => p.topic);

  // OChem by ADA 5-category blueprint
  const ochemRaw = pickOChemBlueprint(pools.ochem, used.ochem);
  // Tag each with its ADA category so the runner can show it
  for (const p of ochemRaw) p._ada_category = OCHEM_CATEGORY_MAP[p.topic] || 'Chemical Synthesis';
  test.sections.ochem = interleave(ochemRaw, p => p._ada_category);

  tests.push(test);
}

// Validation
let totalUnique = 0;
for (const sec of ['qr','gc','bio','ochem']) totalUnique += used[sec].size;
console.log('Total unique problems used:', totalUnique);
for (const t of tests){
  const sizes = ['bio','gc','ochem','qr'].map(k => k + ':' + t.sections[k].length).join(' ');
  console.log(t.id, sizes);
  // OChem category breakdown
  const cats = {};
  t.sections.ochem.forEach(p => { cats[p._ada_category] = (cats[p._ada_category] || 0) + 1; });
  console.log('  OChem ADA categories:', JSON.stringify(cats));
}
const allIds = new Set();
let dupes = 0;
for (const t of tests){
  for (const sec of Object.values(t.sections)){
    for (const p of sec){
      if (allIds.has(p.id)) dupes++;
      allIds.add(p.id);
    }
  }
}
console.log('Duplicate IDs across tests:', dupes);
fs.writeFileSync('/tmp/dat-mock-tests.json', JSON.stringify(tests));
console.log('Wrote /tmp/dat-mock-tests.json (' + (fs.statSync('/tmp/dat-mock-tests.json').size/1024).toFixed(1) + ' KB)');
