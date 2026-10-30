/* =====================================================================
   Bio Stick Layer: content
   ---------------------------------------------------------------------
   One entry per visualizer. bio-stick.js reads window.BIO_STICK_ENTRIES
   and mounts a "Call it first" panel beside each visualizer it finds on
   the page. Entries whose mount is not on the page are skipped.

   Loop per visualizer: predict (one tap) -> watch the frames -> verdict
   with the why and the named trap -> one closed-book check -> an Ace
   Card that comes back through the existing deck.

   Authoring rules (scripts/validate-bio-stick.mjs enforces them):
   - plain ASCII only, no em dashes, no "wrong" / "incorrect" / "failed"
   - 3 options, key is the index of the right one, traps[i] explains
     why option i is tempting and where it actually belongs (null on key)
   - option text 70 characters or fewer, why 320 or fewer
   - answer: one plain sentence; it becomes the card's label on Today
   - hub must be one of: cell genetics physiology diversity devo evolution

   Steps (setup and frames):
     { set: '#selector', value: n }  sets an input and fires input/change
     { click: '#selector' }          fires a bubbling click (works on SVG)
     { operon: { mode, lactose, glucose, trp } }  lac/trp operon state
   ===================================================================== */
(function (root) {
  'use strict';

  var LAB = function (name) {
    return {
      mount: '.lab-module[data-module="' + name + '"]',
      where: 'afterbegin',
      veil: '.lab-module[data-module="' + name + '"] > :not(.stick)',
      tab: name
    };
  };
  function extend(base, extra) {
    var out = {}, k;
    for (k in base) out[k] = base[k];
    for (k in extra) out[k] = extra[k];
    return out;
  }

  root.BIO_STICK_ENTRIES = [

    /* ---------------- Cell hub ---------------- */
    {
      id: 'tonicity', hub: 'cell', title: 'Tonicity', subtopic: 'Membrane transport',
      mount: '#tonicityBody', where: 'beforebegin', veil: '#tonicityBody',
      setup: [{ click: '#tonAnimal' }],
      frames: [
        [{ set: '#tonSolute', value: 50 }],
        [{ set: '#tonSolute', value: 32 }],
        [{ set: '#tonSolute', value: 18 }],
        [{ set: '#tonSolute', value: 4 }]
      ],
      still: ['#tonCellSvg'], caption: '#tonStateName', captionExtra: '#tonOutcome',
      hook: 'Water chases solute.',
      predict: {
        q: 'An animal cell drops into pure water. What happens to it?',
        options: [
          'It swells and bursts (lyses)',
          'It shrivels up (crenates)',
          'It swells, then holds its shape'
        ],
        key: 0,
        traps: [
          null,
          'Shriveling is the salty-water picture. Pure water has less solute than the cell, so water rushes in, not out.',
          'That is a plant cell. Its wall stops the swelling. An animal cell has no wall, so the membrane gives.'
        ],
        why: 'The cell has more solute than pure water, so water floods in. With no wall to push back, the membrane stretches until it bursts.',
        answer: 'Animal cell in pure water: water rushes in, it swells and bursts (lyses).'
      },
      check: {
        q: 'A plant cell sits in water much saltier than the cell. What do you see?',
        options: [
          'It swells and presses on its wall (turgid)',
          'The membrane pulls off the wall (plasmolysis)',
          'Nothing changes. The rigid wall holds its shape'
        ],
        key: 1,
        traps: [
          'Turgid is the pure-water picture for a plant cell. Salt water pulls water out.',
          null,
          'The wall keeps the outer shape, but water still leaves. The membrane shrinks away inside it.'
        ],
        why: 'Water saltier than the cell is hypertonic. Water leaves the cell, the membrane shrinks away from the rigid wall, and the wall keeps its shape.',
        answer: 'Plant cell in hypertonic salt water: water leaves and the membrane pulls off the wall (plasmolysis).'
      }
    },

    {
      id: 'respiration', hub: 'cell', title: 'Cellular respiration', subtopic: 'ETC & oxidative phosphorylation',
      mount: '#krebsScrubberBody', where: 'beforebegin', veil: '#krebsScrubberBody',
      frames: [
        [{ set: '#krbStage', value: 19 }],
        [{ set: '#krbStage', value: 34 }],
        [{ set: '#krbStage', value: 54 }],
        [{ set: '#krbStage', value: 70 }],
        [{ set: '#krbStage', value: 100 }]
      ],
      still: ['#krbSvg'], caption: '#krbStageName', captionExtra: '#krbTotalATP',
      hook: 'Glycolysis and Krebs load the trucks. The ETC cashes them in.',
      predict: {
        q: 'Follow one glucose all the way through. Where is most of the ATP made?',
        options: [
          'Glycolysis, which splits glucose',
          'The Krebs cycle, which gives off CO2',
          'The ETC and ATP synthase'
        ],
        key: 2,
        traps: [
          'Glycolysis nets only 2 ATP. It is the start, not the payday.',
          'Krebs makes only 2 ATP per glucose. Its real job is loading NADH and FADH2.',
          null
        ],
        why: 'NADH and FADH2 hand their electrons to the ETC. That builds a proton gradient. The gradient spins ATP synthase, which makes about 28 of the roughly 32 ATP per glucose.',
        answer: 'Most ATP comes from the ETC and ATP synthase (oxidative phosphorylation), about 28 of 32.'
      },
      check: {
        q: 'In a eukaryotic cell, where does the Krebs cycle run?',
        options: [
          'Inner mitochondrial membrane',
          'Mitochondrial matrix',
          'Cytoplasm'
        ],
        key: 1,
        traps: [
          'The inner membrane holds the ETC and ATP synthase, the next stop.',
          null,
          'The cytoplasm is where glycolysis runs, before pyruvate enters the mitochondrion.'
        ],
        why: 'Glycolysis: cytoplasm. Pyruvate oxidation and Krebs: matrix (succinate dehydrogenase, which doubles as Complex II, is the one Krebs enzyme in the inner membrane). ETC and ATP synthase: inner membrane.',
        answer: 'The Krebs cycle runs in the mitochondrial matrix.'
      }
    },

    /* ---------------- Physiology hub ---------------- */
    extend(LAB('endocrine'), {
      id: 'endocrine', hub: 'physiology', title: 'Endocrine glands', subtopic: 'Endocrine system & hormones',
      frames: [
        [{ click: '[data-endo="hypo"]' }],
        [{ click: '[data-endo="post"]' }]
      ],
      still: ['#endoSide'],
      hook: 'Hypothalamus makes it, posterior pituitary ships it.',
      predict: {
        q: 'Where is ADH made?',
        options: [
          'The posterior pituitary',
          'The hypothalamus',
          'The anterior pituitary'
        ],
        key: 1,
        traps: [
          'The posterior pituitary stores and releases ADH. It does not make it.',
          null,
          'The anterior pituitary makes its own hormones, like GH and prolactin. ADH is not one of them.'
        ],
        why: 'Neurons in the hypothalamus make ADH and oxytocin. Their axons carry the hormones down to the posterior pituitary. It releases them into the blood.',
        answer: 'ADH is made in the hypothalamus and released by the posterior pituitary.'
      },
      check: {
        q: 'Someone takes extra T4 pills, so blood T4 climbs. What happens to their TSH?',
        options: [
          'TSH rises',
          'TSH stays the same',
          'TSH falls'
        ],
        key: 2,
        traps: [
          'Rising TSH would push T4 even higher. The axis brakes itself instead.',
          'The pituitary is listening. High T4 changes its output.',
          null
        ],
        why: 'This is negative feedback. High T3 and T4 tell the hypothalamus and anterior pituitary to cut TRH and TSH. The thyroid slows down.',
        answer: 'High T4 lowers TSH: negative feedback on the hypothalamus and anterior pituitary.'
      }
    }),

    extend(LAB('nephron'), {
      id: 'nephron', hub: 'physiology', title: 'Nephron', subtopic: 'Excretory system & nephron',
      frames: [
        [{ click: '#nephronSvg .seg[data-seg="descending"]' }],
        [{ click: '#nephronSvg .seg[data-seg="ascending"]' }]
      ],
      still: ['#nephronSvg', '#nephronSide'],
      hook: 'Going down drops water. Coming up pumps salt.',
      predict: {
        q: 'Filtrate climbs the thick ascending limb. What leaves the tubule there?',
        options: [
          'Water only',
          'Salt only',
          'Both salt and water'
        ],
        key: 1,
        traps: [
          'Water only is the descending limb. The ascending limb is the reverse.',
          null,
          'If water followed the salt, the filtrate could never get dilute. The ascending limb is sealed to water.'
        ],
        why: 'The thick ascending limb pulls Na+, K+ and Cl- out of the filtrate (NKCC2, powered by the Na+/K+ pump) but is sealed to water. That makes the medulla salty and the filtrate dilute.',
        answer: 'Thick ascending limb: salt moved out of the filtrate, impermeable to water.'
      },
      check: {
        q: 'Which segment does ADH act on to save water?',
        options: [
          'The collecting duct',
          'The descending limb',
          'The proximal tubule'
        ],
        key: 0,
        traps: [
          null,
          'The descending limb is always open to water. It does not need ADH.',
          'The proximal tubule reabsorbs about two thirds of the water through channels that are always open. ADH does not tune it.'
        ],
        why: 'ADH puts aquaporin-2 channels into the collecting duct. More ADH, more water pulled back, more concentrated urine.',
        answer: 'ADH acts on the collecting duct (aquaporin-2), saving water.'
      }
    }),

    {
      id: 'action-potential', hub: 'physiology', title: 'Action potential', subtopic: 'Nervous system & action potentials',
      mount: '#apScrubberBody', where: 'beforebegin', veil: '#apScrubberBody',
      frames: [
        [{ set: '#apStage', value: 9 }],
        [{ set: '#apStage', value: 24 }],
        [{ set: '#apStage', value: 36 }],
        [{ set: '#apStage', value: 51 }]
      ],
      still: ['#apScrubberSvg'], caption: '#apStageName',
      hook: 'Na+ in to rise, K+ out to fall.',
      predict: {
        q: 'The membrane just hit its +30 mV peak. What brings it back down?',
        options: [
          'Na+ channels inactivate and K+ flows out',
          'The Na+ that rushed in flows back out of the cell',
          'The Na+/K+ pump switches on'
        ],
        key: 0,
        traps: [
          null,
          'Na+ channels inactivate at the peak, so Na+ cannot flow back out through them. K+ leaving is what drops the voltage.',
          'The pump keeps the gradient steady over time. It is far too slow to end a spike.'
        ],
        why: 'At the peak, voltage-gated Na+ channels inactivate and voltage-gated K+ channels open. K+ rushes out, so the inside swings negative again.',
        answer: 'Repolarization: Na+ channels inactivate and voltage-gated K+ channels let K+ out.'
      },
      check: {
        q: 'Why does the membrane dip below -70 mV right after a spike?',
        options: [
          'Na+ channels stay inactive',
          'The pump moves 3 Na+ out per 2 K+ in',
          'Slow K+ channels let extra K+ out'
        ],
        key: 2,
        traps: [
          'Inactive Na+ channels explain the refractory period. They do not pull the voltage below rest.',
          'The pump is real, but it is slow. The dip comes from the K+ channels.',
          null
        ],
        why: 'Voltage-gated K+ channels close slowly. For a moment extra K+ keeps leaving, so the membrane overshoots past rest. That is hyperpolarization.',
        answer: 'The undershoot (hyperpolarization) comes from slow-closing K+ channels letting extra K+ out.'
      }
    },

    {
      id: 'cross-bridge', hub: 'physiology', title: 'Cross-bridge cycle', subtopic: 'Muscular system & sliding filament',
      mount: '#crossBridgeBody', where: 'beforebegin', veil: '#crossBridgeBody',
      frames: [
        [{ set: '#cbStage', value: 10 }],
        [{ set: '#cbStage', value: 30 }],
        [{ set: '#cbStage', value: 50 }],
        [{ set: '#cbStage', value: 70 }],
        [{ set: '#cbStage', value: 90 }]
      ],
      still: ['#cbSvg'], caption: '#cbStageName', pairId: 'muscle',
      hook: 'ATP binding lets go; ATP splitting cocks. No ATP, no letting go.',
      predict: {
        q: 'A muscle runs out of ATP. Where does the myosin head end up?',
        options: [
          'Still bound to actin',
          'Floating free, detached from actin',
          'Cocked and ready to bind'
        ],
        key: 0,
        traps: [
          null,
          'Letting go of actin is the step that needs ATP. No ATP, no release.',
          'Cocking uses the energy from splitting ATP. No ATP, it never cocks again.'
        ],
        why: 'ATP binding is what pops myosin off actin. With no ATP, the head stays bound after the power stroke. That locked state is rigor.',
        answer: 'No ATP: myosin stays bound to actin (rigor), because ATP is what releases it.'
      },
      check: {
        q: 'In skeletal muscle, what does calcium do to start a contraction?',
        options: [
          'Binds troponin to uncover actin sites',
          'Binds myosin to power the stroke',
          'Moves into the SR to set off the cycle'
        ],
        key: 0,
        traps: [
          null,
          'The stroke runs on ATP hydrolysis and Pi release. Calcium only uncovers the binding sites.',
          'Pumping calcium back into the SR is how the muscle relaxes.'
        ],
        why: 'Calcium from the SR binds troponin C. Troponin drags tropomyosin off actin, exposing the sites myosin binds.',
        answer: 'Calcium binds troponin, which moves tropomyosin off actin binding sites.'
      }
    },

    extend(LAB('filament'), {
      id: 'sarcomere', hub: 'physiology', title: 'Sarcomere bands', subtopic: 'Muscular system & sliding filament',
      frames: [
        [{ click: '[data-sf="relaxed"]' }],
        [{ click: '[data-sf="contracting"]' }],
        [{ click: '[data-sf="contracted"]' }]
      ],
      still: ['#sfSvg', '#sfTem'], pairId: 'muscle',
      hook: 'A band stays (it is myosin). I and H shrink.',
      predict: {
        q: 'A sarcomere contracts fully. Which band keeps its length?',
        options: [
          'The I band',
          'The A band',
          'The H zone'
        ],
        key: 1,
        traps: [
          'The I band is actin only. It shrinks as the actin slides in.',
          null,
          'The H zone is myosin only, with no actin over it. It shrinks and can vanish.'
        ],
        why: 'The A band is the length of the myosin filaments. As actin slides in over myosin, the I band and H zone shrink. The A band holds its length.',
        answer: 'In contraction the A band stays the same; the I band and H zone shrink.'
      },
      check: {
        q: 'During contraction, which filament gets shorter?',
        options: [
          'Actin, the thin filament',
          'Myosin, the thick filament',
          'Neither of them'
        ],
        key: 2,
        traps: [
          'Actin slides inward, but its length does not change.',
          'Myosin pulls, but its length does not change. That is why the A band holds.',
          null
        ],
        why: 'Sliding filament theory: overlap increases and the Z lines move closer, but actin and myosin keep their own lengths.',
        answer: 'In contraction neither actin nor myosin shortens; they slide and the overlap grows.'
      }
    }),

    extend(LAB('bohr'), {
      id: 'bohr', hub: 'physiology', title: 'Hemoglobin curve', subtopic: 'O2/CO2 transport (Hb curve)',
      frames: [
        [{ click: '#bohrPresetReset' }],
        [{ click: '#bohrPresetTissue' }]
      ],
      still: ['#bohrSvg'], caption: '#bohrSide h5',
      hook: 'CADET, face right: CO2, Acid, 2,3-BPG, Exercise, Temperature.',
      predict: {
        q: 'Working muscle: more CO2, more acid, warmer. Which way does the hemoglobin curve shift?',
        options: [
          'Left: Hb holds on to O2 tighter',
          'Right: Hb releases O2 more easily',
          'It does not move. Only pO2 matters'
        ],
        key: 1,
        traps: [
          'Left is the lung picture, where Hb loads O2. Holding tighter in muscle would starve it.',
          null,
          'pO2 matters, but CO2, acid, heat and 2,3-BPG all change how hard Hb grips.'
        ],
        why: 'CO2, H+, heat and 2,3-BPG all loosen hemoglobin\'s grip on O2. The curve shifts right, so more O2 unloads right where the muscle needs it.',
        answer: 'Working tissue shifts the Hb curve right (Bohr effect, plus heat and 2,3-BPG): O2 unloads more easily.'
      },
      check: {
        q: 'Where does fetal hemoglobin\'s curve sit compared with adult Hb?',
        options: [
          'Left: higher O2 affinity',
          'Right: lower O2 affinity',
          'Same place as adult Hb'
        ],
        key: 0,
        traps: [
          null,
          'A right-shifted fetal curve would lose the tug of war with mom\'s Hb.',
          'With matching curves, O2 still diffuses across, but fetal blood would load far less of it at the low pO2 of the placenta.'
        ],
        why: 'Fetal Hb binds 2,3-BPG poorly, so its affinity for O2 is higher. Its curve sits left, so it can take O2 off maternal Hb.',
        answer: 'Fetal Hb curve sits left of adult (higher O2 affinity, weak 2,3-BPG binding).'
      }
    }),

    extend(LAB('blood'), {
      id: 'blood-types', hub: 'physiology', title: 'ABO blood types', subtopic: 'Blood components & types',
      frames: [
        [{ click: '[data-blood="abo"]' }]
      ],
      still: ['#bloodBody'],
      hook: 'O negative: no A, no B, no D on the cell, so anti-A, anti-B and anti-D have nothing to grab.',
      predict: {
        q: 'Type O negative red cells. Who can receive them in an emergency?',
        options: [
          'Only O negative people',
          'Only type AB people',
          'Any ABO and Rh type'
        ],
        key: 2,
        traps: [
          'That is who an O negative person can receive from. As a donor, its cells carry no A, B or D antigen to attack.',
          'AB positive is the universal red cell recipient, but every ABO and Rh type can take O negative cells.',
          null
        ],
        why: 'O negative red cells carry no A, no B and no Rh(D) antigen. A recipient\'s anti-A, anti-B or anti-D has nothing to grab, so O negative is the universal red cell donor.',
        answer: 'O negative red cells can go to any ABO and Rh type: no A, B or D antigen (universal donor).'
      },
      check: {
        q: 'Which antibody does a type A person carry in their plasma?',
        options: [
          'Anti-A',
          'Anti-B',
          'None'
        ],
        key: 1,
        traps: [
          'Anti-A would attack their own red cells.',
          null,
          'No antibodies is type AB.'
        ],
        why: 'For ABO, you carry antibodies against the A or B antigen you lack. Type A cells carry A antigen, so the plasma carries anti-B.',
        answer: 'Type A blood: A antigen on the cells, anti-B antibodies in the plasma.'
      }
    }),

    extend(LAB('repro'), {
      id: 'ovarian-cycle', hub: 'physiology', title: 'Menstrual cycle', subtopic: 'Menstrual cycle & ovulation (LH/FSH)',
      frames: [
        [{ set: '#reproSlider', value: 4 }],
        [{ set: '#reproSlider', value: 10 }],
        [{ set: '#reproSlider', value: 12 }],
        [{ set: '#reproSlider', value: 14 }]
      ],
      still: ['#reproSvg'], caption: '#reproPhaseTag', captionExtra: '#reproDayTag',
      hook: 'Estrogen flips the switch, LH pulls the trigger.',
      predict: {
        q: 'What triggers ovulation around day 14?',
        options: [
          'A surge of LH',
          'A peak of progesterone',
          'A drop in FSH'
        ],
        key: 0,
        traps: [
          null,
          'Progesterone peaks later, in the second half of the cycle. It does not set off ovulation.',
          'FSH rises with LH at the surge. LH is the trigger.'
        ],
        why: 'Rising estrogen from the maturing follicle flips to positive feedback on the pituitary. That fires a sharp LH surge, and the follicle ruptures about a day later.',
        answer: 'Ovulation is triggered by the LH surge (estrogen positive feedback).'
      },
      check: {
        q: 'After ovulation, which structure makes progesterone?',
        options: [
          'The anterior pituitary',
          'The corpus luteum',
          'The hypothalamus'
        ],
        key: 1,
        traps: [
          'The anterior pituitary makes LH and FSH, not progesterone.',
          null,
          'The hypothalamus makes GnRH, which drives the pituitary.'
        ],
        why: 'The emptied follicle becomes the corpus luteum, which makes progesterone to hold the endometrium. Without a pregnancy it fades and menses starts.',
        answer: 'After ovulation the corpus luteum makes progesterone.'
      }
    }),

    extend(LAB('bone'), {
      id: 'bone-layers', hub: 'physiology', title: 'Bone layers', subtopic: 'Skeletal system & joints',
      frames: [
        [{ set: '#boneStage', value: 0 }],
        [{ set: '#boneStage', value: 1 }],
        [{ set: '#boneStage', value: 3 }]
      ],
      still: ['#boneSvg'], caption: '#boneStageName',
      hook: 'Peri is the perimeter. Endo is inside. Haversian runs the length; Volkmann goes across.',
      predict: {
        q: 'Peel a long bone from the outside in. Which membrane lines its hollow center?',
        options: [
          'The periosteum',
          'The endosteum',
          'Articular cartilage'
        ],
        key: 1,
        traps: [
          'The periosteum wraps the outside of the bone. Peri means around.',
          null,
          'Articular cartilage caps the joint ends. It is not a lining inside the bone.'
        ],
        why: 'The endosteum lines the inside: the medullary cavity, the struts of spongy bone and the canals. The periosteum covers the outside everywhere except the joint surfaces.',
        answer: 'The endosteum lines the medullary cavity; the periosteum covers the outside of the bone.'
      },
      check: {
        q: 'What runs through the center of every osteon?',
        options: [
          'A Volkmann canal',
          'A Haversian canal',
          'A trabecula, a bony strut'
        ],
        key: 1,
        traps: [
          'Volkmann canals run across, linking osteons to each other and to the periosteum.',
          null,
          'A trabecula is a strut of spongy bone, and spongy bone has no osteons.'
        ],
        why: 'Each osteon is rings of bone matrix around a central Haversian canal, which carries blood vessels and nerves along the length of the bone.',
        answer: 'Each osteon is built around a central Haversian canal carrying vessels and nerves.'
      }
    }),

    /* ---------------- Genetics hub ---------------- */
    extend(LAB('operon'), {
      id: 'lac-operon', hub: 'genetics', title: 'Lac operon', subtopic: 'Gene regulation',
      setup: [{ click: '[data-omode="lac"]' }],
      frames: [
        [{ operon: { mode: 'lac', lactose: false, glucose: true } }],
        [{ operon: { mode: 'lac', lactose: true, glucose: true } }],
        [{ operon: { mode: 'lac', lactose: true, glucose: false } }]
      ],
      still: ['#operonSvg'], caption: '#operonState',
      hook: 'Lactose lifts the brake. Low glucose hits the gas.',
      predict: {
        q: 'Lactose is around and glucose is gone. What is the lac operon doing?',
        options: [
          'Off: the repressor still sits on the operator',
          'On, but only a little',
          'On at full speed'
        ],
        key: 2,
        traps: [
          'Lactose (as allolactose) pulls the repressor off. With lactose here, the brake is gone.',
          'That is lactose with glucose still around. CAP only boosts it when glucose is low.',
          null
        ],
        why: 'Lactose (as allolactose) removes the repressor. Low glucose raises cAMP, so CAP-cAMP binds and recruits RNA polymerase. Both switches say go.',
        answer: 'Lactose present, glucose absent: lac operon on at full speed (repressor off, CAP-cAMP on).'
      },
      check: {
        q: 'Tryptophan is plentiful. What does the trp operon do?',
        options: [
          'Turns off: trp helps the repressor bind',
          'Turns on: trp pulls the repressor off',
          'It depends on how much glucose is around'
        ],
        key: 0,
        traps: [
          null,
          'That is the lac pattern, where lactose pulls the repressor off. Tryptophan does the reverse: it helps the repressor bind.',
          'Glucose and CAP are the lac operon\'s logic, not trp\'s.'
        ],
        why: 'The trp operon is repressible. Tryptophan is the corepressor: it switches the repressor on, which blocks the operator. Enough trp, stop making it.',
        answer: 'High tryptophan turns the trp operon off (trp is the corepressor).'
      }
    }),

    extend(LAB('hw'), {
      id: 'hardy-weinberg', hub: 'genetics', title: 'Hardy-Weinberg', subtopic: 'Hardy-Weinberg / population genetics',
      frames: [
        [{ set: '#hwQ2', value: 0.0625 }]
      ],
      still: ['.lab-module[data-module="hw"] .hw-bars'], caption: '#hwCarriers', captionLabel: 'Carriers (2pq): ',
      hook: 'Square root first. Affected is q squared; carriers are 2pq.',
      predict: {
        q: 'A population is in Hardy-Weinberg equilibrium. 1 in 16 people show a recessive trait (q squared = 0.0625). What fraction are carriers (Aa)?',
        options: [
          '1 in 4',
          '1 in 16',
          '3 in 8'
        ],
        key: 2,
        traps: [
          '1 in 4 is q, the allele frequency. Carriers are 2pq.',
          'That is q squared, the affected people. Carriers outnumber them.',
          null
        ],
        why: 'q is the square root of 0.0625, which is 0.25, so p is 0.75. Carriers are 2pq: 2 x 0.75 x 0.25 = 0.375, which is 3 in 8.',
        answer: 'If q squared is 0.0625, q is 0.25 and carriers (2pq) are 0.375.'
      },
      check: {
        q: 'A population stays in Hardy-Weinberg equilibrium. Which must be true?',
        options: [
          'One allele is favored by selection',
          'Mating is random',
          'The population is small'
        ],
        key: 1,
        traps: [
          'Selection changes allele frequencies, so equilibrium breaks.',
          null,
          'Small populations drift by chance. Equilibrium needs a large one.'
        ],
        why: 'Equilibrium needs a large population, random mating, no mutation, no migration and no selection. Break one and the frequencies shift (nonrandom mating shifts genotype frequencies, not allele frequencies).',
        answer: 'Hardy-Weinberg needs random mating, a large population, and no selection, mutation or migration.'
      }
    }),

    /* ---------------- Development hub ---------------- */
    {
      id: 'embryo-stages', hub: 'devo', title: 'Embryo stages', subtopic: 'Embryonic stages',
      mount: '#embryoTL', where: 'beforebegin', veil: '#embryoTL',
      frames: [
        [{ click: '[data-emb="zygote"]' }],
        [{ click: '[data-emb="cleavage"]' }],
        [{ click: '[data-emb="blastula"]' }],
        [{ click: '[data-emb="gastrula"]' }]
      ],
      still: ['#embryoTL .embryo-stage.active .em-svg', '#timelineSide'],
      hook: 'Ball, then hollow ball, then the fold that makes three layers.',
      predict: {
        q: 'At which stage does the embryo first have three germ layers?',
        options: [
          'Blastula',
          'Gastrula',
          'Neurula'
        ],
        key: 1,
        traps: [
          'The blastula is a hollow ball of cells around the blastocoel. The three germ layers come later.',
          null,
          'Neurulation needs ectoderm and mesoderm already in place. It comes after gastrulation.'
        ],
        why: 'Gastrulation moves cells inward (through the blastopore in frogs and sea urchins, the primitive streak in birds and mammals) and lays down ectoderm, mesoderm and endoderm. In deuterostomes, the blastopore becomes the anus.',
        answer: 'The three germ layers first appear at the gastrula stage (gastrulation).'
      },
      check: {
        q: 'Which germ layer builds the nervous system?',
        options: [
          'Mesoderm',
          'Endoderm',
          'Ectoderm'
        ],
        key: 2,
        traps: [
          'Mesoderm makes muscle, bone, blood, heart and kidneys.',
          'Endoderm lines the gut and makes the lungs, liver and pancreas.',
          null
        ],
        why: 'Ectoderm makes the outside and the nerves: epidermis, brain, spinal cord. The neural tube folds in from the ectoderm on the back.',
        answer: 'Ectoderm makes the nervous system and the epidermis.'
      }
    },

    /* ---------------- Evolution hub ---------------- */
    {
      id: 'homology', hub: 'evolution', title: 'Homology', subtopic: 'Evidence of evolution',
      mount: '#evidBody', closest: '.cardiac-stage', where: 'beforebegin',
      veil: '#evidBody', veilClosest: '.cardiac-stage',
      frames: [
        [{ click: '[data-evid="anat"]' }]
      ],
      still: ['#evidBody'],
      hook: 'Same bones, different jobs: homologous.',
      predict: {
        q: 'A human arm and a bat wing share the same bones but do different jobs. What kind of evidence is that?',
        options: [
          'Analogous structures',
          'Vestigial structures',
          'Homologous structures'
        ],
        key: 2,
        traps: [
          'Analogous means the same job from separate origins. These limbs share one bone plan, so they share an origin.',
          'Vestigial means reduced and barely used, like the human tailbone.',
          null
        ],
        why: 'The same bone plan came from a common ancestor and got reshaped for different jobs. Homology is evidence of shared ancestry (divergent evolution).',
        answer: 'Same bones, different jobs (human arm, bat wing) are homologous structures.'
      },
      check: {
        q: 'A bird wing and a butterfly wing are both used to fly. What kind of structures are they?',
        options: [
          'Analogous, by convergent evolution',
          'Homologous, by divergent evolution',
          'Homologous, by convergent evolution'
        ],
        key: 0,
        traps: [
          null,
          'Birds and butterflies did not inherit wings from a winged common ancestor.',
          'Convergent evolution makes analogous parts. Homologous parts come from a shared ancestor.'
        ],
        why: 'Separate lineages evolved flight on their own and arrived at similar solutions. That is convergent evolution, and it makes analogous structures.',
        answer: 'Bird and butterfly wings are analogous: same job, separate origins (convergent evolution).'
      }
    }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
