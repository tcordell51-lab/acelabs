/* ace-shell.js : the ONE Ace Labs navigation, on every student page (shell v2).

   Add it with one tag (anywhere; defer is fine):
     <script src="/shared/ace-shell.js?v=5" defer></script>

   Five doors: Today, Learn, Practice, Tests, Review. The Canon is no longer a
   door; it lives inside Learn as Sheets (/learn/#sheets).
   - Renders in a shadow root (styles from /shared/ace-shell.css), so no tool
     page's CSS can break it and it cannot break a tool page.
   - Desktop (760 px and up): a 60 px top bar, the ACE DAT lockup on the left,
     the doors on the right. The four stage doors (Learn to Review) sit in a
     thin gold ring; a mint bead under the current door travels from the last
     door (420 ms; a cut under reduced motion).
   - Phone (under 760 px): five equal doors, a 20 to 22 px icon over a 12 px
     label. The bar stays an in-flow top bar unless the page opts in to the
     bottom tab bar with <html data-ace-shell-pos="bottom"> (fixed, 64 px plus
     the safe area, in thumb reach). A page with its own fixed bottom UI keeps
     the top bar (data-ace-shell-pos="top", the default during migration).
   - The current door is marked three ways: aria-current="page", a mint label
     at weight 800, and the bead (desktop) or a 28 x 3 px mint tick (phone).
   - The Review dot: an 8 px gold dot when cards are due, never a number. It
     reads acelabs.v1.dueToday (written by shared/ace-progress.js whenever it
     lists misses); the spoken label adds ", 3 cards back today".
   - The bar sits in normal flow above <body> and scrolls away with the page.
     A tool's own position:fixed top bar is held just under the shell until
     the shell scrolls off, so nothing is ever covered.
   - With the phone tab bar down, a tool's own fixed bottom UI (a coach
     button, an action bar) is lifted above it once, and put back when the
     bar moves to the top or hides; UI the page shows later is caught by a
     short watch while the bar is down. New work reads --ace-shell-bottom on
     <html> (the bar's height while it shows at the bottom, unset otherwise):
     bottom:calc(16px + var(--ace-shell-bottom,0px)); UI whose own bottom
     already clears the bar, UI that carries data-ace-no-lift, and a
     decorative layer (aria-hidden and pointer-events:none, such as the kit's
     flying Ace Card) are left alone.
   - Replaces the old navs: hides a legacy <header class="al-top"> that only
     carried the old .al-nav links, and the old floating "Ace Labs" chip.
   - Hidden: inside an iframe (engine modals, the portal embed), on ?embed=...
     pages, while a timed section is running (acelabs.timed), when the page sets
     <html data-ace-shell="off">, and in print.
   - Keeps ?student=<id> on every door so a coach link stays personal.

   window.AceShell: { version, doors, door (the current door id, a string),
     current, doorFor(path), doorEl(id) (the element a card flies to),
     position(), due(), setDue(n), refreshDue(), relift() }.
   VERSION is the shell generation and the ?v= of its stylesheet: every change
   to ace-shell.css moves it (tests/shell/ace-shell.test.js pins the CSS to its
   VERSION, since no page names that URL). The script's own ?v= on the pages
   moves with every change to this file.
   Plain ES5, no network beyond its own stylesheet and the two shell fonts. */
