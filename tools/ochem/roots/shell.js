// The Roots of Organic: shell. Renders the map, each root's frame, progress
// and the roadmap. Modules only draw the visual and the you-try.
import * as THREE from '../../../shared/three.module.min.js';
import { LEVELS, ROOTS } from './registry.js';
import { rootsFor } from './route.js';
import { drawSmiles } from '../tree/draw.js';
import { aceItems, aceToItem } from '../bank/ace.js';
import { playItem } from '../bank/play.js';

const KEY = 'atDAT_ochemRoots_v1';
function load(){ try { const r = localStorage.getItem(KEY); const s = r ? JSON.parse(r) : null; return s && s.v === 1 ? s : { v: 1, roots: {} }; } catch (e){ return { v: 1, roots: {} }; } }
function save(s){ try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
const state = load();
function rec(id){ return state.roots[id] || (state.roots[id] = { tries: 0, firstTry: 0, run: 0, owned: false }); }
const sections = [];            // rendered root sections in teaching order: { id, el, meta, level }
let walkAt = -1;                // index into sections while walking, -1 = full page

// tiny seeded rng, reseedable
let _s = 12345;
function mulberry(){ _s |= 0; _s = _s + 0x6D2B79F5 | 0; let t = Math.imul(_s ^ _s >>> 15, 1 | _s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }

const colors = {};
for (const k of ['gold','goldhi','blue','coral','green','amber','grey','ink','ink2','ink3','bg','panel','line']) colors[k] = getComputedStyle(document.documentElement).getPropertyValue('--' + k).trim();
const reduced = (() => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e){ return false; } })();

function el(tag, attrs, ...children){
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})){
    if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v; else if (k === 'dataset') Object.assign(n.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v); else if (v != null) n.setAttribute(k, v);
  }
  for (const c of children.flat()) if (c != null) n.append(c.nodeType ? c : document.createTextNode(String(c)));
  return n;
}
function svg(tag, attrs, ...children){
  const n = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs || {})){
    if (k === 'text') n.textContent = v; else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v); else if (v != null) n.setAttribute(k, v);
  }
  for (const c of children.flat()) if (c != null) n.append(c.nodeType ? c : document.createTextNode(String(c)));
  return n;
}

