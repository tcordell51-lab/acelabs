#!/usr/bin/env node
// verify-qr-arcade.mjs : answer keys of the QR arcade bank (games/qr.json), checked one by one
// before the QR drill serves them by topic (data/qr-topics.json, built by build-ace-banks.mjs).
//
//   node scripts/bank/verify-qr-arcade.mjs            write scripts/bank/qr-arcade-verified.json
//   node scripts/bank/verify-qr-arcade.mjs --check    exit 1 when that file is stale
//
// How a key is verified. The answer is worked out again from the question itself, never from
// the stored key or the stored explanation:
//   solver  the stem matches a known form (a fraction sum, a percent of a number, a slope, a
//           z-score ...) and the value is computed from the numbers in the stem
//   value   a question with its own wording: the value was worked by hand and is written in
//           MANUAL below; the script checks the keyed choice against it
//   text    the answer is an expression, an equation or a word, worked by hand: MANUAL holds the
//           exact text the right choice must have
// An item is served only when the keyed choice equals the worked answer and no other choice
// does. A rounded choice counts only to the decimals it shows. Anything else is skipped and
// listed with the reason. Ids and reasons only are written; no question text (public repo).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = 'scripts/bank/qr-arcade-verified.json';

/* Topic keys the drill gains, with the name a student sees. Keys outside the 2026 DAT outline
   (scripts/bank/scope-topics.json) and the test-strategy keys are not here. */
export const TOPIC_NAMES = {
  'frac-add': 'Adding and subtracting fractions', 'frac-mul': 'Multiplying and dividing fractions', 'frac-dec': 'Fractions and decimals',
  'pct-of': 'Percent of a number', 'pct-seq': 'Percent changes in a row', 'word-decode': 'Words into equations', 'rate-time': 'Distance, rate and time',
  'dec-arith': 'Decimal arithmetic', mental: 'Mental math', distrib: 'Distributive property', pemdas: 'Order of operations', 'neg-ineq': 'Negatives and inequalities',
  'work-rate': 'Work rates', mixture: 'Mixtures', interest: 'Simple and compound interest', units: 'Unit conversions', 'p-flip': 'Probability: coins and dice',
  'p-cond': 'Conditional probability', 'count-pc': 'Permutations and combinations', harm: 'Average speed', zscore: 'Z-scores and the normal curve',
  ds: 'Slope and data sufficiency', exps: 'Exponent rules', absval: 'Absolute value', binomials: 'Binomials and factoring', sets: 'Sets and Venn counts', 'desc-stats': 'Mean, median and mode'
};

/* ---------- arithmetic on the text of a stem ---------- */
const norm = (s) => String(s).replace(/[−–]/g, '-').replace(/\s+/g, ' ').trim();
/* A small evaluator: numbers, a/b fractions (one token, so 1/2 ÷ 1/4 is a half divided by a
   quarter), mixed numbers (4 1/2), + - × · ÷, brackets, |x|, ² ³, and 3(4 + 5) as a product. */
