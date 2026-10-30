// chem-oc.js: organic chemistry pictures added with batch B004.
//   chem.spectrum, kind ir: stacked IR traces drawn from their bands (each band a
//   Gaussian dip at its wavenumber), higher wavenumber on the left as on every IR
//   chart, with shaded landmark zones, a shift arrow between traces, and the key
//   band in an outlined badge. The build checks every band against the landmark
//   window for its group (scripts/explainers/build.mjs, IR_WINDOWS), so the
//   picture cannot put a band where the chemistry does not.
// Drawn at the width the box has, text 12 px or larger at 358 px, every label
// haloed or on a filled badge so no stroke runs through it.
import { register, C, t, r1, svgOpen, width, badge, arrowDefs, uid, h } from './core.js';

const halo = (svgText) => svgText.replace('<text ', '<text paint-order="stroke" stroke="#fff" stroke-width="4" stroke-linejoin="round" ');

register('chem.spectrum', (s, box) => {
  if (s.kind !== 'ir') throw new Error('chem.spectrum kind ' + s.kind + ' is not drawn yet');
  const W = width(box), narrow = W < 520;
  const [hi, lo] = s.range;
  const L = 14, R = 14, pw = W - L - R;
  const X = (nu) => L + ((hi - nu) / (hi - lo)) * pw;
  const STRIP = narrow ? 70 : 78, TITLE = 18, GAP = s.shift ? 34 : 22;
  const traces = s.traces;
  const tops = traces.map((tr, i) => 8 + TITLE + i * (TITLE + STRIP + GAP));
  const plotBottom = tops[tops.length - 1] + STRIP + 8;
  const H = plotBottom + 52;
  const aid = uid('ir');
  let g = arrowDefs(aid, C.key);
  // landmark zones, under everything else
  (s.zones || []).forEach((z) => {
    const x1 = X(z.to), x2 = X(z.from);
    g += `<rect x="${r1(Math.min(x1, x2))}" y="${tops[0] - 4}" width="${r1(Math.abs(x2 - x1))}" height="${r1(plotBottom - tops[0] + 4)}" fill="rgba(155,69,0,.07)" stroke="none"/>`;
  });
  // the traces
  traces.forEach((tr, i) => {
    const top = tops[i];
    const T = (nu) => 1 - (tr.bands || []).reduce((a, b) => { const sg = (b.width || 60) / 2.355; return a + (b.depth || 0.6) * Math.exp(-((nu - b.at) ** 2) / (2 * sg * sg)); }, 0);
    const pts = [];
    for (let nu = hi; nu >= lo; nu -= 5) pts.push(r1(X(nu)) + ',' + r1(top + (1 - T(nu)) * STRIP));
    g += halo(t(L, top - 6, tr.label, { size: 13, weight: 700, fill: tr.key ? C.key : C.ink2 }));
    g += `<line x1="${L}" x2="${W - R}" y1="${top}" y2="${top}" stroke="#e3e8e5" stroke-width="1"/>`;
    g += `<polyline points="${pts.join(' ')}" fill="none" stroke="${tr.key ? C.key : C.ink2}" stroke-width="${tr.key ? 2.4 : 1.8}"${tr.key ? '' : ' stroke-dasharray="6 3"'}/>`;
    (tr.bands || []).forEach((b) => {
      if (!b.text) return;
      const x = X(b.at), y = top + (b.depth || 0.6) * STRIP + 17;
      const w = b.text.length * 12.5 * 0.53 + 14;
      const anchor = x - w / 2 < L ? 'start' : x + w / 2 > W - R ? 'end' : 'middle';
      const ax = anchor === 'start' ? Math.max(L, x - 12) : anchor === 'end' ? Math.min(W - R, x + 12) : x;
      if (b.key) g += badge(ax, y + 2, b.text, { size: 12.5, anchor });
      else g += halo(t(ax, y, b.text, { size: 12.5, anchor, fill: C.ink2, weight: 700 }));
    });
  });
  // the shift: an arrow from the band's place in the first trace to its place in the key trace
  if (s.shift) {
    const y = tops[1] - TITLE - GAP / 2 + 6;
    const x1 = X(s.shift.from), x2 = X(s.shift.to);
    g += `<line x1="${r1(x1)}" y1="${r1(y)}" x2="${r1(x2 + (x2 > x1 ? -4 : 4))}" y2="${r1(y)}" stroke="${C.key}" stroke-width="2" marker-end="url(#${aid})"/>`;
    g += halo(t(Math.max(x1, x2) + 8, y + 4.5, s.shift.text, { size: 12.5, fill: C.key, weight: 700 }));
  }
  // zone labels, over the traces, haloed
  (s.zones || []).forEach((z) => {
    const xm = (X(z.from) + X(z.to)) / 2, w = z.text.length * 12 * 0.53;
    const anchor = xm + w / 2 > W - R ? 'end' : xm - w / 2 < L ? 'start' : 'middle';
    g += halo(t(anchor === 'end' ? W - R : anchor === 'start' ? L : xm, plotBottom - 2, z.text, { size: 12, anchor, fill: C.trap, weight: 700 }));
  });
  // the axis: higher wavenumber on the left
  const ay = plotBottom + 8;
  g += `<line x1="${L}" x2="${W - R}" y1="${ay}" y2="${ay}" stroke="${C.ink2}" stroke-width="1.2"/>`;
  const step = narrow ? 500 : 250;
  for (let nu = hi; nu >= lo; nu -= step) {
    const x = X(nu);
    g += `<line x1="${r1(x)}" x2="${r1(x)}" y1="${ay}" y2="${ay + 5}" stroke="${C.ink2}" stroke-width="1"/>`;
    if ((hi - nu) % 500 === 0) g += t(x, ay + 19, String(nu), { size: 12, anchor: nu === hi ? 'start' : nu === lo ? 'end' : 'middle', fill: C.mute });
  }
  g += t(L + pw / 2, ay + 38, s.axisLabel || 'Wavenumber, cm-1 (higher on the left)', { size: 12.5, anchor: 'middle', fill: C.ink2 });
  box.innerHTML = svgOpen(W, H) + g + '</svg>';
  if (s.note) box.append(h('p', { class: 'vis-note', text: s.note }));
});
