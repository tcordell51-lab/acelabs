// scripts/explainers/stamps.mjs: the auto-approve stamp (build spec rule 1.9, OS-72).
//
// A stamp in docs/explainers/approvals.json is
//   { stamp: 'auto-approved 2026-10-30, pending Thomas review', by, at,
//     checksum: sha256 of the sidecar file (64 hex),
//     svg: { '390': sha256, '1280': sha256 }   the rendered picture (.vis outerHTML) at each width,
//     files: { path: sha256 }                  the source of every renderer the picture draws with,
//     guard: { keyText, stemHash }, review: where the SA-C verdict lives }
// A later change to any of them voids the stamp: the build drops the item to draft, the
// render gate fails a stamped item whose picture changed, and stamp-gate.mjs (and
// scripts/deploy-clean.sh) refuse a sidecar whose stamp does not match.
// Shared by build.mjs, render-check.mjs, stamp-gate.mjs and stamp.mjs.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const STAMP_TEXT = 'auto-approved 2026-10-30, pending Thomas review';
export const SVG_WIDTHS = ['390', '1280'];
export const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
// a stored checksum may be the full 64 hex or the 16-hex prefix the section index uses
export const sameSum = (want, full) => !!want && typeof want === 'string' && (want === full || (want.length === 16 && full.startsWith(want)));

const VIS = 'tools/explain/visuals';
// classic scripts and build-made copies a picture type reads besides its module
const EXTRA = {
  chem: ['shared/smiles-drawer.min.js', 'tools/explain/vendor/ochem/draw.js', 'tools/explain/vendor/ochem/mechdraw.js'],
  'chem.lewis': ['tools/explain/vendor/gc/lewis-layout.js'],
  'qr.figure': ['shared/qr-figures.js'],
  'bio.real': ['tools/bio/bio-real.js'],
  pat: ['tools/pat/engine/pat-core.js', 'tools/pat/engine/pat-solid.js', 'tools/pat/engine/pat-keyholes.js', 'tools/pat/engine/pat-keyholes-csg.js', 'tools/pat/engine/pat-tfe.js', 'tools/pat/engine/pat-tfe-csg.js', 'tools/pat/engine/pat-angles.js', 'tools/pat/engine/pat-holepunch.js', 'tools/pat/engine/pat-cubes.js', 'tools/pat/engine/pat-patternfold.js', 'tools/pat/engine/pat-patternfold-poly.js']
};

// Which visuals module registers each type, which modules extend it (they import the
// registering module and add kinds, styles or diagrams to it), and the static imports of each.
// index.js and catalog.js are registries every renderer batch appends to: never part of a stamp.
let GRAPH = null;
function graph(root) {
  if (GRAPH && GRAPH.root === root) return GRAPH;
  const dir = path.join(root, VIS);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js') && f !== 'index.js' && f !== 'catalog.js');
  const imports = {}, regs = {};
  for (const f of files) {
    const src = fs.readFileSync(path.join(dir, f), 'utf8');
    imports[f] = [...src.matchAll(/^import[^'"]*['"]([^'"]+)['"]/gm)].map((m) => path.posix.normalize(path.posix.join(VIS, m[1])));
    for (const m of src.matchAll(/register\('([a-z.-]+)'/g)) regs[m[1]] = VIS + '/' + f;
  }
  GRAPH = { root, imports, regs };
  return GRAPH;
}
function closure(g, start, out) {
  if (out.has(start)) return;
  out.add(start);
  const f = start.startsWith(VIS + '/') ? start.slice(VIS.length + 1) : null;
  if (f && g.imports[f]) g.imports[f].forEach((x) => closure(g, x, out));
}

// The renderer sources a sidecar's picture draws with, sorted.
export function rendererFiles(root, sidecar) {
  const g = graph(root);
  const v = sidecar.visual || {};
  const panels = v.type === 'stack' ? v.panels || [] : [v];
  const out = new Set();
  closure(g, VIS + '/core.js', out);
  for (const p of panels) {
    const reg = g.regs[p.type];
    if (!reg) throw new Error('no renderer registers ' + p.type);
    closure(g, reg, out);
    // modules that extend the registering module
    for (const [f, im] of Object.entries(g.imports)) if (im.includes(reg)) closure(g, VIS + '/' + f, out);
    (EXTRA[p.type] || []).forEach((x) => out.add(x));
    (EXTRA[p.type.split('.')[0]] || []).forEach((x) => out.add(x));
  }
  if (v.annotateQuestion) EXTRA['qr.figure'].forEach((x) => out.add(x));
  return [...out].filter((x) => x !== VIS + '/index.js' && x !== VIS + '/catalog.js').sort();
}
export function fileSums(root, rels) {
  const o = {};
  for (const r of rels) o[r] = sha256(fs.readFileSync(path.join(root, r)));
  return o;
}

// Check one stamp against the sidecar text and the repo files (not the SVG: that needs a browser,
// render-check.mjs does it). Returns a list of problems; empty means it matches.
export function stampProblems(root, ap, sidecarText) {
  const out = [];
  if (!ap) return ['no stamp'];
  if (typeof ap.stamp !== 'string' || !ap.stamp) out.push('no stamp text');
  if (!/^[0-9a-f]{64}$/.test(ap.checksum || '')) out.push('checksum is not a full sha256');
  else if (!sameSum(ap.checksum, sha256(sidecarText))) out.push('sidecar changed since the stamp');
  if (!ap.svg || !SVG_WIDTHS.every((w) => /^[0-9a-f]{64}$/.test(ap.svg[w] || ''))) out.push('no rendered-SVG sums at ' + SVG_WIDTHS.join(' and '));
  if (!ap.files || !Object.keys(ap.files).length) out.push('no renderer source sums');
  else for (const [p, h] of Object.entries(ap.files)) {
    const fp = path.join(root, p);
    if (!fs.existsSync(fp)) out.push('renderer source missing: ' + p);
    else if (!sameSum(h, sha256(fs.readFileSync(fp)))) out.push('renderer source changed: ' + p);
  }
  return out;
}
// the renderer set a stamp lists must still be the set the picture draws with
export function stampFileSetProblems(root, ap, sidecar) {
  if (!ap || !ap.files) return [];
  const want = rendererFiles(root, sidecar), have = Object.keys(ap.files).sort();
  const miss = want.filter((x) => !have.includes(x));
  return miss.length ? ['stamp does not cover renderer source ' + miss.join(', ')] : [];
}

// The rendered picture as hashed: the .vis outerHTML with element ids renamed in order of
// appearance (the structure drawer makes a random id prefix on every draw), so the sum
// changes only when what is drawn changes.
export function normalizeVis(html) {
  const ids = [];
  for (const m of html.matchAll(/\sid="([^"]+)"/g)) if (!ids.includes(m[1])) ids.push(m[1]);
  const map = new Map(ids.map((x, i) => [x, 'v' + i]));
  return html.replace(/(\sid="|url\(['"]?#|href="#|aria-labelledby="|aria-describedby="|for=")([^")'\s]+)/g, (all, pre, id) => (map.has(id) ? pre + map.get(id) : all));
}
export const visSum = (html) => sha256(normalizeVis(html));
