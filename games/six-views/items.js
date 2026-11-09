/* Six Views uses the audited PAT engines, never private copies of their geometry. */
(function(root){
  'use strict';
  const PAT = root.PAT || require('../../tools/pat/engine/pat-core.js');
  if (typeof module === 'object' && module.exports) {
    require('../../tools/pat/engine/pat-tfe.js');
    require('../../tools/pat/engine/pat-cubes.js');
  }
  const trapText = {
    mirror: 'Front and back, or left and right, have been swapped.',
    'dash-as-solid': 'An edge hidden behind the object has been drawn solid.',
    'solid-as-dash': 'An edge visible from this direction has been drawn dashed.',
    profile: 'A step or edge is in the wrong place.'
  };
  function tfe(seed){
    const source = PAT.tfe.generate(seed);
    const [NX, NY, NZ] = source.figure.dims;
    const V = source.figure.V;
    const views = PAT.tfe.views((x,y,z)=>V[x][y][z], [NX,NY,NZ]);
    const options = source.options.map((o,i)=>({label:'ABCD'[i],segs:o.segs,ok:i===source.answer,tax:o.trap||'',why:trapText[o.trap]||'Compare matching widths, heights and depths, then check visible versus hidden edges.'}));
    return {key:'tfe:'+seed,subtest:'tfe',seed,tier:source.meta.hiddenLines>2?2:1,family:source.meta.feats.join(' + ')||'stepped solid',given:source.figure.given,missing:source.figure.missing,views,options,correct:source.answer,model:{V,NX,NY,NZ},source};
  }
  function cubes(seed){
    const source = PAT.cubes.generate(seed), cubes = source.figure.cubes;
    const set = Object.fromEntries(cubes.map(c=>[c.join(','),1]));
    const counts = cubes.map(c=>PAT.cubes.painted(set,c));
    const hist = {}; counts.forEach(n=>hist[n]=(hist[n]||0)+1);
    const n=source.meta.k, answer=source.options[source.answer].count;
    return {key:'cubes:'+seed,subtest:'cubes',seed,tier:cubes.length>18?2:1,family:'cube stacks',cubes,counts,hist,n,answer,highlight:cubes.filter((c,i)=>counts[i]===n),options:source.options.map((o,i)=>({label:'ABCDE'[i],value:o.count,ok:i===source.answer,why:'Count exposed faces on every cube, including the back, but not faces touching another cube or the table.'})),correct:source.answer,model:{cubes},source};
  }
  function viewDims(name,m){ return name==='top'?[m.NX,m.NY]:name==='front'?[m.NX,m.NZ]:[m.NY,m.NZ]; }
  const api={tfe,cubes,viewDims};root.SixViewsItems=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof self!=='undefined'?self:globalThis);
