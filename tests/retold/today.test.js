/* RET-G, Today skips a pulled night: a pull that reaches a course page (here
   the live list) is stored by shared/ace-pulls.js, and the planner in
   shared/ace-progress.js reads the same id (retold:<section>:<night>) and plans
   the next open night instead, for each of the six courses. The planner runs in
   a vm as in tests/shell/ace-plan-pulls.test.js (Friday, October 30, 2026). */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { ROOT, COURSES, KEY, load: loadPage } = require('./harness.cjs');

const NOW = new Date(2026, 9, 30, 10, 0, 0).getTime();
function planner(seed) {
  class FakeDate extends Date {
    constructor(...a) { if (a.length) super(...a); else super(NOW); }
    static now() { return NOW; }
  }
  const store = new Map(Object.entries(seed).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]));
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k), key: (i) => [...store.keys()][i], get length() { return store.size; },
  };
  class CustomEvent { constructor(type, init) { this.type = type; this.detail = init && init.detail; } }
  const window = { localStorage, CustomEvent, dispatchEvent: () => true, location: { search: '', hostname: 'acelabs.netlify.app' } };
  const ctx = vm.createContext({ window, localStorage, location: window.location, URLSearchParams, Date: FakeDate, JSON, Math, Promise, setTimeout, clearTimeout });
  for (const f of ['shared/ace-index.js', 'shared/ace-route.js', 'shared/ace-progress.js', 'shared/ace-coach-lines.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx);
  return window.AceProgress;
}
const LABEL = { bio: 'Bio', gchem: 'GChem', ochem: 'OChem', qr: 'QR', pat: 'PAT', rc: 'RC' };
/* values made inside the vm live in another realm: compare plain copies */
const learn = (P) => JSON.parse(JSON.stringify(P.todayPlan().steps.filter((s) => s.kind === 'learn').map((s) => s.title)));

for (const [dir, c] of Object.entries(COURSES)) {
  test(`${dir}: a pull that reached the course page makes Today skip that night`, async () => {
    const page = loadPage(dir, '', { live: { pulls: ['retold:' + c.sec + ':1'] } });
    let stored;
    try {
      await page.ready();
      assert.deepEqual(page.listed('#homeList')[0], 2, 'the course list starts at night 2');
      stored = JSON.parse(page.w.localStorage.getItem(KEY));
    } finally { page.close(); }
    const settings = { testDate: '2026-12-12', shaky: [LABEL[c.sec]], minutes: 60 };
    const open = planner({});
    open.saveSettings(settings);
    assert.deepEqual(learn(open), [LABEL[c.sec] + ', Retold: night 1'], 'with nothing pulled, Today starts at night 1');
    const P = planner({ [KEY]: stored });
    P.saveSettings(settings);
    assert.equal(P.nightPulled(c.sec, 1), true);
    assert.deepEqual(learn(P), [LABEL[c.sec] + ', Retold: night 2']);
  });
}
