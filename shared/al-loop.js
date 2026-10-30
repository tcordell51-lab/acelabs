/* =====================================================================
   AceLoop: the shared Call it first engine (served as shared/al-loop.js?v=1).
   Needs shared/al-kit.js (window.AL) loaded first; styles in al-kit.css
   (the pieces) and al-loop.css (the bench layout).

     AceLoop.mount(host, entry, driver, opts) -> controller

   renders one bench: the loop band, the field, the calls, the verdict,
   the drive, the closed-book recall and the Ace Card. Beats, shown to the
   student as the band Predict, Play, Prove, Keep:
     call -> watch -> verdict (+ drive) -> recall -> card -> done

   entry  = { id, section, subtopic, title,
              stage:   { tags: [left, right], ratio: '372/228', surface: 'specimen'|'paper',
                         noun: 'slide', before: 'caption before the call' },
              predict: { q, options[2..4], key, traps[], trapNames[], why, hook, keyLead, replan[] },
              check:   { q, options[2..4], key, traps[], trapNames[], why, keyLead },
              card:    { idea, recallIdea, hook, pic: 'pair'|'single', labels: [before, after] },
              honesty: 'Each position is a fresh slide. Burst cells never re-form.',
              links:   { night: {href, label}, sheet: {href, label}, set: {href, label} } }
   driver = { kind: 'steps'|'tween'|'custom',
              render(state) -> { svg, caption, aria, tag },   // a pure drawing of one state
              frames: [state, ...],        // steps: the frames, one per --m-frame
              stops: [{ t, caption }],     // tween: named stops; render(t) for t in 0..1
              duration: ms,                // tween: the Watch beat (default 2.7 to 3.6 s)
              before: state, after: state, // the "before" picture; the picture back after the recall
              drive: { label, min, max, step, value, words(v), name(v), ticks[], hint, track, state(v) },
              wipe:  { render(state) -> svg, words(state), at },   // Drawing / Real
              setup(ctx), call(ctx), play(ctx) -> Promise,         // custom (the PAT fold)
              stills(kind) -> html,        // still panels for reduced motion
              cardView: 'x y w h',         // optional: crop render() for the card picture
              cardPic(from) -> html }      // optional: the whole Ace Card picture
   opts   = { onCard(card), onResult(result), next: {href, label}, kicker, level,
              stuck: { [act]: fn }, due }

   House rules this file enforces: one tap per call; Skip is always there
   and is recorded as "Shown without a call" (never a miss); no timer, no
   points, no confidence gate; the verdict words are Confirmed / Needs
   review only; the key is tagged "Answer" and a different pick "Your
   call". A miss writes its Ace Card at the verdict (through opts.onCard,
   else AceProgress.addPlayCard, the play-cards adapter); the flight to
   the Review door only shows where it went. A clean loop offers Keep it.
   When the loop ends, AceProgress.notePlay(result) records the call, so
   Today's plan knows what was played and re-plans after a miss.
   Reduced motion: auto-play becomes a Next frame button that keeps every
   frame and its caption; tweens jump stop to stop; custom drivers show
   their still panels; the card skips its flight and keeps its toast.
   Content strings are authored data: plain text plus <sub> <sup> <b>
   <i> <em> <strong> <br>; anything else is escaped.
   ===================================================================== */
