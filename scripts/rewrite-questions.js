#!/usr/bin/env node
// Bulk-rewrite the question bank using Claude (Sonnet 4.6) to upgrade each
// terse fact-recall stem into a DAT-realistic application question.
//
// Behavior:
//   - Reads scripts/dat-mock-bank.json
//   - For each entry, sends Claude a strict prompt asking for a richer stem,
//     5 plausible distractors, the same correct-answer concept, and a 2-3
//     sentence "why" explanation.
//   - Preserves the original entry's id / topic / difficulty / _ada_category
//     so the composer continues to slot it correctly.
//   - Writes back incrementally — script is RESUMABLE. If killed, re-running
//     skips entries that already carry the rewrite marker (`_rewritten: true`).
//   - Validates each response shape (5 options, correct-index 0..4, why field
//     non-empty). Failed rewrites are left as-is and logged.
//
// Usage:
//   ANTHROPIC_API_KEY=sk-ant-... node scripts/rewrite-questions.js [section] [limit] [--parallel=N]
//
// Examples:
//   node scripts/rewrite-questions.js ochem 5            # validate run on 5 OChem
//   node scripts/rewrite-questions.js ochem              # all OChem
//   node scripts/rewrite-questions.js all 100            # 100 from any section
//   node scripts/rewrite-questions.js all                # entire bank
//   node scripts/rewrite-questions.js ochem 50 --parallel=5
//
// Cost estimate (Sonnet 4.6, ~200in/400out tokens per question):
//   ~$0.003 per rewrite. Whole bank (1413 non-QR questions) ≈ $4-5.

const fs = require('fs');
const https = require('https');

const BANK_PATH = '/Users/thomascordell/Documents/Claude/Projects/AceDAT-AceLabs/scripts/dat-mock-bank.json';
const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-4-6';

if (!API_KEY){
  console.error('ERROR: set ANTHROPIC_API_KEY env var first.');
  console.error('  Get one from https://console.anthropic.com/settings/keys');
  console.error('  Then: export ANTHROPIC_API_KEY=sk-ant-... && node scripts/rewrite-questions.js ...');
  process.exit(1);
}

const args = process.argv.slice(2);
const section = args[0] || 'ochem';
const limit = parseInt(args.find(a => /^\d+$/.test(a))) || Infinity;
const parallelArg = args.find(a => a.startsWith('--parallel='));
const PARALLEL = parallelArg ? parseInt(parallelArg.split('=')[1]) : 4;

console.log(`Rewriting section=${section} limit=${limit} parallel=${PARALLEL} model=${MODEL}`);

// ----- Prompt template -----
function buildPrompt(p, sectionLabel){
  // Keep original correct answer text so the rewrite preserves the right answer.
  const correctText = p.opts ? p.opts[p.correct] : '(no options)';
  return `You are upgrading a Dental Admission Test (DAT) practice question into a DAT-realistic format.

Original question (${sectionLabel}, topic="${p.topic}", difficulty=${p.difficulty}):
  Stem: "${p.q}"
  Options:
${(p.opts || []).map((o, i) => `    ${'ABCDE'[i]}. ${o}`).join('\n')}
  Correct answer: ${('ABCDE')[p.correct]}. ${correctText}

Rewrite this question into a DAT-realistic version that:
- Has a stem 25-60 words long with concrete reaction conditions, reagent quantities, temperatures, solvents, or other context appropriate to a real DAT question.
- Has EXACTLY 5 answer choices, all plausible (no obvious throwaways). The correct answer must remain conceptually the same (same key chemistry/biology/math principle, same correct molecule/value/explanation), but you may rephrase its wording.
- Has a 2-3 sentence "why" explanation describing the reasoning, including any key concept, formula, or rule that points to the correct answer.

Difficulty target: ${p.difficulty} (1=easy → 4=expert). Calibrate the question depth accordingly — diff 4 should require multi-step reasoning or a non-obvious application.

Respond with ONLY a JSON object in this exact shape, no prose before or after:
{
  "q": "<rewritten stem>",
  "opts": ["<A>", "<B>", "<C>", "<D>", "<E>"],
  "correct": <index 0-4 of the correct option in your rewritten opts array>,
  "why": "<2-3 sentence explanation>"
}`;
}

