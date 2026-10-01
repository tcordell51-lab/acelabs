#!/usr/bin/env node
// Answer-pattern gate for every timed or scored set Ace Labs serves.
//
//   node scripts/gate-answer-bias.mjs            fail (exit 1) on any violation
//   node scripts/gate-answer-bias.mjs --report   print the per-set table as well
//   node scripts/gate-answer-bias.mjs --items    also list every item that still carries a length tell
//
// A test-wise student can beat a set without knowing the science when the key sits on one
// letter, when the keys run in streaks, or when the key is the longest choice. The ADA
// comparison of 2026-09-30 measured all three in the practice tests (Bio: the longest choice
// was the key 34 times in 40). This gate keeps that from coming back.
//
// Sets checked (fixed-form, served in authored order):
//   shared/dat-mock-tests.js   3 practice tests x 4 sections   (prometric-mock.html)
//   tools/minitests/bank.js    The Climb, 10 tests x 4 sections of 10
//
// Rules, per set:
//   - each letter carries 15% to 25% of the keys (5-choice sets; rounded to whole items)
//   - no run of 4 or more identical keys in served order
//   - the key is the unique longest choice in at most 25% of the items
//   - five choices in every section that uses five on the DAT (all of these do)
// Rules, per item (reported, and failed when --strict):
//   - the key is never the unique longest choice
//   - the key is never more than 15% longer than the mean distractor
// Structure choices (SMILES or drawn SVG) are skipped for length: the student never reads the string.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const REPORT = args.includes('--report') || args.includes('--items');
const ITEMS = args.includes('--items');
const STRICT = args.includes('--strict');

export const LETTERS = 'ABCDE';
export const plain = (s) => String(s ?? '').replace(/<[^>]*>/g, '').replace(/&[a-z#0-9]+;/gi, 'x').replace(/\s+/g, ' ').trim();

/** One served item, reduced to what the rules need. */
export function itemShape(opts, key, { structural = false } = {}) {
  const lens = opts.map((o) => plain(o).length);
  const kl = lens[key];
  const others = lens.filter((_, i) => i !== key);
  const meanD = others.reduce((a, b) => a + b, 0) / Math.max(1, others.length);
  const max = Math.max(...lens);
  const longest = !structural && kl === max && lens.filter((l) => l === max).length === 1;
  const over15 = !structural && kl > 1.15 * meanD && kl - meanD >= 2;
  return { n: opts.length, key, longest, over15, lens };
}

export function bandFor(n, choices = 5) {
  // 15% to 25% of the keys, widened to whole items (floor/ceil) so small sets are judged fairly.
  return { lo: Math.floor(n * 0.15), hi: Math.ceil(n * 0.25), choices };
}

export function analyzeSet(name, shapes, { choices = 5 } = {}) {
  const n = shapes.length;
  const dist = Array(choices).fill(0);
  let run = 0, maxRun = 0, prev = -1;
  for (const s of shapes) {
    if (s.key >= 0 && s.key < choices) dist[s.key]++;
    run = s.key === prev ? run + 1 : 1;
    prev = s.key;
    maxRun = Math.max(maxRun, run);
  }
  const longest = shapes.filter((s) => s.longest).length;
  const over15 = shapes.filter((s) => s.over15).length;
  const wrongCount = shapes.filter((s) => s.n !== choices).length;
  const band = bandFor(n, choices);
  const fails = [];
  dist.forEach((c, i) => { if (c < band.lo || c > band.hi) fails.push(`key ${LETTERS[i]} = ${c} of ${n} (band ${band.lo}-${band.hi})`); });
  if (maxRun >= 4) fails.push(`run of ${maxRun} identical keys`);
  if (longest / n > 0.25) fails.push(`longest-choice tell ${longest}/${n} (${Math.round((100 * longest) / n)}%) > 25%`);
  if (wrongCount) fails.push(`${wrongCount} item(s) without ${choices} choices`);
  return { name, n, dist, maxRun, longest, over15, wrongCount, fails };
}

function windowGlobal(rel, name) {
  const ctx = { window: {} };
  ctx.self = ctx.window;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), ctx);
  return ctx.window[name];
}

export function mockShape(q) {
  const structural = !!(q.opts_are_structures || (Array.isArray(q.opts_svg) && q.opts_svg.some(Boolean)));
  return itemShape(q.opts, q.correct, { structural });
}

export function collectSets() {
  const sets = [];
  const mocks = windowGlobal('shared/dat-mock-tests.js', 'DAT_MOCK_TESTS');
  for (const form of mocks) {
    for (const [sec, list] of Object.entries(form.sections)) {
      sets.push({ name: `${form.id} ${sec}`, items: list.map((q) => ({ id: q.id, shape: mockShape(q) })) });
    }
  }
  const climb = windowGlobal('tools/minitests/bank.js', 'MINITEST_BANK');
  for (const t of climb.tests) {
    const bySec = {};
    t.questions.forEach((q, k) => (bySec[q.section] = bySec[q.section] || []).push({ id: `climb${t.n}-${k + 1}`, shape: itemShape(q.choices, q.correct) }));
    for (const [sec, items] of Object.entries(bySec)) sets.push({ name: `Climb ${t.n} ${sec}`, items });
  }
  return sets;
}

function main() {
  const sets = collectSets();
  const results = sets.map((s) => ({ ...analyzeSet(s.name, s.items.map((i) => i.shape)), items: s.items }));
  const itemFails = [];
  for (const r of results) for (const it of r.items) if (it.shape.longest || it.shape.over15) itemFails.push(`${r.name} ${it.id}: ${it.shape.longest ? 'key is the longest choice' : 'key runs over 15% longer than the mean distractor'} (${it.shape.lens.join('/')}, key ${LETTERS[it.shape.key]})`);
  if (REPORT) {
    console.log('set'.padEnd(18), 'n'.padStart(3), ' A  B  C  D  E', ' run', ' longest', ' >15%');
    for (const r of results) {
      console.log(r.name.padEnd(18), String(r.n).padStart(3), r.dist.map((c) => String(c).padStart(2)).join(' '), String(r.maxRun).padStart(4),
        `${String(r.longest).padStart(4)} ${String(Math.round((100 * r.longest) / r.n)).padStart(3)}%`, String(r.over15).padStart(4), r.fails.length ? ' FAIL' : '');
    }
    if (ITEMS) for (const f of itemFails) console.log('  item:', f);
  }
  const failing = results.filter((r) => r.fails.length);
  for (const r of failing) console.error(`FAIL ${r.name}: ${r.fails.join('; ')}`);
  if (STRICT) for (const f of itemFails) console.error(`FAIL ${f}`);
  if (failing.length || (STRICT && itemFails.length)) {
    console.error(`answer-bias gate: ${failing.length} set(s) failing${STRICT ? `, ${itemFails.length} item(s)` : ''}`);
    process.exit(1);
  }
  console.log(`answer-bias gate: ${results.length} sets pass (${itemFails.length} item-level length notes)`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
