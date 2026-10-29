#!/usr/bin/env node
// gate-localstorage-keys.mjs : no page reads a localStorage key that nothing ever writes.
//
//   node gate-localstorage-keys.mjs [repoRoot]   exit 1 on an orphan read, prints key + sites
//
// Reads  : getItem('literal') anywhere in served .html/.js/.mjs.
// Writes : setItem('literal' ...), setItem(NAME ...) where NAME = 'literal' in the same file,
//          setItem('prefix' + ..., ...), setItem(`prefix${...}`, ...), setItem(this.ns + ':' ...)
//          where ns: 'literal', and the shell's own write('literal') / writeRaw helpers.
// A read passes when a literal write matches it exactly or a literal prefix write covers it.
// ALLOW lists developer-only hooks that are set by hand from the console.
// Dependency-free, ~0.4 s.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] || '.');
const ALLOW = [
  { re: /^tt-face-/, why: 'face-video hook set by hand from the console (documented in the tiktok pages)' },
];
const SKIP_REL = /^(node_modules|\.git|docs|research|specs|scripts|test-screenshots|\.netlify|netlify|\.claude|dist-astro|astro-proto)(\/|$)|^tests\/[^/]+\//;
const SKIP_SEG = /(^|\/)(research|verification)(\/|$)/;
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name); const rel = path.relative(ROOT, p).split(path.sep).join('/');
    if (SKIP_REL.test(rel) || SKIP_SEG.test(rel)) continue;
    if (e.isDirectory()) walk(p, out); else out.push(rel);
  }
  return out;
}
const lineOf = (s, i) => s.slice(0, i).split('\n').length;
const reads = new Map(); const exact = new Set(); const prefixes = new Set();
const LIT = `(["'\`])([^"'\`$\\n]+)\\1`;
for (const rel of walk(ROOT)) {
  if (!/\.(html?|m?js)$/.test(rel)) continue;
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  if (!/localStorage|setItem|getItem/.test(src)) continue;
  // name -> literal (const/var/let NAME = 'x' | 'x' + ... ; also  ns: 'x'  object fields)
  const names = new Map(); let m;
  for (m of src.matchAll(/(?:const|var|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(["'`])([^"'`$\n]+)\2(\s*\+)?/g)) names.set(m[1], { lit: m[3], prefix: !!m[4] });
  for (m of src.matchAll(/\b([A-Za-z_$][\w$]*)\s*:\s*(["'`])([^"'`$\n]+)\2\s*[,}]/g)) if (!names.has(m[1])) names.set(m[1], { lit: m[3], prefix: true });
  // reads
  for (m of src.matchAll(new RegExp(`getItem\\s*\\(\\s*${LIT}\\s*\\)`, 'g'))) { const k = m[2]; if (!reads.has(k)) reads.set(k, []); reads.get(k).push(`${rel}:${lineOf(src, m.index)}`); }
  // writes
  for (m of src.matchAll(new RegExp(`(?:setItem|writeRaw|write|save|persist)\\s*\\(\\s*${LIT}\\s*(\\+|,|\\))`, 'g'))) (m[3] === '+' ? prefixes : exact).add(m[2]);
  for (m of src.matchAll(/setItem\s*\(\s*`([^`$]+)\$\{/g)) prefixes.add(m[1]);
  for (m of src.matchAll(/(?:setItem|writeRaw|write)\s*\(\s*(?:this\.)?([A-Za-z_$][\w$]*)\s*(\+|,)/g)) { const n = names.get(m[1]); if (n) (n.prefix || m[2] === '+' ? prefixes : exact).add(n.lit); }
  for (m of src.matchAll(/(?:setItem|writeRaw|write)\s*\(\s*(?:this\.)?([A-Za-z_$][\w$]*)\s*\+\s*(["'`])([^"'`$\n]*)\2/g)) { const n = names.get(m[1]); if (n) prefixes.add(n.lit + m[3]); }
}
const covered = (k) => exact.has(k) || [...prefixes].some((p) => p && k.startsWith(p)) || [...exact].some((e) => e.endsWith('.') || e.endsWith(':') ? k.startsWith(e) : false);
const orphans = [...reads.keys()].filter((k) => !covered(k) && !ALLOW.some((a) => a.re.test(k)));
console.log(`  literal reads ${reads.size}, exact writes ${exact.size}, prefix writes ${prefixes.size}`);
if (orphans.length) {
  console.error(`gate-localstorage-keys: ${orphans.length} key(s) are read but never written`);
  for (const k of orphans) console.error(`  ${JSON.stringify(k)}  read at ${reads.get(k).slice(0, 4).join(', ')}`);
  process.exit(1);
}
console.log('gate-localstorage-keys: OK (every literal read has a writer)');
