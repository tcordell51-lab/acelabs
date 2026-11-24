/* plan-page.js : the study plan page (/plan/). Reads the setup and the diagnostic to prefill,
   stores only the plan's input and what is marked done under 'acelabs_plan_v1', and rebuilds
   the plan from that input on every visit with AcePlanBuilder (shared/ace-plan-core.js). */
(function () {
  'use strict';
  var B = window.AcePlanBuilder;
  var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DOW_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var SEC = ['bio', 'gchem', 'ochem', 'pat', 'rc', 'qr'];
  var SEC_NAME = { bio: 'Biology', gchem: 'Gen Chem', ochem: 'OChem', pat: 'PAT', rc: 'Reading', qr: 'QR' };
  var SEC_SHORT = { bio: 'Bio', gchem: 'GChem', ochem: 'OChem', pat: 'PAT', rc: 'Reading', qr: 'QR' };
  var CONF_WORD = ['', 'Shaky', 'Unsure', 'Okay', 'Solid', 'Strong'];
  var WHY = {
    learn: 'Learn first: a Chalk Talks night, then practice on exactly what it taught.',
    drill: 'Drill and repair: sets near your level, and every miss fixed while it is fresh.',
    testing: 'Full-length season: timed work, and a full test on a steady cadence.',
    final: 'The final stretch: lighter days, no cramming. Keep what you have sharp.',
    eve: 'The day before: rest is the plan.',
    test: 'Test day.'
  };
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* ---------- storage ---------- */
  function loadState() { var s = null; try { s = JSON.parse(localStorage.getItem('acelabs_plan_v1') || 'null'); } catch (e) {} return s && s.input ? s : null; }
  function saveState(st) { st.savedAt = Date.now(); try { localStorage.setItem('acelabs_plan_v1', JSON.stringify(st)); } catch (e) {} }
  function readSetup() { try { return JSON.parse(localStorage.getItem('aceLabs:onboarding') || 'null'); } catch (e) { return null; } }
  function readTestDate() { try { return localStorage.getItem('acelabs_test_date'); } catch (e) { return null; } }
  function readDiag() { try { return JSON.parse(localStorage.getItem('acelabs_diagnostic_v1') || 'null'); } catch (e) { return null; } }
  function readReport() { try { return JSON.parse(localStorage.getItem('acelabs_last_report') || 'null'); } catch (e) { return null; } }
  // One saved plan: fold in the diagnostic and the last report's focus, the same way Home does.
  function sync() {
    if (!state) return;
    var r = B.syncState(state, { today: TODAY, diagnostic: readDiag(), report: readReport() });
    if (r.changed) { state = r.state; saveState(state); }
  }

  /* ---------- dates in the student's own clock ---------- */
  function localToday() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function parts(s) { var p = s.split('-'); return { y: +p[0], m: +p[1] - 1, d: +p[2] }; }
  function niceDate(s, long) { var p = parts(s), w = B.dow(s); return (long ? DOW_LONG[w] : DOW[w]) + ', ' + MON[p.m] + ' ' + p.d; }
  function shortDate(s) { var p = parts(s); return MON[p.m] + ' ' + p.d; }
  var fmtM = function (m) { return B.fmtMinutes(m); };

  /* keep ?student=<id> on links, as the shell does */
  var STUDENT = (function () { try { return new URLSearchParams(location.search).get('student'); } catch (e) { return null; } })();
  function S(href) { if (!STUDENT || !href || href.charAt(0) !== '/') return href; return href + (href.indexOf('?') >= 0 ? '&' : '?') + 'student=' + encodeURIComponent(STUDENT); }

  var state = loadState();
  var TODAY = localToday();
  var HAS_DIAG = !!readDiag();
  var plan = null;
  var showPast = false;

  /* ---------- form ---------- */
  var form = $('form');
  function buildForm() {
    var days = $('f-days'), order = [1, 2, 3, 4, 5, 6, 0];
    days.innerHTML = order.map(function (d) { return '<label><input type="checkbox" name="day" value="' + d + '" aria-label="' + DOW_LONG[d] + '"><span>' + DOW[d] + '</span></label>'; }).join('');
    var opts = ['<option value="0">None</option>'];
    for (var h = 0.5; h <= 10; h += 0.5) opts.push('<option value="' + h + '">' + (h < 1 ? '30 min' : (h % 1 ? Math.floor(h) + ' hr 30 min' : h + ' hr')) + '</option>');
    $('f-hwk').innerHTML = opts.join(''); $('f-hwe').innerHTML = opts.join('');
    $('f-conf').innerHTML = SEC.map(function (s) {
      var radios = [1, 2, 3, 4, 5].map(function (v) { return '<label><input type="radio" name="c-' + s + '" value="' + v + '" aria-label="' + SEC_NAME[s] + ': ' + v + ', ' + CONF_WORD[v] + '"><span>' + v + '</span></label>'; }).join('');
      return '<li data-section="' + s + '"><div class="head"><b>' + SEC_NAME[s] + '</b><span class="src" id="src-' + s + '"></span></div><div class="seg" role="radiogroup" aria-label="' + SEC_NAME[s] + ' confidence">' + radios + '</div><div class="conf-scale" aria-hidden="true"><span>Shaky</span><span>Strong</span></div></li>';
    }).join('');
    $('f-date').min = TODAY;
  }
  var blackouts = [];
  function renderBlackouts() {
    blackouts.sort();
    $('f-blk-list').innerHTML = blackouts.map(function (b) { return '<li><button type="button" data-rm="' + b + '" aria-label="Remove ' + niceDate(b, true) + '">' + niceDate(b) + ' <span>Remove</span></button></li>'; }).join('');
  }
  $('f-blk-add').addEventListener('click', function () {
    var v = $('f-blk').value; if (!v) return;
    if (blackouts.indexOf(v) < 0) blackouts.push(v);
    $('f-blk').value = ''; renderBlackouts();
  });
  $('f-blk-list').addEventListener('click', function (e) {
    var b = e.target.closest('[data-rm]'); if (!b) return;
    blackouts = blackouts.filter(function (x) { return x !== b.getAttribute('data-rm'); }); renderBlackouts();
  });

  function setForm(inp, sources) {
    if (inp.testDate) $('f-date').value = inp.testDate;
    form.querySelector('input[name="attempt"][value="' + (inp.attempt === 'retake' ? 'retake' : 'first') + '"]').checked = true;
    form.querySelectorAll('input[name="day"]').forEach(function (cb) { cb.checked = inp.days.indexOf(+cb.value) >= 0; });
    $('f-hwk').value = String(inp.hoursWeekday); $('f-hwe').value = String(inp.hoursWeekend);
    SEC.forEach(function (s) {
      var v = inp.confidence[s] || 3, r = form.querySelector('input[name="c-' + s + '"][value="' + v + '"]'); if (r) r.checked = true;
      $('src-' + s).textContent = sources && sources[s] ? sources[s] : '';
    });
    blackouts = (inp.blackouts || []).filter(function (b) { return b >= TODAY; }); renderBlackouts();
  }
  function readForm() {
    var conf = {};
    SEC.forEach(function (s) { var r = form.querySelector('input[name="c-' + s + '"]:checked'); conf[s] = r ? +r.value : 3; });
    return {
      today: TODAY, testDate: $('f-date').value,
      days: Array.prototype.map.call(form.querySelectorAll('input[name="day"]:checked'), function (cb) { return +cb.value; }),
      hoursWeekday: +$('f-hwk').value, hoursWeekend: +$('f-hwe').value,
      attempt: (form.querySelector('input[name="attempt"]:checked') || {}).value || 'first',
      confidence: conf, blackouts: blackouts.slice(), hasDiagnostic: !!readDiag(),
      focus: B.focusFromReport(readReport(), TODAY) || (state && state.input.focus) || null
    };
  }
  // Prefill from the setup page and the diagnostic when there is no saved plan yet.
  function prefill() {
    var ob = readSetup() || {}, diag = readDiag(), conf = {}, src = {}, hint = [];
    var weak = Array.isArray(ob.weakAreas) ? ob.weakAreas.map(function (s) { return s === 'gc' ? 'gchem' : s; }) : [];
    SEC.forEach(function (s) { conf[s] = 3; if (weak.indexOf(s) >= 0) { conf[s] = 2; src[s] = 'Marked shaky in setup'; } });
    if (diag && diag.perSection) {
      var map = { bio: 'bio', gc: 'gchem', gchem: 'gchem', ochem: 'ochem', qr: 'qr' };
      Object.keys(diag.perSection).forEach(function (k) {
        var s = map[k], d = diag.perSection[k]; if (!s || !d || !d.total) return;
        var pct = d.correct / d.total;
        conf[s] = pct < 0.5 ? 2 : pct < 0.7 ? 3 : pct < 0.85 ? 4 : 5;
        src[s] = 'Diagnostic: ' + d.correct + ' of ' + d.total;
      });
      hint.push('your diagnostic');
    }
    var td = ob.testDate || readTestDate() || '';
    if (td) hint.push('your setup');
    if (hint.length) $('prefill-hint').textContent = 'Filled in from ' + hint.join(' and ') + '. Change anything.';
    if (diag) $('conf-hint').textContent = '1 is shaky, 5 is strong. Four sections start from your diagnostic, an early read on a short check. Shaky sections get more time.';
    return { input: { testDate: td && td >= TODAY ? td : '', attempt: ob.attempt === 'retake' ? 'retake' : 'first', days: [1, 2, 3, 4, 5, 6], hoursWeekday: 2, hoursWeekend: 4, confidence: conf, blackouts: [] }, sources: src };
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var inp = readForm();
    var p = B.generate(Object.assign({ nights: window.AceIndex && window.AceIndex.nights }, inp));
    if (!p.ok) { $('f-err').textContent = p.errors.join(' '); return; }
    $('f-err').textContent = '';
    var done = state ? state.done || {} : {};
    state = { v: 1, input: inp, done: done, diagApplied: state && state.diagApplied };
    var dg = readDiag(); if (dg && dg.perSection) state.diagApplied = String(dg.ts || dg.at || 'done');
    saveState(state);
    shareTestDate(inp);
    render(true);
  });
  // Keep the other pages that read the test date in step with the plan.
  function shareTestDate(inp) {
    try {
      localStorage.setItem('acelabs_test_date', inp.testDate);
      var ob = readSetup() || {};
      ob.testDate = inp.testDate; ob.attempt = inp.attempt; if (!ob.setAt) ob.setAt = Date.now();
      if (!Array.isArray(ob.weakAreas)) ob.weakAreas = [];
      localStorage.setItem('aceLabs:onboarding', JSON.stringify(ob));
    } catch (e) {}
  }

  /* ---------- render ---------- */
  function isDone(d) { if (!state || !state.done) return false; if (state.done[d.date]) return true; return d.tasks.length > 0 && d.tasks.every(taskDone); }
  function taskDone(t) { return !!(state && state.done && state.done[t.id]) || (t.kind === 'diagnostic' && HAS_DIAG); }

  function render(scroll) {
    sync();
    if (!state) { $('today').hidden = true; $('overview').hidden = true; $('days').hidden = true; $('builder').open = true;
      $('lede').textContent = HAS_DIAG ? 'Set your test date and your week. Your diagnostic already filled in four of the six sections below.' : 'Two steps to start. First, your test date and your week, right here. Then the 60-question diagnostic, which is the first task on your plan.';
      return; }
    plan = B.generate(Object.assign({ nights: window.AceIndex && window.AceIndex.nights }, state.input));
    if (!plan.ok) { $('today').hidden = true; $('overview').hidden = true; $('days').hidden = true; $('builder').open = true; $('f-err').textContent = plan.errors.join(' '); return; }
    var past = TODAY > plan.testDate;
    $('builder-k').textContent = 'Change anything';
    $('builder-h').textContent = 'Edit your plan';
    $('f-go').textContent = 'Rebuild my plan';
    if (scroll !== true) $('builder').open = false;
    $('overview').hidden = false; $('days').hidden = false;
    renderToday(past);
    renderOverview();
    renderWeeks();
    document.body.classList.add('has-plan');
    if (scroll === true) $('today').scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (scroll === true) $('builder').open = false;
  }

  function taskRow(t, interactive) {
    var meta = [];
    if (t.section) meta.push('<i data-section="' + t.section + '">' + SEC_SHORT[t.section] + '</i>');
    if (t.minutes) meta.push('<i>' + fmtM(t.minutes) + '</i>');
    var dn = taskDone(t);
    return '<li class="' + (dn ? 'is-done' : '') + '">' +
      (interactive ? '<button type="button" class="tick" data-task="' + t.id + '" aria-pressed="' + dn + '" aria-label="Mark done: ' + esc(t.title) + '"><span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7" fill="none" stroke="#F5F0E8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>' : '<span></span>') +
      '<span class="t"><b>' + esc(t.title) + '</b><small>' + esc(t.detail) + '</small>' + (meta.length ? '<span class="meta">' + meta.join('') + '</span>' : '') + '</span>' +
      '<a class="open go" href="' + esc(S(t.href)) + '">Open</a></li>';
  }

  function renderToday(past) {
    var box = $('today');
    box.hidden = false;
    if (past) {
      box.removeAttribute('data-phase');
      $('today-date').textContent = niceDate(TODAY, true);
      $('today-pill').textContent = 'Test date passed';
      $('today-phase').textContent = '';
      $('today-h').textContent = 'Your test date has passed';
      $('today-why').textContent = 'Going again? Set your next date below and choose Retake. The plan rebuilds around your real attempt: more drilling and timed work, less first-pass reading.';
      $('today-tasks').innerHTML = '';
      $('today-go').hidden = true; $('today-focus').hidden = true;
      $('today-total').textContent = ''; $('behind').innerHTML = '';
      $('builder').open = true;
      return;
    }
    var idx = plan.days.findIndex(function (d) { return d.date === TODAY; });
    var d = idx >= 0 ? plan.days[idx] : plan.days[0];
    var left = B.diff(TODAY, plan.testDate);
    $('today-date').textContent = 'Today, ' + niceDate(TODAY, true);
    $('today-pill').textContent = left === 0 ? 'Test day' : left === 1 ? '1 day to test' : left + ' days to test';
    box.setAttribute('data-phase', d.phase);
    var fo = plan.focus && B.diff(plan.focus.date, TODAY) <= B.FOCUS_DAYS ? plan.focus : null, fl = $('today-focus');
    fl.hidden = !fo;
    if (fo) fl.innerHTML = '<b>Focus from your ' + esc(fo.src === 'diagnostic' ? 'diagnostic' : (fo.title || 'last test')) + ':</b> ' + esc(fo.areas.map(function (a) { return a.label; }).join(', ')) + '. Your next study days start there.';
    $('today-phase').textContent = plan.phases.filter(function (p) { return p.id === d.phase; }).map(function (p) { return p.name; })[0] || '';
    if (!d.tasks.length) {
      var next = plan.days.slice(Math.max(0, idx) + 1).find(function (x) { return x.tasks.length; });
      $('today-h').textContent = d.kind === 'blackout' ? 'Blocked off today' : 'A day off';
      $('today-why').textContent = next ? 'Rest counts. Next up: ' + niceDate(next.date, true) + ', ' + next.title + '.' : 'Rest counts.';
      $('today-tasks').innerHTML = next ? next.tasks.map(function (t) { return taskRow(t, false); }).join('') : '';
      $('today-go').hidden = true; $('today-total').textContent = next ? 'Coming up: ' + fmtM(next.minutes) : '';
    } else {
      $('today-h').textContent = d.title;
      $('today-why').textContent = WHY[d.phase] || '';
      $('today-tasks').innerHTML = d.tasks.map(function (t) { return taskRow(t, true); }).join('');
      var first = d.tasks.find(function (t) { return !taskDone(t); }) || d.tasks[0];
      $('today-go').hidden = false;
      $('today-go').href = S(first.href);
      $('today-go').textContent = isDone(d) ? 'All done today' : d.tasks.indexOf(first) === 0 ? 'Start the first task' : 'Start the next task';
      $('today-total').textContent = d.minutes ? 'About ' + fmtM(d.minutes) + ' today' : '';
    }
    // Behind: earlier study days in this plan that are not marked done.
    var missed = plan.days.filter(function (x) { return x.date < TODAY && x.tasks.length && !isDone(x); }).length;
    $('behind').innerHTML = missed ? '<p class="behind">' + missed + (missed === 1 ? ' earlier day is' : ' earlier days are') + ' not marked done. <button type="button" id="b-rebuild">Rebuild from today</button> to spread what is left, or mark them done below.</p>' : '';
    if (missed) $('b-rebuild').addEventListener('click', rebuild);
  }

  function renderOverview() {
    var studyDays = plan.days.filter(function (d) { return d.tasks.length && d.kind !== 'test' && d.kind !== 'eve'; });
    var left = Math.max(0, B.diff(TODAY, plan.testDate));
    var hours = Math.round(plan.totalMinutes / 60);
    $('stats').innerHTML = [
      [left, left === 1 ? 'day to test' : 'days to test'],
      [studyDays.length, 'study days'],
      [plan.fullLengths.length, plan.fullLengths.length === 1 ? 'full-length test' : 'full-length tests'],
      [hours, 'hours planned']
    ].map(function (x) { return '<div class="stat"><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join('');

    // timeline
    var total = plan.days.length, i0 = plan.days.findIndex(function (d) { return d.date === TODAY; });
    var segs = plan.phases.map(function (p) { return '<span class="tl-seg" data-phase="' + p.id + '" style="flex:' + p.days + ' 0 0" title="' + esc(p.name) + '"></span>'; }).join('');
    var fls = plan.fullLengths.map(function (f, k) { var i = plan.days.findIndex(function (d) { return d.date === f; }); return '<span class="tl-fl" style="left:' + ((i + 0.5) / total * 100).toFixed(2) + '%" title="Full-length ' + (k + 1) + ', ' + shortDate(f) + '"></span>'; }).join('');
    var now = i0 >= 0 ? '<span class="tl-now" style="left:' + ((i0 + 0.5) / total * 100).toFixed(2) + '%"></span>' : '';
    $('timeline').innerHTML = '<div class="tl-bar" role="img" aria-label="' + esc(plan.phases.map(function (p) { return p.name + ' ' + p.days + ' days'; }).join(', ') + ', ' + plan.fullLengths.length + ' full-length tests') + '">' + segs + fls + now + '</div>';
    $('legend').innerHTML = plan.phases.filter(function (p) { return p.id !== 'test'; }).map(function (p) {
      return '<li data-phase="' + p.id + '"><span class="ph-chip">' + esc(p.name) + '</span><b>' + shortDate(p.start) + (p.start !== p.end ? ' to ' + shortDate(p.end) : '') + '</b></li>';
    }).join('') + (plan.fullLengths.length ? '<li class="fl-key"><span class="ph-chip">Full-length</span><b>' + plan.fullLengths.map(shortDate).join(', ') + '</b></li>' : '');

    // at a glance: every day, a column per week, Monday on top
    var first = plan.days[0], lead = (first.dow + 6) % 7, cells = [];
    for (var k = 0; k < lead; k++) cells.push('<i class="pad"></i>');
    plan.days.forEach(function (d) {
      var c = d.kind === 'off' ? 'off' : d.kind === 'blackout' ? 'blk' : d.kind === 'full' ? 'fl' : d.kind === 'test' ? 'test' : '';
      if (d.date < TODAY && isDone(d)) c += ' done';
      if (d.date === TODAY) c += ' now';
      cells.push('<i class="' + c + '" data-phase="' + d.phase + '" title="' + esc(niceDate(d.date) + ': ' + (d.title || 'Off')) + '"></i>');
    });
    var weeks = Math.ceil(cells.length / 7);
    var avail = Math.min(620, ($('glance').clientWidth || 340) - 34);
    var cell = Math.max(9, Math.min(26, Math.floor((avail - (weeks - 1) * 3) / weeks)));
    $('glance').innerHTML = '<p class="k" style="margin-bottom:8px">Every day, one square</p><div class="glance-wrap" style="--cell:' + cell + 'px"><div class="glance-days" aria-hidden="true"><span>M</span><span></span><span>W</span><span></span><span>F</span><span></span><span>S</span></div><div class="glance-grid" role="img" aria-label="' + plan.days.length + ' days from today to the test, coloured by phase">' + cells.join('') + '</div></div>';

    // split
    var maxM = Math.max.apply(null, SEC.map(function (s) { return plan.sectionMinutes[s]; })) || 1;
    var sum = SEC.reduce(function (a, s) { return a + plan.sectionMinutes[s]; }, 0) || 1;
    $('split').innerHTML = SEC.map(function (s) {
      var m = plan.sectionMinutes[s];
      return '<li data-section="' + s + '"><span class="nm">' + SEC_SHORT[s] + '</span><span class="bar"><i style="width:' + (m / maxM * 100).toFixed(1) + '%"></i></span><span class="v">' + Math.round(m / 60) + ' hr, ' + Math.round(m / sum * 100) + '%</span></li>';
    }).join('');
    $('notes').innerHTML = plan.notes.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('');
  }

  function weekStart(s) { var w = B.dow(s); return B.addDays(s, -((w + 6) % 7)); }
  function renderWeeks() {
    var groups = [], cur = null;
    plan.days.forEach(function (d) {
      var ws = weekStart(d.date);
      if (!cur || cur.start !== ws) { cur = { start: ws, days: [] }; groups.push(cur); }
      cur.days.push(d);
    });
    var thisWeek = weekStart(TODAY), pastCount = 0;
    var html = groups.map(function (g, gi) {
      var isPast = B.addDays(g.start, 6) < TODAY, isCur = g.start === thisWeek, isNext = g.start === B.addDays(thisWeek, 7);
      if (isPast) pastCount++;
      if (isPast && !showPast) return '';
      var mins = g.days.reduce(function (a, d) { return a + (d.kind === 'eve' || d.kind === 'test' ? 0 : d.minutes); }, 0);
      var work = g.days.filter(function (d) { return d.tasks.length && d.kind !== 'test'; });
      var dn = work.filter(isDone).length;
      var phases = g.days.map(function (d) { return d.phase; }).filter(function (p, k, a) { return a.indexOf(p) === k && p !== 'test'; });
      var names = phases.map(function (p) { return (plan.phases.find(function (x) { return x.id === p; }) || {}).name; }).join(', ');
      var bars = g.days.map(function (d) { var c = d.kind === 'full' ? 'fl' : d.tasks.length ? '' : 'off'; return '<i class="' + c + '" data-phase="' + d.phase + '"></i>'; }).join('');
      var label = 'Week ' + (gi + 1);
      var body = g.days.map(dayRow).join('');
      return '<details class="week' + (isCur ? ' current' : '') + '"' + (isCur || isNext ? ' open' : '') + '><summary><span><b>' + label + (isCur ? ', this week' : '') + '</b><small>' + shortDate(g.days[0].date) + ' to ' + shortDate(g.days[g.days.length - 1].date) + ' &middot; ' + esc(names) + '</small><span class="bars" aria-hidden="true">' + bars + '</span></span><span class="wk-r">' + (mins ? fmtM(mins) : 'Rest') + (work.length ? '<br>' + dn + ' of ' + work.length + ' done' : '') + '</span></summary>' + body + '</details>';
    }).join('');
    $('weeks').innerHTML = html;
    var pb = $('a-past'); pb.hidden = !pastCount; pb.textContent = showPast ? 'Hide earlier weeks' : 'Show earlier weeks (' + pastCount + ')';
  }

  function dayRow(d) {
    var p = parts(d.date), off = !d.tasks.length, done = isDone(d), isToday = d.date === TODAY;
    var cls = 'day' + (off ? ' off' : '') + (d.kind === 'full' ? ' full' : '') + (done ? ' is-done' : '') + (isToday ? ' today-row' : '');
    var dt = '<div class="dt"><b>' + DOW[d.dow] + '</b><span>' + p.d + '</span><em>' + (isToday ? 'Today' : MON[p.m]) + '</em></div>';
    if (off) return '<div class="' + cls + '" data-phase="' + d.phase + '">' + dt + '<div class="body">' + (d.kind === 'blackout' ? 'Blocked off' : 'Off') + '</div></div>';
    var list = d.tasks.map(function (t) { return '<li' + (t.section ? ' data-section="' + t.section + '"' : '') + '><a href="' + esc(S(t.href)) + '">' + esc(t.title) + '</a>' + (t.minutes ? '<span class="m">' + fmtM(t.minutes) + '</span>' : '') + '</li>'; }).join('');
    var markable = d.kind !== 'test';
    return '<div class="' + cls + '" data-phase="' + d.phase + '">' + dt + '<div class="body"><div class="ttl"><b>' + esc(d.title) + '</b>' + (d.minutes && d.kind !== 'test' ? '<span class="m">' + fmtM(d.minutes) + '</span>' : '') + '</div><ol>' + list + '</ol></div>' +
      (markable ? '<div class="mark"><button type="button" class="mark-btn" data-day="' + d.date + '" aria-pressed="' + done + '">' + (done ? 'Done' : 'Mark done') + '</button></div>' : '') + '</div>';
  }

  /* ---------- actions ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-task]');
    if (t && state) {
      var id = t.getAttribute('data-task');
      state.done = state.done || {};
      if (state.done[id]) delete state.done[id]; else state.done[id] = 1;
      var day = id.slice(0, 10);
      if (!plan.days.find(function (x) { return x.date === day; }).tasks.every(taskDone)) delete state.done[day];
      saveState(state); render(); return;
    }
    var m = e.target.closest('[data-day]');
    if (m && state) {
      var date = m.getAttribute('data-day'), dd = plan.days.find(function (x) { return x.date === date; });
      state.done = state.done || {};
      var on = !isDone(dd);
      if (on) { state.done[date] = 1; dd.tasks.forEach(function (k) { state.done[k.id] = 1; }); }
      else { delete state.done[date]; dd.tasks.forEach(function (k) { delete state.done[k.id]; }); }
      saveState(state); render();
    }
  });
  function rebuild() {
    if (!state) return;
    var inp = Object.assign({}, state.input, { today: TODAY, hasDiagnostic: !!readDiag() });
    inp.blackouts = (inp.blackouts || []).filter(function (b) { return b >= TODAY; });
    var p = B.generate(Object.assign({ nights: window.AceIndex && window.AceIndex.nights }, inp));
    if (!p.ok) { $('builder').open = true; $('f-err').textContent = p.errors.join(' '); $('builder').scrollIntoView({ behavior: 'smooth' }); return; }
    // keep marks only for days before today; the days ahead are new
    var keep = {}; Object.keys(state.done || {}).forEach(function (k) { if (k.slice(0, 10) < TODAY) keep[k] = state.done[k]; });
    state = { v: 1, input: inp, done: keep, diagApplied: state.diagApplied };
    saveState(state); setForm(inp); render(true);
  }
  $('a-rebuild').addEventListener('click', rebuild);
  $('a-past').addEventListener('click', function () { showPast = !showPast; renderWeeks(); });
  $('a-print').addEventListener('click', function () { window.print(); });
  $('a-ics').addEventListener('click', function () {
    if (!plan) return;
    var origin = location.origin && location.origin.indexOf('http') === 0 ? location.origin : 'https://acelabs.netlify.app';
    var blob = new Blob([B.toICS(plan, origin)], { type: 'text/calendar;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'dat-study-plan.ics';
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  });
  var openBefore = [];
  window.addEventListener('beforeprint', function () { openBefore = []; document.querySelectorAll('details.week').forEach(function (d) { openBefore.push(d.open); d.open = true; }); });
  window.addEventListener('afterprint', function () { document.querySelectorAll('details.week').forEach(function (d, i) { d.open = !!openBefore[i]; }); });

  /* ---------- start ---------- */
  buildForm();
  sync();
  if (state) { setForm(state.input); render(); }
  else { var pf = prefill(); setForm(pf.input, pf.sources); render(); }
})();
