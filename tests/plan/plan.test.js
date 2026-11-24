// tests/plan/plan.test.js : the study plan generator (plan/plan-core.js).
// node --test tests/plan/*.test.js
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const P = require('../../plan/plan-core.js');

const ROOT = path.resolve(__dirname, '..', '..');
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'shared/ace-index.js'), 'utf8'), ctx);
const NIGHTS = ctx.window.AceIndex.nights;

const TODAY = '2026-11-24'; // a Tuesday
const BASE = {
  today: TODAY, days: [1, 2, 3, 4, 5, 6], hoursWeekday: 2, hoursWeekend: 5, attempt: 'first',
  confidence: { bio: 2, gchem: 3, ochem: 3, pat: 3, rc: 4, qr: 2 }, blackouts: ['2026-12-25'],
  hasDiagnostic: true, nights: NIGHTS
};
const plan = (o) => P.generate(Object.assign({}, BASE, o));
const studyDays = (p) => p.days.filter((d) => d.tasks.length && d.kind !== 'test');
const gapDays = (a, b) => P.diff(a, b);

// Addresses served by a redirect or rewrite in /_redirects count as real, the way gate-dead-links counts them.
const REDIRECTS = new Set(fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8').split('\n')
  .map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map((l) => l.split(/\s+/)[0].replace(/\/$/, '')));
function resolves(href) {
  const u = href.split('#')[0].split('?')[0];
  if (REDIRECTS.has(u.replace(/\/$/, ''))) return true;
  const p = path.join(ROOT, u);
  if (!fs.existsSync(p)) return false;
  return fs.statSync(p).isDirectory() ? fs.existsSync(path.join(p, 'index.html')) : true;
}
// Pages that only forward somewhere else are not a place to send a student.
const GONE = ['/calendar.html', '/for-retakers.html', '/onboarding.html', '/performance/', '/ace-labs.html', '/test-day-readiness.html', '/retold/'];

function checkCommon(p, input) {
  assert.equal(p.ok, true);
  assert.equal(p.days[0].date, input.today);
  assert.equal(p.days[p.days.length - 1].date, input.testDate);
  assert.equal(p.days[p.days.length - 1].kind, 'test');
  assert.equal(p.days[p.days.length - 2].kind, 'eve', 'the day before the test is a rest day');
  const budget = (d) => ((d.dow === 0 || d.dow === 6) ? input.hoursWeekend : input.hoursWeekday) * 60;
  for (const d of p.days) {
    if (d.kind === 'test') { assert.equal(d.tasks.length, 1); continue; }
    if (d.kind === 'off' || d.kind === 'blackout') { assert.equal(d.tasks.length, 0, d.date + ' has no work'); continue; }
    assert.ok(d.tasks.length >= 2 && d.tasks.length <= 4, d.date + ' has 2 to 4 tasks, got ' + d.tasks.length);
    if (d.kind !== 'full' && d.kind !== 'eve') assert.ok(d.minutes <= budget(d), d.date + ' fits its hours: ' + d.minutes + ' > ' + budget(d));
    for (const t of d.tasks) {
      assert.ok(t.href && t.href.startsWith('/'), 'root-relative link on ' + t.title);
      assert.ok(resolves(t.href), 'link resolves to a file: ' + t.href);
      assert.ok(!GONE.includes(t.href.split('#')[0].split('?')[0]), 'no task points at a forwarded page: ' + t.href);
      assert.ok(t.minutes >= 0 && t.minutes % 5 === 0, 'minutes in 5s: ' + t.title);
      assert.doesNotMatch(t.title + t.detail, /—/, 'no em dash in ' + t.title);
      assert.doesNotMatch(t.title + t.detail, /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u, 'no emoji');
    }
  }
  // blackouts never carry work
  for (const b of input.blackouts || []) { const d = p.days.find((x) => x.date === b); if (d) assert.equal(d.tasks.length, 0); }
  // full-lengths: never in the last 2 days before the test, each followed by a review day
  for (const f of p.fullLengths) {
    assert.ok(gapDays(f, input.testDate) >= 3, 'full-length ' + f + ' is at least 3 days out');
    const i = p.days.findIndex((d) => d.date === f);
    const next = p.days.slice(i + 1).find((d) => d.tasks.length);
    assert.equal(next.kind, 'review', 'review day after ' + f);
  }
  // phases run in order and cover every day
  const order = ['learn', 'drill', 'testing', 'final', 'eve', 'test'];
  let last = -1;
  for (const d of p.days) { const k = order.indexOf(d.phase); assert.ok(k >= last, 'phase order at ' + d.date); last = k; }
  assert.equal(p.phases.reduce((a, x) => a + x.days, 0), p.days.length);
}

