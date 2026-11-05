// approvals.js : the review page (/approvals/, build spec REVIEW, OS-14).
//
// The key arrives in the link fragment (#k=...). It is moved to sessionStorage (this tab only),
// the fragment is wiped from the address bar, and the key is sent as X-Review-Key to
// /.netlify/functions/approvals, which answers the items this key may act on, the pulls and the
// comments. Every text from the server is set as text, never as markup.
//
// Previews: explainers draw with the explainer renderers (tools/explain/visuals/index.js) and
// only when the served sidecar still matches its stamp checksum; Retold items open their course
// page in a frame; other items show their before and after text.
const API = '/.netlify/functions/approvals';
const SKEY = 'acelabs.review.key';
const PAGE = 40;
const SECTION = { bio: 'Biology', gchem: 'General Chemistry', ochem: 'Organic Chemistry', qr: 'Quantitative Reasoning', pat: 'Perceptual Ability', rc: 'Reading Comprehension', all: 'Across Study' };
const KIND = { explainer: 'Explainer', 'retold-night': 'Retold night', 'retold-figure-removal': 'Retold figure removed' };
const WHO = { thomas: 'Full key', sarah: 'PAT key' };
const SCOPE = { all: 'every item', pat: 'PAT items only' };

const $ = (id) => document.getElementById(id);
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'text') el.textContent = v;
    else if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat()) if (k != null && k !== false) el.append(k);
  return el;
}
// x^2, 10^-5, K_a: typeset as sup and sub, as the explainer player does (text only, never markup)
const MARK = /([A-Za-z0-9\])])\^(\{[^}]+\}|[+-]?[0-9A-Za-z.]*[0-9A-Za-z+-])|([A-Za-z\])])_(\{[^}]+\}|[A-Za-z0-9]+)/g;
function rich(text) {
  const frag = document.createDocumentFragment(), str = String(text == null ? '' : text);
  let last = 0, m;
  MARK.lastIndex = 0;
  while ((m = MARK.exec(str))) {
    frag.append(str.slice(last, m.index) + (m[1] || m[3]));
    frag.append(h(m[2] ? 'sup' : 'sub', { text: (m[2] || m[4]).replace(/^\{|\}$/g, '') }));
    last = m.index + m[0].length;
  }
  frag.append(str.slice(last));
  return frag;
}
const day = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : d.toISOString().slice(0, 16).replace('T', ' ') + ' UTC'; };

