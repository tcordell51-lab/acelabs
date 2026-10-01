/* qr-formats-module.js : the four "DAT formats" modules of the QR engine
   (Quantitative Comparison, Data Sufficiency in the DAT's five-option format,
   Data Interpretation with rendered figures, Applied Word Problems), plus the
   "not on the current DAT" banner for the optional-review modules.

   Loaded after the main engine script in tools/qr/index.html. Items come from
   the shared pool (shared/qr-formats.js) and were merged into BANK by the
   engine, so the engine's own answer handler, spaced review, attempts log and
   Test-Day Simulation all see them.

   Modes per module:
     Practice  one question at a time, untimed, worked solution right after you answer.
     Timed set 10 questions at real DAT pace (45 min / 40 questions = 67.5 s each,
               so 11:15 for the set). No feedback until the end, answers can be
               changed before moving on, full worked review after. */
(function () {
  'use strict';
  if (!window.QRFormats || typeof BANK_BY_ID === 'undefined') return;

  const PACE_SEC = 67.5;
  const TIMED_N = 10;
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // ------------------------------------------------------------- the pictures
  const PIC = {
    qc: `<svg viewBox="0 0 320 170" role="img" aria-label="Two columns on a balance, with three test numbers below" style="width:100%;max-width:340px;display:block">
      <line x1="40" y1="70" x2="280" y2="70" stroke="var(--ink-2)" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M160 70 L148 96 L172 96 Z" fill="var(--gold)" />
      <rect x="40" y="26" width="88" height="40" rx="8" fill="var(--paper-2)" stroke="var(--line-strong)"/>
      <rect x="192" y="26" width="88" height="40" rx="8" fill="var(--paper-2)" stroke="var(--line-strong)"/>
      <text x="84" y="51" text-anchor="middle" font-family="Georgia,serif" font-size="15" fill="var(--ink)">Quantity A</text>
      <text x="236" y="51" text-anchor="middle" font-family="Georgia,serif" font-size="15" fill="var(--ink)">Quantity B</text>
      <text x="160" y="124" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="var(--ink-mute)">test every kind of number the given allows</text>
      <g font-family="Georgia,serif" font-size="15" text-anchor="middle" fill="var(--ink)">
        <rect x="58" y="134" width="52" height="28" rx="14" fill="none" stroke="var(--gold-d)"/><text x="84" y="153">0</text>
        <rect x="134" y="134" width="52" height="28" rx="14" fill="none" stroke="var(--gold-d)"/><text x="160" y="153">-1</text>
        <rect x="210" y="134" width="52" height="28" rx="14" fill="none" stroke="var(--gold-d)"/><text x="236" y="153">1/2</text>
      </g></svg>`,
    ds: `<svg viewBox="0 0 340 190" role="img" aria-label="Decision path for data sufficiency answer choices" style="width:100%;max-width:360px;display:block">
      <g font-family="system-ui,sans-serif" font-size="12.5" fill="var(--ink)">
        <rect x="110" y="6" width="120" height="30" rx="8" fill="var(--paper-2)" stroke="var(--line-strong)"/><text x="170" y="26" text-anchor="middle">(1) alone enough?</text>
        <rect x="10" y="74" width="130" height="30" rx="8" fill="var(--paper-2)" stroke="var(--line-strong)"/><text x="75" y="94" text-anchor="middle">(2) alone enough?</text>
        <rect x="200" y="74" width="130" height="30" rx="8" fill="var(--paper-2)" stroke="var(--line-strong)"/><text x="265" y="94" text-anchor="middle">(2) alone enough?</text>
        <path d="M140 36 L90 74 M200 36 L250 74" stroke="var(--ink-mute)" fill="none"/>
        <text x="92" y="52" fill="var(--good-d)">yes</text><text x="232" y="52" fill="var(--trap-d)">no</text>
        <path d="M45 104 L30 140 M105 104 L120 140 M235 104 L220 140 M295 104 L310 140" stroke="var(--ink-mute)" fill="none"/>
        <g font-family="Georgia,serif" font-size="16" font-weight="700" text-anchor="middle">
          <circle cx="30" cy="156" r="15" fill="none" stroke="var(--gold-d)"/><text x="30" y="162">D</text>
          <circle cx="120" cy="156" r="15" fill="none" stroke="var(--gold-d)"/><text x="120" y="162">A</text>
          <circle cx="220" cy="156" r="15" fill="none" stroke="var(--gold-d)"/><text x="220" y="162">B</text>
          <text x="310" y="162">C/E</text>
        </g>
        <text x="12" y="126" font-size="11" fill="var(--good-d)">yes</text><text x="120" y="126" font-size="11" fill="var(--trap-d)">no</text>
        <text x="200" y="126" font-size="11" fill="var(--good-d)">yes</text><text x="310" y="126" font-size="11" fill="var(--trap-d)">no</text>
        <text x="270" y="186" font-size="11" fill="var(--ink-mute)" text-anchor="middle">then try both together</text>
      </g></svg>`,
    di: `<svg viewBox="0 0 320 170" role="img" aria-label="Two bars with the change between them marked over the starting bar" style="width:100%;max-width:340px;display:block">
      <line x1="30" y1="140" x2="300" y2="140" stroke="var(--ink-mute)"/>
      <path d="M70 140 V84 Q70 80 74 80 H116 Q120 80 120 84 V140 Z" fill="var(--gold)"/>
      <path d="M190 140 V44 Q190 40 194 40 H236 Q240 40 240 44 V140 Z" fill="var(--gold)"/>
      <line x1="120" y1="80" x2="186" y2="80" stroke="var(--ink-2)" stroke-dasharray="4 3"/>
      <path d="M262 80 V44" stroke="var(--trap)" stroke-width="2.5"/><path d="M257 50 L262 42 L267 50" fill="none" stroke="var(--trap)" stroke-width="2.5"/>
      <g font-family="system-ui,sans-serif" font-size="12.5" fill="var(--ink)">
        <text x="95" y="158" text-anchor="middle">start</text><text x="215" y="158" text-anchor="middle">new</text>
        <text x="270" y="66">change</text>
        <text x="95" y="72" text-anchor="middle" fill="var(--ink-mute)">divide by this</text>
      </g></svg>`,
    aw: `<svg viewBox="0 0 340 120" role="img" aria-label="Three steps: picture it, name the move, write one equation" style="width:100%;max-width:360px;display:block">
      <g font-family="system-ui,sans-serif" font-size="12.5" fill="var(--ink)" text-anchor="middle">
        <rect x="6" y="30" width="96" height="54" rx="10" fill="var(--paper-2)" stroke="var(--line-strong)"/><text x="54" y="54">Picture it</text><text x="54" y="72" fill="var(--ink-mute)" font-size="11">who, what, how fast</text>
        <rect x="122" y="30" width="96" height="54" rx="10" fill="var(--paper-2)" stroke="var(--line-strong)"/><text x="170" y="54">Name the move</text><text x="170" y="72" fill="var(--ink-mute)" font-size="11">rates add, salt stays</text>
        <rect x="238" y="30" width="96" height="54" rx="10" fill="var(--paper-2)" stroke="var(--gold-d)"/><text x="286" y="54">One equation</text><text x="286" y="72" fill="var(--ink-mute)" font-size="11">then solve</text>
        <path d="M104 57 H118 M114 52 L120 57 L114 62 M220 57 H234 M230 52 L236 57 L230 62" stroke="var(--gold-d)" fill="none" stroke-width="2"/>
      </g></svg>`
  };

  // ------------------------------------------------------------- module copy
  const MOD = {
    'qc-compare': {
      fmt: 'qc', num: 'F1', title: 'Quantitative <em>Comparison</em>',
      sub: 'Two columns, one question: which is bigger, or can you not tell? You never need the exact values, only the relationship.',
      moves: [
        'Simplify both columns the same way (like a balance: do the same thing to both pans).',
        'If there is a variable, test the kinds of numbers the given allows: a positive, a negative, zero, a fraction between 0 and 1, a big number.',
        'Two tests that give different relationships means it cannot be determined. Stop there.',
        'No variables at all? Then the answer is never "cannot be determined." Compute or estimate and pick.'
      ],
      trap: 'Picking an answer after testing only one easy number like 2. Negatives and fractions flip squares, cubes and reciprocals.',
      lock: 'Same move to both columns. Then test 0, -1, 1/2.'
    },
    'ds-format': {
      fmt: 'ds', num: 'F2', title: 'Data Sufficiency: <em>DAT format</em>',
      sub: 'You are not solving the problem. You are deciding whether the information is enough to solve it. The five answer choices are the same every time.',
      moves: [
        'Before the statements, rewrite the question: what exactly would answer it? (Often a single expression, like x + y.)',
        'Cover statement (2). Is (1) alone enough? Then cover (1). Is (2) alone enough? Only then try both together.',
        'Sufficient means exactly one answer. For a yes/no question, "always no" is sufficient too.',
        'Two statements that say the same thing in different words count as one statement.'
      ],
      trap: 'Letting statement (1) leak into your test of statement (2). Judge each alone first.',
      lock: 'One answer means enough. Alone, alone, then together.'
    },
    'data-figs': {
      fmt: 'di', num: 'F3', title: 'Data Interpretation: <em>figures</em>',
      sub: 'Tables, bar charts, line graphs and pie charts. Read the labels first, then decide what to divide by.',
      moves: [
        'Read the title, the axis labels and the units before any number.',
        'Percent change = (new - old) / old. "What percent of" puts the "of" number on the bottom.',
        'Overall rates pool the counts; never average row percents when the rows have different sizes.',
        'A running total graph: one period is the difference between two neighboring points.'
      ],
      trap: 'Dividing by the wrong base: the newer value, the bigger group, or the whole when the question names a part.',
      lock: 'Labels, then base, then arithmetic.'
    },
    'applied-wp': {
      fmt: 'aw', num: 'F4', title: 'Applied <em>Word Problems</em>',
      sub: 'Ten of the forty QR questions are applied problems. Each one is a story that hides one or two named moves.',
      moves: [
        'Rates: average speed is total distance over total time. Work: add rates, not times.',
        'Mixtures: the pure ingredient is conserved. Track it before and after.',
        'Percent: chain changes as multipliers (up 20% is × 1.2). Undo them by dividing.',
        'Means and weights: turn every mean into a total first.'
      ],
      trap: 'Averaging things that do not average: two speeds, two percents, two times.',
      lock: 'Picture it, name the move, write one equation.'
    }
  };
  // crumbs and other surfaces read MODULES[id].title; meta keeps renderModule out
  Object.keys(MOD).forEach((id) => { if (typeof MODULES !== 'undefined') MODULES[id] = { skill: id, tier: 2, num: MOD[id].num, meta: true, title: MOD[id].title, sub: MOD[id].sub }; });

  // ------------------------------------------------------------- css
  const css = document.createElement('style');
  css.textContent = `
.fmt-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:16px;align-items:start}
@media (max-width:760px){.fmt-grid{grid-template-columns:1fr}}
.fmt-moves{margin:0;padding-left:18px;font-size:14.5px;line-height:1.55}
.fmt-moves li{margin-bottom:6px}
.fmt-choices{display:grid;gap:6px;margin-top:10px;font-size:13.5px}
.fmt-choices div{display:grid;grid-template-columns:24px 1fr;gap:8px;align-items:start}
.fmt-choices b{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;background:var(--paper-3);font-size:12px}
.fmt-modes{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0 4px;align-items:center}
.fmt-chip{border:1px solid var(--line-strong);background:var(--paper);color:var(--ink-2);border-radius:999px;padding:5px 12px;font-size:12.5px;cursor:pointer}
.fmt-chip.on{border-color:var(--gold-d);background:var(--paper-3);color:var(--ink);font-weight:600}
.fmt-run{margin-top:14px}
.fmt-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-mute);margin-bottom:10px}
.fmt-timer{font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;color:var(--gold-d);letter-spacing:0}
.fmt-pick .opt{cursor:pointer}
.fmt-pick .opt.picked{border-color:var(--gold-d);background:var(--paper-3)}
.fmt-review{border-left:3px solid var(--line-strong);padding:10px 14px;margin:12px 0;border-radius:0 8px 8px 0;background:var(--paper)}
.fmt-review.ok{border-left-color:var(--good)}
.fmt-review.miss{border-left-color:var(--trap)}
.fmt-review .sol{font-size:13.5px;line-height:1.55;margin-top:8px}
.offspec-banner{display:flex;gap:12px;align-items:flex-start;border:1px solid var(--line-strong);border-left:4px solid var(--info);background:var(--info-bg);border-radius:10px;padding:12px 14px;margin:0 0 14px;font-size:14px;line-height:1.5;color:var(--ink)}
.offspec-banner b{font-family:Georgia,serif;font-size:15px}
.opts .opt .let{flex:none}
`;
  document.head.appendChild(css);

  // ------------------------------------------------------------- helpers
  const itemsFor = (fmt) => BANK.filter((b) => b.pool === 'qr-formats' && b.fmt === fmt);
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function seenIds() { return new Set(ST.get('attempts', []).map((a) => a.probId)); }
  function setMastery(id, level) {
    const m = getMastery();
    if (m[id] === 'mastered' && level !== 'mastered') return;
    m[id] = level; ST.set('mastery', m);
    try { refreshSidebar(); renderTree(); } catch (e) { /* surfaces not mounted */ }
  }
  const state = {}; // per module: {diff, practice:{queue,i,right,done}, timed:{...}}

  function choicesCard(fmt) {
    const ch = QRFormats.choices[fmt]; if (!ch) return '';
    return `<div class="subcard" style="margin-top:12px"><div class="h"><span class="lbl info">The answer choices, every time</span></div>
      <div class="fmt-choices">${ch.map((c, i) => `<div><b>${'ABCDE'[i]}</b><span>${esc(c)}</span></div>`).join('')}</div>
      <p class="muted" style="font-size:12.5px;margin-top:8px">Learn these cold so test day goes to the math, not to rereading the choices.</p></div>`;
  }

  function render(id) {
    const M = MOD[id]; const sec = document.getElementById(id); if (!sec) return;
    const status = (getMastery()[id]) || 'unlocked';
    const count = itemsFor(M.fmt).length;
    state[id] = state[id] || { diff: 'all' };
    sec.innerHTML = `
      <div class="sec-head">
        <div class="grow">
          <div class="num">DAT FORMAT · ${M.num}</div>
          <h2>${M.title}</h2>
          <p class="s">${M.sub}</p>
        </div>
        <span class="tag ${status === 'mastered' ? 'good' : status === 'partial' ? 'gold' : 'teal'}">${status === 'unlocked' ? 'open' : status}</span>
      </div>
      <div class="card">
        <div class="fmt-grid">
          <div>
            <div class="subcard"><div class="h"><span class="lbl info">The picture</span></div>${PIC[M.fmt]}</div>
            ${choicesCard(M.fmt)}
          </div>
          <div>
            <div class="subcard pattern"><div class="h"><span class="lbl gold">Name the move</span></div><ol class="fmt-moves">${M.moves.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div>
            <div class="row r2" style="margin-top:12px">
              <div class="subcard trap"><div class="h"><span class="lbl trap">The trap</span></div><p>${esc(M.trap)}</p></div>
              <div class="subcard lock"><div class="h"><span class="lbl teal">Lock</span></div><div class="lock-line">${esc(M.lock)}</div></div>
            </div>
          </div>
        </div>
        <div class="fmt-modes">
          <button class="btn gold" data-fmt-act="practice" data-id="${id}">Practice · your pen</button>
          <button class="btn primary" data-fmt-act="timed" data-id="${id}">Timed set · ${TIMED_N} Q at DAT pace</button>
          <span class="muted" style="font-size:12.5px;margin-left:4px">${count} questions · difficulty</span>
          ${['all', 'warm', 'dat'].map((d) => `<button class="fmt-chip ${state[id].diff === d ? 'on' : ''}" data-fmt-act="diff" data-d="${d}" data-id="${id}">${{ all: 'All', warm: 'Warm-up', dat: 'DAT level' }[d]}</button>`).join('')}
        </div>
        <div class="fmt-run" id="fmt-run-${id}"></div>
      </div>`;
  }

  function pool(id) {
    const M = MOD[id]; const d = state[id].diff;
    return itemsFor(M.fmt).filter((p) => d === 'all' || (d === 'warm' ? p.diff <= 2 : p.diff >= 3));
  }

  // ------------------------------------------------------------- practice
  function startPractice(id) {
    const seen = seenIds();
    const all = shuffle(pool(id).slice());
    const queue = all.filter((p) => !seen.has(p.id)).concat(all.filter((p) => seen.has(p.id)));
    state[id].practice = { queue, i: 0, right: 0, answered: 0 };
    showPractice(id);
  }
  function showPractice(id) {
    const P = state[id].practice; const run = document.getElementById('fmt-run-' + id);
    if (!P || !P.queue.length) { run.innerHTML = '<p class="muted">No questions at this difficulty yet.</p>'; return; }
    const p = P.queue[P.i % P.queue.length]; const stage = `fmtp-${id}-${P.i}`;
    run.innerHTML = `
      <div class="card" style="box-shadow:none;border:1px solid var(--line)">
        <div class="fmt-head"><span>Practice · question ${P.i + 1}</span><span>${P.right} of ${P.answered} right so far</span></div>
        ${p.q}
        <div class="opts" data-prob="${p.id}" data-stage="${stage}" style="margin-top:12px">${p.opts.map((o, j) => `<div class="opt" data-c="${j === p.correct ? 1 : 0}" data-i="${j}"><span class="let">${'ABCDE'[j]}</span><span>${o}</span></div>`).join('')}</div>
        <div class="diag" id="diag-${stage}"></div>
        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
          <button class="btn primary" data-fmt-act="next" data-id="${id}">Next question</button>
          <button class="btn ghost sm" data-fmt-act="close" data-id="${id}">Done for now</button>
        </div>
      </div>`;
  }
  function onPracticeAnswered(stageEl) {
    const m = stageEl.dataset.stage.match(/^fmtp-(.+)-(\d+)$/); if (!m) return;
    const id = m[1]; const P = state[id] && state[id].practice; if (!P) return;
    const chosen = stageEl.querySelector('.opt.correct, .opt.wrong'); if (!chosen || stageEl.dataset.counted) return;
    stageEl.dataset.counted = '1'; P.answered++; if (chosen.classList.contains('correct')) P.right++;
    const head = stageEl.parentElement.querySelector('.fmt-head span:last-child'); if (head) head.textContent = `${P.right} of ${P.answered} right so far`;
    if (P.answered >= 10 && P.right / P.answered >= 0.7) setMastery(id, 'partial');
  }

  // ------------------------------------------------------------- timed
  function startTimed(id) {
    const items = shuffle(pool(id).slice()).slice(0, TIMED_N);
    if (!items.length) return;
    const T = { items, i: 0, picks: Array(items.length).fill(null), start: Date.now(), limit: Math.round(items.length * PACE_SEC) };
    state[id].timed = T;
    if (T.int) clearInterval(T.int);
    T.int = setInterval(() => tick(id), 500);
    showTimed(id);
  }
  function remaining(T) { return Math.max(0, T.limit - Math.floor((Date.now() - T.start) / 1000)); }
  const mmss = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  function tick(id) {
    const T = state[id].timed; if (!T || T.done) return;
    const el = document.getElementById('fmt-timer-' + id); const r = remaining(T);
    if (el) el.textContent = mmss(r);
    if (r === 0) finishTimed(id);
  }
  function showTimed(id) {
    const T = state[id].timed; const run = document.getElementById('fmt-run-' + id); const p = T.items[T.i];
    run.innerHTML = `
      <div class="card" style="box-shadow:none;border:1px solid var(--line)">
        <div class="fmt-head"><span>Timed set · question ${T.i + 1} of ${T.items.length}</span><span>time left <span class="fmt-timer" id="fmt-timer-${id}">${mmss(remaining(T))}</span></span></div>
        ${p.q}
        <div class="opts fmt-pick" style="margin-top:12px">${p.opts.map((o, j) => `<div class="opt ${T.picks[T.i] === j ? 'picked' : ''}" data-fmt-pick="${j}" data-id="${id}"><span class="let">${'ABCDE'[j]}</span><span>${o}</span></div>`).join('')}</div>
        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
          ${T.i > 0 ? `<button class="btn ghost" data-fmt-act="tprev" data-id="${id}">Previous</button>` : ''}
          ${T.i < T.items.length - 1 ? `<button class="btn primary" data-fmt-act="tnext" data-id="${id}">Next</button>` : `<button class="btn gold" data-fmt-act="tend" data-id="${id}">Finish and review</button>`}
          <span class="muted" style="font-size:12.5px;align-self:center">Pace: about ${Math.round(PACE_SEC)} seconds a question, like the real QR section.</span>
        </div>
      </div>`;
  }
  function finishTimed(id) {
    const T = state[id].timed; if (!T || T.done) return; T.done = true; clearInterval(T.int);
    const used = Math.min(T.limit, Math.floor((Date.now() - T.start) / 1000));
    let right = 0; const att = ST.get('attempts', []);
    T.items.forEach((p, i) => { const ok = T.picks[i] === p.correct; if (ok) right++; att.push({ probId: p.id, skill: p.skills[0], diff: p.diff, correct: ok, source: 'fmt-timed', t: Date.now() }); try { SR.schedule(p.id, ok, 3); } catch (e) { /* SR optional */ } });
    ST.set('attempts', att.slice(-2000));
    ST.push('fmt:runs', { id, right, total: T.items.length, usedSec: used, t: Date.now() });
    setMastery(id, right / T.items.length >= 0.8 ? 'mastered' : 'partial');
    const run = document.getElementById('fmt-run-' + id);
    run.innerHTML = `
      <div class="card" style="border:2px solid var(--gold)">
        <h3 style="font-family:'Playfair Display',Georgia,serif;font-size:24px;margin:0 0 6px">Set review</h3>
        <p style="font-size:16px;margin:0 0 4px">You answered <b>${right}</b> of <b>${T.items.length}</b> correctly in <b>${mmss(used)}</b> (the pace allowance was ${mmss(T.limit)}).</p>
        <p class="muted" style="font-size:13px;margin:0 0 10px">Every question below has its worked solution. Read the misses first, then say the move out loud before your next set.</p>
        ${T.items.map((p, i) => {
          const ok = T.picks[i] === p.correct; const pick = T.picks[i];
          return `<div class="fmt-review ${ok ? 'ok' : 'miss'}">
            <div class="fmt-head" style="margin-bottom:6px"><span>Question ${i + 1} · ${ok ? 'correct' : pick == null ? 'not answered' : 'missed'}</span></div>
            ${p.q}
            <div style="font-size:13.5px;margin-top:6px">${pick != null && !ok ? `You chose <b>${'ABCDE'[pick]}</b>: ${p.opts[pick]}${p.diag && p.diag[pick] ? `<br><span class="muted">${p.diag[pick]}</span>` : ''}<br>` : ''}Answer: <b>${'ABCDE'[p.correct]}</b>: ${p.opts[p.correct]}</div>
            <div class="sol">${p.why}</div></div>`;
        }).join('')}
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
          <button class="btn gold" data-fmt-act="timed" data-id="${id}">Another timed set</button>
          <button class="btn ghost" data-fmt-act="practice" data-id="${id}">Practice with feedback</button>
        </div>
      </div>`;
    if (typeof renderWeakSpots === 'function') renderWeakSpots();
  }

  // ------------------------------------------------------------- events
  document.addEventListener('click', (e) => {
    const pick = e.target.closest('[data-fmt-pick]');
    if (pick) {
      const id = pick.dataset.id; const T = state[id] && state[id].timed; if (!T || T.done) return;
      T.picks[T.i] = +pick.dataset.fmtPick;
      pick.parentElement.querySelectorAll('.opt').forEach((o) => o.classList.toggle('picked', o === pick));
      return;
    }
    const b = e.target.closest('[data-fmt-act]');
    if (b) {
      const id = b.dataset.id; const act = b.dataset.fmtAct;
      if (act === 'diff') { state[id].diff = b.dataset.d; b.parentElement.querySelectorAll('.fmt-chip').forEach((c) => c.classList.toggle('on', c === b)); return; }
      if (act === 'practice') startPractice(id);
      if (act === 'next') { state[id].practice.i++; showPractice(id); }
      if (act === 'close') document.getElementById('fmt-run-' + id).innerHTML = '';
      if (act === 'timed') startTimed(id);
      if (act === 'tnext') { state[id].timed.i++; showTimed(id); }
      if (act === 'tprev') { state[id].timed.i--; showTimed(id); }
      if (act === 'tend') finishTimed(id);
      const run = document.getElementById('fmt-run-' + id);
      if (run && act !== 'close' && act !== 'tend') run.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    // after the engine's own handler marks a practice answer, update the tally
    const opt = e.target.closest('.opt[data-c]');
    if (opt && opt.parentElement.dataset.stage && opt.parentElement.dataset.stage.indexOf('fmtp-') === 0) setTimeout(() => onPracticeAnswered(opt.parentElement), 0);
  });

  Object.keys(MOD).forEach(render);

  // ------------------------------------------------------------- optional review banner
  const OFF_NOTE = '<div class="offspec-banner" role="note"><div><b>Optional review: not on the current DAT.</b><br>Geometry, trigonometry and unit conversions were removed from the Quantitative Reasoning section in the 2015 to 2016 update. This module stays here if you want the background, but it is not part of scored practice, the diagnostic, or the test-day simulation. Your QR time is best spent on the current-spec modules.</div></div>';
  function addBanner(id) {
    const sec = document.getElementById(id); if (!sec || sec.querySelector('.offspec-banner')) return;
    const head = sec.querySelector('.sec-head');
    if (head) head.insertAdjacentHTML('afterend', OFF_NOTE); else sec.insertAdjacentHTML('afterbegin', OFF_NOTE);
  }
  if (typeof OFFSPEC_SKILLS !== 'undefined') {
    OFFSPEC_SKILLS.forEach(addBanner);
    if (typeof renderModule === 'function') {
      const prev = renderModule;
      // eslint-disable-next-line no-global-assign
      renderModule = function (skillId) { prev(skillId); if (OFFSPEC_SKILLS.has(skillId)) setTimeout(() => addBanner(skillId), 0); };
    }
  }
  window.QR_FORMATS_MODULE = { render, startPractice, startTimed, MOD };
})();
