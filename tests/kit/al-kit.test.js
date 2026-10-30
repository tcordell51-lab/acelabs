/* The kit: shared/al-kit.js (window.AL) and shared/al-kit.css.
   jsdom, plain node:test. The script is evaluated the way a page loads it. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '../..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const KIT_JS = read('shared/al-kit.js');
const OPEN = [];
test.afterEach(() => { while (OPEN.length) { try { OPEN.pop().window.close(); } catch (e) { /* closed */ } } });

function boot(opts = {}) {
  const dom = new JSDOM(opts.html || '<!doctype html><html><body></body></html>', { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/' });
  OPEN.push(dom);
  const w = dom.window;
  const state = { reduced: !!opts.reduced, narrow: !!opts.narrow };
  w.matchMedia = (q) => ({ matches: /reduce/.test(q) ? state.reduced : /max-width/.test(q) ? state.narrow : false, media: q, addListener() {}, removeListener() {} });
  w.scrollTo = () => {};
  w.eval(KIT_JS);
  return { w, AL: w.AL, doc: w.document, state };
}

test('icons: one set, 24 grid, aria-hidden beside a word, Today is a sunrise', () => {
  const { AL, doc } = boot();
  const names = ['today', 'learn', 'play', 'prove', 'keep', 'predict', 'bio', 'gchem', 'ochem', 'pat', 'rc', 'qr', 'sheet', 'arrow', 'back', 'replay',
    'next', 'good', 'review', 'skipcall', 'eye', 'drag', 'flag', 'grid', 'marker', 'strike', 'branch', 'lens', 'drop', 'calendar', 'close'];
  for (const n of names) assert.ok(AL.ICONS[n], 'icon ' + n);
  const svg = AL.icon('today', 'sm');
  assert.match(svg, /viewBox="0 0 24 24"/);
  assert.match(svg, /aria-hidden="true"/);
  assert.match(svg, /M3 17\.5h18/, 'a horizon line');
  assert.match(svg, /a5\.4 5\.4 0 0 1 10\.8 0/, 'a rising sun, never a clock face');
  const labelled = AL.icon('close', '', 'Close');
  assert.match(labelled, /role="img" aria-label="Close"/);
  assert.doesNotMatch(labelled, /aria-hidden/);
  doc.body.innerHTML = '<span data-icon="keep"></span>';
  AL.fillIcons(doc); AL.fillIcons(doc);
  assert.equal(doc.querySelectorAll('svg.ico').length, 1, 'filled once');
});

test('uniq: rl- and dw- ids are made unique per call, with every reference that points at them', () => {
  const { AL, doc } = boot();
  const svg = '<svg><defs><radialGradient id="rl-g"/><clipPath id="dw-clip"/><filter id="keep-me"/></defs>' +
    '<circle id="rl-d" fill="url(#rl-g)" clip-path="url( #dw-clip)"/><use href="#rl-d"/><use xlink:href="#rl-d"/><rect filter="url(#keep-me)"/></svg>';
  const a = AL.uniq(svg), b = AL.uniq(svg);
  assert.notEqual(a, b);
  const sfx = /id="rl-d(-u[0-9a-z]+)"/.exec(a)[1];
  for (const ref of ['id="rl-g' + sfx, 'url(#rl-g' + sfx, 'id="dw-clip' + sfx, 'href="#rl-d' + sfx, 'xlink:href="#rl-d' + sfx]) assert.ok(a.includes(ref), ref);
  assert.ok(a.includes('id="keep-me"') && a.includes('url(#keep-me)'), 'other ids are left alone');
  doc.body.innerHTML = a + b;
  const ids = [...doc.querySelectorAll('[id^="rl-"],[id^="dw-"]')].map((n) => n.id);
  assert.equal(new Set(ids).size, ids.length, 'no duplicate specimen ids on one page');
  assert.equal(AL.uniq(null), '');
});

test('band: Predict, Play, Prove, Keep; one current step, earlier ones done, set(4) is the whole loop', () => {
  const { AL, doc } = boot();
  const el = doc.createElement('div'); doc.body.appendChild(el);
  const band = AL.band(el);
  const st = () => [...el.querySelectorAll('.st')];
  assert.deepEqual(st().map((s) => s.textContent), ['Predict', 'Play', 'Prove', 'Keep']);
  assert.equal(el.getAttribute('role'), 'list');
  assert.equal(st()[0].getAttribute('aria-current'), 'step');
  band.set(2);
  assert.deepEqual(st().map((s) => s.className.replace('st', '').trim()), ['done', 'done', 'on', '']);
  assert.equal(el.querySelectorAll('[aria-current]').length, 1);
  assert.equal(el.style.getPropertyValue('--band-at'), String(2 / 3));
  band.set(4);
  assert.ok(st().every((s) => s.classList.contains('done')) && !el.querySelector('[aria-current]'));
  assert.ok(el.classList.contains('complete'));
  assert.equal(band.get(), 4);
});

test('reduced motion: waits cut, motion tokens read 0, nothing flies, flip does not animate', async () => {
  const { AL, doc, w } = boot({ reduced: true });
  assert.equal(AL.reduced(), true);
  assert.equal(AL.ms('frame'), 0);
  const t0 = Date.now(); await AL.wait(5000); assert.ok(Date.now() - t0 < 500, 'wait cut under reduced motion');
  let animated = 0;
  w.HTMLElement.prototype.animate = function () { animated++; return { onfinish: null }; };
  doc.body.innerHTML = '<div id="card" class="acecard">x</div><nav><a class="door" data-id="review"><span class="di"></span></a></nav><ul id="l"><li>a</li><li>b</li></ul>';
  let done = 0;
  AL.fly(doc.getElementById('card'), () => done++);
  assert.equal(done, 1, 'done at once');
  assert.equal(doc.querySelectorAll('.flying').length, 0, 'no flight');
  let mutated = 0;
  AL.flip(doc.getElementById('l'), () => { mutated++; doc.getElementById('l').prepend(doc.getElementById('l').lastElementChild); });
  assert.equal(mutated, 1);
  assert.equal(animated, 0);
});

test('motion: tokens, the card flight to any target, a settle where it lands', () => {
  const { AL, doc, w } = boot();
  assert.equal(AL.ms('frame'), 900);
  assert.equal(AL.ms('card'), 620);
  const calls = [];
  w.HTMLElement.prototype.animate = function (frames, o) { const a = { onfinish: null }; calls.push({ el: this, frames, o, a }); return a; };
  w.HTMLElement.prototype.getBoundingClientRect = function () { return { left: 10, top: 10, width: 100, height: 60, right: 110, bottom: 70 }; };
  doc.body.innerHTML = '<div id="card" class="acecard"><b id="inner">x</b></div><div id="rung"></div>';
  let done = 0;
  AL.fly(doc.getElementById('card'), () => done++, doc.getElementById('rung'));
  const layer = doc.querySelector('.al.flying');
  assert.ok(layer, 'the clone rides in its own .al layer');
  assert.equal(layer.getAttribute('aria-hidden'), 'true');
  assert.equal(layer.querySelectorAll('[id]').length, 0, 'ids stripped from the clone');
  assert.equal(calls[0].o.duration, 620);
  assert.equal(done, 0);
  calls[0].a.onfinish();
  assert.equal(done, 1);
  assert.equal(doc.querySelectorAll('.flying').length, 0);
  assert.equal(calls[1].el.id, 'rung', 'the target settles once');
  assert.equal(calls[1].o.duration, 260);
});

test('follow never moves focus; tabbarOn only where a page opts in', async () => {
  const { AL, doc, state } = boot({ narrow: true });
  doc.body.innerHTML = '<button id="b">x</button><div id="stage"></div><div id="ace-shell"></div>';
  doc.getElementById('b').focus();
  await AL.follow(doc.getElementById('stage'));
  await AL.follow(doc.getElementById('stage'), { to: doc.getElementById('b'), prefer: 'end' });
  assert.equal(doc.activeElement.id, 'b');
  assert.equal(AL.tabbarOn(), false, 'top bar unless the page asks for the bottom one');
  doc.documentElement.setAttribute('data-ace-shell-pos', 'bottom');
  assert.equal(AL.tabbarOn(), true);
  state.narrow = false;
  assert.equal(AL.tabbarOn(), false, 'desktop never has the tab bar');
});

test('dates: the device date, pinned only by setClock', () => {
  const { AL } = boot();
  AL.setClock(new Date(2026, 9, 30, 9, 0));
  assert.equal(AL.dayName(0), 'Friday');
  assert.equal(AL.dayName(1), 'Saturday');
  assert.equal(AL.shortDate(0), 'Fri, Oct 30');
  assert.equal(AL.longDate(1), 'Saturday, October 31');
  assert.equal(AL.isoDate(2), '2026-11-01');
  assert.equal(AL.backOn(1), 'tomorrow, Saturday');
  assert.equal(AL.backOn(3), 'Monday');
  assert.equal(AL.backOn(7), 'Friday, November 6');
  AL.setClock(null);
  const d = new Date();
  const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  assert.equal(AL.isoDate(0), iso);
});

test('toast: one role=status line, reused, carries .al', () => {
  const { AL, doc } = boot();
  AL.toast('Card saved to Review. Back tomorrow, Saturday.');
  AL.toast('Second <b>line</b>');
  const t = doc.querySelectorAll('#al-toast');
  assert.equal(t.length, 1);
  assert.equal(t[0].getAttribute('role'), 'status');
  assert.ok(t[0].classList.contains('al') && t[0].classList.contains('show'));
  assert.match(t[0].textContent, /Second <b>line<\/b>/, 'text, never markup');
});

test('shell bridge: the Review door and its dot, in the light DOM or the shell shadow root', () => {
  const { AL, doc, w } = boot();
  doc.body.innerHTML = '<nav><a class="door" data-id="review"><span class="di"><i class="due" hidden></i></span><span class="sr" data-due-sr></span></a></nav>';
  AL.setDue(3);
  assert.equal(doc.querySelector('.due').hidden, false);
  assert.equal(doc.querySelector('[data-due-sr]').textContent, ', 3 cards back today');
  AL.setDue(0);
  assert.equal(doc.querySelector('.due').hidden, true);
  doc.body.innerHTML = '<div id="ace-shell"></div>';
  const sr = doc.getElementById('ace-shell').attachShadow({ mode: 'open' });
  sr.innerHTML = '<a class="door" data-id="review"><span class="di" id="in-shadow"></span></a>';
  assert.equal(AL.door('review').id, 'in-shadow');
  let got = null;
  w.AceShell = { setDue: (n) => { got = n; }, door: () => null };
  AL.setDue(2);
  assert.equal(got, 2, 'the shell owns the dot when it is there');
});

/* ---------- the stylesheet ---------- */
function selectors(css) {
  const out = [];
  const src = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let i = 0, depth = 0, buf = '', stack = [];
  while (i < src.length) {
    const c = src[i];
    if (c === '{') {
      const pre = buf.trim(); buf = '';
      if (pre.startsWith('@media') || pre.startsWith('@supports')) stack.push('group');
      else if (pre.startsWith('@keyframes')) stack.push('keyframes');
      else { stack.push('rule'); if (!stack.slice(0, -1).includes('keyframes')) out.push(pre); }
      depth++;
    } else if (c === '}') { stack.pop(); depth--; buf = ''; } else if (c === ';' && stack[stack.length - 1] !== 'group') buf = ''; else buf += c;
    i++;
  }
  return out;
}
/* split a selector list on top-level commas only (not inside :is() or :where()) */
function splitTop(list) {
  const out = []; let depth = 0, cur = '';
  for (const ch of list) { if (ch === '(') depth++; if (ch === ')') depth--; if (ch === ',' && !depth) { out.push(cur.trim()); cur = ''; } else cur += ch; }
  out.push(cur.trim());
  return out.filter(Boolean);
}
test('al-kit.css and al-loop.css: every rule is scoped to .al, so an engine page can load them safely', () => {
  for (const f of ['shared/al-kit.css', 'shared/al-loop.css']) {
    const sels = selectors(read(f));
    assert.ok(sels.length > 40 || f.endsWith('loop.css'), f + ' parsed');
    for (const group of sels) for (const s of splitTop(group)) {
      assert.match(s, /^(html\.al\b|\.al\b|html\[data-ace-shell-pos="bottom"\] \.al\b)/, f + ': unscoped selector "' + s + '"');
    }
  }
});
test('al-kit.css: components read context colors and tokens, never a raw Playfair or a Google font', () => {
  const css = read('shared/al-kit.css') + read('shared/al-loop.css');
  assert.doesNotMatch(css, /Playfair/i);
  assert.doesNotMatch(css, /fonts\.(googleapis|gstatic)/);
  assert.doesNotMatch(css, /@import/);
  assert.match(css, /--f-display/);
  assert.match(css, /font:var\(--font-coach\)/, 'the coach line is the voice token (DM Sans italic)');
  assert.match(css, /\.al \.bench,\.al \.coach,\.al\.toast\{[^}]*--c-ink:var\(--b-ink\)/, 'bench context');
  // gold never marks an outcome: the key and your call use the Wong pair
  assert.match(css, /\.al \.opt\.key\{border-color:var\(--c-good\)/);
  assert.match(css, /\.al \.opt\.mine\{border-color:var\(--c-trap\)/);
  // the reveal rises and fades, it never shakes
  assert.doesNotMatch(css, /@keyframes[^{]*(shake|pulse|bounce|glow)/i);
});

test('house copy: the kit and the loop are plain ASCII with no banned words', () => {
  for (const f of ['shared/al-kit.js', 'shared/al-kit.css', 'shared/al-loop.js', 'shared/al-loop.css']) {
    // the copy-rule table names the banned words in order to ban them
    const src = read(f).replace(/var COPY_RULES = \[[\s\S]*?\];/, '');
    assert.doesNotMatch(src, /[^\x09\x0a\x0d\x20-\x7e]/, f + ' has a non-ASCII character');
    const strings = f.endsWith('.js') ? (src.match(/'(?:[^'\\\n]|\\.)*'/g) || []).join('\n') : src;
    assert.doesNotMatch(strings, /\b(wrong|incorrect|failed|streak|leaderboard|XP|best score|badge)\b/i, f);
    assert.doesNotMatch(strings, /\b(days? (left|to go)|time remaining)\b/i, f + ' has countdown copy');
    assert.doesNotMatch(src, /setInterval\s*\(/, f + ' runs a clock');
  }
});
