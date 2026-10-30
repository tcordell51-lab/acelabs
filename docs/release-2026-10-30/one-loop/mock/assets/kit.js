/* =====================================================================
   Ace Labs kit.js (mock). In production this splits in two:
     shared/ace-shell.js v2  the one nav (five doors), in its shadow root
     shared/al-kit.js        icons, motion helpers, toast, follow, flip, ns
   Plain ES5, no network, no globals beyond window.AL.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- icons: 24 grid, 1.8 stroke, round caps, currentColor ---------- */
  var ICONS = {
    /* Today: a sunrise over a horizon line (never a clock) */
    today: '<path d="M3 17.5h18"/><path d="M6.6 17.5a5.4 5.4 0 0 1 10.8 0"/><path d="M12 5.2v2.6M5.4 8.6l1.8 1.8M18.6 8.6l-1.8 1.8M8.5 20.6h7"/>',
    predict: '<circle cx="12" cy="12" r="7.8" stroke-dasharray="2.7 2.6"/><circle cx="12" cy="12" r="2.8" fill="currentColor" stroke="none"/>',
    play: '<path d="M3 12h5.5M15.5 12H21"/><circle cx="12" cy="12" r="3.6"/><path d="M6 8.6 4.2 12 6 15.4M18 8.6l1.8 3.4L18 15.4"/>',
    prove: '<rect x="4.6" y="3.6" width="14.8" height="16.8" rx="2.4"/><path d="M8.3 12.3l2.6 2.6 5-5.4"/>',
    keep: '<rect x="3.8" y="7" width="12.4" height="13.4" rx="2.2"/><path d="M8 4h10a2.2 2.2 0 0 1 2.2 2.2V16"/><path d="M7.5 12.2h5M7.5 15.4h3.4"/>',
    learn: '<path d="M4 5.2c2.8-1 5.4-1 8 .8 2.6-1.8 5.2-1.8 8-.8V19c-2.8-1-5.4-1-8 .8-2.6-1.8-5.2-1.8-8-.8z"/><path d="M12 6v13.8"/>',
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
    book: '<path d="M4 5.2c2.8-1 5.4-1 8 .8 2.6-1.8 5.2-1.8 8-.8V19c-2.8-1-5.4-1-8 .8-2.6-1.8-5.2-1.8-8-.8z"/><path d="M12 6v13.8"/>',
    lens: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.3 15.3 20.5 20.5"/>',
    drop: '<path d="M12 3.6s6 6.6 6 10.6a6 6 0 0 1-12 0c0-4 6-10.6 6-10.6z"/>',
    calendar: '<rect x="4" y="5.4" width="16" height="14.6" rx="2.4"/><path d="M4 10h16M8.4 3.4v4M15.6 3.4v4"/>',
    close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>'
  };
  function icon(name, cls) {
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || '') + '</svg>';
  }
  function fillIcons(root) {
    Array.prototype.forEach.call((root || document).querySelectorAll('[data-icon]:not([data-iconed])'), function (n) {
      n.insertAdjacentHTML('afterbegin', icon(n.getAttribute('data-icon'), n.getAttribute('data-icon-cls')));
      n.setAttribute('data-iconed', '');
    });
  }
  function reduced() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function store(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, reduced() ? 0 : ms); }); }

  /* The mock runs on a fixed date so screenshots are stable. Production uses
     the device date. */
  var TODAY = new Date(2026, 9, 30);
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function dayName(offset) { var d = new Date(TODAY); d.setDate(d.getDate() + (offset || 0)); return DAYS[d.getDay()]; }
  function longDate(offset) { var d = new Date(TODAY); d.setDate(d.getDate() + (offset || 0)); return DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate(); }

  /* =====================================================================
     The shell: five doors. Phone: a bottom tab bar in thumb reach.
     Desktop: a top bar. A page with its own fixed bottom UI sets
     html[data-ace-shell-pos="top"] and keeps the top bar on phones too.
     The four stage doors sit inside a thin gold ring; a bead marks the
     current door and travels from the last one (cut under reduced motion).
     The current door is also marked by aria-current, a weight change and
     a tick, so the bead is never the only marker.
     ===================================================================== */
  var DOORS = [
    { id: 'today', label: 'Today', href: 'today.html', icon: 'today' },
    { id: 'learn', label: 'Learn', href: 'learn.html', icon: 'learn' },
    { id: 'practice', label: 'Practice', href: 'practice.html', icon: 'play' },
    { id: 'tests', label: 'Tests', href: 'tests.html', icon: 'prove' },
    { id: 'review', label: 'Review', href: 'review.html', icon: 'keep' }
  ];
  function mountShell() {
    var host = document.getElementById('ace-shell');
    if (!host) return;
    var root = document.documentElement;
    var cur = root.getAttribute('data-door') || 'today';
    var due = root.getAttribute('data-due');
    var html = '<div class="in"><a class="brand" href="today.html" aria-label="Ace Labs, Today">' +
      '<img src="assets/ace-dat-mark-reversed.svg" alt=""><span>Ace <i>Labs</i></span></a>' +
      '<nav aria-label="Ace Labs"><ul class="doors">';
    DOORS.forEach(function (d) {
      html += '<li><a class="door" data-id="' + d.id + '" href="' + d.href + '"' + (d.id === cur ? ' aria-current="page"' : '') + '>' +
        '<span class="di">' + icon(d.icon) + (d.id === 'review' ? '<i class="due"' + (due ? '' : ' hidden') + ' aria-hidden="true"></i>' : '') + '</span>' +
        '<span class="dl">' + d.label + '</span>' +
        (d.id === 'review' ? '<span class="sr" id="dueSr">' + (due ? ', ' + due + ' cards back today' : '') + '</span>' : '') + '</a></li>';
    });
    html += '</ul></nav></div>';
    host.className = 'shell';
    host.innerHTML = html;
    var ul = host.querySelector('.doors');
    var ring = document.createElement('div'); ring.className = 'ring'; ring.setAttribute('aria-hidden', 'true');
    var bead = document.createElement('div'); bead.className = 'bead'; bead.setAttribute('aria-hidden', 'true');
    ul.appendChild(ring); ul.appendChild(bead);
    function center(id) {
      var a = ul.querySelector('[data-id="' + id + '"]');
      if (!a) return 0;
      var ra = a.getBoundingClientRect(), ru = ul.getBoundingClientRect();
      return ra.left - ru.left + ra.width / 2;
    }
    function layout(from) {
      var l = ul.querySelector('[data-id="learn"]').parentNode.getBoundingClientRect();
      var r = ul.querySelector('[data-id="review"]').parentNode.getBoundingClientRect();
      var ru = ul.getBoundingClientRect();
      ring.style.left = (l.left - ru.left + 3) + 'px';
      ring.style.width = (r.right - l.left - 6) + 'px';
      if (from && !reduced()) {
        bead.style.transition = 'none';
        bead.style.left = center(from) + 'px';
        bead.getBoundingClientRect();
        bead.style.transition = '';
      }
      bead.style.left = center(cur) + 'px';
    }
    var last = store('al.lastDoor');
    layout(last && last !== cur ? last : null);
    store('al.lastDoor', cur);
    window.addEventListener('resize', function () { layout(null); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(null); });
  }
  function setDue(n) {
    var dot = document.querySelector('.shell .due'), sr = document.getElementById('dueSr');
    if (dot) dot.hidden = !n;
    if (sr) sr.textContent = n ? ', ' + n + ' cards back today' : '';
  }

  /* ---------- the loop band: Predict, Play, Prove, Keep ---------- */
  var STAGES = [['predict', 'Predict'], ['play', 'Play'], ['prove', 'Prove'], ['keep', 'Keep']];
  function band(el) {
    el.classList.add('band');
    el.setAttribute('role', 'list');
    el.setAttribute('aria-label', 'The loop');
    el.innerHTML = '<span class="fill" aria-hidden="true"></span>' + STAGES.map(function (s, i) {
      return '<span class="st" role="listitem" data-i="' + i + '"><span class="n">' + icon(s[0]) + '</span><span class="bl">' + s[1] + '</span></span>';
    }).join('');
    var api = {
      set: function (i) {
        Array.prototype.forEach.call(el.querySelectorAll('.st'), function (s, k) {
          s.classList.toggle('on', k === i);
          s.classList.toggle('done', k < i);
          if (k === i) s.setAttribute('aria-current', 'step'); else s.removeAttribute('aria-current');
        });
        el.querySelector('.fill').style.width = 'calc(' + (Math.max(0, Math.min(i, 3)) / 3) + ' * (100% - 25%))';
      }
    };
    api.set(0);
    return api;
  }

  /* ---------- the camera follows the action ----------
     Before a process runs, bring its stage into view; after, bring the
     verdict into view. Only scrolls when the element is not already fully
     visible between the top of the page and the tab bar. Never moves focus. */
  function follow(el, opts) {
    opts = opts || {};
    if (!el) return Promise.resolve();
    var r = el.getBoundingClientRect(), vh = window.innerHeight;
    if (opts.to) {
      /* keep a range in view: from el's top to opts.to's bottom (the slide
         and the verdict under it), with the least scroll that shows both */
      var rb = opts.to.getBoundingClientRect(), bar = tabbarOn() ? 64 : 0, gap = 12;
      if (r.top >= gap && rb.bottom <= vh - bar - 8) return Promise.resolve();
      var span = rb.bottom - r.top, room = vh - bar - gap - 8, yy;
      if (span <= room) yy = window.scrollY + (rb.bottom > vh - bar - 8 ? rb.bottom - (vh - bar - 8) : r.top - gap);
      else if (opts.prefer === 'end') yy = window.scrollY + rb.bottom - (vh - bar - 8);
      else yy = window.scrollY + r.top - gap;
      window.scrollTo({ top: Math.max(0, yy), behavior: reduced() ? 'auto' : 'smooth' });
      return wait(420);
    }
    var bottomBar = tabbarOn() ? 64 : 0;
    var topGap = opts.top != null ? opts.top : 12;
    var room = vh - bottomBar - topGap - 12;
    var fits = r.height <= room;
    if (r.top >= topGap && r.bottom <= vh - bottomBar - 8) return Promise.resolve();
    var y;
    if (opts.align === 'end' && fits) y = window.scrollY + r.bottom - (vh - bottomBar - 16);
    else y = window.scrollY + r.top - topGap;
    window.scrollTo({ top: Math.max(0, y), behavior: reduced() ? 'auto' : 'smooth' });
    return wait(420);
  }
  function tabbarOn() {
    return window.matchMedia('(max-width:759px)').matches && document.documentElement.getAttribute('data-ace-shell-pos') !== 'top' && !!document.querySelector('.shell');
  }

  /* ---------- a card flies to the Review door ----------
     The motion says where the card went. Reduced motion: no flight, the
     dot appears and the toast still says when it comes back. */
  function fly(fromEl, done, toEl) {
    var door = toEl || document.querySelector('.shell .door[data-id="review"] .di');
    if (!fromEl || !door || reduced()) { if (done) done(); return; }
    var a = fromEl.getBoundingClientRect(), b = door.getBoundingClientRect();
    var c = fromEl.cloneNode(true);
    c.removeAttribute('id');
    c.setAttribute('aria-hidden', 'true');
    c.classList.add('flying');
    c.style.left = a.left + 'px'; c.style.top = a.top + 'px'; c.style.width = a.width + 'px'; c.style.margin = '0';
    document.body.appendChild(c);
    var dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    var s = Math.max(0.08, b.width / a.width);
    if (c.animate) {
      var anim = c.animate([
        { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
        { transform: 'translate(' + dx * 0.4 + 'px,' + (dy * 0.4 - 60) + 'px) scale(.62) rotate(-5deg)', opacity: 1, offset: 0.5 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ') rotate(-8deg)', opacity: 0.15 }
      ], { duration: 620, easing: 'cubic-bezier(.45,0,.25,1)', fill: 'forwards' });
      anim.onfinish = function () { c.remove(); settle(door); if (done) done(); };
    } else { c.remove(); if (done) done(); }
  }
  function settle(el) {
    if (!el || !el.animate || reduced()) return;
    el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-3px)' }, { transform: 'translateY(0)' }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }

  /* ---------- toast: one line, role=status, above the tab bar ---------- */
  function toast(msg) {
    var t = document.getElementById('al-toast');
    if (!t) { t = document.createElement('div'); t.id = 'al-toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.innerHTML = icon('keep', 'sm') + '<span>' + msg + '</span>';
    t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('show'); }, 4200);
  }

  /* ---------- FLIP: animate a list from its old order to its new one ---------- */
  function flip(list, mutate) {
    var kids = Array.prototype.slice.call(list.children), first = new Map();
    kids.forEach(function (k) { first.set(k, k.getBoundingClientRect()); });
    mutate();
    if (reduced()) return;
    Array.prototype.forEach.call(list.children, function (k) {
      var f = first.get(k), l = k.getBoundingClientRect();
      if (!f) { if (k.animate) k.animate([{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' }); return; }
      var dy = f.top - l.top;
      if (dy && k.animate) k.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });
  }

  /* ---------- unique SVG ids: one helper for every multi-specimen view ----------
     Several BioReal frames on one page share ids (rl-rbc, rl-d ...); <use
     href="#rl-d"> then draws the first frame's cells. Suffix every id. */
  var seq = 0;
  function uniq(svg) {
    var sfx = '-u' + (seq++).toString(36);
    return svg.replace(/(id="|url\(#|href="#)(rl-[a-z0-9-]+|dw-[a-z0-9-]+)/g, function (m, a, b) { return a + b + sfx; });
  }

  window.AL = {
    icon: icon, fillIcons: fillIcons, reduced: reduced, store: store, wait: wait,
    band: band, follow: follow, fly: fly, settle: settle, toast: toast, flip: flip, uniq: uniq,
    dayName: dayName, longDate: longDate, setDue: setDue, tabbarOn: tabbarOn
  };
  function boot() { mountShell(); fillIcons(document); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
