/* =====================================================================
   The coach line library (served as shared/ace-coach-lines.js?v=1).
   window.AceCoachLines: the one place the coach band's line comes from.

   DRAFTS FOR THOMAS. Every line below was drafted from the voice codex
   (question-system/voice-codex.md: short declaratives, straight to the
   move, misses as information, "in the bank", "same idea in different
   clothes") and is marked approved: false. Students see a slot's plain
   fallback until Thomas approves a line in that slot (flip approved to
   true, or rewrite the text in his own words). Coaches preview the
   drafts in place with ?coach=1.

     AceCoachLines.pick(slot, vars, opts) -> { id, slot, text, html, approved, draft, fallback }
       opts.seed   picks the same line all day (todayPlan passes the date)
       opts.drafts true shows unapproved lines (default: only with ?coach=1)
     AceCoachLines.fill(text, vars) / html(text, vars)
     AceCoachLines.check(line) -> [problems]; checkAll() -> [problems]
     AceCoachLines.checkSource(source) -> [problems]

   Template syntax: {name} is a slot variable (filled in plain text, escaped
   in HTML); [words] marks the one phrase the band sets in gold (<em>).
   A filled line starts with a capital letter.

   Source-line rules (the coach band's second line; SOURCE_RULES below):
   an auto-built line always carries an auto source line naming what it
   was built from; a portal note is quoted verbatim and signed, never
   paraphrased; no line ever presents itself as written by Thomas that
   morning. AceProgress.todayPlan() builds the source lines.
   ===================================================================== */
