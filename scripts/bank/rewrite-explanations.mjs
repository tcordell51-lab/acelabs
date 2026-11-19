#!/usr/bin/env node
// rewrite-explanations.mjs : Gen Chem explanations into the explanation standard, as a SIDECAR.
//
//   node scripts/bank/rewrite-explanations.mjs --public            data/gchem.json (public bank)
//        -> scripts/bank/out/gchem-explanations-standard.json      (committed: public text only)
//   node scripts/bank/rewrite-explanations.mjs --private DIR       DIR/ace-bank-gchem/items/*.jsonl
//        -> DIR/ace-bank-gchem/explanations-standard.json          (private: never written into this repo)
//
// Nothing in a bank changes. Every record is status "rewritten" (passes the standard, review pending)
// or "needs-hand-rewrite" (with the reason). Rules, docs/EXPLANATION-STANDARD.md:
//   - Only the item's OWN words are used: its explanation, its per-choice wrong text, its key choice.
//     No new fact and no new number is written; scripts/bank/verify-rewrites.py checks every number.
//   - The answer key is copied, never changed.
//   - Trick: one of Thomas's three approved lines, or another recorded line of his (with its Zoom
//     source), only where the item's text is on that line's topic; otherwise the bank's own trick,
//     labelled "Draft trick, Thomas to approve".
//   - Steps: the explanation split into 3 to 5 lines of about 12 words; an item that does not split
//     cleanly is queued for a hand rewrite rather than cut.
//   - Traps: one per wrong choice, from the bank's own per-choice text (private bank). The public bank
//     has no per-choice text, so a public item is rewritten only if its explanation names every wrong
//     choice; the rest are queued.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(import.meta.url);
const W = require(path.join(ROOT, 'shared/ace-walkthrough.js'));
const args = process.argv.slice(2), opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const L = 'ABCDE', TODAY = '2026-11-19';

