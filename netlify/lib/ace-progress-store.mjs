// Where a signed-in student's Ace Labs progress lives: the portal's Airtable base, in the
// existing "Tool State" table. No new table and no new field.
//
//   Key                 "<Portal ID>:acelabs.record.<n>"     (also acelabs.attempts.<n>)
//   Student Portal ID   the student's Portal ID, always taken from the verified session
//   Tool Name           "acelabs.record.<n>" | "acelabs.attempts.<n>"
//   State JSON          see below
//   Updated At          set on every write
//
// acelabs.record.<n>   the one progress record (shared/ace-record.js), split so no row passes
//                      Airtable's 100,000 character limit:
//                      { v: 1, i: n, parts: N, updated, items: {id: item}, repair: {id: entry}, days: {day: counts} }
//                      items  = per question: section, topic, seen, right, last, lastOk, box, due
//                      repair = per miss: reason tag (know | trap | misread | time | changed), wins,
//                               due date, resets, cleared date (the repair state)
// acelabs.attempts.<n> the answer log, append only, one JSON object per line:
//                      { id, section, topic, picked, answer, ok, ms, at, src, set, first, changes, change, conf }
//
// Tool State is already a per-student table in the portal's server scope: a student session
// reads only its own rows and a coach only the rows of students assigned to them
// (portal: netlify/functions/_lib/coachScope.js), so the coach view needs no new rule.
//
// Merge rule (two devices, or a phone that was offline): per question and per miss, the copy
// with the newest activity wins; per day, the larger count wins. Answers are appended and
// de-duplicated on (id, at).

export const BASE_ID = 'appDXSpdJuc3WvtYU';
export const TABLE = 'Tool State';
export const CHUNK = 85000;            // characters per State JSON cell, under Airtable's 100,000
export const MAX_RECORD_PARTS = 12;
export const MAX_BATCH_ATTEMPTS = 500;
const AIRTABLE = 'https://api.airtable.com/v0';
const REASONS = ['know', 'trap', 'misread', 'time', 'changed'];

const str = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').slice(0, n);
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const int = (v, max = 1e15) => Math.max(0, Math.min(max, Math.round(num(v))));
const okId = (id) => typeof id === 'string' && id.length > 0 && id.length <= 160 && !/[\u0000-\u001f]/.test(id);
const DAY = /^\d{4}-\d{2}-\d{2}$/;

/* ---- cleaning: only known fields, bounded sizes ---- */
export function cleanItem(it) {
  if (!it || typeof it !== 'object') return null;
  return { section: str(it.section, 16), topic: str(it.topic, 120), seen: int(it.seen, 1e6), right: int(it.right, 1e6), last: int(it.last), lastOk: !!it.lastOk, box: int(it.box, 9), due: int(it.due) };
}
export function cleanRepair(e, id) {
  if (!e || typeof e !== 'object') return null;
  return {
    id: str(id, 160), section: str(e.section, 16), topic: str(e.topic, 120), topicName: str(e.topicName, 160), trap: str(e.trap, 160), src: str(e.src, 60),
    missedAt: int(e.missedAt), lastMiss: int(e.lastMiss), lessonAt: int(e.lessonAt), reason: REASONS.includes(e.reason) ? e.reason : null,
    wins: (Array.isArray(e.wins) ? e.wins : []).slice(-4).map((w) => int(w)), due: int(e.due), resets: int(e.resets, 1e5), cleared: int(e.cleared),
    served: (Array.isArray(e.served) ? e.served : []).slice(-12).map((s) => str(s, 160)), lessonFirst: !!e.lessonFirst, untimedFirst: !!e.untimedFirst, _u: int(e._u),
  };
}
export function cleanAttempt(a) {
  if (!a || typeof a !== 'object' || !okId(String(a.id || ''))) return null;
  const row = { id: str(a.id, 160), section: str(a.section, 16), topic: str(a.topic, 120), picked: str(a.picked, 12), answer: str(a.answer, 12), ok: !!a.ok, ms: int(a.ms, 36e5), at: int(a.at), src: str(a.src, 60), set: str(a.set, 80) };
  if (!row.at) return null;
  if (a.first != null) row.first = str(a.first, 12);
  if (a.changes != null) row.changes = int(a.changes, 99);
  if (['none', 'w2r', 'r2w', 'w2w'].includes(a.change)) row.change = a.change;
  if (['sure', 'unsure', 'guess'].includes(a.conf)) row.conf = a.conf;
  return row;
}

