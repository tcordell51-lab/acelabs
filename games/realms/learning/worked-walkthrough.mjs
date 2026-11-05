/**
 * Student-paced worked example: Read -> Commit -> explicit Reveal -> Steps -> Trap.
 * Interaction informed by the verified QR v7.5 reference; no deck items/assets imported.
 * This component owns only its host's content, not Mnemon's panel/battle chrome.
 *
 * mount(host, lesson, {onExpose, onReturn, onPractice?}) returns {destroy, getState}.
 * lesson: existing teaching record with objectiveId, version, assumptions,
 * workedExample:{prompt,steps:[string],answer}, commonMistake and nextAction.
 * onExpose(event) is synchronous and runs BEFORE newly revealed instruction is painted.
 * It must record help/exposure, never correctness, mastery, XP or an assessment response.
 * Return the recorder result: false, {saved:false}, {ok:false}, or a throw blocks new
 * instruction. Undefined is permitted for a callback that completes successfully.
 * onPractice(request) may return false (unavailable) or a Promise; the caller selects
 * a different practice case and owns its separate attempt/assessment policy.
 * No storage, network, timers, automatic reveal or global keyboard listeners.
 */

const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const text=value=>typeof value==='string'?value.trim():'';
const PHASES=['read','predict','committed','reveal','step','trap'];
let instance=0;

function exampleFrom(lesson){
  const w=lesson?.workedExample;
  if(!text(lesson?.objectiveId)||!text(w?.prompt)||!text(w?.answer)||!Array.isArray(w?.steps)||!w.steps.length||w.steps.some(s=>!text(s)))throw new TypeError('A worked walkthrough needs an objective, prompt, answer and reasoning steps.');
  return Object.freeze({
    objectiveId:lesson.objectiveId,version:lesson.version??1,
    exampleId:text(w.id)||`${lesson.objectiveId}:worked:v${lesson.version??1}`,
    prompt:w.prompt,answer:w.answer,steps:Object.freeze([...w.steps]),
    assumptions:Object.freeze((lesson.assumptions||[]).filter(s=>text(s))),
    trap:text(lesson.commonMistake)||'Check the stated conditions and units before applying the result to another case.',
    nextAction:text(lesson.nextAction)
  });
}

const initial=()=>({phase:'read',prediction:'',commitment:null,stepIndex:0,hasRevealed:false,replayed:false});

/** Pure transition model exported for deterministic sequencing tests. No grading. */
export function createWalkthrough(lesson){
  const example=exampleFrom(lesson);
  let state=initial();
  function propose(action,value=''){
    const next={...state};
    if(action==='predict'&&state.phase==='read')next.phase='predict';
    else if(action==='read'&&state.phase==='predict')next.phase='read';
    else if(action==='commit'&&state.phase==='predict'&&text(value)){next.phase='committed';next.prediction=text(value).slice(0,4000);next.commitment='prediction';}
    else if(action==='unsure'&&state.phase==='predict'){next.phase='committed';next.prediction='I am not sure yet.';next.commitment='unsure';}
    else if(action==='edit'&&state.phase==='committed'&&!state.hasRevealed)next.phase='predict';
    else if(action==='reveal'&&state.phase==='committed'){next.phase='reveal';next.hasRevealed=true;}
    else if(action==='walk'&&state.phase==='reveal'){next.phase='step';next.stepIndex=0;}
    else if(action==='next'&&state.phase==='step'){if(state.stepIndex<example.steps.length-1)next.stepIndex++;else next.phase='trap';}
    else if(action==='back'&&state.phase==='step'){if(state.stepIndex>0)next.stepIndex--;else next.phase='reveal';}
    else if(action==='back'&&state.phase==='trap'){next.phase='step';next.stepIndex=example.steps.length-1;}
    else if(action==='replay'&&state.hasRevealed){Object.assign(next,initial(),{replayed:true});}
    else return null;
    return Object.freeze(next);
  }
  return {
    example,
    getState:()=>({...state}),
    propose,
    // Only the owning view commits a proposed state after its exposure callback succeeds.
    commit(next){if(!next||!PHASES.includes(next.phase))throw new TypeError('Invalid walkthrough state.');state={...next};},
    clear(){state=initial();}
  };
}

