// preview.js: the explainer preview, for screenshots and Thomas's sign-off.
// Ported from the pilot preview (question-system/preview/app.js). One
// DAT-style question screen (per the interface study: Question x of N upper
// left, buttons along the bottom, Exhibit in the sciences, Calculator in QR),
// untimed, with a Check step that opens the explainer and its picture.
//
//   preview.html                      every built explainer, by batch
//   preview.html?qid=fm:bio:BIO_g011  one question with its preview pick checked
//     &state=fresh                    unanswered
//     &pick=<choice text or 1-5>      check another pick
//     &coach=1                        the sign-off panel (flags, gates, families, bank text)
//   preview.html?q=BIO-1              the same, by the batch's own short id
//
// The page reads what the player will read: content/explainers/ (section
// index, sidecar, trap families). The question itself, the flags and the gate
// results come from the coach records in docs/explainers/, which are never
// published (/docs/* is force-redirected), so this page works on a local
// server only. Like the player, it runs the guard (key text, stem hash, choice
// texts) and checks the sidecar checksum against the index before it shows
// an explainer; the student view falls back to the bank's own explanation
// when the guard fails or the item is not published.
import { render, drawChoiceStructure, highlightBars, patQuestion, catalogGaps } from './visuals/index.js';
import { h } from './visuals/core.js';

const ROOT = new URL('../../', import.meta.url);
const CONTENT = new URL('content/explainers/', ROOT);
const DOCS = new URL('docs/explainers/', ROOT);
const LABS = new URL('./', ROOT).href;
const LET = 'ABCDE';
const SECTION = { bio: 'Survey of the Natural Sciences', gc: 'Survey of the Natural Sciences', ochem: 'Survey of the Natural Sciences', qr: 'Quantitative Reasoning', pat: 'Perceptual Ability', rc: 'Reading Comprehension' };
const SUBJECT = { bio: 'Biology', gc: 'General Chemistry', ochem: 'Organic Chemistry', qr: 'Quantitative Reasoning', pat: 'Perceptual Ability', rc: 'Reading Comprehension' };
const STATED_PICK = 'You found it in the passage, so on an EXCEPT question it is one to cross off.';
const params = new URLSearchParams(location.search);
const KEY_PREFIX = 'ace-explain-preview:';
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(KEY_PREFIX + k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(KEY_PREFIX + k, JSON.stringify(v)); } catch (e) { /* private mode: fine */ } }
};
let FAM = {};

/* ------------------------------------------------------------- helpers */
async function getText(url) { const r = await fetch(url, { cache: 'no-store' }); if (!r.ok) throw new Error(r.status + ' ' + url); return r.text(); }
async function getJson(url) { const t = await getText(url); try { return JSON.parse(t); } catch (e) { throw new Error('not JSON: ' + url); } }
async function digest(alg, text) { const b = await crypto.subtle.digest(alg, new TextEncoder().encode(text)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join(''); }
const norm = (s) => String(s).replace(/\s+/g, ' ').trim();
const stemHash = (stem, choices) => digest('SHA-1', norm(stem) + '\n' + choices.map(norm).sort().join('\n'));
const famName = (c) => (FAM[c.family] || {}).name || c.family;

// Display markup: the source stays plain ASCII; x^2, 10^-5, [A^-] and K_a are
// typeset here (superscript and subscript) at display time.
const MARK = /([A-Za-z0-9\])])\^(\{[^}]+\}|[+-]?[0-9A-Za-z.]*[0-9A-Za-z+-])|([A-Za-z\])])_(\{[^}]+\}|[A-Za-z0-9]+)/g;
function rich(text) {
  const frag = document.createDocumentFragment(), str = String(text == null ? '' : text);
  let last = 0, m;
  MARK.lastIndex = 0;
  while ((m = MARK.exec(str))) {
    const base = m[1] || m[3], mark = (m[2] || m[4]).replace(/^\{|\}$/g, '');
    frag.append(str.slice(last, m.index) + base);
    frag.append(h(m[2] ? 'sup' : 'sub', { text: mark }));
    last = m.index + m[0].length;
  }
  frag.append(str.slice(last));
  return frag;
}
function url(qid, extra = {}) {
  const p = new URLSearchParams();
  if (qid) p.set('qid', qid);
  if (params.get('coach')) p.set('coach', '1');
  for (const [k, v] of Object.entries(extra)) if (v != null) p.set(k, v);
  return '?' + p.toString();
}

