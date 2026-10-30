/* =====================================================================
   Titration curves: the GChem loop, on an existing GChem skill-tree idea
   (Acid-Base: half-equivalence, the indicator choice). The curve is exact
   by charge balance; in the buffer region it shows the Henderson-
   Hasselbalch value so the readout at half-equivalence matches the DAT key
   (4.74, not the exact 4.75). Explainer visuals must agree with bank keys.
   Content: tools/mock/data/full-mocks.js FULL_4 GChem item 9.
   ===================================================================== */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var band = AL.band($('band'));
  var K = window.innerWidth < 600 ? 1.55 : 1;
  function fs(n) { return (n * K).toFixed(1); }
  var KA = 1.8e-5, KW = 1e-14, VA = 25, CA = 0.1, CB = 0.1;
  var vol = 0, acid = 'weak', dripping = false, drops = [], missed = false;

  function pH(v, kind) {
    /* before any base: the weak-acid shortcut the DAT uses, sqrt(Ka C) */
    if (kind !== 'strong' && v === 0) return -Math.log10(Math.sqrt(KA * CA));
    if (kind !== 'strong' && v >= 1 && v <= 24) return -Math.log10(KA) + Math.log10(v / (VA - v));
    var vt = VA + v, ca = CA * VA / vt, nb = CB * v / vt;
    function f(p) { var h = Math.pow(10, -p), a = kind === 'strong' ? ca : ca * KA / (KA + h); return nb + h - KW / h - a; }
    var lo = 0, hi = 14;
    for (var i = 0; i < 60; i++) { var mid = (lo + hi) / 2; if (f(mid) > 0) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }
  var X0 = 44, X1 = 328, Y0 = 262, Y1 = 14;
  function px(v) { return X0 + (X1 - X0) * v / 50; }
  function py(p) { return Y0 - (Y0 - Y1) * p / 14; }
  function path(kind, upto) { var d = ''; for (var v = 0; v <= upto + 1e-9; v += 0.25) d += (d ? 'L' : 'M') + px(v).toFixed(1) + ',' + py(pH(v, kind)).toFixed(1); return d; }
  var showHalf = false, showEq = false;
  function curve() {
    var mono = 'font-family="JetBrains Mono, monospace"';
    var g = '<rect width="340" height="300" fill="#fffdf7"/>';
    for (var p = 2; p <= 12; p += 2) g += '<path d="M' + X0 + ',' + py(p) + 'H' + X1 + '" stroke="#e3dccb" stroke-width="1"/><text x="' + (X0 - 8) + '" y="' + (py(p) + 4) + '" text-anchor="end" ' + mono + ' font-size="' + fs(11) + '" fill="#55635c">' + p + '</text>';
    for (var v = 10; v <= 50; v += 10) g += '<path d="M' + px(v) + ',' + Y0 + 'v5" stroke="#3a4a42"/><text x="' + px(v) + '" y="' + (Y0 + 18) + '" text-anchor="middle" ' + mono + ' font-size="' + fs(11) + '" fill="#55635c">' + (K > 1 && v !== 20 && v !== 40 ? '' : v) + '</text>';
    g += '<path d="M' + X0 + ',' + Y1 + 'V' + Y0 + 'H' + X1 + '" stroke="#3a4a42" stroke-width="1.5" fill="none"/>';
    g += '<text x="10" y="' + (Y1 + 4) + '" ' + mono + ' font-size="' + fs(11) + '" fill="#3a4a42">pH</text><text x="' + X1 + '" y="' + (Y0 + 34) + '" text-anchor="end" ' + mono + ' font-size="' + fs(11) + '" fill="#3a4a42">NaOH, mL</text>';
    g += '<rect x="' + X0 + '" y="' + py(10) + '" width="' + (X1 - X0) + '" height="' + (py(8.2) - py(10)) + '" fill="#e05aa0" fill-opacity=".08"/>';
    if (acid !== 'weak') g += '<path d="' + path('strong', acid === 'both' ? 50 : vol) + '" stroke="#3a4a42" stroke-width="' + (acid === 'both' ? 2.4 : 3.6) + '" stroke-dasharray="' + (acid === 'both' ? '6 5' : '0') + '" fill="none" stroke-linecap="round"/>';
    if (acid !== 'strong') {
      if (acid === 'both') g += '<path d="' + path('weak', 50) + '" stroke="#2f6aa3" stroke-opacity=".25" stroke-width="3.6" fill="none"/>';
      g += '<path d="' + path('weak', acid === 'both' ? 50 : vol) + '" stroke="#2f6aa3" stroke-width="3.6" fill="none" stroke-linecap="round"/>';
      if (showHalf && (vol >= 12.5 || acid === 'both')) {
        var hy = py(pH(12.5, 'weak')), bw = 118 * K, bh = 34 * K, by = hy - 26 - bh;
        g += '<path d="M' + px(12.5) + ',' + hy + 'V' + Y0 + 'M' + X0 + ',' + hy + 'H' + px(12.5) + '" stroke="#7a6128" stroke-width="1.4" stroke-dasharray="4 3"/>' +
          '<circle cx="' + px(12.5) + '" cy="' + hy + '" r="6" fill="#C9A84C" stroke="#0d2018" stroke-width="1.5"/>' +
          '<rect x="' + (X0 + 6) + '" y="' + by + '" width="' + bw + '" height="' + bh + '" rx="6" fill="#0d2018"/>' +
          '<text x="' + (X0 + 14) + '" y="' + (by + 14 * K) + '" ' + mono + ' font-size="' + fs(11) + '" fill="#E2C97A">half-equivalence</text>' +
          '<text x="' + (X0 + 14) + '" y="' + (by + 28 * K) + '" ' + mono + ' font-size="' + fs(11) + '" fill="#f3ecdc">pH = pKa = 4.74</text>';
      }
      if (showEq && (vol >= 25 || acid === 'both')) {
        var ey = py(pH(25, 'weak'));
        g += '<circle cx="' + px(25) + '" cy="' + ey + '" r="6" fill="#fffdf7" stroke="#2f6aa3" stroke-width="2.5"/><path d="M' + px(25) + ',' + ey + 'V' + Y0 + '" stroke="#2f6aa3" stroke-width="1.4" stroke-dasharray="4 3"/>' +
          '<text x="' + (px(25) + 10) + '" y="' + (ey + 4) + '" ' + mono + ' font-size="' + fs(11) + '" fill="#2f6aa3">eq: pH 8.72</text>';
      }
    }
    if (acid === 'both') g += '<text x="' + (px(25) + 10) + '" y="' + (py(7) + 4) + '" ' + mono + ' font-size="' + fs(11) + '" fill="#3a4a42">HCl eq: pH 7</text><circle cx="' + px(25) + '" cy="' + py(7) + '" r="4.5" fill="#3a4a42"/>';
    var k = acid === 'strong' ? 'strong' : 'weak';
    g += '<circle cx="' + px(vol) + '" cy="' + py(pH(vol, k)) + '" r="7.5" fill="#0d2018" stroke="#fffdf7" stroke-width="2.5"/>';
    $('curve').innerHTML = g;
  }
  function pink(p) { return Math.max(0, Math.min(1, (p - 8.2) / 1.8)); }
  function mix(a, b, t) {
    var x = [1, 3, 5].map(function (i) { return parseInt(a.substr(i, 2), 16); }), y = [1, 3, 5].map(function (i) { return parseInt(b.substr(i, 2), 16); });
    return '#' + x.map(function (v, i) { var c = Math.round(v + (y[i] - v) * t).toString(16); return c.length < 2 ? '0' + c : c; }).join('');
  }
  function apparatus() {
    var k = acid === 'strong' ? 'strong' : 'weak', p = pH(vol, k), t = pink(p);
    var sol = mix('#eef3f1', '#e2539b', t * 0.85), lvl = 22 + vol * 3.1;
    var g = '<rect width="180" height="320" fill="#f7f3ea"/>';
    g += '<rect x="20" y="8" width="8" height="304" rx="3" fill="#8b9089"/><rect x="6" y="306" width="166" height="10" rx="3" fill="#6d726b"/>';
    g += '<rect x="24" y="96" width="62" height="9" rx="3" fill="#6d726b"/><rect x="80" y="90" width="22" height="20" rx="4" fill="#53584f"/>';
    g += '<rect x="81" y="12" width="20" height="170" rx="4" fill="#ffffff" fill-opacity=".7" stroke="#9aa39e" stroke-width="1.4"/>';
    g += '<rect x="83" y="' + lvl.toFixed(1) + '" width="16" height="' + Math.max(0, 180 - lvl).toFixed(1) + '" fill="#cfe3f3"/><path d="M83,' + lvl.toFixed(1) + 'h16" stroke="#2f6aa3" stroke-width="2"/>';
    for (var m = 0; m <= 50; m += 5) { var y = 22 + m * 3.1; g += '<path d="M' + (m % 10 ? 92 : 88) + ',' + y + 'H101" stroke="#3a4a42" stroke-width="1"/>'; if (m % 10 === 0) g += '<text x="105" y="' + (y + 3.5) + '" font-family="JetBrains Mono, monospace" font-size="' + fs(9) + '" fill="#3a4a42">' + m + '</text>'; }
    g += '<path d="M85,182 L91,196 L91,212" stroke="#9aa39e" stroke-width="1.4" fill="#cfe3f3"/><path d="M97,182 L91,196" stroke="#9aa39e" stroke-width="1.4"/>';
    g += '<g transform="translate(91 200) rotate(' + (dripping ? 90 : 0) + ')"><rect x="-14" y="-3.5" width="28" height="7" rx="3.5" fill="#1B3A2D"/></g><circle cx="91" cy="200" r="4.5" fill="#C9A84C" stroke="#0d2018"/><path d="M91,204 V218" stroke="#9aa39e" stroke-width="2.4"/>';
    drops.forEach(function (d) { g += '<ellipse cx="91" cy="' + d.toFixed(1) + '" rx="2.6" ry="3.4" fill="#9cc6ee"/>'; });
    g += '<path d="M78,232 h26 v18 L136,296 a6,6 0 0 1 -5,10 H51 a6,6 0 0 1 -5,-10 L78,250 Z" fill="#ffffff" fill-opacity=".55" stroke="#9aa39e" stroke-width="1.6"/>';
    g += '<path d="M64,270 H118 L136,296 a6,6 0 0 1 -5,10 H51 a6,6 0 0 1 -5,-10 Z" fill="' + sol + '"/><rect x="80" y="298" width="22" height="5" rx="2.5" fill="#fffdf7" stroke="#55635c"/>';
    $('app').innerHTML = g;
    $('sw').style.background = sol;
    $('indTxt').lastChild.textContent = t < 0.05 ? 'clear' : t < 0.5 ? 'faint pink' : 'pink';
  }
  function readouts() {
    var k = acid === 'strong' ? 'strong' : 'weak', p = pH(vol, k);
    $('phTxt').textContent = p.toFixed(2);
    $('ratioTxt').textContent = k === 'strong' ? 'none' : vol >= 25 ? 'all A-' : (vol / (25 - vol)).toFixed(2);
    $('volTxt').textContent = vol.toFixed(2) + ' mL';
    $('vol').value = vol;
    $('vol').setAttribute('aria-valuetext', vol.toFixed(1) + ' mL of NaOH, pH ' + p.toFixed(2));
  }
  function render() { curve(); apparatus(); readouts(); }

  /* the pour: drops show where the base comes from */
  function runTo(target, ms) {
    return new Promise(function (res) {
      var from = vol, t0 = performance.now();
      if (AL.reduced()) { vol = target; render(); return res(); }
      drops = [];
      (function step(now) {
        var t = Math.min(1, (now - t0) / ms); vol = from + (target - from) * t;
        drops = drops.map(function (d) { return d + 6; }).filter(function (d) { return d < 268; });
        if (!drops.length || drops[drops.length - 1] > 236) drops.push(220);
        dripping = true; render(); dripping = false;
        if (t < 1) requestAnimationFrame(step); else { drops = []; render(); res(); }
      })(t0);
    });
  }
  var pouring = false, last = 0;
  function tick(now) {
    if (!pouring) return;
    var dt = Math.min(50, now - (last || now)); last = now;
    vol = Math.min(50, vol + dt * 0.006);
    drops = drops.map(function (d) { return d + dt * 0.12; }).filter(function (d) { return d < 268; });
    if (!drops.length || drops[drops.length - 1] > 236) drops.push(220);
    dripping = true; render(); dripping = false;
    if (vol >= 50) { stopPour(); return; }
    requestAnimationFrame(tick);
  }
  function startPour() { if (AL.reduced()) { vol = Math.min(50, vol + 2.5); render(); return; } pouring = true; last = 0; $('dripTxt').textContent = 'Close the stopcock'; requestAnimationFrame(tick); }
  function stopPour() { pouring = false; drops = []; $('dripTxt').textContent = 'Open the stopcock'; render(); }
  $('drip').addEventListener('click', function () { if (pouring) stopPour(); else startPour(); });
  $('vol').addEventListener('input', function () { if (pouring) stopPour(); vol = +$('vol').value; render(); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-acid]'), function (b) {
    b.addEventListener('click', function () {
      acid = b.dataset.acid;
      Array.prototype.forEach.call(document.querySelectorAll('[data-acid]'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      $('rigH').textContent = acid === 'strong' ? '25.0 mL of 0.100 M HCl' : acid === 'both' ? 'Acetic acid and HCl, side by side' : '25.0 mL of 0.100 M acetic acid';
      $('cap').textContent = acid === 'both' ? 'Compare: the strong acid starts lower and meets the base at pH 7; the weak acid has a buffer shelf and ends basic, near 8.7.' : $('cap').textContent;
      render();
    });
  });
  $('stuckBtn').addEventListener('click', function () { AceLoop.stuck('gchem', this); });

  var P = {
    options: ['2.87, where it started', '4.74, the pKa', '7.00, neutral'], key: 1,
    traps: ['2.87 is the pH before any base goes in: acetic acid on its own.', null, '7.00 is where a strong acid meets a strong base. Here half the acid is still there, paired with its conjugate base.'],
    trapNames: ['Right number, other question', null, 'Other conditions'],
    why: 'At half-equivalence [A-] = [HA], so Henderson-Hasselbalch gives pH = pKa + log(1) = pKa = 4.74.',
    hook: 'Halfway to equivalence, pH equals pKa.'
  };
  var C = {
    q: 'Keep going to the equivalence point. What is the pH there?',
    options: ['Exactly 7', 'Above 7, about 8.7', 'Below 7'], key: 1,
    traps: ['Exactly 7 is the strong acid and strong base case. The acetate left behind is a weak base.', null, 'Below 7 would need acid left over. At equivalence every acetic acid is now acetate.'],
    trapNames: ['Other conditions', null, 'Reversed'],
    why: 'At equivalence all the acetic acid is acetate, a weak base, so the solution is basic, about 8.7. That is why phenolphthalein (8.2 to 10.0) is the indicator here.'
  };

  /* Call */
  AceLoop.options($('opts'), P.options, function (pick) { watchHalf(pick); });
  $('skipBtn').addEventListener('click', function () { AceLoop.hold($('opts'), -1); watchHalf(-1); });
  async function watchHalf(pick) {
    $('callRow').hidden = true;
    band.set(1);
    await AL.follow($('stage'));
    $('cap').textContent = 'The stopcock opens. NaOH drips into the acid.';
    await runTo(12.5, 1800);
    showHalf = true; render();
    $('cap').innerHTML = '<b>12.5 mL in: half-equivalence.</b> Half the acid is now acetate. The curve is flattest here: the buffer.';
    await AL.wait(700);
    var ok = pick === P.key;
    if (pick >= 0 && !ok) missed = true;
    AceLoop.reveal($('opts'), pick, P.key);
    $('pq').hidden = true; $('opts').hidden = true;
    $('after').innerHTML = AceLoop.verdict({ skipped: pick < 0, ok: ok, callText: pick >= 0 ? P.options[pick] : '', trap: pick >= 0 ? P.traps[pick] : '', trapName: pick >= 0 ? P.trapNames[pick] : '', keyText: P.options[P.key], keyLead: 'The curve says', why: ok || pick < 0 ? P.why : '', hook: P.hook }) +
      '<div class="stage-actions" style="margin-top:12px"><button class="btn gold" id="more" type="button">One more, from memory ' + AL.icon('arrow', 'sm') + '</button></div>';
    AL.follow($('stage'), { to: $('after'), prefer: 'end' });
    $('more').addEventListener('click', recall);
  }
  /* Recall: the equivalence point, called before the flask turns */
  function recall() {
    band.set(2);
    $('pq').hidden = false; $('pq').textContent = C.q;
    $('opts').hidden = false; delete $('opts').dataset.locked;
    $('after').innerHTML = '';
    AceLoop.options($('opts'), C.options, async function (pick) {
      $('cap').textContent = 'The pour continues past the shelf.';
      await AL.follow($('stage'));
      await runTo(25, 1500); showEq = true; await runTo(30, 700);
      $('cap').innerHTML = '<b>Equivalence at 25.0 mL: pH 8.72.</b> The flask turns pink in phenolphthalein\'s range, 8.2 to 10.0.';
      var ok = pick === C.key;
      if (!ok) missed = true;
      AceLoop.reveal($('opts'), pick, C.key);
      $('pq').hidden = true; $('opts').hidden = true;
      $('after').innerHTML = AceLoop.verdict({ ok: ok, callText: C.options[pick], trap: C.traps[pick], trapName: C.trapNames[pick], keyText: C.options[C.key], keyLead: 'The curve says', why: C.why, hook: 'Drop a line from the eq point.' });
      card();
      $('driveBox').hidden = false;
      AL.follow($('stage'), { to: $('after'), prefer: 'end' });
    });
    AL.follow($('stage'), { to: $('opts'), prefer: 'end' });
  }
  function card() {
    band.set(3);
    var pic = '<div><svg viewBox="40 60 300 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + $('curve').innerHTML + '</svg><span class="pl">the curve</span></div><div style="background:#f7f3ea"><svg viewBox="40 180 120 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + $('app').innerHTML + '</svg><span class="pl">pink at 8.7</span></div>';
    $('after').insertAdjacentHTML('beforeend', '<div style="margin-top:14px">' + AceLoop.card({
      sec: 'gchem', where: 'GChem / Acid-Base', pic: pic,
      idea: 'Weak acid and strong base: pH = pKa at half-equivalence; basic at equivalence (about 8.7), so use phenolphthalein.',
      hook: 'Halfway, pH equals pKa.'
    }) + '<p class="keep-note" style="margin:10px 0;font-size:14px;color:var(--b-ink-2)">' + (missed ? 'Made for you, from your call. It comes back tomorrow, ' + AL.dayName(1) + ', as a fresh question.' : 'Both calls confirmed. Keep it anyway and it comes back tomorrow.') + '</p>' +
      '<div class="stage-actions"><button class="btn gold" id="saveBtn" type="button">' + (missed ? 'Send it to Review ' + AL.icon('arrow', 'sm') : AL.icon('keep', 'sm') + 'Keep it') + '</button>' + (missed ? '' : '<button class="btn quiet" type="button">Skip, I have this one</button>') + '</div></div>');
    $('saveBtn').onclick = function () { this.disabled = true; AceLoop.keep($('newCard'), { due: 4, done: function () { band.set(4); Array.prototype.forEach.call(document.querySelectorAll('#band .st'), function (s) { s.classList.add('done'); s.classList.remove('on'); }); } }); };
  }
  render();
  window.TitDemo = { pick: function (i) { $('opts').querySelectorAll('.opt')[i].click(); }, more: function () { $('more').click(); }, acid: function (a) { document.querySelector('[data-acid="' + a + '"]').click(); }, vol: function (v) { var s = $('vol'); s.value = v; s.dispatchEvent(new Event('input')); } };
})();