function exposure(example,state){
  return Object.freeze({
    source:'worked-walkthrough',kind:'worked-example',objectiveId:example.objectiveId,
    exampleId:example.exampleId,lessonVersion:example.version,phase:state.phase,
    stepIndex:state.phase==='step'?state.stepIndex:null,
    answerVisible:['reveal','step','trap'].includes(state.phase),
    commitment:state.commitment,replayed:state.replayed,
    instruction:true,assisted:true
  });
}

const action=(name,label,{primary=false,disabled=false}={})=>`<button type="button" data-ww-action="${name}"${primary?' class="ww-primary"':''}${disabled?' disabled':''}>${label}</button>`;

/** Rendered text only: answers, unrevealed steps and traps are absent before reveal. */
export function walkthroughHTML(example,state,{id='ww',draft='',practice=false,busy=false,message=''}={}){
  const phases={read:'Read the case',predict:'Make a prediction',committed:'Prediction committed',reveal:'Reveal the result',step:`Reasoning step ${state.stepIndex+1} of ${example.steps.length}`,trap:'Trap to avoid'};
  const stage=state.phase==='read'?1:['predict','committed'].includes(state.phase)?2:state.phase==='reveal'?3:state.phase==='step'?4:5;
  let body='',buttons='';
  if(state.phase==='read'){
    body='<p>Read the given information and the conditions. Then predict the result or name a first step. Nothing here is scored.</p>';
    buttons=action('predict','Make a prediction',{primary:true});
  }else if(state.phase==='predict'){
    body=`<form data-ww-form><label for="${id}-prediction"><strong>Your prediction or first step</strong></label><textarea id="${id}-prediction" data-ww-prediction rows="3" maxlength="4000" aria-describedby="${id}-prediction-note" placeholder="I think… because…">${esc(draft)}</textarea><p id="${id}-prediction-note" class="ww-note">Keep a short attempt in your own words. It stays in this walkthrough and is not graded. If you are stuck, choose “I'm not sure yet.”</p><div class="ww-actions"><button type="submit" data-ww-commit class="ww-primary"${text(draft)?'':' disabled'}>Commit prediction</button>${action('unsure',"I'm not sure yet")}</div></form>`;
    buttons=action('read','Read the case again');
  }else if(state.phase==='committed'){
    body=`<div class="ww-prediction"><strong>Your committed attempt</strong><p>${esc(state.prediction)}</p></div><p>The result stays hidden until you choose to reveal it. Compare your first step with the walkthrough afterward.</p>`;
    buttons=action('reveal','Reveal the result',{primary:true})+action('edit','Change my prediction');
  }else if(state.phase==='reveal'){
    body=`<div class="ww-result"><strong>Result</strong><p>${esc(example.answer)}</p></div><details class="ww-attempt"><summary>Compare with your committed attempt</summary><p>${esc(state.prediction)}</p></details><p>This is the worked example's result, not a score for your prediction. As you walk through the reasoning, compare the first step with your own.</p>`;
    buttons=action('walk','Walk through the reasoning',{primary:true});
  }else if(state.phase==='step'){
    body=`<div class="ww-reasoning" data-ww-step="${state.stepIndex}"><p>${esc(example.steps[state.stepIndex])}</p></div><p class="ww-note">Only this reasoning step is shown. Move at your own pace; Back returns to the previous step.</p>`;
    buttons=action('back',state.stepIndex?'Back a step':'Back to the result')+action('next',state.stepIndex===example.steps.length-1?'Show the trap':'Next reasoning step',{primary:true});
  }else{
    body=`<div class="ww-trap"><p>${esc(example.trap)}</p></div>${example.nextAction?`<p>${esc(example.nextAction)}</p>`:''}<p class="ww-note">Replaying this example is instruction. A different practice case is a separate attempt; it is not made independent by finishing this walkthrough.</p>`;
    buttons=action('back','Back a step')+action('replay','Replay this example')+(practice?action('practice',busy?'Opening practice…':'Try a fresh practice case',{primary:true,disabled:busy}):'');
  }
  return `<section class="dat-worked-walkthrough" data-ww-instance="${id}" aria-labelledby="${id}-title"><p class="ww-eyebrow">WORKED EXAMPLE · GUIDED INSTRUCTION</p><p class="ww-progress" aria-label="Walkthrough stage ${stage} of 5">Read → Commit → Reveal → Reason → Trap</p><h3 id="${id}-title" data-ww-heading tabindex="-1">${esc(phases[state.phase])}</h3>${state.replayed?'<p class="ww-note">Replay of an example you have already revealed.</p>':''}<div class="ww-case">${example.assumptions.length?`<details${['read','predict'].includes(state.phase)?' open':''}><summary>Given conditions</summary><ul>${example.assumptions.map(a=>`<li>${esc(a)}</li>`).join('')}</ul></details>`:''}<p>${esc(example.prompt)}</p></div>${body}<p class="ww-message" role="status" aria-live="polite">${esc(message)}</p><div class="ww-actions">${buttons}${action('return','Return to the lesson')}</div></section>`;
}

