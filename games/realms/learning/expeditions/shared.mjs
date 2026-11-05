export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const button=(label,action,value='',{selected=false,disabled=false,kind=''}={})=>`<button type="button" class="exp-tool ${esc(kind)}${selected?' is-selected':''}" data-exp-action="${esc(action)}" data-value="${esc(value)}"${selected?' aria-pressed="true"':''}${disabled?' disabled':''}>${esc(label)}</button>`;
export const svg=(label,body,viewBox='0 0 640 360')=>`<svg xmlns="http://www.w3.org/2000/svg" class="exp-scene-svg" viewBox="${viewBox}" role="img" aria-label="${esc(label)}">${body}</svg>`;
export const copy=value=>JSON.parse(JSON.stringify(value));
export const finite=(value,min,max,fallback)=>Number.isFinite(Number(value))?Math.min(max,Math.max(min,Number(value))):fallback;
export const choice=(value,allowed,fallback)=>allowed.includes(value)?value:fallback;
export const group=(label,html)=>`<div class="exp-tools" role="group" aria-label="${esc(label)}">${html}</div>`;
