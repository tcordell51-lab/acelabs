/* ace-plan-core.js : the Ace Labs study plan generator. Pure scheduling logic, no questions.
   It lives in /shared/ so Home (a free page) and the plan page build the same plan.
   Was plan/plan-core.js until 2026-11-24.

   Pure and deterministic: the same input always gives the same plan, so the page stores only
   the input and the days marked done, and rebuilds the plan on every visit. No DOM, no storage.
   Loads in the browser as window.AcePlanBuilder and in node with require() (tests/plan/).

     AcePlanBuilder.generate(input)   -> plan, or { ok:false, errors:[...] }
     AcePlanBuilder.toICS(plan, origin) -> text of an .ics calendar file
     AcePlanBuilder.fmtMinutes(m)     -> "1 hr 15 min"
     AcePlanBuilder.todayView(plan, today, done, flags) -> what Home and /plan/ show for today
     AcePlanBuilder.focusFromReport(report, today)      -> the focus a score report writes into the plan
     AcePlanBuilder.confidenceFromDiagnostic(perSection, confidence) -> confidence after the diagnostic

   input = {
     today: 'YYYY-MM-DD', testDate: 'YYYY-MM-DD',
     days: [0..6]            study days of the week, 0 = Sunday
     hoursWeekday, hoursWeekend   hours on a chosen weekday / weekend day
     attempt: 'first' | 'retake',
     confidence: { bio, gchem, ochem, pat, rc, qr }   1 shaky ... 5 strong (3 if missing)
     blackouts: ['YYYY-MM-DD', ...]   days with no study
     nights: AceIndex.nights (optional; gives the Retold night titles)
     focus: { date, src, title, areas: [{ section, label, correct, total, learn:{href,label}, drill:{href,label} }] }
            (optional) the weakest areas of the last score report. The next study days on or
            after focus.date open with them, one area a day, so the report, Home and the plan
            all say the same thing.
   }

   How a plan is built, from the test date backwards:
     test day, then the rest day before it, then the final stretch (14 days out when the
     runway allows it, else 10 or 7; it rotates all six sections, and Test-week mode takes
     over 7 days out), then full-length testing (up to about six weeks before the final stretch), then
     drill and repair, then learn (the Retold nights) at the front.
     Time per section starts from a default study load (Bio 30, Gen Chem 22, OChem 22,
     PAT 26, Reading 12, QR 18). These are Ace Labs planning weights, not DAT statistics:
     the science sections carry the most content, Reading the least. That is times a
     confidence multiplier, stronger for a retake. No one section takes more than 40% of
     study time, so a weak section never crowds out the rest.
     Full-lengths go about every 8 days in a long testing window, every 6 or 4 when time is
     short, never in the last 2 days before the test, each followed by a review day.
   No score predictions and no invented numbers: the only figures are the DAT's own question
   counts and section times, and the hours the student gave. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AcePlanBuilder = api;
})(this, function () {
  'use strict';

  var SECTIONS = ['bio', 'gchem', 'ochem', 'pat', 'rc', 'qr'];
  var NAMES = { bio: 'Biology', gchem: 'Gen Chem', ochem: 'OChem', pat: 'PAT', rc: 'Reading', qr: 'QR' };
  var SHORT = { bio: 'Bio', gchem: 'Gen Chem', ochem: 'OChem', pat: 'PAT', rc: 'Reading', qr: 'QR' };
  // Questions per section on the DAT (ADA candidate guide).
  var ITEMS = { bio: 40, gchem: 30, ochem: 30, pat: 90, rc: 50, qr: 40 };
  var BASE_MIN = { bio: 30, gchem: 22, ochem: 22, pat: 26, rc: 12, qr: 18 };
  var MAX_SHARE = 0.4;
  var COURSE = { bio: '/tools/bio-retold/', gchem: '/tools/gchem/', ochem: '/tools/organic/', qr: '/tools/qr-retold/', pat: '/tools/pat-retold/', rc: '/tools/rc-retold/' };
  var NIGHT_COUNT = { bio: 14, gchem: 14, ochem: 13, qr: 14, pat: 10, rc: 10 };
  var DRILL = { bio: '/bio/?run=daily', gchem: '/gc/?run=daily', ochem: '/oc/?run=daily', qr: '/qr/drill/?run=daily', rc: '/tools/rc/' };
  var PAT_TRAINERS = [
    ['/tools/pat/keyholes.html', 'Keyholes'], ['/tools/pat/tfe.html', 'Top-front-end'], ['/tools/pat/angles.html', 'Angle ranking'],
    ['/tools/pat/holepunch.html', 'Hole punching'], ['/tools/pat/patternfold.html', 'Pattern folding'], ['/tools/pat/cubes.html', 'Cube counting']
  ];
  var LINK = {
    repair: '/repair/', review: '/review/', progress: '/progress/',
    full: '/tools/mock/full.html', patTest: '/tools/pat/test.html', climb: '/tools/minitests/',
    sheets: '/cheat-sheets.html', testWeek: '/test-week.html',
    briefing: '/test-week.html#test-day', diagnostic: '/diagnostic.html', pacing: '/qr/pacing/',
    see: '/see/'
  };
  // Full-length tests every student has today. Tests past this number unlock as they are
  // reviewed, so the plan never promises one by number.
  var FULL_OPEN = 4;
  // The DAT: 90 + 60 + 60 + 45 = 255 minutes of testing; we plan 285 with breaks and check-in.
  var FULL_MIN = 285;
  var MULT = {
    first: { 1: 1.7, 2: 1.35, 3: 1, 4: 0.75, 5: 0.55 },
    retake: { 1: 1.9, 2: 1.5, 3: 1, 4: 0.7, 5: 0.5 }
  };
  var PHASE = {
    learn: { name: 'Learn', blurb: 'Retold nights, each followed by practice on what it taught.' },
    drill: { name: 'Drill and repair', blurb: 'Sets near your level, your Repair queue, a Climb mini test each week.' },
    testing: { name: 'Full-length testing', blurb: 'A timed full-length on a steady cadence, each followed by a review day.' },
    final: { name: 'Final stretch', blurb: 'Lighter days across all six sections: Repair, short sets, cheat sheets. Test-week mode takes over 7 days out.' },
    eve: { name: 'Rest day', blurb: 'No new questions the day before.' },
    test: { name: 'Test day', blurb: '' }
  };
  var DAY = 864e5;

  /* ---------- dates as YYYY-MM-DD strings, UTC arithmetic so DST never shifts a day ---------- */
  function parse(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '')); if (!m) return null; var t = Date.UTC(+m[1], +m[2] - 1, +m[3]); var d = new Date(t); return d.getUTCDate() === +m[3] ? t : null; }
  function fmt(t) { var d = new Date(t); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function addDays(s, n) { return fmt(parse(s) + n * DAY); }
  function diff(a, b) { return Math.round((parse(b) - parse(a)) / DAY); }
  function dow(s) { return new Date(parse(s)).getUTCDay(); }
  function r5(m) { return m <= 0 ? 0 : Math.max(5, Math.round(m / 5) * 5); }
  function fmtMinutes(m) { m = Math.round(m); if (m < 60) return m + ' min'; var h = Math.floor(m / 60), r = m % 60; return h + ' hr' + (r ? ' ' + r + ' min' : ''); }
  function clampNum(v, lo, hi, dflt) { v = Number(v); if (!isFinite(v)) return dflt; return Math.min(hi, Math.max(lo, v)); }

  function normalize(input) {
    input = input || {};
    var conf = {};
    SECTIONS.forEach(function (s) { var c = input.confidence && Number(input.confidence[s]); conf[s] = c >= 1 && c <= 5 ? Math.round(c) : 3; });
    var days = Array.isArray(input.days) ? input.days.map(Number).filter(function (d, i, a) { return d >= 0 && d <= 6 && a.indexOf(d) === i; }).sort() : [];
    var black = Array.isArray(input.blackouts) ? input.blackouts.filter(function (b, i, a) { return parse(b) !== null && a.indexOf(b) === i; }).sort() : [];
    return {
      today: input.today, testDate: input.testDate, days: days,
      hoursWeekday: clampNum(input.hoursWeekday, 0, 12, 2), hoursWeekend: clampNum(input.hoursWeekend, 0, 12, 4),
      attempt: input.attempt === 'retake' ? 'retake' : 'first', confidence: conf, blackouts: black,
      hasDiagnostic: !!input.hasDiagnostic, focus: cleanFocus(input.focus)
    };
  }

  /* ---------- focus: the weakest areas of the last score report ---------- */
  function localHref(h) { return typeof h === 'string' && h.charAt(0) === '/' && h.charAt(1) !== '/' ? h : null; }
  function cleanLink(l) { var h = l && localHref(l.href); return h ? { href: h, label: String(l.label || '').slice(0, 120) } : null; }
  function cleanFocus(f) {
    if (!f || parse(f.date) === null || !Array.isArray(f.areas)) return null;
    var areas = f.areas.filter(function (a) { return a && SECTIONS.indexOf(a.section) >= 0 && a.label; }).slice(0, 3).map(function (a) {
      return { section: a.section, label: String(a.label).slice(0, 80), correct: Number(a.correct) || 0, total: Number(a.total) || 0, learn: cleanLink(a.learn), drill: cleanLink(a.drill) };
    });
    return areas.length ? { date: f.date, src: String(f.src || 'test'), title: String(f.title || '').slice(0, 80), areas: areas } : null;
  }
  // A report is worth planning around for two weeks. Older than that, the plan goes back to its own order.
  var FOCUS_DAYS = 14;
  function focusFromReport(report, today) {
    if (!report || parse(today) === null) return null;
    var f = cleanFocus(report);
    if (!f) return null;
    var age = diff(f.date, today);
    return age >= 0 && age <= FOCUS_DAYS ? f : null;
  }
  // The diagnostic covers Biology, Gen Chem, OChem and QR. PAT and Reading keep the student's own rating.
  function confidenceFromDiagnostic(perSection, confidence) {
    var out = {}, map = { bio: 'bio', gc: 'gchem', gchem: 'gchem', ochem: 'ochem', qr: 'qr' };
    SECTIONS.forEach(function (s) { var c = confidence && Number(confidence[s]); out[s] = c >= 1 && c <= 5 ? Math.round(c) : 3; });
    Object.keys(perSection || {}).forEach(function (k) {
      var s = map[k], d = perSection[k]; if (!s || !d || !(d.total > 0)) return;
      var pct = d.correct / d.total;
      out[s] = pct < 0.5 ? 2 : pct < 0.7 ? 3 : pct < 0.85 ? 4 : 5;
    });
    return out;
  }

  function weights(conf, attempt) {
    var raw = {}, sum = 0, mult = MULT[attempt] || MULT.first;
    SECTIONS.forEach(function (s) { raw[s] = BASE_MIN[s] * mult[conf[s]]; sum += raw[s]; });
    var out = {}; SECTIONS.forEach(function (s) { out[s] = raw[s] / sum; });
    // Cap any one section, then hand the excess to the others by their own share.
    for (var pass = 0; pass < SECTIONS.length; pass++) {
      var over = 0, freeSum = 0;
      SECTIONS.forEach(function (s) { if (out[s] > MAX_SHARE) { over += out[s] - MAX_SHARE; out[s] = MAX_SHARE; } });
      if (over <= 1e-9) break;
      SECTIONS.forEach(function (s) { if (out[s] < MAX_SHARE) freeSum += out[s]; });
      SECTIONS.forEach(function (s) { if (out[s] < MAX_SHARE) out[s] += over * out[s] / freeSum; });
    }
    return out;
  }

  function nightList(nights, s) {
    var src = nights && Array.isArray(nights[s]) && nights[s].length ? nights[s] : null;
    var n = src ? src.length : NIGHT_COUNT[s], out = [];
    for (var i = 0; i < n; i++) out.push({ n: src ? src[i].n : i + 1, t: src ? src[i].t : '' });
    return out;
  }

  function generate(rawInput) {
    var input = normalize(rawInput), errors = [];
    var nightsSrc = rawInput && rawInput.nights;
    if (parse(input.today) === null) errors.push('Today\'s date is missing.');
    if (parse(input.testDate) === null) errors.push('Add your test date.');
    if (!input.days.length) errors.push('Pick at least one study day.');
    var wkOK = input.days.some(function (d) { return d >= 1 && d <= 5; }) && input.hoursWeekday > 0;
    var weOK = input.days.some(function (d) { return d === 0 || d === 6; }) && input.hoursWeekend > 0;
    if (input.days.length && !wkOK && !weOK) errors.push('Give your study days some hours.');
    if (errors.length) return { ok: false, errors: errors, input: input };

    var N = diff(input.today, input.testDate);
    if (N < 0) return { ok: false, state: 'past', errors: ['That test date has passed. Set your next date to build a new plan.'], input: input };
    if (N === 0) return { ok: false, state: 'today', errors: ['Your test is today. No plan needed: eat, arrive early, trust the work.'], input: input };

    var share = weights(input.confidence, input.attempt);
    var blackSet = {}; input.blackouts.forEach(function (b) { blackSet[b] = 1; });
    function minutesOf(d) { var w = dow(d); var we = w === 0 || w === 6; return Math.round((we ? input.hoursWeekend : input.hoursWeekday) * 60); }

    /* ---------- calendar ---------- */
    var days = [];
    for (var i = 0; i <= N; i++) {
      var date = addDays(input.today, i), w = dow(date), avail;
      if (i === N) avail = 'test';
      else if (i === N - 1) avail = 'eve';
      else if (blackSet[date]) avail = 'blackout';
      else if (input.days.indexOf(w) >= 0 && minutesOf(date) > 0) avail = 'study';
      else avail = 'off';
      days.push({ i: i, date: date, dow: w, avail: avail, budget: avail === 'study' ? minutesOf(date) : 0 });
    }

    /* ---------- phases, from the test backwards ---------- */
    var finalLen = N >= 42 ? 14 : N >= 21 ? 10 : 7;
    var finalStart = Math.max(0, N - 1 - finalLen);
    var preLen = finalStart;
    var short = N < 28;
    var testRatio = short ? 0.6 : input.attempt === 'retake' ? 0.5 : 0.45;
    var testLen = Math.min(41, Math.round(preLen * testRatio));
    var testStart = finalStart - testLen;
    var learnRatio = short ? 0 : input.attempt === 'retake' ? 0.3 : 0.55;
    var learnEnd = Math.round(testStart * learnRatio);
    if (N < 9) { testStart = 0; learnEnd = 0; }
    days.forEach(function (d) {
      d.phase = d.i === N ? 'test' : d.i === N - 1 ? 'eve' : d.i >= finalStart ? 'final' : d.i >= testStart ? 'testing' : d.i >= learnEnd ? 'drill' : 'learn';
    });
    // Long runway: the weeks more than four months out run lighter, so the pace holds.
    var lightBefore = N > 120 ? N - 120 : 0;
    days.forEach(function (d) { if (d.i < lightBefore && d.budget) d.budget = Math.max(30, Math.round(d.budget * 0.7 / 5) * 5); });

    /* ---------- full-lengths: back from 4 days out, never in the last 2 days ---------- */
    var studyIdx = days.filter(function (d) { return d.avail === 'study'; }).map(function (d) { return d.i; });
    function nextStudy(after, limit) { for (var k = 0; k < studyIdx.length; k++) if (studyIdx[k] > after && studyIdx[k] <= limit) return studyIdx[k]; return -1; }
    var fullDays = [], used = {};
    if (N >= 7 && studyIdx.length >= 2) {
      var winStart = testStart, latest = N - 3;
      var gap = N >= 42 ? 8 : N >= 21 ? 6 : 4;
      for (var t = N - 4; t >= winStart && fullDays.length < 10; t -= gap) {
        var best = -1;
        for (var c = Math.max(winStart, t - 3); c <= Math.min(latest, t + 1); c++) {
          var dd = days[c];
          if (!dd || dd.avail !== 'study' || used[c]) continue;
          var rv = nextStudy(c, N - 2);
          if (rv < 0 || used[rv]) continue;
          if (fullDays.some(function (f) { return Math.abs(f - c) < Math.max(4, gap - 3); })) continue;
          if (best < 0 || dd.budget > days[best].budget || (dd.budget === days[best].budget && Math.abs(c - t) < Math.abs(best - t))) best = c;
        }
        if (best >= 0) {
          var rvDay = nextStudy(best, N - 2);
          used[best] = 1; used[rvDay] = 1; fullDays.push(best);
          days[best].kind = 'full'; days[rvDay].kind = 'review';
        }
      }
      fullDays.sort(function (a, b) { return a - b; });
      fullDays.forEach(function (fi, k) {
        days[fi].fullNo = k + 1;
        var rv = nextStudy(fi, N - 2); if (rv >= 0) days[rv].fullNo = k + 1;
      });
    }

    /* ---------- section bookkeeping ---------- */
    var alloc = {}; SECTIONS.forEach(function (s) { alloc[s] = 0; });
    function sumAlloc() { var x = 0; SECTIONS.forEach(function (s) { x += alloc[s]; }); return x; }
    function pick(k, exclude) {
      exclude = exclude || [];
      var tot = Math.max(1, sumAlloc());
      return SECTIONS.filter(function (s) { return exclude.indexOf(s) < 0; })
        .map(function (s) { return { s: s, gap: share[s] - alloc[s] / tot, w: share[s] }; })
        .sort(function (a, b) { return b.gap - a.gap || b.w - a.w; })
        .slice(0, k).map(function (x) { return x.s; });
    }
    var weakOrder = SECTIONS.slice().sort(function (a, b) { return input.confidence[a] - input.confidence[b] || share[b] - share[a]; });

    /* ---------- Retold nights queue ---------- */
    // Stride scheduling: each section's nights come up in proportion to its time share, shaky
    // sections first and more often, strong ones (4 or 5) rarely, so the course interleaves.
    var nightQ = {}, stride = {}, pass = {};
    SECTIONS.forEach(function (s) {
      var c = input.confidence[s];
      nightQ[s] = nightList(nightsSrc, s);
      stride[s] = 1 / (share[s] * (c >= 4 ? 0.35 : c <= 2 ? 1.3 : 1));
      pass[s] = stride[s] * (0.3 + c * 0.1);
    });
    function nextNightSection(maxConf, not) {
      var best = null;
      SECTIONS.forEach(function (s) {
        if (!nightQ[s].length || s === not || input.confidence[s] > (maxConf || 5)) return;
        if (best === null || pass[s] < pass[best]) best = s;
      });
      return best;
    }
    var patRot = 0;
    var COUNT = ['A', 'Two', 'Three', 'Four', 'Five', 'Six'];
    // Longest single block per section: a PAT trainer or reading passages past an hour stop paying off.
    var CAP = { bio: 120, gchem: 120, ochem: 120, qr: 120, pat: 60, rc: 60 };
    function drillTask(s, minutes, timed) {
      var m = r5(Math.min(CAP[s], minutes)), n = Math.max(1, Math.min(6, Math.round(m / 22))), cw = COUNT[n - 1];
      alloc[s] += m;
      if (s === 'pat') {
        var tr = PAT_TRAINERS[patRot++ % PAT_TRAINERS.length];
        return { section: s, kind: 'drill', title: 'PAT: ' + tr[1] + (timed ? ', timed' : ' trainer'), detail: timed ? 'Work at test pace: about 40 seconds a question.' : 'Learn the method on easy items, then speed up.', minutes: m, href: tr[0] };
      }
      if (s === 'rc') return { section: s, kind: 'drill', title: 'Reading: ' + (n === 1 ? 'one passage' : cw.toLowerCase() + ' passages') + (timed ? ', timed' : ', mapped'), detail: timed ? 'Map it, then search for each answer. About 20 minutes a passage on test day.' : 'Map the passage first, then search for each answer instead of rereading.', minutes: m, href: DRILL.rc };
      if (s === 'qr' && timed && m >= 25 && m <= 60) return { section: s, kind: 'drill', title: 'QR: pacing practice', detail: 'Hold the pace: 40 questions in 45 minutes on test day. Skip and return.', minutes: m, href: LINK.pacing };
      var art = (n === 1 && /^[AEIOU]/.test(SHORT[s])) ? 'An' : cw;
      var sets = art + ' ' + SHORT[s] + (n === 1 ? ' set' : ' sets');
      return { section: s, kind: 'drill', title: sets + (timed ? ', timed' : ' near your level'), detail: timed ? 'No hints, no checking until the set is done.' : 'Check each answer and read the explanation on every miss.', minutes: m, href: DRILL[s] };
    }
    function nightTask(s, minutes) {
      var nt = nightQ[s].shift(), m = r5(minutes);
      pass[s] += stride[s];
      alloc[s] += m; taught[s] = true;
      return { section: s, kind: 'learn', title: SHORT[s] + ' Retold, night ' + nt.n + (nt.t ? ': ' + nt.t : ''), detail: 'Read it actively: call each answer before you scroll.', minutes: m, href: COURSE[s] + '?night=' + nt.n };
    }
    function task(kind, title, detail, minutes, href, s) { return { section: s || null, kind: kind, title: title, detail: detail, minutes: r5(minutes), href: href }; }
    function repairTask(m) { return task('repair', 'Clear your Repair queue', 'Each miss comes back as a fresh question. Fix it, then move on.', m, LINK.repair); }
    // A short recall block. What is due back lives in Repair; a day that already has Repair gets a cheat sheet instead.
    function recallTask(d, m) {
      if (d.tasks.some(function (t) { return t.kind === 'repair'; })) return task('sheets', 'Read one cheat sheet from memory', 'Cover it, say what is on it, then check.', m, LINK.sheets);
      return task('repair', 'Check what is due back in Repair', 'Misses return here as new versions. If it is empty, you are done.', m, LINK.repair);
    }
    var taught = {};
    SECTIONS.forEach(function (s) { taught[s] = input.confidence[s] >= 4; });
    function untaught() { return SECTIONS.filter(function (s) { return !taught[s]; }); }

    /* ---------- fill each day ---------- */
    var NIGHT_MIN = 30;
    var learnCount = 0, drillCount = 0, testCount = 0, finalCount = 0, finalSeen = false, patTestPlaced = false, diagPlaced = false;
    var patTestTarget = -1;
    if (input.confidence.pat <= 3 && fullDays.length >= 2) patTestTarget = Math.round((fullDays[0] + fullDays[1]) / 2);
    else if (input.confidence.pat <= 3 && testLen > 0) patTestTarget = testStart + Math.floor(testLen / 2);
    // Split what is left of a day between one or two sections; returns minutes not used.
    function fillSections(d, r, timed, exclude) {
      if (r < 10) return r;
      var room = 4 - d.tasks.length;
      var secs = pick(r >= 75 && room >= 2 ? 2 : 1, exclude);
      if (secs.length === 2) {
        var a = Math.min(CAP[secs[0]], r5(r * 0.55)), b = Math.min(CAP[secs[1]], r - a);
        a = Math.min(CAP[secs[0]], r - b);
        d.tasks.push(drillTask(secs[0], a, timed)); d.tasks.push(drillTask(secs[1], b, timed));
      } else if (room >= 1) d.tasks.push(drillTask(secs[0], r, timed));
      return 0;
    }

    function titled(head, tasks) {
      var names = tasks.filter(function (t) { return t.kind === 'drill' || t.kind === 'learn'; }).map(function (t) { return SHORT[t.section]; }).filter(function (x, k, a) { return a.indexOf(x) === k; });
      return names.length ? head + ': ' + names.slice(0, 3).join(', ').replace(/, ([^,]*)$/, ' and $1') : head;
    }
    days.forEach(function (d) {
      d.tasks = [];
      if (d.avail === 'test') { d.kind = 'test'; d.title = 'Test day'; d.tasks.push(task('test', 'Test day: arrive early with two forms of ID', 'One must be a current government photo ID with your signature. Bring the IDs your Prometric confirmation lists, with the name matching your application.', 0, LINK.briefing)); return; }
      if (d.avail === 'eve') {
        d.kind = 'eve'; d.title = 'Rest day';
        d.tasks.push(task('rest', 'Rest. No new questions today', 'Your score comes from what you already know. A walk, a normal dinner, an early night.', 0, LINK.briefing));
        d.tasks.push(task('prep', 'Read the test-day briefing and pack', 'Both IDs, your Prometric confirmation, the route, and when to leave.', 15, LINK.briefing));
        return;
      }
      if (d.avail !== 'study') { d.kind = d.avail; d.title = d.avail === 'blackout' ? 'Blocked off' : 'Off'; return; }
      var M = d.budget;
      if (d.phase === 'final') M = Math.max(45, Math.round(M * 0.75 / 5) * 5);

      if (d.kind === 'full') {
        d.title = 'Full-length test ' + d.fullNo;
        var open = d.fullNo <= FULL_OPEN;
        d.tasks.push(task('full', 'Full-length test ' + d.fullNo + ', timed, in one sitting', (open ? 'Opens Test ' + d.fullNo + '. ' : 'Tests past ' + FULL_OPEN + ' unlock as they are reviewed. If Test ' + d.fullNo + ' is not open yet, retake the one you took longest ago. ') + '4 hr 15 min of testing plus breaks, like test day.' + (d.budget < FULL_MIN ? ' Longer than your usual ' + fmtMinutes(d.budget) + ': worth the one long day.' : ''), FULL_MIN, LINK.full + '?test=' + d.fullNo));
        d.tasks.push(task('log', 'Read your section counts, then stop', 'Progress shows each section. No deep review tonight: that is tomorrow.', 10, LINK.progress));
        return;
      }
      if (d.kind === 'review') {
        d.title = 'Review full-length ' + d.fullNo;
        var rv = r5(Math.max(30, Math.min(120, M * 0.65)));
        d.tasks.push(task('review', 'Review full-length ' + d.fullNo + ': every miss and every guess', 'Go question by question. For each one, tag why you missed it and what fooled you.', rv, LINK.review));
        d.tasks.push(repairTask(Math.max(15, Math.min(45, M - rv - 10))));
        d.tasks.push(task('progress', 'Check where you stand', 'See which sections moved, with how many answers each read is based on.', 10, LINK.progress));
        return;
      }

      if (d.phase === 'final') {
        var cap = M;
        if (d.i === N - 2) { d.kind = 'light'; d.title = 'Light review'; d.tasks.push(task('sheets', 'Skim your cheat sheets', 'Formulas, trends, reagents. Read, do not cram.', Math.min(30, cap), LINK.sheets)); d.tasks.push(task('prep', 'Read the test-day briefing', 'Know check-in, breaks and the screen before you walk in.', 15, LINK.briefing)); return; }
        finalCount++;
        d.kind = 'final'; d.title = 'Final stretch';
        if (!finalSeen && N - d.i <= 7) { finalSeen = true; d.tasks.push(task('switch', 'Turn on Test-week mode', 'A calm day-by-day plan for the last 7 days. Use it beside this one.', 10, LINK.testWeek)); cap -= 10; }
        var rp = cap >= 60 ? 20 : 15;
        d.tasks.push(repairTask(rp)); cap -= rp;
        var sec = weakOrder[(finalCount - 1) % SECTIONS.length];
        var drillM = Math.min(60, cap - (cap >= 50 ? 20 : 0));
        if (drillM >= 10) { d.title = 'Final stretch: ' + NAMES[sec]; d.tasks.push(drillTask(sec, drillM, true)); cap -= r5(drillM); }
        // A short second section, three steps along the order, so three final days touch all six.
        var sec2 = weakOrder[(finalCount - 1 + 3) % SECTIONS.length];
        if (d.tasks.length < 4 && cap >= 15) { var m2 = Math.min(20, cap); d.title = 'Final stretch: ' + NAMES[sec] + ' and ' + NAMES[sec2]; d.tasks.push(drillTask(sec2, m2, true)); cap -= r5(m2); }
        if (d.tasks.length < 4 && cap >= 10) d.tasks.push(task('sheets', 'Read one cheat sheet', 'Pick the section you just drilled.', Math.min(20, cap), LINK.sheets));
        return;
      }

      if (!diagPlaced && !input.hasDiagnostic) {
        diagPlaced = true;
        d.kind = 'start'; d.title = 'Start here';
        var dg = Math.min(45, M);
        d.tasks.push(task('diagnostic', 'Take the diagnostic', '60 questions across Biology, Gen Chem, OChem and QR. PAT and Reading are not in it: those start from your own rating. Your plan updates from the result.', dg, LINK.diagnostic));
        // No practice set before a lesson: the first course night if there is room, else a look at a whiteboard.
        var first = M - dg >= NIGHT_MIN ? nextNightSection(5) : null;
        if (first) d.tasks.push(nightTask(first, NIGHT_MIN));
        else d.tasks.push(task('see', 'Open one whiteboard', 'Pick any topic and see how it works: predict first, then reveal.', 10, LINK.see));
        return;
      }

      if (d.phase === 'learn') {
        var ns = nextNightSection(5);
        if (ns) {
          learnCount++;
          d.kind = 'learn';
          d.tasks.push(nightTask(ns, NIGHT_MIN));
          var rest = M - NIGHT_MIN, ns2 = null;
          if (rest >= 75) { ns2 = nextNightSection(5, ns); if (ns2) { d.tasks.push(nightTask(ns2, NIGHT_MIN)); rest -= NIGHT_MIN; } }
          var ns3 = ns2 && rest >= 150 ? nextNightSection(5, ns) : null;
          if (ns3 === ns2) ns3 = null;
          if (ns3) { d.tasks.push(nightTask(ns3, NIGHT_MIN)); rest -= NIGHT_MIN; }
          d.title = 'Learn: ' + [ns, ns2, ns3].filter(Boolean).map(function (x) { return NAMES[x]; }).join(', ').replace(/, ([^,]*)$/, ' and $1');
          if (rest >= 15) { var pm = Math.min(CAP[ns], rest >= 90 ? Math.max(30, Math.round(rest / 2)) : 30, rest); d.tasks.push(drillTask(ns, pm)); rest -= r5(pm); }
          // Extra practice only on a section whose course has started (or one rated solid): never a set before its lesson.
          if (rest >= 15 && d.tasks.length < 4) {
            var skip = [ns, ns2, ns3].concat(untaught());
            if ((rest >= 25 || learnCount % 2) && pick(1, skip).length) fillSections(d, rest, false, skip);
            else d.tasks.push(recallTask(d, Math.min(rest, 20)));
          }
          if (d.tasks.length < 2) d.tasks.push(recallTask(d, 10));
          return;
        }
        d.phase = 'drill';
      }

      if (d.phase === 'drill') {
        drillCount++;
        d.kind = 'drill';
        var rpm = M >= 90 ? 25 : M >= 45 ? 15 : 10;
        d.tasks.push(repairTask(rpm));
        var r = M - rpm, lns = nextNightSection(3) || (drillCount % 2 === 0 ? nextNightSection(5) : null);
        if (drillCount % 6 === 0 && r >= 35) {
          d.title = 'Drill and The Climb';
          var cm = Math.min(45, r);
          d.tasks.push(task('climb', 'The Climb: one mini test', 'A short timed test that sends each miss to Repair.', cm, LINK.climb));
          r -= r5(cm);
        } else if (lns && r >= 50) {
          d.tasks.push(nightTask(lns, NIGHT_MIN)); r -= NIGHT_MIN;
          // Room for a second night and still 35 minutes of sets: the course finishes before test day.
          var lns2 = r >= 65 ? nextNightSection(3, lns) : null;
          if (lns2) { d.tasks.push(nightTask(lns2, NIGHT_MIN)); r -= NIGHT_MIN; }
        }
        var before = d.tasks.length;
        fillSections(d, r, false);
        if (!d.title) d.title = titled('Drill', d.tasks);
        if (d.tasks.length === before && d.tasks.length < 2) d.tasks.push(recallTask(d, 10));
        return;
      }

      // testing phase, a regular day
      testCount++;
      d.kind = 'practice';
      var tr = M >= 90 ? 20 : 15;
      d.tasks.push(repairTask(tr));
      var rr = M - tr;
      if (!patTestPlaced && patTestTarget >= 0 && d.i >= patTestTarget && rr >= 60) {
        patTestPlaced = true; alloc.pat += 60;
        d.title = 'PAT test day';
        d.tasks.push(task('test', 'PAT test: 90 questions, timed', 'All six question types at test length: 60 minutes. Review every miss after.', 60, LINK.patTest, 'pat'));
        rr -= 60;
        if (rr >= 15) fillSections(d, Math.min(rr, 75), true, ['pat']);
        return;
      }
      var tn = nextNightSection(3) || (testCount % 2 === 0 ? nextNightSection(5) : null);
      if (tn && rr >= 70) {
        d.tasks.push(nightTask(tn, NIGHT_MIN)); rr -= NIGHT_MIN;
        var tn2 = rr >= 70 ? nextNightSection(3, tn) : null;
        if (tn2) { d.tasks.push(nightTask(tn2, NIGHT_MIN)); rr -= NIGHT_MIN; }
      }
      var cardsM = rr >= 110 ? 15 : 0;
      fillSections(d, rr - cardsM, true);
      if (cardsM && d.tasks.length < 4) d.tasks.push(recallTask(d, cardsM));
      d.title = titled('Timed practice', d.tasks);
      if (d.tasks.length < 2) d.tasks.push(recallTask(d, 10));
    });

    /* ---------- focus: the last score report's weakest areas lead the next study days ---------- */
    // One area a day, on the first ordinary study days on or after the report (never a full-length,
    // its review day, the light day or the rest day). The day keeps its Repair block and its length.
    var focus = input.focus, focusDays = [];
    if (focus && diff(focus.date, input.testDate) > 0) {
      var from = Math.max(0, diff(input.today, focus.date)), ai = 0;
      for (var fi = from; fi < days.length && ai < focus.areas.length && fi <= from + FOCUS_DAYS; fi++) {
        var fd = days[fi];
        if (fd.avail !== 'study' || ['learn', 'drill', 'practice', 'final'].indexOf(fd.kind) < 0) continue;
        var ar = focus.areas[ai++], budget = fd.tasks.reduce(function (a, t) { return a + (t.minutes || 0); }, 0), lead = [];
        if (ar.learn) lead.push({ section: ar.section, kind: 'learn', focus: true, title: 'Focus: learn ' + ar.label, detail: 'From your ' + (focus.title || 'last test') + (ar.total ? ': ' + ar.correct + ' of ' + ar.total + ' right' : '') + '. One lesson, predict before each reveal.', minutes: Math.min(30, r5(budget * 0.5)), href: ar.learn.href });
        if (ar.drill) lead.push({ section: ar.section, kind: 'drill', focus: true, title: 'Focus: drill ' + ar.label, detail: 'Untimed first. Read the explanation on every miss.', minutes: Math.min(25, r5(budget * 0.35)), href: ar.drill.href });
        if (!lead.length) { var fb = drillTask(ar.section, Math.min(30, Math.max(15, r5(budget * 0.4))), false); fb.focus = true; fb.title = 'Focus: ' + ar.label; fb.detail = 'From your ' + (focus.title || 'last test') + (ar.total ? ': ' + ar.correct + ' of ' + ar.total + ' right' : '') + '. ' + fb.detail; lead.push(fb); }
        var keep = fd.tasks.filter(function (t) { return t.kind === 'repair' || t.kind === 'switch'; });
        var others = fd.tasks.filter(function (t) { return keep.indexOf(t) < 0; });
        var used = lead.concat(keep).reduce(function (a, t) { return a + t.minutes; }, 0), out = lead.concat(keep);
        others.forEach(function (t) {
          if (out.length >= 4) return;
          var room = budget - used;
          if (room < 10) return;
          if (t.minutes > room) t.minutes = Math.floor(room / 5) * 5;
          out.push(t); used += t.minutes;
        });
        fd.tasks = out;
        fd.title = 'Focus: ' + ar.label;
        fd.focus = true;
        focusDays.push(fd.date);
      }
    }

    /* ---------- summary, phases, notes ---------- */
    days.forEach(function (d) { d.minutes = d.tasks.reduce(function (a, t) { return a + (t.minutes || 0); }, 0); });
    var phases = [];
    ['learn', 'drill', 'testing', 'final', 'eve', 'test'].forEach(function (p) {
      var ds = days.filter(function (d) { return d.phase === p; });
      if (!ds.length) return;
      phases.push({ id: p, name: PHASE[p].name, blurb: PHASE[p].blurb, start: ds[0].date, end: ds[ds.length - 1].date, days: ds.length });
    });
    var sectionMinutes = {}; SECTIONS.forEach(function (s) { sectionMinutes[s] = 0; });
    days.forEach(function (d) { d.tasks.forEach(function (t) { if (t.section) sectionMinutes[t.section] += t.minutes; }); });
    var studyDays = days.filter(function (d) { return d.tasks.length && d.kind !== 'test' && d.kind !== 'eve'; });
    var totalMin = studyDays.reduce(function (a, d) { return a + d.minutes; }, 0);
    var weekly = N >= 7 ? Math.round(totalMin / (N / 7)) : totalMin;
    var nightsLeft = SECTIONS.filter(function (s) { return input.confidence[s] <= 3 && nightQ[s].length; }).map(function (s) { return NAMES[s]; });
    var nightsTotal = 0, nightsScheduled = 0;
    SECTIONS.forEach(function (s) { var n = nightList(nightsSrc, s).length; nightsTotal += n; nightsScheduled += n - nightQ[s].length; });

    var notes = [], runway;
    if (N < 7) { runway = 'test-week'; notes.push('Under a week to go. This is test week: no new content, short sets, and sleep. Test-week mode has the day-by-day.'); }
    else if (N < 21) { runway = 'short'; notes.push('Under three weeks is a short runway. The plan skips relearning and goes straight to your shakiest sections, timed practice and full-lengths. If several sections feel shaky and you can move your date, that is worth a look.'); }
    else if (N > 120) { runway = 'long'; notes.push('Over four months out. The weeks before the four-month mark use about 70 percent of your hours so the pace holds, and full-lengths start about eight weeks out. Steady beats heavy early.'); }
    else runway = 'standard';
    if (weekly < 360 && N >= 7) notes.push('About ' + fmtMinutes(weekly) + ' a week is light for six sections. The plan fits the hours you gave it; adding a day or an hour widens what it can cover.');
    var maxBudget = Math.max.apply(null, days.map(function (d) { return d.budget || 0; }));
    if (fullDays.length && maxBudget < FULL_MIN) notes.push('A full-length takes about 4 hr 45 min with breaks, longer than any day you gave. Those days run long on purpose.');
    if (!fullDays.length && N >= 9) notes.push('No room for a full-length with these study days. Add a day in the last few weeks to fit one.');
    if (nightsLeft.length && runway !== 'short' && runway !== 'test-week') notes.push('Not every Retold night fits for ' + nightsLeft.join(', ') + '. Read the rest when a day runs short, starting with the nights you find hardest.');

    return {
      ok: true, version: 1, input: input, today: input.today, testDate: input.testDate,
      daysToTest: N, runway: runway, notes: notes, share: share, sectionMinutes: sectionMinutes,
      phases: phases, fullLengths: fullDays.map(function (fi) { return days[fi].date; }),
      studyDayCount: studyDays.length, totalMinutes: totalMin, weeklyMinutes: weekly,
      days: days.map(function (d) {
        return { date: d.date, dow: d.dow, phase: d.phase, kind: d.kind || d.avail, title: d.title || '', minutes: d.minutes, fullNo: d.fullNo || null,
          focus: !!d.focus, tasks: d.tasks.map(function (t, k) { t.id = d.date + '-' + k; return t; }) };
      }),
      focus: focus ? { date: focus.date, src: focus.src, title: focus.title, areas: focus.areas, days: focusDays } : null,
      nightsScheduled: nightsScheduled, nightsTotal: nightsTotal, fullOpen: FULL_OPEN
    };
  }

  /* ---------- today: the one answer Home and /plan/ both show ---------- */
  // done: the plan's saved marks ({ 'YYYY-MM-DD': 1, taskId: 1 }). flags.diagnostic: a diagnostic is on record.
  function todayView(plan, today, done, flags) {
    done = done || {}; flags = flags || {};
    function taskDone(t) { return !!done[t.id] || (t.kind === 'diagnostic' && !!flags.diagnostic); }
    function dayDone(d) { return !!done[d.date] || (d.tasks.length > 0 && d.tasks.every(taskDone)); }
    if (!plan || !plan.ok) return null;
    var left = diff(today, plan.testDate);
    if (left < 0) return { state: 'past', left: left, day: null, tasks: [], next: null, week: [], missed: 0, focus: null };
    var idx = -1; plan.days.forEach(function (d, i) { if (d.date === today) idx = i; });
    var day = idx >= 0 ? plan.days[idx] : plan.days[0];
    var tasks = day.tasks.map(function (t) { return { task: t, done: taskDone(t) }; });
    var upNext = null;
    if (!day.tasks.length) for (var i = Math.max(0, idx) + 1; i < plan.days.length; i++) if (plan.days[i].tasks.length) { upNext = plan.days[i]; break; }
    var firstOpen = null; tasks.forEach(function (x) { if (!firstOpen && !x.done) firstOpen = x.task; });
    // the week strip: Monday to Sunday around today
    var monday = addDays(today, -((dow(today) + 6) % 7)), week = [];
    for (var k = 0; k < 7; k++) {
      var date = addDays(monday, k), pd = null;
      plan.days.forEach(function (d) { if (d.date === date) pd = d; });
      week.push({ date: date, dow: dow(date), today: date === today, inPlan: !!pd, kind: pd ? pd.kind : 'none', title: pd ? pd.title : '', minutes: pd ? pd.minutes : 0, work: !!(pd && pd.tasks.length && pd.kind !== 'test'), done: !!(pd && pd.tasks.length && dayDone(pd)) });
    }
    var missed = plan.days.filter(function (d) { return d.date < today && d.tasks.length && !dayDone(d); }).length;
    var focus = plan.focus && diff(plan.focus.date, today) <= FOCUS_DAYS ? plan.focus : null;
    return { state: left === 0 ? 'test' : day.tasks.length ? 'work' : 'off', left: left, day: day, tasks: tasks, allDone: day.tasks.length > 0 && dayDone(day), first: firstOpen, next: upNext, week: week, missed: missed, focus: focus };
  }

  /* ---------- one saved plan, kept in step with the diagnostic and the last report ----------
     Home and the plan page both call this before they build, so they always show the same plan.
     Pure: give it the saved state and what the browser has, get back the state to save. */
  function syncState(state, ctx) {
    ctx = ctx || {};
    if (!state || !state.input) return { state: state || null, changed: false };
    var inp = Object.assign({}, state.input), out = Object.assign({}, state, { input: inp }), changed = false;
    var diag = ctx.diagnostic, stamp = diag && diag.perSection ? String(diag.ts || diag.at || 'done') : null;
    if (stamp && out.diagApplied !== stamp) {
      inp.confidence = confidenceFromDiagnostic(diag.perSection, inp.confidence);
      inp.hasDiagnostic = true; out.diagApplied = stamp; changed = true;
    }
    var fresh = focusFromReport(ctx.report, ctx.today), cur = cleanFocus(inp.focus);
    if (fresh && (!cur || fresh.date > cur.date || (fresh.date === cur.date && JSON.stringify(fresh) !== JSON.stringify(cur)))) { inp.focus = fresh; changed = true; }
    else if (cur && parse(ctx.today) !== null && diff(cur.date, ctx.today) > FOCUS_DAYS) { delete inp.focus; changed = true; }
    return { state: out, changed: changed };
  }

  /* ---------- .ics export: one all-day event per day with work, plus the test ---------- */
  function icsEscape(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
  function fold(line) {
    var out = [], cur = '', bytes = 0;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i], b = unescape(encodeURIComponent(ch)).length;
      if (bytes + b > (out.length ? 74 : 75)) { out.push(cur); cur = ''; bytes = 0; }
      cur += ch; bytes += b;
    }
    out.push(cur);
    return out.join('\r\n ');
  }
  function toICS(plan, origin) {
    origin = (origin || 'https://acelabs.netlify.app').replace(/\/$/, '');
    var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AceTheDAT//Ace Labs study plan//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:DAT study plan'];
    plan.days.forEach(function (d) {
      if (!d.tasks.length) return;
      var desc = d.tasks.map(function (t) { return '- ' + t.title + (t.minutes ? ' (' + fmtMinutes(t.minutes) + ')' : '') + '\n  ' + origin + t.href; }).join('\n');
      var sum = d.kind === 'test' ? 'DAT test day' : 'DAT study: ' + d.title + (d.minutes ? ' (' + fmtMinutes(d.minutes) + ')' : '');
      L.push('BEGIN:VEVENT', 'UID:' + d.date + '-plan@acelabs', 'DTSTAMP:' + stamp,
        'DTSTART;VALUE=DATE:' + d.date.replace(/-/g, ''), 'DTEND;VALUE=DATE:' + addDays(d.date, 1).replace(/-/g, ''),
        'SUMMARY:' + icsEscape(sum), 'DESCRIPTION:' + icsEscape(desc), 'TRANSP:TRANSPARENT', 'END:VEVENT');
    });
    L.push('END:VCALENDAR');
    return L.map(fold).join('\r\n') + '\r\n';
  }

  return {
    generate: generate, toICS: toICS, fmtMinutes: fmtMinutes, addDays: addDays, diff: diff, dow: dow,
    todayView: todayView, syncState: syncState, focusFromReport: focusFromReport, confidenceFromDiagnostic: confidenceFromDiagnostic, FULL_OPEN: FULL_OPEN, FOCUS_DAYS: FOCUS_DAYS,
    SECTIONS: SECTIONS, NAMES: NAMES, ITEMS: ITEMS, BASE_MIN: BASE_MIN, PHASE: PHASE, weights: weights, FULL_MIN: FULL_MIN
  };
});
