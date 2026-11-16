// skill-coverage.mjs : how many served items sit on a canonical subtopic, per surface and section,
// and the list of items flagged low confidence (tagged with the parent topic only, never guessed).
// Called by scripts/build-ace-banks.mjs, which writes scripts/bank/out/skill-coverage.json and
// scripts/bank/out/skill-low-confidence.json. Ids, topics and tags only: no question text.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const Skills = createRequire(import.meta.url)(path.join(ROOT, 'shared/ace-skills.js'));
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const win = (f, name) => { const w = {}; vm.runInNewContext(read(f), { window: w }); return w[name]; };
const SEC = { BIO: 'bio', GC: 'gchem', OCHEM: 'ochem', QR: 'qr', bio: 'bio', gc: 'gchem', gchem: 'gchem', ochem: 'ochem', qr: 'qr' };

export function coverage(banks) {
  const topics = JSON.parse(read('data/topics.json'));
  const norm = (sec, t) => { const m = (topics[sec] || {})[t]; return m ? m[0] : t; };
  const surfaces = {}, low = [];
  function add(surface, section, id, item) {
    const t = Skills.tag(item);
    const s = surfaces[surface] = surfaces[surface] || {};
    const c = s[section] = s[section] || { items: 0, meta: 0, table: 0, low: 0 };
    c.items++; c[t.conf]++;
    if (t.conf === 'low') {
      const cand = ((Skills.candidates[section] || {})[item.topic]);
      low.push({ id, surface, section, topic: item.topic, parent: t.topicId, why: cand ? 'no single candidate won on the keywords' : 'topic has no canonical mapping', candidates: cand ? [].concat(cand).filter((x) => x[0] !== '@') : [] });
    }
  }
  // practice banks (Repair reads gchem, bio, qr-climb, qr-dat, ochem)
  for (const b of banks) for (const it of b.items) add(b.name === 'ochem' ? 'oc-hub (data/ochem.json)' : 'repair (data/' + b.name + '.json)', it.section, it.id, it);
  // the diagnostic and practice-test pool
  const D = JSON.parse(read('scripts/dat-mock-bank.json'));
  for (const k of Object.keys(D)) for (const q of D[k]) { const sec = SEC[k]; add('test pool (scripts/dat-mock-bank.json)', sec, q.id, { section: sec, topic: norm(sec, q.topic), stem: q.q, why: q.why }); }
  // the existing full-length forms
  const F = win('tools/mock/data/full-mocks.js', 'ACE_FULL_MOCKS');
  const seen = new Set();
  for (const m of F.mocks) for (const [k, list] of Object.entries(m.sections)) for (const q of list) { if (seen.has(q.id)) continue; seen.add(q.id); const sec = SEC[k]; add('full-length 1 to 4 (tools/mock/data/full-mocks.js)', sec, q.id, { section: sec, topic: q.stop, stem: q.q, why: q.why }); }
  // The Climb (all four sections; the review tags its rows by the topic title)
  const C = win('tools/minitests/bank.js', 'MINITEST_BANK');
  for (const t of C.tests) t.questions.forEach((q, i) => add('the climb (tools/minitests/bank.js)', SEC[q.section] || q.section, t.id + ':' + i, { section: SEC[q.section] || q.section, topic: q.topic, stem: q.stem, why: q.explanation }));
  // Reading: every served question by its type
  const RC = win('tools/rc/data/bank.js', 'ACE_RC_BANK');
  for (const p of Object.values(RC.passages)) for (const q of p.questions) add('reading (tools/rc/data/bank.js)', 'rc', q.id, { section: 'rc', topic: q.type, stem: q.stem });
  // PAT: generated items, one tag per subtest
  for (const t of ['keyholes', 'tfe', 'angles', 'holepunch', 'cubes', 'patternfold']) add('pat trainers and tests (generated)', 'pat', 'pat:' + t, { section: 'pat', topic: t });
  // the private banks (tags committed by scripts/bank/build-private.mjs)
  const tf = path.join(ROOT, 'scripts/bank/out/ace-bank-tags.json');
  if (fs.existsSync(tf)) {
    const T = JSON.parse(fs.readFileSync(tf, 'utf8')).tags;
    const s = surfaces['private banks (review queue and new forms)'] = {};
    for (const [id, v] of Object.entries(T)) {
      const sec = { 'bio:': 'bio', 'gc:': 'gchem', 'oc:': 'ochem', 'qr:': 'qr', 'rc:': 'rc' }[id.slice(0, id.indexOf(':') + 1)];
      const c = s[sec] = s[sec] || { items: 0, meta: 0, table: 0, low: 0 };
      c.items++; c[v[2]]++;
      if (v[2] === 'low') low.push({ id, surface: 'private banks', section: sec, parent: v[1], why: v[1] ? 'no single candidate won on the keywords, or the skill has no subtopic in the taxonomy' : 'no mapping' });
    }
  }
  for (const s of Object.values(surfaces)) for (const c of Object.values(s)) c.canonicalPct = Math.round((1000 * (c.meta + c.table)) / Math.max(1, c.items)) / 10;
  const totals = {};
  for (const s of Object.values(surfaces)) for (const [sec, c] of Object.entries(s)) { const t = totals[sec] = totals[sec] || { items: 0, meta: 0, table: 0, low: 0 }; t.items += c.items; t.meta += c.meta; t.table += c.table; t.low += c.low; }
  for (const t of Object.values(totals)) t.canonicalPct = Math.round((1000 * (t.meta + t.table)) / Math.max(1, t.items)) / 10;
  return {
    report: { format: 1, note: 'meta = the item\'s own topic names one subtopic; table = the keyword table chose one of the topic\'s candidates; low = flagged, tagged with the parent topic only (see skill-low-confidence.json)', bySection: totals, surfaces, lowCount: low.length },
    low: { format: 1, count: low.length, items: low }
  };
}
