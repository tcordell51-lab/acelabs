// Free sample (Thomas, 2026-11-23): 10 questions per section, and every free question shows its
// walk-through after Check answer: the answer line, 3 to 5 steps, and the trap in the letter picked.
// node --test tests/shell/free-sample-walk.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..', '..');
const FREE = path.join(ROOT, 'data', 'free');
const SECTION_FILES = { bio: ['sample-bio.json'], gchem: ['sample-gchem.json'], ochem: ['sample-ochem.json'], qr: ['sample-qr-climb.json', 'sample-qr-dat.json'] };
const load = (f) => JSON.parse(fs.readFileSync(path.join(FREE, f), 'utf8'));
const excluded = new Set(['scripts/bank/out/gchem-explanations-standard.json', 'scripts/bank/out/qr-explanations-standard.json']
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')).records.filter((r) => r.status === 'excluded').map((r) => r.id)));

test('10 questions per section, none outside the DAT outline', () => {
  for (const [sec, files] of Object.entries(SECTION_FILES)) {
    const items = files.flatMap((f) => load(f).items);
    assert.strictEqual(items.length, 10, sec);
    for (const it of items) assert.ok(!excluded.has(it.id), it.id + ' is excluded from delivery');
  }
});

test('every free question shows its walk-through after a miss', () => {
  const dom = new JSDOM('<!doctype html><body><div id="h"></div></body>', { runScripts: 'outside-only' });
  dom.window.eval(fs.readFileSync(path.join(ROOT, 'shared', 'ace-question.js'), 'utf8'));
  const host = dom.window.document.getElementById('h');
  let n = 0;
  for (const files of Object.values(SECTION_FILES)) for (const f of files) for (const item of load(f).items) {
    const wrong = (item.answer + 1) % 5;
    host.innerHTML = '';
    const q = dom.window.AceQuestion.mount(host, item, {});
    q.pick(wrong, false); q.check();
    const fb = host.querySelector('.aui-q__fb');
    assert.ok(!fb.hidden, item.id);
    const titles = [...fb.querySelectorAll('dt')].map((d) => d.textContent);
    assert.ok(titles.includes('Why'), item.id + ' answer line');
    assert.ok(titles.includes('How to get there'), item.id + ' steps');
    const steps = fb.querySelectorAll('.aui-q__steps li').length;
    assert.ok(steps >= 3 && steps <= 5, item.id + ' 3 to 5 steps, got ' + steps);
    assert.ok(titles.includes('The trap in ' + 'ABCDE'[wrong]), item.id + ' trap for the pick');
    const text = fb.textContent;
    assert.ok(!/\*\*|—/.test(text), item.id + ' no raw marks, no em dash');
    if (item.trick) assert.ok(titles.includes('Trick'));
    n++;
  }
  assert.strictEqual(n, 40);
});
