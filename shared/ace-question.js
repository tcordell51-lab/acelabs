/* ace-question.js : the one multiple-choice question. Styles: /shared/ace-ui.css.

   Item format (built by scripts/build-ace-banks.mjs):
     { id, section, topic, topicName, stem, choices: [5 strings], answer: 0-4, why,
       traps?: [5] reason each wrong choice is wrong (null at the answer),
       trick?: one line }

   var q = AceQuestion.mount(hostElement, item, {
     number: 3, total: 10,          // "Question 3 of 10"
     label: 'Buffers',              // chip text; defaults to item.topicName
     onAnswer: function (result) {},// { item, picked, answer, ok, ms }
     onNext: function () {},        // shown after the reveal
     onRetry: function () {},       // "Try one like it"; omit to hide the button
     nextLabel: 'Next question'
   });

   Optional, added 2026-11-16 (the deck style: predict first, then reveal):
     item.figure or opts.figure = { html: '<svg>...</svg>', caption: 'No labels yet. ...',
                                    revealCaption: '...' }
       The figure shows unlabeled while the student commits. Anything inside it with
       class "reveal" stays hidden until Check answer, then draws in; class
       "predict-only" goes away at the reveal.
     item.steps = ['step one', 'step two', ...]  the worked route, revealed in order.
     opts.confidence = true   three optional chips (Sure, Unsure, Guessed). Never blocks.
     opts.onReason(reason, item)  shows the one-tap "Why did you miss it?" row after a miss:
       know | trap | misread | time | changed, with one line of feedback after the tap.
   Every selection is logged: result.picks = [{ i, ms }], first, changes, and
   change = 'none' | 'w2r' (wrong to right) | 'r2w' (right to wrong) | 'w2w'.

   Always the same sequence: pick a letter, Check answer, then the reveal:
   the answer, why, the trap in the letter picked (when the bank has one), the
   one-line trick (when the bank has one), and a same-skill retry.
   Keyboard: A to E or 1 to 5 picks, arrows move, Enter checks, then Enter or N
   goes on and R retries. Nothing is revealed before Check answer. */
