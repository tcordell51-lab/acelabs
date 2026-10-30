/* =====================================================================
   Bio Stick Layer: engine
   ---------------------------------------------------------------------
   Turns a watch-only visualizer into something that sticks:
     1. Call it first: one tap on a prediction before the picture moves
        (the visualizer is veiled until then; a Skip link is always there).
     2. Watch: the engine drives the real visualizer through its frames
        and shows each frame right under the question.
     3. Verdict: Confirmed / Needs review, the why, and the named trap.
     4. One more, from memory: a closed-book check on the same idea.
     5. The card: an Ace Card in the existing deck (bio-shared.js
        addAceCard / rateAceCard), so it comes back on Today and in
        the hub's Ace Cards stack. No second scheduler. Its picture,
        hook and replay link match the question on the card: the last
        watched frame, the hook and the prediction replay for the
        prediction; the check's own view (an entry's checkFrame steps
        and checkStill parts, taken when the card is saved), checkHook
        and a replay that ends on that view for the from-memory question.

   Loaded after bio-shared.js and bio-stick-data.js. Runs after the Bio
   engine's own DOMContentLoaded init (listener order). Everything lives
   in this IIFE; bio-shared.js globals are reached by bare name behind
   typeof guards. State persists in STATE.stick via saveState(), so no
   new localStorage key exists.

   No timers, no points, no streaks, no percentages, no confidence gate.
   ===================================================================== */
