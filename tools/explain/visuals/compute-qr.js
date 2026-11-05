// compute-qr.js: pure helpers behind the QR pictures (batch B005 and later QR
// batches). No DOM. Shared by the renderers in qr-work.js (browser) and
// scripts/explainers/build.mjs (node), so the numbers a picture draws are the
// numbers the build checked against the bank key.
//
// checkPanel(panel, keyText, choices, ctx) is the build's recomputation gate
// for qr.work, qr.geometry and the qr.partwhole styles groups, bars and
// fractions. It runs the spec's `check` block (the key and the route behind
// every trap note, with every input number found in the stem), recomputes
// every block the picture draws (worked lines by substitution or by sampling,
// number-line rays, jumps and points, parabolas by their discriminant, place
// value columns, fraction bars, part-whole bars, the order-of-operations tree,
// exponent chips, sphere measures), checks that every choice a picture names
// is a served choice and that the outlined place is the key, and checks every
// plain arithmetic claim in the explainer's own words ("37.8 - 15.6 = 22.2").
import { evalExpr, asciiNumberText, choiceNumber, matches } from './compute-gc.js';

export const PARTWHOLE_STYLES = ['groups', 'bars', 'fractions'];
export const GEOMETRY_SHAPES = ['sphere'];

/* ----------------------------------------------------------------- numbers */
const EPS = 1e-9;
// a position or amount written as a number or as an expression string ("2/3")
export const N = (v) => (typeof v === 'number' ? v : evalExpr(toExpr(String(v))));
const close = (a, b) => Math.abs(a - b) <= EPS * Math.max(1, Math.abs(a), Math.abs(b));
// vars may be numbers or expression strings ("2/3"); later names may use earlier ones
export function resolveVars(v = {}) {
  const out = { pi: Math.PI };
  for (const [k, x] of Object.entries(v)) out[k] = typeof x === 'number' ? x : evalExpr(x, out);
  return out;
}
// an expression as a reader writes it: "4(5 - 2)", "-4x", "5 x 7", "10^-6"
export function toExpr(s, v) {
  let t = asciiNumberText(s).replace(/\s+/g, ' ').trim();
  if (v) {
    t = t.replace(new RegExp('(\\d|\\))\\s*' + v + '\\b', 'g'), '$1*' + v);   // -4x, 2(x)
  } else {
    t = t.replace(/(\d|\))\s+x\s+(?=[-(\d.])/g, '$1 * ');                      // 5 x 7: times
  }
  t = t.replace(/(\d|\))\s*\(/g, '$1*(').replace(/\)\s*(\d)/g, ')*$1');
  return t;
}
// {num, den} for a fraction choice ("48/35", "-3/4"), else null
export function fracOf(text) {
  const m = /^\s*([+-]?\d+)\s*\/\s*(\d+)\s*$/.exec(asciiNumberText(text));
  return m ? { num: +m[1], den: +m[2], value: +m[1] / +m[2] } : null;
}
// m x 10^e with 1 <= |m| < 10
export function properSci(text) {
  const m = /^\s*([+-]?\d*\.?\d+)\s*x\s*10\^([+-]?\d+)\s*$/.exec(asciiNumberText(text));
  return !!m && Math.abs(+m[1]) >= 1 && Math.abs(+m[1]) < 10;
}
// Does a value equal what a choice states? Fractions and whole numbers exactly;
// decimals and scientific notation to the precision they state.
export function qrMatches(value, text) {
  if (!Number.isFinite(value)) return false;
  const f = fracOf(text);
  if (f) return close(value, f.value);
  const t = asciiNumberText(text).trim();
  if (/^[+-]?\d+$/.test(t)) return close(value, +t);
  return matches(value, text);
}
// "14 or 6" -> [14, 6]; "14" -> [14]
export function setOf(text) {
  const parts = asciiNumberText(text).split(/\s+or\s+/);
  const out = parts.map((p) => { const f = fracOf(p); if (f) return f.value; const n = choiceNumber(p); return n && n.value != null ? n.value : NaN; });
  return out.every(Number.isFinite) ? out : null;
}
const sameMultiset = (a, b) => a.length === b.length && a.slice().sort((x, y) => x - y).every((x, i) => close(x, b.slice().sort((p, q) => p - q)[i]));
// "x > 0", "k ≤ 9" -> {v, rel, bound}
const REL = { '<': '<', '>': '>', '<=': '<=', '>=': '>=', '=': '=', '≤': '<=', '≥': '>=' };
export function ineqOf(text) {
  const m = /^\s*([a-z])\s*(<=|>=|<|>|=|≤|≥)\s*([+-]?\d*\.?\d+)\s*$/.exec(String(text).replace(/−/g, '-'));
  return m ? { v: m[1], rel: REL[m[2]], bound: +m[3] } : null;
}
export function holds(rel, a, b) {
  if (rel === '<') return a < b - EPS;
  if (rel === '>') return a > b + EPS;
  if (rel === '<=') return a <= b + EPS;
  if (rel === '>=') return a >= b - EPS;
  if (rel === '=') return Math.abs(a - b) <= EPS;
  throw new Error('relation ' + rel);
}
// the sample points a set test uses: a grid plus every boundary and its two neighbors
function samples(extra = []) {
  const pts = [];
  for (let x = -60; x <= 60; x += 0.25) pts.push(+x.toFixed(2));
  extra.forEach((b) => pts.push(b, b - 1e-4, b + 1e-4));
  return pts;
}
// Do two predicates hold on exactly the same points?
export function samePoints(p, q, extra) {
  const bad = samples(extra).filter((x) => p(x) !== q(x));
  return { ok: !bad.length, at: bad.slice(0, 3) };
}
// a predicate for an inequality spec {f, rel, rhs} in the variable v
export function ineqPred(spec, v, V) {
  return (x) => holds(spec.rel, evalExpr(toExpr(spec.f, v), Object.assign({}, V, { [v]: x })), evalExpr(toExpr(String(spec.rhs), v), Object.assign({}, V, { [v]: x })));
}
export function choicePred(text) {
  const q = ineqOf(text); if (!q) return null;
  return { v: q.v, bound: q.bound, pred: (x) => holds(q.rel, x, q.bound) };
}

