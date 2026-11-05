// Optional staged consumer. Not imported by the current game or learning adapter.
// Exact generated projections provide the text; no parallel authored bank exists.
const fail=message=>{throw new Error(message);};
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const hex=bytes=>Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');
export async function createCanonConsumer(projectionText,manifest,{onExposure=()=>{}}={}){
  if(typeof projectionText!=='string'||manifest?.schema!=='ace-dat-canon-stage/1')fail('A pinned Canon projection and verified stage manifest are required.');
  const hash=hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(projectionText)));
  if(hash!==manifest.projectionSha256)fail('Canon projection bytes do not match their pinned version.');
  const projection=JSON.parse(projectionText);
  if(projection.schema!=='ace-dat-canon-educational-projection/1'||projection.exportSha256!==manifest.exportSha256||projection.contentDigest!==manifest.contentDigest||projection.runtimeSha256!==manifest.runtimeSha256||!Array.isArray(projection.units))fail('Canon handoff identity mismatch.');
  if(manifest.counts?.progressGradingEligible!==0||manifest.counts?.storyUnlockEligible!==0||projection.policy?.masteryCredit!==false||projection.policy?.storyUnlock!==false)fail('This consumer cannot authorize scoring or progression.');
  const units=new Map(),tasks=new Map(),firstResponses=new Map();
  for(const unit of projection.units){
    const pin=manifest.units.find(p=>p.id===unit.id);
    if(!pin||units.has(unit.id)||pin.version!==unit.version||pin.sourceSha256!==unit.sourceSha256||pin.runtimeSha256!==projection.runtimeSha256||unit.visualizer?.rendererIntegrated!==false)fail('Unmatched Canon unit version.');
    units.set(unit.id,unit);
    for(const task of unit.tasks){const ref=pin.tasks.find(t=>t.id===task.id);
      if(!ref||tasks.has(task.id)||ref.canonicalPointer!==task.canonicalPointer||task.sourceSha256!==pin.sourceSha256||task.progressGradingEligible!==false||task.storyUnlockEligible!==false||task.freshness!=='unestablished'||task.familyId!==ref.familyId)fail('Invalid Canon task reference.');
      tasks.set(task.id,{unit,task,ref});
    }
  }
  if(units.size!==manifest.counts.units||tasks.size!==manifest.counts.tasks)fail('Canon inventory changed.');
  freeze(projection);freeze(manifest);
  const eligibility=()=>Object.freeze({eligible:false,masteryCredit:false,storyUnlock:false,independentEvidence:false,reason:'Staged Canon is formative only. Content approval and a new item ID cannot establish independent, fresh or delayed performance.'});
  function expose(unit,kind){onExposure({kind,canonId:unit.id,canonVersion:unit.version,sourceSha256:unit.sourceSha256,runtimeSha256:manifest.runtimeSha256,exportSha256:manifest.exportSha256,occurredAt:Date.now(),formativeOnly:true,masteryCredit:false,storyUnlock:false});}
  function unitById(id){return units.get(id)||null;}
  function taskById(id){const entry=tasks.get(id);return entry?Object.freeze({unitId:entry.unit.id,task:entry.task,reference:entry.ref,eligibility:eligibility()}):null;}
  function answer(id,choice,{hintUsed=false,answerRevealed=false}={}){
    const entry=tasks.get(id);if(!entry)fail('Unknown Canon task.');
    if(entry.task.requiresVisualizer)return Object.freeze({available:false,reason:'This diagram task needs its reviewed visualizer before it can be attempted.',...eligibility()});
    if(!Number.isInteger(choice)||choice<0||choice>=entry.task.choices.length)fail('Choose an available option.');
    const duplicate=firstResponses.has(id);
    if(!duplicate)firstResponses.set(id,Object.freeze({choice,hintUsed:hintUsed===true,answerRevealed:answerRevealed===true,committedAt:Date.now()}));
    expose(entry.unit,'canon-formative-answer-and-feedback');
    return Object.freeze({available:true,duplicate,firstResponse:firstResponses.get(id),matchesCanonicalKey:choice===entry.task.key,feedback:entry.task.why,familyStatus:entry.ref.familyStatus,freshness:'unestablished',...eligibility()});
  }
  function renderPreview(host,id){
    const unit=units.get(id);if(!unit)fail('Unknown Canon unit.');
    if(!host?.ownerDocument?.createElement)fail('Provide a preview container.');
    const d=host.ownerDocument,section=d.createElement('section');
    const add=(tag,text)=>{const el=d.createElement(tag);el.textContent=text;section.append(el);return el;};
    add('p',unit.label).setAttribute('role','status');add('h2',unit.title||unit.id);
    add('p','Formative preview. Viewing examples or answering here does not award mastery, badges or story progress.');
    if(unit.subtitle)add('p',unit.subtitle);
    for(const line of unit.key)add('p',[line.lead,line.text].filter(Boolean).join(' '));
    if(unit.worked.prompt){add('h3',unit.worked.label||'Worked example');add('p',unit.worked.prompt);const list=d.createElement('ol');for(const step of unit.worked.steps){const li=d.createElement('li');li.textContent=step;list.append(li);}section.append(list);add('p',unit.worked.answer||'');}
    for(const trap of unit.traps)add('p',[trap.title,trap.instead,trap.why].filter(Boolean).join(' '));
    add('p','The interactive visualizer is not available in this staged preview.');
    host.replaceChildren(section);expose(unit,'canon-formative-guide-and-worked-example');return section;
  }
  return Object.freeze({counts:freeze({...manifest.counts}),version:manifest.exportSha256,unitById,taskById,renderPreview,answer,progressionDecision:eligibility,
    familyDecision:id=>{const e=tasks.get(id);return Object.freeze({familyId:e?.ref.familyId||null,status:e?.ref.familyStatus||'unknown',novel:false,independentEvidence:false});}});
}
