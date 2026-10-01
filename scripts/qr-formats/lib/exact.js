'use strict';
/* Exact rational arithmetic (BigInt) and a small expression language used by the
   QR formats checker to recompute every keyed answer independently of the
   author's worked solution. No floating point anywhere in a verified value.

   Grammar (precedence low to high):
     or  ->  and ( 'or' and )*
     and ->  not ( 'and' not )*
     not ->  'not' not | cmp
     cmp ->  sum ( ('<'|'<='|'>'|'>='|'=='|'!=') sum )?
     sum ->  prod ( ('+'|'-') prod )*
     prod->  unary ( ('*'|'/') unary )*
     unary-> '-' unary | pow
     pow ->  atom ( '^' unary )?
     atom->  number | name | name '(' args ')' | '(' or ')' | string
   Numbers: 12, 3.75, 1e3 are all exact. Strings ('...') are only used as
   figure lookups: cell('2019','Sales'). */

function gcd(a, b) { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { [a, b] = [b, a % b]; } return a; }

class Q {
  constructor(n, d = 1n) {
    n = BigInt(n); d = BigInt(d);
    if (d === 0n) throw new Error('division by zero');
    if (d < 0n) { n = -n; d = -d; }
    const g = gcd(n, d) || 1n;
    this.n = n / g; this.d = d / g;
  }
  static of(x) {
    if (x instanceof Q) return x;
    if (typeof x === 'bigint') return new Q(x, 1n);
    if (typeof x === 'number') {
      if (!Number.isFinite(x)) throw new Error('non-finite number');
      return Q.parse(String(x));
    }
    if (typeof x === 'string') return Q.parse(x);
    throw new Error('cannot make rational from ' + typeof x);
  }
  static parse(s) {
    s = String(s).trim();
    let m = s.match(/^(-?)(\d+)(?:\.(\d+))?(?:e(-?\d+))?$/i);
    if (m) {
      const sign = m[1] ? -1n : 1n; const frac = m[3] || '';
      let n = BigInt(m[2] + frac) * sign; let d = 10n ** BigInt(frac.length);
      if (m[4]) { const e = BigInt(m[4]); if (e >= 0n) n *= 10n ** e; else d *= 10n ** (-e); }
      return new Q(n, d);
    }
    m = s.match(/^(-?\d+)\/(\d+)$/);
    if (m) return new Q(BigInt(m[1]), BigInt(m[2]));
    throw new Error('not a number: ' + s);
  }
  add(o) { o = Q.of(o); return new Q(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { o = Q.of(o); return new Q(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { o = Q.of(o); return new Q(this.n * o.n, this.d * o.d); }
  div(o) { o = Q.of(o); if (o.n === 0n) throw new Error('division by zero'); return new Q(this.n * o.d, this.d * o.n); }
  neg() { return new Q(-this.n, this.d); }
  cmp(o) { o = Q.of(o); const l = this.n * o.d, r = o.n * this.d; return l < r ? -1 : l > r ? 1 : 0; }
  eq(o) { return this.cmp(o) === 0; }
  isInt() { return this.d === 1n; }
  abs() { return this.n < 0n ? this.neg() : this; }
  pow(e) {
    e = Q.of(e);
    if (e.isInt()) {
      let k = e.n; let base = this;
      if (k < 0n) { base = new Q(1n, 1n).div(this); k = -k; }
      return new Q(base.n ** k, base.d ** k);
    }
    // rational exponent p/q: exact only when the q-th root is rational
    const root = Q.nthRoot(this, e.d);
    if (!root) throw new Error('inexact power ' + this.toString() + '^' + e.toString());
    return root.pow(new Q(e.n, 1n));
  }
  static nthRoot(x, k) {
    if (x.n < 0n && k % 2n === 0n) return null;
    const r = (v) => { const neg = v < 0n; let a = neg ? -v : v; let lo = 0n, hi = 1n; while (hi ** k <= a) hi *= 2n; while (lo < hi) { const mid = (lo + hi + 1n) / 2n; if (mid ** k <= a) lo = mid; else hi = mid - 1n; } return lo ** k === a ? (neg ? -lo : lo) : null; };
    const n = r(x.n), d = r(x.d);
    return n === null || d === null ? null : new Q(n, d);
  }
  floor() { let q = this.n / this.d; if (this.n < 0n && q * this.d !== this.n) q -= 1n; return new Q(q, 1n); }
  ceil() { return this.neg().floor().neg(); }
  // round half away from zero to `places` decimals
  round(places = 0) {
    const s = 10n ** BigInt(places);
    const scaled = this.mul(new Q(s, 1n));
    const a = scaled.abs();
    let q = (a.n * 2n + a.d) / (2n * a.d);
    if (scaled.n < 0n) q = -q;
    return new Q(q, s);
  }
  toNumber() { return Number(this.n) / Number(this.d); }
  toString() { return this.d === 1n ? this.n.toString() : this.n + '/' + this.d; }
  toDecimal(places = 6) { const r = this.round(places); const neg = r.n < 0n; const a = neg ? -r.n : r.n; const s = 10n ** BigInt(places); const ip = (a * s / r.d) / s; return (neg ? '-' : '') + ip + (places ? '.' + String((a * s / r.d) % s).padStart(places, '0') : ''); }
}

// ---------------------------------------------------------------- tokenizer
function tokenize(src) {
  const out = []; let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    const num = src.slice(i).match(/^\d+(?:\.\d+)?(?:e-?\d+)?/i);
    if (num) { out.push({ t: 'num', v: num[0] }); i += num[0].length; continue; }
    const name = src.slice(i).match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (name) { out.push({ t: 'name', v: name[0] }); i += name[0].length; continue; }
    if (c === "'" || c === '"') { const j = src.indexOf(c, i + 1); if (j < 0) throw new Error('unterminated string'); out.push({ t: 'str', v: src.slice(i + 1, j) }); i = j + 1; continue; }
    const two = src.slice(i, i + 2);
    if (['<=', '>=', '==', '!='].includes(two)) { out.push({ t: 'op', v: two }); i += 2; continue; }
    if ('+-*/^(),<>'.includes(c)) { out.push({ t: 'op', v: c }); i++; continue; }
    throw new Error('bad character "' + c + '" in: ' + src);
  }
  return out;
}

// ---------------------------------------------------------------- parser -> AST
function parse(src) {
  const toks = tokenize(src); let p = 0;
  const peek = () => toks[p]; const next = () => toks[p++];
  const isOp = (v) => peek() && peek().t === 'op' && peek().v === v;
  const isWord = (v) => peek() && peek().t === 'name' && peek().v === v;
  const expect = (v) => { if (!isOp(v)) throw new Error('expected ' + v + ' in: ' + src); p++; };
  function or() { let l = and(); while (isWord('or')) { p++; l = { k: 'or', a: l, b: and() }; } return l; }
  function and() { let l = not(); while (isWord('and')) { p++; l = { k: 'and', a: l, b: not() }; } return l; }
  function not() { if (isWord('not')) { p++; return { k: 'not', a: not() }; } return cmp(); }
  function cmp() { const l = sum(); const t = peek(); if (t && t.t === 'op' && ['<', '<=', '>', '>=', '==', '!='].includes(t.v)) { p++; return { k: 'cmp', op: t.v, a: l, b: sum() }; } return l; }
  function sum() { let l = prod(); while (isOp('+') || isOp('-')) { const o = next().v; l = { k: 'bin', op: o, a: l, b: prod() }; } return l; }
  function prod() { let l = unary(); while (isOp('*') || isOp('/')) { const o = next().v; l = { k: 'bin', op: o, a: l, b: unary() }; } return l; }
  function unary() { if (isOp('-')) { p++; return { k: 'neg', a: unary() }; } if (isOp('+')) { p++; return unary(); } return pow(); }
  function pow() { const b = atom(); if (isOp('^')) { p++; return { k: 'bin', op: '^', a: b, b: unary() }; } return b; }
  function atom() {
    const t = next(); if (!t) throw new Error('unexpected end in: ' + src);
    if (t.t === 'num') return { k: 'num', v: Q.parse(t.v) };
    if (t.t === 'str') return { k: 'str', v: t.v };
    if (t.t === 'op' && t.v === '(') { const e = or(); expect(')'); return e; }
    if (t.t === 'name') {
      if (isOp('(')) { p++; const args = []; if (!isOp(')')) { args.push(or()); while (isOp(',')) { p++; args.push(or()); } } expect(')'); return { k: 'call', f: t.v, args }; }
      return { k: 'var', v: t.v };
    }
    throw new Error('unexpected token ' + JSON.stringify(t) + ' in: ' + src);
  }
  const ast = or(); if (p !== toks.length) throw new Error('trailing tokens in: ' + src); return ast;
}

function fact(n) { if (!n.isInt() || n.n < 0n || n.n > 200n) throw new Error('bad factorial'); let r = 1n; for (let i = 2n; i <= n.n; i++) r *= i; return new Q(r, 1n); }
function sorted(xs) { return xs.slice().sort((a, b) => a.cmp(b)); }
const FUNCS = {
  sqrt: (x) => { const r = Q.nthRoot(x, 2n); if (!r) throw new Error('inexact sqrt(' + x + ')'); return r; },
  cbrt: (x) => { const r = Q.nthRoot(x, 3n); if (!r) throw new Error('inexact cbrt(' + x + ')'); return r; },
  abs: (x) => x.abs(),
  floor: (x) => x.floor(), ceil: (x) => x.ceil(),
  round: (x, n) => x.round(n ? Number(n.n) : 0),
  min: (...xs) => sorted(xs)[0], max: (...xs) => sorted(xs)[xs.length - 1],
  sum: (...xs) => xs.reduce((a, b) => a.add(b), new Q(0n)),
  mean: (...xs) => xs.reduce((a, b) => a.add(b), new Q(0n)).div(new Q(BigInt(xs.length))),
  median: (...xs) => { const s = sorted(xs); const m = s.length; return m % 2 ? s[(m - 1) / 2] : s[m / 2 - 1].add(s[m / 2]).div(2); },
  range: (...xs) => { const s = sorted(xs); return s[s.length - 1].sub(s[0]); },
  fact,
  C: (n, k) => (k.cmp(n) > 0 || k.n < 0n) ? new Q(0n) : fact(n).div(fact(k).mul(fact(n.sub(k)))),
  P: (n, k) => fact(n).div(fact(n.sub(k))),
  mod: (a, b) => a.sub(b.mul(a.div(b).floor())),
  isint: (x) => x.isInt(),
  even: (x) => x.isInt() && x.n % 2n === 0n,
  odd: (x) => x.isInt() && x.n % 2n !== 0n,
  iff: (c, a, b) => (c ? a : b),
  isprime: (x) => { if (!x.isInt() || x.n < 2n) return false; for (let i = 2n; i * i <= x.n; i++) if (x.n % i === 0n) return false; return true; },
  // number of primes p with a <= p <= b
  countprimes: (a, b) => { let c = 0n; for (let i = a.ceil().n; i <= b.floor().n; i++) if (FUNCS.isprime(new Q(i))) c++; return new Q(c); },
  // smallest whole n >= 0 with start * ratio^n > target (ratio > 1)
  steps: (start, ratio, target) => { if (ratio.cmp(1) <= 0) throw new Error('steps needs ratio > 1'); let n = 0n; let v = start; while (v.cmp(target) <= 0) { v = v.mul(ratio); n++; if (n > 1000n) throw new Error('steps runaway'); } return new Q(n); },
  // number of positive divisors of a positive integer
  ndivisors: (x) => { if (!x.isInt() || x.n < 1n) throw new Error('ndivisors needs a positive integer'); let c = 0n; for (let i = 1n; i <= x.n; i++) if (x.n % i === 0n) c++; return new Q(c); }
};

function evaluate(ast, env) {
  switch (ast.k) {
    case 'num': return ast.v;
    case 'str': return ast.v;
    case 'var': {
      if (!(ast.v in env.vars)) { if (ast.v === 'true') return true; if (ast.v === 'false') return false; throw new Error('unknown variable ' + ast.v); }
      return Q.of(env.vars[ast.v]);
    }
    case 'neg': return evaluate(ast.a, env).neg();
    case 'not': return !evaluate(ast.a, env);
    case 'and': return !!evaluate(ast.a, env) && !!evaluate(ast.b, env);
    case 'or': return !!evaluate(ast.a, env) || !!evaluate(ast.b, env);
    case 'cmp': {
      const a = evaluate(ast.a, env), b = evaluate(ast.b, env); const c = a.cmp(b);
      return { '<': c < 0, '<=': c <= 0, '>': c > 0, '>=': c >= 0, '==': c === 0, '!=': c !== 0 }[ast.op];
    }
    case 'bin': {
      const a = evaluate(ast.a, env), b = evaluate(ast.b, env);
      if (ast.op === '+') return a.add(b); if (ast.op === '-') return a.sub(b);
      if (ast.op === '*') return a.mul(b); if (ast.op === '/') return a.div(b);
      if (ast.op === '^') return a.pow(b);
      break;
    }
    case 'call': {
      const args = ast.args.map((x) => evaluate(x, env));
      if (env.funcs && env.funcs[ast.f]) return env.funcs[ast.f](...args);
      if (FUNCS[ast.f]) return FUNCS[ast.f](...args);
      throw new Error('unknown function ' + ast.f);
    }
  }
  throw new Error('bad node ' + ast.k);
}

const cache = new Map();
function run(src, vars = {}, funcs = {}) {
  let ast = cache.get(src); if (!ast) { ast = parse(src); cache.set(src, ast); }
  return evaluate(ast, { vars, funcs });
}

/* Parse the number an answer option states. Accepts 1,250  -3.5  3/8  1 1/2
   45%  and trailing unit words ("2.5 hours"). Returns null for text options. */
function optionNumber(text) {
  let s = String(text).replace(/<[^>]+>/g, '').trim();
  s = s.replace(/^(about|approximately|exactly)\s+/i, '');
  let m = s.match(/^(-?)(\d+) (\d+)\/(\d+)(\s+[A-Za-z][A-Za-z .-]*)?$/);
  if (m) { const v = new Q(BigInt(m[2])).add(new Q(BigInt(m[3]), BigInt(m[4]))); return m[1] ? v.neg() : v; }
  m = s.match(/^(-?[\d,]*\d(?:\.\d+)?|-?\.\d+)(\/\d+)?\s*(%|percent)?(\s+[A-Za-z][A-Za-z .-]*)?$/);
  if (!m) return null;
  const raw = m[1].replace(/,/g, '').replace(/^(-?)\./, '$10.');
  let v = Q.parse(raw);
  if (m[2]) v = v.div(Q.parse(m[2].slice(1)));
  return v;
}

module.exports = { Q, parse, run, optionNumber, FUNCS };
