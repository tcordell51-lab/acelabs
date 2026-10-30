/* The plan behind Today: AceProgress.todayPlan() and the v4 additions to
   shared/ace-progress.js (play cards, the dot cache, full-length results,
   settings). Plain node:test in a vm with a fake localStorage and a fixed clock
   (Friday, October 30, 2026, 10:00 on the device). */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '../..');
const DAY = 864e5;
const NOW = new Date(2026, 9, 30, 10, 0, 0).getTime();
const at = (days, h = 10) => new Date(2026, 9, 30 + days, h, 0, 0).getTime();
const iso = (days) => { const d = new Date(2026, 9, 30 + days); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

function load(seed, opts = {}) {
  let now = opts.now || NOW;
  class FakeDate extends Date {
    constructor(...a) { if (a.length) super(...a); else super(now); }
    static now() { return now; }
  }
  const store = new Map(Object.entries(seed || {}).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]));
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k), key: (i) => [...store.keys()][i], get length() { return store.size; },
  };
  const events = [];
  class CustomEvent { constructor(type, init) { this.type = type; this.detail = init && init.detail; } }
  const window = { localStorage, CustomEvent, dispatchEvent: (e) => { events.push(e); return true; }, location: { search: opts.search || '' } };
  const ctx = vm.createContext({ window, localStorage, location: window.location, URLSearchParams, Date: FakeDate, JSON, Math, Promise, setTimeout, clearTimeout });
  const files = ['shared/ace-index.js', 'shared/ace-route.js', 'shared/ace-progress.js'];
  if (opts.lines !== false) files.push('shared/ace-coach-lines.js');
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx);
  return { P: window.AceProgress, R: window.AceRoute, CL: window.AceCoachLines, store, events, window, tick: (ms) => { now += ms; } };
}
const json = (store, k) => JSON.parse(store.get(k));
/* values made inside the vm live in another realm: compare their plain JSON */
const eq = (a, b, m) => assert.deepEqual(JSON.parse(JSON.stringify(a)), b, m);

/* a student two weeks in: onboarded and diagnosed earlier, the Climb started,
   a practice test with an osmosis miss, a GChem engine miss, Retold walked */
function busy(extra = {}) {
  return Object.assign({
    'aceLabs:onboarding': { testDate: iso(60), attempt: 'first', weakAreas: ['gchem'], setAt: at(-12) },
    acelabs_diagnostic_v1: { ts: at(-11), perSection: { bio: { correct: 14, total: 20 } }, topWeakTopics: [{ section: 'gc', topic: 'Acid-base', label: 'Acid-base', correct: 2, total: 5 }] },
    'al:prometricHistory': [{ testId: 'MOCK_1', testName: 'Practice Test 1', ts: at(-3), subjects: { Biology: { correct: 30, total: 40 } }, byTopic: { Biology: { Osmosis: { c: 1, n: 3 } } } }],
    atDAT_minitest: { attempts: [{ mode: 'test', n: 1, correct: 30, total: 40, dateISO: new Date(at(-2)).toISOString() }],
      mistakes: { k1: { section: 'qr', topic: 'Percentages', q: { stem: 'x' }, box: 0, due: at(-1), resolved: false, ts: at(-2) } } },
    'gc-rem-v1:attempts': [{ probId: 'a', skill: 'titration', correct: false, t: at(-1) }],
    atDAT_gchem_n12: { s1: 1 },
    'acelabs.v1.settings': { minutes: 90 },
  }, extra);
}

test('first visit: step 1 is a call (Tonicity), then three questions; the diagnostic waits for tomorrow', () => {
  const { P } = load({});
  const plan = P.todayPlan();
  assert.ok(plan.steps.length >= 1 && plan.steps.length <= 4);
  const s1 = plan.steps[0];
  assert.equal(s1.kind, 'play');
  assert.equal(s1.entryId, 'tonicity');
  assert.ok(s1.minutes < 3, 'playable in under 3 minutes');
  assert.equal(s1.href, '/tools/bio/bio-cell.html#stick-tonicity');
  assert.equal(s1.now, true);
  assert.equal(plan.steps[1].key, 'setup');
  assert.ok(plan.tomorrow.some((t) => t.key === 'diagnostic'));
  eq([plan.source.kind, plan.source.text], ['auto', 'Your first visit. Nothing to set up yet.']);
  assert.equal(plan.line.slot, 'first-visit');
  assert.equal(plan.note, null);
  assert.equal(plan.test.title, 'The diagnostic');
  assert.equal(plan.test.suggestedLabel, 'tomorrow, Saturday');
  eq([plan.mode, plan.phase], ['normal', 'build']);
});

