'use strict';
/* QR formats pool tests: exact key recomputation, schema, set gates, mutation
   sensitivity, generated-file sync, runtime, figure renderer (Node side) and
   the QR engine's off-spec wiring.
   Run: npm run test:qr-formats   (node --test, no browser) */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const SRC = path.join(ROOT, 'scripts', 'qr-formats', 'src');
const { verifyItem, setReport, orderOptions, computeKey, QC_CHOICES, DS_CHOICES } = require(path.join(ROOT, 'scripts/qr-formats/lib/check.js'));
const { run, Q, optionNumber } = require(path.join(ROOT, 'scripts/qr-formats/lib/exact.js'));
const Figures = require(path.join(ROOT, 'shared/qr-figures.js'));
const QRFormats = require(path.join(ROOT, 'shared/qr-formats.js'));

const items = ['qc', 'ds', 'di', 'aw'].flatMap((f) => require(path.join(SRC, f + '.js')));
const clone = (x) => JSON.parse(JSON.stringify(x));

test('exact arithmetic engine', () => {
  assert.equal(run('1/3 + 1/6').toString(), '1/2');
  assert.equal(run('0.1 + 0.2 == 0.3'), true);
  assert.equal(run('C(10,4)').toString(), '210');
  assert.equal(run('(5/6)^3').toString(), '125/216');
  assert.equal(run('round(2/3*100, 1)').toDecimal(1), '66.7');
  assert.equal(run('median(4, 1, 3, 2)').toString(), '5/2');
  assert.equal(run('mod(-7, 3)').toString(), '2');
  assert.throws(() => run('sqrt(2)'), /inexact/);
  assert.equal(optionNumber('1,250 dollars').toString(), '1250');
  assert.equal(optionNumber('16.7%').toString(), '167/10');
  assert.equal(optionNumber('5/21').toString(), '5/21');
  assert.equal(optionNumber('Route 4'), null);
});

test('counts: 60 QC, 60 DS, 60 data interpretation, 40 applied', () => {
  const n = (f) => items.filter((i) => i.format === f).length;
  assert.deepEqual([n('qc'), n('ds'), n('di'), n('aw')], [60, 60, 60, 40]);
});

test('every item passes schema + exact key recomputation (checker)', () => {
  const bad = items.map((it) => [it.id, verifyItem(it, Figures)]).filter(([, e]) => e.length);
  assert.deepEqual(bad, []);
});

test('set gates: keys spread, no duplicate ids or stems', () => {
  const rep = setReport(items);
  assert.deepEqual(rep.problems, []);
  for (const f of ['qc', 'ds', 'di', 'aw']) {
    const keys = Object.values(rep.byFormat[f].keys);
    assert.ok(Math.min(...keys) > 0, f + ' has an unused key letter');
  }
});

test('format rules: QC uses the 4 fixed choices, DS the 5 fixed choices, DI/AW five options, key never the unique longest', () => {
  assert.equal(QC_CHOICES.length, 4);
  assert.equal(DS_CHOICES.length, 5);
  items.forEach((it) => {
    const o = orderOptions(it);
    if (it.format === 'qc') assert.deepEqual(o.opts, QC_CHOICES);
    else if (it.format === 'ds') assert.deepEqual(o.opts, DS_CHOICES);
    else {
      assert.equal(o.opts.length, 5, it.id);
      const L = o.opts.map((x) => x.length); const k = L[o.correct];
      assert.ok(L.some((l, i) => i !== o.correct && l >= k), it.id + ' key is the unique longest');
    }
    assert.ok(o.correct >= 0, it.id);
  });
});

test('every item has a worked solution and a named move', () => {
  items.forEach((it) => {
    assert.ok(it.why.length >= 80, it.id);
    assert.ok(it.move.length >= 15, it.id);
    assert.ok(!/[–—]/.test(it.why + it.move + it.stem), it.id + ' has a dash glyph');
  });
});

