/* ace-board.js : the Ace Labs Whiteboard. One component for every drawn visual.

   Every board is data plus a hand-built inline SVG, and runs the same four beats:
     1. Board    the big drawing, unlabeled where the point is to predict
     2. Predict  one tap question
     3. Reveal   the drawing builds stroke by stroke, one tap per step (3 to 6 steps)
     4. Try it   three quick questions with instant feedback, then Back

   AceBoard.add(board)            register a board (called by /shared/boards/*.js)
   AceBoard.kit                   the marker kit the board files draw with (wobbly lines, boxes, arrows)
   AceBoard.ready(cb)             load the stylesheet and every board file, then cb()
   AceBoard.mount(host, id, o)    draw a board into an element; o: { from, onBack, heading: 'h1'|'h2' }
   AceBoard.open(id, o)           open a board as a bottom sheet in place, no navigation
   AceBoard.url(id, from)         the full-page address, /see/?b=<id>
   AceBoard.list()                every board, in registration order

   Board shape: { id, section, title, sub, svg, predict: { q, choices, answer, why },
                  steps: [caption, ...]  (caption k belongs to <g data-step="k+1">),
                  tryIt: [{ q, choices, answer, why } x3], more: [{ label, href }] (optional),
                  and the game feeds, all optional:
                    path: { title, steps: [...] }                      Pathway Builder, /see/pathway/
                    flick: { title, up, down, cards: [{ q, up, why }] } Trend Flick, /see/flick/
                    tug: { title, sets: [{ rxn, cards: [{ change, dir, why }] }] }  Q vs K Tug, /see/tug/
                    play: 'flick:<board id>' | 'tug:<board id>' | 'path:<board id>'  borrow another board's game }
   AceBoard.play(board)           -> { game, label, href } for the board's one-tap "Play a round" link, or null
   The registry of which question opens which board lives in shared/ace-visuals.js.
   Loads in node too (tests/visuals/): no DOM is touched until mount or open. */
