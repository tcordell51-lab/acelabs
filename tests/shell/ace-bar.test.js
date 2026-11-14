// The two bar scripts must offer the same places at the same addresses: node --test
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const read = (f) => fs.readFileSync(path.join(__dirname, '..', '..', 'shared', f), 'utf8');
const places = (src) => [...src.matchAll(/\{ id: '([a-z]+)', label: '([^']+)', href: '([^']+)'/g)].map((m) => m.slice(1, 4).join('|'));
test('ace-shell.js and ace-ui.js list the same nine places', () => {
  const a = places(read('ace-ui.js')), b = places(read('ace-shell.js'));
  assert.strictEqual(a.length, 9);
  assert.deepStrictEqual(b, a);
});
test('the brand links to the hub in both bars', () => {
  assert.match(read('ace-ui.js'), /class="aui-bar__brand" href="' \+ withStudent\('\/'\)/);
  assert.match(read('ace-shell.js'), /class="brand" href="' \+ esc\(withStudent\('\/'\)\)/);
});
