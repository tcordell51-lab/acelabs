/* AtlasMusic: small looping chiptune themes and jingles, synthesized with WebAudio.
 * Works offline, no files. Obeys the Quest sound setting (ace_dat_realms_mnemon_v1_quest_v1.sound).
 * Browsers only allow audio after a user gesture, so play() before one is a no-op
 * that is retried on the next click or key press.
 * Volume and style (10/15): sound-panel.js (AtlasSound) sets the master volume (setVolume, remembered per device)
 * and, in its Calm style, jingles play as soft sine chimes instead of square-wave stingers.
 */
(function(root){
  'use strict';
  const NOTE=n=>{if(!n||n==='-')return 0;const m=n.match(/^([A-G])(#?)(\d)$/);if(!m)return 0;const i={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+(m[2]?1:0);return 440*Math.pow(2,(i+12*(+m[3]+1)-69)/12);};
  // Each theme: tempo (beats per minute), melody and bass as [note, beats] lists of equal length in beats.
  const THEMES={
    route:{bpm:132,lead:'square',vol:.035,melody:[['E5',1],['G5',1],['A5',2],['G5',1],['E5',1],['D5',2],['C5',1],['D5',1],['E5',1],['G5',1],['E5',4],['A5',1],['B5',1],['C6',2],['B5',1],['A5',1],['G5',2],['E5',1],['G5',1],['A5',1],['G5',1],['E5',2],['D5',2]],
      bass:[['C3',2],['G3',2],['A2',2],['E3',2],['F2',2],['C3',2],['G2',4],['A2',2],['E3',2],['F2',2],['C3',2],['F2',2],['G2',2],['C3',4]]},
    town:{bpm:104,lead:'triangle',vol:.05,melody:[['C5',1],['E5',1],['G5',1],['E5',1],['F5',2],['A5',2],['G5',1],['E5',1],['C5',1],['E5',1],['D5',4],['C5',1],['E5',1],['G5',1],['C6',1],['B5',2],['G5',2],['A5',1],['F5',1],['D5',1],['B4',1],['C5',4]],
      bass:[['C3',4],['F2',4],['C3',4],['G2',4],['A2',4],['E2',4],['F2',4],['C3',4]]},
    battle:{bpm:168,lead:'square',vol:.035,melody:[['A4',.5],['A4',.5],['C5',.5],['A4',.5],['E5',1],['D5',.5],['C5',.5],['B4',.5],['B4',.5],['D5',.5],['B4',.5],['F5',1],['E5',.5],['D5',.5],['A4',.5],['C5',.5],['E5',.5],['A5',.5],['G5',1],['E5',1],['F5',.5],['E5',.5],['D5',.5],['B4',.5],['C5',1],['B4',1]],
      bass:[['A2',.5],['A3',.5],['A2',.5],['A3',.5],['A2',.5],['A3',.5],['A2',.5],['A3',.5],['G2',.5],['G3',.5],['G2',.5],['G3',.5],['G2',.5],['G3',.5],['G2',.5],['G3',.5],['F2',.5],['F3',.5],['F2',.5],['F3',.5],['F2',.5],['F3',.5],['F2',.5],['F3',.5],['E2',.5],['E3',.5],['E2',.5],['E3',.5],['E2',.5],['E3',.5],['E2',.5],['E3',.5]]},
    legendary:{bpm:120,lead:'sawtooth',vol:.028,melody:[['D5',1.5],['F5',.5],['A5',2],['G5',1],['F5',1],['E5',2],['D5',1.5],['F5',.5],['A5',1],['D6',1],['C6',4],['A#5',1.5],['A5',.5],['G5',2],['F5',1],['G5',1],['A5',2],['D5',2],['E5',1],['F5',1],['D5',4]],
      bass:[['D2',2],['D3',2],['A#1',2],['A#2',2],['C2',2],['C3',2],['A1',2],['A2',2],['G1',2],['G2',2],['A1',2],['A2',2],['D2',4],['D2',4]]}
  };
  const JINGLES={
    victory:[['C5',.25],['E5',.25],['G5',.25],['C6',.75],['G5',.25],['C6',1]],
    catch:[['G5',.25],['B5',.25],['D6',.5],['G6',1]],
    lose:[['E4',.5],['D4',.5],['C4',1.5]],
    evolve:[['C5',.25],['E5',.25],['G5',.25],['C6',.25],['E6',.25],['G6',.25],['C7',1]]
  };
  let ctx=null,master=null,bus=null,current=null,timer=null,pending=null,nextTime=0,step=0,enabled=null,vol=(()=>{try{const p=JSON.parse(localStorage.getItem('ace_dat_realms_mnemon_v1_sound_prefs_v1')||'{}');return isFinite(+p.volume)?Math.max(0,Math.min(1,+p.volume)):1;}catch(e){return 1;}})();
  function setVolume(v){vol=Math.max(0,Math.min(1,+v||0));if(master&&ctx){master.gain.setValueAtTime(master.gain.value,ctx.currentTime);master.gain.linearRampToValueAtTime(vol,ctx.currentTime+.15);}return vol;}
  const calm=()=>{try{return !!(root.AtlasSound&&root.AtlasSound.calm&&root.AtlasSound.calm());}catch(e){return false;}};
  // No sound ever (owner, 10/15): music, jingles and every game sound are off for good, whatever the saved setting.
  const SILENT=true;
  function isEnabled(){if(SILENT)return false;if(enabled!==null)return enabled;try{const s=JSON.parse(localStorage.getItem('ace_dat_realms_mnemon_v1_quest_v1')||'{}');return s.sound!==false;}catch(e){return true;}}
  function ensure(){if(ctx)return ctx;try{ctx=new (root.AudioContext||root.webkitAudioContext)();master=ctx.createGain();master.gain.value=vol;master.connect(ctx.destination);}catch(e){ctx=null;}return ctx;}
  function blip(freq,start,dur,type,vol,out){if(!freq)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(vol,start+.012);g.gain.exponentialRampToValueAtTime(.0001,start+Math.max(.05,dur*.92));o.connect(g).connect(out||bus||master);o.start(start);o.stop(start+dur+.02);}
  function timeline(list,beat){let t=0;return list.map(([n,b])=>{const e={f:NOTE(n),at:t,d:b*beat};t+=b*beat;return e;});}
  function schedule(){
    if(!current||!ctx)return;const th=THEMES[current],beat=60/th.bpm;
    if(!th._m){th._m=timeline(th.melody,beat);th._b=timeline(th.bass,beat);th._len=Math.max(th._m.reduce((a,e)=>Math.max(a,e.at+e.d),0),th._b.reduce((a,e)=>Math.max(a,e.at+e.d),0));}
    while(nextTime<ctx.currentTime+.6){
      const base=nextTime;for(const e of th._m)blip(e.f,base+e.at,e.d,th.lead,th.vol);for(const e of th._b)blip(e.f,base+e.at,e.d,'triangle',th.vol*1.3);
      nextTime+=th._len;step++;
    }
  }
  function start(name){if(!THEMES[name])return;lastTheme=name;if(!isEnabled()){stop();return;}if(!ensure()){return;}
    if(ctx.state==='suspended'){pending=name;ctx.resume().catch(()=>{});}
    if(current===name&&timer)return;stop();current=name;bus=ctx.createGain();bus.connect(master);nextTime=ctx.currentTime+.08;step=0;schedule();timer=setInterval(schedule,250);}
  function stop(){clearInterval(timer);timer=null;current=null;if(bus&&ctx){const b=bus;b.gain.setValueAtTime(b.gain.value,ctx.currentTime);b.gain.linearRampToValueAtTime(0,ctx.currentTime+.08);setTimeout(()=>{try{b.disconnect();}catch(e){}},200);}bus=null;}
  function jingle(name){const j=JINGLES[name];if(!j||!isEnabled()||!ensure())return;const was=current;stop();const t0=ctx.currentTime+.14;let t=0;const jb=ctx.createGain();jb.connect(master);const c=calm(),k=c?.7:.42;for(const [n,b] of j){blip(NOTE(n),t0+t,b*k,c?'sine':'square',c?.025:.05,jb);t+=b*k;}if(was)setTimeout(()=>start(was),Math.round((t+.4)*1000));}
  let lastTheme='route';
  function setEnabled(on){enabled=!!on;if(!on)stop();try{root.dispatchEvent(new CustomEvent('atlas:sound',{detail:{on:enabled}}));}catch(e){}}
  function toggle(){const on=!isEnabled();try{const raw=JSON.parse(localStorage.getItem('ace_dat_realms_mnemon_v1_quest_v1')||'{}');const s=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};s.sound=on;localStorage.setItem('ace_dat_realms_mnemon_v1_quest_v1',JSON.stringify(s));}catch(e){}setEnabled(on);if(on)start(lastTheme);return on;}
  // Unlock on first gesture and resume whatever was requested.
  // Perf (10/23): with sound off for good (SILENT) no AudioContext is ever made; creating one on the first key press
  // blocked the main thread for 0.4 to 1 s, the first step of every walk.
  const unlock=()=>{if(SILENT)return;if(ctx&&ctx.state!=='suspended')return;if(!ensure())return;if(ctx.state==='suspended')ctx.resume().then(()=>{if(pending){const p=pending;pending=null;current=null;start(p);}}).catch(()=>{});};
  root.addEventListener?.('pointerdown',unlock,true);root.addEventListener?.('keydown',unlock,true);
  // addTheme: extra route themes added by a world. Never replaces a built-in theme.
  function addTheme(name,def){if(!name||THEMES[name]||!def||!Array.isArray(def.melody)||!Array.isArray(def.bass)||!(+def.bpm>0))return false;THEMES[name]={...def};return true;}
  root.AtlasMusic={play:start,stop,jingle,setEnabled,isEnabled,toggle,addTheme,setVolume,volume:()=>vol,current:()=>current,themes:Object.keys(THEMES)};
})(typeof window!=='undefined'?window:globalThis);
