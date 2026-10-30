/* Card pictures for the Bio "Call it first" layer (tools/bio/bio-stick.js).
 *
 * An Ace Card is built from the prediction when the prediction slipped,
 * else from the from-memory check. Its picture must show that card's own
 * question: the last watched frame for the prediction, the entry's
 * checkFrame (run at save time) for the check. These tests lock the
 * audit of all 15 entries, the size budget, the veil, and the validator
 * rules for checkFrame.
 *
 * Same boot as tests/bio/bio-stick.test.js: bio-shared.js, the real
 * views, the data and the engine evaluated as one script (STATE is a
 * top-level const in bio-shared.js), reduced motion on so frames resolve
 * at once.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..', '..');
const BIO = path.join(ROOT, 'tools', 'bio');
const SRC = ['bio-shared.js', 'bio-real.js', 'bio-bone.js', 'bio-stick-data.js', 'bio-stick.js']
  .map((f) => fs.readFileSync(path.join(BIO, f), 'utf8')).join('\n;\n');
const MAX_STILL_CHARS = 40000;

const OPEN = [];
test.afterEach(() => { while (OPEN.length) { try { OPEN.pop().close(); } catch (e) { /* already closed */ } } });

function boot(hub, opts = {}) {
  const html = fs.readFileSync(path.join(BIO, hub), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/tools/bio/' + hub + (opts.hash || '') });
  const store = new Map(opts.seed ? Object.entries(opts.seed) : []);
  Object.defineProperty(dom.window, 'localStorage', {
    value: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k)
    },
    writable: false
  });
  dom.window.matchMedia = (q) => ({ matches: /reduce/.test(q), media: q, addListener() {}, removeListener() {} });
  dom.window.HTMLElement.prototype.scrollIntoView = function () {};
  const errs = [];
  dom.window.addEventListener('error', (e) => errs.push(e.message));
  if (opts.beforeBoot) dom.window.__beforeBoot = opts.beforeBoot;
  dom.window.eval(SRC + '\n;window.__STATE = STATE; window.__OPERON = OPERON_STATE;' +
    '\n;if (window.__beforeBoot) window.__beforeBoot(window);');
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  const w = dom.window;
  OPEN.push(w);
  return {
    w, store, errs,
    panel: (id) => w.BioStick.panels[id],
    state: () => w.__STATE,
    click: (el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }))
  };
}

const HUB_FILE = {
  cell: 'bio-cell.html', physiology: 'bio-physiology.html', genetics: 'bio-genetics.html',
  devo: 'bio-devo.html', evolution: 'bio-evolution.html'
};
const other = (key) => (key === 0 ? 1 : 0);
// the engine escapes the question before it goes on the card
const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// One full first pass. route 'check': the prediction is confirmed, so the
// card asks the from-memory question. route 'predict': the prediction
// slips, so the card asks the prediction.
function pass(t, id, route) {
  const p = t.panel(id), e = p.entry;
  t.click(p.node.querySelector('.stick-opts .stick-opt[data-i="' + (route === 'check' ? e.predict.key : other(e.predict.key)) + '"]'));
  t.click(p.node.querySelector('.stick-next'));
  t.click(p.node.querySelector('.stick-opt[data-i="' + e.check.key + '"]'));
  const st = t.state();
  const card = st.aceCards.find((c) => c.id === st.stick[id].cardId);
  assert.ok(card, id + ': card saved');
  const m = card.explanation.match(/<div class="stick-card-pic">([\s\S]*)<\/div><p class="stick-card-link">/);
  const pic = m ? m[1] : '';
  const box = t.w.document.createElement('div');
  box.innerHTML = pic;
  return { p, e, card, pic, text: box.textContent.replace(/\s+/g, ' ') };
}

/* The audit, one row per entry: what a card about the CHECK must show
   (has), what it must not show (not: usually the prediction's state),
   and, for entries with a checkFrame, what the frame caption says. */
