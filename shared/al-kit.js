/* =====================================================================
   Ace Labs kit, script half (served as shared/al-kit.js?v=1).
   window.AL: the small helpers every page and the play loop share.

     icons     AL.icon(name, cls, label), AL.fillIcons(root)
     motion    AL.reduced(), AL.wait(ms), AL.ms(token), AL.follow(el, opts),
               AL.fly(from, done, to), AL.settle(el), AL.flip(list, mutate),
               AL.band(el), AL.toast(msg)
     specimens AL.uniq(svg): one helper for every multi-specimen view
     dates     the device date: AL.today(), AL.dayName(n), AL.longDate(n),
               AL.shortDate(n), AL.isoDate(n), AL.backOn(n)
     shell     AL.door(id), AL.setDue(n), AL.tabbarOn()

   The nav itself (five doors, the bead, the Review dot) is
   shared/ace-shell.js; this file only talks to it. Motion explains and
   never decorates: every helper cuts under prefers-reduced-motion, and
   none of them moves focus. Plain ES5, no network, one global.
   ===================================================================== */
(function () {
  'use strict';
  if (window.AL && window.AL.kit) return;

  /* ---------- icons: 24 grid, 1.8 stroke, round caps, currentColor ----------
     Today is a sunrise (never a clock). Stages: predict (a dashed ring with
     a dot), play (a knob), prove (a checked sheet), keep (a card stack).
     Review is a return arc, never an X. */
  var ICONS = {
    today: '<path d="M3 17.5h18"/><path d="M6.6 17.5a5.4 5.4 0 0 1 10.8 0"/><path d="M12 5.2v2.6M5.4 8.6l1.8 1.8M18.6 8.6l-1.8 1.8M8.5 20.6h7"/>',
    predict: '<circle cx="12" cy="12" r="7.8" stroke-dasharray="2.7 2.6"/><circle cx="12" cy="12" r="2.8" fill="currentColor" stroke="none"/>',
    play: '<path d="M3 12h5.5M15.5 12H21"/><circle cx="12" cy="12" r="3.6"/><path d="M6 8.6 4.2 12 6 15.4M18 8.6l1.8 3.4L18 15.4"/>',
    prove: '<rect x="4.6" y="3.6" width="14.8" height="16.8" rx="2.4"/><path d="M8.3 12.3l2.6 2.6 5-5.4"/>',
    keep: '<rect x="3.8" y="7" width="12.4" height="13.4" rx="2.2"/><path d="M8 4h10a2.2 2.2 0 0 1 2.2 2.2V16"/><path d="M7.5 12.2h5M7.5 15.4h3.4"/>',
    learn: '<path d="M4 5.2c2.8-1 5.4-1 8 .8 2.6-1.8 5.2-1.8 8-.8V19c-2.8-1-5.4-1-8 .8-2.6-1.8-5.2-1.8-8-.8z"/><path d="M12 6v13.8"/>',
    book: '<path d="M4 5.2c2.8-1 5.4-1 8 .8 2.6-1.8 5.2-1.8 8-.8V19c-2.8-1-5.4-1-8 .8-2.6-1.8-5.2-1.8-8-.8z"/><path d="M12 6v13.8"/>',
    bio: '<path d="M12 3.6c4.9 0 8.4 3.4 8.4 8.2 0 4.9-3.6 8.6-8.6 8.6S3.6 16.8 3.6 12.1C3.6 7 7.2 3.6 12 3.6z"/><circle cx="10.4" cy="10.6" r="2.9"/><path d="M15.4 15.2h.01M16.2 10.4h.01M8.4 16h.01" stroke-width="2.8"/>',
    gchem: '<path d="M9.4 3.5h5.2M10.4 3.6v5.3L5.2 18.2a1.8 1.8 0 0 0 1.6 2.6h10.4a1.8 1.8 0 0 0 1.6-2.6L13.6 8.9V3.6"/><path d="M7.6 14.2h8.8"/>',
    ochem: '<path d="M12 3.2l7.6 4.4v8.8L12 20.8l-7.6-4.4V7.6z"/><path d="M12 6.4l4.9 2.8M16.9 14.9 12 17.7M7.1 9.3v5.5"/>',
    pat: '<path d="M12 3.4l7.6 4.3v8.6L12 20.6l-7.6-4.3V7.7z"/><path d="M4.4 7.7 12 12l7.6-4.3M12 12v8.6"/>',
    rc: '<path d="M5 3.8h14v16.4H5z"/><path d="M8 7.8h8M8 15.6h5"/><rect x="7.4" y="10.3" width="9.2" height="3" rx=".6" fill="currentColor" opacity=".28" stroke="none"/><path d="M8 11.8h8"/>',
    qr: '<path d="M4 3.8v16.2h16.2"/><path d="M7.4 15.4l3.6-4.1 3 2.5 5-6.2"/>',
    sheet: '<path d="M6 3.6h8.6L19 8v12.4H6z"/><path d="M14.4 3.8V8.2H19M9 12h7M9 15.4h5"/>',
    arrow: '<path d="M5 12h13M13 7l5 5-5 5"/>',
    back: '<path d="M19 12H6M11 7l-5 5 5 5"/>',
    replay: '<path d="M4.6 12a7.4 7.4 0 1 0 2.3-5.4"/><path d="M4.4 4.2v4.4h4.4"/>',
    next: '<path d="M6 6l7 6-7 6zM16.5 6v12"/>',
    good: '<circle cx="12" cy="12" r="8.4"/><path d="M8.2 12.3l2.6 2.6 5-5.2"/>',
    review: '<path d="M19.6 12a7.6 7.6 0 1 1-2.2-5.4"/><path d="M19.8 4.2v4.4h-4.4"/>',
    skipcall: '<circle cx="12" cy="12" r="8.4"/><path d="M8.6 12h6.8"/>',
    eye: '<path d="M2.8 12S6.2 5.8 12 5.8 21.2 12 21.2 12 17.8 18.2 12 18.2 2.8 12 2.8 12z"/><circle cx="12" cy="12" r="2.8"/>',
    drag: '<path d="M8.6 12H3.4m2.2-2.6L3 12l2.6 2.6M15.4 12h5.2m-2.2-2.6L21 12l-2.6 2.6"/><circle cx="12" cy="12" r="2.2"/>',
    flag: '<path d="M6 21V4M6 4.6h11.2l-2.4 3.8 2.4 3.8H6"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.4"/><rect x="13" y="4" width="7" height="7" rx="1.4"/><rect x="4" y="13" width="7" height="7" rx="1.4"/><rect x="13" y="13" width="7" height="7" rx="1.4"/>',
    marker: '<path d="M14.5 4.5l5 5L10 19H5v-5z"/><path d="M12.5 6.5l5 5"/>',
    strike: '<path d="M4 12h16"/><path d="M8 6.5h7.5a2.6 2.6 0 0 1 0 5.2M9 17.5h6.5a2.6 2.6 0 0 0 1.6-.6"/>',
    branch: '<circle cx="6" cy="6" r="2.2"/><circle cx="18" cy="6" r="2.2"/><circle cx="12" cy="19" r="2.2"/><path d="M6 8.2c0 4 6 4.2 6 8.6M18 8.2c0 4-6 4.2-6 8.6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    lens: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.3 15.3 20.5 20.5"/>',
    drop: '<path d="M12 3.6s6 6.6 6 10.6a6 6 0 0 1-12 0c0-4 6-10.6 6-10.6z"/>',
    calendar: '<rect x="4" y="5.4" width="16" height="14.6" rx="2.4"/><path d="M4 10h16M8.4 3.4v4M15.6 3.4v4"/>',
    close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>'
  };
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  /* aria-hidden by default: a word sits beside every icon. Pass a label
     only when the icon stands alone. */
  function icon(name, cls, label) {
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" ' +
      (label ? 'role="img" aria-label="' + esc(label) + '"' : 'aria-hidden="true"') + ' focusable="false">' + (ICONS[name] || '') + '</svg>';
  }
  function fillIcons(root) {
    Array.prototype.forEach.call((root || document).querySelectorAll('[data-icon]:not([data-iconed])'), function (n) {
      n.insertAdjacentHTML('afterbegin', icon(n.getAttribute('data-icon'), n.getAttribute('data-icon-cls')));
      n.setAttribute('data-iconed', '');
    });
  }

  /* ---------- motion ---------- */
  function reduced() {
    try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  }
  /* A motion token in ms, read from tokens v2 so script and CSS agree.
     0 under reduced motion. */
  var MS = { tap: 100, state: 180, panel: 320, travel: 420, reveal: 600, card: 620, frame: 900 };
  function ms(name) {
    if (reduced()) return 0;
    var v = '';
    try { v = getComputedStyle(document.documentElement).getPropertyValue('--m-' + name).trim(); } catch (e) { v = ''; }
    var n = parseFloat(v);
    if (!isNaN(n) && v) n = /ms$/.test(v) ? n : /s$/.test(v) ? n * 1000 : n;
    return !isNaN(n) && n > 1 ? n : (MS[name] || 0);
  }
  function wait(t) { return new Promise(function (r) { setTimeout(r, reduced() ? 0 : t); }); }
  function store(k, v) {
    try { if (v === undefined) return window.sessionStorage.getItem(k); window.sessionStorage.setItem(k, v); } catch (e) { /* private mode */ }
    return null;
  }

  /* ---------- dates: the device date ----------
     AL.setClock(fn) pins "now" for tests and screenshots only. */
  var clock = null;
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function setClock(fn) {
    if (fn instanceof Date) { var t = fn.getTime(); clock = function () { return t; }; }
    else clock = typeof fn === 'function' ? fn : null;
  }
  function now() { return new Date(clock ? clock() : Date.now()); }
  function day(offset) { var d = now(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + (offset || 0)); return d; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dayName(offset) { return DAYS[day(offset).getDay()]; }
  function longDate(offset) { var d = day(offset); return DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate(); }
  function shortDate(offset) { var d = day(offset); return DAYS[d.getDay()].slice(0, 3) + ', ' + MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getDate(); }
  function isoDate(offset) { var d = day(offset); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  /* "tomorrow, Saturday" / "Tuesday" / "Friday, November 6": when a card is back */
  function backOn(offset) {
    offset = offset == null ? 1 : offset;
    if (offset === 0) return 'today';
    if (offset === 1) return 'tomorrow, ' + dayName(1);
    return offset < 7 ? dayName(offset) : longDate(offset);
  }

  /* ---------- the shell, wherever it renders (light DOM or its shadow root) ---------- */
  function shellRoots() {
    var host = document.getElementById('ace-shell'), out = [];
    if (host && host.shadowRoot) out.push(host.shadowRoot);
    out.push(document);
    return out;
  }
  /* The element a card flies to: the shell's own answer first (AceShell.doorEl;
     AceShell.door is the current door's id, a string, not a function), then a
     search of the shell's shadow root and the page. */
  function door(id) {
    if (window.AceShell && typeof window.AceShell.doorEl === 'function') {
      var d = window.AceShell.doorEl(id);
      if (d) return d;
    }
    var roots = shellRoots();
    for (var i = 0; i < roots.length; i++) {
      var n = roots[i].querySelector('.door[data-id="' + id + '"] .di') || roots[i].querySelector('.door[data-id="' + id + '"]');
      if (n) return n;
    }
    return null;
  }
  function setDue(n) {
    if (window.AceShell && typeof window.AceShell.setDue === 'function') { window.AceShell.setDue(n); return; }
    shellRoots().forEach(function (r) {
      var dot = r.querySelector('.door[data-id="review"] .due'), sr = r.querySelector('[data-due-sr]') || r.querySelector('#dueSr');
      if (dot) dot.hidden = !n;
      if (sr) sr.textContent = n ? ', ' + n + (n === 1 ? ' card' : ' cards') + ' back today' : '';
    });
  }
  /* The phone tab bar is on only where a page opts in. */
  function tabbarOn() {
    try {
      return window.matchMedia('(max-width: 759px)').matches &&
        document.documentElement.getAttribute('data-ace-shell-pos') === 'bottom' && !!document.getElementById('ace-shell');
    } catch (e) { return false; }
  }
  function barHeight() {
    if (!tabbarOn()) return 0;
    var v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tabbar-h'));
    return isNaN(v) ? 64 : v;
  }

  /* ---------- the loop band: Predict, Play, Prove, Keep ----------
     set(i): stage i is current (aria-current="step"), earlier ones are
     done; set(4) marks the whole loop done. */
  var STAGES = [['predict', 'Predict'], ['play', 'Play'], ['prove', 'Prove'], ['keep', 'Keep']];
  function band(el) {
    el.classList.add('band');
    el.setAttribute('role', 'list');
    el.setAttribute('aria-label', 'The loop: predict, play, prove, keep');
    el.innerHTML = '<span class="fill" aria-hidden="true"></span>' + STAGES.map(function (s, i) {
      return '<span class="st" role="listitem" data-i="' + i + '"><span class="n">' + icon(s[0]) + '</span><span class="bl">' + s[1] + '</span></span>';
    }).join('');
    var cur = 0;
    var api = {
      el: el,
      get: function () { return cur; },
      set: function (i) {
        cur = Math.max(0, Math.min(4, i | 0));
        Array.prototype.forEach.call(el.querySelectorAll('.st'), function (s, k) {
          s.classList.toggle('on', k === cur);
          s.classList.toggle('done', k < cur);
          if (k === cur) s.setAttribute('aria-current', 'step'); else s.removeAttribute('aria-current');
        });
        el.classList.toggle('complete', cur >= 4);
        el.style.setProperty('--band-at', String(Math.min(cur, 3) / 3));
      }
    };
    api.set(0);
    return api;
  }

  /* ---------- the camera follows the action ----------
     Before a process runs, bring its stage into view; after, keep the stage
     and what answered it (opts.to) in one view when they fit, else show
     the end (opts.prefer = 'end') or the start. Scrolls only when
     something is not already visible above the tab bar. Never moves focus. */
  function follow(el, opts) {
    opts = opts || {};
    if (!el || !el.getBoundingClientRect) return Promise.resolve();
    var r = el.getBoundingClientRect(), vh = window.innerHeight || document.documentElement.clientHeight;
    var bar = barHeight(), gap = opts.top != null ? opts.top : 12, floor = vh - bar - 8, y;
    if (opts.to && opts.to.getBoundingClientRect) {
      var rb = opts.to.getBoundingClientRect();
      if (r.top >= gap && rb.bottom <= floor) return Promise.resolve();
      var span = rb.bottom - r.top, room = floor - gap;
      if (span <= room) y = window.scrollY + (rb.bottom > floor ? rb.bottom - floor : r.top - gap);
      else if (opts.prefer === 'end') y = window.scrollY + rb.bottom - floor;
      else y = window.scrollY + r.top - gap;
    } else {
      if (r.top >= gap && r.bottom <= floor) return Promise.resolve();
      if (opts.align === 'end' && r.height <= floor - gap) y = window.scrollY + r.bottom - floor;
      else y = window.scrollY + r.top - gap;
    }
    try { window.scrollTo({ top: Math.max(0, y), behavior: reduced() ? 'auto' : 'smooth' }); } catch (e) { /* jsdom */ }
    return wait(ms('travel'));
  }

  /* ---------- a card flies to where it went ----------
     Default target: the Review door. Any element can be the target (a rung
     of the ladder, a list). The motion only says where the card went; the
     card is already saved. Reduced motion: no flight, done() at once. */
  function fly(fromEl, done, toEl) {
    var to = toEl || door('review');
    function finish() { if (done) done(); }
    if (!fromEl || !to || reduced() || !fromEl.animate) { finish(); return; }
    var a = fromEl.getBoundingClientRect(), b = to.getBoundingClientRect();
    if (!a.width || !b.width) { finish(); return; }
    /* the clone rides in its own .al layer, so it keeps the kit's look on
       any page; ids are stripped so it never shadows the original */
    var c = document.createElement('div'), copy = fromEl.cloneNode(true);
    copy.removeAttribute('id');
    Array.prototype.forEach.call(copy.querySelectorAll('[id]'), function (n) { n.removeAttribute('id'); });
    copy.style.margin = '0';
    c.className = 'al flying';
    c.setAttribute('aria-hidden', 'true');
    c.style.left = a.left + 'px'; c.style.top = a.top + 'px'; c.style.width = a.width + 'px';
    c.appendChild(copy);
    document.body.appendChild(c);
    var dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    var s = Math.max(0.08, b.width / a.width);
    var anim = c.animate([
      { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
      { transform: 'translate(' + dx * 0.4 + 'px,' + (dy * 0.4 - 60) + 'px) scale(.62) rotate(-5deg)', opacity: 1, offset: 0.5 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ') rotate(-8deg)', opacity: 0.15 }
    ], { duration: ms('card') || 620, easing: 'cubic-bezier(.45,0,.25,1)', fill: 'forwards' });
    anim.onfinish = function () { if (c.parentNode) c.parentNode.removeChild(c); settle(to); finish(); };
  }
  /* one 260 ms settle where something landed: no glow, no bump */
  function settle(el) {
    if (!el || !el.animate || reduced()) return;
    el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-3px)' }, { transform: 'translateY(0)' }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }

  /* ---------- toast: one line, role=status, above the tab bar, 4.2 s ---------- */
  function toast(msg, opts) {
    opts = opts || {};
    var t = document.getElementById('al-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'al-toast'; t.className = 'al toast';
      t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite');
      document.body.appendChild(t);
    }
    t.innerHTML = '<span class="mark" aria-hidden="true"></span>' + icon(opts.icon || 'keep', 'sm') + '<span>' + esc(msg) + '</span>';
    t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.classList.remove('show'); }, opts.ms || 4200);
    return t;
  }

  /* ---------- FLIP: a list moves from its old order to its new one ---------- */
  function flip(list, mutate) {
    var first = new Map();
    Array.prototype.forEach.call(list.children, function (k) { first.set(k, k.getBoundingClientRect()); });
    mutate();
    if (reduced()) return;
    var d = ms('panel') || 320;
    Array.prototype.forEach.call(list.children, function (k) {
      if (!k.animate) return;
      var f = first.get(k), l = k.getBoundingClientRect();
      if (!f) { k.animate([{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: d, easing: 'cubic-bezier(.2,.8,.2,1)' }); return; }
      var dy = f.top - l.top;
      if (dy) k.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: d, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });
  }

  /* ---------- unique specimen ids ----------
     Several true-to-life frames on one page share ids (rl-rbc, dw-arrow
     ...), so <use href="#rl-d"> would draw the first frame's cells. Every
     rl- and dw- id, and every url(#...) and href="#..." that points at one,
     gets one suffix per call. Other ids are left alone. */
  var seq = 0;
  var UNIQ = /(\bid=["']|url\(\s*["']?#|href=["']#)((?:rl|dw)-[A-Za-z0-9_-]+)/g;
  function uniq(svg) {
    var sfx = '-u' + (seq++).toString(36);
    return String(svg == null ? '' : svg).replace(UNIQ, function (m, a, b) { return a + b + sfx; });
  }

  window.AL = {
    kit: 1,
    icon: icon, fillIcons: fillIcons, esc: esc, ICONS: ICONS,
    reduced: reduced, ms: ms, wait: wait, store: store,
    band: band, follow: follow, fly: fly, settle: settle, toast: toast, flip: flip, uniq: uniq,
    setClock: setClock, now: now, today: function () { return day(0); }, day: day,
    dayName: dayName, longDate: longDate, shortDate: shortDate, isoDate: isoDate, backOn: backOn,
    door: door, setDue: setDue, tabbarOn: tabbarOn
  };
  function boot() { fillIcons(document); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
