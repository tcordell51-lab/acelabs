/* ============================================================
   full.js : the AceTheDAT four-section full-length mock.

   Test-day order: Survey of the Natural Sciences (Bio 40, GChem 30,
   OChem 30 in 90 min) -> Perceptual Ability (90 in 60) -> optional
   30-minute break -> Reading Comprehension (50 in 60) -> Quantitative
   Reasoning (40 in 45).

   Items: science and QR come from tools/mock/data/full-mocks.js (built by
   scripts/compose-full-mocks.mjs under the answer-bias rules); PAT is a
   seeded test from tools/pat/engine; RC is a full section from
   tools/rc/data/bank.js.

   Progress persists in localStorage (acelabs.fullmock.v1.*) with pause
   semantics: a closed tab stops the clock. The report is raw scores and
   time per section only. No scaled scores, no predictions.
   ============================================================ */
(function () {
  'use strict';

  var DATA = window.ACE_FULL_MOCKS || { mocks: [] };
  var MOCKS = DATA.mocks || [];
  var RC = window.ACE_RC_BANK || null;
  var PAT = window.PAT || null;
  var L = 'ABCDE';
  var K_ACTIVE = 'acelabs.fullmock.v1.active';
  var K_ATTEMPTS = 'acelabs.fullmock.v1.attempts';
  var BREAK_SEC = 30 * 60;

  var SEC = {
    sons: { key: 'sons', name: 'Survey of the Natural Sciences', short: 'Natural Sciences', min: 90, n: 100, c: 'var(--bio)' },
    pat: { key: 'pat', name: 'Perceptual Ability', short: 'Perceptual Ability', min: 60, n: 90, c: 'var(--pat)' },
    rc: { key: 'rc', name: 'Reading Comprehension', short: 'Reading Comprehension', min: 60, n: 50, c: 'var(--rc)' },
    qr: { key: 'qr', name: 'Quantitative Reasoning', short: 'Quantitative Reasoning', min: 45, n: 40, c: 'var(--qr)' }
  };
  var ORDER = ['sons', 'pat', 'break', 'rc', 'qr'];
  var SECTION_KEYS = ['sons', 'pat', 'rc', 'qr'];
  var STUDY = {
    'Biology': { learn: '/tools/bio-retold/', review: '/tools/bio/', engine: 'Bio engine', c: 'var(--bio)' },
    'Gen Chem': { learn: '/tools/gchem/', review: '/tools/gc/', engine: 'GChem engine', c: 'var(--gc)' },
    'OChem': { learn: '/tools/organic/', review: '/tools/ochem/', engine: 'OChem engine', c: 'var(--oc)' },
    'QR': { learn: '/tools/qr-retold/', review: '/tools/qr/', engine: 'QR engine', c: 'var(--qr)' },
    'PAT': { learn: '/tools/pat-retold/', review: '/tools/pat/', engine: 'PAT Studio', c: 'var(--pat)' },
    'RC': { learn: '/tools/rc-retold/', review: '/tools/rc/', engine: 'RC player', c: 'var(--rc)' }
  };
  var PAT_PAGE = { keyholes: 'keyholes.html', tfe: 'tfe.html', angles: 'angles.html', holepunch: 'holepunch.html', cubes: 'cubes.html', patternfold: 'patternfold.html' };

  /* ---------------- storage (localStorage is a cache; memory fallback) ---------------- */
  var mem = {};
  function read(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : d; } }
  function write(k, v) { mem[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* memory only */ } }
  function drop(k) { delete mem[k]; try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }

  /* ---------------- helpers ---------------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function mmss(sec) { sec = Math.max(0, Math.ceil(sec)); var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0'); }
  function minsec(sec) { sec = Math.round(sec); return Math.floor(sec / 60) + 'm ' + String(sec % 60).padStart(2, '0') + 's'; }
  function pct(c, n) { return n ? Math.round((100 * c) / n) : 0; }
  function mockById(id) { for (var i = 0; i < MOCKS.length; i++) if (MOCKS[i].id === id) return MOCKS[i]; return null; }
  function mockNum(m) { return MOCKS.indexOf(m) + 1; }

  /* ---------------- session ---------------- */
  var S = null;   // persisted state
  var R = { items: null, patTest: null, patBuilding: null, view: 'q', lastTick: 0, timer: null, sinceSave: 0, calc: null, pt: false, calcOpen: false, rcTab: 'p', smi: null };

  function fresh(mockId) {
    var o = { v: 1, mockId: mockId, at: 'intro', sec: 'sons', idx: 0, answers: {}, marked: {}, spent: {}, elapsed: { sons: 0, pat: 0, rc: 0, qr: 0, brk: 0 }, done: {}, startedAt: Date.now(), savedAt: Date.now() };
    SECTION_KEYS.forEach(function (k) { o.answers[k] = new Array(SEC[k].n).fill(null); o.marked[k] = new Array(SEC[k].n).fill(false); o.spent[k] = new Array(SEC[k].n).fill(0); });
    return o;
  }
  function save() { if (S) { S.savedAt = Date.now(); write(K_ACTIVE, S); } }

  function rcItems(sectionId) {
    if (!RC) return [];
    var sec = (RC.sections || []).filter(function (s) { return s.id === sectionId; })[0];
    if (!sec) return [];
    var out = [];
    sec.passages.forEach(function (pid, pi) {
      var p = RC.passages[pid];
      p.questions.forEach(function (q) { out.push({ kind: 'rc', sub: 'RC', p: p, pi: pi, q: q }); });
    });
    return out;
  }
  function buildItems(mock) {
    var mc = function (sub) { return function (it) { return { kind: 'mc', sub: sub, it: it }; }; };
    return {
      sons: [].concat(mock.sections.bio.map(mc('Biology')), mock.sections.gc.map(mc('Gen Chem')), mock.sections.ochem.map(mc('OChem'))),
      pat: null,
      rc: rcItems(mock.rc.section),
      qr: mock.sections.qr.map(mc('QR'))
    };
  }
  function ensurePat(mock) {
    if (R.patTest) return Promise.resolve(R.patTest);
    if (R.patBuilding) return R.patBuilding;
    if (!PAT || !PAT.test) return Promise.reject(new Error('PAT engine missing'));
    R.patBuilding = PAT.test.buildAsync(mock.pat.seed, function (p) { var b = $('patProg'); if (b) b.style.width = Math.round(p * 100) + '%'; })
      .then(function (T) { R.patTest = T; R.items.pat = T.items.map(function (it) { return { kind: 'pat', sub: 'PAT', it: it }; }); var b = $('patBegin'); if (b) { b.disabled = false; b.textContent = 'Begin section'; } return T; });
    return R.patBuilding;
  }
  function keyOf(x) { return x.kind === 'mc' ? x.it.correct : x.kind === 'pat' ? x.it.answer : x.q.key; }
  function items(sec) { return R.items[sec] || []; }

  /* ---------------- landing ---------------- */
  function attempts() { return read(K_ATTEMPTS, []); }
  function renderLanding() {
    $('landing').classList.remove('hidden');
    $('report').classList.add('hidden');
    $('pm').classList.add('hidden');
    document.body.style.overflow = '';
    var steps = [
      ['Natural Sciences', '40 Bio, 30 GChem, 30 OChem', '100 Q, 90 min', 'var(--bio)'],
      ['Perceptual Ability', 'Six subtests of 15', '90 Q, 60 min', 'var(--pat)'],
      ['Optional break', 'Take it or skip it', 'up to 30 min', 'var(--gold)'],
      ['Reading', 'Three science passages', '50 Q, 60 min', 'var(--rc)'],
      ['Quantitative', 'Calculator on screen', '40 Q, 45 min', 'var(--qr)']
    ];
    $('flow').innerHTML = steps.map(function (s) { return '<div class="step" style="--c:' + s[3] + '"><b>' + s[0] + '</b><span>' + s[1] + '</span><i>' + s[2] + '</i></div>'; }).join('');

    var act = read(K_ACTIVE, null);
    var mk = act && mockById(act.mockId);
    if (mk && act.at !== 'done') {
      var where = act.at === 'break' ? 'the optional break' : (SEC[act.sec] ? SEC[act.sec].name + (act.at === 'run' ? ', question ' + (act.idx + 1) : ', section start') : 'the start');
      $('resume').innerHTML = '<div class="resume"><div class="grow"><b>' + esc(mk.name) + ' is waiting for you.</b> You stopped at ' + esc(where) + '. The clock paused when you left.</div>' +
        '<button class="btn gold" id="resumeBtn" type="button">Resume</button><button class="btn" id="discardBtn" type="button">Start over</button></div>';
      $('resumeBtn').addEventListener('click', function () { resume(act); });
      $('discardBtn').addEventListener('click', function () { confirmBox('Start over?', 'This clears the test in progress. Finished reports stay saved.', [{ t: 'Keep it', fn: function () {} }, { t: 'Clear it', primary: true, fn: function () { drop(K_ACTIVE); renderLanding(); } }], true); });
    } else $('resume').innerHTML = '';

    var hist = attempts();
    if (!MOCKS.length) { $('tests').innerHTML = '<div class="card">The full-length tests did not load. Refresh the page.</div>'; return; }
    $('tests').innerHTML = MOCKS.map(function (m, i) {
      var last = hist.filter(function (a) { return a.mockId === m.id; })[0];
      var lastLine = last ? '<span class="last">Last: ' + last.record.totalCorrect + ' of ' + last.record.totalQs + ' on ' + new Date(last.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + '</span>' : '<span class="last">Not taken yet</span>';
      return '<button class="tcard" type="button" data-id="' + m.id + '"><span class="n">' + (i + 1) + '</span><span class="t">' + esc(m.name) + '</span><span class="d">280 questions, 4 hours 15 minutes plus the optional break</span>' + lastLine + '</button>';
    }).join('');
    Array.prototype.forEach.call($('tests').querySelectorAll('.tcard'), function (b) {
      b.addEventListener('click', function () { chooseTest(b.dataset.id); });
    });
    if (hist.length) {
      var h = '<div class="card"><h3>Your reports</h3><table class="tbl"><thead><tr><th>Test</th><th class="r">Correct</th><th class="r hide-sm">Date</th><th></th></tr></thead><tbody>';
      hist.slice(0, 8).forEach(function (a) { var m = mockById(a.mockId); h += '<tr><td><b>' + esc(m ? m.name : a.mockId) + '</b></td><td class="r">' + a.record.totalCorrect + ' / ' + a.record.totalQs + '</td><td class="r hide-sm">' + new Date(a.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + '</td><td class="r"><a href="#" data-att="' + a.id + '">Open report</a></td></tr>'; });
      h += '</tbody></table></div>';
      $('tests').insertAdjacentHTML('afterend', '<div id="histCard">' + h + '</div>');
      var old = document.querySelectorAll('#histCard'); if (old.length > 1) old[0].remove();
      Array.prototype.forEach.call(document.querySelectorAll('[data-att]'), function (a) { a.addEventListener('click', function (e) { e.preventDefault(); openSavedReport(a.dataset.att); }); });
    }
  }
  function chooseTest(id) {
    var act = read(K_ACTIVE, null);
    if (act && act.at !== 'done' && mockById(act.mockId)) {
      confirmBox('A test is already in progress', 'Starting a new one clears the test in progress. Finished reports stay saved.', [{ t: 'Keep it', fn: function () {} }, { t: 'Start the new test', primary: true, fn: function () { drop(K_ACTIVE); start(id); } }], true);
      return;
    }
    start(id);
  }

  /* ---------------- run shell ---------------- */
  function openPM() {
    $('landing').classList.add('hidden');
    $('report').classList.add('hidden');
    $('pm').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (!R.timer) { R.lastTick = Date.now(); R.timer = setInterval(tick, 250); }
  }
  function start(id) {
    var m = mockById(id); if (!m) return;
    S = fresh(id); R.items = buildItems(m); R.patTest = null; R.patBuilding = null; R.view = 'q';
    save(); openPM(); ensurePat(m).catch(function () {}); renderIntro();
  }
  function resume(act) {
    var m = mockById(act.mockId); if (!m) return;
    S = act; R.items = buildItems(m); R.patTest = null; R.patBuilding = null; R.view = 'q';
    openPM();
    var go = function () { if (S.at === 'break') renderBreak(); else if (S.at === 'run') renderQ(); else renderIntro(); };
    if (SECTION_KEYS.indexOf(S.sec) >= SECTION_KEYS.indexOf('pat') || S.at === 'break') {
      $('pm').innerHTML = '<div class="pm-body"><div class="pm-screen"><h2>Getting your test back</h2><p>Rebuilding the perceptual figures exactly as they were.</p><div style="height:6px;background:#e1e5e8;border-radius:4px;overflow:hidden;max-width:360px"><i id="patProg" style="display:block;height:100%;width:0;background:var(--pm)"></i></div></div></div>';
      ensurePat(m).then(go, function () { go(); });
    } else { ensurePat(m).catch(function () {}); go(); }
  }
  window.addEventListener('beforeunload', function (e) {
    if (S && (S.at === 'run' || S.at === 'break')) { save(); e.preventDefault(); e.returnValue = ''; }
  });

  function tick() {
    var now = Date.now(), dt = (now - R.lastTick) / 1000; R.lastTick = now;
    if (!S || dt <= 0 || dt > 5) return;          // a long gap is a sleeping tab: pause, do not charge it
    if (S.at === 'run') {
      S.elapsed[S.sec] += dt;
      if (R.view === 'q') S.spent[S.sec][S.idx] += dt;
      var rem = SEC[S.sec].min * 60 - S.elapsed[S.sec];
      var t = $('pmTimer'); if (t) { t.textContent = mmss(rem); t.classList.toggle('warn', rem <= 300); }
      if (rem <= 0) { endSection(true); return; }
    } else if (S.at === 'break') {
      S.elapsed.brk += dt;
      var br = BREAK_SEC - S.elapsed.brk;
      var bt = $('brkTimer'); if (bt) bt.textContent = mmss(br);
      if (br <= 0) { endBreak(); return; }
    } else return;
    R.sinceSave += dt;
    if (R.sinceSave >= 2) { R.sinceSave = 0; save(); }
  }

  function topBar(left, leftSmall) {
    var m = mockById(S.mockId);
    var rem = S.at === 'run' ? mmss(SEC[S.sec].min * 60 - S.elapsed[S.sec]) : '';
    return '<div class="pm-top"><div class="l"><span class="big">' + left + '</span><span class="small">' + (leftSmall || '') + '</span></div>' +
      '<div class="c"><span class="small">AceTheDAT.com</span><span class="big">' + esc(m ? m.name : '') + '</span></div>' +
      '<div class="r">' + (S.at === 'run' ? '<span class="small">Time remaining</span><br><span class="timer" id="pmTimer">' + rem + '</span>' : '') + '</div></div>';
  }

  /* ---------------- section intros ---------------- */
  var INTRO = {
    sons: ['You have 90 minutes for 100 questions: 40 biology, then 30 general chemistry, then 30 organic chemistry. They share one clock, so you decide how to spend it.',
      'Exhibit opens the periodic table for any question in this section. There is no calculator here.',
      'Mark anything you want to revisit. Review shows every question, with the open and marked ones flagged.',
      'When you end the section, or the clock runs out, you move on to perceptual ability and cannot return.'],
    pat: ['You have 60 minutes for 90 questions in six subtests of 15: keyholes, top-front-end, angle ranking, hole punching, cube counting, and pattern folding.',
      'There is no calculator and no exhibit in this section.',
      'A guess costs nothing. Before the clock ends, put a letter on every open question.',
      'After this section comes the optional 30-minute break.'],
    rc: ['You have 60 minutes for 50 questions on three science passages. The passage stays beside the question; the questions for each passage come in passage order.',
      'Everything you need is in the passage. Outside knowledge never decides a reading answer.',
      'On a phone, switch between Passage and Question with the two tabs at the top.',
      'After this section comes quantitative reasoning, the last one.'],
    qr: ['You have 45 minutes for 40 questions.',
      'The calculator button opens the on-screen calculator: memory keys, square root, percent and 1/x, like the one at the testing center.',
      'This is the last section. When it ends, your report opens.']
  };
  function renderIntro() {
    R.view = 'intro';
    var sec = SEC[S.sec], m = mockById(S.mockId);
    var first = S.sec === 'sons';
    var patWait = S.sec === 'pat' && !R.patTest;
    var h = topBar(sec.short, 'Section ' + (SECTION_KEYS.indexOf(S.sec) + 1) + ' of 4') + '<div class="pm-body"><div class="pm-screen">';
    if (first) h += '<p style="margin:0 0 6px;font-weight:700;color:var(--pm)">' + esc(m.name) + '</p>';
    h += '<h2>' + sec.name + '</h2><ul>' + INTRO[S.sec].map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>';
    if (patWait) h += '<div style="height:6px;background:#e1e5e8;border-radius:4px;overflow:hidden;max-width:360px;margin-top:10px"><i id="patProg" style="display:block;height:100%;width:0;background:var(--pm)"></i></div>';
    h += '<div class="row"><button class="pm-act primary" type="button" id="patBegin"' + (patWait ? ' disabled' : '') + '>' + (patWait ? 'Preparing figures' : 'Begin section') + '</button>' +
      (first ? '<button class="pm-act" type="button" id="leaveBtn">Back to test list</button>' : '') + '</div>' +
      '<p style="font-size:13px;margin-top:16px">The ' + sec.min + '-minute clock starts when you press Begin.</p></div></div>';
    $('pm').innerHTML = h;
    $('patBegin').addEventListener('click', function () {
      if (S.sec === 'pat' && !R.patTest) return;
      S.at = 'run'; S.idx = 0; R.view = 'q'; save(); renderQ();
    });
    if (first) $('leaveBtn').addEventListener('click', function () { drop(K_ACTIVE); stopTimer(); S = null; renderLanding(); });
    if (patWait) ensurePat(mockById(S.mockId)).catch(function () {});
    window.scrollTo(0, 0);
  }
  function stopTimer() { if (R.timer) { clearInterval(R.timer); R.timer = null; } closeWins(); }

  /* ---------------- question screens ---------------- */
  function chipsFor(x) {
    if (S.sec === 'sons') {
      return [['Biology', 'Bio 1-40'], ['Gen Chem', 'GChem 41-70'], ['OChem', 'OChem 71-100']].map(function (c) { return '<span class="pm-chip' + (x.sub === c[0] ? ' cur' : '') + '">' + c[1] + '</span>'; }).join('');
    }
    if (S.sec === 'pat' && PAT) {
      var n = S.idx + 1;
      return PAT.SECTIONS.map(function (s) { return '<span class="pm-chip' + (n >= s.from && n <= s.to ? ' cur' : '') + '">' + s.short + '</span>'; }).join('');
    }
    if (S.sec === 'rc') return [0, 1, 2].map(function (i) { return '<span class="pm-chip' + (x.pi === i ? ' cur' : '') + '">Passage ' + (i + 1) + '</span>'; }).join('');
    return '';
  }
  function renderQ() {
    R.view = 'q';
    var list = items(S.sec), x = list[S.idx];
    if (!x) { renderIntro(); return; }
    var a = S.answers[S.sec][S.idx], mk = S.marked[S.sec][S.idx];
    var tools = '<div class="pm-tools"><div class="chips">' + chipsFor(x) + '</div></div>';
    var body = '';
    if (x.kind === 'mc') body = '<div class="pm-body" id="pmBody"><div class="pm-card">' + mcHTML(x, a) + '</div></div>';
    else if (x.kind === 'pat') body = '<div class="pm-body" id="pmBody"><div class="pm-card pat-area">' + patHTML(x, a) + '</div></div>';
    else body = rcHTML(x, a);
    var tool = S.sec === 'sons' ? '<button class="pm-btn" type="button" id="exBtn" aria-pressed="' + R.pt + '">E<u>x</u>hibit</button>' :
      S.sec === 'qr' ? '<button class="pm-btn" type="button" id="calcBtn" aria-pressed="' + R.calcOpen + '"><u>C</u>alculator</button>' : '';
    var last = S.idx === list.length - 1;
    $('pm').innerHTML = topBar('Question ' + (S.idx + 1) + ' of ' + list.length, SEC[S.sec].short) + tools + body +
      '<div class="pm-foot"><button class="pm-btn" type="button" id="prevBtn"' + (S.idx === 0 ? ' disabled' : '') + '><u>P</u>revious</button>' +
      '<button class="pm-btn" type="button" id="nextBtn">' + (last ? '<u>R</u>eview' : '<u>N</u>ext') + '</button>' +
      '<button class="pm-btn" type="button" id="markBtn" aria-pressed="' + mk + '"><u>M</u>ark' + (mk ? 'ed' : '') + '</button>' +
      '<button class="pm-btn" type="button" id="revBtn"><u>R</u>eview</button>' + tool +
      '<button class="pm-btn end" type="button" id="endBtn">End section</button></div>';
    Array.prototype.forEach.call($('pm').querySelectorAll('[data-pick]'), function (b) {
      b.addEventListener('click', function () { pick(parseInt(b.dataset.pick, 10)); });
    });
    $('prevBtn').addEventListener('click', prev);
    $('nextBtn').addEventListener('click', next);
    $('markBtn').addEventListener('click', toggleMark);
    $('revBtn').addEventListener('click', openReview);
    $('endBtn').addEventListener('click', askEnd);
    if ($('exBtn')) $('exBtn').addEventListener('click', togglePT);
    if ($('calcBtn')) $('calcBtn').addEventListener('click', toggleCalc);
    Array.prototype.forEach.call($('pm').querySelectorAll('[data-tab]'), function (b) { b.addEventListener('click', function () { R.rcTab = b.dataset.tab; renderQ(); }); });
    drawMolecules();
    if (S.sec === 'rc') {
      var pass = $('rcPass');
      if (pass && R.rcScroll && R.rcScroll.pid === x.p.id) pass.scrollTop = R.rcScroll.top;
      if (pass) pass.addEventListener('scroll', function () { R.rcScroll = { pid: x.p.id, top: pass.scrollTop }; });
    }
    save();
  }
  function optRow(i, inner, sel) {
    return '<button type="button" class="pm-opt" role="radio" aria-checked="' + sel + '" data-pick="' + i + '"><span class="radio"></span><span class="let">' + L[i] + '.</span><span class="txt">' + inner + '</span></button>';
  }
  function mcHTML(x, a) {
    var it = x.it;
    var subj = S.sec === 'sons' ? 'Survey of the Natural Sciences: ' + (x.sub === 'Biology' ? 'Biology' : x.sub === 'Gen Chem' ? 'General Chemistry' : 'Organic Chemistry') : 'Quantitative Reasoning';
    var h = '<div class="pm-subject">' + subj + '</div><div class="pm-stem">' + esc(it.q) + '</div>';
    if (it.qs) h += '<div class="pm-mol pm-stem-mol"><canvas data-smiles="' + esc(it.qs) + '" width="380" height="170"></canvas></div>';
    h += '<div class="pm-opts" role="radiogroup">' + it.opts.map(function (o, i) {
      var inner = it.os ? '<span class="pm-mol"><canvas data-smiles="' + esc(o) + '" width="300" height="140"></canvas></span>' : esc(o);
      return optRow(i, inner, a === i);
    }).join('') + '</div>';
    return h;
  }
  function patOptClass(type) { return type === 'angles' || type === 'cubes' ? 'opts text' : (type === 'keyholes' || type === 'holepunch') ? 'opts cols-5' : 'opts cols-4'; }
  function patHTML(x, a) {
    var it = x.it, R2 = PAT[it.type];
    return '<p class="prompt">' + esc(it.prompt) + '</p><div class="stem">' + R2.renderFigure(it) + '</div><div class="' + patOptClass(it.type) + '" role="radiogroup">' +
      it.options.map(function (op, i) {
        return '<button type="button" class="opt" role="radio" aria-checked="' + (a === i) + '" data-pick="' + i + '"><span class="let"><i></i>' + L[i] + '</span>' + R2.renderOption(it, i) + '</button>';
      }).join('') + '</div>';
  }
  function rcHTML(x, a) {
    var p = x.p, q = x.q;
    var paras = p.paragraphs.map(function (para, i) { return '<p><span class="pn">' + (i + 1) + '</span><span>' + esc(para.join(' ')) + '</span></p>'; }).join('');
    var opts = q.choices.map(function (c, i) { return optRow(i, esc(c), a === i); }).join('');
    return '<div class="rc-tabs"><button type="button" data-tab="p" aria-pressed="' + (R.rcTab === 'p') + '">Passage</button><button type="button" data-tab="q" aria-pressed="' + (R.rcTab === 'q') + '">Question</button></div>' +
      '<div class="pm-body" id="pmBody" style="overflow:hidden"><div class="rc-split ' + (R.rcTab === 'q' ? 'show-q' : 'show-p') + '" style="height:100%">' +
      '<div class="rc-pass" id="rcPass"><h2>' + esc(p.title) + '</h2><div class="meta">Passage ' + (x.pi + 1) + ' of 3</div>' + paras + '</div>' +
      '<div class="rc-q"><div class="pm-subject">Reading Comprehension</div><div class="pm-stem">' + esc(q.stem) + '</div><div class="pm-opts" role="radiogroup">' + opts + '</div></div></div></div>';
  }
  function drawMolecules() {
    var cs = $('pm').querySelectorAll('canvas[data-smiles]');
    if (!cs.length) return;
    if (R.smi === null) {
      try {
        R.smi = typeof window.SmiDrawer === 'function' ? new window.SmiDrawer({ width: 300, height: 140, padding: 6, bondThickness: 1.2, bondLength: 18, shortBondLength: 0.85, compactDrawing: true, fontSizeLarge: 11, fontSizeSmall: 8, themes: { light: { C: '#1a1d20', O: '#cf3b3b', N: '#3a78c4', Cl: '#2e8a3e', Br: '#8a4a2a', F: '#3aa83a', I: '#7a3a8a', S: '#a08a1a', P: '#c06a1a', H: '#1a1d20', BACKGROUND: '#fff' } } }) : false;
      } catch (e) { R.smi = false; }
    }
    Array.prototype.forEach.call(cs, function (c) {
      var smi = c.getAttribute('data-smiles');
      try { if (!R.smi) throw new Error('no drawer'); R.smi.draw(smi, c, 'light'); }
      catch (e) { var ctx = c.getContext && c.getContext('2d'); if (ctx) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.fillStyle = '#1a1d20'; ctx.font = '14px monospace'; ctx.fillText(smi, 8, c.height / 2); } }
    });
  }

  function pick(i) {
    if (S.at !== 'run' || R.view !== 'q') return;
    S.answers[S.sec][S.idx] = i;
    Array.prototype.forEach.call($('pm').querySelectorAll('[data-pick]'), function (b) { b.setAttribute('aria-checked', String(parseInt(b.dataset.pick, 10) === i)); });
    save();
  }
  function go(idx) {
    var n = items(S.sec).length;
    S.idx = Math.max(0, Math.min(n - 1, idx));
    if (S.sec === 'rc') R.rcTab = window.innerWidth <= 860 ? 'q' : 'p';
    renderQ();
    var b = $('pmBody'); if (b) b.scrollTop = 0;
  }
  function next() { if (S.idx >= items(S.sec).length - 1) openReview(); else go(S.idx + 1); }
  function prev() { if (S.idx > 0) go(S.idx - 1); }
  function toggleMark() { S.marked[S.sec][S.idx] = !S.marked[S.sec][S.idx]; renderQ(); }

  /* ---------------- review screen ---------------- */
  function groupsFor(sec) {
    if (sec === 'sons') return [['Biology', 0, 40], ['General Chemistry', 40, 70], ['Organic Chemistry', 70, 100]];
    if (sec === 'pat' && PAT) return PAT.SECTIONS.map(function (s) { return [s.name, s.from - 1, s.to]; });
    if (sec === 'rc') { var g = [], list = items('rc'); [0, 1, 2].forEach(function (pi) { var f = -1, t = -1; list.forEach(function (x, i) { if (x.pi === pi) { if (f < 0) f = i; t = i + 1; } }); if (f >= 0) g.push(['Passage ' + (pi + 1) + ': ' + list[f].p.title, f, t]); }); return g; }
    return [['Quantitative Reasoning', 0, items(sec).length]];
  }
  function openReview() {
    R.view = 'review';
    var sec = S.sec, ans = S.answers[sec], mk = S.marked[sec], n = items(sec).length;
    var answered = ans.filter(function (v) { return v != null; }).length, marked = mk.filter(Boolean).length;
    var grid = groupsFor(sec).map(function (g) {
      var h = '<h4>' + esc(g[0]) + '</h4>';
      for (var i = g[1]; i < g[2]; i++) h += '<button type="button" class="pm-cell' + (ans[i] != null ? ' ans' : '') + (mk[i] ? ' mk' : '') + '" data-jump="' + i + '" aria-label="Question ' + (i + 1) + (ans[i] != null ? ', answered' : ', open') + (mk[i] ? ', marked' : '') + '">' + (i + 1) + '</button>';
      return h;
    }).join('');
    $('pm').innerHTML = topBar('Review', SEC[sec].short) + '<div class="pm-body"><div class="pm-screen">' +
      '<h2>' + SEC[sec].name + ': review</h2><p>Select any question to go straight back to it. End the section when you are ready; after that it cannot be reopened.</p>' +
      '<div class="pm-stats"><div class="pm-stat"><div class="lbl">Answered</div><div class="num">' + answered + '/' + n + '</div></div><div class="pm-stat"><div class="lbl">Open</div><div class="num">' + (n - answered) + '</div></div><div class="pm-stat"><div class="lbl">Marked</div><div class="num">' + marked + '</div></div></div>' +
      '<div class="pm-legend"><span><i class="sw"></i>Open</span><span><i class="sw ans"></i>Answered</span><span><i class="sw mk"></i>Marked</span></div>' +
      '<div class="pm-grid">' + grid + '</div>' +
      '<div class="row"><button class="pm-act" type="button" id="backQ">Return to question ' + (S.idx + 1) + '</button>' +
      '<button class="pm-act" type="button" id="revOpen"' + (answered === n ? ' disabled' : '') + '>First open question</button>' +
      '<button class="pm-act" type="button" id="revMarked"' + (marked ? '' : ' disabled') + '>First marked question</button>' +
      '<button class="pm-act primary" type="button" id="revEnd">End section</button></div></div></div>';
    Array.prototype.forEach.call($('pm').querySelectorAll('[data-jump]'), function (b) { b.addEventListener('click', function () { go(parseInt(b.dataset.jump, 10)); }); });
    $('backQ').addEventListener('click', function () { renderQ(); });
    $('revOpen').addEventListener('click', function () { go(ans.indexOf(null)); });
    $('revMarked').addEventListener('click', function () { go(mk.indexOf(true)); });
    $('revEnd').addEventListener('click', askEnd);
    save();
  }
  function askEnd() {
    var open = S.answers[S.sec].filter(function (v) { return v == null; }).length;
    var text = open ? 'You have ' + open + ' open question' + (open === 1 ? '' : 's') + '. A guess can only help, so consider putting a letter on each one. Once this section ends you cannot return to it.' : 'Every question has an answer. Once this section ends you cannot return to it.';
    confirmBox('End ' + SEC[S.sec].name + '?', text, [
      { t: open ? 'Go to the first open one' : 'Keep checking', fn: function () { if (open) go(S.answers[S.sec].indexOf(null)); } },
      { t: 'End section', primary: true, fn: function () { endSection(false); } }
    ]);
  }
  function endSection(timeUp) {
    closeWins();
    var cap = SEC[S.sec].min * 60;
    S.elapsed[S.sec] = Math.min(cap, S.elapsed[S.sec]);
    S.done[S.sec] = { timeUp: !!timeUp, at: Date.now() };
    var nxt = ORDER[ORDER.indexOf(S.sec) + 1];
    if (!nxt) { finish(); return; }
    if (nxt === 'break') { S.at = 'break'; S.sec = 'brk'; save(); renderBreak(); return; }
    S.sec = nxt; S.at = 'intro'; S.idx = 0; save(); renderIntro();
  }

  /* ---------------- break ---------------- */
  function renderBreak() {
    R.view = 'break';
    $('pm').innerHTML = topBar('Optional break', 'After perceptual ability') + '<div class="pm-body"><div class="pm-screen" style="text-align:center">' +
      '<h2>Optional break</h2><p>Up to 30 minutes. Stand up, drink some water, look at something far away. Reading comprehension begins when you choose, or when this timer reaches zero.</p>' +
      '<div class="bigtimer" id="brkTimer">' + mmss(BREAK_SEC - S.elapsed.brk) + '</div>' +
      '<div class="row" style="justify-content:center"><button class="pm-act primary" type="button" id="brkEnd">' + (S.elapsed.brk < 1 ? 'Skip the break' : 'End the break') + '</button></div></div></div>';
    $('brkEnd').addEventListener('click', endBreak);
  }
  function endBreak() { S.elapsed.brk = Math.min(BREAK_SEC, S.elapsed.brk); S.sec = 'rc'; S.at = 'intro'; S.idx = 0; save(); renderIntro(); }

  /* ---------------- exhibit: periodic table ---------------- */
  var PT = [
    [1, 1, 1, 'H', '1.008'], [1, 18, 2, 'He', '4.003'],
    [2, 1, 3, 'Li', '6.94'], [2, 2, 4, 'Be', '9.012'], [2, 13, 5, 'B', '10.81'], [2, 14, 6, 'C', '12.01'], [2, 15, 7, 'N', '14.01'], [2, 16, 8, 'O', '16.00'], [2, 17, 9, 'F', '19.00'], [2, 18, 10, 'Ne', '20.18'],
    [3, 1, 11, 'Na', '22.99'], [3, 2, 12, 'Mg', '24.31'], [3, 13, 13, 'Al', '26.98'], [3, 14, 14, 'Si', '28.09'], [3, 15, 15, 'P', '30.97'], [3, 16, 16, 'S', '32.06'], [3, 17, 17, 'Cl', '35.45'], [3, 18, 18, 'Ar', '39.95'],
    [4, 1, 19, 'K', '39.10'], [4, 2, 20, 'Ca', '40.08'], [4, 3, 21, 'Sc', '44.96'], [4, 4, 22, 'Ti', '47.87'], [4, 5, 23, 'V', '50.94'], [4, 6, 24, 'Cr', '52.00'], [4, 7, 25, 'Mn', '54.94'], [4, 8, 26, 'Fe', '55.85'], [4, 9, 27, 'Co', '58.93'], [4, 10, 28, 'Ni', '58.69'], [4, 11, 29, 'Cu', '63.55'], [4, 12, 30, 'Zn', '65.38'], [4, 13, 31, 'Ga', '69.72'], [4, 14, 32, 'Ge', '72.63'], [4, 15, 33, 'As', '74.92'], [4, 16, 34, 'Se', '78.97'], [4, 17, 35, 'Br', '79.90'], [4, 18, 36, 'Kr', '83.80'],
    [5, 1, 37, 'Rb', '85.47'], [5, 2, 38, 'Sr', '87.62'], [5, 3, 39, 'Y', '88.91'], [5, 4, 40, 'Zr', '91.22'], [5, 5, 41, 'Nb', '92.91'], [5, 6, 42, 'Mo', '95.95'], [5, 7, 43, 'Tc', '(98)'], [5, 8, 44, 'Ru', '101.1'], [5, 9, 45, 'Rh', '102.9'], [5, 10, 46, 'Pd', '106.4'], [5, 11, 47, 'Ag', '107.9'], [5, 12, 48, 'Cd', '112.4'], [5, 13, 49, 'In', '114.8'], [5, 14, 50, 'Sn', '118.7'], [5, 15, 51, 'Sb', '121.8'], [5, 16, 52, 'Te', '127.6'], [5, 17, 53, 'I', '126.9'], [5, 18, 54, 'Xe', '131.3'],
    [6, 1, 55, 'Cs', '132.9'], [6, 2, 56, 'Ba', '137.3'], [6, 3, 57, 'La', '138.9'], [6, 4, 72, 'Hf', '178.5'], [6, 5, 73, 'Ta', '180.9'], [6, 6, 74, 'W', '183.8'], [6, 7, 75, 'Re', '186.2'], [6, 8, 76, 'Os', '190.2'], [6, 9, 77, 'Ir', '192.2'], [6, 10, 78, 'Pt', '195.1'], [6, 11, 79, 'Au', '197.0'], [6, 12, 80, 'Hg', '200.6'], [6, 13, 81, 'Tl', '204.4'], [6, 14, 82, 'Pb', '207.2'], [6, 15, 83, 'Bi', '209.0'], [6, 16, 84, 'Po', '(209)'], [6, 17, 85, 'At', '(210)'], [6, 18, 86, 'Rn', '(222)'],
    [7, 1, 87, 'Fr', '(223)'], [7, 2, 88, 'Ra', '(226)'], [7, 3, 89, 'Ac', '(227)'], [7, 4, 104, 'Rf', '(267)'], [7, 5, 105, 'Db', '(268)'], [7, 6, 106, 'Sg', '(269)'], [7, 7, 107, 'Bh', '(270)'], [7, 8, 108, 'Hs', '(269)'], [7, 9, 109, 'Mt', '(278)'], [7, 10, 110, 'Ds', '(281)'], [7, 11, 111, 'Rg', '(282)'], [7, 12, 112, 'Cn', '(285)'], [7, 13, 113, 'Nh', '(286)'], [7, 14, 114, 'Fl', '(289)'], [7, 15, 115, 'Mc', '(290)'], [7, 16, 116, 'Lv', '(293)'], [7, 17, 117, 'Ts', '(294)'], [7, 18, 118, 'Og', '(294)']
  ];
  var LAN = [[58, 'Ce', '140.1'], [59, 'Pr', '140.9'], [60, 'Nd', '144.2'], [61, 'Pm', '(145)'], [62, 'Sm', '150.4'], [63, 'Eu', '152.0'], [64, 'Gd', '157.3'], [65, 'Tb', '158.9'], [66, 'Dy', '162.5'], [67, 'Ho', '164.9'], [68, 'Er', '167.3'], [69, 'Tm', '168.9'], [70, 'Yb', '173.0'], [71, 'Lu', '175.0']];
  var ACT = [[90, 'Th', '232.0'], [91, 'Pa', '231.0'], [92, 'U', '238.0'], [93, 'Np', '(237)'], [94, 'Pu', '(244)'], [95, 'Am', '(243)'], [96, 'Cm', '(247)'], [97, 'Bk', '(247)'], [98, 'Cf', '(251)'], [99, 'Es', '(252)'], [100, 'Fm', '(257)'], [101, 'Md', '(258)'], [102, 'No', '(259)'], [103, 'Lr', '(266)']];
  function cell(z, s, m) { return '<td><span class="z">' + z + '</span><span class="s">' + s + '</span><span class="m">' + m + '</span></td>'; }
  function ptHTML() {
    var g = {}; PT.forEach(function (e) { g[e[0] + '-' + e[1]] = e; });
    var rows = '';
    for (var r = 1; r <= 7; r++) { rows += '<tr>'; for (var c = 1; c <= 18; c++) { var e = g[r + '-' + c]; rows += e ? cell(e[2], e[3], e[4]) : '<td class="e"></td>'; } rows += '</tr>'; }
    var f = function (list) { return '<tr><td class="e"></td><td class="e"></td><td class="e"></td>' + list.map(function (e) { return cell(e[0], e[1], e[2]); }).join('') + '<td class="e"></td></tr>'; };
    return '<table>' + rows + '</table><table style="margin-top:8px">' + f(LAN) + f(ACT) + '</table>' +
      '<div class="k">Avogadro\'s number 6.022 &times; 10<sup>23</sup> /mol; R = 8.314 J/(mol K) = 0.0821 L atm/(mol K); F = 96,485 C/mol; h = 6.626 &times; 10<sup>-34</sup> J s; c = 3.00 &times; 10<sup>8</sup> m/s</div>';
  }
  function makeWin(id, cls, title, inner) {
    var w = document.createElement('div');
    w.id = id; w.className = 'pm-win ' + cls;
    w.innerHTML = '<div class="bar"><span>' + title + '</span><button type="button" data-close="1">Close</button></div>' + inner;
    document.body.appendChild(w);
    var bar = w.querySelector('.bar'), drag = null;
    bar.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; var r = w.getBoundingClientRect(); drag = { dx: e.clientX - r.left, dy: e.clientY - r.top }; bar.setPointerCapture(e.pointerId); });
    bar.addEventListener('pointermove', function (e) { if (!drag) return; w.style.right = 'auto'; w.style.left = Math.max(0, e.clientX - drag.dx) + 'px'; w.style.top = Math.max(0, e.clientY - drag.dy) + 'px'; });
    bar.addEventListener('pointerup', function () { drag = null; });
    return w;
  }
  function togglePT() {
    R.pt = !R.pt;
    var w = $('pmPT');
    if (R.pt && !w) { w = makeWin('pmPT', 'pm-pt', 'Periodic Table of the Elements', '<div class="inner">' + ptHTML() + '</div>'); w.querySelector('[data-close]').addEventListener('click', togglePT); }
    if (w) w.classList.toggle('hidden', !R.pt);
    var b = $('exBtn'); if (b) b.setAttribute('aria-pressed', String(R.pt));
  }

  /* ---------------- calculator (QR only) ---------------- */
  function toggleCalc() {
    R.calcOpen = !R.calcOpen;
    var w = $('pmCalc');
    if (R.calcOpen && !w) {
      R.calc = { disp: '0', op: null, acc: null, fresh: false, mem: null };
      var keys = [['MC', 'mem'], ['MR', 'mem'], ['MS', 'mem'], ['M+', 'mem'], ['M-', 'mem'], ['Back', 'fn'], ['CE', 'fn'], ['C', 'fn'], ['+/-', 'fn'], ['sqrt', 'fn'],
        ['7'], ['8'], ['9'], ['/', 'op'], ['%', 'fn'], ['4'], ['5'], ['6'], ['*', 'op'], ['1/x', 'fn'], ['1'], ['2'], ['3'], ['-', 'op'], ['=', 'eq'], ['0', 'zero'], ['.'], ['+', 'op']];
      w = makeWin('pmCalc', 'pm-calc', 'Calculator', '<div class="disp" id="calcDisp">0</div><div class="memf" id="calcMem"></div><div class="keys">' +
        keys.map(function (k) { return '<button type="button" class="' + (k[1] || '') + '" data-k="' + k[0] + '">' + k[0] + '</button>'; }).join('') + '</div>');
      w.querySelector('[data-close]').addEventListener('click', toggleCalc);
      Array.prototype.forEach.call(w.querySelectorAll('[data-k]'), function (b) { b.addEventListener('click', function () { calcKey(b.dataset.k); }); });
    }
    if (w) w.classList.toggle('hidden', !R.calcOpen);
    var b = $('calcBtn'); if (b) b.setAttribute('aria-pressed', String(R.calcOpen));
  }
  function calcKey(k) {
    var C = R.calc; if (!C) return;
    var cur = function () { return parseFloat(C.disp) || 0; };
    var set = function (v) { C.disp = !isFinite(v) ? 'Error' : (Math.abs(v) > 1e16 || (Math.abs(v) < 1e-10 && v !== 0)) ? v.toExponential(6) : String(parseFloat(v.toPrecision(15))); };
    var op = function (a, b, o) { return o === '+' ? a + b : o === '-' ? a - b : o === '*' ? a * b : b === 0 ? NaN : a / b; };
    if (/^[0-9]$/.test(k)) { if (C.disp === '0' || C.fresh || C.disp === 'Error') { C.disp = k; C.fresh = false; } else if (C.disp.replace(/[^0-9]/g, '').length < 16) C.disp += k; }
    else if (k === '.') { if (C.fresh || C.disp === 'Error') { C.disp = '0.'; C.fresh = false; } else if (C.disp.indexOf('.') < 0) C.disp += '.'; }
    else if (k === 'Back') { if (!C.fresh) { C.disp = C.disp.length > 1 ? C.disp.slice(0, -1) : '0'; if (C.disp === '-') C.disp = '0'; } }
    else if (k === 'CE') { C.disp = '0'; C.fresh = false; }
    else if (k === 'C') { C.disp = '0'; C.op = null; C.acc = null; C.fresh = false; }
    else if (k === '+/-') { if (C.disp !== '0' && C.disp !== 'Error') C.disp = C.disp.charAt(0) === '-' ? C.disp.slice(1) : '-' + C.disp; }
    else if (k === '%') { set(C.op && C.acc !== null ? (C.acc * cur()) / 100 : cur() / 100); }
    else if (k === 'sqrt') { set(Math.sqrt(cur())); C.fresh = true; }
    else if (k === '1/x') { set(cur() === 0 ? Infinity : 1 / cur()); C.fresh = true; }
    else if (k === 'MC') C.mem = null;
    else if (k === 'MR') { if (C.mem !== null) { set(C.mem); C.fresh = true; } }
    else if (k === 'MS') C.mem = cur();
    else if (k === 'M+') C.mem = (C.mem || 0) + cur();
    else if (k === 'M-') C.mem = (C.mem || 0) - cur();
    else if ('+-*/'.indexOf(k) >= 0) { if (C.op && C.acc !== null && !C.fresh) { C.acc = op(C.acc, cur(), C.op); set(C.acc); } else C.acc = cur(); C.op = k; C.fresh = true; }
    else if (k === '=') { if (C.op && C.acc !== null) { C.acc = op(C.acc, cur(), C.op); set(C.acc); C.op = null; C.fresh = true; } }
    $('calcDisp').textContent = C.disp;
    $('calcMem').textContent = C.mem !== null ? 'M' : '';
  }
  function closeWins() {
    ['pmPT', 'pmCalc'].forEach(function (id) { var w = $(id); if (w) w.remove(); });
    R.pt = false; R.calcOpen = false; R.calc = null;
  }

  /* ---------------- keyboard (Prometric uses Alt + the underlined letter) ---------------- */
  document.addEventListener('keydown', function (e) {
    if (!S || S.at !== 'run' || !e.altKey) return;
    var k = e.key.toLowerCase(), code = e.code;
    var hit = function (letter) { return k === letter || code === 'Key' + letter.toUpperCase(); };
    if (R.view === 'q') {
      if (hit('n')) { e.preventDefault(); next(); }
      else if (hit('p')) { e.preventDefault(); prev(); }
      else if (hit('m')) { e.preventDefault(); toggleMark(); }
      else if (hit('r')) { e.preventDefault(); openReview(); }
      else if (hit('x') && S.sec === 'sons') { e.preventDefault(); togglePT(); }
      else if (hit('c') && S.sec === 'qr') { e.preventDefault(); toggleCalc(); }
    }
  });

  /* ---------------- modal ---------------- */
  function confirmBox(title, text, btns, onLanding) {
    var m = document.createElement('div');
    m.className = 'pm-modal';
    m.innerHTML = '<div class="box" role="dialog" aria-modal="true"><h3>' + esc(title) + '</h3><p>' + esc(text) + '</p><div class="row"></div></div>';
    btns.forEach(function (b) {
      var el = document.createElement('button'); el.type = 'button'; el.className = 'pm-act' + (b.primary ? ' primary' : ''); el.textContent = b.t;
      el.addEventListener('click', function () { m.remove(); b.fn(); });
      m.querySelector('.row').appendChild(el);
    });
    document.body.appendChild(m);
    var f = m.querySelector('.primary') || m.querySelector('button'); if (f) f.focus();
    return onLanding;
  }

  /* ---------------- scoring + report ---------------- */
  function score(st) {
    var res = { sections: {}, subjects: {}, topics: {}, misses: [] };
    var add = function (map, k, ok) { var r = map[k] || (map[k] = { correct: 0, total: 0 }); r.total++; if (ok) r.correct++; };
    SECTION_KEYS.forEach(function (sk) {
      var list = items(sk), ans = st.answers[sk], c = 0;
      list.forEach(function (x, i) {
        var ok = ans[i] === keyOf(x);
        if (ok) c++;
        add(res.subjects, x.sub, ok);
        var topic = x.kind === 'mc' ? x.it.topic : x.kind === 'pat' ? (PAT.SECTIONS.filter(function (s) { return s.type === x.it.type; })[0] || {}).name : (RC.types[x.q.type] || x.q.type);
        add(res.topics, x.sub + '|' + topic, ok);
        if (!ok) res.misses.push({ sec: sk, i: i, x: x, ans: ans[i] });
      });
      res.sections[sk] = { correct: c, total: list.length, timeSec: Math.round(Math.min(SEC[sk].min * 60, st.elapsed[sk] || 0)), timeAllowedSec: SEC[sk].min * 60, timeUp: !!(st.done[sk] && st.done[sk].timeUp) };
    });
    return res;
  }
  function recordFrom(st, res) {
    var subj = {};
    ['Biology', 'Gen Chem', 'OChem', 'PAT', 'RC', 'QR'].forEach(function (k) { var r = res.subjects[k] || { correct: 0, total: 0 }; subj[k] = { correct: r.correct, total: r.total, pct: pct(r.correct, r.total) }; });
    var sons = res.sections.sons, tc = 0, tq = 0;
    SECTION_KEYS.forEach(function (k) { tc += res.sections[k].correct; tq += res.sections[k].total; });
    var m = mockById(st.mockId);
    return { testId: st.mockId, testName: m ? m.name : st.mockId, kind: 'full-length', ts: Date.now(), subjects: subj, sonsCorrect: sons.correct, sonsTotal: sons.total, totalCorrect: tc, totalQs: tq, sections: res.sections, breakSec: Math.round(st.elapsed.brk || 0) };
  }
  function finish() {
    stopTimer();
    var res = score(S), rec = recordFrom(S, res);
    var att = { id: 'fm-' + Date.now().toString(36), mockId: S.mockId, ts: rec.ts, answers: S.answers, spent: S.spent, elapsed: S.elapsed, done: S.done, record: rec };
    var list = attempts(); list.unshift(att); write(K_ATTEMPTS, list.slice(0, 30));
    // Cross-tool history, the same record shape the Prometric mocks write: raw counts and time only.
    try {
      var hist = (read('al:mockHistory', []) || []).map(function (r) { if (r && typeof r === 'object') { delete r.predicted; delete r.percentile; delete r.scaledScore; delete r.sonsScaled; delete r.qrScaled; delete r.academicAvg; } return r; });
      hist.push(rec); write('al:mockHistory', hist.slice(-50));
    } catch (e) { /* cache only */ }
    drop(K_ACTIVE);
    var done = S; S = null;
    renderReport(done, res, rec);
  }
  function openSavedReport(id) {
    var a = attempts().filter(function (x) { return x.id === id; })[0]; if (!a) return;
    var m = mockById(a.mockId); if (!m) return;
    R.items = buildItems(m); R.patTest = null; R.patBuilding = null;
    var st = { mockId: a.mockId, answers: a.answers, spent: a.spent, elapsed: a.elapsed, done: a.done };
    $('landing').classList.add('hidden');
    $('report').classList.remove('hidden');
    $('report').innerHTML = '<div class="wrap"><p class="lede">Opening your report.</p></div>';
    ensurePat(m).then(function () { renderReport(st, score(st), a.record); }, function () { renderReport(st, score(st), a.record); });
  }

  function meter(p) { return '<span class="meter"><i style="width:' + p + '%"></i></span>'; }
  function renderReport(st, res, rec) {
    $('pm').classList.add('hidden'); $('pm').innerHTML = '';
    $('landing').classList.add('hidden');
    document.body.style.overflow = '';
    var m = mockById(st.mockId);
    var sec = res.sections;
    var card = function (k, label, c) { var s = sec[k]; return '<div class="sec-card" style="--c:' + c + '"><div class="k">' + label + '</div><div class="v">' + s.correct + ' / ' + s.total + '</div><div class="s">' + pct(s.correct, s.total) + '% correct, ' + minsec(s.timeSec) + ' of ' + (s.timeAllowedSec / 60) + ' min</div></div>'; };
    var subjRows = ['Biology', 'Gen Chem', 'OChem', 'PAT', 'RC', 'QR'].map(function (k) {
      var r = res.subjects[k] || { correct: 0, total: 0 }, p = pct(r.correct, r.total);
      var name = { 'Biology': 'Biology', 'Gen Chem': 'General Chemistry', 'OChem': 'Organic Chemistry', 'PAT': 'Perceptual Ability', 'RC': 'Reading Comprehension', 'QR': 'Quantitative Reasoning' }[k];
      return '<tr><td><b>' + name + '</b></td><td class="r">' + r.correct + ' / ' + r.total + '</td><td class="r">' + p + '%</td><td class="r hide-sm">' + meter(p) + '</td></tr>';
    }).join('');
    var tps = Object.keys(res.topics).map(function (k) { var r = res.topics[k], parts = k.split('|'); return { sub: parts[0], topic: parts[1], c: r.correct, n: r.total, p: pct(r.correct, r.total) }; })
      .filter(function (t) { return t.n >= 2 && t.c < t.n; }).sort(function (a, b) { return a.p - b.p || b.n - a.n; }).slice(0, 12);
    var topicRows = tps.map(function (t) { return '<tr><td><b>' + esc(t.topic) + '</b><br><span style="font-size:12px;color:var(--muted)">' + esc(subjName(t.sub)) + '</span></td><td class="r">' + t.c + ' / ' + t.n + '</td><td class="r hide-sm">' + meter(t.p) + '</td><td class="r"><a href="' + STUDY[t.sub].review + '">' + STUDY[t.sub].engine + '</a></td></tr>'; }).join('');
    var bySec = {}; res.misses.forEach(function (ms) { (bySec[ms.sec] = bySec[ms.sec] || []).push(ms); });
    var missHTML = SECTION_KEYS.map(function (k) {
      var list = bySec[k] || [];
      if (!list.length) return '<details class="sec"><summary>' + SEC[k].name + ': nothing to review here</summary><p class="note">Every question in this section was correct.</p></details>';
      return '<details class="sec" data-sec="' + k + '"><summary>' + SEC[k].name + ': ' + list.length + ' to review</summary><div class="miss-list" data-for="' + k + '"></div></details>';
    }).join('');

    $('report').classList.remove('hidden');
    $('report').innerHTML = '<header class="topbar"><a class="brand" href="/ace-labs.html">Ace <em>Labs</em></a><span class="spacer"></span><a class="back" href="#" id="toList">Full-length tests</a></header>' +
      '<div class="wrap report"><div class="rail"><div class="kicker">Practice report</div><h1>' + esc(m ? m.name : '') + ', <em>done.</em></h1>' +
      '<p class="big-line">You answered <b>' + rec.totalCorrect + ' of ' + rec.totalQs + '</b> across all four sections. Finishing a full day of testing is its own skill, and you just practiced it. Below is where the points went and the exact place to win the next ones.</p></div>' +
      '<div class="sec-grid">' + card('sons', 'Natural Sciences', 'var(--bio)') + card('pat', 'Perceptual Ability', 'var(--pat)') + card('rc', 'Reading', 'var(--rc)') + card('qr', 'Quantitative', 'var(--qr)') + '</div>' +
      '<p class="note" style="margin-top:10px">Optional break used: ' + minsec(rec.breakSec || 0) + '. Raw scores only; Ace Labs does not convert practice scores to the scaled score.</p>' +
      '<h2>By subject</h2><div class="card" style="padding:8px 14px"><table class="tbl"><thead><tr><th>Subject</th><th class="r">Correct</th><th class="r">Accuracy</th><th class="r hide-sm"></th></tr></thead><tbody>' + subjRows + '</tbody></table></div>' +
      (topicRows ? '<h2>Where the next points are</h2><div class="card" style="padding:8px 14px"><table class="tbl"><thead><tr><th>Topic</th><th class="r">Correct</th><th class="r hide-sm"></th><th class="r">Drill it</th></tr></thead><tbody>' + topicRows + '</tbody></table></div>' : '') +
      '<h2>Question by question</h2><p class="note" style="margin-top:-4px">Every miss shows the answer, the reasoning, and the lesson that teaches it.</p>' + missHTML +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:24px"><a class="btn gold" href="#" id="toList2">Back to full-length tests</a><a class="btn" href="/ace-labs.html">Ace Labs home</a></div></div>';
    var back = function (e) { e.preventDefault(); renderLanding(); window.scrollTo(0, 0); };
    $('toList').addEventListener('click', back); $('toList2').addEventListener('click', back);
    Array.prototype.forEach.call($('report').querySelectorAll('details[data-sec]'), function (d) {
      d.addEventListener('toggle', function () {
        var box = d.querySelector('.miss-list');
        if (!d.open || box.childElementCount) return;
        box.innerHTML = (bySec[d.dataset.sec] || []).map(missHTML1).join('');
        drawReportMolecules(box);
      });
    });
    window.scrollTo(0, 0);
  }
  function subjName(k) { return { 'Biology': 'Biology', 'Gen Chem': 'General Chemistry', 'OChem': 'Organic Chemistry', 'PAT': 'Perceptual Ability', 'RC': 'Reading Comprehension', 'QR': 'Quantitative Reasoning' }[k] || k; }
  function missHTML1(ms) {
    var x = ms.x, st = STUDY[x.sub], you = ms.ans == null ? 'left open' : L[ms.ans];
    var h = '<div class="miss" style="--c:' + st.c + '"><div class="h">' + SEC[ms.sec].short + ', question ' + (ms.i + 1) + '</div>';
    if (x.kind === 'mc') {
      var it = x.it, show = function (i) { return it.os ? '<span class="pm-mol" style="display:inline-block;vertical-align:middle;max-width:220px"><canvas data-smiles="' + esc(it.opts[i]) + '" width="220" height="110"></canvas></span>' : esc(it.opts[i]); };
      h += '<div class="q">' + esc(it.q) + '</div>';
      if (it.qs) h += '<span class="pm-mol" style="display:block;max-width:300px"><canvas data-smiles="' + esc(it.qs) + '" width="300" height="140"></canvas></span>';
      h += '<div class="a">Your answer: <b>' + (ms.ans == null ? 'left open' : L[ms.ans] + '. ' + show(ms.ans)) + '</b><br>Correct: <b>' + L[it.correct] + '. ' + show(it.correct) + '</b></div>';
      h += '<div class="why">' + esc(it.why) + (ms.ans != null && it.traps && it.traps[ms.ans] ? '<br><br><b>About your pick:</b> ' + esc(it.traps[ms.ans]) : '') + '</div>';
      var night = it.nights && it.nights[0];
      h += '<div class="links"><a href="' + st.learn + (night ? '?night=' + night : '') + '">' + (night ? 'Retold night ' + night + ': ' : 'Retold: ') + esc(it.topic) + '</a><a href="' + st.review + '">' + st.engine + '</a></div>';
    } else if (x.kind === 'pat') {
      var p = x.it, P = PAT[p.type];
      h += '<div class="q">' + esc(p.prompt) + '</div><div class="pat-area" style="margin-top:8px"><div class="pat-paper" style="max-width:520px">' + P.renderFigure(p) + '</div></div>';
      h += '<div class="a">Your answer: <b>' + you + '</b>. Correct: <b>' + L[p.answer] + '</b>.</div><div class="pat-area" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">' +
        (ms.ans != null ? '<div style="max-width:160px"><div class="note">Your pick</div>' + P.renderOption(p, ms.ans) + '</div>' : '') + '<div style="max-width:160px"><div class="note">Correct</div>' + P.renderOption(p, p.answer) + '</div></div>';
      h += '<div class="links"><a href="/tools/pat/' + PAT_PAGE[p.type] + '">Practice ' + esc((PAT.SECTIONS.filter(function (s) { return s.type === p.type; })[0] || {}).name || 'this subtest') + '</a><a href="' + st.learn + '">PAT, Retold</a></div>';
    } else {
      var q = x.q, pr = (q.proof || [])[0];
      h += '<div class="q">' + esc(q.stem) + '</div><div class="a">Your answer: <b>' + (ms.ans == null ? 'left open' : L[ms.ans] + '. ' + esc(q.choices[ms.ans])) + '</b><br>Correct: <b>' + L[q.key] + '. ' + esc(q.choices[q.key]) + '</b></div>' +
        '<div class="why">' + (pr ? '<b>Proof line, paragraph ' + pr.paragraph + ':</b> "' + esc(pr.quote) + '"<br><br>' : '') + esc(q.why) + '</div>' +
        '<div class="links"><a href="/tools/rc/">Practice this passage in the RC player</a><a href="' + st.learn + '">Reading, Retold</a></div>';
    }
    return h + '</div>';
  }
  function drawReportMolecules(box) {
    var cs = box.querySelectorAll('canvas[data-smiles]'); if (!cs.length) return;
    if (R.smi === null) drawMolecules();
    Array.prototype.forEach.call(cs, function (c) { try { if (R.smi) R.smi.draw(c.getAttribute('data-smiles'), c, 'light'); } catch (e) { /* text fallback not needed in review */ } });
  }

  /* ---------------- test hook (headless checks) ---------------- */
  window.__fullMock = {
    state: function () { return S; },
    start: function (id) { start(id); },
    begin: function () { var b = $('patBegin'); if (b && !b.disabled) b.click(); },
    answerAll: function (fn) { var list = items(S.sec); list.forEach(function (x, i) { S.answers[S.sec][i] = fn ? fn(x, i) : keyOf(x); }); save(); },
    keyOf: keyOf,
    items: function (sec) { return items(sec || S.sec); },
    endSection: function () { endSection(false); },
    endBreak: function () { endBreak(); },
    patReady: function () { return !!R.patTest; },
    elapse: function (sec) { if (S && S.at === 'run') S.elapsed[S.sec] += sec; }
  };

  renderLanding();
})();