const AUDIT = {
  tonicity: { hub: 'cell', frame: true, has: /Plasmolysis \(Elodea leaf cells\)/, not: /Hemolysis|ghosts|Red blood cells/, cap: /HYPERTONIC/ },
  respiration: { hub: 'cell', frame: false, has: /MATRIX/, also: /INNER MITOCHONDRIAL MEMBRANE/ },
  endocrine: { hub: 'physiology', frame: true, has: /Thyroid/, also: /TSH/, not: /Posterior Pituitary/ },
  nephron: { hub: 'physiology', frame: true, has: /Collecting Duct/, also: /aquaporin-2/, not: /Ascending Loop/ },
  'action-potential': { hub: 'physiology', frame: true, has: /HYPERPOL/, cap: /Hyperpolarization/ },
  'cross-bridge': { hub: 'physiology', frame: true, has: /A band/, cap: /Cross-bridge forms/ },
  sarcomere: { hub: 'physiology', frame: false, has: /TEM VIEW/, also: /A band/ },
  bohr: { hub: 'physiology', frame: true, has: /DISSOCIATION CURVE/, cap: /LEFT shift/ },
  'blood-types': { hub: 'physiology', frame: false, has: /Type A/, also: /Anti-B antibody/ },
  'ovarian-cycle': { hub: 'physiology', frame: true, has: /Progesterone/, cap: /LUTEAL \| Day 21/ },
  'bone-layers': { hub: 'physiology', frame: true, has: /cross-section of compact bone \(ground section\)/, also: /Haversian canal/, cap: /Osteon/ },
  'lac-operon': { hub: 'genetics', frame: true, has: /TRP OPERON/, not: /LAC OPERON/, cap: /OFF/ },
  'hardy-weinberg': { hub: 'genetics', frame: false, has: /2pq/ },
  'embryo-stages': { hub: 'devo', frame: true, has: /Neurula/, also: /neural tube/, not: /Gastrula/ },
  homology: { hub: 'evolution', frame: false, has: /Analogous structures/ }
};

test('the audit covers every entry, and checkFrame is set exactly where the audit says', () => {
  const t = boot('bio-cell.html');
  const entries = t.w.BIO_STICK_ENTRIES;
  assert.deepEqual(Array.from(entries, (e) => e.id).sort(), Object.keys(AUDIT).sort());
  entries.forEach((e) => {
    assert.equal(Array.isArray(e.checkFrame) && e.checkFrame.length > 0, AUDIT[e.id].frame, e.id + ': checkFrame');
    assert.equal(e.hub, AUDIT[e.id].hub, e.id + ': hub');
  });
});

test('every card about the check shows the check, within the card limit', () => {
  for (const [hub, file] of Object.entries(HUB_FILE)) {
    const t = boot(file);
    for (const id of Object.keys(t.w.BioStick.panels)) {
      const a = AUDIT[id];
      const { p, e, card, pic, text } = pass(t, id, 'check');
      assert.equal(card.q, esc(e.check.q), id + ': the card asks the check');
      assert.ok(pic.length > 0, id + ': the card has a picture');
      assert.ok(pic.length <= MAX_STILL_CHARS, id + ': picture is ' + pic.length + ' characters');
      assert.match(text, a.has, id);
      if (a.also) assert.match(text, a.also, id);
      if (a.not) assert.doesNotMatch(text, a.not, id);
      if (a.frame) {
        assert.ok(p.cardSnap, id + ': the check frame was taken');
        assert.equal(pic, p.cardSnap.html, id + ': the card holds the check frame');
        assert.notEqual(pic, p.frames[p.frames.length - 1].html, id + ': the check frame differs from the last watched frame');
        if (a.cap) assert.match(p.cardSnap.caption, a.cap, id + ': check frame caption');
      } else {
        assert.equal(p.cardSnap, null, id + ': no check frame');
        assert.equal(pic, p.frames[p.frames.length - 1].html, id + ': the card reuses the last watched frame');
      }
    }
    assert.deepEqual(t.errs, [], hub);
  }
});

test('every card about the prediction keeps the last frame the student watched', () => {
  for (const file of Object.values(HUB_FILE)) {
    const t = boot(file);
    for (const id of Object.keys(t.w.BioStick.panels)) {
      const { p, e, card, pic } = pass(t, id, 'predict');
      assert.equal(card.q, esc(e.predict.q), id + ': the card asks the prediction');
      assert.equal(p.cardSnap, null, id + ': no check frame for a prediction card');
      assert.ok(pic.length > 0 && pic.length <= MAX_STILL_CHARS, id + ': picture is ' + pic.length + ' characters');
      assert.equal(pic, p.frames[p.frames.length - 1].html, id + ': last watched frame');
    }
  }
});

