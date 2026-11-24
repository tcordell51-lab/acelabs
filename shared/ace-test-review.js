/* ace-test-review.js : every test ends the same way (2026-11-16).

   A test engine calls, once, when the student submits:

     AceTestReview.finish({ src: 'diagnostic', title: 'Diagnostic', rows: [{ item, picked }] })
       -> Promise of the run id. Then send the student to /review/?run=<id>.

   item can be in any engine's shape ({ id, section, topic, q|stem, opts|choices, correct|answer,
   why|explanation }); it is normalized here: section names, the practice bank's topic (from
   /data/topics.json), a canonical id (gc:, bio:, oc:, qr:), and the skill tag (ace-skills.js).
   Every answer goes into the one record (AceRecord.record, kind 'test'), so the learner model and
   Progress move, and every miss opens a Repair entry. PAT and Reading rows carry no stem text
   (their figures and passages live in the engine): they repair by skill.

     AceTestReview.render(host, run)   the question-by-question review with the one shared reason
                                       row on each miss and a See it chip on every row a visual matches.
   Needs ace-record.js and ace-skills.js; ace-visuals.js is optional (See it). */
(function () {
  'use strict';
  if (window.AceTestReview) return;
  var R = function () { return window.AceRecord; };
  var SECTION = { bio: 'Biology', gchem: 'Gen Chem', ochem: 'OChem', pat: 'PAT', rc: 'Reading', qr: 'QR' };
  var ORDER = ['bio', 'gchem', 'ochem', 'pat', 'rc', 'qr'];
  var PREFIX = { gchem: 'gc:', bio: 'bio:', ochem: 'oc:', qr: 'qr:', pat: 'pat:', rc: 'rc:' };
  var REASONS = [['know', "Didn't know it"], ['trap', 'Fell for a trap'], ['misread', 'Misread it'], ['time', 'Ran short on time'], ['changed', 'Changed my answer']];
  var LINE = { know: 'A short lesson comes first, then a new version tomorrow.', trap: 'A new version comes back tomorrow, with the same trap waiting.',
    misread: 'A new version comes back tomorrow. Say the ask in your own words before the choices.', time: 'A new version comes back tomorrow, untimed the first time.',
    changed: 'A new version comes back tomorrow. Every switch is logged on Progress.' };
  var LETTERS = 'ABCDE';
  var topicsP = null;
  function topics() {
    if (!topicsP) topicsP = fetch('/data/topics.json', { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; });
    return topicsP;
  }
  function sectionOf(s) {
    s = String(s || '').toLowerCase();
    return { bio: 'bio', biology: 'bio', gc: 'gchem', gchem: 'gchem', 'gen chem': 'gchem', 'general chemistry': 'gchem', ochem: 'ochem', oc: 'ochem', 'org chem': 'ochem', 'organic chemistry': 'ochem',
      qr: 'qr', 'quantitative reasoning': 'qr', pat: 'pat', 'perceptual ability': 'pat', rc: 'rc', reading: 'rc', 'reading comprehension': 'rc' }[s] || s;
  }
  function normalize(raw, map) {
    var sec = sectionOf(raw.section), t = String(raw.topic || 'general'), m = (map[sec] || {})[t];
    var it = {
      id: String(raw.id || ''), section: sec, topic: m ? m[0] : t, topicName: raw.topicName || (m ? m[1] : t.replace(/-/g, ' ')),
      difficulty: raw.difficulty, stem: raw.stem || raw.q || raw.question || '', choices: raw.choices || raw.opts || [],
      answer: raw.answer != null ? raw.answer : raw.correct, why: raw.why || raw.explanation || '', note: raw.note || ''
    };
    if (it.id && PREFIX[sec] && it.id.indexOf(PREFIX[sec]) !== 0) it.id = PREFIX[sec] + it.id;
    var sk = raw.skill ? { skill: raw.skill, skillName: raw.skillName || raw.skill } : (window.AceSkills ? window.AceSkills.tag(it) : { skill: it.topic, skillName: it.topicName });
    it.skill = sk.skill; it.skillName = sk.skillName;
    return it;
  }

  function finish(o) {
    return topics().then(function (map) {
      var now = o.at || Date.now(), id = (o.src || 'test') + '-' + now.toString(36);
      var rows = (o.rows || []).map(function (r, i) {
        var it = normalize(r.item, map);
        if (!it.id) it.id = (PREFIX[it.section] || '') + id + '-' + i;
        var ok = r.ok != null ? !!r.ok : (r.picked != null && r.picked === it.answer);
        if (R()) R().record({ item: it, picked: r.picked, answer: it.answer, ok: ok, ms: r.ms || 0, src: o.src || 'test', set: id, kind: o.kind || 'test', at: now + i });
        return { n: i + 1, id: it.id, section: it.section, topic: it.topic, topicName: it.topicName, skill: it.skill, skillName: it.skillName,
          stem: it.stem, choices: it.choices, answer: it.answer, why: it.why, note: it.note, picked: r.picked == null ? null : r.picked, ok: ok, blank: r.picked == null };
      });
      var right = rows.filter(function (r) { return r.ok; }).length;
      R().saveRun({ id: id, src: o.src || 'test', title: o.title || 'Test', at: now, right: right, total: rows.length, rows: rows, back: o.back || '/tests/' });
      return id;
    });
  }

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function repairIdFor(row) { return (row.section === 'pat' || row.section === 'rc') ? row.section + ':' + row.skill : row.id; }

  function render(host, run, o) {
    o = o || {}; host.textContent = '';
    var rec = R(), misses = run.rows.filter(function (r) { return !r.ok; });
    var filter = misses.length ? 'miss' : 'all';
    function tagged() { return misses.filter(function (r) { var e = rec.repairEntry(repairIdFor(r)); return e && e.reason; }).length; }

    var head = el('header', 'rv-head aui-stack');
    head.appendChild(el('p', 'aui-kicker', 'Review · ' + run.title));
    head.appendChild(el('h1', 'aui-h1', run.right + ' of ' + run.total + ' right'));
    var lede = el('p', 'aui-lede'); head.appendChild(lede);
    function setLede() {
      lede.textContent = misses.length
        ? misses.length + (misses.length === 1 ? ' miss is' : ' misses are') + ' in Repair now. Go through them here: tap why you missed each one (' + tagged() + ' of ' + misses.length + ' tagged). Each comes back as a new version until you beat it twice on different days.'
        : 'No misses on this one. Every answer counts toward Progress.';
    }
    setLede();
    // per section
    var by = {}; run.rows.forEach(function (r) { var b = by[r.section] || (by[r.section] = [0, 0]); b[1] += 1; if (r.ok) b[0] += 1; });
    var secs = el('div', 'rv-secs');
    ORDER.filter(function (k) { return by[k]; }).forEach(function (k) { var c = el('div', 'rv-sec'); c.setAttribute('data-section', k); c.appendChild(el('b', null, SECTION[k])); c.appendChild(el('span', null, by[k][0] + ' of ' + by[k][1] + ' right')); secs.appendChild(c); });
    head.appendChild(secs);
    host.appendChild(head);

    var tabs = el('div', 'rv-tabs'); tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', 'Show');
    [['miss', 'Misses (' + misses.length + ')'], ['all', 'All ' + run.total]].forEach(function (t) {
      var b = el('button', null, t[1]); b.type = 'button'; b.setAttribute('data-show', t[0]); b.setAttribute('aria-pressed', String(filter === t[0]));
      b.addEventListener('click', function () { filter = t[0]; Array.prototype.forEach.call(tabs.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); }); draw(); });
      tabs.appendChild(b);
    });
    host.appendChild(tabs);
    var list = el('ol', 'rv-list'); host.appendChild(list);

    function card(r) {
      var li = el('li', 'rv-q' + (r.ok ? ' ok' : ' miss')); li.setAttribute('data-row', String(r.n)); li.setAttribute('data-section', r.section);
      var meta = el('div', 'rv-meta');
      meta.appendChild(el('span', 'aui-chip', SECTION[r.section] + ' · ' + r.topicName));
      meta.appendChild(el('span', 'aui-small', 'Question ' + r.n));
      meta.appendChild(el('span', 'rv-mark ' + (r.ok ? 'ok' : 'miss'), r.ok ? 'Right' : r.blank ? 'Left blank' : 'Missed'));
      li.appendChild(meta);
      if (r.stem) li.appendChild(el('p', 'rv-stem', r.stem));
      else li.appendChild(el('p', 'rv-stem rv-note', r.note || (SECTION[r.section] + ' question ' + r.n + '. The figure stays in the test’s own report.')));
      if (r.choices && r.choices.length) {
        var ul = el('ul', 'rv-choices');
        r.choices.forEach(function (c, i) {
          var x = el('li'); var mark = i === r.answer ? 'right' : (i === r.picked ? 'yours' : '');
          if (mark) x.className = mark;
          x.appendChild(el('b', null, LETTERS[i])); x.appendChild(el('span', null, c));
          if (i === r.answer) x.appendChild(el('em', null, 'Right answer'));
          else if (i === r.picked) x.appendChild(el('em', null, 'Your answer'));
          ul.appendChild(x);
        });
        li.appendChild(ul);
      } else {
        li.appendChild(el('p', 'aui-small', 'Your answer: ' + (r.picked == null ? 'blank' : LETTERS[r.picked] || r.picked) + '. Right answer: ' + (LETTERS[r.answer] || r.answer) + '.'));
      }
      if (r.why) { var w = el('dl', 'rv-why'); w.appendChild(el('dt', null, 'Why')); var wd = el('dd', null, r.why); wd.style.whiteSpace = 'pre-line'; w.appendChild(wd); li.appendChild(w); }
      if (!r.ok) {
        var rid = repairIdFor(r), entry = rec.repairEntry(rid);
        var why = el('div', 'rv-reason'); why.setAttribute('role', 'group'); why.setAttribute('aria-label', 'Why did you miss it?');
        why.appendChild(el('span', 'rv-reason__h', 'Why did you miss it?'));
        var line = el('p', 'rv-reason__line');
        REASONS.forEach(function (x) {
          var b = el('button', 'rv-reason__b', x[1]); b.type = 'button'; b.setAttribute('data-reason', x[0]);
          b.setAttribute('aria-pressed', String(!!(entry && entry.reason === x[0])));
          b.addEventListener('click', function () {
            rec.repairReason(rid, x[0]);
            Array.prototype.forEach.call(why.querySelectorAll('button'), function (y) { y.setAttribute('aria-pressed', String(y === b)); });
            line.textContent = LINE[x[0]]; line.hidden = false; setLede(); if (o.onChange) o.onChange();
          });
          why.appendChild(b);
        });
        line.hidden = !(entry && entry.reason); if (entry && entry.reason) line.textContent = LINE[entry.reason];
        why.appendChild(line);
        li.appendChild(why);
      }
      // See it on every question, right or wrong: the matching visual, in a sheet over the review.
      var see = window.AceVisuals && window.AceVisuals.chip ? window.AceVisuals.chip({ section: r.section, topic: r.topic, topicName: r.topicName, concept: r.skillName, stem: r.stem }, 'review') : null;
      if (see) {
        see.setAttribute('data-see', see.getAttribute('data-see-id'));
        see.addEventListener('click', function () { rec.event('review-see', { id: r.id, ok: !!r.ok }); });
        var sr = el('div', 'rv-see'); sr.appendChild(see); li.appendChild(sr);
      }
      return li;
    }
    function draw() {
      list.textContent = '';
      var rows = filter === 'miss' ? misses : run.rows;
      if (!rows.length) { list.appendChild(el('li', 'rv-empty', 'No misses on this test.')); return; }
      rows.forEach(function (r) { list.appendChild(card(r)); });
    }
    draw();
  }

  window.AceTestReview = { version: 1, finish: finish, render: render, normalize: normalize, sectionOf: sectionOf, REASONS: REASONS, SECTION: SECTION, ORDER: ORDER };
})();