(function () {
  'use strict';
  if (window.AceShell) return;
  var VERSION = '3';
  var DUE_KEY = 'acelabs.v1.dueToday';
  var LAST_KEY = 'al.lastDoor';
  var DOORS = [
    { id: 'today', label: 'Today', href: '/', icon: 'today' },
    { id: 'learn', label: 'Learn', href: '/learn/', icon: 'learn' },
    { id: 'practice', label: 'Practice', href: '/practice/', icon: 'play' },
    { id: 'tests', label: 'Tests', href: '/tests/', icon: 'prove' },
    { id: 'review', label: 'Review', href: '/review/', icon: 'keep' }
  ];
  /* 24 grid, 1.8 stroke, round caps (the set in shared/al-kit.js). Today is a
     sunrise over a horizon line, never a clock. */
  var ICONS = {
    today: '<path d="M3 17.5h18"/><path d="M6.6 17.5a5.4 5.4 0 0 1 10.8 0"/><path d="M12 5.2v2.6M5.4 8.6l1.8 1.8M18.6 8.6l-1.8 1.8M8.5 20.6h7"/>',
    learn: '<path d="M4 5.2c2.8-1 5.4-1 8 .8 2.6-1.8 5.2-1.8 8-.8V19c-2.8-1-5.4-1-8 .8-2.6-1.8-5.2-1.8-8-.8z"/><path d="M12 6v13.8"/>',
    play: '<path d="M3 12h5.5M15.5 12H21"/><circle cx="12" cy="12" r="3.6"/><path d="M6 8.6 4.2 12 6 15.4M18 8.6l1.8 3.4L18 15.4"/>',
    prove: '<rect x="4.6" y="3.6" width="14.8" height="16.8" rx="2.4"/><path d="M8.3 12.3l2.6 2.6 5-5.4"/>',
    keep: '<rect x="3.8" y="7" width="12.4" height="13.4" rx="2.2"/><path d="M8 4h10a2.2 2.2 0 0 1 2.2 2.2V16"/><path d="M7.5 12.2h5M7.5 15.4h3.4"/>'
  };
  /* First match wins. Paths are normalized: no trailing slash, no .html, no /index.
     Section pages (/bio/ ... /qr/) light Practice; Your results light Tests;
     Settings and the first run light Today; Sheets live inside Learn. */
  var RULES = [
    ['review', /^\/review(\/|$)/],
    ['tests', /^\/(tests|performance|diagnostic|prometric-mock|unified-mock|mocks-catalog|calendar|test-week|test-day-readiness)(\/|$)/],
    ['tests', /^\/tools\/(minitests|mock|ochem\/summit|pat\/test|bio\/bio-mock|bio\/bio-diagnostic|qr\/proposals\/agent-08-pacing\/friday-mini-mock)(\/|$)/],
    ['learn', /^\/(learn|retold|tricks|cheat-sheets|sheets)(\/|$)/],
    ['learn', /^\/tools\/(organic|gchem|bio-retold|qr-retold|pat-retold|rc-retold|ochem\/roots|bio\/bio-ap-bootcamp)(\/|$)/],
    ['practice', /^\/(practice|tools|games|guides|bio|gchem|ochem|pat|rc|qr)(\/|$)/],
    ['today', /^\/(ace-labs|ace-labs-classic|onboarding|for-retakers|settings)?$/]
  ];

  var api = window.AceShell = { version: VERSION, doors: DOORS, door: null, current: null, mounted: false };

  function framed() { try { return window.top !== window.self; } catch (e) { return true; } }
  function qs() { try { return new URLSearchParams(location.search); } catch (e) { return null; } }
  function norm(p) {
    p = String(p || '/').replace(/\/index(\.html)?$/, '/').replace(/\.html$/, '');
    if (p.length > 1) p = p.replace(/\/+$/, '');
    return p || '/';
  }
  function doorFor(path) {
    var p = norm(path);
    for (var i = 0; i < RULES.length; i++) if (RULES[i][1].test(p)) return RULES[i][0];
    return null;
  }
  api.doorFor = doorFor;

  function timedActive() {
    try {
      if (window.AceTimed && typeof window.AceTimed.active === 'function') return !!window.AceTimed.active();
      var v = JSON.parse(localStorage.getItem('acelabs.timed') || 'null');
      return !!(v && typeof v.until === 'number' && v.until > Date.now());
    } catch (e) { return false; }
  }
  /* Cards due now: the count ace-progress wrote, plus any later due time that
     has passed since (a card made yesterday is back today without a page
     having listed misses yet), plus a miss with no date of its own on its next
     day only (once: that day's start; it rests after one day). */
  function readDue() {
    try {
      var v = JSON.parse(localStorage.getItem(DUE_KEY) || 'null');
      if (!v || typeof v !== 'object') return 0;
      var n = Math.max(0, +v.n || 0), now = Date.now();
      (v.later || []).forEach(function (t) { if (typeof t === 'number' && t <= now) n++; });
      (v.once || []).forEach(function (t) { if (typeof t === 'number' && t <= now && now < t + 864e5) n++; });
      return n;
    } catch (e) { return 0; }
  }
  function reduced() { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } }
  function phone() { try { return !!(window.matchMedia && window.matchMedia('(max-width: 759px)').matches); } catch (e) { return false; } }
  function session(k, v) {
    try {
      if (v === undefined) return window.sessionStorage.getItem(k);
      window.sessionStorage.setItem(k, v);
    } catch (e) { /* storage blocked */ }
    return null;
  }

  var params = qs();
  if (framed()) return;
  if (params && params.has('embed')) return;
  var root = document.documentElement;
  if (root.getAttribute('data-ace-shell') === 'off') return;

  var student = params ? (params.get('student') || '').trim() : '';
  function withStudent(href) {
    if (!student || /^https?:/.test(href)) return href;
    var i = href.indexOf('#'), hash = i >= 0 ? href.slice(i) : '', base = i >= 0 ? href.slice(0, i) : href;
    return base + (base.indexOf('?') < 0 ? '?' : '&') + 'student=' + encodeURIComponent(student) + hash;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function icon(name) { return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || '') + '</svg>'; }

  /* The page's own choice: bottom tab bar on phones only when it opts in. */
  function wantsBottom() { return root.getAttribute('data-ace-shell-pos') === 'bottom'; }
  function position() { return wantsBottom() && phone() ? 'bottom' : 'top'; }
  api.position = position;

  /* Document-level pieces: the shell's two fonts (fonts cannot be declared in a
     shadow root; private family names, so a page's own "DM Sans" or "Sora" is
     never touched, and the same versioned files as shared/al-fonts.css, so a
     page that also loads those downloads each file once), a reserved band so the
     page never jumps when the shadow CSS arrives, the phone tab bar's room at the
     bottom of the page, print, and legacy-nav hiding. */
  var RANGE = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
  function docStyle() {
    if (document.getElementById('ace-shell-doc')) return;
    var s = document.createElement('style');
    s.id = 'ace-shell-doc';
    s.textContent =
      '@font-face{font-family:"Ace Shell Sans";src:url("/shared/fonts/dmsans-v1.woff2") format("woff2");font-weight:100 1000;font-style:normal;font-display:swap;unicode-range:' + RANGE + '}' +
      '@font-face{font-family:"Ace Shell Sora";src:url("/shared/fonts/sora-v1.woff2") format("woff2");font-weight:500 800;font-style:normal;font-display:swap;unicode-range:' + RANGE + '}' +
      '#ace-shell{display:block;min-height:60px;background:#07110b}' +
      '#ace-shell[hidden]{display:none!important}' +
      '@media (max-width:759px){' +
        '#ace-shell{min-height:56px}' +
        'html[data-ace-shell-pos="bottom"] #ace-shell{position:fixed;left:0;right:0;bottom:0;z-index:160;min-height:calc(64px + env(safe-area-inset-bottom,0px))}' +
        'html.ace-shell-on.ace-shell-shown[data-ace-shell-pos="bottom"] body{padding-bottom:calc(64px + env(safe-area-inset-bottom,0px))}' +
        'html.ace-shell-on.ace-shell-shown[data-ace-shell-pos="bottom"]{--ace-shell-bottom:calc(64px + env(safe-area-inset-bottom,0px))}' +
      '}' +
      '@media print{#ace-shell{display:none!important}html.ace-shell-on body{padding-bottom:0!important}}' +
      'html.ace-shell-on #al-home{display:none!important}' +
      'html.ace-shell-on header.ace-legacy-nav{display:none!important}';
    (document.head || root).appendChild(s);
  }

  var host = null, sr = null;
  function q(sel) { return sr ? sr.querySelector(sel) : (host ? host.querySelector(sel) : null); }

  function build() {
    var current = doorFor(location.pathname);
    api.door = api.current = current;
    host = document.createElement('div');
    host.id = 'ace-shell';
    host.setAttribute('role', 'banner');
    host.setAttribute('data-pos', position());
    sr = host.attachShadow ? host.attachShadow({ mode: 'open' }) : null;
    var links = DOORS.map(function (d) {
      var cur = d.id === current ? ' aria-current="page"' : '';
      var review = d.id === 'review';
      return '<li><a class="door" data-id="' + d.id + '" data-door="' + d.id + '" href="' + esc(withStudent(d.href)) + '"' + cur + '>' +
        '<span class="di">' + icon(d.icon) + (review ? '<i class="due" hidden aria-hidden="true"></i>' : '') + '</span>' +
        /* the spoken count sits inside the label, so the name reads "Review, 3 cards back today" */
        '<span class="dl">' + d.label + (review ? '<span class="sr" data-due-sr></span>' : '') + '</span></a></li>';
    }).join('');
    var html =
      '<link rel="stylesheet" href="/shared/ace-shell.css?v=' + VERSION + '">' +
      '<div class="bar"><div class="in">' +
      '<a class="brand" href="' + esc(withStudent('/')) + '" aria-label="ACE DAT Labs, Today">' +
        '<img class="lockup" src="/shared/brand/ace-dat-lockup-reversed-v1.svg" alt="" width="113" height="24" decoding="async">' +
        '<span class="labs">Labs</span></a>' +
      '<nav aria-label="Ace Labs"><div class="track"><ul class="doors">' + links + '</ul>' +
        '<span class="ring" aria-hidden="true"></span><span class="bead" aria-hidden="true"></span></div></nav>' +
      '</div></div>';
    if (sr) sr.innerHTML = html; else host.innerHTML = html;
    return host;
  }

  /* ---------- the Review dot ---------- */
  var dueN = 0;
  function setDue(n) {
    dueN = Math.max(0, Math.floor(+n || 0));
    var dot = q('.door[data-id="review"] .due'), say = q('[data-due-sr]'), link = q('.door[data-id="review"]');
    var words = dueN ? ', ' + dueN + (dueN === 1 ? ' card' : ' cards') + ' back today' : '';
    if (dot) dot.hidden = !dueN;
    if (say) say.textContent = words;
    /* the spoken name, exactly "Review, 3 cards back today" (an absolutely placed span would add a space) */
    if (link) { if (dueN) link.setAttribute('aria-label', 'Review' + words); else link.removeAttribute('aria-label'); }
    if (host) host.setAttribute('data-due', String(dueN));
    return dueN;
  }
  function refreshDue() { return setDue(readDue()); }
  api.setDue = setDue;
  api.refreshDue = refreshDue;
  api.due = function () { return dueN; };
  /* The door's icon (the target an Ace Card flies to) or the door link. */
  api.doorEl = function (id) { return q('.door[data-id="' + id + '"] .di') || q('.door[data-id="' + id + '"]'); };

  /* ---------- the ring and the bead (desktop) ---------- */
  function layout(from) {
    var ul = q('.doors'), ring = q('.ring'), bead = q('.bead');
    if (!ul || !ring || !bead) return;
    var ru = ul.getBoundingClientRect();
    if (!ru.width) return;
    var l = q('.door[data-id="learn"]'), r = q('.door[data-id="review"]');
    if (l && r) {
      var a = l.getBoundingClientRect(), b = r.getBoundingClientRect();
      ring.style.left = (a.left - ru.left + 2) + 'px';
      ring.style.width = Math.max(0, b.right - a.left - 4) + 'px';
    }
    function center(id) {
      var d = q('.door[data-id="' + id + '"] .di');
      if (!d) return null;
      var rd = d.getBoundingClientRect();
      return rd.left - ru.left + rd.width / 2;
    }
    var to = api.current ? center(api.current) : null;
    if (to == null) { bead.classList.remove('on'); return; }
    var start = from && from !== api.current && !reduced() ? center(from) : null;
    if (start != null) {
      bead.style.transition = 'none';
      bead.style.left = start + 'px';
      void bead.offsetWidth;
      bead.style.transition = '';
    }
    bead.style.left = to + 'px';
    bead.classList.add('on');
  }

  /* Legacy navs: an old <header class="al-top"> whose job was the old link set. */
  function retireLegacy() {
    var hs = document.querySelectorAll('header.al-top');
    for (var i = 0; i < hs.length; i++) if (hs[i].querySelector('.al-nav')) hs[i].classList.add('ace-legacy-nav');
  }

  /* A tool's own fixed top bar: keep it just under the shell until the shell
     scrolls away, then let it sit at the top as designed. A phone tab bar at
     the bottom covers nothing at the top, so nothing is held then. */
  var held = [];
  function findFixedBars() {
    held = [];
    var vw = window.innerWidth;
    var cands = document.querySelectorAll('body > *, body > * > *, body > * > * > *');
    for (var i = 0; i < cands.length && i < 1500; i++) {
      var el = cands[i];
      var cs = getComputedStyle(el);
      if (cs.position !== 'fixed') continue;
      var r = el.getBoundingClientRect();
      if (r.width < vw * 0.5 || r.height < 24 || r.height > 180) continue;
      if (Math.abs(parseFloat(cs.top) || 0) > 2) continue;
      held.push(el);
    }
    hold();
  }
  function hold() {
    if (!held.length || !host) return;
    var h = host.hidden || position() === 'bottom' ? 0 : host.offsetHeight;
    var off = Math.max(0, h - (window.scrollY || window.pageYOffset || 0));
    for (var i = 0; i < held.length; i++) held[i].style.top = off + 'px';
  }

  /* A tool's own fixed bottom UI under the phone tab bar: lift it by the bar's
     height (its own offset kept) while the bar shows at the bottom, and put it
     back otherwise. A small fixed element (under half the screen tall, so
     never a full-screen overlay) whose own box reaches into the bar. Its own
     box is the untransformed one: the bottom offset the browser resolves for
     it, not getBoundingClientRect, so a toast waiting 16 px low (opacity 0,
     translated) is never mistaken for UI under the bar. Left alone: UI whose
     own bottom already clears the bar (it reads --ace-shell-bottom or the
     kit's --tabbar-h), anything marked data-ace-no-lift, a decorative layer
     (aria-hidden="true" and pointer-events:none: nothing to read or press,
     such as the kit's flying Ace Card, which must land on the Review door),
     anything parked below the screen until it is shown, and anything already
     lifted, so a rescan (rotation, a timed section ending, relift(), the
     watch below) never lifts twice. A visible toast that ignores the pointer
     (role=status, not aria-hidden) is still lifted, so it is never under the
     bar. An element that leaves the page is put back and forgotten. Found at
     load, on a position change and when a timed section ends; while the bar
     is down, a throttled watch on the page (class, style and hidden changes,
     added nodes) catches UI shown later, such as a coach bar that slides in,
     and a bar still sliding in when the watch looks is looked at again once
     its slide ends. */
  var BAR_H = 64;
  var lifted = [];
  function barTop() {
    var t = host && host.getBoundingClientRect ? host.getBoundingClientRect().top : 0;
    return t > 0 ? t : window.innerHeight - BAR_H;
  }
  function liftable() { return !!host && wantsBottom() && position() === 'bottom' && !host.hidden; }
  function scanBottomUI() {
    if (!liftable()) { watch(false); return; }
    forget();
    var vh = window.innerHeight, top = barTop();
    var cands = document.querySelectorAll('body > *, body > * > *, body > * > * > *');
    for (var i = 0; i < cands.length && i < 1500; i++) {
      var el = cands[i];
      if (el.hasAttribute('data-ace-lifted') || el.hasAttribute('data-ace-no-lift')) continue;
      var cs = getComputedStyle(el);
      if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') continue;
      if (cs.pointerEvents === 'none' && el.getAttribute('aria-hidden') === 'true') continue;
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height || r.height > vh * 0.5) continue;
      var off = parseFloat(cs.bottom), lower = isNaN(off) ? r.bottom : vh - off;
      if (lower <= top + 1) continue;
      /* r.top >= vh: parked below the screen until shown (a coach bar that slides
         in); the watch lifts it once it is in view, and when it is sliding in
         right now (the rescan can come first on a busy page) it is looked at
         again once it lands */
      if (r.top >= vh) { afterSlide(el); continue; }
      if (isNaN(off)) off = Math.max(0, vh - r.bottom);
      lifted.push({ el: el, top: el.style.top, bottom: el.style.bottom });
      el.style.top = 'auto';
      el.style.bottom = 'calc(' + off + 'px + 64px + env(safe-area-inset-bottom, 0px))';
      el.setAttribute('data-ace-lifted', '');
    }
    watch(true);
  }
  /* UI parked under the screen whose slide-in is running: one more scan when it
     ends (finite animations only; a cancelled one counts as ended) */
  var sliding = [];
  function afterSlide(el) {
    if (!el.getAnimations || !window.Promise || sliding.indexOf(el) >= 0) return;
    var a = el.getAnimations().filter(function (x) {
      var t = x.effect && x.effect.getComputedTiming ? x.effect.getComputedTiming() : null;
      return !t || t.endTime !== Infinity;
    });
    if (!a.length) return;
    sliding.push(el);
    function again() { sliding.splice(sliding.indexOf(el), 1); scanBottomUI(); }
    Promise.all(a.map(function (x) { return x.finished; })).then(again, again);
  }
  /* a fresh start: put everything back, then lift what sits under the bar now */
  function findBottomUI() {
    drop();
    scanBottomUI();
  }
  function putBack(x) {
    x.el.style.top = x.top;
    x.el.style.bottom = x.bottom;
    x.el.removeAttribute('data-ace-lifted');
  }
  function drop() {
    for (var i = 0; i < lifted.length; i++) putBack(lifted[i]);
    lifted = [];
  }
  /* UI that left the page: put back (so it comes back as it was) and forgotten */
  function forget() {
    lifted = lifted.filter(function (x) {
      if (x.el.isConnected !== false) return true;
      putBack(x);
      return false;
    });
  }
  /* the watch: only while the bar is down (no cost on top-bar pages), at most
     one rescan every 300 ms, and drawings (SVG) that animate are ignored */
  var watcher = null, watchT = null;
  function watch(on) {
    if (!on) {
      if (watcher) { watcher.disconnect(); watcher = null; }
      if (watchT) { clearTimeout(watchT); watchT = null; }
      return;
    }
    if (watcher || !window.MutationObserver || !document.body) return;
    watcher = new MutationObserver(function (recs) {
      if (watchT) return;
      for (var i = 0; i < recs.length; i++) {
        var t = recs[i].target;
        if (!t || t.namespaceURI === 'http://www.w3.org/2000/svg') continue;
        /* the shell's own writes: a held top bar, a lifted element */
        if (recs[i].attributeName === 'style' && (held.indexOf(t) >= 0 || (t.hasAttribute && t.hasAttribute('data-ace-lifted')))) continue;
        watchT = setTimeout(function () { watchT = null; scanBottomUI(); }, 300);
        return;
      }
    });
    watcher.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
  }

  function syncPos() {
    if (!host) return;
    var p = position();
    if (host.getAttribute('data-pos') !== p) { host.setAttribute('data-pos', p); findBottomUI(); }
  }

  function mount() {
    if (api.mounted || !document.body) return;
    docStyle();
    build();
    root.insertBefore(host, document.body);
    root.classList.add('ace-shell-on');
    api.mounted = true;
    api.host = host;
    retireLegacy();
    refreshDue();

    function syncTimed() {
      var t = timedActive();
      if (host.hidden !== t) { host.hidden = t; hold(); if (t) { drop(); watch(false); } else findBottomUI(); }
      root.classList.toggle('ace-shell-shown', !t);
    }
    syncTimed();
    window.addEventListener('storage', function (e) {
      if (!e.key || e.key === 'acelabs.timed') syncTimed();
      if (!e.key || e.key === DUE_KEY) refreshDue();
    });
    window.addEventListener('acelabs:timed', syncTimed);
    window.addEventListener('acelabs:due', function (e) {
      if (e && e.detail && typeof e.detail.n === 'number') setDue(e.detail.n); else refreshDue();
    });
    setInterval(function () { syncTimed(); refreshDue(); }, 4000);

    /* the bead travels from the door the student came from (this tab only) */
    var last = session(LAST_KEY);
    if (api.current) session(LAST_KEY, api.current);
    /* the first placement (once the bar's own CSS is in) carries the travel */
    var placed = false;
    function place() { if (placed) { layout(null); return; } placed = true; layout(last); }
    function soon() { requestAnimationFrame(place); }
    var css = q('link[rel="stylesheet"]');
    if (css && !css.sheet) { css.addEventListener('load', soon); css.addEventListener('error', soon); setTimeout(place, 1500); }
    else soon();
    api.relayout = function () { layout(null); };
    /* UI shown later: lift what is new under the bar (never twice) */
    api.relift = scanBottomUI;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (placed) layout(null); });
    if (window.MutationObserver) {
      new MutationObserver(function () { syncPos(); hold(); requestAnimationFrame(function () { layout(null); }); })
        .observe(root, { attributes: true, attributeFilter: ['data-ace-shell-pos'] });
    }

    var scan = function () { findFixedBars(); findBottomUI(); };
    requestAnimationFrame(function () { requestAnimationFrame(scan); });
    setTimeout(scan, 600);
    window.addEventListener('load', scan);
    window.addEventListener('resize', function () { syncPos(); hold(); layout(null); });
    window.addEventListener('scroll', hold, { passive: true });
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
