/* Battle moves: every type fights differently, and every move asks a different
 * kind of exam question.
 *
 * Move format decides the question you get:
 *   quick     true/false and short recall        (weak, unlimited)
 *   standard  one-best-answer multiple choice    (medium, unlimited)
 *   clinical  internal ID for Application: apply an idea to a case (strong, 4 uses)
 *   figure    read a figure                (strong, 3 uses)
 *   signature the lesson line's own move: your open misses from that session
 *             first, else a vignette or figure   (strongest, 2 uses)
 *
 * Moves unlock with game progression: base forms know quick and standard; the
 * middle form adds application and figure; the final form gains its signature.
 * Fighting styles are fictional combat mechanics, separate from mastery evidence.
 */
(function(root){
  'use strict';
  const FORMAT={
    quick:{name:'Quick',power:22,pp:99,note:'True/false or short recall'},
    standard:{name:'Standard',power:30,pp:99,note:'One-best-answer question'},
    clinical:{name:'Application',power:40,pp:4,note:'Apply an idea to a case'},
    figure:{name:'Figure',power:38,pp:3,note:'Read a figure'},
    signature:{name:'Signature',power:50,pp:2,note:'Your misses from this session first'}
  };
  // [quick, standard, clinical, figure] per type: [name, fact]
  const TYPE_MOVES={
    fuel:[['Glucose Spark','Glucose is the brain\'s main fuel in the fed state.'],['Fed-State Surge','After a meal, insulin moves glucose into muscle and fat.'],['Fasting Switch','In a fast, the liver turns to gluconeogenesis and ketone output.'],['Tissue Map','Each tissue burns its own preferred fuel.']],
    membrane:[['Vesicle Toss','Vesicles carry cargo between compartments.'],['Porin Pass','Porins let small molecules through the outer mitochondrial membrane.'],['Compartment Lock','Lysosomal enzymes work at acid pH, sealed off from the cytosol.'],['Organelle Atlas','Every organelle keeps its own chemistry.']],
    bond:[['H-Bond Snap','Hydrogen bonds are weak alone and strong in number.'],['Salt Bridge','Ionic bonds pair opposite charges on side chains.'],['Disulfide Lock','A disulfide bond links two cysteines.'],['Buffer Wall','A buffer resists pH change best near its pKa.']],
    catalyst:[['Active Site','Substrate binds the active site.'],['Km Strike','Km is the substrate level that gives half of Vmax.'],['Allosteric Shift','Allosteric effectors bind away from the active site.'],['Lineweaver Line','A double-reciprocal plot tells inhibitor types apart.']],
    signal:[['Second Messenger','cAMP carries the hormone\'s message inside the cell.'],['Kinase Relay','Kinases add phosphates; phosphatases take them off.'],['G-Protein Switch','A G protein is on with GTP and off with GDP.'],['Cascade Map','The enzyme steps of a cascade amplify the signal.']],
    oxygen:[['Heme Grip','The iron in heme binds oxygen.'],['Bohr Push','Acid and CO2 push hemoglobin to release oxygen.'],['Sigmoid Surge','Cooperative binding makes hemoglobin\'s curve sigmoidal.'],['Curve Read','A right shift means lower affinity and more unloading.']],
    helix:[['Primer Drop','Primase lays down the RNA primer.'],['Okazaki Stitch','Ligase seals the Okazaki fragments.'],['Proofread','A 3\' to 5\' exonuclease removes a mispaired base.'],['Fork Map','Leading and lagging strands grow in opposite directions at the fork.']],
    gene:[['Codon Call','AUG starts translation.'],['Promoter Bind','Transcription factors bind promoters and enhancers.'],['Silencer','miRNA silences its target mRNA.'],['Ribosome Chart','The ribosome moves along the mRNA one codon at a time.']],
    redox:[['Electron Hop','NADH hands its electrons to Complex I.'],['Proton Pump','Complexes I, III and IV pump protons out of the matrix.'],['Uncoupler','An uncoupler lets protons leak back, so heat replaces ATP.'],['Synthase Spin','ATP synthase turns as protons flow back into the matrix.']],
    lipid:[['Carnitine Ferry','Carnitine carries long fatty acids into the mitochondrion.'],['Beta Cut','Each beta-oxidation turn removes two carbons as acetyl-CoA.'],['Ketone Burst','In a long fast, the liver makes ketone bodies.'],['Fat Map','Adipose tissue stores fat and releases it in a fast.']],
    tool:[['Gel Run','Smaller DNA fragments run farther on a gel.'],['PCR Loop','PCR doubles the target with every cycle.'],['Blot Probe','Southern blots DNA, Northern blots RNA, Western blots protein.'],['Sequence Read','Sequencing reads the bases in order.']],
    solvent:[['Hydration Shell','Water surrounds ions and polar groups with a hydration shell.'],['Buffer Tide','Bicarbonate buffers the blood against a change in pH.'],['Osmotic Surge','Water moves toward the side with more dissolved solute.'],['Hydrolysis Wave','Hydrolysis uses a molecule of water to split a bond.']],
    neutral:[['Tackle','A steady, plain attack.'],['Study Hit','A steady, plain attack.'],['Case Study','A steady, plain attack.'],['Diagram','A steady, plain attack.']]
  };
  // One signature move per lesson line (session): [name, fact]
  const SIGNATURE={
    1:['Fuel Crossroads','Carbohydrate, fat and protein can all be burned for energy.'],
    2:['Compartment Storm','Separating pathways into organelles lets opposing reactions run at once.'],
    3:['Henderson-Hasselbalch','pH equals pKa when an acid is half dissociated.'],
    4:['Michaelis-Menten','Velocity rises with substrate until the enzyme is saturated at Vmax.'],
    5:['cAMP Cascade','One hormone at the receptor becomes thousands of activated enzymes.'],
    6:['T-to-R Shift','Oxygen binding breaks salt bridges and flips hemoglobin to the relaxed state.'],
    7:['Replication Fork','Helicase opens the fork; polymerase copies both strands.'],
    8:['Sanger Read','Dideoxy nucleotides stop the chain so fragment length gives the sequence.'],
    9:['Apoptosome','Cytochrome c release assembles the apoptosome and activates caspase 9.'],
    10:['Peptidyl Transfer','The ribosome joins each new amino acid by a peptide bond.'],
    11:['Enhancer Loop','DNA loops so a distant enhancer reaches the promoter.'],
    12:['Excision Repair','Damage is cut out and the gap is filled from the intact strand.'],
    13:['PFK-1 Commit','PFK-1 is the committed step of glycolysis.'],
    14:['Chemiosmosis','The proton gradient across the inner membrane drives ATP synthase.'],
    15:['Ketogenesis','Liver mitochondria turn excess acetyl-CoA into ketone bodies.']
  };
  // Passive style per type.
  const STYLES={
    fuel:{name:'Charge reserve',say:'Every correct answer banks 1 charge (up to 4). Application, Figure and Signature moves spend 2 charges for +40% damage before battle caps. Checkpoint damage stays fixed.',fact:'Charges are a fictional battle resource, separate from learning evidence.'},
    membrane:{name:'Selective barrier',say:'Counterattacks against it are 25% weaker.',fact:'A membrane decides what gets through.'},
    bond:{name:'Buffer',say:'No single counterattack can take more than 35% of its max HP.',fact:'A buffer absorbs added acid or base and keeps pH steady.'},
    catalyst:{name:'Rate enhancement',say:'Its streak bonus starts at 2 in a row and grows 15% with every further correct answer.',fact:'Enzymes speed reactions by lowering the activation energy.'},
    signal:{name:'Amplification cascade',say:'Each consecutive correct answer adds 20% damage, up to +80%. A miss resets it.',fact:'A phosphatase ends a kinase signal, the way a miss ends the chain.'},
    oxygen:{name:'Cooperativity',say:'Weak at first, then stronger: 0.75x, 1x, then 1.35x from the third hit in a row. Below 40% HP it gains 25% (Bohr effect).',fact:'Each oxygen that binds makes the next one bind more easily.'},
    helix:{name:'Proofreading',say:'Once per battle, its first wrong answer is caught: that choice is struck out and you answer again with no counterattack. The miss still goes to your review deck.',fact:'Pol delta proofreads and removes a wrong base before moving on.'},
    gene:{name:'Silencing',say:'After 3 correct answers in a battle, the next counterattack is silenced to 0, once per battle.',fact:'miRNA silences a message before it is translated.'},
    redox:{name:'Chemiosmosis',say:'Each correct answer pumps 1 proton. At 4, ATP synthase fires 25 bonus damage and the gradient resets.',fact:'The proton gradient, not the electrons themselves, makes the ATP.'},
    lipid:{name:'Fat reserve',say:'Each correct answer restores 6 HP.',fact:'Fat is the body\'s largest energy store.'},
    tool:{name:'Assay',say:'Its moves ignore a braced foe, and figure moves hit 25% harder.',fact:'A good assay reads the result directly.'},
    solvent:{name:'Mixing current',say:'A correct answer on a different route than your last answer hits 25% harder.',fact:'Water is the solvent in every compartment, so it links every compartment.'},
    neutral:{name:'Steady',say:'No special style.',fact:''}
  };
  const TYPE_FMT=['quick','standard','clinical','figure'];
  const B=()=>root.AtlasBestiary;
  function mid(id,k){return id+':'+k;}
  // Course packs: moves, styles and signatures for another course's types, namespaced
  // "<COURSE>:<typeId>" so the core tables above are untouched. Each pack style names a
  // mechanic (one of the core style families); styleOf reports that family as its type so
  // the battle math reuses the existing code paths.
  const PACK_MOVES={},PACK_STYLES={},PACK_SIG={};
  function registerCoursePack(pack){
    if(!pack||!pack.course||pack.course==='CORE'||PACK_SIG[pack.course])return false;
    const C=pack.course,ns=id=>C+':'+id;
    for(const [id,t] of Object.entries(pack.types||{})){
      const mv=(pack.moves||{})[id]||[];PACK_MOVES[ns(id)]=TYPE_FMT.map((f,k)=>mv[k]||[t.name+' '+FORMAT[f].name,FORMAT[f].note+'.']);
      const y=(pack.styles||{})[id]||{},mech=STYLES[y.mechanic]&&y.mechanic!=='neutral'?y.mechanic:'bond';
      PACK_STYLES[ns(id)]={name:(y.explicit&&y.name)||t.name+' momentum',say:(y.explicit&&y.say)||STYLES[mech].say,fact:y.fact||'A fictional '+t.name+' battle style; game bonuses do not establish DAT mastery.',mechanic:mech,typeId:ns(id)};
    }
    PACK_SIG[C]={};for(const [n,v] of Object.entries(pack.signature||{}))if(Array.isArray(v)&&v[0])PACK_SIG[C][+n]=v;
    return true;
  }
  // The moves a party member knows right now, from its type, line and stage (or level).
  function movesFor(member){
    const Bx=B(),id=member.id,type=Bx?.typeOf?.(id)||'neutral',list=TYPE_MOVES[type]||PACK_MOVES[type]||TYPE_MOVES.neutral;
    const isLine=Bx?.isLine?.(id),sp=isLine&&Bx.species.find(s=>s.id===id),rare=sp&&sp.line.rare;/* water Mnemons count as rare: all four moves */
    const stage=isLine?(rare?1:Bx.stageOf(id)):((member.lv||1)>=6?2:(member.lv||1)>=3?1:0);
    const mk=k=>({...FORMAT[TYPE_FMT[k]],id:mid(type,k),name:list[k][0],fact:list[k][1],format:TYPE_FMT[k],type});
    let out=[mk(0),mk(1)];if(stage>=1)out.push(mk(2),mk(3));
    if(isLine&&!rare&&stage>=2){const n=sp.line.session,C=sp.line.course,sg=C?(PACK_SIG[C]||{})[n]:SIGNATURE[n];if(sg)out=[{...FORMAT.signature,id:'sig:'+(C?C+':':'')+n,name:sg[0],fact:sg[1],format:'signature',type,session:n},...out.slice(1)];}
    return out;
  }
  function styleOf(id){const t=B()?.typeOf?.(id)||'neutral';if(STYLES[t])return {type:t,...STYLES[t]};const p=PACK_STYLES[t];if(p)return {type:p.mechanic,...p};return {type:'neutral',...STYLES.neutral};}
  // The style shown for a type id on a type codex (core or pack).
  function styleForType(t){return STYLES[t]||PACK_STYLES[t]||null;}
  // Which question kinds a format pulls.
  function fits(format,it){if(!it)return false;const k=it.kind;
    if(format==='quick')return k==='tf'||k==='recall';
    if(format==='standard')return k==='mcq'||k==='stem'||k==='application'||k==='multi'||(!k&&!it.fig)||it.tier==='warmup';
    if(format==='clinical')return k==='vignette'||k==='case';
    if(format==='figure')return !!it.fig;
    return k==='vignette'||k==='case'||!!it.fig;}
  // The format an item actually is, so a move's shown name always matches the question:
  // true/false and recall are quick, vignettes and cases clinical, a figure figure, else standard.
  function formatOfItem(it){if(!it)return 'standard';const k=it.kind;if(k==='tf'||k==='recall')return 'quick';if(k==='vignette'||k==='case')return 'clinical';if(it.fig)return 'figure';return 'standard';}
  // When the chosen move cannot be served (no question of its format left), the turn plays as
  // the same type's move for the item's real format, with that format's power. A signature
  // move stays a signature when it serves one of your open misses (its stated job).
  // listed (10/07): the active creature's own moves (movesFor). The turn may only play as a move in that
  // list, never as a type move the creature has not learned; if none of its moves fits the question, the
  // chosen move plays as itself.
  function alignMove(mv,it,isMiss,listed){if(!mv||!it||!FORMAT[mv.format])return mv;
    if(mv.format==='signature'?(isMiss||fits('signature',it)):fits(mv.format,it))return mv;
    const f=formatOfItem(it),k=TYPE_FMT.indexOf(f);
    if(Array.isArray(listed)){const own=listed.find(x=>x&&x.format===f&&x.type===mv.type);return own?{...own,alignedFrom:mv.id}:mv;}
    const list=TYPE_MOVES[mv.type]||PACK_MOVES[mv.type]||TYPE_MOVES.neutral,row=list[k]||[FORMAT[f].name,FORMAT[f].note+'.'];
    return {...FORMAT[f],id:mid(mv.type,k),name:row[0],fact:row[1],format:f,type:mv.type,alignedFrom:mv.id};}
  root.AtlasMoves={FORMAT,TYPE_MOVES,SIGNATURE,STYLES,movesFor,styleOf,fits,registerCoursePack,styleForType,formatOfItem,alignMove};
})(typeof window!=='undefined'?window:globalThis);
