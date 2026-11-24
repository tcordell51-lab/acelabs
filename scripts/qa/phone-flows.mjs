// Key states for the phone audit: what to press on a page before measuring again.
// Each flow gets { page, rec }. rec(name) measures the page as it stands and files it under that name.
// A step that finds nothing to press is skipped, so a flow never blocks the audit.

const pause = (page, ms = 350) => page.waitForTimeout(ms);
// press the first visible match of any selector, by a real tap
async function tap(page, sels, opts = {}) {
  for (const s of [].concat(sels)) {
    const all = page.locator(s); const n = Math.min(await all.count().catch(() => 0), 12);
    for (let i = 0; i < n; i++) {
      const l = all.nth(i);
      if (!(await l.isVisible().catch(() => false)) || !(await l.isEnabled().catch(() => false))) continue;
      try { await l.scrollIntoViewIfNeeded({ timeout: 1500 }); await l.click({ timeout: 2500, force: !!opts.force }); await pause(page, opts.wait || 350); return true; } catch (e) { /* try the next match */ }
    }
  }
  return false;
}
const text = (t) => 'button:has-text("' + t + '"), a:has-text("' + t + '")';

// The shared question set (hub pages with ?run=, ?topic= or ?check=): answer one, then run to the end card.
async function sharedSet({ page, rec }) {
  await tap(page, '.aui-q__choice'); await tap(page, '.aui-q__conf .aui-chip');
  await tap(page, text('Check answer')); await rec('answer shown');
  for (let i = 0; i < 45; i++) {
    if (!(await page.locator('.aui-q__choice').first().isVisible().catch(() => false))) break;
    await tap(page, '.aui-q__why-btn', { wait: 80 });
    if (await tap(page, [text('Next'), text('Finish'), text('See results'), text('Continue')], { wait: 120 })) continue;
    await tap(page, '.aui-q__choice:not([disabled])', { wait: 60 }); await tap(page, '.aui-q__conf .aui-chip', { wait: 60 });
    if (!(await tap(page, text('Check answer'), { wait: 120 }))) break;
  }
  await pause(page, 500); await rec('end of set');
}

// The diagnostic, start to review, then the pages its answers fill.
async function diagnostic({ page, rec, base }) {
  await tap(page, text('Begin diagnostic')); await rec('question 1');
  await tap(page, '.diag-opt'); await rec('answer picked');
  for (let i = 0; i < 60; i++) { await tap(page, '.diag-opt', { wait: 30 }); if (!(await tap(page, 'button.btn-secondary:has-text("Next")', { wait: 30 }))) break; }
  await tap(page, text('Submit and see results'), { wait: 900 }); await tap(page, text('Submit'), { wait: 900 });
  await rec('results and review');
  for (const p of ['/', '/repair/', '/progress/', '/review/', '/plan/', '/tests/']) {
    await page.goto(base + p, { waitUntil: 'load' }); await pause(page, 700); await rec('after the diagnostic: ' + p);
    if (p === '/repair/') { if (await tap(page, [text('Start'), text('Repair'), '.aui-btn--gold', '.aui-btn--primary'])) { await pause(page, 500); await rec('repair set open'); } }
    if (p === '/review/') { if (await tap(page, ['a[href*="review"]', '.aui-card a', text('Review')])) { await pause(page, 500); await rec('review of one test'); } }
  }
}

