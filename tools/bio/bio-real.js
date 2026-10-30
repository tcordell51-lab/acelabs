/* =====================================================================
   Bio Real: true-to-life renderers for the Bio visualizers
   ---------------------------------------------------------------------
   The schematic drawings teach the mechanism; these show what the
   student would actually see (a light-microscope field, a TEM band
   pattern), so the picture in their head matches the real thing.
   Shapes and proportions follow real morphology:
     - red blood cells: biconcave discs with central pallor (isotonic),
       swollen spheres (hypotonic), pale ghosts after hemolysis,
       crenated echinocytes (hypertonic). No nucleus: mature RBCs have
       none.
     - plant cells (onion / Elodea style): rigid walls, a big central
       vacuole, chloroplasts in a thin rim of cytoplasm; plasmolysis
       pulls the protoplast off the wall.
   Everything is deterministic (no Math.random) so frames never flicker
   and snapshots match the live view. Plain SVG gradients and filters;
   no images, no network.

   Hooks: initTonicity (bio-shared.js) calls BioReal.tonicity(params)
   when this file is loaded and falls back to its schematic otherwise.
   ===================================================================== */
(function () {
  'use strict';

  function f1(n) { return (Math.round(n * 10) / 10).toString(); }
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

  /* ---------- the microscope field ---------- */

  var W = 400, H = 320, CX = 200, CY = 163, FR = 124;   // field sits below the caption

  function fieldDefs(tint) {
    return '' +
      '<radialGradient id="rl-field" cx="50%" cy="46%" r="55%">' +
        '<stop offset="0%" stop-color="' + mix('#fbf6ee', tint, 0.0) + '"/>' +
        '<stop offset="70%" stop-color="' + mix('#f1e7d8', tint, 0.15) + '"/>' +
        '<stop offset="100%" stop-color="#cdbfa9"/>' +
      '</radialGradient>' +
      '<radialGradient id="rl-vignette" cx="50%" cy="50%" r="50%">' +
        '<stop offset="80%" stop-color="#000" stop-opacity="0"/>' +
        '<stop offset="100%" stop-color="#000" stop-opacity="0.35"/>' +
      '</radialGradient>' +
      '<clipPath id="rl-clip"><circle cx="' + CX + '" cy="' + CY + '" r="' + FR + '"/></clipPath>' +
      '<filter id="rl-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="0.45"/></filter>' +
      '<filter id="rl-haze" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>' +
      '<filter id="rl-grain" x="0" y="0" width="100%" height="100%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n"/>' +
        '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.40  0 0 0 0 0.35  0 0 0 0.09 0"/>' +
        '<feComposite in2="SourceGraphic" operator="in"/>' +
      '</filter>';
  }

  function fieldOpen() {
    // the dark surround runs past the viewBox so a letterboxed copy (an
    // Ace Card picture) has no light bars at its sides
    return '<rect x="-400" y="-400" width="' + (W + 800) + '" height="' + (H + 800) + '" fill="#141714"/>' +
      '<circle cx="' + CX + '" cy="' + CY + '" r="' + FR + '" fill="url(#rl-field)"/>' +
      '<g clip-path="url(#rl-clip)">';
  }
  function fieldClose(caption, scaleLabel, scalePx) {
    return '<circle cx="' + CX + '" cy="' + CY + '" r="' + FR + '" fill="#cbb" filter="url(#rl-grain)" opacity="0.9"/>' +
      '</g>' +
      '<circle cx="' + CX + '" cy="' + CY + '" r="' + FR + '" fill="url(#rl-vignette)"/>' +
      '<circle cx="' + CX + '" cy="' + CY + '" r="' + FR + '" fill="none" stroke="#2a2d2a" stroke-width="2"/>' +
      '<text x="10" y="18" font-size="10.5" font-weight="700" fill="#e9e2d2">LIGHT MICROSCOPE</text>' +
      '<text x="10" y="31" font-size="10" fill="#e3dccb">' + caption.title + '</text>' +
      '<line x1="' + (W - 14 - scalePx) + '" y1="' + (H - 40) + '" x2="' + (W - 14) + '" y2="' + (H - 40) + '" stroke="#e9e2d2" stroke-width="2.5"/>' +
      '<text x="' + (W - 14 - scalePx / 2) + '" y="' + (H - 46) + '" text-anchor="middle" font-size="9" fill="#e9e2d2">' + scaleLabel + '</text>';
  }

  /* Bottom strip: the mechanism, kept beside the real picture.
     Dot density inside vs outside the cell, and which way water moves. */
  function soluteStrip(ext, diff, lysed) {
    var y = H - 26, out = '';
    out += '<rect x="-400" y="' + (y - 6) + '" width="' + (W + 800) + '" height="32" fill="#141714"/>';
    function box(x, label, n, col) {
      var s = '<rect x="' + x + '" y="' + y + '" width="96" height="20" rx="4" fill="#20251f" stroke="#59604f" stroke-width="1"/>';
      for (var i = 0; i < n; i++) {
        var px = x + 5 + ((i * 37) % 86), py = y + 4 + ((i * 13) % 12);
        s += '<circle cx="' + px + '" cy="' + py + '" r="1.6" fill="' + col + '"/>';
      }
      s += '<text x="' + (x + 48) + '" y="' + (y - 3) + '" text-anchor="middle" font-size="8.5" fill="#bfb6a3">' + label + '</text>';
      return s;
    }
    out += box(70, 'solute inside cell', 15, '#7fb4e0');
    out += box(234, 'solute outside', Math.round(clamp(ext, 0, 100) * 0.3), '#d9b45c');
    var mid = 200, ay = y + 10, txt, path;
    if (Math.abs(diff) < 5) { txt = 'no net flow'; path = ''; }
    else if (diff < 0) { txt = lysed ? 'water rushed in' : 'water in'; path = 'M' + (mid + 26) + ',' + ay + ' L' + (mid - 22) + ',' + ay; }
    else { txt = 'water out'; path = 'M' + (mid - 26) + ',' + ay + ' L' + (mid + 22) + ',' + ay; }
    if (path) {
      out += '<defs><marker id="rl-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#8cc7f2"/></marker></defs>';
      out += '<path d="' + path + '" stroke="#8cc7f2" stroke-width="2.4" marker-end="url(#rl-arrow)"/>';
    }
    out += '<text x="' + mid + '" y="' + (y - 3) + '" text-anchor="middle" font-size="8.5" font-weight="700" fill="#8cc7f2">' + txt + '</text>';
    return out;
  }

  /* ---------- red blood cells ---------- */

  // A fixed smear: positions, sizes and tilts are hand-placed so the
  // field looks natural and never moves between renders.
  var RBCS = [
    { x: 150, y: 124, s: 1.00, k: 0.94, a: 12 }, { x: 236, y: 110, s: 0.96, k: 0.90, a: -20 },
    { x: 290, y: 172, s: 1.04, k: 0.95, a: 35 }, { x: 196, y: 184, s: 1.02, k: 0.97, a: 0 },
    { x: 118, y: 200, s: 0.95, k: 0.88, a: 60 }, { x: 246, y: 238, s: 0.98, k: 0.93, a: -40 },
    { x: 160, y: 256, s: 0.93, k: 0.92, a: 20 }, { x: 98, y: 132, s: 0.90, k: 0.90, a: -15 },
    { x: 318, y: 240, s: 0.92, k: 0.95, a: 50 }, { x: 330, y: 116, s: 0.88, k: 0.90, a: 10 }
  ];
  var RBC_R = 21;   // about 7.5 um at the scale bar below

  function rbcDefs() {
    return '' +
      // isotonic: biconcave disc, pale center (central pallor), darker rim
      '<radialGradient id="rl-rbc-disc" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="#f6ddd8"/><stop offset="30%" stop-color="#f1c9c3"/>' +
        '<stop offset="46%" stop-color="#dc7f84"/><stop offset="68%" stop-color="#cb535c"/>' +
        '<stop offset="90%" stop-color="#bb3c47"/><stop offset="100%" stop-color="#a3303b"/></radialGradient>' +
      // hypotonic: sphere, pallor gone, lit from the upper left
      '<radialGradient id="rl-rbc-sphere" cx="38%" cy="34%" r="70%">' +
        '<stop offset="0%" stop-color="#f0a7a6"/><stop offset="35%" stop-color="#d4545d"/>' +
        '<stop offset="80%" stop-color="#b8343f"/><stop offset="100%" stop-color="#8f2430"/></radialGradient>' +
      // hypertonic: crenated, denser hemoglobin
      '<radialGradient id="rl-rbc-cren" cx="44%" cy="40%" r="62%">' +
        '<stop offset="0%" stop-color="#d9636a"/><stop offset="60%" stop-color="#ad2f3b"/>' +
        '<stop offset="100%" stop-color="#7f1f2a"/></radialGradient>' +
      // lysed: ghost membrane only
      '<radialGradient id="rl-rbc-ghost" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="#f7e3df" stop-opacity="0.15"/>' +
        '<stop offset="85%" stop-color="#e9c2bd" stop-opacity="0.35"/>' +
        '<stop offset="100%" stop-color="#d7a29c" stop-opacity="0.7"/></radialGradient>';
  }

  // Crenated outline: a disc with N rounded spikes; amp grows with tonicity.
  // Drawn once around the origin and placed per cell with <use>, so a
  // field of ten cells stays small enough to ride along on an Ace Card.
  function crenatedPath(r, amp, n) {
    var pts = [], steps = 120;
    for (var i = 0; i < steps; i++) {
      var th = (i / steps) * Math.PI * 2;
      var bump = Math.pow(Math.max(0, Math.cos(n * th)), 4);
      var rr = r * (1 + amp * bump) * (1 + 0.025 * Math.sin(3 * th));
      pts.push(f1(Math.cos(th) * rr) + ',' + f1(Math.sin(th) * rr));
    }
    return 'M' + pts.join(' L') + ' Z';
  }
  function place(c, deg) {
    return 'translate(' + c.x + ' ' + c.y + ') rotate(' + deg + ') scale(' + c.s + ')';
  }

  function rbcField(ext, diff, lysed) {
    var out = '', t;
    var mode = Math.abs(diff) < 5 ? 'iso' : (diff < 0 ? (lysed ? 'lysed' : 'swell') : 'cren');
    if (mode === 'lysed') {
      // hemoglobin leaked out: a faint pink haze through the field
      out += '<g filter="url(#rl-haze)" opacity="0.55">';
      RBCS.forEach(function (c) {
        out += '<circle cx="' + c.x + '" cy="' + c.y + '" r="' + (RBC_R * 1.9) + '" fill="#e7a7a3"/>';
      });
      out += '</g>';
      // ghosts: pale, slightly irregular membranes, every third one torn open
      out += '<defs><path id="rl-ghost" d="' + crenatedPath(RBC_R * 1.22, 0.04, 5) + '"/></defs>';
    } else if (mode === 'cren') {
      t = clamp((diff - 5) / 45, 0, 1);
      var defs = '';
      [7, 8, 9].forEach(function (n) {                  // 7 to 9 rounded spikes around the rim
        defs += '<path id="rl-cren-' + n + '" d="' + crenatedPath(RBC_R * (1 - 0.24 * t), 0.06 + 0.15 * t, n) + '"/>';
      });
      out += '<defs>' + defs + '</defs>';
    }
    RBCS.forEach(function (c, i) {
      var r = RBC_R * c.s, body;
      if (mode === 'iso') {
        body = '<ellipse cx="' + c.x + '" cy="' + c.y + '" rx="' + f1(r) + '" ry="' + f1(r * c.k) + '" transform="rotate(' + c.a + ' ' + c.x + ' ' + c.y + ')" fill="url(#rl-rbc-disc)" stroke="#8c2731" stroke-width="0.7" stroke-opacity="0.5"/>';
      } else if (mode === 'swell') {
        t = clamp((-diff - 5) / 33, 0, 1);              // 0 at the edge of isotonic, 1 just before lysis
        var rs = r * (1 + 0.22 * t), ks = lerp(c.k, 1, t);
        body = '<ellipse cx="' + c.x + '" cy="' + c.y + '" rx="' + f1(rs) + '" ry="' + f1(rs * ks) + '" transform="rotate(' + c.a + ' ' + c.x + ' ' + c.y + ')" fill="url(#rl-rbc-disc)" stroke="#8c2731" stroke-width="0.7" stroke-opacity="0.5"/>' +
          '<ellipse cx="' + c.x + '" cy="' + c.y + '" rx="' + f1(rs) + '" ry="' + f1(rs * ks) + '" transform="rotate(' + c.a + ' ' + c.x + ' ' + c.y + ')" fill="url(#rl-rbc-sphere)" opacity="' + f1(clamp(t * 1.15, 0, 1)) + '"/>';
      } else if (mode === 'lysed') {
        body = '<use href="#rl-ghost" transform="' + place(c, c.a + i * 23) + '" fill="url(#rl-rbc-ghost)" stroke="#c98d88" stroke-width="0.9" stroke-opacity="0.75"' + (i % 3 === 0 ? ' stroke-dasharray="40 6"' : '') + '/>';
      } else {
        body = '<use href="#rl-cren-' + (7 + (i % 3)) + '" transform="' + place(c, c.a + i * 21) + '" fill="url(#rl-rbc-cren)" stroke="#6e1b25" stroke-width="0.6" stroke-opacity="0.6"/>';
      }
      out += '<g filter="url(#rl-soft)">' + body + '</g>';
    });
    return out;
  }

  /* ---------- plant cells (onion / Elodea style) ---------- */

  var CELLS = [
    { x: 64, y: 68, w: 132, h: 74 }, { x: 196, y: 68, w: 132, h: 74 }, { x: 328, y: 68, w: 132, h: 74 },
    { x: -2, y: 142, w: 132, h: 74 }, { x: 130, y: 142, w: 132, h: 74 }, { x: 262, y: 142, w: 132, h: 74 },
    { x: 64, y: 216, w: 132, h: 74 }, { x: 196, y: 216, w: 132, h: 74 }
  ];

  function plantDefs() {
    return '' +
      '<linearGradient id="rl-wall" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#cfdcae"/><stop offset="100%" stop-color="#b9c98f"/></linearGradient>' +
      '<radialGradient id="rl-vac" cx="50%" cy="45%" r="65%">' +
        '<stop offset="0%" stop-color="#f6f4e6" stop-opacity="0.95"/>' +
        '<stop offset="100%" stop-color="#e6ebcf" stop-opacity="0.9"/></radialGradient>' +
      '<radialGradient id="rl-chl" cx="40%" cy="35%" r="70%">' +
        '<stop offset="0%" stop-color="#8fc46a"/><stop offset="60%" stop-color="#4f8f3a"/>' +
        '<stop offset="100%" stop-color="#2f6526"/></radialGradient>' +
      '<ellipse id="rl-c" rx="3.4" ry="2.3" fill="url(#rl-chl)"/>' +
      '<radialGradient id="rl-nuc" cx="40%" cy="35%" r="70%">' +
        '<stop offset="0%" stop-color="#d9d3c3"/><stop offset="100%" stop-color="#9c937f"/></radialGradient>';
  }

  function roundedRect(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    return 'M' + f1(x + r) + ',' + f1(y) + ' H' + f1(x + w - r) + ' Q' + f1(x + w) + ',' + f1(y) + ' ' + f1(x + w) + ',' + f1(y + r) +
      ' V' + f1(y + h - r) + ' Q' + f1(x + w) + ',' + f1(y + h) + ' ' + f1(x + w - r) + ',' + f1(y + h) +
      ' H' + f1(x + r) + ' Q' + f1(x) + ',' + f1(y + h) + ' ' + f1(x) + ',' + f1(y + h - r) +
      ' V' + f1(y + r) + ' Q' + f1(x) + ',' + f1(y) + ' ' + f1(x + r) + ',' + f1(y) + ' Z';
  }

  function plantField(ext, diff) {
    var out = '', WALL = 5;
    // plasmolysis amount: 0 until clearly hypertonic, 1 at the top of the slider
    var p = diff > 5 ? clamp((diff - 5) / 45, 0, 1) : 0;
    var turgid = diff < -5 ? clamp((-diff - 5) / 45, 0, 1) : 0;
    CELLS.forEach(function (c, i) {
      // the wall: rigid, never changes size
      out += '<rect x="' + c.x + '" y="' + c.y + '" width="' + c.w + '" height="' + c.h + '" fill="#e9eed6" stroke="url(#rl-wall)" stroke-width="' + WALL + '"/>';
      var ix = c.x + WALL / 2 + 1, iy = c.y + WALL / 2 + 1, iw = c.w - WALL - 2, ih = c.h - WALL - 2;
      // the protoplast: pressed on the wall when turgid, pulled off it in plasmolysis
      var shrinkX = iw * 0.34 * p, shrinkY = ih * 0.30 * p;
      var px = ix + shrinkX / 2 + (i % 2 ? 2 : -2) * p, py = iy + shrinkY / 2, pw = iw - shrinkX, ph = ih - shrinkY;
      var rad = lerp(2 + turgid * 1, Math.min(pw, ph) * 0.5, p);
      out += '<path d="' + roundedRect(px, py, pw, ph, rad) + '" fill="#cfe0a8" fill-opacity="' + f1(0.85 + 0.1 * p) + '" stroke="#7d9a52" stroke-width="' + f1(0.9 + 0.6 * p) + '"/>';
      // central vacuole fills most of the cell; it shrinks the most in plasmolysis
      var vm = lerp(5, 7, p), vw = Math.max(6, pw - vm * 2 - 6 * p), vh = Math.max(6, ph - vm * 2 - 4 * p);
      out += '<path d="' + roundedRect(px + (pw - vw) / 2, py + (ph - vh) / 2, vw, vh, Math.min(vw, vh) * lerp(0.25, 0.5, p)) + '" fill="url(#rl-vac)"/>';
      // chloroplasts ride in the thin cytoplasm rim, crowding together as it shrinks
      var nC = 12;
      for (var k = 0; k < nC; k++) {
        var u = (k + (i % 3) * 0.3) / nC, cxp, cyp;
        var per = 2 * (pw + ph), d = u * per;
        if (d < pw) { cxp = px + d; cyp = py + 3.2; }
        else if (d < pw + ph) { cxp = px + pw - 3.2; cyp = py + (d - pw); }
        else if (d < 2 * pw + ph) { cxp = px + pw - (d - pw - ph); cyp = py + ph - 3.2; }
        else { cxp = px + 3.2; cyp = py + ph - (d - 2 * pw - ph); }
        cxp = clamp(cxp, px + 4, px + pw - 4); cyp = clamp(cyp, py + 3.4, py + ph - 3.4);
        out += '<use href="#rl-c" transform="translate(' + f1(cxp) + ' ' + f1(cyp) + ') rotate(' + ((k * 47) % 180) + ')"/>';
      }
      // nucleus pressed to one side by the vacuole
      var nx = px + pw * (i % 2 ? 0.78 : 0.22), ny = py + ph * 0.5;
      out += '<ellipse cx="' + f1(nx) + '" cy="' + f1(ny) + '" rx="5.4" ry="4.6" fill="url(#rl-nuc)" stroke="#7a705d" stroke-width="0.6"/>';
      out += '<circle cx="' + f1(nx + 1) + '" cy="' + f1(ny - 0.5) + '" r="1.4" fill="#6f6553"/>';
    });
    return '<g filter="url(#rl-soft)">' + out + '</g>';
  }

  /* ---------- public: the tonicity picture ---------- */

  function tonicity(o) {
    var ext = +o.externalSolute, diff = ext - 50, plant = o.cellType === 'plant';
    var lysed = !plant && !!o.lysed;
    var title;
    if (plant) {
      title = Math.abs(diff) < 5 ? 'Plant cells, isotonic: flaccid, membrane resting on the wall'
        : diff < 0 ? 'Plant cells, hypotonic: turgid, pressed against the wall'
        : (o.plasmolyzed ? 'Plasmolysis: protoplasts pulled off the walls' : 'Hypertonic: protoplasts starting to pull away');
    } else {
      title = Math.abs(diff) < 5 ? 'Red blood cells, isotonic: biconcave discs, pale centers'
        : diff < 0 ? (lysed ? 'Hemolysis: only pale ghosts left, hemoglobin leaked out' : 'Hypotonic: discs swell and round up into spheres')
        : 'Hypertonic: crenated, shrunken and spiky';
    }
    var tint = plant ? '#eef3dd' : '#fbf1ee';
    var out = '<defs>' + fieldDefs(tint) + (plant ? plantDefs() : rbcDefs()) + '</defs>';
    out += fieldOpen();
    out += plant ? plantField(ext, diff) : rbcField(ext, diff, lysed);
    // scale bars: an RBC is about 7.5 um across (drawn 42 px), so 10 um is 56 px;
    // the plant cells are drawn about 60 um wide (74 px), so 50 um is about 60 px
    out += fieldClose({ title: title }, plant ? '50 um' : '10 um', plant ? 60 : 56);
    out += soluteStrip(ext, diff, lysed);
    return out;
  }

  /* ---------- sarcomere: the band pattern of a TEM ----------
     Drawn on the same x axis as the sliding filament model (viewBox
     width 720), so every band sits under the filaments that make it.
     Electron density: Z disc darkest, overlap (actin + myosin) dark,
     H zone (myosin only) lighter, I band (actin only) light, M line a
     thin dark stripe. Neighboring sarcomeres repeat with the same period. */

  function temStrip(g) {
    var zL = g.zL, zR = g.zR, period = zR - zL, L = period / 2;
    var mh = g.myosinW / 2, aLen = g.actinTipL - zL;
    function density(x) {
      var u = ((x - zL) % period + period) % period;
      var s = Math.min(u, period - u);                 // distance from the nearest Z disc
      if (s < 2.6) return 0.95;                         // Z disc
      var actin = s <= aLen, myosin = s >= L - mh;
      if (myosin && Math.abs(s - L) < 2.2) return 0.88; // M line
      if (actin && myosin) return 0.80;                 // overlap
      if (myosin) return 0.58;                          // H zone
      if (actin) return 0.24;                           // I band
      return 0.18;
    }
    function gray(v) { var c = Math.round(232 - v * 175); var h = c.toString(16); if (h.length < 2) h = '0' + h; return '#' + h + h + h; }
    var out = '<defs>' +
      '<filter id="rl-tem" x="0" y="0" width="100%" height="100%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.85 0.22" numOctaves="2" seed="3" result="n"/>' +
        '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.32 0" result="g"/>' +
        '<feBlend in="SourceGraphic" in2="g" mode="multiply" result="b"/>' +
        '<feGaussianBlur in="b" stdDeviation="0.7"/>' +
      '</filter></defs>';
    out += '<rect x="0" y="0" width="720" height="190" fill="#cfcfcb"/>';
    var rows = [30, 78, 126], RH = 40, x, run, v, prev, start;
    out += '<g filter="url(#rl-tem)">';
    var granules = '', fil = '';
    rows.forEach(function (y0, r) {
      // interfibrillar space: glycogen granules (dots), gathered into one path
      for (var k = 0; k < 26; k++) granules += 'M' + ((k * 53 + r * 29) % 720) + ',' + (y0 - 4 + (k % 3)) + 'h0';
      // run-length bands
      start = 0; prev = density(0);
      for (x = 2; x <= 720; x += 2) {
        v = x < 720 ? density(x) : -1;
        if (v !== prev) {
          out += '<rect x="' + start + '" y="' + y0 + '" width="' + (x - start) + '" height="' + RH + '" fill="' + gray(prev) + '"/>';
          start = x; prev = v;
        }
      }
      // thick filaments read as faint lengthwise lines in the A band
      for (var ln = 0; ln < 6; ln++) {
        var yy = y0 + 5 + ln * 6.2;
        for (var c = -1; c <= 1; c++) {
          var m = zL + L + c * period;
          fil += 'M' + f1(m - mh) + ',' + f1(yy) + 'H' + f1(m + mh);
        }
      }
    });
    out += '<path d="' + granules + '" stroke="#7c7c78" stroke-width="2.6" stroke-linecap="round"/>';
    out += '<path d="' + fil + '" stroke="#202020" stroke-opacity="0.18" stroke-width="0.8"/>';
    out += '<ellipse cx="' + (zL + L) + '" cy="176" rx="50" ry="6" fill="#8d8d88"/><ellipse cx="' + (zL + L) + '" cy="176" rx="44" ry="3.4" fill="none" stroke="#5d5d59" stroke-width="0.9" stroke-dasharray="4 3"/>';
    out += '</g>';
    // labels under the strip, aligned to the bands of the middle sarcomere
    var iEnd = zL + (L - mh), aStart = zL + L - mh, aEnd = zL + L + mh, hL = zL + aLen, hR = zR - aLen;
    out += '<rect x="0" y="190" width="720" height="84" fill="#fbf6e9"/>';
    function bracket(x1, x2, y, label, col) {
      if (x2 - x1 < 6) return '';
      return '<path d="M' + f1(x1) + ',' + (y - 8) + ' V' + y + ' H' + f1(x2) + ' V' + (y - 8) + '" fill="none" stroke="' + col + '" stroke-width="2.4"/>' +
        '<text x="' + f1((x1 + x2) / 2) + '" y="' + (y + 24) + '" text-anchor="middle" font-size="22" font-weight="700" fill="' + col + '">' + label + '</text>';
    }
    out += bracket(zL, iEnd, 204, 'I band', '#5b6b62');
    out += bracket(aStart, aEnd, 204, 'A band', '#1B3A2D');
    if (hR - hL > 6) out += bracket(hL, hR, 240, 'H zone', '#8C7235');
    out += '<text x="' + zL + '" y="22" text-anchor="middle" font-size="20" font-weight="700" fill="#1B3A2D">Z</text>';
    out += '<text x="' + zR + '" y="22" text-anchor="middle" font-size="20" font-weight="700" fill="#1B3A2D">Z</text>';
    out += '<text x="' + (zL + L) + '" y="22" text-anchor="middle" font-size="18" fill="#1B3A2D">M line</text>';
    out += '<text x="8" y="22" font-size="17" font-weight="700" fill="#3a4a42">TEM VIEW</text>';
    return out;
  }

  function readSarcomere() {
    function num(id, attr, d) { var el = document.getElementById(id); var v = el ? parseFloat(el.getAttribute(attr)) : NaN; return isNaN(v) ? d : v; }
    return {
      zL: num('sf-zL', 'x1', 100), zR: num('sf-zR', 'x1', 620),
      actinTipL: num('sf-actin-L', 'x2', 320),
      myosinW: num('sf-myosin', 'width', 200)
    };
  }

  function mountSarcomereTem() {
    var model = document.getElementById('sfSvg');
    if (!model || document.getElementById('sfTem')) return;
    var wrap = document.createElement('div');
    wrap.className = 'rl-tem-wrap';
    wrap.innerHTML = '<svg id="sfTem" viewBox="0 0 720 274" preserveAspectRatio="xMidYMid meet" role="img" ' +
      'aria-label="Electron micrograph view of the same sarcomere: Z discs, I band, A band, H zone and M line" ' +
      'style="display:block;width:100%;height:auto;margin-top:8px;border:1.5px solid #1B3A2D;border-radius:8px;background:#cfcfcb"></svg>' +
      '<p style="margin:6px 2px 0;font-size:12px;line-height:1.45;color:#3a4a42">Same sarcomere, as it looks in an electron micrograph. ' +
      'Dark where myosin overlaps actin, lighter where only one is present. Watch the I band and H zone narrow while the A band holds.</p>';
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
