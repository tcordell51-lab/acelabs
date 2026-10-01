'use strict';
/* QR formats checker: schema validation + independent recomputation of every
   keyed answer with exact rational arithmetic (lib/exact.js).

   Item source schema (scripts/qr-formats/src/*.js):
     id       'qc-001' | 'ds-001' | 'di-001' | 'aw-001'   (format prefix + 3 digits)
     format   'qc' | 'ds' | 'di' | 'aw'
     topic    one of TOPICS below
     diff     1..4   (1 easy, 2 medium, 3 hard, 4 hardest; DAT mix leans 2-3)
     stem     the question text. QC: the centered given information ('' if none).
              DS: the question asked.
     colA, colB          QC only: Quantity A and Quantity B (plain text)
     s1, s2              DS only: statements (1) and (2)
     figure              QRFigures spec (required for di, optional elsewhere)
     opts     five option strings (di, aw). QC and DS use the fixed choice sets.
     answer   di/aw: the exact text of the correct option
     key      qc: 'A'..'D'   ds: 'A'..'E'
     move     one line that names the move (the reusable rule)
     why      full worked solution (no option letters: options get re-ordered)
     diag     optional { '<option text>': 'what likely happened' } (di/aw)
              or { 'A': '...' } by letter (qc/ds)
     check    how the checker recomputes the key:
              {num:'expr', round?:places, nearest?:true}            numeric option
              {pickMax:{'<opt>':'expr',...}} | {pickMin:{...}}       text option chosen by value
              {qc:{A:'expr', B:'expr', vars?:{x:DOMAIN}, given?:'pred'}}
              {ds:{vars:{x:DOMAIN}, given?:'pred', ask:'expr' | askYes:'pred', s1:'pred', s2:'pred'}}
     DOMAIN   'int:a..b' | 'rat:a..b/q' (multiples of 1/q) | array of numbers
   Figure lookups usable in expressions: cell('row','col'), val('series','category'),
   slice('label'), pietotal(), seriessum('series'), col('col') -> sum of a column. */
const { Q, run, optionNumber } = require('./exact.js');

const QC_CHOICES = [
  'Quantity A is greater',
  'Quantity B is greater',
  'The two quantities are equal',
  'The relationship cannot be determined from the information given'
];
const DS_CHOICES = [
  'Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.',
  'Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.',
  'BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.',
  'EACH statement ALONE is sufficient.',
  'Statements (1) and (2) TOGETHER are NOT sufficient.'
];
const TOPICS = ['algebra', 'equations', 'inequalities', 'exponents', 'absolute-value', 'ratios', 'percent',
  'graphical', 'probability', 'counting', 'statistics', 'number-properties', 'rates', 'work', 'mixture',
  'interest', 'data', 'sequences', 'functions'];
const FORMATS = { qc: { n: 4, fixed: true }, ds: { n: 5, fixed: true }, di: { n: 5 }, aw: { n: 5 } };
const LETTERS = 'ABCDE';

// Words that belong to content removed from the DAT in 2015 to 2016, or to
// business language that never appears in study content.
const OFFSPEC = /\b(sin|cos|tan|sine|cosine|tangent|hypotenuse|SOHCAHTOA|radian|unit circle|pythagorean|triangle|circumference|radius|diameter|perimeter|polygon)\b/i;
const BUSINESS = /(\$|\bpaid\b|\bbalance\b|\bpackage\b)/i;
// allowed non-ASCII: math only. No emoji, no dashes, no decorative glyphs.
const ALLOWED_NON_ASCII = new Set(['×', '÷', '≤', '≥', '≠', 'π', '√', '²', '³', '°', '−', '·']);

function textOf(item) {
  return [item.stem, item.colA, item.colB, item.s1, item.s2, item.move, item.why, ...(item.opts || []),
    ...Object.values(item.diag || {}), item.figure ? JSON.stringify(item.figure) : ''].filter(Boolean).join(' \n ');
}
function plain(s) { return String(s).replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, 'x'); }

