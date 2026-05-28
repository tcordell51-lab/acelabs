/* Ace Labs shell — cross-tool localStorage aggregator
   Reads from each tool's namespace and rolls up to the home dashboard.

   ── localStorage key prefix reference ────────────────────────────────────
   Each engine uses a different prefix convention. DO NOT migrate keys — the
   engines own their own storage shapes. This comment is the canonical index.

   Bio engine  -- prefix: acethedat_bio_*  (underscore separator, not colon)
                 keys include:
                   acethedat_bio_engine_v1    — full state object; .aceCards array
                   acethedat_bio_progress     — mastery summary { mastered, partial, total }
                   acethedat_bio_last_session — timestamp (ms epoch, plain number string)

   QR engine   -- prefix: qr-rem-v2:*  (colon separator)
                 keys include:
                   qr-rem-v2:mastery    — { questionId: 'mastered'|'partial' }
                   qr-rem-v2:attempts   — array of attempt objects with .t timestamp
                   qr-rem-v2:lastSession — timestamp (ms epoch)

   GC engine   -- prefix: gc-rem-v1:*  (colon separator)
                 Same shape as QR (mastery / attempts / lastSession).

   OChem engine -- prefix: ochem-rem-v1:*  (colon separator)
                 keys include:
                   ochem-rem-v1:mastery      — { hubId: 'mastered'|'partial' }
                   ochem-rem-v1:hub-mastery  — hub-level object (used for activity count)
                   ochem-rem-v1:lastSession  — timestamp (ms epoch)

   Unified mock / home dash -- prefix: al:*
                 (the home dashboard does not surface mock scores — outcome-forecasting
                 was removed 2026-05-07. al:* keys are still written by mock pages and
                 read by mock-specific result screens; the home tile only reports
                 freshness, not score.)

   ── Outcome-forecasting policy (2026-05-07) ─────────────────────────────
   Ace Labs MUST NOT surface predicted DAT scores, percentiles, "best score"
   tracking, or anything that maps practice performance to a real-exam outcome
   on the parent dashboard. Practice metrics (mastery, attempts, retrievals,
   cards due, last-session freshness) are fine. If a future change adds an
   outcome-prediction tile here, push back — that's a deliberate product rule,
   not an oversight.

   ── qrFeatActivity binding note ──────────────────────────────────────────
   The element #qrFeatActivity in ace-labs.html IS bound: the render() loop at
   the bottom of this file iterates tools.forEach(t => ...) and sets
   t + 'FeatActivity' for all tools including 'qr'. If it shows "— attempts"
   forever in the browser, the issue is zero attempts in qr-rem-v2:attempts
   (no data yet), NOT a missing binding. The element updates correctly once the
   student has used the QR engine.
   ──────────────────────────────────────────────────────────────────────────
*/

