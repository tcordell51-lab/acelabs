#!/usr/bin/env node
/**
 * dedupe-qr-options.js
 *
 * Scans scripts/dat-mock-bank.json for QR items (section === "QR") where
 * the opts array contains duplicate values. For each duplicate found, replaces
 * the later duplicate with a plausible distractor:
 *   - currency strings ($N.NN): offset by +1 or -1 dollar
 *   - count integers (whole numbers): offset by +1 or -1
 *   - decimal / float: offset by the smallest rounding unit present
 *   - percentage strings (N%): offset by +1 or -1 percentage point
 *   - fraction strings (N/D): keep as-is (too risky to auto-generate)
 *
 * Writes the fixed bank to a copy first, then overwrites the original.
 * Prints a summary of every item fixed.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const BANK_PATH = path.join(__dirname, 'dat-mock-bank.json');
const BACKUP_PATH = path.join(__dirname, 'dat-mock-bank.backup.json');

// ── helpers ──────────────────────────────────────────────────────────────────

function isCurrency(s) {
  return typeof s === 'string' && /^\$[\d,]+(\.\d+)?$/.test(s.trim());
}

function isPercentage(s) {
  return typeof s === 'string' && /^[\d.]+%$/.test(s.trim());
}

function isFraction(s) {
  return typeof s === 'string' && /^\d+\/\d+$/.test(s.trim());
}

function isMixedNumber(s) {
  return typeof s === 'string' && /^\d+ \d+\/\d+$/.test(s.trim());
}

/**
 * Given an option value and the full opts array (for context), produce
 * a replacement that is plausible but different from every value already
 * in opts. Tries offset +1 first, then -1, then +2, etc.
 */
function makeDistractor(val, allOpts, correctVal) {
  const taken = new Set(allOpts.map(o => String(o).trim()));

  if (isCurrency(val)) {
    const num = parseFloat(val.replace(/[$,]/g, ''));
    for (const delta of [1, -1, 2, -2, 5, -5, 10]) {
      const candidate = `$${(num + delta).toFixed(2).replace(/\.00$/, '')}`;
      if (!taken.has(candidate)) return candidate;
    }
    return val + ' (alt)';
  }

  if (isPercentage(val)) {
    const num = parseFloat(val);
    for (const delta of [1, -1, 2, -2, 5, -5, 10]) {
      const candidate = `${(num + delta).toFixed(num % 1 !== 0 ? 1 : 0)}%`;
      if (!taken.has(candidate)) return candidate;
    }
    return val + ' (alt)';
  }

  if (isFraction(val) || isMixedNumber(val)) {
    // Too structurally complex to auto-alter safely; tag it for manual review.
    return val + '*';
  }

  // Numeric (integer or decimal)
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (!isNaN(num)) {
    // Determine rounding unit from string representation
    const str = String(val).trim();
    const decPlaces = str.includes('.') ? (str.split('.')[1] || '').length : 0;
    const unit = decPlaces === 0 ? 1 : Math.pow(10, -decPlaces);

    for (const delta of [1, -1, 2, -2, 5, -5, 10, -10]) {
      const raw = num + delta * unit;
      const candidate = decPlaces === 0 ? String(Math.round(raw)) : raw.toFixed(decPlaces);
      if (!taken.has(candidate) && !taken.has(String(raw))) return candidate;
    }
    return val + ' (alt)';
  }

  // String fallback — append a distinguishing suffix
  const candidate = val + ' (alt)';
  return taken.has(candidate) ? val + ' (b)' : candidate;
}

// ── main ─────────────────────────────────────────────────────────────────────

const raw = fs.readFileSync(BANK_PATH, 'utf8');
const bank = JSON.parse(raw);

// Support both array root and {"qr": [...]} wrapper
let items;
let isWrapped = false;
if (Array.isArray(bank)) {
  items = bank;
} else if (bank && Array.isArray(bank.qr)) {
  items = bank.qr;
  isWrapped = true;
} else {
  console.error('Unexpected bank format — expected array or {qr: [...]}');
  process.exit(1);
}

const qrItems = items.filter(item => item.section === 'QR');
console.log(`Total items in bank: ${items.length}`);
console.log(`QR items: ${qrItems.length}`);

let fixedCount = 0;
const fixLog = [];

for (const item of qrItems) {
  if (!Array.isArray(item.opts)) continue;

  let changed = false;
  const seen = new Set();

  for (let i = 0; i < item.opts.length; i++) {
    const val = String(item.opts[i]).trim();
    if (seen.has(val)) {
      // Duplicate found — generate a replacement
      const replacement = makeDistractor(item.opts[i], item.opts, item.opts[item.correct]);
      fixLog.push(`  [${item.id}] opts[${i}] duplicate "${val}" -> "${replacement}"`);
      item.opts[i] = replacement;
      changed = true;
    } else {
      seen.add(val);
    }
  }

  if (changed) fixedCount++;
}

console.log(`\nItems with duplicate opts fixed: ${fixedCount}`);
if (fixLog.length > 0) {
  console.log('\nChanges made:');
  fixLog.forEach(l => console.log(l));
}

// Write backup first, then overwrite original
fs.writeFileSync(BACKUP_PATH, raw, 'utf8');
console.log(`\nBackup written to: ${BACKUP_PATH}`);

const output = isWrapped ? { ...bank, qr: items } : items;
fs.writeFileSync(BANK_PATH, JSON.stringify(output), 'utf8');
console.log(`Fixed bank written to: ${BANK_PATH}`);
console.log('\nDone.');
