/* ace-next-steps.js : the "what to do next" block every test report ends with (2026-11-24).

   A test page builds a list of candidate areas from its own data and calls, once:

     AceNextSteps.render(host, {
       src: 'full-length' | 'pat-test' | 'diagnostic' | 'climb',
       title: 'Full-length DAT 1',
       pct: 0.58,                       // overall raw accuracy, 0 to 1 (decides how visible the coach card is)
       areas: [{                        // any number; the three weakest are picked here
         section: 'bio',                // bio gchem ochem qr pat rc
         label: 'Evolution',            // the subtopic or skill, in the student's words
         correct: 1, total: 4,
         blank: 0,                      // misses left blank
         missSec: [12, 80],             // seconds spent on each miss (optional)
         paceSec: 54,                   // the test-day pace for one question (optional)
         traps: [{ label, count }],     // trap types picked, most first (optional)
         learn: { href, label },        // the Retold night that teaches it
         drill: { href, label }         // the engine, trainer or player that drills it
       }],
       retest: { href, label, detail }  // how the week ends
     })

   It renders: the three weakest areas, each with WHY (blank, trap, pace or concept) and the exact
   page that fixes it; a 3 to 5 step plan for this week; a link to the schedule builder; and a 1:1
   coaching card that names those areas. Raw counts only: no scaled score, no prediction.
   The coach card is fuller when results are weak or the test date (acelabs_test_date) is close,
   and one quiet line otherwise. Portal students get "Message your coach" (same rule as ace-labs.html).
   The last report's weak areas are kept in localStorage (acelabs_last_report) for the planner.
   No dependencies. Styles are injected once, scoped to .anx. */
