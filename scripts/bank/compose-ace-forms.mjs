// compose-ace-forms.mjs : six new full-length forms from the private AceTheDAT banks.
//
// Called by scripts/bank/build-private.mjs (needs the private banks on disk). Pure: it takes the
// tagged items and returns the forms as item ids only, so the result can be committed to this
// public repo without one question in it.
//
// The real DAT blueprint (ADA Candidate Guide): Survey of the Natural Sciences 100 items in 90
// minutes (Biology 40, General Chemistry 30, Organic Chemistry 30); Perceptual Ability 90 in 60;
// Reading Comprehension 50 in 60 (three passages); Quantitative Reasoning 40 in 45.
//
// ADA publishes no per-topic counts below those section totals. The topic quotas below are the
// banks' own documented working estimates, labelled as AceTheDAT numbers, never as ADA numbers:
//   Biology   the private bank's planning targets by ADA area (bio-skill-map.json, target sums)
//   GChem     ace-bank-gchem DAT-STYLE.md section 4 (instructor course-time shares scaled to 30)
//   OChem     ace-bank-ochem DAT-STYLE.md section 4 (physical properties and lab share 3)
//   QR        the official split only: 30 mathematical problems and 10 applied (word) problems
//             (ADA User's Manual); inside the 30, shares follow the eligible items per topic.
// Inside a topic: one item per canonical subtopic before any subtopic repeats (round robin,
// the least-used subtopic across all forms first), difficulty steered to about 25 / 55 / 20
// percent (1 / 2 / 3), and the key letter that is least used so far in that section preferred.
// Choices are never reordered: Thomas reviews the exact question a student will see.
// No item appears in two forms. A section the bank cannot fill is reported, never padded.

export const BLUEPRINT = {
  bio: { n: 40, sub: 'Biology', quotas: null },   // filled from the skill-map targets
  gc: { n: 30, sub: 'Gen Chem', quotas: { stoichiometry: 3, 'acids-bases': 3, equilibrium: 3, thermodynamics: 3, 'atomic-structure': 3, lab: 2, solutions: 2, kinetics: 2, 'liquids-solids': 2, 'redox-electrochem': 2, 'periodic-properties': 2, gases: 2, nuclear: 1 } },
  ochem: { n: 30, sub: 'OChem', quotas: { mechanisms: 6, reactions: 5, synthesis: 3, stereochemistry: 3, 'acid-base': 3, 'aromatics-bonding': 3, 'physical-properties+lab': 3, spectroscopy: 2, nomenclature: 2 } },
  qr: { n: 40, sub: 'QR', quotas: null },         // 10 word problems + 30 by eligible share
  rc: { n: 50, passages: 3 },
  pat: { n: 90 }
};
export const TIME = { sons: 90, pat: 60, rc: 60, qr: 45 };
const DIFF_TARGET = { 1: 0.25, 2: 0.55, 3: 0.20 };

