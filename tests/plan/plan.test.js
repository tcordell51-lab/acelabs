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

function resolves(href) {
  const u = href.split('#')[0].split('?')[0];
  const p = path.join(ROOT, u);
  if (!fs.existsSync(p)) return false;
  return fs.statSync(p).isDirectory() ? fs.existsSync(path.join(p, 'index.html')) : true;
}

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
  assert.ok(p.days.some((d) => d.tasks.some((t) => t.href === '/calendar.html')), 'links the last-7-days calendar');
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
  assert.ok(day0.tasks.some((t) => t.href === '/for-retakers.html'), 'retake reads Going again');
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
