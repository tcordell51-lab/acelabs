#!/usr/bin/env node
// scripts/explainers/stamp-gate.mjs: no served sidecar without a matching stamp (rule 1.9).
//
//   node scripts/explainers/stamp-gate.mjs                 the repo: every section-index entry with
//                                                          status approved has a matching stamp
//   node scripts/explainers/stamp-gate.mjs --release DIR   a release tree (the deploy-clean.sh folder):
//                                                          every sidecar file under content/explainers/
//                                                          has a matching stamp, and every index entry
//                                                          points at a sidecar that is there
// A matching stamp: stamp text, sha256 of the sidecar, rendered-SVG sums present, and every
// listed renderer source unchanged (the SVG sums themselves are checked by render-check.mjs).
// Exit 1 on any failure.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stampProblems } from './stamps.mjs';

const args = process.argv.slice(2);
const ri = args.indexOf('--release');
const ROOT = ri >= 0 ? path.resolve(args[ri + 1]) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'content/explainers');
const readJson = (p, d) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return d; } };
const AP = (readJson(path.join(ROOT, 'docs/explainers/approvals.json'), {}).approvals) || {};
const issues = [];
let served = 0;
if (!fs.existsSync(OUT)) { console.log('stamp-gate: no content/explainers'); process.exit(0); }
const sections = (readJson(path.join(OUT, 'index.json'), {}).sections) || {};
const indexed = new Set();
for (const [sec, file] of Object.entries(sections)) {
  const ix = (readJson(path.join(OUT, file), {}).items) || {};
  for (const [q, en] of Object.entries(ix)) {
    if (en.aliasOf) continue;
    const fp = path.join(OUT, en.file);
    indexed.add(path.resolve(fp));
    if (ri < 0 && en.status !== 'approved') continue;
    if (!fs.existsSync(fp)) { issues.push(sec + ' index names ' + en.file + ', which is not there'); continue; }
    const p = stampProblems(ROOT, AP[q], fs.readFileSync(fp));
    if (p.length) issues.push('served ' + en.file + ' (' + q + '): ' + p.join('; '));
    else served++;
  }
}
if (ri >= 0) {
  // a sidecar no index names still ships as a file: it needs a stamp too
  const walk = (d, acc = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p, acc) : acc.push(p); } return acc; };
  for (const e of fs.readdirSync(OUT, { withFileTypes: true }).filter((x) => x.isDirectory())) {
    for (const f of walk(path.join(OUT, e.name)).filter((x) => x.endsWith('.json'))) {
      if (indexed.has(path.resolve(f))) continue;
      const sc = readJson(f, {});
      const p = stampProblems(ROOT, AP[sc.qid], fs.readFileSync(f));
      if (p.length) issues.push('unindexed sidecar ' + path.relative(ROOT, f) + ': ' + p.join('; '));
    }
  }
}
issues.forEach((x) => console.log('STAMP ' + x));
console.log('stamp-gate' + (ri >= 0 ? ' (release tree ' + ROOT + ')' : '') + ': ' + served + ' served sidecars carry a matching stamp, ' + issues.length + ' problems');
if (issues.length) process.exitCode = 1;