test('tonicity: a missed prediction saves red cells bursting; a confirmed one saves the plasmolyzed plant cell', () => {
  const miss = boot('bio-cell.html');
  const m = pass(miss, 'tonicity', 'predict');
  assert.match(m.text, /Hemolysis/);
  assert.doesNotMatch(m.text, /Plasmolysis|Elodea/);
  // the check did not move the visualizer: it still shows the last frame
  assert.match(miss.w.document.getElementById('tonCellSvg').innerHTML, /Hemolysis/);
  const hit = boot('bio-cell.html');
  const h = pass(hit, 'tonicity', 'check');
  assert.match(h.text, /Plasmolysis \(Elodea leaf cells\)/);
  assert.match(h.text, /400x, cropped/);
  assert.match(h.text, /50 um/);
});

test('bone layers: the osteon question saves the ground section at full strength, not the endosteum stop', () => {
  const t = boot('bio-physiology.html');
  const { p, pic } = pass(t, 'bone-layers', 'check');
  assert.match(p.cardSnap.caption, /Osteon \(zoom\)/);
  assert.doesNotMatch(p.cardSnap.caption, /Endosteum/);
  // the zoom inset group: full strength on the card, dimmed (0.55) on the
  // endosteum stop the student last watched
  const last = p.frames[p.frames.length - 1];
  assert.match(last.caption, /Endosteum/);
  assert.match(last.html, /<g opacity="0\.55">/);
  assert.match(pic, /<g opacity="1">/);
  assert.doesNotMatch(pic, /<g opacity="0\.55">/);
  const stage = t.w.document.getElementById('boneStage');
  assert.equal(stage.value, '2', 'the visualizer sits on the osteon stop');
  assert.ok(pic.length < 32000, 'osteon card picture is ' + pic.length + ' characters');
});

test('after Done the visualizer shows the state the card holds; Watch it again replays the prediction', () => {
  const t = boot('bio-cell.html');
  const { p } = pass(t, 'tonicity', 'check');
  const d = t.w.document;
  t.click(p.node.querySelector('.stick-done-btn'));
  assert.equal(d.querySelectorAll('#tonicityBody.stick-veiled').length, 0, 'veil lifted');
  assert.match(d.getElementById('tonCellSvg').innerHTML, /Plasmolysis/, 'plant cell in salt water on screen');
  t.click(p.node.querySelector('.stick-replay'));
  assert.match(p.frames[p.frames.length - 1].html, /Hemolysis/, 'replay runs the prediction frames from their setup');
  assert.match(d.getElementById('tonCellSvg').innerHTML, /Hemolysis/);
});

test('a retake runs no check frame and leaves the card alone', () => {
  const t = boot('bio-physiology.html');
  const first = pass(t, 'bone-layers', 'check');
  const before = first.card.explanation;
  const p = first.p;
  t.click(p.node.querySelector('.stick-done-btn'));
  t.click(p.node.querySelector('.stick-retake'));
  const e = p.entry;
  t.click(p.node.querySelector('.stick-opts .stick-opt[data-i="' + e.predict.key + '"]'));
  t.click(p.node.querySelector('.stick-next'));
  p.cardSnap = 'untouched';
  t.click(p.node.querySelector('.stick-opt[data-i="' + e.check.key + '"]'));
  assert.equal(p.cardSnap, 'untouched', 'no card was built, so no check frame ran');
  assert.equal(t.w.document.getElementById('boneStage').value, '3', 'the visualizer stays on the last watched frame');
  assert.match(p.node.textContent, /Practice run/);
  assert.equal(first.card.explanation, before);
});

test('a check frame taken under the closed-book veil carries no veil onto the card', () => {
  // make the picture itself the veiled element, the hardest case
  const t = boot('bio-cell.html', { beforeBoot: (w) => { w.BIO_STICK_ENTRIES[0].veil = '#tonCellSvg'; } });
  const p = t.panel('tonicity'), e = p.entry;
  t.click(p.node.querySelector('.stick-opts .stick-opt[data-i="' + e.predict.key + '"]'));
  t.click(p.node.querySelector('.stick-next'));
  assert.ok(t.w.document.getElementById('tonCellSvg').classList.contains('stick-veiled'), 'veiled during the check');
  t.click(p.node.querySelector('.stick-opt[data-i="' + e.check.key + '"]'));
  const card = t.state().aceCards.find((c) => c.id === t.state().stick.tonicity.cardId);
  assert.match(card.explanation, /Plasmolysis/);
  assert.doesNotMatch(card.explanation, /stick-veiled/);
  assert.doesNotMatch(card.explanation, /aria-hidden/);
  assert.ok(t.w.document.getElementById('tonCellSvg').classList.contains('stick-veiled'), 'the live picture stays veiled until Done');
});

