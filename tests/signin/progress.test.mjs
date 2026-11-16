// Progress read/write is keyed to the verified student id: node --test tests/signin/
import test from 'node:test';
import assert from 'node:assert/strict';
import { handleProgress } from '../../netlify/functions/ace-progress.mjs';
import { mergeState, splitState, joinState, blank, CHUNK } from '../../netlify/lib/ace-progress-store.mjs';
import { SESSION_COOKIE } from '../../netlify/lib/ace-token.mjs';
import { ON, NOW, sessionToken, req, fakeAirtable } from './helpers.mjs';

const FN = '/.netlify/functions/ace-progress';
const hdr = async (claims) => ({ 'x-ace-session': await sessionToken(claims) });
const item = (last, seen = 1) => ({ section: 'gchem', topic: 'buffers', seen, right: seen, last, lastOk: true, box: 1, due: last + 864e5 });
const attempt = (id, at, ok = true) => ({ id, section: 'gchem', topic: 'buffers', picked: 'A', answer: ok ? 'A' : 'B', ok, ms: 4000, at, src: 'test', set: 's1' });
const miss = (id, at, reason) => ({ id, section: 'gchem', topic: 'buffers', topicName: 'Buffers', trap: 'Buffers', src: 'test', missedAt: at, reason, wins: [], due: at + 864e5, resets: 0, cleared: 0, served: [] });

async function write(db, claims, body, extra = '') {
  return handleProgress(req(FN + extra, { method: 'POST', headers: await hdr(claims), body }), { env: ON, fetchImpl: db.fetchImpl, now: NOW });
}
async function read(db, claims, extra = '') {
  return handleProgress(req(FN + extra, { headers: await hdr(claims) }), { env: ON, fetchImpl: db.fetchImpl, now: NOW });
}

test('signed out: no read and no write, and Airtable is never called', async () => {
  const db = fakeAirtable();
  assert.equal((await handleProgress(req(FN), { env: ON, fetchImpl: db.fetchImpl, now: NOW })).status, 401);
  assert.equal((await handleProgress(req(FN, { method: 'POST', body: { student: 'S22', items: { q1: item(1) } } }), { env: ON, fetchImpl: db.fetchImpl, now: NOW })).status, 401);
  assert.equal(db.calls.length, 0);
});

test('the cookie alone cannot read or write progress (another site cannot ride a visitor\'s browser)', async () => {
  const db = fakeAirtable();
  const cookie = { cookie: `${SESSION_COOKIE}=${await sessionToken()}` };
  assert.equal((await handleProgress(req(FN, { headers: cookie }), { env: ON, fetchImpl: db.fetchImpl, now: NOW })).status, 401);
  assert.equal((await handleProgress(req(FN, { method: 'POST', headers: cookie, body: {} }), { env: ON, fetchImpl: db.fetchImpl, now: NOW })).status, 401);
  assert.equal(db.calls.length, 0);
});

test('a student saves answers, a miss with its reason tag and repair state, then reads them back', async () => {
  const db = fakeAirtable();
  const res = await write(db, { sub: 'S22' }, { attempts: [attempt('q1', 1000, false), attempt('q2', 2000)], items: { q1: { ...item(1000), lastOk: false }, q2: item(2000) }, repair: { q1: miss('q1', 1000, 'trap') }, days: { '2026-11-16': { seen: 2, right: 1 } } });
  assert.equal(res.status, 200); assert.deepEqual((await res.json()).saved, { attempts: 2, record: true });
  assert.ok(db.rows.length >= 2);
  assert.ok(db.rows.every((r) => r.fields['Student Portal ID'] === 'S22' && r.fields.Key.startsWith('S22:acelabs.')));
  const back = await (await read(db, { sub: 'S22' })).json();
  assert.equal(back.student, 'S22');
  assert.equal(back.record.repair.q1.reason, 'trap');
  assert.equal(back.record.items.q2.last, 2000);
  assert.equal(back.attempts.length, 2);
});

test('student A cannot read student B', async () => {
  const db = fakeAirtable();
  await write(db, { sub: 'S35' }, { attempts: [attempt('secret-q', 5000)], items: { 'secret-q': item(5000) } });
  const named = await read(db, { sub: 'S22' }, '?student=S35');
  assert.equal(named.status, 403);
  const own = await (await read(db, { sub: 'S22' })).json();
  assert.equal(own.student, 'S22'); assert.deepEqual(own.record.items, {}); assert.deepEqual(own.attempts, []);
  assert.ok(!JSON.stringify(own).includes('secret-q'));
});

