/* Today, step 1: the whole loop on one bench in about a minute.
   Content is the repo's own Call it first entry for Tonicity
   (tools/bio/bio-stick-data.js): frames 50 -> 32 -> 18 -> 4, the plant
   cell recall, the hook "Water chases solute."
   ?first=1 shows a new student's first visit. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var FIRST = /[?&]first=1/.test(location.search);
  var root = document.documentElement;

  var ENTRY = {
    frames: [50, 32, 18, 4],
    predict: {
      options: ['It swells and bursts (lyses)', 'It shrivels up (crenates)', 'It swells, then holds its shape'],
      key: 0,
      traps: [null,
        'Shriveling is the salty-water picture. Pure water has less solute than the cell, so water rushes in, not out.',
        'That is a plant cell. Its wall stops the swelling. An animal cell has no wall, so the membrane gives.'],
      trapNames: [null, 'Reversed', 'Neighbor fact'],
      replan: [null, 'you called the salty-water picture for pure water', 'you gave an animal cell a plant cell wall'],
      why: 'The cell has more solute than pure water, so water floods in. With no wall to push back, the membrane stretches until it bursts.'
    },
    check: {
      options: ['It swells and presses on its wall (turgid)', 'The membrane pulls off the wall (plasmolysis)', 'Nothing changes. The rigid wall holds its shape'],
      key: 1,
      traps: ['Turgid is the pure-water picture for a plant cell. Salt water pulls water out.', null,
        'The wall keeps the outer shape, but water still leaves. The membrane shrinks away inside it.'],
      trapNames: ['Reversed', null, 'Half right'],
      replan: ['you sent water into the cell in salt water', null, 'you let the wall hide the water loss'],
      why: 'Water saltier than the cell is hypertonic. Water leaves, the membrane shrinks away from the rigid wall, and the wall keeps its shape.'
    },
    hook: 'Water chases solute.'
  };

  var band = AL.band($('band'));
  var ext = 50, type = 'animal', wipeAt = 40, timer = null, picked = null, missed = false, missWhy = '', callMissed = false, checkMissed = false;

  /* ---------- the field: true to life, caption in HTML ---------- */
  function paint(e, t, capPrefix) {
    ext = e; type = t || type;
    var f = Tonicity.field(ext, type);
    $('realLayer').innerHTML = f.svg('fs', f.caption);
    $('magTag').textContent = f.mag;
    if (!$('drawLayer').hidden) $('drawLayer').innerHTML = '<svg class="fs" viewBox="14 54 372 228" aria-hidden="true">' + Tonicity.drawing(ext) + '</svg>';
    $('cap').innerHTML = (capPrefix ? '<b>' + capPrefix + '</b> ' : '') + f.caption;
    return f;
  }
  paint(50, 'animal');
  $('cap').innerHTML = '<b>Before:</b> red cells in a drop that matches them, each a disc with a pale center. Call it, then pure water floods the slide.';

  /* ---------- Call ---------- */
  AceLoop.options($('callOpts'), ENTRY.predict.options, function (i) { picked = i; watch(); });
  $('skipBtn').addEventListener('click', function () { picked = -1; AceLoop.hold($('callOpts'), -1); watch(); });
  $('stuckBtn').addEventListener('click', function () { AceLoop.stuck('bio', this); });

  /* ---------- Watch: pure water floods the slide, frame by frame ---------- */
  var pips = $('pips').children, nextFrame = null;
  function watch() {
    $('skipBtn').parentNode.hidden = true;
    band.set(1);
    $('framebar').hidden = false;
    var i = 0, rm = AL.reduced();
    Array.prototype.forEach.call(pips, function (p) { p.className = ''; });
    function step() {
      paint(ENTRY.frames[i], 'animal', 'Frame ' + (i + 1) + ' of 4.');
      if (i > 0) pips[i - 1].className = 'done';
      pips[i].className = rm ? 'done' : 'run';
      i++;
      if (rm) {
        if (i >= ENTRY.frames.length) $('replay').innerHTML = AL.icon('good', 'sm') + 'See the verdict';
        return;
      }
      timer = setTimeout(i < ENTRY.frames.length ? step : afterWatch, 900);
    }
    if (rm) {
      /* Reduced motion keeps every frame: the student steps through them. */
      $('replay').className = 'iconbtn text';
      $('replay').innerHTML = AL.icon('next', 'sm') + 'Next frame';
      $('replay').setAttribute('aria-label', 'Next frame');
      nextFrame = function () { if (i < ENTRY.frames.length) step(); else { nextFrame = null; afterWatch(); } };
    }
    AL.follow($('field'));
    step();
  }
  function afterWatch() {
    Array.prototype.forEach.call(pips, function (p) { p.className = 'done'; });
    var p = ENTRY.predict, ok = picked === p.key;
    if (picked >= 0 && !ok) { missed = true; callMissed = true; missWhy = p.replan[picked]; }
    AceLoop.reveal($('callOpts'), picked, p.key);
    $('stCall').hidden = true;
    $('stVerdict').innerHTML = AceLoop.verdict({
      skipped: picked === -1, ok: ok, callText: picked >= 0 ? p.options[picked] : '', trap: picked >= 0 ? p.traps[picked] : '',
      trapName: picked >= 0 ? p.trapNames[picked] : '', keyText: p.options[p.key], why: ok || picked === -1 ? p.why : '', hook: ENTRY.hook
    });
    $('stVerdict').hidden = false;
    $('stDrive').hidden = false; $('stDrive').classList.add('reveal-in');
    $('replay').className = 'iconbtn'; $('replay').innerHTML = AL.icon('replay'); $('replay').setAttribute('aria-label', 'Play the slide again');
    $('solute').value = ext; soluteLabel(ext);
    showWipe();
    AL.follow($('field'), { to: $('stVerdict') });
  }
  $('replay').innerHTML = AL.icon('replay');
  $('replay').addEventListener('click', function () {
    if (nextFrame) { nextFrame(); return; }
    clearTimeout(timer);
    var i = 0;
    (function again() { paint(ENTRY.frames[i], 'animal', 'Frame ' + (i + 1) + ' of 4.'); i++; if (i < ENTRY.frames.length && !AL.reduced()) timer = setTimeout(again, 900); })();
  });

  /* ---------- Drive: the student moves the solute; wipe drawing vs real ---------- */
  function soluteWords(v) {
    return v < 12 ? 'nearly pure water' : v < 45 ? 'less solute than the cell' : v <= 55 ? 'matches the cell' : 'more solute than the cell';
  }
  function soluteLabel(v) {
    $('soluteOut').textContent = soluteWords(v);
    $('solute').setAttribute('aria-valuetext', soluteWords(v) + '. ' + Tonicity.stateOf(v).name);
  }
  $('solute').addEventListener('input', function (e) {
    var v = +e.target.value;
    soluteLabel(v);
    paint(v, 'animal');
    wipeText();
  });
  function showWipe() {
    $('drawLayer').hidden = false;
    $('wipe').hidden = false; $('tagDraw').hidden = false; $('tagReal').hidden = false;
    $('field').classList.add('wiping');
    paint(ext, 'animal');
    setWipe(wipeAt);
  }
  function wipeText() {
    var st = Tonicity.stateOf(ext);
    var drawSays = st.key === 'lysed' ? 'one cell drawn in pieces, water arrows going in' : st.key === 'hyper' ? 'one cell with a scalloped edge, water arrows going out' : st.key === 'iso' ? 'one round cell, no arrows' : 'one swelling cell, water arrows going in';
    $('wipe').setAttribute('aria-valuetext', 'Left: the textbook drawing, ' + drawSays + '. Right: the real field. Line at ' + Math.round(wipeAt) + ' percent.');
  }
  function setWipe(pct) {
    wipeAt = Math.max(0, Math.min(100, pct));
    $('drawLayer').style.clipPath = 'inset(0 ' + (100 - wipeAt) + '% 0 0)';
    $('wipe').style.left = wipeAt + '%';
    $('wipe').setAttribute('aria-valuenow', String(Math.round(wipeAt)));
    wipeText();
  }
  (function dragWipe() {
    var h = $('wipe'), box = $('field'), on = false;
    function at(ev) { var r = box.getBoundingClientRect(); setWipe((ev.clientX - r.left) / r.width * 100); }
    h.addEventListener('pointerdown', function (ev) { on = true; h.setPointerCapture(ev.pointerId); at(ev); });
    h.addEventListener('pointermove', function (ev) { if (on) at(ev); });
    h.addEventListener('pointerup', function () { on = false; });
    h.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowLeft') { setWipe(wipeAt - 5); ev.preventDefault(); }
      if (ev.key === 'ArrowRight') { setWipe(wipeAt + 5); ev.preventDefault(); }
    });
  })();

  /* ---------- Recall: one more, from memory ---------- */
  $('toProve').addEventListener('click', function () {
    band.set(2);
    $('stVerdict').hidden = true; $('stDrive').hidden = true;
    $('wipe').hidden = true; $('tagDraw').hidden = true; $('tagReal').hidden = true; $('drawLayer').hidden = true;
    $('field').classList.remove('wiping');
    $('framebar').hidden = true;
    $('veil').classList.remove('off');
    $('cap').textContent = '';
    $('stProve').hidden = false; $('stProve').classList.add('reveal-in');
    var c = ENTRY.check;
    AceLoop.options($('checkOpts'), c.options, function (i) {
      var ok = i === c.key;
      if (!ok) { missed = true; checkMissed = true; missWhy = missWhy || c.replan[i]; }
      AceLoop.reveal($('checkOpts'), i, c.key);
      $('checkVerdict').innerHTML = AceLoop.verdict({ ok: ok, callText: c.options[i], trap: c.traps[i], trapName: c.trapNames[i], keyText: c.options[c.key], why: ok ? c.why : '' });
      $('checkVerdict').hidden = false;
      $('checkQ').hidden = true; $('checkOpts').hidden = true;
      paint(92, 'plant', 'The slide is back: Elodea leaf cells in very salty water.');
      $('veil').classList.add('off');
      toKeep();
    });
    AL.follow($('field'));
  });

  /* ---------- Card: a miss makes its card; a clean loop may keep one ---------- */
  function toKeep() {
    band.set(3);
    /* the card carries the slide the student missed on: the plant cell if the
       recall was the miss, otherwise the red cells they watched */
    var plantCard = checkMissed && !callMissed;
    $('cardHost').innerHTML = AceLoop.card({
      sec: 'bio', where: 'Bio / Membrane transport',
      pic: plantCard ? Tonicity.pair({ ext: 18, type: 'plant', label: 'fresh water' }, { ext: 92, type: 'plant', label: 'salty' })
        : Tonicity.pair({ ext: 50, type: 'animal', label: 'before' }, { ext: 4, type: 'animal', label: 'pure water' }),
      idea: plantCard ? 'Plant cell in salty water: water leaves, the membrane pulls off the wall (plasmolysis). The wall keeps its shape.'
        : 'Animal cell in pure water: water rushes in, the cell swells and bursts (lyses).',
      hook: ENTRY.hook
    });
    $('stKeep').hidden = false; $('stKeep').classList.add('reveal-in');
    if (missed) {
      $('keepNote').innerHTML = 'Made for you, from your call. It comes back <b>tomorrow, ' + AL.dayName(1) + '</b>, as a fresh question, then in 3 days, then in 7.';
      $('keepBtns').innerHTML = '<button class="btn gold" id="keepBtn" type="button">Send it to Review ' + AL.icon('arrow', 'sm') + '</button>';
      $('keepBtn').addEventListener('click', function () { this.disabled = true; AceLoop.keep($('newCard'), { due: 3, done: done }); });
      /* the camera keeps the slide, the verdict and the card in one view when they fit */
      AL.follow($('field'), { to: $('stKeep'), prefer: 'end' });
    } else {
      $('keepNote').innerHTML = 'Both calls confirmed. Keep it anyway and it comes back <b>tomorrow, ' + AL.dayName(1) + '</b>, then in 3 days, then in 7.';
      $('keepBtns').innerHTML = '<button class="btn gold" id="keepBtn" type="button">' + AL.icon('keep', 'sm') + 'Keep it</button><button class="btn quiet" id="noKeep" type="button">Skip, I have this one</button>';
      $('keepBtn').addEventListener('click', function () { this.disabled = true; AceLoop.keep($('newCard'), { due: 3, done: done }); });
      $('noKeep').addEventListener('click', function () { done(true); });
      AL.follow($('field'), { to: $('stKeep'), prefer: 'end' });
    }
  }

  /* ---------- after: the plan answers, the ladder shows where it went ---------- */
  function done(skippedCard) {
    band.set(4);
    Array.prototype.forEach.call(document.querySelectorAll('#band .st'), function (s) { s.classList.add('done'); s.classList.remove('on'); });
    $('stKeep').hidden = true;
    $('stDone').hidden = false;
    if (!skippedCard) {
      var rung = document.querySelector('[data-rung="d1"]');
      rung.classList.add('landed');
      var stack = rung.querySelector('.stack'); stack.classList.remove('empty'); stack.insertAdjacentHTML('beforeend', '<i></i>');
      $('d1n').textContent = (FIRST ? 1 : 3) + (FIRST ? ' card' : ' cards');
      var row = document.createElement('a');
      row.className = 'due-row landed reveal-in'; row.href = 'review.html'; row.setAttribute('data-sec', 'bio');
      row.innerHTML = '<span class="dot"></span><span><b>New, back tomorrow:</b> Animal cell in pure water: water rushes in, the cell swells and bursts.</span><small>Bio</small>';
      $('dueList').insertAdjacentElement('afterbegin', row);
    }
    if (FIRST) { firstSetup(); return; }
    var steps = $('plan').querySelectorAll('.step');
    steps[0].classList.remove('now'); steps[0].classList.add('done'); steps[0].querySelector('.node').innerHTML = AL.icon('good');
    var ticks = $('planLine').querySelectorAll('i');
    ticks[0].className = 'done'; ticks[1].className = 'now';
    if (missed) replan(); else {
      steps[1].classList.add('now');
      $('planLbl').textContent = 'Step 2 of 4: 3 Ace Cards';
      $('doneP').textContent = 'Card back tomorrow, ' + AL.dayName(1) + '. Next on the plan: your three cards, each as a fresh question.';
    }
  }

  /* The plan re-plans in front of the student: one scene of the matching
     night slides in as step 2, and the Climb moves to tomorrow (at most 4
     steps). One coach sentence says why. Reduced motion: a cut. */
  function replan() {
    var plan = $('plan');
    var li = document.createElement('li');
    li.setAttribute('data-k', 'scene');
    li.innerHTML = '<a class="step added now" href="learn.html"><span class="node">' + AL.icon('learn') + '</span><span class="tx"><span class="st"><span class="dot" style="--sec:var(--s-sec-bio)"></span>Learn / added just now</span><span class="t">Bio, Retold: night 3, one scene</span><span class="d">The Membrane &amp; What Crosses It: why water chases solute.</span></span><span class="min">6 min</span></a>';
    var climb = plan.querySelector('[data-k="climb"]');
    AL.flip(plan, function () {
      plan.insertBefore(li, plan.children[1]);
      climb.remove();
    });
    $('tomorrow').hidden = false;
    $('tomorrow').innerHTML = '<b>Moved to tomorrow:</b> The Climb, today\'s queue. <b>Also tomorrow:</b> tonicity, as a fresh question.';
    $('said').hidden = false;
    $('said').textContent = 'Added one scene from night 3: ' + missWhy + '. The Climb moves to tomorrow.';
    $('coachSrc').innerHTML = 'Changed <b>just now</b>, from <b>your call</b>.';
    $('planLbl').textContent = 'Step 2 of 4: one scene from night 3';
    $('planLede').textContent = 'About 44 minutes. One step changed because of your call.';
    $('nextStep').href = 'learn.html';
    $('nextStep').innerHTML = 'Next: one scene from night 3 ' + AL.icon('arrow', 'sm');
    $('doneP').textContent = 'Card back tomorrow, ' + AL.dayName(1) + '. The plan changed below: one short scene first, then your cards.';
  }

  /* ---------- first visit ---------- */
  if (FIRST) {
    root.classList.add('first');
    root.removeAttribute('data-due');
    $('coachLine').innerHTML = 'Before anything, <em>call this one.</em>';
    $('coachSrc').innerHTML = 'Your first visit. Nothing to set up yet.';
    $('coachNote').hidden = true;
    document.querySelector('.coach-note-light').hidden = true;
    $('planLbl').textContent = 'Step 1 of 3: your first call';
    $('planLine').querySelector('.ticks').innerHTML = '<i class="now"></i><i></i><i></i>';
    document.querySelector('#bench .bench-top .k').lastChild.textContent = 'Your first call';
    $('planH').innerHTML = 'Start with <em>the slide.</em>';
    $('planLede').textContent = 'It takes about a minute, and every tool here works the same way. Then three short answers, and the plan builds itself.';
    $('plan').innerHTML =
      '<li><a class="step now" href="#bench"><span class="node">' + AL.icon('predict') + '</span><span class="tx"><span class="st">Practice</span><span class="t">Your first call</span><span class="d">Real red cells, pure water.</span></span><span class="min">1 min</span></a></li>' +
      '<li><span class="step"><span class="node">' + AL.icon('today') + '</span><span class="tx"><span class="st">Today</span><span class="t">Three questions</span><span class="d">Your test date, shakiest sections, minutes a day.</span></span><span class="min">1 min</span></span></li>' +
      '<li><span class="step"><span class="node">' + AL.icon('prove') + '</span><span class="tx"><span class="st">Tests / tomorrow</span><span class="t">The diagnostic</span><span class="d">A map of where to start, not a score.</span></span><span class="min">45 min</span></span></li>';
    Array.prototype.forEach.call(document.querySelectorAll('#ladder .rung'), function (r) {
      r.classList.remove('now'); r.querySelector('.stack').className = 'stack empty'; r.querySelector('.stack').innerHTML = '<i></i>'; r.querySelector('.num').textContent = 'none yet';
    });
    $('dueList').innerHTML = '<p class="small muted">Your first card lands on Tomorrow.</p>';
    Array.prototype.forEach.call(document.querySelectorAll('.sec-tile .c'), function (c) { c.textContent = 'No cards yet'; });
    $('testH').textContent = 'The diagnostic';
    document.querySelector('.test-card .d').textContent = 'About 45 minutes across Biology, General Chemistry, Organic Chemistry and QR, untimed, on the test-day screen. It shows where to start. It waits until tomorrow, so today stays light.';
    document.querySelector('.test-card .when').innerHTML = '<span>Suggested for <b>' + AL.longDate(1) + '</b></span><span>About <b>45 min</b>, untimed</span>';
    document.querySelector('.test-card .btn.primary').innerHTML = 'Open the diagnostic ' + AL.icon('arrow', 'sm');
  }
  function firstSetup() {
    var ticks = $('planLine').querySelectorAll('i'); ticks[0].className = 'done'; ticks[1].className = 'now';
    $('planLbl').textContent = 'Step 2 of 3: three questions';
    var steps = $('plan').querySelectorAll('.step'); steps[0].classList.remove('now'); steps[0].classList.add('done'); steps[1].classList.add('now');
    $('doneP').textContent = 'That was the loop: predict, play, prove, keep. Your card is in Review. Three quick answers above, and the plan builds itself.';
    $('nextStep').href = '#coach'; $('nextStep').innerHTML = 'Next: three questions ' + AL.icon('arrow', 'sm');
    $('coachLine').innerHTML = 'You just ran the loop. Three questions, <em>and the plan is yours.</em>';
    $('coachSrc').textContent = 'Nothing is scored here. You can change any answer later in Settings.';
    var f = document.createElement('div');
    f.className = 'setup reveal-in'; f.id = 'setup';
    f.innerHTML = '<div class="q"><label for="tdate">Your test date</label><input type="date" id="tdate" value="2026-12-12"></div>' +
      '<div class="q"><span class="ql" id="shakyL">Your shakiest sections (pick any)</span><div class="pills" role="group" aria-labelledby="shakyL">' +
      ['Bio', 'GChem', 'OChem', 'PAT', 'RC', 'QR'].map(function (s, i) { return '<button class="pill-b" type="button" aria-pressed="' + (i === 3 || i === 1 ? 'true' : 'false') + '">' + s + '</button>'; }).join('') + '</div></div>' +
      '<div class="q"><span class="ql" id="minL">On a normal day</span><div class="pills" role="group" aria-labelledby="minL">' +
      ['30 min', '60 min', '90 min'].map(function (s, i) { return '<button class="pill-b" type="button" aria-pressed="' + (i === 1) + '">' + s + '</button>'; }).join('') + '</div></div>' +
      '<div class="row-btns"><button class="btn gold" id="build" type="button">Build my plan</button><button class="btn quiet" type="button" style="color:var(--b-ink-3)">Going again? Add your scores</button></div>';
    $('said').insertAdjacentElement('beforebegin', f);
    Array.prototype.forEach.call(f.querySelectorAll('.pill-b'), function (b) {
      b.addEventListener('click', function () {
        var grp = b.parentNode, multi = grp.getAttribute('aria-labelledby') === 'shakyL';
        if (!multi) Array.prototype.forEach.call(grp.children, function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', String(multi ? b.getAttribute('aria-pressed') !== 'true' : true));
      });
    });
    $('build').addEventListener('click', buildPlan);
    AL.follow($('coach'));
  }
  /* The plan builds itself, one step at a time (320 ms apart). */
  function buildPlan() {
    $('setup').remove();
    $('coachLine').innerHTML = 'Here is today. The diagnostic waits <em>until tomorrow.</em>';
    $('coachSrc').innerHTML = 'Built from <b>your three answers</b>. It changes as you work.';
    $('planLine').querySelector('.ticks').innerHTML = '<i class="done"></i><i class="now"></i><i></i><i></i>';
    $('planLbl').textContent = 'Step 2 of 4: PAT, Retold night 1';
    $('planH').innerHTML = 'Your first <em>plan.</em>';
    $('planLede').textContent = 'About 50 minutes today. Tomorrow: the diagnostic.';
    var items = [
      ['done', 'good', 'Practice', 'Your first call', 'Tonicity. Card made.', 'done'],
      ['now', 'learn', 'Learn', 'PAT, Retold: night 1', 'The PAT Method Mindset. It opens with a call.', '30 min'],
      ['', 'play', 'Practice', 'Call it first: Hole punching', 'Watch it fold, call the holes, unfold it yourself.', '3 min'],
      ['', 'learn', 'Learn', 'GChem, Retold: night 1', 'The Two Questions.', '15 min']
    ];
    var plan = $('plan');
    plan.innerHTML = '';
    items.forEach(function (it, n) {
      setTimeout(function () {
        AL.flip(plan, function () {
          var li = document.createElement('li');
          li.innerHTML = '<a class="step ' + it[0] + '" href="' + (n === 2 ? 'pat-holepunch.html' : 'learn.html') + '"><span class="node">' + AL.icon(it[1]) + '</span><span class="tx"><span class="st">' + it[2] + '</span><span class="t">' + it[3] + '</span><span class="d">' + it[4] + '</span></span><span class="min">' + it[5] + '</span></a>';
          plan.appendChild(li);
        });
      }, AL.reduced() ? 0 : 320 * n);
    });
    $('tomorrow').hidden = false;
    $('tomorrow').innerHTML = '<b>Tomorrow, ' + AL.dayName(1) + ':</b> the diagnostic, about 45 minutes, untimed. Then your plan is built from your misses.';
    $('nextStep').href = 'learn.html'; $('nextStep').innerHTML = 'Next: PAT, Retold night 1 ' + AL.icon('arrow', 'sm');
    $('doneP').textContent = 'That was the loop: predict, play, prove, keep. Your card is in Review, and your plan is on the right.';
    AL.follow($('plan'));
  }
  $('again').addEventListener('click', function () { location.reload(); });

  /* For the screenshot harness: drive the loop to a named point. */
  window.TodayDemo = {
    pick: function (i) { $('callOpts').querySelectorAll('.opt')[i].click(); },
    skip: function () { $('skipBtn').click(); },
    toProve: function () { $('toProve').click(); },
    check: function (i) { $('checkOpts').querySelectorAll('.opt')[i].click(); },
    keep: function () { var b = $('keepBtn'); if (b) b.click(); },
    build: function () { $('build').click(); },
    wipe: setWipe,
    solute: function (v) { var s = $('solute'); s.value = v; s.dispatchEvent(new Event('input')); },
    next: function () { $('replay').click(); }
  };
})();
