/* ace-record.js : the one progress record. Every tool writes here.

   Key family: "ace.v1." (the same family shared/ace-progress.js already owns),
   so there is no new family. This module owns four keys:

     ace.v1.record    { schema: 1, updated,
                        items: { [itemId]: { section, topic, seen, right,
                                             last, lastOk, box, due } },
                        days:  { "YYYY-MM-DD": { seen, right } },
                        imported: { [missId]: { section, concept, status, due, source } } }
     ace.v1.attempts  the last 2,000 answers, newest last:
                        { id, section, topic, picked, answer, ok, ms, at, src, set,
                          first, changes, change, conf }
                        first: the first letter picked; changes: how many times the pick
                        moved; change: 'none' | 'w2r' | 'r2w' | 'w2w'; conf: 'sure' |
                        'unsure' | 'guess' | null (all added 2026-11-16)
     ace.v1.events    the last 1,000 tool events (lab steps, figure reveals): { name, at, ...data }
     ace.v1.outbox    answers not yet accepted by the sync adapter
     ace.v1.migrated  { at, families: { name: keyCount }, keys: [{ k, bytes }] }

   Repair (2026-11-16): every miss also opens a repair entry in the same record
   (record.repair). One scheduler, simple interval logic in localStorage for now
   (Ace Engine's FSRS is not wired into the browser yet):
     - the miss comes back the next day, or in 2 days when the student tags it
       "Fell for a trap", "Misread it" or "Changed my answer";
     - "Didn't know it" puts a short lesson before the first return;
     - "Ran short on time" makes the first return untimed;
     - it returns as a new version (a twin: same section and skill, other stem);
     - it clears after 2 wins on different calendar days, answered unassisted
       (nothing opened before answering); a wrong answer resets it to the next day.

   Spaced repeat: a right answer moves an item up one box and schedules it
   LADDER[box] days out (1, 3, 7, 14, 30). A wrong answer sends it back to box 0,
   due the next day. An item that reaches the top box counts as held.

   localStorage is a cache, never the record of truth. When the portal sync
   exists, attach it once and nothing else changes:

     AceRecord.setSync({ push: function (batch) { return fetch(...); } });   // returns a Promise

   Old progress is never deleted. migrate() lists every key from the twelve
   older key families, imports the misses that shared/ace-progress.js can
   already read, and legacyExport() hands back the raw values for upload. */
