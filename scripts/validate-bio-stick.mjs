#!/usr/bin/env node
/* Validate tools/bio/bio-stick-data.js (the "Call it first" layer content).
 *
 * Fails the build on:
 *   - duplicate or malformed ids, unknown hub, missing title / subtopic
 *   - a subtopic outside the canonical DAT Biology list
 *   - predict / check blocks without exactly 3 options, a key out of range,
 *     traps not aligned to options (null on the key, a sentence elsewhere),
 *     an empty why or answer
 *   - option text over 70 characters, why over 320, answer over 140
 *   - any non-ASCII character, or the words wrong / incorrect / failed
 *   - a selector (mount, veil, still, caption, step targets) whose #id or
 *     [data-x="y"] does not exist in the entry's hub page or in bio-shared.js
 *   - keys bunched on one letter (more than 60% of blocks on the same index)
 *   - the key being the strictly longest option in more than 35% of blocks
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BIO = path.join(ROOT, 'tools', 'bio');
const HUB_FILE = {
  cell: 'bio-cell.html', genetics: 'bio-genetics.html', physiology: 'bio-physiology.html',
  diversity: 'bio-diversity.html', devo: 'bio-devo.html', evolution: 'bio-evolution.html'
};
const CANONICAL = [
  'Cell organelles & function', 'Membrane transport', 'Cell signaling', 'Cytoskeleton', 'Cell cycle & checkpoints',
  'Mitosis', 'Meiosis', 'DNA replication', 'Transcription', 'Translation', 'Gene regulation', 'Mutations & DNA repair',
  'Biotechnology (PCR, gel, cloning)', 'Enzymes & kinetics', 'Glycolysis', 'Krebs cycle', 'ETC & oxidative phosphorylation',
  'Photosynthesis', 'Protein structure (1-4)',
  'Mendelian inheritance', 'Dihybrid crosses', 'Sex-linked inheritance', 'Pedigree analysis',
  'Codominance & incomplete dominance', 'Epistasis & multifactorial', 'Hardy-Weinberg / population genetics',
  'Linkage & recombination', 'Chromosomal disorders',
  'Viruses', 'Bacteria & archaea', 'Fungi', 'Protists', 'Plant taxonomy & structure', 'Animal phyla',
  'Natural selection', 'Evidence of evolution', 'Speciation', 'Biogeochemical cycles (C/N/water)', 'Population ecology',
  'Community ecology & symbiosis', 'Food webs & energy flow', 'Biomes',
  'Circulatory system', 'Cardiac cycle & ECG', 'Blood components & types', 'Respiratory system & gas exchange',
  'O2/CO2 transport (Hb curve)', 'Digestive system & enzymes', 'Excretory system & nephron',
  'Nervous system & action potentials', 'Neurotransmitters & synapses', 'Brain regions & functions',
  'Autonomic vs somatic nervous', 'Endocrine system & hormones', 'Feedback loops (negative/positive)',
  'Muscular system & sliding filament', 'Skeletal system & joints', 'Innate immunity', 'Adaptive immunity (B & T cells)',
  'Integumentary & thermoregulation',
  'Male reproductive system', 'Female reproductive system', 'Menstrual cycle & ovulation (LH/FSH)',
  'Spermatogenesis & oogenesis', 'Fertilization', 'Embryonic stages', 'Germ layers (ecto/meso/endoderm)',
  'Placentation & hCG'
];
const BANNED = /\b(wrong|incorrect|fail|failed|fails)\b/i;

const errors = [];
const err = (id, msg) => errors.push(`[${id}] ${msg}`);

const dataSrc = fs.readFileSync(path.join(BIO, 'bio-stick-data.js'), 'utf8');
const sandbox = { window: {} };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(dataSrc, sandbox, { filename: 'bio-stick-data.js' });
const entries = sandbox.window.BIO_STICK_ENTRIES;
if (!Array.isArray(entries) || !entries.length) {
  console.error('validate-bio-stick: BIO_STICK_ENTRIES missing or empty');
  process.exit(1);
}

// Non-ASCII anywhere in the data file (comments included).
fs.readFileSync(path.join(BIO, 'bio-stick-data.js'), 'utf8').split('\n').forEach((line, i) => {
  if (/[^\x00-\x7F]/.test(line)) err('file', `non-ASCII on line ${i + 1}`);
});

// Visualizer sources that inject markup: bio-shared.js plus any other
// tools/bio/bio-*.js (bio-bone.js, ...), minus the stick layer itself.
const shared = fs.readdirSync(BIO)
  .filter((f) => /^bio-.*\.js$/.test(f) && f !== 'bio-stick.js' && f !== 'bio-stick-data.js')
  .map((f) => fs.readFileSync(path.join(BIO, f), 'utf8')).join('\n');
const hubText = {};
for (const [hub, file] of Object.entries(HUB_FILE)) hubText[hub] = fs.readFileSync(path.join(BIO, file), 'utf8');

function selectorTokens(sel) {
  const ids = [...String(sel).matchAll(/#([A-Za-z][\w-]*)/g)].map((m) => m[1]);
  const attrs = [...String(sel).matchAll(/\[(data-[\w-]+)="([^"]+)"\]/g)].map((m) => `${m[1]}="${m[2]}"`);
  return { ids, attrs };
}
function checkSelector(id, hub, sel, label) {
  if (!sel) return;
  const text = hubText[hub] || '';
  const { ids, attrs } = selectorTokens(sel);
  ids.forEach((x) => {
    const needle = `id="${x}"`;
    if (!text.includes(needle) && !shared.includes(needle)) err(id, `${label}: #${x} not found in ${HUB_FILE[hub]} or the visualizer scripts`);
  });
  attrs.forEach((a) => {
    if (!text.includes(a) && !shared.includes(a)) err(id, `${label}: [${a}] not found in ${HUB_FILE[hub]} or the visualizer scripts`);
  });
}
function stepTargets(steps) {
  const out = [];
  (steps || []).forEach((s) => { if (s && s.set) out.push(s.set); if (s && s.click) out.push(s.click); });
  return out;
}
function strings(obj, out = []) {
  if (typeof obj === 'string') out.push(obj);
  else if (Array.isArray(obj)) obj.forEach((x) => strings(x, out));
  else if (obj && typeof obj === 'object') Object.values(obj).forEach((x) => strings(x, out));
  return out;
}

const seen = new Set();
const keyCount = [0, 0, 0];
let blocks = 0;
let longestKey = 0;

for (const e of entries) {
  const id = e && e.id ? e.id : '(no id)';
  if (!/^[a-z0-9-]+$/.test(id)) err(id, 'id must be lowercase letters, digits and hyphens');
  if (seen.has(id)) err(id, 'duplicate id');
  seen.add(id);
  if (!HUB_FILE[e.hub]) err(id, `unknown hub "${e.hub}"`);
  if (!e.title) err(id, 'missing title');
  if (!CANONICAL.includes(e.subtopic)) err(id, `subtopic "${e.subtopic}" is not in the canonical list`);
  if (!e.mount) err(id, 'missing mount');
  if (!Array.isArray(e.still) || !e.still.length) err(id, 'still must list at least one selector');
  if (!Array.isArray(e.frames) || !e.frames.length) err(id, 'frames must hold at least one frame');

  if (HUB_FILE[e.hub]) {
    checkSelector(id, e.hub, e.mount, 'mount');
    if (e.veil) checkSelector(id, e.hub, e.veil, 'veil');
    (e.still || []).forEach((s) => checkSelector(id, e.hub, s, 'still'));
    if (e.caption) checkSelector(id, e.hub, e.caption, 'caption');
    if (e.captionExtra) checkSelector(id, e.hub, e.captionExtra, 'captionExtra');
    stepTargets(e.setup).forEach((s) => checkSelector(id, e.hub, s, 'setup step'));
    (e.frames || []).forEach((f, i) => stepTargets(f).forEach((s) => checkSelector(id, e.hub, s, `frame ${i + 1} step`)));
  }

  for (const name of ['predict', 'check']) {
    const b = e[name];
    if (!b) { err(id, `missing ${name}`); continue; }
    blocks += 1;
    if (!b.q) err(id, `${name}: missing q`);
    if (!Array.isArray(b.options) || b.options.length !== 3) { err(id, `${name}: needs exactly 3 options`); continue; }
    if (!Number.isInteger(b.key) || b.key < 0 || b.key > 2) { err(id, `${name}: key must be 0, 1 or 2`); continue; }
    keyCount[b.key] += 1;
    b.options.forEach((o, i) => { if (!o || o.length > 70) err(id, `${name}: option ${i + 1} empty or over 70 characters`); });
    const lens = b.options.map((o) => (o || '').length);
    if (lens[b.key] > Math.max(...lens.filter((_, i) => i !== b.key))) longestKey += 1;
    if (!Array.isArray(b.traps) || b.traps.length !== 3) err(id, `${name}: traps must align with the 3 options`);
    else b.traps.forEach((t, i) => {
      if (i === b.key && t !== null) err(id, `${name}: trap on the key must be null`);
      if (i !== b.key && (typeof t !== 'string' || t.length < 12)) err(id, `${name}: trap ${i + 1} needs a sentence`);
    });
    if (!b.why || b.why.length > 320) err(id, `${name}: why empty or over 320 characters`);
    if (!b.answer || b.answer.length > 140) err(id, `${name}: answer empty or over 140 characters`);
  }

  strings(e).forEach((s) => {
    if (BANNED.test(s)) err(id, `banned word in: "${s.slice(0, 60)}"`);
  });
}

if (blocks) {
  keyCount.forEach((n, i) => { if (n / blocks > 0.6) err('keys', `${Math.round((n / blocks) * 100)}% of keys sit on option ${'ABC'[i]}`); });
  if (longestKey / blocks > 0.35) err('keys', `the key is the longest option in ${longestKey} of ${blocks} blocks`);
}

if (errors.length) {
  console.error(`validate-bio-stick: ${errors.length} problem(s)`);
  errors.forEach((m) => console.error('  ' + m));
  process.exit(1);
}
console.log(`validate-bio-stick: ${entries.length} entries, ${blocks} questions OK (keys A/B/C ${keyCount.join('/')}, key longest in ${longestKey})`);
