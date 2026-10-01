/*
  audit-engine.js : 50 fixed-seed items per type from the TEST engine,
  each checked by the independent verifiers (tests/pat/helpers.js checkItem).
  Usage: node scripts/pat/audit-engine.js [--json out.json] [--sheet out.html]
  --sheet writes a contact sheet (10 items per type, key outlined) for the
  visual spot-check screenshots.
*/
'use strict';
const fs = require('fs');
const path = require('path');
const { loadEngine, checkItem } = require('../../tests/pat/helpers.js');
const PAT = loadEngine();

const SEEDS = Array.from({ length: 50 }, (_, i) => 9000 + i * 101);
const GEN = {
  keyholes: (s, i) => PAT.keyholes.generate(s, ['medium', 'hard', 'brutal'][i % 3]),
  tfe: (s) => PAT.tfe.generate(s),
  angles: (s) => PAT.angles.generate(s),
  holepunch: (s, i) => PAT.holepunch.generate(s, { folds: 1 + (i % 3) }),
  cubes: (s, i) => PAT.cubes.generateSet(s, 4, 'ABCD'[i % 4])[i % 4 === 3 ? 2 : 0],
  patternfold: (s) => PAT.patternfold.generate(s),
  // engine v2 kinds
  keyholesMachined: (s) => PAT.keyholesCSG.generate(s),
  tfeMachined: (s) => PAT.tfeCSG.generate(s),
  holepunchV2: (s, i) => PAT.holepunch.generate(s, { folds: 2 + (i % 2), halfHoles: i % 3 === 0 }),
  patternfoldPoly: (s, i) => PAT.patternfoldPoly.generate(s, { kind: ['box', 'triprism', 'pyramid', 'tetra'][i % 4] }),
  angles1deg: (s) => PAT.angles.generate(s, { tier: '1deg' })
};
const NS = { keyholesMachined: 'keyholes', tfeMachined: 'tfe', holepunchV2: 'holepunch', patternfoldPoly: 'patternfold', angles1deg: 'angles' };
const only = process.argv.indexOf('--only') > 0 ? process.argv[process.argv.indexOf('--only') + 1].split(',') : null;
const report = {}, sample = {};
for (const type of Object.keys(GEN).filter((t) => !only || only.includes(t))) {
  const r = report[type] = { items: 0, bad: 0, issues: {}, ms: 0, meta: {} };
  sample[type] = [];
  SEEDS.forEach((s, i) => {
    const t0 = Date.now();
    const it = GEN[type](s, i);
    r.ms += Date.now() - t0;
    if (!it.meta) it.meta = {};
    const probs = checkItem(PAT, it);
    r.items++;
    if (probs.length) { r.bad++; probs.forEach((p) => { r.issues[p] = (r.issues[p] || 0) + 1; }); }
    if (sample[type].length < 10) sample[type].push(it);
    // distribution notes for the audit doc
    const m = it.meta, add = (k, v) => { r.meta[k] = r.meta[k] || {}; r.meta[k][v] = (r.meta[k][v] || 0) + 1; };
    if (type === 'angles' || type === 'angles1deg') add('minGap', m.minGap);
    if (type === 'tfe' || type === 'tfeMachined') { add('missing', m.missing); add('hiddenLines', m.hiddenLines); }
    if (type === 'tfeMachined') { add('validMissing', m.validMissing); add('traps', it.options.map((o) => o.trap).filter(Boolean).sort().join('+')); m.feats.forEach((f) => add('feature', f)); }
    if (type === 'keyholesMachined') { add('keyAxis', m.keyAxis); add('traps', m.traps.filter(Boolean).sort().join('+')); Object.keys(it.figure.params).forEach((k) => { if (!['w', 'h', 'L'].includes(k)) add('feature', k + ':' + (it.figure.params[k].k || 'yes')); }); }
    if (type === 'patternfoldPoly') { add('solid', m.solid); add('traps', m.traps.filter(Boolean).sort().join('+')); }
    if (type === 'holepunch' || type === 'holepunchV2') { add('folds', m.folds); add('diagonal', m.diagonal); add('holes', m.holes); if (type === 'holepunchV2') add('halfHoles', m.halfHoles || 0); }
    if (type === 'cubes') { add('total', m.total); add('hiddenCubes', m.hiddenCubes); }
    if (type === 'patternfold') { add('netType', m.netType); add('traps', m.traps.filter(Boolean).sort().join('+')); }
    if (type === 'keyholes') { add('keySymmetry', m.keySymmetry); add('traps', m.traps.filter(Boolean).sort().join('+')); }
  });
}
for (const [t, r] of Object.entries(report)) {
  console.log('== ' + t + ': ' + r.bad + '/' + r.items + ' items with problems (' + Math.round(r.ms / r.items) + ' ms/item)');
  for (const [k, n] of Object.entries(r.issues)) console.log('   ' + n + 'x ' + k);
}
const j = process.argv.indexOf('--json');
if (j > 0) fs.writeFileSync(process.argv[j + 1], JSON.stringify(report, null, 2));
const sh = process.argv.indexOf('--sheet');
if (sh > 0) {
  const css = fs.readFileSync(path.join(__dirname, '..', '..', 'tools', 'pat', 'pat-test.css'), 'utf8');
  let h = '<!doctype html><html><head><meta charset="utf-8"><style>' + css + ' body{background:#0e1512;padding:16px} .row{display:flex;gap:16px;align-items:flex-start;border-bottom:1px solid #333;padding:10px 0} .row .stem{flex:0 0 46%} .row .opts{display:flex;flex-wrap:wrap;gap:8px;flex:1} .o{border:1px solid #444;padding:4px;border-radius:6px;min-width:60px;color:#ddd;font:12px sans-serif} .o.key{border:3px solid #3fae6b} h2{color:#C9A84C;font-family:Georgia}</style></head><body>';
  for (const t of Object.keys(sample)) {
    h += '<h2>' + t + '</h2>';
    const R = PAT[NS[t] || t];
    sample[t].forEach((it) => {
      h += '<div class="row"><div class="stem"><div style="color:#ccc;font:12px sans-serif">seed ' + it.seed + ' ' + PAT.core.esc(it.prompt) + '</div>' + R.renderFigure(it) + '</div><div class="opts">' +
        it.options.map((o, i) => '<div class="o' + (i === it.answer ? ' key' : '') + '">' + 'ABCDE'[i] + ' ' + (o.trap || 'KEY') + R.renderOption(it, i) + '</div>').join('') + '</div></div>';
    });
  }
  fs.writeFileSync(process.argv[sh + 1], h + '</body></html>');
}