function figureFuncs(fig) {
  const f = {};
  if (!fig) return f;
  const n = (v) => (v instanceof Q ? v : typeof v === 'number' ? Q.of(v) : optionNumber(v));
  if (fig.type === 'table') {
    f.cell = (r, c) => { const row = fig.rows.find((x) => String(x[0]) === String(r)); const j = fig.columns.indexOf(c); if (!row || j < 0) throw new Error('no cell ' + r + '/' + c); const v = n(row[j]); if (!v) throw new Error('cell not numeric ' + r + '/' + c); return v; };
    f.col = (c) => { const j = fig.columns.indexOf(c); if (j < 0) throw new Error('no column ' + c); return fig.rows.reduce((a, r) => a.add(n(r[j])), new Q(0n)); };
  }
  if (fig.type === 'bar' || fig.type === 'line') {
    const cats = (fig.categories || fig.x).map(String);
    f.val = (s, c) => { const ser = fig.series.length === 1 && (s === '' || s === fig.series[0].name) ? fig.series[0] : fig.series.find((x) => x.name === s); const i = cats.indexOf(String(c)); if (!ser || i < 0) throw new Error('no value ' + s + '/' + c); return Q.of(ser.values[i]); };
    f.seriessum = (s) => { const ser = fig.series.find((x) => x.name === s) || fig.series[0]; return ser.values.reduce((a, v) => a.add(Q.of(v)), new Q(0n)); };
  }
  if (fig.type === 'pie') {
    f.slice = (l) => { const s = fig.slices.find((x) => x.label === l); if (!s) throw new Error('no slice ' + l); return Q.of(s.value); };
    f.pietotal = () => fig.slices.reduce((a, s) => a.add(Q.of(s.value)), new Q(0n));
  }
  return f;
}

function expandDomain(d) {
  if (Array.isArray(d)) return d.map((x) => Q.of(x));
  let m = String(d).match(/^int:(-?\d+)\.\.(-?\d+)$/);
  if (m) { const out = []; for (let i = +m[1]; i <= +m[2]; i++) out.push(new Q(BigInt(i))); return out; }
  m = String(d).match(/^rat:(-?\d+)\.\.(-?\d+)\/(\d+)$/);
  if (m) { const q = +m[3]; const out = []; for (let i = +m[1] * q; i <= +m[2] * q; i++) out.push(new Q(BigInt(i), BigInt(q))); return out; }
  throw new Error('bad domain ' + d);
}
function* points(vars) {
  const names = Object.keys(vars || {}); const doms = names.map((k) => expandDomain(vars[k]));
  const size = doms.reduce((a, d) => a * d.length, 1);
  if (size > 400000) throw new Error('domain too large: ' + size);
  if (!names.length) { yield {}; return; }
  const idx = names.map(() => 0);
  while (true) {
    const env = {}; names.forEach((k, i) => { env[k] = doms[i][idx[i]]; }); yield env;
    let i = names.length - 1; while (i >= 0) { idx[i]++; if (idx[i] < doms[i].length) break; idx[i] = 0; i--; } if (i < 0) return;
  }
}
function safe(fn) { try { return { v: fn() }; } catch (e) { return { err: e.message }; } }

