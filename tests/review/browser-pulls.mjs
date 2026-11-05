#!/usr/bin/env node
// tests/review/browser-pulls.mjs : the REVIEW browser check, against a running local site with the
// approvals function (npx netlify-cli@17 dev --offline; Blobs needs @netlify/blobs resolvable):
//
//   REVIEW_KEY=<full key> node tests/review/browser-pulls.mjs [BASE]     (BASE default http://localhost:8931)
//
//   1. /approvals/ carries noindex (meta and header) and opens with the key in the fragment, which
//      leaves the address bar.
//   2. Pull a Retold night and an explainer on the review page itself (its Pull button).
//   3. A student page that already holds the live list in its 60-second cache still shows them;
//      after one cache cycle the night is gone from the course list and AcePulls says the
//      explainer is pulled (the explainer player, G1-LITE, is not on this branch: its verdict is
//      AcePulls.isPulled('explainer:' + qid), checked here).
//   4. Function stopped (the live list request fails): the same browser keeps both hidden (stored
//      list), and a fresh browser with no storage keeps both hidden from the release snapshot
//      (written by scripts/build-review-index.mjs --snapshot from the live list).
//   5. Unpull both; after one cache cycle the night is back.
// Restores content/approvals/pulls-snapshot.json and unpulls on the way out. Not part of npm test
// (it needs the running site and waits two cache cycles); npm run test:review:browser.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { launchChromium } from '../../scripts/lib/site.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = (process.argv[2] || 'http://localhost:8931').replace(/\/$/, '');
const KEY = process.env.REVIEW_KEY;
const FN = BASE + '/.netlify/functions/approvals';
const NIGHT = 'retold:bio:1';
const INDEX = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/approvals/review-index.json'), 'utf8'));
const EXP = INDEX.items.find((x) => x.kind === 'explainer' && x.section === 'bio');
const CYCLE = 61000;
const SNAP = path.join(ROOT, 'content/approvals/pulls-snapshot.json');
const snapBefore = fs.readFileSync(SNAP, 'utf8');
if (!KEY) { console.error('browser-pulls: set REVIEW_KEY to the full review key'); process.exit(2); }

