// ace.js - Thomas's own items, the ones he wrote himself.
//
// window.ACE_BANK is built from AceTheDAT-content-library/ochem-bank/*.bank by
// dat-game-forge/tools/build-bank.mjs. Every structure in it parsed through
// RDKit at build time, no two choices in an item are the same molecule, and no
// answer is the starting material handed back unchanged.
//
// Unlike the verified bank, these items name their own rung and their own
// roots, so a miss routes to the exact root the question stands on without
// going through a group table.

/** Thomas's items for a rung id (a tree module or a root). */
export function aceItems(where){
  const db = (typeof window !== 'undefined' && window.ACE_BANK) || [];
  return db.filter(it => it.module === where);
}

/** Thomas's items that stand on a given root, whatever rung they live on. */
export function aceOnRoot(rootId){
  const db = (typeof window !== 'undefined' && window.ACE_BANK) || [];
  return db.filter(it => (it.roots || []).includes(rootId));
}

/** One of his items in the shape every module and the Summit already read. */
export function aceToItem(it){
  const structural = !!it.opts_are_structures;
  return {
    stem: it.q, sub: it.q_smiles || null, reagent: null, prod: null,
    choices: it.opts.map(o => structural ? { text: '', smiles: o } : { text: o, smiles: null }),
    correct: it.correct, coach: it.why, trap: it.trap || null,
    home: it.module, roots: it.roots || [], group: it.group || null,
    difficulty: it.difficulty || 2, level: it.level, source: 'ace'
  };
}

/** How many of his items exist for a rung, without the draw weighting below. */
export function aceCount(where){ return aceItems(where).length; }

// A rung usually has a hundred verified items and a handful of his. Drawn
// straight, his would almost never come up, so the pool a module draws from
// carries each of his several times over. Repeats in a draw pool are just
// weight: they change how often one comes up, never what it says.
export function weighted(mine, rest, share = 1 / 3){
  if (!mine.length) return rest;
  if (!rest.length) return mine;
  const want = Math.round(rest.length * share / (1 - share));
  const k = Math.max(1, Math.min(40, Math.round(want / mine.length)));
  const pool = [];
  for (let i = 0; i < k; i++) pool.push(...mine);
  return pool.concat(rest);
}
