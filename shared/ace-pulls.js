/* ace-pulls.js : which auto-approved items are pulled, for every page that
   shows one (B1.2t). Thomas (or Sarah, for PAT) can pull any stamped item on
   the review page; a pulled item stops showing everywhere. Pulls never fail
   open: an outage, a blocked store or a bad answer can hide more, never less.

     <script src="/shared/ace-pulls.js?v=1"></script>
     AcePulls.ready().then(function () { if (AcePulls.isPulled('retold:bio:1')) ... });

   Three lists, and a pull in any of them wins:
     snapshot  /content/approvals/pulls-snapshot.json, written at each release
               tag and bundled with it (always present on a release)
     storage   localStorage acelabs.v1.pulls: the last good live list, plus the
               last snapshot this browser read, so the next page knows both
               before anything loads: { v: 1, at, ids: [...], snap: [...] }
     live      /.netlify/functions/approvals?pulls=1, cached 60 seconds in
               sessionStorage under the same key: { at, ids: [...] }
   The live list replaces the stored one only when it arrives whole (HTTP 200
   and a list); an error, a timeout, a 404 or anything else leaves storage as
   it was. When the fetches and storage all fail, the snapshot still applies;
   when the snapshot cannot load either, the last stored snapshot does.

   A list is either an array or an object holding one under "pulls" (or
   "ids"); each entry is an id string or { id }. Ids are 1 to 200 characters of
   letters, digits and : . _ / - (anything else is dropped). An id is pulled
   when it, or an id it extends at a colon, is listed: a pulled night
   retold:<course>:<night> also pulls its scenes retold:<course>:<night>:<scene>.
   <course> is the section key of shared/ace-index.js: bio, gchem, ochem, qr,
   pat, rc.

   window.AcePulls:
     ready()        a Promise (never rejects) that settles once the snapshot and
                    the live list have each loaded or failed (4 s at most);
                    resolves to state()
     isPulled(id)   true when pulled by any list known now. Safe before ready():
                    it answers from storage, then from each list as it lands
     list()         every pulled id known now, sorted
     state()        { ids, snapshot, live, storage }: each source 'ok', 'cached',
                    'failed', 'empty' or 'pending'
     refresh()      fetch the live list again now, past the cache; a Promise
   Fires window 'acelabs:pulls' ({ detail: { ids } }) whenever the set grows or
   shrinks. Plain ES5; the only requests are the two above. */