/* -------------------------------------------------------------- quadratics */
export function discriminant(a, b, c) { return b * b - 4 * a * c; }
export const CASE_TEXT = { positive: ['two real roots'], zero: ['one real root'], negative: ['no real roots', 'two imaginary roots'] };
export const signOf = (d) => (Math.abs(d) <= EPS ? 'zero' : d > 0 ? 'positive' : 'negative');
export function quadRoots(a, b, c) {
  const d = discriminant(a, b, c);
  if (d < -EPS) return [];
  if (Math.abs(d) <= EPS) return [-b / (2 * a)];
  const s = Math.sqrt(d);
  return [(-b - s) / (2 * a), (-b + s) / (2 * a)].sort((x, y) => x - y);
}
export function parabolaPoints(a, b, c, x0, x1, n = 48) {
  const out = [];
  for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; out.push([x, a * x * x + b * x + c]); }
  return out;
}

/* ----------------------------------------------------------------- spheres */
export function sphere(r) { return { area: Math.PI * r * r, surface: 4 * Math.PI * r * r, volume: 4 / 3 * Math.PI * r * r * r }; }
export const SPHERE_FORMULA = { area: 'pi r^2', surface: '4 pi r^2', volume: '(4/3) pi r^3' };
export const SPHERE_UNITS = { area: 'square', surface: 'square', volume: 'cubic' };

/* ----------------------------------------------------- place-value columns */
// "24.9" and "1.1" -> digits right-aligned on the point, for the columns a table draws
export function placeDigits(text, intPlaces, decPlaces) {
  const [i, d = ''] = String(text).replace(/^[+-]/, '').split('.');
  return { int: i.padStart(intPlaces, ' ').split(''), dec: d.padEnd(decPlaces, ' ').split('') };
}
export function columnsResult(rows) {
  const dp = Math.max(...rows.map((r) => (String(r.digits).split('.')[1] || '').length));
  const v = rows.reduce((acc, r) => acc + (r.sign === '-' ? -1 : 1) * parseFloat(r.digits), 0);
  return v.toFixed(dp);
}

/* -------------------------------------------------- part-whole bar helpers */
export const rowSum = (row) => row.pieces.reduce((a, p) => a + p.n, 0);
export function barsMax(spec) { return spec.max != null ? spec.max : Math.max(...spec.rows.map(rowSum), ...(spec.ghosts || []).map((g) => g.at)); }

