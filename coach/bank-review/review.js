/* review.js : Thomas's one-question-at-a-time review of the private banks (/coach/bank-review/).
   Talks to /.netlify/functions/ace-bank-review only. Credentials: the Ace Labs session the portal
   sign-in leaves in this browser (role master), or the review key kept for this tab only. */
(function () {
  'use strict';
  var FN = '/.netlify/functions/' + 'ace-bank-review';
  var L = 'ABCDE';
  var SECS = { bio: 'Biology', gc: 'Gen Chem', ochem: 'OChem', qr: 'QR', rc: 'Reading' };
  var STATUS = { open: 'Not reviewed', approve: 'Approved', fix: 'Fix requested', reject: 'Rejected', changed: 'Changed since approval' };
  var $ = function (id) { return document.getElementById(id); };
  var state = { sec: 'bio', list: [], pos: 0, item: null, cache: {}, busy: false };

  function session() { try { var s = JSON.parse(localStorage.getItem('ace.v1.session') || 'null'); return s && s.token && s.exp * 1000 > Date.now() ? s : null; } catch (e) { return null; } }
  function key() { try { return sessionStorage.getItem('ace.bankReviewKey') || ''; } catch (e) { return ''; } }
  function headers() {
    var h = { 'Content-Type': 'application/json' }, s = session(), k = key();
    if (s) h['X-Ace-Session'] = s.token;
    if (k) h['X-Ace-Review-Key'] = k;
    return h;
  }
  function call(q, body) {
    return fetch(FN + (q || ''), { method: body ? 'POST' : 'GET', headers: headers(), credentials: 'same-origin', body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j.http = r.status; return j; }); });
  }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }

  function gate(msg, showKey) {
    $('board').hidden = true; $('gate').hidden = false;
    if (msg) $('gateMsg').textContent = msg;
    $('keyForm').hidden = !showKey;
  }

  function load(sec) {
    state.sec = sec;
    Array.prototype.forEach.call($('tabs').children, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-sec') === sec)); });
    $('item').innerHTML = '<p class="br-msg">Loading the queue.</p>';
    return call('?section=' + sec).then(function (j) {
      if (j.http === 401) return gate('Sign in as the master coach (open Ace Labs from the portal), or paste the review key.', true);
      if (j.http === 403) return gate('This page is for the master coach only.', false);
      if (j.http === 503) return gate('The review is not switched on yet: it needs the Ace Labs sign-in on, or the reviewer key set in Netlify.', false);
      if (!j.ok) return gate('The queue did not load (' + (j.error || j.http) + '). Refresh to try again.', false);
      $('gate').hidden = true; $('board').hidden = false;
      state.list = j.items; state.counts = j.counts; state.seedSize = j.seedSize; state.seedDone = j.seedDone;
      stats(); forms(j.forms);
      state.pos = firstOpen(0);
      show();
    }, function () { gate('The queue did not load. Check the connection and refresh.', false); });
  }
  function visible() { return $('onlyOpen').checked ? state.list.filter(function (r) { return r.status === 'open' || r.status === 'changed'; }) : state.list; }
  function firstOpen() { return 0; }
  function stats() {
    var c = state.counts || {}, h = $('stats'); h.textContent = '';
    [['of the seeded ' + state.seedSize + ' decided', state.seedDone], ['Approved', c.approve || 0], ['Fix', c.fix || 0], ['Rejected', c.reject || 0], ['Not reviewed', (c.open || 0) + (c.changed || 0)]].forEach(function (x) {
      var s = el('span', 'br-stat'); s.appendChild(el('b', null, String(x[1]))); s.appendChild(document.createTextNode(' ' + x[0])); h.appendChild(s);
    });
  }
  function forms(list) {
    var h = $('forms'); h.textContent = '';
    if (!list || !list.length) { h.appendChild(el('p', 'br-msg', 'No forms found.')); return; }
    var t = el('table'), head = el('tr');
    ['Form', 'Status', 'Approved', 'Fix / Reject'].forEach(function (x) { head.appendChild(el('th', null, x)); });
    t.appendChild(head);
    list.forEach(function (f) {
      var tr = el('tr');
      tr.appendChild(el('td', null, f.name + (f.rcFallback ? ' (Reading: an existing Ace Labs section)' : '')));
      tr.appendChild(el('td', null, f.status === 'ready' ? 'Ready: students can take it' : 'Awaiting review: hidden from students'));
      tr.appendChild(el('td', null, f.approved + ' of ' + f.needed));
      tr.appendChild(el('td', null, f.fix + ' / ' + f.reject));
      t.appendChild(tr);
    });
    h.appendChild(t);
    h.appendChild(el('p', 'br-msg', 'A form unlocks for students when every one of its questions is approved. A Fix or Reject keeps it locked until the question is fixed and approved, or swapped.'));
  }

  function fetchItem(id) {
    if (state.cache[id]) return Promise.resolve(state.cache[id]);
    return call('?id=' + encodeURIComponent(id)).then(function (j) { if (j.ok) state.cache[id] = j; return j; });
  }
  function show() {
    var v = visible();
    $('pos').textContent = v.length ? (state.pos + 1) + ' of ' + v.length + (($('onlyOpen').checked) ? ' open' : '') : '';
    $('bPrev').disabled = state.pos <= 0; $('bNext').disabled = state.pos >= v.length - 1;
    $('noteForm').hidden = true;
    if (!v.length) { $('item').innerHTML = ''; $('item').appendChild(el('p', 'br-msg', 'Nothing open in ' + SECS[state.sec] + '. Untick "Open items only" to see what you decided.')); setActions(false); return; }
    var row = v[state.pos];
    $('item').innerHTML = '<p class="br-msg">Loading the question.</p>'; setActions(false);
    fetchItem(row.id).then(function (j) {
      if (!j.ok) { $('item').textContent = 'This question did not load (' + (j.error || j.http) + ').'; return; }
      state.item = j; render(j, row); setActions(true);
      var next = v[state.pos + 1]; if (next) fetchItem(next.id);
    });
  }
  function setActions(on) { ['bApprove', 'bFix', 'bReject'].forEach(function (k) { $(k).disabled = !on || state.busy; }); }

  function render(j, row) {
    var it = j.item, box = $('item'); box.textContent = '';
    var meta = el('div', 'br-meta');
    meta.appendChild(el('span', 'br-chip st-' + (j.status || 'open'), STATUS[j.status] || j.status));
    meta.appendChild(el('span', 'br-chip', SECS[state.sec] + (row.part === 'seed' ? ' · seeded 50' : row.part === 'forms' ? ' · on a new form' : ' · bank')));
    meta.appendChild(el('span', 'br-chip' + (it.conf === 'low' ? ' low' : ''), 'Skill: ' + (it.canonName || it.skillName || it.topic) + (it.conf === 'low' ? ' (low confidence: parent topic only)' : it.conf === 'table' ? ' (keyword table)' : ' (from the item’s own tag)')));
    meta.appendChild(el('span', 'br-chip', 'Difficulty ' + it.difficulty + ' of 3'));
    meta.appendChild(el('span', 'br-chip', it.bankId + ' · ' + it.bank));
    if (it.figureMissing) meta.appendChild(el('span', 'br-chip low', 'The stem points to a drawing, but none is attached (kept off the new forms)'));
    box.appendChild(meta);
    if (j.passage) {
      var d = el('details', 'br-passage'); d.open = row.part === 'seed' && state.pos === 0;
      d.appendChild(el('summary', null, 'Passage: ' + j.passage.title));
      j.passage.paragraphs.forEach(function (p, i) { var x = el('p'); x.appendChild(el('span', 'pn', String(i + 1))); x.appendChild(document.createTextNode(p)); d.appendChild(x); });
      box.appendChild(d);
    }
    box.appendChild(el('p', 'br-stem', it.stem));
    if (it.img) { var im = el('img', 'br-img'); im.src = it.img; im.alt = it.imgAlt || ''; box.appendChild(im); }
    var ul = el('ol', 'br-choices');
    it.choices.forEach(function (c, i) {
      var li = el('li', i === it.answer ? 'key' : '');
      li.appendChild(el('span', 'let', L[i] + '.'));
      li.appendChild(document.createTextNode(c));
      if (i === it.answer) li.appendChild(el('span', 'tag', 'Key'));
      var why = i === it.answer ? null : (it.traps || [])[i];
      if (i !== it.answer) li.appendChild(el('span', 'exp' + (why ? '' : ' missing'), why || 'No explanation for this choice.'));
      ul.appendChild(li);
    });
    box.appendChild(ul);
    var w = el('div', 'br-why'); w.appendChild(el('b', null, 'Why ' + L[it.answer] + ' is right: ')); w.appendChild(document.createTextNode(it.why || '')); box.appendChild(w);
    if (it.trick) { var t = el('div', 'br-why'); t.appendChild(el('b', null, 'Trick: ')); t.appendChild(document.createTextNode(it.trick)); box.appendChild(t); }
    if (it.trapTags && it.trapTags.length) box.appendChild(el('p', 'br-msg', 'Trap tags: ' + it.trapTags.join(', ')));
    if (j.decision) box.appendChild(el('p', 'br-msg', 'Your last decision: ' + (STATUS[j.decision.d] || j.decision.d) + (j.decision.note ? ' ("' + j.decision.note + '")' : '') + ', ' + new Date(j.decision.at).toLocaleString()));
  }

  function decide(d, note) {
    var row = visible()[state.pos]; if (!row || state.busy) return;
    state.busy = true; setActions(false);
    call('', { id: row.id, decision: d, note: note || '' }).then(function (j) {
      state.busy = false;
      if (!j.ok) { $('item').appendChild(el('p', 'br-err', 'Not saved (' + (j.error || j.http) + '). Try again.')); setActions(true); return; }
      var prev = row.status; row.status = d; delete state.cache[row.id];
      state.counts[prev] = Math.max(0, (state.counts[prev] || 0) - 1); state.counts[d] = (state.counts[d] || 0) + 1;
      if (row.part === 'seed' && (prev === 'open' || prev === 'changed')) state.seedDone += 1;
      stats();
      if (!$('onlyOpen').checked) state.pos = Math.min(state.pos + 1, visible().length - 1);
      else state.pos = Math.min(state.pos, Math.max(0, visible().length - 1));
      show();
    }, function () { state.busy = false; setActions(true); $('item').appendChild(el('p', 'br-err', 'Not saved: no connection.')); });
  }

  $('tabs').addEventListener('click', function (e) { var b = e.target.closest('button[data-sec]'); if (b) load(b.getAttribute('data-sec')); });
  $('bApprove').addEventListener('click', function () { decide('approve'); });
  $('bReject').addEventListener('click', function () { decide('reject'); });
  $('bFix').addEventListener('click', function () { $('noteForm').hidden = false; $('note').focus(); });
  $('noteCancel').addEventListener('click', function () { $('noteForm').hidden = true; });
  $('noteForm').addEventListener('submit', function (e) { e.preventDefault(); var n = $('note').value.trim(); if (!n) { $('note').focus(); return; } $('note').value = ''; decide('fix', n); });
  $('bPrev').addEventListener('click', function () { if (state.pos > 0) { state.pos--; show(); } });
  $('bNext').addEventListener('click', function () { if (state.pos < visible().length - 1) { state.pos++; show(); } });
  $('onlyOpen').addEventListener('change', function () { state.pos = 0; show(); });
  $('keyForm').addEventListener('submit', function (e) { e.preventDefault(); try { sessionStorage.setItem('ace.bankReviewKey', $('keyIn').value.trim()); } catch (x) { /* private mode */ } load(state.sec); });
  load('bio');
})();
