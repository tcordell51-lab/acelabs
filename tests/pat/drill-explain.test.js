'use strict';
/* Studio drills (tools/pat/{holepunch,tfe,patternfold,keyholes}.html): every answered item shows a
   worked explanation and a See it chip to its PAT whiteboard. PAT.explain.drill is a pure function
   of the finished item, so a seed still reproduces the same item. Run: npm run test:pat */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadEngine } = require('./helpers.js');
const ROOT = path.join(__dirname, '..', '..');
const W = require(path.join(ROOT, 'shared', 'ace-walkthrough.js'));
const V = require(path.join(ROOT, 'shared', 'ace-visuals.js'));
const PAT = loadEngine();

/* The hole punch drill's own fold engine, restated: fold a 4x4 sheet, punch, unfold. */
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function holeItem(seed) {
  const rng = mulberry32(seed), ri = (n) => Math.floor(rng() * n);
  const flapW = (r, f) => f.axis === 'v' ? (f.side === 'hi' ? r[1] - f.c : f.c - r[0]) : (f.side === 'hi' ? r[3] - f.c : f.c - r[2]);
  let rect = [0, 4, 0, 4]; const folds = [], rects = [rect.slice()];
  for (let i = 0; i < 2; i++) {
    const legal = [];
    ['v', 'h'].forEach((ax) => { const lo = ax === 'v' ? rect[0] : rect[2], hi = ax === 'v' ? rect[1] : rect[3]; for (let c = lo + 1; c < hi; c++) { if (c - (hi - c) >= lo) legal.push({ axis: ax, c, side: 'hi' }); if (c + (c - lo) <= hi) legal.push({ axis: ax, c, side: 'lo' }); } });
    const f = legal[ri(legal.length)]; folds.push(f);
    rect = rect.slice(); if (f.axis === 'v') { if (f.side === 'hi') rect[1] = f.c; else rect[0] = f.c; } else { if (f.side === 'hi') rect[3] = f.c; else rect[2] = f.c; }
    rects.push(rect.slice());
  }
  const punches = [[rect[0] + 0.5, rect[2] + 0.5]], sets = [punches.slice()];
  for (let i = 1; i >= 0; i--) {
    const f = folds[i], w = flapW(rects[i], f), out = [], seen = {};
    sets[sets.length - 1].forEach((p) => { out.push(p); const v = f.axis === 'v' ? p[0] : p[1], d = f.side === 'hi' ? f.c - v : v - f.c; if (d > 0 && d <= w) out.push(f.axis === 'v' ? [2 * f.c - p[0], p[1]] : [p[0], 2 * f.c - p[1]]); });
    sets.push(out.filter((p) => { const k = p.join(','); if (seen[k]) return false; seen[k] = 1; return true; }));
  }
  const ans = sets[sets.length - 1];
  const options = [sets[sets.length - 2], ans, ans.slice(1), ans.map((p, j) => j ? p : [p[0] === 3.5 ? 2.5 : p[0] + 1, p[1]]), ans.concat([[1.5, 2.5]]).filter((p, i, a) => a.findIndex((q) => q.join() === p.join()) === i)];
  return { folds, punches, sets, options, answer: 1 };
}
const KEY_TRAPS = {
  MIRROR: { label: 'Near-mirror', note: 'Displayed as the mirror image of the key, but subtly altered. Mirroring IS legal for apertures.' },
  FILL: { label: 'Dropped feature', note: 'A real view with a notch filled in. The most common miss - almost all of it is correct.' },
  SCALE: { label: 'Wrong scale', note: 'Correct shape, wrong proportions - one band stretched or compressed. Caught only by comparing dimensions.' },
  ISLAND: { label: 'Impossible aperture (island)', note: 'Contains a floating interior region. A hole cut in a plate cannot have an island.' }
};
const SAMPLES = () => {
  const list = [];
  for (let s = 1; s <= 25; s++) list.push(['holepunch', holeItem(s)]);
  [true, false].forEach((hidden) => list.push(['tfe', { feat: 'tunnel', options: [{ ok: false, tax: 'mirror', hidden }, { ok: true, tax: '', hidden }, { ok: false, tax: 'dash', hidden: false }, { ok: false, tax: 'height', hidden }], answer: 1 }]));
  [['tri', 'band', 'corner', 'solid', 'blank', 'blank'], ['corner', 'tri', 'solid', 'solid', 'band', 'blank']].forEach((p) => list.push(['patternfold', {
    faces: { top: p[0], front: p[1], right: p[2], bottom: p[3], back: p[4], left: p[5] },
    options: [{ ok: true, why: '' }, { ok: false, why: 'the mirror trap - that half-shade is flipped a way no fold can flip it' }, { ok: false, why: 'top shows what belongs on the opposite face - two opposite faces can never be seen at once' }, { ok: false, why: 'right faces, wrong orientation - check what the pattern touches along the shared edge' }], answer: 0 }]));
  ['End view (along X)', 'Front view (along Y)', 'Top view (along Z)'].forEach((view) => list.push(['keyholes', { view, traps: KEY_TRAPS, options: [{ correct: false, trap: 'MIRROR' }, { correct: false, trap: 'FILL' }, { correct: true, trap: '' }, { correct: false, trap: 'SCALE' }, { correct: false, trap: 'ISLAND' }], answer: 2 }]));
  return list;
};

