/* ace-ui.js : the one Ace Labs navigation bar (cream, AD mark, DM Sans).

   Add it with one tag, after /shared/ace-ui.css:
     <script src="/shared/ace-ui.js" defer></script>

   - The AD mark and "Ace Labs" always link to the hub (/), so every page has a
     way back.
   - One list of places (PLACES below). Desktop shows them in the bar; on a
     phone the same list opens from the Menu button. Change an address here and
     every page follows.
   - Hidden inside an iframe, on ?embed pages, during a timed section
     (acelabs.timed) and when <html data-ace-bar="off">.
   - Keeps ?student=<id> on every link so a coach link stays personal.
   Replaces shared/ace-shell.js; a page loads one or the other, never both. */
(function () {
  'use strict';
  if (window.AceUI) return;
  /* One navigation everywhere (2026-11-16): the same five places as the phone tab bar
     (shared/ace-tabs.js) and the older pages' bar (shared/ace-shell.js). Review lives under Test.
     First match wins, so Test is checked before Labs (a test inside /tools/ is a test). */
  var PLACES = [
    { id: 'today', label: 'Today', href: '/', match: /^\/(index|ace-labs|plan|onboarding|for-retakers)?$/ },
    { id: 'test', label: 'Test', href: '/tests/', match: /^\/(tests|diagnostic|review|prometric-mock|unified-mock|test-week|test-day-readiness|tools\/(mock|minitests)|tools\/pat\/test)(\/|$)/ },
    { id: 'repair', label: 'Repair', href: '/repair/', match: /^\/repair(\/|$)/ },
    { id: 'progress', label: 'Progress', href: '/progress/', match: /^\/(progress|performance)(\/|$)/ },
    { id: 'labs', label: 'Labs', href: '/labs/', match: /^\/(labs|see|learn|bio|gc|oc|qr|rc|pat|games|guides|cheat-sheets|tricks|tools)(\/|$)/ }
  ];
  var ORDER = ['today', 'labs', 'test', 'repair', 'progress'];

  var api = window.AceUI = { version: 1, places: PLACES, place: null, mounted: false };

  function framed() { try { return window.top !== window.self; } catch (e) { return true; } }
  var params; try { params = new URLSearchParams(location.search); } catch (e) { params = null; }
  function norm(p) { p = String(p || '/').replace(/\/index(\.html)?$/, '/').replace(/\.html$/, ''); if (p.length > 1) p = p.replace(/\/+$/, ''); return p || '/'; }
  function placeFor(path) { var p = norm(path); for (var i = 0; i < PLACES.length; i++) if (PLACES[i].match.test(p)) return PLACES[i].id; return null; }
  api.placeFor = placeFor;
  function timed() { try { var v = JSON.parse(localStorage.getItem('acelabs.timed') || 'null'); return !!(v && typeof v.until === 'number' && v.until > Date.now()); } catch (e) { return false; } }
  var student = params ? (params.get('student') || '').trim() : '';
  function withStudent(href) { return student ? href + (href.indexOf('?') < 0 ? '?' : '&') + 'student=' + encodeURIComponent(student) : href; }
  api.href = withStudent;

  function font() {
    if (document.getElementById('aui-font') || document.querySelector('link[href*="ace-ui.css"]')) return;   // ace-ui.css self-hosts DM Sans
    var l = document.createElement('link'); l.id = 'aui-font'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap';
    document.head.appendChild(l);
  }


  /* The phone tab bar: the same five places. Loaded here so every page with a bar has it. */
  function tabs() {
    if (window.AceTabs || document.querySelector('script[src*="/shared/ace-tabs.js"]')) return;
    var t = document.createElement('script'); t.src = '/shared/ace-tabs.js?v=5'; t.defer = true; document.head.appendChild(t);
  }

  /* XP and the daily streak (shared/ace-mastery.js) show in the bar on every page. */
  function mastery() {
    if (window.AceMastery) { if (window.AceMastery.pill) window.AceMastery.pill(); return; }
    if (document.querySelector('script[src*="/shared/ace-mastery.js"]')) return;
    var t = document.createElement('script'); t.src = '/shared/ace-mastery.js?v=1'; t.async = true; document.head.appendChild(t);
  }

  function mount() {
    if (api.mounted || !document.body) return;
    font(); tabs();
    if (framed() || (params && params.has('embed')) || document.documentElement.getAttribute('data-ace-bar') === 'off' || timed()) return;
    var here = api.place = placeFor(location.pathname);
    var links = ORDER.map(function (id) { return PLACES.filter(function (p) { return p.id === id; })[0]; }).map(function (p) {
      return '<a href="' + withStudent(p.href) + '"' + (p.id === here ? ' aria-current="page"' : '') + '>' + p.label + '</a>';
    }).join('');
    var bar = document.createElement('header');
    bar.className = 'aui-bar'; bar.id = 'ace-bar'; bar.setAttribute('data-open', 'false');
    bar.innerHTML =
      '<div class="aui-bar__in">' +
        '<a class="aui-bar__brand" href="' + withStudent('/') + '" aria-label="Ace Labs home"><img src="/shared/ace-dat-mark.svg" alt="" width="30" height="30"><span>Ace Labs</span></a>' +
        '<nav class="aui-bar__nav" aria-label="Ace Labs">' + links + '</nav>' +
        '<button class="aui-bar__menu" type="button" aria-expanded="false" aria-controls="ace-bar-sheet">Menu</button>' +
      '</div>' +
      '<nav class="aui-bar__sheet" id="ace-bar-sheet" aria-label="Ace Labs menu">' + links + '</nav>';
    document.body.insertBefore(bar, document.body.firstChild);
    var btn = bar.querySelector('.aui-bar__menu');
    function setOpen(open) { bar.setAttribute('data-open', open ? 'true' : 'false'); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); btn.textContent = open ? 'Close' : 'Menu'; }
    btn.addEventListener('click', function () { setOpen(bar.getAttribute('data-open') !== 'true'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    api.mounted = true;
    mastery();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
