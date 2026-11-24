// "See it" coverage: every topic a student can meet in the full-length mocks and the free practice
// sets opens a visual, and every whiteboard is complete and well formed. node --test
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..', '..');

global.window = global;
require(path.join(ROOT, 'shared/ace-skills.js'));
const V = require(path.join(ROOT, 'shared/ace-visuals.js'));
const B = require(path.join(ROOT, 'shared/ace-board.js'));
B.files.forEach((f) => require(path.join(ROOT, 'shared/boards/' + f + '.js')));
const TOPICS = require(path.join(ROOT, 'data/topics.json'));
require(path.join(ROOT, 'tools/mock/data/full-mocks.js'));

/* Topics with no honest visual yet. A wrong picture is worse than none, so these stay empty on
   purpose. Shrink this list by building the board, never by aliasing to something unrelated. */
const NO_VISUAL_YET = [
  'gchem | The two questions: measurement and the lab',
  'gchem | Sig Figs and Measurement',
  'gchem | Quantum Numbers + Photons',
  'bio | Lab techniques',
  'bio | Beyond Mendel and molecular tools | Biotechnology & lab (PCR, gel, cloning, microscopy)'
];

function item(raw, secDefault) {
  const sec = V.section(raw.section || secDefault), tp = String(raw.topic || 'general'), m = (TOPICS[sec] || {})[tp];
  const it = { section: sec, topic: m ? m[0] : tp, topicName: raw.topicName || (m ? m[1] : tp.replace(/-/g, ' ')), stem: '' };
  const sk = raw.skill ? { skillName: raw.skillName || raw.skill } : window.AceSkills.tag(it);
  it.concept = sk.skillName; return it;
}
function sweep(items) {
  const miss = {}; let n = 0, hit = 0;
  for (const it of items) {
    if (!it.section || it.section === 'pat' || it.section === 'rc') continue;
    n++;
    if (V.match(it)) { hit++; continue; }
    const key = it.section + ' | ' + it.topicName, full = key + ' | ' + it.concept;
    if (NO_VISUAL_YET.includes(key) || NO_VISUAL_YET.includes(full)) continue;
    miss[full] = (miss[full] || 0) + 1;
  }
  return { n, hit, miss };
}

test('every science and QR item in the full-length mocks opens a visual', () => {
  for (const m of window.ACE_FULL_MOCKS.mocks) {
    const items = [];
    for (const s of Object.keys(m.sections)) for (const q of m.sections[s] || []) items.push(item(Object.assign({}, q, { section: q.section || s, topic: q.stop || q.topic, topicName: q.topic }), s));
    const r = sweep(items);
    assert.deepStrictEqual(r.miss, {}, m.id + ' has topics with no visual');
    assert.ok(r.hit / r.n >= 0.95, m.id + ' hit rate ' + r.hit + '/' + r.n);
  }
});

test('every topic in the free practice sets opens a visual', () => {
  for (const f of ['bio', 'gchem', 'ochem', 'qr-dat', 'qr-climb']) {
    const r = sweep(require(path.join(ROOT, 'data/' + f + '.json')).items.map((x) => item(x)));
    assert.deepStrictEqual(r.miss, {}, f + ' has topics with no visual');
    assert.ok(r.hit / r.n >= 0.95, f + ' hit rate ' + r.hit + '/' + r.n);
  }
});