test('two weeks: short runway, straight to timed work and full-lengths', () => {
  const input = Object.assign({}, BASE, { testDate: P.addDays(TODAY, 14) });
  const p = P.generate(input);
  checkCommon(p, input);
  assert.equal(p.runway, 'short');
  assert.match(p.notes[0], /short runway/);
  assert.ok(!p.days.some((d) => d.phase === 'learn'), 'no learn phase');
  assert.ok(p.fullLengths.length >= 1 && p.fullLengths.length <= 3, 'one to three full-lengths, got ' + p.fullLengths.length);
  for (let k = 1; k < p.fullLengths.length; k++) assert.ok(gapDays(p.fullLengths[k - 1], p.fullLengths[k]) >= 4);
  assert.ok(p.days.some((d) => d.tasks.some((t) => t.href === '/test-week.html')), 'hands off to Test-week mode');
  const tw = p.days.filter((d) => d.tasks.some((t) => t.href === '/test-week.html'));
  for (const d of tw) assert.ok(gapDays(d.date, input.testDate) <= 7, 'Test-week mode only inside the last 7 days: ' + d.date);
});

test('eight weeks: learn, drill, testing, final; full-lengths every 7 to 10 days', () => {
  const input = Object.assign({}, BASE, { testDate: P.addDays(TODAY, 56) });
  const p = P.generate(input);
  checkCommon(p, input);
  assert.equal(p.runway, 'standard');
  assert.deepEqual(p.phases.map((x) => x.id), ['learn', 'drill', 'testing', 'final', 'eve', 'test']);
  assert.ok(p.fullLengths.length >= 3 && p.fullLengths.length <= 6, 'got ' + p.fullLengths.length);
  for (let k = 1; k < p.fullLengths.length; k++) {
    const g = gapDays(p.fullLengths[k - 1], p.fullLengths[k]);
    assert.ok(g >= 5 && g <= 12, 'spacing ' + g);
  }
  // Retold nights carry the real titles and link to the right night
  const night = p.days.flatMap((d) => d.tasks).find((t) => t.kind === 'learn');
  assert.match(night.title, /Retold, night 1: /);
  assert.match(night.href, /\?night=1$/);
  // weakest sections get more time than equally sized strong ones
  assert.ok(p.sectionMinutes.qr > p.sectionMinutes.ochem, 'shaky QR over steady OChem');
  assert.ok(p.sectionMinutes.bio > p.sectionMinutes.gchem, 'shaky Bio over steady Gen Chem');
});

test('five months: long runway, lighter start, full-lengths only in the last eight weeks', () => {
  const input = Object.assign({}, BASE, { testDate: P.addDays(TODAY, 151) });
  const p = P.generate(input);
  checkCommon(p, input);
  assert.equal(p.runway, 'long');
  assert.match(p.notes[0], /four months/);
  assert.ok(p.fullLengths.length >= 5 && p.fullLengths.length <= 10);
  for (const f of p.fullLengths) assert.ok(gapDays(f, input.testDate) <= 56, f + ' within 8 weeks');
  for (let k = 1; k < p.fullLengths.length; k++) { const g = gapDays(p.fullLengths[k - 1], p.fullLengths[k]); assert.ok(g >= 5 && g <= 10, 'spacing ' + g); }
  const first = p.days.find((d) => d.kind === 'learn' && d.dow === 2);
  assert.ok(first.minutes < 120, 'early weekday runs lighter than the 2 hours given');
  // every Retold night of a shaky section fits in five months
  const bioNights = p.days.flatMap((d) => d.tasks).filter((t) => t.kind === 'learn' && t.section === 'bio').length;
  assert.equal(bioNights, NIGHTS.bio.length);
});

