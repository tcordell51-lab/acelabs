// The whole study loop, end to end, as a fresh student, in headless Chrome at phone width.
//
//   npm run test:e2e                         (or: node tests/e2e/loop.e2e.mjs [--shots DIR])
//   CHROME_PATH=/path/to/chrome npm run test:e2e
//
// 1. Today sends a new student to the diagnostic.
// 2. The diagnostic, answered through its own buttons, with misses on purpose in Biology, Gen Chem,
//    OChem and QR (most in OChem and Gen Chem).
// 3. It ends in the question-by-question review; every miss gets one of the five shared reasons.
// 4. The miss count is the same on Today, Repair and Progress, and Progress shows 15 answers in
//    each of the four sections. Today's plan changed: the first practice step is OChem or Gen Chem.
// 5. Repair holds the misses as new versions (same skill or topic, another question).
// 6. Next day: beat a miss once (win 1). Two days later: beat it again; it clears.
// 7. Adaptive: the next practice set leans to the missed skills, and after a run of wins in one
//    topic the set picks harder questions than before.
// 8. Crawl: every page the tab bar reaches, and every page linked from those, has the shared bar
//    and the tab bar at phone width, and no page scrolls sideways at 390, 768 or 1280 px.
// Screenshots of each step (phone width) go to --shots DIR when given.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { start } from './server.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const SHOTS = args.includes('--shots') ? path.resolve(args[args.indexOf('--shots') + 1]) : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

let chromium;
try { ({ chromium } = await import('playwright')); } catch { ({ chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core')); }
const exe = process.env.CHROME_PATH || (fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);

const DAY = 864e5;
const T0 = new Date(2026, 10, 16, 10, 0, 0).getTime();   // Monday, Nov 16 2026, 10:00 local
const PHONE = { width: 390, height: 844 };
const results = [];
function ok(name, detail) { results.push({ name, ok: true, detail }); console.log('  pass  ' + name + (detail ? '  (' + detail + ')' : '')); }

// answers for every bank item, so the script can answer a served question on purpose
const ANSWER = {};
for (const f of fs.readdirSync(path.join(ROOT, 'data')).filter((x) => x.endsWith('.json') && x !== 'topics.json' && x !== 'oc-3d.json')) {
  const b = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'));
  for (const it of b.items || []) ANSWER[it.id] = it.answer;
}

const { server, url: BASE } = await start(0);
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: PHONE, deviceScaleFactor: 2 });
await context.route('**/*', (route) => (route.request().url().startsWith(BASE) ? route.continue() : route.abort()));
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(page.url() + ': ' + e.message));
page.on('dialog', (d) => d.accept());
await page.clock.setFixedTime(T0);

let shotN = 0;
async function shot(name) {
  if (!SHOTS) return;
  shotN += 1;
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(SHOTS, String(shotN).padStart(2, '0') + '-' + name + '.png'), fullPage: false });
}
async function go(p) { await page.goto(BASE + p, { waitUntil: 'load' }); await page.waitForTimeout(300); }
const R = (fn, arg) => page.evaluate(fn, arg);

