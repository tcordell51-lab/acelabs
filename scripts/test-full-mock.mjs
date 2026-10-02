#!/usr/bin/env node
// Headless check of the four-section full-length mock (tools/mock/full.html) at 1280px and
// a true 390px. No npm dependencies: Node 22+ and Chrome, same CDP harness as the RC test.
//
//   perl -e 'alarm 300; exec @ARGV' node scripts/test-full-mock.mjs [--out DIR]
//
// Drives the real page through the whole day: landing, Natural Sciences (periodic table
// exhibit, mark, review screen), PAT (figures render), the optional break, RC (passage beside
// the question), QR (calculator arithmetic), then the report: raw scores and time per
// section, no prediction fields, a history record in the shared mock-history shape, and a
// resume of an interrupted test. Fails on any page exception or console error.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = 'file://' + path.join(ROOT, 'tools/mock/full.html');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ai = process.argv.indexOf('--out');
const OUT = ai > 0 ? path.resolve(process.argv[ai + 1]) : path.join(os.tmpdir(), 'acelabs-fullmock-shots');
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let failures = 0;
const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) failures++; };

async function withChrome(fn) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'fm-cdp-'));
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank'], { stdio: 'ignore' });
  try {
    let port = 0, wsUrl;
    for (let i = 0; i < 300 && !wsUrl; i++) {
      try {
        if (!port) port = Number(fs.readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]);
        const t = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((x) => x.type === 'page');
        if (t) wsUrl = t.webSocketDebuggerUrl;
      } catch { /* starting */ }
      if (!wsUrl) await sleep(150);
    }
    if (!wsUrl) throw new Error('chrome did not start');
    const ws = new WebSocket(wsUrl);
    await new Promise((r) => ws.addEventListener('open', r, { once: true }));
    let seq = 0;
    const pending = new Map();
    const errors = [];
    ws.addEventListener('message', (m) => {
      const d = JSON.parse(m.data);
      if (d.id && pending.has(d.id)) { const p = pending.get(d.id); pending.delete(d.id); d.error ? p.rej(new Error(d.error.message)) : p.res(d.result); }
      if (d.method === 'Runtime.exceptionThrown') errors.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text);
      if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') errors.push(d.params.args.map((a) => a.value || a.description).join(' '));
    });
    const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });
    await send('Page.enable');
    await send('Runtime.enable');
    const ev = async (expr) => {
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error('eval failed: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
      return r.result.value;
    };
    const shot = async (name, full) => {
      let clip;
      if (full) {
        const m = await send('Page.getLayoutMetrics');
        const h = Math.ceil((m.cssContentSize || m.contentSize).height);
        clip = { x: 0, y: 0, width: (m.cssContentSize || m.contentSize).width, height: Math.min(h, 6000), scale: 1 };
      }
      const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !!full, ...(clip ? { clip } : {}) });
      const f = path.join(OUT, name + '.png');
      fs.writeFileSync(f, Buffer.from(r.data, 'base64'));
      return f;
    };
    const nav = async (hash = '') => { await send('Page.navigate', { url: PAGE + hash }); await sleep(300); await send('Page.reload', { ignoreCache: true }); await sleep(900); }; // reload: a hash-only navigate is same-document
    await fn({ send, ev, shot, nav, errors });
    ws.close();
  } finally {
    chrome.kill('SIGKILL');
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}

