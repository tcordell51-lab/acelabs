/* oc/models/chem.js : the geometry and the chemistry behind the OChem 3D models (/oc/models/).
   Pure functions, no DOM and no three.js, so node can test every fact (tests/visuals/oc-models.test.js).
   Lengths are in angstroms, angles in degrees, energies in kJ/mol.
   Sources for the numbers: OpenStax Organic Chemistry, 3.7 Conformations of Other Alkanes (butane:
   gauche 3.8, eclipsed 16, fully eclipsed 19 kJ/mol), 4.7 Conformations of Monosubstituted
   Cyclohexanes (1,3-diaxial strain: methyl 3.8 x 2 = 7.6, tert-butyl 11.4 x 2 = 22.8 kJ/mol),
   5.5 Sequence Rules for Specifying Configuration, 11.2 The SN2 Reaction, 11.8 The E2 Reaction. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OcChem = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  var D = Math.PI / 180;
  var BL = { CC: 1.53, CH: 1.09, CBr: 1.94, CO: 1.43, OH: 0.96, CdC: 1.34, CtC: 1.20, CHsp: 1.06, Car: 1.39 };

  /* ---------- vectors ---------- */
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function mul(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function len(a) { return Math.sqrt(dot(a, a)); }
  function unit(a) { var l = len(a) || 1; return mul(a, 1 / l); }
  function perp(a) { var u = unit(a), t = Math.abs(u[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]; return unit(cross(u, t)); }
  function rot(p, axis, deg) {
    var k = unit(axis), c = Math.cos(deg * D), s = Math.sin(deg * D);
    return add(add(mul(p, c), mul(cross(k, p), s)), mul(k, dot(k, p) * (1 - c)));
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
  function mod360(a) { return ((a % 360) + 360) % 360; }

  /* ---------- tetrahedral helpers ---------- */
  /* A carbon at c with two neighbors a and b: the two directions left for an sp3 center. */
  function tetra2(c, a, b) {
    var ua = unit(sub(a, c)), ub = unit(sub(b, c));
    var bis = unit(mul(add(ua, ub), -1)), n = unit(cross(ua, ub));
    var h = 54.7356 * D;
    return [add(mul(bis, Math.cos(h)), mul(n, Math.sin(h))), sub(mul(bis, Math.cos(h)), mul(n, Math.sin(h)))];
  }
  /* A carbon at c with one neighbor a: three directions, 109.47 degrees from the bond, the first one
     turned by twist from the plane that holds ref. */
  function tetra3(c, a, ref, twist) {
    var axis = unit(sub(c, a));
    var r0 = sub(ref, mul(axis, dot(ref, axis)));
    r0 = len(r0) < 1e-6 ? perp(axis) : unit(r0);
    var out = [];
    for (var k = 0; k < 3; k++) out.push(add(mul(axis, 1 / 3), mul(rot(r0, axis, (twist || 0) + 120 * k), 0.942809)));
    return out;
  }

  /* ---------- R and S ---------- */
  /* Positions of the four groups in priority order 1 to 4. With group 4 pointing away, 1 to 2 to 3
     clockwise is R. The sign of the triple product says which way the turn runs. */
  function chirality(p1, p2, p3, p4) {
    var t = dot(sub(p1, p4), cross(sub(p2, p4), sub(p3, p4)));
    return t < 0 ? 'R' : 'S';
  }
  /* The same call on a drawing. subs: [{ x, y, z, rank }] measured from the stereocenter in screen
     units (y grows downward), z = +1 for a wedge, -1 for a dash, 0 in the page. With three groups
     drawn, the fourth is the implicit hydrogen pointing opposite the other three. */
  function label2D(subs) {
    var pts = subs.map(function (s) { return { r: s.rank, p: unit([s.x, -s.y, s.z || 0]) }; });
    if (pts.length === 3) {
      var sum = [0, 0, 0]; pts.forEach(function (q) { sum = add(sum, q.p); });
      pts.push({ r: 4, p: unit(mul(sum, -1)) });
    }
    pts.sort(function (a, b) { return a.r - b.r; });
    return chirality(pts[0].p, pts[1].p, pts[2].p, pts[3].p);
  }
  /* Which stereo bond, wedge or dash, on substituent k makes the drawing read as `want`. */
  function stereoBond(want, subs, k) {
    var trial = subs.map(function (s, i) { return { x: s.x, y: s.y, rank: s.rank, z: i === k ? 1 : 0 }; });
    return label2D(trial) === want ? 'wedge' : 'dash';
  }
  function flip(l) { return l === 'R' ? 'S' : 'R'; }
  /* Two stereoisomers with the same connectivity, by their lists of R and S labels. */
  function relate(a, b) {
    var same = a.every(function (x, i) { return x === b[i]; }), all = a.every(function (x, i) { return x !== b[i]; });
    if (same) return 'identical';
    return all ? 'enantiomers' : 'diastereomers';
  }

  /* ---------- a small molecule builder ---------- */
  function Mol() { this.atoms = []; this.bonds = []; this.orbitals = []; this.info = {}; }
  Mol.prototype.add = function (el, p, tag) { this.atoms.push({ el: el, x: p[0], y: p[1], z: p[2], tag: tag || '' }); return this.atoms.length - 1; };
  Mol.prototype.pos = function (i) { var a = this.atoms[i]; return [a.x, a.y, a.z]; };
  Mol.prototype.bond = function (i, j, order, kind) { this.bonds.push([i, j, order || 1, kind || '']); };
  Mol.prototype.nbrs = function (i) { var o = []; this.bonds.forEach(function (b) { if (b[0] === i) o.push(b[1]); else if (b[1] === i) o.push(b[0]); }); return o; };
  Mol.prototype.attach = function (i, el, dir, L, tag) { var j = this.add(el, add(this.pos(i), mul(unit(dir), L)), tag); this.bond(i, j); return j; };
  /* Complete an sp3 carbon with hydrogens. */
  Mol.prototype.fillH = function (i, tag) {
    var n = this.nbrs(i), c = this.pos(i), self = this, dirs;
    if (n.length === 1) {
      var a = n[0], others = this.nbrs(a).filter(function (k) { return k !== i; });
      var ref = others.length ? sub(this.pos(others[0]), this.pos(a)) : perp(sub(c, this.pos(a)));
      dirs = tetra3(c, this.pos(a), ref, 60);
    } else if (n.length === 2) dirs = tetra2(c, this.pos(n[0]), this.pos(n[1]));
    else if (n.length === 3) { var s = [0, 0, 0]; n.forEach(function (k) { s = add(s, unit(sub(self.pos(k), c))); }); dirs = [unit(mul(s, -1))]; }
    else dirs = [];
    return dirs.map(function (d) { return self.attach(i, 'H', d, BL.CH, tag || 'h'); });
  };
  Mol.prototype.methyl = function (i, dir, tag) { var j = this.attach(i, 'C', dir, BL.CC, tag || 'me'); this.fillH(j, 'hm'); return j; };
  Mol.prototype.mirror = function () { this.atoms.forEach(function (a) { a.x = -a.x; }); this.orbitals.forEach(function (o) { o.at[0] = -o.at[0]; o.dir[0] = -o.dir[0]; }); return this; };

  /* Two carbons on the z axis, the front one toward the viewer, each with three groups placed by
     their Newman angle (0 = right, 90 = up). A group: { g: 'H' | 'CH3' | 'Br', a, tag, L, tilt, hide }. */
  function twoCarbon(front, back, o) {
    o = o || {};
    var m = new Mol(), cc = o.cc || BL.CC, LEN = { H: BL.CH, CH3: BL.CC, Br: BL.CBr };
    var cf = m.add('C', [0, 0, cc / 2], 'cf'), cb = m.add('C', [0, 0, -cc / 2], 'cb');
    m.bond(cf, cb, o.order || 1, o.ccKind || '');
    var idx = { cf: cf, cb: cb, front: [], back: [] };
    function place(c, list, sign, into) {
      list.forEach(function (s) {
        if (s.hide) { into.push(-1); return; }
        var t = s.tilt == null ? 1 / 3 : s.tilt, r = Math.sqrt(1 - t * t);
        var dir = [Math.cos(s.a * D) * r, Math.sin(s.a * D) * r, sign * t], j;
        if (s.g === 'CH3') { j = m.add('C', add(m.pos(c), mul(dir, s.L || LEN.CH3)), s.tag || 'me'); m.bond(c, j, 1, s.kind || ''); m.fillH(j, 'hm'); }
        else { j = m.add(s.g, add(m.pos(c), mul(dir, s.L || LEN[s.g])), s.tag || (s.g === 'H' ? 'h' : '')); m.bond(c, j, 1, s.kind || ''); }
        into.push(j);
      });
    }
    place(cf, front, 1, idx.front); place(cb, back, -1, idx.back);
    m.info = idx;
    return m;
  }

  /* ---------- 1. chair cyclohexane ---------- */
  var CHAIR = {
    Me: { name: 'methyl', formula: 'CH3', strain: 7.6, molecule: 'methylcyclohexane' },
    tBu: { name: 'tert-butyl', formula: 'C(CH3)3', strain: 22.8, molecule: 'tert-butylcyclohexane' }
  };
  /* The six ring carbons. t = 0 is one chair, t = 1 the ring-flipped chair, 0.5 the flat halfway frame. */
  function chairRing(t) {
    var z0 = 0.25 * (1 - 2 * t), r = Math.sqrt(BL.CC * BL.CC - 4 * z0 * z0), pts = [];
    for (var i = 0; i < 6; i++) pts.push([r * Math.cos(i * 60 * D), r * Math.sin(i * 60 * D), (i % 2 === 0 ? 1 : -1) * z0]);
    return pts;
  }
  /* Is the UP bond on ring carbon i axial? A ring flip turns every axial bond equatorial and back,
     but up stays up and down stays down. */
  function axialUp(i, t) { return (i % 2 === 0) === (t < 0.5); }
  function chairPosition(i, face, t) { return (face === 'up') === axialUp(i, t) ? 'axial' : 'equatorial'; }
  function chairMol(subKey, t) {
    var m = new Mol(), ring = chairRing(t), ids = ring.map(function (p) { return m.add('C', p, 'ring'); });
    for (var i = 0; i < 6; i++) m.bond(ids[i], ids[(i + 1) % 6]);
    var where = chairPosition(0, 'up', t);
    for (i = 0; i < 6; i++) {
      var d = tetra2(ring[i], ring[(i + 5) % 6], ring[(i + 1) % 6]);
      var up = d[0][2] >= d[1][2] ? d[0] : d[1], down = up === d[0] ? d[1] : d[0];
      var upAx = axialUp(i, t);
      if (i === 0) {
        var c = m.attach(ids[0], 'C', up, BL.CC, 'sub');
        if (subKey === 'tBu') tetra3(m.pos(c), ring[0], sub(ring[1], ring[0]), 30).forEach(function (dir) { m.methyl(c, dir, 'me'); });
        else m.fillH(c, 'hm');
        m.info.sub = c;
      } else m.attach(ids[i], 'H', up, BL.CH, (upAx ? 'ax' : 'eq') + ((i === 2 || i === 4) && where === 'axial' ? ' clash' : ''));
      m.attach(ids[i], 'H', down, BL.CH, upAx ? 'eq' : 'ax');
    }
    m.info.ring = ids; m.info.position = where;
    return m;
  }
  /* Percent of molecules in the lower-energy chair at temperature T, from the energy gap. */
  function eqPercent(kJ, T) { var K = Math.exp(kJ * 1000 / (8.314 * (T || 298))); return 100 * K / (1 + K); }

  /* ---------- 2. Newman projections: butane down the C2 to C3 bond ---------- */
  /* A cosine series through the four textbook values (0: 19, 60: 3.8, 120: 16, 180: 0 kJ/mol). */
  function butaneEnergy(phi) {
    var p = phi * D;
    return 9.7667 + 2.2667 * Math.cos(p) - 0.2667 * Math.cos(2 * p) + 7.2333 * Math.cos(3 * p);
  }
  var CONF = [
    { at: 0, key: 'syn', name: 'Fully eclipsed', kJ: 19, note: 'The two methyls line up, one behind the other. Highest energy: torsional strain plus steric strain.' },
    { at: 60, key: 'gauche', name: 'Gauche', kJ: 3.8, note: 'Staggered, with the methyls 60 degrees apart. They crowd each other a little: steric strain.' },
    { at: 120, key: 'eclipsed', name: 'Eclipsed', kJ: 16, note: 'Each methyl lines up with a hydrogen. Torsional strain, but less than methyl over methyl.' },
    { at: 180, key: 'anti', name: 'Anti', kJ: 0, note: 'Staggered, with the methyls 180 degrees apart. The lowest energy conformation of butane.' }
  ];
  function conformer(phi) {
    var a = mod360(phi); if (a > 180) a = 360 - a;
    for (var i = 0; i < CONF.length; i++) if (Math.abs(a - CONF[i].at) <= 10) return CONF[i];
    return { at: a, key: 'between', name: 'In between', kJ: Math.round(butaneEnergy(a) * 10) / 10, note: 'Not a named stop. Keep turning to the next staggered or eclipsed conformation.' };
  }
  function newmanGroups(phi) {
    return {
      front: [{ g: 'CH3', a: 90, tag: 'me front' }, { g: 'H', a: 210 }, { g: 'H', a: 330 }],
      back: [{ g: 'CH3', a: 90 + phi, tag: 'me back' }, { g: 'H', a: 210 + phi }, { g: 'H', a: 330 + phi }]
    };
  }
  function butaneMol(phi) { var g = newmanGroups(phi); return twoCarbon(g.front, g.back); }

  /* ---------- 3. Stereoisomers: 2,3-dibromobutane ---------- */
  /* C2 is the front carbon, C3 the back one. The methyls sit `dih` degrees apart (180 = anti).
     Br and H take the two slots left on each carbon; the arrangement that gives the wanted label is
     found by building it and reading the label back from the coordinates. */
  function dibromobutane(c2, c3, dih) {
    dih = dih == null ? 180 : dih;
    function build(swapF, swapB) {
      var f = [{ g: 'CH3', a: 90, tag: 'me' }, { g: swapF ? 'H' : 'Br', a: 210 }, { g: swapF ? 'Br' : 'H', a: 330 }];
      var b = [{ g: 'CH3', a: 90 + dih, tag: 'me' }, { g: swapB ? 'H' : 'Br', a: 210 + dih }, { g: swapB ? 'Br' : 'H', a: 330 + dih }];
      var m = twoCarbon(f, b);
      m.info.labels = dibromoLabels(m);
      return m;
    }
    for (var k = 0; k < 4; k++) { var m = build(k & 1, k & 2); if (m.info.labels[0] === c2 && m.info.labels[1] === c3) return m; }
    return null;
  }
  /* Priorities on C2: Br, then C3 (it carries Br), then CH3, then H. The same on C3 with C2. */
  function dibromoLabels(m) {
    var I = m.info;
    function one(c, other, list) {
      var br, me, h; list.forEach(function (j) { var el = m.atoms[j].el; if (el === 'Br') br = j; else if (el === 'C') me = j; else h = j; });
      return chirality(m.pos(br), m.pos(other), m.pos(me), m.pos(h));
    }
    return [one(I.cf, I.cb, I.front), one(I.cb, I.cf, I.back)];
  }
  /* (2R,3S) and (2S,3R) are one compound: the two ends carry the same four groups. */
  function isMeso(labels) { return labels[0] !== labels[1]; }

  /* ---------- 4. SN2: hydroxide on (S)-2-bromobutane ---------- */
  /* p runs 0 (reactants) to 1 (products). The nucleophile comes in along -x, 180 degrees from the
     leaving group on +x, and the three other groups flip through flat like an umbrella. */
  function sn2Mol(p, mirrored) {
    var s = smooth(p), m = new Mol(), c = m.add('C', [0, 0, 0], 'center');
    var tilt = lerp(-1 / 3, 1 / 3, s), r = Math.sqrt(1 - tilt * tilt);
    var order = mirrored ? ['H', 'Et', 'Me'] : ['H', 'Me', 'Et'], ids = {};
    order.forEach(function (g, k) {
      var a = (90 + 120 * k) * D, dir = [tilt, Math.sin(a) * r, Math.cos(a) * r];
      if (g === 'H') ids.H = m.attach(c, 'H', dir, BL.CH, 'h');
      else if (g === 'Me') { ids.Me = m.attach(c, 'C', dir, BL.CC, 'me'); }
      else { ids.Et = m.attach(c, 'C', dir, BL.CC, 'et'); }
    });
    var et2 = m.attach(ids.Et, 'C', tetra3(m.pos(ids.Et), [0, 0, 0], [1, 0, 0], 0)[0], BL.CC, 'et2');
    m.fillH(ids.Me, 'hm'); m.fillH(ids.Et, 'hm'); m.fillH(et2, 'hm');
    var o = m.add('O', [-lerp(3.3, BL.CO, s), 0, 0], 'nu'), br = m.add('Br', [lerp(BL.CBr, 3.7, s), 0, 0], 'lg');
    var oh = m.add('H', add(m.pos(o), mul(unit([-0.45, 0.9, 0]), BL.OH)), 'h'); m.bond(o, oh);
    if (s > 0.3) m.bond(c, o, 1, s < 0.7 ? 'partial' : '');
    if (s < 0.7) m.bond(c, br, 1, s > 0.3 ? 'partial' : '');
    m.info = { center: c, o: o, br: br, ids: ids, stage: s < 0.3 ? 'reactant' : s < 0.7 ? 'ts' : 'product',
      reactant: chirality([BL.CBr, 0, 0], m.pos(ids.Et), m.pos(ids.Me), m.pos(ids.H)),
      product: chirality([-BL.CO, 0, 0], m.pos(ids.Et), m.pos(ids.Me), m.pos(ids.H)) };
    return m;
  }
  /* The labels at the two ends of the reaction (at p = 0 and p = 1). */
  function sn2Labels() { return { reactant: sn2Mol(0).info.reactant, product: sn2Mol(1).info.product }; }

  /* ---------- 5. E2: 2-bromobutane, looking down C2 to C3 ---------- */
  /* Front carbon C2: Br up, then CH3 and H. Back carbon C3: Ha, Hb and CH3, turned by theta.
     Angles here are measured from the C-Br bond: Ha sits at theta, Hb at theta + 120, CH3 at theta + 240. */
  function e2State(theta, tol) {
    var t = mod360(theta); tol = tol == null ? 10 : tol;
    function near(a, b) { var d = Math.abs(mod360(a - b)); return Math.min(d, 360 - d) <= tol; }
    var anti = near(t, 180) ? 'Ha' : near(t + 120, 180) ? 'Hb' : null;
    var methylDihedral = mod360(t + 240 - 120); if (methylDihedral > 180) methylDihedral = 360 - methylDihedral;
    /* Groups that are gauche in the reacting conformer end up on the same side of the new double
       bond (cis); groups that are anti end up across from each other (trans). */
    var product = anti === 'Ha' ? 'cis' : anti === 'Hb' ? 'trans' : null;
    return { anti: anti, product: product, methylDihedral: methylDihedral,
      eclipsedBr: near(t, 0) ? 'Ha' : near(t + 120, 0) ? 'Hb' : near(t + 240, 0) ? 'CH3' : null };
  }
  function e2Groups(theta) {
    return {
      front: [{ g: 'Br', rel: 0 }, { g: 'CH3', rel: 120 }, { g: 'H', rel: 240 }],
      back: [{ g: 'H', rel: mod360(theta), name: 'Ha' }, { g: 'H', rel: mod360(theta + 120), name: 'Hb' }, { g: 'CH3', rel: mod360(theta + 240) }]
    };
  }
  /* p = 0 is the alkyl halide; as p goes to 1 the base takes the anti hydrogen, the C-Br bond
     breaks and the two carbons flatten into the alkene. p only moves when a hydrogen is anti. */
  function e2Mol(theta, p) {
    var st = e2State(theta, 10), s = st.anti ? smooth(p || 0) : 0, g = e2Groups(st.anti && s > 0 ? (st.anti === 'Ha' ? 180 : 60) : theta);
    var tilt = lerp(1 / 3, 0.5, s);
    function flat(rel, leaving) { var d = mod360(rel - leaving); return rel + (d < 180 ? -30 : 30) * s; }
    var front = g.front.map(function (x) {
      if (x.g === 'Br') return { g: 'Br', a: 90, L: BL.CBr + 1.9 * s, tag: 'lg', kind: s > 0.15 ? 'partial' : '', hide: false, gone: s > 0.85 };
      return { g: x.g, a: 90 + flat(x.rel, 0), tilt: tilt, tag: x.g === 'CH3' ? 'me front' : 'h' };
    });
    var back = g.back.map(function (x) {
      var leaving = st.anti && x.name === st.anti;
      if (leaving) return { g: 'H', a: 90 + x.rel, L: BL.CH + 0.9 * s, tag: 'hl ' + x.name, kind: s > 0.15 ? 'partial' : '', gone: s > 0.85 };
      return { g: x.g, a: 90 + (st.anti ? flat(x.rel, 180) : x.rel), tilt: tilt, tag: x.g === 'CH3' ? 'me back' : 'h ' + (x.name || '') };
    });
    var m = twoCarbon(front, back, { cc: lerp(BL.CC, BL.CdC, s), order: s > 0.5 ? 2 : 1 });
    var I = m.info;
    m.bonds = m.bonds.filter(function (b) {
      var lg = I.front[0], hl = st.anti ? I.back[st.anti === 'Ha' ? 0 : 1] : -1;
      return !(s > 0.85 && (b[1] === lg || b[1] === hl));
    });
    if (st.anti) {
      var hl = I.back[st.anti === 'Ha' ? 0 : 1], hp = m.pos(hl), dir = unit(sub(hp, m.pos(I.cb)));
      var o = m.add('O', add(hp, mul(dir, lerp(2.3, BL.OH, s))), 'base');
      var oh = m.add('H', add(m.pos(o), mul(unit(add(dir, [0.9, 0.4, 0])), BL.OH)), 'h'); m.bond(o, oh);
      if (s > 0.15) m.bond(o, hl, 1, s < 0.85 ? 'partial' : '');
      I.base = o; I.leavingH = hl;
    }
    I.state = st; I.s = s;
    /* which side of the new double bond each methyl ends on, read from the built geometry */
    var mf = m.pos(I.front[1]), mb = m.pos(I.back[2]);
    I.methylsSameSide = mf[0] * mb[0] + mf[1] * mb[1] > 0;
    return m;
  }

  /* ---------- 6. Hybridization ---------- */
  var HYBRID = {
    sp3: { groups: 4, angle: 109.5, shape: 'tetrahedral', sChar: 25, pLeft: 0, molecule: 'methane', formula: 'CH4', sigma: 4, pi: 0 },
    sp2: { groups: 3, angle: 120, shape: 'trigonal planar', sChar: 33, pLeft: 1, molecule: 'ethene', formula: 'H2C=CH2', sigma: 3, pi: 1 },
    sp: { groups: 2, angle: 180, shape: 'linear', sChar: 50, pLeft: 2, molecule: 'ethyne', formula: 'HC≡CH', sigma: 2, pi: 2 }
  };
  /* Count the electron groups on the atom: sigma bonds plus lone pairs. 4 is sp3, 3 is sp2, 2 is sp. */
  function hybridOf(groups) { return groups === 4 ? 'sp3' : groups === 3 ? 'sp2' : groups === 2 ? 'sp' : null; }
  function hybridMol(kind) {
    var m = new Mol(), c1, c2;
    function lobe(i, dir, k, phase) { m.orbitals.push({ at: m.pos(i), dir: unit(dir), kind: k, phase: phase || 1 }); }
    if (kind === 'sp3') {
      c1 = m.add('C', [0, 0, 0], 'center');
      [[0, 1, 0]].concat(tetra3([0, 0, 0], [0, 1, 0], [0, 0, 1], 0).map(function (d) { return mul(d, 1); })).forEach(function (d, k) {
        var dir = k === 0 ? d : mul(d, 1);
        m.attach(c1, 'H', dir, BL.CH, 'h'); lobe(c1, dir, 'hyb');
      });
    } else if (kind === 'sp2') {
      c1 = m.add('C', [-BL.CdC / 2, 0, 0], 'center'); c2 = m.add('C', [BL.CdC / 2, 0, 0], 'center'); m.bond(c1, c2, 2);
      [[c1, -1], [c2, 1]].forEach(function (q) {
        [1, -1].forEach(function (s) { var d = [q[1] * 0.5, s * 0.866025, 0]; m.attach(q[0], 'H', d, 1.087, 'h'); lobe(q[0], d, 'hyb'); });
        lobe(q[0], [-q[1], 0, 0], 'hyb'); lobe(q[0], [0, 0, 1], 'p', 1); lobe(q[0], [0, 0, -1], 'p', -1);
      });
    } else {
      c1 = m.add('C', [-BL.CtC / 2, 0, 0], 'center'); c2 = m.add('C', [BL.CtC / 2, 0, 0], 'center'); m.bond(c1, c2, 3);
      [[c1, -1], [c2, 1]].forEach(function (q) {
        m.attach(q[0], 'H', [q[1], 0, 0], BL.CHsp, 'h'); lobe(q[0], [q[1], 0, 0], 'hyb'); lobe(q[0], [-q[1], 0, 0], 'hyb');
        lobe(q[0], [0, 0, 1], 'p', 1); lobe(q[0], [0, 0, -1], 'p', -1); lobe(q[0], [0, 1, 0], 'p2', 1); lobe(q[0], [0, -1, 0], 'p2', -1);
      });
    }
    m.info = { kind: kind, facts: HYBRID[kind] };
    return m;
  }
  /* The angle between the first two bonds on the first heavy atom, measured from the coordinates. */
  function bondAngle(m, center) {
    var n = m.nbrs(center), c = m.pos(center);
    return Math.acos(dot(unit(sub(m.pos(n[0]), c)), unit(sub(m.pos(n[1]), c)))) / D;
  }

  /* ---------- 7. Benzene and the Huckel count ---------- */
  function benzeneMol() {
    var m = new Mol(), cs = [];
    for (var i = 0; i < 6; i++) { var a = i * 60 * D; cs.push(m.add('C', [BL.Car * Math.cos(a), BL.Car * Math.sin(a), 0], 'ring')); }
    for (i = 0; i < 6; i++) {
      m.bond(cs[i], cs[(i + 1) % 6], 1, 'arom');
      var p = m.pos(cs[i]); m.attach(cs[i], 'H', p, 1.087, 'h');
      m.orbitals.push({ at: p, dir: [0, 0, 1], kind: 'p', phase: 1 }, { at: p, dir: [0, 0, -1], kind: 'p', phase: -1 });
    }
    m.info = { ring: cs, radius: BL.Car };
    return m;
  }
  /* Aromatic needs all four: cyclic, planar, every ring atom with a p orbital, and 4n + 2 pi electrons.
     With the first three met, 4n pi electrons is antiaromatic. */
  function huckel(piElectrons, o) {
    o = o || {};
    var ok = o.cyclic !== false && o.planar !== false && o.conjugated !== false;
    if (!ok) return 'nonaromatic';
    if (piElectrons >= 2 && (piElectrons - 2) % 4 === 0) return 'aromatic';
    if (piElectrons >= 4 && piElectrons % 4 === 0) return 'antiaromatic';
    return 'nonaromatic';
  }

  return {
    BL: BL, vec: { add: add, sub: sub, mul: mul, dot: dot, cross: cross, len: len, unit: unit, rot: rot }, smooth: smooth, mod360: mod360,
    tetra2: tetra2, tetra3: tetra3, chirality: chirality, label2D: label2D, stereoBond: stereoBond, flip: flip, relate: relate, Mol: Mol, twoCarbon: twoCarbon,
    CHAIR: CHAIR, chairRing: chairRing, axialUp: axialUp, chairPosition: chairPosition, chairMol: chairMol, eqPercent: eqPercent,
    butaneEnergy: butaneEnergy, CONF: CONF, conformer: conformer, newmanGroups: newmanGroups, butaneMol: butaneMol,
    dibromobutane: dibromobutane, dibromoLabels: dibromoLabels, isMeso: isMeso,
    sn2Mol: sn2Mol, sn2Labels: sn2Labels, e2State: e2State, e2Groups: e2Groups, e2Mol: e2Mol,
    HYBRID: HYBRID, hybridOf: hybridOf, hybridMol: hybridMol, bondAngle: bondAngle, benzeneMol: benzeneMol, huckel: huckel
  };
});
