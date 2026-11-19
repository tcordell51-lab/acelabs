/* ace-walkthrough.js : the miss walkthrough. Styles: /shared/ace-walkthrough.css.

   When a student misses, AceWalk.open() shows a whiteboard panel. It opens on the trap in the
   choice they picked, then draws the solution step by step in a hand-marker look (every stroke
   and number drawn in code by the page), then offers "Try 3 more like this". Every explanation
   follows docs/EXPLANATION-STANDARD.md: answer, trick, 3 to 5 steps, the trap, check yourself,
   sources (collapsed).

   AceWalk.open({
     id: 'gc-galvanic-direction',            one id per walkthrough: the log and the voice slot use it
     title: 'Which way the electrons go',
     item: { id, section, topic, topicName, skill },   the missed item (for the log)
     picked: 'rl',                           the student's pick, a key of explain.traps (null: no trap card)
     explain: { answer, trick: { text, src } or { text, draft: true },
                steps: [{ text, frame }], traps: { key: text }, check: { q, a }, sources: [text] },
     board: { w: 600, h: 800, label, base: [ops], frames: [[ops], ...] },   frames[i] goes with steps[i]
     voice: { src: null },                   Thomas's clip for this walkthrough; null shows the empty slot
     more: { n: 3, family, subtopic, poolIds: [ids], generate: function (k) { return item; } },
     routes: [{ label, href }],              where a second miss goes (whiteboard notes, trick board)
     opener: element,                        focus goes back here on close
     onClose: function () {}
   });

   Text marks (steps, answer, board text): **bold** (one key term per step), x_2 or x_{10} for a
   subscript, x^2 or x^{2+} for a superscript. Nothing else is parsed; no HTML is taken from data.

   Board ops, drawn with a small seeded wobble so they look hand drawn:
     { k: 'line', x1, y1, x2, y2, c, sw, arrow }    arrow: 'end' | 'start' | 'both'; sw: stroke width
     { k: 'path', d, c, sw, arrow }  (d: M and L commands only, so the wobble can follow it)
     { k: 'rect', x, y, w, h, c }   { k: 'circle', cx, cy, r, c }   { k: 'ellipse', cx, cy, rx, ry, c }
     { k: 'text', x, y, t, s, c, f, a }   f: 'hand' (Kalam) or 'mark' (Permanent Marker); a: text-anchor
     { k: 'cross', x, y, r, c }            a hand X
     rect and ellipse take fill (a FILL name) and ink: false for a fill with no outline
     c: forest | gold | red | blue | green | ink | muted; fill: a light fill color name or none

   Motion: each Next draws that step's ink (stroke draw) and writes its text (left-to-right wipe).
   Back jumps, Replay redraws the current step. prefers-reduced-motion: every frame is drawn at
   once, every step is listed, nothing moves.

   Log (shared/ace-record.js, the one progress record; no new storage):
     AceRecord.event('walk-open',     { walk, item, picked, trap })
     AceRecord.event('walk-complete', { walk, item, steps, ms })      the last step was reached
     AceRecord.record(...)            each follow-up answer, src 'walk-more', set = walk id
     AceRecord.event('walk-more-done',{ walk, item, family, right, n, routed })
     AceRecord.event('walk-route',    { walk, href })                 a route link was opened */
