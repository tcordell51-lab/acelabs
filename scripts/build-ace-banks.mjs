#!/usr/bin/env node
// build-ace-banks.mjs : one item format for every multiple-choice bank.
//
//   node scripts/build-ace-banks.mjs           write data/*.json
//   node scripts/build-ace-banks.mjs --check   exit 1 if data/*.json is stale or an item breaks the format
//
// Item format (see shared/ace-question.js):
//   { id, section, topic, topicName, stem, choices[5], answer (0-4), why,
//     traps?: [5] (reason each wrong choice is wrong; null at the answer),
//     trick?: one line }
// Nothing is written here that the source bank does not contain: no trap or
// trick is invented. Items without exactly five choices or without an
// explanation are left out and counted.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const clean = (s) => String(s == null ? '' : s).replace(/\s*—\s*/g, ', ').replace(/\s+/g, ' ').trim();
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Gen Chem topic names come from the engine's own skill table.
const gcSrc = read('tools/gc/index.html');
const GC_NAMES = {};
for (const m of gcSrc.matchAll(/\{id:'([a-z0-9-]+)',\s*tier:\d+,\s*name:'([^']+)'/g)) GC_NAMES[m[1]] = m[2].replace(/\s*\(.*\)$/, '').replace(/&amp;/g, '&');
const GC_EXTRA = { kinetics: 'Kinetics', equilibrium: 'Equilibrium', 'acid-base': 'Acids and Bases', redox: 'Redox', gases: 'Gases', thermo: 'Thermochemistry', stoich: 'Stoichiometry', liquids: 'Liquids' };

function gchem() {
  const src = JSON.parse(read('games/gchem.json'));
  const out = [], skipped = [];
  for (const q of src) {
    if (!Array.isArray(q.opts) || q.opts.length !== 5 || !q.why) { skipped.push(q.id); continue; }
    out.push({ id: 'gc:' + q.id, section: 'gchem', topic: q.topic, topicName: clean(GC_NAMES[q.topic] || GC_EXTRA[q.topic] || q.topic).replace(/ & /g, ' and '),
      difficulty: q.difficulty || 1, stem: clean(q.q), choices: q.opts.map(clean), answer: q.correct, why: clean(q.why) });
  }
  return { name: 'gchem', source: 'games/gchem.json', items: out, skipped };
}

function qrClimb() {
  const w = {}; vm.runInContext(read('tools/minitests/bank.js'), vm.createContext({ window: w }));
  const out = [], skipped = [];
  for (const t of w.MINITEST_BANK.tests) for (const q of t.questions) {
    if (q.section !== 'qr') continue;
    if (!Array.isArray(q.choices) || q.choices.length !== 5 || !q.explanation) { skipped.push(q.stem.slice(0, 40)); continue; }
    out.push({ id: 'qr:climb-' + hash(q.stem), section: 'qr', topic: slug(q.topic), topicName: clean(q.topic).replace(/ & /g, ' and ').replace(/\s*\(.*\)$/, ''),
      difficulty: t.tier, stem: clean(q.stem), choices: q.choices.map(clean), answer: q.correct, why: clean(q.explanation) });
  }
  return { name: 'qr-climb', source: 'tools/minitests/bank.js (QR items)', items: out, skipped };
}

const problems = [];
function validate(bank) {
  const ids = new Set();
  for (const it of bank.items) {
    const where = bank.name + ' ' + it.id;
    if (ids.has(it.id)) problems.push(where + ': duplicate id'); ids.add(it.id);
    if (it.choices.length !== 5) problems.push(where + ': not five choices');
    if (new Set(it.choices).size !== 5) problems.push(where + ': two identical choices');
    if (!(Number.isInteger(it.answer) && it.answer >= 0 && it.answer < 5)) problems.push(where + ': answer out of range');
    if (!it.stem || !it.why || !it.topic || !it.topicName) problems.push(where + ': missing stem, why or topic');
    if (/—/.test(JSON.stringify(it))) problems.push(where + ': em dash');
  }
}

const check = process.argv.includes('--check');
let stale = 0;
for (const bank of [gchem(), qrClimb()]) {
  validate(bank);
  const file = path.join(ROOT, 'data', bank.name + '.json');
  const body = JSON.stringify({ format: 1, section: bank.items[0].section, source: bank.source, count: bank.items.length, items: bank.items });
  if (check) { if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== body) { stale++; console.error('stale: data/' + bank.name + '.json (run node scripts/build-ace-banks.mjs)'); } }
  else { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, body); }
  const topics = new Set(bank.items.map((i) => i.topic)).size;
  console.log(`${bank.name}: ${bank.items.length} items, ${topics} topics, ${bank.skipped.length} left out`);
}
if (problems.length || stale) { for (const p of problems.slice(0, 30)) console.error('  ' + p); console.error(`build-ace-banks: ${problems.length} format problem(s), ${stale} stale file(s)`); process.exit(1); }