try {
  // ---------- 1. a fresh student lands on Today ----------
  await go('/');
  assert.equal(await page.getAttribute('#t-go', 'data-step'), 'diagnostic');
  assert.equal(await page.getAttribute('#t-counts', 'data-miss-open'), '0');
  await shot('today-fresh');
  ok('a fresh student is sent to the diagnostic first');

  // ---------- 2. the diagnostic, through its own buttons ----------
  await go('/diagnostic.html');
  await page.waitForSelector('#btnStart', { state: 'visible' });
  const lede = await page.textContent('#screenIntro .lede');
  assert.match(lede, /^60 questions: 15 Biology, 15 General Chemistry, 15 Organic Chemistry and 15 Quantitative Reasoning/);
  const pills = await page.$$eval('.diag-section-pill', (els) => els.map((e) => e.textContent.replace(/\s+/g, ' ').trim()));
  assert.ok(pills.every((t) => /15 questions$/.test(t)), 'every section tile says 15: ' + pills.join(' | '));
  await shot('diagnostic-intro');
  await page.click('#btnStart');
  const pool = await R(() => pool.map((q) => ({ id: q.id, section: q.section, topic: q.topic, correct: q.correct, n: q.opts.length })));
  assert.equal(pool.length, 60, 'the diagnostic serves 60');
  ok('the diagnostic copy says 60, and it serves 60 (15 per section)');
  // misses on purpose: Bio 2, Gen Chem 5, OChem 6, QR 2
  const MISS = { BIO: 2, GC: 5, OCHEM: 6, QR: 2 }, seen = {}, missIdx = [];
  for (let i = 0; i < pool.length; i++) {
    const q = pool[i], s = String(q.section).toUpperCase();
    seen[s] = (seen[s] || 0) + 1;
    const miss = seen[s] <= (MISS[s] || 0);
    const pick = miss ? (q.correct + 1) % q.n : q.correct;
    if (miss) missIdx.push(i);
    await page.click('#qOpts .diag-opt:nth-child(' + (pick + 1) + ')');
    if (i === 20) await shot('diagnostic-question');
    if (i < pool.length - 1) await page.click('#btnNext');
  }
  await page.click('#btnSubmit');
  await page.waitForURL(/\/review\/\?run=/, { timeout: 15000 });
  await page.waitForSelector('.rv-q');
  const totalMiss = missIdx.length;
  ok('diagnostic answered through its buttons', totalMiss + ' misses on purpose in 4 sections');

  // ---------- 3. question-by-question review with the shared reasons ----------
  const h1 = await page.textContent('h1');
  assert.equal(h1.trim(), (60 - totalMiss) + ' of 60 right');
  const cards = await page.$$('.rv-q.miss');
  assert.equal(cards.length, totalMiss, 'one review card per miss');
  const reasons = await page.$$eval('.rv-q.miss:first-child .rv-reason__b', (b) => b.map((x) => x.textContent));
  assert.deepEqual(reasons, ["Didn't know it", 'Fell for a trap', 'Misread it', 'Ran short on time', 'Changed my answer']);
  await shot('review-misses');
  // tag every miss: the first OChem miss "Ran short on time" (back tomorrow); the rest cycle the five
  const CYCLE = ['trap', 'misread', 'changed', 'know', 'time'];
  let target = null;
  for (let k = 0; k < cards.length; k++) {
    const c = cards[k], sec = await c.getAttribute('data-section');
    let why = CYCLE[k % CYCLE.length];
    if (!target && sec === 'ochem') { why = 'time'; target = Number(await c.getAttribute('data-row')); }
    await c.$('button[data-reason="' + why + '"]').then((b) => b.click());
  }
  const tagged = await page.$$eval('.rv-reason__b[aria-pressed="true"]', (x) => x.length);
  assert.equal(tagged, totalMiss);
  await page.locator('.rv-q.miss').nth(2).scrollIntoViewIfNeeded();
  await shot('review-tagged');
  const targetId = await R((n) => { const run = AceRecord.runs().slice(-1)[0]; return run.rows[n - 1].id; }, target);
  ok('every miss tagged with one of the five shared reasons', 'target OChem miss ' + targetId);

  // ---------- 4. the same numbers everywhere ----------
  await go('/');
  const todayOpen = Number(await page.getAttribute('#t-counts', 'data-miss-open'));
  const step0 = await page.getAttribute('#t-go', 'data-step');
  const practice = await page.$eval('.plan-step[data-step="practice"]', (a) => ({ topic: a.getAttribute('data-topic'), href: a.getAttribute('href'), title: a.textContent }));
  await shot('today-after-diagnostic');
  await go('/repair/');
  const repairOpen = Number(await page.textContent('#n-open'));
  await shot('repair-day0');
  await go('/progress/');
  const progOpen = Number(await page.getAttribute('#p-misses', 'data-miss-open'));
  const perSec = await page.$$eval('.sec-row', (r) => Object.fromEntries(r.map((x) => [x.getAttribute('data-section'), Number(x.getAttribute('data-answers'))])));
  await shot('progress-after-diagnostic');
  assert.equal(todayOpen, totalMiss); assert.equal(repairOpen, totalMiss); assert.equal(progOpen, totalMiss);
  ok('miss count matches on Today, Repair and Progress', String(totalMiss));
  for (const s of ['bio', 'gchem', 'ochem', 'qr']) assert.equal(perSec[s], 15, s + ' answers on Progress');
  ok('Progress shows real counts per section', JSON.stringify(perSec));
  assert.notEqual(step0, 'diagnostic', 'Today no longer starts with the diagnostic');
  const [psec] = practice.topic.split('|');
  assert.ok(['ochem', 'gchem'].includes(psec), "Today's practice step goes to a missed section: " + practice.topic);
  ok("Today's plan changed: practice goes to the weakest missed topic", practice.topic + ' -> ' + practice.href);

  // the next practice set follows that topic
  await go(practice.href);
  await page.waitForSelector('[data-item]');
  const firstSetItem = await page.$eval('[data-item]', (e) => ({ id: e.getAttribute('data-item'), d: Number(e.getAttribute('data-difficulty')) }));
  const setTopic = await R((id) => fetch(id.startsWith('oc:') ? '/data/ochem.json' : '/data/gchem.json').then((r) => r.json()).then((b) => b.items.find((x) => x.id === id).topic), firstSetItem.id);
  assert.equal(psec + '|' + setTopic, practice.topic);
  await shot('practice-set-weakest-topic');
  ok('the next practice set leans to the missed skill', practice.topic + ', first item difficulty ' + firstSetItem.d);

  // ---------- 5. Repair holds them as new versions ----------
  const entries = await R(() => AceRecord.repairList().open.map((e) => ({ id: e.id, section: e.section, skill: e.skill, reason: e.reason, data: !!e.itemData })));
  assert.equal(entries.length, totalMiss);
  assert.ok(entries.every((e) => e.reason), 'every entry carries its reason');
  assert.ok(entries.every((e) => e.data), 'every entry keeps its own text, so it can always come back');
  assert.deepEqual([...new Set(entries.map((e) => e.section))].sort(), ['bio', 'gchem', 'ochem', 'qr']);
  ok('Repair holds every diagnostic miss, with skill and reason', entries.length + ' entries in 4 sections');

  // ---------- 6. day +1: win 1 ----------
  await page.clock.setFixedTime(T0 + DAY);
  await go('/repair/');
  const dueDay1 = Number(await page.textContent('#n-due'));
  assert.ok(dueDay1 >= 1);
  let sawTarget = false, versions = [];
  for (let guard = 0; guard < 40; guard++) {
    const entry = await page.getAttribute('#now', 'data-entry');
    if (!entry) break;
    const skip = await page.$('button:has-text("Answer without it")'); if (skip) await skip.click();
    const served = await page.getAttribute('#now [data-item]', 'data-item');
    const ver = await page.getAttribute('.tag-back', 'data-version'), match = await page.getAttribute('.tag-back', 'data-match');
    versions.push({ entry, served, ver, match });
    if (entry === targetId) { sawTarget = true; await shot('repair-day1-new-version'); }
    const ans = ANSWER[served] != null ? ANSWER[served] : await R((id) => (AceRecord.repairEntry(id).itemData || {}).answer, entry);
    await page.locator('#now [role="radio"]').nth(ans).click();
    await page.click('#now button[data-act="check"]');
    await page.waitForSelector('#now button[data-act="next"]');
    if (entry === targetId) await shot('repair-day1-win1');
    await page.click('#now button[data-act="next"]');
    await page.waitForTimeout(150);
  }
  assert.ok(sawTarget, 'the target miss was due on day 1');
  const tv = versions.find((v) => v.entry === targetId);
  assert.equal(tv.ver, 'new'); assert.notEqual(tv.served, targetId);
  assert.ok(['skill', 'topic'].includes(tv.match));
  const newShare = versions.filter((v) => v.ver === 'new').length;
  ok('day 1: misses come back as new versions', newShare + ' of ' + versions.length + ' new; target matched by ' + tv.match + ' (' + tv.served + ')');
  const t1 = await R((id) => AceRecord.repairEntry(id), targetId);
  assert.equal(t1.wins.length, 1); assert.ok(!t1.cleared);
  ok('day 1: one unassisted win on the target, not cleared yet');

  // ---------- 7. day +3: win 2, cleared ----------
  await page.clock.setFixedTime(T0 + 3 * DAY);
  await go('/repair/');
  let cleared = false;
  for (let guard = 0; guard < 40; guard++) {
    const entry = await page.getAttribute('#now', 'data-entry');
    if (!entry) break;
    const skip = await page.$('button:has-text("Answer without it")'); if (skip) await skip.click();
    const served = await page.getAttribute('#now [data-item]', 'data-item');
    if (entry === targetId) await shot('repair-day3-second-win');
    const ans = ANSWER[served] != null ? ANSWER[served] : await R((id) => (AceRecord.repairEntry(id).itemData || {}).answer, entry);
    await page.locator('#now [role="radio"]').nth(ans).click();
    await page.click('#now button[data-act="check"]');
    await page.waitForSelector('#now button[data-act="next"]');
    if (entry === targetId) { cleared = !!(await R((id) => AceRecord.repairEntry(id).cleared, targetId)); }
    await page.click('#now button[data-act="next"]');
    await page.waitForTimeout(150);
  }
  assert.ok(cleared, 'the target cleared after the second win on a different day');
  const openAfter = Number(await page.textContent('#n-open'));
  assert.ok(openAfter < totalMiss);
  await shot('repair-day3-cleared');
  ok('day 3: second win on a different day clears it', 'open in Repair ' + totalMiss + ' -> ' + openAfter);

  // assisted: See it before answering means no win that day (decision documented in ace-record.js)
  const assistedSaved = await R(() => AceRecord.attempts().every((a) => typeof a.assisted === 'boolean'));
  assert.ok(assistedSaved); ok('every attempt row carries the assisted flag');

  // counts still agree after the wins
  const after = {};
  await go('/'); after.today = Number(await page.getAttribute('#t-counts', 'data-miss-open')); await shot('today-day3');
  await go('/progress/'); after.progress = Number(await page.getAttribute('#p-misses', 'data-miss-open')); await shot('progress-day3');
  await go('/repair/'); after.repair = Number(await page.textContent('#n-open'));
  assert.equal(after.today, after.repair); assert.equal(after.progress, after.repair);
  ok('after the wins, Today, Repair and Progress still agree', JSON.stringify(after));

  // ---------- 8. adaptive: after a run of wins the set gets harder ----------
  // the section the plan sent the student to; its largest topic, so there are enough unseen items
  const hub = psec === 'ochem' ? '/oc/' : '/gc/', bankFile = psec === 'ochem' ? 'ochem.json' : 'gchem.json';
  const sizes = {}; for (const it of JSON.parse(fs.readFileSync(path.join(ROOT, 'data', bankFile), 'utf8')).items) sizes[it.topic] = (sizes[it.topic] || 0) + 1;
  const topic = Object.keys(sizes).sort((a, b) => sizes[b] - sizes[a])[0];
  async function setDifficulty() {
    await go(hub + '?topic=' + encodeURIComponent(topic));
    await page.waitForSelector('[data-item]');
    return R(([bank, t]) => fetch(bank).then((r) => r.json()).then((b) => {
      const pool = b.items.filter((x) => x.topic === t && !AceRecord.item(x.id));
      const order = AceRecord.pickNear(pool, { random: () => 0.5 }).slice(0, 4);
      return order.reduce((n, x) => n + x.difficulty, 0) / order.length;
    }), [psec === 'ochem' ? '/data/ochem.json' : '/data/gchem.json', topic]);
  }
  const d0 = await setDifficulty();
  // a run of right answers in that topic, through the set itself
  await page.clock.setFixedTime(T0 + 4 * DAY);
  for (let k = 0; k < 8; k++) {
    if (!(await page.$('#stage [role="radio"]'))) break;   // the set ended
    const id = await page.getAttribute('#stage [data-item]', 'data-item');
    await page.locator('#stage [role="radio"]').nth(ANSWER[id]).click();
    await page.click('#stage button[data-act="check"]');
    await page.waitForSelector('#stage button[data-act="next"]');
    if (k === 7) await shot('practice-set-wins');
    await page.click('#stage button[data-act="next"]');
  }
  const d1 = await setDifficulty();
  await shot('practice-set-harder');
  assert.ok(d1 > d0, 'mean difficulty of the next picks rose: ' + d0 + ' -> ' + d1);
  ok('after a run of wins the set picks harder questions', 'mean difficulty of the next four ' + d0.toFixed(2) + ' -> ' + d1.toFixed(2));

  // ---------- 9. labs and questions, both ways ----------
  await go('/labs/');
  await page.waitForFunction(() => document.querySelectorAll('a[data-try]').length > 10);
  const tries = await page.$$eval('.lab-card', (c) => c.map((x) => !!x.querySelector('a.lab-try')));
  assert.ok(tries.length > 0 && tries.every(Boolean), 'every lab card has Try questions on this');
  await shot('labs-try-questions');
  ok('every lab card offers Try questions on this', tries.length + ' cards');

  // ---------- 9b. PAT hole punch: the mirror and diagonal drills, recorded on the shared record ----------
  await go('/tools/pat/holepunch.html');
  await page.waitForSelector('.hp-drill[data-drill="diag"]');
  const kinds = await page.$$eval('.hp-drill', (d) => d.map((x) => x.getAttribute('data-drill')));
  assert.deepEqual(kinds, ['mirror', 'diag']);
  const patBefore = await R(() => AceRecord.attempts().filter((a) => a.section === 'pat').length);
  for (const k of kinds) {
    const drill = page.locator('.hp-drill[data-drill="' + k + '"]');
    await drill.locator('rect[data-cell]').first().click();
    await drill.locator('button:has-text("Check")').click();
    await drill.locator('.hp-say').filter({ hasText: /\S/ }).waitFor();
  }
  await page.locator('.hp-drill[data-drill="diag"]').scrollIntoViewIfNeeded();
  await shot('pat-holepunch-diagonal-drill');
  const patAfter = await R(() => AceRecord.attempts().filter((a) => a.section === 'pat').length);
  assert.equal(patAfter - patBefore, 2, 'both drill answers reached the shared record');
  ok('hole punch: mirror-effect and diagonal-fold drills run and write PAT answers to the shared record');

  // ---------- 10. one navigation, everywhere the tab bar goes ----------
  const TABS = ['/', '/labs/', '/tests/', '/repair/', '/progress/'];
  const pages = new Set(TABS);
  for (const t of TABS) {
    await go(t);
    const links = await page.$$eval('main a[href^="/"]', (as) => as.map((a) => a.getAttribute('href').split('#')[0].split('?')[0]));
    links.filter((h) => /(\/|\.html)$/.test(h) && !/^\/(sign-in|design)\//.test(h)).forEach((h) => pages.add(h));
  }
  const missing = [], wide = [];
  for (const p of pages) {
    await go(p);
    await page.waitForTimeout(400);
    const has = await R(() => ({ bar: !!(document.getElementById('ace-bar') || document.getElementById('ace-shell')), tabs: !!document.getElementById('ace-tabs'), status: document.title }));
    if (!has.bar || !has.tabs) missing.push(p + (has.bar ? '' : ' [no bar]') + (has.tabs ? '' : ' [no tabs]'));
  }
  for (const w of [390, 768, 1280]) {
    await page.setViewportSize({ width: w, height: 900 });
    for (const p of TABS.concat(['/oc/', '/gc/', '/review/', '/diagnostic.html'])) {
      await go(p);
      const over = await R(() => document.documentElement.scrollWidth - window.innerWidth);
      if (over > 1) wide.push(p + ' at ' + w + 'px (' + over + 'px)');
    }
  }
  await page.setViewportSize(PHONE);
  if (missing.length) console.log('  pages without the shared bar or tab bar:\n    ' + missing.join('\n    '));
  if (wide.length) console.log('  sideways scroll:\n    ' + wide.join('\n    '));
  assert.deepEqual(missing, [], 'every page reachable from the tab bar has the shared bar and tabs');
  ok('crawl: every page reachable from the tab bar has the shared bar and the tab bar', pages.size + ' pages');
  assert.deepEqual(wide, []);
  ok('no sideways scroll at 390, 768 and 1280 px on the main pages');

  assert.deepEqual(errors, [], 'no page errors');
  ok('no JavaScript errors on any page visited');
} catch (e) {
  console.error('\nFAILED: ' + e.message);
  if (errors.length) console.error('page errors:\n  ' + errors.join('\n  '));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'zz-failure.png') }).catch(() => {});
  process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
  console.log('\n' + results.length + ' checks passed' + (process.exitCode ? ', then a failure' : ''));
  if (SHOTS) fs.writeFileSync(path.join(SHOTS, 'results.json'), JSON.stringify({ at: new Date().toISOString(), passed: !process.exitCode, results, errors }, null, 2));
}
