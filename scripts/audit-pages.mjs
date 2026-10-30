#!/usr/bin/env node
// audit-pages.mjs : the page audit every batch runs on its pages before merge.
//
//   node scripts/audit-pages.mjs PAGE...            e.g. / /learn/ tools/pat/holepunch.html
//   node scripts/audit-pages.mjs @b1                the 30 B1 acceptance pages (also @doors, @all, @my-list.txt)
//   options: --batch NAME        output folder test-screenshots/NAME/audit/ (default from the build/<batch>- branch)
//            --base URL          audit a running server instead of the built-in one (e.g. http://127.0.0.1:4106)
//            --site DIR          serve another checkout (say, the last release) and write the report here
//            --baseline FILE     fail only where a page got worse than an earlier audit.json
//            --report-only       always exit 0     --jobs N   pages at a time (default 3)
//            --allow-offsite     let requests to other hosts through (they are blocked and reported by default)
//            --no-csp            serve without the site CSP
//            --tabbar            audit each page as if it set <html data-ace-shell-pos="bottom"> (can it opt in?)
//
// Checked on each page (Playwright Chromium; phone first, 390 x 844):
//   overflow    the page scrolls sideways at 390 px (the widest offenders are named)
//   targets     controls in <main> (the whole body when a page has no <main>) and in the shell, smaller
//               than 44 x 44 px; a link inside a sentence is exempt
//   console     console errors and uncaught exceptions
//   requests    same-origin requests that fail or answer 400 and up
//   offsite     any request to another host (Google Fonts included): every file ships from the site
//   fonts       a font file served from anywhere but /shared/fonts/
//   tabbar      with the phone tab bar down (pages that set data-ace-shell-pos="bottom", or --tabbar),
//               a fixed element of the page's own sits on the doors (the shell lifts what it finds at
//               load; anything left is named here, and the page reads --ace-shell-bottom or keeps the top bar)
//   motion      (warning) animations still running with prefers-reduced-motion: reduce; a reduced-motion
//               snapshot of the first screen is saved as <page>-390-reduced-motion.png
//   no-main     (warning) the page has no <main> landmark
// Writes audit.json (every finding, plus the fonts each page loaded) next to the snapshots.
// Exit 1 when a page has a finding that is not a warning (or, with --baseline, more than before).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, pagesFrom, launchChromium, batchName, slugOf, settle } from './lib/site.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const val = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const VALUED = new Set(['--batch', '--base', '--baseline', '--jobs', '--site']);
const tokens = args.filter((a, i) => !a.startsWith('--') && !VALUED.has(args[i - 1]));
if (!tokens.length) { console.error('audit-pages: name the pages (paths, @b1, @doors, @all or @list.txt)'); process.exit(2); }
const SITE = path.resolve(val('--site') || ROOT);
const PAGES = pagesFrom(SITE, tokens);
const BATCH = batchName(ROOT, val('--batch'));
const OUT = path.join(ROOT, 'test-screenshots', BATCH, 'audit');
const JOBS = Math.max(1, Number(val('--jobs')) || 3);
const WARN_ONLY = new Set(['motion', 'no-main']);
const TABBAR = args.includes('--tabbar');
fs.mkdirSync(OUT, { recursive: true });

