/* =====================================================================
   Which one is this? A recognition set on true-to-life slides.
   Six fields, one at a time, each a different field of its state (the
   build seeds 6 to 12 variants per state so students learn the state, not
   the picture). The renderer's caption and solute strip name the state,
   so they are cropped out until the student answers. A miss becomes an
   Ace Card carrying that slide. No score at the end.
   ===================================================================== */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  if (!$('rec')) return;
  var NAMES = {
    iso: 'Red cells, isotonic',
    swell: 'Red cells swelling (hypotonic)',
    lysed: 'Hemolysis: empty ghosts',
    cren: 'Crenated red cells (hypertonic)',
    turgid: 'Elodea, turgid (hypotonic)',
    plasmo: 'Elodea, plasmolysis (hypertonic)'
  };
  var TELL = {
    iso: 'Biconcave discs with a pale center, a few seen edge-on. No net water movement.',
    swell: 'The pale center narrows to a slit and the discs round up: water is moving in.',
    lysed: 'Faint, empty membranes in an evenly tinted field. The cells took in water until they burst.',
    cren: 'Shrunken cells covered in short blunt projections. Water left the cell.',
    turgid: 'Chloroplasts pressed flat against every wall. The wall stops the swelling.',
    plasmo: 'Green protoplasts rounded up and pulled off the walls, held by thin strands.'
  };
  var SET = [
    { k: 'cren', type: 'animal', ext: 84, opts: ['iso', 'cren', 'swell', 'lysed'] },
    { k: 'plasmo', type: 'plant', ext: 94, opts: ['turgid', 'cren', 'plasmo', 'iso'] },
    { k: 'lysed', type: 'animal', ext: 6, opts: ['lysed', 'iso', 'plasmo', 'swell'] },
    { k: 'swell', type: 'animal', ext: 28, opts: ['cren', 'iso', 'lysed', 'swell'] },
    { k: 'turgid', type: 'plant', ext: 16, opts: ['plasmo', 'turgid', 'iso', 'cren'] },
    { k: 'iso', type: 'animal', ext: 52, opts: ['swell', 'cren', 'iso', 'lysed'] }
  ];
  var i = 0, cards = 0, pips = $('recPips').children;

  function show(n) {
    var f = SET[n], fld = Tonicity.field(f.ext, f.type);
    $('recField').innerHTML = fld.svg('fs', 'Slide ' + (n + 1) + ' of 6: a light microscope field. Name the state.');
    $('recMag').textContent = fld.mag;
    $('recCap').textContent = 'The caption appears after you answer.';
    $('recCount').textContent = 'Slide ' + (n + 1) + ' of ' + SET.length;
    $('recOut').hidden = true;
    delete $('recOpts').dataset.locked;
    AceLoop.options($('recOpts'), f.opts.map(function (k) { return NAMES[k]; }), function (j) { answer(j); });
  }
  function answer(j) {
    var f = SET[i], keyIdx = f.opts.indexOf(f.k), ok = j === keyIdx;
    AceLoop.reveal($('recOpts'), j, keyIdx);
    var fld = Tonicity.field(f.ext, f.type);
    $('recCap').innerHTML = '<b>' + NAMES[f.k] + '.</b> ' + fld.caption;
    pips[i].className = ok ? 'seen' : 'card';
    if (!ok) { cards++; AL.setDue(4); AL.toast('Card made: ' + NAMES[f.k].toLowerCase() + '. Back tomorrow, ' + AL.dayName(1) + '.'); }
    var last = i === SET.length - 1;
    $('recOut').innerHTML = '<div class="verdict ' + (ok ? 'good' : 'trap') + ' reveal-in" role="status"><div class="vh">' + AL.icon(ok ? 'good' : 'review', 'sm') +
      (ok ? 'Confirmed' : 'Needs review') + '</div>' +
      '<p><b>The tell:</b> ' + TELL[f.k] + (ok ? '' : ' It is now an Ace Card, with this slide on it.') + '</p></div>' +
      '<div class="stage-actions" style="margin-top:12px"><button class="btn gold" id="recNext" type="button">' +
      (last ? 'See what came with you' : 'Next slide ' + AL.icon('arrow', 'sm')) + '</button></div>';
    $('recOut').hidden = false;
    AL.follow($('recField'), { to: $('recOut'), prefer: 'end' });
    $('recNext').addEventListener('click', function () {
      if (last) {
        $('recOut').innerHTML = '<div class="verdict reveal-in" role="status"><div class="vh">' + AL.icon('keep', 'sm') + 'Six slides seen</div><p>' +
          (cards ? cards + ' came with you as Ace Cards. They come back tomorrow, each on a new field of the same state.' : 'None needed a card this time. The set comes back next week with new fields.') + '</p></div>';
        return;
      }
      i++; show(i);
    });
  }
  show(0);
  window.RecDemo = { answer: function (k) { var keyIdx = SET[i].opts.indexOf(k); $('recOpts').querySelectorAll('.opt')[keyIdx].click(); }, pickIdx: function (j) { $('recOpts').querySelectorAll('.opt')[j].click(); }, next: function () { $('recNext').click(); } };
})();