export function mount(host,lesson,{onExpose=()=>{},onReturn=()=>{},onPractice}={}){
  if(!host?.addEventListener||!host?.querySelector)throw new TypeError('A walkthrough needs a DOM host.');
  const model=createWalkthrough(lesson),id=`dat-ww-${++instance}`;
  let destroyed=false,draft='',message='',busy=false,opened=false;
  function notify(state){
    // The active attempt must be marked supported before new instruction is visible.
    const result=onExpose(exposure(model.example,state));
    if(result&&typeof result.then==='function'){Promise.resolve(result).catch(()=>{});throw new TypeError('onExpose must synchronously record instruction exposure.');}
    if(result===false||result?.saved===false||result?.ok===false)throw new Error('Instruction exposure was not recorded.');
  }
  function render(focus=false){
    if(destroyed)return;
    if(!opened){host.innerHTML=`<section class="dat-worked-walkthrough" data-ww-instance="${id}"><p role="alert">This walkthrough could not open safely. Return to the lesson and try again.</p>${action('return','Return to the lesson')}</section>`;return;}
    host.innerHTML=walkthroughHTML(model.example,model.getState(),{id,draft,practice:typeof onPractice==='function',busy,message});
    if(focus)host.querySelector(model.getState().phase==='predict'?'[data-ww-prediction]':'[data-ww-heading]')?.focus();
  }
  function move(name,value){
    if(destroyed||busy)return;const next=model.propose(name,value);if(!next)return;
    try{notify(next);}catch{message='This step could not open safely. Try again or return to the lesson.';render();return;}
    model.commit(next);message='';
    if(name==='edit')draft=next.commitment==='unsure'?'':next.prediction;
    if(name==='replay')draft='';
    render(true);
  }
  async function practice(){
    if(destroyed||busy||model.getState().phase!=='trap'||typeof onPractice!=='function')return;
    busy=true;message='';render();
    try{
      const available=await onPractice(Object.freeze({objectiveId:model.example.objectiveId,workedExampleId:model.example.exampleId,source:'worked-walkthrough',intent:'fresh-practice',instructionOnly:true}));
      if(!destroyed&&available===false)message='A fresh practice case is not available here yet. You can return to the lesson or replay this example.';
    }catch{if(!destroyed)message='The practice case could not open. Return to the lesson and try again.';}
    finally{if(!destroyed){busy=false;render();host.querySelector('[data-ww-action="practice"]')?.focus();}}
  }
  function click(event){
    const button=event.target.closest?.('[data-ww-action]');if(!button||!host.contains(button)||destroyed)return;
    const name=button.dataset.wwAction;
    if(name==='return'){onReturn();return;}if(name==='practice'){void practice();return;}move(name);
  }
  function input(event){if(destroyed||!event.target.matches?.('[data-ww-prediction]'))return;draft=event.target.value.slice(0,4000);const b=host.querySelector('[data-ww-commit]');if(b)b.disabled=!text(draft);}
  function submit(event){if(!event.target.matches?.('[data-ww-form]'))return;event.preventDefault();move('commit',draft);}
  host.addEventListener('click',click);host.addEventListener('input',input);host.addEventListener('submit',submit);
  try{notify(model.getState());opened=true;}catch{opened=false;}
  render();
  return {
    getState:()=>({...model.getState(),instructionOnly:true}),
    destroy(){if(destroyed)return;destroyed=true;host.removeEventListener('click',click);host.removeEventListener('input',input);host.removeEventListener('submit',submit);host.querySelector(`[data-ww-instance="${id}"]`)?.remove();draft='';model.clear();}
  };
}
