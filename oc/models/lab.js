/* oc/models/lab.js : the OChem 3D models page. Seven models, each one three ways at once:
   the 3D model (three.js, loaded from /shared/), the line drawing, and the written version.
   The chemistry lives in chem.js (window.OcChem) and is unit tested; this file only draws it.
   The drawing and the words paint first; three.js (about 700 KB) loads when the browser is idle. */
const C = window.OcChem;
const $ = (id) => document.getElementById(id);
const INK = '#1B3A2D', ROSE = '#a3405c', GOLD = '#b08a1e', BLUE = '#2f5f9e', MUTE = '#6f7d76';
const EL = { C: ['#97a39d', 0.40], H: ['#f7f3e8', 0.25], O: ['#ea6452', 0.40], Br: ['#c2703a', 0.56] };
const reduced = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
const round = (n) => Math.round(n * 10) / 10;

/* ------------------------------------------------------------------ line drawing kit (ink on paper) */
const svg = (h, body) => '<svg viewBox="0 0 300 ' + h + '" role="img" xmlns="http://www.w3.org/2000/svg" font-family="DM Sans, system-ui, sans-serif">' + body + '</svg>';
const ln = (x1, y1, x2, y2, o = {}) => '<line x1="' + round(x1) + '" y1="' + round(y1) + '" x2="' + round(x2) + '" y2="' + round(y2) + '" stroke="' + (o.c || INK) + '" stroke-width="' + (o.w || 2.2) + '" stroke-linecap="round"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>';
const tx = (x, y, s, o = {}) => '<text x="' + round(x) + '" y="' + round(y) + '" font-size="' + (o.size || 14) + '" font-weight="' + (o.w || 600) + '" fill="' + (o.c || INK) + '" text-anchor="' + (o.a || 'middle') + '"' + (o.i ? ' font-style="italic"' : '') + '>' + s + '</text>';
/* a bond that stops short of the letters at its ends */
function bd(x1, y1, x2, y2, p1 = 0, p2 = 0, o) { const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1; return ln(x1 + dx / l * p1, y1 + dy / l * p1, x2 - dx / l * p2, y2 - dy / l * p2, o); }
function wedge(x1, y1, x2, y2, p2 = 0, c = INK) { const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1, ex = x2 - dx / l * p2, ey = y2 - dy / l * p2, nx = -dy / l * 4.2, ny = dx / l * 4.2; return '<polygon points="' + round(x1) + ',' + round(y1) + ' ' + round(ex + nx) + ',' + round(ey + ny) + ' ' + round(ex - nx) + ',' + round(ey - ny) + '" fill="' + c + '"/>'; }
function hash(x1, y1, x2, y2, p2 = 0, c = INK) { const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1, L = l - p2; let out = ''; for (let k = 1; k <= 6; k++) { const f = k / 6 * L, w = 0.8 + 3.6 * k / 6, px = x1 + dx / l * f, py = y1 + dy / l * f; out += ln(px - dy / l * w, py + dx / l * w, px + dy / l * w, py - dx / l * w, { c, w: 1.7 }); } return out; }
const stereo = (kind, x1, y1, x2, y2, p2, c) => (kind === 'wedge' ? wedge : hash)(x1, y1, x2, y2, p2, c);
const sub3 = (s) => s.replace(/(\d)/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[+d]);

/* A Newman projection. Groups: { t: label, a: angle in degrees (90 = up), c: color, strong }. */
function newman(cx, cy, front, back) {
  const R = 40, pt = (a, r) => [cx + r * Math.cos(a * Math.PI / 180), cy - r * Math.sin(a * Math.PI / 180)];
  let out = '';
  back.forEach((g) => {
    let a = g.a; if (front.some((f) => { const d = Math.abs(C.mod360(f.a - a)); return Math.min(d, 360 - d) < 11; })) a += 13;
    const p1 = pt(a, R), p2 = pt(a, R + 22), p3 = pt(a, R + 36);
    out += ln(p1[0], p1[1], p2[0], p2[1], { c: g.c || INK, w: g.strong ? 3.4 : 2.2 }) + tx(p3[0], p3[1] + 5, g.t, { c: g.c || INK, w: g.strong ? 800 : 600 });
  });
  out += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="#FCFAF6" fill-opacity=".86" stroke="' + INK + '" stroke-width="2.2"/>';
  front.forEach((g) => {
    const p2 = pt(g.a, R + 4), p3 = pt(g.a, R + 19);
    out += ln(cx, cy, p2[0], p2[1], { c: g.c || INK, w: g.strong ? 3.4 : 2.2 }) + tx(p3[0], p3[1] + 5, g.t, { c: g.c || INK, w: g.strong ? 800 : 600 });
  });
  return out + '<circle cx="' + cx + '" cy="' + cy + '" r="3.2" fill="' + INK + '"/>';
}
/* A zigzag butane skeleton with one group on C2 (up) and, optionally, one on C3 (down).
   The wedge or dash on each group is whichever one reads as the wanted label. */