/* ------------------------------------------------------------------ index */
function indexPage(ix) {
  document.body.className = 'is-index';
  const root = document.getElementById('app');
  const items = Object.entries(ix.items);
  const pass = items.filter(([, x]) => x.pass).length, pub = items.filter(([, x]) => x.published).length;
  root.append(h('header', { class: 'ix-head' },
    h('div', { class: 'ix-brand' }, h('span', { class: 'ix-mark', text: 'AD' }), h('div', {}, h('h1', { text: 'Explainer preview' }), h('p', { text: 'Every built explainer, by batch, on the DAT-style question screen. Student view, sign-off view, or unanswered. Drafts until Thomas approves them.' })))));
  root.append(h('p', { class: 'ix-gate', text: 'Build gates: ' + pass + ' of ' + items.length + ' pass; ' + pub + ' published sidecars. Run npm run explainers:check for the render gates.' }));
  for (const [bid, b] of Object.entries(ix.batches)) {
    root.append(h('h2', { class: 'ix-batch', text: b.title + ' (' + bid + ', ' + b.qids.length + ' items)' }));
    const grid = h('div', { class: 'ix-grid' });
    b.qids.forEach((qid) => {
      const r = ix.items[qid]; if (!r) return;
      grid.append(h('article', { class: 'ix-card ix-' + r.section },
        h('div', { class: 'ix-top' }, h('b', { text: r.pid }), h('span', { text: SUBJECT[r.section] }), h('span', { class: 'ix-pass' + (r.pass ? '' : ' bad'), text: r.pass ? (r.published ? 'gates pass, ' + r.status : r.status) : 'gates: issues' })),
        h('p', { class: 'ix-stem', text: r.stem }),
        h('dl', {}, h('dt', { text: 'qid' }), h('dd', { text: qid }), h('dt', { text: 'Subtopic' }), h('dd', { text: r.subtopic }), h('dt', { text: 'Visual' }), h('dd', { text: r.visual }), h('dt', { text: 'Source' }), h('dd', { text: r.servedAs })),
        h('div', { class: 'ix-links' }, h('a', { href: url(qid), text: 'Student view' }), h('a', { href: '?qid=' + encodeURIComponent(qid) + '&coach=1', text: 'Sign-off view' }), h('a', { href: url(qid, { state: 'fresh' }), text: 'Unanswered' }))));
    });
    root.append(grid);
  }
}

/* ------------------------------------------------------- load one question */
async function loadQuestion(ix, qid) {
  const item = ix.items[qid];
  if (!item) throw new Error('No explainer built for ' + qid + '. Aliases open from the record they serve.');
  const coach = await getJson(new URL(item.file, DOCS));
  const s = coach.served, x = s.extra || {};
  const served = { stem: s.stem, choices: s.choices, key: s.keyIndex, why: s.bankWhy, figure: x.figure || null, qs: x.qs || null, os: !!x.os, patItem: x.patItem || null, move: x.move || null, passage: null };
  if (x.passage) served.passage = await getJson(new URL(x.passage.file, DOCS));
  // the sidecar, read the way the player reads it: section index, file, checksum
  let rec = null, guard = { published: false, ok: false, notes: [] };
  if (coach.sidecar) {
    const sections = await getJson(new URL('index.json', CONTENT));
    const sx = await getJson(new URL(sections.sections[item.section], CONTENT));
    const entry = sx.items[qid];
    if (!entry) guard.notes.push('not in the section index');
    else {
      const text = await getText(new URL(entry.file, CONTENT));
      rec = JSON.parse(text);
      guard.published = true;
      guard.status = entry.status;
      const sum = (await digest('SHA-256', text)).slice(0, 16);
      if (sum !== entry.checksum) guard.notes.push('sidecar checksum ' + sum + ' differs from the index ' + entry.checksum);
    }
  } else guard.notes.push(coach.held ? 'held: ' + coach.held : 'not published: build gates have issues');
  if (!rec) rec = coach.student;
  const hash = await stemHash(served.stem, served.choices);
  if (rec.bank.keyText !== served.choices[served.key]) guard.notes.push('key text differs from the question');
  if (rec.bank.stemHash !== hash) guard.notes.push('stem hash differs from the question');
  if (JSON.stringify(rec.bank.choiceTexts.slice().sort()) !== JSON.stringify(served.choices.slice().sort())) guard.notes.push('choice texts differ from the question');
  guard.ok = guard.published && !guard.notes.length;
  return { item, coach, rec, served, guard };
}

