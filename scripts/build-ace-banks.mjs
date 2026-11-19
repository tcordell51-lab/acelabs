#!/usr/bin/env node
// build-ace-banks.mjs : one item format for every multiple-choice bank.
//
//   node scripts/build-ace-banks.mjs           write data/*.json
//   node scripts/build-ace-banks.mjs --check   exit 1 if data/*.json is stale or an item breaks the format
//
// Item format (see shared/ace-question.js):
//   { id, section, topic, topicName, stem, choices[5], answer (0-4), why,
//     traps?: [5] (reason each wrong choice is wrong; null at the answer),
//     trick?: one line }
// Nothing is written here that the source bank does not contain: no trap or
// trick is invented. Items without exactly five choices or without an
// explanation are left out and counted.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// One canonical skill tag, the same in the browser (shared/ace-skills.js): repair matches skill
// first. The tag is a portal subtopic (gc_buffers) or, when the item's own topic does not settle
// it, the parent topic with conf 'low' (listed in scripts/bank/out/skill-low-confidence.json).
const Skills = createRequire(import.meta.url)(path.join(ROOT, 'shared/ace-skills.js'));
function withSkill(it) {
  const t = Skills.tag(it);
  // a source item that states its portal subtopic outright (canon) overrides the keyword guess
  if (it.canon && Skills.names[it.canon]) Object.assign(t, { canon: it.canon, skill: it.canon, skillName: Skills.names[it.canon][0], topicId: Skills.names[it.canon][1], conf: 'meta' });
  return Object.assign(it, { skill: t.skill, skillName: t.skillName, canon: t.canon, topicId: t.topicId, conf: t.conf });
}
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const clean = (s) => String(s == null ? '' : s).replace(/\s*—\s*/g, ', ').replace(/\s+/g, ' ').trim();
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Gen Chem topic names come from the engine's own skill table.
const gcSrc = read('tools/gc/index.html');
const GC_NAMES = {};
for (const m of gcSrc.matchAll(/\{id:'([a-z0-9-]+)',\s*tier:\d+,\s*name:'([^']+)'/g)) GC_NAMES[m[1]] = m[2].replace(/\s*\(.*\)$/, '').replace(/&amp;/g, '&');
const GC_EXTRA = { kinetics: 'Kinetics', equilibrium: 'Equilibrium', 'acid-base': 'Acids and Bases', redox: 'Redox', gases: 'Gases', thermo: 'Thermochemistry', stoich: 'Stoichiometry', liquids: 'Liquids' };

function gchem() {
  const src = JSON.parse(read('games/gchem.json'));
  const out = [], skipped = [];
  for (const q of src) {
    if (!Array.isArray(q.opts) || q.opts.length !== 5 || !q.why) { skipped.push(q.id); continue; }
    out.push({ id: 'gc:' + q.id, section: 'gchem', topic: q.topic, topicName: clean(GC_NAMES[q.topic] || GC_EXTRA[q.topic] || q.topic).replace(/ & /g, ' and '),
      difficulty: q.difficulty || 1, stem: clean(q.q), choices: q.opts.map(clean), answer: q.correct, why: clean(q.why),
      // explanation standard (docs/EXPLANATION-STANDARD.md), only where the source item carries it
      ...(Array.isArray(q.steps) ? { steps: q.steps.map(clean) } : {}),
      ...(Array.isArray(q.traps) && q.traps.length === 5 ? { traps: q.traps.map((t) => (t == null ? null : clean(t))) } : {}),
      ...(q.trick ? { trick: clean(q.trick) } : {}) });
  }
  return { name: 'gchem', source: 'games/gchem.json', items: out, skipped };
}

// Alt text for the Climb's drawn QR figures (read from each SVG's labels).
const CLIMB_FIG_ALT = {
  'qr:climb-aq83c8': 'A cylinder of radius 3 and height 10 with a hemisphere of the same radius sitting on top.',
  'qr:climb-cdsj5b': 'A sphere inside a cylinder, touching the curved side and both circular ends.'
};
function qrClimb() {
  const w = {}; vm.runInContext(read('tools/minitests/bank.js'), vm.createContext({ window: w }));
  const out = [], skipped = [];
  for (const t of w.MINITEST_BANK.tests) for (const q of t.questions) {
    if (q.section !== 'qr') continue;
    if (!Array.isArray(q.choices) || q.choices.length !== 5 || !q.explanation) { skipped.push(q.stem.slice(0, 40)); continue; }
    const id = 'qr:climb-' + hash(q.stem);
    const it = { id, section: 'qr', topic: slug(q.topic), topicName: clean(q.topic).replace(/ & /g, ' and ').replace(/\s*\(.*\)$/, ''),
      difficulty: t.tier, stem: clean(q.stem), choices: q.choices.map(clean), answer: q.correct, why: clean(q.explanation), ...(q.canon ? { canon: q.canon } : {}) };
    // A Climb figure travels with its item, so Repair never shows "the triangle shown" without the triangle.
    if (q.figureSvg) { it.img = 'data:image/svg+xml;base64,' + Buffer.from(q.figureSvg).toString('base64'); it.imgAlt = CLIMB_FIG_ALT[id] || 'Figure for this question.'; }
    out.push(it);
  }
  return { name: 'qr-climb', source: 'tools/minitests/bank.js (QR items)', items: out, skipped };
}

// Biology: only items that already have five choices and a worked reason, and that the
// full-length tests do not use. The 350 short-form items (three or four choices, no
// explanation) are held back until they are rewritten; nothing is invented to fill them.
const BIO_TOPICS = {
  water: ['water', 'Water'], biomolecules: ['biomolecules', 'Biomolecules'], carbs: ['carbohydrates', 'Carbohydrates'], lipids: ['lipids', 'Lipids'],
  proteins: ['proteins', 'Proteins'], nucleic: ['nucleic-acids', 'Nucleic acids'], enzymes: ['enzymes', 'Enzymes'],
  'cell-types': ['cell-types', 'Prokaryotes and eukaryotes'], organelles: ['organelles', 'Organelles'], cytoskeleton: ['cytoskeleton', 'Cytoskeleton'],
  membrane: ['membranes', 'Membranes and transport'], signaling: ['signaling', 'Cell signaling'],
  glycolysis: ['glycolysis', 'Glycolysis'], biochem: ['glycolysis', 'Glycolysis'], krebs: ['krebs-etc', 'Krebs cycle and electron transport'], photo: ['photosynthesis', 'Photosynthesis'],
  mitosis: ['cell-cycle', 'Cell cycle and mitosis'], 'cell-cycle': ['cell-cycle', 'Cell cycle and mitosis'],
  replication: ['replication-repair', 'DNA replication and repair'], repair: ['replication-repair', 'DNA replication and repair'],
  transcription: ['transcription', 'Transcription'], translation: ['translation', 'Translation'], 'cell-mol': ['translation', 'Translation'],
  mutation: ['mutations', 'Mutations'], molecular: ['mutations', 'Mutations'],
  operon: ['gene-regulation', 'Gene regulation'], 'eukaryotic-reg': ['gene-regulation', 'Gene regulation'], lab: ['lab-techniques', 'Lab techniques'],
  genetics: ['genetics', 'Genetics'], physio: ['body-systems', 'Body systems'], evolution: ['evolution', 'Evolution']
};
function bio() {
  const src = JSON.parse(read('games/bio.json'));
  const w = {}; vm.runInContext(read('tools/mock/data/full-mocks.js'), vm.createContext({ window: w }));
  const inTests = new Set(); (function walk(o, d) { if (!o || d > 7) return; if (Array.isArray(o)) o.forEach((x) => walk(x, d + 1)); else if (typeof o === 'object') { if (typeof o.id === 'string' && o.id.startsWith('bio:')) inTests.add(o.id.slice(4)); Object.values(o).forEach((x) => walk(x, d + 1)); } })(w, 0);
  const out = [], skipped = [];
  for (const q of src) {
    if (!Array.isArray(q.opts) || q.opts.length !== 5 || !q.why || inTests.has(q.id) || !BIO_TOPICS[q.topic]) { skipped.push(q.id); continue; }
    out.push({ id: 'bio:' + q.id, section: 'bio', topic: BIO_TOPICS[q.topic][0], topicName: BIO_TOPICS[q.topic][1], difficulty: q.difficulty || 1,
      stem: clean(q.q), choices: q.opts.map(clean), answer: q.correct, why: clean(q.why) });
  }
  return { name: 'bio', source: 'games/bio.json (five choices with a worked reason, not used by the full-length tests)', items: out, skipped };
}

// Organic Chemistry: the 388 five-choice items with a worked reason in the shared test bank
// (the diagnostic draws its OChem questions from the same pool). Topic names are the
// diagnostic's own labels.
const OC_NAMES = { 'mech-sne': 'Substitution and elimination', 'stereo-rs': 'Stereochemistry', 'alkene-add': 'Alkene additions', alkyne: 'Alkynes',
  'arom-eas': 'Aromaticity and EAS', 'alc-eth': 'Alcohols and ethers', carbonyl: 'Carbonyl chemistry', acids: 'Carboxylic acids and derivatives', amines: 'Amines',
  'spec-ir-nmr': 'IR and NMR', synth: 'Synthesis', lab: 'Lab techniques', 'mech-arrows': 'Arrow pushing', 'ab-ochem': 'Acids and bases in OChem' };
const DAT = JSON.parse(read('scripts/dat-mock-bank.json'));
function ochem() {
  const out = [], skipped = [];
  for (const q of DAT.ochem || []) {
    if (!Array.isArray(q.opts) || q.opts.length !== 5 || !q.why || !OC_NAMES[q.topic]) { skipped.push(q.id); continue; }
    out.push({ id: 'oc:' + q.id, section: 'ochem', topic: q.topic, topicName: OC_NAMES[q.topic], difficulty: q.difficulty || 1,
      stem: clean(q.q), choices: q.opts.map(clean), answer: q.correct, why: clean(q.why) });
  }
  return { name: 'ochem', source: 'scripts/dat-mock-bank.json (OChem, five choices with a worked reason)', items: out, skipped };
}
// QR from the diagnostic pool (five choices with a worked reason), so a diagnostic QR miss has
// twins by skill. QR skills are named without the topic (a percent question is a percent
// question in any topic), so they also match the Climb items in qr-climb.json.
const QR_NAMES = { 'frac-add': 'Fractions', 'lin-eq': 'Linear equations', 'pct-chg': 'Percent change', discr: 'Data sufficiency and discrimination', estim: 'Estimation',
  ratios: 'Ratios', 'p-andor': 'Probability', algebra: 'Algebra', logarithms: 'Logarithms', probability: 'Probability', rate: 'Rates and work', geometry: 'Geometry',
  'word-problem': 'Word problems', data: 'Data interpretation', untimed: 'Test strategy', guess: 'Test strategy' };
function qrDat() {
  const out = [], skipped = [];
  for (const q of DAT.qr || []) {
    if (!Array.isArray(q.opts) || q.opts.length !== 5 || !q.why) { skipped.push(q.id); continue; }
    out.push({ id: 'qr:' + q.id, section: 'qr', topic: q.topic, topicName: QR_NAMES[q.topic] || q.topic.replace(/-/g, ' '), difficulty: q.difficulty || 1,
      stem: clean(q.q), choices: q.opts.map(clean), answer: q.correct, why: clean(q.why), ...(q.canon ? { canon: q.canon } : {}) });
  }
  return { name: 'qr-dat', source: 'scripts/dat-mock-bank.json (QR, five choices with a worked reason)', items: out, skipped };
}
// The browser normalizes a test question's raw topic with this map (shared/ace-test-review.js),
// so a diagnostic or full-length miss lands under the same topic as the practice bank.
function topicsMap() {
  const gc = {}; for (const q of DAT.gc || []) gc[q.topic] = [q.topic, clean(GC_NAMES[q.topic] || GC_EXTRA[q.topic] || q.topic).replace(/ & /g, ' and ')];
  const bio = {}; for (const [k, v] of Object.entries(BIO_TOPICS)) bio[k] = v;
  const oc = {}; for (const [k, v] of Object.entries(OC_NAMES)) oc[k] = [k, v];
  const qr = {}; for (const q of DAT.qr || []) qr[q.topic] = [q.topic, QR_NAMES[q.topic] || q.topic.replace(/-/g, ' ')];
  // keep the map stable for older stored misses whose topic no live item uses any more
  for (const k of ['logarithms']) if (!qr[k]) qr[k] = [k, QR_NAMES[k]];
  return { format: 1, gchem: gc, bio, ochem: oc, qr };
}

const problems = [];
function validate(bank) {
  const ids = new Set();
  for (const it of bank.items) {
    const where = bank.name + ' ' + it.id;
    if (ids.has(it.id)) problems.push(where + ': duplicate id'); ids.add(it.id);
    if (it.choices.length !== 5) problems.push(where + ': not five choices');
    if (new Set(it.choices).size !== 5) problems.push(where + ': two identical choices');
    if (!(Number.isInteger(it.answer) && it.answer >= 0 && it.answer < 5)) problems.push(where + ': answer out of range');
    if (!it.stem || !it.why || !it.topic || !it.topicName) problems.push(where + ': missing stem, why or topic');
    if (/—/.test(JSON.stringify(it))) problems.push(where + ': em dash');
    if (!it.skill || !it.skillName) problems.push(where + ': no skill tag');
  }
}

const check = process.argv.includes('--check');
let stale = 0;
const BANKS = [gchem(), qrClimb(), bio(), ochem(), qrDat()];
for (const bank of BANKS) {
  bank.items.forEach(withSkill);
  validate(bank);
  const file = path.join(ROOT, 'data', bank.name + '.json');
  const body = JSON.stringify({ format: 1, section: bank.items[0].section, source: bank.source, count: bank.items.length, items: bank.items });
  if (check) { if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== body) { stale++; console.error('stale: data/' + bank.name + '.json (run node scripts/build-ace-banks.mjs)'); } }
  else { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, body); }
  const topics = new Set(bank.items.map((i) => i.topic)).size, skills = new Set(bank.items.map((i) => i.skill)).size;
  const named = bank.items.filter((i) => i.canon).length;
  console.log(`${bank.name}: ${bank.items.length} items, ${topics} topics, ${skills} skills (${named} on a canonical subtopic), ${bank.skipped.length} left out`);
}
// Canonical tag coverage for every served item and the private banks, and the low-confidence list.
{
  const { coverage } = await import('./bank/skill-coverage.mjs');
  const { report, low } = coverage(BANKS);
  for (const [file, body] of [['scripts/bank/out/skill-coverage.json', JSON.stringify(report, null, 1) + '\n'], ['scripts/bank/out/skill-low-confidence.json', JSON.stringify(low) + '\n']]) {
    const f = path.join(ROOT, file);
    if (check) { if (!fs.existsSync(f) || fs.readFileSync(f, 'utf8') !== body) { stale++; console.error('stale: ' + file); } }
    else { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, body); }
  }
}
{
  const file = path.join(ROOT, 'data', 'topics.json'), body = JSON.stringify(topicsMap());
  if (check) { if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== body) { stale++; console.error('stale: data/topics.json'); } }
  else fs.writeFileSync(file, body);
}
if (problems.length || stale) { for (const p of problems.slice(0, 30)) console.error('  ' + p); console.error(`build-ace-banks: ${problems.length} format problem(s), ${stale} stale file(s)`); process.exit(1); }
