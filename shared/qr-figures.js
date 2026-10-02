/* qr-figures.js : exam figure renderer for Ace Labs (tables, bar charts,
   line graphs, pie charts) from small JSON specs.

   Built for DAT-style data items: every label comes from the data, every
   figure is plain static SVG (the real exam shows static exhibits), and the
   layout is computed for the width it is drawn at, so a 390px phone gets real
   13px text instead of a shrunken desktop drawing.

   Usage (browser):
     QRFigures.html(spec)            -> '<figure class="qrfig" ...>' string. Safe to
                                       drop into any innerHTML; it hydrates itself
                                       to the container width on insert and on resize.
     QRFigures.mount(el, spec)       -> renders into el now.
     QRFigures.svg(spec, {width})    -> bare <svg> string at a given pixel width.
     QRFigures.validate(spec)        -> [] or a list of problems.
   Node: module.exports = the same object (svg/validate work without a DOM).

   Spec shapes (all text fields are plain text; they are escaped):
     {type:'table', title, columns:['Year','Sales'], rows:[['2019', 120], ...], note?}
     {type:'bar',   title, categories:[...], series:[{name, values:[...]}], yLabel?, xLabel?,
                    unit?, yMax?, yStep?, valueLabels?:true|false, orientation?:'auto'|'vertical'|'horizontal'}
     {type:'line',  title, x:[...], series:[{name, values:[...]}], yLabel?, xLabel?, unit?,
                    yMin?, yMax?, yStep?, valueLabels?:true|false}
     {type:'pie',   title, slices:[{label, value}], show?:'percent'|'value'|'both', unit?, note?}

   Theme: colors are CSS custom properties on .qrfig that fall back to the host
   page tokens (--ink, --paper, --line) when present, with dark steps under
   [data-theme="dark"] and under prefers-color-scheme when the host sets no theme.
   Categorical palette validated (dataviz validate_palette.js, light #fffdf7 and
   dark #15211c surfaces): multi-series lines/bars use gold, teal, violet
   (passes all-pairs in both modes, max 3 series); pies use gold, blue, coral,
   teal, violet (adjacent-pair pass incl. the wrap pair, max 6 slices with
   direct labels plus a legend). */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') { window.QRFigures = api; api._autoHydrate(); }
})(this, function () {
  'use strict';

  const SERIES = ['var(--qf-s1)', 'var(--qf-s4)', 'var(--qf-s5)'];        // gold, teal, violet
  const PIE = ['var(--qf-s1)', 'var(--qf-s2)', 'var(--qf-s3)', 'var(--qf-s4)', 'var(--qf-s5)', 'var(--qf-s6)'];
  const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  const CSS = `
.qrfig{--qf-ink:var(--ink,#1b241f);--qf-ink2:var(--ink-2,#3a4a42);--qf-mute:var(--ink-mute,#5d6a63);
 --qf-surface:var(--paper,#fffdf7);--qf-head:var(--paper-3,#f3ecdb);--qf-grid:rgba(13,32,24,.10);--qf-axis:rgba(13,32,24,.45);
 --qf-rule:var(--line,rgba(13,32,24,.14));
 --qf-s1:#B08A2E;--qf-s2:#2F6FA8;--qf-s3:#D0603A;--qf-s4:#1E9A86;--qf-s5:#7A4FB0;--qf-s6:#8a8f8c;
 margin:12px 0 14px;padding:12px 12px 10px;border:1px solid var(--qf-rule);border-radius:10px;background:var(--qf-surface);
 color:var(--qf-ink);max-width:640px;box-sizing:border-box;min-width:0}
.qrfig figcaption{font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:600;line-height:1.3;margin:0 2px 8px;color:var(--qf-ink)}
.qrfig .qf-plot{width:100%;overflow:hidden}
.qrfig svg{display:block;width:100%;height:auto;overflow:visible}
.qrfig .qf-legend{display:flex;flex-wrap:wrap;gap:6px 14px;margin:8px 2px 0;font:13px/1.3 ${SANS};color:var(--qf-ink2)}
.qrfig .qf-key{display:inline-flex;align-items:center;gap:6px}
.qrfig .qf-key svg{width:18px;height:12px;flex:none}
.qrfig .qf-note{font:12.5px/1.4 ${SANS};color:var(--qf-mute);margin:8px 2px 0}
.qrfig .qf-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
[data-theme="dark"] .qrfig{--qf-grid:rgba(236,228,212,.10);--qf-axis:rgba(236,228,212,.45);
 --qf-s1:#A88A30;--qf-s2:#5B93D0;--qf-s3:#D9714A;--qf-s4:#2AA690;--qf-s5:#9A7FE0;--qf-s6:#8f9691}
@media (prefers-color-scheme: dark){
 html:not([data-theme]) body:not([data-theme]) .qrfig{--qf-ink:var(--ink,#ece4d4);--qf-ink2:var(--ink-2,#c9c0ad);--qf-mute:var(--ink-mute,#9aa098);
  --qf-surface:var(--paper,#15211c);--qf-head:var(--paper-3,#1f2e28);--qf-rule:var(--line,rgba(236,228,212,.14));
  --qf-grid:rgba(236,228,212,.10);--qf-axis:rgba(236,228,212,.45);
  --qf-s1:#A88A30;--qf-s2:#5B93D0;--qf-s3:#D9714A;--qf-s4:#2AA690;--qf-s5:#9A7FE0;--qf-s6:#8f9691}
}`;

  // ------------------------------------------------------------------ helpers
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const r1 = (x) => Math.round(x * 10) / 10;
  // average advance width of system sans digits/letters ~0.56em; bold ~0.6em
  const textW = (s, size, bold) => String(s).length * size * (bold ? 0.6 : 0.56);
  function fmt(v, unit) {
    if (typeof v === 'string') return v;
    const abs = Math.abs(v);
    let s = Number.isInteger(v) ? v.toString() : (Math.round(v * 100) / 100).toString();
    if (abs >= 10000 && Number.isInteger(v)) s = v.toLocaleString('en-US');
    if (!unit) return s;
    if (unit === '%') return s + '%';
    return s + ' ' + unit;
  }
  function wrap(text, maxW, size, maxLines = 3) {
    const words = String(text).split(/\s+/); const lines = []; let cur = '';
    words.forEach((w) => {
      const t = cur ? cur + ' ' + w : w;
      if (textW(t, size) <= maxW || !cur) cur = t; else { lines.push(cur); cur = w; }
    });
    if (cur) lines.push(cur);
    if (lines.length > maxLines) { const keep = lines.slice(0, maxLines); keep[maxLines - 1] += '...'; return keep; }
    return lines;
  }
  function niceStep(span, target) {
    const raw = span / target; const p = Math.pow(10, Math.floor(Math.log10(raw))); const f = raw / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
  }
  function yScale(values, spec, plotH) {
    const max = Math.max(...values); const min = Math.min(0, ...values);
    let lo = spec.yMin != null ? spec.yMin : (min < 0 ? min : 0);
    let step = spec.yStep || niceStep((spec.yMax != null ? spec.yMax : max) - lo, plotH < 200 ? 4 : 5);
    if (spec.yMin == null && lo < 0) lo = Math.floor(lo / step) * step;
    let hi = spec.yMax != null ? spec.yMax : Math.ceil(max / step) * step;
    if (hi <= max && spec.yMax == null && spec.valueLabels !== false) { /* room for labels */ }
    if (hi === lo) hi = lo + step;
    const ticks = []; for (let t = lo; t <= hi + step * 1e-9; t += step) ticks.push(Math.round(t * 1e6) / 1e6);
    return { lo, hi, step, ticks };
  }
  function txt(x, y, s, o = {}) {
    const size = o.size || 13;
    return `<text x="${r1(x)}" y="${r1(y)}" font-family="${o.serif ? 'Georgia, serif' : SANS}" font-size="${size}"${o.bold ? ' font-weight="600"' : ''} fill="${o.fill || 'var(--qf-ink2)'}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.rotate ? ` transform="rotate(${o.rotate} ${r1(x)} ${r1(y)})"` : ''}>${esc(s)}</text>`;
  }
  function multiline(x, y, lines, size, o = {}) {
    return lines.map((l, i) => txt(x, y + i * size * 1.2, l, Object.assign({ size }, o))).join('');
  }
  // bar with 4px rounded data-end, anchored square on the baseline
  function barPath(x, y, w, h, horizontal) {
    const r = Math.min(4, w / 2, Math.abs(h) / 2);
    if (h <= 0.01) return '';
    if (!horizontal) return `<path d="M${r1(x)} ${r1(y + h)}V${r1(y + r)}Q${r1(x)} ${r1(y)} ${r1(x + r)} ${r1(y)}H${r1(x + w - r)}Q${r1(x + w)} ${r1(y)} ${r1(x + w)} ${r1(y + r)}V${r1(y + h)}Z"`;
    // horizontal: x is baseline, h is length, w is thickness
    return `<path d="M${r1(x)} ${r1(y)}H${r1(x + h - r)}Q${r1(x + h)} ${r1(y)} ${r1(x + h)} ${r1(y + r)}V${r1(y + w - r)}Q${r1(x + h)} ${r1(y + w)} ${r1(x + h - r)} ${r1(y + w)}H${r1(x)}Z"`;
  }
  const MARKERS = [
    (x, y, c) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="4.5" fill="${c}" stroke="var(--qf-surface)" stroke-width="2"/>`,
    (x, y, c) => `<rect x="${r1(x - 4.5)}" y="${r1(y - 4.5)}" width="9" height="9" rx="1.5" fill="${c}" stroke="var(--qf-surface)" stroke-width="2"/>`,
    (x, y, c) => `<path d="M${r1(x)} ${r1(y - 5.5)}L${r1(x + 5.5)} ${r1(y + 4.5)}L${r1(x - 5.5)} ${r1(y + 4.5)}Z" fill="${c}" stroke="var(--qf-surface)" stroke-width="2" stroke-linejoin="round"/>`
  ];
  function svgOpen(w, h, label) {
    // max-width keeps a narrow drawing (a small table) at its true size instead of scaling it up
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.round(w)} ${Math.round(h)}" width="${Math.round(w)}" height="${Math.round(h)}" style="max-width:${Math.round(w)}px" role="img" aria-label="${esc(label)}">`;
  }
  function describe(spec) {
    if (spec.type === 'table') return spec.columns.join(', ') + '. ' + spec.rows.map((r) => r.join(', ')).join('; ');
    if (spec.type === 'pie') return spec.slices.map((s) => s.label + ' ' + fmt(s.value, spec.unit)).join('; ');
    const cats = spec.categories || spec.x;
    return spec.series.map((s) => s.name + ': ' + cats.map((c, i) => c + ' ' + fmt(s.values[i], spec.unit)).join(', ')).join('. ');
  }

  // ------------------------------------------------------------------ table
  function tableSVG(spec, W) {
    const cols = spec.columns.length; const size0 = 13.5;
    const cells = [spec.columns].concat(spec.rows).map((r) => r.map((c) => (typeof c === 'number' ? fmt(c) : String(c))));
    let size = size0; let colW; let headLines;
    const numeric = spec.columns.map((_, j) => spec.rows.every((r) => typeof r[j] === 'number' || /^-?[\d,.]+%?$/.test(String(r[j]))));
    for (; size >= 11; size -= 0.5) {
      const pad = size * 0.9;
      const bodyW = spec.columns.map((_, j) => Math.max(...cells.slice(1).map((r) => textW(r[j], size, j === 0))) + pad * 2);
      const headMin = spec.columns.map((h) => Math.max(...String(h).split(/\s+/).map((w) => textW(w, size, true))) + pad * 2);
      // prefer one-line headers when the full header text fits the width
      const headFull = spec.columns.map((h) => textW(h, size, true) + pad * 2);
      const oneLine = bodyW.map((b, j) => Math.max(b, headFull[j]));
      const need = oneLine.reduce((a, b) => a + b, 0) <= W ? oneLine : bodyW.map((b, j) => Math.max(b, headMin[j]));
      const total = need.reduce((a, b) => a + b, 0);
      if (total <= W || size <= 11) {
        // share extra room proportionally, capped so short tables do not sprawl
        const extra = Math.max(0, Math.min(W, Math.max(total, W * 0.62)) - total);
        colW = need.map((n) => n + extra * (n / total));
        headLines = spec.columns.map((h, j) => wrap(h, colW[j] - pad * 2, size, 3));
        break;
      }
    }
    const pad = size * 0.9; const rowH = size * 2.1; const headH = Math.max(...headLines.map((l) => l.length)) * size * 1.2 + size * 1.0;
    const tw = colW.reduce((a, b) => a + b, 0); const ox = 0.5;
    const H = headH + rowH * spec.rows.length + 1;
    let s = svgOpen(Math.max(tw + 1, 1), H, spec.title || 'Table');
    s += `<desc>${esc(describe(spec))}</desc>`;
    s += `<rect x="${ox}" y="0.5" width="${r1(tw)}" height="${r1(headH)}" fill="var(--qf-head)"/>`;
    let x = ox;
    spec.columns.forEach((h, j) => {
      const lines = headLines[j];
      const ty = (headH - lines.length * size * 1.2) / 2 + size * 0.95;
      const ax = numeric[j] && j > 0 ? x + colW[j] - pad : x + pad;
      s += multiline(ax, ty, lines, size, { bold: true, fill: 'var(--qf-ink)', anchor: numeric[j] && j > 0 ? 'end' : null });
      x += colW[j];
    });
    spec.rows.forEach((row, i) => {
      const y = headH + i * rowH;
      if (i % 2 === 1) s += `<rect x="${ox}" y="${r1(y)}" width="${r1(tw)}" height="${r1(rowH)}" fill="var(--qf-grid)" opacity="0.5"/>`;
      let cx = ox;
      row.forEach((c, j) => {
        const v = typeof c === 'number' ? fmt(c) : String(c);
        const right = numeric[j] && j > 0;
        s += txt(right ? cx + colW[j] - pad : cx + pad, y + rowH / 2 + size * 0.36, v, { size, bold: j === 0, fill: j === 0 ? 'var(--qf-ink)' : 'var(--qf-ink2)', anchor: right ? 'end' : null });
        cx += colW[j];
      });
      s += `<line x1="${ox}" x2="${r1(ox + tw)}" y1="${r1(y + rowH)}" y2="${r1(y + rowH)}" stroke="var(--qf-rule)"/>`;
    });
    s += `<line x1="${ox}" x2="${r1(ox + tw)}" y1="${r1(headH)}" y2="${r1(headH)}" stroke="var(--qf-axis)"/>`;
    s += `<rect x="${ox}" y="0.5" width="${r1(tw)}" height="${r1(H - 1)}" fill="none" stroke="var(--qf-rule)" rx="3"/>`;
    return s + '</svg>';
  }

  // ------------------------------------------------------------------ bar
  function barSVG(spec, W) {
    const cats = spec.categories; const k = spec.series.length; const n = cats.length;
    const all = [].concat(...spec.series.map((s) => s.values));
    const labels = spec.valueLabels !== false;
    const size = 13; const small = 12;
    // orientation: vertical unless the categories cannot get readable room
    const longest = Math.max(...cats.map((c) => textW(c, small)));
    let horizontal = spec.orientation === 'horizontal';
    if (!spec.orientation || spec.orientation === 'auto') {
      const slot = (W - 60) / n;
      const valW = labels ? Math.max(...all.map((v) => textW(fmt(v, spec.unit === '%' ? '%' : ''), 11.5))) : 0;
      horizontal = slot < 34 * k || (labels && k > 1 && slot / k < valW + 2) || (longest > slot * 2.2 && n > 3);
    }
    return horizontal ? hbar(spec, W, all, labels) : vbar(spec, W, all, labels, size, small);
  }
  function vbar(spec, W, all, labels, size, small) {
    const cats = spec.categories; const k = spec.series.length; const n = cats.length;
    const H = Math.max(240, Math.min(340, W * 0.62));
    const yLab = spec.yLabel ? 20 : 0;
    const top = labels ? 22 : 12;
    // provisional scale for tick widths
    const sc0 = yScale(all, spec, H - 80);
    const tickW = Math.max(...sc0.ticks.map((t) => textW(fmt(t), small))) + 10;
    const left = yLab + tickW + 4;
    const plotW = W - left - 6; const slot = plotW / n;
    const catLines = cats.map((c) => wrap(c, slot - 6, small, 3));
    const catH = Math.max(...catLines.map((l) => l.length)) * small * 1.2;
    const bottom = catH + 12 + (spec.xLabel ? 22 : 0);
    const plotH = H - top - bottom;
    const sc = yScale(all, spec, plotH);
    const y = (v) => top + plotH - (v - sc.lo) / (sc.hi - sc.lo) * plotH;
    let s = svgOpen(W, H, spec.title || 'Bar chart') + `<desc>${esc(describe(spec))}</desc>`;
    sc.ticks.forEach((t) => {
      s += `<line x1="${r1(left)}" x2="${r1(W - 6)}" y1="${r1(y(t))}" y2="${r1(y(t))}" stroke="var(--qf-grid)"/>`;
      s += txt(left - 6, y(t) + small * 0.35, fmt(t), { size: small, anchor: 'end', fill: 'var(--qf-mute)' });
    });
    if (spec.yLabel) s += txt(13, top + plotH / 2, spec.yLabel, { size: small, anchor: 'middle', rotate: -90, fill: 'var(--qf-ink2)' });
    const groupW = Math.min(slot * 0.72, k * 56); const gap = 2; const bw = (groupW - gap * (k - 1)) / k;
    cats.forEach((c, i) => {
      const gx = left + slot * i + (slot - groupW) / 2;
      spec.series.forEach((ser, j) => {
        const v = ser.values[i]; const x = gx + j * (bw + gap);
        const y0 = y(Math.max(0, sc.lo)); const yv = y(v);
        const p = v >= 0 ? barPath(x, yv, bw, y0 - yv, false) : `<path d="M${r1(x)} ${r1(y0)}H${r1(x + bw)}V${r1(yv)}H${r1(x)}Z"`;
        if (p) s += `${p} fill="${k > 1 ? SERIES[j] : SERIES[0]}"/>`;
        if (labels) s += txt(x + bw / 2, v >= 0 ? yv - 6 : yv + 15, fmt(v, spec.unit === '%' ? '%' : ''), { size: 11.5, anchor: 'middle', fill: 'var(--qf-ink)' });
      });
      s += multiline(left + slot * i + slot / 2, top + plotH + small + 6, catLines[i], small, { anchor: 'middle', fill: 'var(--qf-ink2)' });
    });
    s += `<line x1="${r1(left)}" x2="${r1(W - 6)}" y1="${r1(y(Math.max(0, sc.lo)))}" y2="${r1(y(Math.max(0, sc.lo)))}" stroke="var(--qf-axis)"/>`;
    if (spec.xLabel) s += txt(left + plotW / 2, H - 6, spec.xLabel, { size: small, anchor: 'middle' });
    return s + '</svg>';
  }
  function hbar(spec, W, all, labels) {
    const cats = spec.categories; const k = spec.series.length; const n = cats.length; const small = 12.5;
    const catMax = Math.min(W * 0.36, Math.max(...cats.map((c) => textW(c, small))) + 4);
    const catLines = cats.map((c) => wrap(c, catMax, small, 2));
    const left = catMax + 10;
    const valW = labels ? Math.max(...all.map((v) => textW(fmt(v, spec.unit === '%' ? '%' : ''), 11.5))) + 8 : 6;
    const bt = 16; const gap = 2; const groupH = k * bt + (k - 1) * gap; const rowH = Math.max(groupH + 14, Math.max(...catLines.map((l) => l.length)) * small * 1.2 + 10);
    const top = 6; const plotH = rowH * n; const axisH = 24 + ((spec.yLabel || spec.xLabel) ? 20 : 0);
    const H = top + plotH + axisH;
    const plotW = W - left - valW;
    const sc = yScale(all, spec, plotW * 0.6);
    const x = (v) => left + (v - sc.lo) / (sc.hi - sc.lo) * plotW;
    let s = svgOpen(W, H, spec.title || 'Bar chart') + `<desc>${esc(describe(spec))}</desc>`;
    sc.ticks.forEach((t) => {
      s += `<line y1="${top}" y2="${r1(top + plotH)}" x1="${r1(x(t))}" x2="${r1(x(t))}" stroke="var(--qf-grid)"/>`;
      s += txt(x(t), top + plotH + 16, fmt(t), { size: 11.5, anchor: 'middle', fill: 'var(--qf-mute)' });
    });
    cats.forEach((c, i) => {
      const gy = top + rowH * i + (rowH - groupH) / 2;
      spec.series.forEach((ser, j) => {
        const v = ser.values[i]; const by = gy + j * (bt + gap);
        const p = barPath(x(Math.max(0, sc.lo)), by, bt, x(v) - x(Math.max(0, sc.lo)), true);
        if (p) s += `${p} fill="${k > 1 ? SERIES[j] : SERIES[0]}"/>`;
        if (labels) s += txt(x(v) + 5, by + bt / 2 + 4, fmt(v, spec.unit === '%' ? '%' : ''), { size: 11.5, fill: 'var(--qf-ink)' });
      });
      const lines = catLines[i];
      s += multiline(left - 8, top + rowH * i + rowH / 2 - (lines.length - 1) * small * 0.6 + small * 0.35, lines, small, { anchor: 'end', fill: 'var(--qf-ink2)' });
    });
    s += `<line y1="${top}" y2="${r1(top + plotH)}" x1="${r1(x(Math.max(0, sc.lo)))}" x2="${r1(x(Math.max(0, sc.lo)))}" stroke="var(--qf-axis)"/>`;
    const axisLabel = spec.yLabel || spec.xLabel;
    if (axisLabel) s += txt(left + plotW / 2, H - 4, axisLabel, { size: 12, anchor: 'middle' });
    return s + '</svg>';
  }

  // ------------------------------------------------------------------ line
  function lineSVG(spec, W) {
    const xs = spec.x; const n = xs.length; const k = spec.series.length; const small = 12;
    const all = [].concat(...spec.series.map((s) => s.values));
    const labels = spec.valueLabels != null ? spec.valueLabels : k === 1;
    const H = Math.max(240, Math.min(340, W * 0.62));
    const yLab = spec.yLabel ? 20 : 0; const top = labels ? 24 : 14;
    const sc0 = yScale(all, spec, H - 80);
    const tickW = Math.max(...sc0.ticks.map((t) => textW(fmt(t), small))) + 10;
    const left = yLab + tickW + 6; const right = 16;
    const plotW = W - left - right; const stepX = n > 1 ? plotW / (n - 1) : 0;
    const maxXL = Math.max(...xs.map((c) => textW(c, small)));
    const every = maxXL + 8 > stepX ? Math.ceil((maxXL + 8) / Math.max(stepX, 1)) : 1;
    const bottom = small + 14 + (spec.xLabel ? 22 : 0);
    const plotH = H - top - bottom;
    const sc = yScale(all, spec, plotH);
    const X = (i) => left + (n > 1 ? i * stepX : plotW / 2);
    const Y = (v) => top + plotH - (v - sc.lo) / (sc.hi - sc.lo) * plotH;
    let s = svgOpen(W, H, spec.title || 'Line graph') + `<desc>${esc(describe(spec))}</desc>`;
    sc.ticks.forEach((t) => {
      s += `<line x1="${r1(left)}" x2="${r1(W - right)}" y1="${r1(Y(t))}" y2="${r1(Y(t))}" stroke="var(--qf-grid)"/>`;
      s += txt(left - 7, Y(t) + small * 0.35, fmt(t), { size: small, anchor: 'end', fill: 'var(--qf-mute)' });
    });
    if (spec.yLabel) s += txt(13, top + plotH / 2, spec.yLabel, { size: small, anchor: 'middle', rotate: -90 });
    s += `<line x1="${r1(left)}" x2="${r1(W - right)}" y1="${r1(top + plotH)}" y2="${r1(top + plotH)}" stroke="var(--qf-axis)"/>`;
    xs.forEach((c, i) => {
      s += `<line x1="${r1(X(i))}" x2="${r1(X(i))}" y1="${r1(top + plotH)}" y2="${r1(top + plotH + 4)}" stroke="var(--qf-axis)"/>`;
      if (i % every === 0 || i === n - 1 && (n - 1) % every === 0) s += txt(X(i), top + plotH + small + 8, c, { size: small, anchor: 'middle' });
    });
    spec.series.forEach((ser, j) => {
      const c = k > 1 ? SERIES[j] : SERIES[0];
      const d = ser.values.map((v, i) => (i ? 'L' : 'M') + r1(X(i)) + ' ' + r1(Y(v))).join('');
      s += `<path d="${d}" fill="none" stroke="${c}" stroke-width="2.25" stroke-linejoin="round" stroke-linecap="round"/>`;
      ser.values.forEach((v, i) => { s += MARKERS[j % 3](X(i), Y(v), c); });
    });
    if (labels) {
      // One series: label above, or below at a local minimum. Several series:
      // at each x the highest point is labeled above and the others below, so
      // labels at shared or nearby points never stack. Labels at the two ends
      // are nudged inward so they never cross the axis or the edge.
      spec.series.forEach((ser, j) => ser.values.forEach((v, i) => {
        let below;
        if (k === 1) { const prev = i > 0 ? ser.values[i - 1] : v; const nxt = i < n - 1 ? ser.values[i + 1] : v; below = v < prev && v < nxt; }
        else { const col = spec.series.map((x) => x.values[i]); const top = col.indexOf(Math.max(...col)); below = j !== top; }
        const label = fmt(v, spec.unit === '%' ? '%' : ''); const half = textW(label, 11.5) / 2;
        const x = Math.min(W - right + 12 - half, Math.max(left + half + 3, X(i)));
        s += txt(x, below ? Y(v) + 19 : Y(v) - 10, label, { size: 11.5, anchor: 'middle', fill: 'var(--qf-ink)' });
      }));
    }
    if (spec.xLabel) s += txt(left + plotW / 2, H - 6, spec.xLabel, { size: small, anchor: 'middle' });
    return s + '</svg>';
  }

  // ------------------------------------------------------------------ pie
  function pieSVG(spec, W) {
    const total = spec.slices.reduce((a, s) => a + s.value, 0);
    const R = Math.min(W * 0.36, 120); const pad = 34; const H = R * 2 + pad * 2;
    const cx = W / 2; const cy = H / 2;
    let s = svgOpen(W, H, spec.title || 'Pie chart') + `<desc>${esc(describe(spec))}</desc>`;
    let a0 = -Math.PI / 2;
    const show = spec.show || 'percent';
    const label = (sl) => {
      const pct = sl.value / total * 100; const p = Number.isInteger(r1(pct)) ? String(Math.round(pct)) : String(r1(pct));
      if (show === 'value') return fmt(sl.value, spec.unit);
      if (show === 'both') return fmt(sl.value, spec.unit) + ' (' + p + '%)';
      return p + '%';
    };
    spec.slices.forEach((sl, i) => {
      const ang = sl.value / total * Math.PI * 2; const a1 = a0 + ang; const c = PIE[i % PIE.length];
      if (ang >= Math.PI * 2 - 1e-9) s += `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(R)}" fill="${c}"/>`;
      else {
        const large = ang > Math.PI ? 1 : 0;
        s += `<path d="M${r1(cx)} ${r1(cy)}L${r1(cx + R * Math.cos(a0))} ${r1(cy + R * Math.sin(a0))}A${r1(R)} ${r1(R)} 0 ${large} 1 ${r1(cx + R * Math.cos(a1))} ${r1(cy + R * Math.sin(a1))}Z" fill="${c}" stroke="var(--qf-surface)" stroke-width="2" stroke-linejoin="round"/>`;
      }
      const mid = a0 + ang / 2; const L = label(sl);
      const inside = ang > 0.55 && textW(L, 12.5, true) < R * ang * 0.62;
      if (inside) {
        const rr = R * 0.62;
        s += `<text x="${r1(cx + rr * Math.cos(mid))}" y="${r1(cy + rr * Math.sin(mid) + 4.5)}" font-family="${SANS}" font-size="12.5" font-weight="700" text-anchor="middle" fill="#fff" stroke="rgba(0,0,0,0.35)" stroke-width="2.5" paint-order="stroke">${esc(L)}</text>`;
      } else {
        const x1 = cx + R * Math.cos(mid), y1 = cy + R * Math.sin(mid);
        const x2 = cx + (R + 14) * Math.cos(mid), y2 = cy + (R + 14) * Math.sin(mid);
        const right = Math.cos(mid) >= 0;
        s += `<path d="M${r1(x1)} ${r1(y1)}L${r1(x2)} ${r1(y2)}" stroke="var(--qf-axis)" fill="none"/>`;
        s += txt(x2 + (right ? 4 : -4), y2 + 4, L, { size: 12, anchor: right ? 'start' : 'end', fill: 'var(--qf-ink)', bold: true });
      }
      a0 = a1;
    });
    return s + '</svg>';
  }

  function swatch(type, i, j) {
    if (type === 'pie') return `<svg viewBox="0 0 18 12" aria-hidden="true"><rect x="2" y="1" width="12" height="10" rx="2.5" fill="${PIE[i % PIE.length]}"/></svg>`;
    const c = SERIES[j];
    if (type === 'line') return `<svg viewBox="0 0 18 12" aria-hidden="true"><line x1="0" x2="18" y1="6" y2="6" stroke="${c}" stroke-width="2.25"/>${MARKERS[j % 3](9, 6, c)}</svg>`;
    return `<svg viewBox="0 0 18 12" aria-hidden="true"><rect x="2" y="1" width="12" height="10" rx="2.5" fill="${c}"/></svg>`;
  }
  function legendHTML(spec) {
    if (spec.type === 'pie') {
      const total = spec.slices.reduce((a, s) => a + s.value, 0);
      return `<div class="qf-legend">${spec.slices.map((s, i) => `<span class="qf-key">${swatch('pie', i)}${esc(s.label)}</span>`).join('')}</div>`;
    }
    if ((spec.type === 'bar' || spec.type === 'line') && spec.series.length > 1) {
      return `<div class="qf-legend">${spec.series.map((s, j) => `<span class="qf-key">${swatch(spec.type, 0, j)}${esc(s.name)}</span>`).join('')}</div>`;
    }
    return '';
  }

  // ------------------------------------------------------------------ public
  function validate(spec) {
    const e = [];
    if (!spec || typeof spec !== 'object') return ['figure is not an object'];
    const num = (v) => typeof v === 'number' && Number.isFinite(v);
    if (!spec.title || typeof spec.title !== 'string') e.push('title required');
    if (spec.type === 'table') {
      if (!Array.isArray(spec.columns) || spec.columns.length < 2 || spec.columns.length > 6) e.push('table needs 2 to 6 columns');
      if (!Array.isArray(spec.rows) || spec.rows.length < 2 || spec.rows.length > 12) e.push('table needs 2 to 12 rows');
      else spec.rows.forEach((r, i) => { if (!Array.isArray(r) || r.length !== spec.columns.length) e.push('row ' + i + ' width mismatch'); });
    } else if (spec.type === 'bar' || spec.type === 'line') {
      const cats = spec.type === 'bar' ? spec.categories : spec.x;
      if (!Array.isArray(cats) || cats.length < 2 || cats.length > 12) e.push('need 2 to 12 categories');
      if (!Array.isArray(spec.series) || spec.series.length < 1 || spec.series.length > 3) e.push('need 1 to 3 series');
      else spec.series.forEach((s, j) => {
        if (!s.name) e.push('series ' + j + ' needs a name');
        if (!Array.isArray(s.values) || !cats || s.values.length !== cats.length) e.push('series ' + j + ' length mismatch');
        else if (!s.values.every(num)) e.push('series ' + j + ' has a non-number');
      });
      // unlabeled values must sit on a gridline (or a half step) so they are readable
      if (!e.length) {
        const labels = spec.type === 'bar' ? spec.valueLabels !== false : (spec.valueLabels != null ? spec.valueLabels : spec.series.length === 1);
        if (!labels) {
          const sc = yScale([].concat(...spec.series.map((s) => s.values)), spec, 200);
          spec.series.forEach((s) => s.values.forEach((v) => { const q = (v - sc.lo) / (sc.step / 2); if (Math.abs(q - Math.round(q)) > 1e-9) e.push('unlabeled value ' + v + ' is not on a gridline or half step (step ' + sc.step + ')'); }));
        }
      }
    } else if (spec.type === 'pie') {
      if (!Array.isArray(spec.slices) || spec.slices.length < 2 || spec.slices.length > 6) e.push('pie needs 2 to 6 slices');
      else spec.slices.forEach((s, i) => { if (!s.label || !num(s.value) || s.value <= 0) e.push('slice ' + i + ' bad'); });
    } else e.push('unknown figure type ' + spec.type);
    return e;
  }
  function svg(spec, opts = {}) {
    const W = Math.max(280, Math.min(640, Math.round(opts.width || 560)));
    if (spec.type === 'table') return tableSVG(spec, W);
    if (spec.type === 'bar') return barSVG(spec, W);
    if (spec.type === 'line') return lineSVG(spec, W);
    if (spec.type === 'pie') return pieSVG(spec, W);
    throw new Error('unknown figure type ' + spec.type);
  }
  function inner(spec, width) {
    return `<figcaption>${esc(spec.title)}</figcaption><div class="qf-plot">${svg(spec, { width })}</div>${legendHTML(spec)}${spec.note ? `<div class="qf-note">${esc(spec.note)}</div>` : ''}`;
  }
  function encode(spec) { return esc(JSON.stringify(spec)); }
  function html(spec, opts = {}) {
    return `<figure class="qrfig" data-qrfig="${encode(spec)}" data-w="${opts.width || 560}">${inner(spec, opts.width || 560)}</figure>`;
  }
  function injectCSS() {
    if (typeof document === 'undefined' || document.getElementById('qrfig-css')) return;
    const st = document.createElement('style'); st.id = 'qrfig-css'; st.textContent = CSS; document.head.appendChild(st);
  }
  function widthOf(fig) {
    const cs = getComputedStyle(fig); const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    return Math.floor(fig.clientWidth - padX);
  }
  function hydrate(fig) {
    let spec; try { spec = JSON.parse(fig.getAttribute('data-qrfig')); } catch (e) { return; }
    const w = widthOf(fig); if (!w || w < 50) return;
    const target = Math.max(280, Math.min(640, w));
    if (+fig.getAttribute('data-w') === target && fig.hasAttribute('data-hydrated')) return;
    fig.setAttribute('data-w', target); fig.setAttribute('data-hydrated', '1');
    fig.innerHTML = inner(spec, target);
  }
  let ro = null;
  function hydrateAll(rootEl) {
    injectCSS();
    (rootEl || document).querySelectorAll('figure.qrfig[data-qrfig]').forEach((f) => {
      hydrate(f);
      if (ro && !f.__qrObserved) { ro.observe(f); f.__qrObserved = true; }
    });
  }
  function mount(el, spec) {
    injectCSS();
    el.innerHTML = html(spec);
    hydrateAll(el);
  }
  function _autoHydrate() {
    if (typeof document === 'undefined') return;
    const go = () => {
      injectCSS();
      if (typeof ResizeObserver !== 'undefined') {
        let pending = null;
        ro = new ResizeObserver((entries) => {
          entries.forEach((en) => { pending = pending || new Set(); pending.add(en.target); });
          requestAnimationFrame(() => { if (pending) { pending.forEach(hydrate); pending = null; } });
        });
      }
      hydrateAll();
      if (typeof MutationObserver !== 'undefined') {
        let queued = false;
        new MutationObserver(() => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; hydrateAll(); }); })
          .observe(document.body, { childList: true, subtree: true });
      }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  }

  return { svg, html, mount, validate, hydrateAll, describe, CSS, _autoHydrate };
});
