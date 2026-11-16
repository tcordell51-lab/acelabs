// Handoff tokens and the session exchange: node --test tests/signin/
import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyToken, signToken, sessionSecret, sessionFromRequest, HANDOFF_TYP, SESSION_TYP, SESSION_COOKIE } from '../../netlify/lib/ace-token.mjs';
import { handleExchange } from '../../netlify/functions/ace-session-exchange.mjs';
import { handleSession } from '../../netlify/functions/ace-session.mjs';
import { SECRET, HOST, ON, NOW, portalHandoff, sessionToken, req } from './helpers.mjs';

const post = (token) => req('/.netlify/functions/ace-session-exchange', { method: 'POST', body: { token } });
const memoryJti = () => { const seen = new Set(); return { used: async (j) => seen.has(j), mark: async (j) => { seen.add(j); } }; };

test('a token the portal mints with node:crypto verifies here', async () => {
  const p = await verifyToken(portalHandoff(), SECRET, { typ: HANDOFF_TYP, aud: HOST, now: NOW });
  assert.equal(p.sub, 'S22'); assert.equal(p.role, 'student');
});

test('forged: a token signed with another secret is rejected', async () => {
  const forged = portalHandoff({ sub: 'S35' }, 'some-other-secret-0123456789-abcdefghijkl');
  await assert.rejects(verifyToken(forged, SECRET, { typ: HANDOFF_TYP, aud: HOST, now: NOW }), { reason: 'bad_signature' });
  const res = await handleExchange(post(forged), { env: ON, now: NOW, jtiStore: null });
  assert.equal(res.status, 401); assert.equal(res.headers.get('set-cookie'), null);
});

test('forged: changing the student id inside a real token breaks the signature', async () => {
  const [body, sig] = portalHandoff({ sub: 'S22' }).split('.');
  const claims = JSON.parse(Buffer.from(body, 'base64url').toString()); claims.sub = 'S35';
  const tampered = `${Buffer.from(JSON.stringify(claims)).toString('base64url')}.${sig}`;
  const res = await handleExchange(post(tampered), { env: ON, now: NOW, jtiStore: null });
  assert.equal(res.status, 401); assert.equal((await res.json()).error, 'bad_signature');
});

test('expired: a handoff token older than two minutes is rejected', async () => {
  const res = await handleExchange(post(portalHandoff()), { env: ON, now: NOW + 121, jtiStore: null });
  assert.equal(res.status, 401); assert.equal((await res.json()).error, 'expired');
});

test('a token minted for another site is rejected', async () => {
  const res = await handleExchange(post(portalHandoff({ aud: 'deploy-preview-9--acelabs.netlify.app' })), { env: ON, now: NOW, jtiStore: null });
  assert.equal(res.status, 401); assert.equal((await res.json()).error, 'wrong_audience');
});

test('a good handoff becomes a session: header token and HttpOnly cookie, id from the token only', async () => {
  const r = new Request(`https://${HOST}/.netlify/functions/ace-session-exchange?student=S35`, { method: 'POST', body: JSON.stringify({ token: portalHandoff({ sub: 'S22' }), student: 'S35', sub: 'S35' }) });
  const res = await handleExchange(r, { env: ON, now: NOW, jtiStore: null });
  assert.equal(res.status, 200);
  const out = await res.json();
  assert.equal(out.sub, 'S22');
  const cookie = res.headers.get('set-cookie');
  assert.match(cookie, new RegExp(`^${SESSION_COOKIE}=`)); assert.match(cookie, /HttpOnly/); assert.match(cookie, /Secure/);
  const s = await sessionFromRequest(req('/x', { headers: { 'x-ace-session': out.token } }), ON, { now: NOW + 5 });
  assert.equal(s.sub, 'S22'); assert.deepEqual(s.ent, ['all']); assert.equal(s.typ, SESSION_TYP);
});

test('a handoff token works once', async () => {
  const jtiStore = memoryJti(); const token = portalHandoff();
  assert.equal((await handleExchange(post(token), { env: ON, now: NOW, jtiStore })).status, 200);
  const again = await handleExchange(post(token), { env: ON, now: NOW + 1, jtiStore });
  assert.equal(again.status, 401); assert.equal((await again.json()).error, 'already_used');
});

test('a handoff token is not a session, and a session token is not a handoff', async () => {
  assert.equal(await sessionFromRequest(req('/x', { headers: { 'x-ace-session': portalHandoff() } }), ON, { now: NOW }), null);
  const res = await handleExchange(post(await sessionToken()), { env: ON, now: NOW, jtiStore: null });
  assert.equal(res.status, 401);
  // even a session-typed payload signed with the raw shared secret is refused
  const raw = await signToken({ v: 1, typ: SESSION_TYP, sub: 'S35', role: 'student', ent: ['all'], iat: NOW, exp: NOW + 600 }, SECRET);
  assert.equal(await sessionFromRequest(req('/x', { headers: { 'x-ace-session': raw } }), ON, { now: NOW }), null);
});

test('an expired session is no session', async () => {
  const t = await sessionToken({ exp: NOW - 1 });
  assert.equal(await sessionFromRequest(req('/x', { headers: { cookie: `${SESSION_COOKIE}=${t}` } }), ON, { now: NOW }), null);
});

test('flag off: the exchange answers 404 and the status says only "enabled: false"', async () => {
  const off = { ACE_LABS_HANDOFF_SECRET: SECRET };
  assert.equal((await handleExchange(post(portalHandoff()), { env: off, now: NOW, jtiStore: null })).status, 404);
  assert.deepEqual(await (await handleSession(req('/.netlify/functions/ace-session'), { env: off, now: NOW })).json(), { enabled: false });
});

test('flag on without a usable secret: nothing is accepted', async () => {
  const env = { ACE_LABS_SIGN_IN: 'on', ACE_LABS_HANDOFF_SECRET: 'short' };
  assert.equal((await handleExchange(post(portalHandoff({}, 'short')), { env, now: NOW, jtiStore: null })).status, 503);
  assert.equal(await sessionFromRequest(req('/x', { headers: { 'x-ace-session': 'a.b' } }), env, { now: NOW }), null);
});

test('status: signed in by header, and whether the cookie is there too', async () => {
  const t = await sessionToken();
  const a = await (await handleSession(req('/s', { headers: { 'x-ace-session': t } }), { env: ON, now: NOW })).json();
  assert.equal(a.signedIn, true); assert.equal(a.cookie, false); assert.equal(a.sub, 'S22');
  const b = await (await handleSession(req('/s', { headers: { 'x-ace-session': t, cookie: `${SESSION_COOKIE}=${t}` } }), { env: ON, now: NOW })).json();
  assert.equal(b.cookie, true);
  const c = await (await handleSession(req('/s'), { env: ON, now: NOW })).json();
  assert.equal(c.signedIn, false);
});

test('a coach handoff carries at most the one student the portal checked', async () => {
  const res = await handleExchange(post(portalHandoff({ sub: 'coach:sarah', role: 'coach', view: 'S35' })), { env: ON, now: NOW, jtiStore: null });
  const out = await res.json();
  assert.equal(out.role, 'coach'); assert.equal(out.view, 'S35');
  // a student token cannot smuggle a view
  const stu = await (await handleExchange(post(portalHandoff({ view: 'S35' })), { env: ON, now: NOW, jtiStore: null })).json();
  assert.equal(stu.view, null);
});
