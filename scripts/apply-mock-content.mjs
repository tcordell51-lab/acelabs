#!/usr/bin/env node
// Applies the hand-written content layer in scripts/mock-content/ to tools/mock/data/full-mocks.js.
//
//   node scripts/apply-mock-content.mjs          rewrite full-mocks.js with the layer applied
//   node scripts/apply-mock-content.mjs --check  fail if full-mocks.js is not up to date with the layer
//
// The composer (scripts/compose-full-mocks.mjs) draws Tests 1 to 4 from the question pool. This layer
// sits on top of that draw and is the source of truth for everything a person wrote by hand:
//
//   scripts/mock-content/FULL_n.<section>.*.json   explanations to the house standard, keyed by item id:
//       w  the answer and the reason, in plain words (no choice letters, the choices get reordered)
//       s  3 to 5 short steps
//       t  one trap line per choice, in the order the choices are printed; null at the key
//       c  [question, answer] for "Check yourself"
//       o  optional: the five choices rewritten, same order (used to fix answer-length tells)
//   scripts/mock-content/replacements.json         original items that replace a pool item in place
//   scripts/mock-content/retag.json                id -> stop, for items filed under the wrong topic
//   scripts/mock-content/topics.json               stop -> plain DAT topic name (the course nickname is kept as `nick`)
//
// Applying is idempotent. After a fresh compose, run this again (npm run compose:mocks does).

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'tools/mock/data/full-mocks.js');
const DIR = path.join(ROOT, 'scripts/mock-content');
const CHECK = process.argv.includes('--check');
const readJSON = (f) => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
const exists = (f) => fs.existsSync(path.join(DIR, f));

export function load() {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(OUT, 'utf8'), ctx);
  return JSON.parse(JSON.stringify(ctx.window.ACE_FULL_MOCKS));
}

export function apply(data) {
  const problems = [];
  const topics = exists('topics.json') ? readJSON('topics.json') : {};
  const retag = exists('retag.json') ? readJSON('retag.json') : {};
  const repl = exists('replacements.json') ? readJSON('replacements.json') : {};
  const layer = {};
  for (const f of fs.readdirSync(DIR).filter((x) => /^FULL_\d+\.[a-z]+\..*\.json$/.test(x)).sort()) {
    const [mock, sec] = f.split('.');
    for (const [id, v] of Object.entries(readJSON(f))) {
      if (layer[id]) problems.push(`${f}: ${id} already has an entry in ${layer[id].file}`);
      layer[id] = Object.assign({ file: f, mock, sec }, v);
    }
  }
  const used = new Set();
  // A stop's lesson nights, read from the items already filed under it.
  const stopNights = {}, stopTopic = {};
  for (const mk of data.mocks) for (const list of Object.values(mk.sections)) for (const it of list) if (it.src !== 'v3' && !retag[it.id] && !stopTopic[it.stop]) stopTopic[it.stop] = it.topic;
  for (const mk of data.mocks) for (const list of Object.values(mk.sections)) for (const it of list) if (!retag[it.id] && it.nights && it.nights.length && !stopNights[it.stop]) stopNights[it.stop] = it.nights;
  for (const mk of data.mocks) {
    for (const [sec, list] of Object.entries(mk.sections)) {
      // 1. replacements, in place
      const swaps = (repl[mk.id] || {})[sec] || {};
      list.forEach((it, i) => {
        const nu = swaps[it.id] || Object.values(swaps).find((x) => x.id === it.id);
        if (!nu) return;
        const sub = it.sub;
        list[i] = { id: nu.id, sub, stop: nu.stop, topic: nu.stop, nights: [], d: nu.d || 2, q: nu.q, opts: nu.opts, correct: nu.correct,
          why: nu.w, traps: nu.t, qs: nu.qs || null, os: !!nu.os, src: 'v3', steps: nu.s, check: nu.c ? { q: nu.c[0], a: nu.c[1] } : undefined };
        if (nu.fmt) list[i].fmt = nu.fmt;
        if (nu.t && nu.t[nu.correct] != null) problems.push(`${nu.id}: trap text on the keyed choice`);
        if (nu.t && nu.t.length !== nu.opts.length) problems.push(`${nu.id}: ${nu.t.length} trap lines for ${nu.opts.length} choices`);
      });
      for (const it of list) {
        // 2. explanation layer
        const v = layer[it.id];
        if (v) {
          used.add(it.id);
          if (v.mock !== mk.id || v.sec !== sec) problems.push(`${v.file}: ${it.id} is in ${mk.id} ${sec}`);
          if (v.o) { if (v.o.length !== it.opts.length) problems.push(`${it.id}: rewritten choices do not match in number`); else it.opts = v.o; }
          if (v.q) it.q = v.q;
          if (v.w) it.why = v.w;
          if (v.s) it.steps = v.s;
          if (v.t) {
            if (v.t.length !== it.opts.length) problems.push(`${it.id}: ${v.t.length} trap lines for ${it.opts.length} choices`);
            else if (v.t[it.correct] != null) problems.push(`${it.id}: trap text on the keyed choice (choice order changed?)`);
            else if (v.t.some((t, i) => i !== it.correct && !t)) problems.push(`${it.id}: a wrong choice has no trap line`);
            else it.traps = v.t;
          }
          if (v.c) it.check = { q: v.c[0], a: v.c[1] };
        }
        // 3. topic: the right stop, a plain name, the course nickname kept as a second label
        if (retag[it.id]) it.stop = retag[it.id];
        if (retag[it.id] || it.src === 'v3') it.nights = stopNights[it.stop] || [];
        const tp = topics[it.stop];
        if (tp) { it.topic = tp.name; if (tp.nick) it.nick = tp.nick; else delete it.nick; }
        else if (it.src === 'v3' && stopTopic[it.stop]) it.topic = stopTopic[it.stop];   // a stop that already has a plain name (biology)
        else if (it.src === 'v3') problems.push(`${it.id}: stop ${it.stop} has no entry in topics.json`);
      }
    }
  }
  for (const id of Object.keys(layer)) if (!used.has(id)) problems.push(`${layer[id].file}: ${id} is not in ${layer[id].mock} ${layer[id].sec}`);
  return { data, problems };
}

export const serialize = (data) => '/* GENERATED by scripts/compose-full-mocks.mjs, then scripts/apply-mock-content.mjs. Do not edit by hand: edit scripts/mock-content/. */\nwindow.ACE_FULL_MOCKS = ' + JSON.stringify(data) + ';\n';

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const before = load();
  const { data, problems } = apply(JSON.parse(JSON.stringify(before)));
  problems.forEach((p) => console.log('  ERROR ' + p));
  if (problems.length) { console.log(`FAIL: ${problems.length} problem(s) in scripts/mock-content`); process.exit(1); }
  const same = JSON.stringify(before) === JSON.stringify(data);
  if (CHECK) {
    console.log(same ? 'PASS: full-mocks.js is up to date with scripts/mock-content' : 'FAIL: full-mocks.js is stale; run node scripts/apply-mock-content.mjs');
    process.exit(same ? 0 : 1);
  }
  if (!same) fs.writeFileSync(OUT, serialize(data));
  console.log(same ? 'no change' : 'wrote tools/mock/data/full-mocks.js');
}