(function () {
  'use strict';
  if (window.AcePulls) return;
  var VERSION = '1';
  var KEY = 'acelabs.v1.pulls';
  var SNAPSHOT_URL = '/content/approvals/pulls-snapshot.json';
  var LIVE_URL = '/.netlify/functions/approvals?pulls=1';
  var CACHE_MS = 60000;
  var TIMEOUT_MS = 4000;
  var ID = /^[A-Za-z0-9][A-Za-z0-9:._\/-]{0,199}$/;

  /* ---------- lists ---------- */
  function idsOf(v) {
    if (v && !Array.isArray(v) && typeof v === 'object') v = Array.isArray(v.pulls) ? v.pulls : v.ids;
    if (!Array.isArray(v)) return null;
    var out = [];
    for (var i = 0; i < v.length; i++) {
      var x = v[i];
      if (x && typeof x === 'object') x = x.id;
      if (typeof x === 'string' && ID.test(x) && out.indexOf(x) < 0) out.push(x);
    }
    return out;
  }
  var lists = { snapshot: [], storage: [], live: [] };
  var state = { snapshot: 'pending', live: 'pending', storage: 'empty' };
  var known = {};
  function rebuild() {
    var next = {}, added = false, removed = false;
    ['snapshot', 'storage', 'live'].forEach(function (k) { lists[k].forEach(function (id) { next[id] = 1; }); });
    Object.keys(next).forEach(function (id) { if (!known[id]) added = true; });
    Object.keys(known).forEach(function (id) { if (!next[id]) removed = true; });
    known = next;
    if (added || removed) announce();
  }
  function list() { return Object.keys(known).sort(); }
  function isPulled(id) {
    if (typeof id !== 'string' || !id) return false;
    var parts = id.split(':');
    for (var n = parts.length; n >= 1; n--) if (known[parts.slice(0, n).join(':')]) return true;
    return false;
  }
  function announce() {
    try {
      var ev;
      if (typeof window.CustomEvent === 'function') ev = new window.CustomEvent('acelabs:pulls', { detail: { ids: list() } });
      if (ev && window.dispatchEvent) window.dispatchEvent(ev);
    } catch (e) { /* no events here */ }
  }

  /* ---------- storage (either store may be missing or throw) ---------- */
  function store(name) { try { return window[name] || null; } catch (e) { return null; } }
  function readFrom(name) {
    try {
      var s = store(name), raw = s ? s.getItem(KEY) : null;
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function writeTo(name, value) {
    try { var s = store(name); if (s) s.setItem(KEY, JSON.stringify(value)); } catch (e) { /* blocked or full: memory only */ }
  }
  var stored = readFrom('localStorage');
  if (stored && typeof stored === 'object') {
    var a = idsOf(stored.ids) || [], b = idsOf(stored.snap) || [];
    lists.storage = a.concat(b.filter(function (x) { return a.indexOf(x) < 0; }));
    state.storage = 'ok';
  } else stored = null;
  function remember(patch) {
    var rec = { v: 1, at: Date.now(), ids: stored && idsOf(stored.ids) || [], snap: stored && idsOf(stored.snap) || [] };
    Object.keys(patch).forEach(function (k) { rec[k] = patch[k]; });
    stored = rec;
    writeTo('localStorage', rec);
  }

  /* ---------- fetches (never reject; null on any failure) ---------- */
  function getJSON(url, cache) {
    if (typeof window.fetch !== 'function') return Promise.resolve(null);
    return new Promise(function (resolve) {
      var done = false, ctl = null;
      try { ctl = typeof window.AbortController === 'function' ? new window.AbortController() : null; } catch (e) { ctl = null; }
      var t = setTimeout(function () { finish(null); if (ctl) try { ctl.abort(); } catch (e) { /* gone */ } }, TIMEOUT_MS);
      function finish(v) { if (done) return; done = true; clearTimeout(t); resolve(v); }
      try {
        window.fetch(url, { credentials: 'same-origin', cache: cache, headers: { accept: 'application/json' }, signal: ctl ? ctl.signal : undefined })
          .then(function (r) { return r && r.ok ? r.json() : null; })
          .then(function (j) { finish(j == null ? null : j); }, function () { finish(null); });
      } catch (e) { finish(null); }
    });
  }

  function loadSnapshot() {
    return getJSON(SNAPSHOT_URL, 'no-cache').then(function (j) {
      var ids = j == null ? null : idsOf(j);
      if (!ids) { state.snapshot = 'failed'; return; }
      lists.snapshot = ids;
      state.snapshot = 'ok';
      remember({ snap: ids });
      rebuild();
    });
  }
  function fromCache() {
    var c = readFrom('sessionStorage'), now = Date.now();
    if (!c || typeof c.at !== 'number' || c.at > now || now - c.at >= CACHE_MS) return null;
    return idsOf(c.ids);
  }
  function loadLive(force) {
    var cached = force ? null : fromCache();
    if (cached) {
      lists.live = cached;
      state.live = 'cached';
      rebuild();
      return Promise.resolve();
    }
    return getJSON(LIVE_URL, 'no-store').then(function (j) {
      var ids = j == null ? null : idsOf(j);
      if (!ids) { state.live = 'failed'; return; }
      lists.live = ids;
      state.live = 'ok';
      writeTo('sessionStorage', { at: Date.now(), ids: ids });
      remember({ ids: ids });
      /* the last good list is now this one (an unpull lands at once) */
      lists.storage = ids.concat((stored.snap || []).filter(function (x) { return ids.indexOf(x) < 0; }));
      state.storage = 'ok';
      rebuild();
    });
  }

  function snapshotState() {
    return { ids: list(), snapshot: state.snapshot, live: state.live, storage: state.storage };
  }
  rebuild();
  var readyP = Promise.all([loadSnapshot(), loadLive(false)]).then(snapshotState, snapshotState);

  window.AcePulls = {
    version: VERSION,
    KEY: KEY,
    SNAPSHOT_URL: SNAPSHOT_URL,
    LIVE_URL: LIVE_URL,
    CACHE_MS: CACHE_MS,
    ready: function () { return readyP; },
    isPulled: isPulled,
    list: list,
    state: snapshotState,
    refresh: function () { return loadLive(true).then(snapshotState, snapshotState); }
  };
})();
