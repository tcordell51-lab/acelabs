/* Tokens v2 (shared/al-tokens.css), self-hosted fonts (shared/al-fonts.css) and the
   brand files (shared/brand/). Plain node:test; the CSS parser and contrast math come
   from scripts/gate-contrast.mjs so the gate and these tests read the file one way. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const TOKENS = read('shared/al-tokens.css');
const FONTS = read('shared/al-fonts.css');
const gate = () => import(path.join(ROOT, 'scripts/gate-contrast.mjs'));

// tokens v1 (shared/al-tokens.css?v=2): every name keeps this exact value, unthemed
const V1 = [
  ['--al-bg', '#f5f0e8'], ['--al-paper', '#fffdf7'], ['--al-paper-2', '#f9f3e6'], ['--al-paper-3', '#f3ecdb'],
  ['--al-ink', '#0d2018'], ['--al-ink-2', '#3a4a42'], ['--al-ink-mute', '#5c6a63'], ['--al-ink-soft', '#9aa39e'],
  ['--al-gold', '#C9A84C'], ['--al-gold-m', '#E2C97A'], ['--al-gold-d', '#8C7235'],
  ['--al-gold-bg', 'rgba(201,168,76,.10)'], ['--al-gold-glow', 'rgba(201,168,76,.35)'],
  ['--al-teal', '#1B3A2D'], ['--al-teal-2', '#2A5240'], ['--al-teal-3', '#3A6B54'],
  ['--al-good', '#009E73'], ['--al-good-d', '#007a59'], ['--al-trap', '#D55E00'], ['--al-trap-d', '#9b4500'],
  ['--al-line', 'rgba(13,32,24,.12)'], ['--al-line-2', 'rgba(13,32,24,.20)'],
  ['--al-qr-color', '#C9A84C'], ['--al-bio-color', '#5FA874'], ['--al-gc-color', '#3A6B54'], ['--al-ochem-color', '#8C7235'],
  ['--al-font-serif', "'Playfair Display',Georgia,serif"],
  ['--al-font-sans', "'DM Sans',system-ui,-apple-system,sans-serif"],
  ['--al-font-mono', "'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace"],
  ['--al-shadow', '0 1px 3px rgba(13,32,24,.06), 0 8px 24px rgba(13,32,24,.04)'],
  ['--al-shadow-md', '0 2px 6px rgba(13,32,24,.08), 0 16px 40px rgba(13,32,24,.06)'],
  ['--al-shadow-lg', '0 4px 14px rgba(13,32,24,.10), 0 24px 56px rgba(13,32,24,.08)'],
  ['--al-confirmed', '#009E73'], ['--al-confirmed-pale', 'rgba(0,158,115,.10)'],
  ['--al-needs-review', '#D55E00'], ['--al-needs-review-pale', 'rgba(213,94,0,.10)'],
  ['--al-almost', '#E69F00'], ['--al-almost-pale', 'rgba(230,159,0,.10)'],
  ['--al-new', '#0072B2'], ['--al-new-pale', 'rgba(0,114,178,.10)'],
  ['--motion-fast', '150ms'], ['--motion-base', '250ms'], ['--motion-slow', '400ms'], ['--motion-explainer', '800ms'],
];

test('tokens: every v1 name keeps its exact value', async () => {
  const { parseTokens } = await gate();
  const { root } = parseTokens(TOKENS);
  for (const [k, v] of V1) assert.strictEqual(root.get(k), v, k);
});

test('tokens: no --al-* is themed; dark blocks touch --s-* only and agree', async () => {
  const { parseTokens } = await gate();
  const p = parseTokens(TOKENS);
  assert.ok(p.darkMedia.size > 10 && p.darkAttr.size > 10, 'both dark blocks exist');
  for (const m of [p.darkMedia, p.darkAttr]) for (const k of m.keys()) assert.ok(k.startsWith('--s-'), k + ' is themed');
  assert.deepStrictEqual([...p.darkMedia].sort(), [...p.darkAttr].sort());
  // no other rule anywhere in the file sets an --al-* name
  for (const b of p.blocks) if (!(b.selector === ':root' && !b.media)) assert.ok(!/--al-[\w-]+\s*:/.test(b.body), 'an --al-* name is set under ' + b.selector);
  // the file sets no color-scheme of its own (pages that only read --al-* keep a light canvas)
  assert.ok(!/(^|[;{\s])color-scheme\s*:/.test(TOKENS.replace(/\/\*[\s\S]*?\*\//g, '')), 'al-tokens.css sets color-scheme');
  assert.strictEqual(p.root.get('--s-scheme'), 'light');
  assert.strictEqual(p.darkMedia.get('--s-scheme'), 'dark');
});

test('tokens: every var() resolves in every theme', async () => {
  const { parseTokens, themes, resolve } = await gate();
  for (const [name, map] of Object.entries(themes(parseTokens(TOKENS)))) {
    for (const [k, v] of map) assert.doesNotThrow(() => resolve(map, v), `${name}: ${k}`);
  }
});

test('tokens: brand primitives, mint roles and the logo colors', async () => {
  const { parseTokens, themes, resolve } = await gate();
  const T = themes(parseTokens(TOKENS));
  const L = (k) => resolve(T.light, `var(${k})`), D = (k) => resolve(T.dark, `var(${k})`);
  assert.strictEqual(L('--al-logo-green'), '#1B3A2D');
  assert.strictEqual(L('--al-logo-gold'), '#C9A84C');
  assert.strictEqual(L('--al-logo-cream'), '#F5F0E8');
  assert.strictEqual(L('--al-mint'), '#33C993');
  assert.strictEqual(L('--s-mint-ink'), '#096E4F');
  assert.strictEqual(D('--s-mint-ink'), '#6FF0C3');
  assert.strictEqual(L('--s-mint-wash'), '#E0F7EC');
  assert.strictEqual(D('--s-mint-wash'), '#11352A');
  assert.strictEqual(D('--b-mint-ink'), L('--b-mint-ink'), 'the bench does not invert');
  // the logo files carry exactly these fills
  const svg = (f) => read('shared/brand/' + f);
  assert.match(svg('ace-dat-lockup-v1.svg'), /fill="#1B3A2D"/);
  assert.match(svg('ace-dat-lockup-reversed-v1.svg'), /fill="#F5F0E8"/);
  for (const f of ['ace-dat-lockup-v1.svg', 'ace-dat-lockup-reversed-v1.svg', 'ace-dat-mark-v1.svg', 'ace-dat-mark-reversed-v1.svg', 'icon-v1.svg']) assert.match(svg(f), /fill="#C9A84C"/, f + ' gold bar');
  /* /shared is cached for a year and no ?v= gate reads a url() or an img src: every logo file carries its version in its name */
  for (const f of fs.readdirSync(path.join(ROOT, 'shared/brand'))) assert.match(f, /-v\d+\.svg$/, 'shared/brand/' + f + ' names its version');
  for (const k of ['--s-logo', '--s-logo-mark', '--b-logo', '--b-logo-mark']) {
    for (const map of [T.light, T.dark]) {
      const u = resolve(map, `var(${k})`).match(/url\("([^"]+)"\)/)[1];
      assert.ok(u.startsWith('/shared/brand/') && fs.existsSync(path.join(ROOT, u)), k + ' -> ' + u);
    }
  }
  assert.strictEqual(resolve(T.dark, 'var(--s-logo)'), 'url("/shared/brand/ace-dat-lockup-reversed-v1.svg")');
});

