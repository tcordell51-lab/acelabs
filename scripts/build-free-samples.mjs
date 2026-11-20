// Builds the free-account sample banks: a few questions per section, picked across topics.
//   node scripts/build-free-samples.mjs          write data/free/sample-*.json
//   node scripts/build-free-samples.mjs --check  fail when a sample is out of date
// Free accounts (email sign-in, no pass) get these in place of the full banks (see SAMPLE_FORMS in
// netlify/lib/ace-access.mjs). How many per section is Thomas's call: change PER_BANK.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PER_BANK = { 'bio.json': 10, 'gchem.json': 10, 'ochem.json': 10, 'qr-climb.json': 7, 'qr-dat.json': 3 };

export function pick(items, n) {
  // one per topic in turn (topics in bank order, items by id), so the sample shows the range
  const byTopic = new Map();
  for (const it of items) { if (!byTopic.has(it.topic)) byTopic.set(it.topic, []); byTopic.get(it.topic).push(it); }
  for (const list of byTopic.values()) list.sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const out = [], lists = [...byTopic.values()];
  for (let round = 0; out.length < n && lists.some((l) => l.length > round); round++) for (const l of lists) { if (out.length >= n) break; if (l[round]) out.push(l[round]); }
  return out;
}

export function build() {
  const files = {};
  for (const [name, n] of Object.entries(PER_BANK)) {
    const bank = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', name), 'utf8'));
    const items = pick(bank.items, n);
    files['sample-' + name] = JSON.stringify({ ...bank, source: `free sample of ${name} (scripts/build-free-samples.mjs)`, count: items.length, sample: true, fullCount: bank.items.length, items }, null, 1) + '\n';
  }
  return files;
}

if (process.argv[1] && process.argv[1].endsWith('build-free-samples.mjs')) {
  const check = process.argv.includes('--check');
  let stale = 0;
  for (const [f, text] of Object.entries(build())) {
    const p = path.join(ROOT, 'data', 'free', f);
    if (check) { if (!fs.existsSync(p) || fs.readFileSync(p, 'utf8') !== text) { console.error('out of date: data/free/' + f); stale++; } }
    else fs.writeFileSync(p, text);
  }
  if (check && stale) { console.error('run: node scripts/build-free-samples.mjs'); process.exit(1); }
  console.log(check ? 'free samples up to date' : 'wrote free samples');
}
