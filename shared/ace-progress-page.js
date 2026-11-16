/* ace-progress-page.js : Progress (/progress/). Per section: Building, Close or Test-ready, with
   "N answers, X weeks, N in Repair" and the biggest lever. No score prediction anywhere. Bands come
   from AcePlan.band (the learner model's section rating plus answer counts; unassisted answers
   only; under 100 answers it is labeled an early read). The answer-change card shows the
   student's own counts only. */
(function () {
  'use strict';
  var R = window.AceRecord;
  var DAY = 864e5;
  var ORDER = [['bio', 'Biology'], ['gchem', 'Gen Chem'], ['ochem', 'Organic Chem'], ['pat', 'PAT'], ['rc', 'Reading'], ['qr', 'QR']];
  var WORD = ['No answers yet', 'Building', 'Close', 'Test-ready'];
  function dayKey(t) { var d = new Date(t); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }

  /* Bands and counts come from shared/ace-plan.js (the same call Today makes), so the two pages
     never disagree. The lever: the topic with the most open Repair entries, else the lowest rating. */
  function lever(section) {
    var w = window.AcePlan.weakest(1, { section: section })[0];
    return w ? String(w.topicName || w.topic).replace(/-/g, ' ') : null;
  }
  var EMPTY = { bio: 'Take the diagnostic or a Biology set and this fills in.', gchem: 'Take the diagnostic or a Gen Chem set and this fills in.', ochem: 'Take the diagnostic or an OChem set and this fills in.',
    pat: 'Answer a PAT trainer or a PAT test and this fills in.', rc: 'Finish a timed Reading set and this fills in.', qr: 'Take the diagnostic or a QR set and this fills in.' };
  var host = document.getElementById('sections'), counts = R.missCounts();
  var mc = document.getElementById('p-misses');
  if (mc) { mc.setAttribute('data-miss-open', String(counts.open)); mc.setAttribute('data-miss-due', String(counts.due)); mc.textContent = counts.open ? 'In Repair: ' + counts.open + (counts.open === 1 ? ' miss' : ' misses') + ' open, ' + counts.due + ' due back today.' : 'Repair is empty.'; }
  ORDER.forEach(function (s) {
    var r = window.AcePlan.band(s[0]);
    var row = el('div', 'sec-row'); row.setAttribute('data-section', s[0]); row.setAttribute('data-answers', String(r.n)); row.setAttribute('data-open', String(counts.bySection[s[0]] || 0));
    var top = el('div', 'top'); top.appendChild(el('b', null, s[1]));
    top.appendChild(el('span', null, r.n ? WORD[r.band] + (r.early ? ', early read' : '') : 'No answers yet'));
    var band = el('div', 'band'); band.setAttribute('data-band', String(r.band)); band.setAttribute('aria-hidden', 'true');
    for (var k = 0; k < 3; k++) band.appendChild(el('span'));
    var meta = el('div', 'meta');
    if (r.n) {
      meta.appendChild(el('span', null, r.n + ' answer' + (r.n === 1 ? '' : 's') + ', ' + r.weeks + ' week' + (r.weeks === 1 ? '' : 's') + ', ' + (counts.bySection[s[0]] || 0) + ' in Repair'));
      var lev = el('span'); lev.appendChild(document.createTextNode('Biggest lever: ')); lev.appendChild(el('strong', null, lever(s[0]) || 'keep going')); meta.appendChild(lev);
    } else meta.appendChild(el('span', null, EMPTY[s[0]]));
    row.appendChild(top); row.appendChild(band); row.appendChild(meta); host.appendChild(row);
  });

  var c = R.changeStats();
  document.getElementById('c-up').textContent = c.w2r;
  document.getElementById('c-down').textContent = c.r2w;
  var note = document.getElementById('c-note');
  if (!c.enough) note.textContent = 'Fewer than 20 switches so far (' + c.changed + '), too few to read anything into. Every switch is logged.';
  else {
    var worst = null;
    ORDER.forEach(function (s) { var x = R.changeStats({ section: s[0] }); if (x.changed >= 10 && x.r2w > x.w2r && (!worst || x.r2w - x.w2r > worst.d)) worst = { name: s[1], d: x.r2w - x.w2r, x: x }; });
    note.textContent = worst ? 'In ' + worst.name + ', more of your switches went away from right (' + worst.x.r2w + ') than to it (' + worst.x.w2r + '). Change an answer there only when you can name the reason.'
      : 'Across ' + c.changed + ' switches, ' + c.w2r + ' went to right and ' + c.r2w + ' went away from right. Your switches are paying off; change an answer when you can name the reason.';
  }
})();
