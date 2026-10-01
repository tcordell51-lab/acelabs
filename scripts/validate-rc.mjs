#!/usr/bin/env node
// Validator for the Ace Labs Reading Comprehension bank (tools/rc/data).
//
//   node scripts/validate-rc.mjs            validate every passage + sections.json
//   node scripts/validate-rc.mjs <file>...  validate only these passage files
//
// Exits 1 on any error. Warnings print but do not fail. The rules are documented in
// tools/rc/SCHEMA.md; this file is the enforcement.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DATA = path.join(ROOT, 'tools/rc/data');

export const TYPES = {
  detail: 'Detail',
  inference: 'Inference',
  mainidea: 'Main idea / purpose',
  function: 'Function of a paragraph',
  except: 'EXCEPT / NOT',
  tone: 'Tone / attitude',
  application: 'Application',
  vocab: 'Vocabulary in context',
};
const ORIGINAL_MIN = { detail: 5, inference: 2, mainidea: 1, function: 1, except: 1, tone: 1, application: 1, vocab: 1 };

const BAD_CHARS = /[—–]/; // em dash, en dash
const EMOJI = /\p{Extended_Pictographic}/u;
export const wordCount = (paras) => paras.flat().join(' ').trim().split(/\s+/).filter(Boolean).length;

export function validatePassage(p, file = p && p.id) {
  const errors = [];
  const warns = [];
  const err = (m) => errors.push(`${file}: ${m}`);
  const warn = (m) => warns.push(`${file}: ${m}`);
  const scanText = (where, s) => {
    if (typeof s !== 'string') return;
    if (BAD_CHARS.test(s)) err(`${where} contains an em or en dash`);
    if (EMOJI.test(s)) err(`${where} contains an emoji or pictograph`);
  };

  if (!p || typeof p !== 'object') { err('not an object'); return { errors, warns }; }
  for (const k of ['id', 'title', 'topic', 'field', 'source']) if (typeof p[k] !== 'string' || !p[k].trim()) err(`missing ${k}`);
  if (p.id && !/^rc-[a-z0-9-]+$/.test(p.id)) err(`id ${p.id} must look like rc-xxx`);
  scanText('title', p.title);
  const original = p.source === 'original';
  if (p.source && !original && !/^migrated:/.test(p.source)) err(`source ${p.source} must be "original" or "migrated:<from>"`);

  if (!Array.isArray(p.paragraphs) || !p.paragraphs.length) { err('paragraphs must be a non-empty array'); return { errors, warns }; }
  p.paragraphs.forEach((para, i) => {
    if (!Array.isArray(para) || !para.length) return err(`paragraph ${i + 1} must be a non-empty array of sentences`);
    para.forEach((s, j) => {
      if (typeof s !== 'string' || !s.trim()) err(`P${i + 1} S${j + 1} is empty`);
      scanText(`P${i + 1} S${j + 1}`, s);
    });
  });
  const wc = wordCount(p.paragraphs);
  if (p.words !== wc) err(`words is ${p.words} but the paragraphs hold ${wc}`);
  if (original && (wc < 1100 || wc > 1400)) err(`original passage is ${wc} words; must be 1,100 to 1,400`);
  if (!original && (wc < 1000 || wc > 1800)) err(`passage is ${wc} words; outside 1,000 to 1,800`);

  const qs = Array.isArray(p.questions) ? p.questions : [];
  if (!qs.length) err('no questions');
  if (original && (qs.length < 16 || qs.length > 17)) err(`original passage has ${qs.length} questions; must be 16 or 17`);
  if (!original && (qs.length < 15 || qs.length > 17)) err(`passage has ${qs.length} questions; must be 15 to 17`);

  const ids = new Set();
  const typeCount = {};
  const keyCount = [0, 0, 0, 0, 0];
  qs.forEach((q, n) => {
    const at = q && q.id ? q.id : `question ${n + 1}`;
    if (!q || typeof q !== 'object') return err(`${at} is not an object`);
    if (!q.id) err(`${at} has no id`);
    else if (ids.has(q.id)) err(`${at} id is duplicated`);
    ids.add(q.id);
    if (!TYPES[q.type]) err(`${at} type "${q.type}" is not one of ${Object.keys(TYPES).join(', ')}`);
    typeCount[q.type] = (typeCount[q.type] || 0) + 1;
    if (typeof q.stem !== 'string' || !q.stem.trim()) err(`${at} has no stem`);
    scanText(`${at} stem`, q.stem);
    if (q.type === 'except' && !/\b(EXCEPT|NOT|LEAST)\b/.test(q.stem || '')) err(`${at} is an EXCEPT item without EXCEPT, NOT or LEAST in capitals`);

    if (!Array.isArray(q.choices) || q.choices.length !== 5) err(`${at} must have exactly five choices`);
    else {
      q.choices.forEach((c, i) => {
        if (typeof c !== 'string' || !c.trim()) err(`${at} choice ${'ABCDE'[i]} is empty`);
        scanText(`${at} choice ${'ABCDE'[i]}`, c);
        if (/\b(all|none) of the above\b/i.test(c)) err(`${at} uses "all/none of the above"`);
      });
      if (new Set(q.choices.map((c) => String(c).trim().toLowerCase())).size !== 5) err(`${at} has duplicate choices`);
      if (Number.isInteger(q.key) && q.key >= 0 && q.key < 5) {
        keyCount[q.key]++;
        const kl = q.choices[q.key].length;
        const maxOther = Math.max(...q.choices.filter((_, i) => i !== q.key).map((c) => c.length));
        if (kl >= maxOther) err(`${at} keyed choice ${'ABCDE'[q.key]} is the longest choice (${kl} >= ${maxOther} chars)`);
      }
    }
    if (!Number.isInteger(q.key) || q.key < 0 || q.key > 4) err(`${at} key must be an integer 0 to 4`);

    if (!Array.isArray(q.proof) || !q.proof.length) err(`${at} has no proof line`);
    else q.proof.forEach((pr, i) => {
      const where = `${at} proof ${i + 1}`;
      const para = p.paragraphs[(pr.paragraph || 0) - 1];
      if (!Number.isInteger(pr.paragraph) || !para) return err(`${where} paragraph ${pr.paragraph} does not exist`);
      const sent = para[(pr.sentence || 0) - 1];
      if (!Number.isInteger(pr.sentence) || typeof sent !== 'string') return err(`${where} P${pr.paragraph} sentence ${pr.sentence} does not exist`);
      if (typeof pr.quote !== 'string' || !pr.quote.trim()) return err(`${where} has no quote`);
      if (!sent.includes(pr.quote)) err(`${where} quote "${pr.quote}" is not in P${pr.paragraph} S${pr.sentence}: "${sent}"`);
      if (pr.choice !== undefined && !(Number.isInteger(pr.choice) && pr.choice >= 0 && pr.choice < 5)) err(`${where} choice must be 0 to 4`);
    });

    if (typeof q.why !== 'string' || q.why.trim().length < 20) err(`${at} needs a why (20+ chars)`);
    scanText(`${at} why`, q.why);
    if (!Array.isArray(q.distractorNotes) || q.distractorNotes.length !== 5) err(`${at} distractorNotes must have five slots`);
    else q.distractorNotes.forEach((d, i) => {
      if (i === q.key) { if (d !== null && d !== '') err(`${at} distractorNotes puts a note on its own key`); return; }
      if (typeof d !== 'string' || d.trim().length < 10) err(`${at} distractor ${'ABCDE'[i]} has no note`);
      scanText(`${at} distractor note ${'ABCDE'[i]}`, d);
    });
  });

  if (original) {
    for (const [t, min] of Object.entries(ORIGINAL_MIN)) if ((typeCount[t] || 0) < min) err(`needs at least ${min} ${t} question(s); has ${typeCount[t] || 0}`);
  }
  const most = Math.max(...keyCount);
  if (qs.length && most / qs.length > 0.4) warn(`key letter spread is lopsided: ${keyCount.map((c, i) => 'ABCDE'[i] + c).join(' ')}`);
  return { errors, warns, typeCount, keyCount, words: wc, questions: qs.length };
}