/* runs in the page: overflow, small targets, landmarks */
function inspect() {
  const vw = document.documentElement.clientWidth;
  const sel = (el) => { if (el.id) return '#' + el.id; let s = el.tagName.toLowerCase(); const c = [...el.classList].slice(0, 2).join('.'); if (c) s += '.' + c; const p = el.parentElement; if (p && p !== document.body && p !== document.documentElement) { const pid = p.id ? '#' + p.id : p.tagName.toLowerCase() + (p.classList[0] ? '.' + p.classList[0] : ''); s = pid + ' > ' + s; } return s; };
  const visible = (el) => { const st = getComputedStyle(el); if (st.visibility === 'hidden' || st.display === 'none' || Number(st.opacity) === 0) return false; const r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2; };
  // overflow
  const sw = Math.max(document.documentElement.scrollWidth, document.body ? document.body.scrollWidth : 0);
  const wide = [];
  if (sw > vw + 1) {
    const clipped = (el) => { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const ox = getComputedStyle(a).overflowX; if (ox !== 'visible') return true; } return false; };
    for (const el of document.body.querySelectorAll('*')) {
      const r = el.getBoundingClientRect(); if (!r.width || r.right <= vw + 1 || clipped(el)) continue;
      if (wide.some((w) => w.el.contains(el))) continue;
      wide.push({ el, right: Math.round(r.right) });
      if (wide.length >= 6) break;
    }
  }
  // targets
  const main = document.querySelector('main, [role="main"]');
  const SEL = 'a[href],button,input:not([type="hidden"]),select,textarea,summary,[role="button"],[role="link"],[role="tab"],[role="checkbox"],[role="radio"],[role="switch"],[role="menuitem"],[role="option"],[tabindex]:not([tabindex="-1"])';
  const roots = [main || document.body]; const shell = document.getElementById('ace-shell'); if (shell && shell.shadowRoot) roots.push(shell.shadowRoot);
  const small = []; let checked = 0;
  for (const root of roots) for (const el of root.querySelectorAll(SEL)) {
    if (!visible(el) || el.closest('[hidden],[aria-hidden="true"]')) continue;
    let r = el.getBoundingClientRect();
    if (el.tagName === 'A' && getComputedStyle(el).display === 'inline') { const p = el.parentElement; if (p && (p.textContent || '').trim().length > (el.textContent || '').trim().length + 12) continue; }
    if (el.tagName === 'INPUT' && /checkbox|radio/.test(el.type)) { const lab = el.closest('label'); if (lab) r = lab.getBoundingClientRect(); }
    checked++;
    if (Math.min(r.width, r.height) < 43.5) small.push({ sel: (root === document.body || root === main ? '' : '#ace-shell::shadow ') + sel(el), w: Math.round(r.width), h: Math.round(r.height), text: (el.getAttribute('aria-label') || el.textContent || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 40) });
  }
  // tabbar: nothing of the page's own may sit on the doors while the phone tab bar is down
  const covered = [];
  const bar = document.getElementById('ace-shell');
  if (bar && !bar.hidden && getComputedStyle(bar).position === 'fixed') {
    const b = bar.getBoundingClientRect(), vh = window.innerHeight;
    if (b.top > 0 && b.height > 0) {
      for (const el of document.body.querySelectorAll('*')) {
        if (getComputedStyle(el).position !== 'fixed' || !visible(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.height > vh * 0.6) continue;   // a full-screen layer is a modal over everything, not bottom UI
        if (r.bottom <= b.top + 1 || r.top >= b.bottom || r.right <= b.left || r.left >= b.right) continue;
        if (covered.some((c) => c.el.contains(el))) continue;
        covered.push({ el, top: Math.round(r.top), bottom: Math.round(r.bottom), barTop: Math.round(b.top) });
        if (covered.length >= 6) break;
      }
    }
  }
  const fonts = document.fonts ? [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family.replace(/"/g, '')} ${f.weight} ${f.style}`))] : [];
  return { vw, sw, wide: wide.map((w) => ({ sel: sel(w.el), right: w.right })), small, checked, hasMain: !!main, fonts, title: document.title,
    covered: covered.map((c) => ({ sel: sel(c.el), top: c.top, bottom: c.bottom, barTop: c.barTop })) };
}
function motionCheck() {
  if (!document.getAnimations) return [];
  return document.getAnimations().filter((a) => { if (a.playState !== 'running') return false; const t = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : {}; return t.iterations === Infinity || (t.duration || 0) > 50; })
    .map((a) => (a.animationName || a.transitionProperty || (a.effect && a.effect.target && a.effect.target.tagName) || 'animation')).slice(0, 8);
}

async function auditPage(browser, base, pagePath) {
  const origin = new URL(base).origin; const f = { page: pagePath, findings: [] };
  const add = (kind, detail) => f.findings.push({ kind, detail });
  const wire = async (ctx, page, record) => {
    if (TABBAR) await page.addInitScript(() => { const on = () => document.documentElement && document.documentElement.setAttribute('data-ace-shell-pos', 'bottom'); on(); document.addEventListener('readystatechange', on); });
    if (!args.includes('--allow-offsite')) await ctx.route('**/*', (route) => { const u = new URL(route.request().url()); if (u.origin === origin || u.protocol === 'data:' || u.protocol === 'blob:') return route.continue(); if (record) add('offsite', `${route.request().resourceType()} ${u.host}${u.pathname}`); return route.abort('blockedbyclient'); });
    if (!record) return;
    page.on('pageerror', (e) => add('console', 'uncaught: ' + String(e.message || e).split('\n')[0].slice(0, 200)));
    page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|ERR_BLOCKED_BY_CLIENT/.test(m.text())) add('console', m.text().split('\n')[0].slice(0, 200)); });
    page.on('requestfailed', (q) => { const u = new URL(q.url()); if (u.origin === origin && !/BLOCKED_BY_CLIENT|ERR_ABORTED/.test(q.failure()?.errorText || '')) add('requests', `${q.failure()?.errorText} ${u.pathname}`); });
    page.on('response', (r) => { const u = new URL(r.url()); if (u.origin !== origin) return; if (r.status() >= 400) add('requests', `${r.status()} ${u.pathname}`); if (r.request().resourceType() === 'font' && !u.pathname.startsWith('/shared/fonts/')) add('fonts', u.pathname); });
  };
  const url = base + pagePath;
  // 1. phone, light: everything but motion
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, colorScheme: 'light', hasTouch: true });
  const page = await ctx.newPage(); await wire(ctx, page, true);
  try {
    const resp = await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    if (resp && resp.status() >= 400) add('requests', `${resp.status()} ${pagePath}`);
    await settle(page);
    const r = await page.evaluate(inspect);
    f.title = r.title; f.fonts = r.fonts; f.targetsChecked = r.checked;
    if (r.sw > r.vw + 1) add('overflow', `scrollWidth ${r.sw} at ${r.vw}: ` + (r.wide.map((w) => `${w.sel} (to ${w.right})`).join(', ') || 'no single offender'));
    for (const c of r.covered) add('tabbar', `${c.sel} (${c.top} to ${c.bottom}) sits on the tab bar (from ${c.barTop})`);
    for (const s of r.small) add('targets', `${s.sel} ${s.w}x${s.h}${s.text ? ' "' + s.text + '"' : ''}`);
    if (!r.hasMain) add('no-main', 'no <main> landmark (targets read from the whole body)');
  } catch (e) { add('console', 'audit could not load the page: ' + String(e.message).split('\n')[0]); }
  await ctx.close();
  // 2. phone, reduced motion: the snapshot and what still moves
  const rctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'reduce', hasTouch: true });
  const rpage = await rctx.newPage(); await wire(rctx, rpage, false);
  try {
    await rpage.goto(url, { waitUntil: 'load', timeout: 45000 }); await settle(rpage, 600);
    const moving = await rpage.evaluate(motionCheck);
    if (moving.length) add('motion', `still animating with reduced motion: ${moving.join(', ')}`);
    await rpage.screenshot({ path: path.join(OUT, `${slugOf(pagePath)}-390-reduced-motion.png`) });
  } catch (e) { add('motion', 'reduced-motion pass could not run: ' + String(e.message).split('\n')[0]); }
  await rctx.close();
  return f;
}