test('tokens: type is Sora / DM Sans / JetBrains Mono, never Playfair in new names', async () => {
  const { parseTokens } = await gate();
  const { root } = parseTokens(TOKENS);
  assert.match(root.get('--f-display'), /^"Sora"/);
  assert.match(root.get('--f-body'), /^"DM Sans"/);
  assert.match(root.get('--f-mono'), /^"JetBrains Mono"/);
  for (const [k, v] of root) if (k !== '--al-font-serif') assert.ok(!/Playfair/i.test(v), k + ' names Playfair');
  assert.match(root.get('--font-coach'), /^italic .*var\(--f-voice\)$/, 'the coach voice is the DM Sans italic, not a slanted Sora');
  for (const k of ['--font-hero', '--font-h1', '--font-h2', '--font-h3']) assert.ok(!/italic/.test(root.get(k)), k);
});

test('tokens: reduced motion turns every motion token into a cut', () => {
  const css = TOKENS.replace(/\/\*[\s\S]*?\*\//g, '');
  const m = css.match(/@media \(prefers-reduced-motion: reduce\)\{([\s\S]*?)\n\}/);
  assert.ok(m, 'reduced-motion block');
  for (const k of ['--m-tap', '--m-state', '--m-panel', '--m-travel', '--m-reveal', '--m-card', '--m-frame']) assert.match(m[1], new RegExp(k + ':1ms'));
  for (const k of ['--motion-fast', '--motion-base', '--motion-slow', '--motion-explainer']) assert.match(m[1], new RegExp(k + ':\\.01ms'));
  assert.match(m[1], /animation-duration:\.01ms !important/);
  assert.match(m[1], /transition-duration:\.01ms !important/);
});

test('tokens: every text pair passes 4.5:1 in light, dark and on the bench', async () => {
  const { check } = await gate();
  const { rows, problems } = check(TOKENS);
  assert.ok(rows.length > 150, 'pairs checked: ' + rows.length);
  assert.deepStrictEqual(problems, []);
});

test('fonts: self-hosted, versioned, OFL beside them, no Playfair, no font host', () => {
  const css = FONTS.replace(/\/\*[\s\S]*?\*\//g, '');
  const faces = [...css.matchAll(/@font-face\{([^}]*)\}/g)].map((m) => m[1]);
  assert.strictEqual(faces.length, 4);
  const fam = faces.map((f) => f.match(/font-family:"([^"]+)"/)[1]);
  assert.deepStrictEqual([...new Set(fam)].sort(), ['DM Sans', 'JetBrains Mono', 'Sora']);
  assert.ok(!/playfair|googleapis|gstatic|https?:/i.test(css));
  for (const f of faces) {
    const u = f.match(/url\("([^"]+)"\)/)[1];
    assert.match(u, /^fonts\/[a-z-]+-v\d+\.woff2$/, 'versioned name: ' + u);
    const file = path.join(ROOT, 'shared', u);
    assert.ok(fs.existsSync(file), u);
    assert.strictEqual(fs.readFileSync(file).subarray(0, 4).toString('latin1'), 'wOF2', u + ' is woff2');
    assert.match(f, /font-display:swap/);
  }
  assert.match(faces.find((f) => /"Sora"/.test(f)), /font-style:normal/);
  assert.ok(!faces.some((f) => /"Sora"/.test(f) && /italic/.test(f)), 'Sora has no italic');
  for (const [file, holder] of [['OFL-Sora.txt', 'Sora Project Authors'], ['OFL-DMSans.txt', 'DM Sans Project Authors'], ['OFL-JetBrainsMono.txt', 'JetBrains Mono Project Authors']]) {
    const t = read('shared/fonts/' + file);
    assert.match(t, new RegExp(holder));
    assert.match(t, /SIL OPEN FONT LICENSE Version 1\.1/);
  }
});

test('brand: favicon is the AD mark in four sizes; Today links the icon', () => {
  const ico = fs.readFileSync(path.join(ROOT, 'favicon.ico'));
  assert.strictEqual(ico.readUInt16LE(2), 1, 'icon type');
  const n = ico.readUInt16LE(4); const sizes = [];
  for (let i = 0; i < n; i++) sizes.push(ico.readUInt8(6 + 16 * i) || 256);
  assert.deepStrictEqual(sizes, [16, 32, 48, 64]);
  const png = fs.readFileSync(path.join(ROOT, 'apple-touch-icon.png'));
  assert.strictEqual(png.readUInt32BE(16), 180);
  assert.match(read('shared/brand/icon-v1.svg'), /fill="#1B3A2D"/);
  const home = read('ace-labs.html');
  assert.match(home, /<link rel="icon" type="image\/svg\+xml" href="\/shared\/brand\/icon-v1\.svg">/);
});

test('includers: every page loads al-tokens.css at the same new ?v=', () => {
  const pages = ['404.html', 'mocks-catalog.html', 'prometric-mock.html', 'test-day-readiness.html', 'test-week.html', 'scope.html',
    'retold/index.html', 'tools/bio/bio-immune-cells.html', 'tools/ochem/index.html', 'tools/gc/trends.html', 'tools/gc/traps.html',
    'tools/gc/lewis-sandbox.html', 'tools/gc/recognition-lab.html', 'unified-mock.html', 'onboarding.html', 'for-retakers.html'];
  for (const p of pages) assert.match(read(p), /al-tokens\.css\?v=5["']/, p);
});

/* shared/al-motion.css backs up the tokens on pages that load it alone, so its values must be the tokens' own */
test('al-motion.css: the same motion tokens and reduced-motion reset as tokens v2, value for value', async () => {
  const { parseTokens } = await gate();
  const MOTION = read('shared/al-motion.css');
  const tok = parseTokens(TOKENS).root, mot = parseTokens(MOTION).root;
  const names = [...tok.keys()].filter((k) => /^--(m|e|motion)-/.test(k));
  assert.ok(names.length >= 15, 'motion names in the tokens: ' + names.length);
  for (const k of names) assert.strictEqual(mot.get(k), tok.get(k), k);
  for (const k of mot.keys()) assert.ok(tok.has(k), k + ' is not a tokens v2 name');
  const reset = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '').match(/@media \(prefers-reduced-motion: reduce\)\{([\s\S]*?)\n\}/)[1].replace(/\s+/g, '');
  assert.strictEqual(reset(MOTION), reset(TOKENS), 'the reduced-motion block is the tokens one');
  assert.doesNotMatch(MOTION, /[^\x00-\x7e]/, 'plain ASCII');
});

/* shared/ace-labs-shell.css reads tokens v2: only two legacy surfaces stay local, no retired face is named */
test('ace-labs-shell.css: on tokens v2, loaded after the tokens on every page', async () => {
  const { parseTokens } = await gate();
  const SHELL = read('shared/ace-labs-shell.css');
  const p = parseTokens(SHELL);
  assert.deepStrictEqual([...p.root.keys()].sort(), ['--al-paper-2', '--al-paper-3'], 'only the legacy surfaces are local');
  const css = SHELL.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(css, /Playfair|'DM Sans'|'JetBrains Mono'|Georgia/, 'faces come from --f-*');
  for (const m of css.matchAll(/[^{}]*\bem\{[^}]*\}/g)) if (/font-style:italic/.test(m[0])) assert.match(m[0], /font-family:var\(--f-voice\)/, 'an italic accent is DM Sans italic: ' + m[0].trim());
  const used = new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]));
  const tok = parseTokens(TOKENS).root;
  for (const k of used) assert.ok(tok.has(k) || p.root.has(k), k + ' is defined by the tokens');
  const includers = ['unified-mock.html', 'onboarding.html', 'mocks-catalog.html', '404.html', 'test-day-readiness.html', 'prometric-mock.html', 'test-week.html',
    'tools/gc/trends.html', 'tools/gc/traps.html', 'tools/gc/lewis-sandbox.html', 'tools/gc/recognition-lab.html', 'retold/index.html', 'scope.html', 'for-retakers.html'];
  for (const page of includers) {
    const html = read(page), t = html.indexOf('al-tokens.css?v='), s = html.indexOf('ace-labs-shell.css?v=');
    assert.ok(s > 0 && t > 0 && t < s, page + ' loads the tokens before the shell stylesheet');
  }
});
