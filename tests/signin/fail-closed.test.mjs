// The gate fails closed while the flag is on, and does nothing while it is off (2026-11-16).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { signInEnabled } from '../../netlify/lib/ace-token.mjs';
import { decide, injectSessionScript } from '../../netlify/lib/ace-gate-core.mjs';
import { ON, req } from './helpers.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = fs.readFileSync(path.join(ROOT, 'netlify/edge-functions/ace-gate.js'), 'utf8');
// Deno globals are absent under node, so readEnv() falls back to undefined: load the module as is.
const gate = await import('../../netlify/edge-functions/ace-gate.js');

const ctx = (over = {}) => ({ next: async () => new Response('<html><head></head><body>bank</body></html>', { status: 200, headers: { 'content-type': 'text/html' } }), rewrite: async () => new Response('free'), ...over });

test('the edge module has no top-level imports, so flag-off cannot be broken by gate code', () => {
  assert.doesNotMatch(SRC, /^import\s/m);
  assert.match(SRC, /onError: 'fail'/);
});

test('flagOn matches signInEnabled for every spelling', () => {
  for (const v of [undefined, '', 'off', 'on', 'ON', ' on ', 'true', '1', '0', 'yes']) {
    assert.equal(gate.flagOn({ ACE_LABS_SIGN_IN: v }), signInEnabled({ ACE_LABS_SIGN_IN: v }), String(v));
  }
});

test('flag off: the handler hands every request on untouched', async () => {
  const res = await gate.default(req('/tools/mock/full.html'), ctx());
  assert.equal(res, undefined);
});

test('flag on: a throwing decision answers 503 for a locked bank and a locked page', async () => {
  const boom = { decide: async () => { throw new Error('session store down'); }, injectSessionScript };
  for (const p of ['/tools/mock/data/full-mocks.js', '/tools/mock/full.html', '/data/gchem.json']) {
    const res = await gate.handle(req(p), ctx(), ON, boom);
    assert.equal(res.status, 503, p);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.doesNotMatch(await res.text(), /bank/);
  }
});

test('flag on: gate code that will not load fails closed', async () => {
  const res = await gate.handle(req('/tools/mock/full.html'), ctx(), ON, { get decide() { throw new Error('import failed'); } });
  assert.equal(res.status, 503);
});

test('flag off: handle() never touches the deps, even broken ones', async () => {
  const res = await gate.handle(req('/tools/mock/full.html'), ctx(), {}, { get decide() { throw new Error('never read'); } });
  assert.equal(res, undefined);
});

test('flag on: a throwing origin fetch fails closed through the handler', async () => {
  const deps = { decide, injectSessionScript };
  const bad = ctx({ next: async () => { throw new Error('origin down'); } });
  // a signed-out visitor on a locked page is redirected before any fetch
  const d = await gate.gated(req('/tools/mock/full.html'), bad, ON, deps);
  assert.equal(d.status, 302);
  // a free page needs the origin; when it throws, the handler answers 503
  const res = await gate.handle(req('/'), bad, ON, deps);
  assert.equal(res.status, 503);
});

test('flag on: signed-out locked data is denied, never passed', async () => {
  const res = await gate.gated(req('/tools/mock/data/full-mocks.js'), ctx(), ON, { decide, injectSessionScript });
  assert.equal(res.status, 401);
});
