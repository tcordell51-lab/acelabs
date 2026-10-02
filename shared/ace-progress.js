/* ace-progress.js : the one storage interface for the Ace Labs shell pages
   (home, Learn, Review, Performance). Tools keep writing their own keys; this
   file READS them through small adapters and normalizes them, and it owns the
   few things the shell itself stores (the unified review schedule).

   Today everything is this browser's localStorage. Every write the shell makes
   goes through set(), so a server sync can attach later without touching any
   page:

     AceProgress.setSyncAdapter({
       push: function (change) { return fetch(...); },   // change = { key, value, at }; Promise
       pull: function () { return Promise.resolve({ key: value, ... }); }   // optional
     });

   Failed pushes stay queued (ace.v1.pending) and retry on the next set() or
   flush(). pull() values are written into the cache. localStorage is a cache,
   never the record: when the portal sync exists, it is canonical.

   Normal shapes
     miss:   { id, section, concept, topic, skill, source, sourceLabel, when,
               status: 'learning'|'reviewing'|'mastered', due, box, detail, rank }
     result: { id, kind, label, when, correct, total, timeSec,
               sections: [{ section, label, correct, total, timeSec }],
               topics:   [{ section, topic, missed, total }] }

   Rules carried from the product: raw counts only (no estimated score, no
   percentile, no prediction), no streak or pace language anywhere it surfaces. */
