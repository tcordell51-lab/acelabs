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
       discs cup (stomatocytes, the pallor narrows to a slit), then
       round up into evenly dense spheres. The membrane barely
       stretches, so a sphere holds more water yet is a little narrower
       (about 6.7 um). Hemolysis: faint, smooth, empty ghosts about
       6.7 um across in an evenly tinted, nearly empty field.
       Hypertonic: shrunken cells with many short blunt projections
       (echinocytes). No nucleus: mature RBCs have none.
     - Elodea leaf cells at 400x (1.2 px per um): narrow cells in
       parallel files with slanted, staggered end walls, thin colorless
       walls, colorless cytoplasm, chloroplasts packed along the walls
       and over the face, the nucleus faint and mostly hidden.
       Isotonic: small corner gaps in about half the cells (incipient
       plasmolysis). Hypotonic: protoplasts pressed flat on the walls
       (turgid). Hypertonic: first the membrane leaves the corners in
       every cell; once the page calls it plasmolysis (ext above 80),
       uneven plasmolysis: rounded protoplasts, crowded chloroplasts,
       held to the wall by thin (Hechtian) strands.
   Each view is a rectangular camera crop, evenly lit, with its
   magnification in the caption and a scale bar true to the drawing.
   Everything is deterministic (no Math.random) so frames never flicker
   and snapshots match the live view. Repeated shapes are drawn once in
   <defs> and placed with <use>, and small marks that share paint are
   merged into one path, so a frame stays small enough to ride along on
   an Ace Card. Plain SVG gradients and filters; no images, no network.

   Hooks: initTonicity (bio-shared.js) calls BioReal.tonicity(params)
   when this file is loaded and falls back to its schematic otherwise.
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

  function fieldDefs() {
    return '' +
      '<clipPath id="rl-clip"><rect ' + CROP + ' rx="6"/></clipPath>' +
      '<filter id="rl-soft" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="0.45"/></filter>' +
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
    else if (diff < 0) { txt = lysed ? 'water rushed in' : 'water in'; path = 'M' + (mid + 26) + ',' + ay + ' L' + (mid - 22) + ',' + ay; }
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
  var RBC_STROKE = ' stroke="#a9575b" stroke-width="0.6" stroke-opacity="0.6"';

  function radial(id, cols) {
    return '<radialGradient id="' + id + '">' + cols.map(function (c, i) {
      return '<stop offset="' + OFFS[i] + '%" stop-color="' + c + '"/>';
    }).join('') + '</radialGradient>';
  }

  // Edge-on profile around the origin, half width A px. The biconcave
  // shape follows Evans and Fung, with the middle set to 1 um thick:
  // about 2.7 um at the thickest. cup bends it into a stomatocyte (px at the
  // middle), sph (0 to 1) blends it toward a sphere of radius A, and
  // amp with n adds crenation bumps (16 samples per bump keep them round).
  function edgePath(A, cup, sph, amp, n) {
    var pts = [], N = amp ? n * 16 : 48;
    for (var i = 0; i < N; i++) {
      var th = i / N * 2 * Math.PI, c = Math.cos(th), s = Math.sin(th);
      var yd = -s * 0.5 * RBC_PX * (1 + 7.83 * c * c - 4.39 * c * c * c * c) + cup * s * s;
      var x = A * c, y = lerp(yd, -A * s, sph);
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

  function rbcField(ext, diff, lysed) {
    var mode = Math.abs(diff) < 5 ? 'iso' : (diff < 0 ? (lysed ? 'lysed' : 'swell') : 'cren');
    var t = 0, A = RBC_R, defs, edge = '', edgeFill = '#d3807f', vol = 1, title, under = '', keep = 0;
    if (mode === 'iso') {
      defs = radial('rl-rbc', DISC) + '<circle id="rl-d" r="' + A + '" fill="url(#rl-rbc)"' + RBC_STROKE + '/>';
      edge = edgePath(A, 0, 0, 0, 0);
      title = 'Red blood cells, isotonic: biconcave discs with pale centers; two are seen edge-on';
    } else if (mode === 'swell') {
      // t: about 0.06 at the edge of isotonic, 1 just before lysis. The cell
      // first cups (the pallor narrows to a slit), then becomes a sphere
      // of the same membrane area: more volume, a little narrower.
      t = clamp((-diff - 3) / 35, 0, 1);
      A = RBC_R * (1 - 0.11 * t);
      var cup = clamp(t / 0.3, 0, 1), den = clamp((t - 0.3) / 0.7, 0, 1);
      var slit = t > 0.2 && t < 0.7 ? 1 - Math.abs(t - 0.45) / 0.25 : 0;
      defs = radial('rl-rbc', DISC.map(function (c, i) { return mix(mix(c, CUP[i], cup), SPHERE[i], den); })) +
        '<g id="rl-d"><circle r="' + f1(A) + '" fill="url(#rl-rbc)"' + RBC_STROKE + '/>' +
        (slit > 0 ? '<ellipse rx="' + f1(0.45 * A) + '" ry="' + f1(0.12 * A) + '" fill="#f0d0c9" opacity="' + f2(slit) + '"/>' : '') + '</g>';
      edge = edgePath(A, 6 * cup, clamp((t - 0.3) / 0.45, 0, 1), 0, 0);   // side view reaches round first
      edgeFill = mix('#d3807f', '#c86468', den);
      vol = 1 + 0.4 * t;
      // the cup caption holds exactly while the slit is drawn (0.2 < t < 0.7)
      title = t <= 0.2 ? 'Hypotonic: water in, the discs start to swell and the pale centers fade'
        : t < 0.7 ? 'Hypotonic: water in, the discs swell into cups; each pale center narrows to a slit'
        : 'Hypotonic: water in, discs round up into spheres: more volume, a bit narrower, pale center gone';
    } else if (mode === 'lysed') {
      // ghosts reseal at about the sphere's size, smooth and nearly
      // invisible; the released hemoglobin tints the whole field faintly
      defs = '<circle id="rl-d" r="' + f1(RBC_R * 0.9) + '" fill="#f5ebe8" fill-opacity="0.12" stroke="#b8a6a2" stroke-width="0.6" stroke-opacity="0.45"/>';
      under = '<rect ' + CROP + ' fill="#f3e0dc" opacity="0.15"/>';
      // cells differ in how easily they burst: just past the threshold,
      // two tougher cells still hold as small dense spheres
      keep = ext >= 8 ? 2 : 0;
      if (keep) defs += radial('rl-rbc', SPHERE) + '<circle id="rl-sp" r="' + f1(RBC_R * 0.89) + '" fill="url(#rl-rbc)"' + RBC_STROKE + '/>';
      title = keep ? 'Hemolysis: most cells burst, leaving faint empty membranes (ghosts); two tougher cells hold as spheres'
        : 'Hemolysis: cells burst; only faint empty membranes (ghosts) remain';
    } else {
      // hypertonic: shrunken echinocytes, many short blunt projections over
      // the rim and the face, only slightly darker than normal cells. t
      // starts above 0 on the first hypertonic step (ext 55).
      t = clamp((diff - 4) / 46, 0, 1);
      A = RBC_R * (1 - 0.24 * t);
      var amp = 0.04 + 0.06 * t, face = 'M0,0h0';
      for (var k = 0; k < 7; k++) face += 'M' + f1(Math.cos(k * 2 * Math.PI / 7) * 0.45 * A) + ',' + f1(Math.sin(k * 2 * Math.PI / 7) * 0.45 * A) + 'h0';
      defs = '<radialGradient id="rl-rbc"><stop offset="0%" stop-color="#d27a7c"/><stop offset="70%" stop-color="#c4686c"/><stop offset="100%" stop-color="#b0585d"/></radialGradient>';
      [14, 16, 18].forEach(function (n) {
        defs += '<g id="rl-d' + n + '"><path d="' + crenatedPath(A, amp, n) + '" fill="url(#rl-rbc)" stroke="#9a4c51" stroke-width="0.6" stroke-opacity="0.6"/>' +
          '<path d="' + face + '" stroke="#e07f84" stroke-opacity="0.45" stroke-width="2.6" stroke-linecap="round"/></g>';
      });
      edge = edgePath(A, 0, 0.3 * t, amp, 14);
      edgeFill = '#c4686c';
      vol = 1 - 0.25 * t;
      title = t < 0.25 ? 'Hypertonic: water out, the cells start to shrink and crenate (short blunt projections)'
        : 'Hypertonic: water out, cells shrunken and crenated, with many short blunt projections';
    }
    if (edge) defs += '<path id="rl-e" d="' + edge + '" fill="' + edgeFill + '"' + RBC_STROKE + '/>';
    var body = '';
    RBCS.forEach(function (c, i) {
      var s = c[2], sy = s * (mode === 'iso' ? c[3] : mode === 'swell' ? lerp(c[3], 1, t) : 1);
      var href = mode === 'cren' ? '#rl-d' + (14 + 2 * (i % 3)) : '#rl-d', rot = mode === 'cren' ? c[4] + i * 21 : c[4];
      if (c[5] === 2 && mode !== 'lysed') { href = '#rl-e'; rot = c[4]; sy = s; }
      if (keep && (i === 5 || i === 21)) href = '#rl-sp';
      body += '<use href="' + href + '" transform="translate(' + c[0] + ' ' + c[1] + ')' +
        (mode === 'lysed' ? '' : ' rotate(' + rot + ')') + ' scale(' + f2(s) + (f2(sy) !== f2(s) ? ' ' + f2(sy) : '') + ')"' +
        (c[5] === 1 ? ' style="mix-blend-mode:multiply"' : '') + '/>';
    });
    return {
      svg: '<defs>' + defs + '</defs>' + under + '<g filter="url(#rl-soft)">' + body + '</g>',
      title: title, vol: vol
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

  function plantField(ext, diff, plasmolyzed) {
    var iso = Math.abs(diff) < 5;
    plasmolyzed = plasmolyzed && diff >= 5;              // only a hypertonic solution plasmolyzes
    // How far the protoplasts pull in (p), tied to the page's plasmolyzed
    // flag (ext above 80). Hypertonic but not plasmolyzed (ext 55 to 80):
    // p rises from about 0 to 0.1, so in every cell the membrane only
    // leaves the corners (incipient plasmolysis); the ends stay near the
    // walls and no strands form. Plasmolyzed: p runs from 0.46 at ext 81
    // to 1 at ext 100, and the protoplasts pull clear of the end walls.
    var p = plasmolyzed ? lerp(0.43, 1, clamp((diff - 30) / 20, 0, 1)) : (diff >= 5 ? 0.1 * clamp((diff - 4) / 26, 0, 1) : 0);
    var turgid = diff <= -5;
    var gap = '', flat = '', strands = '', nuc = '', walls = '';
    // Chloroplasts: short round-capped strokes, one path for those along
    // the walls and one for those over the face. Each starts with a move
    // relative to the end of the one before, to keep the markup short.
    var paths = { w: '', f: '' }, cur = { w: null, f: null };
    function chloro(key, c, dir, L) {
      var a = [Math.round((c[0] - dir[0] * L / 2) * 10) / 10, Math.round((c[1] - dir[1] * L / 2) * 10) / 10];
      var b = [Math.round((c[0] + dir[0] * L / 2) * 10) / 10, Math.round((c[1] + dir[1] * L / 2) * 10) / 10];
      paths[key] += (cur[key] ? 'm' + f1(a[0] - cur[key][0]) + ',' + f1(a[1] - cur[key][1]) : 'M' + pt(a)) + 'l' + f1(b[0] - a[0]) + ',' + f1(b[1] - a[1]);
      cur[key] = b;
    }
    function rot(v, deg) { var r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; }
    for (var r = 0; r <= 7; r++) walls += 'M' + (FX - 4) + ',' + (FY - 12 + r * ROW_H) + 'H' + (FX + FW + 4);
    CELLS.forEach(function (c, i) {
      var y = c[0], l = c[1], rt = c[2];
      var q = [[l.m - l.d / 2, y], [rt.m - rt.d / 2, y], [rt.m + rt.d / 2, y + ROW_H], [l.m + l.d / 2, y + ROW_H]];
      walls += 'M' + pt(q[0]) + 'L' + pt(q[3]);           // left end wall; the right one is the next cell's
      var inner = insetQuad(q, WALL / 2);                 // the protoplast's place when pressed on the wall
      // incipient plasmolysis: about half the cells at isotonic, every cell once hypertonic
      var inc = diff >= 5 || hash(i, 1) < 0.5;
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
      // cells whose membrane has left the wall somewhere get a clearer outline
      if (inc && !turgid) gap += roundQuad(pq, rad, bowT, bowB).d;
      else flat += roundQuad(pq, rad, bowT, bowB).d;
      // 56 chloroplasts in every state, so they crowd as the protoplast
      // shrinks: an outer row of 24 along the walls, nearly touching (the
      // cyclosis track), an inner row of 12 (each stroke parallel to the
      // wall, within 15 deg), then 20 over the face
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
      if (showNuc) nuc += 'M' + f1(nx - 5.4) + ',' + f1(ny) + 'a5.4,4.6 0 1,0 10.8,0a5.4,4.6 0 1,0 -10.8,0';
      // Hechtian strands: thin threads from the plasmolyzed protoplast to
      // the points where its membrane still holds the wall (only once the
      // membrane has pulled clear of the wall, never before plasmolysis)
      if (plasmolyzed) {
        var ly = lerp(top, top + ih, 0.3 + 0.4 * hash(i, 5)), ry = lerp(top, top + ih, 0.3 + 0.4 * hash(i, 6));
        strands += 'M' + pt([(pq[0][0] + pq[3][0]) / 2, (pq[0][1] + pq[3][1]) / 2]) + 'L' + f1(lerp(inner[0][0], inner[3][0], (ly - top) / ih)) + ',' + f1(ly) +
          'M' + pt([(pq[1][0] + pq[2][0]) / 2, (pq[1][1] + pq[2][1]) / 2]) + 'L' + f1(lerp(inner[1][0], inner[2][0], (ry - top) / ih)) + ',' + f1(ry);
        var onTop = bowT > 0 || (!bowB && hash(i, 7) < 0.5), xm = (pq[0][0] + pq[1][0]) / 2 + (bowT || bowB ? 0 : (hash(i, 8) - 0.5) * 30);
        strands += onTop ? 'M' + f1(xm) + ',' + f1(pq[0][1] + bowT) + 'L' + f1(xm + 2) + ',' + f1(top)
          : 'M' + f1(xm) + ',' + f1(pq[3][1] - bowB) + 'L' + f1(xm - 2) + ',' + f1(top + ih);
      }
    });
    var title = iso ? 'Elodea leaf cells, isotonic: flaccid; in some cells the membrane just starts to leave the corners'
      : diff < 0 ? 'Elodea leaf cells, hypotonic: turgid, protoplasts pressed flat on the walls'
      : plasmolyzed ? 'Plasmolysis (Elodea leaf cells): protoplasts round up and pull off the walls, held by thin strands'
      : 'Elodea leaf cells, hypertonic: water leaves; in every cell the membrane starts to leave the corners';
    // cytoplasm is colorless: only the chloroplasts are green. Each is a
    // dark rim with a lighter middle; the face ones, a little out of
    // focus, are paler.
    var svg = '<defs><path id="rl-cw" d="' + paths.w + '"/><path id="rl-cf" d="' + paths.f + '"/><path id="rl-w" d="' + walls + '"/></defs>' +
      '<g filter="url(#rl-soft)">' +
      // protoplasts a shade denser than the clear solution, so the
      // gaps at the corners and ends read as gaps
      (flat ? '<path d="' + flat + '" fill="#e8eddb" fill-opacity="0.75" stroke="#aab48e" stroke-width="0.6" stroke-opacity="0.2"/>' : '') +
      (gap ? '<path d="' + gap + '" fill="#e8eddb" fill-opacity="0.75" stroke="#8f9c72" stroke-width="0.6" stroke-opacity="' + f2(0.75 + 0.25 * clamp(p * 3, 0, 1)) + '"/>' : '') +
      (nuc ? '<path d="' + nuc + '" fill="#d6d1bf" stroke="#8a826e" stroke-width="0.6" opacity="0.35"/>' : '') +
      '<g fill="none" stroke-linecap="round">' +
      '<use href="#rl-cf" stroke="#4f8a3d" stroke-width="5.6"/><use href="#rl-cf" stroke="#7cb05c" stroke-width="3.8"/>' +
      '<use href="#rl-cw" stroke="#346c2b" stroke-width="' + (turgid ? 4.2 : 4.6) + '"/><use href="#rl-cw" stroke="#62a044" stroke-width="' + (turgid ? 2.6 : 3) + '"/>' +
      (strands ? '<path d="' + strands + '" stroke="#9db07a" stroke-width="0.6" stroke-opacity="0.8"/>' : '') +
      '<use href="#rl-w" stroke="#d7dfc4" stroke-width="' + WALL + '"/><use href="#rl-w" stroke="#9aa781" stroke-width="0.6"/>' +
      '</g></g>';
    // cell volume for the solute strip: the protoplast loses water all
    // through the hypertonic range, a little before plasmolysis and more
    // after it; turgid cells gain only a little (the wall holds them)
    var vol = diff >= 5 ? 1 - 0.25 * Math.max(p, 0.45 * clamp((diff - 4) / 26, 0, 1)) : (turgid ? 1 + 0.06 * clamp((-diff - 5) / 45, 0, 1) : 1);
    return { svg: svg, title: title, vol: vol };
  }

  /* ---------- public: the tonicity picture ---------- */

  function tonicity(o) {
    var ext = +o.externalSolute, diff = ext - 50, plant = o.cellType === 'plant';
    var lysed = !plant && !!o.lysed;
    var v = plant ? plantField(ext, diff, !!o.plasmolyzed) : rbcField(ext, diff, lysed);
    // scale bars: red cells 5.6 px per um, so 10 um is 56 px; Elodea
    // 1.2 px per um, so 50 um is 60 px
    return '<defs>' + fieldDefs() + '</defs>' + fieldOpen(plant ? '#f4f2e6' : '#f6f1e6') + v.svg +
      fieldClose(v.title, plant ? '400x, cropped' : '1000x oil, cropped', plant ? '50 um' : '10 um', plant ? 60 : 56) +
      soluteStrip(ext, diff, v.vol, lysed);
  }

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
  window.BioReal.temStrip = temStrip;
  window.BioReal.mountSarcomereTem = mountSarcomereTem;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountSarcomereTem);
  else mountSarcomereTem();
  window.BioReal.version = 1;
})();
