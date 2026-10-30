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

   The picture is a long bone cut lengthwise, with the marrow of an adult
   femur (upper end on the left, lower end on the right). Its ends are
   simplified caps: no femoral head, neck or trochanter is drawn, so the
   upper-end label says "like adult femur". Below it is a zoom of a
   ground section of the shaft wall cut across. Everything is drawn in
   code, deterministically.
   ===================================================================== */
(function () {
  'use strict';

  var C = {
    ink: '#1B3A2D', gold: '#C9A84C', goldD: '#8C7235', bone: '#efe4c8', trab: '#efe1bd',
    endo: '#a97aa6', vessel: '#b5463f', mute: '#5c6a63', dark: '#1e1612'
  };

  var STAGES = [
    {
      key: 'peri', name: 'Layer 1 of 6: Periosteum',
      callout: 'periosteum (outside)', target: [180, 66],
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
      callout: 'zoom into the wall', target: [236, 74],
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
      callout: 'spongy bone + red marrow', target: [30, 95],
      explain: 'Spongy (cancellous) bone is a lattice of thin struts called trabeculae, at the ends of long bones and inside flat bones. It has no osteons. In flat bones (sternum, hip, skull) and the ends of some long bones, red marrow fills the spaces and makes blood cells.',
      trap: 'Red marrow (blood cells) lives in spongy bone. The shaft cavity of an adult long bone holds yellow marrow.'
    },
    {
      key: 'medulla', name: 'Layer 6 of 6: Medullary cavity',
      callout: 'medullary cavity (yellow marrow)', target: [180, 90],
      explain: 'The medullary cavity is the hollow center of the shaft. In adults it holds yellow marrow, which is mostly fat. A hollow tube is light but stiff.',
      trap: 'Yellow marrow stores fat; it does not make blood cells. After severe blood loss it can turn back into red marrow.'
    }
  ];

  var H = 410;   // viewBox height
  // The side padding shrinks to 4px on a 390 px phone (16px from about 700 px
  // wide), so the picture gets the width and its small labels read larger.
  var TEMPLATE =
    '<div style="background:linear-gradient(180deg,#fbf6e9 0%,#f0e9d6 100%);border-radius:10px;padding:16px clamp(4px,4vw - 12px,16px)">' +
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
      '<svg id="boneSvg" viewBox="0 0 360 ' + H + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Long bone like an adult femur, cut lengthwise, with a zoom of a cross-section of its compact wall" style="display:block;width:100%;height:auto;background:#fff;border:1.5px solid #1B3A2D;border-radius:8px"></svg>' +
      '<div style="background:#fff;border:1.5px solid #1B3A2D;border-radius:10px;padding:12px 14px;margin-top:12px">' +
        '<p id="boneExplain" style="margin:0;font-size:14px;line-height:1.55;color:#1B3A2D"></p>' +
        '<p id="boneTrap" style="margin:8px 0 0;font-size:13px;line-height:1.5;color:#9b4500"></p>' +
      '</div>' +
    '</div>';

  /* Deterministic pseudo-random numbers, so the drawing never changes
     between renders (no flicker, and snapshots match the live view). */
  function rng(seed) {
    return function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  }
  function f1(n) { return (Math.round(n * 10) / 10).toString(); }
  function f0(n) { return Math.round(n).toString(); }

  /* ---------- gross bone geometry ----------
     Shaft x 84-276 (192 of the bone's 339 px), 54 px tall (y 68-122).
     Each end flares like a funnel (the metaphysis) into a wide, flat-ended
     cap (the epiphysis). The upper end (left) is 108 px tall with one
     rounded joint surface; the lower end (right) is 8% narrower, with two
     condyles and a shallow notch between them. The bone is symmetric
     about y = 95, so the bottom edge mirrors the top.
     Cubic segments are [c1x, c1y, c2x, c2y, x, y]. */
  var TOP_L = [[39, 40, 46, 41.5, 50, 46], [57, 58, 68, 67, 84, 68]];          // from (32,41.5) to the shaft
  var TOP_R = [[292, 67, 303, 59, 310, 48.5], [313, 45, 319, 44.5, 326, 45.5]]; // from (276,68) to the joint
  var JOINT_L = [[17, 45, 10, 68, 10, 95], [10, 122, 17, 145, 32, 148.5]];      // from (32,41.5), top to bottom
  var JOINT_R = [[340, 47, 349, 58, 349, 72], [349, 82, 347, 88, 344, 92], [343, 94, 343, 96, 344, 98],
    [347, 102, 349, 108, 349, 118], [349, 132, 340, 143, 326, 144.5]];         // from (326,45.5), top to bottom

  function mirror(segs) { return segs.map(function (s) { return [s[0], 190 - s[1], s[2], 190 - s[3], s[4], 190 - s[5]]; }); }
  function reverse(start, segs) {
    var out = [], from = start;
    var starts = segs.map(function (s) { var a = from; from = [s[4], s[5]]; return a; });
    for (var i = segs.length - 1; i >= 0; i--) out.push([segs[i][2], segs[i][3], segs[i][0], segs[i][1], starts[i][0], starts[i][1]]);
    return out;
  }
  function cpath(segs) { return segs.map(function (s) { return 'C' + s.slice(0, 2).join(',') + ' ' + s.slice(2, 4).join(',') + ' ' + s.slice(4).join(','); }).join(''); }

  var OUTLINE = 'M32,41.5' + cpath(TOP_L) + 'L276,68' + cpath(TOP_R) + cpath(JOINT_R) +
    cpath(reverse([276, 122], mirror(TOP_R))) + 'L84,122' + cpath(reverse([32, 148.5], mirror(TOP_L))) +
    cpath(reverse([32, 41.5], JOINT_L)) + 'Z';
  // periosteum: the whole outer surface except the joint surfaces (cartilage there)
  var PERI = 'M32,41.5' + cpath(TOP_L) + 'L276,68' + cpath(TOP_R) +
    'M32,148.5' + cpath(mirror(TOP_L)) + 'L276,122' + cpath(mirror(TOP_R));
  // articular cartilage: the joint surfaces; the notch between the condyles is left bare
  var CART = 'M32,41.5' + cpath(JOINT_L) + 'M326,45.5' + cpath(JOINT_R.slice(0, 2)) + 'M344,98' + cpath(JOINT_R.slice(3));
  // the shaft wall: 12 px thick from x 111 to 249, tapering to the 2.5 px end shell at x 84 and 276
  var TAPER_T = 'M84,70.5Q98,78 111,80L249,80Q262,78 276,70.5';
  var TAPER_B = 'M84,119.5Q98,112 111,110L249,110Q262,112 276,119.5';
  var CORTEX = 'M84,68L276,68L276,70.5Q262,78 249,80L111,80Q98,78 84,70.5Z' +
    'M84,122L276,122L276,119.5Q262,112 249,110L111,110Q98,112 84,119.5Z';
  // Where the trabeculae thin out into the medullary cavity: an irregular,
  // open edge (not a wall) through the free ends of the struts, from the
  // lower wall at x 103 in to x 91-96 near the axis and back to the upper
  // wall. The lower end's edge is the same curve turned like its lattice.
  var EL = [[97, 108, 91, 106, 91, 102], [91, 99, 96, 98, 96, 95], [96, 92, 92, 91, 92, 88], [92, 84, 98, 80, 103, 78.3]];
  function turn(sg) { return sg.map(function (v, n) { return n % 2 ? f1(182.4 - 0.92 * v) : 360 - v; }); }
  var EDGE_L = 'L103,111.7' + cpath(EL) + 'L111,80';
  var EDGE_R = 'L257,78.3' + cpath(EL.map(turn)) + 'L249,110';
  // the cavity's long sides are the shaft wall; its ends are the open edges
  var CAVITY = 'M111,80L249,80M111,110L249,110', OPEN_ENDS = 'M249,80' + EDGE_R + 'M111,110' + EDGE_L;
  // the spongy region: the shell and the tapering wall around each end (its open edge is OPEN_ENDS)
  var SPONGY = 'M111,80Q98,78 84,70.5L84,68' + cpath(reverse([32, 41.5], TOP_L)) + cpath(JOINT_L) +
    cpath(mirror(TOP_L)) + 'L84,119.5Q98,112 111,110' +
    'M249,80Q262,78 276,70.5L276,68' + cpath(TOP_R) + cpath(JOINT_R) +
    cpath(reverse([276, 122], mirror(TOP_R))) + 'L276,119.5Q262,112 249,110';

  /* ---------- sampling helpers (for the trabeculae) ---------- */
  function cub(a, s, t) {
    var u = 1 - t;
    return [u * u * u * a[0] + 3 * u * u * t * s[0] + 3 * u * t * t * s[2] + t * t * t * s[4],
      u * u * u * a[1] + 3 * u * u * t * s[1] + 3 * u * t * t * s[3] + t * t * t * s[5]];
  }
  function sample(start, segs, n) {
    var pts = [start.slice()], from = start;
    segs.forEach(function (s) {
      for (var i = 1; i <= n; i++) pts.push(cub(from, s, i / n));
      from = [s[4], s[5]];
    });
    return pts;
  }
  // y on a sampled edge at a given x (the edge runs left to right)
  function yAt(pts, x) {
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i];
      if ((x - a[0]) * (x - b[0]) <= 0 && a[0] !== b[0]) return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
    }
    return pts[pts.length - 1][1];
  }
  function qAt(p0, p1, p2, x) {    // y on a quadratic whose x rises monotonically
    var lo = 0, hi = 1, t = 0.5, q;
    for (var i = 0; i < 24; i++) {
      t = (lo + hi) / 2; q = (1 - t) * (1 - t) * p0[0] + 2 * t * (1 - t) * p1[0] + t * t * p2[0];
      if ((q < x) === (p2[0] > p0[0])) lo = t; else hi = t;
    }
    return (1 - t) * (1 - t) * p0[1] + 2 * t * (1 - t) * p1[1] + t * t * p2[1];
  }
  var EDGE_TL = sample([32, 41.5], TOP_L, 24);
  // inner surface of the upper shell or wall at the upper (left) end;
  // the lower one mirrors it (190 - y)
  function innerTop(x) {
    if (x <= 84) return yAt(EDGE_TL, x) + 2.5;
    if (x <= 111) return qAt([84, 70.5], [98, 78], [111, 80], x);
    return 80;
  }

  /* Spongy bone, drawn once for the upper (left) end and reused for the
     lower end, turned half a circle and squeezed to 92% of its height
     (each end is clipped to its own outline). 22 main struts follow the
     stress lines, each leaving the joint surface at a right angle. Twenty
     sweep in an arch to the inner shell of the metaphysis: struts from
     near the edge of the joint land close to it, and those nearer the
     middle reach about 20 px into the shaft along the wall. The two
     middle ones run on beside the axis and end free in the marrow at
     about x 91-92 (7 px above and below it); one more strut runs along
     the axis and ends free at about x 98. So the core of the metaphysis
     is filled, and the open cavity starts near x 91-98. Each strut is
     cut in three pieces that thin from the joint toward the shaft, with
     a small kink where the pieces meet. Cross-ties link neighboring
     struts at irregular spacing (away from the axis, about 1 in 4 skips
     a strut and links to the next one), closer together and thicker near
     the joint, sparser toward the shaft. All pieces are sorted by width
     into five paths kept in <defs>, so the endosteum stage can paint the
     same struts twice. */
  var NSTRUT = 22, AXIAL = NSTRUT / 2, TRAB_W = [2, 1.6, 1.1, 1.3, 0.9];
  function qpt(P, t) { var u = 1 - t; return [u * u * P[0][0] + 2 * u * t * P[1][0] + t * t * P[2][0], u * u * P[0][1] + 2 * u * t * P[1][1] + t * t * P[2][1]]; }
  // the piece of quadratic P between t = a and t = b, its ends moved by ja and jb
  function qsub(P, a, b, ja, jb) {
    var A = qpt(P, a), B = qpt(P, b), k = b - a;
    var c = [A[0] + k * ((1 - a) * (P[1][0] - P[0][0]) + a * (P[2][0] - P[1][0])), A[1] + k * ((1 - a) * (P[1][1] - P[0][1]) + a * (P[2][1] - P[1][1]))];
    return 'M' + f0(A[0] + ja[0]) + ',' + f0(A[1] + ja[1]) + 'Q' + f0(c[0]) + ',' + f0(c[1]) + ' ' + f0(B[0] + jb[0]) + ',' + f0(B[1] + jb[1]);
  }
  function trabeculae() {
    var w = ['', '', '', '', ''], r = rng(7), pts = sample([32, 41.5], JOINT_L, 30), len = [0], mains = [], i;
    for (i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    var total = len[len.length - 1], z = [0, 0];
    // a strut from the joint point at arc fraction u to (xe, ye): a quadratic
    // that leaves along the inward normal, its control point dk of the way in
    function strut(u, xe, ye, dk) {
      var L = u * total, j = 1;
      while (j < pts.length - 1 && len[j] < L) j++;
      var p = pts[j - 1], q = pts[j], f = (L - len[j - 1]) / ((len[j] - len[j - 1]) || 1);
      var P0 = [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f];
      var tx = q[0] - p[0], ty = q[1] - p[1], tl = Math.hypot(tx, ty) || 1;
      var d = Math.hypot(xe - P0[0], ye - P0[1]) * dk;
      var P = [P0, [P0[0] + d * ty / tl, P0[1] - d * tx / tl], [xe, ye]];
      var k1 = [(r() - 0.5) * 1.6, (r() - 0.5) * 1.6], k2 = [(r() - 0.5) * 1.6, (r() - 0.5) * 1.6];
      w[0] += qsub(P, 0, 0.38, z, k1); w[1] += qsub(P, 0.38, 0.7, k1, k2); w[2] += qsub(P, 0.7, 1, k2, z);
      return P;
    }
    for (i = 0; i < NSTRUT; i++) {
      var u = 0.03 + 0.94 * (i + 0.5) / NSTRUT + (r() - 0.5) * 0.012;
      var s = 2 * u - 1, a = Math.abs(s);
      var xe = 57 + 53 * Math.pow(1 - a, 0.9) + (r() - 0.5) * 3;
      var ye = s < 0 ? innerTop(xe) - 1.2 : 190 - innerTop(xe) + 1.2;   // ends inside the shell
      if (a < 0.06) { xe -= 16; ye = s < 0 ? 88 : 102; }                // the two middle ones run on beside the axis
      mains.push(strut(u, xe, ye, 0.42 + r() * 0.12));
    }
    // the axial strut, between the two middle struts; it ends free in the marrow
    mains.splice(AXIAL, 0, strut(0.5, 98 + (r() - 0.5) * 4, 95, 0.45));
    // short struts off the side shell of the epiphysis and metaphysis, pointing inward
    [38, 46, 55, 64, 74].forEach(function (x) {
      for (var side = 0; side < 2; side++) {
        var y0 = innerTop(x) - 1, sl = innerTop(x + 2) - innerTop(x - 2), nl = Math.hypot(4, sl);
        var l = 9 + r() * 7, nx = -sl / nl + (r() - 0.5) * 0.4, ny = 4 / nl;
        var y1 = y0 + ny * l, x1 = x + nx * l;
        if (side) { y0 = 190 - y0; y1 = 190 - y1; }
        w[1] += 'M' + f0(x) + ',' + f0(y0) + 'L' + f0(x1) + ',' + f0(y1);
      }
    });
    for (i = 0; i < mains.length - 1; i++) {
      var A = mains[i], LA = 0, prev = A[0];
      for (var m = 1; m <= 10; m++) { var c = qpt(A, m / 10); LA += Math.hypot(c[0] - prev[0], c[1] - prev[1]); prev = c; }
      // the two pairs that include the axial strut stop short, so its free end stays clear
      var axial = i === AXIAL - 1 || i === AXIAL;
      // skip links stay clear of the axial strut: none crosses it, starts on it or ends on it
      var canSkip = i + 2 < mains.length && (i + 2 < AXIAL || i > AXIAL);
      for (var pos = 3 + (i % 2) * 3.5; pos < LA * (axial ? 0.85 : 0.94); pos += 4 + 12 * pos / LA + r() * 5) {
        if (r() < 0.15) continue;
        var B = canSkip && r() < 0.25 ? mains[i + 2] : mains[i + 1];
        var t = pos / LA, t2 = Math.max(0.02, Math.min(0.97, t + (r() - 0.5) * 0.2));
        var pa = qpt(A, t), pb = qpt(B, t2);
        w[t < 0.4 ? 3 : 4] += 'M' + f0(pa[0]) + ',' + f0(pa[1]) + 'Q' + f0((pa[0] + pb[0]) / 2 + (r() - 0.5) * 2.4) + ',' +
          f0((pa[1] + pb[1]) / 2 + (r() - 0.5) * 2.4) + ' ' + f0(pb[0]) + ',' + f0(pb[1]);
      }
    }
    return w.map(function (d, k) { return '<path id="bl-t' + k + '" d="' + d + '"/>'; }).join('');
  }
  // both ends: the lower end is the same lattice turned 180 degrees about (180, 95), at 92% height
  function struts(color, extra) {
    var g = TRAB_W.map(function (sw, k) { return '<use href="#bl-t' + k + '" stroke-width="' + (sw + extra) + '"/>'; }).join('');
    return '<g fill="none" stroke="' + color + '" stroke-linecap="round">' + g +
      '<g transform="matrix(-1 0 0 -0.92 360 182.4)">' + g + '</g></g>';
  }

  function circleD(x, y, rr) {
    return 'M' + f1(x - rr) + ',' + f1(y) + 'a' + f1(rr) + ',' + f1(rr) + ' 0 1,0 ' + f1(2 * rr) + ',0a' + f1(rr) + ',' + f1(rr) + ' 0 1,0 ' + f1(-2 * rr) + ',0';
  }

  /* ---------- ground section (the zoom) ----------
     A ground section is dry bone ground thin: no cells, vessels or soft
     tissue are left, so the canals and lacunae look dark (empty) on a
     light matrix. Two osteon templates are drawn once around the origin
     at radius OR and placed, turned and squashed with <use>. Each has 8
     lamellae (7 boundary circles drawn), a canal of 0.2 R, and lacunae on
     four lamella boundaries (5, 7, 10 and 13 of them, inner to outer),
     long axis along the ring. Each lacuna has six lines drawn through it,
     so twelve canaliculi, each 4-9 px long. Five lines near the radius
     fan out like a starburst: turned 0.16 rad apart, they cross at the
     lacuna's center and spread outward and inward, so each lacuna looks
     like a small spider. One more runs along the ring past both ends.
     The innermost ring's inward canaliculi reach the canal; the
     outermost ring's stop at the cement line. */
  var OR = 32, CANAL = 0.2 * OR;
  function osteon(id, seed) {
    var r = rng(seed), lam = '', lac = '', can = '';
    for (var k = 1; k <= 7; k++) lam += circleD(0, 0, CANAL + (OR - CANAL) * k / 8);
    [10.5, 16.5, 22.5, 28].forEach(function (rad, ring) {
      var n = Math.round(2 * Math.PI * rad / 14), off = r() * 6.28;
      for (var j = 0; j < n; j++) {
        var a = off + j / n * Math.PI * 2 + (r() - 0.5) * 0.3;
        var cx = Math.cos(a) * rad, cy = Math.sin(a) * rad, tx = -Math.sin(a), ty = Math.cos(a);
        lac += 'M' + f1(cx - tx * 1.2) + ',' + f1(cy - ty * 1.2) + 'l' + f1(tx * 2.4) + ',' + f1(ty * 2.4);
        for (var c = 0; c < 6; c++) {
          // c 0-4: a fan about the radius, through the lacuna's center; c 5: along the ring
          var along = c === 5, ca = along ? a + Math.PI / 2 + (r() - 0.5) * 0.3 : a + (c - 2) * 0.16 + (r() - 0.5) * 0.12;
          var out = 4 + r() * 5, inn = 4 + r() * 5;
          if (along) { out = 1.2 + 4 + r() * 3; inn = 1.2 + 4 + r() * 3; } // measured past the lacuna's ends
          if (ring === 0 && !along) inn = rad - CANAL + 1;              // reaches the canal
          if (ring === 3 && !along) out = Math.min(out, OR - 1.5 - rad); // stops at the cement line
          can += 'M' + f1(cx - Math.cos(ca) * inn) + ',' + f1(cy - Math.sin(ca) * inn) +
            'l' + f0(Math.cos(ca) * (inn + out)) + ',' + f0(Math.sin(ca) * (inn + out));
        }
      }
    });
    return '<g id="' + id + '">' +
      '<circle r="' + OR + '" fill="#e2d1ad" stroke="#efe4c9" stroke-width="0.9"/>' +
      '<path d="' + lam + '" fill="none" stroke="#b49c6c" stroke-width="0.7" stroke-opacity="0.75"/>' +
      '<path d="' + can + '" stroke="#22180f" stroke-width="0.45" stroke-opacity="0.85"/>' +
      '<path d="' + lac + '" stroke="' + C.dark + '" stroke-width="1.7" stroke-linecap="round"/>' +
      '<circle r="' + CANAL + '" fill="' + C.dark + '"/>' +
      '</g>';
  }
  /* Osteon layout in the zoom: [template, x, y, R, turn, squash]. The two
     older osteons come first, so newer ones cover part of them (cut off,
     as in remodeled bone). The 11 newer ones sit in two rows; most
     neighbors touch (center distance R1 + R2 + 0 to 2.5 px), leaving
     angular gaps for interstitial lamellae. None rises above the
     circumferential lamellae (y 252), and four are squashed by about 10%. */
  var OSTEONS = [
    ['B', 148, 280, 26, 40, 1], ['A', 187, 352, 27, 200, 0.92],
    ['A', 42, 284, 30, 0, 1], ['B', 106, 288, 34, 20, 0.9], ['A', 186, 290, 36, 130, 1], ['B', 262, 286, 32, -30, 0.9],
    ['A', 324, 284, 30, 75, 1], ['B', 2, 334, 30, 160, 1], ['A', 66, 342, 32, 250, 1], ['B', 143, 342, 30, 60, 0.9],
    ['A', 231, 345, 34, 300, 1], ['B', 299, 343, 34, 10, 0.9], ['A', 361, 334, 28, 110, 1]
  ];
  function inOsteon(x, y, pad) {
    for (var i = 0; i < OSTEONS.length; i++) {
      var o = OSTEONS[i], a = -o[4] * Math.PI / 180, dx = x - o[1], dy = y - o[2];
      var u = dx * Math.cos(a) - dy * Math.sin(a), v = dx * Math.sin(a) + dy * Math.cos(a);
      var R = o[3] + pad;
      if ((u * u) / (R * R) + (v * v) / (R * R * o[5] * o[5]) <= 1) return true;
    }
    return false;
  }
  function placeOsteon(o) {
    var s = o[3] / OR;
    return '<use href="#bl-o' + o[0] + '" transform="translate(' + o[1] + ' ' + o[2] + ') rotate(' + o[4] + ') scale(' + f1(s * 100) / 100 + (o[5] !== 1 ? ' ' + f1(s * o[5] * 100) / 100 : '') + ')"/>';
  }
  /* Interstitial lamellae: pieces of older osteons left in the angular
     gaps. Each gap point gets 3 to 5 parallel arcs (part of an old ring
     around a center 20-40 px away) and lacunae at about 1 per 250 px^2,
     each crossed by five canaliculi that fan out from its center. Each
     lacuna lies along the nearest drawn arc (tangent to a circle about
     that arc's center), as lacunae follow their lamellae.
     Drawn under the osteons, so only the gaps show. */
  function interstitial() {
    var r = rng(29), arcs = '', lac = '', can = '', rings = [], x, y;
    for (y = 262; y < 362; y += 19) {
      for (x = 20; x < 345; x += 19) {
        var px = x + (r() - 0.5) * 8, py = y + (r() - 0.5) * 8;
        if (inOsteon(px, py, -1)) continue;
        var ang = r() * 6.28, d = 20 + r() * 20, cx = px + Math.cos(ang) * d, cy = py + Math.sin(ang) * d;
        var nArc = 3 + Math.floor(r() * 3), back = ang + Math.PI;
        rings.push([cx, cy, d - 5 + (nArc - 1) * 1.7, back]); // the middle arc
        for (var k = 0; k < nArc; k++) {
          var rr = d - 5 + k * 3.4, span = 11 / rr;
          var a1 = back - span, a2 = back + span;
          arcs += 'M' + f0(cx + Math.cos(a1) * rr) + ',' + f0(cy + Math.sin(a1) * rr) + 'A' + f0(rr) + ',' + f0(rr) + ' 0 0 1 ' + f0(cx + Math.cos(a2) * rr) + ',' + f0(cy + Math.sin(a2) * rr);
        }
      }
    }
    for (y = 258; y < 362; y += 15.8) {
      for (x = 18; x < 345; x += 15.8) {
        var lx = x + (r() - 0.5) * 9, ly = y + (r() - 0.5) * 9;
        if (inOsteon(lx, ly, 2)) continue;
        var near = rings[0], best = 1e9;
        rings.forEach(function (g) {
          // distance to the nearest point of this arc (its angle clamped to the arc's span)
          var t = Math.atan2(ly - g[1], lx - g[0]) - g[3], span = 11 / g[2];
          t = Math.max(-span, Math.min(span, Math.atan2(Math.sin(t), Math.cos(t)))) + g[3];
          var dd = Math.hypot(g[0] + Math.cos(t) * g[2] - lx, g[1] + Math.sin(t) * g[2] - ly);
          if (dd < best) { best = dd; near = g; }
        });
        var o = Math.atan2(ly - near[1], lx - near[0]) + Math.PI / 2 + (r() - 0.5) * 0.3, ux = Math.cos(o), uy = Math.sin(o);
        lac += 'M' + f1(lx - ux * 1.3) + ',' + f1(ly - uy * 1.3) + 'l' + f1(ux * 2.6) + ',' + f1(uy * 2.6);
        for (var c = 0; c < 5; c++) {
          var ca = o + Math.PI / 2 + (c - 2) * 0.3, l1 = 3 + r() * 3, l2 = 3 + r() * 3;
          can += 'M' + f1(lx - Math.cos(ca) * l1) + ',' + f1(ly - Math.sin(ca) * l1) + 'l' + f0(Math.cos(ca) * (l1 + l2)) + ',' + f0(Math.sin(ca) * (l1 + l2));
        }
      }
    }
    return '<path d="' + arcs + '" fill="none" stroke="#b49c6c" stroke-width="0.7" stroke-opacity="0.8"/>' +
      '<path d="' + can + '" stroke="#22180f" stroke-width="0.45" stroke-opacity="0.8"/>' +
      '<path d="' + lac + '" stroke="' + C.dark + '" stroke-width="1.9" stroke-linecap="round"/>';
  }
  /* Outer circumferential lamellae: 6 wavy bands parallel to the surface,
     with up to 22 flattened lacunae between them (about as dense as in
     the interstitial lamellae), each crossed by four canaliculi that fan out
     from its center toward and away from the surface. */
  function circumferential() {
    var r = rng(41), lines = '', lac = '', can = '';
    for (var j = 0; j < 6; j++) {
      var y = 232 + j * 3.5, amp = 0.6 + r() * 0.7;
      lines += 'M15,' + f1(y) + 'Q57,' + f1(y - amp) + ' 99,' + f1(y) + 'T183,' + f1(y) + 'T267,' + f1(y) + 'T351,' + f1(y);
    }
    for (var i = 0; i < 22; i++) {
      var lx = 24 + i * 14.8 + (r() - 0.5) * 8, ly = 233.8 + Math.floor(r() * 5) * 3.5;
      // none inside the Volkmann canal, which crosses the band near x = 130
      if (Math.abs(lx - 130) < 5) continue;
      lac += 'M' + f1(lx - 1.6) + ',' + f1(ly) + 'h3.2';
      for (var c = 0; c < 4; c++) {
        var ca = Math.PI / 2 + (c - 1.5) * 0.25, l1 = 3 + r() * 2, l2 = 3 + r() * 2;
        can += 'M' + f1(lx - Math.cos(ca) * l1) + ',' + f1(ly - Math.sin(ca) * l1) + 'l' + f0(Math.cos(ca) * (l1 + l2)) + ',' + f0(Math.sin(ca) * (l1 + l2));
      }
    }
    return '<path d="' + lines + '" fill="none" stroke="#b49c6c" stroke-width="0.7"/>' +
      '<path d="' + can + '" stroke="#22180f" stroke-width="0.45" stroke-opacity="0.8"/>' +
      '<path d="' + lac + '" stroke="' + C.dark + '" stroke-width="1.6" stroke-linecap="round"/>';
  }

  function defs() {
    return '<defs>' +
      '<linearGradient id="bl-cut" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#f5eedd"/><stop offset="50%" stop-color="#ece1c6"/><stop offset="100%" stop-color="#f3ebd7"/></linearGradient>' +
      // marrow: red in the upper end, yellow in the shaft, mostly yellow in the lower end
      '<linearGradient id="bl-mar" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0%" stop-color="#ad454d"/><stop offset="19%" stop-color="#b14b54"/><stop offset="26%" stop-color="#c47063"/>' +
        '<stop offset="33%" stop-color="#ecd08a"/><stop offset="38%" stop-color="#f2dc96"/><stop offset="68%" stop-color="#e8c96e"/>' +
        '<stop offset="80%" stop-color="#e0b460"/><stop offset="100%" stop-color="#dcae5a"/></linearGradient>' +
      '<linearGradient id="bl-cart" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#f1f6f8"/><stop offset="100%" stop-color="#bfd3dc"/></linearGradient>' +
      '<filter id="bl-grain" x="0" y="0" width="100%" height="100%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="11" result="n"/>' +
        '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.48  0 0 0 0 0.36  0 0 0 0.22 0" result="g"/>' +
        '<feComposite in="g" in2="SourceGraphic" operator="in" result="gi"/>' +
        '<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="gi"/></feMerge></filter>' +
      // a soft mottle for the marrow (fat looks smooth and greasy, not bubbly, at this scale)
      '<filter id="bl-mottle" x="0" y="0" width="100%" height="100%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="2" seed="4" result="n"/>' +
        '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.25  0 0 0 0 0.1  0 0 0 0.12 0" result="g"/>' +
        '<feComposite in="g" in2="SourceGraphic" operator="in" result="gi"/>' +
        '<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="gi"/></feMerge></filter>' +
      '<filter id="bl-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="0.9"/></filter>' +
      '<path id="bl-ol" d="' + OUTLINE + '"/>' +
      '<clipPath id="bl-bone"><use href="#bl-ol"/></clipPath>' +
      '<clipPath id="bl-inset"><rect x="15" y="228.5" width="330" height="133.5"/></clipPath>' +
      trabeculae() + osteon('bl-oA', 3) + osteon('bl-oB', 13) +
      '</defs>';
  }

  function svgFor(i) {
    var s = STAGES[i], k = s.key, out = [];
    out.push(defs());
    out.push('<rect x="0" y="0" width="360" height="' + H + '" fill="#fbf7ee"/>');

    // Under the bone: articular cartilage on the joint surfaces, and the
    // periosteum (outer fibrous layer, inner cellular layer) on the rest.
    // Each stroke is twice its visible width; the bone covers the inner half.
    out.push('<path d="' + CART + '" stroke="url(#bl-cart)" stroke-width="9" fill="none"/>');
    out.push('<g fill="none" stroke-linecap="round"><path d="' + PERI + '" stroke="#e3bfae" stroke-width="5"/>' +
      '<path d="' + PERI + '" stroke="#c98e7c" stroke-width="2.4"/>' +
      (k === 'peri' ? '<path d="' + PERI + '" stroke="' + C.gold + '" stroke-width="9" stroke-opacity="0.95"/>' : '') + '</g>');

    // Marrow fills the whole inside: red in the upper end, yellow in the
    // shaft, and mostly yellow with red patches in the adult lower end
    out.push('<use href="#bl-ol" fill="url(#bl-mar)" filter="url(#bl-mottle)"/>');
    out.push('<path d="M288,70a6,4 0 1,0 12,1a6,4 0 1,0 -12,-1M318,64a7,5 0 1,0 14,0a7,5 0 1,0 -14,0M326,112a5,7 0 1,0 10,0a5,7 0 1,0 -10,0M296,118a6,4 0 1,0 12,0a6,4 0 1,0 -12,0M334,88a4,5 0 1,0 8,0a4,5 0 1,0 -8,0" fill="#c8705a" fill-opacity="0.9" filter="url(#bl-soft)"/>');
    // vessels in the marrow, branching from the nutrient artery
    out.push('<path d="M146,83C134,87 120,85 106,90M146,83C170,87 196,84 222,88C238,90 250,87 266,91M196,86C206,93 220,95 232,101" fill="none" stroke="#c46a55" stroke-width="0.6"/>');

    // Spongy bone: the trabeculae (endosteum stage: each strut edged by its lining)
    out.push('<g clip-path="url(#bl-bone)">' + (k === 'endo' ? struts(C.endo, 1.4) : '') + struts(C.trab, 0) + '</g>');

    // Compact bone: a thin shell over the ends, and the thick shaft wall,
    // with Haversian canals running lengthwise in the cut wall
    out.push('<use href="#bl-ol" fill="none" stroke="' + C.bone + '" stroke-width="5" clip-path="url(#bl-bone)"/>');
    out.push('<path d="' + CORTEX + '" fill="url(#bl-cut)" filter="url(#bl-grain)"/>');
    out.push('<g stroke="#c7b083" stroke-width="0.8">');
    [71, 74.5, 77.5, 112.5, 115.5, 119].forEach(function (y, n) {
      out.push('<path d="M112,' + y + 'H248" stroke-dasharray="' + (n % 2 ? '18 4 7 3' : '11 3 22 4') + '"/>');
    });
    out.push('</g>');

    // Epiphyseal lines (closed growth plates): dense plates across the
    // spongy bone from shell to shell, with trabeculae on both sides;
    // a darker edge under a pale core sets each plate apart from the struts
    var EPI = 'M49.5,45.5C44,62 53,78 47,95C42,112 52,128 49.5,144.5M310.5,48.5C315,64 306,80 312,95C317,110 307,126 310.5,141.5';
    out.push('<path d="' + EPI + '" fill="none" stroke="#cbb88c" stroke-width="4"/><path d="' + EPI + '" fill="none" stroke="#fbf6e6" stroke-width="2.6"/>');

    // Nutrient artery: through the wall into the marrow, slanting toward the upper end
    out.push('<path d="M158,61C155,68 151,75 146,83" fill="none" stroke="' + C.vessel + '" stroke-width="1.4" stroke-linecap="round"/>');
    // periosteal vessels, running on the periosteum
    out.push('<path d="M111,64.6q4,-1.2 9,0t9,0M149,64.6q4,1.2 9,0t9,0M196,64.6q4,-1.2 9,0t9,0M111,125.4q4,1.2 9,0t9,0M166,125.4q4,-1.2 9,0t9,0" stroke="' + C.vessel + '" stroke-width="0.9" fill="none"/>');

    // Endosteum lines the cavity
    out.push('<path d="' + TAPER_T + TAPER_B + '" stroke="' + (k === 'endo' ? C.gold : C.endo) + '" stroke-width="' + (k === 'endo' ? 3.2 : 1.2) + '" fill="none"/>');

    // Highlights for the active layer
    if (k === 'compact' || k === 'osteon') out.push('<path d="' + CORTEX + '" fill="' + C.gold + '" fill-opacity="0.28" stroke="' + C.gold + '" stroke-width="2"/>');
    if (k === 'compact') out.push('<use href="#bl-ol" fill="none" stroke="' + C.gold + '" stroke-width="5" stroke-opacity="0.75" clip-path="url(#bl-bone)"/>');
    // (the open edge between the spongy region and the cavity is dashed: marrow runs through it)
    if (k === 'spongy' || k === 'medulla') {
      out.push('<g fill="none" stroke="' + C.gold + '" stroke-linejoin="round"><path d="' + (k === 'spongy' ? SPONGY : CAVITY) + '" stroke-width="3"/>' +
        '<path d="' + OPEN_ENDS + '" stroke-width="2" stroke-dasharray="2 2"/></g>');
    }

    // Cut plane for the zoom: the shaft cut straight across at x = 236
    var zoomOn = k === 'osteon' || k === 'compact';
    out.push('<g fill="none" stroke="' + C.goldD + '" stroke-width="1.2" opacity="' + (zoomOn ? 1 : 0.45) + '">' +
      '<path d="M236,62V128" stroke-dasharray="3 2"/><ellipse cx="236" cy="95" rx="6" ry="31" fill="' + C.gold + '" fill-opacity="0.15"/></g>');

    // Labels around the bone ("cross-section here" stays at full strength on
    // every stop; the dimmed cut-plane marker shows when the zoom is not active)
    out.push('<g font-size="9.5" fill="' + C.mute + '">' +
      '<text x="6" y="31">articular cartilage</text><text x="354" y="31" text-anchor="end">articular cartilage</text>' +
      '<text x="148" y="141" text-anchor="middle">diaphysis (shaft)</text>' +
      '<text x="30" y="166" text-anchor="middle">epiphysis</text><text x="330" y="166" text-anchor="middle">epiphysis</text>' +
      '<text x="6" y="182">upper end (like adult femur): red marrow</text>' +
      '<text x="354" y="182" text-anchor="end">lower end: mostly yellow marrow</text>' +
      '<text x="180" y="166" text-anchor="middle" fill="' + C.goldD + '">epiphyseal line (old growth plate)</text>' +
      '<text x="236" y="139" text-anchor="middle" fill="' + C.goldD + '">cross-section here</text>' +
      '</g>');
    // leaders from the label to a point on each plate
    out.push('<path d="M105,161L49.7,134.7M255,161L309.8,132.2" stroke="' + C.goldD + '" stroke-width="0.7" fill="none"/>' +
      '<g fill="' + C.goldD + '"><circle cx="49.7" cy="134.7" r="1.6"/><circle cx="309.8" cy="132.2" r="1.6"/></g>');
    out.push('<text x="180" y="105.5" text-anchor="middle" font-size="9.5" font-weight="700" fill="#6b4f12">medullary cavity</text>');

    // Callout for the active layer
    out.push('<path d="M180,18L' + s.target[0] + ',' + s.target[1] + '" stroke="' + C.goldD + '" stroke-width="1.4"/>');
    out.push('<circle cx="' + s.target[0] + '" cy="' + s.target[1] + '" r="3.5" fill="' + C.goldD + '"/>');
    out.push('<text x="180" y="13" text-anchor="middle" font-size="11.5" font-weight="700" fill="' + C.goldD + '">' + s.callout + '</text>');

    // The zoom: a ground section of the shaft wall, cut across
    out.push('<g opacity="' + (k === 'osteon' ? 1 : (k === 'compact' ? 0.9 : 0.8)) + '">');
    out.push('<rect x="14" y="194" width="332" height="210" rx="10" fill="#fbf6e9" stroke="' + (k === 'osteon' ? C.gold : C.ink) + '" stroke-width="' + (k === 'osteon' ? 2.5 : 1.2) + '"/>');
    out.push('<text x="24" y="210" font-size="10" font-weight="700" fill="' + C.ink + '">ZOOM: cross-section of compact bone (ground section)</text>');
    out.push('<g clip-path="url(#bl-inset)">');
    out.push('<rect x="15" y="228" width="330" height="134" fill="#dccaa3" filter="url(#bl-grain)"/>');
    out.push(interstitial());
    out.push(OSTEONS.map(placeOsteon).join(''));
    out.push(circumferential());
    // Volkmann canals: from the surface down through the circumferential
    // lamellae, and across from one Haversian canal to the next
    out.push('<path d="M128,229Q133,258 146,285M106,288Q146,282 186,290" stroke="' + C.dark + '" stroke-width="5" fill="none" stroke-linecap="round"/>');
    out.push('</g>');
    out.push('<path d="M15,228.5H345" stroke="#7d6a4c" stroke-width="1" stroke-dasharray="4 3"/>');
    // leaders: a pale halo under each dark line keeps it visible on the section
    // (the last one ends on a lacuna of the osteon at 299,343 and passes well clear of its canal)
    var LEAD = 'M70,224L76,240M58,366L64,350M175,366L171,289M318,366L321.6,351.4';
    out.push('<path d="' + LEAD + '" stroke="#fbf6e9" stroke-width="2.4" fill="none"/><path d="' + LEAD + '" stroke="' + C.ink + '" stroke-width="0.9" fill="none"/>');
    out.push('<g font-size="9.5" fill="' + C.ink + '">' +
      '<text x="22" y="222" font-weight="700">outer circumferential lamellae</text>' +
      '<text x="338" y="222" text-anchor="end" fill="#435049">surface (periosteum removed)</text>' +
      '<text x="22" y="375" font-weight="700">Haversian canal</text>' +
      '<text x="22" y="387">(empty here; holds vessels</text><text x="22" y="399">and nerves in life)</text>' +
      '<text x="175" y="375" text-anchor="middle" font-weight="700">Volkmann canal</text>' +
      '<text x="175" y="387" text-anchor="middle">(runs across)</text>' +
      '<text x="338" y="375" text-anchor="end" font-weight="700">lacunae + canaliculi</text>' +
      '<text x="338" y="387" text-anchor="end">(held osteocytes in life)</text>' +
      '</g>');
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
