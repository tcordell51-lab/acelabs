#!/usr/bin/env node
// topic-scorecard.mjs : every DAT topic on Ace Labs, scored 0 to 10 against docs/perfect-topic.md.
//
//   node scripts/topic-scorecard.mjs                 score, write scripts/topic-scorecard.json and
//                                                    docs/topic-scorecard.md, print the summary
//   node scripts/topic-scorecard.mjs --phone FILE    also take in a fresh phone run
//                                                    (node scripts/measure-phone.mjs --out FILE)
//   node scripts/topic-scorecard.mjs --no-write      print only
//
// Measurement only: it reads repo data and changes no student page. Ids, counts and topic keys
// only; no question text is read into the output (the repository is public).
//
// Topic list: data/topics.json (keys that share one canonical id are one topic), topic keys the
// QR drill serves that topics.json does not list, PAT's six subtests, and the Reading question types.
//
// The ten checks (one point each, half when partly met). How each is measured:
//   1 learn        the site's own router (shared/ace-route.js) finds a Retold night for the topic.
//                  1 only when the hub's topic row links the lesson (one tap); a night found but not
//                  linked from the topic is 0.5 (a night also covers several topics, not one screen).
//   2 whiteboard   shared/ace-visuals.js resolves the topic to a board in shared/boards. 1 when the
//                  board is this topic's own; 0.5 when several topics share it (the best name match
//                  owns it) or when the topic resolves to a lab; 0 when nothing resolves.
//   3 drill        items tagged to the topic in data/*.json and data/free/sample-*.json:
//                  20 or more = 1, 10 to 19 = 0.5. PAT: a generator. RC: 10 passages with the type.
//   4 explanation  every served item has an answer line, 3 to 5 steps, a trap per wrong choice and a
//                  check question = 1. Written to the standard in a sidecar but not served yet
//                  (review pending), or at least half served = 0.5.
//   5 see it       every drill item opens a whiteboard = 1; every item opens some visual, or at
//                  least half open a whiteboard = 0.5.
//   6 game         the topic's board ends on a game with score and streak = 1; a game without a
//                  streak, or the mixed arcade (12 questions, up to 60 s each) = 0.5.
//   7 quick check  a 5-question check that marks the topic mastered at 4 of 5.
//   8 review       misses open a Repair entry = 0.5; a 1, 3, 7 day return schedule as well = 1.
//   9 engagement   XP, daily streak, mastery ring, a question within one tap. All four = 1, two or three = 0.5.
//  10 phone        every page of the topic's flow measured at 390 px with no sideways scroll, no
//                  text under 13 px, no tap target under 44 px and no JS error = 1; a page not
//                  measured, or a text or tap miss = 0.5; sideways scroll, a JS error, a known
//                  defective item, or a topic listed outside the DAT outline = 0.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const R = (p) => path.join(ROOT, p);
const read = (p) => fs.readFileSync(R(p), 'utf8');
const json = (p) => JSON.parse(read(p));
const has = (p) => fs.existsSync(R(p));
const argv = process.argv.slice(2);
const arg = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const OUT_JSON = 'scripts/topic-scorecard.json', OUT_MD = 'docs/topic-scorecard.md';

/* ---------- the site's own modules ---------- */
globalThis.window = globalThis;
require(R('shared/ace-skills.js'));
const V = require(R('shared/ace-visuals.js'));
const B = require(R('shared/ace-board.js'));
B.files.forEach((f) => require(R('shared/boards/' + f + '.js')));
require(R('shared/ace-index.js'));
require(R('shared/ace-route.js'));
const Route = globalThis.AceRoute, Index = globalThis.AceIndex;
const TOPICS = json('data/topics.json');

const SECTIONS = [['gchem', 'General Chemistry'], ['bio', 'Biology'], ['ochem', 'Organic Chemistry'], ['qr', 'Quantitative Reasoning'], ['pat', 'Perceptual Ability'], ['rc', 'Reading Comprehension']];
const CHECKS = ['learn', 'whiteboard', 'drill', 'explanation', 'seeIt', 'game', 'quickCheck', 'review', 'engagement', 'phone'];
const CHECK_NAME = { learn: 'Learn', whiteboard: 'Whiteboard', drill: 'Drill depth', explanation: 'Explanation standard', seeIt: 'See it', game: 'Game', quickCheck: 'Quick check', review: 'Review loop', engagement: 'Engagement', phone: 'Phone and correctness' };
/* Hub page and the banks it serves. */
const HUB = {
  gchem: { home: '/gc/', drill: (t) => '/gc/?topic=' + t, banks: ['gchem'], arcade: 'gchem' },
  bio: { home: '/bio/', drill: (t) => '/bio/?topic=' + t, banks: ['bio'], arcade: 'bio' },
  ochem: { home: '/oc/', drill: (t) => '/oc/?topic=' + t, banks: ['ochem'], arcade: 'ochem' },
  qr: { home: '/qr/', drill: (t) => '/qr/drill/?topic=' + t, banks: ['qr-dat', 'qr-climb', 'qr-topics'], arcade: 'qr', page: '/qr/drill/' }
};
const PAT = [['keyholes', 'Keyholes'], ['tfe', 'Top, front, end'], ['angles', 'Angle ranking'], ['holepunch', 'Hole punching'], ['cubes', 'Cube counting'], ['patternfold', 'Pattern folding']];
const RC_NAME = { detail: 'Detail', inference: 'Inference', tone: 'Tone and attitude', purpose: 'Purpose', except: 'Except and NOT', function: 'Function', application: 'Application', vocab: 'Vocabulary in context', mainidea: 'Main idea' };
/* The OChem arcade bank (games/ochem-bank-1000.js) tags by reaction group, not by hub topic. */
const OCHEM_ARCADE = { 'mech-sne': /^(sn1-sn2|e1-e2|sub-vs-elim)/, 'stereo-rs': /^stereo-/, 'alkene-add': /^alkene-/, alkyne: /^alkyne-/, 'arom-eas': /^(eas-|aromatic)/, 'alc-eth': /^(alcohol-|ether-)/,
  carbonyl: /^(carbonyl-|wittig|aldol|enolate|claisen|michael)/, acids: /^(ester-|acyl-|carboxylic-)/, amines: /^amine-/, 'spec-ir-nmr': /^spectroscopy-/, synth: /^multistep-synthesis/, lab: /^lab-techniques/,
  'mech-arrows': /^resonance-stability/, 'ab-ochem': /^acid-base-pka/ };
