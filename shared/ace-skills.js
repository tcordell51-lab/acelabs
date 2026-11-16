/* ace-skills.js : one canonical skill tag for every question, the same in the bank build and in
   the browser (v2, 2026-11-16: the regex guesses are replaced by the portal's taxonomy).

   The tag is a canonical DAT subtopic from the AceTheDAT portal (src/scheduling/curriculum/
   subtopics.js, snapshot in scripts/bank/taxonomy.json), for example gc_buffers or
   oc_hydroboration. It is found in three steps, and nothing is guessed:

     1. metadata   the item's own topic (or, for the private banks, its skill_id) names the
                   candidate subtopics in a per-bank table below (CAND). One candidate: done.
     2. table      several candidates: a fixed keyword table per subtopic (KW) is read against
                   the stem, then the explanation. Exactly one candidate scores highest: done.
     3. low        no candidate wins (a tie, or no keyword at all): the item is flagged low
                   confidence and tagged with the parent topic only (gc_acids_bases), never a
                   picked subtopic. scripts/build-ace-banks.mjs writes the flagged list.

   Returns { skill, skillName, canon, canonName, topicId, conf }:
     canon     the subtopic id, or null when conf is 'low'
     topicId   the parent topic (registry.js), always set when the topic is known
     skill     what Repair matches first. Biology, chemistry and QR: canon, else topicId.
               PAT and Reading keep their subtest or question type (the trainers route by it)
               and carry canon beside it.
     conf      'meta' | 'table' | 'low'

   Used by scripts/build-ace-banks.mjs, scripts/bank/build-private.mjs (node) and by
   shared/ace-record.js / ace-test-review.js (browser).

     AceSkills.tag(item)  item = { section, topic, topicName, stem|q, choices|opts, why, canonCandidates? } */