export function loadPassages(files) {
  const dir = path.join(DATA, 'passages');
  const list = files && files.length ? files : fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => path.join(dir, f));
  return list.map((f) => ({ file: path.basename(f), data: JSON.parse(fs.readFileSync(f, 'utf8')) }));
}

export function validateSections(sections, byId) {
  const errors = [];
  if (!Array.isArray(sections) || !sections.length) return ['sections.json: no sections'];
  const seen = new Set();
  sections.forEach((s) => {
    const at = `sections.json ${s.id || '?'}`;
    if (!s.id || !s.title) errors.push(`${at}: needs id and title`);
    if (seen.has(s.id)) errors.push(`${at}: duplicate id`);
    seen.add(s.id);
    if (!Array.isArray(s.passages) || s.passages.length !== 3 || new Set(s.passages).size !== 3) return errors.push(`${at}: needs three distinct passages`);
    let n = 0;
    s.passages.forEach((pid) => { if (!byId[pid]) errors.push(`${at}: passage ${pid} does not exist`); else n += byId[pid].questions.length; });
    if (n < 48 || n > 50) errors.push(`${at}: ${n} questions; a full section is 48 to 50`);
  });
  return errors;
}

export function validateAll(files) {
  const loaded = loadPassages(files);
  const errors = [];
  const warns = [];
  const byId = {};
  const stats = [];
  for (const { file, data } of loaded) {
    const r = validatePassage(data, file);
    errors.push(...r.errors);
    warns.push(...r.warns);
    if (data && data.id) {
      if (byId[data.id]) errors.push(`${file}: duplicate passage id ${data.id}`);
      byId[data.id] = data;
      if (`${data.id}.json` !== file) errors.push(`${file}: file name must be ${data.id}.json`);
    }
    stats.push({ id: data && data.id, words: r.words, questions: r.questions, types: r.typeCount, keys: r.keyCount });
  }
  let sections = [];
  const secFile = path.join(DATA, 'sections.json');
  if (!files || !files.length) {
    if (!fs.existsSync(secFile)) errors.push('sections.json is missing');
    else { sections = JSON.parse(fs.readFileSync(secFile, 'utf8')); errors.push(...validateSections(sections, byId)); }
  }
  return { errors, warns, byId, sections, stats };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const files = process.argv.slice(2).map((f) => path.resolve(f));
  const { errors, warns, stats, sections } = validateAll(files);
  const q = stats.reduce((a, s) => a + (s.questions || 0), 0);
  console.log(`RC bank: ${stats.length} passages, ${q} questions${sections.length ? `, ${sections.length} full sections` : ''}`);
  for (const w of warns) console.log('  warn  ' + w);
  for (const e of errors) console.log('  ERROR ' + e);
  if (errors.length) { console.log(`FAIL: ${errors.length} error(s)`); process.exit(1); }
  console.log('PASS');
}
