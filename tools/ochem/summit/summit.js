// The Summit: a thirty-question organic section, untimed first, then timed.
// Certifies only a perfect timed section. Every miss routes to the module
// and the root it stands on, and the misses can be redone until clean.
import { MODULES } from '../tree/registry.js';
import * as RX from '../tree/shared/reactions.js';
import { GROUP_MAP, bankToItem } from '../tree/shared/bank-map.js';
import { drawSmiles } from '../tree/draw.js';
import { buildSection, rootsOf } from './build.js';

const KEY = 'atDAT_ochemSummit_v1';
const TIMED_SECONDS = 27 * 60;           // thirty questions at the DAT's pace for the sciences
const TIMED_UNLOCK = 27;                 // untimed score that opens the timed summit
function load(){ try { const r = localStorage.getItem(KEY); const s = r ? JSON.parse(r) : null; return s && s.v === 1 ? s : { v: 1, attempts: [], certified: null }; } catch (e){ return { v: 1, attempts: [], certified: null }; } }
function save(s){ try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
const state = load();

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
const $ = id => document.getElementById(id);
const LETTERS = 'ABCDE';
const HOME_ROOTS = {};   // filled from GROUP_MAP as a fallback
for (const g of Object.values(GROUP_MAP)) HOME_ROOTS[g.module] = HOME_ROOTS[g.module] || g.roots;

/* ------------------------------------------------------------------ */
/* Sources                                                              */
/* ------------------------------------------------------------------ */
const makers = {};
async function loadMakers(){
  for (const id of MODULES){ try { const m = await import(`../tree/modules/${id}.js`); if (typeof m.makeItem === 'function') makers[id] = m.makeItem; } catch (e){} }
  return Object.keys(makers).length;
}
function bankPool(){ return ((window.OCHEM_DB) || []).filter(it => GROUP_MAP[it.group] && it.keep !== false && it.scope_ok !== false && it.smiles_valid !== false).map(bankToItem); }
const baseApi = { reactions: { REACTIONS: RX.REACTIONS, SUBSTRATES: RX.SUBSTRATES, FAMILIES: RX.FAMILIES, byFamily: RX.byFamily, siblings: RX.siblings, find: RX.find }, bank: { items: (w) => bankPool().filter(it => it.home === w || it.group === w), toItem: bankToItem, GROUP_MAP }, reduced: false };

/* ------------------------------------------------------------------ */
/* Intro                                                                */
/* ------------------------------------------------------------------ */
function bestUntimed(){ return Math.max(0, ...state.attempts.filter(a => a.mode === 'untimed').map(a => a.score)); }
function timedOpen(){ return bestUntimed() >= TIMED_UNLOCK; }
function lastMisses(){ const a = state.attempts.slice().reverse().find(x => x.misses && x.misses.length); return a ? a.misses : []; }

function renderIntro(){
  $('intro').hidden = false; $('section').hidden = true; $('results').hidden = true;
  const modes = $('modes'); modes.textContent = '';
  modes.append(el('div', { class: 'mode' }, el('h3', { text: 'Untimed section' }), el('p', { text: 'Thirty questions, no clock. Accuracy first. This is where you find the moves that are not yours yet.' }), el('button', { type: 'button', class: 'primary', text: 'Start untimed', onclick: () => start('untimed') })));
  const t = el('div', { class: 'mode' }, el('h3', { text: 'The timed summit' }), el('p', { text: 'Thirty questions in twenty-seven minutes, the pace of the real sciences section. A perfect timed section is the summit.' }));
  if (timedOpen()) t.append(el('button', { type: 'button', class: 'primary', text: 'Start timed', onclick: () => start('timed') }));
  else t.append(el('span', { class: 'locked', text: `Opens after an untimed section of ${TIMED_UNLOCK} or better. Best so far: ${bestUntimed()} of 30.` }));
  modes.append(t);
  const m = lastMisses();
  if (m.length) modes.append(el('div', { class: 'mode' }, el('h3', { text: 'Redo the misses' }), el('p', { text: `${m.length} from your last section, untimed, until every one is clean.` }), el('button', { type: 'button', class: 'secondary', text: 'Redo ' + m.length, onclick: () => start('redo', m) })));
  const h = $('history'); h.textContent = '';
  if (state.certified) h.append(el('div', { class: 'summit' }, el('h2', { text: 'The summit. Thirty of thirty, timed.' }), el('p', { text: 'Reached ' + new Date(state.certified).toLocaleDateString() + '. Keep it warm: a section a week keeps the moves automatic.' })));
  if (state.attempts.length){
    const rows = state.attempts.slice(-10).reverse().map(a => el('tr', {}, el('td', { text: new Date(a.date).toLocaleDateString() }), el('td', { text: a.mode }), el('td', { class: 'gold', text: a.score + ' / ' + a.total }), el('td', { text: (a.misses || []).map(x => x.area).filter((v, i, arr) => arr.indexOf(v) === i).join(', ') || 'none' })));
    h.append(el('div', { class: 'hist' }, el('span', { class: 'eyebrow', text: 'Your sections' }), el('table', {}, el('thead', {}, el('tr', {}, el('th', { text: 'Date' }), el('th', { text: 'Mode' }), el('th', { text: 'Score' }), el('th', { text: 'Missed areas' }))), el('tbody', {}, rows))));
  }
}

/* ------------------------------------------------------------------ */
/* The section                                                          */
/* ------------------------------------------------------------------ */
let run = null;
function start(mode, redoItems){
  const seed = 1000 + Math.floor(Math.random() * 900000);
  let items;
  if (mode === 'redo') items = redoItems.map((it, i) => Object.assign({}, it, { n: i + 1 }));
  else items = buildSection({ seed, makers, bank: bankPool(), api: baseApi }).items;
  run = { mode, seed, items, at: 0, answers: {}, flags: new Set(), t0: performance.now(), left: mode === 'timed' ? TIMED_SECONDS : null, timer: null };
  $('intro').hidden = true; $('results').hidden = true; $('section').hidden = false;
  renderSection();
  if (mode === 'timed') run.timer = setInterval(tick, 1000);
  window.scrollTo({ top: 0 });
}
function tick(){ if (!run || run.left == null) return; run.left--; const t = document.querySelector('.bar .time'); if (t) t.textContent = fmt(run.left); if (run.left <= 0){ clearInterval(run.timer); finish(true); } }
function fmt(s){ s = Math.max(0, s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

function renderSection(){
  const sec = $('section'); sec.textContent = '';
  const bar = el('div', { class: 'bar' },
    el('span', { class: 'where', text: (run.mode === 'redo' ? 'Redo' : run.mode === 'timed' ? 'Timed' : 'Untimed') + ' · question ' + (run.at + 1) + ' of ' + run.items.length }),
    el('div', { class: 'grid' }, run.items.map((it, i) => el('button', { type: 'button', text: String(i + 1), class: (run.answers[i] != null ? 'done ' : '') + (run.flags.has(i) ? 'flag ' : '') + (i === run.at ? 'now' : ''), onclick: () => { run.at = i; renderSection(); } }))),
    el('span', { class: 'time', text: run.left != null ? fmt(run.left) : 'no clock' }));
  sec.append(bar);
  const it = run.items[run.at];
  const card = el('div', { class: 'item' });
  card.append(el('span', { class: 'eyebrow', text: it.area + (it.source === 'bank' ? ' · verified bank' : ' · generated') }));
  card.append(el('p', { class: 'stem', text: it.stem }));
  if (it.sub || it.reagent || it.prod){
    const fig = el('div', { class: 'figure' });
    if (it.sub){ const b = el('div', { class: 'box' }); drawSmiles(b, it.sub, { width: 240, height: 150, label: 'starting material' }); fig.append(b); }
    if (it.reagent) fig.append(el('div', { class: 'arrow' }, el('span', { class: 'reagent', text: it.reagent }), el('div', { class: 'line' })));
    if (it.prod){ const b = el('div', { class: 'box' }); drawSmiles(b, it.prod, { width: 240, height: 150, label: 'product' }); fig.append(b); }
    card.append(fig);
  }
  const opts = el('div', { class: 'opts' });
  it.choices.forEach((c, i) => {
    const o = el('button', { type: 'button', class: 'opt' + (c.smiles ? ' struct' : '') + (run.answers[run.at] === i ? ' picked' : ''), onclick: () => { run.answers[run.at] = i; renderSection(); } }, el('span', { class: 'k', text: LETTERS[i] }));
    if (c.smiles){ const holder = el('span', {}); drawSmiles(holder, c.smiles, { width: 220, height: 130, label: 'choice ' + LETTERS[i] }); o.append(holder); if (c.text) o.append(el('span', { text: c.text })); }
    else o.append(el('span', { text: c.text }));
    opts.append(o);
  });
  card.append(opts);
  const unanswered = run.items.filter((x, i) => run.answers[i] == null).length;
  const nav = el('div', { class: 'nav2' },
    el('button', { type: 'button', class: 'secondary', text: 'Previous', disabled: run.at === 0 ? '' : null, onclick: () => { run.at--; renderSection(); } }),
    el('button', { type: 'button', class: 'secondary flagbtn', 'aria-pressed': String(run.flags.has(run.at)), text: 'Mark for review', onclick: () => { run.flags.has(run.at) ? run.flags.delete(run.at) : run.flags.add(run.at); renderSection(); } }),
    run.at < run.items.length - 1 ? el('button', { type: 'button', class: 'primary', text: 'Next', onclick: () => { run.at++; renderSection(); } }) : null,
    el('span', { style: { flex: '1' } }),
    el('button', { type: 'button', class: run.at === run.items.length - 1 ? 'primary' : 'secondary', text: 'Submit section', onclick: () => confirmSubmit(unanswered) }));
  card.append(nav);
  const note = el('div', { class: 'coach', id: 'submitNote' }); card.append(note);
  sec.append(card);
}
function confirmSubmit(unanswered){
  const note = $('submitNote');
  if (!unanswered) return finish(false);
  note.textContent = ''; note.append(unanswered + ' unanswered. Submit anyway, or go back and answer them. ', el('button', { type: 'button', class: 'secondary', text: 'Submit anyway', onclick: () => finish(false), style: { marginLeft: '8px' } }));
}

/* ------------------------------------------------------------------ */
/* Results and the debrief                                              */
/* ------------------------------------------------------------------ */
function finish(timeUp){
  if (run.timer) clearInterval(run.timer);
  const items = run.items;
  const misses = [];
  let score = 0;
  items.forEach((it, i) => { if (run.answers[i] === it.correct) score++; else misses.push(Object.assign({}, it, { picked: run.answers[i] })); });
  const areas = {}; for (const it of items){ areas[it.area] = areas[it.area] || { n: 0, ok: 0 }; areas[it.area].n++; if (run.answers[items.indexOf(it)] === it.correct) areas[it.area].ok++; }
  const attempt = { seed: run.seed, mode: run.mode, score, total: items.length, date: Date.now(), timeUp: !!timeUp, misses: misses.map(m => ({ stem: m.stem, sub: m.sub, reagent: m.reagent, prod: m.prod, choices: m.choices, correct: m.correct, coach: m.coach, home: m.home, roots: rootsOf(m, HOME_ROOTS), area: m.area, source: m.source, picked: m.picked })), areas };
  state.attempts.push(attempt); state.attempts = state.attempts.slice(-50);
  if (run.mode === 'timed' && score === items.length && items.length >= 30 && !state.certified) state.certified = Date.now();
  save(state);
  renderResults(attempt, timeUp);
}
function renderResults(a, timeUp){
  $('section').hidden = true; $('results').hidden = false;
  const r = $('results'); r.textContent = '';
  r.append(el('span', { class: 'eyebrow', text: (a.mode === 'redo' ? 'Redo' : a.mode) + ' section' + (timeUp ? ' · time called' : '') }));
  r.append(el('div', { class: 'score' }, String(a.score), el('small', { text: ' of ' + a.total })));
  if (a.score === a.total && a.mode === 'timed' && a.total >= 30) r.append(el('div', { class: 'summit' }, el('h2', { text: 'The summit. Thirty of thirty, timed.' }), el('p', { text: 'That is a perfect organic section at test pace. Keep it warm with a section a week.' })));
  else if (a.score === a.total && a.total >= 30) r.append(el('div', { class: 'summit' }, el('h2', { text: 'Perfect, untimed.' }), el('p', { text: 'Every move is yours. Now do it against the clock: the timed summit is open.' })));
  else if (a.score === a.total) r.append(el('div', { class: 'summit' }, el('h2', { text: 'Clean.' }), el('p', { text: 'Every one of those is yours now. Take a fresh section.' })));
  else r.append(el('p', { class: 'lede', text: `Not yet. ${a.total - a.score} to fix, and every one of them is standing on a move you can rebuild in a few minutes. The list below is the plan.` }));
  r.append(el('div', { class: 'areas' }, Object.entries(a.areas).map(([k, v]) => el('div', { class: 'area' }, el('b', { text: v.ok + '/' + v.n }), el('span', { text: k })))));
  if (a.misses.length){
    r.append(el('h2', { style: { fontFamily: 'var(--serif)', fontWeight: 400, fontSize: '26px', margin: '22px 0 6px' }, text: 'The debrief' }));
    for (const m of a.misses){
      const card = el('div', { class: 'miss' });
      card.append(el('span', { class: 'eyebrow', text: m.area + ' · ' + (m.home === 'roots' ? 'a root' : m.home) }));
      card.append(el('p', { style: { margin: '0 0 8px', fontSize: '16px' }, text: m.stem }));
      if (m.sub){ const b = el('div', { class: 'box', style: { display: 'inline-block' } }); drawSmiles(b, m.sub, { width: 200, height: 120 }); card.append(b); }
      const yours = m.picked != null ? m.choices[m.picked] : null, right = m.choices[m.correct];
      const cmp = el('div', { class: 'figure', style: { marginTop: '8px' } });
      const show = (label, c, good) => { const wrap = el('div', {}, el('span', { class: 'eyebrow', text: label })); if (c && c.smiles){ const b = el('div', { class: 'box', style: { borderColor: good ? 'var(--good)' : 'var(--line)' } }); drawSmiles(b, c.smiles, { width: 200, height: 120 }); wrap.append(b); } else wrap.append(el('p', { style: { margin: '2px 0 0', color: good ? 'var(--good)' : 'var(--ink2)' }, text: c ? c.text : 'left blank' })); return wrap; };
      cmp.append(show('You picked', yours, false), show('The answer', right, true)); card.append(cmp);
      card.append(el('p', { class: 'coach', text: m.coach }));
      const roots = m.roots || [];
      const fix = el('div', { class: 'fix' });
      if (m.home && m.home !== 'roots') fix.append(el('a', { href: '../tree/#' + m.home, text: 'Rebuild the move' }));
      roots.slice(0, 2).forEach((rt, i) => { const q = new URLSearchParams({ from: 'The Summit', miss: m.stem.slice(0, 200), root: rt }); fix.append(el('a', { class: 'root', href: '../roots/?' + q.toString() + '#' + rt, text: (i === 0 ? 'Fix the root' : 'Also') })); });
      card.append(fix); r.append(card);
    }
  }
  const actions = el('div', { class: 'actions', style: { marginTop: '18px' } });
  if (a.misses.length) actions.append(el('button', { type: 'button', class: 'primary', text: 'Redo the misses', onclick: () => start('redo', a.misses) }));
  actions.append(el('button', { type: 'button', class: 'secondary', text: 'New section', onclick: renderIntro }));
  r.append(actions);
  window.scrollTo({ top: 0 });
}

/* ------------------------------------------------------------------ */
const n = await loadMakers();
window.OChemSummit = { version: '1.0.0', state, makers: Object.keys(makers), start, buildSection: (seed) => buildSection({ seed, makers, bank: bankPool(), api: baseApi }), get run(){ return run; } };
renderIntro();
