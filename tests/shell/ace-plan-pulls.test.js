/* B1.2t, the planner's pull check: AceProgress.today() and todayPlan() never
   plan a Retold night that is pulled (retold:<section>:<night>). The pull comes
   from window.AcePulls (shared/ace-pulls.js) when the page loads it, or from the
   list it last stored (localStorage acelabs.v1.pulls). Same vm harness as
   ace-plan.test.js (a fake localStorage, Friday, October 30, 2026, 10:00). */
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
  const window = { AcePulls: opts.acePulls, localStorage, CustomEvent, dispatchEvent: (e) => { events.push(e); return true; }, location: { search: opts.search || '', hostname: opts.hostname || 'acelabs.netlify.app' } };
  const ctx = vm.createContext({ window, localStorage, location: window.location, URLSearchParams, Date: FakeDate, JSON, Math, Promise, setTimeout, clearTimeout });
  const files = ['shared/ace-index.js', 'shared/ace-route.js', 'shared/ace-progress.js'];
  if (opts.lines !== false) files.push('shared/ace-coach-lines.js');
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx);
  return { P: window.AceProgress, R: window.AceRoute, CL: window.AceCoachLines, store, events, window, tick: (ms) => { now += ms; } };
}
const json = (store, k) => JSON.parse(store.get(k));
/* values made inside the vm live in another realm: compare their plain JSON */
const eq = (a, b, m) => assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), m);

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


const PULLS = 'acelabs.v1.pulls';
const stored = (ids, snap = []) => ({ [PULLS]: { v: 1, at: NOW, ids, snap } });
const stub = (ids) => ({ isPulled: (id) => ids.some((p) => id === p || id.startsWith(p + ':')) });
const learn = (plan) => plan.steps.filter((s) => s.kind === 'learn').map((s) => s.title + ' ' + s.href);

test('baseline: the busy student is planned GChem night 13 by both planners', () => {
  const { P } = load(busy());
  eq(learn(P.todayPlan()), ['GChem, Retold: night 13 /tools/gchem/?night=13']);
  eq(P.today().filter((t) => t.kind === 'learn').map((t) => t.href), ['/tools/gchem/?night=13']);
  assert.equal(P.isPulled('retold:gchem:13'), false);
});

test('a pulled night (stored list, live or snapshot half) gives way to the next open night in both planners', () => {
  for (const seed of [stored(['retold:gchem:13']), stored([], ['retold:gchem:13'])]) {
    const { P } = load(busy(seed));
    assert.equal(P.nightPulled('gchem', 13), true);
    eq(learn(P.todayPlan()), ['GChem, Retold: night 14 /tools/gchem/?night=14']);
    eq(P.today().filter((t) => t.kind === 'learn').map((t) => [t.title, t.href]), [['GChem, Retold: night 14', '/tools/gchem/?night=14']]);
  }
  /* two in a row */
  const { P } = load(busy(stored(['retold:bio:4', 'retold:bio:5'])));
  assert.equal(P.openNight('bio', 4), 6);
  assert.equal(P.openNight('bio', 3), 3);
  assert.equal(P.openNight('bio', 14), 14);
});

test('the same through window.AcePulls when the page loads it; a throwing AcePulls still leaves the stored list in force', () => {
  const { P } = load(busy(), { acePulls: stub(['retold:gchem:13']) });
  eq(learn(P.todayPlan()), ['GChem, Retold: night 14 /tools/gchem/?night=14']);
  eq(P.today().filter((t) => t.kind === 'learn').map((t) => t.href), ['/tools/gchem/?night=14']);
  const broken = load(busy(stored(['retold:gchem:13'])), { acePulls: { isPulled() { throw new Error('boom'); } } });
  eq(learn(broken.P.todayPlan()), ['GChem, Retold: night 14 /tools/gchem/?night=14']);
  const unpulled = load(busy(stored(['retold:gchem:13'])), { acePulls: stub([]) });
  eq(learn(unpulled.P.todayPlan()), ['GChem, Retold: night 14 /tools/gchem/?night=14'], 'a pull in either list wins');
});

