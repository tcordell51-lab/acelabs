// The Tree of Organic: shell for the tiers above the roots. Same frame as
// the Roots page (story, visual, move, you try, trap, holds up) plus two
// things the tiers need: a SMILES renderer handed to modules through the api
// (api.drawSmiles) and a standard item shape (makeItem) the Summit draws on.
import * as THREE from '../../../shared/three.module.min.js';
import { LEVELS, MODULES } from './registry.js';
import { rootsFor } from '../roots/route.js';
import * as RX from './shared/reactions.js';
import { GROUP_MAP, bankItems, bankToItem } from './shared/bank-map.js';
import { drawSmiles } from './draw.js';
import { makeStage, STAGE_CSS, tetraAround, unit, sub as vsub, vadd, vmul } from './stage3d.js';

const KEY = 'atDAT_ochemTree_v1';
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

export { drawSmiles };
let _stageCss = false;
function injectStageCss(){
  if (_stageCss || typeof document === 'undefined') return;
  _stageCss = true;
  const st = document.createElement('style'); st.id = 's3d-style'; st.textContent = STAGE_CSS; document.head.append(st);
}

export function makeApi(id, opts = {}){
  const coachEl = opts.coachEl;
  return {
    rng: mulberry, seed(n){ _s = n | 0; },
    pick(a){ return a[Math.floor(mulberry() * a.length)]; },
    shuffle(a){ const b = a.slice(); for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(mulberry() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; },
    colors, THREE: opts.needs3D ? THREE : null, el, svg, reduced,
    drawSmiles(target, smiles, o){ return drawSmiles(target, smiles, o); },
    // A three-dimensional stage, for the questions where a flat drawing lies.
    // Only handed out when the module declares needs3D, since it loads Three.js.
    stage3d(o){ if (!opts.needs3D) throw new Error('declare needs3D in meta to use api.stage3d'); injectStageCss(); return makeStage(this, o); },
    geom: { tetraAround, unit, sub: vsub, add: vadd, mul: vmul },
    reactions: { REACTIONS: RX.REACTIONS, SUBSTRATES: RX.SUBSTRATES, FAMILIES: RX.FAMILIES, byFamily: RX.byFamily, siblings: RX.siblings, find: RX.find },
    bank: { items: bankItems, toItem: bankToItem, GROUP_MAP },
    report(ok){ const r = rec(id); r.tries++; if (ok){ r.firstTry++; r.run++; } else r.run = 0; if (r.run >= 3) r.owned = true; save(state); opts.onReport && opts.onReport(r); },
    coach(t){ if (coachEl) coachEl.textContent = String(t || ''); },
    clearCoach(){ if (coachEl) coachEl.textContent = ''; }
  };
}

export function renderRoot(mod, container, index){
  const m = mod.meta, r = rec(m.id);
  const sec = el('section', { class: 'root', id: m.id });
  const TIER = { 4: 'Trunk', 5: 'Branch', 6: 'Canopy', 7: 'Evidence' };
  const head = el('div', { class: 'root-head' },
    el('div', {}, el('span', { class: 'eyebrow', text: `Level ${m.level} · ${TIER[m.level] || 'Module'} ${index}` }), el('h2', { text: m.title }), el('p', { class: 'tagline', text: m.tagline })),
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
  return sec;
}

const loaded = new Map();
function refreshMap(){
  for (const a of document.querySelectorAll('.map .roots a')){ const r = state.roots[a.dataset.id]; a.classList.toggle('owned', !!(r && r.owned)); a.classList.toggle('started', !!(r && r.tries > 0 && !r.owned)); }
}

export async function boot(){
  const map = document.getElementById('map'), body = document.getElementById('roots');
  // load every module first (missing ones are skipped)
  for (const id of MODULES){ try { loaded.set(id, await import(`./modules/${id}.js`)); } catch (e){ loaded.set(id, null); } }
  // the map
  for (const L of LEVELS){
    const list = el('div', { class: 'roots' });
    MODULES.filter(id => loaded.get(id) && loaded.get(id).meta.level === L.n).forEach(id => { const m = loaded.get(id).meta; list.append(el('a', { href: '#' + id, dataset: { id }, class: '' }, el('i', { class: 'pip' }), m.concept)); });
    // ids are <letter><level>-<name>, so a module belongs to this level when the digit matches
    MODULES.filter(id => !loaded.get(id) && id.slice(1).startsWith(String(L.n))).forEach(id => list.append(el('a', { class: 'missing', dataset: { id }, href: '#' }, el('i', { class: 'pip' }), id.replace(/^[a-z]\d-/, '') + ' (being built)')));
    map.append(el('div', { class: 'lvl' }, el('span', { class: 'eyebrow', text: 'Level ' + L.n }), el('h3', { text: L.name }), el('p', { text: L.line }), list));
  }
  refreshMap();
  // the sections
  for (const L of LEVELS){
    body.append(el('div', { class: 'level', id: 'level-' + L.n }, el('span', { class: 'eyebrow', text: 'Level ' + L.n }), el('h2', { text: L.name }), el('p', { text: L.line })));
    let i = 0;
    for (const id of MODULES){ const mod = loaded.get(id); if (!mod || mod.meta.level !== L.n) continue; renderRoot(mod, body, ++i); }
  }
  // continuity in the full page: each root points to the next one
  sections.forEach((sc, i) => {
    const nxt = sections[i + 1];
    if (nxt) sc.foot.append(el('a', { class: 'next-link', href: '#' + nxt.id, text: 'Next: ' + nxt.meta.title }));
    sc.foot.append(el('button', { type: 'button', class: 'secondary walk-from', text: 'Work from here', onclick: () => enterWalk(i) }));
  });
  buildWalkbar();
  const hero = document.getElementById('start');
  if (hero){
    hero.append(el('button', { type: 'button', class: 'primary', text: 'Start at the trunk', onclick: () => enterWalk(0) }));
    const saved = state.walk && sections.findIndex(sc => sc.id === state.walk.at);
    if (saved != null && saved > 0) hero.append(el('button', { type: 'button', class: 'secondary', text: 'Continue at module ' + (saved + 1), onclick: () => enterWalk(saved) }));
    hero.append(el('span', { class: 'muted', text: 'or scroll the whole page' }));
  }
  if (location.hash === '#walk'){ const i = state.walk ? sections.findIndex(sc => sc.id === state.walk.at) : 0; enterWalk(Math.max(0, i)); }
  window.addEventListener('keydown', e => { if (walkAt < 0 || e.target.matches('input,textarea')) return; if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); if (e.key === 'Escape') exitWalk(); });
  window.OChemTree = { version: '1.0.0', state, loaded: [...loaded.entries()].filter(([, m]) => m).map(([id]) => id), enterWalk, exitWalk, go, get walkAt(){ return walkAt; } };
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
      el('div', { class: 'pips' }, sections.map((sc, i) => el('button', { type: 'button', class: 'pip', title: sc.meta.concept, 'aria-label': 'Module ' + (i + 1) + ', ' + sc.meta.concept, onclick: () => showWalk(i) })))));
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
  walkbar.querySelector('.walk-where').textContent = 'Module ' + (i + 1) + ' of ' + sections.length + ' · Level ' + sc.meta.level;
  walkbar.querySelector('.walk-name').textContent = sc.meta.concept;
  walkbar.nav.querySelector('.walk-count').textContent = (i + 1) + ' / ' + sections.length;
  walkbar.nav.querySelector('.primary').textContent = i === sections.length - 1 ? 'Finish: the summit' : 'Next module';
  walkbar.nav.querySelector('.primary').onclick = i === sections.length - 1 ? () => { exitWalk(); const a = document.getElementById('after'); if (a) a.scrollIntoView({ block: 'start' }); } : () => go(1);
  walkbar.nav.querySelector('.secondary').disabled = i === 0;
  state.walk = { at: sc.id }; save(state);
  refreshWalkbar();
  history.replaceState(null, '', location.pathname + '#walk');
  window.scrollTo({ top: 0 });
  window.dispatchEvent(new Event('resize'));   // 3D modules resize their canvases to the now-visible slot
}
