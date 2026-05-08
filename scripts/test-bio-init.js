#!/usr/bin/env node
/* Iteratively run init() against each bio hub and report any unguarded crashes. */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const HUBS = [
  'bio-cell.html',
  'bio-genetics.html',
  'bio-physiology.html',
  'bio-diversity.html',
  'bio-devo.html',
  'bio-evolution.html',
];
const SHARED = 'bio-shared.js';
const DIR = path.join(__dirname, '..', 'tools', 'bio');

const js = fs.readFileSync(path.join(DIR, SHARED), 'utf8');

let totalErrors = 0;

for (const hub of HUBS) {
  const html = fs.readFileSync(path.join(DIR, hub), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/' });
  // Stub localStorage on the window
  Object.defineProperty(dom.window, 'localStorage', {
    value: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    writable: false,
  });

  const errs = [];
  dom.window.addEventListener('error', e => errs.push(e.message));

  try { dom.window.eval(js); }
  catch (e) { console.log(`[${hub}] EVAL ERROR: ${e.message}`); totalErrors++; continue; }

  const ev = new dom.window.Event('DOMContentLoaded');
  try { dom.window.document.dispatchEvent(ev); }
  catch (e) { errs.push(e.message); }

  if (errs.length) {
    console.log(`\n[${hub}] ERRORS (${errs.length}):`);
    errs.forEach((m, i) => console.log(`  ${i + 1}. ${m}`));
    totalErrors += errs.length;
  } else {
    console.log(`[${hub}] OK`);
  }
}

console.log(`\nTotal errors: ${totalErrors}`);
process.exit(totalErrors > 0 ? 1 : 0);
