#!/usr/bin/env node
// Headless check of the RC player at 1280px and a true 390px (CDP device metrics,
// not --window-size, which clamps at 500px). No npm dependencies: Node 22+ and Chrome.
//
//   perl -e 'alarm 120; exec @ARGV' node scripts/test-rc-player.mjs [--out DIR]
//
// Drives the real page: home, a timed section (answer, strike, flag, highlight with a
// real text selection, the 10-minute cue, next passage), submit, results, and review of
// EVERY question (each must show a gold proof line with its quote underlined), then
// reload for history and resume. Fails on any page exception or console error.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = 'file://' + path.join(ROOT, 'tools/rc/index.html');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ai = process.argv.indexOf('--out');
const OUT = ai > 0 ? path.resolve(process.argv[ai + 1]) : path.join(os.tmpdir(), 'acelabs-rc-shots');
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let failures = 0;
const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) failures++; };

async function withChrome(fn) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rc-cdp-'));
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
    await nav('#home');
    const bank = await ev('({p: ACE_RC_BANK.order.length, s: ACE_RC_BANK.sections.length, w: innerWidth})');
    ok(bank.w === width, `viewport is truly ${width}px (got ${bank.w})`);
    const home = await ev(`({cards: document.querySelectorAll('[data-start="passage"]').length, secs: document.querySelectorAll('[data-start="section"]').length, sw: document.documentElement.scrollWidth})`);
    ok(home.cards === bank.p, `home lists every passage (${home.cards}/${bank.p})`);
    ok(home.secs === bank.s, `home lists every section (${home.secs}/${bank.s})`);
    ok(home.sw <= width, `home has no horizontal scroll (${home.sw})`);
    const sHome = await shot(`rc-home-${width}`, true);

    // timed section
    await ev(`document.querySelector('[data-start="section"]').click()`);
    await sleep(300);
    const t = await ev(`({view: AceRC.view(), n: AceRC.state().order.length, ps: AceRC.state().passageIds.length, limit: AceRC.state().limit, sw: document.documentElement.scrollWidth})`);
    ok(t.view === 'test' && t.ps === 3, 'a section opens with three passages');
    ok(t.n >= 48 && t.n <= 50, `section has ${t.n} questions`);
    ok(t.limit === 3600, 'section clock is 60 minutes');
    ok(t.sw <= width, `test view has no horizontal scroll (${t.sw})`);

    // answer, strike, flag
    await ev(`document.querySelector('[data-choice="1"]').click()`);
    await ev(`document.querySelector('[data-strike="3"]').click()`);
    await ev(`document.querySelector('[data-act="flag"]').click()`);
    const st = await ev(`({a: AceRC.state().answers[AceRC.state().order[0].qid], s: AceRC.state().strikes[AceRC.state().order[0].qid], f: AceRC.state().flags[AceRC.state().order[0].qid], struck: !!document.querySelector('.choice.struck'), sel: !!document.querySelector('.choice.sel')})`);
    ok(st.a === 1 && st.sel, 'choosing B selects it');
    ok(JSON.stringify(st.s) === '[3]' && st.struck, 'strike-through marks D');
    ok(st.f === true, 'flag sets');

    // highlight with a real selection, then the Highlight button
    const hl = await ev(`(async () => {
      const s = document.querySelector('#passagePane .sent[data-p="1"][data-s="1"]');
      const node = s.firstChild; const r = document.createRange(); r.setStart(node, 2); r.setEnd(node, 20);
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
      await new Promise(x => setTimeout(x, 80));
      document.querySelector('[data-act="hl"]').click();
      await new Promise(x => setTimeout(x, 80));
      return { marks: document.querySelectorAll('#passagePane mark.hl').length, stored: JSON.stringify(AceRC.state().hl) };
    })()`);
    ok(hl.marks >= 1 && /\[2,20\]/.test(hl.stored), `selection becomes a stored highlight (${hl.stored})`);

    // pace cue at ten minutes, gentle wording
    await ev('AceRC.tick(601)');
    const cue = await ev(`(document.querySelector('.cue') || {}).textContent || ''`);
    ok(/Ten minutes/.test(cue), 'ten-minute "switch to the questions" cue appears');
    ok(!/behind|slow|late|hurry|overdue|off.pace/i.test(cue), 'cue has no pace-shaming words');
    const pace = await ev(`document.getElementById('paceFill').classList.contains('q')`);
    ok(pace, 'pace bar switches to the questions phase after the read');
    const sTest = await shot(`rc-section-${width}`);

    // next passage keeps answers
    await ev(`document.querySelector('[data-act="next-passage"]').click()`);
    const np = await ev(`({pid: AceRC.state().order[AceRC.state().qi].pid, p2: AceRC.state().passageIds[1], kept: AceRC.state().answers[AceRC.state().order[0].qid]})`);
    ok(np.pid === np.p2 && np.kept === 1, 'Next passage jumps to passage 2 and keeps answers');

    // answer the rest by key for half, wrong for the other half, then submit
    await ev(`(() => { const S = AceRC.state(); S.order.forEach((o, i) => { const q = ACE_RC_BANK.passages[o.pid].questions.find(x => x.id === o.qid); S.answers[o.qid] = i % 2 ? q.key : (q.key + 1) % 5; }); AceRC.go(S.qi); })()`);
    await ev(`document.querySelector('[data-act="end"]').click()`);
    const dlg = await ev(`!!document.querySelector('#ov [data-act="submit"]')`);
    ok(dlg, 'End and review asks for confirmation');
    await ev(`document.querySelector('#ov [data-act="submit"]').click()`);
    await sleep(200);
    const res = await ev(`({view: AceRC.view(), rows: document.querySelectorAll('.typerow').length, prow: document.querySelectorAll('.ptime .row').length, saved: JSON.parse(localStorage.getItem('acelabs.rc.v1.attempts')||'[]').length, active: localStorage.getItem('acelabs.rc.v1.active'), sw: document.documentElement.scrollWidth, text: document.body.innerText})`);
    ok(res.view === 'results', 'submit shows results');
    ok(res.rows === 8, 'results break down all eight question types');
    ok(res.prow === 3, 'results show time for each of three passages');
    ok(res.saved === 1 && res.active === null, 'attempt saved, in-progress session cleared');
    ok(!/predict|scaled|percentile|\b[2-6]\d0\b score/i.test(res.text), 'no score prediction on results');
    ok(res.sw <= width, 'results have no horizontal scroll');
    const sRes = await shot(`rc-results-${width}`, true);

    // review every question
    await ev(`document.querySelector('[data-review="all"]').click()`);
    const rv = await ev(`(() => {
      const S = AceRC.state(); const bad = [];
      for (let i = 0; i < S.order.length; i++) {
        AceRC.go(i);
        const proof = document.querySelectorAll('#passagePane .sent.proof').length;
        const quote = document.querySelectorAll('#passagePane mark.quote').length;
        const key = document.querySelectorAll('.choice.key').length;
        const notes = document.querySelectorAll('.choice .note').length;
        const type = (document.querySelector('.qhead .chip.gold') || {}).textContent || '';
        if (!proof || !quote || key !== 1 || notes !== 5 || !type) bad.push(S.order[i].qid + ' proof=' + proof + ' quote=' + quote + ' key=' + key + ' notes=' + notes);
      }
      return { n: S.order.length, bad };
    })()`);
    ok(rv.bad.length === 0, `review shows proof line, quote, key, type and five notes for all ${rv.n} questions` + (rv.bad.length ? ': ' + rv.bad.slice(0, 5).join('; ') : ''));
    await ev(`AceRC.go(4)`);
    await sleep(150);
    const sRev = await shot(`rc-review-${width}`);
    await ev(`document.querySelector('[data-filter="missed"]').click()`);
    const missed = await ev(`document.querySelectorAll('.grid .cell:not([disabled])').length`);
    ok(missed > 0 && missed < rv.n, `Missed filter narrows the map (${missed} of ${rv.n})`);

    // reload: history persists; a passage session resumes
    await nav('#home');
    const hist = await ev(`document.querySelectorAll('.hist tbody tr').length`);
    ok(hist === 1, 'history shows the finished section after reload');
    await ev(`document.querySelector('[data-start="passage"]').click()`);
    const covered = await ev(`!!document.querySelector('.cover')`);
    ok(covered, 'single passage starts with proof line first (choices covered)');
    await ev(`document.querySelector('#passagePane .sent[data-p="2"][data-s="1"]').click()`);
    const opened = await ev(`({choices: document.querySelectorAll('[data-choice]').length, mine: JSON.stringify(AceRC.state().mine)})`);
    ok(opened.choices === 5 && /"p":2,"s":1/.test(opened.mine), 'tapping a sentence marks the proof line and opens the choices');
    await ev(`document.querySelector('[data-choice="4"]').click()`);
    const sPass = await shot(`rc-passage-${width}`);
    await nav('#home');
    const resumeBtn = await ev(`!!document.querySelector('[data-act="resume"]')`);
    ok(resumeBtn, 'home offers Resume for the unfinished passage');
    await ev(`document.querySelector('[data-act="resume"]').click()`);
    const resumed = await ev(`Object.values(AceRC.state().answers)[0]`);
    ok(resumed === 4, 'resume restores the chosen answer');

    // light theme renders
    await ev(`document.getElementById('themeBtn').click()`);
    const theme = await ev(`document.documentElement.getAttribute('data-theme')`);
    ok(theme === 'light', 'theme toggles to the light page');
    const sLight = await shot(`rc-light-${width}`);
    await ev(`document.getElementById('themeBtn').click()`);

    ok(errors.length === 0, 'no page exceptions or console errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
    console.log('  shots: ' + [sHome, sTest, sRes, sRev, sPass, sLight].join('\n         '));
  });
}

await run(1280, 800);
await run(390, 844);
console.log(failures ? `\nFAIL: ${failures} check(s)` : '\nPASS');
process.exit(failures ? 1 : 0);
