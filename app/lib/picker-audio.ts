import type {PickerMode} from './student-picker';
let ctx:AudioContext|null=null,soundLevel=.65;
export type PickerCue='start'|'message'|'ring'|'win'|'busy'|'ambient'|'ufo'|'lift'|'bounce'|'splash'|'quack'|'tick';
export function unlockPickerAudio(){try{ctx??=new AudioContext();void ctx.resume().catch(()=>{});}catch{/* Drawing and visual feedback remain available. */}}
export function setPickerSoundVolume(level:number){soundLevel=Math.max(0,Math.min(1,level));}
function tone(frequency:number,at:number,length:number,level:number,type:OscillatorType='sine',end?:number,bus?:GainNode){if(!ctx||ctx.state!=='running')return;const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(frequency,at);if(end)osc.frequency.exponentialRampToValueAtTime(end,at+length);gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,level),at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+length);osc.connect(gain);gain.connect(bus??ctx.destination);osc.start(at);osc.stop(at+length+.03);return osc;}
export function pickerCue(kind:PickerCue,level=.2){if(!ctx||ctx.state!=='running'||soundLevel===0)return;const at=ctx.currentTime,volume=Math.min(.3,level)*soundLevel;
 if(kind==='ufo'||kind==='lift'){tone(kind==='lift'?180:420,at,kind==='lift'?1.3:.7,volume,'sine',kind==='lift'?1300:170);tone(280,at+.08,.7,volume*.3,'triangle',700);return;}
 if(kind==='bounce'){tone(540,at,.07,volume*.7,'sine',240);return;}
 if(kind==='quack'){tone(360,at,.13,volume*.65,'sawtooth',190);tone(330,at+.16,.12,volume*.4,'sawtooth',170);return;}
 if(kind==='splash'){[620,810,470].forEach((f,i)=>tone(f,at+i*.035,.11,volume*.2,'sine',120));return;}
 if(kind==='tick'){tone(1100,at,.045,volume*.35,'triangle',550);return;}
 const frequencies=kind==='win'?[523,659,784,1047]:kind==='ring'?[440,554,440,554]:kind==='message'?[780,1040]:kind==='busy'?[392,330]:kind==='ambient'?[196,247,294]:[330,440,660];
 frequencies.forEach((f,i)=>tone(f,at+i*.13,kind==='ambient'?.8:.18,volume,kind==='start'?'sine':'triangle'));
}
export const pickerMusic:Record<PickerMode,{bpm:number;notes:number[];bass:number[];voice:OscillatorType}>={
 pasture:{bpm:104,notes:[72,0,76,79,0,76,74,0,69,0,72,76,74,0,71,67],bass:[48,48,45,43],voice:'sine'},
 street:{bpm:116,notes:[67,72,0,76,74,0,72,69,67,0,69,72,74,76,0,72],bass:[48,45,53,43],voice:'triangle'},
 plinko:{bpm:126,notes:[76,72,79,0,76,74,72,67,74,71,79,0,77,76,74,71],bass:[48,48,43,43],voice:'sine'},
 ducks:{bpm:132,notes:[72,76,79,76,74,77,81,77,72,76,79,84,83,79,77,74],bass:[48,53,48,43],voice:'triangle'},
 chat:{bpm:82,notes:[69,0,0,72,0,0,76,0,71,0,0,74,0,0,76,0],bass:[45,45,47,47],voice:'sine'},
 quick:{bpm:142,notes:[72,74,76,79,72,74,76,81,74,76,77,83,79,76,74,72],bass:[48,45,53,43],voice:'triangle'},
};
// Original synthesized loops; no media downloads or third-party recordings.
export function startPickerMusic(mode:PickerMode,volume=.4){unlockPickerAudio();if(!ctx)return()=>{};const audio=ctx,bus=audio.createGain(),theme=pickerMusic[mode],notes=new Set<OscillatorNode>();bus.gain.value=Math.max(0,Math.min(1,volume))*(mode==='chat'?.055:.09);bus.connect(audio.destination);const beat=60/theme.bpm/2;let next=audio.currentTime+.08,step=0;
 const schedule=()=>{if(audio.state!=='running'){next=audio.currentTime+.08;return;}while(next<audio.currentTime+.25){const note=theme.notes[step%theme.notes.length],osc=note?tone(440*2**((note-69)/12),next,beat*.85,.55,theme.voice,undefined,bus):undefined;if(osc){notes.add(osc);osc.onended=()=>notes.delete(osc);}if(step%4===0){const bass=theme.bass[Math.floor(step/4)%theme.bass.length],low=tone(440*2**((bass-69)/12),next,beat*3.5,.4,'sine',undefined,bus);if(low){notes.add(low);low.onended=()=>notes.delete(low);}}next+=beat;step++;}};
 schedule();const timer=setInterval(schedule,80);return()=>{clearInterval(timer);bus.gain.cancelScheduledValues(audio.currentTime);bus.gain.setValueAtTime(0,audio.currentTime);for(const osc of notes){try{osc.stop();}catch{/* Already finished. */}}bus.disconnect();};
}
export function silencePickerAudio(){if(ctx)void ctx.suspend().catch(()=>{});}
