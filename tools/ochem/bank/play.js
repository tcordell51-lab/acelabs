// play.js - one shared way to put an item in front of a student.
//
// Modules on the tree each grew their own version of this. Thomas's own items
// arrive at every rung including the roots, so they need a renderer that does
// not belong to any one module: stem, the drawing if there is one, five
// choices, and on a miss the reason plus the way down to the root it stands on.
//
// Nothing here decides anything. The item already carries its answer and its
// coaching line; this only shows them.

export const PLAY_CSS = `
.ace-play{margin-top:.9rem}
.ace-play .ace-stem{font-size:.98rem;line-height:1.5;margin:0 0 .7rem}
.ace-play .ace-sub{display:flex;justify-content:center;padding:.4rem 0 .7rem}
.ace-play .ace-sub .ace-draw{display:block}
.ace-play .ace-sub svg{width:100%;height:auto;max-height:190px;display:block}
.ace-play .ace-opts{display:grid;gap:.45rem}
.ace-play .ace-opt{display:flex;align-items:center;gap:.6rem;width:100%;text-align:left;
  padding:.55rem .7rem;border:1px solid var(--rule,#d8d2c6);border-radius:.5rem;
  background:var(--card,#fff);color:inherit;font:inherit;cursor:pointer}
.ace-play .ace-opt:hover:not(:disabled){border-color:var(--gold,#c9a84c)}
.ace-play .ace-opt:disabled{cursor:default}
.ace-play .ace-opt .ace-key{flex:0 0 1.3rem;font-weight:700;opacity:.55}
.ace-play .ace-opt .ace-draw{flex:0 0 auto;width:150px;max-width:52%;display:block}
.ace-play .ace-opt .ace-draw svg{width:100%;height:auto;max-height:150px;display:block}
.ace-play .ace-opt .ace-words{flex:1 1 auto}
.ace-play .ace-opt.is-answer{border-color:#2e7d5b;background:rgba(46,125,91,.08)}
.ace-play .ace-opt.is-chosen{border-color:#9a6b1f;background:rgba(154,107,31,.08)}
.ace-play .ace-why{margin-top:.7rem;font-size:.93rem;line-height:1.5}
.ace-play .ace-why b{font-weight:700}
.ace-play .ace-down{margin-top:.5rem;font-size:.9rem}
.ace-play .ace-down a{color:var(--gold,#9a6b1f)}
.ace-play .ace-next{margin-top:.8rem;padding:.45rem .9rem;border:1px solid var(--rule,#d8d2c6);
  border-radius:.5rem;background:transparent;color:inherit;font:inherit;cursor:pointer}
.ace-play .ace-mine{font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;opacity:.55;margin-bottom:.35rem}
@media (max-width:620px){ .ace-play .ace-opt .ace-draw{max-width:64%} }
`;

let cssIn = false;
function injectCss(doc){
  if (cssIn) return;
  const s = doc.createElement('style'); s.textContent = PLAY_CSS;
  doc.head.appendChild(s); cssIn = true;
}

const KEYS = ['A', 'B', 'C', 'D', 'E'];

// The drawer fits each molecule to its own box, so a one-atom choice came out
// as tall as the stem while a five-carbon one shrank to nothing and the row
// read as a size comparison. Size every drawing so one bond is the same length
// on screen in all five.
const BOND_PX = 42, MIN_PX = 74, MAX_PX = 280;
function fitDrawing(box, svg, bondPx){
  if (!svg) return;
  const vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
  const bond = Number(svg.dataset && svg.dataset.bond) || 22;
  if (vb.length !== 4 || !isFinite(vb[2]) || !vb[2]) return;
  const px = Math.max(MIN_PX, Math.min(MAX_PX, vb[2] * (bondPx || BOND_PX) / bond));
  box.style.width = px + 'px';
}

/**
 * Render one item into a container.
 *  api      the shell api (el, drawSmiles, coach, report)
 *  item     Summit item shape: stem, sub, choices, correct, coach, trap, roots
 *  opts.next(       )   called when the student asks for another
 *  opts.badge           false when the surrounding block already says whose it is
 *  opts.rootHref(id)    where "the root under this" should point
 *  opts.rootName(id)    what to call that root
 */
export function playItem(container, api, item, opts = {}){
  injectCss(container.ownerDocument || document);
  const el = api.el;
  container.textContent = '';
  const wrap = el('div', { class: 'ace-play' });

  if (item.source === 'ace' && opts.badge !== false) wrap.append(el('div', { class: 'ace-mine', text: 'From Thomas' }));
  wrap.append(el('p', { class: 'ace-stem', text: item.stem }));

  if (item.sub && api.drawSmiles){
    const sub = el('div', { class: 'ace-sub' }), holder = el('span', { class: 'ace-draw' });
    sub.append(holder);
    try { fitDrawing(holder, api.drawSmiles(holder, item.sub), 48); } catch (e){ /* a drawing that will not draw is not worth losing the question over */ }
    wrap.append(sub);
  }

  const opts_ = el('div', { class: 'ace-opts' });
  const buttons = item.choices.map((c, i) => {
    const b = el('button', { class: 'ace-opt', type: 'button' }, el('span', { class: 'ace-key', text: KEYS[i] }));
    if (c.smiles && api.drawSmiles){
      const box = el('span', { class: 'ace-draw' });
      try { fitDrawing(box, api.drawSmiles(box, c.smiles)); } catch (e){ box.textContent = c.smiles; }
      b.append(box);
    } else {
      b.append(el('span', { class: 'ace-words', text: c.text || c.smiles || '' }));
    }
    b.addEventListener('click', () => answer(i));
    opts_.append(b);
    return b;
  });
  wrap.append(opts_);

  const why = el('div', { class: 'ace-why' });
  const down = el('div', { class: 'ace-down' });
  wrap.append(why, down);
  container.append(wrap);

  function answer(i){
    const ok = i === item.correct;
    buttons.forEach(b => { b.disabled = true; });
    buttons[item.correct].classList.add('is-answer');
    if (!ok) buttons[i].classList.add('is-chosen');
    why.append(el('b', { text: ok ? 'That is the one. ' : 'The answer is ' + KEYS[item.correct] + '. ' }),
               el('span', { text: item.coach || '' }));
    if (!ok && item.trap) why.append(el('span', { text: ' ' + item.trap }));
    if (!ok && (item.roots || []).length && opts.rootHref){
      const id = item.roots[0];
      down.append(el('span', { text: 'This one stands on ' }),
                  el('a', { href: opts.rootHref(id), text: opts.rootName ? opts.rootName(id) : id }),
                  el('span', { text: '. Go stand on it, then come back.' }));
    }
    api.report && api.report(ok);
    if (opts.next){
      const n = el('button', { class: 'ace-next', type: 'button', text: 'Another' });
      n.addEventListener('click', () => opts.next());
      wrap.append(n);
    }
  }

  return { wrap, answer };
}