test('a course with no open night left is not planned at all; nothing else in the plan changes', () => {
  const { P, window } = load(busy());
  const before = P.todayPlan();
  const nights = window.AceIndex.nights.gchem.map((x) => x.n).filter((n) => n >= 13);
  const all = load(busy(stored(nights.map((n) => 'retold:gchem:' + n))));
  const course = load(busy(stored(['retold:gchem'])));
  for (const { P: Q } of [all, course]) {
    assert.equal(Q.openNight('gchem', 13), null);
    const plan = Q.todayPlan();
    eq(learn(plan), []);
    eq(plan.steps.filter((s) => s.kind !== 'learn').map((s) => s.key), before.steps.filter((s) => s.kind !== 'learn').map((s) => s.key));
    eq(Q.today().filter((t) => t.kind === 'learn'), []);
  }
  /* an unrelated pull changes nothing */
  const other = load(busy(stored(['retold:bio:13', 'retold:gchem:12', 'g1:FULL_1:3'])));
  eq(JSON.parse(JSON.stringify(other.P.todayPlan().steps)), JSON.parse(JSON.stringify(before.steps)));
});

test('the first plan: a pulled night 1 starts each shaky course at its next open night', () => {
  const { P } = load(stored(['retold:pat:1']));
  P.saveSettings({ testDate: '2026-12-12', shaky: ['PAT', 'GChem'], minutes: 60 });
  eq(P.todayPlan().steps.filter((s) => s.kind === 'learn').map((s) => s.title), ['PAT, Retold: night 2', 'GChem, Retold: night 1']);
});

test('re-plan on a play miss: a scene from a pulled night is not added; the plan stays as it was', () => {
  const card = { id: 'play:tonicity', entryId: 'tonicity', kind: 'play', section: 'bio', subtopic: 'Membrane transport', title: 'Tonicity', from: 'call', outcome: 'needs-review',
    idea: 'Animal cell in pure water: water rushes in, the cell swells and bursts.', hook: 'Water chases solute.', missWhy: 'you called the salty-water picture for pure water', made: iso(0), due: iso(1), madeAt: NOW - 60000 };
  const open = load(busy());
  open.P.addPlayCard(card);
  assert.equal(open.P.todayPlan().steps[1].title, 'Bio, Retold: night 3, one scene', 'unpulled: the scene comes in');
  const { P } = load(busy(stored(['retold:bio:3'])));
  const before = P.todayPlan();
  P.addPlayCard(card);
  const plan = P.todayPlan();
  assert.equal(plan.replanned, false);
  assert.ok(!plan.steps.some((s) => s.key === 'scene'));
  assert.equal(plan.said, '');
  eq(plan.steps.map((s) => s.key), before.steps.map((s) => s.key));
  assert.equal(plan.steps[0].done, true, 'the call is still done');
  /* a pulled scene alone does not stop the re-plan: the night is still listed */
  const scene = load(busy(stored(['retold:bio:3:2'])));
  scene.P.addPlayCard(card);
  assert.equal(scene.P.todayPlan().replanned, true);
});

test('a coach step on a pulled night is left out; the rest of the coach plan stays', () => {
  const { P } = load(busy(stored(['retold:gchem:12'])));
  const plan = P.todayPlan({ coach: { tasks: [{ title: 'PAT set: Hole punching', href: '/tools/pat/holepunch.html', minutes: 20 }, { title: 'GChem, Retold: night 12', href: '/tools/gchem/?night=12', minutes: 30 }, { title: 'GChem, Retold: night 11', href: '/tools/gchem/index.html?night=11&x=1', minutes: 30 }] } });
  eq(plan.steps.slice(1).map((s) => s.title), ['PAT set: Hole punching', 'GChem, Retold: night 11']);
});

test('nothing here fetches; the stored list is read, never written by the planner', () => {
  const { P, store } = load(busy(stored(['retold:gchem:13'])));
  const before = store.get(PULLS);
  P.todayPlan(); P.today();
  assert.equal(store.get(PULLS), before);
  const src = fs.readFileSync(path.join(ROOT, 'shared/ace-progress.js'), 'utf8');
  const block = src.slice(src.indexOf('pulls (B1.2t): a pulled Retold night'), src.indexOf('function today()'));
  assert.doesNotMatch(block, /fetch\(|XMLHttpRequest|setItem|writeRaw/);
});