/* ----------------------------------------------------- arithmetic in prose */
// Every plain arithmetic claim in a sentence ("4 x 3 = 12", "4/6 + 5/6 - 3/6 =
// 6/6 = 1", "(-4)^2 - 4(1)(1) = 12") must hold, to the precision the right-hand
// side states. Spans that hold a letter (a variable, a word) are not claims.
const SPAN = /[0-9.()+\-*/^x ]/;
const MATHWORD = /^(pi|cos|sin|tan|root|sqrt|log|ln|e)$/;
export function arithmeticIssues(texts) {
  const issues = [], checked = [];
  for (const raw of texts) {
    const s = asciiNumberText(String(raw || ''));
    for (let i = s.indexOf('='); i >= 0; i = s.indexOf('=', i + 1)) {
      if (s[i - 1] === '<' || s[i - 1] === '>' || s[i + 1] === '=') continue;
      let a = i; while (a > 0 && SPAN.test(s[a - 1])) a--;
      if (a > 0 && /[A-Za-z]/.test(s[a - 1]) && s[a] !== ' ') continue;   // glued to a word: "dn=", "x="
      let b = i + 1; while (b < s.length && SPAN.test(s[b]) && s[b] !== '=') b++;
      // part of a longer formula: "(4/3) pi (4^3) = 256 pi / 3", "2(5)(7)(cos 60)"
      const before = /([A-Za-z]+)\s*$/.exec(s.slice(0, a)), after = /^\s*([A-Za-z]+)/.exec(s.slice(b));
      if ((before && (MATHWORD.test(before[1]) || before[1].length === 1)) || (after && (MATHWORD.test(after[1]) || after[1].length === 1))) continue;
      let L = s.slice(a, i).trim(), R = s.slice(i + 1, b).trim().replace(/[.\s]+$/, '');
      if (!L || !R || /^[x*/+^]/.test(L) || /[-+*/^x]$/.test(L) || /^[x*/^]/.test(R) || /[-+*/^x]$/.test(R)) continue;
      if (/(^|[^\d\s)])x|x(?![\s])/.test(L) || /(^|[^\d\s)])x|x(?![\s])/.test(R)) continue;   // x glued to something: a variable
      let lv, rv;
      try { lv = evalExpr(toExpr(L)); rv = evalExpr(toExpr(R)); } catch (e) { continue; }
      if (!/[-+*/^x(]/.test(L.replace(/^-/, '')) && !/[-+*/^x(]/.test(R.replace(/^-/, ''))) continue;   // "x = 3" style restatements
      const plain = /^[+-]?\d*\.?\d+$/.test(R);
      const ok = plain ? matches(lv, R) || close(lv, rv) : close(lv, rv);
      if (!ok) issues.push('arithmetic in the text does not hold: "' + L + ' = ' + R + '" (the left side is ' + +lv.toPrecision(8) + ')');
      else checked.push(L + ' = ' + R);
    }
  }
  return { issues, checked };
}

/* ------------------------------------------------------- equations in lines */
// "L rel R" with the variable v; rel is =, <, >, <=, >=
export function splitRel(row) {
  const m = /^(.*?)\s*(<=|>=|=|<|>)\s*(.*)$/.exec(asciiNumberText(row));
  return m ? { L: m[1], rel: m[2], R: m[3] } : null;
}

/* ---------------------------------------------------------------- the gate */
const isObj = (o) => o && typeof o === 'object';
function named(p) { const out = []; (function walk(o) { if (Array.isArray(o)) o.forEach(walk); else if (isObj(o)) { if (typeof o.choice === 'string') out.push(o); Object.values(o).forEach(walk); } })(p); return out; }
const stemNumbers = (stem) => (asciiNumberText(stem).match(/\d+(?:\.\d+)?(?:\/\d+)?/g) || []);