test('retake with weak PAT: PAT leads the time split and gets the 90-question PAT test', () => {
  const conf = { bio: 4, gchem: 4, ochem: 3, pat: 1, rc: 3, qr: 3 };
  const input = Object.assign({}, BASE, { testDate: P.addDays(TODAY, 49), attempt: 'retake', confidence: conf, hasDiagnostic: false });
  const p = P.generate(input);
  checkCommon(p, input);
  const first = P.generate(Object.assign({}, input, { attempt: 'first' }));
  assert.ok(p.share.pat > first.share.pat, 'a retake leans harder on the weak section');
  const top = Object.entries(p.sectionMinutes).sort((a, b) => b[1] - a[1])[0][0];
  assert.equal(top, 'pat');
  assert.ok(p.days.some((d) => d.tasks.some((t) => t.href === '/tools/pat/test.html')), 'PAT test scheduled');
  const day0 = p.days[0];
  assert.equal(day0.tasks[0].href, '/diagnostic.html', 'no diagnostic yet: start with it');
  // a retake spends a smaller share of the runway on learning than a first attempt
  const learnDays = (q) => q.days.filter((d) => d.phase === 'learn').length;
  assert.ok(learnDays(p) < learnDays(first));
});

test('time split follows the default study load when confidence is even, and caps at 40%', () => {
  const even = { bio: 3, gchem: 3, ochem: 3, pat: 3, rc: 3, qr: 3 };
  const w = P.weights(even, 'first');
  const B = P.BASE_MIN, total = Object.values(B).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(w.bio - B.bio / total) < 1e-9);
  assert.ok(Math.abs(w.pat - B.pat / total) < 1e-9);
  assert.ok(w.bio > w.rc, 'science carries more study time than Reading');
  const lop = P.weights({ bio: 5, gchem: 5, ochem: 5, pat: 1, rc: 5, qr: 5 }, 'retake');
  assert.ok(lop.pat <= 0.4 + 1e-9, 'no section above 40%');
  const sum = Object.values(lop).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9, 'shares still add to 1');
});

test('under a week: test-week note, no full-length, still a rest day before the test', () => {
  const input = Object.assign({}, BASE, { testDate: P.addDays(TODAY, 5) });
  const p = P.generate(input);
  checkCommon(p, input);
  assert.equal(p.runway, 'test-week');
  assert.equal(p.fullLengths.length, 0);
});

test('only weekends with short weekday hours still plans, and notes the light week', () => {
  const input = Object.assign({}, BASE, { testDate: P.addDays(TODAY, 42), days: [0, 6], hoursWeekend: 2.5 });
  const p = P.generate(input);
  checkCommon(p, input);
  assert.ok(p.notes.some((n) => /a week is light/.test(n)));
  assert.ok(p.days.filter((d) => d.dow >= 1 && d.dow <= 5 && d.tasks.length && d.kind !== 'eve' && d.kind !== 'test').length === 0);
});

test('deterministic, and validation errors are plain', () => {
  const a = plan({ testDate: P.addDays(TODAY, 30) }), b = plan({ testDate: P.addDays(TODAY, 30) });
  assert.deepEqual(a, b);
  assert.equal(plan({ testDate: P.addDays(TODAY, 30), days: [] }).ok, false);
  const past = plan({ testDate: P.addDays(TODAY, -3) });
  assert.equal(past.ok, false); assert.equal(past.state, 'past');
  assert.equal(plan({ testDate: 'not a date' }).ok, false);
  assert.equal(plan({ testDate: TODAY }).state, 'today');
});

test('.ics export: one all-day event per working day, folded lines, CRLF', () => {
  const p = plan({ testDate: P.addDays(TODAY, 21) });
  const ics = P.toICS(p, 'https://example.org');
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /END:VCALENDAR\r\n$/);
  const events = (ics.match(/BEGIN:VEVENT/g) || []).length;
  assert.equal(events, p.days.filter((d) => d.tasks.length).length);
  for (const line of ics.split('\r\n')) assert.ok(Buffer.byteLength(line, 'utf8') <= 75, 'line over 75 octets: ' + line);
  assert.match(ics, /DTSTART;VALUE=DATE:20261124/);
  assert.match(ics, /SUMMARY:DAT test day/);
  assert.ok(!/\n(?<!\r\n)/.test(ics.replace(/\r\n/g, '')), 'no bare LF');
});

/* ---------- v3: one system. The plan, the reports and Home agree. ---------- */
const all = (p) => p.days.flatMap((d) => d.tasks.map((t) => Object.assign({ date: d.date, phase: d.phase }, t)));