/* ------------------------------------------------------------ question page */
async function questionPage(ix, qid) {
  const { item, coach, rec: r, served: q, guard } = await loadQuestion(ix, qid);
  const coachView = !!params.get('coach');
  const fresh = params.get('state') === 'fresh';
  const order = (ix.batches[item.batch] || { qids: [qid] }).qids;
  const idx = order.indexOf(qid);
  document.body.className = 'is-q sec-' + r.section + (coachView ? ' is-coach' : '');
  const root = document.getElementById('app');
  const letterOf = (text) => { const i = q.choices.indexOf(text); return i >= 0 ? LET[i] : null; };
  const choiceRec = (text) => r.choices.find((c) => c.text === text);
  const pickParam = params.get('pick');
  const pickText = pickParam == null ? coach.preview.pick : (/^[1-5]$/.test(pickParam) ? q.choices[+pickParam - 1] : pickParam);
  let picked = fresh ? null : (q.choices.indexOf(pickText) >= 0 ? q.choices.indexOf(pickText) : q.key);
  let checked = !fresh;

  // header: exam chrome
  const top = h('header', { class: 'dat-top' },
    h('div', { class: 'dat-pos' }, h('b', { text: 'Question ' + (idx + 1) + ' of ' + order.length }), h('span', { text: SECTION[r.section] })),
    h('div', { class: 'dat-time' }, h('span', { text: 'Untimed practice' })));
  const main = h('main', { class: 'dat-main' + (r.section === 'rc' ? ' is-rc' : '') });
  const foot = h('footer', { class: 'dat-foot' });
  root.append(top, main, foot);

  // RC passage
  let qcol = main;
  if (r.section === 'rc' && q.passage) {
    const P = q.passage;
    const pass = h('section', { class: 'rc-pass', 'aria-label': 'Passage' }, h('h2', { text: P.title }), h('div', { class: 'meta', text: 'Passage' }));
    P.paragraphs.forEach((para, i) => pass.append(h('p', {}, h('span', { class: 'pn', text: String(i + 1) }), h('span', { text: para.join(' ') }))));
    const tog = h('button', { class: 'rc-toggle', type: 'button', 'aria-expanded': 'false', text: 'Show passage' });
    tog.addEventListener('click', () => { const on = main.classList.toggle('show-pass'); tog.setAttribute('aria-expanded', String(on)); tog.textContent = on ? 'Hide passage' : 'Show passage'; });
    qcol = h('section', { class: 'rc-qcol' });
    main.append(tog, pass, qcol);
  }

  // question card: exam-pure (structures only, PAT figures only)
  const card = h('section', { class: 'q-card', 'aria-label': 'Question' });
  qcol.append(card);
  card.append(h('p', { class: 'q-stem' }, rich(q.stem)));
  const isPat = r.section === 'pat';
  let patQ = null;
  if (isPat) { patQ = patQuestion(q.patItem); card.append(h('div', { class: 'pat-area', html: patQ.figure })); }
  if (q.figure) { const fh = h('div', { class: 'q-fig' }); card.append(fh); fh.innerHTML = window.QRFigures.html(q.figure); }
  if (q.qs) { const sh = h('div', { class: 'q-mol' }); card.append(sh); drawChoiceStructure(sh, q.qs, 'question stem'); }
  const opts = h('div', { class: 'q-opts' + (isPat ? ' pat-opts popt-' + q.patItem.type : '') + (q.os ? ' struct' : ''), role: 'radiogroup', 'aria-label': 'Answer choices' });
  card.append(opts);
  const optEls = q.choices.map((text, i) => {
    const b = h('button', { class: 'q-opt', type: 'button', role: 'radio', 'aria-checked': String(i === picked) }, h('span', { class: 'radio' }), h('span', { class: 'let', text: LET[i] + '.' }));
    const body = h('span', { class: 'txt' });
    if (isPat) body.innerHTML = patQ.option(i);
    else if (q.os) drawChoiceStructure(body, text, 'question choice ' + LET[i]);
    else body.append(rich(text));
    b.append(body, h('span', { class: 'tag' }));
    b.addEventListener('click', () => { if (checked) return; picked = i; optEls.forEach((o, j) => o.setAttribute('aria-checked', String(j === i))); checkBtn.disabled = false; });
    opts.append(b);
    return b;
  });
  const checkBtn = h('button', { class: 'q-check', type: 'button', text: 'Check', disabled: picked == null || checked });
  card.append(h('div', { class: 'q-actions' }, checkBtn, h('span', { class: 'q-hint', text: checked ? '' : 'Practice is untimed. Pick a choice, then Check.' })));
  const exp = h('section', { class: 'exp', 'aria-label': 'Explainer', 'aria-live': 'polite' });
  qcol.append(exp);

  async function showExplainer() {
    checked = true; checkBtn.disabled = true; checkBtn.textContent = 'Checked';
    card.querySelector('.q-hint').textContent = '';
    optEls.forEach((o, i) => {
      o.classList.toggle('is-key', i === q.key);
      o.classList.toggle('is-pick', i === picked && i !== q.key);
      o.querySelector('.tag').textContent = i === q.key ? 'Answer' : i === picked ? 'Your pick' : '';
    });
    if (!coachView && !guard.ok) { fallback(exp, q, picked); return; }
    // after Check, mark the key's place on the question's own figure
    const ann = r.visual.annotateQuestion;
    if (ann && q.figure) {
      // qr-figures.js re-renders (hydrates) its chart after layout, so re-apply the outline whenever the drawing is replaced
      const fig = card.querySelector('.q-fig');
      const apply = () => highlightBars(fig.querySelector('svg'), q.figure, ann.highlight);
      apply(); new MutationObserver(apply).observe(fig, { childList: true, subtree: true });
    }
    await explainer(exp, r, q, { picked, letterOf, choiceRec, coach: coachView });
  }
  checkBtn.addEventListener('click', showExplainer);
  if (checked) await showExplainer();

  // footer: exam buttons
  const btn = (label, o = {}) => { const b = h('button', { class: 'dat-btn', type: 'button', text: label }); if (o.on) b.addEventListener('click', o.on); if (o.disabled) b.disabled = true; foot.append(b); return b; };
  btn('Previous', { disabled: idx <= 0, on: () => { location.search = url(order[idx - 1]); } });
  btn('Next', { disabled: idx < 0 || idx === order.length - 1, on: () => { location.search = url(order[idx + 1]); } });
  const mk = btn('Mark', { on: () => { const on = mk.getAttribute('aria-pressed') !== 'true'; mk.setAttribute('aria-pressed', String(on)); store.set('mark:' + qid, on); } });
  mk.setAttribute('aria-pressed', String(!!store.get('mark:' + qid)));
  btn('Review', { on: () => reviewDialog(ix, order, idx) });
  if (['bio', 'gc', 'ochem'].includes(r.section)) btn('Exhibit', { on: () => note('Exhibit', 'In the player this opens the periodic table, transcribed from the ADA guide. It is not part of this preview.') });
  if (r.section === 'qr') btn('Calculator', { on: () => note('Calculator', 'In the player this opens the basic on-screen calculator. It is not part of this preview.') });
  if (coachView) coachPanel(qcol, item, coach, r, guard);
}

