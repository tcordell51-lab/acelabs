/* ace-shell.js : the Ace Labs bar for pages that have not moved to ace-ui.css yet.

   Same bar as shared/ace-ui.js: cream, AD mark, DM Sans, the same nine places
   (tests/shell/ace-bar.test.js fails if the two lists differ). The AD mark and
   "Ace Labs" always link to the hub. On a phone the places open from Menu.
   - Renders in a shadow root (styles from /shared/ace-shell.css), so no tool
     page's CSS can break it and it cannot break a tool page.
   - Sits in normal flow above <body> and scrolls away with the page. A tool's
     own position:fixed top bar is held just under it until it scrolls off.
   - Hides a legacy <header class="al-top"> that only carried the old links.
   - Hidden: inside an iframe, on ?embed pages, while a timed section is running
     (acelabs.timed), when the page sets <html data-ace-shell="off">, in print.
   - Keeps ?student=<id> on every link so a coach link stays personal. */
(function () {
  'use strict';
  if (window.AceShell) return;
  var VERSION = '2';
  /* Keep in step with PLACES in shared/ace-ui.js. */
  var DOORS = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'bio', label: 'Biology', href: '/bio/' },
    { id: 'gchem', label: 'Gen Chem', href: '/gc/' },
    { id: 'ochem', label: 'OChem', href: '/tools/ochem/' },
    { id: 'pat', label: 'PAT', href: '/tools/pat/' },
    { id: 'rc', label: 'Reading', href: '/tools/rc/' },
    { id: 'qr', label: 'QR', href: '/qr/drill/' },
    { id: 'tests', label: 'Tests', href: '/tests/' },
    { id: 'review', label: 'Review', href: '/review/' }
  ];
  /* First match wins. Paths are normalized: no trailing slash, no .html, no /index. */
  var RULES = [
    ['home', /^\/(index|ace-labs)?$/],
    ['bio', /^\/(bio|tools\/(bio|bio-retold))(\/|$)/],
    ['gchem', /^\/(gc|tools\/(gc|gchem))(\/|$)/],
    ['ochem', /^\/(oc|tools\/(ochem|organic)|games\/chirality)(\/|$)/],
    ['pat', /^\/(pat|tools\/(pat|pat-retold)|games\/six-views|guides)(\/|$)/],
    ['rc', /^\/(rc|tools\/(rc|rc-retold))(\/|$)/],
    ['qr', /^\/(qr|tools\/(qr|qr-retold))(\/|$)/],
    ['tests', /^\/(tests|diagnostic|prometric-mock|test-week|test-day-readiness|tools\/(mock|minitests))(\/|$)/],
    ['review', /^\/(review|performance)(\/|$)/]
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
      '#ace-shell{display:block;min-height:57px;background:#F5F0E8}' +
      '#ace-shell[hidden]{display:none!important}' +
      '@media print{#ace-shell{display:none!important}}' +
      'html.ace-shell-on #al-home{display:none!important}' +
      'html.ace-shell-on header.ace-legacy-nav{display:none!important}';
    (document.head || root).appendChild(s);
    if (!document.getElementById('aui-font')) {
      var l = document.createElement('link'); l.id = 'aui-font'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap';
      (document.head || root).appendChild(l);
    }
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
      return '<li><a class="door" data-door="' + d.id + '" href="' + esc(withStudent(d.href)) + '"' + cur + '>' + d.label + '</a></li>';
    }).join('');
    var html =
      '<link rel="stylesheet" href="/shared/ace-shell.css?v=' + VERSION + '">' +
      '<div class="bar" data-open="false"><div class="inner">' +
      '<a class="brand" href="' + esc(withStudent('/')) + '" aria-label="Ace Labs home"><img src="/shared/ace-dat-mark.svg" alt="" width="30" height="30"><span>Ace Labs</span></a>' +
      '<nav class="wide" aria-label="Ace Labs"><ul class="doors">' + links + '</ul></nav>' +
      '<button class="menu" type="button" aria-expanded="false">Menu</button>' +
      '</div><nav class="sheet" aria-label="Ace Labs menu"><ul class="doors">' + links + '</ul></nav></div>';
    if (sr) sr.innerHTML = html; else host.innerHTML = html;
    var scope = sr || host, bar = scope.querySelector('.bar'), btn = scope.querySelector('.menu');
    btn.addEventListener('click', function () {
      var open = bar.getAttribute('data-open') !== 'true';
      bar.setAttribute('data-open', open ? 'true' : 'false'); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); btn.textContent = open ? 'Close' : 'Menu';
      hold(host);
    });
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
