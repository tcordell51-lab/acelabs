/*
  generate-timestamped.mjs — regenerate every OChem Retold clip via ElevenLabs
  with-timestamps, so we get the audio AND character-level word timings. Writes
  n<night>-s<scene>.mp3 (same as before) plus a single cues.json mapping each
  clip to { duration, words:[[word,start,end],...] } — the fuel for moving scenes.
  Run: ELEVEN_API_KEY=... node generate-timestamped.mjs [--force]
*/
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const API_KEY = process.env.ELEVEN_API_KEY;
const VOICE = process.env.ELEVEN_VOICE_ID || '8wDRDuMDgxEoTr8RxAWE';
const FORCE = process.argv.includes('--force');
const HERE = dirname(fileURLToPath(import.meta.url));
if (!API_KEY) { console.error('Set ELEVEN_API_KEY'); process.exit(1); }

const src = readFileSync(join(HERE, '..', 'index.html'), 'utf8');
function strip(s) {
  return String(s).replace(/<[^>]+>/g, '')
    .replace(/&#8722;/g, 'minus').replace(/&#948;/g, 'delta').replace(/&#960;/g, 'pi')
    .replace(/&#176;/g, ' degree').replace(/&#8594;/g, 'gives').replace(/&#8322;/g, '2').replace(/&#8323;/g, '3')
    .replace(/&#39;/g, "'").replace(/&amp;/g, 'and').replace(/\s+/g, ' ').trim();
}
const clips = [];
for (let n = 1; n <= 14; n++) {
  const a = src.indexOf(`NIGHTS[${n}]=`);
  const b = n < 14 ? src.indexOf(`NIGHTS[${n + 1}]=`) : src.indexOf('var ENGINE=');
  const walks = [...src.slice(a, b).matchAll(/walk:("(?:[^"\\]|\\.)*")/g)].map(m => JSON.parse(m[1]));
  walks.forEach((w, i) => clips.push({ id: `n${n}-s${i + 1}`, text: strip(w) }));
}

const cuesPath = join(HERE, 'cues.json');
let cues = {};
if (existsSync(cuesPath)) { try { cues = JSON.parse(readFileSync(cuesPath, 'utf8')); } catch {} }

async function tts(text) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps`, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.85, style: 0.15, use_speaker_boost: true } }),
  });
  if (!r.ok) throw new Error(r.status + ': ' + (await r.text()).slice(0, 140));
  return r.json();
}
function words(A) {
  const c = A.characters, st = A.character_start_times_seconds, et = A.character_end_times_seconds;
  const out = []; let cur = '', s = null;
  for (let i = 0; i < c.length; i++) {
    if (/\s/.test(c[i])) { if (cur) { out.push([cur, +s.toFixed(3), +et[i - 1].toFixed(3)]); cur = ''; s = null; } }
    else { if (!cur) s = st[i]; cur += c[i]; }
  }
  if (cur) out.push([cur, +s.toFixed(3), +et[c.length - 1].toFixed(3)]);
  return out;
}

console.log(`${clips.length} clips`);
let made = 0, skip = 0;
for (const c of clips) {
  if (cues[c.id] && !FORCE) { skip++; continue; }
  try {
    const d = await tts(c.text);
    writeFileSync(join(HERE, c.id + '.mp3'), Buffer.from(d.audio_base64, 'base64'));
    const w = words(d.alignment);
    cues[c.id] = { duration: w.length ? w[w.length - 1][2] : 0, words: w };
    writeFileSync(cuesPath, JSON.stringify(cues));
    made++;
    if (made % 10 === 0) console.log('  ' + made + ' done...');
  } catch (e) { console.error('  FAIL ' + c.id + ': ' + e.message); }
}
console.log(`done: ${made} generated, ${skip} skipped -> cues.json has ${Object.keys(cues).length} clips`);
