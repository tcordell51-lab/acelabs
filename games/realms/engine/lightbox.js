/* Lightbox: slides and figures open over the game instead of as a new page.
 * On a phone, opening a raw image in its own tab (especially from a home-screen
 * app) leaves no way back. Every tap on an image link anywhere in the game is
 * caught here and shown in a modal viewer with a large Close button; tapping the
 * backdrop, Escape, or the phone's back gesture also closes it.
 * Zoom: pinch, mouse wheel or trackpad, the + and - buttons or keys, double-tap or
 * double-click (toggles 2.5x at that point). Pan: drag with one finger or the mouse
 * while zoomed. 0 or Fit resets. Arrow keys and swipes (at fit size) move through
 * the other slides in the same panel.
 * open(items, start, {onChange(index), onClose(index)}) lets a caller follow the viewer's position.
 */
(function(root){
  'use strict';
  const IMG=/\.(jpe?g|png|webp|gif|svg|avif)(\?.*)?$/i,MAX=6,MIN=1;
  let dlg=null,list=[],idx=0,pushed=false,onChange=null,onCloseCb=null,popping=0;
  // View state: scale s and translation (tx, ty) of the image from the stage center.
  let s=1,tx=0,ty=0;const pts=new Map();let pinch=null,drag=null,swipe=null,lastTap=0,moved=false;
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  function stage(){return dlg.querySelector('.lb-scroll');}
  function img(){return dlg.querySelector('.lb-scroll img');}
  function bounds(){const st=stage(),im=img();const W=st.clientWidth,H=st.clientHeight,w=im.offsetWidth||W,h=im.offsetHeight||H;return {W,H,w,h};}
  function apply(){const b=bounds();const mx=Math.max(0,(b.w*s-b.W)/2),my=Math.max(0,(b.h*s-b.H)/2);tx=clamp(tx,-mx,mx);ty=clamp(ty,-my,my);
    const im=img();im.style.transform=`translate(${tx}px,${ty}px) scale(${s})`;dlg.classList.toggle('zoomed',s>1.01);
    const z=dlg.querySelector('.lb-level');if(z)z.textContent=Math.round(s*100)+'%';}
  // Zoom to scale ns keeping the screen point (px, py) fixed. Points are viewport coordinates.
  function zoomAt(ns,px,py){ns=clamp(ns,MIN,MAX);const r=stage().getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
    if(px==null){px=cx;py=cy;}const ux=(px-cx-tx)/s,uy=(py-cy-ty)/s;s=ns;tx=px-cx-s*ux;ty=py-cy-s*uy;if(s<=1.001){s=1;tx=0;ty=0;}apply();}
  function reset(){s=1;tx=0;ty=0;if(dlg)apply();}
  function build(){
    dlg=document.createElement('dialog');dlg.className='lb';dlg.setAttribute('aria-label','Image viewer');
    dlg.innerHTML=`<div class="lb-bar"><span class="lb-cap"></span><span class="lb-count"></span><span class="lb-tools"><button type="button" class="lb-out" aria-label="Zoom out">-</button><span class="lb-level" aria-live="polite">100%</span><button type="button" class="lb-in" aria-label="Zoom in">+</button><button type="button" class="lb-fit" aria-label="Fit the whole image">Fit</button></span><button type="button" class="lb-close" aria-label="Close the slide">Close</button></div><div class="lb-stage"><button type="button" class="lb-prev" aria-label="Previous slide">Prev</button><div class="lb-scroll"><img alt="" draggable="false"></div><button type="button" class="lb-next" aria-label="Next slide">Next</button></div><p class="lb-hint">Pinch, scroll or use + and - to zoom. Drag to pan. Double-tap to zoom in or out.</p>`;
    document.body.appendChild(dlg);
    dlg.addEventListener('cancel',e=>{e.preventDefault();close();});
    dlg.addEventListener('click',e=>{if(e.target.closest('.lb-close'))return close();if(e.target.closest('.lb-in'))return zoomAt(s*1.5);if(e.target.closest('.lb-out'))return zoomAt(s/1.5);if(e.target.closest('.lb-fit'))return reset();
      if(e.target.closest('.lb-prev'))return go(-1);if(e.target.closest('.lb-next'))return go(1);
      if(moved){moved=false;return;}
      if(s<=1.01&&(e.target===dlg||e.target.classList.contains('lb-stage')||e.target.classList.contains('lb-scroll')))close();});
    dlg.addEventListener('keydown',e=>{if(e.key==='ArrowRight'&&s<=1.01){e.preventDefault();go(1);}else if(e.key==='ArrowLeft'&&s<=1.01){e.preventDefault();go(-1);}
      else if(e.key==='+'||e.key==='='){e.preventDefault();zoomAt(s*1.5);}else if(e.key==='-'||e.key==='_'){e.preventDefault();zoomAt(s/1.5);}else if(e.key==='0'){e.preventDefault();reset();}
      else if(s>1.01&&/^Arrow/.test(e.key)){e.preventDefault();const d=60;if(e.key==='ArrowLeft')tx+=d;if(e.key==='ArrowRight')tx-=d;if(e.key==='ArrowUp')ty+=d;if(e.key==='ArrowDown')ty-=d;apply();}});
    const sc=dlg.querySelector('.lb-scroll');
    sc.addEventListener('wheel',e=>{e.preventDefault();const k=e.ctrlKey?.012:.0022;zoomAt(s*Math.exp(-e.deltaY*k),e.clientX,e.clientY);},{passive:false});
    sc.addEventListener('dblclick',e=>{e.preventDefault();if(s>1.01)reset();else zoomAt(2.5,e.clientX,e.clientY);});
    sc.addEventListener('pointerdown',e=>{if(e.button>0)return;try{sc.setPointerCapture(e.pointerId);}catch(_){}pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pts.size===2){const [a,b]=[...pts.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y)||1,s0:s,mx:(a.x+b.x)/2,my:(a.y+b.y)/2,tx0:tx,ty0:ty};drag=null;swipe=null;}
      else if(pts.size===1){drag={x:e.clientX,y:e.clientY,tx0:tx,ty0:ty};swipe=s<=1.01?{x:e.clientX,y:e.clientY,t:Date.now()}:null;moved=false;}});
    sc.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pinch&&pts.size>=2){const [a,b]=[...pts.values()];const d=Math.hypot(a.x-b.x,a.y-b.y)||1,mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
        // Scale about the starting midpoint, then follow the midpoint as it moves.
        s=pinch.s0;tx=pinch.tx0;ty=pinch.ty0;zoomAt(pinch.s0*d/pinch.d,pinch.mx,pinch.my);tx+=mx-pinch.mx;ty+=my-pinch.my;apply();moved=true;return;}
      if(drag&&s>1.01){tx=drag.tx0+(e.clientX-drag.x);ty=drag.ty0+(e.clientY-drag.y);if(Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y)>4)moved=true;apply();}});
    const up=e=>{if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);
      if(pinch&&pts.size<2){pinch=null;if(pts.size===1){const p=[...pts.values()][0];drag={x:p.x,y:p.y,tx0:tx,ty0:ty};}return;}
      if(swipe&&pts.size===0&&e.type==='pointerup'){const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;const sw=swipe;swipe=null;
        if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5){moved=true;go(dx<0?1:-1);return;}
        if(dy>110&&Math.abs(dy)>Math.abs(dx)*1.5&&e.pointerType==='touch'){moved=true;close();return;}
        // Double-tap on touch: toggle zoom at that point.
        if(e.pointerType==='touch'&&Math.abs(dx)<10&&Math.abs(dy)<10&&Date.now()-sw.t<300){const t=Date.now();if(t-lastTap<320){lastTap=0;moved=true;if(s>1.01)reset();else zoomAt(2.5,e.clientX,e.clientY);}else lastTap=t;}}
      if(pts.size===0)drag=null;};
    sc.addEventListener('pointerup',up);sc.addEventListener('pointercancel',up);
    img().addEventListener('load',()=>apply());
    root.addEventListener('resize',()=>{if(dlg&&dlg.open)apply();});
    root.addEventListener('popstate',()=>{if(popping){popping=0;return;}if(dlg.open){pushed=false;close(true);}});
  }
  function show(){const it=list[idx];const im=img();reset();im.src=it.src;im.alt=it.alt||'Image';dlg.querySelector('.lb-cap').textContent=it.cap||'';
    dlg.querySelector('.lb-count').textContent=list.length>1?`${idx+1} / ${list.length}`:'';dlg.querySelector('.lb-prev').hidden=list.length<2;dlg.querySelector('.lb-next').hidden=list.length<2;}
  function go(d){if(list.length<2)return;idx=(idx+d+list.length)%list.length;show();if(onChange){try{onChange(idx);}catch(e){}}}
  function open(items,start,o){if(!dlg)build();list=items;onChange=o&&typeof o.onChange==='function'?o.onChange:null;onCloseCb=o&&typeof o.onClose==='function'?o.onClose:null;idx=Math.max(0,Math.min(items.length-1,start||0));show();if(!dlg.open)dlg.showModal();
    if(!pushed){try{history.pushState({atlasLightbox:1},'');pushed=true;}catch(e){}}dlg.querySelector('.lb-close').focus();}
  function close(fromPop){if(!dlg||!dlg.open)return;dlg.close();reset();pts.clear();pinch=null;drag=null;onChange=null;const cb=onCloseCb;onCloseCb=null;if(cb)try{cb(idx);}catch(e){}
    // 10/22: closing the viewer (Close, Escape, backdrop) gives back its own history entry. That popstate is ours:
    // until it arrives isOpen() stays true, so nav-history.js does not also close the panel underneath.
    if(pushed&&!fromPop){pushed=false;popping=Date.now();try{history.back();}catch(e){popping=0;}}}
  function itemFrom(el){const a=el.closest('a'),img=el.tagName==='IMG'?el:a?.querySelector('img');const src=(a&&IMG.test(a.getAttribute('href')||''))?a.href:(img?.dataset.full||img?.currentSrc||img?.src);
    const cap=el.closest('figure')?.querySelector('figcaption')?.textContent||a?.querySelector('i')?.textContent||img?.alt||'';return src?{src,alt:img?.alt||'',cap:cap.trim().slice(0,160)}:null;}
  // Catch taps on image links and zoomable images anywhere, before they navigate.
  document.addEventListener('click',e=>{
    if(e.defaultPrevented||e.button>0||e.metaKey||e.ctrlKey||e.shiftKey)return;
    if(dlg&&dlg.contains(e.target))return;
    const a=e.target.closest('a[href]');const zoom=e.target.closest('img[data-zoom],[data-lightbox] img');
    const isImgLink=a&&IMG.test(a.getAttribute('href')||'');
    if(!isImgLink&&!zoom)return;
    const el=zoom||a;const scope=el.closest('[data-lightbox-group],.study-original,.study-extracted-figures,.relearn-figs,.slide-proof,.gx-fig,dialog,section,article')||document;
    const peers=[...scope.querySelectorAll('a[href],img[data-zoom]')].filter(x=>x.tagName==='IMG'?true:IMG.test(x.getAttribute('href')||''));
    const items=[],seen=new Set();let start=0;
    for(const p of peers){const it=itemFrom(p.tagName==='IMG'?p:(p.querySelector('img')||p));if(!it||seen.has(it.src))continue;seen.add(it.src);if(p===el||p.contains(e.target))start=items.length;items.push(it);}
    if(!items.length){const it=itemFrom(e.target);if(!it)return;items.push(it);}
    e.preventDefault();e.stopPropagation();open(items,start);
  },true);
  root.AtlasLightbox={open,close,isOpen:()=>!!(dlg&&dlg.open)||(popping>0&&Date.now()-popping<1500),_state:()=>({s,tx,ty,idx,n:list.length}),_zoomAt:(ns,x,y)=>{if(dlg)zoomAt(ns,x,y);}};
})(typeof window!=='undefined'?window:globalThis);