test('mutation: the checker catches a wrong key in every format', () => {
  const sample = (f) => items.filter((i) => i.format === f).filter((_, i) => i % 6 === 0);
  for (const it of sample('qc').concat(sample('ds'))) {
    const bad = clone(it); const letters = it.format === 'qc' ? 'ABCD' : 'ABCDE';
    bad.key = letters[(letters.indexOf(it.key) + 1) % letters.length];
    assert.ok(verifyItem(bad, Figures).some((e) => /KEY MISMATCH/.test(e)), it.id + ' mutated key not caught');
  }
  for (const it of sample('di').concat(sample('aw'))) {
    const bad = clone(it); bad.answer = it.opts.find((o) => o !== it.answer);
    assert.ok(verifyItem(bad, Figures).some((e) => /KEY MISMATCH/.test(e)), it.id + ' mutated answer not caught');
  }
});

test('mutation: editing a figure value that the answer depends on is caught', () => {
  const it = clone(items.find((i) => i.id === 'di-001'));
  it.figure.rows[2][1] = 170; // 2023 Biology
  assert.ok(verifyItem(it, Figures).length > 0);
});

test('checker computes sufficiency: an E item turned into C by editing a statement', () => {
  const it = clone(items.find((i) => i.id === 'ds-005'));
  it.check.ds.s2 = 'b - r == 10';
  assert.equal(computeKey(it), 'C');
});

test('generated pool files are in sync with the sources', () => {
  const data = require(path.join(ROOT, 'shared/qr-formats-bank.js'));
  const json = JSON.parse(fs.readFileSync(path.join(ROOT, 'shared/qr-formats-bank.json'), 'utf8'));
  assert.equal(data.items.length, items.length);
  assert.equal(json.items.length, items.length);
  items.forEach((it) => {
    const g = data.items.find((x) => x.id === it.id); assert.ok(g, it.id + ' missing from build');
    const o = orderOptions(it);
    assert.equal(g.correct, o.correct, it.id + ' stale build: rerun node scripts/qr-formats/build.js');
    assert.equal(g.why, it.why, it.id + ' stale build');
    assert.deepEqual(g.figure || null, it.figure || null, it.id + ' stale figure');
  });
});

test('runtime: draw is deterministic, interleaves formats, never repeats a figure', () => {
  const a = QRFormats.draw({ n: 24, seed: 11 }).map((i) => i.id);
  const b = QRFormats.draw({ n: 24, seed: 11 }).map((i) => i.id);
  assert.deepEqual(a, b);
  assert.equal(new Set(a).size, 24);
  assert.deepEqual(a.slice(0, 4).map((id) => id.slice(0, 2)), ['qc', 'ds', 'di', 'aw']);
  const di = QRFormats.draw({ formats: ['di'], n: 60, seed: 5 });
  const figs = di.map((i) => JSON.stringify(i.figure));
  assert.equal(new Set(figs).size, figs.length);
  const hard = QRFormats.draw({ formats: ['aw'], n: 40, diff: [4], seed: 1 });
  assert.ok(hard.length > 0 && hard.every((i) => i.diff === 4));
});

test('runtime: engine and mock shapes', () => {
  QRFormats.items.forEach((it) => {
    const e = QRFormats.toEngineItem(it);
    assert.equal(e.opts.length, it.format === 'qc' ? 4 : 5);
    assert.ok(e.correct >= 0 && e.correct < e.opts.length);
    assert.equal(e.skills[0], it.skill);
    assert.ok(e.q.includes('qrf-stem'));
    if (it.figure) assert.ok(e.q.includes('class="qrfig"'), it.id + ' figure missing from stem');
    const m = QRFormats.toMockItem(it);
    assert.equal(m.choices[QRFormats.LETTERS.indexOf(m.answer)], e.opts[e.correct]);
  });
  assert.equal(QRFormats.display('2^(n+1) and x^3'), '2<sup>n+1</sup> and x<sup>3</sup>');
  assert.equal(QRFormats.display('<b>'), '&lt;b&gt;');
});