(function () {
  'use strict';
  if (window.AceNextSteps) return;

  var CONTACT = 'https://acethedat.com/contact.html';
  var PORTAL_MSG = 'https://acethedat-portal.netlify.app/student/messages';
  var PLAN = '/plan/';
  var K_PLAN = 'acelabs_plan_v1';
  var K_LAST = 'acelabs_last_report';
  var SEC = {
    bio: { name: 'Biology', c: '#2f7d4f' }, gchem: { name: 'Gen Chem', c: '#2f5f9e' }, ochem: { name: 'Organic Chem', c: '#6b4fa0' },
    qr: { name: 'Quant Reasoning', c: '#a3405c' }, pat: { name: 'Perceptual Ability', c: '#8a5a0b' }, rc: { name: 'Reading', c: '#1f7a70' }
  };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function secs(n) { n = Math.round(n); return n >= 90 ? Math.floor(n / 60) + ' min' + (n % 60 ? ' ' + (n % 60) + ' s' : '') : n + ' s'; }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  /* ---------------- context: test date and portal ---------------- */
  function daysToTest() {
    var d = null;
    try { var ob = JSON.parse(lsGet('aceLabs:onboarding') || 'null'); if (ob && typeof ob.testDate === 'string') d = ob.testDate; } catch (e) { /* none */ }
    if (!d) { var raw = lsGet('acelabs_test_date'); if (raw) { try { var j = JSON.parse(raw); d = typeof j === 'string' ? j : null; } catch (e) { d = raw; } } }
    if (!d || !/^\d{4}-\d{2}-\d{2}/.test(d)) return null;
    var t = new Date(d.slice(0, 10) + 'T00:00:00'), now = new Date(); now.setHours(0, 0, 0, 0);
    if (isNaN(t)) return null;
    var n = Math.round((t - now) / 86400000);
    return n >= 0 && n < 1000 ? n : null;
  }
  /* The same rule ace-labs.html uses: a coach link (?student=) or the portal's ace_who cookie means
     this student already has a coach to message. A signed-in portal session counts too. */
  function fromPortal() {
    try { if (new URLSearchParams(location.search).get('student')) return true; } catch (e) { /* old browser */ }
    try { if (/(?:^|;\s*)ace_who=/.test(document.cookie || '')) return true; } catch (e) { /* no cookies */ }
    return !!lsGet('ace.v1.session');
  }

  /* ---------------- the three weakest areas ---------------- */
  function rank(areas) {
    var all = (areas || []).filter(function (a) { return a && a.total > 0 && a.correct < a.total; });
    // A smoothed miss rate, so 0 of 1 does not outrank 5 of 15 on luck alone; more points lost breaks ties.
    function score(a) { return (a.correct + 1) / (a.total + 2); }
    all.sort(function (a, b) { return score(a) - score(b) || (b.total - b.correct) - (a.total - a.correct); });
    // Prefer areas with at least 3 questions behind them, and no more than 2 from one section,
    // as long as that still leaves three to show.
    var solid = all.filter(function (a) { return a.total >= 3; });
    var pool = solid.length >= 3 ? solid : all, out = [], per = {};
    pool.forEach(function (a) { if (out.length < 3 && (per[a.section] || 0) < 2) { out.push(a); per[a.section] = (per[a.section] || 0) + 1; } });
    pool.forEach(function (a) { if (out.length < 3 && out.indexOf(a) < 0) out.push(a); });
    return out;
  }

  /* WHY: the strongest pattern in that area's misses. Order: blanks, a repeated trap, pace, concept. */
  function why(a) {
    var miss = a.total - a.correct;
    var t = a.traps && a.traps[0];
    var timed = (a.missSec || []).filter(function (s) { return s > 0; });
    var avg = timed.length ? timed.reduce(function (x, y) { return x + y; }, 0) / timed.length : 0;
    if (a.blank && a.blank * 2 >= miss) {
      return { tag: 'Clock', tone: 'clock', text: (a.blank === miss ? (miss === 1 ? 'Your miss here was' : 'All ' + miss + ' misses here were') : a.blank + ' of your ' + miss + ' misses here ' + (a.blank === 1 ? 'was' : 'were')) + ' left blank. The clock got there first, so part of the fix is pace: a quick guess beats a blank.' };
    }
    if (t && t.count >= 2) {
      return { tag: 'Trap', tone: 'trap', text: (t.count === miss ? 'All ' + miss + ' of your misses' : t.count + ' of your ' + miss + ' misses') + ' picked the same trap: ' + String(t.label).toLowerCase() + '. Learn what that wrong answer looks like and it stops working on you.' };
    }
    if (avg && a.paceSec && avg < a.paceSec * 0.5) {
      return { tag: 'Rushed', tone: 'clock', text: 'You spent about ' + secs(avg) + ' on each miss here, against a pace of about ' + secs(a.paceSec) + '. These went by too fast: slow down on the read and name what the question asks.' };
    }
    if (avg && a.paceSec && avg > a.paceSec * 1.5) {
      return { tag: 'Slow method', tone: 'clock', text: 'Each miss took about ' + secs(avg) + ', against a pace of about ' + secs(a.paceSec) + '. The method is not automatic yet, so it costs time and still slips.' };
    }
    if (t) {
      return { tag: 'Trap', tone: 'trap', text: 'You missed ' + miss + ' of ' + a.total + '. One pick fell for ' + String(t.label).toLowerCase() + '; the rest point to the concept itself. Rebuild it, then drill.' };
    }
    return { tag: 'Concept', tone: 'concept', text: 'You missed ' + miss + ' of ' + a.total + (avg && a.paceSec ? ', at about ' + secs(avg) + ' a question, so the clock was not the problem' : '') + '. The concept itself needs a rebuild: learn it once properly, then drill it.' };
  }

  function ring(a, color) {
    var p = a.total ? a.correct / a.total : 0, r = 22, C = 2 * Math.PI * r;
    return '<svg class="anx-ring" viewBox="0 0 56 56" width="56" height="56" aria-hidden="true">' +
      '<circle cx="28" cy="28" r="' + r + '" fill="none" stroke="rgba(27,58,45,.12)" stroke-width="6"/>' +
      (p > 0 ? '<circle cx="28" cy="28" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="6" stroke-linecap="round" stroke-dasharray="' + (C * p).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 28 28)"/>' : '') +
      '<text x="28" y="27" text-anchor="middle" font-size="13" font-weight="700" fill="#0d2018">' + a.correct + '</text>' +
      '<text x="28" y="39" text-anchor="middle" font-size="9" fill="#5c6a63">of ' + a.total + '</text></svg>';
  }

  function areaCard(a, i) {
    var s = SEC[a.section] || { name: a.section, c: '#8C7235' }, w = why(a);
    var links = '';
    if (a.learn && a.learn.href) links += '<a class="anx-link anx-link--learn" href="' + esc(a.learn.href) + '"><span class="anx-link__k">Learn it</span><span class="anx-link__t">' + esc(a.learn.label) + '</span></a>';
    if (a.drill && a.drill.href) links += '<a class="anx-link" href="' + esc(a.drill.href) + '"><span class="anx-link__k">Drill it</span><span class="anx-link__t">' + esc(a.drill.label) + '</span></a>';
    return '<li class="anx-area" style="--anx-c:' + s.c + '" data-section="' + esc(a.section) + '">' +
      '<div class="anx-area__top"><span class="anx-rank" aria-hidden="true">' + (i + 1) + '</span>' +
      '<div class="anx-area__name"><span class="anx-area__sec">' + esc(s.name) + '</span><b>' + esc(a.label) + '</b></div>' + ring(a, s.c) + '</div>' +
      '<p class="anx-why"><span class="anx-tag anx-tag--' + w.tone + '">' + esc(w.tag) + '</span>' + esc(w.text) + '</p>' +
      (links ? '<div class="anx-links">' + links + '</div>' : '') + '</li>';
  }

  /* ---------------- this week ---------------- */
  function week(top, o, days) {
    var steps = [], a1 = top[0], a2 = top[1], a3 = top[2];
    var short = function (a) { return a.label; };
    if (a1 && a1.learn) steps.push({ when: 'Day 1', title: 'Learn ' + short(a1), detail: 'One focused lesson, about 30 minutes. Predict before each reveal.', href: a1.learn.href, cta: a1.learn.label });
    if (a1 && a1.drill) steps.push({ when: 'Day 2', title: 'Drill ' + short(a1), detail: '15 to 20 questions, untimed first, then one timed set.', href: a1.drill.href, cta: a1.drill.label });
    if (a2) {
      var more = a3 ? ' Then ' + short(a3) + ' the same way.' : '';
      var l2 = a2.learn || a2.drill;
      steps.push({ when: a3 ? 'Days 3 and 4' : 'Day 3', title: 'Same two steps for ' + short(a2), detail: 'Lesson first, then the drill.' + more, href: l2 && l2.href, cta: l2 && l2.label });
    }
    steps.push({ when: steps.length >= 3 ? 'Day 5' : 'Day ' + (steps.length + 1), title: 'Clear Repair', detail: 'Every miss from this test comes back as a new version. Beat each one twice on different days.', href: '/repair/', cta: 'Open Repair' });
    if (days != null && days <= 7) steps.push({ when: 'Test week', title: 'Switch to the test-week plan', detail: 'Your DAT is ' + (days === 0 ? 'today' : 'in ' + plural(days, 'day')) + '. Light review, real sleep, no new material.', href: '/test-week.html', cta: 'Open the test-week plan' });
    else if (o.retest && o.retest.href) steps.push({ when: 'Day 6 or 7', title: o.retest.label, detail: o.retest.detail || 'See whether the fixes held, under the clock.', href: o.retest.href, cta: o.retest.cta || 'Start' });
    return steps.slice(0, 5);
  }

  /* ---------------- coach card ---------------- */
  function coachCard(top, o, days) {
    var portal = fromPortal();
    var weak = o.pct != null && o.pct < 0.6;
    var soon = days != null && days <= 30;
    var names = top.map(function (a) { return a.label; });
    var list = names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : (names[0] || '');
    var href = portal ? PORTAL_MSG : CONTACT, cta = portal ? 'Message your coach' : 'Ask about a session';
    if (!(weak || soon)) {
      return '<aside class="anx-coach anx-coach--light" aria-label="Coaching"><p>' +
        (portal ? 'Bring ' + (list ? esc(list) : 'this report') + ' to your next session.' : 'Want a second set of eyes on ' + (list ? esc(list) : 'this report') + '? Tommy, AceTheDAT coach (510 AA, 99th percentile), works with students 1:1.') +
        '</p><p class="anx-coach__go"><a href="' + href + '" target="_blank" rel="noopener">' + cta + '</a></p></aside>';
    }
    var lead = portal
      ? 'Send your coach this report\'s three weak spots' + (list ? ': ' + esc(list) : '') + '. Your next session can start right there.'
      : 'Tommy, AceTheDAT coach (510 AA, 99th percentile), can take this report and start a 1:1 session where the points went' + (list ? ': ' + esc(list) : '') + '.';
    var why2 = soon
      ? 'Your DAT is ' + (days === 0 ? 'today' : 'in ' + plural(days, 'day')) + '. A session now can set the order for the time you have left.'
      : 'When the same areas keep coming back, a second set of eyes on how you work the question is often the fastest fix.';
    return '<aside class="anx-coach" aria-label="Coaching">' +
      '<div class="anx-coach__body"><p class="anx-kicker anx-kicker--gold">' + (portal ? 'Your coach' : '1:1 coaching') + '</p>' +
      '<h3 class="anx-coach__h">' + (portal ? 'Bring this to your coach' : 'Work through this with a coach') + '</h3>' +
      '<p class="anx-coach__p">' + lead + '</p><p class="anx-coach__p anx-coach__p--soft">' + why2 + '</p>' +
      (names.length ? '<ul class="anx-chips">' + top.map(function (a) { return '<li style="--anx-c:' + ((SEC[a.section] || {}).c || '#C9A84C') + '">' + esc(a.label) + '</li>'; }).join('') + '</ul>' : '') +
      '<div class="anx-coach__row"><a class="anx-btn anx-btn--gold" href="' + href + '" target="_blank" rel="noopener">' + cta + '</a>' +
      '<span class="anx-coach__note">' + (portal ? 'Opens your portal messages.' : 'No pressure: the plan above works on its own.') + '</span></div></div></aside>';
  }

  /* ---------------- styles ---------------- */
  var CSS = [
    '.anx{--anx-ink:#0d2018;--anx-ink2:#3a4a42;--anx-ink3:#5c6a63;--anx-paper:#FCFAF6;--anx-well:#F7F1E4;--anx-line:rgba(27,58,45,.16);--anx-gold:#C9A84C;--anx-brass:#7c6113;--anx-forest:#1B3A2D;',
    'font-family:"DM Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--anx-ink);font-size:16px;line-height:1.55;margin:28px 0 8px;text-align:left}',
    '.anx *{box-sizing:border-box}',
    '.anx h2,.anx h3{font-family:"Playfair Display",Georgia,"Times New Roman",serif;font-weight:700;margin:0;color:var(--anx-ink)}',
    '.anx-kicker{font-size:12px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:var(--anx-brass);margin:0 0 6px}',
    '.anx-head{border-left:3px solid var(--anx-gold);padding-left:14px;margin-bottom:16px}',
    '.anx-head h2{font-size:26px;line-height:1.15}',
    '.anx-head p{margin:6px 0 0;color:var(--anx-ink2);max-width:62ch}',
    '.anx-areas{list-style:none;margin:0;padding:0;display:grid;gap:12px;grid-template-columns:1fr}',
    '.anx-area{background:var(--anx-paper);border:1px solid var(--anx-line);border-top:4px solid var(--anx-c);border-radius:14px;padding:14px 16px 16px;display:flex;flex-direction:column;gap:10px;min-width:0}',
    '.anx-area__top{display:flex;align-items:center;gap:12px}',
    '.anx-rank{flex:none;width:30px;height:30px;border-radius:50%;background:var(--anx-c);color:#fff;font-weight:800;font-size:15px;display:flex;align-items:center;justify-content:center}',
    '.anx-area__name{flex:1;min-width:0;display:flex;flex-direction:column}',
    '.anx-area__name b{font-size:17px;line-height:1.3;overflow-wrap:anywhere}',
    '.anx-area__sec{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--anx-ink3);font-weight:700}',
    '.anx-ring{flex:none}',
    '.anx-why{margin:0;color:var(--anx-ink2);font-size:15px}',
    '.anx-tag{display:inline-block;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;border-radius:999px;padding:2px 9px;margin-right:8px;vertical-align:1px}',
    '.anx-tag--clock{background:rgba(201,168,76,.22);color:#6e5a22}',
    '.anx-tag--trap{background:rgba(213,94,0,.12);color:#9b4500}',
    '.anx-tag--concept{background:rgba(47,95,158,.12);color:#2f5f9e}',
    '.anx-links{display:flex;flex-direction:column;gap:8px;margin-top:auto}',
    '.anx-link{display:flex;flex-direction:column;justify-content:center;min-height:48px;padding:8px 12px;border:1px solid var(--anx-line);border-radius:10px;background:#fff;text-decoration:none;color:var(--anx-ink)}',
    '.anx-link:hover,.anx-link:focus-visible{border-color:var(--anx-c);outline:none;box-shadow:0 0 0 3px rgba(201,168,76,.25)}',
    '.anx-link--learn{background:var(--anx-well)}',
    '.anx-link__k{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--anx-c)}',
    '.anx-link__t{font-size:15px;font-weight:600;line-height:1.3;overflow-wrap:anywhere}',
    '.anx-week{margin:22px 0 0;background:var(--anx-paper);border:1px solid var(--anx-line);border-radius:14px;padding:16px 16px 6px}',
    '.anx-week h3{font-size:21px}',
    '.anx-week__sub{margin:4px 0 10px;color:var(--anx-ink3);font-size:14px}',
    '.anx-steps{list-style:none;margin:0;padding:0;counter-reset:anx}',
    '.anx-step{position:relative;display:grid;grid-template-columns:34px 1fr;gap:0 12px;padding:10px 0 14px}',
    '.anx-step:not(:last-child)::before{content:"";position:absolute;left:16px;top:44px;bottom:-2px;width:2px;background:rgba(201,168,76,.45)}',
    '.anx-step__n{counter-increment:anx;width:34px;height:34px;border-radius:50%;border:2px solid var(--anx-gold);background:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;color:var(--anx-brass)}',
    '.anx-step__n::before{content:counter(anx)}',
    '.anx-step__when{font-size:12px;letter-spacing:.1em;text-transform:uppercase;font-weight:800;color:var(--anx-brass)}',
    '.anx-step__t{display:block;font-weight:700;font-size:16px;margin:1px 0 2px}',
    '.anx-step__d{margin:0;color:var(--anx-ink2);font-size:15px}',
    '.anx-step__a{display:inline-flex;align-items:center;min-height:44px;color:#1B3A2D;font-weight:700;text-decoration:underline;text-decoration-color:var(--anx-gold);text-underline-offset:3px;overflow-wrap:anywhere}',
    '.anx-plan{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;border-top:1px solid var(--anx-line);margin:4px -16px 0;padding:12px 16px 14px}',
    '.anx-plan p{margin:0;flex:1 1 220px;color:var(--anx-ink2);font-size:15px}',
    '.anx-btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:10px 18px;border-radius:10px;font-weight:700;font-size:16px;text-decoration:none;border:1px solid var(--anx-forest);color:var(--anx-forest);background:#fff}',
    '.anx-btn:hover,.anx-btn:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(201,168,76,.35)}',
    '.anx-btn--forest{background:var(--anx-forest);color:#F5F0E8}',
    '.anx-btn--gold{background:var(--anx-gold);border-color:var(--anx-gold);color:#16120A}',
    '.anx-coach{margin:22px 0 0;border-radius:16px;background:radial-gradient(120% 140% at 100% 0%,#2A5240 0%,#1B3A2D 55%,#122a20 100%);color:#F5F0E8;overflow:hidden;border:1px solid rgba(201,168,76,.35)}',
    '.anx-coach__body{padding:18px 18px 18px}',
    '.anx-kicker--gold{color:#E2C97A}',
    '.anx .anx-coach__h{color:#F5F0E8;font-size:23px;line-height:1.2}',
    '.anx-coach__p{margin:8px 0 0;color:#ECE6D7;max-width:62ch}',
    '.anx-coach__p--soft{color:#C9C3B4;font-size:15px}',
    '.anx-chips{list-style:none;margin:12px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:8px}',
    '.anx-chips li{font-size:14px;font-weight:600;padding:5px 11px;border-radius:999px;background:rgba(245,240,232,.10);border:1px solid rgba(245,240,232,.22);border-left:4px solid var(--anx-c);max-width:100%;overflow-wrap:anywhere}',
    '.anx-coach__row{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;margin-top:16px}',
    '.anx-coach__note{font-size:14px;color:#C9C3B4}',
    '.anx-coach--light{background:var(--anx-paper);color:var(--anx-ink2);border:1px solid var(--anx-line);border-left:3px solid var(--anx-gold);border-radius:12px;padding:6px 16px}',
    '.anx-coach--light p{margin:10px 0 0;font-size:15px}.anx-coach--light .anx-coach__go{margin:0 0 2px}',
    '.anx-coach--light a{color:#1B3A2D;font-weight:700;display:inline-flex;align-items:center;min-height:44px}',
    '.anx{container-type:inline-size}',
    '@container (min-width:600px){.anx-head h2{font-size:30px}.anx-coach__body{padding:22px 24px}}',
    '@container (min-width:820px){.anx-areas{grid-template-columns:repeat(3,minmax(0,1fr))}.anx--one .anx-areas{grid-template-columns:1fr}',
    '.anx-grid2{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:16px;align-items:start}.anx-grid2 .anx-week,.anx-grid2 .anx-coach{margin-top:22px}}',
    '@container (min-width:760px){.anx-week--wide .anx-steps{display:grid;grid-template-columns:repeat(var(--anx-n),minmax(0,1fr));gap:0 16px}',
    '.anx-week--wide .anx-step{grid-template-columns:1fr;grid-template-rows:auto 1fr;gap:10px;padding:10px 0 12px}',
    '.anx-week--wide .anx-step:not(:last-child)::before{left:44px;right:-12px;top:27px;bottom:auto;width:auto;height:2px}}',
    '@media print{.anx-coach{display:none}}'
  ].join('');
  function css() {
    if (document.getElementById('anx-css')) return;
    var s = document.createElement('style'); s.id = 'anx-css'; s.textContent = CSS; (document.head || document.documentElement).appendChild(s);
  }

  /* The report's top focus goes two places: the last-report cache, and the saved study plan
     (acelabs_plan_v1, input.focus), so the plan and Home point at the same thing the report does. */
  function localDate() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function link(l) { return l && l.href ? { href: String(l.href), label: String(l.label || '') } : null; }
  function remember(o, top) {
    var focus = { src: o.src || 'test', title: o.title || '', date: localDate(), at: Date.now(), pct: o.pct == null ? null : Math.round(o.pct * 100) / 100,
      areas: top.map(function (a) { return { section: a.section, label: a.label, correct: a.correct, total: a.total, learn: link(a.learn), drill: link(a.drill) }; }) };
    var inPlan = false;
    try { localStorage.setItem(K_LAST, JSON.stringify(focus)); } catch (e) { /* cache only */ }
    try {
      var st = JSON.parse(localStorage.getItem(K_PLAN) || 'null');
      if (st && st.input) {
        if (top.length) st.input.focus = { src: focus.src, title: focus.title, date: focus.date, areas: focus.areas };
        else delete st.input.focus;
        localStorage.setItem(K_PLAN, JSON.stringify(st));
        inPlan = top.length > 0;
      }
    } catch (e) { /* the plan page reads the cache instead */ }
    return inPlan;
  }

  function render(host, o) {
    if (!host) return null;
    o = o || {};
    css();
    var top = rank(o.areas), days = daysToTest();
    var inPlan = remember(o, top);
    var h = '<section class="anx' + (top.length === 1 ? ' anx--one' : '') + '" aria-labelledby="anx-h">';
    if (!top.length) {
      h += '<div class="anx-head"><p class="anx-kicker">What to do next</p><h2 id="anx-h">Nothing missed. Keep it warm.</h2><p>No weak area showed up on this one. Keep each section warm with one short set a week, and take the next test under the clock.</p></div>';
      if (o.retest && o.retest.href) h += '<p><a class="anx-btn anx-btn--forest" href="' + esc(o.retest.href) + '">' + esc(o.retest.label) + '</a></p>';
      h += '</section>';
      host.innerHTML = h;
      return { top: top, days: days };
    }
    h += '<div class="anx-head"><p class="anx-kicker">What to do next</p><h2 id="anx-h">Your ' + (top.length === 1 ? 'weakest area' : ['', '', 'two', 'three'][top.length] + ' weakest areas') + ', and the fix</h2>' +
      '<p>Ranked from this test\'s raw counts. Each one says why the points went and opens the exact page that fixes it.' +
      (top.every(function (a) { return a.total <= 2; }) ? ' Each rests on one or two questions, so the drill doubles as a check.' : '') + '</p></div>';
    h += '<ol class="anx-areas">' + top.map(areaCard).join('') + '</ol>';
    var steps = week(top, o, days), coach = coachCard(top, o, days), light = /anx-coach--light/.test(coach);
    h += '<div class="' + (light ? 'anx-stack' : 'anx-grid2') + '"><div class="anx-week' + (light ? ' anx-week--wide' : '') + '" style="--anx-n:' + steps.length + '"><p class="anx-kicker">This week</p><h3>' + plural(steps.length, 'step') + ', in order</h3>' +
      '<p class="anx-week__sub">' + (days != null ? 'Your DAT is ' + (days === 0 ? 'today' : 'in ' + plural(days, 'day')) + '.' : 'About 45 to 60 minutes a day.') + ' Do them in this order; each one builds on the last.</p><ol class="anx-steps">' +
      steps.map(function (s) {
        return '<li class="anx-step"><span class="anx-step__n" aria-hidden="true"></span><div><span class="anx-step__when">' + esc(s.when) + '</span><span class="anx-step__t">' + esc(s.title) + '</span><p class="anx-step__d">' + esc(s.detail) + '</p>' +
          (s.href ? '<a class="anx-step__a" href="' + esc(s.href) + '">' + esc(s.cta || 'Open') + '</a>' : '') + '</div></li>';
      }).join('') + '</ol>' +
      (inPlan ? '<div class="anx-plan" data-anx-inplan><p>Added to your plan. Your next study days start with ' + esc(top[0].label) + '.</p><a class="anx-btn anx-btn--forest" data-anx-plan href="' + PLAN + '">See my plan</a></div></div>'
        : '<div class="anx-plan"><p>Want this spread across every day until your test?</p><a class="anx-btn anx-btn--forest" data-anx-plan href="' + PLAN + '">Build my study plan</a></div></div>') +
      coach + '</div>';
    h += '</section>';
    host.innerHTML = h;
    return { top: top, days: days };
  }

  window.AceNextSteps = { version: 1, render: render, rank: rank, why: why, daysToTest: daysToTest, fromPortal: fromPortal, CONTACT: CONTACT, PORTAL_MSG: PORTAL_MSG };
})();
