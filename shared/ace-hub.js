/* ace-hub.js : the one section hub. Needs ace-record.js, ace-question.js, ace-set.js.

   A section page supplies the markup (see /gc/index.html) and one call:

     AceHub.init({ section: 'gchem', name: 'Gen Chem', bank: '/data/gchem.json',
                   home: '/gc/', setSize: 10, topicSize: 8, src: 'gc-hub',
                   lede: function (count, topics) { return '...'; } });

   Expected ids: hub, run, stage, run-title, lede, topics, btn-miss, btn-due,
   s-answers, s-right, s-due, s-miss.
   Addresses: ?run=daily | misses | due, ?topic=<topic id>. */
(function () {
  'use strict';
  if (window.AceHub) return;
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }

  function init(o) {
    var rec = window.AceRecord, items = [], params = new URLSearchParams(location.search);
    rec.migrate();

    function drawHub() {
      var st = rec.stats({ section: o.section }), mc = rec.missCounts();
      var inRepair = mc.bySection[o.section] || 0;
      $('s-answers').textContent = st.answers; $('s-right').textContent = st.right; $('s-due').textContent = inRepair; $('s-miss').textContent = mc.due;
      // one place for misses: Repair (the old "Review misses" and "Spaced repeats" ladders are retired here)
      var bm = $('btn-miss'); bm.textContent = 'Repair (' + inRepair + ' open)'; bm.href = '/repair/'; bm.removeAttribute('data-run');
      var bd = $('btn-due'); if (bd) bd.hidden = true;
      
      var byTopic = {}, order = [];
      items.forEach(function (it) { if (!byTopic[it.topic]) { byTopic[it.topic] = { name: it.topicName, total: 0 }; order.push(it.topic); } byTopic[it.topic].total += 1; });
      $('lede').textContent = o.lede ? o.lede(items.length, order.length) : items.length + ' questions across ' + order.length + ' topics.';
      var mine = rec.topics(o.section), ul = $('topics'); ul.textContent = '';
      if (o.sortTopics !== false) order.sort(function (a, b) { return byTopic[a].name.localeCompare(byTopic[b].name); });
      order.forEach(function (t) {
        var m = mine[t] || { items: 0, missed: 0 }, li = el('li'), box = el('div', 'aui-topic');
        var left = el('div');
        left.appendChild(el('div', 'aui-topic__name', byTopic[t].name));
        left.appendChild(el('div', 'aui-small', m.items + ' of ' + byTopic[t].total + ' seen' + (m.missed ? ', ' + m.missed + (m.missed === 1 ? ' miss open' : ' misses open') : '')));
        var go = el('a', 'aui-btn aui-btn--quiet aui-btn--sm', 'Practice'); go.href = '?topic=' + encodeURIComponent(t); go.setAttribute('data-topic', t); go.setAttribute('aria-label', 'Practice ' + byTopic[t].name);
        var meter = el('div', 'aui-meter'), fill = el('span'); fill.style.width = Math.round(100 * m.items / byTopic[t].total) + '%'; meter.appendChild(fill);
        box.appendChild(left); box.appendChild(go); box.appendChild(meter); li.appendChild(box); ul.appendChild(li);
      });
    }

    function start(run) {
      $('hub').hidden = true; $('run').hidden = false;
      var name = run.topic ? (items.filter(function (i) { return i.topic === run.topic; })[0] || {}).topicName : null;
      $('run-title').textContent = o.name + ': ' + (run.mode === 'misses' ? 'miss review' : run.mode === 'due' ? 'spaced repeats' : name ? name : 'today’s set');
      window.AceSet.run($('stage'), items, { mode: run.mode, section: o.section, topic: run.topic, size: run.topic ? (o.topicSize || 8) : (o.setSize || 10), src: o.src || o.section, homeHref: o.home, homeLabel: 'Back to ' + o.name });
      window.scrollTo(0, 0);
    }

    return window.AceSet.load(o.bank).then(function (bank) {
      items = bank.items;
      var run = params.get('run'), topic = params.get('topic');
      if (topic && items.some(function (i) { return i.topic === topic; })) start({ mode: 'topic', topic: topic });
      else if (run === 'daily' || run === 'misses' || run === 'due') start({ mode: run });
      else drawHub();
      return items;
    }).catch(function () { $('lede').textContent = 'The question bank did not load. Check your connection and reload the page.'; });
  }
  window.AceHub = { version: 1, init: init };
})();
