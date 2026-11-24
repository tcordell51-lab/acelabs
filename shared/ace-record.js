/* ace-record.js : the one progress record. Every tool writes here.

   Key family: "ace.v1." (the same family shared/ace-progress.js already owns),
   so there is no new family. This module owns four keys:

     ace.v1.record    { schema: 1, updated,
                        items: { [itemId]: { section, topic, seen, right,
                                             last, lastOk, box, due } },
                        days:  { "YYYY-MM-DD": { seen, right } },
                        imported: { [missId]: { section, concept, status, due, source } } }
     ace.v1.attempts  the last 2,000 answers, newest last:
                        { id, section, topic, picked, answer, ok, ms, at, src, set,
                          first, changes, change, conf }
                        first: the first letter picked; changes: how many times the pick
                        moved; change: 'none' | 'w2r' | 'r2w' | 'w2w'; conf: 'sure' |
                        'unsure' | 'guess' | null (all added 2026-11-16)
     ace.v1.events    the last 1,000 tool events (lab steps, figure reveals): { name, at, ...data }
     ace.v1.outbox    answers not yet accepted by the sync adapter
     ace.v1.migrated  { at, families: { name: keyCount }, keys: [{ k, bytes }] }

   Repair (2026-11-16): every miss also opens a repair entry in the same record
   (record.repair). One scheduler, simple interval logic in localStorage for now
   (Ace Engine's FSRS is not wired into the browser yet):
     - the miss comes back on a 1, 3, 7 day schedule (RETURN_DAYS, 2026-11-24): the next day,
       then 3 days after that win, then 7 days after that win;
     - "Didn't know it" puts a short lesson before the first return;
     - "Ran short on time" makes the first return untimed;
     - it returns as a new version (a twin: same section and skill, other stem);
     - it clears when the 7-day return is answered right: 3 wins on different calendar days,
       answered unassisted (nothing opened before answering); a wrong answer at any step
       sends it back to the start, due the next day;
     - records written under the older rule (back after 1 or 2 days, cleared on 2 wins) are
       moved over once by migrateRepair(): cleared entries stay cleared, an entry with one win
       keeps the win and comes back 3 days after it, an entry with no win keeps its date.

   2026-11-16 rework:
     - every attempt row and item carries skill (shared/ace-skills.js) and assisted (true when
       a lesson or picture was opened BEFORE answering). Assisted answers never move Progress,
       the learner model or a repair win. Opening See it AFTER answering is free.
     - repair twins: same skill first, then same topic, then the missed question itself
       (sameItem, marked "same question" on screen). A test miss keeps its own text on the
       entry so it can always come back.
     - PAT and Reading misses repair by skill (mode 'skill', one entry per subtest or question
       type): any unassisted practice answer of that skill on a day it is due counts.
     - learner model (record.model): an Elo rating per section and per topic, and a difficulty per
       item, updated on every unassisted answer from every section and test. P(right) =
       0.2 + 0.8 / (1 + e^-(rating - difficulty)) (five choices, so a 20% floor). Item difficulty
       is seeded from the bank's difficulty or tier and moves with answers. No score prediction
       is made from it; Progress shows bands with answer counts.
     - runs (ace.v1.runs): the last test runs, question by question, for /review/?run=<id>.

   Spaced repeat: a right answer moves an item up one box and schedules it
   LADDER[box] days out (1, 3, 7, 14, 30). A wrong answer sends it back to box 0,
   due the next day. An item that reaches the top box counts as held.

   localStorage is a cache, never the record of truth. When the portal sync
   exists, attach it once and nothing else changes:

     AceRecord.setSync({ push: function (batch) { return fetch(...); } });   // returns a Promise

   Old progress is never deleted. migrate() lists every key from the twelve
   older key families, imports the misses that shared/ace-progress.js can
   already read, and legacyExport() hands back the raw values for upload. */
