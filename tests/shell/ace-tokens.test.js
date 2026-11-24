// One design system: the older stylesheets take their tokens from shared/ace-ui.css,
// and every place that names a shared file names the version the pages load.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.join(__dirname, '..', '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const pageVersion = (name) => { const m = read('index.html').match(new RegExp('shared/' + name.replace('.', '\\.') + '\\?v=(\\w+)')); return m && m[1]; };

test('legacy token files import ace-ui.css at the version the pages load', () => {
  const v = pageVersion('ace-ui.css'); assert.ok(v, 'home page loads ace-ui.css with a version');
  for (const f of ['shared/ace-cream.css', 'shared/al-tokens.css', 'shared/ace-labs-shell.css', 'shared/ace-pages.css', 'sign-in/ace-account.css']) {
    const m = read(f).match(/@import url\("\/shared\/ace-ui\.css\?v=(\w+)"\)/);
    assert.ok(m, f + ' imports ace-ui.css'); assert.strictEqual(m[1], v, f + ' imports ace-ui.css?v=' + v);
  }
});

test('legacy stylesheets define no brand color of their own', () => {
  for (const f of ['shared/al-tokens.css', 'shared/ace-pages.css']) {
    const block = read(f).match(/:root(?::root)?\s*\{[\s\S]*?\}/); assert.ok(block, f + ' has an alias block');
    assert.ok(!/#1B3A2D|#F5F0E8|#C9A84C/i.test(block[0]), f + ' aliases tokens and does not restate the hex');
  }
});

test('ace-shell.js skins older pages with the ace-cream.css version the pages load', () => {
  const m = read('shared/ace-shell.js').match(/CREAM\s*=\s*'(\w+)'/); assert.ok(m, 'CREAM version present');
  const page = read('cheat-sheets.html').match(/shared\/ace-cream\.css\?v=(\w+)/); assert.ok(page);
  assert.strictEqual(m[1], page[1]);
});

test('phone text floors on the older pages are up to date', () => {
  const out = execFileSync('node', [path.join(root, 'scripts/design/fit-pages.mjs'), '--check'], { cwd: root, encoding: 'utf8' });
  assert.match(out, /OK/);
});