const counts = (f) => { const c = {}; for (const x of f.findings) c[x.kind] = (c[x.kind] || 0) + 1; return c; };
async function main() {
  const server = val('--base') ? null : await startServer(SITE, { csp: !args.includes('--no-csp') });
  const base = (val('--base') || server.url).replace(/\/$/, '');
  const browser = await launchChromium();
  const results = new Array(PAGES.length); let next = 0;
  const t0 = Date.now();
  await Promise.all(Array.from({ length: Math.min(JOBS, PAGES.length) }, async () => { while (next < PAGES.length) { const i = next++; results[i] = await auditPage(browser, base, PAGES[i]); } }));
  await browser.close(); if (server) await server.close();
  const baseline = val('--baseline') ? JSON.parse(fs.readFileSync(path.resolve(val('--baseline')), 'utf8')) : null;
  const before = baseline ? Object.fromEntries(baseline.pages.map((p) => [p.page, counts(p)])) : null;
  let failing = 0;
  console.log(`audit-pages: ${PAGES.length} page(s) at 390 x 844 against ${base} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
  for (const f of results) {
    const c = counts(f); const prev = before ? before[f.page] || {} : null;
    const bad = Object.keys(c).filter((k) => !WARN_ONLY.has(k) && (!prev || c[k] > (prev[k] || 0)));
    f.pass = bad.length === 0; if (!f.pass) failing++;
    const summary = Object.keys(c).sort().map((k) => `${k} ${c[k]}${prev && prev[k] != null ? ` (was ${prev[k]})` : ''}${WARN_ONLY.has(k) ? ' (warning)' : ''}`).join(', ') || 'clean';
    console.log(`  ${f.pass ? 'PASS' : 'FAIL'}  ${f.page}  ${summary}`);
    for (const x of f.findings.filter((x) => bad.includes(x.kind)).slice(0, 6)) console.log(`          ${x.kind}: ${x.detail}`);
    const more = f.findings.filter((x) => bad.includes(x.kind)).length - 6; if (more > 0) console.log(`          (${more} more in audit.json)`);
  }
  const report = { when: new Date().toISOString(), base, viewport: '390x844', pages: results };
  fs.writeFileSync(path.join(OUT, 'audit.json'), JSON.stringify(report, null, 1) + '\n');
  console.log(`  report and reduced-motion snapshots: ${path.relative(ROOT, OUT)}/`);
  if (failing && !args.includes('--report-only')) { console.error(`audit-pages: ${failing} page(s) need work${baseline ? ' (worse than the baseline)' : ''}`); return 1; }
  console.log(`audit-pages: ${failing ? failing + ' page(s) with findings (report only)' : 'OK'}`);
  return 0;
}
main().then((code) => process.exit(code), (e) => { console.error('audit-pages: ' + (e.stack || e)); process.exit(2); });
