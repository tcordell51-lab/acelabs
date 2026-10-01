// scripts/ochem2026/build.mjs : build the 2026 organic item set.
//
//   node scripts/ochem2026/build.mjs           lint + RDKit gate + write the outputs
//   node scripts/ochem2026/build.mjs --check   lint + RDKit gate only, writes nothing
//
// Sources: scripts/ochem2026/src/*.mjs, each `export default [ item, ... ]`.
// Outputs (generated, do not hand-edit):
//   tools/ochem/tree/shared/set-2026.js     export const SET2026, read by the tree shell and the summit
//   tools/ochem/bank/ochem-2026-pool.js     window.OCHEM_2026_POOL, the exported pool
//   scripts/ochem2026/ochem-2026-pool.json  the same pool as JSON
//
// The gate refuses the whole build if any item fails, so nothing half-checked ships.
import { readdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const CHECK = process.argv.includes('--check');
const ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7);   // check one source file while authoring

export const TYPES = {
  'rcd': { home: 't5-rcd', area: 'Mechanisms', name: 'Reaction coordinate diagram' },
  'fishhook-forward': { home: 't5-fishhook', area: 'Mechanisms', name: 'Fishhook arrows, predict the product' },
  'fishhook-reverse': { home: 't5-fishhook', area: 'Mechanisms', name: 'Fishhook arrows, predict the arrows' },
  'fishhook-concept': { home: 't5-fishhook', area: 'Mechanisms', name: 'Radical mechanism' },
  'arrows-forward': { home: 't5-arrows-forward', area: 'Mechanisms', name: 'Curved arrows, predict the product' },
  'arrows-reverse': { home: 't5-arrows-reverse', area: 'Mechanisms', name: 'Curved arrows, predict the arrows' },
  'chain': { home: 't5-mech-chain', area: 'Mechanisms', name: 'Combined mechanism' },
  'conform': { home: 't5-conform', area: 'Structural evaluation', name: 'Conformations' },
  'lab': { home: 't7-lab', area: 'Chemical and physical properties', name: 'Lab techniques' },
  'cnmr': { home: 't7-cnmr', area: 'Chemical and physical properties', name: '13C NMR' },
  'multi-spec': { home: 't7-multi', area: 'Chemical and physical properties', name: 'Combined spectra' },
  'equilibrium': { home: 't5-proton', area: 'Acid-base chemistry', name: 'Acid-base equilibrium' },
  'chemoselect': { home: 't6-selectivity', area: 'Chemical synthesis', name: 'Chemoselectivity' },
  'alpha': { home: 't4-alpha', area: 'Chemical synthesis', name: 'Alpha-carbonyl' },
  'synthesis': { home: 't6-two-step', area: 'Chemical synthesis', name: 'Multi-step synthesis' }
};
const ROOTS = ['l1-skeletal', 'l1-charge', 'l1-geometry', 'l1-unsat', 'l1-groups', 'l1-naming', 'l2-bully', 'l2-resonance', 'l2-induction', 'l2-carbocation', 'l2-acidity', 'l2-arrows', 'l3-wedge', 'l3-newman', 'l3-chair', 'l3-fischer', 'l3-isomers', 'l3-ez'];

const GLYPH = /[—–…←-⇿✀-➿─-╿☀-⛿✓✔•Δδ±−→⇌]|[\u{1F300}-\u{1FAFF}]/u;
const MONEY = /\$\d|\b(price|pay|paid|balance|package|subscription|purchase|credits?)\b/i;
const PACE = /\b(behind|off[- ]pace|overdue|catch up|falling behind|streak)\b/i;
const PREDICT = /\b(predicted score|projected|percentile|readiness|on track for)\b/i;
const LETTER = /\b(choice|option|answer|letter)s? \(?[A-E]\)?\b|\([A-E]\)/;
const DELTA = /\bdelta\b|\bpartial (positive|negative) charge symbol\b/i;

function strings(o, out = []){
  if (typeof o === 'string') out.push(o);
  else if (Array.isArray(o)) o.forEach(v => strings(v, out));
  else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) if (!['smi', 'smiles', 'sub', 'prod', 'lp', 'rad', 'from', 'to', 'verify'].includes(k)) strings(v, out);
  return out;
}
function choiceKey(c){ return (c.text || '') + '|' + (c.smiles || '') + '|' + (c.fig ? JSON.stringify(c.fig.arrows || c.fig) : ''); }

