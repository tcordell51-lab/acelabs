/* Deterministic silent animatic export: seeks the page frame by frame in
   render mode (1920x1080, fixed seed), screenshots each frame, then encodes
   H.264 with the local ffmpeg. Captions are burned into the frame's caption
   band; captions.vtt ships alongside as the sidecar track.
   Usage: node render/render-animatic.mjs [framesDir] [fps]            */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { serve, launch, PILOT } from '../tests/harness.mjs';

const framesDir = process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), 'boyle-frames-'));
const FPS = Number(process.argv[3] || 30), DURATION = 55;
const out = path.join(PILOT, 'exports');
fs.mkdirSync(framesDir, { recursive: true });
fs.mkdirSync(path.join(out, 'qa-stills'), { recursive: true });

const { server, url } = await serve();
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(url + 'index.html?render=1');
await page.waitForFunction(() => window.__boyleReady === true);

const total = DURATION * FPS;
for (let f = 0; f < total; f++) {
  await page.evaluate((t) => window.__boyle.seek(t), f / FPS);
  await page.screenshot({ path: path.join(framesDir, 'f' + String(f).padStart(5, '0') + '.png') });
}
// QA stills: every storyboard boundary plus the midpoint of each scientific transition.
const QA = [0, 4.5, 9, 12.5, 15, 18, 23, 28, 30, 34, 36, 38, 40.25, 43, 45, 47, 51, 54.9];
for (const t of QA) {
  await page.evaluate((tt) => window.__boyle.seek(tt), t);
  await page.screenshot({ path: path.join(out, 'qa-stills', 't' + t.toFixed(2).padStart(5, '0') + '.png') });
}
await browser.close(); server.close();
if (errors.length) { console.error('console errors:', errors); process.exit(1); }

const mp4 = path.join(out, 'boyle-animatic-silent.mp4');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(framesDir, 'f%05d.png'),
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-threads', '1', '-an',
  '-movflags', '+faststart', '-metadata', 'title=Boyle\'s law: halve the volume (silent review animatic)', mp4]);
// Contact sheet: one frame per second, 8 x 7 grid.
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', mp4, '-vf', 'fps=1,scale=480:-1,tile=8x7', '-frames:v', '1', path.join(out, 'contact-sheet-1fps.png')]);
console.log('frames:', total, 'in', framesDir);
console.log('wrote', mp4);