export function checkPanel(p, keyText, choices, ctx = {}) {
  const issues = [], checks = [];
  const served = new Set(choices);
  const nonKey = choices.filter((c) => c !== keyText);

  // 1. every choice the picture names is served; an outlined place is the key
  const nm = named(p).filter((o) => o !== p.check && !(p.check && (p.check.routes || []).includes(o)) && !(p.check && (p.check.noRoute || []).includes(o)));
  nm.forEach((o) => { if (!served.has(o.choice)) issues.push(p.type + ' names "' + o.choice + '", which is not a served choice'); });
  const outlined = (o) => o.key === true || o.kind === 'key';   // a piece of kind key is drawn outlined
  nm.filter(outlined).forEach((o) => { if (o.choice !== keyText) issues.push(p.type + ' outlines "' + o.choice + '" as the answer, but the key is "' + keyText + '"'); });
  nm.filter((o) => o.trap || o.kind === 'off').forEach((o) => { if (o.choice === keyText) issues.push(p.type + ' marks the key "' + keyText + '" as a trap'); });
  if (nm.length && !nm.some((o) => o.choice === keyText && outlined(o))) issues.push(p.type + ' names ' + nm.length + ' choices but does not outline the key');
  else if (nm.length) checks.push('picture names ' + new Set(nm.map((o) => o.choice)).size + ' of ' + choices.length + ' choices, each served; the outlined place is the key');

  // 2. the check block: the key, and the route behind every trap note
  const c = p.check;
  let V = { pi: Math.PI };
  if (!c) issues.push(p.type + ' needs a check block (the key and a route or noRoute for every other choice)');
  else {
    try { V = resolveVars(c.vars); } catch (err) { issues.push('check.vars: ' + err.message); }
    const nums = stemNumbers(ctx.stem || '');
    Object.entries(c.vars || {}).forEach(([k, x]) => { if ((c.derived || []).includes(k)) return; const s = String(x).replace(/^-/, ''); if (!nums.includes(s)) issues.push('check.vars ' + k + ' = ' + x + ' is not a number in the stem (list it in derived if the explainer computes it)'); });
    if (c.vars && Object.keys(c.vars).length) checks.push('inputs found in the stem: ' + Object.entries(c.vars).filter(([k]) => !(c.derived || []).includes(k)).map(([k, x]) => k + ' ' + x).join(', '));
    try {
      if (c.quad) { const q = c.quad, a = evalExpr(String(q.a), V), b = evalExpr(String(q.b), V), cc = evalExpr(String(q.c), V); const r = quadRoots(a, b, cc); V.a = a; V.b = b; V.c = cc; V.d = discriminant(a, b, cc); if (r.length === 2) { V.r1 = r[0]; V.r2 = r[1]; } checks.push('quadratic recomputed: a ' + a + ', b ' + b + ', c ' + cc + ', b^2 - 4ac = ' + +V.d.toPrecision(6) + (r.length ? ', roots ' + r.map((x) => +x.toPrecision(6)).join(' and ') : ', no real roots')); }
      if (c.key != null) {
        const val = evalExpr(toExpr(c.key, c.v), V);
        if (!qrMatches(val, keyText)) issues.push('check: ' + c.key + ' = ' + +val.toPrecision(8) + ', which is not the key "' + keyText + '"');
        else checks.push('key recomputed: ' + c.key + ' = ' + +val.toPrecision(8) + ', the key "' + keyText + '"');
        if (/x\s*10\^/.test(asciiNumberText(keyText)) && !properSci(keyText)) issues.push('the key "' + keyText + '" is not in proper scientific notation');
      }
      if (c.keySolves) {
        const kv = setOf(keyText);
        const { L, R } = splitRel(c.keySolves) || {};
        if (!kv || kv.length !== 1 || L == null) issues.push('check.keySolves needs an equation and a one-number key');
        else { const at = Object.assign({}, V, { [c.v]: kv[0] }); const lv = evalExpr(toExpr(L, c.v), at), rv = evalExpr(toExpr(R, c.v), at); if (!close(lv, rv)) issues.push('the key ' + keyText + ' does not solve ' + c.keySolves + ' (' + lv + ' vs ' + rv + ')'); else checks.push('the key solves ' + c.keySolves + ': both sides ' + lv); }
      }
      if (c.keySet) {
        const want = c.keySet.map((e) => evalExpr(toExpr(e), V)), got = setOf(keyText);
        if (!got || !sameMultiset(want, got)) issues.push('check.keySet gives ' + want.join(' and ') + ', the key reads "' + keyText + '"');
        else checks.push('key set recomputed: ' + c.keySet.join(', ') + ' = ' + want.join(' and '));
      }
      if (c.keyIneq) {
        const kp = choicePred(keyText);
        if (!kp) issues.push('the key "' + keyText + '" is not an inequality the check can read');
        else { const r = samePoints(ineqPred(c.keyIneq, kp.v, V), kp.pred, [kp.bound]); if (!r.ok) issues.push('the stem condition ' + c.keyIneq.f + ' ' + c.keyIneq.rel + ' ' + c.keyIneq.rhs + ' and the key "' + keyText + '" differ at ' + r.at.join(', ')); else checks.push('the key "' + keyText + '" holds exactly where ' + c.keyIneq.f + ' ' + c.keyIneq.rel + ' ' + c.keyIneq.rhs + ' (sampled -60 to 60 and at the boundary)'); }
      }
      if (c.keyCase) {
        const d = V.d; if (d == null) issues.push('check.keyCase needs check.quad');
        else if (!CASE_TEXT[signOf(d)].includes(keyText)) issues.push('b^2 - 4ac = ' + d + ' is ' + signOf(d) + ', which does not give "' + keyText + '"');
        else checks.push('b^2 - 4ac = ' + d + ' is ' + signOf(d) + ': "' + keyText + '"');
      }
      const routed = new Set();
      (c.routes || []).forEach((r) => {
        if (!served.has(r.choice)) { issues.push('check route for "' + r.choice + '", which is not a served choice'); return; }
        if (r.choice === keyText) { issues.push('check route given for the key'); return; }
        routed.add(r.choice);
        if (r.expr != null) { const val = evalExpr(toExpr(r.expr, c.v), V); if (!qrMatches(val, r.choice)) issues.push('trap route ' + r.expr + ' = ' + +val.toPrecision(8) + ', which does not give "' + r.choice + '"'); else checks.push('trap route recomputed: "' + r.choice + '" = ' + r.expr); }
        else if (r.set) { const want = r.set.map((e) => evalExpr(toExpr(e), V)), got = setOf(r.choice); if (!got || !sameMultiset(want, got)) issues.push('trap route set ' + r.set.join(', ') + ' does not give "' + r.choice + '"'); else checks.push('trap route recomputed: "' + r.choice + '" = ' + r.set.join(' and ')); }
        else if (r.ineq) { const cp = choicePred(r.choice); if (!cp) { issues.push('"' + r.choice + '" is not an inequality the check can read'); return; } const res = samePoints(ineqPred(r.ineq, cp.v, V), cp.pred, [cp.bound]); if (!res.ok) issues.push('trap route ' + r.ineq.f + ' ' + r.ineq.rel + ' ' + r.ineq.rhs + ' does not give "' + r.choice + '" (differs at ' + res.at.join(', ') + ')'); else checks.push('trap route recomputed: "' + r.choice + '" is exactly where ' + r.ineq.f + ' ' + r.ineq.rel + ' ' + r.ineq.rhs); }
        else if (r.disc != null) { const d = evalExpr(toExpr(r.disc), V); if (!CASE_TEXT[signOf(d)].includes(r.choice)) issues.push('trap route: b^2 - 4ac read as ' + r.disc + ' = ' + d + ' does not give "' + r.choice + '"'); else checks.push('trap route recomputed: b^2 - 4ac read as ' + r.disc + ' = ' + d + ' gives "' + r.choice + '"'); }
        else if (r.case) { if (!CASE_TEXT[r.case] || !CASE_TEXT[r.case].includes(r.choice)) issues.push('"' + r.choice + '" is not the outcome when b^2 - 4ac is ' + r.case); else if (V.d != null && signOf(V.d) === r.case) issues.push('"' + r.choice + '" is the outcome of this very case, b^2 - 4ac ' + r.case); else checks.push('"' + r.choice + '" is the outcome when b^2 - 4ac is ' + r.case + '; here it is ' + (V.d != null ? signOf(V.d) : 'unknown')); }
        else issues.push('route for "' + r.choice + '" needs expr, set, ineq, disc or case');
      });
      (c.noRoute || []).forEach((r) => { if (!r || !served.has(r.choice) || r.choice === keyText) issues.push('check.noRoute needs a served, non-key choice'); else routed.add(r.choice); });
      if ((c.noRoute || []).length) checks.push('no single-rule route for ' + c.noRoute.map((r) => '"' + r.choice + '"').join(', ') + ' (the notes say so)');
      const open = nonKey.filter((x) => !routed.has(x));
      if (open.length) issues.push('check has no route or noRoute for ' + open.map((x) => '"' + x + '"').join(', '));
    } catch (err) { issues.push('check: ' + err.message); }
  }

  // 3. what the picture draws, recomputed
  try { drawnChecks(p, keyText, V, issues, checks); } catch (err) { issues.push('picture check: ' + err.message); }

  // 4. arithmetic claims in the explainer's words
  if (ctx.texts) { const a = arithmeticIssues(ctx.texts); issues.push(...a.issues); if (a.checked.length) checks.push('arithmetic in the text holds: ' + a.checked.length + ' claim' + (a.checked.length > 1 ? 's' : '') + ' (' + a.checked.slice(0, 4).join('; ') + (a.checked.length > 4 ? '; ...' : '') + ')'); }
  return { issues, checks };
}

