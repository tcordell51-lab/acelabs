#!/usr/bin/env node
// export-taxonomy.mjs : snapshot the portal's canonical DAT subtopic taxonomy for Ace Labs.
//
//   node scripts/bank/export-taxonomy.mjs [--portal DIR] [--check]
//
// Source of truth: the AceTheDAT portal, src/scheduling/curriculum/subtopics.js (280 subtopics,
// each with a parent topic) and registry.js (the parent topics, with highYield). Ace Labs does not
// import the portal at run time; this script writes a frozen copy to scripts/bank/taxonomy.json
// (ids, names, parent topics, sections, categories and the high-yield flag, nothing else).
// shared/ace-skills.js carries the names it needs; the bank scripts read this file.
// --check: exit 1 when the snapshot differs from the portal (skipped when the portal is absent).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'scripts/bank/taxonomy.json');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const candidates = [arg('--portal', ''), process.env.ACE_PORTAL_DIR || '', path.join(os.homedir(), 'acedatportal'), path.join(os.homedir(), 'code/AceDatPortal'), '/home/claude/acedatportal'].filter(Boolean);
const portal = candidates.find((d) => fs.existsSync(path.join(d, 'src/scheduling/curriculum/subtopics.js')));

export async function build(dir) {
  const cur = path.join(dir, 'src/scheduling/curriculum');
  const S = await import(pathToFileURL(path.join(cur, 'subtopics.js')).href);
  const R = await import(pathToFileURL(path.join(cur, 'registry.js')).href);
  const topics = {};
  for (const v of Object.values(R)) if (Array.isArray(v)) for (const t of v) if (t && t.id && t.subject && !topics[t.id]) topics[t.id] = { name: t.name, subject: t.subject, highYield: !!t.highYield, order: t.order };
  const subtopics = {};
  for (const s of S.ALL_SUBTOPICS) subtopics[s.id] = { name: s.name, topicId: s.topicId, section: s.section, cat: s.cat };
  return { format: 1, source: 'AceDatPortal src/scheduling/curriculum (subtopics.js, registry.js)', topics, subtopics };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  if (!portal) { console.log('export-taxonomy: portal not found, snapshot left as is'); process.exit(0); }
  const body = JSON.stringify(await build(portal), null, 1) + '\n';
  if (process.argv.includes('--check')) {
    const same = fs.existsSync(OUT) && fs.readFileSync(OUT, 'utf8') === body;
    console.log(same ? 'export-taxonomy: snapshot matches the portal' : 'export-taxonomy: snapshot is stale (run node scripts/bank/export-taxonomy.mjs)');
    process.exit(same ? 0 : 1);
  }
  fs.writeFileSync(OUT, body);
  const t = JSON.parse(body);
  console.log(`export-taxonomy: ${Object.keys(t.subtopics).length} subtopics, ${Object.keys(t.topics).length} topics from ${portal}`);
}