test('at most four steps, step 1 always playable; a card due today with a call leads', () => {
  const { P } = load(busy());
  const plan = P.todayPlan();
  assert.ok(plan.steps.length <= 4, 'at most 4 steps');
  assert.equal(plan.steps[0].kind, 'play');
  assert.ok(plan.steps[0].minutes < 3);
  assert.equal(plan.play.why, 'due', 'the practice-test osmosis miss has a Call it first entry');
  assert.equal(plan.steps[0].entryId, 'tonicity');
  for (const s of plan.steps) for (const k of ['key', 'kind', 'door', 'title', 'minutes', 'href']) assert.ok(s[k] != null && s[k] !== '', k + ' on ' + s.key);
  assert.equal(new Set(plan.steps.map((s) => s.key)).size, plan.steps.length);
  assert.ok(plan.steps.some((s) => s.kind === 'review'), 'cards due today');
  assert.equal(plan.steps.filter((s) => s.now).length, 1, 'one step is now');
  assert.match(plan.source.text, /^From your cards due today and your diagnostic\.|^From .*your Dec 29 test date\.$/);
  assert.equal(plan.source.kind, 'auto');
  for (const t of plan.tomorrow) assert.ok(t.title && t.why, 'everything moved says why');
});

test('re-plan on a play miss: one scene slides in as step 2, the lowest step moves to tomorrow, the band says why', () => {
  const { P, store } = load(busy());
  const before = P.todayPlan();
  const cardsBefore = before.steps.find((s) => s.key === 'cards').count;
  P.addPlayCard({ id: 'play:tonicity', entryId: 'tonicity', kind: 'play', section: 'bio', subtopic: 'Membrane transport', title: 'Tonicity', from: 'call', outcome: 'needs-review',
    idea: 'Animal cell in pure water: water rushes in, the cell swells and bursts.', hook: 'Water chases solute.', missWhy: 'you called the salty-water picture for pure water', made: iso(0), due: iso(1), madeAt: NOW - 60000 });
  const plan = P.todayPlan();
  assert.equal(plan.replanned, true);
  assert.equal(plan.steps[0].done, true, 'the call is done');
  assert.equal(plan.steps[1].key, 'scene');
  assert.equal(plan.steps[1].added, true);
  assert.equal(plan.steps[1].title, 'Bio, Retold: night 3, one scene');
  assert.equal(plan.steps[1].now, true);
  assert.ok(plan.steps.length <= 4);
  assert.match(plan.said, /^Added one scene from night 3: you called the salty-water picture for pure water\./);
  const moved = plan.tomorrow.filter((t) => /^Moved to make room for one scene from night 3\.$/.test(t.why));
  assert.equal(moved.length, 1, 'the lowest-priority step moved');
  assert.ok(plan.said.endsWith(moved[0].title + ' moves to tomorrow.'));
  assert.ok(plan.tomorrow.some((t) => t.title === 'Osmosis' && t.why === 'Back as a fresh question.'));
  assert.equal(plan.source.text, 'Changed just now, from your call.');
  assert.equal(plan.line.slot, 'replan');
  assert.equal(plan.steps.find((s) => s.key === 'cards').count, cardsBefore, 'the new card is due tomorrow, not today');
  assert.equal(json(store, 'acelabs.v1.playCards').cards['play:tonicity'].due, iso(1));
});

test('re-plan works from a Bio call too (the Bio engine keeps its own record)', () => {
  const { P } = load(busy({ acethedat_bio_engine_v1: { aceCards: [], stick: { tonicity: { done: iso(0), pOk: false, cOk: true, history: [{ at: NOW - 3 * 3600e3, pOk: false, cOk: true }] } } } }));
  const plan = P.todayPlan();
  assert.equal(plan.steps[0].entryId, 'tonicity');
  assert.equal(plan.steps[1].key, 'scene');
  assert.equal(plan.source.text, 'Changed today, from your call.', 'honest about when');
  assert.match(plan.said, /^Added one scene from night 3\./);
});

