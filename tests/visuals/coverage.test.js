// "See it" coverage: every topic a student can meet in the full-length mocks and the free practice
// sets opens a visual, and every whiteboard is complete and well formed. node --test
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..', '..');

global.window = global;
require(path.join(ROOT, 'shared/ace-skills.js'));
const V = require(path.join(ROOT, 'shared/ace-visuals.js'));
const B = require(path.join(ROOT, 'shared/ace-board.js'));
B.files.forEach((f) => require(path.join(ROOT, 'shared/boards/' + f + '.js')));
const TOPICS = require(path.join(ROOT, 'data/topics.json'));
require(path.join(ROOT, 'tools/mock/data/full-mocks.js'));

/* Topics with no honest visual yet. A wrong picture is worse than none, so a topic may stay empty on
   purpose. Shrink this list by building the board, never by aliasing to something unrelated.
   Empty since the second set of boards (2026-11-24). */
const NO_VISUAL_YET = [];

function item(raw, secDefault) {
  const sec = V.section(raw.section || secDefault), tp = String(raw.topic || 'general'), m = (TOPICS[sec] || {})[tp];
  const it = { section: sec, topic: m ? m[0] : tp, topicName: raw.topicName || (m ? m[1] : tp.replace(/-/g, ' ')), stem: '' };
  const sk = raw.skill ? { skillName: raw.skillName || raw.skill } : window.AceSkills.tag(it);
  it.concept = sk.skillName; return it;
}
function sweep(items) {
  const miss = {}; let n = 0, hit = 0;
  for (const it of items) {
    if (!it.section || it.section === 'pat' || it.section === 'rc') continue;
    n++;
    if (V.match(it)) { hit++; continue; }
    const key = it.section + ' | ' + it.topicName, full = key + ' | ' + it.concept;
    if (NO_VISUAL_YET.includes(key) || NO_VISUAL_YET.includes(full)) continue;
    miss[full] = (miss[full] || 0) + 1;
  }
  return { n, hit, miss };
}

test('every science and QR item in the full-length mocks opens a visual', () => {
  for (const m of window.ACE_FULL_MOCKS.mocks) {
    const items = [];
    for (const s of Object.keys(m.sections)) for (const q of m.sections[s] || []) items.push(item(Object.assign({}, q, { section: q.section || s, topic: q.stop || q.topic, topicName: q.topic }), s));
    const r = sweep(items);
    assert.deepStrictEqual(r.miss, {}, m.id + ' has topics with no visual');
    assert.ok(r.hit / r.n >= 0.95, m.id + ' hit rate ' + r.hit + '/' + r.n);
  }
});

test('every topic in the free practice sets opens a visual', () => {
  for (const f of ['bio', 'gchem', 'ochem', 'qr-dat', 'qr-climb']) {
    const r = sweep(require(path.join(ROOT, 'data/' + f + '.json')).items.map((x) => item(x)));
    assert.deepStrictEqual(r.miss, {}, f + ' has topics with no visual');
    assert.ok(r.hit / r.n >= 0.95, f + ' hit rate ' + r.hit + '/' + r.n);
  }
});

test('Retold night titles, GuacaMOLE and the QR drill keys all resolve', () => {
  const want = [
    ['gchem', 'The mole bridge', 'mole-bridge'], ['gchem', 'Proton traffic', 'acid-base'], ['gchem', 'Balance and the push-back', 'equilibrium'],
    ['gchem', 'The energy ledger', 'energy-ledger'], ['gchem', 'Downhill: entropy and free energy', 'energy-ledger'], ['gchem', 'Gases', 'gases'],
    ['gchem', 'How fast, not how far', 'kinetics'], ['gchem', 'The charge ledger', 'redox'],
    ['bio', 'Cellular respiration', 'respiration'], ['bio', 'Photosynthesis', 'photosynthesis'],
    ['ochem', 'The alpha carbon wakes up', 'enolates'], ['ochem', 'SN1/SN2/E1/E2', 'sn-e-decide'],
    ['qr', 'Fractions, decimals and number sense', 'number-line'], ['qr', 'The setup mindset', 'algebra-setup'],
    ['qr', 'Powers, roots and quadratics', 'powers-roots'], ['qr', 'Trigonometry, just enough', 'trig-triangle']
  ];
  for (const [section, topicName, board] of want) assert.strictEqual((V.match({ section, topicName }) || {}).board, board, topicName);
  assert.strictEqual(V.match({ section: 'gchem', topic: 'GuacaMOLE' }).url, '/gc/guacamole/');
  for (const k of ['geo-2d', 'vol-sa', 'tri-inv', 'coord', 'p-cond', 'zscore', 'desc-stats', 'exps', 'lin-eq', 'estim'])
    assert.ok(V.match({ section: 'qr', topic: k }), 'qr key ' + k);
});

