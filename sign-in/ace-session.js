/* ace-session.js : the portal sign-in on the Ace Labs side.

   This file is only ever loaded when the sign-in is switched on (ACE_LABS_SIGN_IN):
   the edge gate adds it to each page, and /sign-in/ loads it itself. With the switch
   off no page includes it and nothing here runs.

   What it does
     1. Handoff. The portal sends a signed-in student here with a two minute token in
        the address fragment (#h=...). It is taken off the address at once and exchanged
        at /.netlify/functions/ace-session-exchange for an Ace Labs session. The student
        id comes from that verified session only, never from the address.
     2. One student per browser cache. localStorage is a cache of the server copy. When
        a different student signs in on the same browser, the earlier student's cache is
        set aside first, so nobody sees or uploads someone else's work.
     3. Sync. Answers, misses with their reason tag, and repair state go to
        /.netlify/functions/ace-progress (Airtable). On load the server copy is pulled
        and merged into the cache, so Repair and Progress show the server copy.
     4. Sign out. AceSession.signOut() clears the session and sets the cache aside.
     5. Email accounts and the pass (only while ACE_LABS_ACCOUNTS is on). A sign-in link from
        email lands on /sign-in/#m=<token>; the page posts it to ace-magic-verify and gets the same
        kind of session as the portal sign-in. AceSession.account() refreshes it (a pass paid a
        minute ago takes effect), checkout() starts Stripe Checkout, confirm() finishes it.

   Keys (family ace.v1.): session, owner, dirty, park.<studentId>.<key> */
