#!/usr/bin/env node
// Build gate for every explanation a student reads in Full-Length Tests 1 to 4
// (tools/mock/data/full-mocks.js: why, steps, traps, check).
//
// Fails on:
//   - a choice named by letter or position ("option A", "choice 3", "opt[0]", "index 0", "(B)"):
//     the choices are reordered when a test is composed, so a letter in an explanation goes stale
//   - author notes that were never meant for students ("correct=0", "verified", "keyed", "distractor",
//     "two-concept", "all valid", "in DAT scope", "exactly one correct")
//   - raw SMILES strings in the text (students see the drawn structure, not the string)
//   - em or en dashes
//   - the scheduled layer being out of date (scripts/apply-mock-content.mjs --check)
// and, for every section listed in STANDARD below, on anything short of docs/EXPLANATION-STANDARD.md:
//   an answer line, 3 to 5 steps of at most 14 words, one trap line per wrong choice, a check-yourself pair.
//
//   node scripts/gate-mock-explanations.mjs            gate
//   node scripts/gate-mock-explanations.mjs --report   also print the coverage table

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load, apply } from './apply-mock-content.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = process.argv.includes('--report');
// Sections whose every item must meet the full standard. Add a section here once it is finished.
const STANDARD = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/mock-content/standard.json'), 'utf8'));

const LETTER = [
  /\b(?:[Oo]ptions?|[Cc]hoices?|[Aa]nswers?|[Ll]etters?|[Oo]pts?|[Dd]istractors?)\s*[\[(]?\s*(?:[A-E]|[0-5])\s*[\])]?(?=[\s.,;:)\/]|$)/,
  /\bopt\[/i, /\bindex\s*\d/i, /\((?:[A-D])\)/, /\(E\)(?![-\w])/, /\[[0-5]\]/,
];
const NOTES = [/correct\s*=\s*\d/i, /\bverified\b/i, /\bkeyed\b/i, /\bdistractors?\b/i, /two-concept/i, /\ball valid\b/i, /in DAT scope/i,
  /exactly one correct/i, /single correct answer/i, /recognition-level/i, /\bFMO\b/, /\(no mechanism drawn\)/i];
