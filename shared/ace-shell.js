/* ace-shell.js : the ONE Ace Labs navigation, on every student page.

   Add it with one tag (anywhere; defer is fine):
     <script src="/shared/ace-shell.js" defer></script>

   Six doors: Today, Learn, Practice, Tests, Review, Canon.
   - Renders a dark + gold bar in a shadow root (styles from /shared/ace-shell.css),
     so no tool page's CSS can break it and it cannot break a tool page.
   - The bar sits in normal flow above <body> and scrolls away with the page.
     A tool's own position:fixed top bar is held just under the shell until the
     shell scrolls off, so nothing is ever covered.
   - Replaces the old navs: hides a legacy <header class="al-top"> that only
     carried the old .al-nav links, and the old floating "Ace Labs" chip.
   - Hidden: inside an iframe (engine modals, the portal embed), on ?embed=...
     pages, while a timed section is running (acelabs.timed), when the page sets
     <html data-ace-shell="off">, and in print.
   - Keeps ?student=<id> on every door so a coach link stays personal.

   Phone (<= 720px): one compact row of six doors, no brand, never wraps. */
(function () {
  'use strict';
  if (window.AceShell) return;
  var VERSION = '1';
  var CANON = 'https://acethedat-portal.netlify.app/canon/';
  var DOORS = [
    { id: 'today', label: 'Today', href: '/' },
    { id: 'learn', label: 'Learn', href: '/learn/' },
    { id: 'practice', label: 'Practice', href: '/practice/' },
    { id: 'tests', label: 'Tests', href: '/tests/' },
    { id: 'review', label: 'Review', href: '/review/' },
    { id: 'canon', label: 'Canon', href: CANON, external: true }
  ];
  /* First match wins. Paths are normalized: no trailing slash, no .html, no /index. */
  var RULES = [
    ['review', /^\/(review|performance)(\/|$)/],
    ['tests', /^\/(tests|diagnostic|prometric-mock|unified-mock|mocks-catalog|calendar|test-week|test-day-readiness)(\/|$)/],
    ['tests', /^\/tools\/(minitests|ochem\/summit|pat\/test|bio\/bio-mock|bio\/bio-diagnostic|qr\/proposals\/agent-08-pacing\/friday-mini-mock)(\/|$)/],
    ['learn', /^\/(learn|retold|tricks|cheat-sheets)(\/|$)/],
    ['learn', /^\/tools\/(organic|gchem|bio-retold|qr-retold|pat-retold|rc-retold|ochem\/roots|bio\/bio-ap-bootcamp)(\/|$)/],
    ['practice', /^\/(practice|tools|games|guides)(\/|$)/],
    ['today', /^\/(ace-labs|onboarding|for-retakers)?$/]
  ];

  var api = window.AceShell = { version: VERSION, doors: DOORS, door: null, mounted: false };

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

  var params = qs();
  if (framed()) return;
  if (params && params.has('embed')) return;
  var root = document.documentElement;
  if (root.getAttribute('data-ace-shell') === 'off') return;

  var student = params ? (params.get('student') || '').trim() : '';
  function withStudent(href) {
    if (!student || /^https?:/.test(href)) return href;
    return href + (href.indexOf('?') < 0 ? '?' : '&') + 'student=' + encodeURIComponent(student);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* Document-level pieces: the font (fonts cannot be declared in a shadow root),
     a reserved band so the page never jumps when the shadow CSS arrives, print
     and legacy-nav hiding. */
  function docStyle() {
    if (document.getElementById('ace-shell-doc')) return;
    var s = document.createElement('style');
    s.id = 'ace-shell-doc';
    s.textContent =
      '@font-face{font-family:"Hanken Grotesk";src:url("/shared/fonts/hanken-wght-normal.woff2") format("woff2");font-weight:100 900;font-style:normal;font-display:swap}' +
      '#ace-shell{display:block;min-height:52px;background:#050c07}' +
      '#ace-shell[hidden]{display:none!important}' +
      '@media (max-width:720px){#ace-shell{min-height:46px}}' +
      '@media print{#ace-shell{display:none!important}}' +
      'html.ace-shell-on #al-home{display:none!important}' +
      'html.ace-shell-on header.ace-legacy-nav{display:none!important}';
    (document.head || root).appendChild(s);
  }

  function build() {
    var current = doorFor(location.pathname);
    api.door = current;
    var host = document.createElement('div');
    host.id = 'ace-shell';
    host.setAttribute('role', 'banner');
    var sr = host.attachShadow ? host.attachShadow({ mode: 'open' }) : null;
    var links = DOORS.map(function (d) {
      var cur = d.id === current ? ' aria-current="page"' : '';
      var ext = d.external ? ' target="_blank" rel="noopener"' : '';
      return '<li><a class="door" data-door="' + d.id + '" href="' + esc(withStudent(d.href)) + '"' + cur + ext + '>' + d.label + '</a></li>';
    }).join('');
    var html =
      '<link rel="stylesheet" href="/shared/ace-shell.css?v=' + VERSION + '">' +
      '<div class="bar"><div class="inner">' +
      '<a class="brand" href="' + esc(withStudent('/')) + '" aria-label="Ace Labs, Today"><span><b>Ace</b> Labs</span><small>AceTheDAT</small></a>' +
      '<nav aria-label="Ace Labs"><ul class="doors">' + links + '</ul></nav>' +
      '</div></div>';
    if (sr) sr.innerHTML = html; else host.innerHTML = html;
    return host;
  }

  /* Legacy navs: an old <header class="al-top"> whose job was the old link set. */
  function retireLegacy() {
    var hs = document.querySelectorAll('header.al-top');
    for (var i = 0; i < hs.length; i++) if (hs[i].querySelector('.al-nav')) hs[i].classList.add('ace-legacy-nav');
  }

  /* A tool's own fixed top bar: keep it just under the shell until the shell
     scrolls away, then let it sit at the top as designed. */
  var held = [];
  function findFixedBars(host) {
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
    hold(host);
  }
  function hold(host) {
    if (!held.length) return;
    var h = host.hidden ? 0 : host.offsetHeight;
    var off = Math.max(0, h - (window.scrollY || window.pageYOffset || 0));
    for (var i = 0; i < held.length; i++) held[i].style.top = off + 'px';
  }

  function mount() {
    if (api.mounted || !document.body) return;
    docStyle();
    var host = build();
    root.insertBefore(host, document.body);
    root.classList.add('ace-shell-on');
    api.mounted = true;
    api.host = host;
    retireLegacy();

    function syncTimed() {
      var t = timedActive();
      if (host.hidden !== t) { host.hidden = t; hold(host); }
    }
    syncTimed();
    window.addEventListener('storage', function (e) { if (!e.key || e.key === 'acelabs.timed') syncTimed(); });
    window.addEventListener('acelabs:timed', syncTimed);
    setInterval(syncTimed, 4000);

    var scan = function () { findFixedBars(host); };
    requestAnimationFrame(function () { requestAnimationFrame(scan); });
    setTimeout(scan, 600);
    window.addEventListener('load', scan);
    window.addEventListener('resize', function () { hold(host); });
    window.addEventListener('scroll', function () { hold(host); }, { passive: true });
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
