/* =====================================================================
   Bio Real: true-to-life renderers for the Bio visualizers
   ---------------------------------------------------------------------
   The schematic drawings teach the mechanism; these show what the
   student would actually see (a light-microscope camera image, a TEM
   band pattern), so the picture in their head matches the real thing.
   Shapes and proportions follow real morphology:
     - red blood cells, a wet mount at 1000x oil (5.6 px per um): round
       biconcave discs 7.5 um across with a flat central pallor, a few
       touching, one overlapping pair, two seen edge-on. Hypotonic: the
       discs cup (stomatocytes: face on, the pallor narrows to a slit;
       side on, a D-shaped bowl with thick rounded rims and a shallow
       cup, holding a little more than the disc, that rounds into a bean
       with a dented mouth), then round up into evenly dense spheres.
       The membrane barely stretches, so a sphere holds more water yet
       is a little narrower (about 6.7 um). Hemolysis:
       faint, smooth, empty ghosts about 6.7 um across in an evenly
       tinted, nearly empty field. Hypertonic: shrunken cells with many
       short blunt projections (echinocytes); the first ones keep some
       pallor. No nucleus: mature RBCs have none.
     - Elodea leaf cells at 400x (1.2 px per um): narrow cells in
       parallel files with slanted, staggered end walls, thin colorless
       walls, colorless cytoplasm, chloroplasts packed along the walls
       and over the face, the nucleus faint and mostly hidden.
       Isotonic: small corner gaps in about half the cells (incipient
       plasmolysis). Hypotonic: protoplasts pressed flat on the walls
       (turgid). Hypertonic: first the membrane leaves the corners in
       every cell; once the page calls it plasmolysis (ext above 60;
       early plasmolysis up to ext 70), the protoplasts pull steadily
       further off the walls: uneven plasmolysis, rounded protoplasts,
       crowded chloroplasts, held to the wall by thin (Hechtian) strands.
   Each view is a rectangular camera crop, evenly lit, with its
   magnification in the caption and a scale bar true to the drawing.
   Everything is deterministic (no Math.random) so frames never flicker
   and snapshots match the live view. Repeated shapes are drawn once in
   <defs> and placed with <use>, small marks that share paint are
   merged into one path, and marks the crop would hide are left out, so
   a frame stays small enough to ride along on an Ace Card (every
   state is under 30000 characters). Plain SVG gradients and filters;
   no images, no network.

   Hooks: initTonicity (bio-shared.js) calls BioReal.tonicity(params)
   when this file is loaded and falls back to its schematic otherwise.

   Recognition fields (bio-recognize.js): BioReal.tonicity and
   BioReal.field take three more options. seed (an integer) draws a new
   field of the same state: red cells placed afresh (how many and how
   crowded, sizes 7 to 8 um, tilts, how many seen edge-on, an
   overlapping pair or not), Elodea files laid out afresh (row heights
   27 to 33 um, cell lengths, slanted end walls, the files turned across
   the field and the 400x image cropped tighter), and a slightly
   different focus, background and light. A seeded generator
   (mulberry32) makes the same seed give the same field every time, and
   every seeded field fits on an Ace Card (under 20000 characters).
   bare drops the caption and the solute strip, the two things that
   would name the state. ns renames every id (rl-x becomes ns-x) so
   several fields can share one page. Without these options the output
   is exactly what it was.
   ===================================================================== */