(function (root) {
  'use strict';

  /* ---------------- pure helpers (node: require('./ace-walkthrough.js')) ---------------- */
  var LIMITS = { lineChars: 80, stepWords: 12, stepWordsMax: 14, stepsMin: 3, stepsMax: 5, trapLines: 2 };

  function plain(s) { return String(s == null ? '' : s).replace(/\*\*/g, '').replace(/[_^]\{([^}]*)\}/g, '$1').replace(/[_^](\S)/g, '$1'); }
  function words(s) { var t = plain(s).trim(); return t ? t.split(/\s+/).length : 0; }
  function sentences(s) { var t = plain(s).trim(); if (!t) return 0; return t.split(/(?<=[.!?])\s+(?=[A-Z0-9"(])/).length; }
  function lines(s) { return Math.ceil(plain(s).length / LIMITS.lineChars) || 0; }

  /* The standard, as code: the same rules scripts/lint-explanations.mjs applies. */
  var GLYPHS = /[\u2014\u2600-\u27BF\u2B00-\u2BFF\u2713-\u2718\u2605\u2606]|[\uD83C-\uDBFF][\uDC00-\uDFFF]/;
  function validate(ex) {
    var p = [];
    function chk(name, s, maxLines) {
      if (!s) { p.push('missing ' + name); return; }
      if (/\u2014/.test(s)) p.push(name + ': em dash');
      if (GLYPHS.test(String(s).replace(/\u2014/g, ''))) p.push(name + ': glyph or emoji');
      if (lines(s) > maxLines) p.push(name + ': over ' + maxLines + ' line' + (maxLines > 1 ? 's' : '') + ' (' + plain(s).length + ' chars)');
      if (sentences(s) > 2) p.push(name + ': more than 2 sentences');
    }
    if (!ex) return ['missing explanation'];
    chk('answer', ex.answer, 1);
    var tr = ex.trick && ex.trick.text;
    chk('trick', tr, 1);
    if (ex.trick && !ex.trick.src && !ex.trick.draft) p.push('trick: needs a recorded source or draft: true');
    var st = ex.steps || [];
    if (st.length < LIMITS.stepsMin || st.length > LIMITS.stepsMax) p.push('steps: ' + st.length + ' (want 3 to 5)');
    st.forEach(function (s, i) {
      var t = typeof s === 'string' ? s : s.text;
      chk('step ' + (i + 1), t, 1);
      if (words(t) > LIMITS.stepWordsMax) p.push('step ' + (i + 1) + ': ' + words(t) + ' words (about 12 max)');
      var b = (String(t).match(/\*\*/g) || []).length / 2;
      if (b > 1) p.push('step ' + (i + 1) + ': more than one bold term');
    });
    var traps = ex.traps || {};
    if (!Object.keys(traps).length) p.push('missing traps (one per wrong choice)');
    Object.keys(traps).forEach(function (k) { if (traps[k] != null) chk('trap ' + k, traps[k], LIMITS.trapLines); });
    if (!ex.check || !ex.check.q) p.push('missing check yourself');
    else { chk('check', ex.check.q, 1); if (ex.check.a) chk('check answer', ex.check.a, 1); }
    if (!ex.sources || !ex.sources.length) p.push('missing sources');
    return p;
  }

  /* Rich text runs: [{ t, k }] with k 0 normal, 1 superscript, -1 subscript, b true for bold. */
  function runs(s) {
    var out = [], bold = false, i = 0, buf = '';
    s = String(s == null ? '' : s);
    function push(t, k) { if (t) out.push({ t: t, k: k, b: bold }); }
    while (i < s.length) {
      if (s[i] === '*' && s[i + 1] === '*') { push(buf, 0); buf = ''; bold = !bold; i += 2; continue; }
      if ((s[i] === '_' || s[i] === '^') && i + 1 < s.length && s[i + 1] !== ' ') {
        var k = s[i] === '^' ? 1 : -1, t;
        if (s[i + 1] === '{') { var j = s.indexOf('}', i); if (j < 0) j = s.length; t = s.slice(i + 2, j); i = j + 1; }
        else { t = s[i + 1]; i += 2; }
        push(buf, 0); buf = ''; push(t, k); continue;
      }
      buf += s[i]; i++;
    }
    push(buf, 0);
    return out;
  }

  /* Seeded random (mulberry32) so a board draws the same wobble every time. */
  function rng(seed) { var a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* "Try 3 more like this": approved bank items first (same subtopic and trap family, by id or by
     tag), then generated variants with keys computed in code. Never the missed item itself. */
  function pickMore(o) {
    o = o || {}; var n = o.n || 3, out = [], seen = {};
    (o.exclude || []).forEach(function (id) { seen[String(id)] = 1; });
    var ids = {}; (o.poolIds || []).forEach(function (id) { ids[String(id)] = 1; });
    (o.pool || []).forEach(function (it) {
      if (out.length >= n || !it || seen[String(it.id)] || !Array.isArray(it.choices) || it.choices.length !== 5) return;
      var byId = ids[String(it.id)], byTag = o.subtopic && it.skill === o.subtopic && o.family && (it.trapFamily === o.family || (it.trapFamilies || []).indexOf(o.family) >= 0);
      if (byId || byTag) { out.push(it); seen[String(it.id)] = 1; }
    });
    for (var k = 0; out.length < n && k < n * 6 && o.generate; k++) {
      var g = o.generate(k);
      if (g && !seen[String(g.id)]) { out.push(g); seen[String(g.id)] = 1; }
    }
    return out;
  }

  var api = { LIMITS: LIMITS, GLYPHS: GLYPHS, plain: plain, words: words, sentences: sentences, lines: lines, validate: validate, runs: runs, rng: rng, pickMore: pickMore };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;
  if (root.AceWalk) return;

  /* ---------------- drawing ---------------- */
  var NS = 'http://www.w3.org/2000/svg';
  var INK = { forest: '#1B3A2D', gold: '#B08A2E', red: '#b0503b', blue: '#3f5f86', green: '#2f7d4a', ink: '#16261E', muted: '#6b736d' };
  var TXT = { forest: '#1B3A2D', gold: '#7c6113', red: '#9a3b2e', blue: '#34506f', green: '#226338', ink: '#16261E', muted: '#555e58' };
  var FILL = { gold: 'rgba(201,168,76,.22)', green: 'rgba(47,125,74,.12)', blue: 'rgba(63,95,134,.14)', red: 'rgba(176,80,59,.12)', cream: '#FFFDF8', copper: 'rgba(197,106,60,.55)', metal: 'rgba(120,126,132,.45)', sol: 'rgba(127,182,214,.30)' };
  var reduced = !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function sv(tag, attrs) { var n = document.createElementNS(NS, tag); Object.keys(attrs || {}).forEach(function (k) { if (attrs[k] != null) n.setAttribute(k, attrs[k]); }); return n; }
  function r1(x) { return Math.round(x * 10) / 10; }
  function wob(R, a) { return (R() - 0.5) * 2 * a; }

  // a hand line: a gentle quadratic with a wobble in the middle and a hair of overshoot
  function handSeg(x1, y1, x2, y2, R, first) {
    var dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / L, ny = dx / L;
    var bow = wob(R, Math.min(4, L * 0.02)), mx = (x1 + x2) / 2 + nx * bow, my = (y1 + y2) / 2 + ny * bow;
    var ox = dx / L * 1.5, oy = dy / L * 1.5;
    return (first ? 'M' + r1(x1 - ox) + ',' + r1(y1 - oy) : 'L' + r1(x1) + ',' + r1(y1)) + ' Q' + r1(mx) + ',' + r1(my) + ' ' + r1(x2 + ox) + ',' + r1(y2 + oy);
  }
  function polyPts(d) { var pts = [], m, re = /[ML]\s*(-?[\d.]+)[ ,]\s*(-?[\d.]+)/g; while ((m = re.exec(d))) pts.push([+m[1], +m[2]]); return pts; }
  function handPoly(pts, R) { var d = ''; for (var i = 1; i < pts.length; i++) d += (i === 1 ? '' : ' ') + handSeg(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], R, i === 1); return d; }
  function handEllipse(cx, cy, rx, ry, R) {
    // four quarter arcs, a little off true, ending past the start like a marker loop
    var a0 = -Math.PI / 2 + wob(R, 0.25), d = '', steps = 44, over = 0.12;
    for (var i = 0; i <= steps; i++) {
      var a = a0 + (Math.PI * 2 + over) * i / steps, k = 1 + wob(R, 0.008) + 0.012 * Math.sin(i * 0.5);
      var x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k;
      d += (i ? ' L' : 'M') + r1(x) + ',' + r1(y);
    }
    return d;
  }
  function arrowHead(x1, y1, x2, y2, size) {
    var a = Math.atan2(y2 - y1, x2 - x1), s = size || 16, w = 0.5;
    return 'M' + r1(x2 - s * Math.cos(a - w)) + ',' + r1(y2 - s * Math.sin(a - w)) + ' L' + r1(x2) + ',' + r1(y2) + ' L' + r1(x2 - s * Math.cos(a + w)) + ',' + r1(y2 - s * Math.sin(a + w));
  }

  function textEl(op) {
    var size = op.s || 30, fam = op.f === 'mark' ? "'Permanent Marker ACE', 'Kalam ACE', cursive" : "'Kalam ACE', 'Comic Sans MS', cursive";
    var t = sv('text', { x: op.x, y: op.y, 'font-size': size, 'font-family': fam, 'font-weight': op.f === 'mark' ? 400 : 700, fill: TXT[op.c || 'ink'] || op.c, 'text-anchor': op.a || 'start', 'class': 'wb-write' });
    var shift = 0;
    runs(op.t).forEach(function (r) {
      var ts = sv('tspan', {}); ts.textContent = r.t;
      var want = r.k === 1 ? -0.38 : r.k === -1 ? 0.22 : 0;
      if (want !== shift) { ts.setAttribute('dy', (want - shift) + 'em'); shift = want; }
      if (r.k) ts.setAttribute('font-size', Math.round(size * 0.68));
      t.appendChild(ts);
    });
    if (shift) { var tail = sv('tspan', { dy: (-shift) + 'em' }); tail.textContent = '​'; t.appendChild(tail); }
    return t;
  }

  function drawOp(op, seed) {
    var R = rng(seed), g = sv('g', { 'class': 'wb-op' }), col = INK[op.c || 'forest'] || op.c, w = op.sw || (op.k === 'rect' ? 0 : op.w) || 5;
    function ink(d, extra) { var p = sv('path', Object.assign({ d: d, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'class': 'wb-ink' }, extra || {})); g.appendChild(p); return p; }
    function fillUnder(d) { if (op.fill && FILL[op.fill]) g.appendChild(sv('path', { d: d, fill: FILL[op.fill], stroke: 'none', 'class': 'wb-fill' })); }
    if (op.k === 'text') { g.appendChild(textEl(op)); return g; }
    if (op.k === 'line' || op.k === 'path') {
      var pts = op.k === 'line' ? [[op.x1, op.y1], [op.x2, op.y2]] : polyPts(op.d);
      if (op.fill) fillUnder('M' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' L') + ' Z');
      ink(handPoly(pts, R), op.dash ? { 'stroke-dasharray': op.dash, 'class': 'wb-ink wb-dashed' } : null);
      var n = pts.length;
      if (op.arrow === 'end' || op.arrow === 'both') ink(arrowHead(pts[n - 2][0], pts[n - 2][1], pts[n - 1][0], pts[n - 1][1], op.head));
      if (op.arrow === 'start' || op.arrow === 'both') ink(arrowHead(pts[1][0], pts[1][1], pts[0][0], pts[0][1], op.head));
      return g;
    }
    if (op.k === 'rect') {
      var x = op.x, y = op.y, X = op.x + op.w, Y = op.y + op.h;
      fillUnder('M' + x + ',' + y + ' L' + X + ',' + y + ' L' + X + ',' + Y + ' L' + x + ',' + Y + ' Z');
      if (op.ink !== false) ink(handPoly([[x, y], [X, y], [X, Y], [x, Y], [x, y + 2]], R));
      return g;
    }
    if (op.k === 'circle' || op.k === 'ellipse') {
      var rx = op.k === 'circle' ? op.r : op.rx, ry = op.k === 'circle' ? op.r : op.ry;
      if (op.fill && FILL[op.fill]) g.appendChild(sv('ellipse', { cx: op.cx, cy: op.cy, rx: rx, ry: ry, fill: FILL[op.fill], stroke: 'none', 'class': 'wb-fill' }));
      if (op.ink !== false) ink(handEllipse(op.cx, op.cy, rx, ry, R));
      return g;
    }
    if (op.k === 'cross') {
      var s = op.r || 16;
      ink(handSeg(op.x - s, op.y - s, op.x + s, op.y + s, R, true));
      ink(handSeg(op.x + s, op.y - s, op.x - s, op.y + s, R, true));
      return g;
    }
    return g;
  }

  /* Animate one frame group: strokes draw in order, then text wipes in. Returns the animations. */
  function animateFrame(fg, speed, start) {
    var anims = [], t = start || 0;
    Array.prototype.forEach.call(fg.querySelectorAll('.wb-op'), function (opg) {
      Array.prototype.forEach.call(opg.querySelectorAll('.wb-fill'), function (f) {
        anims.push(f.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: t, fill: 'both' }));
      });
      Array.prototype.forEach.call(opg.querySelectorAll('.wb-ink'), function (p) {
        var len = 0; try { len = p.getTotalLength(); } catch (e) { len = 0; }
        if (!len) return;
        var dur = Math.max(160, Math.min(900, len * 1.6)) / speed, dashed = p.classList.contains('wb-dashed');
        if (dashed) { anims.push(p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur, delay: t, fill: 'both' })); t += dur * 0.9; return; }
        p.style.strokeDasharray = len + ' ' + len;
        var a = p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: dur, delay: t, fill: 'both', easing: 'ease-out' });
        a.onfinish = function () { p.style.strokeDasharray = ''; };
        anims.push(a); t += dur * 0.85;
      });
      Array.prototype.forEach.call(opg.querySelectorAll('.wb-write'), function (tx) {
        var n = (tx.textContent || '').length, dur = Math.max(260, Math.min(1100, n * 34)) / speed;
        anims.push(tx.animate([{ clipPath: 'inset(-20% 100% -20% 0)' }, { clipPath: 'inset(-20% 0% -20% 0)' }], { duration: dur, delay: t, fill: 'both', easing: 'linear' }));
        t += dur * 0.9;
      });
    });
    anims.total = t;
    return anims;
  }

  /* ---------------- the panel ---------------- */
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  // rich text into HTML nodes: <b>, <sub>, <sup> only, built as nodes (no innerHTML from data)
  function rich(host, s) {
    runs(s).forEach(function (r) {
      var node = document.createTextNode(r.t);
      if (r.k) { var w = document.createElement(r.k === 1 ? 'sup' : 'sub'); w.appendChild(node); node = w; }
      if (r.b) { var b = document.createElement('b'); b.appendChild(node); node = b; }
      host.appendChild(node);
    });
    return host;
  }
  function richEl(tag, cls, s) { return rich(el(tag, cls), s); }
  function log(name, data) { try { if (root.AceRecord) root.AceRecord.event(name, data); } catch (e) { /* logging never blocks */ } }

  var openPanel = null;
  function open(o) {
    if (openPanel) openPanel.close(true);
    o = o || {};
    var ex = o.explain || {}, steps = (ex.steps || []).map(function (s) { return typeof s === 'string' ? { text: s } : s; });
    var board = o.board || { w: 600, h: 600, frames: [] };
    var t0 = Date.now(), step = -1, anims = [], completed = false, opener = o.opener || document.activeElement;
    var trapText = o.picked != null && ex.traps ? ex.traps[o.picked] : null;
    var item = o.item || {};
    log('walk-open', { walk: o.id || '', item: item.id || '', picked: o.picked == null ? null : o.picked, trap: trapText ? 1 : 0 });

    var wrap = el('div', 'awk'); wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true');
    var tid = 'awk-t-' + Math.random().toString(36).slice(2, 8); wrap.setAttribute('aria-labelledby', tid);
    var sheet = el('div', 'awk__sheet'); wrap.appendChild(sheet);
    var head = el('header', 'awk__head');
    var hl = el('div'); hl.appendChild(el('p', 'awk__kick', 'Walk it through'));
    var h = el('h2', 'awk__title', o.title || 'Walk it through'); h.id = tid; hl.appendChild(h);
    var x = el('button', 'awk__x', 'Close'); x.type = 'button';
    head.appendChild(hl); head.appendChild(x); sheet.appendChild(head);

    if (trapText) {
      var trap = el('section', 'awk__card awk__trap'); trap.setAttribute('aria-label', 'The trap in your pick');
      trap.appendChild(el('p', 'awk__k', 'The trap in your pick'));
      trap.appendChild(richEl('p', 'awk__line', trapText)); sheet.appendChild(trap);
    }
    var top = el('div', 'awk__top');
    if (ex.answer) { var an = el('section', 'awk__card awk__answer'); an.appendChild(el('p', 'awk__k', 'The answer')); an.appendChild(richEl('p', 'awk__line', ex.answer)); top.appendChild(an); }
    if (ex.trick && ex.trick.text) {
      var tr = el('section', 'awk__card awk__trick'); tr.appendChild(el('p', 'awk__k', ex.trick.draft ? 'The trick' : "Thomas's trick"));
      tr.appendChild(richEl('p', 'awk__line', ex.trick.draft ? ex.trick.text : '“' + ex.trick.text + '”'));
      tr.appendChild(el('p', 'awk__tag', ex.trick.draft ? 'Draft trick, Thomas to approve' : ex.trick.approved ? 'His recorded line, approved' : 'His recorded line'));
      top.appendChild(tr);
    }
    sheet.appendChild(top);

    var body = el('div', 'awk__body');
    var bwrap = el('figure', 'awk__board');
    var svg = sv('svg', { viewBox: '0 0 ' + (board.w || 600) + ' ' + (board.h || 600), role: 'img', 'aria-label': board.label || 'Whiteboard', 'class': 'awk__svg' });
    bwrap.appendChild(svg); body.appendChild(bwrap);
    var side = el('div', 'awk__side');
    var count = el('p', 'awk__count'); count.setAttribute('aria-live', 'polite'); side.appendChild(count);
    var ol = el('ol', 'awk__steps');
    var lis = steps.map(function (s, i) { var li = richEl('li', null, s.text); li.setAttribute('data-step', i + 1); ol.appendChild(li); return li; });
    side.appendChild(ol);
    var ctl = el('div', 'awk__ctl');
    var back = el('button', 'awk__btn awk__btn--quiet', 'Back'), next = el('button', 'awk__btn', 'Next step'), replay = el('button', 'awk__btn awk__btn--quiet', 'Replay');
    [back, next, replay].forEach(function (b) { b.type = 'button'; ctl.appendChild(b); });
    side.appendChild(ctl);
    var voice = el('section', 'awk__voice'); voice.setAttribute('data-voice-slot', o.id || '');
    voice.appendChild(el('p', 'awk__k', "Thomas's voice"));
    if (o.voice && o.voice.src) { var au = el('audio'); au.controls = true; au.preload = 'none'; au.src = o.voice.src; voice.appendChild(au); }
    else voice.appendChild(el('p', 'awk__muted', 'No clip yet. Thomas records this one.'));
    side.appendChild(voice);
    body.appendChild(side); sheet.appendChild(body);

    if (ex.check && ex.check.q) {
      var ck = el('section', 'awk__card awk__check'); ck.appendChild(el('p', 'awk__k', 'Check yourself'));
      ck.appendChild(richEl('p', 'awk__line', ex.check.q));
      if (ex.check.a) {
        var reveal = el('button', 'awk__btn awk__btn--quiet', 'Show answer'); reveal.type = 'button';
        var ans = richEl('p', 'awk__line awk__ans', ex.check.a); ans.hidden = true;
        reveal.addEventListener('click', function () { ans.hidden = false; reveal.hidden = true; });
        ck.appendChild(reveal); ck.appendChild(ans);
      }
      sheet.appendChild(ck);
    }
    var moreBox = el('section', 'awk__more');
    var moreBtn = el('button', 'awk__btn awk__btn--big', 'Try 3 more like this'); moreBtn.type = 'button';
    var moreHost = el('div', 'awk__more-host');
    if (o.more) { moreBox.appendChild(moreBtn); moreBox.appendChild(moreHost); sheet.appendChild(moreBox); }
    if (ex.sources && ex.sources.length) {
      var src = el('details', 'awk__src'); src.appendChild(el('summary', null, 'Sources'));
      var ul = el('ul'); ex.sources.forEach(function (s) { ul.appendChild(el('li', null, s)); }); src.appendChild(ul);
      sheet.appendChild(src);
    }

    // board content: base, then one group per frame
    var baseG = sv('g', { 'class': 'wb-base' }); svg.appendChild(baseG);
    (board.base || []).forEach(function (op, i) { baseG.appendChild(drawOp(op, 7 + i * 13)); });
    var frames = (board.frames || []).map(function (ops, fi) {
      var g = sv('g', { 'class': 'wb-frame', 'data-frame': fi + 1 });
      (ops || []).forEach(function (op, i) { g.appendChild(drawOp(op, 101 + fi * 97 + i * 13)); });
      g.style.display = 'none'; svg.appendChild(g); return g;
    });

    function stopAnims() { anims.concat(baseAnims).forEach(function (a) { try { a.finish(); } catch (e) { /* done */ } }); anims = []; baseAnims = []; }
    function show(k, animate, delay) {
      stopAnims();
      step = Math.max(0, Math.min(steps.length - 1, k));
      frames.forEach(function (g, i) {
        g.style.display = (reduced || i <= step) ? '' : 'none';
        g.classList.toggle('is-on', i === step); g.classList.toggle('is-past', i < step && !reduced);
      });
      lis.forEach(function (li, i) {
        li.hidden = !reduced && i > step;
        li.classList.toggle('is-on', i === step);
        if (i === step) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
      count.textContent = 'Step ' + (step + 1) + ' of ' + steps.length;
      svg.setAttribute('aria-label', (board.label ? board.label + '. ' : '') + 'Step ' + (step + 1) + ': ' + plain(steps[step] ? steps[step].text : ''));
      back.disabled = step === 0;
      next.textContent = step >= steps.length - 1 ? 'Done' : 'Next step';
      if (animate && !reduced && frames[step] && frames[step].animate) anims = animateFrame(frames[step], 1, delay || 0);
      if (step >= steps.length - 1 && !completed) {
        completed = true;
        log('walk-complete', { walk: o.id || '', item: item.id || '', steps: steps.length, ms: Date.now() - t0 });
        moreBtn.classList.add('is-ready');
      }
    }
    var baseAnims = [];
    function baseIn() { if (!reduced && baseG.animate) baseAnims = animateFrame(baseG, 2.4); return baseAnims.total || 0; }

    next.addEventListener('click', function () { if (step >= steps.length - 1) { moreBtn.focus(); moreBtn.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' }); return; } show(step + 1, true); });
    back.addEventListener('click', function () { show(step - 1, false); });
    replay.addEventListener('click', function () { show(step, true); });

    // follow-ups
    var moreState = null;
    moreBtn.addEventListener('click', function () {
      if (!o.more || moreState) return;
      if (!root.AceQuestion) { moreHost.textContent = 'Practice needs the question component on this page.'; return; }
      moreBtn.hidden = true;
      var m = o.more;
      Promise.resolve(m.pool ? m.pool() : []).catch(function () { return []; }).then(function (pool) {
        var list = pickMore({ n: m.n || 3, pool: pool, poolIds: m.poolIds, subtopic: m.subtopic, family: m.family, generate: m.generate, exclude: [item.id] });
        moreState = { list: list, i: 0, right: 0 };
        ask();
      });
    });
    function ask() {
      var st = moreState, it = st.list[st.i];
      moreHost.textContent = '';
      if (!it) return finish();
      var hostQ = el('div'); moreHost.appendChild(hostQ);
      root.AceQuestion.mount(hostQ, it, { number: st.i + 1, total: st.list.length, label: 'Like this one', nextLabel: st.i + 1 < st.list.length ? 'Next one' : 'See how you did', seeIt: false,
        onAnswer: function (res) {
          if (res.ok) st.right += 1;
          try { if (root.AceRecord) root.AceRecord.record({ item: it, picked: res.picked, answer: res.answer, ok: res.ok, ms: res.ms, src: 'walk-more', set: o.id || '', first: res.first, changes: res.changes, change: res.change, tool: 'walkthrough' }); } catch (e) { /* never block */ }
        },
        onNext: function () { st.i += 1; ask(); hostQ.scrollIntoView && moreHost.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' }); } });
    }
    function finish() {
      var st = moreState, n = st.list.length, missed = st.right < n;
      var box = el('section', 'awk__card ' + (missed ? 'awk__route' : 'awk__win'));
      box.appendChild(el('p', 'awk__k', missed ? 'Go back one level' : 'Cleared for now'));
      box.appendChild(el('p', 'awk__line', st.right + ' of ' + n + ' right. ' + (missed ? 'Open the notes, then come back to this one.' : 'It comes back on your review days.')));
      if (missed && o.routes && o.routes.length) {
        var ul = el('ul', 'awk__routes');
        o.routes.forEach(function (r) {
          var li = el('li'), a = el('a', 'awk__link', r.label); a.href = r.href;
          a.addEventListener('click', function () { log('walk-route', { walk: o.id || '', href: r.href }); if (/^#/.test(r.href)) close(); });
          li.appendChild(a); ul.appendChild(li);
        });
        box.appendChild(ul);
      }
      moreHost.appendChild(box);
      log('walk-more-done', { walk: o.id || '', item: item.id || '', family: (o.more && o.more.family) || '', right: st.right, n: n, routed: missed });
    }

    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') {   // keep focus inside the panel
        var f = Array.prototype.filter.call(sheet.querySelectorAll('button, a[href], summary, audio, [tabindex]'), function (n) { return !n.disabled && n.offsetParent !== null; });
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    }
    function close(silent) {
      stopAnims();
      document.removeEventListener('keydown', onKey, true);
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
      document.documentElement.classList.remove('awk-lock');
      openPanel = null;
      if (!silent && opener && opener.focus) try { opener.focus(); } catch (e) { /* gone */ }
      if (o.onClose) try { o.onClose(); } catch (e) { /* page code */ }
    }
    x.addEventListener('click', function () { close(); });
    wrap.addEventListener('click', function (e) { if (e.target === wrap) close(); });
    document.addEventListener('keydown', onKey, true);

    document.body.appendChild(wrap);
    document.documentElement.classList.add('awk-lock');
    if (reduced) wrap.classList.add('awk--still');
    var lead = baseIn(), keepBase = baseAnims;
    baseAnims = [];               // the first step draws right after the base, without cutting it short
    show(0, true, lead);
    baseAnims = keepBase;
    x.focus({ preventScroll: true });
    sheet.scrollTop = 0;
    openPanel = { close: close, el: wrap, show: show, step: function () { return step; } };
    return openPanel;
  }

  root.AceWalk = Object.assign({ version: 1, open: open, reduced: function () { return reduced; }, drawOp: drawOp }, api);
})(typeof window !== 'undefined' ? window : this);