(function () {
  'use strict';
  if (window.AceSession) return;
  var NS = 'ace.v1.';
  var FN = '/.netlify/functions/';
  var CACHE_KEYS = ['record', 'attempts', 'outbox', 'events', 'dirty'];
  var listeners = [];

  function ls() { try { return window.localStorage; } catch (e) { return null; } }
  function getRaw(k) { var s = ls(); try { return s ? s.getItem(NS + k) : null; } catch (e) { return null; } }
  function setRaw(k, v) { var s = ls(); try { if (s) s.setItem(NS + k, v); } catch (e) { /* storage full or blocked */ } }
  function delRaw(k) { var s = ls(); try { if (s) s.removeItem(NS + k); } catch (e) { /* blocked */ } }
  function getJson(k, def) { var v = getRaw(k); if (v == null) return def; try { var p = JSON.parse(v); return p == null ? def : p; } catch (e) { return def; } }
  function setJson(k, v) { setRaw(k, JSON.stringify(v)); }
  function framed() { try { return window.top !== window.self; } catch (e) { return true; } }
  function emit(what) { listeners.forEach(function (fn) { try { fn(what); } catch (e) { /* a listener must not break sign-in */ } }); }

  /* ---- the session ---- */
  function current() {
    var s = getJson('session', null);
    if (!s || !s.token || !s.exp || s.exp * 1000 <= Date.now()) { if (s) delRaw('session'); return null; }
    return s;
  }
  function isStudent(s) { return !!(s && s.role === 'student' && s.sub); }
  function call(name, opts) {
    opts = opts || {}; var s = current();
    var headers = { 'Content-Type': 'application/json' };
    if (s) headers['X-Ace-Session'] = s.token;
    return fetch(FN + name, { method: opts.method || 'GET', headers: headers, credentials: 'same-origin', body: opts.body ? JSON.stringify(opts.body) : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j.status = r.status; return j; }); });
  }

  /* ---- one student per cache ---- */
  /* The older tools keep their own keys (the twelve families shared/ace-record.js lists).
     They are browser-only, so they move aside with their owner too. */
  var LEGACY = /^(acelabs|aceLabs|acethedat|atDAT|tt|ochem|gc|qr|bio|vo|tdr)[._:\-]|^al[:._\-]/;
  function legacyKeys() {
    var s = ls(), out = []; if (!s) return out;
    try { for (var i = 0; i < s.length; i++) { var k = s.key(i); if (k && k.indexOf(NS) !== 0 && LEGACY.test(k)) out.push(k); } } catch (e) { /* blocked */ }
    return out;
  }
  function move(from, to) {
    var s = ls(); if (!s) return;
    try { var v = s.getItem(from); if (v == null) return; s.setItem(to, v); s.removeItem(from); } catch (e) { /* storage full: the key stays where it is */ }
  }
  function park(owner) {
    CACHE_KEYS.forEach(function (k) { move(NS + k, NS + 'park.' + owner + '.' + k); });
    legacyKeys().forEach(function (k) { move(k, NS + 'park.' + owner + '.L.' + k); });
  }
  function unpark(owner) {
    var s = ls(), pre = NS + 'park.' + owner + '.', mine = []; if (!s) return;
    try { for (var i = 0; i < s.length; i++) { var k = s.key(i); if (k && k.indexOf(pre) === 0) mine.push(k); } } catch (e) { /* blocked */ }
    mine.forEach(function (k) { var rest = k.slice(pre.length); move(k, rest.indexOf('L.') === 0 ? rest.slice(2) : NS + rest); });
  }
  /* Returns true when the cache changed hands and the page must reload to show it. */
  function claimCache(sub) {
    var owner = getRaw('owner') || '';
    if (owner === sub) return false;
    if (owner) park(owner);            // another student's cache: set it aside, never merge it
    // no owner: work done signed out on this browser (the free diagnostic) carries into the account
    unpark(sub);
    setRaw('owner', sub);
    return !!owner;
  }

  /* ---- merge the server copy into the cache (same rule as the server) ---- */
  function num(v) { v = Number(v); return isFinite(v) ? v : 0; }
  function stamp(e) { var m = Math.max(num(e._u), num(e.missedAt), num(e.lastMiss), num(e.cleared), num(e.lessonAt)); (e.wins || []).forEach(function (w) { if (num(w) > m) m = num(w); }); return m; }
  function mergeInto(local, server) {
    var changed = false, ahead = { items: {}, repair: {}, days: {} }, any = false, id;
    local.items = local.items || {}; local.repair = local.repair || {}; local.days = local.days || {};
    var si = server.items || {}, sr = server.repair || {}, sd = server.days || {};
    for (id in si) { var a = local.items[id], b = si[id]; if (!a || num(b.last) > num(a.last) || (num(b.last) === num(a.last) && num(b.seen) > num(a.seen))) { local.items[id] = b; changed = true; } }
    for (id in sr) { var c = local.repair[id]; if (!c || stamp(sr[id]) > stamp(c)) { local.repair[id] = sr[id]; changed = true; } }
    for (id in sd) { var d = local.days[id]; if (!d || num(sd[id].seen) > num(d.seen)) { local.days[id] = sd[id]; changed = true; } }
    // what this browser has that the server does not: send it back up
    for (id in local.items) { var x = si[id], y = local.items[id]; if (!x || num(y.last) > num(x.last)) { ahead.items[id] = y; any = true; } }
    for (id in local.repair) { if (!sr[id] || stamp(local.repair[id]) > stamp(sr[id])) { ahead.repair[id] = local.repair[id]; any = true; } }
    for (id in local.days) { if (!sd[id] || num(local.days[id].seen) > num(sd[id].seen)) { ahead.days[id] = local.days[id]; any = true; } }
    return { changed: changed, ahead: any ? ahead : null };
  }
  function mergeAttempts(server) {
    var log = getJson('attempts', []), seen = {}, added = 0;
    log.forEach(function (a) { seen[a.id + '|' + a.at] = 1; });
    (server || []).forEach(function (a) { var k = a.id + '|' + a.at; if (!seen[k]) { seen[k] = 1; log.push(a); added += 1; } });
    if (added) { log.sort(function (a, b) { return a.at - b.at; }); if (log.length > 2000) log = log.slice(log.length - 2000); setJson('attempts', log); }
    return added;
  }

  var VIEWS = /^\/(repair|progress|review|performance)?(\/|\/index\.html)?$/;   // pages that draw the record on load
  function pull() {
    var s = current(); if (!isStudent(s)) return Promise.resolve(false);
    return call('ace-progress').then(function (res) {
      if (res.status === 401) { delRaw('session'); emit({ type: 'signed-out' }); return false; }
      if (!res.ok || !res.record) return false;
      if (res.student !== s.sub) return false;   // never cache an answer that is not this student's
      var local = getJson('record', null);
      if (!local || local.schema !== 1) local = { schema: 1, updated: 0, items: {}, days: {}, imported: {}, repair: {} };
      var m = mergeInto(local, res.record);
      var added = mergeAttempts(res.attempts);
      if (m.changed) { local.updated = Date.now(); setJson('record', local); }
      if (m.ahead) push({ items: m.ahead.items, repair: m.ahead.repair, days: m.ahead.days });
      emit({ type: 'pulled', changed: m.changed || added > 0 });
      if ((m.changed || added > 0) && VIEWS.test(location.pathname)) {
        // the page drew from the cache before the server copy arrived: draw again, once
        var mark = 'ace.sync.redraw';
        try { if (!sessionStorage.getItem(mark) || Date.now() - Number(sessionStorage.getItem(mark)) > 15000) { sessionStorage.setItem(mark, String(Date.now())); location.reload(); } } catch (e) { /* no session storage: the next visit shows it */ }
      }
      return true;
    }, function () { return false; });
  }

  /* ---- push ---- */
  function push(body) {
    var s = current(); if (!isStudent(s)) return Promise.reject(new Error('signed out'));
    return call('ace-progress', { method: 'POST', body: body }).then(function (res) {
      if (res.status === 401) { delRaw('session'); emit({ type: 'signed-out' }); }
      if (!res.ok) throw new Error('progress not saved');
      emit({ type: 'saved', saved: res.saved });
      return res;
    });
  }
  function dayKey(t) { var d = new Date(t); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function snapshot(ids) {
    var rec = getJson('record', {}) || {}, items = {}, repair = {}, days = {}, now = Date.now();
    ids.forEach(function (id) {
      if (rec.items && rec.items[id]) items[id] = rec.items[id];
      if (rec.repair && rec.repair[id]) { var e = rec.repair[id]; e._u = Math.max(num(e._u), now); repair[id] = e; }
    });
    var today = dayKey(now); if (rec.days && rec.days[today]) days[today] = rec.days[today];
    if (Object.keys(repair).length) setJson('record', rec);   // keep the stamp, so the cache and the server agree on which copy is newer
    return { items: items, repair: repair, days: days };
  }
  var dirtyTimer = null;
  function markDirty(id) {
    var d = getJson('dirty', []); if (d.indexOf(id) < 0) d.push(id); setJson('dirty', d.slice(-500));
    if (dirtyTimer) clearTimeout(dirtyTimer);
    dirtyTimer = setTimeout(flushDirty, 1500);
  }
  function flushDirty() {
    dirtyTimer = null;
    var d = getJson('dirty', []); if (!d.length) return Promise.resolve(true);
    var body = snapshot(d); body.attempts = [];
    return push(body).then(function () { var left = getJson('dirty', []).filter(function (id) { return d.indexOf(id) < 0; }); setJson('dirty', left); return true; }, function () { return false; });
  }
  function attachSync() {
    var R = window.AceRecord; if (!R || attachSync.done) return; attachSync.done = true;
    R.onChange(function (ev) {
      if (ev && ev.type === 'repair' && ev.entry && ev.entry.id) markDirty(String(ev.entry.id));
      if (ev && ev.type === 'synced' && R.pending() > 0) setTimeout(function () { R.flush(); }, 400);
    });
    R.setSync({ push: function (batch) {
      var ids = {}; batch.forEach(function (a) { ids[a.id] = 1; });
      getJson('dirty', []).forEach(function (id) { ids[id] = 1; });
      var body = snapshot(Object.keys(ids)), chain = Promise.resolve();
      // a long outbox (work done before the first sign-in) goes up in slices; the server
      // drops repeats on (id, at), so a retry after a failed slice is safe
      for (var i = 0; i < Math.max(1, batch.length); i += 400) (function (part, first) {
        chain = chain.then(function () { return push(first ? { attempts: part, items: body.items, repair: body.repair, days: body.days } : { attempts: part }); });
      })(batch.slice(i, i + 400), i === 0);
      return chain.then(function () { setJson('dirty', []); });
    } });
  }

  /* ---- handoff ---- */
  function takeFragmentToken() {
    var m = /(?:^#|&)h=([A-Za-z0-9_\-.]+)/.exec(location.hash || '');
    if (!m) return '';
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { location.hash = ''; }
    return m[1];
  }
  function exchange(token) {
    return fetch(FN + 'ace-session-exchange', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ token: token }) })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (res) {
        if (!res.ok || !res.token) return { ok: false, error: res.error || 'failed' };
        return keep(res);
      }, function () { return { ok: false, error: 'network' }; });
  }
  function keep(res) {
    setJson('session', { token: res.token, exp: res.exp, sub: res.sub, role: res.role, view: res.view || null, src: res.src || 'portal', plan: res.plan || '', until: res.until || 0 });
    var swapped = res.role === 'student' ? claimCache(res.sub) : false;
    emit({ type: 'signed-in', sub: res.sub, role: res.role });
    return { ok: true, swapped: swapped, role: res.role, next: res.next, plan: res.plan };
  }

  /* ---- email accounts and the pass ---- */
  function takeMagicToken() {
    var m = /(?:^#|&)m=([A-Za-z0-9_\-]+)/.exec(location.hash || '');
    if (!m) return '';
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { location.hash = ''; }
    return m[1];
  }
  function post(name, body, query) {
    var s = current(), headers = { 'Content-Type': 'application/json' };
    if (s) headers['X-Ace-Session'] = s.token;
    return fetch(FN + name + (query || ''), { method: 'POST', headers: headers, credentials: 'same-origin', body: JSON.stringify(body || {}) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j.status = r.status; return j; }); }, function () { return { ok: false, error: 'network' }; });
  }
  function requestLink(email, next) { return post('ace-magic-request', { email: email, next: safeNext(next) }); }
  function verifyLink(token) {
    return post('ace-magic-verify', { token: token }).then(function (res) { return res.ok && res.token ? keep(res) : { ok: false, error: res.error || 'failed' }; });
  }
  function account() {
    return call('ace-account').then(function (res) {
      if (res.ok && res.token) keep(res);
      if (res.status === 401) delRaw('session');
      return res;
    }, function () { return { ok: false, error: 'network' }; });
  }
  function checkout() { return post('ace-checkout', {}); }
  function confirm(sessionId) {
    return post('ace-checkout', { session_id: sessionId }, '?confirm=1').then(function (res) { if (res.ok && res.token) keep(res); return res; });
  }
  var FULL = ['pass', 'comp', 'coaching', 'coach', 'crash'];
  /* Does this session open everything right now? A portal sign-in always does. */
  function full(s) {
    s = s || current(); if (!s) return false;
    if (s.src !== 'email') return true;
    return FULL.indexOf(s.plan) >= 0 && (!s.until || s.until * 1000 > Date.now());
  }
  function signOut() {
    var s = current(), owner = getRaw('owner') || '';
    var done = function () {
      delRaw('session');
      if (owner) { park(owner); delRaw('owner'); }
      emit({ type: 'signed-out' });
    };
    var flush = s && isStudent(s) ? flushDirty() : Promise.resolve();
    return flush.then(function () { return call('ace-session', { method: 'DELETE' }); }).then(done, done);
  }
  function status() { return call('ace-session'); }
  function safeNext(n) {
    n = String(n || '/');
    if (n.charAt(0) !== '/' || n.charAt(1) === '/' || n.indexOf('\\') >= 0 || /^\/sign-in(\/|$|\?)/.test(n)) return '/';
    return n;
  }
  function portalSignInUrl(portal, next) {
    return (portal || 'https://acethedat-portal.netlify.app') + '/labs/go?next=' + encodeURIComponent(safeNext(next)) + (location.origin !== 'https://acelabs.netlify.app' ? '&from=' + encodeURIComponent(location.origin) : '');
  }

  /* ---- a quiet account line at the foot of the page ---- */
  function footer(s) {
    if (framed() || document.getElementById('ace-account') || /^\/(sign-in|account|pass)(\/|$)/.test(location.pathname)) return;
    var bar = document.createElement('div'); bar.id = 'ace-account';
    bar.style.cssText = 'font:500 16px/1.5 "DM Sans",system-ui,sans-serif;color:#5b6b61;text-align:center;padding:14px 12px 22px';
    var a = document.createElement('a'); a.style.cssText = 'color:#1f4d3a;text-decoration:underline;display:inline-block;min-height:44px;line-height:44px;padding:0 6px';
    if (s && s.src === 'email') { bar.appendChild(document.createTextNode('Signed in. ')); a.href = '/account/'; a.textContent = 'Your account'; }
    else if (s) { bar.appendChild(document.createTextNode('Signed in with your portal account. ')); a.href = '/sign-in/?out=1'; a.textContent = 'Sign out'; }
    else { a.href = '/sign-in/?next=' + encodeURIComponent(location.pathname + location.search); a.textContent = 'Sign in'; }
    bar.appendChild(a);
    (document.body || document.documentElement).appendChild(bar);
  }

  /* ---- on a sample page, say so once, at the top ---- */
  var SAMPLE_PAGES = /^\/(gc|bio|oc|qr\/drill)(\/|\/index\.html)?$/;
  function sampleBanner(s) {
    if (!s || s.src !== 'email' || full(s) || !SAMPLE_PAGES.test(location.pathname) || document.getElementById('ace-sample')) return;
    var bar = document.createElement('div'); bar.id = 'ace-sample'; bar.setAttribute('role', 'note');
    bar.style.cssText = 'background:#1f4d3a;color:#fff;font:500 16px/1.45 "DM Sans",system-ui,sans-serif;padding:10px 16px;text-align:center';
    bar.appendChild(document.createTextNode('Free account: a sample of 10 questions in this section. '));
    var a = document.createElement('a'); a.href = '/pass/?next=' + encodeURIComponent(location.pathname + location.search); a.textContent = 'See the pass';
    a.style.cssText = 'color:#F2DFA0;font-weight:700;text-decoration:underline;display:inline-block;min-height:44px;line-height:44px;padding:0 6px';
    bar.appendChild(a);
    var b = document.body || document.documentElement; b.insertBefore(bar, b.firstChild);
  }

  var api = window.AceSession = {
    version: 1, current: current, status: status, exchange: exchange, signOut: signOut, pull: pull, flush: flushDirty,
    takeFragmentToken: takeFragmentToken, safeNext: safeNext, portalSignInUrl: portalSignInUrl, framed: framed,
    takeMagicToken: takeMagicToken, requestLink: requestLink, verifyLink: verifyLink, account: account, checkout: checkout, confirm: confirm, full: full,
    onChange: function (fn) { listeners.push(fn); },
    _merge: mergeInto, _claim: claimCache
  };

  function boot() {
    if (/^\/(sign-in|account|pass)(\/|$)/.test(location.pathname)) return;   // these pages drive the steps themselves
    var token = takeFragmentToken();
    var start = token ? exchange(token) : Promise.resolve({ ok: !!current(), swapped: false });
    start.then(function (r) {
      if (r.swapped) { location.reload(); return; }
      var s = current();
      // a cache that belongs to someone other than the signed-in student is never shown
      if (isStudent(s) && claimCache(s.sub)) { location.reload(); return; }
      if (isStudent(s)) { attachSync(); pull().then(function () { flushDirty(); }); }
      footer(s);
      sampleBanner(s);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  api._boot = boot;
})();
