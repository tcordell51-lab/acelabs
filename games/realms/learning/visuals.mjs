export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const svg=(body,w=500,h=230,label='Instructional figure')=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}" style="font-family:system-ui,sans-serif">${body}</svg>`;
const text=(x,y,s,size=12,anchor='middle',fill='#294638')=>`<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" fill="${fill}">${esc(s)}</text>`;
function dots(x,y,n,color){let out='';for(let i=0;i<n;i++)out+=`<circle cx="${x+(i%5)*24}" cy="${y+Math.floor(i/5)*25}" r="5" fill="${color}"/>`;return out;}
export function membraneFigure({left=300,right=100,unit,solutePermeable=false,waterPermeable=true}={},result){
  const arrow=result==='left'?'<path d="M290 175h-80l14-10m-14 10 14 10" stroke="#3d7962" stroke-width="3" fill="none"/>':result==='right'?'<path d="M210 175h80l-14-10m14 10-14 10" stroke="#3d7962" stroke-width="3" fill="none"/>':'';
  // A membrane schematic can represent molarity, osmolarity, or arbitrary units.
  // Never infer a physical unit merely from the magnitude of the values.
  const units=typeof unit==='string'&&unit.trim()?unit.trim():'(stated units)';
  const max=Math.max(0,Number(left)||0,Number(right)||0);
  const count=value=>max===0||Number(value)<=0?0:Math.max(1,Math.round(Number(value)/max*15));
  return svg(`<rect x="45" y="35" width="410" height="160" rx="22" fill="#e3f0df" stroke="#9db99c" stroke-width="2"/><path d="M250 36v158" stroke="#92af7c" stroke-width="12" stroke-dasharray="9 4"/>${dots(94,75,count(left),'#679873')}${dots(309,75,count(right),'#679873')}${text(142,23,`Left: ${left} ${units}`)}${text(357,23,`Right: ${right} ${units}`)}${text(250,216,`Water: ${waterPermeable?'can cross':'cannot cross'} | Solute: ${solutePermeable?'can cross':'cannot cross'}`,11)}${arrow}`,500,235,`Membrane separates left ${left} and right ${right} ${units}. Use the concentration units stated in the accompanying text. Water ${waterPermeable?'can':'cannot'} cross; solute ${solutePermeable?'can':'cannot'} cross. Relative particle densities are schematic, not counted data.`);
}
export function holesFigure({holes=[],size=4}={}){let out='<rect width="160" height="160" rx="7" fill="#fffef8"/>';for(let i=0;i<=size;i++){const p=12+i*136/size;out+=`<path d="M${p} 12v136 M12 ${p}h136" stroke="#b4c1b0" stroke-width="1"/>`;}holes.forEach(([x,y])=>out+=`<circle cx="${12+(x+.5)*136/size}" cy="${12+(y+.5)*136/size}" r="8" fill="#2c4b66"/>`);return svg(out,160,160,`Hole pattern at ${holes.map(([x,y])=>`row ${y+1}, column ${x+1}`).join('; ')}.`);}
function foldFigure(f,reveal){
  const n=f.size||4,[px,py]=f.punch,vertical=f.axis==='vertical'||f.axis==='both',horizontal=f.axis==='horizontal'||f.axis==='both';
  const states=[{v:false,h:false,label:'1. Start flat'}];
  if(vertical)states.push({v:true,h:false,label:'2. Fold right'});
  if(horizontal)states.push({v:vertical,h:true,label:`${states.length+1}. Fold up`});
  states.push({v:vertical,h:horizontal,punch:true,label:`${states.length+1}. Punch`});
  const width=states.length*156+20,sheet=112,top=37;
  let out='';
  states.forEach((state,i)=>{
    const x=22+i*156,left=x+(state.v?sheet/2:0),w=state.v?sheet/2:sheet,h=state.h?sheet/2:sheet;
    // Dashed footprint is the original square; the solid outlined region is
    // the paper that is actually present after the indicated fold.
    out+=`<rect x="${x}" y="${top}" width="${sheet}" height="${sheet}" fill="#edf0ed" stroke="#a8b6b9" stroke-dasharray="4 4"/>`;
    out+=`<rect x="${left}" y="${top}" width="${w}" height="${h}" fill="#fffef7" stroke="#52728b" stroke-width="2"/>`;
    for(let j=1;j<n;j++){
      const gx=x+j*sheet/n,gy=top+j*sheet/n;
      if(gx>left&&gx<left+w)out+=`<path d="M${gx} ${top}v${h}" stroke="#ccd5dc"/>`;
      if(gy<top+h)out+=`<path d="M${left} ${gy}h${w}" stroke="#ccd5dc"/>`;
    }
    if(state.punch)out+=`<circle cx="${x+(px+.5)*sheet/n}" cy="${top+(py+.5)*sheet/n}" r="6.5" fill="#294a72"/>`;
    out+=text(x+sheet/2,177,state.label,12);
  });
  const instruction=vertical&&horizontal?'Left half folds right, then bottom half folds up.':vertical?'Left half folds onto the right half.':'Bottom half folds onto the top half.';
  out+=text(width/2,205,instruction,11)+text(width/2,223,'Dashed square: original footprint. Solid outline: folded paper.',10);
  const label='Paper fold sequence. '+instruction+` Punch at original row ${py+1}, column ${px+1}.`;
  if(reveal){
    let holes=[[px,py]];
    if(horizontal)holes=[...holes,...holes.map(([x,y])=>[x,n-1-y])];
    if(vertical)holes=[...holes,...holes.map(([x,y])=>[n-1-x,y])];
    return svg(out,width,240,label)+`<div class="unfold-result"><p class="subtle">Unfold in reverse order. Reflect each hole across each crease.</p>${holesFigure({holes,size:n})}</div>`;
  }
  return svg(out,width,240,label+' The final unfolded pattern is not shown.');
}
function energy(f){const values=[f.start,f.peak,f.end,f.catalystPeak??f.peak],min=Math.min(0,...values),max=Math.max(...values)+20,y=v=>180-(v-min)/(max-min)*140;const p=`M65 ${y(f.start)} C130 ${y(f.start)} 145 ${y(f.peak)} 245 ${y(f.peak)} S345 ${y(f.end)} 420 ${y(f.end)}`;return svg(`<path d="M45 20v175h410" stroke="#61796a" fill="none" stroke-width="2"/><path d="${p}" stroke="#b87c53" fill="none" stroke-width="4"/>${f.catalystPeak!=null?`<path d="M65 ${y(f.start)} C150 ${y(f.start)} 145 ${y(f.catalystPeak)} 245 ${y(f.catalystPeak)} S345 ${y(f.end)} 420 ${y(f.end)}" stroke="#527d62" fill="none" stroke-width="3" stroke-dasharray="8 5"/>`:''}${text(95,y(f.start)-10,`${f.start} kJ/mol`,11)}${text(245,y(f.peak)-10,`${f.peak} kJ/mol`,11)}${text(395,y(f.end)-10,`${f.end} kJ/mol`,11)}${f.catalystPeak!=null?text(265,y(f.catalystPeak)+18,`Alternative peak: ${f.catalystPeak}`,10):''}${text(250,223,'Reaction progress',11)}${text(90,18,'Potential energy',10)}`,500,238,'Potential energy profile. '+`Reactants ${f.start}, maximum ${f.peak}, products ${f.end} kilojoules per mole.`+(f.catalystPeak!=null?` Alternative pathway maximum ${f.catalystPeak}.`:''));}
function molecule(f){
  // The current SN2 metadata supplies neither a full connection table nor
  // stereochemical bonds. Omit an invented three-bonded carbon diagram.
  if(f.kind!=='carbonyl')return '';
  // Both authored carbonyl cases concern neutral aldehydes. R denotes the
  // substituent stated in the prompt; no electron-flow answer is drawn.
  return svg(`<rect x="25" y="18" width="450" height="164" rx="20" fill="#eee6f5"/>
    <g stroke="#4f4260" stroke-width="3" fill="none"><path d="M245 55v35 M255 55v35 M235 116l-74 32 M265 116l74 32"/></g>
    ${text(250,45,'O',25,'middle','#4f4260')}${text(250,118,'C',25,'middle','#4f4260')}${text(146,160,'R',25,'middle','#4f4260')}${text(354,160,'H',25,'middle','#4f4260')}
    ${text(250,205,'Neutral aldehyde group: R-C(=O)-H',12)}
    ${text(250,225,'R is the remaining substituent; for propanal, R = CH3CH2.',10)}`,500,242,'A neutral aldehyde: carbon has a double bond to oxygen and single bonds to R and hydrogen. R represents the remaining substituent; for propanal, it is CH3CH2. No reaction arrows or partial-charge hints are shown.');
}
function rates(f){return svg(`<rect x="80" y="45" width="90" height="125" rx="12" fill="#b9dfd3" stroke="#6e9d8e"/><rect x="330" y="45" width="90" height="125" rx="12" fill="#b9dfd3" stroke="#6e9d8e"/><path d="M170 80h65v70h30V80h65" fill="none" stroke="#8c9978" stroke-width="15"/>${text(125,104,'A',28)}${text(375,104,'B',28)}${text(125,195,`${f.a} ${f.unit||'hours alone'}`,12)}${text(375,195,`${f.b} ${f.unit||'hours alone'}`,12)}${text(250,25,'Two systems and their stated completion times',11)}`,500,220,'Two labeled systems. A '+f.a+' '+(f.unit||'hours')+', B '+f.b+' '+(f.unit||'hours')+'.');}
function chart(f){const max=Math.max(1,...f.values);return svg(`<path d="M60 20v170h390" stroke="#78917b" fill="none"/>${f.values.map((v,i)=>{const x=90+i*340/f.values.length,h=v/max*135;return `<rect x="${x}" y="${185-h}" width="${Math.min(50,250/f.values.length)}" height="${h}" rx="4" fill="#80a77a"/>${text(x+20,175-h,v,11)}${text(x+20,210,f.labels[i],11)}`;}).join('')}`,500,230,'Bar chart: '+f.labels.map((l,i)=>`${l}: ${f.values[i]}`).join(', '));}
export function renderFigure(f,{reveal=false}={}){if(!f)return '';switch(f.type){case'membrane':return membraneFigure(f);case'fold':return foldFigure(f,reveal);case'holes':return holesFigure(f);case'energy':return energy(f);case'molecule':return molecule(f);case'rates':return rates(f);case'chart':return chart(f);default:return '';}}