export function lint(items){
  const P = [], ids = new Set();
  for (const it of items){
    const p = m => P.push(it.id + ': ' + m);
    if (!it.id || ids.has(it.id)) p('missing or duplicate id'); ids.add(it.id);
    const T = TYPES[it.type]; if (!T){ p('unknown type ' + it.type); continue; }
    if (!it.stem || !it.coach || !it.why) p('stem, coach and why are all required');
    if (it.coach && it.coach.length > 300) p('coach over 300 characters');
    if (!Array.isArray(it.choices) || it.choices.length !== 5) p('needs exactly five choices');
    else {
      if (!(it.correct >= 0 && it.correct < 5)) p('correct index out of range');
      const keys = it.choices.map(choiceKey);
      if (new Set(keys).size !== 5) p('two choices are the same');
      if (it.choices.some(c => !c.text && !c.smiles && !c.fig)) p('an empty choice');
      const texts = it.choices.map(c => (c.text || '').trim());
      if (texts.every(t => t)){
        const kl = texts[it.correct].length, others = Math.max(...texts.filter((_, i) => i !== it.correct).map(t => t.length));
        if (kl >= others) p('the key is the longest choice (' + kl + ' vs ' + others + ')');
      }
    }
    if (/arrows|fishhook-(forward|reverse)/.test(it.type) && it.type !== 'fishhook-concept' && !(it.fig && it.fig.kind === 'mech')) p('arrow items need a mech figure');
    if (it.type === 'rcd' && !(it.fig && it.fig.kind === 'rcd')) p('rcd items need a drawn diagram');
    if (/-reverse$/.test(it.type) && it.choices && it.choices.some(c => !(c.fig && c.fig.arrows))) p('reverse items need an arrow figure in every choice');
    if (it.verify && it.verify.rcd) for (const m of rcdCheck(it)) p(m);
    for (const r of it.roots || []) if (!ROOTS.includes(r)) p('unknown root ' + r);
    for (const s of strings(it)){
      const g = s.match(GLYPH); if (g) p('glyph ' + JSON.stringify(g[0]) + ' in: ' + s.slice(0, 60));
      if (MONEY.test(s)) p('payment word in: ' + s.slice(0, 60));
      if (PACE.test(s)) p('pace word in: ' + s.slice(0, 60));
      if (PREDICT.test(s)) p('predictor word in: ' + s.slice(0, 60));
      if (LETTER.test(s)) p('cites an answer letter: ' + s.slice(0, 60));
      if (DELTA.test(s)) p('delta language: ' + s.slice(0, 60));
      if (/\bCARBO\b/.test(s)) p('it is CARDIO, not CARBO');
    }
  }
  return P;
}

// Reaction coordinate claims are recomputed from the drawn levels, never trusted.
//   verify.rcd: 'steps' | 'intermediates' | 'rds' | 'rdsMark' | 'heat' | 'value' | 'lowestTs' | 'mark'
export function rcdFacts(fig){
  const P = fig.points, ts = P.map((p, i) => p.kind === 'ts' ? i : -1).filter(i => i >= 0);
  let floor = P[0].y, rds = -1, climb = -Infinity, valley = 0, rdsFrom = 0;
  P.forEach((p, i) => { if (p.kind === 'ts'){ const c = p.y - floor; if (c > climb + 1e-9){ climb = c; rds = i; rdsFrom = valley; } } else { floor = p.y; valley = i; } });
  const ties = ts.filter(i => { let f = P[0].y; for (let j = 0; j < i; j++) if (P[j].kind !== 'ts') f = P[j].y; return Math.abs((P[i].y - f) - climb) < 1e-9; }).length;
  return { steps: ts.length, intermediates: P.filter(p => p.kind === 'int').length, rds, rdsStep: ts.indexOf(rds) + 1, rdsFrom, climb, ties, dh: P[P.length - 1].y - P[0].y };
}
function rcdCheck(it){
  const out = [], f = rcdFacts(it.fig), v = it.verify, key = String(it.choices[it.correct].text || '').toLowerCase();
  const P = it.fig.points;
  for (let i = 1; i < P.length - 1; i++){
    if (P[i].kind === 'ts' && !(P[i].y > P[i - 1].y && P[i].y > P[i + 1].y)) out.push('peak ' + i + ' is not above both neighbours');
    if ((P[i].kind === 'int' || P[i].kind === 'min') && !(P[i].y < P[i - 1].y && P[i].y < P[i + 1].y)) out.push('valley ' + i + ' is not below both neighbours');
  }
  if (f.ties > 1 && /rds/.test(v.rcd)) out.push('two climbs tie for rate-determining');
  const num = s => { const m = s.match(/-?\d+(\.\d+)?/); return m ? Number(m[0]) : NaN; };
  if (v.rcd === 'steps' && num(key) !== f.steps) out.push('diagram has ' + f.steps + ' steps, key says ' + key);
  if (v.rcd === 'intermediates' && num(key) !== f.intermediates) out.push('diagram has ' + f.intermediates + ' intermediates');
  if (v.rcd === 'rds' && num(key) !== f.rdsStep) out.push('rate-determining step is ' + f.rdsStep + ', key says ' + key);
  if (v.rcd === 'rdsMark'){ const m = (it.fig.marks || []).find(m => m.to === f.rds && m.from === f.rdsFrom); if (!m || key !== m.label) out.push('the rds mark is ' + (m ? m.label : 'missing')); }
  if (v.rcd === 'heat'){ const exo = f.dh < 0; if (exo !== /exothermic/.test(key) || /endothermic/.test(key) === exo) out.push('diagram is ' + (exo ? 'exothermic' : 'endothermic') + ', key says ' + key); }
  if (v.rcd === 'mark'){ const m = (it.fig.marks || []).find(m => m.from === v.from && m.to === v.to); if (!m || key !== m.label) out.push('mark from ' + v.from + ' to ' + v.to + ' is ' + (m ? m.label : 'missing')); }
  if (v.rcd === 'value'){
    let want = NaN;
    if (v.kind === 'dh') want = f.dh;
    else if (v.kind === 'ea') want = P[v.to].y - P[v.from].y;
    else if (v.kind === 'rdsEa') want = f.climb;
    if (num(key) !== want) out.push('computed ' + v.kind + ' is ' + want + ', key says ' + key);
  }
  if (v.rcd === 'lowestTs'){ const lo = Math.min(...P.filter(p => p.kind === 'ts').map(p => p.y)); const i = P.findIndex(p => p.kind === 'ts' && p.y === lo); if (!P[i].tag || num(key) !== Number(P[i].tag)) out.push('lowest peak is tagged ' + P[i].tag); }
  return out;
}

