/* explainer-lite.js : explainers inside the full-length review (G1-LITE).

   On the review list of Full-Length Test 1 (tools/mock/full.js, report screen),
   each listed question opens its explainer: the picture first, the steps, the
   trap cards, then Lock it in. The bank's own explanation (or its display
   override, why-overrides.js) stays in place and is shown whenever the
   explainer cannot be shown. Rules (build spec 1.5, 1.9):

   An explainer renders only when every check passes:
     1. no open key dispute on the item (OPEN_KEY_DISPUTES, kept equal to
        docs/explainers/key-disputes.json by tests/player/lite.test.js);
     2. not pulled: AcePulls.isPulled(pullId(qid)) is false, where
        pullId(qid) = 'explainer:' + qid with every '#' turned into '.'
        (shared/ace-pulls.js drops ids holding '#'). If the pull lists cannot
        be read at all, every item counts as pulled: never fail open;
     3. the section index lists the qid (or an alias of it) as approved;
     4. a stamp exists for the qid: stamp text, a full sha256 equal to the
        sha256 of the sidecar bytes served now, not blocked, and (when the
        stamp lists them) every renderer source unchanged. Stamps come from
        /content/approvals/review-index.json (built by REVIEW from
        docs/explainers/approvals.json), else from docs/explainers/approvals.json
        on a local server; /docs/* is redirected in production;
     5. the guard: the sidecar names this qid, its key text, choice texts and
        stem hash match the question on screen.
   Anything else falls back to the bank explanation; the reason is left on
   the item as data-lite-fallback. Explainer text never names an option
   letter: choices are named by their content.

   window.AceExplainerLite:
     MOCKS               ['FULL_1']: the forms whose items open explainers
     pullId(qid)         the pull id of an explainer
     qidFor(mock, sec, i, x)   the explainer qid of a full.js item
     served(x)           { stem, choices, key, ... } of a full.js item
     isDisputed(qid)     an open key dispute on the item
     decide(qid, served) Promise of { ok, reason, rec }
     attach(el, opts)    decide, then render into a .miss card; Promise of the decision
     configure(o)        base URL, fetch, visuals loader, disputes, timeouts (tests) */
