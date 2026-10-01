// node tests/ochem2026/render.mjs [outDir] : headless Chrome over the 2026 work at 1280 and 390.
// For every new module and every module that gained a test-format set: the page loads with
// no console errors, nothing scrolls sideways, the figures drew (arrows, fishhooks, diagrams),
// and the five-choice player commits, coaches a miss and reveals the why on a hit.
// Then the summit: a section builds, a figure item and an arrow-choice item render.
import { serve, launch } from './browser.mjs';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
const out = process.argv[2] || join(process.cwd(), 'shots-ochem2026');
mkdirSync(out, { recursive: true });
const NEW = ['t5-arrows-forward', 't5-arrows-reverse', 't5-fishhook', 't5-rcd', 't5-mech-chain', 't5-conform'];
const OLD = ['t7-lab', 't7-cnmr', 't7-multi', 't5-proton', 't6-selectivity', 't4-alpha', 't6-two-step'];
const { srv, base } = await serve();
const b = await launch();
let fails = 0;
const report = (ok, msg) => { if (!ok) fails++; console.log((ok ? 'ok    ' : 'FAIL  ') + msg); };

async function page(width){
  const pg = await b.newPage();
  await pg.setViewport({ width, height: 900, deviceScaleFactor: 1 });
  pg._errs = [];
  pg.on('pageerror', e => pg._errs.push(e.message));
  pg.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) pg._errs.push(m.text()); });
  return pg;
}

for (const width of [1280, 390]){
  for (const id of NEW.concat(OLD)){
    const pg = await page(width);
    await pg.goto(base + '/tools/ochem/tree/dev.html?module=' + id, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 700));
    const s = await pg.evaluate(() => {
      const sets = [...document.querySelectorAll('.md-set')];
      return {
        sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
        arrows: document.querySelectorAll('.md-arrow').length, fish: document.querySelectorAll('.md-fish').length,
        rcd: document.querySelectorAll('.md-rcd').length, mech: document.querySelectorAll('.md-mech').length,
        set: sets.length, opts: sets[0] ? sets[0].querySelectorAll('.md-opt').length : 0
      };
    });
    const isNew = NEW.includes(id);
    report(!pg._errs.length, `${id} @${width} no console errors ${pg._errs.slice(0, 2).join(' | ')}`);
    report(s.sw <= s.cw + 1, `${id} @${width} no sideways scroll (${s.sw} vs ${s.cw})`);
    report(s.set === 1 && s.opts === 5, `${id} @${width} five-choice set present (${s.set} sets, ${s.opts} choices)`);
    if (id === 't5-fishhook') report(s.fish >= 2, `${id} fishhooks drawn (${s.fish})`);
    if (['t5-arrows-forward', 't5-arrows-reverse', 't5-mech-chain'].includes(id)) report(s.arrows >= 1, `${id} curved arrows drawn (${s.arrows})`);
    if (['t5-rcd', 't5-conform'].includes(id)) report(s.rcd >= 1, `${id} diagram drawn (${s.rcd})`);
    // play one item: pick a choice that is not the key, lock it, then the key
    const play = await pg.evaluate(async () => {
      const set = document.querySelector('.md-set');
      const btns = () => [...set.querySelectorAll('.md-opt')];
      // the key is not exposed in the DOM, so try choices until the verdict says it is solved
      let misses = 0;
      for (let i = 0; i < 5; i++){
        btns()[i].click();
        const lock = [...set.querySelectorAll('button')].find(x => x.textContent === 'Lock it in');
        lock.click();
        if (set.querySelector('.md-verdict.good')) return { solved: true, misses, why: !!set.querySelector('.md-why'), coach: document.querySelector('.coach') && document.querySelector('.coach').textContent.length };
        misses++;
        if (!set.querySelector('.md-verdict.notyet')) return { solved: false, misses, err: 'no Not yet verdict' };
      }
      return { solved: false, misses };
    });
    report(play.solved && play.why, `${id} @${width} set player: solved after ${play.misses} miss(es), why shown ${play.err || ''}`);
    await pg.screenshot({ path: join(out, `${id}-${width}.png`), fullPage: true });
    await pg.close();
  }
  // the whole tree page still boots with the six new modules in the map
  {
    const pg = await page(width);
    await pg.goto(base + '/tools/ochem/tree/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));
    const t = await pg.evaluate(() => ({ loaded: (window.OChemTree && window.OChemTree.loaded) || [], sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    report(NEW.every(id => t.loaded.includes(id)), `tree page @${width} loads all six new modules (${t.loaded.length} total)`);
    report(!pg._errs.length, `tree page @${width} no console errors ${pg._errs.slice(0, 2).join(' | ')}`);
    report(t.sw <= t.cw + 1, `tree page @${width} no sideways scroll`);
    await pg.close();
  }
  // the summit
  {
    const pg = await page(width);
    await pg.goto(base + '/tools/ochem/summit/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));
    const r = await pg.evaluate(async () => {
      window.OChemSummit.start('untimed');
      const items = window.OChemSummit.run.items;
      const figAt = items.findIndex(it => it.fig);
      const choiceFigAt = items.findIndex(it => it.choices.some(c => c.fig));
      return { n: items.length, figAt, choiceFigAt, set: items.filter(it => it.source === 'ochem-2026').length, five: items.filter(it => it.choices.length === 5).length };
    });
    report(r.n === 30, `summit @${width} builds 30 (${r.set} test-format, ${r.five} five-choice)`);
    report(r.figAt >= 0, `summit @${width} has a drawn-figure item`);
    for (const [tag, at] of [['figure', r.figAt], ['arrow-choices', r.choiceFigAt]]){
      if (at < 0) continue;
      await pg.evaluate(i => document.querySelectorAll('.bar .grid button')[i].click(), at);
      await new Promise(rr => setTimeout(rr, 500));
      const c = await pg.evaluate(() => ({ svgs: document.querySelectorAll('#section .md-rcd, #section .md-mech').length, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      report(c.svgs >= 1 && c.sw <= c.cw + 1, `summit @${width} ${tag} item renders (${c.svgs} figures, scroll ${c.sw}/${c.cw})`);
      await pg.screenshot({ path: join(out, `summit-${tag}-${width}.png`), fullPage: true });
    }
    report(!pg._errs.length, `summit @${width} no console errors ${pg._errs.slice(0, 2).join(' | ')}`);
    await pg.close();
  }
}
await b.close(); srv.close();
console.log(fails ? `\n${fails} FAILED` : '\nALL PASS');
process.exit(fails ? 1 : 0);
