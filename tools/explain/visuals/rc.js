// rc.js: rc.evidence. The passage sentences come from the served passage
// (tools/rc/data/bank.js), filled in by core.js resolvePanel(); each span is marked in place, styled like the
// highlighter in tools/rc/rc.js. Letters come from the served order (ctx).
// Ported from the pilot preview (question-system/preview/renderers/rc.js).
import { register, h } from './core.js';

function markSentence(sent, spans, ctx) {
  // split the sentence around every quote, in order of position
  const hits = spans.map((s) => ({ s, i: sent.indexOf(s.quote) })).filter((x) => x.i >= 0).sort((a, b) => a.i - b.i);
  const out = h('p', { class: 'ev-text' });
  let pos = 0;
  hits.forEach(({ s, i }) => {
    if (i < pos) return;
    out.append(sent.slice(pos, i));
    const tag = s.tag || (s.choice && ctx.letterOf ? ctx.letterOf(s.choice) : null);
    const m = h('mark', { class: 'ev-' + s.role }, s.quote);
    if (tag) m.prepend(h('sup', { class: 'ev-tag', text: tag }));
    out.append(m);
    pos = i + s.quote.length;
  });
  out.append(sent.slice(pos));
  return out;
}

register('rc.evidence', (s, box, ctx) => {
  const groups = [];
  s.spans.forEach((sp) => {
    const key = sp.p + '.' + sp.s;
    let g = groups.find((x) => x.key === key);
    if (!g) groups.push(g = { key, p: sp.p, s: sp.s, spans: [] });
    g.spans.push(sp);
  });
  const list = h('div', { class: 'ev-list' + (s.link ? ' linked' : '') });
  groups.forEach((g, gi) => {
    const roles = g.spans.map((x) => x.role);
    const kind = roles.includes('key') ? 'key' : roles.includes('trap') ? 'trap' : 'stated';
    const head = h('div', { class: 'ev-head' }, h('span', { text: 'Paragraph ' + g.p + ', sentence ' + g.s }));
    const lab = kind === 'key' ? 'Proof line' : kind === 'trap' ? 'Where a trap comes from' : 'Checked off';
    head.append(h('em', { class: 'ev-k ev-k-' + kind, text: lab }));
    const card = h('div', { class: 'ev-card ev-card-' + kind }, head, markSentence(s.text[g.key], g.spans, ctx));
    g.spans.filter((x) => x.note).forEach((x) => card.append(h('p', { class: 'ev-note', text: x.note })));
    list.append(card);
    if (s.link && gi === 0) list.append(h('div', { class: 'ev-link' }, h('span', { text: s.link.label })));
  });
  box.append(list);
});
