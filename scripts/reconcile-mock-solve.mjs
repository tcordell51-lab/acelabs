#!/usr/bin/env node
// Merge blind re-solves of the full-mock science and QR items into the verification record.
//
//   node scripts/reconcile-mock-solve.mjs SOLVE_DIR
//
// Each SOLVE_DIR/<MOCK>-<sec>.json holds a blind solver's answers for one section of one
// full mock (letters as the solver saw them, item ids like FULL_1-bio-07). An item PASSES
// only when the solver's answer equals the key, nothing else was defensible, and the solver
// raised no note (wrong science, ambiguity, a length or wording tell, flashcard register).
// Every other item goes to tools/mock/verification/rejected.json with the reason, and
// passing items go to verified.json. The composer never draws a rejected item again.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VER = path.join(ROOT, 'tools/mock/verification');
const dir = process.argv[2];
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'tools/mock/data/full-mocks.js'), 'utf8'), ctx);
const mocks = ctx.window.ACE_FULL_MOCKS.mocks;
const L = 'ABCDE';
const load = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d);
const rejected = load(path.join(VER, 'rejected.json'), []);
const verified = load(path.join(VER, 'verified.json'), []);
const rej = new Map(rejected.map((r) => [r.id, r]));
const ok = new Map(verified.map((r) => [r.id, r]));
let pass = 0, fail = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
  const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const [mockId, sec] = s.pack.split('-');
  const mk = mocks.find((m) => m.id === mockId);
  if (!mk) continue;
  for (const a of s.answers) {
    const n = parseInt(a.id.split('-').pop(), 10) - 1;
    const it = mk.sections[sec][n];
    if (!it) continue;
    const key = L[it.correct];
    const reasons = [];
    if (a.answer !== key) reasons.push(`blind answer ${a.answer}, key ${key}`);
    if ((a.alsoDefensible || []).length) reasons.push(`also defensible: ${a.alsoDefensible.join(',')}`);
    if (a.note) reasons.push(a.note);
    if (reasons.length) { rej.set(it.id, { id: it.id, sec, why: reasons.join(' | '), stem: it.q.slice(0, 120) }); ok.delete(it.id); fail++; }
    else if (!rej.has(it.id)) { ok.set(it.id, { id: it.id, sec, mock: mockId }); pass++; }
  }
}
fs.mkdirSync(VER, { recursive: true });
fs.writeFileSync(path.join(VER, 'rejected.json'), JSON.stringify([...rej.values()], null, 1));
fs.writeFileSync(path.join(VER, 'verified.json'), JSON.stringify([...ok.values()], null, 1));
console.log(`this run: ${pass} passed, ${fail} rejected; totals verified ${ok.size}, rejected ${rej.size}`);
