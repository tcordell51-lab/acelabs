/* ace-shell.js : the Ace Labs bar for pages that have not moved to ace-ui.css yet.

   Same bar as shared/ace-ui.js: cream, AD mark, DM Sans, the same five places
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
  var VERSION = '4';
  var CREAM = '5';   /* the ?v= pages use for /shared/ace-cream.css (tests/shell/ace-tokens.test.js) */
  /* Keep in step with PLACES in shared/ace-ui.js. */
  var DOORS = [
    { id: 'today', label: 'Today', href: '/' },
    { id: 'labs', label: 'Labs', href: '/labs/' },
    { id: 'test', label: 'Test', href: '/tests/' },
    { id: 'repair', label: 'Repair', href: '/repair/' },
    { id: 'progress', label: 'Progress', href: '/progress/' }
  ];

  /* First match wins. Paths are normalized: no trailing slash, no .html, no /index. */
  var RULES = [
    ['today', /^\/(index|ace-labs|plan|onboarding|for-retakers)?$/],
    ['test', /^\/(tests|diagnostic|review|prometric-mock|unified-mock|test-week|test-day-readiness|tools\/(mock|minitests)|tools\/pat\/test)(\/|$)/],
    ['repair', /^\/repair(\/|$)/],
    ['progress', /^\/(progress|performance)(\/|$)/],
    ['labs', /^\/(labs|see|learn|bio|gc|oc|qr|rc|pat|games|guides|cheat-sheets|tricks|tools)(\/|$)/]
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
      'html.ace-shell-on header.ace-legacy-nav{display:none!important}' +
      /* self-hosted, the same file ace-ui.css uses: no page loads a font from the network */
      '@font-face{font-family:"DM Sans";src:url("/shared/fonts/dm-sans.woff2") format("woff2");font-weight:100 1000;font-style:normal;font-display:swap}';
    (document.head || root).appendChild(s);
    skin();
  }

  /* The older PAT trainers carry no skin link of their own. Give them the one system
     (shared/ace-cream.css imports the ace-ui.css tokens) and the PAT family name. */
  var SKIN = [[/^\/tools\/pat\//, 'pat']];
  function skin() {
    if (document.querySelector('link[href*="/shared/ace-cream.css"]')) return;
    for (var i = 0; i < SKIN.length; i++) {
      if (!SKIN[i][0].test(location.pathname)) continue;
      var have = root.getAttribute('data-cream');
      root.setAttribute('data-cream', have ? have + ' ' + SKIN[i][1] : SKIN[i][1]);
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/shared/ace-cream.css?v=' + CREAM;
      (document.head || root).appendChild(l);
      return;
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
     scrolls away, then let it sit at the top as designed. The same for a small
     fixed control pinned in the top corner (a tool's own Menu button): under the
     shell it could not be seen or pressed until the page was scrolled. */
  var held = [];
  function findFixedBars(host) {
    for (var k = 0; k < held.length; k++) held[k].el.style.top = '';
    held = [];
    var vw = window.innerWidth;
    var cands = document.querySelectorAll('body > *, body > * > *, body > * > * > *');
    for (var i = 0; i < cands.length && i < 1500; i++) {
      var el = cands[i];
      var cs = getComputedStyle(el);
      if (cs.position !== 'fixed') continue;
      var r = el.getBoundingClientRect();
      var w = r.width || parseFloat(cs.width) || 0, ht = r.height || parseFloat(cs.height) || 0;   /* a hidden control still has its CSS size */
      var top = parseFloat(cs.top);
      if (isNaN(top) || top < -2 || top > 24) continue;
      var wide = w >= vw * 0.5 && ht >= 24 && ht <= 180 && top <= 2;
      var corner = w >= 24 && w < vw * 0.5 && ht >= 24 && ht <= 72 && /^(BUTTON|A)$/.test(el.tagName);
      if (!wide && !corner) continue;
      held.push({ el: el, top: top });
    }
    hold(host);
  }
  function hold(host) {
    if (!held.length) return;
    var h = host.hidden ? 0 : host.offsetHeight;
    var off = Math.max(0, h - (window.scrollY || window.pageYOffset || 0));
    for (var i = 0; i < held.length; i++) held[i].el.style.top = (held[i].top + off) + 'px';
  }


  /* The phone tab bar: the same five places. Loaded here so every page with a bar has it. */
  function tabs() {
    if (window.AceTabs || document.querySelector('script[src*="/shared/ace-tabs.js"]')) return;
    var t = document.createElement('script'); t.src = '/shared/ace-tabs.js?v=5'; t.defer = true; document.head.appendChild(t);
  }

  function mount() {
    if (api.mounted || !document.body) return;
    docStyle(); tabs();
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
