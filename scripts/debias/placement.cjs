// Key placement for fixed-form timed sets.
//
// Authors key wherever they think of the answer first, which is how a practice test ends up
// keyed B twenty-eight times in forty. This module decides, deterministically, which letter
// each item's key should sit on so that every letter carries close to a fifth of the keys and
// no letter runs more than twice in a row. It then moves the key there, keeps the distractors
// in their authored relative order, carries any parallel per-choice arrays along, and rewrites
// letter references inside the explanation to the new letters.
//
// Items whose choices depend on their order ("all of the above", "both A and B", roman-numeral
// combinations) are never moved; the others are placed around them. With numericOrder, a set of
// numeric choices authored in ascending order is also kept (The Climb authors many that way);
// the practice tests were never sorted, and leaving that test off keeps a rerun idempotent.
//
// Used by scripts/debias/apply-debias.mjs (practice tests) and
// tools/minitests/assemble-minitests.mjs (The Climb). CommonJS so compose-tests.js can use it too.

'use strict';

const LETTERS = 'ABCDE';
const ORDER_BOUND = /(of the above|of these|\bneither\b|\b[A-E] and [A-E]\b|\b[A-E] or [A-E]\b|\bI{1,3} and I{1,3}\b|\bI{1,3} only\b|\bchoices? [A-E]\b)/i;

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

const asNumber = (s) => {
  const t = String(s).replace(/<[^>]*>/g, '').replace(/[$,\s%]/g, '').replace(/−/g, '-');
  let m = /^(-?\d+)\/(\d+)$/.exec(t);
  if (m) return Number(m[2]) === 0 ? null : Number(m[1]) / Number(m[2]);
  m = /^-?\d+(\.\d+)?$/.exec(t);
  return m ? Number(t) : null;
};

/** True when moving choices around would change or spoil the item. */
function isOrderBound(opts, { numericOrder = false } = {}) {
  if (opts.some((o) => ORDER_BOUND.test(String(o)))) return true;
  if (!numericOrder) return false;
  const nums = opts.map(asNumber);
  if (nums.every((v) => v !== null) && nums.every((v, i) => i === 0 || v >= nums[i - 1])) return true;
  return false;
}

/**
 * Decide a target key index for each item in served order.
 * items: [{ id, n (choice count), key, fixed }]
 * Returns an array of target indices.
 */
function planLetters(items, { maxRun = 2 } = {}) {
  const N = items.length;
  const choices = Math.max(...items.map((i) => i.n));
  // Quota per letter: as equal as possible. Extra items go to letters chosen by a seeded hash so
  // the remainder does not always land on A.
  const base = Math.floor(N / choices);
  const quota = Array(choices).fill(base);
  const order = [...Array(choices).keys()].sort((a, b) => hash(`${items[0] && items[0].id}|${a}`) - hash(`${items[0] && items[0].id}|${b}`));
  for (let r = 0; r < N - base * choices; r++) quota[order[r]]++;
  for (const it of items) if (it.fixed) quota[it.key]--;
  // A fixed item can overdraw its letter; take the overdraft back from the largest quotas.
  for (let L = 0; L < choices; L++) {
    while (quota[L] < 0) {
      const donor = quota.indexOf(Math.max(...quota));
      quota[donor]--; quota[L]++;
    }
  }
  const out = Array(N);
  for (let attempt = 0; attempt < 50; attempt++) {
    const q = quota.slice();
    let ok = true;
    for (let i = 0; i < N; i++) {
      const it = items[i];
      if (it.fixed) { out[i] = it.key; continue; }
      const runOf = (L) => { let r = 0; for (let j = i - 1; j >= 0 && out[j] === L; j--) r++; return r; };
      const nextFixed = (L) => i + 1 < N && items[i + 1].fixed && items[i + 1].key === L;
      let cands = [...Array(it.n).keys()].filter((L) => q[L] > 0 && runOf(L) < maxRun && !(nextFixed(L) && runOf(L) + 1 >= maxRun));
      if (!cands.length) cands = [...Array(it.n).keys()].filter((L) => q[L] > 0 && runOf(L) < 3);
      if (!cands.length) cands = [...Array(it.n).keys()].filter((L) => runOf(L) < 3);
      if (!cands.length) { ok = false; break; }
      const most = Math.max(...cands.map((L) => q[L]));
      const top = cands.filter((L) => q[L] >= most - (attempt ? 1 : 0));
      top.sort((a, b) => hash(`${it.id}|${attempt}|${a}`) - hash(`${it.id}|${attempt}|${b}`));
      const L = top[0];
      out[i] = L;
      if (q[L] > 0) q[L]--;
    }
    if (ok) return out;
  }
  return items.map((it) => it.key);
}

