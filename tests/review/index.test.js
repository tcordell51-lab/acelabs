// tests/review/index.test.js : scripts/build-review-index.mjs and the files it writes.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '../..');
const BUILD = pathToFileURL(path.join(ROOT, 'scripts/build-review-index.mjs')).href;
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const INDEX = read('content/approvals/review-index.json');

test('the committed index is current (rebuild it with node scripts/build-review-index.mjs)', async () => {
  const b = await import(BUILD);
  const { index, problems } = b.buildIndex(ROOT);
  assert.deepEqual(problems, []);
  assert.equal(b.serialize(index), fs.readFileSync(path.join(ROOT, 'content/approvals/review-index.json'), 'utf8'));
});

test('every auto-approved explainer and every stamped item is listed, with the stamp', () => {
  const approvals = read('docs/explainers/approvals.json').approvals;
  const qids = new Set(INDEX.items.filter((x) => x.kind === 'explainer').map((x) => x.qid));
  for (const [qid, a] of Object.entries(approvals)) if (a.stamp) assert.ok(qids.has(qid), qid);
  const dir = path.join(ROOT, 'content/approvals/stamps');
  const ids = new Set(INDEX.items.map((x) => x.id));
  for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.json'))) {
    for (const it of read('content/approvals/stamps/' + f).items) assert.ok(ids.has(it.id.replace(/#/g, '.')), f + ': ' + it.id);
  }
  for (const it of INDEX.items) {
    assert.equal(it.stamp, 'auto-approved 2026-10-30, pending Thomas review', it.id);
    assert.ok(['bio', 'gchem', 'ochem', 'qr', 'pat', 'rc', 'all'].includes(it.section), it.id);
    assert.equal(typeof it.pullable, 'boolean');
  }
  assert.equal(new Set(INDEX.items.map((x) => x.id)).size, INDEX.items.length, 'ids are unique');
  assert.ok(INDEX.items.some((x) => x.id === 'retold:bio:1' && x.kind === 'retold-night' && x.pullable), 'the Bio night 1 night item');
});

test('explainer pull ids: the qid, with "#" as "." so shared/ace-pulls.js keeps it', () => {
  const hashed = INDEX.items.filter((x) => x.qid && x.qid.includes('#'));
  assert.ok(hashed.length > 0);
  for (const it of hashed) assert.equal(it.id, it.qid.replace(/#/g, '.'));
  for (const it of INDEX.items.filter((x) => x.kind === 'explainer' && !x.qid.includes('#'))) assert.equal(it.id, it.qid);
  // the stamp checksum matches the served sidecar on every explainer
  for (const it of INDEX.items.filter((x) => x.kind === 'explainer')) assert.equal(it.checksum.matches, true, it.id);
});

test('a new stamps file is picked up with no code change; corrections take no pull; bad ids are refused', async () => {
  const b = await import(BUILD);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'review-index-'));
  try {
    fs.mkdirSync(path.join(tmp, 'content/approvals/stamps'), { recursive: true });
    const stamp = 'auto-approved 2026-10-30, pending Thomas review';
    fs.writeFileSync(path.join(tmp, 'content/approvals/stamps/CONTENT-FIX.json'), JSON.stringify({ batch: 'CONTENT-FIX', items: [
      { id: 'override:ochem:oc-1', kind: 'why-override', section: 'ochem', title: 'Override', stamp, before: 'old', after: 'new' },
      { id: 'fix:bio:genetics-ratio', kind: 'correction', title: 'A correction', stamp, place: '/tools/bio/bio-genetics.html' },
      { id: 'retold:pat:3:2', kind: 'retold-figure-removal', title: 'PAT scene', stamp },
    ] }));
    let { index, problems } = b.buildIndex(tmp);
    assert.deepEqual(problems, []);
    const by = Object.fromEntries(index.items.map((x) => [x.id, x]));
    assert.equal(by['override:ochem:oc-1'].pullable, true);
    assert.equal(by['override:ochem:oc-1'].section, 'ochem');
    assert.equal(by['fix:bio:genetics-ratio'].pullable, false);
    assert.equal(by['fix:bio:genetics-ratio'].section, 'all');
    assert.equal(by['retold:pat:3:2'].section, 'pat');
    assert.equal(by['retold:pat:3'].kind, 'retold-night');
    fs.writeFileSync(path.join(tmp, 'content/approvals/stamps/BAD.json'), JSON.stringify({ items: [{ id: 'has space', stamp }] }));
    ({ problems } = b.buildIndex(tmp));
    assert.equal(problems.length, 1);
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});

test('the snapshot: committed file is a list shared/ace-pulls.js reads; snapshotFrom keeps known pullable ids only', async () => {
  const b = await import(BUILD);
  const snap = read('content/approvals/pulls-snapshot.json');
  assert.ok(Array.isArray(snap.pulls));
  const known = new Set(INDEX.items.filter((x) => x.pullable).map((x) => x.id));
  for (const id of snap.pulls) assert.ok(known.has(id), id);
  const s = b.snapshotFrom({ v: 1, pulls: ['retold:bio:1', 'fm', 'nope', 'retold:bio:1', 42] }, INDEX, 'study-r1', new Date('2026-11-11T17:00:00Z'));
  assert.deepEqual(s, { v: 1, tag: 'study-r1', written: '2026-11-11T17:00:00.000Z', pulls: ['retold:bio:1'] });
  assert.throws(() => b.snapshotFrom({ error: 'x' }, INDEX, 't'), /not a list/);
});

test('every pull id in the index is honoured by shared/ace-pulls.js (none dropped, so none fails open)', async () => {
  const src = fs.readFileSync(path.join(ROOT, 'shared/ace-pulls.js'), 'utf8');
  const ids = INDEX.items.filter((x) => x.pullable).map((x) => x.id);
  const dom = new JSDOM('<!doctype html><p>x</p>', { url: 'https://acelabs.netlify.app/', runScripts: 'outside-only' });
  const w = dom.window;
  w.fetch = (url) => Promise.resolve(String(url).includes('pulls-snapshot')
    ? { ok: true, status: 200, json: () => Promise.resolve({ v: 1, pulls: ids }) }
    : { ok: false, status: 404, json: () => Promise.resolve({}) });
  w.eval(src);
  await w.AcePulls.ready();
  for (const id of ids) assert.equal(w.AcePulls.isPulled(id), true, id);
  // a pulled night also pulls its scenes
  assert.equal(w.AcePulls.isPulled('retold:bio:1:3'), true);
  w.close();
});
