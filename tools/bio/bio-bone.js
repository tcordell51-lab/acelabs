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

  function svgFor(i) {
    var s = STAGES[i], k = s.key;
    var out = [];
    // Labels for orientation
    out.push('<text x="14" y="28" font-size="9" fill="' + C.mute + '">articular cartilage</text>');
    out.push('<text x="350" y="28" text-anchor="end" font-size="9" fill="' + C.mute + '">articular cartilage</text>');
    // Bone body (compact color everywhere, then the softer regions on top)
    out.push('<path d="M40,40 C22,40 10,62 10,95 C10,128 22,150 40,150 L72,150 C88,150 94,136 102,122 L258,122 C266,136 272,150 288,150 L320,150 C338,150 350,128 350,95 C350,62 338,40 320,40 L288,40 C272,40 266,54 258,68 L102,68 C94,54 88,40 72,40 Z" fill="' + on(k === 'compact' || k === 'osteon', '#efd893', C.compact) + '" stroke="none"/>');
    // Spongy bone + red marrow in both ends
    [56, 304].forEach(function (cx) {
      out.push('<ellipse cx="' + cx + '" cy="95" rx="38" ry="44" fill="' + C.red + '" stroke="' + on(k === 'spongy', C.gold, 'none') + '" stroke-width="' + on(k === 'spongy', 3, 0) + '"/>');
      var lines = [[-30, -20, -6, 4], [-26, 14, -2, -12], [-8, -34, 10, -10], [-4, 30, 14, 8], [10, -24, 30, -2], [8, 22, 28, 2], [-18, -6, 6, 16], [16, -8, 26, 26], [-30, 4, -14, 30], [-20, -34, 0, -24]];
      lines.forEach(function (l) {
        out.push('<line x1="' + (cx + l[0]) + '" y1="' + (95 + l[1]) + '" x2="' + (cx + l[2]) + '" y2="' + (95 + l[3]) + '" stroke="#d9c08f" stroke-width="2.4" stroke-linecap="round"/>');
      });
    });
    // Medullary cavity (yellow marrow)
    out.push('<rect x="102" y="80" width="156" height="30" fill="' + C.yellow + '" stroke="' + on(k === 'medulla', C.gold, 'none') + '" stroke-width="' + on(k === 'medulla', 3, 0) + '"/>');
    out.push('<text x="180" y="99" text-anchor="middle" font-size="9" fill="' + C.ink + '">medullary cavity</text>');
    // Osteon hints in the walls
    for (var x = 112; x <= 248; x += 17) {
      out.push('<circle cx="' + x + '" cy="74" r="3" fill="none" stroke="' + C.ring + '" stroke-width="1"/>');
      out.push('<circle cx="' + x + '" cy="116" r="3" fill="none" stroke="' + C.ring + '" stroke-width="1"/>');
    }
    // Endosteum lines the cavity
    out.push('<path d="M102,80 L258,80 M102,110 L258,110" stroke="' + on(k === 'endo', C.gold, C.endo) + '" stroke-width="' + on(k === 'endo', 3.5, 1.6) + '" fill="none"/>');
    // Epiphyseal lines (old growth plates)
    out.push('<line x1="90" y1="50" x2="90" y2="140" stroke="#a88a4a" stroke-width="1.4" stroke-dasharray="3 3"/>');
    out.push('<line x1="270" y1="50" x2="270" y2="140" stroke="#a88a4a" stroke-width="1.4" stroke-dasharray="3 3"/>');
    // Articular cartilage caps the joint ends
    out.push('<path d="M40,40 C22,40 10,62 10,95 C10,128 22,150 40,150" stroke="' + C.cart + '" stroke-width="7" fill="none" stroke-linecap="round"/>');
    out.push('<path d="M320,40 C338,40 350,62 350,95 C350,128 338,150 320,150" stroke="' + C.cart + '" stroke-width="7" fill="none" stroke-linecap="round"/>');
    // Periosteum everywhere else
    out.push('<path d="M40,40 L72,40 C88,40 94,54 102,68 L258,68 C266,54 272,40 288,40 L320,40 M40,150 L72,150 C88,150 94,136 102,122 L258,122 C266,136 272,150 288,150 L320,150" stroke="' + on(k === 'peri', C.gold, C.ink) + '" stroke-width="' + on(k === 'peri', 5, 2.6) + '" fill="none" stroke-linecap="round"/>');
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
    out.push('<rect x="160" y="66" width="40" height="16" fill="none" stroke="' + C.goldD + '" stroke-width="1" stroke-dasharray="3 2" opacity="' + on(zoomOn, 1, 0.35) + '"/>');
    // Osteon inset
    out.push('<g opacity="' + on(k === 'osteon', 1, on(k === 'compact', 0.85, 0.45)) + '">');
    out.push('<rect x="14" y="196" width="332" height="194" rx="10" fill="' + C.paper + '" stroke="' + on(k === 'osteon', C.gold, C.ink) + '" stroke-width="' + on(k === 'osteon', 2.5, 1.2) + '"/>');
    out.push('<text x="26" y="214" font-size="10" font-weight="700" fill="' + C.ink + '">ZOOM: compact bone, cut across</text>');
    out.push('<line x1="14" y1="226" x2="346" y2="226" stroke="' + C.ink + '" stroke-width="3"/>');
    out.push('<text x="340" y="221" text-anchor="end" font-size="8.5" fill="' + C.mute + '">periosteum</text>');
    // Volkmann canal: down from the periosteum, then across between osteons
    out.push('<rect x="176" y="226" width="8" height="80" fill="#fff" stroke="' + C.ink + '" stroke-width="1"/>');
    out.push('<rect x="128" y="300" width="104" height="9" fill="#fff" stroke="' + C.ink + '" stroke-width="1"/>');
    out.push('<text x="190" y="246" font-size="9" font-weight="700" fill="' + C.ink + '">Volkmann canal (runs across)</text>');
    [120, 240].forEach(function (cx) {
      [46, 36, 26].forEach(function (r) {
        out.push('<circle cx="' + cx + '" cy="305" r="' + r + '" fill="' + (r === 46 ? '#efe2c2' : 'none') + '" stroke="' + C.ring + '" stroke-width="2"/>');
      });
      for (var a = 0; a < 8; a++) {
        var ang = (a / 8) * Math.PI * 2 + 0.3;
        var rr = a % 2 ? 31 : 41;
        var lx = cx + Math.cos(ang) * rr, ly = 305 + Math.sin(ang) * rr;
        out.push('<ellipse cx="' + lx.toFixed(1) + '" cy="' + ly.toFixed(1) + '" rx="3" ry="1.8" fill="#8a6d3b" transform="rotate(' + (ang * 57.3).toFixed(0) + ' ' + lx.toFixed(1) + ' ' + ly.toFixed(1) + ')"/>');
        var ix = cx + Math.cos(ang) * (rr - 6), iy = 305 + Math.sin(ang) * (rr - 6);
        out.push('<line x1="' + lx.toFixed(1) + '" y1="' + ly.toFixed(1) + '" x2="' + ix.toFixed(1) + '" y2="' + iy.toFixed(1) + '" stroke="#a88a4a" stroke-width="0.8"/>');
      }
      out.push('<circle cx="' + cx + '" cy="305" r="9" fill="#fff" stroke="' + C.ink + '" stroke-width="1.6"/>');
      out.push('<circle cx="' + cx + '" cy="305" r="3.6" fill="' + C.vessel + '"/>');
    });
    out.push('<text x="120" y="368" text-anchor="middle" font-size="9" font-weight="700" fill="' + C.ink + '">Haversian canal (center,</text>');
    out.push('<text x="120" y="379" text-anchor="middle" font-size="9" font-weight="700" fill="' + C.ink + '">runs lengthwise)</text>');
    out.push('<text x="240" y="368" text-anchor="middle" font-size="9" font-weight="700" fill="' + C.ink + '">lamellae + lacunae</text>');
    out.push('<text x="240" y="379" text-anchor="middle" font-size="9" font-weight="700" fill="' + C.ink + '">(osteocytes live here)</text>');
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