// What the player shows when it has no approved explainer that matches the question.
function fallback(box, q, picked) {
  box.innerHTML = '';
  const isKey = picked === q.key;
  box.append(h('div', { class: 'exp-status ' + (isKey ? 'ok' : 'nr') }, h('b', { text: isKey ? 'Confirmed' : 'Needs review' }), h('span', { text: picked != null ? 'You picked ' + LET[picked] + '.' : '' })));
  box.append(h('div', { class: 'exp-answer' }, h('div', { class: 'exp-label', text: 'The answer' }), h('p', { class: 'exp-key' }, h('b', { text: LET[q.key] + '. ' }), rich(q.choices[q.key]))));
  box.append(h('p', { class: 'exp-fallback' }, rich((q.move ? q.move + ' ' : '') + (q.why || ''))));
}

/* --------------------------------------------------------------- explainer */
async function explainer(box, r, q, ctx) {
  box.innerHTML = '';
  const isKey = ctx.picked === q.key;
  const label = (text) => { const c = ctx.choiceRec(text); return c && c.display ? c.display : text; };
  box.append(h('div', { class: 'exp-status ' + (isKey ? 'ok' : 'nr') }, h('b', { text: isKey ? 'Confirmed' : 'Needs review' }), h('span', { text: ctx.picked != null ? 'You picked ' + LET[ctx.picked] + '.' : '' })));
  box.append(h('div', { class: 'exp-answer' }, h('div', { class: 'exp-label', text: 'The answer' }), h('p', { class: 'exp-key' }, h('b', { text: LET[q.key] + '. ' }), rich(label(r.answer.text))), h('p', { class: 'exp-line' }, rich(r.answer.line))));
  const vis = h('div', { class: 'exp-visual' });
  box.append(vis);
  box.append(h('div', { class: 'exp-label', text: 'How to get there' }), h('ol', { class: 'exp-steps' }, r.steps.map((s) => h('li', {}, rich(s)))));
  const traps = h('ul', { class: 'exp-traps' });
  const others = q.choices.map((t, i) => i).filter((i) => i !== q.key);
  if (ctx.picked != null && ctx.picked !== q.key) others.sort((a, b) => (a === ctx.picked ? -1 : b === ctx.picked ? 1 : a - b));
  // phone, student view: the pick in full, every other choice as its trap name and first sentence, one tap for the rest
  const compact = !ctx.coach && (box.clientWidth || window.innerWidth) < 700;
  const firstSentence = (s2) => { const m = /^(.+?[.?])(\s|$)/.exec(s2); return m ? m[1] : s2; };
  let hidden = 0;
  const except = r.choices.some((c) => c.role === 'stated');
  others.forEach((i) => {
    const c = ctx.choiceRec(q.choices[i]);
    const isPick = i === ctx.picked;
    const nameLine = c.role === 'stated' ? h('div', { class: 'trap-name', text: famName(c) })
      : h('div', { class: 'trap-name' }, 'Trap: ' + (c.trap || famName(c)), c.trap ? h('span', { class: 'trap-fam', text: famName(c) }) : null);
    const full = h('p', { class: 'trap-note' }, rich(c.note));
    const li = h('li', { class: 'trap' + (isPick ? ' is-pick' : '') + (c.role === 'stated' ? ' is-stated' : '') },
      h('div', { class: 'trap-h' }, h('b', { text: LET[i] + '.' }), h('span', { class: 'trap-choice' }, rich(label(q.choices[i]))), isPick ? h('em', { class: 'trap-you', text: 'Your pick' }) : null),
      nameLine);
    if (compact && !isPick && firstSentence(c.note) !== c.note) { li.append(h('p', { class: 'trap-note is-short' }, rich(firstSentence(c.note)))); full.hidden = true; full.classList.add('trap-more'); hidden++; }
    li.append(full);
    if (isPick && c.role === 'stated') li.append(h('p', { class: 'trap-stated-pick', text: STATED_PICK }));
    traps.append(li);
  });
  box.append(h('div', { class: 'exp-label', text: except ? 'The other four' : 'The traps' }), traps);
  if (hidden) {
    const more = h('button', { type: 'button', class: 'exp-more-btn', 'aria-expanded': 'false', text: 'Show every note in full' });
    more.addEventListener('click', () => { traps.querySelectorAll('.trap-more').forEach((n) => { n.hidden = false; }); traps.querySelectorAll('.is-short').forEach((n) => n.remove()); more.remove(); });
    box.append(more);
  }
  box.append(h('div', { class: 'exp-lock' }, h('span', { text: 'Lock it in' }), h('p', {}, rich(r.lockIt))));
  if (r.hook) box.append(h('p', { class: 'exp-hook' }, h('span', { text: 'Memory cue: ' }), rich(r.hook)));
  const more = h('div', { class: 'exp-more' });
  more.append(h('a', { class: 'exp-play', href: LABS + r.playWith.href, target: '_blank', rel: 'noopener', text: 'Play with it: ' + r.playWith.label }));
  if (r.video.id) more.append(h('a', { class: 'exp-video', href: '#', text: 'Watch: ' + r.video.title }));
  else if (ctx.coach) more.append(h('p', { class: 'exp-slot', text: 'Video slot ' + r.video.slot + ' is empty. One subtopic video fills it for every question that shares the slot.' }));
  more.append(h('a', { class: 'exp-report', href: '#', text: 'Something off with this question?' }));
  box.append(more);
  await render(r.visual, vis, { letterOf: ctx.letterOf, coach: ctx.coach, item: q });
}

