/* The release gates and page tools (B1 step 4): the copy gate, the clock gate, the contrast
   gate's exam pairs, the served-file walker, and the static server the audit and shots use.
   Plain node:test, no browser. */
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..', '..');
const imp = (rel) => import(path.join(ROOT, rel));
const rules = (hits) => hits.map((h) => h.rule + ':' + h.what);

test('copy gate: glyphs count as the glyph they draw, in text, entities, escapes and CSS content', async () => {
  const { scan } = await imp('scripts/gate-copy.mjs');
  const html = '<p>One \u2014 two &mdash; three &middot; four \u2705</p>\n<style>.a::after{content:"\\00b7"}</style>\n<script>el.textContent = "A \\u2013 B";</script>';
  const r = rules(scan('x.html', html));
  assert.deepStrictEqual(r.filter((x) => x.startsWith('dash')).length, 3, r.join(' '));
  assert.deepStrictEqual(r.filter((x) => x.startsWith('middot')).length, 2, r.join(' '));
  assert.ok(r.includes('emoji:U+2705'));
  assert.deepStrictEqual(rules(scan('x.html', '<p>Plain&nbsp;ASCII, &amp; nothing else.</p>')), []);
});

test('copy gate: banned words in copy, not in code', async () => {
  const { scan } = await imp('scripts/gate-copy.mjs');
  const flagged = (src, rel = 'x.html') => scan(rel, src).filter((h) => h.rule !== 'non-ascii').map((h) => h.rule);
  assert.deepStrictEqual(flagged('<p>That was wrong.</p>'), ['word']);
  assert.deepStrictEqual(flagged('<button aria-label="Incorrect">x</button>'), ['word']);
  assert.deepStrictEqual(flagged('<div class="opt wrong" data-state="failed">Pick one</div>'), []);
  assert.deepStrictEqual(flagged("el.classList.add('wrong'); if (s === 'failed') go(); console.warn('fetch failed');", 'x.js'), []);
  assert.deepStrictEqual(flagged("note.textContent = 'You failed this one';", 'x.js'), ['word']);
  assert.deepStrictEqual(flagged("el.className = 'diag-section-badge badge-' + s;", 'x.js'), []);
  assert.deepStrictEqual(flagged('const h = `<span class="tag ${ok ? \'right\' : \'wrong\'}">${ok ? \'Confirmed\' : \'Wrong\'}</span>`;', 'x.js'), ['word']);
  assert.deepStrictEqual(flagged('var s = "copy-gate-ok marks code"; var t = "wrong"; // copy-gate-ok', 'x.js'), []);
});

test('copy gate: game, countdown, confidence and payment words, with the science words left alone', async () => {
  const { scan } = await imp('scripts/gate-copy.mjs');
  const flagged = (text) => scan('x.html', '<p>' + text + '</p>').map((h) => h.rule);
  for (const [t, rule] of [['Day streak: 4', 'streak'], ['+10 points', 'points'], ['Earn 50 XP', 'points'], ['A new personal best', 'score'],
    ['Top the leaderboard', 'score'], ['You earned a badge', 'badge'], ['12 days left', 'countdown'], ['30 days to go', 'countdown'],
    ['How sure are you?', 'confidence'], ['Pick a confidence level', 'confidence'], ['Upgrade now', 'payment'], ['Enter your credit card', 'payment'], ['$29/mo', 'payment']]) assert.deepStrictEqual(flagged(t), [rule], t);
  for (const t of ['The primitive streak forms in amniotes.', 'Plot the data points on the line.', 'Boiling points rise with mass.',
    'A store offers a 20 percent discount and a coupon for 10 dollars.', 'Click a colored badge on the molecule.', 'Xeroderma pigmentosum (XP) is a repair defect.'])
    assert.deepStrictEqual(flagged(t), [], t);
});

