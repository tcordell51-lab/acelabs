/* Card pictures for the Bio "Call it first" layer (tools/bio/bio-stick.js).
 *
 * An Ace Card is built from the prediction when the prediction slipped,
 * else from the from-memory check. Its picture, hook and replay link
 * must show that card's own question: the last watched frame, the hook
 * and the prediction replay for the prediction; the entry's check view
 * (checkFrame steps run at save time, checkStill parts), checkHook and
 * the #stick-<id>-check replay for the check. These tests lock the audit
 * of all 15 entries, the size budget, the veil, the validator rules for
 * checkFrame / checkStill / checkHook, and the provenance record of the
 * true-to-life views.
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

/* The audit, one row per entry: whether the check has its own steps
   (frame: checkFrame) and its own parts (still: checkStill), what a card
   about the CHECK must show (has, also), what it must not show (not:
   usually the prediction's state or the check's trap), and what the
   check view's caption says (cap). */
const AUDIT = {
  tonicity: { hub: 'cell', frame: true, still: false, has: /Plasmolysis \(Elodea leaf cells\)/, not: /Hemolysis|ghosts|Red blood cells/, cap: /HYPERTONIC/ },
  respiration: { hub: 'cell', frame: true, still: true, has: /Krebs cycle \S matrix/, also: /acetyl-CoA/, not: /INNER MITOCHONDRIAL MEMBRANE|ATP synthase/, cap: /Stage 3 \S Krebs cycle \(matrix/ },
  endocrine: { hub: 'physiology', frame: true, still: false, has: /Thyroid/, also: /TSH/, not: /Posterior Pituitary/ },
  nephron: { hub: 'physiology', frame: true, still: false, has: /Collecting Duct/, also: /aquaporin-2/, not: /Ascending Loop/ },
  'action-potential': { hub: 'physiology', frame: true, still: false, has: /HYPERPOL/, cap: /Hyperpolarization/ },
  'cross-bridge': { hub: 'physiology', frame: true, still: true, has: /bound to troponin C/, also: /pulling tropomyosin off the actin/, cap: /Cross-bridge forms/ },
  sarcomere: { hub: 'physiology', frame: false, still: false, has: /TEM VIEW/, also: /A band/ },
  bohr: { hub: 'physiology', frame: true, still: true, has: /DISSOCIATION CURVE/, also: /LEFT shift.*fetal Hb/, cap: /LEFT shift/ },
  'blood-types': { hub: 'physiology', frame: false, still: false, has: /Type A/, also: /Anti-B antibody/ },
  'ovarian-cycle': { hub: 'physiology', frame: true, still: false, has: /Progesterone/, cap: /LUTEAL \| Day 21/ },
  'bone-layers': { hub: 'physiology', frame: true, still: false, has: /cross-section of compact bone \(ground section\)/, also: /Haversian canal/, cap: /Osteon/ },
  'lac-operon': { hub: 'genetics', frame: true, still: true, has: /TRP OPERON/, also: /Trp acts as corepressor/, not: /LAC OPERON|Lactose/, cap: /OFF/ },
  'hardy-weinberg': { hub: 'genetics', frame: false, still: true, has: /random mating/, also: /no selection/ },
  'embryo-stages': { hub: 'devo', frame: true, still: false, has: /Neurula/, also: /neural tube/, not: /Gastrula/ },
  homology: { hub: 'evolution', frame: false, still: false, has: /Analogous structures/ }
};
const hasView = (a) => a.frame || a.still;

test('the audit covers every entry, and checkFrame / checkStill are set exactly where the audit says', () => {
  const t = boot('bio-cell.html');
  const entries = t.w.BIO_STICK_ENTRIES;
  assert.deepEqual(Array.from(entries, (e) => e.id).sort(), Object.keys(AUDIT).sort());
  entries.forEach((e) => {
    assert.equal(Array.isArray(e.checkFrame) && e.checkFrame.length > 0, AUDIT[e.id].frame, e.id + ': checkFrame');
    assert.equal(Array.isArray(e.checkStill) && e.checkStill.length > 0, AUDIT[e.id].still, e.id + ': checkStill');
    assert.equal(e.hub, AUDIT[e.id].hub, e.id + ': hub');
    // every entry carries its own check hook, different from the prediction hook
    assert.ok(typeof e.checkHook === 'string' && e.checkHook.length > 10, e.id + ': checkHook');
    assert.notEqual(e.checkHook, e.hook, e.id + ': checkHook is its own line');
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
      assert.doesNotMatch(text, /\u2014/, id + ': no em dash on the card');
      // the hook is the check's own; the link replays the check's view when it has one
      assert.ok(card.explanation.includes('<p><b>Hook:</b> ' + esc(e.checkHook) + '</p>'), id + ': check hook');
      assert.ok(!card.explanation.includes(esc(e.hook)), id + ': no prediction hook on a check card');
      const link = card.explanation.match(/<p class="stick-card-link"><a href="([^"]+)">/)[1];
      assert.equal(link, '/tools/bio/' + file + '#stick-' + id + (hasView(a) ? '-check' : ''), id + ': replay link');
      if (hasView(a)) {
        assert.ok(p.cardSnap, id + ': the check view was taken');
        assert.equal(pic, p.cardSnap.html, id + ': the card holds the check view');
        assert.notEqual(pic, p.frames[p.frames.length - 1].html, id + ': the check view differs from the last watched frame');
        if (a.cap) assert.match(p.cardSnap.caption, a.cap, id + ': check view caption');
      } else {
        assert.equal(p.cardSnap, null, id + ': no check view');
        assert.equal(pic, p.frames[p.frames.length - 1].html, id + ': the card reuses the last watched frame');
      }
    }
    assert.deepEqual(t.errs, [], hub);
  }
});

