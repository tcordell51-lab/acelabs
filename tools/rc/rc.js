/* rc.js : the Ace Labs Reading Comprehension player.
 *
 * Views: home, test (timed section or single passage), results, review.
 * Data: window.ACE_RC_BANK (built by scripts/build-rc-bank.mjs).
 * Storage: window.AceRCStore only (localStorage today, a server later).
 *
 * The method it teaches: 20 minutes a passage, read and flag for 10, then the
 * questions for 10, searching for each answer's line. Find the proof line before
 * you look at the choices. Review shows the line that settles every answer.
 */
(function () {
  'use strict';

  var BANK = window.ACE_RC_BANK;
  var Store = window.AceRCStore;
  var app = document.getElementById('app');
  var TYPES = BANK ? BANK.types : {};
  var LET = 'ABCDE';
  var QMAP = {};
  if (BANK) {
    Object.keys(BANK.passages).forEach(function (pid) {
      BANK.passages[pid].questions.forEach(function (q, i) { QMAP[q.id] = { q: q, pid: pid, n: i }; });
    });
  }

  var PLANS = { '10-10': { read: 10, label: '10 and 10' }, '12-8': { read: 12, label: '12 and 8' } };
  var PASSAGE_MIN = 20;

  var S = null;          // live session (test) or attempt (review)
  var view = 'home';
  var reviewFilter = 'all';
  var hlMode = false;
  var pickMode = false;
  var savedRange = null;
  var tickCount = 0;

  /* ---------------- helpers ---------------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmt(sec) {
    sec = Math.max(0, Math.round(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }
  function prefs() {
    var p = Store.prefs();
    return {
      plan: PLANS[p.plan] ? p.plan : '10-10',
      scale: p.scale === 1.5 ? 1.5 : 1,
      proofFirst: p.proofFirst !== false,
      theme: p.theme === 'light' ? 'light' : 'dark'
    };
  }
  function passage(pid) { return BANK.passages[pid]; }
  function cur() { return S.order[S.qi]; }
  function curPid() { return cur().pid; }
  function curQ() { return QMAP[cur().qid].q; }
  function svgStrike() {
    return '<svg viewBox="0 0 20 20" aria-hidden="true"><text x="10" y="14" text-anchor="middle" font-size="11" font-family="Georgia,serif" fill="currentColor">abc</text><line x1="2" y1="10.5" x2="18" y2="10.5" stroke="currentColor" stroke-width="1.6"/></svg>';
  }
  function setKick(t) { var k = document.getElementById('topKick'); if (k) k.textContent = t; }
  function go(hash) { if (location.hash !== hash) history.replaceState(null, '', hash); }

  /* ---------------- session lifecycle ---------------- */
  function newSession(mode, passageIds, sectionId) {
    var P = prefs();
    var order = [];
    passageIds.forEach(function (pid) {
      passage(pid).questions.forEach(function (q) { order.push({ pid: pid, qid: q.id }); });
    });
    return {
      id: Store.uid(), mode: mode, sectionId: sectionId || null, passageIds: passageIds.slice(),
      order: order, qi: 0, startedAt: Date.now(), finishedAt: null,
      scale: P.scale, plan: P.plan, read: PLANS[P.plan].read,
      limit: mode === 'section' ? Math.round(60 * 60 * P.scale) : null,
      elapsed: 0, pTime: {}, qTime: {}, answers: {}, flags: {}, strikes: {}, hl: {}, mine: {}, cue: {},
      proofFirst: mode === 'passage' && P.proofFirst, revealed: {}, done: false
    };
  }

  function start(mode, id) {
    var ids = mode === 'section'
      ? BANK.sections.filter(function (s) { return s.id === id; })[0].passages
      : [id];
    S = newSession(mode, ids, mode === 'section' ? id : null);
    Store.saveActive(S);
    hlMode = false; syncPick();
    renderTest();
  }

  function resume() {
    var a = Store.active();
    if (!a) return renderHome();
    S = a; hlMode = false; syncPick();
    renderTest();
  }

  function score(sess) {
    var byType = {}, byPassage = {}, correct = 0;
    sess.order.forEach(function (o) {
      var q = QMAP[o.qid].q;
      var ok = sess.answers[o.qid] === q.key;
      if (ok) correct++;
      byType[q.type] = byType[q.type] || [0, 0];
      byType[q.type][1]++;
      if (ok) byType[q.type][0]++;
      byPassage[o.pid] = byPassage[o.pid] || [0, 0, sess.pTime[o.pid] || 0];
      byPassage[o.pid][1]++;
      if (ok) byPassage[o.pid][0]++;
    });
    return { correct: correct, total: sess.order.length, byType: byType, byPassage: byPassage };
  }

  function finish(reason) {
    if (!S || S.done) return;
    S.done = true;
    S.finishedAt = Date.now();
    S.endReason = reason || 'submitted';
    S.results = score(S);
    Store.saveAttempt(S);
    Store.clearActive();
    hlMode = false; pickMode = false;
    renderResults(S);
  }

  /* ---------------- timer ---------------- */
  setInterval(function () {
    if (view !== 'test' || !S || S.done || document.hidden) return;
    var pid = curPid(), qid = cur().qid;
    S.elapsed++;
    S.pTime[pid] = (S.pTime[pid] || 0) + 1;
    S.qTime[qid] = (S.qTime[qid] || 0) + 1;
    if (++tickCount % 5 === 0) Store.saveActive(S);
    updateClock();
    checkCue(pid);
    if (S.limit && S.elapsed >= S.limit) timeUp();
  }, 1000);

  function checkCue(pid) {
    var t = S.pTime[pid] || 0;
    var readSec = S.read * 60 * S.scale;
    var fullSec = PASSAGE_MIN * 60 * S.scale;
    var last = S.passageIds.indexOf(pid) === S.passageIds.length - 1;
    if (t >= readSec && !S.cue[pid]) { S.cue[pid] = 1; renderCue(); }
    else if (S.mode === 'section' && !last && t >= fullSec && S.cue[pid] === 1) { S.cue[pid] = 2; renderCue(); }
  }

  function cueText(pid) {
    var stage = S.cue[pid];
    if (!stage || S.cueDismissed === pid + ':' + stage) return '';
    var words = { 10: 'Ten', 12: 'Twelve' }[S.read] || String(S.read);
    if (stage === 1) return words + ' minutes on this passage. Time to switch to the questions: find each answer\'s line, then choose.';
    var i = S.passageIds.indexOf(pid);
    return 'Twenty minutes on this passage. Passage ' + (i + 2) + ' is ready when you are; flagged questions will wait for you.';
  }

  function renderCue() {
    var box = document.getElementById('cueBox');
    if (!box) return;
    var t = cueText(curPid());
    box.innerHTML = t ? '<div class="cue" role="status"><p>' + esc(t) + '</p><button class="btn small" type="button" data-act="cue-ok">Got it</button></div>' : '';
  }

  function updateClock() {
    var c = document.getElementById('clock');
    if (!c) return;
    var pid = curPid();
    if (S.limit) c.innerHTML = fmt(S.limit - S.elapsed) + '<small>left</small>';
    else c.innerHTML = fmt(S.elapsed) + '<small>elapsed</small>';
    var t = S.pTime[pid] || 0;
    var full = PASSAGE_MIN * 60 * S.scale, read = S.read * 60 * S.scale;
    var fill = document.getElementById('paceFill');
    if (fill) {
      fill.style.width = Math.min(100, (t / full) * 100) + '%';
      fill.classList.toggle('q', t >= read);
    }
    var pl = document.getElementById('paceNow');
    if (pl) pl.textContent = 'This passage ' + fmt(t);
  }

  function timeUp() {
    finish('time');
    overlay('<h3>Time</h3><p>The 60 minutes are up and every answer you chose is saved. Your results and the full review are below.</p>',
      [{ label: 'See results', act: 'ov-close', primary: true }]);
  }

  /* ---------------- home ---------------- */
  function renderHome() {
    view = 'home';
    go('#home');
    setKick('Reading Comprehension');
    if (!BANK) { app.innerHTML = '<div class="wrap"><p>The passage bank did not load.</p></div>'; return; }
    var P = prefs();
    var attempts = Store.attempts();
    var active = Store.active();
    var best = {};
    attempts.forEach(function (a) {
      var k = a.mode === 'section' ? 's:' + a.sectionId : 'p:' + a.passageIds[0];
      var r = a.results;
      if (!best[k] || r.correct / r.total > best[k].correct / best[k].total) best[k] = r;
    });

    var h = '<div class="wrap">';
    h += '<section class="hero"><div class="rail" style="margin-top:0"><span class="kick">DAT Reading Comprehension</span><span class="line"></span></div>';
    h += '<h1>Read once. Find the line. <em>Then</em> choose.</h1>';
    h += '<p class="lede">Three science passages, about fifty questions, sixty minutes. Every answer is on the page; your job is to find the sentence that settles it.</p>';
    h += '<div class="method">'
      + step('20 minutes', 'One passage, one block', 'Sixty minutes, three passages. Each passage gets its own twenty.')
      + step('10 and 10', 'Read and flag, then search', 'Ten minutes reading and highlighting topic lines, lists, numbers. Ten on the questions.')
      + step('Proof line', 'Before the choices', 'Find the sentence that answers it, say the answer yourself, then match a choice.')
      + step('Organic days', 'Where timed passages go', 'Your timed passage lives on your organic chemistry days in the weekly plan.')
      + '</div></section>';

    if (active && !active.done) {
      var ai = active.passageIds.length;
      h += '<div class="resume"><p><b>Pick up where you left off.</b> ' + (active.mode === 'section' ? 'Full section, ' + ai + ' passages' : esc(passage(active.passageIds[0]).title))
        + ', ' + Object.keys(active.answers).length + ' of ' + active.order.length + ' answered.</p>'
        + '<button class="btn primary" type="button" data-act="resume">Resume</button>'
        + '<button class="btn" type="button" data-act="discard">Set it aside</button></div>';
    }

    h += '<div class="rail"><h2>Settings</h2><span class="line"></span></div>';
    h += '<div class="settings">'
      + '<span><span class="lab">Pace plan</span><span class="seg" role="group" aria-label="Pace plan">'
      + Object.keys(PLANS).map(function (k) { return '<button type="button" data-plan="' + k + '" class="' + (P.plan === k ? 'on' : '') + '">' + PLANS[k].label + '</button>'; }).join('')
      + '</span></span>'
      + '<span><span class="lab">Timing</span><span class="seg" role="group" aria-label="Timing">'
      + '<button type="button" data-scale="1" class="' + (P.scale === 1 ? 'on' : '') + '">Standard</button>'
      + '<button type="button" data-scale="1.5" class="' + (P.scale === 1.5 ? 'on' : '') + '">Time and a half</button>'
      + '</span></span>'
      + '<label class="check"><input type="checkbox" id="pfBox"' + (P.proofFirst ? ' checked' : '') + '> Proof line first in single passages</label>'
      + '</div>';

    h += '<div class="rail"><h2>Full timed sections</h2><span class="line"></span><span class="kick">3 passages, 60 min</span></div><div class="cards">';
    BANK.sections.forEach(function (s, i) {
      var n = s.passages.reduce(function (a, pid) { return a + passage(pid).questions.length; }, 0);
      var b = best['s:' + s.id];
      h += '<div class="card section"><div class="meta">Section ' + (i + 1) + ' &middot; <b>' + n + ' questions</b> &middot; ' + (60 * P.scale) + ' min</div>'
        + '<h3>' + esc(s.title) + '</h3><ol>' + s.passages.map(function (pid) { return '<li>' + esc(passage(pid).title) + '</li>'; }).join('') + '</ol>'
        + '<div class="foot"><button class="btn primary" type="button" data-start="section" data-id="' + s.id + '">Start section</button>'
        + (b ? '<span class="score">Best ' + b.correct + ' of ' + b.total + '</span>' : '') + '</div></div>';
    });
    h += '</div>';

    h += '<div class="rail"><h2>Single passages</h2><span class="line"></span><span class="kick">' + BANK.order.length + ' passages, 20 min pace</span></div><div class="cards">';
    BANK.order.forEach(function (pid) {
      var p = passage(pid);
      var b = best['p:' + pid];
      h += '<div class="card"><div class="meta"><b>' + esc(p.field) + '</b> &middot; ' + p.words + ' words &middot; ' + p.questions.length + ' questions</div>'
        + '<h3>' + esc(p.title) + '</h3>'
        + '<div class="foot"><button class="btn" type="button" data-start="passage" data-id="' + pid + '">Practice passage</button>'
        + (b ? '<span class="score">Best ' + b.correct + ' of ' + b.total + '</span>' : '') + '</div></div>';
    });
    h += '</div>';

    h += '<div class="rail"><h2>Your question types</h2><span class="line"></span></div>';
    var agg = {};
    attempts.forEach(function (a) {
      Object.keys(a.results.byType).forEach(function (t) {
        agg[t] = agg[t] || [0, 0];
        agg[t][0] += a.results.byType[t][0]; agg[t][1] += a.results.byType[t][1];
      });
    });
    if (!attempts.length) h += '<p class="empty">Finish a passage or a section and your results by question type collect here.</p>';
    else h += typeGrid(agg);

    h += '<div class="rail"><h2>History</h2><span class="line"></span></div>';
    if (!attempts.length) h += '<p class="empty">Nothing yet. A single passage is a good first step.</p>';
    else {
      h += '<table class="hist"><thead><tr><th>Date</th><th>What</th><th>Correct</th><th>Time</th><th></th></tr></thead><tbody>';
      attempts.slice(0, 15).forEach(function (a) {
        var what = a.mode === 'section' ? (sectionTitle(a.sectionId)) : passage(a.passageIds[0]).title;
        h += '<tr><td>' + new Date(a.finishedAt).toLocaleDateString() + '</td><td>' + esc(what) + '</td><td>' + a.results.correct + ' / ' + a.results.total
          + '</td><td>' + fmt(a.elapsed) + '</td><td><button class="btn small" type="button" data-results="' + a.id + '">Open</button></td></tr>';
      });
      h += '</tbody></table>';
    }
    h += '<p class="foot-note">Progress is saved in this browser for now. Passages are written for AceTheDAT; every answer is tied to a line in its passage.</p>';
    h += '</div>';
    app.innerHTML = h;
    window.scrollTo(0, 0);

    function step(n, b, s) { return '<div class="step"><div class="n">' + n + '</div><b>' + b + '</b><span>' + s + '</span></div>'; }
  }

  function sectionTitle(id) {
    var i = -1;
    BANK.sections.forEach(function (s, j) { if (s.id === id) i = j; });
    return i >= 0 ? 'Section ' + (i + 1) + ': ' + BANK.sections[i].title : 'Full section';
  }

  function typeGrid(byType) {
    var h = '<div class="typegrid">';
    Object.keys(TYPES).forEach(function (t) {
      var v = byType[t];
      var pct = v && v[1] ? Math.round((v[0] / v[1]) * 100) : 0;
      h += '<div class="typerow"><div class="t"><span>' + esc(TYPES[t]) + '</span><span>' + (v ? v[0] + ' / ' + v[1] : 'none yet') + '</span></div>'
        + '<div class="meter"><i style="width:' + pct + '%"></i></div></div>';
    });
    return h + '</div>';
  }

  /* ---------------- passage rendering ---------------- */
  function sentenceHtml(pid, pi, si, text, opt) {
    var key = pi + '-' + si;
    var hls = (S.hl[pid] && S.hl[pid][key]) || [];
    var quote = opt.quote ? text.indexOf(opt.quote) : -1;
    var qa = quote, qb = quote >= 0 ? quote + opt.quote.length : -1;
    var pts = [0, text.length];
    hls.forEach(function (r) { pts.push(r[0], r[1]); });
    if (quote >= 0) pts.push(qa, qb);
    pts = pts.filter(function (x, i, a) { return x >= 0 && x <= text.length && a.indexOf(x) === i; }).sort(function (a, b) { return a - b; });
    var out = '';
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1];
      if (a === b) continue;
      var seg = esc(text.slice(a, b));
      if (quote >= 0 && a >= qa && b <= qb) seg = '<mark class="quote">' + seg + '</mark>';
      for (var j = 0; j < hls.length; j++) {
        if (a >= hls[j][0] && b <= hls[j][1]) { seg = '<mark class="hl" data-k="' + key + '" data-j="' + j + '">' + seg + '</mark>'; break; }
      }
      out += seg;
    }
    var cls = 'sent' + (opt.proof ? ' proof' : '') + (opt.mine ? ' mine' : '') + (opt.pick ? ' pick' : '');
    var tag = opt.tags && opt.tags.length ? opt.tags.map(function (t) { return '<span class="ptag">' + t + '</span>'; }).join('') : '';
    return '<span class="' + cls + '" data-p="' + pi + '" data-s="' + si + '">' + tag + out + '</span>';
  }

  function passageHtml(pid, review) {
    var p = passage(pid);
    var q = curQ();
    var proofMap = {};
    if (review) {
      q.proof.forEach(function (pr) {
        var k = pr.paragraph + '-' + pr.sentence;
        proofMap[k] = proofMap[k] || { quote: pr.quote, tags: [] };
        if (pr.choice !== undefined && q.type === 'except') proofMap[k].tags.push(LET[pr.choice]);
      });
    }
    var mine = S.mine[q.id];
    var h = '<h2>' + esc(p.title) + '</h2><div class="pmeta">' + esc(p.field) + ' &middot; ' + p.words + ' words</div>';
    p.paragraphs.forEach(function (para, i) {
      var pi = i + 1;
      h += '<div class="para"><span class="pn">' + pi + '</span><p>';
      h += para.map(function (s, j) {
        var si = j + 1, k = pi + '-' + si;
        var pm = proofMap[k];
        return sentenceHtml(pid, pi, si, s, {
          proof: !!pm, quote: pm && pm.quote, tags: pm && pm.tags,
          mine: mine && mine.p === pi && mine.s === si, pick: pickMode && !review
        });
      }).join(' ');
      h += '</p></div>';
    });
    return h;
  }

  function scrollToProof() {
    var pane = document.getElementById('passagePane');
    var el = pane && pane.querySelector('.sent.proof');
    if (!el) return;
    var top = el.getBoundingClientRect().top - pane.getBoundingClientRect().top + pane.scrollTop - 60;
    pane.scrollTop = Math.max(0, top);
  }

  /* ---------------- test + review view ---------------- */
  function renderTest() {
    view = S.done ? 'review' : 'test';
    var review = S.done;
    go(review ? '#review/' + S.id : '#test');
    setKick(review ? 'Review' : (S.mode === 'section' ? 'Timed section' : 'Single passage'));
    var pid = curPid();
    var pIdx = S.passageIds.indexOf(pid);
    var P = passage(pid);
    var full = PASSAGE_MIN * 60 * S.scale, read = S.read * 60 * S.scale;

    var h = '<div class="rc-test' + (review ? ' review' : '') + '">';
    h += '<div class="rc-bar">';
    h += '<div class="where"><div class="k">' + (S.mode === 'section' ? 'Passage ' + (pIdx + 1) + ' of ' + S.passageIds.length : 'Single passage') + (review ? ' &middot; review' : '') + '</div><div class="ti">' + esc(P.title) + '</div></div>';
    if (!review) {
      h += '<div class="pace" aria-label="Pace for this passage"><div class="lbl"><span id="paceNow">This passage ' + fmt(S.pTime[pid] || 0) + '</span><span>' + PLANS[S.plan].label + ', ' + (PASSAGE_MIN * S.scale) + ' min</span></div>'
        + '<div class="track"><div class="read" style="width:' + (read / full * 100) + '%"></div><div class="fill" id="paceFill" style="width:0"></div>'
        + '<div class="tick" style="left:calc(' + (read / full * 100) + '% - 1px)"><span>questions</span></div></div></div>';
      h += '<span class="clock" id="clock"></span>';
    }
    h += '<div class="tools">';
    if (!review) {
      h += '<button class="btn small' + (hlMode ? ' on' : '') + '" type="button" data-act="hl" aria-pressed="' + hlMode + '" title="Select text, then press Highlight. With it on, tap a highlight to remove it.">Highlight</button>';
      h += '<button class="btn small" type="button" data-act="hl-clear">Clear</button>';
      if (S.mode === 'section' && pIdx < S.passageIds.length - 1) h += '<button class="btn small" type="button" data-act="next-passage">Next passage</button>';
      h += '<button class="btn small primary" type="button" data-act="end">End and review</button>';
    } else {
      h += '<span class="seg" role="group" aria-label="Show">'
        + ['all', 'missed', 'flagged'].map(function (f) { return '<button type="button" data-filter="' + f + '" class="' + (reviewFilter === f ? 'on' : '') + '">' + f[0].toUpperCase() + f.slice(1) + '</button>'; }).join('')
        + '</span>';
      h += '<button class="btn small" type="button" data-results="' + S.id + '">Results</button>';
    }
    h += '</div></div>';

    h += '<div class="rc-split">';
    h += '<section class="rc-passage' + (hlMode ? ' hl-on' : '') + '" id="passagePane" aria-label="Passage">' + passageHtml(pid, review) + '</section>';
    h += '<section class="rc-qpane" id="qPane" aria-label="Question">' + questionHtml(review) + '</section>';
    h += '</div></div>';

    var keepScroll = document.getElementById('passagePane');
    var prevPid = keepScroll && keepScroll.getAttribute('data-pid');
    var prevTop = keepScroll ? keepScroll.scrollTop : 0;
    app.innerHTML = h;
    var pane = document.getElementById('passagePane');
    pane.setAttribute('data-pid', pid);
    if (review) scrollToProof();
    else if (prevPid === pid) pane.scrollTop = prevTop;
    if (!review) { updateClock(); renderCue(); }
  }

  function questionHtml(review) {
    var o = cur(), q = curQ(), pid = o.pid;
    var local = QMAP[q.id].n + 1;
    var chosen = S.answers[q.id];
    var struck = S.strikes[q.id] || [];
    var h = review ? '' : '<div id="cueBox"></div>';
    h += '<div class="qhead"><span class="qnum">Question ' + (S.qi + 1) + ' of ' + S.order.length + '</span>';
    if (review) h += '<span class="chip gold">' + esc(TYPES[q.type]) + '</span>';
    if (S.flags[q.id]) h += '<span class="chip">Flagged</span>';
    h += '</div>';
    h += '<p class="stem">' + esc(q.stem) + '</p>';

    var covered = !review && S.proofFirst && !S.revealed[q.id] && chosen === undefined;
    if (covered) {
      h += '<div class="cover"><p><b>Proof line first.</b> Find the sentence in the passage that answers this, and tap it. Say the answer in your own words, then the choices open.</p>'
        + '<button class="btn small" type="button" data-act="reveal">Show the choices now</button></div>';
    } else {
      h += '<div class="choices" role="radiogroup" aria-label="Answer choices">';
      q.choices.forEach(function (c, i) {
        var cls = 'choice';
        if (review) {
          if (i === q.key) cls += ' key';
          else if (i === chosen) cls += ' wrong';
        } else {
          if (i === chosen) cls += ' sel';
          if (struck.indexOf(i) >= 0) cls += ' struck';
        }
        h += '<div class="' + cls + '" role="radio" tabindex="0" aria-checked="' + (i === chosen) + '" data-choice="' + i + '">'
          + '<span class="L">' + LET[i] + '</span><span class="tx">' + esc(c) + '</span>';
        if (!review) h += '<button class="strike" type="button" data-strike="' + i + '" aria-label="Cross out ' + LET[i] + '" title="Cross out">' + svgStrike() + '</button>';
        else h += '<span></span>';
        if (review) {
          var note = i === q.key ? '<b>Answer.</b>' + (i === chosen ? ' Your choice.' : '') : (i === chosen ? '<b>Your choice.</b> ' : '') + esc(q.distractorNotes[i]);
          h += '<div class="note">' + note + '</div>';
        }
        h += '</div>';
      });
      h += '</div>';
    }

    if (review) {
      var lines = q.proof.map(function (pr) { return 'P' + pr.paragraph + ' S' + pr.sentence; });
      h += '<div class="why"><div class="k">' + (chosen === undefined ? 'Not answered' : chosen === q.key ? 'Correct' : 'Worth another look') + ' &middot; proof line ' + lines.join(', ') + '</div><p>' + esc(q.why) + '</p></div>';
      var mine = S.mine[q.id];
      if (mine) {
        var hit = q.proof.some(function (pr) { return pr.paragraph === mine.p && pr.sentence === mine.s; });
        h += '<p class="yourline">' + (hit ? 'The line you marked, P' + mine.p + ' S' + mine.s + ', is the proof line.' : 'You marked P' + mine.p + ' S' + mine.s + ' (dashed). The line that settles it is highlighted in gold.') + '</p>';
      }
      h += '<p class="yourline">Time on this question: ' + fmt(S.qTime[q.id] || 0) + '</p>';
    }

    h += '<div class="qnav">'
      + '<button class="btn" type="button" data-act="prev"' + (navIndex(-1) < 0 ? ' disabled' : '') + '>Previous</button>'
      + '<button class="btn" type="button" data-act="next"' + (navIndex(1) < 0 ? ' disabled' : '') + '>Next</button>';
    if (!review) {
      h += '<button class="btn' + (S.flags[q.id] ? ' on' : '') + '" type="button" data-act="flag" aria-pressed="' + !!S.flags[q.id] + '">Flag</button>';
      h += '<button class="btn ghost' + (pickMode ? ' on' : '') + '" type="button" data-act="pick">' + (S.mine[q.id] ? 'Proof line marked' : 'Mark my proof line') + '</button>';
    }
    h += '</div>';

    h += '<div class="grid" aria-label="Question map">';
    S.passageIds.forEach(function (ppid, pi) {
      if (S.passageIds.length > 1) h += '<div class="gl">Passage ' + (pi + 1) + '</div>';
      S.order.forEach(function (oo, i) {
        if (oo.pid !== ppid) return;
        var qq = QMAP[oo.qid].q;
        var c = 'cell';
        if (i === S.qi) c += ' cur';
        if (review) c += S.answers[oo.qid] === qq.key ? ' ok' : ' no';
        else if (S.answers[oo.qid] !== undefined) c += ' ans';
        if (S.flags[oo.qid]) c += ' flag';
        var hidden = review && !passesFilter(i);
        h += '<button class="' + c + '" type="button" data-q="' + i + '"' + (hidden ? ' disabled style="opacity:.25"' : '') + ' aria-label="Question ' + (i + 1) + '">' + (i + 1) + '</button>';
      });
    });
    h += '</div>';
    return h;
  }

  function passesFilter(i) {
    if (view !== 'review' || reviewFilter === 'all') return true;
    var o = S.order[i], q = QMAP[o.qid].q;
    if (reviewFilter === 'missed') return S.answers[o.qid] !== q.key;
    return !!S.flags[o.qid];
  }
  function navIndex(dir) {
    for (var i = S.qi + dir; i >= 0 && i < S.order.length; i += dir) if (passesFilter(i)) return i;
    return -1;
  }
  function syncPick() {
    pickMode = !S.done && S.proofFirst && !S.revealed[cur().qid] && S.answers[cur().qid] === undefined;
  }
  function goQ(i) {
    if (i < 0 || i >= S.order.length) return;
    S.qi = i;
    syncPick();
    if (!S.done) Store.saveActive(S);
    renderTest();
  }

  /* ---------------- highlighter ---------------- */
  function offsetIn(sentEl, node, offset) {
    var r = document.createRange();
    r.selectNodeContents(sentEl);
    try { r.setEnd(node, offset); } catch (e) { return 0; }
    return r.toString().length;
  }
  function applySelection(range) {
    if (!range || range.collapsed) return false;
    var pane = document.getElementById('passagePane');
    if (!pane || !pane.contains(range.commonAncestorContainer)) return false;
    var pid = curPid();
    var any = false;
    S.hl[pid] = S.hl[pid] || {};
    pane.querySelectorAll('.sent').forEach(function (el) {
      if (!range.intersectsNode(el)) return;
      var len = el.textContent.length;
      var a = el.contains(range.startContainer) ? offsetIn(el, range.startContainer, range.startOffset) : 0;
      var b = el.contains(range.endContainer) ? offsetIn(el, range.endContainer, range.endOffset) : len;
      a = Math.max(0, Math.min(a, len)); b = Math.max(0, Math.min(b, len));
      if (b - a < 1) return;
      var key = el.getAttribute('data-p') + '-' + el.getAttribute('data-s');
      var list = (S.hl[pid][key] || []).concat([[a, b]]).sort(function (x, y) { return x[0] - y[0]; });
      var merged = [];
      list.forEach(function (r) {
        var last = merged[merged.length - 1];
        if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]); else merged.push([r[0], r[1]]);
      });
      S.hl[pid][key] = merged;
      any = true;
    });
    if (any) {
      try { window.getSelection().removeAllRanges(); } catch (e) { /* ignore */ }
      savedRange = null;
      Store.saveActive(S);
      rerenderPassage();
    }
    return any;
  }
  function rerenderPassage() {
    var pane = document.getElementById('passagePane');
    if (!pane) return;
    var top = pane.scrollTop;
    pane.innerHTML = passageHtml(curPid(), S.done);
    pane.classList.toggle('hl-on', hlMode);
    pane.scrollTop = top;
  }
  document.addEventListener('selectionchange', function () {
    if (view !== 'test') return;
    var sel = window.getSelection();
    if (!sel || !sel.rangeCount || sel.isCollapsed) return;
    var r = sel.getRangeAt(0);
    var pane = document.getElementById('passagePane');
    if (pane && pane.contains(r.commonAncestorContainer)) savedRange = r.cloneRange();
  });
  document.addEventListener('mouseup', function (e) {
    if (view !== 'test' || !hlMode) return;
    var pane = document.getElementById('passagePane');
    if (!pane || !pane.contains(e.target)) return;
    var sel = window.getSelection();
    if (sel && sel.rangeCount && !sel.isCollapsed) applySelection(sel.getRangeAt(0));
  });

  /* ---------------- overlay ---------------- */
  function overlay(html, buttons) {
    closeOverlay();
    var d = document.createElement('div');
    d.className = 'ov';
    d.id = 'ov';
    d.setAttribute('role', 'dialog');
    d.setAttribute('aria-modal', 'true');
    d.innerHTML = '<div class="box">' + html + '<div class="row">' + buttons.map(function (b) {
      return '<button class="btn' + (b.primary ? ' primary' : '') + '" type="button" data-act="' + b.act + '">' + esc(b.label) + '</button>';
    }).join('') + '</div></div>';
    document.body.appendChild(d);
    var f = d.querySelector('.btn.primary') || d.querySelector('.btn');
    if (f) f.focus();
  }
  function closeOverlay() { var o = document.getElementById('ov'); if (o) o.remove(); }

  function confirmEnd() {
    var un = S.order.filter(function (o) { return S.answers[o.qid] === undefined; }).length;
    var fl = S.order.filter(function (o) { return S.flags[o.qid]; }).length;
    var body = '<h3>End and review?</h3><p>' + (S.order.length - un) + ' of ' + S.order.length + ' answered'
      + (fl ? ', ' + fl + ' flagged' : '') + '.' + (un ? ' A blank counts the same as a wrong answer, so a best guess is worth it.' : '') + '</p>';
    overlay(body, [{ label: 'Keep working', act: 'ov-close' }, { label: 'Submit', act: 'submit', primary: true }]);
  }

  /* ---------------- results ---------------- */
  function renderResults(att) {
    S = att;
    view = 'results';
    go('#results/' + att.id);
    setKick('Results');
    var r = att.results;
    var h = '<div class="wrap">';
    h += '<div class="rail" style="margin-top:0"><span class="kick">' + (att.mode === 'section' ? esc(sectionTitle(att.sectionId)) : 'Single passage') + '</span><span class="line"></span></div>';
    h += '<h1 style="font-family:var(--serif);margin:4px 0 0;font-size:clamp(26px,5vw,38px)">' + r.correct + ' of ' + r.total + ' correct</h1>';
    h += '<div class="stats">'
      + stat('Time used', fmt(att.elapsed), att.limit ? 'of ' + fmt(att.limit) : 'single passage')
      + stat('Per question', fmt(att.elapsed / r.total), 'average')
      + stat('Answered', String(Object.keys(att.answers).length), 'of ' + r.total)
      + stat('Flagged', String(Object.keys(att.flags).filter(function (k) { return att.flags[k]; }).length), 'to revisit in review')
      + '</div>';
    h += '<div class="rail"><h2>By passage</h2><span class="line"></span><span class="kick">plan: ' + (PASSAGE_MIN * att.scale) + ' min each</span></div><div class="ptime">';
    att.passageIds.forEach(function (pid, i) {
      var v = r.byPassage[pid];
      var full = PASSAGE_MIN * 60 * att.scale;
      var w = Math.min(100, (v[2] / (full * 1.5)) * 100);
      h += '<div class="row"><div class="top"><span><b>' + (att.passageIds.length > 1 ? 'Passage ' + (i + 1) + ': ' : '') + '</b>' + esc(passage(pid).title) + '</span>'
        + '<span>' + v[0] + ' / ' + v[1] + ' &middot; ' + fmt(v[2]) + ' of a ' + fmt(full) + ' plan</span></div>'
        + '<div class="bar"><i style="width:' + w + '%"></i><span class="t" style="left:' + (100 / 1.5) + '%"></span></div></div>';
    });
    h += '</div>';
    h += '<div class="rail"><h2>By question type</h2><span class="line"></span></div>' + typeGrid(r.byType);
    h += '<div class="rail"><h2>Review</h2><span class="line"></span></div>';
    h += '<p style="color:var(--ink-2);margin:0 0 12px">Every question shows its proof line in the passage, the type, and why each other choice falls short.</p>';
    h += '<div class="qnav"><button class="btn primary" type="button" data-review="all">Review all</button>'
      + '<button class="btn" type="button" data-review="missed">Review missed</button>'
      + '<button class="btn" type="button" data-review="flagged">Review flagged</button>'
      + '<button class="btn" type="button" data-act="home">Back to Reading</button></div>';
    h += '</div>';
    app.innerHTML = h;
    window.scrollTo(0, 0);
    function stat(k, v, s) { return '<div class="stat"><div class="k">' + k + '</div><div class="v">' + v + '</div><div class="s">' + s + '</div></div>'; }
  }

  function openReview(att, filter) {
    S = att;
    reviewFilter = filter || 'all';
    var first = 0;
    view = 'review';
    for (var i = 0; i < S.order.length; i++) if (passesFilter(i)) { first = i; break; }
    S.qi = first;
    renderTest();
  }

  /* ---------------- events ---------------- */
  app.addEventListener('click', function (e) {
    var t = e.target.closest('button, [data-choice], .sent, mark.hl');
    if (!t) return;
    var d = t.dataset;

    if (t.matches('mark.hl') && hlMode && view === 'test') {
      var pid = curPid();
      var list = S.hl[pid][d.k];
      list.splice(Number(d.j), 1);
      Store.saveActive(S);
      rerenderPassage();
      return;
    }
    if (t.matches('.sent')) {
      if (view === 'test' && pickMode) {
        var sel = window.getSelection();
        if (sel && !sel.isCollapsed) return;
        S.mine[cur().qid] = { p: Number(d.p), s: Number(d.s) };
        S.revealed[cur().qid] = true;
        pickMode = false;
        Store.saveActive(S);
        renderTest();
      }
      return;
    }
    if (d.strike !== undefined && view === 'test') {
      e.stopPropagation();
      var qid = cur().qid, i = Number(d.strike);
      var st = S.strikes[qid] = S.strikes[qid] || [];
      var at = st.indexOf(i);
      if (at >= 0) st.splice(at, 1); else st.push(i);
      Store.saveActive(S);
      document.getElementById('qPane').innerHTML = questionHtml(false); renderCue();
      return;
    }
    if (d.choice !== undefined && view === 'test') {
      if (e.altKey) { var s2 = S.strikes[cur().qid] = S.strikes[cur().qid] || []; var k2 = Number(d.choice); var at2 = s2.indexOf(k2); if (at2 >= 0) s2.splice(at2, 1); else s2.push(k2); }
      else S.answers[cur().qid] = Number(d.choice);
      Store.saveActive(S);
      document.getElementById('qPane').innerHTML = questionHtml(false); renderCue();
      return;
    }
    if (d.start) return start(d.start, d.id);
    if (d.plan) { Store.setPrefs({ plan: d.plan }); return renderHome(); }
    if (d.scale) { Store.setPrefs({ scale: Number(d.scale) }); return renderHome(); }
    if (d.q !== undefined) return goQ(Number(d.q));
    if (d.results) { var a = Store.attempt(d.results); if (a) renderResults(a); return; }
    if (d.review) { var att = Store.attempt(S.id) || S; return openReview(att, d.review); }
    if (d.filter) { reviewFilter = d.filter; var n = passesFilter(S.qi) ? S.qi : navIndex(1) >= 0 ? navIndex(1) : navIndex(-1); if (n >= 0) S.qi = n; return renderTest(); }

    switch (d.act) {
      case 'resume': return resume();
      case 'discard': Store.clearActive(); return renderHome();
      case 'home': return renderHome();
      case 'prev': return goQ(navIndex(-1));
      case 'next': return goQ(navIndex(1));
      case 'flag': S.flags[cur().qid] = !S.flags[cur().qid]; Store.saveActive(S); document.getElementById('qPane').innerHTML = questionHtml(false); renderCue(); return;
      case 'pick': pickMode = !pickMode; return renderTest();
      case 'reveal': S.revealed[cur().qid] = true; pickMode = false; Store.saveActive(S); return renderTest();
      case 'cue-ok': S.cueDismissed = curPid() + ':' + S.cue[curPid()]; renderCue(); return;
      case 'hl':
        if (savedRange && applySelection(savedRange)) return;
        hlMode = !hlMode;
        return renderTest();
      case 'hl-clear': S.hl[curPid()] = {}; Store.saveActive(S); return rerenderPassage();
      case 'next-passage': {
        var nextPid = S.passageIds[S.passageIds.indexOf(curPid()) + 1];
        for (var j = 0; j < S.order.length; j++) if (S.order[j].pid === nextPid) return goQ(j);
        return;
      }
      case 'end': return confirmEnd();
    }
  });
  app.addEventListener('mousedown', function (e) {
    /* keep the passage selection alive when a toolbar button is pressed */
    if (e.target.closest('[data-act="hl"]')) e.preventDefault();
  });
  app.addEventListener('change', function (e) {
    if (e.target.id === 'pfBox') Store.setPrefs({ proofFirst: e.target.checked });
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('#ov [data-act]');
    if (!b) return;
    if (b.dataset.act === 'ov-close') closeOverlay();
    if (b.dataset.act === 'submit') { closeOverlay(); finish('submitted'); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.target.closest && e.target.closest('input, textarea')) return;
    if (document.getElementById('ov')) { if (e.key === 'Escape') closeOverlay(); return; }
    if (view !== 'test' && view !== 'review') return;
    if (e.metaKey || e.ctrlKey) return;
    var k = e.key.toLowerCase();
    if (view === 'test' && 'abcde'.indexOf(k) >= 0 && k.length === 1) {
      if (S.proofFirst && !S.revealed[cur().qid] && S.answers[cur().qid] === undefined) return;
      S.answers[cur().qid] = 'abcde'.indexOf(k); Store.saveActive(S);
      document.getElementById('qPane').innerHTML = questionHtml(false); renderCue();
    } else if (k === 'arrowright' || k === 'n') { var n = navIndex(1); if (n >= 0) goQ(n); }
    else if (k === 'arrowleft' || k === 'p') { var p = navIndex(-1); if (p >= 0) goQ(p); }
    else if (k === 'f' && view === 'test') { S.flags[cur().qid] = !S.flags[cur().qid]; Store.saveActive(S); document.getElementById('qPane').innerHTML = questionHtml(false); renderCue(); }
    else if (k === 'enter' && e.target.matches && e.target.matches('[data-choice]')) e.target.click();
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden && view === 'test' && S) Store.saveActive(S); });
  window.addEventListener('pagehide', function () { if (view === 'test' && S) Store.saveActive(S); });

  var themeBtn = document.getElementById('themeBtn');
  function paintTheme() {
    var t = prefs().theme;
    document.documentElement.setAttribute('data-theme', t);
    themeBtn.textContent = t === 'light' ? 'Dark page' : 'Light page';
  }
  themeBtn.addEventListener('click', function () {
    Store.setPrefs({ theme: prefs().theme === 'light' ? 'dark' : 'light' });
    paintTheme();
  });
  paintTheme();

  /* ---------------- boot + test hooks ---------------- */
  function boot() {
    var h = location.hash;
    var m;
    if (h === '#test' && Store.active()) return resume();
    if ((m = /^#review\/(.+)$/.exec(h)) && Store.attempt(m[1])) return openReview(Store.attempt(m[1]), 'all');
    if ((m = /^#results\/(.+)$/.exec(h)) && Store.attempt(m[1])) return renderResults(Store.attempt(m[1]));
    if ((m = /^#start\/(section|passage)\/(.+)$/.exec(h))) return start(m[1], m[2]);
    renderHome();
  }

  window.AceRC = {
    state: function () { return S; },
    view: function () { return view; },
    start: start,
    answer: function (i) { S.answers[cur().qid] = i; S.revealed[cur().qid] = true; syncPick(); renderTest(); },
    go: goQ,
    finish: finish,
    review: function (filter) { openReview(Store.attempt(S.id) || S, filter); },
    tick: function (sec) { for (var i = 0; i < sec; i++) { var pid = curPid(); S.elapsed++; S.pTime[pid] = (S.pTime[pid] || 0) + 1; checkCue(pid); } updateClock(); },
    highlight: function (p, s, a, b) { var pid = curPid(); S.hl[pid] = S.hl[pid] || {}; (S.hl[pid][p + '-' + s] = S.hl[pid][p + '-' + s] || []).push([a, b]); rerenderPassage(); },
    home: renderHome
  };

  window.addEventListener('hashchange', function () { if (view !== 'test') boot(); });
  boot();
})();
