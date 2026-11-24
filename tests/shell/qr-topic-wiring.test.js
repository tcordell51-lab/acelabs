// QR drill wiring: every item the drill serves per topic has a key that was recomputed, the
// out-of-scope topics are gone from what students see, and nothing is served unverified.
// node --test tests/shell/qr-topic-wiring.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ROOT = path.join(__dirname, '..', '..');
const J = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const bank = J('data/qr-topics.json');
const manifest = J('scripts/bank/qr-arcade-verified.json');
const scope = J('scripts/bank/scope-topics.json');
const topics = J('data/topics.json');
const arcade = J('games/qr.json');
const OUT = new Set(['logs', 'logarithms', 'geo-2d', 'vol-sa', 'coord', 'geometry-area-volume']);
const bare = (id) => String(id).replace(/^qr:/, '');

test('every served QR topic item is well formed: 4 or 5 choices, key in range, explanation present', () => {
  assert.ok(bank.items.length >= 500, 'bank has ' + bank.items.length);
  const seen = new Set();
  for (const it of bank.items) {
    assert.ok(!seen.has(it.id), 'duplicate id ' + it.id); seen.add(it.id);
    assert.strictEqual(it.section, 'qr', it.id);
    assert.ok(Array.isArray(it.choices) && (it.choices.length === 4 || it.choices.length === 5), it.id + ' choices');
    assert.ok(Number.isInteger(it.answer) && it.answer >= 0 && it.answer < it.choices.length, it.id + ' key in range');
    assert.strictEqual(new Set(it.choices.map(String)).size, it.choices.length, it.id + ' choices are distinct');
    assert.ok(String(it.stem || '').trim().length > 5, it.id + ' stem');
    assert.ok(String(it.why || it.explanation || it.reason || '').trim().length > 5, it.id + ' explanation');
    assert.ok(!OUT.has(it.topic), it.id + ' is in an out-of-scope topic');
  }
});

test('every served item is in the verified manifest, re-verifies now, and the manifest is fresh', async () => {
  const ok = new Set(Object.keys(manifest.verified));
  const V = await import(pathToFileURL(path.join(ROOT, 'scripts/bank/verify-qr-arcade.mjs')).href);
  const byId = {}; for (const q of arcade) byId[q.id] = q;
  for (const it of bank.items) {
    const id = bare(it.id), q = byId[id];
    assert.ok(ok.has(id), it.id + ' is not in the verified manifest');
    assert.ok(q, it.id + ' has no source item in games/qr.json');
    assert.strictEqual(V.verifyItem(q).ok, true, it.id + ' does not re-verify');
    assert.strictEqual(it.answer, q.correct, it.id + ' key differs from its source');
    assert.deepStrictEqual(it.choices, q.opts, it.id + ' choices differ from its source');
  }
  assert.strictEqual(bank.items.length, ok.size, 'the bank serves exactly the verified set');
  const fresh = await V.run();
  assert.deepStrictEqual(Object.keys(fresh.ok).sort(), [...ok].sort(), 'manifest is stale: run node scripts/bank/verify-qr-arcade.mjs');
  for (const id of Object.keys(manifest.skipped)) assert.ok(!bank.items.some((it) => bare(it.id) === id), id + ' was skipped but is served');
});

test('the 36 topic keys that had no drill items: each is served, skipped with a reason, or out of scope', () => {
  const served = {}; for (const it of bank.items) served[it.topic] = (served[it.topic] || 0) + 1;
  for (const t of Object.keys(served)) assert.ok(served[t] >= 5, t + ' has ' + served[t] + ' items, too few for a quick check');
  assert.ok(Object.keys(served).length >= 25, Object.keys(served).length + ' topics served');
  for (const t of Object.keys(served)) assert.ok(topics.qr[t] && topics.qr[t][1], t + ' has a name in data/topics.json');
});

test('out-of-scope topics are gone from every served bank, the topic list and the arcade filter', () => {
  assert.deepStrictEqual(Object.keys(scope.qr).sort(), [...OUT].sort());
  for (const f of ['data/qr-topics.json', 'data/qr-dat.json', 'data/qr-climb.json']) for (const it of J(f).items) assert.ok(!OUT.has(it.topic), f + ' serves ' + it.topic);
  const ex = new Set((topics.excluded && topics.excluded.qr) || []);
  for (const k of OUT) assert.ok(ex.has(k), k + ' is listed as excluded in data/topics.json');
  const play = read('games/play.html');
  assert.match(play, /excluded/); assert.match(play, /topics\.json/);
  assert.ok(arcade.some((q) => OUT.has(q.topic)), 'the items stay in the arcade bank file, only hidden');
});

test('the QR drill page serves the topic bank through the shared hub', () => {
  const h = read('qr/drill/index.html');
  assert.match(h, /AceHub\.init/); assert.match(h, /\/data\/qr-topics\.json/); assert.match(h, /section:\s*'qr'/);
});
