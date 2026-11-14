/* ace-record.js : the one progress record. Every tool writes here.

   Key family: "ace.v1." (the same family shared/ace-progress.js already owns),
   so there is no new family. This module owns four keys:

     ace.v1.record    { schema: 1, updated,
                        items: { [itemId]: { section, topic, seen, right,
                                             last, lastOk, box, due } },
                        days:  { "YYYY-MM-DD": { seen, right } },
                        imported: { [missId]: { section, concept, status, due, source } } }
     ace.v1.attempts  the last 2,000 answers, newest last:
                        { id, section, topic, picked, answer, ok, ms, at, src, set }
     ace.v1.outbox    answers not yet accepted by the sync adapter
     ace.v1.migrated  { at, families: { name: keyCount }, keys: [{ k, bytes }] }

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
  function blank() { return { schema: 1, updated: 0, items: {}, days: {}, imported: {} }; }
  function load() { var r = read('record', null); if (!r || r.schema !== 1) r = blank(); r.items = r.items || {}; r.days = r.days || {}; r.imported = r.imported || {}; return r; }

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
    var d = dayKey(now), day = r.days[d] || { seen: 0, right: 0 };
    day.seen += 1; if (a.ok) day.right += 1; r.days[d] = day;
    r.updated = now; write('record', r);
    var row = { id: id, section: it.section, topic: it.topic, picked: a.picked, answer: a.answer, ok: !!a.ok, ms: a.ms || 0, at: now, src: a.src || '', set: a.set || '' };
    var log = read('attempts', []); log.push(row); if (log.length > MAX_ATTEMPTS) log = log.slice(log.length - MAX_ATTEMPTS); write('attempts', log);
    var out = read('outbox', []); out.push(row); write('outbox', out);
    emit({ type: 'record', attempt: row, item: it });
    flush();
    return it;
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
    version: 1, LADDER: LADDER, FAMILIES: FAMILIES.map(function (f) { return f[0]; }),
    record: record, item: item, due: due, missed: missed, stats: stats, topics: topics, today: today, attempts: attempts,
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
