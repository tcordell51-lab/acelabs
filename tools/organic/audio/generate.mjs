/*
  generate.mjs — auto-generate the per-scene coach-voice clips for OChem, Retold
  in Thomas's cloned ElevenLabs voice. Run ONCE the voice is cloned:

    ELEVEN_API_KEY=sk_... ELEVEN_VOICE_ID=<cloned voice id> node generate.mjs

  It reads the student-facing "walk" text of every scene straight out of
  ../index.html, sends each to ElevenLabs TTS, and writes n<night>-s<scene>.mp3
  into this folder - exactly where the player auto-discovers them. Idempotent:
  skips a scene whose clip already exists (pass --force to overwrite).

  No key is committed anywhere; it comes from the environment at run time.
*/
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const API_KEY = process.env.ELEVEN_API_KEY;
// Default = "Thomas Coach", the clone built 2026-07 from a clean 195s solo Zoom
// teaching segment (far better than the old ~20s "Tommy"). Override with env.
const VOICE_ID = process.env.ELEVEN_VOICE_ID || '8wDRDuMDgxEoTr8RxAWE';
const MODEL = process.env.ELEVEN_MODEL || 'eleven_multilingual_v2';
const FORCE = process.argv.includes('--force');
const HERE = dirname(fileURLToPath(import.meta.url));

if (!API_KEY || !VOICE_ID) {
  console.error('Set ELEVEN_API_KEY and ELEVEN_VOICE_ID (the cloned voice id). Aborting.');
  process.exit(1);
}

// ---- pull every scene's student-facing "walk" line out of index.html ----
const src = readFileSync(join(HERE, '..', 'index.html'), 'utf8');
function stripHtml(s) {
  return String(s)
    .replace(/<[^>]+>/g, '')
    .replace(/&#8722;/g, 'minus').replace(/&#948;/g, 'delta').replace(/&#960;/g, 'pi')
    .replace(/&#176;/g, ' degree').replace(/&#8594;/g, 'gives').replace(/&#8322;/g, '2').replace(/&#8323;/g, '3')
    .replace(/&#39;/g, "'").replace(/&amp;/g, 'and')
    .replace(/\s+/g, ' ').trim();
}
const clips = [];
for (let n = 1; n <= 13; n++) {
  const a = src.indexOf(`NIGHTS[${n}]=`);
  const b = n < 13 ? src.indexOf(`NIGHTS[${n + 1}]=`) : src.indexOf('var ENGINE=');
  const seg = src.slice(a, b);
  const walks = [...seg.matchAll(/walk:'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1].replace(/\\'/g, "'"));
  walks.forEach((w, i) => clips.push({ night: n, scene: i + 1, text: stripHtml(w) }));
}
console.log(`${clips.length} scene clips to generate across 13 nights.`);

async function tts(text) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: { stability: 0.5, similarity_boost: 0.85, style: 0.15, use_speaker_boost: true },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return Buffer.from(await res.arrayBuffer());
}

let made = 0, skipped = 0;
for (const c of clips) {
  const out = join(HERE, `n${c.night}-s${c.scene}.mp3`);
  if (existsSync(out) && !FORCE) { skipped++; continue; }
  try {
    const buf = await tts(c.text);
    writeFileSync(out, buf);
    made++;
    console.log(`  ok  n${c.night}-s${c.scene}  (${c.text.length} chars)`);
  } catch (e) {
    console.error(`  FAIL n${c.night}-s${c.scene}: ${e.message}`);
  }
}
console.log(`Done: ${made} generated, ${skipped} skipped. Commit the mp3s and they go live.`);
