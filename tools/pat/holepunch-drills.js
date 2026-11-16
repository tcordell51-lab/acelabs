/* holepunch-drills.js : two short drills that come before the full hole punch problems (2026-11-16).

   1. The mirror effect. One fold, along a straight crease. A hole punched through the folded
      flap shows up twice when the paper opens: where you punched, and its mirror image across
      the crease, the same distance away on the other side.
   2. Diagonal folds. The paper is folded corner to corner. Across a diagonal crease a hole's row
      and column swap (main diagonal), or swap and flip (the other diagonal). A hole that sits on
      the crease itself stays single.

   Every item is computed from the geometry below; nothing is drawn by hand. The student taps
   every cell that will have a hole after unfolding, then Check draws each pair joined across the
   crease. Each answer is recorded through PatLedger (hole punching), so it counts in Progress and
   in Repair like any other PAT answer. Mounts into #hp-drills. */
(function () {
  'use strict';
  var host = document.getElementById('hp-drills'); if (!host) return;
  var INK = '#16241C', INK2 = '#6E7A70', BRASS = '#B08D3F', GOOD = '#2F7D52', BAD = '#B5482F', PAPER = '#FFFDF7', SHADE = '#E9E1CF';
  var N = 4, S = 46, PAD = 14;   // a 4 by 4 grid of hole positions, cell size in px
  var NS = 'http://www.w3.org/2000/svg';
  function rnd(n) { return Math.floor(Math.random() * n); }
  function key(p) { return p[0] + ',' + p[1]; }   // [col, row], 0 to 3

  /* Fold types. side(p): true when the cell is on the flap that folds over. mirror(p): its image. */
  var FOLDS = {
    v: { name: 'a vertical crease', drill: 'mirror', line: [[2, 0], [2, 4]], side: function (p) { return p[0] < 2; }, mirror: function (p) { return [3 - p[0], p[1]]; } },
    h: { name: 'a horizontal crease', drill: 'mirror', line: [[0, 2], [4, 2]], side: function (p) { return p[1] < 2; }, mirror: function (p) { return [p[0], 3 - p[1]]; } },
    d1: { name: 'the diagonal from top left to bottom right', drill: 'diag', line: [[0, 0], [4, 4]], side: function (p) { return p[0] > p[1]; }, on: function (p) { return p[0] === p[1]; }, mirror: function (p) { return [p[1], p[0]]; } },
    d2: { name: 'the diagonal from top right to bottom left', drill: 'diag', line: [[4, 0], [0, 4]], side: function (p) { return p[0] + p[1] < 3; }, on: function (p) { return p[0] + p[1] === 3; }, mirror: function (p) { return [3 - p[1], 3 - p[0]]; } }
  };
  var COPY = {
    mirror: { k: 'Drill 1 · The mirror effect', h: 'Every hole shows up twice', p: 'The flap folds over the crease, and the punch goes through both layers. When the paper opens, each hole appears where you punched it and again as its mirror image across the crease: same distance from the crease, other side.' },
    diag: { k: 'Drill 2 · Diagonal folds', h: 'Across a diagonal, row and column swap', p: 'Folded corner to corner, the mirror line runs at 45 degrees. A hole one cell right of the crease lands one cell below it (or above, for the other diagonal): its row and column trade places. A hole right on the crease stays single.' }
  };

  function make(drill) {
    var ids = drill === 'mirror' ? ['v', 'h'] : ['d1', 'd2'], f = FOLDS[ids[rnd(2)]];
    var flap = [];
    for (var c = 0; c < N; c++) for (var r = 0; r < N; r++) if (f.side([c, r]) || (f.on && f.on([c, r]))) flap.push([c, r]);
    // one or two punches on the folded paper (the flap side, or on a diagonal crease)
    var count = 1 + rnd(2), holes = [], used = {};
    while (holes.length < count) { var p = flap[rnd(flap.length)]; if (!used[key(p)]) { used[key(p)] = 1; holes.push(p); } }
    var answer = {};
    holes.forEach(function (p) { answer[key(p)] = 1; answer[key(f.mirror(p))] = 1; });
    return { fold: f, holes: holes, answer: answer };
  }

  function svg(w, h) { var s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 ' + w + ' ' + h); s.setAttribute('width', '100%'); s.style.maxWidth = w + 'px'; return s; }
  function add(parent, tag, attrs) { var n = document.createElementNS(NS, tag); for (var k in attrs) n.setAttribute(k, attrs[k]); parent.appendChild(n); return n; }
  function cx(c) { return PAD + c * S + S / 2; }
  function edge(v) { return PAD + v * S; }

  /* The folded paper: the flap has folded over, so the paper now covers only the packet (two
     layers, shaded). The dashed outline is where the flap was. Holes are punched through the packet. */
  var PACKET = { v: [[2, 0], [4, 0], [4, 4], [2, 4]], h: [[0, 2], [4, 2], [4, 4], [0, 4]], d1: [[0, 0], [0, 4], [4, 4]], d2: [[4, 0], [4, 4], [0, 4]] };
  function drawFolded(g, q) {
    var W = PAD * 2 + N * S, id = Object.keys(FOLDS).filter(function (k) { return FOLDS[k] === q.fold; })[0];
    var s = svg(W, W); s.setAttribute('aria-label', 'The paper folded along ' + q.fold.name + ', with ' + q.holes.length + ' hole' + (q.holes.length > 1 ? 's' : '') + ' punched through both layers');
    add(s, 'rect', { x: PAD, y: PAD, width: N * S, height: N * S, fill: 'none', stroke: INK2, 'stroke-width': 1.2, 'stroke-dasharray': '5 5', 'stroke-opacity': 0.6 });
    add(s, 'polygon', { points: PACKET[id].map(function (p) { return edge(p[0]) + ',' + edge(p[1]); }).join(' '), fill: SHADE, stroke: INK, 'stroke-width': 1.5 });
    for (var i = 1; i < N; i++) { add(s, 'line', { x1: edge(i), y1: PAD, x2: edge(i), y2: PAD + N * S, stroke: INK2, 'stroke-opacity': 0.18 }); add(s, 'line', { x1: PAD, y1: edge(i), x2: PAD + N * S, y2: edge(i), stroke: INK2, 'stroke-opacity': 0.18 }); }
    var L = q.fold.line;
    add(s, 'line', { x1: edge(L[0][0]), y1: edge(L[0][1]), x2: edge(L[1][0]), y2: edge(L[1][1]), stroke: BRASS, 'stroke-width': 3, 'stroke-dasharray': '8 6' });
    // a hole punched on the flap now sits over its mirror cell in the packet
    q.holes.forEach(function (p) { var at = q.fold.side(p) ? q.fold.mirror(p) : p; add(s, 'circle', { cx: cx(at[0]), cy: cx(at[1]), r: 11, fill: INK }); });
    g.appendChild(s);
  }

  /* The open paper: tap cells. After Check: the right cells, each pair joined across the crease. */
  function drawOpen(g, q, state, onTap) {
    var W = PAD * 2 + N * S;
    var s = svg(W, W); s.setAttribute('role', 'group'); s.setAttribute('aria-label', 'The unfolded paper. Tap every cell that will have a hole.');
    add(s, 'rect', { x: PAD, y: PAD, width: N * S, height: N * S, fill: PAPER, stroke: INK2, 'stroke-width': 1.5 });
    var L = q.fold.line;
    add(s, 'line', { x1: edge(L[0][0]), y1: edge(L[0][1]), x2: edge(L[1][0]), y2: edge(L[1][1]), stroke: BRASS, 'stroke-width': 2, 'stroke-dasharray': '4 6', 'stroke-opacity': 0.7 });
    for (var c = 0; c < N; c++) for (var r = 0; r < N; r++) (function (c, r) {
      var k = key([c, r]), on = !!state.pick[k], right = !!q.answer[k];
      var cell = add(s, 'rect', { x: edge(c) + 2, y: edge(r) + 2, width: S - 4, height: S - 4, rx: 8, fill: 'transparent', stroke: INK2, 'stroke-opacity': 0.25, 'data-cell': k, tabindex: state.done ? -1 : 0, role: 'button', 'aria-pressed': String(on), 'aria-label': 'Row ' + (r + 1) + ', column ' + (c + 1) });
      if (state.done) {
        if (right) add(s, 'circle', { cx: cx(c), cy: cx(r), r: 11, fill: on ? GOOD : 'none', stroke: GOOD, 'stroke-width': 3 });
        else if (on) { add(s, 'line', { x1: cx(c) - 9, y1: cx(r) - 9, x2: cx(c) + 9, y2: cx(r) + 9, stroke: BAD, 'stroke-width': 3 }); add(s, 'line', { x1: cx(c) + 9, y1: cx(r) - 9, x2: cx(c) - 9, y2: cx(r) + 9, stroke: BAD, 'stroke-width': 3 }); }
      } else if (on) add(s, 'circle', { cx: cx(c), cy: cx(r), r: 11, fill: INK });
      if (!state.done) {
        cell.style.cursor = 'pointer';
        cell.addEventListener('click', function () { onTap(k); });
        cell.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap(k); } });
      }
    })(c, r);
    if (state.done) q.holes.forEach(function (p) {   // the mirror pairs, joined straight across the crease
      var m = q.fold.mirror(p); if (key(m) === key(p)) return;
      add(s, 'line', { x1: cx(p[0]), y1: cx(p[1]), x2: cx(m[0]), y2: cx(m[1]), stroke: BRASS, 'stroke-width': 2, 'stroke-dasharray': '3 4' });
    });
    g.appendChild(s);
  }

  function drill(kind) {
    var box = document.createElement('div'); box.className = 'card hp-drill'; box.setAttribute('data-drill', kind);
    var C = COPY[kind];
    box.innerHTML = '<div class="k">' + C.k + '</div><h2>' + C.h + '</h2><p class="hp-rule">' + C.p + '</p>';
    var stage = document.createElement('div'); stage.className = 'hp-stage'; box.appendChild(stage);
    var say = document.createElement('p'); say.className = 'hp-say'; say.setAttribute('aria-live', 'polite'); box.appendChild(say);
    var row = document.createElement('div'); row.className = 'controls'; box.appendChild(row);
    var check = document.createElement('button'); check.className = 'primary'; check.type = 'button'; check.textContent = 'Check';
    var next = document.createElement('button'); next.className = 'ghost'; next.type = 'button'; next.textContent = 'Another one';
    row.appendChild(check); row.appendChild(next);
    var q, state, tally = { n: 0, ok: 0 };
    var count = document.createElement('p'); count.className = 'hp-count'; box.appendChild(count);
    function draw() {
      stage.textContent = '';
      var a = document.createElement('figure'), b = document.createElement('figure');
      drawFolded(a, q); a.appendChild(Object.assign(document.createElement('figcaption'), { textContent: 'Folded along ' + q.fold.name + ' (dashed: where the flap was), then punched' }));
      drawOpen(b, q, state, function (k) { if (state.pick[k]) delete state.pick[k]; else state.pick[k] = 1; draw(); });
      b.appendChild(Object.assign(document.createElement('figcaption'), { textContent: state.done ? 'Open: every hole and its mirror' : 'Open: tap every cell with a hole' }));
      stage.appendChild(a); stage.appendChild(b);
      check.disabled = state.done; count.textContent = tally.n ? tally.ok + ' of ' + tally.n + ' right in this drill' : '';
    }
    function fresh() { q = make(kind); state = { pick: {}, done: false }; say.textContent = ''; draw(); }
    check.addEventListener('click', function () {
      var want = Object.keys(q.answer).sort().join('|'), got = Object.keys(state.pick).sort().join('|'), ok = want === got;
      state.done = true; tally.n += 1; if (ok) tally.ok += 1;
      var total = Object.keys(q.answer).length;
      say.textContent = ok ? 'Right: ' + total + ' holes. Each punch, plus its mirror across the crease.'
        : 'The paper has ' + total + ' hole' + (total > 1 ? 's' : '') + '. ' + (kind === 'diag' ? 'Swap each punched hole’s row and column across the diagonal; a hole on the crease stays single.' : 'Each punch lands again across the crease, the same distance away.');
      if (window.PatLedger) window.PatLedger.record('holepunch', ok);
      draw();
    });
    next.addEventListener('click', fresh);
    fresh();
    return box;
  }

  var css = document.createElement('style');
  css.textContent = '.hp-drills{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:18px 0 20px}@media(max-width:900px){.hp-drills{grid-template-columns:1fr}}' +
    '.hp-rule{font-size:14px;line-height:1.55;margin:6px 0 10px}.hp-stage{display:grid;grid-template-columns:1fr 1fr;gap:12px}' +
    '.hp-stage figure{margin:0}.hp-stage figcaption{font-size:12px;color:#6E7A70;margin-top:4px;text-align:center}' +
    '.hp-say{min-height:1.4em;font-size:14px;font-weight:600;margin:8px 0 0}.hp-count{font-size:12px;color:#6E7A70;margin:6px 0 0}';
  document.head.appendChild(css);
  host.className = 'hp-drills';
  host.appendChild(drill('mirror'));
  host.appendChild(drill('diag'));
  window.HolepunchDrills = { make: make, FOLDS: FOLDS };
})();