(function () {
  'use strict';
  if (window.AceRecord) return;
  var NS = 'ace.v1.';
  var DAY = 864e5;
  var LADDER = [1, 3, 7, 14, 30];
  var MAX_ATTEMPTS = 2000;
  var FAMILIES = [
    ['acelabs', /^acelabs[._:\-]/], ['aceLabs', /^aceLabs[._:\-]/], ['acethedat', /^acethedat[._:\-]/],
    ['atDAT', /^atDAT[._:\-]/], ['al', /^al[:._\-]/], ['tt', /^tt[._:\-]/], ['ochem', /^ochem[._:\-]/],
    ['gc', /^gc[._:\-]/], ['qr', /^qr[._:\-]/], ['bio', /^bio[._:\-]/], ['vo', /^vo[._:\-]/], ['tdr', /^tdr[._:\-]/]
  ];

  var mem = {};
  function ls() { try { return window.localStorage; } catch (e) { return null; } }
  function read(k, def) {
    var s = ls(), v = null;
    try { v = s ? s.getItem(NS + k) : null; } catch (e) { v = null; }
    if (v == null) v = Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null;
    if (v == null) return def;
    try { var p = JSON.parse(v); return p == null ? def : p; } catch (e) { return def; }
  }
  function write(k, value) {
    var str = JSON.stringify(value); mem[k] = str;
    try { var s = ls(); if (s) s.setItem(NS + k, str); } catch (e) { /* storage full or blocked: memory only */ }
  }
  function dayKey(t) { var d = new Date(t); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function blank() { return { schema: 1, updated: 0, items: {}, days: {}, imported: {}, repair: {}, model: null, repairSched: 137 }; }
  function load() { var r = read('record', null); if (!r || r.schema !== 1) r = blank(); r.items = r.items || {}; r.days = r.days || {}; r.imported = r.imported || {}; r.repair = r.repair || {}; r.model = r.model || { sec: {}, top: {}, ib: {} }; if (r.repairSched !== 137) { migrateRepair(r); write('record', r); } return r; }

  /* ---- learner model: Elo per section and per topic, difficulty per item ---- */
  var GUESS = 0.2, TARGET = 0.75;
  function sig(x) { return 1 / (1 + Math.exp(-x)); }
  function pRight(theta, b) { return GUESS + (1 - GUESS) * sig(theta - b); }
  /* Seed difficulty from the bank: banks use 1 to 4 (easy to hard); Climb rungs above 4 run to 10. */
  function seedB(d) { d = Number(d); if (!isFinite(d) || d <= 0) return 0; return d <= 4 ? (d - 2.5) * 0.8 : (d - 5.5) * 0.3; }
  function topKey(section, topic) { return section + '|' + topic; }
  function skillOf(item) {
    if (item.skill) return { skill: item.skill, skillName: item.skillName || item.skill };
    try { if (window.AceSkills) return window.AceSkills.tag(item); } catch (e) { /* untagged */ }
    return { skill: item.topic || '', skillName: item.topicName || item.topic || '' };
  }
  function thetaOf(m, section, topic) {
    var t = m.top[topKey(section, topic)]; if (t) return t.t;
    var s = m.sec[section]; return s ? s.t : 0;
  }
  function bOf(m, item) { var x = m.ib[String(item.id)]; return x ? x.b : seedB(item.difficulty); }
  function modelUpdate(r, item, ok, now) {
    var m = r.model, sec = item.section || '', top = item.topic || '';
    var th = thetaOf(m, sec, top), b = bOf(m, item), err = (ok ? 1 : 0) - pRight(th, b);
    var t = m.top[topKey(sec, top)] || { t: th, n: 0 }, s = m.sec[sec] || { t: 0, n: 0 }, ib = m.ib[String(item.id)] || { b: b, n: 0 };
    t.t += (0.8 / (1 + 0.08 * t.n)) * err; t.n += 1; t.last = now;
    s.t += (0.4 / (1 + 0.03 * s.n)) * err; s.n += 1; s.last = now;
    ib.b -= (0.3 / (1 + 0.05 * ib.n)) * err; ib.n += 1;
    m.top[topKey(sec, top)] = t; m.sec[sec] = s; m.ib[String(item.id)] = ib;
  }
  /* Expected chance of a right answer on this item for this student, from the model. */
  function expect(item) { var m = load().model; return pRight(thetaOf(m, item.section, item.topic), bOf(m, item)); }
  /* Ratings for a section (or all): [{ section, topic, rating, n, p }] where p is the expected
     chance on an average item (difficulty 0). */
  function ratings(section) {
    var m = load().model, out = [];
    Object.keys(m.top).forEach(function (k) { var i = k.indexOf('|'), sec = k.slice(0, i), top = k.slice(i + 1); if (section && sec !== section) return; var t = m.top[k]; out.push({ section: sec, topic: top, rating: t.t, n: t.n, last: t.last || 0, p: pRight(t.t, 0) }); });
    return out;
  }
  function sectionRating(section) { var s = load().model.sec[section]; return s ? { rating: s.t, n: s.n, p: pRight(s.t, 0) } : { rating: 0, n: 0, p: null }; }
  /* Order a pool so the first items sit nearest the target chance (about 75% right): the set
     steps harder after wins and easier after misses because the rating moves. Unseen first. */
  function pickNear(pool, o) {
    o = o || {}; var target = o.target || TARGET, r = load(), m = r.model, rnd = o.random || Math.random;
    return pool.map(function (it) {
      var seen = r.items[String(it.id)], p = pRight(thetaOf(m, it.section, it.topic), bOf(m, it));
      return { it: it, p: p, score: Math.abs(p - target) + (seen ? 0.5 : 0) + rnd() * 0.04 };
    }).sort(function (a, b) { return a.score - b.score; }).map(function (x) { x.it._p = x.p; return x.it; });
  }

  var listeners = [], sync = null, flushing = false;
  function emit(what) { listeners.forEach(function (fn) { try { fn(what); } catch (e) { /* a listener must not break a save */ } }); }

  /* Save one answer. a = { item: { id, section, topic }, picked, answer, ok, ms, src, set } */
  function record(a) {
    if (!a || !a.item || !a.item.id) throw new Error('AceRecord.record needs item.id');
    var now = a.at || Date.now(), r = load(), id = String(a.item.id), sk = skillOf(a.item);
    var it = r.items[id] || { section: a.item.section || '', topic: a.item.topic || '', seen: 0, right: 0, last: 0, lastOk: false, box: 0, due: 0 };
    it.section = a.item.section || it.section; it.topic = a.item.topic || it.topic; it.skill = sk.skill;
    it.seen += 1; if (a.ok) it.right += 1;
    it.last = now; it.lastOk = !!a.ok;
    it.box = a.ok ? Math.min(it.box + 1, LADDER.length) : 0;
    it.due = now + (a.ok ? LADDER[Math.min(it.box, LADDER.length) - 1] : 1) * DAY;
    r.items[id] = it;
    if (!a.assisted) modelUpdate(r, a.item, a.ok, now);
    var skillMode = it.section === 'pat' || it.section === 'rc';
    if (!a.ok && a.repair !== false) repairOpen(r, a, now, skillMode ? sk : null);
    else if (skillMode && a.repair !== false && !a.assisted && a.kind !== 'test') repairSkillAnswer(r, it.section, sk.skill, !!a.ok, now);
    var d = dayKey(now), day = r.days[d] || { seen: 0, right: 0 };
    day.seen += 1; if (a.ok) day.right += 1; r.days[d] = day;
    r.updated = now; write('record', r);
    var row = { id: id, section: it.section, topic: it.topic, skill: sk.skill, picked: a.picked, answer: a.answer, ok: !!a.ok, ms: a.ms || 0, at: now, src: a.src || '', set: a.set || '', assisted: !!a.assisted, kind: a.kind || 'practice' };
    if (a.first != null) row.first = a.first;
    if (a.changes != null) row.changes = a.changes;
    row.change = a.change || (a.first != null && a.first !== a.picked ? (a.first === a.answer ? 'r2w' : (a.ok ? 'w2r' : 'w2w')) : 'none');
    if (a.conf) row.conf = a.conf;
    var log = read('attempts', []); log.push(row); if (log.length > MAX_ATTEMPTS) log = log.slice(log.length - MAX_ATTEMPTS); write('attempts', log);
    var out = read('outbox', []); out.push(row); write('outbox', out);
    emit({ type: 'record', attempt: row, item: it });
    flush();
    return it;
  }

  /* ---- repair: one queue for every miss ---- */
  var REASONS = { know: "Didn't know it", trap: 'Fell for a trap', misread: 'Misread it', time: 'Ran short on time', changed: 'Changed my answer' };
  function startOfDay(t) { var d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function daysOut(now, n) { return startOfDay(now) + n * DAY + 3600e3; }   // 1 am on day +n, so "due today" means any time today
  /* The return schedule: a miss comes back 1 day out, then 3 days after that win, then 7 days
     after that win. A right answer on the 7-day return clears it. */
  var RETURN_DAYS = [1, 3, 7];
  /* One unassisted right answer on a return. Same-day wins count once. */
  function repairWin(e, now) {
    var today = startOfDay(now);
    if (!e.wins.some(function (w) { return startOfDay(w) === today; })) e.wins.push(now);
    if (e.wins.length >= RETURN_DAYS.length) e.cleared = now;
    else e.due = daysOut(now, RETURN_DAYS[e.wins.length]);
  }
  function repairMiss(e, now) { e.wins = []; e.resets = (e.resets || 0) + 1; e.due = daysOut(now, RETURN_DAYS[0]); e.lastMiss = now; }
  /* Older records (a miss back after 1 or 2 days, cleared on 2 wins) move to the 1, 3, 7 day
     schedule once. Nothing is deleted and nothing cleared is reopened. */
  function migrateRepair(r) {
    var all = r.repair || {};
    Object.keys(all).forEach(function (k) {
      var e = all[k]; if (!e || typeof e !== 'object') { delete all[k]; return; }
      if (!Array.isArray(e.wins)) e.wins = [];
      e.wins = e.wins.filter(function (w) { return typeof w === 'number' && isFinite(w); }).sort(function (a, b) { return a - b; });
      if (e.cleared) return;
      if (e.wins.length >= RETURN_DAYS.length) e.wins = e.wins.slice(-(RETURN_DAYS.length - 1));
      if (e.wins.length) e.due = daysOut(e.wins[e.wins.length - 1], RETURN_DAYS[e.wins.length]);
      else if (!(typeof e.due === 'number' && isFinite(e.due))) e.due = daysOut(e.lastMiss || e.missedAt || Date.now(), RETURN_DAYS[0]);
    });
    r.repairSched = 137;
    return r;
  }
  function repairOpen(r, a, now, skillMode) {
    r.repair = r.repair || {};
    var sk = skillOf(a.item);
    var id = skillMode ? a.item.section + ':' + sk.skill : String(a.item.id), e = r.repair[id];
    if (!e || e.cleared) {
      e = r.repair[id] = { id: id, section: a.item.section || '', topic: a.item.topic || '', topicName: a.item.topicName || a.item.topic || '',
        skill: sk.skill, skillName: sk.skillName, mode: skillMode ? 'skill' : 'item', tool: a.tool || '',
        trap: a.item.trapTag || sk.skillName || a.item.topicName || a.item.topic || '', src: a.src || '', missedAt: now, reason: null, wins: [],
        due: daysOut(now, RETURN_DAYS[0]), resets: 0, cleared: 0, served: [], lessonFirst: false, untimedFirst: false };
      if (!skillMode && a.item.stem && a.item.choices && a.item.choices.length) e.itemData = { id: String(a.item.id), section: a.item.section, topic: a.item.topic, topicName: a.item.topicName, skill: sk.skill, skillName: sk.skillName, difficulty: a.item.difficulty, stem: a.item.stem, choices: a.item.choices, answer: a.item.answer, why: a.item.why || '' };
    } else {   // missed again while open: reset
      repairMiss(e, now);
    }
    return e;
  }
  /* PAT and Reading: a practice answer of the same skill on a day the entry is due. */
  function repairSkillAnswer(r, section, skill, ok, now) {
    var e = r.repair[section + ':' + skill]; if (!e || e.cleared || e.due > startOfDay(now) + DAY) return null;
    if (!ok) { repairMiss(e, now); return e; }
    repairWin(e, now);
    return e;
  }
  /* Tag why a miss happened. The first return is the next day for every reason; the reason
     decides what comes with it (a lesson first, or an untimed first return). */
  function repairReason(id, reason, now) {
    now = now || Date.now();
    if (!REASONS[reason]) throw new Error('unknown reason ' + reason);
    var r = load(); r.repair = r.repair || {}; var e = r.repair[String(id)]; if (!e) return null;
    e.reason = reason;
    e.lessonFirst = reason === 'know'; e.untimedFirst = reason === 'time';
    if (!e.wins || !e.wins.length) e.due = daysOut(e.lastMiss || e.missedAt || now, RETURN_DAYS[0]);
    r.updated = now; write('record', r); emit({ type: 'repair', entry: e });
    return e;
  }
  /* Answer a repair return. o = { servedId, ok, assisted, at } */
  function repairAnswer(id, o) {
    o = o || {}; var now = o.at || Date.now();
    var r = load(); r.repair = r.repair || {}; var e = r.repair[String(id)]; if (!e || e.cleared) return e || null;
    if (o.servedId) { e.served = (e.served || []).concat(String(o.servedId)).slice(-12); }
    if (!o.ok) { repairMiss(e, now); e.lessonFirst = false; }
    else if (o.assisted) { e.due = daysOut(now, 1); }
    else { repairWin(e, now); e.untimedFirst = false; e.lessonFirst = false; }
    r.updated = now; write('record', r); emit({ type: 'repair', entry: e });
    return e;
  }
  function repairList(q) {
    q = q || {}; var now = q.now || Date.now(), end = startOfDay(now) + DAY, r = load(), all = r.repair || {};
    var open = [], due = [], cleared = [], weekStart = startOfDay(now) - ((new Date(now).getDay() + 6) % 7) * DAY;
    Object.keys(all).forEach(function (k) {
      var e = all[k]; if (q.section && e.section !== q.section) return;
      if (e.cleared) { if (e.cleared >= weekStart) cleared.push(e); return; }
      open.push(e); if (e.due < end) due.push(e);
    });
    due.sort(function (a, b) { return a.due - b.due; });
    return { open: open, due: due, clearedThisWeek: cleared, weekStart: weekStart };
  }
  function repairLesson(id, now) { var r = load(); var e = (r.repair || {})[String(id)]; if (!e) return null; e.lessonAt = now || Date.now(); write('record', r); return e; }
  function repairEntry(id) { var r = load(); return (r.repair || {})[String(id)] || null; }
  /* The next version to serve: same section and skill, not the missed stem, not served lately.
     Falls back to the missed item itself only when the bank has no twin (flagged sameItem). */
  function repairVersion(e, bank) {
    var served = {}; (e.served || []).forEach(function (x) { served[x] = 1; });
    var mine = (bank || []).filter(function (it) { return it.section === e.section && String(it.id) !== e.id; });
    var skill = e.skill || (e.itemData && e.itemData.skill) || '';
    function choose(pool, match) {
      if (!pool.length) return null;
      var fresh = pool.filter(function (it) { return !served[String(it.id)]; });
      var near = pickNear(fresh.length ? fresh : pool);   // nearest the student's level for that topic
      return { item: near[0], sameItem: false, match: match };
    }
    var bySkill = skill ? mine.filter(function (it) { return it.skill === skill; }) : [];
    var hit = choose(bySkill, 'skill') || choose(mine.filter(function (it) { return it.topic === e.topic; }), 'topic');
    if (hit) return hit;
    var self = (bank || []).filter(function (it) { return String(it.id) === e.id; })[0] || e.itemData || null;
    return { item: self, sameItem: true, match: 'same' };
  }

  /* ---- test runs, question by question (Review reads them) ---- */
  function saveRun(run) {
    var runs = read('runs', []); runs = runs.filter(function (x) { return x.id !== run.id; }); runs.push(run);
    if (runs.length > 8) runs = runs.slice(runs.length - 8);
    write('runs', runs); emit({ type: 'run', run: run }); return run;
  }
  function runs() { return read('runs', []); }
  function run(id) { return runs().filter(function (x) { return x.id === id; })[0] || null; }
  /* The one miss count every page shows: open = in Repair, due = back today. */
  function missCounts(now) { var L = repairList({ now: now }), by = {}; L.open.forEach(function (e) { by[e.section] = (by[e.section] || 0) + 1; }); return { open: L.open.length, due: L.due.length, cleared: L.clearedThisWeek.length, bySection: by }; }

  function item(id) { return load().items[String(id)] || null; }
  function matches(it, q) { return (!q.section || it.section === q.section) && (!q.topic || it.topic === q.topic); }
  /* Ids that are due for a spaced repeat, oldest first. q = { section, topic, now } */
  function due(q) {
    q = q || {}; var now = q.now || Date.now(), r = load(), out = [];
    Object.keys(r.items).forEach(function (id) { var it = r.items[id]; if (matches(it, q) && it.due && it.due <= now && it.box < LADDER.length) out.push({ id: id, due: it.due, lastOk: it.lastOk }); });
    out.sort(function (a, b) { return a.due - b.due; });
    return out.map(function (x) { return x.id; });
  }
  /* Ids whose most recent answer was wrong. */
  function missed(q) {
    q = q || {}; var r = load();
    return Object.keys(r.items).filter(function (id) { var it = r.items[id]; return matches(it, q) && it.seen > 0 && !it.lastOk; }).sort(function (a, b) { return r.items[b].last - r.items[a].last; });
  }
  /* Raw counts only: no estimated score, no percentile. */
  function stats(q) {
    q = q || {}; var now = q.now || Date.now(), r = load(), s = { items: 0, answers: 0, right: 0, due: 0, missed: 0, held: 0, last: 0 };
    Object.keys(r.items).forEach(function (id) {
      var it = r.items[id]; if (!matches(it, q)) return;
      s.items += 1; s.answers += it.seen; s.right += it.right; if (it.last > s.last) s.last = it.last;
      if (!it.lastOk) s.missed += 1;
      if (it.box >= LADDER.length) s.held += 1; else if (it.due && it.due <= now) s.due += 1;
    });
    return s;
  }
  function topics(section) {
    var r = load(), out = {};
    Object.keys(r.items).forEach(function (id) { var it = r.items[id]; if (section && it.section !== section) return; var t = out[it.topic] || (out[it.topic] = { items: 0, answers: 0, right: 0, missed: 0 }); t.items += 1; t.answers += it.seen; t.right += it.right; if (!it.lastOk) t.missed += 1; });
    return out;
  }
  /* Answer changes, the student's own counts only (learning phase design, section 5). Never a
     comparison with other students and never a blanket rule; below 20 changes the sample is
     called too small. q = { section, src } */
  function changeStats(q) {
    q = q || {}; var out = { answers: 0, changed: 0, w2r: 0, r2w: 0, w2w: 0, net: 0, enough: false, bySure: { sure: [0, 0], unsure: [0, 0], guess: [0, 0] } };
    attempts().forEach(function (a) {
      if (q.section && a.section !== q.section) return; if (q.src && a.src !== q.src) return;
      out.answers += 1;
      if (a.change && a.change !== 'none') { out.changed += 1; out[a.change] = (out[a.change] || 0) + 1; }
      if (a.conf && out.bySure[a.conf]) { out.bySure[a.conf][0] += 1; if (a.ok) out.bySure[a.conf][1] += 1; }
    });
    out.net = out.w2r - out.r2w; out.enough = out.changed >= 20;
    return out;
  }
  /* A light event log for tools that are not questions (a lab step, a figure reveal). */
  function event(name, data) {
    var row = { name: String(name || ''), at: Date.now() };
    if (data && typeof data === 'object') Object.keys(data).forEach(function (k) { if (k !== 'name' && k !== 'at') row[k] = data[k]; });
    var log = read('events', []); log.push(row); if (log.length > 1000) log = log.slice(log.length - 1000); write('events', log);
    emit({ type: 'event', event: row });
    return row;
  }
  function events() { return read('events', []); }
  function today(now) { var r = load(); return r.days[dayKey(now || Date.now())] || { seen: 0, right: 0 }; }
  function attempts() { return read('attempts', []); }

  /* ---- sync: an outbox that survives reloads ---- */
  function setSync(adapter) { sync = adapter || null; return flush(); }
  function flush() {
    if (!sync || flushing) return Promise.resolve(false);
    var batch = read('outbox', []); if (!batch.length) return Promise.resolve(true);
    flushing = true;
    return Promise.resolve().then(function () { return sync.push(batch.slice()); }).then(function () {
      var left = read('outbox', []).slice(batch.length); write('outbox', left); flushing = false; emit({ type: 'synced', count: batch.length }); return true;
    }, function () { flushing = false; return false; });
  }
  function pending() { return read('outbox', []).length; }

  /* ---- older key families: list, import, export. Nothing is deleted. ---- */
  function legacyKeys() {
    var s = ls(), out = []; if (!s) return out;
    try { for (var i = 0; i < s.length; i++) { var k = s.key(i); if (!k || k.indexOf(NS) === 0) continue; for (var j = 0; j < FAMILIES.length; j++) if (FAMILIES[j][1].test(k)) { out.push({ k: k, family: FAMILIES[j][0], bytes: (s.getItem(k) || '').length }); break; } } } catch (e) { /* blocked */ }
    return out;
  }
  function legacyExport() { var s = ls(), out = {}; legacyKeys().forEach(function (x) { try { out[x.k] = s.getItem(x.k); } catch (e) { /* skip */ } }); return out; }
  function migrate(force) {
    var done = read('migrated', null);
    var keys = legacyKeys();
    if (done && !force && done.keys && done.keys.length === keys.length) return done;
    var fam = {}; keys.forEach(function (x) { fam[x.family] = (fam[x.family] || 0) + 1; });
    var r = load(), n = 0;
    // shared/ace-progress.js already normalizes misses from ten older tools; carry them in.
    if (window.AceProgress && typeof window.AceProgress.misses === 'function') {
      try { window.AceProgress.misses({ includeMastered: true }).forEach(function (m) { if (!m || !m.id || /^record:/.test(m.id)) return; r.imported[m.id] = { section: m.section || '', concept: m.concept || m.topic || '', status: m.status || 'learning', due: m.due || 0, source: m.source || '' }; n += 1; }); } catch (e) { /* an adapter failed: keep what we have */ }
    }
    write('record', r);
    var out = { at: Date.now(), families: fam, keys: keys.map(function (x) { return { k: x.k, bytes: x.bytes }; }), importedMisses: n };
    write('migrated', out); emit({ type: 'migrated', result: out });
    return out;
  }
  function exportAll() { return { schema: 1, exported: Date.now(), record: load(), attempts: attempts(), legacy: legacyExport() }; }

  window.AceRecord = {
    version: 4, LADDER: LADDER, RETURN_DAYS: RETURN_DAYS.slice(), migrateRepair: migrateRepair, TARGET: TARGET, pRight: pRight, seedB: seedB, expect: expect, ratings: ratings, sectionRating: sectionRating, pickNear: pickNear, skillOf: skillOf,
    saveRun: saveRun, runs: runs, run: run, missCounts: missCounts, FAMILIES: FAMILIES.map(function (f) { return f[0]; }),
    record: record, item: item, due: due, missed: missed, stats: stats, topics: topics, today: today, attempts: attempts,
    changeStats: changeStats, event: event, events: events,
    REASONS: REASONS, repairReason: repairReason, repairAnswer: repairAnswer, repairList: repairList, repairEntry: repairEntry, repairVersion: repairVersion, repairLesson: repairLesson,
    setSync: setSync, flush: flush, pending: pending, onChange: function (fn) { listeners.push(fn); },
    migrate: migrate, legacyKeys: legacyKeys, legacyExport: legacyExport, exportAll: exportAll,
    imported: function () { return load().imported; }
  };

  // XP, the daily streak and the mastery rings (shared/ace-mastery.js) follow every saved answer,
  // so every page that keeps the record gets them without a tag of its own.
  if (window.AceMastery) { if (window.AceMastery.bind) window.AceMastery.bind(); }
  else if (typeof document !== 'undefined' && document.createElement && document.head && !document.querySelector('script[src*="/shared/ace-mastery.js"]')) {
    var am = document.createElement('script'); am.src = '/shared/ace-mastery.js?v=1'; am.async = true; document.head.appendChild(am);
  }

  // The existing Review and Performance pages read through AceProgress: show them this record too.
  if (window.AceProgress && typeof window.AceProgress.registerMissAdapter === 'function') {
    window.AceProgress.registerMissAdapter('record', function () {
      var r = load();
      return Object.keys(r.items).filter(function (id) { return !r.items[id].lastOk; }).map(function (id) {
        var it = r.items[id];
        return { id: 'record:' + id, section: it.section, concept: it.topic, topic: it.topic, source: 'record', sourceLabel: 'Practice sets', when: it.last, detail: '' };
      });
    });
  }
})();
