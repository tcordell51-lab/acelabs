/* =====================================================================
   The sarcomere lens: a Real view with Call it first.
   A to-scale drawing of a sarcomere (200 px per um: myosin 1.6 um, actin
   1.0 um per side) with a draggable glass that shows the electron
   micrograph of the same spot (BioReal.temStrip from tools/bio/bio-real.js,
   ids made unique). Drawing / Lens / Micrograph grows the glass into the
   whole TEM. The call comes first: nothing on the stage says which band
   holds until the muscle has contracted and the student has called it.
   Content: tools/bio/bio-stick-data.js "sarcomere".
   ===================================================================== */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  if (!$('lensSvg')) return;
  var M = 360, MH = 160, ALEN = 200;
  var L = 245, lensX = 196, lensY = 102, lensR = 82, view = 'lens', called = false;
  /* labels in the picture stay 12 px or larger on a phone (explainer standard 4.3) */
  var K = window.innerWidth < 600 ? 1.5 : 1;
  function fz(n) { return (n * K).toFixed(1); }

  function drawing(L) {
    var period = 2 * L, zs = [], ms = [], k, out = '<rect x="0" y="0" width="720" height="204" fill="#fbf6e9"/>';
    for (k = -2; k <= 2; k++) { zs.push(M - L + k * period); ms.push(M + k * period); }
    [[26, 0], [114, 3]].forEach(function (row) {
      var y0 = row[0], dx = row[1];
      out += '<rect x="0" y="' + y0 + '" width="720" height="72" fill="#f1e9d6"/>';
      zs.forEach(function (z) {
        z += dx;
        [12, 28, 44, 60].forEach(function (yy) { out += '<path d="M' + (z - ALEN) + ',' + (y0 + yy) + 'H' + (z + ALEN) + '" stroke="#2f6aa3" stroke-width="3" stroke-linecap="round"/>'; });
        var zig = 'M' + z + ',' + (y0 + 2);
        for (var j = 0; j < 9; j++) zig += 'l4,4l-4,4';
        out += '<path d="' + zig + '" fill="none" stroke="#0d2018" stroke-width="3.2" stroke-linejoin="round"/>';
      });
      ms.forEach(function (m) {
        m += dx;
        [20, 36, 52].forEach(function (yy) {
          var y = y0 + yy, heads = '';
          for (var x = m - MH + 6; x <= m + MH - 6; x += 14) {
            if (Math.abs(x - m) < 18) continue;
            var dir = x < m ? -1 : 1;
            heads += 'M' + x + ',' + (y - 3) + 'l' + (dir * 5) + ',-5M' + x + ',' + (y + 3) + 'l' + (dir * 5) + ',5';
          }
          out += '<path d="M' + (m - MH) + ',' + y + 'H' + (m + MH) + '" stroke="#8C7235" stroke-width="7" stroke-linecap="round"/><path d="' + heads + '" stroke="#8C7235" stroke-width="2.4" stroke-linecap="round"/>';
        });
        out += '<path d="M' + m + ',' + (y0 + 4) + 'V' + (y0 + 68) + '" stroke="#3a4a42" stroke-width="2" stroke-dasharray="3 3"/>';
      });
    });
    out += '<g font-family="JetBrains Mono, monospace" font-size="' + fz(13) + '" fill="#3a4a42"><text x="72" y="' + (K > 1 ? 21 : 17) + '" font-weight="600">DRAWING</text><text x="' + (K > 1 ? 470 : 560) + '" y="' + (K > 1 ? 21 : 17) + '" fill="#2f6aa3">actin</text><text x="' + (K > 1 ? 552 : 610) + '" y="' + (K > 1 ? 21 : 17) + '" fill="#7a6128">myosin</text></g>';
    return out;
  }
  /* brackets name the bands; lengths and "holds" appear only once called */
  function brackets(L) {
    var zL = M - L, iH = L - MH, hH = Math.max(0, L - ALEN), out = '<rect x="0" y="204" width="720" height="96" fill="#fbf6e9"/>';
    function br(x1, x2, y, col, label, sub) {
      return '<path d="M' + x1 + ',' + (y - 8) + 'V' + y + 'H' + x2 + 'V' + (y - 8) + '" fill="none" stroke="' + col + '" stroke-width="2.6"/>' +
        '<text x="' + ((x1 + x2) / 2) + '" y="' + (y + 16 + 8 * K) + '" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="' + fz(17) + '" fill="' + col + '">' + label + '</text>' +
        (sub ? '<text x="' + ((x1 + x2) / 2) + '" y="' + (y + 32 + 14 * K) + '" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="' + fz(13) + '" fill="' + col + '">' + sub + '</text>' : '');
    }
    out += br(Math.max(62, zL - iH), zL + iH, 216, '#2f6aa3', 'I band', called ? (2 * iH / 200).toFixed(2) + ' um' : '');
    out += br(M - MH + 3, M + MH - 3, 216, '#7a6128', 'A band', called ? '1.60 um, holds' : '');
    if (hH > 2) out += br(M - hH, M + hH, K > 1 ? 266 : 270, '#3a4a42', 'H zone', '');
    else out += '<text x="' + M + '" y="292" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="' + fz(15) + '" fill="#3a4a42">H zone gone</text>';
    out += '<path d="M' + zL + ',204V212" stroke="#0d2018" stroke-width="3"/><text x="' + zL + '" y="296" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#0d2018">Z</text>';
    out += '<path d="M' + (M + L) + ',204V212" stroke="#0d2018" stroke-width="3"/><text x="' + (M + L) + '" y="296" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#0d2018">Z</text>';
    return out;
  }
  function stateWords() {
    var v = +$('contract').value;
    return v < 15 ? 'Relaxed' : v < 85 ? 'Contracting' : 'Fully contracted';
  }
  function render() {
    $('drawing').innerHTML = drawing(L);
    var tem = window.BioReal.temStrip({ zL: M - L, zR: M + L, actinTipL: M - L + ALEN, myosinW: 2 * MH });
    var cut = tem.indexOf('<rect y="204"');
    $('temLayer').innerHTML = AL.uniq(cut > 0 ? tem.slice(0, cut) : tem);
    $('brackets').innerHTML = brackets(L);
    var iH = L - MH, hH = Math.max(0, L - ALEN), v = +$('contract').value;
    $('rS').textContent = (2 * L / 200).toFixed(2) + ' um';
    $('rI').textContent = (2 * iH / 200).toFixed(2) + ' um';
    $('rA').textContent = '1.60 um';
    $('rH').textContent = (2 * hH / 200).toFixed(2) + ' um';
    $('stateTxt').textContent = stateWords();
    $('contract').setAttribute('aria-valuetext', stateWords() + ': sarcomere ' + (2 * L / 200).toFixed(2) + ' um');
  }
  function setL(v) { $('contract').value = v; L = 245 - 0.45 * v; render(); }

  /* the lens: drag, tap to move, arrow keys */
  function placeLens(x, y) {
    lensX = Math.max(60, Math.min(660, x)); lensY = Math.max(86, Math.min(118, y));
    ['lensCircle', 'lensHit', 'lensRing'].forEach(function (id) { $(id).setAttribute('cx', lensX); $(id).setAttribute('cy', lensY); });
    $('lensRing2').setAttribute('cx', lensX); $('lensRing2').setAttribute('cy', lensY);
    $('lensTag').setAttribute('transform', 'translate(' + lensX + ' ' + Math.max(12, lensY - lensR - 2) + ')');
    $('lensHandle').setAttribute('aria-valuenow', Math.round(lensX));
    $('lensHandle').setAttribute('aria-valuetext', 'Lens over ' + (lensX < M - 120 || lensX > M + 120 ? 'the I band and a Z disc' : Math.abs(lensX - M) < 40 ? 'the middle of the A band' : 'the edge of the A band'));
  }
  function setR(r) {
    lensR = r;
    ['lensCircle', 'lensHit', 'lensRing'].forEach(function (id) { $(id).setAttribute('r', r); });
    $('lensRing2').setAttribute('r', r + 6);
    $('lensTag').setAttribute('transform', 'translate(' + lensX + ' ' + Math.max(12, lensY - r - 2) + ')');
    var hide = r > 300 || r < 2;
    $('lensRing').style.opacity = $('lensRing2').style.opacity = $('lensTag').style.opacity = hide ? 0 : 1;
  }
  function tweenR(to) {
    var from = lensR, t0 = performance.now(), dur = AL.reduced() ? 0 : 420;
    function step(now) {
      var t = dur ? Math.min(1, (now - t0) / dur) : 1, e = 1 - Math.pow(1 - t, 3);
      setR(from + (to - from) * e);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var svg = $('lensSvg');
  function toSvg(evt) { var p = svg.createSVGPoint(); p.x = evt.clientX; p.y = evt.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
  var dragging = false, off = { x: 0, y: 0 };
  $('lensHandle').addEventListener('pointerdown', function (e) {
    if (view !== 'lens') return;
    dragging = true; var p = toSvg(e); off.x = lensX - p.x; off.y = lensY - p.y;
    $('lensHandle').setPointerCapture(e.pointerId); e.preventDefault();
  });
  $('lensHandle').addEventListener('pointermove', function (e) { if (!dragging) return; var p = toSvg(e); placeLens(p.x + off.x, p.y + off.y); });
  $('lensHandle').addEventListener('pointerup', function () { dragging = false; });
  svg.addEventListener('click', function (e) { if (view !== 'lens' || e.target.closest('#lensHandle')) return; var p = toSvg(e); if (p.y < 204) placeLens(p.x, p.y); });
  $('lensHandle').addEventListener('keydown', function (e) {
    var d = e.shiftKey ? 60 : 20;
    if (e.key === 'ArrowLeft') placeLens(lensX - d, lensY); else if (e.key === 'ArrowRight') placeLens(lensX + d, lensY); else return;
    e.preventDefault();
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-view]'), function (b) {
    b.addEventListener('click', function () {
      view = b.dataset.view;
      Array.prototype.forEach.call(document.querySelectorAll('[data-view]'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      tweenR(view === 'tem' ? 720 : view === 'drawing' ? 0 : 82);
    });
  });
  $('contract').addEventListener('input', function () { setL(+$('contract').value); });

  /* Call it first */
  var P = {
    options: ['The I band', 'The A band', 'The H zone'], key: 1,
    traps: ['The I band is actin with no myosin over it. It shrinks as the actin slides in.', null, 'The H zone is myosin with no actin over it. It shrinks and can vanish.'],
    trapNames: ['Neighbor fact', null, 'Neighbor fact'],
    why: 'The A band is the length of the myosin filaments. Filaments slide; they do not shorten. So the I band and H zone shrink, and the A band holds.',
    hook: 'A band stays (it is myosin). I and H shrink.'
  };
  var band = AL.band($('lensBand'));
  AceLoop.options($('lensOpts'), P.options, function (pick) { watch(pick); });
  var STOPS = [[0, 'Relaxed. Each band at rest.'], [50, 'Contracting. The actin slides in over the myosin; the Z discs move closer.'], [100, 'Fully contracted. The H zone is gone and the I band is narrow.']];
  function watch(pick) {
    band.set(1);
    $('lensCap').textContent = 'Watch it contract.';
    AL.follow($('lensStage'));
    var i = 0;
    function go() {
      var from = +$('contract').value, to = STOPS[i][0], t0 = performance.now();
      $('lensCap').innerHTML = '<b>Frame ' + (i + 1) + ' of 3.</b> ' + STOPS[i][1];
      (function step(now) {
        var t = AL.reduced() ? 1 : Math.min(1, (now - t0) / 700);
        setL(from + (to - from) * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(step);
        else {
          i++;
          if (i < STOPS.length) { if (AL.reduced()) { $('lensNext').hidden = false; } else setTimeout(go, 450); }
          else { $('lensNext').hidden = true; reveal(pick); }
        }
      })(performance.now());
    }
    $('lensNext').onclick = function () { go(); };
    go();
  }
  function reveal(pick) {
    called = true;
    render();
    var ok = pick === P.key;
    AceLoop.reveal($('lensOpts'), pick, P.key);
    AceLoop.collapse($('lensOpts'), pick, P.key);
    $('lensQ').hidden = true;
    $('lensOut').innerHTML = AceLoop.verdict({ ok: ok, callText: P.options[pick], trap: P.traps[pick], trapName: P.trapNames[pick], keyText: P.options[P.key], keyLead: 'The micrograph says', why: ok ? P.why : '', hook: P.hook }) +
      '<div class="drive" style="margin-top:12px"><div class="dh">' + AL.icon('drag') + 'Now you drive</div><p>Contract it yourself, and drag the lens over any band: the drawing and the electron micrograph line up to the nanometer.</p></div>' +
      (ok ? '' : '<p class="honest" style="margin-top:10px">' + AL.icon('keep') + 'Ace Card made, with this micrograph. Back tomorrow, ' + AL.dayName(1) + '.</p>');
    $('lensOut').hidden = false;
    $('contract').disabled = false;
    ['roA', 'roI', 'roH'].forEach(function (id) { $(id).querySelector('.chg').hidden = false; });
    $('roA').classList.add('hold');
    band.set(ok ? 2 : 3);
    if (!ok) AL.setDue(4);
    AL.follow($('lensStage'), { to: $('lensOut'), prefer: 'end' });
  }
  setL(0); placeLens(196, 102);
  window.LensDemo = { pick: function (i) { $('lensOpts').querySelectorAll('.opt')[i].click(); }, view: function (v) { document.querySelector('[data-view="' + v + '"]').click(); }, contract: function (v) { setL(v); }, lens: placeLens };
})();