function zigzag(x0, y0, o) {
  const fx = (x) => x0 + (o.flip ? 110 - x : x), P = [[0, 62], [35, 42], [70, 62], [105, 42]].map((p) => [fx(p[0]), y0 + p[1]]);
  let out = '';
  for (let k = 0; k < 3; k++) out += ln(P[k][0], P[k][1], P[k + 1][0], P[k + 1][1]);
  const rel = (a, b) => ({ x: a[0] - b[0], y: a[1] - b[1] });
  if (o.c2) {
    const top = [P[1][0], P[1][1] - 34];
    const kind = C.stereoBond(o.c2.label, [Object.assign({ rank: 1 }, rel(top, P[1])), Object.assign({ rank: 2 }, rel(P[2], P[1])), Object.assign({ rank: 3 }, rel(P[0], P[1]))], 0);
    out += stereo(kind, P[1][0], P[1][1], top[0], top[1], 4, o.c2.c) + tx(top[0], top[1] - 2, o.c2.t, { c: o.c2.c, w: 700 });
    out += tx(P[1][0] + (o.flip ? 13 : -13), P[1][1] - 6, o.c2.label, { size: 13, c: GOLD, w: 800, i: 1 });
  }
  if (o.c3) {
    const bot = [P[2][0], P[2][1] + 34];
    const kind = C.stereoBond(o.c3.label, [Object.assign({ rank: 1 }, rel(bot, P[2])), Object.assign({ rank: 2 }, rel(P[1], P[2])), Object.assign({ rank: 3 }, rel(P[3], P[2]))], 0);
    out += stereo(kind, P[2][0], P[2][1], bot[0], bot[1], 4, o.c3.c) + tx(bot[0], bot[1] + 12, o.c3.t, { c: o.c3.c, w: 700 });
    out += tx(P[2][0] + (o.flip ? -13 : 13), P[2][1] + 14, o.c3.label, { size: 13, c: GOLD, w: 800, i: 1 });
  }
  return out;
}
function hexagon(cx, cy, r, doubles) {
  const P = []; for (let i = 0; i < 6; i++) P.push([cx + r * Math.cos((i * 60 - 30) * Math.PI / 180), cy + r * Math.sin((i * 60 - 30) * Math.PI / 180)]);
  let out = '';
  for (let i = 0; i < 6; i++) {
    const a = P[i], b = P[(i + 1) % 6]; out += ln(a[0], a[1], b[0], b[1]);
    if (doubles && doubles.includes(i)) { const k = 0.78, m = (p) => [cx + (p[0] - cx) * k, cy + (p[1] - cy) * k], a2 = m(a), b2 = m(b), t = 0.14; out += ln(a2[0] + (b2[0] - a2[0]) * t, a2[1] + (b2[1] - a2[1]) * t, b2[0] - (b2[0] - a2[0]) * t, b2[1] - (b2[1] - a2[1]) * t); }
  }
  return out;
}

