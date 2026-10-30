/* =====================================================================
   Bio Recognize: "Which one is this?" (tonicity under the microscope)
   ---------------------------------------------------------------------
   Looking is the skill here. A set is eight true-to-life microscope
   fields (bio-real.js, seeded and bare: no caption, no solute strip),
   then two DAT-style questions that ask the same thing in words.
     - Each field is red blood cells or Elodea leaf cells in a
       hypotonic, isotonic or hypertonic solution (for red cells, a
       burst field counts as hypotonic). Every one of the six kinds comes
       up at least once, two of them twice, interleaved: never the same
       kind twice running, never three of one cell type or one state in
       a row. Each field has its own seed, so no two look the same, and
       how far the change has gone varies within the range where an
       expert would name it at a glance.
     - After a pick: Confirmed or Needs review, one or two sentences on
       what to look at in that picture, a ring around a cell that shows
       it, and the caption the field was drawn with.
     - A miss saves an Ace Card (addAceCard in bio-shared.js) with that
       exact field on its front and the question "What solution are
       these cells in?". One card per kind (cell type and state): a
       later miss of the same kind puts its new field on that card and
       brings it back due now, so the deck shows a fresh example each
       time and stays small.
     - The end names the kinds to look at again, in words, and offers
       another set with new seeds.
   No timer, no score, no percentage, no streak.

   Loaded after bio-shared.js and bio-real.js; runs after the Bio
   engine's own DOMContentLoaded init (listener order). Progress and
   history persist in STATE.recog through saveState(), so no new
   localStorage key exists. Mount: the element with id
   recognize-tonicity (bio-cell.html, right after the Tonicity Lab).
   ===================================================================== */