/* Topics Thomas's scope audit lists as not named in the 2026 QR outline. Applied only while
   scripts/bank/scope-exclusions.json still carries a reason with that word. */
const SCOPE_WORDS = { qr: { logarithms: ['logs', 'logarithms'], geometry: ['geo-2d', 'vol-sa', 'geometry-area-volume'], 'midpoint and distance': ['coord'] } };

/* ---------- banks ---------- */
const bank = {};
for (const f of ['bio', 'gchem', 'ochem', 'qr-dat', 'qr-climb', 'qr-topics']) {
  if (!has('data/' + f + '.json')) { bank[f] = []; continue; }
  const byId = new Map();
  for (const it of json('data/' + f + '.json').items) byId.set(it.id, it);
  if (has('data/free/sample-' + f + '.json')) for (const it of json('data/free/sample-' + f + '.json').items) byId.set(it.id, Object.assign({}, byId.get(it.id) || {}, it));
  bank[f] = [...byId.values()];
}
/* Walk-throughs written to the explanation standard (answer, steps, traps, check). */
const walk = new Map();
for (const f of ['scripts/bank/out/gchem-explanations-standard.json', 'scripts/bank/out/qr-explanations-standard.json', 'scripts/free-sample-walks.json']) {
  if (has(f)) for (const r of json(f).records) if (r.status === 'rewritten' && r.explain) walk.set(r.id, r);
}
const LET = ['A', 'B', 'C', 'D', 'E'];
function servedFull(it) {
  const wrong = it.choices.map((_, k) => k).filter((k) => k !== it.answer);
  return !!(it.why && it.why.length >= 20 && Array.isArray(it.steps) && it.steps.length >= 3 && it.steps.length <= 5 &&
    Array.isArray(it.traps) && wrong.every((k) => it.traps[k]) && it.check && it.check.q && it.check.a);
}
function draftedFull(it) {
  const r = walk.get(it.id); if (!r) return false;
  const e = r.explain, wrong = it.choices.map((_, k) => LET[k]).filter((l) => l !== r.key);
  return !!(e.answer && Array.isArray(e.steps) && e.steps.length >= 3 && e.steps.length <= 5 && e.traps && wrong.every((l) => e.traps[l]) && e.check && e.check.q && e.check.a);
}
/* Private bank tags (ids and tags only): how many private items share a canonical skill with the topic. */
const privateBySkill = {};
if (has('scripts/bank/out/ace-bank-tags.json')) for (const v of Object.values(json('scripts/bank/out/ace-bank-tags.json').tags)) if (v && v[0]) privateBySkill[v[0]] = (privateBySkill[v[0]] || 0) + 1;
/* Arcade banks: topic key -> count. */
const arcade = {};
for (const f of ['gchem', 'bio', 'qr']) { arcade[f] = {}; if (has('games/' + f + '.json')) for (const q of json('games/' + f + '.json')) arcade[f][q.topic] = (arcade[f][q.topic] || 0) + 1; }
arcade.ochem = {};
if (has('games/ochem-bank-1000.js')) for (const m of read('games/ochem-bank-1000.js').matchAll(/"?group"?:\s*"([^"]+)"/g)) arcade.ochem[m[1]] = (arcade.ochem[m[1]] || 0) + 1;
const playSrc = has('games/play.html') ? read('games/play.html') : '';
const ARCADE_SECONDS = (+(/ROUND_SIZE\s*=\s*(\d+)/.exec(playSrc) || [0, 0])[1]) * (+(/QUESTION_SECONDS\s*=\s*(\d+)/.exec(playSrc) || [0, 0])[1]);