function drawnChecks(p, keyText, V, issues, checks) {
  const blocks = p.type === 'qr.work' ? Object.entries(p).filter(([k]) => BLOCK_KEYS.includes(k)) : [];
  if (p.type === 'qr.work' && !blocks.length) issues.push('qr.work draws nothing: add a block (' + BLOCK_KEYS.join(', ') + ')');
  for (const [k, b] of blocks) {
    if (k === 'lines') checkLines(b, keyText, V, issues, checks);
    if (k === 'numberline') checkLine(b, issues, checks);
    if (k === 'parabolas') checkParabolas(b, issues, checks);
    if (k === 'columns') {
      const got = columnsResult(b.rows);
      if (got !== b.result.digits) issues.push('columns: ' + b.rows.map((r) => (r.sign || '') + r.digits).join(' ') + ' = ' + got + ', the table says ' + b.result.digits);
      else checks.push('place-value columns recomputed: ' + b.rows.map((r) => (r.sign ? r.sign + ' ' : '') + r.digits).join(' ') + ' = ' + got);
      (b.ghosts || []).forEach((g) => { if (g.choice && !qrMatches(parseFloat(g.digits), g.choice)) issues.push('columns ghost ' + g.digits + ' is not "' + g.choice + '"'); });
      if (b.result.choice && !qrMatches(parseFloat(got), b.result.choice)) issues.push('columns result ' + got + ' is not "' + b.result.choice + '"');
    }
    if (k === 'tree') {
      b.pieces.filter((x) => x.expr).forEach((x) => { const v = evalExpr(toExpr(x.expr), V); if (!close(v, +x.value)) issues.push('tree: ' + x.expr + ' = ' + v + ', the box says ' + x.value); });
      const whole = evalExpr(toExpr(b.pieces.map((x) => x.expr ? '(' + x.expr + ')' : x.op).join(' ')), V);
      if (!close(whole, +b.result.value)) issues.push('tree: the whole line is ' + whole + ', the result box says ' + b.result.value);
      else checks.push('order of operations recomputed: ' + b.pieces.map((x) => x.expr ? x.expr + ' = ' + x.value : x.op).join(' ') + ', total ' + whole);
      if (b.result.choice && !qrMatches(whole, b.result.choice)) issues.push('tree result is not "' + b.result.choice + '"');
    }
    if (k === 'chips') {
      const n = b.groups.reduce((a, g) => a + g.n, 0);
      if (n !== b.result.n) issues.push('chips: the groups hold ' + n + ' factors, the result says ' + b.result.n);
      const v = Math.pow(+b.token, b.result.n);
      if (b.result.choice && !qrMatches(v, b.result.choice)) issues.push('chips: ' + b.token + '^' + b.result.n + ' = ' + v + ', not "' + b.result.choice + '"');
      else checks.push('exponent chips recomputed: ' + b.groups.map((g) => g.n).join(' + ') + ' = ' + n + ' factors of ' + b.token + ', ' + b.token + '^' + n + ' = ' + v);
      b.groups.forEach((g) => { const m = /\^(\d+)$/.exec(g.label); if (m && +m[1] !== g.n) issues.push('chips group ' + g.label + ' holds ' + g.n + ' factors'); });
    }
    if (k === 'rows') (b.rows || []).forEach((r) => { if (r.choice && r.value != null && /^[-+]?[\d.]+(\/\d+)?$/.test(String(r.value)) && !qrMatches(fracOf(String(r.value)) ? fracOf(String(r.value)).value : +r.value, r.choice)) issues.push('row value ' + r.value + ' is not the choice "' + r.choice + '"'); if (r.expr != null && r.value != null) { const v = evalExpr(toExpr(r.expr), V); if (!qrMatches(v, String(r.value))) issues.push('row ' + r.expr + ' = ' + v + ', the row says ' + r.value); } });
  }
  if (p.type === 'qr.partwhole' && p.style === 'groups') {
    const per = p.each.reduce((a, x) => a + x.n, 0), keyN = p.each.filter((x) => x.kind === 'key').reduce((a, x) => a + x.n, 0);
    const total = p.groups * keyN;
    if (p.result && p.result.choice && !qrMatches(total, p.result.choice)) issues.push('groups: ' + p.groups + ' x ' + keyN + ' = ' + total + ', not "' + p.result.choice + '"');
    else checks.push('groups recomputed: ' + p.groups + ' groups of ' + per + ', ' + keyN + ' in the key part of each: ' + p.groups + ' x ' + keyN + ' = ' + total);
    (p.columns || []).forEach((col) => {
      const part = p.each[col.part]; if (!part) { issues.push('groups column names part ' + col.part + ', which does not exist'); return; }
      const n = p.groups * part.n;
      if (col.choice && !qrMatches(n, col.choice)) issues.push('groups column ' + col.label + ' totals ' + n + ', not "' + col.choice + '"');
      if (col.key && part.kind !== 'key') issues.push('groups: the outlined column is not the key part');
      const m = /(\d+) x (\d+) = (\d+)/.exec(col.label); if (m && (+m[1] !== p.groups || +m[2] !== part.n || +m[3] !== n)) issues.push('groups column label "' + col.label + '" does not match ' + p.groups + ' x ' + part.n + ' = ' + n);
    });
  }
  if (p.type === 'qr.partwhole' && p.style === 'bars') {
    p.rows.forEach((row, i) => {
      const s = rowSum(row);
      if (row.total != null && !close(s, row.total)) issues.push('bar ' + (i + 1) + ' pieces add to ' + s + ', the bar says ' + row.total);
      row.pieces.forEach((pc) => {
        if (pc.pct != null) { const base = pc.of === 'prev' ? rowSum(p.rows[i - 1]) : pc.of === 'first' ? row.pieces[0].n : s; if (!close(pc.n, base * pc.pct / 100)) issues.push('bar ' + (i + 1) + ': ' + pc.pct + ' percent of ' + base + ' is ' + base * pc.pct / 100 + ', the piece says ' + pc.n); }
        if (pc.choice && !qrMatches(pc.n, pc.choice)) issues.push('bar piece ' + pc.n + ' is not the choice "' + pc.choice + '"');
      });
      if (row.totalChoice && !qrMatches(s, row.totalChoice)) issues.push('bar ' + (i + 1) + ' totals ' + s + ', not the choice "' + row.totalChoice + '"');
      if (row.choice && !qrMatches(s, row.choice)) issues.push('bar ' + (i + 1) + ' totals ' + s + ', not the choice "' + row.choice + '" it names');
      if (i > 0 && row.from === 'prev' && !close(row.pieces.reduce((a, x) => a + x.n, 0), rowSum(p.rows[i - 1]))) issues.push('bar ' + (i + 1) + ' should start from the total of bar ' + i);
    });
    (p.ghosts || []).forEach((g) => { if (g.choice && !qrMatches(g.at, g.choice)) issues.push('ghost at ' + g.at + ' is not the choice "' + g.choice + '"'); });
    checks.push('part-whole bars recomputed: ' + p.rows.map((r) => r.pieces.map((x) => +x.n.toPrecision(8)).join(' + ') + ' = ' + +rowSum(r).toPrecision(8)).join('; '));
  }
  if (p.type === 'qr.partwhole' && p.style === 'fractions') {
    let sum = 0;
    p.rows.forEach((r) => { sum += r.num / r.den; if (r.over) { const f = fracOf(r.over); if (!f || !close(f.value, r.num / r.den)) issues.push('fraction ' + r.num + '/' + r.den + ' is not ' + r.over); } });
    const t = p.total;
    if (!close(sum, t.num / t.den)) issues.push('fraction bars add to ' + sum + ', the total says ' + t.num + '/' + t.den);
    if (t.choice && !qrMatches(t.num / t.den, t.choice)) issues.push('fraction total is not the choice "' + t.choice + '"');
    (p.ghosts || []).forEach((g) => { if (g.choice && !qrMatches(g.num / g.den, g.choice)) issues.push('fraction ghost ' + g.num + '/' + g.den + ' is not "' + g.choice + '"'); });
    checks.push('fraction bars recomputed: ' + p.rows.map((r) => r.num + '/' + r.den + (r.over ? ' = ' + r.over : '')).join(' + ') + ' = ' + t.num + '/' + t.den);
  }
  if (p.type === 'qr.geometry' && p.shape === 'sphere') {
    const m = sphere(p.r);
    p.measures.forEach((x) => {
      if (!(x.kind in m)) { issues.push('sphere measure ' + x.kind + ' (area, surface or volume)'); return; }
      if (x.formula !== SPHERE_FORMULA[x.kind]) issues.push('sphere ' + x.kind + ' formula reads "' + x.formula + '"; it is ' + SPHERE_FORMULA[x.kind]);
      if (x.choice && !qrMatches(m[x.kind], x.choice)) issues.push('sphere ' + x.kind + ' of radius ' + p.r + ' is ' + m[x.kind].toFixed(4) + ', not "' + x.choice + '"');
    });
    checks.push('sphere of radius ' + p.r + ' recomputed: circle area ' + m.area.toFixed(2) + ', surface ' + m.surface.toFixed(2) + ', volume ' + m.volume.toFixed(2));
  }
}
export const BLOCK_KEYS = ['lines', 'numberline', 'parabolas', 'columns', 'tree', 'chips', 'rows'];