test('a clean call stays step 1, done; the plan moves on to the next step', () => {
  const { P } = load(busy());
  P.notePlay({ entryId: 'tonicity', section: 'bio', subtopic: 'Membrane transport', at: NOW - 60000, predict: { outcome: 'confirmed' }, check: { outcome: 'confirmed' }, kept: false });
  const plan = P.todayPlan();
  assert.equal(plan.steps[0].done, true);
  assert.equal(plan.replanned, false);
  assert.equal(plan.line.slot, 'after-call');
  assert.equal(plan.steps[1].now, true);
});

test('step 1 rotates to the next unseen call once a call is behind the student', () => {
  const { P } = load(busy({ 'al:prometricHistory': [] }));
  P.notePlay({ entryId: 'tonicity', section: 'bio', at: at(-1), predict: { outcome: 'confirmed' } });
  const plan = P.todayPlan();
  assert.notEqual(plan.steps[0].entryId, 'tonicity');
  assert.equal(plan.steps[0].done, false);
  assert.ok(P.playsSeen().tonicity);
});

test('test-week mode from 14 days out: one timed section a day, no new nights; taper in the last days', () => {
  const tw = (days, now) => load(busy({ 'aceLabs:onboarding': { testDate: iso(days), weakAreas: ['pat'], setAt: at(-40) }, 'al:prometricHistory': [], 'gc-rem-v1:attempts': [],
    acelabs_diagnostic_v1: { ts: at(-11), perSection: {}, topWeakTopics: [{ section: 'PAT', topic: 'Hole punching', correct: 1, total: 5 }] } }), now ? { now } : {});
  let r = tw(14);
  let plan = r.P.todayPlan();
  assert.equal(plan.mode, 'test-week');
  assert.equal(plan.phase, 'test');
  assert.ok(!plan.steps.some((s) => s.kind === 'learn'), 'no new nights');
  const timed = plan.steps.find((s) => s.key === 'timed');
  assert.ok(timed && timed.kind === 'test' && timed.door === 'tests');
  assert.equal(timed.title, 'One timed section: PAT test', 'the weakest section first');
  const next = tw(14, NOW + DAY).P.todayPlan().steps.find((s) => s.key === 'timed');
  assert.equal(next.title, 'One timed section: Bio check: Full (40)', 'then one a day around the rest');
  assert.equal(plan.line.slot, 'test-week');
  eq(plan.testDay, { iso: iso(14), label: 'Fri, Nov 13' });
  r = load(busy({ 'aceLabs:onboarding': { testDate: iso(15), weakAreas: ['pat'], setAt: at(-40) } }));
  assert.equal(r.P.todayPlan().mode, 'normal');
  r = load(busy({ 'aceLabs:onboarding': { testDate: iso(2), weakAreas: ['pat'], setAt: at(-40) } }));
  plan = r.P.todayPlan();
  eq([plan.mode, plan.phase], ['test-week', 'taper']);
  assert.ok(plan.budget <= 30);
  assert.ok(!plan.steps.some((s) => s.key === 'timed'), 'nothing timed in the taper');
  assert.equal(plan.line.slot, 'taper');
  eq([50, 49, 22, 21, 4, 3, 0, -1, null].map((d) => r.P.phaseOf(d)), ['build', 'blend', 'blend', 'test', 'test', 'taper', 'taper', 'build', 'build']);
});

test('source lines: auto for every built line; a portal note is quoted verbatim and signed', () => {
  const { P, CL } = load(busy());
  const auto = P.todayPlan();
  assert.equal(auto.source.kind, 'auto');
  eq(CL.checkSource(auto.source), []);
  assert.match(auto.source.html, /<b>/, 'the facts are bold');
  const note = 'This week is membranes and equilibrium. Two PAT sets before Friday, untimed.';
  const plan = P.todayPlan({ coach: { tasks: [{ title: 'PAT set: Hole punching', href: '/tools/pat/holepunch.html', minutes: 20 }, { title: 'GChem, Retold: night 12', href: '/tools/gchem/?night=12', minutes: 30 }], note, sign: 'Thomas, Sunday\'s weekly plan' } });
  eq(plan.note, { kind: 'coach', text: note, sign: 'Thomas, Sunday\'s weekly plan' });
  eq(CL.checkSource(plan.note), []);
  assert.equal(plan.source.kind, 'auto', 'the line is still built here, so it says so');
  assert.equal(plan.line.slot, 'coach-plan');
  assert.equal(plan.steps[0].kind, 'play', 'step 1 is still a call');
  eq(plan.steps.slice(1).map((s) => s.title), ['PAT set: Hole punching', 'GChem, Retold: night 12'], 'the coach plan wins');
  assert.ok(plan.steps.slice(1).every((s) => s.coach));
  assert.equal(P.todayPlan({ coach: { tasks: [{ title: 'x', href: '/' }] } }).note, null, 'no note, nothing quoted');
});