/* ---- merge ---- */
export function repairStamp(e) {
  if (!e) return 0;
  return Math.max(num(e._u), num(e.missedAt), num(e.lastMiss), num(e.cleared), num(e.lessonAt), ...(Array.isArray(e.wins) ? e.wins.map(num) : [0]));
}
export function blank() { return { items: {}, repair: {}, days: {}, updated: 0 }; }

/** Merge an incoming partial state into the stored one. Returns { state, changed }. */
export function mergeState(stored, incoming) {
  const state = { items: { ...(stored.items || {}) }, repair: { ...(stored.repair || {}) }, days: { ...(stored.days || {}) }, updated: num(stored.updated) };
  let changed = false;
  for (const [id, raw] of Object.entries((incoming && incoming.items) || {})) {
    if (!okId(id)) continue;
    const it = cleanItem(raw); if (!it) continue;
    const cur = state.items[id];
    if (!cur || it.last > num(cur.last) || (it.last === num(cur.last) && it.seen > num(cur.seen))) { state.items[id] = it; changed = true; }
  }
  for (const [id, raw] of Object.entries((incoming && incoming.repair) || {})) {
    if (!okId(id)) continue;
    const e = cleanRepair(raw, id); if (!e) continue;
    const cur = state.repair[id];
    if (!cur || repairStamp(e) > repairStamp(cur)) { state.repair[id] = e; changed = true; }
  }
  for (const [day, raw] of Object.entries((incoming && incoming.days) || {})) {
    if (!DAY.test(day) || !raw || typeof raw !== 'object') continue;
    const d = { seen: int(raw.seen, 1e5), right: int(raw.right, 1e5) };
    const cur = state.days[day];
    if (!cur || d.seen > num(cur.seen)) { state.days[day] = d; changed = true; }
  }
  if (changed) state.updated = Date.now();
  return { state, changed };
}

/* ---- splitting across rows ---- */
export function splitState(state) {
  const parts = [];
  let cur = { items: {}, repair: {}, days: {} }, size = 0;
  const push = (kind, id, value) => {
    const cost = JSON.stringify(id).length + JSON.stringify(value).length + 2;
    if (size + cost > CHUNK - 200 && size > 0) { parts.push(cur); cur = { items: {}, repair: {}, days: {} }; size = 0; }
    cur[kind][id] = value; size += cost;
  };
  for (const kind of ['days', 'repair', 'items']) for (const id of Object.keys(state[kind] || {}).sort()) push(kind, id, state[kind][id]);
  parts.push(cur);
  if (parts.length > MAX_RECORD_PARTS) throw Object.assign(new Error('progress record too large'), { status: 413 });
  return parts.map((p, i) => JSON.stringify({ v: 1, i, parts: parts.length, updated: state.updated, items: p.items, repair: p.repair, days: p.days }));
}
export function joinState(cells) {
  const state = blank();
  const parsed = cells.map((c) => { try { return JSON.parse(c); } catch { return null; } }).filter((p) => p && p.v === 1);
  const head = parsed.find((p) => p.i === 0);
  const count = head ? num(head.parts) : 0;
  for (const p of parsed) {
    if (p.i >= count) continue;   // a row left over from a longer record
    Object.assign(state.items, p.items || {}); Object.assign(state.repair, p.repair || {}); Object.assign(state.days, p.days || {});
    state.updated = Math.max(state.updated, num(p.updated));
  }
  return state;
}

/* ---- Airtable ---- */
const toolName = (kind, i) => `acelabs.${kind}.${i}`;
const rowKey = (studentId, kind, i) => `${studentId}:${toolName(kind, i)}`;

export function airtableConfigured(env) { return !!(env && env.AIRTABLE_PAT); }