/* ------------------------------------------------------------------ the seven models */
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const SN2 = C.sn2Labels();
const MODELS = {
  hybrid: { title: 'Hybrid orbitals', lede: 'Count the electron groups on the carbon. That number sets the hybrid, the shape and the angle.', talk: ['hybridization', 'sp, sp2, sp3: count the groups'],
    state: () => ({ kind: 'sp3', orb: true }), view: (s) => s.kind === 'sp3' ? [14, -24, 0] : [-62, 0, 22], fit: (s) => s.kind === 'sp3' ? 1.9 : 2.3,
    controls: () => [{ seg: 'kind', opts: [['sp3', 'sp³'], ['sp2', 'sp²'], ['sp', 'sp']], reset: true }, { toggle: 'orb', label: 'Show orbitals' }],
    build(s) {
      const m = C.hybridMol(s.kind), f = m.info.facts;
      return { parts: [{ m }], orbitals: s.orb, badge: s.kind.replace('2', '²').replace('3', '³') + ' · ' + f.angle + '°', badge2: f.shape, labels: [] };
    },
    draw(s) {
      if (s.kind === 'sp3') return svg(150, bd(150, 76, 150, 30, 9, 9) + bd(150, 76, 104, 100, 9, 9) + wedge(157, 82, 188, 116, 8) + hash(159, 74, 204, 62, 9) +
        tx(150, 81, 'C', { size: 16, w: 800 }) + tx(150, 24, 'H') + tx(96, 110, 'H') + tx(195, 128, 'H') + tx(213, 64, 'H') + tx(150, 145, 'methane, CH₄: four single bonds', { size: 13, c: MUTE }));
      if (s.kind === 'sp2') return svg(150, ln(131, 67, 169, 67) + ln(131, 75, 169, 75) + bd(120, 71, 92, 36, 9, 9) + bd(120, 71, 92, 106, 9, 9) + bd(180, 71, 208, 36, 9, 9) + bd(180, 71, 208, 106, 9, 9) +
        tx(120, 76, 'C', { size: 16, w: 800 }) + tx(180, 76, 'C', { size: 16, w: 800 }) + tx(87, 34, 'H') + tx(87, 116, 'H') + tx(213, 34, 'H') + tx(213, 116, 'H') + tx(150, 145, 'ethene, H₂C=CH₂: one double bond', { size: 13, c: MUTE }));
      return svg(150, ln(128, 63, 172, 63) + ln(128, 71, 172, 71) + ln(128, 79, 172, 79) + bd(116, 71, 62, 71, 9, 9) + bd(184, 71, 238, 71, 9, 9) +
        tx(116, 76, 'C', { size: 16, w: 800 }) + tx(184, 76, 'C', { size: 16, w: 800 }) + tx(54, 76, 'H') + tx(246, 76, 'H') + tx(150, 145, 'ethyne, HC≡CH: one triple bond', { size: 13, c: MUTE }));
    },
    words(s) {
      const f = C.HYBRID[s.kind], name = s.kind === 'sp3' ? 'sp<sup>3</sup>' : s.kind === 'sp2' ? 'sp<sup>2</sup>' : 'sp';
      const pi = s.kind === 'sp3' ? 'No p orbital is left over, so every bond is a sigma bond and the groups can rotate.'
        : s.kind === 'sp2' ? 'One p orbital is left on each carbon. Side by side, they overlap above and below the plane: that is the pi bond, and it stops the double bond from rotating.'
        : 'Two p orbitals are left on each carbon, at right angles. They make the two pi bonds of the triple bond.';
      return '<p class="big">' + f.groups + ' electron groups: ' + name + ', ' + f.shape + ', ' + f.angle + '°.</p>' +
        '<p>' + cap(f.molecule) + ': ' + (s.kind === 'sp3' ? 'the' : 'each') + ' carbon makes ' + f.sigma + ' sigma bond' + (f.sigma > 1 ? 's' : '') + ' with its ' + name + ' hybrids' + (f.pi ? ' and ' + f.pi + ' pi bond' + (f.pi > 1 ? 's' : '') + ' with its leftover p orbital' + (f.pi > 1 ? 's' : '') : '') + '. ' + pi + '</p>' +
        '<p class="rule">The hybrid is ' + f.sChar + '% s. More s character holds electrons closer: sp C-H bonds are the shortest, the strongest and the most acidic (pK<sub>a</sub> about 25 for ethyne, 44 for ethene, 50 for ethane).</p>';
    }
  },
  newman: { title: 'Newman projections', lede: 'Look straight down the C2 to C3 bond of butane and turn the back carbon.', talk: ['newman', 'Newman projections: staggered and eclipsed'],
    state: () => ({ phi: 180 }), view: () => [9, -20, 0], fit: () => 3.0,
    controls: () => [{ range: 'phi', min: 0, max: 360, step: 5, label: 'Turn the back carbon', out: (s) => s.phi + '°' },
      { seg: 'phi', opts: [[180, 'Anti'], [60, 'Gauche'], [120, 'Eclipsed'], [0, 'Fully eclipsed']], tween: 500 }],
    build(s) {
      const m = C.butaneMol(s.phi), I = m.info, cf = C.conformer(s.phi);
      return { parts: [{ m, paint: (a) => /me/.test(a.tag) ? '#e2c97a' : null }], badge: cf.name, badge2: round(C.butaneEnergy(s.phi)) + ' kJ/mol',
        labels: [{ k: 0, i: I.front[0], text: 'CH₃ front', cls: 'gold' }, { k: 0, i: I.back[0], text: 'CH₃ back', cls: 'gold' }] };
    },
    draw(s) {
      const g = C.newmanGroups(s.phi), lab = (x) => ({ t: x.g === 'CH3' ? 'CH₃' : 'H', a: x.a, c: x.g === 'CH3' ? GOLD : INK, strong: x.g === 'CH3' });
      const X = (p) => 34 + p / 360 * 236, Y = (e) => 246 - e / 19 * 58;
      let d = ''; for (let p = 0; p <= 360; p += 5) d += (p ? 'L' : 'M') + round(X(p)) + ' ' + round(Y(C.butaneEnergy(p)));
      let ticks = ''; [0, 60, 120, 180, 240, 300, 360].forEach((p) => { ticks += ln(X(p), 250, X(p), 254, { c: MUTE, w: 1.4 }) + tx(X(p), 268, String(p), { size: 13, c: MUTE, w: 500 }); });
      return svg(274, newman(150, 80, g.front.map(lab), g.back.map(lab)) + ln(34, 250, 270, 250, { c: MUTE, w: 1.4 }) + ticks +
        '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="2.2"/>' + ln(X(s.phi), 250, X(s.phi), Y(C.butaneEnergy(s.phi)), { c: GOLD, w: 1.6, dash: '3 3' }) +
        '<circle cx="' + round(X(s.phi)) + '" cy="' + round(Y(C.butaneEnergy(s.phi))) + '" r="6" fill="#C9A84C" stroke="' + INK + '" stroke-width="2"/>' + tx(292, 182, 'energy vs angle', { size: 13, c: MUTE, a: 'end', w: 500 }));
    },
    words(s) {
      const cf = C.conformer(s.phi);
      return '<p class="big">' + cf.name + ': ' + (cf.key === 'anti' ? 'the lowest energy' : (cf.key === 'between' ? 'about ' : '') + cf.kJ + ' kJ/mol above anti') + '.</p><p>' + cf.note + '</p>' +
        '<p class="rule">Order to know: anti (0) is below gauche (3.8), below eclipsed (16), below fully eclipsed (19 kJ/mol). Staggered always beats eclipsed, and big groups want to be anti.</p>';
    }
  },
  chair: { title: 'Chair flips', lede: 'Flip the ring and watch one group go from axial to equatorial.', talk: ['chair-flip', 'Chairs: axial, equatorial and the ring flip'],
    state: () => ({ sub: 'Me', t: 0, ax: false }), view: () => [-74, 0, 14], fit: (s) => s.sub === 'tBu' ? 3.9 : 3.4,
    controls: () => [{ btn: (s) => s.t < 0.5 ? 'Flip the ring: to equatorial' : 'Flip the ring: to axial', primary: true, go: (api, s) => api.tween('t', s.t < 0.5 ? 1 : 0, 900) },
      { seg: 'sub', opts: [['Me', 'Methyl'], ['tBu', 'tert-Butyl']] }, { toggle: 'ax', label: 'Light up the axial H' }],
    build(s) {
      const m = C.chairMol(s.sub, s.t), I = m.info, g = C.CHAIR[s.sub], labels = [{ k: 0, i: I.sub, text: sub3(g.formula) + ' ' + I.position, cls: 'gold', d: 20 }];
      m.atoms.forEach((a, i) => { if (/clash/.test(a.tag)) labels.push({ k: 0, i, text: 'H', cls: 'rose', d: 14 }); });
      return { parts: [{ m, paint: (a) => a.tag === 'sub' || a.tag === 'me' ? '#e2c97a' : /clash/.test(a.tag) ? '#f3a1b6' : (s.ax && /^ax/.test(a.tag) ? '#8fd3ff' : null) }], labels,
        badge: cap(I.position), badge2: I.position === 'axial' ? '+' + g.strain + ' kJ/mol' : 'lower energy' };
    },
    draw(s) {
      const m = C.chairMol(s.sub, s.t), I = m.info, g = C.CHAIR[s.sub], A = 8 * Math.PI / 180;
      const P = (p) => { const x = p[0] * Math.cos(A) - p[1] * Math.sin(A), y = p[0] * Math.sin(A) + p[1] * Math.cos(A); return [140 + 36 * x, 98 - 36 * p[2] * 1.5 + 36 * y * 0.45]; };
      const tip = (c, i, L) => P(C.vec.add(m.pos(c), C.vec.mul(C.vec.unit(C.vec.sub(m.pos(i), m.pos(c))), L)));
      const R = I.ring.map((i) => P(m.pos(i))); let out = '';
      for (let i = 0; i < 6; i++) out += ln(R[i][0], R[i][1], R[(i + 1) % 6][0], R[(i + 1) % 6][1], { w: 2.6 });
      const sp = tip(I.ring[0], I.sub, 0.9), ax = I.position === 'axial';
      out += ln(R[0][0], R[0][1], sp[0], sp[1], { c: GOLD, w: 3 }) + tx(sp[0] + (ax ? 0 : 8), sp[1] + (ax ? -7 : 5), sub3(g.formula), { c: GOLD, w: 800, a: ax ? 'middle' : 'start' });
      m.atoms.forEach((a, i) => {
        if (a.el !== 'H' || a.tag === 'hm') return;
        const c = m.nbrs(i)[0], k = I.ring.indexOf(c); if (k < 0) return;
        const hp = tip(c, i, 0.62), clash = /clash/.test(a.tag);
        if (clash) out += ln(R[k][0], R[k][1], hp[0], hp[1], { c: ROSE, w: 2.4 }) + tx(hp[0], hp[1] - 6, 'H', { c: ROSE, w: 800 }) + ln(hp[0] + 9, hp[1] - 9, sp[0] - 5, sp[1] + 10, { c: ROSE, w: 1.6, dash: '3 4' });
        else if (k === 0) out += ln(R[k][0], R[k][1], hp[0], hp[1], { c: MUTE, w: 1.8 }) + tx(hp[0] + (ax ? 12 : 0), hp[1] + (ax ? 6 : 14), 'H', { c: MUTE });
      });
      return svg(196, out + tx(150, 190, ax ? 'axial: straight up, beside two axial H' : 'equatorial: out to the side, clear of the ring', { size: 13, c: MUTE }));
    },
    words(s) {
      const g = C.CHAIR[s.sub], pos = C.chairPosition(0, 'up', s.t), pct = C.eqPercent(g.strain);
      const share = pct > 99.9 ? 'more than 99.9%' : 'about ' + Math.floor(pct) + '%';
      return '<p class="big">' + cap(g.name) + ' is ' + pos + '.</p>' +
        (pos === 'axial' ? '<p>It points straight up, right beside the two axial hydrogens on the same face, two carbons away. Those two 1,3-diaxial interactions cost ' + g.strain + ' kJ/mol.</p>'
          : '<p>It points out to the side, away from the ring. No 1,3-diaxial strain, so this chair is ' + g.strain + ' kJ/mol lower. At 25 °C, ' + share + ' of ' + g.molecule + ' sits in this chair' + (s.sub === 'tBu' ? ': the ring is locked.' : '.') + '</p>') +
        '<p class="rule">A ring flip turns every axial bond equatorial and every equatorial bond axial. Up stays up and down stays down. The bigger group takes the equatorial spot.</p>';
    }
  },
  stereo: { title: 'Mirror images', lede: 'Start from (2R,3R)-2,3-dibromobutane. Mirror it, or flip just one center, and name the pair.', talk: ['stereo', 'R or S, E or Z'],
    state: () => ({ b: 'mirror' }), view: () => [14, 66, 0], fit: () => 4.3,
    controls: () => [{ seg: 'b', opts: [['mirror', 'Mirror it'], ['one', 'Flip one center'], ['same', 'Turn it over']] }],
    parts(s) {
      const A = C.dibromobutane('R', 'R'); let B, plane = null;
      if (s.b === 'mirror') { B = C.dibromobutane('R', 'R').mirror(); plane = 'between'; }
      else if (s.b === 'one') { B = C.dibromobutane('R', 'S', 0); plane = 'inside'; }
      else { B = C.dibromobutane('R', 'R'); B.atoms.forEach((a) => { a.x = -a.x; a.z = -a.z; }); }
      const la = C.dibromoLabels(A), lb = C.dibromoLabels(B);
      return { A, B, la, lb, plane, rel: C.relate(la, lb), meso: C.isMeso(lb) };
    },
    build(s) {
      const q = this.parts(s), labels = [], paint = (a) => a.tag === 'cf' || a.tag === 'cb' ? '#e2c97a' : null;
      [[q.A, q.la], [q.B, q.lb]].forEach(([m, l], k) => {
        labels.push({ k, i: m.info.cf, text: l[0], cls: 'big', d: 0 }, { k, i: m.info.cb, text: l[1], cls: 'big', d: 0 });
        m.atoms.forEach((a, i) => { if (a.el === 'Br') labels.push({ k, i, text: 'Br', d: 17 }); });
      });
      return { parts: [{ m: q.A, at: [-2.75, 0, 0], paint }, { m: q.B, at: [2.75, 0, 0], paint, mirror: s.b === 'mirror' }], labels,
        extras: q.plane === 'between' ? [{ plane: 'x', at: [0, 0, 0], size: 5.4 }] : q.plane === 'inside' ? [{ plane: 'z', k: 1, size: 4.6 }] : [],
        badge: cap(q.rel), badge2: q.meso ? 'right: meso' : '' };
    },
    draw(s) {
      const q = this.parts(s), br = (l) => ({ t: 'Br', label: l, c: ROSE });
      const name = (l) => '(2' + l[0] + ',3' + l[1] + ')';
      return svg(176, zigzag(14, 28, { c2: br(q.la[0]), c3: br(q.la[1]) }) + zigzag(176, 28, { c2: br(q.lb[0]), c3: br(q.lb[1]), flip: s.b === 'mirror' }) +
        (s.b === 'mirror' ? ln(150, 20, 150, 142, { c: MUTE, w: 1.6, dash: '5 5' }) + tx(150, 14, 'mirror', { size: 13, c: MUTE }) : '') +
        tx(66, 168, name(q.la), { w: 800 }) + tx(228, 168, name(q.lb) + (q.meso ? ' meso' : ''), { w: 800 }));
    },
    words(s) {
      const q = this.parts(s);
      if (s.b === 'mirror') return '<p class="big">Every center flipped: enantiomers.</p><p>The mirror image of (2R,3R) is (2S,3S). Turn them any way you like: they never line up. Enantiomers share every physical property except the direction they rotate plane-polarized light.</p>' +
        '<p class="rule">Flip all the stereocenters and you get the enantiomer. Flip some but not all and you get a diastereomer.</p>';
      if (s.b === 'one') return '<p class="big">One center flipped: diastereomers, and this one is meso.</p><p>(2R,3S) has two stereocenters but also a mirror plane through its middle (the pale sheet), so it is its own mirror image: achiral and optically inactive. (2R,3S) and (2S,3R) are the same compound.</p>' +
        '<p class="rule">That is why 2,3-dibromobutane has three stereoisomers, not four: one pair of enantiomers plus one meso compound. Diastereomers have different physical properties.</p>';
      return '<p class="big">Same labels: the identical molecule.</p><p>The one on the right is only turned over. Rotating a molecule never changes R or S, so (2R,3R) is still (2R,3R). ' + (q.rel === 'identical' ? 'On the DAT, assign R and S to both drawings before you call them different.' : '') + '</p>' +
        '<p class="rule">Same connectivity and the same R and S at every center means the same compound, however it is drawn.</p>';
    }
  },
  sn2: { title: 'SN2 backside attack', lede: 'Hydroxide meets (S)-2-bromobutane. Drag the slider through the one step.', talk: ['sn2-e2-shape', 'SN2 and E2 in 3D: backside and anti'],
    state: () => ({ p: 0 }), view: () => [14, -18, 0], fit: () => 3.5,
    controls: () => [{ range: 'p', min: 0, max: 1, step: 0.01, label: 'Reaction progress', out: (s) => Math.round(s.p * 100) + '%' },
      { btn: (s) => s.p >= 1 ? 'Run it again' : 'Run the reaction', primary: true, go: (api, s) => { if (s.p >= 0.99) s.p = 0; api.tween('p', 1, 2600 * (1 - s.p)); } }],
    build(s) {
      const m = C.sn2Mol(s.p), I = m.info, st = I.stage;
      return { parts: [{ m, paint: (a) => a.tag === 'center' ? '#e2c97a' : null }], badge: st === 'reactant' ? 'Backside attack' : st === 'ts' ? 'Transition state' : 'Inverted', badge2: st === 'reactant' ? '(' + SN2.reactant + ')' : st === 'ts' ? 'carbon is flat' : '(' + SN2.product + ')',
        labels: [{ k: 0, i: I.o, text: st === 'product' ? 'HO' : 'HO⁻', d: 18 }, { k: 0, i: I.br, text: st === 'reactant' ? 'Br' : st === 'ts' ? 'Br' : 'Br⁻', d: 20 }, { k: 0, i: I.ids.Me, text: 'CH₃', d: 16 }, { k: 0, i: I.ids.Et, text: 'CH₂CH₃', d: 18 }] };
    },
    draw(s) {
      const st = C.sn2Mol(s.p).info.stage, box = (x, w) => '<rect x="' + x + '" y="6" width="' + w + '" height="132" rx="12" fill="#C9A84C" fill-opacity=".2"/>';
      return svg(150, (st === 'reactant' ? box(4, 122) : st === 'ts' ? box(127, 46) : box(174, 122)) +
        zigzag(12, 26, { c2: { t: 'Br', label: SN2.reactant, c: ROSE } }) + zigzag(182, 26, { c2: { t: 'OH', label: SN2.product, c: BLUE } }) +
        ln(128, 76, 170, 76) + ln(170, 76, 162, 71) + ln(170, 76, 162, 81) + tx(149, 66, 'HO⁻', { c: BLUE, w: 700 }) + tx(149, 98, 'one', { size: 13, c: MUTE }) + tx(149, 113, 'step', { size: 13, c: MUTE }) +
        tx(64, 132, '(' + SN2.reactant + ')-2-bromobutane', { size: 13, w: 700 }) + tx(236, 132, '(' + SN2.product + ')-butan-2-ol', { size: 13, w: 700 }));
    },
    words(s) {
      const st = C.sn2Mol(s.p).info.stage;
      return (st === 'reactant' ? '<p class="big">Backside attack: 180° from the leaving group.</p><p>Hydroxide comes in directly opposite the C-Br bond. It cannot come in from the front, because bromine is in the way.</p>'
        : st === 'ts' ? '<p class="big">One step, one transition state.</p><p>The C-O bond is half made and the C-Br bond is half broken at the same moment. The carbon is flat for an instant, with five groups around it. There is no intermediate and no carbocation.</p>'
        : '<p class="big">Inversion: (' + SN2.reactant + ') in, (' + SN2.product + ') out.</p><p>The three other groups have flipped to the far side, like an umbrella in the wind. OH sits where the back of the carbon used to be.</p>') +
        '<p class="rule">Rate = k[alkyl halide][nucleophile]. S<sub>N</sub>2 needs room at the back: methyl is faster than 1°, faster than 2°, and 3° does not go. A stereocenter always inverts.</p>';
    }
  },
  e2: { title: 'E2 anti-periplanar', lede: 'Turn the back carbon of 2-bromobutane until a hydrogen is anti to bromine, then run it.', talk: ['sn2-e2-shape', 'SN2 and E2 in 3D: backside and anti'],
    state: () => ({ theta: 300, p: 0 }), view: () => [9, -24, 0], fit: () => 3.6,
    controls: () => [{ range: 'theta', min: 0, max: 360, step: 5, label: 'Turn the back carbon', out: (s) => s.theta + '°', on: (s) => { s.p = 0; } },
      { btn: (s) => s.p > 0 ? 'Reset' : 'Run E2', primary: true, disabled: (s) => !C.e2State(s.theta).anti, go: (api, s) => { if (s.p > 0) { s.p = 0; api.refresh(); } else api.tween('p', 1, 2400); } }],
    build(s) {
      const m = C.e2Mol(s.theta, s.p), I = m.info, st = I.state, done = I.s > 0.85;
      const labels = [{ k: 0, i: I.front[0], text: done ? 'Br⁻' : 'Br', cls: 'rose', d: 20 }, { k: 0, i: I.front[1], text: 'CH₃', d: 16 }, { k: 0, i: I.back[2], text: 'CH₃', d: 16 },
        { k: 0, i: I.back[0], text: 'Ha', cls: st.anti === 'Ha' ? 'gold' : '', d: 14 }, { k: 0, i: I.back[1], text: 'Hb', cls: st.anti === 'Hb' ? 'gold' : '', d: 14 }];
      if (st.anti) labels.push({ k: 0, i: I.base, text: 'base', d: 18 });
      return { parts: [{ m, paint: (a) => /^hl/.test(a.tag) ? '#e2c97a' : null }], labels, badge: done ? (st.product === 'trans' ? 'trans-2-butene' : 'cis-2-butene') : st.anti ? 'Anti-periplanar' : 'No H anti to Br', badge2: done ? (st.product === 'trans' ? 'E, major' : 'Z, minor') : st.anti ? 'E2 can go' : 'keep turning' };
    },
    draw(s) {
      const g = C.e2Groups(s.theta), st = C.e2State(s.theta);
      const f = g.front.map((x) => ({ t: x.g === 'CH3' ? 'CH₃' : x.g, a: 90 + x.rel, c: x.g === 'Br' ? ROSE : INK, strong: x.g === 'Br' }));
      const b = g.back.map((x) => ({ t: x.name === 'Ha' ? 'Ha' : x.name === 'Hb' ? 'Hb' : 'CH₃', a: 90 + x.rel, c: st.anti && x.name === st.anti ? GOLD : INK, strong: !!(st.anti && x.name === st.anti) }));
      let prod;
      if (!st.anti) prod = tx(150, 214, 'No H is 180° from Br here.', { size: 14, c: MUTE }) + tx(150, 234, 'E2 cannot start from this conformer.', { size: 13, c: MUTE });
      else {
        const trans = st.product === 'trans', y = 206;
        prod = ln(130, y - 3, 170, y - 3) + ln(130, y + 3, 170, y + 3) + ln(130, y, 104, y + 22) + ln(170, y, 196, trans ? y - 22 : y + 22) +
          tx(92, y + 34, 'CH₃', { size: 13 }) + tx(208, trans ? y - 26 : y + 34, 'CH₃', { size: 13 }) + tx(150, 266, (trans ? 'trans' : 'cis') + '-2-butene: methyls ' + (trans ? 'across' : 'on the same side'), { size: 13, w: 700 });
      }
      return svg(274, newman(150, 84, f, b) + ln(20, 176, 280, 176, { c: MUTE, w: 1, dash: '2 5' }) + prod);
    },
    words(s) {
      const st = C.e2State(s.theta);
      const head = !st.anti ? '<p class="big">No hydrogen is anti to Br yet.</p><p>E2 happens in one step, and it needs the H and the leaving group anti-periplanar: 180° apart and in the same plane. Right now no hydrogen on the back carbon sits opposite Br. Keep turning.</p>'
        : st.product === 'trans' ? '<p class="big">H<sub>b</sub> is anti to Br. The methyls are anti too.</p><p>Run it: the base takes H<sub>b</sub>, those electrons become the pi bond, and Br leaves, all at once. Groups that were anti end up across the double bond: trans-2-butene (E), the major product.</p>'
          : '<p class="big">H<sub>a</sub> is anti to Br. The methyls are gauche.</p><p>Run it: the base takes H<sub>a</sub>, those electrons become the pi bond, and Br leaves, all at once. Groups that were gauche end up on the same side: cis-2-butene (Z), the minor product, because this conformer is more crowded.</p>';
      return head + '<p class="rule">Rate = k[alkyl halide][base]. The geometry of the starting conformer decides the alkene: that is why E2 is stereospecific. Zaitsev: the more substituted alkene wins, unless the base is bulky.</p>';
    }
  },
  benzene: { title: 'The benzene ring', lede: 'Six p orbitals, six electrons, one ring of electron cloud above and below.', talk: ['aromaticity', 'Aromatic or not: four checks'],
    state: () => ({ show: 'p' }), view: () => [-52, 0, 15], fit: () => 3.2,
    controls: () => [{ seg: 'show', opts: [['none', 'Sigma frame'], ['p', 'p orbitals'], ['cloud', 'Pi cloud']] }],
    build(s) {
      const m = C.benzeneMol();
      return { parts: [{ m }], orbitals: s.show === 'p', extras: s.show === 'cloud' ? [{ torus: m.info.radius }] : [], labels: [],
        badge: s.show === 'none' ? 'Flat, 120°' : s.show === 'p' ? '6 p orbitals' : '6 π electrons', badge2: s.show === 'cloud' ? '4n + 2, n = 1' : 'all sp²' };
    },
    draw() {
      return svg(150, hexagon(52, 66, 32, [0, 2, 4]) + hexagon(150, 66, 32, [1, 3, 5]) + hexagon(248, 66, 32) + '<circle cx="248" cy="66" r="19" fill="none" stroke="' + INK + '" stroke-width="2.2"/>' +
        ln(92, 66, 110, 66) + ln(92, 66, 97, 62) + ln(92, 66, 97, 70) + ln(110, 66, 105, 62) + ln(110, 66, 105, 70) + tx(199, 71, '=', { size: 18 }) +
        tx(101, 128, 'two resonance forms', { size: 13, c: MUTE }) + tx(248, 128, 'the real ring', { size: 13, c: MUTE }) + tx(150, 146, 'benzene, C₆H₆', { size: 13, c: MUTE }));
    },
    words(s) {
      return '<p class="big">' + (s.show === 'cloud' ? 'Six pi electrons, shared by all six carbons.' : s.show === 'p' ? 'One p orbital on every carbon, all parallel.' : 'Six sp<sup>2</sup> carbons in a flat hexagon.') + '</p>' +
        '<p>Each carbon uses three sp<sup>2</sup> hybrids for its sigma bonds and has one p orbital, holding one electron, standing straight up from the ring. The six p orbitals overlap all the way around, so the electrons are delocalized: every C-C bond is the same length, 1.39 Å, between a single (1.54) and a double (1.34).</p>' +
        '<p class="rule">Aromatic takes all four: a ring, flat, a p orbital on every ring atom, and 4n + 2 pi electrons (2, 6, 10). With 4n pi electrons (4, 8) it is antiaromatic. Benzene is so stable that it substitutes (EAS) and does not add.</p>';
    }
  }
};
const ORDER = Object.keys(MODELS);