test('no practice set in a section before its first lesson, unless the student rated it solid', () => {
  for (const len of [28, 56, 100]) {
    const conf = { bio: 2, gchem: 3, ochem: 3, pat: 3, rc: 3, qr: 2 };
    const p = plan({ testDate: P.addDays(TODAY, len), confidence: conf, hasDiagnostic: false });
    const taught = {};
    for (const d of p.days) {
      if (d.phase !== 'learn') break;
      for (const t of d.tasks) {
        if (t.kind === 'learn' && t.section) taught[t.section] = true;
        if (t.kind === 'drill' && t.section) assert.ok(taught[t.section], len + ' days: ' + d.date + ' drills ' + t.section + ' before a lesson (' + t.title + ')');
      }
    }
    const day1 = p.days[0].tasks;
    assert.equal(day1[0].href, '/diagnostic.html');
    assert.ok(!day1.some((t) => t.kind === 'drill'), 'day 1 is the diagnostic and a first look, no cold practice set');
    assert.match(day1[0].detail, /PAT and Reading/, 'the diagnostic task says what it leaves out');
  }
});

test('the final two weeks rotate through all six sections', () => {
  for (const len of [21, 56, 151]) {
    const p = plan({ testDate: P.addDays(TODAY, len) });
    const last = all(p).filter((t) => gapDays(t.date, p.testDate) <= 14 && gapDays(t.date, p.testDate) >= 2 && t.section);
    for (const s of P.SECTIONS) assert.ok(last.some((t) => t.section === s), len + ' days: ' + s + ' appears in the final two weeks');
  }
});

test('full-length tasks open the numbered test, and never promise more than the open tests', () => {
  const p = plan({ testDate: P.addDays(TODAY, 151) });
  const fulls = p.days.filter((d) => d.kind === 'full');
  assert.equal(fulls.length, p.fullLengths.length);
  fulls.forEach((d, k) => {
    const t = d.tasks.find((x) => /^\/tools\/mock\/full\.html/.test(x.href));
    assert.equal(t.href, '/tools/mock/full.html?test=' + (k + 1));
    assert.equal(d.fullNo, k + 1);
    if (k + 1 > P.FULL_OPEN) assert.match(t.detail, /if it is open|retake/i, 'test ' + (k + 1) + ' is not promised');
  });
  assert.equal(p.fullOpen, P.FULL_OPEN);
});

test('plan links: counts go to Progress, cards to Repair, test-day copy names the ID rule', () => {
  const p = plan({ testDate: P.addDays(TODAY, 56) });
  const t = all(p);
  assert.ok(t.some((x) => x.href === '/progress/'));
  assert.ok(t.some((x) => x.href === '/repair/'));
  const day = p.days[p.days.length - 1].tasks[0];
  assert.match(day.title, /two forms of ID/);
  assert.match(day.detail, /government photo ID with your signature/);
  assert.match(day.detail, /Prometric confirmation/);
  assert.ok(p.nightsScheduled > 0 && p.nightsScheduled <= p.nightsTotal);
});

test('a report focus leads the next study days, and Home reads the same thing', () => {
  const report = { src: 'full', title: 'Full-length 2', date: TODAY, areas: [
    { section: 'gchem', label: 'Acids and bases', correct: 1, total: 6, learn: { href: '/tools/gchem/?night=9', label: 'Night 9' }, drill: { href: '/tools/gc/?from=report', label: 'Drill' } },
    { section: 'qr', label: 'Probability', correct: 0, total: 3, drill: { href: 'https://evil.example/x', label: 'x' } },
    { section: 'nope', label: 'Dropped', correct: 0, total: 1 } ] };
  const focus = P.focusFromReport(report, TODAY);
  assert.equal(focus.areas.length, 2, 'unknown sections are dropped');
  assert.equal(focus.areas[1].drill, null, 'an off-site link is never kept');
  assert.equal(P.focusFromReport(report, P.addDays(TODAY, P.FOCUS_DAYS + 1)), null, 'a report older than two weeks no longer steers');
  assert.equal(P.focusFromReport(null, TODAY), null);

  const input = Object.assign({}, BASE, { testDate: P.addDays(TODAY, 56), focus });
  const p = P.generate(input);
  checkCommon(p, input);
  assert.deepEqual(Object.assign({}, p.focus, { days: undefined }), Object.assign({}, focus, { days: undefined }));
  assert.equal(p.focus.days.length, 2);
  const focusDays = p.days.filter((d) => d.focus);
  assert.equal(focusDays.length, 2, 'one day per focus area');
  assert.equal(focusDays[0].date, TODAY, 'starting with the next study day');
  assert.match(focusDays[0].tasks[0].title, /^Focus: learn Acids and bases$/);
  assert.equal(focusDays[0].tasks[0].href, '/tools/gchem/?night=9');
  assert.match(focusDays[1].tasks[0].title, /^Focus: /);
  assert.match(focusDays[1].tasks[0].title, /Probability/);
  assert.deepEqual(P.generate(input), p, 'still deterministic');

  const v = P.todayView(p, TODAY, {}, {});
  assert.equal(v.focus.areas[0].label, 'Acids and bases');
  assert.equal(v.first.title, 'Focus: learn Acids and bases', 'Home starts on the report focus');
});