(function () {
  'use strict';
  if (window.AceLoop) return;
  var AL = window.AL;
  if (!AL) { if (window.console) console.warn('[AceLoop] load shared/al-kit.js first'); return; }

  var L = ['A', 'B', 'C', 'D', 'E'];
  var SECTIONS = { bio: 'Bio', gchem: 'GChem', ochem: 'OChem', pat: 'PAT', rc: 'RC', qr: 'QR' };
  var NOUN = { bio: 'slide', gchem: 'curve', ochem: 'picture', pat: 'sheet', rc: 'passage', qr: 'picture' };
  var LEAD = { bio: 'The slide says', gchem: 'The curve says', ochem: 'The answer', pat: 'The sheet says', rc: 'The passage says', qr: 'The answer' };
  var LABELS = { confirmed: 'Confirmed', 'needs-review': 'Needs review', shown: 'Shown without a call' };
  var MAX_PIC = 60000;
  var esc = AL.esc;

  /* trusted authored text: escape, then allow a few inline tags back */
  function rich(s) {
    return esc(s).replace(/&lt;(\/?)(sub|sup|b|i|em|strong)&gt;/g, '<$1$2>').replace(/&lt;br\s*\/?&gt;/g, '<br>');
  }
  function plain(s) { return String(s == null ? '' : s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(); }
  function nounOf(entry) { return (entry.stage && entry.stage.noun) || NOUN[entry.section] || 'picture'; }
  function hookOf(entry) { return (entry.predict && entry.predict.hook) || entry.hook || (entry.card && entry.card.hook) || ''; }
  function emit(node, name, detail) {
    try { node.dispatchEvent(new CustomEvent('aceloop:' + name, { bubbles: true, detail: detail })); } catch (e) { /* old browsers */ }
  }

  /* ---------- copy rules (the per-section validators reuse these) ---------- */
  var COPY_RULES = [
    [/[^\x09\x0a\x0d\x20-\x7e]/, 'non-ASCII character'],
    [/\b(wrong|incorrect|failed)\b/i, 'a verdict word other than Confirmed / Needs review'],
    [/\bstreaks?\b/i, 'streak'], [/\b(\d+|earn(ed)?|bonus|your|total)\s+points\b/i, 'points'], [/\bXP\b/, 'XP'],
    [/\bleaderboards?\b/i, 'leaderboard'], [/\bbest scores?\b/i, 'best score'], [/\bbadges?\b/i, 'badge'],
    [/\bdays? (left|to go)\b/i, 'countdown'], [/\bconfiden(ce|t)\s+(rating|level|scale)\b/i, 'confidence rating']
  ];
  function copyProblems(s) {
    var out = [];
    COPY_RULES.forEach(function (r) { if (r[0].test(String(s))) out.push(r[1]); });
    return out;
  }

  /* ---------- the entry and driver contract ---------- */
  function validate(entry, driver) {
    var p = [];
    function strs(o, path) {
      if (o == null) return;
      if (typeof o === 'string') { copyProblems(o).forEach(function (m) { p.push(path + ': ' + m); }); return; }
      if (Array.isArray(o)) { o.forEach(function (v, i) { strs(v, path + '[' + i + ']'); }); return; }
      if (typeof o === 'object') Object.keys(o).forEach(function (k) { if (k !== 'href') strs(o[k], path + '.' + k); });
    }
    function block(b, name, need) {
      if (!b) { if (need) p.push(name + ': missing'); return false; }
      var n = Array.isArray(b.options) ? b.options.length : 0;
      if (!b.q) p.push(name + '.q: missing');
      if (n < 2 || n > 4) p.push(name + '.options: 2 to 4 options, found ' + n);
      if (!(b.key >= 0 && b.key < n)) p.push(name + '.key: out of range');
      for (var i = 0; i < n; i++) {
        if (i === b.key) continue;
        if (!b.traps || !b.traps[i]) p.push(name + '.traps[' + i + ']: every option but the key needs a trap line');
        if (!b.trapNames || !b.trapNames[i]) p.push(name + '.trapNames[' + i + ']: every option but the key needs a trap name');
      }
      if (!b.why) p.push(name + '.why: missing');
      return n >= 2 && b.key >= 0 && b.key < n;
    }
    entry = entry || {};
    driver = driver || {};
    if (!entry.id) p.push('id: missing');
    if (!SECTIONS[entry.section]) p.push('section: one of ' + Object.keys(SECTIONS).join(', '));
    if (!entry.title) p.push('title: missing');
    var usable = block(entry.predict, 'predict', true);
    block(entry.check, 'check', true);
    if (!hookOf(entry)) p.push('hook: missing');
    if (!entry.card || !entry.card.idea) p.push('card.idea: missing');
    if (['steps', 'tween', 'custom'].indexOf(driver.kind) < 0) p.push('driver.kind: steps, tween or custom');
    if (driver.kind === 'steps' && !(Array.isArray(driver.frames) && driver.frames.length >= 2)) p.push('driver.frames: at least 2');
    if ((driver.kind === 'steps' || driver.kind === 'tween') && typeof driver.render !== 'function') p.push('driver.render: missing');
    if (driver.kind === 'custom') {
      if (typeof driver.play !== 'function') p.push('driver.play: missing');
      if (typeof driver.stills !== 'function') p.push('driver.stills: still panels for reduced motion');
    }
    strs({ title: entry.title, subtopic: entry.subtopic, stage: entry.stage, predict: entry.predict, check: entry.check, card: entry.card, honesty: entry.honesty, links: entry.links, hook: entry.hook }, 'entry');
    if (driver.drive) strs({ label: driver.drive.label, hint: driver.drive.hint, ticks: driver.drive.ticks }, 'driver.drive');
    p.fatal = !usable || ['steps', 'tween', 'custom'].indexOf(driver.kind) < 0;
    return p;
  }

  /* =====================================================================
     The pieces (usable on their own, as in the mock)
     ===================================================================== */

  /* options: one tap locks the call */
  function options(host, opts, onPick) {
    delete host.dataset.locked;
    host.innerHTML = opts.map(function (o, i) {
      return '<button class="opt" type="button" aria-pressed="false" data-i="' + i + '"><span class="let" aria-hidden="true">' + L[i] + '</span>' +
        '<span class="txt">' + rich(o) + '</span><span class="tag" hidden></span></button>';
    }).join('');
    Array.prototype.forEach.call(host.querySelectorAll('.opt'), function (b) {
      b.addEventListener('click', function () {
        if (host.dataset.locked) return;
        hold(host, +b.getAttribute('data-i'));
        onPick(+b.getAttribute('data-i'));
      });
    });
    return host;
  }
  /* hold: the call is made, the picture plays (pick -1: shown without a call) */
  function hold(host, pick) {
    host.dataset.locked = '1';
    Array.prototype.forEach.call(host.querySelectorAll('.opt'), function (b, i) { b.disabled = true; b.setAttribute('aria-pressed', String(i === pick)); });
  }
  /* reveal: the key says Answer, a different pick says Your call */
  function reveal(host, pick, key) {
    Array.prototype.forEach.call(host.querySelectorAll('.opt'), function (b, i) {
      var tag = b.querySelector('.tag');
      b.disabled = true;
      b.setAttribute('aria-pressed', 'false');
      b.classList.remove('key', 'mine', 'dim');
      if (i === key) { b.classList.add('key'); tag.hidden = false; tag.innerHTML = AL.icon('good', 'xs') + (i === pick ? 'Answer, your call' : 'Answer'); }
      else if (i === pick) { b.classList.add('mine'); tag.hidden = false; tag.innerHTML = AL.icon('review', 'xs') + 'Your call'; }
      else { b.classList.add('dim'); tag.hidden = true; }
    });
  }
  /* collapse: after the verdict the calls fold to the two that matter */
  function collapse(host, pick, key) {
    host.classList.add('collapsed');
    Array.prototype.forEach.call(host.querySelectorAll('.opt'), function (b, i) { b.hidden = !(i === key || i === pick); });
  }

  /* verdict: Confirmed, Needs review or Shown without a call. Never shakes. */
  function verdict(o) {
    var lead = o.keyLead || 'The slide says';
    if (o.skipped) {
      return '<div class="verdict plain reveal-in" role="status"><div class="vh">' + AL.icon('skipcall', 'sm') + LABELS.shown + '</div>' +
        (o.keyText ? '<p><b>' + esc(lead) + ': ' + rich(o.keyText) + '.</b></p>' : '') +
        (o.why ? '<p>' + rich(o.why) + '</p>' : '') + (o.hook ? '<p class="hook">' + rich(o.hook) + '</p>' : '') + '</div>';
    }
    return '<div class="verdict ' + (o.ok ? 'good' : 'trap') + ' reveal-in" role="status">' +
      '<div class="vh">' + AL.icon(o.ok ? 'good' : 'review', 'sm') + (o.ok ? LABELS.confirmed : LABELS['needs-review']) + '</div>' +
      '<p>' + (o.callLine ? '<b>' + rich(o.callLine) + '</b>' : '<b>Your call: ' + rich(o.callText) + '.</b>') + (o.ok || !o.trap ? '' : ' ' + rich(o.trap)) + '</p>' +
      (o.ok || !o.keyText ? '' : '<p><b>' + esc(lead) + ': ' + rich(o.keyText) + '.</b></p>') +
      (o.trapName && !o.ok ? '<span class="trapname">Trap: ' + rich(o.trapName) + '</span>' : '') +
      (o.why ? '<p>' + rich(o.why) + '</p>' : '') + (o.hook ? '<p class="hook">' + rich(o.hook) + '</p>' : '') + '</div>';
  }

  /* an Ace Card: the picture the student saw, the idea, the hook, when it is back */
  function card(o) {
    return '<div class="acecard" data-sec="' + esc(o.sec) + '"' + (o.id ? ' id="' + esc(o.id) + '"' : '') + '>' +
      '<div class="pic"' + (o.picAria ? ' role="img" aria-label="' + esc(o.picAria) + '"' : ' aria-hidden="true"') + '>' + (o.pic || '') + '</div>' +
      '<div class="ac-k"><span><i class="mark" aria-hidden="true"></i>Ace Card / ' + rich(o.where) + '</span><span>' + esc(o.made || 'New') + '</span></div>' +
      '<div class="ac-t">' + rich(o.idea) + '</div>' +
      (o.hook ? '<div class="ac-h">' + rich(o.hook) + '</div>' : '') +
      '<div class="ac-when"><i class="on" aria-hidden="true"></i><i aria-hidden="true"></i><i aria-hidden="true"></i><span>Back ' + esc(o.back || AL.backOn(1)) + '</span></div></div>';
  }

  /* keep: the card flies to the Review door (or o.to), the dot updates, a
     toast says when it is back. Reduced motion: no flight, same toast. */
  function keep(cardEl, o) {
    o = o || {};
    AL.fly(cardEl, function () {
      if (window.AceShell && typeof window.AceShell.refreshDue === 'function') window.AceShell.refreshDue();
      else if (o.due != null) AL.setDue(o.due);
      AL.toast(o.toast || ('Card saved to Review. Back ' + AL.backOn(1) + '.'));
      if (o.done) o.done();
    }, o.to);
  }

  /* ---------- Stuck? Three good moves, tuned per section; never unprompted ----------
     act: 'later' (move on, the card waits in Review, marked), 'method'
     (watch it once with no call), 'breath' (a still four-count box; QR and
     GChem only), or a page handler; href: a link. */
  var STUCK = {
    bio: ['Feeling lost? Pick one.', [
      { t: 'Three quick recall cards', s: 'From Bio ideas you already hold.', href: '/review/?sec=bio' },
      { t: 'Step back to the hub overview', s: 'See where this sits, and what is left.', href: '/tools/bio/' },
      { t: 'Move on for now', s: 'This one waits in Review, marked.', act: 'later' }]],
    gchem: ['You have hit a wall. Pick one.', [
      { t: 'Three quick wins', s: 'From GChem skills you already hold.', href: '/review/?sec=gchem' },
      { t: 'A short breath', s: 'Four counts in, hold, out, hold. Then back.', act: 'breath' },
      { t: 'Move on for now', s: 'This one waits in Review, marked.', act: 'later' }]],
    ochem: ['Stuck on a mechanism? Pick one.', [
      { t: 'Three quick wins', s: 'From reaction families you already hold.', href: '/review/?sec=ochem' },
      { t: 'Open the reagent reference', s: 'Look it up and keep moving.', href: '/tools/ochem/' },
      { t: 'Move on for now', s: 'This one waits in Review, marked.', act: 'later' }]],
    pat: ['Stuck on a figure? Pick one.', [
      { t: 'Three quick wins', s: 'From question types you already hold.', href: '/review/?sec=pat' },
      { t: 'Watch the method once', s: 'Step by step, with no call.', act: 'method' },
      { t: 'Move on for now', s: 'This one waits in Review, marked.', act: 'later' }]],
    rc: ['Lost in the passage? Pick one.', [
      { t: 'Three quick wins', s: 'From question types you already hold.', href: '/review/?sec=rc' },
      { t: 'Find the proof line first', s: 'Search before you study.', act: 'proof', fallback: 'method' },
      { t: 'Move on for now', s: 'This one waits in Review, marked.', act: 'later' }]],
    qr: ['You have hit a wall. Pick one.', [
      { t: 'Three quick wins', s: 'From QR skills you already hold.', href: '/review/?sec=qr' },
      { t: 'A short breath', s: 'Four counts in, hold, out, hold. Then back.', act: 'breath' },
      { t: 'Move on for now', s: 'This one waits in Review, marked.', act: 'later' }]]
  };
  var METHOD = { t: 'Watch it once', s: 'Step by step, with no call.', act: 'method' };
  function breathHtml(id) {
    return '<h2 id="' + id + '">Four counts, four sides</h2>' +
      '<svg class="breath" viewBox="0 0 220 150" role="img" aria-label="A square with one side per step: in for four, hold for four, out for four, hold for four.">' +
      '<rect x="50" y="25" width="120" height="100" rx="6" fill="none" stroke="currentColor" stroke-width="2.5"/>' +
      '<g font-family="JetBrains Mono, monospace" font-size="12" fill="currentColor" text-anchor="middle">' +
      '<text x="110" y="16">In, 4</text><text x="196" y="79">Hold, 4</text><text x="110" y="144">Out, 4</text><text x="24" y="79">Hold, 4</text></g>' +
      '<path d="M50 25h40" stroke="#C9A84C" stroke-width="5" stroke-linecap="round"/></svg>' +
      '<p>Trace the square with your eyes: in for four, hold for four, out for four, hold for four. Twice around, then back.</p>';
  }
  function stuck(sec, opener, handlers) {
    handlers = handlers || {};
    var s = STUCK[sec] || STUCK.bio, hid = 'al-stuck-' + Math.random().toString(36).slice(2, 7);
    var opts = s[1].map(function (o) {
      if (o.act && o.act !== 'later' && o.act !== 'breath' && !handlers[o.act]) return handlers[o.fallback] ? METHOD : null;
      return o;
    }).filter(Boolean);
    var back = document.createElement('div');
    back.className = 'al sheet-back';
    back.innerHTML = '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="' + hid + '">' +
      '<div class="sheet-body"><h2 id="' + hid + '">' + esc(s[0]) + '</h2><p>No need to explain. Any of these is a good move.</p>' +
      opts.map(function (o, i) {
        var inner = '<b>' + esc(o.t) + '</b><span>' + esc(o.s) + '</span>';
        return o.href ? '<a class="so" href="' + esc(o.href) + '">' + inner + '</a>' : '<button class="so" type="button" data-k="' + i + '">' + inner + '</button>';
      }).join('') + '</div>' +
      '<button class="close" type="button">Back to where I was</button></div>';
    document.body.appendChild(back);
    var sheet = back.querySelector('.sheet');
    function focusables() { return Array.prototype.slice.call(sheet.querySelectorAll('a[href],button:not([disabled])')); }
    function close() {
      if (back.parentNode) back.parentNode.removeChild(back);
      if (opener && opener.focus) opener.focus();
    }
    back.addEventListener('click', function (e) {
      if (e.target === back || e.target.closest('.close')) { close(); return; }
      var b = e.target.closest('button.so');
      if (!b) return;
      var o = opts[+b.getAttribute('data-k')];
      if (o.act === 'breath') { sheet.querySelector('.sheet-body').innerHTML = breathHtml(hid); sheet.querySelector('.close').focus(); return; }
      close();
      if (handlers[o.act]) handlers[o.act]();
    });
    back.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      var f = focusables(), i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    });
    var first = sheet.querySelector('.so') || sheet.querySelector('.close');
    if (first) first.focus();
    return { el: back, close: close };
  }

  /* ---------- where cards go: the play-cards adapter ---------- */
  var pending = [];
  function sinkCard(c, opts) {
    if (opts && typeof opts.onCard === 'function') { opts.onCard(c); return 'page'; }
    var P = window.AceProgress;
    if (P && typeof P.addPlayCard === 'function') { P.addPlayCard(c); return 'play-cards'; }
    pending.push(c);
    return 'pending';
  }
  function flush() {
    var P = window.AceProgress;
    if (!P || typeof P.addPlayCard !== 'function') return 0;
    var n = pending.length;
    while (pending.length) P.addPlayCard(pending.shift());
    return n;
  }

  /* cubic-bezier(.45,0,.25,1): the process easing, for tweens */
  function bezier(x1, y1, x2, y2) {
    function a(p1, p2) { return 1 - 3 * p2 + 3 * p1; }
    function b(p1, p2) { return 3 * p2 - 6 * p1; }
    function c(p1) { return 3 * p1; }
    function at(t, p1, p2) { return ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t; }
    function slope(t, p1, p2) { return 3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1); }
    return function (x) {
      if (x <= 0) return 0; if (x >= 1) return 1;
      var t = x;
      for (var i = 0; i < 6; i++) { var s = slope(t, x1, x2); if (!s) break; t -= (at(t, x1, x2) - x) / s; }
      return at(Math.max(0, Math.min(1, t)), y1, y2);
    };
  }
  var easeProcess = bezier(0.45, 0, 0.25, 1);

  /* =====================================================================
     mount: the whole bench
     ===================================================================== */
  var mounts = 0;
  function mount(host, entry, driver, opts) {
    opts = opts || {};
    driver = driver || {};
    var problems = validate(entry, driver);
    if (problems.length && window.console) console.warn('[AceLoop] ' + (entry && entry.id) + ': ' + problems.join('; '));
    if (problems.fatal || !host) return null;

    var sec = entry.section, noun = nounOf(entry), hook = hookOf(entry), st = entry.stage || {};
    var uid = 'al' + (++mounts) + '-' + String(entry.id).replace(/[^a-z0-9-]/gi, '').slice(0, 24);
    var P = entry.predict, C = entry.check;
    var kind = driver.kind;
    var self, S, parts;

    function before() { return driver.before !== undefined ? driver.before : (kind === 'tween' ? 0 : (driver.frames || [])[0]); }
    function last() { return kind === 'tween' ? 1 : (driver.frames || [])[(driver.frames || []).length - 1]; }
    function lead(b) { return (b && b.keyLead) || st.keyLead || LEAD[sec] || 'The answer'; }

    function template() {
      var tags = st.tags || [], lvl = Math.min(6, Math.max(2, opts.level || 2));
      var hx = function (id, cls, text) { return '<h' + lvl + ' class="' + cls + '" id="' + id + '">' + text + '</h' + lvl + '>'; };
      return '<article class="bench al-loop" data-sec="' + esc(sec) + '" aria-labelledby="' + uid + '-q" data-beat="call">' +
        '<div class="bench-top"><span class="k gold">' + AL.icon('predict', 'sm') + esc(opts.kicker || entry.kicker || 'Call it first') + '</span>' +
        '<span class="chip"><span class="dot" aria-hidden="true"></span>' + esc(SECTIONS[sec]) + ' / ' + rich(entry.title) + '</span></div>' +
        '<div data-part="band"></div>' +
        '<div class="bench-body"><div class="bench-grid">' +
        '<div class="stage" data-part="stage">' +
        '<div class="field' + (st.surface === 'paper' ? ' paper' : '') + '" data-part="field"' + (st.ratio ? ' style="--field-ratio:' + esc(st.ratio) + '"' : '') + '>' +
        '<div class="layer real" data-part="real" role="img" aria-label=""></div>' +
        (driver.wipe ? '<div class="layer draw" data-part="draw" aria-hidden="true" hidden></div>' : '') +
        (tags[0] ? '<span class="tag" data-part="tagL">' + rich(tags[0]) + '</span>' : '') +
        (tags[1] ? '<span class="tag r" data-part="tagR">' + rich(tags[1]) + '</span>' : '') +
        (driver.wipe ? '<span class="wipe-tag l" data-part="wipeL" hidden>Drawing</span><span class="wipe-tag r" data-part="wipeR" hidden>Real</span>' +
          '<div class="wipe-handle" data-part="wipe" role="slider" tabindex="0" hidden aria-label="Drawing or real view" aria-valuemin="0" aria-valuemax="100" aria-valuenow="40"><span>' + AL.icon('drag', 'sm') + '</span></div>' : '') +
        '<div class="veil off" data-part="veil" aria-hidden="true"><div>' + AL.icon('eye') + '<p>Closed book. Answer from memory, then the ' + esc(noun) + ' comes back.</p></div></div>' +
        '</div>' +
        '<p class="caption" data-part="cap" aria-live="polite"></p>' +
        '<div class="framebar" data-part="framebar" hidden><div class="pips" data-part="pips" aria-hidden="true"></div>' +
        '<button class="iconbtn" type="button" data-part="replay"></button></div>' +
        '<div class="stills" data-part="stills" hidden></div>' +
        '</div>' +
        '<div class="flow" data-part="flow">' +
        '<div class="beat-verdict" data-part="verdict" hidden></div>' +
        '<div class="beat-call" data-part="call">' +
        hx(uid + '-q', 'prompt', rich(P.q)) +
        '<div class="call-host" data-part="callhost"></div>' +
        '<div class="opts" role="group" aria-labelledby="' + uid + '-q" data-part="opts"></div>' +
        '<div class="call-row" data-part="callrow"><button class="skip" type="button" data-part="skip">' + AL.icon('skipcall', 'sm') + 'Skip the call, just show me</button>' +
        '<button class="stuck-link" type="button" data-part="stuck">' + AL.icon('branch', 'sm') + 'Stuck?</button></div>' +
        '</div>' +
        '<div class="beat-next" data-part="next" hidden></div>' +
        '<div class="beat-prove" data-part="prove" hidden>' +
        '<p class="closed-book" data-part="closed">' + AL.icon('eye', 'sm') + 'From memory. The ' + esc(noun) + ' is covered until you answer.</p>' +
        '<div class="beat-verdict" data-part="cverdict" hidden></div>' +
        (C ? hx(uid + '-c', 'prompt', rich(C.q)) + '<div class="opts" role="group" aria-labelledby="' + uid + '-c" data-part="copts"></div>' +
          '<div class="call-row" data-part="crow"><span></span><button class="stuck-link" type="button" data-part="cstuck">' + AL.icon('branch', 'sm') + 'Stuck?</button></div>' : '') +
        '</div>' +
        '<div class="beat-keep" data-part="keep" hidden><div data-part="cardhost"></div><p class="keep-note" data-part="keepnote"></p><div class="row-btns" data-part="keepbtns"></div></div>' +
        '<div class="beat-done" data-part="done" hidden></div>' +
        '</div>' +
        '<div class="drive-slot" data-part="drive" hidden></div>' +
        '</div></div></article>';
    }

    function init() {
      S = { beat: 'call', pick: null, call: null, cpick: null, card: null, cardFrom: null, watched: null, cur: before(),
        timer: null, raf: null, nextFn: null, wipeAt: (driver.wipe && driver.wipe.at) || 40, alive: true };
      self.result = { entryId: entry.id, section: sec, subtopic: entry.subtopic || '', at: Date.now(),
        predict: null, check: null, card: null, kept: false, movedOn: false, missWhy: '' };
      host.classList.add('al');
      host.innerHTML = template();
      parts = {};
      Array.prototype.forEach.call(host.querySelectorAll('[data-part]'), function (n) { parts[n.getAttribute('data-part')] = n; });
      self.el = host.querySelector('.bench');
      self.band = AL.band(parts.band);
      paint(S.cur);
      if (st.before) parts.cap.innerHTML = rich(st.before);
      parts.skip.addEventListener('click', function () { if (S.beat === 'call' || S.beat === 'setup') skip(); });
      parts.stuck.addEventListener('click', function () { openStuck(this); });
      if (parts.cstuck) parts.cstuck.addEventListener('click', function () { openStuck(this); });
      parts.replay.addEventListener('click', function () { if (S.nextFn) S.nextFn(); else replay(); });
      if (kind === 'custom' && typeof driver.setup === 'function') startSetup();
      else startCall();
    }

    /* ---------- drawing a state ---------- */
    function ctxFor() {
      return { host: host, bench: self.el, stage: parts.real, field: parts.field, entry: entry, reduced: AL.reduced(),
        caption: function (h) { parts.cap.innerHTML = rich(h); },
        aria: function (t) { parts.real.setAttribute('aria-label', plain(t)); },
        stills: function (h) { showStills(h); },
        wait: AL.wait, tween: tween, pick: S.pick, call: S.call };
    }
    function paint(state, prefix) {
      if (kind === 'custom' && typeof driver.render !== 'function') return null;
      if (typeof driver.render !== 'function') return null;
      var r = driver.render(state) || {};
      S.cur = state;
      parts.real.innerHTML = AL.uniq(r.svg || '');
      if (r.caption != null || prefix) parts.cap.innerHTML = (prefix ? '<b>' + rich(prefix) + '</b> ' : '') + rich(r.caption || '');
      parts.real.setAttribute('aria-label', plain(r.aria || r.caption || entry.title));
      if (r.tag && parts.tagR) parts.tagR.innerHTML = rich(r.tag);
      if (parts.draw && !parts.draw.hidden) drawWipe();
      return r;
    }
    function showStills(html) {
      parts.stills.innerHTML = html || '';
      parts.stills.hidden = !html;
    }
    function tween(from, to, dur, fn) {
      return new Promise(function (res) {
        if (AL.reduced() || !dur) { fn(to); res(); return; }
        var t0 = null;
        function step(now) {
          if (!S.alive) { res(); return; }
          if (t0 == null) t0 = now;
          var t = Math.min(1, (now - t0) / dur);
          fn(from + (to - from) * easeProcess(t));
          if (t < 1) S.raf = requestAnimationFrame(step); else res();
        }
        S.raf = requestAnimationFrame(step);
      });
    }

    /* ---------- the call ---------- */
    function startCall() {
      S.beat = 'call';
      setBeat('call');
      if (kind === 'custom' && typeof driver.call === 'function') {
        parts.opts.hidden = true;
        Promise.resolve(driver.call(Object.assign(ctxFor(), { mount: parts.callhost }))).then(function (r) {
          if (!S.alive || S.beat !== 'call') return;
          S.call = r || { skipped: true };
          S.pick = S.call.skipped ? -1 : (S.call.pick == null ? 0 : S.call.pick);
          watch();
        });
        return;
      }
      options(parts.opts, P.options, function (i) { S.pick = i; watch(); });
    }
    function startSetup() {
      S.beat = 'setup';
      setBeat('setup');
      parts.opts.hidden = true;
      parts.callhost.innerHTML = '<button class="btn gold" type="button">' + AL.icon('play', 'sm') + esc(driver.setupLabel || 'Show me the setup') + '</button>';
      parts.callhost.querySelector('button').addEventListener('click', function () {
        this.disabled = true;
        if (AL.reduced() && driver.stills) showStills(driver.stills('setup'));
        AL.follow(parts.field);
        Promise.resolve(driver.setup(ctxFor())).then(function () {
          if (!S.alive || S.beat !== 'setup') return;
          parts.callhost.innerHTML = '';
          parts.opts.hidden = false;
          startCall();
        });
      });
    }
    function skip() {
      S.pick = -1;
      S.call = { skipped: true };
      hold(parts.opts, -1);
      parts.callhost.innerHTML = '';
      watch();
    }

    /* ---------- watch: the process plays ---------- */
    function pipsFor(n) {
      var h = '';
      for (var i = 0; i < n; i++) h += '<i><b></b></i>';
      parts.pips.innerHTML = h;
      parts.framebar.hidden = false;
      return parts.pips.children;
    }
    function setPips(pips, upto, running) {
      Array.prototype.forEach.call(pips, function (p, k) { p.className = k < upto ? 'done' : (k === upto && running ? 'run' : ''); });
    }
    function nextMode(on, lastOne) {
      if (on) {
        parts.replay.className = 'iconbtn text';
        parts.replay.innerHTML = lastOne ? AL.icon('good', 'sm') + (S.beat === 'watch' ? 'See the verdict' : 'Back to now') : AL.icon('next', 'sm') + 'Next frame';
        parts.replay.removeAttribute('aria-label');
      } else {
        parts.replay.className = 'iconbtn';
        parts.replay.innerHTML = AL.icon('replay');
        parts.replay.setAttribute('aria-label', 'Play the ' + noun + ' again');
      }
    }
    function watch() {
      S.beat = 'watch';
      setBeat('watch');
      parts.callrow.hidden = true;
      self.band.set(1);
      AL.follow(parts.field);
      if (kind === 'steps') return watchSteps(afterWatch);
      if (kind === 'tween') return watchTween(afterWatch);
      return watchCustom(afterWatch);
    }
    function watchSteps(then) {
      var frames = driver.frames, n = frames.length, i = 0, pips = pipsFor(n), dur = driver.frameMs || AL.ms('frame') || 900;
      function show(k) { paint(frames[k], 'Frame ' + (k + 1) + ' of ' + n + '.'); }
      if (AL.reduced()) {
        if (driver.stills) showStills(driver.stills('watch'));
        show(0); setPips(pips, 1, false); nextMode(true, n === 1);
        S.nextFn = function () {
          i++;
          if (i < n) { show(i); setPips(pips, i + 1, false); nextMode(true, i === n - 1); }
          else { S.nextFn = null; nextMode(false); then(); }
        };
        return;
      }
      parts.replay.hidden = true;
      (function step() {
        if (!S.alive) return;
        show(i); setPips(pips, i, true);
        i++;
        S.timer = setTimeout(function () {
          if (i < n) step();
          else { setPips(pips, n, false); parts.replay.hidden = false; nextMode(false); then(); }
        }, dur);
      })();
    }
    function stopsOf() {
      var s = Array.isArray(driver.stops) && driver.stops.length ? driver.stops : [{ t: 0 }, { t: 1 }];
      return s.map(function (x) { return typeof x === 'number' ? { t: x } : x; });
    }
    function watchTween(then) {
      var stops = stopsOf(), n = stops.length, pips = pipsFor(n);
      var dur = driver.duration || Math.max(2700, Math.min(3600, n * 900));
      function cap(k) { return stops[k].caption ? stops[k].caption : null; }
      if (AL.reduced()) {
        if (driver.stills) showStills(driver.stills('watch'));
        var i = 0;
        var show = function (k) { var r = paint(stops[k].t); if (cap(k)) parts.cap.innerHTML = rich(cap(k)); return r; };
        show(0); setPips(pips, 1, false); nextMode(true, n === 1);
        S.nextFn = function () {
          i++;
          if (i < n) { show(i); setPips(pips, i + 1, false); nextMode(true, i === n - 1); }
          else { S.nextFn = null; nextMode(false); then(); }
        };
        return;
      }
      parts.replay.hidden = true;
      var shown = -1;
      tween(0, 1, dur, function (t) {
        paint(t);
        var k = 0;
        for (var j = 0; j < n; j++) if (t >= stops[j].t - 1e-6) k = j;
        if (k !== shown) { shown = k; if (cap(k)) parts.cap.innerHTML = rich(cap(k)); }
        setPips(pips, k + (t >= 1 ? 1 : 0), t < 1);
      }).then(function () {
        if (!S.alive) return;
        setPips(pips, n, false);
        parts.replay.hidden = false; nextMode(false);
        return AL.wait(AL.ms('state')).then(then);
      });
    }
    function watchCustom(then) {
      if (AL.reduced() && driver.stills) showStills(driver.stills('watch'));
      Promise.resolve(driver.play(ctxFor())).then(function () { if (S.alive) then(); });
    }
    function replay() {
      if (S.beat === 'watch') return;
      if (S.timer) clearTimeout(S.timer);
      var keepState = S.cur;
      if (AL.reduced() && kind !== 'custom') {
        var list = kind === 'steps' ? driver.frames : stopsOf(), j = 0, n = list.length;
        var show = function (k) {
          if (kind === 'steps') paint(list[k], 'Frame ' + (k + 1) + ' of ' + n + '.');
          else { paint(list[k].t); if (list[k].caption) parts.cap.innerHTML = rich(list[k].caption); }
        };
        show(0); nextMode(true, false);
        S.nextFn = function () {
          j++;
          if (j < n) { show(j); nextMode(true, j === n - 1); }
          else { S.nextFn = null; nextMode(false); paint(keepState); }
        };
        return;
      }
      if (kind === 'steps') {
        var frames = driver.frames, i = 0;
        (function again() {
          paint(frames[i], 'Frame ' + (i + 1) + ' of ' + frames.length + '.');
          i++;
          if (i < frames.length) S.timer = setTimeout(again, driver.frameMs || AL.ms('frame') || 900);
        })();
      } else if (kind === 'tween') {
        tween(0, 1, driver.duration || 3000, function (t) { paint(t); });
      } else if (typeof driver.play === 'function') {
        Promise.resolve(driver.play(Object.assign(ctxFor(), { replay: true })));
      }
    }

    /* ---------- the verdict, right under the stage ---------- */
    function outcomeOf(pick, ok) { return pick === -1 ? 'shown' : ok ? 'confirmed' : 'needs-review'; }
    function afterWatch() {
      if (!S.alive) return;
      S.watched = S.cur;
      var custom = kind === 'custom' && typeof driver.call === 'function';
      var skipped = S.pick === -1;
      var ok = custom ? !!(S.call && S.call.ok) : S.pick === P.key;
      var outcome = outcomeOf(S.pick, ok);
      self.result.predict = { pick: S.pick, outcome: outcome, label: LABELS[outcome] };
      if (outcome === 'needs-review' && P.replan && P.replan[S.pick]) self.result.missWhy = P.replan[S.pick];
      if (custom) parts.opts.hidden = true;
      else { reveal(parts.opts, S.pick, P.key); collapse(parts.opts, S.pick, P.key); }
      parts.call.querySelector('.prompt').classList.add('asked');
      var c = S.call || {};
      parts.verdict.innerHTML = verdict({
        skipped: skipped, ok: ok,
        callLine: custom ? c.callLine : '', callText: !custom && !skipped ? P.options[S.pick] : (c.callText || ''),
        trap: custom ? c.trap : (!skipped && !ok ? P.traps[S.pick] : ''),
        trapName: custom ? c.trapName : (!skipped && !ok ? P.trapNames[S.pick] : ''),
        keyText: custom ? c.keyText : P.options[P.key], keyLead: lead(P),
        why: ok || skipped ? P.why : (custom ? P.why : ''), hook: hook
      });
      parts.verdict.hidden = false;
      /* a miss writes its card now, at the verdict */
      if (outcome === 'needs-review') writeCard('call');
      S.beat = 'verdict';
      setBeat('verdict');
      emit(host, 'verdict', { stage: 'call', outcome: outcome, label: LABELS[outcome], pick: S.pick, entryId: entry.id });
      showDrive();
      AL.follow(parts.field, { to: parts.verdict });
    }

    /* ---------- drive: the student takes the process ---------- */
    function showDrive() {
      var d = driver.drive, nextBtn = C ? '<button class="btn gold" type="button" data-act="prove">One more, from memory' + AL.icon('arrow', 'sm') + '</button>'
        : '<button class="btn gold" type="button" data-act="keep">Make my card' + AL.icon('arrow', 'sm') + '</button>';
      if (d) {
        var v = d.value != null ? d.value : (typeof S.cur === 'number' ? S.cur : d.min);
        var tk = uid + '-ticks', kid = uid + '-knob';
        parts.drive.innerHTML = '<div class="drive reveal-in"><div class="dh">' + AL.icon('drag') + 'Now you drive</div>' +
          (d.hint ? '<p>' + rich(d.hint) + '</p>' : '') +
          '<div class="knob"><label for="' + kid + '"><span>' + rich(d.label || 'Drive it') + '</span><output for="' + kid + '"></output></label>' +
          '<input class="al" type="range" id="' + kid + '" min="' + (d.min || 0) + '" max="' + (d.max == null ? 100 : d.max) + '" step="' + (d.step || 1) + '" value="' + v + '"' +
          (d.ticks ? ' aria-describedby="' + tk + '"' : '') + (d.track ? ' style="--track:' + esc(d.track) + '"' : '') + '>' +
          (d.ticks ? '<div class="ticks" id="' + tk + '">' + d.ticks.map(function (t) { return '<span>' + rich(t) + '</span>'; }).join('') + '</div>' : '') +
          '</div>' +
          (entry.honesty ? '<p class="honest">' + AL.icon('eye', 'sm') + '<span>' + rich(entry.honesty) + '</span></p>' : '') +
          '</div><div class="row-btns">' + nextBtn + '</div>';
        parts.drive.hidden = false;
        var input = parts.drive.querySelector('input'), out = parts.drive.querySelector('output');
        var label = function (x) {
          var w = d.words ? d.words(x) : String(x);
          out.textContent = w;
          input.setAttribute('aria-valuetext', w + (d.name ? '. ' + d.name(x) : ''));
        };
        label(+input.value);
        input.addEventListener('input', function () {
          var x = +input.value;
          label(x);
          paint(d.state ? d.state(x) : x);
          if (parts.wipe && !parts.wipe.hidden) wipeText();
        });
        parts.nextBtn = parts.drive.querySelector('[data-act]');
      } else {
        parts.next.innerHTML = '<div class="row-btns">' + nextBtn + '</div>';
        parts.next.hidden = false;
        parts.nextBtn = parts.next.querySelector('[data-act]');
      }
      parts.nextBtn.addEventListener('click', function () { if (this.getAttribute('data-act') === 'prove') prove(); else toKeep(); });
      if (driver.wipe) showWipe();
    }
    function drawWipe() { parts.draw.innerHTML = AL.uniq(driver.wipe.render(S.cur) || ''); }
    function wipeText() {
      var w = driver.wipe.words ? driver.wipe.words(S.cur) : 'the textbook drawing';
      parts.wipe.setAttribute('aria-valuetext', 'Left: the textbook drawing, ' + plain(w) + '. Right: the real ' + noun + '. Line at ' + Math.round(S.wipeAt) + ' percent.');
    }
    function setWipe(pct) {
      S.wipeAt = Math.max(0, Math.min(100, pct));
      parts.draw.style.clipPath = 'inset(0 ' + (100 - S.wipeAt) + '% 0 0)';
      parts.wipe.style.left = S.wipeAt + '%';
      parts.wipe.setAttribute('aria-valuenow', String(Math.round(S.wipeAt)));
      wipeText();
    }
    function showWipe() {
      parts.draw.hidden = false; parts.wipe.hidden = false; parts.wipeL.hidden = false; parts.wipeR.hidden = false;
      parts.field.classList.add('wiping');
      drawWipe();
      setWipe(S.wipeAt);
      if (parts.wipe._wired) return;
      parts.wipe._wired = true;
      var h = parts.wipe, on = false;
      function at(ev) { var r = parts.field.getBoundingClientRect(); if (r.width) setWipe((ev.clientX - r.left) / r.width * 100); }
      h.addEventListener('pointerdown', function (ev) { on = true; try { h.setPointerCapture(ev.pointerId); } catch (e) { /* synthetic */ } h.classList.add('held'); at(ev); });
      h.addEventListener('pointermove', function (ev) { if (on) at(ev); });
      h.addEventListener('pointerup', function () { on = false; h.classList.remove('held'); });
      h.addEventListener('pointercancel', function () { on = false; h.classList.remove('held'); });
      h.addEventListener('keydown', function (ev) {
        var k = ev.key, d = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -20, PageUp: 20 }[k];
        if (d != null) { setWipe(S.wipeAt + d); ev.preventDefault(); }
        else if (k === 'Home') { setWipe(0); ev.preventDefault(); }
        else if (k === 'End') { setWipe(100); ev.preventDefault(); }
      });
    }
    function hideWipe() {
      if (!parts.wipe) return;
      parts.draw.hidden = true; parts.wipe.hidden = true; parts.wipeL.hidden = true; parts.wipeR.hidden = true;
      parts.field.classList.remove('wiping');
    }

    /* ---------- prove: one more, from memory (closed book) ---------- */
    function prove() {
      if (!C) { toKeep(); return; }
      S.beat = 'prove';
      setBeat('prove');
      self.band.set(2);
      parts.verdict.hidden = true; parts.call.hidden = true; parts.next.hidden = true; parts.drive.hidden = true;
      parts.framebar.hidden = true; showStills('');
      hideWipe();
      veil(true);
      parts.cap.textContent = '';
      parts.prove.hidden = false;
      parts.prove.classList.add('reveal-in');
      options(parts.copts, C.options, function (i) { check(i); });
      AL.follow(parts.field, { to: parts.prove, prefer: 'end' });
      var q = parts.prove.querySelector('.prompt');
      if (q && opts.focusRecall !== false) { q.setAttribute('tabindex', '-1'); try { q.focus({ preventScroll: true }); } catch (e) { q.focus(); } }
    }
    function veil(on) {
      parts.veil.classList.toggle('off', !on);
      parts.veil.setAttribute('aria-hidden', on ? 'false' : 'true');
      parts.real.setAttribute('aria-hidden', on ? 'true' : 'false');
    }
    function check(i) {
      S.cpick = i;
      var ok = i === C.key, outcome = ok ? 'confirmed' : 'needs-review';
      self.result.check = { pick: i, outcome: outcome, label: LABELS[outcome] };
      if (!ok && !self.result.missWhy && C.replan && C.replan[i]) self.result.missWhy = C.replan[i];
      reveal(parts.copts, i, C.key);
      collapse(parts.copts, i, C.key);
      parts.prove.querySelector('.prompt').classList.add('asked');
      parts.closed.hidden = true; parts.crow.hidden = true;
      parts.cverdict.innerHTML = verdict({ ok: ok, callText: C.options[i], trap: ok ? '' : C.traps[i], trapName: ok ? '' : C.trapNames[i],
        keyText: C.options[C.key], keyLead: (C.keyLead || 'The answer'), why: C.why });
      parts.cverdict.hidden = false;
      if (!ok && !S.card) writeCard('recall');
      emit(host, 'verdict', { stage: 'recall', outcome: outcome, label: LABELS[outcome], pick: i, entryId: entry.id });
      veil(false);
      var back = driver.after !== undefined ? driver.after : S.watched, line = C.backLine || ('The ' + noun + ' is back.');
      /* a custom driver draws its own stage: repaint only when it names a state to come back to */
      if (typeof driver.render === 'function' && (kind !== 'custom' || driver.after !== undefined)) paint(back, line);
      else parts.cap.innerHTML = '<b>' + rich(line) + '</b>';
      toKeep();
    }

    /* ---------- the Ace Card ---------- */
    function picFor(from) {
      if (typeof driver.cardPic === 'function') return driver.cardPic(from) || '';
      if (typeof driver.render !== 'function') return '';
      var cd = entry.card || {}, pair = cd.pic !== 'single';
      var recall = from === 'recall' && driver.after !== undefined;
      var a = recall ? S.watched : before(), b = recall ? driver.after : (S.watched !== null ? S.watched : last());
      var labels = (recall ? cd.recallLabels : cd.labels) || ['before', 'after'];
      function panel(state, label) {
        var r = driver.render(state) || {}, svg = r.svg || '';
        /* driver.cardView crops the picture to what matters on a small card */
        if (driver.cardView) svg = svg.replace(/viewBox="[^"]*"/, 'viewBox="' + driver.cardView + '" preserveAspectRatio="xMidYMid slice"');
        return '<div>' + AL.uniq(svg) + '<span class="pl">' + rich(label) + '</span></div>';
      }
      var html = pair ? panel(a, labels[0]) + panel(b, labels[1]) : panel(b, labels[1] || labels[0]);
      return html.length > MAX_PIC ? '' : html;
    }
    function writeCard(from) {
      var block = from === 'recall' ? C : P, cd = entry.card || {};
      var pick = from === 'recall' ? S.cpick : S.pick;
      var c = {
        id: 'play:' + entry.id, kind: 'play', entryId: entry.id, section: sec, subtopic: entry.subtopic || '', title: plain(entry.title),
        from: from, outcome: from === 'keep' ? 'confirmed' : 'needs-review', marked: from === 'stuck',
        q: plain(block.q), answer: plain(block.options[block.key]),
        yourCall: pick != null && pick >= 0 && pick !== block.key ? plain(block.options[pick]) : '',
        trapName: pick != null && pick >= 0 && pick !== block.key && block.trapNames ? plain(block.trapNames[pick]) : '',
        missWhy: self.result.missWhy || '',
        idea: (from === 'recall' && cd.recallIdea) || cd.idea || plain(block.options[block.key]), hook: cd.hook || hook,
        pic: picFor(from), picAria: '',
        made: AL.isoDate(0), due: AL.isoDate(1), madeAt: Date.now(), links: entry.links || null
      };
      c.picAria = 'The ' + noun + ' you saw, ' + ((cd.labels || ['before', 'after']).join(' and ')) + '.';
      S.card = c; S.cardFrom = from;
      self.result.card = c;
      self.result.cardSavedTo = sinkCard(c, opts);
      emit(host, 'card', c);
      return c;
    }
    function where() { return esc(SECTIONS[sec]) + (entry.subtopic ? ' / ' + rich(entry.subtopic) : ''); }
    function cardHtml(c, preview) {
      return card({ sec: sec, id: uid + '-card', where: where(), pic: c ? c.pic : picFor('keep'), picAria: c ? c.picAria : '',
        idea: c ? c.idea : entry.card.idea, hook: c ? c.hook : (entry.card.hook || hook), made: preview ? 'Not kept yet' : 'New' });
    }
    function toKeep() {
      S.beat = 'keep';
      setBeat('keep');
      self.band.set(3);
      parts.keep.hidden = false;
      parts.keep.classList.add('reveal-in');
      var back = AL.backOn(1);
      if (S.card) {
        parts.cardhost.innerHTML = cardHtml(S.card, false);
        parts.keepnote.innerHTML = 'Made for you, from your call. It is in Review now: back <b>' + esc(back) + '</b> as a fresh question, then in 3 days, then in 7.';
        parts.keepbtns.innerHTML = '';
        AL.follow(parts.field, { to: parts.keep, prefer: 'end' }).then(function () {
          if (!S.alive) return;
          keep(host.querySelector('.acecard'), { due: opts.due, done: function () { finish(true); } });
        });
      } else {
        parts.cardhost.innerHTML = cardHtml(null, true);
        parts.keepnote.innerHTML = (self.result.predict && self.result.predict.outcome === 'shown' ? 'Recall confirmed.' : 'Both calls confirmed.') +
          ' Keep it anyway and it comes back <b>' + esc(back) + '</b>, then in 3 days, then in 7.';
        parts.keepbtns.innerHTML = '<button class="btn gold" type="button" data-act="keep">' + AL.icon('keep', 'sm') + 'Keep it</button>' +
          '<button class="btn quiet" type="button" data-act="nokeep">Skip, I have this one</button>';
        parts.keepbtns.querySelector('[data-act="keep"]').addEventListener('click', function () { keepIt(); });
        parts.keepbtns.querySelector('[data-act="nokeep"]').addEventListener('click', function () { finish(false); });
        AL.follow(parts.field, { to: parts.keep, prefer: 'end' });
      }
    }
    function keepIt() {
      if (S.beat !== 'keep' || S.card) return;
      Array.prototype.forEach.call(parts.keepbtns.querySelectorAll('button'), function (b) { b.disabled = true; });
      var c = writeCard('keep');
      parts.cardhost.innerHTML = cardHtml(c, false);
      keep(host.querySelector('.acecard'), { due: opts.due, done: function () { finish(true); } });
    }

    /* ---------- done ---------- */
    function finish(kept) {
      if (S.beat === 'done') return;
      S.beat = 'done';
      setBeat('done');
      self.band.set(4);
      self.result.kept = !!kept;
      parts.keepbtns.innerHTML = '';
      var lk = entry.links || {}, links = '';
      [['night', 'Learn'], ['sheet', 'Sheet'], ['set', 'Prove it']].forEach(function (k) {
        var l = lk[k[0]];
        if (l && l.href) links += '<a class="chip" href="' + esc(l.href) + '">' + AL.icon(k[0] === 'night' ? 'learn' : k[0] === 'sheet' ? 'sheet' : 'prove', 'sm') + esc(k[1]) + ': ' + rich(l.label || '') + '</a>';
      });
      var line = self.result.movedOn ? 'Moved on. This one waits in Review, marked, back ' + esc(AL.backOn(1)) + '.'
        : kept ? 'Card back ' + esc(AL.backOn(1)) + '. Predict, play, prove, keep: every tool here runs this same loop.'
          : 'No card this time. Play it again any time.';
      parts.done.innerHTML = '<div class="loop-done reveal-in" role="status"><div class="vh">' + AL.icon('keep', 'sm') + 'Loop done</div><p>' + line + '</p></div>' +
        (links ? '<div class="loop-links">' + links + '</div>' : '') +
        '<div class="row-btns">' + (opts.next && opts.next.href ? '<a class="btn gold" href="' + esc(opts.next.href) + '">' + rich(opts.next.label || 'Next') + AL.icon('arrow', 'sm') + '</a>' : '') +
        '<button class="btn quiet" type="button" data-act="again">Play it again</button></div>';
      parts.done.hidden = false;
      parts.done.querySelector('[data-act="again"]').addEventListener('click', function () { reset(); });
      if (typeof opts.onResult === 'function') { try { opts.onResult(self.result); } catch (e) { if (window.console) console.warn('[AceLoop] onResult', e); } }
      /* Today's planner learns which calls were played (and re-plans on a miss) */
      var PG = window.AceProgress;
      if (PG && typeof PG.notePlay === 'function') { try { PG.notePlay(self.result); } catch (e) { if (window.console) console.warn('[AceLoop] notePlay', e); } }
      emit(host, 'done', self.result);
    }

    /* ---------- Stuck? ---------- */
    function openStuck(opener) {
      var h = { later: moveOn, method: method };
      Object.keys(opts.stuck || {}).forEach(function (k) { h[k] = opts.stuck[k]; });
      return stuck(sec, opener, h);
    }
    function method() { if (S.beat === 'call' || S.beat === 'setup') skip(); else replay(); }
    function moveOn() {
      if (S.beat === 'done') return;
      stop();
      self.result.movedOn = true;
      if (!S.card) writeCard('stuck');
      parts.call.hidden = true; parts.verdict.hidden = true; parts.next.hidden = true; parts.drive.hidden = true;
      parts.prove.hidden = true; parts.keep.hidden = true; parts.framebar.hidden = true; showStills('');
      veil(false); hideWipe();
      AL.toast('Marked. It waits in Review, back ' + AL.backOn(1) + '.', { icon: 'flag' });
      finish(false);
    }

    function setBeat(b) { if (self.el) self.el.setAttribute('data-beat', b); }
    function stop() {
      if (S.timer) clearTimeout(S.timer);
      if (S.raf) cancelAnimationFrame(S.raf);
      S.timer = null; S.raf = null; S.nextFn = null;
    }
    function reset() { S.alive = false; stop(); init(); AL.follow(parts.field); }
    function destroy() { S.alive = false; stop(); host.innerHTML = ''; host.classList.remove('al'); }

    self = {
      entry: entry, driver: driver, result: null, el: null, band: null,
      beat: function () { return S.beat; },
      card: function () { return S.card; },
      pick: function (i) { var b = parts.opts.querySelectorAll('.opt')[i]; if (b) b.click(); },
      skip: function () { if (S.beat === 'call' || S.beat === 'setup') skip(); },
      next: function () { if (S.nextFn) S.nextFn(); },
      prove: function () { if (S.beat === 'verdict') prove(); },
      check: function (i) { var b = parts.copts && parts.copts.querySelectorAll('.opt')[i]; if (b) b.click(); },
      keep: function () { keepIt(); },
      noKeep: function () { if (S.beat === 'keep' && !S.card) finish(false); },
      drive: function (v) { var x = parts.drive.querySelector('input'); if (x) { x.value = v; x.dispatchEvent(new Event('input', { bubbles: true })); } },
      wipe: function (p) { if (parts.wipe) setWipe(p); },
      stuck: function () { return openStuck(S.beat === 'prove' && parts.cstuck ? parts.cstuck : parts.stuck); },
      moveOn: moveOn, reset: reset, destroy: destroy
    };
    init();
    return self;
  }

  window.AceLoop = {
    mount: mount, validate: validate, copyProblems: copyProblems,
    options: options, hold: hold, reveal: reveal, collapse: collapse, verdict: verdict, card: card, keep: keep, stuck: stuck,
    flush: flush, pending: pending, rich: rich,
    STUCK: STUCK, SECTIONS: SECTIONS, LABELS: LABELS, LETTERS: L, version: 1
  };
  if (document.readyState === 'complete') flush(); else window.addEventListener('load', flush);
})();