/* ------------------------------------------------------------------ page state */
const view = $('view');
let cur = null, state = null, scene3 = null, built = null, tags = [], anim = 0, userTurned = false;
let THREE = null, renderer = null, scene, camera, root, G = {}, mats = {}, Q = null;

function mat(hex, glass) {
  const key = hex + (glass ? 'g' : '');
  return mats[key] || (mats[key] = glass ? new THREE.MeshStandardMaterial({ color: hex, roughness: 0.35, metalness: 0, transparent: true, opacity: glass, depthWrite: false, side: THREE.DoubleSide })
    : new THREE.MeshStandardMaterial({ color: hex, roughness: 0.42, metalness: 0.06 }));
}
function init3d() {
  try {
    const c = document.createElement('canvas');
    if (!(c.getContext('webgl2') || c.getContext('webgl'))) throw new Error('no webgl');
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: c });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    view.insertBefore(c, view.firstChild);
  } catch (e) {
    renderer = null;
    const n = document.createElement('div'); n.className = 'm-nogl'; n.textContent = 'This browser cannot draw 3D (WebGL is off). The line drawing and the written version below still work.'; view.appendChild(n);
    $('hint').hidden = true; return;
  }
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(30, 4 / 3, 0.1, 200);
  scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  const sun = new THREE.DirectionalLight(0xffffff, 2.4); sun.position.set(4, 7, 9); scene.add(sun);
  const fill = new THREE.DirectionalLight(0xbfe3d2, 0.7); fill.position.set(-6, -3, 4); scene.add(fill);
  root = new THREE.Group(); scene.add(root);
  G.sphere = new THREE.SphereGeometry(1, 28, 20); G.cyl = new THREE.CylinderGeometry(1, 1, 1, 14); G.plane = new THREE.CircleGeometry(1, 48);
  Q = new THREE.Quaternion();
}
function setView(deg) {
  if (!THREE) return;
  const r = (d) => d * Math.PI / 180;
  Q.setFromEuler(new THREE.Euler(r(deg[0]), r(deg[1]), 0, 'XYZ')).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), r(deg[2])));
}
function stick(g, A, B, radius, hex, glass) {
  const len = A.distanceTo(B); if (len < 1e-6) return;
  const m = new THREE.Mesh(G.cyl, mat(hex, glass)); m.position.copy(A).add(B).multiplyScalar(0.5); m.scale.set(radius, len, radius);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); g.add(m);
}
function build3d(sc) {
  if (!renderer) return;
  root.clear();
  sc.parts.forEach((p) => {
    const holder = new THREE.Group(), g = new THREE.Group(); holder.position.fromArray(p.at || [0, 0, 0]); holder.add(g); root.add(holder);
    p.group = g;
    const m = p.m, V = (i) => new THREE.Vector3(m.atoms[i].x, m.atoms[i].y, m.atoms[i].z);
    m.atoms.forEach((a) => { const s = new THREE.Mesh(G.sphere, mat((p.paint && p.paint(a)) || EL[a.el][0])); s.scale.setScalar(EL[a.el][1]); s.position.set(a.x, a.y, a.z); g.add(s); });
    m.bonds.forEach(([i, j, order, kind]) => {
      const A = V(i), B = V(j), dir = B.clone().sub(A).normalize();
      if (kind === 'partial') { for (let k = 0; k < 5; k++) stick(g, A.clone().lerp(B, (k + 0.18) / 5), A.clone().lerp(B, (k + 0.72) / 5), 0.07, '#e2c97a'); return; }
      let side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 0, 1)); if (side.lengthSq() < 0.01) side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)); side.normalize();
      const offs = order === 2 ? [-0.11, 0.11] : order === 3 ? [-0.17, 0, 0.17] : [0];
      offs.forEach((o) => stick(g, A.clone().addScaledVector(side, o), B.clone().addScaledVector(side, o), order > 1 ? 0.07 : kind === 'arom' ? 0.11 : 0.095, '#d5dcd6'));
    });
    if (sc.orbitals) m.orbitals.forEach((o) => {
      const hyb = o.kind === 'hyb', hex = hyb ? '#63d2c1' : o.kind === 'p2' ? (o.phase > 0 ? '#f3a1b6' : '#b79cf0') : (o.phase > 0 ? '#f0cf6a' : '#7fb6ff');
      const s = new THREE.Mesh(G.sphere, mat(hex, hyb ? 0.34 : 0.56)), L = hyb ? 0.46 : 0.6, W = hyb ? 0.24 : 0.3, d = new THREE.Vector3().fromArray(o.dir);
      s.scale.set(W, L, W); s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d); s.position.fromArray(o.at).addScaledVector(d, L + 0.06); g.add(s);
    });
  });
  (sc.extras || []).forEach((x) => {
    if (x.plane) {
      const pl = new THREE.Mesh(G.plane, mat('#f5f0e8', 0.22)); pl.scale.setScalar(x.size / 2);
      if (x.plane === 'x') { pl.rotation.y = Math.PI / 2; root.add(pl); } else sc.parts[x.k].group.add(pl);
    } else if (x.torus) {
      [0.62, -0.62].forEach((z) => { const t = new THREE.Mesh(G.torus || (G.torus = new THREE.TorusGeometry(x.torus, 0.3, 20, 64)), mat('#f0cf6a', 0.55)); t.position.z = z; sc.parts[0].group.add(t); });
    }
  });
  camera.position.set(0, 0, sc.fit / Math.tan(15 * Math.PI / 180) * 1.04);
  orient(sc);
}
function orient(sc) { sc.parts.forEach((p) => { if (!p.group) return; if (p.mirror) p.group.quaternion.set(Q.x, -Q.y, -Q.z, Q.w); else p.group.quaternion.copy(Q); }); }
function render() {
  if (!renderer || !built) return;
  orient(built); root.updateMatrixWorld(true); renderer.render(scene, camera);
  const r = view.getBoundingClientRect(), v = new THREE.Vector3(), c = new THREE.Vector3();
  tags.forEach((t) => {
    const p = built.parts[t.k], a = p.m.atoms[t.i]; if (!a || !p.group) { t.el.hidden = true; return; }
    v.set(a.x, a.y, a.z).applyMatrix4(p.group.matrixWorld).project(camera); c.set(0, 0, 0).applyMatrix4(p.group.matrixWorld).project(camera);
    let x = (v.x + 1) / 2 * r.width, y = (1 - v.y) / 2 * r.height; const cx = (c.x + 1) / 2 * r.width, cy = (1 - c.y) / 2 * r.height;
    const dx = x - cx, dy = y - cy, l = Math.hypot(dx, dy) || 1, d = t.d == null ? 15 : t.d;
    x += dx / l * d; y += dy / l * d;
    const hw = t.el.offsetWidth / 2 + 3;
    x = Math.max(hw, Math.min(r.width - hw, x)); y = Math.max(46, Math.min(r.height - 12, y));
    t.el.style.transform = 'translate(' + round(x) + 'px,' + round(y) + 'px) translate(-50%,-50%)';
  });
}
function size() {
  if (!renderer) return;
  const r = view.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height;
  /* a tall stage (wide desktop column is 4:3 too, but keep the model inside any shape) */
  camera.updateProjectionMatrix(); render();
}

