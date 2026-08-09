// One-shot cohort content-library build.
// Runs the production line per unit, fanned out in parallel, highest-yield first.
// Cleo authors -> Priya verifies (revise until 0 blockers) -> Kai renders lesson+workbook
// cloning the LOCKED reference template -> Gus QAs -> wire the passers into the hub.
//
// PREREQUISITE: the reference unit (cohort/units/oc-acids-cardio/lesson.html + workbook.html)
// must already BE the locked engine-grade + DAT-authentic standard (promote v3 first).
// Everything here clones that file, so it must be perfect before this runs.

export const meta = {
  name: 'one-shot-cohort-library',
  description: 'Build the cohort content library to the locked engine-grade + DAT-authentic standard: per unit, Cleo authors -> Priya verifies (revise loop) -> Kai renders lesson+workbook cloning the locked template -> Gus QAs. Then wire passers into the hub.',
  phases: [
    { title: 'Author',    detail: 'Cleo writes each unit content atom (teaching + authentic DAT ranking questions) in Thomas voice' },
    { title: 'Verify',    detail: 'Priya re-derives every keyed answer; Cleo revises until 0 blockers' },
    { title: 'Render',    detail: 'Kai clones the locked Studio template, draws the topic in the sk-* system, renders lesson + workbook PDF' },
    { title: 'QA',        detail: 'Gus renders each unit and audits visuals / interactions / links as a student' },
    { title: 'Integrate', detail: 'Wire the QA-passing units into the hub W[] catalog' },
  ],
}

const TEMPLATE  = '/Users/thomascordell/code/acelabs/cohort/units/oc-acids-cardio/lesson.html'
const WORKBOOK  = '/Users/thomascordell/code/acelabs/cohort/units/oc-acids-cardio/workbook.html'
const UNITS_DIR = '/Users/thomascordell/code/acelabs/cohort/units'
const HUB       = '/Users/thomascordell/code/acelabs/cohort/index.html'
const CURRICULUM= '/Users/thomascordell/code/acelabs/cohort/CURRICULUM.md'
const ENGINE    = '/Users/thomascordell/code/acelabs/tools/ochem/index.html'

const BRAND = 'Dark+gold, Georgia display, engine-grade sk-* skeletal structures + animation (drawArrow/atomPulse/confirmedTrace/trace-the-pair), I-do/We-do/You-do labeled, commit-before-reveal proof (answer+confidence lock, per-distractor rationale, error-type triage, one-line-rule, calibration, gold correct-commit flourish), both light+dark themes, prefers-reduced-motion guards. NO emojis or decorative glyphs; NO payment language; NO score predictors (calibration = practice metrics only); encouraging tone; DAT scale 200-600. Teach-here/drill-there: route the bulk of reps OUT to the live Ace Labs engine. The Move WALKS THE NAMED PROCEDURE STEP-BY-STEP — one step per beat, each with a drawn example + a tap-to-fill FILL-IN-THE-BLANK (active recall, not passive reading), the way the CARDIO reference walks C / A / R / D-I / O one letter at a time. Everything is RETRYABLE: redo any blank, per-question Try-again, and a Redo-all on the proof with attempt tracking.'

