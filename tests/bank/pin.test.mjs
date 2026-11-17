// The pinned review set (Thomas, 2026-11-16): the seeded 50 per section and the six forms stay
// exactly the ids committed at 27a5aaf (PR #19), whatever a bank changes in difficulty or tags.
// Ids only: nothing here reads or prints question text.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { build, loadPin, reviewQueue, BANKS } from '../../scripts/bank/build-private.mjs';
import { pinnedForms, composeForms } from '../../scripts/bank/compose-ace-forms.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const SECS = ['bio', 'gc', 'ochem', 'qr', 'rc'];

// Fingerprints of the review set as committed at 27a5aaf (scripts/bank/review-queue.json seed
// per section, in order; scripts/bank/forms.json sections and RC per form). A change to either
// means the pinned set moved.
const SEED_SHA_27A5AAF = 'f9a1589923071b184b1a77961cd0b76213d638972ecb2f8ff9ea600c27ae1f4d';
const FORMS_SHA_27A5AAF = 'd9b9f39cef9eac0c74be543d812a75ee9fadc2e728a9206a2893c2f3ca2261bc';
const sha = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const seedOf = (sections) => Object.fromEntries(SECS.map((s) => [s, sections[s].seed]));
const formsOf = (forms) => forms.map((f) => ({ id: f.id, sections: f.sections, rc: f.rc && f.rc.passages ? { passages: f.rc.passages } : f.rc }));

test('pin.json holds the 250 seed ids and the six forms committed at 27a5aaf', () => {
  const pin = loadPin();
  assert.ok(pin, 'scripts/bank/pin.json is missing');
  for (const s of SECS) assert.equal(pin.seed[s].length, 50, s + ' seed is not 50');
  assert.equal(new Set(Object.values(pin.seed).flat()).size, 250);
  assert.equal(pin.forms.length, 6);
  assert.equal(sha(pin.seed), SEED_SHA_27A5AAF, 'the pinned seed moved');
  assert.equal(sha(formsOf(pin.forms)), FORMS_SHA_27A5AAF, 'the pinned forms moved');
});

test('the committed forms.json and review-queue.json match the pin', () => {
  const pin = loadPin(), q = read('scripts/bank/review-queue.json'), f = read('scripts/bank/forms.json');
  assert.deepEqual(seedOf(q.sections), pin.seed);
  assert.deepEqual(formsOf(f.forms), formsOf(pin.forms));
});

// a small fixture: two forms' worth of ids, then the bank changes difficulty and tags
const mk = (id, extra = {}) => ({ id, bankTopic: 't', canon: 'c-' + id, topicId: 'x', conf: 'meta', difficulty: 2, answer: 1, choices: ['a', 'b', 'c', 'd', 'e'], formEligible: true, ...extra });
const fixtureItems = () => ({ bio: ['b1', 'b2', 'b3'].map((x) => mk('bio:' + x)), gc: [mk('gc:g1')], ochem: [mk('oc:o1')], qr: [mk('qr:q1')] });
const fixturePin = { seed: { bio: ['bio:b2', 'bio:b1'] }, forms: [{ id: 'ACE_1', n: 1, name: 'Full-Length Test 5', sections: { bio: ['bio:b2', 'bio:b1'], gc: ['gc:g1'], ochem: ['oc:o1'], qr: ['qr:q1'] }, pat: { seed: 'F20261101' }, rc: { section: 'rc-s11', fallback: true }, status: 'awaiting review' }] };

test('pinnedForms keeps every id when difficulty, tags and keys change, and refreshes the mix', () => {
  const items = fixtureItems();
  const a = pinnedForms({ items, passages: [], bioTargets: { 'cell-molecular': 1 }, pin: fixturePin });
  items.bio[0] = mk('bio:b1', { difficulty: 3, canon: 'other', answer: 4 });
  items.bio[1] = mk('bio:b2', { difficulty: 1, canon: null, conf: 'low' });
  const b = pinnedForms({ items, passages: [], bioTargets: { 'cell-molecular': 1 }, pin: fixturePin });
  assert.deepEqual(b.forms[0].sections, a.forms[0].sections);
  assert.deepEqual(b.forms[0].sections.bio, ['bio:b2', 'bio:b1']);
  assert.deepEqual(b.missing, []);
  assert.deepEqual(b.forms[0].mix.bio.difficulty, { 1: 1, 2: 0, 3: 1 });
  assert.equal(b.forms[0].mix.bio.keys, 'A0 B1 C0 D0 E1');
});

test('pinnedForms reports a pinned id the bank no longer holds, and a fresh compose ignores the pin', () => {
  const items = fixtureItems(); items.bio = items.bio.filter((x) => x.id !== 'bio:b1');
  const r = pinnedForms({ items, passages: [], bioTargets: { 'cell-molecular': 1 }, pin: fixturePin });
  assert.deepEqual(r.missing, ['bio:b1']);
  const fresh = composeForms({ items: fixtureItems(), passages: [], bioTargets: { 'cell-molecular': 1 }, count: 1 });
  assert.equal(fresh.forms.length, 1);
});

