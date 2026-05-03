/* Ace Labs shell — cross-tool localStorage aggregator
   Reads from each tool's namespace and rolls up to the home dashboard. */

(function(){
  // localStorage namespaces used by each engine (verified against source files)
  const NS = {
    qr:    'qr-rem-v2',
    gc:    'gc-rem-v1',
    bio:   'bio-engine',     // bio uses bio- prefix
    ochem: 'ochem'           // ochem uses portal student-scope OR raw 'ochem-' keys
  };

  // Read mastery state for each tool
  function getMasteryFor(toolKey){
    const ns = NS[toolKey];
    const out = { mastered:0, partial:0, total:0, lastSession:null };
    try {
      // QR + GC store under "<ns>:mastery" → JSON map { skillId: 'mastered'|'partial'|... }
      const masteryRaw = localStorage.getItem(ns + ':mastery');
      if (masteryRaw){
        const m = JSON.parse(masteryRaw);
        Object.values(m).forEach(v => {
          if (v === 'mastered') out.mastered++;
          else if (v === 'partial') out.partial++;
        });
        out.total = Object.keys(m).length;
      }
      // Last session timestamp
      const lastRaw = localStorage.getItem(ns + ':lastSession');
      if (lastRaw) out.lastSession = parseInt(lastRaw);
    } catch(e){}
    // Tool-specific defaults / fallbacks if no localStorage data yet
    const totals = { qr:37, gc:37, bio:40, ochem:30 };
    if (out.total === 0) out.total = totals[toolKey] || 30;
    return out;
  }

  // Aggregate due cards across tools (best-effort: each tool stores SR queue under <ns>:sr-due)
  function aggregateCardsDue(){
    let total = 0;
    Object.values(NS).forEach(ns => {
      try {
        const raw = localStorage.getItem(ns + ':sr-due');
        if (raw){
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) total += arr.length;
        }
      } catch(e){}
    });
    return total;
  }

  // Last session across all tools
  function getLastSessionAcrossTools(){
    let latest = null, source = null;
    Object.entries(NS).forEach(([k, ns]) => {
      try {
        const raw = localStorage.getItem(ns + ':lastSession');
        if (raw){
          const t = parseInt(raw);
          if (t && (latest === null || t > latest)){ latest = t; source = k; }
        }
      } catch(e){}
    });
    return { ts:latest, source };
  }

  // Last cross-tool mock score
  function getLastMockScore(){
    try {
      const raw = localStorage.getItem('al:lastMock');
      if (raw) return JSON.parse(raw);
    } catch(e){}
    return null;
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
    const last = getLastSessionAcrossTools();
    if (last.ts){
      const dashLast = document.getElementById('dashLastSession');
      const dashLastSub = document.getElementById('dashLastSessionSub');
      if (dashLast) dashLast.textContent = fmtRelTime(last.ts);
      if (dashLastSub) dashLastSub.textContent = 'In the ' + ({qr:'QR',bio:'Bio',gc:'Gen Chem',ochem:'OChem'}[last.source] || 'unknown') + ' engine';
    }

    // Last mock
    const lastMock = getLastMockScore();
    if (lastMock){
      const dashMockScore = document.getElementById('dashMockScore');
      const dashMockSub = document.getElementById('dashMockSub');
      if (dashMockScore) dashMockScore.textContent = lastMock.score + ' / 100';
      if (dashMockSub) dashMockSub.textContent = 'Predicted SoNS: ' + (lastMock.predicted || '—') + ' · ' + fmtRelTime(lastMock.ts);
    }

    // Per-tool mastery on the tile
    tools.forEach(t => {
      const el = document.getElementById(t + 'MasteryStat');
      if (el) el.textContent = data[t].mastered + ' / ' + data[t].total + ' mastered';
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

  document.addEventListener('DOMContentLoaded', render);
  // Also re-render on focus (in case user came back from a tool tab)
  window.addEventListener('focus', render);
})();