/* ------------------------------------------------------------------ build the page from the state */
function refresh() {
  const M = MODELS[cur], sc = M.build(state); sc.fit = M.fit(state); built = sc;
  $('badge').textContent = sc.badge || ''; $('badge2').textContent = sc.badge2 || '';
  $('draw').innerHTML = M.draw(state); $('words').innerHTML = M.words(state);
  tags.forEach((t) => t.el.remove()); tags = [];
  sc.labels.forEach((l) => { const el = document.createElement('span'); el.className = 'm-tag' + (l.cls ? ' m-tag--' + l.cls : ''); el.textContent = l.text; el.hidden = !renderer; view.appendChild(el); tags.push(Object.assign({ el }, l)); });
  if (renderer) { build3d(sc); render(); }
  sync();
}
let ctl = [];
function controls() {
  const host = $('ctl'); host.textContent = ''; ctl = [];
  MODELS[cur].controls(state).forEach((sp) => {
    if (sp.seg) {
      const row = document.createElement('div'); row.className = 'm-seg'; row.setAttribute('role', 'group');
      sp.opts.forEach(([val, label]) => {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = label;
        b.addEventListener('click', () => { stop(); if (sp.tween && !reduced()) api.tween(sp.seg, val, sp.tween); else { state[sp.seg] = val; if (sp.reset) { userTurned = false; setView(MODELS[cur].view(state)); } refresh(); } });
        row.appendChild(b); ctl.push(() => b.setAttribute('aria-pressed', state[sp.seg] === val ? 'true' : 'false'));
      });
      host.appendChild(row);
    } else if (sp.toggle) {
      const row = document.createElement('div'); row.className = 'm-seg'; const b = document.createElement('button'); b.type = 'button'; b.textContent = sp.label;
      b.addEventListener('click', () => { state[sp.toggle] = !state[sp.toggle]; refresh(); }); row.appendChild(b); host.appendChild(row);
      ctl.push(() => b.setAttribute('aria-pressed', state[sp.toggle] ? 'true' : 'false'));
    } else if (sp.range) {
      const row = document.createElement('div'); row.className = 'm-range'; const id = 'r-' + sp.range;
      const lab = document.createElement('label'); lab.htmlFor = id; const name = document.createElement('span'); name.textContent = sp.label; const out = document.createElement('output'); lab.append(name, out);
      const inp = document.createElement('input'); inp.type = 'range'; inp.id = id; inp.min = sp.min; inp.max = sp.max; inp.step = sp.step;
      inp.addEventListener('input', () => { stop(); state[sp.range] = +inp.value; if (sp.on) sp.on(state); refresh(); });
      row.append(lab, inp); host.appendChild(row);
      ctl.push(() => { if (document.activeElement !== inp || anim) inp.value = state[sp.range]; out.textContent = sp.out(state); });
    } else if (sp.btn) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'm-btn' + (sp.primary ? ' m-btn--go' : '');
      b.addEventListener('click', () => { stop(); sp.go(api, state); }); host.appendChild(b);
      ctl.push(() => { b.textContent = typeof sp.btn === 'function' ? sp.btn(state) : sp.btn; b.disabled = sp.disabled ? !!sp.disabled(state) : false; });
    }
  });
}
function sync() { ctl.forEach((f) => f()); }
function stop() { if (anim) { cancelAnimationFrame(anim); anim = 0; } }
const api = {
  refresh,
  tween(key, to, ms) {
    stop();
    const from = state[key], t0 = performance.now();
    if (reduced() || ms <= 0) { state[key] = to; refresh(); return; }
    const step = (now) => { const k = Math.min(1, (now - t0) / ms); state[key] = from + (to - from) * k; if (k >= 1) { state[key] = to; anim = 0; refresh(); return; } refresh(); anim = requestAnimationFrame(step); };
    anim = requestAnimationFrame(step);
  }
};
function show(id, push) {
  stop(); cur = MODELS[id] ? id : ORDER[0]; const M = MODELS[cur]; state = M.state(); userTurned = false;
  $('title').textContent = M.title; $('lede').textContent = M.lede; document.title = M.title + ' in 3D · OChem · Ace Labs';
  view.setAttribute('aria-label', '3D model: ' + M.title);
  [...$('picks').children].forEach((a) => { const on = a.dataset.m === cur; a.setAttribute('aria-current', on ? 'true' : 'false'); if (on && a.scrollIntoView && push) a.scrollIntoView({ block: 'nearest', inline: 'center' }); });
  const nx = ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length], next = $('next'); next.textContent = '';
  const a1 = document.createElement('a'); a1.className = 'aui-btn aui-btn--quiet aui-btn--sm'; a1.href = '/oc/chalk/?t=' + M.talk[0]; a1.textContent = 'Chalk Talk: ' + M.talk[1]; next.appendChild(a1);
  const a2 = document.createElement('a'); a2.className = 'aui-btn aui-btn--sm'; a2.href = '?m=' + nx; a2.dataset.m = nx; a2.textContent = 'Next: ' + MODELS[nx].title; a2.addEventListener('click', go); next.appendChild(a2);
  if (push) history.pushState({ m: cur }, '', '?m=' + cur);
  if (THREE) setView(M.view(state));
  controls(); refresh();
}
function go(e) { e.preventDefault(); show(e.currentTarget.dataset.m, true); window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); }
ORDER.forEach((id) => { const a = document.createElement('a'); a.href = '?m=' + id; a.dataset.m = id; a.textContent = MODELS[id].title; a.addEventListener('click', go); $('picks').appendChild(a); });
window.addEventListener('popstate', () => show(new URLSearchParams(location.search).get('m') || ORDER[0], false));