test('the coach line comes from the library: the plain fallback until Thomas approves, drafts for coaches', () => {
  let r = load({});
  let plan = r.P.todayPlan();
  assert.equal(plan.line.fallback, true);
  assert.equal(plan.say, r.CL.SLOTS['first-visit'].fallback);
  r = load({}, { search: '?coach=1' });
  plan = r.P.todayPlan();
  assert.equal(plan.line.draft, true);
  assert.match(plan.line.id, /^fv-\d$/);
  assert.match(plan.sayHtml, /<em>[^<]+<\/em>/, 'one gold phrase');
  assert.equal(r.P.todayPlan().line.id, plan.line.id, 'the same line all day');
  r = load({}, { lines: false });
  assert.equal(r.P.todayPlan().say, 'Here is today.', 'works without the library');
});

test('daily minutes size the plan', () => {
  const { P } = load(busy({ 'acelabs.v1.settings': { minutes: 30 } }));
  const plan = P.todayPlan();
  assert.equal(plan.budget, 30);
  assert.ok(plan.minutes <= 35, 'about 30 minutes: ' + plan.minutes);
  assert.ok(plan.tomorrow.some((t) => t.why === 'Moved so today stays near 30 minutes.'));
});

test('the first plan builds itself from the three answers; the diagnostic waits a day', () => {
  const { P, store } = load({});
  P.saveSettings({ testDate: '2026-12-12', shaky: ['PAT', 'GChem'], minutes: 60 });
  const plan = P.todayPlan();
  assert.equal(plan.line.slot, 'first-plan');
  assert.equal(plan.source.text, 'Built from your three answers. It changes as you work.');
  eq(plan.steps.filter((s) => s.kind === 'learn').map((s) => s.title), ['PAT, Retold: night 1', 'GChem, Retold: night 1']);
  assert.ok(plan.tomorrow.some((t) => t.key === 'diagnostic'));
  assert.ok(!plan.steps.some((s) => s.key === 'diagnostic'));
  assert.equal(plan.testDay.label, 'Sat, Dec 12');
  /* mirrored where every existing reader looks */
  eq(json(store, 'aceLabs:onboarding').weakAreas, ['pat', 'gchem']);
  assert.equal(json(store, 'aceLabs:onboarding').testDate, '2026-12-12');
  assert.equal(store.get('acelabs_test_date'), '2026-12-12', 'a plain string, as onboarding.html writes it');
  assert.equal(P.profile().testDate, '2026-12-12');
  assert.equal(P.settings().minutes, 60);
  /* the next day the diagnostic is on the plan */
  const next = load(Object.fromEntries(store), { now: NOW + DAY });
  const p2 = next.P.todayPlan();
  assert.ok(p2.steps.some((s) => s.key === 'diagnostic'));
  assert.equal(p2.line.slot, 'diagnostic-today');
  /* changing an answer later is not a first run again */
  next.P.saveSettings({ testDate: '2026-12-19' });
  assert.equal(next.P.todayPlan().line.slot, 'diagnostic-today');
  assert.equal(json(next.store, 'aceLabs:onboarding').firstSetAt, NOW);
});

test('no countdown, streak or score language; plain ASCII', () => {
  const plans = [load({}).P.todayPlan(), load(busy()).P.todayPlan(), load(busy({ 'aceLabs:onboarding': { testDate: iso(10), setAt: at(-40) } })).P.todayPlan()];
  const s = JSON.stringify(plans);
  assert.doesNotMatch(s, /\d+ days? (left|to go)|countdown|streak|points|\bXP\b|leaderboard|behind|overdue|wrong|incorrect|failed|percent/i);
  assert.doesNotMatch(s, /[^\x00-\x7e]/);
});

