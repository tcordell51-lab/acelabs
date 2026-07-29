/* =====================================================================
   Bio Repair Lab · canonical node registry
   ---------------------------------------------------------------------
   Single source of truth for: node id, hub, title, route, anchor,
   official ADA bucket, priority tier, status, support flags.

   Used by: Bio home (counts, sidebar, coverage matrix), diagnostic
   (mapping misses → repair routes), mock (review-link routing),
   analytics (readable node names instead of cryptic codes), validation
   script (scripts/validate-bio-registry.js).

   IMPORTANT — keep this file load-order safe. It defines exactly one
   global, BIO_REGISTRY, and one helper, BIO_REGISTRY_BY_ID. No DOM
   access. Safe to load on every Bio page.
   ===================================================================== */
(function (root) {
  'use strict';

  // Official ADA DAT Biology buckets (broad, current). Six Ace study hubs
  // map onto these — there are 5 official buckets, not 6. The "Genetics"
  // hub maps to "Developmental Biology, Genetics" alongside Devo.
  var ADA = {
    CELL_MOLECULAR:        'Cell and Molecular Biology',
    DIVERSITY:             'Diversity of Life',
    STRUCTURE_FUNCTION:    'Structure and Function of Systems',
    DEVO_GENETICS:         'Developmental Biology, Genetics',
    EVO_ECO_BEHAVIOR:      'Evolution, Ecology, and Behavior'
  };

  // Status values are honest:
  //   live    → fully built, retrieval + visualization usable
  //   partial → present but with gaps (no retrieval, stub data, or
  //             visualization only); show coverage matrix marker
  //   planned → not yet built; route may not exist
  //   bonus   → optional enrichment, not core DAT Biology
  var S = { LIVE:'live', PARTIAL:'partial', PLANNED:'planned', BONUS:'bonus' };

  // Priority tier replaces unsupported per-exam frequency claims.
  //   high   → high priority repair pattern
  //   medium → medium priority
  //   low    → low priority / edge case
  //   bonus  → enrichment
  var P = { HIGH:'high', MEDIUM:'medium', LOW:'low', BONUS:'bonus' };

  // Hubs are the six Ace study hubs (NOT official DAT sections).
  var HUBS = [
    { id:'cell',       title:'Cell & Molecular',     subjectKey:'cell',      adaBucket:ADA.CELL_MOLECULAR,     route:'bio-cell.html',      flagship:'Cell Lab' },
    { id:'genetics',   title:'Genetics',             subjectKey:'genetics',  adaBucket:ADA.DEVO_GENETICS,      route:'bio-genetics.html',  flagship:'Genetics Studio' },
    { id:'physiology', title:'Structure & Function', subjectKey:'physiology',adaBucket:ADA.STRUCTURE_FUNCTION, route:'bio-physiology.html',flagship:'Body Systems Lab' },
    { id:'diversity',  title:'Diversity of Life',    subjectKey:'diversity', adaBucket:ADA.DIVERSITY,          route:'bio-diversity.html', flagship:'Field Guide' },
    { id:'devo',       title:'Developmental',        subjectKey:'devo',      adaBucket:ADA.DEVO_GENETICS,      route:'bio-devo.html',      flagship:'Embryo Atlas' },
    { id:'evolution',  title:'Evolution & Ecology',  subjectKey:'evolution', adaBucket:ADA.EVO_ECO_BEHAVIOR,   route:'bio-evolution.html', flagship:'Selection Simulator' }
  ];

  // Node entries. ID is the data-node attribute used by bio-shared.js.
  // anchor is the section id (without the '#') in the hub HTML file.
  // aliases lists legacy ids that older code may reference (diagnostic,
  // calendar, etc.). card/diagnostic/analytics flags say which surfaces
  // already pull from this node.
  //
  // org collision note: bio-cell.html organelles uses data-node="org"
  // and bio-devo.html organogenesis ALSO uses data-node="org". The
  // registry resolves the collision by giving them distinct registry
  // ids ('org' for organelles, 'organogenesis' for the devo node) and
  // listing 'org' as an alias of organogenesis with hub:'devo'. The
  // hub disambiguates. See validation script.
  var NODES = [
    /* ----- Cell & Molecular (hub: cell) ----- */
    { id:'wat', hub:'cell', title:'Water + biomolecules',     anchor:'node-water',           tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:true,  analytics:true },
    { id:'car', hub:'cell', title:'Carbohydrates',            anchor:'node-carbs',           tier:P.MEDIUM, status:S.LIVE,    card:true,  diagnostic:false, analytics:true },
    { id:'lip', hub:'cell', title:'Lipids + membranes',       anchor:'node-lipids',          tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:false, analytics:true },
    { id:'pro', hub:'cell', title:'Proteins',                 anchor:'node-proteins',        tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:true,  analytics:true },
    { id:'nuc', hub:'cell', title:'Nucleic acids',            anchor:'node-nucleic',         tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:false, analytics:true },
    { id:'enz', hub:'cell', title:'Enzymes + kinetics',       anchor:'node-enzymes',         tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:true,  analytics:true },
    { id:'pve', hub:'cell', title:'Prokaryote vs eukaryote',  anchor:'node-prokaryote',      tier:P.MEDIUM, status:S.LIVE,    card:true,  diagnostic:false, analytics:true },
    { id:'org', hub:'cell', title:'Organelles',               anchor:'node-organelles',      tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:true,  analytics:true },
    { id:'cyt', hub:'cell', title:'Cytoskeleton',             anchor:'node-cytoskeleton',    tier:P.MEDIUM, status:S.PARTIAL, card:false, diagnostic:false, analytics:true },
    { id:'mtr', hub:'cell', title:'Membrane transport',       anchor:'node-membrane',        tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:true,  analytics:true },
    { id:'sig', hub:'cell', title:'Cell signaling',           anchor:'node-signaling',       tier:P.MEDIUM, status:S.LIVE,    card:true,  diagnostic:false, analytics:true },
    { id:'mit', hub:'cell', title:'Cell cycle + mitosis',     anchor:'node-mitosis',         tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:true,  analytics:true },
    { id:'gly', hub:'cell', title:'Glycolysis',               anchor:'node-glycolysis',      tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:false, analytics:true },
    { id:'krb', hub:'cell', title:'Krebs + ETC',              anchor:'node-krebs',           tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:true,  analytics:true },
    { id:'pho', hub:'cell', title:'Photosynthesis',           anchor:'node-photo',           tier:P.MEDIUM, status:S.LIVE,    card:true,  diagnostic:false, analytics:true },
    { id:'rep', hub:'cell', title:'DNA replication',          anchor:'node-replication',     tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:true,  analytics:true,
      aliases:['dna-replication'] },
    { id:'trc', hub:'cell', title:'Transcription',            anchor:'node-transcription',   tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:false, analytics:true },
    { id:'rnp', hub:'cell', title:'RNA processing',           anchor:'node-rna-processing',  tier:P.MEDIUM, status:S.PARTIAL, card:false, diagnostic:false, analytics:true },
    { id:'tln', hub:'cell', title:'Translation',              anchor:'node-translation',     tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:false, analytics:true },

    /* ----- Genetics (hub: genetics) ----- */
    { id:'prb', hub:'genetics', title:'Probability rules',     anchor:'node-probability',     tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:true,  analytics:true },
    { id:'men', hub:'genetics', title:'Mendelian genetics',    anchor:'node-mendelian',       tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:true,  analytics:true },
    { id:'mei', hub:'genetics', title:'Meiosis',               anchor:'node-meiosis',         tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:false, analytics:true },
    { id:'lco', hub:'genetics', title:'Linkage + crossing over',anchor:'node-linkage',        tier:P.MEDIUM, status:S.PARTIAL, card:false, diagnostic:false, analytics:true },
    { id:'ped', hub:'genetics', title:'Pedigrees',             anchor:'node-pedigrees',       tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:true,  analytics:true,
      aliases:['pedigree'] },
    { id:'hwb', hub:'genetics', title:'Hardy-Weinberg',        anchor:'node-hardy-weinberg',  tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:true,  analytics:true },
    { id:'nmn', hub:'genetics', title:'Non-Mendelian',         anchor:'node-non-mendelian',   tier:P.MEDIUM, status:S.LIVE,    card:true,  diagnostic:false, analytics:true },
    { id:'grg', hub:'genetics', title:'Gene regulation',       anchor:'node-gene-regulation', tier:P.MEDIUM, status:S.LIVE,    card:true,  diagnostic:false, analytics:true },
    { id:'mut', hub:'genetics', title:'Mutations + repair',    anchor:'node-mutations',       tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:true,  analytics:true },

    /* ----- Structure & Function (hub: physiology) ----- */
    { id:'ap',  hub:'physiology', title:'Action potential',    anchor:'node-action-potential',tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:true,  analytics:true },
    { id:'syn', hub:'physiology', title:'Synaptic transmission',anchor:'node-synaptic',       tier:P.MEDIUM, status:S.LIVE,    card:true,  diagnostic:false, analytics:true },
    { id:'rfx', hub:'physiology', title:'Reflex arc',          anchor:'node-reflex-arc',      tier:P.MEDIUM, status:S.LIVE,    card:true,  diagnostic:false, analytics:true },
    { id:'brn', hub:'physiology', title:'Brain regions',       anchor:'node-brain-regions',   tier:P.MEDIUM, status:S.LIVE,    card:true,  diagnostic:false, analytics:true },
    { id:'snz', hub:'physiology', title:'Special senses',      anchor:'node-special-senses',  tier:P.LOW,    status:S.LIVE,    card:true,  diagnostic:false, analytics:true },
    { id:'cdv', hub:'physiology', title:'Cardiovascular',      anchor:'node-cardiovascular',  tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:true,  analytics:true },
    { id:'nph', hub:'physiology', title:'Renal · nephron',     anchor:'node-nephron',         tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:true,  analytics:true },
    { id:'rsp', hub:'physiology', title:'Respiratory',         anchor:'node-respiratory',     tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:true,  analytics:true },
    { id:'end', hub:'physiology', title:'Endocrine',           anchor:'node-endocrine',       tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:true, analytics:true },
    { id:'dig', hub:'physiology', title:'Digestive',           anchor:'node-digestive',       tier:P.MEDIUM, status:S.LIVE,    card:true,  diagnostic:false, analytics:true },
    { id:'rpd', hub:'physiology', title:'Reproductive',        anchor:'node-reproductive',    tier:P.MEDIUM, status:S.LIVE,    card:true,  diagnostic:false, analytics:true },
    { id:'imn', hub:'physiology', title:'Immune',              anchor:'node-immune',          tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:false, analytics:true },
    { id:'sf',  hub:'physiology', title:'Sliding filament',    anchor:'node-sliding-filament',tier:P.HIGH,   status:S.LIVE,    card:true,  diagnostic:false, analytics:true },

    /* ----- Diversity (hub: diversity) ----- */
    { id:'dom', hub:'diversity', title:'Three domains',          anchor:'node-domains',                   tier:P.HIGH,   status:S.LIVE, card:true, diagnostic:true,  analytics:true,
      aliases:['bact','bacteria'] },
    { id:'plt', hub:'diversity', title:'Plant biology',          anchor:'node-plants',                    tier:P.MEDIUM, status:S.LIVE, card:true, diagnostic:false, analytics:true },
    { id:'anm', hub:'diversity', title:'Animal diversity',       anchor:'node-animals',                   tier:P.MEDIUM, status:S.LIVE, card:true, diagnostic:false, analytics:true },
    { id:'vrt', hub:'diversity', title:'Vertebrate classes',     anchor:'node-vertebrates',               tier:P.LOW,    status:S.LIVE, card:true, diagnostic:false, analytics:true },
    { id:'phy', hub:'diversity', title:'Phylogenetics',          anchor:'node-phylogenetics',             tier:P.MEDIUM, status:S.LIVE, card:true, diagnostic:false, analytics:true },
    { id:'bgt', hub:'diversity', title:'Bacterial gene transfer',anchor:'node-bacterial-gene-transfer',   tier:P.MEDIUM, status:S.LIVE, card:true, diagnostic:false, analytics:true },

    /* ----- Developmental (hub: devo) ----- */
    { id:'fer',           hub:'devo', title:'Fertilization',        anchor:'node-fertilization',  tier:P.HIGH,   status:S.LIVE,    card:true, diagnostic:true,  analytics:true },
    { id:'gas',           hub:'devo', title:'Cleavage + gastrulation',anchor:'node-gastrulation', tier:P.HIGH,   status:S.LIVE,    card:true, diagnostic:false, analytics:true },
    // 'organogenesis' uses data-node="org" in bio-devo.html — same code as Cell organelles. Disambiguated by hub.
    { id:'organogenesis', hub:'devo', title:'Organogenesis',        anchor:'node-organogenesis',  tier:P.MEDIUM, status:S.LIVE,    card:true, diagnostic:false, analytics:false,
      aliases:['org-devo'], legacyDataNode:'org' },
    { id:'stm',           hub:'devo', title:'Stem cells',           anchor:'node-stem-cells',     tier:P.MEDIUM, status:S.LIVE,    card:true, diagnostic:false, analytics:true },
    { id:'dif',           hub:'devo', title:'Determination + induction',anchor:'node-determination',tier:P.LOW,  status:S.PARTIAL, card:false,diagnostic:false, analytics:true },

    /* ----- Evolution & Ecology (hub: evolution) ----- */
    { id:'nse', hub:'evolution', title:'Natural selection', anchor:'node-natural-selection', tier:P.HIGH,   status:S.LIVE,    card:true, diagnostic:true,  analytics:true,
      aliases:['selection','dir'] },
    { id:'spc', hub:'evolution', title:'Speciation',        anchor:'node-speciation',        tier:P.HIGH,   status:S.LIVE,    card:true, diagnostic:false, analytics:true },
    { id:'eco', hub:'evolution', title:'Ecology',           anchor:'node-ecology',           tier:P.MEDIUM, status:S.PARTIAL, card:false,diagnostic:false, analytics:true },
    { id:'com', hub:'evolution', title:'Community ecology', anchor:'node-community',         tier:P.MEDIUM, status:S.LIVE,    card:true, diagnostic:false, analytics:true },
    { id:'beh', hub:'evolution', title:'Behavior',          anchor:'node-behavior',          tier:P.LOW,    status:S.PARTIAL, card:false,diagnostic:false, analytics:true }
  ];

  // High-priority repair patterns called out in the Bio Repair Sheet.
  // Pattern format: stem cue → think → avoid. Names existing nodes for
  // routing; never invents new content.
  var REPAIR_PATTERNS = [
    { id:'cyanide-etc',  nodeId:'krb', label:'Cyanide blocks ETC',
      ifStem:'cyanide blocks complex IV / electron transport',
      think:'ETC stops, proton gradient collapses, ATP synthase slows; cells fall back to glycolysis (2 ATP)',
      avoid:'saying glycolysis immediately stops or that ATP goes to zero' },
    { id:'rer-vs-ser',   nodeId:'org', label:'Rough vs smooth ER',
      ifStem:'cell secretes / exports a lot of protein',
      think:'rough ER (ribosomes) — protein synthesis for secretion + membrane',
      avoid:'choosing smooth ER, which is lipid synthesis + detox' },
    { id:'mito-vs-chlo', nodeId:'krb', label:'Mitochondria vs chloroplast',
      ifStem:'matrix vs stroma vs inner membrane vs thylakoid',
      think:'matrix = Krebs; cristae = ETC. Stroma = Calvin; thylakoid = light reactions',
      avoid:'mixing matrix with stroma' },
    { id:'mit-vs-meio',  nodeId:'mei', label:'Mitosis vs meiosis',
      ifStem:'sister chromatids vs homologs separating',
      think:'mitosis anaphase = sister chromatids; meiosis I = homologs; meiosis II = sister chromatids',
      avoid:'saying "anaphase = always sister chromatids"' },
    { id:'nephron-loop', nodeId:'nph', label:'Loop of Henle limbs',
      ifStem:'descending vs ascending limb permeability',
      think:'descending = water permeable, solute impermeable; ascending = opposite',
      avoid:'flipping which limb does what' },
    { id:'bohr',         nodeId:'rsp', label:'Bohr effect',
      ifStem:'high CO₂, low pH, working tissue',
      think:'right shift, lower Hb-O₂ affinity, more O₂ released to tissue',
      avoid:'left shift (that is fetal Hb / lungs)' },
    { id:'gpcr-vs-rtk',  nodeId:'sig', label:'GPCR vs RTK vs steroid',
      ifStem:'lipid-soluble hormone vs peptide vs growth factor',
      think:'steroid → intracellular receptor → DNA. Peptide/amine → GPCR. Growth factor → RTK',
      avoid:'putting steroid receptors on the membrane' },
    { id:'transformation-types', nodeId:'bgt', label:'Transformation vs transduction vs conjugation',
      ifStem:'bacterial DNA exchange',
      think:'transformation = naked DNA from environment; transduction = via virus; conjugation = via pilus',
      avoid:'mixing transduction with transformation' },
    { id:'protostome-deuterostome', nodeId:'gas', label:'Protostome vs deuterostome',
      ifStem:'blastopore fate',
      think:'protostome = blastopore → mouth (proto = first). Deuterostome = blastopore → anus',
      avoid:'flipping which group has which fate' },
    { id:'innate-vs-adaptive', nodeId:'imn', label:'Innate vs adaptive immunity',
      ifStem:'first responder vs antigen-specific',
      think:'innate = nonspecific, fast (skin, neutrophils, complement). Adaptive = specific, slower (B/T cells, memory)',
      avoid:'classifying neutrophils as adaptive' },
    { id:'hardy-weinberg-2pq', nodeId:'hwb', label:'q² → carrier 2pq',
      ifStem:'recessive disorder rate, find carrier rate',
      think:'sqrt(q²) = q; p = 1-q; carriers = 2pq',
      avoid:'forgetting to take square root before plugging into 2pq' },
    { id:'sympathetic-parasympathetic', nodeId:'rfx', label:'Sympathetic vs parasympathetic',
      ifStem:'fight-or-flight vs rest-and-digest',
      think:'symp = pupils dilate, HR up, GI down. Para = pupils constrict, HR down, GI up',
      avoid:'putting bronchoconstriction in fight-or-flight' }
  ];

  // Build lookup helpers. Aliases resolve to the canonical entry.
  var byId = {};
  var byAlias = {};
  NODES.forEach(function (n) {
    byId[n.id] = n;
    if (n.aliases) n.aliases.forEach(function (a) { byAlias[a] = n.id; });
  });

  function resolve(id, hubHint) {
    if (!id) return null;
    if (byId[id]) {
      // Disambiguate org collision when hubHint is supplied.
      if (id === 'org' && hubHint === 'devo') {
        return byId['organogenesis'] || byId['org'];
      }
      return byId[id];
    }
    if (byAlias[id]) return byId[byAlias[id]];
    return null;
  }

  function nodesForHub(hubId) {
    return NODES.filter(function (n) { return n.hub === hubId; });
  }

  function liveCount(hubId) {
    return nodesForHub(hubId).filter(function (n) { return n.status === 'live'; }).length;
  }

  function totalLive() {
    return NODES.filter(function (n) { return n.status === 'live'; }).length;
  }

  function repairLink(node) {
    if (!node) return null;
    var hub = HUBS.find(function (h) { return h.id === node.hub; });
    if (!hub) return null;
    return hub.route + '#' + node.anchor;
  }

  var registry = {
    ADA: ADA,
    STATUS: S,
    PRIORITY: P,
    HUBS: HUBS,
    NODES: NODES,
    REPAIR_PATTERNS: REPAIR_PATTERNS,
    byId: byId,
    byAlias: byAlias,
    resolve: resolve,
    nodesForHub: nodesForHub,
    liveCount: liveCount,
    totalLive: totalLive,
    repairLink: repairLink
  };

  // CommonJS export for the validation script (Node).
  if (typeof module !== 'undefined' && module.exports) module.exports = registry;
  // Browser global.
  root.BIO_REGISTRY = registry;
  root.BIO_REGISTRY_BY_ID = byId;

})(typeof window !== 'undefined' ? window : globalThis);
