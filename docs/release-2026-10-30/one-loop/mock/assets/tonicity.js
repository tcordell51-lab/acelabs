/* =====================================================================
   Tonicity: the first specimen of the shared play loop.
   - field(ext, type): the true-to-life light-microscope field from the
     repo's tools/bio/bio-real.js (BioReal.tonicity), cropped to the camera
     field with a scale bar burned in. The renderer's own caption lines are
     returned as text, so the page can put them in an HTML aria-live caption
     (screen readers hear every frame) instead of inside the picture.
   - drawing(ext): the textbook drawing of the same moment, same geometry,
     for the other side of the Drawing / Real wipe.
   - pair(a, b): the two-panel before and after picture an Ace Card carries.
   Thresholds match bio-shared.js initTonicity: lysis below 12 for an animal
   cell, plasmolysis above 80 for a plant cell.
   ===================================================================== */
(function () {
  'use strict';
  function hash(i, k) { var v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); }
  function f1(n) { return (Math.round(n * 10) / 10).toString(); }
  var U = function (s) { return window.AL ? window.AL.uniq(s) : s; };

  function raw(ext, type) {
    type = type || 'animal';
    return window.BioReal.tonicity({
      cellType: type, externalSolute: ext,
      lysed: type === 'animal' && ext < 12,
      plasmolyzed: type === 'plant' && ext > 80
    });
  }
  function real(ext, type) { return U(raw(ext, type)); }

  function captionOf(svg) {
    var lines = [], m, re = /<text[^>]*font-size="12" fill="#e3dccb">([^<]*)<\/text>/g;
    while ((m = re.exec(svg))) lines.push(m[1]);
    return lines.join(' ');
  }
  function scaleBar(type) {
    var px = type === 'plant' ? 60 : 56, label = type === 'plant' ? '50 um' : '10 um';
    var x = 386 - 12 - px, y = 282 - 16;
    return '<g transform="translate(' + x + ',' + y + ')"><rect x="-7" y="-18" width="' + (px + 14) + '" height="28" rx="5" fill="#fffdf7" fill-opacity=".86"/>' +
      '<rect x="0" y="0" width="' + px + '" height="4" fill="#161616"/>' +
      '<text x="' + (px / 2) + '" y="-6" text-anchor="middle" font-size="11" font-family="JetBrains Mono, monospace" fill="#161616">' + label + '</text></g>';
  }
  /* The cropped field: 372 x 228 of the renderer's 400 x 320 canvas. */
  function field(ext, type, label) {
    type = type || 'animal';
    var r = raw(ext, type);
    return {
      inner: U(r) + scaleBar(type),
      caption: captionOf(r),
      mag: type === 'plant' ? '400x' : '1000x oil',
      svg: function (cls, aria) {
        return '<svg class="' + (cls || 'fs') + '" viewBox="14 54 372 228" role="img" aria-label="' + (aria || label || 'Light microscope field') + '">' + U(r) + scaleBar(type) + '</svg>';
      }
    };
  }

  function stateOf(ext) {
    if (ext < 12) return { key: 'lysed', name: 'Hypotonic: the cell bursts (lysis)', flow: 'water in' };
    if (ext < 45) return { key: 'hypo', name: 'Hypotonic: water moves in, the cell swells', flow: 'water in' };
    if (ext <= 55) return { key: 'iso', name: 'Isotonic: no net water movement', flow: 'no net flow' };
    return { key: 'hyper', name: 'Hypertonic: water moves out, the cell shrivels (crenates)', flow: 'water out' };
  }

  /* The textbook drawing, drawn in the renderer's coordinates (field 14,54
     to 386,282), so the wipe lines the two up exactly. */
  function drawing(ext) {
    var st = stateOf(ext), cx = 132, cy = 170, r = 56, out = '';
    out += '<defs><clipPath id="dw-clip"><rect x="14" y="54" width="372" height="228"/></clipPath>' +
      '<marker id="dw-arr" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#2f7fc1"/></marker></defs><g clip-path="url(#dw-clip)">';
    out += '<rect x="14" y="54" width="372" height="228" fill="#f6f1e3"/>';
    for (var y = 74; y < 282; y += 20) out += '<path d="M14 ' + y + 'H386" stroke="#e7dfca" stroke-width="1"/>';
    var n = Math.round(ext * 0.34), dots = '';
    for (var i = 0, placed = 0; i < 400 && placed < n; i++) {
      var x = 22 + hash(i, 1) * 356, yy = 62 + hash(i, 2) * 212;
      if (Math.hypot(x - cx, yy - cy) < r + 30) continue;
      dots += 'M' + f1(x) + ',' + f1(yy) + 'h0'; placed++;
    }
    out += '<path d="' + dots + '" stroke="#b8902c" stroke-width="6" stroke-linecap="round"/>';
    if (st.key === 'hypo') r = 56 + (45 - ext) / 33 * 20;
    if (st.key === 'hyper') r = 56 - Math.min(1, (ext - 55) / 45) * 15;
    if (st.key === 'lysed') {
      var arcs = '';
      for (var a = 0; a < 6; a++) {
        var a0 = a * 60 + 8, a1 = a0 + 38, R = 80;
        var p0 = [cx + R * Math.cos(a0 * Math.PI / 180), cy + R * Math.sin(a0 * Math.PI / 180)];
        var p1 = [cx + R * Math.cos(a1 * Math.PI / 180), cy + R * Math.sin(a1 * Math.PI / 180)];
        arcs += 'M' + f1(p0[0]) + ',' + f1(p0[1]) + 'A' + R + ',' + R + ' 0 0,1 ' + f1(p1[0]) + ',' + f1(p1[1]);
      }
      out += '<path d="' + arcs + '" fill="none" stroke="#b54848" stroke-width="3" stroke-linecap="round"/>';
      var rel = '';
      for (var j = 0; j < 14; j++) {
        var ang = hash(j, 5) * Math.PI * 2, rr = 70 + hash(j, 6) * 60;
        rel += 'M' + f1(cx + rr * Math.cos(ang)) + ',' + f1(cy + rr * Math.sin(ang) * .8) + 'h0';
      }
      out += '<path d="' + rel + '" stroke="#2f7fc1" stroke-width="6" stroke-linecap="round" opacity=".8"/>';
      out += '<text x="' + cx + '" y="' + (cy + 6) + '" text-anchor="middle" font-size="17" font-weight="700" fill="#8f3434">burst</text>';
    } else {
      if (st.key === 'hyper') {
        var pts = [], k = 22;
        for (var t = 0; t <= k * 2; t++) {
          var th = t / (k * 2) * Math.PI * 2, rad = r + (t % 2 ? -5 : 4);
          pts.push(f1(cx + rad * Math.cos(th)) + ',' + f1(cy + rad * Math.sin(th)));
        }
        out += '<path d="M' + pts.join('L') + 'Z" fill="rgba(181,72,72,.20)" stroke="#b54848" stroke-width="2.6" stroke-linejoin="round"/>';
      } else {
        out += '<circle cx="' + cx + '" cy="' + cy + '" r="' + f1(r) + '" fill="rgba(181,72,72,.16)" stroke="#b54848" stroke-width="2.6"/>';
      }
      var ins = '';
      for (var q = 0; q < 14; q++) {
        var ang2 = q / 14 * Math.PI * 2 + hash(q, 3), rr2 = (r - 14) * (.25 + .7 * hash(q, 4));
        ins += 'M' + f1(cx + rr2 * Math.cos(ang2)) + ',' + f1(cy + rr2 * Math.sin(ang2)) + 'h0';
      }
      out += '<path d="' + ins + '" stroke="#2f7fc1" stroke-width="6" stroke-linecap="round"/>';
    }
    if (st.key !== 'iso') {
      var inward = st.key !== 'hyper', arr = '';
      for (var w = 0; w < 6; w++) {
        var th2 = w / 6 * Math.PI * 2 + .3, ro = (st.key === 'lysed' ? 100 : r + 34), ri = (st.key === 'lysed' ? 86 : r + 10);
        var a1x = cx + (inward ? ro : ri) * Math.cos(th2), a1y = cy + (inward ? ro : ri) * Math.sin(th2) * .92;
        var a2x = cx + (inward ? ri : ro) * Math.cos(th2), a2y = cy + (inward ? ri : ro) * Math.sin(th2) * .92;
        arr += '<path d="M' + f1(a1x) + ',' + f1(a1y) + 'L' + f1(a2x) + ',' + f1(a2y) + '" stroke="#2f7fc1" stroke-width="2.6" marker-end="url(#dw-arr)"/>';
      }
      out += arr;
    }
    out += '<text x="232" y="76" font-size="13" font-weight="700" fill="#2f5f86">' + st.flow + '</text></g>';
    return U(out);
  }

  /* An Ace Card picture: before above, after below, each labeled. */
  function pair(a, b) {
    function frame(o) {
      return '<div><svg viewBox="110 92 180 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + real(o.ext, o.type) + '</svg><span class="pl">' + o.label + '</span></div>';
    }
    return frame(a) + frame(b);
  }

  window.Tonicity = { real: real, field: field, drawing: drawing, stateOf: stateOf, pair: pair };
})();
