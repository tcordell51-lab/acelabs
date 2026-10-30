/* The coach line library: shared/ace-coach-lines.js. About 40 drafts in
   Thomas's voice, every one marked approved: false for his sign-off; the copy
   rules each line must pass; the plain fallback students see until a line is
   approved; the source-line rules. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '../..');
const SRC = fs.readFileSync(path.join(ROOT, 'shared/ace-coach-lines.js'), 'utf8');
function load(search = '') {
  const window = { location: { search } };
  vm.runInContext(SRC, vm.createContext({ window }));
  return window.AceCoachLines;
}
const plain = (x) => JSON.parse(JSON.stringify(x));

test('about 40 lines, every one a draft waiting for Thomas', () => {
  const C = load();
  assert.ok(C.LINES.length >= 36 && C.LINES.length <= 50, 'about 40: ' + C.LINES.length);
  assert.ok(C.LINES.every((l) => l.approved === false), 'nothing reaches students before he signs off');
  assert.equal(new Set(C.LINES.map((l) => l.id)).size, C.LINES.length, 'unique ids');
  for (const slot of Object.keys(C.SLOTS)) {
    assert.ok(C.lines(slot).length >= 2, slot + ' has at least two drafts to choose from');
    assert.ok(C.SLOTS[slot].when && C.SLOTS[slot].fallback, slot + ' says when it is used and has a fallback');
  }
  assert.ok(C.LINES.every((l) => C.SLOTS[l.slot] && l.pattern), 'every line names its slot and the codex move it uses');
});

test('every line and fallback passes the copy rules', () => {
  const C = load();
  assert.deepEqual(plain(C.checkAll()), []);
  assert.doesNotMatch(SRC, /[^\x00-\x7e]/, 'the file is plain ASCII');
});

test('the rules catch what must never ship', () => {
  const C = load();
  const bad = {
    'You failed this one.': /banned word/,
    'Great job! Keep it up.': /exclamation|banned/,
    'Only 3 days left.': /banned word/,
    'Do not fall behind on your cards.': /banned word/,
    'I wrote this plan this morning.': /first person/,
    'We start with osmosis.': /first person/,
    'Keep your streak going.': /banned word/,
    'Osmosis first — then cards.': /non-ASCII/,
    'Osmosis first -- then cards.': /dash/,
    '[One] call, [then] cards.': /gold phrase/,
    'One call on {subject}.': /not a play-then-cards variable/,
    'This line is far too long to sit in the coach band on a phone, so the check refuses it outright.': /90 characters/
  };
  for (const [text, re] of Object.entries(bad)) {
    const p = C.check({ id: 'x', slot: 'play-then-cards', text, approved: false });
    assert.ok(p.some((x) => re.test(x)), text + ' -> ' + JSON.stringify(p));
  }
  assert.deepEqual(plain(C.check({ id: 'ok', slot: 'play-then-cards', text: '{topic} first, [then {cards}.]', approved: false })), []);
  assert.ok(C.check({ slot: 'play-then-cards', text: 'x', approved: 'yes' }).some((x) => /approved/.test(x)));
});

test('students see the plain fallback until a line in the slot is approved', () => {
  const C = load();
  const vars = { topic: 'osmosis', cards: 'your three cards' };
  const f = C.pick('play-then-cards', vars, { seed: '2026-10-30' });
  assert.equal(f.fallback, true);
  assert.equal(f.text, 'One call on osmosis, then your three cards.');
  assert.equal(f.approved, false);
  C.LINES.find((l) => l.id === 'pc-1').approved = true;
  const a = C.pick('play-then-cards', vars, { seed: '2026-10-30' });
  assert.deepEqual([a.id, a.approved, a.draft, a.fallback], ['pc-1', true, false, false]);
  assert.equal(a.text, 'Osmosis first, then your three cards.');
  assert.equal(a.html, 'Osmosis first, <em>then your three cards.</em>');
  assert.equal(C.pick('nope', vars), null);
});

test('coaches preview the drafts in place with ?coach=1; the pick holds all day', () => {
  const C = load('?coach=1');
  const vars = { topic: 'osmosis', cards: 'your three cards' };
  const a = C.pick('play-then-cards', vars, { seed: '2026-10-30' });
  assert.equal(a.draft, true);
  assert.match(a.id, /^pc-\d$/);
  assert.equal(C.pick('play-then-cards', vars, { seed: '2026-10-30' }).id, a.id, 'same seed, same line');
  const ids = new Set(['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04'].map((d) => C.pick('play-then-cards', vars, { seed: d }).id));
  assert.ok(ids.size > 1, 'it varies from day to day');
  assert.equal(load().pick('play-then-cards', vars, { drafts: true }).draft, true, 'or on request');
  assert.equal(C.pick('play-then-cards', vars, { drafts: false }).fallback, true, 'and off on request');
});

test('a line is only used when every variable it needs is there', () => {
  const C = load('?coach=1');
  const r = C.pick('replan', { night: 'night 3', why: '' }, { seed: 's' });
  assert.ok(!/\{|\}/.test(r.text));
  assert.ok(r.fallback || !/moved/.test(C.LINES.find((l) => l.id === r.id).text), 'no line that needs {moved}');
});

test('fill and html: plain text for the screen reader, one gold phrase, values escaped', () => {
  const C = load();
  assert.equal(C.fill('{topic} first, [then {cards}.]', { topic: 'osmosis', cards: 'your card' }), 'Osmosis first, then your card.');
  assert.equal(C.html('{topic} first, [then {cards}.]', { topic: '<b>x</b>', cards: 'a & b' }), '&lt;b&gt;x&lt;/b&gt; first, <em>then a &amp; b.</em>');
  assert.equal(C.html('[call this one.]', {}), '<em>Call this one.</em>');
});

test('source-line rules: an auto line names its facts; a portal note is verbatim and signed', () => {
  const C = load();
  assert.ok(C.SOURCE_RULES.length >= 4);
  assert.ok(C.SOURCE_RULES.some((r) => /verbatim and signed/.test(r)));
  assert.ok(C.SOURCE_RULES.some((r) => /that morning/.test(r)));
  assert.deepEqual(plain(C.checkSource({ kind: 'auto', text: 'From your diagnostic and your Dec 12 test date.' })), []);
  assert.deepEqual(plain(C.checkSource({ kind: 'coach', text: 'Two PAT sets before Friday!', sign: 'Thomas, Sunday\'s weekly plan' })), [], 'a coach note is his, quoted as written');
  assert.ok(C.checkSource({ kind: 'coach', text: 'x' }).some((p) => /signed/.test(p)));
  assert.ok(C.checkSource({ kind: 'auto', text: 'I wrote this for you this morning.' }).some((p) => /first person/.test(p)));
  assert.ok(C.checkSource({ kind: 'other', text: 'x' }).length);
});

test('every slot the planner can choose exists in the library', () => {
  const C = load();
  const src = fs.readFileSync(path.join(ROOT, 'shared/ace-progress.js'), 'utf8');
  const used = new Set([...src.matchAll(/\bslot = ([^;]*);/g)].flatMap((m) => [...m[1].matchAll(/'([a-z-]+)'/g)].map((x) => x[1])));
  assert.ok(used.size >= 12, 'found the planner slots: ' + [...used].join(', '));
  for (const s of used) assert.ok(C.SLOTS[s], s);
});