test('Retold night titles, GuacaMOLE and the QR drill keys all resolve', () => {
  const want = [
    ['gchem', 'The mole bridge', 'mole-bridge'], ['gchem', 'Proton traffic', 'acid-base'], ['gchem', 'Balance and the push-back', 'equilibrium'],
    ['gchem', 'The energy ledger', 'energy-ledger'], ['gchem', 'Downhill: entropy and free energy', 'energy-ledger'], ['gchem', 'Gases', 'gases'],
    ['gchem', 'How fast, not how far', 'kinetics'], ['gchem', 'The charge ledger', 'redox'],
    ['bio', 'Cellular respiration', 'respiration'], ['bio', 'Photosynthesis', 'photosynthesis'],
    ['ochem', 'The alpha carbon wakes up', 'enolates'], ['ochem', 'SN1/SN2/E1/E2', 'sn-e-decide'],
    ['qr', 'Fractions, decimals and number sense', 'number-line'], ['qr', 'The setup mindset', 'algebra-setup'],
    ['qr', 'Powers, roots and quadratics', 'powers-roots'], ['qr', 'Trigonometry, just enough', 'trig-triangle']
  ];
  for (const [section, topicName, board] of want) assert.strictEqual((V.match({ section, topicName }) || {}).board, board, topicName);
  assert.strictEqual(V.match({ section: 'gchem', topic: 'GuacaMOLE' }).url, '/gc/guacamole/');
  for (const k of ['geo-2d', 'vol-sa', 'tri-inv', 'coord', 'p-cond', 'zscore', 'desc-stats', 'exps', 'lin-eq', 'estim'])
    assert.ok(V.match({ section: 'qr', topic: k }), 'qr key ' + k);
});

test('the two TikTok production pages are out of the registry', () => {
  const all = JSON.stringify(V.tools);
  assert.ok(!/tiktok/i.test(all));
});

test('every whiteboard is registered, complete and well formed', () => {
  const boards = B.list();
  assert.ok(boards.length >= 12, 'at least 12 boards');
  const reg = V.tools.filter((t) => t.board);
  assert.deepStrictEqual(reg.map((t) => t.board).sort(), boards.map((b) => b.id).sort(), 'registry and board data agree');
  for (const b of boards) {
    const t = reg.find((x) => x.board === b.id);
    assert.strictEqual(t.path, '/see/?b=' + b.id);
    assert.strictEqual(V.section(b.section), t.section, b.id + ' section');
    assert.strictEqual(t.title, b.title, b.id + ' title matches the registry');
    assert.ok(b.steps.length >= 3 && b.steps.length <= 6, b.id + ' has 3 to 6 reveal steps');
    const svg = typeof b.svg === 'function' ? b.svg(B.kit) : b.svg;
    for (let i = 1; i <= b.steps.length; i++) assert.ok(svg.includes('data-step="' + i + '"'), b.id + ' draws step ' + i);
    assert.ok(!svg.includes('data-step="' + (b.steps.length + 1) + '"'), b.id + ' has a caption for every drawn step');
    assert.strictEqual(b.tryIt.length, 3, b.id + ' has three Try it questions');
    for (const q of [b.predict].concat(b.tryIt)) {
      assert.ok(q.q && q.why, b.id + ' question text and reason');
      assert.ok(q.choices.length >= 2 && q.choices.length <= 4, b.id + ' choices');
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length, b.id + ' answer index');
      assert.strictEqual(new Set(q.choices).size, q.choices.length, b.id + ' duplicate choice');
    }
    if (b.path) assert.ok(b.path.steps.length >= 4 && b.path.steps.length <= 7, b.id + ' pathway length');
    for (const l of b.more || []) {
      let f = l.href.split('#')[0].split('?')[0]; if (f.endsWith('/')) f += 'index.html';
      assert.ok(fs.existsSync(path.join(ROOT, f)), b.id + ' more link ' + l.href);
    }
    assert.ok(!/[\u2013\u2014]/.test(JSON.stringify(b) + svg), b.id + ' has no long dashes');
  }
});

test('the chip is a 44px link that names the visual, and nothing when there is no match', () => {
  const h = V.chipHTML({ section: 'gchem', topic: 'mole-conv', topicName: 'Mole Conversions' }, 'review');
  assert.match(h, /class="see-chip"/); assert.match(h, /href="\/see\/\?b=mole-bridge&amp;from=review"/); assert.match(h, /data-see-board="mole-bridge"/);
  assert.match(h, /See it: The mole bridge/);
  assert.strictEqual(V.chipHTML({ section: 'rc', topic: 'tone' }, 'review'), '');
  const plain = V.chipHTML({ section: 'gchem', topic: 'vsepr' }, 'set');
  assert.ok(!/data-see-board/.test(plain)); assert.match(plain, /href="\/gc\/vsepr\/\?from=set"/);
});
