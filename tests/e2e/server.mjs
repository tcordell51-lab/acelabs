// A tiny static server for the end-to-end run: serves the repo root the way Netlify serves the
// published folder (directory index, .html optional, _redirects and 200 rewrites). No functions: the sign-in
// flag is off by default, so the site behaves the same. node tests/e2e/server.mjs [port]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon', '.txt': 'text/plain' };

// _redirects, the Netlify way: a rule applies when no file answers, or always when forced (!).
const RULES = fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
  .map((l) => l.split(/\s+/)).filter((x) => x.length >= 2).map(([from, to, code = '301']) => ({ from, to, code: parseInt(code, 10) || 301, force: /!$/.test(code) }));
function exists(p) { const f = path.join(ROOT, p); return (fs.existsSync(f) && (!fs.statSync(f).isDirectory() || fs.existsSync(path.join(f, 'index.html')))) || fs.existsSync(f + '.html'); }
function redirect(p) {
  for (const r of RULES) {
    if (r.code === 200) continue;
    const splat = r.from.endsWith('*'), base = splat ? r.from.slice(0, -1) : r.from;
    if (splat ? p.startsWith(base) : (p === base || p === base.replace(/\/$/, ''))) {
      if (!r.force && exists(p)) return null;
      return r.to.replace(':splat', splat ? p.slice(base.length) : '');
    }
  }
  return null;
}
// 200 rules are rewrites: serve the target file at the same address when no file answers.
function rewrite(p) {
  for (const r of RULES) {
    if (r.code !== 200 || r.from.endsWith('*')) continue;
    if (p === r.from && (r.force || !exists(p)) && /^\//.test(r.to)) return r.to;
  }
  return null;
}

export function start(port = 0) {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.includes('..') || /^\/(node_modules|\.git)(\/|$)/.test(p)) { res.writeHead(403); return res.end(); }
    const to = redirect(p);
    if (to && /^\//.test(to)) { res.writeHead(302, { Location: to }); return res.end(); }
    let f = path.join(ROOT, rewrite(p) || p);
    try {
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
      else if (!fs.existsSync(f) && fs.existsSync(f + '.html')) f += '.html';
      const body = fs.readFileSync(f);
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(body);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/html' }); res.end('<!doctype html><title>Not found</title><h1>Not found</h1>');
    }
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve({ server, url: 'http://127.0.0.1:' + server.address().port })));
}

if (process.argv[1] && process.argv[1].endsWith('server.mjs')) {
  start(Number(process.argv[2]) || 4400).then(({ url }) => console.log('serving ' + ROOT + ' at ' + url));
}
