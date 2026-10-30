/* =====================================================================
   The one question player (mock). Practice mode by default; ?mode=timed
   is the same screen as a timed test. ?q=hw (default) or ?q=nacl picks
   the item; ?pick=D&checked=1 opens the explainer; ?review=1 opens the
   Review screen; ?exhibit=1 opens the periodic table.
   Items: The Climb (Hardy-Weinberg carriers, key 0.48) and Full-length
   DAT 4 written:bio-3-1rvt47w (0.15 M NaCl). Explainer text follows
   explainer-standard.md and the voice codex; notes never cite a letter:
   the player adds letters from the served order.
   ===================================================================== */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var qs = new URLSearchParams(location.search);
  var timed = qs.get('mode') === 'timed';
  var L = ['A', 'B', 'C', 'D', 'E'];

  /* ---------------- the items ---------------- */
  var ITEMS = {
    hw: {
      set: 'Bio practice set', pos: 'Question 4 of 10', tpos: 'Question 12 of 100',
      stem: 'In a large population at Hardy-Weinberg equilibrium, a recessive condition (genotype aa) is seen in 16% of individuals. What fraction of the population is expected to be heterozygous carriers (Aa)?',
      opts: ['0.16', '0.40', '0.36', '0.24', '0.48'], key: 4,
      line: 'Carriers are 2pq. Square root the affected fraction to get q = 0.4, so p = 0.6 and 2pq = 0.48.',
      steps: ['aa is seen in 16% of people, so <b>q squared = 0.16</b>.', 'Square root first: <b>q = 0.4</b>.', 'The two alleles add to 1, so <b>p = 1 - 0.4 = 0.6</b>.', 'Carriers come two ways, Aa and aA: <b>2pq = 2 x 0.6 x 0.4 = 0.48</b>.'],
      traps: [
        ['Right number, other question', 'That is q squared, the people who show the condition. The stem asks for carriers.'],
        ['One step short', 'That is q, an allele frequency: a side of the square, not an area. The stem asks for a genotype.'],
        ['Right number, other question', 'That is p squared, the AA people. Carriers sit in the two Aa rectangles.'],
        ['One step short', 'That is pq, one carrier rectangle. Carriers come two ways, A from one parent and a from the other or the reverse, so double it.'],
        null],
      lock: 'Carriers are 2pq, and q comes from the square root of the affected fraction.', cue: 'Square root first.',
      play: [['learn', 'Learn', 'Bio, Retold: night 11', 'learn.html'], ['play', 'Play', 'Call it first: Hardy-Weinberg', 'biology.html'], ['sheet', 'Sheet', 'Hardy-Weinberg', 'learn.html#sheets']],
      picture: pictureHW
    },
    nacl: {
      set: 'Bio practice set', pos: 'Question 7 of 10', tpos: 'Question 27 of 100',
      stem: 'A cell with an internal osmolarity of 300 mOsm is placed in a 0.15 M solution of NaCl, which dissociates completely. What happens to the cell volume?',
      opts: ['It stays the same, because the outside is also 300 mOsm', 'It swells, because sodium enters and water follows it in', 'It shrinks, because 300 mOsm of NaCl outdraws the cytoplasm', 'It swells, because 150 mOsm outside is well below the 300 mOsm inside', 'It shrinks, because 0.15 M NaCl comes to 600 mOsm'], key: 0,
      line: '0.15 M NaCl splits into two particles: 300 mOsm, the same as the cell. No net water moves.',
      steps: ['Count particles first. Each NaCl splits in two: <b>Na+ and Cl-</b>.', '<b>0.15 M x 2 = 0.30 osmol per liter</b>, which is 300 mOsm.', '300 outside, 300 inside: <b>no net water movement</b>, so the volume holds.'],
      traps: [null,
        ['Other conditions', 'Sodium does not freely leak in here. Water moves by osmosis; it does not chase a solute that stays outside.'],
        ['Half right', 'The 300 is right. But 300 outside matches 300 inside, so nothing outdraws anything.'],
        ['Counted units, not particles', 'This counts NaCl units, not particles. Each unit splits in two, so 0.15 M is 300 mOsm, not 150.'],
        ['One step too far', 'This doubles twice. 0.15 M NaCl gives 0.30 osmol per liter, not 0.60.']],
      lock: 'Multiply molarity by the ions a salt releases before you compare anything.', cue: 'Count particles first.',
      play: [['learn', 'Learn', 'Bio, Retold: night 3', 'learn.html'], ['play', 'Play', 'Call it first: Tonicity', 'today.html'], ['sheet', 'Sheet', 'Membrane transport and tonicity', 'learn.html#sheets']],
      picture: pictureNaCl
    }
  };
  var IT = ITEMS[qs.get('q')] || ITEMS.hw;
  var pick = -1, checked = false, strikeMode = false;

  /* ---------------- the test-day layer ---------------- */
  $('stem').textContent = IT.stem;
  $('qpos').textContent = IT.pos;
  $('qset').textContent = IT.set;
  if (timed) {
    document.documentElement.classList.add('timed');
    document.title = 'Full-length DAT 1 | Ace Labs';
    $('qpos').textContent = IT.tpos;
    $('qset').textContent = 'Full-length DAT 1';
    $('clockLbl').textContent = 'Time remaining';
    /* the only clock in Ace Labs: steady, never pulsing; a color change
       under 5 minutes at most */
    var left = 72 * 60 + 40;
    setInterval(function () { left = Math.max(0, left - 1); var h = Math.floor(left / 3600), m = Math.floor(left % 3600 / 60), s = left % 60; $('clock').textContent = h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'); }, 1000);
  }
  var host = $('xopts');
  host.innerHTML = IT.opts.map(function (o, i) {
    return '<button class="x-opt" type="button" role="radio" aria-checked="false" data-i="' + i + '"><span class="radio"></span><span class="let">' + L[i] + '.</span><span class="txt">' + o + '</span><span class="tag" hidden></span></button>';
  }).join('');
  var btns = host.querySelectorAll('.x-opt');
  Array.prototype.forEach.call(btns, function (b) {
    b.addEventListener('click', function () {
      if (checked) return;
      if (strikeMode) { strike(b); return; }
      choose(+b.getAttribute('data-i'));
    });
    /* right-click toggles cross-out, as reported for test day */
    b.addEventListener('contextmenu', function (e) { e.preventDefault(); if (!checked) strike(b); });
  });
  function choose(i) {
    pick = i;
    Array.prototype.forEach.call(btns, function (x, k) { x.setAttribute('aria-checked', String(k === pick)); });
    $('checkBtn').disabled = false;
  }
  /* Cross out is visual only: a struck choice stays selectable */
  function strike(b) {
    var on = !b.classList.contains('struck');
    b.classList.toggle('struck', on);
    b.setAttribute('aria-description', on ? 'crossed out' : '');
  }
  $('xoBtn').addEventListener('click', function () {
    strikeMode = !strikeMode;
    this.setAttribute('aria-pressed', String(strikeMode));
    $('toolHint').textContent = strikeMode ? 'Tap a choice to cross it out. Tap Cross out again to pick.' : '';
  });
  /* Highlight: select text in the question, then press Highlight. Tap a
     highlight to remove it (tools/rc/rc.js). */
  $('hlBtn').addEventListener('click', function () {
    var sel = window.getSelection();
    if (sel && sel.rangeCount && !sel.isCollapsed && $('stem').contains(sel.anchorNode)) {
      var m = document.createElement('mark');
      try { sel.getRangeAt(0).surroundContents(m); } catch (err) { /* across tags: skip */ }
      sel.removeAllRanges();
      $('toolHint').textContent = '';
    } else {
      $('toolHint').textContent = 'Select words in the question first.';
    }
  });
  $('stem').addEventListener('click', function (e) {
    var m = e.target.closest('mark');
    if (m) { m.replaceWith(document.createTextNode(m.textContent)); $('stem').normalize(); }
  });
  $('markBtn').addEventListener('click', function () {
    var on = this.getAttribute('aria-pressed') !== 'true';
    this.setAttribute('aria-pressed', String(on));
    this.classList.toggle('marked', on);
    this.innerHTML = on ? '<u>M</u>arked' : '<u>M</u>ark';
  });
  /* Alt shortcuts, as in tools/mock/full.js */
  document.addEventListener('keydown', function (e) {
    if (!e.altKey) return;
    var k = e.key.toLowerCase(), map = { p: 'prevBtn', n: 'nextBtn', m: 'markBtn', r: 'revBtn', x: 'exBtn' };
    if (map[k]) { e.preventDefault(); $(map[k]).click(); }
  });
  $('stuckBtn').addEventListener('click', function () { AceLoop.stuck('bio', this); });

  /* ---------------- Exhibit: the periodic table (one table, from full.js) ---------------- */
  var PT = [
    [1, 1, 1, 'H', '1.008'], [1, 18, 2, 'He', '4.003'],
    [2, 1, 3, 'Li', '6.94'], [2, 2, 4, 'Be', '9.012'], [2, 13, 5, 'B', '10.81'], [2, 14, 6, 'C', '12.01'], [2, 15, 7, 'N', '14.01'], [2, 16, 8, 'O', '16.00'], [2, 17, 9, 'F', '19.00'], [2, 18, 10, 'Ne', '20.18'],
    [3, 1, 11, 'Na', '22.99'], [3, 2, 12, 'Mg', '24.31'], [3, 13, 13, 'Al', '26.98'], [3, 14, 14, 'Si', '28.09'], [3, 15, 15, 'P', '30.97'], [3, 16, 16, 'S', '32.06'], [3, 17, 17, 'Cl', '35.45'], [3, 18, 18, 'Ar', '39.95'],
    [4, 1, 19, 'K', '39.10'], [4, 2, 20, 'Ca', '40.08'], [4, 3, 21, 'Sc', '44.96'], [4, 4, 22, 'Ti', '47.87'], [4, 5, 23, 'V', '50.94'], [4, 6, 24, 'Cr', '52.00'], [4, 7, 25, 'Mn', '54.94'], [4, 8, 26, 'Fe', '55.85'], [4, 9, 27, 'Co', '58.93'], [4, 10, 28, 'Ni', '58.69'], [4, 11, 29, 'Cu', '63.55'], [4, 12, 30, 'Zn', '65.38'], [4, 13, 31, 'Ga', '69.72'], [4, 14, 32, 'Ge', '72.63'], [4, 15, 33, 'As', '74.92'], [4, 16, 34, 'Se', '78.97'], [4, 17, 35, 'Br', '79.90'], [4, 18, 36, 'Kr', '83.80'],
    [5, 1, 37, 'Rb', '85.47'], [5, 2, 38, 'Sr', '87.62'], [5, 3, 39, 'Y', '88.91'], [5, 4, 40, 'Zr', '91.22'], [5, 5, 41, 'Nb', '92.91'], [5, 6, 42, 'Mo', '95.95'], [5, 7, 43, 'Tc', '(98)'], [5, 8, 44, 'Ru', '101.1'], [5, 9, 45, 'Rh', '102.9'], [5, 10, 46, 'Pd', '106.4'], [5, 11, 47, 'Ag', '107.9'], [5, 12, 48, 'Cd', '112.4'], [5, 13, 49, 'In', '114.8'], [5, 14, 50, 'Sn', '118.7'], [5, 15, 51, 'Sb', '121.8'], [5, 16, 52, 'Te', '127.6'], [5, 17, 53, 'I', '126.9'], [5, 18, 54, 'Xe', '131.3'],
    [6, 1, 55, 'Cs', '132.9'], [6, 2, 56, 'Ba', '137.3'], [6, 3, 57, 'La', '138.9'], [6, 4, 72, 'Hf', '178.5'], [6, 5, 73, 'Ta', '180.9'], [6, 6, 74, 'W', '183.8'], [6, 7, 75, 'Re', '186.2'], [6, 8, 76, 'Os', '190.2'], [6, 9, 77, 'Ir', '192.2'], [6, 10, 78, 'Pt', '195.1'], [6, 11, 79, 'Au', '197.0'], [6, 12, 80, 'Hg', '200.6'], [6, 13, 81, 'Tl', '204.4'], [6, 14, 82, 'Pb', '207.2'], [6, 15, 83, 'Bi', '209.0'], [6, 16, 84, 'Po', '(209)'], [6, 17, 85, 'At', '(210)'], [6, 18, 86, 'Rn', '(222)'],
    [7, 1, 87, 'Fr', '(223)'], [7, 2, 88, 'Ra', '(226)'], [7, 3, 89, 'Ac', '(227)'], [7, 4, 104, 'Rf', '(267)'], [7, 5, 105, 'Db', '(268)'], [7, 6, 106, 'Sg', '(269)'], [7, 7, 107, 'Bh', '(270)'], [7, 8, 108, 'Hs', '(269)'], [7, 9, 109, 'Mt', '(278)'], [7, 10, 110, 'Ds', '(281)'], [7, 11, 111, 'Rg', '(282)'], [7, 12, 112, 'Cn', '(285)'], [7, 13, 113, 'Nh', '(286)'], [7, 14, 114, 'Fl', '(289)'], [7, 15, 115, 'Mc', '(290)'], [7, 16, 116, 'Lv', '(293)'], [7, 17, 117, 'Ts', '(294)'], [7, 18, 118, 'Og', '(294)']
  ];
  var LAN = [[58, 'Ce', '140.1'], [59, 'Pr', '140.9'], [60, 'Nd', '144.2'], [61, 'Pm', '(145)'], [62, 'Sm', '150.4'], [63, 'Eu', '152.0'], [64, 'Gd', '157.3'], [65, 'Tb', '158.9'], [66, 'Dy', '162.5'], [67, 'Ho', '164.9'], [68, 'Er', '167.3'], [69, 'Tm', '168.9'], [70, 'Yb', '173.0'], [71, 'Lu', '175.0']];
  var ACT = [[90, 'Th', '232.0'], [91, 'Pa', '231.0'], [92, 'U', '238.0'], [93, 'Np', '(237)'], [94, 'Pu', '(244)'], [95, 'Am', '(243)'], [96, 'Cm', '(247)'], [97, 'Bk', '(247)'], [98, 'Cf', '(251)'], [99, 'Es', '(252)'], [100, 'Fm', '(257)'], [101, 'Md', '(258)'], [102, 'No', '(259)'], [103, 'Lr', '(266)']];
  function cell(z, s, m) { return '<td><span class="z">' + z + '</span><span class="s">' + s + '</span><span class="m">' + m + '</span></td>'; }
  function ptHTML() {
    var g = {}; PT.forEach(function (e) { g[e[0] + '-' + e[1]] = e; });
    var rows = '';
    for (var r = 1; r <= 7; r++) { rows += '<tr>'; for (var c = 1; c <= 18; c++) { var e = g[r + '-' + c]; rows += e ? cell(e[2], e[3], e[4]) : '<td class="e"></td>'; } rows += '</tr>'; }
    var f = function (list) { return '<tr><td class="e"></td><td class="e"></td><td class="e"></td>' + list.map(function (e) { return cell(e[0], e[1], e[2]); }).join('') + '<td class="e"></td></tr>'; };
    return '<table>' + rows + '</table><table style="margin-top:8px">' + f(LAN) + f(ACT) + '</table>' +
      '<div class="pt-k">Avogadro\'s number 6.022 x 10<sup>23</sup> /mol; R = 8.314 J/(mol K) = 0.0821 L atm/(mol K); F = 96,485 C/mol; h = 6.626 x 10<sup>-34</sup> J s; c = 3.00 x 10<sup>8</sup> m/s</div>';
  }
  function makeWin(id, cls, title, inner) {
    var w = document.createElement('div');
    w.id = id; w.className = 'x-win ' + cls;
    w.setAttribute('role', 'dialog'); w.setAttribute('aria-label', title);
    w.innerHTML = '<div class="bar"><span>' + title + '</span><button type="button" data-close="1">Close</button></div>' + inner;
    document.body.appendChild(w);
    var bar = w.querySelector('.bar'), drag = null;
    bar.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; var r = w.getBoundingClientRect(); drag = { dx: e.clientX - r.left, dy: e.clientY - r.top }; bar.setPointerCapture(e.pointerId); });
    bar.addEventListener('pointermove', function (e) { if (!drag) return; w.style.left = Math.max(0, e.clientX - drag.dx) + 'px'; w.style.top = Math.max(0, e.clientY - drag.dy) + 'px'; });
    bar.addEventListener('pointerup', function () { drag = null; });
    return w;
  }
  function togglePT() {
    var w = $('xPT'), on = !w || w.hidden;
    if (!w) { w = makeWin('xPT', 'x-pt', 'Periodic Table of the Elements', '<div class="inner">' + ptHTML() + '</div>'); w.querySelector('[data-close]').addEventListener('click', togglePT); }
    else w.hidden = !on;
    $('exBtn').setAttribute('aria-pressed', String(on));
  }
  $('exBtn').addEventListener('click', togglePT);

  /* ---------------- the Review screen ---------------- */
  /* A set of 10: the student is on 4. Status words: Answered, Open, Marked. */
  var STATE = [1, 1, 1, 0, 1, 1, 0, 1, 0, 0], MARKED = [0, 1, 0, 0, 0, 0, 1, 0, 0, 0];
  if (timed) { STATE = []; MARKED = []; for (var t = 0; t < 40; t++) { STATE.push(t < 31 && t !== 17 ? 1 : 0); MARKED.push(t === 5 || t === 17 || t === 24 ? 1 : 0); } }
  var curIdx = timed ? (IT === ITEMS.nacl ? 26 : 11) : (IT === ITEMS.nacl ? 6 : 3);
  function openReview(mode) {
    var n = STATE.length, answered = STATE.filter(Boolean).length + (pick >= 0 && !STATE[curIdx] ? 1 : 0), marked = MARKED.filter(Boolean).length;
    var cells = '';
    for (var i = 0; i < n; i++) {
      var a = STATE[i] || (i === curIdx && pick >= 0);
      cells += '<button type="button" class="x-cell' + (a ? ' ans' : '') + (MARKED[i] ? ' mk' : '') + (i === curIdx ? ' cur' : '') + '" aria-label="Question ' + (i + 1) + (a ? ', answered' : ', open') + (MARKED[i] ? ', marked' : '') + '">' + (i + 1) + '</button>';
    }
    $('review').innerHTML = '<h2 id="revH">' + (timed ? 'Survey of the Natural Sciences: review' : 'Bio practice set: review') + '</h2>' +
      '<p>Choose a question to go straight to it, or step through a group. ' + (timed ? 'End the section when you are ready; after that it cannot be reopened.' : 'Untimed: nothing here ends on its own.') + '</p>' +
      '<div class="x-legend"><span><i></i>Open</span><span><i class="ans"></i>Answered</span><span><i class="mk"></i>Marked</span></div>' +
      '<div class="x-rgrid">' + cells + '</div>' +
      '<p>' + answered + ' of ' + n + ' answered. ' + (n - answered) + ' open. ' + marked + ' marked.' + (timed ? ' Showing the first 40 of 100.' : '') + '</p>' +
      '<div class="x-ract"><button class="x-act" type="button" id="rAll">Review All</button><button class="x-act" type="button" id="rMarked">Review Marked</button><button class="x-act" type="button" id="rOpen">Review Incomplete</button>' +
      '<button class="x-act" type="button" id="rBack">Return to question ' + (curIdx + 1) + '</button>' +
      (timed ? '<button class="x-act primary" type="button" id="rEnd">End section</button>' : '') + '</div><div id="rConfirm"></div>';
    $('card').hidden = true; $('xpInline').hidden = true;
    $('review').hidden = false;
    $('rBack').addEventListener('click', closeReview);
    ['rAll', 'rMarked', 'rOpen'].forEach(function (id) { $(id).addEventListener('click', closeReview); });
    if ($('rEnd')) $('rEnd').addEventListener('click', function () {
      var open = n - answered;
      $('rConfirm').innerHTML = '<div class="x-confirm" role="alertdialog" aria-labelledby="cfH"><b id="cfH">End Survey of the Natural Sciences?</b>You have ' + open + ' open questions in this view. A guess can only help, so consider putting a letter on each one. Once this section ends you cannot return to it.' +
        '<div class="x-ract"><button class="x-act" type="button" id="cfOpen">Go to the first open one</button><button class="x-act primary" type="button">End section</button></div></div>';
      $('cfOpen').addEventListener('click', closeReview);
    });
  }
  function closeReview() { $('review').hidden = true; $('card').hidden = false; $('xpInline').hidden = false; }
  $('revBtn').addEventListener('click', function () { openReview(); });

  /* ---------------- the coach layer: Check and the explainer ---------------- */
  function wide() { return window.matchMedia('(min-width:1100px)').matches; }
  var xp = null;
  function place() {
    if (!xp) return;
    var target = wide() ? $('xpSide') : $('xpInline');
    if (xp.parentNode !== target) target.appendChild(xp);
    $('xmain').classList.toggle('split', wide());
  }
  window.addEventListener('resize', place);

  function check() {
    if (pick < 0 || checked || timed) return;
    checked = true;
    $('card').classList.add('checked');
    Array.prototype.forEach.call(btns, function (b, i) {
      b.setAttribute('aria-disabled', 'true');
      var tag = b.querySelector('.tag');
      if (i === IT.key) { b.classList.add('is-key'); tag.hidden = false; tag.textContent = i === pick ? 'Answer, your pick' : 'Answer'; }
      else if (i === pick) { b.classList.add('is-pick'); tag.hidden = false; tag.textContent = 'Your pick'; }
    });
    $('checkBtn').hidden = true; $('stuckBtn').hidden = true;
    $('checkNote').textContent = wide() ? 'Checked. The explainer is beside the question.' : 'Checked. The explainer is below.';
    xp = document.createElement('article');
    xp.className = 'xp';
    xp.setAttribute('aria-label', 'Explainer');
    xp.innerHTML = explainer();
    AL.fillIcons(xp);
    place();
    IT.picture(xp.querySelector('#pic'));
    var kb = xp.querySelector('#keepQ');
    if (kb) kb.addEventListener('click', function () { this.innerHTML = AL.icon('keep', 'sm') + 'Kept: back tomorrow, ' + AL.dayName(1); this.disabled = true; });
    if (!wide()) setTimeout(function () { var y = xp.getBoundingClientRect().top + $('xbody').scrollTop - $('xbody').getBoundingClientRect().top - 8; $('xbody').scrollTo({ top: y, behavior: AL.reduced() ? 'auto' : 'smooth' }); }, 60);
  }
  $('checkBtn').addEventListener('click', check);

  function explainer() {
    var ok = pick === IT.key;
    var order = [];
    IT.traps.forEach(function (t, i) { if (t) order.push(i); });
    if (!ok) order = [pick].concat(order.filter(function (k) { return k !== pick; }));
    return '<div class="xp-in">' +
      '<div class="xp-head"><span class="k" data-icon="prove" data-icon-cls="sm">Ace explainer</span><span class="k">' + IT.pos + '</span></div>' +
      /* 1. status */
      '<div class="status' + (ok ? ' ok' : '') + '" role="status"><div><div class="vh">' + AL.icon(ok ? 'good' : 'review', 'sm') + (ok ? 'Confirmed' : 'Needs review') + '</div>' +
      '<p>You picked ' + L[pick] + ', ' + IT.opts[pick] + '.</p></div></div>' +
      /* 2. the answer */
      '<div class="answer"><span class="al">' + L[IT.key] + '</span><div><b>' + IT.opts[IT.key] + '</b><p>' + IT.line + '</p></div></div>' +
      /* 3. the picture */
      '<h3>The picture</h3><div id="pic"></div>' +
      /* 4. how to get there */
      '<h3>How to get there</h3><ol class="steps">' + IT.steps.map(function (s) { return '<li><span>' + s + '</span></li>'; }).join('') + '</ol>' +
      /* 5. the traps */
      '<h3>The traps</h3><div class="traps">' + order.map(function (i) {
        return '<div class="trap' + (i === pick ? ' mine' : '') + '"><span class="tl">' + L[i] + '</span><span><span class="tn">' + (i === pick ? 'Your pick / ' : '') + IT.traps[i][0] + '</span><b>' + IT.opts[i] + '</b></span><span>' + IT.traps[i][1] + '</span></div>';
      }).join('') + '</div>' +
      /* 6 and 7. lock it in, memory cue */
      '<h3>Lock it in</h3><p class="lock">' + IT.lock + '</p><p class="cue">' + IT.cue + '</p>' +
      /* the card: a miss makes one; a Confirmed may keep one */
      (ok ? '<div class="cardrow"><span data-icon="keep"></span><p><b>Confirmed.</b> Keep it anyway and it comes back tomorrow with this picture, then in 3 days, then in 7.</p><button class="btn gold" id="keepQ" type="button"><span data-icon="keep" data-icon-cls="sm"></span>Keep it</button></div>'
        : '<div class="cardrow"><span data-icon="keep"></span><p><b>Ace Card made.</b> It comes back tomorrow, ' + AL.dayName(1) + ', with this picture, as a fresh question on the same idea.</p><a class="btn gold" href="review.html">Open Review</a></div>') +
      /* 8. play with it */
      '<h3>Play with it</h3><div class="loopnext">' + IT.play.map(function (p) {
        return '<a class="ln" href="' + p[3] + '"><span class="pip">' + AL.icon(p[0] === 'learn' ? 'learn' : p[0] === 'play' ? 'play' : 'sheet') + '</span><span><span class="st">' + p[1] + '</span><span class="t">' + p[2] + '</span></span></a>';
      }).join('') + '</div>' +
      /* 9. watch: hidden until a video id exists for the subtopic slot */
      /* 10. report */
      '<p class="report"><a href="index.html">Something off with this question?</a></p></div>';
  }

  /* ---------------- pictures ---------------- */
  /* Hardy-Weinberg: the area square, and the trap map: every choice lights
     the piece of the square it came from. Highlight is fill plus label. */
  function pictureHW(el) {
    var CAPS = ['is the aa square: the people who show the condition, not the carriers.', 'is q, a side length. Genotype fractions are areas.', 'is the AA square, p squared.', 'is one Aa rectangle. There are two.', 'is both Aa rectangles together: 2pq, the carriers.'];
    el.innerHTML = '<figure class="visual" style="margin:0">' +
      '<svg class="v sq" viewBox="0 0 330 312" role="img" aria-labelledby="sqT sqD"><title id="sqT">The Hardy-Weinberg square</title>' +
      '<desc id="sqD">A square split 0.6 and 0.4 along each side. Top left AA is 0.36, top right Aa is 0.24, bottom left Aa is 0.24, bottom right aa is 0.16. The two Aa rectangles together are the carriers, 0.48.</desc>' +
      '<text x="112" y="20" text-anchor="middle" font-size="13" font-weight="700" fill="#3a4a42">A: p = 0.6</text><text x="248" y="20" text-anchor="middle" font-size="13" font-weight="700" fill="#3a4a42">a: q = 0.4</text>' +
      '<text x="22" y="112" text-anchor="middle" font-size="13" font-weight="700" fill="#3a4a42" transform="rotate(-90 22 112)">A: p = 0.6</text><text x="22" y="248" text-anchor="middle" font-size="13" font-weight="700" fill="#3a4a42" transform="rotate(-90 22 248)">a: q = 0.4</text>' +
      '<rect class="cell" id="rAA" x="40" y="40" width="144" height="144"/><rect class="cell" id="rAa1" x="184" y="40" width="96" height="144"/><rect class="cell" id="rAa2" x="40" y="184" width="144" height="96"/><rect class="cell" id="raa" x="184" y="184" width="96" height="96"/>' +
      '<g text-anchor="middle" fill="#0d2018"><text x="112" y="106" font-size="22" font-weight="700">AA</text><text x="112" y="128" font-size="14">p squared = 0.36</text>' +
      '<text x="232" y="106" font-size="22" font-weight="700">Aa</text><text x="232" y="128" font-size="14">pq = 0.24</text>' +
      '<text x="112" y="230" font-size="22" font-weight="700">Aa</text><text x="112" y="252" font-size="14">pq = 0.24</text>' +
      '<text x="232" y="230" font-size="22" font-weight="700">aa</text><text x="232" y="252" font-size="14">0.16</text></g>' +
      '<g class="qside" id="qside"><path d="M186 30v-6h92v6" fill="none" stroke="#D55E00" stroke-width="3"/><path d="M290 186h6v92h-6" fill="none" stroke="#D55E00" stroke-width="3"/><text x="304" y="236" font-size="13" font-weight="700" fill="#9b4500" transform="rotate(90 304 236)" text-anchor="middle">q is a length</text></g>' +
      '<text x="165" y="304" text-anchor="middle" font-size="13" fill="#3a4a42">Areas are genotype fractions. They add to 1.</text></svg>' +
      '<figcaption class="vcapt">Every choice on this question is a piece of this square. Only one piece is the carriers.</figcaption>' +
      '<p class="vsub" id="mapL">Where each choice comes from</p>' +
      '<div class="vchips" role="group" aria-labelledby="mapL">' + IT.opts.map(function (o, i) {
        return '<button class="vchip' + (i === IT.key ? ' key' : i === pick ? ' mine' : '') + '" type="button" aria-pressed="false" data-i="' + i + '">' + L[i] + '<small>' + o + '</small></button>';
      }).join('') + '</div><p class="vcap" id="vcap" aria-live="polite"></p></figure>';
    function light(i) {
      ['rAA', 'rAa1', 'rAa2', 'raa'].forEach(function (id) { $(id).classList.remove('lit', 'lit-trap'); });
      $('qside').classList.remove('on');
      var cls = i === IT.key ? 'lit' : 'lit-trap';
      if (i === 0) $('raa').classList.add(cls);
      if (i === 1) $('qside').classList.add('on');
      if (i === 2) $('rAA').classList.add(cls);
      if (i === 3) $('rAa1').classList.add(cls);
      if (i === 4) { $('rAa1').classList.add('lit'); $('rAa2').classList.add('lit'); }
      Array.prototype.forEach.call(el.querySelectorAll('.vchip'), function (c, k) { c.setAttribute('aria-pressed', String(k === i)); });
      $('vcap').innerHTML = '<b>' + L[i] + ', ' + IT.opts[i] + '</b> ' + CAPS[i];
    }
    Array.prototype.forEach.call(el.querySelectorAll('.vchip'), function (c) { c.addEventListener('click', function () { light(+c.getAttribute('data-i')); }); });
    light(pick);
    window.QDemo.light = light;
  }

  /* NaCl: the particle count, rendered and replayable, then "See each choice
     under the microscope": the real slide each choice implies. */
  function pictureNaCl(el) {
    var SLIDES = [
      [50, 'The real case: 300 outside, 300 inside. The discs keep their shape.'],
      [30, 'What swelling looks like. Nothing here makes it happen: sodium does not leak in.'],
      [82, 'What shrinking looks like. It would need more than 300 outside.'],
      [24, 'What 150 outside would do: the cells swell toward bursting. This solution is not 150.'],
      [96, 'What 600 outside would do: the cells shrink and crenate. This solution is not 600.']
    ];
    el.innerHTML = '<figure class="visual" style="margin:0">' +
      '<svg class="v ions" id="countViz" viewBox="0 0 520 268" role="img" aria-label="Particle count. The cell holds 12 dots of 25 mOsm, 300 mOsm. Outside, 6 NaCl units split into 12 ions, also 300 mOsm. Water in equals water out."></svg>' +
      '<div class="vrow"><button class="vbtn" type="button" id="replayCount">' + AL.icon('replay', 'sm') + 'Replay</button></div>' +
      '<figcaption class="vcapt">Each dot is 25 mOsm. Six NaCl units split into twelve ions: 0.15 x 2 = 0.30 osmol per liter.</figcaption>' +
      '<p class="vsub" id="microL">See each choice under the microscope</p>' +
      '<div class="vchips" role="group" aria-labelledby="microL">' + IT.opts.map(function (o, i) {
        return '<button class="vchip' + (i === IT.key ? ' key' : i === pick ? ' mine' : '') + '" type="button" aria-pressed="false" data-i="' + i + '">' + L[i] + '<small>' + (i === IT.key ? 'the answer' : i === pick ? 'your pick' : 'if it were') + '</small></button>';
      }).join('') + '</div>' +
      '<div class="micro" id="micro"></div><p class="vcap" id="microCap" aria-live="polite"></p></figure>';
    function countViz() {
      var s = '<rect x="0" y="0" width="520" height="268" rx="10" fill="#fffdf7"/>';
      function box(x, title, sub) {
        return '<rect x="' + x + '" y="34" width="220" height="150" rx="16" fill="#f5f0e8" stroke="#33443b" stroke-width="1.5"/>' +
          '<text x="' + (x + 110) + '" y="22" text-anchor="middle" font-size="15" font-weight="700" fill="#0d2018" font-family="DM Sans, sans-serif">' + title + '</text>' +
          '<text x="' + (x + 110) + '" y="208" text-anchor="middle" font-size="15" font-weight="700" fill="#0d2018" font-family="DM Sans, sans-serif">' + sub + '</text>';
      }
      s += box(18, 'Inside the cell', '12 dots = 300 mOsm') + box(282, 'Outside: 0.15 M NaCl', '6 units x 2 = 300 mOsm');
      for (var i = 0; i < 12; i++) s += '<circle cx="' + (52 + (i % 4) * 50) + '" cy="' + (70 + Math.floor(i / 4) * 44) + '" r="9" fill="#5cabe6" stroke="#2f7fb8" stroke-width="1.2"/>';
      for (var j = 0; j < 6; j++) {
        var bx = 322 + (j % 3) * 64, by = 74 + Math.floor(j / 3) * 64;
        s += '<g class="ion" data-dx="-12" data-dy="-10" style="transform:translate(' + bx + 'px,' + by + 'px)"><circle r="10" fill="#c9a84c" stroke="#7a6128" stroke-width="1.2"/><text y="3.5" text-anchor="middle" font-size="10" font-weight="700" fill="#14110a" font-family="DM Sans, sans-serif">Na+</text></g>';
        s += '<g class="ion" data-dx="12" data-dy="10" style="transform:translate(' + (bx + 15) + 'px,' + by + 'px)"><circle r="12" fill="#3e8e5e" stroke="#1b3a2d" stroke-width="1.2"/><text y="3.5" text-anchor="middle" font-size="10" font-weight="700" fill="#fff" font-family="DM Sans, sans-serif">Cl-</text></g>';
      }
      s += '<text x="260" y="250" text-anchor="middle" font-size="15" font-weight="700" fill="#007a59" font-family="DM Sans, sans-serif">300 = 300: water in equals water out</text>' +
        '<g stroke="#007a59" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M245 98 h30 M268 91 l7 7 -7 7"/><path d="M275 122 h-30 M252 115 l-7 7 7 7"/></g>' +
        '<text x="260" y="146" text-anchor="middle" font-size="11" font-weight="700" fill="#007a59" font-family="DM Sans, sans-serif">H2O</text>';
      return s;
    }
    /* the ions split apart: a process, so it may move; reduced motion shows the end state */
    function play() {
      var svg = $('countViz');
      svg.innerHTML = countViz();
      var ions = svg.querySelectorAll('.ion');
      setTimeout(function () {
        Array.prototype.forEach.call(ions, function (g) {
          var m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(g.style.transform);
          g.style.transform = 'translate(' + (+m[1] + +g.getAttribute('data-dx')) + 'px,' + (+m[2] + +g.getAttribute('data-dy')) + 'px)';
        });
      }, AL.reduced() ? 0 : 450);
    }
    play();
    $('replayCount').addEventListener('click', play);
    function show(i) {
      var f = Tonicity.field(SLIDES[i][0], 'animal');
      $('micro').innerHTML = f.svg('fs', SLIDES[i][1]);
      $('microCap').innerHTML = '<b>' + L[i] + (i === IT.key ? ', the answer.' : i === pick ? ', your pick.' : '.') + '</b> ' + SLIDES[i][1];
      Array.prototype.forEach.call(el.querySelectorAll('.vchip'), function (c, k) { c.setAttribute('aria-pressed', String(k === i)); });
    }
    Array.prototype.forEach.call(el.querySelectorAll('.vchip'), function (c) { c.addEventListener('click', function () { show(+c.getAttribute('data-i')); }); });
    show(pick >= 0 ? pick : IT.key);
    window.QDemo.light = show;
  }

  window.QDemo = { pick: function (i) { btns[i].click(); }, check: check, review: function () { openReview(); }, exhibit: togglePT, strike: function (i) { strike(btns[i]); } };
  var pq = qs.get('pick');
  if (pq) { QDemo.pick(L.indexOf(pq)); if (qs.get('checked') === '1' && !timed) check(); }
  if (qs.get('strike')) QDemo.strike(L.indexOf(qs.get('strike')));
  if (qs.get('review') === '1') openReview();
  if (qs.get('exhibit') === '1') togglePT();
})();
