// Ad-hoc QA stills: node render/shoot.mjs out-dir t1 t2 ...
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch } from '../tests/harness.mjs';
const [out, ...times] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const { server, url } = await serve();
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('console', (m) => { if (m.type() === 'error') console.log('console error:', m.text()); });
page.on('pageerror', (e) => console.log('pageerror:', e.message));
await page.goto(url + 'index.html?render=1');
await page.waitForFunction(() => window.__boyleReady === true);
for (const t of times) {
  await page.evaluate((tt) => window.__boyle.seek(tt), Number(t));
  await page.screenshot({ path: path.join(out, 't' + String(t).padStart(5, '0') + '.png') });
}
await browser.close(); server.close();