(function () {
  'use strict';
  if (window.AceRecord) return;
  var NS = 'ace.v1.';
  var DAY = 864e5;
  var LADDER = [1, 3, 7, 14, 30];
  var MAX_ATTEMPTS = 2000;
  var FAMILIES = [
    ['acelabs', /^acelabs[._:\-]/], ['aceLabs', /^aceLabs[._:\-]/], ['acethedat', /^acethedat[._:\-]/],
    ['atDAT', /^atDAT[._:\-]/], ['al', /^al[:._\-]/], ['tt', /^tt[._:\-]/], ['ochem', /^ochem[._:\-]/],
    ['gc', /^gc[._:\-]/], ['qr', /^qr[._:\-]/], ['bio', /^bio[._:\-]/], ['vo', /^vo[._:\-]/], ['tdr', /^tdr[._:\-]/]
  ];

  var mem = {};
  function ls() { try { return window.localStorage; } catch (e) { return null; } }
  function read(k, def) {
    var s = ls(), v = null;
    try { v = s ? s.getItem(NS + k) : null; } catch (e) { v = null; }
    if (v == null) v = Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null;
    if (v == null) return def;
    try { var p = JSON.parse(v); return p == null ? def : p; } catch (e) { return def; }
  }
  function write(k, value) {
    var str = JSON.stringify(value); mem[k] = str;
    try { var s = ls(); if (s) s.setItem(NS + k, str); } catch (e) { /* storage full or blocked: memory only */ }
  }
  function dayKey(t) { var d = new Date(t); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function blank() { return { schema: 1, updated: 0, items: {}, days: {}, imported: {}, repair: {} }; }
  function load() { var r = read('record', null); if (!r || r.schema !== 1) r = blank(); r.items = r.items || {}; r.days = r.days || {}; r.imported = r.imported || {}; r.repair = r.repair || {}; return r; }

  var listeners = [], sync = null, flushing = false;
  function emit(what) { listeners.forEach(function (fn) { try { fn(what); } catch (e) { /* a listener must not break a save */ } }); }

  /* Save one answer. a = { item: { id, section, topic }, picked, answer, ok, ms, src, set } */
  function record(a) {
    if (!a || !a.item || !a.item.id) throw new Error('AceRecord.record needs item.id');
    var now = a.at || Date.now(), r = load(), id = String(a.item.id);
    var it = r.items[id] || { section: a.item.section || '', topic: a.item.topic || '', seen: 0, right: 0, last: 0, lastOk: false, box: 0, due: 0 };
    it.section = a.item.section || it.section; it.topic = a.item.topic || it.topic;
    it.seen += 1; if (a.ok) it.right += 1;
    it.last = now; it.lastOk = !!a.ok;
    it.box = a.ok ? Math.min(it.box + 1, LADDER.length) : 0;
    it.due = now + (a.ok ? LADDER[Math.min(it.box, LADDER.length) - 1] : 1) * DAY;
    r.items[id] = it;
    if (!a.ok && a.repair !== false) repairOpen(r, a, now);
    var d = dayKey(now), day = r.days[d] || { seen: 0, right: 0 };
    day.seen += 1; if (a.ok) day.right += 1; r.days[d] = day;
    r.updated = now; write('record', r);
    var row = { id: id, section: it.section, topic: it.topic, picked: a.picked, answer: a.answer, ok: !!a.ok, ms: a.ms || 0, at: now, src: a.src || '', set: a.set || '' };
    if (a.first != null) row.first = a.first;
    if (a.changes != null) row.changes = a.changes;
    row.change = a.change || (a.first != null && a.first !== a.picked ? (a.first === a.answer ? 'r2w' : (a.ok ? 'w2r' : 'w2w')) : 'none');
    if (a.conf) row.conf = a.conf;
    var log = read('attempts', []); log.push(row); if (log.length > MAX_ATTEMPTS) log = log.slice(log.length - MAX_ATTEMPTS); write('attempts', log);
    var out = read('outbox', []); out.push(row); write('outbox', out);
    emit({ type: 'record', attempt: row, item: it });
    flush();
    return it;
  }

  /* ---- repair: one queue for every miss ---- */
  var REASONS = { know: "Didn't know it", trap: 'Fell for a trap', misread: 'Misread it', time: 'Ran short on time', changed: 'Changed my answer' };
  function startOfDay(t) { var d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function daysOut(now, n) { return startOfDay(now) + n * DAY + 3600e3; }   // 1 am on day +n, so "due today" means any time today
  function repairOpen(r, a, now) {
    r.repair = r.repair || {};
    var id = String(a.item.id), e = r.repair[id];
    if (!e || e.cleared) {
      e = r.repair[id] = { id: id, section: a.item.section || '', topic: a.item.topic || '', topicName: a.item.topicName || a.item.topic || '',
        trap: a.item.trapTag || a.item.topicName || a.item.topic || '', src: a.src || '', missedAt: now, reason: null, wins: [],
        due: daysOut(now, 1), resets: 0, cleared: 0, served: [], lessonFirst: false, untimedFirst: false };
    } else {   // missed again while open: reset
      e.wins = []; e.resets += 1; e.due = daysOut(now, 1); e.lastMiss = now;
    }
    return e;
  }
  /* Tag why a miss happened. Drives the first return. */
  function repairReason(id, reason, now) {
    now = now || Date.now();
    if (!REASONS[reason]) throw new Error('unknown reason ' + reason);
    var r = load(); r.repair = r.repair || {}; var e = r.repair[String(id)]; if (!e) return null;
    e.reason = reason;
    e.lessonFirst = reason === 'know'; e.untimedFirst = reason === 'time';
    e.due = daysOut(e.lastMiss || e.missedAt || now, (reason === 'know' || reason === 'time') ? 1 : 2);
    r.updated = now; write('record', r); emit({ type: 'repair', entry: e });
    return e;
  }
  /* Answer a repair return. o = { servedId, ok, assisted, at } */
  function repairAnswer(id, o) {
    o = o || {}; var now = o.at || Date.now();
    var r = load(); r.repair = r.repair || {}; var e = r.repair[String(id)]; if (!e || e.cleared) return e || null;
    if (o.servedId) { e.served = (e.served || []).concat(String(o.servedId)).slice(-12); }
    if (!o.ok) { e.wins = []; e.resets += 1; e.due = daysOut(now, 1); e.lastMiss = now; e.lessonFirst = false; }
    else if (o.assisted) { e.due = daysOut(now, 1); }
    else {
      var today = startOfDay(now);
      if (!e.wins.some(function (w) { return startOfDay(w) === today; })) e.wins.push(now);
      if (e.wins.length >= 2) e.cleared = now;
      else e.due = daysOut(now, 2);
      e.untimedFirst = false; e.lessonFirst = false;
    }
    r.updated = now; write('record', r); emit({ type: 'repair', entry: e });
    return e;
  }
  function repairList(q) {
    q = q || {}; var now = q.now || Date.now(), end = startOfDay(now) + DAY, r = load(), all = r.repair || {};
    var open = [], due = [], cleared = [], weekStart = startOfDay(now) - ((new Date(now).getDay() + 6) % 7) * DAY;
    Object.keys(all).forEach(function (k) {
      var e = all[k]; if (q.section && e.section !== q.section) return;
      if (e.cleared) { if (e.cleared >= weekStart) cleared.push(e); return; }
      open.push(e); if (e.due < end) due.push(e);
    });
    due.sort(function (a, b) { return a.due - b.due; });
    return { open: open, due: due, clearedThisWeek: cleared, weekStart: weekStart };
  }
  function repairLesson(id, now) { var r = load(); var e = (r.repair || {})[String(id)]; if (!e) return null; e.lessonAt = now || Date.now(); write('record', r); return e; }
  function repairEntry(id) { var r = load(); return (r.repair || {})[String(id)] || null; }
  /* The next version to serve: same section and skill, not the missed stem, not served lately.
     Falls back to the missed item itself only when the bank has no twin (flagged sameItem). */
  function repairVersion(e, bank) {
    var served = {}; (e.served || []).forEach(function (x) { served[x] = 1; });
    var pool = (bank || []).filter(function (it) { return it.section === e.section && it.topic === e.topic && String(it.id) !== e.id; });
    var fresh = pool.filter(function (it) { return !served[String(it.id)]; });
    var pick = (fresh.length ? fresh : pool);
    if (pick.length) return { item: pick[Math.floor(Math.random() * pick.length)], sameItem: false };
    var self = (bank || []).filter(function (it) { return String(it.id) === e.id; })[0];
    return { item: self || null, sameItem: true };
  }

  function item(id) { return load().items[String(id)] || null; }
  function matches(it, q) { return (!q.section || it.section === q.section) && (!q.topic || it.topic === q.topic); }
  /* Ids that are due for a spaced repeat, oldest first. q = { section, topic, now } */
  function due(q) {
    q = q || {}; var now = q.now || Date.now(), r = load(), out = [];
    Object.keys(r.items).forEach(function (id) { var it = r.items[id]; if (matches(it, q) && it.due && it.due <= now && it.box < LADDER.length) out.push({ id: id, due: it.due, lastOk: it.lastOk }); });
    out.sort(function (a, b) { return a.due - b.due; });
    return out.map(function (x) { return x.id; });
  }
  /* Ids whose most recent answer was wrong. */
  function missed(q) {
    q = q || {}; var r = load();
    return Object.keys(r.items).filter(function (id) { var it = r.items[id]; return matches(it, q) && it.seen > 0 && !it.lastOk; }).sort(function (a, b) { return r.items[b].last - r.items[a].last; });
  }
  /* Raw counts only: no estimated score, no percentile. */
  function stats(q) {
    q = q || {}; var now = q.now || Date.now(), r = load(), s = { items: 0, answers: 0, right: 0, due: 0, missed: 0, held: 0, last: 0 };
    Object.keys(r.items).forEach(function (id) {
      var it = r.items[id]; if (!matches(it, q)) return;
      s.items += 1; s.answers += it.seen; s.right += it.right; if (it.last > s.last) s.last = it.last;
      if (!it.lastOk) s.missed += 1;
      if (it.box >= LADDER.length) s.held += 1; else if (it.due && it.due <= now) s.due += 1;
    });
    return s;
  }
  function topics(section) {
    var r = load(), out = {};
    Object.keys(r.items).forEach(function (id) { var it = r.items[id]; if (section && it.section !== section) return; var t = out[it.topic] || (out[it.topic] = { items: 0, answers: 0, right: 0, missed: 0 }); t.items += 1; t.answers += it.seen; t.right += it.right; if (!it.lastOk) t.missed += 1; });
    return out;
  }
  /* Answer changes, the student's own counts only (learning phase design, section 5). Never a
     comparison with other students and never a blanket rule; below 20 changes the sample is
     called too small. q = { section, src } */
  function changeStats(q) {
    q = q || {}; var out = { answers: 0, changed: 0, w2r: 0, r2w: 0, w2w: 0, net: 0, enough: false, bySure: { sure: [0, 0], unsure: [0, 0], guess: [0, 0] } };
    attempts().forEach(function (a) {
      if (q.section && a.section !== q.section) return; if (q.src && a.src !== q.src) return;
      out.answers += 1;
      if (a.change && a.change !== 'none') { out.changed += 1; out[a.change] = (out[a.change] || 0) + 1; }
      if (a.conf && out.bySure[a.conf]) { out.bySure[a.conf][0] += 1; if (a.ok) out.bySure[a.conf][1] += 1; }
    });
    out.net = out.w2r - out.r2w; out.enough = out.changed >= 20;
    return out;
  }
  /* A light event log for tools that are not questions (a lab step, a figure reveal). */
  function event(name, data) {
    var row = { name: String(name || ''), at: Date.now() };
    if (data && typeof data === 'object') Object.keys(data).forEach(function (k) { if (k !== 'name' && k !== 'at') row[k] = data[k]; });
    var log = read('events', []); log.push(row); if (log.length > 1000) log = log.slice(log.length - 1000); write('events', log);
    emit({ type: 'event', event: row });
    return row;
  }
  function events() { return read('events', []); }
  function today(now) { var r = load(); return r.days[dayKey(now || Date.now())] || { seen: 0, right: 0 }; }
  function attempts() { return read('attempts', []); }

  /* ---- sync: an outbox that survives reloads ---- */
  function setSync(adapter) { sync = adapter || null; return flush(); }
  function flush() {
    if (!sync || flushing) return Promise.resolve(false);
    var batch = read('outbox', []); if (!batch.length) return Promise.resolve(true);
    flushing = true;
    return Promise.resolve().then(function () { return sync.push(batch.slice()); }).then(function () {
      var left = read('outbox', []).slice(batch.length); write('outbox', left); flushing = false; emit({ type: 'synced', count: batch.length }); return true;
    }, function () { flushing = false; return false; });
  }
  function pending() { return read('outbox', []).length; }

  /* ---- older key families: list, import, export. Nothing is deleted. ---- */
  function legacyKeys() {
    var s = ls(), out = []; if (!s) return out;
    try { for (var i = 0; i < s.length; i++) { var k = s.key(i); if (!k || k.indexOf(NS) === 0) continue; for (var j = 0; j < FAMILIES.length; j++) if (FAMILIES[j][1].test(k)) { out.push({ k: k, family: FAMILIES[j][0], bytes: (s.getItem(k) || '').length }); break; } } } catch (e) { /* blocked */ }
    return out;
  }
  function legacyExport() { var s = ls(), out = {}; legacyKeys().forEach(function (x) { try { out[x.k] = s.getItem(x.k); } catch (e) { /* skip */ } }); return out; }
  function migrate(force) {
    var done = read('migrated', null);
    var keys = legacyKeys();
    if (done && !force && done.keys && done.keys.length === keys.length) return done;
    var fam = {}; keys.forEach(function (x) { fam[x.family] = (fam[x.family] || 0) + 1; });
    var r = load(), n = 0;
    // shared/ace-progress.js already normalizes misses from ten older tools; carry them in.
    if (window.AceProgress && typeof window.AceProgress.misses === 'function') {
      try { window.AceProgress.misses({ includeMastered: true }).forEach(function (m) { if (!m || !m.id || /^record:/.test(m.id)) return; r.imported[m.id] = { section: m.section || '', concept: m.concept || m.topic || '', status: m.status || 'learning', due: m.due || 0, source: m.source || '' }; n += 1; }); } catch (e) { /* an adapter failed: keep what we have */ }
    }
    write('record', r);
    var out = { at: Date.now(), families: fam, keys: keys.map(function (x) { return { k: x.k, bytes: x.bytes }; }), importedMisses: n };
    write('migrated', out); emit({ type: 'migrated', result: out });
    return out;
  }
  function exportAll() { return { schema: 1, exported: Date.now(), record: load(), attempts: attempts(), legacy: legacyExport() }; }

  window.AceRecord = {
    version: 2, LADDER: LADDER, FAMILIES: FAMILIES.map(function (f) { return f[0]; }),
    record: record, item: item, due: due, missed: missed, stats: stats, topics: topics, today: today, attempts: attempts,
    changeStats: changeStats, event: event, events: events,
    REASONS: REASONS, repairReason: repairReason, repairAnswer: repairAnswer, repairList: repairList, repairEntry: repairEntry, repairVersion: repairVersion, repairLesson: repairLesson,
    setSync: setSync, flush: flush, pending: pending, onChange: function (fn) { listeners.push(fn); },
    migrate: migrate, legacyKeys: legacyKeys, legacyExport: legacyExport, exportAll: exportAll,
    imported: function () { return load().imported; }
  };

  // The existing Review and Performance pages read through AceProgress: show them this record too.
  if (window.AceProgress && typeof window.AceProgress.registerMissAdapter === 'function') {
    window.AceProgress.registerMissAdapter('record', function () {
      var r = load();
      return Object.keys(r.items).filter(function (id) { return !r.items[id].lastOk; }).map(function (id) {
        var it = r.items[id];
        return { id: 'record:' + id, section: it.section, concept: it.topic, topic: it.topic, source: 'record', sourceLabel: 'Practice sets', when: it.last, detail: '' };
      });
    });
  }
})();