(function () {
  'use strict';
  if (window.AceCoachLines) return;

  /* Where each slot is used, its variables, and the plain fallback students
     see until a line in the slot is approved. Fallbacks state facts only;
     they are not written in Thomas's voice. */
  var SLOTS = {
    'first-visit': { when: 'A new student, nothing set up; step 1 is the first call (Tonicity).', vars: [], fallback: 'Your first call is below.' },
    'first-after-loop': { when: 'The first loop is done; three questions come next.', vars: [], fallback: 'Three questions, then your plan.' },
    'first-plan': { when: 'The plan was just built from the three answers; the diagnostic waits a day.', vars: ['day'], fallback: 'Your plan is below. The diagnostic is {day}.' },
    'play-then-cards': { when: 'Step 1 is a call, then Ace Cards back today.', vars: ['topic', 'cards'], fallback: 'One call on {topic}, then {cards}.' },
    'play-then-learn': { when: 'Step 1 is a call, then a Retold night (no cards due). {lesson} is the night, e.g. "GChem, Retold: night 12".', vars: ['topic', 'lesson'], fallback: 'One call on {topic}, then {lesson}.' },
    'play-only': { when: 'A short day: the call is the plan.', vars: ['topic'], fallback: 'One call on {topic} today.' },
    'cards-heavy': { when: 'More cards are due than the daily cap.', vars: ['topic', 'cards'], fallback: 'One call on {topic}, then {cards}.' },
    'after-call': { when: 'Step 1 is done, both calls confirmed; the next step is named.', vars: ['next'], fallback: 'Next: {next}.' },
    'replan': { when: 'A Needs review on the call added one scene and moved a step to tomorrow.', vars: ['night', 'why', 'moved'], fallback: 'One scene from {night} comes next. {moved} moves to tomorrow.' },
    'replan-stay': { when: 'A Needs review on the call added one scene; nothing had to move.', vars: ['night', 'why'], fallback: 'One scene from {night} comes next.' },
    'diagnostic-today': { when: 'The diagnostic is on today\'s plan.', vars: ['topic'], fallback: 'One call, then the diagnostic.' },
    'welcome-back': { when: 'The student is back after four or more days away. No guilt, no catch-up talk.', vars: ['topic'], fallback: 'One call on {topic} to start.' },
    'test-week': { when: 'Test-week mode (from 14 days out): one timed section a day, no new nights.', vars: ['section'], fallback: 'One timed section today: {section}.' },
    'taper': { when: 'The last three days before the test.', vars: [], fallback: 'A light day: one call and your cards.' },
    'coach-plan': { when: 'The portal has a weekly plan from the coach; its note is quoted and signed beside this line.', vars: [], fallback: 'Today follows your coach\'s weekly plan.' },
    'all-done': { when: 'Every step on today\'s plan is done.', vars: [], fallback: 'That is today.' },
    'going-again': { when: 'A student going again (a retake), on the first plan.', vars: [], fallback: 'Your plan starts from your misses.' }
  };

  /* About 40 drafts, a few per slot. pattern: the codex move each one uses. */
  var LINES = [
    { id: 'fv-1', slot: 'first-visit', text: 'Before anything, [call this one.]', pattern: 'straight to the move', approved: false },
    { id: 'fv-2', slot: 'first-visit', text: 'No setup yet. [Make one call first.]', pattern: 'do not X yet', approved: false },
    { id: 'fv-3', slot: 'first-visit', text: 'Start with the picture. [Call it, then watch.]', pattern: 'imperatives for steps', approved: false },

    { id: 'fa-1', slot: 'first-after-loop', text: 'You just ran the loop. Three questions, [and the plan is yours.]', pattern: 'states progress plainly, once', approved: false },
    { id: 'fa-2', slot: 'first-after-loop', text: 'That is the whole loop. [Three quick answers next.]', pattern: 'the whole game in one line', approved: false },

    { id: 'fp-1', slot: 'first-plan', text: 'Here is today. The diagnostic waits [until {day}.]', pattern: 'here is', approved: false },
    { id: 'fp-2', slot: 'first-plan', text: 'Light start today. [The diagnostic is {day}.]', pattern: 'short declaratives', approved: false },
    { id: 'fp-3', slot: 'first-plan', text: 'Your plan is built. [It changes as you work.]', pattern: 'low-pressure', approved: false },

    { id: 'pc-1', slot: 'play-then-cards', text: '{topic} first, [then {cards}.]', pattern: 'short declaratives', approved: false },
    { id: 'pc-2', slot: 'play-then-cards', text: 'One call on {topic} first, [then {cards}.]', pattern: 'straight to the move', approved: false },
    { id: 'pc-3', slot: 'play-then-cards', text: 'Warm up on {topic}. [Then {cards}.]', pattern: 'imperatives for steps', approved: false },
    { id: 'pc-4', slot: 'play-then-cards', text: 'Call it first on {topic}. [Then {cards}, one at a time.]', pattern: 'imperatives for steps', approved: false },

    { id: 'pl-1', slot: 'play-then-learn', text: 'One call on {topic}, [then {lesson}.]', pattern: 'straight to the move', approved: false },
    { id: 'pl-2', slot: 'play-then-learn', text: 'Call it first on {topic}. [Then a new night.]', pattern: 'short declaratives', approved: false },
    { id: 'pl-3', slot: 'play-then-learn', text: 'Predict first, then read. [{lesson} is next.]', pattern: 'do not X yet', approved: false },

    { id: 'po-1', slot: 'play-only', text: 'Short day. [One call on {topic} is enough.]', pattern: 'low-pressure', approved: false },
    { id: 'po-2', slot: 'play-only', text: 'One call on {topic}. [That is a real rep.]', pattern: 'encourage through the method', approved: false },

    { id: 'ch-1', slot: 'cards-heavy', text: 'Cards first today. [Misses are information.]', pattern: 'normalizes misses', approved: false },
    { id: 'ch-2', slot: 'cards-heavy', text: 'A full stack today. [Each card is the same idea in new clothes.]', pattern: 'same mistake in different clothes', approved: false },

    { id: 'ac-1', slot: 'after-call', text: 'That call is in the bank. [Next: {next}.]', pattern: 'bank', approved: false },
    { id: 'ac-2', slot: 'after-call', text: 'Call done. [Next up: {next}.]', pattern: 'short declaratives', approved: false },
    { id: 'ac-3', slot: 'after-call', text: 'Loop done. [Next: {next}.]', pattern: 'short declaratives', approved: false },

    { id: 'rp-1', slot: 'replan', text: 'Same idea, different clothes. [One scene from {night} first.]', pattern: 'same mistake in different clothes', approved: false },
    { id: 'rp-2', slot: 'replan', text: 'That call found the gap. [One scene from {night} comes first.]', pattern: 'a miss is information', approved: false },
    { id: 'rp-3', slot: 'replan', text: 'A miss is information. [{moved} can wait for tomorrow.]', pattern: 'normalizes misses', approved: false },

    { id: 'rs-1', slot: 'replan-stay', text: 'A miss is information. [One scene from {night}, then on.]', pattern: 'normalizes misses', approved: false },
    { id: 'rs-2', slot: 'replan-stay', text: 'Better here than on test day. [One scene from {night} first.]', pattern: 'takes the blame off the student', approved: false },

    { id: 'dg-1', slot: 'diagnostic-today', text: 'Today is the diagnostic. [It is a map, not a score.]', pattern: 'reframe, then the rule', approved: false },
    { id: 'dg-2', slot: 'diagnostic-today', text: 'One call, then the diagnostic. [Untimed. It shows where to start.]', pattern: 'short declaratives', approved: false },
    { id: 'dg-3', slot: 'diagnostic-today', text: 'Unfamiliar material is expected. [The diagnostic is a starting point.]', pattern: 'encourage through the process', approved: false },

    { id: 'wb-1', slot: 'welcome-back', text: 'Good to see you. [Start with one call on {topic}.]', pattern: 'warm, then the move', approved: false },
    { id: 'wb-2', slot: 'welcome-back', text: 'Pick up where you left off. [One call on {topic} first.]', pattern: 'low-pressure', approved: false },

    { id: 'tw-1', slot: 'test-week', text: 'Test week. [One timed section today: {section}.]', pattern: 'straight to the move', approved: false },
    { id: 'tw-2', slot: 'test-week', text: 'No new nights now. [Sharpen what you have.]', pattern: 'do not X yet', approved: false },
    { id: 'tw-3', slot: 'test-week', text: 'Lighter days from here. [One timed section, then your cards.]', pattern: 'low-pressure', approved: false },
    { id: 'tw-4', slot: 'test-week', text: 'Same screen as test day. [{section}, then the explainers.]', pattern: 'sounds like someone who just took the test', approved: false },

    { id: 'tp-1', slot: 'taper', text: 'Light day. [Trust the work in the bank.]', pattern: 'bank', approved: false },
    { id: 'tp-2', slot: 'taper', text: 'Keep it short today. [Cards, then rest.]', pattern: 'low-pressure', approved: false },
    { id: 'tp-3', slot: 'taper', text: 'Nothing new now. [Read it, then answer. Same as always.]', pattern: 'read it, then answer', approved: false },

    { id: 'cp-1', slot: 'coach-plan', text: 'This week\'s plan is in. [Today\'s piece is below.]', pattern: 'short declaratives', approved: false },
    { id: 'cp-2', slot: 'coach-plan', text: 'The weekly plan sets the order. [Start with step 1.]', pattern: 'straight to the move', approved: false },

    { id: 'ad-1', slot: 'all-done', text: 'That is today. [Your cards come back on schedule.]', pattern: 'states progress plainly, once', approved: false },
    { id: 'ad-2', slot: 'all-done', text: 'Plan done. [Rest counts too.]', pattern: 'low-pressure', approved: false },
    { id: 'ad-3', slot: 'all-done', text: 'Done for today. [Tomorrow picks up from here.]', pattern: 'low-pressure', approved: false },

    { id: 'ga-1', slot: 'going-again', text: 'Going again is a fresh start. [The misses lead this time.]', pattern: 'reframe, then the rule', approved: false },
    { id: 'ga-2', slot: 'going-again', text: 'Second time through, the method changes. [Start with one call.]', pattern: 'method over effort', approved: false }
  ];

  var SOURCE_RULES = [
    'An auto-built line always carries an auto source line ({ kind: "auto" }) that names what the plan was built from: your diagnostic, your cards due today, your test date, your call.',
    'A portal note is quoted verbatim and signed ({ kind: "coach", text, sign }), never paraphrased and never merged into a line.',
    'No line presents itself as written by Thomas that morning: no first person, no "this morning", no "I wrote".',
    'A re-plan says what changed and why in one sentence, with the source "Changed just now, from your call."',
    'No loss framing ("cost you", "fall behind", "running out"), no countdowns ("N days left"), no streaks, points or scores as grades.',
    'Plain ASCII, no em or en dashes, no exclamation marks, no emoji; never wrong, incorrect or failed.'
  ];

  /* ---------- the copy rules every line (and every fallback) must pass ---------- */
  var BANNED = /\b(wrong|incorrect|fail(ed|s|ure|ing)?|streaks?|points|xp|leaderboards?|best score|high score|percent(ile)?|countdown|days? (left|to go)|hurry|behind|lose|losing|lost|cost you|too late|running out|last chance|only \d+|great job|you got this|amazing|awesome|perfect)\b/i;
  function firstPerson(t) {
    var m = /\b(I|I'm|I've|I'd|I'll)\b/.exec(t) || /\b(me|my|mine|we|we're|us|our|ours)\b|this morning|just wrote/i.exec(t);
    return m ? m[0] : null;
  }
  var SAMPLE = { topic: 'osmosis', cards: 'your three cards', lesson: 'GChem, Retold: night 12', night: 'night 12', next: '3 Ace Cards back today', why: 'you called the salty-water picture for pure water',
    moved: 'The Climb: today\'s queue', day: 'Saturday', section: 'Bio check: Full (40)' };
  function varsOf(text) {
    var out = [], m, re = /\{([a-z]+)\}/g;
    while ((m = re.exec(text))) if (out.indexOf(m[1]) < 0) out.push(m[1]);
    return out;
  }
  function check(line) {
    var p = [], t = line && line.text, slot = line && SLOTS[line.slot];
    if (!line || typeof t !== 'string' || !t) return ['missing text'];
    if (!slot) p.push('unknown slot ' + line.slot);
    if (/[^\x20-\x7e]/.test(t)) p.push('non-ASCII character');
    if (/--/.test(t)) p.push('double hyphen (a dash)');
    if (/!/.test(t)) p.push('exclamation mark');
    var plain = t.replace(/\{[a-z]+\}/g, 'x').replace(/[[\]]/g, '');
    if (BANNED.test(plain)) p.push('banned word: ' + plain.match(BANNED)[0]);
    if (firstPerson(plain)) p.push('first person or a written-today claim: ' + firstPerson(plain));
    var opens = (t.match(/\[/g) || []).length, closes = (t.match(/\]/g) || []).length;
    if (opens !== closes || opens > 1 || /\][^[]*\]/.test(t) || /\[[^\]]*\[/.test(t)) p.push('at most one [gold phrase], balanced');
    if (slot) varsOf(t).forEach(function (v) { if (slot.vars.indexOf(v) < 0) p.push('variable {' + v + '} is not a ' + line.slot + ' variable'); });
    if (fill(t, SAMPLE).length > 90) p.push('longer than 90 characters with sample values');
    if (line.approved !== true && line.approved !== false) p.push('approved must be true or false');
    return p;
  }
  function checkAll() {
    var out = [], ids = {};
    LINES.forEach(function (l) {
      if (ids[l.id]) out.push(l.id + ': duplicate id');
      ids[l.id] = 1;
      check(l).forEach(function (x) { out.push(l.id + ': ' + x); });
    });
    Object.keys(SLOTS).forEach(function (s) {
      check({ slot: s, text: SLOTS[s].fallback, approved: false }).forEach(function (x) { out.push('fallback ' + s + ': ' + x); });
    });
    return out;
  }
  function checkSource(src) {
    var p = [];
    if (!src || typeof src !== 'object') return ['missing source'];
    if (src.kind !== 'auto' && src.kind !== 'coach') p.push('kind must be auto or coach');
    if (!src.text) p.push('missing text');
    if (src.kind === 'coach' && !src.sign) p.push('a coach note is signed');
    if (src.kind === 'auto') {
      var t = String(src.text || '');
      if (/[^\x20-\x7e]/.test(t)) p.push('non-ASCII character');
      if (BANNED.test(t)) p.push('banned word: ' + t.match(BANNED)[0]);
      if (firstPerson(t)) p.push('first person or a written-today claim');
    }
    return p;
  }

  /* ---------- fill and pick ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function cap(s) { return s.replace(/^(\s*)([a-z])/, function (m, a, b) { return a + b.toUpperCase(); }); }
  function fill(text, vars) {
    vars = vars || {};
    return cap(String(text || '').replace(/\{([a-z]+)\}/g, function (m, k) { return vars[k] == null ? '' : String(vars[k]); }).replace(/[[\]]/g, '').replace(/\s+/g, ' ').trim());
  }
  function html(text, vars) {
    vars = vars || {};
    var out = esc(String(text || '')).replace(/\{([a-z]+)\}/g, function (m, k) { return vars[k] == null ? '' : esc(vars[k]); });
    out = out.replace(/\[([^\]]*)\]/, '<em>$1</em>').replace(/[[\]]/g, '').replace(/\s+/g, ' ').trim();
    return out.replace(/^((?:<em>)?\s*)([a-z])/, function (m, a, b) { return a + b.toUpperCase(); });
  }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; } return h; }
  function draftsOn() {
    try { return /[?&](coach|drafts)=1(&|$)/.test(window.location.search || ''); } catch (e) { return false; }
  }
  function usable(line, vars) {
    return varsOf(line.text).every(function (k) { return vars[k] != null && String(vars[k]) !== ''; });
  }
  function pick(slot, vars, opts) {
    vars = vars || {}; opts = opts || {};
    var def = SLOTS[slot];
    if (!def) return null;
    var drafts = opts.drafts === true || (opts.drafts !== false && (api.previewDrafts === true || draftsOn()));
    var pool = LINES.filter(function (l) { return l.slot === slot && (l.approved === true || drafts) && usable(l, vars); });
    var approved = pool.filter(function (l) { return l.approved === true; });
    if (approved.length && opts.drafts !== true) pool = approved;
    if (!pool.length) {
      return { id: 'fallback:' + slot, slot: slot, text: fill(def.fallback, vars), html: html(def.fallback.replace(/[[\]]/g, ''), vars), approved: false, draft: false, fallback: true };
    }
    var l = pool[hash(String(opts.seed || '') + '|' + slot) % pool.length];
    return { id: l.id, slot: slot, text: fill(l.text, vars), html: html(l.text, vars), approved: l.approved === true, draft: l.approved !== true, fallback: false };
  }

  var api = window.AceCoachLines = {
    version: 1, SLOTS: SLOTS, LINES: LINES, SOURCE_RULES: SOURCE_RULES, SAMPLE: SAMPLE,
    pick: pick, say: pick, fill: fill, html: html, check: check, checkAll: checkAll, checkSource: checkSource,
    lines: function (slot) { return LINES.filter(function (l) { return !slot || l.slot === slot; }); },
    previewDrafts: false
  };
})();