const results = [];
const check = (name, ok, extra) => { results.push({ name, ok: !!ok }); console.log((ok ? 'ok   ' : 'FAIL ') + name + (extra ? '  (' + extra + ')' : '')); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const post = (body) => fetch(FN, { method: 'POST', headers: { 'x-review-key': KEY, 'content-type': 'application/json' }, body: JSON.stringify(body) });

async function nightListed(page) {
  await page.goto(BASE + '/tools/bio-retold/?night=2', { waitUntil: 'load' });
  await page.evaluate(() => window.AcePulls && window.AcePulls.ready());
  await page.waitForTimeout(300);
  // every night list on the page (the course list and the syllabus), read on night 2's page
  return page.evaluate(() => {
    const lis = [...document.querySelectorAll('li[data-night]')];
    if (!lis.length) throw new Error('no night list rendered');
    return lis.filter((li) => !li.hidden).map((li) => +li.getAttribute('data-night')).includes(1);
  });
}
const explainerPulled = (page) => page.evaluate((qid) => window.AcePulls.isPulled('explainer:' + qid.replace(/#/g, '.')), EXP.qid);

const browser = await launchChromium();
try {
  await post({ action: 'unpull', id: NIGHT }); await post({ action: 'unpull', id: EXP.id });

  // 1. the review page
  const rv = await browser.newContext();
  const page = await rv.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const resp = await page.goto(BASE + '/approvals/#k=' + KEY, { waitUntil: 'load' });
  check('/approvals/ answers X-Robots-Tag noindex', /noindex/.test(resp.headers()['x-robots-tag'] || ''));
  check('/approvals/ carries a robots noindex meta', await page.$('meta[name="robots"][content*="noindex"]'));
  await page.waitForSelector('#list li.rv-item', { timeout: 15000 });
  check('the key leaves the address bar', !page.url().includes('k='), page.url());
  check('the list shows every item for the full key', (await page.textContent('#count')).includes('of ' + INDEX.items.length + ' items'));

  // 2. pull both from the page
  for (const id of [NIGHT, EXP.id]) {
    await page.fill('#q', id);
    const card = page.locator('#list li.rv-item', { has: page.locator('code', { hasText: new RegExp('^' + id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$') }) });
    await card.getByRole('button', { name: 'Pull', exact: true }).click();
    await page.waitForFunction((x) => document.getElementById('status').textContent === 'Pulled ' + x + '. Student pages pick it up within a minute.', id);
  }
  const pub = await (await fetch(FN + '?pulls=1')).json();
  check('the public list holds both, ids only', pub.pulls.includes(NIGHT) && pub.pulls.includes(EXP.id) && Object.keys(pub).sort().join() === 'pulls,v', JSON.stringify(pub));
  check('the review page threw no error', errors.length === 0, errors.join('; '));

  // a preview draws (the explainer renderers, from the stamped sidecar)
  await page.fill('#q', EXP.id);
  await page.locator('#list li.rv-item').first().getByRole('button', { name: 'Show preview' }).click();
  await page.waitForSelector('#list li.rv-item .rv-prev figure.vis', { timeout: 20000 }).catch(() => null);
  check('an explainer preview draws with the renderers', await page.$('#list li.rv-item .rv-prev figure.vis svg, #list li.rv-item .rv-prev figure.vis canvas, #list li.rv-item .rv-prev .vis-body > *'));
  check('the preview threw no error', errors.length === 0, errors.join('; '));

  // 3. a student who loaded the list just before the pull (cache primed with the old list)
  const st = await browser.newContext();
  const sp = await st.newPage();
  await sp.addInitScript(([key]) => { try { if (!sessionStorage.getItem(key)) sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), ids: [] })); } catch (e) { /* none */ } }, ['acelabs.v1.pulls']);
  const t0 = Date.now();
  check('inside the cache cycle the old list still applies (night listed)', await nightListed(sp));
  await sleep(Math.max(0, CYCLE - (Date.now() - t0)));
  check('after one cache cycle the night is gone from the course list', !(await nightListed(sp)));
  check('after one cache cycle AcePulls says the explainer is pulled', await explainerPulled(sp));

  // 4. the function stopped: the request fails
  await st.route('**/.netlify/functions/approvals**', (r) => r.abort());
  await sp.evaluate(() => sessionStorage.clear());   // no fresh cache: only the stored list and the snapshot are left
  check('function down, same browser (stored list): the night stays hidden', !(await nightListed(sp)));
  check('function down, same browser: the explainer stays pulled', await explainerPulled(sp));
  // the release snapshot, written from the live list
  const live = path.join(ROOT, 'node_modules', '.review-live.json');
  fs.writeFileSync(live, JSON.stringify(pub));
  execFileSync(process.execPath, ['scripts/build-review-index.mjs', '--snapshot', '--tag', 'local-check', '--from', live], { cwd: ROOT, stdio: 'inherit' });
  const fresh = await browser.newContext();
  await fresh.route('**/.netlify/functions/approvals**', (r) => r.abort());
  const fp = await fresh.newPage();
  check('function down, fresh browser, no storage: the snapshot hides the night', !(await nightListed(fp)));
  check('function down, fresh browser: the snapshot pulls the explainer', await explainerPulled(fp));
  check('function down, fresh browser: the live list was reported failed', (await fp.evaluate(() => window.AcePulls.state().live)) === 'failed');
  await fresh.close();

  // 5. unpull, and back after one cycle
  await st.unroute('**/.netlify/functions/approvals**');
  await post({ action: 'unpull', id: NIGHT }); await post({ action: 'unpull', id: EXP.id });
  fs.writeFileSync(SNAP, snapBefore);
  await sleep(CYCLE);
  check('after unpull and one cache cycle the night is listed again', await nightListed(sp));
  check('after unpull the explainer is live again', !(await explainerPulled(sp)));
} finally {
  await post({ action: 'unpull', id: NIGHT }).catch(() => {}); await post({ action: 'unpull', id: EXP.id }).catch(() => {});
  fs.writeFileSync(SNAP, snapBefore);
  await browser.close();
}
const bad = results.filter((r) => !r.ok);
console.log('browser-pulls: ' + (results.length - bad.length) + ' of ' + results.length + ' checks pass');
process.exit(bad.length ? 1 : 0);
