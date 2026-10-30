/* The shared Call it first engine: shared/al-loop.js (window.AceLoop) on
   shared/al-kit.js (window.AL). jsdom, plain node:test. Most runs use reduced
   motion, where every frame waits for a Next frame press and nothing is timed. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '../..');
const SRC = ['shared/al-kit.js', 'shared/al-loop.js'].map((f) => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n;\n');
const OPEN = [];
test.afterEach(() => { while (OPEN.length) { try { OPEN.pop().window.close(); } catch (e) { /* closed */ } } });
const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));

function boot(opts = {}) {
  const dom = new JSDOM('<!doctype html><html><body><nav><a class="door" data-id="review"><span class="di"><i class="due" hidden></i></span></a></nav><div id="host"></div></body></html>',
    { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/' });
  OPEN.push(dom);
  const w = dom.window;
  const reduced = opts.reduced !== false;
  w.matchMedia = (q) => ({ matches: /reduce/.test(q) ? reduced : false, media: q, addListener() {}, removeListener() {} });
  w.scrollTo = () => {};
  const warns = [];
  w.console.warn = (...a) => warns.push(a.join(' '));
  const cards = [];
  if (opts.progress !== false) w.AceProgress = { addPlayCard: (c) => cards.push(c) };
  w.eval(SRC);
  w.AL.setClock(new Date(2026, 9, 30, 9));
  return { w, doc: w.document, AL: w.AL, AceLoop: w.AceLoop, host: w.document.getElementById('host'), cards, warns };
}

function entry(over = {}) {
  return Object.assign({
    id: 'tonicity', section: 'bio', subtopic: 'Membrane transport', title: 'Tonicity',
    stage: { tags: ['Light microscope', '1000x oil'], before: '<b>Before:</b> red cells in a matching drop.' },
    predict: {
      q: 'An animal cell drops into pure water. What happens to it?',
      options: ['It swells and bursts (lyses)', 'It shrivels up (crenates)', 'It swells, then holds its shape'], key: 0,
      traps: [null, 'Shriveling is the salty-water picture.', 'That is a plant cell.'],
      trapNames: [null, 'Reversed', 'Neighbor fact'],
      replan: [null, 'you called the salty-water picture for pure water', 'you gave an animal cell a wall'],
      why: 'The cell has more solute than pure water, so water floods in.', hook: 'Water chases solute.'
    },
    check: {
      q: 'A plant cell sits in very salty water. What do you see?',
      options: ['It swells (turgid)', 'The membrane pulls off the wall (plasmolysis)', 'Nothing changes'], key: 1,
      traps: ['Turgid is the pure-water picture.', null, 'Water still leaves.'], trapNames: ['Reversed', null, 'Half right'],
      why: 'Water leaves and the membrane shrinks away from the wall.'
    },
    card: { idea: 'Animal cell in pure water: it swells and bursts.', recallIdea: 'Plant cell in salt water: plasmolysis.', hook: 'Water chases solute.', labels: ['before', 'pure water'] },
    honesty: 'Each position is a fresh slide. Burst cells never re-form.',
    links: { night: { href: '/tools/bio-retold/', label: 'Retold night 3' } }
  }, over);
}
function steps(over = {}) {
  const calls = [];
  const d = Object.assign({
    kind: 'steps', frames: [50, 32, 18, 4], after: 92,
    render: (s) => { calls.push(s); return { svg: '<svg viewBox="0 0 10 10"><circle id="rl-c' + s + '" r="1"/><use href="#rl-c' + s + '"/></svg>', caption: 'State ' + s, aria: 'Field at ' + s, tag: s > 80 ? '400x' : '1000x oil' }; },
    drive: { label: 'Solute outside the cell', min: 0, max: 100, value: 4, words: (v) => (v < 12 ? 'nearly pure water' : 'some solute'), name: (v) => 'state ' + v, ticks: ['pure water', 'matches', 'very salty'] }
  }, over);
  d.calls = calls;
  return d;
}
const $ = (host, sel) => host.querySelector(sel);
const $$ = (host, sel) => [...host.querySelectorAll(sel)];
function through(loop, n = 4) { for (let i = 0; i < n; i++) loop.next(); }

test('mount: one bench with the band, the field, the call, Skip and Stuck', () => {
  const { host, AceLoop } = boot();
  const e = entry(), d = steps();
  assert.deepEqual([...AceLoop.validate(e, d)], []);
  const loop = AceLoop.mount(host, e, d);
  assert.ok(host.classList.contains('al'), 'the host carries the kit scope');
  const bench = $(host, 'article.bench.al-loop');
  assert.equal(bench.getAttribute('data-sec'), 'bio');
  assert.equal(bench.getAttribute('data-beat'), 'call');
  assert.deepEqual($$(host, '.band .st').map((s) => s.textContent), ['Predict', 'Play', 'Prove', 'Keep']);
  assert.equal($(host, '.band [aria-current="step"]').textContent, 'Predict');
  assert.equal($(host, '.prompt').textContent, e.predict.q);
  assert.equal($$(host, '[data-part="opts"] .opt').length, 3);
  assert.match($(host, '.skip').textContent, /Skip the call, just show me/);
  assert.match($(host, '.stuck-link').textContent, /Stuck\?/);
  assert.equal($(host, '.caption').textContent, 'Before: red cells in a matching drop.');
  assert.equal($(host, '.field .layer.real').getAttribute('aria-label'), 'Field at 50');
  assert.equal($$(host, '.field .tag').map((t) => t.textContent).join(' | '), 'Light microscope | 1000x oil');
  assert.equal(loop.beat(), 'call');
  // no timer, no countdown, no score anywhere on the bench
  assert.doesNotMatch(host.textContent, /seconds|time remaining|left|score|points|streak/i);
});

test('one tap locks the call; a second tap changes nothing', () => {
  const { host, AceLoop } = boot();
  const loop = AceLoop.mount(host, entry(), steps());
  const opts = $$(host, '[data-part="opts"] .opt');
  opts[1].click(); opts[2].click(); opts[0].click();
  assert.deepEqual(opts.map((o) => o.getAttribute('aria-pressed')), ['false', 'true', 'false']);
  assert.ok(opts.every((o) => o.getAttribute('aria-disabled') === 'true'), 'locked');
  assert.ok(opts.every((o) => !o.disabled), 'never the disabled property, which would drop focus');
  assert.equal(loop.beat(), 'watch');
  assert.equal($(host, '.band [aria-current="step"]').textContent, 'Play');
  through(loop);
  assert.equal(loop.result.predict.pick, 1);
});

test('reduced motion: auto-play becomes Next frame, and every frame keeps its caption', () => {
  const { host, AceLoop } = boot();
  const d = steps();
  const loop = AceLoop.mount(host, entry(), d);
  loop.pick(0);
  const btn = $(host, '[data-part="replay"]');
  const seen = [$(host, '.caption').textContent];
  assert.match(btn.textContent, /Next frame/);
  for (let i = 1; i < 4; i++) { loop.next(); seen.push($(host, '.caption').textContent); }
  assert.deepEqual(seen, ['Frame 1 of 4. State 50', 'Frame 2 of 4. State 32', 'Frame 3 of 4. State 18', 'Frame 4 of 4. State 4']);
  assert.match(btn.textContent, /See the verdict/);
  assert.equal($(host, '[data-part="verdict"]').hidden, true, 'the verdict waits for the student');
  loop.next();
  assert.equal($(host, '[data-part="verdict"]').hidden, false);
  assert.equal(btn.getAttribute('aria-label'), 'Play the slide again');
  // replay under reduced motion steps too: it never auto-plays
  btn.click();
  assert.match(btn.textContent, /Next frame/);
});

test('motion on: the frames play by themselves, one per frame token, then the verdict', async () => {
  const { host, AceLoop } = boot({ reduced: false });
  const loop = AceLoop.mount(host, entry(), steps({ frameMs: 5 }));
  loop.pick(0);
  assert.doesNotMatch($(host, '[data-part="replay"]').textContent, /Next frame/);
  /* poll, not a fixed wait: a busy machine runs the 5 ms frames late */
  for (let i = 0; i < 200 && loop.beat() !== 'verdict'; i++) await tick(10);
  assert.equal(loop.beat(), 'verdict');
  assert.equal($(host, '.caption').textContent, 'Frame 4 of 4. State 4');
  assert.equal($$(host, '.pips i.done').length, 4);
});

test('reveal: the key says Answer, a different pick says Your call, the rest fold away', () => {
  const { host, AceLoop } = boot();
  const loop = AceLoop.mount(host, entry(), steps());
  loop.pick(1); through(loop);
  const opts = $$(host, '[data-part="opts"] .opt');
  assert.ok(opts[0].classList.contains('key'));
  assert.equal(opts[0].querySelector('.tag').textContent, 'Answer');
  assert.ok(opts[1].classList.contains('mine'));
  assert.equal(opts[1].querySelector('.tag').textContent, 'Your call');
  assert.equal(opts[2].hidden, true, 'collapsed to the two that matter');
  assert.ok(opts.every((o) => o.getAttribute('aria-pressed') === 'false'));
  const { host: h2, AceLoop: A2 } = boot();
  const l2 = A2.mount(h2, entry(), steps());
  l2.pick(0); through(l2);
  assert.equal($(h2, '[data-part="opts"] .opt.key .tag').textContent, 'Answer, your call');
  assert.equal($$(h2, '[data-part="opts"] .opt:not([hidden])').length, 1);
});

test('verdict words: Confirmed or Needs review, the trap named, never shaking', () => {
  const { host, AceLoop } = boot();
  const loop = AceLoop.mount(host, entry(), steps());
  loop.pick(1); through(loop);
  const v = $(host, '[data-part="verdict"] .verdict');
  assert.ok(v.classList.contains('trap'));
  assert.equal(v.getAttribute('role'), null, 'the bench speaks through its own live region');
  const live = $(host, '[data-part="say"]');
  assert.equal(live.getAttribute('role'), 'status');
  assert.equal(live.textContent, 'Needs review. Your call: It shrivels up (crenates). Shriveling is the salty-water picture. The slide says: It swells and bursts (lyses). Trap: Reversed. Water chases solute.');
  assert.equal(v.querySelector('.vh').textContent, 'Needs review');
  assert.match(v.textContent, /Your call: It shrivels up \(crenates\)\. Shriveling is the salty-water picture\./);
  assert.match(v.textContent, /The slide says: It swells and bursts \(lyses\)\./);
  assert.equal(v.querySelector('.trapname').textContent, 'Trap: Reversed');
  assert.equal(v.querySelector('.hook').textContent, 'Water chases solute.');
  assert.equal(loop.result.predict.label, 'Needs review');
  assert.equal(loop.result.missWhy, 'you called the salty-water picture for pure water');
  const { host: h2, AceLoop: A2 } = boot();
  const l2 = A2.mount(h2, entry(), steps());
  l2.pick(0); through(l2);
  assert.equal($(h2, '.verdict .vh').textContent, 'Confirmed');
  assert.ok(!$(h2, '.verdict .trapname'));
  assert.match($(h2, '.verdict').textContent, /The cell has more solute/);
});

test('Skip is recorded as Shown without a call, never as a miss, and writes no card', () => {
  const { host, AceLoop, cards } = boot();
  const loop = AceLoop.mount(host, entry(), steps());
  $(host, '.skip').click();
  assert.ok($$(host, '[data-part="opts"] .opt').every((o) => o.getAttribute('aria-disabled') === 'true' && o.getAttribute('aria-pressed') === 'false'));
  through(loop);
  assert.deepEqual({ ...loop.result.predict }, { pick: -1, outcome: 'shown', label: 'Shown without a call' });
  assert.equal($(host, '.verdict .vh').textContent, 'Shown without a call');
  assert.ok($(host, '.verdict').classList.contains('plain'));
  assert.match($(host, '.verdict').textContent, /The slide says: It swells and bursts/);
  assert.equal($(host, '[data-part="opts"] .opt.key .tag').textContent, 'Answer');
  assert.ok(!$(host, '.opt.mine'));
  assert.equal(cards.length, 0);
  loop.prove(); loop.check(1);
  assert.equal(cards.length, 0, 'a clean recall after a skip still waits for Keep it');
  assert.match($(host, '.keep-note').textContent, /Recall confirmed/);
});

test('a miss writes its card at the verdict, through the play-cards adapter', async () => {
  const { host, AceLoop, cards, doc } = boot();
  const events = [];
  host.addEventListener('aceloop:card', (e) => events.push(e.detail));
  const loop = AceLoop.mount(host, entry(), steps());
  loop.pick(2); through(loop, 3);
  assert.equal(cards.length, 0, 'nothing before the verdict');
  loop.next();
  assert.equal(loop.beat(), 'verdict');
  assert.equal(cards.length, 1, 'written the moment the verdict lands, before any flight');
  const c = cards[0];
  assert.equal(c.id, 'play:tonicity');
  assert.equal(c.kind, 'play');
  assert.equal(c.from, 'call');
  assert.equal(c.outcome, 'needs-review');
  assert.equal(c.section, 'bio');
  assert.equal(c.subtopic, 'Membrane transport');
  assert.equal(c.answer, 'It swells and bursts (lyses)');
  assert.equal(c.yourCall, 'It swells, then holds its shape');
  assert.equal(c.trapName, 'Neighbor fact');
  assert.equal(c.idea, 'Animal cell in pure water: it swells and bursts.');
  assert.equal(c.hook, 'Water chases solute.');
  assert.equal(c.made, '2026-10-30');
  assert.equal(c.due, '2026-10-31');
  assert.match(c.pic, /<span class="pl">before<\/span>.*<span class="pl">pure water<\/span>/s, 'a before and after of what the student saw');
  assert.equal(events.length, 1);
  assert.equal(loop.result.cardSavedTo, 'play-cards');
  // a second miss in the same loop does not make a second card
  loop.prove(); loop.check(0);
  assert.equal(cards.length, 1);
  assert.equal(loop.result.check.outcome, 'needs-review');
  // Keep: the card is already saved; it shows, then (reduced motion) no flight, a toast
  assert.equal(loop.beat(), 'keep');
  await tick(20);
  assert.equal(loop.beat(), 'done');
  assert.ok(doc.querySelector('#al-toast').textContent.includes('Card saved to Review. Back tomorrow, Saturday.'));
  assert.equal(doc.querySelector('.due').hidden, true, 'the dot is the shell\'s to set unless the page says how many');
  assert.equal($(host, '.acecard .ac-t').textContent, 'Animal cell in pure water: it swells and bursts.');
  assert.match($(host, '.acecard .ac-when').textContent, /Back tomorrow, Saturday/);
  assert.equal(loop.result.kept, true);
});

test('a recall miss after a clean call writes the card at the recall verdict', async () => {
  const { host, AceLoop, cards } = boot();
  const loop = AceLoop.mount(host, entry(), steps(), { due: 3 });
  loop.pick(0); through(loop);
  assert.equal(cards.length, 0);
  loop.prove();
  assert.equal($(host, '.veil').classList.contains('off'), false, 'closed book: the field is veiled');
  assert.equal($(host, '.veil').getAttribute('aria-hidden'), 'false');
  assert.equal($(host, '.band [aria-current="step"]').textContent, 'Prove');
  loop.check(2);
  assert.equal(cards.length, 1);
  assert.equal(cards[0].from, 'recall');
  assert.equal(cards[0].idea, 'Plant cell in salt water: plasmolysis.');
  assert.equal(cards[0].trapName, 'Half right');
  assert.equal($(host, '.veil').classList.contains('off'), true, 'the slide comes back');
  assert.match($(host, '.caption').textContent, /The slide is back\./);
  assert.equal($(host, '.verdict .vh') && $(host, '[data-part="cverdict"] .vh').textContent, 'Needs review');
  await tick(20);
  assert.equal(host.ownerDocument.querySelector('.due').hidden, false, 'opts.due sets the dot');
});

test('a clean loop offers Keep it: Keep writes the card, Skip writes none', () => {
  const { host, AceLoop, cards } = boot();
  const done = [];
  const loop = AceLoop.mount(host, entry(), steps(), { onResult: (r) => done.push(r) });
  loop.pick(0); through(loop); loop.prove(); loop.check(1);
  assert.equal(loop.beat(), 'keep');
  assert.equal(cards.length, 0);
  assert.match($(host, '.keep-note').textContent, /Both calls confirmed\. Keep it anyway/);
  assert.match($(host, '.acecard .ac-k').textContent, /Not kept yet/);
  loop.keep();
  assert.equal(cards.length, 1);
  assert.equal(cards[0].from, 'keep');
  assert.equal(cards[0].outcome, 'confirmed');
  assert.equal(done.length, 1);
  assert.equal(done[0].kept, true);
  assert.equal($(host, '.band .st.done') && $$(host, '.band .st.done').length, 4);

  const b = boot();
  const l2 = b.AceLoop.mount(b.host, entry(), steps());
  l2.pick(0); through(l2); l2.prove(); l2.check(1);
  $(b.host, '[data-act="nokeep"]').click();
  assert.equal(b.cards.length, 0);
  assert.equal(l2.beat(), 'done');
  assert.equal(l2.result.kept, false);
  assert.match($(b.host, '.loop-done').textContent, /No card this time/);
});

test('cards go to the page first, then AceProgress.addPlayCard, else wait for it', () => {
  const page = [];
  const a = boot();
  const l1 = a.AceLoop.mount(a.host, entry(), steps(), { onCard: (c) => page.push(c) });
  l1.pick(1); through(l1);
  assert.equal(page.length, 1);
  assert.equal(a.cards.length, 0, 'the Bio adapter path (opts.onCard) wins');
  assert.equal(l1.result.cardSavedTo, 'page');
  const b = boot({ progress: false });
  const l2 = b.AceLoop.mount(b.host, entry(), steps());
  l2.pick(1); through(l2);
  assert.equal(l2.result.cardSavedTo, 'pending');
  assert.equal(b.AceLoop.pending.length, 1);
  const got = [];
  b.w.AceProgress = { addPlayCard: (c) => got.push(c) };
  assert.equal(b.AceLoop.flush(), 1);
  assert.equal(got[0].id, 'play:tonicity');
});

test('drive: the knob says words, the field answers, aria-valuetext names the state', () => {
  const { host, AceLoop } = boot();
  const d = steps();
  const loop = AceLoop.mount(host, entry(), d);
  loop.pick(0); through(loop);
  const knob = $(host, '.drive input[type=range]');
  assert.equal($(host, '.drive .dh').textContent, 'Now you drive');
  assert.match($(host, '.drive .honest').textContent, /Burst cells never re-form/);
  loop.drive(60);
  assert.equal($(host, '.drive output').textContent, 'some solute');
  assert.equal(knob.getAttribute('aria-valuetext'), 'some solute. state 60');
  assert.equal(d.calls[d.calls.length - 1], 60);
  assert.equal($(host, '.drive-slot [data-act="prove"]').textContent, 'One more, from memory');
});

test('wipe: a slider with words, arrow keys and Home / End', () => {
  const { host, AceLoop, w } = boot();
  const d = steps({ wipe: { render: (s) => '<svg><g id="dw-x' + s + '"/></svg>', words: () => 'one swelling cell' } });
  const loop = AceLoop.mount(host, entry(), d);
  loop.pick(0); through(loop);
  const h = $(host, '.wipe-handle');
  assert.equal(h.hidden, false);
  assert.equal(h.getAttribute('role'), 'slider');
  assert.equal(h.getAttribute('aria-valuenow'), '40');
  h.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  assert.equal(h.getAttribute('aria-valuenow'), '45');
  h.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
  assert.equal(h.getAttribute('aria-valuenow'), '0');
  assert.match(h.getAttribute('aria-valuetext'), /^Left: the textbook drawing, one swelling cell\. Right: the real slide\. Line at 0 percent\.$/);
  assert.ok($(host, '.field').classList.contains('wiping'));
  loop.prove();
  assert.equal(h.hidden, true, 'the wipe leaves for the closed-book recall');
});

test('tween: Next frame jumps stop to stop with each caption under reduced motion', () => {
  const { host, AceLoop } = boot();
  const ts = [];
  const d = { kind: 'tween', stops: [{ t: 0, caption: 'The stopcock opens.' }, { t: 0.5, caption: 'Halfway there.' }, { t: 1, caption: 'Half-equivalence.' }],
    render: (t) => { ts.push(t); return { svg: '<svg/>', caption: '', aria: 'curve at ' + t }; } };
  const e = entry({ section: 'gchem', id: 'half-eq', title: 'Titration curves' });
  const loop = AceLoop.mount(host, e, d);
  loop.pick(1);
  const caps = [$(host, '.caption').textContent];
  loop.next(); caps.push($(host, '.caption').textContent);
  loop.next(); caps.push($(host, '.caption').textContent);
  assert.deepEqual(caps, ['The stopcock opens.', 'Halfway there.', 'Half-equivalence.']);
  assert.deepEqual(ts.slice(-3), [0, 0.5, 1]);
  loop.next();
  assert.equal(loop.beat(), 'verdict');
  assert.match($(host, '.verdict').textContent, /The curve says: It swells and bursts/, 'the lead names the section noun');
});

test('tween with motion: a pure f(t) from 0 to 1, then the verdict', async () => {
  const { host, AceLoop } = boot({ reduced: false });
  const ts = [];
  const loop = AceLoop.mount(host, entry({ section: 'gchem' }), { kind: 'tween', duration: 40, render: (t) => { ts.push(t); return { svg: '<svg/>' }; } });
  loop.pick(0); // a clean call: no card picture is drawn after the watch
  for (let i = 0; i < 40 && loop.beat() !== 'verdict'; i++) await tick(50);
  assert.equal(loop.beat(), 'verdict');
  assert.equal(ts[ts.length - 1], 1);
  for (let i = 1; i < ts.length; i++) assert.ok(ts[i] >= ts[i - 1], 'monotone');
});

test('custom: setup, its own call, play, and still panels for reduced motion', async () => {
  const { host, AceLoop } = boot();
  const log = [];
  const d = {
    kind: 'custom', setupLabel: 'Fold it and punch',
    setup: (ctx) => { log.push('setup:' + ctx.reduced); ctx.caption('<b>Punch.</b>'); return Promise.resolve(); },
    call: (ctx) => { log.push('call'); ctx.mount.innerHTML = '<button id="lock">Lock in my call</button>'; return Promise.resolve({ pick: 0, ok: false, callLine: 'You called 2 of the 4 holes.', trap: 'You stopped after one unfold.', trapName: 'One step short', keyText: 'four holes' }); },
    play: (ctx) => { log.push('play'); ctx.stage.innerHTML = '<svg id="sheet"/>'; ctx.caption('Flat again.'); return Promise.resolve(); },
    stills: (k) => '<figure class="fig"><svg/><figcaption>' + (k === 'setup' ? 'Fold 1' : 'Unfold 1') + '</figcaption></figure>'
  };
  const e = entry({ section: 'pat', id: 'hole-punch', title: 'Hole punching', stage: { surface: 'paper', ratio: '1/1' } });
  assert.deepEqual([...AceLoop.validate(e, d)], []);
  const loop = AceLoop.mount(host, e, d);
  assert.equal(loop.beat(), 'setup');
  assert.ok($(host, '.field').classList.contains('paper'));
  $(host, '.call-host .btn').click();
  await tick(5);
  assert.equal($(host, '.stills').hidden, false);
  assert.match($(host, '.stills').textContent, /Unfold 1/, 'still panels while it plays');
  assert.deepEqual(log, ['setup:true', 'call', 'play']);
  assert.equal(loop.beat(), 'verdict');
  assert.equal($(host, '.verdict .vh').textContent, 'Needs review');
  assert.match($(host, '.verdict').textContent, /You called 2 of the 4 holes\. You stopped after one unfold\./);
  assert.equal($(host, '.verdict .trapname').textContent, 'Trap: One step short');
  assert.match($(host, '.verdict').textContent, /The sheet says: four holes\./);
  assert.ok($(host, '#sheet'), 'a custom driver draws its own stage');
  loop.prove(); loop.check(1);
  assert.ok($(host, '#sheet'), 'and the engine does not repaint over it after the recall');
});

test('focus is never lost: the pressed call keeps it; reduced motion hands it to Next frame', () => {
  for (const reduced of [true, false]) {
    const { host, AceLoop, doc } = boot({ reduced });
    const loop = AceLoop.mount(host, entry(), steps({ frameMs: 5 }));
    const b = $$(host, '[data-part="opts"] .opt')[1];
    b.focus(); b.click(); // Enter or Space on a button is a click
    assert.ok(doc.activeElement !== doc.body, 'not dropped to <body> (' + (reduced ? 'reduced' : 'motion') + ')');
    assert.ok(host.contains(doc.activeElement), 'still in the bench');
    if (reduced) {
      assert.equal(doc.activeElement, $(host, '[data-part="replay"]'), 'Next frame, the only way forward, has focus');
      assert.match(doc.activeElement.textContent, /Next frame/);
      through(loop);
      assert.equal(loop.beat(), 'verdict');
      assert.equal(doc.activeElement, $(host, '[data-part="replay"]'), 'the same button, now Play the slide again');
    } else {
      assert.equal(doc.activeElement, b, 'the pressed option keeps focus while the frames play');
    }
    loop.destroy();
  }
});

test('focus is never lost: Skip, Keep it, Skip I have this one, Move on and Play it again each hand it on', async () => {
  let r = boot({ reduced: false });
  let loop = r.AceLoop.mount(r.host, entry(), steps({ frameMs: 5 }));
  const skip = $(r.host, '.skip');
  skip.focus(); skip.click();
  assert.equal(r.doc.activeElement, $(r.host, '[data-part="call"] .prompt'), 'Skip leaves: focus goes to the question');
  for (let i = 0; i < 200 && loop.beat() !== 'verdict'; i++) await tick(10);
  assert.equal(r.doc.activeElement, $(r.host, '[data-part="call"] .prompt'), 'and stays there at the verdict');
  loop.destroy();

  r = boot();
  loop = r.AceLoop.mount(r.host, entry(), steps());
  loop.pick(0); through(loop); loop.prove(); loop.check(1);
  const keepBtn = $(r.host, '[data-act="keep"]');
  keepBtn.focus(); keepBtn.click();
  await tick(20);
  assert.equal(loop.beat(), 'done');
  assert.equal(r.doc.activeElement, $(r.host, '.loop-done'), 'Keep it leaves with the row: focus goes to Loop done');
  assert.equal($(r.host, '[data-part="saydone"]').textContent, 'Loop done. Card back tomorrow, Saturday. Predict, play, prove, keep: every tool here runs this same loop.');
  assert.match($(r.host, '[data-part="say"]').textContent, /^Confirmed\./, 'the recall verdict is still there to be read');
  const again = $(r.host, '[data-act="again"]');
  again.focus(); again.click();
  assert.equal(loop.beat(), 'call');
  assert.equal(r.doc.activeElement, $(r.host, '[data-part="call"] .prompt'), 'Play it again: focus goes to the fresh question');
  loop.destroy();

  r = boot();
  loop = r.AceLoop.mount(r.host, entry(), steps());
  loop.pick(0); through(loop); loop.prove(); loop.check(1);
  const no = $(r.host, '[data-act="nokeep"]');
  no.focus(); no.click();
  assert.equal(r.doc.activeElement, $(r.host, '.loop-done'));
  loop.destroy();

  /* Stuck, Move on for now: the sheet gives focus back to Stuck?, which then leaves */
  r = boot();
  loop = r.AceLoop.mount(r.host, entry(), steps());
  const stuck = $(r.host, '.stuck-link');
  stuck.focus(); stuck.click();
  [...r.doc.querySelectorAll('.sheet .so')].find((x) => /Move on for now/.test(x.textContent)).click();
  assert.equal(loop.beat(), 'done');
  assert.equal(r.doc.activeElement, $(r.host, '.loop-done'));
  loop.destroy();
});

test('focus that was never in the bench is left alone, and a kept card cannot be un-kept', async () => {
  const { host, AceLoop, doc, cards } = boot();
  const outside = doc.createElement('button'); outside.textContent = 'elsewhere'; doc.body.appendChild(outside);
  const loop = AceLoop.mount(host, entry(), steps());
  outside.focus();
  loop.pick(0); through(loop); loop.prove(); loop.check(1);
  assert.equal(doc.activeElement, outside, 'the recall prompt took focus at Prove, but only inside the bench');
  outside.focus();
  $(host, '[data-act="keep"]').click();
  $(host, '[data-act="nokeep"]') && $(host, '[data-act="nokeep"]').click();
  await tick(20);
  assert.equal(doc.activeElement, outside);
  assert.equal(cards.length, 1);
  assert.equal(loop.result.kept, true, 'Skip, I have this one is locked once Keep it is pressed');
});

test('Stuck: three moves tuned per section, focus in and back, Escape closes', () => {
  const { host, AceLoop, doc, w } = boot();
  AceLoop.mount(host, entry(), steps());
  const opener = $(host, '.stuck-link');
  opener.focus();
  opener.click();
  const sheet = doc.querySelector('.sheet-back .sheet');
  assert.equal(sheet.getAttribute('role'), 'dialog');
  assert.equal(sheet.getAttribute('aria-modal'), 'true');
  assert.equal(sheet.querySelector('h2').textContent, 'Feeling lost? Pick one.');
  assert.equal(sheet.querySelectorAll('.so').length, 3);
  assert.ok(!/breath/i.test(sheet.textContent), 'no breath box in Bio');
  assert.equal(doc.activeElement, sheet.querySelector('.so'));
  doc.activeElement.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.ok(!doc.querySelector('.sheet-back'));
  assert.equal(doc.activeElement, opener);
  for (const [sec, title, has] of [['qr', 'You have hit a wall. Pick one.', /A short breath/], ['ochem', 'Stuck on a mechanism? Pick one.', /reagent reference/], ['pat', 'Stuck on a figure? Pick one.', /Watch the method once/]]) {
    const s = AceLoop.stuck(sec, null, { method() {} });
    assert.equal(s.el.querySelector('h2').textContent, title);
    assert.match(s.el.textContent, has);
    s.close();
  }
});

test('Stuck, Move on for now: the card waits in Review, marked, and the loop ends calmly', () => {
  const { host, AceLoop, cards, doc } = boot();
  const loop = AceLoop.mount(host, entry(), steps());
  loop.stuck();
  const later = [...doc.querySelectorAll('.sheet .so')].find((b) => /Move on for now/.test(b.textContent));
  later.click();
  assert.equal(cards.length, 1);
  assert.equal(cards[0].from, 'stuck');
  assert.equal(cards[0].marked, true);
  assert.equal(loop.result.movedOn, true);
  assert.equal(loop.beat(), 'done');
  assert.match($(host, '.loop-done').textContent, /Moved on\. This one waits in Review, marked/);
});

test('validate: the per-section contract (2 to 4 options, a trap line and name per option, copy rules, stills)', () => {
  const { AceLoop, host, warns } = boot();
  const bad = entry({ predict: Object.assign({}, entry().predict, { options: ['a', 'b', 'c', 'd', 'e'], trapNames: [null, 'Reversed'] }) });
  const p = AceLoop.validate(bad, steps());
  assert.ok(p.some((m) => /predict\.options: 2 to 4/.test(m)));
  const p2 = AceLoop.validate(entry({ predict: Object.assign({}, entry().predict, { trapNames: [null, 'Reversed'] }) }), steps());
  assert.ok(p2.some((m) => /predict\.trapNames\[2\]/.test(m)));
  const p3 = AceLoop.validate(entry({ title: 'Tonicity — cells', honesty: 'That answer is wrong.' }), steps());
  assert.ok(p3.some((m) => /non-ASCII/.test(m)));
  assert.ok(p3.some((m) => /verdict word/.test(m)));
  assert.ok(AceLoop.validate(entry({ card: { idea: 'Earn 10 points and keep your streak' } }), steps()).some((m) => /points/.test(m)));
  const p4 = AceLoop.validate(entry(), { kind: 'custom', play: () => {} });
  assert.ok(p4.some((m) => /driver\.stills/.test(m)));
  assert.ok(AceLoop.validate(entry(), { kind: 'steps', frames: [1], render() {} }).some((m) => /driver\.frames/.test(m)));
  // unusable: nothing mounts, the page is told why
  assert.equal(AceLoop.mount(host, entry({ predict: { q: 'x', options: ['a'], key: 0 } }), steps()), null);
  assert.ok(warns.some((m) => /\[AceLoop\]/.test(m)));
  assert.equal(host.innerHTML, '');
});

test('specimens: every render goes through AL.uniq, so two benches never share an id', () => {
  const { doc, AceLoop } = boot();
  const h2 = doc.createElement('div'); doc.body.appendChild(h2);
  AceLoop.mount(doc.getElementById('host'), entry(), steps());
  AceLoop.mount(h2, entry({ id: 'tonicity-2' }), steps());
  const ids = [...doc.querySelectorAll('[id^="rl-"]')].map((n) => n.id);
  assert.equal(ids.length, 2);
  assert.notEqual(ids[0], ids[1]);
  const use = doc.querySelector('#host use');
  assert.equal(use.getAttribute('href'), '#' + doc.querySelector('#host [id^="rl-"]').id);
});

test('Play it again resets the bench to a fresh call', () => {
  const { host, AceLoop } = boot();
  const loop = AceLoop.mount(host, entry(), steps());
  loop.pick(0); through(loop); loop.prove(); loop.check(1); loop.noKeep();
  assert.equal(loop.beat(), 'done');
  const links = $$(host, '.loop-links a').map((a) => a.textContent);
  assert.deepEqual(links, ['Learn: Retold night 3']);
  $(host, '[data-act="again"]').click();
  assert.equal(loop.beat(), 'call');
  assert.equal(loop.result.predict, null);
  assert.equal($$(host, '[data-part="opts"] .opt:not([aria-disabled])').length, 3);
});

test('the planner hears every loop: the card carries the re-plan line, AceProgress.notePlay gets the result', async () => {
  const { host, AceLoop, w } = boot();
  const noted = [];
  w.AceProgress.notePlay = (r) => noted.push(r);
  const cards = [];
  w.AceProgress.addPlayCard = (c) => cards.push(c);
  const loop = AceLoop.mount(host, entry(), steps());
  loop.pick(1); through(loop);
  assert.equal(cards[0].missWhy, 'you called the salty-water picture for pure water');
  loop.prove(); loop.check(1);
  await tick(20);
  assert.equal(loop.beat(), 'done');
  assert.equal(noted.length, 1);
  assert.equal(noted[0].entryId, 'tonicity');
  assert.equal(noted[0].predict.outcome, 'needs-review');
  assert.equal(noted[0].missWhy, 'you called the salty-water picture for pure water');
});

test('end to end with the real store: a miss lands in Review, lights the dot, and Today re-plans', async () => {
  const { host, AceLoop, w } = boot({ progress: false });
  const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
  w.eval(read('shared/ace-index.js') + read('shared/ace-route.js') + read('shared/ace-progress.js'));
  const P = w.AceProgress;
  /* a returning student, so the plan is past its first run */
  w.localStorage.setItem('aceLabs:onboarding', JSON.stringify({ testDate: '2027-01-30', weakAreas: ['bio'], setAt: Date.now() - 5 * 864e5 }));
  w.localStorage.setItem('acelabs_diagnostic_v1', JSON.stringify({ ts: Date.now() - 4 * 864e5, perSection: { bio: { correct: 10, total: 20 } }, topWeakTopics: [] }));
  const loop = AceLoop.mount(host, entry(), steps());
  loop.pick(1); through(loop);
  assert.equal(loop.result.cardSavedTo, 'play-cards');
  const m = P.misses().find((x) => x.id === 'play:tonicity');
  assert.ok(m && m.source === 'play' && m.section === 'bio', 'listed for Review');
  const due = JSON.parse(w.localStorage.getItem('acelabs.v1.dueToday'));
  assert.equal(due.n + due.later.length, 1, 'the dot cache knows when it is back');
  loop.prove(); loop.check(1);
  await tick(20);
  const plan = P.todayPlan();
  assert.equal(plan.steps[0].entryId, 'tonicity');
  assert.equal(plan.steps[0].done, true);
  assert.equal(plan.steps[1].key, 'scene');
  assert.match(plan.said, /^Added one scene from night 3: you called the salty-water picture for pure water\./);
});