test('todayView: what Home shows for work days, off days, test day and a passed date', () => {
  const p = plan({ testDate: P.addDays(TODAY, 30), hasDiagnostic: false });
  let v = P.todayView(p, TODAY, {}, {});
  assert.equal(v.state, 'work'); assert.equal(v.left, 30);
  assert.equal(v.first.href, '/diagnostic.html');
  assert.equal(v.week.length, 7);
  assert.equal(v.week[0].dow, 1, 'the week strip starts on Monday');
  assert.equal(v.week.filter((w) => w.today).length, 1);
  assert.equal(v.week[0].inPlan, false, 'Monday was before the plan started');
  v = P.todayView(p, TODAY, {}, { diagnostic: true });
  assert.notEqual(v.first.href, '/diagnostic.html', 'a finished diagnostic counts as done without a tick');
  const done = {}; p.days[0].tasks.forEach((t) => { done[t.id] = 1; });
  v = P.todayView(p, TODAY, done, {});
  assert.equal(v.allDone, true); assert.equal(v.first, null);
  const sunday = p.days.find((d) => d.dow === 0);
  v = P.todayView(p, sunday.date, {}, {});
  assert.equal(v.state, 'off'); assert.ok(v.next && v.next.tasks.length);
  assert.ok(v.missed > 0, 'earlier unmarked days are counted');
  assert.equal(P.todayView(p, p.testDate, {}, {}).state, 'test');
  assert.equal(P.todayView(p, P.addDays(p.testDate, 1), {}, {}).state, 'past');
  assert.equal(P.todayView({ ok: false }, TODAY, {}, {}), null);
});

test('syncState: the diagnostic and the last report are folded into the saved plan once', () => {
  const state = { v: 1, input: { today: TODAY, testDate: P.addDays(TODAY, 40), days: [1, 2, 3, 4, 5], hoursWeekday: 2, hoursWeekend: 0, attempt: 'first', confidence: { bio: 3, gchem: 3, ochem: 3, pat: 4, rc: 5, qr: 3 }, blackouts: [] }, done: { x: 1 } };
  const diag = { ts: 1700000000000, perSection: { bio: { correct: 5, total: 15 }, gc: { correct: 13, total: 15 }, ochem: { correct: 9, total: 15 }, qr: { correct: 11, total: 15 } } };
  const report = { src: 'diagnostic', title: 'Diagnostic', date: TODAY, areas: [{ section: 'bio', label: 'Cell biology', correct: 1, total: 5 }] };
  const a = P.syncState(state, { today: TODAY, diagnostic: diag, report });
  assert.equal(a.changed, true);
  assert.deepEqual(a.state.input.confidence, { bio: 2, gchem: 5, ochem: 3, pat: 4, rc: 5, qr: 4 }, 'four sections from the diagnostic; PAT and Reading keep the student rating');
  assert.equal(a.state.input.hasDiagnostic, true);
  assert.equal(a.state.input.focus.areas[0].label, 'Cell biology');
  assert.deepEqual(a.state.done, { x: 1 }, 'marks are kept');
  assert.equal(state.input.focus, undefined, 'the input is not mutated');
  const b = P.syncState(a.state, { today: TODAY, diagnostic: diag, report });
  assert.equal(b.changed, false, 'a second pass changes nothing');
  // the student re-rates a section; the same diagnostic does not overwrite it again
  const edited = JSON.parse(JSON.stringify(a.state)); edited.input.confidence.bio = 4;
  assert.equal(P.syncState(edited, { today: TODAY, diagnostic: diag, report }).state.input.confidence.bio, 4);
  // a stale focus is dropped after two weeks
  const late = P.syncState(a.state, { today: P.addDays(TODAY, P.FOCUS_DAYS + 1), diagnostic: diag, report });
  assert.equal(late.changed, true); assert.equal(late.state.input.focus, undefined);
  assert.equal(P.syncState(null, {}).changed, false);
});