test('a picture over the card limit is left off, never swapped for another question', () => {
  const t = boot('bio-cell.html');
  const p = t.panel('tonicity');
  const body = p.cardBody(p.entry.check, { html: '<svg>' + 'x'.repeat(MAX_STILL_CHARS) + '</svg>', caption: '' });
  assert.doesNotMatch(body, /stick-card-pic/);
  assert.match(body, /See it move again/);
  assert.match(p.cardBody(p.entry.check, null), /^<p>/);
});

test('a check frame that cannot be taken leaves the card without a picture, never the prediction picture', () => {
  const t = boot('bio-cell.html');
  const p = t.panel('tonicity');
  // make the snapshot throw while the check is open (the prediction frames are taken before it)
  const orig = t.w.Element.prototype.cloneNode;
  t.w.Element.prototype.cloneNode = function () { if (this.id === 'tonCellSvg' && p.node.classList.contains('is-checking')) throw new Error('boom'); return orig.apply(this, arguments); };
  const { card, pic } = pass(t, 'tonicity', 'check');
  t.w.Element.prototype.cloneNode = orig;
  assert.ok(card, 'the card is still saved');
  assert.equal(pic, '');
  assert.doesNotMatch(card.explanation, /Hemolysis|stick-card-pic/);
  assert.match(card.explanation, /See it move again/);
});

test('snapshots copy only paint the clone would not get on its own', () => {
  const t = boot('bio-cell.html');
  const { pic } = pass(t, 'tonicity', 'check');
  // the chloroplast paint lives on attributes; it is not repeated as style
  assert.doesNotMatch(pic, /stroke="#4f8a3d" stroke-width="5.6" style=/);
  // ids stay renamed and unique to the card
  const ids = [...pic.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(ids.length > 3 && ids.every((x) => /--s/.test(x)), 'every id renamed');
  assert.doesNotMatch(pic, /url\(#rl-clip\)/, 'references follow the renamed ids');
});

/* ---------- validator ---------- */

function validate(dataSrc) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stick-'));
  const file = path.join(dir, 'bio-stick-data.js');
  fs.writeFileSync(file, dataSrc);
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'validate-bio-stick.mjs'), file], { encoding: 'utf8' });
  fs.rmSync(dir, { recursive: true, force: true });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
}
const DATA = fs.readFileSync(path.join(BIO, 'bio-stick-data.js'), 'utf8');
const TON_FRAME = "checkFrame: [{ click: '#tonPlant' }, { set: '#tonSolute', value: 92 }],";

test('validator: the real data passes and counts its check frames', () => {
  const r = validate(DATA);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /15 entries, 30 questions OK/);
  assert.match(r.out, /10 check frames/);
});

