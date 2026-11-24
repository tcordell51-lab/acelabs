/* ace-plan.js : what to do next, read from the one record (2026-11-16).

   Today, Progress, Labs and Repair all read these, so their numbers always agree:

     AcePlan.band(section)   { n, days, p, band, word, early }  band 0 none, 1 Building, 2 Close,
                             3 Test-ready. From the learner model's rating for the section (the
                             expected chance on an average item) plus answer counts: unassisted
                             answers only, "early read" under 100. No score prediction.
     AcePlan.weakest(k)      the k topics to work on next: lowest rating first, weighted by how
                             much of the DAT the section is, with open Repair entries counted in.
     AcePlan.plan()          { steps: [...], primary } the ordered plan for Today:
                             diagnostic (first visit) -> Repair due -> practice the weakest topic
                             -> See it for that topic. One primary button: the first step.
     AcePlan.practiceHref(section, topic)  the hub set for a topic (adaptive: items near the
                             student's level, about 75% expected right).
   Needs ace-record.js; ace-visuals.js is optional (the See it step). */
(function () {
  'use strict';
  if (window.AcePlan) return;
  var R = function () { return window.AceRecord; };
  var NAMES = { bio: 'Biology', gchem: 'Gen Chem', ochem: 'OChem', pat: 'PAT', rc: 'Reading', qr: 'QR' };
  var ORDER = ['bio', 'gchem', 'ochem', 'pat', 'rc', 'qr'];
  // Questions per section on the DAT (ADA candidate guide): the section's share of the test.
  var DAT_COUNT = { bio: 40, gchem: 30, ochem: 30, pat: 90, rc: 50, qr: 40 };
  var HUB = { gchem: '/gc/', bio: '/bio/', qr: '/qr/drill/', ochem: '/oc/' };
  var PAT_TRAINER = { keyholes: 'keyholes', tfe: 'tfe', angles: 'angles', holepunch: 'holepunch', cubes: 'cubes', patternfold: 'patternfold' };
  var WORD = ['Not started', 'Building', 'Close', 'Test-ready'];
  var DAY = 864e5;
  function dayKey(t) { var d = new Date(t); return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }

  function practiceHref(section, topic) {
    if (section === 'pat') return '/tools/pat/' + (PAT_TRAINER[topic] ? PAT_TRAINER[topic] + '.html' : '');
    if (section === 'rc') return '/tools/rc/';
    var hub = HUB[section] || '/gc/';
    return topic ? hub + '?topic=' + encodeURIComponent(topic) : hub + '?run=daily';
  }

  function band(section) {
    var rows = R().attempts().filter(function (a) { return a.section === section && !a.assisted; });
    var days = {}; rows.forEach(function (a) { days[dayKey(a.at)] = 1; });
    var nd = Object.keys(days).length, sr = R().sectionRating(section), p = sr.n ? sr.p : null;
    var b = !rows.length ? 0 : (p >= 0.85 && nd >= 5 && rows.length >= 100) ? 3 : (p >= 0.70 && nd >= 3) ? 2 : 1;
    return { n: rows.length, days: nd, p: p, band: b, word: WORD[b], early: rows.length < 100, weeks: rows.length ? Math.max(1, Math.ceil((rows[rows.length - 1].at - rows[0].at + 1) / (7 * DAY))) : 0 };
  }

  function weakest(k, o) {
    o = o || {}; var rec = R(), open = {}, names = {};
    rec.repairList().open.forEach(function (e) { var key = e.section + '|' + e.topic; open[key] = (open[key] || 0) + 1; names[key] = e.topicName; });
    rec.attempts().forEach(function (a) { var key = a.section + '|' + a.topic; if (!names[key]) names[key] = null; });
    var list = rec.ratings().filter(function (t) { return !o.section || t.section === o.section; }).map(function (t) {
      var key = t.section + '|' + t.topic, share = (DAT_COUNT[t.section] || 30) / 280;
      return { section: t.section, topic: t.topic, topicName: names[key] || t.topic.replace(/-/g, ' '), p: t.p, n: t.n, open: open[key] || 0,
        score: (1 - t.p) * (0.6 + share) + 0.04 * (open[key] || 0) };
    });
    // repair topics with no rating yet (a test miss in a section the model has not seen) still count
    Object.keys(open).forEach(function (key) {
      if (list.some(function (x) { return x.section + '|' + x.topic === key; })) return;
      var i = key.indexOf('|'); if (o.section && key.slice(0, i) !== o.section) return;
      list.push({ section: key.slice(0, i), topic: key.slice(i + 1), topicName: names[key], p: null, n: 0, open: open[key], score: 0.5 + 0.04 * open[key] });
    });
    list.sort(function (a, b) { return b.score - a.score; });
    return list.slice(0, k || 3);
  }

  function plan(now) {
    now = now || Date.now();
    var rec = R(), all = rec.attempts(), counts = rec.missCounts(now), steps = [];
    if (!all.length) {
      steps.push({ id: 'diagnostic', k: 'Start here', title: 'Take the diagnostic', line: '60 questions across Biology, Gen Chem, OChem and QR. It fills Repair, Progress and this plan.', href: '/diagnostic.html' });
    }
    if (counts.due) steps.push({ id: 'repair', k: 'Repair first', title: counts.due + (counts.due === 1 ? ' miss is back' : ' misses are back'), line: 'Each returns as a new version after 1, 3 and 7 days. Get the 7-day one right and it clears.', href: '/repair/' });
    var weak = weakest(3);
    var w = weak[0];
    if (w) {
      steps.push({ id: 'practice', section: w.section, topic: w.topic, k: 'Practice · ' + NAMES[w.section], title: cap(w.topicName), line: 'Your weakest topic right now' + (w.open ? ', with ' + w.open + ' open in Repair' : '') + '. Questions picked near your level, harder as you win.', href: practiceHref(w.section, w.topic) });
      var v = window.AceVisuals ? window.AceVisuals.match({ section: w.section, topic: w.topic, topicName: w.topicName }) : null;
      if (v) steps.push({ id: 'see', k: 'See it · ' + NAMES[w.section], title: v.label, line: 'The picture for ' + String(w.topicName).toLowerCase() + '. Predict first, then reveal.', href: v.url });
    } else if (all.length) {
      steps.push({ id: 'practice', section: 'gchem', topic: null, k: 'Practice · Gen Chem', title: 'Ten questions near your level', line: 'Every miss gets a one-tap reason and goes into Repair.', href: practiceHref('gchem') });
    }
    if (!counts.due && counts.open && all.length) steps.push({ id: 'waiting', k: 'Repair', title: counts.open + (counts.open === 1 ? ' miss is' : ' misses are') + ' waiting for another day', line: 'Nothing is due back today.', href: '/repair/', quiet: true });
    return { steps: steps, primary: steps[0] || null, weakest: weak, counts: counts };
  }
  function cap(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }

  window.AcePlan = { version: 1, band: band, weakest: weakest, plan: plan, practiceHref: practiceHref, NAMES: NAMES, ORDER: ORDER, WORD: WORD };
})();
