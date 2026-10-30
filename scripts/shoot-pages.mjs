#!/usr/bin/env node
// shoot-pages.mjs : a batch's screenshot set, to compare by eye with the mockups.
//
//   node scripts/shoot-pages.mjs PAGE...         e.g. / /learn/ tools/gc/recognition-lab.html
//   node scripts/shoot-pages.mjs @doors          (also @b1, @all, @my-list.txt)
//   options: --batch NAME     into test-screenshots/NAME/ (default from the build/<batch>- branch; not served,
//                             the folder is git-ignored)
//            --sizes 390,1280 which widths (390 x 844 and 1280 x 800)
//            --themes light,dark
//            --reduced        add a reduced-motion shot (light) at each size
//            --full           the whole page (capped at 12000 px) instead of the first screen
//            --dpr N          device pixel ratio (default 1; 2 for a crisp phone shot)
//            --data-theme     set html[data-theme] as well as the media query (the Settings path)
//            --live           leave CSS animations running (by default they are finished before the shot)
//            --wait MS        extra settle time after load (default 400)
//            --base URL       shoot a running server instead of the built-in one
//            --site DIR       serve another checkout (say, the last release) and write the shots here
//            --allow-offsite  let requests to other hosts through (blocked by default, like the audit)
//
// Files: <page>-<w>x<h>-<theme>[-reduced].png, plus index.html, a contact sheet of the run.
// Prints the page errors it saw; the audit (audit-pages.mjs) is the check, this is the picture.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, pagesFrom, launchChromium, batchName, slugOf, settle } from './lib/site.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const val = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const VALUED = new Set(['--batch', '--sizes', '--themes', '--dpr', '--wait', '--base', '--jobs', '--site']);
const tokens = args.filter((a, i) => !a.startsWith('--') && !VALUED.has(args[i - 1]));
if (!tokens.length) { console.error('shoot-pages: name the pages (paths, @doors, @b1, @all or @list.txt)'); process.exit(2); }
const SITE = path.resolve(val('--site') || ROOT);
const PAGES = pagesFrom(SITE, tokens);
const BATCH = batchName(ROOT, val('--batch'));
const OUT = path.join(ROOT, 'test-screenshots', BATCH);
const SIZES = { 390: { width: 390, height: 844 }, 1280: { width: 1280, height: 800 } };
const sizes = (val('--sizes') || '390,1280').split(',').map((s) => SIZES[s.trim()] || (() => { const [w, h] = s.split('x').map(Number); return { width: w, height: h || 800 }; })());
const themes = (val('--themes') || 'light,dark').split(',').map((s) => s.trim());
const DPR = Number(val('--dpr')) || 1, WAIT = Number(val('--wait')) || 400, JOBS = Math.max(1, Number(val('--jobs')) || 3);
fs.mkdirSync(OUT, { recursive: true });

const shots = [];
for (const p of PAGES) for (const vp of sizes) {
  for (const theme of themes) shots.push({ page: p, vp, theme, reduced: false });
  if (args.includes('--reduced')) shots.push({ page: p, vp, theme: 'light', reduced: true });
}

async function shoot(browser, base, s) {
  const origin = new URL(base).origin; const errors = [];
  const ctx = await browser.newContext({ viewport: s.vp, deviceScaleFactor: DPR, colorScheme: s.theme === 'dark' ? 'dark' : 'light', reducedMotion: s.reduced ? 'reduce' : 'no-preference', hasTouch: s.vp.width < 700, isMobile: false });
  if (args.includes('--data-theme')) await ctx.addInitScript((t) => { document.documentElement.setAttribute('data-theme', t); }, s.theme);
  if (!args.includes('--allow-offsite')) await ctx.route('**/*', (route) => { const u = new URL(route.request().url()); return u.origin === origin || u.protocol === 'data:' || u.protocol === 'blob:' ? route.continue() : route.abort('blockedbyclient'); });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(String(e.message || e).split('\n')[0]));
  const file = `${slugOf(s.page)}-${s.vp.width}x${s.vp.height}-${s.theme}${s.reduced ? '-reduced' : ''}.png`;
  try {
    await page.goto(base + s.page, { waitUntil: 'load', timeout: 45000 });
    await settle(page, WAIT);
    let clip;
    if (args.includes('--full')) { const h = await page.evaluate(() => Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0)); clip = { x: 0, y: 0, width: s.vp.width, height: Math.min(h, 12000) }; }
    await page.screenshot({ path: path.join(OUT, file), fullPage: !!clip, clip, animations: args.includes('--live') ? 'allow' : 'disabled', caret: 'hide' });
  } catch (e) { errors.push('could not shoot: ' + String(e.message).split('\n')[0]); }
  await ctx.close();
  return { ...s, file, errors };
}

function contactSheet(done) {
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const rows = PAGES.map((p) => {
    const mine = done.filter((d) => d.page === p);
    return `<section><h2>${esc(p)}</h2><div class="row">${mine.map((d) => `<figure><a href="${esc(d.file)}"><img loading="lazy" src="${esc(d.file)}" alt="${esc(d.file)}"></a><figcaption>${d.vp.width} x ${d.vp.height}, ${d.theme}${d.reduced ? ', reduced motion' : ''}${d.errors.length ? ' / ' + d.errors.length + ' page error(s)' : ''}</figcaption></figure>`).join('')}</div></section>`;
  }).join('\n');
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Shots: ${esc(BATCH)}</title>
<style>body{font:14px/1.4 system-ui,sans-serif;margin:16px;background:#f5f0e8;color:#0d2018}h1{font-size:20px}h2{font-size:15px;margin:24px 0 8px}.row{display:flex;gap:12px;overflow-x:auto;align-items:flex-start}figure{margin:0;flex:none}img{display:block;max-height:420px;border:1px solid #0002;background:#fff}figcaption{font-size:12px;color:#3a4a42;margin-top:4px}</style>
<h1>Shots: ${esc(BATCH)} (${done.length} files, ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC)</h1>\n${rows}\n`;
}

async function main() {
  const server = val('--base') ? null : await startServer(SITE, { csp: true });
  const base = (val('--base') || server.url).replace(/\/$/, '');
  const browser = await launchChromium();
  const done = new Array(shots.length); let next = 0; const t0 = Date.now();
  await Promise.all(Array.from({ length: Math.min(JOBS, shots.length) }, async () => { while (next < shots.length) { const i = next++; done[i] = await shoot(browser, base, shots[i]); } }));
  await browser.close(); if (server) await server.close();
  fs.writeFileSync(path.join(OUT, 'index.html'), contactSheet(done));
  const withErr = done.filter((d) => d.errors.length);
  console.log(`shoot-pages: ${done.length} shot(s) of ${PAGES.length} page(s) in ${((Date.now() - t0) / 1000).toFixed(1)} s, into ${path.relative(ROOT, OUT)}/ (contact sheet: index.html)`);
  for (const d of withErr) console.log(`  page error on ${d.file}: ${d.errors.slice(0, 2).join(' | ')}`);
  return 0;
}
main().then((code) => process.exit(code), (e) => { console.error('shoot-pages: ' + (e.stack || e)); process.exit(2); });
