#!/usr/bin/env node
// scan-why-residue.mjs : find text in full-length explanations that is not for students (CONTENT-FIX 3).
//
//   node scripts/scan-why-residue.mjs            scan every override in content/explainers/why-overrides.json
//                                                and the bank explanation of every other OChem item served in
//                                                the full-length forms; exit 1 if any override has a hit
//   node scripts/scan-why-residue.mjs --json     the same report as JSON
//
// Rules (build spec 1.10, OS-61): SMILES-like tokens, internal QA vocabulary, option letters and index
// pointers, verdict words, exclamation marks, em and en dashes, emojis, and non-ASCII outside the
// notation list. Bank explanations are only reported, never edited (build spec 1.5).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OVERRIDES = 'content/explainers/why-overrides.json';
const BANK = 'tools/mock/data/full-mocks.js';

// OS-61 notation list: allowed inside explainer text only
const NOTATION = new Set([0xd7, 0xb9, 0xb2, 0xb3, 0x3c0, 0x2212, 0x2264, 0x2265, 0xb0, 0x207a, 0x207b,
  ...Array.from({ length: 10 }, (_, i) => 0x2070 + i), ...Array.from({ length: 10 }, (_, i) => 0x2080 + i)]);

const QA = /\b(?:verified|verify|canonical|keyed|key(?:ed)? (?:is|answer)|answer key|confirmed|single correct answer|all valid,? unique|distractors?|reviewer|SA-C|QA|sanity|double-?check(?:ed)?|TODO|FIXME|correct\s*=|layers [a-z-]+ (?:regioselectivity|with)|rationale is)\b/i;
// the letter pattern of tests/player/why-overrides.test.js, plus a few more pointer shapes
const LETTER = /\b(?:options?|choices?|keyed option|opt)\s*\(?[A-E0-9]\b|\bcorrect\s*=\s*\d|\bindex \d\b|(?:^|\s)\([A-E]\)(?![-\w]| (?:alkene|isomer|geometry|double bond|configuration))|(?:^|[.;,] )[A-E] (?:is|n-|tert|ethyl|iso)\b|\bpath-[A-E]\b|\banswer (?:is )?[A-E]\b|\bopts?\[\d\]|\bidx\b/i;
const VERDICT = /\b(?:wrong(?:ly)?|incorrect(?:ly)?|fail(?:s|ed|ing)?)\b/i;
const FORMULA = /^(?:[A-Z][a-z]?\d*)+[+-]?$/;
const SMILES_CHARS = /^[BCNOSPFIclnosbrH()=#\[\]@+\-0-9\/\\%]{4,}$/;

function smilesTokens(text) {
  const out = [];
  for (const raw of text.split(/[\s,;:]+/)) {
    const t = raw.replace(/^[('"]+|[)'".]+$/g, '');
    if (!SMILES_CHARS.test(t) || t.split('/').every((x) => FORMULA.test(x))) continue; // Cl2/CCl4 is a reagent pair
    if (/H/.test(t.replace(/\[[^\]]*\]/g, ''))) continue; // CH3-C=O, H3O+: condensed formulas, not SMILES
    const branch = /[A-Za-z]\(/.test(t) || /\(=/.test(t);
    const ring = /[cnos]1|([A-Za-z])(\d)\D.*\d/.test(t) && /(\d)\D.*\1/.test(t); // a ring bond opened and closed
    const chain = /^(?:Br|Cl|[CNO])(?:Br|Cl|[CNOcno]){3,}/.test(t) || (t.match(/=/g) || []).length >= 2;
    const bonds = !/-/.test(t) && /[=#\/\\]/.test(t) && (t.match(/Br|Cl|[CNO]/g) || []).length >= 3; // C/C=C/CBr, C=CCCBr
    if (branch || ring || chain || bonds) out.push(raw);
  }
  return out;
}

export function scanText(text) {
  const hits = [];
  const add = (rule, m) => hits.push({ rule, match: m });
  for (const s of smilesTokens(text)) add('smiles', s);
  let m;
  if ((m = text.match(QA))) add('qa', m[0]);
  if ((m = text.match(LETTER))) add('letter', m[0]);
  if ((m = text.match(VERDICT))) add('verdict', m[0]);
  if (/!/.test(text)) add('exclamation', '!');
  for (const ch of text) {
    const c = ch.codePointAt(0);
    if (c >= 0x20 && c <= 0x7e) continue;
    if ((c >= 0x2010 && c <= 0x2015) || c === 0x2e3a || c === 0x2e3b) add('dash', ch);
    else if ((c >= 0x1f000 && c <= 0x1faff) || (c >= 0x2600 && c <= 0x27bf) || (c >= 0x2b00 && c <= 0x2bff) || c === 0xfe0f || c === 0x200d) add('emoji', ch);
    else if (!NOTATION.has(c)) add('non-ascii', 'U+' + c.toString(16).toUpperCase().padStart(4, '0'));
  }
  return hits;
}

export function bankItems(root = ROOT) {
  const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(root, BANK), 'utf8'), ctx);
  const out = new Map();
  for (const m of ctx.window.ACE_FULL_MOCKS.mocks) for (const [sec, arr] of Object.entries(m.sections)) {
    if (!Array.isArray(arr)) continue;
    arr.forEach((it, i) => { if (!out.has(it.id)) out.set(it.id, { it, sec, served: [] }); out.get(it.id).served.push(m.id + ' ' + sec + ' ' + (i + 1)); });
  }
  return out;
}

export function scanAll(root = ROOT) {
  const doc = JSON.parse(fs.readFileSync(path.join(root, OVERRIDES), 'utf8'));
  const overrides = [];
  for (const [id, o] of Object.entries(doc.overrides)) {
    const hits = scanText(o.why);
    if (hits.length) overrides.push({ id, held: !!o.held, hits });
  }
  const bank = [];
  let ochem = 0;
  for (const [id, { it, sec, served }] of bankItems(root)) {
    if (sec !== 'ochem' || doc.overrides['fm:' + id]) continue;
    ochem++;
    const hits = scanText(String(it.why || ''));
    if (hits.length) bank.push({ id: 'fm:' + id, served, hits });
  }
  return { overrideCount: Object.keys(doc.overrides).length, overrides, bankOchemScanned: ochem, bank };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = scanAll();
  if (process.argv.includes('--json')) console.log(JSON.stringify(r, null, 1));
  else {
    const fmt = (h) => h.map((x) => x.rule + ' "' + x.match + '"').join('; ');
    console.log('overrides scanned: ' + r.overrideCount + ', with residue: ' + r.overrides.length);
    for (const e of r.overrides) console.log('  ' + e.id + (e.held ? ' (held)' : '') + ': ' + fmt(e.hits));
    console.log('OChem bank explanations without an override scanned: ' + r.bankOchemScanned + ', with residue: ' + r.bank.length + ' (reported only; the bank is never edited)');
    for (const e of r.bank) console.log('  ' + e.id + ' [' + e.served.join(', ') + ']: ' + fmt(e.hits));
  }
  process.exit(r.overrides.length ? 1 : 0);
}