async function at(env, fetchImpl, path, { method = 'GET', body } = {}, retry = 1) {
  const res = await fetchImpl(`${AIRTABLE}/${env.ACE_LABS_AIRTABLE_BASE || BASE_ID}/${encodeURIComponent(TABLE)}${path}`, {
    method, headers: { Authorization: `Bearer ${env.AIRTABLE_PAT}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 429 && retry > 0) { await new Promise((r) => setTimeout(r, 1200)); return at(env, fetchImpl, path, { method, body }, retry - 1); }
  if (!res.ok) throw Object.assign(new Error(`progress store answered ${res.status}`), { status: 502 });
  return res.json();
}

/** Every acelabs.* row of ONE student. The id is validated by the caller and is the only filter. */
export async function loadRows(studentId, env, fetchImpl = fetch) {
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(studentId)) throw Object.assign(new Error('bad student id'), { status: 400 });
  const formula = `AND({Student Portal ID}='${studentId}', LEFT({Tool Name}, 8)='acelabs.')`;
  const rows = []; let offset = '';
  for (let page = 0; page < 20; page++) {
    const q = `?pageSize=100&filterByFormula=${encodeURIComponent(formula)}${offset ? `&offset=${encodeURIComponent(offset)}` : ''}`;
    const data = await at(env, fetchImpl, q);
    for (const r of data.records || []) {
      const f = r.fields || {};
      // checked again on the way out: a row that is not this student's never leaves this function
      if (f['Student Portal ID'] !== studentId) continue;
      rows.push({ recId: r.id, tool: String(f['Tool Name'] || ''), json: String(f['State JSON'] || '') });
    }
    offset = data.offset || ''; if (!offset) break;
  }
  return rows;
}

function byKind(rows, kind) {
  const re = new RegExp(`^acelabs\\.${kind}\\.(\\d+)$`);
  return rows.map((r) => { const m = re.exec(r.tool); return m ? { ...r, i: Number(m[1]) } : null; }).filter(Boolean).sort((a, b) => a.i - b.i);
}

export function readState(rows) { return joinState(byKind(rows, 'record').map((r) => r.json)); }
export function readAttempts(rows, limit = 300) {
  const out = [];
  for (const r of byKind(rows, 'attempts')) for (const line of r.json.split('\n')) { if (!line) continue; try { out.push(JSON.parse(line)); } catch { /* skip a damaged line */ } }
  return limit ? out.slice(-limit) : out;
}

async function writeRows(studentId, env, fetchImpl, writes) {
  const now = new Date().toISOString();
  const fields = (w) => ({ Key: rowKey(studentId, w.kind, w.i), 'Student Portal ID': studentId, 'Tool Name': toolName(w.kind, w.i), 'State JSON': w.json, 'Updated At': now });
  const updates = writes.filter((w) => w.recId), creates = writes.filter((w) => !w.recId);
  for (let i = 0; i < updates.length; i += 10) await at(env, fetchImpl, '', { method: 'PATCH', body: { records: updates.slice(i, i + 10).map((w) => ({ id: w.recId, fields: fields(w) })) } });
  for (let i = 0; i < creates.length; i += 10) await at(env, fetchImpl, '', { method: 'POST', body: { records: creates.slice(i, i + 10).map((w) => ({ fields: fields(w) })) } });
}

/**
 * Save one push for ONE student. incoming = { items, repair, days, attempts }.
 * Returns { state, saved: { attempts, record } }.
 */
export async function savePush(studentId, incoming, env, fetchImpl = fetch) {
  const rows = await loadRows(studentId, env, fetchImpl);
  const writes = [];

  const { state, changed } = mergeState(readState(rows), incoming);
  if (changed) {
    const existing = byKind(rows, 'record');
    splitState(state).forEach((json, i) => { const cur = existing.find((r) => r.i === i); if (!cur || cur.json !== json) writes.push({ kind: 'record', i, json, recId: cur && cur.recId }); });
  }

  const fresh = (Array.isArray(incoming && incoming.attempts) ? incoming.attempts : []).slice(0, MAX_BATCH_ATTEMPTS).map(cleanAttempt).filter(Boolean);
  let added = 0;
  if (fresh.length) {
    const logs = byKind(rows, 'attempts');
    const seen = new Set(readAttempts(rows, 0).slice(-3000).map((a) => `${a.id}|${a.at}`));
    let last = logs.length ? { ...logs[logs.length - 1] } : { i: 0, json: '', recId: undefined };
    let dirty = false;
    for (const a of fresh) {
      const k = `${a.id}|${a.at}`; if (seen.has(k)) continue; seen.add(k);
      const line = JSON.stringify(a);
      if (last.json.length + line.length + 1 > CHUNK) { if (dirty) writes.push({ kind: 'attempts', i: last.i, json: last.json, recId: last.recId }); last = { i: last.i + 1, json: '', recId: undefined }; dirty = false; }
      last.json += (last.json ? '\n' : '') + line; dirty = true; added += 1;
    }
    if (dirty) writes.push({ kind: 'attempts', i: last.i, json: last.json, recId: last.recId });
  }

  if (writes.length) await writeRows(studentId, env, fetchImpl, writes);
  return { state, saved: { attempts: added, record: changed } };
}

export async function loadProgress(studentId, env, fetchImpl = fetch) {
  const rows = await loadRows(studentId, env, fetchImpl);
  return { state: readState(rows), attempts: readAttempts(rows, 300) };
}
