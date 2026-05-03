/* ============================================================
   TOPICS — config for every Gen Chem TikTok rendered by topic-tiktok.html
   Usage: tiktoks/topic-tiktok.html?topic=<key>
   Each topic has: hookWord, hookSub, formula, bullets, trapH, trapSub, lockWord, lockDecode
   Optional: speak{} for voice narration overrides
   ============================================================ */
window.TOPICS = {

  /* ===== TIER 0 — FOUNDATIONS ===== */
  'sig-figs': {
    tag: 'Tier 0 · Sig Figs', title: 'Sig Figs & Measurement',
    hookTag: 'Sig Figs · Free Points',
    hookWord: 'Sig figs are<br/><em>free points.</em>',
    hookSub: 'Two rules. Memorize. Bank the points.',
    formula: '× ÷ → fewest <span class="gold">sig figs</span><br/>+ − → fewest <span class="teal">decimal places</span>',
    formulaSub: 'Different rules for different operations',
    bulletsHead: 'The 4 sig fig rules',
    bullets: [
      'Non-zero digits <em>always</em> count',
      'Captive zeros (between non-zeros) <em>count</em>',
      'Leading zeros <span class="warm">never count</span>',
      'Trailing zeros count only <em>after a decimal</em>'
    ],
    caption: '× ÷ → sig figs · + − → decimals',
    trapH: '<em>Mixing</em><br/>the rules.',
    trapSub: 'Multiplication uses sig fig <em>count</em>. Addition uses decimal <em>place</em>. Apply per operation, not per problem.',
    lockWord: 'two rules.<br/>two ops.',
    lockDecode: '<span class="gold">× ÷</span> → fewest sig figs wins · <span class="teal">+ −</span> → fewest decimal places wins<br/>Exact constants (definitions, counts) have ∞ sig figs',
    speak:{
      hook:"Sig figs are free points. Two rules, memorize, bank the points.",
      formula:"Multiplication and division: round to fewest sig figs. Addition and subtraction: round to fewest decimal places.",
      trap:"Trap. Mixing the rules. Multiplication uses count, addition uses decimal place. Apply per operation.",
      lock:"Lock it in. Two rules. Two operations. Times divide, sig figs. Plus minus, decimals."
    }
  },

  'atomic': {
    tag: 'Tier 0 · Atomic', title: 'Atomic Structure',
    hookTag: 'Atomic Structure · Z Identity',
    hookWord: 'Z =<br/><em>identity.</em>',
    hookSub: 'Atomic number is who you are. Charge is what you have.',
    formula: '<span class="gold">Z</span> = protons (identity)<br/>Mass # − Z = <span class="teal">neutrons</span><br/>Charge = protons − <span class="warm">electrons</span>',
    formulaSub: 'Subscript = Z. Superscript = mass.',
    bulletsHead: 'The reads',
    bullets: [
      '<em>²³⁸₉₂U</em> → 92 protons, 146 neutrons',
      'Charge changes <em>electrons only</em> — never protons',
      '<em>Cl⁻</em> → still 17 protons, gained 1 e⁻ → 18 e⁻',
      'Aufbau exception: Cu, Cr promote 4s to fill d'
    ],
    caption: 'Z = identity. Charge = electrons.',
    trapH: 'Charge changes<br/><em>protons.</em>',
    trapSub: 'Never. Charge ALWAYS changes electrons. Protons define the element. Mg²⁺ still has 12 protons.',
    lockWord: 'sub = Z.<br/><em>super = mass.</em>',
    lockDecode: '<span class="gold">Subscript</span> = atomic # = proton count<br/><span class="teal">Superscript</span> = mass # = total nucleons<br/>Subtract for neutrons. Charge ⇒ electrons only.',
    speak:{
      hook:"Z equals identity. Atomic number is who you are.",
      formula:"Subscript is Z, the proton count. Superscript is mass. Subtract for neutrons.",
      trap:"Trap. Students think charge changes protons. It doesn't. Ever.",
      lock:"Lock it in. Subscript Z. Superscript mass. Charge changes electrons only."
    }
  },

  'quantum-numbers': {
    tag: 'Tier 0 · Quantum #s', title: 'Quantum Numbers',
    hookTag: 'Quantum Numbers · 4 Coordinates',
    hookWord: 'Each e⁻<br/><em>has 4.</em>',
    hookSub: 'No two electrons share all four. Pauli exclusion in one rule.',
    formula: '<span class="gold">n</span> = shell · <span class="teal">ℓ</span> = subshell · <span class="warm">mₗ</span> = orientation · <span class="gold">mₛ</span> = spin',
    formulaSub: 'ℓ ≤ n−1 · mₗ ranges −ℓ to +ℓ · mₛ = ±½',
    bulletsHead: 'The constraints',
    bullets: [
      'For n=3: ℓ can be <em>0, 1, 2</em> (s, p, d)',
      'For ℓ=2 (d): mₗ can be <em>−2, −1, 0, +1, +2</em>',
      'Each orbital holds <em>2 electrons</em> (opposite spin)',
      'Photon energy: <em>E = hc/λ</em> (h = 6.63×10⁻³⁴)'
    ],
    caption: 'n² orbitals · 2n² electrons per shell',
    trapH: '<em>Mixing</em><br/>units in E=hc/λ.',
    trapSub: 'h is in J·s, c in m/s, so λ MUST be in <em>meters</em>. Convert nm to m (×10⁻⁹) before plugging.',
    lockWord: '4 numbers.<br/><em>1 address.</em>',
    lockDecode: '(n, ℓ, mₗ, mₛ) — every electron has a unique combo<br/><span class="gold">2n² electrons</span> per shell · <span class="teal">E = hc/λ</span> for photons',
    speak:{
      hook:"Each electron has four. No two share all four. Pauli in one rule.",
      formula:"N is shell. L is subshell. M-L is orientation. M-S is spin.",
      trap:"Trap. Mixing units in E equals h c over lambda. Convert wavelength to meters first.",
      lock:"Lock it in. Four numbers, one address. Two N squared electrons per shell."
    }
  },

  'periodic': {
    tag: 'Tier 0 · Periodic Trends', title: 'Periodic Trends',
    hookTag: 'Periodic Trends · 2 Forces',
    hookWord: 'Two<br/><em>forces.</em>',
    hookSub: 'Z_eff vs shells. Every trend on the table.',
    formula: 'Across → <span class="gold">Z_eff wins</span>: smaller, IE↑, EN↑<br/>Down ↓ <span class="teal">shells win</span>: bigger, IE↓, EN↓',
    formulaSub: 'F at top-right (smallest, highest EN, highest IE)',
    bulletsHead: 'The locks',
    bullets: [
      'Smallest atom: top-right (<em>F, He</em>)',
      'Largest atom: bottom-left (<em>Cs, Fr</em>)',
      'Highest EN: <em>F (3.98)</em>',
      'Iso-electronic series: more p = smaller'
    ],
    caption: '→ Z_eff wins · ↓ shells win',
    trapH: 'Cation/anion<br/><em>radius flip.</em>',
    trapSub: '<em>Cations</em> are smaller than parent (lost shell). <em>Anions</em> larger (added e⁻ repulsion). Always.',
    lockWord: 'top-right<br/><em>wins.</em>',
    lockDecode: '<span class="gold">Across →</span>: Z_eff dominates · smaller, IE↑, EN↑<br/><span class="teal">Down ↓</span>: shells dominate · bigger, IE↓, EN↓',
    speak:{
      hook:"Two forces. Z effective versus shells. Every trend on the table.",
      formula:"Across the table, Z effective wins. Down the table, shells win.",
      trap:"Trap. Cation anion radius flip. Cations smaller, anions larger. Always.",
      lock:"Lock it in. Top right wins. Across, Z effective. Down, shells."
    }
  },

  'bonding': {
    tag: 'Tier 0 · Bonding', title: 'Bonding Basics',
    hookTag: 'Bonding · ΔEN Decides',
    hookWord: '<em>ΔEN</em><br/>decides.',
    hookSub: 'One number. Three bond types. No memorization.',
    formula: 'ΔEN > <span class="gold">1.7</span> → ionic<br/>ΔEN <span class="teal">0.4–1.7</span> → polar covalent<br/>ΔEN < <span class="warm">0.4</span> → nonpolar covalent',
    formulaSub: 'NaCl ΔEN ≈ 2.1 (ionic) · HCl ΔEN ≈ 0.9 (polar) · O₂ ΔEN = 0',
    bulletsHead: 'The reads',
    bullets: [
      'Metal + nonmetal → usually <em>ionic</em>',
      'Two nonmetals → <em>covalent</em> (polar or not)',
      'Same atom → <em>nonpolar</em> (ΔEN = 0)',
      'Triple > double > single (strength)'
    ],
    caption: 'ΔEN > 1.7 → ionic',
    trapH: '<em>Polar bond</em><br/>≠ polar molecule.',
    trapSub: 'CO₂ has polar bonds but is <em>nonpolar</em> overall — symmetry cancels the dipoles. Always check shape.',
    lockWord: 'bigger ΔEN<br/><em>= more ionic.</em>',
    lockDecode: '<span class="gold">> 1.7</span> ionic · <span class="teal">0.4–1.7</span> polar · <span class="warm">< 0.4</span> nonpolar<br/>Symmetric polar bonds → nonpolar molecule (CO₂, CCl₄)',
    speak:{
      hook:"Delta E N decides. One number, three bond types.",
      formula:"Bigger than one point seven, ionic. Zero point four to one point seven, polar covalent. Less than zero point four, nonpolar.",
      trap:"Trap. Polar bond doesn't mean polar molecule. C O 2 has polar bonds but the symmetry cancels.",
      lock:"Lock it in. Bigger delta E N equals more ionic."
    }
  },

  'lewis': {
    tag: 'Tier 0 · Lewis', title: 'Lewis Structures',
    hookTag: 'Lewis Structures · 5 Steps',
    hookWord: 'Lewis in<br/><em>5 steps.</em>',
    hookSub: 'Count, central, single, octets, multiples. Every time.',
    formula: '<span class="gold">e⁻</span> = Σ valence ± charge<br/><span class="teal">FC</span> = group# − dots − ½ sticks',
    formulaSub: 'Best Lewis = FC closest to 0 on every atom',
    bulletsHead: 'The 5 steps',
    bullets: [
      'Total valence e⁻ (subtract for +, add for −)',
      'Central atom: <em>least EN</em> (never H)',
      'Singles out, fill <em>outer octets</em> first',
      'Center short? Make <em>multiple bonds</em> until FC=0'
    ],
    caption: 'e⁻ count first. FC last.',
    trapH: 'Forget to add<br/><em>e⁻ for charge.</em>',
    trapSub: 'NO₃⁻ has 24 e⁻ (not 23). SO₄²⁻ has 32. Negative charge ADDS electrons. Positive SUBTRACTS.',
    lockWord: 'count.<br/>octet.<br/><em>FC=0.</em>',
    lockDecode: '<span class="gold">Period 2</span> (C, N, O, F): strict octet — never expand<br/><span class="teal">Period 3+</span> (P, S, Cl): can expand octet (sp³d, sp³d²)',
    speak:{
      hook:"Lewis in five steps. Count, central, singles, octets, multiples.",
      formula:"Total electrons equals sum of valence plus or minus charge. Formal charge equals group number minus dots minus half sticks.",
      trap:"Trap. Forget to add electrons for negative charges or subtract for positive.",
      lock:"Lock it in. Count first. Octet second. Formal charge last."
    }
  },

  'vsepr': {
    tag: 'Tier 0 · VSEPR', title: 'VSEPR & Geometry',
    hookTag: 'VSEPR · Steric # Decides',
    hookWord: 'Steric #<br/><em>= shape.</em>',
    hookSub: 'Count groups. Pick the geometry. Drop lone pairs.',
    formula: '<span class="gold">Steric #</span> = bonded atoms + lone pairs<br/>2 → linear · 3 → trig planar · 4 → tetra · 5 → trig bipyr · 6 → octa',
    formulaSub: 'Double bonds count ONCE. π doesn\'t affect steric #.',
    bulletsHead: 'The shapes',
    bullets: [
      '4 groups, 0 LP → tetrahedral (<em>CH₄, 109.5°</em>)',
      '4 groups, 1 LP → trig pyramidal (<em>NH₃, 107°</em>)',
      '4 groups, 2 LP → bent (<em>H₂O, 104.5°</em>)',
      'Each LP shaves <em>~2°</em> off bond angle'
    ],
    caption: 'Groups = bonds + LPs. Shape = atoms only.',
    trapH: 'Double bonds<br/><em>= 2 groups?</em>',
    trapSub: 'No. A double or triple bond counts as <em>ONE</em> electron group. CO₂ has 2 groups → linear.',
    lockWord: 'count groups.<br/><em>name shape.</em>',
    lockDecode: '<span class="gold">Geometry</span> = how groups arrange · <span class="teal">Shape</span> = atoms only<br/>5-group LPs → equatorial · 6-group LPs → opposite (180°)',
    speak:{
      hook:"Steric number equals shape. Count groups, pick geometry, drop lone pairs.",
      formula:"Steric number is bonded atoms plus lone pairs. Two linear, three trigonal planar, four tetrahedral.",
      trap:"Trap. Double bonds count as one group, not two.",
      lock:"Lock it in. Count groups, name shape. Geometry uses all groups, shape names only atoms."
    }
  },

  'hybridization': {
    tag: 'Tier 0 · Hybridization', title: 'Hybridization',
    hookTag: 'Hybridization · Match Steric #',
    hookWord: 'sp / sp² /<br/><em>sp³.</em>',
    hookSub: 'Steric # picks the hybrid. π bonds use leftover p.',
    formula: '<span class="gold">2</span> → sp · <span class="teal">3</span> → sp² · <span class="warm">4</span> → sp³<br/>5 → sp³d · 6 → sp³d² (period 3+ only)',
    formulaSub: 'σ uses hybrids. π uses unhybridized p orbitals.',
    bulletsHead: 'The reads',
    bullets: [
      'CH₄ → 4 groups → <em>sp³</em>',
      'CO₂ → 2 atoms (doubles count once) → <em>sp</em>',
      'BF₃ → 3 groups, 0 LP → <em>sp²</em>',
      'SF₆ → 6 groups → <em>sp³d²</em> (period 3 expanded)'
    ],
    caption: 'Steric # = hybrid type',
    trapH: 'Counting<br/><em>π in steric #.</em>',
    trapSub: 'π bonds use <em>unhybridized</em> p orbitals — they don\'t affect steric #. A double bond is 1 σ + 1 π; only the σ uses a hybrid.',
    lockWord: 'count atoms.<br/><em>not bonds.</em>',
    lockDecode: '<span class="gold">2/3/4</span> groups → <span class="teal">sp/sp²/sp³</span><br/>5/6 groups → sp³d/sp³d² (period 3+ only)',
    speak:{
      hook:"S P, S P 2, S P 3. Steric number picks the hybrid.",
      formula:"Two groups, S P. Three, S P 2. Four, S P 3.",
      trap:"Trap. Counting pi bonds toward steric number. They don't count.",
      lock:"Lock it in. Count atoms, not bonds. Two three four equals S P, S P 2, S P 3."
    }
  },

  'mole-conv': {
    tag: 'Tier 0 · Mole Conv', title: 'Mole Conversions',
    hookTag: 'Mole Conversions · The Bridge',
    hookWord: 'Mole =<br/><em>the bridge.</em>',
    hookSub: 'Always go through moles. Grams ↔ mol ↔ molecules ↔ liters.',
    formula: 'mol = <span class="gold">g / MW</span><br/>molecules = mol × <span class="teal">6.022×10²³</span><br/>L (STP) = mol × <span class="warm">22.4</span>',
    formulaSub: 'STP = 0°C, 1 atm. Otherwise use PV=nRT.',
    bulletsHead: 'The conversions',
    bullets: [
      'g → mol: divide by MW',
      'mol → molecules: × Avogadro',
      'mol → L (gas at STP): × <em>22.4 L/mol</em>',
      'NOT at STP? Use <em>n = PV/RT</em>'
    ],
    caption: 'Always go through mol',
    trapH: '22.4 L/mol<br/><em>NOT at STP.</em>',
    trapSub: 'Only valid at STP (0°C, 1 atm). At other conditions use PV=nRT. <em>Body temp</em> is not STP.',
    lockWord: 'mol = bridge.<br/><em>always.</em>',
    lockDecode: '<span class="gold">g/MW</span> = mol · mol × <span class="teal">6.022×10²³</span> = molecules<br/>mol × <span class="warm">22.4</span> = L gas (STP only)',
    speak:{
      hook:"Mole equals the bridge. Always go through moles.",
      formula:"Mol equals g over molar weight. Molecules equals mol times Avogadro. Liters at S T P equals mol times twenty two point four.",
      trap:"Trap. Twenty two point four liters per mole only at S T P.",
      lock:"Lock it in. Mole is the bridge. Always."
    }
  },

  'lim-react': {
    tag: 'Tier 0 · Lim React', title: 'Limiting Reactant',
    hookTag: 'Limiting Reactant · Smaller Wins',
    hookWord: 'Convert.<br/><em>Smaller wins.</em>',
    hookSub: 'Each reactant → mol of product. Smallest answer = limiting.',
    formula: 'Each reactant → <span class="gold">mol of product</span><br/>Smallest # → <span class="teal">limiting</span><br/>%y = <span class="warm">actual / theoretical × 100</span>',
    formulaSub: 'Limiting determines theoretical yield',
    bulletsHead: 'The process',
    bullets: [
      'Convert each reactant to mol of <em>product</em>',
      'Smaller answer = <em>limiting</em>',
      'Theoretical = limiting reactant\'s product mol',
      'Excess remaining = start − used by limiting'
    ],
    caption: 'Convert all → smallest wins',
    trapH: 'Compare reactants<br/><em>directly.</em>',
    trapSub: 'Always go to <em>product</em> first. Stoichiometric ratios matter — 4 mol H₂ vs 1 mol O₂ in 2H₂+O₂ = O₂ limits even though there\'s less.',
    lockWord: 'product.<br/><em>smaller wins.</em>',
    lockDecode: 'Convert each reactant to mol of <span class="gold">product</span><br/>Smallest answer = <span class="teal">limiting</span> · used = limiting × ratio',
    speak:{
      hook:"Convert. Smaller wins. Each reactant to product.",
      formula:"Each reactant to mol of product. Smallest number is limiting.",
      trap:"Trap. Comparing reactants directly. Always go to product first.",
      lock:"Lock it in. Product. Smaller wins."
    }
  },

  'solutions': {
    tag: 'Tier 0 · Solutions', title: 'Solutions & Concentration',
    hookTag: 'Solutions · M ≠ m',
    hookWord: 'M uses <em>L</em>.<br/>m uses <em>kg</em>.',
    hookSub: 'Molarity is solution. Molality is solvent. Don\'t mix.',
    formula: '<span class="gold">M</span> = mol / L solution<br/><span class="teal">m</span> = mol / kg solvent<br/><span class="warm">M₁V₁ = M₂V₂</span>',
    formulaSub: 'Dilution: moles conserved, only volume changes',
    bulletsHead: 'The formulas',
    bullets: [
      'Molarity (M) → <em>L of solution</em> in denominator',
      'Molality (m) → <em>kg of solvent</em> in denominator',
      'Dilution: <em>M₁V₁ = M₂V₂</em> (units cancel)',
      '%w/w = <em>g solute / g solution × 100</em>'
    ],
    caption: 'M uses L solution. m uses kg solvent.',
    trapH: 'mL instead<br/><em>of L for M.</em>',
    trapSub: 'Molarity is moles per <em>liter</em>. 100 mL ≠ 100 L. Convert before computing or you\'re off by 1000.',
    lockWord: 'M = mol/L.<br/><em>nothing else.</em>',
    lockDecode: '<span class="gold">M</span> = mol/L solution · <span class="teal">m</span> = mol/kg solvent<br/>Dilution: M₁V₁=M₂V₂ (any same unit OK)',
    speak:{
      hook:"M uses liters. M lower case uses kilograms.",
      formula:"Molarity is moles per liter of solution. Molality is moles per kilogram of solvent.",
      trap:"Trap. Using milliliters instead of liters for molarity.",
      lock:"Lock it in. M equals mol per liter. Nothing else."
    }
  },

  'imf-rank': {
    tag: 'Tier 0 · IMFs', title: 'Intermolecular Forces',
    hookTag: 'IMFs · Ion-Dipole > H-Bond > Dipole > London',
    hookWord: 'IMFs<br/><em>rank BPs.</em>',
    hookSub: 'Stronger force, higher boiling point. London is always there.',
    formula: '<span class="gold">Ion-dipole</span> > <span class="teal">H-bond</span> > <span class="warm">dipole-dipole</span> > London',
    formulaSub: 'H-bond requires H attached to N, O, or F',
    bulletsHead: 'The hierarchy',
    bullets: [
      'H-bond needs H on <em>N, O, or F</em> (NOF rule)',
      'London is in <em>everything</em> — heavier = stronger',
      'BP rank = IMF strength rank',
      'Like dissolves like (polar↔polar, nonpolar↔nonpolar)'
    ],
    caption: 'Stronger IMFs → higher BP',
    trapH: 'Confusing IMFs<br/>with <em>covalent bonds.</em>',
    trapSub: 'The O-H bond inside H₂O is <em>covalent</em>. The attraction BETWEEN two H₂O molecules is the IMF. Different things.',
    lockWord: 'NOF only<br/><em>for H-bond.</em>',
    lockDecode: '<span class="gold">H-bond</span>: H on N, O, or F<br/><span class="teal">London</span>: everywhere · bigger/heavier = stronger',
    speak:{
      hook:"I M Fs rank boiling points. Stronger force, higher B P.",
      formula:"Ion dipole, H bond, dipole dipole, London. London is always there.",
      trap:"Trap. Confusing I M Fs with covalent bonds inside the molecule.",
      lock:"Lock it in. H bond requires N, O, or F."
    }
  },

  /* ===== TIER 1 — QUANTITATIVE ===== */
  'gas-laws': {
    tag: 'Tier 1 · Gas Laws', title: 'Gas Laws',
    hookTag: 'Gas Laws · PV=nRT',
    hookWord: '<em>PV=nRT.</em><br/>Always K.',
    hookSub: 'One equation. Four knobs. R = 0.0821.',
    formula: '<span class="gold">PV = nRT</span><br/>R = 0.0821 L·atm/(mol·K)',
    formulaSub: 'Combined: P₁V₁/T₁ = P₂V₂/T₂',
    bulletsHead: 'The knobs',
    bullets: [
      'P × V = n × R × T (always Kelvin)',
      'Boyle: P↑ → V↓ at fixed T, n',
      'Charles: T↑ → V↑ at fixed P, n',
      'Graham effusion: r ∝ <em>1/√M</em> (lighter = faster)'
    ],
    caption: 'Always Kelvin. °C + 273.',
    trapH: 'Forget to convert<br/><em>°C → K.</em>',
    trapSub: 'Gas laws REQUIRE Kelvin. 27°C → 300 K. Plugging in 27 K gives nonsense answers.',
    lockWord: 'PV = nRT.<br/><em>K, L, atm.</em>',
    lockDecode: 'R = <span class="gold">0.0821</span> L·atm/(mol·K) · <em>always Kelvin</em><br/>Real gas deviates at high P, low T (IMF + volume matter)',
    speak:{
      hook:"P V equals n R T. Always Kelvin.",
      formula:"P times V equals n R T. R is zero point zero eight two one liter atm per mole Kelvin.",
      trap:"Trap. Forget to convert celsius to kelvin. Always plus two seventy three.",
      lock:"Lock it in. P V equals n R T. Kelvin, liters, atmospheres."
    }
  },

  'enthalpy': {
    tag: 'Tier 1 · Enthalpy', title: 'Enthalpy (ΔH/Hess)',
    hookTag: 'Enthalpy · Heat at Constant P',
    hookWord: 'ΔH<br/><em>= heat at P.</em>',
    hookSub: 'Negative = exo (releases). Positive = endo (absorbs).',
    formula: '<span class="gold">ΔH</span> = ΣΔH_f(products) − ΣΔH_f(reactants)<br/><span class="teal">q = mcΔT</span> (calorimetry)',
    formulaSub: 'Hess\'s law: path-independent, sum the steps',
    bulletsHead: 'The locks',
    bullets: [
      'ΔH < 0 = <em>exo</em> · ΔH > 0 = <em>endo</em>',
      'ΔH_f of element in standard state = <em>0</em>',
      'Reverse reaction → <em>flip sign</em>',
      'Bond energy: ΔH ≈ <em>Σ broken − Σ formed</em>'
    ],
    caption: 'Negative ΔH = exo',
    trapH: 'Forget stoich<br/><em>coefficients.</em>',
    trapSub: 'Σp = Σ(coefficient × ΔH_f). 2H₂O contributes 2 × ΔH_f(H₂O), not just ΔH_f(H₂O). Off by 2 = wrong answer.',
    lockWord: 'negative<br/><em>= exo.</em>',
    lockDecode: 'ΔH = <span class="gold">Σp − Σr</span> (with stoich coefficients)<br/>Hess: path-independent · element in std state ⇒ ΔH_f = 0',
    speak:{
      hook:"Delta H equals heat at constant pressure.",
      formula:"Delta H equals sum of products minus sum of reactants. Use formation enthalpies.",
      trap:"Trap. Forgetting stoichiometric coefficients in the sum.",
      lock:"Lock it in. Negative equals exo."
    }
  },

  'calorimetry': {
    tag: 'Tier 1 · Calorimetry', title: 'Calorimetry',
    hookTag: 'Calorimetry · q=mcΔT',
    hookWord: '<em>q = mcΔT.</em>',
    hookSub: 'Mass × specific heat × temperature change. That\'s it.',
    formula: '<span class="gold">q = m · c · ΔT</span><br/><span class="teal">q_cold = −q_hot</span> (mixing)<br/><span class="warm">q_phase = n · ΔH</span> (no T change)',
    formulaSub: 'c_water = 4.184 J/(g·K)',
    bulletsHead: 'The setups',
    bullets: [
      'Heating water 20→75°C: <em>q = mcΔT</em>',
      'Mixing hot + cold: <em>q_cold + q_hot = 0</em>',
      'Phase change: <em>q = n·ΔH</em> (no T change)',
      'Coffee cup: assume <em>no heat to surroundings</em>'
    ],
    caption: 'Heating: mcΔT. Phase: nΔH.',
    trapH: 'Use mcΔT<br/><em>during phase change.</em>',
    trapSub: 'During melting/boiling, T is <em>constant</em>. Use q = n·ΔH instead. The flat plateau is the giveaway.',
    lockWord: 'q = mcΔT.<br/><em>phase = nΔH.</em>',
    lockDecode: '<span class="gold">Slope</span> on heating curve: q = m·c·ΔT<br/><span class="teal">Plateau</span>: q = n·ΔH (no T change while breaking IMFs)',
    speak:{
      hook:"Q equals m c delta T.",
      formula:"Q equals mass times specific heat times temperature change. C of water is four point one eight four.",
      trap:"Trap. Using m c delta T during phase change. T is constant then.",
      lock:"Lock it in. Q equals m c delta T. Phase changes use n delta H."
    }
  },

  'entropy': {
    tag: 'Tier 1 · Entropy', title: 'Entropy (ΔS)',
    hookTag: 'Entropy · Disorder',
    hookWord: 'ΔS<br/><em>= disorder.</em>',
    hookSub: 'More gas mol, higher phase, dissolving → ΔS positive.',
    formula: '<span class="gold">ΔS > 0</span>: more gas mol, s→l→g, dissolve, heat<br/><span class="teal">ΔS < 0</span>: opposite',
    formulaSub: 'Phase change: ΔS = ΔH/T (reversible)',
    bulletsHead: 'Sign predictions',
    bullets: [
      'Solid → liquid → gas: ΔS <em>positive</em>',
      '2 mol gas → 1 mol gas: ΔS <em>negative</em>',
      'Dissolving solid in water: usually ΔS <em>positive</em>',
      'Bigger/floppier molecule: more S'
    ],
    caption: 'More gas mol = more disorder',
    trapH: 'Aqueous always<br/><em>= ΔS+?</em>',
    trapSub: 'Mostly yes, but not always. Combining 2 ions into 1 complex can be ΔS <em>negative</em>. Count the species before/after.',
    lockWord: 'count gas mol.<br/><em>that\'s it.</em>',
    lockDecode: '<span class="gold">More gas mol</span> = ΔS+<br/><span class="teal">Higher phase</span> (s→l→g) = ΔS+',
    speak:{
      hook:"Delta S equals disorder.",
      formula:"Delta S positive when gas moles increase, phase rises, or solid dissolves.",
      trap:"Trap. Aqueous always equals delta S positive? Not always.",
      lock:"Lock it in. Count gas moles. That's it."
    }
  },

  'rate-laws': {
    tag: 'Tier 1 · Rate Laws', title: 'Rate Laws',
    hookTag: 'Rate Laws · Orders Are Measured',
    hookWord: 'Orders =<br/><em>experiment.</em>',
    hookSub: 'NOT from coefficients. Compare trials. Hold others constant.',
    formula: '<span class="gold">rate = k[A]ᵐ[B]ⁿ</span><br/>Double [A], rate 2× → 1st · 4× → 2nd · same → 0th',
    formulaSub: 't½: 1st = ln2/k · 0th = A₀/2k · 2nd = 1/(kA₀)',
    bulletsHead: 'Reading trials',
    bullets: [
      'Hold one [reactant] constant, vary the other',
      'Rate scales linearly → <em>1st order</em>',
      'Rate scales as ratio² → <em>2nd order</em>',
      'Rate doesn\'t change → <em>0th order</em>'
    ],
    caption: 'Constant t₁/₂ ⇒ 1st order',
    trapH: '<em>Stoich coeff</em><br/>= reaction order?',
    trapSub: '<em>NEVER true.</em> Orders are determined experimentally. The coefficients in the balanced equation tell you nothing about the rate law.',
    lockWord: 'orders are<br/><em>measured.</em>',
    lockDecode: '<span class="gold">1st order</span>: t½ = ln2/k (independent of A₀)<br/><span class="teal">2nd</span>: t½ = 1/(kA₀) · <span class="warm">0th</span>: t½ = A₀/(2k)',
    speak:{
      hook:"Orders equal experiment. Not from coefficients.",
      formula:"Rate equals k times A to the m times B to the n. Determine m and n from trials.",
      trap:"Trap. Stoichiometric coefficient equals reaction order. Never true.",
      lock:"Lock it in. Orders are measured. Not assumed."
    }
  },

  'arrhenius': {
    tag: 'Tier 1 · Arrhenius', title: 'Arrhenius + Catalysis',
    hookTag: 'Arrhenius · k Climbs With T',
    hookWord: 'Heat<br/><em>= faster.</em>',
    hookSub: 'k = A·exp(−Eₐ/RT). Higher T means more pass the barrier.',
    formula: '<span class="gold">k = A·exp(−Eₐ/RT)</span><br/>ln(k₂/k₁) = (Eₐ/R)(1/T₁ − 1/T₂)',
    formulaSub: 'Catalyst lowers Eₐ both ways → faster but K unchanged',
    bulletsHead: 'The reads',
    bullets: [
      'Higher T → bigger k (more molecules pass Eₐ)',
      'Higher Eₐ → smaller k',
      'Catalyst <em>lowers Eₐ</em> for forward AND reverse',
      'Catalyst does <em>NOT change ΔH or K</em>'
    ],
    caption: 'Catalyst → same K, faster',
    trapH: 'Catalyst<br/><em>shifts equilibrium.</em>',
    trapSub: 'It doesn\'t. Catalyst speeds both directions equally. Same K_eq, same final position. Just gets there faster.',
    lockWord: 'lower Eₐ.<br/><em>same K.</em>',
    lockDecode: '<span class="gold">Catalyst</span>: ↓ Eₐ both ways · same K, faster<br/>Convert Eₐ from kJ to <span class="teal">J/mol</span> for ln(k₂/k₁) form',
    speak:{
      hook:"Heat equals faster. K climbs with T.",
      formula:"K equals A times exp of negative E A over R T. Higher T, bigger k.",
      trap:"Trap. Catalyst shifts equilibrium. It doesn't.",
      lock:"Lock it in. Lower E A both ways. Same K. Faster."
    }
  },

  'eq-lechat': {
    tag: 'Tier 1 · Le Châtelier', title: 'Le Châtelier',
    hookTag: 'Le Châtelier · System Replaces',
    hookWord: 'System<br/><em>replaces.</em>',
    hookSub: 'Add reactant, shift right. Add product, shift left.',
    formula: 'Add → shift <span class="gold">AWAY</span><br/>Remove → shift <span class="teal">TOWARD</span><br/>Heat: <span class="warm">endo loves heat</span>',
    formulaSub: 'Inert gas at constant V → NO shift',
    bulletsHead: 'The shifts',
    bullets: [
      'Add reactant → shift <em>right</em>',
      'Add product → shift <em>left</em>',
      '↑P (↓V) → shift toward <em>fewer gas mol</em>',
      'Heat endo → shift forward (heat is "reactant")'
    ],
    caption: 'Add → shift away',
    trapH: 'Δn(g)=0?<br/><em>P doesn\'t matter.</em>',
    trapSub: 'H₂ + I₂ ⇌ 2HI is 2 mol gas → 2 mol gas. ΔP has <em>no effect</em>. No asymmetry to push.',
    lockWord: 'system<br/><em>replaces.</em>',
    lockDecode: '<span class="gold">Add</span> → shift away · <span class="teal">Heat</span> = chemical for endo<br/>Δn(g)=0 ⇒ P doesn\'t shift',
    speak:{
      hook:"System replaces. Add reactant, shift right. Add product, shift left.",
      formula:"Add to a side, system shifts away. Remove, system shifts toward.",
      trap:"Trap. Delta n gas equals zero, pressure doesn't shift.",
      lock:"Lock it in. System replaces what you take."
    }
  },

  'eq-ice': {
    tag: 'Tier 1 · ICE Table', title: 'ICE Table',
    hookTag: 'ICE · Bookkeeping',
    hookWord: 'ICE =<br/><em>bookkeeping.</em>',
    hookSub: 'Initial, Change, Equilibrium. Solve for x.',
    formula: '<span class="gold">I</span> = initial · <span class="teal">C</span> = change (±x with coeffs) · <span class="warm">E</span> = I + C',
    formulaSub: 'Plug E into K, solve for x. If K small, drop x in (init−x).',
    bulletsHead: 'The setup',
    bullets: [
      'Write balanced equation, list initial concs',
      'Change row: <em>−x</em> for reactants, <em>+coeff·x</em> for products',
      'Equilibrium: I + C',
      'Plug into K, solve for x'
    ],
    caption: 'K < 10⁻³ → small-x approx valid',
    trapH: 'Forget coefficients<br/><em>in C row.</em>',
    trapSub: '2HI means change is <em>+2x</em> (or −2x). Half the time students drop the 2 and get the wrong K. Stoichiometry rules.',
    lockWord: 'I + C = E.<br/><em>plug into K.</em>',
    lockDecode: '<span class="gold">5% rule</span>: x/A₀ < 5% means small-x approx is fine<br/>Otherwise: solve the quadratic',
    speak:{
      hook:"I C E equals bookkeeping. Initial, change, equilibrium.",
      formula:"Initial concentrations. Change uses plus or minus x with stoich coefficients. Equilibrium is I plus C.",
      trap:"Trap. Forgetting coefficients in the change row.",
      lock:"Lock it in. I plus C equals E. Plug into K."
    }
  },

  'ph-basics': {
    tag: 'Tier 1 · pH', title: 'pH / pOH / Ka',
    hookTag: 'pH · Negative Log',
    hookWord: 'pH =<br/><em>−log[H⁺].</em>',
    hookSub: 'Powers of 10. pH 3 means [H⁺] = 10⁻³ M.',
    formula: '<span class="gold">pH = −log[H⁺]</span><br/>pH + pOH = pKw (= 14 at 25°C)<br/><span class="teal">Ka · Kb = Kw</span>',
    formulaSub: 'Pure water: [H⁺] = √Kw',
    bulletsHead: 'The relationships',
    bullets: [
      'pH + pOH = <em>14</em> (at 25°C only)',
      'pKa + pKb = <em>14</em> (conjugate pair)',
      'Brønsted: H⁺ donor/acceptor · Lewis: e⁻ pair',
      'Amphoteric: H₂O, HCO₃⁻, HSO₄⁻'
    ],
    caption: 'pH + pOH = pKw',
    trapH: '14 is a<br/><em>privilege.</em>',
    trapSub: 'pH + pOH = 14 only at <em>25°C</em>. At body temp, Kw rises and pure water pH drops below 7. The relationship still holds (pH+pOH=pKw), but the value changes.',
    lockWord: 'powers<br/>of <em>ten.</em>',
    lockDecode: '<span class="gold">pH = −log[H⁺]</span> · pOH = −log[OH⁻]<br/><span class="teal">Ka·Kb = Kw</span> · pKa+pKb = pKw',
    speak:{
      hook:"P H equals negative log of H plus.",
      formula:"P H plus p O H equals p K w. Equals fourteen at twenty five C.",
      trap:"Trap. Fourteen is a privilege, not a right. Only at twenty five C.",
      lock:"Lock it in. Powers of ten."
    }
  },

  'titration': {
    tag: 'Tier 1 · Titration', title: 'Titration Curves',
    hookTag: 'Titration · Half-Eq = pKa',
    hookWord: 'Half-eq<br/><em>= pKa.</em>',
    hookSub: 'When [HA] = [A⁻], log term = 0, pH = pKa exactly.',
    formula: 'SA+SB: eq pH = <span class="gold">7</span><br/>WA+SB: eq pH <span class="teal">> 7</span><br/>WB+SA: eq pH <span class="warm">< 7</span>',
    formulaSub: 'Half-eq: pH = pKa (HH ratio = 1)',
    bulletsHead: 'The reads',
    bullets: [
      'Strong-strong: eq at <em>pH 7</em>',
      'Weak acid + strong base: eq <em>basic (>7)</em>',
      'Weak base + strong acid: eq <em>acidic (<7)</em>',
      'Polyprotic: <em>1 eq point per ionizable H</em>'
    ],
    caption: 'Half-eq → pH = pKa',
    trapH: 'Equivalence<br/><em>= pH 7?</em>',
    trapSub: 'Only for SA+SB. For WA+SB, the conjugate base hydrolyzes water → eq pH > 7. For WB+SA, eq pH < 7. Match the indicator to eq pH.',
    lockWord: 'half-eq<br/><em>= pKa.</em>',
    lockDecode: '<span class="gold">SA+SB</span>: eq=7 · <span class="teal">WA+SB</span>: eq>7 · <span class="warm">WB+SA</span>: eq<7<br/>Polyprotic: half-step n = pKa<sub>n</sub>',
    speak:{
      hook:"Half equivalence equals p K A.",
      formula:"Strong strong, equivalence p H seven. Weak acid strong base, equivalence above seven.",
      trap:"Trap. Equivalence equals p H seven. Only for strong strong.",
      lock:"Lock it in. Half equivalence equals p K A."
    }
  },

  /* ===== TIER 2 — PATTERNS ===== */
  'galvanic': {
    tag: 'Tier 2 · Galvanic', title: 'Galvanic Cells',
    hookTag: 'Galvanic · LEO GER',
    hookWord: '<em>LEO GER.</em>',
    hookSub: 'Lose Electrons Oxidation. Gain Electrons Reduction.',
    formula: '<span class="gold">Anode</span> = oxidation (LEO)<br/><span class="teal">Cathode</span> = reduction (GER)<br/>E°_cell = <span class="warm">E°(c) − E°(a)</span>',
    formulaSub: 'ΔG° = −nFE° · F = 96,485 C/mol',
    bulletsHead: 'The reads',
    bullets: [
      '<em>An</em>ode = <em>An</em>imals lose (oxidation, e⁻ leaves)',
      '<em>Cat</em>hode = <em>Cat</em>ches (reduction, e⁻ arrives)',
      'e⁻ flow: anode → wire → cathode',
      'Higher E° = better cathode (wants e⁻ more)'
    ],
    caption: 'e⁻: anode → cathode',
    trapH: 'Reverse anode<br/><em>and cathode.</em>',
    trapSub: 'In <em>galvanic</em>: anode is −, cathode is +. In <em>electrolytic</em>: flipped (anode +, cathode −). Always know which type.',
    lockWord: 'cathode<br/><em>higher E°.</em>',
    lockDecode: '<span class="gold">Anode</span> = oxidation (e⁻ source) · <span class="teal">Cathode</span> = reduction<br/>E°_cell = E°(cathode) − E°(anode) · <span class="warm">+E° → spont</span>',
    speak:{
      hook:"L E O G E R. Lose electrons oxidation. Gain electrons reduction.",
      formula:"Anode is oxidation. Cathode is reduction. E cell equals E cathode minus E anode.",
      trap:"Trap. Reverse anode and cathode. Galvanic minus plus, electrolytic plus minus.",
      lock:"Lock it in. Cathode is higher E."
    }
  },

  'red-pot': {
    tag: 'Tier 2 · Red Pot', title: 'Standard Reduction Potentials',
    hookTag: 'Red Pot · Higher E° = Better Oxidizer',
    hookWord: 'Higher E°<br/><em>= grabs e⁻.</em>',
    hookSub: 'F₂ at top (+2.87). Li at bottom (−3.04). Read the table.',
    formula: '<span class="gold">High E°</span> = strong oxidizer (wants e⁻)<br/><span class="teal">Low E°</span> = strong reducer (gives e⁻)',
    formulaSub: 'F₂ top oxidizer · Li top reducer',
    bulletsHead: 'The reads',
    bullets: [
      'F₂ + 2e⁻ → 2F⁻ (E° = +2.87, top)',
      'Li⁺ + e⁻ → Li (E° = −3.04, bottom)',
      'Reaction proceeds when <em>E°_cell > 0</em>',
      'Cu²⁺ oxidizes Zn? Yes — Cu higher E°'
    ],
    caption: 'Higher E°_red = stronger oxidizer',
    trapH: 'Reducer<br/><em>vs reduction.</em>',
    trapSub: 'A "reducer" is the species that GETS oxidized. It REDUCES the other one. Counterintuitive — read carefully.',
    lockWord: 'top of table<br/><em>= grabs e⁻.</em>',
    lockDecode: '<span class="gold">High E°_red</span>: F₂, Cl₂, O₂, Ag⁺ (strong oxidizers)<br/><span class="teal">Low E°_red</span>: Li, K, Na, Mg (strong reducers)',
    speak:{
      hook:"Higher E equals grabs electrons. F two on top.",
      formula:"High E reduction is strong oxidizer. Low E reduction is strong reducer.",
      trap:"Trap. Reducer versus reduction. The reducer gets oxidized.",
      lock:"Lock it in. Top of table grabs electrons."
    }
  },

  'nernst': {
    tag: 'Tier 2 · Nernst', title: 'Nernst Equation',
    hookTag: 'Nernst · Non-Standard E',
    hookWord: 'E = E° −<br/><em>(0.0592/n) log Q</em>',
    hookSub: 'Standard E adjusted for actual concentrations. At 25°C.',
    formula: '<span class="gold">E = E° − (0.0592/n)·log Q</span><br/>At equilibrium: <span class="teal">E = 0, Q = K</span>',
    formulaSub: '0.0592 V per electron at 25°C',
    bulletsHead: 'The reads',
    bullets: [
      'Q > 1 → log Q > 0 → <em>E drops below E°</em>',
      'Q < 1 → log Q < 0 → <em>E climbs above E°</em>',
      'Concentration cell: E° = 0 (only Q drives)',
      'pH-dep half-rxn: <em>1 pH unit ≈ 60 mV</em>'
    ],
    caption: 'E = 0 ⇒ Q = K (equilibrium)',
    trapH: 'Wrong direction<br/><em>for Q.</em>',
    trapSub: 'Q is products / reactants for the cell as written. If you flip the cell, Q flips. Watch the sign of log Q.',
    lockWord: 'Q = K<br/><em>at equilibrium.</em>',
    lockDecode: '<span class="gold">E = E° − (0.0592/n) log Q</span><br/>Concentration cell: E° = 0, only Q drives · 1 pH ≈ 60 mV',
    speak:{
      hook:"E equals E zero minus zero point zero five nine two over n times log Q.",
      formula:"At equilibrium E equals zero and Q equals K.",
      trap:"Trap. Wrong direction for Q. Products over reactants for the cell as written.",
      lock:"Lock it in. Q equals K at equilibrium."
    }
  },

  'electrolysis': {
    tag: 'Tier 2 · Electrolysis', title: 'Electrolysis (Faraday)',
    hookTag: 'Electrolysis · Q = It',
    hookWord: 'Q = <em>It.</em>',
    hookSub: 'Charge = current × time. Moles e⁻ = Q / F.',
    formula: '<span class="gold">Q = I · t</span> (coulombs = amps · seconds)<br/>mol e⁻ = <span class="teal">Q / F</span> (F = 96,485)<br/>mol metal = <span class="warm">mol e⁻ / n</span>',
    formulaSub: 'n = electrons per ion (Cu²⁺: n=2, Ag⁺: n=1)',
    bulletsHead: 'The chain',
    bullets: [
      'Compute Q: <em>Q = I × t</em> (seconds!)',
      'Moles electrons: <em>Q / 96,485</em>',
      'Moles metal: <em>mol e⁻ / n</em>',
      'Mass: <em>mol metal × MW</em>'
    ],
    caption: 'Q → mol e⁻ → mol metal → mass',
    trapH: 'Forget to<br/><em>divide by n.</em>',
    trapSub: 'Cu²⁺ needs <em>2 e⁻</em> per atom. Forgetting n=2 doubles your answer. Ag⁺ is n=1, Al³⁺ is n=3.',
    lockWord: 'F = <em>96,485.</em>',
    lockDecode: '<span class="gold">Q = It</span> → <span class="teal">mol e⁻ = Q/F</span> → <span class="warm">mol metal = mol e⁻/n</span><br/>Time always in seconds (amps = C/s)',
    speak:{
      hook:"Q equals I times T. Charge equals current times time.",
      formula:"Q equals I T. Moles electrons equals Q over F. F is ninety six thousand four hundred eighty five.",
      trap:"Trap. Forgetting to divide by n. Cu two plus needs two electrons per atom.",
      lock:"Lock it in. F equals ninety six thousand four eighty five."
    }
  },

  'nuclear': {
    tag: 'Tier 2 · Nuclear', title: 'Nuclear Chemistry',
    hookTag: 'Nuclear · Balance Mass + Z',
    hookWord: 'Balance<br/><em>both.</em>',
    hookSub: 'Mass # AND atomic # both balance across the reaction.',
    formula: '<span class="gold">α</span>: −4 mass, −2 Z (⁴₂He)<br/><span class="teal">β⁻</span>: same mass, +1 Z (⁰₋₁e)<br/><span class="warm">γ</span>: no change (photon)',
    formulaSub: 'N = N₀ · (½)^(t/t₁/₂) · half-life is constant for 1st order',
    bulletsHead: 'The decays',
    bullets: [
      'α: ²³⁸U → ²³⁴Th + ⁴He',
      'β⁻: ¹⁴C → ¹⁴N + e⁻ (n→p)',
      'β⁺ (positron): mass same, Z−1 (p→n)',
      'After 3 half-lives → <em>1/8 (12.5%)</em> remains'
    ],
    caption: 'Mass + Z balance across',
    trapH: 'Track only<br/><em>mass.</em>',
    trapSub: 'Both mass # AND atomic # must balance. ²³⁸U → ⁴He + ²³⁴Th means 238 = 4+234 AND 92 = 2+90. Off by 1 in Z = wrong element.',
    lockWord: 'both<br/><em>balance.</em>',
    lockDecode: '<span class="gold">α</span>: −4 mass, −2 Z · <span class="teal">β⁻</span>: same mass, +1 Z<br/><span class="warm">β⁺</span>: same mass, −1 Z (p→n) · γ: no change',
    speak:{
      hook:"Balance both. Mass number and atomic number.",
      formula:"Alpha is minus four mass, minus two Z. Beta minus is same mass, plus one Z.",
      trap:"Trap. Tracking only mass. Both must balance.",
      lock:"Lock it in. Both balance."
    }
  },

  'phase-diag': {
    tag: 'Tier 2 · Phase Diag', title: 'Phase Diagrams',
    hookTag: 'Phase Diagram · Lines = Transitions',
    hookWord: 'Lines<br/><em>= transitions.</em>',
    hookSub: 'Triple point: 3 phases coexist. Critical: l/g blur.',
    formula: '<span class="gold">Triple point</span>: 3 phases coexist<br/><span class="teal">Critical point</span>: l/g indistinguishable<br/>Beyond critical → <span class="warm">supercritical fluid</span>',
    formulaSub: 'Water\'s s/l line tilts LEFT (ice less dense than water)',
    bulletsHead: 'The reads',
    bullets: [
      'Lines = phase equilibrium (2 phases coexist)',
      'Regions = single phase (s, l, or g)',
      'Triple point: <em>all 3</em> coexist',
      'CO₂ at 1 atm: sublimes (no liquid region)'
    ],
    caption: 'Water = backward s/l line',
    trapH: 'Water\'s s/l line<br/><em>tilts right?</em>',
    trapSub: 'No — water is the famous exception. Ice is <em>less dense</em> than liquid water → s/l line tilts left. Most substances tilt right.',
    lockWord: 'lines = bordered.<br/><em>triple = 3 ways.</em>',
    lockDecode: '<span class="gold">Lines</span> = phase equilibrium · <span class="teal">Triple</span> = 3 phases<br/><span class="warm">Critical</span> = l/g blur · CO₂ sublimes at 1 atm',
    speak:{
      hook:"Lines equal transitions. Triple point: three phases coexist.",
      formula:"Triple point three phases. Critical point liquid gas blur.",
      trap:"Trap. Water's solid liquid line tilts right? No, left. Ice less dense than water.",
      lock:"Lock it in. Lines equal borders. Triple equals three ways."
    }
  },

  'heating-curve': {
    tag: 'Tier 2 · Heating Curve', title: 'Heating & Cooling Curves',
    hookTag: 'Heating Curve · 5 Segments',
    hookWord: 'Five<br/><em>segments.</em>',
    hookSub: 'Slope-flat-slope-flat-slope. Phase changes are flat.',
    formula: '<span class="gold">Slope</span>: q = m·c·ΔT (heating one phase)<br/><span class="teal">Flat</span>: q = n·ΔH (phase change, no T change)',
    formulaSub: 'ΔH_vap >> ΔH_fus (vaporization is biggest)',
    bulletsHead: 'The 5 segments',
    bullets: [
      'Heat ice: <em>mcΔT</em> (slope up)',
      'Melt at 0°C: <em>nΔH_fus</em> (flat plateau)',
      'Heat water: <em>mcΔT</em> (slope up)',
      'Vaporize at 100°C: <em>nΔH_vap</em> (BIG flat)'
    ],
    caption: 'Plateau ≠ T change',
    trapH: 'Use mcΔT<br/><em>during plateau.</em>',
    trapSub: 'Plateaus are phase changes. T is <em>constant</em>. Use q = n·ΔH instead. Most heat-curve problems have multiple segments — sum them.',
    lockWord: 'slope ≠ flat.<br/><em>different formula.</em>',
    lockDecode: '<span class="gold">Slope</span>: q = m·c·ΔT (one phase, T changes)<br/><span class="teal">Plateau</span>: q = n·ΔH (phase change, no T change)',
    speak:{
      hook:"Five segments. Slope flat slope flat slope.",
      formula:"Slopes: q equals m c delta T. Plateaus: q equals n delta H.",
      trap:"Trap. Using m c delta T during a plateau. T is constant.",
      lock:"Lock it in. Slopes versus flats. Different formulas."
    }
  }
};
