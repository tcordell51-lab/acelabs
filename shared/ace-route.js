/* ace-route.js : one place that answers "where do I fix this concept?"
   Needs shared/ace-index.js loaded first (window.AceIndex).

     AceRoute.links({ section: 'qr', concept: 'Percent change', skill: 'pct-chg', topic: '...' })
       -> { sheet: url|null, learn: url, drill: url, night: n|null, sheetTitle, nightTitle }

   Section codes everywhere in the shell: bio, gchem, ochem, qr, pat, rc. */
(function () {
  'use strict';
  var I = window.AceIndex || { nights: {}, skills: {}, qrModules: {}, canon: [], climb: {}, courses: {} };
  var CANON = 'https://acethedat-portal.netlify.app/canon/';

  var DRILL = {
    bio: '/tools/bio/',
    gchem: '/tools/gc/',
    ochem: '/tools/ochem/tree/',
    qr: '/tools/qr/',
    pat: '/tools/pat/',
    rc: '/tools/rc/'
  };
  var PAT_TRAINER = { keyholes: 'keyholes', aperture: 'keyholes', tfe: 'tfe', 'top-front-end': 'tfe', views: 'tfe', angles: 'angles', angle: 'angles', holepunch: 'holepunch', 'hole punching': 'holepunch', hole: 'holepunch', cubes: 'cubes', cube: 'cubes', patternfold: 'patternfold', 'pattern folding': 'patternfold', folding: 'patternfold' };
  var SECTION_NAMES = { bio: 'Biology', gchem: 'General Chemistry', ochem: 'Organic Chemistry', qr: 'Quantitative Reasoning', pat: 'Perceptual Ability', rc: 'Reading Comprehension' };
  var SECTION_SHORT = { bio: 'Bio', gchem: 'GChem', ochem: 'OChem', qr: 'QR', pat: 'PAT', rc: 'RC' };

  /* Any section spelling the tools use -> one code. */
  function section(s) {
    var k = String(s || '').toLowerCase().replace(/[^a-z]/g, '');
    if (!k) return null;
    if (/^(bio|biology|bioret)/.test(k)) return 'bio';
    if (/^(gc|gchem|genchem|generalchem|generalchemistry|gchemistry)/.test(k)) return 'gchem';
    if (/^(oc|ochem|orgo|organic|organicchemistry)/.test(k)) return 'ochem';
    if (/^(qr|quant|quantitative)/.test(k)) return 'qr';
    if (/^(pat|perceptual)/.test(k)) return 'pat';
    if (/^(rc|reading)/.test(k)) return 'rc';
    return null;
  }

  var STOP = {};
  'the a an and or of to in on at for with by is are it its from your you what how one two three then that this as into vs versus their them be not no all every'.split(' ').forEach(function (w) { STOP[w] = 1; });
  function words(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/)
      .filter(function (w) { return w.length > 2 && !STOP[w]; })
      .map(function (w) { return w.replace(/(ies)$/, 'y').replace(/(es|s)$/, ''); });
  }
  function overlap(a, b) {
    var set = {}, n = 0;
    words(b).forEach(function (w) { set[w] = 1; });
    words(a).forEach(function (w) { if (set[w]) { n++; set[w] = 0; } });
    return n;
  }

  function nightFor(sec, text, topic) {
    if (topic && I.climb && I.climb[sec + '|' + topic]) return I.climb[sec + '|' + topic];
    var best = null, score = 0;
    (I.nights[sec] || []).forEach(function (n) {
      var s = overlap(text, n.t + ' ' + n.k);
      if (s > score) { score = s; best = n.n; }
    });
    return score > 0 ? best : null;
  }
  function nightTitle(sec, n) {
    var hit = (I.nights[sec] || []).filter(function (x) { return x.n === n; })[0];
    return hit ? hit.t : '';
  }
  function sheetFor(sec, text) {
    var best = null, score = 0;
    (I.canon || []).forEach(function (c) {
      if (sec && c.s !== sec) return;
      var s = overlap(text, c.t + ' ' + c.id.replace(/-/g, ' '));
      if (s > score) { score = s; best = c; }
    });
    return score > 0 ? best : null;
  }
  function skillName(sec, id) {
    var m = I.skills && I.skills[sec === 'gchem' ? 'gchem' : sec];
    return (m && m[id]) || null;
  }

  function learnUrl(sec, n) {
    var c = I.courses && I.courses[sec];
    if (!c) return '/learn/';
    return c.url + (n ? '?night=' + n : '');
  }
  function drillUrl(sec, m) {
    if (sec === 'qr' && m && m.skill && I.qrModules && I.qrModules[m.skill]) return I.qrModules[m.skill];
    if (sec === 'pat') {
      var t = String((m && (m.skill || m.concept)) || '').toLowerCase();
      for (var k in PAT_TRAINER) if (t.indexOf(k) >= 0) return '/tools/pat/' + PAT_TRAINER[k] + '.html';
    }
    return DRILL[sec] || '/practice/';
  }

  function links(m) {
    var sec = section(m.section);
    var text = [m.concept, m.topic, m.skill && skillName(sec, m.skill)].filter(Boolean).join(' ');
    var n = sec ? nightFor(sec, text, m.topic) : null;
    var sheet = sec ? sheetFor(sec, text) : null;
    return {
      section: sec,
      night: n,
      nightTitle: n ? nightTitle(sec, n) : '',
      learn: sec ? learnUrl(sec, n) : '/learn/',
      sheet: sheet ? CANON + 'sheets/' + sheet.id + '.html' : (sec ? CANON + '#' + sec : CANON),
      sheetTitle: sheet ? sheet.t : '',
      drill: drillUrl(sec, m)
    };
  }

  window.AceRoute = {
    CANON: CANON, SECTION_NAMES: SECTION_NAMES, SECTION_SHORT: SECTION_SHORT,
    section: section, links: links, nightFor: nightFor, nightTitle: nightTitle,
    sheetFor: sheetFor, skillName: skillName, learnUrl: learnUrl, drillUrl: drillUrl, words: words
  };
})();
