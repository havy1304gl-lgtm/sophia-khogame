import {greetingRecording} from './vietnamese-greetings.ts';
export type CallGreetingVoice='male'|'female';
export type GreetingState='ready'|'playing'|'ended'|'blocked'|'error';
export type CallGreeting={audio:HTMLAudioElement;play:()=>Promise<boolean>;pause:()=>void;setVolume:(volume:number)=>void;stop:()=>void;dispose:()=>void};
const level=(volume:number)=>Number.isFinite(volume)?Math.max(0,Math.min(1,volume)):.85;
// Each call chooses one recording once. Native media playback reports autoplay/load failures.
export function primeCallGreeting(voice:CallGreetingVoice,volume=.85,onState:(state:GreetingState)=>void=()=>{},createAudio:()=>HTMLAudioElement=()=>new Audio(),random:()=>number=Math.random):CallGreeting{
 const audio=createAudio(),src=greetingRecording(voice,random);let cancelled=false,attempt=0;
 audio.preload='auto';audio.volume=level(volume);if(src)audio.src=src;
 audio.onended=()=>{if(!cancelled)onState('ended');};audio.onerror=()=>{if(!cancelled)onState('error');};
 if(src)audio.load();else onState('error');
 const stop=()=>{cancelled=true;attempt++;audio.pause();try{audio.currentTime=0;}catch{}};
 return {audio,async play(){if(!src){onState('error');return false;}cancelled=false;const ticket=++attempt;try{if(audio.error)audio.load();if(audio.ended)audio.currentTime=0;await audio.play();if(cancelled||ticket!==attempt)return false;onState('playing');return true;}catch(error){if(!cancelled&&ticket===attempt)onState((error as Error)?.name==='NotAllowedError'?'blocked':'error');return false;}},pause(){attempt++;audio.pause();},setVolume(volume){audio.volume=level(volume);},stop,dispose(){stop();audio.onended=null;audio.onerror=null;audio.removeAttribute('src');audio.load();}};
}
export function playCallGreeting(voice:CallGreetingVoice,volume=.85,onState?:(state:GreetingState)=>void){const call=primeCallGreeting(voice,volume,onState);void call.play();return()=>call.dispose();}
export function shouldPlayGreeting(connected:boolean,seconds:number|null,paused:boolean,enabled:boolean,volume:number,played:boolean,delay:1|2=1){return connected&&seconds!==null&&seconds>=delay&&!paused&&enabled&&volume>0&&!played;}
