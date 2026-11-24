#!/usr/bin/env node
// phone-audit.mjs : phone-layout audit of every student page at 390x844 (and a 1280x800 spot check).
//
//   npm run audit:phone                                   (starts its own static server)
//   node scripts/qa/phone-audit.mjs [--only /a,/b] [--out file.json] [--shots dir] [--base url]
//        [--no-flows] [--no-desktop] [--verbose] [--strict]
//
// On every page, and in the key states the flows below reach (test started, navigator open, answer
// shown, end of set), it measures:
//   covered    a button, choice or paragraph with something else on top of it (elementFromPoint on
//              the centre and four corners, checked while the element sits in the middle of the screen)
//   sticky     sticky or fixed bars that together take more than 30% of the screen height
//   sideways   the document is wider than the screen
//   small      text under 13px
//   clipped    text cut off by overflow hidden or an ellipsis
//   contrast   below 4.5:1 for normal text, 3:1 for large text
//   taps       tap targets under 44x44 CSS px (links inside a sentence are not counted)
//   errors     console errors and failed requests
// Exit code 1 on any covered, sticky or sideways finding (and on any finding at all with --strict).
// Needs playwright and a Chrome: CHROME_PATH=/path/to/chrome.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { start } from '../../tests/e2e/server.mjs';
import { FLOWS } from './phone-flows.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const has = (k) => args.includes(k);
const ONLY = arg('--only', '') ? arg('--only', '').split(',') : null;
const OUT = arg('--out', '');
const SHOTS = arg('--shots', '');
const VERBOSE = has('--verbose');
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

