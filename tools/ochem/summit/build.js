// build.js - assemble a thirty-question organic section.
//
// Pure: no DOM. Runs in node for the test and in the page. The blueprint
// follows the ADA 2026 organic specification by weight: mechanisms, chemical
// synthesis, acid-base, chemical and physical properties (spectroscopy and
// lab), structural evaluation. Items come from two sources, generated items
// from the tree modules (makeItem) and verified bank items, mixed so no two
// consecutive items share a source or a home.

export const BLUEPRINT = [
  { area: 'Mechanisms', n: 7, homes: ['t5-proton', 't5-sn-e', 't5-addition', 't5-acyl', 't5-eas', 't5-combined', 't5-coordinate'], groups: [] },
  { area: 'Chemical synthesis', n: 9, homes: ['t4-alkene', 't4-alkyne', 't4-subelim', 't4-alcohol', 't4-carbonyl', 't4-acid-deriv', 't4-alpha', 't4-aromatic', 't4-radical-pericyclic', 't6-two-step', 't6-retro', 't6-selectivity'], groups: [] },
  { area: 'Acid-base chemistry', n: 4, homes: ['t5-proton'], groups: ['acid-base-pka'] },
  { area: 'Chemical and physical properties', n: 5, homes: ['t7-ir', 't7-hnmr', 't7-cnmr', 't7-multi', 't7-properties', 't7-lab'], groups: [] },
  { area: 'Structural evaluation', n: 5, homes: [], groups: ['nomenclature', 'stereo-rs-ez', 'stereo-relationships', 'hybridization-geometry', 'resonance-stability', 'functional-group-id'] }
];

export function mulberry(seed){ let a = seed | 0; return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/** Identity of an item: same stem, same drawing, same reagent, same choices = the same question. */
export function itemKey(it){ return [it.stem || '', it.sub || '', it.reagent || '', it.prod || '', (it.choices || []).map(c => c.smiles || c.text).join(',')].join('|'); }
function valid(it){
  if (!it || !it.stem || !Array.isArray(it.choices) || it.choices.length < 4 || it.choices.length > 5) return false;
  if (!(it.correct >= 0 && it.correct < it.choices.length)) return false;
  const keys = it.choices.map(c => (c.smiles || '') + '|' + (c.text || ''));
  if (new Set(keys).size !== keys.length) return false;
  return !!it.coach;
}

/**
 * buildSection({ seed, makers, bank, api })
 *  makers: { moduleId: makeItem(api) }  (only the modules that exist)
 *  bank:   array of bank items already mapped through bankToItem (with .group and .home)
 *  api:    the api object handed to makeItem (rng is replaced by a seeded one here)
 * Returns { seed, items: [30 items with .area, .n], areas: counts }.
 */
export function buildSection({ seed = 1, makers = {}, bank = [], api = {} }){
  const rng = mulberry(seed);
  const a = Object.assign({}, api, { rng, seed(){}, pick: arr => arr[Math.floor(rng() * arr.length)], shuffle: arr => { const b = arr.slice(); for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; } });
  const seen = new Set(), out = [];
  const usedHome = {}, usedSub = {}, usedStem = {};
  // A section should not feel like one molecule asked five ways: cap how often
  // the same drawing or the same question wording comes back.
  function tooSimilar(it){
    const sub = it.sub || '', stem = (it.stem || '').slice(0, 60);
    if (sub && (usedSub[sub] || 0) >= 2) return true;
    if ((usedStem[stem] || 0) >= 2) return true;
    return false;
  }
  function note(it){ if (it.sub) usedSub[it.sub] = (usedSub[it.sub] || 0) + 1; usedStem[(it.stem || '').slice(0, 60)] = (usedStem[(it.stem || '').slice(0, 60)] || 0) + 1; }
  function fromBank(groups, homes){
    const pool = bank.filter(it => (groups.includes(it.group) || homes.includes(it.home)) && !seen.has(itemKey(it)));
    if (!pool.length) return null;
    // prefer homes used least so far
    pool.sort((x, y) => (usedHome[x.home] || 0) - (usedHome[y.home] || 0) || rng() - 0.5);
    const fresh = pool.filter(x => !tooSimilar(x));
    const use = fresh.length ? fresh : pool;
    const it = use[Math.floor(rng() * Math.min(use.length, 8))];
    return Object.assign({ source: 'bank' }, it);
  }
  function fromModule(homes){
    const have = homes.filter(h => typeof makers[h] === 'function');
    if (!have.length) return null;
    have.sort((x, y) => (usedHome[x] || 0) - (usedHome[y] || 0) || rng() - 0.5);
    for (let tries = 0; tries < 12; tries++){
      const h = have[Math.min(have.length - 1, Math.floor(rng() * Math.min(have.length, 3)))];
      let it = null; try { it = makers[h](a); } catch (e){ it = null; }
      if (it && valid(it) && !seen.has(itemKey(it)) && (tries < 8 ? !tooSimilar(it) : true)) return Object.assign({ source: it.source || 'generated', home: it.home || h }, it);
    }
    return null;
  }
  for (const b of BLUEPRINT){
    for (let k = 0; k < b.n; k++){
      const wantBank = (k % 2 === 1) || !b.homes.length;
      let it = wantBank ? (fromBank(b.groups, b.homes) || fromModule(b.homes)) : (fromModule(b.homes) || fromBank(b.groups, b.homes));
      if (!it) continue;
      seen.add(itemKey(it)); usedHome[it.home] = (usedHome[it.home] || 0) + 1; note(it);
      out.push(Object.assign({ area: b.area }, it));
    }
  }
  // interleave areas so the section reads like a test, then number
  const items = a.shuffle(out).map((it, i) => Object.assign({ n: i + 1 }, it));
  const areas = {}; for (const it of items) areas[it.area] = (areas[it.area] || 0) + 1;
  return { seed, items, areas };
}

/** Which roots a miss stands on: the item's own roots, else its home module's usual roots. */
export function rootsOf(it, fallback = {}){
  if (it.roots && it.roots.length) return it.roots;
  return fallback[it.home] || [];
}
