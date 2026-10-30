// bio-punnett.js: bio.punnett, a pure render(state) port of the Genetics hub
// Punnett solver (tools/bio/bio-shared.js renderPunnett, gametesFromGenotype,
// combineGametes, phenotypeOf; the live solver is the play-with target).
// The cross is computed by compute-bio.js punnettCross(), the same function
// the build uses to check the picture against the key, so every genotype,
// status word and count on the picture comes from the spec's genotypes.
//
//   cross.mode 'xlinked'    a 2 x 2 square; both X chromosomes of the mother
//                           stay in it, so it shows four children
//   cross.mode 'testcross'  linked genes: the four offspring classes of a
//                           testcross, parental and recombinant, from the map
//                           distance, with the 50 percent ceiling
import { register, C, t, r1, svgOpen, width, badge, wrap } from './core.js';
import { punnettCross } from './compute-bio.js';

const FONT = 'Arial, Helvetica, sans-serif';
const TONE = {
  affected: { fill: '#ece4f7', stroke: '#6a4a97', ink: '#3b2a59' },
  carrier: { fill: C.goldBg, stroke: '#b59a55', ink: '#5a4510' },
  unaffected: { fill: '#f4f7f5', stroke: '#aab8b0', ink: C.ink }
};
// a genotype such as XNXn drawn with superscript alleles; returns a whole <text>
function geno(x, y, g, o = {}) {
  const size = o.size || 16, sup = Math.max(12, Math.round(size * 0.78)), up = Math.round(size * 0.38);
  let inner = '', raised = false;
  (String(g).match(/X[A-Za-z]|Y|[A-Za-z]/g) || []).forEach((tok, i) => {
    const gap = i && o.spaced ? ' ' : '';
    if (tok[0] === 'X' && tok.length === 2) {
      inner += `<tspan dy="${raised ? up : 0}">${gap}X</tspan><tspan dy="${-up}" font-size="${sup}">${tok[1]}</tspan>`;
      raised = true;
    } else { inner += `<tspan dy="${raised ? up : 0}">${gap}${tok}</tspan>`; raised = false; }
  });
  const a = [`x="${r1(x)}"`, `y="${r1(y)}"`, `font-size="${size}"`, `font-weight="${o.weight || 700}"`, `fill="${o.fill || C.ink}"`, `font-family="${FONT}"`];
  if (o.anchor) a.push(`text-anchor="${o.anchor}"`);
  return `<text ${a.join(' ')}>${inner}</text>`;
}

