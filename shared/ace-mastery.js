/* ace-mastery.js : XP, the daily streak, the quick check and the mastery rings. One system for
   every section; pages never keep their own copy.

   What it reads and writes
     ace.v1.record   (read only, owned by shared/ace-record.js): days { "YYYY-MM-DD": { seen, right } }.
                     XP and the streak are worked out from it, so every tool that saves an answer
                     through AceRecord earns XP with no code of its own.
     ace.v1.mastery  (owned here): { schema: 1, checks: { "section|topic": { best, last, tries, at,
                     mastered } } }. mastered is the time of the first quick check at 4 of 5 or
                     better, and it stays once earned.

   Rules
     XP          10 for every right answer, 50 more for each topic mastered.
     Streak      days in a row with at least one answer, counted back from today (or from
                 yesterday when nothing is answered yet today).
     Quick check 5 questions from the topic's own drill bank. 4 of 5 or better masters the topic.
                 Every answer is saved like any practice answer, so a miss goes to Repair.
     Rings       a topic ring shows the best quick check (full when mastered); a section ring
                 shows mastered topics out of the topics that have a quick check.

   AceMastery.xp(), .streak(), .topic(section, topic), .section(section, topics)
   AceMastery.canCheck(items, section, topic), .pickCheck(items, section, topic)
   AceMastery.saveCheck(section, topic, right, total)
   AceMastery.runCheck(host, items, { section, topic, src, homeHref, homeLabel, practiceHref, againHref })
   AceMastery.ring(pct, { size, done, label }), .topicRing(section, topic), .strip(host, { section, topics }) */