test('student A cannot write student B: by body, by query, or by a key inside the data', async () => {
  const db = fakeAirtable();
  await write(db, { sub: 'S35' }, { items: { q9: item(9000) } });
  const before = JSON.stringify(db.rows);
  assert.equal((await write(db, { sub: 'S22' }, { student: 'S35', items: { q9: item(99999, 50) } })).status, 403);
  assert.equal((await write(db, { sub: 'S22' }, { studentId: 'S35', items: { q9: item(99999, 50) } })).status, 403);
  assert.equal((await write(db, { sub: 'S22' }, { items: { q9: item(99999, 50) } }, '?student=S35')).status, 403);
  assert.equal(JSON.stringify(db.rows), before);
  // an unnamed write lands on A's own rows only
  assert.equal((await write(db, { sub: 'S22' }, { items: { q9: item(99999, 50) }, 'Student Portal ID': 'S35', Key: 'S35:acelabs.record.0' })).status, 200);
  const b = db.rows.filter((r) => r.fields['Student Portal ID'] === 'S35');
  assert.equal(JSON.parse(b[0].fields['State JSON']).items.q9.last, 9000);
  assert.ok(db.rows.filter((r) => r.fields['Student Portal ID'] === 'S22').every((r) => r.fields.Key.startsWith('S22:')));
});

test('a row that is not the student\'s never leaves the store, even if Airtable returned it', async () => {
  const db = fakeAirtable([{ Key: 'S35:acelabs.record.0', 'Student Portal ID': 'S35', 'Tool Name': 'acelabs.record.0', 'State JSON': JSON.stringify({ v: 1, i: 0, parts: 1, updated: 1, items: { leak: item(1) }, repair: {}, days: {} }) }]);
  const leaky = async () => new Response(JSON.stringify({ records: db.rows }), { status: 200 });   // ignores the filter
  const res = await handleProgress(req(FN, { headers: await hdr({ sub: 'S22' }) }), { env: ON, fetchImpl: leaky, now: NOW });
  assert.deepEqual((await res.json()).record.items, {});
});

test('a student id that is not a plain id never reaches the Airtable formula', async () => {
  const db = fakeAirtable();
  const res = await read(db, { sub: "S22', TRUE(), '" });
  assert.equal(res.status, 403); assert.equal(db.calls.length, 0);
});

test('a coach reads only the one student in their session, and never writes', async () => {
  const db = fakeAirtable();
  await write(db, { sub: 'S35' }, { items: { q1: item(1000) } });
  await write(db, { sub: 'S22' }, { items: { q2: item(2000) } });
  const coach = { sub: 'coach:sarah', role: 'coach', view: 'S35' };
  const ok = await read(db, coach, '?student=S35');
  assert.equal(ok.status, 200); assert.ok((await ok.json()).record.items.q1);
  assert.equal((await read(db, coach, '?student=S22')).status, 403);
  assert.equal((await read(db, coach)).status, 403);
  assert.equal((await read(db, { sub: 'coach:sarah', role: 'coach', view: null }, '?student=S35')).status, 403);
  assert.equal((await write(db, coach, { items: { q1: item(5000) } }, '?student=S35')).status, 403);
});

test('flag off: the function is not there', async () => {
  const db = fakeAirtable();
  const res = await handleProgress(req(FN, { headers: await hdr({}) }), { env: { ...ON, ACE_LABS_SIGN_IN: '' }, fetchImpl: db.fetchImpl, now: NOW });
  assert.equal(res.status, 404); assert.equal(db.calls.length, 0);
});

test('merge: the newest copy of a question and of a miss wins; repeats of an answer are dropped', async () => {
  const db = fakeAirtable();
  await write(db, { sub: 'S22' }, { attempts: [attempt('q1', 1000)], items: { q1: item(1000) }, repair: { q1: miss('q1', 1000, null) } });
  await write(db, { sub: 'S22' }, { attempts: [attempt('q1', 1000), attempt('q1', 3000)], items: { q1: item(3000, 2) }, repair: { q1: { ...miss('q1', 1000, 'misread'), _u: 3000 } } });
  await write(db, { sub: 'S22' }, { items: { q1: item(2000, 9) } });   // an older phone syncing late
  const back = await (await read(db, { sub: 'S22' })).json();
  assert.equal(back.record.items.q1.last, 3000);
  assert.equal(back.record.repair.q1.reason, 'misread');
  assert.equal(back.attempts.length, 2);
});

test('a large record is split across rows under Airtable\'s cell limit and reads back whole', () => {
  const state = blank();
  for (let i = 0; i < 2500; i++) state.items['bank-item-' + i] = item(1000 + i);
  state.updated = 5;
  const cells = splitState(state);
  assert.ok(cells.length > 1); assert.ok(cells.every((c) => c.length <= CHUNK));
  assert.deepEqual(joinState(cells).items, state.items);
  // a leftover row from a longer record is ignored
  const shorter = splitState(mergeState(blank(), { items: { a: item(1) } }).state);
  assert.deepEqual(Object.keys(joinState([...shorter, cells[1]]).items), ['a']);
});

test('unknown fields and oversized values are dropped before they are stored', async () => {
  const db = fakeAirtable();
  await write(db, { sub: 'S22' }, { items: { q1: { ...item(1000), note: 'x'.repeat(5000), admin: true } }, repair: { q1: { ...miss('q1', 1000, 'not-a-reason'), extra: 'y' } } });
  const back = await (await read(db, { sub: 'S22' })).json();
  assert.deepEqual(Object.keys(back.record.items.q1).sort(), ['box', 'due', 'last', 'lastOk', 'right', 'section', 'seen', 'topic']);
  assert.equal(back.record.repair.q1.reason, null); assert.equal(back.record.repair.q1.extra, undefined);
});
