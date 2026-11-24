/* boards/pat.js : Perceptual Ability whiteboards, one per subtest (shared/ace-board.js draws them).
   Figures here are ruler-straight (kit.seg, kit.poly, kit.rect) because PAT answers turn on exact edges. */
(function (B) {
  'use strict';
  if (!B) return;
  var K = B.kit, t = K.t, line = K.line, arrow = K.arrow, box = K.box, circ = K.circ, step = K.step, hi = K.hi, dot = K.dot, seg = K.seg, poly = K.poly, rect = K.rect;
  var FACE = { top: '#FDFCF8', right: '#EDE6D3', left: '#DCD3BA' };

  /* An isometric stack of unit cubes, seen from the +x +y +z corner. list: [[x,y,z], ...] */
  function iso(ox, oy, u) { return function (x, y, z) { return [ox + (x - y) * u * 0.866, oy + (x + y) * u * 0.5 - z * u]; }; }
  function vox(list, ox, oy, u) {
    var P = iso(ox, oy, u), has = {}, s = '';
    list.forEach(function (v) { has[v.join(',')] = 1; });
    list.slice().sort(function (a, b) { return (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]); }).forEach(function (v) {
      var x = v[0], y = v[1], z = v[2];
      if (!has[[x, y + 1, z].join(',')]) s += poly([P(x, y + 1, z), P(x + 1, y + 1, z), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)], { w: 3, fill: FACE.left, op: 1 });
      if (!has[[x + 1, y, z].join(',')]) s += poly([P(x + 1, y, z), P(x + 1, y + 1, z), P(x + 1, y + 1, z + 1), P(x + 1, y, z + 1)], { w: 3, fill: FACE.right, op: 1 });
      if (!has[[x, y, z + 1].join(',')]) s += poly([P(x, y, z + 1), P(x + 1, y, z + 1), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)], { w: 3, fill: FACE.top, op: 1 });
    });
    return s;
  }
  /* a flat outline from unit points, origin at bottom-left, y up */
  function flat(pts, x0, y0, s, o) { return poly(pts.map(function (p) { return [x0 + p[0] * s, y0 - p[1] * s]; }), o); }
  function block(nx, ny, nz, extra) { var l = []; for (var x = 0; x < nx; x++) for (var y = 0; y < ny; y++) for (var z = 0; z < nz; z++) l.push([x, y, z]); return l.concat(extra || []); }

  /* ---------- Keyholes (apertures) ---------- */
  var KEY = block(3, 2, 1, [[0, 0, 1], [0, 1, 1]]), LF = [[0, 0], [3, 0], [3, 1], [1, 1], [1, 2], [0, 2]];
  B.add({
    id: 'pat-keyholes', section: 'pat', title: 'Keyholes: three outlines, one fits',
    sub: 'The object goes straight through. Only its outline matters.',
    svg: K.svg(
      vox(KEY, 190, 196, 56), t(520, 60, 'which opening fits?', { size: 28, c: 'mute' }),
      step(1, flat(LF, 430, 180, 40, { w: 4, c: 'blue', fill: 'blue', op: 0.3 }), t(620, 150, 'front', { size: 29, c: 'blue' })),
      step(2, rect(430, 226, 120, 80, { w: 4, c: 'green', fill: 'green', op: 0.3 }), t(620, 276, 'top', { size: 29, c: 'green' })),
      step(3, rect(430, 352, 80, 80, { w: 4, c: 'purple', fill: 'purple', op: 0.3 }), t(620, 402, 'end', { size: 29, c: 'purple' })),
      step(4, flat([[0, 0], [3, 0], [3, 1], [1, 1], [1, 3], [0, 3]], 70, 524, 30, { w: 4, c: 'rose', dash: '6 6' }), seg(60, 430, 170, 530, { c: 'rose', w: 4 }), seg(170, 430, 60, 530, { c: 'rose', w: 4 }),
        t(290, 474, 'right shape,', { size: 27, c: 'rose' }), t(290, 508, 'wrong size', { size: 27, c: 'rose' })),
      step(5, hi(470, 474, 200, 36, { c: 'gold' }), t(570, 500, 'outline only', { size: 28 }), t(570, 536, 'same size, no tilt', { size: 26, c: 'goldInk' }))
    ),
    predict: { q: 'Looking straight down on this solid, what outline do you see?', choices: ['An L shape', 'A 3 by 2 rectangle', 'A 2 by 2 square'], answer: 1, why: 'From above, the tall part and the low part both fill the same footprint: 3 long and 2 deep.' },
    steps: [
      'Every solid has three straight-on outlines. From the front this one is an L: 3 wide, 1 tall on the right, 2 tall on the left.',
      'From the top it is a plain 3 by 2 rectangle. Height disappears when you look down.',
      'From the end it is a 2 by 2 square: the low part hides in front of the tall part.',
      'The classic trap is the right shape at the wrong proportions. Compare each edge of the opening to the object: this L is too tall.',
      'The correct opening is exactly one of the three outlines, at the same scale. The object may be turned any way before it enters, but it goes straight in with no twisting, and features inside the outline do not matter.'
    ],
    tryIt: [
      { q: 'A solid is 4 long, 2 deep and 1 tall, a plain box. Which opening can it pass through?', choices: ['A 4 by 1 rectangle', 'A 3 by 2 rectangle', 'A 1 by 1 square'], answer: 0, why: 'Its three outlines are 4 by 2 (top), 4 by 1 (front) and 2 by 1 (end). Only 4 by 1 is on the list.' },
      { q: 'An opening has the right outline but is slightly wider than the object. Is it the answer?', choices: ['Yes, it still fits', 'No, the fit must be exact'], answer: 1, why: 'The correct opening matches the outline exactly. A looser opening is a size trap.' },
      { q: 'An object has a hole drilled part way into its top face. From the front, the hole:', choices: ['Shows in the outline', 'Does not change the outline'], answer: 1, why: 'An outline is only the outer edge. A pocket that does not go all the way through cannot show.' }
    ],
    path: { title: 'Work a keyhole item', steps: ['Read the object\'s length, depth and height', 'Picture the front, top and end outlines', 'Throw out openings with the wrong proportions', 'Throw out openings with extra or missing notches', 'Match the survivor to one outline exactly'] },
    more: [{ label: 'Keyholes drill', href: '/tools/pat/keyholes.html' }]
  });

  /* ---------- Top front end ---------- */
  var TFE = block(3, 2, 1, [[2, 0, 1], [2, 1, 1]]);
  B.add({
    id: 'pat-tfe', section: 'pat', title: 'Top, front, end: three flat views',
    sub: 'Solid line: an edge you can see. Dashed line: an edge that is hidden.',
    svg: K.svg(
      vox(TFE, 170, 176, 52), t(540, 96, 'top, front, end', { size: 28, c: 'mute' }),
      step(1, flat([[0, 0], [3, 0], [3, 2], [2, 2], [2, 1], [0, 1]], 400, 420, 46, { w: 4.5, c: 'blue', fill: 'blue', op: 0.12 }), t(469, 458, 'FRONT', { size: 27, c: 'blue' })),
      step(2, rect(400, 180, 138, 92, { w: 4.5, c: 'green', fill: 'green', op: 0.12 }), seg(492, 180, 492, 272, { w: 4.5, c: 'green' }), t(469, 164, 'TOP', { size: 27, c: 'green' })),
      step(3, rect(590, 328, 92, 92, { w: 4.5, c: 'rose', fill: 'rose', op: 0.12 }), seg(590, 374, 682, 374, { w: 4.5, c: 'rose', dash: '9 8' }), t(636, 458, 'END', { size: 27, c: 'rose' })),
      step(4, seg(40, 404, 110, 404, { w: 4.5 }), t(124, 414, 'edge you see', { size: 27, a: 's' }), seg(40, 450, 110, 450, { w: 4.5, dash: '9 8' }), t(124, 460, 'edge that hides', { size: 27, a: 's' })),
      step(5, seg(400, 272, 400, 328, { w: 3, c: 'mute', dash: '4 7' }), seg(538, 272, 538, 328, { w: 3, c: 'mute', dash: '4 7' }), seg(538, 328, 590, 328, { w: 3, c: 'mute', dash: '4 7' }), seg(538, 420, 590, 420, { w: 3, c: 'mute', dash: '4 7' }),
        t(190, 528, 'views line up: match one edge', { size: 26, c: 'goldInk' }))
    ),
    predict: { q: 'From the right end, the low part of this solid sits behind the tall part. How is the low part\'s top edge drawn in the END view?', choices: ['As a solid line', 'As a dashed line', 'It is not drawn'], answer: 1, why: 'The edge exists but is hidden behind the tall block, so it is drawn dashed.' },
    steps: [
      'FRONT view: look straight at the front. You see the step shape: 3 wide, 1 tall on the left, 2 tall on the right.',
      'TOP view sits directly above the front view and has the same width. From above you see a 3 by 2 rectangle, with a solid line where the height changes.',
      'END view sits beside the front view and has the same height. From the right end you see a 2 by 2 square. The top of the low part is behind the tall part, so that edge is dashed.',
      'That is the whole code. A solid line is an edge or height change you can see from that direction. A dashed line is one that is there but covered.',
      'The three views always line up: top and front share width, front and end share height, and the depth of the top equals the width of the end. Pick one distinctive edge, find where it must fall in the missing view, and eliminate.'
    ],
    tryIt: [
      { q: 'Which two views always have the same width?', choices: ['Top and front', 'Front and end', 'Top and end'], answer: 0, why: 'The top view sits directly above the front view. They share the object\'s width.' },
      { q: 'A dashed line in a view means:', choices: ['A curved surface', 'An edge hidden behind material', 'The center of the object'], answer: 1, why: 'Dashed lines mark real edges that cannot be seen from that direction.' },
      { q: 'A solid has a square hole straight through from front to back. In the TOP view the hole\'s edges appear as:', choices: ['Solid lines', 'Dashed lines', 'Nothing'], answer: 1, why: 'From above, the hole is inside the solid and cannot be seen directly, so its edges are dashed.' }
    ],
    path: { title: 'Find the missing view', steps: ['Name the two views you are given', 'Mark the overall width, height and depth', 'Pick one distinctive edge or step', 'Find where it lands in the missing view', 'Decide: visible (solid) or hidden (dashed)', 'Eliminate choices that disagree'] },
    more: [{ label: 'Top front end drill', href: '/tools/pat/tfe.html' }]
  });

  /* ---------- Angle ranking ---------- */
  var ANG = [[50, 330, -8, 120, 100, 38], [240, 340, -20, 100, 150, 46], [404, 330, -5, 104, 150, 42], [566, 340, -30, 110, 160, 34]];
  function ang(a) {
    var r1 = a[2] * Math.PI / 180, r2 = (a[2] - a[5]) * Math.PI / 180;
    return seg(a[0], a[1], a[0] + a[3] * Math.cos(r1), a[1] + a[3] * Math.sin(r1), { w: 4.5 }) + seg(a[0], a[1], a[0] + a[4] * Math.cos(r2), a[1] + a[4] * Math.sin(r2), { w: 4.5 });
  }
  B.add({
    id: 'pat-angles', section: 'pat', title: 'Angle ranking: look at the corner',
    sub: 'Long legs are a decoy. The angle lives at the vertex.',
    svg: K.svg(
      ANG.map(ang).join(''), ANG.map(function (a, i) { return t(a[0] + 44, 392, String(i + 1), { size: 32 }); }).join(''),
      step(1, ANG.map(function (a) { return circ(a[0], a[1], 40, { c: 'gold', w: 5 }); }).join(''), t(360, 84, 'cover the legs. Compare the corners.', { size: 28, c: 'goldInk' })),
      step(2, t(604, 434, 'smallest', { size: 27, c: 'rose' })),
      step(3, t(276, 434, 'largest', { size: 27, c: 'blue' })),
      step(4, t(360, 488, '4,  ?,  ?,  2', { size: 34 })),
      step(5, hi(240, 508, 240, 40, { c: 'gold' }), t(360, 538, '4 < 1 < 3 < 2', { size: 34, c: 'green' }))
    ),
    predict: { q: 'Which angle is the smallest?', choices: ['1', '2', '3', '4'], answer: 3, why: 'Angle 4 is the most closed at its corner (34°), even though its legs are long.' },
    steps: [
      'Leg length changes nothing about an angle. Look only at a small circle around each vertex, as if the legs were cut short.',
      'Find the smallest first: the corner that is most closed. Here that is angle 4.',
      'Then find the largest: the corner that is most open. Here that is angle 2.',
      'Use the two ends to eliminate. The right choice must start with 4 and end with 2. Usually only one or two choices survive.',
      'If two remain, compare only the middle pair. Angle 1 is slightly more closed than angle 3, so the order is 4, 1, 3, 2.'
    ],
    tryIt: [
      { q: 'Two angles look the same, but one has much longer legs. The one with longer legs is:', choices: ['Larger', 'Smaller', 'Not necessarily either'], answer: 2, why: 'Leg length has nothing to do with the size of the angle. Judge at the vertex.' },
      { q: 'You are sure which angle is smallest and which is largest. Your next move is to:', choices: ['Rank the middle two carefully', 'Eliminate choices that do not start and end correctly', 'Measure with your pencil'], answer: 1, why: 'The two ends usually remove most of the choices before you ever compare the close pair.' },
      { q: 'Two angles are too close to call by eye. A reliable trick is to:', choices: ['Compare how fast the legs spread near the vertex', 'Pick the one with the darker lines', 'Assume they are equal'], answer: 0, why: 'Close to the vertex, the more open angle\'s legs separate faster. Look at the same short distance out on both.' }
    ],
    path: { title: 'Rank four angles', steps: ['Ignore the leg lengths', 'Find the smallest angle', 'Find the largest angle', 'Eliminate choices by first and last', 'Compare the middle two at the vertex', 'Confirm the one surviving order'] },
    more: [{ label: 'Angle ranking drill', href: '/tools/pat/angles.html' }]
  });

  /* ---------- Hole punching ---------- */
  var GX = 240, GY = 250;
  function hole(r, c, col) { return dot(GX + 60 * c + 30, GY + 60 * r + 30, 14, { c: col }); }
  B.add({
    id: 'pat-holepunch', section: 'pat', title: 'Hole punching: unfold in reverse',
    sub: 'Every unfold mirrors the holes across the fold line.',
    svg: K.svg(
      rect(70, 50, 120, 120, { w: 4 }), seg(130, 50, 130, 170, { w: 3, c: 'mute', dash: '6 6' }), arrow(96, 36, 164, 36, { w: 3.5, bend: -16 }),
      rect(270, 50, 60, 120, { w: 2.5, c: 'mute', dash: '4 6' }), rect(330, 50, 60, 120, { w: 4 }), seg(330, 110, 390, 110, { w: 3, c: 'mute', dash: '6 6' }), arrow(408, 72, 408, 148, { w: 3.5, bend: 16 }),
      rect(470, 50, 120, 120, { w: 2.5, c: 'mute', dash: '4 6' }), rect(530, 110, 60, 60, { w: 4, fill: 'gold', op: 0.35 }), dot(575, 125, 8),
      t(130, 212, '1 fold right', { size: 26 }), t(330, 212, '2 fold down', { size: 26 }), t(530, 212, '3 punch', { size: 26 }),
      rect(GX, GY, 240, 240, { w: 4.5 }), [1, 2, 3].map(function (i) { return seg(GX + 60 * i, GY, GX + 60 * i, GY + 240, { w: 2, c: 'mute' }) + seg(GX, GY + 60 * i, GX + 240, GY + 60 * i, { w: 2, c: 'mute' }); }).join(''),
      rect(GX + 120, GY + 120, 120, 120, { w: 2, c: 'goldInk', fill: 'gold', op: 0.28 }),
      step(1, hole(2, 3, 'ink')),
      step(2, seg(GX + 120, GY + 120, GX + 240, GY + 120, { w: 5, c: 'rose', dash: '10 7' }), hole(1, 3, 'rose'), arrow(GX + 262, GY + 150, GX + 262, GY + 90, { c: 'rose', w: 3.5, bend: 14 })),
      step(3, seg(GX + 120, GY, GX + 120, GY + 240, { w: 5, c: 'blue', dash: '10 7' }), hole(1, 0, 'blue'), hole(2, 0, 'blue')),
      step(4, t(604, 330, '4 layers,', { size: 28, c: 'green' }), t(604, 366, '4 holes', { size: 28, c: 'green' })),
      step(5, t(118, 330, 'undo the', { size: 27, c: 'goldInk' }), t(118, 364, 'last fold', { size: 27, c: 'goldInk' }), t(118, 398, 'first', { size: 27, c: 'goldInk' }))
    ),
    predict: { q: 'A square is folded in half, then in half again, and punched once through all layers. How many holes are in the unfolded paper?', choices: ['1', '2', '4', '8'], answer: 2, why: 'Two folds stack four layers. One punch through four layers makes four holes.' },
    steps: [
      'Start where the punch happened: one hole, in the folded quarter. Mark it on the 4 by 4 grid.',
      'Undo the last fold first. The top half swings back up, so the hole is mirrored across that fold line.',
      'Undo the first fold. The left half swings back, so every hole so far is mirrored across the vertical fold line.',
      'Check the count: holes equal layers punched. Two full folds make 4 layers, so 4 holes. If a punch only catches part of the stack, count the layers at that spot.',
      'Always unfold in reverse order: last fold first. The final pattern is symmetric across every fold line.'
    ],
    tryIt: [
      { q: 'A square is folded in half three times and punched once through all layers. How many holes?', choices: ['3', '6', '8'], answer: 2, why: 'Each full fold doubles the layers: 2, 4, 8. One punch through 8 layers makes 8 holes.' },
      { q: 'When you unfold, which fold do you undo first?', choices: ['The first fold made', 'The last fold made', 'It does not matter'], answer: 1, why: 'Reverse order. The last fold made is the first one undone.' },
      { q: 'A hole sits right next to a fold line. After unfolding that fold, its mirror image is:', choices: ['Far away on the other side', 'Right next to the line on the other side', 'On top of the original'], answer: 1, why: 'A mirror image is the same distance from the fold line, on the opposite side.' }
    ],
    path: { title: 'Work a hole punch item', steps: ['Mark the punch on the grid', 'Count the layers at that spot', 'Undo the last fold: mirror the holes', 'Undo the next fold: mirror again', 'Repeat back to the flat sheet', 'Check holes against the layer count'] },
    more: [{ label: 'Hole punching drill', href: '/tools/pat/holepunch.html' }]
  });

  /* ---------- Cube counting ---------- */
  var CUB = [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 1, 0], [0, 0, 1]];
  B.add({
    id: 'pat-cubes', section: 'pat', title: 'Cube counting: tally every cube',
    sub: 'Paint covers what you could touch. Not the bottom, not where cubes meet.',
    svg: K.svg(
      vox(CUB, 210, 230, 70),
      step(1, hi(486, 62, 150, 40, { c: 'gold' }), t(560, 92, '5 cubes', { size: 32 }), t(160, 440, 'one hides', { size: 27, c: 'purple' }), t(160, 474, 'under the tower', { size: 27, c: 'purple' }), arrow(196, 410, 208, 300, { c: 'purple', w: 3.5 })),
      step(2, t(560, 152, 'no paint: bottoms', { size: 26, c: 'rose' }), t(560, 186, 'and touching faces', { size: 26, c: 'rose' })),
      step(3, t(210, 137, '5', { size: 36, c: 'blue' })),
      step(4, t(271, 242, '3', { size: 36, c: 'blue' }), t(331, 277, '4', { size: 36, c: 'blue' }), t(149, 242, '4', { size: 36, c: 'blue' }),
        t(470, 262, '5 sides: 1 cube', { size: 28, a: 's' }), t(470, 302, '4 sides: 2 cubes', { size: 28, a: 's' }), t(470, 342, '3 sides: 1 cube', { size: 28, a: 's' }), t(470, 382, '2 sides: 1 (hidden)', { size: 28, a: 's', c: 'purple' })),
      step(5, t(560, 470, '1 + 2 + 1 + 1 = 5', { size: 30, c: 'green' }), t(560, 510, 'tally equals cubes', { size: 26, c: 'green' }))
    ),
    predict: { q: 'How many cubes are in this stack, counting any you cannot see?', choices: ['4', '5', '6'], answer: 1, why: 'Four are visible. A fifth must sit under the raised cube, holding it up.' },
    steps: [
      'Count the cubes first, including hidden ones. Nothing floats, so every raised cube has cubes beneath it. This stack has 5.',
      'The stack sits on the ground and is painted on every exposed side. A face is not painted if it is on the bottom or pressed against another cube.',
      'Do one cube at a time. The top cube: its bottom touches the cube below, and its top and four sides are open. 5 painted faces.',
      'Go through the rest: 6 faces, minus the bottom, minus one for each neighbor. Write the number on each cube, then tally. The hidden cube has only 2 open sides.',
      'Check: the tally must add up to the number of cubes. Then every question about the figure is a lookup.'
    ],
    tryIt: [
      { q: 'A single cube sits alone on the ground. How many of its faces are painted?', choices: ['4', '5', '6'], answer: 1, why: 'Every face except the bottom: 5.' },
      { q: 'Three cubes sit in a straight row on the ground. How many faces of the middle cube are painted?', choices: ['2', '3', '4'], answer: 1, why: '6, minus the bottom, minus two neighbors: top, front and back are painted. 3.' },
      { q: 'In that same row of three, how many faces of an end cube are painted?', choices: ['3', '4', '5'], answer: 1, why: '6, minus the bottom, minus one neighbor: 4.' }
    ],
    path: { title: 'Work a cube counting figure', steps: ['Count every cube, hidden ones too', 'Take one cube', 'Start from 6 and drop the bottom face', 'Drop one face for each touching neighbor', 'Write the number and move to the next cube', 'Tally, and check the total equals the cube count'] },
    more: [{ label: 'Cube counting drill', href: '/tools/pat/cubes.html' }]
  });

  /* ---------- Pattern folding ---------- */
  var NET = { A: [150, 90], C: [150, 166], E: [150, 242], F: [150, 318], B: [74, 166], D: [226, 166] };
  function cell(k, o) { return rect(NET[k][0] - 38, NET[k][1] - 38, 76, 76, o); }
  B.add({
    id: 'pat-patternfold', section: 'pat', title: 'Pattern folding: neighbors and opposites',
    sub: 'A flat pattern folds into one solid. Track which faces touch.',
    svg: K.svg(
      Object.keys(NET).map(function (k) { return cell(k, { w: 4.5 }) + t(NET[k][0], NET[k][1] + 12, k, { size: 34 }); }).join(''),
      vox([[0, 0, 0]], 520, 196, 120), arrow(326, 196, 396, 196, { w: 4, c: 'mute' }),
      step(1, cell('C', { w: 4.5, c: 'goldInk', fill: 'gold', op: 0.4 }), t(360, 434, 'hold one face still: C', { size: 27, c: 'goldInk' })),
      step(2, ['A', 'B', 'D', 'E'].map(function (k) { return cell(k, { w: 4.5, c: 'blue', fill: 'blue', op: 0.15 }); }).join('')),
      step(3, cell('F', { w: 4.5, c: 'rose', fill: 'rose', op: 0.2 }), t(360, 472, 'F wraps around: opposite C', { size: 27, c: 'rose' })),
      step(4, t(360, 524, 'never touching:   C | F    A | E    B | D', { size: 28, c: 'purple' })),
      step(5, t(520, 150, 'C', { size: 40 }), t(574, 228, 'D', { size: 40 }), t(466, 228, 'E', { size: 40 }), t(520, 372, 'C, D, E share a corner', { size: 26, c: 'green' }))
    ),
    predict: { q: 'When this cross folds into a cube, which face ends up opposite C?', choices: ['A', 'D', 'F'], answer: 2, why: 'A, B, D and E all share an edge with C, so they become its four neighbors. F is the only face left: it is opposite.' },
    steps: [
      'Pick one face and hold it still. Everything else folds around it. Here C is the one facing you.',
      'The four faces that share an edge with C fold back to become the four sides. They are all neighbors of C.',
      'F hangs off E, so it folds once more and closes the back. It ends up opposite C.',
      'In a straight run of squares, faces one apart are opposite: A and E, B and D, C and F. Opposite faces can never appear together in one view.',
      'Three faces can be seen together only if they meet at one corner in the flat pattern too. C, D and E do. Use that to eliminate: a choice showing two opposite faces, or a pattern rotated the wrong way, is out.'
    ],
    tryIt: [
      { q: 'Which pair of faces can never be seen at the same time on the folded cube?', choices: ['C and D', 'A and E', 'D and E'], answer: 1, why: 'A and E are one apart in the column, so they fold to opposite sides.' },
      { q: 'A choice shows faces B, C and D all visible at once. It is:', choices: ['Possible', 'Impossible'], answer: 1, why: 'B and D are opposite faces. You can never see both.' },
      { q: 'The fastest first check on a pattern folding item is usually:', choices: ['Count the faces in the pattern', 'Find a distinctive face and check its neighbors', 'Fold the whole thing in your head'], answer: 1, why: 'Pick the most recognizable face and test which faces touch it. That eliminates choices without folding everything.' }
    ],
    path: { title: 'Work a pattern folding item', steps: ['Find the most distinctive face', 'List which faces share an edge with it', 'Find its opposite face', 'Eliminate choices that show opposites together', 'Check the direction of any marking across a shared edge', 'Confirm the survivor against one more face'] },
    more: [{ label: 'Pattern folding drill', href: '/tools/pat/patternfold.html' }]
  });
})(typeof window !== 'undefined' ? window.AceBoard : (typeof require === 'function' ? require('../ace-board.js') : null));