export const FLOWS = {
  '/diagnostic.html': diagnostic,
  '/gc/?check=buffers': sharedSet, '/gc/?run=daily': sharedSet, '/bio/?run=daily': sharedSet, '/oc/?run=daily': sharedSet, '/qr/drill/?run=daily': sharedSet,

  // The Summit: thirty OChem questions with a question navigator.
  '/tools/ochem/summit/': async ({ page, rec }) => {
    await tap(page, text('Start untimed')); await rec('question 1');
    await page.evaluate(() => window.scrollTo(0, 300)); await rec('question 1, scrolled');
    if (await tap(page, '.aqn__toggle')) { await rec('navigator open'); await tap(page, ['.aqn__close', '.aqn__toggle']); }
    await tap(page, '.item .opt'); await tap(page, text('Mark for review')); await tap(page, 'button.primary:has-text("Next")'); await rec('question 2');
    await tap(page, text('Submit section')); await tap(page, text('Submit anyway'), { wait: 700 }); await rec('results');
  },
  // The Climb: five questions a day, the fix after each.
  '/tools/minitests/': async ({ page, rec }) => {
    await tap(page, 'button.gold'); await rec('question 1');
    await tap(page, '.choice'); await tap(page, 'button.gold'); await rec('answer shown');
    await tap(page, '.dbtn'); await tap(page, 'button.gold'); await rec('the fix');
    for (let i = 0; i < 30; i++) { await tap(page, '.choice', { wait: 40 }); await tap(page, '.dbtn', { wait: 40 }); if (!(await tap(page, 'button.gold', { wait: 80 }))) break; }
    await rec('end of set');
    await tap(page, '#nav-ladder'); await rec('the ladder'); await tap(page, '#nav-mistakes, a.navlink:has-text("MISTAKE")'); await rec('mistake list');
  },
  // Full-length test: the test screen, its review grid and the exhibit.
  '/tools/mock/full.html': async ({ page, rec }) => {
    await tap(page, '.tcard'); await rec('section intro');
    await tap(page, text('Begin section'), { wait: 800 }); await rec('question 1');
    await tap(page, '.pm-opt'); await tap(page, '.pm-btn:has-text("MARK")'); await tap(page, '.pm-btn:has-text("NEXT")'); await rec('question 2');
    await tap(page, '.pm-btn:has-text("REVIEW")'); await rec('review grid'); await tap(page, [text('Back'), text('Return'), text('Close'), '.pm-btn:has-text("REVIEW")']);
    await tap(page, '.pm-btn:has-text("EXHIBIT")'); await rec('exhibit'); await tap(page, [text('Close'), '.pm-btn:has-text("EXHIBIT")']);
    await tap(page, '.pm-btn:has-text("END SECTION")'); await rec('end section');
  },
  '/tools/pat/test.html': async ({ page, rec }) => {
    await tap(page, '.tcard'); await rec('test intro');
    await tap(page, text('Start the 60 minutes'));
    await page.waitForFunction(() => !/Computing/.test(document.body.innerText), null, { timeout: 60000 }).catch(() => {});
    await pause(page, 600); await rec('question 1');
    await tap(page, ['.opt', '.choice', '[data-choice]', '.ans button']); await tap(page, [text('Next')]); await rec('question 2');
    await tap(page, [text('Review'), text('Navigator'), text('Questions')]); await rec('navigator');
  },
  '/tools/rc/': async ({ page, rec }) => {
    await tap(page, text('Start section'), { wait: 800 }); await rec('section started');
    await tap(page, ['.choice', '.opt', '.rc-opt', '[data-opt]']); await tap(page, 'button.btn:has-text("Next")'); await rec('question 2');
    await tap(page, text('End and review'), { wait: 800 }); await tap(page, [text('End'), text('Yes')], { wait: 800 }); await rec('review');
  },
  // Whiteboards and the three games.
  '/see/': async ({ page, rec }) => {
    await tap(page, 'a.see-tile', { wait: 800 }); await rec('whiteboard');
    await tap(page, '.bd-choice'); await rec('whiteboard answered');
  },
  '/see/flick/': async ({ page, rec }) => {
    await tap(page, '.gm-pick', { wait: 700 }); await rec('round 1');
    for (let i = 0; i < 14; i++) { if (!(await tap(page, ['.gm-choice', '.gm-bin', '.gm-next', text('Next')], { wait: 250 }))) break; if (i === 0) await rec('after one answer'); }
    await pause(page, 600); await rec('end');
  },
  '/see/tug/': async ({ page, rec }) => {
    await tap(page, '.gm-choice', { wait: 500 }); await rec('after one answer');
    for (let i = 0; i < 14; i++) if (!(await tap(page, ['.gm-next', text('Next'), '.gm-choice:not([disabled])'], { wait: 250 }))) break;
    await pause(page, 600); await rec('end');
  },
  '/see/pathway/': async ({ page, rec }) => {
    await tap(page, '.pw-pick', { wait: 700 }); await rec('pathway open');
    await tap(page, ['.pw-card', '.pw-chip', '.pw-step', '.pw-choice']); await rec('after one move');
  },
  // Menus on the older labs.
  '/tools/gc/': async ({ page, rec }) => { if (await tap(page, '#mnBurger', { force: true })) await rec('menu open'); },
  '/tools/qr/': async ({ page, rec }) => { if (await tap(page, '#mnBurger', { force: true })) await rec('menu open'); },
  // Lesson pages: open the first night.
  ...Object.fromEntries(['/tools/bio-retold/', '/tools/gchem/', '/tools/organic/', '/tools/pat-retold/', '/tools/rc-retold/', '/tools/qr-retold/'].map((p) => [p, async ({ page, rec }) => {
    if (await tap(page, ['.night a', 'a.night', '.nights a', 'li a[href^="#"]', 'a[href*="night"]', '.toc a'], { wait: 800 })) await rec('lesson open');
  }])),
  '/plan/': async ({ page, rec }) => { if (await tap(page, ['input[type=date]', text('Build'), text('Set')])) await rec('after a tap'); },
};
