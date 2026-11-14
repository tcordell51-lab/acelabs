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
  var PLACES = [
    { id: 'home', label: 'Home', href: '/', match: /^\/(index|ace-labs)?$/ },
    { id: 'bio', label: 'Biology', href: '/bio/', match: /^\/(bio|tools\/bio)/ },
    { id: 'gchem', label: 'Gen Chem', href: '/gc/', match: /^\/(gc|tools\/(gc|gchem))(\/|$)/ },
    { id: 'ochem', label: 'OChem', href: '/tools/ochem/', match: /^\/(oc|tools\/(ochem|organic)|games\/chirality)(\/|$)/ },
    { id: 'pat', label: 'PAT', href: '/tools/pat/', match: /^\/(pat|tools\/pat|games\/six-views)/ },
    { id: 'rc', label: 'Reading', href: '/tools/rc/', match: /^\/(rc|tools\/rc)/ },
    { id: 'qr', label: 'QR', href: '/qr/drill/', match: /^\/(qr|tools\/qr)/ },
    { id: 'tests', label: 'Tests', href: '/tests/', match: /^\/(tests|diagnostic|tools\/(mock|minitests))/ },
    { id: 'review', label: 'Review', href: '/review/', match: /^\/(review|performance)/ }
  ];
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
    if (document.getElementById('aui-font')) return;
    var l = document.createElement('link'); l.id = 'aui-font'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap';
    document.head.appendChild(l);
  }

  function mount() {
    if (api.mounted || !document.body) return;
    font();
    if (framed() || (params && params.has('embed')) || document.documentElement.getAttribute('data-ace-bar') === 'off' || timed()) return;
    var here = api.place = placeFor(location.pathname);
    var links = PLACES.map(function (p) {
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
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