test('the two TikTok production pages are out of the registry', () => {
  const all = JSON.stringify(V.tools);
  assert.ok(!/tiktok/i.test(all));
});

test('every whiteboard is registered, complete and well formed', () => {
  const boards = B.list();
  assert.ok(boards.length >= 12, 'at least 12 boards');
  const reg = V.tools.filter((t) => t.board);
  assert.deepStrictEqual(reg.map((t) => t.board).sort(), boards.map((b) => b.id).sort(), 'registry and board data agree');
  for (const b of boards) {
    const t = reg.find((x) => x.board === b.id);
    assert.strictEqual(t.path, '/see/?b=' + b.id);
    assert.strictEqual(V.section(b.section), t.section, b.id + ' section');
    assert.strictEqual(t.title, b.title, b.id + ' title matches the registry');
    assert.ok(b.steps.length >= 3 && b.steps.length <= 6, b.id + ' has 3 to 6 reveal steps');
    const svg = typeof b.svg === 'function' ? b.svg(B.kit) : b.svg;
    for (let i = 1; i <= b.steps.length; i++) assert.ok(svg.includes('data-step="' + i + '"'), b.id + ' draws step ' + i);
    assert.ok(!svg.includes('data-step="' + (b.steps.length + 1) + '"'), b.id + ' has a caption for every drawn step');
    assert.strictEqual(b.tryIt.length, 3, b.id + ' has three Try it questions');
    for (const q of [b.predict].concat(b.tryIt)) {
      assert.ok(q.q && q.why, b.id + ' question text and reason');
      assert.ok(q.choices.length >= 2 && q.choices.length <= 4, b.id + ' choices');
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length, b.id + ' answer index');
      assert.strictEqual(new Set(q.choices).size, q.choices.length, b.id + ' duplicate choice');
    }
    if (b.path) assert.ok(b.path.steps.length >= 4 && b.path.steps.length <= 7, b.id + ' pathway length');
    for (const l of b.more || []) {
      let f = l.href.split('#')[0].split('?')[0]; if (f.endsWith('/')) f += 'index.html';
      assert.ok(fs.existsSync(path.join(ROOT, f)), b.id + ' more link ' + l.href);
    }
    assert.ok(!/[\u2013\u2014]/.test(JSON.stringify(b) + svg), b.id + ' has no long dashes');
  }
});

test('the chip is a 44px link that names the visual, and nothing when there is no match', () => {
  const h = V.chipHTML({ section: 'gchem', topic: 'mole-conv', topicName: 'Mole Conversions' }, 'review');
  assert.match(h, /class="see-chip"/); assert.match(h, /href="\/see\/\?b=mole-bridge&amp;from=review"/); assert.match(h, /data-see-board="mole-bridge"/);
  assert.match(h, /See it: The mole bridge/);
  assert.strictEqual(V.chipHTML({ section: 'rc', topic: 'vocab' }, 'review'), '');
  const plain = V.chipHTML({ section: 'gchem', topic: 'vsepr' }, 'set');
  assert.ok(!/data-see-board/.test(plain)); assert.match(plain, /href="\/gc\/vsepr\/\?from=set"/);
});