(function (root) {
  'use strict';
  if (root && root.AceBoard) return;
  var V = '3';
  var FILES = ['gc', 'bio', 'oc', 'qr', 'gc2', 'bio2', 'oc2', 'qr2', 'pat', 'rc'];
  /* Board text is drawn in board units (720 wide). On a 390px phone the board runs edge to edge, so
     26 units is 14px: nothing smaller is ever drawn (tests/visuals/coverage.test.js holds the line). */
  var MIN_TEXT = 26;
  var BOARDS = {}, ORDER = [];
  var SECTION = { gchem: 'Gen Chem', bio: 'Biology', ochem: 'Organic Chemistry', qr: 'Quantitative Reasoning', pat: 'Perceptual Ability', rc: 'Reading' };
  var LETTERS = ['A', 'B', 'C', 'D', 'E'];

  /* ---------------- marker kit ---------------- */
  var COL = { ink: '#1B3A2D', gold: '#C9A84C', goldInk: '#7c6113', blue: '#2f5f9e', rose: '#a3405c', purple: '#6b4fa0', green: '#2f7d4f', teal: '#1f7a70', orange: '#a8641f', mute: '#8a9a90' };
  function c(o, d) { var k = (o && o.c) || d || 'ink'; return COL[k] || k; }
  function r1(n) { return Math.round(n * 10) / 10; }
  /* A steady hand that is not a ruler: the same coordinates always wobble the same way. */
  function jit(a, b, k) { var x = Math.sin(a * 12.9898 + b * 78.233 + k * 37.719) * 43758.5453; return (x - Math.floor(x)) * 2 - 1; }
  function seg(x1, y1, x2, y2, k) {
    var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / len, ny = dx / len, amp = Math.min(5, 1.1 + len * 0.012);
    var a = jit(x1, y1, k + 1) * amp, b = jit(x2, y2, k + 2) * amp;
    return 'C' + r1(x1 + dx / 3 + nx * a) + ' ' + r1(y1 + dy / 3 + ny * a) + ' ' + r1(x1 + 2 * dx / 3 + nx * b) + ' ' + r1(y1 + 2 * dy / 3 + ny * b) + ' ' + r1(x2) + ' ' + r1(y2);
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  /* H_{2}O and 10^{-7}: subscripts and superscripts as shifted tspans (works in every browser). */
  function fmt(s) {
    var out = '', back = 0;
    esc(s).split(/([_^]\{[^}]*\})/).forEach(function (part) {
      if (!part) return;
      var m = /^([_^])\{([^}]*)\}$/.exec(part);
      if (m) { var d = m[1] === '_' ? 0.28 : -0.42; out += '<tspan dy="' + (d - back) + 'em" font-size="68%">' + m[2] + '</tspan>'; back = d * 0.68; }
      else if (back) { out += '<tspan dy="' + r1(-back * 100) / 100 + 'em">' + part + '</tspan>'; back = 0; }
      else out += part;
    });
    return out;
  }
  function shape(d, o, extra) {
    o = o || {};
    var fill = o.fill ? (COL[o.fill] || o.fill) : 'none';
    return '<path class="bd-s' + (o.dash ? ' bd-dash' : '') + '"' + (o.dash ? '' : ' pathLength="1"') + ' d="' + d + '" stroke="' + c(o) + '" stroke-width="' + (o.w || 4) + '" fill="' + fill + '"' +
      (o.fill ? ' fill-opacity="' + (o.op == null ? 0.16 : o.op) + '"' : '') + (o.dash ? ' stroke-dasharray="' + (o.dash === true ? '3 11' : o.dash) + '"' : '') + (extra || '') + '/>';
  }
  var kit = {
    W: 720, H: 560, MIN_TEXT: MIN_TEXT, col: COL, fmt: fmt,
    /* text: a = 'm' middle (default), 's' start, 'e' end; size in board units (720 wide) */
    t: function (x, y, s, o) {
      o = o || {};
      return '<text xml:space="preserve" class="bd-t' + (o.plain ? ' bd-plain' : '') + '" x="' + x + '" y="' + y + '" font-size="' + Math.max(MIN_TEXT, o.size || 30) + '" fill="' + c(o) + '" text-anchor="' + ({ s: 'start', e: 'end' }[o.a] || 'middle') + '"' +
        (o.rot ? ' transform="rotate(' + o.rot + ' ' + x + ' ' + y + ')"' : '') + '>' + fmt(s) + '</text>';
    },
    /* a wobbly polyline through points [[x,y], ...] */
    line: function (pts, o) {
      var d = 'M' + pts[0][0] + ' ' + pts[0][1];
      for (var i = 1; i < pts.length; i++) d += seg(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], i);
      return shape(d, o);
    },
    /* a smooth curve through points (for graphs): Catmull-Rom to cubic */
    curve: function (pts, o) {
      var d = 'M' + pts[0][0] + ' ' + pts[0][1];
      for (var i = 0; i < pts.length - 1; i++) {
        var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
        d += 'C' + r1(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + r1(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + r1(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + r1(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + p2[0] + ' ' + p2[1];
      }
      return shape(d, o);
    },
    arrow: function (x1, y1, x2, y2, o) {
      o = o || {};
      var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy) || 1, bend = o.bend || 0;
      var mx = (x1 + x2) / 2 - dy / len * bend, my = (y1 + y2) / 2 + dx / len * bend;
      var w = jit(x1, y2, 3) * Math.min(4, len * 0.01);
      var d = 'M' + x1 + ' ' + y1 + 'Q' + r1(mx + w) + ' ' + r1(my + w) + ' ' + x2 + ' ' + y2;
      var ang = Math.atan2(y2 - my, x2 - mx), h = o.head || 15;
      function tip(a) { return r1(x2 - h * Math.cos(ang + a)) + ' ' + r1(y2 - h * Math.sin(ang + a)); }
      var out = shape(d, o) + shape('M' + tip(0.45) + 'L' + x2 + ' ' + y2 + 'L' + tip(-0.45), { c: o.c, w: o.w });
      if (o.both) {
        var a0 = Math.atan2(y1 - my, x1 - mx);
        out += shape('M' + r1(x1 - h * Math.cos(a0 + 0.45)) + ' ' + r1(y1 - h * Math.sin(a0 + 0.45)) + 'L' + x1 + ' ' + y1 + 'L' + r1(x1 - h * Math.cos(a0 - 0.45)) + ' ' + r1(y1 - h * Math.sin(a0 - 0.45)), { c: o.c, w: o.w });
      }
      return out;
    },
    box: function (x, y, w, h, o) {
      o = o || {};
      var r = o.r == null ? 14 : o.r, d = 'M' + (x + r) + ' ' + (y + jit(x, y, 9));
      d += seg(x + r, y, x + w - r, y, 1) + 'Q' + (x + w) + ' ' + y + ' ' + (x + w) + ' ' + (y + r);
      d += seg(x + w, y + r, x + w, y + h - r, 2) + 'Q' + (x + w) + ' ' + (y + h) + ' ' + (x + w - r) + ' ' + (y + h);
      d += seg(x + w - r, y + h, x + r, y + h, 3) + 'Q' + x + ' ' + (y + h) + ' ' + x + ' ' + (y + h - r);
      d += seg(x, y + h - r, x, y + r, 4) + 'Q' + x + ' ' + y + ' ' + (x + r + 3) + ' ' + r1(y - 1.5);
      return shape(d, o);
    },
    circ: function (cx, cy, rx, ry, o) {
      if (ry && typeof ry === 'object') { o = ry; ry = rx; }
      ry = ry || rx;
      var k = 0.5523, j = function (n) { return 1 + jit(cx, cy, n) * 0.03; };
      var d = 'M' + r1(cx + rx) + ' ' + cy +
        'C' + r1(cx + rx * j(1)) + ' ' + r1(cy + ry * k) + ' ' + r1(cx + rx * k) + ' ' + r1(cy + ry * j(2)) + ' ' + cx + ' ' + r1(cy + ry) +
        'C' + r1(cx - rx * k) + ' ' + r1(cy + ry * j(3)) + ' ' + r1(cx - rx * j(4)) + ' ' + r1(cy + ry * k) + ' ' + r1(cx - rx) + ' ' + cy +
        'C' + r1(cx - rx * j(5)) + ' ' + r1(cy - ry * k) + ' ' + r1(cx - rx * k) + ' ' + r1(cy - ry * j(6)) + ' ' + cx + ' ' + r1(cy - ry) +
        'C' + r1(cx + rx * k) + ' ' + r1(cy - ry * j(7)) + ' ' + r1(cx + rx * j(8)) + ' ' + r1(cy - ry * k) + ' ' + r1(cx + rx + 1.5) + ' ' + r1(cy + 2);
      return shape(d, o);
    },
    path: function (d, o) { return shape(d, o); },
    /* ruler-straight pieces for figures that must be exact (PAT views, grids): a segment, a closed polygon, a rectangle */
    seg: function (x1, y1, x2, y2, o) { return shape('M' + r1(x1) + ' ' + r1(y1) + 'L' + r1(x2) + ' ' + r1(y2), o); },
    poly: function (pts, o) { return shape('M' + pts.map(function (p) { return r1(p[0]) + ' ' + r1(p[1]); }).join('L') + 'Z', o); },
    rect: function (x, y, w, h, o) { return shape('M' + r1(x) + ' ' + r1(y) + 'h' + r1(w) + 'v' + r1(h) + 'h' + r1(-w) + 'Z', o); },
    dot: function (cx, cy, r, o) { return '<circle class="bd-f" cx="' + cx + '" cy="' + cy + '" r="' + (r || 7) + '" fill="' + c(o) + '"/>'; },
    /* a swipe of highlighter behind a label */
    hi: function (x, y, w, h, o) {
      return '<path class="bd-hi" pathLength="1" d="M' + x + ' ' + r1(y + h / 2 + 2) + seg(x, y + h / 2, x + w, y + h / 2 - 2, 5) + '" stroke="' + c(o, 'gold') + '" stroke-width="' + h + '" stroke-opacity="' + ((o && o.op) || 0.38) + '" fill="none"/>';
    },
    step: function (n) { return '<g data-step="' + n + '">' + Array.prototype.slice.call(arguments, 1).join('') + '</g>'; },
    svg: function () {
      return '<svg class="bd-svg" viewBox="0 0 720 560" role="img" xmlns="http://www.w3.org/2000/svg">' + Array.prototype.slice.call(arguments).join('') + '</svg>';
    },
    /* a small figure for a question (q.fig): 640 units wide, h tall, same marker kit */
    fig: function (h) {
      return '<svg class="bd-svg bd-figsvg" viewBox="0 0 640 ' + h + '" role="img" aria-label="Figure for this question" xmlns="http://www.w3.org/2000/svg">' + Array.prototype.slice.call(arguments, 1).join('') + '</svg>';
    }
  };

  /* ---------------- registry ---------------- */
  function add(b) { if (!b || !b.id) return; if (!BOARDS[b.id]) ORDER.push(b.id); BOARDS[b.id] = b; }
  function get(id) { return BOARDS[id] || null; }
  function list() { return ORDER.map(get); }
  function url(id, from) { return '/see/?b=' + encodeURIComponent(id) + (from ? '&from=' + encodeURIComponent(from) : ''); }

  /* The game a board ends on. Its own feed first (tug, flick, then pathway), else a borrowed one. */
  var GAMES = { tug: ['Q vs K Tug', '/see/tug/?d='], flick: ['Trend Flick', '/see/flick/?d='], path: ['Pathway Builder', '/see/pathway/?p='] };
  function play(b) {
    if (!b) return null;
    var g = b.tug ? 'tug' : b.flick ? 'flick' : b.path ? 'path' : null, id = b.id;
    if (!g && b.play) { var p = String(b.play).split(':'); g = p[0]; id = p[1]; var src = get(id); if (!GAMES[g] || !src || !src[g]) return null; }
    if (!g) return null;
    return { game: g, id: id, label: 'Play a round: ' + GAMES[g][0], href: GAMES[g][1] + encodeURIComponent(id) };
  }

  var api = { version: 2, add: add, get: get, list: list, url: url, kit: kit, SECTION: SECTION, files: FILES, play: play, GAMES: GAMES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (!root) return;
  root.AceBoard = api;
  if (typeof document === 'undefined') return;

  /* ---------------- loading ---------------- */
  var waiting = null, loaded = false;
  function ready(cb) {
    if (loaded) { cb(); return; }
    if (waiting) { waiting.push(cb); return; }
    waiting = [cb];
    if (!document.querySelector('link[href*="/shared/ace-board.css"]')) {
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/shared/ace-board.css?v=' + V; document.head.appendChild(l);
    }
    var need = FILES.filter(function (f) { return !document.querySelector('script[src*="/shared/boards/' + f + '.js"]'); }), left = need.length;
    function done() { if (--left > 0) return; loaded = true; var w = waiting; waiting = null; w.forEach(function (f) { f(); }); }
    if (!left) { left = 1; done(); return; }
    need.forEach(function (f) { var s = document.createElement('script'); s.src = '/shared/boards/' + f + '.js?v=' + V; s.onload = done; s.onerror = done; document.head.appendChild(s); });
  }
  api.ready = ready;
  /* Board markup (_{sub}, ^{sup}) as plain HTML, for captions and for the Pathway Builder. */
  api.html = function (x) { return fmt(x).replace(/<tspan dy="(-?)[\d.]+em" font-size="68%">([^<]*)<\/tspan>/g, function (m, neg, t) { return neg ? '<sup>' + t + '</sup>' : '<sub>' + t + '</sub>'; }).replace(/<\/?tspan[^>]*>/g, ''); };

  /* ---------------- the four beats ---------------- */
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function note(name, data) { try { if (root.AceRecord && root.AceRecord.event) root.AceRecord.event(name, data); } catch (e) { /* the board works without the record */ } }
  var reduced = function () { try { return root.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };

  function mount(host, id, o) {
    o = o || {};
    var b = get(id);
    host.textContent = '';
    if (!b) { host.appendChild(el('p', 'bd-missing', 'That board is not here. Open the gallery to pick another.')); return null; }
    var wrap = el('section', 'bd'); wrap.setAttribute('data-board', b.id); wrap.setAttribute('data-section', b.section);
    var head = el('header', 'bd-head');
    head.appendChild(el('p', 'bd-kicker', (SECTION[b.section] || '') + ' · Whiteboard'));
    var title = el(o.heading || 'h2', 'bd-title', b.title); title.id = 'bd-title-' + b.id; head.appendChild(title);
    if (b.sub) head.appendChild(el('p', 'bd-sub', b.sub));
    var beats = el('ol', 'bd-beats'); beats.setAttribute('aria-label', 'Steps on this board');
    ['Board', 'Predict', 'Reveal', 'Try it'].forEach(function (n) { beats.appendChild(el('li', null, n)); });
    head.appendChild(beats);
    wrap.appendChild(head);
    var main = el('div', 'bd-main');
    var board = el('div', 'bd-board'); board.innerHTML = b.svg;
    var svg = board.querySelector('svg'); if (svg) svg.setAttribute('aria-label', b.title + ': ' + (b.sub || 'whiteboard drawing'));
    var tray = el('div', 'bd-tray'); tray.setAttribute('aria-hidden', 'true'); tray.innerHTML = '<i></i><i></i><i></i><i></i>'; board.appendChild(tray);
    var panel = el('div', 'bd-panel'); panel.setAttribute('aria-live', 'polite');
    main.appendChild(board); main.appendChild(panel); wrap.appendChild(main); host.appendChild(wrap);

    var groups = {}, nSteps = 0;
    Array.prototype.forEach.call(board.querySelectorAll('[data-step]'), function (g) { var k = +g.getAttribute('data-step'); (groups[k] = groups[k] || []).push(g); if (k > nSteps) nSteps = k; });
    nSteps = Math.min(nSteps, (b.steps || []).length) || (b.steps || []).length;
    function setBeat(k) { wrap.setAttribute('data-beat', ['board', 'predict', 'reveal', 'try', 'done'][k]); Array.prototype.forEach.call(beats.children, function (li, i) { li.setAttribute('data-state', i < k ? 'done' : i === k ? 'on' : 'todo'); }); }
    function showStep(k, animate) {
      for (var i = 1; i <= nSteps; i++) (groups[i] || []).forEach(function (g) {
        var on = i <= k; g.setAttribute('data-on', on ? 'true' : 'false'); g.classList.remove('bd-draw');
        if (on && i === k && animate && !reduced()) {
          var n = 0; Array.prototype.forEach.call(g.querySelectorAll('.bd-s, .bd-hi, .bd-t, .bd-f'), function (x) { x.style.setProperty('--i', n++); });
          void g.getBoundingClientRect(); g.classList.add('bd-draw');
        }
      });
    }
    function choices(q, onPick) {
      var box = el('div', 'bd-choices'); box.setAttribute('role', 'group');
      q.choices.forEach(function (text, i) {
        var btn = el('button', 'bd-choice'); btn.type = 'button';
        btn.appendChild(el('b', null, LETTERS[i])); var sp = el('span'); sp.innerHTML = html(text); btn.appendChild(sp);
        btn.addEventListener('click', function () {
          if (box.getAttribute('data-done')) return; box.setAttribute('data-done', 'true');
          Array.prototype.forEach.call(box.children, function (x, j) { x.disabled = true; if (j === q.answer) x.setAttribute('data-state', 'right'); else if (j === i) x.setAttribute('data-state', 'wrong'); });
          onPick(i === q.answer, i);
        });
        box.appendChild(btn);
      });
      return box;
    }
    function html(s) { return fmt(s).replace(/<tspan dy="(-?)[\d.]+em" font-size="68%">([^<]*)<\/tspan>/g, function (m, neg, t) { return neg ? '<sup>' + t + '</sup>' : '<sub>' + t + '</sub>'; }).replace(/<\/?tspan[^>]*>/g, ''); }
    function figure(q) { if (!q.fig) return; var f = el('div', 'bd-fig'); f.innerHTML = q.fig; panel.appendChild(f); }
    function para(cls, s) { var p = el('p', cls); p.innerHTML = html(s); return p; }
    function primary(label, fn) { var x = el('button', 'bd-btn', label); x.type = 'button'; x.addEventListener('click', fn); return x; }
    function quiet(label, fn) { var x = el('button', 'bd-btn bd-btn--quiet', label); x.type = 'button'; x.addEventListener('click', fn); return x; }

    function predict() {
      setBeat(1); showStep(0); panel.textContent = '';
      panel.appendChild(el('p', 'bd-label', 'Predict'));
      panel.appendChild(para('bd-q', b.predict.q));
      figure(b.predict);
      var fb = el('div', 'bd-fb'); fb.hidden = true;
      panel.appendChild(choices(b.predict, function (ok) {
        fb.appendChild(para('bd-verdict', ok ? 'Yes.' : 'Not quite.')); fb.firstChild.setAttribute('data-ok', String(ok));
        fb.appendChild(para('bd-why', b.predict.why));
        var go = primary('Draw it', function () { reveal(1); }); fb.appendChild(go); fb.hidden = false; go.focus();
        note('board-predict', { board: b.id, ok: ok });
      }));
      panel.appendChild(fb);
    }
    function reveal(k) {
      setBeat(2); showStep(k, true); panel.textContent = '';
      panel.appendChild(el('p', 'bd-label', 'Reveal · step ' + k + ' of ' + nSteps));
      panel.appendChild(para('bd-say', b.steps[k - 1]));
      var row = el('div', 'bd-row');
      var next = primary(k < nSteps ? 'Next' : 'Try it', function () { if (k < nSteps) reveal(k + 1); else tryIt(0, 0); });
      row.appendChild(next);
      if (k > 1) row.appendChild(quiet('Back a step', function () { reveal(k - 1); }));
      panel.appendChild(row); next.focus();
    }
    function tryIt(k, score) {
      setBeat(3); showStep(nSteps); panel.textContent = '';
      var q = b.tryIt[k];
      panel.appendChild(el('p', 'bd-label', 'Try it · ' + (k + 1) + ' of ' + b.tryIt.length));
      panel.appendChild(para('bd-q', q.q));
      figure(q);
      var fb = el('div', 'bd-fb'); fb.hidden = true;
      panel.appendChild(choices(q, function (ok) {
        if (ok) score++;
        fb.appendChild(para('bd-verdict', ok ? 'Correct.' : 'Not this time.')); fb.firstChild.setAttribute('data-ok', String(ok));
        fb.appendChild(para('bd-why', q.why));
        var last = k + 1 >= b.tryIt.length;
        var go = primary(last ? 'Finish' : 'Next question', function () { if (last) done(score); else tryIt(k + 1, score); });
        fb.appendChild(go); fb.hidden = false; go.focus();
      }));
      panel.appendChild(fb);
    }
    function done(score) {
      setBeat(4); panel.textContent = '';
      note('board-done', { board: b.id, score: score, of: b.tryIt.length });
      try { var seen = JSON.parse(localStorage.getItem('acelabs.boards') || '{}'); seen[b.id] = { score: score, at: Date.now() }; localStorage.setItem('acelabs.boards', JSON.stringify(seen)); } catch (e) { /* private mode */ }
      panel.appendChild(el('p', 'bd-label', 'Board cleared'));
      panel.appendChild(el('p', 'bd-score', score + ' of ' + b.tryIt.length));
      panel.appendChild(el('p', 'bd-say', score === b.tryIt.length ? 'All three. This one is yours.' : 'Run the reveal once more, then try again tomorrow.'));
      var row = el('div', 'bd-row');
      var back = primary(o.backLabel || 'Back', function () { if (o.onBack) o.onBack(); else if (history.length > 1) history.back(); else location.href = '/see/'; });
      row.appendChild(back);
      row.appendChild(quiet('Replay', function () { predict(); }));
      panel.appendChild(row);
      var links = el('div', 'bd-links');
      var pl = play(b);
      if (pl) { var a = el('a', 'bd-link bd-link--play', pl.label); a.href = pl.href; a.setAttribute('data-play', pl.game); links.appendChild(a); }
      if (b.path && pl && pl.game !== 'path') { var a3 = el('a', 'bd-link', 'Pathway Builder'); a3.href = '/see/pathway/?p=' + encodeURIComponent(b.id); links.appendChild(a3); }
      (b.more || []).forEach(function (m) { var a2 = el('a', 'bd-link', m.label); a2.href = m.href; links.appendChild(a2); });
      if (!o.sheet) { var g = el('a', 'bd-link', 'All whiteboards'); g.href = '/see/'; links.appendChild(g); }
      panel.appendChild(links); back.focus();
    }
    predict();
    note('board-open', { board: b.id, from: o.from || '' });
    return { root: wrap, board: b, predict: predict, reveal: reveal, tryIt: tryIt, done: done, steps: nSteps };
  }
  api.mount = mount;

  /* ---------------- bottom sheet ---------------- */
  var sheet = null;
  function close() {
    if (!sheet) return;
    var s = sheet; sheet = null;
    document.removeEventListener('keydown', s.key, true);
    document.documentElement.classList.remove('bd-lock');
    s.root.setAttribute('data-open', 'false');
    setTimeout(function () { if (s.root.parentNode) s.root.parentNode.removeChild(s.root); }, reduced() ? 0 : 220);
    if (s.opener && s.opener.focus) try { s.opener.focus(); } catch (e) { /* gone */ }
  }
  function open(id, o) {
    o = o || {};
    close();
    var rootEl = el('div', 'bd-sheet'); rootEl.setAttribute('data-open', 'false');
    var back = el('div', 'bd-sheet__shade'); back.addEventListener('click', close);
    var card = el('div', 'bd-sheet__card'); card.setAttribute('role', 'dialog'); card.setAttribute('aria-modal', 'true'); card.setAttribute('aria-label', 'Whiteboard');
    var bar = el('div', 'bd-sheet__bar');
    var full = el('a', 'bd-sheet__full', 'Open full page'); full.href = url(id, o.from);
    var x = el('button', 'bd-sheet__close', 'Close'); x.type = 'button'; x.addEventListener('click', close);
    bar.appendChild(full); bar.appendChild(x);
    var body = el('div', 'bd-sheet__body'); body.appendChild(el('p', 'bd-loading', 'Drawing the board...'));
    card.appendChild(bar); card.appendChild(body); rootEl.appendChild(back); rootEl.appendChild(card);
    document.body.appendChild(rootEl);
    document.documentElement.classList.add('bd-lock');
    var s = sheet = { root: rootEl, opener: document.activeElement, key: function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
      if (e.key !== 'Tab') return;
      var f = card.querySelectorAll('a[href], button:not([disabled])'); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!card.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    } };
    document.addEventListener('keydown', s.key, true);
    ready(function () {
      if (sheet !== s) return;
      mount(body, id, { from: o.from, sheet: true, backLabel: o.backLabel || 'Back to my question', onBack: close });
      requestAnimationFrame(function () { rootEl.setAttribute('data-open', 'true'); x.focus(); });
    });
    return s;
  }
  api.open = open; api.close = close;
})(typeof window !== 'undefined' ? window : null);
