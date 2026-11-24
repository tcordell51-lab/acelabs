#!/usr/bin/env node
/*
  pat-pf-check.js : no pattern-folding review may call a non-cube solid a "cube".

  Builds the 15 fixed PAT tests and, for every pattern-folding item that folds into
  a box, triangular prism, pyramid or tetrahedron, collects everything the review
  shows for each wrong choice: the trap label (PAT.test.TRAP_NAMES) and the worked
  explanation (PAT.explain) with that choice picked. If the review page still has
  the old inline trap notes (PF_WHY in tools/pat/test.html), those are checked too.
  Any "cube" or "cubes" in that text is a bad note.

  Usage: node scripts/qrp/pat-pf-check.js [--root DIR] [--tests 1-15] [--verbose]
    --root   repository root to check (default: this checkout), so an older
             export can be measured with the same script
  Exit 0 when there are no bad notes, 1 otherwise.
*/
'use strict';
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const ROOT = path.resolve(opt('--root', path.join(__dirname, '..', '..')));
const VERBOSE = args.includes('--verbose');
const range = String(opt('--tests', '1-15')).split('-').map(Number);
const TESTS = []; for (let t = range[0]; t <= (range[1] || range[0]); t++) TESTS.push(t);

const ENGINE = path.join(ROOT, 'tools', 'pat', 'engine');
const FILES = ['solid', 'keyholes', 'keyholes-csg', 'tfe', 'tfe-csg', 'angles', 'holepunch', 'cubes', 'patternfold', 'patternfold-poly', 'test', 'explain'];
const PAT = require(path.join(ENGINE, 'pat-core.js'));
FILES.forEach((n) => { const f = path.join(ENGINE, 'pat-' + n + '.js'); if (fs.existsSync(f)) require(f); });

/* the old review page kept its pattern-folding notes inline */
let PF_WHY = null;
const page = path.join(ROOT, 'tools', 'pat', 'test.html');
if (fs.existsSync(page)) {
  const m = /var PF_WHY = (\{[^\n]*\});/.exec(fs.readFileSync(page, 'utf8'));
  if (m) PF_WHY = Function('return ' + m[1])();
}

const CUBE = /\bcubes?\b/i;
const names = (PAT.test.TRAP_NAMES || {}).patternfold || {};
let items = 0, reviews = 0, badItems = 0, badReviews = 0;
const examples = [];
for (const t of TESTS) {
  const test = PAT.test.build(t);
  test.items.forEach((it, k) => {
    if (it.type !== 'patternfold' || !it.figure || it.figure.kind !== 'poly') return;
    items++;
    let itemBad = false;
    it.options.forEach((o, i) => {
      if (i === it.answer) return;
      reviews++;
      const texts = [];
      if (o.trap && names[o.trap]) texts.push(['label', names[o.trap]]);
      if (PF_WHY && o.trap && PF_WHY[o.trap]) texts.push(['inline note', PF_WHY[o.trap]]);
      if (PAT.explain) {
        const ex = PAT.explain(it, i);
        texts.push(['explanation', [ex.answer].concat(ex.steps.map((s) => s.text || s), Object.keys(ex.traps).map((j) => ex.traps[j]), ex.check ? [ex.check.q, ex.check.a] : []).join(' | ')]);
      }
      const hit = texts.filter((x) => CUBE.test(x[1]));
      if (hit.length) {
        badReviews++; itemBad = true;
        if (examples.length < 5) examples.push('Test ' + t + ' Q' + (k + 1) + ' (' + it.meta.netType + '), choice ' + PAT.LETTERS[i] + ' ' + hit[0][0] + ': ' + hit[0][1].slice(0, 120));
      }
    });
    if (itemBad) badItems++;
  });
}

console.log('pat-pf-check: ' + TESTS.length + ' tests, ' + items + ' non-cube pattern-folding items, ' + reviews + ' distractor reviews');
console.log('  explainer: ' + (PAT.explain ? 'PAT.explain' : 'none') + (PF_WHY ? ', inline PF_WHY notes' : ''));
console.log('  bad notes: ' + badItems + ' items, ' + badReviews + ' reviews say "cube"');
if (badReviews) (VERBOSE ? examples : examples.slice(0, 3)).forEach((e) => console.log('  ' + e));
process.exit(badReviews ? 1 : 0);