// ---------------------------------------------------------------- verify keys
function computeKey(item) {
  const c = item.check; const F = figureFuncs(item.figure);
  if (!c) throw new Error('no check');
  if (c.qc) {
    const rel = new Set(); let count = 0;
    for (const env of points(c.qc.vars)) {
      if (c.qc.given) { const g = safe(() => run(c.qc.given, env, F)); if (g.err || !g.v) continue; }
      const a = safe(() => run(c.qc.A, env, F)); const b = safe(() => run(c.qc.B, env, F));
      if (a.err || b.err) continue; // outside the expression domain
      count++; rel.add(a.v.cmp(b.v));
      if (rel.size > 1) break;
    }
    if (!count) throw new Error('no admissible point for QC');
    if (rel.size > 1) return 'D';
    return { 1: 'A', '-1': 'B', 0: 'C' }[[...rel][0]];
  }
  if (c.ds) {
    const d = c.ds; const ask = d.ask || d.askYes; const isYes = !!d.askYes;
    const sets = { s1: new Set(), s2: new Set(), both: new Set() }; const hit = { s1: 0, s2: 0, both: 0, given: 0 };
    for (const env of points(d.vars)) {
      if (d.given) { const g = safe(() => run(d.given, env, F)); if (g.err || !g.v) continue; }
      const q = safe(() => run(ask, env, F)); if (q.err) continue;
      hit.given++;
      const key = isYes ? String(!!q.v) : q.v.toString();
      const a = safe(() => run(d.s1, env, F)); const b = safe(() => run(d.s2, env, F));
      const A = !a.err && a.v; const B = !b.err && b.v;
      if (A) { sets.s1.add(key); hit.s1++; }
      if (B) { sets.s2.add(key); hit.s2++; }
      if (A && B) { sets.both.add(key); hit.both++; }
    }
    if (!hit.both) throw new Error('statements (1) and (2) have no common admissible point: they must be consistent');
    const one = sets.s1.size === 1, two = sets.s2.size === 1, both = sets.both.size === 1;
    return one && two ? 'D' : one ? 'A' : two ? 'B' : both ? 'C' : 'E';
  }
  if (c.num) {
    const exact = run(c.num, {}, F);
    if (!(exact instanceof Q)) throw new Error('num check did not return a number');
    const vals = item.opts.map(optionNumber);
    if (vals.some((v) => v === null)) throw new Error('num check needs numeric options; got ' + item.opts.join(' | '));
    const matches = [];
    if (c.nearest) {
      const dist = vals.map((v) => v.sub(exact).abs());
      const order = dist.map((d, i) => i).sort((i, j) => dist[i].cmp(dist[j]));
      // unambiguous estimate: nearest option is less than half as far as the runner-up
      if (dist[order[0]].mul(2).cmp(dist[order[1]]) >= 0) throw new Error('nearest option is not clearly nearest (exact ' + exact.toDecimal(4) + ')');
      matches.push(order[0]);
    } else {
      const target = c.round != null ? exact.round(c.round) : exact;
      vals.forEach((v, i) => { if (v.eq(target)) matches.push(i); });
      if (matches.length !== 1) throw new Error('expected exactly one option equal to ' + target.toDecimal(4) + ' (exact ' + exact.toString() + '), found ' + matches.length);
    }
    return item.opts[matches[0]];
  }
  if (c.pickMax || c.pickMin) {
    const m = c.pickMax || c.pickMin; const entries = Object.entries(m).map(([k, e]) => [k, run(e, {}, F)]);
    for (const k of Object.keys(m)) if (!item.opts.includes(k)) throw new Error('pick option not in opts: ' + k);
    entries.sort((a, b) => a[1].cmp(b[1])); if (c.pickMax) entries.reverse();
    if (entries.length > 1 && entries[0][1].eq(entries[1][1])) throw new Error('pick tie between ' + entries[0][0] + ' and ' + entries[1][0]);
    return entries[0][0];
  }
  throw new Error('unknown check');
}

