// node tests/ochem2026/shoot.mjs <path relative to repo> <out.png> [width] : screenshot a page, fail on console errors
import { serve, launch } from './browser.mjs';
const [path, out, w = '1280'] = process.argv.slice(2);
const { srv, base } = await serve(); const b = await launch(); const pg = await b.newPage();
await pg.setViewport({ width: +w, height: 900, deviceScaleFactor: 1 });
const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await pg.goto(base + '/' + path, { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1200));
const sw = await pg.evaluate(() => document.documentElement.scrollWidth);
await pg.screenshot({ path: out, fullPage: true });
console.log('saved', out, 'scrollWidth', sw, 'errors', errs.length ? errs : 'none');
await b.close(); srv.close();
