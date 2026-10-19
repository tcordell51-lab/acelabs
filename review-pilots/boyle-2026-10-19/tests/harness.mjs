/* Shared helpers for the browser test and the frame exporter: a tiny static
   server rooted at the pilot folder and a Playwright loader that prefers the
   repo's devDependency and falls back to the preinstalled global copy. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

export const PILOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.otf': 'font/otf', '.vtt': 'text/vtt', '.png': 'image/png', '.json': 'application/json' };

export function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html';
      const file = path.resolve(PILOT, rel);
      if (!file.startsWith(PILOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('not found'); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, url: 'http://127.0.0.1:' + server.address().port + '/' }));
  });
}

export function loadPlaywright() {
  const req = createRequire(import.meta.url);
  for (const p of ['playwright', '/opt/node22/lib/node_modules/playwright']) {
    try { return req(p); } catch (e) { /* try next */ }
  }
  throw new Error('Playwright not found (repo devDependency or global install).');
}

export async function launch() {
  const { chromium } = loadPlaywright();
  try { return await chromium.launch(); }
  catch (e) { return chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); }
}
