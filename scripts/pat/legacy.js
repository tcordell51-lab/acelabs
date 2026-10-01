/*
  legacy.js : loads the ORIGINAL Studio generators straight out of the
  tools/pat/*.html pages, verbatim, so the audit tests the code students
  actually run (not a re-typed copy). Each loader slices the generator
  functions out of the page source by name and evaluates them in a sandbox
  with the page-level globals (seed, LEVEL, GAP...) supplied as parameters.
*/
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PAT_DIR = path.join(__dirname, '..', '..', 'tools', 'pat');
const read = (f) => fs.readFileSync(path.join(PAT_DIR, f), 'utf8');

/* Return the full text of `function name(...) {...}` with balanced braces. */
function grabFn(src, name) {
  const re = new RegExp('function\\s+' + name + '\\s*\\(');
  const m = re.exec(src);
  if (!m) throw new Error('legacy: function ' + name + ' not found');
  let i = src.indexOf('{', m.index), depth = 0;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return src.slice(m.index, j + 1); }
  }
  throw new Error('legacy: unbalanced ' + name);
}
/* Return `var NAME = <expr>;` with balanced brackets/braces. */
function grabVar(src, name) {
  const re = new RegExp('var\\s+' + name + '\\s*=');
  const m = re.exec(src);
  if (!m) throw new Error('legacy: var ' + name + ' not found');
  let depth = 0;
  for (let j = m.index + m[0].length; j < src.length; j++) {
    const c = src[j];
    if (c === '{' || c === '[' || c === '(') depth++;
    else if (c === '}' || c === ']' || c === ')') depth--;
    else if (c === ';' && depth === 0) return src.slice(m.index, j + 1);
  }
  throw new Error('legacy: unterminated var ' + name);
}
function optFn(src, name) { try { return grabFn(src, name); } catch (e) { return ''; } }
function run(code) { return vm.runInNewContext(code, { Math, Object, Array, JSON, Set, Map, Uint8Array, Number, String, Infinity }); }

/* ---------------- angles.html ---------------- */
function anglesGen(seed, gap, trap) {
  const src = read('angles.html');
  const code = [grabFn(src, 'mulberry32'),
    'var seed=' + seed + ',GAP=' + gap + ',TRAP=' + (!!trap) + ',rng=mulberry32(seed);',
    grabFn(src, 'ri'), grabFn(src, 'gen'), 'gen();'].join('\n');
  return run(code);
}

/* ---------------- tfe.html ---------------- */
function tfeGen(seed, tier) {
  const src = read('tfe.html');
  const names = ['occ', 'newGrid', 'buildView', 'frontView', 'endView', 'topView', 'keyOf', 'ground', 'connected',
    'anyDash', 'carveTunnel', 'carveNotch', 'fallbackObj', 'makeObject', 'cloneV', 'mirrorY', 'makeDrill'];
  const code = [grabFn(src, 'mulberry32'),
    'var seed=' + seed + ',rng=mulberry32(seed);', grabFn(src, 'ri'),
    "var NX=3,NY=3,NZ=3,V=null,FEAT='';"]
    .concat(names.map((n) => grabFn(src, n)))
    .concat(['var item=makeDrill(' + tier + '); ({item:item, V:cloneV(), NX:NX, NY:NY, NZ:NZ});']).join('\n');
  return run(code);
}

/* ---------------- holepunch.html ---------------- */
function holepunchGen(seed, level) {
  const src = read('holepunch.html');
  const names = ['applyFold', 'flapW', 'legalFolds', 'unfoldPoints', 'gen', 'keySet', 'mirrorSet', 'inPaper', 'distractors'];
  const code = [grabFn(src, 'mulberry32'),
    'var seed=' + seed + ',LEVEL=' + level + ',rng=mulberry32(seed);', grabFn(src, 'ri')]
    .concat(names.map((n) => grabFn(src, n)))
    .concat(['var P=gen(); ({P:P, distractors:distractors(P), seed:seed});']).join('\n');
  return run(code);
}

/* ---------------- cubes.html ---------------- */
function cubesGen(seed, level) {
  const src = read('cubes.html');
  const code = [grabFn(src, 'mulberry32'),
    'var seed=' + seed + ',LEVEL=' + level + ',rng=mulberry32(seed);', grabFn(src, 'ri'),
    grabFn(src, 'lvCfg'), optFn(src, 'rayHitsBox'), optFn(src, 'topVis'), grabFn(src, 'gen'),
    'var P=gen(); ({cubes:P.cubes, counts:P.counts, hist:P.hist, total:P.total, question:P.question});'].join('\n');
  return run(code);
}

/* ---------------- patternfold.html ---------------- */
function patternfoldGen(seed, level) {
  const src = read('patternfold.html');
  const code = [grabFn(src, 'mulberry32'),
    'var seed=' + seed + ',LEVEL=' + level + ',rng=mulberry32(seed);', grabFn(src, 'ri'),
    grabVar(src, 'NETS'), grabFn(src, 'neg'), grabVar(src, 'STEPS'), grabFn(src, 'fold'), grabFn(src, 'faceName'),
    grabVar(src, 'PATTERNS'), grabFn(src, 'keysForLevel'), grabFn(src, 'gen'), grabFn(src, 'renderedFaces'),
    grabFn(src, 'serial'), grabFn(src, 'makeOpts'),
    'var P=gen(); ({net:P.net, pats:P.pats, opts:P.opts, netIdx:P.netIdx, frames:P.F.frames, PATTERNS:PATTERNS});'].join('\n');
  return run(code);
}

/* ---------------- keyholes.html (first <script> block is pure) ---------------- */
let keyholesCtx = null;
function keyholesGen(seed, difficulty) {
  if (!keyholesCtx) {
    const src = read('keyholes.html');
    const start = src.indexOf('<script>') + '<script>'.length;
    const end = src.indexOf('</script>', start);
    const core = src.slice(start, end);
    keyholesCtx = vm.createContext({ Math, Object, Array, JSON, Set, Map, Uint8Array, Number, String, Infinity });
    vm.runInContext(core + '\n;this.buildItem = buildItem; this.silhouette = silhouette;', keyholesCtx);
  }
  return keyholesCtx.buildItem(seed, difficulty);
}

module.exports = { anglesGen, tfeGen, holepunchGen, cubesGen, patternfoldGen, keyholesGen, grabFn, grabVar };