export function makeApi(id, opts = {}){
  const coachEl = opts.coachEl;
  return {
    rng: mulberry, seed(n){ _s = n | 0; },
    pick(a){ return a[Math.floor(mulberry() * a.length)]; },
    shuffle(a){ const b = a.slice(); for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(mulberry() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; },
    colors, THREE: opts.needs3D ? THREE : null, el, svg, reduced,
    drawSmiles(target, smiles, o){ return drawSmiles(target, smiles, o); },
    ace: { items: aceItems, toItem: aceToItem },
    report(ok){ const r = rec(id); r.tries++; if (ok){ r.firstTry++; r.run++; } else r.run = 0; if (r.run >= 3) r.owned = true; save(state); opts.onReport && opts.onReport(r); },
    coach(t){ if (coachEl) coachEl.textContent = String(t || ''); },
    clearCoach(){ if (coachEl) coachEl.textContent = ''; }
  };
}

export function renderRoot(mod, container, index){
  const m = mod.meta, r = rec(m.id);
  const sec = el('section', { class: 'root', id: m.id });
  const head = el('div', { class: 'root-head' },
    el('div', {}, el('span', { class: 'eyebrow', text: `Level ${m.level} · Root ${index}` }), el('h2', { text: m.title }), el('p', { class: 'tagline', text: m.tagline })),
    el('span', { class: 'owned-badge', text: 'Owned', style: { display: r.owned ? '' : 'none' } }));
  sec.append(head, el('p', { class: 'story', text: m.story }));
  const visual = el('div', { class: 'visual' }); sec.append(visual);
  sec.append(el('div', { class: 'procedure' }, el('h3', { text: 'The move: ' + m.moveName }), el('ol', {}, (m.move || []).map(s => el('li', { text: s })))));
  const tryWrap = el('div', { class: 'try' }); const tryEl = el('div', {}); const coachEl = el('div', { class: 'coach' });
  tryWrap.append(el('span', { class: 'label eyebrow', text: 'You try it. Hand on the pen.' }), tryEl, coachEl); sec.append(tryWrap);
  sec.append(el('div', { class: 'trap' }, el('b', { text: 'Careful. ' }), m.trap.replace(/^Careful:\s*/i, '')));
  sec.append(el('div', { class: 'holds' }, 'Holds up:', (m.holdsUp || []).map(h => el('span', { text: h }))));
  if (m.drill) sec.append(el('p', { class: 'drill' }, el('b', { text: 'After you own it: ' }), m.drill));
  const foot = el('div', { class: 'root-foot' }); sec.append(foot);
  container.append(sec);
  sections.push({ id: m.id, el: sec, meta: m, foot });
  const api = makeApi(m.id, { needs3D: !!m.needs3D, coachEl, onReport(rr){ head.querySelector('.owned-badge').style.display = rr.owned ? '' : 'none'; refreshMap(); refreshWalkbar(); } });
  try { mod.mount({ visual, try: tryEl }, api); }
  catch (e){ visual.append(el('p', { class: 'missing-note', text: 'This visual hit a snag loading. The move and the trap above still stand.' })); console.error(m.id, e); }
  mountAceChecks(sec, m, api);
  return sec;
}

// Thomas's own questions for this root, if he has written any. They sit under
// the module's own you-try because they are the ones in his voice, and a miss
// on one names the root it stands on.
function mountAceChecks(sec, m, api){
  const mine = aceItems(m.id);
  if (!mine.length) return;
  const box = el('div', { class: 'try ace-block' },
    el('span', { class: 'label eyebrow', text: 'From Thomas. Same question, his words.' }));
  const slot = el('div', {}); box.append(slot);
  sec.insertBefore(box, sec.querySelector('.trap'));
  let n = Math.floor(Math.random() * mine.length);
  const show = () => playItem(slot, api, aceToItem(mine[n++ % mine.length]),
    { badge: false, next: mine.length > 1 ? show : null,
      rootHref: id => '#' + id,
      rootName: id => { const sc = sections.find(x => x.id === id); return sc ? sc.meta.concept || sc.meta.title : id; } });
  show();
}

const loaded = new Map();
function refreshMap(){
  for (const a of document.querySelectorAll('.map .roots a')){ const r = state.roots[a.dataset.id]; a.classList.toggle('owned', !!(r && r.owned)); a.classList.toggle('started', !!(r && r.tries > 0 && !r.owned)); }
}

export async function boot(){
  const map = document.getElementById('map'), body = document.getElementById('roots');
  // load every module first (missing ones are skipped)
  for (const id of ROOTS){ try { loaded.set(id, await import(`./roots/${id}.js`)); } catch (e){ loaded.set(id, null); } }
  // the map
  for (const L of LEVELS){
    const list = el('div', { class: 'roots' });
    ROOTS.filter(id => loaded.get(id) && loaded.get(id).meta.level === L.n).forEach(id => { const m = loaded.get(id).meta; list.append(el('a', { href: '#' + id, dataset: { id }, class: '' }, el('i', { class: 'pip' }), m.concept)); });
    ROOTS.filter(id => id.startsWith('l' + L.n) && !loaded.get(id)).forEach(id => list.append(el('a', { class: 'missing', dataset: { id }, href: '#' }, el('i', { class: 'pip' }), id.replace(/^l\d-/, '') + ' (being built)')));
    map.append(el('div', { class: 'lvl' }, el('span', { class: 'eyebrow', text: 'Level ' + L.n }), el('h3', { text: L.name }), el('p', { text: L.line }), list));
  }
  refreshMap();
  // the sections
  for (const L of LEVELS){
    body.append(el('div', { class: 'level', id: 'level-' + L.n }, el('span', { class: 'eyebrow', text: 'Level ' + L.n }), el('h2', { text: L.name }), el('p', { text: L.line })));
    let i = 0;
    for (const id of ROOTS){ const mod = loaded.get(id); if (!mod || mod.meta.level !== L.n) continue; renderRoot(mod, body, ++i); }
  }
  // continuity in the full page: each root points to the next one
  sections.forEach((sc, i) => {
    const nxt = sections[i + 1];
    if (nxt) sc.foot.append(el('a', { class: 'next-link', href: '#' + nxt.id, text: 'Next root: ' + nxt.meta.title }));
    sc.foot.append(el('button', { type: 'button', class: 'secondary walk-from', text: 'Walk from here', onclick: () => enterWalk(i) }));
  });
  buildWalkbar();
  arriveFromMiss();
  const hero = document.getElementById('start');
  if (hero){
    hero.append(el('button', { type: 'button', class: 'primary', text: 'Start at root one', onclick: () => enterWalk(0) }));
    const saved = state.walk && sections.findIndex(sc => sc.id === state.walk.at);
    if (saved != null && saved > 0) hero.append(el('button', { type: 'button', class: 'secondary', text: 'Continue at root ' + (saved + 1), onclick: () => enterWalk(saved) }));
    hero.append(el('span', { class: 'muted', text: 'or scroll the whole page' }));
  }
  if (location.hash === '#walk'){ const i = state.walk ? sections.findIndex(sc => sc.id === state.walk.at) : 0; enterWalk(Math.max(0, i)); }
  window.addEventListener('keydown', e => { if (walkAt < 0 || e.target.matches('input,textarea')) return; if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); if (e.key === 'Escape') exitWalk(); });
  window.OChemRoots = { version: '1.1.0', state, loaded: [...loaded.entries()].filter(([, m]) => m).map(([id]) => id), enterWalk, exitWalk, go, get walkAt(){ return walkAt; } };
}