// ----- HTTP helper -----
function callClaude(prompt){
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: MODEL,
      max_tokens: 1200,
      temperature: 0.4,
      messages: [{ role: 'user', content: prompt }]
    });
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'content-length': Buffer.byteLength(body)
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message || JSON.stringify(parsed.error)));
          const text = parsed.content?.[0]?.text || '';
          resolve(text);
        } catch(e){ reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ----- Parse + validate -----
function extractJson(text){
  // Be tolerant — some responses wrap in ```json``` fences
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenced) return JSON.parse(fenced[1]);
  // Find first { and matching last }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('no JSON in response');
  return JSON.parse(text.slice(start, end + 1));
}

function validate(rewrite, original){
  if (!rewrite.q || typeof rewrite.q !== 'string' || rewrite.q.length < 30){
    return 'stem too short';
  }
  if (!Array.isArray(rewrite.opts) || rewrite.opts.length !== 5){
    return 'opts must be array of 5';
  }
  if (rewrite.opts.some(o => typeof o !== 'string' || !o.length)){
    return 'options must be non-empty strings';
  }
  if (typeof rewrite.correct !== 'number' || rewrite.correct < 0 || rewrite.correct > 4){
    return 'correct index out of range';
  }
  if (!rewrite.why || typeof rewrite.why !== 'string' || rewrite.why.length < 20){
    return 'why too short';
  }
  return null;
}

// ----- Pipeline -----
async function rewriteOne(p, sectionLabel){
  const prompt = buildPrompt(p, sectionLabel);
  let attempt = 0;
  while (attempt < 3){
    attempt++;
    try {
      const text = await callClaude(prompt);
      const rewrite = extractJson(text);
      const err = validate(rewrite, p);
      if (err){ throw new Error('validation: ' + err); }
      return rewrite;
    } catch(e){
      if (attempt >= 3) throw e;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

async function processSection(bank, sectionKey, sectionLabel, perSectionLimit){
  const arr = bank[sectionKey];
  let rewrittenCount = 0, skipped = 0, failed = 0;
  let cursor = 0;

  // Process in waves of PARALLEL
  const todo = arr.filter(p => !p._rewritten).slice(0, perSectionLimit);
  console.log(`  ${sectionLabel}: ${arr.length} total, ${todo.length} to rewrite`);
  if (!todo.length) return;

  for (let i = 0; i < todo.length; i += PARALLEL){
    const batch = todo.slice(i, i + PARALLEL);
    const results = await Promise.allSettled(batch.map(p => rewriteOne(p, sectionLabel)));
    results.forEach((r, j) => {
      const p = batch[j];
      if (r.status === 'fulfilled'){
        const rw = r.value;
        // Preserve id/topic/difficulty/_ada_category; replace q/opts/correct/why
        p.q = rw.q;
        p.opts = rw.opts;
        p.correct = rw.correct;
        p.why = rw.why;
        p._rewritten = true;
        rewrittenCount++;
      } else {
        failed++;
        console.log(`    FAIL ${p.id}: ${r.reason.message}`);
      }
    });
    // Persist after every batch so a crash loses at most PARALLEL rewrites
    fs.writeFileSync(BANK_PATH, JSON.stringify(bank));
    process.stdout.write(`\r  ${sectionLabel}: ${rewrittenCount}/${todo.length} ok, ${failed} failed`);
  }
  console.log('');
}

async function main(){
  const bank = JSON.parse(fs.readFileSync(BANK_PATH, 'utf8'));

  // Determine sections
  const sections = section === 'all'
    ? [['ochem','Organic Chemistry'], ['gc','General Chemistry'], ['bio','Biology']]
    : [[section, { ochem:'Organic Chemistry', gc:'General Chemistry', bio:'Biology', qr:'Quantitative Reasoning' }[section]]];

  // Distribute the limit across sections evenly when 'all'
  const perSection = section === 'all' ? Math.ceil(limit / sections.length) : limit;

  for (const [key, label] of sections){
    await processSection(bank, key, label, perSection);
  }

  console.log('Done.');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(2); });
