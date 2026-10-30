/* =====================================================================
   Bone Layers: peel a long bone from the outside in
   ---------------------------------------------------------------------
   Built from the Ace Log: of 15 logged skeletal misses, most were bone
   structure (periosteum vs endosteum, compact vs spongy bone, osteons
   and the Haversian canal, Volkmann canals, ligament vs tendon). The
   existing Skin & Skeleton view never names those layers, so this tab
   does, one stop at a time.

   Mounts into #boneLayersBody (Body Lab tab "Bone Layers" on
   bio-physiology.html). Loaded after bio-shared.js and before
   bio-stick.js, so its DOMContentLoaded listener runs after the Bio
   engine's init and before the stick layer looks for #boneStage.
   Controls: #boneStage range 0-5. Readouts: #boneStageName,
   #boneExplain, #boneTrap. Picture: #boneSvg (rebuilt per stage).
   ===================================================================== */
(function () {
  'use strict';

  var C = {
    ink: '#1B3A2D', gold: '#C9A84C', goldD: '#8C7235', compact: '#e8d9b5', ring: '#c9b07a',
    red: '#f3cdc4', yellow: '#f6e3a0', cart: '#8fb8cf', endo: '#8a5a8c', vessel: '#C25B3F',
    paper: '#fbf6e9', mute: '#5c6a63'
  };

  var STAGES = [
    {
      key: 'peri', name: 'Layer 1 of 6: Periosteum',
      callout: 'periosteum (outside)', target: [180, 68],
      explain: 'The tough outer membrane wrapped around the bone everywhere except the joint surfaces. It carries blood vessels and nerves, and its bone-building cells (osteoblasts) widen the bone. Tendons (muscle to bone) and ligaments (bone to bone) anchor into it.',
      trap: 'Peri means around: the periosteum is the OUTSIDE layer. The endosteum is the inside lining.'
    },
    {
      key: 'compact', name: 'Layer 2 of 6: Compact bone',
      callout: 'compact bone (the wall)', target: [180, 74],
      explain: 'Compact (cortical) bone is the dense, solid wall of the shaft and the thin shell over the ends. It carries the load. Its building block is the osteon.',
      trap: 'Compact bone is built from osteons. Spongy bone has none.'
    },
    {
      key: 'osteon', name: 'Layer 3 of 6: Osteon (zoom)',
      callout: 'zoom into the wall', target: [170, 74],
      explain: 'An osteon (Haversian system) is rings of bone matrix (lamellae) around a central Haversian canal that carries vessels and nerves. Osteocytes sit in lacunae and connect through canaliculi. Volkmann canals run across, linking osteons to each other and to the periosteum.',
      trap: 'The Haversian canal runs along the length of the bone, through the center of each osteon. Volkmann canals run across.'
    },
    {
      key: 'endo', name: 'Layer 4 of 6: Endosteum',
      callout: 'endosteum (inner lining)', target: [180, 80],
      explain: 'The endosteum is the thin membrane lining the inside: the medullary cavity, the struts of spongy bone and the canals. Its cells remodel bone from within.',
      trap: 'Endo means inside. If a question says the layer lines the medullary cavity, the answer is the endosteum.'
    },
    {
      key: 'spongy', name: 'Layer 5 of 6: Spongy bone',
      callout: 'spongy bone + red marrow', target: [56, 95],
      explain: 'Spongy (cancellous) bone is a lattice of thin struts called trabeculae, at the ends of long bones and inside flat bones. It has no osteons. In flat bones (sternum, hip, skull) and the ends of some long bones, red marrow fills the spaces and makes blood cells.',
      trap: 'Red marrow (blood cells) lives in spongy bone. The shaft cavity of an adult long bone holds yellow marrow.'
    },
    {
      key: 'medulla', name: 'Layer 6 of 6: Medullary cavity',
      callout: 'medullary cavity (yellow marrow)', target: [180, 95],
      explain: 'The medullary cavity is the hollow center of the shaft. In adults it holds yellow marrow, which is mostly fat. A hollow tube is light but stiff.',
      trap: 'Yellow marrow stores fat; it does not make blood cells. After severe blood loss it can turn back into red marrow.'
    }
  ];

  var TEMPLATE =
    '<div style="background:linear-gradient(180deg,#fbf6e9 0%,#f0e9d6 100%);border-radius:10px;padding:16px">' +
      '<div style="text-align:center;margin-bottom:10px">' +
        '<div style="font-family:\'Playfair Display\',serif;font-size:18px;font-weight:700;color:#1B3A2D">Bone Layers: peel it from the outside in</div>' +
        '<div style="font-size:12px;color:#1B3A2D;margin-top:4px;font-style:italic">Peri is outside. Endo is inside. Drag to peel.</div>' +
      '</div>' +
      '<div style="background:#fff;border:1.5px solid #1B3A2D;border-radius:10px;padding:12px 14px;margin-bottom:12px">' +
        '<div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#1B3A2D">' +
          '<span>Outside</span><span>Center</span></div>' +
        '<input id="boneStage" type="range" min="0" max="5" step="1" value="0" aria-label="Bone layer, from the outside (1) to the center (6)" style="width:100%;min-height:44px;accent-color:#C25B3F">' +
        '<div id="boneStageName" style="text-align:center;font-weight:700;color:#C25B3F;font-size:14px"></div>' +
      '</div>' +
      '<svg id="boneSvg" viewBox="0 0 360 396" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Long bone, cut lengthwise, with a zoom of compact bone" style="display:block;width:100%;height:auto;background:#fff;border:1.5px solid #1B3A2D;border-radius:8px"></svg>' +
      '<div style="background:#fff;border:1.5px solid #1B3A2D;border-radius:10px;padding:12px 14px;margin-top:12px">' +
        '<p id="boneExplain" style="margin:0;font-size:14px;line-height:1.55;color:#1B3A2D"></p>' +
        '<p id="boneTrap" style="margin:8px 0 0;font-size:13px;line-height:1.5;color:#9b4500"></p>' +
      '</div>' +
    '</div>';

  function on(active, a, b) { return active ? a : b; }

  /* Deterministic pseudo-random numbers, so the drawing never changes
     between renders (no flicker, and snapshots match the live view). */
  function rng(seed) {
    return function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  }
  function f1(n) { return (Math.round(n * 10) / 10).toString(); }

  var OUTLINE = 'M40,40 C22,40 10,62 10,95 C10,128 22,150 40,150 L72,150 C88,150 94,136 102,122 L258,122 C266,136 272,150 288,150 L320,150 C338,150 350,128 350,95 C350,62 338,40 320,40 L288,40 C272,40 266,54 258,68 L102,68 C94,54 88,40 72,40 Z';

  function defs() {
    return '<defs>' +
      '<linearGradient id="bl-cut" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#f5eedd"/><stop offset="50%" stop-color="#ece1c6"/><stop offset="100%" stop-color="#f3ebd7"/></linearGradient>' +
      '<radialGradient id="bl-red" cx="50%" cy="50%" r="60%">' +
        '<stop offset="0%" stop-color="#c85a5f"/><stop offset="100%" stop-color="#a5444c"/></radialGradient>' +
      '<linearGradient id="bl-yellow" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#f3d67c"/><stop offset="100%" stop-color="#e5bd56"/></linearGradient>' +
      '<linearGradient id="bl-cart" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#f1f6f8"/><stop offset="100%" stop-color="#bfd3dc"/></linearGradient>' +
      '<filter id="bl-grain" x="0" y="0" width="100%" height="100%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="11" result="n"/>' +
        '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.48  0 0 0 0 0.36  0 0 0 0.22 0" result="g"/>' +
        '<feComposite in="g" in2="SourceGraphic" operator="in" result="gi"/>' +
        '<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="gi"/></feMerge></filter>' +
      '<clipPath id="bl-bone"><path d="' + OUTLINE + '"/></clipPath>' +
      '<clipPath id="bl-epiL"><ellipse cx="58" cy="95" rx="41" ry="45"/></clipPath>' +
      '<clipPath id="bl-epiR"><ellipse cx="302" cy="95" rx="41" ry="45"/></clipPath>' +
      '<clipPath id="bl-cav"><rect x="102" y="80" width="156" height="30"/></clipPath>' +
      '<clipPath id="bl-inset"><rect x="15" y="227" width="330" height="134"/></clipPath>' +
      trabeculae(7) + osteon('bl-ostA', 3) + osteon('bl-ostB', 13) +
      '</defs>';
  }

  // Cancellous bone: a connected lattice of struts (trabeculae) built on a
  // jittered grid, with red marrow showing through every hole. Struts and
  // node dots are grouped by width into a few paths, and the lattice is
  // drawn once (centered on x = 0) and placed at both ends with <use>, so
  // the picture stays light enough to save on an Ace Card.
  function trabeculae(seed) {
    var r = rng(seed), pts = [], step = 8.5, gx, gy;
    var struts = { '1.6': '', '2.2': '', '2.8': '' }, nodes = { '2.6': '', '3.4': '', '4.4': '' };
    for (gy = 0; gy < 12; gy++) {
      pts.push([]);
      for (gx = 0; gx < 11; gx++) {
        pts[gy].push([-44 + gx * step + (r() - 0.5) * 5, 51 + gy * step + (r() - 0.5) * 5]);
      }
    }
    function strut(a, b) {
      var w = 1.3 + r() * 1.6, mx = (a[0] + b[0]) / 2 + (r() - 0.5) * 3, my = (a[1] + b[1]) / 2 + (r() - 0.5) * 3;
      struts[w < 1.85 ? '1.6' : (w < 2.45 ? '2.2' : '2.8')] +=
        'M' + f1(a[0]) + ',' + f1(a[1]) + 'Q' + f1(mx) + ',' + f1(my) + ' ' + f1(b[0]) + ',' + f1(b[1]);
    }
    for (gy = 0; gy < 12; gy++) {
      for (gx = 0; gx < 11; gx++) {
        var p0 = pts[gy][gx];
        if (gx < 10 && r() < 0.78) strut(p0, pts[gy][gx + 1]);
        if (gy < 11 && r() < 0.78) strut(p0, pts[gy + 1][gx]);
        if (gx < 10 && gy < 11 && r() < 0.22) strut(p0, pts[gy + 1][gx + 1]);
        var nr = 1.2 + r() * 1.1;                     // a thicker knot where struts meet
        nodes[nr < 1.55 ? '2.6' : (nr < 1.95 ? '3.4' : '4.4')] += 'M' + f1(p0[0]) + ',' + f1(p0[1]) + 'h0';
      }
    }
    var out = '<g id="bl-trab" fill="none" stroke="#efe1bd" stroke-linecap="round">';
    Object.keys(struts).forEach(function (w) { if (struts[w]) out += '<path d="' + struts[w] + '" stroke-width="' + w + '"/>'; });
    Object.keys(nodes).forEach(function (w) { if (nodes[w]) out += '<path d="' + nodes[w] + '" stroke-width="' + w + '"/>'; });
    return out + '</g>';
  }

  function circleD(x, y, rr) {
    return 'M' + f1(x - rr) + ',' + f1(y) + 'a' + f1(rr) + ',' + f1(rr) + ' 0 1,0 ' + f1(2 * rr) + ',0a' + f1(rr) + ',' + f1(rr) + ' 0 1,0 ' + f1(-2 * rr) + ',0';
  }

  function fatGlobules() {
    var r = rng(5), d = '';
    for (var i = 0; i < 70; i++) {
      var x = 104 + r() * 152, y = 81 + r() * 28, rr = 2 + r() * 3.2;
      d += circleD(x, y, rr);
    }
    return '<path d="' + d + '" fill="#f8e6a8" fill-opacity="0.85" stroke="#d6aa45" stroke-width="0.5"/>';
  }

  // Ground section of compact bone: osteons with concentric lamellae, dark
  // Haversian canals, lacunae (osteocytes) lying along the lamellae with
  // hair-thin canaliculi, bright cement lines. Two osteon patterns are drawn
  // once around the origin (R = 32) and placed, turned and sized with <use>.
  var OST_R = 32;
  function osteon(id, seed) {
    var r = rng(seed), R = OST_R, rings = '', can = '', lac = '';
    for (var k = 1; k <= 7; k++) rings += circleD(0, 0, 8 + (R - 9) * k / 7);
    for (var j = 0; j < 14; j++) {
      var a = (j / 14) * Math.PI * 2 + r() * 0.3, rad = 13 + r() * (R - 18);
      var lx = Math.cos(a) * rad, ly = Math.sin(a) * rad, tx = -Math.sin(a) * 1.4, ty = Math.cos(a) * 1.4;
      for (var c = 0; c < 4; c++) {     // canaliculi run mostly toward the canal and outward
        var ca = a + (c % 2 ? Math.PI : 0) + (r() - 0.5) * 0.9, cl = 2.5 + r() * 3;
        can += 'M' + f1(lx) + ',' + f1(ly) + 'l' + f1(Math.cos(ca) * cl) + ',' + f1(Math.sin(ca) * cl);
      }
      lac += 'M' + f1(lx - tx) + ',' + f1(ly - ty) + 'L' + f1(lx + tx) + ',' + f1(ly + ty);
    }
    return '<g id="' + id + '">' +
      '<circle r="' + R + '" fill="#e9dcbe" stroke="#f6efdc" stroke-width="1.8"/>' +
      '<path d="' + rings + '" fill="none" stroke="#b49c6c" stroke-width="0.7" stroke-opacity="0.75"/>' +
      '<path d="' + can + '" stroke="#3b2c1f" stroke-width="0.35" stroke-opacity="0.55"/>' +
      '<path d="' + lac + '" stroke="#3b2c1f" stroke-width="2" stroke-linecap="round"/>' +
      '<circle r="7.5" fill="#3a2b1e" stroke="#8a7350" stroke-width="1"/>' +
      '<circle cx="-1.5" cy="-1.5" r="2.6" fill="#b5463f"/>' +
      '</g>';
  }
  function placeOsteon(id, cx, cy, R, deg) {
    return '<use href="#' + id + '" transform="translate(' + cx + ' ' + cy + ') rotate(' + deg + ') scale(' + f1(R / OST_R * 100) / 100 + ')"/>';
  }

  function svgFor(i) {
    var s = STAGES[i], k = s.key, out = [];
    out.push(defs());
    out.push('<rect x="0" y="0" width="360" height="396" fill="#fbf7ee"/>');
    out.push('<text x="14" y="28" font-size="9" fill="' + C.mute + '">articular cartilage</text>');
    out.push('<text x="346" y="28" text-anchor="end" font-size="9" fill="' + C.mute + '">articular cartilage</text>');

    // Cut face of the bone (compact bone), with lengthwise canals in the walls
    out.push('<path d="' + OUTLINE + '" fill="url(#bl-cut)" filter="url(#bl-grain)"/>');
    out.push('<g clip-path="url(#bl-bone)" opacity="0.85">');
    [71, 74.5, 77.5, 112.5, 115.5, 119].forEach(function (y, n) {
      out.push('<line x1="96" y1="' + y + '" x2="264" y2="' + y + '" stroke="#c7b083" stroke-width="0.8" stroke-dasharray="' + (n % 2 ? '18 4 7 3' : '11 3 22 4') + '"/>');
    });
    out.push('</g>');
    if (k === 'compact' || k === 'osteon') {
      out.push('<path d="M102,68 L258,68 L258,80 L102,80 Z M102,110 L258,110 L258,122 L102,122 Z" fill="' + C.gold + '" fill-opacity="0.28" stroke="' + C.gold + '" stroke-width="2"/>');
    }

    // Spongy bone with red marrow at both ends
    [[58, 1, 'bl-epiL'], [302, -1, 'bl-epiR']].forEach(function (e) {
      // the right end shows the same lattice turned half a circle
      var place = e[1] > 0 ? 'translate(' + e[0] + ' 0)' : 'translate(' + e[0] + ' 0) rotate(180 0 95)';
      out.push('<g clip-path="url(#' + e[2] + ')"><ellipse cx="' + e[0] + '" cy="95" rx="41" ry="45" fill="url(#bl-red)"/>' +
        '<use href="#bl-trab" transform="' + place + '"/>' +
        '<ellipse cx="' + e[0] + '" cy="95" rx="40" ry="44" fill="none" stroke="#efe4c8" stroke-width="3.2"/></g>');
      if (k === 'spongy') out.push('<ellipse cx="' + e[0] + '" cy="95" rx="41" ry="45" fill="none" stroke="' + C.gold + '" stroke-width="3"/>');
    });

    // Medullary cavity: yellow marrow (fat)
    out.push('<g clip-path="url(#bl-cav)"><rect x="102" y="80" width="156" height="30" fill="url(#bl-yellow)"/>' + fatGlobules() + '</g>');
    if (k === 'medulla') out.push('<rect x="102" y="80" width="156" height="30" fill="none" stroke="' + C.gold + '" stroke-width="3"/>');
    out.push('<text x="180" y="99" text-anchor="middle" font-size="9" font-weight="700" fill="#6b4f12">medullary cavity</text>');

    // Nutrient artery through the compact wall into the marrow
    out.push('<path d="M176,62 C178,70 181,76 186,84 C190,90 198,92 210,94" fill="none" stroke="#b5463f" stroke-width="1.6" stroke-linecap="round"/>');

    // Endosteum lines the cavity
    out.push('<path d="M102,80 L258,80 M102,110 L258,110" stroke="' + (k === 'endo' ? C.gold : '#a97aa6') + '" stroke-width="' + (k === 'endo' ? 3.5 : 1.3) + '" fill="none"/>');

    // Epiphyseal lines: the closed growth plates, a dense wavy line
    out.push('<path d="M90,52 C86,70 94,88 89,106 C85,122 92,134 90,140" fill="none" stroke="#cdb684" stroke-width="2"/>');
    out.push('<path d="M270,52 C274,70 266,88 271,106 C275,122 268,134 270,140" fill="none" stroke="#cdb684" stroke-width="2"/>');

    // Articular cartilage: glossy caps on the joint surfaces
    out.push('<path d="M40,40 C22,40 10,62 10,95 C10,128 22,150 40,150" stroke="url(#bl-cart)" stroke-width="8" fill="none" stroke-linecap="round"/>');
    out.push('<path d="M320,40 C338,40 350,62 350,95 C350,128 338,150 320,150" stroke="url(#bl-cart)" stroke-width="8" fill="none" stroke-linecap="round"/>');
    out.push('<path d="M36,44 C21,47 14,66 14,92" stroke="#ffffff" stroke-opacity="0.7" stroke-width="1.6" fill="none" stroke-linecap="round"/>');
    out.push('<path d="M324,44 C339,47 346,66 346,92" stroke="#ffffff" stroke-opacity="0.7" stroke-width="1.6" fill="none" stroke-linecap="round"/>');

    // Periosteum: an outer fibrous layer and an inner cellular layer, with vessels
    var PERI = 'M40,40 L72,40 C88,40 94,54 102,68 L258,68 C266,54 272,40 288,40 L320,40 M40,150 L72,150 C88,150 94,136 102,122 L258,122 C266,136 272,150 288,150 L320,150';
    out.push('<path d="' + PERI + '" stroke="#e8c8b6" stroke-width="4.2" fill="none" stroke-linecap="round"/>');
    out.push('<path d="' + PERI + '" stroke="#c98e7c" stroke-width="1" fill="none" stroke-linecap="round"/>');
    [[120, 66], [200, 66], [150, 124], [232, 124], [60, 38], [300, 152]].forEach(function (v, n) {
      out.push('<path d="M' + (v[0] - 9) + ',' + v[1] + ' q4,' + (n % 2 ? -2 : 2) + ' 9,0 t9,0" stroke="#b5463f" stroke-width="0.9" fill="none"/>');
    });
    if (k === 'peri') out.push('<path d="' + PERI + '" stroke="' + C.gold + '" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-opacity="0.95"/>');

    // Region labels
    out.push('<text x="180" y="140" text-anchor="middle" font-size="9" fill="' + C.mute + '">diaphysis (shaft)</text>');
    out.push('<text x="56" y="166" text-anchor="middle" font-size="9" fill="' + C.mute + '">epiphysis</text>');
    out.push('<text x="304" y="166" text-anchor="middle" font-size="9" fill="' + C.mute + '">epiphysis</text>');
    out.push('<text x="96" y="178" font-size="8.5" fill="#8C7235">epiphyseal line (old growth plate)</text>');

    // Callout for the active layer
    out.push('<line x1="180" y1="38" x2="' + s.target[0] + '" y2="' + s.target[1] + '" stroke="' + C.goldD + '" stroke-width="1.4"/>');
    out.push('<circle cx="' + s.target[0] + '" cy="' + s.target[1] + '" r="3.5" fill="' + C.goldD + '"/>');
    out.push('<text x="180" y="32" text-anchor="middle" font-size="11.5" font-weight="700" fill="' + C.goldD + '">' + s.callout + '</text>');

    // Zoom connector
    var zoomOn = k === 'osteon' || k === 'compact';
    out.push('<rect x="160" y="66" width="40" height="16" fill="none" stroke="' + C.goldD + '" stroke-width="1" stroke-dasharray="3 2" opacity="' + (zoomOn ? 1 : 0.35) + '"/>');

    // Osteon inset: a ground section of compact bone, cut across
    out.push('<g opacity="' + (k === 'osteon' ? 1 : (k === 'compact' ? 0.9 : 0.55)) + '">');
    out.push('<rect x="14" y="196" width="332" height="194" rx="10" fill="#fbf6e9" stroke="' + (k === 'osteon' ? C.gold : C.ink) + '" stroke-width="' + (k === 'osteon' ? 2.5 : 1.2) + '"/>');
    out.push('<text x="26" y="214" font-size="10" font-weight="700" fill="' + C.ink + '">ZOOM: compact bone, ground section</text>');
    out.push('<g clip-path="url(#bl-inset)">');
    out.push('<rect x="15" y="227" width="330" height="134" fill="#dccaa3" filter="url(#bl-grain)"/>');
    // interstitial lamellae: old osteon fragments between the new ones
    var ri = rng(29), arcs = '';
    for (var n = 0; n < 16; n++) {
      var ix = 20 + ri() * 320, iy = 232 + ri() * 124, ir = 14 + ri() * 22, a0 = ri() * 6.28;
      arcs += 'M' + f1(ix + Math.cos(a0) * ir) + ',' + f1(iy + Math.sin(a0) * ir) + 'A' + f1(ir) + ',' + f1(ir) + ' 0 0 1 ' + f1(ix + Math.cos(a0 + 1.2) * ir) + ',' + f1(iy + Math.sin(a0 + 1.2) * ir);
    }
    out.push('<path d="' + arcs + '" fill="none" stroke="#b49c6c" stroke-width="0.7" stroke-opacity="0.6"/>');
    out.push(placeOsteon('bl-ostA', 40, 258, 30, 0) + placeOsteon('bl-ostB', 318, 252, 31, 70) + placeOsteon('bl-ostB', 44, 340, 30, 200) +
      placeOsteon('bl-ostA', 320, 336, 32, 140) + placeOsteon('bl-ostA', 180, 352, 24, 260));
    // Volkmann canal: down from the periosteum, then across through the lamellae
    out.push('<path d="M178,227 L178,298 M110,300 L245,296" stroke="#3a2b1e" stroke-width="6" fill="none" stroke-linecap="round"/>');
    out.push(placeOsteon('bl-ostB', 110, 300, 40, 30) + placeOsteon('bl-ostA', 245, 296, 40, 110));
    out.push('<path d="M150,299 L205,297 M178,258 L178,298" stroke="#3a2b1e" stroke-width="6" stroke-linecap="round"/>');
    out.push('</g>');
    out.push('<line x1="15" y1="226" x2="345" y2="226" stroke="#e8c8b6" stroke-width="4"/><line x1="15" y1="228" x2="345" y2="228" stroke="#c98e7c" stroke-width="1"/>');
    out.push('<text x="340" y="221" text-anchor="end" font-size="8.5" fill="' + C.mute + '">periosteum</text>');
    out.push('<text x="186" y="246" font-size="9" font-weight="700" fill="' + C.ink + '">Volkmann canal (runs across)</text>');
    out.push('<line x1="110" y1="300" x2="96" y2="352" stroke="' + C.ink + '" stroke-width="0.9"/>');
    out.push('<line x1="252" y1="282" x2="268" y2="352" stroke="' + C.ink + '" stroke-width="0.9"/>');
    out.push('<rect x="16" y="358" width="328" height="30" fill="#fbf6e9"/>');
    out.push('<text x="96" y="370" text-anchor="middle" font-size="9" font-weight="700" fill="' + C.ink + '">Haversian canal (center,</text>');
    out.push('<text x="96" y="381" text-anchor="middle" font-size="9" font-weight="700" fill="' + C.ink + '">runs lengthwise)</text>');
    out.push('<text x="268" y="370" text-anchor="middle" font-size="9" font-weight="700" fill="' + C.ink + '">lacunae + canaliculi</text>');
    out.push('<text x="268" y="381" text-anchor="middle" font-size="9" font-weight="700" fill="' + C.ink + '">(osteocytes live here)</text>');
    out.push('</g>');
    return out.join('');
  }

  function initBoneLayers() {
    var body = document.getElementById('boneLayersBody');
    if (!body) return;
    body.innerHTML = TEMPLATE;
    var input = document.getElementById('boneStage');
    function render(v) {
      var i = Math.max(0, Math.min(STAGES.length - 1, Math.round(+v) || 0));
      var s = STAGES[i];
      document.getElementById('boneSvg').innerHTML = svgFor(i);
      document.getElementById('boneStageName').textContent = s.name;
      document.getElementById('boneExplain').textContent = s.explain;
      document.getElementById('boneTrap').textContent = 'Trap: ' + s.trap;
    }
    input.addEventListener('input', function (e) { render(e.target.value); });
    input.addEventListener('change', function (e) { render(e.target.value); });
    render(0);
  }

  window.BoneLayers = { init: initBoneLayers, stages: STAGES.length };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initBoneLayers);
  else initBoneLayers();
})();
