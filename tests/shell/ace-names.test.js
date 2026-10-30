/* One name per thing (spec 1.4) in the generated index and the router:
   shared/ace-index.js (scripts/build-ace-index.mjs) and shared/ace-route.js. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '../..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
function load() {
  const window = {};
  vm.runInContext(read('shared/ace-index.js') + read('shared/ace-route.js'), vm.createContext({ window }));
  return { I: window.AceIndex, R: window.AceRoute };
}

test('the index is plain ASCII and never says wrong, incorrect or failed', () => {
  const src = read('shared/ace-index.js');
  assert.doesNotMatch(src, /[^\x00-\x7e]/);
  const { I } = load();
  const shown = [].concat(...Object.values(I.nights).map((l) => l.map((n) => n.t)), I.canon.map((c) => c.t), ...Object.values(I.skills).map((o) => Object.values(o)));
  for (const t of shown) assert.doesNotMatch(t, /\b(wrong|incorrect|fail(ed|s)?)\b/i, t);
});

test('the name table: RC night 8, Canon sheet 30, course names', () => {
  const { I, R } = load();
  assert.equal(R.nightTitle('rc', 8), 'Trap Answers: How the Traps Are Built');
  assert.doesNotMatch(read('tools/rc-retold/index.html'), /How Wrong Options Are Built/, 'the source of the index says it too');
  assert.equal(I.canon.find((c) => c.id === 'gc-thermo-delta-g').t, 'Thermodynamics: the sign of delta G');
  assert.deepEqual(Object.values(I.courses).map((c) => c.title), ['Bio, Retold', 'GChem, Retold', 'OChem, Retold', 'QR, Retold', 'PAT, Retold', 'RC, Retold']);
  assert.deepEqual(Object.values(I.courses).map((c) => c.name), ['Biology', 'General Chemistry', 'Organic Chemistry', 'Quantitative Reasoning', 'Perceptual Ability', 'Reading Comprehension'], 'section names unchanged');
  assert.equal(I.skills.qr['frac-dec'], 'Fractions and decimals');
  assert.equal(I.skills.qr['rate-time'], 'Rate and time');
  assert.equal(I.skills.gchem['eq-lechat'], 'Equilibrium: Le Chatelier');
  assert.equal(I.skills.qr['pct-chg'], 'Percent Increase/Decrease', 'other skill names keep their engine names until the engines are renamed');
  assert.equal(I.canon.length, 56);
});

test('the router speaks the same names: courses, Sheets, where a miss came from', () => {
  const { R } = load();
  assert.deepEqual(['bio', 'GC', 'Organic', 'qr', 'PAT', 'Reading'].map(R.courseName), ['Bio, Retold', 'GChem, Retold', 'OChem, Retold', 'QR, Retold', 'PAT, Retold', 'RC, Retold']);
  assert.equal(R.SHEETS, '/learn/#sheets');
  assert.deepEqual(JSON.parse(JSON.stringify(R.SECTION_SHORT)), { bio: 'Bio', gchem: 'GChem', ochem: 'OChem', qr: 'QR', pat: 'PAT', rc: 'RC' });
  const cases = [
    [{ source: 'practice-test', sourceLabel: 'Practice Test 2' }, 'Sciences + QR test 2'],
    [{ source: 'full-length', sourceLabel: 'Full-length DAT 3' }, 'Full-length DAT 3'],
    [{ source: 'pat-test', sourceLabel: 'PAT Test 1' }, 'PAT test 1'],
    [{ source: 'reading', sourceLabel: 'Reading section' }, 'Reading section'],
    [{ source: 'reading', sourceLabel: 'Reading passage' }, 'RC passages'],
    [{ source: 'games', sourceLabel: 'Game Central' }, 'Quick rounds'],
    [{ source: 'bio-engine', sourceLabel: 'Bio Repair Lab' }, 'Repair a miss'],
    [{ source: 'bio-engine', sourceLabel: 'Bio Repair Lab', entryId: 'tonicity' }, 'Call it first'],
    [{ source: 'gchem-engine', sourceLabel: 'Gen Chem engine' }, 'GChem skill tree'],
    [{ source: 'qr-engine', sourceLabel: 'QR engine' }, 'QR skill tree'],
    [{ source: 'climb', sourceLabel: 'The Climb' }, 'The Climb'],
    [{ source: 'play', sourceLabel: 'Call it first' }, 'Call it first'],
    [{ source: 'new-thing', sourceLabel: 'Something' }, 'Something']
  ];
  for (const [m, want] of cases) assert.equal(R.sourceName(m), want, JSON.stringify(m));
  assert.match(R.links({ section: 'gchem', concept: 'Gibbs free energy delta G' }).sheet, /gc-thermo-delta-g\.html$/, 'the ASCII title still routes');
});