test('reviewQueue keeps a pinned seed in its pinned order', () => {
  const out = { bio: fixtureItems().bio.map((x) => ({ ...x, choices: x.choices })), gchem: [], ochem: [], qr: [], rc: [] };
  const forms = [{ sections: { bio: ['bio:b1', 'bio:b2'] }, rc: null }];
  const q = reviewQueue(out, forms, {}, { bio: ['bio:b2', 'bio:b1'] });
  assert.deepEqual(q.sections.bio.seed, ['bio:b2', 'bio:b1']);
  assert.deepEqual(q.sections.bio.bank, ['bio:b3']);
});

// The five private bank pull requests (ace-bank-bio/gchem/ochem/qr/rc #1, open on 2026-11-16).
// Override with ACE_BANK_PR_HEADS="bio=<sha>,gchem=<sha>,..." to test other heads.
const PR_HEADS = Object.assign(
  { bio: '718f0f876b150a4ca25a8c4d93c3cdc94e1ea0c1', gchem: 'd5e371a4a65a2e933674b0d6fd5be084917e9354', ochem: 'deacf3c3a469ad84827671438ec880835a232113', qr: '8bd9278e8d53c35beb4a55fabaf9b2ad77fe499a', rc: '4af0079c01e7863720a4d6a8c5d986213ae245ae' },
  Object.fromEntries(String(process.env.ACE_BANK_PR_HEADS || '').split(',').filter((x) => x.includes('=')).map((x) => x.split('=').map((y) => y.trim())))
);
// the bank git repositories (ACE_BANK_DIR may point at a plain export, so look for .git)
const REPOS = [process.env.ACE_BANK_REPOS || '', BANKS || '', path.join(os.homedir(), 'code'), os.homedir(), '/home/claude']
  .filter(Boolean).find((d) => Object.keys(PR_HEADS).every((b) => fs.existsSync(path.join(d, 'ace-bank-' + b, '.git'))));
function exportHeads() {
  if (!REPOS) return { skip: 'the private bank repositories are not on this machine' };
  const dest = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-bank-heads-'));
  for (const [b, ref] of Object.entries(PR_HEADS)) {
    const repo = path.join(REPOS, 'ace-bank-' + b), to = path.join(dest, 'ace-bank-' + b);
    try { execFileSync('git', ['-C', repo, 'cat-file', '-e', ref + '^{commit}'], { stdio: 'ignore' }); } catch { fs.rmSync(dest, { recursive: true, force: true }); return { skip: `ace-bank-${b} has no commit ${ref} locally (fetch the PR head first)` }; }
    fs.mkdirSync(to, { recursive: true });
    execFileSync('sh', ['-c', 'git -C "$1" archive "$2" | tar -x -C "$3"', 'sh', repo, ref, to]);
  }
  return { dir: dest };
}

test('with all five bank PR heads checked out, the build keeps the 250 seed ids and the six forms', (t) => {
  const h = exportHeads();
  if (h.skip) { t.skip(h.skip); return; }
  try {
    const pin = loadPin();
    const r = build({ banks: h.dir, regenerate: false, pin });
    assert.equal(r.pinned, true);
    assert.deepEqual(seedOf(r.queue.sections), pin.seed);
    assert.equal(sha(seedOf(r.queue.sections)), SEED_SHA_27A5AAF);
    assert.deepEqual(formsOf(r.forms), formsOf(pin.forms));
    assert.equal(sha(formsOf(r.forms)), FORMS_SHA_27A5AAF);
    // the per-item subtopic the bank PRs added is read (canon in Bio and QR, subtopic in OChem)
    assert.ok(r.declared.used >= 150, 'stated subtopics read: ' + r.declared.used);
    assert.deepEqual(r.declared.unknown, []);
    // content still flows through: the items carry fresh data and hashes from the PR heads
    const ids = new Set(Object.values(pin.seed).flat());
    const fresh = Object.values(r.out).flat().filter((i) => ids.has(i.id));
    assert.equal(fresh.length, 250);
    assert.ok(fresh.every((i) => /^[0-9a-f]{16}$/.test(i.hash)));
    // for the record: what an unpinned rebuild would have done to the seed
    const regen = build({ banks: h.dir, regenerate: true, pin });
    const kept = SECS.map((s) => s + ' ' + regen.queue.sections[s].seed.filter((id) => pin.seed[s].includes(id)).length + '/50');
    t.diagnostic('without the pin the seed would keep only: ' + kept.join(', '));
  } finally { fs.rmSync(h.dir, { recursive: true, force: true }); }
});
