/* ace-tabs.js : the phone tab bar from the "best version" screens (2026-11-16):
   Today, Labs, Test, Repair, Progress: the same five places as the top bar on a wide screen
   (shared/ace-ui.js, shared/ace-shell.js), which load this file themselves. Shown under 760 px.
   Hidden while a timed section runs (acelabs.timed), like the top bar. Load with:
     <script src="/shared/ace-tabs.js?v=4" defer></script>
   Skipped inside frames, with ?embed, or when <html data-ace-tabs="off">. */
(function () {
  'use strict';
  if (window.AceTabs) return;
  var TABS = [
    { id: 'today', label: 'Today', href: '/', match: /^\/(index(\.html)?|ace-labs(\.html)?|plan|onboarding|for-retakers)?$/, icon: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>' },
    { id: 'labs', label: 'Labs', href: '/labs/', match: /^\/(labs|see|learn|bio|gc|oc|qr|rc|pat|games|guides|cheat-sheets|tricks|tools)(\/|$)/, icon: '<path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M8 7h7"/>' },
    { id: 'test', label: 'Test', href: '/tests/', match: /^\/(tests|diagnostic|review|prometric-mock|unified-mock|test-week|test-day-readiness|tools\/(mock|minitests)|tools\/pat\/test)(\/|$)/, icon: '<path d="M9 3h6v3H9z"/><path d="M7 4.5H5v16h14v-16h-2"/><path d="M9 13l2 2 4-4"/>' },
    { id: 'repair', label: 'Repair', href: '/repair/', match: /^\/repair(\/|$)/, icon: '<path d="M20 11a8 8 0 0 0-14.9-4"/><path d="M4 3v4h4"/><path d="M4 13a8 8 0 0 0 14.9 4"/><path d="M20 21v-4h-4"/>' },
    { id: 'progress', label: 'Progress', href: '/progress/', match: /^\/(progress|performance)(\/|$)/, icon: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>' }
  ];
  /* Test is matched before Labs (a test page under /tools/ is a test). */
  var MATCH_ORDER = ['today', 'test', 'repair', 'progress', 'labs'];
  function current(path) { for (var i = 0; i < MATCH_ORDER.length; i++) { var t = TABS.filter(function (x) { return x.id === MATCH_ORDER[i]; })[0]; if (t.match.test(path)) return t.id; } return null; }

  window.AceTabs = { tabs: TABS, current: current };
  function timed() { try { var v = JSON.parse(localStorage.getItem('acelabs.timed') || 'null'); return !!(v && typeof v.until === 'number' && v.until > Date.now()); } catch (e) { return false; } }
  function framed() { try { return window.top !== window.self; } catch (e) { return true; } }
  function mount() {
    if (framed() || /[?&]embed\b/.test(location.search) || document.documentElement.getAttribute('data-ace-tabs') === 'off' || document.getElementById('ace-tabs')) return;
    var css = document.createElement('style');
    css.textContent =
      '.ace-tabs{display:none}.ace-tabs[hidden]{display:none!important}' +
      '@media (max-width:759px){' +
      '.ace-tabs{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));position:fixed;left:0;right:0;bottom:0;z-index:60;background:#fffdf7;border-top:1px solid #e6dccb;padding:6px 4px calc(10px + env(safe-area-inset-bottom));font-family:"DM Sans",system-ui,sans-serif}' +
      '.ace-tabs a{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-height:52px;text-decoration:none;color:#5c6a63;font-size:12px;font-weight:500}' +
      '.ace-tabs a[aria-current="page"]{color:#1B3A2D;font-weight:700}' +
      '.ace-tabs a[aria-current="page"] svg{stroke:#1B3A2D}' +
      '.ace-tabs svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
      'body.has-ace-tabs{padding-bottom:84px}' +
      '}';
    document.head.appendChild(css);
    var p = location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, ''), here = current(p.length > 1 ? p.replace(/\/+$/, '') : p);
    var nav = document.createElement('nav');
    nav.className = 'ace-tabs'; nav.id = 'ace-tabs'; nav.setAttribute('aria-label', 'Main');
    nav.innerHTML = TABS.map(function (t) {
      return '<a href="' + t.href + '" data-tab="' + t.id + '"' + (t.id === here ? ' aria-current="page"' : '') + '><svg viewBox="0 0 24 24" aria-hidden="true">' + t.icon + '</svg>' + t.label + '</a>';
    }).join('');
    document.body.appendChild(nav);
    document.body.classList.add('has-ace-tabs');
    function sync() { var t = timed(); nav.hidden = t; document.body.classList.toggle('has-ace-tabs', !t); }
    sync(); window.addEventListener('acelabs:timed', sync); window.addEventListener('storage', sync); setInterval(sync, 4000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
