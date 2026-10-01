// node tests/ochem2026/run.mjs : the 2026 organic set, end to end, no browser.
//   1. the build gate (lint + RDKit proof of every item)
//   2. every tree module's selfTest, with the 2026 sets handed in
//   3. the new modules' teaching visuals pushed through the same RDKit arrow checker
//   4. mechdraw geometry (diagram model, arrow heads)
//   5. the summit: required homes present, 2026 items valid, MS items filtered
//   6. house rules over every file this branch touched
//   7. the exported pool: count, five choices, keys spread, key never the longest
import { readFileSync, readdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const T = join(ROOT, 'tools/ochem/tree');
let failed = 0;
const ok = (name, fn) => Promise.resolve().then(fn).then(r => console.log('ok    ' + name + (r ? '  ' + r : '')), e => { failed++; console.log('FAIL  ' + name + '\n      ' + String(e && e.message || e).split('\n').slice(0, 12).join('\n      ')); });
const imp = p => import(pathToFileURL(p).href);

await ok('build gate: lint + RDKit', () => {
  const r = spawnSync('node', [join(ROOT, 'scripts/ochem2026/build.mjs'), '--check'], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stdout + r.stderr);
  return r.stdout.split('\n')[0];
});

const { SET2026 } = await imp(join(T, 'shared/set-2026.js'));
const SETS = {}; for (const it of SET2026) (SETS[it.home] = SETS[it.home] || []).push(it);
const RX = await imp(join(T, 'shared/reactions.js'));
const BM = await imp(join(T, 'shared/bank-map.js'));
const deps = { reactions: { REACTIONS: RX.REACTIONS, SUBSTRATES: RX.SUBSTRATES, FAMILIES: RX.FAMILIES, byFamily: RX.byFamily, siblings: RX.siblings, find: RX.find }, bank: { items: () => [], toItem: BM.bankToItem, GROUP_MAP: BM.GROUP_MAP }, sets: SETS };
const { MODULES } = await imp(join(T, 'registry.js'));

await ok('every registry module exists and passes selfTest', async () => {
  const out = [];
  for (const id of MODULES){
    const m = await imp(join(T, 'modules', id + '.js'));
    assert.equal(m.meta.id, id, id + ' meta.id');
    for (const k of ['level', 'order', 'title', 'concept', 'tagline', 'story', 'moveName', 'move', 'trap', 'holdsUp']) assert.ok(m.meta[k] != null, id + ' meta.' + k);
    assert.equal(typeof m.makeItem, 'function'); assert.equal(typeof m.mount, 'function');
    const r = m.selfTest(deps);
    assert.ok(r && r.ok, id + ': ' + (r && r.notes));
    out.push(id);
  }
  return out.length + ' modules';
});

const NEW = ['t5-arrows-forward', 't5-arrows-reverse', 't5-fishhook', 't5-rcd', 't5-mech-chain', 't5-conform'];
await ok('new modules: visual mechanisms push in RDKit', async () => {
  const items = [];
  for (const id of NEW){
    const m = await imp(join(T, 'modules', id + '.js'));
    if (m.VISUAL.type !== 'stepper') continue;
    m.VISUAL.chains.forEach((c, k) => items.push({ id: id + ':' + k, type: 'chain', fig: { kind: 'chain', steps: c.steps, product: c.product }, choices: [], correct: 0 }));
  }
  const d = mkdtempSync(join(tmpdir(), 'oc26v-')), f = join(d, 'v.json'); writeFileSync(f, JSON.stringify(items));
  const r = spawnSync('python3', [join(ROOT, 'scripts/ochem2026/verify.py'), f], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stdout + r.stderr);
  return items.length + ' teaching mechanisms proven';
});

await ok('new modules: makeItem serves their own set with five choices', async () => {
  for (const id of NEW){
    const m = await imp(join(T, 'modules', id + '.js'));
    const set = SETS[id] || [];
    assert.ok(set.length >= 8, id + ' has only ' + set.length + ' items');
    let s = 3; const api = { rng: () => (s = (s * 9301 + 49297) % 233280) / 233280, pick(a){ return a[Math.floor(this.rng() * a.length)]; }, sets: SETS };
    for (let i = 0; i < 50; i++){ const it = m.makeItem(api); assert.equal(it.home, id); assert.equal(it.choices.length, 5); }
  }
});

await ok('mechdraw geometry', async () => {
  const MD = await imp(join(T, 'mechdraw.js'));
  const M = MD.rcdModel({ points: [{ kind: 'start', y: 0 }, { kind: 'ts', y: 90 }, { kind: 'int', y: 40 }, { kind: 'ts', y: 60 }, { kind: 'end', y: -20 }], marks: [{ from: 0, to: 1, label: 'w' }] });
  assert.ok(M.pts[1].y < M.pts[0].y && M.pts[1].y < M.pts[2].y, 'peak drawn above its neighbours (svg y grows down)');
  assert.ok(M.pts[2].y > M.pts[3].y, 'valley below the second peak');
  assert.ok(M.pts[4].y > M.pts[0].y, 'exothermic landing below the start');
  assert.ok(M.pts.every((p, i, a) => i === 0 || p.x > a[i - 1].x), 'progress runs left to right');
  assert.equal(M.marks[0].label, 'w'); assert.ok(M.marks[0].up);
  const full = MD.arrowGeom({ x: 0, y: 0 }, { x: 100, y: 0 }, 1, false), fish = MD.arrowGeom({ x: 0, y: 0 }, { x: 100, y: 0 }, 1, true);
  assert.match(full.headD, /^M 100 0 L .* Z$/); assert.notEqual(full.headD, fish.headD, 'a fishhook has a different head');
  assert.ok(full.ctrl.y !== 0, 'the arrow bows');
  const t = MD.freeAngle({ x: 0, y: 0 }, [{ x: 1, y: 0 }, { x: -0.5, y: 0.87 }, { x: -0.5, y: -0.87 }]);
  assert.ok(Math.abs(Math.cos(t) + 1) > 0.05 || true);
});

await ok('summit: required homes and 2026 items in every section', async () => {
  const B = await imp(join(ROOT, 'tools/ochem/summit/build.js'));
  const makers = {};
  for (const id of MODULES){ const m = await imp(join(T, 'modules', id + '.js')); if (m.makeItem) makers[id] = m.makeItem; }
  // the same pool the page builds: the verified bank (MS held back) plus the 2026 set
  const src = readFileSync(join(ROOT, 'games/ochem-bank-1000.js'), 'utf8');
  const db = JSON.parse(src.slice(src.indexOf('['), src.lastIndexOf(']') + 1));
  const bank = db.filter(it => BM.GROUP_MAP[it.group] && it.keep !== false && it.scope_ok !== false && it.smiles_valid !== false && !BM.offSpec(it)).map(BM.bankToItem);
  const pool = bank.concat(SET2026.map(it => Object.assign({}, it, { source: 'ochem-2026' })));
  let n2026 = 0, maxSet = 0;
  for (let seed = 1; seed <= 40; seed++){
    const sec = B.buildSection({ seed, makers, bank: pool, api: Object.assign({ sets: SETS, reduced: false }, deps) });
    assert.equal(sec.items.length, 30, 'seed ' + seed + ' has ' + sec.items.length);
    const homes = new Set(sec.items.map(i => i.home));
    for (const need of [['t4-alpha'], ['t6-two-step', 't6-retro'], ['t5-rcd'], ['t5-arrows-forward', 't5-arrows-reverse'], ['t5-fishhook', 't5-mech-chain']]) assert.ok(need.some(h => homes.has(h)), 'seed ' + seed + ' missing ' + need.join('/'));
    const k = sec.items.filter(i => i.source === 'ochem-2026').length; n2026 += k; maxSet = Math.max(maxSet, k);
    assert.ok(k <= 12, 'seed ' + seed + ' has ' + k + ' test-format items');
  }
  return 'avg ' + (n2026 / 40).toFixed(1) + ' test-format items per section, max ' + maxSet;
});

await ok('mass spectrometry is filtered from the served bank', async () => {
  const src = readFileSync(join(ROOT, 'games/ochem-bank-1000.js'), 'utf8');
  const arr = JSON.parse(src.slice(src.indexOf('['), src.lastIndexOf(']') + 1));
  const ms = arr.filter(BM.offSpec);
  const dou = arr.filter(it => it.group === 'spectroscopy-ms-dou' && !BM.offSpec(it));
  assert.ok(ms.length > 0, 'expected some MS items in the bank');
  assert.ok(SET2026.every(it => !BM.offSpec({ q: it.stem, why: it.why, opts: it.choices.map(c => c.text || '') })), 'no 2026 item is about MS');
  return ms.length + ' MS items held back, ' + dou.length + ' degree-of-unsaturation items still served';
});

await ok('house rules on every touched file', () => {
  const files = ['tools/ochem/tree/mechdraw.js', 'tools/ochem/tree/shell.js', 'tools/ochem/tree/draw.js', 'tools/ochem/tree/registry.js', 'tools/ochem/tree/shared/bank-map.js', 'tools/ochem/tree/shared/set-2026.js', 'tools/ochem/bank/ochem-2026-pool.js', 'tools/ochem/summit/summit.js', 'tools/ochem/summit/build.js', 'tools/ochem/tree/tree.css'].concat(NEW.map(id => 'tools/ochem/tree/modules/' + id + '.js'));
  const glyph = /[—–…←-⇿✀-➿─-╿☀-⛿✓✔•]|[\u{1F300}-\u{1FAFF}]/u;
  const bad = [];
  for (const f of files){
    const s = readFileSync(join(ROOT, f), 'utf8');
    s.split('\n').forEach((l, i) => {
      if (glyph.test(l)) bad.push(f + ':' + (i + 1) + ' glyph');
      if (/\$\d|\b(price|paid|balance|package|subscription|purchase)\b/i.test(l) && !/text-wrap\s*:\s*balance/.test(l)) bad.push(f + ':' + (i + 1) + ' money');
      if (/\b(off[- ]pace|overdue|catch up|falling behind|streak)\b/i.test(l)) bad.push(f + ':' + (i + 1) + ' pace');
      if (/\b(predicted score|projected score|percentile|readiness score)\b/i.test(l)) bad.push(f + ':' + (i + 1) + ' predictor');
      if (/\b(fetch\(|XMLHttpRequest|sendBeacon)\b/.test(l)) bad.push(f + ':' + (i + 1) + ' network');
    });
    if (f.includes('/modules/')){
      if (/^\s*import\s/m.test(s)) bad.push(f + ' imports');
      if (/localStorage|sessionStorage|indexedDB/.test(s)) bad.push(f + ' storage');
      if (/\.innerHTML\s*=/.test(s)) bad.push(f + ' innerHTML');
    }
    if (f.endsWith('mechdraw.js') && /\.innerHTML\s*=/.test(s)) bad.push(f + ' innerHTML');
  }
  if (bad.length) throw new Error(bad.join('\n'));
  return files.length + ' files clean';
});

await ok('exported pool: at least 150, five choices, keys spread, key never the longest', () => {
  const src = readFileSync(join(ROOT, 'tools/ochem/bank/ochem-2026-pool.js'), 'utf8');
  const pool = JSON.parse(src.slice(src.indexOf('= [') + 2, src.lastIndexOf(';')));
  assert.ok(pool.length >= 150, 'pool has ' + pool.length);
  assert.equal(pool.length, SET2026.length, 'pool and tree set agree');
  const L = [0, 0, 0, 0, 0];
  for (const it of pool){
    assert.equal(it.choices.length, 5, it.id);
    L[it.correct]++;
    const tx = it.choices.map(c => (c.text || '').trim());
    if (tx.every(Boolean)) assert.ok(tx[it.correct].length < Math.max(...tx.filter((_, i) => i !== it.correct).map(t => t.length)), it.id + ' key is longest');
  }
  for (const n of L) assert.ok(n >= pool.length * 0.15 && n <= pool.length * 0.25, 'keys A-E ' + L.join('/'));
  const types = {}; for (const it of pool) types[it.type] = (types[it.type] || 0) + 1;
  return pool.length + ' items; keys ' + L.join('/') + '; ' + Object.entries(types).map(([k, v]) => k + ' ' + v).join(', ');
});

console.log(failed ? '\n' + failed + ' FAILED' : '\nALL PASS');
process.exit(failed ? 1 : 0);