test('every PAT subtest and every Reading question type opens its own whiteboard', () => {
  const pat = { keyholes: 'pat-keyholes', tfe: 'pat-tfe', angles: 'pat-angles', holepunch: 'pat-holepunch', cubes: 'pat-cubes', patternfold: 'pat-patternfold' };
  for (const k of Object.keys(pat)) {
    assert.strictEqual((V.match({ section: 'pat', topic: k, skill: k }) || {}).board, pat[k], 'pat subtest ' + k);
    assert.match(V.chipHTML({ section: 'pat', topic: k }, 'set'), new RegExp('data-see-board="' + pat[k] + '"'));
  }
  for (const [name, board] of [['Keyholes', 'pat-keyholes'], ['Top, front, end', 'pat-tfe'], ['Top-Front-End', 'pat-tfe'], ['Angle ranking', 'pat-angles'], ['Hole punching', 'pat-holepunch'], ['Cube counting', 'pat-cubes'], ['Pattern folding', 'pat-patternfold']])
    assert.strictEqual((V.match({ section: 'pat', topicName: name }) || {}).board, board, 'pat name ' + name);
  const rc = { detail: 'rc-question-types', inference: 'rc-question-types', tone: 'rc-question-types', purpose: 'rc-question-types', except: 'rc-question-types', function: 'rc-question-types', application: 'rc-question-types', mainidea: 'rc-map', pacing: 'rc-pacing' };
  for (const k of Object.keys(rc)) assert.strictEqual((V.match({ section: 'rc', topic: k }) || {}).board, rc[k], 'rc type ' + k);
  /* every question type the Reading bank and the full-length mocks use, except vocabulary in context (no board teaches it yet) */
  const used = new Set();
  for (const f of fs.readdirSync(path.join(ROOT, 'tools/rc/data'))) if (/\.json$/.test(f)) (fs.readFileSync(path.join(ROOT, 'tools/rc/data', f), 'utf8').match(/"type":\s*"[a-z]+"/g) || []).forEach((m) => used.add(m.replace(/.*"([a-z]+)"$/, '$1')));
  for (const k of used) if (k !== 'vocab') assert.ok((V.match({ section: 'rc', topic: k }) || {}).board, 'rc bank type ' + k);
});

test('the new topic keys from the v3 full-lengths resolve to their boards', () => {
  const want = [
    ['gchem', 'Measurement and lab technique', 'Lab Techniques (general)', 'lab-glassware'], ['gchem', 'Sig Figs and Measurement', '', 'sig-figs'],
    ['gchem', 'The two questions: measurement and the lab', '', 'sig-figs'], ['gchem', 'Quantum Numbers + Photons', '', 'quantum'],
    ['gchem', 'Periodic Trends', '', 'periodic-trends'], ['gchem', 'Nuclear Chemistry', 'Nuclear half-life', 'nuclear'],
    ['gchem', 'Solutions and Concentration', 'Colligative properties (Raoult\'s, FP, BP, osmotic)', 'solutions'],
    ['bio', 'Lab techniques', 'Biotechnology & lab (PCR, gel, cloning, microscopy)', 'biotech'], ['bio', 'Membranes and transport', '', 'cell-membrane'],
    ['bio', 'Mendelian genetics', '', 'genetics'], ['bio', 'Diversity of life', '', 'taxonomy'], ['bio', 'Reproduction and development', '', 'development'],
    ['ochem', 'Stereochemistry', 'R / S assignment', 'stereo'], ['ochem', 'Acids and bases in OChem', 'pKa & relative acidity', 'pka-ladder'],
    ['ochem', 'IR and NMR', 'IR spectroscopy', 'spectroscopy'], ['ochem', 'Alkene additions', 'Markovnikov\'s rule', 'alkene-map'], ['ochem', 'Synthesis', 'Synthesis (general)', 'synthesis'],
    ['qr', 'Data sufficiency', 'Data sufficiency (general)', 'data-sufficiency'], ['qr', 'Quantitative comparison', 'Quantitative comparison (general)', 'quant-compare'],
    ['qr', 'Probability', 'Basic probability', 'probability'], ['qr', 'Statistics', 'Mean / median / mode / range', 'statistics'], ['qr', 'Ratios, proportions and unit conversion', '', 'units']
  ];
  for (const [section, topicName, concept, board] of want) assert.strictEqual((V.match({ section, topicName, concept }) || {}).board, board, section + ' | ' + topicName + ' | ' + concept);
  assert.strictEqual(V.match({ section: 'ochem', topicName: 'Alkene additions', concept: 'Diels-Alder reaction' }).id, 'oc-diels', 'Diels-Alder keeps its own tool');
});

