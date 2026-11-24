#!/usr/bin/env node
// Trims one padded wrong choice in each Reading question listed in scripts/mock-content/rc-key-length.json,
// so the keyed choice is not "the second longest" far more often than chance (see scripts/check-key-length.mjs).
// Each entry lists [old wrong choice, shorter wording with the same meaning] pairs. Idempotent. Then run npm run build:rc.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const map = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/mock-content/rc-key-length.json'), 'utf8'));
const dir = path.join(ROOT, 'tools/rc/data/passages');
let done = 0, bad = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
  const raw = fs.readFileSync(path.join(dir, f), 'utf8'), p = JSON.parse(raw);
  let touched = false;
  for (const q of p.questions) {
    const e = map[q.id]; if (!e) continue;
    for (const [was, now] of e) {
      const i = q.choices.indexOf(was), j = q.choices.indexOf(now);
      if (i < 0 && j < 0) { console.log('  ERROR ' + q.id + ': choice not found: ' + was); bad++; continue; }
      if (i === q.key || j === q.key) { console.log('  ERROR ' + q.id + ': that is the keyed choice'); bad++; continue; }
      if (now.length >= was.length) { console.log('  ERROR ' + q.id + ': the new wording is not shorter'); bad++; continue; }
      if (i >= 0) { q.choices[i] = now; touched = true; }
    }
    done++;
  }
  if (touched) fs.writeFileSync(path.join(dir, f), JSON.stringify(p, null, raw.includes('\n  "') ? 2 : raw.includes('\n "') ? 1 : 0) + (raw.endsWith('\n') ? '\n' : ''));
}
console.log(`${done} of ${Object.keys(map).length} questions set` + (bad ? `, ${bad} problem(s)` : ''));
process.exit(bad || done !== Object.keys(map).length ? 1 : 0);