(function () {
  'use strict';

  function f1(n) { return (Math.round(n * 10) / 10).toString(); }
  function f2(n) { return (Math.round(n * 100) / 100).toString(); }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function mix(c1, c2, t) {
    var a = [1, 3, 5].map(function (i) { return parseInt(c1.substr(i, 2), 16); });
    var b = [1, 3, 5].map(function (i) { return parseInt(c2.substr(i, 2), 16); });
    return '#' + a.map(function (v, i) {
      var x = Math.round(lerp(v, b[i], t)).toString(16);
      return x.length < 2 ? '0' + x : x;
    }).join('');
  }
  // a fixed pseudo-random number in [0, 1) for a pair of integers
  function hash(i, k) { var v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); }
  function pt(p) { return f1(p[0]) + ',' + f1(p[1]); }
  // split a caption into lines of at most max characters
  function wrap(s, max) {
    var lines = [''];
    s.split(' ').forEach(function (w) {
      var cur = lines[lines.length - 1];
      if (cur && (cur + ' ' + w).length > max) lines.push(w);
      else lines[lines.length - 1] = cur ? cur + ' ' + w : w;
    });
    return lines;
  }

  /* ---------- the camera image ---------- */

  // A rectangular crop of the camera image: flat, even illumination (a
  // properly set up brightfield), a thin dark border, no round eyepiece
  // stop. Caption above it; solute strip and scale bar below it.
  var W = 400, H = 320;
  var FX = 14, FY = 54, FW = 372, FH = 228;
  var CROP = 'x="' + FX + '" y="' + FY + '" width="' + FW + '" height="' + FH + '"';

  // blur: the focus (stdDeviation of the soft filter), 0.45 unless a seeded field sets it
  function fieldDefs(blur) {
    return '' +
      '<clipPath id="rl-clip"><rect ' + CROP + ' rx="6"/></clipPath>' +
      '<filter id="rl-soft" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="' + (blur == null ? '0.45' : f2(blur)) + '"/></filter>' +
      '<filter id="rl-grain" x="0" y="0" width="100%" height="100%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n"/>' +
        '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.40  0 0 0 0 0.35  0 0 0 0.09 0"/>' +
        '<feComposite in2="SourceGraphic" operator="in"/>' +
      '</filter>';
  }

  function fieldOpen(bg) {
    // the dark surround runs past the viewBox so a letterboxed copy (an
    // Ace Card picture) has no light bars at its sides
    return '<rect x="-400" y="-400" width="' + (W + 800) + '" height="' + (H + 800) + '" fill="#141714"/>' +
      '<g clip-path="url(#rl-clip)"><rect ' + CROP + ' fill="' + bg + '"/>';
  }
  function fieldClose(title, mag, scaleLabel, scalePx) {
    var out = '<rect ' + CROP + ' fill="#cbb" filter="url(#rl-grain)" opacity="0.9"/></g>' +
      '<rect ' + CROP + ' rx="6" fill="none" stroke="#2a2d2a" stroke-width="1.5"/>' +
      '<text x="' + FX + '" y="17" font-size="11.5" font-weight="700" fill="#e9e2d2">LIGHT MICROSCOPE</text>' +
      '<text x="' + (FX + FW) + '" y="17" text-anchor="end" font-size="11" fill="#bfb6a3">' + mag + '</text>';
    wrap(title, 58).slice(0, 2).forEach(function (s, i) {
      out += '<text x="' + FX + '" y="' + (33 + i * 14) + '" font-size="12" fill="#e3dccb">' + s + '</text>';
    });
    // scale bar, right of the solute strip, at the same scale as the image
    var x2 = FX + FW - 2, x1 = x2 - scalePx;
    return out + '<path d="M' + x1 + ',310H' + x2 + '" stroke="#e9e2d2" stroke-width="2.5"/>' +
      '<text x="' + ((x1 + x2) / 2) + '" y="300" text-anchor="middle" font-size="11" fill="#e9e2d2">' + scaleLabel + '</text>';
  }
  // The bare frame: no caption (it would name the state), the header just
  // above the crop and the scale bar under it. Shown through BARE_VIEWBOX,
  // which leaves out the empty caption rows.
  var BARE_VIEWBOX = '0 32 400 288';
  function fieldCloseBare(mag, scaleLabel, scalePx) {
    var x2 = FX + FW - 2, x1 = f1(x2 - scalePx);
    return '<rect ' + CROP + ' fill="#cbb" filter="url(#rl-grain)" opacity="0.9"/></g>' +
      '<rect ' + CROP + ' rx="6" fill="none" stroke="#2a2d2a" stroke-width="1.5"/>' +
      '<text x="' + FX + '" y="46" font-size="11.5" font-weight="700" fill="#e9e2d2">LIGHT MICROSCOPE</text>' +
      '<text x="' + (FX + FW) + '" y="46" text-anchor="end" font-size="11" fill="#bfb6a3">' + mag + '</text>' +
      '<path d="M' + x1 + ',310H' + x2 + '" stroke="#e9e2d2" stroke-width="2.5"/>' +
      '<text x="' + f1((+x1 + x2) / 2) + '" y="300" text-anchor="middle" font-size="11" fill="#e9e2d2">' + scaleLabel + '</text>';
  }

  /* Bottom strip: the mechanism, kept beside the real picture. Dots of
     solute inside vs outside the cell, and which way water moves. The
     inside count goes up as the cell loses water and down as it gains
     water (vol is the cell volume, 1 when isotonic). After lysis there
     is no inside left, so that box fades and says so. */
  function soluteStrip(ext, diff, vol, lysed) {
    var y = 301, out = '';
    function box(x, label, n, col, faded) {
      var d = '';
      for (var i = 0; i < n; i++) d += 'M' + (x + 6 + ((i * 37) % 77)) + ',' + (y + 4.5 + ((i * 13) % 10)) + 'h0';
      return '<g' + (faded ? ' opacity="0.3"' : '') + '>' +
        '<rect x="' + x + '" y="' + y + '" width="88" height="18" rx="4" fill="#20251f" stroke="#59604f" stroke-width="1"/>' +
        (d ? '<path d="' + d + '" stroke="' + col + '" stroke-width="3.2" stroke-linecap="round"/>' : '') + '</g>' +
        '<text x="' + (x + 44) + '" y="296" text-anchor="middle" font-size="11" fill="#bfb6a3">' + label + '</text>';
    }
    out += lysed ? box(14, 'contents released', 0, '', true)
      : box(14, 'solute inside', Math.round(15 / vol), '#7fb4e0', false);
    out += box(202, 'solute outside', Math.round(clamp(ext, 0, 100) * 0.3), '#d9b45c', false);
    var mid = 152, ay = 310, txt, path;
    if (Math.abs(diff) < 5) { txt = 'no net flow'; path = ''; }
    else if (diff < 0) { txt = 'water in'; path = 'M' + (mid + 26) + ',' + ay + ' L' + (mid - 22) + ',' + ay; }
    else { txt = 'water out'; path = 'M' + (mid - 26) + ',' + ay + ' L' + (mid + 22) + ',' + ay; }
    if (path) {
      out += '<defs><marker id="rl-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#8cc7f2"/></marker></defs>';
      out += '<path d="' + path + '" stroke="#8cc7f2" stroke-width="2.4" marker-end="url(#rl-arrow)"/>';
    }
    out += '<text x="' + mid + '" y="296" text-anchor="middle" font-size="11" font-weight="700" fill="#8cc7f2">' + txt + '</text>';
    return out;
  }

  /* ---------- red blood cells ---------- */

  // Wet mount at 1000x oil, cropped: 5.6 px per um. A cell is 7.5 um
  // across (RBC_R 21 px), so the 10 um scale bar is 56 px.
  var RBC_R = 21, RBC_PX = 5.6;
  // [x, y, size, roundness (1 is round), tilt, flag]. The first 27 come
  // from a seeded random placement; the last 7 were added by hand to
  // fill gaps, so several cells touch, one pair overlaps (flag 1 marks
  // the upper cell, drawn with a multiply blend: light passes through
  // both, so the overlap is darker) and two lie edge-on (flag 2).
  var RBCS = [
    [91, 240, 0.99, 0.98, 12], [149, 110, 1.02, 1, 0], [271, 168, 0.98, 0.97, 35], [224, 278, 0.97, 1, 0],
    [101, 151, 1.01, 0.96, -30], [161, 214, 0.96, 1, 0], [236, 103, 1, 0.97, 60], [14, 286, 1.03, 1, 0],
    [262, 50, 0.99, 0.98, -15], [124, 273, 0.98, 1, 0], [330, 145, 0.95, 0.96, 20], [54, 135, 0.96, 1, 0],
    [183, 137, 1.02, 0.98, -45], [149, 65, 0.97, 1, 0], [30, 53, 1, 0.97, 75], [232, 211, 1.01, 1, 0],
    [363, 195, 0.94, 0.97, -60], [121, 198, 0.95, 1, 0], [184, 250, 0.95, 0.98, 30], [359, 82, 1.02, 1, 0],
    [68, 75, 0.99, 0.96, 50], [293, 208, 1.03, 1, 0], [105, 51, 1.02, 0.98, -20], [26, 194, 0.98, 1, 0],
    [364, 285, 0.98, 0.97, 10], [375, 236, 0.96, 1, 0], [384, 158, 0.94, 0.98, -35], [205, 178, 0.97, 0.98, 40],
    [70, 190, 1, 1, 0], [328, 254, 0.99, 0.97, -25], [200, 48, 0.96, 1, 0], [250, 240, 1, 0.98, 15, 1],
    [296, 100, 1, 1, 70, 2], [58, 262, 0.98, 1, 20, 2]
  ];
  var OFFS = [0, 30, 42, 55, 85, 100];
  // isotonic disc: a flat pallor about a third of the diameter, a near-even rim
  var DISC = ['#f3d9d3', '#f0d0c9', '#e4a7a3', '#d98f8d', '#d3807f', '#c87476'];
  // cup (stomatocyte): the round pallor is gone; a slit is drawn on top
  var CUP = ['#d98f8d', '#d98f8d', '#d98f8d', '#d98f8d', '#d3807f', '#c87476'];
  // sphere: evenly dense, slightly darker edge. Brightfield light passes
  // through the cell, so there is no highlight.
  var SPHERE = [0, 0.4, 0.56, 0.73].map(function (t) { return mix('#cf6f72', '#c86468', t); })
    .concat([mix('#c86468', '#b5565b', 0.4), '#b5565b']);
  // crenated (echinocyte): an even rose, a little darker at the rim (the
  // stops of #d27a7c at 0, #c4686c at 70 and #b0585d at 100 percent,
  // sampled at OFFS)
  var CREN = [0, 0.43, 0.6, 0.79].map(function (t) { return mix('#d27a7c', '#c4686c', t); })
    .concat([mix('#c4686c', '#b0585d', 0.5), '#b0585d']);
  var RBC_STROKE = ' stroke="#a9575b" stroke-width="0.6" stroke-opacity="0.6"';

  function radial(id, cols) {
    return '<radialGradient id="' + id + '">' + cols.map(function (c, i) {
      return '<stop offset="' + OFFS[i] + '%" stop-color="' + c + '"/>';
    }).join('') + '</radialGradient>';
  }

  // Edge-on profile around the origin, half width A px. The biconcave
  // shape follows Evans and Fung, with the middle set to 1 um thick:
  // about 2.7 um at the thickest. cup (0 to 1) turns it into a
  // stomatocyte seen side on: a D-shaped bowl. The lower dimple fills in
  // to a convex base about 2.3 um below the center while the upper one
  // stays as a cup about 1 um deep, so the cell is about 2.2 um thick at
  // the middle and about 2.5 um at the rounded rims. As a solid of
  // revolution the bowl holds a little more than the disc (about 1.06
  // times at full cup), as a swelling cell should. sph (0 to 1) blends
  // it toward a sphere of radius A; notch (px) dents the top of that
  // sphere, so a late stomatocyte still shows its mouth in profile while
  // it rounds up. amp with n adds crenation bumps (16 samples per bump
  // keep them round).
  function edgePath(A, cup, sph, amp, n, notch) {
    var pts = [], N = amp ? n * 16 : 48;
    for (var i = 0; i < N; i++) {
      var th = i / N * 2 * Math.PI, c = Math.cos(th), s = Math.sin(th), q = Math.sqrt(Math.abs(s));
      var disc = -s * 0.5 * RBC_PX * (1 + 7.83 * c * c - 4.39 * c * c * c * c);
      var bowl = s < 0 ? 13 * q : 11 * s * s - 10.5 * q;    // outer base below, the cup above
      var yd = lerp(disc, bowl, cup);
      var ball = -A * s + (notch && s > 0 ? notch * Math.pow(s, 10) : 0);
      var x = A * c, y = lerp(yd, ball, sph);
      if (amp) { var b = Math.pow(Math.max(0, Math.cos(n * th)), 2) * amp * A; x += b * c; y -= b * s; }
      pts.push(f1(x) + ',' + f1(y));
    }
    return 'M' + pts.join(' ') + 'Z';
  }

  // Crenated outline: a disc with n short blunt bumps (cos^2 bumps of
  // height amp * r), drawn once around the origin. 20 samples per bump
  // period (10 across the bump itself) give each one a rounded tip.
  function crenatedPath(r, amp, n) {
    var pts = [], steps = n * 20;
    for (var i = 0; i < steps; i++) {
      var th = (i / steps) * Math.PI * 2;
      var bump = Math.pow(Math.max(0, Math.cos(n * th)), 2);
      var rr = r * (1 + amp * bump) * (1 + 0.025 * Math.sin(3 * th));
      pts.push(f1(Math.cos(th) * rr) + ',' + f1(Math.sin(th) * rr));
    }
    return 'M' + pts.join(' ') + 'Z';
  }

  // lay (a seeded field, from rbcLayout) swaps in its own cells and its own
  // tougher cells; without it the fixed RBCS field is drawn.
  function rbcField(ext, diff, lysed, lay) {
    var cells = lay ? lay.cells : RBCS;
    var mode = Math.abs(diff) < 5 ? 'iso' : (diff < 0 ? (lysed ? 'lysed' : 'swell') : 'cren');
    var t = 0, A = RBC_R, defs, edge = '', edgeFill = '#d3807f', vol = 1, title, under = '', keep = 0;
    if (mode === 'iso') {
      defs = radial('rl-rbc', DISC) + '<circle id="rl-d" r="' + A + '" fill="url(#rl-rbc)"' + RBC_STROKE + '/>';
      edge = edgePath(A, 0, 0, 0, 0);
      // the fixed field has two cells edge-on; a seeded one says how many it has
      var nEdge = lay ? cells.filter(function (c) { return c[5] === 2; }).length : 2;
      title = 'Red blood cells, isotonic: biconcave discs with pale centers' +
        (nEdge ? '; ' + ['', 'one is', 'two are', 'three are'][nEdge] + ' seen edge-on' : '');
    } else if (mode === 'swell') {
      // t: about 0.06 at the edge of isotonic, 1 just before lysis. The cell
      // first cups (the pallor narrows to a slit), then becomes a sphere
      // of the same membrane area: more volume, a little narrower.
      t = clamp((-diff - 3) / 35, 0, 1);
      A = RBC_R * (1 - 0.11 * t);
      var cup = clamp(t / 0.3, 0, 1), den = clamp((t - 0.3) / 0.7, 0, 1);
      // the slit fades in and out over 0.05 at each end of the cup range,
      // so it is plainly visible (opacity 0.28 or more) at every step that
      // the cup caption shows; its mouth shortens as the cell rounds up
      var slit = t > 0.2 && t < 0.7 ? clamp(Math.min(t - 0.2, 0.7 - t) / 0.05, 0, 1) : 0;
      var mouth = 1 - 0.35 * clamp((t - 0.45) / 0.25, 0, 1);
      defs = radial('rl-rbc', DISC.map(function (c, i) { return mix(mix(c, CUP[i], cup), SPHERE[i], den); })) +
        '<g id="rl-d"><circle r="' + f1(A) + '" fill="url(#rl-rbc)"' + RBC_STROKE + '/>' +
        (slit > 0 ? '<ellipse rx="' + f1(0.45 * A * mouth) + '" ry="' + f1(0.12 * A) + '" fill="#f0d0c9" opacity="' + f2(slit) + '"/>' : '') + '</g>';
      // the side view starts to round up while it is still cupping (from t
      // 0.15), so the full bowl never shows unblended, and is round by t 0.75.
      // While it rounds up it keeps a dent at the mouth (a bean shape in
      // profile) that closes from t 0.6 to 0.7, as the slit fades, so the
      // edge-on cells match the cup caption.
      edge = edgePath(A, cup, clamp((t - 0.15) / 0.6, 0, 1), 0, 0, 0.42 * A * clamp((0.7 - t) / 0.1, 0, 1));
      edgeFill = mix('#d3807f', '#c86468', den);
      vol = 1 + 0.4 * t;
      // the cup caption holds exactly while the slit is drawn (0.2 < t < 0.7)
      title = t <= 0.2 ? 'Hypotonic: water in, the discs start to swell and the pale centers fade'
        : t < 0.7 ? 'Hypotonic: water in, the discs swell into cups; each pale center narrows to a slit'
        : 'Hypotonic: water in, discs round up into spheres: more volume, a bit narrower, pale center gone';
    } else if (mode === 'lysed') {
      // ghosts reseal at about the sphere's size, smooth and nearly
      // invisible; the released hemoglobin tints the whole field faintly.
      // A seeded field draws the membranes a little firmer, so a field of
      // nothing but ghosts still reads as cells on a phone screen.
      defs = '<circle id="rl-d" r="' + f1(RBC_R * 0.9) + '" fill="#f5ebe8" fill-opacity="0.12" stroke="' + (lay ? '#a8948f' : '#b8a6a2') +
        '" stroke-width="' + (lay ? '0.7' : '0.6') + '" stroke-opacity="' + (lay ? '0.62' : '0.45') + '"/>';
      under = '<rect ' + CROP + ' fill="#f3e0dc" opacity="0.15"/>';
      // cells differ in how easily they burst: just past the threshold,
      // two tougher cells still hold as small dense spheres
      keep = ext >= 8 ? (lay ? lay.keep.length : 2) : 0;
      if (keep) defs += radial('rl-rbc', SPHERE) + '<circle id="rl-sp" r="' + f1(RBC_R * 0.89) + '" fill="url(#rl-rbc)"' + RBC_STROKE + '/>';
      title = keep ? 'Hemolysis: most cells burst, leaving faint empty membranes (ghosts); ' +
          (keep === 1 ? 'one tougher cell holds as a sphere' : 'two tougher cells hold as spheres')
        : 'Hemolysis: cells burst; only faint empty membranes (ghosts) remain';
    } else {
      // hypertonic: shrunken echinocytes, many short blunt projections over
      // the rim and the face, only slightly darker than normal cells. t
      // starts above 0 on the first hypertonic step (ext 55).
      t = clamp((diff - 4) / 46, 0, 1);
      A = RBC_R * (1 - 0.24 * t);
      var amp = 0.04 + 0.06 * t, face = 'M0,0h0';
      for (var k = 0; k < 7; k++) face += 'M' + f1(Math.cos(k * 2 * Math.PI / 7) * 0.45 * A) + ',' + f1(Math.sin(k * 2 * Math.PI / 7) * 0.45 * A) + 'h0';
      // Early echinocytes are still discs with some central pallor and
      // bumps only at the rim; only the late, shrunken ones lose the
      // pallor and carry projections over the face. So the disc colors
      // blend into the even crenated ones by t 0.4, and the face bumps
      // fade in from t 0.3 to 0.5 (on a pale center they would read as dark dots).
      var ct = clamp(t / 0.4, 0, 1);
      defs = radial('rl-rbc', DISC.map(function (c, i) { return mix(c, CREN[i], ct); }));
      [14, 16, 18].forEach(function (n) {
        defs += '<g id="rl-d' + n + '"><path d="' + crenatedPath(A, amp, n) + '" fill="url(#rl-rbc)" stroke="#9a4c51" stroke-width="0.6" stroke-opacity="0.6"/>' +
          '<path d="' + face + '" stroke="#e07f84" stroke-opacity="' + f2(0.45 * clamp((t - 0.3) / 0.2, 0, 1)) + '" stroke-width="2.6" stroke-linecap="round"/></g>';
      });
      edge = edgePath(A, 0, 0.3 * t, amp, 14);
      edgeFill = mix('#d3807f', '#c4686c', ct);           // darkens with the face-on cells
      vol = 1 - 0.25 * t;
      title = t < 0.25 ? 'Hypertonic: water out, the cells start to shrink and crenate (short blunt projections)'
        : 'Hypertonic: water out, cells shrunken and crenated, with many short blunt projections';
    }
    // a seeded field may have no cell edge-on; then the profile is left out
    if (edge && (!lay || cells.some(function (c) { return c[5] === 2; }))) defs += '<path id="rl-e" d="' + edge + '" fill="' + edgeFill + '"' + RBC_STROKE + '/>';
    var body = '';
    cells.forEach(function (c, i) {
      var s = c[2], sy = s * (mode === 'iso' ? c[3] : mode === 'swell' ? lerp(c[3], 1, t) : 1);
      var href = mode === 'cren' ? '#rl-d' + (14 + 2 * (i % 3)) : '#rl-d', rot = mode === 'cren' ? c[4] + i * 21 : c[4];
      if (c[5] === 2 && mode !== 'lysed') { href = '#rl-e'; rot = c[4]; sy = s; }
      if (keep && (lay ? lay.keep.indexOf(i) >= 0 : (i === 5 || i === 21))) href = '#rl-sp';
      body += '<use href="' + href + '" transform="translate(' + c[0] + ' ' + c[1] + ')' +
        (mode === 'lysed' ? '' : ' rotate(' + rot + ')') + ' scale(' + f2(s) + (f2(sy) !== f2(s) ? ' ' + f2(sy) : '') + ')"' +
        (c[5] === 1 ? ' style="mix-blend-mode:multiply"' : '') + '/>';
    });
    return {
      svg: '<defs>' + defs + '</defs>' + under + '<g filter="url(#rl-soft)">' + body + '</g>',
      title: title, vol: vol, r: A
    };
  }

  /* ---------- Elodea leaf cells ---------- */

  // 400x, cropped: 1.2 px per um, so the 50 um scale bar is 60 px. Cells
  // sit in parallel files (rows) 36 px (30 um) tall and run 92 to 150 px
  // (77 to 125 um) long. Each end wall slants by up to 5 px over the row
  // (about 8 deg), and the end walls fall at different places in each
  // row. Laid out once: [top y, left wall, right wall], a wall being
  // {m: x at mid height, d: x shift from top to bottom}.
  var ROW_H = 36, WALL = 2.5;
  var CELLS = (function () {
    var offs = [18, 56, 30, 62, 24, 46, 38];
    var lens = [118, 96, 142, 124, 104, 150, 92, 132, 110, 138, 100, 126, 146, 108, 120, 94, 136, 114];
    var tilts = [-5, 3, 5, -2, -4, 4, 1, -5, 2, -3, 5, -1, 4, -4, 0];
    var out = [], li = 0, ti = 0;
    for (var r = 0; r < 7; r++) {
      var y = FY - 12 + r * ROW_H, x = FX - offs[r], left = { m: x, d: tilts[ti++ % tilts.length] };
      while (x < FX + FW) {
        x += lens[li++ % lens.length];
        var right = { m: x, d: tilts[ti++ % tilts.length] };
        out.push([y, left, right]);
        left = right;
      }
    }
    return out;
  })();
  // how far each cell plasmolyzes, relative to the others
  var PLAS = [0.8, 1.1, 0.95, 1.2, 0.7, 1.0, 1.15, 0.9];

  function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
  function len(v) { return Math.sqrt(v[0] * v[0] + v[1] * v[1]); }
  function toward(a, b, d) { var v = sub(b, a), l = len(v) || 1; return [a[0] + v[0] * d / l, a[1] + v[1] * d / l]; }
  // unit normal pointing into a quad listed clockwise on screen (y down)
  function inward(a, b) { var v = sub(b, a), l = len(v) || 1; return [-v[1] / l, v[0] / l]; }
  // quad (TL, TR, BR, BL) with every side moved inward by d
  function insetQuad(q, d) {
    var L = [], out = [], i;
    for (i = 0; i < 4; i++) {
      var a = q[i], b = q[(i + 1) % 4], n = inward(a, b);
      L.push([[a[0] + n[0] * d, a[1] + n[1] * d], sub(b, a)]);
    }
    for (i = 0; i < 4; i++) {
      var p = L[(i + 3) % 4], s = L[i], w = sub(s[0], p[0]);
      var u = (w[0] * s[1][1] - w[1] * s[1][0]) / (p[1][0] * s[1][1] - p[1][1] * s[1][0]);
      out.push([p[0][0] + p[1][0] * u, p[0][1] + p[1][1] * u]);
    }
    return out;
  }
  // Closed outline of quad q with each corner rounded (radius r, a
  // quadratic through the corner); bowT / bowB bend the top / bottom side
  // inward by that many px. Returns the path (d) and a polyline of it
  // (pts) for placing chloroplasts along it.
  function roundQuad(q, r, bowT, bowB) {
    var A = [], B = [], pts = [], i;
    for (i = 0; i < 4; i++) {
      var P = q[i], pv = q[(i + 3) % 4], nx = q[(i + 1) % 4];
      var rr = Math.min(r, len(sub(P, pv)) / 2, len(sub(P, nx)) / 2);
      A.push(toward(P, pv, rr)); B.push(toward(P, nx, rr));
    }
    function curve(p0, c, p1) {
      for (var s = 1; s <= 6; s++) { var t = s / 6, u = 1 - t; pts.push([u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]]); }
    }
    var d = 'M' + pt(B[0]);
    pts.push(B[0]);
    for (var k = 1; k <= 4; k++) {
      var j = k % 4, h = k - 1, bow = h === 0 ? bowT : (h === 2 ? bowB : 0);
      if (bow) {
        var n = inward(q[h], q[j]), m = [(B[h][0] + A[j][0]) / 2 + n[0] * 2 * bow, (B[h][1] + A[j][1]) / 2 + n[1] * 2 * bow];
        d += 'Q' + pt(m) + ' ' + pt(A[j]);
        curve(B[h], m, A[j]);
      } else { d += 'L' + pt(A[j]); pts.push(A[j]); }
      d += 'Q' + pt(q[j]) + ' ' + pt(B[j]);
      curve(A[j], q[j], B[j]);
    }
    pts.pop();                                            // the last point is the first again
    return { d: d + 'Z', pts: pts };
  }
  // a point and the unit tangent at fraction u (0 to 1) of the way round a closed polyline
  function along(pts, u) {
    var cum = [0], i, n = pts.length;
    for (i = 1; i <= n; i++) cum.push(cum[i - 1] + len(sub(pts[i % n], pts[i - 1])));
    var d = (u - Math.floor(u)) * cum[n];
    for (i = 1; i < n && cum[i] < d; i++);
    var a = pts[i - 1], b = pts[i % n], t = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1);
    return { p: [lerp(a[0], b[0], t), lerp(a[1], b[1], t)], t: toward([0, 0], sub(b, a), 1) };
  }

  // lay (a seeded field, from plantLayout) brings its own cells (with a
  // row height each), row walls, an index offset io for the per-cell
  // pseudo-random choices, and the matrix (map) that turns and zooms the
  // drawing into the crop. Without it the fixed CELLS field is drawn as is.
  function plantField(ext, diff, plasmolyzed, lay) {
    var cells = lay ? lay.cells : CELLS, io = lay ? lay.io : 0, map = lay ? lay.map : null;
    var iso = Math.abs(diff) < 5;
    plasmolyzed = plasmolyzed && diff >= 5;              // only a hypertonic solution plasmolyzes
    // How far the protoplasts pull in (p), tied to the page's plasmolyzed
    // flag (ext above 60). Hypertonic but not plasmolyzed (ext 55 to 60):
    // p rises from about 0 to 0.06, so in every cell the membrane only
    // leaves the corners (incipient plasmolysis); the ends stay within
    // about 3.5 px (3 um) of the end walls and no strands form.
    // Plasmolyzed: p steps to 0.13 at ext 61, where the strands appear
    // and the membrane visibly pulls off the end walls, then runs on to 1
    // at ext 100 in even steps, so the protoplasts pull steadily further
    // off the walls. Up to ext 70 (diff 20) it is named early
    // plasmolysis, as on the page's outcome card; past that the ends have
    // rounded up.
    var p = plasmolyzed ? lerp(0.11, 1, clamp((diff - 10) / 40, 0, 1)) : (diff >= 5 ? 0.06 * clamp((diff - 4) / 6, 0, 1) : 0);
    var early = plasmolyzed && diff <= 20;
    var turgid = diff <= -5;
    var gap = '', flat = '', strands = '', nuc = '', walls = '';
    // Chloroplasts: short round-capped strokes, one path for those along
    // the walls and one for those over the face. Each starts with a move
    // relative to the end of the one before, and the relative numbers drop
    // a leading zero (.4 for 0.4), to keep the markup short. A stroke
    // that lies wholly outside the camera crop (both ends more than half
    // its width plus 1 px past the same edge) is left out: the crop would
    // hide it anyway.
    var paths = { w: '', f: '' }, cur = { w: null, f: null };
    function rel(n) { return f1(n).replace(/^(-?)0\./, '$1.'); }
    // true when points a and b both lie more than m px past the same edge of
    // the crop (in a seeded field, once turned and zoomed into place)
    function outside(a, b, m) {
      if (map) { a = map(a); b = map(b); m *= lay.k; }
      return (a[0] < FX - m && b[0] < FX - m) || (a[0] > FX + FW + m && b[0] > FX + FW + m) ||
        (a[1] < FY - m && b[1] < FY - m) || (a[1] > FY + FH + m && b[1] > FY + FH + m);
    }
    // the same test for a whole cell (seeded fields only): all four corners past one edge
    function quadOutside(q, m) {
      var s = q.map(map);
      function all(f) { return s.every(f); }
      return all(function (a) { return a[0] < FX - m; }) || all(function (a) { return a[0] > FX + FW + m; }) ||
        all(function (a) { return a[1] < FY - m; }) || all(function (a) { return a[1] > FY + FH + m; });
    }
    var look = null, lookD = Infinity;
    function chloro(key, c, dir, L) {
      var a = [Math.round((c[0] - dir[0] * L / 2) * 10) / 10, Math.round((c[1] - dir[1] * L / 2) * 10) / 10];
      var b = [Math.round((c[0] + dir[0] * L / 2) * 10) / 10, Math.round((c[1] + dir[1] * L / 2) * 10) / 10];
      if (outside(a, b, (key === 'f' ? 2.8 : 2.3) + 1)) return;
      paths[key] += (cur[key] ? 'm' + rel(a[0] - cur[key][0]) + ',' + rel(a[1] - cur[key][1]) : 'M' + pt(a)) + 'l' + rel(b[0] - a[0]) + ',' + rel(b[1] - a[1]);
      cur[key] = b;
    }
    // a Hechtian strand from a to b: a move and a relative line, left out when the crop hides it
    function strand(a, b) {
      a = [Math.round(a[0] * 10) / 10, Math.round(a[1] * 10) / 10];
      if (!outside(a, b, 1)) strands += 'M' + pt(a) + 'l' + rel(b[0] - a[0]) + ',' + rel(b[1] - a[1]);
    }
    function rot(v, deg) { var r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; }
    if (lay) {
      lay.rows.forEach(function (y) {
        if (!outside([lay.x0, y], [lay.x1, y], 2)) walls += 'M' + f1(lay.x0) + ',' + f1(y) + 'H' + f1(lay.x1);
      });
    } else for (var r = 0; r <= 7; r++) walls += 'M' + (FX - 4) + ',' + (FY - 12 + r * ROW_H) + 'H' + (FX + FW + 4);
    function quadOf(c) {
      var y = c[0], l = c[1], rt = c[2], rh = c[3] || ROW_H;
      return [[l.m - l.d / 2, y], [rt.m - rt.d / 2, y], [rt.m + rt.d / 2, y + rh], [l.m + l.d / 2, y + rh]];
    }
    // how far the corners of quad q (8 px in from the crop's edges) lie outside the crop, once in place
    function cutOff(q) {
      var cut = 0;
      q.map(map).forEach(function (s) {
        cut += Math.max(0, FX + 8 - s[0]) + Math.max(0, s[0] - (FX + FW - 8)) + Math.max(0, FY + 8 - s[1]) + Math.max(0, s[1] - (FY + FH - 8));
      });
      return cut;
    }
    function aimDist(q) {
      var sq = q.map(map), cx = (sq[0][0] + sq[1][0] + sq[2][0] + sq[3][0]) / 4, cy = (sq[0][1] + sq[1][1] + sq[2][1] + sq[3][1]) / 4;
      return Math.sqrt((cx - lay.aim[0]) * (cx - lay.aim[0]) + (cy - lay.aim[1]) * (cy - lay.aim[1]));
    }
    // At isotonic about half the cells show the membrane leaving the
    // corners. A seeded field shows few enough cells that chance could
    // make that most or hardly any of them, so it picks exactly half of
    // the cells in view (by the same per-cell hash), always including the
    // cell wholly in view nearest the seeded point, which the look mark
    // will frame.
    var incSet = null;
    if (lay) {
      var vis = [], lead = -1, leadD = Infinity;
      cells.forEach(function (c, ci) {
        var q = quadOf(c);
        if (quadOutside(q, 3)) return;
        vis.push(ci + io);
        var dd = cutOff(q) > 0 ? Infinity : aimDist(q);
        if (dd < leadD) { leadD = dd; lead = ci + io; }
      });
      vis = vis.filter(function (i) { return i !== lead; }).sort(function (a, b) { return hash(a, 1) - hash(b, 1); });
      incSet = {};
      if (lead >= 0) incSet[lead] = true;
      vis.slice(0, Math.round((vis.length + 1) / 2) - (lead >= 0 ? 1 : 0)).forEach(function (i) { incSet[i] = true; });
    }
    var prev = null;                                      // the cell before, in a seeded field: [row top, drawn]
    cells.forEach(function (c, ci) {
      var y = c[0], rh = c[3] || ROW_H, i = ci + io;
      var q = quadOf(c);
      // A seeded field leaves out the cells the crop hides, and keeps the
      // end walls of every cell it draws: a cell's left wall, and the right
      // one (the next cell's left wall) after a drawn cell.
      var drawn = !lay || !quadOutside(q, 3), after = lay && prev && prev[0] === y && prev[1];
      if (lay) prev = [y, drawn];
      if (drawn || after) walls += 'M' + pt(q[0]) + 'L' + pt(q[3]);   // left end wall; the right one is the next cell's
      if (!drawn) return;
      var inner = insetQuad(q, WALL / 2);                 // the protoplast's place when pressed on the wall
      // incipient plasmolysis: about half the cells at isotonic, every cell once hypertonic
      var inc = diff >= 5 || (incSet ? !!incSet[i] : hash(i, 1) < 0.5);
      var f = PLAS[i % 8] * p, pq, rad, bowT = 0, bowB = 0;
      var top = inner[0][1], ih = inner[3][1] - top;
      var iw = Math.min(inner[1][0], inner[2][0]) - Math.max(inner[0][0], inner[3][0]);
      if (turgid) { pq = inner; rad = 0.6; }
      else {
        var base = inc ? 2 : 0, sx = iw * 0.42 * f, sy = ih * 0.3 * f, lim = Math.max(0, sx / 2 - 2);
        // pulled off the end walls first, and off center along the cell
        var shift = clamp((hash(i, 2) < 0.5 ? -1 : 1) * 0.15 * (iw - sx) * f, -lim, lim);
        var gy = base + sy / 2, fT = gy / ih, xl = base + sx / 2 + shift, xr = base + sx / 2 - shift;
        pq = [
          [lerp(inner[0][0], inner[3][0], fT) + xl, top + gy], [lerp(inner[1][0], inner[2][0], fT) - xr, top + gy],
          [lerp(inner[1][0], inner[2][0], 1 - fT) - xr, top + ih - gy], [lerp(inner[0][0], inner[3][0], 1 - fT) + xl, top + ih - gy]
        ];
        var ph = ih - 2 * gy;
        rad = lerp(inc ? 8 : 1.5, ph / 2, clamp(f * 2, 0, 1));   // the ends round up as it shrinks
        // two cells in eight stay pinned at a side wall and go concave
        if (f > 0.3 && (i % 8 === 3 || i % 8 === 6)) {
          var bw = 0.12 * ph * clamp((f - 0.3) / 0.5, 0, 1);
          if (i % 8 === 3) bowT = bw; else bowB = bw;
        }
      }
      if (lay && lay.aim) {
        // The look target: a cell near the seeded point, wholly in view if
        // any is (a long cell turned up a tightly zoomed field may not
        // fit; then the one least cut off), and at isotonic one whose
        // membrane has left the corners. Its frame runs 4 px outside the
        // walls, so it never covers the corners.
        var cut = cutOff(q), sq = q.map(map);
        var dd = aimDist(q) + (cut > 0 ? 500 + 4 * cut : 0) + (iso && !inc ? 5000 : 0);
        if (dd < lookD) {
          lookD = dd;
          look = { x: (sq[0][0] + sq[1][0] + sq[2][0] + sq[3][0]) / 4, y: (sq[0][1] + sq[1][1] + sq[2][1] + sq[3][1]) / 4, pts: insetQuad(q, -4).map(map) };
        }
      }
      // cells whose membrane has left the wall somewhere get a clearer outline
      if (inc && !turgid) gap += roundQuad(pq, rad, bowT, bowB).d;
      else flat += roundQuad(pq, rad, bowT, bowB).d;
      // 56 chloroplasts in every state, so they crowd as the protoplast
      // shrinks: an outer row of 24 along the walls, nearly touching (the
      // cyclosis track), an inner row of 12 (each stroke parallel to the
      // wall, within 15 deg), then 20 over the face (cells cut by the crop
      // keep only the ones that can show)
      var phh = pq[3][1] - pq[0][1];
      var rows = [[turgid ? 3 : 3.2, 0, 24], [Math.min(7.5, phh / 2 - 1.5), 0.5, 12]];
      rows.forEach(function (rw, ri) {
        var ring = roundQuad(insetQuad(pq, rw[0]), Math.max(3, rad - rw[0]), bowT, bowB).pts, nRow = rw[2];
        for (var k = 0; k < nRow; k++) {
          var at = along(ring, (k + rw[1] + (hash(i * 3 + ri, k) - 0.5) * 0.5) / nRow + hash(i, 9));
          var dir = rot(at.t, (hash(i * 5 + ri, k + 20) - 0.5) * 30);
          chloro('w', at.p, dir, ri ? 1.4 : (turgid ? 3.4 : 2.8));
        }
      });
      // The face band keeps its share of the protoplast as it shrinks. Its
      // ends sit far enough in from the rounded ends that a face
      // chloroplast (radius 2.8) never crosses the membrane.
      var fy0 = pq[0][1] + Math.min(12, phh * 0.34), fy1 = pq[3][1] - Math.min(12, phh * 0.34);
      var fx0 = Math.max(pq[0][0], pq[3][0]) + Math.min(9.5, phh * 0.3), fx1 = Math.min(pq[1][0], pq[2][0]) - Math.min(9.5, phh * 0.3);
      // the nucleus shows faintly in 3 cells of 8; a face chloroplast that
      // would sit on it moves toward the middle of the cell, inside the band
      var showNuc = hash(i, 3) < 0.375, nx = lerp(fx0, fx1, hash(i, 4) < 0.5 ? 0.1 : 0.9), ny = (fy0 + fy1) / 2;
      for (var k = 0; k < 20; k++) {
        var u = (Math.floor(k / 2) + 0.25 + 0.5 * (k % 2) + (hash(i, k + 10) - 0.5) * 0.9) / 10;
        var fp = [lerp(fx0, fx1, clamp(u, 0, 1)), lerp(fy0, fy1, clamp((k % 2) + (hash(i, k + 40) - 0.5) * 0.9, 0, 1))];
        if (showNuc && Math.abs(fp[0] - nx) < 8 && Math.abs(fp[1] - ny) < 6) fp[0] = clamp(nx < (fx0 + fx1) / 2 ? nx + 8 : nx - 8, fx0, fx1);
        chloro('f', fp, rot([1, 0], hash(i, k + 70) * 180), 0.8);
      }
      // the nucleus, an ellipse 9 by 7.7 um drawn once in defs (left out when the crop hides it)
      if (showNuc && !outside([nx, ny], [nx, ny], 6)) nuc += '<use href="#rl-n" x="' + f1(nx) + '" y="' + f1(ny) + '"/>';
      // Hechtian strands: thin threads from the plasmolyzed protoplast to
      // the points where its membrane still holds the wall (only once the
      // membrane has pulled clear of the wall, never before plasmolysis)
      if (plasmolyzed) {
        var ly = lerp(top, top + ih, 0.3 + 0.4 * hash(i, 5)), ry = lerp(top, top + ih, 0.3 + 0.4 * hash(i, 6));
        strand([(pq[0][0] + pq[3][0]) / 2, (pq[0][1] + pq[3][1]) / 2], [lerp(inner[0][0], inner[3][0], (ly - top) / ih), ly]);
        strand([(pq[1][0] + pq[2][0]) / 2, (pq[1][1] + pq[2][1]) / 2], [lerp(inner[1][0], inner[2][0], (ry - top) / ih), ry]);
        var onTop = bowT > 0 || (!bowB && hash(i, 7) < 0.5), xm = (pq[0][0] + pq[1][0]) / 2 + (bowT || bowB ? 0 : (hash(i, 8) - 0.5) * 30);
        if (onTop) strand([xm, pq[0][1] + bowT], [xm + 2, top]);
        else strand([xm, pq[3][1] - bowB], [xm - 2, top + ih]);
      }
    });
    var title = iso ? 'Elodea leaf cells, isotonic: flaccid; in some cells the membrane just starts to leave the corners'
      : diff < 0 ? 'Elodea leaf cells, hypotonic: turgid, protoplasts pressed flat on the walls'
      : early ? 'Early plasmolysis (Elodea leaf cells): membranes pull off the end walls, held by thin strands'
      : plasmolyzed ? 'Plasmolysis (Elodea leaf cells): protoplasts round up and pull off the walls, held by thin strands'
      : 'Elodea leaf cells, hypertonic: water leaves; in every cell the membrane starts to leave the corners';
    // cytoplasm is colorless: only the chloroplasts are green. Each is a
    // dark rim with a lighter middle; the face ones, a little out of
    // focus, are paler.
    var svg = '<defs><path id="rl-cw" d="' + paths.w + '"/><path id="rl-cf" d="' + paths.f + '"/><path id="rl-w" d="' + walls + '"/>' +
      '<ellipse id="rl-n" rx="5.4" ry="4.6"/></defs>' +
      (lay ? '<g transform="matrix(' + lay.m.join(' ') + ')">' : '') +
      '<g filter="url(#rl-soft)">' +
      // protoplasts a shade denser than the clear solution, so the
      // gaps at the corners and ends read as gaps
      (flat ? '<path d="' + flat + '" fill="#e8eddb" fill-opacity="0.75" stroke="#aab48e" stroke-width="0.6" stroke-opacity="0.2"/>' : '') +
      (gap ? '<path d="' + gap + '" fill="#e8eddb" fill-opacity="0.75" stroke="#8f9c72" stroke-width="0.6" stroke-opacity="' + f2(0.75 + 0.25 * clamp(p * 3, 0, 1)) + '"/>' : '') +
      (nuc ? '<g fill="#d6d1bf" stroke="#8a826e" stroke-width="0.6" opacity="0.35">' + nuc + '</g>' : '') +
      '<g fill="none" stroke-linecap="round">' +
      '<use href="#rl-cf" stroke="#4f8a3d" stroke-width="5.6"/><use href="#rl-cf" stroke="#7cb05c" stroke-width="3.8"/>' +
      '<use href="#rl-cw" stroke="#346c2b" stroke-width="' + (turgid ? 4.2 : 4.6) + '"/><use href="#rl-cw" stroke="#62a044" stroke-width="' + (turgid ? 2.6 : 3) + '"/>' +
      (strands ? '<path d="' + strands + '" stroke="#9db07a" stroke-width="0.6" stroke-opacity="0.8"/>' : '') +
      '<use href="#rl-w" stroke="#d7dfc4" stroke-width="' + WALL + '"/><use href="#rl-w" stroke="#9aa781" stroke-width="0.6"/>' +
      '</g></g>' + (lay ? '</g>' : '');
    // cell volume for the solute strip: the protoplast loses water all
    // through the hypertonic range, a little before plasmolysis and more
    // after it; turgid cells gain only a little (the wall holds them)
    var vol = diff >= 5 ? 1 - 0.25 * Math.max(p, 0.45 * clamp((diff - 4) / 26, 0, 1)) : (turgid ? 1 + 0.06 * clamp((-diff - 5) / 45, 0, 1) : 1);
    return { svg: svg, title: title, vol: vol, look: look };
  }

  /* ---------- seeded fields (recognition practice) ---------- */

  // mulberry32: a small seeded generator, the same numbers for the same seed in every engine
  function seeded(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = Math.imul(a ^ (a >>> 15), a | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // the most markup a seeded Elodea drawing may take (the frame, the ids
  // and a card's wrapper add about 2000 characters, under the 20000 a
  // card picture may use)
  var SEEDED_CAP = 16500;
  // a point inside the middle of the crop, where the look ring will sit
  function aimPoint(R) { return [FX + FW * (0.25 + 0.5 * R()), FY + FH * (0.28 + 0.44 * R())]; }

  // Red cells placed afresh: 14 to 38 cells (sparse to crowded; the more
  // crowded, the more of them touch), each 7 to 8 um across (scale 0.93 to
  // 1.05 of 7.5 um), tilted any way, slightly oval. Up to three lie
  // edge-on (flag 2); in about half the fields one cell overlaps another
  // (flag 1, drawn last). keep: up to two cells that hold as spheres if
  // the field hemolyzes (used from ext 8, as in the fixed field). look:
  // a face-on cell clear of its neighbors, near a seeded point.
  function rbcLayout(R) {
    var crowd = R(), n = Math.round(14 + 24 * crowd), close = 1 - 0.08 * crowd;
    var cells = [], tries = 0, i, j;
    while (cells.length < n && tries++ < 1200) {
      var s = 0.93 + 0.12 * R(), x = Math.round(FX - 12 + R() * (FW + 24)), y = Math.round(FY - 12 + R() * (FH + 24)), ok = true;
      for (j = 0; j < cells.length && ok; j++) {
        if (Math.sqrt((x - cells[j][0]) * (x - cells[j][0]) + (y - cells[j][1]) * (y - cells[j][1])) < close * RBC_R * (s + cells[j][2])) ok = false;
      }
      if (ok) cells.push([x, y, Math.round(s * 100) / 100, Math.round((0.95 + 0.05 * R()) * 100) / 100, Math.round(R() * 180 - 90)]);
    }
    function inCrop(c, m) { return c[0] > FX + m && c[0] < FX + FW - m && c[1] > FY + m && c[1] < FY + FH - m; }
    var edges = Math.floor(R() * 3.4);
    for (i = 0; i < cells.length && edges > 0; i++) {
      if (inCrop(cells[i], 24) && R() < 0.35) { cells[i][3] = 1; cells[i].push(2); edges--; }
    }
    if (R() < 0.5) {
      for (i = 0; i < cells.length; i++) {
        var b = cells[i];
        if (!b[5] && inCrop(b, 40)) {
          var a = R() * 2 * Math.PI, d = RBC_R * b[2] * (1.1 + 0.4 * R());
          cells.push([Math.round(b[0] + d * Math.cos(a)), Math.round(b[1] + d * Math.sin(a)), b[2], 0.98, Math.round(R() * 180 - 90), 1]);
          break;
        }
      }
    }
    // a cell is clear when nothing sits within 2.1 radii of its center
    function clear(i) {
      for (var j = 0; j < cells.length; j++) {
        if (j !== i && Math.sqrt((cells[i][0] - cells[j][0]) * (cells[i][0] - cells[j][0]) + (cells[i][1] - cells[j][1]) * (cells[i][1] - cells[j][1])) < 2.1 * RBC_R) return false;
      }
      return true;
    }
    var keep = [], wantKeep = 1 + (R() < 0.5 ? 1 : 0), aim = aimPoint(R), look = -1, best = Infinity;
    for (i = 0; i < cells.length; i++) {
      if (cells[i][5] || !inCrop(cells[i], 26)) continue;
      var dd = Math.sqrt((cells[i][0] - aim[0]) * (cells[i][0] - aim[0]) + (cells[i][1] - aim[1]) * (cells[i][1] - aim[1])) + (clear(i) ? 0 : 400);
      if (dd < best) { best = dd; look = i; }
    }
    for (i = cells.length - 1; i >= 0 && keep.length < wantKeep; i--) {
      if (i !== look && !cells[i][5] && inCrop(cells[i], 10) && R() < 0.4) keep.push(i);
    }
    return { cells: cells, keep: keep, look: look };
  }

  // Elodea files laid out afresh over the part of the drawing the crop
  // shows once it is turned (rot, up to 30 deg either way, or the files
  // running up the field) and zoomed (k, 1.35 to 1.65: the same 400x
  // image cropped tighter, so the scale bar grows with it, and fewer
  // cells in view keep a field small enough for an Ace Card). Rows 32 to 40
  // px (27 to 33 um) tall; cells 92 to 150 px (77 to 125 um) long with end
  // walls slanted up to 5 px, as in the fixed field.
  function plantLayout(R, bump) {
    var k = Math.round((1.35 + 0.3 * R() + 0.12 * bump) * 100) / 100;
    var rot = Math.round((R() - 0.5) * 60 + (R() < 0.25 ? 90 : 0));
    var cx = FX + FW / 2, cy = FY + FH / 2, cs = Math.cos(rot * Math.PI / 180), sn = Math.sin(rot * Math.PI / 180);
    // drawing to screen: zoom k and turn rot about the middle of the crop
    var m = [k * cs, k * sn, -k * sn, k * cs].map(function (v) { return Math.round(v * 10000) / 10000; });
    m.push(Math.round((cx - m[0] * cx - m[2] * cy) * 100) / 100, Math.round((cy - m[1] * cx - m[3] * cy) * 100) / 100);
    function map(p) { return [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]]; }
    // the crop's corners back in drawing space, for the area to fill
    var xs = [], ys = [];
    [[FX, FY], [FX + FW, FY], [FX + FW, FY + FH], [FX, FY + FH]].forEach(function (p) {
      var dx = (p[0] - cx) / k, dy = (p[1] - cy) / k;
      xs.push(cx + cs * dx + sn * dy); ys.push(cy - sn * dx + cs * dy);
    });
    var x0 = Math.min.apply(null, xs) - 10, x1 = Math.max.apply(null, xs) + 10, y1 = Math.max.apply(null, ys) + 10;
    var y = Math.round(Math.min.apply(null, ys) - 10 - 30 * R()), rows = [y], cells = [];
    while (y < y1) {
      var h = Math.round(32 + 8 * R()), x = Math.round(x0 - 20 - 120 * R());
      var left = { m: x, d: Math.round(R() * 10 - 5) };
      while (x < x1) {
        x += Math.round(92 + 58 * R());
        var right = { m: x, d: Math.round(R() * 10 - 5) };
        cells.push([y, left, right, h]);
        left = right;
      }
      y += h;
      rows.push(y);
    }
    return { cells: cells, rows: rows, x0: Math.round(x0), x1: Math.round(x1), k: k, m: m, map: map,
      io: Math.floor(R() * 4096), aim: aimPoint(R) };
  }

  // Everything that varies with the seed, besides the layout: the focus
  // (blur 0.3 to 0.7 in the crop), the background, and the light (a faint
  // warm, cool or dim wash over the crop).
  function variation(plant, seed, bump) {
    var R = seeded(Math.imul(seed, 0x9E3779B1) + (plant ? 97 : 31));
    var lay = plant ? plantLayout(R, bump || 0) : rbcLayout(R);
    var bg = mix(plant ? '#f4f2e6' : '#f6f1e6', ['#f7efe0', '#eef0ea', '#f3eee6'][Math.floor(R() * 3)], R() * 0.8);
    var wash = ['#fff3dc', '#e4ecf6', '#2b261e'][Math.floor(R() * 3)];
    // the plant drawing is zoomed by k, and its blur with it, so the blur
    // is set in the crop's own units
    var blur = (0.3 + 0.4 * R()) / (plant ? lay.k : 1);
    return { lay: lay, blur: blur, bg: bg, wash: wash, washO: wash === '#2b261e' ? 0.02 + 0.04 * R() : 0.04 + 0.08 * R() };
  }

  /* ---------- public: the tonicity picture ---------- */

  // The whole picture. Returns the markup (svg), the caption that names
  // the state (caption), the viewBox to show it through (viewBox), and for
  // a seeded field a cell in view to point at, wholly in view whenever one
  // fits (look, in the viewBox's units: a red cell as a circle x, y, rx,
  // ry; an Elodea cell as the four corners pts of a frame just outside
  // its walls).
  function build(o) {
    var ext = +o.externalSolute, diff = ext - 50, plant = o.cellType === 'plant';
    var lysed = !plant && !!o.lysed, bare = !!o.bare;
    var vary = o.seed != null && isFinite(+o.seed) ? variation(plant, Math.floor(+o.seed)) : null;
    // A burst field is faint by nature (empty ghosts), so a seeded one
    // keeps its focus sharp (blur at most 0.45) and never gets the dim wash.
    if (vary && lysed) {
      vary.blur = Math.min(vary.blur, 0.45);
      if (vary.wash === '#2b261e') vary.washO = 0;
    }
    var lay = vary ? vary.lay : null;
    var v = plant ? plantField(ext, diff, !!o.plasmolyzed, lay) : rbcField(ext, diff, lysed, lay);
    // A seeded Elodea field that comes out too big for an Ace Card (a turn
    // that cuts many cells at the edges) is drawn again a little more
    // zoomed in, from the same seed, so the same seed still always gives
    // the same field and every field fits on a card.
    for (var bump = 1; vary && plant && bump <= 4 && v.svg.length > SEEDED_CAP; bump++) {
      vary = variation(plant, Math.floor(+o.seed), bump);
      lay = vary.lay;
      v = plantField(ext, diff, !!o.plasmolyzed, lay);
    }
    // scale bars: red cells 5.6 px per um, so 10 um is 56 px; Elodea
    // 1.2 px per um, so 50 um is 60 px (times the zoom of a seeded field)
    var mag = plant ? '400x, cropped' : '1000x oil, cropped', bar = plant ? 60 * (lay ? lay.k : 1) : 56;
    var svg = '<defs>' + fieldDefs(vary ? vary.blur : null) + '</defs>' +
      fieldOpen(vary ? vary.bg : (plant ? '#f4f2e6' : '#f6f1e6')) + v.svg +
      (vary && vary.washO > 0 ? '<rect ' + CROP + ' fill="' + vary.wash + '" opacity="' + f2(vary.washO) + '"/>' : '') +
      (bare ? fieldCloseBare(mag, plant ? '50 um' : '10 um', bar)
        : fieldClose(v.title, mag, plant ? '50 um' : '10 um', bar) + soluteStrip(ext, diff, v.vol, lysed));
    if (o.ns && /^[a-z][a-z0-9-]*$/i.test(o.ns)) svg = svg.replace(/(id="|url\(#|href="#)rl-/g, '$1' + o.ns + '-');
    var look = null;
    if (lay && plant) look = v.look;
    else if (lay && lay.look >= 0) {
      var c = lay.cells[lay.look], r = (v.r || RBC_R) * c[2] * 1.45 + 4;
      look = { x: c[0], y: c[1], rx: r, ry: r };
    }
    return { svg: svg, caption: v.title, viewBox: bare ? BARE_VIEWBOX : '0 0 ' + W + ' ' + H, look: look };
  }
  function tonicity(o) { return build(o).svg; }

  /* ---------- sarcomere: a longitudinal TEM of two myofibrils ----------
     Drawn on the same x axis as the sliding filament model (viewBox
     width 720, 200 px per um), so every band sits under the filaments
     that make it. Electron density: Z disc darkest, then the overlap
     (actin + myosin), the M line, the H zone (myosin only), the paler
     bare zone beside the M line (thick filament without heads), and the
     I band (actin only) lightest. Once the thin filaments reach the M
     line (full contraction) the H zone is gone, but the M line stays a
     thin line darker than the overlap around it.
     Fine lines are the filaments: thick ones 45 nm apart, thin ones
     running into the zigzag Z disc. Each
     myofibril row is drawn once and placed twice; the lower one is
     shifted 3 px, since neighbors line up closely but not perfectly.
     Each 2 px column takes the density at its center, so every band
     edge falls on the same x as the filament end in the model.
     In the sarcoplasm gap between the rows: triads (a pale T tubule
     between two SR terminal cisternae) at each A-I junction, linked by
     SR, with glycogen granules beside the I band. In the gap below the
     lower row: mitochondria in pairs, one on each side of every Z disc
     (they would crowd the triads at short sarcomere lengths if both
     shared a gap), with glycogen past them out to the A-I junction.
     A mitochondrion keeps one size (0.16 um long, Z + 4 to Z + 36) in
     every state: organelles do not shrink when the sarcomere does, and
     that size still fits inside the 40 px half I band at full
     contraction. Neighboring sarcomeres repeat with the same period. */

  function temStrip(g) {
    var zL = g.zL, zR = g.zR, period = zR - zL, L = period / 2, M = zL + L;
    var mh = g.myosinW / 2, aLen = g.actinTipL - zL, iH = L - mh;
    var RH = 72, Y1 = 26, Y2 = 114, TY = 106, MY = 195;   // row height and tops; centers of the two gaps
    // mitochondrion: half length 16, centered 20 from the Z disc, the same in
    // every state (it spans Z + 4 to Z + 36, inside the shortest half I band)
    var mrx = 16, mo = 4 + mrx;
    function base(s) {                       // s: distance from the nearest Z disc (0 to L)
      var actin = s <= aLen, myosin = s >= iH, d = L - s;
      // M line: dark in the pale H zone; once the thin filaments reach it, a
      // thin line (8 px) darker than the overlap, never paler (#0f0f0f in
      // the #292929 overlap)
      if (myosin && d < 6) return actin ? (d < 4 ? 1.05 : 0.92) : 0.82;
      if (actin && myosin) return 0.92;      // overlap
      if (myosin && d < 16) return 0.48;     // bare zone
      if (myosin) return 0.58;               // H zone
      return 0.30;                           // I band; the Z disc is drawn over it
    }
    function density(x) {
      var u = ((x - zL) % period + period) % period, s = Math.min(u, period - u), v = base(s);
      // thin filament ends are staggered, so each H zone edge fades over 6 px
      if (s > aLen && s < aLen + 6 && s >= iH) v = lerp(0.92, v, (s - aLen) / 6);
      return v;
    }
    function gray(v) { var h = Math.round(225 - 200 * v).toString(16); if (h.length < 2) h = '0' + h; return '#' + h + h + h; }
    // deterministic jitter in [-1, 1): a 32-bit integer hash (murmur3 finalizer),
    // exact in every engine
    function jit(i) {
      var h = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b);
      h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
      return (h >>> 0) / 2147483648 - 1;
    }

    var zs = [], ms = [], k, j, x;
    for (k = -2; k <= 2; k++) {
      if (zL + k * period - aLen < 724 && zL + k * period + aLen > -4) zs.push(zL + k * period);
      if (M + k * period - mh < 735 && M + k * period + mh > -15) ms.push(M + k * period);
    }
    // one myofibril row (local y 0 to RH): bands as run-length boxes, one path per
    // gray; each 2 px cell takes the density at its center (x + 1)
    var runs = {}, order = [], start = -4, prev = density(-3), v;
    for (x = -2; x <= 724; x += 2) {
      v = x < 724 ? density(x + 1) : -1;
      if (v !== prev) {
        var c = gray(prev);
        if (!runs[c]) { runs[c] = ''; order.push(c); }
        runs[c] += 'M' + start + ',0h' + (x - start) + 'v' + RH + 'h' + (start - x) + 'z';
        start = x; prev = v;
      }
    }
    var thin = '', thick = '', zig = '';
    zs.forEach(function (z) {
      for (j = 0; j < 16; j++) thin += 'M' + (z - aLen) + ',' + f1(2.25 + 4.5 * j) + 'H' + (z + aLen);
      zig += 'M' + z + ',0v72M' + (z - 2) + ',0';   // a straight dense core, then the fine zigzag (amplitude 2)
      for (j = 0; j < 9; j++) zig += 'l4,4l-4,4';
    });
    ms.forEach(function (m) { for (j = 0; j < 8; j++) thick += 'M' + (m - mh) + ',' + f1(4.5 + 9 * j) + 'H' + (m + mh); });

    var out = '<defs>' +
      '<filter id="rl-tem" x="0" y="0" width="100%" height="100%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.22 0.85" numOctaves="2" seed="3" result="n"/>' +
        '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.32 0" result="g"/>' +
        '<feBlend in="SourceGraphic" in2="g" mode="multiply" result="b"/>' +
        '<feGaussianBlur in="b" stdDeviation="0.7"/>' +
      '</filter>' +
      '<g id="rl-tmf">' + order.map(function (c) { return '<path fill="' + c + '" d="' + runs[c] + '"/>'; }).join('') +
        '<path d="' + thin + '" stroke="#303030" stroke-opacity="0.25" stroke-width="1.2"/>' +
        '<path d="' + thick + '" stroke="#101010" stroke-opacity="0.45" stroke-width="2.6"/>' +
        '<path d="' + zig + '" fill="none" stroke="#191919" stroke-width="5" stroke-linejoin="round"/></g>' +
      '<g id="rl-tmito"><ellipse rx="' + f1(mrx) + '" ry="7" fill="#4a4a4a" stroke="#1e1e1e" stroke-width="1.2"/>' +
        '<path d="' + [-0.6, -0.3, 0, 0.3, 0.6].map(function (c) { return 'M' + f1(c * mrx) + ',-4v8'; }).join('') + '" stroke="#bdbdbd" stroke-width="0.8"/></g>' +
      '<g id="rl-ttri" stroke="#1e1e1e"><ellipse cx="-8" rx="4.5" ry="6" fill="#5e5e5e"/><ellipse cx="8" rx="4.5" ry="6" fill="#5e5e5e"/>' +
        '<ellipse rx="2.5" ry="5" fill="#e6e6e6" stroke-width="1.2"/></g>' +
      '</defs>';
    out += '<rect width="720" height="204" fill="#cfcfcb"/>';
    out += '<g filter="url(#rl-tem)">';
    out += '<use href="#rl-tmf" y="' + Y1 + '"/><use href="#rl-tmf" x="3" y="' + Y2 + '"/>';
    // gap between the rows: triads at every A-I junction, SR running between them
    var tri = [];
    ms.forEach(function (m) { tri.push(m - mh, m + mh); });
    tri.sort(function (a, b) { return a - b; });
    var sr = 'M-4,' + TY;
    tri.forEach(function (t) { sr += 'H' + (t - 12.5) + 'M' + (t + 12.5) + ',' + TY; });
    out += '<path d="' + sr + 'H724" stroke="#3a3a3a" stroke-width="0.8"/>';
    tri.forEach(function (t) { out += '<use href="#rl-ttri" x="' + t + '" y="' + TY + '"/>'; });
    // glycogen: granules only beside the I band, about 2.2 per 10 px
    var gly = '', n = 0;
    function granules(a, b, cy, dy) {
      var cnt = Math.round((b - a) / 4.5);
      for (var i = 0; i < cnt; i++, n++) {
        gly += 'M' + f1(a + (i + 0.5) * (b - a) / cnt + 1.5 * jit(n)) + ',' + f1(cy + dy * jit(n + 7919)) + 'h0';
      }
    }
    zs.forEach(function (z) {
      if (iH > 14) granules(z - iH + 14, z + iH - 14, TY, 5.5);      // between the triads
      var mOut = 4 + 2 * mrx + 2;
      if (iH - 2 > mOut + 4) { granules(z - iH + 2, z - mOut, MY, 5.5); granules(z + mOut, z + iH - 2, MY, 5.5); }   // past the mitochondria, Z + 38 out to the A-I junction
    });
    out += '<path d="' + gly + '" stroke="#2c2c2c" stroke-width="5" stroke-linecap="round"/>';
    // gap below the lower row: a mitochondrion on each side of every Z disc
    zs.forEach(function (z) { out += '<use href="#rl-tmito" x="' + f1(z - mo) + '" y="' + MY + '"/><use href="#rl-tmito" x="' + f1(z + mo) + '" y="' + MY + '"/>'; });
    out += '</g>';

    // labels under the strip, aligned to the bands of the middle sarcomere
    var aS = M - mh, aE = M + mh, hL = zL + aLen, hR = zR - aLen, mx = zR + mo;
    function bracket(x1, x2, y, col) {
      return '<path d="M' + f1(x1) + ',' + (y - 8) + 'V' + y + 'H' + f1(x2) + 'V' + (y - 8) + '" stroke="' + col + '"/>';
    }
    out += '<rect y="204" width="720" height="92" fill="#fbf6e9"/>';
    // the I band runs from one A band to the next, with the Z disc in its middle
    out += '<g fill="none" stroke-width="2.4">' + bracket(zL - iH + 2, aS - 2, 216, '#5b6b62') + bracket(aS + 2, aE - 2, 216, '#1B3A2D') +
      (hR - hL > 6 ? bracket(hL, hR, 258, '#8C7235') : '') +
      '<path d="M' + zL + ',206V224" stroke="#191919" stroke-width="3"/>' +
      '<path d="M' + mx + ',204V222" stroke="#1B3A2D" stroke-width="1.5"/></g>';
    out += '<g text-anchor="middle" font-weight="700" font-size="22">' +
      '<text x="' + zL + '" y="242" fill="#5b6b62">I band</text>' +
      '<text x="' + M + '" y="242" fill="#1B3A2D">A band</text>' +
      (hR - hL > 6 ? '<text x="' + M + '" y="284" fill="#8C7235">H zone</text>' : '') +
      '<text x="' + zL + '" y="268" font-size="20" font-weight="400" fill="#5b6b62">Z disc in middle</text>' +
      '<text x="' + mx + '" y="242" font-size="20" fill="#3a4a42">mitochondria</text></g>';
    // labels over the strip
    out += '<path d="M500,18L514,99" stroke="#fbf6e9" stroke-width="1.6"/>';
    // with the H zone gone the M line is a thin line, not much darker than the overlap
    // around it, so a short dashed leader points it out, as #sf-Mlead does in
    // the model
    if (hR - hL <= 6) out += '<path id="rl-tMlead" d="M' + M + ',24V44" stroke="#fbf6e9" stroke-width="1.6" stroke-dasharray="3 3"/>';
    out += '<g text-anchor="middle" font-weight="700" fill="#1B3A2D">' +
      '<text x="' + zL + '" y="22" font-size="20">Z</text><text x="' + zR + '" y="22" font-size="20">Z</text>' +
      '<text x="' + M + '" y="22" font-size="20">M line</text>' +
      '<text x="496" y="20" font-size="20" text-anchor="end">triad</text></g>';
    out += '<text x="8" y="17" font-size="17" font-weight="700" fill="#3a4a42">TEM VIEW</text>';
    return out;
  }

  function readSarcomere() {
    function num(id, attr, d) { var el = document.getElementById(id); var v = el ? parseFloat(el.getAttribute(attr)) : NaN; return isNaN(v) ? d : v; }
    return {
      zL: num('sf-zL', 'x1', 120), zR: num('sf-zR', 'x1', 600),
      actinTipL: num('sf-actin-L', 'x2', 320),
      myosinW: num('sf-myosin', 'width', 320)
    };
  }

  function mountSarcomereTem() {
    var model = document.getElementById('sfSvg');
    if (!model || document.getElementById('sfTem')) return;
    var wrap = document.createElement('div');
    wrap.className = 'rl-tem-wrap';
    wrap.innerHTML = '<svg id="sfTem" viewBox="0 0 720 296" preserveAspectRatio="xMidYMid meet" role="img" ' +
      'aria-label="Electron micrograph view of the same sarcomere in two myofibrils: Z discs, I band, A band, H zone, M line, triads and mitochondria" ' +
      'style="display:block;width:100%;height:auto;margin-top:8px;border:1.5px solid #1B3A2D;border-radius:8px;background:#cfcfcb"></svg>' +
      '<p style="margin:6px 2px 0;font-size:12px;line-height:1.45;color:#3a4a42">Same sarcomere, as it looks in an electron micrograph of two myofibrils. ' +
      'Dark where myosin overlaps actin, lighter where only one is present. Switch states and measure each band against the model above: which ones narrow, and which one holds? ' +
      'Between the myofibrils: a triad (T tubule between two SR sacs) at each A-I junction, and mitochondria beside each Z disc.</p>';
    model.insertAdjacentElement('afterend', wrap);
    function render() { document.getElementById('sfTem').innerHTML = temStrip(readSarcomere()); }
    Array.prototype.forEach.call(document.querySelectorAll('[data-sf]'), function (b) { b.addEventListener('click', render); });
    render();
  }

  window.BioReal = window.BioReal || {};
  window.BioReal.tonicity = tonicity;
  window.BioReal.field = build;
  window.BioReal.BARE_VIEWBOX = BARE_VIEWBOX;
  window.BioReal.temStrip = temStrip;
  window.BioReal.mountSarcomereTem = mountSarcomereTem;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountSarcomereTem);
  else mountSarcomereTem();
  window.BioReal.version = 1;
})();
