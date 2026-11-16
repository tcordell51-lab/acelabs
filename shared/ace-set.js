/* ace-set.js : builds a set of questions and runs it with the one question
   component and the one progress record. Needs ace-question.js and ace-record.js.

   AceSet.build(items, { mode, section, topic, size })  ->  array of items
     mode 'daily'  : new items near the student's level (about 75% expected right, from the
                     learner model in ace-record.js), weakest topics first, spread across topics.
                     Misses are not repeated here: they come back as new versions in Repair.
     mode 'topic'  : one topic, unseen items nearest the student's level first, so the set
                     steps harder after wins and easier after misses
     mode 'misses' : items whose most recent answer was wrong
     mode 'due'    : spaced repeats that are due
   AceSet.run(host, items, { mode, section, topic, size, src, onDone, homeHref, homeLabel })
   AceSet.load(url) -> Promise of a bank ({ items: [...] }) */
(function () {
  'use strict';
  if (window.AceSet) return;
  var R = function () { return window.AceRecord; };
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function build(all, o) {
    o = o || {}; var size = o.size || 10, rec = R();
    var pool = all.filter(function (it) { return (!o.section || it.section === o.section) && (!o.topic || it.topic === o.topic); });
    var byId = {}; pool.forEach(function (it) { byId[it.id] = it; });
    var out = [], used = {};
    function add(it) { if (it && !used[it.id] && out.length < size) { used[it.id] = 1; out.push(it); } }
    var q = { section: o.section, topic: o.topic };
    var dueIds = rec ? rec.due(q) : [], missIds = rec ? rec.missed(q) : [];
    if (o.mode === 'due') { dueIds.forEach(function (id) { add(byId[id]); }); return out; }
    if (o.mode === 'misses') { missIds.forEach(function (id) { add(byId[id]); }); return out; }
    // new items, ordered nearest the student's level (rec.pickNear), one topic at a time so a
    // set is spread, not clumped; in daily mode the weakest topics lead
    var near = rec && rec.pickNear ? rec.pickNear(pool.filter(function (it) { return !rec.item(it.id); })) : shuffle(pool);
    var unseen = {}, order = [];
    near.forEach(function (it) { if (used[it.id]) return; if (!unseen[it.topic]) { unseen[it.topic] = []; order.push(it.topic); } unseen[it.topic].push(it); });
    if (o.mode !== 'topic') {
      var weak = window.AcePlan ? window.AcePlan.weakest(3, { section: o.section }).map(function (w) { return w.topic; }) : [];
      var lead = order.filter(function (t) { return weak.indexOf(t) >= 0; }).sort(function (a, b) { return weak.indexOf(a) - weak.indexOf(b); });
      order = lead.concat(shuffle(order.filter(function (t) { return weak.indexOf(t) < 0; })));
      // the weakest topic gets up to three items before the spread starts
      if (lead.length) for (var w = 0; w < 2 && unseen[lead[0]].length > 1; w++) add(unseen[lead[0]].shift());
    }
    for (var guard = 0; out.length < size && order.length && guard < 5000; guard++) {
      var t = order.shift(), next = unseen[t].shift(); add(next); if (unseen[t].length) order.push(t);
    }
    // everything seen already: fill with the least recently answered
    if (out.length < size) pool.filter(function (it) { return !used[it.id]; }).sort(function (a, b) { return (rec.item(a.id) || { last: 0 }).last - (rec.item(b.id) || { last: 0 }).last; }).forEach(add);
    return out;
  }

  /* Another item on the same topic that is not already in the set. */
  function twin(all, item, inSet) {
    var rec = R(), c = all.filter(function (it) { return it.topic === item.topic && it.section === item.section && it.id !== item.id && !inSet[it.id]; });
    if (!c.length) return null;
    var fresh = c.filter(function (it) { return !(rec && rec.item(it.id)); });
    return shuffle(fresh.length ? fresh : c)[0];
  }

  function run(host, all, o) {
    o = o || {};
    var set = build(all, o), i = 0, right = 0, answered = 0, wrongTopics = {}, rows = [], setId = (o.src || 'set') + '-' + Date.now().toString(36);
    var inSet = {}; set.forEach(function (it) { inSet[it.id] = 1; });
    host.textContent = '';
    if (!set.length) {
      var empty = el('div', 'aui-card aui-stack');
      empty.appendChild(el('h2', 'aui-h2', o.mode === 'misses' ? 'No misses to review.' : o.mode === 'due' ? 'Nothing is due yet.' : 'No questions here yet.'));
      empty.appendChild(el('p', 'aui-p', o.mode === 'misses' || o.mode === 'due' ? 'Misses and spaced repeats show up here after you answer a set.' : 'This topic has no items in the bank.'));
      var back0 = el('a', 'aui-btn', o.homeLabel || 'Back'); back0.href = o.homeHref || '/'; empty.appendChild(back0);
      host.appendChild(empty); return { set: set };
    }
    var head = el('div', 'aui-stack'), bar = el('div', 'aui-meter'), fill = el('span'); fill.style.width = '0%'; bar.appendChild(fill);
    bar.setAttribute('role', 'progressbar'); bar.setAttribute('aria-label', 'Set progress'); bar.setAttribute('aria-valuemin', '0');
    head.appendChild(bar);
    var slot = el('div'); host.appendChild(head); host.appendChild(slot);

    function show() {
      if (i >= set.length) return done();
      bar.setAttribute('aria-valuemax', String(set.length)); bar.setAttribute('aria-valuenow', String(i)); fill.style.width = Math.round(100 * i / set.length) + '%';
      var item = set[i], tw = twin(all, item, inSet);
      window.AceQuestion.mount(slot, item, {
        number: i + 1, total: set.length, confidence: o.confidence !== false,
        nextLabel: i + 1 >= set.length ? 'Finish set' : 'Next question',
        onAnswer: function (res) {
          answered += 1; rows.push({ item: item, picked: res.picked, ok: res.ok }); if (res.ok) right += 1; else wrongTopics[item.topicName || item.topic] = (wrongTopics[item.topicName || item.topic] || 0) + 1;
          if (R()) R().record({ item: item, picked: res.picked, answer: res.answer, ok: res.ok, ms: res.ms, src: o.src || '', set: setId, first: res.first, changes: res.changes, change: res.change, conf: res.conf });
        },
        onReason: function (reason) { if (R() && R().repairReason) R().repairReason(item.id, reason); },
        seeFrom: 'set',
        onNext: function () { i += 1; show(); },
        onRetry: tw ? function () { inSet[tw.id] = 1; set.splice(i + 1, 0, tw); i += 1; show(); } : null
      });
      if (slot.scrollIntoView && i > 0) { try { window.scrollTo({ top: Math.max(0, slot.getBoundingClientRect().top + window.pageYOffset - 76) }); } catch (e) { /* older browsers */ } }
    }
    function done() {
      fill.style.width = '100%'; slot.textContent = '';
      var card = el('div', 'aui-card aui-stack'); card.setAttribute('data-set-done', 'true');
      card.appendChild(el('p', 'aui-kicker', 'Set finished'));
      card.appendChild(el('h2', 'aui-h2', right + ' of ' + answered + ' right'));
      var names = Object.keys(wrongTopics);
      if (R() && R().saveRun) R().saveRun({ id: setId, src: o.src || 'set', title: (o.title || 'Practice set'), at: Date.now(), right: right, total: answered, back: o.homeHref || '/',
        rows: rows.map(function (r, k) { return { n: k + 1, id: r.item.id, section: r.item.section, topic: r.item.topic, topicName: r.item.topicName, skill: r.item.skill, skillName: r.item.skillName, stem: r.item.stem, choices: r.item.choices, answer: r.item.answer, why: r.item.why, picked: r.picked, ok: r.ok, blank: false }; }) });
      if (names.length) {
        card.appendChild(el('p', 'aui-p', 'Every miss is in Repair now. It comes back as a new version, starting tomorrow, until you beat it twice on different days.'));
        var ul = el('ul', 'aui-list');
        names.sort(function (a, b) { return wrongTopics[b] - wrongTopics[a]; }).forEach(function (n) { var li = el('li'); li.appendChild(el('span', null, n)); li.appendChild(el('span', 'aui-chip aui-chip--miss', wrongTopics[n] + (wrongTopics[n] === 1 ? ' miss' : ' misses'))); ul.appendChild(li); });
        card.appendChild(ul);
      } else card.appendChild(el('p', 'aui-p', 'No misses in this set. The next set picks a little harder, because your level went up.'));
      var row = el('div', 'aui-row');
      var home = el('a', 'aui-btn', 'Back to Today'); home.href = '/'; home.setAttribute('data-act', 'today'); row.appendChild(home);
      var rv = el('a', 'aui-btn aui-btn--quiet', 'Review question by question'); rv.href = '/review/?run=' + encodeURIComponent(setId); row.appendChild(rv);
      var back = el('a', 'aui-btn aui-btn--quiet', o.homeLabel || 'Back'); back.href = o.homeHref || '/'; row.appendChild(back);
      card.appendChild(row); slot.appendChild(card);
      if (o.onDone) o.onDone({ right: right, answered: answered, wrongTopics: wrongTopics });
    }
    show();
    return { set: set };
  }

  function load(url) { return fetch(url, { credentials: 'same-origin' }).then(function (r) { if (!r.ok) throw new Error('bank ' + url + ' answered ' + r.status); return r.json(); }); }
  window.AceSet = { version: 1, build: build, run: run, load: load, twin: twin };
})();