(function () {
  'use strict';
  var NS = 'ace.v1.';
  var DAY = 864e5;
  var LEITNER = [1, 3, 7];           // days between clean retries; a clean 7-day retry = mastered
  var R = window.AceRoute || { section: function (s) { return s; }, skillName: function () { return null; } };

  /* ---------------- raw storage ---------------- */
  var mem = {};
  function raw(key) { try { return window.localStorage.getItem(key); } catch (e) { return Object.prototype.hasOwnProperty.call(mem, key) ? mem[key] : null; } }
  function read(key, def) {
    var v = raw(key);
    if (v == null) return def;
    try { var p = JSON.parse(v); return p == null ? def : p; } catch (e) { return def; }
  }
  function writeRaw(key, value) {
    var s = JSON.stringify(value);
    mem[key] = s;
    try { window.localStorage.setItem(key, s); } catch (e) { /* memory only */ }
  }

  /* ---------------- the shell's own keys + sync hook ---------------- */
  var adapter = null, listeners = [];
  function get(k, def) { return read(NS + k, def); }
  function set(k, value) {
    writeRaw(NS + k, value);
    if (adapter) {
      var q = read(NS + 'pending', []);
      q = q.filter(function (c) { return c.key !== k; });
      q.push({ key: k, at: Date.now() });
      writeRaw(NS + 'pending', q);
      flush();
    }
    listeners.forEach(function (fn) { try { fn(k, value); } catch (e) { /* listener */ } });
    return value;
  }
  function flush() {
    if (!adapter || !adapter.push) return Promise.resolve();
    var q = read(NS + 'pending', []);
    return Promise.all(q.map(function (c) {
      return Promise.resolve(adapter.push({ key: c.key, value: get(c.key, null), at: c.at }))
        .then(function () { return null; }, function () { return c; });
    })).then(function (left) { writeRaw(NS + 'pending', left.filter(Boolean)); });
  }
  function pull() {
    if (!adapter || !adapter.pull) return Promise.resolve(false);
    return Promise.resolve(adapter.pull()).then(function (vals) {
      Object.keys(vals || {}).forEach(function (k) { writeRaw(NS + k, vals[k]); });
      return true;
    });
  }
  function setSyncAdapter(a) { adapter = a || null; return flush(); }
  function onChange(fn) { listeners.push(fn); }

  /* ---------------- helpers ---------------- */
  var params = (function () { try { return new URLSearchParams(location.search); } catch (e) { return null; } })();
  var student = params ? (params.get('student') || '').trim() : '';
  function withStudent(href) {
    if (!student || /^https?:/.test(href)) return href;
    var i = href.indexOf('#'), hash = i >= 0 ? href.slice(i) : '', base = i >= 0 ? href.slice(0, i) : href;
    return base + (base.indexOf('?') < 0 ? '?' : '&') + 'student=' + encodeURIComponent(student) + hash;
  }
  function strip(html, n) {
    var s = String(html == null ? '' : html).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
      .replace(/&[a-z#0-9]+;/g, ' ').replace(/\s*[\u2014\u2013]\s*/g, ', ').replace(/\s+/g, ' ').trim();
    return n && s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '...' : s;
  }
  function ts(v) {
    if (v == null) return 0;
    if (typeof v === 'number') return v;
    var t = Date.parse(v); return isNaN(t) ? 0 : t;
  }
  var SUBJ = { Biology: 'bio', 'Gen Chem': 'gchem', OChem: 'ochem', QR: 'qr' };
  function sec(s) { return SUBJ[s] || R.section(s); }

  /* ---------------- profile ---------------- */
  function profile() {
    var ob = read('aceLabs:onboarding', null);
    var date = (ob && ob.testDate) || read('acelabs_test_date', null) || raw('acelabs_test_date');
    if (typeof date !== 'string') date = null;
    var days = null;
    if (date) {
      var t = new Date(date + 'T00:00:00'), now = new Date(); now.setHours(0, 0, 0, 0);
      if (!isNaN(t)) days = Math.round((t - now) / DAY);
    }
    return {
      testDate: date, daysToTest: days, attempt: ob && ob.attempt || null,
      weakAreas: (ob && ob.weakAreas || []).map(sec).filter(Boolean),
      onboarded: !!ob, diagnosed: !!read('acelabs_diagnostic_v1', null)
    };
  }

  /* ---------------- Learn progress (Retold nights) ---------------- */
  var RETOLD_PREFIX = { ochem: 'retold', gchem: 'gchem', bio: 'bioret', qr: 'qrret', pat: 'patret', rc: 'rcret' };
  function learnProgress(section, total) {
    var p = RETOLD_PREFIX[section], started = [];
    if (!p) return null;
    for (var n = 1; n <= (total || 20); n++) {
      var st = read('atDAT_' + p + '_n' + n, null);
      if (st && typeof st === 'object' && Object.keys(st).length) started.push(n);
    }
    var last = started.length ? started[started.length - 1] : 0;
    return { started: started.length > 0, nights: started, walked: [], next: last || 1, last: last };
  }

  /* ---------------- miss adapters ---------------- */
  /* rank: lower comes first. Practice-test misses lead (the Thomas Method:
     PT misses drive every drill), then timed sections, then Climb, then engines, then games. */
  var missAdapters = [];
  function registerMissAdapter(name, fn) { missAdapters.push({ name: name, fn: fn }); }

  registerMissAdapter('practice-tests', function () {
    var hist = read('al:prometricHistory', []), seen = {}, out = [];
    hist.slice().sort(function (a, b) { return ts(b.ts) - ts(a.ts); }).forEach(function (r) {
      if (!r || !r.byTopic || seen[r.testId]) return;
      seen[r.testId] = 1;
      Object.keys(r.byTopic).forEach(function (subj) {
        var bt = r.byTopic[subj] || {};
        Object.keys(bt).forEach(function (topic) {
          var x = bt[topic]; if (!x || x.c >= x.n) return;
          var s = sec(subj);
          out.push({ id: 'pt:' + s + '|' + topic, section: s, concept: topic === 'general' ? (R.SECTION_NAMES && R.SECTION_NAMES[s] || subj) + ' mixed' : topic, topic: topic,
            source: 'practice-test', sourceLabel: r.testName || 'Practice test', when: ts(r.ts),
            detail: (x.n - x.c) + ' of ' + x.n + ' missed', rank: 1 });
        });
      });
    });
    return out;
  });

  registerMissAdapter('pat-tests', function () {
    var all = read('atDAT_patTest_v1', {}), latest = {}, out = [];
    Object.keys(all).forEach(function (k) {
      var a = all[k]; if (!a || a.status !== 'finished' || !a.summary) return;
      if (!latest[a.testId] || latest[a.testId].finishedAt < a.finishedAt) latest[a.testId] = a;
    });
    var NAMES = { keyholes: 'Keyholes', tfe: 'Top front end', angles: 'Angle ranking', holepunch: 'Hole punching', cubes: 'Cube counting', patternfold: 'Pattern folding' };
    var byType = {};
    Object.keys(latest).forEach(function (t) {
      var a = latest[t];
      (a.summary.sections || []).forEach(function (s) {
        if (s.correct >= s.of) return;
        var cur = byType[s.type];
        if (!cur || cur.when < a.finishedAt) byType[s.type] = { when: a.finishedAt, label: a.label, miss: s.of - s.correct, of: s.of };
      });
    });
    Object.keys(byType).forEach(function (type) {
      var b = byType[type];
      out.push({ id: 'pat:' + type, section: 'pat', concept: NAMES[type] || type, skill: type, source: 'pat-test', sourceLabel: b.label || 'PAT test',
        when: b.when, detail: b.miss + ' of ' + b.of + ' missed', rank: 1 });
    });
    return out;
  });

  registerMissAdapter('reading', function () {
    var atts = read('acelabs.rc.v1.attempts', []), byType = {}, out = [];
    atts.slice(0, 10).forEach(function (a) {
      if (!a || !a.results || !a.results.byType) return;
      Object.keys(a.results.byType).forEach(function (type) {
        var v = a.results.byType[type]; if (!v || v[0] >= v[1]) return;
        var when = a.finishedAt || 0;
        if (!byType[type] || byType[type].when < when) byType[type] = { when: when, miss: v[1] - v[0], of: v[1], section: a.mode === 'section' };
      });
    });
    Object.keys(byType).forEach(function (type) {
      var b = byType[type];
      out.push({ id: 'rc:' + type, section: 'rc', concept: type.charAt(0).toUpperCase() + type.slice(1) + ' questions', topic: type,
        source: 'reading', sourceLabel: b.section ? 'Reading section' : 'Reading passage', when: b.when, detail: b.miss + ' of ' + b.of + ' missed', rank: b.section ? 1.2 : 2 });
    });
    return out;
  });

  registerMissAdapter('diagnostic', function () {
    var d = read('acelabs_diagnostic_v1', null);
    if (!d || !d.topWeakTopics) return [];
    return d.topWeakTopics.filter(function (t) { return t && t.correct < t.total; }).map(function (t) {
      var s = sec(t.section);
      return { id: 'diag:' + s + '|' + t.topic, section: s, concept: t.topic, topic: t.topic, source: 'diagnostic', sourceLabel: 'Diagnostic',
        when: ts(d.ts), detail: (t.total - t.correct) + ' of ' + t.total + ' missed', rank: 1.5 };
    });
  });

  registerMissAdapter('climb', function () {
    var st = read('atDAT_minitest', {}), m = st.mistakes || {}, out = [];
    Object.keys(m).forEach(function (k) {
      var x = m[k]; if (!x) return;
      var s = sec(x.section);
      out.push({ id: 'climb:' + k, section: s, concept: x.topic, topic: x.topic, source: 'climb', sourceLabel: 'The Climb',
        when: ts(x.ts), detail: x.q ? strip(x.q.stem, 110) : '',
        native: { resolved: !!x.resolved, box: x.box || 0, due: x.due || 0 }, rank: 2 });
    });
    return out;
  });

  registerMissAdapter('summit', function () {
    var st = read('atDAT_ochemSummit_v1', null);
    if (!st || !st.attempts || !st.attempts.length) return [];
    var a = st.attempts[st.attempts.length - 1], by = {};
    (a.misses || []).forEach(function (x) { var k = x.area || 'Mixed'; by[k] = (by[k] || 0) + 1; });
    return Object.keys(by).map(function (area) {
      return { id: 'summit:' + area, section: 'ochem', concept: area, topic: area, source: 'summit', sourceLabel: 'The Summit',
        when: a.date || 0, detail: by[area] + ' missed in your last section', rank: 2 };
    });
  });

  function engineAttempts(prefix, section, label) {
    var att = read(prefix + ':attempts', []), last = {};
    att.forEach(function (x) { if (x && x.probId != null) last[x.probId] = x; });
    var by = {};
    Object.keys(last).forEach(function (id) {
      var x = last[id]; if (x.correct) return;
      var sk = x.skill || 'mixed';
      by[sk] = by[sk] || { n: 0, when: 0 };
      by[sk].n++; by[sk].when = Math.max(by[sk].when, x.t || 0);
    });
    return Object.keys(by).map(function (sk) {
      return { id: section + '-engine:' + sk, section: section, concept: R.skillName(section, sk) || sk.replace(/-/g, ' '), skill: sk,
        source: section + '-engine', sourceLabel: label, when: by[sk].when, detail: by[sk].n + ' question' + (by[sk].n === 1 ? '' : 's') + ' still open', rank: 3 };
    });
  }
  registerMissAdapter('qr-engine', function () { return engineAttempts('qr-rem-v2', 'qr', 'QR engine'); });
  registerMissAdapter('gc-engine', function () {
    var active = read('gc-rem-v1-meta:active', null);
    var ns = typeof active === 'string' && /^gc-rem-v1/.test(active) ? active : 'gc-rem-v1';
    return engineAttempts(ns, 'gchem', 'Gen Chem engine');
  });

  registerMissAdapter('bio-engine', function () {
    var st = read('acethedat_bio_engine_v1', null);
    if (!st || !st.aceCards) return [];
    return st.aceCards.filter(function (c) { return c && !c.closed; }).map(function (c) {
      var status = c.state === 'mastered' ? 'mastered' : (c.state === 'review' ? 'reviewing' : null);
      return { id: 'bio-card:' + c.id, section: 'bio', concept: strip(c.quickHit || c.q, 80) || 'Bio Ace Card', topic: c.subject || '',
        source: 'bio-engine', sourceLabel: 'Bio Repair Lab', when: ts(c.lastReviewed) || ts(c.nextDue), detail: strip(c.q, 110),
        native: { status: status, due: c.nextDue || 0 }, rank: 3 };
    });
  });

  registerMissAdapter('games', function () {
    var out = [];
    ['bio', 'gchem', 'qr', 'ochem'].forEach(function (s) {
      var st = read('atDAT_games_' + s, null);
      if (!st || !st.topicStats || !st.misses || !Object.keys(st.misses).length) return;
      Object.keys(st.topicStats).forEach(function (topic) {
        var t = st.topicStats[topic]; if (!t || t.seen - t.correct <= 0 || t.correct / t.seen >= 0.8) return;
        out.push({ id: 'game:' + s + '|' + topic, section: s, concept: topic.replace(/[-_]/g, ' '), topic: topic, source: 'games', sourceLabel: 'Game Central',
          when: 0, detail: (t.seen - t.correct) + ' of ' + t.seen + ' missed in rounds', rank: 4 });
      });
    });
    return out;
  });

  /* ---------------- unified review (Leitner 1d / 3d / 7d) ---------------- */
  function reviewState() { return get('review', {}); }
  function statusOf(m, r) {
    if (r && r.mastered) return 'mastered';
    if (r && r.box > 0) return 'reviewing';
    if (r) return 'learning';
    if (m.native) {
      if (m.native.resolved || m.native.status === 'mastered') return 'mastered';
      if (m.native.box > 0 || m.native.status === 'reviewing') return 'reviewing';
    }
    return 'learning';
  }
  function misses(opts) {
    opts = opts || {};
    var rs = reviewState(), out = [];
    missAdapters.forEach(function (a) {
      var rows = [];
      try { rows = a.fn() || []; } catch (e) { rows = []; }
      rows.forEach(function (m) {
        if (!m.section) return;
        var r = rs[m.id];
        m.status = statusOf(m, r);
        m.box = r ? r.box : (m.native && m.native.box) || 0;
        m.due = r ? r.due : (m.native && m.native.due) || m.when || 0;
        m.isDue = m.status !== 'mastered' && m.due <= Date.now();
        out.push(m);
      });
    });
    if (!opts.includeMastered) out = out.filter(function (m) { return m.status !== 'mastered'; });
    out.sort(function (a, b) { return (a.rank - b.rank) || ((b.isDue ? 1 : 0) - (a.isDue ? 1 : 0)) || (b.when - a.when); });
    return out;
  }
  /* ok = the student got it on retry. Wrong sends it back to the start of the ladder. */
  function mark(id, ok) {
    var rs = reviewState(), r = rs[id] || { box: 0, due: 0, seen: 0 };
    r.seen = (r.seen || 0) + 1;
    r.last = Date.now();
    if (ok) {
      r.box += 1;                                  // box 1 -> back in 1 day, 2 -> 3 days, 3 -> 7 days
      if (r.box > LEITNER.length) { r.mastered = true; r.due = 0; r.box = LEITNER.length; }
      else r.due = Date.now() + LEITNER[r.box - 1] * DAY;
    } else {
      r.box = 0; r.mastered = false; r.due = Date.now() + LEITNER[0] * DAY;
    }
    rs[id] = r; set('review', rs);
    return r;
  }
  function unmark(id) { var rs = reviewState(); delete rs[id]; set('review', rs); }

  /* ---------------- timed results ---------------- */
  var resultAdapters = [];
  function registerResultAdapter(name, fn) { resultAdapters.push({ name: name, fn: fn }); }

  registerResultAdapter('practice-tests', function () {
    return read('al:prometricHistory', []).filter(Boolean).map(function (r, i) {
      var sections = Object.keys(r.subjects || {}).map(function (k) {
        var s = r.subjects[k], code = sec(k);
        var tsec = r.timeSec ? (code === 'qr' ? r.timeSec.qr : null) : null;
        return { section: code, label: k, correct: s.correct, total: s.total, timeSec: tsec };
      });
      var topics = [];
      Object.keys(r.byTopic || {}).forEach(function (k) {
        Object.keys(r.byTopic[k] || {}).forEach(function (t) { var x = r.byTopic[k][t]; if (x && x.n) topics.push({ section: sec(k), topic: t, missed: x.n - x.c, total: x.n }); });
      });
      var c = sections.reduce(function (s, x) { return s + (x.correct || 0); }, 0), n = sections.reduce(function (s, x) { return s + (x.total || 0); }, 0);
      var time = r.timeSec ? ((r.timeSec.sons || 0) + (r.timeSec.qr || 0)) || null : null;
      return { id: 'pt:' + (r.testId || i) + ':' + ts(r.ts), kind: 'practice-test', label: r.testName || 'Practice test', when: ts(r.ts),
        correct: c, total: n, timeSec: time, sciencesTimeSec: r.timeSec ? r.timeSec.sons : null, sections: sections, topics: topics };
    });
  });

  registerResultAdapter('climb', function () {
    var st = read('atDAT_minitest', {}), names = ['Foothills', 'First Ascent', 'The Ridge', 'The Steep Face', 'High Camp', 'The Traverse', 'The Ice Wall', 'The Cornice', 'The Death Zone', 'The Summit'];
    return (st.attempts || []).filter(function (a) { return a && a.mode === 'test'; }).map(function (a, i) {
      var sections = Object.keys(a.sect || {}).map(function (k) { return { section: sec(k), label: R.SECTION_SHORT ? R.SECTION_SHORT[sec(k)] : k, correct: a.sect[k].c, total: a.sect[k].t, timeSec: null }; });
      return { id: 'climb:' + i + ':' + a.dateISO, kind: 'climb', label: 'The Climb, rung ' + a.n + (names[a.n - 1] ? ': ' + names[a.n - 1] : ''), when: ts(a.dateISO),
        correct: a.correct, total: a.total, timeSec: a.timeSec || null, sections: sections, topics: [] };
    });
  });

  registerResultAdapter('pat-tests', function () {
    var all = read('atDAT_patTest_v1', {}), NAMES = { keyholes: 'Keyholes', tfe: 'Top front end', angles: 'Angles', holepunch: 'Hole punching', cubes: 'Cubes', patternfold: 'Pattern folding' };
    return Object.keys(all).map(function (k) { return all[k]; }).filter(function (a) { return a && a.status === 'finished' && a.summary; }).map(function (a) {
      var secs = (a.summary.sections || []).map(function (s) { return { section: 'pat', label: NAMES[s.type] || s.type, correct: s.correct, total: s.of, timeSec: s.timeSec || null }; });
      var time = secs.reduce(function (t, s) { return t + (s.timeSec || 0); }, 0);
      return { id: 'pat:' + a.id, kind: 'pat-test', label: a.label || 'PAT test', when: a.finishedAt || a.updatedAt,
        correct: a.summary.total, total: a.summary.of, timeSec: time || null, sections: [{ section: 'pat', label: 'PAT', correct: a.summary.total, total: a.summary.of, timeSec: time || null }],
        parts: secs, topics: secs.map(function (s) { return { section: 'pat', topic: s.label, missed: s.total - s.correct, total: s.total }; }) };
    });
  });

  registerResultAdapter('reading', function () {
    return read('acelabs.rc.v1.attempts', []).filter(function (a) { return a && a.results && a.mode === 'section'; }).map(function (a) {
      var topics = Object.keys(a.results.byType || {}).map(function (t) { var v = a.results.byType[t]; return { section: 'rc', topic: t, missed: v[1] - v[0], total: v[1] }; });
      return { id: 'rc:' + a.id, kind: 'reading', label: 'Reading section', when: a.finishedAt || 0, correct: a.results.correct, total: a.results.total,
        timeSec: a.elapsed || null, sections: [{ section: 'rc', label: 'RC', correct: a.results.correct, total: a.results.total, timeSec: a.elapsed || null }], topics: topics };
    });
  });

  registerResultAdapter('diagnostic', function () {
    var d = read('acelabs_diagnostic_v1', null);
    if (!d || !d.perSection) return [];
    var MAP = { bio: 'bio', gc: 'gchem', ochem: 'ochem', qr: 'qr' };
    var secs = Object.keys(d.perSection).map(function (k) { var s = d.perSection[k]; return { section: MAP[k] || sec(k), label: R.SECTION_SHORT ? R.SECTION_SHORT[MAP[k] || sec(k)] : k, correct: s.correct, total: s.total, timeSec: null }; });
    return [{ id: 'diag:' + d.ts, kind: 'diagnostic', label: 'Diagnostic', when: ts(d.ts),
      correct: secs.reduce(function (t, s) { return t + s.correct; }, 0), total: secs.reduce(function (t, s) { return t + s.total; }, 0), timeSec: null, sections: secs,
      topics: (d.topWeakTopics || []).map(function (t) { return { section: sec(t.section), topic: t.topic, missed: t.total - t.correct, total: t.total }; }) }];
  });

  registerResultAdapter('summit', function () {
    var st = read('atDAT_ochemSummit_v1', null);
    if (!st || !st.attempts) return [];
    return st.attempts.map(function (a, i) {
      var topics = Object.keys(a.areas || {}).map(function (k) { return { section: 'ochem', topic: k, missed: a.areas[k].n - a.areas[k].ok, total: a.areas[k].n }; });
      return { id: 'summit:' + i + ':' + a.date, kind: 'summit', label: 'The Summit, ' + (a.mode === 'timed' ? 'timed' : 'untimed'), when: a.date,
        correct: a.score, total: a.total, timeSec: null, sections: [{ section: 'ochem', label: 'OChem', correct: a.score, total: a.total, timeSec: null }], topics: topics };
    });
  });

  function results() {
    var out = [];
    resultAdapters.forEach(function (a) { try { out = out.concat(a.fn() || []); } catch (e) { /* skip a broken family */ } });
    out = out.filter(function (r) { return r && r.total > 0; });
    out.sort(function (a, b) { return b.when - a.when; });
    return out;
  }

  /* ---------------- Today ---------------- */
  function climbQueue() {
    var st = read('atDAT_minitest', {}), m = st.mistakes || {}, now = Date.now(), due = 0;
    Object.keys(m).forEach(function (k) { var x = m[k]; if (x && (x.due || 0) <= now && (!x.resolved || x.phase === 'maintain')) due++; });
    var best = st.best || {}, nextRung = 1;
    for (var n = 1; n <= 10; n++) { if ((best[n] || 0) < 75) { nextRung = n; break; } nextRung = n + 1; }
    return { due: due, started: !!(st.attempts && st.attempts.length) || Object.keys(m).length > 0, nextRung: Math.min(nextRung, 10) };
  }
  function nextTest() {
    var p = profile();
    if (!p.diagnosed) return { title: 'The diagnostic', detail: 'A short check across the sections that shows where to start.', href: '/diagnostic.html', minutes: 45 };
    var taken = {};
    read('al:prometricHistory', []).forEach(function (r) { if (r && r.testId) taken[r.testId] = 1; });
    var tests = ['MOCK_1', 'MOCK_2', 'MOCK_3'];
    for (var i = 0; i < tests.length; i++) if (!taken[tests[i]]) return { title: 'Practice test ' + (i + 1), detail: 'Sciences and QR, timed like test day.', href: '/prometric-mock.html', minutes: 150 };
    var pat = read('atDAT_patTest_v1', {});
    var patDone = Object.keys(pat).filter(function (k) { return pat[k] && pat[k].status === 'finished'; }).length;
    return { title: 'PAT test ' + (patDone + 1), detail: 'Ninety questions in the real order.', href: '/tools/pat/test.html', minutes: 60 };
  }
  function weakestSection(ms) {
    var c = {};
    ms.forEach(function (m) { if (m.section) c[m.section] = (c[m.section] || 0) + (m.rank <= 1.5 ? 2 : 1); });
    var best = null; Object.keys(c).forEach(function (k) { if (!best || c[k] > c[best]) best = k; });
    return best || (profile().weakAreas[0] || null);
  }
  /* A finite local queue, built from what the student actually did: due misses,
     the Climb's queue, one Learn night where the misses cluster, the next test. */
  function today() {
    var tasks = [], ms = misses(), due = ms.filter(function (m) { return m.isDue; });
    if (due.length) tasks.push({ kind: 'review', title: 'Retry ' + Math.min(due.length, 8) + ' miss' + (Math.min(due.length, 8) === 1 ? '' : 'es') + ' in Review',
      detail: 'Practice-test misses first. Sheet, learn or drill each one.', minutes: Math.min(30, 4 * Math.min(due.length, 8)), href: '/review/?due=1' });
    var cq = climbQueue();
    if (cq.started) tasks.push({ kind: 'climb', title: cq.due ? 'The Climb: today\'s queue' : 'The Climb: rung ' + cq.nextRung,
      detail: cq.due ? cq.due + ' concept' + (cq.due === 1 ? '' : 's') + ' due, each as a fresh question.' : 'Forty questions, then the misses come back on schedule.', minutes: cq.due ? 15 : 40, href: '/tools/minitests/' });
    var ws = weakestSection(ms);
    if (ws && window.AceIndex && window.AceIndex.courses[ws]) {
      var top = ms.filter(function (m) { return m.section === ws; })[0];
      var l = top && window.AceRoute ? window.AceRoute.links(top) : null;
      var lp = learnProgress(ws, 20);
      var n = (l && l.night) || (lp && lp.next) || 1;
      tasks.push({ kind: 'learn', title: (R.SECTION_SHORT ? R.SECTION_SHORT[ws] : ws) + ', Retold: night ' + n,
        detail: (window.AceRoute ? window.AceRoute.nightTitle(ws, n) : '') || 'Pick up the course where it helps most.', minutes: 30, href: window.AceIndex.courses[ws].url + '?night=' + n });
    }
    var nt = nextTest();
    if (tasks.length < 3 || !profile().diagnosed) tasks.push({ kind: 'test', title: nt.title, detail: nt.detail, minutes: nt.minutes, href: nt.href });
    return tasks.slice(0, 4);
  }

  /* The coach's plan, when Ace knows the student (portal handoff -> ace_auth
     cookie, HttpOnly, Path=/api/tutor, from the ai-tutor branch). The page can
     never read the cookie; it asks the tutor function, which reads Weekly Plans
     server-side. Resolves null whenever that is not available. */
  function plan(timeoutMs) {
    if (!window.fetch) return Promise.resolve(null);
    var done = false;
    return new Promise(function (resolve) {
      var t = setTimeout(function () { if (!done) { done = true; resolve(null); } }, timeoutMs || 2500);
      fetch('/api/tutor', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'today' }) })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
          if (done) return; done = true; clearTimeout(t);
          var p = j && (j.plan || (j.today && j.today.plan));
          if (!p || !p.tasks || !p.tasks.length) return resolve(null);
          resolve({ tasks: p.tasks.slice(0, 4), firstName: (j.who && j.who.firstName) || null, weekday: p.weekday || null });
        })
        .catch(function () { if (!done) { done = true; clearTimeout(t); resolve(null); } });
    });
  }

  function hasActivity() {
    if (misses({ includeMastered: true }).length || results().length) return true;
    for (var s in RETOLD_PREFIX) { var lp = learnProgress(s, 15); if (lp && lp.started) return true; }
    var prefixes = ['atDAT_', 'acethedat_bio_', 'qr-rem-v2:', 'gc-rem-v1', 'ochem-rem-v1:', 'acelabs.rc.v1.', 'al:'];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        for (var j = 0; j < prefixes.length; j++) if (k.indexOf(prefixes[j]) === 0) return true;
      }
    } catch (e) { /* storage blocked */ }
    return false;
  }

  window.AceProgress = {
    version: 1, read: read, get: get, set: set, flush: flush, pull: pull, setSyncAdapter: setSyncAdapter, onChange: onChange,
    withStudent: withStudent, profile: profile, learnProgress: learnProgress,
    misses: misses, mark: mark, unmark: unmark, results: results, today: today, nextTest: nextTest, plan: plan, hasActivity: hasActivity,
    registerMissAdapter: registerMissAdapter, registerResultAdapter: registerResultAdapter, LEITNER_DAYS: LEITNER.slice()
  };
})();
