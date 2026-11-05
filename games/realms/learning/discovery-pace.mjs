// Optional reflection timer. It is never part of scoring or retained evidence.
export function paceTick(state,now,active){
 const previous=state||{elapsed:0,at:now,active:false};
 const delta=Number.isFinite(now)&&Number.isFinite(previous.at)?Math.max(0,now-previous.at):0;
 return {elapsed:previous.elapsed+(previous.active?delta:0),at:now,active:!!active};
}
export function paceLabel(milliseconds){const seconds=Math.floor(Math.max(0,milliseconds)/1000);return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;}
