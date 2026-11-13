#!/usr/bin/env node
// scripts/explainers/stamp.mjs: write auto-approve stamps (build spec rule 1.9) into
// docs/explainers/approvals.json for items that passed the SA-C review unchanged.
//
//   node scripts/explainers/stamp.mjs --svg FILE --review REF QID...
//     --svg FILE     the { qid: { '390', '1280' } } sums from render-check.mjs --svg-out
//     --review REF   where the SA-C verdicts live (recorded in each stamp)
//     --at DATE      the stamping date (default today, UTC)
//
// Refuses an item that is not built and published, is held, fails the build gates,
// or has no SVG sums. Run build.mjs first; run it again after (the index status turns
// approved), then render-check.mjs to confirm the stamped pictures still match.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { STAMP_TEXT, sha256, rendererFiles, fileSums } from './stamps.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const qids = args.filter((a, i) => !a.startsWith('--') && !['--svg', '--review', '--at'].includes(args[i - 1]));
const svgs = JSON.parse(fs.readFileSync(path.resolve(opt('--svg')), 'utf8'));
const at = opt('--at') || new Date().toISOString().slice(0, 10);
const review = opt('--review') || null;
const rd = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const apPath = 'docs/explainers/approvals.json';
const AP = JSON.parse(rd(apPath));
AP.note = 'Approval stamps: qid -> stamp. An auto-approve stamp (build spec rule 1.9) carries stamp, by, at, checksum (sha256 of the sidecar file), svg (sha256 of the rendered picture at 390 and 1280 px), files (sha256 of every renderer source it draws with), guard and review. A later change to any of them voids the stamp and the item returns to draft (build.mjs, render-check.mjs, stamp-gate.mjs, deploy-clean.sh). Thomas\'s own approvals use by, at, checksum and guard.';
const IX = JSON.parse(rd('docs/explainers/index.json')).items;
let bad = 0, n = 0;
for (const q of qids) {
  const it = IX[q];
  const coach = it && JSON.parse(rd('docs/explainers/' + it.file));
  const why = !it ? 'not built' : !coach.sidecar ? 'not published (' + (coach.held || 'gate issues') + ')' : !it.pass ? 'build gates fail' : !svgs[q] ? 'no SVG sums' : null;
  if (why) { console.log('REFUSED ' + q + ': ' + why); bad++; continue; }
  const text = rd(coach.sidecar), sc = JSON.parse(text);
  AP.approvals[q] = {
    stamp: STAMP_TEXT, by: 'auto-approve rail (SA-C review, G1-FIN)', at,
    checksum: sha256(text), svg: { 390: svgs[q]['390'], 1280: svgs[q]['1280'] },
    files: fileSums(ROOT, rendererFiles(ROOT, sc)),
    guard: { keyText: sc.bank.keyText, stemHash: sc.bank.stemHash },
    review
  };
  n++;
}
AP.approvals = Object.fromEntries(Object.keys(AP.approvals).sort().map((k) => [k, AP.approvals[k]]));
fs.writeFileSync(path.join(ROOT, apPath), JSON.stringify(AP, null, 1) + '\n');
console.log('stamp: ' + n + ' stamped, ' + bad + ' refused; ' + Object.keys(AP.approvals).length + ' stamps in ' + apPath);
if (bad) process.exitCode = 1;
