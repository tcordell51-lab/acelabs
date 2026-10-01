#!/usr/bin/env node
/* build-ace-index.mjs : writes shared/ace-index.js, the small lookup table the
   shell pages (home, Learn, Review, Performance) use to route a concept to the
   right Retold night, Canon sheet and drill.

     node scripts/build-ace-index.mjs [--canon ~/code/ace-system/visuals/sheets]

   Sources (all read, nothing else written):
   - the six Retold courses: NIGHTS[n] = { t: title, booster: chapter }  -> nights
     (the chapter name is kept only as matching keywords, never displayed)
   - QR and GC engines: SKILLS = [{ id, name }]                           -> skill labels
   - QR modules on disk: tools/qr/proposals/<agent>/<skill>.html          -> drill pages
   - the Visual Canon sheet sources (optional; kept from the last build when absent)
   - the Climb remediation map: (section, topic) -> best night            -> climb routes */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import os from 'node:os';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'shared/ace-index.js');
const argv = process.argv.slice(2);
const canonArg = argv.includes('--canon') ? argv[argv.indexOf('--canon') + 1] : path.join(os.homedir(), 'code/ace-system/visuals/sheets');

const COURSES = {
  bio: { name: 'Biology', url: '/tools/bio-retold/', file: 'tools/bio-retold/index.html' },
  gchem: { name: 'General Chemistry', url: '/tools/gchem/', file: 'tools/gchem/index.html' },
  ochem: { name: 'Organic Chemistry', url: '/tools/organic/', file: 'tools/organic/index.html' },
  qr: { name: 'Quantitative Reasoning', url: '/tools/qr-retold/', file: 'tools/qr-retold/index.html' },
  pat: { name: 'Perceptual Ability', url: '/tools/pat-retold/', file: 'tools/pat-retold/index.html' },
  rc: { name: 'Reading Comprehension', url: '/tools/rc-retold/', file: 'tools/rc-retold/index.html' },
};

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const unent = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&[a-z]+;/g, ' ').replace(/\s*[—–]\s*/g, ': ');