/* ------------------------------------------------------------- coach panel */
function coachPanel(col, item, coach, r, guard) {
  const qid = coach.qid, g = coach.gate;
  const st = store.get('signoff:' + qid) || { checks: [], status: 'draft' };
  const panel = h('aside', { class: 'coach', 'aria-label': 'Sign-off' }, h('h2', { text: 'Sign-off: ' + coach.pid }));
  panel.append(h('dl', {}, h('dt', { text: 'qid' }), h('dd', { text: qid }), h('dt', { text: 'Served as' }), h('dd', { text: coach.servedAs }), h('dt', { text: 'Bank' }), h('dd', { text: r.bank.file }),
    (coach.servesAlso || []).length ? [h('dt', { text: 'Also serves' }), h('dd', {}, h('ul', {}, coach.servesAlso.map((a) => h('li', { text: a.qid + ' (' + a.status + (a.heldBecause ? ': ' + a.heldBecause : '') + '): ' + a.relation }))))] : null,
    h('dt', { text: 'Subtopic' }), h('dd', { text: r.subtopic + ' (video slot ' + r.video.slot + ')' }),
    h('dt', { text: 'Status' }), h('dd', { text: coach.review.status + (coach.review.note ? ' (' + coach.review.note + ')' : '') + ', checksum ' + coach.checksum }),
    h('dt', { text: 'Guard' }), h('dd', { class: guard.ok ? '' : 'bad', text: guard.ok ? 'pass: published, key text, stem hash and choice texts match the question' : guard.notes.join('; ') })));
  const checks = ['Key: the answer is right (if not, Dispute; never edit)', 'First move: step 1 is the move you would say first', 'Traps: each name is fair and says why the choice pulls', 'Picture: it shows the truth and where the key sits; the alt describes it', 'Voice: the answer line and Lock it in sound like you'];
  const list = h('ol', { class: 'coach-checks' });
  checks.forEach((c, i) => { const id = 'ck' + i; const cb = h('input', { type: 'checkbox', id, checked: st.checks.includes(i) }); cb.addEventListener('change', () => { st.checks = checks.map((x, j) => j).filter((j) => document.getElementById('ck' + j).checked); store.set('signoff:' + qid, st); }); list.append(h('li', {}, cb, h('label', { for: id, text: c }))); });
  panel.append(h('h3', { text: 'Five checks, about 50 seconds' }), list);
  const stat = h('p', { class: 'coach-status', text: 'Status here: ' + st.status });
  const stamp = h('pre', { class: 'coach-stamp', hidden: true });
  const approve = h('button', { type: 'button', class: 'coach-btn ok', text: 'Approve' });
  const hold = h('button', { type: 'button', class: 'coach-btn', text: 'Hold' });
  const dispute = h('button', { type: 'button', class: 'coach-btn', text: 'Dispute key' });
  approve.addEventListener('click', () => {
    if (st.checks.length !== 5) { stat.textContent = 'Status here: tick all five checks first'; return; }
    st.status = 'approved in this browser'; store.set('signoff:' + qid, st); stat.textContent = 'Status here: ' + st.status + '. Add this stamp to docs/explainers/approvals.json:';
    stamp.hidden = false; stamp.textContent = JSON.stringify({ [qid]: { by: 'Thomas', at: new Date().toISOString().slice(0, 10), checksum: coach.checksum, guard: { keyText: r.bank.keyText, stemHash: r.bank.stemHash } } }, null, 1);
  });
  hold.addEventListener('click', () => { st.status = 'held'; stat.textContent = 'Status here: held. Send the writer a one-line note.'; store.set('signoff:' + qid, st); });
  dispute.addEventListener('click', () => { st.status = 'key dispute'; stat.textContent = 'Status here: key dispute. Add it to docs/explainers/key-disputes.json; the explainer is held until you rule.'; store.set('signoff:' + qid, st); });
  panel.append(h('div', { class: 'coach-actions' }, approve, hold, dispute), stat, stamp);
  panel.append(h('h3', { text: 'Trap families (counted by the Ace Log)' }), h('ul', { class: 'coach-fams' }, r.choices.filter((c) => c.role !== 'key').map((c) => h('li', { text: (c.display || c.text) + ': ' + famName(c) + ' (' + c.missType + ')' + (c.trap ? ', shown as "' + c.trap + '"' : '') }))));
  if (coach.flags.length) { panel.append(h('h3', { text: 'Flags for you' })); panel.append(h('ul', { class: 'coach-flags' }, coach.flags.map((f) => h('li', {}, h('b', { text: f.kind + ': ' }), f.text)))); }
  panel.append(h('h3', { text: 'Build gates: ' + (g.pass ? 'pass' : 'issues') }), h('ul', { class: 'coach-gates' }, g.checks.map((c) => h('li', { text: c })), g.issues.map((c) => h('li', { class: 'bad', text: c })), g.warnings.map((c) => h('li', { class: 'warn', text: 'warning: ' + c }))));
  panel.append(h('h3', { text: 'Play with it routing' }), h('p', { text: r.playWith.href + ': ' + (coach.routing || '') }));
  if ((coach.changes || []).length) panel.append(h('h3', { text: 'Changes after review' }), h('ul', { class: 'coach-flags' }, coach.changes.map((c) => h('li', { text: c }))));
  panel.append(h('h3', { text: 'The bank\'s own explanation today' }), h('p', { class: 'coach-why', text: r.section === 'pat' ? 'PAT review today shows a one-line template and the trap name of the chosen option; there is no written explanation per item.' : ((coach.served.extra.move ? coach.served.extra.move + ' ' : '') + (coach.served.bankWhy || '(none stored)')) }));
  col.append(panel);
}