test('board text is never drawn under 14px on a 390px phone', () => {
  assert.strictEqual(B.kit.MIN_TEXT, 26, '26 board units of 720 is 14.08px at 390');
  for (const b of B.list()) {
    const svg = typeof b.svg === 'function' ? b.svg(B.kit) : b.svg;
    for (const m of svg.match(/font-size="[\d.]+"/g) || []) assert.ok(parseFloat(m.slice(11)) >= 26, b.id + ' has text at ' + m);
    for (const q of [b.predict].concat(b.tryIt)) if (q.fig) for (const m of q.fig.match(/font-size="[\d.]+"/g) || []) assert.ok(parseFloat(m.slice(11)) >= 26, b.id + ' figure text ' + m);
  }
  const css = fs.readFileSync(path.join(ROOT, 'shared/ace-board.css'), 'utf8');
  assert.match(css, /@media \(max-width: 599px\)[^}]*\{\s*\.bd-board \{[^}]*margin-left: calc\(50% - 50vw\)/, 'the board runs edge to edge on a phone');
});

test('every section has boards, and the game feeds are well formed', () => {
  const boards = B.list(), by = {};
  for (const b of boards) by[b.section] = (by[b.section] || 0) + 1;
  for (const s of ['gchem', 'bio', 'ochem', 'qr', 'pat', 'rc']) assert.ok(by[s] >= 3, s + ' has ' + (by[s] || 0) + ' boards');
  assert.ok(boards.length >= 55, boards.length + ' boards');
  let flick = 0, tug = 0;
  for (const b of boards) {
    if (b.flick) {
      flick++;
      assert.ok(b.flick.title && b.flick.up && b.flick.down, b.id + ' flick labels');
      assert.ok(b.flick.cards.length >= 10, b.id + ' has at least ten flick cards');
      const ups = b.flick.cards.filter((c) => c.up === true).length;
      assert.ok(ups >= 3 && b.flick.cards.length - ups >= 3, b.id + ' flick deck is not one sided');
      for (const c of b.flick.cards) assert.ok(c.q && c.why && typeof c.up === 'boolean', b.id + ' flick card');
      assert.strictEqual(new Set(b.flick.cards.map((c) => c.q)).size, b.flick.cards.length, b.id + ' duplicate flick card');
    }
    if (b.tug) {
      tug++;
      let n = 0;
      for (const set of b.tug.sets) { assert.ok(set.rxn && set.cards.length >= 3, b.id + ' tug set'); for (const c of set.cards) { n++; assert.ok(c.change && c.why && ['left', 'right', 'none'].includes(c.dir), b.id + ' tug card'); } }
      assert.ok(n >= 10, b.id + ' has at least ten tug cards');
    }
    if (b.play) { const [g, id] = b.play.split(':'); const src = boards.find((x) => x.id === id); assert.ok(src && src[g], b.id + ' borrows a game that exists'); }
    const pl = B.play(b); assert.ok(pl, b.id + ' ends on a one-tap game link');
    if (b.path || b.flick || b.tug || b.play) { assert.ok(pl && /^Play a round: /.test(pl.label), b.id + ' play link'); assert.ok(fs.existsSync(path.join(ROOT, pl.href.split('?')[0], 'index.html')), b.id + ' game page ' + pl.href); }
    else assert.strictEqual(pl, null);
  }
  assert.ok(flick >= 4 && tug >= 1, 'Trend Flick has decks and Q vs K Tug has reactions');
});
