/*
  pat-ledger.js — the PAT studio's shared progress tracker, the local-only
  equivalent of the OChem ledger. Each module records one result per graded
  drill answer; the hub reads the aggregate to show accuracy, best streak, and
  last session per module. Pure localStorage - the studio has no backend, and
  practice drills are volume, not the coach's session record.
*/
(function () {
  function key(mod) { return 'atDAT_pat_' + mod; }
  function read(mod) {
    try { return JSON.parse(localStorage.getItem(key(mod)) || '{}'); } catch (e) { return {}; }
  }
  window.PatLedger = {
    record: function (mod, ok) {
      var s = read(mod);
      s.attempts = (s.attempts || 0) + 1;
      if (ok) {
        s.correct = (s.correct || 0) + 1;
        s.streak = (s.streak || 0) + 1;
        if (s.streak > (s.best || 0)) s.best = s.streak;
      } else {
        s.streak = 0;
      }
      s.lastTs = Date.now();
      try { localStorage.setItem(key(mod), JSON.stringify(s)); } catch (e) {}
      return s;
    },
    read: read,
    summary: function (mod) {
      var s = read(mod);
      if (!s.attempts) return null;
      return {
        attempts: s.attempts,
        correct: s.correct || 0,
        acc: Math.round((s.correct || 0) / s.attempts * 100),
        best: s.best || 0,
        lastTs: s.lastTs || 0
      };
    }
  };
})();