export function evalExpr(src) {
  const s = norm(src).replace(/²/g, '^2').replace(/³/g, '^3');
  const tok = []; let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === ' ') { i++; continue; }
    let m;
    if ((m = /^(\d+) (\d+)\/(\d+)/.exec(s.slice(i)))) { tok.push({ n: +m[1] + +m[2] / +m[3] }); i += m[0].length; continue; }
    if ((m = /^(\d+)\/(\d+)/.exec(s.slice(i)))) { tok.push({ n: +m[1] / +m[2] }); i += m[0].length; continue; }
    if ((m = /^\d+(\.\d+)?/.exec(s.slice(i)))) { tok.push({ n: +m[0] }); i += m[0].length; continue; }
    if ('+-×·*÷/()|^'.includes(c)) { tok.push({ o: c === '·' || c === '×' ? '*' : c === '÷' ? '/' : c }); i++; continue; }
    throw new Error('unreadable: ' + c);
  }
  let p = 0, bars = 0;
  const peek = () => tok[p], isO = (o) => tok[p] && tok[p].o === o;
  function atom() {
    const t = tok[p];
    if (!t) throw new Error('ended early');
    let v;
    if (t.n != null) { p++; v = t.n; }
    else if (t.o === '(') { p++; v = sum(); if (!isO(')')) throw new Error('bracket'); p++; }
    else if (t.o === '|') { p++; bars++; v = Math.abs(sum()); if (!isO('|')) throw new Error('bar'); p++; bars--; }
    else if (t.o === '-') { p++; return -power(); }
    else throw new Error('unexpected ' + t.o);
    return v;
  }
  function power() { let v = atom(); if (isO('^')) { p++; v = Math.pow(v, atom()); } return v; }
  function product() {
    let v = power();
    for (;;) {
      if (isO('*')) { p++; v *= power(); }
      else if (isO('/')) { p++; v /= power(); }
      else if (isO('(')) v *= power();                       // 3(4 + 5)
      else break;
    }
    return v;
  }
  function sum() { let v = product(); for (;;) { if (isO('+')) { p++; v += product(); } else if (isO('-')) { p++; v -= product(); } else break; } return v; }
  const v = sum();
  if (p !== tok.length || bars) throw new Error('left over');
  void peek;
  if (!isFinite(v)) throw new Error('not finite');
  return v;
}
/* A choice as a number, with the decimals it shows. Units, $, %, ~ and a leading + are dropped. */
export function choiceNumber(text) {
  let s = norm(text).replace(/^[~≈]\s*/, '').replace(/^\+/, '').replace(/[$,]/g, '');
  s = s.replace(/\s*(%|mph|km\/h|ft\/s|mi|miles|hr|lb|oz|mL|L|g|kg|cm|mm|km|m|min|sec)$/i, '').trim();
  let m;
  if ((m = /^(-?)(\d+) (\d+)\/(\d+)$/.exec(s))) return { v: (m[1] ? -1 : 1) * (+m[2] + +m[3] / +m[4]), dp: null };
  if ((m = /^(-?\d+)\/(\d+)$/.exec(s))) return { v: +m[1] / +m[2], dp: null };
  if ((m = /^-?\d+(?:\.(\d+))?$/.exec(s))) return { v: +s, dp: m[1] ? m[1].length : 0 };
  return null;
}
const EPS = 1e-9;
/* Does this choice state the value? An exact form must be exact; a decimal counts when the
   value rounds to it at the decimals shown. */
function states(choice, value) {
  const c = choiceNumber(choice); if (!c) return false;
  if (c.dp === null || c.dp === 0) return Math.abs(c.v - value) < EPS;
  return Math.abs(c.v - value) <= 0.5 * Math.pow(10, -c.dp) + EPS;
}
const C = (n, k) => { let v = 1; for (let i = 1; i <= k; i++) v = v * (n - k + i) / i; return Math.round(v); };
const P = (n, k) => { let v = 1; for (let i = 0; i < k; i++) v *= n - i; return v; };
const UNIT = { 'L>mL': 1000, 'm>cm': 100, 'min>sec': 60, 'kg>g': 1000, 'cm>mm': 10, 'km>m': 1000, 'hr>min': 60 };
const N = '(-?\\d+(?:\\.\\d+)?)';