test('play cards: stored, listed as misses, due tomorrow, and the dot cache follows', () => {
  const { P, store, events } = load({});
  const c = P.addPlayCard({ id: 'play:titration', entryId: 'titration', section: 'GChem', subtopic: 'Titration', title: 'Titration curves', from: 'call', outcome: 'needs-review', idea: 'At half-equivalence pH = pKa.', made: iso(0), due: iso(1), madeAt: NOW, pic: '<svg/>' });
  assert.equal(c.section, 'gchem');
  assert.equal(c.dueAt, new Date(2026, 9, 31).getTime(), 'local midnight of the due day');
  const m = P.misses().find((x) => x.id === 'play:titration');
  assert.ok(m, 'listed by the play-cards adapter');
  eq([m.source, m.section, m.isDue, m.status, m.entryId], ['play', 'gchem', false, 'learning', 'titration']);
  let due = json(store, 'acelabs.v1.dueToday');
  assert.equal(due.n, 0);
  eq(due.later, [new Date(2026, 9, 31).getTime()]);
  assert.equal(due.day, '2026-10-30');
  assert.ok(events.some((e) => e.type === 'acelabs:due' && e.detail.n === 0));
  /* a card already due lights the dot */
  P.addPlayCard({ id: 'play:qk', entryId: 'qk', section: 'gchem', from: 'call', outcome: 'needs-review', idea: 'Q below K runs forward.', due: iso(-1), madeAt: at(-2) });
  due = json(store, 'acelabs.v1.dueToday');
  assert.equal(due.n, 1);
  /* a second miss on the same idea: one card, a lapse, back to the start of the ladder */
  P.mark('play:titration', true);
  P.addPlayCard({ id: 'play:titration', entryId: 'titration', section: 'gchem', from: 'recall', outcome: 'needs-review', idea: 'x', madeAt: NOW });
  const st = json(store, 'acelabs.v1.playCards');
  assert.equal(Object.keys(st.cards).length, 2);
  assert.equal(st.cards['play:titration'].lapses, 1);
  assert.equal(json(store, 'ace.v1.review')['play:titration'].box, 0);
  assert.equal(P.addPlayCard(null), null);
  assert.equal(P.playCards().length, 2);
});

test('play cards keep the store small: the newest cards keep their pictures', () => {
  const { P, store } = load({});
  const pic = '<svg>' + 'x'.repeat(60000) + '</svg>';
  for (let i = 0; i < 10; i++) P.addPlayCard({ id: 'play:e' + i, entryId: 'e' + i, section: 'qr', outcome: 'needs-review', from: 'call', idea: 'i', pic, madeAt: NOW - (10 - i) * 1000 });
  const cards = json(store, 'acelabs.v1.playCards').cards;
  const kept = Object.values(cards).filter((c) => c.pic).map((c) => c.id).sort();
  assert.ok(kept.length >= 5 && kept.length < 10);
  assert.ok(kept.includes('play:e9') && !kept.includes('play:e0'), 'newest first');
  assert.ok(store.get('acelabs.v1.playCards').length < 450000);
});

test('play cards sync like every other record (raw key in the queue)', async () => {
  const { P, store } = load({});
  const pushed = [];
  P.setSyncAdapter({ push: (c) => { pushed.push(c); return Promise.resolve(); } });
  P.addPlayCard({ id: 'play:a', entryId: 'a', section: 'rc', outcome: 'needs-review', from: 'call', idea: 'i', madeAt: NOW });
  await new Promise((r) => setTimeout(r, 10));
  const p = pushed.find((c) => c.key === 'acelabs.v1.playCards');
  assert.ok(p && p.value && p.value.cards['play:a'], 'the full record is pushed under its own key');
  assert.equal(JSON.parse(store.get('ace.v1.pending')).length, 0);
  assert.ok(!pushed.some((c) => c.key === 'acelabs.v1.dueToday'), 'the dot cache never syncs');
});

