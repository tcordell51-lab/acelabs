/* qr-formats.js : runtime for the QR formats pool (Quantitative Comparison,
   Data Sufficiency, Data Interpretation with rendered figures, Applied Word
   Problems). Data lives in shared/qr-formats-bank.js (generated); figures are
   drawn by shared/qr-figures.js. Any Ace Labs test can draw from this pool.
   Docs: docs/QR-FORMATS-POOL.md

   Browser:  <script src="/shared/qr-figures.js"></script>
             <script src="/shared/qr-formats-bank.js"></script>
             <script src="/shared/qr-formats.js"></script>
             QRFormats.draw({ formats: ['qc','ds'], n: 10, seed: 7 })
   Node:     const QRFormats = require('./shared/qr-formats.js') */
(function (root, factory) {
  const isNode = typeof module === 'object' && module.exports;
  const data = isNode ? require('./qr-formats-bank.js') : root.QR_FORMATS_DATA;
  const figures = isNode ? require('./qr-figures.js') : root.QRFigures;
  const api = factory(data, figures);
  if (isNode) module.exports = api;
  if (typeof window !== 'undefined') window.QRFormats = api;
})(typeof self !== 'undefined' ? self : this, function (DATA, FIG) {
  'use strict';
  if (!DATA) throw new Error('qr-formats: load shared/qr-formats-bank.js first');
  const LETTERS = 'ABCDE';
  const items = DATA.items.slice();
  const byId = Object.fromEntries(items.map((it) => [it.id, it]));
  const SKILLS = Object.fromEntries(Object.entries(DATA.formats).map(([f, v]) => [f, v.skill]));

  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // Plain authored text -> safe HTML with exponents raised: 2^(n+1), x^3, 10^-3.
  function display(s) {
    return esc(s)
      .replace(/\^\(([^()]*)\)/g, '<sup>$1</sup>')
      .replace(/\^(-?[A-Za-z0-9.]*[A-Za-z0-9])/g, '<sup>$1</sup>');
  }
  const optionsOf = (it) => it.opts || DATA.choices[it.format];

  const CSS = `
.qrf-stem{font-family:Georgia,'Times New Roman',serif}
.qrf-given{text-align:center;font-size:17px;margin:2px 0 12px;padding:8px 10px;border-radius:8px;background:var(--paper-2,rgba(127,127,127,.08))}
.qrf-qc{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:4px 0 6px}
.qrf-col{border:1px solid var(--line,rgba(127,127,127,.25));border-radius:10px;padding:10px 12px;min-width:0}
.qrf-col .h{font:600 11px/1.2 system-ui,-apple-system,'Segoe UI',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-mute,#6e7c74);margin-bottom:6px}
.qrf-col .v{font-size:16.5px;line-height:1.35;overflow-wrap:anywhere}
.qrf-ds-q{font-size:17px;margin-bottom:10px}
.qrf-ds-s{display:grid;grid-template-columns:auto 1fr;gap:6px 10px;font-size:16px;line-height:1.4;margin:0 0 4px}
.qrf-ds-s .n{font-weight:700;color:var(--gold-d,#8C7235)}
.qrf-q{font-size:17px;line-height:1.4}
.qrf-tag{display:inline-block;font:600 10.5px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--gold-d,#8C7235);margin-bottom:8px}
@media (max-width:420px){.qrf-col .v,.qrf-q,.qrf-ds-q{font-size:15.5px}.qrf-qc{gap:8px}}`;
  function injectCSS() {
    if (typeof document === 'undefined' || document.getElementById('qrf-css')) return;
    const st = document.createElement('style'); st.id = 'qrf-css'; st.textContent = CSS; document.head.appendChild(st);
  }
  if (typeof document !== 'undefined') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectCSS); else injectCSS(); }

  const TAG = { qc: 'Quantitative comparison', ds: 'Data sufficiency', di: 'Data interpretation', aw: 'Applied problem' };
  function stemHTML(it, opts = {}) {
    let h = '<div class="qrf-stem">';
    if (opts.tag !== false) h += `<div class="qrf-tag">${TAG[it.format]}</div>`;
    if (it.figure && FIG) h += FIG.html(it.figure);
    if (it.format === 'qc') {
      if (it.stem) h += `<div class="qrf-given">${display(it.stem)}</div>`;
      h += `<div class="qrf-qc"><div class="qrf-col"><div class="h">Quantity A</div><div class="v">${display(it.colA)}</div></div><div class="qrf-col"><div class="h">Quantity B</div><div class="v">${display(it.colB)}</div></div></div>`;
    } else if (it.format === 'ds') {
      h += `<div class="qrf-ds-q">${display(it.stem)}</div><div class="qrf-ds-s"><span class="n">(1)</span><span>${display(it.s1)}</span><span class="n">(2)</span><span>${display(it.s2)}</span></div>`;
    } else {
      h += `<div class="qrf-q">${display(it.stem)}</div>`;
    }
    return h + '</div>';
  }
  function solutionHTML(it) {
    return `<b>The move:</b> ${display(it.move)}<br><br>${display(it.why)}`;
  }

  // Shape used by tools/qr (BANK items): {id, skills, diff, q, opts, correct, why, diag}
  function toEngineItem(it) {
    const diag = {};
    Object.entries(it.diag || {}).forEach(([k, v]) => { diag[k] = display(v); });
    return { id: it.id, skills: [it.skill], diff: it.diff, q: stemHTML(it), opts: optionsOf(it).map(display), correct: it.correct, why: solutionHTML(it), diag, fmt: it.format, topic: it.topic, pool: 'qr-formats' };
  }
  // Shape used by the shared mocks (dat-mock-tests.js style): {id, q, choices, answer, explanation}
  function toMockItem(it) {
    return { id: it.id, section: 'QR', q: stemHTML(it, { tag: false }), choices: optionsOf(it).map(display), answer: LETTERS[it.correct], explanation: solutionHTML(it), skill: it.skill, format: it.format, diff: it.diff };
  }

  function rng(seed) { let a = (seed >>> 0) || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  /* draw({formats, n, diff:[1,2,3,4], topics, exclude:Set|array of ids, seed})
     Returns n pool items, interleaved across the requested formats, never two
     items that share a figure in the same draw. Deterministic for a given seed. */
  function draw(o = {}) {
    const formats = o.formats || ['qc', 'ds', 'di', 'aw'];
    const diffs = o.diff ? [].concat(o.diff) : null;
    const ex = new Set(o.exclude || []);
    const r = rng(o.seed == null ? Date.now() : o.seed);
    const pools = formats.map((f) => items.filter((it) => it.format === f && !ex.has(it.id) && (!diffs || diffs.includes(it.diff)) && (!o.topics || o.topics.includes(it.topic))));
    pools.forEach((p) => { for (let i = p.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } });
    const out = []; const figs = new Set(); const n = o.n || 10; let k = 0; let guard = 0;
    while (out.length < n && pools.some((p) => p.length) && guard++ < 10000) {
      const p = pools[k++ % pools.length]; if (!p.length) continue;
      const it = p.shift(); const fk = it.figure ? JSON.stringify(it.figure) : null;
      if (fk && figs.has(fk)) continue; if (fk) figs.add(fk);
      out.push(it);
    }
    return out;
  }

  return { version: DATA.version, items, formats: DATA.formats, choices: DATA.choices, skills: SKILLS, get: (id) => byId[id], byFormat: (f) => items.filter((it) => it.format === f), options: optionsOf, display, stemHTML, solutionHTML, toEngineItem, toMockItem, draw, LETTERS };
});
