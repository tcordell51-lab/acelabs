// bio-schematics.js: bio.diagram drawings for genetics, metabolism and body
// systems, added to the DIAGRAMS map that bio.js exports.
//
//   codon            one base changed: the codon before and after, the amino
//                    acid each spells (computed from the genetic code), every
//                    synonym, and the outcome names sorted by what the protein does
//   step-ladder      a pathway as a ladder of molecules and steps, each step
//                    tagged with what it spends or makes (glycolysis, fermentation)
//   compare-table    two processes side by side, row by row
//   acid-base        the carbonic acid equilibrium and the four acid-base
//                    disturbances sorted by cause and direction
//   gland-density    sites ranked by sweat gland density, gland type noted
//   gastric-gland    a gastric gland with its secreting cells numbered
//   nephron-budget   a nephron with its sodium-reclaiming segments numbered,
//                    and the filtered sodium as a budget strip out of 100
//   glomerulus       the glomerulus in Bowman's capsule with the three forces
//   etc-chain        complexes I to IV and ATP synthase in the inner membrane:
//                    a carrier ledger (yield) or a plugged synthase (blocked)
//   ap-trace         membrane potential traces: one spike against a blocked
//                    channel, or spike trains for a weak and a strong stimulus
//   collecting-duct  the collecting duct with and without ADH (aquaporins)
//
// Every word on a drawing comes from the spec or is computed from it (codon
// translations, ledger products, budget shares, spike counts). Drawn at the
// width shown (about 314 px on a 390 px phone), text at 12 px or larger; the
// key's place is outlined and labeled in words, never color alone.
import { C, t, r1, wrap, textW, uid, badge } from './core.js';
import { DIAGRAMS } from './bio.js';
import { translateCodon, synonymsOf, ledger, budget } from './compute-bio.js';