/* ---------- the key ---------- */
const store = { get() { try { return sessionStorage.getItem(SKEY); } catch (e) { return null; } }, set(v) { try { sessionStorage.setItem(SKEY, v); } catch (e) { /* this tab only, memory */ } }, drop() { try { sessionStorage.removeItem(SKEY); } catch (e) { /* gone */ } } };
let KEY = null;
function keyFromFragment() {
  const m = /(?:^#|&)k=([A-Za-z0-9_-]{16,256})(?:&|$)/.exec(location.hash || '');
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  return m ? m[1] : null;
}

/* ---------- state ---------- */
const S = { role: null, scope: null, items: [], pulls: {}, comments: {}, orphans: [], sec: 'all', show: 'all', q: '', limit: PAGE };

function status(text, bad) { const s = $('status'); s.textContent = text; s.classList.toggle('is-bad', !!bad); s.hidden = !text; }
async function api(method, body) {
  const r = await fetch(API, {
    method,
    cache: 'no-store',
    credentials: 'same-origin',
    headers: Object.assign({ 'x-review-key': KEY, accept: 'application/json' }, body ? { 'content-type': 'application/json' } : {}),
    body: body ? JSON.stringify(body) : undefined,
  });
  let j = null;
  try { j = await r.json(); } catch (e) { j = null; }
  return { status: r.status, ok: r.ok, body: j || {} };
}
function askForKey(msg) {
  KEY = null; store.drop();
  $('listBox').hidden = true; $('who').hidden = true; $('orphanBox').hidden = true;
  $('keyBox').hidden = false;
  if (msg) $('keyMsg').textContent = msg;
  status('');
  $('keyIn').focus();
}
async function load() {
  status('Loading the list.');
  let r;
  try { r = await api('GET'); } catch (e) { status('The review server did not answer. Try again in a minute.', true); return; }
  if (r.status === 401) { askForKey('That key did not open the list. Use the link from the release note.'); return; }
  if (!r.ok) { status(r.body.error || 'The review server did not answer. Try again in a minute.', true); return; }
  S.role = r.body.role; S.scope = r.body.scope;
  S.items = Array.isArray(r.body.items) ? r.body.items : [];
  S.pulls = r.body.pulls || {}; S.comments = r.body.comments || {};
  S.orphans = Array.isArray(r.body.orphans) ? r.body.orphans : [];
  $('keyBox').hidden = true;
  const who = $('who'); who.hidden = false; who.textContent = '';
  who.append(h('p', { class: 'rv-who', text: (WHO[S.role] || 'Key') + ': ' + (SCOPE[S.scope] || S.scope) + '.' }),
    h('button', { class: 'btn quiet', type: 'button', text: 'Close this key', onclick: () => askForKey('Closed. Open the link again to come back.') }));
  filters();
  draw();
  drawOrphans();
  status('');
  $('listBox').hidden = false;
}

/* ---------- filters ---------- */
function seg(host, options, cur, pick) {
  host.textContent = '';
  for (const [v, label] of options) host.append(h('button', { class: 'btn', type: 'button', 'aria-pressed': String(v === cur), text: label, onclick: () => { pick(v); filters(); S.limit = PAGE; draw(); } }));
}
function filters() {
  const secs = [...new Set(S.items.map((x) => x.section))];
  seg($('secs'), [['all', 'All sections'], ...secs.map((s) => [s, SECTION[s] || s])], S.sec, (v) => { S.sec = v; });
  seg($('states'), [['all', 'Everything'], ['live', 'Live'], ['pulled', 'Pulled'], ['comments', 'With comments']], S.show, (v) => { S.show = v; });
}
function visible() {
  const q = S.q.trim().toLowerCase();
  return S.items.filter((it) => (S.sec === 'all' || it.section === S.sec)
    && (S.show === 'all' || (S.show === 'pulled' ? !!S.pulls[it.id] : S.show === 'live' ? !S.pulls[it.id] : (S.comments[it.id] || []).length > 0))
    && (!q || (it.id + ' ' + it.title + ' ' + (it.change || '')).toLowerCase().includes(q)));
}

/* ---------- the list ---------- */
function draw() {
  const list = $('list'), items = visible();
  list.textContent = '';
  const pulled = S.items.filter((x) => S.pulls[x.id]).length;
  $('count').textContent = items.length + ' shown of ' + S.items.length + ' items; ' + pulled + ' pulled.';
  items.slice(0, S.limit).forEach((it) => list.append(card(it)));
  const more = $('more');
  more.hidden = items.length <= S.limit;
  more.textContent = 'Show ' + Math.min(PAGE, items.length - S.limit) + ' more';
}
function card(it) {
  const p = S.pulls[it.id];
  const li = h('li', { class: 'rv-item' + (p ? ' is-pulled' : ''), 'data-sec': it.section, id: 'it-' + it.id.replace(/[^A-Za-z0-9_-]/g, '_') });
  li.append(h('p', { class: 'rv-meta' }, h('span', { text: SECTION[it.section] || it.section }), h('span', { text: KIND[it.kind] || it.kind }), h('code', { text: it.id })));
  // ids stay as typed (BIO_d036 is not a subscript); only the text after the first ": " is typeset
  const cut = it.title.indexOf(': ');
  li.append(h('h3', {}, cut > 0 ? [it.title.slice(0, cut + 2), rich(it.title.slice(cut + 2))] : it.title));
  const ck = it.checksum && typeof it.checksum.matches === 'boolean' ? (it.checksum.matches ? ' Checksum matches the served file.' : ' Checksum does not match: the stamp is void.') : '';
  li.append(h('p', { class: 'rv-stamp' }, h('b', { text: 'Stamp: ' }), it.stamp + (it.at ? ' (stamped ' + it.at + ')' : '') + '.' + ck));
  if (it.change) li.append(h('p', { class: 'rv-change', text: it.change }));
  if (it.decision) li.append(h('p', { class: 'rv-note', text: 'Decision: ' + it.decision }));
  li.append(h('p', { class: 'rv-state' + (p ? '' : ' is-live'), text: p ? 'Pulled' + (p.by ? ' with the ' + (WHO[p.by] || p.by).toLowerCase() : '') + (p.at ? ', ' + day(p.at) : '') + '. Students do not see it.' : 'Live for students.' }));

  const prev = h('div', { class: 'rv-prev', hidden: true });
  const toggle = h('button', { class: 'btn', type: 'button', 'aria-expanded': 'false', text: 'Show preview' });
  toggle.addEventListener('click', () => {
    const open = prev.hidden;
    prev.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Hide preview' : 'Show preview';
    if (open && !prev.dataset.drawn) { prev.dataset.drawn = '1'; preview(it, prev); }
  });
  const actions = h('div', { class: 'rv-actions' }, toggle);
  if (it.pullable) {
    const btn = h('button', { class: 'btn ' + (p ? '' : 'primary'), type: 'button', text: p ? 'Unpull' : 'Pull' });
    btn.addEventListener('click', () => act(it, p ? 'unpull' : 'pull', btn));
    actions.append(btn);
  } else actions.append(h('span', { class: 'rv-note', text: 'A correction of a known error: no pull (it would bring the error back). Comment instead.' }));
  if (it.place && it.place.startsWith('/')) actions.append(h('a', { class: 'btn quiet', href: it.place, target: '_blank', rel: 'noopener', text: 'Open where it shows' }));
  li.append(actions);
  if (it.pullNote) li.append(h('p', { class: 'rv-note', text: it.pullNote }));
  li.append(prev);

  const cs = S.comments[it.id] || [];
  if (cs.length) li.append(h('ul', { class: 'rv-comments', 'aria-label': 'Comments' }, cs.map((c) => h('li', {}, h('span', { class: 'who', text: (WHO[c.by] || c.by) + ', ' + day(c.at) }), h('p', { text: c.text })))));
  const tid = 'c-' + li.id;
  const ta = h('textarea', { id: tid, maxlength: '2000', rows: '3' });
  const save = h('button', { class: 'btn', type: 'submit', text: 'Save comment' });
  const form = h('form', { class: 'rv-cform' }, h('label', { for: tid, text: 'Comment' }), ta, h('div', { class: 'rv-actions' }, save));
  form.addEventListener('submit', (e) => { e.preventDefault(); comment(it, ta, save); });
  li.append(form);
  return li;
}

/* pulls whose item left the index: they still hold (the function serves every stored pull) */
function drawOrphans() {
  const box = $('orphanBox'), ul = $('orphans');
  ul.textContent = '';
  box.hidden = !S.orphans.length;
  for (const o of S.orphans) {
    const btn = h('button', { class: 'btn', type: 'button', text: 'Unpull' });
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      const r = await api('POST', { action: 'unpull', id: o.id }).catch(() => ({ ok: false, status: 0, body: {} }));
      btn.disabled = false;
      if (r.status === 401) return askForKey('That key no longer opens the list.');
      if (!r.ok) { status(r.body.error || 'That did not save. Try again.', true); return; }
      S.orphans = S.orphans.filter((x) => x.id !== o.id);
      status('Unpulled ' + o.id + '. Student pages pick it up within a minute.');
      drawOrphans();
    });
    ul.append(h('li', {}, h('code', { text: o.id }), h('span', { text: ' Pulled' + (o.by ? ' with the ' + (WHO[o.by] || o.by).toLowerCase() : '') + (o.at ? ', ' + day(o.at) : '') + '. ' }), btn));
  }
}
async function act(it, action, btn) {
  btn.disabled = true;
  const r = await api('POST', { action, id: it.id }).catch(() => ({ ok: false, status: 0, body: {} }));
  btn.disabled = false;
  if (r.status === 401) return askForKey('That key no longer opens the list.');
  if (!r.ok) { status(r.body.error || 'That did not save. Try again.', true); return; }
  if (action === 'pull') S.pulls[it.id] = { by: S.role, at: r.body.at };
  else delete S.pulls[it.id];
  status((action === 'pull' ? 'Pulled ' : 'Unpulled ') + it.id + '. Student pages pick it up within a minute.');
  redrawCard(it);
}
async function comment(it, ta, btn) {
  const text = ta.value.trim();
  if (!text) { ta.focus(); return; }
  btn.disabled = true;
  const r = await api('POST', { action: 'comment', id: it.id, text }).catch(() => ({ ok: false, status: 0, body: {} }));
  btn.disabled = false;
  if (r.status === 401) return askForKey('That key no longer opens the list.');
  if (!r.ok) { status(r.body.error || 'That did not save. Try again.', true); return; }
  (S.comments[it.id] = S.comments[it.id] || []).push({ by: S.role, at: r.body.at, text });
  status('Comment saved on ' + it.id + '.');
  redrawCard(it);
}
function redrawCard(it) {
  const old = document.getElementById('it-' + it.id.replace(/[^A-Za-z0-9_-]/g, '_'));
  if (old) old.replaceWith(card(it));
  const pulled = S.items.filter((x) => S.pulls[x.id]).length;
  $('count').textContent = visible().length + ' shown of ' + S.items.length + ' items; ' + pulled + ' pulled.';
}

