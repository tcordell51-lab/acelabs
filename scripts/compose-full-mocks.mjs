#!/usr/bin/env node
// Composes the Ace Labs four-section full-length mocks (tools/mock/full.html).
//
//   node scripts/compose-full-mocks.mjs [--count N] [--source DIR] [--check]
//
// Science (Bio 40, GChem 30, OChem 30) and QR (40) items are drawn from the AceTheDAT
// question pool built by the prep app out of Ace Labs' own engine banks and the coaching
// portal's original items (default DIR: ~/code/acethedat-prep/site/data/bank). Only items
// that pass every answer-bias rule are eligible:
//
//   - exactly five distinct choices; no "all/none of the above"; no choice that names a letter
//   - the keyed choice is never the longest (a tie is allowed only among short labels of
//     20 characters or fewer, the same rule the RC validator uses)
//   - the explanation never names an answer letter (choices get reordered here)
//   - no em or en dashes, no emoji, no partial-charge delta shorthand, no raw HTML
//   - not already used by The Climb (tools/minitests) or the Prometric mocks
//     (shared/dat-mock-tests.js), so a full mock never repeats an item a student has seen
//   - not rejected by the blind re-solve (tools/mock/verification/rejected.json)
//
// Keys are then spread: inside every section each letter A to E is the key the same number
// of times (8 each in a 40, 6 each in a 30), with no run of three identical keys in a row.
// Choices that are plain numbers keep ascending order, the way the exam prints them, and
// their key letter counts toward the balance.
//
// PAT comes from the seeded PAT engine (tools/pat/engine) and RC from a full RC section
// (tools/rc/data/sections.json); the composer only records which ones each mock uses.
// If the pool cannot fill a mock under these rules, the composer builds fewer mocks.
//
// Output: tools/mock/data/full-mocks.js (window.ACE_FULL_MOCKS). --check validates the
// existing output without rewriting it.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'tools/mock/data/full-mocks.js');
const REJECTED = path.join(ROOT, 'tools/mock/verification/rejected.json');
const VERIFIED = path.join(ROOT, 'tools/mock/verification/verified.json');
const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const COUNT = parseInt(arg('--count', '5'), 10);
const SRC = arg('--source', path.join(os.homedir(), 'code/acethedat-prep/site/data/bank'));
const CHECK = process.argv.includes('--check');
const L = 'ABCDE';

export const SECTIONS = [
  { key: 'bio', file: 'bio.json', sub: 'Biology', n: 40 },
  { key: 'gc', file: 'gchem.json', sub: 'Gen Chem', n: 30 },
  { key: 'ochem', file: 'ochem.json', sub: 'OChem', n: 30 },
  { key: 'qr', file: 'qr.json', sub: 'QR', n: 40 },
];
// The prep build's own list of items whose stored answer an author disputed (CONTENT-HEALTH.md).
const DISPUTED = new Set(['qr-a:dsm3', 'qr-b:QR_fd3']);
// Full mocks use RC sections from the end of the list and PAT seeds outside PAT Tests 1 to 15.
const RC_SECTIONS = ['rc-s15', 'rc-s14', 'rc-s13', 'rc-s12', 'rc-s11', 'rc-s10', 'rc-s9', 'rc-s8', 'rc-s7', 'rc-s6'];
const patSeed = (n) => 'F' + (20261000 + n);

