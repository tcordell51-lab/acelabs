/*
  pat-store.js : progress for the PAT test, behind one small interface.

  Today it persists to localStorage only (Ace Labs is a static site with no
  student accounts). Everything goes through PAT.store, so a server sync can be
  added later without touching the test page:

    PAT.store.setSyncAdapter({
      push: function (attempt) { return fetch(...).then(...); },   // Promise
      pull: function () { return Promise.resolve([attempt, ...]); } // optional
    });

  Once an adapter is set, every save() is queued and pushed; failed pushes stay
  queued (key PENDING) and retry on the next save or on flush(). pull() results
  are merged by updatedAt (newest wins). localStorage remains a cache.

  Attempt shape:
    { id, testId, label, mode: 'standard'|'thomas', status: 'in-progress'|'finished',
      createdAt, updatedAt, finishedAt, remainingSec, cursor,
      answers: [90 x (0-4|null)], marked: [90 x bool], timeSpent: [90 x seconds],
      summary: { total, of, sections: [{type, correct, of, timeSec}] } }
*/
(function (root) {
  'use strict';
  var PAT = root.PAT || (typeof require === 'function' ? require('./pat-core.js') : null);

  var KEY = 'atDAT_patTest_v1';
  var PENDING = 'atDAT_patTest_pending_v1';
  var memory = {};                       // fallback when storage is blocked
  var adapter = null, listeners = [];

  function ls() { try { return root.localStorage || null; } catch (e) { return null; } }
  function readAll() {
    var s = ls();
    if (!s) return memory;
    try { return JSON.parse(s.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function writeAll(all) {
    var s = ls();
    if (!s) { memory = all; return; }
    try { s.setItem(KEY, JSON.stringify(all)); } catch (e) { memory = all; }
  }
  function pending() { var s = ls(); try { return s ? JSON.parse(s.getItem(PENDING) || '[]') : []; } catch (e) { return []; } }
  function setPending(ids) { var s = ls(); try { if (s) s.setItem(PENDING, JSON.stringify(ids)); } catch (e) { /* cache only */ } }
  function emit(a) { listeners.forEach(function (fn) { try { fn(a); } catch (e) { /* listener error */ } }); }

  function newAttempt(test, mode) {
    var n = test.items.length, now = Date.now();
    return {
      id: test.id + '-' + now.toString(36), testId: test.testId, label: test.label, mode: mode || 'standard',
      status: 'in-progress', createdAt: now, updatedAt: now, finishedAt: null,
      remainingSec: 3600, cursor: 0,
      answers: new Array(n).fill(null), marked: new Array(n).fill(false), timeSpent: new Array(n).fill(0)
    };
  }
  function list() {
    var all = readAll();
    return Object.keys(all).map(function (k) { return all[k]; }).sort(function (a, b) { return b.updatedAt - a.updatedAt; });
  }
  function get(id) { return readAll()[id] || null; }
  function save(attempt) {
    attempt.updatedAt = Date.now();
    var all = readAll(); all[attempt.id] = attempt; writeAll(all);
    if (adapter) { var p = pending(); if (p.indexOf(attempt.id) < 0) p.push(attempt.id); setPending(p); flush(); }
    emit(attempt);
    return attempt;
  }
  function remove(id) { var all = readAll(); delete all[id]; writeAll(all); }
  function inProgressFor(testId) {
    return list().filter(function (a) { return a.status === 'in-progress' && String(a.testId) === String(testId); })[0] || null;
  }
  function latestFinished(testId) {
    return list().filter(function (a) { return a.status === 'finished' && String(a.testId) === String(testId); })[0] || null;
  }
  function flush() {
    if (!adapter || !adapter.push) return Promise.resolve();
    var ids = pending(), all = readAll();
    return Promise.all(ids.map(function (id) {
      if (!all[id]) return id;
      return Promise.resolve(adapter.push(all[id])).then(function () { return null; }, function () { return id; });
    })).then(function (left) { setPending(left.filter(Boolean)); });
  }
  function pull() {
    if (!adapter || !adapter.pull) return Promise.resolve(list());
    return Promise.resolve(adapter.pull()).then(function (remote) {
      var all = readAll();
      (remote || []).forEach(function (r) { if (!all[r.id] || all[r.id].updatedAt < r.updatedAt) all[r.id] = r; });
      writeAll(all);
      return list();
    });
  }
  function setSyncAdapter(a) { adapter = a || null; return flush(); }
  function onChange(fn) { listeners.push(fn); }
  function exportJSON() { return JSON.stringify(readAll()); }
  function importJSON(text) { var inc = JSON.parse(text), all = readAll(); Object.keys(inc).forEach(function (k) { if (!all[k] || all[k].updatedAt < inc[k].updatedAt) all[k] = inc[k]; }); writeAll(all); return list(); }

  PAT.store = { KEY: KEY, newAttempt: newAttempt, list: list, get: get, save: save, remove: remove, inProgressFor: inProgressFor, latestFinished: latestFinished, setSyncAdapter: setSyncAdapter, flush: flush, pull: pull, onChange: onChange, exportJSON: exportJSON, importJSON: importJSON };
  if (typeof module === 'object' && module.exports) module.exports = PAT;
})(typeof self !== 'undefined' ? self : globalThis);
