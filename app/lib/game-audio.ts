export type GameCue='appear'|'gem'|'open'|'portal'|'victory'|'wrong'|'shield'|'snap'|'strike'|'swap'|'assemble'|'timeout';
let context:AudioContext|undefined;
// Synthesis keeps the deployment small; all cues follow the game's mute setting.
export function playGameCue(cue:GameCue,step=0){
 try{
  const c=context??=new AudioContext();void c.resume().catch(()=>{});
  const themes:Partial<Record<GameCue,number[]>>={victory:[523,659,784,1047],open:[196,392,784],portal:[220,440,880],wrong:[180],shield:[587,1175,1762],snap:[180,120,65],strike:[110,220,75],swap:[440,330,660,440],assemble:[392,523,659,784],timeout:[880,660]};
  const notes=themes[cue]??[440*Math.pow(2,(step%12)/12),880*Math.pow(2,(step%12)/12)];
  notes.forEach((hz,i)=>{const o=c.createOscillator(),v=c.createGain(),at=c.currentTime+i*(['victory','assemble','timeout'].includes(cue)?.16:.065),length=cue==='victory'?.55:.32;o.type=['portal','shield','swap'].includes(cue)?'triangle':'sine';o.frequency.setValueAtTime(hz,at);if(cue==='wrong'||cue==='snap')o.frequency.exponentialRampToValueAtTime(Math.max(35,hz/2),at+length);v.gain.setValueAtTime(0,at);v.gain.linearRampToValueAtTime(.05,at+.012);v.gain.exponentialRampToValueAtTime(.0001,at+length);o.connect(v);v.connect(c.destination);o.start(at);o.stop(at+length+.02);});
  if(['open','portal','snap','strike'].includes(cue)){const length=cue==='snap'?.65:.3,buffer=c.createBuffer(1,Math.ceil(c.sampleRate*length),c.sampleRate),samples=buffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*(1-i/samples.length);const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();source.buffer=buffer;filter.type='bandpass';filter.frequency.setValueAtTime(cue==='strike'?1600:400,c.currentTime);filter.frequency.exponentialRampToValueAtTime(cue==='snap'?80:2400,c.currentTime+length);gain.gain.setValueAtTime(.035,c.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,c.currentTime+length);source.connect(filter);filter.connect(gain);gain.connect(c.destination);source.start();source.stop(c.currentTime+length);}
 }catch{/* Audio unavailable: visual play remains usable. */}
}
