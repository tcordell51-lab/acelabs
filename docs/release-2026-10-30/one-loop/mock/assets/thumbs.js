/* Tool-card thumbnails: each one is a still of what the tool does, drawn
   on the bench. Real specimens come from bio-real.js; the rest are small
   line drawings. One look per thumbnail: bench ground, light ink, one
   section-colored accent, gold for the thing you move. */
(function () {
  'use strict';
  var G = '#E2C97A', INK = '#e9e2d2', MUTE = 'rgba(233,226,210,.45)';
  function wrap(inner, vb) { return '<svg viewBox="' + (vb || '0 0 88 88') + '" aria-hidden="true" preserveAspectRatio="xMidYMid slice">' + inner + '</svg>'; }
  var T = {
    tonicity: function () {
      return '<svg viewBox="70 80 190 190" aria-hidden="true" preserveAspectRatio="xMidYMid slice">' + window.Tonicity.real(80, 'animal') + '</svg>';
    },
    plasmo: function () {
      return '<svg viewBox="120 90 170 170" aria-hidden="true" preserveAspectRatio="xMidYMid slice">' + window.Tonicity.real(92, 'plant') + '</svg>';
    },
    tem: function () {
      var s = window.BioReal && window.BioReal.temStrip ? window.AL.uniq(window.BioReal.temStrip({ zL: 120, zR: 600, actinTipL: 300, myosinW: 320 })) : '';
      return '<svg viewBox="100 20 300 190" aria-hidden="true" preserveAspectRatio="xMidYMid slice">' + s + '</svg>';
    },
    crossbridge: function () {
      return wrap('<path d="M8 30h72" stroke="#6fcf97" stroke-width="5" stroke-linecap="round"/><g fill="#6fcf97">' +
        [14, 26, 38, 50, 62, 74].map(function (x) { return '<circle cx="' + x + '" cy="30" r="3.4"/>'; }).join('') + '</g>' +
        '<path d="M8 62h72" stroke="' + MUTE + '" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M30 60 40 40" stroke="' + G + '" stroke-width="4" stroke-linecap="round"/><ellipse cx="42" cy="37" rx="7" ry="5" fill="' + G + '"/>' +
        '<path d="M54 60 60 46" stroke="' + INK + '" stroke-width="3" stroke-linecap="round" opacity=".6"/><ellipse cx="62" cy="43" rx="5.5" ry="4" fill="' + INK + '" opacity=".6"/>' +
        '<text x="44" y="80" text-anchor="middle" font-size="9" font-family="JetBrains Mono" fill="' + MUTE + '">ATP</text>');
    },
    piston: function () {
      var dots = '', i;
      for (i = 0; i < 9; i++) dots += '<circle cx="' + (24 + (i * 37) % 42) + '" cy="' + (52 + (i * 13) % 22) + '" r="' + (i % 3 ? 2.6 : 4) + '" fill="' + (i % 3 ? INK : '#7fb2f0') + '"/>';
      return wrap('<path d="M18 26v54h52V26" fill="none" stroke="' + INK + '" stroke-width="2.4"/><rect x="19" y="40" width="50" height="7" fill="#a9a291"/><path d="M44 40V16" stroke="#8d877a" stroke-width="4"/><rect x="30" y="10" width="28" height="7" rx="3.5" fill="' + G + '"/>' + dots);
    },
    holepunch: function () {
      return wrap('<rect x="14" y="14" width="60" height="60" fill="none" stroke="' + MUTE + '" stroke-width="1.5" stroke-dasharray="3 3"/><path d="M44 14v60M14 44h60" stroke="' + MUTE + '" stroke-width="1"/>' +
        '<rect x="14" y="14" width="30" height="30" fill="#f0c060" fill-opacity=".18" stroke="#f0c060" stroke-width="2"/>' +
        '<circle cx="29" cy="29" r="5" fill="#0c1d15" stroke="' + G + '" stroke-width="2"/><circle cx="59" cy="29" r="5" fill="none" stroke="' + G + '" stroke-width="2" stroke-dasharray="2.5 2"/><circle cx="29" cy="59" r="5" fill="none" stroke="' + G + '" stroke-width="2" stroke-dasharray="2.5 2"/><circle cx="59" cy="59" r="5" fill="none" stroke="' + G + '" stroke-width="2" stroke-dasharray="2.5 2"/>');
    },
    outlier: function () {
      return wrap('<path d="M8 58h72" stroke="' + INK + '" stroke-width="2"/>' + [18, 24, 28, 31, 35].map(function (x) { return '<circle cx="' + x + '" cy="52" r="3.6" fill="#f39ab0"/>'; }).join('') +
        '<circle cx="76" cy="52" r="5" fill="' + G + '"/><path d="M63 52h6M66 49l3 3-3 3" stroke="' + G + '" stroke-width="1.6" fill="none"/>' +
        '<path d="M31 36v28" stroke="#f39ab0" stroke-width="2"/><text x="31" y="31" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="#f39ab0">median</text>' +
        '<path d="M42 64v8" stroke="' + G + '" stroke-width="2"/><text x="44" y="82" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="' + G + '">mean</text>');
    },
    chirality: function () {
      return wrap('<circle cx="44" cy="46" r="7" fill="' + INK + '"/><path d="M44 46 44 18" stroke="' + INK + '" stroke-width="3"/><path d="M44 46 20 62" stroke="#c4a3f0" stroke-width="3"/><path d="M44 46 70 60" stroke="' + INK + '" stroke-width="3" stroke-dasharray="3 2.5"/><path d="M44 46 58 72" stroke="' + G + '" stroke-width="5"/>' +
        '<circle cx="44" cy="16" r="5" fill="#c4a3f0"/><circle cx="18" cy="63" r="5" fill="#7fb2f0"/><circle cx="72" cy="61" r="4" fill="' + INK + '"/><circle cx="59" cy="74" r="5" fill="' + G + '"/>' +
        '<path d="M22 24a26 26 0 0 1 40-4" fill="none" stroke="' + G + '" stroke-width="1.8"/><path d="M58 15l4 5-6 1" fill="none" stroke="' + G + '" stroke-width="1.8"/>');
    },
    proofline: function () {
      var l = ''; [18, 28, 38, 48, 58, 68].forEach(function (y, i) { l += '<path d="M14 ' + y + 'h' + (i === 3 ? 50 : 60 - (i % 2) * 12) + '" stroke="' + MUTE + '" stroke-width="3" stroke-linecap="round"/>'; });
      return wrap(l + '<rect x="11" y="43" width="58" height="10" rx="3" fill="' + G + '" fill-opacity=".35"/><path d="M14 48h50" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><path d="M72 48h6" stroke="#5fd3c4" stroke-width="3"/>');
    },
    tree: function () {
      return wrap('<path d="M44 80V44M44 56 28 40M44 50 62 34M28 40 20 26M28 40 34 24M62 34 56 18M62 34 74 24" stroke="#c4a3f0" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        [[20, 26], [34, 24], [56, 18], [74, 24]].map(function (p, i) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" fill="' + (i === 2 ? G : '#0c1d15') + '" stroke="' + (i === 2 ? G : INK) + '" stroke-width="1.8"/>'; }).join(''));
    },
    skilltree: function (c) {
      return wrap('<path d="M18 70h52" stroke="' + MUTE + '" stroke-width="2"/>' + [[22, 60], [36, 48], [50, 54], [62, 38], [44, 30], [30, 22]].map(function (p, i) {
        return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5.5" fill="' + (i < 4 ? c : '#0c1d15') + '" stroke="' + c + '" stroke-width="1.8"/>'; }).join('') +
        '<path d="M22 60 36 48 50 54 62 38 44 30 30 22" fill="none" stroke="' + c + '" stroke-width="1.4" stroke-dasharray="2 2"/><circle cx="44" cy="30" r="9" fill="none" stroke="' + G + '" stroke-width="2"/>');
    },
    hubs: function () {
      return wrap([[14, 14], [46, 14], [14, 46], [46, 46]].map(function (p, i) { return '<rect x="' + p[0] + '" y="' + p[1] + '" width="28" height="28" rx="6" fill="' + (i === 0 ? 'rgba(111,207,151,.28)' : 'rgba(233,226,210,.08)') + '" stroke="#6fcf97" stroke-width="1.6"/>'; }).join('') +
        '<circle cx="28" cy="28" r="7" fill="none" stroke="' + INK + '" stroke-width="1.6"/><circle cx="30" cy="27" r="2.4" fill="' + G + '"/>');
    },
    passages: function () {
      var l = ''; for (var i = 0; i < 6; i++) l += '<path d="M16 ' + (16 + i * 9) + 'h' + (34 - (i % 3) * 5) + '" stroke="' + MUTE + '" stroke-width="2.6" stroke-linecap="round"/>';
      return wrap(l + '<rect x="56" y="14" width="20" height="60" rx="4" fill="rgba(95,211,196,.14)" stroke="#5fd3c4" stroke-width="1.6"/>' + [24, 36, 48, 60].map(function (y, i) { return '<circle cx="66" cy="' + y + '" r="3" fill="' + (i === 1 ? G : '#5fd3c4') + '"/>'; }).join(''));
    },
    keyhole: function () {
      return wrap('<rect x="10" y="10" width="68" height="68" rx="4" fill="rgba(240,192,96,.10)" stroke="#f0c060" stroke-width="1.6"/><path d="M34 26h20l6 14-6 22H34l-6-22z" fill="#0c1d15" stroke="' + G + '" stroke-width="2"/>');
    },
    cubes: function () {
      function cube(x, y, f) { return '<path d="M' + x + ' ' + y + 'l12-7 12 7-12 7z" fill="' + (f || 'rgba(240,192,96,.35)') + '" stroke="#f0c060" stroke-width="1.2"/><path d="M' + x + ' ' + y + 'v13l12 7v-13z" fill="rgba(233,226,210,.10)" stroke="#f0c060" stroke-width="1.2"/><path d="M' + (x + 24) + ' ' + y + 'v13l-12 7v-13z" fill="rgba(233,226,210,.22)" stroke="#f0c060" stroke-width="1.2"/>'; }
      return wrap(cube(20, 46) + cube(44, 46) + cube(32, 39) + cube(32, 26, 'rgba(226,201,122,.8)'));
    },
    prob: function () {
      return wrap('<path d="M14 44 40 24M14 44 40 64M40 24 70 16M40 24 70 32M40 64 70 56M40 64 70 72" stroke="#f39ab0" stroke-width="2" fill="none"/>' +
        '<circle cx="14" cy="44" r="4" fill="' + INK + '"/>' + [[40, 24], [40, 64]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4" fill="#f39ab0"/>'; }).join('') +
        '<circle cx="70" cy="32" r="5" fill="' + G + '"/><text x="22" y="28" font-size="8" font-family="JetBrains Mono" fill="' + G + '">0.6</text>');
    },
    rounds: function (c) {
      return wrap('<rect x="16" y="20" width="56" height="48" rx="8" fill="rgba(233,226,210,.06)" stroke="' + c + '" stroke-width="1.6"/><path d="M26 36h36M26 46h28M26 56h20" stroke="' + MUTE + '" stroke-width="3" stroke-linecap="round"/><circle cx="64" cy="56" r="5" fill="' + G + '"/>');
    },
    sixviews: function () {
      return wrap('<path d="M26 34l18-10 18 10v20L44 64 26 54z" fill="rgba(240,192,96,.14)" stroke="#f0c060" stroke-width="1.8"/><path d="M26 34l18 10 18-10M44 44v20" stroke="#f0c060" stroke-width="1.4" fill="none"/><path d="M8 44h10M70 44h10M44 8v8M44 72v8" stroke="' + G + '" stroke-width="2" stroke-linecap="round"/>');
    },
    operon: function () {
      return wrap('<path d="M6 54h76" stroke="' + INK + '" stroke-width="3"/>' +
        '<rect x="10" y="46" width="12" height="16" rx="2" fill="rgba(233,226,210,.18)" stroke="' + INK + '" stroke-width="1.4"/>' +
        '<rect x="24" y="46" width="10" height="16" rx="2" fill="rgba(226,201,122,.25)" stroke="' + G + '" stroke-width="1.4"/>' +
        '<rect x="38" y="46" width="14" height="16" rx="2" fill="rgba(111,207,151,.25)" stroke="#6fcf97" stroke-width="1.4"/><rect x="54" y="46" width="12" height="16" rx="2" fill="rgba(111,207,151,.25)" stroke="#6fcf97" stroke-width="1.4"/><rect x="68" y="46" width="12" height="16" rx="2" fill="rgba(111,207,151,.25)" stroke="#6fcf97" stroke-width="1.4"/>' +
        '<path d="M22 30c0-8 14-8 14 0s-14 8-14 0z" fill="#f39ab0" opacity=".85"/><path d="M29 38v6" stroke="' + G + '" stroke-width="2" stroke-dasharray="2 2"/><path d="M26 22l3-5 3 5" fill="none" stroke="' + G + '" stroke-width="2"/>' +
        '<text x="29" y="76" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="' + MUTE + '">O</text><text x="59" y="76" text-anchor="middle" font-size="8" font-family="JetBrains Mono" fill="' + MUTE + '">lac genes</text>');
    },
    titration: function () {
      return wrap('<path d="M12 12v64h66" stroke="' + MUTE + '" stroke-width="1.6" fill="none"/><path d="M14 66C30 64 36 60 42 54 46 50 46 30 50 24 56 18 66 16 78 15" fill="none" stroke="#7fb2f0" stroke-width="2.6"/><circle cx="46" cy="40" r="5" fill="' + G + '"/><path d="M46 46v28" stroke="' + G + '" stroke-width="1.4" stroke-dasharray="2 2"/>');
    },
    lewis: function () {
      return wrap('<text x="44" y="52" text-anchor="middle" font-size="20" font-weight="700" font-family="DM Sans" fill="' + INK + '">C</text><text x="16" y="52" text-anchor="middle" font-size="18" font-weight="700" font-family="DM Sans" fill="#7fb2f0">O</text><text x="72" y="52" text-anchor="middle" font-size="18" font-weight="700" font-family="DM Sans" fill="#7fb2f0">O</text>' +
        '<path d="M24 42h12M24 49h12M52 42h12M52 49h12" stroke="' + G + '" stroke-width="2.4"/>' +
        '<g fill="' + INK + '"><circle cx="12" cy="30" r="2"/><circle cx="19" cy="30" r="2"/><circle cx="12" cy="62" r="2"/><circle cx="19" cy="62" r="2"/><circle cx="69" cy="30" r="2"/><circle cx="76" cy="30" r="2"/><circle cx="69" cy="62" r="2"/><circle cx="76" cy="62" r="2"/></g>');
    },
    frac: function () {
      return wrap('<rect x="10" y="22" width="68" height="14" rx="3" fill="none" stroke="' + INK + '" stroke-width="1.4"/><rect x="10" y="22" width="22.7" height="14" rx="3" fill="#f39ab0" fill-opacity=".7"/><path d="M32.7 22v14M55.3 22v14" stroke="' + INK + '" stroke-width="1.2"/>' +
        '<rect x="10" y="50" width="68" height="14" rx="3" fill="none" stroke="' + INK + '" stroke-width="1.4"/><rect x="10" y="50" width="17" height="14" rx="3" fill="' + G + '" fill-opacity=".8"/><path d="M27 50v14M44 50v14M61 50v14" stroke="' + INK + '" stroke-width="1.2"/>' +
        '<path d="M10 74h68" stroke="' + MUTE + '" stroke-width="1"/>' + [0,1,2,3,4,5,6,7,8,9,10,11,12].map(function (i) { return '<path d="M' + (10 + i * 68 / 12).toFixed(1) + ' 71v6" stroke="' + MUTE + '" stroke-width="1"/>'; }).join(''));
    },
    bone: function () {
      return wrap('<rect width="88" height="88" fill="#efe6d2"/><path d="M14 30c-6-6 2-16 9-10 4-6 14-2 12 5l18 0c-2-7 8-11 12-5 7-6 15 4 9 10 6 6-2 16-9 10-4 6-14 2-12-5H35c2 7-8 11-12 5-7 6-15-4-9-10z" fill="#e8dcc0" stroke="#8b7a55" stroke-width="1.6"/>' +
        '<circle cx="58" cy="64" r="16" fill="#e2d4b4" stroke="#8b7a55" stroke-width="1.4"/>' +
        [[52, 60], [62, 58], [58, 70], [66, 68], [50, 70]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.2" fill="none" stroke="#6b5a38" stroke-width="1"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="1" fill="#3a2e18"/>'; }).join('') +
        '<path d="M40 40 48 52" stroke="#1B3A2D" stroke-width="1.4"/>', '0 0 88 88');
    },
    iso: function () {
      return '<svg viewBox="60 70 210 210" aria-hidden="true" preserveAspectRatio="xMidYMid slice">' + window.Tonicity.real(50, 'animal') + '</svg>';
    },
    casper: function () {
      return wrap('<rect x="14" y="20" width="44" height="30" rx="8" fill="rgba(233,226,210,.08)" stroke="' + INK + '" stroke-width="1.6"/><path d="M24 50l-4 10 12-10" fill="none" stroke="' + INK + '" stroke-width="1.6"/><rect x="40" y="40" width="36" height="26" rx="8" fill="rgba(226,201,122,.18)" stroke="' + G + '" stroke-width="1.6"/>');
    }
  };
  window.Thumbs = T;
  function fill() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-thumb]'), function (n) {
      var k = n.getAttribute('data-thumb'), c = n.getAttribute('data-c') || '#7fb2f0';
      if (T[k]) n.innerHTML = T[k](c);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fill); else fill();
})();
