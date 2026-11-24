#!/usr/bin/env node
// measure-phone.mjs : phone-fit numbers for every student page at 390x844.
//
//   node scripts/measure-phone.mjs [--base http://localhost:4103] [--out file.json] [--shots dir] [--only /path,/path]
//
// For each page: horizontal overflow (px past the viewport), share of visible text under
// 15px and under 13px, smallest text, tap targets under 44px (inline links inside a
// sentence are not counted), and fixed bars that sit over the last control.
// Needs a running static server (npx serve . -l 4103 -L) and playwright + a chromium.
// Read-only: it never writes into the repo unless --out points there.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('--base', 'http://localhost:4103');
const OUT = arg('--out', '');
const SHOTS = arg('--shots', '');
const CHROME = process.env.CHROME_PATH || '/root/.cache/puppeteer/chrome/linux-157.0.8103.78/chrome-linux64/chrome';

export const PAGES = [
  '/', '/labs/', '/tests/', '/repair/', '/progress/', '/review/', '/plan/', '/diagnostic.html', '/test-week.html', '/pass/',
  '/see/', '/bio/', '/bio/see/', '/gc/', '/gc/vsepr/', '/gc/galvanic/', '/gc/guacamole/', '/oc/', '/oc/3d/',
  '/qr/', '/qr/drill/', '/qr/worked/', '/pat/', '/rc/', '/rc/map/',
  '/games/', '/games/play.html', '/games/chirality/', '/games/six-views/',
  '/tricks/', '/tricks/videos/', '/tricks/shorts/', '/tricks/sheets.html', '/cheat-sheets.html', '/guides/pat-grids.html',
  '/tools/bio-retold/', '/tools/gchem/', '/tools/organic/', '/tools/pat-retold/', '/tools/rc-retold/', '/tools/qr-retold/',
  '/tools/bio/', '/tools/bio/bio-cell.html', '/tools/bio/bio-genetics.html', '/tools/bio/bio-physiology.html', '/tools/bio/bio-diversity.html',
  '/tools/bio/bio-devo.html', '/tools/bio/bio-evolution.html', '/tools/bio/bio-osmosis.html', '/tools/bio/bio-micrographs.html',
  '/tools/gc/', '/tools/qr/', '/tools/ochem/',
  '/tools/pat/', '/tools/pat/test.html', '/tools/pat/keyholes.html', '/tools/pat/tfe.html', '/tools/pat/angles.html',
  '/tools/pat/holepunch.html', '/tools/pat/cubes.html', '/tools/pat/patternfold.html', '/tools/pat/playbook.html'
];

