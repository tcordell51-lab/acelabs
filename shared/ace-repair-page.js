/* ace-repair-page.js : the Repair page (/repair/). One queue for every miss; each comes back as a
   new version (a twin: same section and skill, another stem) until it is beaten twice on different
   days, answered unassisted. The rules live in shared/ace-record.js (repair*); this file only shows
   them. Banks: the three built banks under /data/. */
(function () {
  'use strict';
  var R = window.AceRecord;
  var $ = function (id) { return document.getElementById(id); };
  var SECTION = { bio: 'Biology', gchem: 'Gen Chem', ochem: 'OChem', qr: 'QR', pat: 'PAT', rc: 'Reading' };
  var BANKS = ['/data/gchem.json', '/data/bio.json', '/data/qr-climb.json'];
  var bank = [], byId = {}, sameItemServed = 0;
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmt(t) { var d = new Date(t); return DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate(); }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function sameDay(a, b) { var x = new Date(a), y = new Date(b); return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate(); }
  var ICON_BACK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E2C97A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.9-4"></path><path d="M4 3v4h4"></path><path d="M4 13a8 8 0 0 0 14.9 4"></path><path d="M20 21v-4h-4"></path></svg>';
  var ICON_X = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fffdf7" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>';
  var ICON_OK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d2018" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"></path></svg>';

  var EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
  /* The "See it" link for a miss: the best-matching visual (shared/ace-visuals.js), or null.
     Opening the picture counts like opening the lesson: no win that day (onOpen says so). */
  function seeIt(e, onOpen) {
    var v = window.AceVisuals ? window.AceVisuals.match({ section: e.section, topic: e.topic, topicName: e.topicName }) : null;
    if (!v) return null;
    var a = el('a', 'see-it'); a.innerHTML = EYE; a.appendChild(document.createTextNode('See it'));
    a.href = window.AceVisuals.withFrom(v.url, 'repair'); a.title = v.label; a.setAttribute('data-see', v.id);
    if (onOpen) a.addEventListener('click', onOpen);
    return a;
  }

  function lessonFor(e) {
    var url = null;
    try { if (window.AceRoute) { var l = window.AceRoute.links({ section: e.section, concept: e.topicName, topic: e.topicName }); url = l.sheet || l.learn || l.drill; } } catch (x) { url = null; }
    return url || ({ gchem: '/tools/gc/', bio: '/tools/bio/', qr: '/tools/qr/' }[e.section] || '/');
  }

  function track(e) {
    var host = $('track'); host.textContent = '';
    if (!e) { host.innerHTML = '<div><span class="node later"></span><b>Missed</b><span>in a set</span></div><div><span class="node later"></span><b>Win 1</b><span>another day</span></div><div><span class="node later"></span><b>Win 2</b><span>another day</span></div>'; return; }
    var w = e.wins || [];
    var cells = [
      '<div><span class="node miss">' + ICON_X + '</span><b>' + fmt(e.lastMiss || e.missedAt) + '</b><span>' + (e.resets ? 'Missed again' : 'Missed in a set') + '</span></div>',
      w[0] ? '<div><span class="node win">' + ICON_OK + '</span><b>' + fmt(w[0]) + '</b><span>Win 1</span></div>' : '<div><span class="node next"></span><b>' + (e.due ? fmt(e.due) : 'Next') + '</b><span>Win 1</span></div>',
      w[1] ? '<div><span class="node win">' + ICON_OK + '</span><b>' + fmt(w[1]) + '</b><span>Win 2</span></div>' : '<div><span class="node later"></span><b>' + (w[0] ? fmt(e.due) : 'A later day') + '</b><span>Win 2</span></div>'
    ];
    host.innerHTML = cells.join('');
  }

  function counts() {
    var L = R.repairList();
    $('n-due').textContent = L.due.length;
    $('n-clear').textContent = L.clearedThisWeek.length;
    var d = new Date();
    $('kicker').textContent = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][d.getDay()] + ' · REPAIR';
    var q = $('queue'); q.textContent = '';
    L.open.slice().sort(function (a, b) { return a.due - b.due; }).forEach(function (e) {
      var li = el('li');
      var left = el('span'); left.appendChild(el('b', null, SECTION[e.section] + ': ' + e.topicName));
      left.appendChild(el('small', null, (e.due <= Date.now() || sameDay(e.due, Date.now()) ? 'Due today' : 'Back ' + fmt(e.due)) + (e.reason ? ' · ' + R.REASONS[e.reason] : '')));
      var wins = el('span', 'wins'); wins.setAttribute('aria-label', (e.wins || []).length + ' of 2 wins');
      for (var k = 0; k < 2; k++) wins.appendChild(el('i', (e.wins || [])[k] ? 'on' : ''));
      var right = el('span', 'q-r');
      var see = seeIt(e, function () { R.event('repair-see', { id: e.id }); R.repairLesson(e.id); });
      if (see) right.appendChild(see);
      right.appendChild(wins);
      li.appendChild(left); li.appendChild(right); q.appendChild(li);
    });
    if (!L.open.length) q.appendChild(el('li', null, 'Nothing in the queue. Misses from any set land here.'));
    // misses from the older tools and the practice tests (no twin bank yet): shown on Review
    var legacy = 0;
    try { if (window.AceProgress) legacy = window.AceProgress.misses({}).filter(function (m) { return !/^record:/.test(m.id); }).length; } catch (x) { legacy = 0; }
    var note = $('legacy-note');
    if (legacy) { note.hidden = false; note.textContent = legacy + ' more miss' + (legacy === 1 ? '' : 'es') + ' from practice tests and the older tools are on Review. They come back there, in their own tool, until their banks have twins.'; }
    return L;
  }

  function showNext() {
    var L = counts(), host = $('now'); host.textContent = '';
    var e = L.due[0];
    if (!e) {
      var next = L.open.slice().sort(function (a, b) { return a.due - b.due; })[0];
      var box = el('div', 'loop-empty');
      box.textContent = next ? 'Nothing is due back today. The next one returns ' + fmt(next.due) + '.' : 'No misses yet. When a set question goes wrong, it comes back here as a new version.';
      host.appendChild(box);
      if (!next) { var a = el('a', 'loop-go', 'Start a set'); a.href = '/gc/?run=daily'; host.appendChild(a); }
      track(next || null);
      return;
    }
    track(e);
    var v = R.repairVersion(e, bank);
    if (!v.item) {   // the missed item is not in a built bank: send it to its tool
      var gone = el('div', 'loop-empty'); gone.textContent = 'This miss came from a tool without a twin bank yet. Open Review to retry it there.'; host.appendChild(gone); return;
    }
    if (v.sameItem) sameItemServed += 1;
    var assisted = false;
    var tags = el('div', 'loop-tags');
    var back = el('span', 'tag-back'); back.innerHTML = ICON_BACK + ' ' + (v.sameItem ? 'Back again, same question' : 'Back again, new version');
    tags.appendChild(back);
    tags.appendChild(el('span', 'tag-trap', 'Trap: ' + (e.trap || e.topicName).toLowerCase()));
    if (e.untimedFirst) tags.appendChild(el('span', 'tag-plain', 'Untimed this time'));
    host.appendChild(tags);

    var lessonSeen = e.lessonAt && sameDay(e.lessonAt, Date.now());
    if (e.lessonFirst && !lessonSeen) {
      var les = el('div', 'loop-lesson');
      les.appendChild(el('h3', null, 'A short lesson first'));
      les.appendChild(el('p', null, 'You tagged this one "Didn\'t know it". Read the lesson on ' + e.topicName.toLowerCase() + ', then the new version is here. A win counts on a day you answer without the lesson open first.'));
      var row = el('div', 'loop-btns');
      var open = el('a', 'aui-btn', 'Open the lesson'); open.href = lessonFor(e); open.target = '_blank'; open.rel = 'noopener';
      open.addEventListener('click', function () { R.event('repair-lesson', { id: e.id }); assisted = true; R.repairLesson(e.id); });
      var skip = el('button', 'aui-btn aui-btn--quiet', 'Answer without it'); skip.type = 'button';
      skip.addEventListener('click', function () { les.remove(); });
      row.appendChild(open); row.appendChild(skip); les.appendChild(row); host.appendChild(les);
    } else if (lessonSeen) assisted = true;

    host.appendChild(el('p', 'loop-from', 'From the ' + fmt(e.missedAt) + ' ' + SECTION[e.section] + ' set'));
    var slot = el('div'); host.appendChild(slot);
    var seeRow = el('div', 'see-row'), seeNow = seeIt(e, function () { R.event('repair-see', { id: e.id }); assisted = true; R.repairLesson(e.id); });
    if (seeNow) { seeRow.appendChild(seeNow); seeRow.appendChild(el('span', null, 'Stuck? Open the picture for ' + e.topicName.toLowerCase() + '. A win counts on a day you answer without it.')); host.appendChild(seeRow); }
    window.AceQuestion.mount(slot, v.item, {
      label: SECTION[e.section] + ' · ' + e.topicName,
      nextLabel: 'Next miss',
      confidence: true,
      onAnswer: function (res) {
        R.record({ item: v.item, picked: res.picked, answer: res.answer, ok: res.ok, ms: res.ms, src: 'repair', set: 'repair', first: res.first, changes: res.changes, change: res.change, conf: res.conf, repair: false, assisted: assisted });
        var after = R.repairAnswer(e.id, { servedId: v.item.id, ok: res.ok, assisted: assisted });
        track(after); counts();
        if (seeNow) { seeRow.className = 'see-row' + (res.ok ? '' : ' after'); seeRow.lastChild.textContent = res.ok ? 'Want the picture anyway? It is ' + seeNow.title + '.' : 'Missed it. See it before the next version: ' + seeNow.title + '.'; }
        if (res.ok && !assisted && after && after.cleared) R.event('repair-cleared', { id: e.id });
      },
      onReason: function (reason) { track(R.repairReason(e.id, reason)); counts(); },
      onNext: function () { showNext(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    });
  }
  Promise.all(BANKS.map(function (u) { return fetch(u).then(function (r) { return r.ok ? r.json() : { items: [] }; }).catch(function () { return { items: [] }; }); }))
    .then(function (sets) {
      sets.forEach(function (s) { (s.items || []).forEach(function (it) { bank.push(it); byId[it.id] = it; }); });
      showNext();
    });
})();