(function () {
  'use strict';

  var HUB_PAGE = {
    cell: '/tools/bio/bio-cell.html',
    genetics: '/tools/bio/bio-genetics.html',
    physiology: '/tools/bio/bio-physiology.html',
    diversity: '/tools/bio/bio-diversity.html',
    devo: '/tools/bio/bio-devo.html',
    evolution: '/tools/bio/bio-evolution.html'
  };
  var FRAME_MS = 900;
  var MAX_STILL_CHARS = 40000;
  var LETTERS = ['A', 'B', 'C', 'D'];

  /* ---------- small helpers ---------- */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function reducedMotion() {
    try {
      return typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { return false; }
  }
  function resolve(sel, closest) {
    if (!sel) return null;
    var n = null;
    try { n = document.querySelector(sel); } catch (e) { return null; }
    if (n && closest) n = n.closest(closest);
    return n;
  }
  function resolveAll(sel, closest) {
    if (!sel) return [];
    var list = [];
    try { list = Array.prototype.slice.call(document.querySelectorAll(sel)); } catch (e) { return []; }
    if (closest) list = list.map(function (n) { return n.closest(closest); }).filter(Boolean);
    return list;
  }
  function textOf(sel) {
    var n = resolve(sel);
    return n ? n.textContent.replace(/\s+/g, ' ').trim() : '';
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /* ---------- Bio engine bridges (bare-name globals, guarded) ---------- */

  function stickState() {
    if (typeof STATE === 'undefined' || !STATE) return null;
    if (!STATE.stick || typeof STATE.stick !== 'object') STATE.stick = {};
    return STATE.stick;
  }
  function persist() {
    if (typeof saveState === 'function') { try { saveState(); } catch (e) { /* storage full or blocked */ } }
  }
  function cardExists(id) {
    if (!id || typeof STATE === 'undefined' || !STATE || !Array.isArray(STATE.aceCards)) return false;
    for (var i = 0; i < STATE.aceCards.length; i++) {
      if (STATE.aceCards[i].id === id && !STATE.aceCards[i].closed) return true;
    }
    return false;
  }

  /* ---------- driving a visualizer ---------- */

  function runStep(step) {
    if (!step) return;
    if (step.set) {
      var input = resolve(step.set);
      if (!input) return;
      input.value = String(step.value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (step.click) {
      var target = resolve(step.click);
      if (target) target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    } else if (step.operon) {
      if (typeof OPERON_STATE === 'undefined' || typeof renderOperon !== 'function') return;
      var o = step.operon;
      ['mode', 'lactose', 'glucose', 'trp'].forEach(function (k) {
        if (Object.prototype.hasOwnProperty.call(o, k)) OPERON_STATE[k] = o[k];
      });
      renderOperon();
    }
  }
  function runSteps(steps) {
    (steps || []).forEach(function (s) {
      try { runStep(s); } catch (e) { if (window.console) console.warn('[bio-stick] step skipped', e.message); }
    });
  }

  /* A frame snapshot: a sanitized clone of the visualizer's own picture
     at that moment. ids, inline handlers, data attributes and SMIL
     animation are stripped so the clone can never be mistaken for the
     live visualizer by bio-shared.js or by a second getElementById. */
  /* ids inside a snapshot are renamed with a unique suffix, and every
     url(#id) / href="#id" inside it is rewritten to match. The clone keeps
     its own gradients and filters (so a card shows its picture on any
     page) and can never shadow the live visualizer's ids. */
  var snapSeq = 0;
  function sanitize(node) {
    var all = [node].concat(Array.prototype.slice.call(node.querySelectorAll('*')));
    var suffix = '--s' + Date.now().toString(36) + (snapSeq++).toString(36);
    var map = {};
    all.forEach(function (n) { if (n.getAttribute && n.getAttribute('id')) map[n.getAttribute('id')] = n.getAttribute('id') + suffix; });
    function rewrite(v) {
      return v.replace(/url\(\s*(["']?)#([^"')\s]+)\1\s*\)/g, function (m, q, id) {
        return map[id] ? 'url(#' + map[id] + ')' : m;
      });
    }
    all.forEach(function (n) {
      if (!n.attributes) return;
      Array.prototype.slice.call(n.attributes).forEach(function (a) {
        var name = a.name.toLowerCase();
        if (name === 'id') { n.setAttribute('id', map[a.value] || ''); return; }
        if (name.indexOf('on') === 0 || name.indexOf('data-') === 0) { n.removeAttribute(a.name); return; }
        if ((name === 'href' || name === 'xlink:href') && a.value.charAt(0) === '#' && map[a.value.slice(1)]) {
          n.setAttribute(a.name, '#' + map[a.value.slice(1)]); return;
        }
        if (a.value.indexOf('url(') !== -1) n.setAttribute(a.name, rewrite(a.value));
      });
    });
    Array.prototype.slice.call(node.querySelectorAll('animate, animateTransform, animateMotion, script, input, button, select, textarea'))
      .forEach(function (n) { n.parentNode && n.parentNode.removeChild(n); });
    // some visualizer text uses em dashes; a frame or card the stick
    // layer shows reads them as a colon instead (house style)
    var walker = node.ownerDocument && node.ownerDocument.createTreeWalker
      ? node.ownerDocument.createTreeWalker(node, 4 /* NodeFilter.SHOW_TEXT */, null) : null;
    for (var t = walker ? walker.nextNode() : null; t; t = walker.nextNode()) {
      if (t.nodeValue.indexOf('\u2014') !== -1) t.nodeValue = t.nodeValue.replace(/\s*\u2014\s*/g, ': ');
    }
    // a check frame is taken while the visualizer still waits under the
    // closed-book veil; the copy on the card must not carry the veil
    all.forEach(function (n) {
      if (!n.classList || !n.classList.contains('stick-veiled')) return;
      n.classList.remove('stick-veiled');
      if (!n.getAttribute('class')) n.removeAttribute('class');
      n.removeAttribute('aria-hidden');
    });
    return node;
  }
  /* Some visualizers paint SVG parts through id or scoped CSS rules
     (the sarcomere's actin lines, for one). Copy each SVG element's
     computed paint onto the clone first, so stripping ids cannot strip
     the picture. Only values the clone would not get on its own are
     written: an inherited value that matches the parent, or an opacity /
     display at its initial value, is left out. That keeps a detailed
     picture small enough to ride along on an Ace Card, and keeps <use>
     shapes inheriting the fill set on the <use>. */
  var PAINT = ['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-dasharray',
    'stroke-linecap', 'stroke-linejoin', 'opacity', 'font-size', 'font-weight', 'font-family', 'display', 'visibility'];
  var NOT_INHERITED = { opacity: '1', display: 'inline' };
  // what an svg root passes down when no rule touches it
  var ROOT_INITIAL = { fill: 'rgb(0, 0, 0)', 'fill-opacity': '1', stroke: 'none', 'stroke-width': '1px',
    'stroke-opacity': '1', 'stroke-dasharray': 'none', 'stroke-linecap': 'butt', 'stroke-linejoin': 'miter' };
  // A presentation attribute written the way the browser reports its
  // computed value: #rgb / #rrggbb as rgb(r, g, b), a bare stroke width
  // or font size in px, url(#x) with quotes. Anything else is returned
  // as written, so an unusual form simply fails to match and the
  // computed value is kept.
  function asComputed(k, v) {
    v = String(v).trim();
    var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v);
    if (m) {
      var h = m[1].length === 3 ? m[1].replace(/./g, '$&$&') : m[1];
      return 'rgb(' + [0, 2, 4].map(function (j) { return parseInt(h.substr(j, 2), 16); }).join(', ') + ')';
    }
    if ((k === 'stroke-width' || k === 'font-size') && /^\d+(\.\d+)?$/.test(v)) return v + 'px';
    m = /^url\(\s*#([^)\s"']+)\s*\)$/.exec(v);
    if (m) return 'url("#' + m[1] + '")';
    return v;
  }
  function inlinePaint(src, clone) {
    if (typeof window.getComputedStyle !== 'function') return;
    var a = [src].concat(Array.prototype.slice.call(src.querySelectorAll('*')));
    var b = [clone].concat(Array.prototype.slice.call(clone.querySelectorAll('*')));
    if (a.length !== b.length) return;
    for (var i = 0; i < a.length; i++) {
      if (a[i].tagName && a[i].tagName.toLowerCase() === 'svg') {
        // paint a page rule hands the svg root (children inherit it)
        var rcs = window.getComputedStyle(a[i]);
        var rootCss = rcs ? Object.keys(ROOT_INITIAL).map(function (k) {
          var v = rcs.getPropertyValue(k);
          return v && v !== ROOT_INITIAL[k] ? k + ':' + v : '';
        }).filter(Boolean).join(';') : '';
        if (rootCss) {
          var rown = b[i].getAttribute('style');
          b[i].setAttribute('style', rootCss + (rown ? ';' + rown : ''));
        }
        continue;
      }
      if (!(a[i] instanceof window.SVGElement)) continue;
      var cs = window.getComputedStyle(a[i]);
      if (!cs) continue;
      var pcs = a[i].parentElement ? window.getComputedStyle(a[i].parentElement) : null;
      var targeted = a[i].hasAttribute('id') || a[i].hasAttribute('class');
      var css = PAINT.map(function (k) {
        var v = cs.getPropertyValue(k);
        if (!v) return '';
        // a stylesheet rule may override a presentation attribute on an
        // element it can target by id or class; keep those values
        var keep = targeted && a[i].hasAttribute(k);
        // an element no id or class rule can reach, whose own attribute
        // already gives this value, needs no copy (it keeps a detailed
        // picture under the card limit)
        if (!targeted && a[i].hasAttribute(k) && asComputed(k, a[i].getAttribute(k)) === v) return '';
        var base = Object.prototype.hasOwnProperty.call(NOT_INHERITED, k) ? NOT_INHERITED[k]
          : (pcs ? pcs.getPropertyValue(k) : null);
        return keep || v !== base ? k + ':' + v : '';
      }).filter(Boolean).join(';');
      if (!css) continue;
      var own = b[i].getAttribute('style');
      b[i].setAttribute('style', css + (own ? ';' + own : ''));
    }
  }
  /* sels: the parts to copy (the check's checkStill); the entry's still
     when left out. */
  function snapshot(entry, sels) {
    var parts = [];
    (sels && sels.length ? sels : (entry.still || [])).forEach(function (sel) {
      var src = resolve(sel);
      if (!src) return;
      var clone = src.cloneNode(true);
      try { inlinePaint(src, clone); } catch (e) { /* keep the plain clone */ }
      parts.push(sanitize(clone).outerHTML);
    });
    var cap = '';
    if (entry.caption) cap = (entry.captionLabel || '') + textOf(entry.caption);
    if (entry.captionExtra) {
      var extra = textOf(entry.captionExtra);
      if (extra) cap = cap ? cap + ' | ' + extra : extra;
    }
    return { html: parts.join(''), caption: cap };
  }
  function captureFrames(entry) {
    runSteps(entry.setup);
    var frames = [];
    var list = entry.frames && entry.frames.length ? entry.frames : [[]];
    list.forEach(function (steps) {
      runSteps(steps);
      frames.push(snapshot(entry));
    });
    return frames;
  }
  /* The from-memory check's own view: an entry with checkFrame steps
     and/or checkStill parts has one; without either, the check reuses
     the last prediction frame. checkView runs the steps (they set the
     whole state, whatever the student did since) and takes the parts. */
  function hasCheckView(entry) {
    return (Array.isArray(entry.checkFrame) && entry.checkFrame.length > 0) ||
      (Array.isArray(entry.checkStill) && entry.checkStill.length > 0);
  }
  function checkView(entry) {
    runSteps(entry.checkFrame);
    return snapshot(entry, entry.checkStill);
  }

  /* ---------- lab tabs (Body Lab, Genetics Lab) ---------- */

  function openTab(entry) {
    if (!entry.tab) return;
    var mod = resolve('.lab-module[data-module="' + entry.tab + '"]');
    if (!mod || mod.classList.contains('active')) return;
    var flagship = mod.closest('.flagship');
    var btn = flagship && flagship.querySelector('.lab-tabs > button[data-tab="' + entry.tab + '"]');
    if (btn) btn.click();
  }

  /* ---------- the panel ---------- */

  function optionsHtml(opts, name) {
    return opts.map(function (t, i) {
      return '<button type="button" class="stick-opt" data-i="' + i + '" aria-describedby="' + name + '">' +
        '<span class="stick-let">' + LETTERS[i] + '</span><span class="stick-opt-t">' + esc(t) + '</span></button>';
    }).join('');
  }

  function verdictHtml(block, picked) {
    var ok = picked === block.key;
    var trap = !ok && block.traps && block.traps[picked];
    return '<div class="stick-verdict-row ' + (ok ? 'is-ok' : 'is-review') + '">' +
      '<span class="stick-lbl">' + (ok ? 'Confirmed' : 'Needs review') + '</span>' +
      (ok ? '' : '<span class="stick-key">Answer: ' + esc(block.options[block.key]) + '</span>') +
      '</div>' +
      (trap ? '<p class="stick-trap"><b>The trap:</b> ' + esc(trap) + '</p>' : '') +
      '<p class="stick-why">' + esc(block.why) + '</p>';
  }

  function Panel(entry, anchor) {
    this.entry = entry;
    this.anchor = anchor;
    this.frames = null;
    this.timer = null;
    this.node = el('section', 'stick');
    this.node.id = 'stick-' + entry.id;
    this.node.setAttribute('aria-label', 'Call it first: ' + entry.title);
    var where = entry.where === 'afterbegin' ? 'afterbegin' : 'beforebegin';
    anchor.insertAdjacentElement(where, this.node);
    this.veils = entry.veil ? resolveAll(entry.veil, entry.veilClosest) : [anchor];
    this.veils = this.veils.filter(function (v) { return v && !v.classList.contains('stick'); });
  }

  Panel.prototype.record = function () {
    var st = stickState();
    if (!st) return null;
    if (!st[this.entry.id]) st[this.entry.id] = { history: [] };
    return st[this.entry.id];
  };

  Panel.prototype.veil = function (on) {
    this.veils.forEach(function (v) {
      v.classList.toggle('stick-veiled', !!on);
      if (on) v.setAttribute('aria-hidden', 'true'); else v.removeAttribute('aria-hidden');
    });
  };

  Panel.prototype.render = function () {
    var rec = this.record();
    var done = rec && rec.done && (!rec.cardId || cardExists(rec.cardId));
    if (rec && rec.skipped && !done) return this.renderSkipped();
    if (done) return this.renderDone(false);
    this.renderFresh(false);
  };

  Panel.prototype.renderFresh = function (retake) {
    var e = this.entry, self = this;
    this.retake = !!retake;
    this.stop();
    this.veil(true);
    this.node.className = 'stick is-fresh';
    this.node.innerHTML =
      '<div class="stick-head"><span class="stick-kicker">Call it first</span>' +
      '<span class="stick-title">' + esc(e.title) + '</span></div>' +
      '<p class="stick-sub">Guess before you watch. A miss here still helps it stick.</p>' +
      '<p class="stick-q" id="stick-q-' + e.id + '">' + esc(e.predict.q) + '</p>' +
      '<div class="stick-opts" role="group" aria-label="Your prediction">' + optionsHtml(e.predict.options, 'stick-q-' + e.id) + '</div>' +
      '<div class="stick-stage" hidden><div class="stick-frame"></div><p class="stick-cap" aria-live="polite"></p></div>' +
      '<div class="stick-verdict" hidden aria-live="polite"></div>' +
      '<div class="stick-actions"><button type="button" class="stick-link stick-skip">Skip for now and explore</button></div>';
    Array.prototype.forEach.call(this.node.querySelectorAll('.stick-opts .stick-opt'), function (b) {
      b.addEventListener('click', function () { self.onPredict(+b.getAttribute('data-i')); });
    });
    this.node.querySelector('.stick-skip').addEventListener('click', function () { self.onSkip(); });
  };

  Panel.prototype.renderSkipped = function () {
    var self = this;
    this.stop();
    this.veil(false);
    this.node.className = 'stick is-compact';
    this.node.innerHTML =
      '<div class="stick-compact"><span class="stick-kicker">Call it first</span>' +
      '<span class="stick-compact-t">' + esc(this.entry.title) + ': a one-tap prediction is waiting.</span>' +
      '<button type="button" class="stick-btn stick-btn-quiet stick-try">Try it</button></div>';
    this.node.querySelector('.stick-try').addEventListener('click', function () {
      var rec = self.record();
      if (rec) { rec.skipped = false; persist(); }
      self.renderFresh(false);
    });
  };

  Panel.prototype.onSkip = function () {
    var rec = this.record();
    if (rec) {
      rec.skipped = true;
      rec.history.push({ at: Date.now(), skipped: true });
      if (rec.history.length > 20) rec.history = rec.history.slice(-20);
      persist();
    }
    this.renderSkipped();
  };

  Panel.prototype.lockOptions = function (scope, picked, key) {
    Array.prototype.forEach.call(scope.querySelectorAll('.stick-opt'), function (b) {
      var i = +b.getAttribute('data-i');
      b.disabled = true;
      if (i === picked) b.classList.add('is-picked');
      if (i === key) b.classList.add('is-key');
    });
  };

  Panel.prototype.onPredict = function (i) {
    var e = this.entry;
    this.attempt = { at: Date.now(), p: i, pOk: i === e.predict.key, retake: this.retake };
    this.lockOptions(this.node.querySelector('.stick-opts'), i, -1);
    var skip = this.node.querySelector('.stick-skip');
    if (skip) skip.parentNode.removeChild(skip);
    this.veil(false);
    this.frames = captureFrames(e);
    this.node.className = 'stick is-watching';
    var stage = this.node.querySelector('.stick-stage');
    stage.hidden = false;
    this.play(this.node.querySelector('.stick-frame'), this.node.querySelector('.stick-cap'), this.reveal.bind(this));
  };

  Panel.prototype.stop = function () {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
  };

  Panel.prototype.play = function (frameEl, capEl, then) {
    var frames = this.frames || [], self = this, i = 0;
    this.stop();
    function show(k) {
      var f = frames[k] || { html: '', caption: '' };
      frameEl.innerHTML = f.html;
      capEl.textContent = f.caption || '';
      capEl.hidden = !f.caption;
    }
    if (reducedMotion() || frames.length < 2) {
      show(frames.length - 1);
      if (then) then();
      return;
    }
    (function step() {
      show(i);
      if (i >= frames.length - 1) { self.timer = null; if (then) then(); return; }
      i += 1;
      self.timer = setTimeout(step, FRAME_MS);
    })();
  };

  Panel.prototype.reveal = function () {
    var e = this.entry, self = this;
    this.lockOptions(this.node.querySelector('.stick-opts'), this.attempt.p, e.predict.key);
    var v = this.node.querySelector('.stick-verdict');
    v.hidden = false;
    v.innerHTML = verdictHtml(e.predict, this.attempt.p) +
      (e.hook ? '<p class="stick-hook">' + esc(e.hook) + '</p>' : '') +
      '<div class="stick-actions"><button type="button" class="stick-btn stick-next">One more, from memory</button></div>';
    this.node.className = 'stick is-revealed';
    v.querySelector('.stick-next').addEventListener('click', function () { self.renderCheck(); });
  };

  Panel.prototype.renderCheck = function () {
    var e = this.entry, self = this;
    this.veil(true);   // closed book: the live picture waits under the veil again
    this.node.className = 'stick is-checking';
    this.node.innerHTML =
      '<div class="stick-head"><span class="stick-kicker">From memory</span>' +
      '<span class="stick-title">' + esc(e.title) + '</span></div>' +
      '<p class="stick-q" id="stick-c-' + e.id + '">' + esc(e.check.q) + '</p>' +
      '<div class="stick-opts" role="group" aria-label="Your answer">' + optionsHtml(e.check.options, 'stick-c-' + e.id) + '</div>' +
      '<div class="stick-verdict" hidden aria-live="polite"></div>';
    Array.prototype.forEach.call(this.node.querySelectorAll('.stick-opt'), function (b) {
      b.addEventListener('click', function () { self.onCheck(+b.getAttribute('data-i')); });
    });
    try { this.node.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' }); } catch (err) { /* old browsers */ }
  };

  Panel.prototype.onCheck = function (i) {
    var e = this.entry, self = this;
    this.attempt.c = i;
    this.attempt.cOk = i === e.check.key;
    this.lockOptions(this.node, i, e.check.key);
    var saved = this.save();
    var v = this.node.querySelector('.stick-verdict');
    v.hidden = false;
    v.innerHTML = verdictHtml(e.check, i) +
      '<p class="stick-saved">' + esc(saved) + '</p>' +
      '<div class="stick-actions">' +
      '<button type="button" class="stick-btn stick-done-btn">Done</button>' +
      '</div>';
    v.querySelector('.stick-done-btn').addEventListener('click', function () { self.renderDone(true); });
  };

  /* The card rule: one card per visualizer, written on the first full
     pass only (retakes never write or rate, so massed repeats cannot
     look like spaced recall).
       - any Needs review: a card for the question that slipped, due now
         (the deck's own default for a new card)
       - both Confirmed: a card for the from-memory question, rated Good
         once, so the deck brings it back tomorrow (spacing for clean
         passes too, not only for misses). */
  Panel.prototype.save = function () {
    var e = this.entry, a = this.attempt, rec = this.record();
    var msg;
    if (rec) {
      rec.history.push({ at: a.at, p: a.p, pOk: a.pOk, c: a.c, cOk: a.cOk, retake: !!a.retake });
      if (rec.history.length > 20) rec.history = rec.history.slice(-20);
    }
    if (a.retake && rec && rec.done) {
      persist();
      return 'Practice run. Nothing in Ace Cards changes.';
    }
    var block = a.pOk ? e.check : e.predict;
    var clean = a.pOk && a.cOk;
    var card = null;
    if (typeof addAceCard === 'function') {
      try {
        card = addAceCard({
          q: esc(block.q),
          quickHit: block.answer,
          explanation: this.cardBody(block, this.cardFrame(block)),
          origin: 'Visualizer: ' + e.title,
          subject: e.hub,
          nodeId: this.nodeId(),
          why: block.why
        });
        if (card && clean && typeof rateAceCard === 'function' && (card.reps || 0) === 0) rateAceCard(card.id, 3);
      } catch (err) { if (window.console) console.warn('[bio-stick] card not saved', err.message); }
    }
    if (rec) {
      rec.done = today();
      rec.skipped = false;
      rec.pOk = a.pOk;
      rec.cOk = a.cOk;
      if (card) rec.cardId = card.id;
    }
    persist();
    if (!card) msg = 'Saved here. No Ace Card was made for this one.';
    else if (clean) msg = 'Saved to your Ace Cards. It comes back in a day.';
    else msg = 'Saved to your Ace Cards, ready for a second look.';
    return msg;
  };

  /* The picture for a card. A card about the prediction keeps the last
     frame the student watched. A card about the from-memory check gets
     the check's own view when the entry has one (checkView: checkFrame
     steps run now, while the closed-book veil is still on, then the
     checkStill parts, or the still, are copied), because the check
     often asks about a different state or a different part of the same
     visualizer (tonicity: a plant cell in salt water, not a red cell in
     pure water; respiration: the Krebs stage text, not the ETC). The
     visualizer is left on that state, so Done shows the student the
     picture their card holds; Watch it again replays the prediction
     frames from their own setup. */
  Panel.prototype.cardFrame = function (block) {
    var e = this.entry;
    this.cardSnap = null;
    if (block === e.check && hasCheckView(e)) {
      // if the view cannot be taken, the card goes without a picture
      // (never with the prediction's picture, which shows another question)
      try {
        this.cardSnap = checkView(e);
      } catch (err) { if (window.console) console.warn('[bio-stick] check frame skipped', err.message); }
      return this.cardSnap;
    }
    return this.frames && this.frames.length ? this.frames[this.frames.length - 1] : null;
  };

  /* The card back. Hook and replay link follow the card's question too:
     a check card carries the entry's checkHook (no hook line when there
     is none, since the prediction hook can point at a trap of the check)
     and, when the check has its own view, links to #stick-<id>-check,
     a replay that ends on that view. */
  Panel.prototype.cardBody = function (block, frame) {
    var e = this.entry, isCheck = block === e.check;
    // a picture over the card limit is left off rather than swapped for
    // one that shows a different question
    var pic = frame && frame.html && frame.html.length <= MAX_STILL_CHARS
      ? '<div class="stick-card-pic">' + frame.html + '</div>' : '';
    var hook = isCheck ? e.checkHook : e.hook;
    var href = (HUB_PAGE[e.hub] || '') + '#stick-' + e.id + (isCheck && hasCheckView(e) ? '-check' : '');
    // Words first, picture after: the card back can clip on a phone, and
    // the why is what has to be read.
    return '<p>' + esc(block.why) + '</p>' +
      (hook ? '<p><b>Hook:</b> ' + esc(hook) + '</p>' : '') +
      pic +
      (HUB_PAGE[e.hub] ? '<p class="stick-card-link"><a href="' + href + '">See it move again</a></p>' : '');
  };

  Panel.prototype.nodeId = function () {
    var sec = this.anchor.closest ? this.anchor.closest('section.node[data-node]') : null;
    return sec ? sec.getAttribute('data-node') : '';
  };

  Panel.prototype.renderDone = function (justNow) {
    var e = this.entry, self = this, rec = this.record() || {};
    this.stop();
    this.veil(false);
    var line = justNow ? 'Done. The picture below is yours to play with.'
      : 'You worked through it' + (rec.done ? ' on ' + esc(rec.done) : '') + '.';
    this.node.className = 'stick is-compact is-done';
    this.node.innerHTML =
      '<div class="stick-compact"><span class="stick-kicker">Call it first</span>' +
      '<span class="stick-compact-t">' + esc(e.title) + ': ' + line + '</span>' +
      '<span class="stick-compact-actions">' +
      '<button type="button" class="stick-btn stick-btn-quiet stick-replay">Watch it again</button>' +
      '<button type="button" class="stick-btn stick-btn-quiet stick-retake">Try it fresh</button>' +
      '</span></div>' +
      '<div class="stick-stage" hidden><div class="stick-frame"></div><p class="stick-cap" aria-live="polite"></p></div>';
    this.node.querySelector('.stick-replay').addEventListener('click', function () { self.replay(); });
    this.node.querySelector('.stick-retake').addEventListener('click', function () { self.renderFresh(true); });
  };

  /* withCheck (a check card's #stick-<id>-check link): after the
     prediction frames, end on the check's own view, so the motion ends
     on the picture the card holds. */
  Panel.prototype.replay = function (withCheck) {
    var stage = this.node.querySelector('.stick-stage');
    if (!stage) return;
    this.frames = captureFrames(this.entry);
    if (withCheck && hasCheckView(this.entry)) {
      try { this.frames.push(checkView(this.entry)); } catch (err) { if (window.console) console.warn('[bio-stick] check frame skipped', err.message); }
    }
    stage.hidden = false;
    this.play(stage.querySelector('.stick-frame'), stage.querySelector('.stick-cap'), null);
  };

  /* ---------- validation and boot ---------- */

  function validEntry(e) {
    var ok = e && typeof e.id === 'string' && e.mount && e.predict && e.check &&
      Array.isArray(e.predict.options) && e.predict.options.length >= 2 &&
      Array.isArray(e.check.options) && e.check.options.length >= 2 &&
      e.predict.key >= 0 && e.predict.key < e.predict.options.length &&
      e.check.key >= 0 && e.check.key < e.check.options.length &&
      HUB_PAGE.hasOwnProperty(e.hub);
    if (!ok && window.console) console.warn('[bio-stick] skipped bad entry', e && e.id);
    return ok;
  }

  var panels = {};

  function boot() {
    var entries = Array.isArray(window.BIO_STICK_ENTRIES) ? window.BIO_STICK_ENTRIES : [];
    entries.forEach(function (e) {
      if (!validEntry(e) || panels[e.id]) return;
      var anchor = resolve(e.mount, e.closest);
      if (!anchor) return;
      try {
        var p = new Panel(e, anchor);
        panels[e.id] = p;
        p.render();
      } catch (err) { if (window.console) console.warn('[bio-stick] panel failed', e.id, err.message); }
    });
    openFromHash();
  }

  /* #stick-<id> opens a panel (and replays it once done); a check
     card's #stick-<id>-check also ends the replay on the check's view.
     No entry id ends in -check (the validator enforces it). */
  function openFromHash() {
    var m = /^#stick-([a-z0-9-]+)$/.exec(window.location.hash || '');
    if (!m) return;
    var id = m[1], withCheck = false;
    if (!panels[id] && /-check$/.test(id)) { id = id.slice(0, -'-check'.length); withCheck = true; }
    var p = panels[id];
    if (!p) return;
    openTab(p.entry);
    try { p.node.scrollIntoView({ block: 'start' }); } catch (e) { /* old browsers */ }
    if (p.node.classList.contains('is-done')) p.replay(withCheck);
  }

  window.BioStick = { boot: boot, panels: panels, version: 1 };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.addEventListener('hashchange', openFromHash);
})();
