/* Boyle's law review pilot - page controller.
   Two independent states: `playback` (animatic time) and `state` (the
   learner's piston and answers). The scene shows one or the other via `mode`. */
(function () {
  'use strict';
  const M = window.BoyleModel;
  const $ = (id) => document.getElementById(id);
  const SVGNS = 'http://www.w3.org/2000/svg';
  const RENDER = new URLSearchParams(location.search).has('render');
  if (RENDER) document.body.classList.add('render');

  const reducedMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = reducedMQ.matches;

  const initialState = () => ({ volumeL: M.V_INIT, revealPressure: false, running: false, graphMode: 'P-vs-V', prediction: null });
  let state = initialState();
  let checks = { transfer: null, leak: null };
  const playback = { t: 0 };
  let mode = 'animatic';
  let showContacts = false;
  let displayV = M.V_INIT;          // eased piston position in explore mode
  const storySim = M.createSim();   // deterministic, seekable (animatic + export)
  const liveSim = M.createSim();    // real-time (explore)

  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(SVGNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const fmt = M.fmt;

  /* ---- One-time scene construction ----------------------------------- */
  const particleEls = M.initialParticles().map((p) => el('circle', { id: p.id, r: p.r, cx: p.x, cy: p.y, class: 'particle' }, $('particles')));

  (function buildScale() {
    const g = $('volume-scale');
    [1, 2, 3, 4].forEach((V) => {
      const y = M.gasTopY(V);
      el('line', { x1: 146, x2: 160, y1: y, y2: y }, g);
      el('text', { x: 140, y: y + 10, 'text-anchor': 'end', class: 'lbl' }, g).textContent = V + ' L';
    });
  })();

  const GAUGE = { cx: 800, cy: 215, r: 115 };
  const gaugeAngle = (P) => (150 + 60 * Math.min(4.2, Math.max(0, P))) * Math.PI / 180;
  (function buildGauge() {
    const g = $('gauge-ticks');
    for (let k = 0; k <= 8; k++) {
      const P = k / 2, a = gaugeAngle(P), major = k % 2 === 0;
      const r1 = GAUGE.r - (major ? 24 : 14), r2 = GAUGE.r - 4;
      el('line', { x1: GAUGE.cx + r1 * Math.cos(a), y1: GAUGE.cy + r1 * Math.sin(a), x2: GAUGE.cx + r2 * Math.cos(a), y2: GAUGE.cy + r2 * Math.sin(a), class: major ? 'tick' : 'tick minor' }, g);
      if (major) {
        const rl = GAUGE.r + 30;
        el('text', { x: GAUGE.cx + rl * Math.cos(a), y: GAUGE.cy + rl * Math.sin(a) + 12, 'text-anchor': 'middle', class: 'tick-lbl num' }, g).textContent = String(P);
      }
    }
  })();

  (function buildHistogram() {
    const parts = M.initialParticles();
    const max = Math.max.apply(null, M.speeds(parts)) * 1.0001;
    const hist = M.speedHistogram(parts, 6, max);
    const top = Math.max.apply(null, hist), g = $('speed-bars');
    hist.forEach((c, i) => {
      const h = c / top * 112;
      el('rect', { x: 680 + i * 48, y: 636 - h, width: 40, height: h, class: 'bar', 'data-count': c }, g);
    });
    $('speed-hist').setAttribute('data-hist', hist.join(','));
  })();

  /* ---- Graph ------------------------------------------------------------ */
  const G = { x0: 96, x1: 612, y0: 352, y1: 22, pMax: 4.5 };
  function gx(x, xMax) { return G.x0 + (x / xMax) * (G.x1 - G.x0); }
  function gy(P) { return G.y0 - (P / G.pMax) * (G.y0 - G.y1); }
  let builtGraphMode = null;
  function buildGraph(graphMode) {
    if (builtGraphMode === graphMode) return;
    builtGraphMode = graphMode;
    const inv = graphMode === 'P-vs-invV', xMax = inv ? 2 : 4;
    const grid = $('graph-grid'), axes = $('graph-axes'), pts = $('graph-points');
    [grid, axes, pts].forEach((n) => { n.textContent = ''; });
    const xTicks = inv ? [0, 0.5, 1, 1.5, 2] : [0, 1, 2, 3, 4];
    xTicks.forEach((x) => {
      el('line', { x1: gx(x, xMax), x2: gx(x, xMax), y1: G.y0, y2: G.y1, class: 'grid' }, grid);
      el('text', { x: gx(x, xMax), y: G.y0 + 32, 'text-anchor': 'middle', class: 'tick-lbl num' }, axes).textContent = String(x);
    });
    [0, 1, 2, 3, 4].forEach((P) => {
      el('line', { x1: G.x0, x2: G.x1, y1: gy(P), y2: gy(P), class: 'grid' }, grid);
      el('text', { x: G.x0 - 12, y: gy(P) + 9, 'text-anchor': 'end', class: 'tick-lbl num' }, axes).textContent = String(P);
    });
    el('line', { x1: G.x0, x2: G.x1, y1: G.y0, y2: G.y0, class: 'axis' }, axes);
    el('line', { x1: G.x0, x2: G.x0, y1: G.y0, y2: G.y1, class: 'axis' }, axes);
    const xt = el('text', { x: (G.x0 + G.x1) / 2, y: G.y0 + 72, 'text-anchor': 'middle', class: 'axis-title' }, axes);
    if (inv) {
      xt.appendChild(document.createTextNode('1/V (L'));
      el('tspan', { 'baseline-shift': 'super', 'font-size': '70%' }, xt).textContent = '−1';
      xt.appendChild(document.createTextNode(')'));
    } else xt.textContent = 'Volume, V (L)';
    el('text', { x: 0, y: 0, transform: 'translate(26 ' + (G.y0 + G.y1) / 2 + ') rotate(-90)', 'text-anchor': 'middle', class: 'axis-title' }, axes).textContent = 'Absolute P (atm)';

    let d = '';
    if (inv) d = 'M' + gx(0.25, xMax) + ' ' + gy(0.5) + ' L' + gx(2, xMax) + ' ' + gy(4);
    else for (let k = 50; k <= 400; k++) { const V = k / 100; d += (k === 50 ? 'M' : 'L') + gx(V, xMax).toFixed(2) + ' ' + gy(M.pressureAt(V)).toFixed(2); }
    const curve = $('pv-curve');
    curve.setAttribute('d', d);
    curve.setAttribute('data-mode', graphMode);
    [1, 2, 4].forEach((V) => {
      const x = inv ? 1 / V : V;
      el('circle', { cx: gx(x, xMax), cy: gy(M.pressureAt(V)), r: 9, class: 'pt', 'data-v': V }, pts);
    });
    $('graph-title').textContent = inv ? 'Pressure versus 1/V' : 'Pressure versus volume';
    $('graph-desc').textContent = inv
      ? 'Straight line through the origin: P = 2.00 × (1/V). Points at 1/V = 0.25, 0.5 and 1 per liter give 0.50, 1.00 and 2.00 atm.'
      : 'Curve P = 2.00/V from 0.50 L (4.00 atm) to 4.00 L (0.50 atm). It is not a straight line: each doubling of V halves P. Points: 1 L at 2.00 atm, 2 L at 1.00 atm, 4 L at 0.50 atm.';
    // Halving arrows only make sense on the P-vs-V curve.
    const hv = $('graph-halving');
    hv.textContent = '';
    if (!inv) {
      [[1, 2], [2, 4]].forEach(([a, b]) => {
        const x1 = gx(a, 4) + 8, y1 = gy(M.pressureAt(a)) - 14, x2 = gx(b, 4) - 6, y2 = gy(M.pressureAt(b)) - 16;
        el('path', { d: 'M' + x1 + ' ' + y1 + ' Q' + ((x1 + x2) / 2 + 10) + ' ' + (Math.min(y1, y2) - 34) + ' ' + x2 + ' ' + y2, class: 'halve', 'marker-end': 'url(#arrowhead)' }, hv);
      });
      el('text', { x: gx(2.55, 4), y: gy(3.55), 'text-anchor': 'middle', class: 'halve-lbl' }, hv).textContent = 'Double V, halve P';
    }
    curve.style.strokeDasharray = '';
    curvePathLength = curve.getTotalLength();
  }
  let curvePathLength = 0;

  function drawGraph(graphMode, V, showPoint, trace, points, halving) {
    buildGraph(graphMode);
    const inv = graphMode === 'P-vs-invV', xMax = inv ? 2 : 4;
    const curve = $('pv-curve');
    if (trace >= 1) { curve.style.strokeDasharray = ''; curve.style.strokeDashoffset = ''; }
    else { curve.style.strokeDasharray = curvePathLength + ' ' + curvePathLength; curve.style.strokeDashoffset = String(curvePathLength * (1 - trace)); }
    // trace runs in the direction the curve is drawn; for P-vs-V that is from small V (high P) outward
    Array.from($('graph-points').children).forEach((c, i) => { c.style.opacity = String(points[i]); });
    $('graph-halving').style.opacity = String(halving);
    const cp = $('current-point');
    cp.setAttribute('cx', gx(inv ? 1 / V : V, xMax));
    cp.setAttribute('cy', gy(M.pressureAt(V)));
    cp.style.display = showPoint ? '' : 'none';
  }

  /* ---- Scene drawing ---------------------------------------------------- */
  function drawScene(V, showP, parts, contacts) {
    const top = M.gasTopY(V);
    const gas = $('gas-region');
    gas.setAttribute('y', top);
    gas.setAttribute('height', M.GEOM.bottom - top);
    gas.setAttribute('data-volume', fmt(V));
    $('piston-plate').setAttribute('y', top - 26);
    $('piston-rod').setAttribute('height', Math.max(0, top - 26 - 20));
    parts.forEach((p, i) => { particleEls[i].setAttribute('cx', p.x.toFixed(2)); particleEls[i].setAttribute('cy', p.y.toFixed(2)); });
    const cg = $('contacts');
    cg.textContent = '';
    if (contacts) contacts.forEach((c) => {
      const age = contacts.now - c.t, o = Math.max(0, 1 - age / 0.45).toFixed(2);
      const vertical = c.wall === 'left' || c.wall === 'right';
      const dx = c.wall === 'left' ? 5 : c.wall === 'right' ? -5 : 0, dy = c.wall === 'bottom' ? -5 : c.wall === 'piston' ? 5 : 0;
      el('line', vertical
        ? { x1: c.x + dx, x2: c.x + dx, y1: c.y - 15, y2: c.y + 15, class: 'contact', opacity: o }
        : { x1: c.x - 15, x2: c.x + 15, y1: c.y + dy, y2: c.y + dy, class: 'contact', opacity: o }, cg);
    });
    const P = M.pressureAt(V);
    $('gauge-needle-g').style.display = showP ? '' : 'none';
    const a = gaugeAngle(P), rn = GAUGE.r - 18;
    $('gauge-needle').setAttribute('x2', GAUGE.cx + rn * Math.cos(a));
    $('gauge-needle').setAttribute('y2', GAUGE.cy + rn * Math.sin(a));
    $('gauge-readout').textContent = showP ? fmt(P) + ' atm' : 'hidden';
  }

  function drawPanel(V, showP) {
    const P = M.pressureAt(V);
    $('volume-value').textContent = fmt(V) + ' L';
    const pv = $('pressure-value');
    pv.textContent = showP ? fmt(P) + ' atm' : 'hidden';
    pv.classList.toggle('is-hidden-value', !showP);
    pv.setAttribute('data-raw', showP ? String(P) : '');
    // PV is the model invariant; shown even when P is hidden would leak P, so hide it too.
    $('pv-value').textContent = showP ? fmt(P * V) + ' L·atm' : 'hidden';
    $('pv-value').classList.toggle('is-hidden-value', !showP);
  }

  /* ---- Views ------------------------------------------------------------ */
  // Reduced motion: each storyboard step is shown as its settled final frame.
  function effectiveTime(t) {
    if (!reduced) return t;
    const seg = M.SEGMENTS[M.segmentAt(t)];
    return Math.max(seg.start, seg.end - 0.05);
  }

  function renderAnimatic() {
    const t = playback.t, te = effectiveTime(t);
    const vs = M.stateAt(te);
    storySim.seek(te, (tt) => M.gasTopY(M.storyVolume(tt)));
    let contacts = null;
    if (vs.contacts && !reduced) { contacts = storySim.recentContacts(0.45); contacts.now = storySim.t; }
    drawScene(vs.V, true, storySim.particles(), contacts);
    drawPanel(vs.V, true);
    const card = $('panel-card');
    card.dataset.show = vs.card;
    $('pv-row').classList.toggle('hl', vs.segment === 3 && vs.merge > 0.5);
    if (vs.card === 'compress') {
      $('card-v').innerHTML = 'V&nbsp; 2.00 L &rarr; ' + fmt(vs.V) + ' L';
      $('card-p').innerHTML = 'P&nbsp; 1.00 atm &rarr; ' + fmt(M.pressureAt(vs.V)) + ' atm';
    }
    if (vs.card === 'products') {
      const m = vs.merge;
      $('product-a').style.opacity = String(vs.productA * (1 - m));
      $('product-b').style.opacity = String(vs.productB * (1 - m));
      // Cross-fade in place: the products give way to the shared badge without overlapping it.
      $('pv-badge').style.opacity = String(m);
      $('pv-badge').style.transform = 'scale(' + (0.9 + 0.1 * m) + ')';
    }
    if (vs.card === 'graph') drawGraph('P-vs-V', vs.V, vs.graphTrace >= 1, vs.graphTrace, vs.points, vs.halving);
    const cue = M.cueAt(t);
    setCaption(cue ? cue.text : '', false);
    $('timeline').value = String(t);
    $('time-readout').textContent = clock(t) + ' / ' + clock(M.DURATION);
    const seg = M.segmentAt(t);
    if (seg !== lastSeg || !state.running) {
      lastSeg = seg;
      $('timeline').setAttribute('aria-valuetext', t.toFixed(1) + ' seconds of 55, step ' + (seg + 1) + ' of 6');
      $('scene-summary').textContent = 'Animatic step ' + (seg + 1) + ' of 6: ' + M.SEGMENTS[seg].visual;
    }
  }
  let lastSeg = -1;

  function renderExplore(dt) {
    const target = state.volumeL;
    if (reduced || dt === 0) displayV = target;
    else displayV += (target - displayV) * Math.min(1, dt / 0.08);
    if (Math.abs(displayV - target) < 1e-4) displayV = target;
    const top = M.gasTopY(displayV);
    if (!reduced && dt > 0) liveSim.advance(dt, top);
    else if (dt === 0) liveSim.advance(0, top);
    let contacts = null;
    if (showContacts && !reduced) { contacts = liveSim.recentContacts(0.45); contacts.now = liveSim.t; }
    drawScene(displayV, state.revealPressure, liveSim.particles(), contacts);
    drawPanel(target, state.revealPressure);
    $('panel-card').dataset.show = 'graph';
    $('pv-row').classList.remove('hl');
    drawGraph(state.graphMode, target, state.revealPressure, 1, [1, 1, 1], 1);
    setCaption('Exploring your own piston. Press Play or Replay to return to the captioned animatic.', true);
  }

  function setCaption(text, muted) {
    const p = $('caption-text');
    if (p.textContent !== text) p.textContent = text;
    p.classList.toggle('muted', !!muted);
  }
  const clock = (t) => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');

  function render(dt) {
    if (mode === 'animatic') renderAnimatic(); else renderExplore(dt || 0);
    $('play-pause').textContent = state.running ? 'Pause' : 'Play';
    $('play-pause').setAttribute('aria-label', state.running ? 'Pause animatic' : 'Play animatic');
    $('mode-note').textContent = mode === 'animatic'
      ? 'Showing: animatic (silent, captioned).' + (reduced ? ' Reduced motion is on: each step is a still frame; use Previous step and Next step.' : ' Use the piston controls below to explore on your own.')
      : 'Showing: your piston. Press Play or Replay to return to the animatic.';
  }

  /* ---- Live announcements (committed changes only) ---------------------- */
  let announceTimer = 0;
  function announce(msg) {
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => { $('announcer').textContent = msg; }, 250);
  }

  /* ---- Main loop -------------------------------------------------------- */
  let last = 0;
  function tick(now) {
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    if (state.running) {
      playback.t = Math.min(M.DURATION, playback.t + dt);
      if (playback.t >= M.DURATION) { state.running = false; announce('Animatic finished.'); }
      render(dt);
    } else if (mode === 'explore' && (!reduced || displayV !== state.volumeL)) {
      render(dt);
    }
    requestAnimationFrame(tick);
  }

  /* ---- Playback controls ------------------------------------------------ */
  function toAnimatic() { mode = 'animatic'; }
  function setRunning(on) { state.running = on; }

  $('play-pause').addEventListener('click', () => {
    if (mode !== 'animatic') toAnimatic();
    if (!state.running && playback.t >= M.DURATION - 1e-6) playback.t = 0;
    setRunning(!state.running);
    render(0);
    announce(state.running ? 'Animatic playing.' : 'Animatic paused at ' + playback.t.toFixed(0) + ' seconds.');
  });
  $('replay').addEventListener('click', () => {
    toAnimatic(); playback.t = 0; setRunning(true); render(0);
    announce('Animatic restarted. Your answers are kept.');
  });
  function stepTo(t) {
    toAnimatic(); setRunning(false); playback.t = t; render(0);
    const seg = M.segmentAt(Math.min(t, M.DURATION - 0.01));
    announce('Step ' + (seg + 1) + ' of 6. ' + M.SEGMENTS[seg].visual);
  }
  $('step-back').addEventListener('click', () => {
    const prev = M.BOUNDARIES.filter((b) => b < playback.t - 0.05).pop();
    stepTo(prev === undefined ? 0 : prev);
  });
  $('step-forward').addEventListener('click', () => {
    const next = M.BOUNDARIES.find((b) => b > playback.t + 0.05);
    stepTo(next === undefined ? M.DURATION : Math.min(next, M.DURATION));
  });
  $('timeline').addEventListener('input', (e) => {
    toAnimatic(); setRunning(false); playback.t = Number(e.target.value); render(0);
  });

  /* ---- Explore controls: one canonical volume --------------------------- */
  function setVolume(V, source) {
    const v = M.validateVolume(V);
    if (!v.ok) return v;
    state.volumeL = v.value;
    mode = 'explore'; setRunning(false);
    $('volume-slider').value = fmt(v.value);
    $('volume-slider').setAttribute('aria-valuetext', fmt(v.value) + ' liters');
    if (source !== 'input') $('volume-input').value = fmt(v.value);
    document.querySelectorAll('.preset').forEach((b) => b.classList.toggle('is-current', Math.abs(Number(b.dataset.v) - v.value) < 1e-9));
    render(0);
    updateSummary();
    return v;
  }
  function updateSummary() {
    const V = state.volumeL, P = M.pressureAt(V);
    $('scene-summary').textContent = 'Your piston: ' + fmt(V) + ' L, gas region ' + Math.round(V / M.V_MAX * 100) + '% of the cylinder height. 24 dots, same size and speeds. ' +
      (state.revealPressure ? 'Absolute pressure ' + fmt(P) + ' atm; PV = ' + fmt(P * V) + ' L·atm.' : 'Pressure hidden until you reveal it.') + ' T fixed at 300 K, n fixed at 0.0812 mol.';
  }
  function announceVolume() {
    const V = state.volumeL;
    announce('Volume ' + fmt(V) + ' liters. ' + (state.revealPressure ? 'Absolute pressure ' + fmt(M.pressureAt(V)) + ' atmospheres.' : 'Pressure hidden.'));
  }

  const slider = $('volume-slider');
  slider.addEventListener('input', () => setVolume(slider.value, 'slider'));
  slider.addEventListener('change', announceVolume);

  function commitInput() {
    const input = $('volume-input'), msg = $('volume-error');
    const v = M.validateVolume(input.value);
    if (!v.ok) {
      input.setAttribute('aria-invalid', 'true');
      msg.className = 'field-msg';
      msg.textContent = M.VOLUME_ERRORS[v.reason] + ' Volume stays at ' + fmt(state.volumeL) + ' L.';
      return;
    }
    input.removeAttribute('aria-invalid');
    setVolume(v.value, 'input');
    input.value = fmt(v.value);
    msg.className = 'field-msg ok';
    msg.textContent = v.snapped ? 'Rounded to the nearest 0.05 L: ' + fmt(v.value) + ' L.' : '';
    announceVolume();
  }
  $('volume-set').addEventListener('click', commitInput);
  $('volume-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commitInput(); } });
  document.querySelectorAll('.preset').forEach((b) => b.addEventListener('click', () => { setVolume(Number(b.dataset.v), 'preset'); announceVolume(); }));

  $('reveal-toggle').addEventListener('click', () => {
    state.revealPressure = !state.revealPressure;
    mode = 'explore'; setRunning(false);
    syncReveal(); render(0); updateSummary(); announceVolume();
  });
  function syncReveal() {
    const b = $('reveal-toggle');
    b.setAttribute('aria-pressed', String(state.revealPressure));
    b.textContent = state.revealPressure ? 'Hide pressure' : 'Reveal pressure';
  }
  $('contacts-toggle').addEventListener('change', (e) => { showContacts = e.target.checked; mode = 'explore'; setRunning(false); render(0); });
  document.querySelectorAll('input[name="graph-mode"]').forEach((r) => r.addEventListener('change', () => {
    state.graphMode = r.value; mode = 'explore'; setRunning(false); render(0);
    announce(r.value === 'P-vs-V' ? 'Graph shows P versus V: a curve.' : 'Graph shows P versus 1 over V: a straight line through the origin.');
  }));

  /* ---- Learning checks -------------------------------------------------- */
  function showFeedback(node, res, working) {
    node.className = 'feedback ' + (res.status === 'correct' ? 'correct' : res.status === 'empty' ? '' : 'incorrect');
    node.textContent = '';
    if (res.status !== 'empty') {
      const v = document.createElement('span'); v.className = 'verdict';
      v.textContent = res.correct ? 'Correct. ' : 'Not quite. ';
      node.appendChild(v);
    }
    node.appendChild(document.createTextNode(res.message));
    if (working) { const w = document.createElement('span'); w.className = 'working num'; w.textContent = 'Working: ' + working; node.appendChild(w); }
  }
  $('prediction-check').addEventListener('click', () => {
    const c = document.querySelector('input[name="prediction"]:checked');
    const res = M.gradePrediction(c ? c.value : null);
    if (res.status !== 'empty') state.prediction = c.value;
    showFeedback($('feedback'), res);
  });
  function checkTransfer() {
    const res = M.gradeTransfer($('transfer-input').value);
    checks.transfer = res.status === 'empty' ? null : $('transfer-input').value;
    showFeedback($('transfer-feedback'), res, res.working);
  }
  $('transfer-check').addEventListener('click', checkTransfer);
  $('transfer-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); checkTransfer(); } });
  $('leak-submit').addEventListener('click', () => {
    const c = document.querySelector('input[name="leak"]:checked');
    const res = M.gradeLeak(c ? c.value : null);
    checks.leak = c ? c.value : null;
    showFeedback($('leak-feedback'), res);
  });

  /* ---- Reset: initial state, answers cleared ---------------------------- */
  $('reset').addEventListener('click', () => {
    state = initialState(); checks = { transfer: null, leak: null };
    playback.t = 0; mode = 'animatic'; showContacts = false; displayV = M.V_INIT;
    liveSim.reset();
    document.querySelectorAll('input[name="prediction"], input[name="leak"]').forEach((r) => { r.checked = false; });
    document.querySelector('input[name="graph-mode"][value="P-vs-V"]').checked = true;
    $('contacts-toggle').checked = false;
    $('transfer-input').value = '';
    ['feedback', 'transfer-feedback', 'leak-feedback', 'volume-error'].forEach((id) => { $(id).textContent = ''; $(id).className = id === 'volume-error' ? 'field-msg' : 'feedback'; });
    $('volume-input').removeAttribute('aria-invalid');
    $('volume-slider').value = '2'; $('volume-slider').setAttribute('aria-valuetext', '2.00 liters');
    $('volume-input').value = '2.00';
    document.querySelectorAll('.preset').forEach((b) => b.classList.remove('is-current'));
    syncReveal(); lastSeg = -1; render(0);
    announce('Module reset: volume 2.00 liters, pressure hidden, answers cleared.');
  });

  /* ---- Static content --------------------------------------------------- */
  (function buildTable() {
    const tb = document.querySelector('#pv-table tbody');
    [0.5, 1, 2, 4].forEach((V) => {
      const tr = document.createElement('tr');
      [fmt(V), fmt(1 / V), fmt(M.pressureAt(V)), fmt(V * M.pressureAt(V))].forEach((s) => { const td = document.createElement('td'); td.textContent = s; tr.appendChild(td); });
      tb.appendChild(tr);
    });
  })();
  (function buildTranscript() {
    const ol = $('transcript-list');
    M.SEGMENTS.forEach((s) => {
      const li = document.createElement('li');
      const b = document.createElement('strong'); b.textContent = clock(s.start) + '–' + clock(s.end) + ' ';
      li.appendChild(b); li.appendChild(document.createTextNode(s.narration));
      const v = document.createElement('span'); v.className = 'vis'; v.textContent = 'On screen: ' + s.visual;
      li.appendChild(v); ol.appendChild(li);
    });
  })();

  reducedMQ.addEventListener('change', (e) => { reduced = e.matches; render(0); });

  /* ---- Hooks for tests and the deterministic frame exporter ------------- */
  window.__boyle = {
    seek(t) { mode = 'animatic'; state.running = false; playback.t = t; render(0); return M.stateAt(t); },
    snapshot() {
      return {
        mode, t: playback.t, state: JSON.parse(JSON.stringify(state)), checks: Object.assign({}, checks),
        particles: storyOrLive().particles().map((p) => ({ x: p.x, y: p.y, r: p.r, speed: Math.hypot(p.vx, p.vy) })),
        top: M.gasTopY(mode === 'animatic' ? M.storyVolume(effectiveTime(playback.t)) : displayV)
      };
    }
  };
  const storyOrLive = () => (mode === 'animatic' ? storySim : liveSim);

  syncReveal();
  render(0);
  document.fonts.ready.then(() => { window.__boyleReady = true; document.body.dataset.ready = '1'; });
  if (!RENDER) requestAnimationFrame(tick);
})();