(function () {
  'use strict';
  if (window.AceQuestion) return;
  var LETTERS = ['A', 'B', 'C', 'D', 'E'];
  var active = null;   // the question that owns the keyboard

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function block(title, text) { var dl = el('dl', 'aui-q__block'); dl.appendChild(el('dt', null, title)); dl.appendChild(el('dd', null, text)); return dl; }

  /* "Why did you miss it?" One tap, stored with the miss; it decides what comes back and when. */
  var REASONS = [
    ['know', "Didn't know it"], ['trap', 'Fell for a trap'], ['misread', 'Misread it'], ['time', 'Ran short on time'], ['changed', 'Changed my answer']
  ];
  function reasonLine(id, item, change) {
    var topic = (item.topicName || item.topic || 'this topic').toLowerCase();
    if (id === 'know') return 'Got it. A short lesson on ' + topic + ' goes into tomorrow, then this comes back as a new version.';
    if (id === 'trap') return 'Got it. This comes back in 2 days as a new version, with the same trap waiting for you.';
    if (id === 'misread') return 'Got it. It comes back in 2 days. Say the ask in your own words before you look at the choices.';
    if (id === 'time') return 'Got it. It comes back untimed first, then timed, so you know which one it was.';
    return (change === 'r2w' ? 'Your first pick was right. ' : '') + 'Every switch is logged, so you can see whether second-guessing costs you.';
  }
  function whyRow(item, change, onReason) {
    var box = el('div', 'aui-q__why'), picked = null;
    box.appendChild(el('p', 'aui-q__why-h', 'Why did you miss it?'));
    box.appendChild(el('p', 'aui-q__hint', 'One tap. It decides what comes back and when.'));
    var chips = el('div', 'aui-q__why-row'); chips.setAttribute('role', 'group'); chips.setAttribute('aria-label', 'Why did you miss it?');
    var line = el('p', 'aui-q__why-fb'); line.hidden = true; line.setAttribute('aria-live', 'polite');
    REASONS.forEach(function (r) {
      var b = el('button', 'aui-q__why-btn', r[1]); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('data-reason', r[0]);
      b.addEventListener('click', function () {
        picked = r[0];
        Array.prototype.forEach.call(chips.children, function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        line.textContent = reasonLine(r[0], item, change); line.hidden = false;
        try { onReason(r[0], item); } catch (e) { /* the page decides what to do with it */ }
      });
      chips.appendChild(b);
    });
    box.appendChild(chips); box.appendChild(line);
    return box;
  }

  function mount(host, item, opts) {
    opts = opts || {};
    if (!item || !Array.isArray(item.choices) || item.choices.length !== 5) throw new Error('AceQuestion: an item needs exactly five choices');
    var picked = -1, revealed = false, t0 = Date.now(), picks = [], conf = null;
    var fig = opts.figure || item.figure || null;
    host.textContent = '';
    var root = el('section', 'aui-q' + (fig ? ' aui-q--fig' : '')); root.setAttribute('aria-label', 'Question');
    var qcol = root;
    if (fig) {
      qcol = el('div', 'aui-q__main');
      var figBox = el('figure', 'aui-q__fig'); figBox.setAttribute('data-state', 'predict');
      var figArt = el('div', 'aui-q__art'); figArt.innerHTML = fig.html || '';
      var figCap = el('figcaption', 'aui-q__cap', fig.caption || 'No labels yet. Commit to an answer first.');
      figBox.appendChild(figArt); figBox.appendChild(figCap);
      root.appendChild(qcol); root.appendChild(figBox);
    }
    var meta = el('div', 'aui-q__meta');
    meta.appendChild(el('span', 'aui-chip', opts.label || item.topicName || item.topic || ''));
    if (opts.number) meta.appendChild(el('span', 'aui-small aui-num', 'Question ' + opts.number + (opts.total ? ' of ' + opts.total : '')));
    qcol.appendChild(meta);
    var stemId = 'aui-q-stem-' + Math.random().toString(36).slice(2, 8);
    var stem = el('p', 'aui-q__stem', item.stem); stem.id = stemId; qcol.appendChild(stem);

    var list = el('ul', 'aui-q__choices'); list.setAttribute('role', 'radiogroup'); list.setAttribute('aria-labelledby', stemId);
    var buttons = item.choices.map(function (text, i) {
      var li = el('li'), b = el('button', 'aui-q__choice'); li.setAttribute('role', 'none');
      b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', 'false'); b.tabIndex = i === 0 ? 0 : -1;
      b.appendChild(el('span', 'aui-q__letter', LETTERS[i]));
      b.appendChild(el('span', 'aui-q__text', text));
      b.addEventListener('click', function () { pick(i); });
      li.appendChild(b); list.appendChild(li); return b;
    });
    qcol.appendChild(list);

    var actions = el('div', 'aui-q__actions');
    var check = el('button', 'aui-btn', 'Check answer'); check.type = 'button'; check.disabled = true;
    var hint = el('span', 'aui-q__hint', 'Pick a letter, then check.');
    actions.appendChild(check); actions.appendChild(hint);
    var confRow = null;
    if (opts.confidence) {
      confRow = el('div', 'aui-q__conf'); confRow.setAttribute('role', 'group'); confRow.setAttribute('aria-label', 'How sure are you? Optional');
      confRow.appendChild(el('span', 'aui-q__hint', 'How sure? Optional.'));
      [['sure', 'Sure'], ['unsure', 'Unsure'], ['guess', 'Guessed']].forEach(function (c) {
        var b = el('button', 'aui-chip aui-q__confbtn', c[1]); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function () { if (revealed) return; conf = conf === c[0] ? null : c[0]; Array.prototype.forEach.call(confRow.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', x === b && conf ? 'true' : 'false'); }); });
        confRow.appendChild(b);
      });
      qcol.appendChild(confRow);
    }
    qcol.appendChild(actions);
    var fb = el('div', 'aui-q__fb'); fb.hidden = true; fb.setAttribute('aria-live', 'polite'); qcol.appendChild(fb);
    host.appendChild(root);

    function pick(i, focus) {
      if (revealed) return;
      if (picked !== i) picks.push({ i: i, ms: Date.now() - t0 });
      picked = i;
      buttons.forEach(function (b, j) { b.setAttribute('aria-checked', j === i ? 'true' : 'false'); b.tabIndex = j === i ? 0 : -1; });
      check.disabled = false; hint.textContent = 'You picked ' + LETTERS[i] + '.';
      if (focus !== false) buttons[i].focus();
    }
    function reveal() {
      if (revealed || picked < 0) return;
      revealed = true;
      var ok = picked === item.answer, ms = Date.now() - t0;
      var first = picks.length ? picks[0].i : picked, changes = Math.max(0, picks.length - 1);
      var change = 'none';
      if (first !== picked) change = (first === item.answer) ? 'r2w' : (ok ? 'w2r' : 'w2w');
      if (confRow) Array.prototype.forEach.call(confRow.querySelectorAll('button'), function (x) { x.disabled = true; });
      if (fig) {
        figBox.setAttribute('data-state', 'reveal');
        if (fig.revealCaption) figCap.textContent = fig.revealCaption;
      }
      buttons.forEach(function (b, j) {
        b.disabled = true;
        if (j === item.answer) { b.setAttribute('data-state', 'right'); b.appendChild(el('span', 'aui-q__tag', 'Correct answer')); }
        else if (j === picked) { b.setAttribute('data-state', 'wrong'); b.appendChild(el('span', 'aui-q__tag', 'Your pick')); }
      });
      actions.hidden = true;
      var verdict = el('p', 'aui-q__verdict', (ok ? 'Correct. ' : 'Not this time. ') + 'The answer is ' + LETTERS[item.answer] + '.');
      verdict.setAttribute('data-ok', ok ? 'true' : 'false'); fb.appendChild(verdict);
      if (item.why) fb.appendChild(block('Why', item.why));
      if (Array.isArray(item.steps) && item.steps.length) {
        var dl = el('dl', 'aui-q__block'); dl.appendChild(el('dt', null, 'How to get there'));
        var dd = el('dd'), ol = el('ol', 'aui-q__steps');
        item.steps.forEach(function (t, k) { var li = el('li', null, t); li.style.setProperty('--k', k); ol.appendChild(li); });
        dd.appendChild(ol); dl.appendChild(dd); fb.appendChild(dl);
      }
      var trap = !ok && item.traps && item.traps[picked];
      if (trap) fb.appendChild(block('The trap in ' + LETTERS[picked], trap));
      if (item.trick) fb.appendChild(block('Trick', item.trick));
      if (!ok && opts.onReason) fb.appendChild(whyRow(item, change, opts.onReason));
      var row = el('div', 'aui-q__actions');
      var next = el('button', 'aui-btn', opts.nextLabel || 'Next question'); next.type = 'button'; next.setAttribute('data-act', 'next');
      next.addEventListener('click', function () { if (opts.onNext) opts.onNext(); });
      row.appendChild(next);
      if (opts.onRetry) {
        var retry = el('button', 'aui-btn aui-btn--quiet', 'Try one like it'); retry.type = 'button'; retry.setAttribute('data-act', 'retry');
        retry.addEventListener('click', function () { opts.onRetry(); });
        row.appendChild(retry);
      }
      fb.appendChild(row); fb.hidden = false; next.focus();
      if (opts.onAnswer) opts.onAnswer({ item: item, picked: picked, answer: item.answer, ok: ok, ms: ms, picks: picks.slice(), first: first, changes: changes, change: change, conf: conf });
    }
    check.addEventListener('click', reveal);

    var ctl = {
      root: root, item: item,
      key: function (e) {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        var t = e.target, tag = t && t.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        var k = e.key;
        if (!revealed) {
          var i = LETTERS.indexOf(String(k).toUpperCase()); if (i < 0 && /^[1-5]$/.test(k)) i = Number(k) - 1;
          if (i >= 0) { pick(i); e.preventDefault(); return; }
          if (k === 'ArrowDown' || k === 'ArrowRight') { pick(picked < 0 ? 0 : (picked + 1) % 5); e.preventDefault(); return; }
          if (k === 'ArrowUp' || k === 'ArrowLeft') { pick(picked < 0 ? 4 : (picked + 4) % 5); e.preventDefault(); return; }
          if (k === 'Enter' && picked >= 0) { reveal(); e.preventDefault(); }
        } else {
          if (tag === 'BUTTON' && k === 'Enter') return;   // let the focused button act
          if (k === 'Enter' || k === 'n' || k === 'N') { if (opts.onNext) { opts.onNext(); e.preventDefault(); } }
          else if ((k === 'r' || k === 'R') && opts.onRetry) { opts.onRetry(); e.preventDefault(); }
        }
      },
      pick: pick, check: reveal, isRevealed: function () { return revealed; }
    };
    active = ctl;
    return ctl;
  }

  document.addEventListener('keydown', function (e) { if (active && document.body.contains(active.root)) active.key(e); });
  window.AceQuestion = { version: 2, REASONS: REASONS, LETTERS: LETTERS, mount: mount };
})();