function metrics() {
  const W = innerWidth, H = innerHeight, d = document.documentElement;
  const vis = (e) => { if (e.checkVisibility && !e.checkVisibility()) return false; const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && parseFloat(s.opacity) > 0.05; };
  const shown = (e) => { for (let p = e; p && p !== document.body; p = p.parentElement) { const s = getComputedStyle(p); if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) < 0.05) return false; } return true; };
  const out = { title: document.title, overflow: Math.max(0, Math.max(d.scrollWidth, W) - 390)   /* a phone browser widens the layout viewport when the page is too wide, so measure against the screen */, height: d.scrollHeight };
  const cs = getComputedStyle(document.body);
  out.bodyFont = cs.fontFamily.split(',')[0].replace(/"/g, ''); out.bodyBg = cs.backgroundColor;
  const h1 = [...document.querySelectorAll('h1')].find(vis);
  if (h1) { const s = getComputedStyle(h1); out.h1 = s.fontFamily.split(',')[0].replace(/"/g, '') + ' ' + Math.round(parseFloat(s.fontSize)); }
  if (out.overflow > 1) {
    out.wide = [...document.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect(); return vis(e) && r.right > W + 2 && r.width < 3000; })
      .map((e) => ({ t: e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.split(' ')[0] : ''), r: Math.round(e.getBoundingClientRect().right) }))
      .sort((a, b) => b.r - a.r).slice(0, 4);
  }
  // text
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n, total = 0, u15 = 0, u13 = 0, min = 99; const ex = {};
  while ((n = tw.nextNode())) {
    const t = n.nodeValue.trim(); if (t.length < 2) continue;
    const p = n.parentElement; if (!p || /SCRIPT|STYLE|NOSCRIPT|TEMPLATE/.test(p.tagName) || p.closest('svg,sup,sub') || !vis(p) || !shown(p)) continue;
    const fs = parseFloat(getComputedStyle(p).fontSize); total += t.length;
    if (fs < 14.9) u15 += t.length;
    if (fs < 12.9) { u13 += t.length; const k = fs.toFixed(1); if (!ex[k]) ex[k] = (p.className && typeof p.className === 'string' ? '.' + p.className.split(' ')[0] + ' ' : p.tagName.toLowerCase() + ' ') + t.slice(0, 24); }
    if (fs < min) min = fs;
  }
  out.textUnder15 = total ? Math.round(100 * u15 / total) : 0;
  out.textUnder13 = total ? Math.round(100 * u13 / total) : 0;
  out.minText = min === 99 ? null : Math.round(min * 10) / 10; out.tinyEx = ex;
  // taps
  const taps = [...document.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,[role=button],[role=tab],summary')].filter((e) => vis(e) && shown(e));
  const small = taps.filter((e) => {
    const s = getComputedStyle(e);
    if (e.tagName === 'A' && s.display.startsWith('inline') && e.closest('p,li,dd,td,figcaption,small,label,span.aui-small') && s.display === 'inline') return false;
    let r = e.getBoundingClientRect();
    if ((e.type === 'checkbox' || e.type === 'radio' || e.type === 'range') && e.closest('label')) r = e.closest('label').getBoundingClientRect();
    return r.height < 43.5 || r.width < 43.5;
  });
  out.taps = taps.length; out.smallTaps = small.length;
  out.smallEx = small.slice(0, 6).map((e) => { const r = e.getBoundingClientRect(); return ((e.textContent || '').trim().slice(0, 18) || e.tagName) + (typeof e.className === 'string' && e.className ? ' .' + e.className.split(' ')[0] : '') + ' ' + Math.round(r.width) + 'x' + Math.round(r.height); });
  // fixed bars at the bottom, and whether the page leaves room for them
  const fixed = [...document.querySelectorAll('body *')].filter((e) => { const s = getComputedStyle(e); return s.position === 'fixed' && vis(e); });
  const bottom = fixed.filter((e) => { const r = e.getBoundingClientRect(); return r.bottom > H - 4 && r.width > W * 0.6 && r.height < H * 0.4; });
  const barH = bottom.reduce((m, e) => Math.max(m, H - e.getBoundingClientRect().top), 0);
  out.bottomBar = Math.round(barH);
  if (barH) {
    // last interactive control in the flow, measured against the end of the page
    const flow = taps.filter((e) => { for (let p = e; p; p = p.parentElement) { if (getComputedStyle(p).position === 'fixed') return false; } return true; });
    const last = flow.reduce((m, e) => Math.max(m, e.getBoundingClientRect().bottom + scrollY), 0);
    out.lastControlClear = Math.round(d.scrollHeight - last); out.covered = d.scrollHeight - last < barH - 2 && d.scrollHeight > H;
  }
  out.floating = fixed.filter((e) => { const r = e.getBoundingClientRect(); return r.width < W * 0.6 && r.bottom > H - barH - 2 && r.top < H && barH > 0 && !e.closest('#ace-tabs'); }).length;
  return out;
}

async function main() {
  const only = arg('--only', ''); const pages = only ? only.split(',') : PAGES;
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  const res = [];
  for (const p of pages) {
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', (e) => errs.push(String(e).slice(0, 100)));
    try {
      await page.goto(BASE + p, { waitUntil: 'load', timeout: 30000 }); await page.waitForTimeout(900);
      const m = await page.evaluate(metrics); m.page = p; m.errs = errs.slice(0, 2); res.push(m);
      if (SHOTS) await page.screenshot({ path: path.join(SHOTS, (p.replace(/[\/?=.&]+/g, '_').replace(/^_|_$/g, '') || 'home') + '-phone.png') });
    } catch (e) { res.push({ page: p, fail: String(e).slice(0, 120) }); }
    await page.close();
  }
  await browser.close();
  const ok = res.filter((r) => !r.fail);
  const sum = {
    pages: res.length, failed: res.length - ok.length,
    overflowPages: ok.filter((r) => r.overflow > 1).length,
    avgTextUnder15: Math.round(ok.reduce((a, r) => a + r.textUnder15, 0) / ok.length),
    avgTextUnder13: Math.round(ok.reduce((a, r) => a + r.textUnder13, 0) / ok.length),
    pagesWithTextUnder13: ok.filter((r) => r.textUnder13 > 0).length,
    smallTaps: ok.reduce((a, r) => a + r.smallTaps, 0), taps: ok.reduce((a, r) => a + r.taps, 0),
    pagesWithSmallTaps: ok.filter((r) => r.smallTaps > 0).length,
    coveredPages: ok.filter((r) => r.covered).length, floatingOverBar: ok.filter((r) => r.floating).length
  };
  console.log('page'.padEnd(46) + 'overflow  <15px  <13px  min   smallTaps  covered');
  for (const r of res) {
    if (r.fail) { console.log(r.page.padEnd(46) + 'FAIL ' + r.fail); continue; }
    console.log(r.page.padEnd(46) + String(r.overflow).padStart(6) + String(r.textUnder15 + '%').padStart(8) + String(r.textUnder13 + '%').padStart(7) + String(r.minText).padStart(6) + String(r.smallTaps + '/' + r.taps).padStart(11) + (r.covered ? '   yes' : '') + (r.floating ? '   float' : ''));
  }
  console.log('\nSUMMARY ' + JSON.stringify(sum));
  if (OUT) fs.writeFileSync(OUT, JSON.stringify({ summary: sum, pages: res }, null, 1));
}
if (import.meta.url === 'file://' + process.argv[1]) main();
