// Out-of-scope and defective items never reach a student (scripts/bank/scope-exclusions.json).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exclusionSet, isExcluded } from '../../netlify/lib/ace-exclusions.mjs';
import { deliverable, excludedIds, formContent, formItems } from '../../netlify/lib/ace-bank-store.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const X = exclusionSet(read('scripts/bank/scope-exclusions.json'));
const MUST = ['qr:climb-1tb6pfn', 'qr:QR_xp005', 'qr-geo-0007', 'qr-fmt-0002', 'qr-alg-0085', 'gc-0677', 'gc-0916', 'oc:OC_lf003'];

test('the list holds the 36 QR items, gc-0677, gc-0916 and oc:OC_lf003, in either spelling', () => {
  assert.equal(Object.keys(read('scripts/bank/scope-exclusions.json').qr).length, 36);
  for (const id of MUST) assert.ok(isExcluded(id, X), id);
  for (const id of ['qr:qr-geo-0007', 'gc:gc-0916', 'gc:gc-0677', 'OC_lf003']) assert.ok(isExcluded(id, X), id);
  assert.ok(!isExcluded('gc:gc-0915', X)); assert.ok(!isExcluded('qr:climb-zzzz', X));
  assert.throws(() => exclusionSet(null));
});

test('no served bank, source or form holds an excluded item', () => {
  const files = ['data/qr-climb.json', 'data/qr-dat.json', 'data/ochem.json', 'data/gchem.json', 'data/bio.json', 'games/qr.json', 'scripts/dat-mock-bank.json',
    'data/free/diagnostic-bank.json', 'data/free/sample-qr-climb.json', 'data/free/sample-qr-dat.json', 'data/free/sample-ochem.json', 'data/free/sample-gchem.json'];
  for (const f of files) {
    const ids = []; (function walk(o) { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') { if (typeof o.id === 'string') ids.push(o.id); Object.values(o).forEach(walk); } })(read(f));
    for (const id of ids) assert.ok(!isExcluded(id, X), f + ' holds ' + id);
  }
  for (const f of read('scripts/bank/forms.json').forms) for (const ids of Object.values(f.sections)) for (const id of ids || []) assert.ok(!isExcluded(id, X), f.id + ' holds ' + id);
  const pin = read('scripts/bank/pin.json');
  for (const ids of Object.values(pin.seed)) for (const id of ids) assert.ok(!isExcluded(id, X), 'seed holds ' + id);
  const q = JSON.stringify(read('scripts/bank/review-queue.json'));
  for (const id of ['gc-0916', 'gc-0677', 'qr-geo-0007']) assert.ok(!q.includes('"gc:' + id + '"') && !q.includes('"qr:' + id + '"'), 'queue holds ' + id);
});

test('Full-Length Test 5 no longer carries gc-0916', () => {
  const f5 = read('scripts/bank/forms.json').forms.find((f) => f.name === 'Full-Length Test 5');
  assert.ok(f5 && !f5.sections.gc.includes('gc:gc-0916'));
  assert.equal(f5.sections.gc.length, 29);
});

test('the bank functions drop excluded ids even when a form or the pool still names them', () => {
  assert.ok(excludedIds().has('gc-0916'));
  assert.equal(deliverable('gc:gc-0916'), false); assert.equal(deliverable('qr:qr-geo-0001'), false); assert.equal(deliverable('gc:gc-0915'), true);
  const it = (id) => ({ id, topic: 't', topicName: 'T', difficulty: 1, stem: 's', choices: ['a', 'b', 'c', 'd', 'e'], answer: 0, why: 'w', traps: [] });
  const dir = fs.mkdtempSync(path.join(fs.realpathSync('/tmp'), 'exl-'));
  fs.writeFileSync(path.join(dir, 'gchem.json'), JSON.stringify({ items: [it('gc:gc-0915'), it('gc:gc-0916')] }));
  for (const b of ['bio', 'ochem', 'qr', 'rc']) fs.writeFileSync(path.join(dir, b + '.json'), JSON.stringify({ items: [] }));
  const form = { id: 'T', name: 'T', sections: { gc: ['gc:gc-0915', 'gc:gc-0916'] }, rc: null };
  assert.deepEqual(formItems(form, { dir }), ['gc:gc-0915']);
  assert.deepEqual(formContent(form, { dir }).sections.gc.map((x) => x.id), ['gc:gc-0915']);
});
