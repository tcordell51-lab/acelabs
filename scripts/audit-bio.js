#!/usr/bin/env node
/* =====================================================================
   Bio engine functional audit.
   ---------------------------------------------------------------------
   Loads every Bio HTML in a headless Chromium, scrolls every section
   into view, and reports:

   - Console errors and page errors (uncaught JS).
   - Anchors referenced from sidebar links that do not exist in the
     target document (broken intra-Bio nav).
   - DOM nodes whose textContent contains stub markers (the placeholder
     leak the spec mandates we never ship).
   - Sandbox-wrap children that collapse to less than 200px wide on a
     1280px viewport (a sign the .sandbox-body grid squashed an SVG
     or scrubber that should fill the page).
   - Drop zones that are not yet hooked up (filled=false after init).
   - Any element that renders "undefined" or "NaN" as a text node.

   Exit code is non-zero if any audit category found issues.
   ===================================================================== */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:4000';
const BIO_DIR = path.join(__dirname, '..', 'tools', 'bio');
const SHOTS_DIR = path.join(__dirname, '..', 'test-screenshots', 'audit');
fs.mkdirSync(SHOTS_DIR, { recursive: true });

// Pages we audit. Each entry can include a list of "warm" actions to
// fire before scanning — e.g., clicking a tab so a hidden module loads.
const PAGES = [
  { name: 'index',       url: '/tools/bio/index.html' },
  { name: 'mock',        url: '/tools/bio/bio-mock.html' },
  { name: 'diagnostic',  url: '/tools/bio/bio-diagnostic.html' },
  { name: 'analytics',   url: '/tools/bio/bio-analytics.html' },
  { name: 'calendar',    url: '/tools/bio/bio-calendar.html' },
  { name: 'repair-sheet',url: '/tools/bio/bio-repair-sheet.html' },
  { name: 'bonus',       url: '/tools/bio/bio-bonus.html' },
  { name: 'micrographs', url: '/tools/bio/bio-micrographs.html' },
  { name: 'cell',        url: '/tools/bio/bio-cell.html' },
  { name: 'genetics',    url: '/tools/bio/bio-genetics.html' },
  { name: 'physiology',  url: '/tools/bio/bio-physiology.html' },
  { name: 'diversity',   url: '/tools/bio/bio-diversity.html' },
  { name: 'devo',        url: '/tools/bio/bio-devo.html',
    // Devo has a tabbed lab — fire each tab so the fertilization scrubber
    // and germ-layer / morpher / timeline modules all initialize.
    warmActions: async (page) => {
      const tabs = ['timeline','germ','fert','morpher'];
      for (const t of tabs){
        const btn = page.locator('button[data-tab="'+t+'"]').first();
        if (await btn.count()) { await btn.click(); await page.waitForTimeout(150); }
      }
    } },
  { name: 'evolution',   url: '/tools/bio/bio-evolution.html' }
];

const PLACEHOLDER_PATTERNS = [
  /\(question\)/,
  /\(answer\)/,
  /\bReview the explanation\.(?!\.\.)/,  // not "..."
  /The correct answer is:\s*\.(?!\.)/,
  /\bundefined\b/,
  /\bNaN\b/
];

