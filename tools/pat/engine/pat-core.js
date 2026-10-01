/*
  pat-core.js : shared core for the AceTheDAT PAT engine.

  The engine is a set of pure, seeded generators (one file per PAT section)
  plus renderers that turn an item into SVG strings. Everything is plain
  ES5-compatible JavaScript in a UMD wrapper so the same files run in the
  browser (as <script> tags, attaching to window.PAT) and in Node (require),
  which is how the correctness tests and the generator audit exercise them.

  Item contract (every generator returns this shape):
    {
      type:    'keyholes' | 'tfe' | 'angles' | 'holepunch' | 'cubes' | 'patternfold',
      seed:    integer seed that reproduces the item exactly,
      prompt:  short instruction line shown above the figure,
      figure:  renderer data for the stem,
      options: [ { ...renderer data, trap: string|null } ]  (display order),
      answer:  index into options of the single correct choice,
      meta:    analyzer tags (gap sizes, folds, hidden cubes, net type, ...)
    }
*/
(function (root) {
  'use strict';
  var PAT = root.PAT || {};

  /* mulberry32: small, fast, deterministic PRNG. Same algorithm the Studio
     pages use, so a Studio seed and an engine seed mean the same stream. */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Rng helper object with the few draws every generator needs. */
  function makeRng(seed) {
    var r = mulberry32(seed >>> 0);
    var api = {
      next: r,
      int: function (n) { return Math.floor(r() * n); },
      range: function (lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); },
      pick: function (arr) { return arr[Math.floor(r() * arr.length)]; },
      chance: function (p) { return r() < p; },
      shuffle: function (arr) {
        for (var i = arr.length - 1; i > 0; i--) {
          var j = Math.floor(r() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
        return arr;
      }
    };
    return api;
  }

  /* FNV-1a string hash -> uint32, used to derive stable test seeds. */
  function hashStr(s) {
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return h >>> 0;
  }

  /* Derive a child seed from a parent seed and a label, so items inside a
     test are independent streams yet fully reproducible. */
  function childSeed(seed, label) { return hashStr(String(seed >>> 0) + ':' + label); }

  /* Place the correct option at a seeded position and return the new answer index. */
  function placeAnswer(rng, correct, distractors) {
    var opts = distractors.slice();
    var at = rng.int(opts.length + 1);
    opts.splice(at, 0, correct);
    return { options: opts, answer: at };
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  PAT.core = {
    mulberry32: mulberry32,
    makeRng: makeRng,
    hashStr: hashStr,
    childSeed: childSeed,
    placeAnswer: placeAnswer,
    esc: esc
  };
  PAT.LETTERS = ['A', 'B', 'C', 'D', 'E'];

  /* Section table: the real PAT order, 15 items each, 90 in 60 minutes. */
  PAT.SECTIONS = [
    { type: 'keyholes',    name: 'Keyholes',         short: 'Keyholes',  from: 1,  to: 15, choices: 5 },
    { type: 'tfe',         name: 'Top Front End',    short: 'TFE',       from: 16, to: 30, choices: 4 },
    { type: 'angles',      name: 'Angle Ranking',    short: 'Angles',    from: 31, to: 45, choices: 4 },
    { type: 'holepunch',   name: 'Hole Punching',    short: 'Hole Punch',from: 46, to: 60, choices: 5 },
    { type: 'cubes',       name: 'Cube Counting',    short: 'Cubes',     from: 61, to: 75, choices: 5 },
    { type: 'patternfold', name: 'Pattern Folding',  short: 'Pattern',   from: 76, to: 90, choices: 4 }
  ];

  root.PAT = PAT;
  if (typeof module === 'object' && module.exports) module.exports = PAT;
})(typeof self !== 'undefined' ? self : globalThis);