// Highest-yield first (from CURRICULUM.md). Extend this list to grow the batch.
const UNITS = [
  { slug:'gc-atoms-stoich', section:'GChem', title:'Atoms, Stoichiometry & Periodic Trends',
    spine:'Anchor: the mole is a counting bridge (grams<->particles) — "a dozen for atoms". Thesis: stoichiometry = follow the moles. Move: the MOLE MAP named procedure (g / molar mass -> mol, x mole-ratio -> mol, x molar mass -> g) + limiting reagent + percent yield; then periodic trends (radius, ionization energy, electronegativity) from ONE cause: effective nuclear pull vs number of shells. Proof: authentic DAT items — mole<->mass, limiting reagent, empirical vs molecular formula, mole-ratio stoichiometry, a periodic-trend RANK, Avogadro/particle count.' },
  { slug:'gc-equilibrium-acidbase', section:'GChem', title:'Equilibrium & Acids-Bases',
    spine:'Anchor: equilibrium settles at a fixed ratio; Le Chatelier = stress it and it leans away. Move: write Keq (products/reactants, exponents=coefficients, omit pure solids/liquids); Q vs K for direction; Le Chatelier (concentration / pressure-volume / temperature as heat term); then Ka/Kb, pH=-log[H+], strong vs weak, buffers (Henderson-Hasselbalch, pH~pKa in the buffer region). Proof: Keq expression, Le Chatelier shift, strong-acid pH, weak-vs-strong / Ka meaning, buffer, Le Chatelier with temperature.' },
  { slug:'oc-reactions', section:'OChem', title:'Reactions & Mechanisms',
    spine:'Anchor: every mechanism is electrons flowing from a source (rich: nucleophile/base) to a sink (poor: electrophile) — water downhill. Move: the SN1/SN2/E1/E2 decision tree (substrate 1/2/3 deg, reagent strength/bulk, leaving group, solvent aprotic vs protic) + addition to alkenes (Markovnikov; carbocation stability 3>2>1). Proof: SN1 vs SN2, E1 vs E2, Markovnikov regiochemistry, carbocation stability RANK, solvent effect, nucleophile/base strength or stereochemistry.' },
  { slug:'bio-cell', section:'Bio', title:'Cell & Molecular Biology',
    spine:'Anchor: the cell as a factory; the membrane as a selective gate. Move: organelles + roles, membrane transport (passive/active), enzymes (lock-and-key vs induced-fit, competitive vs noncompetitive inhibition), cellular respiration (glycolysis -> Krebs -> ETC, ATP tally) + photosynthesis (light + Calvin). Proof: organelle function, membrane transport, enzyme kinetics/inhibition, respiration stage/ATP, photosynthesis, a high-yield which-is / RANK item.' },
  { slug:'bio-genetics', section:'Bio', title:'Genetics',
    spine:'Anchor: DNA is the recipe, RNA the working copy, protein the dish (the central dogma). Move: replication/transcription/translation, the genetic code (codons, reading frame), Mendelian genetics (Punnett squares, dominant/recessive, monohybrid/dihybrid), inheritance patterns (X-linked, codominance, incomplete). Proof: central-dogma step, codon/reading, replication detail, monohybrid + dihybrid cross ratios, inheritance-pattern ID, mutation type.' },
  { slug:'bio-anatomy', section:'Bio', title:'Anatomy & Physiology',
    spine:'Anchor: each organ system as a job; homeostasis as the body thermostat. Move: nervous (neuron, action potential, synapse), endocrine (hormone feedback loops), circulatory + respiratory (path of blood, gas exchange), digestive + renal high-yield. Proof: action-potential sequence, negative-feedback hormone loop, circulatory path, respiratory gas exchange, renal/digestive function, a which-system item.' },
]

const VERDICT = { type:'object', additionalProperties:false, required:['blockers','verdict'], properties:{
  blockers:{ type:'array', items:{ type:'object', additionalProperties:false, required:['what','fix'],
    properties:{ what:{type:'string'}, fix:{type:'string'} } } },
  verdict:{ type:'string', enum:['SHIP','FIX','DO-NOT-SHIP'] } } }

const QA = { type:'object', additionalProperties:false, required:['pass','issues'], properties:{
  pass:{ type:'boolean' }, issues:{ type:'array', items:{type:'string'} } } }

log(`One-shot library build: ${UNITS.length} high-yield units, cloning the locked standard at ${TEMPLATE}.`)