function xlinked(s, W) {
  const c = s.cross, P = punnettCross(c), words = c.statusWords || { affected: 'affected', carrier: 'carrier', unaffected: 'unaffected' };
  const narrow = W < 560, gw = narrow ? 66 : 96, x0 = 8;
  const cw = Math.min(150, (W - 2 * x0 - gw) / P.cols.length), gridW = gw + cw * P.cols.length;
  const gx = (W - gridW) / 2, ch = 64;
  const p1 = punnettCross({ mode: 'xlinked', p1: c.p1, p2: 'Y' }).cells[0][0];        // the mother read as a person
  const p2 = punnettCross({ mode: 'xlinked', p1: c.p2.replace('Y', ''), p2: 'Y' }).cells[0][0];
  let out = '', y = 18;
  out += t(gx + gw + cw * P.cols.length / 2, y, (c.p1Label || 'Parent 1') + ': ' + words[p1.status === 'affected' ? 'affected' : p1.status], { size: 13, weight: 700, anchor: 'middle', fill: C.ink2 });
  y += 8;
  P.cols.forEach((g, i) => { out += geno(gx + gw + cw * i + cw / 2, y + 22, g, { anchor: 'middle', fill: TONE.affected.ink }); });
  out += t(gx + 4, y + 18, c.p2Label || 'Parent 2', { size: 13, weight: 700, fill: C.ink2 });
  out += t(gx + 4, y + 34, words[p2.status] || p2.status, { size: 12, fill: C.mute });
  const top = y + 40;
  P.rows.forEach((g, r) => {
    out += geno(gx + gw / 2, top + r * ch + ch / 2 + 6, g, { anchor: 'middle', fill: C.ink });
    P.cols.forEach((_, k) => {
      const cell = P.cells[r][k], tone = TONE[cell.status], cx = gx + gw + k * cw;
      out += `<rect x="${r1(cx + 3)}" y="${r1(top + r * ch + 3)}" width="${r1(cw - 6)}" height="${ch - 6}" rx="8" fill="${tone.fill}" stroke="${tone.stroke}" stroke-width="1.4"/>`;
      out += geno(cx + cw / 2, top + r * ch + 28, cell.geno, { anchor: 'middle', fill: tone.ink });
      out += t(cx + cw / 2, top + r * ch + 48, words[cell.status] + ' ' + cell.sex, { size: 13, anchor: 'middle', fill: tone.ink });
    });
  });
  y = top + P.rows.length * ch + 12;
  // the answer, counted off the square
  const cw2 = c.countWords || words;
  const line = (sex, tally) => { const st = Object.keys(tally).filter((k) => k !== 'total'); return sex + ': ' + st.map((k) => tally[k] + ' of ' + tally.total + ' ' + cw2[k]).join(', '); };
  const l1 = line(c.sonsLabel || 'Sons', P.sons), l2 = line(c.daughtersLabel || 'Daughters', P.daughters);
  const bw = Math.min(W - 16, 360), bx = (W - bw) / 2;
  out += `<rect x="${r1(bx)}" y="${r1(y)}" width="${r1(bw)}" height="62" rx="9" fill="${C.keyBg}" stroke="${C.key}" stroke-width="2.4"/>`;
  out += t(bx + 12, y + 25, l1, { size: 14, weight: 700, fill: C.key });
  out += t(bx + 12, y + 47, l2, { size: 14, weight: 700, fill: C.key });
  out += badge(bx + bw - 8, y + 20, 'answer', { anchor: 'end', size: 12 });
  return { svg: out, H: y + 72 };
}