(function(){
  // localStorage namespaces used by each engine (verified against source files)
  const NS = {
    qr:    'qr-rem-v2',
    gc:    'gc-rem-v1',
    bio:   'acethedat_bio',     // bio uses acethedat_bio_* keys (no colon — uses underscore)
    ochem: 'ochem-rem-v1'       // ochem v2 will write here (existing tool uses portal student-scope)
  };
  // Bio uses underscore separator instead of colon — handled per-tool below

  // Read mastery + activity for each tool. Each tool uses a different shape; handle each explicitly.
  // attempts: a per-tool "activity volume" signal (problem attempts for QR/GC, retrievals for Bio,
  //           hubs touched for OChem). Used by the home tile pills, not by the rollup totals.
  function readNum(raw){
    if (raw == null) return null;
    try { const v = JSON.parse(raw); const n = parseInt(v); return Number.isFinite(n) ? n : null; }
    catch(e){ const n = parseInt(raw); return Number.isFinite(n) ? n : null; }
  }
  function getMasteryFor(toolKey){
    const out = { mastered:0, partial:0, total:0, attempts:0, lastSession:null };
    try {
      if (toolKey === 'qr' || toolKey === 'gc'){
        const ns = NS[toolKey];
        const masteryRaw = localStorage.getItem(ns + ':mastery');
        if (masteryRaw){
          const m = JSON.parse(masteryRaw);
          Object.values(m).forEach(v => { if (v === 'mastered') out.mastered++; else if (v === 'partial') out.partial++; });
          out.total = Object.keys(m).length;
        }
        const attemptsRaw = localStorage.getItem(ns + ':attempts');
        if (attemptsRaw){
          const arr = JSON.parse(attemptsRaw);
          if (Array.isArray(arr)){
            out.attempts = arr.length;
            // Derive lastSession from the most recent attempt timestamp as a fallback
            for (let i = arr.length - 1; i >= 0; i--){
              if (arr[i] && arr[i].t){ out.lastSession = arr[i].t; break; }
            }
          }
        }
        const lastExplicit = readNum(localStorage.getItem(ns + ':lastSession'));
        if (lastExplicit && (!out.lastSession || lastExplicit > out.lastSession)) out.lastSession = lastExplicit;
      } else if (toolKey === 'ochem'){
        const ns = NS[toolKey];
        const masteryRaw = localStorage.getItem(ns + ':mastery');
        if (masteryRaw){
          const m = JSON.parse(masteryRaw);
          Object.values(m).forEach(v => { if (v === 'mastered') out.mastered++; else if (v === 'partial') out.partial++; });
          out.total = Object.keys(m).length;
        }
        // Activity = number of hubs the student has touched (mastered or partial)
        const hubRaw = localStorage.getItem(ns + ':hub-mastery');
        if (hubRaw){
          try { out.attempts = Object.keys(JSON.parse(hubRaw) || {}).length; } catch(e){}
        }
        const lastExplicit = readNum(localStorage.getItem(ns + ':lastSession'));
        if (lastExplicit) out.lastSession = lastExplicit;
      } else if (toolKey === 'bio'){
        // Bio's saveState writes a summary under acethedat_bio_progress with per-node
        // stageOrder.length factored in. Prefer that. Fall back to a stage-threshold
        // heuristic on the raw STATE for legacy data that hasn't been re-saved.
        let summaryUsed = false;
        const summaryRaw = localStorage.getItem('acethedat_bio_progress');
        if (summaryRaw){
          try {
            const s = JSON.parse(summaryRaw);
            out.mastered = parseInt(s.mastered) || 0;
            out.partial  = parseInt(s.partial)  || 0;
            if (s.total) out.total = parseInt(s.total) || 0;
            summaryUsed = true;
          } catch(e){}
        }
        const stateRaw = localStorage.getItem('acethedat_bio_engine_v1');
        if (stateRaw){
          const state = JSON.parse(stateRaw);
          Object.values(state).forEach(node => {
            if (!node || typeof node !== 'object') return;
            const stage = parseInt(node.stage) || 0;
            if (node.retrievals) out.attempts += Object.keys(node.retrievals).length;
            if (!summaryUsed){
              if (stage >= 5) out.mastered++;
              else if (stage > 0) out.partial++;
            }
          });
        }
        const lastExplicit = readNum(localStorage.getItem('acethedat_bio_last_session'));
        if (lastExplicit) out.lastSession = lastExplicit;
      }
    } catch(e){}
    // Tool-specific defaults / fallbacks if no localStorage data yet
    const totals = { qr:41, gc:37, bio:40, ochem:30 };
    if (out.total === 0) out.total = totals[toolKey] || 30;
    return out;
  }

  // Aggregate due cards across tools.
  //   QR:      qr-rem-v2:sr is a single object keyed by question id —
  //            { [probId]: { ef, interval, due (ms epoch), reps, lastQ } }.
  //            Count entries where due <= now.
  //   GC:      gc-rem-v1:sr — same shape as QR.
  //   OChem:   no SR system today — skip.
  //   Bio:     acethedat_bio_engine_v1 contains .aceCards array with per-card
  //            { nextDue (ms epoch), closed (bool) } shape. Count cards where
  //            !closed && nextDue <= now.
  // (Fix 13: previously this looked for <ns>:sr-due aggregate keys that no engine
  //  ever wrote — replaced with direct scan of the engine's actual SR shape.)
  function aggregateCardsDue(){
    let total = 0;
    const now = Date.now();
    // Bio aceCards
    try {
      const bioRaw = localStorage.getItem('acethedat_bio_engine_v1');
      if (bioRaw){
        const state = JSON.parse(bioRaw);
        if (Array.isArray(state.aceCards)){
          state.aceCards.forEach(c => {
            if (c && !c.closed && typeof c.nextDue === 'number' && c.nextDue <= now) total++;
          });
        }
      }
    } catch(e){}
    // GC + QR — both store SR as a single object at <ns>:sr keyed by question id
    ['gc-rem-v1', 'qr-rem-v2'].forEach(ns => {
      try {
        const raw = localStorage.getItem(ns + ':sr');
        if (!raw) return;
        const sr = JSON.parse(raw);
        if (!sr || typeof sr !== 'object') return;
        Object.values(sr).forEach(entry => {
          if (entry && typeof entry.due === 'number' && entry.due <= now) total++;
        });
      } catch(e){}
    });
    return total;
  }

  // Last session across all tools — uses each tool's data object so the per-attempt fallback
  // and Bio's underscore-key location are handled centrally.
  function getLastSessionAcrossTools(data){
    let latest = null, source = null;
    Object.keys(data).forEach(k => {
      const t = data[k] && data[k].lastSession;
      if (t && (latest === null || t > latest)){ latest = t; source = k; }
    });
    return { ts:latest, source };
  }

  // Recent practice — freshness-only readout (no scores, no predictions).
  // Picks the engine whose lastSession timestamp is most recent and reports
  // questions answered in the last 7 days for that engine.
  //
  // Precedence is purely "whichever ts is biggest"; if multiple engines tie
  // (unlikely down to ms), the iteration order in the data map wins, which is
  // qr → bio → gc → ochem.
  //
  // Question-count source (last 7 days):
  //   QR / GC : count entries in <ns>:attempts where attempt.t >= now - 7d
  //   Bio     : count retrievals across all nodes whose ts >= now - 7d
  //             (acethedat_bio_engine_v1 nodes have a .retrievals object whose
  //              values are timestamps; falls back to total if shape differs)
  //   OChem   : no per-attempt timestamp store; falls back to "hubs touched"
  //             (the same activity unit the OChem tile uses)
  function getRecentPractice(data){
    const ENGINE_LABELS = { qr:'Quantitative Reasoning', bio:'Biology', gc:'Gen Chem', ochem:'Organic Chem' };
    const ENGINE_HREFS = { qr:'tools/qr/index.html', bio:'tools/bio/index.html', gc:'tools/gc/index.html', ochem:'tools/ochem/index.html' };
    let freshest = null, ts = null;
    Object.keys(data).forEach(k => {
      const t = data[k] && data[k].lastSession;
      if (t && (ts === null || t > ts)){ ts = t; freshest = k; }
    });
    if (!freshest) return null;
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    let weekCount = 0;
    try {
      if (freshest === 'qr' || freshest === 'gc'){
        const ns = NS[freshest];
        const raw = localStorage.getItem(ns + ':attempts');
        if (raw){
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)){
            arr.forEach(a => { if (a && typeof a.t === 'number' && a.t >= weekAgo) weekCount++; });
          }
        }
      } else if (freshest === 'bio'){
        const stateRaw = localStorage.getItem('acethedat_bio_engine_v1');
        if (stateRaw){
          const state = JSON.parse(stateRaw);
          Object.values(state).forEach(node => {
            if (!node || typeof node !== 'object' || !node.retrievals) return;
            Object.values(node.retrievals).forEach(t => {
              const n = typeof t === 'number' ? t : (t && t.ts) || null;
              if (typeof n === 'number' && n >= weekAgo) weekCount++;
            });
          });
        }
      } else if (freshest === 'ochem'){
        weekCount = data.ochem.attempts || 0; // hubs touched (no per-attempt ts in store)
      }
    } catch(e){}
    return {
      engine: freshest,
      label: ENGINE_LABELS[freshest],
      href: ENGINE_HREFS[freshest],
      ts,
      weekCount,
      activityUnit: freshest === 'ochem' ? 'hubs touched' : (freshest === 'bio' ? 'retrievals' : 'attempts')
    };
  }

  function fmtRelTime(ts){
    if (!ts) return null;
    const diff = Date.now() - ts;
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'Just now';
    if (min < 60) return min + ' min ago';
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr + ' hr ago';
    const d = Math.floor(hr / 24);
    if (d < 7) return d + ' day' + (d>1?'s':'') + ' ago';
    return new Date(ts).toLocaleDateString();
  }

  function render(){
    const tools = ['qr','bio','gc','ochem'];
    const data = {};
    tools.forEach(t => data[t] = getMasteryFor(t));

    // Top-line numbers
    const cardsDue = aggregateCardsDue();
    const dashCardsDue = document.getElementById('dashCardsDue');
    if (dashCardsDue) dashCardsDue.textContent = cardsDue || '0';

    // Total mastered + total modules
    const totalMastered = tools.reduce((s, t) => s + data[t].mastered, 0);
    const totalModules = tools.reduce((s, t) => s + data[t].total, 0);
    const overallPct = totalModules > 0 ? Math.round(100 * totalMastered / totalModules) : 0;
    const dashPct = document.getElementById('dashMasteryPct');
    if (dashPct) dashPct.textContent = overallPct + '%';
    const dashFill = document.getElementById('dashMasteryFill');
    if (dashFill) dashFill.style.width = overallPct + '%';
    const dashSub = document.getElementById('dashMasterySub');
    if (dashSub) dashSub.textContent = totalMastered + ' of ' + totalModules + ' modules mastered across QR / Bio / GC / OChem';

    // Last session
    const last = getLastSessionAcrossTools(data);
    if (last.ts){
      const dashLast = document.getElementById('dashLastSession');
      const dashLastSub = document.getElementById('dashLastSessionSub');
      if (dashLast) dashLast.textContent = fmtRelTime(last.ts);
      if (dashLastSub) dashLastSub.textContent = 'In the ' + ({qr:'QR',bio:'Bio',gc:'Gen Chem',ochem:'OChem'}[last.source] || 'unknown') + ' engine';
    }

    // Recent practice tile (replaces former "Last Prometric mock" tile 2026-05-07).
    // No scores, no predictions — only freshness + activity volume + a CTA.
    const recent = getRecentPractice(data);
    if (recent){
      const dashRecentDate = document.getElementById('dashRecentDate');
      const dashRecentSub = document.getElementById('dashRecentSub');
      const dashRecentCta = document.getElementById('dashRecentCta');
      if (dashRecentDate) dashRecentDate.textContent = fmtRelTime(recent.ts);
      if (dashRecentSub){
        if (recent.weekCount > 0){
          dashRecentSub.textContent = recent.weekCount + ' ' + recent.activityUnit + ' this week · last in ' + recent.label;
        } else {
          dashRecentSub.textContent = 'Last session in ' + recent.label;
        }
      }
      if (dashRecentCta){
        dashRecentCta.setAttribute('href', recent.href);
        dashRecentCta.setAttribute('target', '_blank');
        dashRecentCta.setAttribute('rel', 'noopener');
        dashRecentCta.textContent = 'Open ' + recent.label;
      }
    }

    // Per-tool mastery on the tile foot
    tools.forEach(t => {
      const el = document.getElementById(t + 'MasteryStat');
      if (el) el.textContent = data[t].mastered + ' / ' + data[t].total + ' mastered';
    });

    // Per-tool live progress pills (replaces the old static "35 visuals" / "28 / 40 nodes" copy).
    // Activity-pill label varies per tool because each tracks a different unit of work.
    const ACTIVITY_LABEL = { qr:'attempts', gc:'attempts', bio:'retrievals', ochem:'hubs touched' };
    tools.forEach(t => {
      const d = data[t];
      const partialEl = document.getElementById(t + 'FeatPartial');
      if (partialEl) partialEl.textContent = d.partial + ' in progress';
      const actEl = document.getElementById(t + 'FeatActivity');
      if (actEl) actEl.textContent = d.attempts + ' ' + ACTIVITY_LABEL[t];
      const lastEl = document.getElementById(t + 'FeatLast');
      if (lastEl) lastEl.textContent = d.lastSession ? 'Last: ' + fmtRelTime(d.lastSession) : 'No sessions yet';
    });

    // Subjects grid
    const grid = document.getElementById('dashSubjectsGrid');
    if (grid){
      const labels = { qr:'Quantitative Reasoning', bio:'Biology', gc:'Gen Chem', ochem:'Organic Chem' };
      grid.innerHTML = tools.map(t => {
        const d = data[t];
        const pct = d.total > 0 ? Math.round(100 * d.mastered / d.total) : 0;
        return `<div class="al-dash-subject ${t}">
          <div class="lbl">${labels[t]}</div>
          <div class="pct">${d.mastered} / ${d.total}<span style="color:var(--al-ink-mute); font-weight:600; margin-left:6px">(${pct}%)</span></div>
        </div>`;
      }).join('');
    }

    // Weekly plan suggestion (weakest tool)
    const planGrid = document.getElementById('planGrid');
    if (planGrid && totalModules > 0){
      const weakest = tools.map(t => ({ t, ratio: data[t].total > 0 ? data[t].mastered / data[t].total : 0 })).sort((a,b) => a.ratio - b.ratio)[0];
      const labels = { qr:'Quantitative Reasoning', bio:'Biology', gc:'Gen Chem', ochem:'Organic Chem' };
      if (weakest && totalMastered > 0){
        planGrid.innerHTML = `
          <div class="al-dash-card" style="border-left:4px solid var(--al-trap); background:rgba(217,83,79,0.05)">
            <div class="al-dash-lbl">Suggested focus this week</div>
            <div class="al-dash-num-small" style="color:var(--al-trap)">${labels[weakest.t]}</div>
            <div class="al-dash-sub">Your weakest subject — only ${Math.round(100*weakest.ratio)}% of modules mastered.</div>
            <a href="tools/${weakest.t}/index.html" target="_blank" class="al-dash-cta">Open ${labels[weakest.t]}</a>
          </div>
          <div class="al-dash-card">
            <div class="al-dash-lbl">Cards due across tools</div>
            <div class="al-dash-num-small">${cardsDue} cards</div>
            <div class="al-dash-sub">Spaced retrieval queue — clear these first.</div>
          </div>
          <div class="al-dash-card">
            <div class="al-dash-lbl">Cross-tool mock</div>
            <div class="al-dash-num-small">100Q · 90 min</div>
            <div class="al-dash-sub">Survey of Natural Sciences format. Take one this week.</div>
            <a href="unified-mock.html" class="al-dash-cta">Take mock</a>
          </div>`;
      }
    }
  }

  // Diagnostic panel — populated only when URL contains ?debug=1.
  // Lists every localStorage key whose prefix matches an AL engine namespace,
  // along with its current value truncated to 200 chars. Read-only.
  function renderDebugPanel(){
    let isDebug = false;
    try { isDebug = new URLSearchParams(window.location.search).get('debug') === '1'; }
    catch(e){ isDebug = /[?&]debug=1\b/.test(window.location.search || ''); }
    const panel = document.getElementById('debugPanel');
    if (!panel) return;
    if (!isDebug){ panel.style.display = 'none'; return; }
    panel.style.display = '';
    const body = document.getElementById('debugPanelBody');
    const sub = document.getElementById('debugPanelSub');
    if (!body) return;
    // Match prefixes: gc:, gc-rem-v1:, bio:, acethedat_bio*, qr:, qr-rem-v2:,
    // ochem:, ochem-rem-v1:, atDAT_*, al:, sim:, pace:
    const prefixMatchers = [
      /^gc:/, /^gc-rem-v1/, /^bio:/, /^acethedat_bio/,
      /^qr:/, /^qr-rem-v2/, /^ochem:/, /^ochem-rem-v1/, /^atDAT_/,
      /^al:/, /^sim:/, /^pace:/
    ];
    const rows = [];
    try {
      for (let i = 0; i < localStorage.length; i++){
        const k = localStorage.key(i);
        if (!k) continue;
        if (!prefixMatchers.some(rx => rx.test(k))) continue;
        let v = '';
        try { v = localStorage.getItem(k) || ''; } catch(e){ v = '(read error)'; }
        if (v.length > 200) v = v.slice(0, 200) + '... [+' + (v.length - 200) + ' chars]';
        rows.push({ k, v });
      }
    } catch(e){}
    rows.sort((a, b) => a.k.localeCompare(b.k));
    if (sub) sub.textContent = rows.length + ' matching keys (gc:* / bio:* / qr:* / ochem:* / al:* / sim:* / pace:*). Read-only.';
    const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    body.innerHTML = rows.map((r, i) => {
      const bg = i % 2 ? 'transparent' : 'rgba(13,32,24,.025)';
      return '<div style="padding:8px 14px; background:' + bg + '; border-bottom:1px solid var(--al-line); color:var(--al-ink); word-break:break-all;">'
           + esc(r.k) + '</div>'
           + '<div style="padding:8px 14px; background:' + bg + '; border-bottom:1px solid var(--al-line); border-left:1px solid var(--al-line); color:var(--al-ink-2); word-break:break-all; white-space:pre-wrap;">'
           + esc(r.v) + '</div>';
    }).join('') || '<div style="padding:14px; grid-column:1 / span 2; color:var(--al-ink-mute); text-align:center;">No matching localStorage keys found.</div>';
  }

  function renderAll(){ render(); renderDebugPanel(); }

  document.addEventListener('DOMContentLoaded', renderAll);
  // Also re-render on focus (in case user came back from a tool tab)
  window.addEventListener('focus', renderAll);
})();