const built = await pipeline(UNITS,

  // 1) AUTHOR — Cleo writes the content atom (text only; Kai renders visuals)
  (u) => agent(
    `You are Cleo, AceTheDAT content-creator. Author the CONTENT ATOM for the cohort unit "${u.section}: ${u.title}" in Thomas's voice, following the 4-beat spine and the I-do / We-do / You-do method. Read ${CURRICULUM} for context.\n\nSPINE: ${u.spine}\n\nRULES: ${BRAND}\n\nProduce (text, no HTML): (a) the teaching content, beat by beat — Anchor (one idea + one physical-story analogy + a killer visual described); The Move BROKEN INTO ONE STEP PER BEAT (walk the named procedure step by step, the way CARDIO walks C / A / R / D-I / O — each step gets its own beat with a drawn example described + a fill-in-the-blank prompt); The Reps (route the bulk to the live engine). Give each teaching beat a fill-in-the-blank (the key term/value the student supplies). (b) a "We do" guided item (predict-then-reason); (c) a "You do" bank of 6-8 AUTHENTIC DAT-style questions for this topic — mostly rank-these / which-is-strongest / which-is-most-X, full 5-choice A-E, exactly one correct, each distractor a NAMED real-student misconception with a one-line rationale, plus the key fact/anchor per item. Be exhaustive and exact: Priya will re-derive every keyed answer.`,
    { agentType:'content-creator', label:`author:${u.slug}`, phase:'Author' }),

  // 2) VERIFY — Priya adversarial fact-check, Cleo revises until clean (max 3 passes)
  async (content, u) => {
    let c = content, v
    for (let pass = 0; pass < 3; pass++) {
      v = await agent(
        `You are Priya, adversarial DAT SME. Fact-check this ${u.section} content for "${u.title}". Re-derive EVERY keyed answer and EVERY ranking from scratch; confirm exactly one correct choice per item and that each distractor is wrong-but-plausible (no accidental second-correct); confirm DAT scope (ADA outline) and flag anything off-spec. Report every real error as a BLOCKER with a concrete fix.\n\nCONTENT:\n${c}`,
        { agentType:'dat-sme', label:`verify:${u.slug}`, phase:'Verify', schema:VERDICT })
      if (!v.blockers || v.blockers.length === 0) break
      c = await agent(
        `You are Cleo. Fix EXACTLY these verified blockers in the "${u.title}" content and change nothing else:\n${v.blockers.map(b => `- ${b.what}  ->  ${b.fix}`).join('\n')}\n\nCURRENT CONTENT:\n${c}\n\nReturn the full corrected content.`,
        { agentType:'content-creator', label:`revise:${u.slug}`, phase:'Verify' })
    }
    return { content: c, verdict: v }
  },

  // 3) RENDER — Kai clones the locked template, draws the topic, renders both formats
  (vc, u) => agent(
    `You are Kai, AceTheDAT tool-engineer. Render the cohort unit "${u.section}: ${u.title}" to ${UNITS_DIR}/${u.slug}/lesson.html (the interactive lesson only; the markable PDF workbook is a separate follow-up pass, not this run).\n\nCLONE THE LOCKED STANDARD: copy ${TEMPLATE}. Keep the <style> block, the sk-* skeletal-structure system, the deck-nav + commit-before-reveal proof ENGINE, and the I-do/We-do/You-do structure BYTE-FOR-BYTE. Swap ONLY: the <title>/unit-tag, the stage bodies, the We-do widget data, and the PQ proof array — filled from the VERIFIED content below. Draw THIS topic's real structures/diagrams in the sk-* system (reuse geometry from ${ENGINE} where relevant); animate the key teaching moment; guard all motion behind prefers-reduced-motion. ${BRAND}\n\nVERIFIED CONTENT:\n${vc.content}\n\nVerify your output renders (headless-screenshot a few stages) and report the file paths + any risks.`,
    { agentType:'tool-engineer', label:`render:${u.slug}`, phase:'Render' }),

  // 4) QA — Gus audits the rendered unit as a student
  (r, u) => agent(
    `You are Gus, AceTheDAT QA auditor. QA the rendered cohort unit lesson at ${UNITS_DIR}/${u.slug}/lesson.html. Serve it locally or headless-render, and audit as a student: every stage renders; the CARDIO-style step-walk + skeletal structures + animations show; the fill-in-the-blanks lock and retry; the We-do widget responds; commit-before-reveal + calibration + Redo-all all work; the You-do questions draw their structures; no dead links; no emojis/glyphs; no payment language; no score predictors; both themes OK. Return pass=true only if it clears the bar, else pass=false with a specific issue list.`,
    { agentType:'qa-auditor', label:`qa:${u.slug}`, phase:'QA', schema:QA })
)

// 5) INTEGRATE — wire the QA-passing units into the hub
phase('Integrate')
const ok     = UNITS.filter((u, i) => built[i] && built[i].pass)
const failed = UNITS.filter((u, i) => !built[i] || !built[i].pass)
if (ok.length) {
  await agent(
    `You are Kai. Wire these QA-passed cohort units into the hub catalog at ${HUB} (the W[] array): ${ok.map(u => `${u.slug} ("${u.section}: ${u.title}")`).join('; ')}. Point each matching week/track cell's module link at units/<slug>/lesson.html, following the existing pattern (see the OChem CARDIO Week-4 Chemistry cell). Syntax-check the hub script afterward. Do NOT deploy, push, or commit.`,
    { agentType:'tool-engineer', label:'integrate-hub', phase:'Integrate' })
}
log(`Done. QA-passed: ${ok.length}/${UNITS.length}. Needs attention: ${failed.map(u => u.slug).join(', ') || 'none'}`)
return { built: ok.map(u => u.slug), needsAttention: failed.map(u => u.slug) }
