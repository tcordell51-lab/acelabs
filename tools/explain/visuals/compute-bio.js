// compute-bio.js: the facts behind the Bio explainer pictures, as pure
// functions. Imported by the renderers (browser) and by
// scripts/explainers/build.mjs (node), so the build checks exactly what the
// student sees: the Punnett cells and their counts, the testcross classes, the
// genetic code, a carrier ledger, a share of a budget. No DOM.

/* ------------------------------------------------------------ Punnett */
// X-linked cross. Genotypes are written with X and Y and one allele letter
// after each X: "XnXn" x "XNY". Upper case is the dominant (normal) allele,
// lower case the recessive one. Unlike the hub solver (bio-shared.js
// gametesFromGenotype, which drops repeats), both X chromosomes of a parent
// stay in the square, so a 2 x 2 square shows four children.
const xs = (g) => String(g).replace(/\s+/g, '').match(/X[A-Za-z]|Y/g) || [];
const isRec = (x) => x[1] === x[1].toLowerCase();
function xChild(a, b) {
  const xx = [a, b].filter((g) => g !== 'Y');
  if (xx.length === 1) return { geno: xx[0] + 'Y', sex: 'son', status: isRec(xx[0]) ? 'affected' : 'unaffected' };
  xx.sort((p, q) => (isRec(p) === isRec(q) ? 0 : isRec(p) ? 1 : -1));
  const n = xx.filter(isRec).length;
  return { geno: xx.join(''), sex: 'daughter', status: n === 2 ? 'affected' : n === 1 ? 'carrier' : 'unaffected' };
}
// Testcross of a dihybrid with linked genes: p1 carries the two dominant
// alleles on one chromosome (coupling), the tester is homozygous recessive.
// Each recombinant class is half the map distance (capped at the 50 percent
// ceiling); each parental class is half of the rest.
function testcross(c) {
  const [g1, g2] = c.genes, lo = (s) => s.toLowerCase();
  const rf = Math.min(50, c.mapDistance);
  const rows = [
    { gamete: g1 + g2, kind: 'parental', pct: (100 - rf) / 2 },
    { gamete: lo(g1) + lo(g2), kind: 'parental', pct: (100 - rf) / 2 },
    { gamete: g1 + lo(g2), kind: 'recombinant', pct: rf / 2 },
    { gamete: lo(g1) + g2, kind: 'recombinant', pct: rf / 2 }
  ];
  rows.forEach((r) => { r.child = r.gamete[0] + lo(g1) + ' ' + r.gamete[1] + lo(g2); });
  const sum = (k) => rows.filter((r) => r.kind === k).reduce((a, r) => a + r.pct, 0);
  return { mode: 'testcross', tester: lo(g1) + lo(g2), rows, recombinantPct: sum('recombinant'), parentalPct: sum('parental') };
}
export function punnettCross(c) {
  if (c.mode === 'xlinked') {
    const cols = xs(c.p1), rows = xs(c.p2);
    if (!cols.length || !rows.length) throw new Error('x-linked cross needs genotypes like XnXn and XNY');
    const cells = rows.map((b) => cols.map((a) => xChild(a, b)));
    const flat = cells.flat();
    const tally = (sex) => { const k = flat.filter((x) => x.sex === sex); const o = { total: k.length }; k.forEach((x) => { o[x.status] = (o[x.status] || 0) + 1; }); return o; };
    return { mode: 'xlinked', cols, rows, cells, sons: tally('son'), daughters: tally('daughter') };
  }
  if (c.mode === 'testcross') return testcross(c);
  throw new Error('punnett mode ' + c.mode + ' is not ported yet');
}

/* ------------------------------------------------------- genetic code */
// The standard code, mRNA codons, bases in the order U C A G.
const BASES = 'UCAG';
const CODE = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';
export const AA3 = { A: 'Ala', R: 'Arg', N: 'Asn', D: 'Asp', C: 'Cys', Q: 'Gln', E: 'Glu', G: 'Gly', H: 'His', I: 'Ile', L: 'Leu', K: 'Lys', M: 'Met', F: 'Phe', P: 'Pro', S: 'Ser', T: 'Thr', W: 'Trp', Y: 'Tyr', V: 'Val', '*': 'Stop' };
export function translateCodon(codon) {
  const c = String(codon).toUpperCase().replace(/T/g, 'U');
  if (!/^[UCAG]{3}$/.test(c)) throw new Error('not a codon: ' + codon);
  return AA3[CODE[16 * BASES.indexOf(c[0]) + 4 * BASES.indexOf(c[1]) + BASES.indexOf(c[2])]];
}
export function synonymsOf(codon) {
  const aa = translateCodon(codon), out = [];
  for (const a of BASES) for (const b of BASES) for (const d of BASES) if (translateCodon(a + b + d) === aa) out.push(a + b + d);
  return out;
}

/* ------------------------------------------------------------ ledgers */
// rows: [{ n, rate }] -> each product and the total
export function ledger(rows) {
  const items = rows.map((r) => ({ n: r.n, rate: r.rate, value: Math.round(r.n * r.rate * 100) / 100 }));
  return { items, total: Math.round(items.reduce((a, r) => a + r.value, 0) * 100) / 100 };
}
// segments of a budget out of 100: [{ share }] -> the running total and the rest
export function budget(segments, total = 100) {
  const used = segments.reduce((a, s) => a + s.share, 0);
  return { used, rest: total - used };
}
