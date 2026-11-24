#!/usr/bin/env node
// Where does the keyed choice fall in length order? A student who learns "pick the second longest"
// should gain nothing. For every section of Full-Length Tests 1 to 4 and every Reading section,
// this prints how many keys are the shortest choice (rank 0) up to the longest (rank 4) and fails
// when any one rank holds more than 35 percent of the section's keys (chance is 20 percent).
// Skipped: structure choices, purely numeric choices, and the fixed quantitative comparison and
// data sufficiency choices, where length says nothing; and any section with under 20 text items (too few to tell a habit from chance).
//   node scripts/check-key-length.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIMIT = 0.35;
function load(rel, name) { const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), ctx); return ctx.window[name]; }
const rank = (opts, key) => opts.filter((o, i) => i !== key && String(o).length < String(opts[key]).length).length;
const isText = (opts) => !opts.every((o) => /^[-$]?[\d.,/ ]+[a-zA-Z%°]*$/.test(String(o).trim()));
const rows = [];
for (const mk of load('tools/mock/data/full-mocks.js', 'ACE_FULL_MOCKS').mocks) for (const [sec, list] of Object.entries(mk.sections)) {
  const rc = [0, 0, 0, 0, 0];
  list.forEach((it) => { if (!it.os && !it.fmt && isText(it.opts)) rc[rank(it.opts, it.correct)]++; });
  rows.push([mk.id + ' ' + sec, rc]);
}
const RC = load('tools/rc/data/bank.js', 'ACE_RC_BANK');
const P = {}; (Array.isArray(RC.passages) ? RC.passages : Object.values(RC.passages)).forEach((p) => { P[p.id] = p; });
for (const s of RC.sections) {
  const rc = [0, 0, 0, 0, 0];
  s.passages.forEach((id) => P[id].questions.forEach((q) => { rc[rank(q.choices, q.key)]++; }));
  rows.push(['Reading ' + s.id, rc]);
}
let bad = 0;
console.log('section'.padEnd(16) + '  n   shortest ... longest   highest share');
for (const [name, rc] of rows) {
  const n = rc.reduce((a, b) => a + b, 0), top = Math.max(...rc), share = n ? top / n : 0, fail = n >= 20 && share > LIMIT;
  if (fail) bad++;
  console.log(name.padEnd(16) + String(n).padStart(3) + '   ' + rc.map((c) => String(c).padStart(3)).join(' ') + '   ' + (n >= 20 ? Math.round(share * 100) + '%' : 'too few to judge') + (fail ? '  FAIL' : ''));
}
console.log(bad ? `FAIL: ${bad} section(s) put more than 35 percent of keys at one length rank` : 'PASS: no length rank holds more than 35 percent of any section\'s keys');
process.exit(bad ? 1 : 0);
