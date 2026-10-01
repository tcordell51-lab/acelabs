#!/usr/bin/env node
// Applies the answer-pattern repairs to the three practice tests and keeps the source bank in step.
//
//   node scripts/debias/apply-debias.mjs          rewrite shared/dat-mock-tests.js, scripts/dat-mock-bank.json, games/{bio,gchem,qr}.json
//   node scripts/debias/apply-debias.mjs --check  report only
//
// Inputs, all data so every change is reviewable item by item:
//   scripts/debias/edits/edits-*.json   rewritten choices (authored order, key index unchanged), fifth
//                                       choices where the section was short, occasional stem/explanation repairs
//   scripts/debias/fixes.json           broken items (wrong or doubled keys, draft text), by id and file
// Then scripts/debias/placement.cjs spreads the keys across A-E in every section.
//
// Safe to run twice: edited items are reset to their authored order before placement, and the
// placement is deterministic. Practice-test explanations name choices by content, never by letter
// (an automatic remap mistook "poly(A)" and "(B and H)" for letters), so they are left untouched.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { planLetters, moveKey, isOrderBound } = require('./placement.cjs');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CHECK = process.argv.includes('--check');
const at = (p) => path.join(ROOT, p);

function loadMocks() {
  const src = fs.readFileSync(at('shared/dat-mock-tests.js'), 'utf8');
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  const header = src.slice(0, src.indexOf('window.DAT_MOCK_TESTS'));
  return { header, tests: JSON.parse(JSON.stringify(ctx.window.DAT_MOCK_TESTS)) };
}

const edits = new Map();
for (const f of fs.readdirSync(at('scripts/debias/edits')).filter((x) => x.endsWith('.json')).sort()) {
  for (const e of JSON.parse(fs.readFileSync(at(`scripts/debias/edits/${f}`), 'utf8'))) edits.set(e.uid, e);
}
const fixes = JSON.parse(fs.readFileSync(at('scripts/debias/fixes.json'), 'utf8'));

function applyEdit(q, e) {
  const grew = e.opts.length - q.opts.length;
  // On a rerun the choices already sit in placed order; put any per-choice arrays (drawn
  // structures) back in authored order before the edit resets the text, so they stay aligned.
  const at = new Map(q.opts.map((o, i) => [o, i]));
  if (e.opts.every((o) => at.has(o))) {
    for (const k of ['opts_smiles', 'opts_svg']) {
      if (Array.isArray(q[k])) q[k] = e.opts.map((o) => q[k][at.get(o)] ?? null);
    }
  }
  q.opts = e.opts.slice();
  q.correct = e.key;
  if (Array.isArray(e.opts_smiles)) q.opts_smiles = e.opts_smiles.slice();
  if (e.stem) q.q = e.stem;
  if (e.why) q.why = e.why;
  if (Array.isArray(q.opts_smiles)) while (q.opts_smiles.length < q.opts.length) q.opts_smiles.push(null);
  if (Array.isArray(q.opts_svg)) while (q.opts_svg.length < q.opts.length) q.opts_svg.push(null);
  return grew;
}
function applyFix(q, f) {
  if (f.q) q.q = f.q;
  q.opts = f.opts.slice();
  q.correct = f.correct;
  if (f.opts_smiles) q.opts_smiles = f.opts_smiles.slice();
  else if (Array.isArray(q.opts_smiles)) q.opts_smiles = q.opts.map(() => null);
  if (f.why) q.why = f.why;
}

