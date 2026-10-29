#!/usr/bin/env node
// gate-shared-versions.mjs : a changed /shared/ file always ships under a new ?v=.
//
//   node gate-shared-versions.mjs [repoRoot]   exit 1 on a stale buster, prints file + sites
//
// netlify.toml serves /shared/* with "Cache-Control: public, max-age=31536000, immutable",
// so a returning browser never re-fetches a shared file whose URL did not change. Rules:
//   1. every <script src>/<link href> that points into /shared/ carries ?v=
//   2. every page uses the same ?v= for the same shared file
//   3. the shared file's last commit is not newer than the commit that set that ?v=
//      (git log -S), and the file has no uncommitted change
// Needs git history (CI: actions/checkout with fetch-depth: 0). Without git it only
// checks rules 1 and 2. Dependency-free, ~1 s.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(process.argv[2] || '.');
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
const git = (...a) => { try { return execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; } };
const hasGit = git('rev-parse', '--is-inside-work-tree') === 'true';

const byFile = new Map();
const re = /<(?:script|link)\b[^>]*?(?:src|href)\s*=\s*["']([^"'?#]+\.(?:js|css|mjs))(?:\?v=([^"'&#]+))?["']/gi;
for (const rel of walk(ROOT)) {
  if (!/\.html?$/.test(rel)) continue;
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '));
  let m;
  while ((m = re.exec(src))) {
    const u = m[1]; if (/^(https?:)?\/\//.test(u)) continue;
    const abs = u.startsWith('/') ? u.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(rel), u));
    if (!abs.startsWith('shared/')) continue;
    const v = m[2] == null ? null : m[2];
    if (!byFile.has(abs)) byFile.set(abs, new Map());
    const vs = byFile.get(abs); if (!vs.has(v)) vs.set(v, []);
    vs.get(v).push(`${rel}:${lineOf(src, m.index)}`);
  }
}
const problems = [];
for (const [file, vs] of [...byFile].sort()) {
  if (!fs.existsSync(path.join(ROOT, file))) { problems.push(`${file}: included but missing on disk (${[...vs.values()].flat().slice(0, 3).join(', ')})`); continue; }
  const none = vs.get(null);
  if (none) problems.push(`${file}: ${none.length} include(s) without ?v= under an immutable cache header: ${none.slice(0, 3).join(', ')}${none.length > 3 ? ' ...' : ''}`);
  const versions = [...vs.keys()].filter((v) => v != null);
  if (versions.length > 1) problems.push(`${file}: pages disagree on ?v= (${versions.map((v) => `v=${v} x${vs.get(v).length}`).join(', ')})`);
  if (!hasGit || !versions.length) continue;
  if (git('status', '--porcelain', '--', file)) problems.push(`${file}: has uncommitted changes; bump ?v= in the same commit`);
  const changed = git('log', '-1', '--format=%ct %h %cs', '--', file);
  if (!changed) continue;
  const [ct, hash, date] = changed.split(' ');
  for (const v of versions) {
    const bump = git('log', '-1', '--format=%ct %h %cs', '-S', `${path.basename(file)}?v=${v}`, '--', '*.html', '**/*.html');
    if (!bump) { problems.push(`${file}: ?v=${v} never appears in git history (${vs.get(v)[0]})`); continue; }
    const [bt, bh, bd] = bump.split(' ');
    if (+ct > +bt) problems.push(`${file}: changed in ${hash} (${date}) after ?v=${v} was set in ${bh} (${bd}); ${vs.get(v).length} page(s) still load ?v=${v}, e.g. ${vs.get(v)[0]}`);
  }
}
console.log(`  ${byFile.size} shared files included from served pages${hasGit ? '' : ' (no git: history rules skipped)'}`);
if (problems.length) {
  console.error(`gate-shared-versions: ${problems.length} stale or missing cache buster(s)`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log('gate-shared-versions: OK (every /shared/ include is versioned and current)');
