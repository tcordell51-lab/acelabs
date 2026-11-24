/* ace-qnav.js : the question navigator every test runner can share (styles in shared/ace-qnav.css).

   AceQNav.render({
     label:   'Untimed · question 1 of 30',      where the student is
     time:    '26:41' or null,                   the clock text; null shows noClock
     noClock: 'No clock',
     count:   30,                                how many questions
     at:      0,                                 the current one (0-based)
     done:    (i) => true when question i has an answer
     flagged: (i) => true when question i is marked for review
     onJump:  (i) => { ... }                     called when a number is picked
   })  ->  the bar element. Put it above the question.

   The bar is one slim row that stays at the top of the screen. The numbered grid never sits over
   the question: on a phone it opens as a sheet from the bottom when the student presses
   "Questions" and closes when a number is picked, Close is pressed, the scrim is tapped or Escape
   is pressed. On a wide screen the grid sits in the bar. The clock element keeps the class
   "aqn__time" so a runner can update its text every second without drawing the bar again. */
(function () {
  'use strict';
  var uid = 0;
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function render(o) {
    o = o || {};
    var n = o.count || 0, at = o.at || 0, id = 'aqn-panel-' + (++uid);
    var done = o.done || function () { return false; }, flagged = o.flagged || function () { return false; };
    var bar = el('div', 'aqn' + (n > 60 ? ' aqn--long' : ''));
    bar.append(el('span', 'aqn__where', o.label || ('Question ' + (at + 1) + ' of ' + n)));
    var time = el('span', 'aqn__time' + (o.time == null ? ' aqn__time--none' : ''), o.time == null ? (o.noClock || 'No clock') : o.time);
    if (o.time != null) { time.setAttribute('role', 'timer'); time.setAttribute('aria-label', 'Time left'); }
    bar.append(time);
    var answered = 0; for (var i = 0; i < n; i++) if (done(i)) answered++;
    var toggle = el('button', 'aqn__toggle'); toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-controls', id);
    toggle.append(el('span', null, 'Questions'), el('span', 'aqn__count', answered + ' of ' + n + ' done'));
    bar.append(toggle);

    var scrim = el('div', 'aqn__scrim');
    var panel = el('div', 'aqn__panel'); panel.id = id; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Jump to a question');
    var head = el('div', 'aqn__head'); var close = el('button', 'aqn__close', 'Close'); close.type = 'button';
    head.append(el('span', 'aqn__title', 'Jump to a question'), close);
    var grid = el('div', 'aqn__grid');
    for (var j = 0; j < n; j++) (function (k) {
      var b = el('button', 'aqn__cell' + (done(k) ? ' is-done' : '') + (flagged(k) ? ' is-flag' : '') + (k === at ? ' is-now' : ''), String(k + 1)); b.type = 'button';
      b.setAttribute('aria-label', 'Question ' + (k + 1) + (k === at ? ', current' : '') + (flagged(k) ? ', marked for review' : '') + (done(k) ? ', answered' : ', not answered'));
      if (k === at) b.setAttribute('aria-current', 'true');
      b.addEventListener('click', function () { shut(false); if (o.onJump) o.onJump(k); });
      grid.append(b);
    })(j);
    var key = el('div', 'aqn__key');
    [['k-now', 'Current'], ['k-done', 'Answered'], ['k-flag', 'Marked for review']].forEach(function (p) { var s = el('span'); s.append(el('i', p[0]), document.createTextNode(p[1])); key.append(s); });
    panel.append(head, grid, key);
    bar.append(scrim, panel);

    function onKey(e) { if (e.key === 'Escape') shut(true); }
    function open() {
      bar.classList.add('is-open'); toggle.setAttribute('aria-expanded', 'true'); panel.setAttribute('aria-modal', 'true');
      document.addEventListener('keydown', onKey);
      var cur = grid.querySelector('.is-now'); if (cur && cur.focus) { try { cur.focus({ preventScroll: true }); } catch (e) { cur.focus(); } if (cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' }); }
    }
    function shut(back) {
      if (!bar.classList.contains('is-open')) return;
      bar.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); panel.removeAttribute('aria-modal');
      document.removeEventListener('keydown', onKey);
      if (back && toggle.focus) toggle.focus();
    }
    toggle.addEventListener('click', function () { bar.classList.contains('is-open') ? shut(true) : open(); });
    close.addEventListener('click', function () { shut(true); });
    scrim.addEventListener('click', function () { shut(true); });
    bar.aqnOpen = open; bar.aqnClose = shut;
    return bar;
  }
  window.AceQNav = { render: render };
})();