/* ---------- solvers: [name, pattern, value from the match] ---------- */
const num = (re, fn) => (stem) => { const m = re.exec(stem); return m ? { v: fn(m.slice(1).map((x) => (x != null && /^-?\d+(\.\d+)?$/.test(x) ? +x : x))) } : null; };
const SOLVERS = [
  ['arithmetic', (stem) => { const m = /^(?:What is the value of|Mentally compute|Expand and evaluate) ([^?=a-zA-Z{]+?)(?:, rounded to the nearest hundredth)?[?.]$/.exec(stem); if (!m) return null; try { return { v: evalExpr(m[1]) }; } catch (e) { return null; } }],
  ['arithmetic', (stem) => { const m = /^([^?=a-zA-Z{]+?) = \? \([^)]*\)$/.exec(stem); if (!m) return null; try { return { v: evalExpr(m[1]) }; } catch (e) { return null; } }],
  ['fraction to decimal', num(/^(?:What is (\d+)\/(\d+) written as a decimal\?|Convert (\d+)\/(\d+) to a decimal(?: \(\d+ dp\))?\.)$/, (a) => (a[0] != null ? a[0] / a[1] : a[2] / a[3]))],
  ['percent of', num(new RegExp('^What is ' + N + '% of ' + N + '\\?$'), ([p, n]) => p * n / 100)],
  ['two percent changes', num(new RegExp('^\\$' + N + ' → ([+-])' + N + '% → ([+-])' + N + '%\\. Final\\?$'), ([n, s1, a, s2, b]) => n * (1 + (s1 === '-' ? -a : a) / 100) * (1 + (s2 === '-' ? -b : b) / 100))],
  ['half a number plus', num(new RegExp('^Half a number plus ' + N + ' equals ' + N + '\\. The number\\?$'), ([a, b]) => 2 * (b - a))],
  ['number plus multiple', num(new RegExp('^The sum of a number and ' + N + ' times the number is ' + N + '\\. Find the number\\.$'), ([k, s]) => s / (1 + k))],
  ['five less than multiple', num(new RegExp('^Five less than ' + N + ' times a number is ' + N + '\\. The number\\?$'), ([k, s]) => (s + 5) / k)],
  ['three more than twice', num(new RegExp('^Three more than twice a number is ' + N + '\\. The number\\?$'), ([s]) => (s - 3) / 2)],
  ['distance', num(new RegExp('^A car drives ' + N + ' mph for ' + N + ' hr\\. Distance\\?$'), ([s, t]) => s * t)],
  ['solve a(x + b) = c', num(new RegExp('^If ' + N + '\\(x ([+-]) ' + N + '\\) = ' + N + ', what is the value of x\\?$'), ([a, sign, b, c]) => c / a - (sign === '-' ? -b : b))],
  ['work together', num(new RegExp('^A finishes a job in ' + N + ' hr, B in ' + N + ' hr\\. Together\\?$'), ([a, b]) => a * b / (a + b))],
  ['mixture', num(new RegExp('^Mix ' + N + 'mL of ' + N + '% with ' + N + 'mL of ' + N + '%\\. Final concentration\\?$'), ([a, p, b, q]) => (a * p + b * q) / (a + b))],
  ['simple interest', num(new RegExp('^\\$' + N + ' at ' + N + '% simple for ' + N + ' years\\. Final\\?$'), ([p, r, t]) => p * (1 + r * t / 100))],
  ['compound interest', num(new RegExp('^\\$' + N + ' at ' + N + '% compound for ' + N + ' years\\. Final\\?$'), ([p, r, t]) => p * Math.pow(1 + r / 100, t))],
  ['unit conversion', (stem) => { const m = new RegExp('^' + N + ' (L|m|min|kg|cm|km|hr) in (mL|cm|sec|g|mm|m|min)\\?$').exec(stem); const f = m && UNIT[m[2] + '>' + m[3]]; return f ? { v: +m[1] * f } : null; }],
  ['coin flips', (stem) => { const m = /^(\d+) fair coin flips\. P\((heads on every flip|exactly one head|at least one head)\)\?$/.exec(stem); if (!m) return null; const n = +m[1], h = Math.pow(0.5, n); return { v: m[2] === 'heads on every flip' ? h : m[2] === 'exactly one head' ? n * h : 1 - h }; }],
  ['bayes', num(new RegExp('^Disease prevalence ' + N + '%, test sensitivity ' + N + '%, specificity ' + N + '%\\. P\\(disease \\| positive test\\)\\?$'), ([p, s, c]) => (p * s) / (p * s + (100 - p) * (100 - c)))],
  ['combinations', num(/^How many ways to choose (\d+) of (\d+) items \(no order\)\?$/, ([k, n]) => C(n, k))],
  ['permutations', num(/^How many ways to arrange (\d+) of (\d+) items in order\?$/, ([k, n]) => P(n, k))],
  ['average speed', num(new RegExp('^Driving ' + N + ' mi at ' + N + ' mph then ' + N + ' mi at ' + N + ' mph\\. Average speed\\?$'), ([d1, v1, d2, v2]) => (d1 + d2) / (d1 / v1 + d2 / v2))],
  ['z-score', num(new RegExp('^μ = ' + N + ', σ = ' + N + ', x = ' + N + '\\. z\\?$'), ([m, s, x]) => (x - m) / s)],
  ['slope', num(new RegExp('^Slope from \\(' + N + ',' + N + '\\) to \\(' + N + ',' + N + '\\)\\?$'), ([x1, y1, x2, y2]) => (y2 - y1) / (x2 - x1))],
  ['exponent rule', num(new RegExp('^Which of the following is equivalent to ' + N + '\\^' + N + ' ([×÷]) ' + N + '\\^' + N + '(?:, rounded to the nearest hundredth)?\\?$'), ([a, m, op, b, n]) => (op === '×' ? Math.pow(a, m) * Math.pow(b, n) : Math.pow(a, m) / Math.pow(b, n)))],
  /* -ax < b  ->  x > -b/a : the choice must carry the right sign and the right number */
  ['negative inequality', (stem) => { const m = new RegExp('^Which of the following gives every value of x that satisfies -' + N + 'x < ' + N + '\\?$').exec(stem); if (!m) return null; const v = -(+m[2]) / +m[1];
    return { test: (choice) => { const c = /^x (<|>|=) (-?\d+(?:\.\d+)?)$/.exec(norm(choice)); return !!c && c[1] === '>' && states(c[2], v); } }; }]
];

/* ---------- worked by hand: id -> a value (v) or the exact text of the right choice (t) ---------- */
const MANUAL = {
  // fractions
  QR_fd6: { v: 5 / 8 }, QR_fd7: { t: '3/5' }, QR_pom5: { v: 0.12 * 250 }, QR_fm1: { v: 8 / 15 }, QR_fmm4: { v: 2 / (1 / 4) },
  // percent changes in a row
  QR_ps1: { v: 100 * 1.2 * 0.8 }, QR_ps2: { v: (1.1 * 1.1 - 1) * 100 }, QR_ps3: { v: 100 * 1.5 * 0.5 }, QR_ps4: { v: (0.7 * 1.3 - 1) * 100 },
  QR_psm2: { v: (1.3 * 0.9 - 1) * 100 }, QR_psm3: { v: 500 * 0.6 * 1.4 }, QR_psm4: { t: '0% (back to original)' }, QR_psm5: { v: 100 * 1.5 * 1.5 * 1.5 },
  // words into equations
  QR_wd1: { t: '2m + 3' }, QR_wd2: { t: 'n/2 − 5' }, QR_wd3: { t: '4(n+2)=24' }, QR_wd4: { t: '3n − 5 = 22' }, QR_wd5: { v: (47 - 1) / 2 },
  QR_wdm1: { t: 'x/2 + 6' }, QR_wdm2: { t: '2n − 3 = 17' }, QR_wdm3: { v: 54 / 3 - 2 }, QR_wdm4: { v: 27 * 2 / 3 }, QR_wdm5: { v: 50 * 4 / 5 },
  // distance, rate and time
  QR_rt1: { v: 60 * 2.5 }, QR_rt2: { v: 240 / 3 }, QR_rt3: { v: 200 / (50 + 30) }, QR_rt4: { v: 540 / 1.5 }, QR_rt5: { v: (60 * 2 + 40 * 3) / 5 },
  QR_rtm1: { v: 240 / 4 }, QR_rtm2: { v: 8 * 45 / 60 }, QR_rtm3: { t: '2.5 hr after B left' }, QR_rtm4: { v: 15 + 3 }, QR_rtm5: { v: 400 / 200 + 300 / 100 },
  // distributive property, order of operations, negatives
  QR_dst1: { t: '3x + 12' }, QR_dst2: { t: '−2x + 10' }, QR_dst3: { t: '4x + 3' }, QR_dst4: { t: 'x + 11' },
  QR_ni2: { t: 'x > −3' },
  // work, mixtures, interest
  QR_wr1: { v: 4 * 6 / (4 + 6) }, QR_wr2: { v: 1 / 3 + 1 / 5 }, QR_wr3: { v: 1 / (1 / 6 - 1 / 9) },
  QR_mx1: { v: (40 * 25 + 60 * 75) / 100 }, QR_mx2: { v: 50 * 0.3 / 0.2 - 50 }, QR_mx3: { v: (4 * 4 - 4 * 3) / (5 - 4) },
  QR_in1: { v: 1000 * (1 + 0.05 * 3) }, QR_in2: { v: 1000 * 1.1 * 1.1 }, QR_in3: { v: 2000 * Math.pow(1.02, 4), nearest: true },
  // units
  QR_un1: { v: 30 * 5280 / 3600 }, QR_un2: { v: 250 / 1000 }, QR_un3: { v: 0.5 * 200 },
  // probability
  QR_pf1: { t: '1 − (5/6)³' }, QR_pf2: { v: 1 - 1 / 16 }, QR_pf3: { t: '1 − (6/10)³' },
  QR_pc1c: { v: 100 * (0.01 * 0.95) / (0.01 * 0.95 + 0.99 * 0.05), nearest: true }, QR_pc2c: { v: 4 / 9 }, QR_pc3c: { v: 100 * (0.7 * 0.9) / (0.7 * 0.9 + 0.3 * 0.3), nearest: true },
  QR_cp1: { t: 'C(10,3) = 120' }, QR_cp2: { v: P(5, 4) }, QR_cp3: { v: C(5, 2) * C(6, 3) },
  // average speed, z-scores
  QR_hm1: { v: 2 * 30 * 20 / (30 + 20) }, QR_hm2: { v: 2 * 60 * 40 / (60 + 40) }, QR_hm3: { v: (60 + 40) / 2 },
  QR_zs1: { v: (130 - 100) / 15 }, QR_zs2: { v: (100 - 68) / 2, nearest: true }, QR_zs3: { v: 95 },
  // data sufficiency
  QR_ds1: { t: '(1) alone' }, QR_ds3: { t: 'Both together' },
  // exponents, absolute value
  QR_ex1: { t: '2⁷' }, QR_av1: { t: 'x = ±5' }, QR_av2: { t: '1 < x < 5' }, QR_av3: { t: 'x < −5 or x > 3' }, QR_abs1733: { t: '8 or 2' },
  // binomials and factoring
  QR_bn1: { t: 'x² + 4x + 4' }, QR_bn2: { t: '(x + 4)(x − 4)' }, QR_bn3: { t: '9x² − 6x + 1' }, QR_bn4: { v: 19 * 19 }, QR_bn5: { t: 'x² − 25' },
  QR_bnm1: { t: '4x² + 12x + 9' }, QR_bnm2: { t: '(7 + x)(7 − x)' }, QR_bnm3: { t: '4ab' }, QR_bnm4: { v: 7 * 7 - 2 * 10 }, QR_bnm5: { t: '(x − 3)²' },
  // sets
  QR_st1: { t: '{3, 4}' }, QR_st2: { v: 8 + 6 - 2 }, QR_stm4: { v: 18 + 22 - 0 }, QR_st3: { v: 70 + 60 - 30 }, QR_st4: { v: 25 + 20 - 35 },
  QR_stm1: { v: 12 + 8 + 5 }, QR_stm2: { v: 3 + 4 - 2 }, QR_stm3: { v: 30 - 12 }, QR_stm5: { t: '{6}' },
  // mean, median and mode
  QR_ds1s: { v: (4 + 6 + 8 + 10 + 12) / 5 }, QR_ds2s: { v: 7 }, QR_ds3s: { v: 7 }, QR_dsm1: { v: (10 + 20 + 30 + 40) / 4 }, QR_dsm2: { v: (5 + 7) / 2 }, QR_dsm4: { t: 'Mean' }, QR_dsm5: { v: 0 }
};

/* ---------- one item ---------- */
/* -> { ok: true, how } or { ok: false, why } */
export function verifyItem(q) {
  if (!q || !Array.isArray(q.opts) || !(q.opts.length === 4 || q.opts.length === 5)) return { ok: false, why: 'not four or five choices' };
  if (!q.why) return { ok: false, why: 'no worked reason' };
  if (new Set(q.opts.map(norm)).size !== q.opts.length) return { ok: false, why: 'two identical choices' };
  if (!(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.opts.length)) return { ok: false, why: 'key out of range' };
  const stem = norm(q.q), man = MANUAL[q.id];
  let hits, how;
  if (man && man.t != null) { hits = q.opts.map((o) => norm(o) === norm(man.t)); how = 'text'; }
  else if (man && man.nearest) {   /* the stem asks for "about": the nearest choice must be the key, and clearly nearest */
    const d = q.opts.map((o) => { const c = choiceNumber(o); return c ? Math.abs(c.v - man.v) : Infinity; }), best = Math.min(...d), k = d.indexOf(best);
    const second = Math.min(...d.filter((_, j) => j !== k));
    hits = q.opts.map((_, j) => j === k && best <= Math.abs(man.v) * 0.02 && second > best * 3); how = 'value';
  } else if (man) { hits = q.opts.map((o) => states(o, man.v)); how = 'value'; }
  else {
    let found = null, name = '';
    for (const [n, fn] of SOLVERS) { found = fn(stem); if (found) { name = n; break; } }
    if (!found) return { ok: false, why: 'no solver and not worked by hand' };
    hits = q.opts.map((o) => (found.test ? found.test(o) : states(o, found.v))); how = 'solver: ' + name;
  }
  const n = hits.filter(Boolean).length;
  if (!hits[q.correct]) return { ok: false, why: 'the keyed choice does not match the worked answer' };
  if (n !== 1) return { ok: false, why: 'more than one choice matches the worked answer' };
  return { ok: true, how };
}

/* ---------- the whole bank ---------- */
export function verifyBank(bank, opts = {}) {
  const dropTopics = new Set(opts.excludedTopics || []), dropIds = opts.isExcluded || (() => false);
  const ok = {}, skipped = {}, seenStem = new Set(), byTopic = {};
  for (const q of bank) {
    if (!TOPIC_NAMES[q.topic] || dropTopics.has(q.topic)) continue;
    const t = (byTopic[q.topic] = byTopic[q.topic] || { served: 0, skipped: 0 });
    const skip = (why) => { skipped[q.id] = why; t.skipped++; };
    if (dropIds(q.id)) { skip('listed in scope-exclusions.json'); continue; }
    const key = q.topic + '|' + norm(q.q);
    if (seenStem.has(key)) { skip('same question as an earlier item'); continue; }
    const r = verifyItem(q);
    if (!r.ok) { skip(r.why); continue; }
    seenStem.add(key); ok[q.id] = r.how; t.served++;
  }
  return { ok, skipped, byTopic };
}

function load() {
  const bank = JSON.parse(fs.readFileSync(path.join(ROOT, 'games/qr.json'), 'utf8'));
  const topics = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/bank/scope-topics.json'), 'utf8'));
  return { bank, excludedTopics: Object.keys(topics.qr || {}) };
}
export async function run() {
  const { bank, excludedTopics } = load();
  const { exclusionSet, isExcluded } = await import('../../netlify/lib/ace-exclusions.mjs');
  const set = exclusionSet(JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/bank/scope-exclusions.json'), 'utf8')));
  return verifyBank(bank, { excludedTopics, isExcluded: (id) => isExcluded(id, set) || isExcluded('qr:' + id, set) });
}
export function manifest(res) {
  const how = {}; for (const h of Object.values(res.ok)) { const k = h.split(':')[0]; how[k] = (how[k] || 0) + 1; }
  return JSON.stringify({
    note: 'Written by scripts/bank/verify-qr-arcade.mjs. Ids only. verified: items of games/qr.json whose answer key was worked out again from the question and matched; the QR drill serves these and no others from that bank. skipped: not served, with the reason.',
    summary: { verified: Object.keys(res.ok).length, skipped: Object.keys(res.skipped).length, how, byTopic: res.byTopic },
    verified: res.ok, skipped: res.skipped
  }, null, 1) + '\n';
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const res = await run(), body = manifest(res), file = path.join(ROOT, OUT);
  if (process.argv.includes('--check')) {
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== body) { console.error('stale: ' + OUT + ' (run node scripts/bank/verify-qr-arcade.mjs)'); process.exit(1); }
  } else fs.writeFileSync(file, body);
  const s = JSON.parse(body).summary;
  console.log(`qr arcade: ${s.verified} keys verified (${Object.entries(s.how).map(([k, v]) => v + ' by ' + k).join(', ')}), ${s.skipped} skipped`);
  const why = {}; for (const w of Object.values(res.skipped)) why[w] = (why[w] || 0) + 1;
  for (const [w, n] of Object.entries(why)) console.log('  skipped ' + n + ': ' + w);
}