/* ---------- previews ---------- */
let renderers = null;
const PAT_ENGINE = ['pat-core.js', 'pat-solid.js', 'pat-keyholes.js', 'pat-keyholes-csg.js', 'pat-tfe.js', 'pat-tfe-csg.js', 'pat-angles.js',
  'pat-holepunch.js', 'pat-cubes.js', 'pat-patternfold.js', 'pat-patternfold-poly.js'].map((f) => '/tools/pat/engine/' + f);
const CLASSIC = ['/shared/smiles-drawer.min.js?v=1', '/shared/qr-figures.js?v=2', '/tools/bio/bio-real.js', '/tools/explain/vendor/gc/lewis-layout.js', ...PAT_ENGINE];
const loaded = {};
function classic(src) {
  return loaded[src] || (loaded[src] = new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.async = false; s.onload = res; s.onerror = () => rej(new Error('could not load ' + src)); document.head.append(s); }));
}
async function inOrder(list) { for (const src of list) await classic(src); }
function loadRenderers() {
  if (!renderers) renderers = (async () => { await inOrder(CLASSIC); return import('/tools/explain/visuals/index.js'); })();
  return renderers;
}
// The question, read from its own bank by the sidecar's locator (as the explainer build resolves it).
const holesText = (h) => 'holes:' + h.map((p) => p[0] + ',' + p[1]).sort().join('|');
const patChoiceText = (it, o) => (it.type === 'holepunch' ? holesText(o.holes) : it.type === 'cubes' ? o.count + ' cube' + (o.count > 1 ? 's' : '') : o.text);
const BANKS = {
  'tools/mock/data/full-mocks.js': async (loc) => {
    await classic('/tools/mock/data/full-mocks.js');
    const m = (window.ACE_FULL_MOCKS.mocks || []).find((x) => x.id === loc.mock);
    const it = m && (m.sections[loc.section] || []).find((x) => x.id === loc.id);
    return it && { stem: it.q, choices: it.opts.slice(), key: it.correct, qs: it.qs || null, os: !!it.os };
  },
  'tools/rc/data/bank.js': async (loc) => {
    await classic('/tools/rc/data/bank.js');
    const P = window.ACE_RC_BANK.passages[loc.passage];
    const it = P && P.questions.find((x) => x.id === loc.id);
    return it && { stem: it.stem, choices: it.choices.slice(), key: it.key, passage: { title: P.title, paragraphs: P.paragraphs } };
  },
  'tools/pat/engine/pat-test.js': async (loc) => {
    await inOrder([...PAT_ENGINE, '/tools/pat/engine/pat-test.js']);
    const it = window.PAT.test.build(loc.test).items[+loc.n - 1];
    return it && { stem: it.prompt, choices: it.options.map((o) => patChoiceText(it, o)), key: it.answer, patItem: it };
  },
};
async function question(x) {
  const b = x.bank || {}, get = BANKS[b.file];
  const q = get ? await get(b.locator || {}) : null;
  return q || { stem: null, choices: (b.choiceTexts || []).slice(), key: (b.choiceTexts || []).indexOf(b.keyText), missing: true };
}
async function sha256(text) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join(''); }

