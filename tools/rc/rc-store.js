/* rc-store.js : progress storage for the Ace Labs RC player.
 *
 * Today everything lives in this browser's localStorage. The player never touches
 * localStorage directly; it only calls the methods below, so a server can be added
 * later without changing the player:
 *
 *   AceRCStore.setRemote({
 *     pushAttempt: (attempt) => Promise<void>,   // called for every finished attempt
 *     pullAttempts: () => Promise<attempt[]>     // merged in by id on sync()
 *   });
 *   AceRCStore.sync();                            // pushes unsynced, pulls remote
 *
 * Every finished attempt carries a stable id and a `synced` flag, so a sync is
 * idempotent: push what is unsynced, merge what comes back by id.
 *
 * Keys (all under one prefix): acelabs.rc.v1.attempts, .active, .prefs
 */
(function () {
  'use strict';
  var PREFIX = 'acelabs.rc.v1.';
  var mem = {}; // fallback when storage is blocked (private mode, sandboxed preview)

  function read(key, fallback) {
    try {
      var raw = window.localStorage.getItem(PREFIX + key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) {
      return Object.prototype.hasOwnProperty.call(mem, key) ? mem[key] : fallback;
    }
  }
  function write(key, value) {
    mem[key] = value;
    try { window.localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* memory only */ }
  }
  function remove(key) {
    delete mem[key];
    try { window.localStorage.removeItem(PREFIX + key); } catch (e) { /* ignore */ }
  }

  var remote = null;

  var Store = {
    uid: function () {
      return 'rc-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    },

    /* finished attempts, newest first */
    attempts: function () { return read('attempts', []); },
    saveAttempt: function (attempt) {
      var list = Store.attempts().filter(function (a) { return a.id !== attempt.id; });
      attempt.synced = false;
      list.unshift(attempt);
      write('attempts', list.slice(0, 200));
      if (remote) Store.sync();
      return attempt;
    },
    attempt: function (id) {
      return Store.attempts().filter(function (a) { return a.id === id; })[0] || null;
    },

    /* the one in-progress session, so a reload resumes where the student was */
    active: function () { return read('active', null); },
    saveActive: function (session) { write('active', session); },
    clearActive: function () { remove('active'); },

    /* display preferences only (theme, pace plan, timing) */
    prefs: function () { return read('prefs', {}); },
    setPrefs: function (patch) {
      var p = Store.prefs();
      for (var k in patch) p[k] = patch[k];
      write('prefs', p);
      return p;
    },

    /* server sync seam */
    setRemote: function (adapter) { remote = adapter; },
    sync: function () {
      if (!remote) return Promise.resolve({ pushed: 0, pulled: 0 });
      var list = Store.attempts();
      var unsynced = list.filter(function (a) { return !a.synced; });
      return Promise.all(unsynced.map(function (a) {
        return remote.pushAttempt(a).then(function () { a.synced = true; });
      })).then(function () {
        return remote.pullAttempts ? remote.pullAttempts() : [];
      }).then(function (theirs) {
        var byId = {};
        list.forEach(function (a) { byId[a.id] = a; });
        (theirs || []).forEach(function (a) { if (!byId[a.id]) { a.synced = true; list.push(a); } });
        list.sort(function (x, y) { return (y.finishedAt || 0) - (x.finishedAt || 0); });
        write('attempts', list);
        return { pushed: unsynced.length, pulled: (theirs || []).length };
      });
    }
  };

  window.AceRCStore = Store;
})();