let chromium;
try { ({ chromium } = await import('playwright')); } catch { ({ chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core')); }
const exe = process.env.CHROME_PATH || (fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);

const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1' };
const DESKTOP = { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 };
const DESKTOP_PAGES = ['/', '/labs/', '/tests/', '/repair/', '/progress/', '/plan/', '/see/', '/tools/ochem/summit/', '/tools/minitests/', '/tools/gchem/', '/diagnostic.html'];

// Every tracked page a student can reach. Pages the site redirects away (internal material) drop
// out by themselves: the audit skips an address that lands somewhere else.
const SKIP = /^(docs|design|research|specs|content-drafts|scripts|node_modules|astro-proto|netlify|coach|account|sign-in|tricks\/videos|tools\/(qr|gc|ochem\/v2)\/tiktoks|tools\/qr\/proposals|tools\/content|tests\/(bio|pat|shell|ochem2026|qr-formats|signin|bank))\//;
function pages() {
  const files = execSync('git ls-files "*.html"', { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean)
    .filter((f) => !SKIP.test(f) && f !== '404.html');
  return files.map((f) => '/' + f.replace(/(^|\/)index\.html$/, '$1')).sort();
}
// Addresses that are a page state, not a file.
const EXTRA = ['/gc/?check=buffers', '/gc/?run=daily', '/bio/?run=daily', '/oc/?run=daily', '/qr/drill/?run=daily'];

/* ------------------------------------------------------------------------------------------ */
/* In the page                                                                                  */
/* ------------------------------------------------------------------------------------------ */
function auditInPage(opts) {
  const W = innerWidth, H = innerHeight, d = document.documentElement;
  const out = { covered: [], sticky: [], sideways: [], small: [], clipped: [], contrast: [], taps: [] };
  const name = (e) => { if (!e || !e.tagName) return '?'; const c = typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : ''; return e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + c; };
  const label = (e) => name(e) + ' "' + (e.innerText || e.value || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 32) + '"';
  const styleOf = (e) => getComputedStyle(e);
  const shown = (e) => {
    if (e.checkVisibility && !e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
    const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false;
    for (let p = e; p && p !== d; p = p.parentElement) { const s = styleOf(p); if (parseFloat(s.opacity) < 0.05) return false; }
    return true;
  };
  // an element scrolled out of sight inside a scrolling box, or cut by a clipping ancestor, is not on screen
  const clipRect = (e) => {
    let r = e.getBoundingClientRect(); let x0 = r.left, y0 = r.top, x1 = r.right, y1 = r.bottom;
    for (let p = e.parentElement; p && p !== d; p = p.parentElement) {
      const s = styleOf(p); if (/(hidden|auto|scroll|clip)/.test(s.overflowX + s.overflowY)) { const q = p.getBoundingClientRect(); x0 = Math.max(x0, q.left); y0 = Math.max(y0, q.top); x1 = Math.min(x1, q.right); y1 = Math.min(y1, q.bottom); }
    }
    return { left: x0, top: y0, right: x1, bottom: y1, width: x1 - x0, height: y1 - y0 };
  };
  const fixedRoot = (e) => { for (let p = e; p && p !== d; p = p.parentElement) { const pos = styleOf(p).position; if (pos === 'fixed' || pos === 'sticky') return p; } return null; };
  const isModal = (e) => {
    if (!e) return false;
    if (e.closest('dialog,[role="dialog"],[aria-modal="true"],[data-sheet],.sheet,.modal,.overlay,.backdrop,.scrim')) return true;
    const f = fixedRoot(e); if (!f || styleOf(f).position !== 'fixed') return false;
    const r = f.getBoundingClientRect(); return r.width * r.height > 0.6 * W * H;
  };

  /* sideways scroll */
  const sw = Math.max(d.scrollWidth, document.body ? document.body.scrollWidth : 0);
  if (sw > W + 1) {
    const wide = [...document.querySelectorAll('body *')].filter((e) => { if (!shown(e)) return false; const r = clipRect(e); return r.right > W + 1 && r.width > 0 && r.width < 4000 && !fixedRoot(e); })
      .sort((a, b) => b.getBoundingClientRect().right - a.getBoundingClientRect().right).slice(0, 3).map((e) => name(e) + ' right=' + Math.round(e.getBoundingClientRect().right));
    out.sideways.push({ what: 'page is ' + sw + 'px wide on a ' + W + 'px screen', by: wide });
  }

  /* sticky and fixed bars: how much of the screen they hold */
  const bars = [...document.querySelectorAll('body *')].filter((e) => { const p = styleOf(e).position; return (p === 'fixed' || p === 'sticky') && shown(e); });
  const stuck = bars.map((e) => ({ e, r: e.getBoundingClientRect(), p: styleOf(e).position })).filter((b) => b.r.width > W * 0.5 && b.r.bottom > 0 && b.r.top < H && !isModal(b.e) && (b.p === 'fixed' || b.r.top <= (parseFloat(styleOf(b.e).top) || 0) + 1 || b.r.bottom >= H - 1));
  const held = stuck.reduce((s, b) => s + Math.max(0, Math.min(H, b.r.bottom) - Math.max(0, b.r.top)), 0);
  if (opts.scrolled && held > H * 0.3) out.sticky.push({ what: 'sticky or fixed bars hold ' + Math.round(held) + 'px of ' + H + 'px', by: stuck.map((b) => name(b.e) + ' ' + Math.round(b.r.height) + 'px') });

  /* covered content. An element counts as covered when something unrelated sits on its centre (or on
     two corners), and scrolling cannot move it clear: either the thing on top scrolls with the page,
     or it is a fixed or sticky bar and the element has nowhere on the screen to go. */
  const inter = 'a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[role=tab],[role=radio],[role=option],label,[onclick]';
  const texty = 'p,li,h1,h2,h3,h4,dt,dd,td,th,figcaption,blockquote';
  const seen = new Set();
  const maxY = Math.max(0, d.scrollHeight - H), sy = scrollY;
  const related = (el, hit) => {
    if (!hit) return true;                       // off screen
    if (el === hit || el.contains(hit) || hit.contains(el)) return true;
    const wrap = el.closest('label,button,a,[role=button],[role=radio],[role=option],summary');
    if (wrap && wrap.contains(hit)) return true;
    if (el.tagName === 'INPUT' && el.id && hit.closest('label[for="' + CSS.escape(el.id) + '"]')) return true;
    if (el.tagName === 'LABEL' && el.htmlFor && hit.id === el.htmlFor) return true;
    // a child laid over its sibling inside one control (a badge on a card, a tick on a choice)
    const ctl = hit.closest(inter); if (ctl && ctl.contains(el)) return true;
    return false;
  };
  // can the page scroll so that this element sits fully on screen and clear of the bar?
  const canClear = (r, bar) => {
    const a = r.top + sy, b = r.bottom + sy, f0 = Math.max(0, bar.top), f1 = Math.min(H, bar.bottom);
    const above = Math.max(0, b - f0) <= Math.min(a, maxY) && (b - a) <= f0;            // fits above the bar
    const below = Math.max(0, b - H) <= Math.min(maxY, a - f1) && (b - a) <= H - f1;    // fits below it
    return above || below;
  };
  const judge = (el, kind) => {
    if (seen.has(el) || el.closest('svg') || !shown(el)) return;
    const s = styleOf(el); if (s.pointerEvents === 'none' && kind === 'control') return;
    if (el.disabled) return;
    const r = clipRect(el); if (r.width < 4 || r.height < 4) return;
    const cy = (r.top + r.bottom) / 2; if (cy < 0 || cy > H || r.right <= 0 || r.left >= W) return;
    if (kind === 'text' && !(el.innerText || '').trim()) return;
    const br = s.borderTopLeftRadius || '0'; const rad = /%/.test(br) ? parseFloat(br) / 100 * Math.min(r.width, r.height) : parseFloat(br) || 0;   // a round control has no corners to cover
    const ix = Math.max(Math.min(6, r.width / 4), 0.31 * Math.min(rad, r.width / 2)), iy = Math.max(Math.min(6, r.height / 4), 0.31 * Math.min(rad, r.height / 2));
    const pts = [[(r.left + r.right) / 2, cy], [r.left + ix, r.top + iy], [r.right - ix, r.top + iy], [r.left + ix, r.bottom - iy], [r.right - ix, r.bottom - iy]]
      .filter(([x, y]) => x >= 0 && x < W && y >= 0 && y < H);
    const bad = []; let who = null;
    for (const [x, y] of pts) { const hit = document.elementFromPoint(x, y); if (!related(el, hit)) { bad.push([Math.round(x), Math.round(y)]); who = who || hit; } }
    if (!bad.length) { if (pts.length === 5) seen.add(el); return; }
    if (isModal(who)) return;                                    // a sheet or dialog the student opened
    const centre = !related(el, document.elementFromPoint(pts[0][0], pts[0][1]));
    if (!centre && bad.length < 2) return;                       // one clipped corner (rounded corners, badges)
    const f = fixedRoot(who);
    if (f && canClear(el.getBoundingClientRect(), f.getBoundingClientRect())) return;   // a bar the element scrolls out from under
    seen.add(el);
    out.covered.push({ what: label(el), by: name(who) + (f ? ' in ' + styleOf(f).position + ' ' + name(f) : ''), points: bad.length + '/' + pts.length, centre, kind });
  };
  document.querySelectorAll(inter).forEach((e) => judge(e, 'control'));
  document.querySelectorAll(texty).forEach((e) => { if (!e.querySelector(texty)) judge(e, 'text'); });

  if (!opts.first) return out;   // the page-wide measures below are taken once per state

  /* text size, clipping, contrast */
  const parse = (c) => { const m = /rgba?\(([^)]+)\)/.exec(c); if (!m) return null; const p = m[1].split(/[,\s\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const over = (top, under) => ({ r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1 });
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  // The backgrounds text may sit on: walk up, stacking translucent layers. A gradient gives one
  // candidate per color stop (the worst one is judged); a picture gives none (not judged).
  const bgOf = (e) => {
    let stacks = [[]];
    for (let p = e; p; p = p.parentElement) {
      const s = styleOf(p); let solid = false;
      if (s.backgroundImage && s.backgroundImage !== 'none') {
        if (/url\(/.test(s.backgroundImage)) return null;
        const stops = (s.backgroundImage.match(/rgba?\([^)]+\)/g) || []).map(parse).filter(Boolean).slice(0, 6);
        if (stops.length) { stacks = stacks.flatMap((st) => stops.map((c) => st.concat([c]))).slice(0, 24); if (stops.every((c) => c.a >= 1)) solid = true; }
      }
      if (solid) break;
      const c = parse(s.backgroundColor); if (c && c.a > 0) { stacks = stacks.map((st) => st.concat([c])); if (c.a >= 1) break; }
    }
    return stacks.map((layers) => { let base = { r: 255, g: 255, b: 255, a: 1 }; for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base); return base; });
  };
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; const smallSeen = new Set(), conSeen = new Set();
  while ((n = tw.nextNode())) {
    const t = n.nodeValue.trim(); if (t.length < 2) continue;
    const p = n.parentElement; if (!p || /SCRIPT|STYLE|NOSCRIPT|TEMPLATE|OPTION/.test(p.tagName) || p.closest('svg,[aria-hidden="true"]') || !shown(p)) continue;
    const cr = clipRect(p); if (cr.width < 2 || cr.height < 2) continue;
    const s = styleOf(p); const fs = parseFloat(s.fontSize);
    const sub = p.closest('sup,sub');
    if (fs < 12.95 && !sub && !smallSeen.has(p)) { smallSeen.add(p); out.small.push({ what: label(p), px: +fs.toFixed(1) }); }
    if (conSeen.has(p)) continue; conSeen.add(p);
    if (p.closest('[disabled],[aria-disabled="true"],[inert],.locked,.is-locked,.lock,.disabled,.is-disabled')) continue;   // an inactive control or a locked step is dimmed on purpose
    const fg0 = parse(s.color); const bgs = bgOf(p); if (!fg0 || !bgs) continue;
    let op = 1; for (let q = p; q && q !== d; q = q.parentElement) op *= parseFloat(styleOf(q).opacity);
    const large = fs >= 24 || (fs >= 18.66 && parseInt(s.fontWeight, 10) >= 700);
    let worst = null;
    for (const bg of bgs) {
      const fg = over({ r: fg0.r, g: fg0.g, b: fg0.b, a: fg0.a * op }, bg);
      const L1 = lum(fg), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      if (!worst || ratio < worst.ratio) worst = { ratio, bg };
    }
    if (worst.ratio < (large ? 3 : 4.5) - 0.01) out.contrast.push({ what: label(p), ratio: +worst.ratio.toFixed(2), need: large ? 3 : 4.5, fg: s.color, bg: 'rgb(' + [worst.bg.r, worst.bg.g, worst.bg.b].map(Math.round).join(',') + ')' });
  }
  document.querySelectorAll('body *').forEach((e) => {
    if (e.closest('svg') || !e.childNodes.length || !shown(e)) return;
    const own = [...e.childNodes].some((c) => c.nodeType === 3 && c.nodeValue.trim().length > 1); if (!own) return;
    const s = styleOf(e);
    const cutX = e.scrollWidth > e.clientWidth + 1 && /(hidden|clip)/.test(s.overflowX);
    const cutY = e.scrollHeight > e.clientHeight + 3 && /(hidden|clip)/.test(s.overflowY) && e.clientHeight > 0 && s.display !== 'inline';
    if (cutX || cutY) out.clipped.push({ what: label(e), how: cutX ? (s.textOverflow === 'ellipsis' ? 'ellipsis' : 'cut sideways') + ' ' + e.scrollWidth + '>' + e.clientWidth : 'cut below ' + e.scrollHeight + '>' + e.clientHeight });
  });

  /* tap targets */
  document.querySelectorAll('a[href],button,input:not([type=hidden]),select,summary,[role=button],[role=tab]').forEach((e) => {
    if (!shown(e) || e.disabled) return;
    let box = e; if (e.tagName === 'INPUT' && /radio|checkbox/.test(e.type)) { const l = e.closest('label') || (e.id && document.querySelector('label[for="' + CSS.escape(e.id) + '"]')); if (l) box = l; }
    const r = box.getBoundingClientRect(); const c = clipRect(box); if (c.width < 2 || c.height < 2) return;
    if (r.width >= 43.5 && r.height >= 43.5) return;
    if (e.tagName === 'A') {   // a link inside a sentence is text, not a button
      const par = e.parentElement; const rest = par ? (par.innerText || '').replace(e.innerText || '', '').trim() : '';
      if (styleOf(e).display === 'inline' && rest.length > 12) return;
    }
    if (e.tagName === 'INPUT' && /text|number|search|email|range/.test(e.type) && r.height >= 43.5) return;
    out.taps.push({ what: label(e), size: Math.round(r.width) + 'x' + Math.round(r.height) });
  });
  return out;
}

/* ------------------------------------------------------------------------------------------ */
/* Driver                                                                                       */
/* ------------------------------------------------------------------------------------------ */
const KINDS = ['covered', 'sticky', 'sideways', 'small', 'clipped', 'contrast', 'taps'];
const HARD = ['covered', 'sticky', 'sideways'];

async function auditState(page) {
  // step down the page so every element is judged once while it sits mid-screen
  const total = { covered: [], sticky: [], sideways: [], small: [], clipped: [], contrast: [], taps: [] };
  const h = await page.evaluate(() => { window.scrollTo(0, 0); return document.documentElement.scrollHeight; });
  const H = page.viewportSize().height; const maxY = Math.max(0, h - H);
  const steps = []; for (let y = 0; y < maxY; y += Math.round(H * 0.5)) steps.push(y); steps.push(maxY);
  const ys = [...new Set(steps)].slice(0, 40);
  const key = new Set();
  for (let i = 0; i < ys.length; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), ys[i]);
    await page.waitForTimeout(60);
    const r = await page.evaluate(auditInPage, { first: i === 0, last: i === ys.length - 1, scrolled: ys[i] > 0 || ys.length === 1 });
    for (const k of KINDS) for (const f of r[k]) { const id = k + '|' + f.what + '|' + (f.by || ''); if (!key.has(id)) { key.add(id); total[k].push(f); } }
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  return total;
}

async function run() {
  let base = arg('--base', ''); let server = null;
  if (!base) { const s = await start(0); server = s.server; base = s.url; }
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const report = [];
  const visit = async (ctxOpts, where, addr, flow) => {
    const ctx = await browser.newContext(ctxOpts);
    await ctx.addInitScript(() => { try { localStorage.setItem('ace.audit', '1'); } catch (e) {} });
    const page = await ctx.newPage();
    const errors = [], failed = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
    page.on('pageerror', (e) => errors.push('pageerror: ' + String(e.message).slice(0, 200)));
    page.on('requestfailed', (r) => failed.push(r.url().replace(base, '') + ' ' + (r.failure() ? r.failure().errorText : '')));
    page.on('response', (r) => { if (r.status() >= 400) failed.push(r.url().replace(base, '') + ' ' + r.status()); });
    page.on('dialog', (dlg) => dlg.accept().catch(() => {}));
    const rec = async (state) => {
      const f = await auditState(page);
      const at = new URL(page.url()); const here = at.pathname + at.search;
      report.push({ where, page: addr, state: state + (here !== addr ? ' (at ' + here + ')' : ''), findings: f });
      if (SHOTS) await page.screenshot({ path: path.join(SHOTS, (where + addr + '-' + state).replace(/[^a-z0-9]+/gi, '_') + '.png') }).catch(() => {});
    };
    try {
      const res = await page.goto(base + addr, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(700);
      const landed = new URL(page.url()); const want = new URL(base + addr);
      if (landed.pathname !== want.pathname) { await ctx.close(); return; }      // redirected away: not a student page
      if (res && res.status() >= 400) { report.push({ where, page: addr, state: 'load', findings: {}, errors: ['HTTP ' + res.status()], failed: [] }); await ctx.close(); return; }
      await rec('load');
      if (flow) await flow({ page, rec, base });
    } catch (e) { errors.push('audit: ' + String(e.message).split('\n')[0].slice(0, 200)); }
    const last = report.filter((r) => r.where === where && r.page === addr).pop();
    if (last) { last.errors = [...new Set(errors)]; last.failed = [...new Set(failed)]; }
    else report.push({ where, page: addr, state: 'load', findings: {}, errors: [...new Set(errors)], failed: [...new Set(failed)] });
    await ctx.close();
  };

  const list = [...pages(), ...EXTRA].filter((p) => !ONLY || ONLY.includes(p));
  for (const p of list) { if (VERBOSE) console.log('phone ' + p); await visit(PHONE, 'phone', p, has('--no-flows') ? null : FLOWS[p]); }
  if (!has('--no-desktop')) for (const p of DESKTOP_PAGES.filter((x) => !ONLY || ONLY.includes(x))) { if (VERBOSE) console.log('desktop ' + p); await visit(DESKTOP, 'desktop', p, null); }
  await browser.close(); if (server) server.close();

  /* report */
  const count = Object.fromEntries(KINDS.map((k) => [k, 0])); let errs = 0, fails = 0;
  for (const r of report) { for (const k of KINDS) count[k] += (r.findings[k] || []).length; errs += (r.errors || []).length; fails += (r.failed || []).length; }
  for (const k of KINDS) {
    const rows = report.filter((r) => (r.findings[k] || []).length);
    if (!rows.length) continue;
    const hard = HARD.includes(k);
    console.log('\n' + k.toUpperCase() + ': ' + count[k] + ' on ' + rows.length + ' page states' + (hard ? '  (fails the audit)' : ''));
    for (const r of rows) {
      const f = r.findings[k];
      console.log('  ' + r.where + ' ' + r.page + ' [' + r.state + '] ' + f.length);
      for (const x of f.slice(0, hard || VERBOSE ? 12 : 3)) console.log('      ' + x.what + (x.by ? '  <- ' + (Array.isArray(x.by) ? x.by.join(', ') : x.by) : '') + (x.points ? ' ' + x.points : '') + (x.px ? ' ' + x.px + 'px' : '') + (x.how ? ' ' + x.how : '') + (x.ratio ? ' ' + x.ratio + ':1 ' + x.fg + ' on ' + x.bg : '') + (x.size ? ' ' + x.size : ''));
    }
  }
  const noisy = report.filter((r) => (r.errors || []).length || (r.failed || []).length);
  if (noisy.length) { console.log('\nERRORS AND FAILED REQUESTS'); for (const r of noisy) { console.log('  ' + r.where + ' ' + r.page); for (const e of [...r.errors, ...r.failed].slice(0, 6)) console.log('      ' + e); } }
  console.log('\nphone audit: ' + new Set(report.map((r) => r.where + r.page)).size + ' pages, ' + report.length + ' states. ' + KINDS.map((k) => k + ' ' + count[k]).join(', ') + ', console errors ' + errs + ', failed requests ' + fails);
  if (OUT) fs.writeFileSync(OUT, JSON.stringify(report, null, 1));
  const hardCount = HARD.reduce((s, k) => s + count[k], 0);
  const soft = KINDS.filter((k) => !HARD.includes(k)).reduce((s, k) => s + count[k], 0);
  if (hardCount || (has('--strict') && (soft || errs || fails))) { console.log('FAIL: ' + hardCount + ' covered, sticky or sideways findings'); process.exit(1); }
  console.log('PASS: nothing covered, no bar over 30% of the screen, no sideways scroll');
}
run().catch((e) => { console.error(e); process.exit(2); });
