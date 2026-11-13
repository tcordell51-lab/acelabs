// scripts/lib/site.mjs : serve the checkout like Netlify does, name the page sets, open Chromium.
//
// Shared by audit-pages.mjs and shoot-pages.mjs.
//   startServer(root, { port, csp })  a static server on 127.0.0.1 that follows _redirects and the
//                                     netlify.toml redirects (200 rewrites, forced 3xx), pretty URLs
//                                     (/dir -> /dir/, /page -> /page.html), 404.html, and the site CSP
//                                     from netlify.toml (so a font host the CSP drops shows up as an error)
//   pagesFrom(root, tokens)           page paths from arguments: paths, @preset (doors, b1, all) or @list.txt
//   launchChromium()                  Playwright Chromium (ACE_CHROMIUM or CHROME, else /opt/pw-browsers/chromium
//                                     when present, else Playwright's own); --no-sandbox when running as root
//   batchName(root, flag)             --batch, else "b1" from a build/b1-... branch, else "local"
//   slugOf(page)                      a file-name-safe name for a page ("/" is "today")
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { redirectRules, servedFiles, urlOf } from './served.mjs';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.wav': 'audio/wav', '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm', '.xml': 'application/xml', '.md': 'text/plain; charset=utf-8',
};
export function siteCsp(root) {
  const f = path.join(root, 'netlify.toml'); if (!fs.existsSync(f)) return null;
  const m = fs.readFileSync(f, 'utf8').match(/^\s*Content-Security-Policy\s*=\s*"([^"]+)"/m); return m ? m[1] : null;
}

export function startServer(root, { port = 0, csp = true } = {}) {
  const rules = redirectRules(root); const policy = csp ? siteCsp(root) : null;
  const fileAt = (p) => { const f = path.join(root, p); if (!f.startsWith(root)) return null; try { const st = fs.statSync(f); return st.isFile() ? f : st.isDirectory() ? 'dir' : null; } catch { return null; } };
  const ruleFor = (p, exists) => {
    for (const r of rules) {
      if (!r.force && exists) continue;
      let ok = false, splat = '';
      if (r.from.endsWith('/*')) { const pre = r.from.slice(0, -1); if (p.startsWith(pre)) { ok = true; splat = p.slice(pre.length); } }
      else ok = r.from === p || r.from === p.replace(/\/$/, '');
      if (ok) return { ...r, target: r.to.replace(':splat', splat) };
    }
    return null;
  };
  const server = http.createServer((req, res) => {
    let p;
    try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400); res.end(); return; }
    const q = new URL(req.url, 'http://x').search;
    const send = (file, status = 200) => {
      const head = { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
      if (policy && /\.html?$/.test(file)) head['Content-Security-Policy'] = policy;
      res.writeHead(status, head); if (req.method === 'HEAD') { res.end(); return; } fs.createReadStream(file).pipe(res);
    };
    const resolveFile = (pp) => {
      const hit = fileAt(pp);
      if (hit === 'dir') { if (!pp.endsWith('/')) return { redirect: pp + '/' }; const idx = fileAt(pp + 'index.html'); return idx && idx !== 'dir' ? { file: idx } : null; }
      if (hit) return { file: hit };
      const html = fileAt(pp + '.html'); return html && html !== 'dir' ? { file: html } : null;
    };
    let found = resolveFile(p);
    const r = ruleFor(p, !!(found && found.file));
    if (r) {
      if (r.status >= 300 && r.status < 400) { res.writeHead(r.status, { Location: r.target + q }); res.end(); return; }
      if (r.status === 200) found = resolveFile(r.target);
    }
    if (found && found.redirect) { res.writeHead(301, { Location: found.redirect + q }); res.end(); return; }
    if (found && found.file) return send(found.file);
    const nf = fileAt('/404.html'); if (nf && nf !== 'dir') return send(nf, 404);
    res.writeHead(404); res.end('not found');
  });
  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => resolve({ url: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((r) => server.close(r)) }));
  });
}

/* ---------- page sets ---------- */
export const DOORS = ['/', '/learn/', '/practice/', '/tests/', '/review/'];
// B1 acceptance: the doors, the first-run and test pages, three engines per section, two support pages (30)
export const B1 = [
  ...DOORS, '/performance/', '/onboarding.html', '/diagnostic.html', '/prometric-mock.html', '/tools/mock/full.html',
  '/tools/bio/index.html', '/tools/bio/bio-cell.html', '/tools/bio-retold/index.html',
  '/tools/gc/index.html', '/tools/gc/recognition-lab.html', '/tools/gchem/index.html',
  '/tools/ochem/index.html', '/tools/ochem/tree/index.html', '/tools/organic/index.html',
  '/tools/pat/index.html', '/tools/pat/holepunch.html', '/tools/pat-retold/index.html',
  '/tools/rc/index.html', '/tools/rc-retold/index.html', '/retold/',
  '/tools/qr/index.html', '/tools/qr-retold/index.html', '/tools/minitests/index.html',
  '/games/index.html', '/cheat-sheets.html',
];
export function pagesFrom(root, tokens) {
  const out = [];
  for (const t of tokens) {
    const name = t.replace(/^@/, '');
    if (name === 'doors') out.push(...DOORS);
    else if (name === 'b1') out.push(...B1);
    else if (name === 'all') out.push(...servedFiles(root, { exts: new Set(['.html']) }).map(urlOf));
    else if (t.startsWith('@')) out.push(...pagesFrom(root, fs.readFileSync(path.resolve(name), 'utf8').split('\n').map((l) => l.replace(/#.*/, '').trim()).filter(Boolean)));
    else out.push(t.startsWith('/') ? t : '/' + t.replace(/^\.\//, ''));
  }
  return [...new Set(out)];
}
export const slugOf = (page) => {
  const [p, h] = page.split('#'); const base = p.split('?')[0];
  const s = base === '/' ? 'today' : base.replace(/^\/|\/$/g, '').replace(/\/index\.html$/, '').replace(/\.html?$/, '').replace(/[^\w.-]+/g, '-');
  return (s || 'today') + (h ? '-' + h.replace(/[^\w-]+/g, '-') : '');
};

/* ---------- browser ---------- */
export async function launchChromium() {
  let pw;
  try { pw = await import('playwright'); } catch { throw new Error('playwright is not installed (npm install; it is a devDependency)'); }
  const chromium = pw.chromium || (pw.default && pw.default.chromium);
  const cand = [process.env.ACE_CHROMIUM, process.env.CHROME, '/opt/pw-browsers/chromium'].filter(Boolean).find((f) => { try { return fs.statSync(f).isFile(); } catch { return false; } });
  const args = typeof process.getuid === 'function' && process.getuid() === 0 ? ['--no-sandbox'] : [];
  return chromium.launch({ ...(cand ? { executablePath: cand } : {}), args });
}
export function batchName(root, flag) {
  if (flag) return flag.replace(/[^\w.-]+/g, '-');
  try { const b = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); const m = b.match(/^build\/(b[\w.]*?)(?:-|$)/i); if (m) return m[1].toLowerCase(); } catch { /* no git */ }
  return 'local';
}
export async function settle(page, ms = 400) {
  try { await page.waitForLoadState('networkidle', { timeout: 4000 }); } catch { /* long-polling pages */ }
  try { await page.evaluate(() => document.fonts && document.fonts.ready.then(() => true)); } catch { /* navigated */ }
  await page.waitForTimeout(ms);
}