function checkLines(b, keyText, V, issues, checks) {
  const v = b.v || null;
  const rows = b.rows.filter((r) => r.expr);
  const kv = v ? (b.at ? b.at.map(N) : setOf(keyText)) : null;
  const first = rows.length && splitRel(rows[0].expr);
  rows.forEach((r, i) => {
    if (/\bor\b|\|/.test(r.expr)) return;   // a split into cases ("x = 14 or x = 6"): the check block covers it
    const s = splitRel(r.expr);
    if (!s) return;   // an expression with no relation: a starting line
    const at = (x) => Object.assign({}, V, v ? { [v]: x } : {});
    if (!v) {
      const lv = evalExpr(toExpr(s.L), V), rv = evalExpr(toExpr(s.R), V);
      if (s.rel === '=' && !close(lv, rv)) issues.push('line ' + (i + 1) + ' "' + r.expr + '" does not hold (' + lv + ' vs ' + rv + ')');
      return;
    }
    if (s.rel === '=' && first && first.rel === '=') {
      if (!kv || !kv.length || (!b.at && kv.length !== 1)) { issues.push('lines in ' + v + ' need a one-number key or an at list'); return; }
      kv.forEach((x) => { const lv = evalExpr(toExpr(s.L, v), at(x)), rv = evalExpr(toExpr(s.R, v), at(x)); if (!close(lv, rv)) issues.push('line ' + (i + 1) + ' "' + r.expr + '" is not true at ' + v + ' = ' + x); });
    } else if (first) {
      const P = (q) => (x) => holds(q.rel, evalExpr(toExpr(q.L, v), at(x)), evalExpr(toExpr(q.R, v), at(x)));
      const res = samePoints(P(first), P(s), []);
      if (!res.ok) issues.push('line ' + (i + 1) + ' "' + r.expr + '" holds on other points than line 1 (at ' + res.at.join(', ') + ')');
    }
    if (r.key && r.choice !== keyText) issues.push('the outlined line names "' + r.choice + '", not the key');
  });
  (b.exits || []).forEach((x) => { if (x.value != null && x.choice && !qrMatches(evalExpr(toExpr(String(x.value)), V), x.choice)) issues.push('exit value ' + x.value + ' is not "' + x.choice + '"'); });
  if (!issues.length) checks.push('worked lines recomputed: ' + rows.length + ' lines' + (v ? ', each ' + (first && first.rel === '=' ? 'true at ' + v + ' = ' + (kv || []).join(' and ') : 'holding on the same points as line 1') : ', each one with an = true'));
}
function checkLine(b, issues, checks) {
  const min = N(b.min), max = N(b.max);
  if (!(max > min)) issues.push('number line needs min < max');
  (b.jumps || []).forEach((j) => { const from = N(j.from), to = from + N(j.by); if (to < min - EPS || to > max + EPS || from < min - EPS || from > max + EPS) issues.push('jump from ' + j.from + ' by ' + j.by + ' leaves the line'); if (j.choice && !qrMatches(to, j.choice) && !(setOf(j.choice) || []).some((x) => close(x, to))) issues.push('jump lands on ' + to + ', not on "' + j.choice + '"'); });
  (b.points || []).forEach((pt) => { const px = N(pt.x); if (px < min - EPS || px > max + EPS) issues.push('point ' + pt.x + ' is off the line'); if (pt.choice) { const s = setOf(pt.choice); const cp = choicePred(pt.choice); if (s ? !s.some((x) => close(x, px)) : cp ? !cp.pred(px) : true) issues.push('point at ' + pt.x + ' is not on "' + pt.choice + '"'); } });
  (b.rays || []).forEach((r) => { if (!r.choice) return; const cp = choicePred(r.choice); if (!cp) { issues.push('ray names "' + r.choice + '", which is not an inequality'); return; } const from = N(r.from); const ray = (x) => (r.dir > 0 ? (r.open ? x > from + EPS : x >= from - EPS) : (r.open ? x < from - EPS : x <= from + EPS)); const res = samePoints(ray, cp.pred, [from, cp.bound]); if (!res.ok) issues.push('ray from ' + r.from + (r.dir > 0 ? ' rightward' : ' leftward') + (r.open ? ' (open)' : ' (closed)') + ' is not "' + r.choice + '"'); });
  (b.tests || []).forEach((t) => { if (t.f) { const v = evalExpr(toExpr(t.f, t.v || 'x'), { [t.v || 'x']: N(t.x) }); const ok = holds(t.rel, v, N(t.rhs)); if (ok !== !!t.holds) issues.push('test point ' + t.x + ': ' + t.f + ' = ' + v + ' ' + (ok ? 'does' : 'does not') + ' satisfy ' + t.rel + ' ' + t.rhs + ', the picture says the opposite'); } });
  checks.push('number line recomputed: ' + [(b.jumps || []).length && (b.jumps.length + ' jumps land where drawn'), (b.points || []).length && (b.points.length + ' points on their choices'), (b.rays || []).length && (b.rays.length + ' rays match their inequalities'), (b.tests || []).length && (b.tests.length + ' test points checked')].filter(Boolean).join(', '));
}
function checkParabolas(b, issues, checks) {
  b.cases.forEach((cs, i) => {
    const d = discriminant(cs.a, cs.b, cs.c), sg = signOf(d);
    if (!CASE_TEXT[sg].includes(cs.outcome)) issues.push('parabola ' + (i + 1) + ': b^2 - 4ac = ' + d + ' is ' + sg + ', the panel says ' + cs.outcome);
    if (cs.sign && cs.sign !== sg) issues.push('parabola ' + (i + 1) + ' is labeled ' + cs.sign + ' but b^2 - 4ac = ' + d);
    if (cs.choice) { const cp = choicePred(cs.choice); if (cp && cs.param != null && !cp.pred(cs[cs.param])) issues.push('parabola ' + (i + 1) + ' has ' + cs.param + ' = ' + cs[cs.param] + ', outside "' + cs.choice + '"'); if (!cp && !CASE_TEXT[sg].includes(cs.choice)) issues.push('parabola ' + (i + 1) + ' names "' + cs.choice + '", which is not its outcome'); }
  });
  checks.push('parabolas recomputed from a, b, c: ' + b.cases.map((cs) => 'b^2 - 4ac = ' + discriminant(cs.a, cs.b, cs.c) + ' (' + quadRoots(cs.a, cs.b, cs.c).length + ' real root' + (quadRoots(cs.a, cs.b, cs.c).length === 1 ? '' : 's') + ')').join(', '));
}