// ---------------------------------------------------------------- schema
function schemaErrors(item, Figures) {
  const e = []; const F = FORMATS[item.format];
  if (!F) return ['bad format ' + item.format];
  if (!/^(qc|ds|di|aw)-\d{3}$/.test(item.id || '') || item.id.slice(0, 2) !== item.format) e.push('bad id ' + item.id);
  if (!TOPICS.includes(item.topic)) e.push('bad topic ' + item.topic);
  if (![1, 2, 3, 4].includes(item.diff)) e.push('bad diff');
  if (typeof item.stem !== 'string') e.push('stem must be a string');
  if (!item.move || item.move.length < 15 || item.move.length > 200) e.push('move must be one line, 15 to 200 chars');
  if (!item.why || item.why.length < 80) e.push('why (worked solution) too short');
  if (/\b(option|choice|answer) [A-E]\b|\([A-E]\)/.test(item.why || '')) e.push('why cites an option letter');
  if (item.format === 'qc') {
    if (!item.colA || !item.colB) e.push('QC needs colA and colB');
    if (!'ABCD'.includes(item.key || 'x') || !item.key) e.push('QC key must be A-D');
    if (item.opts) e.push('QC must not define opts (fixed choices)');
  }
  if (item.format === 'ds') {
    if (!item.s1 || !item.s2) e.push('DS needs s1 and s2');
    if (!item.stem) e.push('DS needs a question stem');
    if (!'ABCDE'.includes(item.key || 'x') || !item.key) e.push('DS key must be A-E');
    if (item.opts) e.push('DS must not define opts (fixed choices)');
  }
  if (item.format === 'di' || item.format === 'aw') {
    if (!item.stem || item.stem.length < 40) e.push('stem too short for a DAT-style item');
    if (!Array.isArray(item.opts) || item.opts.length !== 5) e.push('needs exactly 5 options');
    else {
      if (new Set(item.opts).size !== 5) e.push('duplicate option text');
      const nums = item.opts.map(optionNumber);
      if (nums.every(Boolean)) { for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) if (nums[i].eq(nums[j])) e.push('two options have the same value'); }
      if (!item.opts.includes(item.answer)) e.push('answer not among opts');
    }
  }
  if (item.format === 'di' && !item.figure) e.push('data-interpretation item needs a figure');
  if (item.figure && Figures) Figures.validate(item.figure).forEach((x) => e.push('figure: ' + x));
  const all = textOf(item);
  for (const ch of all) if (ch.charCodeAt(0) > 126 && !ALLOWED_NON_ASCII.has(ch)) { e.push('disallowed character U+' + ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')); break; }
  if (OFFSPEC.test(plain(all))) e.push('off-spec content word: ' + plain(all).match(OFFSPEC)[0]);
  if (BUSINESS.test(plain(all))) e.push('business word or symbol: ' + plain(all).match(BUSINESS)[0]);
  if (item.diag) for (const k of Object.keys(item.diag)) {
    if (item.format === 'qc' || item.format === 'ds') { if (!LETTERS.slice(0, F.n).includes(k)) e.push('diag key must be a letter'); }
    else if (!(item.opts || []).includes(k)) e.push('diag key not an option: ' + k);
  }
  return e;
}

// Final option order used everywhere (engine, pool, tests): all-numeric option
// sets are shown ascending, the way the DAT prints them; text options keep the
// author's order.
function orderOptions(item) {
  if (item.format === 'qc') return { opts: QC_CHOICES.slice(), correct: 'ABCD'.indexOf(item.key) };
  if (item.format === 'ds') return { opts: DS_CHOICES.slice(), correct: 'ABCDE'.indexOf(item.key) };
  const nums = item.opts.map(optionNumber); let opts = item.opts.slice();
  if (nums.every(Boolean)) opts = opts.map((o, i) => [o, nums[i]]).sort((a, b) => a[1].cmp(b[1])).map((x) => x[0]);
  return { opts, correct: opts.indexOf(item.answer) };
}

function verifyItem(item, Figures) {
  const errors = schemaErrors(item, Figures);
  if (errors.length) return errors;
  let got;
  try { got = computeKey(item); } catch (err) { return ['check failed: ' + err.message]; }
  if (item.format === 'qc' || item.format === 'ds') { if (got !== item.key) errors.push('KEY MISMATCH: checker says ' + got + ', item keyed ' + item.key); }
  else if (got !== item.answer) errors.push('KEY MISMATCH: checker says "' + got + '", item answer "' + item.answer + '"');
  if (item.format === 'di' || item.format === 'aw') {
    const L = (s) => plain(s).length; const k = L(item.answer);
    if (item.opts.filter((o) => o !== item.answer).every((o) => L(o) < k)) errors.push('key is the unique longest option');
  }
  return errors;
}

// ---------------------------------------------------------------- set-level gates
function setReport(items) {
  const out = { byFormat: {}, problems: [] };
  for (const f of Object.keys(FORMATS)) {
    const xs = items.filter((i) => i.format === f); const n = FORMATS[f].n; const dist = Array(n).fill(0);
    xs.forEach((i) => { const o = orderOptions(i); if (o.correct >= 0) dist[o.correct]++; });
    const diffs = [1, 2, 3, 4].map((d) => xs.filter((i) => i.diff === d).length);
    out.byFormat[f] = { count: xs.length, keys: Object.fromEntries(dist.map((c, i) => [LETTERS[i], c])), diffs };
    if (xs.length >= 20) {
      const lo = Math.floor(xs.length / n * 0.6), hi = Math.ceil(xs.length / n * 1.4);
      dist.forEach((c, i) => { if (c < lo || c > hi) out.problems.push(f + ': key ' + LETTERS[i] + ' used ' + c + ' times (allowed ' + lo + ' to ' + hi + ')'); });
    }
  }
  const ids = new Set(); items.forEach((i) => { if (ids.has(i.id)) out.problems.push('duplicate id ' + i.id); ids.add(i.id); });
  const stems = new Map(); items.forEach((i) => { const k = plain(i.stem + (i.colA || '') + (i.colB || '') + (i.s1 || '')).toLowerCase().replace(/\s+/g, ' '); if (stems.has(k)) out.problems.push('duplicate stem ' + i.id + ' / ' + stems.get(k)); stems.set(k, i.id); });
  return out;
}

module.exports = { QC_CHOICES, DS_CHOICES, TOPICS, FORMATS, verifyItem, computeKey, schemaErrors, orderOptions, setReport, figureFuncs };