/* ----------------------------------------------------------------- dialogs */
function dialog(title, body) {
  const d = h('dialog', { class: 'dat-dlg' }, h('h2', { text: title }), body, h('form', { method: 'dialog' }, h('button', { class: 'dat-btn', text: 'Close' })));
  document.body.append(d); d.addEventListener('close', () => d.remove()); d.showModal();
}
function note(title, text) { dialog(title, h('p', { text })); }
function reviewDialog(ix, order, idx) {
  const ul = h('ul', { class: 'rev-list' });
  order.forEach((qid, i) => { const r = ix.items[qid]; ul.append(h('li', { class: i === idx ? 'cur' : '' }, h('a', { href: url(qid), text: 'Question ' + (i + 1) }), h('span', { text: (r ? SUBJECT[r.section] : '') + (store.get('mark:' + qid) ? ', marked' : '') }))); });
  dialog('Review', ul);
}

/* -------------------------------------------------------------------- boot */
async function boot() {
  const gaps = catalogGaps();
  if (gaps.length) console.error('catalog types with no registered renderer: ' + gaps.join(', '));
  let ix;
  try { ix = await getJson(new URL('index.json', DOCS)); }
  catch (e) {
    document.getElementById('app').append(h('p', { class: 'unavail', text: 'The preview reads the coach records in docs/explainers/, which are never published. Run it on a local server from the repo root.' }));
    return;
  }
  FAM = (await getJson(new URL('families.json', CONTENT))).families;
  let qid = params.get('qid');
  if (!qid && params.get('q')) qid = (Object.entries(ix.items).find(([, x]) => x.pid === params.get('q')) || [])[0] || params.get('q');
  if (!qid) { indexPage(ix); return; }
  await questionPage(ix, qid);
}
boot().catch((e) => { console.error(e); document.getElementById('app').append(h('p', { class: 'vis-err', text: 'Preview error: ' + e.message })); })
  .finally(() => { document.body.dataset.ready = '1'; });