async function preview(it, box) {
  const pv = it.preview || {};
  try {
    if (pv.type === 'explainer') await explainer(it, pv, box);
    else if (pv.type === 'page') {
      box.append(h('p', { class: 'x-label', text: pv.scene ? 'The night, scene ' + pv.scene + ' (coach view: shows pulled parts too)' : 'The night (coach view: shows pulled parts too)' }));
      box.append(h('iframe', { src: pv.src, title: 'Preview of ' + it.title, loading: 'lazy', referrerpolicy: 'no-referrer' }));
    } else if (pv.type === 'override') await override(it, pv, box);
    else {
      if (pv.before != null) box.append(h('p', { class: 'x-label', text: 'Before' }), h('p', { class: 'x-before', text: pv.before }));
      if (pv.after != null) box.append(h('p', { class: 'x-label', text: 'After' }), h('p', { class: 'x-after', text: pv.after }));
      if (pv.src) box.append(h('p', {}, h('a', { href: pv.src, target: '_blank', rel: 'noopener', text: 'Open the page where it shows' })));
      if (pv.before == null && pv.after == null && !pv.src) box.append(h('p', { text: it.change || 'No preview for this item; the change line above says what it is.' }));
    }
  } catch (e) {
    box.append(h('p', { class: 'x-void', text: 'The preview did not load (' + (e && e.message ? e.message : 'error') + ').' }));
  }
}
// an explanation override: the bank's own explanation, then the text that replaces it
async function override(it, pv, box) {
  const r = await fetch(pv.file, { cache: 'no-store' });
  if (!r.ok) throw new Error('overrides ' + r.status);
  const doc = await r.json();
  const o = (doc.overrides || {})[pv.qid];
  if (!o) { box.append(h('p', { class: 'x-void', text: 'This override is no longer in the overrides file, so the bank explanation shows.' })); return; }
  await classic('/tools/mock/data/full-mocks.js');
  const id = pv.qid.split(':').slice(1).join(':');   // fm:organic:oc-x is bank item organic:oc-x
  let bank = null;
  for (const m of window.ACE_FULL_MOCKS.mocks || []) for (const arr of Object.values(m.sections)) { const x = arr.find((y) => y.id === id); if (x && !bank) bank = x; }
  if (bank) box.append(h('div', {}, h('p', { class: 'x-label', text: 'Before: the bank explanation' }), h('p', { class: 'x-before' }, rich(bank.why))));
  box.append(h('div', {}, h('p', { class: 'x-label', text: 'After: what students see' }), h('p', { class: 'x-after' }, rich(o.why))));
}
async function explainer(it, pv, box) {
  box.append(h('p', { class: 'x-label', text: 'Loading the explainer.' }));
  const r = await fetch(pv.sidecar.split('/').map(encodeURIComponent).join('/'), { cache: 'no-store' });
  if (!r.ok) throw new Error('sidecar ' + r.status);
  const text = await r.text();
  box.textContent = '';
  if (!it.checksum || (await sha256(text)) !== it.checksum.sidecar) {
    box.append(h('p', { class: 'x-void', text: 'The served sidecar no longer matches its stamp, so it does not render here or for students. It needs a new review and stamp.' }));
    return;
  }
  const wait = h('p', { class: 'x-label', text: 'Loading the question from its bank (a PAT test takes a few seconds to build).' });
  box.append(wait);
  const x = JSON.parse(text), q = await question(x);
  wait.remove();
  const choices = q.choices;
  if (q.missing) box.append(h('p', { class: 'x-void', text: 'The question did not load from its bank; the picture may not draw.' }));
  else if (x.bank && x.bank.keyText != null && choices[q.key] !== x.bank.keyText) box.append(h('p', { class: 'x-void', text: 'The bank key no longer matches this explainer (the player falls back to the bank explanation).' }));
  if (q.stem) box.append(h('div', {}, h('p', { class: 'x-label', text: 'The question' }), h('p', { class: 'x-stem' }, rich(q.stem))));
  box.append(h('div', {}, h('p', { class: 'x-label', text: 'The answer' }), h('p', { class: 'x-key' }, rich(x.answer && x.answer.text)), h('p', {}, rich(x.answer && x.answer.line))));
  const vis = h('div', { class: 'x-vis' });
  box.append(vis);
  box.append(h('div', {}, h('p', { class: 'x-label', text: 'How to get there' }), h('ol', {}, (x.steps || []).map((s) => h('li', {}, rich(s))))));
  const traps = (x.choices || []).filter((c) => c.role !== 'key');
  if (traps.length) box.append(h('div', {}, h('p', { class: 'x-label', text: traps.some((c) => c.role === 'stated') ? 'The other four' : 'The traps' }),
    h('ul', {}, traps.map((c) => h('li', { class: 'x-trap' }, h('b', {}, rich(c.display || c.text)), h('span', {}, (c.trap ? 'Trap: ' + c.trap + '. ' : ''), rich(c.note)))))));
  if (x.lockIt) box.append(h('div', { class: 'x-lock' }, h('p', { class: 'x-label', text: 'Lock it in' }), h('p', {}, rich(x.lockIt))));
  if (x.hook) box.append(h('p', {}, h('b', { text: 'Memory cue: ' }), rich(x.hook)));
  if (x.playWith && x.playWith.href) box.append(h('p', {}, h('a', { href: '/' + String(x.playWith.href).replace(/^\/+/, ''), target: '_blank', rel: 'noopener', text: 'Play with it: ' + (x.playWith.label || '') })));
  if (x.visual) {
    const R = await loadRenderers();
    const item = { stem: q.stem, choices, key: q.key, figure: q.figure || null, qs: q.qs || null, os: !!q.os, patItem: q.patItem || null, passage: q.passage || null };
    const letters = 'ABCDE';
    await R.render(x.visual, vis, { letterOf: (t) => { const i = choices.indexOf(t); return i >= 0 ? letters[i] : null; }, coach: false, item });
  }
}

/* ---------- start ---------- */
$('keyForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = $('keyIn').value.trim();
  $('keyIn').value = '';
  if (!/^[A-Za-z0-9_-]{16,256}$/.test(v)) { $('keyMsg').textContent = 'That does not look like a review key.'; return; }
  KEY = v; store.set(v); load();
});
$('q').addEventListener('input', (e) => { S.q = e.target.value; S.limit = PAGE; draw(); });
$('more').addEventListener('click', () => { S.limit += PAGE; draw(); });
KEY = keyFromFragment();
if (KEY) store.set(KEY); else KEY = store.get();
if (KEY) load(); else askForKey();
