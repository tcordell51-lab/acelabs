/* Self-hosted fonts on every page (B1 step 5): no page, stylesheet or script names a font
   host; every page that links shared/al-fonts.css preloads the two faces most pages draw
   with; the legacy family names (shared/al-fonts-legacy.css) resolve to the brand files
   only; a page that still names a legacy family loads that file; the CSP allows no font host.
   Plain node:test, no browser (the page audit checks the same thing in Chromium). */
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const HOST = /fonts\.(googleapis|gstatic)\.com/;
const LEGACY = /Playfair Display|Newsreader|Hanken Grotesk/;
const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const faces = (css) => [...strip(css).matchAll(/@font-face\{([^}]*)\}/g)].map((m) => {
  const f = m[1]; const g = (k) => (f.match(new RegExp(k + ':"?([^;"]+)"?')) || [])[1];
  return { family: g('font-family'), url: (f.match(/url\("([^"]+)"\)/) || [])[1], style: g('font-style'), display: g('font-display'), weight: g('font-weight'), raw: f };
});

// every file the deploy can serve (the shared gates' skip rules), redirected pages included
const SKIP_REL = /^(node_modules|\.git|docs|research|specs|scripts|test-screenshots|\.netlify|netlify|\.claude|dist-astro|astro-proto)(\/|$)|^tests\/[^/]+\//;
const SKIP_SEG = /(^|\/)(research|verification)(\/|$)/;
function walk(dir = ROOT, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name); const rel = path.relative(ROOT, p).split(path.sep).join('/');
    if (SKIP_REL.test(rel) || SKIP_SEG.test(rel)) continue;
    if (e.isDirectory()) walk(p, out); else if (/\.(html?|css|m?js)$/i.test(rel)) out.push(rel);
  }
  return out;
}
const FILES = walk();
const PAGES = FILES.filter((f) => /\.html?$/i.test(f));
const local = (page, url) => { const u = url.split(/[?#]/)[0]; if (/^(https?:)?\/\//.test(u) || u.startsWith('data:')) return null; return u.startsWith('/') ? u.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(page), u)); };

test('no served page, stylesheet or script names a font host', () => {
  const hits = FILES.filter((f) => HOST.test(read(f)));
  assert.deepStrictEqual(hits, []);
  assert.ok(PAGES.length > 150, 'pages walked: ' + PAGES.length);
});

test('the CSP allows no font host: fonts and styles come from the site', () => {
  const csp = read('netlify.toml').match(/^\s*Content-Security-Policy\s*=\s*"([^"]+)"/m)[1];
  const dir = (k) => (csp.split(';').map((s) => s.trim()).find((s) => s.startsWith(k + ' ')) || '').split(/\s+/).slice(1);
  assert.deepStrictEqual(dir('font-src'), ["'self'"]);
  assert.deepStrictEqual(dir('style-src'), ["'self'", "'unsafe-inline'"]);
  assert.doesNotMatch(csp, HOST);
});

test('legacy names answer from the brand files only: display to Sora, italic to DM Sans italic, Hanken to its own file', () => {
  const css = read('shared/al-fonts-legacy.css');
  assert.doesNotMatch(strip(css), /playfair[^"]*\.woff|newsreader[^"]*\.woff|https?:|@import/i);
  const list = faces(css);
  assert.deepStrictEqual(list.map((f) => `${f.family} ${f.style} ${f.url}`), [
    'Playfair Display normal fonts/sora-v1.woff2',
    'Playfair Display italic fonts/dmsans-italic-v1.woff2',
    'Newsreader normal fonts/sora-v1.woff2',
    'Newsreader italic fonts/dmsans-italic-v1.woff2',
    'Hanken Grotesk normal fonts/hanken-wght-normal.woff2',
  ]);
  const brand = Object.fromEntries(faces(read('shared/al-fonts.css')).map((f) => [f.url, f]));
  for (const f of list) {
    assert.strictEqual(f.display, 'swap', f.family);
    const file = path.join(ROOT, 'shared', f.url);
    assert.strictEqual(fs.readFileSync(file).subarray(0, 4).toString('latin1'), 'wOF2', f.url);
    if (f.family === 'Hanken Grotesk') {
      assert.match(read('shared/ace-pages.css'), /url\("\/shared\/fonts\/hanken-wght-normal\.woff2"\)/, 'the file ace-pages.css serves');
      const ofl = read('shared/fonts/OFL-HankenGrotesk.txt');
      assert.match(ofl, /Hanken Grotesk Project Authors/); assert.match(ofl, /SIL OPEN FONT LICENSE Version 1\.1/);
      continue;
    }
    assert.ok(brand[f.url], f.url + ' is one of al-fonts.css files, so nothing downloads twice');
    assert.strictEqual(f.weight, brand[f.url].weight, f.family + ' ' + f.style + ' keeps the weight range of the file');
    assert.ok(!(f.url.includes('sora') && f.style === 'italic'), 'never a slanted Sora');
  }
});

test('every page on the self-hosted fonts links them the same way: two preloads, al-fonts.css, then the legacy names', () => {
  const on = PAGES.filter((p) => /al-fonts(-legacy)?\.css/.test(read(p)));
  assert.ok(on.length >= 140, 'pages on al-fonts.css: ' + on.length);
  const bad = [];
  for (const p of on) {
    const src = read(p).replace(/<!--[\s\S]*?-->/g, '');
    const links = [...src.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
    const pre = links.filter((l) => /rel="preload"/.test(l) && /as="font"/.test(l));
    const hrefs = pre.map((l) => (l.match(/href="([^"]+)"/) || [])[1]);
    if (hrefs.join(' ') !== '/shared/fonts/dmsans-v1.woff2 /shared/fonts/sora-v1.woff2') bad.push(p + ': preloads ' + hrefs.join(' '));
    for (const l of pre) if (!/type="font\/woff2"/.test(l) || !/\bcrossorigin\b/.test(l)) bad.push(p + ': a font preload needs type="font/woff2" and crossorigin: ' + l);
    const iFonts = links.findIndex((l) => /href="\/shared\/al-fonts\.css\?v=\d+"/.test(l));
    const iLegacy = links.findIndex((l) => /href="\/shared\/al-fonts-legacy\.css\?v=\d+"/.test(l));
    const iPre = links.findIndex((l) => /rel="preload"/.test(l) && /as="font"/.test(l));
    if (iFonts < 0) bad.push(p + ': no /shared/al-fonts.css');
    if (iLegacy >= 0 && iLegacy < iFonts) bad.push(p + ': al-fonts-legacy.css before al-fonts.css');
    if (iPre > iFonts) bad.push(p + ': preloads after the stylesheet');
  }
  assert.deepStrictEqual(bad, []);
});

test('a page that names a legacy family (itself or in a local file it loads) loads al-fonts-legacy.css', () => {
  const missing = [];
  for (const p of PAGES) {
    const src = read(p);
    const deps = [...src.matchAll(/<(?:link|script)\b[^>]*?(?:href|src)\s*=\s*["']([^"']+\.(?:css|m?js)(?:\?[^"']*)?)["']/gi)].map((m) => local(p, m[1])).filter(Boolean)
      .filter((d) => !/^shared\/(al-fonts-legacy|al-tokens|ace-pages)\.css$/.test(d) && fs.existsSync(path.join(ROOT, d)));
    const own = src.replace(/<link\b[^>]*>/gi, '');
    // ace-pages.css declares Hanken itself; al-tokens.css names Playfair only in the frozen --al-font-serif
    const serif = (t) => /var\(--al-font-serif\)/.test(t);
    const names = LEGACY.test(own) || serif(own) || deps.some((d) => LEGACY.test(read(d)) || serif(read(d)));
    if (!names) continue;
    const display = (t) => /Playfair Display|Newsreader/.test(t) || serif(t);
    const viaPages = /ace-pages\.css/.test(src) && !display(own) && !deps.some((d) => display(read(d)));
    if (!viaPages && !/\/shared\/al-fonts-legacy\.css\?v=\d+/.test(src)) missing.push(p);
  }
  assert.deepStrictEqual(missing, []);
});