test('copy gate: the baseline ratchets per file and per rule', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'copy-gate-'));
  try {
    fs.writeFileSync(path.join(tmp, 'a.html'), '<p>One \u2014 two</p>');
    const run = (...a) => spawnSync(process.execPath, [path.join(ROOT, 'scripts/gate-copy.mjs'), '--root', tmp, ...a], { encoding: 'utf8' });
    assert.strictEqual(run('--write-baseline').status, 0);
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(path.join(tmp, 'scripts/copy-baseline.json'), 'utf8')), { 'a.html': { dash: 1 } });
    assert.strictEqual(run('--baseline').status, 0);
    assert.strictEqual(run().status, 1, 'no flag is strict over the whole site');
    fs.writeFileSync(path.join(tmp, 'a.html'), '<p>One \u2014 two, that was wrong</p>');
    const over = run('--baseline'); assert.strictEqual(over.status, 1); assert.match(over.stderr, /a\.html\s+word 1 \(baseline 0\)/);
    fs.writeFileSync(path.join(tmp, 'a.html'), '<p>One, two</p>');
    const below = run('--baseline'); assert.strictEqual(below.status, 0); assert.match(below.stdout, /below their baseline/);
    fs.writeFileSync(path.join(tmp, 'b.html'), '<p>New page \u2014 new rules</p>');
    assert.strictEqual(run('--baseline').status, 1, 'a new file has no allowance');
    assert.strictEqual(run('--strict', path.join(tmp, 'a.html')).status, 0);
    assert.strictEqual(run('--strict', path.join(tmp, 'b.html')).status, 1);
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});

test('copy gate: the committed baseline matches today and the whole site sits at or under it', () => {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/gate-copy.mjs'), '--baseline'], { encoding: 'utf8' });
  assert.strictEqual(r.status, 0, r.stderr);
  const base = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/copy-baseline.json'), 'utf8'));
  for (const f of ['shared/ace-shell.js', 'shared/ace-progress.js', 'shared/al-kit.js', 'shared/al-loop.js', 'shared/ace-coach-lines.js', 'shared/al-tokens.css'])
    assert.ok(!base[f], f + ' is clean, so it has no allowance');
});

test('clock gate: clocks in code, markup and labels; animations and lesson scenarios are not clocks', async () => {
  const { clockCode, clockUi, clockText } = await imp('scripts/gate-clock.mjs');
  const { codeOnly } = await imp('scripts/lib/served.mjs');
  const code = (s) => clockCode(codeOnly(s)).length;
  assert.strictEqual(code("t = setInterval(function(){ secsLeft--; el.textContent = secsLeft + 's'; }, 1000);"), 1);
  assert.strictEqual(code("var n = 9; setInterval(() => { n--; out.textContent = n; }, 1000);"), 1, 'counts down once a second');
  assert.strictEqual(code("function tick(){ rem = end - Date.now(); el.textContent = fmt(rem); } setInterval(tick, 250);"), 1);
  assert.strictEqual(code("function tick(){ var left = T - Date.now(); el.textContent = left; setTimeout(tick, 1000); } tick();"), 1);
  assert.strictEqual(code("function loop(){ var t = performance.now() - t0; el.textContent = Math.floor(t / 60000) + ':' + s; requestAnimationFrame(loop); }"), 1);
  assert.strictEqual(code("setInterval(function(){ frame++; draw(frame); }, 16);"), 0, 'an animation');
  assert.strictEqual(code("setInterval(syncToAceLabs, 30000);"), 0, 'slower than a clock');
  assert.strictEqual(code("function tick(){ var until = Date.now() + 40; work(); if (more) setTimeout(tick, 0); }"), 0, 'a chunked build loop');
  assert.strictEqual(code("function ccTick(){ head.setAttribute('cx', t * 600); requestAnimationFrame(ccTick); }"), 0, 'a frame loop that prints no time');
  assert.strictEqual(code("// setInterval(function(){ secs--; el.textContent = secs; }, 1000)\nvar s = 'setInterval(tick, 1000)';"), 0, 'comments and strings');
  assert.deepStrictEqual(clockUi('<span id="pmTimer" class="timer">1:00</span>').length, 2);
  assert.deepStrictEqual(clockUi('<svg class="clockwise-arrow counterclockwise"></svg><div class="rl-countdown"></div>').map((h) => h.what), ['class="rl-countdown"']);
  assert.strictEqual(clockText('   Time remaining   ').length, 1);
  assert.strictEqual(clockText('  Session Time Remaining  ').length, 1);
  assert.strictEqual(clockText('  12 days left  ').length, 1);
  assert.strictEqual(clockText('Reading it as alarm is a mistake, with 20 minutes left for about 40 items (near 30 seconds each).').length, 0);
  assert.strictEqual(clockText('  Result: panic and no time left  ').length, 0);
});

