/* =====================================================================
   AceLoop (mock of shared/al-loop.js): the pieces every Call it first
   shares, whatever the section. Pages supply the content and a driver;
   this file owns the calls, the lock, the verdict, the card and Keep.

   Beats: Call -> Watch -> Drive -> Recall -> Card, shown to students as
   the band Predict, Play, Prove, Keep.
   Rules it enforces: one tap per call, Skip always there and recorded as
   "Shown without a call" (never a miss), no timer, no points, no
   confidence gate, verdict words Confirmed / Needs review only, the key
   tagged "Answer" and a different pick tagged "Your call".
   A miss makes its Ace Card automatically; a clean loop offers Keep it.
   ===================================================================== */
(function () {
  'use strict';
  var L = ['A', 'B', 'C', 'D', 'E'];

  function options(host, opts, onPick) {
    host.innerHTML = opts.map(function (o, i) {
      return '<button class="opt" type="button" aria-pressed="false" data-i="' + i + '"><span class="let">' + L[i] + '</span><span class="txt">' + o + '</span><span class="tag" hidden></span></button>';
    }).join('');
    Array.prototype.forEach.call(host.querySelectorAll('.opt'), function (b) {
      b.addEventListener('click', function () {
        if (host.dataset.locked) return;
        host.dataset.locked = '1';
        Array.prototype.forEach.call(host.querySelectorAll('.opt'), function (x) { x.setAttribute('aria-pressed', String(x === b)); x.disabled = true; });
        onPick(+b.getAttribute('data-i'));
      });
    });
  }
  /* hold: the call is made, the picture is playing */
  function hold(host, pick) {
    host.dataset.locked = '1';
    Array.prototype.forEach.call(host.querySelectorAll('.opt'), function (b, i) { b.disabled = true; b.setAttribute('aria-pressed', String(i === pick)); });
  }
  /* reveal: the key says Answer, a different pick says Your call */
  function reveal(host, pick, key) {
    Array.prototype.forEach.call(host.querySelectorAll('.opt'), function (b, i) {
      var tag = b.querySelector('.tag');
      b.disabled = true;
      b.setAttribute('aria-pressed', 'false');
      if (i === key) { b.classList.add('key'); tag.hidden = false; tag.textContent = i === pick ? 'Answer, your call' : 'Answer'; }
      else if (i === pick) { b.classList.add('mine'); tag.hidden = false; tag.textContent = 'Your call'; }
      else b.classList.add('dim');
    });
  }
  /* collapse: after the verdict the options fold to the two that matter */
  function collapse(host, pick, key) {
    Array.prototype.forEach.call(host.querySelectorAll('.opt'), function (b, i) { b.hidden = !(i === key || i === pick); });
  }

  function verdict(o) {
    if (o.skipped) {
      return '<div class="verdict plain reveal-in" role="status"><div class="vh">' + AL.icon('skipcall', 'sm') + 'Shown without a call</div>' +
        '<p>' + o.why + '</p>' + (o.hook ? '<p class="hook">' + o.hook + '</p>' : '') + '</div>';
    }
    return '<div class="verdict ' + (o.ok ? 'good' : 'trap') + ' reveal-in" role="status">' +
      '<div class="vh">' + AL.icon(o.ok ? 'good' : 'review', 'sm') + (o.ok ? 'Confirmed' : 'Needs review') + '</div>' +
      '<p>' + (o.callLine ? '<b>' + o.callLine + '</b>' : '<b>Your call: ' + o.callText + '.</b>') + (o.ok ? '' : ' ' + o.trap) + '</p>' +
      (o.ok || !o.keyText ? '' : '<p><b>' + (o.keyLead || 'The slide says') + ': ' + o.keyText + '.</b></p>') +
      (o.trapName && !o.ok ? '<span class="trapname">Trap: ' + o.trapName + '</span>' : '') +
      (o.why ? '<p>' + o.why + '</p>' : '') + (o.hook ? '<p class="hook">' + o.hook + '</p>' : '') + '</div>';
  }

  /* An Ace Card: the picture the student saw, the idea, the hook, the way back */
  function card(o) {
    return '<div class="acecard" data-sec="' + o.sec + '" id="' + (o.id || 'newCard') + '">' +
      '<div class="pic" aria-hidden="true">' + o.pic + '</div>' +
      '<div class="ac-k"><span>Ace Card / ' + o.where + '</span><span>' + (o.made || 'New') + '</span></div>' +
      '<div class="ac-t">' + o.idea + '</div>' +
      '<div class="ac-h">' + o.hook + '</div>' +
      '<div class="ac-when"><i class="on"></i><i></i><i></i>Back tomorrow, ' + AL.dayName(1) + '</div></div>';
  }

  /* Keep: the card flies to the Review door, the dot appears once, a toast
     says when it comes back, and anything listening updates (the ladder,
     the plan). Reduced motion: no flight, same toast. */
  function keep(cardEl, o) {
    o = o || {};
    AL.fly(cardEl, function () {
      AL.setDue(o.due || 1);
      AL.toast(o.toast || ('Card saved to Review. Back tomorrow, ' + AL.dayName(1) + '.'));
      if (o.done) o.done();
    });
  }

  /* Stuck? Three good moves, tuned per section (ANXIETY_AWARE_DESIGN.md).
     Never shown unprompted. */
  var STUCK = {
    bio: ['Feeling lost? Pick one.', [['Three quick recall cards', 'From Bio ideas you already hold.'], ['Step back to the hub overview', 'See where this sits in Cell and Molecular, and what is left.'], ['Move on for now', 'This one waits in Review, marked.']]],
    gchem: ['You have hit a wall. Pick one.', [['Three quick wins', 'From GChem skills you already hold.'], ['A 60-second breath', 'Four counts in, hold, out, hold. Then back.'], ['Move on for now', 'This one waits in Review, marked.']]],
    ochem: ['Stuck on a mechanism? Pick one.', [['Three quick wins', 'From reaction families you already hold.'], ['Open the Reaction Map', 'Look it up and keep moving.'], ['Move on for now', 'This one waits in Review, marked.']]],
    qr: ['You have hit a wall. Pick one.', [['Three quick wins', 'From QR skills you already hold.'], ['A 60-second breath', 'Four counts in, hold, out, hold. Then back.'], ['Move on for now', 'This one waits in Review, marked.']]],
    pat: ['Stuck on a figure? Pick one.', [['Three quick wins', 'From question types you already hold.'], ['Watch the method once', 'The fold, step by step, with no call.'], ['Move on for now', 'This one waits in Review, marked.']]],
    rc: ['Lost in the passage? Pick one.', [['Re-read the paragraph map', 'One line per paragraph, then back.'], ['Find the proof line first', 'Search before you study.'], ['Move on for now', 'This one waits in Review, marked.']]]
  };
  function stuck(sec, opener) {
    var s = STUCK[sec] || STUCK.bio;
    var back = document.createElement('div');
    back.className = 'sheet-back';
    back.innerHTML = '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="stuckH"><h2 id="stuckH">' + s[0] + '</h2><p>No need to explain. Any of these is a good move.</p>' +
      s[1].map(function (x) { return '<button class="so" type="button">' + x[0] + '<span>' + x[1] + '</span></button>'; }).join('') +
      '<button class="close" type="button">Back to where I was</button></div>';
    document.body.appendChild(back);
    var first = back.querySelector('.so'); first.focus();
    function close() { back.remove(); if (opener) opener.focus(); }
    back.addEventListener('click', function (e) { if (e.target === back || e.target.closest('.close') || e.target.closest('.so')) close(); });
    back.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  window.AceLoop = { options: options, hold: hold, reveal: reveal, collapse: collapse, verdict: verdict, card: card, keep: keep, stuck: stuck, LETTERS: L };
})();
