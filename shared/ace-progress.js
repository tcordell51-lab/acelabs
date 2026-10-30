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
   percentile, no prediction), no streak or pace language anywhere it surfaces.

   v4 (One Ace Labs), additive only; every v3 key, function and shape is kept:
     addPlayCard(card)   a Call it first miss (or a kept card) from shared/al-loop.js,
                         stored in acelabs.v1.playCards and listed by the
                         'play-cards' miss adapter, so Review, Today and the dot see it
     notePlay(result)    which calls a student has played (AceLoop's result)
     plays(), registerPlays(list)   the live Call it first entries Today can open
     full-length results al:mockHistory records with kind 'full-length' reach
                         results() and misses() (the Prometric mirror is skipped)
     dueToday            every misses() run writes acelabs.v1.dueToday
                         { v, n, later[], once[], at, day }, the cache the shell's
                         Review dot reads, and fires window 'acelabs:due'. A miss
                         with no date of its own lights the dot on its next day
                         only (once[]); see writeDue
     settings(), saveSettings(patch)   daily minutes, test date, shakiest sections
     todayPlan(opts)     the plan behind Today (spec 1.7): a coach line, an
                         honest source line, at most 4 steps (step 1 playable
                         in under 3 minutes), what moved to tomorrow, the mode */
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
  /* A record that lives under its own full key (acelabs.v1.playCards) syncs the
     same way; its queue entry carries raw: true and the full key. */
  function setRaw(key, value) {
    writeRaw(key, value);
    if (adapter) {
      var q = read(NS + 'pending', []);
      q = q.filter(function (c) { return c.key !== key; });
      q.push({ key: key, raw: true, at: Date.now() });
      writeRaw(NS + 'pending', q);
      flush();
    }
    listeners.forEach(function (fn) { try { fn(key, value); } catch (e) { /* listener */ } });
    return value;
  }
  function flush() {
    if (!adapter || !adapter.push) return Promise.resolve();
    var q = read(NS + 'pending', []);
    return Promise.all(q.map(function (c) {
      return Promise.resolve(adapter.push({ key: c.key, value: c.raw ? read(c.key, null) : get(c.key, null), at: c.at }))
        .then(function () { return null; }, function () { return c; });
    })).then(function (left) { writeRaw(NS + 'pending', left.filter(Boolean)); });
  }
  function pull() {
    if (!adapter || !adapter.pull) return Promise.resolve(false);
    return Promise.resolve(adapter.pull()).then(function (vals) {
      Object.keys(vals || {}).forEach(function (k) { writeRaw(k.indexOf('acelabs.v1.') === 0 ? k : NS + k, vals[k]); });
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
      return { id: 'diag:' + s + '|' + t.topic, section: s, concept: t.label || t.topic, topic: t.topic, source: 'diagnostic', sourceLabel: 'Diagnostic',
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
    // The engine stores the bare student slug and keeps that student's attempts under
    // gc-rem-v1:student:<slug>; a full namespace is accepted too.
    var ns = typeof active === 'string' && active ? (/^gc-rem-v1/.test(active) ? active : 'gc-rem-v1:student:' + active) : 'gc-rem-v1';
    return engineAttempts(ns, 'gchem', 'Gen Chem engine');
  });

  registerMissAdapter('bio-engine', function () {
    var st = read('acethedat_bio_engine_v1', null);
    if (!st || !st.aceCards) return [];
    return st.aceCards.filter(function (c) { return c && !c.closed; }).map(function (c) {
      var status = c.state === 'mastered' ? 'mastered' : (c.state === 'review' ? 'reviewing' : null);
      /* v4: a card from a Bio Call it first (origin "Visualizer: <title>") names its entry */
      var viz = /^Visualizer: (.+)$/.exec(String(c.origin || '')), play = viz ? playByTitle(viz[1], 'bio') : null;
      return { id: 'bio-card:' + c.id, section: 'bio', concept: strip(c.quickHit || c.q, 80) || 'Bio Ace Card', topic: c.subject || '',
        source: 'bio-engine', sourceLabel: 'Bio Repair Lab', when: ts(c.lastReviewed) || ts(c.nextDue), detail: strip(c.q, 110),
        origin: c.origin || '', entryId: play ? play.id : undefined,
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

  /* ---------------- full-length results (al:mockHistory) ----------------
     tools/mock/full.js appends { kind: 'full-length', testId: 'FULL_n', testName,
     ts, subjects: { Biology: { correct, total } ... }, sections: { sons, pat, rc,
     qr: { correct, total, timeSec } }, totalCorrect, totalQs } to al:mockHistory.
     The same key also mirrors the Prometric records (read above from
     al:prometricHistory) and holds old unified-mock rows, so only kind
     'full-length' is read here. Topic detail, when a record carries it, is
     byTopic ({ subject: { topic: { c, n } } }, the Prometric shape) or topics
     ({ 'Subject|topic': { correct, total } }, full.js's score() shape). */
  var FL_PARTS = { sons: 'Natural Sciences', pat: 'PAT', rc: 'Reading', qr: 'QR' };
  function fullLengthName(r) {
    var m = /(\d+)\s*$/.exec(String(r && r.testId || ''));
    return m ? 'Full-length DAT ' + m[1] : (r && r.testName) || 'Full-length DAT';
  }
  function fullLengthRecords() {
    return read('al:mockHistory', []).filter(function (r) { return r && typeof r === 'object' && r.kind === 'full-length' && r.testId; });
  }
  function fullLengthTopics(r) {
    var out = [];
    if (r.byTopic && typeof r.byTopic === 'object') {
      Object.keys(r.byTopic).forEach(function (subj) {
        var bt = r.byTopic[subj] || {};
        Object.keys(bt).forEach(function (t) { var x = bt[t]; if (x && x.n) out.push({ section: sec(subj), subject: subj, topic: t, missed: x.n - x.c, total: x.n }); });
      });
    } else if (r.topics && typeof r.topics === 'object') {
      Object.keys(r.topics).forEach(function (k) {
        var x = r.topics[k], i = k.indexOf('|'); if (!x || !x.total || i < 0) return;
        out.push({ section: sec(k.slice(0, i)), subject: k.slice(0, i), topic: k.slice(i + 1), missed: x.total - x.correct, total: x.total });
      });
    }
    return out.filter(function (t) { return t.section; });
  }
  registerMissAdapter('full-length', function () {
    var seen = {}, ids = {}, out = [];
    function add(m) { if (!ids[m.id]) { ids[m.id] = 1; out.push(m); } }   /* the newest test wins an idea */
    fullLengthRecords().slice().sort(function (a, b) { return ts(b.ts) - ts(a.ts); }).forEach(function (r) {
      if (seen[r.testId]) return;
      seen[r.testId] = 1;
      var label = fullLengthName(r), topics = fullLengthTopics(r);
      if (topics.length) {
        topics.forEach(function (t) {
          if (t.missed <= 0) return;
          add({ id: 'fl:' + t.section + '|' + t.topic, section: t.section, concept: t.topic, topic: t.topic, source: 'full-length', sourceLabel: label,
            when: ts(r.ts), detail: t.missed + ' of ' + t.total + ' missed', rank: 1 });
        });
        return;
      }
      Object.keys(r.subjects || {}).forEach(function (subj) {
        var x = r.subjects[subj], s = sec(subj);
        if (!x || !s || !x.total || x.correct >= x.total) return;
        add({ id: 'fl:' + s + '|general', section: s, concept: ((R.SECTION_NAMES && R.SECTION_NAMES[s]) || subj) + ' mixed', topic: 'general',
          source: 'full-length', sourceLabel: label, when: ts(r.ts), detail: (x.total - x.correct) + ' of ' + x.total + ' missed', rank: 1 });
      });
    });
    return out;
  });

  /* ---------------- Call it first: the play-cards store ----------------
     acelabs.v1.playCards = { v: 1, cards: { id: card }, seen: { entryId: play } }
     card: the Ace Card shared/al-loop.js writes at the verdict (id 'play:<entry>',
     entryId, section, subtopic, title, from, outcome, marked, q, answer, yourCall,
     trapName, missWhy, idea, hook, pic, picAria, made, due, madeAt, links), plus
     dueAt (local midnight of due), lapses, closed. Bio keeps its own deck
     (bio-stick.js through bio-shared.js addAceCard); every other section lands here.
     Card pictures are capped so the store stays small: the newest keep theirs. */
  var PLAY_KEY = 'acelabs.v1.playCards';
  var PIC_BUDGET = 400000;
  function playStore() {
    var s = read(PLAY_KEY, null);
    if (!s || typeof s !== 'object') s = {};
    if (!s.cards || typeof s.cards !== 'object') s.cards = {};
    if (!s.seen || typeof s.seen !== 'object') s.seen = {};
    s.v = 1;
    return s;
  }
  function savePlays(s) {
    var ids = Object.keys(s.cards).sort(function (a, b) { return (s.cards[b].madeAt || 0) - (s.cards[a].madeAt || 0); }), used = 0;
    ids.forEach(function (id) {
      var c = s.cards[id], n = c.pic ? String(c.pic).length : 0;
      if (used + n > PIC_BUDGET) { c.pic = ''; c.picDropped = true; } else used += n;
    });
    return setRaw(PLAY_KEY, s);
  }
  function localMidnight(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    return m ? new Date(+m[1], +m[2] - 1, +m[3]).getTime() : 0;
  }
  function tomorrowAt(t) { var d = new Date(t == null ? Date.now() : t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 1); return d.getTime(); }
  function addPlayCard(card) {
    if (!card || typeof card !== 'object' || !(card.entryId || card.id)) return null;
    var s = playStore(), id = String(card.id || ('play:' + card.entryId)), prev = s.cards[id], now = Date.now();
    var c = {};
    Object.keys(card).forEach(function (k) { c[k] = card[k]; });
    c.id = id;
    c.entryId = c.entryId || id.replace(/^play:/, '');
    c.section = sec(c.section) || c.section || null;
    c.madeAt = c.madeAt || now;
    c.made = c.made || dayKey(c.madeAt);
    c.dueAt = localMidnight(c.due) || tomorrowAt(c.madeAt);
    c.due = c.due || dayKey(c.dueAt);
    c.lapses = prev ? (prev.lapses || 0) + (c.outcome === 'needs-review' ? 1 : 0) : 0;
    c.firstMadeAt = prev ? (prev.firstMadeAt || prev.madeAt) : c.madeAt;
    c.closed = false;
    s.cards[id] = c;
    /* the card is written at the verdict, before the loop ends: note the play
       now, so a page closed early still counts it (notePlay fills the rest) */
    var was = s.seen[c.entryId] && s.seen[c.entryId].day === dayKey(c.madeAt) ? s.seen[c.entryId] : {};
    s.seen[c.entryId] = {
      at: c.madeAt, day: dayKey(c.madeAt), section: c.section, subtopic: c.subtopic || '',
      predict: c.from === 'call' ? 'needs-review' : (was.predict || (c.from === 'keep' || c.from === 'recall' ? 'confirmed' : null)),
      check: c.from === 'recall' ? 'needs-review' : (was.check || (c.from === 'keep' ? 'confirmed' : null)),
      missWhy: c.missWhy || was.missWhy || '', kept: c.from === 'keep' || !!was.kept, movedOn: c.from === 'stuck' || !!was.movedOn
    };
    savePlays(s);
    /* a second miss on a card already climbing sends it back to the start */
    var rs = reviewState();
    if (rs[id] && c.outcome === 'needs-review') mark(id, false);
    misses();
    return c;
  }
  function notePlay(result) {
    if (!result || !result.entryId) return null;
    var s = playStore(), at = result.at || Date.now();
    var rec = {
      at: at, day: dayKey(at), section: sec(result.section) || result.section || null, subtopic: result.subtopic || '',
      predict: result.predict ? result.predict.outcome || null : null, check: result.check ? result.check.outcome || null : null,
      missWhy: result.missWhy || '', kept: !!result.kept, movedOn: !!result.movedOn
    };
    s.seen[result.entryId] = rec;
    savePlays(s);
    return rec;
  }
  registerMissAdapter('play-cards', function () {
    var s = playStore(), out = [];
    Object.keys(s.cards).forEach(function (id) {
      var c = s.cards[id];
      if (!c || c.closed || !c.section) return;
      out.push({ id: c.id, section: c.section, concept: c.subtopic || c.title || 'Call it first', topic: c.subtopic || '', skill: c.entryId,
        source: 'play', sourceLabel: 'Call it first', when: c.madeAt || 0, detail: strip(c.idea, 110),
        entryId: c.entryId, outcome: c.outcome || 'needs-review', marked: !!c.marked, links: c.links || null,
        native: { due: c.dueAt || 0, box: 0 }, rank: 2.5 });
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
    writeDue(out, rs);
    if (!opts.includeMastered) out = out.filter(function (m) { return m.status !== 'mastered'; });
    out.sort(function (a, b) { return (a.rank - b.rank) || ((b.isDue ? 1 : 0) - (a.isDue ? 1 : 0)) || (b.when - a.when); });
    return out;
  }

  /* acelabs.v1.dueToday: the cache the shell's Review dot reads on every page
     (most pages never load this file). A derived cache: written raw, never
     synced, and only when it changes.
       n      scheduled cards due now: a review date (the Leitner ladder) or the
              engine's own due date has come
       later  the next scheduled due times, so a card made yesterday lights the
              dot today before any page has listed misses again
       once   the next-day return of an unscheduled miss (a test, reading, game or
              engine miss with no date of its own): the start of the day after it
              was made. It lights the dot for that one day only. An older
              unscheduled miss still waits in Review and Today, but it never holds
              the dot on by itself, so a backlog from before the schedule existed
              does not leave a dot on every page for good. Reviewing it once gives
              it a review date, and from then on it counts in n and later. */
  var DUE_KEY = 'acelabs.v1.dueToday';
  function writeDue(rows, rs) {
    var now = Date.now(), n = 0, later = [], once = [], back = 0;
    rs = rs || {};
    rows.forEach(function (m) {
      if (!m || m.status === 'mastered') return;
      var scheduled = !!rs[m.id] || !!(m.native && m.native.due);
      if (!scheduled) {
        if (!m.when) return;
        var t = tomorrowAt(m.when);
        if (t + DAY <= now) return;            /* its next day has passed: Review keeps it, the dot lets it rest */
        once.push(t);
        if (t <= now) back++;
        return;
      }
      if (m.isDue) n++;
      else if (m.due > now) later.push(m.due);
    });
    later.sort(function (a, b) { return a - b; });
    later = later.slice(0, 60);
    once.sort(function (a, b) { return a - b; });
    once = once.slice(0, 60);
    var prev = read(DUE_KEY, null);
    if (!prev || prev.n !== n || JSON.stringify(prev.later || []) !== JSON.stringify(later) ||
        JSON.stringify(prev.once || []) !== JSON.stringify(once) || prev.day !== dayKey(now)) {
      writeRaw(DUE_KEY, { v: 1, n: n, later: later, once: once, at: now, day: dayKey(now) });
    }
    try {
      if (typeof window.dispatchEvent === 'function' && typeof window.CustomEvent === 'function') {
        window.dispatchEvent(new window.CustomEvent('acelabs:due', { detail: { n: n + back } }));
      }
    } catch (e) { /* no events here */ }
    return n + back;
  }
  function dayKey(t) {
    var d = t == null ? new Date() : new Date(t);
    return d.getFullYear() + '-' + (d.getMonth() < 9 ? '0' : '') + (d.getMonth() + 1) + '-' + (d.getDate() < 10 ? '0' : '') + d.getDate();
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
        correct: a.correct, total: a.total, timeSec: a.timeSec || null, sections: sections,
        topics: (a.byTopic || []).map(function (t) { return { section: sec(t.section), topic: t.topic, correct: t.c, total: t.t }; }) };
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

  registerResultAdapter('full-length', function () {
    return fullLengthRecords().map(function (r) {
      var sections = Object.keys(r.subjects || {}).map(function (k) {
        var s = r.subjects[k] || {}, code = sec(k);
        return { section: code, label: (R.SECTION_SHORT && R.SECTION_SHORT[code]) || k, correct: s.correct || 0, total: s.total || 0, timeSec: null };
      }).filter(function (s) { return s.section && s.total > 0; });
      var parts = Object.keys(r.sections || {}).map(function (k) {
        var s = r.sections[k] || {};
        return { part: k, label: FL_PARTS[k] || k, correct: s.correct || 0, total: s.total || 0, timeSec: s.timeSec || null };
      }).filter(function (p) { return p.total > 0; });
      var time = parts.reduce(function (t, p) { return t + (p.timeSec || 0); }, 0);
      var c = r.totalCorrect != null ? r.totalCorrect : sections.reduce(function (t, s) { return t + s.correct; }, 0);
      var n = r.totalQs != null ? r.totalQs : sections.reduce(function (t, s) { return t + s.total; }, 0);
      return { id: 'fl:' + r.testId + ':' + ts(r.ts), kind: 'full-length', testId: r.testId, label: fullLengthName(r), when: ts(r.ts),
        correct: c, total: n, timeSec: time || null, sections: sections, parts: parts,
        topics: fullLengthTopics(r).map(function (t) { return { section: t.section, topic: t.topic, missed: t.missed, total: t.total }; }) };
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
      detail: cq.due ? cq.due + ' concept' + (cq.due === 1 ? '' : 's') + ' due, each as a fresh question.' : 'Forty questions, then the misses come back on schedule.', minutes: cq.due ? 15 : 50, href: '/tools/minitests/' });
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
    // The first timed test waits a day: a 45-minute diagnostic and a 150-minute practice
    // test on the same afternoon is not a first day anyone keeps.
    var dg = read('acelabs_diagnostic_v1', null), diagToday = false;
    try { diagToday = !!(dg && dg.ts && new Date(dg.ts).toDateString() === new Date().toDateString()); } catch (e) {}
    var holdTest = diagToday && nt.minutes >= 120;
    if ((tasks.length < 3 || !profile().diagnosed) && !holdTest) tasks.push({ kind: 'test', title: nt.title, detail: nt.detail, minutes: nt.minutes, href: nt.href });
    return tasks.slice(0, 4);
  }

  /* The coach's plan, when Ace knows the student (portal handoff -> ace_auth
     cookie, HttpOnly, Path=/api/tutor, from the ai-tutor branch). The page can
     never read the cookie; it asks the tutor function, which reads Weekly Plans
     server-side. Resolves null whenever that is not available. */
  function portalHandoffSeen() {
    // Nothing to ask until a portal handoff has happened on this browser (the
    // readable ace_who cookie or the session record); otherwise every home load
    // would POST to an endpoint that is not there.
    try { if (/(?:^|;\s*)ace_who=/.test(document.cookie || '')) return true; } catch (e) {}
    return !!read('ace.v1.session', null);
  }
  function plan(timeoutMs) {
    if (!window.fetch || !portalHandoffSeen()) return Promise.resolve(null);
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

  /* =====================================================================
     v4: the plan behind Today (spec 1.7). Additive: today() above keeps its
     contract and its tests; todayPlan() builds on the same reads.
     ===================================================================== */

  /* ---------- settings: the first run's three questions, and Settings ----------
     acelabs.v1.settings = { minutes, shaky[], goingAgain, setAt }. The test date
     and shakiest sections are mirrored into aceLabs:onboarding (and the test
     date into acelabs_test_date) so every existing reader keeps working. */
  var SETTINGS_KEY = 'acelabs.v1.settings';
  function writeText(key, str) {
    mem[key] = str;
    try { if (str == null) window.localStorage.removeItem(key); else window.localStorage.setItem(key, str); } catch (e) { /* memory only */ }
  }
  function settings() {
    var s = read(SETTINGS_KEY, null), p = profile();
    if (!s || typeof s !== 'object') s = {};
    var mins = +s.minutes;
    return {
      minutes: mins > 0 ? mins : 60, minutesSet: mins > 0,
      testDate: p.testDate, shaky: (s.shaky && s.shaky.length ? s.shaky : p.weakAreas).map(sec).filter(Boolean),
      goingAgain: s.goingAgain || null, setAt: s.setAt || null
    };
  }
  function saveSettings(patch) {
    patch = patch || {};
    var s = read(SETTINGS_KEY, null);
    if (!s || typeof s !== 'object') s = {};
    if (patch.minutes != null) s.minutes = +patch.minutes > 0 ? +patch.minutes : null;
    if (patch.shaky) s.shaky = patch.shaky.map(sec).filter(Boolean);
    if (patch.goingAgain !== undefined) s.goingAgain = patch.goingAgain || null;
    s.setAt = Date.now();
    setRaw(SETTINGS_KEY, s);
    if (patch.testDate !== undefined || patch.shaky || patch.attempt || patch.goingAgain !== undefined) {
      var ob = read('aceLabs:onboarding', null);
      if (!ob || typeof ob !== 'object') ob = { weakAreas: [] };
      if (patch.testDate !== undefined) ob.testDate = patch.testDate || '';
      if (patch.shaky) ob.weakAreas = s.shaky.slice();
      if (patch.attempt) ob.attempt = patch.attempt;
      else if (patch.goingAgain !== undefined) ob.attempt = patch.goingAgain ? 'retake' : (ob.attempt || 'first');
      if (!ob.attempt) ob.attempt = 'first';
      ob.firstSetAt = ob.firstSetAt || ob.setAt || Date.now();   /* when the three questions were first answered */
      ob.setAt = Date.now();
      writeRaw('aceLabs:onboarding', ob);
      if (patch.testDate !== undefined) writeText('acelabs_test_date', patch.testDate || null);
    }
    return settings();
  }

  /* ---------- the live Call it first entries ----------
     The plan can only open what exists. Today: the 15 Bio entries
     (tools/bio/bio-stick-data.js; #stick-<id> opens one on its hub). Each
     section's first calls join as their batches ship (registerPlays here, or
     the list below in a B1.1 patch). say: how the coach line names it. */
  var DAT_ORDER = ['bio', 'gchem', 'ochem', 'pat', 'rc', 'qr'];
  var BIO_HUB = { cell: 'bio-cell', genetics: 'bio-genetics', physiology: 'bio-physiology', devo: 'bio-devo', evolution: 'bio-evolution', diversity: 'bio-diversity' };
  function bioPlay(id, hub, title, subtopic, say, words) {
    return { id: id, section: 'bio', title: title, subtopic: subtopic, say: say, href: '/tools/bio/' + BIO_HUB[hub] + '.html#stick-' + id, minutes: 2, words: words, deck: 'bio' };
  }
  var PLAYS = [
    bioPlay('tonicity', 'cell', 'Tonicity', 'Membrane transport', 'osmosis', 'osmosis tonicity hypotonic hypertonic isotonic membrane transport water solute lysis lyse crenate plasmolysis'),
    bioPlay('respiration', 'cell', 'Cellular respiration', 'ETC and oxidative phosphorylation', 'cellular respiration', 'respiration electron transport chain oxidative phosphorylation atp synthase gradient mitochondria krebs'),
    bioPlay('endocrine', 'physiology', 'Endocrine glands', 'Endocrine system and hormones', 'endocrine glands', 'endocrine hormone gland pituitary thyroid adrenal feedback axis'),
    bioPlay('nephron', 'physiology', 'Nephron', 'Excretory system and nephron', 'the nephron', 'nephron kidney excretory loop henle filtration reabsorption secretion adh aldosterone'),
    bioPlay('action-potential', 'physiology', 'Action potential', 'Nervous system and action potentials', 'the action potential', 'action potential neuron nervous sodium potassium depolarization repolarization gate'),
    bioPlay('cross-bridge', 'physiology', 'Cross-bridge cycle', 'Muscular system and sliding filament', 'the cross-bridge cycle', 'cross bridge myosin actin muscle contraction calcium troponin tropomyosin'),
    bioPlay('sarcomere', 'physiology', 'Sarcomere bands', 'Muscular system and sliding filament', 'sarcomere bands', 'sarcomere band zone muscle sliding filament contraction'),
    bioPlay('bohr', 'physiology', 'Hemoglobin curve', 'O2 and CO2 transport (Hb curve)', 'the hemoglobin curve', 'hemoglobin oxygen dissociation curve bohr shift co2 transport'),
    bioPlay('blood-types', 'physiology', 'ABO blood types', 'Blood components and types', 'ABO blood types', 'abo blood type antigen antibody transfusion donor recipient'),
    bioPlay('ovarian-cycle', 'physiology', 'Menstrual cycle', 'Menstrual cycle and ovulation (LH/FSH)', 'the menstrual cycle', 'menstrual ovarian cycle ovulation lh fsh estrogen progesterone'),
    bioPlay('bone-layers', 'physiology', 'Bone layers', 'Skeletal system and joints', 'bone layers', 'bone skeletal osteon compact spongy periosteum joint'),
    bioPlay('lac-operon', 'genetics', 'Lac operon', 'Gene regulation', 'the lac operon', 'lac operon gene regulation repressor lactose glucose expression'),
    bioPlay('hardy-weinberg', 'genetics', 'Hardy-Weinberg', 'Hardy-Weinberg and population genetics', 'Hardy-Weinberg', 'hardy weinberg population genetics allele frequency equilibrium'),
    bioPlay('embryo-stages', 'devo', 'Embryo stages', 'Embryonic stages', 'embryo stages', 'embryo embryonic development cleavage morula blastula gastrula germ layer'),
    bioPlay('homology', 'evolution', 'Homology', 'Evidence of evolution', 'homology', 'homology homologous analogous vestigial evolution evidence')
  ];
  function plays() { return PLAYS.slice(); }
  function registerPlays(list) {
    (list || []).forEach(function (p) {
      if (!p || !p.id || !p.href || !sec(p.section)) return;
      var e = {}; Object.keys(p).forEach(function (k) { e[k] = p[k]; });
      e.section = sec(p.section); e.minutes = e.minutes || 2; e.words = e.words || ''; e.subtopic = e.subtopic || e.title;
      for (var i = 0; i < PLAYS.length; i++) if (PLAYS[i].id === e.id) { PLAYS[i] = e; return; }
      PLAYS.push(e);
    });
    return PLAYS.length;
  }
  function playById(id) { for (var i = 0; i < PLAYS.length; i++) if (PLAYS[i].id === id) return PLAYS[i]; return null; }
  function playByTitle(title, s) {
    var t = String(title || '').toLowerCase();
    for (var i = 0; i < PLAYS.length; i++) if ((!s || PLAYS[i].section === s) && PLAYS[i].title.toLowerCase() === t) return PLAYS[i];
    return null;
  }
  var STOPW = {};
  'the a an and or of to in on at for with by is are it its from your you what how one two three then that this as into vs versus their them be not no all every'.split(' ').forEach(function (w) { STOPW[w] = 1; });
  function wordsOf(s) {
    if (R.words) return R.words(s);
    return String(s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(function (w) { return w.length > 2 && !STOPW[w]; })
      .map(function (w) { return w.replace(/(ies)$/, 'y').replace(/(es|s)$/, ''); });
  }
  function overlapOf(a, b) {
    var set = {}, n = 0;
    wordsOf(b).forEach(function (w) { set[w] = 1; });
    wordsOf(a).forEach(function (w) { if (set[w]) { n++; set[w] = 0; } });
    return n;
  }
  /* the Call it first entry for a miss: its own entry, else the best word match in its section */
  function playFor(m) {
    if (!m) return null;
    if (m.entryId && playById(m.entryId)) return playById(m.entryId);
    var text = [m.concept, m.topic, m.skill].filter(Boolean).join(' '), best = null, score = 0;
    PLAYS.forEach(function (p) {
      if (m.section && p.section !== m.section) return;
      var s = overlapOf(text, p.title + ' ' + p.subtopic + ' ' + p.words);
      if (s > score) { score = s; best = p; }
    });
    return score > 0 ? best : null;
  }
  /* every call played, from the play-cards store and the Bio engine's stick records */
  function playsSeen() {
    var out = {}, s = playStore();
    Object.keys(s.seen).forEach(function (id) { out[id] = s.seen[id]; });
    var bio = read('acethedat_bio_engine_v1', null), st = bio && bio.stick;
    if (st && typeof st === 'object') {
      Object.keys(st).forEach(function (id) {
        var r = st[id];
        if (!r || !r.done) return;
        var h = r.history && r.history.length ? r.history[r.history.length - 1] : null;
        var at = (h && ts(h.at)) || localMidnight(r.done), day = String(r.done);
        if (out[id] && (out[id].at || 0) >= at) return;
        out[id] = { at: at, day: day, section: 'bio', subtopic: (playById(id) || {}).subtopic || '',
          predict: r.pOk === false ? 'needs-review' : (r.pOk ? 'confirmed' : null),
          check: r.cOk === false ? 'needs-review' : (r.cOk ? 'confirmed' : null), missWhy: '', bio: true };
      });
    }
    return out;
  }

  /* ---------- small date words (the device date; never a countdown) ---------- */
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function isoToDate(iso) { var t = localMidnight(iso); return t ? new Date(t) : null; }
  function dayPlus(n) { var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d; }
  function monthDay(d) { return MONTHS[d.getMonth()] + ' ' + d.getDate(); }
  function shortDay(d) { return DAYS[d.getDay()].slice(0, 3) + ', ' + monthDay(d); }
  var NUM = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  function cardsWord(n) { return n === 1 ? 'your card' : 'your ' + (NUM[n] || n) + ' cards'; }

  /* ---------- the plan ---------- */
  var REVIEW_CAP = { normal: 10, 'test-week': 6, taper: 5 };
  /* Test week: one timed section a day, rotating from the weakest section. Only
     sections with a section-length timed form today (GChem has none of its own). */
  var TIMED = [
    { section: 'bio', title: 'Bio check: Full (40)', href: '/tools/bio/bio-mock.html', minutes: 40 },
    { section: 'pat', title: 'PAT test', href: '/tools/pat/test.html', minutes: 60 },
    { section: 'rc', title: 'Reading section', href: '/tools/rc/', minutes: 60 },
    { section: 'ochem', title: 'The Summit', href: '/tools/ochem/summit/', minutes: 45 },
    { section: 'qr', title: 'QR Test-Day Simulation', href: '/tools/qr/', minutes: 45 }
  ];
  var FULL = ['FULL_1', 'FULL_2', 'FULL_3', 'FULL_4'];
  /* Phases from the test date (decisions doc): Build, Blend, Test (the last 3
     weeks), Taper (the last 3 days). Defaults Thomas can move. */
  function phaseOf(days) {
    if (days == null || days < 0) return 'build';
    if (days <= 3) return 'taper';
    if (days <= 21) return 'test';
    if (days <= 49) return 'blend';
    return 'build';
  }
  function courseName(s) { return (R.COURSE_NAMES && R.COURSE_NAMES[s]) || ((R.SECTION_SHORT && R.SECTION_SHORT[s]) || s) + ', Retold'; }
  function nightHref(s, n) {
    if (R.learnUrl) return R.learnUrl(s, n);
    var c = window.AceIndex && window.AceIndex.courses && window.AceIndex.courses[s];
    return c ? c.url + '?night=' + n : '/learn/';
  }
  function nightTitleOf(s, n) { return R.nightTitle ? R.nightTitle(s, n) : ''; }
  function nightFor(s, text) { return R.nightFor ? R.nightFor(s, text) : null; }
  function nextNight(s, ms) {
    var top = ms.filter(function (m) { return m.section === s; })[0];
    var l = top && R.links ? R.links(top) : null, lp = learnProgress(s, 20);
    return (l && l.night) || (lp && lp.next) || 1;
  }
  /* the next test card on Today (a suggested date, never a countdown) */
  function nextTestPlan(p, diagToday, onboardedToday) {
    if (!p.diagnosed) {
      var later = !p.onboarded || onboardedToday;
      return { kind: 'test', door: 'tests', title: 'The diagnostic', detail: 'About 45 minutes, untimed. A map of where to start, not a score.', href: '/diagnostic.html', minutes: 45,
        suggested: dayKey(dayPlus(later ? 1 : 0)), suggestedLabel: later ? 'tomorrow, ' + DAYS[dayPlus(1).getDay()] : 'today' };
    }
    var taken = {};
    fullLengthRecords().forEach(function (r) { taken[r.testId] = 1; });
    var i = 0;
    while (i < FULL.length && taken[FULL[i]]) i++;
    if (i >= FULL.length) return null;
    var test = isoToDate(p.testDate), when = null;
    if (test && p.daysToTest > 0) {
      if (i === 0) when = null;
      else if (i === 1) when = new Date((Date.now() + test.getTime()) / 2);
      else when = new Date(test.getTime() - (i === 2 ? 14 : 7) * DAY);
    }
    var floor = dayPlus(diagToday ? 1 : 0);
    if (!when || when < floor) {   /* the next Saturday on or after the floor */
      when = new Date(floor);
      while (when.getDay() !== 6) when.setDate(when.getDate() + 1);
    }
    when.setHours(0, 0, 0, 0);
    return { kind: 'test', door: 'tests', title: 'Full-length DAT ' + (i + 1), detail: 'All four sections in test-day order, timed like test day.',
      href: '/tools/mock/full.html', minutes: 255, suggested: dayKey(when), suggestedLabel: DAYS[when.getDay()] + ', ' + monthDay(when) };
  }

  /* opts.coach: what AceProgress.plan() resolved (the portal's weekly plan) or null.
     Returns { say, sayHtml, line, source, note, said, steps, tomorrow, mode, phase,
     test, testDay, minutes, budget, replanned }. */
  function todayPlan(opts) {
    opts = opts || {};
    var p = profile(), st = settings(), ms = misses(), res = results(), seen = playsSeen(), now = Date.now(), today = dayKey(now);
    var ob = read('aceLabs:onboarding', null);
    var days = p.daysToTest, phase = phaseOf(days);
    var mode = days != null && days >= 0 && days <= 14 ? 'test-week' : 'normal';
    var budget = phase === 'taper' ? Math.min(st.minutes, 30) : st.minutes;
    var dg = read('acelabs_diagnostic_v1', null), diagToday = false;
    try { diagToday = !!(dg && dg.ts && dayKey(ts(dg.ts)) === today); } catch (e) { /* no date */ }
    var onboardedToday = !!(ob && (ob.firstSetAt || ob.setAt) && dayKey(ts(ob.firstSetAt || ob.setAt)) === today && !p.diagnosed);
    var playMiss = function (m) { return m.source === 'play' || (m.source === 'bio-engine' && m.entryId); };
    var retold = DAT_ORDER.some(function (s) { var lp = learnProgress(s, 20); return lp && lp.started; });
    var history = res.length > 0 || ms.some(function (m) { return !playMiss(m); }) || retold || p.diagnosed;
    var firstRun = !p.onboarded && !history;
    var coach = opts.coach && opts.coach.tasks && opts.coach.tasks.length ? opts.coach : null;

    /* ---------- step 1: always a call, playable in under 3 minutes ---------- */
    var todays = Object.keys(seen).filter(function (id) { return seen[id].day === today && playById(id); })
      .sort(function (a, b) { return (seen[b].at || 0) - (seen[a].at || 0); });
    var pick = null;
    if (todays.length) pick = { play: playById(todays[0]), done: true, why: 'today', rec: seen[todays[0]] };
    else if (firstRun) pick = { play: playById('tonicity') || PLAYS[0], why: 'first' };
    if (!pick) {
      for (var i = 0; i < ms.length && !pick; i++) {
        if (!ms[i].isDue) continue;
        var pf = playFor(ms[i]);
        if (pf) pick = { play: pf, why: 'due', miss: ms[i] };
      }
    }
    var ws = weakestSection(ms.filter(function (m) { return !playMiss(m); })) || st.shaky[0] || null;
    if (!pick) {
      var order = [ws].concat(st.shaky, DAT_ORDER).filter(Boolean);
      for (var j = 0; j < order.length && !pick; j++) {
        for (var k = 0; k < PLAYS.length; k++) if (PLAYS[k].section === order[j] && !seen[PLAYS[k].id]) { pick = { play: PLAYS[k], why: order[j] === ws ? 'weakest' : 'next' }; break; }
      }
    }
    if (!pick) {
      var oldest = PLAYS.slice().sort(function (a, b) { return ((seen[a.id] || {}).at || 0) - ((seen[b.id] || {}).at || 0); })[0];
      pick = { play: oldest, why: 'again' };
    }
    var play = pick.play;
    var step1 = { key: 'play', kind: 'play', door: 'practice', section: play.section, title: 'Call it first: ' + play.title,
      detail: pick.done ? 'Played today.' : play.subtopic + '. Call it, watch it, drive it.', minutes: play.minutes || 2, href: withStudent(play.href),
      makesCard: true, entryId: play.id, done: !!pick.done, essential: true };

    /* ---------- the rest, in priority order ---------- */
    var cands = [];
    var dueN = ms.filter(function (m) { return m.isDue; }).length;
    if (!p.onboarded) cands.push({ key: 'setup', kind: 'setup', door: 'today', section: null, title: 'Three questions', detail: 'Your test date, shakiest sections, minutes on a normal day.', minutes: 1, href: withStudent('/?first=1'), essential: true });
    if (p.onboarded && !p.diagnosed && !onboardedToday) cands.push({ key: 'diagnostic', kind: 'test', door: 'tests', section: null, title: 'The diagnostic', detail: 'About 45 minutes, untimed. A map of where to start, not a score.', minutes: 45, href: withStudent('/diagnostic.html'), essential: true });
    var cap = REVIEW_CAP[phase === 'taper' ? 'taper' : mode];
    var tomorrow = [];
    if (dueN && !coach) {
      var shown = Math.min(dueN, cap);
      cands.push({ key: 'cards', kind: 'review', door: 'review', section: null, title: shown === 1 ? '1 Ace Card back today' : shown + ' Ace Cards back today',
        detail: 'One at a time, each on its own idea.', minutes: Math.max(4, 2 * shown), href: withStudent('/review/?due=1'), count: shown, essential: mode !== 'normal' });
      if (dueN > cap) tomorrow.push({ key: 'cards-more', title: (dueN - cap) + ' more Ace Card' + (dueN - cap === 1 ? '' : 's'), why: 'Reviews are capped at ' + cap + ' a day.' });
    }
    if (mode === 'normal' && !coach) {
      if (onboardedToday) {
        var sk = st.shaky.length ? st.shaky : ['bio'];
        cands.push({ key: 'learn', kind: 'learn', door: 'learn', section: sk[0], title: courseName(sk[0]) + ': night 1', detail: nightTitleOf(sk[0], 1), minutes: 30, href: withStudent(nightHref(sk[0], 1)) });
        /* a taste of another shaky section's first call, where one is live */
        var taste = null;
        sk.forEach(function (s) { if (!taste && s !== play.section) PLAYS.forEach(function (q) { if (!taste && q.section === s && !seen[q.id]) taste = q; }); });
        if (taste) cands.push({ key: 'play-2', kind: 'play', door: 'practice', section: taste.section, title: 'Call it first: ' + taste.title, detail: taste.subtopic + '. Call it, watch it, drive it.', minutes: taste.minutes || 3, href: withStudent(taste.href), makesCard: true, entryId: taste.id });
        if (sk[1]) cands.push({ key: 'learn-2', kind: 'learn', door: 'learn', section: sk[1], title: courseName(sk[1]) + ': night 1', detail: nightTitleOf(sk[1], 1), minutes: 30, href: withStudent(nightHref(sk[1], 1)) });
      } else if (ws && window.AceIndex && window.AceIndex.courses && window.AceIndex.courses[ws]) {
        var n = nextNight(ws, ms);
        cands.push({ key: 'learn', kind: 'learn', door: 'learn', section: ws, title: courseName(ws) + ': night ' + n, detail: nightTitleOf(ws, n), minutes: 30, href: withStudent(nightHref(ws, n)) });
      }
      var cq = climbQueue();
      if (cq.started) cands.push(cq.due
        ? { key: 'climb', kind: 'climb', door: 'tests', section: null, title: 'The Climb: today\'s queue', detail: cq.due + (cq.due === 1 ? ' idea' : ' ideas') + ' due, each as a fresh question.', minutes: 15, href: withStudent('/tools/minitests/') }
        : { key: 'climb', kind: 'climb', door: 'tests', section: null, title: 'The Climb: Rung ' + cq.nextRung, detail: 'Forty questions. The misses come back on schedule.', minutes: 50, href: withStudent('/tools/minitests/') });
    }
    if (mode === 'test-week' && phase !== 'taper' && !coach) {
      /* the weakest section first (14 days out), then one a day around the rest */
      var rot = TIMED.slice().sort(function (a, b) { return (a.section === ws ? -1 : 0) - (b.section === ws ? -1 : 0); });
      var t = rot[Math.max(0, 14 - days) % rot.length];
      cands.push({ key: 'timed', kind: 'test', door: 'tests', section: t.section, title: 'One timed section: ' + t.title, detail: 'Timed like test day. The explainers open after.', minutes: t.minutes, href: withStudent(t.href), essential: true });
    }
    if (coach) {
      coach.tasks.forEach(function (tk, x) {
        cands.push({ key: 'coach-' + x, kind: tk.kind || 'set', door: tk.door || (tk.href ? (window.AceShell && window.AceShell.doorFor ? window.AceShell.doorFor(String(tk.href).split(/[?#]/)[0]) : null) : null) || 'practice',
          section: sec(tk.section) || null, title: tk.title || tk.label || 'From your coach', detail: tk.detail || tk.note || '', minutes: +tk.minutes || null,
          href: withStudent(tk.href || '/'), coach: true, essential: true });
      });
    }

    var steps = [step1], total = step1.done ? 0 : step1.minutes, more = [];
    cands.forEach(function (c) {
      if (steps.length >= 4) {
        if (c.coach) more.push(c); else tomorrow.push({ key: c.key, title: c.title, why: 'Today already has four steps.' });
        return;
      }
      if (c.essential || total + (c.minutes || 0) <= budget + 5) { steps.push(c); total += c.minutes || 0; }
      else tomorrow.push({ key: c.key, title: c.title, why: 'Moved so today stays near ' + budget + ' minutes.' });
    });
    if (!p.diagnosed && (!p.onboarded || onboardedToday)) tomorrow.push({ key: 'diagnostic', title: 'The diagnostic', why: 'About 45 minutes, untimed. It waits a day, so today stays light.' });

    /* ---------- re-plan on a play miss (rule 3) ---------- */
    var replanned = false, said = '', moved = null, missRec = !firstRun && pick.done && pick.rec && (pick.rec.predict === 'needs-review' || pick.rec.check === 'needs-review') ? pick.rec : null;
    var sceneNight = null;
    if (missRec) {
      sceneNight = nightFor(play.section, play.subtopic + ' ' + play.title + ' ' + play.words) || 1;
      var scene = { key: 'scene', kind: 'learn', door: 'learn', section: play.section, title: courseName(play.section) + ': night ' + sceneNight + ', one scene',
        detail: nightTitleOf(play.section, sceneNight), minutes: 6, href: withStudent(nightHref(play.section, sceneNight)), added: true, essential: true, why: missRec.missWhy || '' };
      steps.splice(1, 0, scene);
      total += scene.minutes;
      while (steps.length > 4 || (total > budget + 5 && steps.length > 2)) {
        var drop = -1;
        for (var d = steps.length - 1; d > 1; d--) if (!steps[d].essential) { drop = d; break; }
        if (drop < 0) break;
        var out = steps.splice(drop, 1)[0];
        total -= out.minutes || 0;
        moved = moved || out;
        tomorrow.unshift({ key: out.key, title: out.title, why: 'Moved to make room for one scene from night ' + sceneNight + '.' });
      }
      tomorrow.push({ key: 'card', title: play.say ? play.say.charAt(0).toUpperCase() + play.say.slice(1) : play.title, why: 'Back as a fresh question.' });
      replanned = true;
      said = 'Added one scene from night ' + sceneNight + (missRec.missWhy ? ': ' + missRec.missWhy : '') + '.' + (moved ? ' ' + moved.title + ' moves to tomorrow.' : '');
    }
    var nowSet = false;
    steps.forEach(function (s) { s.now = !s.done && !nowSet; if (s.now) nowSet = true; delete s.essential; });

    /* ---------- the coach line (from the library) and an honest source line ---------- */
    var topic = play.say || play.title.toLowerCase();
    var nxt = steps.filter(function (s) { return !s.done; })[0];
    var slot, vars = { topic: topic };
    var lastAt = 0;
    ms.forEach(function (m) { lastAt = Math.max(lastAt, m.when || 0); });
    res.forEach(function (r) { lastAt = Math.max(lastAt, r.when || 0); });
    Object.keys(seen).forEach(function (id) { lastAt = Math.max(lastAt, seen[id].at || 0); });
    var away = !pick.done && lastAt > 0 && now - lastAt >= 4 * DAY;
    if (coach) slot = 'coach-plan';
    else if (firstRun) slot = pick.done ? 'first-after-loop' : 'first-visit';
    else if (onboardedToday) { slot = 'first-plan'; vars.day = DAYS[dayPlus(1).getDay()]; }
    else if (replanned) { slot = moved ? 'replan' : 'replan-stay'; vars.night = 'night ' + sceneNight; vars.why = missRec.missWhy || ''; vars.moved = moved ? moved.title : ''; }
    else if (phase === 'taper') slot = 'taper';
    else if (mode === 'test-week') { slot = 'test-week'; var tw = steps.filter(function (s) { return s.key === 'timed'; })[0]; vars.section = tw ? tw.title.replace(/^One timed section: /, '') : ''; }
    else if (pick.done) { slot = 'after-call'; vars.next = nxt ? nxt.title : 'your cards'; }
    else if (steps.some(function (s) { return s.key === 'diagnostic'; })) slot = 'diagnostic-today';
    else if (away) slot = 'welcome-back';
    else if (steps.some(function (s) { return s.key === 'cards'; })) { slot = dueN > cap ? 'cards-heavy' : 'play-then-cards'; vars.cards = cardsWord(Math.min(dueN, cap)); }
    else if (steps.some(function (s) { return s.kind === 'learn'; })) {
      slot = 'play-then-learn';
      var ls = steps.filter(function (s) { return s.kind === 'learn'; })[0];
      vars.lesson = ls.title;
    }
    else slot = 'play-only';
    var CL = window.AceCoachLines, line = CL && typeof CL.pick === 'function' ? CL.pick(slot, vars, { seed: today }) : null;
    var say = line ? line.text : 'Here is today.', sayHtml = line ? line.html : 'Here is today.';

    var facts = [], srcText;
    if (replanned) srcText = (now - (missRec.at || now) <= 30 * 60000 ? 'Changed <b>just now</b>' : 'Changed <b>today</b>') + ', from <b>your call</b>.';
    else if (firstRun && !pick.done) srcText = 'Your first visit. Nothing to set up yet.';
    else if (firstRun) srcText = 'Nothing is scored here. You can change any answer later in Settings.';
    else if (onboardedToday) srcText = 'Built from <b>your three answers</b>. It changes as you work.';
    else if (coach) srcText = 'From <b>your coach\'s weekly plan</b>' + (dueN ? ' and <b>your cards due today</b>' : '') + '.';
    else {
      if (pick.why === 'due' || dueN) facts.push('your cards due today');
      if (p.diagnosed) facts.push('your diagnostic');
      else if (ms.some(function (m) { return m.source === 'practice-test' || m.source === 'full-length'; })) facts.push('your practice tests');
      var td = isoToDate(p.testDate);
      if (td && days != null && days >= 0) facts.push('your ' + monthDay(td) + ' test date');
      if (!facts.length) facts.push('what you have done here so far');
      facts = facts.slice(-2);
      srcText = 'From <b>' + facts.join('</b> and <b>') + '</b>.';
    }
    var source = { kind: 'auto', html: srcText, text: srcText.replace(/<[^>]+>/g, '') };
    var note = coach && (coach.note || coach.coachNote) ? { kind: 'coach', text: String(coach.note || coach.coachNote), sign: coach.sign || ((coach.coach || 'Your coach') + ', this week\'s plan') } : null;
    var td2 = isoToDate(p.testDate);

    return {
      say: say, sayHtml: sayHtml, line: line ? { id: line.id, slot: slot, approved: !!line.approved, draft: !!line.draft, fallback: !!line.fallback } : { id: null, slot: slot, approved: false, draft: false, fallback: true },
      source: source, note: note, said: said, replanned: replanned,
      steps: steps, tomorrow: tomorrow, more: more, mode: mode, phase: phase,
      test: nextTestPlan(p, diagToday, onboardedToday), testDay: td2 && days != null && days >= 0 ? { iso: p.testDate, label: shortDay(td2) } : null,
      minutes: total, budget: budget, play: { id: play.id, section: play.section, why: pick.why, done: !!pick.done }
    };
  }

  window.AceProgress = {
    version: 1, read: read, get: get, set: set, flush: flush, pull: pull, setSyncAdapter: setSyncAdapter, onChange: onChange,
    withStudent: withStudent, profile: profile, learnProgress: learnProgress,
    misses: misses, mark: mark, unmark: unmark, results: results, today: today, nextTest: nextTest, plan: plan, hasActivity: hasActivity,
    registerMissAdapter: registerMissAdapter, registerResultAdapter: registerResultAdapter, LEITNER_DAYS: LEITNER.slice(),
    /* v4, additive */
    api: 4, addPlayCard: addPlayCard, notePlay: notePlay, playCards: function () { var s = playStore(); return Object.keys(s.cards).map(function (k) { return s.cards[k]; }); },
    plays: plays, registerPlays: registerPlays, playFor: playFor, playsSeen: playsSeen,
    settings: settings, saveSettings: saveSettings, todayPlan: todayPlan, phaseOf: phaseOf,
    dueToday: function () { return read(DUE_KEY, null); }, PLAY_KEY: PLAY_KEY, DUE_KEY: DUE_KEY, SETTINGS_KEY: SETTINGS_KEY
  };
})();