function hash(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
export function rng(seed) { let a = hash(seed); return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function shuffle(arr, r) { const b = arr.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

/* Largest remainder: integer quotas proportional to weights, summing to n. */
export function apportion(weights, n) {
  const keys = Object.keys(weights).filter((k) => weights[k] > 0);
  const total = keys.reduce((a, k) => a + weights[k], 0);
  const raw = keys.map((k) => ({ k, x: (n * weights[k]) / total }));
  const q = Object.fromEntries(raw.map((r) => [r.k, Math.floor(r.x)]));
  let left = n - Object.values(q).reduce((a, b) => a + b, 0);
  raw.sort((a, b) => (b.x % 1) - (a.x % 1) || a.k.localeCompare(b.k));
  for (const r of raw) { if (left <= 0) break; q[r.k]++; left--; }
  return q;
}

/* An item can sit on a timed form: five choices, a key, not switched off by its bank. */
export function formEligible(it) {
  if (!Array.isArray(it.choices) || it.choices.length !== 5) return 'not five choices';
  if (!(it.answer >= 0 && it.answer < 5)) return 'no key';
  if (it.formEligible === false) return 'bank marks it off timed forms';
  if (it.figureMissing) return 'stem points to a drawing the item does not carry';
  return null;
}

function quotaKey(sec, it) {
  if (sec === 'ochem' && (it.bankTopic === 'physical-properties' || it.bankTopic === 'lab')) return 'physical-properties+lab';
  if (sec === 'qr') return it.bankTopic === 'word-problems' ? 'word-problems' : it.bankTopic;
  return it.bankTopic;
}

/* Pick n items for one form section from the pool (items not used by any form yet). */
function pickSection(sec, pool, quotas, used, subUse, r, label) {
  const out = [], letters = [0, 0, 0, 0, 0], diff = { 1: 0, 2: 0, 3: 0 };
  const n = Object.values(quotas).reduce((a, b) => a + b, 0);
  const formSubs = {};
  const short = [];
  for (const [qk, k] of Object.entries(quotas)) {
    for (let i = 0; i < k; i++) {
      const cands = pool.filter((it) => !used.has(it.id) && quotaKey(sec, it) === qk);
      if (!cands.length) { short.push(qk); continue; }
      const want = [1, 2, 3].sort((a, b) => (diff[a] - DIFF_TARGET[a] * n) - (diff[b] - DIFF_TARGET[b] * n))[0];
      const score = (it) => {
        const sub = it.canon || it.topicId || 'none';
        return (formSubs[sub] || 0) * 100 + (subUse[sub] || 0) * 3 + (it.difficulty === want ? 0 : 6) + letters[it.answer] * 2 + (it.conf === 'low' ? 4 : 0) + r();
      };
      const best = cands.reduce((a, b) => (score(b) < score(a) ? b : a));
      used.add(best.id); out.push(best);
      const sub = best.canon || best.topicId || 'none';
      formSubs[sub] = (formSubs[sub] || 0) + 1; subUse[sub] = (subUse[sub] || 0) + 1;
      letters[best.answer]++; diff[best.difficulty] = (diff[best.difficulty] || 0) + 1;
    }
  }
  if (short.length) return { ok: false, items: out, short };
  // topics come mixed, the way the exam serves them; no three identical keys in a row
  let order = null;
  for (let t = 0; t < 200 && !order; t++) {
    const o = shuffle(out, r);
    let run = false; for (let i = 2; i < o.length; i++) if (o[i].answer === o[i - 1].answer && o[i].answer === o[i - 2].answer) run = true;
    if (!run) order = o;
  }
  return { ok: true, items: order || out, letters, diff, label };
}

/* RC: three passages per form whose questions sum to exactly 50, no shared exclusion group. */
function pickRc(passages, usedP, r) {
  const free = passages.filter((p) => !usedP.has(p.id));
  const groups = (p) => [].concat(p.exclusion || []).filter(Boolean);
  const clash = (a, b) => groups(a).some((g) => groups(b).includes(g));
  let best = null;
  for (let i = 0; i < free.length; i++) for (let j = i + 1; j < free.length; j++) for (let k = j + 1; k < free.length; k++) {
    const s = [free[i], free[j], free[k]];
    if (s.reduce((a, p) => a + p.n, 0) !== 50) continue;
    if (clash(s[0], s[1]) || clash(s[0], s[2]) || clash(s[1], s[2])) continue;
    if (new Set(s.map((p) => p.topic)).size < 3) continue;
    // prefer one harder passage per form and the passages that keep later forms possible
    const score = Math.abs(s.filter((p) => p.difficulty >= 3).length - 1) * 10 + s.reduce((a, p) => a + (p.n === 17 ? 0 : 1), 0) + r();
    if (!best || score < best.score) best = { set: s, score };
  }
  if (!best) return null;
  best.set.forEach((p) => usedP.add(p.id));
  return best.set;
}

/**
 * items: { bio: [...], gc: [...], ochem: [...], qr: [...] } tagged items in the private build's
 *   shape ({ id, bankTopic, canon, topicId, conf, difficulty, answer, choices, formEligible })
 * passages: [{ id, n (questions), topic, difficulty, exclusion }]
 * bioTargets: { 'cell-molecular': 418, ... } the skill-map targets summed per ADA area
 * rcFallback: served Ace Labs RC section ids for forms the private RC bank cannot fill
 */
export function composeForms({ items, passages, bioTargets, count = 6, rcFallback = ['rc-s11', 'rc-s10'], seed = 'ace-bank-forms-v1' }) {
  const report = { sections: {}, notes: [] };
  const pools = {}, quotas = {};
  for (const sec of ['bio', 'gc', 'ochem', 'qr']) {
    const why = {};
    pools[sec] = items[sec].filter((it) => { const w = formEligible(it); if (w) why[w] = (why[w] || 0) + 1; return !w; });
    report.sections[sec] = { bank: items[sec].length, eligible: pools[sec].length, excluded: why };
  }
  quotas.bio = apportion(bioTargets, BLUEPRINT.bio.n);
  quotas.gc = BLUEPRINT.gc.quotas;
  quotas.ochem = BLUEPRINT.ochem.quotas;
  {
    const counts = {};
    for (const it of pools.qr) if (it.bankTopic !== 'word-problems') counts[it.bankTopic] = (counts[it.bankTopic] || 0) + 1;
    quotas.qr = Object.assign({ 'word-problems': 10 }, apportion(counts, 30));
  }
  report.quotas = quotas;

  const used = new Set(), usedP = new Set(), subUse = {};
  const forms = [];
  const possible = { bio: 0, gc: 0, ochem: 0, qr: 0, rc: 0 };
  for (let f = 1; f <= count; f++) {
    const r = rng(seed + ':' + f);
    const form = { id: 'ACE_' + f, n: f, name: 'Full-Length Test ' + (4 + f), sections: {}, pat: { seed: 'F' + (20261100 + f) }, rc: null, status: 'awaiting review' };
    for (const sec of ['bio', 'gc', 'ochem', 'qr']) {
      const res = pickSection(sec, pools[sec], quotas[sec], used, subUse, r, form.id + ' ' + sec);
      if (!res.ok) { report.notes.push(`${form.id} ${sec}: the bank ran out for ${[...new Set(res.short)].join(', ')}`); form.sections[sec] = null; continue; }
      possible[sec]++;
      form.sections[sec] = res.items.map((it) => it.id);
      form.mix = form.mix || {};
      form.mix[sec] = { difficulty: res.diff, keys: 'ABCDE'.split('').map((l, i) => l + res.letters[i]).join(' ') };
    }
    const set = pickRc(passages, usedP, r);
    if (set) { possible.rc++; form.rc = { passages: set.map((p) => p.id), questions: set.reduce((a, p) => a + p.n, 0) }; }
    else {
      const fb = rcFallback[f - 1 - possible.rc] || null;
      form.rc = fb ? { section: fb, fallback: true } : null;
      report.notes.push(`${form.id} rc: the private RC bank has no three unused passages that total exactly 50 questions; ` + (fb ? `this form uses the existing Ace Labs RC section ${fb} (already live, not part of the review)` : 'no RC section'));
    }
    forms.push(form);
  }
  report.possible = possible;
  return { forms, report };
}