/* ---- Thomas's lines. approved: cleared 2026-11-19. Others are recorded (playbook, with source). ---- */
const LINES = [
  { id: 'electrons', text: 'Electrons always flow from the anode to the cathode.', src: 'Zoom 2026-04-28 #84183655423 ~0:48:29', approved: TODAY,
    subs: ['gc_galvanic', 'gc_electrolytic', 'gc_faradays', 'gc_nernst'], when: /electrons? (flow|travel|move|go)|through the (wire|external)|external circuit/i },
  { id: 'redcat', text: 'Reduction is at the cathode, red cat. The oxidation occurs at the anode and ox.', src: 'Zoom 2026-04-28 #84183655423 ~0:14:46', approved: TODAY,
    subs: ['gc_galvanic', 'gc_electrolytic', 'gc_faradays', 'gc_oxidation_states', 'gc_nernst'], when: /\b(cathode|anode)\b/i },
  { id: 'moles', text: "Moles are king. We always want to get to moles, it's so crucial", src: 'Zoom 2026-09-03 #85955264465 ~0:45:01', approved: TODAY,
    subs: ['gc_mole_concept', 'gc_limiting_reagent', 'gc_empirical_molecular', 'gc_density_composition', 'gc_balancing_equations', 'gc_molarity_molality', 'gc_dilution', 'gc_ideal_gas', 'gc_titration', 'gc_partial_pressure'], when: /\bmol(e|es)?\b|\bmoles\b/i },
  { id: 'qk', text: 'Q versus K, right? Q less than K, shift right, Q greater than K, shift left.', src: 'Zoom 2026-05-12 #81751380276 ~0:42:08',
    subs: ['gc_le_chatelier', 'gc_keq_kp_ksp', 'gc_gibbs'], when: /\bQ\b.*\bK|\bK\b.*\bQ\b/ },
  { id: 'vp', text: 'Vapor pressure and boiling point have an inverse relationship.', src: 'Zoom 2026-06-29 #83198019799 ~0:15:48',
    subs: ['gc_vapor_pressure', 'gc_intermolecular_forces', 'gc_colligative', 'gc_phase_diagrams'], when: /vapor pressure/i },
  { id: 'chaos', text: 'we know that, as a rule, the universe wants to be random. It wants chaos', src: 'Zoom 2026-05-05 #87057078433 ~0:51:48',
    subs: ['gc_entropy'], when: /entropy|disorder|\bS\b/ },
  { id: 'mcat', text: 'The way a lot of people like it is Q equals MCAT', src: 'Zoom 2026-06-17 #84628460505 ~0:40:03',
    subs: ['gc_calorimetry', 'gc_heating_curves', 'gc_enthalpy'], when: /mc\s*(Δ|delta|D)T|q\s*=\s*m/i },
  { id: 'titr', text: 'the first step, always, in a titration is to write out the balanced equation.', src: 'Zoom 2026-05-19 #85100490191 ~0:09:54',
    subs: ['gc_titration'], when: /balanced equation|ratio|diprotic|2:1|1:2/i },
  { id: 'colli', text: "it's based upon the number of molecules", src: 'Zoom 2026-05-26 #89388063614 ~0:41:44',
    subs: ['gc_colligative'], when: /particles|van ?'?t ?hoff|\bi\b/i },
  { id: 'zero', text: "if the rate doesn't change based on the concentration. 0th order.", src: 'Zoom 2026-07-31 #88197467164 ~1:31:03',
    subs: ['gc_rate_laws', 'gc_integrated_rate_laws'], when: /zero[- ]order|0th/i }
];
function pickTrick(sub, text, own) {
  for (const l of LINES) if (l.subs.includes(sub) && l.when.test(text)) return { text: l.text, src: l.src, ...(l.approved ? { approved: l.approved } : {}), line: l.id };
  if (!own) return null;
  const t = tidy(own);
  if (W.lines(t) <= 1 && W.sentences(t) <= 2) return { text: t, draft: true };
  const first = sentencesOf(t)[0];
  if (first && W.lines(first) <= 1) return { text: first, draft: true };
  const clause = first && first.split(/;\s+|:\s+(?=\S+\s+\S+\s+\S+)/)[0];      // the rule before its elaboration
  if (clause && W.lines(clause) <= 1 && nwords(clause) >= 4) return { text: end(clause), draft: true };
  return null;
}

/* ---- text tools ---- */
// caret exponents in the brace form the walkthrough renders (10^-2 to 10^{-2}); no em dashes
const tidy = (s) => String(s || '').replace(/\s*\u2014\s*/g, ', ').replace(/\^\(([-+]?\d+(?:\.\d+)?)\)|\^([-+]?(?:\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?))/g, (m, a, b) => '^{' + (a || b) + '}').replace(/\s+/g, ' ').trim();
function sentencesOf(s) { return tidy(s).split(/(?<=[.!?])\s+(?=[A-Z0-9("'])/).map((x) => x.trim()).filter(Boolean); }
const end = (s) => /[.!?]$/.test(s) ? s : s + '.';
// capitalize a plain word only: never a symbol or formula (e^, pH, pKa, k, x, kJ, mL ...)
const cap = (s) => { const w = (s.match(/^\S+/) || [''])[0].replace(/[,.;:]$/, ''); const plainWord = /^(a|[a-z][a-z'-]+)$/.test(w) && !/^(pH|pKa|pKb|pOH|kJ|mL|mol|kg|mg|mm|nm|eV|amu)$/.test(w); return plainWord ? s.charAt(0).toUpperCase() + s.slice(1) : s; };
const FRONTED = /^(with|when|if|since|because|as|although|though|for|at|in|on|by|after|before|once|unless|while|whatever|whether|given|starting|compared|relative)\b/i;
const nwords = (s) => W.words(s);
// split a long sentence at clause joints, keeping each piece a readable line
const JOINTS = [/;\s+/, /:\s+(?=\S+\s+\S+\s+\S+)/, /,\s+(?=so\b|which\b|while\b|then\b|because\b|giving\b|making\b|and so\b)/, /\s+(?=because\b)/, /,\s+and\s+/];
const depthAt = (t, i) => { let d = 0; for (let k = 0; k < i; k++) { if (t[k] === '(' || t[k] === '[') d++; else if (t[k] === ')' || t[k] === ']') d--; } return d; };
// split only where the joint sits outside every parenthesis
function splitTop(p, re) {
  const g = new RegExp(re.source, 'g'), out = []; let last = 0, m;
  while ((m = g.exec(p))) { if (m[0].length === 0) { g.lastIndex++; continue; } if (depthAt(p, m.index) === 0) { out.push(p.slice(last, m.index)); last = m.index + m[0].length; } }
  out.push(p.slice(last)); return out;
}
const balanced = (t) => depthAt(t, t.length) === 0;
function pieces(sentence) {
  let out = [sentence];
  for (const j of JOINTS) {
    out = out.flatMap((p) => {
      if (nwords(p) <= 12) return [p];
      const parts = splitTop(p, j).map((x) => x.trim()).filter(Boolean);
      return parts.length > 1 && parts.every((x) => nwords(x) >= 3) ? parts : [p];
    });
  }
  // a long arithmetic chain splits before its second '=' (the chain continues on the next line)
  out = out.flatMap((p) => {
    if (nwords(p) <= 12) return [p];
    const eq = [...p.matchAll(/\s=\s/g)].map((m) => m.index);
    if (eq.length >= 3 && depthAt(p, eq[1]) === 0) { const a = p.slice(0, eq[1]).trim(), b = p.slice(eq[1]).trim(); if (nwords(a) >= 3 && nwords(b) >= 3) return [a, b]; }
    return [p];
  });
  // still long: split at the comma nearest the middle, both halves 4 words or more
  out = out.flatMap(function split(p) {
    if (nwords(p) <= 12) return [p];
    const total = nwords(p); let best = null;
    for (const m of p.matchAll(/,\s+/g)) {
      const left = p.slice(0, m.index), right = p.slice(m.index + m[0].length);
      const nl = nwords(left), nr = nwords(right);
      if (depthAt(p, m.index) === 0 && nl >= 4 && nr >= 4 && !/\d$/.test(left) && !/\b(a|an|the|its|their|this|that|each|every)\s+\S+$/i.test(left) && !FRONTED.test(left.replace(/^(so|and|but|then)\s+/i, ''))) { const d = Math.abs(nl - total / 2); if (!best || d < best.d) best = { d, left, right }; }
    }
    return best ? [best.left, best.right].flatMap(split) : [p];
  });
  return out.map((p) => end(cap(p.replace(/[;:,]\s*$/, ''))));
}
// more than 5 lines: join neighbours while the joined line stays one short line
function fitFive(steps) {
  steps = steps.slice();
  while (steps.length > 5) {
    let bi = -1, bw = 1e9;
    for (let i = 0; i < steps.length - 1; i++) { const j = steps[i].replace(/\.$/, '') + ', ' + steps[i + 1].charAt(0).toLowerCase() + steps[i + 1].slice(1); const w = nwords(j); if (w <= 12 && W.lines(j) <= 1 && w < bw) { bw = w; bi = i; } }
    if (bi < 0) break;
    steps.splice(bi, 2, steps[bi].replace(/\.$/, '') + ', ' + steps[bi + 1].charAt(0).toLowerCase() + steps[bi + 1].slice(1));
  }
  return steps;
}
function stepsFrom(text) { return sentencesOf(text).flatMap(pieces); }
// bold the key value (or key phrase) once, in the last step that contains it
function boldKey(steps, keyText) {
  const m = /^[-+−]?\d[\d.,]*(?:\s*(?:x|×)\s*10\^?[-+]?\d+)?/.exec(keyText.trim());
  const needle = m ? m[0].trim() : null;
  if (!needle) return steps;
  for (let i = steps.length - 1; i >= 0; i--) {
    const k = steps[i].indexOf(needle);
    if (k >= 0 && !/\*\*/.test(steps[i])) { steps[i] = steps[i].slice(0, k) + '**' + needle + '**' + steps[i].slice(k + needle.length); break; }
  }
  return steps;
}
function trapLine(t) {
  t = tidy(t); if (!t) return null;
  if (W.lines(t) <= 2 && W.sentences(t) <= 2) return t;
  const s = sentencesOf(t); let acc = '';
  for (const x of s) { const next = acc ? acc + ' ' + x : x; if (W.lines(next) <= 2) acc = next; else break; }
  return acc || null;
}

/* ---- one item to the standard ---- */
function rewrite(src) {
  const { id, sub, stem, choices, key, correct, fastest, wrong, ownTrick, prov } = src;
  const reasons = [], keyText = tidy(choices[key]);
  // 1. answer line
  let answer = nwords(keyText) <= 4 ? 'The answer is ' + keyText.replace(/[.]$/, '') + '.' : end(cap(keyText));
  if (W.lines(answer) > 1) answer = end(cap(keyText));
  if (W.lines(answer) > 1 || W.sentences(answer) > 2) { const f = sentencesOf(correct)[0]; answer = f && W.lines(f) <= 1 ? f : null; }
  if (!answer) reasons.push('answer: key choice and first sentence both over one line');
  // 2. steps
  let steps = stepsFrom(correct);
  if (steps.length < 3 && fastest) steps = steps.concat(stepsFrom(fastest));
  steps = fitFive(steps);
  if (steps.length < 3) reasons.push(`steps: explanation gives ${steps.length} line(s)`);
  if (steps.length > 5) reasons.push(`steps: explanation gives ${steps.length} lines (max 5)`);
  const longStep = steps.find((s) => nwords(s) > W.LIMITS.stepWordsMax || W.lines(s) > 1);
  if (longStep) reasons.push('steps: a line will not split under 14 words');
  if (steps.some((x) => !balanced(x)) || (answer && !balanced(answer))) reasons.push('steps: a split would break a parenthesis');
  steps = boldKey(steps.slice(0, 5), keyText);
  // 3. traps, one per wrong choice
  const traps = {};
  choices.forEach((c, i) => { if (i === key) return; const t = wrong[L[i]]; const line = t ? trapLine(t) : null; traps[L[i]] = line; if (!line) reasons.push(`trap ${L[i]}: ${t ? 'will not fit in two lines' : 'no per-choice text in the source'}`); });
  // 4. trick
  const trick = pickTrick(sub, [stem, correct, fastest, keyText].join(' '), ownTrick);
  if (!trick) reasons.push('trick: no recorded line on topic and the bank trick will not fit one line');
  // 5. check yourself: why the most tempting wrong choice is wrong (the bank's own words)
  const order = Object.keys(traps).filter((k) => traps[k]);
  let check = null;
  for (const k of order) { const a = sentencesOf(traps[k])[0]; if (a && W.lines(a) <= 1) { const ct = tidy(choices[L.indexOf(k)]); check = { q: ct.length <= 30 ? `Why is ${k}, ${ct}, a trap?` : `Why is choice ${k} a trap?`, a }; break; } }
  if (!check) reasons.push('check: no one-line trap to ask about');
  // 6. sources (collapsed on screen)
  const sources = [`ACE DAT Gen Chem bank, ${id} (${prov}).`, `Rewritten from the item's own explanation, ${TODAY}. Review pending.`];
  if (trick && trick.src) sources.push(`Thomas's line: ${trick.src}${trick.approved ? ', approved ' + trick.approved : ''}.`);
  const explain = { answer, trick, steps, traps, check, sources };
  const problems = reasons.length ? [] : W.validate(explain);
  let status = reasons.length || problems.length ? 'needs-hand-rewrite' : 'rewritten';
  // everything but the per-choice lines is done: the source has no wrong-choice text to use
  const onlyTraps = reasons.length && reasons.every((x) => /^(trap|check)/.test(x)) && !problems.length;
  if (onlyTraps && !W.validate(Object.assign({}, explain, { traps: { x: 'x' }, check: { q: 'x' } })).length) status = 'needs-trap-lines';
  return { id, key: L[key], subtopic: sub, status, review: 'pending', reasons: reasons.concat(problems),
    trickKind: trick ? (trick.approved ? 'approved' : trick.draft ? 'draft' : 'recorded') : null, explain: status === 'needs-hand-rewrite' ? null : explain };
}

/* ---- sources ---- */
function privateItems(dir) {
  const b = path.join(dir, 'ace-bank-gchem'), tags = JSON.parse(fs.readFileSync(path.join(b, 'ace-bank-gchem.tags.json'), 'utf8')).tags;
  const out = [];
  for (const f of fs.readdirSync(path.join(b, 'items')).filter((x) => x.endsWith('.jsonl')).sort())
    for (const line of fs.readFileSync(path.join(b, 'items', f), 'utf8').split('\n')) {
      if (!line.trim()) continue; const it = JSON.parse(line); if (it.section !== 'gchem') continue;
      const ex = it.explanation || {};
      out.push({ id: it.id, sub: (tags[it.id] || {}).subtopic || '', stem: it.stem, choices: it.choices, key: L.indexOf(it.answer), correct: ex.correct || '', fastest: ex.fastest || '', wrong: ex.wrong || {}, ownTrick: it.trick || '', prov: it.provenance || 'original' });
    }
  return { items: out, file: path.join(b, 'explanations-standard.json'), name: 'ace-bank-gchem (private)' };
}
function publicItems() {
  const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/gchem.json'), 'utf8'));
  const items = d.items.map((it) => {
    // the public bank has no per-choice text: a wrong choice gets a trap only from a sentence of `why`
    // that names it (its exact text), never from a guess
    const wrong = {}; const sents = sentencesOf(it.why);
    it.choices.forEach((c, i) => {
      if (i === it.answer) return;
      if (Array.isArray(it.traps) && it.traps[i]) { wrong[L[i]] = it.traps[i]; return; }
      const needle = tidy(c); if (needle.length < 3) return;
      const hit = sents.find((s) => s.includes(needle) && !s.includes(tidy(it.choices[it.answer])));
      if (hit) wrong[L[i]] = hit;
    });
    const correct = Array.isArray(it.steps) && it.steps.length ? it.steps.join(' ') : it.why;
    return { id: it.id, sub: it.canon || it.skill || '', stem: it.stem, choices: it.choices, key: it.answer, correct, fastest: '', wrong, ownTrick: it.trick || '', prov: 'Ace Labs public bank' };
  });
  return { items, file: path.join(ROOT, 'scripts/bank/out/gchem-explanations-standard.json'), name: 'data/gchem.json (public)' };
}

const set = opt('--private') ? privateItems(opt('--private')) : args.includes('--public') ? publicItems() : null;
if (!set) { console.error('use --public or --private DIR'); process.exit(2); }
const records = set.items.map(rewrite);
const count = (f) => records.filter(f).length;
const summary = { bank: set.name, made: TODAY, items: records.length, rewritten: count((r) => r.status === 'rewritten'), needsTrapLines: count((r) => r.status === 'needs-trap-lines'), needsHand: count((r) => r.status === 'needs-hand-rewrite'),
  trick: { approved: count((r) => r.trickKind === 'approved' && r.explain), recorded: count((r) => r.trickKind === 'recorded' && r.explain), draft: count((r) => r.trickKind === 'draft' && r.explain) },
  reasons: {} };
records.filter((r) => r.status !== 'rewritten').forEach((r) => r.reasons.forEach((x) => { const k = x.replace(/ [A-E]:/, ':').replace(/\d+ line\(s\)|\d+ lines/, 'N lines').replace(/\(\d+ chars\)/, ''); summary.reasons[k] = (summary.reasons[k] || 0) + 1; }));
fs.writeFileSync(set.file, JSON.stringify({ format: 1, note: 'Explanation-standard rewrites (docs/EXPLANATION-STANDARD.md). Sidecar only: the bank is unchanged. Every record is review pending.', summary, records }, null, 1) + '\n');
console.log(JSON.stringify(summary, null, 1));
console.log('wrote ' + set.file);