/* ------------------------------------------------------------------ */
/* Arriving from a miss: ?from=<bank or topic>&subtopic=&miss=<text>&root=<id> */
/* ------------------------------------------------------------------ */
function arriveFromMiss(){
  const q = new URLSearchParams(location.search);
  const from = q.get('from') || '', missText = q.get('miss') || '', subtopic = q.get('subtopic') || '', forced = q.get('root') || '';
  if (!from && !missText && !subtopic && !forced) return;
  let hits = rootsFor({ topic: from, subtopic, text: missText }, 3);
  if (forced && sections.some(sc => sc.id === forced)){ hits = [{ id: forced, concept: sections.find(sc => sc.id === forced).meta.concept, reason: hits.find(h => h.id === forced) ? hits.find(h => h.id === forced).reason : 'This is the root your coach pointed you to.' }].concat(hits.filter(h => h.id !== forced)); }
  hits = hits.filter(h => sections.some(sc => sc.id === h.id));
  if (!hits.length) return;
  const banner = el('section', { class: 'arrive' },
    el('span', { class: 'eyebrow', text: 'From your miss' + (from ? ' · ' + from : '') }),
    el('h2', { text: hits.length > 1 ? 'That question is standing on these roots.' : 'That question is standing on this root.' }),
    missText ? el('p', { class: 'arrive-miss', text: '"' + missText.slice(0, 200) + (missText.length > 200 ? '...' : '') + '"' }) : null,
    el('div', { class: 'arrive-list' }, hits.map((h, i) => {
      const idx = sections.findIndex(sc => sc.id === h.id);
      return el('div', { class: 'arrive-item' + (i === 0 ? ' first' : '') },
        el('div', {}, el('b', { text: (i === 0 ? 'Start here: ' : 'Then: ') + h.concept }), el('p', { text: h.reason })),
        el('div', { class: 'arrive-actions' },
          el('button', { type: 'button', class: i === 0 ? 'primary' : 'secondary', text: i === 0 ? 'Fix this root' : 'Open', onclick: () => enterWalk(idx) })));
    })),
    el('p', { class: 'muted', text: 'Fix the root and the question fixes itself. Then go back and redo the miss.' }));
  const map = document.getElementById('map');
  map.parentNode.insertBefore(banner, map);
  refreshMap();
}

