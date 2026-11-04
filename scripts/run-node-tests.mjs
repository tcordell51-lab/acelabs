#!/usr/bin/env node
// run-node-tests.mjs : node --test over every *.test.js in the given test folders, on any shell.
//
//   node scripts/run-node-tests.mjs [--test-flag ...] FOLDER...
//   e.g. node scripts/run-node-tests.mjs tests/kit tests/loop tests/doors tests/player 'tests/areas/*'
//
// A folder may end in /* for "each folder inside it" (tests/areas/* is tests/areas/bio, tests/areas/qr
// and so on). Each folder contributes its own *.test.js files (not its subfolders, so fixtures/ stays
// out). A folder that does not exist yet, or holds no test, is skipped quietly: later batches add
// tests/doors, tests/player and tests/areas/<area> as they land, and a shell glob over a missing
// folder (tests/doors/*.test.js) is passed through unexpanded, or fails, depending on the shell.
// Arguments that start with -- go to node --test as they are (--test-reporter=spec, say).
// With no folders it runs the test:kit set above. Exit code: node --test's, or 0 when nothing ran.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const KIT_SET = ['tests/kit', 'tests/loop', 'tests/doors', 'tests/player', 'tests/areas/*'];

const isDir = (p) => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };
export function testFiles(folders, root = ROOT) {
  const dirs = [];
  for (const f of folders) {
    const clean = f.replace(/\\/g, '/').replace(/\/+$/, '');
    if (clean.endsWith('/*')) {
      const parent = path.join(root, clean.slice(0, -2));
      if (!isDir(parent)) continue;
      for (const e of fs.readdirSync(parent, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) if (e.isDirectory()) dirs.push(path.join(parent, e.name));
    } else if (isDir(path.join(root, clean))) dirs.push(path.join(root, clean));
  }
  const out = [];
  for (const d of dirs) for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) if (e.isFile() && e.name.endsWith('.test.js')) out.push(path.relative(root, path.join(d, e.name)).split(path.sep).join('/'));
  return [...new Set(out)];
}

function main() {
  const args = process.argv.slice(2);
  const flags = args.filter((a) => a.startsWith('--'));
  const folders = args.filter((a) => !a.startsWith('--'));
  const files = testFiles(folders.length ? folders : KIT_SET);
  if (!files.length) { console.log(`run-node-tests: no *.test.js in ${(folders.length ? folders : KIT_SET).join(', ')} (nothing to run)`); return 0; }
  const r = spawnSync(process.execPath, ['--test', ...flags, ...files], { cwd: ROOT, stdio: 'inherit' });
  if (r.error) { console.error('run-node-tests: ' + r.error.message); return 2; }
  return r.status == null ? 1 : r.status;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) process.exit(main());
