// node --test tests/explainers/pinned/pinned.test.mjs
// The pinned explainers (hydroboration, clinic crates) must render byte for byte as their
// golden files at 390 and 1280 px. See pinned.mjs; re-take goldens only with Thomas's yes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PINNED, renderPinned, goldenPath } from './pinned.mjs';

test('pinned explainers render byte for byte as their golden files', { timeout: 120000 }, async () => {
  const got = await renderPinned();
  assert.equal(got.length, PINNED.length * 2);
  for (const r of got) {
    const g = goldenPath(r.qid, r.w);
    assert.ok(fs.existsSync(g), 'golden file missing: ' + g);
    assert.ok(r.html && /<svg/.test(r.html), r.qid + ' ' + r.w + ': no picture drawn');
    assert.ok(Buffer.from(r.html).equals(fs.readFileSync(g)), r.qid + ' at ' + r.w + ' px differs from ' + g);
  }
});