test('full-length results reach results() and misses(); the Prometric mirror is not counted twice', () => {
  const mirror = { testId: 'MOCK_1', testName: 'Practice Test 1', ts: at(-5), subjects: { Biology: { correct: 30, total: 40 } }, byTopic: {} };
  const fl = { testId: 'FULL_2', testName: 'Full-Length Test 2', kind: 'full-length', ts: at(-1), subjects: { Biology: { correct: 34, total: 40 }, 'Gen Chem': { correct: 30, total: 30 }, PAT: { correct: 80, total: 90 }, QR: { correct: 38, total: 40 } },
    sections: { sons: { correct: 64, total: 70, timeSec: 5400 }, pat: { correct: 80, total: 90, timeSec: 3600 }, qr: { correct: 38, total: 40, timeSec: 2400 } }, totalCorrect: 182, totalQs: 200 };
  const { P } = load({ 'al:mockHistory': [mirror, fl, { score: 9, total: 10, section: 'OChem', ts: at(-9) }], 'al:prometricHistory': [mirror] });
  const rs = P.results();
  eq(rs.map((r) => r.kind).sort(), ['full-length', 'practice-test']);
  const r = rs.find((x) => x.kind === 'full-length');
  eq([r.label, r.correct, r.total, r.timeSec], ['Full-length DAT 2', 182, 200, 11400]);
  eq(r.sections.map((s) => s.section), ['bio', 'gchem', 'pat', 'qr']);
  eq(r.parts.map((p) => p.label), ['Natural Sciences', 'PAT', 'QR']);
  assert.ok(!/predict|percentile|scaled|estimate/i.test(JSON.stringify(r)));
  const ms = P.misses().filter((m) => m.source === 'full-length');
  eq(ms.map((m) => m.concept).sort(), ['Biology mixed', 'Perceptual Ability mixed', 'Quantitative Reasoning mixed']);
  assert.ok(ms.every((m) => m.rank === 1 && m.sourceLabel === 'Full-length DAT 2'));
  /* with topic detail, misses are per topic */
  const t = load({ 'al:mockHistory': [Object.assign({}, fl, { topics: { 'Biology|Cell biology': { correct: 3, total: 5 }, 'QR|Probability': { correct: 4, total: 4 } } })] });
  eq(t.P.misses().filter((m) => m.source === 'full-length').map((m) => [m.id, m.detail]), [['fl:bio|Cell biology', '2 of 5 missed']]);
  /* the next full-length is the first one not taken */
  assert.equal(load(Object.assign(busy(), { 'al:mockHistory': [fl] })).P.todayPlan().test.title, 'Full-length DAT 1');
});

test('plays: the live Call it first entries, more can register, a miss finds its call', () => {
  const { P } = load({});
  assert.equal(P.plays().length, 15, 'the 15 Bio entries live today');
  assert.ok(P.plays().every((p) => /^\/tools\/bio\/bio-[a-z]+\.html#stick-[a-z-]+$/.test(p.href)));
  const data = fs.readFileSync(path.join(ROOT, 'tools/bio/bio-stick-data.js'), 'utf8');
  for (const p of P.plays()) assert.ok(data.includes("id: '" + p.id + "'"), p.id + ' exists in bio-stick-data.js');
  P.registerPlays([{ id: 'titration', section: 'GChem', title: 'Titration curves', subtopic: 'Acid-base titration', href: '/tools/gc/titration.html', words: 'titration pka equivalence buffer acid base' }, { id: 'bad' }]);
  assert.equal(P.plays().length, 16);
  assert.equal(P.playFor({ section: 'gchem', concept: 'Acid-Base: Titration Curves' }).id, 'titration');
  assert.equal(P.playFor({ section: 'bio', concept: 'Osmosis' }).id, 'tonicity');
  assert.equal(P.playFor({ section: 'bio', concept: 'x', entryId: 'nephron' }).id, 'nephron');
  assert.equal(P.playFor({ section: 'rc', concept: 'Inference' }), null);
});

test('a Bio Call it first card in the Bio deck names its entry', () => {
  const { P } = load({ acethedat_bio_engine_v1: { aceCards: [{ id: 'ace_1', q: 'q', quickHit: 'It swells and bursts', origin: 'Visualizer: Tonicity', subject: 'cell', nextDue: at(-1) }, { id: 'ace_2', q: 'q2', quickHit: 'a', origin: 'Node', nextDue: at(-1) }] } });
  const ms = P.misses().filter((m) => m.source === 'bio-engine');
  assert.equal(ms.find((m) => m.id === 'bio-card:ace_1').entryId, 'tonicity');
  assert.equal(ms.find((m) => m.id === 'bio-card:ace_2').entryId, undefined);
});