const DASH = /[\u2014\u2013]/;
// A SMILES string: one unbroken token of organic-subset atoms with ring digits, branches or bond symbols and no H.
const smilesToken = (t) => t.length >= 6 && /^[BCNOPSFIclnos0-9@+\-\[\]()=#\/\\.]+$/.test(t) && /[()=#]|\d/.test(t) && (t.match(/[Cc]/g) || []).length >= 3 && !/^[\d.+\-()]+$/.test(t) && !/^C\d+(?:[-=]C\d+)+$/.test(t);
const hasSmiles = (s) => String(s).split(/[\s,;:]+/).map((t) => t.replace(/^[("'`]+|[)"'`.?!]+$/g, '')).some(smilesToken);
const words = (s) => String(s).replace(/\*\*/g, '').trim().split(/\s+/).filter(Boolean).length;

const data = load();
const errors = [];
const table = {};
const fresh = apply(JSON.parse(JSON.stringify(data)));
fresh.problems.forEach((p) => errors.push('layer: ' + p));
if (JSON.stringify(fresh.data) !== JSON.stringify(data)) errors.push('layer: full-mocks.js is stale; run node scripts/apply-mock-content.mjs');

for (const mk of data.mocks) for (const [sec, list] of Object.entries(mk.sections)) {
  const row = table[mk.id + ' ' + sec] = { n: list.length, steps: 0, traps: 0, check: 0, full: 0 };
  const strict = (STANDARD[mk.id] || []).includes(sec);
  list.forEach((it, i) => {
    const at = `${mk.id} ${sec} #${i + 1} ${it.id}`;
    const texts = [['why', it.why], ...(it.steps || []).map((s, k) => ['step ' + (k + 1), s]), ...(it.traps || []).map((t, k) => ['trap ' + (k + 1), t]),
      ...(it.check ? [['check', it.check.q], ['check answer', it.check.a]] : [])].filter((x) => x[1]);
    for (const [name, t] of texts) {
      for (const re of LETTER) if (re.test(t)) { errors.push(`${at}: ${name} names a choice by letter or position (${(t.match(re) || [''])[0]})`); break; }
      for (const re of NOTES) if (re.test(t)) { errors.push(`${at}: ${name} carries an author note (${(t.match(re) || [''])[0]})`); break; }
      if (DASH.test(t)) errors.push(`${at}: ${name} has an em or en dash`);
      if (hasSmiles(t)) errors.push(`${at}: ${name} shows a raw structure string`);
    }
    const wrong = it.opts.map((_, k) => k).filter((k) => k !== it.correct);
    const hasSteps = Array.isArray(it.steps) && it.steps.length >= 3 && it.steps.length <= 5;
    const hasTraps = Array.isArray(it.traps) && wrong.every((k) => it.traps[k]);
    const hasCheck = !!(it.check && it.check.q && it.check.a);
    if (hasSteps) row.steps++; if (hasTraps) row.traps++; if (hasCheck) row.check++; if (hasSteps && hasTraps && hasCheck) row.full++;
    if (it.traps && it.traps[it.correct]) errors.push(`${at}: trap text on the keyed choice`);
    if (it.steps) it.steps.forEach((s, k) => { if (words(s) > 14) errors.push(`${at}: step ${k + 1} runs ${words(s)} words (14 at most)`); });
    if (strict) {
      if (!it.why || it.why.length < 20) errors.push(`${at}: no answer line`);
      if (!hasSteps) errors.push(`${at}: needs 3 to 5 steps`);
      if (!hasTraps) errors.push(`${at}: needs one trap line per wrong choice`);
      if (!hasCheck) errors.push(`${at}: needs a check-yourself question and answer`);
      if (it.why && it.why.length > (sec === 'bio' ? 600 : 420)) errors.push(`${at}: answer paragraph runs ${it.why.length} characters (${sec === 'bio' ? 600 : 420} at most)`);
      (it.traps || []).forEach((t, k) => { if (t && t.length > 240) errors.push(`${at}: trap ${k + 1} runs ${t.length} characters (240 at most)`); });
    }
  });
}
// Drill links: every science and QR stop used in Tests 1 to 4 has a target, and the target exists
// (a hub topic with questions in that hub's bank, or a page on disk).
{
  const win = {};
  new Function('window', fs.readFileSync(path.join(ROOT, 'tools/mock/explain.js'), 'utf8'))(win);
  const EX = win.AceMockExplain;
  const SUB = { bio: ['Biology', 'data/bio.json'], gc: ['Gen Chem', 'data/gchem.json'], ochem: ['OChem', 'data/ochem.json'], qr: ['QR', 'data/qr-dat.json', 'data/qr-climb.json'] };
  const topicsOf = {};
  const seen = new Set();
  for (const mk of data.mocks) for (const [sec, list] of Object.entries(mk.sections)) {
    if (!SUB[sec]) continue;
    for (const it of list) {
      if (seen.has(sec + it.stop)) continue; seen.add(sec + it.stop);
      const d = EX.drill(SUB[sec][0], it.stop);
      if (!d) { errors.push(`drill: ${sec} stop ${it.stop} has no drill link`); continue; }
      const m = /^([^?#]+)\?topic=(.+)$/.exec(d.href);
      if (m) {
        const t = topicsOf[sec] || (topicsOf[sec] = new Set(SUB[sec].slice(1).flatMap((f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')).items.map((x) => x.topic))));
        if (!t.has(decodeURIComponent(m[2]))) errors.push(`drill: ${sec} stop ${it.stop} links topic ${m[2]}, which has no questions in that hub's bank`);
      } else if (!fs.existsSync(path.join(ROOT, d.href.replace(/[?#].*$/, '')))) errors.push(`drill: ${sec} stop ${it.stop} links ${d.href}, which is not on disk`);
    }
  }
  if (!/#start\\\/type\\\//.test(fs.readFileSync(path.join(ROOT, 'tools/rc/rc.js'), 'utf8'))) errors.push('drill: tools/rc/rc.js no longer opens #start/type/<type>');
}
if (REPORT) {
  console.log('section'.padEnd(16), 'items steps traps check  full');
  for (const [k, r] of Object.entries(table)) console.log(k.padEnd(16), String(r.n).padStart(5), String(r.steps).padStart(5), String(r.traps).padStart(5), String(r.check).padStart(5), String(r.full).padStart(5));
}
errors.slice(0, 80).forEach((e) => console.log('  ERROR ' + e));
if (errors.length > 80) console.log(`  ... and ${errors.length - 80} more`);
console.log(errors.length ? `FAIL: ${errors.length} explanation problem(s) in Tests 1 to 4` : 'PASS: explanations in Tests 1 to 4 carry no choice letters, author notes or structure strings');
process.exit(errors.length ? 1 : 0);
