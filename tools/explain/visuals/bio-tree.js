// bio-tree.js: bio.tree, a branching tree drawn as an indented bracket, one
// row per group, so it stays legible at phone width (about 314 px of picture).
// Used for cladograms (fungal phyla, each branch carrying the trait that
// arose on it) and for fate maps (germ layers to the tissues they build).
// New: the Diversity hub's initTree and initCladogramBuilder
// (tools/bio/bio-shared.js) are DOM-bound, so this is a pure render(spec).
//
// spec: { type: 'bio.tree', root: node, title? }
// node: { label, sub?, trait?, key?, tag?, choice?, muted?, children? }
//   label   the group (bold)
//   sub     one short line: what defines it or what it builds
//   trait   a feature that arose on the branch into this group: a gold bar
//           across that branch, and the words in gold on the row
//   key     the row the answer sits on: outlined, in green, with a word badge;
//           the branches from the root down to it are drawn in green too
//   tag     a word badge on the row (a key row shows "answer" unless tagged)
//   choice  the served choice text this row stands for (the build checks it)
//   muted   a group drawn in gray (named for context, not asked about)
import { register, C, t, r1, svgOpen, width, badge, wrap, textW } from './core.js';

const LABEL = 13.5, SUB = 12.5, TRAIT = 12.5;
const LH = 17, SH = 15.5, TH = 15.5;
const GREY = '#9aa7a0';

function rows(root) {
  const out = [];
  (function walk(n, depth, parent) {
    const r = { n, depth, parent, kids: [] };
    out.push(r);
    if (parent) parent.kids.push(r);
    (n.children || []).forEach((c) => walk(c, depth + 1, r));
  })(root, 0, null);
  // every ancestor of a key row is on the key path
  out.forEach((r) => { if (r.n.key) for (let p = r; p; p = p.parent) p.onPath = true; });
  return out;
}

register('bio.tree', (s, box) => {
  const W = width(box), pad = 6, indent = W < 420 ? 22 : 28;
  const R = rows(s.root);
  let y = 6, out = '';
  if (s.title) { out += t(pad, y + 14, s.title, { size: 13, weight: 700, fill: C.ink2 }); y += 24; }
  R.forEach((r) => {
    const n = r.n;
    r.x = pad + r.depth * indent;
    const right = W - pad - 4;
    r.tagText = n.tag || (n.key ? 'answer' : null);
    r.tagW = r.tagText ? textW(r.tagText, 12) + 22 : 0;
    r.traitLines = n.trait ? wrap(n.trait, right - r.x - 6, TRAIT) : [];
    r.labelLines = wrap(n.label, right - r.x - 8 - r.tagW, LABEL * 1.07);
    r.subLines = n.sub ? wrap(n.sub, right - r.x - 6, SUB) : [];
    r.top = y;
    r.h = 8 + r.traitLines.length * TH + r.labelLines.length * LH + r.subLines.length * SH + 5;
    r.labelY = y + 4 + r.traitLines.length * TH + 13;   // baseline of the first label line
    r.joinY = r.labelY - 4.5;                          // where the branch meets the row
    y += r.h + 5;
  });
  const H = y + 2;
  // key rows: an outlined backing behind the whole row
  R.forEach((r) => {
    if (!r.n.key) return;
    out += `<rect x="${r1(r.x - 7)}" y="${r1(r.top)}" width="${r1(W - pad - r.x + 6)}" height="${r1(r.h)}" rx="7" fill="${C.keyBg}" stroke="${C.key}" stroke-width="2"/>`;
  });
  // branches: a trunk under each parent, an elbow into each child
  R.forEach((p) => {
    if (!p.kids.length) return;
    const trunkX = p.x + 6, y0 = p.top + p.h - 3;
    const last = p.kids[p.kids.length - 1];
    out += `<line x1="${r1(trunkX)}" y1="${r1(y0)}" x2="${r1(trunkX)}" y2="${r1(last.joinY)}" stroke="${GREY}" stroke-width="1.6"/>`;
    const keyKid = p.onPath && p.kids.find((k) => k.onPath);
    if (keyKid) out += `<line x1="${r1(trunkX)}" y1="${r1(y0)}" x2="${r1(trunkX)}" y2="${r1(keyKid.joinY)}" stroke="${C.key}" stroke-width="3"/>`;
    p.kids.forEach((k) => {
      const on = p.onPath && k.onPath;
      out += `<line x1="${r1(trunkX)}" y1="${r1(k.joinY)}" x2="${r1(k.x - 4)}" y2="${r1(k.joinY)}" stroke="${on ? C.key : GREY}" stroke-width="${on ? 3 : 1.6}"/>`;
      // a trait arose on this branch: a gold bar across the elbow
      if (k.n.trait) out += `<rect x="${r1((trunkX + k.x - 4) / 2 - 2.5)}" y="${r1(k.joinY - 8)}" width="5" height="16" rx="1.5" fill="${C.gold}"/>`;
    });
  });
  // the rows: trait words, label, badge, sub line
  R.forEach((r) => {
    const n = r.n, ink = n.muted ? C.mute : n.key ? C.key : C.ink;
    r.traitLines.forEach((ln, i) => { out += t(r.x, r.top + 16 + i * TH, ln, { size: TRAIT, fill: C.gold, italic: true, weight: 700 }); });
    r.labelLines.forEach((ln, i) => { out += t(r.x, r.labelY + i * LH, ln, { size: LABEL, weight: 700, fill: ink }); });
    if (r.tagText) out += badge(W - pad - 6, r.labelY, r.tagText, n.key ? { anchor: 'end' } : { anchor: 'end', fill: '#fff', stroke: '#b9b2a2', ink: C.mute });
    const sy = r.labelY + (r.labelLines.length - 1) * LH + SH + 1;
    r.subLines.forEach((ln, i) => { out += t(r.x, sy + i * SH, ln, { size: SUB, fill: n.muted ? C.mute : C.ink2 }); });
  });
  box.innerHTML = svgOpen(W, H) + out + '</svg>';
});