test('drill explanations: answer, 3 to 5 steps, a trap per wrong choice, within the standard', () => {
  SAMPLES().forEach(([kind, data], n) => {
    [0, data.answer].forEach((picked) => {
      const ex = PAT.explain.drill(kind, data, picked), where = kind + ' #' + n;
      const problems = W.validate(ex).filter((p) => p !== 'missing trick');
      assert.deepEqual(problems, [], where + ': ' + problems.join('; '));
      data.options.forEach((_, i) => {
        if (i === data.answer) assert.equal(ex.traps[i], undefined, where + ': the key has no trap line');
        else assert.ok(ex.traps[i] && ex.traps[i].length > 10, where + ': choice ' + i + ' has no trap line');
      });
      assert.ok(!/[\u2013\u2014]/.test(JSON.stringify(ex)), where + ': long dash');
      const html = PAT.explain.html(ex, { chosen: picked });
      assert.ok(html.indexOf('pex-steps') > 0 && html.indexOf('pex-answer') > 0, where + ': panel markup');
      if (picked !== data.answer) assert.ok(html.indexOf('pex-mine') > 0, where + ': a miss opens on the trap');
    });
  });
});

test('hole punch: the count in the answer is the number of holes in the key', () => {
  for (let s = 1; s <= 25; s++) {
    const d = holeItem(s), ex = PAT.explain.drill('holepunch', d, null);
    assert.ok(ex.answer.indexOf(d.options[1].length + ' hole') >= 0, 'seed ' + s + ': ' + ex.answer);
    assert.ok(ex.traps[0].indexOf('one unfold early') >= 0, 'seed ' + s + ': the stop-early trap is named');
  }
});

test('explaining a drill item never changes it and is deterministic (seeds reproduce)', () => {
  SAMPLES().forEach(([kind, data]) => {
    const before = JSON.stringify(data), a = JSON.stringify(PAT.explain.drill(kind, data, 0));
    assert.equal(JSON.stringify(data), before, kind + ': input untouched');
    assert.equal(JSON.stringify(PAT.explain.drill(kind, data, 0)), a, kind + ': same item, same explanation');
  });
  const src = fs.readFileSync(path.join(ROOT, 'tools', 'pat', 'engine', 'pat-explain.js'), 'utf8');
  const drill = src.slice(src.indexOf('studio drills'), src.indexOf('explain.html = html'));
  assert.ok(!/Math\.random|rng\(/.test(drill), 'the drill explainer draws no random numbers');
});

test('each drill page loads the explainer and links to its PAT whiteboard', () => {
  ['holepunch', 'tfe', 'patternfold', 'keyholes'].forEach((kind) => {
    const html = fs.readFileSync(path.join(ROOT, 'tools', 'pat', kind + '.html'), 'utf8');
    ['pat-explain.css', 'engine/pat-core.js', 'engine/pat-explain.js', '/shared/ace-visuals.js?v='].forEach((inc) => assert.ok(html.indexOf(inc) > 0, kind + '.html includes ' + inc));
    assert.ok(html.indexOf("drillHTML('" + kind + "'") > 0 || html.indexOf("showPex(") > 0, kind + '.html shows the explanation after an answer');
    assert.ok(new RegExp("'" + kind + "'").test(html.slice(html.indexOf('showPex') > 0 ? html.indexOf('showPex') : 0)), kind + '.html passes its own kind');
    const m = V.match({ section: 'pat', topic: kind });
    assert.ok(m && m.board === 'pat-' + kind, kind + ' resolves to the pat-' + kind + ' whiteboard');
  });
});
