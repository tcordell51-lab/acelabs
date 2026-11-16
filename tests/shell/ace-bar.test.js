// The two bar scripts must offer the same places at the same addresses: node --test
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const read = (f) => fs.readFileSync(path.join(__dirname, '..', '..', 'shared', f), 'utf8');
const places = (src) => [...src.matchAll(/\{ id: '([a-z]+)', label: '([^']+)', href: '([^']+)'/g)].map((m) => m.slice(1, 4).join('|'));
const sorted = (x) => x.slice().sort();
test('one navigation: the top bars and the phone tab bar list the same five places (2026-11-16)', () => {
  const a = places(read('ace-ui.js')), b = places(read('ace-shell.js')), t = places(read('ace-tabs.js'));
  assert.deepStrictEqual(sorted(a), ['labs|Labs|/labs/', 'progress|Progress|/progress/', 'repair|Repair|/repair/', 'test|Test|/tests/', 'today|Today|/']);
  assert.deepStrictEqual(sorted(b), sorted(a));
  assert.deepStrictEqual(sorted(t), sorted(a));
});
test('both bars load the tab bar themselves, so an older page that has the bar has the tabs', () => {
  for (const f of ['ace-ui.js', 'ace-shell.js']) assert.match(read(f), /\/shared\/ace-tabs\.js\?v=\d+/);
});
test('the brand links to the hub in both bars', () => {
  assert.match(read('ace-ui.js'), /class="aui-bar__brand" href="' \+ withStudent\('\/'\)/);
  assert.match(read('ace-shell.js'), /class="brand" href="' \+ esc\(withStudent\('\/'\)\)/);
});
