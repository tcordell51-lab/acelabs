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

  function mount(host, item, opts) {
    opts = opts || {};
    if (!item || !Array.isArray(item.choices) || item.choices.length !== 5) throw new Error('AceQuestion: an item needs exactly five choices');
    var picked = -1, revealed = false, t0 = Date.now();
    host.textContent = '';
    var root = el('section', 'aui-q'); root.setAttribute('aria-label', 'Question');
    var meta = el('div', 'aui-q__meta');
    meta.appendChild(el('span', 'aui-chip', opts.label || item.topicName || item.topic || ''));
    if (opts.number) meta.appendChild(el('span', 'aui-small aui-num', 'Question ' + opts.number + (opts.total ? ' of ' + opts.total : '')));
    root.appendChild(meta);
    var stemId = 'aui-q-stem-' + Math.random().toString(36).slice(2, 8);
    var stem = el('p', 'aui-q__stem', item.stem); stem.id = stemId; root.appendChild(stem);

    var list = el('ul', 'aui-q__choices'); list.setAttribute('role', 'radiogroup'); list.setAttribute('aria-labelledby', stemId);
    var buttons = item.choices.map(function (text, i) {
      var li = el('li'), b = el('button', 'aui-q__choice');
      b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', 'false'); b.tabIndex = i === 0 ? 0 : -1;
      b.appendChild(el('span', 'aui-q__letter', LETTERS[i]));
      b.appendChild(el('span', 'aui-q__text', text));
      b.addEventListener('click', function () { pick(i); });
      li.appendChild(b); list.appendChild(li); return b;
    });
    root.appendChild(list);

    var actions = el('div', 'aui-q__actions');
    var check = el('button', 'aui-btn', 'Check answer'); check.type = 'button'; check.disabled = true;
    var hint = el('span', 'aui-q__hint', 'Pick a letter, then check.');
    actions.appendChild(check); actions.appendChild(hint); root.appendChild(actions);
    var fb = el('div', 'aui-q__fb'); fb.hidden = true; fb.setAttribute('aria-live', 'polite'); root.appendChild(fb);
    host.appendChild(root);

    function pick(i, focus) {
      if (revealed) return;
      picked = i;
      buttons.forEach(function (b, j) { b.setAttribute('aria-checked', j === i ? 'true' : 'false'); b.tabIndex = j === i ? 0 : -1; });
      check.disabled = false; hint.textContent = 'You picked ' + LETTERS[i] + '.';
      if (focus !== false) buttons[i].focus();
    }
    function reveal() {
      if (revealed || picked < 0) return;
      revealed = true;
      var ok = picked === item.answer, ms = Date.now() - t0;
      buttons.forEach(function (b, j) {
        b.disabled = true;
        if (j === item.answer) { b.setAttribute('data-state', 'right'); b.appendChild(el('span', 'aui-q__tag', 'Correct answer')); }
        else if (j === picked) { b.setAttribute('data-state', 'wrong'); b.appendChild(el('span', 'aui-q__tag', 'Your pick')); }
      });
      actions.hidden = true;
      var verdict = el('p', 'aui-q__verdict', (ok ? 'Correct. ' : 'Not this time. ') + 'The answer is ' + LETTERS[item.answer] + '.');
      verdict.setAttribute('data-ok', ok ? 'true' : 'false'); fb.appendChild(verdict);
      if (item.why) fb.appendChild(block('Why', item.why));
      var trap = !ok && item.traps && item.traps[picked];
      if (trap) fb.appendChild(block('The trap in ' + LETTERS[picked], trap));
      if (item.trick) fb.appendChild(block('Trick', item.trick));
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
      if (opts.onAnswer) opts.onAnswer({ item: item, picked: picked, answer: item.answer, ok: ok, ms: ms });
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
  window.AceQuestion = { version: 1, LETTERS: LETTERS, mount: mount };
})();
