/* One rule for the order of multiple-choice options, shared by every renderer.
   Many banks store the key as option A, so every renderer shows the options in a
   per-attempt shuffled order and remaps the answer index through a permutation.
   perm[displayIndex] = originalIndex. Grading and records always use the
   ORIGINAL index; only the letters on screen come from the permutation.

   Kept in place (never shuffled):
   - True or false items (kind 'tf', or two options that read True/False).
   - Items whose options are all bare labels ("Panel A" to "Panel E", "A" to "E").
   - Numbered-combination items ("1 and 2", "1, 2 and 3", "I and III").
   - Single options that point at other options by position: "All of the above",
     "None of these", "Both A and B", "A and C only". They keep their own slot
     and the rest shuffle around them. */
(function(root){
  'use strict';
  const TF=/^\s*(true|false)\s*\.?\s*$/i;
  const LABEL=/^\s*(?:panel|pattern|figure|fig\.?|image|label|structure|specimen|slide|letter|section)?\s*\(?[A-H]\)?\s*\.?\s*$/i;
  const COMBO_START=/^\s*(?:only\s+)?(?:[1-9]|I{1,3}|IV|V|VI{0,3})\b(?![,.]?\d)(?!-)/;
  const COMBO_JOIN=/^\s*(?:only\s+)?(?:[1-9]|I{1,3}|IV|V|VI{0,3})\s*(?:,|and|&|or|plus)\s*(?:[1-9]|I{1,3}|IV|V|VI{0,3})\b/;
  const PIN=[
    /^\s*(?:all|none|any|neither|both)\s+of\s+(?:the\s+)?(?:above|below|these|the\s+options|the\s+choices|the\s+answers|the\s+statements\s+above)\b/i,
    /^\s*(?:all|none)\s+(?:are|is)\s+(?:correct|true|false)\b/i,
    /^\s*(?:both|neither)\s+\(?[A-E]\)?\s+(?:and|nor|or|&)\s+\(?[A-E]\)?\s*(?:are\s+(?:correct|true))?\s*\.?\s*$/i,
    /^\s*\(?[A-E]\)?\s*(?:,\s*\(?[A-E]\)?\s*)*(?:and|&|or)\s+\(?[A-E]\)?\s*(?:only|are\s+(?:correct|true)|but\s+not\s+\(?[A-E]\)?)?\s*\.?\s*$/i,
    /^\s*(?:only\s+)?\(?[A-E]\)?\s+only\s*\.?\s*$/i
  ];
  function opts(it){return it&&Array.isArray(it.options)?it.options:it&&Array.isArray(it.opts)?it.opts:it&&Array.isArray(it.choices)?it.choices:[];}
  function text(o){return o&&typeof o==='object'?String(o.text!=null?o.text:o.label!=null?o.label:''):String(o==null?'':o);}
  function isTF(it){const o=opts(it);if(it&&it.kind==='tf')return true;return o.length===2&&o.every(x=>TF.test(text(x)));}
  function isCombo(o){const t=o.map(text);return t.length>=3&&t.every(x=>COMBO_START.test(x))&&t.filter(x=>COMBO_JOIN.test(x)).length>=2;}
  function isLabels(o){const t=o.map(text);return t.length>=2&&t.every(x=>LABEL.test(x));}
  function fixedItem(it){const o=opts(it);return o.length<2||isTF(it)||!!(it&&it.fixedOrder)||isLabels(o)||isCombo(o);}
  function pinnedAt(it){const o=opts(it),out=[];o.forEach((x,i)=>{const t=text(x);if(PIN.some(r=>r.test(t)))out.push(i);});return out;}
  function hash(str){let h=2166136261;str=String(str);for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
  // Seeded generator for renderers that must redraw the same order (a saved run, a re-render).
  function rng(seed){let a=hash(seed)||1;return function(){a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
  function perm(it,rand){
    const o=opts(it),n=o.length,id=o.map((_,i)=>i);rand=typeof rand==='function'?rand:Math.random;
    if(fixedItem(it))return id;
    const pin=new Set(pinnedAt(it)),free=id.filter(i=>!pin.has(i)),sh=free.slice();
    for(let i=sh.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));const t=sh[i];sh[i]=sh[j];sh[j]=t;}
    const out=id.slice();free.forEach((pos,k)=>{out[pos]=sh[k];});return out;
  }
  // A permutation is valid for an item when it is a true reordering of its options.
  function valid(p,it){const n=opts(it).length;if(!Array.isArray(p)||p.length!==n)return false;const s=new Set(p);return s.size===n&&p.every(i=>Number.isInteger(i)&&i>=0&&i<n);}
  // Puzzle rows ({label, opts:[text...], key:text}) grade by text, so only the order
  // of opts changes. Rows that all share one option set (a sort into categories)
  // get one shuffled order for the whole round, so the buttons stay put row to row.
  function mixRows(rows,rand){
    if(!Array.isArray(rows))return rows;
    const ok=r=>r&&Array.isArray(r.opts)&&!r.fixedOrder,sig=r=>JSON.stringify(r.opts.map(text).slice().sort()),count=new Map(),order=new Map();
    for(const r of rows)if(ok(r))count.set(sig(r),(count.get(sig(r))||0)+1);
    return rows.map(r=>{if(!ok(r))return r;const k=sig(r);
      if(count.get(k)>1){if(!order.has(k)){const p=perm({options:r.opts},rand);order.set(k,p.map(i=>text(r.opts[i])));}
        const byText=new Map(r.opts.map(o=>[text(o),o]));return {...r,opts:order.get(k).map(t=>byText.get(t))};}
      const p=perm({options:r.opts},rand);return {...r,opts:p.map(i=>r.opts[i])};});
  }
  const LETTERS='ABCDEFGH';
  function letterOf(p,orig){const i=p.indexOf(orig);return i<0?'':LETTERS[i];}
  const api=Object.freeze({isTF,fixedItem,pinnedAt,perm,mixRows,rng,hash,valid,letterOf,LETTERS});
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.AtlasOptionOrder=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:null);