test('clock gate: passes on the repo, and the allowlist names an owner for every pending timer', async () => {
  const { TIMED, PENDING } = await imp('scripts/gate-clock.mjs');
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/gate-clock.mjs')], { encoding: 'utf8' });
  assert.strictEqual(r.status, 0, r.stderr);
  // a batch that makes a timer untimed leaves a stale entry behind; the gate only reports it (B6 sweeps)
  for (const e of PENDING) assert.match(e.owner, /^B\d(\.\d)?$/, e.path);
  for (const e of [...TIMED, ...PENDING]) assert.ok(e.why && e.why.length > 10, e.path);
  assert.ok(TIMED.some((e) => e.path === 'tools/mock/'), 'the timed mock paths');
});

test('contrast gate: the exam layer pairs of spec 2.3 are measured', async () => {
  const { check } = await imp('scripts/gate-contrast.mjs');
  const { rows } = check(fs.readFileSync(path.join(ROOT, 'shared/al-tokens.css'), 'utf8'));
  const exam = rows.filter((r) => r.theme === 'exam');
  const get = (fg, bg) => exam.find((r) => r.fg === fg && r.bg === bg).r;
  assert.ok(Math.abs(get('#4a5158', '--al-exam-tool') - 7.62) < 0.01);
  assert.ok(Math.abs(get('#2b5f7a', '--al-exam-tool') - 6.58) < 0.01);
  assert.ok(Math.abs(get('#005c43', '#dff3ea') - 6.95) < 0.01);
  assert.ok(Math.abs(get('#8a3d00', '#fbe6d7') - 6.33) < 0.01);
});

test('served files: docs, tests and redirected pages are not read; pages and shared files are', async () => {
  const { servedFiles } = await imp('scripts/lib/served.mjs');
  const files = new Set(servedFiles(ROOT));
  for (const f of ['ace-labs.html', 'tests/index.html', 'shared/ace-shell.js', 'shared/al-tokens.css']) assert.ok(files.has(f), f);
  for (const f of ['unified-mock.html', 'calendar.html', 'docs/ace-system-decisions.md', 'tests/kit/gates.test.js', 'shared/three.module.min.js', 'package.json']) assert.ok(!files.has(f), f);
});

const get = (url) => new Promise((resolve, reject) => http.get(url, (res) => { let b = ''; res.on('data', (d) => { b += d; }); res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: b })); }).on('error', reject));
test('site server: Netlify rewrites, pretty URLs, forced redirects, 404 and the CSP', async () => {
  const { startServer, pagesFrom, B1, slugOf } = await imp('scripts/lib/site.mjs');
  const s = await startServer(ROOT);
  try {
    const home = await get(s.url + '/');
    assert.strictEqual(home.status, 200); assert.strictEqual(home.body, fs.readFileSync(path.join(ROOT, 'ace-labs.html'), 'utf8'));
    assert.match(home.headers['content-security-policy'], /default-src 'self'/);
    const learn = await get(s.url + '/learn'); assert.strictEqual(learn.status, 301); assert.strictEqual(learn.headers.location, '/learn/');
    assert.strictEqual((await get(s.url + '/learn/')).status, 200);
    const docs = await get(s.url + '/docs/ace-system-decisions.md'); assert.strictEqual(docs.status, 301); assert.strictEqual(docs.headers.location, '/ace-labs.html');
    assert.strictEqual((await get(s.url + '/no-such-page.html')).status, 404);
    assert.strictEqual((await get(s.url + '/shared/al-tokens.css')).headers['content-type'], 'text/css; charset=utf-8');
  } finally { await s.close(); }
  assert.strictEqual(B1.length, 30);
  for (const p of pagesFrom(ROOT, ['@b1'])) {
    const f = path.join(ROOT, p === '/' ? 'ace-labs.html' : p.endsWith('/') ? p + 'index.html' : p);
    assert.ok(fs.existsSync(f), p);
  }
  assert.strictEqual(slugOf('/'), 'today');
  assert.strictEqual(slugOf('/tools/pat/holepunch.html'), 'tools-pat-holepunch');
  assert.strictEqual(slugOf('/learn/'), 'learn');
});