/* drag to turn: one finger or the mouse, about the screen's own axes */
let drag = null;
view.addEventListener('pointerdown', (e) => { if (!renderer) return; drag = { x: e.clientX, y: e.clientY }; try { view.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ } $('hint').style.opacity = 0; });
view.addEventListener('pointermove', (e) => {
  if (!drag || !renderer) return;
  const dx = (e.clientX - drag.x) * 0.011, dy = (e.clientY - drag.y) * 0.011; drag = { x: e.clientX, y: e.clientY }; userTurned = true;
  Q.premultiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(dy, dx, 0, 'XYZ'))); render();
});
['pointerup', 'pointercancel'].forEach((n) => view.addEventListener(n, () => { drag = null; }));
view.addEventListener('keydown', (e) => { const k = { ArrowLeft: [0, -0.15], ArrowRight: [0, 0.15], ArrowUp: [-0.15, 0], ArrowDown: [0.15, 0] }[e.key]; if (!k || !renderer) return; e.preventDefault(); Q.premultiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(k[0], k[1], 0, 'XYZ'))); render(); });
view.tabIndex = 0;
window.addEventListener('resize', size);

show(new URLSearchParams(location.search).get('m') || ORDER[0], false);
const load = () => import('/shared/three.module.min.js').then((m) => { THREE = m; init3d(); if (renderer) { setView(MODELS[cur].view(state)); size(); } refresh(); window.__ocModelsReady = true; }).catch(() => { $('hint').hidden = true; window.__ocModelsReady = true; });
if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 1200 }); else setTimeout(load, 200);
