/* =====================================================================
   PAT Hole Punching: the loop outside Biology, on a custom driver.
   Call: watch two folds and a punch, then tap the grid where the holes
   land. Watch: the sheet unfolds backwards, crease by crease. Drive: the
   student folds it back up with a scrubber. Recall: one DAT-format item,
   from memory. Card: the unfolded sheet, the rule "Mirror, never slide."
   Reduced motion: the folds become still panels drawn the way the DAT
   draws them; the scrubber still works.
   Geometry is the PAT engine's (tools/pat/engine/pat-holepunch.js).
   ===================================================================== */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var band = AL.band($('band'));
  /* cells are row * 4 + col. Punch at (2,0); the unfolds give (1,0), (1,3), (2,0), (2,3) */
  var HOLES = [4, 7, 8, 11];
  var TL = $('TL'), TR = $('TR'), HR = $('hr');
  var callMissed = false, recallMissed = false;

  function setFold(a, b) {
    TL.style.transform = 'perspective(900px) rotateX(' + (-180 * a) + 'deg)';
    TR.style.transform = 'perspective(900px) rotateX(' + (-180 * a) + 'deg)';
    HR.style.transform = 'perspective(1100px) rotateY(' + (-180 * b) + 'deg)';
    var s1 = Math.sin(Math.PI * a) * 0.28 + (a > .5 ? 0.05 : 0);
    TL.querySelector('.shade').style.opacity = s1; TR.querySelector('.shade').style.opacity = s1;
    $('rshade').style.opacity = Math.sin(Math.PI * b) * 0.24;
    TL.style.zIndex = TR.style.zIndex = a > .5 ? 2 : 1;
    HR.style.zIndex = 3;
  }
  function cap(html) { $('cap').innerHTML = html; }
  function tw(from, to, ms, fn) {
    return new Promise(function (res) {
      if (AL.reduced()) { fn(to); res(); return; }
      var t0 = performance.now();
      (function step(now) {
        var t = Math.min(1, (now - t0) / ms), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        fn(from + (to - from) * e);
        if (t < 1) requestAnimationFrame(step); else res();
      })(t0);
    });
  }
  function crease(id, on) { $(id).classList.toggle('on', on); }
  function stills(kind) {
    function fig(inner, label) { return '<div class="fig"><svg viewBox="0 0 72 72" aria-hidden="true">' + inner + '</svg>' + label + '</div>'; }
    var dash = 'fill="none" stroke="#666" stroke-width="1.6" stroke-dasharray="4 3"', solid = 'fill="#fff" stroke="#111" stroke-width="2"';
    if (kind === 'unfold') return '<div class="stills" aria-label="The unfold, step by step">' +
      fig('<rect x="8" y="36" width="28" height="28" ' + solid + '/><circle cx="15" cy="43" r="4" fill="#111"/>', 'Folded') +
      fig('<rect x="8" y="36" width="56" height="28" ' + solid + '/><circle cx="15" cy="43" r="4" fill="#111"/><circle cx="57" cy="43" r="4" fill="#111"/><path d="M36 36v28" stroke="#C9A84C" stroke-width="2"/>', 'Unfold 1') +
      fig('<rect x="8" y="8" width="56" height="56" ' + solid + '/><circle cx="15" cy="43" r="4" fill="#111"/><circle cx="57" cy="43" r="4" fill="#111"/><circle cx="15" cy="29" r="4" fill="#111"/><circle cx="57" cy="29" r="4" fill="#111"/><path d="M8 36h56" stroke="#C9A84C" stroke-width="2"/>', 'Unfold 2') + '</div>';
    return '<div class="stills" aria-label="The folds, step by step">' +
      fig('<rect x="8" y="8" width="56" height="28" ' + dash + '/><rect x="8" y="36" width="56" height="28" ' + solid + '/>', 'Fold 1: top down') +
      fig('<rect x="36" y="36" width="28" height="28" ' + dash + '/><rect x="8" y="36" width="28" height="28" ' + solid + '/>', 'Fold 2: right over') +
      fig('<rect x="8" y="36" width="28" height="28" ' + solid + '/><circle cx="15" cy="43" r="4" fill="#111"/>', 'Punch') + '</div>';
  }
  $('stuckBtn').addEventListener('click', function () { AceLoop.stuck('pat', this); });

  /* 1. the setup: fold, fold, punch */
  async function foldAndPunch() {
    $('actions').innerHTML = '';
    if (AL.reduced()) $('stillsBox').innerHTML = stills('fold');
    AL.follow($('sheet'));
    cap('<b>Fold 1.</b> The top half folds down onto the bottom half.');
    crease('ch', true); await AL.wait(350);
    await tw(0, 1, 900, function (v) { setFold(v, 0); });
    crease('ch', false);
    cap('<b>Fold 2.</b> The right half folds over onto the left.');
    crease('cv', true); await AL.wait(350);
    await tw(0, 1, 900, function (v) { setFold(1, v); });
    crease('cv', false);
    await AL.wait(250);
    $('sheet').classList.add('punched');
    cap('<b>Punch.</b> One hole, through every layer, near the folded corner.');
    $('sheet').setAttribute('aria-label', 'The sheet, folded twice into the bottom left quarter, with one hole punched in its top left square');
    await AL.wait(600);
    callMode();
  }
  /* 2. the call: tap squares on the full outline */
  function callMode() {
    var g = $('grid');
    g.hidden = false; g.innerHTML = '';
    for (var i = 0; i < 16; i++) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'cell'; b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-label', 'Row ' + (Math.floor(i / 4) + 1) + ', column ' + (i % 4 + 1));
      b.addEventListener('click', function () {
        if (g.classList.contains('locked')) return;
        this.setAttribute('aria-pressed', String(this.getAttribute('aria-pressed') !== 'true'));
        var n = g.querySelectorAll('[aria-pressed="true"]').length;
        $('lockBtn').disabled = n === 0;
        $('lockBtn').textContent = n ? 'Lock in my ' + n + (n === 1 ? ' call' : ' calls') : 'Lock in my call';
      });
      g.appendChild(b);
    }
    $('q').textContent = 'Where are the holes when it opens? Tap every square that will have one.';
    cap('Tap squares on the dashed outline. Tap again to take one back.');
    $('actions').innerHTML = '<button class="btn gold" id="lockBtn" type="button" disabled>Lock in my call</button><button class="skip" id="skip" type="button">Skip the call, just show me</button>';
    $('lockBtn').onclick = function () { unfold(true); };
    $('skip').onclick = function () { unfold(false); };
  }
  /* 3. watch: unfold backwards */
  async function unfold(called) {
    $('grid').classList.add('locked');
    $('actions').innerHTML = '';
    band.set(1);
    if (AL.reduced()) $('stillsBox').innerHTML = stills('unfold');
    cap('<b>Unfold 1.</b> The last fold opens first. The hole mirrors across the vertical crease.');
    crease('cv', true); await AL.wait(300);
    await tw(1, 0, 1000, function (v) { setFold(1, v); });
    crease('cv', false); await AL.wait(350);
    cap('<b>Unfold 2.</b> Now the first fold opens. Both holes mirror across the horizontal crease.');
    crease('ch', true); await AL.wait(300);
    await tw(1, 0, 1000, function (v) { setFold(v, 0); });
    crease('ch', false);
    verdict(called);
  }
  function verdict(called) {
    var cells = $('grid').querySelectorAll('.cell'), hit = 0, extra = 0, picks = 0;
    Array.prototype.forEach.call(cells, function (c, i) {
      var on = c.getAttribute('aria-pressed') === 'true', hole = HOLES.indexOf(i) >= 0;
      if (on) picks++;
      if (on && hole) { c.classList.add('match'); c.setAttribute('aria-label', c.getAttribute('aria-label') + ': a hole, you called it'); hit++; }
      else if (on) { c.classList.add('extra'); c.setAttribute('aria-label', c.getAttribute('aria-label') + ': your call, no hole here'); extra++; }
      else if (hole && called) { c.classList.add('missed'); c.setAttribute('aria-label', c.getAttribute('aria-label') + ': a hole you did not call'); }
    });
    $('legend').hidden = !called;
    var ok = called && hit === 4 && extra === 0;
    callMissed = called && !ok;
    var trapName = '', trap = '';
    if (callMissed) {
      if (hit === 2 && picks === 2) { trapName = 'One step short'; trap = 'You stopped after one unfold. The first fold still has to open, and it mirrors both holes again.'; }
      else if (extra) { trapName = 'Slid instead of mirrored'; trap = 'A hole lands the same distance from the crease on the other side, not the same distance from the edge.'; }
      else { trapName = 'Lost count'; trap = 'Two folds, one punch: 1 hole, then 2, then 4.'; }
    }
    var html = called ? AceLoop.verdict({ ok: ok, callLine: 'You called ' + hit + ' of the 4 holes' + (extra ? ', plus ' + extra + ' square' + (extra > 1 ? 's' : '') + ' with no hole' : '') + '.', trap: trap, trapName: trapName, why: 'Each unfold copies every hole across that crease, as if in a mirror. The last fold opens first. Two folds, one punch: four holes.', hook: 'Mirror, never slide.' })
      : AceLoop.verdict({ skipped: true, why: 'Each unfold copies every hole across that crease, as if in a mirror. The last fold opens first. Two folds, one punch: four holes.', hook: 'Mirror, never slide.' });
    $('q').hidden = true;
    $('after').innerHTML = html;
    cap('Flat again. <b>Four holes</b>, mirrored across both creases.');
    $('scrubBox').innerHTML = '<div class="drive"><div class="dh">' + AL.icon('drag') + 'Now you drive: fold it back up</div>' +
      '<div class="knob"><label for="scrub">Fold the sheet <output id="sv">flat</output></label>' +
      '<input class="al" id="scrub" type="range" min="0" max="200" value="200" style="--track:linear-gradient(90deg,#3a4f44,#d9b45c)" aria-valuetext="Flat">' +
      '<div class="ticks"><span>folded</span><span>one crease open</span><span>flat</span></div></div></div>';
    $('scrub').addEventListener('input', function () {
      var v = +this.value;
      setFold(Math.min(1, Math.max(0, 1 - (v - 100) / 100)), Math.min(1, Math.max(0, 1 - v / 100)));
      var w = v < 15 ? 'folded' : v > 85 && v < 115 ? 'one crease open' : v > 185 ? 'flat' : 'opening';
      $('sv').textContent = w; this.setAttribute('aria-valuetext', w);
      $('grid').style.opacity = v > 185 ? 1 : .3;
    });
    $('after').insertAdjacentHTML('beforeend', '<div class="stage-actions" style="margin-top:12px"><button class="btn gold" id="memBtn" type="button">One more, from memory ' + AL.icon('arrow', 'sm') + '</button></div>');
    $('memBtn').onclick = memory;
    band.set(1);
    AL.follow($('sheet'), { to: $('after'), prefer: 'end' });
  }

  /* 4. one more, from memory: a test-day item, figures only */
  function sheetSVG(holes) {
    var s = '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="4" y="4" width="56" height="56" fill="#fff" stroke="#111" stroke-width="2"/>';
    holes.forEach(function (h) { s += '<circle cx="' + (11 + h[1] * 14) + '" cy="' + (11 + h[0] * 14) + '" r="4.2" fill="#111"/>'; });
    return s + '</svg>';
  }
  function foldFig(kind) {
    var s = '<svg viewBox="0 0 72 72" aria-hidden="true">';
    if (kind === 1) s += '<rect x="8" y="8" width="28" height="56" fill="none" stroke="#666" stroke-width="1.6" stroke-dasharray="4 3"/><rect x="36" y="8" width="28" height="56" fill="#fff" stroke="#111" stroke-width="2"/><path d="M22 30 q14 -14 28 0" fill="none" stroke="#086894" stroke-width="2"/><path d="M46 26 l4 4 -5 2" fill="none" stroke="#086894" stroke-width="2"/>';
    if (kind === 2) s += '<rect x="36" y="36" width="28" height="28" fill="none" stroke="#666" stroke-width="1.6" stroke-dasharray="4 3"/><rect x="36" y="8" width="28" height="28" fill="#fff" stroke="#111" stroke-width="2"/><path d="M28 52 q-8 -14 4 -26" fill="none" stroke="#086894" stroke-width="2"/><path d="M27 28 l5 -2 1 5" fill="none" stroke="#086894" stroke-width="2"/>';
    if (kind === 3) s += '<rect x="36" y="8" width="28" height="28" fill="#fff" stroke="#111" stroke-width="2"/><circle cx="57" cy="15" r="4.2" fill="#111"/>';
    return s + '</svg>';
  }
  var MEM = {
    opts: [[[0, 3], [3, 0]], [[0, 3], [3, 3]], [[0, 0], [0, 3], [3, 0], [3, 3]], [[0, 0], [0, 3]], [[0, 1], [0, 3], [3, 1], [3, 3]]],
    key: 2,
    traps: [['Mirrored across the other crease', 'Two holes on opposite corners: each crease was used once, on one hole each. Every unfold doubles the count: 1, then 2, then 4.'],
      ['One step short', 'This stops after one unfold. The first fold, left over right, still has to open.'], null,
      ['Reversed', 'This opens the first fold first. The last fold, bottom up over top, opens first.'],
      ['Slid instead of mirrored', 'This slides the holes two squares instead of mirroring them across the crease.']],
    why: 'Undo the last fold first: the bottom half comes back down, so the corner hole mirrors to the bottom right corner. Then the left half opens, mirroring both holes to the left corners. Four corners.'
  };
  function memory() {
    band.set(2);
    $('scrubBox').innerHTML = ''; $('legend').hidden = true; $('stillsBox').innerHTML = '';
    $('q').hidden = false;
    $('q').textContent = 'One more, from memory. Same rule, new folds. Which choice shows the sheet unfolded?';
    document.querySelector('#pat .table').innerHTML = '<div style="width:100%;max-width:420px"><div class="stills" style="margin:0">' +
      '<div class="fig">' + foldFig(1) + 'Fold 1</div><div class="fig">' + foldFig(2) + 'Fold 2</div><div class="fig">' + foldFig(3) + 'Punch</div></div></div>';
    cap('Left half over the right, then the bottom up over the top, then one punch.');
    $('after').innerHTML = '<div class="ans" id="ans" role="group" aria-label="Choices">' + MEM.opts.map(function (h, i) {
      return '<button type="button" aria-pressed="false" data-i="' + i + '" aria-label="Choice ' + 'ABCDE'[i] + '">' + sheetSVG(h) + 'ABCDE'[i] + '<span class="tg"></span></button>';
    }).join('') + '</div>';
    AL.follow(document.querySelector('#pat .table'));
    Array.prototype.forEach.call(document.querySelectorAll('#ans button'), function (b) {
      b.addEventListener('click', function () {
        if ($('ans').dataset.done) return;
        $('ans').dataset.done = '1';
        var i = +b.dataset.i, ok = i === MEM.key, bs = document.querySelectorAll('#ans button');
        bs[MEM.key].classList.add('is-key'); bs[MEM.key].querySelector('.tg').textContent = 'Answer';
        if (!ok) { b.classList.add('is-trap'); b.querySelector('.tg').textContent = 'Your call'; recallMissed = true; }
        $('after').insertAdjacentHTML('beforeend', '<div style="margin-top:12px">' + AceLoop.verdict({ ok: ok, callText: 'choice ' + 'ABCDE'[i], trap: ok ? '' : MEM.traps[i][1], trapName: ok ? '' : MEM.traps[i][0], keyText: 'choice C, four corners', keyLead: 'The answer', why: MEM.why }) + '</div>');
        card();
      });
    });
  }
  /* 5. the card: a miss makes it; a clean loop may keep one */
  function card() {
    band.set(3);
    var missed = callMissed || recallMissed;
    $('after').insertAdjacentHTML('beforeend', '<div style="margin-top:14px">' + AceLoop.card({
      sec: 'pat', where: 'PAT / Hole Punching',
      pic: '<div style="display:grid;place-items:center;background:#fff">' + sheetSVG([[1, 0], [1, 3], [2, 0], [2, 3]]) + '</div><div style="display:grid;place-items:center;background:#fff">' + sheetSVG(MEM.opts[2]) + '</div>',
      idea: 'Last fold opens first. Each crease mirrors every hole across it. Two folds, one punch: four holes.',
      hook: 'Mirror, never slide.'
    }) + '<p class="keep-note" style="margin:10px 0;font-size:14px;color:var(--b-ink-2)">' + (missed ? 'Made for you, from your call. It comes back tomorrow, ' + AL.dayName(1) + ', as a new sheet with new folds.' : 'Both calls confirmed. Keep it anyway and it comes back tomorrow as a new sheet.') + '</p>' +
      '<div class="stage-actions">' + (missed ? '<button class="btn gold" id="saveBtn" type="button">Send it to Review ' + AL.icon('arrow', 'sm') + '</button>' : '<button class="btn gold" id="saveBtn" type="button">' + AL.icon('keep', 'sm') + 'Keep it</button><button class="btn quiet" type="button">Skip, I have this one</button>') + '</div></div>');
    $('saveBtn').onclick = function () {
      this.disabled = true;
      AceLoop.keep($('newCard'), { due: 4, done: function () { band.set(4); Array.prototype.forEach.call(document.querySelectorAll('#band .st'), function (s) { s.classList.add('done'); s.classList.remove('on'); }); } });
    };
    AL.follow($('newCard'), { to: $('saveBtn') });
  }

  $('foldBtn').onclick = foldAndPunch;
  setFold(0, 0);
  window.PatDemo = {
    fold: foldAndPunch,
    call: function (cells) { var g = $('grid').querySelectorAll('.cell'); cells.forEach(function (c) { g[c].click(); }); },
    lock: function () { $('lockBtn').click(); },
    memory: function () { $('memBtn').click(); },
    answer: function (i) { document.querySelectorAll('#ans button')[i].click(); },
    save: function () { $('saveBtn').click(); },
    scrub: function (v) { var s = $('scrub'); s.value = v; s.dispatchEvent(new Event('input')); }
  };
})();