test('figures: every pool figure validates and renders at 390 and 1280 with its data labels', () => {
  const figs = items.filter((i) => i.figure).map((i) => i.figure);
  assert.equal(figs.length, 60);
  const types = {}; figs.forEach((f) => { types[f.type] = (types[f.type] || 0) + 1; });
  assert.ok(types.table >= 10 && types.bar >= 10 && types.line >= 10 && types.pie >= 10, JSON.stringify(types));
  figs.forEach((f) => {
    assert.deepEqual(Figures.validate(f), []);
    for (const w of [390, 1280]) {
      const svg = Figures.svg(f, { width: w });
      assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'));
      assert.ok(!/NaN|undefined|Infinity/.test(svg), f.title + ' has a bad number at ' + w);
      const vw = +svg.match(/viewBox="0 0 (\d+)/)[1];
      assert.ok(vw <= Math.min(640, Math.max(280, w)) + 1, f.title + ' wider than requested');
      const labels = f.type === 'table' ? f.rows.map((r) => String(r[0])) : f.type === 'pie' ? [] : (f.categories || f.x).map(String);
      labels.forEach((l) => assert.ok(svg.includes('>' + l.replace(/&/g, '&amp;')) || svg.includes(l.split(' ')[0]), f.title + ' missing label ' + l));
    }
    const html = Figures.html(f);
    assert.ok(html.includes('<figcaption>'));
    if (f.type === 'pie') f.slices.forEach((s) => assert.ok(html.includes(s.label), 'pie legend ' + s.label));
  });
});

test('figures: validator rejects bad specs', () => {
  assert.ok(Figures.validate({ type: 'bar', title: 't', categories: ['a', 'b'], series: [{ name: 's', values: [1] }] }).length);
  assert.ok(Figures.validate({ type: 'pie', title: 't', slices: [{ label: 'a', value: -1 }, { label: 'b', value: 2 }] }).length);
  assert.ok(Figures.validate({ type: 'line', title: 't', x: ['a', 'b', 'c'], series: [{ name: 's', values: [1.3, 2, 3] }, { name: 'u', values: [3, 7, 1] }], valueLabels: false }).length, 'unlabeled off-grid values must be rejected');
  assert.ok(Figures.validate({ type: 'donut', title: 't' }).length);
});

test('QR engine: off-spec skills flagged, kept out of the scored simulation, formats wired in', () => {
  const html = fs.readFileSync(path.join(ROOT, 'tools/qr/index.html'), 'utf8');
  for (const id of ['trig', 'geo-2d', 'tri-inv', 'vol-sa', 'units']) {
    assert.match(html, new RegExp("\\{id:'" + id + "',[^\\n]*offspec:true"), id + ' not flagged');
  }
  const sim = html.slice(html.indexOf('const SIM_DISTRIBUTION'), html.indexOf('};', html.indexOf('const SIM_DISTRIBUTION')));
  for (const id of ['trig', 'geo-2d', 'tri-inv', 'vol-sa', 'units']) assert.ok(!sim.includes("'" + id + "'"), id + ' still in SIM_DISTRIBUTION');
  for (const id of ['qc-compare', 'ds-format', 'data-figs', 'applied-wp']) {
    assert.ok(sim.includes("'" + id + "'"), id + ' not in SIM_DISTRIBUTION');
    assert.ok(html.includes('<section class="sec" id="' + id + '"'), id + ' section missing');
    assert.ok(html.includes('data-go="' + id + '"'), id + ' sidebar link missing');
  }
  assert.ok(html.includes('/shared/qr-formats.js') && html.includes('qr-formats-module.js'));
  assert.ok(html.includes('Optional review · not on the current DAT'));
  assert.ok(!html.includes("'ABCD'[j]"), 'five-choice items need the E letter');
  const mini = fs.readFileSync(path.join(ROOT, 'tools/qr/proposals/agent-08-pacing/friday-mini-mock.html'), 'utf8');
  assert.ok(!/geo-2d|hypotenuse|circumference/i.test(mini), 'mini-mock still carries geometry');
});