(function (root) {
  'use strict';
  var NAMES = {"bio_biomolecules":["Biomolecules (carbs, lipids, proteins, nucleic acids)","bio_cell_molecular"],"bio_protein_structure":["Protein structure (1°-4°)","bio_cell_molecular"],"bio_enzymes":["Enzymes & kinetics","bio_cell_molecular"],"bio_dna_replication":["DNA replication","bio_cell_molecular"],"bio_transcription":["Transcription","bio_cell_molecular"],"bio_translation":["Translation","bio_cell_molecular"],"bio_gene_regulation":["Gene regulation","bio_cell_molecular"],"bio_mutations_repair":["Mutations & DNA repair","bio_cell_molecular"],"bio_biotechnology":["Biotechnology & lab (PCR, gel, cloning, microscopy)","bio_cell_molecular"],"bio_glycolysis":["Glycolysis","bio_cell_molecular"],"bio_krebs":["Krebs cycle","bio_cell_molecular"],"bio_etc_oxphos":["ETC & oxidative phosphorylation","bio_cell_molecular"],"bio_fermentation":["Fermentation (anaerobic respiration)","bio_cell_molecular"],"bio_photosynthesis":["Photosynthesis","bio_cell_molecular"],"bio_cell_organelles":["Cell organelles & function","bio_cell_molecular"],"bio_prokaryote_eukaryote":["Prokaryote vs eukaryote cells","bio_cell_molecular"],"bio_membrane_transport":["Membrane transport","bio_cell_molecular"],"bio_cell_signaling":["Cell signaling","bio_cell_molecular"],"bio_cytoskeleton":["Cytoskeleton","bio_cell_molecular"],"bio_cell_cycle":["Cell cycle & checkpoints","bio_cell_molecular"],"bio_mitosis":["Mitosis","bio_cell_molecular"],"bio_meiosis":["Meiosis","bio_cell_molecular"],"bio_apoptosis":["Apoptosis (programmed cell death)","bio_cell_molecular"],"bio_endosymbiosis":["Endosymbiotic theory","bio_cell_molecular"],"bio_mendelian":["Mendelian inheritance","bio_genetics"],"bio_dihybrid":["Dihybrid crosses","bio_genetics"],"bio_sex_linked":["Sex-linked inheritance","bio_genetics"],"bio_pedigrees":["Pedigree analysis","bio_genetics"],"bio_codominance":["Codominance & incomplete dominance","bio_genetics"],"bio_epistasis":["Epistasis & polygenic traits","bio_genetics"],"bio_hardy_weinberg":["Hardy-Weinberg / population genetics","bio_genetics"],"bio_linkage":["Linkage & recombination","bio_genetics"],"bio_chromosomal_disorders":["Chromosomal disorders","bio_genetics"],"bio_taxonomy":["Taxonomy & classification (domains, kingdoms)","bio_diversity"],"bio_viruses":["Viruses","bio_diversity"],"bio_prokaryotes":["Bacteria & archaea","bio_diversity"],"bio_fungi":["Fungi","bio_diversity"],"bio_protists":["Protists","bio_diversity"],"bio_animal_taxonomy":["Animal phyla","bio_diversity"],"bio_plant_physiology":["Plant structure & physiology","bio_diversity"],"bio_transpiration":["Transpiration & water transport","bio_diversity"],"bio_plant_reproduction":["Plant reproduction & alternation of generations","bio_diversity"],"bio_plant_hormones":["Plant hormones & tropisms","bio_diversity"],"bio_circulatory":["Circulatory system","bio_anatomy_physiology"],"bio_cardiac_cycle":["Cardiac cycle & ECG","bio_anatomy_physiology"],"bio_blood_components":["Blood components & types","bio_anatomy_physiology"],"bio_respiratory":["Respiratory system & gas exchange","bio_anatomy_physiology"],"bio_o2_co2_transport":["O2 / CO2 transport (Hb curve)","bio_anatomy_physiology"],"bio_digestive":["Digestive system & enzymes","bio_anatomy_physiology"],"bio_excretory_nephron":["Excretory system & nephron","bio_anatomy_physiology"],"bio_nervous_action_potential":["Nervous system & action potentials","bio_anatomy_physiology"],"bio_neurotransmitters":["Neurotransmitters & synapses","bio_anatomy_physiology"],"bio_brain_regions":["Brain regions & functions","bio_anatomy_physiology"],"bio_autonomic":["Autonomic vs somatic nervous","bio_anatomy_physiology"],"bio_sensory":["Sensory systems (eye, ear, receptors)","bio_anatomy_physiology"],"bio_endocrine_hormones":["Endocrine system & hormones","bio_anatomy_physiology"],"bio_feedback_loops":["Feedback loops (negative/positive)","bio_anatomy_physiology"],"bio_muscular_contraction":["Muscular system & sliding filament","bio_anatomy_physiology"],"bio_skeletal":["Skeletal system & joints","bio_anatomy_physiology"],"bio_integumentary":["Integumentary & thermoregulation","bio_anatomy_physiology"],"bio_immune_innate":["Innate immunity","bio_anatomy_physiology"],"bio_immune_adaptive":["Adaptive immunity (B & T cells)","bio_anatomy_physiology"],"bio_lymphatic":["Lymphatic system","bio_anatomy_physiology"],"bio_male_reproductive":["Male reproductive system","bio_development_reproduction"],"bio_female_reproductive":["Female reproductive system","bio_development_reproduction"],"bio_menstrual_cycle":["Menstrual cycle & ovulation (LH/FSH)","bio_development_reproduction"],"bio_gametogenesis":["Spermatogenesis & oogenesis","bio_development_reproduction"],"bio_fertilization":["Fertilization","bio_development_reproduction"],"bio_embryonic_stages":["Embryonic stages (blastula, gastrula, neurulation)","bio_development_reproduction"],"bio_germ_layers":["Germ layers (ecto/meso/endoderm)","bio_development_reproduction"],"bio_placentation_hcg":["Placentation & hCG","bio_development_reproduction"],"bio_natural_selection":["Natural selection","bio_evolution_ecology"],"bio_evidence_evolution":["Evidence of evolution","bio_evolution_ecology"],"bio_speciation":["Speciation","bio_evolution_ecology"],"bio_biogeochem_cycles":["Biogeochemical cycles (C/N/water)","bio_evolution_ecology"],"bio_population_ecology":["Population ecology (r/K, survivorship)","bio_evolution_ecology"],"bio_community_ecology":["Community ecology & symbiosis","bio_evolution_ecology"],"bio_food_webs":["Food webs & energy flow","bio_evolution_ecology"],"bio_biomes":["Biomes","bio_evolution_ecology"],"bio_animal_behavior":["Animal behavior (ethology)","bio_evolution_ecology"],"gc_subatomic":["Subatomic particles & isotopes","gc_atomic_structure"],"gc_electron_config":["Electron configuration","gc_atomic_structure"],"gc_quantum_numbers":["Quantum numbers & orbitals","gc_atomic_structure"],"gc_lewis_structures":["Lewis structures & formal charge","gc_atomic_structure"],"gc_resonance":["Resonance structures","gc_atomic_structure"],"gc_vsepr_geometry":["VSEPR & molecular geometry","gc_atomic_structure"],"gc_hybridization":["Hybridization & sigma/pi bonds","gc_atomic_structure"],"gc_bonding_types":["Bonding (ionic / covalent / metallic)","gc_atomic_structure"],"gc_molecular_polarity":["Bond & molecular polarity (dipoles)","gc_atomic_structure"],"gc_periodic_trends":["Periodic trends (radius, IE, EN, e- affinity)","gc_periodic_properties"],"gc_mole_concept":["Mole concept","gc_stoichiometry"],"gc_density_composition":["Density & percent composition","gc_stoichiometry"],"gc_empirical_molecular":["Empirical & molecular formulas","gc_stoichiometry"],"gc_balancing_equations":["Balancing chemical equations","gc_stoichiometry"],"gc_reaction_types":["Reaction types & predicting products","gc_stoichiometry"],"gc_limiting_reagent":["Limiting reagent & percent yield","gc_stoichiometry"],"gc_gas_laws":["Gas laws (Boyle / Charles / combined)","gc_gases"],"gc_ideal_gas":["Ideal gas law","gc_gases"],"gc_partial_pressure":["Partial pressure & Dalton's","gc_gases"],"gc_kinetic_molecular":["Kinetic-molecular theory & Graham's (real gases)","gc_gases"],"gc_intermolecular_forces":["Intermolecular forces","gc_liquids_solids"],"gc_phase_diagrams":["Phase diagrams","gc_liquids_solids"],"gc_heating_curves":["Heating/cooling curves & phase changes","gc_liquids_solids"],"gc_vapor_pressure":["Vapor pressure","gc_liquids_solids"],"gc_solids_unit_cells":["Solids & unit cells (types of solids)","gc_liquids_solids"],"gc_molarity_molality":["Molarity, molality, normality","gc_solutions"],"gc_dilution":["Dilution calculations","gc_solutions"],"gc_solubility_rules":["Solubility rules","gc_solutions"],"gc_net_ionic":["Net ionic & precipitation reactions","gc_solutions"],"gc_colligative":["Colligative properties (Raoult's, FP, BP, osmotic)","gc_solutions"],"gc_bronsted_lewis":["Bronsted vs Lewis acids/bases","gc_acids_bases"],"gc_ph_poh":["pH / pOH","gc_acids_bases"],"gc_ka_kb":["Ka / Kb / conjugate pairs","gc_acids_bases"],"gc_polyprotic":["Polyprotic acids","gc_acids_bases"],"gc_buffers":["Buffers & Henderson-Hasselbalch","gc_acids_bases"],"gc_titration":["Titration curves & indicators","gc_acids_bases"],"gc_keq_kp_ksp":["Keq / Kp / Ksp","gc_equilibrium"],"gc_ice_tables":["ICE tables","gc_equilibrium"],"gc_le_chatelier":["Le Chatelier's principle","gc_equilibrium"],"gc_common_ion":["Common ion effect","gc_equilibrium"],"gc_enthalpy":["Enthalpy & heats of reaction","gc_thermodynamics"],"gc_hess_law":["Hess's law","gc_thermodynamics"],"gc_calorimetry":["Calorimetry & heat capacity","gc_thermodynamics"],"gc_entropy":["Entropy","gc_thermodynamics"],"gc_gibbs":["Gibbs free energy & spontaneity","gc_thermodynamics"],"gc_rate_factors":["Factors affecting reaction rate","gc_kinetics"],"gc_rate_laws":["Rate laws & reaction order","gc_kinetics"],"gc_integrated_rate_laws":["Integrated rate laws & half-life","gc_kinetics"],"gc_arrhenius":["Arrhenius & activation energy","gc_kinetics"],"gc_mechanisms_rds":["Reaction mechanisms & rate-determining step","gc_kinetics"],"gc_catalysts":["Catalysts","gc_kinetics"],"gc_oxidation_states":["Oxidation states & balancing redox","gc_electrochemistry"],"gc_galvanic":["Galvanic / voltaic cells","gc_electrochemistry"],"gc_electrolytic":["Electrolytic cells","gc_electrochemistry"],"gc_faradays":["Faraday's law / electrolysis stoichiometry","gc_electrochemistry"],"gc_nernst":["Nernst equation","gc_electrochemistry"],"gc_decay_modes":["Alpha/beta/gamma/positron decay","gc_nuclear"],"gc_half_life":["Nuclear half-life","gc_nuclear"],"gc_fission_fusion":["Fission & fusion","gc_nuclear"],"gc_binding_energy":["Binding energy & mass defect","gc_nuclear"],"gc_lab_extraction":["Lab: extraction & distillation","gc_lab_techniques"],"gc_lab_chromatography":["Lab: chromatography","gc_lab_techniques"],"gc_lab_recrystallization":["Lab: recrystallization","gc_lab_techniques"],"gc_spectroscopy_beer":["Lab: spectroscopy & Beer's law","gc_lab_techniques"],"oc_hybridization":["Hybridization (sp/sp2/sp3)","oc_fundamentals"],"oc_formal_charge":["Formal charge","oc_fundamentals"],"oc_resonance":["Resonance structures","oc_fundamentals"],"oc_conjugation":["Conjugation & allylic/benzylic stabilization","oc_fundamentals"],"oc_polarity":["Polarity & dipole moments","oc_fundamentals"],"oc_imfs":["Intermolecular forces (H-bond, dipole, London)","oc_fundamentals"],"oc_physical_trends":["Boiling/melting point & solubility trends","oc_fundamentals"],"oc_ihd":["Degrees of unsaturation (IHD)","oc_fundamentals"],"oc_alkane_naming":["Alkane / functional group naming","oc_iupac"],"oc_priority_order":["Functional group priority","oc_iupac"],"oc_chirality":["Chirality basics","oc_stereochemistry"],"oc_r_s":["R / S assignment","oc_stereochemistry"],"oc_e_z":["E / Z designation","oc_stereochemistry"],"oc_enantiomers_diastereomers":["Enantiomers vs diastereomers","oc_stereochemistry"],"oc_meso":["Meso compounds","oc_stereochemistry"],"oc_optical_activity":["Optical activity & racemic mixtures","oc_stereochemistry"],"oc_fischer":["Fischer projections","oc_stereochemistry"],"oc_newman":["Newman projections","oc_stereochemistry"],"oc_chair_conformations":["Chair conformations (axial/equatorial)","oc_stereochemistry"],"oc_pka":["pKa & relative acidity","oc_acidity_stability"],"oc_conj_base_stability":["Conjugate base stability","oc_acidity_stability"],"oc_inductive_resonance_acidity":["Inductive & resonance effects on acidity","oc_acidity_stability"],"oc_amine_basicity":["Amine basicity & nucleophilicity","oc_acidity_stability"],"oc_sn1_mechanism":["SN1 mechanism","oc_sub_elim"],"oc_sn2_mechanism":["SN2 mechanism","oc_sub_elim"],"oc_e1_mechanism":["E1 mechanism","oc_sub_elim"],"oc_e2_mechanism":["E2 mechanism","oc_sub_elim"],"oc_carbocation":["Carbocation stability & rearrangements","oc_sub_elim"],"oc_leaving_groups":["Leaving group ability","oc_sub_elim"],"oc_nucleophilicity":["Nucleophilicity vs basicity","oc_sub_elim"],"oc_sn_e_solvent":["Solvent effects (polar protic / aprotic)","oc_sub_elim"],"oc_zaitsev_hofmann":["Zaitsev's vs Hofmann's rule","oc_sub_elim"],"oc_anti_periplanar":["Anti-periplanar requirement","oc_sub_elim"],"oc_arrow_pushing":["Arrow-pushing / electron flow","oc_fundamentals"],"oc_reaction_energy":["Reaction energy diagrams & intermediates","oc_fundamentals"],"oc_thermo_kinetic":["Thermodynamic vs kinetic control","oc_fundamentals"],"oc_markovnikov":["Markovnikov's rule","oc_alkene_addition"],"oc_anti_markovnikov":["Anti-Markovnikov","oc_alkene_addition"],"oc_hydroboration":["Hydroboration-oxidation","oc_alkene_addition"],"oc_hydration":["Acid-catalyzed hydration","oc_alkene_addition"],"oc_halogenation":["Halogenation (anti addition)","oc_alkene_addition"],"oc_dihydroxylation":["Dihydroxylation (cis/trans)","oc_alkene_addition"],"oc_epoxidation":["Epoxidation","oc_alkene_addition"],"oc_ozonolysis":["Ozonolysis","oc_alkene_addition"],"oc_terminal_alkyne":["Terminal vs internal alkynes","oc_alkyne"],"oc_alkyne_reduction":["Alkyne reduction (Lindlar vs Na/NH3)","oc_alkyne"],"oc_keto_enol":["Keto-enol tautomerization","oc_alkyne"],"oc_alcohol_oxidation":["Alcohol oxidation","oc_alcohols_ethers_epoxides"],"oc_alcohol_dehydration":["Alcohol dehydration","oc_alcohols_ethers_epoxides"],"oc_lucas_test":["Lucas test","oc_alcohols_ethers_epoxides"],"oc_williamson":["Williamson ether synthesis","oc_alcohols_ethers_epoxides"],"oc_epoxide_opening":["Epoxide ring-opening (acidic vs basic)","oc_alcohols_ethers_epoxides"],"oc_grignard":["Grignard reagents","oc_ketones_aldehydes"],"oc_reduction_lialh4_nabh4":["Reduction (LiAlH4, NaBH4)","oc_ketones_aldehydes"],"oc_hemiacetals":["Hemiacetals & acetals","oc_ketones_aldehydes"],"oc_imines_enamines":["Imines & enamines","oc_ketones_aldehydes"],"oc_wittig":["Wittig reaction","oc_ketones_aldehydes"],"oc_tollens_fehling":["Tollens / Fehling oxidation","oc_ketones_aldehydes"],"oc_reductive_amination":["Reductive amination","oc_ketones_aldehydes"],"oc_acyl_reactivity":["Acid derivative reactivity order","oc_carboxylic_acid_derivatives"],"oc_fischer_esterification":["Fischer esterification","oc_carboxylic_acid_derivatives"],"oc_saponification":["Saponification","oc_carboxylic_acid_derivatives"],"oc_hydrolysis":["Ester / amide hydrolysis","oc_carboxylic_acid_derivatives"],"oc_alpha_acidity":["Alpha-proton acidity","oc_enolates"],"oc_aldol_condensation":["Aldol condensation","oc_enolates"],"oc_claisen":["Claisen condensation","oc_enolates"],"oc_michael_addition":["Michael addition","oc_enolates"],"oc_huckel":["Huckel's rule (aromaticity)","oc_aromaticity_benzene"],"oc_eas_halogenation":["EAS: halogenation","oc_aromaticity_benzene"],"oc_eas_nitration":["EAS: nitration","oc_aromaticity_benzene"],"oc_eas_sulfonation":["EAS: sulfonation","oc_aromaticity_benzene"],"oc_fc_alkylation":["Friedel-Crafts alkylation","oc_aromaticity_benzene"],"oc_fc_acylation":["Friedel-Crafts acylation","oc_aromaticity_benzene"],"oc_directing_effects":["Directing effects (o/m/p, activators/deactivators)","oc_aromaticity_benzene"],"oc_radical_halogenation":["Free radical halogenation","oc_radicals_diels_alder"],"oc_allylic_benzylic":["Allylic / benzylic halogenation","oc_radicals_diels_alder"],"oc_diels_alder_mechanism":["Diels-Alder reaction","oc_radicals_diels_alder"],"oc_h_nmr":["1H NMR (shifts, multiplicity)","oc_spectroscopy_lab"],"oc_c_nmr":["13C NMR","oc_spectroscopy_lab"],"oc_ir_spec":["IR spectroscopy","oc_spectroscopy_lab"],"oc_mass_spec":["Mass spectrometry","oc_spectroscopy_lab"],"oc_tlc_column":["TLC & column chromatography","oc_spectroscopy_lab"],"qr_fractions_decimals":["Fractions & decimals","qr_arithmetic"],"qr_percentages":["Percentages","qr_arithmetic"],"qr_ratios_proportions":["Ratios & proportions","qr_arithmetic"],"qr_scientific_notation":["Scientific notation","qr_arithmetic"],"qr_approximation":["Approximation & estimation","qr_arithmetic"],"qr_number_properties":["Number properties (factors, multiples, primes, GCF/LCM)","qr_arithmetic"],"qr_order_operations":["Order of operations & signed numbers","qr_arithmetic"],"qr_unit_conversions":["Unit conversions (metric/English, temp, time, weight)","qr_arithmetic"],"qr_linear_equations":["Linear equations & systems","qr_algebra_foundations"],"qr_quadratics":["Quadratics (factoring & formula)","qr_algebra_foundations"],"qr_inequalities":["Inequalities","qr_algebra_foundations"],"qr_absolute_value":["Absolute value (equations & inequalities)","qr_algebra_foundations"],"qr_exponents":["Exponents, roots & logarithms","qr_algebra_foundations"],"qr_sequences":["Sequences & series","qr_algebra_foundations"],"qr_functions":["Functions, graphs & lines","qr_algebra_foundations"],"qr_rate_problems":["Rate problems (D = RT)","qr_word_problems"],"qr_work_problems":["Work problems","qr_word_problems"],"qr_mixture_problems":["Mixture problems","qr_word_problems"],"qr_interest_problems":["Interest problems (simple & compound)","qr_word_problems"],"qr_translation":["Translation & setup (word to equation)","qr_word_problems"],"qr_basic_probability":["Basic probability","qr_probability"],"qr_conditional_probability":["Conditional probability","qr_probability"],"qr_counting_principle":["Counting principle (FCP)","qr_probability"],"qr_permutations":["Permutations","qr_probability"],"qr_combinations":["Combinations","qr_probability"],"qr_expected_value":["Expected value / weighted average","qr_probability"],"qr_mean_median_mode":["Mean / median / mode / range","qr_statistics"],"qr_standard_deviation":["Standard deviation","qr_statistics"],"qr_normal_distribution":["Normal distribution (empirical rule)","qr_statistics"],"qr_data_interpretation":["Data interpretation (graphs / tables)","qr_statistics"],"qr_triangles":["Triangles (Pythagorean, special right)","qr_geometry"],"qr_similar_congruent":["Similar / congruent triangles","qr_geometry"],"qr_circles":["Circles (area, circumference, arc, sector)","qr_geometry"],"qr_polygons":["Polygons (interior angle, area)","qr_geometry"],"qr_3d_solids":["3D solids (volume, surface area)","qr_geometry"],"qr_coordinate_geometry":["Coordinate geometry (distance, midpoint, slope)","qr_geometry"],"qr_sohcahtoa":["SOHCAHTOA (right-triangle trig)","qr_trigonometry"],"qr_unit_circle":["Unit circle & special angles","qr_trigonometry"],"qr_trig_identities":["Pythagorean & basic identities","qr_trigonometry"],"qr_law_of_sines_cosines":["Law of sines / cosines","qr_trigonometry"],"pat_hole_punch":["Hole punching","pat_hole_punching"],"pat_cubes":["Cube counting","pat_cube_counting"],"pat_angles":["Angle ranking","pat_angle_ranking"],"pat_pattern_fold":["Pattern folding","pat_pattern_folding"],"pat_tfe_views":["Top-Front-End","pat_tfe"],"pat_keyhole_3d":["Keyhole","pat_keyhole"],"rc_main_idea":["Main idea","rc_strategy"],"rc_specific_detail":["Specific detail","rc_strategy"],"rc_inference":["Inference","rc_strategy"],"rc_tone_purpose":["Tone & purpose","rc_strategy"],"rc_vocab_in_context":["Vocab in context","rc_strategy"],"rc_passage_structure":["Passage structure","rc_strategy"],"rc_search_vs_read":["Search vs read strategy","rc_strategy"],"rc_timing_strategy":["Timing per passage","rc_timed_passage"]};
  var TOPICS = {"bio_cell_molecular":"Cell & Molecular Biology","bio_genetics":"Genetics","bio_diversity":"Diversity of Life","bio_evolution_ecology":"Evolution & Ecology","bio_anatomy_physiology":"Anatomy & Physiology","bio_development_reproduction":"Development & Reproduction","gc_atomic_structure":"Atomic Structure","gc_periodic_properties":"Periodic Properties","gc_stoichiometry":"Stoichiometry & Mole Concepts","gc_gases":"Gases","gc_liquids_solids":"Liquids & Solids","gc_solutions":"Solutions","gc_thermodynamics":"Thermodynamics & Thermochemistry","gc_kinetics":"Chemical Kinetics","gc_equilibrium":"Equilibrium","gc_acids_bases":"Acids & Bases","gc_electrochemistry":"Electrochemistry","gc_nuclear":"Nuclear Chemistry","gc_lab_techniques":"Lab Techniques","oc_fundamentals":"Fundamentals","oc_iupac":"IUPAC Nomenclature","oc_acidity_stability":"Acidity, Stability & Structure","oc_stereochemistry":"Conformations & Stereochemistry","oc_sub_elim":"Substitution & Elimination","oc_alkene_addition":"Alkene Addition Reactions","oc_alkyne":"Alkyne Reactions","oc_ketones_aldehydes":"Ketones & Aldehydes","oc_carboxylic_acid_derivatives":"Carboxylic Acid Derivatives","oc_enolates":"Enolate Reactions","oc_alcohols_ethers_epoxides":"Alcohols, Ethers & Epoxides","oc_aromaticity_benzene":"Aromaticity & Benzene Reactions","oc_radicals_diels_alder":"Free Radical & Diels-Alder","oc_spectroscopy_lab":"Spectroscopy & Lab Techniques","qr_arithmetic":"Arithmetic, Ratios & Percentages","qr_algebra_foundations":"Algebra Foundations","qr_word_problems":"Word Problems","qr_probability":"Probability","qr_statistics":"Statistics & Data Analysis","qr_geometry":"Geometry","qr_trigonometry":"Trigonometry","qr_mixed_timed":"Mixed Timed Practice","pat_hole_punching":"Hole Punching","pat_cube_counting":"Cube Counting","pat_angle_ranking":"Angle Ranking","pat_pattern_folding":"Pattern Folding","pat_tfe":"Top-Front-End","pat_keyhole":"Keyhole","pat_mixed":"Mixed PAT Review","rc_strategy":"Strategy Testing & Selection","rc_timed_passage":"Timed Passage Practice","rc_full_section":"Full Section Execution","rc_review":"RC Review & Error Analysis"};
  /* ---- 1. candidate subtopics per bank topic (metadata). A list of one is a direct mapping. ----
     Keys are the topic (or skill_id) values the banks already carry. '@topic' entries name the
     parent topic for a key whose subtopics the taxonomy does not split (a low tag, never a guess). */
  var GC = {
    atomic: ['gc_subatomic', 'gc_electron_config'], periodic: ['gc_periodic_trends'], bonding: ['gc_bonding_types', 'gc_molecular_polarity'],
    lewis: ['gc_lewis_structures', 'gc_resonance'], vsepr: ['gc_vsepr_geometry'], hybridization: ['gc_hybridization'], 'quantum-numbers': ['gc_quantum_numbers'],
    'sig-figs': ['gc_density_composition'], 'mole-conv': ['gc_mole_concept', 'gc_density_composition', 'gc_empirical_molecular', 'gc_balancing_equations', 'gc_reaction_types'],
    'lim-react': ['gc_limiting_reagent'], solutions: ['gc_molarity_molality', 'gc_dilution', 'gc_colligative', 'gc_solubility_rules', 'gc_net_ionic'],
    colligative: ['gc_colligative'], 'sol-rules': ['gc_solubility_rules', 'gc_net_ionic'],
    'imf-rank': ['gc_intermolecular_forces', 'gc_vapor_pressure', 'gc_solids_unit_cells'], 'phase-diag': ['gc_phase_diagrams'], 'heating-curve': ['gc_heating_curves'],
    'gas-laws': ['gc_gas_laws', 'gc_ideal_gas', 'gc_partial_pressure', 'gc_kinetic_molecular'],
    enthalpy: ['gc_enthalpy', 'gc_hess_law'], calorimetry: ['gc_calorimetry'], entropy: ['gc_entropy'], gibbs: ['gc_gibbs'],
    'rate-laws': ['gc_rate_laws', 'gc_integrated_rate_laws', 'gc_mechanisms_rds', 'gc_rate_factors'], arrhenius: ['gc_arrhenius', 'gc_catalysts'],
    'eq-kc': ['gc_keq_kp_ksp'], 'eq-lechat': ['gc_le_chatelier'], 'eq-ice': ['gc_ice_tables'], ksp: ['gc_keq_kp_ksp', 'gc_common_ion'],
    'ph-basics': ['gc_ph_poh', 'gc_ka_kb', 'gc_bronsted_lewis', 'gc_polyprotic'], 'strong-weak': ['gc_ka_kb', 'gc_bronsted_lewis'], buffers: ['gc_buffers'], titration: ['gc_titration'],
    galvanic: ['gc_galvanic', 'gc_oxidation_states'], 'red-pot': ['gc_galvanic', 'gc_oxidation_states'], nernst: ['gc_nernst'], electrolysis: ['gc_electrolytic', 'gc_faradays'],
    nuclear: ['gc_decay_modes', 'gc_half_life', 'gc_fission_fusion', 'gc_binding_energy'],
    'lab-techniques': ['gc_lab_extraction', 'gc_lab_chromatography', 'gc_lab_recrystallization', 'gc_spectroscopy_beer'],
    // the few items filed under a whole unit
    kinetics: ['gc_rate_factors', 'gc_rate_laws', 'gc_integrated_rate_laws', 'gc_arrhenius', 'gc_mechanisms_rds', 'gc_catalysts'],
    equilibrium: ['gc_keq_kp_ksp', 'gc_ice_tables', 'gc_le_chatelier', 'gc_common_ion'],
    'acid-base': ['gc_bronsted_lewis', 'gc_ph_poh', 'gc_ka_kb', 'gc_polyprotic', 'gc_buffers', 'gc_titration'],
    redox: ['gc_oxidation_states', 'gc_galvanic', 'gc_electrolytic', 'gc_faradays', 'gc_nernst'],
    gases: ['gc_gas_laws', 'gc_ideal_gas', 'gc_partial_pressure', 'gc_kinetic_molecular'],
    thermo: ['gc_enthalpy', 'gc_hess_law', 'gc_calorimetry', 'gc_entropy', 'gc_gibbs'],
    stoich: ['gc_mole_concept', 'gc_density_composition', 'gc_empirical_molecular', 'gc_balancing_equations', 'gc_reaction_types', 'gc_limiting_reagent'],
    liquids: ['gc_intermolecular_forces', 'gc_phase_diagrams', 'gc_heating_curves', 'gc_vapor_pressure', 'gc_solids_unit_cells']
  };
  var BIO_AP = ['bio_circulatory', 'bio_cardiac_cycle', 'bio_blood_components', 'bio_respiratory', 'bio_o2_co2_transport', 'bio_digestive', 'bio_excretory_nephron', 'bio_nervous_action_potential', 'bio_neurotransmitters', 'bio_brain_regions', 'bio_autonomic', 'bio_sensory', 'bio_endocrine_hormones', 'bio_feedback_loops', 'bio_muscular_contraction', 'bio_skeletal', 'bio_integumentary', 'bio_immune_innate', 'bio_immune_adaptive', 'bio_lymphatic'];
  var BIO_GEN = ['bio_mendelian', 'bio_dihybrid', 'bio_sex_linked', 'bio_pedigrees', 'bio_codominance', 'bio_epistasis', 'bio_hardy_weinberg', 'bio_linkage', 'bio_chromosomal_disorders'];
  var BIO_ECO = ['bio_biogeochem_cycles', 'bio_population_ecology', 'bio_community_ecology', 'bio_food_webs', 'bio_biomes'];
  var BIO_DIV = ['bio_taxonomy', 'bio_prokaryotes', 'bio_viruses', 'bio_fungi', 'bio_protists'];
  var BIO_PLANT = ['bio_plant_physiology', 'bio_transpiration', 'bio_plant_reproduction', 'bio_plant_hormones'];
  var BIO = {
    // served banks (practice and test topics, after data/topics.json)
    water: ['bio_biomolecules'], biomolecules: ['bio_biomolecules', 'bio_protein_structure'], carbohydrates: ['bio_biomolecules'], lipids: ['bio_biomolecules'],
    proteins: ['bio_protein_structure', 'bio_biomolecules'], 'nucleic-acids': ['bio_biomolecules'], enzymes: ['bio_enzymes'],
    'cell-types': ['bio_prokaryote_eukaryote', 'bio_endosymbiosis'], organelles: ['bio_cell_organelles', 'bio_endosymbiosis'], cytoskeleton: ['bio_cytoskeleton'],
    membranes: ['bio_membrane_transport'], signaling: ['bio_cell_signaling'], glycolysis: ['bio_glycolysis', 'bio_fermentation'], 'krebs-etc': ['bio_krebs', 'bio_etc_oxphos'],
    photosynthesis: ['bio_photosynthesis'], 'cell-cycle': ['bio_cell_cycle', 'bio_mitosis', 'bio_apoptosis'], 'replication-repair': ['bio_dna_replication', 'bio_mutations_repair'],
    transcription: ['bio_transcription'], translation: ['bio_translation'], 'lab-techniques': ['bio_biotechnology'], tech: ['bio_biotechnology'], mutations: ['bio_mutations_repair'],
    'gene-regulation': ['bio_gene_regulation'], imprinting: ['bio_gene_regulation'], genetics: BIO_GEN, 'body-systems': BIO_AP,
    evolution: ['bio_natural_selection', 'bio_evidence_evolution', 'bio_speciation'],
    mendel: ['bio_mendelian', 'bio_dihybrid'], codom: ['bio_codominance'], pedigree: ['bio_pedigrees', 'bio_sex_linked'], hw: ['bio_hardy_weinberg'], meiosis: ['bio_meiosis'],
    aneuploidy: ['bio_chromosomal_disorders'], linkage: ['bio_linkage'], 'sex-linked': ['bio_sex_linked'], epistasis: ['bio_epistasis'], lethal: ['bio_mendelian'],
    cardio: ['bio_circulatory', 'bio_cardiac_cycle', 'bio_blood_components'], resp: ['bio_respiratory', 'bio_o2_co2_transport'],
    nervous: ['bio_nervous_action_potential', 'bio_neurotransmitters', 'bio_brain_regions', 'bio_autonomic', 'bio_sensory'], nephron: ['bio_excretory_nephron'],
    endo: ['bio_endocrine_hormones', 'bio_feedback_loops'], muscle: ['bio_muscular_contraction'], digest: ['bio_digestive'],
    immune: ['bio_immune_innate', 'bio_immune_adaptive', 'bio_lymphatic'], reproductive: ['bio_male_reproductive', 'bio_female_reproductive', 'bio_menstrual_cycle', 'bio_gametogenesis'],
    skeletal: ['bio_skeletal'], integ: ['bio_integumentary'], domains: BIO_DIV, kingdoms: BIO_DIV, plants: BIO_PLANT, animals: ['bio_animal_taxonomy'],
    phylogenetics: ['bio_taxonomy', 'bio_evidence_evolution'], fertilization: ['bio_fertilization'], cleavage: ['bio_embryonic_stages'], gastrula: ['bio_embryonic_stages', 'bio_germ_layers'],
    neurulation: ['bio_embryonic_stages'], germ: ['bio_germ_layers'], extraembryonic: ['bio_placentation_hcg'], organogenesis: ['bio_germ_layers', 'bio_embryonic_stages'],
    selection: ['bio_natural_selection'], evidence: ['bio_evidence_evolution'], speciation: ['bio_speciation'], eco: BIO_ECO, ecology: BIO_ECO, behavior: ['bio_animal_behavior'],
    // the private Biology bank's skill ids (ace-bank-bio/skills/bio-skill-map.json)
    'bio.wat': ['bio_biomolecules'], 'bio.car': ['bio_biomolecules'], 'bio.lip': ['bio_biomolecules', 'bio_membrane_transport'], 'bio.pro': ['bio_protein_structure', 'bio_biomolecules'],
    'bio.nuc': ['bio_biomolecules'], 'bio.enz': ['bio_enzymes'], 'bio.pve': ['bio_prokaryote_eukaryote', 'bio_endosymbiosis'], 'bio.org': ['bio_cell_organelles', 'bio_endosymbiosis'],
    'bio.cyt': ['bio_cytoskeleton'], 'bio.mtr': ['bio_membrane_transport'], 'bio.sig': ['bio_cell_signaling'], 'bio.mit': ['bio_cell_cycle', 'bio_mitosis', 'bio_apoptosis'],
    'bio.gly': ['bio_glycolysis', 'bio_fermentation'], 'bio.krb': ['bio_krebs', 'bio_etc_oxphos'], 'bio.pho': ['bio_photosynthesis'], 'bio.rep': ['bio_dna_replication'],
    'bio.trc': ['bio_transcription'], 'bio.rnp': ['bio_transcription'], 'bio.tln': ['bio_translation'], 'bio.prb': ['bio_mendelian', 'bio_dihybrid'], 'bio.men': ['bio_mendelian', 'bio_dihybrid'],
    'bio.mei': ['bio_meiosis'], 'bio.lco': ['bio_linkage'], 'bio.ped': ['bio_pedigrees'], 'bio.hwb': ['bio_hardy_weinberg'], 'bio.nmn': ['bio_codominance', 'bio_epistasis', 'bio_sex_linked'],
    'bio.grg': ['bio_gene_regulation'], 'bio.epi': ['bio_gene_regulation'], 'bio.mut': ['bio_mutations_repair'], 'bio.ap': ['bio_nervous_action_potential'], 'bio.syn': ['bio_neurotransmitters'],
    'bio.rfx': ['bio_autonomic'], 'bio.brn': ['bio_brain_regions'], 'bio.snz': ['bio_sensory'], 'bio.cdv': ['bio_circulatory', 'bio_cardiac_cycle', 'bio_blood_components'],
    'bio.nph': ['bio_excretory_nephron'], 'bio.rsp': ['bio_respiratory', 'bio_o2_co2_transport'], 'bio.end': ['bio_endocrine_hormones', 'bio_feedback_loops'], 'bio.dig': ['bio_digestive'],
    'bio.rpd': ['bio_male_reproductive', 'bio_female_reproductive', 'bio_menstrual_cycle', 'bio_gametogenesis'], 'bio.imn': ['bio_immune_innate', 'bio_immune_adaptive'],
    'bio.sf': ['bio_muscular_contraction'], 'bio.dom': ['bio_taxonomy', 'bio_prokaryotes'], 'bio.plt': BIO_PLANT, 'bio.anm': ['bio_animal_taxonomy'], 'bio.vrt': ['bio_animal_taxonomy'],
    'bio.phy': ['bio_taxonomy', 'bio_evidence_evolution'], 'bio.bgt': ['bio_prokaryotes'], 'bio.fer': ['bio_fertilization'], 'bio.gas': ['bio_embryonic_stages', 'bio_germ_layers'],
    'bio.organogenesis': ['bio_germ_layers', 'bio_placentation_hcg', 'bio_embryonic_stages'], 'bio.nse': ['bio_natural_selection'], 'bio.spc': ['bio_speciation'],
    'bio.eco': ['bio_population_ecology', 'bio_biogeochem_cycles', 'bio_food_webs', 'bio_biomes'], 'bio.com': ['bio_community_ecology'], 'bio.beh': ['bio_animal_behavior'],
    'bio.exp': ['bio_biotechnology'], 'bio.gtc': ['bio_biotechnology'], 'bio.chr': ['bio_chromosomal_disorders'], 'bio.int': ['bio_integumentary'], 'bio.skl': ['bio_skeletal'],
    'bio.bld': ['bio_blood_components', 'bio_o2_co2_transport'], 'bio.lym': ['bio_lymphatic'], 'bio.vir': ['bio_viruses'], 'bio.fun': ['bio_fungi', 'bio_protists'], 'bio.evd': ['bio_evidence_evolution'],
    // skills the taxonomy has no subtopic for: parent topic only (always low, by design)
    'bio.stm': '@bio_development_reproduction', 'bio.dif': '@bio_development_reproduction', 'bio.ori': '@bio_evolution_ecology', 'bio.nrg': '@bio_cell_molecular', 'bio.gnm': '@bio_cell_molecular'
  };
  var OC_SUBELIM = ['oc_sn1_mechanism', 'oc_sn2_mechanism', 'oc_e1_mechanism', 'oc_e2_mechanism', 'oc_carbocation', 'oc_leaving_groups', 'oc_nucleophilicity', 'oc_sn_e_solvent', 'oc_zaitsev_hofmann', 'oc_anti_periplanar'];
  var OC_STEREO = ['oc_chirality', 'oc_r_s', 'oc_e_z', 'oc_enantiomers_diastereomers', 'oc_meso', 'oc_optical_activity', 'oc_fischer', 'oc_newman', 'oc_chair_conformations'];
  var OC_ALKENE = ['oc_markovnikov', 'oc_anti_markovnikov', 'oc_hydroboration', 'oc_hydration', 'oc_halogenation', 'oc_dihydroxylation', 'oc_epoxidation', 'oc_ozonolysis', 'oc_diels_alder_mechanism'];
  var OC_ALKYNE = ['oc_terminal_alkyne', 'oc_alkyne_reduction', 'oc_keto_enol'];
  var OC_AROM = ['oc_huckel', 'oc_eas_halogenation', 'oc_eas_nitration', 'oc_eas_sulfonation', 'oc_fc_alkylation', 'oc_fc_acylation', 'oc_directing_effects'];
  var OC_ALC = ['oc_alcohol_oxidation', 'oc_alcohol_dehydration', 'oc_lucas_test'], OC_ETH = ['oc_williamson', 'oc_epoxide_opening'];
  var OC_CARB = ['oc_grignard', 'oc_reduction_lialh4_nabh4', 'oc_hemiacetals', 'oc_imines_enamines', 'oc_wittig', 'oc_tollens_fehling', 'oc_reductive_amination'];
  var OC_ALPHA = ['oc_alpha_acidity', 'oc_aldol_condensation', 'oc_claisen', 'oc_michael_addition'];
  var OC_ACYL = ['oc_acyl_reactivity', 'oc_fischer_esterification', 'oc_saponification', 'oc_hydrolysis'];
  var OC_ACID = ['oc_pka', 'oc_conj_base_stability', 'oc_inductive_resonance_acidity', 'oc_amine_basicity'];
  var OC_SPEC = ['oc_h_nmr', 'oc_c_nmr', 'oc_ir_spec', 'oc_mass_spec', 'oc_ihd'];
  var OC_RADICAL = ['oc_radical_halogenation', 'oc_allylic_benzylic'];
  var OC_REACT = [].concat(OC_SUBELIM, OC_ALKENE, OC_ALKYNE, OC_AROM, OC_ALC, OC_ETH, OC_CARB, OC_ALPHA, OC_ACYL, OC_RADICAL, ['oc_reductive_amination']);
  var OC = {
    // served banks
    'mech-sne': OC_SUBELIM, 'stereo-rs': OC_STEREO, 'alkene-add': OC_ALKENE.concat('@oc_alkene_addition'), alkyne: OC_ALKYNE, 'arom-eas': OC_AROM, 'alc-eth': OC_ALC.concat(OC_ETH),
    carbonyl: OC_CARB.concat(OC_ALPHA, '@oc_ketones_aldehydes'), acids: OC_ACYL, amines: ['oc_amine_basicity', 'oc_reductive_amination', '@oc_acidity_stability'], 'spec-ir-nmr': OC_SPEC.concat('@oc_spectroscopy_lab'), synth: OC_REACT,
    lab: ['oc_tlc_column', 'oc_physical_trends', 'oc_imfs', '@oc_spectroscopy_lab'], 'ab-ochem': OC_ACID,
    'mech-arrows': ['oc_arrow_pushing', 'oc_reaction_energy', 'oc_thermo_kinetic', 'oc_carbocation', 'oc_resonance'],
    // the private OChem bank's skill ids (ace-bank-ochem/skills.json, portal_subtopics)
    bonding: ['oc_hybridization', 'oc_formal_charge', 'oc_resonance', 'oc_conjugation', 'oc_arrow_pushing', 'oc_reaction_energy', 'oc_thermo_kinetic'],
    nomenclature: ['oc_alkane_naming', 'oc_priority_order'], 'acid-base-cardio': OC_ACID, 'stereo-lab': OC_STEREO, 'spec-trainer': OC_SPEC.concat('@oc_spectroscopy_lab'), alkanes: OC_RADICAL,
    alkenes: OC_ALKENE.concat('@oc_alkene_addition'), alkynes: OC_ALKYNE, subelim: OC_SUBELIM, alcohols: OC_ALC, ethers: OC_ETH, aromatic: OC_AROM, 'alpha-condensation': OC_ALPHA,
    'lab-techniques': ['oc_polarity', 'oc_imfs', 'oc_physical_trends', 'oc_tlc_column', '@oc_fundamentals'], 'synthesis-lab': OC_REACT
  };
  // OChem keys that mean the same thing in both banks: carbonyl, acids, amines (same lists).
  var QR_GEO = ['qr_triangles', 'qr_similar_congruent', 'qr_circles', 'qr_polygons', 'qr_3d_solids', 'qr_coordinate_geometry'];
  var QR_TRIG = ['qr_sohcahtoa', 'qr_unit_circle', 'qr_trig_identities', 'qr_law_of_sines_cosines'];
  var QR_PROB = ['qr_basic_probability', 'qr_conditional_probability', 'qr_counting_principle', 'qr_permutations', 'qr_combinations', 'qr_expected_value'];
  var QR_STAT = ['qr_mean_median_mode', 'qr_standard_deviation', 'qr_normal_distribution', 'qr_data_interpretation'];
  var QR_ALG = ['qr_linear_equations', 'qr_quadratics', 'qr_inequalities', 'qr_absolute_value', 'qr_exponents', 'qr_sequences', 'qr_functions'];
  var QR_WORD = ['qr_rate_problems', 'qr_work_problems', 'qr_mixture_problems', 'qr_interest_problems', 'qr_translation'];
  var QR = {
    // QR engine module ids (diagnostic pool, the private QR bank)
    'frac-add': ['qr_fractions_decimals'], 'frac-dec': ['qr_fractions_decimals'], 'frac-mul': ['qr_fractions_decimals'], 'dec-arith': ['qr_fractions_decimals'],
    'pct-of': ['qr_percentages'], 'pct-chg': ['qr_percentages'], 'pct-seq': ['qr_percentages'], 'word-decode': ['qr_translation'], 'lin-eq': ['qr_linear_equations'],
    ratios: ['qr_ratios_proportions'], logs: ['qr_exponents'], logarithms: ['qr_exponents'], 'rate-time': ['qr_rate_problems'], rate: ['qr_rate_problems', 'qr_work_problems'],
    estim: ['qr_approximation'], mental: ['qr_approximation', 'qr_order_operations'], distrib: ['qr_order_operations'], pemdas: ['qr_order_operations'],
    'neg-ineq': ['qr_inequalities'], 'work-rate': ['qr_work_problems'], mixture: ['qr_mixture_problems'], interest: ['qr_interest_problems'],
    coord: ['qr_coordinate_geometry', 'qr_functions'], units: ['qr_unit_conversions'], 'p-flip': ['qr_basic_probability'], 'p-andor': ['qr_basic_probability'],
    'p-cond': ['qr_conditional_probability'], 'p-expected': ['qr_expected_value'], 'count-pc': ['qr_counting_principle', 'qr_permutations', 'qr_combinations'],
    discr: ['qr_quadratics'], harm: ['qr_rate_problems', 'qr_mean_median_mode'], zscore: ['qr_normal_distribution', 'qr_standard_deviation'],
    'tri-inv': QR_TRIG, 'vol-sa': ['qr_3d_solids'], ds: ['qr_data_interpretation'], exps: ['qr_exponents'], absval: ['qr_absolute_value'],
    binomials: ['qr_quadratics'], quad: ['qr_quadratics'], radicals: ['qr_exponents'], 'sci-not': ['qr_scientific_notation'], functions: ['qr_functions'],
    'geo-2d': ['qr_triangles', 'qr_similar_congruent', 'qr_circles', 'qr_polygons'], sets: ['qr_basic_probability', 'qr_counting_principle'],
    'desc-stats': ['qr_mean_median_mode', 'qr_standard_deviation'], 'box-plot': ['qr_mean_median_mode', 'qr_data_interpretation'], 'data-interp': ['qr_data_interpretation'],
    algebra: QR_ALG, probability: QR_PROB, geometry: QR_GEO, 'word-problem': QR_WORD, data: ['qr_data_interpretation'],
    untimed: '@qr_mixed_timed', guess: '@qr_mixed_timed', 'skip-ret': '@qr_mixed_timed', calc: '@qr_arithmetic',
    // The Climb's topics (tools/minitests/bank.js)
    'fractions-and-decimals': ['qr_fractions_decimals'], 'algebra-and-equations': QR_ALG, 'ratios-and-proportions': ['qr_ratios_proportions'], percentages: ['qr_percentages'],
    'exponents-and-roots': ['qr_exponents', 'qr_scientific_notation'], 'geometry-area-volume': QR_GEO, trigonometry: QR_TRIG,
    'statistics-mean-median-sd': QR_STAT, 'word-problems-rate-work-mixture': QR_WORD
  };
  // Climb 'probability' is the same list as the engine key above.
  var PAT = { keyholes: ['pat_keyhole_3d'], keyholesM: ['pat_keyhole_3d'], tfe: ['pat_tfe_views'], tfeM: ['pat_tfe_views'], angles: ['pat_angles'], holepunch: ['pat_hole_punch'],
    cubes: ['pat_cubes'], patternfold: ['pat_pattern_fold'], patternfoldP: ['pat_pattern_fold'] };
  var RC = { detail: ['rc_specific_detail'], inference: ['rc_inference'], mainidea: ['rc_main_idea'], function: ['rc_passage_structure'], except: ['rc_specific_detail'],
    tone: ['rc_tone_purpose'], application: ['rc_inference'], vocab: ['rc_vocab_in_context'],
    'rc-detail': ['rc_specific_detail'], 'rc-main-idea': ['rc_main_idea'], 'rc-inference': ['rc_inference'], 'rc-function': ['rc_passage_structure'],
    'rc-except': ['rc_specific_detail'], 'rc-tone': ['rc_tone_purpose'], 'rc-vocab': ['rc_vocab_in_context'] };
  // Course stops (the Learn course nights; full-length tests 1 to 4 carry them as item.stop)
  GC['gc-1'] = ['gc_density_composition', 'gc_lab_extraction', 'gc_lab_chromatography', 'gc_lab_recrystallization', 'gc_spectroscopy_beer', '@gc_lab_techniques'];
  GC['gc-2'] = GC.stoich; GC['gc-3'] = ['gc_subatomic', 'gc_electron_config', 'gc_quantum_numbers', 'gc_decay_modes', 'gc_half_life', 'gc_fission_fusion', 'gc_binding_energy'];
  GC['gc-4'] = ['gc_periodic_trends']; GC['gc-5'] = ['gc_bonding_types', 'gc_lewis_structures', 'gc_resonance', 'gc_molecular_polarity', '@gc_atomic_structure'];
  GC['gc-6'] = ['gc_vsepr_geometry', 'gc_hybridization', 'gc_molecular_polarity', 'gc_intermolecular_forces']; GC['gc-7'] = GC.gases;
  GC['gc-8'] = GC.liquids.concat(['gc_molarity_molality', 'gc_dilution', 'gc_solubility_rules', 'gc_net_ionic', 'gc_colligative']); GC['gc-9'] = ['gc_enthalpy', 'gc_hess_law', 'gc_calorimetry', '@gc_thermodynamics'];
  GC['gc-10'] = ['gc_entropy', 'gc_gibbs', '@gc_thermodynamics']; GC['gc-11'] = GC.kinetics; GC['gc-12'] = GC.equilibrium; GC['gc-13'] = GC['acid-base']; GC['gc-14'] = GC.redox;
  BIO['bio-1'] = ['bio_biomolecules', 'bio_protein_structure', 'bio_enzymes']; BIO['bio-2'] = ['bio_cell_organelles', 'bio_prokaryote_eukaryote', 'bio_cytoskeleton', 'bio_endosymbiosis'];
  BIO['bio-3'] = ['bio_membrane_transport', 'bio_cell_signaling']; BIO['bio-4'] = ['bio_glycolysis', 'bio_krebs', 'bio_etc_oxphos', 'bio_fermentation']; BIO['bio-5'] = ['bio_photosynthesis'];
  BIO['bio-6'] = ['bio_transcription', 'bio_translation', 'bio_gene_regulation']; BIO['bio-7'] = ['bio_dna_replication', 'bio_mutations_repair', 'bio_cell_cycle', 'bio_mitosis', 'bio_apoptosis'];
  BIO['bio-8'] = ['bio_meiosis', 'bio_chromosomal_disorders']; BIO['bio-9'] = ['bio_mendelian', 'bio_dihybrid', 'bio_pedigrees', 'bio_sex_linked'];
  BIO['bio-10'] = ['bio_codominance', 'bio_epistasis', 'bio_linkage', 'bio_hardy_weinberg', 'bio_biotechnology', 'bio_gene_regulation', '@bio_genetics'];
  BIO['bio-11'] = ['bio_natural_selection', 'bio_evidence_evolution', 'bio_speciation', 'bio_hardy_weinberg']; BIO['bio-12'] = BIO_ECO.concat(['bio_animal_behavior']);
  BIO['bio-13'] = BIO_DIV.concat(BIO_PLANT, ['bio_animal_taxonomy']); BIO['bio-14'] = ['bio_nervous_action_potential', 'bio_neurotransmitters', 'bio_brain_regions', 'bio_autonomic', 'bio_sensory', 'bio_endocrine_hormones', 'bio_feedback_loops'];
  BIO['bio-15'] = ['bio_circulatory', 'bio_cardiac_cycle', 'bio_blood_components', 'bio_respiratory', 'bio_o2_co2_transport', 'bio_digestive', 'bio_excretory_nephron', 'bio_muscular_contraction', 'bio_skeletal', 'bio_integumentary', 'bio_immune_innate', 'bio_immune_adaptive', 'bio_lymphatic'];
  BIO['bio-16'] = ['bio_male_reproductive', 'bio_female_reproductive', 'bio_menstrual_cycle', 'bio_gametogenesis', 'bio_fertilization', 'bio_embryonic_stages', 'bio_germ_layers', 'bio_placentation_hcg', '@bio_development_reproduction'];
  OC['oc-1'] = ['oc_arrow_pushing', 'oc_reaction_energy', 'oc_thermo_kinetic', 'oc_resonance', 'oc_formal_charge', 'oc_hybridization', 'oc_conjugation', '@oc_fundamentals'];
  OC['oc-2'] = ['oc_alkane_naming', 'oc_priority_order', 'oc_polarity', 'oc_imfs', 'oc_physical_trends', 'oc_ihd', 'oc_pka', 'oc_conj_base_stability', 'oc_inductive_resonance_acidity', 'oc_amine_basicity'];
  OC['oc-3'] = OC_STEREO; OC['oc-4'] = OC_SUBELIM; OC['oc-5'] = OC_ALKENE.concat('@oc_alkene_addition'); OC['oc-6'] = OC_ALKYNE.concat(['oc_pka']);
  OC['oc-7'] = OC_CARB.concat('@oc_ketones_aldehydes'); OC['oc-8'] = OC_ACYL; OC['oc-9'] = OC_ALC.concat(OC_ETH); OC['oc-10'] = OC_ALPHA; OC['oc-11'] = OC_AROM;
  OC['oc-12'] = OC_RADICAL.concat(['oc_diels_alder_mechanism']); OC['oc-13'] = OC_SPEC.concat(['oc_tlc_column', 'oc_physical_trends']);
  QR['qr-1'] = ['qr_translation', 'qr_approximation', 'qr_order_operations', '@qr_word_problems']; QR['qr-2'] = ['qr_fractions_decimals', 'qr_number_properties', 'qr_scientific_notation', 'qr_approximation', 'qr_order_operations'];
  QR['qr-3'] = ['qr_ratios_proportions', 'qr_unit_conversions']; QR['qr-4'] = ['qr_percentages']; QR['qr-5'] = ['qr_linear_equations', 'qr_inequalities', 'qr_absolute_value', 'qr_translation'];
  QR['qr-6'] = ['qr_exponents', 'qr_quadratics', 'qr_scientific_notation']; QR['qr-7'] = ['qr_rate_problems', 'qr_work_problems']; QR['qr-8'] = ['qr_mixture_problems', 'qr_interest_problems', 'qr_percentages'];
  QR['qr-9'] = ['qr_polygons', 'qr_circles', 'qr_3d_solids']; QR['qr-10'] = ['qr_triangles', 'qr_similar_congruent', 'qr_coordinate_geometry']; QR['qr-11'] = QR_TRIG;
  QR['qr-12'] = QR_PROB; QR['qr-13'] = QR_STAT;
  // The Climb (tools/minitests/bank.js): topic titles, looked up as slugs
  BIO['biomolecules'] = BIO.biomolecules; BIO['cell-structure-and-organelles'] = BIO['bio-2']; BIO['membrane-transport'] = ['bio_membrane_transport'];
  BIO['cellular-respiration'] = BIO['bio-4']; BIO['central-dogma-dna-rna-protein'] = ['bio_dna_replication', 'bio_transcription', 'bio_translation', 'bio_gene_regulation', 'bio_mutations_repair'];
  BIO['mitosis-and-meiosis'] = ['bio_mitosis', 'bio_meiosis', 'bio_cell_cycle']; BIO['mendelian-genetics'] = BIO['bio-9']; BIO['evolution-and-population-genetics'] = BIO['bio-11'];
  BIO['physiology-a-body-system'] = BIO_AP; BIO['physiology-cardiovascular-system'] = BIO.cardio; BIO['physiology-circulatory-system'] = BIO.cardio; BIO['physiology-renal-system'] = ['bio_excretory_nephron'];
  GC['moles-and-stoichiometry'] = GC.stoich; GC['atomic-structure-and-quantum-numbers'] = ['gc_subatomic', 'gc_electron_config', 'gc_quantum_numbers']; GC['periodic-trends'] = ['gc_periodic_trends'];
  GC['bonding-lewis-and-vsepr'] = ['gc_bonding_types', 'gc_lewis_structures', 'gc_resonance', 'gc_vsepr_geometry', 'gc_hybridization', 'gc_molecular_polarity'];
  GC['thermochemistry'] = GC.thermo; GC['acids-bases-and-ph'] = GC['acid-base']; GC['electrochemistry'] = GC.redox;
  OC['iupac-nomenclature'] = ['oc_alkane_naming', 'oc_priority_order']; OC['stereochemistry-r-s-chirality'] = OC_STEREO; OC['sn1-sn2-e1-e2'] = OC_SUBELIM;
  OC['alkene-addition-reactions'] = OC['alkene-add']; OC['aromaticity-and-eas'] = OC_AROM; OC['alcohols-and-carbonyls'] = OC_ALC.concat(OC_ETH, OC_CARB);
  OC['acidity-and-pka'] = OC_ACID; OC['resonance-and-stability'] = ['oc_resonance', 'oc_conjugation', 'oc_carbocation', 'oc_conj_base_stability', '@oc_fundamentals'];
  OC['ir-and-h-nmr-spectroscopy'] = OC['spec-ir-nmr']; OC['synthesis-roadmap'] = OC_REACT;
  QR['algebra-and-equations'] = QR_ALG; QR['geometry-area-volume'] = QR_GEO; QR['statistics-mean-median-sd'] = QR_STAT; QR['word-problems-rate-work-mixture'] = QR_WORD;
  // OChem Summit and tree: module ids (item.home) and bank groups (item.group)
  OC['t4-acid-deriv'] = OC_ACYL; OC['t4-alcohol'] = OC_ALC.concat(OC_ETH); OC['t4-alkene'] = OC['alkene-add']; OC['t4-alkyne'] = OC_ALKYNE; OC['t4-alpha'] = OC_ALPHA;
  OC['t4-aromatic'] = OC_AROM; OC['t4-carbonyl'] = OC['carbonyl']; OC['t4-radical-pericyclic'] = OC_RADICAL.concat(['oc_diels_alder_mechanism']); OC['t4-subelim'] = OC_SUBELIM;
  OC['t5-acyl'] = OC_ACYL; OC['t5-addition'] = OC['alkene-add']; OC['t5-eas'] = OC_AROM; OC['t5-sn-e'] = OC_SUBELIM; OC['t5-proton'] = OC_ACID; OC['t5-conform'] = OC_STEREO;
  OC['t5-arrows-forward'] = OC['mech-arrows']; OC['t5-arrows-reverse'] = OC['mech-arrows']; OC['t5-combined'] = OC['mech-arrows']; OC['t5-coordinate'] = ['oc_reaction_energy', 'oc_thermo_kinetic'];
  OC['t5-fishhook'] = OC_RADICAL; OC['t5-rcd'] = ['oc_reaction_energy', 'oc_thermo_kinetic']; OC['t5-mech-chain'] = OC['mech-arrows'];
  OC['t6-retro'] = OC_REACT; OC['t6-selectivity'] = OC_REACT; OC['t6-two-step'] = OC_REACT;
  OC['t7-cnmr'] = ['oc_c_nmr']; OC['t7-hnmr'] = ['oc_h_nmr']; OC['t7-ir'] = ['oc_ir_spec']; OC['t7-multi'] = OC['spec-ir-nmr']; OC['t7-lab'] = OC.lab; OC['t7-properties'] = ['oc_polarity', 'oc_imfs', 'oc_physical_trends', 'oc_ihd', '@oc_fundamentals'];
  OC['acid-base-pka'] = OC_ACID; OC['acyl-substitution'] = OC_ACYL; OC['alcohol-oxidation'] = ['oc_alcohol_oxidation']; OC['alcohol-substitution-dehydration'] = ['oc_alcohol_dehydration', 'oc_lucas_test', 'oc_sn1_mechanism', 'oc_sn2_mechanism'];
  OC['aldol'] = ['oc_aldol_condensation']; OC['alkene-epoxidation-diol'] = ['oc_epoxidation', 'oc_dihydroxylation']; OC['alkene-halogenation'] = ['oc_halogenation']; OC['alkene-hx'] = ['oc_markovnikov', 'oc_anti_markovnikov'];
  OC['alkene-hydration'] = ['oc_hydration', 'oc_hydroboration']; OC['alkene-hydrogenation'] = '@oc_alkene_addition'; OC['alkene-ozonolysis'] = ['oc_ozonolysis']; OC['alkene-radical-hbr'] = ['oc_anti_markovnikov'];
  OC['alkyne-addition'] = OC_ALKYNE; OC['alkyne-hydration'] = ['oc_keto_enol']; OC['alkyne-reduction-alkylation'] = ['oc_alkyne_reduction', 'oc_terminal_alkyne']; OC['amine-reactions'] = ['oc_amine_basicity', 'oc_reductive_amination', 'oc_imines_enamines'];
  OC['amine-synthesis'] = ['oc_reductive_amination', '@oc_carboxylic_acid_derivatives']; OC['aromatic-other'] = OC_AROM; OC['aromaticity'] = ['oc_huckel']; OC['carbocation-rearrangement'] = ['oc_carbocation'];
  OC['carbonyl-acetal-imine'] = ['oc_hemiacetals', 'oc_imines_enamines']; OC['carbonyl-grignard-hydride'] = ['oc_grignard', 'oc_reduction_lialh4_nabh4']; OC['carboxylic-reduction-decarb'] = ['oc_reduction_lialh4_nabh4', '@oc_carboxylic_acid_derivatives'];
  OC['claisen'] = ['oc_claisen']; OC['diels-alder'] = ['oc_diels_alder_mechanism']; OC['eas-directing'] = ['oc_directing_effects']; OC['eas-reactions'] = OC_AROM; OC['enolate-alkylation-halogenation'] = ['oc_alpha_acidity'];
  OC['ester-formation-hydrolysis'] = ['oc_fischer_esterification', 'oc_saponification', 'oc_hydrolysis']; OC['ether-epoxide'] = OC_ETH; OC['functional-group-id'] = '@oc_fundamentals'; OC['hybridization-geometry'] = ['oc_hybridization'];
  OC['malonic-acetoacetic'] = ['oc_alpha_acidity']; OC['michael'] = ['oc_michael_addition']; OC['multistep-synthesis'] = OC_REACT; OC['oxidation-reduction-overview'] = ['oc_alcohol_oxidation', 'oc_reduction_lialh4_nabh4'];
  OC['pericyclic-other'] = ['oc_diels_alder_mechanism']; OC['radical-reactions'] = OC_RADICAL; OC['resonance-stability'] = ['oc_resonance', 'oc_conjugation', 'oc_carbocation']; OC['spectroscopy-ir'] = ['oc_ir_spec'];
  OC['spectroscopy-ms-dou'] = ['oc_mass_spec', 'oc_ihd']; OC['spectroscopy-nmr'] = ['oc_h_nmr', 'oc_c_nmr']; OC['stereo-relationships'] = ['oc_enantiomers_diastereomers', 'oc_meso', 'oc_optical_activity'];
  OC['stereo-rs-ez'] = ['oc_r_s', 'oc_e_z']; OC['sub-vs-elim'] = OC_SUBELIM; OC['wittig'] = ['oc_wittig'];
  // Labs (their misses now come back in Repair as a bank question of the same skill)
  GC['electrochem-lab'] = ['gc_galvanic']; GC['vsepr-3d'] = ['gc_vsepr_geometry']; OC['stereo-3d'] = ['oc_r_s']; OC['chair-3d'] = ['oc_chair_conformations']; RC['rc-map'] = ['rc_search_vs_read'];
  BIO['plate-eye'] = ['bio_sensory']; BIO['plate-flower'] = ['bio_plant_reproduction']; BIO['plate-leaf'] = ['bio_plant_physiology']; BIO['plate-brain'] = ['bio_brain_regions'];
  BIO['plate-skin'] = ['bio_integumentary']; BIO['plate-digestive'] = ['bio_digestive']; BIO['plate-villus'] = ['bio_digestive']; BIO['plate-mitochondrion'] = ['bio_cell_organelles'];
  BIO['plate-lungs'] = ['bio_respiratory']; BIO['plate-alveoli'] = ['bio_respiratory']; BIO['plate-chloroplast'] = ['bio_photosynthesis']; BIO['plate-heart'] = ['bio_circulatory'];
  BIO['plate-nephron'] = ['bio_excretory_nephron']; BIO['plate-neuron'] = ['bio_nervous_action_potential']; BIO['plate-cell'] = ['bio_cell_organelles'];
  QR['worked-pct'] = ['qr_percentages']; QR['worked-ratio'] = ['qr_ratios_proportions']; QR['worked-work'] = ['qr_work_problems']; QR['worked-mix'] = ['qr_mixture_problems'];
  QR['worked-tree'] = ['qr_basic_probability', 'qr_conditional_probability']; QR['worked-alt'] = QR_GEO;
  var CAND = { gchem: GC, bio: BIO, ochem: OC, qr: QR, pat: PAT, rc: RC };

  /* ---- 2. keywords per subtopic: read only to choose among an item's own candidates ---- */
  var KW = {
    // Gen Chem
    gc_subatomic: /proton|neutron|isotop|mass number|atomic number|nucle(us|i|on)\b|atomic mass|amu\b/i,
    gc_electron_config: /electron configuration|configuration|\b[1-7][spdf]\d|aufbau|hund|pauli|valence shell|noble gas core|paramagnetic|diamagnetic|unpaired/i,
    gc_quantum_numbers: /quantum number|\bml\b|\bms\b|orbital|photon|wavelength|frequency|bohr|emission|absorption spectrum|de broglie/i,
    gc_lewis_structures: /lewis|formal charge|lone pair|octet|valence electrons?|dot structure/i,
    gc_resonance: /resonance|delocali/i,
    gc_vsepr_geometry: /vsepr|geometry|shape|bond angle|tetrahedral|trigonal|linear|bent|octahedral|see-?saw|t-shaped/i,
    gc_hybridization: /hybridi[sz]|\bsp[23]?\b|sigma|\bpi\b/i,
    gc_bonding_types: /ionic|covalent|metallic|lattice|bond (strength|length|order)|electronegativity difference/i,
    gc_molecular_polarity: /polar|dipole|nonpolar/i,
    gc_periodic_trends: /ionization|electronegativ|atomic radius|ionic radius|electron affinity|periodic trend|across a period|down a group/i,
    gc_mole_concept: /\bmoles?\b|avogadro|molar mass|grams? of|6\.02/i,
    gc_density_composition: /density|percent (by )?(mass|composition)|mass percent|significant figure|sig fig|precision|accuracy|measurement|uncertainty/i,
    gc_empirical_molecular: /empirical|molecular formula|combustion analysis/i,
    gc_balancing_equations: /balanc|coefficient/i,
    gc_reaction_types: /reaction type|combustion|single replacement|double replacement|decomposition|synthesis reaction|precipitat|predict the product/i,
    gc_limiting_reagent: /limiting|excess|theoretical yield|percent yield|actual yield/i,
    gc_gas_laws: /boyle|charles|gay-lussac|combined gas|P₁|V₁|T₁|P1|V1|T1|heated|cooled|compress|expand|doubl|halv/i,
    gc_ideal_gas: /PV ?= ?nRT|ideal gas law|ideal gas|STP|22\.4|0\.0821|molar volume/i,
    gc_partial_pressure: /partial pressure|mole fraction|dalton|collected over water/i,
    gc_kinetic_molecular: /kinetic molecular|kinetic energy|rms|root-mean|effus|graham|real gas|van der waals|deviat|average speed|molecular speed/i,
    gc_intermolecular_forces: /intermolecular|hydrogen bond|dipole-dipole|london|dispersion|ion-dipole|boiling point|melting point|viscosity|surface tension/i,
    gc_phase_diagrams: /phase diagram|triple point|critical point|sublimation curve|supercritical/i,
    gc_heating_curves: /heating curve|cooling curve|heat of fusion|heat of vaporization|plateau|phase change/i,
    gc_vapor_pressure: /vapor pressure|volatil|evaporat/i,
    gc_solids_unit_cells: /unit cell|crystal|lattice|network solid|amorphous|body-centered|face-centered|molecular solid|ionic solid/i,
    gc_molarity_molality: /molarity|molality|normality|\bM\b solution|mol\/L|concentration/i,
    gc_dilution: /dilut|M1V1|C1V1|stock solution/i,
    gc_solubility_rules: /solubility rule|soluble|insoluble/i,
    gc_net_ionic: /net ionic|spectator|precipitate/i,
    gc_colligative: /colligative|freezing point|boiling point elevation|osmotic|van ?'?t hoff|raoult|vapor pressure lowering/i,
    gc_bronsted_lewis: /bronsted|brønsted|lewis acid|lewis base|conjugate (acid|base)|proton donor|amphoteric|electron pair/i,
    gc_ph_poh: /\bpH\b|\bpOH\b|\[H\+\]|\[H3O\+\]|\[OH-\]|hydronium|hydroxide concentration/i,
    gc_ka_kb: /\bKa\b|\bKb\b|\bpKa\b|\bpKb\b|\bKw\b|weak acid|weak base|strong acid|strong base|dissociat|percent ioniz/i,
    gc_polyprotic: /polyprotic|diprotic|triprotic|second proton|H2SO4|H3PO4|H2CO3/i,
    gc_buffers: /buffer|henderson/i,
    gc_titration: /titrat|equivalence point|endpoint|end point|indicator|half-equivalence|burette|buret/i,
    gc_keq_kp_ksp: /\bK(eq|c|p|sp)\b|equilibrium constant|reaction quotient|\bQ\b|solubility product|molar solubility/i,
    gc_ice_tables: /ICE|initial.*change|equilibrium concentration/i,
    gc_le_chatelier: /le ch[aâ]telier|shift|stress|added|removed|increase in pressure/i,
    gc_common_ion: /common[- ]ion/i,
    gc_enthalpy: /enthalpy|ΔH|delta ?H|exothermic|endothermic|heat of (reaction|formation|combustion)|bond energ|bond enthalp/i,
    gc_hess_law: /hess|sum of the steps|target reaction/i,
    gc_calorimetry: /calorimet|specific heat|heat capacity|q ?= ?mc|coffee[- ]cup|bomb/i,
    gc_entropy: /entropy|ΔS|delta ?S|disorder|microstates/i,
    gc_gibbs: /gibbs|ΔG|delta ?G|spontane|free energy/i,
    gc_rate_factors: /surface area|temperature|concentration|factor|collision/i,
    gc_rate_laws: /rate law|order (with respect|in|of)|initial rate|rate constant|overall order|units of k/i,
    gc_integrated_rate_laws: /half-?life|integrated|first-order decay|ln ?\[|1\/\[/i,
    gc_arrhenius: /arrhenius|activation energy|\bEa\b/i,
    gc_mechanisms_rds: /mechanism|rate-determining|slow step|elementary step|intermediate/i,
    gc_catalysts: /catalys|enzyme/i,
    gc_oxidation_states: /oxidation (state|number)|oxidiz|reduc|redox|half-reaction|electrons? (gained|lost)/i,
    gc_galvanic: /galvanic|voltaic|E°|cell potential|standard reduction|salt bridge|anode|cathode|E ?cell|battery/i,
    gc_electrolytic: /electrolytic|electrolysis|electroplat|external (power|source)|nonspontaneous cell/i,
    gc_faradays: /faraday|coulomb|current|amperes?|\bamps?\b|charge passed/i,
    gc_nernst: /nernst|non-?standard|0\.0592|log ?Q/i,
    gc_decay_modes: /alpha|beta|gamma|positron|electron capture|decay|emission|daughter/i,
    gc_half_life: /half-?life|remain|carbon-14|dating/i,
    gc_fission_fusion: /fission|fusion|chain reaction/i,
    gc_binding_energy: /binding energy|mass defect|E ?= ?mc/i,
    gc_lab_extraction: /extract|separatory|distill/i,
    gc_lab_chromatography: /chromatograph|\bTLC\b|\bRf\b/i,
    gc_lab_recrystallization: /recrystalli|crystalliz/i,
    gc_spectroscopy_beer: /beer|absorbance|spectrophotomet|transmittance/i,
    // Biology
    bio_biomolecules: /water|hydrogen bond|carbohydrate|sugar|glucose|starch|cellulose|glycogen|lipid|fatty acid|triglyceride|phospholipid|steroid|cholesterol|nucleotide|nucleic|DNA structure|RNA structure|monomer|polymer|dehydration synthesis|hydrolysis/i,
    bio_protein_structure: /protein|amino acid|peptide|primary|secondary|tertiary|quaternary|alpha helix|beta sheet|disulfide|denatur|fold/i,
    bio_enzymes: /enzyme|substrate|active site|km|vmax|inhibit|allosteric|cofactor|coenzyme/i,
    bio_dna_replication: /replicat|helicase|primase|polymerase|okazaki|leading strand|lagging|ligase|origin|telomer|semiconservative/i,
    bio_transcription: /transcri|promoter|RNA polymerase|splic|intron|exon|5' cap|poly-?A|mRNA processing|spliceosome/i,
    bio_translation: /translat|codon|anticodon|ribosome|tRNA|genetic code|start codon|stop codon|peptidyl/i,
    bio_gene_regulation: /operon|lac|trp|repressor|inducer|enhancer|silencer|transcription factor|methylation|acetylation|histone|epigenet|imprint|chromatin|miRNA|RNA interference/i,
    bio_mutations_repair: /mutation|frameshift|missense|nonsense|silent|mismatch repair|excision repair|thymine dimer|mutagen|point mutation|insertion|deletion/i,
    bio_biotechnology: /PCR|gel|electrophoresis|blot|restriction|CRISPR|plasmid|clon|recombinant|sequenc|microscop|centrifug|ELISA|vector|library/i,
    bio_glycolysis: /glycoly|pyruvate|hexokinase|phosphofructokinase|PFK|substrate-level/i,
    bio_krebs: /krebs|citric acid|TCA|acetyl-CoA|oxaloacetate|citrate/i,
    bio_etc_oxphos: /electron transport|ATP synthase|proton gradient|chemiosmo|oxidative phosph|cytochrome|oxygen as|final electron acceptor|inner membrane/i,
    bio_fermentation: /ferment|lactate|lactic acid|ethanol|anaerobic|NAD\+ regenerat/i,
    bio_photosynthesis: /photosynth|calvin|light reaction|photosystem|chlorophyll|thylakoid|rubisco|stroma|C4|CAM/i,
    bio_cell_organelles: /organelle|mitochondri|chloroplast|golgi|endoplasmic|lysosom|peroxisom|nucleolus|nucle(ar|us) envelope|vacuole|ribosome/i,
    bio_prokaryote_eukaryote: /prokaryot|eukaryot|bacteri|nucleoid|membrane-bound/i,
    bio_membrane_transport: /membrane|osmo|tonic|diffusion|channel|pump|Na\+?\/K\+|transport|carrier|endocytosis|exocytosis|fluid mosaic/i,
    bio_cell_signaling: /receptor|second messenger|cAMP|G[- ]protein|kinase|ligand|signal|IP3|calcium release/i,
    bio_cytoskeleton: /cytoskeleton|microtubule|actin|microfilament|intermediate filament|cilia|flagell|kinesin|dynein|junction|desmosome/i,
    bio_cell_cycle: /cell cycle|checkpoint|cyclin|CDK|G1|G2|S phase|interphase|p53|tumor suppressor|oncogene|cancer/i,
    bio_mitosis: /mitosis|mitotic|prophase|metaphase|anaphase|telophase|cytokinesis|spindle|sister chromatid/i,
    bio_meiosis: /meiosis|meiotic|crossing over|homologous|tetrad|synapsis|haploid|nondisjunction/i,
    bio_apoptosis: /apoptosis|programmed cell death|caspase/i,
    bio_endosymbiosis: /endosymbio|double membrane|own DNA|circular DNA/i,
    bio_mendelian: /punnett|monohybrid|dominant|recessive|genotype|phenotype|test cross|heterozygous|homozygous|probability|lethal/i,
    bio_dihybrid: /dihybrid|9:3:3:1|independent assortment|two genes|two traits/i,
    bio_sex_linked: /x-linked|sex-linked|y-linked|hemizygous|carrier|color blind|hemophilia/i,
    bio_pedigrees: /pedigree/i,
    bio_codominance: /codominan|incomplete dominance|blood type|ABO|intermediate phenotype|multiple alleles/i,
    bio_epistasis: /epista|polygenic|quantitative trait|pleiotrop/i,
    bio_hardy_weinberg: /hardy|weinberg|allele frequenc|genotype frequenc|p2|q2|population genetic/i,
    bio_linkage: /linked|linkage|recombination frequenc|map unit|centimorgan|crossing over/i,
    bio_chromosomal_disorders: /nondisjunction|aneuploid|trisomy|monosomy|turner|klinefelter|down syndrome|polyploid|karyotype|translocation/i,
    bio_taxonomy: /domain|kingdom|taxonom|classif|phylogen|archaea|clade|cladogram|binomial/i,
    bio_viruses: /virus|viral|bacteriophage|lytic|lysogenic|retrovir|capsid|prion/i,
    bio_prokaryotes: /bacteri|archae|prokaryot|conjugation|transformation|transduction|plasmid|gram|endospore/i,
    bio_fungi: /fung|hypha|mycel|yeast|spore/i,
    bio_protists: /protist|algae|amoeb|paramecium|plasmodium|euglena|diatom/i,
    bio_animal_taxonomy: /phylum|phyla|cnidarian|porifera|sponge|arthropod|mollus|annelid|chordate|vertebrate|echinoderm|nematode|flatworm|coelom|protostome|deuterostome|mammal|amphibian|reptile|bird|fish/i,
    bio_plant_physiology: /xylem|phloem|stomata|root|leaf|meristem|cambium|vascular|guard cell|plant/i,
    bio_transpiration: /transpiration|water potential|cohesion-tension|root pressure|stomata/i,
    bio_plant_reproduction: /alternation of generations|gametophyte|sporophyte|pollen|ovule|seed|double fertilization|flower|angiosperm|gymnosperm|moss|fern/i,
    bio_plant_hormones: /auxin|gibberellin|cytokinin|abscisic|ethylene|tropism|phototropism|gravitropism|photoperiod|phytochrome/i,
    bio_circulatory: /heart|artery|arteries|vein|capillar|blood pressure|circulat|vessel|aorta|ventricle|atrium|valve/i,
    bio_cardiac_cycle: /cardiac cycle|ECG|EKG|systole|diastole|SA node|AV node|pacemaker|stroke volume|cardiac output|heart sound/i,
    bio_blood_components: /red blood|erythrocyte|white blood|leukocyte|platelet|plasma|clot|hematocrit|hemoglobin|blood type/i,
    bio_respiratory: /lung|alveol|breath|ventilat|diaphragm|respiratory|trachea|bronch|surfactant|tidal/i,
    bio_o2_co2_transport: /hemoglobin|oxygen dissociation|bohr|saturation|bicarbonate|carbonic anhydrase|myoglobin|right shift|left shift/i,
    bio_digestive: /digest|stomach|intestin|pancrea|bile|liver|gallbladder|pepsin|trypsin|amylase|lipase|villi|chyme|esophag/i,
    bio_excretory_nephron: /kidney|nephron|glomerul|loop of henle|collecting duct|renal|urine|filtrat|ADH|aldosterone|bowman/i,
    bio_nervous_action_potential: /action potential|depolariz|repolariz|hyperpolariz|resting potential|voltage-gated|threshold|refractory|myelin|saltatory|axon/i,
    bio_neurotransmitters: /neurotransmitter|synap|acetylcholine|dopamine|serotonin|GABA|glutamate|norepinephrine|vesicle|postsynaptic/i,
    bio_brain_regions: /cerebr|cerebellum|medulla|hypothalamus|thalamus|pons|brain|cortex|lobe|hippocamp|amygdala/i,
    bio_autonomic: /autonomic|sympathetic|parasympathetic|somatic|reflex|fight or flight|rest and digest/i,
    bio_sensory: /retina|rod|cone|cochlea|hair cell|eye|ear|lens|taste|olfact|photoreceptor|mechanoreceptor|sensory receptor/i,
    bio_endocrine_hormones: /hormone|endocrine|pituitary|thyroid|adrenal|insulin|glucagon|cortisol|estrogen|testosterone|steroid hormone|peptide hormone|gland/i,
    bio_feedback_loops: /feedback|negative feedback|positive feedback|homeostasis|set point/i,
    bio_muscular_contraction: /muscle|sarcomere|actin|myosin|troponin|tropomyosin|sliding filament|cross-?bridge|sarcoplasmic|z line|motor unit/i,
    bio_skeletal: /bone|osteo|cartilage|joint|ligament|tendon|skeleton|marrow|calcium homeostasis/i,
    bio_integumentary: /skin|epiderm|dermis|sweat|thermoregulat|keratin|melanin/i,
    bio_immune_innate: /innate|macrophage|neutrophil|inflammat|complement|natural killer|fever|phagocyt|first line|mast cell/i,
    bio_immune_adaptive: /antibod|B cell|T cell|lymphocyte|antigen|MHC|vaccin|memory cell|plasma cell|helper|cytotoxic|immunoglobulin|clonal/i,
    bio_lymphatic: /lymph|spleen|thymus|lymph node/i,
    bio_male_reproductive: /testis|testes|sperm|seminiferous|leydig|sertoli|prostate|epididym|vas deferens|male/i,
    bio_female_reproductive: /ovary|ovaries|uterus|fallopian|oviduct|endometri|female|cervix/i,
    bio_menstrual_cycle: /menstrua|ovulat|LH|FSH|follic|luteal|corpus luteum|progesterone|estrogen/i,
    bio_gametogenesis: /spermatogenesis|oogenesis|polar bod|primary oocyte|secondary oocyte|spermatid|gametogenesis/i,
    bio_fertilization: /fertiliz|acrosom|zona pellucida|cortical reaction|zygote|polyspermy/i,
    bio_embryonic_stages: /blastula|blastocyst|gastrula|neurula|cleavage|morula|embryo|blastocoel|archenteron|notochord|neural tube|organogenesis|induction|stem cell/i,
    bio_germ_layers: /germ layer|ectoderm|mesoderm|endoderm/i,
    bio_placentation_hcg: /placenta|hCG|chorion|amnion|allantois|yolk sac|extraembryonic|umbilical/i,
    bio_natural_selection: /natural selection|fitness|adaptation|directional|stabilizing|disruptive|sexual selection|selective pressure|genetic drift|bottleneck|founder|gene flow/i,
    bio_evidence_evolution: /homologous structure|analogous|vestigial|fossil|comparative|molecular clock|convergent|biogeography|phylogen/i,
    bio_speciation: /speciat|reproductive isolation|allopatric|sympatric|prezygotic|postzygotic|hybrid|species/i,
    bio_biogeochem_cycles: /nitrogen cycle|carbon cycle|water cycle|phosphorus|nitrogen fix|nitrif|denitrif|biogeochem/i,
    bio_population_ecology: /population|carrying capacity|logistic|exponential growth|r-selected|K-selected|survivorship|density-dependent/i,
    bio_community_ecology: /communit|symbio|mutualis|commensal|parasit|predat|competition|niche|keystone|succession/i,
    bio_food_webs: /food (web|chain)|trophic|producer|consumer|decomposer|energy flow|10 ?%|biomass|primary productivity/i,
    bio_biomes: /biome|tundra|taiga|savanna|desert|rainforest|grassland|estuary/i,
    bio_animal_behavior: /behavior|imprinting|instinct|habituation|conditioning|fixed action|taxis|kinesis|altruism|kin selection/i,
    // Organic Chemistry
    oc_hybridization: /hybridi[sz]|\bsp[23]?\b|sigma|\bpi bond/i,
    oc_formal_charge: /formal charge/i,
    oc_resonance: /resonance|delocali/i,
    oc_conjugation: /conjugat|allylic|benzylic|stabiliz/i,
    oc_polarity: /polar|dipole/i,
    oc_imfs: /intermolecular|hydrogen bond|dipole-dipole|london|dispersion/i,
    oc_physical_trends: /boiling point|melting point|solubil|distill|extract|recrystalli|separat/i,
    oc_ihd: /degrees? of unsaturation|IHD|index of hydrogen deficiency|rings plus pi|double bond equivalent/i,
    oc_alkane_naming: /IUPAC|name|named|nomenclature/i,
    oc_priority_order: /priority|suffix|highest-priority|principal (characteristic|functional) group/i,
    oc_chirality: /chiral|stereocenter|stereogenic|asymmetric carbon/i,
    oc_r_s: /\(R\)|\(S\)|\bR\/S\b|R or S|R configuration|S configuration|cahn|CIP|configurations? (at|of)|what is its configuration/i,
    oc_e_z: /\(E\)|\(Z\)|E\/Z|\bcis\b|\btrans\b/i,
    oc_enantiomers_diastereomers: /enantiomer|diastereomer|stereoisomer|epimer|anomer/i,
    oc_meso: /meso|internal plane|plane of symmetry/i,
    oc_optical_activity: /optical|rotat|racemic|polarimet|specific rotation|enantiomeric excess/i,
    oc_fischer: /fischer projection/i,
    oc_newman: /newman|staggered|eclipsed|gauche|anti conformation/i,
    oc_chair_conformations: /chair|axial|equatorial|ring flip|cyclohexane/i,
    oc_pka: /pKa|more acidic|most acidic|least acidic|acidity|strongest acid/i,
    oc_conj_base_stability: /conjugate base|anion stability|stabiliz(ed|es) the (negative|anion)/i,
    oc_inductive_resonance_acidity: /inductive|electron-withdrawing|electronegativ|resonance-stabiliz/i,
    oc_amine_basicity: /amine|basic|basicity|aniline|pyridine|lone pair available|ammonium/i,
    oc_sn1_mechanism: /\bSN1\b|unimolecular substitution|racemi|solvolysis|aqueous acetone|weak nucleophile/i,
    oc_sn2_mechanism: /\bSN2\b|backside|back side|inversion|invert|bimolecular substitution|NaI in acetone|azide|NaN3|cyanide|NaCN|thiolate|NaSCH3|strong nucleophile|opposite (sign|configuration|rotation)/i,
    oc_e1_mechanism: /\bE1\b/i,
    oc_e2_mechanism: /\bE2\b|strong base|alkoxide|ethoxide|methoxide|NaOEt|NaOMe|tert-butoxide|t-BuOK|alkene product/i,
    oc_carbocation: /carbocation|rearrang|hydride shift|methyl shift|cation stability/i,
    oc_leaving_groups: /leaving group|tosylate|mesylate|good leaving|weak base leaves/i,
    oc_nucleophilicity: /nucleophilicity|better nucleophile|strongest nucleophile|nucleophile strength|bulky base/i,
    oc_sn_e_solvent: /solvent|protic|aprotic/i,
    oc_zaitsev_hofmann: /zaitsev|saytzeff|hofmann|more substituted alkene|less substituted alkene/i,
    oc_anti_periplanar: /anti-?periplanar|antiperiplanar|coplanar/i,
    oc_arrow_pushing: /arrow|electron flow|curved|nucleophile|electrophile|attack/i,
    oc_reaction_energy: /energy diagram|reaction coordinate|transition state|intermediate|activation energy|hammond/i,
    oc_thermo_kinetic: /thermodynamic|kinetic (control|product)|1,2-addition|1,4-addition/i,
    oc_markovnikov: /markovnikov|HBr|HCl|HI\b|more substituted carbon/i,
    oc_anti_markovnikov: /anti-markovnikov|peroxide|ROOR|less substituted carbon/i,
    oc_hydroboration: /hydroboration|BH3|9-BBN|borane|H2O2.*NaOH/i,
    oc_hydration: /hydration|H3O\+|H2SO4.*H2O|oxymercuration|Hg\(OAc\)2/i,
    oc_halogenation: /Br2|Cl2|halohydrin|bromonium|dibromide|dichloride/i,
    oc_dihydroxylation: /dihydroxyl|OsO4|KMnO4|syn diol|anti diol|vicinal diol/i,
    oc_epoxidation: /epoxid|mCPBA|peroxyacid|peracid/i,
    oc_ozonolysis: /ozonolysis|\bO3\b|DMS|dimethyl sulfide|Zn.*H2O/i,
    oc_diels_alder_mechanism: /diels|diene|dienophile|cycloaddition/i,
    oc_terminal_alkyne: /terminal alkyne|internal alkyne|NaNH2|acetylide/i,
    oc_alkyne_reduction: /lindlar|Na\/NH3|Na in NH3|dissolving metal|cis-alkene|trans-alkene/i,
    oc_keto_enol: /keto-?enol|tautomer|enol/i,
    oc_alcohol_oxidation: /PCC|chromic|jones|CrO3|Na2Cr2O7|K2Cr2O7|swern|oxidi[sz]/i,
    oc_alcohol_dehydration: /dehydrat|conc(entrated)? H2SO4|H3PO4.*heat/i,
    oc_lucas_test: /lucas|ZnCl2/i,
    oc_williamson: /williamson|alkoxide.*alkyl halide|ether synthesis/i,
    oc_epoxide_opening: /epoxide|ring-?open|oxirane/i,
    oc_grignard: /grignard|MgBr|MgCl|organolithium|organometallic|RLi\b/i,
    oc_reduction_lialh4_nabh4: /LiAlH4|NaBH4|hydride|DIBAL|reduc/i,
    oc_hemiacetals: /acetal|ketal|hemiacetal|hemiketal|protecting group|ethylene glycol/i,
    oc_imines_enamines: /imine|enamine|hydrazone|oxime|schiff/i,
    oc_wittig: /wittig|ylide|phosphonium/i,
    oc_tollens_fehling: /tollens|fehling|benedict|silver mirror/i,
    oc_reductive_amination: /reductive amination|NaBH3CN|cyanoborohydride/i,
    oc_acyl_reactivity: /acid chloride|acyl chloride|benzoyl chloride|acetyl chloride|SOCl2|anhydride|reactivity order|most reactive|least reactive|nucleophilic acyl substitution|tetrahedral intermediate/i,
    oc_fischer_esterification: /fischer esterification|esterification|acid-catalyzed.*alcohol/i,
    oc_saponification: /saponif|soap/i,
    oc_hydrolysis: /hydroly/i,
    oc_alpha_acidity: /alpha (proton|hydrogen|carbon)|α-|enolate|LDA|haloform|iodoform/i,
    oc_aldol_condensation: /aldol/i,
    oc_claisen: /claisen|dieckmann|beta-keto ester|β-keto ester/i,
    oc_michael_addition: /michael|conjugate addition|1,4-addition|robinson/i,
    oc_huckel: /aromatic|antiaromatic|h[uü]ckel|4n ?\+ ?2/i,
    oc_eas_halogenation: /FeBr3|FeCl3|bromination of benzene|chlorination of benzene/i,
    oc_eas_nitration: /nitrat|HNO3|nitronium/i,
    oc_eas_sulfonation: /sulfonat|SO3|fuming/i,
    oc_fc_alkylation: /friedel-?crafts alkylation|alkyl halide.*AlCl3|AlCl3.*alkyl/i,
    oc_fc_acylation: /friedel-?crafts acylation|acyl chloride.*AlCl3|AlCl3.*acyl|acylium/i,
    oc_directing_effects: /ortho|meta|para|director|directing|activat|deactivat/i,
    oc_radical_halogenation: /radical|hν|light|UV|homolytic|initiation|propagation/i,
    oc_allylic_benzylic: /NBS|allylic|benzylic/i,
    oc_h_nmr: /1H NMR|¹H NMR|proton NMR|NMR|ppm|singlet|doublet|triplet|quartet|multiplet|splitting|integration|chemical shift|n ?\+ ?1/i,
    oc_c_nmr: /13C|¹³C|carbon NMR|carbon-13/i,
    oc_ir_spec: /\bIR\b|infrared|cm-1|cm⁻¹|stretch|wavenumber/i,
    oc_mass_spec: /mass spec|m\/z|molecular ion|M\+|fragment|M\+2/i,
    oc_tlc_column: /TLC|chromatograph|\bRf\b|column|silica|eluent|mobile phase|stationary phase/i,
    // Quantitative Reasoning
    qr_fractions_decimals: /fraction|decimal|\d\/\d|reciprocal|numerator|denominator/i,
    qr_percentages: /percent|%/i,
    qr_ratios_proportions: /ratio|proportion|:\d|per\b|scale|map/i,
    qr_scientific_notation: /scientific notation|×10|x ?10\^|\b10\^|e[+-]\d/i,
    qr_approximation: /estimat|approximat|closest to|nearest|round/i,
    qr_number_properties: /factor|multiple|prime|divisib|remainder|GCF|LCM|integer|even|odd/i,
    qr_order_operations: /order of operations|PEMDAS|negative|signed|evaluate|simplif|distribut/i,
    qr_unit_conversions: /convert|unit|inches|feet|yards|miles|meters|liters|gallons|ounces|pounds|celsius|fahrenheit|kilometers|centimeters/i,
    qr_linear_equations: /solve for|equation|system|linear|x ?=|y ?=|\b2x|unknown/i,
    qr_quadratics: /quadratic|x²|x\^2|factor|roots?|discriminant|binomial|FOIL|square of/i,
    qr_inequalities: /inequalit|less than|greater than|at least|at most|≤|≥|<|>/i,
    qr_absolute_value: /absolute value|\|x/i,
    qr_exponents: /exponent|power|\^|squared|cubed|root|radical|√|log|ln\b/i,
    qr_sequences: /sequence|series|arithmetic sequence|geometric sequence|term|nth/i,
    qr_functions: /function|f\(x\)|graph|slope|intercept|line/i,
    qr_rate_problems: /mph|km\/h|speed|distance|travel|miles per|average speed|rate/i,
    qr_work_problems: /worker|painter|pipe|same pace|together|alone|job|fill a tank|working/i,
    qr_mixture_problems: /mixture|solution|alloy|concentrat|mix/i,
    qr_interest_problems: /interest|compound|principal|annual rate|invest/i,
    qr_translation: /more than|less than|twice|times as|sum of|difference|word|how many|ages?/i,
    qr_basic_probability: /probab|chance|odds|random|at random|coin|die|dice|card|marble|and|or/i,
    qr_conditional_probability: /given that|conditional|if .* is known|without replacement|bayes/i,
    qr_counting_principle: /how many (ways|different)|outfits|license plate|counting|codes/i,
    qr_permutations: /arrange|permut|order matters|line up|seat/i,
    qr_combinations: /combination|choose|committee|select|subset|group of/i,
    qr_expected_value: /expected value|weighted average|on average|expected/i,
    qr_mean_median_mode: /mean|median|mode|range|average|quartile|box plot|IQR/i,
    qr_standard_deviation: /standard deviation|variance|spread/i,
    qr_normal_distribution: /normal distribution|bell|z-?score|empirical rule|68|95|99\.7/i,
    qr_data_interpretation: /table|graph|chart|data|sufficien|statement \(1\)|statement 1/i,
    qr_triangles: /triangle|pythag|hypotenuse|right angle|30-60-90|45-45-90/i,
    qr_similar_congruent: /similar|congruent|proportional sides/i,
    qr_circles: /circle|radius|diameter|circumference|arc|sector|π|pi\b/i,
    qr_polygons: /polygon|rectangle|square|hexagon|pentagon|trapezoid|parallelogram|interior angle|area of/i,
    qr_3d_solids: /volume|surface area|cube|cylinder|sphere|cone|prism|box/i,
    qr_coordinate_geometry: /coordinate|midpoint|distance between|slope|\(\s*-?\d+\s*,\s*-?\d+\s*\)/i,
    qr_sohcahtoa: /sin|cos|tan|SOHCAHTOA|opposite|adjacent|hypotenuse/i,
    qr_unit_circle: /unit circle|radian|degrees|special angle|quadrant|°/i,
    qr_trig_identities: /identity|sin²|sin\^2|cos²|cos\^2|1 ?\+ ?tan/i,
    qr_law_of_sines_cosines: /law of sines|law of cosines/i
  };

  /* ---- 3. the tag ---- */
  function stemOf(it) { return String(it.stem || it.q || it.question || ''); }
  function sectionOf(it) {
    var s = String(it.section || '').toLowerCase();
    return { gc: 'gchem', gchem: 'gchem', 'gen chem': 'gchem', ochem: 'ochem', oc: 'ochem', organic: 'ochem', bio: 'bio', biology: 'bio', qr: 'qr', pat: 'pat', rc: 'rc', reading: 'rc' }[s] || s;
  }
  function count(re, text) {
    if (!re || !text) return 0;
    var g = new RegExp(re.source, re.flags.indexOf('g') < 0 ? re.flags + 'g' : re.flags), m = text.match(g);
    return m ? m.length : 0;
  }
  function slug(x) { return String(x).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function parentOf(list) {
    var t = null;
    for (var i = 0; i < list.length; i++) { var n = NAMES[list[i]]; if (!n) continue; if (t && t !== n[1]) return null; t = n[1]; }
    return t;
  }
  /* Candidate list and declared parent topic for an item: the item's own list first (the private
     banks pass theirs), then the per-bank table by topic. */
  function candidatesOf(it, sec) {
    var t = CAND[sec] || {}, key = String(it.topic || '');
    var raw = it.canonCandidates || t[key] || t[slug(key)] || null;
    if (raw == null) return null;
    if (typeof raw === 'string') raw = [raw];
    var list = [], topic = null;
    for (var i = 0; i < raw.length; i++) { if (raw[i].charAt(0) === '@') topic = raw[i].slice(1); else if (NAMES[raw[i]]) list.push(raw[i]); }
    return { list: list, topic: topic || it.canonTopic || parentOf(list) };
  }
  /* Score each candidate on the stem; on a tie or no hit, the stem (twice the weight) plus the
     explanation of the key decide. Returns the single winner or null. */
  function choose(list, it) {
    // the choices are never read: in chemistry the wrong choices name the wrong reagents
    var stem = stemOf(it), why = String(it.why || it.explanation || '');
    var best = null, bestS = 0, second = 0;
    var s1 = list.map(function (id) { return count(KW[id], stem); });
    var top = Math.max.apply(null, s1);
    if (top > 0 && s1.filter(function (x) { return x === top; }).length === 1) return list[s1.indexOf(top)];
    // stem tie or no stem hit: add the explanation and choices for the tied (or all) candidates
    var pool = top > 0 ? list.filter(function (_, i) { return s1[i] === top; }) : list;
    pool.forEach(function (id) {
      var s = 2 * count(KW[id], stem) + count(KW[id], why);
      if (s > bestS) { second = bestS; bestS = s; best = id; } else if (s > second) second = s;
    });
    return bestS > 0 && bestS > second ? best : null;
  }

  function tag(it) {
    var sec = sectionOf(it), topic = String(it.topic || 'general');
    var c = candidatesOf(it, sec), canon = null, conf = 'low', topicId = null;
    if (c) {
      topicId = c.topic;
      if (c.list.length === 1) { canon = c.list[0]; conf = 'meta'; }
      else if (c.list.length > 1) { canon = choose(c.list, it); if (canon) conf = 'table'; }
      if (canon) topicId = NAMES[canon][1];
    }
    var out = { canon: canon, canonName: canon ? NAMES[canon][0] : null, topicId: topicId, conf: conf };
    if (sec === 'pat' || sec === 'rc') { out.skill = topic; out.skillName = it.topicName || topic; return out; }
    if (canon) { out.skill = canon; out.skillName = NAMES[canon][0]; }
    else if (topicId) { out.skill = topicId; out.skillName = (TOPICS[topicId] || topicId) + ' (general)'; }
    else { out.skill = sec + '/' + topic; out.skillName = (it.topicName || topic.replace(/-/g, ' ')) + ' (general)'; }
    return out;
  }
  function name(id) { return NAMES[id] ? NAMES[id][0] : (TOPICS[id] || null); }

  var api = { version: 2, tag: tag, sectionOf: sectionOf, name: name, names: NAMES, topics: TOPICS, candidates: CAND, keywords: KW };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.AceSkills = api;
})(typeof window !== 'undefined' ? window : null);
