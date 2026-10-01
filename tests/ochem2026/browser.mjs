// Shared headless helpers: a static server over the worktree and a Chrome page.
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, extname, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(join(homedir(), 'code/dat-game-forge/package.json'));
const puppeteer = require('puppeteer-core');
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
export async function serve(){
  const srv = createServer((q, r) => { let p = join(ROOT, decodeURIComponent(new URL(q.url, 'http://x').pathname)); if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html'); if (!p.startsWith(ROOT) || !existsSync(p)){ r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': mime[extname(p)] || 'text/plain' }); r.end(readFileSync(p)); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  return { srv, base: 'http://127.0.0.1:' + srv.address().port };
}
export async function launch(){
  return puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
}