test('every card about the prediction keeps the last frame, the hook and the replay the student watched', () => {
  for (const file of Object.values(HUB_FILE)) {
    const t = boot(file);
    for (const id of Object.keys(t.w.BioStick.panels)) {
      const { p, e, card, pic, text } = pass(t, id, 'predict');
      assert.equal(card.q, esc(e.predict.q), id + ': the card asks the prediction');
      assert.equal(p.cardSnap, null, id + ': no check frame for a prediction card');
      assert.ok(pic.length > 0 && pic.length <= MAX_STILL_CHARS, id + ': picture is ' + pic.length + ' characters');
      assert.equal(pic, p.frames[p.frames.length - 1].html, id + ': last watched frame');
      assert.doesNotMatch(text, /\u2014/, id + ': no em dash on the card');
      assert.ok(card.explanation.includes('<p><b>Hook:</b> ' + esc(e.hook) + '</p>'), id + ': prediction hook');
      assert.ok(!card.explanation.includes(esc(e.checkHook)), id + ': no check hook on a prediction card');
      assert.match(card.explanation, new RegExp('<a href="/tools/bio/' + file.replace('.', '\\.') + '#stick-' + id + '">'), id + ': replay link');
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

test('a check card link replays the prediction and ends on the check view; a prediction link does not', () => {
  const first = boot('bio-cell.html');
  pass(first, 'tonicity', 'check');
  const saved = first.store.get('acethedat_bio_engine_v1');
  // the student opens the card's link later: the panel is done, so it replays
  const viaCheck = boot('bio-cell.html', { hash: '#stick-tonicity-check', seed: { acethedat_bio_engine_v1: saved } });
  const p = viaCheck.panel('tonicity');
  assert.ok(p.node.classList.contains('is-done'));
  assert.equal(p.frames.length, p.entry.frames.length + 1, 'prediction frames, then the check view');
  assert.match(p.frames[0].html, /Red blood cells/);
  assert.match(p.frames[p.frames.length - 1].html, /Plasmolysis \(Elodea leaf cells\)/);
  assert.match(viaCheck.w.document.getElementById('tonCellSvg').innerHTML, /Plasmolysis/, 'the visualizer ends on the card state');
  assert.match(p.node.querySelector('.stick-frame').innerHTML, /Plasmolysis/, 'reduced motion shows the last frame at once');
  assert.deepEqual(viaCheck.errs, []);
  const viaPredict = boot('bio-cell.html', { hash: '#stick-tonicity', seed: { acethedat_bio_engine_v1: saved } });
  const q = viaPredict.panel('tonicity');
  assert.equal(q.frames.length, q.entry.frames.length);
  assert.match(q.frames[q.frames.length - 1].html, /Hemolysis/);
  // an entry without a check view treats the -check link as a plain replay
  const s1 = boot('bio-physiology.html');
  pass(s1, 'sarcomere', 'check');
  const s2 = boot('bio-physiology.html', { hash: '#stick-sarcomere-check', seed: { acethedat_bio_engine_v1: s1.store.get('acethedat_bio_engine_v1') } });
  const r = s2.panel('sarcomere');
  assert.equal(r.frames.length, r.entry.frames.length);
  assert.ok(s2.w.document.querySelector('.lab-module[data-module="filament"]').classList.contains('active'), 'the lab tab opens');
  assert.deepEqual(s2.errs, []);
});

test('respiration: the Krebs question saves the Krebs stage explainer, not the ETC picture with the trap label', () => {
  const t = boot('bio-cell.html');
  const { p, pic, text } = pass(t, 'respiration', 'check');
  assert.match(text, /Krebs cycle \S matrix/);
  assert.doesNotMatch(pic, /<svg/, 'only the explainer, no diagram');
  assert.equal(t.w.document.getElementById('krbStage').value, '45', 'the visualizer sits on the Krebs stage');
  assert.match(p.frames[p.frames.length - 1].html, /INNER MITOCHONDRIAL MEMBRANE/, 'the prediction card keeps the ETC picture');
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
  assert.match(r.out, /11 check frames, 5 check stills/);
});

test('validator: checkStill selectors are checked like still, and an empty checkStill is caught', () => {
  const HW = "checkStill: ['.lab-module[data-module=\"hw\"] .gen-side .energy-step-info'],";
  assert.ok(DATA.includes(HW));
  let r = validate(DATA.replace(HW, "checkStill: ['.lab-module[data-module=\"hwx\"] .gen-side'],"));
  assert.equal(r.code, 1);
  assert.match(r.out, /\[hardy-weinberg\] checkStill: \[data-module="hwx"\] not found in bio-genetics\.html/);
  r = validate(DATA.replace("checkStill: ['#krbExplain'],", "checkStill: ['#krbNowhere'],"));
  assert.equal(r.code, 1);
  assert.match(r.out, /\[respiration\] checkStill: #krbNowhere not found in bio-cell\.html/);
  r = validate(DATA.replace(HW, 'checkStill: [],'));
  assert.equal(r.code, 1);
  assert.match(r.out, /\[hardy-weinberg\] checkStill must be a non-empty list of selectors/);
});

test('validator: a hook over 140 characters and an id ending in -check are caught', () => {
  const HOOK = "checkHook: 'Water chases solute: into salt water it leaves, and the membrane pulls off the wall.',";
  assert.ok(DATA.includes(HOOK));
  let r = validate(DATA.replace(HOOK, "checkHook: '" + 'a'.repeat(141) + "',"));
  assert.equal(r.code, 1);
  assert.match(r.out, /\[tonicity\] checkHook must be a non-empty string of 140 characters or fewer/);
  r = validate(DATA.replace("id: 'homology',", "id: 'homology-check',"));
  assert.equal(r.code, 1);
  assert.match(r.out, /\[homology-check\] id must not end in -check/);
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
const DOCS = fs.readFileSync(path.join(ROOT, 'docs', 'bio-visual-references.md'), 'utf8');

/* A sign-off block: the four fields in order, each empty or filled the
   way docs/bio-visual-references.md says (no email in the published
   file, an ISO date, one of the listed verdicts; a verdict needs a
   reviewer and a date). Returns the problems, none for a good block. */
function signoffProblems(s, verdicts) {
  const out = [];
  if (!s || typeof s !== 'object') return ['missing'];
  if (JSON.stringify(Object.keys(s)) !== JSON.stringify(['reviewer', 'date', 'verdict', 'notes'])) out.push('fields must be reviewer, date, verdict, notes');
  if (typeof s.reviewer !== 'string' || s.reviewer.includes('@')) out.push('reviewer: initials or a role, no email');
  if (typeof s.date !== 'string' || (s.date !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(s.date))) out.push('date: empty or YYYY-MM-DD');
  if (typeof s.verdict !== 'string' || (s.verdict !== '' && !verdicts.includes(s.verdict))) out.push('verdict: empty or one of the listed verdicts');
  if (typeof s.notes !== 'string') out.push('notes: text');
  if (typeof s.verdict === 'string' && s.verdict !== '' && (!s.reviewer || !s.date)) out.push('a verdict needs a reviewer and a date');
  return out;
}

test('provenance: the TEM M line rule reads the way the histology review states it', () => {
  const src = fs.readFileSync(path.join(BIO, 'bio-visual-references.json'), 'utf8');
  for (const [name, text] of [['bio-visual-references.json', src], ['bio-visual-references.md', DOCS]]) {
    assert.doesNotMatch(text, /never paler than the overlap/, name + ': the M line is never darker than the overlap, not never paler');
  }
  REFS.views.filter((v) => /^sarcomere-tem-/.test(v.id)).forEach((v) => {
    const f = v.facts.find((x) => /^Density order/.test(x.fact));
    assert.match(f.real, /M line is darker than the H zone but never darker than the overlap/, v.id);
    assert.match(f.fact, v.id === 'sarcomere-tem-contracted' ? /overlap = M line/ : /overlap > M line > H zone/, v.id + ': the order follows the state');
  });
});

test('provenance: a filled sign-off passes; an unknown verdict, an email or a loose date does not', () => {
  const V = REFS.verdicts;
  assert.deepEqual(signoffProblems({ reviewer: '', date: '', verdict: '', notes: '' }, V), []);
  assert.deepEqual(signoffProblems({ reviewer: 'coach', date: '2026-11-02', verdict: 'approved', notes: '' }, V), []);
  assert.deepEqual(signoffProblems({ reviewer: 'TC', date: '2026-11-02', verdict: 'approved after the listed changes', notes: 'TEM: mitochondria a touch pale' }, V), []);
  assert.match(signoffProblems({ reviewer: 'coach', date: '2026-11-02', verdict: 'looks great', notes: '' }, V).join(), /verdict/);
  assert.match(signoffProblems({ reviewer: 'me@example.org', date: '2026-11-02', verdict: 'approved', notes: '' }, V).join(), /no email/);
  assert.match(signoffProblems({ reviewer: 'coach', date: 'Nov 2', verdict: 'approved', notes: '' }, V).join(), /YYYY-MM-DD/);
  assert.match(signoffProblems({ reviewer: '', date: '', verdict: 'approved', notes: '' }, V).join(), /needs a reviewer and a date/);
  assert.match(signoffProblems({ reviewer: 'coach', verdict: 'approved', date: '2026-11-02', notes: '' }, V).join(), /fields must be/);
  // the real file, with one block filled the way the docs say, still passes the record test below
  const filled = JSON.parse(JSON.stringify(REFS));
  filled.views[0].signoff = { reviewer: 'coach', date: '2026-11-02', verdict: 'approved', notes: '' };
  filled.views.forEach((v) => assert.deepEqual(signoffProblems(v.signoff, filled.verdicts), [], v.id));
});

test('provenance: one record per true-to-life view and state, each with a valid sign-off block', () => {
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
    v.facts.forEach((f) => {
      assert.ok(f.fact && f.real && f.code, v.id + ': fact has a claim, the real value and its code');
      assert.ok(Object.prototype.hasOwnProperty.call(REFS.statuses, f.status), v.id + ': status of "' + f.fact + '"');
      if (f.status === 'matches') assert.equal(f.reason, undefined, v.id + ': a match needs no reason');
      else assert.ok(typeof f.reason === 'string' && f.reason.length > 20, v.id + ': a ' + f.status + ' fact says why');
    });
    assert.ok(v.references.length >= 1 && v.references.every((r) => refIds.has(r)), v.id + ': references resolve');
    assert.deepEqual(signoffProblems(v.signoff, REFS.verdicts), [], v.id + ': sign-off');
    // the page to open exists, and its deep link opens a stick panel
    const m = /^\/tools\/bio\/([\w-]+\.html)#stick-([a-z-]+)$/.exec(v.open.page);
    assert.ok(m, v.id + ': open.page ' + v.open.page);
    assert.ok(fs.existsSync(path.join(BIO, m[1])), v.id + ': page exists');
    assert.ok(DATA.includes("id: '" + m[2] + "'"), v.id + ': stick entry ' + m[2]);
  });
});

test('provenance: every flagged fact is named in the docs list', () => {
  const m = DOCS.match(/## Facts already flagged\n([\s\S]*?)\n## /);
  assert.ok(m, 'docs have a Facts already flagged section');
  const listed = new Set([...m[1].matchAll(/^- `([a-z-]+)`:/gm)].map((x) => x[1]));
  const flagged = new Set(REFS.views.filter((v) => v.facts.some((f) => f.status !== 'matches')).map((v) => v.id));
  assert.deepEqual([...listed].sort(), [...flagged].sort());
  const n = REFS.views.reduce((k, v) => k + v.facts.filter((f) => f.status !== 'matches').length, 0);
  const words = ['zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
  assert.match(m[1].trimStart(), new RegExp('^' + words[n] + ' facts? (is|are) marked'), 'the count in the docs');
});

test('provenance: every code location still holds the line it cites', () => {
  const seen = new Map();
  REFS.views.forEach((v) => v.facts.forEach((f) => {
    const c = f.code;
    if (!seen.has(c.file)) seen.set(c.file, fs.readFileSync(path.join(ROOT, c.file), 'utf8').split('\n'));
    const lines = seen.get(c.file);
    const re = new RegExp(c.match);
    assert.ok(Number.isInteger(c.line) && c.line >= 1 && c.line <= lines.length, v.id + ': line in range');
    if (!re.test(lines[c.line - 1])) {
      const now = lines.map((l, i) => (re.test(l) ? i + 1 : 0)).filter(Boolean);
      assert.fail(v.id + ': ' + c.file + ' line ' + c.line + ' no longer holds "' + c.match + '"; ' +
        (now.length ? 'it is now on line ' + now.join(', ') : 'it is gone') + ' (update bio-visual-references.json)');
    }
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