async function run(width, height) {
  console.log(`\n== ${width}x${height}`);
  await withChrome(async ({ send, ev, shot, nav, errors }) => {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: width < 600 ? 2 : 1, mobile: width < 600 });
    await nav();
    await ev('localStorage.clear()');
    await nav();
    const land = await ev(`({w: innerWidth, cards: document.querySelectorAll('.tcard').length, mocks: ACE_FULL_MOCKS.mocks.length, sw: document.documentElement.scrollWidth})`);
    ok(land.w === width, `viewport is truly ${width}px`);
    ok(land.cards === land.mocks && land.mocks >= 1, `landing lists every full mock (${land.cards})`);
    ok(land.sw <= width, `landing has no horizontal scroll (${land.sw})`);
    const shots = [await shot(`fm-landing-${width}`, true)];

    await ev(`document.querySelector('.tcard').click()`);
    await sleep(200);
    ok(await ev(`/Survey of the Natural Sciences/.test(document.getElementById('pm').textContent)`), 'test opens on the Natural Sciences intro');
    await ev(`__fullMock.begin()`);
    await sleep(200);
    const s1 = await ev(`({sec: __fullMock.state().sec, n: __fullMock.items().length, opts: document.querySelectorAll('.pm-opt').length, sw: document.documentElement.scrollWidth, timer: document.getElementById('pmTimer').textContent})`);
    ok(s1.sec === 'sons' && s1.n === 100, `Natural Sciences has 100 questions (${s1.n})`);
    ok(s1.opts === 5, 'a science question shows five choices');
    ok(/^1:(30:00|29:5\d)$/.test(s1.timer), `science clock starts at 90 minutes (${s1.timer})`);
    ok(s1.sw <= width, `question screen has no horizontal scroll (${s1.sw})`);
    await ev(`document.querySelector('.pm-opt[data-pick="2"]').click()`);
    await ev(`document.getElementById('markBtn').click()`);
    await ev(`document.getElementById('exBtn').click()`);
    const pt = await ev(`({open: !!document.getElementById('pmPT') && !document.getElementById('pmPT').classList.contains('hidden'), cells: document.querySelectorAll('#pmPT td:not(.e)').length, rf: /Rf/.test(document.getElementById('pmPT').textContent)})`);
    ok(pt.open && pt.cells === 118, `Exhibit opens the periodic table (${pt.cells} elements)`);
    shots.push(await shot(`fm-science-pt-${width}`));
    await ev(`document.getElementById('exBtn').click()`);
    const st1 = await ev(`({a: __fullMock.state().answers.sons[0], m: __fullMock.state().marked.sons[0]})`);
    ok(st1.a === 2 && st1.m === true, 'answer and mark are recorded');
    // an OChem structure question draws its molecules
    const oc = await ev(`(function(){var l=__fullMock.items(); for (var i=70;i<100;i++) if (l[i].it.os || l[i].it.qs) return i; return -1;})()`);
    if (oc >= 0) {
      await ev(`(function(){var b=document.querySelector('[data-jump]');})()`);
      await ev(`document.getElementById('revBtn').click()`);
      await ev(`document.querySelector('[data-jump="${oc}"]').click()`);
      await sleep(300);
      const drawn = await ev(`Array.prototype.some.call(document.querySelectorAll('canvas[data-smiles]'), function(c){ var d=c.getContext('2d').getImageData(0,0,c.width,c.height).data; for (var i=0;i<d.length;i+=4) if (d[i]<120) return true; return false; })`);
      ok(drawn, `OChem question ${oc + 1} draws its structures`);
      shots.push(await shot(`fm-ochem-${width}`));
    }
    await ev(`document.getElementById('revBtn').click()`);
    const rev = await ev(`({cells: document.querySelectorAll('.pm-cell').length, marked: document.querySelectorAll('.pm-cell.mk').length})`);
    ok(rev.cells === 100 && rev.marked === 1, 'review screen lists 100 cells with the mark');
    shots.push(await shot(`fm-review-${width}`));
    await ev(`__fullMock.answerAll()`);
    await ev(`__fullMock.endSection()`);
    await sleep(100);

    // PAT
    for (let i = 0; i < 100 && !(await ev('__fullMock.patReady()')); i++) await sleep(150);
    ok(await ev('__fullMock.patReady()'), 'PAT test is built');
    await ev(`__fullMock.begin()`);
    await sleep(200);
    const p = await ev(`({sec: __fullMock.state().sec, n: __fullMock.items().length, svg: document.querySelectorAll('#pm svg').length, opts: document.querySelectorAll('.pat-area .opt').length, sw: document.documentElement.scrollWidth, ex: !!document.getElementById('exBtn')})`);
    ok(p.sec === 'pat' && p.n === 90, `PAT has 90 questions (${p.n})`);
    ok(p.svg > 2 && p.opts >= 4, `PAT figures render (${p.svg} svgs, ${p.opts} options)`);
    ok(!p.ex, 'no exhibit in PAT');
    ok(p.sw <= width, `PAT screen has no horizontal scroll (${p.sw})`);
    shots.push(await shot(`fm-pat-${width}`));
    await ev(`__fullMock.answerAll(function(x,i){ return i % 3 ? __fullMock.keyOf(x) : (__fullMock.keyOf(x) + 1) % 4; })`);
    await ev(`__fullMock.endSection()`);
    await sleep(200);
    const brk = await ev(`({at: __fullMock.state().at, t: (document.getElementById('brkTimer')||{}).textContent})`);
    ok(brk.at === 'break' && /^(30:00|29:5\d)$/.test(brk.t), `optional 30-minute break follows PAT (${brk.t})`);
    shots.push(await shot(`fm-break-${width}`));

    // interrupt during the break: reload, resume from the landing
    await nav();
    ok(await ev(`!!document.getElementById('resumeBtn')`), 'landing offers Resume after a reload');
    await ev(`document.getElementById('resumeBtn').click()`);
    for (let i = 0; i < 100 && !(await ev('__fullMock.patReady()')); i++) await sleep(150);
    await sleep(200);
    ok(await ev(`__fullMock.state().at === 'break' && __fullMock.state().answers.sons[0] !== null`), 'resume returns to the break with answers kept');
    await ev(`document.getElementById('brkEnd').click()`);
    await ev(`__fullMock.begin()`);
    await sleep(200);
    const rc = await ev(`({sec: __fullMock.state().sec, n: __fullMock.items().length, paras: document.querySelectorAll('.rc-pass p').length, opts: document.querySelectorAll('.rc-q .pm-opt').length, timer: document.getElementById('pmTimer').textContent, sw: document.documentElement.scrollWidth})`);
    ok(rc.sec === 'rc' && rc.n >= 48 && rc.n <= 50, `RC has ${rc.n} questions`);
    ok(rc.paras >= 8 && rc.opts === 5, `passage sits beside the question (${rc.paras} paragraphs)`);
    ok(/^(1:00:00|59:5\d)$/.test(rc.timer), `RC clock is 60 minutes (${rc.timer})`);
    ok(rc.sw <= width, `RC screen has no horizontal scroll (${rc.sw})`);
    if (width < 600) { await ev(`document.querySelector('[data-tab="q"]').click()`); await sleep(100); }
    shots.push(await shot(`fm-rc-${width}`));
    await ev(`__fullMock.answerAll()`);
    await ev(`__fullMock.endSection()`);
    await ev(`__fullMock.begin()`);
    await sleep(200);

    // QR + calculator
    const q = await ev(`({sec: __fullMock.state().sec, n: __fullMock.items().length, calc: !!document.getElementById('calcBtn'), ex: !!document.getElementById('exBtn')})`);
    ok(q.sec === 'qr' && q.n === 40 && q.calc && !q.ex, 'QR has 40 questions, a calculator, and no periodic table');
    await ev(`document.getElementById('calcBtn').click()`);
    for (const k of ['1', '2', '*', '3', '=', 'sqrt']) await ev(`document.querySelector('#pmCalc [data-k="${k}"]').click()`);
    ok(await ev(`document.getElementById('calcDisp').textContent`) === '6', 'calculator: sqrt(12 * 3) = 6');
    shots.push(await shot(`fm-qr-${width}`));
    await ev(`__fullMock.elapse(45*60)`);
    await sleep(600);   // the clock runs out and ends the test

    const rep = await ev(`({h: document.querySelector('.report h1') && document.querySelector('.report h1').textContent, cards: document.querySelectorAll('.sec-card').length, sw: document.documentElement.scrollWidth, txt: document.getElementById('report').textContent})`);
    ok(!!rep.h && rep.cards === 4, 'report opens with four section cards when the QR clock runs out');
    ok(!/scaled score is|predicted|percentile/i.test(rep.txt.replace(/does not convert practice scores to the scaled score/, '')), 'report carries no predicted or scaled score');
    ok(rep.sw <= width, `report has no horizontal scroll (${rep.sw})`);
    const hist = await ev(`JSON.parse(localStorage.getItem('al:mockHistory'))`);
    const r = hist && hist[hist.length - 1];
    ok(r && r.kind === 'full-length' && r.subjects && r.subjects.Biology.total === 40 && r.subjects.PAT.total === 90 && r.subjects.QR.total === 40, 'history record uses the shared shape with all six subjects');
    ok(r && r.sections.sons.timeSec > 0 && r.sections.qr.timeSec === 2700 && r.sections.qr.timeUp === true, 'time per section is recorded, QR capped at 45 minutes');
    ok(r && !('predicted' in r) && !('percentile' in r) && !('scaledScore' in r), 'no prediction fields in the record');
    ok(r && r.subjects.Biology.correct === 40 && r.subjects.QR.correct === 0, `raw scores add up (Bio ${r && r.subjects.Biology.correct}/40, QR ${r && r.subjects.QR.correct}/40)`);
    await ev(`Array.prototype.forEach.call(document.querySelectorAll('details.sec'), function(d){ d.open = true; })`);
    await sleep(500);
    const misses = await ev(`({n: document.querySelectorAll('.miss').length, links: document.querySelectorAll('.miss .links a').length})`);
    ok(misses.n >= 40, `every miss is listed with its fix (${misses.n} misses, ${misses.links} study links)`);
    shots.push(await shot(`fm-report-${width}`, true));
    await nav();
    ok(await ev(`!document.getElementById('resumeBtn') && /Open report/.test(document.body.textContent)`), 'landing lists the saved report and no stale resume');

    ok(errors.length === 0, 'no page exceptions or console errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
    console.log('  shots: ' + shots.join('\n         '));
  });
}

await run(1280, 800);
await run(390, 844);
console.log(failures ? `\nFAIL: ${failures} check(s)` : '\nPASS');
process.exit(failures ? 1 : 0);
