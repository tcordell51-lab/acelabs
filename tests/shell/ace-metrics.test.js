// Answer-change metrics (2026-11-16): AceQuestion logs every selection, AceRecord keeps the
// first pick, the number of changes, the direction of the change and the optional confidence.
// node --test tests/shell/ace-metrics.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

const SHARED = path.join(__dirname, '..', '..', 'shared');
const j = (x) => JSON.parse(JSON.stringify(x));
const item = (id, extra) => Object.assign({ id, section: 'bio', topic: 'cells', topicName: 'Cells', stem: 'Stem ' + id, choices: ['a', 'b', 'c', 'd', 'e'], answer: 2, why: 'because' }, extra || {});

function bootRecord() {
  const store = {};
  const localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; }, key: (i) => Object.keys(store)[i] || null, get length() { return Object.keys(store).length; } };
  const window = { localStorage };
  const ctx = vm.createContext({ window, localStorage, document: { addEventListener() {} }, console, Promise, Date, Math, JSON, Object, Array, String, Number, Error });
  vm.runInContext(fs.readFileSync(path.join(SHARED, 'ace-record.js'), 'utf8'), ctx);
  return { R: window.AceRecord, store };
}

function bootQuestion() {
  const dom = new JSDOM('<!doctype html><body><div id="h"></div></body>', { runScripts: 'outside-only' });
  dom.window.eval(fs.readFileSync(path.join(SHARED, 'ace-question.js'), 'utf8'));
  return dom.window;
}

test('record keeps first pick, changes, direction and confidence on the attempt row', () => {
  const { R } = bootRecord();
  R.record({ item: item('a1'), picked: 2, answer: 2, ok: true, first: 0, changes: 1, change: 'w2r', conf: 'unsure' });
  R.record({ item: item('a2'), picked: 1, answer: 2, ok: false, first: 2, changes: 1, change: 'r2w' });
  R.record({ item: item('a3'), picked: 4, answer: 2, ok: false, first: 3, changes: 2 });   // direction derived: w2w
  R.record({ item: item('a4'), picked: 2, answer: 2, ok: true });                          // no change
  const rows = j(R.attempts());
  assert.deepStrictEqual(rows.map((r) => r.change), ['w2r', 'r2w', 'w2w', 'none']);
  assert.strictEqual(rows[0].conf, 'unsure');
  assert.strictEqual(rows[2].first, 3);
  const s = j(R.changeStats({ section: 'bio' }));
  assert.strictEqual(s.changed, 3); assert.strictEqual(s.w2r, 1); assert.strictEqual(s.r2w, 1); assert.strictEqual(s.w2w, 1);
  assert.strictEqual(s.net, 0);
  assert.strictEqual(s.enough, false, 'fewer than 20 changes is called too small to mean anything');
  assert.deepStrictEqual(s.bySure.unsure, [1, 1]);
});

test('events go to ace.v1.events and stay capped', () => {
  const { R, store } = bootRecord();
  for (let i = 0; i < 1005; i++) R.event('lab-step', { lab: 'vsepr', step: i });
  const ev = j(R.events());
  assert.strictEqual(ev.length, 1000);
  assert.strictEqual(ev[ev.length - 1].step, 1004);
  assert.ok(Object.keys(store).every((k) => k.startsWith('ace.v1.')));
});

test('the question logs every selection and classifies the change at Check', () => {
  const w = bootQuestion();
  let res = null;
  const q = w.AceQuestion.mount(w.document.getElementById('h'), item('q1'), { onAnswer: (r) => { res = r; }, confidence: true });
  q.pick(0); q.pick(3); q.pick(2);                 // wrong, wrong, then right
  const sure = [...w.document.querySelectorAll('.aui-q__confbtn')].find((b) => b.textContent === 'Unsure');
  sure.click();
  q.check();
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.first, 0);
  assert.strictEqual(res.changes, 2);
  assert.strictEqual(res.change, 'w2r');
  assert.strictEqual(res.conf, 'unsure');
  assert.deepStrictEqual(j(res.picks.map((p) => p.i)), [0, 3, 2]);
});

test('right to wrong is caught, and re-picking the same letter is not a change', () => {
  const w = bootQuestion();
  let res = null;
  const q = w.AceQuestion.mount(w.document.getElementById('h'), item('q2'), { onAnswer: (r) => { res = r; } });
  q.pick(2); q.pick(2); q.pick(1);
  q.check();
  assert.strictEqual(res.change, 'r2w');
  assert.strictEqual(res.changes, 1);
  assert.strictEqual(res.conf, null, 'confidence is optional and never required');
});

test('a figure stays unlabeled until Check, then reveals; steps come in order', () => {
  const w = bootQuestion();
  const fig = { html: '<svg><g class="reveal"><text>nucleus</text></g><text class="predict-only">?</text></svg>', caption: 'No labels yet', revealCaption: 'Labels drawn in code' };
  const q = w.AceQuestion.mount(w.document.getElementById('h'), item('q3', { steps: ['one', 'two', 'three'] }), { figure: fig });
  const box = w.document.querySelector('.aui-q__fig');
  assert.strictEqual(box.getAttribute('data-state'), 'predict');
  assert.strictEqual(w.document.querySelector('.aui-q__fb').hidden, true, 'nothing is revealed before Check');
  q.pick(1); q.check();
  assert.strictEqual(box.getAttribute('data-state'), 'reveal');
  assert.strictEqual(w.document.querySelector('.aui-q__cap').textContent, 'Labels drawn in code');
  assert.deepStrictEqual([...w.document.querySelectorAll('.aui-q__steps li')].map((li) => li.textContent), ['one', 'two', 'three']);
});