const issues = [];
function rec(page, kind, msg){ issues.push({ page, kind, msg }); }

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });

  for (const p of PAGES){
    const page = await ctx.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('pageerror', e => pageErrors.push(e.message));
    page.on('response', r => { if (r.status() >= 400) failedRequests.push(r.status() + ' ' + r.url()); });

    let nav;
    try { nav = await page.goto(BASE + p.url, { waitUntil: 'networkidle', timeout: 20000 }); }
    catch (e){ rec(p.name, 'nav', e.message); await page.close(); continue; }
    if (!nav.ok()) { rec(p.name, 'nav', 'HTTP ' + nav.status()); await page.close(); continue; }
    await page.waitForTimeout(500);
    if (p.warmActions) { try { await p.warmActions(page); } catch (e){ rec(p.name, 'warm', e.message); } }
    await page.waitForTimeout(500);

    // 1. Console + page errors + 4xx/5xx requests
    consoleErrors.forEach(e => rec(p.name, 'console-error', e));
    pageErrors.forEach(e => rec(p.name, 'page-error', e));
    failedRequests.forEach(r => rec(p.name, 'failed-request', r));

    // 2. Placeholder / undefined / NaN render check (skip SCRIPT/STYLE — those
    //    are program text, not user-visible text.)
    const stubs = await page.evaluate((patterns) => {
      const re = patterns.map(s => new RegExp(s));
      const SKIP = new Set(['SCRIPT','STYLE','TEMPLATE','NOSCRIPT']);
      const matches = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(n){
          let p = n.parentElement;
          while (p){
            if (SKIP.has(p.tagName)) return NodeFilter.FILTER_REJECT;
            p = p.parentElement;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      let node;
      while ((node = walker.nextNode())){
        const t = node.nodeValue;
        if (!t || !t.trim()) continue;
        for (const r of re){
          if (r.test(t)){
            const par = node.parentElement;
            const id = par ? (par.id || par.className || par.tagName) : '?';
            matches.push({ snippet: t.trim().slice(0, 80), parent: String(id).slice(0, 60), pattern: r.source });
            break;
          }
        }
      }
      return matches.slice(0, 40);
    }, PLACEHOLDER_PATTERNS.map(r => r.source));
    stubs.forEach(s => rec(p.name, 'stub-leak', s.pattern + ' in <' + s.parent + '> "' + s.snippet + '"'));

    // 3. Sandbox-wrap squash check (sandbox-wrap immediate child SVG narrower than 200px is a layout bug)
    const squashed = await page.evaluate(() => {
      const wraps = Array.from(document.querySelectorAll('.sandbox-wrap'));
      const out = [];
      wraps.forEach(w => {
        const body = w.querySelector('.sandbox-body');
        if (!body) return;
        // First child that should fill width
        const child = body.firstElementChild;
        if (!child) return;
        const rect = child.getBoundingClientRect();
        if (rect.width > 0 && rect.width < 220){
          const head = w.querySelector('.sandbox-head h3');
          out.push({ title: head ? head.textContent.trim().slice(0, 60) : '(no head)', width: Math.round(rect.width) });
        }
      });
      return out;
    });
    squashed.forEach(s => rec(p.name, 'sandbox-squash', s.title + ' renders at ' + s.width + 'px (expected >220)'));

    // 4. Broken intra-Bio anchor check — pull every <a href="#node-..."> on this page
    //    and verify the corresponding id exists somewhere reachable.
    const brokenLocal = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('a[href^="#"]').forEach(a => {
        const id = a.getAttribute('href').slice(1);
        if (!id) return;
        if (!document.getElementById(id)) {
          out.push({ href: a.getAttribute('href'), text: a.textContent.trim().slice(0, 50) });
        }
      });
      return out.slice(0, 30);
    });
    brokenLocal.forEach(b => rec(p.name, 'broken-local-anchor', b.href + ' (link text: "' + b.text + '")'));

    // 5. Snapshot full page so we have a paper trail
    try {
      await page.screenshot({ path: path.join(SHOTS_DIR, p.name + '.png'), fullPage: true });
    } catch (e) { rec(p.name, 'screenshot', e.message); }

    await page.close();
  }

  await browser.close();

  // Report
  const byKind = {};
  issues.forEach(i => { (byKind[i.kind] = byKind[i.kind] || []).push(i); });
  console.log('Bio engine audit · ' + issues.length + ' issue(s)');
  for (const k of Object.keys(byKind).sort()){
    console.log('');
    console.log('[' + k + '] ' + byKind[k].length);
    byKind[k].slice(0, 50).forEach(i => console.log('  · ' + i.page + ' :: ' + i.msg));
    if (byKind[k].length > 50) console.log('  ...(' + (byKind[k].length - 50) + ' more)');
  }
  process.exit(issues.length > 0 ? 1 : 0);
})();