// Put the key in a slot that keeps every home's keys spread across all five letters.
const PATTERN = [2, 0, 4, 1, 3, 1, 4, 0, 3, 2];
export function arrange(items){
  const byHome = {};
  for (const it of items) (byHome[it.home] = byHome[it.home] || []).push(it);
  const out = [];
  let off = 0;
  for (const home of Object.keys(byHome).sort()){
    byHome[home].sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true })).forEach((it, i) => {
      const slot = PATTERN[(i + off) % PATTERN.length];
      const key = it.choices[it.correct];
      const rest = it.choices.filter((_, j) => j !== it.correct);
      const choices = rest.slice(0, slot).concat([key], rest.slice(slot));
      out.push(Object.assign({}, it, { choices, correct: slot }));
    });
    off += 3;
  }
  return out;
}

export async function loadSources(){
  const dir = join(HERE, 'src');
  const files = readdirSync(dir).filter(f => f.endsWith('.mjs') && (!ONLY || f === ONLY)).sort();
  const items = [];
  for (const f of files){
    const m = await import(pathToFileURL(join(dir, f)).href);
    for (const it of m.default){
      const T = TYPES[it.type] || {};
      items.push(Object.assign({ home: T.home, area: T.area, typeName: T.name, difficulty: 2, roots: [] }, it, { src: f }));
    }
  }
  return items;
}

export function rdkit(items){
  const tmp = mkdtempSync(join(tmpdir(), 'oc26-'));
  const f = join(tmp, 'items.json');
  writeFileSync(f, JSON.stringify(items));
  const r = spawnSync('python3', [join(HERE, 'verify.py'), f], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  try { return JSON.parse(r.stdout); } catch (e){ return { ok: false, items: { _: [r.stderr || r.stdout] } }; }
}

async function main(){
  const raw = await loadSources();
  const L = lint(raw);
  const items = arrange(raw);
  const V = rdkit(items);
  if (L.length || !V.ok){
    console.log('FAIL');
    L.forEach(x => console.log('  lint  ' + x));
    for (const [id, ps] of Object.entries(V.items || {})) ps.forEach(x => console.log('  rdkit ' + id + ': ' + x));
    process.exit(1);
  }
  const counts = {}; for (const it of items) counts[it.type] = (counts[it.type] || 0) + 1;
  const letters = [0, 0, 0, 0, 0]; for (const it of items) letters[it.correct]++;
  console.log('PASS  ' + items.length + ' items, RDKit checked ' + V.checked);
  console.log('  by type: ' + Object.entries(counts).map(([k, v]) => k + ' ' + v).join(', '));
  console.log('  keys A-E: ' + letters.join(' / '));
  if (CHECK || ONLY) return;
  const clean = items.map(({ src, ...it }) => it);
  const head = '// GENERATED by scripts/ochem2026/build.mjs from scripts/ochem2026/src. Do not hand-edit.\n// Every structure parsed and sanitized in RDKit; every arrow item was proven by pushing\n// its arrows (scripts/ochem2026/verify.py); five choices, keys spread, key never the longest.\n';
  writeFileSync(join(ROOT, 'tools/ochem/tree/shared/set-2026.js'), head + 'export const SET2026 = ' + JSON.stringify(clean) + ';\n' +
    'export function setFor(home){ return SET2026.filter(it => it.home === home); }\n');
  const pool = clean.map(it => Object.assign({ section: 'OCHEM', source: 'ochem-2026', q: it.stem }, it));
  writeFileSync(join(ROOT, 'tools/ochem/bank/ochem-2026-pool.js'), head + 'window.OCHEM_2026_POOL = ' + JSON.stringify(pool) + ';\n');
  writeFileSync(join(HERE, 'ochem-2026-pool.json'), JSON.stringify(pool, null, 1) + '\n');
  console.log('  wrote set-2026.js, ochem-2026-pool.js, ochem-2026-pool.json');
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
