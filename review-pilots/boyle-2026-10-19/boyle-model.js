/* Boyle's law review pilot - pure model, storyboard and deterministic particle sim.
   No DOM access here, so the same file runs in the page and under node:test.
   Bounded model: ideal gas, sealed sample, T = 300 K, n fixed, PV = 2.00 L*atm. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BoyleModel = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---- Gas model ------------------------------------------------------ */
  const R = 0.082057;            // L*atm/(mol*K)
  const T = 300;                 // K, held fixed by the heat bath
  const PV0 = 2;                 // L*atm (1.00 atm x 2.00 L)
  const N_MOL = PV0 / (R * T);   // ~0.08124 mol
  const V_MIN = 0.5, V_MAX = 4, V_STEP = 0.05, V_INIT = 2;
  const PRESETS = [0.5, 1, 2, 4];

  function pressureAt(V) { return PV0 / V; }

  // Every slider stop, built from integers so 0.05 steps carry no drift.
  function sliderValues() {
    const out = [];
    for (let k = 50; k <= 400; k += 5) out.push(k / 100);
    return out;
  }

  function snapVolume(V) { return Math.round(V * 20) / 20; }

  /* Validate any user-supplied volume. Never clamps silently: out-of-range,
     zero, negative and non-numeric input is rejected with a reason. In-range
     values are snapped to the 0.05 L grid and flagged if that changed them. */
  function validateVolume(raw) {
    if (raw === null || raw === undefined) return { ok: false, reason: 'empty' };
    const s = typeof raw === 'string' ? raw.trim() : raw;
    if (s === '') return { ok: false, reason: 'empty' };
    const V = typeof s === 'number' ? s : Number(s);
    if (typeof V !== 'number' || !Number.isFinite(V)) return { ok: false, reason: 'not-a-number' };
    if (V <= 0) return { ok: false, reason: 'non-positive' };
    if (V < V_MIN - 1e-9 || V > V_MAX + 1e-9) return { ok: false, reason: 'out-of-range' };
    const snapped = Math.min(V_MAX, Math.max(V_MIN, snapVolume(V)));
    return { ok: true, value: snapped, snapped: Math.abs(snapped - V) > 1e-9 };
  }

  const VOLUME_ERRORS = {
    'empty': 'Enter a volume between 0.50 and 4.00 L.',
    'not-a-number': 'That is not a number. Enter a volume between 0.50 and 4.00 L.',
    'non-positive': 'A volume must be greater than zero. Enter 0.50 to 4.00 L.',
    'out-of-range': 'This model covers 0.50 to 4.00 L only.'
  };

  function fmt(x, d) { return x.toFixed(d === undefined ? 2 : d); }

  /* ---- Learning checks ----------------------------------------------- */
  const PREDICTION = {
    question: 'At 1.00 L, what is the pressure?',
    options: ['0.50', '1.00', '2.00'],
    answer: '2.00',
    feedback: {
      '0.50': 'Pressure changes inversely: halving volume doubles pressure.',
      '1.00': 'The gas amount is unchanged, but wall interactions change with confinement.',
      '2.00': '2.00×1.00 preserves the initial PV product.'
    }
  };

  function gradePrediction(choice) {
    if (!PREDICTION.options.includes(choice)) return { status: 'empty', correct: false, message: 'Choose one of the three pressures first.' };
    return { status: choice === PREDICTION.answer ? 'correct' : 'incorrect', correct: choice === PREDICTION.answer, message: PREDICTION.feedback[choice] };
  }

  const TRANSFER = {
    question: 'The same sealed sample reaches 0.80 L at 300 K. What is its absolute pressure?',
    answer: 2.5, tolerance: 0.02,
    working: 'P₂ = (P₁V₁)/V₂ = (1.00 atm × 2.00 L)/0.80 L = 2.50 atm'
  };

  function gradeTransfer(raw) {
    const s = raw === null || raw === undefined ? '' : String(raw).trim();
    if (s === '') return { status: 'empty', correct: false, message: 'Enter a pressure in atm, then check.' };
    const x = Number(s);
    if (!Number.isFinite(x)) return { status: 'empty', correct: false, message: 'Enter the pressure as a number in atm, for example 1.75.' };
    if (Math.abs(x - TRANSFER.answer) <= TRANSFER.tolerance + 1e-12) {
      return { status: 'correct', correct: true, message: 'Correct: 2.50 atm. With n and T fixed, P₁V₁ = P₂V₂.', working: TRANSFER.working };
    }
    if (Math.abs(x - 0.4) <= TRANSFER.tolerance + 1e-12) {
      return { status: 'direct', correct: false, message: '0.40 atm scales pressure directly with volume (0.80/2.00). Boyle’s law is inverse: a smaller volume gives a larger pressure.', working: TRANSFER.working };
    }
    return { status: 'incorrect', correct: false, message: 'Not yet. This only works because the amount of gas and the temperature stay fixed; with both fixed, P₁V₁ = P₂V₂.', working: TRANSFER.working };
  }

  const LEAK = {
    question: 'If the gas leaks, can we still apply this fixed-amount curve?',
    options: ['yes', 'no'], answer: 'no',
    feedback: {
      yes: 'Not this curve. A leak lowers n, so the PV product drops below 2.00 L·atm and the sample moves to a different curve.',
      no: 'Right. PV = 2.00 L·atm holds only for this fixed amount at 300 K; a leak changes n and therefore the product.'
    }
  };

  function gradeLeak(choice) {
    if (!LEAK.options.includes(choice)) return { status: 'empty', correct: false, message: 'Choose yes or no first.' };
    return { status: choice === LEAK.answer ? 'correct' : 'incorrect', correct: choice === LEAK.answer, message: LEAK.feedback[choice] };
  }

  /* ---- Storyboard (55 s, exact narration) ---------------------------- */
  const SEGMENTS = [
    { start: 0, end: 9,
      narration: 'This sealed gas occupies two liters at one atmosphere. Its temperature stays at three hundred kelvin. What happens if we halve its volume?',
      visual: 'Piston cross-section at 2.00 L in a 300 K heat bath. Badges show fixed temperature and fixed amount. A prediction card asks what the pressure will be at half the volume; the scene holds.' },
    { start: 9, end: 18,
      narration: 'The piston moves inward. The same amount of gas now occupies one liter, and its pressure rises to two atmospheres.',
      visual: 'The piston slides down until the gas region is half as tall: volume reads 2.00 L falling to 1.00 L while the linked absolute-pressure gauge rises from 1.00 atm to 2.00 atm. The 24 dots stay inside and keep their size.' },
    { start: 18, end: 28,
      narration: 'At constant temperature, the particles do not need to move faster. In the smaller space, their collisions with the walls produce greater pressure.',
      visual: 'Short marks flash where dots meet the walls (illustrative, not measured). A note confirms 24 dots and an unchanged speed distribution; the speed histogram does not change.' },
    { start: 28, end: 38,
      narration: 'Boyle’s law keeps pressure times volume constant. One atmosphere times two liters equals two atmospheres times one liter.',
      visual: 'Two products appear, 1.00 atm × 2.00 L and 2.00 atm × 1.00 L, then merge into one shared badge: PV = 2.00 L·atm.' },
    { start: 38, end: 47,
      narration: 'On this graph, pressure rises as volume falls. The curve is not a straight line. Double the volume, and the pressure halves.',
      visual: 'A pressure-versus-volume graph traces the curve P = 2.00/V from 0.50 L to 4.00 L. Points mark 1 L (2.00 atm), 2 L (1.00 atm) and 4 L (0.50 atm), with arrows showing each doubling of volume halving the pressure.' },
    { start: 47, end: 55,
      narration: 'Try the piston yourself. Keep temperature and amount fixed, and predict the pressure before revealing it.',
      visual: 'A preview of the interactive controls: volume slider, preset buttons and a hide/reveal pressure switch, with pressure hidden.' }
  ];
  const DURATION = 55;
  const BOUNDARIES = SEGMENTS.map((s) => s.start).concat([DURATION]);

  /* Phrase-level cues: each narration sentence (or half of a long one) becomes one cue, timed in
     proportion to its length within its storyboard segment. There is no audio
     track, so timing comes from the storyboard, not measured alignment. */
  function buildCues() {
    const cues = [];
    SEGMENTS.forEach((seg, si) => {
      const parts = [];
      seg.narration.match(/[^.?!]+[.?!]+/g).map((p) => p.trim()).forEach((p) => {
        // A sentence too long for two caption lines splits at its most central comma.
        if (p.length <= 84) return parts.push(p);
        const commas = [...p.matchAll(/, /g)].map((m) => m.index);
        const at = commas.sort((a, b) => Math.abs(a - p.length / 2) - Math.abs(b - p.length / 2))[0];
        parts.push(p.slice(0, at + 1), p.slice(at + 2));
      });
      const total = parts.reduce((a, p) => a + p.length, 0);
      let t = seg.start;
      parts.forEach((p, i) => {
        const end = i === parts.length - 1 ? seg.end : +(t + (seg.end - seg.start) * p.length / total).toFixed(2);
        cues.push({ start: +t.toFixed(2), end, text: p, segment: si });
        t = end;
      });
    });
    return cues;
  }
  const CUES = buildCues();

  function vttTime(s) {
    const ms = Math.round(s * 1000);
    const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60, r = ms % 1000;
    return [h, m, sec].map((x) => String(x).padStart(2, '0')).join(':') + '.' + String(r).padStart(3, '0');
  }
  function toVTT() {
    return 'WEBVTT\n\n' + CUES.map((c, i) => (i + 1) + '\n' + vttTime(c.start) + ' --> ' + vttTime(c.end) + '\n' + c.text + '\n').join('\n');
  }

  function segmentAt(t) {
    for (let i = SEGMENTS.length - 1; i >= 0; i--) if (t >= SEGMENTS[i].start) return i;
    return 0;
  }
  function cueAt(t) {
    const tt = Math.min(Math.max(t, 0), DURATION - 1e-6);
    return CUES.find((c) => tt >= c.start && tt < c.end) || null;
  }

  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const ease = (x) => { x = clamp01(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const ramp = (t, a, b) => clamp01((t - a) / (b - a));

  // Storyboard volume: hold 2 L, ease to 1 L between 10 s and 15 s, then hold.
  function storyVolume(t) { return 2 - ease(ramp(t, 10, 15)); }

  /* Everything the scene needs for playback time t. Pure, so any frame can be
     rendered by seeking, in any order, with identical output. */
  function stateAt(t) {
    const tt = Math.min(Math.max(t, 0), DURATION);
    const seg = segmentAt(tt);
    return {
      t: tt, segment: seg, V: storyVolume(tt), showPressure: true,
      card: ['predict', 'compress', 'speeds', 'products', 'graph', 'try'][seg],
      contacts: tt >= 18 && tt < 28,
      productA: ramp(tt, 29, 29.6), productB: ramp(tt, 31, 31.6), merge: ease(ramp(tt, 33, 35)),
      graphTrace: ease(ramp(tt, 38.5, 42)),
      points: [ramp(tt, 42, 42.4), ramp(tt, 42.6, 43), ramp(tt, 43.2, 43.6)],
      halving: ramp(tt, 44, 44.6),
      cue: cueAt(tt)
    };
  }

  /* ---- Scene geometry (SVG viewBox 1000 x 700) ------------------------ */
  const GEOM = {
    innerLeft: 200, innerRight: 540, bottom: 632, maxGasHeight: 520,
    particleRadius: 9, particleCount: 24
  };
  function gasTopY(V) { return GEOM.bottom - (V / V_MAX) * GEOM.maxGasHeight; }

  /* ---- Deterministic particle sim ------------------------------------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const SEED = 20261019;
  const SIGMA = 62; // viewBox units per second, per velocity component (schematic)

  function initialParticles(seed) {
    const rnd = mulberry32(seed === undefined ? SEED : seed);
    const r = GEOM.particleRadius, top = gasTopY(V_INIT);
    const gauss = () => { const u = 1 - rnd(), v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const out = [];
    for (let i = 0; i < GEOM.particleCount; i++) {
      out.push({
        id: 'particle-' + String(i).padStart(2, '0'),
        x: GEOM.innerLeft + r + rnd() * (GEOM.innerRight - GEOM.innerLeft - 2 * r),
        y: top + r + rnd() * (GEOM.bottom - top - 2 * r),
        vx: gauss() * SIGMA, vy: gauss() * SIGMA, r
      });
    }
    return out;
  }

  /* Ideal, non-interacting dots bouncing elastically off fixed walls and the
     piston. Reflections only flip a velocity sign, so every dot keeps its
     speed: the speed distribution is identical at every volume (isothermal,
     quasi-static model; the piston does no work on the dots here). */
  function createSim(seed) {
    const DT = 1 / 120;
    let parts, t, contacts;
    function reset() { parts = initialParticles(seed); t = 0; contacts = []; }
    function step(topY) {
      const r = GEOM.particleRadius, L = GEOM.innerLeft + r, Rr = GEOM.innerRight - r, B = GEOM.bottom - r, Tp = topY + r;
      t += DT;
      for (const p of parts) {
        p.x += p.vx * DT; p.y += p.vy * DT;
        if (p.x < L) { p.x = 2 * L - p.x; p.vx = Math.abs(p.vx); contacts.push({ t, x: GEOM.innerLeft, y: p.y, wall: 'left' }); }
        if (p.x > Rr) { p.x = 2 * Rr - p.x; p.vx = -Math.abs(p.vx); contacts.push({ t, x: GEOM.innerRight, y: p.y, wall: 'right' }); }
        if (p.y > B) { p.y = 2 * B - p.y; p.vy = -Math.abs(p.vy); contacts.push({ t, x: p.x, y: GEOM.bottom, wall: 'bottom' }); }
        if (p.y < Tp) {
          if (p.vy < 0) contacts.push({ t, x: p.x, y: topY, wall: 'piston' });
          p.y = Math.min(B, Math.max(Tp, 2 * Tp - p.y)); p.vy = Math.abs(p.vy);
        }
      }
      if (contacts.length > 400) contacts = contacts.filter((c) => c.t > t - 1);
    }
    reset();
    return {
      DT,
      get t() { return t; },
      particles: () => parts,
      recentContacts: (window) => contacts.filter((c) => c.t > t - (window || 0.25)),
      // Seek to absolute time `target`, with the piston top given per time.
      seek(target, topYAt) {
        if (target < t - 1e-9) reset();
        while (t + DT <= target + 1e-9) step(topYAt(t + DT));
      },
      // Advance by real elapsed seconds at a fixed piston top (explore mode).
      advance(dt, topY) {
        const goal = t + Math.min(dt, 0.1);
        while (t + DT <= goal + 1e-9) step(topY);
      },
      reset
    };
  }

  function speeds(parts) { return parts.map((p) => Math.hypot(p.vx, p.vy)); }
  function speedHistogram(parts, bins, max) {
    const h = new Array(bins).fill(0);
    speeds(parts).forEach((s) => { h[Math.min(bins - 1, Math.floor(s / max * bins))]++; });
    return h;
  }

  /* ---- Design tokens and contrast check ------------------------------- */
  const COLORS = { canvas: '#F7F5EF', text: '#202A33', teal: '#176B70', rust: '#A44C36', surface: '#E5E8E7', white: '#FFFFFF' };
  function luminance(hex) {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contrast(a, b) {
    const la = luminance(a), lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  return {
    R, T, PV0, N_MOL, V_MIN, V_MAX, V_STEP, V_INIT, PRESETS,
    pressureAt, sliderValues, snapVolume, validateVolume, VOLUME_ERRORS, fmt,
    PREDICTION, gradePrediction, TRANSFER, gradeTransfer, LEAK, gradeLeak,
    SEGMENTS, DURATION, BOUNDARIES, CUES, toVTT, segmentAt, cueAt, stateAt, storyVolume,
    GEOM, gasTopY, SEED, mulberry32, initialParticles, createSim, speeds, speedHistogram,
    COLORS, contrast
  };
});
