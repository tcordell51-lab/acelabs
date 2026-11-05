/* scripts/run-node-tests.mjs: test:kit runs on any shell, with test folders that do not exist yet. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '../..');
const RUNNER = path.join(ROOT, 'scripts/run-node-tests.mjs');

function tree(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'run-node-tests-'));
  for (const [f, body] of Object.entries(files)) { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), body); }
  return dir;
}

test('testFiles: each folder\'s own *.test.js, area folders by /*, missing folders skipped, fixtures left out', async () => {
  const { testFiles, KIT_SET } = await import(path.join(ROOT, 'scripts/run-node-tests.mjs'));
  const dir = tree({
    'tests/kit/a.test.js': '', 'tests/kit/b.js': '', 'tests/kit/fixtures/c.test.js': '',
    'tests/loop/l.test.js': '', 'tests/areas/bio/x.test.js': '', 'tests/areas/qr/y.test.js': '', 'tests/areas/README.md': '',
  });
  try {
    assert.deepEqual(testFiles(KIT_SET, dir), ['tests/kit/a.test.js', 'tests/loop/l.test.js', 'tests/areas/bio/x.test.js', 'tests/areas/qr/y.test.js']);
    assert.deepEqual(testFiles(['tests/doors', 'tests/player', 'tests/nothing/*'], dir), [], 'folders that do not exist yet');
    assert.deepEqual(testFiles(['tests/kit/', 'tests\\kit'], dir), ['tests/kit/a.test.js'], 'a trailing slash or a backslash, counted once');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('the runner exits 0 when the folders hold no test yet', () => {
  const none = spawnSync(process.execPath, [RUNNER, 'tests/no-such-folder', 'tests/also-missing/*'], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(none.status, 0, none.stderr);
  assert.match(none.stdout, /nothing to run/);
});

test('test:kit runs through the runner over the kit, loop, doors, player and area folders', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.match(pkg.scripts['test:kit'], /^node scripts\/run-node-tests\.mjs tests\/kit tests\/loop tests\/doors tests\/player "tests\/areas\/\*"$/);
  assert.match(pkg.scripts['test:unit'], /npm run test:kit/);
});
