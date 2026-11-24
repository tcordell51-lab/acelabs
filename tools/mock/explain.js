/* explain.js : how a full-length test shows one explanation, and where its drill links go.

   An item in tools/mock/data/full-mocks.js can carry, to docs/EXPLANATION-STANDARD.md:
     why    the answer and the reason, one or two sentences
     steps  3 to 5 short steps (one **bold** term each)
     traps  one line per choice saying what picking it gets wrong (null at the key)
     check  { q, a } a check-yourself question and its answer
   AceMockExplain.html(item, picked)  markup for the test report
   AceMockExplain.text(item, picked)  plain text for the shared question review (/review/)
   AceMockExplain.rcHtml / rcText     the same for a Reading question (its distractor note)
   AceMockExplain.drill(sub, stop)    { href, label } for the practice set on that topic, or null
   No choice is ever named by letter: the choices are reordered when a test is composed. */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function rich(s) { return esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>'); }
  function plain(s) { return String(s == null ? '' : s).replace(/\*\*/g, ''); }

  function html(it, picked) {
    var h = '<p class="ex-ans">' + rich(it.why) + '</p>';
    if (it.steps && it.steps.length) h += '<ol class="ex-steps">' + it.steps.map(function (s) { return '<li>' + rich(s) + '</li>'; }).join('') + '</ol>';
    var traps = it.traps || [];
    if (picked != null && traps[picked]) h += '<p class="ex-pick"><b>About your pick:</b> ' + rich(traps[picked]) + '</p>';
    var others = [];
    traps.forEach(function (t, i) { if (t && i !== picked && i !== it.correct) others.push({ t: t, i: i }); });
    if (others.length) {
      h += '<details class="ex-more"><summary>' + (picked != null && traps[picked] ? 'The other wrong choices' : 'Why each wrong choice is wrong') + '</summary><ul>' +
        others.map(function (o) { return '<li>' + (it.os ? '' : '<span class="ex-opt">' + esc(it.opts[o.i]) + '</span> ') + rich(o.t) + '</li>'; }).join('') + '</ul></details>';
    }
    if (it.check && it.check.q) h += '<details class="ex-check"><summary><b>Check yourself:</b> ' + rich(it.check.q) + '</summary><p>' + rich(it.check.a) + '</p></details>';
    return h;
  }
  function text(it, picked) {
    var out = [plain(it.why)];
    if (it.steps && it.steps.length) out.push(it.steps.map(function (s, i) { return (i + 1) + '. ' + plain(s); }).join('\n'));
    if (picked != null && it.traps && it.traps[picked]) out.push('About your pick: ' + plain(it.traps[picked]));
    if (it.check && it.check.q) out.push('Check yourself: ' + plain(it.check.q) + '\n' + plain(it.check.a));
    return out.join('\n\n');
  }
  function rcNote(q, picked) { return picked != null && picked !== q.key && q.distractorNotes && q.distractorNotes[picked] ? q.distractorNotes[picked] : ''; }
  function rcHtml(q, picked) {
    var pr = (q.proof || [])[0], n = rcNote(q, picked);
    return (pr ? '<p class="ex-ans"><b>Proof line, paragraph ' + pr.paragraph + ':</b> "' + esc(pr.quote) + '"</p>' : '') + '<p class="ex-ans">' + esc(q.why) + '</p>' +
      (n ? '<p class="ex-pick"><b>About your pick:</b> ' + esc(n) + '</p>' : '');
  }
  function rcText(q, picked) { var n = rcNote(q, picked); return (q.why || '') + (n ? '\n\nAbout your pick: ' + n : ''); }

  /* Course stop -> the practice set on that topic (hub pages take ?topic=<id>, shared/ace-hub.js and
     /qr/drill/). scripts/gate-mock-explanations.mjs checks every id against the hub's bank. A stop
     with no set of its own is left out, and the report then links the section's practice page. */
  var HUB = { 'Biology': '/bio/', 'Gen Chem': '/gc/', 'OChem': '/oc/', 'QR': '/qr/drill/' };
  var SETS = {
    'bio-1': ['biomolecules', 'Biomolecules'], 'bio-2': ['organelles', 'Organelles'], 'bio-6': ['transcription', 'Transcription'],
    'bio-3': ['membranes', 'Membranes and transport'], 'bio-4': ['krebs-etc', 'Krebs cycle and electron transport'], 'bio-5': ['photosynthesis', 'Photosynthesis'], 'bio-7': ['cell-cycle', 'Cell cycle and mitosis'],
    'gc-1': ['sig-figs', 'Sig figs and measurement'], 'gc-2': ['mole-conv', 'Mole conversions'], 'gc-3': ['atomic', 'Atomic structure'], 'gc-5': ['periodic', 'Periodic trends'],
    'gc-6': ['vsepr', 'VSEPR and geometry'], 'gc-7': ['gas-laws', 'Gas laws'], 'gc-8': ['solutions', 'Solutions and concentration'], 'gc-9': ['enthalpy', 'Enthalpy'],
    'gc-10': ['gibbs', 'Gibbs free energy'], 'gc-11': ['rate-laws', 'Rate laws'], 'gc-12': ['eq-lechat', 'Le Chatelier'], 'gc-13': ['ph-basics', 'pH, pOH, Ka and Kb'], 'gc-14': ['galvanic', 'Galvanic cells'],
    'oc-1': ['ab-ochem', 'Acids and bases in organic'], 'oc-3': ['stereo-rs', 'Stereochemistry'], 'oc-4': ['mech-sne', 'Substitution and elimination'], 'oc-5': ['alkene-add', 'Alkene additions'],
    'oc-6': ['alkyne', 'Alkynes'], 'oc-7': ['carbonyl', 'Carbonyl chemistry'], 'oc-8': ['acids', 'Carboxylic acids and derivatives'], 'oc-9': ['alc-eth', 'Alcohols and ethers'],
    'oc-10': ['carbonyl', 'Carbonyl chemistry'], 'oc-11': ['arom-eas', 'Aromaticity and EAS'], 'oc-12': ['mech-arrows', 'Mechanisms and arrow pushing'], 'oc-13': ['spec-ir-nmr', 'IR and NMR'],
    'qr-1': ['word-problems-rate-work-mixture', 'Word problems'], 'qr-2': ['fractions-and-decimals', 'Fractions and decimals'], 'qr-3': ['ratios-and-proportions', 'Ratios and proportions'],
    'qr-4': ['percentages', 'Percentages'], 'qr-5': ['algebra-and-equations', 'Algebra and equations'], 'qr-6': ['exponents-and-roots', 'Exponents and roots'],
    'qr-7': ['word-problems-rate-work-mixture', 'Word problems'], 'qr-8': ['word-problems-rate-work-mixture', 'Word problems'], 'qr-12': ['probability', 'Probability'],
    'qr-13': ['statistics-mean-median-sd', 'Statistics'], 'qr-ds': ['discr', 'Data sufficiency'], 'qr-qc': ['estim', 'Estimating and comparing']
  };
  /* Stops with no hub set of their own link the Bio page that teaches and quizzes that unit. */
  var PAGES = {
    'bio-8': ['/tools/bio/bio-genetics.html', 'Meiosis and genetics practice'], 'bio-9': ['/tools/bio/bio-genetics.html', 'Mendelian genetics practice'],
    'bio-10': ['/tools/bio/bio-genetics.html', 'Genetics practice'], 'bio-11': ['/tools/bio/bio-evolution.html', 'Evolution practice'],
    'bio-12': ['/tools/bio/bio-evolution.html', 'Ecology and behavior practice'], 'bio-13': ['/tools/bio/bio-diversity.html', 'Diversity of life practice'],
    'bio-14': ['/tools/bio/bio-physiology.html', 'Nerves and hormones practice'], 'bio-15': ['/tools/bio/bio-physiology.html', 'Body systems practice'],
    'bio-16': ['/tools/bio/bio-devo.html', 'Reproduction and development practice']
  };
  /* Reading: the RC player opens a passage rich in one question type at #start/type/<type>. */
  function drill(sub, stop, type) {
    if (sub === 'RC') return type ? { href: '/tools/rc/#start/type/' + encodeURIComponent(type), label: 'Passage drill on this question type' } : null;
    var s = SETS[stop], hub = HUB[sub], pg = PAGES[stop];
    if (s && hub) return { href: hub + '?topic=' + encodeURIComponent(s[0]), label: s[1] + ' practice set' };
    return pg ? { href: pg[0], label: pg[1] } : null;
  }

  window.AceMockExplain = { html: html, text: text, rcHtml: rcHtml, rcText: rcText, drill: drill, SETS: SETS, HUB: HUB, PAGES: PAGES };
})();