/** Permutation that moves index `from` to `to`, keeping the others in relative order. */
function permutation(n, from, to) {
  const rest = [...Array(n).keys()].filter((i) => i !== from);
  rest.splice(to, 0, from);
  return rest; // newIndex -> oldIndex
}

// Letter references inside explanations: "(B)", "choice C", "Choices C and D", "B is ...".
// The capital A is also an article, so a bare A only counts when a verb follows it.
const VERB = 'is|are|was|were|would|will|can|could|might|does|do|describes|reverses|gives|names|confuses|ignores|uses|forgets|treats|computes|drops|assumes|applies|adds|multiplies|subtracts|swaps|wrongly|correctly|reflects|comes|routes|reads|counts|picks|puts|states|places|claims|misreads|inverts|doubles|halves|has|lacks|matches|represents|results|misapplies|fails|overlooks|omits|reports|mistakes|takes|tempts|sends|keeps|makes|writes|copies|simply|just|also|requires|require|reverse|pair|pairs|mixes|predicts|labels|calls|says|stops|skips|counts|ranks|misses|sounds|looks|seems|refers|equals|cannot|can\'t|isn\'t|and|or';
const REF = new RegExp(
  String.raw`(\(\s*)([A-E])(\s*\))` + '|' +
  String.raw`(\b(?:[Cc]hoices?|[Oo]ptions?|[Aa]nswers?|[Ll]etters?)\s+\(?)([A-E])\b` + '|' +
  String.raw`(\b(?:and|or|vs\.?|nor)\s+)([A-E])\b(?=[\s,).:;/])` + '|' +
  String.raw`((?:^|[.;:!?]\s+|,\s+|\(\s*))([A-E])(?=(?:\s+(?:` + VERB + String.raw`)\b)|\s*[,)/:])`,
  'g');

function remapLetters(text, newIndexOf) {
  let changed = 0;
  const out = String(text || '').replace(REF, (m, p1, l1, s1, p2, l2, p3, l3, p4, l4) => {
    const pre = p1 ?? p2 ?? p3 ?? p4 ?? '';
    const L = l1 ?? l2 ?? l3 ?? l4;
    const post = s1 ?? '';
    const idx = LETTERS.indexOf(L);
    if (idx < 0 || newIndexOf[idx] === undefined) return m;
    changed++;
    return `${pre}${LETTERS[newIndexOf[idx]]}${post}`;
  });
  return { text: out, changed };
}

/**
 * Apply a placement to one item. getters/setters let the same code serve the mock format
 * ({opts, correct, why, opts_smiles, opts_svg}) and The Climb ({choices, correct, explanation}).
 */
function moveKey(item, target, { optsKey, whyKey, parallel = [] }) {
  const n = item[optsKey].length;
  const from = item.correct;
  if (from === target) return { moved: false, refs: 0 };
  const perm = permutation(n, from, target); // new -> old
  const newIndexOf = [];
  perm.forEach((oldI, newI) => { newIndexOf[oldI] = newI; });
  item[optsKey] = perm.map((o) => item[optsKey][o]);
  for (const k of parallel) {
    if (!Array.isArray(item[k])) continue;
    const arr = item[k].slice();
    while (arr.length < n) arr.push(null);
    item[k] = perm.map((o) => arr[o]);
  }
  item.correct = target;
  let refs = 0;
  if (whyKey && item[whyKey]) {
    const r = remapLetters(item[whyKey], newIndexOf);
    item[whyKey] = r.text;
    refs = r.changed;
  }
  return { moved: true, refs };
}

module.exports = { LETTERS, isOrderBound, planLetters, moveKey, remapLetters, permutation, hash };
