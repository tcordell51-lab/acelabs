// The gate: free pages stay open, locked pages and banks need a verified session.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decide, injectSessionScript } from '../../netlify/lib/ace-gate-core.mjs';
import { classify, FREE_PAGES, safeNext } from '../../netlify/lib/ace-access.mjs';
import { SESSION_COOKIE } from '../../netlify/lib/ace-token.mjs';
import { ON, NOW, SECRET, sessionToken, req } from './helpers.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const signedIn = async (p, claims) => req(p, { headers: { cookie: `${SESSION_COOKIE}=${await sessionToken(claims)}` } });
const go = (r, env = ON) => decide(r, env, { now: NOW });

const BANKS = ['/tools/mock/data/full-mocks.js', '/shared/dat-mock-tests.js', '/tools/minitests/bank.js', '/tools/rc/data/bank.js',
  '/games/bio.json', '/games/gchem.json', '/games/qr.json', '/games/ochem-bank-1000.js', '/data/bio.json', '/data/gchem.json',
  '/data/qr-climb.json', '/shared/ochem-bank.js', '/shared/qr-formats-bank.js', '/shared/qr-formats-bank.json', '/tools/bio/bio-shared.js',
  '/tools/gc/traps-library.json', '/scripts/dat-mock-bank.backup.json'];

test('flag off: every request passes untouched, bank or page, signed in or not', async () => {
  for (const p of ['/', '/tools/mock/full.html', ...BANKS, '/repair/?student=S35'])
    assert.deepEqual(await go(req(p), { ACE_LABS_HANDOFF_SECRET: SECRET }), { action: 'pass' });
});

test('signed out: the free pages are served', async () => {
  for (const p of ['/', '/index.html', '/learn/', '/labs/', '/tests/', '/gc/galvanic/', '/games/chirality/', '/bio/see/', '/qr/worked/', '/diagnostic.html', '/sign-in/?next=%2Frepair%2F']) {
    const d = await go(req(p)); assert.equal(d.action, 'pass', p); assert.equal(d.html, true, p);
  }
  assert.deepEqual(await go(req('/shared/ace-record.js?v=6')), { action: 'pass' });
});

test('signed out: locked bank data answers 401', async () => {
  for (const p of BANKS) { const d = await go(req(p)); assert.equal(d.action, 'deny', p); assert.equal(d.status, 401, p); }
});

test('signed out: the free diagnostic gets the fixed free form, not the full bank', async () => {
  assert.deepEqual(await go(req('/scripts/dat-mock-bank.json')), { action: 'rewrite', to: '/data/free/diagnostic-bank.json' });
  const form = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/free/diagnostic-bank.json'), 'utf8'));
  assert.equal(Object.values(form).reduce((n, a) => n + a.length, 0), 60);
});

test('signed out: a locked page goes to the sign-in page and back', async () => {
  const d = await go(req('/tools/mock/full.html?form=2'));
  assert.equal(d.action, 'redirect'); assert.equal(d.location, '/sign-in/?next=' + encodeURIComponent('/tools/mock/full.html?form=2'));
  for (const p of ['/repair/', '/progress/', '/tools/ochem/', '/prometric-mock.html', '/gc/', '/tools/pat/keyholes.html']) assert.equal((await go(req(p))).action, 'redirect', p);
});

test('signed in: locked pages and banks are served, marked private', async () => {
  for (const p of ['/tools/mock/full.html', ...BANKS, '/scripts/dat-mock-bank.json']) { const d = await go(await signedIn(p)); assert.equal(d.action, 'pass', p); assert.equal(d.private, true, p); }
});

test('a forged or expired cookie is a signed-out visitor', async () => {
  const forged = await sessionToken({}, 'another-secret-0123456789-abcdefghijklmn');
  assert.equal((await go(req(BANKS[0], { headers: { cookie: `${SESSION_COOKIE}=${forged}` } }))).action, 'deny');
  assert.equal((await go(await signedIn(BANKS[0], { exp: NOW - 5 }))).action, 'deny');
  assert.equal((await go(req(BANKS[0], { headers: { 'x-ace-session': await sessionToken() } }))).action, 'deny');   // header is for functions only
});

test('a session without the entitlement does not open a locked path (room for a later pass)', async () => {
  assert.equal((await go(await signedIn(BANKS[0], { ent: ['crash-qr'] }))).action, 'deny');
  assert.equal((await go(await signedIn('/', { ent: [] }))).action, 'pass');
});

test('path tricks do not turn a locked file into a free one', async () => {
  for (const p of ['/shared/../tools/mock/data/full-mocks.js', '/shared/%2e%2e/games/qr.json', '//games//qr.json', '/SHARED/OCHEM-BANK.JS', '/shared/ochem-bank.js/', '/games/qr.json%20'])
    assert.notEqual(classify(new URL('https://x' + p).pathname), 'free', p);
});

test('?student= is never trusted: it is replaced by the session id or removed', async () => {
  assert.deepEqual(await go(req('/learn/?student=S35')), { action: 'redirect', location: '/learn/' });
  assert.deepEqual(await go(await signedIn('/repair/?student=S35', { sub: 'S22' })), { action: 'redirect', location: '/repair/?student=S22' });
  assert.equal((await go(await signedIn('/repair/?student=S22', { sub: 'S22' }))).action, 'pass');
  assert.deepEqual(await go(await signedIn('/repair/?student=S22', { sub: 'coach:x', role: 'coach', view: 'S35' })), { action: 'redirect', location: '/repair/?student=S35' });
});

test('the way back is always a path on this site', () => {
  for (const bad of ['https://evil.example/', '//evil.example', '/\\evil', 'javascript:alert(1)', '/sign-in/?next=/x']) assert.equal(safeNext(bad), '/');
  assert.equal(safeNext('/tools/ochem/?night=3'), '/tools/ochem/?night=3');
});

test('the session script is added to a page once', () => {
  const once = injectSessionScript('<html><head><title>x</title></head><body></body></html>');
  assert.equal(once.split('/sign-in/ace-session.js').length, 2); assert.equal(injectSessionScript(once), once);
});

test('every free page exists, and loads no locked script or data', () => {
  const redirects = fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8');
  for (const key of FREE_PAGES) {
    const file = [key === '/' ? 'index.html' : key.slice(1) + '.html', key.slice(1) + '/index.html'].map((f) => path.join(ROOT, f)).find((f) => fs.existsSync(f));
    if (!file) { assert.ok(redirects.includes(key + '/ '), 'no file or redirect for ' + key); continue; }
    const html = fs.readFileSync(file, 'utf8');
    const refs = [...html.matchAll(/(?:src|href)\s*=\s*["']([^"'#?]+\.(?:js|mjs|json))(?:\?[^"']*)?["']/g), ...html.matchAll(/fetch\(\s*["']([^"'#?]+)["']/g)].map((m) => m[1]).filter((u) => !/^(https?:)?\/\//.test(u));
    for (const u of refs) {
      const abs = new URL(u, 'https://x' + (key === '/' ? '/' : file.endsWith('index.html') ? key + '/' : key)).pathname;
      if (abs === '/scripts/dat-mock-bank.json') continue;   // the diagnostic: served as the free form
      if (abs.startsWith('/.netlify/')) continue;              // functions never reach the gate; each checks its own caller
      assert.equal(classify(abs), 'free', `${key} loads locked ${abs}`);
    }
  }
});