/* Extra matching words per night, so a concept label from any tool finds its night. */
const EXTRA = {
  bio: { 3: 'transport osmosis tonicity diffusion', 4: 'glycolysis krebs electron transport chain atp etc', 6: 'transcription translation rna protein', 7: 'replication dna polymerase', 9: 'punnett pedigree inheritance', 11: 'hardy weinberg population ecology selection', 13: 'nephron kidney heart circulation endocrine hormone nervous action potential immune oxygen', 14: 'reproduction embryology development germ layer digestion' },
  gchem: { 2: 'mole stoichiometry limiting reagent molarity', 3: 'quantum electron configuration orbital', 6: 'vsepr imf hybridization geometry polarity', 8: 'colligative solution phase solubility heating curve', 10: 'gibbs entropy delta', 12: 'le chatelier ksp ice', 13: 'ph pka buffer titration acid base', 14: 'redox galvanic electrolytic oxidation reduction' },
  ochem: { 1: 'acid base acidity pka resonance arrow cardio', 3: 'chirality chair newman', 7: 'carbonyl aldehyde ketone grignard', 8: 'ester amide anhydride acid chloride', 11: 'eas benzene directing', 13: 'ir nmr spectroscopy' },
  qr: { 2: 'exponent root number', 7: 'rate work distance speed', 8: 'mixture weighted interest', 12: 'probability combination permutation counting', 13: 'mean median mode standard deviation statistics', 14: 'quantitative comparison pacing' },
};
const nights = {};
for (const [sec, c] of Object.entries(COURSES)) {
  const src = read(c.file);
  const re = /NIGHTS\[(\d+)\]\s*=\s*\{\s*"?t"?\s*:\s*(['"])((?:\\.|(?!\2).)*)\2(?:\s*,\s*"?booster"?\s*:\s*(['"])((?:\\.|(?!\4).)*)\4)?/g;
  const list = [];
  let m;
  while ((m = re.exec(src))) list.push({ n: Number(m[1]), t: unent(m[3].replace(/\\(.)/g, '$1')), k: unent((m[5] || '').replace(/\\(.)/g, '$1')) });
  list.sort((a, b) => a.n - b.n);
  nights[sec] = list.filter((x, i, a) => a.findIndex((y) => y.n === x.n) === i)
    .map((x) => (EXTRA[sec] && EXTRA[sec][x.n] ? { ...x, k: (x.k + ' ' + EXTRA[sec][x.n]).trim() } : x));
}

function skills(rel) {
  const src = read(rel);
  const out = {};
  const re = /\{\s*id\s*:\s*'([a-z0-9-]+)'\s*,\s*tier\s*:\s*\d+\s*,\s*name\s*:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(src))) out[m[1]] = unent(m[2]).replace(/\s*:\s*/g, ': ');
  return out;
}
const skillNames = { qr: skills('tools/qr/index.html'), gchem: skills('tools/gc/index.html') };

const qrModules = {};
const propDir = path.join(ROOT, 'tools/qr/proposals');
for (const agent of fs.readdirSync(propDir)) {
  if (/sarah/.test(agent)) continue;
  const d = path.join(propDir, agent);
  if (!fs.statSync(d).isDirectory()) continue;
  for (const f of fs.readdirSync(d)) if (f.endsWith('.html')) {
    const id = f.replace(/\.html$/, '');
    if (!qrModules[id]) qrModules[id] = '/tools/qr/proposals/' + agent + '/' + f;
  }
}

/* Canon sheets: from the source repo when present, else keep the previous build's list. */
let canon = [];
const SEC_OF = { bio: 'bio', gchem: 'gchem', ochem: 'ochem', pat: 'pat', qr: 'qr', rc: 'rc' };
if (fs.existsSync(canonArg)) {
  for (const sec of fs.readdirSync(canonArg)) {
    const d = path.join(canonArg, sec);
    if (!fs.statSync(d).isDirectory()) continue;
    for (const f of fs.readdirSync(d)) if (f.endsWith('.json')) {
      try {
        const j = JSON.parse(fs.readFileSync(path.join(d, f), 'utf8'));
        canon.push({ id: f.replace(/\.json$/, ''), s: SEC_OF[sec] || sec, t: unent(String(j.concept || j.topic || j.title || '')) });
      } catch (e) { /* skip a malformed source */ }
    }
  }
} else if (fs.existsSync(OUT)) {
  const prev = {}; vm.runInNewContext(fs.readFileSync(OUT, 'utf8'), { window: prev });
  canon = (prev.AceIndex && prev.AceIndex.canon) || [];
}
canon.sort((a, b) => (a.s + a.id).localeCompare(b.s + b.id));

/* Same matcher the browser uses (ace-progress.js): word overlap, light stemming. */
const STOP = new Set('the a an and or of to in on at for with by is are it its from your you what how one two three then that this as into vs versus their them be not no all every'.split(' '));
const words = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)).map((w) => w.replace(/(ies)$/, 'y').replace(/(es|s)$/, ''));
function bestNight(sec, text) {
  const q = new Set(words(text));
  let best = null, score = 0;
  for (const n of nights[sec] || []) {
    const w = new Set(words(n.t + ' ' + n.k));
    let s = 0; q.forEach((x) => { if (w.has(x)) s++; });
    if (s > score) { score = s; best = n.n; }
  }
  return score > 0 ? best : null;
}

const remSrc = read('tools/minitests/remediation-map.js');
const ctx = { window: {} }; vm.runInNewContext(remSrc, ctx);
const REM = ctx.window.MINITEST_REMEDIATION || {};
/* Hand-checked where word overlap picks the wrong night. */
const CLIMB_FIX = {
  'bio|Cell structure & organelles': 2, 'bio|Mitosis & meiosis': 7, 'bio|Physiology (a body system)': 13,
  'ochem|Alcohols & carbonyls': 7, 'ochem|Acidity & pKa': 1, 'ochem|Resonance & stability': 1, 'ochem|Synthesis / roadmap': 5,
  'qr|Exponents & roots': 2, 'qr|Statistics (mean/median/SD)': 13,
};
const climb = {};
for (const [sec, def] of Object.entries(REM)) {
  for (const [topic, label] of Object.entries(def.topics || {})) {
    const n = bestNight(sec, topic + ' ' + label);
    const n2 = CLIMB_FIX[sec + '|' + topic] || n;
    if (n2) climb[sec + '|' + topic] = n2;
  }
}

const data = {
  built: new Date().toISOString().slice(0, 10),
  courses: Object.fromEntries(Object.entries(COURSES).map(([k, c]) => [k, { name: c.name, url: c.url }])),
  nights, skills: skillNames, qrModules, canon, climb,
};
const banner = '/* GENERATED by scripts/build-ace-index.mjs. Do not edit by hand; re-run the script. */\n';
fs.writeFileSync(OUT, banner + 'window.AceIndex = ' + JSON.stringify(data) + ';\n');
const counts = Object.fromEntries(Object.entries(nights).map(([k, v]) => [k, v.length]));
console.log('wrote', path.relative(ROOT, OUT), JSON.stringify({ nights: counts, qrSkills: Object.keys(skillNames.qr).length, gcSkills: Object.keys(skillNames.gchem).length, qrModules: Object.keys(qrModules).length, canon: canon.length, climb: Object.keys(climb).length }));