test('validator: a checkFrame selector that is not on the hub page is caught', () => {
  assert.ok(DATA.includes(TON_FRAME));
  const r = validate(DATA.replace(TON_FRAME, "checkFrame: [{ click: '#tonNowhere' }, { set: '#tonSolute', value: 92 }],"));
  assert.equal(r.code, 1);
  assert.match(r.out, /\[tonicity\] checkFrame step: #tonNowhere not found in bio-cell\.html/);
});

test('validator: an empty checkFrame and an unknown step shape are caught', () => {
  let r = validate(DATA.replace(TON_FRAME, 'checkFrame: [],'));
  assert.equal(r.code, 1);
  assert.match(r.out, /\[tonicity\] checkFrame must be a non-empty list of steps/);
  r = validate(DATA.replace(TON_FRAME, "checkFrame: [{ tap: '#tonPlant' }],"));
  assert.equal(r.code, 1);
  assert.match(r.out, /\[tonicity\] checkFrame step 1 needs exactly one of set \/ click \/ operon/);
  r = validate(DATA.replace(TON_FRAME, "checkFrame: [{ operon: { mode: 'trp' } }],"));
  assert.equal(r.code, 1);
  assert.match(r.out, /operon steps only work on the genetics hub/);
  r = validate(DATA.replace(TON_FRAME, "checkFrame: [{ set: '#tonSolute' }],"));
  assert.equal(r.code, 1);
  assert.match(r.out, /set needs a value/);
});

/* ---------- provenance for the true-to-life views ---------- */

const REFS = JSON.parse(fs.readFileSync(path.join(BIO, 'bio-visual-references.json'), 'utf8'));

test('provenance: one record per true-to-life view and state, each with an empty sign-off block', () => {
  assert.deepEqual(REFS.views.map((v) => v.id), [
    'tonicity-rbc-isotonic', 'tonicity-rbc-hypotonic', 'tonicity-rbc-lysed', 'tonicity-rbc-hypertonic',
    'tonicity-elodea-isotonic', 'tonicity-elodea-turgid', 'tonicity-elodea-plasmolyzed',
    'sarcomere-model-relaxed', 'sarcomere-model-contracting', 'sarcomere-model-contracted',
    'sarcomere-tem-relaxed', 'sarcomere-tem-contracting', 'sarcomere-tem-contracted',
    'bone-long-gross', 'bone-ground-section'
  ]);
  const refIds = new Set(REFS.references.map((r) => r.id));
  assert.equal(refIds.size, REFS.references.length, 'reference ids unique');
  REFS.views.forEach((v) => {
    for (const k of ['view', 'state', 'depicts', 'mustMatch']) assert.ok(typeof v[k] === 'string' && v[k].length > 4, v.id + ': ' + k);
    assert.ok(v.facts.length >= 2, v.id + ': facts');
    v.facts.forEach((f) => assert.ok(f.fact && f.real && f.code, v.id + ': fact has a claim, the real value and its code'));
    assert.ok(v.references.length >= 1 && v.references.every((r) => refIds.has(r)), v.id + ': references resolve');
    assert.deepEqual(Object.keys(v.signoff), ['reviewer', 'date', 'verdict', 'notes']);
    Object.values(v.signoff).forEach((x) => assert.equal(x, '', v.id + ': sign-off starts empty'));
    // the page to open exists, and its deep link opens a stick panel
    const m = /^\/tools\/bio\/([\w-]+\.html)#stick-([a-z-]+)$/.exec(v.open.page);
    assert.ok(m, v.id + ': open.page ' + v.open.page);
    assert.ok(fs.existsSync(path.join(BIO, m[1])), v.id + ': page exists');
    assert.ok(DATA.includes("id: '" + m[2] + "'"), v.id + ': stick entry ' + m[2]);
  });
});

test('provenance: every code location still holds the line it cites', () => {
  const seen = new Map();
  REFS.views.forEach((v) => v.facts.forEach((f) => {
    const c = f.code;
    if (!seen.has(c.file)) seen.set(c.file, fs.readFileSync(path.join(ROOT, c.file), 'utf8').split('\n'));
    const lines = seen.get(c.file);
    assert.ok(Number.isInteger(c.line) && c.line >= 1 && c.line <= lines.length, v.id + ': line in range');
    assert.ok(lines.some((l) => new RegExp(c.match).test(l)), v.id + ': "' + c.match + '" no longer in ' + c.file + ' (update bio-visual-references.json)');
    assert.ok(c.sets && c.sets.length > 5, v.id + ': says what the line sets');
  }));
});

test('provenance: references say how far they were checked; plain ASCII, no personal data', () => {
  const src = fs.readFileSync(path.join(BIO, 'bio-visual-references.json'), 'utf8');
  assert.match(src, /^[\x00-\x7f]*$/, 'plain ASCII');
  assert.doesNotMatch(src, /@|\b\d{3}[-. ]\d{3}[-. ]\d{4}\b/, 'no email addresses or phone numbers');
  assert.doesNotMatch(src, /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/, 'no ALLCAPS tokens the placeholder gate would flag');
  assert.deepEqual(Object.keys(REFS.verification).sort(), ['not-verified', 'seen-in-search']);
  REFS.references.forEach((r) => {
    assert.ok(Object.prototype.hasOwnProperty.call(REFS.verification, r.verification), r.id + ': verification');
    assert.ok(r.url === '' ? r.verification === 'not-verified' : /^https:\/\/[\w.-]+\.\w+\//.test(r.url), r.id + ': url');
    assert.ok(r.license && r.use, r.id + ': license and use');
  });
});
