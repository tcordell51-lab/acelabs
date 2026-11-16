/* ace-progress-page.js : Progress (/progress/). Per section: Building, Close or Test-ready, with
   "N answers, X weeks" and the biggest lever. No score prediction anywhere. Only unassisted answers
   move it, read from the most recent 150 with at most 40 from any one day. Under 100 answers it is
   labeled an early read. The answer-change card shows the student's own counts only. */
(function () {
  'use strict';
  var R = window.AceRecord;
  var DAY = 864e5;
  var ORDER = [['bio', 'Biology'], ['gchem', 'Gen Chem'], ['ochem', 'Organic Chem'], ['pat', 'PAT'], ['rc', 'Reading'], ['qr', 'QR']];
  var WORD = ['No answers yet', 'Building', 'Close', 'Test-ready'];
  function dayKey(t) { var d = new Date(t); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }

  function read(section, all, repair) {
    var rows = all.filter(function (a) { return a.section === section && !a.assisted; });
    var out = { n: rows.length, days: 0, weeks: 0, band: 0, acc: null, lever: null, early: rows.length < 100 };
    if (!rows.length) return out;
    var days = {}; rows.forEach(function (a) { days[dayKey(a.at)] = 1; }); out.days = Object.keys(days).length;
    out.weeks = Math.max(1, Math.ceil((rows[rows.length - 1].at - rows[0].at + 1) / (7 * DAY)));
    // most recent 150, at most 40 from any one day
    var perDay = {}, used = [];
    for (var i = rows.length - 1; i >= 0 && used.length < 150; i--) { var k = dayKey(rows[i].at); perDay[k] = (perDay[k] || 0) + 1; if (perDay[k] <= 40) used.push(rows[i]); }
    var right = used.filter(function (a) { return a.ok; }).length; out.acc = right / used.length;
    if (out.acc >= 0.85 && out.days >= 5 && out.n >= 100) out.band = 3;
    else if (out.acc >= 0.70 && out.days >= 3) out.band = 2;
    else out.band = 1;
    // biggest lever: most open repairs in a topic, then the weakest topic with at least 3 answers
    var open = {}; repair.open.forEach(function (e) { if (e.section === section) open[e.topicName] = (open[e.topicName] || 0) + 1; });
    var best = Object.keys(open).sort(function (a, b) { return open[b] - open[a]; })[0];
    if (!best) {
      var t = {}; used.forEach(function (a) { var x = t[a.topic] = t[a.topic] || [0, 0]; x[0] += 1; if (a.ok) x[1] += 1; });
      best = Object.keys(t).filter(function (k) { return t[k][0] >= 3; }).sort(function (a, b) { return t[a][1] / t[a][0] - t[b][1] / t[b][0]; })[0] || null;
      if (best) best = best.replace(/-/g, ' ');
    }
    out.lever = best;
    return out;
  }

  var all = R.attempts(), repair = R.repairList();
  var host = document.getElementById('sections');
  var missing = [];
  ORDER.forEach(function (s) {
    var r = read(s[0], all, repair);
    var row = el('div', 'sec-row');
    var top = el('div', 'top'); top.appendChild(el('b', null, s[1]));
    top.appendChild(el('span', null, r.n ? WORD[r.band] + (r.early ? ', early read' : '') : 'No answers yet'));
    var band = el('div', 'band'); band.setAttribute('data-band', String(r.band)); band.setAttribute('aria-hidden', 'true');
    for (var k = 0; k < 3; k++) band.appendChild(el('span'));
    var meta = el('div', 'meta');
    if (r.n) {
      meta.appendChild(el('span', null, r.n + ' answer' + (r.n === 1 ? '' : 's') + ', ' + r.weeks + ' week' + (r.weeks === 1 ? '' : 's')));
      var lev = el('span'); lev.appendChild(document.createTextNode('Biggest lever: ')); lev.appendChild(el('strong', null, r.lever || 'keep going')); meta.appendChild(lev);
    } else {
      meta.appendChild(el('span', null, (s[0] === 'ochem' || s[0] === 'pat' || s[0] === 'rc') ? 'This tool keeps its own log until it moves onto the shared record.' : 'Answer a set and this fills in.'));
      missing.push(s[1]);
    }
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
