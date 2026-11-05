// tests/review/hardening.test.js : what the security review asked of the review system.
//   - the internal approval files answer 404 (stamps, key hashes); the public ones stay public
//   - /approvals/* runs under a strict CSP: no inline script, no eval, no framing
//   - the review page holds the key in sessionStorage only, and sandboxes the Retold preview frame
// The browser side (CSP violations, the frame's opaque origin, the address bar) is
// tests/review/page-shots.mjs.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ROOT = path.resolve(__dirname, '../..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

test('internal approval files answer 404; the review index and the pulls snapshot stay public', async () => {
  const { startServer } = await import(pathToFileURL(path.join(ROOT, 'scripts/lib/site.mjs')).href);
  const srv = await startServer(ROOT);
  try {
    const stamps = fs.readdirSync(path.join(ROOT, 'content/approvals/stamps')).filter((f) => f.endsWith('.json'));
    assert.ok(stamps.length > 0);
    for (const p of ['/content/approvals/key-hash.json', ...stamps.map((f) => '/content/approvals/stamps/' + f), '/content/approvals/stamps/']) {
      const r = await fetch(srv.url + p, { redirect: 'manual' });
      const body = await r.text();
      assert.equal(r.status, 404, p);
      assert.doesNotMatch(body, /sha256|"stamp"/, p + ' leaks nothing');
    }
    for (const p of ['/content/approvals/review-index.json', '/content/approvals/pulls-snapshot.json']) {
      const r = await fetch(srv.url + p, { redirect: 'manual' });
      assert.equal(r.status, 200, p);
      JSON.parse(await r.text());
    }
  } finally { await srv.close(); }
});

test('the 404 rules sit in both netlify.toml and _redirects, forced', () => {
  const toml = read('netlify.toml');
  for (const from of ['/content/approvals/stamps/*', '/content/approvals/key-hash.json']) {
    assert.match(toml, new RegExp('from = "' + from.replace(/[.*/]/g, '\\$&') + '"\\s*\\n\\s*to = "/404.html"\\s*\\n\\s*status = 404\\s*\\n\\s*force = true'), from);
    assert.match(read('_redirects'), new RegExp('^' + from.replace(/[.*/]/g, '\\$&') + '\\s+/404.html\\s+404!$', 'm'), from);
  }
  // nothing hides the files the public pages read
  assert.doesNotMatch(toml, /from = "\/content\/approvals\/(\*|review-index|pulls-snapshot)/);
});

test('the approvals function bundles what it reads (no HTTP read of the files that now 404)', () => {
  const src = read('netlify/functions/approvals.mjs');
  assert.match(src, /^import INDEX from '\.\.\/\.\.\/content\/approvals\/review-index\.json' with \{ type: 'json' \};$/m);
  assert.match(src, /^import KEYS from '\.\.\/\.\.\/content\/approvals\/key-hash\.json' with \{ type: 'json' \};$/m);
  assert.doesNotMatch(src, /fetch\(|readFile/);
  assert.match(read('netlify.toml'), /node_bundler = "esbuild"/, 'esbuild inlines the JSON imports');
});

test('/approvals/* has a strict CSP: same-origin script files only, no inline, no eval, never framed', () => {
  const toml = read('netlify.toml');
  const block = toml.split(/^\s*\[\[headers\]\]\s*$/m).find((b) => /for\s*=\s*"\/approvals\/\*"/.test(b));
  assert.ok(block, 'a headers block for /approvals/*');
  const csp = (block.match(/^\s*Content-Security-Policy\s*=\s*"([^"]+)"/m) || [])[1];
  assert.ok(csp);
  const dir = Object.fromEntries(csp.split(';').map((d) => d.trim().split(/\s+/)).filter((d) => d[0]).map((d) => [d[0], d.slice(1)]));
  assert.deepEqual(dir['script-src'], ["'self'"]);
  assert.deepEqual(dir['default-src'], ["'none'"]);
  assert.deepEqual(dir['frame-ancestors'], ["'none'"]);
  assert.deepEqual(dir['object-src'], ["'none'"]);
  assert.deepEqual(dir['base-uri'], ["'none'"]);
  assert.doesNotMatch(csp, /unsafe-eval|strict-dynamic|https?:|\*/);
  assert.match(block, /X-Robots-Tag = "noindex"/);
});

test('the review page runs no inline script and no inline handlers', () => {
  const html = read('approvals/index.html');
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  assert.ok(scripts.length > 0);
  for (const [, attrs, body] of scripts) { assert.match(attrs, /\bsrc="/); assert.equal(body.trim(), ''); }
  assert.doesNotMatch(html, /\son[a-z]+\s*=/i);
  assert.doesNotMatch(html, /javascript:/i);
  const js = read('approvals/approvals.js');
  assert.doesNotMatch(js, /\beval\(|new Function|innerHTML|insertAdjacentHTML|document\.write/);
});

test('the key: fragment wiped with replaceState, kept in sessionStorage only; the Retold frame is sandboxed', () => {
  const js = read('approvals/approvals.js');
  assert.match(js, /history\.replaceState\(null, '', location\.pathname \+ location\.search\)/);
  assert.doesNotMatch(js, /localStorage/);
  assert.match(js, /sessionStorage\.setItem\(SKEY/);
  assert.match(js, /'x-review-key': KEYS\.get\(\)/, 'every request reads the key from sessionStorage');
  const frames = [...js.matchAll(/h\('iframe', \{([^}]*)\}/g)].map((m) => m[1]);
  assert.ok(frames.length > 0);
  for (const f of frames) {
    assert.match(f, /sandbox: 'allow-scripts'/);
    assert.doesNotMatch(f, /allow-same-origin/);
  }
  assert.match(js, /Rotating the keys after the review window/, 'the rotation note');
});
