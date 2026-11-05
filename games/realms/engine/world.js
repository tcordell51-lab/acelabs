/* drawCreature (window.AtlasWorld.drawCreature): the three Mnemon: Biology starters (Cytrus, Atpup, Twistle) as
 * original pixel portraits drawn in code. Course-pack species are drawn by creature-lines.js. Plain ASCII. */
(function () {
  'use strict';
  // Each portrait occupies a 24 x 24 logical-pixel box centered on (x, y).
  // Scale 1 is a map sprite; scale 4-6 makes a crisp, reusable portrait.
  function drawCreature(ctx, id, x, y, scale = 1) {
    const s = Math.max(0.1, Number(scale) || 1);
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.scale(s, s);
    ctx.imageSmoothingEnabled = false;
    const r = (a, b, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(a - 12, b - 12, w, h); };
    // A filled disc of whole pixels, row by row.
    const disc = (cx, cy, rad, c) => { for (let dy = -rad; dy <= rad; dy++) { const h = Math.floor(Math.sqrt(rad * rad - dy * dy) + 0.5); if (h > 0) r(cx - h, cy + dy, h * 2, 1, c); } };
    const dark = '#24484b', cream = '#fff6d5';
    if (id === 'atpup') {
      // Atpup, the energy starter: a quick pup whose tail is three phosphate beads; the last one sparks.
      r(4, 21, 16, 1, '#91a58e');
      disc(12, 14, 6, dark); disc(12, 14, 5, '#e8a04a'); r(8, 15, 9, 3, '#f5c27c');
      r(9, 12, 1, 4, '#b8692c'); r(12, 11, 1, 5, '#b8692c'); r(15, 12, 1, 4, '#b8692c');
      disc(6, 9, 5, dark); disc(6, 9, 4, '#f0b25e'); r(3, 10, 5, 3, '#f8d59a');
      r(2, 2, 3, 5, dark); r(3, 3, 1, 3, '#c9783a'); r(8, 2, 3, 5, dark); r(9, 3, 1, 3, '#c9783a');
      r(4, 8, 2, 2, dark); r(4, 8, 1, 1, cream); r(1, 11, 2, 2, dark); r(5, 12, 2, 1, '#9b4f22');
      disc(19, 13, 2, dark); disc(19, 13, 1, '#f6d36b'); disc(21, 9, 2, dark); disc(21, 9, 1, '#f6d36b');
      disc(21, 5, 2, dark); r(20, 4, 2, 2, '#fff1a8'); r(23, 3, 1, 1, '#fff1a8'); r(19, 2, 1, 1, '#fff1a8');
      r(7, 19, 3, 3, dark); r(8, 19, 1, 2, '#f5c27c'); r(14, 19, 3, 3, dark); r(15, 19, 1, 2, '#f5c27c');
    } else if (id === 'twistle') {
      // Twistle, the gene starter: a small serpent whose body is a double helix, rungs and all.
      r(3, 21, 18, 1, '#91a58e');
      for (let i = 0; i <= 13; i++) {
        const xx = 3 + i, w = Math.round(3 * Math.sin(i * 0.62));
        const a = 14 + w, b = 14 - w;
        if (i % 2 === 0 && Math.abs(a - b) > 1) r(xx, Math.min(a, b) + 1, 1, Math.abs(a - b) - 1, '#efe4c6');
        r(xx, a - 1, 1, 3, dark); r(xx, b - 1, 1, 3, dark);
        r(xx, a, 1, 1, '#6fa8dc'); r(xx, b, 1, 1, '#e98a7a');
      }
      disc(19, 10, 4, dark); disc(19, 10, 3, '#9fd3b5'); r(17, 11, 5, 2, '#c9ead6');
      r(17, 8, 2, 2, dark); r(17, 8, 1, 1, cream); r(21, 8, 2, 2, dark); r(21, 8, 1, 1, cream);
      r(19, 12, 2, 1, '#5b8a71'); r(18, 4, 1, 3, dark); r(21, 4, 1, 3, dark); r(17, 3, 2, 1, '#e98a7a'); r(21, 3, 2, 1, '#6fa8dc');
    } else {
      // Cytrus, the cell starter (and the fallback portrait): a round cell with a membrane edge, a nucleus,
      // a mitochondrion and two little pseudopod feet.
      r(4, 21, 16, 1, '#91a58e');
      disc(12, 12, 9, dark); disc(12, 12, 8, '#5fae8e'); disc(12, 12, 7, '#f3e7a2'); r(7, 15, 10, 3, '#f8efc0');
      disc(15, 8, 3, '#6a4ea0'); disc(15, 8, 2, '#8e6cc4'); r(15, 7, 1, 1, '#d8c8f2');
      r(7, 11, 2, 2, dark); r(7, 11, 1, 1, cream); r(11, 11, 2, 2, dark); r(11, 11, 1, 1, cream); r(9, 14, 2, 1, '#9b6a3a');
      r(14, 14, 4, 2, '#c9783a'); r(15, 14, 2, 1, '#f0b25e'); r(6, 16, 1, 1, dark); r(18, 12, 1, 1, dark); r(10, 17, 1, 1, dark);
      r(6, 19, 4, 3, dark); r(7, 19, 2, 2, '#5fae8e'); r(14, 19, 4, 3, dark); r(15, 19, 2, 2, '#5fae8e');
    }
    ctx.restore();
  }
  window.AtlasWorld = { drawCreature };
}());