const BOLDW = 1.08;
const halo = (svgText, color = '#fff') => svgText.replace('<text ', `<text paint-order="stroke" stroke="${color}" stroke-width="4" stroke-linejoin="round" `);
const ROLE = {
  key: { fill: C.keyBg, stroke: C.key, ink: C.key, w: 2.4 },
  earn: { fill: C.blueBg, stroke: C.blue, ink: C.blue, w: 1.4 },
  none: { fill: '#f1f4f2', stroke: '#b9c4be', ink: C.mute, w: 1.2 },
  trap: { fill: C.trapBg, stroke: C.trap, ink: '#6b3000', w: 1.4 },
  plain: { fill: '#f7f9f8', stroke: '#c9d3cd', ink: C.ink, w: 1.2 }
};
function marker(id, color, size = 9) {
  return `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="${size}" markerHeight="${size}" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${color}"/></marker>`;
}
// wrapped lines; y is the first baseline
function para(x, y, s, maxW, o = {}) {
  const size = o.size || 13, lh = o.lh || Math.round(size * 1.28), ls = wrap(s, maxW, size * (o.weight ? BOLDW : 1));
  return { svg: ls.map((ln, i) => (o.halo ? halo(t(x, y + i * lh, ln, o)) : t(x, y + i * lh, ln, o))).join(''), h: ls.length * lh, n: ls.length };
}
// a rounded tag; y is the baseline of its text
function pill(x, y, label, role = 'plain', o = {}) {
  const size = o.size || 12.5, R = ROLE[role] || ROLE.plain, w = textW(label, size * BOLDW) + 14;
  const x0 = o.anchor === 'end' ? x - w : x;
  return { w, svg: `<rect x="${r1(x0)}" y="${r1(y - size - 2)}" width="${r1(w)}" height="${r1(size + 8)}" rx="${r1((size + 8) / 2)}" fill="${R.fill}" stroke="${R.stroke}" stroke-width="${R.w}"/>` + t(x0 + w / 2, y + 0.5, label, { size, weight: 700, anchor: 'middle', fill: R.ink }) };
}
// text width with capitals and digits wider than lower case (Arial)
function measure(str, size, bold) {
  let w = 0;
  for (const ch of String(str)) w += /[A-Z0-9]/.test(ch) ? 0.68 : /[a-z]/.test(ch) ? 0.53 : ch === ' ' ? 0.28 : 0.34;
  return w * size * (bold ? BOLDW : 1);
}
const numDot = (x, y, n, key) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="11" fill="${key ? C.key : '#fff'}" stroke="${key ? C.key : C.ink2}" stroke-width="1.6"/>` + t(x, y + 4.5, String(n), { size: 13, weight: 700, anchor: 'middle', fill: key ? '#fff' : C.ink });
const legendOf = (items) => items.filter((m) => m.n != null).map((m) => ({ n: m.n, label: m.label, key: !!m.key }));

/* ================================================================= codon */
DIAGRAMS.codon = (s, W) => {
  const x0 = 10, cd = s.codon, aaA = translateCodon(cd.from), aaB = translateCodon(cd.to), Mk = uid('cd');
  let out = `<defs>${marker(Mk, C.ink2)}</defs>`, y = 4;
  if (s.title) { y += 16; out += t(x0, y, s.title, { size: 13, weight: 700, fill: C.mute }); }
  y += 10;
  const cw = Math.min(170, (W - 2 * x0 - 30) / 2), gap = W - 2 * x0 - 2 * cw;
  const card = (cx, label, codon, aa, other) => {
    let g = `<rect x="${r1(cx)}" y="${r1(y)}" width="${r1(cw)}" height="96" rx="10" fill="#f7f9f8" stroke="#c9d3cd" stroke-width="1.2"/>`;
    g += t(cx + cw / 2, y + 18, label, { size: 12.5, weight: 700, anchor: 'middle', fill: C.mute });
    const bw = 28, bx = cx + (cw - 3 * bw) / 2;
    codon.split('').forEach((b, i) => {
      const ch = b !== other[i];
      g += `<rect x="${r1(bx + i * bw + 1)}" y="${r1(y + 26)}" width="${bw - 2}" height="30" rx="5" fill="${ch ? C.blueBg : '#fff'}" stroke="${ch ? C.blue : '#b9c4be'}" stroke-width="${ch ? 2.4 : 1.2}"/>`;
      g += t(bx + i * bw + bw / 2, y + 48, b, { size: 19, weight: 700, anchor: 'middle', fill: ch ? C.blue : C.ink });
    });
    g += t(cx + cw / 2, y + 80, (s.spellsWord || 'codes for') + ' ' + aa, { size: 14, weight: 700, anchor: 'middle', fill: C.key });
    return g;
  };
  out += card(x0, s.beforeLabel || 'Before', cd.from, aaA, cd.to);
  out += card(x0 + cw + gap, s.afterLabel || 'After', cd.to, aaB, cd.from);
  const ay = y + 41;
  out += `<path d="M${r1(x0 + cw + 5)},${r1(ay)} H${r1(x0 + cw + gap - 6)}" stroke="${C.ink2}" stroke-width="2" fill="none" marker-end="url(#${Mk})"/>`;
  y += 96 + 22;
  // every synonym of the amino acid
  const syn = synonymsOf(cd.from);
  out += t(x0, y, (s.synonymLead || 'Every codon for') + ' ' + aaA + ':', { size: 13, weight: 700, fill: C.ink2 });
  y += 10;
  let sx = x0;
  const chipW = 50;
  syn.forEach((c) => {
    if (sx + chipW > W - x0) { sx = x0; y += 30; }
    const on = c === cd.from || c === cd.to;
    out += `<rect x="${r1(sx)}" y="${r1(y)}" width="${chipW - 6}" height="24" rx="6" fill="${on ? C.keyBg : '#fff'}" stroke="${on ? C.key : '#b9c4be'}" stroke-width="${on ? 2 : 1.2}"/>` + t(sx + (chipW - 6) / 2, y + 17, c, { size: 13, weight: 700, anchor: 'middle', fill: on ? C.key : C.ink2 });
    sx += chipW;
  });
  y += 24 + 26;
  // name it by the protein
  out += t(x0, y, s.outcomeLead || 'Name it by what the protein does:', { size: 13, weight: 700, fill: C.ink2 });
  y += 8;
  s.outcomes.forEach((o) => {
    const R = o.key ? ROLE.key : ROLE.plain, rh = 30;
    out += `<rect x="${r1(x0)}" y="${r1(y)}" width="${r1(W - 2 * x0)}" height="${rh}" rx="7" fill="${R.fill}" stroke="${R.stroke}" stroke-width="${R.w}"/>`;
    out += t(x0 + 10, y + 20, o.when, { size: 13, fill: o.key ? C.key : C.ink, weight: o.key ? 700 : 400 });
    out += t(W - x0 - 10 - (o.key ? textW('answer', 12 * BOLDW) + 22 : 0), y + 20, o.name, { size: 13.5, weight: 700, anchor: 'end', fill: o.key ? C.key : C.ink });
    if (o.key) out += badge(W - x0 - 6, y + 20, 'answer', { anchor: 'end', size: 12 });
    y += rh + 4;
  });
  if (s.aside) { const p = para(x0 + 2, y + 16, s.aside, W - 2 * x0 - 4, { size: 12.5, fill: C.ink2, italic: true }); out += p.svg; y += 6 + p.h; }
  return { svg: out, H: y + 8, W };
};

/* =========================================================== step-ladder */
DIAGRAMS['step-ladder'] = (s, W) => {
  const x0 = 10, ax = x0 + 14, lx = ax + 16, maxL = W - lx - 8;
  const M = uid('sl');
  let out = `<defs>${marker(M, C.ink2)}${marker(M + 'k', C.key)}</defs>`, y = 2;
  s.nodes.forEach((n, i) => {
    if (n.phase) { y += 18; out += t(x0, y, n.phase, { size: 12.5, weight: 700, fill: C.mute }); y += 6; }
    // the molecule
    const R = n.role === 'key' ? ROLE.key : null;
    const lab = n.label;
    const lw = textW(lab, 14 * BOLDW) + 16, tw = n.tag ? textW(n.tag, 12) + 14 : 0;
    const nh = R ? 26 : 20;
    if (R) out += `<rect x="${r1(x0)}" y="${r1(y + 2)}" width="${r1(Math.min(W - 2 * x0, lw + (tw ? tw + 10 : 0)))}" height="${nh}" rx="7" fill="${R.fill}" stroke="${R.stroke}" stroke-width="${R.w}"/>`;
    out += t(x0 + 8, y + (R ? 20 : 16), lab, { size: 14, weight: 700, fill: R ? C.key : C.ink });
    if (n.tag) out += badge(x0 + lw, y + 20, n.tag, R ? { size: 12 } : { size: 12, fill: '#fff', stroke: '#b9b2a2', ink: C.mute });
    let nodeH = nh + 4;
    if (n.note) { const p = para(x0 + 8, y + nh + 16, n.note, W - 2 * x0 - 16, { size: 12.5, fill: R ? C.key : C.ink2, italic: true }); out += p.svg; nodeH += p.h + 2; }
    if (n.branch) {
      const bx = Math.max(x0 + lw + 14, W * 0.5), bw = W - bx - 6;
      const p = para(bx + 8, y + 18, n.branch, bw - 14, { size: 12.5, fill: C.ink2 });
      out += `<rect x="${r1(bx)}" y="${r1(y + 2)}" width="${r1(bw)}" height="${r1(p.h + 12)}" rx="7" fill="#fff" stroke="#9aa8a1" stroke-width="1.2" stroke-dasharray="4 3"/>` + p.svg;
      out += `<path d="M${r1(x0 + lw + 2)},${r1(y + 15)} H${r1(bx - 2)}" stroke="#9aa8a1" stroke-width="1.4" stroke-dasharray="4 3" fill="none"/>`;
      nodeH = Math.max(nodeH, p.h + 16);
    }
    y += nodeH;
    const st = s.steps[i];
    if (!st) return;
    // the step: arrow on the left, enzyme and tag on the right
    const ls = wrap(st.label, maxL, 13);
    const tagW = measure(st.tag, 12.5, true) + 14;
    const lastW = measure(ls[ls.length - 1], 13, st.role === 'key');
    const inline = lastW + 12 + tagW <= maxL;
    const sh = 8 + ls.length * 16 + (inline ? 0 : 22) + 6;
    const key = st.role === 'key';
    out += `<path d="M${ax},${r1(y + 1)} V${r1(y + sh - 2)}" stroke="${key ? C.key : C.ink2}" stroke-width="${key ? 2.6 : 1.8}" fill="none" marker-end="url(#${key ? M + 'k' : M})"/>`;
    ls.forEach((ln, k) => { out += t(lx, y + 18 + k * 16, ln, { size: 13, fill: C.ink, weight: key ? 700 : 400 }); });
    const ty = inline ? y + 18 + (ls.length - 1) * 16 : y + 18 + ls.length * 16 + 4;
    out += pill(inline ? lx + lastW + 12 : lx, ty, st.tag, st.role || 'none', { size: 12.5 }).svg;
    y += sh;
  });
  return { svg: out, H: y + 8, W };
};

/* ========================================================= compare-table */
DIAGRAMS['compare-table'] = (s, W) => {
  const x0 = 8, gap = 8, cw = (W - 2 * x0 - gap) / 2, kc = s.keyCol == null ? null : s.keyCol;
  let out = '', y = 4;
  s.columns.forEach((c, i) => {
    const cx = x0 + i * (cw + gap), p = para(cx + cw / 2, y + 18, c, cw - 10, { size: 13.5, weight: 700, anchor: 'middle', fill: C.green });
    out += `<rect x="${r1(cx)}" y="${r1(y)}" width="${r1(cw)}" height="${r1(p.h + 12)}" rx="8" fill="${C.goldBg}" stroke="#b59a55" stroke-width="1.2"/>` + p.svg;
  });
  y += 12 + Math.max(...s.columns.map((c) => wrap(c, cw - 10, 13.5 * BOLDW).length)) * 17 + 8;
  s.rows.forEach((row) => {
    const cells = row.cells.map((c) => wrap(c, cw - 16, 13));
    const ch = Math.max(...cells.map((l) => l.length)) * 16 + 12;
    const rh = 22 + ch + 8;
    if (row.key) out += `<rect x="${r1(x0 - 3)}" y="${r1(y - 2)}" width="${r1(W - 2 * x0 + 6)}" height="${r1(rh + 2)}" rx="9" fill="none" stroke="${C.key}" stroke-width="2.2"/>`;
    out += t(x0 + 4, y + 15, row.label, { size: 13, weight: 700, fill: row.key ? C.key : C.ink2 });
    if (row.key) out += badge(W - x0 - 2, y + 15, 'answer', { anchor: 'end', size: 12 });
    cells.forEach((ls, i) => {
      const cx = x0 + i * (cw + gap), on = row.key && i === kc;
      out += `<rect x="${r1(cx)}" y="${r1(y + 22)}" width="${r1(cw)}" height="${r1(ch)}" rx="7" fill="${on ? C.keyBg : '#f7f9f8'}" stroke="${on ? C.key : '#d3dbd6'}" stroke-width="${on ? 1.8 : 1}"/>`;
      ls.forEach((ln, k) => { out += t(cx + 8, y + 22 + 18 + k * 16, ln, { size: 13, fill: on ? C.key : C.ink, weight: on ? 700 : 400 }); });
    });
    y += rh + 6;
  });
  if (s.footnote) { const p = para(x0 + 2, y + 12, s.footnote, W - 2 * x0 - 4, { size: 12.5, fill: C.ink2, italic: true }); out += p.svg; y += p.h + 4; }
  return { svg: out, H: y + 6, W };
};

/* ============================================================== acid-base */
DIAGRAMS['acid-base'] = (s, W) => {
  const x0 = 8, M = uid('ab');
  let out = `<defs>${marker(M, C.blue)}${marker(M + 'g', C.ink2)}</defs>`, y = 4;
  // what drives it
  const d = para(W / 2, y + 16, s.driver, W - 40, { size: 13, weight: 700, anchor: 'middle', fill: C.blue });
  out += d.svg; y += d.h + 18;
  // the equation, three boxes and two double arrows
  const eq = s.equation, bw = eq.map((e) => textW(e, 14 * BOLDW) + 16), aw = 34;
  const total = bw.reduce((a, b) => a + b, 0) + aw * (eq.length - 1);
  let ex = (W - total) / 2;
  const ey = y + 8, boxes = [];
  eq.forEach((e, i) => {
    out += `<rect x="${r1(ex)}" y="${r1(ey)}" width="${r1(bw[i])}" height="32" rx="7" fill="#fff" stroke="#9aa8a1" stroke-width="1.3"/>` + t(ex + bw[i] / 2, ey + 21, e, { size: 14, weight: 700, anchor: 'middle', fill: C.ink });
    boxes.push({ x: ex, w: bw[i] });
    ex += bw[i];
    if (i < eq.length - 1) { out += `<path d="M${r1(ex + 5)},${r1(ey + 12)} H${r1(ex + aw - 5)}" stroke="${C.ink2}" stroke-width="1.6" fill="none" marker-end="url(#${M}g)"/><path d="M${r1(ex + aw - 5)},${r1(ey + 21)} H${r1(ex + 5)}" stroke="${C.ink2}" stroke-width="1.6" fill="none" marker-end="url(#${M}g)"/>`; ex += aw; }
  });
  // CO2 leaves through the lungs: an arrow from the first box up to the driver line
  out += `<path d="M${r1(boxes[0].x + boxes[0].w / 2)},${r1(ey - 2)} V${r1(y - 6)}" stroke="${C.blue}" stroke-width="2.4" fill="none" marker-end="url(#${M})"/>`;
  y = ey + 32 + 12;
  // the shift: a long arrow under the equation pointing the way it runs
  const sx1 = boxes[0].x + 6, sx2 = boxes[boxes.length - 1].x + boxes[boxes.length - 1].w - 6;
  const left = s.shift === 'left';
  out += `<path d="M${r1(left ? sx2 : sx1)},${r1(y + 6)} H${r1(left ? sx1 : sx2)}" stroke="${C.blue}" stroke-width="3" fill="none" marker-end="url(#${M})"/>`;
  out += halo(t(W / 2, y + 26, s.shiftLabel, { size: 13, weight: 700, anchor: 'middle', fill: C.blue }));
  y += 32;
  const r = para(W / 2, y + 16, s.result, W - 40, { size: 13.5, weight: 700, anchor: 'middle', fill: C.key });
  out += r.svg; y += r.h + 16;
  // the sorter: columns are the pH direction, rows are the cause
  const g = s.grid, gap = 8, cw = (W - 2 * x0 - gap) / 2;
  g.cols.forEach((c, i) => { out += t(x0 + i * (cw + gap) + cw / 2, y + 12, c, { size: 13, weight: 700, anchor: 'middle', fill: C.ink2 }); });
  y += 20;
  g.rows.forEach((rw, ri) => {
    out += t(x0 + 2, y + 14, rw, { size: 13, weight: 700, fill: C.green });
    y += 20;
    const cells = g.cells.filter((c) => c.r === ri).sort((a, b) => a.c - b.c);
    const metrics = cells.map((c) => ({ name: wrap(g.rows[c.r] + ' ' + g.cols[c.c].toLowerCase(), cw - 16, 13 * BOLDW), cause: wrap(c.cause, cw - 16, 12.5) }));
    const ch = Math.max(...metrics.map((m) => m.name.length * 16 + m.cause.length * 15)) + 18 + (cells.some((c) => c.key) ? 22 : 0);
    cells.forEach((c, k) => {
      const cx = x0 + c.c * (cw + gap), R = c.key ? ROLE.key : ROLE.plain, m = metrics[k];
      out += `<rect x="${r1(cx)}" y="${r1(y)}" width="${r1(cw)}" height="${r1(ch)}" rx="8" fill="${R.fill}" stroke="${R.stroke}" stroke-width="${R.w}"/>`;
      let yy = y + 18;
      m.name.forEach((ln) => { out += t(cx + 8, yy, ln, { size: 13, weight: 700, fill: c.key ? C.key : C.ink }); yy += 16; });
      m.cause.forEach((ln) => { out += t(cx + 8, yy, ln, { size: 12.5, fill: c.key ? C.key : C.ink2 }); yy += 15; });
      if (c.key) out += badge(cx + 8, y + ch - 7, 'answer', { size: 12 });
    });
    y += ch + 8;
  });
  if (s.footnote) { const p = para(x0 + 2, y + 10, s.footnote, W - 2 * x0 - 4, { size: 12.5, fill: C.ink2, italic: true }); out += p.svg; y += p.h; }
  return { svg: out, H: y + 8, W };
};

/* ========================================================== gland-density */
DIAGRAMS['gland-density'] = (s, W) => {
  const x0 = 8, max = s.levels.length - 1, dotR = 5.5, dotGap = 15, dotsW = max * dotGap + 2 * dotR;
  let out = '', y = 4;
  out += t(x0 + 2, y + 14, s.scaleTitle, { size: 12.5, weight: 700, fill: C.mute });
  y += 24;
  s.rows.forEach((rw) => {
    const R = rw.key ? ROLE.key : ROLE.plain;
    const note = wrap(rw.note, W - 2 * x0 - 20 - (rw.extra ? textW(rw.extra, 12 * BOLDW) + 22 : 0), 12.5);
    const rh = 26 + note.length * 15 + 8;
    out += `<rect x="${r1(x0)}" y="${r1(y)}" width="${r1(W - 2 * x0)}" height="${r1(rh)}" rx="8" fill="${R.fill}" stroke="${R.stroke}" stroke-width="${R.w}"/>`;
    out += t(x0 + 10, y + 19, rw.site, { size: 13.5, weight: 700, fill: rw.key ? C.key : C.ink });
    const dx = W - x0 - 10 - dotsW;
    for (let i = 0; i < max; i++) out += `<circle cx="${r1(dx + dotR + i * dotGap)}" cy="${r1(y + 14)}" r="${dotR}" fill="${i < rw.level ? (rw.key ? C.key : C.ink2) : '#fff'}" stroke="${rw.key ? C.key : '#9aa8a1'}" stroke-width="1.2"/>`;
    out += t(dx - 8, y + 19, s.levels[rw.level], { size: 12, anchor: 'end', fill: rw.key ? C.key : C.mute });
    note.forEach((ln, i) => { out += t(x0 + 10, y + 36 + i * 15, ln, { size: 12.5, fill: rw.key ? C.key : C.ink2 }); });
    if (rw.extra) out += pill(W - x0 - 8, y + 36 + (note.length - 1) * 15, rw.extra, 'earn', { size: 12, anchor: 'end' }).svg;
    y += rh + 5;
  });
  if (s.footnote) { const p = para(x0 + 2, y + 12, s.footnote, W - 2 * x0 - 4, { size: 12.5, fill: C.ink2, italic: true }); out += p.svg; y += p.h + 2; }
  return { svg: out, H: y + 6, W };
};

/* ========================================================== gastric-gland */
DIAGRAMS['gastric-gland'] = (s, W) => {
  const Wd = Math.min(W, 440), ox = (W - Wd) / 2, cells = Object.fromEntries(s.cells.map((c) => [c.id, c]));
  const gx = ox + Wd * 0.36, ch = 22, top = 46, bot = 300, wall = 30, lum = 9;
  const away = s.cells.filter((c) => c.where), insetY = 240, insetH = away.length ? 26 + away.length * 46 : 0;
  const H = Math.max(bot + 30, insetY + insetH + 8);
  const M = uid('gg');
  let out = `<defs>${marker(M, C.trap)}</defs>`;
  out += `<rect x="${r1(ox + 2)}" y="4" width="${r1(Wd - 4)}" height="34" rx="8" fill="#eef3fb" stroke="#c9d6ea"/>` + t(ox + 12, 26, s.lumenLabel, { size: 13, weight: 700, fill: C.blue });
  out += `<rect x="${r1(ox + 2)}" y="40" width="${r1(Wd - 4)}" height="${r1(H - 44)}" rx="8" fill="#fbf1ec" stroke="#ead7cc"/>`;
  // the gland: a tube from the surface down, its lumen open to the stomach
  const zone = (id) => ({ surface: [top, 76], neck: [76, 126], parietal: [126, 214], chief: [214, bot] })[id];
  const fill = { surface: '#e3ecf7', neck: '#cfdff2', parietal: '#f3c9c6', chief: '#ddd2ee' };
  for (const id of ['surface', 'neck', 'parietal', 'chief']) {
    const [y1, y2] = zone(id);
    for (let yy = y1; yy < y2 - 2; yy += ch) {
      const hgt = Math.min(ch, y2 - yy) - 2;
      [-1, 1].forEach((side) => {
        const x = side < 0 ? gx - lum - wall : gx + lum;
        if (id === 'parietal') out += `<ellipse cx="${r1(x + wall / 2 + side * 5)}" cy="${r1(yy + hgt / 2 + 1)}" rx="${r1(wall / 2 + 5)}" ry="${r1(hgt / 2 + 1)}" fill="${fill[id]}" stroke="#b5655d" stroke-width="1"/>`;
        else out += `<rect x="${r1(x)}" y="${r1(yy + 1)}" width="${wall}" height="${r1(hgt)}" rx="5" fill="${fill[id]}" stroke="#8e9bb0" stroke-width="1"/>`;
      });
    }
  }
  // the base of the gland and its lumen
  out += `<path d="M${r1(gx - lum - wall)},${bot} Q${r1(gx)},${bot + 26} ${r1(gx + lum + wall)},${bot}" fill="${fill.chief}" stroke="#8e9bb0" stroke-width="1"/>`;
  out += `<path d="M${r1(gx - lum + 2)},38 V${bot + 2} Q${r1(gx)},${bot + 12} ${r1(gx + lum - 2)},${bot + 2} V38" fill="#fff" stroke="none"/>`;
  // HCl out of a parietal cell, up the lumen
  out += `<path d="M${r1(gx + lum + 4)},170 Q${r1(gx)},168 ${r1(gx)},140 V62" stroke="${C.trap}" stroke-width="2.4" fill="none" marker-end="url(#${M})"/>`;
  out += halo(t(gx + lum + 6, 60, s.acidLabel, { size: 13, weight: 700, fill: C.trap }), '#fbf1ec');
  // cells that live elsewhere (a G cell in the antrum, a goblet cell in the intestine): an inset
  if (away.length) {
    const bw = 116, rh = 46, bh = insetH, bx = ox + Wd - bw - 8, by = insetY;
    out += `<rect x="${r1(bx)}" y="${r1(by)}" width="${bw}" height="${bh}" rx="8" fill="#fff" stroke="#9aa8a1" stroke-dasharray="4 3"/>`;
    out += t(bx + 8, by + 17, s.elsewhereLabel || 'Elsewhere', { size: 12, weight: 700, fill: C.mute });
    away.forEach((c, k) => {
      const cy = by + 26 + k * rh + rh / 2, sx = bx + 18;
      if (c.id === 'g') out += `<path d="M${r1(sx - 10)},${r1(cy + 9)} L${r1(sx)},${r1(cy - 10)} L${r1(sx + 10)},${r1(cy + 9)} Z" fill="${C.goldBg}" stroke="#b59a55" stroke-width="1.4"/>`;
      else out += `<path d="M${r1(sx - 9)},${r1(cy - 13)} Q${r1(sx - 13)},${r1(cy + 9)} ${r1(sx - 4)},${r1(cy + 14)} L${r1(sx + 4)},${r1(cy + 14)} Q${r1(sx + 13)},${r1(cy + 9)} ${r1(sx + 9)},${r1(cy - 13)} Z" fill="#eef3fb" stroke="#8e9bb0" stroke-width="1.2"/>`;
      const p = para(sx + 18, cy - (wrap(c.where, 50, 12).length - 1) * 7 + 4, c.where, 50, { size: 12, fill: C.ink2 });
      out += p.svg + numDot(bx + bw - 16, cy, c.n, c.key);
    });
  }
  // numbered markers beside each zone, with leaders
  const mx = gx + lum + wall + 44;
  const at = { neck: 101, parietal: 158, chief: 222 };
  for (const id of ['neck', 'parietal', 'chief']) {
    const c = cells[id]; if (!c) continue;
    out += `<path d="M${r1(gx + lum + wall + 6)},${at[id]} H${r1(mx - 12)}" stroke="#7d8a84" stroke-width="1" fill="none"/>` + numDot(mx, at[id], c.n, c.key);
  }
  if (cells.surface && cells.surface.n != null) out += numDot(gx - lum - wall - 18, 60, cells.surface.n, cells.surface.key);
  // the answer, in words beside its marker
  const k = s.cells.find((c) => c.key && at[c.id]);
  if (k) out += badge(mx + 16, at[k.id] + 5, 'answer', { size: 12 });
  return { svg: out, H, W, legend: legendOf(s.cells.map((c) => ({ n: c.n, label: c.label, key: c.key }))) };
};

/* ========================================================= nephron-budget */
DIAGRAMS['nephron-budget'] = (s, W) => {
  const Wd = Math.min(W, 460), ox = (W - Wd) / 2, k = Wd / 330;
  const X = (x) => ox + x * k, Y = (y) => 8 + y;
  const seg = Object.fromEntries(s.segments.map((g) => [g.id, g]));
  const color = { pct: C.key, tal: C.blue, dct: '#8a6d00', cd: '#6b3aa8' };
  const M = uid('nb');
  let out = `<defs>${marker(M, C.ink2)}</defs>`;
  // capsule and glomerulus
  out += `<circle cx="${r1(X(38))}" cy="${r1(Y(40))}" r="${r1(22 * k)}" fill="#fff" stroke="#6f7f95" stroke-width="2"/><circle cx="${r1(X(38))}" cy="${r1(Y(40))}" r="${r1(12 * k)}" fill="#f3c9c6" stroke="#b5655d" stroke-width="1.4"/>`;
  const path = (d, col, w) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const P = (pts) => pts.map((p, i) => (i ? (p.length === 4 ? 'Q' + r1(X(p[0])) + ',' + r1(Y(p[1])) + ' ' + r1(X(p[2])) + ',' + r1(Y(p[3])) : 'L' + r1(X(p[0])) + ',' + r1(Y(p[1]))) : 'M' + r1(X(p[0])) + ',' + r1(Y(p[1])))).join(' ');
  out += path(P([[60, 40], [72, 14, 90, 36], [104, 60, 120, 38], [134, 16, 150, 40], [160, 56]]), color.pct, 9);
  out += path(P([[160, 56], [160, 232], [160, 254, 176, 254], [192, 254, 192, 232]]), '#9aa8a1', 4);
  out += path(P([[192, 232], [192, 82]]), color.tal, 9);
  out += path(P([[192, 82], [204, 52, 224, 70], [244, 90, 256, 58]]), color.dct, 7);
  out += path(P([[256, 58], [278, 66], [278, 250]]), color.cd, 9);
  out += `<path d="M${r1(X(278))},${r1(Y(256))} V${r1(Y(276))}" stroke="${C.ink2}" stroke-width="1.8" fill="none" marker-end="url(#${M})"/>`;
  out += t(X(278) + 8, Y(280), s.urineLabel, { size: 12.5, fill: C.ink2 });
  const spots = { pct: [104, 82], tal: [216, 170], dct: [236, 108], cd: [304, 170] };
  for (const [id, [x, y]] of Object.entries(spots)) if (seg[id]) out += numDot(X(x), Y(y), seg[id].n, seg[id].key);
  if (seg.pct && seg.pct.key) out += badge(X(104) + 16, Y(82) + 5, 'answer', { size: 12 });
  // the budget strip
  let y = Y(296);
  const b = budget(s.segments);
  out += t(ox + 6, y + 6, s.budgetTitle, { size: 13, weight: 700, fill: C.ink2 });
  y += 16;
  const bx0 = ox + 6, bwid = Wd - 12;
  let bx = bx0;
  s.segments.forEach((g) => {
    const w = bwid * g.share / 100;
    out += `<rect x="${r1(bx)}" y="${r1(y)}" width="${r1(Math.max(1, w - 1))}" height="28" fill="${color[g.id] || '#9aa8a1'}" ${g.key ? `stroke="${C.ink}" stroke-width="2"` : ''}/>`;
    if (w >= 30) out += t(bx + w / 2, y + 19, String(g.share), { size: 13, weight: 700, anchor: 'middle', fill: '#fff' });
    bx += w;
  });
  if (b.rest > 0) out += `<rect x="${r1(bx)}" y="${r1(y)}" width="${r1(bwid * b.rest / 100)}" height="28" fill="#e4ebe7"/>`;
  // small shares labeled under the strip, by number
  y += 28;
  const small = s.segments.filter((g) => bwid * g.share / 100 < 30);
  if (small.length || b.rest > 0) { const p = para(ox + 6, y + 17, small.map((g) => g.label + ' ' + g.share).concat(b.rest > 0 ? [s.restLabel + ' ' + b.rest] : []).join(', '), Wd - 12, { size: 12.5, fill: C.ink2 }); out += p.svg; y += p.h + 6; }
  y += 8;
  return { svg: out, H: y, W, legend: legendOf(s.segments.map((g) => ({ n: g.n, label: g.label + ': ' + s.shareWord + ' ' + g.share + (s.shareUnit ? ' ' + s.shareUnit : ''), key: g.key }))) };
};

/* ============================================================ glomerulus */
DIAGRAMS.glomerulus = (s, W) => {
  const Wd = Math.min(W, 420), ox = (W - Wd) / 2, k = Wd / 320;
  const X = (x) => ox + x * k, Y = (y) => 6 + y * Math.min(1, k * 1.05);
  const F = Object.fromEntries(s.parts.map((p) => [p.id, p]));
  const M = uid('gl');
  let out = `<defs>${marker(M + 'k', C.key)}${marker(M + 'p', '#6b3aa8')}${marker(M + 'g', '#8a6d00')}${marker(M + 'b', C.ink2)}</defs>`;
  // Bowman's capsule: a cup open at the top left, its space filling with filtrate
  out += `<path d="M${r1(X(96))},${r1(Y(46))} C${r1(X(30))},${r1(Y(70))} ${r1(X(40))},${r1(Y(250))} ${r1(X(160))},${r1(Y(252))} C${r1(X(270))},${r1(Y(252))} ${r1(X(290))},${r1(Y(90))} ${r1(X(206))},${r1(Y(50))}" fill="${C.goldBg}" stroke="#6f7f95" stroke-width="3"/>`;
  // the proximal tubule leaving the capsule
  out += `<path d="M${r1(X(250))},${r1(Y(200))} C${r1(X(285))},${r1(Y(220))} ${r1(X(300))},${r1(Y(250))} ${r1(X(300))},${r1(Y(286))}" fill="none" stroke="#6f7f95" stroke-width="12" stroke-linecap="round"/><path d="M${r1(X(250))},${r1(Y(200))} C${r1(X(285))},${r1(Y(220))} ${r1(X(300))},${r1(Y(250))} ${r1(X(300))},${r1(Y(286))}" fill="none" stroke="${C.goldBg}" stroke-width="7" stroke-linecap="round"/>`;
  // afferent (wide) in, efferent (narrow) out
  out += `<path d="M${r1(X(8))},${r1(Y(30))} C${r1(X(70))},${r1(Y(30))} ${r1(X(110))},${r1(Y(60))} ${r1(X(132))},${r1(Y(112))}" fill="none" stroke="#b5655d" stroke-width="${r1(16 * k)}" stroke-linecap="round"/>`;
  out += `<path d="M${r1(X(176))},${r1(Y(108))} C${r1(X(186))},${r1(Y(60))} ${r1(X(220))},${r1(Y(22))} ${r1(X(312))},${r1(Y(18))}" fill="none" stroke="#b5655d" stroke-width="${r1(7 * k)}" stroke-linecap="round"/>`;
  // the capillary tuft
  [[140, 140, 30], [178, 136, 28], [150, 176, 30], [188, 172, 26], [164, 156, 22]].forEach(([x, y, rr]) => { out += `<circle cx="${r1(X(x))}" cy="${r1(Y(y))}" r="${r1(rr * k)}" fill="#f6d3cf" stroke="#b5655d" stroke-width="2"/>`; });
  // the forces: out of the tuft (push), back into it (pulls)
  const arrow = (x1, y1, x2, y2, col, w, mk) => `<path d="M${r1(X(x1))},${r1(Y(y1))} L${r1(X(x2))},${r1(Y(y2))}" stroke="${col}" stroke-width="${w}" fill="none" marker-end="url(#${M + mk})"/>`;
  if (F.hydrostatic) out += arrow(150, 196, 128, 236, C.key, 6, 'k') + arrow(200, 186, 232, 214, C.key, 6, 'k');
  if (F.oncotic) out += arrow(96, 186, 120, 170, '#6b3aa8', 2.4, 'p');
  if (F.capsule) out += arrow(232, 140, 212, 150, '#8a6d00', 2.4, 'g');
  const spots = { afferent: [34, 56], efferent: [268, 42], hydrostatic: [110, 236], oncotic: [80, 176], capsule: [250, 128], filtrate: [270, 268] };
  s.parts.forEach((p) => { const sp = spots[p.id]; if (sp && p.n != null) out += numDot(X(sp[0]), Y(sp[1]), p.n, p.key); });
  const kp = s.parts.find((p) => p.key && spots[p.id]);
  if (kp) out += badge(X(spots[kp.id][0]) - 14, Y(spots[kp.id][1]) + 27, 'answer', { size: 12 });
  let y = Y(296);
  if (s.net) { const p = para(W / 2, y + 12, s.net, W - 24, { size: 13, weight: 700, anchor: 'middle', fill: C.key }); out += p.svg; y += p.h + 6; }
  return { svg: out, H: y + 4, W, legend: legendOf(s.parts) };
};

/* ============================================================== etc-chain */
DIAGRAMS['etc-chain'] = (s, W) => {
  const x0 = 6, n = s.complexes.length + 1, sw = (W - 2 * x0) / n, M = uid('etc');
  const plugged = s.synthase.state === 'plugged';
  const yIms = 40, yMemT = 76, yMemB = 108, yMat = 178;
  let out = `<defs>${marker(M, C.blue)}${marker(M + 'e', '#6b3aa8')}${marker(M + 'i', C.ink2)}</defs>`;
  out += `<rect x="${x0}" y="2" width="${r1(W - 2 * x0)}" height="${yMemT - 2}" rx="8" fill="#eef3fb"/>`;
  out += t(x0 + 6, 18, s.regions.top, { size: 12.5, weight: 700, fill: C.blue });
  out += `<rect x="${x0}" y="${yMemT}" width="${r1(W - 2 * x0)}" height="${yMemB - yMemT}" fill="#f3ead2"/>`;
  for (let x = x0 + 4; x < W - x0; x += 9) out += `<circle cx="${r1(x)}" cy="${yMemT + 3}" r="2.6" fill="#c9a84c"/><circle cx="${r1(x)}" cy="${yMemB - 3}" r="2.6" fill="#c9a84c"/>`;
  out += `<rect x="${x0}" y="${yMemB}" width="${r1(W - 2 * x0)}" height="${yMat - yMemB + 14}" rx="8" fill="#f9f4e6"/>`;
  out += t(x0 + 6, yMat + 8, s.regions.bottom, { size: 12.5, weight: 700, fill: '#7a5f17' });
  const cx = (i) => x0 + sw * i + sw / 2;
  // electrons along the chain: carriers into I and II, on to III and IV
  const pumpers = s.complexes.map((c, i) => ({ c, i })).filter((o) => o.c.name !== 'II');
  out += `<path d="M${r1(cx(0))},${yMemT + 16} Q${r1((cx(0) + cx(2)) / 2)},${yMemT + 2} ${r1(cx(2))},${yMemT + 16} Q${r1((cx(2) + cx(3)) / 2)},${yMemT + 2} ${r1(cx(3))},${yMemT + 16}" fill="none" stroke="#6b3aa8" stroke-width="2" ${plugged ? 'stroke-dasharray="5 4"' : ''}/>`;
  out += `<path d="M${r1(cx(1))},${yMemT + 16} Q${r1((cx(1) + cx(2)) / 2)},${yMemT + 30} ${r1(cx(2) - 12)},${yMemT + 20}" fill="none" stroke="#6b3aa8" stroke-width="2" ${plugged ? 'stroke-dasharray="5 4"' : ''} marker-end="url(#${M}e)"/>`;
  // the complexes
  s.complexes.forEach((c, i) => {
    const w = Math.min(40, sw - 14);
    out += `<rect x="${r1(cx(i) - w / 2)}" y="${yMemT - 10}" width="${r1(w)}" height="${yMemB - yMemT + 20}" rx="7" fill="${c.pumps ? '#7a4fb0' : '#d9cfe9'}" stroke="#4c2f73" stroke-width="1.2"/>`;
    out += t(cx(i), (yMemT + yMemB) / 2 + 5, c.name, { size: 14, weight: 700, anchor: 'middle', fill: c.pumps ? '#fff' : '#3b2a59' });
    if (c.pumps) {
      const ax = cx(i) + w / 2 + 3;
      out += `<path d="M${r1(ax)},${yMemB + 16} V${yIms + 8}" stroke="${C.blue}" stroke-width="2" fill="none" ${plugged ? 'stroke-dasharray="4 3"' : ''} marker-end="url(#${M})"/>`;
      out += halo(t(ax, yIms + 4, 'H+', { size: 12.5, weight: 700, anchor: 'middle', fill: C.blue }), '#eef3fb');
    }
    if (c.entry) {
      out += `<path d="M${r1(cx(i))},${yMat - 20} V${yMemB + 14}" stroke="${C.ink2}" stroke-width="1.6" fill="none" marker-end="url(#${M}i)"/>`;
      out += t(cx(i), yMat - 6, c.entry, { size: 13, weight: 700, anchor: 'middle', fill: C.ink });
    }
    if (c.exit) out += t(cx(i), yMat - 6, c.exit, { size: 12.5, weight: 700, anchor: 'middle', fill: C.ink2 });
  });
  // ATP synthase: stalk through the membrane, head in the matrix
  const sx = cx(n - 1), sy = yMemB + 22;
  out += `<rect x="${r1(sx - 6)}" y="${yMemT - 8}" width="12" height="${yMemB - yMemT + 14}" fill="#c9a84c" stroke="#7a5f17" stroke-width="1.2"/>`;
  out += `<circle cx="${r1(sx)}" cy="${sy}" r="16" fill="${plugged ? '#e4e0d6' : '#c9a84c'}" stroke="#7a5f17" stroke-width="1.4"/>`;
  out += t(sx, sy + 4.5, 'ATP', { size: 12, weight: 700, anchor: 'middle', fill: plugged ? C.mute : '#3a2c06' });
  if (plugged) {
    out += `<rect x="${r1(sx - 13)}" y="${yMemT + 4}" width="26" height="${yMemB - yMemT - 8}" rx="4" fill="${C.trapBg}" stroke="${C.trap}" stroke-width="2"/>`;
    out += `<path d="M${r1(sx - 8)},${yMemT + 9} L${r1(sx + 8)},${yMemB - 9} M${r1(sx + 8)},${yMemT + 9} L${r1(sx - 8)},${yMemB - 9}" stroke="${C.trap}" stroke-width="2.6" stroke-linecap="round"/>`;
    // protons pile up on the outside
    const between = [];
    for (let i = 0; i < n - 1; i++) between.push(cx(i) - sw / 2 + 12);
    between.forEach((bx, j) => { out += t(bx, yIms + 16 + (j % 2) * 4, 'H+', { size: 12, weight: 700, fill: C.blue }); });
    out += t(W - x0 - 6, 18, s.synthase.plugLabel, { size: 12.5, weight: 700, anchor: 'end', fill: C.trap });
  } else {
    out += `<path d="M${r1(sx + 12)},${yIms + 6} C${r1(sx + 14)},${yMemT} ${r1(sx + 14)},${yMemB} ${r1(sx + 18)},${sy - 8}" stroke="${C.blue}" stroke-width="2" fill="none" marker-end="url(#${M})"/>`;
  }
  let y = yMat + 22;
  // what the picture adds: a carrier ledger, or the chain of effects
  if (s.ledger) {
    const L = ledger(s.ledger);
    s.ledger.forEach((r, i) => {
      const it = L.items[i];
      out += `<rect x="${x0}" y="${r1(y)}" width="${r1(W - 2 * x0)}" height="30" rx="7" fill="#f7f9f8" stroke="#c9d3cd"/>`;
      out += t(x0 + 10, y + 20, it.n + ' ' + r.carrier + ' x ' + it.rate + ' = ' + it.value, { size: 14, weight: 700, fill: C.ink });
      if (r.note) out += t(W - x0 - 10, y + 20, r.note, { size: 12.5, anchor: 'end', fill: C.mute });
      y += 34;
    });
    out += `<rect x="${x0}" y="${r1(y)}" width="${r1(W - 2 * x0)}" height="32" rx="8" fill="${C.keyBg}" stroke="${C.key}" stroke-width="2.4"/>`;
    out += t(x0 + 10, y + 21, (s.totalLabel || 'Total') + ': ' + L.items.map((it) => it.value).join(' + ') + ' = ' + L.total, { size: 14.5, weight: 700, fill: C.key });
    out += badge(W - x0 - 8, y + 21, 'answer', { anchor: 'end', size: 12 });
    y += 40;
  }
  if (s.chain) {
    s.chain.forEach((c, i) => {
      const p = para(x0 + 40, y + 19, c.text, W - 2 * x0 - 50 - (c.key ? 70 : 0), { size: 13, weight: c.key ? 700 : 400, fill: c.key ? C.key : C.ink });
      const ch = Math.max(30, p.h + 14), R = c.key ? ROLE.key : ROLE.plain;
      out += `<rect x="${x0}" y="${r1(y)}" width="${r1(W - 2 * x0)}" height="${r1(ch)}" rx="7" fill="${R.fill}" stroke="${R.stroke}" stroke-width="${R.w}"/>` + numDot(x0 + 18, y + ch / 2, i + 1, c.key) + p.svg;
      if (c.key) out += badge(W - x0 - 8, y + 20, 'answer', { anchor: 'end', size: 12 });
      y += ch + 4;
    });
  }
  return { svg: out, H: y + 4, W, extraLegend: s.swatches || null };
};

/* =============================================================== ap-trace */
// One plot: membrane potential against time, drawn from the trace kind.
function apPlot(s, tr, x, y, w, h) {
  const v0 = -90, v1 = 45, Yv = (v) => y + h - (v - v0) / (v1 - v0) * h, lm = 34, px = x + lm, pw = w - lm - 8;
  const rest = s.rest, thr = s.threshold, peak = s.peak;
  const key = !!tr.key;
  const extra = tr.kind === 'train' ? 42 : 0;
  let g = `<rect x="${r1(x)}" y="${r1(y - 26)}" width="${r1(w)}" height="${r1(h + 34 + extra)}" rx="9" fill="${key ? C.keyBg : '#f7f9f8'}" stroke="${key ? C.key : '#d3dbd6'}" stroke-width="${key ? 2.2 : 1}"/>`;
  g += t(x + 8, y - 8, tr.label, { size: 13, weight: 700, fill: key ? C.key : C.ink });
  if (key) g += badge(x + w - 6, y - 8, 'answer', { anchor: 'end', size: 12 });
  // axis and guide lines (paths, labels carry halos)
  g += `<path d="M${r1(px)},${r1(Yv(v1))} V${r1(Yv(v0))}" stroke="${C.ink2}" stroke-width="1.2" fill="none"/>`;
  [[peak, '+' + peak], [0, '0'], [rest, String(rest)]].forEach(([v, lab]) => { g += t(px - 4, Yv(v) + 4, lab, { size: 12, anchor: 'end', fill: C.mute }); });
  g += `<path d="M${r1(px)},${r1(Yv(thr))} H${r1(px + pw)}" stroke="${C.trap}" stroke-width="1.2" stroke-dasharray="5 4" fill="none"/>`;
  g += halo(t(px + pw - 2, Yv(thr) - 4, s.thresholdLabel, { size: 12, anchor: 'end', fill: C.trap }), key ? C.keyBg : '#f7f9f8');
  const T = (f) => px + pw * f;
  let d = '';
  const spike = (f0, f1) => {      // one action potential from f0 (threshold reached) to f1 (back at rest)
    const u = (f1 - f0);
    return ` L${r1(T(f0))},${r1(Yv(thr))} L${r1(T(f0 + u * 0.12))},${r1(Yv(peak))} L${r1(T(f0 + u * 0.34))},${r1(Yv(rest - 12))} Q${r1(T(f0 + u * 0.55))},${r1(Yv(rest - 13))} ${r1(T(f1))},${r1(Yv(rest))}`;
  };
  if (tr.kind === 'spike') {
    d = `M${r1(px)},${r1(Yv(rest))} L${r1(T(0.18))},${r1(Yv(rest))} Q${r1(T(0.24))},${r1(Yv(rest + 4))} ${r1(T(0.28))},${r1(Yv(thr))}` + spike(0.28, 0.78).replace(/^ L[^L]*/, '') + ` L${r1(T(1))},${r1(Yv(rest))}`;
    if (s.marks) {
      g += halo(t(T(0.31) - 6, Yv(10), s.marks.up, { size: 12, weight: 700, anchor: 'end', fill: C.blue }), '#f7f9f8');
      g += halo(t(T(0.42) + 4, Yv(-10), s.marks.down, { size: 12, weight: 700, fill: C.ink2 }), '#f7f9f8');
    }
  } else if (tr.kind === 'blocked') {
    d = `M${r1(px)},${r1(Yv(rest))} L${r1(T(0.18))},${r1(Yv(rest))} Q${r1(T(0.26))},${r1(Yv(thr - 1))} ${r1(T(0.32))},${r1(Yv(thr - 2))} Q${r1(T(0.42))},${r1(Yv(rest + 2))} ${r1(T(0.6))},${r1(Yv(rest))} L${r1(T(1))},${r1(Yv(rest))}`;
    if (s.marks && s.marks.blocked) g += halo(t(T(0.36), Yv(12), s.marks.blocked, { size: 12, weight: 700, fill: C.key }), C.keyBg);
    if (s.marks && s.marks.rest) g += halo(t(T(0.98), Yv(rest) + 16, s.marks.rest, { size: 12, anchor: 'end', fill: C.ink2 }), C.keyBg);
  } else if (tr.kind === 'train') {
    const nS = tr.count, span = 0.92 / nS;
    d = `M${r1(px)},${r1(Yv(rest))}`;
    for (let i = 0; i < nS; i++) { const f0 = 0.04 + i * span + span * 0.1; d += ` L${r1(T(f0))},${r1(Yv(rest))}` + spike(f0 + span * 0.04, f0 + span * 0.9); }
    d += ` L${r1(T(1))},${r1(Yv(rest))}`;
    g += `<path d="M${r1(px)},${r1(Yv(peak))} H${r1(px + pw)}" stroke="${C.ink2}" stroke-width="1" stroke-dasharray="2 4" fill="none"/>`;
    // the stimulus under the trace, its height the strength
    const sh = 4 + 16 * tr.strength;
    g += `<rect x="${r1(px)}" y="${r1(y + h + 26 - sh)}" width="${r1(pw)}" height="${r1(sh)}" fill="#c9d6ea" stroke="#6f7f95" stroke-width="1"/>`;
    g += t(px, y + h + 42, s.stimulusLabel + ': ' + tr.strengthWord, { size: 12, fill: C.ink2 });
    g += halo(t(px + pw - 2, Yv(peak) - 4, nS + ' ' + s.countWord, { size: 12.5, weight: 700, anchor: 'end', fill: key ? C.key : C.ink }), key ? C.keyBg : '#f7f9f8');
  }
  g += `<path d="${d}" fill="none" stroke="${key ? C.key : C.ink}" stroke-width="2.2" stroke-linejoin="round"/>`;
  return g;
}
DIAGRAMS['ap-trace'] = (s, W) => {
  const wide = W >= 560, x0 = 6, hh = s.traces.some((tr) => tr.kind === 'train') ? 120 : 132;
  let out = '', y = 32;
  if (wide) {
    const w = (W - 2 * x0 - 10) / 2;
    s.traces.forEach((tr, i) => { out += apPlot(s, tr, x0 + i * (w + 10), y, w, hh); });
    y += hh + (s.traces.some((tr) => tr.kind === 'train') ? 54 : 12);
  } else {
    s.traces.forEach((tr) => { out += apPlot(s, tr, x0, y, W - 2 * x0, hh); y += hh + (tr.kind === 'train' ? 84 : 42); });
    y -= 30;
  }
  if (s.footnote) { const p = para(x0 + 2, y + 16, s.footnote, W - 2 * x0 - 4, { size: 12.5, fill: C.ink2, italic: true }); out += p.svg; y += p.h + 6; }
  return { svg: out, H: y + 10, W };
};

/* ========================================================= collecting-duct */
function duct(s, p, x, y, w) {
  const R = p.key ? ROLE.key : ROLE.plain, M = uid('cdw');
  const hh = 132, ty = y + 44, tube = 34;
  let g = `<defs>${marker(M, C.blue)}${marker(M + 'u', C.ink2)}</defs><rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${hh + 34}" rx="9" fill="${R.fill === ROLE.plain.fill ? '#fff' : R.fill}" stroke="${R.stroke}" stroke-width="${p.key ? 2.4 : 1.2}"/>`;
  g += t(x + 10, y + 19, p.title, { size: 13, weight: 700, fill: p.key ? C.key : C.ink });
  if (p.key) g += badge(x + w - 6, y + 19, 'answer', { anchor: 'end', size: 12 });
  // the duct: wall cells above and below, filtrate inside
  const dx1 = x + 12, dx2 = x + w - 30, cells = Math.max(4, Math.floor((dx2 - dx1) / 30));
  const cw = (dx2 - dx1) / cells;
  g += `<rect x="${r1(dx1)}" y="${r1(ty + 14)}" width="${r1(dx2 - dx1)}" height="${tube}" fill="#fbf3d9"/>`;
  const pores = [];
  for (let i = 0; i < cells; i++) {
    [ty, ty + 14 + tube].forEach((wy, side) => {
      g += `<rect x="${r1(dx1 + i * cw + 1)}" y="${r1(wy)}" width="${r1(cw - 2)}" height="14" rx="3" fill="#e9dfe9" stroke="#9c8aa3" stroke-width="1"/>`;
      if ((i * 2 + side) % Math.max(1, Math.round((cells * 2) / Math.max(1, p.channels))) === 0 && pores.length < p.channels) pores.push({ x: dx1 + i * cw + cw / 2, y: wy, side });
    });
  }
  pores.forEach((q) => {
    g += `<rect x="${r1(q.x - 4)}" y="${r1(q.y)}" width="8" height="14" rx="2" fill="${C.blue}"/>`;
    g += `<path d="M${r1(q.x)},${r1(q.side ? q.y + 16 : q.y - 2)} V${r1(q.side ? q.y + 30 : q.y - 16)}" stroke="${C.blue}" stroke-width="2.2" fill="none" marker-end="url(#${M})"/>`;
  });
  // flow along the duct and the urine that leaves it
  g += `<path d="M${r1(dx1 + 6)},${r1(ty + 14 + tube / 2)} H${r1(dx2 + 14)}" stroke="${C.ink2}" stroke-width="${p.urineWidth || 3}" fill="none" marker-end="url(#${M}u)"/>`;
  const p1 = para(x + 10, y + hh + 2, p.channelText, w - 20, { size: 12.5, fill: p.key ? C.key : C.ink2 });
  const p2 = para(x + 10, y + hh + 2 + p1.h + 2, p.urine, w - 20, { size: 13, weight: 700, fill: p.key ? C.key : C.ink });
  g += p1.svg + p2.svg;
  const bottom = hh + 2 + p1.h + p2.h + 4;
  g = g.replace(`height="${hh + 34}"`, `height="${r1(bottom)}"`);
  return { svg: g, h: bottom };
}
DIAGRAMS['collecting-duct'] = (s, W) => {
  const wide = W >= 560, x0 = 6;
  let out = '', y = 4;
  if (s.lead) { const p = para(x0 + 4, y + 14, s.lead, W - 2 * x0 - 8, { size: 12.5, fill: C.ink2 }); out += p.svg; y += p.h + 8; }
  if (wide) {
    const w = (W - 2 * x0 - 10) / 2;
    let hh = 0;
    s.panels.forEach((p, i) => { const d = duct(s, p, x0 + i * (w + 10), y, w); out += d.svg; hh = d.h; });
    y += hh + 6;
  } else s.panels.forEach((p) => { const d = duct(s, p, x0, y, W - 2 * x0); out += d.svg; y += d.h + 8; });
  return { svg: out, H: y + 4, W, extraLegend: s.swatches || null };
};

export const SCHEMATICS = ['codon', 'step-ladder', 'compare-table', 'acid-base', 'gland-density', 'gastric-gland', 'nephron-budget', 'glomerulus', 'etc-chain', 'ap-trace', 'collecting-duct'];