/* ------------------------------------------------------------------ rules */
const BAD = /[—–]|\p{Extended_Pictographic}/u;
const DELTA = /δ\s*[+\-−]|delta[ -]?(plus|minus)/i;
const LETTER_REF = /\b(?:[Cc]hoices?|[Oo]ptions?|[Aa]nswers?|[Ll]etters?)\s+[A-E]\b|\([A-E]\)|\b[A-E] (?:and|or) [A-E]\b|\b[A-E] through [A-E]\b/;
const STRIPPED_DEGREE = /\b[1234] (?:cation|carbocation|carbon|alcohol|amine|halide|radical|chloride|bromide|alkyl)\b/;
const ABOVE = /\b(all|none|both|neither) of the (above|these)\b/i;
const norm = (s) => String(s).toLowerCase().replace(/<[^>]+>/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
const stemKey = (q) => norm(q).slice(0, 90);
// Two items built from one template ("A $50 item is marked up 50%...") must not share a mock.
const shapeKey = (it) => String(it.q).toLowerCase().replace(/[0-9][0-9.,]*/g, '#').replace(/[^a-z# ]/g, ' ').split(/\s+/).filter(Boolean).slice(0, 9).join(' ');
const templateKeys = (it) => [/^generated:/.test(it.i) ? it.i.split('#')[0] : null, 'shape:' + shapeKey(it)].filter(Boolean);

export function keyNotLongest(opts, key) {
  const len = opts.map((o) => String(o).length);
  const kl = len[key];
  const maxOther = Math.max(...len.filter((_, i) => i !== key));
  return kl < maxOther || (kl === maxOther && kl <= 20);
}
const numeric = (o) => /^-?[$]?\d[\d,]*(\.\d+)?%?$/.test(String(o).trim());
const numVal = (o) => parseFloat(String(o).replace(/[$,%]/g, ''));

const ENT = { '&gt;': '>', '&lt;': '<', '&amp;': '&', '&quot;': '"', '&#39;': "'", '&apos;': "'" };
const decode = (t) => (typeof t === 'string' ? t.replace(/&(gt|lt|amp|quot|#39|apos);/g, (m) => ENT[m]) : t);
const words = (o) => String(o).trim().split(/\s+/).length;

export function eligible(it, seen, rejected) {
  const why = [];
  // Wording tells and flashcard register the blind solvers flagged in the first pass.
  if (Array.isArray(it.o) && it.o.length === 5 && !it.os) {
    const k = it.a;
    if (String(it.o[k]).includes('(') && it.o.filter((o) => String(o).includes('(')).length === 1) why.push('only the key carries a parenthetical');
    if (it.o.filter((o, i) => i !== k && words(o) <= 2).length >= 2 && words(it.o[k]) >= 4) why.push('flashcard choices beside a full-sentence key');
    if (it.st && /^bio/.test(it.st) && it.o.some((o) => / \+ /.test(String(o)))) why.push('shorthand choices');
  }
  if (it.os && it.qs && it.o.includes(it.qs)) why.push('drawn structure is one of the choices');
  if (/\b(from earlier|continuing|previous (question|item|problem))\b/i.test(it.q)) why.push('stem leans on another item');
  if (/\bMCAT\b|\bGPA\b|on track|pacing|study (plan|strategy|session)|practice test score/i.test(it.q)) why.push('study-strategy item, not a content question');
  if (!Array.isArray(it.o) || it.o.length !== 5) why.push('not five choices');
  else {
    if (new Set(it.o.map((o) => String(o).trim().toLowerCase().replace(/\s+/g, ' '))).size !== 5) why.push('duplicate choices');
    if (!(it.a >= 0 && it.a < 5)) why.push('bad key');
    else if (!keyNotLongest(it.o, it.a)) why.push('key is the longest choice');
    // Structure choices are SMILES strings ("C(C)O"), so the letter check only reads words.
    if (!it.os && it.o.some((o) => ABOVE.test(o) || /^\s*[A-E]\s*(and|or)\s*[A-E]\s*$/.test(o) || LETTER_REF.test(o))) why.push('choice names other choices');
  }
  const text = [it.q, ...(it.o || []), it.w || '', ...((it.t || []).filter(Boolean))].join(' \n ');
  if (BAD.test(text)) why.push('dash or emoji');
  if (DELTA.test(text)) why.push('delta shorthand');
  if (/<[a-z]/i.test(it.q)) why.push('html in stem');
  // Exam register: a full sentence, not flashcard shorthand ("1st order, k=0.0693 min-1. t1/2?").
  if (String(it.q).trim().split(/\s+/).length < 6 || /[A-Za-z\]\)]=[\d\[A-Za-z]/.test(it.q) || /=\s*$/.test(it.q.trim())) why.push('shorthand stem');
  if (STRIPPED_DEGREE.test(text)) why.push('stripped degree sign');
  if (!it.w || it.w.trim().length < 20) why.push('no explanation');
  if (DISPUTED.has(it.i)) why.push('disputed key');
  if (rejected.has(it.i)) why.push('rejected by blind re-solve');
  if (seen.has(stemKey(it.q))) why.push('already in The Climb or a Prometric mock');
  return why;
}

/* ------------------------------------------------------------------ rng */
function hash(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = hash(seed); return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffle(arr, r) { const b = arr.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

/* ------------------------------------------------------------------ sources */
function loadWindow(file, name) {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx);
  return ctx.window[name];
}
function seenStems() {
  const seen = new Set();
  const climb = loadWindow('tools/minitests/bank.js', 'MINITEST_BANK');
  for (const t of climb.tests) for (const q of t.questions) seen.add(stemKey(q.stem));
  const mocks = loadWindow('shared/dat-mock-tests.js', 'DAT_MOCK_TESTS');
  for (const t of mocks) for (const v of Object.values(t.sections)) for (const q of v) seen.add(stemKey(q.q));
  return seen;
}
function stopTitles() {
  const f = path.join(SRC, '..', 'catalog.json');
  const out = {};
  if (!fs.existsSync(f)) return out;
  const cat = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const s of cat.sections || []) for (const st of s.stops || []) out[st.id] = { title: st.title, nights: st.nights || [] };
  return out;
}

/* ------------------------------------------------------------------ assembly */
// Quota per stop for one section: proportional to how many eligible items each stop holds,
// largest remainder, at most what the stop can supply across every mock.
function quotas(byStop, n, mocks) {
  const stops = Object.keys(byStop).filter((s) => byStop[s].length >= mocks);
  const total = stops.reduce((a, s) => a + byStop[s].length, 0);
  const raw = stops.map((s) => ({ s, x: (n * byStop[s].length) / total }));
  const q = Object.fromEntries(raw.map((r) => [r.s, Math.floor(r.x)]));
  let left = n - Object.values(q).reduce((a, b) => a + b, 0);
  raw.sort((a, b) => (b.x % 1) - (a.x % 1));
  for (const r of raw) { if (left <= 0) break; q[r.s]++; left--; }
  for (const s of stops) if (q[s] * mocks > byStop[s].length) return null;
  return q;
}

function spreadKeys(items, r, label) {
  const n = items.length;
  for (let attempt = 0; attempt < 400; attempt++) {
    const fixed = items.map((it) => (it._natural ? it._naturalKey : null));
    const need = [0, 0, 0, 0, 0].map(() => n / 5);
    if (n % 5) throw new Error(`${label}: section size ${n} is not a multiple of five`);
    fixed.forEach((k) => { if (k != null) need[k]--; });
    if (need.some((x) => x < 0)) return null;
    const pool = shuffle(need.flatMap((c, k) => Array(c).fill(k)), r);
    const keys = fixed.map((k) => (k != null ? k : pool.pop()));
    let run = false;
    for (let i = 2; i < n; i++) if (keys[i] === keys[i - 1] && keys[i] === keys[i - 2]) run = true;
    if (!run) return keys;
  }
  return null;
}

function place(it, target, r) {
  // Returns a copy of the item with its choices reordered so the key sits at `target`.
  let order;
  if (it._natural) order = it._order;
  else {
    const others = shuffle([0, 1, 2, 3, 4].filter((i) => i !== it.a), r);
    others.splice(target, 0, it.a);
    order = others;
  }
  const traps = Array.isArray(it.t) ? order.map((i) => it.t[i] || null) : null;
  return {
    id: it.i, sub: it._sub, stop: it.st, topic: it._topic, nights: it._nights, d: it.d,
    q: decode(it.q), opts: order.map((i) => decode(it.o[i])), correct: order.indexOf(it.a),
    why: decode(it.w), traps: traps && traps.some(Boolean) ? traps.map((t, i) => (i === order.indexOf(it.a) ? null : decode(t))) : null,
    qs: it.qs || null, os: !!it.os, src: it.x,
  };
}

export function compose({ count = COUNT, source = SRC } = {}) {
  const seen = seenStems();
  const rejected = new Set(fs.existsSync(REJECTED) ? JSON.parse(fs.readFileSync(REJECTED, 'utf8')).map((x) => x.id || x) : []);
  const titles = stopTitles();
  const verified = new Set(fs.existsSync(VERIFIED) ? JSON.parse(fs.readFileSync(VERIFIED, 'utf8')).map((x) => x.id) : []);
  const report = {};
  const pools = {};
  for (const sec of SECTIONS) {
    const items = JSON.parse(fs.readFileSync(path.join(source, sec.file), 'utf8')).items;
    const reasons = {};
    const ok = [];
    const fp = new Set();
    for (const it of items) {
      const why = eligible(it, seen, rejected);
      const k = stemKey(it.q) + '|' + (it.o || []).map(norm).sort().join('|');
      if (!why.length && fp.has(k)) why.push('duplicate item');
      if (why.length) { for (const w of why) reasons[w] = (reasons[w] || 0) + 1; continue; }
      fp.add(k);
      const nat = it.o.every(numeric) && !it.os;
      const ord = nat ? [0, 1, 2, 3, 4].sort((x, y) => numVal(it.o[x]) - numVal(it.o[y])) : null;
      // An explanation that says "option A" stays true only if the choices keep their order.
      const namesLetter = LETTER_REF.test(it.w || '') || (it.t || []).some((t) => t && LETTER_REF.test(t));
      const noShuffle = it.sh === 0 || it.sh === false || namesLetter;
      ok.push(Object.assign({}, it, {
        _sub: sec.sub, _topic: (titles[it.st] || {}).title || it.st, _nights: (titles[it.st] || {}).nights || [],
        _natural: nat || noShuffle, _order: nat ? ord : [0, 1, 2, 3, 4], _naturalKey: nat ? ord.indexOf(it.a) : it.a,
      }));
    }
    pools[sec.key] = ok;
    report[sec.key] = { total: items.length, eligible: ok.length, excluded: reasons };
  }

  // How many mocks can the pools fill? Try the requested count, step down if a section runs dry.
  let n = count, plan = null;
  for (; n >= 1; n--) {
    plan = {};
    let fits = true;
    for (const sec of SECTIONS) {
      const byStop = {};
      for (const it of pools[sec.key]) (byStop[it.st] = byStop[it.st] || []).push(it);
      const q = quotas(byStop, sec.n, n);
      if (!q) { fits = false; break; }
      plan[sec.key] = { byStop, q };
    }
    if (fits) break;
  }
  if (n < 1) throw new Error('pools cannot fill even one full mock under the bias rules');

  const mocks = [];
  for (let m = 1; m <= n; m++) mocks.push({ id: 'FULL_' + m, name: 'Full-Length Test ' + m, sections: {}, pat: { seed: patSeed(m) }, rc: { section: RC_SECTIONS[m - 1] } });
  for (const sec of SECTIONS) {
    const r = rng('acelabs-full-mock-' + sec.key);
    const { byStop, q } = plan[sec.key];
    // Prefer harder items: difficulty 3 and 2 first, then 1, shuffled inside each level.
    const queues = {};
    for (const [st, list] of Object.entries(byStop)) {
      const sh = shuffle(list, r);
      // Items that already passed the blind re-solve come first, then harder before easier.
      const lvl = (list) => [...list.filter((x) => x.d >= 3), ...list.filter((x) => x.d === 2), ...list.filter((x) => !(x.d >= 2))];
      queues[st] = [...lvl(sh.filter((x) => verified.has(x.i))), ...lvl(sh.filter((x) => !verified.has(x.i)))];
    }
    // Deal round-robin so every mock gets the same difficulty shape.
    const deal = mocks.map(() => []);
    // An item whose choices keep their printed order (plain numbers) has a fixed key letter;
    // a mock takes at most a fifth of the section's slots on any one fixed letter, so the
    // letters can still come out even once the other items are reordered.
    const cap = sec.n / 5;
    const fixedCount = mocks.map(() => [0, 0, 0, 0, 0]);
    const usedTpl = mocks.map(() => new Set());
    for (const [st, k] of Object.entries(q)) for (let i = 0; i < k; i++) for (let m = 0; m < n; m++) {
      const qu = queues[st];
      let j = qu.findIndex((x) => (!x._natural || fixedCount[m][x._naturalKey] < cap) && !templateKeys(x).some((t) => usedTpl[m].has(t)));
      if (j < 0) throw new Error(`${sec.key} stop ${st}: no item fits the key balance`);
      const it = qu.splice(j, 1)[0];
      if (it._natural) fixedCount[m][it._naturalKey]++;
      templateKeys(it).forEach((t) => usedTpl[m].add(t));
      deal[m].push(it);
    }
    deal.forEach((items, m) => {
      // Topics come mixed, the way the exam serves them.
      let ordered = null, keys = null;
      for (let tries = 0; tries < 30 && !keys; tries++) { ordered = shuffle(items, r); keys = spreadKeys(ordered, r, `${mocks[m].id} ${sec.key}`); }
      if (!keys) throw new Error(`${mocks[m].id} ${sec.key}: could not spread keys evenly`);
      mocks[m].sections[sec.key] = ordered.map((it, i) => place(it, keys[i], r));
    });
  }
  return { mocks, report };
}

/* ------------------------------------------------------------------ checks */
export function checkMocks(mocks) {
  const errors = [];
  const ids = new Set();
  for (const mk of mocks) {
    for (const sec of SECTIONS) {
      const items = mk.sections[sec.key] || [];
      if (items.length !== sec.n) errors.push(`${mk.id} ${sec.key}: ${items.length} items, expected ${sec.n}`);
      const kc = [0, 0, 0, 0, 0];
      items.forEach((it, i) => {
        if (ids.has(it.id)) errors.push(`${mk.id} ${sec.key}: ${it.id} repeats across mocks`);
        ids.add(it.id);
        if (it.opts.length !== 5) errors.push(`${it.id}: not five choices`);
        if (!keyNotLongest(it.opts, it.correct)) errors.push(`${it.id}: key is the longest choice`);
        kc[it.correct]++;
        if (i >= 2 && items[i - 1].correct === it.correct && items[i - 2].correct === it.correct) errors.push(`${mk.id} ${sec.key}: three ${L[it.correct]} keys in a row at ${i + 1}`);
      });
      if (items.length && kc.some((c) => c !== items.length / 5)) errors.push(`${mk.id} ${sec.key}: key letters not even (${kc.map((c, i) => L[i] + c).join(' ')})`);
    }
    if (!mk.pat || !mk.pat.seed) errors.push(`${mk.id}: no PAT seed`);
    if (!mk.rc || !mk.rc.section) errors.push(`${mk.id}: no RC section`);
  }
  return errors;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  if (CHECK) {
    const mocks = loadWindow('tools/mock/data/full-mocks.js', 'ACE_FULL_MOCKS').mocks;
    const errs = checkMocks(mocks);
    errs.forEach((e) => console.log('  ERROR ' + e));
    console.log(errs.length ? `FAIL: ${errs.length} error(s)` : `PASS: ${mocks.length} full mocks`);
    process.exit(errs.length ? 1 : 0);
  }
  const { mocks, report } = compose();
  const errs = checkMocks(mocks);
  for (const [k, v] of Object.entries(report)) console.log(`${k}: ${v.eligible} of ${v.total} eligible; excluded ${JSON.stringify(v.excluded)}`);
  if (errs.length) { errs.forEach((e) => console.log('  ERROR ' + e)); process.exit(1); }
  const data = { version: new Date().toISOString().slice(0, 10), rules: 'five choices; key never the longest; even key letters per section; no item from The Climb or the Prometric mocks; every item blind re-solved', mocks };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, '/* GENERATED by scripts/compose-full-mocks.mjs. Do not edit by hand. */\nwindow.ACE_FULL_MOCKS = ' + JSON.stringify(data) + ';\n');
  console.log(`wrote ${path.relative(ROOT, OUT)}: ${mocks.length} full mocks (${mocks.map((m) => m.rc.section + '+' + m.pat.seed).join(', ')})`);
}