(function () {
  'use strict';

  var MOUNT = 'recognize-tonicity';
  var PICS = 8, WORDS = 2;
  var HUB_LINK = '/tools/bio/bio-cell.html#' + MOUNT;
  var STATES = ['hypo', 'iso', 'hyper'];
  var OPT = {
    hypo: { t: 'Hypotonic', s: 'less solute outside' },
    iso: { t: 'Isotonic', s: 'same solute in and out' },
    hyper: { t: 'Hypertonic', s: 'more solute outside' }
  };
  var CELL_NAME = { animal: 'red blood cells', plant: 'Elodea leaf cells' };
  // what to call each kind when it needs another look
  var KIND_NAME = {
    'animal-hypo': 'Red cells in dilute solution or pure water (hypotonic)',
    'animal-iso': 'Red cells in balanced saline (isotonic)',
    'animal-hyper': 'Red cells in salt water (hypertonic)',
    'plant-hypo': 'Plant cells in pond or pure water (hypotonic)',
    'plant-iso': 'Plant cells at the balance point (isotonic)',
    'plant-hyper': 'Plant cells in salt water (hypertonic)'
  };
  // the cue for each kind, in short, for the end of a set and the card's quick hit
  var KIND_CUE = {
    'animal-hypo': 'pale centers gone: plump cups, smooth spheres, or burst empty ghosts',
    'animal-iso': 'smooth discs, each with a round pale center',
    'animal-hyper': 'smaller cells with short, blunt bumps around the rim',
    'plant-hypo': 'green contents pressed flat on every wall, corners square',
    'plant-iso': 'some cells show a rounded outline just inside the corners; the rest fill their walls',
    'plant-hyper': 'green contents pulled off the end walls, held by thin strands'
  };

  /* ---------- small helpers ---------- */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function reducedMotion() {
    try {
      return typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { return false; }
  }
  // mulberry32: the same numbers for the same seed in every engine
  function seeded(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = Math.imul(a ^ (a >>> 15), a | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pick(R, list) { return list[Math.floor(R() * list.length)]; }
  function shuffle(R, list) {
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(R() * (i + 1)), t = list[i];
      list[i] = list[j]; list[j] = t;
    }
    return list;
  }

  /* ---------- the set: which fields, in which order ---------- */

  // the seed of the n-th set (0, 1, 2, ...): the same for everyone, new each set
  function setSeed(n) { return (0x2545F491 + Math.imul(n + 1, 0x9E3779B1)) >>> 0; }

  // interleaving: never the same kind twice running, never three of one
  // cell type or of one state in a row
  function interleaved(order) {
    for (var i = 1; i < order.length; i++) {
      if (order[i] === order[i - 1]) return false;
      if (i >= 2) {
        var c = order.slice(i - 2, i + 1).map(function (k) { return k.split('-')[0]; });
        var s = order.slice(i - 2, i + 1).map(function (k) { return k.split('-')[1]; });
        if (c[0] === c[1] && c[1] === c[2]) return false;
        if (s[0] === s[1] && s[1] === s[2]) return false;
      }
    }
    return true;
  }

  // How far along each field is, kept to where an expert names it at a
  // glance (the externalSolute the sandbox uses, cell = 50):
  //   red, hypotonic: 14 to 34 (cups narrowing to a slit, then spheres),
  //     or burst, 0 to 10 (ghosts; from 8 a tougher cell or two holds)
  //   red, hypertonic: 68 to 100 (crenated, bumps plain on every rim)
  //   Elodea, hypotonic: 0 to 44 (turgid); hypertonic: 65 to 100
  //     (plasmolysis, early to deep: every cell off its end walls)
  //   isotonic: 46 to 54
  function makeSet(seed) {
    var R = seeded(seed);
    var kinds = ['animal-hypo', 'animal-iso', 'animal-hyper', 'plant-hypo', 'plant-iso', 'plant-hyper'];
    // two more, one of each cell type, in two different states, so each
    // cell type comes up four times and the states three, three and two
    var s1 = Math.floor(R() * 3), s2 = (s1 + 1 + Math.floor(R() * 2)) % 3;
    if (R() < 0.5) { var t = s1; s1 = s2; s2 = t; }
    kinds.push('animal-' + STATES[s1], 'plant-' + STATES[s2]);
    var order = null;
    for (var tries = 0; tries < 500 && !order; tries++) {
      var o = shuffle(R, kinds.slice());
      if (interleaved(o)) order = o;
    }
    if (!order) order = ['animal-hypo', 'plant-iso', 'animal-hyper', 'plant-hypo', 'animal-iso', 'plant-hyper', 'animal-' + STATES[s1], 'plant-' + STATES[s2]];
    // red hypotonic twice: one swollen, one burst; once: burst about a third of the time
    var redHypo = order.filter(function (k) { return k === 'animal-hypo'; }).length;
    var burstFirst = R() < 0.5, seenRedHypo = 0;
    return order.map(function (kind, i) {
      var cell = kind.split('-')[0], state = kind.split('-')[1], ext, lysed = false;
      if (state === 'iso') ext = 46 + Math.floor(R() * 9);
      else if (state === 'hyper') ext = cell === 'animal' ? 68 + Math.floor(R() * 33) : 65 + Math.floor(R() * 36);
      else if (cell === 'plant') ext = Math.floor(R() * 45);
      else {
        lysed = redHypo > 1 ? (seenRedHypo++ === 0) === burstFirst : R() < 0.35;
        ext = lysed ? Math.floor(R() * 11) : 14 + Math.floor(R() * 21);
      }
      return { kind: kind, cell: cell, state: state, ext: ext, lysed: lysed,
        seed: (Math.imul(seed ^ 0x5bd1e995, i + 1) + Math.floor(R() * 1048576)) >>> 0 };
    });
  }

  function render(item, ns) {
    if (!window.BioReal || typeof window.BioReal.field !== 'function') return null;
    return window.BioReal.field({
      cellType: item.cell, externalSolute: item.ext, lysed: item.lysed,
      plasmolyzed: item.cell === 'plant' && item.ext > 60, seed: item.seed, bare: true, ns: ns
    });
  }

  /* ---------- what to look at ---------- */

  // the sub-stage a field shows, for the cue that fits it
  function stage(item) {
    if (item.cell === 'animal') {
      if (item.state === 'hypo') return item.lysed ? 'burst' : (item.ext <= 22 ? 'sphere' : 'cup');
      return item.state;
    }
    if (item.state === 'hyper') return item.ext <= 70 ? 'early' : 'deep';
    return item.state;
  }
  var CUE = {
    'animal-hyper': 'The circled cell is smaller than a normal disc and its rim is lined with short, blunt bumps (crenation). Water left it for the saltier outside: hypertonic.',
    'animal-iso': 'The circled cell is a smooth disc with a round pale center: the biconcave shape is intact. Water enters and leaves at the same rate: isotonic.',
    'animal-cup': 'The circled cell has lost its round pale center; only a narrow slit is left, and it looks plump. Water moved in, toward the solute inside: hypotonic.',
    'animal-sphere': 'The circled cell is a small, evenly dense sphere with no pale center at all: it has swollen with water. Water moved in, so the outside had less solute: hypotonic.',
    'animal-burst': 'The circled ring is an empty membrane (a ghost): the cell took in water until it burst, and its hemoglobin tints the background. Only a hypotonic solution does this.',
    'plant-hypo': 'In the outlined cell the green contents press right up to the wall, corners square, no gap anywhere: turgid. Water moved in (hypotonic); the wall keeps the cell from bursting.',
    'plant-iso': 'In the outlined cell a faint line with rounded corners sits just inside the wall: the membrane is only starting to leave the corners, and many cells show none. That balance point is isotonic.',
    'plant-early': 'In the outlined cell the green contents have pulled back from the end walls, held by thin strands: plasmolysis. Water left for the saltier outside: hypertonic.',
    'plant-deep': 'In the outlined cell the green contents have shrunk into a rounded mass well clear of the walls: plasmolysis. Water left for the saltier outside: hypertonic.'
  };
  function cue(item) { return CUE[item.cell + '-' + stage(item)]; }
  // the same cues for the Ace Card, whose picture has no ring on it
  var CARD_CUE = {
    'animal-hyper': 'These cells are smaller than normal discs, and their rims are lined with short, blunt bumps (crenation). Water left them for the saltier outside: hypertonic.',
    'animal-iso': 'These are smooth discs, each with a round pale center: the biconcave shape is intact. Water enters and leaves at the same rate: isotonic.',
    'animal-cup': 'These cells have lost their round pale centers; only a narrow slit is left, and they look plump. Water moved in, toward the solute inside: hypotonic.',
    'animal-sphere': 'These are small, evenly dense spheres with no pale center: swollen with water. Water moved in, so the outside had less solute: hypotonic.',
    'animal-burst': 'The faint empty rings are burst membranes (ghosts), and their hemoglobin tints the background. Cells burst only in a hypotonic solution.',
    'plant-hypo': 'In every cell the green contents press right up to the wall, corners square, no gap anywhere: turgid. Water moved in (hypotonic); the walls keep the cells from bursting.',
    'plant-iso': 'In some cells a faint line with rounded corners sits just inside the wall: the membrane is only starting to leave the corners, and the other cells show none. That balance point is isotonic.',
    'plant-early': 'The green contents have pulled back from the end walls, held by thin strands: plasmolysis. Water left for the saltier outside: hypertonic.',
    'plant-deep': 'The green contents have shrunk into rounded masses well clear of the walls: plasmolysis. Water left for the saltier outside: hypertonic.'
  };
  function cardCue(item) { return CARD_CUE[item.cell + '-' + stage(item)]; }
  // the card's quick hit: the answer and the one thing to see, for the stage on that card
  var QUICK = {
    'animal-hyper': 'Smaller cells with short, blunt bumps on the rim (crenated).',
    'animal-iso': 'Smooth discs, each with a round pale center.',
    'animal-cup': 'Pale centers narrowed to slits: the cells are swelling.',
    'animal-sphere': 'Smooth, dense spheres with no pale center: swollen with water.',
    'animal-burst': 'Faint empty ghosts: the cells took in water and burst.',
    'plant-hypo': 'Contents pressed flat on every wall, corners square (turgid).',
    'plant-iso': 'Some cells show a rounded line just inside the corners; the rest fill their walls.',
    'plant-early': 'Contents pulled off the end walls, held by thin strands (plasmolysis).',
    'plant-deep': 'Contents shrunk into rounded masses clear of the walls (plasmolysis).'
  };

  // one line on the look-alike that was picked
  var CONTRAST = {
    'animal-hyper-hypo': 'Swollen cells are round and smooth. Bumps and shrinking mean water left.',
    'animal-hyper-iso': 'A normal disc has a smooth rim. These rims are bumpy.',
    'animal-iso-hypo': 'Swollen cells lose the pale center. These still have it.',
    'animal-iso-hyper': 'Crenated cells have bumpy rims. These rims are smooth.',
    'animal-hypo-iso': 'A normal disc keeps a round pale center. These have lost it.',
    'animal-hypo-hyper': 'Shrunken cells have bumpy rims. These are smooth and full of water.',
    'animal-burst-iso': 'Normal cells are solid pink discs. Here only empty outlines are left.',
    'animal-burst-hyper': 'Crenated cells are still there, just bumpy. These burst, which only incoming water can do.',
    'plant-hyper-hypo': 'Turgid cells fill their walls. Here the contents have pulled away from them.',
    'plant-hyper-iso': 'At the balance point the membrane only leaves a few corners. Here it has left the end walls.',
    'plant-iso-hypo': 'Turgid cells have square corners everywhere. Here some cells show rounded corners pulling in.',
    'plant-iso-hyper': 'In salt water the contents pull off the end walls. Here they still fill the walls except at a few corners.',
    'plant-hypo-iso': 'At the balance point some cells show rounded corners pulling in. Here every corner is square and full.',
    'plant-hypo-hyper': 'In salt water the contents pull away from the walls. Here they press against them.'
  };
  function contrast(item, picked) {
    var head = item.cell + '-' + (stage(item) === 'burst' ? 'burst' : item.state);
    return CONTRAST[head + '-' + picked] || CONTRAST[item.kind + '-' + picked] || '';
  }

  /* ---------- the questions in words ---------- */

  // Original DAT-style stems that describe a field in words. kind: the
  // cell type and state the stem describes; the options are always the
  // three solution terms, in the same order as for the pictures.
  var WORDS_POOL = [
    { id: 'w-rbc-crenate', kind: 'animal-hyper',
      q: 'A drop of blood is mixed with a test solution. Under the microscope the red cells look smaller than usual, and their outlines are covered with short, blunt projections. The test solution is best described as:',
      why: 'Shrunken cells with blunt projections are crenated: water left the cells, so the solution held more solute than the cytoplasm (hypertonic).' },
    { id: 'w-rbc-burst', kind: 'animal-hypo',
      q: 'Red blood cells are placed in a test solution. Within minutes they lose their pale centers and round up into spheres, and many then leave only faint, empty membranes behind. Relative to the cytoplasm, the test solution is:',
      why: 'Swelling into spheres and bursting (hemolysis) means water rushed in, toward the higher solute inside the cells: the solution is hypotonic.' },
    { id: 'w-rbc-cup', kind: 'animal-hypo',
      q: 'In a test solution, red blood cells become plump and cup-shaped, and each pale center narrows to a slit. The test solution is best described as:',
      why: 'Cupping and losing the pale center are the first signs of swelling: water moved into the cells, so the solution had less solute (hypotonic).' },
    { id: 'w-rbc-disc', kind: 'animal-iso',
      q: 'After an hour in a test solution, red blood cells still appear as smooth biconcave discs with pale centers, and their volume has not changed. Relative to the cells, the solution is:',
      why: 'Unchanged discs mean no net water movement. Water still crosses the membrane, in and out at equal rates: the solution is isotonic.' },
    { id: 'w-elodea-plasm', kind: 'plant-hyper',
      q: 'A student mounts an Elodea leaf in a drop of concentrated salt water. In most cells the green contents shrink away from the cell walls into rounded masses, still joined to the walls by thin strands. The salt water is:',
      why: 'Contents pulling away from the wall is plasmolysis: water left the cells for the saltier outside, so the salt water is hypertonic.' },
    { id: 'w-onion-gap', kind: 'plant-hyper',
      q: 'Onion skin cells are placed in a test solution, and a clear space opens between each cell wall and its shrunken protoplast. Relative to the cell contents, the test solution is:',
      why: 'A shrunken protoplast pulled off its wall is plasmolysis, which happens only when water leaves for a solution with more solute: hypertonic. The wall lets the outside solution fill the space.' },
    { id: 'w-elodea-turgid', kind: 'plant-hypo',
      q: 'Elodea leaf cells taken from pond water look firm under the microscope: in every cell the chloroplast-filled contents press flat against the wall, with square corners and no gaps. Relative to the cell contents, the pond water is:',
      why: 'Contents pressed tightly on the wall mean the cells are turgid: water moved in from the pond water, which has less solute (hypotonic). The wall stops them from bursting.' },
    { id: 'w-elodea-balance', kind: 'plant-iso',
      q: 'Elodea leaf cells are moved into a sucrose solution. Afterward, about half of the cells show the membrane just starting to pull away at the corners, while the rest still fill their walls. This sucrose solution is closest to:',
      why: 'When about half the cells only just begin to pull away at the corners (incipient plasmolysis), the solution is taken as isotonic with the cell contents.' }
  ];
  var WORDS_BY_ID = {};
  WORDS_POOL.forEach(function (w) { WORDS_BY_ID[w.id] = w; });

  // Two stems for this set, chosen when the pictures are done: first the
  // kinds just missed (one red, one plant if both slipped), then others,
  // one of each cell type and two different states where possible. Same
  // set seed, same pair.
  function chooseWords(seed, missedKinds) {
    var R = seeded(seed ^ 0x1B873593), chosen = [];
    function take(list) {
      list = list.filter(function (w) { return chosen.indexOf(w) < 0; });
      if (list.length) chosen.push(pick(R, list));
    }
    var cellsUsed = function () { return chosen.map(function (w) { return w.kind.split('-')[0]; }); };
    missedKinds.forEach(function (k) {
      if (chosen.length >= WORDS || cellsUsed().indexOf(k.split('-')[0]) >= 0) return;
      take(WORDS_POOL.filter(function (w) { return w.kind === k; }));
    });
    while (chosen.length < WORDS) {
      var used = cellsUsed(), states = chosen.map(function (w) { return w.kind.split('-')[1]; });
      var otherCell = WORDS_POOL.filter(function (w) { return used.indexOf(w.kind.split('-')[0]) < 0; });
      var fresh = otherCell.filter(function (w) { return states.indexOf(w.kind.split('-')[1]) < 0; });
      take(fresh.length ? fresh : otherCell.length ? otherCell : WORDS_POOL);
    }
    return chosen.map(function (w) { return w.id; });
  }

  /* ---------- Bio engine bridges (bare-name globals, guarded) ---------- */

  function recogState() {
    if (typeof STATE === 'undefined' || !STATE) return null;
    var r = STATE.recog;
    if (!r || typeof r !== 'object') r = STATE.recog = {};
    if (typeof r.sets !== 'number') r.sets = 0;
    if (!Array.isArray(r.history)) r.history = [];
    if (!r.cards || typeof r.cards !== 'object') r.cards = {};
    return r;
  }
  function persist() {
    if (typeof saveState === 'function') { try { saveState(); } catch (e) { /* storage full or blocked */ } }
  }
  function openCard(id) {
    if (!id || typeof STATE === 'undefined' || !STATE || !Array.isArray(STATE.aceCards)) return null;
    for (var i = 0; i < STATE.aceCards.length; i++) {
      if (STATE.aceCards[i].id === id && !STATE.aceCards[i].closed) return STATE.aceCards[i];
    }
    return null;
  }

  /* ---------- the card ---------- */

  // The card: the field on the front with its own ids (rqc plus the
  // field's seed, so no two cards and no live field share one), inline
  // styles only (the card can show on any hub), and no look ring.
  function cardParts(item) {
    var f = render(item, 'rqc' + item.seed.toString(36));
    var answer = OPT[item.state].t;
    var pic = f ? '<span style="display:block;margin-top:12px;border-radius:8px;overflow:hidden;background:#141714">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + f.viewBox + '" role="img" aria-label="Microscope field of ' +
      CELL_NAME[item.cell] + '" style="display:block;width:100%;height:auto;font-family:\'DM Sans\',system-ui,sans-serif;font-weight:400;letter-spacing:0">' +
      f.svg + '</svg></span>' : '';
    return {
      q: '<span style="display:block">What solution are these cells in?</span>' + pic,
      quickHit: '<b>' + answer + '.</b> ' + esc(QUICK[item.cell + '-' + stage(item)]),
      why: cardCue(item),
      explanation: '<p>' + esc(cardCue(item)) + '</p>' +
        (f ? '<p><b>Caption:</b> ' + esc(f.caption) + '</p>' : '') +
        '<p><a href="' + HUB_LINK + '" style="display:inline-block;min-height:44px;padding:10px 0;color:#E2C97A;font-weight:700;text-decoration:underline">Practice more fields</a></p>'
    };
  }
  // A miss: one card per kind. A new kind gets a new card through
  // addAceCard (due now). A kind that already has an open card gets this
  // field put on it and comes back due now, one more lapse on it.
  function saveMiss(rec, item, nodeId) {
    var parts = cardParts(item), card = openCard(rec.cards[item.kind]);
    if (card) {
      card.q = parts.q;
      card.quickHit = parts.quickHit;
      card.explanation = parts.explanation;
      card.why = parts.why;
      card.lapses = (card.lapses || 0) + 1;
      if (card.state !== 'new') { card.state = 'learning'; card.interval = 0; }
      card.nextDue = Date.now();
      card.flipped = false;
      persist();
      if (typeof renderAceStack === 'function') { try { renderAceStack(); } catch (e) { /* no stack on this page */ } }
      return card;
    }
    if (typeof addAceCard !== 'function') return null;
    try {
      card = addAceCard({
        q: parts.q, quickHit: parts.quickHit, explanation: parts.explanation, why: parts.why,
        origin: 'Which one is this: Tonicity', subject: 'cell', nodeId: nodeId
      });
    } catch (e) { card = null; }
    if (card) rec.cards[item.kind] = card.id;
    return card;
  }

  /* ---------- the panel ---------- */

  function Panel(mount) {
    this.mount = mount;
    this.node = document.createElement('section');
    this.node.className = 'rq';
    this.node.setAttribute('aria-label', 'Which one is this? Tonicity under the microscope');
    mount.appendChild(this.node);
    var sec = mount.closest ? mount.closest('section.node[data-node]') : null;
    this.nodeId = sec ? sec.getAttribute('data-node') : '';
  }

  // the set in progress (a new one if there is none)
  Panel.prototype.current = function () {
    var rec = recogState();
    if (!rec) return null;
    if (!rec.cur || typeof rec.cur.seed !== 'number' || !Array.isArray(rec.cur.answers)) {
      rec.cur = { seed: setSeed(rec.sets), answers: [], words: null };
    }
    this.items = makeSet(rec.cur.seed);
    return rec.cur;
  };

  Panel.prototype.head = function (sub) {
    return '<div class="rq-head"><span class="rq-kicker">Which one is this?</span>' +
      '<span class="rq-title">Tonicity under the microscope</span></div>' +
      (sub ? '<p class="rq-sub">' + sub + '</p>' : '');
  };

  Panel.prototype.dots = function (at) {
    var out = '';
    for (var i = 0; i < PICS + WORDS; i++) {
      out += '<span class="rq-dot' + (i < at ? ' is-past' : i === at ? ' is-now' : '') + (i === PICS ? ' is-gap' : '') + '"></span>';
    }
    return '<div class="rq-dots" aria-hidden="true">' + out + '</div>';
  };

  Panel.prototype.render = function () {
    var cur = this.current();
    if (!cur) { this.node.innerHTML = this.head('This practice needs the Bio engine to load.'); return; }
    var at = cur.answers.length;
    if (at >= PICS + WORDS) return this.renderEnd();
    if (at < PICS) return this.renderPicture(at);
    return this.renderWords(at - PICS);
  };

  Panel.prototype.options = function (labelId, words) {
    return '<div class="rq-opts" role="group" aria-labelledby="' + labelId + '">' + STATES.map(function (s) {
      return '<button type="button" class="rq-opt" data-s="' + s + '"><span class="rq-opt-t">' + OPT[s].t +
        (words ? ' to the cells' : '') + '</span><span class="rq-opt-s">' + OPT[s].s + '</span></button>';
    }).join('') + '</div>';
  };

  Panel.prototype.bind = function (onPick) {
    var self = this;
    Array.prototype.forEach.call(this.node.querySelectorAll('.rq-opt'), function (b) {
      b.addEventListener('click', function () {
        if (self.locked) return;
        onPick(b.getAttribute('data-s'));
      });
    });
  };

  Panel.prototype.renderPicture = function (i) {
    var item = this.items[i], self = this;
    var f = render(item, 'rqa');
    this.locked = false;
    this.node.className = 'rq is-asking';
    this.node.innerHTML = this.head(i === 0 ? 'Name the solution each field of cells is sitting in. Eight fields, then two questions in words.' : '') +
      this.dots(i) +
      '<p class="rq-pos" id="rq-pos" tabindex="-1">Field ' + (i + 1) + ' of ' + PICS + '</p>' +
      '<div class="rq-body"><figure class="rq-fig">' +
      (f ? '<svg class="rq-svg" viewBox="' + f.viewBox + '" role="img" aria-label="Microscope field ' + (i + 1) + ' of ' + PICS + ': ' +
        CELL_NAME[item.cell] + '">' + f.svg + '</svg>' : '<p class="rq-sub">The microscope view could not load.</p>') +
      '<figcaption class="rq-cap" hidden></figcaption></figure>' +
      '<div class="rq-side"><p class="rq-q" id="rq-q">What solution are these cells in?</p>' +
      this.options('rq-q', false) +
      '<div class="rq-fb" aria-live="polite"></div>' +
      '<div class="rq-actions"></div></div></div>';
    this.field = f;
    this.bind(function (s) { self.answerPicture(i, s); });
  };

  Panel.prototype.lock = function (picked, key) {
    this.locked = true;
    Array.prototype.forEach.call(this.node.querySelectorAll('.rq-opt'), function (b) {
      var s = b.getAttribute('data-s');
      b.setAttribute('aria-disabled', 'true');
      if (s === picked) { b.classList.add('is-picked'); b.setAttribute('aria-pressed', 'true'); }
      if (s === key) b.classList.add('is-key');
    });
  };

  // the look mark, in the field's own units: a ring around a red cell, a
  // frame just outside an Elodea cell's walls (so its corners stay in view)
  function ring(look, ns) {
    if (!look) return '';
    var shape = look.pts
      ? '<path d="M' + look.pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join('L') + 'Z" stroke-linejoin="round"'
      : '<ellipse cx="' + look.x.toFixed(1) + '" cy="' + look.y.toFixed(1) + '" rx="' + look.rx.toFixed(1) + '" ry="' + look.ry.toFixed(1) + '"';
    // kept inside the camera crop (the field's own clip), in case a frame runs past it
    return '<g class="rq-ring" fill="none" clip-path="url(#' + ns + '-clip)">' + shape + ' stroke="#141714" stroke-opacity="0.55" stroke-width="5.5"/>' +
      shape + ' stroke="#E2C97A" stroke-width="2.6"/></g>';
  }

  Panel.prototype.answerPicture = function (i, picked) {
    var item = this.items[i], rec = recogState(), cur = rec.cur, ok = picked === item.state;
    this.lock(picked, item.state);
    var saved = null;
    if (!ok) saved = saveMiss(rec, item, this.nodeId);
    cur.answers[i] = { p: picked, ok: ok };
    persist();
    var svg = this.node.querySelector('.rq-svg');
    if (svg && this.field) {
      svg.insertAdjacentHTML('beforeend', ring(this.field.look, 'rqa'));
      svg.setAttribute('aria-label', 'Microscope field ' + (i + 1) + ' of ' + PICS + ': ' + this.field.caption);
    }
    var cap = this.node.querySelector('.rq-cap');
    if (cap && this.field) { cap.textContent = 'Caption: ' + this.field.caption; cap.hidden = false; }
    var line = ok ? '' : contrast(item, picked);
    this.feedback(ok, OPT[item.state].t, cue(item), line,
      ok ? '' : (saved ? 'Saved to your Ace Cards with this field on it.' : ''));
    this.next(i + 1 < PICS ? 'Next field' : 'On to the questions in words');
  };

  Panel.prototype.feedback = function (ok, answer, why, trap, saved) {
    var fb = this.node.querySelector('.rq-fb');
    fb.innerHTML = '<div class="rq-verdict ' + (ok ? 'is-ok' : 'is-review') + '">' +
      '<span class="rq-lbl">' + (ok ? 'Confirmed' : 'Needs review') + '</span>' +
      '<span class="rq-key">' + esc(answer) + '</span></div>' +
      '<p class="rq-why">' + esc(why) + '</p>' +
      (trap ? '<p class="rq-trap">' + esc(trap) + '</p>' : '') +
      (saved ? '<p class="rq-saved">' + esc(saved) + '</p>' : '');
  };

  Panel.prototype.next = function (label) {
    var self = this, box = this.node.querySelector('.rq-actions');
    box.innerHTML = '<button type="button" class="rq-btn rq-next">' + esc(label) + '</button>';
    box.querySelector('.rq-next').addEventListener('click', function () { self.advance(); });
  };

  Panel.prototype.advance = function () {
    this.render();
    var pos = this.node.querySelector('#rq-pos') || this.node.querySelector('.rq-end');
    try { this.node.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' }); } catch (e) { /* old browsers */ }
    if (pos && pos.focus) { try { pos.focus({ preventScroll: true }); } catch (e) { pos.focus(); } }
  };

  Panel.prototype.wordIds = function () {
    var rec = recogState(), cur = rec.cur, self = this;
    if (!Array.isArray(cur.words) || cur.words.length !== WORDS || !cur.words.every(function (id) { return WORDS_BY_ID[id]; })) {
      var missed = [];
      for (var i = 0; i < PICS; i++) {
        var a = cur.answers[i];
        if (a && !a.ok && missed.indexOf(self.items[i].kind) < 0) missed.push(self.items[i].kind);
      }
      cur.words = chooseWords(cur.seed, missed);
      persist();
    }
    return cur.words;
  };

  Panel.prototype.renderWords = function (j) {
    var w = WORDS_BY_ID[this.wordIds()[j]], self = this;
    this.locked = false;
    this.node.className = 'rq is-asking is-words';
    this.node.innerHTML = this.head('') + this.dots(PICS + j) +
      '<p class="rq-pos" id="rq-pos" tabindex="-1">In words, ' + (j + 1) + ' of ' + WORDS + '</p>' +
      '<p class="rq-q rq-stem" id="rq-q">' + esc(w.q) + '</p>' +
      this.options('rq-q', true) +
      '<div class="rq-fb" aria-live="polite"></div>' +
      '<div class="rq-actions"></div>';
    this.bind(function (s) { self.answerWords(j, w, s); });
  };

  Panel.prototype.answerWords = function (j, w, picked) {
    var rec = recogState(), cur = rec.cur, state = w.kind.split('-')[1], ok = picked === state;
    this.lock(picked, state);
    cur.answers[PICS + j] = { p: picked, ok: ok, w: w.id };
    if (cur.answers.length >= PICS + WORDS) this.finish();
    persist();
    this.feedback(ok, OPT[state].t + ' to the cells', w.why, '', '');
    this.next(j + 1 < WORDS ? 'Next question' : 'See what to look at again');
  };

  // the set is done: keep a short history (the last 20 sets)
  Panel.prototype.finish = function () {
    var rec = recogState(), cur = rec.cur, self = this, missed = [];
    cur.answers.forEach(function (a, i) {
      if (!a || a.ok) return;
      var kind = i < PICS ? self.items[i].kind : (WORDS_BY_ID[a.w] || {}).kind;
      if (kind && missed.indexOf(kind) < 0) missed.push(kind);
    });
    cur.done = true;
    rec.history.push({ at: Date.now(), seed: cur.seed, look: missed });
    if (rec.history.length > 20) rec.history = rec.history.slice(-20);
  };

  Panel.prototype.renderEnd = function () {
    var rec = recogState(), last = rec.history.length ? rec.history[rec.history.length - 1] : null, self = this;
    var look = last && last.seed === rec.cur.seed ? last.look : [];
    var body = look.length
      ? '<p class="rq-end-t">Look at these again:</p><ul class="rq-review">' + look.map(function (k) {
        return '<li><b>' + esc(KIND_NAME[k]) + ': look again.</b> <span>' + esc(KIND_CUE[k].charAt(0).toUpperCase() + KIND_CUE[k].slice(1)) + '.</span></li>';
      }).join('') + '</ul><p class="rq-saved">Each field that needs another look is in your Ace Cards, with that picture on it.</p>'
      : '<p class="rq-end-t">Every field named, and both questions in words. Another set brings new fields and new look-alikes.</p>';
    this.node.className = 'rq is-end';
    this.node.innerHTML = this.head('') + this.dots(PICS + WORDS) +
      '<div class="rq-end" tabindex="-1"><p class="rq-pos">Set done</p>' + body + '</div>' +
      '<div class="rq-actions"><button type="button" class="rq-btn rq-again">Another set</button>' +
      '<a class="rq-btn rq-btn-quiet" href="#aceCardsSection">Open Ace Cards</a></div>';
    this.node.querySelector('.rq-again').addEventListener('click', function () { self.another(); });
  };

  Panel.prototype.another = function () {
    var rec = recogState();
    rec.sets += 1;
    rec.cur = { seed: setSeed(rec.sets), answers: [], words: null };
    persist();
    this.advance();
  };

  /* ---------- boot ---------- */

  var panel = null;
  function boot() {
    var mount = document.getElementById(MOUNT);
    if (!mount || panel) return;
    try {
      panel = new Panel(mount);
      panel.render();
    } catch (e) { if (window.console) console.warn('[bio-recognize] panel failed', e.message); }
    window.BioRecognize.panel = panel;
  }

  // makeSet, chooseWords, card and the word pool are exposed for the tests
  window.BioRecognize = { boot: boot, panel: null, makeSet: makeSet, setSeed: setSeed, chooseWords: chooseWords,
    card: cardParts, words: WORDS_POOL, kindName: KIND_NAME, version: 1 };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
