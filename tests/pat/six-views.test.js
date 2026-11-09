"use strict";
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {loadEngine, checkItem, V} = require('./helpers.js');
const PAT = loadEngine();
const Items = require('../../games/six-views/items.js');
const seeds = Array.from({length:50}, (_,i)=>1000+37*i);
const html = fs.readFileSync(path.join(__dirname,'../../games/six-views/index.html'),'utf8');
function countConnected(model){
  const cells = new Set();
  for(let x=0;x<model.NX;x++)for(let y=0;y<model.NY;y++)for(let z=0;z<model.NZ;z++)if(model.V[x][y][z])cells.add([x,y,z].join(','));
  const seen = new Set(), queue = [[...cells][0]];
  while(queue.length){const k=queue.pop();if(seen.has(k)||!cells.has(k))continue;seen.add(k);const a=k.split(',').map(Number);for(const d of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]])queue.push(a.map((n,i)=>n+d[i]).join(','));}
  return {all:cells.size,connected:seen.size};
}
test('Six Views: 50 TFE seeds are single connected solids with independently verified answer keys',()=>{
  const seen = new Set();
  for(const seed of seeds){
    const i=Items.tfe(seed);seen.add(i.missing);
    assert.deepEqual(checkItem(PAT,i.source),[],`seed ${seed}`);
    const counts=countConnected(i.model);assert.equal(counts.connected,counts.all,`seed ${seed} disconnected`);
    assert.equal(i.options.length,4);assert.equal(i.options.filter(o=>o.ok).length,1);
    assert.equal(V.segKey(i.options[i.correct].segs),V.segKey(i.views[i.missing]));
    assert.equal(Object.keys(i.given).length,2);assert.ok(!Object.keys(i.given).includes(i.missing));
    for(const name of Object.keys(i.given))assert.equal(V.segKey(i.given[name]),V.segKey(i.views[name]));
    assert.equal(i.source.figure.missing,i.missing);
  }
  assert.deepEqual([...seen].sort(),['end','front','top']);
});
test('Six Views: 50 cube seeds have visible column tops and five unique, independently verified answers',()=>{
  for(const seed of seeds){
    const i=Items.cubes(seed);
    assert.deepEqual(checkItem(PAT,i.source),[],`seed ${seed}`);
    assert.equal(i.options.length,5);assert.equal(new Set(i.options.map(o=>o.value)).size,5);
    assert.equal(i.options.filter(o=>o.ok).length,1);
    const truth=V.cubePaintedCounts(i.cubes);
    assert.deepEqual(i.counts,truth);
    assert.equal(i.answer,truth.filter(n=>n===i.n).length);
    assert.equal(i.highlight.length,i.answer);
    assert.deepEqual(i.highlight,i.cubes.filter((_,j)=>truth[j]===i.n));
    assert.equal(Object.values(i.hist).reduce((a,b)=>a+b,0),i.cubes.length);
  }
});
test('Six Views: all three view dimensions match their viewing axes',()=>{
  const m={NX:4,NY:3,NZ:2};
  assert.deepEqual(Items.viewDims('front',m),[4,2]);
  assert.deepEqual(Items.viewDims('end',m),[3,2]);
  assert.deepEqual(Items.viewDims('top',m),[4,3]);
});
test('Six Views: same seeds reproduce identical explanations and answer positions',()=>{
  for(const kind of ['tfe','cubes'])for(const seed of [1000,1222,1962])assert.deepEqual(Items[kind](seed),Items[kind](seed));
});
test('Six Views: uses shared audited engines and preserves old progress rather than reinterpreting old seeds',()=>{
  assert.ok(html.includes('engine/pat-tfe.js'));assert.ok(html.includes('engine/pat-cubes.js'));
  assert.ok(html.includes("const KEY = 'atDAT_sixviews_v2'"));
  assert.ok(!html.includes('localStorage.removeItem'));assert.ok(!html.includes('localStorage.clear'));
  assert.ok(!html.includes('makeVoxelSolid'));assert.ok(!html.includes('paceOn'));
  assert.ok(html.includes("promptEl.classList.contains('locked')"));
  assert.ok(html.includes('if (idx >= round.length || revealEl.hidden) return;'));
  assert.ok(html.includes('exact orthographic answer'));assert.ok(html.includes('not a complete PAT test or score prediction'));
  assert.ok(!html.includes('guaranteed-correct'));
});