(function () {
  'use strict';
  if (window.AceMastery) return;
  var NS = 'ace.v1.', DAY = 864e5;
  var XP_RIGHT = 10, XP_MASTER = 50, CHECK_SIZE = 5, PASS = 4;
  var mem = {};
  function ls() { try { return window.localStorage; } catch (e) { return null; } }
  function read(k, def) {
    var s = ls(), v = null;
    try { v = s ? s.getItem(NS + k) : null; } catch (e) { v = null; }
    if (v == null) v = Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null;
    if (v == null) return def;
    try { var p = JSON.parse(v); return p == null ? def : p; } catch (e) { return def; }
  }
  function write(k, value) { var str = JSON.stringify(value); mem[k] = str; try { var s = ls(); if (s) s.setItem(NS + k, str); } catch (e) { /* storage blocked: memory only */ } }
  function dayKey(t) { var d = new Date(t); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function startOfDay(t) { var d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function prevDay(t) { var d = new Date(startOfDay(t)); d.setDate(d.getDate() - 1); return d.getTime(); }
  function days() { var r = read('record', null); return (r && r.days && typeof r.days === 'object') ? r.days : {}; }
  function store() { var m = read('mastery', null); if (!m || m.schema !== 1 || !m.checks || typeof m.checks !== 'object') m = { schema: 1, checks: {} }; return m; }
  function key(section, topic) { return String(section || '') + '|' + String(topic || ''); }
  function num(x) { x = Number(x); return isFinite(x) && x > 0 ? x : 0; }

  /* ---------------- numbers ---------------- */
  function masteredCount() { var c = store().checks, n = 0; Object.keys(c).forEach(function (k) { if (c[k] && c[k].mastered) n += 1; }); return n; }
  function xp(now) {
    var d = days(), right = 0, t = d[dayKey(now || Date.now())];
    Object.keys(d).forEach(function (k) { right += num(d[k] && d[k].right); });
    var bonus = masteredCount() * XP_MASTER;
    return { total: right * XP_RIGHT + bonus, today: num(t && t.right) * XP_RIGHT, answers: right * XP_RIGHT, mastery: bonus };
  }
  function streak(now) {
    now = now || Date.now(); var d = days();
    function active(t) { var x = d[dayKey(t)]; return !!(x && num(x.seen) > 0); }
    var today = active(now), t = today ? startOfDay(now) : prevDay(now), n = 0;
    while (active(t) && n < 3660) { n += 1; t = prevDay(t); }
    return { days: n, today: today };
  }
  function topic(section, t) {
    var c = store().checks[key(section, t)] || {};
    return { best: num(c.best), last: num(c.last), tries: num(c.tries), at: num(c.at), mastered: num(c.mastered) };
  }
  /* topics: the topic keys of the section that have a quick check. */
  function sectionOf(section, topics) {
    var n = 0; (topics || []).forEach(function (t) { if (topic(section, t).mastered) n += 1; });
    return { mastered: n, total: (topics || []).length };
  }
  function saveCheck(section, t, right, total, now) {
    now = now || Date.now(); right = num(right); total = num(total);
    var m = store(), k = key(section, t), c = m.checks[k] || { best: 0, last: 0, tries: 0, at: 0, mastered: 0 };
    var full = total === CHECK_SIZE, was = !!c.mastered;
    c.tries = num(c.tries) + 1; c.last = right; c.at = now; if (right > num(c.best)) c.best = right;
    if (full && right >= PASS && !c.mastered) c.mastered = now;
    m.checks[k] = c; write('mastery', m);
    return { best: c.best, last: right, mastered: !!c.mastered, newly: !!c.mastered && !was, xp: !!c.mastered && !was ? XP_MASTER : 0 };
  }

  /* ---------------- the quick check: which five ---------------- */
  function pool(items, section, t) { return (items || []).filter(function (it) { return it && it.topic === t && (!section || it.section === section) && Array.isArray(it.choices) && it.choices.length >= 4; }); }
  function canCheck(items, section, t) { return pool(items, section, t).length >= CHECK_SIZE; }
  function shuffle(a, rnd) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  /* Unseen questions first, then the ones answered longest ago. */
  function pickCheck(items, section, t, rnd) {
    rnd = rnd || Math.random; var rec = window.AceRecord, p = pool(items, section, t);
    if (p.length < CHECK_SIZE) return [];
    var fresh = [], seen = [];
    p.forEach(function (it) { var r = rec && rec.item ? rec.item(it.id) : null; if (r) seen.push({ it: it, last: r.last || 0 }); else fresh.push(it); });
    seen.sort(function (a, b) { return a.last - b.last; });
    return shuffle(fresh, rnd).concat(seen.map(function (x) { return x.it; })).slice(0, CHECK_SIZE);
  }

  /* ---------------- drawing ---------------- */
  var hasDom = typeof document !== 'undefined' && !!document.createElement && !!document.head;
  var CSS = '.am-ring{display:inline-flex;flex:none;position:relative;align-items:center;justify-content:center}' +
    '.am-ring svg{display:block;transform:rotate(-90deg)}' +
    '.am-ring circle{fill:none;stroke-width:4}.am-ring .am-ring__bg{stroke:rgba(27,58,45,.16)}' +
    '.am-ring .am-ring__fg{stroke:var(--aui-gold,#C9A84C);stroke-linecap:round;transition:stroke-dashoffset .7s cubic-bezier(.16,1,.3,1)}' +
    '.am-ring[data-done="true"] .am-ring__fg{stroke:var(--aui-good,#007a59)}' +
    '.am-ring__in{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:700 13px/1 var(--aui-font,system-ui,sans-serif);color:var(--aui-ink,#0d2018);font-variant-numeric:tabular-nums}' +
    '.am-ring[data-done="true"] .am-ring__in{color:var(--aui-good,#007a59)}' +
    '.am-ring--lg .am-ring__in{font-size:24px}' +
    '.am-strip{display:flex;flex-wrap:wrap;align-items:center;gap:10px 18px;padding:12px 16px;border-radius:14px;background:var(--aui-paper,#FCFAF6);border:1px solid rgba(27,58,45,.16)}' +
    '.am-strip__item{display:flex;align-items:center;gap:8px;font:500 15px/1.3 var(--aui-font,system-ui,sans-serif);color:var(--aui-ink,#0d2018)}' +
    '.am-strip__item b{font-size:19px;font-variant-numeric:tabular-nums}' +
    '.aui-topic.am-topic{grid-template-columns:auto minmax(0,1fr) auto}' +
    '.am-acts{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}' +
    '@media (max-width:600px){.am-acts{grid-column:1 / -1;justify-content:flex-start}}' +
    '.am-toast{position:fixed;left:50%;bottom:calc(96px + env(safe-area-inset-bottom));transform:translate(-50%,12px);opacity:0;z-index:2147483000;max-width:calc(100vw - 32px);box-sizing:border-box;padding:10px 18px;border-radius:999px;background:#1B3A2D;color:#F5F0E8;font:700 15px/1.3 "DM Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;box-shadow:0 8px 24px rgba(13,32,24,.25);transition:opacity .25s ease,transform .25s ease;pointer-events:none;text-align:center}' +
    '.am-toast[data-on="true"]{opacity:1;transform:translate(-50%,0)}' +
    '.am-toast b{color:#E2C97A}' +
    '.am-pill{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 12px;margin-left:auto;border-radius:999px;color:var(--aui-ink,#0d2018);text-decoration:none;font:700 15px/1 var(--aui-font,system-ui,sans-serif);white-space:nowrap;font-variant-numeric:tabular-nums}' +
    '.am-pill:hover{background:rgba(201,168,76,.16)}.am-pill__streak{font-weight:500;display:none}' +
    '.am-pill ~ .aui-bar__nav,.am-pill ~ .aui-bar__menu{margin-left:0}' +
    '@media (min-width:480px){.am-pill__streak{display:inline}}' +
    '.am-result{display:flex;flex-wrap:wrap;align-items:center;gap:16px 24px}' +
    '@media (prefers-reduced-motion:reduce){.am-ring .am-ring__fg,.am-toast{transition:none}}';
  function style() { if (!hasDom || document.getElementById('am-style')) return; var s = document.createElement('style'); s.id = 'am-style'; s.textContent = CSS; document.head.appendChild(s); }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }

  /* A ring. pct 0 to 100. o = { size, done, label (aria), text (shown inside), large } */
  function ring(pct, o) {
    o = o || {}; style();
    var size = o.size || 40, r = (size - 6) / 2, c = 2 * Math.PI * r;
    pct = Math.max(0, Math.min(100, Number(pct) || 0));
    var box = el('span', 'am-ring' + (o.large ? ' am-ring--lg' : ''));
    box.setAttribute('role', 'img'); box.setAttribute('aria-label', o.label || (Math.round(pct) + ' percent'));
    box.setAttribute('data-pct', String(Math.round(pct))); box.setAttribute('data-done', o.done ? 'true' : 'false');
    box.style.width = size + 'px'; box.style.height = size + 'px';
    var NSVG = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NSVG, 'svg');
    svg.setAttribute('width', size); svg.setAttribute('height', size); svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size); svg.setAttribute('aria-hidden', 'true');
    [['am-ring__bg', 0], ['am-ring__fg', c * (1 - pct / 100)]].forEach(function (d) {
      var ci = document.createElementNS(NSVG, 'circle'); ci.setAttribute('class', d[0]); ci.setAttribute('cx', size / 2); ci.setAttribute('cy', size / 2); ci.setAttribute('r', r);
      if (d[0] === 'am-ring__fg') { ci.setAttribute('stroke-dasharray', c.toFixed(2)); ci.setAttribute('stroke-dashoffset', d[1].toFixed(2)); }
      svg.appendChild(ci);
    });
    box.appendChild(svg);
    if (o.text != null) { var inner = el('span', 'am-ring__in', o.text); inner.setAttribute('aria-hidden', 'true'); box.appendChild(inner); }
    return box;
  }
  function topicRing(section, t, o) {
    var s = topic(section, t), done = !!s.mastered;
    var label = done ? 'Mastered: ' + s.best + ' of ' + CHECK_SIZE + ' on the quick check' : s.tries ? 'Quick check best: ' + s.best + ' of ' + CHECK_SIZE + '. Mastered at ' + PASS + ' of ' + CHECK_SIZE : 'Quick check not taken yet';
    var node = ring(done ? 100 : Math.min(s.best, PASS - 1) * (100 / CHECK_SIZE), Object.assign({ done: done, label: label, text: s.tries ? String(s.best) : '' }, o || {}));
    node.setAttribute('data-mastery', done ? 'mastered' : s.tries ? 'tried' : 'none');
    return node;
  }
  /* XP, the streak and the section ring, in one strip. o = { section, topics, name } */
  function strip(host, o) {
    if (!hasDom || !host) return null;
    o = o || {}; style(); host.textContent = ''; host.classList.add('am-strip');
    var x = xp(), s = streak();
    function item(node, strong, rest) { var d = el('div', 'am-strip__item'); if (node) d.appendChild(node); d.appendChild(el('b', null, strong)); d.appendChild(el('span', null, rest)); host.appendChild(d); return d; }
    item(null, String(x.total), 'XP' + (x.today ? ', ' + x.today + ' today' : '')).setAttribute('data-xp', String(x.total));
    item(null, String(s.days), (s.days === 1 ? 'day' : 'days') + ' in a row' + (s.days && !s.today ? ', answer one today to keep it' : '')).setAttribute('data-streak', String(s.days));
    if (o.topics && o.topics.length) {
      var sec = sectionOf(o.section, o.topics);
      var r = ring(100 * sec.mastered / sec.total, { size: 40, done: sec.mastered === sec.total, label: sec.mastered + ' of ' + sec.total + ' topics mastered' });
      item(r, sec.mastered + ' of ' + sec.total, 'topics mastered').setAttribute('data-section-mastered', String(sec.mastered));
    }
    return host;
  }

  /* ---------------- the toast and the bar pill ---------------- */
  var toastNode = null, toastTimer = null;
  function toast(strong, rest) {
    if (!hasDom || !document.body) return;
    style();
    if (!toastNode) { toastNode = el('div', 'am-toast'); toastNode.setAttribute('role', 'status'); toastNode.setAttribute('aria-live', 'polite'); document.body.appendChild(toastNode); }
    toastNode.textContent = ''; toastNode.appendChild(el('b', null, strong)); if (rest) toastNode.appendChild(document.createTextNode(' ' + rest));
    toastNode.setAttribute('data-on', 'true');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { if (toastNode) toastNode.setAttribute('data-on', 'false'); }, 2600);
  }
  function timed() { try { var v = JSON.parse(window.localStorage.getItem('acelabs.timed') || 'null'); return !!(v && typeof v.until === 'number' && v.until > Date.now()); } catch (e) { return false; } }
  function pill() {
    if (!hasDom) return;
    var bar = document.querySelector('#ace-bar .aui-bar__in'); if (!bar) return;
    style();
    var a = document.getElementById('ace-xp');
    if (!a) {
      a = el('a', 'am-pill'); a.id = 'ace-xp'; a.href = '/progress/';
      var nav = bar.querySelector('.aui-bar__nav'); bar.insertBefore(a, nav || null);
    }
    var x = xp(), s = streak();
    a.textContent = ''; a.appendChild(el('span', null, x.total + ' XP'));
    var st = el('span', 'am-pill__streak', s.days + (s.days === 1 ? ' day' : ' days') + ' in a row'); a.appendChild(st);
    a.setAttribute('aria-label', x.total + ' XP, ' + s.days + (s.days === 1 ? ' day' : ' days') + ' in a row. Open Progress.');
    a.setAttribute('data-xp', String(x.total)); a.setAttribute('data-streak', String(s.days));
  }
  /* A saved answer: refresh the pill; a right practice answer shows what it earned. */
  function onRecord(what) {
    if (!what || what.type !== 'record' || !what.attempt) return;
    pill();
    var a = what.attempt; if (!a.ok || a.kind === 'test' || timed()) return;
    var d = days()[dayKey(a.at || Date.now())] || {}, first = num(d.right) === 1, s = streak(a.at || Date.now());
    toast('+' + XP_RIGHT + ' XP', first ? (s.days > 1 ? 'First win today. ' + s.days + ' days in a row.' : 'First win today.') : '');
  }
  var bound = false;
  function bind() {
    if (bound || !window.AceRecord || typeof window.AceRecord.onChange !== 'function') return;
    bound = true; window.AceRecord.onChange(onRecord);
  }

  /* ---------------- the quick check, run ---------------- */
  /* o = { section, topic, src, homeHref, homeLabel, practiceHref, againHref, onDone, random } */
  function runCheck(host, items, o) {
    o = o || {}; style();
    var set = pickCheck(items, o.section, o.topic, o.random), i = 0, right = 0, rec = window.AceRecord, setId = 'quick-check-' + Date.now().toString(36);
    host.textContent = '';
    if (set.length < CHECK_SIZE) {
      var none = el('div', 'aui-card aui-stack');
      none.appendChild(el('h2', 'aui-h2', 'No quick check for this topic yet.'));
      none.appendChild(el('p', 'aui-p', 'A quick check needs ' + CHECK_SIZE + ' questions and this topic has fewer in the bank.'));
      var b0 = el('a', 'aui-btn', o.homeLabel || 'Back'); b0.href = o.homeHref || '/'; none.appendChild(b0);
      host.appendChild(none); return { set: [] };
    }
    var name = set[0].topicName || o.topic;
    var head = el('div', 'aui-stack');
    head.appendChild(el('p', 'aui-small', CHECK_SIZE + ' questions. ' + PASS + ' right masters ' + name + '.'));
    var bar = el('div', 'aui-meter'), fill = el('span'); fill.style.width = '0%'; bar.appendChild(fill);
    bar.setAttribute('role', 'progressbar'); bar.setAttribute('aria-label', 'Quick check progress'); bar.setAttribute('aria-valuemin', '0'); bar.setAttribute('aria-valuemax', String(CHECK_SIZE));
    head.appendChild(bar);
    var slot = el('div'); host.setAttribute('data-quick-check', o.topic || ''); host.appendChild(head); host.appendChild(slot);
    function show() {
      if (i >= set.length) return done();
      bar.setAttribute('aria-valuenow', String(i)); fill.style.width = Math.round(100 * i / set.length) + '%';
      var item = set[i];
      window.AceQuestion.mount(slot, item, {
        number: i + 1, total: set.length, confidence: false, label: 'Quick check',
        nextLabel: i + 1 >= set.length ? 'See the result' : 'Next question', seeFrom: 'set',
        onAnswer: function (res) {
          if (res.ok) right += 1;
          if (rec) rec.record({ item: item, picked: res.picked, answer: res.answer, ok: res.ok, ms: res.ms, src: o.src || 'quick-check', set: setId, first: res.first, changes: res.changes, change: res.change });
        },
        onReason: function (reason) { if (rec && rec.repairReason) rec.repairReason(item.id, reason); },
        onNext: function () { i += 1; show(); }
      });
      if (i > 0) { try { window.scrollTo({ top: Math.max(0, slot.getBoundingClientRect().top + window.pageYOffset - 76) }); } catch (e) { /* older browsers */ } }
    }
    function done() {
      fill.style.width = '100%'; bar.setAttribute('aria-valuenow', String(CHECK_SIZE)); slot.textContent = '';
      var before = topic(o.section, o.topic), res = saveCheck(o.section, o.topic, right, set.length), pass = right >= PASS;
      var card = el('div', 'aui-card aui-stack'); card.setAttribute('data-check-done', 'true'); card.setAttribute('data-check-right', String(right)); card.setAttribute('data-check-mastered', res.mastered ? 'true' : 'false');
      card.appendChild(el('p', 'aui-kicker', 'Quick check: ' + name));
      var row = el('div', 'am-result');
      var big = ring(before.mastered ? 100 : Math.min(before.best, PASS - 1) * (100 / CHECK_SIZE), { size: 96, large: true, done: res.mastered, text: right + '/' + set.length, label: right + ' of ' + set.length + ' right' });
      row.appendChild(big);
      var words = el('div', 'aui-stack');
      words.appendChild(el('h2', 'aui-h2', pass ? (res.newly ? 'Mastered. ' : 'Still mastered. ') + right + ' of ' + set.length + ' right.' : right + ' of ' + set.length + ' right. Mastery takes ' + PASS + '.'));
      var line = pass ? (res.newly ? 'This topic counts as mastered now, worth ' + XP_MASTER + ' XP.' : 'You had already mastered this topic.') + (right < set.length ? ' The miss is in Repair and comes back tomorrow as a new version.' : '')
        : (before.mastered ? 'The topic stays mastered from your earlier check. ' : '') + 'The misses are in Repair and come back tomorrow as new versions. Practice the topic, then take the check again.';
      words.appendChild(el('p', 'aui-p', line));
      row.appendChild(words); card.appendChild(row);
      var acts = el('div', 'aui-row');
      function link(text, href, quiet, act) { var a = el('a', 'aui-btn' + (quiet ? ' aui-btn--quiet' : ''), text); a.href = href; a.setAttribute('data-act', act); acts.appendChild(a); return a; }
      if (!pass && o.practiceHref) link('Practice ' + name, o.practiceHref, false, 'practice');
      link(o.homeLabel || 'Back', o.homeHref || '/', pass ? false : true, 'home');
      if (o.againHref) link(pass ? 'Take it again' : 'Try the check again', o.againHref, true, 'again');
      card.appendChild(acts); slot.appendChild(card);
      // the ring fills after it is on screen, so the change is seen
      var after = res.mastered ? 100 : Math.min(topic(o.section, o.topic).best, PASS - 1) * (100 / CHECK_SIZE), fg = big.querySelector('.am-ring__fg');
      if (fg) { var c = parseFloat(fg.getAttribute('stroke-dasharray')) || 0; setTimeout(function () { fg.setAttribute('stroke-dashoffset', (c * (1 - after / 100)).toFixed(2)); big.setAttribute('data-pct', String(Math.round(after))); }, 60); }
      if (res.newly) toast('+' + XP_MASTER + ' XP', name + ' mastered.');
      pill();
      if (rec && rec.event) rec.event('quick-check', { section: o.section, topic: o.topic, right: right, total: set.length, mastered: res.mastered });
      if (o.onDone) o.onDone({ right: right, total: set.length, mastered: res.mastered, newly: res.newly });
    }
    show();
    return { set: set };
  }

  window.AceMastery = {
    version: 1, XP_RIGHT: XP_RIGHT, XP_MASTER: XP_MASTER, CHECK_SIZE: CHECK_SIZE, PASS: PASS,
    xp: xp, streak: streak, topic: topic, section: sectionOf, saveCheck: saveCheck,
    canCheck: canCheck, pickCheck: pickCheck, runCheck: runCheck,
    ring: ring, topicRing: topicRing, strip: strip, toast: toast, pill: pill, bind: bind
  };
  bind();
  if (hasDom) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pill); else pill(); }
})();
