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
     - Each miss saves one Ace Card (addAceCard in bio-shared.js). A
       field's card has that exact field on its front and the question
       "What solution are these cells in?"; a question in words gets a
       text card with its stem. At most CARD_CAP recognition cards stay
       open: past that, a miss takes over the oldest card from an
       earlier set (the same look first, then the same kind) and brings
       it back due now. A card made in the same set is never written over.
     - The end names the kinds to look at again, in words, says which
       misses went to the Ace Cards (only when they did), and offers
       another set with new seeds. The questions in words avoid the stems
       of the last few sets.
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
  // the most recognition cards left open at once, and how many past sets'
  // questions in words to keep out of the next pair
  var CARD_CAP = 12, RECENT_SETS = 3;
  var ORIGIN = 'Which one is this: Tonicity';
  var HUB_LINK = '/tools/bio/bio-cell.html#' + MOUNT;
  var STATES = ['hypo', 'iso', 'hyper'];
  var OPT = {
    hypo: { t: 'Hypotonic', s: 'less solute outside' },
    iso: { t: 'Isotonic', s: 'equal solute in and out' },
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
  // what to call a kind missed only in words, whose stems also cover
  // cheek cells, onion, celery and potato
  var WORDS_NAME = {
    'animal-hypo': 'Animal cells in pure water or dilute solution (hypotonic)',
    'animal-iso': 'Animal cells in balanced saline (isotonic)',
    'animal-hyper': 'Animal cells in concentrated salt (hypertonic)',
    'plant-hypo': 'Plant cells in pond or pure water (hypotonic)',
    'plant-iso': 'Plant cells at the balance point (isotonic)',
    'plant-hyper': 'Plant cells in concentrated salt or sugar (hypertonic)'
  };
  // the cue for each kind, in short, for the end of a set
  var KIND_CUE = {
    'animal-hypo': 'pale centers gone: plump cups, smooth spheres, or burst empty ghosts',
    'animal-iso': 'smooth discs, each with a round pale center',
    'animal-hyper': 'smaller cells with short, blunt bumps around the rim',
    'plant-hypo': 'green contents pressed flat on every wall, corners square',
    'plant-iso': 'flaccid: some cells show a rounded outline just inside the corners; the rest fill their walls',
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
  // the Bio engine's clock (_now in bio-shared.js) when it is there
  function now() { return typeof _now === 'function' ? _now() : Date.now(); }
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

  // the sub-stage a field shows, for the cue that fits it. Elodea in salt
  // water stays a long capsule near its side walls until about ext 85;
  // only past that is it drawn in from the sides as well ('deep').
  var DEEP_FROM = 86;
  function stage(item) {
    if (item.cell === 'animal') {
      if (item.state === 'hypo') return item.lysed ? 'burst' : (item.ext <= 22 ? 'sphere' : 'cup');
      return item.state;
    }
    if (item.state === 'hyper') return item.ext < DEEP_FROM ? 'early' : 'deep';
    return item.state;
  }
  var CUE = {
    'animal-hyper': 'The circled cell is smaller than a normal disc and its rim is lined with short, blunt bumps (crenation). Water left it for the saltier outside: hypertonic.',
    'animal-iso': 'The circled cell is a smooth disc with a round pale center: the biconcave shape is intact. Water enters and leaves at the same rate: isotonic.',
    'animal-cup': 'The circled cell has lost its round pale center; only a narrow slit is left, and it looks plump. Water moved in, toward the solute inside: hypotonic.',
    'animal-sphere': 'The circled cell is a small, evenly dense sphere with no pale center at all: it has swollen with water. Water moved in, so the outside had less solute: hypotonic.',
    'animal-burst': 'The circled ring is an empty membrane (a ghost): the cell took in water until it burst and lost its hemoglobin. Only a hypotonic solution does this.',
    'plant-hypo': 'In the outlined cell the green contents press right up to the wall, corners square, no gap anywhere: turgid. Water moved in (hypotonic); the wall keeps the cell from bursting.',
    'plant-iso': 'In the outlined cell a faint line with rounded corners sits just inside the wall: the membrane is only starting to leave the corners, and many cells show none. The cells are flaccid, no longer pressed firm: that balance point is isotonic.',
    'plant-early': 'In the outlined cell the green contents have pulled back from the end walls, held by thin strands: plasmolysis. Water left for the saltier outside: hypertonic.',
    'plant-deep': 'In the outlined cell the green contents have pulled away from the end walls and in from the side walls, into a narrow rounded mass: plasmolysis. Water left for the saltier outside: hypertonic.'
  };
  function cue(item) { return CUE[item.cell + '-' + stage(item)]; }
  // the same cues for the Ace Card, whose picture has no ring on it
  var CARD_CUE = {
    'animal-hyper': 'These cells are smaller than normal discs, and their rims are lined with short, blunt bumps (crenation). Water left them for the saltier outside: hypertonic.',
    'animal-iso': 'These are smooth discs, each with a round pale center: the biconcave shape is intact. Water enters and leaves at the same rate: isotonic.',
    'animal-cup': 'These cells have lost their round pale centers; only a narrow slit is left, and they look plump. Water moved in, toward the solute inside: hypotonic.',
    'animal-sphere': 'These are small, evenly dense spheres with no pale center: swollen with water. Water moved in, so the outside had less solute: hypotonic.',
    'animal-burst': 'The faint empty rings are burst membranes (ghosts): the cells took in water until they burst and lost their hemoglobin. Cells burst only in a hypotonic solution.',
    'plant-hypo': 'In every cell the green contents press right up to the wall, corners square, no gap anywhere: turgid. Water moved in (hypotonic); the walls keep the cells from bursting.',
    'plant-iso': 'In some cells a faint line with rounded corners sits just inside the wall: the membrane is only starting to leave the corners, and the other cells show none. The cells are flaccid, no longer pressed firm: that balance point is isotonic.',
    'plant-early': 'The green contents have pulled back from the end walls, held by thin strands: plasmolysis. Water left for the saltier outside: hypertonic.',
    'plant-deep': 'The green contents have pulled away from the end walls and in from the side walls, into narrow rounded masses: plasmolysis. Water left for the saltier outside: hypertonic.'
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
    'plant-iso': 'Flaccid: some cells show a rounded line just inside the corners; the rest fill their walls.',
    'plant-early': 'Contents pulled off the end walls, held by thin strands (plasmolysis).',
    'plant-deep': 'Contents pulled off the end walls and in from the sides (plasmolysis).'
  };

  // one line on the look-alike that was picked
  var CONTRAST = {
    'animal-hyper-hypo': 'Swollen cells are round and smooth. Bumps and shrinking mean water left.',
    'animal-hyper-iso': 'A normal disc has a smooth rim. These rims are bumpy.',
    'animal-iso-hypo': 'Swollen cells lose the pale center. These still have it.',
    'animal-iso-hyper': 'Crenated cells have bumpy rims. These rims are smooth.',
    'animal-hypo-iso': 'A normal disc keeps a round pale center. These have lost it.',
    'animal-hypo-hyper': 'Shrunken cells have bumpy rims. These are smooth and full of water.',
    'animal-burst-iso': 'Normal cells are full pink discs with pale centers. Here only empty outlines are left.',
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

  // Original DAT-style stems that describe cells in words. kind: the cell
  // type and state the stem describes; the options are always the three
  // solution terms, in the same order as for the pictures, and every stem
  // asks about the solution compared with the cells. Four or more stems
  // per kind, over red cells, cheek cells, Elodea, onion, lettuce, celery
  // and potato, and over pure water, saline strengths, salt and sucrose,
  // so a kind missed set after set meets a new sentence for RECENT_SETS sets.
  var WORDS_POOL = [
    // red and cheek cells, hypertonic
    { id: 'w-rbc-crenate', kind: 'animal-hyper',
      q: 'A drop of blood is mixed with a test solution. Under the microscope the red cells look smaller than usual, and their outlines are covered with short, blunt projections. The test solution is best described as:',
      why: 'Shrunken cells with blunt projections are crenated: water left the cells, so the solution held more solute than the cytoplasm (hypertonic).' },
    { id: 'w-rbc-3nacl', kind: 'animal-hyper',
      q: 'Red blood cells are suspended in 3% NaCl. Within minutes they shrink, and their smooth rims turn spiky with short projections. Compared with the cytoplasm, the 3% NaCl is:',
      why: 'Shrinking with spiky projections (crenation) means water left the cells, toward the side with more solute: 3% NaCl is hypertonic. Normal saline, about 0.9% NaCl, is the isotonic one.' },
    { id: 'w-cheek-shrink', kind: 'animal-hyper',
      q: 'Cheek cells scraped onto a slide are covered with a drop of concentrated salt solution. Over a few minutes each flat cell shrinks and its outline wrinkles. Which term best describes the salt solution, relative to the cells?',
      why: 'An animal cell has no wall, so it simply shrinks when water leaves it. Water left for the saltier outside: the solution is hypertonic.' },
    { id: 'w-rbc-volume', kind: 'animal-hyper',
      q: 'In an experiment, the volume of red blood cells falls by about a quarter after they are moved into a test solution, and the cells look shrunken and crenated. Relative to the cells, the test solution is:',
      why: 'A drop in volume with crenation means net water loss. Water leaves a cell only for a solution with more solute: hypertonic.' },
    // red and cheek cells, hypotonic
    { id: 'w-rbc-burst', kind: 'animal-hypo',
      q: 'Red blood cells are placed in a test solution. Within minutes they lose their pale centers and round up into spheres, and many then leave only faint, empty membranes behind. Relative to the cytoplasm, the test solution is:',
      why: 'Swelling into spheres and bursting (hemolysis) means water rushed in, toward the higher solute inside the cells: the solution is hypotonic.' },
    { id: 'w-rbc-cup', kind: 'animal-hypo',
      q: 'In a test solution, red blood cells become plump and cup-shaped, and each pale center narrows to a slit. The test solution is best described as:',
      why: 'Cupping and losing the pale center are the first signs of swelling: water moved into the cells, so the solution had less solute (hypotonic).' },
    { id: 'w-rbc-water', kind: 'animal-hypo',
      q: 'A technician adds distilled water to a sample of red blood cells. A few minutes later the cloudy suspension has turned clear red, and the microscope shows only faint, empty outlines. Relative to the cells, distilled water is:',
      why: 'Clear red fluid and empty outlines mean the cells burst (hemolysis) and released their hemoglobin: water rushed in toward the solute inside. Distilled water has no solute, so it is hypotonic.' },
    { id: 'w-cheek-swell', kind: 'animal-hypo',
      q: 'Cheek epithelial cells are mounted in distilled water. They swell and round up, and some burst. The distilled water is best described as:',
      why: 'Animal cells have no wall to resist swelling. Water entered, toward the higher solute inside, so the water is hypotonic; enough of it bursts the cells.' },
    { id: 'w-rbc-half', kind: 'animal-hypo',
      q: 'Red blood cells are placed in 0.45% NaCl, half the strength of normal saline. Their pale centers fade as they swell toward spheres. Compared with the cells, 0.45% NaCl is:',
      why: 'Swelling means water moved in, toward the higher solute inside. Half-strength saline has less solute than the cytoplasm: hypotonic.' },
    // red and cheek cells, isotonic
    { id: 'w-rbc-disc', kind: 'animal-iso',
      q: 'After an hour in a test solution, red blood cells still appear as smooth biconcave discs with pale centers, and their volume has not changed. Relative to the cells, the solution is:',
      why: 'Unchanged discs mean no net water movement. Water still crosses the membrane, in and out at equal rates: the solution is isotonic.' },
    { id: 'w-rbc-saline', kind: 'animal-iso',
      q: 'A blood sample is diluted in 0.9% NaCl (normal saline) before the cells are counted. The red cells keep their size and their pale centers. Which term describes 0.9% NaCl relative to the cells?',
      why: 'Cells that keep their size and biconcave shape gain and lose water at equal rates. Normal saline, about 0.9% NaCl, is isotonic to red cells, which is why it is used to dilute blood and as an IV fluid.' },
    { id: 'w-cheek-same', kind: 'animal-iso',
      q: 'Cheek cells are mounted in a test solution and watched for ten minutes. Their size and their outlines do not change at all. Relative to the cells, the test solution is:',
      why: 'No change in size means no net water movement: water enters and leaves at equal rates, so the solution is isotonic.' },
    { id: 'w-rbc-sucrose', kind: 'animal-iso',
      q: 'Red blood cells are placed in about 0.3 M sucrose, a solute that cannot cross their membranes. They neither swell nor shrink, although water keeps crossing the membrane in both directions. The sucrose solution is:',
      why: 'Water crossing both ways at equal rates gives no net change: the solution is isotonic. Water movement does not stop at isotonic; only the net flow does.' },
    // Elodea, onion and other plant cells, hypertonic
    { id: 'w-elodea-plasm', kind: 'plant-hyper',
      q: 'A student mounts an Elodea leaf in a drop of concentrated salt water. In most cells the green contents shrink away from the cell walls into rounded masses, still joined to the walls by thin strands. The salt water is:',
      why: 'Contents pulling away from the wall is plasmolysis: water left the cells for the saltier outside, so the salt water is hypertonic.' },
    { id: 'w-onion-gap', kind: 'plant-hyper',
      q: 'Onion skin cells are placed in a test solution, and a clear space opens between each cell wall and its shrunken protoplast. Relative to the cell contents, the test solution is:',
      why: 'A shrunken protoplast pulled off its wall is plasmolysis, which happens only when water leaves for a solution with more solute: hypertonic. The wall lets the outside solution fill the space.' },
    { id: 'w-elodea-sugar', kind: 'plant-hyper',
      q: 'An Elodea leaf is mounted in 1 M sucrose. After ten minutes the chloroplasts in each cell are packed into a smaller green mass, with a clear space between it and the cell wall. Compared with the cells, the sucrose solution is:',
      why: 'The protoplast shrank away from the wall (plasmolysis), so water left the cells. Water leaves for the side with more solute: 1 M sucrose is hypertonic.' },
    { id: 'w-lettuce-salt', kind: 'plant-hyper',
      q: 'Lettuce leaves left in heavily salted water go limp. Under the microscope their cells show the membrane and contents pulled away from the walls. Relative to the cells, the salted water is:',
      why: 'Limp leaves and contents pulled off the walls (plasmolysis) mean the cells lost water to the salty outside: the salted water is hypertonic.' },
    // Elodea, onion and other plant cells, hypotonic
    { id: 'w-elodea-turgid', kind: 'plant-hypo',
      q: 'Elodea leaf cells taken from pond water look firm under the microscope: in every cell the chloroplast-filled contents press flat against the wall, with square corners and no gaps. Relative to the cell contents, the pond water is:',
      why: 'Contents pressed tightly on the wall mean the cells are turgid: water moved in from the pond water, which has less solute (hypotonic). The wall stops them from bursting.' },
    { id: 'w-onion-water', kind: 'plant-hypo',
      q: 'Onion skin is peeled and mounted in distilled water. In each cell the membrane presses outward against the wall, and the tissue is firm, yet no cell bursts. Relative to the cell contents, distilled water is:',
      why: 'Water moved in, toward the solute inside, until the stretched wall pushed back (turgor pressure). Water moving in means the outside is hypotonic; the wall is why plant cells do not burst.' },
    { id: 'w-celery-crisp', kind: 'plant-hypo',
      q: 'A wilted celery stalk stands overnight in a glass of tap water and becomes crisp again. Under the microscope its cells now have their contents pressed against every wall. Compared with the cell contents, the tap water is:',
      why: 'Crisp tissue and contents pressed on every wall mean the cells took in water and became turgid. Water moved in, so the tap water is hypotonic to the cells.' },
    { id: 'w-elodea-back', kind: 'plant-hypo',
      q: 'Plasmolyzed Elodea cells are rinsed and mounted again in pond water. Within minutes the green contents swell back out until they fill each cell, corners and all. Compared with the cell contents, the pond water is:',
      why: 'The contents refilled their walls (plasmolysis reversed), so water moved into the cells. Water moves in only from a solution with less solute: hypotonic.' },
    // Elodea, onion and other plant cells, isotonic
    { id: 'w-elodea-balance', kind: 'plant-iso',
      q: 'Elodea leaf cells are moved into a sucrose solution. Afterward, about half of the cells show the membrane just starting to pull away at the corners, while the rest still fill their walls. This sucrose solution is closest to:',
      why: 'When about half the cells only just begin to pull away at the corners (incipient plasmolysis), the solution is taken as isotonic with the cell contents.' },
    { id: 'w-onion-flaccid', kind: 'plant-iso',
      q: 'Onion skin cells in a test solution are flaccid: their contents still touch the walls, but the cells are soft rather than firm, and they neither gain nor lose water overall. The test solution is:',
      why: 'Flaccid cells with no net water gain or loss sit at the balance point: the solution is isotonic. Plant cells are firm (turgid) only in a hypotonic solution.' },
    { id: 'w-potato-mass', kind: 'plant-iso',
      q: 'Potato strips are weighed, soaked for an hour in several sucrose solutions, and weighed again. In one solution the strips neither gain nor lose mass, and their cells are flaccid but not plasmolyzed. That solution is:',
      why: 'No change in mass means no net water movement, the mark of an isotonic solution. Strips gain mass in hypotonic solutions and lose it in hypertonic ones.' },
    { id: 'w-elodea-flaccid', kind: 'plant-iso',
      q: 'Elodea leaves are moved from pond water into a test solution. The cells lose their firmness and turn flaccid, yet their contents still touch the walls, with no clear gap anywhere. Compared with the cell contents, the test solution is closest to:',
      why: 'Flaccid cells with no gap at the walls have no turgor and no plasmolysis: no net water flow, so the solution is isotonic. In pond water (hypotonic) they were turgid.' }
  ];
  var WORDS_BY_ID = {};
  WORDS_POOL.forEach(function (w) { WORDS_BY_ID[w.id] = w; });
  // a text card's quick hit, by kind (also the cue at the end of a set
  // for a kind missed only in words)
  var WORDS_HIT = {
    'animal-hyper': 'Shrunken, crenated cells: water left for the saltier outside.',
    'animal-hypo': 'Swelling, spheres or burst ghosts: water rushed in.',
    'animal-iso': 'Unchanged size and shape: water in and out at equal rates.',
    'plant-hyper': 'Contents pulled off the walls (plasmolysis): water left.',
    'plant-hypo': 'Contents pressed on every wall (turgid): water moved in.',
    'plant-iso': 'Flaccid, at most pulling from a few corners: no net flow.'
  };

  // Two stems for this set, chosen when the pictures are done: first the
  // kinds just missed (one red, one plant if both slipped), then others,
  // one of each cell type and two different states where possible. Stems
  // in recent (the last few sets' ids) are passed over while another stem
  // fits. Same set seed, misses and recent ids, same pair.
  function chooseWords(seed, missedKinds, recent) {
    var R = seeded(seed ^ 0x1B873593), chosen = [];
    recent = Array.isArray(recent) ? recent : [];
    function take(list) {
      list = list.filter(function (w) { return chosen.indexOf(w) < 0; });
      var fresh = list.filter(function (w) { return recent.indexOf(w.id) < 0; });
      if (fresh.length) list = fresh;
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
    // r.cards: one entry per open recognition card, oldest first:
    // { id, kind, look (the stage shown, or a stem id), src ('pic' or
    // 'words'), set (the seed of the set that last saved it) }. An earlier
    // build kept one card id per kind; those carry over as old pictures.
    if (!Array.isArray(r.cards)) {
      var old = r.cards && typeof r.cards === 'object' ? r.cards : {};
      r.cards = Object.keys(old).filter(function (k) { return typeof old[k] === 'string'; }).map(function (k) {
        return { id: old[k], kind: k, look: k, src: 'pic', set: -1 };
      });
    }
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
  // the open recognition cards, oldest first (closed or cleared ones dropped)
  function openEntries(rec) {
    rec.cards = rec.cards.filter(function (e) { return e && openCard(e.id); });
    return rec.cards;
  }

  /* ---------- the cards ---------- */

  var PRACTICE = '<p><a href="' + HUB_LINK + '" style="display:inline-block;min-height:44px;padding:10px 0;color:#E2C97A;font-weight:700;text-decoration:underline">Practice more fields</a></p>';

  // A field's card: the field on the front with its own ids (rqc plus the
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
        (f ? '<p><b>Caption:</b> ' + esc(f.caption) + '</p>' : '') + PRACTICE
    };
  }
  // A question in words gets a text card: the stem on the front, the
  // three terms to choose from under it.
  function wordsCardParts(w) {
    var state = w.kind.split('-')[1];
    return {
      q: '<span style="display:block">' + esc(w.q) + '</span>' +
        '<span style="display:block;margin-top:8px;font-size:.9em;opacity:.8">Hypotonic, isotonic or hypertonic?</span>',
      quickHit: '<b>' + OPT[state].t + ' to the cells.</b> ' + esc(WORDS_HIT[w.kind]),
      why: w.why,
      explanation: '<p>' + esc(w.why) + '</p>' + PRACTICE
    };
  }

  // Each miss saves one card. meta: { kind, look, src, set }.
  //  - The same question already on an open card (a stem met again)
  //    brings that card back due now, one more lapse on it.
  //  - Under CARD_CAP open recognition cards, a new card (addAceCard, due now).
  //  - At the cap, the oldest card from an earlier set takes this miss:
  //    one with the same look first, then the same kind, then the same
  //    source, then the oldest of all. A card from this set is never
  //    written over; a set holds at most ten misses, under the cap.
  function saveMiss(rec, parts, meta, nodeId) {
    var list = openEntries(rec), entry = null, card = null, i;
    for (i = 0; i < list.length && !entry; i++) if (openCard(list[i].id).q === parts.q) entry = list[i];
    if (!entry && list.length >= CARD_CAP) {
      var older = list.filter(function (e) { return e.set !== meta.set; });
      var prefer = [
        function (e) { return e.src === meta.src && e.look === meta.look; },
        function (e) { return e.kind === meta.kind; },
        function (e) { return e.src === meta.src; },
        function () { return true; }
      ];
      for (i = 0; i < prefer.length && !entry; i++) entry = older.filter(prefer[i])[0] || null;
      if (!entry) return null;
    }
    if (entry) {
      card = openCard(entry.id);
      card.q = parts.q;
      card.quickHit = parts.quickHit;
      card.explanation = parts.explanation;
      card.why = parts.why;
      card.lapses = (card.lapses || 0) + 1;
      if (card.state !== 'new') { card.state = 'learning'; card.interval = 0; }
      card.nextDue = now();
      card.flipped = false;
    } else {
      if (typeof addAceCard !== 'function') return null;
      try {
        card = addAceCard({
          q: parts.q, quickHit: parts.quickHit, explanation: parts.explanation, why: parts.why,
          origin: ORIGIN, subject: 'cell', nodeId: nodeId
        });
      } catch (e) { card = null; }
      if (!card) return null;
    }
    rec.cards = rec.cards.filter(function (e) { return e.id !== card.id; });
    rec.cards.push({ id: card.id, kind: meta.kind, look: meta.look, src: meta.src, set: meta.set });
    persist();
    if (entry) {
      if (typeof renderAceStack === 'function') { try { renderAceStack(); } catch (e) { /* no stack on this page */ } }
      if (typeof flashAcePill === 'function') { try { flashAcePill(); } catch (e) { /* no pill on this page */ } }
    }
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
    if (!ok) saved = saveMiss(rec, cardParts(item), { kind: item.kind, look: item.cell + '-' + stage(item), src: 'pic', set: cur.seed }, this.nodeId);
    // card: whether this miss is on an Ace Card, for the end of the set
    cur.answers[i] = { p: picked, ok: ok, card: !!saved };
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

  // the stems of the last few sets, kept out of the next pair while others fit
  function recentWords(rec) {
    var out = [];
    rec.history.slice(-RECENT_SETS).forEach(function (h) {
      if (h && Array.isArray(h.words)) out = out.concat(h.words);
    });
    return out;
  }

  Panel.prototype.wordIds = function () {
    var rec = recogState(), cur = rec.cur, self = this;
    if (!Array.isArray(cur.words) || cur.words.length !== WORDS || !cur.words.every(function (id) { return WORDS_BY_ID[id]; })) {
      var missed = [];
      for (var i = 0; i < PICS; i++) {
        var a = cur.answers[i];
        if (a && !a.ok && missed.indexOf(self.items[i].kind) < 0) missed.push(self.items[i].kind);
      }
      cur.words = chooseWords(cur.seed, missed, recentWords(rec));
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
    var saved = null;
    if (!ok) saved = saveMiss(rec, wordsCardParts(w), { kind: w.kind, look: w.id, src: 'words', set: cur.seed }, this.nodeId);
    cur.answers[PICS + j] = { p: picked, ok: ok, w: w.id, card: !!saved };
    if (cur.answers.length >= PICS + WORDS) this.finish();
    persist();
    this.feedback(ok, OPT[state].t + ' to the cells', w.why, '', ok || !saved ? '' : 'Saved to your Ace Cards.');
    this.next(j + 1 < WORDS ? 'Next question' : 'See what to look at again');
  };

  // the set is done: keep a short history (the last 20 sets), with the
  // stems asked, so the next sets can pass over them
  Panel.prototype.finish = function () {
    var rec = recogState(), cur = rec.cur, self = this, missed = [];
    cur.answers.forEach(function (a, i) {
      if (!a || a.ok) return;
      var kind = i < PICS ? self.items[i].kind : (WORDS_BY_ID[a.w] || {}).kind;
      if (kind && missed.indexOf(kind) < 0) missed.push(kind);
    });
    cur.done = true;
    rec.history.push({ at: now(), seed: cur.seed, look: missed, words: (cur.words || []).slice() });
    if (rec.history.length > 20) rec.history = rec.history.slice(-20);
  };

  // What went to the Ace Cards in this set, said only when it did: one
  // line for the fields, one for the questions in words.
  function savedLines(answers) {
    var pm = 0, pc = 0, wm = 0, wc = 0, out = [];
    answers.forEach(function (a, i) {
      if (!a || a.ok) return;
      if (i < PICS) { pm++; if (a.card) pc++; } else { wm++; if (a.card) wc++; }
    });
    if (pc) {
      out.push(pc < pm ? 'Some of these fields are in your Ace Cards, with their pictures on them.'
        : pm === 1 ? 'The field marked Needs review is in your Ace Cards, with that picture on it.'
        : 'Each field marked Needs review is in your Ace Cards, with that picture on it.');
    }
    if (wc) {
      out.push((wc < wm ? 'One of the questions in words is in your Ace Cards'
        : wm === 1 ? 'The question in words marked Needs review is in your Ace Cards'
        : 'Both questions in words are in your Ace Cards') + (pc ? ' too.' : '.'));
    }
    return out;
  }

  Panel.prototype.renderEnd = function () {
    var rec = recogState(), last = rec.history.length ? rec.history[rec.history.length - 1] : null, self = this;
    var look = last && last.seed === rec.cur.seed ? last.look : [];
    // a kind missed in a field is named for the field's cells and cue; one
    // missed only in words, in the general terms its stems use
    var inPics = [];
    rec.cur.answers.forEach(function (a, i) { if (i < PICS && a && !a.ok && self.items[i]) inPics.push(self.items[i].kind); });
    var body = look.length
      ? '<p class="rq-end-t">Look at these again:</p><ul class="rq-review">' + look.map(function (k) {
        var pic = inPics.indexOf(k) >= 0, tip = pic ? KIND_CUE[k].charAt(0).toUpperCase() + KIND_CUE[k].slice(1) + '.' : WORDS_HIT[k];
        return '<li><b>' + esc((pic ? KIND_NAME : WORDS_NAME)[k]) + ': look again.</b> <span>' + esc(tip) + '</span></li>';
      }).join('') + '</ul>' + savedLines(rec.cur.answers).map(function (t) { return '<p class="rq-saved">' + esc(t) + '</p>'; }).join('')
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

  // makeSet, chooseWords, the cards, the stage and the word pool are exposed for the tests
  window.BioRecognize = { boot: boot, panel: null, makeSet: makeSet, setSeed: setSeed, chooseWords: chooseWords,
    card: cardParts, wordsCard: wordsCardParts, stage: stage, words: WORDS_POOL, kindName: KIND_NAME, wordsName: WORDS_NAME,
    cardCap: CARD_CAP, version: 2 };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
