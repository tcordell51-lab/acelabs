/* Display overrides for full-length mock explanations (CONTENT-FIX, 2026-11).
   Reads content/explainers/why-overrides.json and gives the review screen
   ACE_WHY_OVERRIDES.why(itemId, bankWhy). An override shows only while the
   bank explanation still hashes to the override's bankWhyFnv1a, so a later
   bank edit falls back to the bank's own text. The bank file is never edited.
   An override with a "held" reason (an open key dispute, docs/explainers/
   key-disputes.json) is not shown: the bank's own explanation stays until
   Thomas rules (build spec 1.5, 1.9). */
(function (root) {
  'use strict';
  var URL = '/content/explainers/why-overrides.json';
  var map = null;
  function fnv(s) {
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ('0000000' + h.toString(16)).slice(-8);
  }
  function load(doc) { map = (doc && doc.overrides && typeof doc.overrides === 'object') ? doc.overrides : {}; return map; }
  function why(id, bankWhy) {
    var o = map && map['fm:' + id];
    if (!o || o.held || typeof o.why !== 'string' || typeof bankWhy !== 'string') return bankWhy;
    return fnv(bankWhy) === o.bankWhyFnv1a ? o.why : bankWhy;
  }
  var api = { why: why, load: load, fnv: fnv, url: URL, ready: null };
  if (typeof fetch === 'function' && typeof document !== 'undefined') {
    api.ready = fetch(URL, { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(load, function () { return load(null); });
  }
  root.ACE_WHY_OVERRIDES = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