/* ---------- site-wide feature probes ---------- */
const src = (list) => list.filter(has).map(read).join('\n');
const shellJs = src(['shared/ace-hub.js', 'shared/ace-set.js', 'shared/ace-question.js', 'shared/ace-record.js', 'shared/ace-progress.js', 'shared/ace-progress-page.js', 'shared/ace-repair-page.js', 'shared/ace-board.js', 'shared/ace-ui.js', 'shared/ace-next-steps.js']);
const hubRow = src(['shared/ace-hub.js']);
const recordJs = src(['shared/ace-record.js']);
const repairFn = (/function repairAnswer[\s\S]*?\n {2}}/.exec(recordJs) || [''])[0] + (/function repairSkillAnswer[\s\S]*?\n {2}}/.exec(recordJs) || [''])[0];
/* Behaviour, not wording: run the shared record and mastery files and watch what they do. */
function sandbox(files) {
  const store = {}, localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
  const window = { localStorage }, ctx = vm.createContext({ window, localStorage, console, Promise, Date, Math, JSON, Object, Array, String, Number, Error, isFinite });
  for (const f of files) if (has(f)) vm.runInContext(read(f), ctx);
  return window;
}
const DAY = 864e5, T0 = new Date(2026, 0, 5, 9, 0, 0).getTime();
const dayOf = (t) => Math.round((new Date(t).setHours(0, 0, 0, 0) - new Date(T0).setHours(0, 0, 0, 0)) / DAY);
const probeItem = (id) => ({ id, section: 'gchem', topic: 'probe', topicName: 'Probe', stem: 'probe ' + id, choices: ['a', 'b', 'c', 'd', 'e'], answer: 0 });
/* A miss, then a right answer on each due day: the days it came back on, and whether it cleared. */
function reviewProbe() {
  try {
    const R = sandbox(['shared/ace-record.js']).AceRecord, days = [];
    R.record({ item: probeItem('p1'), picked: 1, answer: 0, ok: false, at: T0 });
    for (let k = 0; k < 6; k++) {
      const e = R.repairEntry('p1'); if (!e || e.cleared) break;
      days.push(dayOf(e.due)); R.repairAnswer('p1', { ok: true, at: e.due + 3600e3 });
    }
    const e = R.repairEntry('p1'), gaps = days.map((d, i) => d - (i ? days[i - 1] : 0));
    return { gaps, cleared: !!(e && e.cleared) };
  } catch (err) { return { gaps: [], cleared: false, error: String(err && err.message) }; }
}
/* XP, streak and the 4 of 5 rule, by using them. */
function masteryProbe() {
  const out = { loaded: false, xp: false, dailyStreak: false, quickCheck: false, ring: false, canCheck: null };
  try {
    const w = sandbox(['shared/ace-record.js', 'shared/ace-mastery.js']), R = w.AceRecord, M = w.AceMastery;
    if (!R || !M) return out; out.loaded = true;
    const x0 = M.xp(T0).total; R.record({ item: probeItem('x1'), picked: 0, answer: 0, ok: true, at: T0 - DAY }); R.record({ item: probeItem('x2'), picked: 0, answer: 0, ok: true, at: T0 });
    out.xp = M.xp(T0).total > x0;
    out.dailyStreak = M.streak(T0).days === 2 && M.streak(T0 + 3 * DAY).days === 0;
    const three = M.saveCheck('gchem', 'probe', 3, 5, T0).mastered, four = M.saveCheck('gchem', 'probe', 4, 5, T0).mastered;
    const five = []; for (let i = 0; i < 5; i++) five.push(probeItem('c' + i));
    out.quickCheck = !three && four === true && M.pickCheck(five, 'gchem', 'probe').length === 5 && M.pickCheck(five.slice(1), 'gchem', 'probe').length === 0 && typeof M.runCheck === 'function';
    out.ring = typeof M.topicRing === 'function' && typeof M.strip === 'function';
    out.canCheck = (items, sec, key) => M.canCheck(items, sec, key);
  } catch (err) { out.error = String(err && err.message); }
  return out;
}
const REVIEW = reviewProbe(), MASTERY = masteryProbe();
const hubJs = src(['shared/ace-hub.js']), setJs = src(['shared/ace-set.js']);
/* Which hub pages really run the quick check: they load the shared hub and the mastery file. */
const hubPage = (home) => { const p = home.slice(1) + 'index.html', h = has(p) ? read(p) : ''; return /shared\/ace-hub\.js/.test(h) && /AceHub\.init/.test(h) && (/shared\/ace-mastery\.js/.test(h) || /ace-mastery\.js/.test(recordJs)); };
const SITE = {
  learnLinkedFromTopicRow: /learn|AceRoute|night/i.test(hubRow),
  quickCheck: MASTERY.quickCheck && /runCheck/.test(hubJs) && /data-check/.test(hubJs),
  quickCheckFromHubRow: /data-check/.test(hubJs) && /\?check=/.test(hubJs),
  quickCheckAfterDrill: /quick-check/.test(setJs) && /checkHref/.test(hubJs),
  repair: has('repair/index.html') && /r\.repair\[/.test(recordJs),
  repairSchedule137: REVIEW.cleared && REVIEW.gaps.join(',') === '1,3,7',
  repairScheduleDays: REVIEW.gaps,
  xp: MASTERY.xp && /ace-mastery\.js/.test(recordJs),
  dailyStreak: MASTERY.dailyStreak && /ace-mastery\.js/.test(recordJs),
  masteryRing: MASTERY.ring && /topicRing/.test(hubJs) && /\.strip\(/.test(hubJs),
  xpShownOn: /ace-mastery\.js/.test(recordJs) ? 'every page that loads shared/ace-record.js (toast on a right practice answer; pill in the shared bar)' : 'nowhere',
  arcadeRoundSeconds: ARCADE_SECONDS
};
void repairFn;
const gameMeta = {};
function gamePage(href) {
  const p = href.split('?')[0]; if (gameMeta[p]) return gameMeta[p];
  const f = p.endsWith('/') ? p + 'index.html' : p, s = has(f.slice(1)) ? read(f.slice(1)) : '';
  return (gameMeta[p] = { exists: !!s, score: /score/i.test(s), streak: /streak/i.test(s) });
}

/* ---------- phone run (scripts/measure-phone.mjs --out) ---------- */
let phone = { measured: null, pages: {} };
if (has(OUT_JSON)) { try { phone = json(OUT_JSON).phone || phone; } catch (e) { /* first run */ } }
if (arg('--phone')) {
  const raw = JSON.parse(fs.readFileSync(path.resolve(arg('--phone')), 'utf8'));
  const rows = Array.isArray(raw) ? raw : (raw.pages || raw.results || []);
  phone = { measured: new Date().toISOString().slice(0, 10), width: 390, pages: {} };
  for (const m of rows) phone.pages[m.page] = m.fail ? { fail: true } : { overflow: m.overflow || 0, under13: m.textUnder13 || 0, minText: m.minText, smallTaps: m.smallTaps || 0, errors: (m.errs || []).length };
}
function phoneOf(p) {
  if (!p) return null;
  const m = phone.pages[p] || phone.pages[p.split('?')[0]] || phone.pages[p.split('#')[0]];
  if (!m) return { page: p, state: 'not measured' };
  if (m.fail || m.overflow > 1 || m.errors) return { page: p, state: 'broken', why: m.fail ? 'did not load' : m.errors ? 'JavaScript error' : 'scrolls sideways by ' + m.overflow + ' px' };
  if (m.under13 > 0 || m.smallTaps > 0) return { page: p, state: 'small', why: [m.under13 ? m.under13 + '% of text under 13 px (smallest ' + m.minText + ')' : '', m.smallTaps ? m.smallTaps + (m.smallTaps === 1 ? ' tap target' : ' tap targets') + ' under 44 px' : ''].filter(Boolean).join(', ') };
  return { page: p, state: 'pass' };
}

/* ---------- helpers ---------- */
function asItem(raw, sec) {   /* same shape tests/visuals/coverage.test.js sweeps */
  const s = V.section(raw.section || sec), tp = String(raw.topic || 'general'), m = (TOPICS[s] || {})[tp];
  const it = { section: s, topic: m ? m[0] : tp, topicName: raw.topicName || (m ? m[1] : tp.replace(/-/g, ' ')), stem: '' };
  const sk = raw.skill ? { skillName: raw.skillName || raw.skill } : globalThis.AceSkills.tag(it);
  it.concept = sk.skillName; return it;
}
const GENERIC = new Set(['basic', 'general', 'question', 'type', 'with', 'from', 'that', 'this']);
const toks = (s) => new Set(V.norm(String(s).replace(/[-:+]/g, ' ')).split(' ').filter((w) => w.length >= 4 && !GENERIC.has(w)));
const jaccard = (a, b) => { let n = 0; a.forEach((w) => { if (b.has(w)) n++; }); return n ? n / (a.size + b.size - n) : 0; };
const top = (list) => { const c = {}; list.forEach((x) => { if (x) c[x] = (c[x] || 0) + 1; }); return Object.keys(c).sort((a, b) => c[b] - c[a])[0] || ''; };
const half = (x) => Math.round(x * 2) / 2;

/* ---------- topic list ---------- */
const topics = [];
for (const [sec] of SECTIONS.slice(0, 4)) {
  const groups = new Map();
  const dropped = new Set((TOPICS.excluded || {})[sec] || []);
  for (const [key, [canon, name]] of Object.entries(TOPICS[sec])) {
    if (dropped.has(key) || dropped.has(canon)) continue;
    if (!groups.has(canon)) groups.set(canon, { key: canon, name, keys: [] });
    groups.get(canon).keys.push(key);
  }
  for (const f of HUB[sec].banks) for (const it of bank[f]) if (!groups.has(it.topic) && !TOPICS[sec][it.topic]) groups.set(it.topic, { key: it.topic, name: it.topicName || it.topic, keys: [it.topic], notInTopicsJson: true });
  for (const g of groups.values()) topics.push(Object.assign({ section: sec }, g));
}
for (const [key, name] of PAT) topics.push({ section: 'pat', key, name, keys: [key] });
/* Reading question types, from the passages themselves. */
const rc = { n: 0, items: {}, passages: {}, why: {}, notes: {}, steps: {}, check: {} };
const RC_DIR = 'tools/rc/data/passages';
if (has(RC_DIR)) for (const f of fs.readdirSync(R(RC_DIR))) {
  if (!/\.json$/.test(f)) continue;
  const p = json(RC_DIR + '/' + f), seen = new Set(); rc.n++;
  for (const q of p.questions || []) {
    rc.items[q.type] = (rc.items[q.type] || 0) + 1; seen.add(q.type);
    const wrong = (q.choices || []).length - 1, dn = q.distractorNotes;
    const nNotes = Array.isArray(dn) ? dn.filter(Boolean).length : dn && typeof dn === 'object' ? Object.values(dn).filter(Boolean).length : 0;
    if (q.why && String(q.why).length >= 20) rc.why[q.type] = (rc.why[q.type] || 0) + 1;
    if (nNotes >= wrong) rc.notes[q.type] = (rc.notes[q.type] || 0) + 1;
    if (Array.isArray(q.steps) && q.steps.length >= 3) rc.steps[q.type] = (rc.steps[q.type] || 0) + 1;
    if (q.check && q.check.q) rc.check[q.type] = (rc.check[q.type] || 0) + 1;
  }
  seen.forEach((t) => { rc.passages[t] = (rc.passages[t] || 0) + 1; });
}
for (const key of Object.keys(rc.items).sort()) topics.push({ section: 'rc', key, name: RC_NAME[key] || key, keys: [key] });

/* ---------- pass 1: resolve the flow ---------- */
const scopeFile = has('scripts/bank/scope-exclusions.json') ? json('scripts/bank/scope-exclusions.json') : {};
for (const t of topics) {
  const sec = t.section, hub = HUB[sec];
  t.items = hub ? hub.banks.flatMap((f) => bank[f]).filter((it) => it.topic === t.key || t.keys.includes(it.topic)) : [];
  const skillName = top(t.items.map((it) => it.skillName));
  /* board */
  const probe = sec === 'pat' || sec === 'rc' ? { section: sec, topic: t.key, skill: t.key, topicName: sec === 'pat' ? t.name : '' } : asItem({ section: sec, topic: t.keys[0], topicName: t.name }, sec);
  t.match = V.match(probe);
  if (t.items.length) {   /* what the topic's own drill items open most often */
    const ms = t.items.map((it) => V.match(asItem(it, sec))).filter(Boolean), id = top(ms.map((x) => x.board ? 'b:' + x.board : 'u:' + x.url));
    if (id) t.match = ms.find((x) => (x.board ? 'b:' + x.board : 'u:' + x.url) === id);
  }
  /* learn */
  const L = Route.links({ section: sec, concept: [t.name, skillName].filter(Boolean).join(' '), topic: t.key.replace(/-/g, ' ') });
  t.learn = L.night ? { path: L.learn, night: L.night, title: L.nightTitle } : null;
  /* scope */
  for (const [word, keys] of Object.entries((SCOPE_WORDS[sec] || {}))) {
    if (keys.includes(t.key) && Object.values(scopeFile[sec] || {}).some((r) => String(typeof r === 'string' ? r : JSON.stringify(r)).includes(word))) t.scopeNote = word + ' listed as not named in the 2026 outline (scripts/bank/scope-exclusions.json)';
  }
}
/* who owns a shared board */
const shared = {};
for (const t of topics) if (t.match && t.match.board) (shared[t.match.board] = shared[t.match.board] || []).push(t);
for (const [id, list] of Object.entries(shared)) {
  if (list.length === 1) { list[0].boardOwn = true; continue; }
  const b = B.get(id), bt = toks(id + ' ' + (b ? b.title : ''));
  const ranked = list.map((t) => ({ t, s: jaccard(toks(t.key + ' ' + t.name), bt), exact: t.key === id ? 1 : 0 })).sort((a, c) => c.exact - a.exact || c.s - a.s || a.t.key.localeCompare(c.t.key));
  if (ranked[0].s > 0 || ranked[0].exact) ranked[0].t.boardOwn = true;
  list.forEach((t) => { t.boardShared = list.length - 1; });
}

/* ---------- pass 2: score ---------- */
const rows = topics.map((t) => {
  const sec = t.section, hub = HUB[sec], n = t.items.length, s = {}, note = {};
  const flow = { learn: null, board: null, drill: null, game: null, check: null, review: null };

  /* 1 learn */
  if (t.learn) { flow.learn = t.learn.path; s.learn = SITE.learnLinkedFromTopicRow ? 1 : 0.5; note.learn = SITE.learnLinkedFromTopicRow ? '' : 'Retold night ' + t.learn.night + ' teaches it, but the topic row has no lesson link and there is no one-screen lesson'; }
  else { s.learn = 0; note.learn = 'no lesson resolves for this topic'; }

  /* 2 whiteboard */
  const m = t.match;
  if (m && m.board) { flow.board = '/see/?b=' + m.board; s.whiteboard = t.boardOwn ? 1 : 0.5; note.whiteboard = t.boardOwn ? '' : 'opens the "' + m.board + '" board, shared with ' + t.boardShared + ' other topic' + (t.boardShared === 1 ? '' : 's') + '; needs its own board'; }
  else if (m) { flow.board = m.url; s.whiteboard = 0.5; note.whiteboard = 'opens a lab (' + m.url + '), not a whiteboard'; }
  else { s.whiteboard = 0; note.whiteboard = 'no board or visual resolves'; }

  /* 3 to 5 drill, explanation, see it */
  let drill = { count: n };
  if (sec === 'pat') {
    const page = 'tools/pat/' + t.key + '.html', html = has(page) ? read(page) : '', gen = has('tools/pat/engine/pat-' + t.key + '.js') || /mulberry32|seed/i.test(html);
    const explains = /PAT\.explain|drillHTML/.test(html), chip = explains && /ace-visuals\.js/.test(html);
    drill = { count: null, generator: gen }; flow.drill = html ? '/' + page : null;
    s.drill = gen && html ? 1 : 0; note.drill = s.drill ? '' : 'no generator drill page';
    s.explanation = explains ? 1 : 0; note.explanation = explains ? '' : 'drill page shows no worked explanation';
    s.seeIt = chip && m && m.board ? 1 : 0; note.seeIt = s.seeIt ? '' : (explains ? 'the drill explains each answer but shows no See it chip (ace-visuals.js is not loaded on ' + page + ')' : 'no See it chip');
    t.records = /AceRecord/.test(has('tools/pat/pat-ledger.js') ? read('tools/pat/pat-ledger.js') : '') && /pat-ledger\.js/.test(html);
  } else if (sec === 'rc') {
    const k = t.key, q = rc.items[k] || 0, p = rc.passages[k] || 0;
    drill = { count: q, passages: p }; flow.drill = '/tools/rc/#start/type/' + k;
    s.drill = p >= 10 ? 1 : p >= 5 ? 0.5 : 0; note.drill = s.drill === 1 ? '' : 'only ' + p + ' passages carry this question type (10 needed)';
    const parts = { answer: (rc.why[k] || 0) === q, traps: (rc.notes[k] || 0) === q, steps: (rc.steps[k] || 0) === q, check: (rc.check[k] || 0) === q }, got = Object.values(parts).filter(Boolean).length;
    s.explanation = got === 4 ? 1 : got >= 2 ? 0.5 : 0; drill.explanationParts = parts;
    note.explanation = got === 4 ? '' : 'passage questions carry ' + Object.keys(parts).filter((x) => parts[x]).join(' and ') + '; missing ' + Object.keys(parts).filter((x) => !parts[x]).join(' and ');
    const rcPage = src(['tools/rc/index.html', 'tools/rc/rc.js']), chip = /ace-test-review\.js/.test(rcPage) && /AceVisuals/.test(src(['shared/ace-test-review.js']));
    s.seeIt = chip && m && m.board ? 1 : 0; note.seeIt = s.seeIt ? '' : (m && m.board ? 'no See it chip in the Reading review' : 'no board teaches this question type, so no See it link');
    t.records = /ace-record\.js/.test(rcPage) && /AceRecord/.test(src(['shared/ace-test-review.js']));
  } else {
    flow.drill = n ? hub.drill(t.items[0].topic) : null;
    s.drill = n >= 20 ? 1 : n >= 10 ? 0.5 : 0; note.drill = s.drill === 1 ? '' : n + ' questions tagged (20 needed)';
    const served = t.items.filter(servedFull).length, drafted = t.items.filter(draftedFull).length;
    drill.explained = { served, drafted };
    s.explanation = !n ? 0 : served === n ? 1 : (drafted === n || served / n >= 0.5) ? 0.5 : 0;
    note.explanation = !n ? 'no drill items' : served === n ? '' : drafted === n ? 'all ' + n + ' walk-throughs are written to the standard but not served (review pending); ' + served + ' served in full'
      : drafted + ' of ' + n + ' items have a standard walk-through written; the rest show only an answer paragraph';
    const ms = t.items.map((it) => V.match(asItem(it, sec))), boards = ms.filter((x) => x && x.board).length, any = ms.filter(Boolean).length;
    drill.seeIt = { board: boards, anyVisual: any, ownBoard: m && m.board ? ms.filter((x) => x && x.board === m.board).length : 0 };
    const chip = /AceVisuals\.chip/.test(src(['shared/ace-question.js']));
    s.seeIt = !n || !chip ? 0 : boards === n ? 1 : (any === n || boards / n >= 0.5) ? 0.5 : 0;
    note.seeIt = !n ? 'no drill items to link from' : s.seeIt === 1 ? '' : boards + ' of ' + n + ' items open a whiteboard' + (any > boards ? ', ' + (any - boards) + ' open a lab' : '') + (n > any ? ', ' + (n - any) + ' open nothing' : '');
    t.records = n > 0 && /AceRecord/.test(src(['shared/ace-set.js', 'shared/ace-question.js']));
    const canon = [...new Set(t.items.map((it) => it.canon).filter(Boolean))];
    drill.privateSameSkill = canon.reduce((a, c) => a + (privateBySkill[c] || 0), 0);
  }

  /* 6 game */
  const games = [];
  const b = m && m.board ? B.get(m.board) : null, pl = b ? B.play(b) : null;
  if (pl) { const g = gamePage(pl.href); if (g.exists) games.push({ href: pl.href, score: g.score && g.streak ? 1 : 0.5, why: g.score && g.streak ? '' : 'the ' + pl.label.replace('Play a round: ', '') + ' game has no streak' }); }
  if (sec === 'pat' && t.key === 'tfe' && has('games/six-views/index.html')) { const g = gamePage('/games/six-views/'); games.push({ href: '/games/six-views/', score: g.score && g.streak ? 1 : 0.5, why: 'Six Views has no streak' }); }
  if (hub) {
    const count = sec === 'ochem' ? Object.entries(arcade.ochem).filter(([g]) => OCHEM_ARCADE[t.key] && OCHEM_ARCADE[t.key].test(g)).reduce((a, [, c]) => a + c, 0) : [...new Set(t.keys.concat(t.key))].reduce((a, k) => a + (arcade[hub.arcade][k] || 0), 0);
    if (count) games.push({ href: '/games/play.html?subject=' + hub.arcade, arcadeItems: count, score: 0.5, why: 'only the mixed arcade carries it (' + count + ' questions; a round runs up to ' + ARCADE_SECONDS + ' s across all topics)' });
    t.arcadeItems = count;
  }
  games.sort((a, c) => c.score - a.score);
  if (hub && s.drill < 1 && t.arcadeItems >= 20) note.drill += '; the arcade bank holds ' + t.arcadeItems + ' under this key, which the drill does not serve';
  if (games.length) { flow.game = games[0].href; s.game = games[0].score; note.game = games[0].why; } else { s.game = 0; note.game = 'no game includes this topic'; }

  /* 7 quick check: the hub runs it for this topic only when the topic has 5 public questions */
  const checkKey = hub && SITE.quickCheck && hubPage(hub.page || hub.home) ? [...new Set([t.key].concat(t.keys))].find((k) => MASTERY.canCheck(t.items, t.items[0] ? t.items[0].section : sec, k)) : null;
  if (checkKey) { flow.check = (hub.page || hub.home) + '?check=' + checkKey; s.quickCheck = SITE.quickCheckFromHubRow && SITE.quickCheckAfterDrill ? 1 : 0.5; note.quickCheck = s.quickCheck === 1 ? '' : 'the check runs, but it is not offered from both the topic row and the end of a drill'; }
  else { s.quickCheck = 0; note.quickCheck = !SITE.quickCheck ? 'no 5-question mastery check exists on the site' : !hub ? 'the quick check draws from a question bank; this section drills from ' + (sec === 'pat' ? 'a generator' : 'passages') + ', so it has none' : n + ' public questions under this topic; the check needs 5'; }

  /* 8 review */
  if (SITE.repair && t.records) { flow.review = '/repair/'; s.review = SITE.repairSchedule137 ? 1 : 0.5; note.review = SITE.repairSchedule137 ? '' : 'misses reach Repair, but a miss returns after ' + SITE.repairScheduleDays.join(', ') + ' days' + (REVIEW.cleared ? '' : ' and never clears') + '; not the 1, 3, 7 day schedule'; }
  else { s.review = 0; note.review = SITE.repair ? 'no drill writes this topic to the record, so nothing reaches Repair' : 'no Repair'; }

  /* 9 engagement: XP and the streak come from answers on the shared record, so they count only
     where this topic's drill writes to it; the ring shows the topic's quick check, so it counts
     only where there is one. */
  const eng = { xp: SITE.xp && !!t.records, dailyStreak: SITE.dailyStreak && !!t.records, masteryRing: SITE.masteryRing && !!checkKey, firstWin: !!(flow.drill || (m && m.board)) }, got = Object.values(eng).filter(Boolean).length;
  s.engagement = got === 4 ? 1 : got >= 2 ? 0.5 : 0;
  note.engagement = got === 4 ? '' : 'missing ' + [['xp', 'XP'], ['dailyStreak', 'a daily streak'], ['masteryRing', 'a mastery ring (it needs a quick check)'], ['firstWin', 'a question one tap away']].filter(([k]) => !eng[k]).map((x) => x[1]).join(', ');

  /* 10 phone and correctness */
  const pages = [...new Set([flow.learn && flow.learn.split('?')[0], m && m.board ? '/see/?b=' + m.board : null, flow.drill && (sec === 'rc' ? '/tools/rc/' : flow.drill.split('?')[0]), flow.game].filter(Boolean))];
  const ph = pages.map(phoneOf), broken = ph.filter((x) => x.state === 'broken'), small = ph.filter((x) => x.state === 'small'), un = ph.filter((x) => x.state === 'not measured');
  const defective = t.items.filter((it) => (scopeFile[sec] || {})[it.id]).map((it) => it.id);
  if (t.scopeNote) { s.phone = 0; note.phone = t.scopeNote + '; drop the topic or confirm it is in scope'; }
  else if (!pages.length) { s.phone = 0; note.phone = 'no page to measure'; }
  else if (broken.length || defective.length) { s.phone = 0; note.phone = broken.map((x) => x.page + ' ' + x.why).concat(defective.map((id) => id + ' is listed defective or out of scope')).join('; '); }
  else if (small.length || un.length) { s.phone = 0.5; note.phone = small.map((x) => x.page + ': ' + x.why).concat(un.length ? ['not measured at 390 px: ' + un.map((x) => x.page).join(', ')] : []).join('; '); }
  else { s.phone = 1; note.phone = ''; }

  const total = half(CHECKS.reduce((a, c) => a + s[c], 0));
  const out = { key: t.key, section: sec, name: t.name, keys: t.keys, flow, board: m && m.board ? m.board : null, drill, arcadeItems: t.arcadeItems || 0, scores: s, total, weakest: [], needs: Object.fromEntries(CHECKS.filter((c) => s[c] < 1).map((c) => [c, note[c]])) };
  if (t.notInTopicsJson) out.notInTopicsJson = true;
  if (t.scopeNote) out.scopeNote = t.scopeNote;
  return out;
});

/* ---------- summary ---------- */
const avg = (list) => list.length ? Math.round(list.reduce((a, r) => a + r.total, 0) / list.length * 100) / 100 : 0;
const summary = { topics: rows.length, average: avg(rows), at10: rows.filter((r) => r.total === 10).length, sections: {}, checkAverages: {}, zeroSiteWide: [] };
for (const [sec, name] of SECTIONS) { const l = rows.filter((r) => r.section === sec); summary.sections[sec] = { name, topics: l.length, average: avg(l), at10: l.filter((r) => r.total === 10).length, best: Math.max(...l.map((r) => r.total)), worst: Math.min(...l.map((r) => r.total)) }; }
for (const c of CHECKS) { summary.checkAverages[c] = Math.round(rows.reduce((a, r) => a + r.scores[c], 0) / rows.length * 100) / 100; if (rows.every((r) => r.scores[c] === 0)) summary.zeroSiteWide.push(c); }
/* weakest check per topic, leaving out the checks that are zero for every topic */
for (const r of rows) { const own = CHECKS.filter((c) => !summary.zeroSiteWide.includes(c)), lo = Math.min(...own.map((c) => r.scores[c])); r.weakest = lo < 1 ? own.filter((c) => r.scores[c] === lo) : []; }
const totals = { items: 0, served: 0, drafted: 0 };
for (const r of rows) if (r.drill.explained) { totals.items += r.drill.count; totals.served += r.drill.explained.served; totals.drafted += r.drill.explained.drafted; }
summary.explanations = totals;
const lowest = rows.slice().sort((a, b) => a.total - b.total || a.section.localeCompare(b.section) || a.key.localeCompare(b.key)).slice(0, 15);

const result = { format: 1, definition: 'docs/perfect-topic.md', note: 'Generated by scripts/topic-scorecard.mjs (npm run scorecard). Ids, counts and topic keys only.', site: SITE, phone, summary, topics: rows };

/* ---------- the doc ---------- */
function md() {
  const def = has('docs/perfect-topic.md') ? read('docs/perfect-topic.md').split('\n').filter((l) => /^\d+\. /.test(l)) : [];
  const L = [];
  const short = (r) => { const lo = r.weakest.length ? r.scores[r.weakest[0]] : 1, names = r.weakest.slice(0, 3).map((c) => CHECK_NAME[c]).join(', ') + (r.weakest.length > 3 ? ' and ' + (r.weakest.length - 3) + ' more' : ''); return r.weakest.length ? names + ' (' + lo + ')' : 'none'; };
  L.push('# Topic scorecard', '', 'Generated by `npm run scorecard` (scripts/topic-scorecard.mjs). Do not edit by hand. The numbers live in scripts/topic-scorecard.json.', '',
    '## The definition', '', 'From docs/perfect-topic.md: ten checks, one point each, half a point when partly met. 10 of 10 means every check is met. 11 of 10 adds a person checking the deployed preview on a phone and a desktop, which no script can award.', '');
  def.forEach((l) => L.push(l));
  L.push('', 'Flow every topic follows: Learn, Whiteboard, Drill, Game, Quick check, Review (Repair).', '',
    '## Where the site stands', '', '| Section | Topics | Average | Best | Worst | At 10 of 10 |', '|---|---|---|---|---|---|');
  for (const [sec] of SECTIONS) { const x = summary.sections[sec]; L.push(`| ${x.name} | ${x.topics} | ${x.average.toFixed(2)} | ${x.best} | ${x.worst} | ${x.at10} |`); }
  L.push(`| All | ${summary.topics} | ${summary.average.toFixed(2)} | ${Math.max(...rows.map((r) => r.total))} | ${Math.min(...rows.map((r) => r.total))} | ${summary.at10} |`, '',
    'Average points per check, across all ' + summary.topics + ' topics (1.00 is the most):', '', '| Check | Average |', '|---|---|');
  CHECKS.forEach((c, i) => L.push(`| ${i + 1}. ${CHECK_NAME[c]} | ${summary.checkAverages[c].toFixed(2)} |`));
  L.push('', '### Site-wide features, and what is still missing', '');
  const withCheck = rows.filter((r) => r.scores.quickCheck > 0).length;
  if (SITE.quickCheck) L.push('- Quick check: ' + withCheck + ' of ' + rows.length + ' topics have one (5 questions from the topic\'s public drill bank, mastered at 4 of 5, offered on the hub topic row and at the end of a drill). The rest score 0: Perceptual Ability and Reading drill from generators and passages, not a question bank, and a science or QR topic needs 5 public questions.');
  if (!SITE.quickCheck) L.push('- Quick check: there is no 5-question check that marks a topic mastered at 4 of 5. Every topic scores 0. A whiteboard ends on three Try it questions, which count toward the Whiteboard check, not this one.');
  if (SITE.xp && SITE.dailyStreak && SITE.masteryRing) L.push('- Engagement: XP (10 per right answer, 50 per mastered topic) and a daily streak come from the shared answer record; a mastery ring shows per topic and per section on the hubs. A topic without a quick check has no ring and tops out at 0.5.');
  if (SITE.repairSchedule137) L.push('- Review loop: checked by running shared/ace-record.js: a miss came back ' + SITE.repairScheduleDays.join(', ') + ' days apart and cleared after the last return was answered right.');
  const missEng = [!SITE.xp && 'XP', !SITE.dailyStreak && 'a daily streak', !SITE.masteryRing && 'a mastery ring per topic'].filter(Boolean);
  if (missEng.length) L.push('- Engagement: ' + missEng.join(', ') + ' do not exist anywhere in the shell' + (missEng.length === 3 ? ', so every topic scores 0. The only part met is a question one tap away.' : '.'));
  if (!SITE.learnLinkedFromTopicRow) L.push('- Learn, one tap: the hub topic row has a Practice button only. No topic links its lesson, and there is no one-screen lesson per topic, so Learn tops out at 0.5 (a Retold night that covers the topic).');
  if (SITE.repair && !SITE.repairSchedule137) L.push('- Review loop, 1, 3, 7 days: Repair exists and takes every miss, but a miss returns after ' + SITE.repairScheduleDays.join(' or ') + ' days and clears after 2 wins on different days. Review tops out at 0.5.');
  L.push('- Explanation standard, served: of ' + totals.items + ' science and QR drill questions, ' + totals.served + ' are served with all four parts (answer line, steps, a trap per wrong choice, check question) and ' + totals.drafted + ' have a full walk-through written in a sidecar that is still review pending.', '');
  if (summary.zeroSiteWide.length) L.push('The weakest check in each table below leaves out ' + summary.zeroSiteWide.map((c) => CHECK_NAME[c]).join(' and ') + ', which are 0 for every topic.', '');
  L.push('### How the phone point was measured', '', phone.measured ? `scripts/measure-phone.mjs at 390 px on ${phone.measured}: ${Object.keys(phone.pages).length} pages (hubs, Retold courses, every whiteboard, every board game, the arcade, the PAT and Reading tools). A topic gets the point when every page in its flow has no sideways scroll, no text under 13 px, no tap target under 44 px and no JavaScript error. Wrong keys and DAT scope are held by \`npm run test:gates\` and \`npm run test:banks\`; a topic also loses the point when the scope file lists it or one of its items.` : 'No phone run is stored. Run scripts/measure-phone.mjs with --out and pass the file with --phone.', '');
  for (const [sec, name] of SECTIONS) {
    const l = rows.filter((r) => r.section === sec).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
    L.push(`## ${name} (${l.length} topics, average ${summary.sections[sec].average.toFixed(2)})`, '', '| Topic | Key | Score | Weakest check |', '|---|---|---|---|');
    l.forEach((r) => L.push(`| ${r.name} | ${r.key} | ${r.total} | ${short(r)} |`));
    L.push('');
  }
  L.push('## The 15 lowest topics and what each needs', '');
  lowest.forEach((r, i) => {
    L.push(`${i + 1}. **${r.name}** (${r.section}, \`${r.key}\`), ${r.total} of 10. ` + CHECKS.filter((c) => r.scores[c] < 1 && !summary.zeroSiteWide.includes(c)).map((c) => `${CHECK_NAME[c]} ${r.scores[c]}: ${r.needs[c]}`).join('. ') + '.');
  });
  if (summary.zeroSiteWide.length) L.push('', 'Every topic above also needs ' + summary.zeroSiteWide.map((c) => CHECK_NAME[c]).join(' and ') + ', which do not exist site-wide.');
  L.push('', '## Notes on the topic list', '',
    '- data/topics.json keys that point at one canonical id are one topic (Biology: ' + Object.keys(TOPICS.bio).length + ' keys, ' + rows.filter((r) => r.section === 'bio').length + ' topics).',
    '- QR: ' + rows.filter((r) => r.notInTopicsJson).length + ' topic keys come from the QR drill bank (data/qr-climb.json) and are not in data/topics.json. They are kept as their own rows because the data does not say they are the same topics.',
    '- ' + rows.filter((r) => HUB[r.section] && r.drill.count === 0).length + ' science and QR topics have no question in their hub drill bank at all (' + rows.filter((r) => r.section === 'qr' && r.drill.count === 0).length + ' of them in QR); ' + rows.filter((r) => HUB[r.section] && r.drill.count === 0 && r.arcadeItems > 0).length + ' of those have questions under the same key in the arcade bank (games/), which the drill does not serve.',
    '- Left out of the list: ' + (Object.entries(TOPICS.excluded || {}).map(([k, v]) => k.toUpperCase() + ' ' + v.map((x) => '`' + x + '`').join(', ')).join('; ') || 'nothing') + ' (scripts/bank/scope-topics.json: not named in the 2026 outline, removed from the topic list, the drills and the arcade).',
    '- Drill depth counts the public banks (data/*.json and the free samples). The arcade banks in games/ hold more questions per key and count toward the Game check only.');
  const scoped = rows.filter((r) => r.scopeNote);
  if (scoped.length) L.push('- Scope: ' + scoped.map((r) => '`' + r.key + '`').join(', ') + ' are listed by the scope audit as not named in the 2026 QR outline, yet they are still topic keys' + (scoped.some((r) => r.arcadeItems) ? ' and the QR arcade bank still carries questions under them' : '') + '. They score 0 on check 10 until they are dropped or confirmed.');
  return L.join('\n') + '\n';
}

if (!argv.includes('--no-write')) {
  const head = JSON.stringify(Object.assign({}, result, { topics: [] }), null, 1);
  fs.writeFileSync(R(OUT_JSON), head.replace(/"topics": \[\]\n\}$/, '"topics": [\n' + rows.map((r) => '  ' + JSON.stringify(r)).join(',\n') + '\n ]\n}') + '\n');
  fs.mkdirSync(R('docs'), { recursive: true });
  fs.writeFileSync(R(OUT_MD), md());
}

/* ---------- print ---------- */
console.log('Topic scorecard: ' + rows.length + ' topics, average ' + summary.average.toFixed(2) + ' of 10, ' + summary.at10 + ' at 10 of 10');
for (const [sec] of SECTIONS) { const x = summary.sections[sec]; console.log('  ' + x.name.padEnd(24) + String(x.topics).padStart(3) + ' topics  average ' + x.average.toFixed(2) + '  best ' + x.best + '  worst ' + x.worst); }
console.log('Check averages: ' + CHECKS.map((c) => c + ' ' + summary.checkAverages[c].toFixed(2)).join(', '));
console.log('Zero for every topic: ' + (summary.zeroSiteWide.join(', ') || 'none'));
console.log('Lowest 15:');
lowest.forEach((r) => console.log('  ' + String(r.total).padStart(4) + '  ' + (r.section + ' ' + r.key).padEnd(34) + CHECKS.filter((c) => r.scores[c] === 0).join(', ')));
if (!argv.includes('--no-write')) console.log('Wrote ' + OUT_JSON + ' and ' + OUT_MD);
