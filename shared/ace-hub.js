/* ace-hub.js : the one section hub. Needs ace-record.js, ace-question.js, ace-set.js and
   ace-mastery.js (XP, the streak, the quick check and the mastery rings).

   A section page supplies the markup (see /gc/index.html) and one call:

     AceHub.init({ section: 'gchem', name: 'Gen Chem', bank: '/data/gchem.json',
                   home: '/gc/', setSize: 10, topicSize: 8, src: 'gc-hub',
                   lede: function (count, topics) { return '...'; } });

   bank may be one address or a list of them (QR reads three banks).
   Expected ids: hub, run, stage, run-title, lede, topics, btn-miss, btn-due,
   s-answers, s-right, s-due, s-miss. Optional: mastery (the XP, streak and ring strip; made
   above the topic list when the page has none).
   Addresses: ?run=daily | misses | due, ?topic=<topic id>, ?check=<topic id> (the quick check). */
(function () {
  'use strict';
  if (window.AceHub) return;
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }

  function init(o) {
    var rec = window.AceRecord, M = window.AceMastery, items = [], params = new URLSearchParams(location.search);
    rec.migrate();

    function drawHub() {
      var st = rec.stats({ section: o.section }), mc = rec.missCounts();
      var inRepair = mc.bySection[o.section] || 0;
      function put(id, v) { var n = $(id); if (n) n.textContent = v; }
      put('s-answers', st.answers); put('s-right', st.right); put('s-due', inRepair); put('s-miss', mc.due);
      // one place for misses: Repair (the old "Review misses" and "Spaced repeats" ladders are retired here)
      var bm = $('btn-miss'); if (bm) { bm.textContent = 'Repair (' + inRepair + ' open)'; bm.href = '/repair/'; bm.removeAttribute('data-run'); }
      var bd = $('btn-due'); if (bd) bd.hidden = true;
      
      var byTopic = {}, order = [];
      items.forEach(function (it) { if (!byTopic[it.topic]) { byTopic[it.topic] = { name: it.topicName, total: 0 }; order.push(it.topic); } byTopic[it.topic].total += 1; });
      $('lede').textContent = o.lede ? o.lede(items.length, order.length) : items.length + ' questions across ' + order.length + ' topics.';
      var mine = rec.topics(o.section), ul = $('topics'); ul.textContent = '';
      if (o.sortTopics !== false) order.sort(function (a, b) { return byTopic[a].name.localeCompare(byTopic[b].name); });
      var checkable = M ? order.filter(function (t) { return M.canCheck(items, o.section, t); }) : [];
      if (M) {
        var strip = $('mastery');
        if (!strip) { strip = el('section'); strip.id = 'mastery'; strip.setAttribute('aria-label', 'XP, days in a row and topics mastered'); var card = ul.closest ? ul.closest('.aui-card') : null, at = card || ul; at.parentNode.insertBefore(strip, at); }
        M.strip(strip, { section: o.section, topics: checkable });
      }
      order.forEach(function (t) {
        var m = mine[t] || { items: 0, missed: 0 }, li = el('li'), box = el('div', 'aui-topic'), canCheck = checkable.indexOf(t) >= 0;
        var left = el('div');
        left.appendChild(el('div', 'aui-topic__name', byTopic[t].name));
        left.appendChild(el('div', 'aui-small', m.items + ' of ' + byTopic[t].total + ' seen' + (m.missed ? ', ' + m.missed + (m.missed === 1 ? ' miss open' : ' misses open') : '')));
        var go = el('a', 'aui-btn aui-btn--quiet aui-btn--sm', 'Practice'); go.href = '?topic=' + encodeURIComponent(t); go.setAttribute('data-topic', t); go.setAttribute('aria-label', 'Practice ' + byTopic[t].name);
        var meter = el('div', 'aui-meter'), fill = el('span'); fill.style.width = Math.round(100 * m.items / byTopic[t].total) + '%'; meter.appendChild(fill);
        var acts = el('div', 'am-acts');
        if (canCheck) {
          var done = M.topic(o.section, t).mastered;
          var qc = el('a', 'aui-btn aui-btn--quiet aui-btn--sm', done ? 'Mastered' : 'Quick check'); qc.href = '?check=' + encodeURIComponent(t); qc.setAttribute('data-check', t);
          qc.setAttribute('aria-label', (done ? 'Mastered. Take the quick check again: ' : 'Quick check, 5 questions: ') + byTopic[t].name);
          acts.appendChild(qc);
        }
        acts.appendChild(go);
        if (M) { box.className += ' am-topic'; box.appendChild(M.topicRing(o.section, t)); }
        box.appendChild(left); box.appendChild(acts); box.appendChild(meter); li.appendChild(box); ul.appendChild(li);
      });
    }

    function start(run) {
      $('hub').hidden = true; $('run').hidden = false;
      var name = run.topic ? (items.filter(function (i) { return i.topic === run.topic; })[0] || {}).topicName : null;
      $('run-title').textContent = o.name + ': ' + (run.mode === 'check' ? 'quick check' : run.mode === 'misses' ? 'miss review' : run.mode === 'due' ? 'spaced repeats' : name ? name : 'today’s set');
      if (run.mode === 'check') {
        M.runCheck($('stage'), items, { section: o.section, topic: run.topic, src: (o.src || o.section) + '-check', homeHref: o.home, homeLabel: 'Back to ' + o.name,
          practiceHref: o.home + '?topic=' + encodeURIComponent(run.topic), againHref: o.home + '?check=' + encodeURIComponent(run.topic) });
        window.scrollTo(0, 0); return;
      }
      window.AceSet.run($('stage'), items, { mode: run.mode, section: o.section, topic: run.topic, size: run.topic ? (o.topicSize || 8) : (o.setSize || 10), src: o.src || o.section, homeHref: o.home, homeLabel: 'Back to ' + o.name,
        checkHref: run.topic && M && M.canCheck(items, o.section, run.topic) ? o.home + '?check=' + encodeURIComponent(run.topic) : null });
      window.scrollTo(0, 0);
    }

    var banks = Array.isArray(o.bank) ? o.bank : [o.bank];
    // one bank that does not load (a free account gets the sample banks only) does not stop the rest
    return Promise.all(banks.map(function (u) { return window.AceSet.load(u).catch(function () { return null; }); })).then(function (loaded) {
      loaded = loaded.filter(function (b) { return b && Array.isArray(b.items); });
      if (!loaded.length) throw new Error('no bank loaded');
      var seen = {};
      items = loaded.reduce(function (a, b) { return a.concat(b.items); }, []).filter(function (it) { if (seen[it.id]) return false; seen[it.id] = 1; return true; });
      var run = params.get('run'), topic = params.get('topic'), check = params.get('check');
      if (check && M && M.canCheck(items, o.section, check)) start({ mode: 'check', topic: check });
      else if (topic && items.some(function (i) { return i.topic === topic; })) start({ mode: 'topic', topic: topic });
      else if (run === 'daily' || run === 'misses' || run === 'due') start({ mode: run });
      else drawHub();
      return items;
    }).catch(function () { $('lede').textContent = 'The question bank did not load. Check your connection and reload the page.'; });
  }
  window.AceHub = { version: 2, init: init };
})();