function linked(s, W) {
  const c = s.cross, P = punnettCross(c), [g1, g2] = c.genes;
  const narrow = W < 560, x0 = 10;
  let out = '', y = 8;
  // the map: two genes on one chromosome, the distance between them
  const mx1 = x0 + 34, mx2 = W - x0 - 34, my = y + 34;
  out += `<rect x="${r1(x0 + 6)}" y="${r1(my - 7)}" width="${r1(W - 2 * x0 - 12)}" height="14" rx="7" fill="#e9eef7" stroke="#6f7f95" stroke-width="1.4"/>`;
  [[mx1, g1], [mx2, g2]].forEach(([x, g]) => { out += `<rect x="${r1(x - 3)}" y="${r1(my - 9)}" width="6" height="18" fill="${C.blue}"/>` + t(x, my - 14, 'gene ' + g, { size: 13, weight: 700, anchor: 'middle', fill: C.blue }); });
  out += `<path d="M${r1(mx1 + 8)},${r1(my + 18)} H${r1(mx2 - 8)}" stroke="${C.ink2}" stroke-width="1.2" fill="none"/><path d="M${r1(mx1 + 8)},${r1(my + 13)} V${r1(my + 23)} M${r1(mx2 - 8)},${r1(my + 13)} V${r1(my + 23)}" stroke="${C.ink2}" stroke-width="1.2" fill="none"/>`;
  out += t(W / 2, my + 36, c.mapDistance + ' map units apart', { size: 13, weight: 700, anchor: 'middle', fill: C.ink });
  y = my + 46;
  if (s.rule) { wrap(s.rule, W - 2 * x0, 13).forEach((ln) => { y += 17; out += t(W / 2, y, ln, { size: 13, anchor: 'middle', fill: C.ink2 }); }); }
  y += 14;
  // the four classes
  const rowH = 30, chipW = narrow ? 52 : 70, kidX = x0 + chipW + (narrow ? 50 : 70), barX = kidX + (narrow ? 56 : 74), barW = W - x0 - barX - (narrow ? 50 : 64);
  const group = (kind, title, key) => {
    const rows = P.rows.filter((r) => r.kind === kind), pct = rows.reduce((a, r) => a + r.pct, 0);
    const gh = 24 + rows.length * rowH + 6;
    out += `<rect x="${r1(x0 - 2)}" y="${r1(y)}" width="${r1(W - 2 * x0 + 4)}" height="${r1(gh)}" rx="9" fill="${key ? C.keyBg : '#f7f9f8'}" stroke="${key ? C.key : '#c9d3cd'}" stroke-width="${key ? 2.4 : 1.2}"/>`;
    out += t(x0 + 8, y + 18, title + ': ' + pct + '%', { size: 13.5, weight: 700, fill: key ? C.key : C.ink2 });
    if (key) out += badge(W - x0 - 6, y + 17, 'answer', { anchor: 'end', size: 12 });
    let yy = y + 24;
    rows.forEach((r) => {
      out += `<rect x="${r1(x0 + 6)}" y="${r1(yy + 4)}" width="${chipW}" height="22" rx="11" fill="#fff" stroke="${C.blue}" stroke-width="1.3"/>` + t(x0 + 6 + chipW / 2, yy + 20, r.gamete.split('').join(' '), { size: 13, weight: 700, anchor: 'middle', fill: C.blue });
      out += t(x0 + chipW + 12, yy + 20, '+ ' + P.tester.split('').join(' '), { size: 13, fill: C.mute });
      out += t(kidX, yy + 20, r.child, { size: 13, weight: 700, fill: C.ink });
      const bw = Math.max(3, barW * r.pct / 50);
      out += `<rect x="${r1(barX)}" y="${r1(yy + 9)}" width="${r1(bw)}" height="13" rx="3" fill="${key ? C.key : '#8fa39a'}"/>`;
      out += t(barX + bw + 6, yy + 20, r.pct + '%', { size: 13, weight: 700, fill: key ? C.key : C.ink2 });
      yy += rowH;
    });
    y += gh + 8;
  };
  out += t(x0, y + 4, (narrow ? 'Testcross offspring' : 'Testcross offspring, by the gamete from the ' + g1 + g2 + '/' + g1.toLowerCase() + g2.toLowerCase() + ' parent'), { size: 12.5, weight: 700, fill: C.mute });
  y += 12;
  group('parental', s.parentalLabel || 'Parental', false);
  group('recombinant', s.recombinantLabel || 'Recombinant', true);
  // the ceiling: recombinant offspring never pass 50 percent
  if (s.scale) {
    const sx1 = x0 + 14, sx2 = W - x0 - 14, sy = y + 34, X = (v) => sx1 + (sx2 - sx1) * v / 100;
    out += t(x0 + 4, y + 12, s.scale.title, { size: 12.5, weight: 700, fill: C.mute });
    out += `<rect x="${r1(X(50))}" y="${r1(sy - 9)}" width="${r1(X(100) - X(50))}" height="18" fill="#f1ece2"/>`;
    out += `<path d="M${r1(sx1)},${r1(sy)} H${r1(sx2)}" stroke="${C.ink2}" stroke-width="1.4" fill="none"/>`;
    [0, 25, 50, 75, 100].forEach((v) => { out += `<path d="M${r1(X(v))},${r1(sy - 5)} V${r1(sy + 5)}" stroke="${C.ink2}" stroke-width="1.2"/>` + t(X(v), sy + 20, String(v), { size: 12, anchor: 'middle', fill: C.mute }); });
    out += `<path d="M${r1(X(50))},${r1(sy - 13)} V${r1(sy + 9)}" stroke="${C.trap}" stroke-width="2.4"/>`;
    out += `<circle cx="${r1(X(P.recombinantPct))}" cy="${r1(sy)}" r="6" fill="${C.key}" stroke="#fff" stroke-width="1.5"/>`;
    y = sy + 24;
    (s.scale.notes || []).forEach((n) => { wrap(n, W - 2 * x0 - 8, 12.5).forEach((ln) => { y += 16; out += t(x0 + 4, y, ln, { size: 12.5, fill: C.ink2 }); }); });
  }
  return { svg: out, H: y + 10 };
}

register('bio.punnett', (s, box) => {
  const W = width(box);
  const d = s.cross.mode === 'testcross' ? linked(s, W) : xlinked(s, W);
  box.innerHTML = svgOpen(W, d.H) + d.svg + '</svg>';
});
export { geno };
