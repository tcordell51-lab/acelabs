#!/usr/bin/env node
// build-free-diagnostic.mjs : the fixed free form of the diagnostic.
//
//   node scripts/build-free-diagnostic.mjs           write data/free/diagnostic-bank.json
//   node scripts/build-free-diagnostic.mjs --check   exit 1 when the file is out of date
//
// /diagnostic.html reads scripts/dat-mock-bank.json (about 2,400 questions) and draws 15
// per section. With the sign-in on, a signed-out visitor is served this file in its place
// (FREE_FORMS in netlify/lib/ace-access.mjs): the same pools the page filters to, cut to a
// fixed 15 per section, so the free diagnostic works and the full bank stays behind the
// sign-in. The pick is stable (sorted by id, evenly spaced) so the file only changes when
// the bank does.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'scripts/dat-mock-bank.json');
const OUT = path.join(ROOT, 'data/free/diagnostic-bank.json');
const PER = 15;

const bank = JSON.parse(fs.readFileSync(SRC, 'utf8'));
// the same filters as loadBank() in diagnostic.html
const pools = {
  bio: (bank.bio || []).filter((q) => q._rewritten === true || q._expert === true),
  gc: bank.gc || [],
  ochem: bank.ochem || [],
  qr: (bank.qr || []).filter((q) => (q.id && /_xp/i.test(q.id)) || q.why),
};
function pick(pool) {
  const sorted = pool.slice().sort((a, b) => String(a.id).localeCompare(String(b.id)));
  if (sorted.length <= PER) return sorted;
  const out = [];
  for (let i = 0; i < PER; i++) out.push(sorted[Math.floor((i * sorted.length) / PER)]);
  return out;
}
const form = {};
for (const k of ['qr', 'gc', 'bio', 'ochem']) form[k] = pick(pools[k]);
const text = JSON.stringify(form) + '\n';

if (process.argv.includes('--check')) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (cur !== text) { console.error('data/free/diagnostic-bank.json is out of date: run node scripts/build-free-diagnostic.mjs'); process.exit(1); }
  console.log(`free diagnostic form is current (${Object.values(form).reduce((n, a) => n + a.length, 0)} questions)`);
} else {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, text);
  console.log(`wrote ${path.relative(ROOT, OUT)}: ${Object.entries(form).map(([k, a]) => `${k} ${a.length}`).join(', ')}`);
}