(function () {
  'use strict';
  if (window.AceExplainerLite) return;

  var OPEN_KEY_DISPUTES = ['fm:organic:oc-1jzd8nw'];
  var PULLS_SCRIPT = 'shared/ace-pulls.js?v=1';
  var STAMP_TEXT_RE = /\S/;
  var cfg = {
    base: null,              /* site root URL; default: two folders above this page (tools/mock/) */
    fetch: null,             /* default window.fetch */
    loadVisuals: null,       /* default: import('<base>tools/explain/visuals/index.js') */
    disputes: null,          /* default OPEN_KEY_DISPUTES */
    pullsTimeoutMs: 2500,
    fetchTimeoutMs: 8000
  };
  var cache = {};
  var live = [];             /* rendered explainers, re-checked when the pull list changes */

  function base() { return cfg.base || new URL('../../', location.href).href; }
  function url(rel) { return new URL(rel, base()).href; }
  function encPath(p) { return String(p).split('/').map(encodeURIComponent).join('/'); }
  function once(key, fn) { if (!cache[key]) cache[key] = fn(); return cache[key]; }

  /* ---------------- fetch, never rejects: null on any failure ---------------- */
  function get(u, as) {
    var f = cfg.fetch || window.fetch;
    if (typeof f !== 'function') return Promise.resolve(null);
    return new Promise(function (resolve) {
      var done = false;
      var t = setTimeout(function () { fin(null); }, cfg.fetchTimeoutMs);
      function fin(v) { if (done) return; done = true; clearTimeout(t); resolve(v); }
      try {
        Promise.resolve(f.call(window, u, { cache: 'no-cache', credentials: 'same-origin' })).then(function (r) {
          if (!r || !r.ok) return fin(null);
          if (as === 'bytes') {
            if (typeof r.arrayBuffer === 'function') return r.arrayBuffer().then(function (b) { fin(new Uint8Array(b)); }, function () { fin(null); });
            return r.text().then(function (s) { fin(encode(s)); }, function () { fin(null); });
          }
          return r.text().then(function (s) { try { fin(JSON.parse(s)); } catch (e) { fin(null); } }, function () { fin(null); });
        }, function () { fin(null); });
      } catch (e) { fin(null); }
    });
  }
  function encode(s) {
    var E = window.TextEncoder || (typeof TextEncoder !== 'undefined' ? TextEncoder : null);
    return E ? new E().encode(s) : null;
  }
  function decode(b) {
    var D = window.TextDecoder || (typeof TextDecoder !== 'undefined' ? TextDecoder : null);
    return D ? new D('utf-8').decode(b) : null;
  }
  function digest(alg, bytes) {
    var c = window.crypto;
    if (!bytes || !c || !c.subtle || typeof c.subtle.digest !== 'function') return Promise.resolve(null);
    return Promise.resolve(c.subtle.digest(alg, bytes)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    }, function () { return null; });
  }

  /* ---------------- ids ---------------- */
  function pullId(qid) { return 'explainer:' + String(qid).replace(/#/g, '.'); }
  function patChoiceText(it, o) {
    if (it.type === 'holepunch') return 'holes:' + (o.holes || []).map(function (p) { return p[0] + ',' + p[1]; }).sort().join('|');
    if (it.type === 'cubes') return o.count + ' cube' + (o.count > 1 ? 's' : '');
    return o.text;
  }
  function qidFor(mock, sec, i, x) {
    if (!x) return null;
    if (x.kind === 'mc') return x.it && x.it.id ? 'fm:' + x.it.id : null;
    if (x.kind === 'pat') return mock && mock.pat && mock.pat.seed ? 'pat:' + mock.pat.seed + ':' + (i + 1) : null;
    if (x.kind === 'rc') return x.q && x.q.id ? 'rc:' + x.q.id : null;
    return null;
  }
  function served(x) {
    if (x.kind === 'mc') return { stem: x.it.q, choices: x.it.opts.slice(), key: x.it.correct, qs: x.it.qs || null, os: !!x.it.os, figure: x.it.figure || null };
    if (x.kind === 'pat') return { stem: x.it.prompt, choices: x.it.options.map(function (o) { return patChoiceText(x.it, o); }), key: x.it.answer, patItem: x.it };
    return { stem: x.q.stem, choices: x.q.choices.slice(), key: x.q.key, passage: { id: x.p.id, title: x.p.title, paragraphs: x.p.paragraphs } };
  }
  function disputes() { return cfg.disputes || OPEN_KEY_DISPUTES; }
  function isDisputed(qid) { return !!qid && disputes().indexOf(qid) >= 0; }

  /* ---------------- pulls: never fail open ---------------- */
  function idsOf(v) {
    if (v && !Array.isArray(v) && typeof v === 'object') v = Array.isArray(v.pulls) ? v.pulls : v.ids;
    if (!Array.isArray(v)) return null;
    return v.map(function (x) { return x && typeof x === 'object' ? x.id : x; }).filter(function (x) { return typeof x === 'string'; });
  }
  function listCheck(ids) {
    return function (id) {
      var parts = String(id).split(':');
      for (var n = parts.length; n >= 1; n--) if (ids.indexOf(parts.slice(0, n).join(':')) >= 0) return true;
      return false;
    };
  }
  var ALL_PULLED = function () { return true; };
  function loadPullsScript() {
    if (window.AcePulls) return Promise.resolve(true);
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      var t = setTimeout(function () { resolve(!!window.AcePulls); }, cfg.pullsTimeoutMs);
      s.src = url(PULLS_SCRIPT);
      s.onload = function () { clearTimeout(t); resolve(!!window.AcePulls); };
      s.onerror = function () { clearTimeout(t); resolve(false); };
      (document.head || document.documentElement).appendChild(s);
    });
  }
  function ownSnapshot() {
    return get(url('content/approvals/pulls-snapshot.json')).then(function (j) {
      var ids = j == null ? null : idsOf(j);
      return ids ? listCheck(ids) : ALL_PULLED;
    });
  }
  /* a Promise of isPulled(id) */
  function pulls() {
    return once('pulls', function () {
      return loadPullsScript().then(function (has) {
        var P = window.AcePulls;
        if (!has || !P || typeof P.ready !== 'function' || typeof P.isPulled !== 'function') return ownSnapshot();
        var timer;
        var timeout = new Promise(function (r) { timer = setTimeout(r, cfg.pullsTimeoutMs); });
        return Promise.race([Promise.resolve(P.ready()).catch(function () {}), timeout]).then(function () {
          clearTimeout(timer);
          var st = {};
          try { st = P.state() || {}; } catch (e) { st = {}; }
          var known = st.snapshot === 'ok' || st.storage === 'ok' || st.live === 'ok' || st.live === 'cached';
          if (known) return function (id) { try { return P.isPulled(id) !== false; } catch (e) { return true; } };
          /* nothing loaded yet: the snapshot applies, read here; if that fails too, everything is pulled */
          return ownSnapshot().then(function (snap) {
            return function (id) { var a = true; try { a = P.isPulled(id) !== false; } catch (e) { a = true; } return a || snap(id); };
          });
        });
      });
    });
  }
  function pulledNow(qid, alias) {
    var P = window.AcePulls;
    if (!P || typeof P.isPulled !== 'function') return false;
    try { return P.isPulled(pullId(qid)) || (alias ? P.isPulled(pullId(alias)) : false); } catch (e) { return true; }
  }

  /* ---------------- index, stamps, families ---------------- */
  function sectionIndex() {
    return once('index', function () {
      return get(url('content/explainers/index.json')).then(function (top) {
        if (!top || !top.sections) return null;
        var names = Object.keys(top.sections);
        return Promise.all(names.map(function (k) { return get(url('content/explainers/' + encPath(top.sections[k]))); })).then(function (all) {
          var items = {};
          all.forEach(function (j) { if (j && j.items) Object.keys(j.items).forEach(function (q) { items[q] = j.items[q]; }); });
          return items;
        });
      });
    });
  }
  function stamps() {
    return once('stamps', function () {
      return get(url('content/approvals/review-index.json')).then(function (ri) {
        if (ri && Array.isArray(ri.items)) {
          var out = {};
          ri.items.forEach(function (it) {
            if (!it || it.kind !== 'explainer' || typeof it.qid !== 'string') return;
            var c = it.checksum || {};
            out[it.qid] = { stamp: it.stamp, checksum: c.sidecar, matches: c.matches, blocked: !!it.blocked, files: null };
          });
          return out;
        }
        return get(url('docs/explainers/approvals.json')).then(function (ap) {
          return ap && ap.approvals && typeof ap.approvals === 'object' ? ap.approvals : {};
        });
      });
    });
  }
  function families() {
    return once('families', function () { return get(url('content/explainers/families.json')).then(function (j) { return (j && j.families) || {}; }); });
  }
  function fileSum(p) {
    return once('file:' + p, function () { return get(url(encPath(p)), 'bytes').then(function (b) { return digest('SHA-256', b); }); });
  }

  /* ---------------- the decision ---------------- */
  function norm(s) { return String(s).replace(/\s+/g, ' ').trim(); }
  function stampProblem(st, sum) {
    if (!st) return 'unstamped';
    if (typeof st.stamp !== 'string' || !STAMP_TEXT_RE.test(st.stamp)) return 'unstamped';
    if (st.blocked || st.matches === false) return 'blocked';
    if (!/^[0-9a-f]{64}$/.test(st.checksum || '')) return 'unstamped';
    if (!sum || st.checksum !== sum) return 'checksum';
    return null;
  }
  function decide(qid, sv) {
    var fail = function (reason) { return { ok: false, reason: reason, rec: null }; };
    if (!qid || !sv) return Promise.resolve(fail('no-qid'));
    if (isDisputed(qid)) return Promise.resolve(fail('dispute'));
    return Promise.all([pulls(), sectionIndex(), stamps()]).then(function (r) {
      var isPulled = r[0], ix = r[1], st = r[2];
      if (isPulled(pullId(qid))) return fail('pulled');
      if (!ix) return fail('no-index');
      var entry = ix[qid];
      if (!entry) return fail('unpublished');
      var target = qid;
      if (entry.aliasOf) {
        target = entry.aliasOf;
        if (isDisputed(target)) return fail('dispute');
        if (isPulled(pullId(target))) return fail('pulled');
        entry = ix[target];
        if (!entry) return fail('unpublished');
      }
      if (entry.status !== 'approved') return fail(entry.status === 'held' || entry.status === 'blocked' ? entry.status : 'draft');
      var stamp = st[target];
      if (!stamp) return fail('unstamped');
      return get(url('content/explainers/' + encPath(entry.file)), 'bytes').then(function (bytes) {
        if (!bytes) return fail('no-sidecar');
        return digest('SHA-256', bytes).then(function (sum) {
          var p = stampProblem(stamp, sum);
          if (p) return fail(p);
          if (typeof entry.checksum === 'string' && entry.checksum && sum.indexOf(entry.checksum) !== 0) return fail('checksum');
          var files = stamp.files && typeof stamp.files === 'object' ? Object.keys(stamp.files) : [];
          return Promise.all(files.map(function (f) { return fileSum(f).then(function (s) { return s === stamp.files[f] || (stamp.files[f].length === 16 && s && s.indexOf(stamp.files[f]) === 0); }); })).then(function (oks) {
            if (oks.some(function (x) { return !x; })) return fail('renderer-changed');
            var rec;
            try { rec = JSON.parse(decode(bytes)); } catch (e) { return fail('bad-sidecar'); }
            if (!rec || rec.qid !== target || !rec.bank || !Array.isArray(rec.choices) || !rec.answer) return fail('guard');
            if (rec.bank.keyText !== sv.choices[sv.key]) return fail('guard');
            var a = (rec.bank.choiceTexts || []).slice().sort(), b = sv.choices.slice().sort();
            if (JSON.stringify(a) !== JSON.stringify(b)) return fail('guard');
            var src = norm(sv.stem) + '\n' + sv.choices.map(norm).sort().join('\n');
            return digest('SHA-1', encode(src)).then(function (h) {
              if (!h || h !== rec.bank.stemHash) return fail('guard');
              /* a pull may have landed while this loaded */
              if (pulledNow(qid, target !== qid ? target : null)) return fail('pulled');
              return { ok: true, reason: null, rec: rec, target: target };
            });
          });
        });
      });
    }, function () { return fail('error'); });
  }

  /* ---------------- rendering ---------------- */
  function h(tag, cls, kids) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    (kids || []).forEach(function (k) { if (k != null) n.appendChild(typeof k === 'string' ? document.createTextNode(k) : k); });
    return n;
  }
  /* x^2, 10^-5, [A^-] and K_a set as superscript and subscript; the rest is text */
  var MARK = /([A-Za-z0-9\])])\^(\{[^}]+\}|[+-]?[0-9A-Za-z.]*[0-9A-Za-z+-])|([A-Za-z\])])_(\{[^}]+\}|[A-Za-z0-9]+)/g;
  function rich(text) {
    var frag = document.createDocumentFragment(), str = String(text == null ? '' : text), last = 0, m;
    MARK.lastIndex = 0;
    while ((m = MARK.exec(str))) {
      var b = m[1] || m[3], mk = (m[2] || m[4]).replace(/^\{|\}$/g, '');
      frag.appendChild(document.createTextNode(str.slice(last, m.index) + b));
      var s = document.createElement(m[2] ? 'sup' : 'sub'); s.textContent = mk; frag.appendChild(s);
      last = m.index + m[0].length;
    }
    frag.appendChild(document.createTextNode(str.slice(last)));
    return frag;
  }
  function richEl(tag, cls, text) { var n = h(tag, cls); n.appendChild(rich(text)); return n; }

  /* mechdraw.js reads its palette from the root element; the report root is dark and the
     picture card is paper, so the picture is drawn with the explainer preview's light palette */
  var LIGHT = { gold: '#C9A84C', goldhi: '#7a5c12', blue: '#1f57b5', coral: '#b8321f', green: '#00704f', amber: '#9a6a00', grey: '#6b6b6b', ink: '#16211c', ink2: '#3b4a43', ink3: '#5c6a63', panel: '#ffffff', line: '#d6dfda', bg: '#ffffff' };
  var queue = Promise.resolve();
  function withLightPalette(fn) {
    var run = function () {
      var orig = window.getComputedStyle;
      var root = document.documentElement;
      window.getComputedStyle = function (el, p) {
        var cs = orig.call(window, el, p);
        if (el !== root) return cs;
        return { getPropertyValue: function (k) { var v = LIGHT[String(k).replace(/^--/, '')]; return v != null ? v : cs.getPropertyValue(k); } };
      };
      var restore = function () { window.getComputedStyle = orig; };
      return Promise.resolve().then(fn).then(function (v) { restore(); return v; }, function (e) { restore(); throw e; });
    };
    var p = queue.then(run, run);
    queue = p.catch(function () {});
    return p;
  }
  function visuals() {
    return once('visuals', function () {
      var load = cfg.loadVisuals || function () { return import(url('tools/explain/visuals/index.js')); };
      return Promise.resolve().then(load).then(function (m) { return m && typeof m.render === 'function' ? m : null; }, function () { return null; });
    });
  }
  /* classic scripts a picture type reads (tools/explain/visuals/index.js header) */
  var CLASSIC = {
    'chem.lewis': 'tools/explain/vendor/gc/lewis-layout.js',
    'bio.real': 'tools/bio/bio-real.js',
    'qr.figure': 'shared/qr-figures.js?v=2'
  };
  var GLOBAL = { 'chem.lewis': 'LewisLayout', 'bio.real': 'BioReal', 'qr.figure': 'QRFigures' };
  function classicFor(spec) {
    var panels = spec && spec.type === 'stack' ? spec.panels || [] : [spec || {}];
    var need = [];
    panels.forEach(function (p) { var t = p && p.type; if (CLASSIC[t] && !window[GLOBAL[t]] && need.indexOf(t) < 0) need.push(t); });
    if (spec && spec.annotateQuestion && !window.QRFigures && need.indexOf('qr.figure') < 0) need.push('qr.figure');
    return Promise.all(need.map(function (t) {
      return once('classic:' + t, function () {
        return new Promise(function (resolve) {
          var s = document.createElement('script');
          var timer = setTimeout(function () { resolve(!!window[GLOBAL[t]]); }, cfg.fetchTimeoutMs);
          s.src = url(CLASSIC[t]);
          s.onload = function () { clearTimeout(timer); resolve(true); };
          s.onerror = function () { clearTimeout(timer); resolve(false); };
          (document.head || document.documentElement).appendChild(s);
        });
      });
    }));
  }

  function build(rec, sv, picked, fams) {
    var key = sv.key;
    var famName = function (c) { return (fams[c.family] || {}).name || c.family || ''; };
    var label = function (text, c) {
      if (c && c.display) return c.display;
      if (/^holes:/.test(text) || sv.os) return 'This choice';
      return text;
    };
    var box = h('section', 'lite');
    box.setAttribute('aria-label', 'Explainer');
    var vis = h('div', 'lite-vis');
    box.appendChild(vis);
    if (rec.answer && rec.answer.line) box.appendChild(richEl('p', 'lite-line', rec.answer.line));
    box.appendChild(h('div', 'lite-label', ['How to get there']));
    var ol = h('ol', 'lite-steps');
    (rec.steps || []).forEach(function (s) { ol.appendChild(richEl('li', null, s)); });
    box.appendChild(ol);
    var byText = {};
    rec.choices.forEach(function (c) { byText[c.text] = c; });
    var others = sv.choices.map(function (t, i) { return i; }).filter(function (i) { return i !== key; });
    if (picked != null && picked !== key) others.sort(function (a, b) { return a === picked ? -1 : b === picked ? 1 : a - b; });
    var except = rec.choices.some(function (c) { return c.role === 'stated'; });
    var ul = h('ul', 'lite-traps');
    others.forEach(function (i) {
      var text = sv.choices[i], c = byText[text] || {};
      var head = h('div', 'lite-trap-h');
      head.appendChild(richEl('span', 'lite-trap-choice', label(text, c)));
      if (i === picked) head.appendChild(h('em', 'lite-you', ['Your pick']));
      var li = h('li', 'lite-trap' + (i === picked ? ' is-pick' : '') + (c.role === 'stated' ? ' is-stated' : ''), [head]);
      if (c.role === 'stated') li.appendChild(h('div', 'lite-trap-name', [famName(c)]));
      else {
        var nm = h('div', 'lite-trap-name', ['Trap: ' + (c.trap || famName(c))]);
        if (c.trap && famName(c)) nm.appendChild(h('span', 'lite-trap-fam', [famName(c)]));
        li.appendChild(nm);
      }
      if (c.note) li.appendChild(richEl('p', 'lite-trap-note', c.note));
      ul.appendChild(li);
    });
    box.appendChild(h('div', 'lite-label', [except ? 'The other four' : 'The traps']));
    box.appendChild(ul);
    if (rec.lockIt) {
      var lock = h('div', 'lite-lock', [h('span', null, ['Lock it in'])]);
      lock.appendChild(richEl('p', null, rec.lockIt));
      box.appendChild(lock);
    }
    if (rec.hook) {
      var hk = h('p', 'lite-hook', [h('span', null, ['Memory cue: '])]);
      hk.appendChild(rich(rec.hook));
      box.appendChild(hk);
    }
    return { box: box, vis: vis };
  }
  function drawPicture(vis, rec, sv) {
    if (!rec.visual) return Promise.resolve(true);
    var L = 'ABCDE';
    var item = { stem: sv.stem, choices: sv.choices, key: sv.key, figure: sv.figure || null, qs: sv.qs || null, os: !!sv.os, patItem: sv.patItem || null, passage: sv.passage || null };
    return classicFor(rec.visual).then(visuals).then(function (V) {
      if (!V) return false;
      return withLightPalette(function () {
        /* letterOf: the picture keeps the served order's marks it was reviewed with */
        return V.render(rec.visual, vis, { letterOf: function (t) { var i = sv.choices.indexOf(t); return i >= 0 ? L[i] : null; }, coach: false, item: item });
      }).then(function () { return true; }, function () { return false; });
    });
  }

  var HELD_TEXT = 'The explanation returns once the answer key is confirmed.';
  function fallback(el, why, reason) {
    var x = el.querySelector('section.lite');
    if (x) x.parentNode.removeChild(x);
    /* an open key dispute: the bank explanation names the disputed answer, so it stays hidden too
       (full.js leaves it out of a disputed card; this covers an item disputed through its alias) */
    if (reason === 'dispute') {
      if (why) why.hidden = true;
      if (!el.querySelector('.key-held')) { var p = h('p', 'note key-held', [HELD_TEXT]); el.insertBefore(p, el.querySelector('.links') || null); }
    } else if (why) why.hidden = false;
    el.setAttribute('data-lite-fallback', reason);
    el.removeAttribute('data-lite');
  }
  /* el: a .miss card from full.js; opts: { qid, served, picked } */
  function attach(el, opts) {
    var why = el.querySelector('.why');
    el.setAttribute('data-lite-qid', opts.qid || '');
    return decide(opts.qid, opts.served).then(function (d) {
      if (!d.ok) { fallback(el, why, d.reason); return d; }
      return families().then(function (fams) {
        var b = build(d.rec, opts.served, opts.picked, fams);
        var links = el.querySelector('.links');
        /* laid out (the picture draws at the width it has) but not shown until the picture is in */
        b.box.classList.add('is-loading');
        el.insertBefore(b.box, links || null);
        return drawPicture(b.vis, d.rec, opts.served).then(function (drawn) {
          /* the picture is part of what was stamped: no picture, no explainer */
          if (!drawn || b.vis.querySelector('.vis-err')) { fallback(el, why, 'picture'); return { ok: false, reason: 'picture', rec: null }; }
          if (pulledNow(opts.qid, d.target !== opts.qid ? d.target : null)) { fallback(el, why, 'pulled'); return { ok: false, reason: 'pulled', rec: null }; }
          b.box.classList.remove('is-loading');
          if (why) why.hidden = true;
          el.removeAttribute('data-lite-fallback');
          el.setAttribute('data-lite', 'explainer');
          live.push({ el: el, why: why, qid: opts.qid, target: d.target });
          return d;
        });
      });
    });
  }
  window.addEventListener('acelabs:pulls', function () {
    live = live.filter(function (x) {
      if (!document.documentElement.contains(x.el)) return false;
      if (pulledNow(x.qid, x.target !== x.qid ? x.target : null)) { fallback(x.el, x.why, 'pulled'); return false; }
      return true;
    });
  });

  function configure(o) {
    Object.keys(o || {}).forEach(function (k) { if (Object.prototype.hasOwnProperty.call(cfg, k)) cfg[k] = o[k]; });
    cache = {};
    return cfg;
  }

  window.AceExplainerLite = {
    MOCKS: ['FULL_1'],
    OPEN_KEY_DISPUTES: OPEN_KEY_DISPUTES,
    pullId: pullId,
    qidFor: qidFor,
    served: served,
    isDisputed: isDisputed,
    decide: decide,
    attach: attach,
    configure: configure
  };
})();
