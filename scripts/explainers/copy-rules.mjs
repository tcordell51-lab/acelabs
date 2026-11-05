// copy-rules.mjs: the explainer copy rules (explainer-standard.md 2.3), shared
// by build.mjs (every authored string) and render-check.mjs (every string as
// rendered, renderer-made text included).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// Competitor names: the repo's own list (scripts/check-no-competitor-names.mjs), so the two never drift.
export const NAME_TERMS = (() => {
  const src = fs.readFileSync(path.join(ROOT, 'scripts/check-no-competitor-names.mjs'), 'utf8');
  const i = src.indexOf('const TERMS = ['), j = src.indexOf('\n];', i);
  if (i < 0 || j < 0) throw new Error('TERMS list not found in scripts/check-no-competitor-names.mjs');
  return vm.runInNewContext('(' + src.slice(src.indexOf('[', i), j + 2) + ')').map((x) => ({ name: x.name, re: new RegExp(x.re.source, x.re.flags.replace('g', '')) }));
})();

export const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;
export const LETTER_CITE = /\b(?:[Oo]ption|[Cc]hoice|[Aa]nswer|[Ff]act|[Ll]ine|[Ll]etter)\s+[A-E]\b|\(\s*[A-E]\s*\)/;
export const BANNED = /\b(wrong|incorrect|failed)\b/i;
// "level up" is gate-copy's points rule (a level as a reward); explainer copy never uses it
export const TIMER_SCORE = /\btimer\b|seconds left|time left|\bstreak\b|\b\d+\s+points\b|\bXP\b|percent correct|% correct|\blevel(?:ed|s)? up\b/i;

// One authored string. max is a word budget (optional).
export function copyIssues(label, s, max) {
  const out = [];
  if (s == null) return out;
  if (!/^[\x20-\x7E]*$/.test(s)) out.push(label + ': non-ASCII character');
  if (/—|–|--/.test(s)) out.push(label + ': dash');
  if (BANNED.test(s)) out.push(label + ': banned word');
  if (LETTER_CITE.test(s)) out.push(label + ': cites a choice letter');
  NAME_TERMS.forEach((c) => { if (c.re.test(s)) out.push(label + ': competitor name ' + c.name); });
  if (/!/.test(s)) out.push(label + ': exclamation mark');
  if (TIMER_SCORE.test(s)) out.push(label + ': timer or score words');
  if (max && words(s) > max) out.push(label + ': ' + words(s) + ' words (budget ' + max + ')');
  return out;
}

// All explainer text as rendered (bank text already removed by the caller).
export function renderedTextIssues(txt) {
  const out = [];
  const t = String(txt).replace(/[\n\r\t ]/g, ' ');
  const odd = t.match(/[^\x20-\x7E]/g);
  if (odd) out.push('non-ASCII: ' + [...new Set(odd)].join(' '));
  if (/—|–|--/.test(t)) out.push('dash');
  const bw = t.match(/\b(wrong|incorrect|failed)\b/gi); if (bw) out.push('banned word: ' + [...new Set(bw)].join(', '));
  const lt = t.match(new RegExp(LETTER_CITE.source, 'g')); if (lt) out.push('letter cited: ' + lt.join(', '));
  if (TIMER_SCORE.test(t)) out.push('timer or score words');
  if (/!/.test(t)) out.push('exclamation mark');
  NAME_TERMS.forEach((c) => { if (c.re.test(t)) out.push('competitor name ' + c.name); });
  return out;
}
