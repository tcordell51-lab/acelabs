#!/usr/bin/env node
// Builds tools/minitests/bank.js (window.MINITEST_BANK) for The Climb. Never hand-edit bank.js.
//
//   node tools/minitests/assemble-minitests.mjs          write bank.js
//   node tools/minitests/assemble-minitests.mjs --check  validate and report, write nothing
//
// Source: tools/minitests/source/minitest-source.json, the authored and verified questions in the
// order their authors wrote the choices. (The original assembler read the authoring workflow's
// cell files from a scratchpad that no longer exists; this source is that output, plus the
// 2026-09-30 length repairs.)
//
// Steps:
//   1. validate every question: five choices, a valid key, an explanation, well-formed figure SVG
//   2. place the keys: within each test section every letter carries two of the ten keys and no
//      letter runs more than twice (scripts/debias/placement.cjs). Numeric choices authored in
//      ascending order stay where they are. Letter references in the explanation ("(B)",
//      "choice C") move with their choices.
//   3. refuse to write if the answer-bias gate would fail
//   4. write bank.js

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const { planLetters, moveKey, isOrderBound, namesLetterEntities, hasLetterRefs } = require(path.join(ROOT, 'scripts/debias/placement.cjs'));
const CHECK = process.argv.includes('--check');
const VERBOSE = process.argv.includes('--verbose');

const bank = JSON.parse(fs.readFileSync(path.join(HERE, 'source/minitest-source.json'), 'utf8'));
const problems = [];
const decode = (s) => String(s).replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<');

for (const t of bank.tests) {
  t.questions.forEach((q, k) => {
    const where = `test ${t.n} q${k + 1}`;
    q.stem = decode(q.stem);
    q.choices = q.choices.map(decode);
    q.explanation = decode(q.explanation);
    if (!Array.isArray(q.choices) || q.choices.length !== 5) problems.push(`${where}: needs 5 choices`);
    if (!(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.choices.length)) problems.push(`${where}: invalid key`);
    if (!String(q.explanation || '').trim()) problems.push(`${where}: no explanation`);
    if (new Set(q.choices.map((c) => c.trim())).size !== q.choices.length) problems.push(`${where}: duplicate choices`);
    if (q.figureSvg && !/^\s*<svg[\s\S]*<\/svg>\s*$/.test(q.figureSvg)) problems.push(`${where}: figure SVG is not well formed`);
  });
}

const remapped = [];
let moved = 0;
for (const t of bank.tests) {
  const bySec = new Map();
  t.questions.forEach((q, k) => (bySec.get(q.section) || bySec.set(q.section, []).get(q.section)).push({ q, k }));
  for (const [sec, list] of bySec) {
    // Kept in place: order-bound choices, questions that name things A, B, C (their explanation
    // letters cannot be told apart from choice letters), and numbers authored in ascending order.
    const entity = list.map(({ q }) => namesLetterEntities(q.stem, q.explanation));
    const hard = list.map(({ q }, i) => isOrderBound(q.choices) || (entity[i] && hasLetterRefs(q.explanation)));
    const fixed = list.map(({ q }, i) => hard[i] || isOrderBound(q.choices, { numericOrder: true }));
    // An ascending-number item gives way when keeping it would crowd its letter past a quarter.
    const hi = Math.ceil(list.length * 0.25);
    for (let L = 0; L < 5; L++) {
      let count = list.filter(({ q }, i) => fixed[i] && q.correct === L).length;
      for (let i = list.length - 1; i >= 0 && count > hi; i--) {
        if (fixed[i] && !hard[i] && list[i].q.correct === L) { fixed[i] = false; count--; }
      }
    }
    const plan = planLetters(list.map(({ q, k }, i) => ({ id: `climb${t.n}-${sec}-${k}`, n: q.choices.length, key: q.correct, fixed: fixed[i] })));
    list.forEach(({ q, k }, i) => {
      if (fixed[i]) return;
      const before = q.explanation;
      // A question that names things A, B, C moves only when its explanation cites no letters,
      // and then its explanation is left exactly as written.
      const r = moveKey(q, plan[i], { optsKey: 'choices', whyKey: entity[i] ? null : 'explanation' });
      if (r.moved) moved++;
      if (r.refs) remapped.push({ where: `test ${t.n} q${k + 1}`, before, after: q.explanation });
    });
  }
}

// Gate: same rules as scripts/gate-answer-bias.mjs, applied before anything is written.
const { analyzeSet, itemShape } = await import(path.join(ROOT, 'scripts/gate-answer-bias.mjs'));
for (const t of bank.tests) {
  const bySec = {};
  for (const q of t.questions) (bySec[q.section] = bySec[q.section] || []).push(itemShape(q.choices, q.correct));
  for (const [sec, shapes] of Object.entries(bySec)) {
    const r = analyzeSet(`Climb ${t.n} ${sec}`, shapes);
    for (const f of r.fails) problems.push(`${r.name}: ${f}`);
  }
}

console.log(`The Climb: ${bank.tests.length} tests, ${bank.tests.reduce((a, t) => a + t.questions.length, 0)} questions; ${moved} keys placed, ${remapped.length} explanations had letter references moved with their choices`);
if (VERBOSE) for (const r of remapped) console.log(`\n${r.where}\n  before: ${r.before}\n  after:  ${r.after}`);
if (problems.length) {
  console.error(`${problems.length} problem(s):\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
const head = '/* Mini-Test Bank (window.MINITEST_BANK) - 10 tests x 40 questions (Bio/GChem/OChem/QR),\n'
    + '   difficulty tiers 1-10, authored + adversarially verified. Do not hand-edit; regenerate via assemble-minitests.mjs. */\n';
const body = `${head}window.MINITEST_BANK = ${JSON.stringify(bank)};\n`;
if (CHECK) {
  // bank.js must be exactly what the source assembles to: a hand edit fails the test run.
  if (fs.readFileSync(path.join(HERE, 'bank.js'), 'utf8') !== body) {
    console.error('tools/minitests/bank.js does not match its source; run node tools/minitests/assemble-minitests.mjs');
    process.exit(1);
  }
  console.log('bank.js matches its source');
} else {
  fs.writeFileSync(path.join(HERE, 'bank.js'), body);
  console.log('wrote tools/minitests/bank.js');
}