/* ------------------------------------------------------------------ */
/* Walk mode: one root at a time, a progress bar, next and previous.    */
/* ------------------------------------------------------------------ */
let walkbar = null;
function buildWalkbar(){
  walkbar = el('div', { class: 'walkbar', hidden: '' },
    el('div', { class: 'walkbar-in' },
      el('button', { type: 'button', class: 'walk-exit', text: 'All roots', onclick: exitWalk }),
      el('div', { class: 'walk-title' }, el('span', { class: 'walk-where' }), el('span', { class: 'walk-name' })),
      el('div', { class: 'pips' }, sections.map((sc, i) => el('button', { type: 'button', class: 'pip', title: sc.meta.concept, 'aria-label': 'Root ' + (i + 1) + ', ' + sc.meta.concept, onclick: () => showWalk(i) })))));
  document.body.prepend(walkbar);
  const nav = el('div', { class: 'walknav', hidden: '' },
    el('button', { type: 'button', class: 'secondary', text: 'Previous', onclick: () => go(-1) }),
    el('span', { class: 'walk-count' }),
    el('button', { type: 'button', class: 'primary', text: 'Next root', onclick: () => go(1) }));
  document.getElementById('roots').append(nav); walkbar.nav = nav;
}
function refreshWalkbar(){
  if (!walkbar) return;
  walkbar.querySelectorAll('.pip').forEach((p, i) => { const r = state.roots[sections[i].id]; p.classList.toggle('owned', !!(r && r.owned)); p.classList.toggle('started', !!(r && r.tries > 0 && !r.owned)); p.classList.toggle('now', i === walkAt); });
}
export function enterWalk(i){ document.body.classList.add('walk'); walkbar.hidden = false; walkbar.nav.hidden = false; showWalk(i); }
export function exitWalk(){
  const cur = sections[walkAt]; walkAt = -1;
  document.body.classList.remove('walk'); walkbar.hidden = true; walkbar.nav.hidden = true;
  sections.forEach(sc => sc.el.classList.remove('current'));
  history.replaceState(null, '', location.pathname + (cur ? '#' + cur.id : ''));
  if (cur) cur.el.scrollIntoView({ block: 'start' });
  window.dispatchEvent(new Event('resize'));
}
export function go(d){ showWalk(Math.min(sections.length - 1, Math.max(0, walkAt + d))); }
function showWalk(i){
  walkAt = i;
  sections.forEach((sc, k) => sc.el.classList.toggle('current', k === i));
  const sc = sections[i];
  walkbar.querySelector('.walk-where').textContent = 'Root ' + (i + 1) + ' of ' + sections.length + ' · Level ' + sc.meta.level;
  walkbar.querySelector('.walk-name').textContent = sc.meta.concept;
  walkbar.nav.querySelector('.walk-count').textContent = (i + 1) + ' / ' + sections.length;
  walkbar.nav.querySelector('.primary').textContent = i === sections.length - 1 ? 'Finish: what comes after' : 'Next root';
  walkbar.nav.querySelector('.primary').onclick = i === sections.length - 1 ? () => { exitWalk(); document.getElementById('after').scrollIntoView({ block: 'start' }); } : () => go(1);
  walkbar.nav.querySelector('.secondary').disabled = i === 0;
  state.walk = { at: sc.id }; save(state);
  refreshWalkbar();
  history.replaceState(null, '', location.pathname + '#walk');
  window.scrollTo({ top: 0 });
  window.dispatchEvent(new Event('resize'));   // 3D modules resize their canvases to the now-visible slot
}