const { header, tests } = loadMocks();
const report = { edited: 0, fifth: 0, fixed: [], moved: 0, letterRefs: 0, unmoved: [] };
for (const form of tests) {
  for (const [sec, list] of Object.entries(form.sections)) {
    for (const q of list) {
      const e = edits.get(`mock:${q.id}`);
      if (e) { if (applyEdit(q, e) > 0) report.fifth++; report.edited++; }
      const f = fixes.find((x) => x.id === q.id && x.files.includes('shared/dat-mock-tests.js'));
      if (f) { applyFix(q, f); report.fixed.push(q.id); }
    }
    // Drawn structures on only some choices mark those choices out (often the key). Unless every
    // choice has a drawing, the choices are shown as text only.
    for (const q of list) {
      if (Array.isArray(q.opts_smiles) && q.opts_smiles.some(Boolean) && !(q.opts_smiles.length >= q.opts.length && q.opts.every((_, i) => q.opts_smiles[i]))) {
        q.opts_smiles = q.opts.map(() => null);
        report.drawingsCleared = (report.drawingsCleared || 0) + 1;
      }
    }
    const plan = planLetters(list.map((q) => ({ id: q.id, n: q.opts.length, key: q.correct, fixed: isOrderBound(q.opts) })));
    list.forEach((q, i) => {
      if (isOrderBound(q.opts)) { if (plan[i] !== q.correct) report.unmoved.push(q.id); return; }
      const r = moveKey(q, plan[i], { optsKey: 'opts', whyKey: null, parallel: ['opts_smiles', 'opts_svg'] });
      if (r.moved) report.moved++;
      report.letterRefs += r.refs;
    });
  }
}

// The bank the practice tests were composed from: every item that sits in a test takes the
// test's final form, so a recomposition starts from the repaired text.
const bank = JSON.parse(fs.readFileSync(at('scripts/dat-mock-bank.json'), 'utf8'));
const byId = new Map();
for (const form of tests) for (const list of Object.values(form.sections)) for (const q of list) byId.set(q.id, q);
let synced = 0;
for (const [sec, list] of Object.entries(bank)) {
  if (!Array.isArray(list)) continue;
  bank[sec] = list.map((b) => {
    const t = byId.get(b.id);
    if (t) { synced++; return JSON.parse(JSON.stringify(t)); }
    const f = fixes.find((x) => x.id === b.id && x.files.includes('scripts/dat-mock-bank.json'));
    if (f) { const c = JSON.parse(JSON.stringify(b)); applyFix(c, f); report.fixed.push(`${b.id} (bank)`); return c; }
    return b;
  });
}
// The game banks carry many of the same items (same ids). They shuffle choices at play time, so
// only the text matters there: take the repaired text, fix the broken ones.
const GAME_FILES = ['games/bio.json', 'games/gchem.json', 'games/qr.json'];
const games = {};
let gameSynced = 0;
for (const file of GAME_FILES) {
  games[file] = JSON.parse(fs.readFileSync(at(file), 'utf8')).map((g) => {
    const t = byId.get(g.id);
    if (t) { gameSynced++; return { ...g, q: t.q, opts: t.opts.slice(), correct: t.correct, ...(t.why ? { why: t.why } : {}) }; }
    const f = fixes.find((x) => x.id === g.id && x.files.includes(file));
    if (f) { const c = { ...g }; applyFix(c, f); report.fixed.push(`${g.id} (${file})`); return c; }
    return g;
  });
}

console.log(`practice tests: ${report.edited} items rewritten (${report.fifth} given a fifth choice), ${report.moved} keys moved, ${report.letterRefs} letter references in explanations remapped`);
if (report.drawingsCleared) console.log(`${report.drawingsCleared} items had drawings on only some choices; shown as text only now`);
console.log(`bank: ${synced} items synced from the tests; fixes applied: ${report.fixed.join(', ')}`);
if (report.unmoved.length) console.log(`left in place (order-bound choices): ${report.unmoved.join(', ')}`);
if (!CHECK) {
  fs.writeFileSync(at('shared/dat-mock-tests.js'), `${header}window.DAT_MOCK_TESTS = ${JSON.stringify(tests)};`);
  fs.writeFileSync(at('scripts/dat-mock-bank.json'), JSON.stringify(bank));
  for (const file of GAME_FILES) fs.writeFileSync(at(file), JSON.stringify(games[file]));
  console.log(`wrote shared/dat-mock-tests.js, scripts/dat-mock-bank.json, ${GAME_FILES.join(', ')} (${gameSynced} game items synced)`);
}
