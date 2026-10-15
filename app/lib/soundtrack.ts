import {localGet,localSet} from './local';
import {musicDefaults,normalizeMusic,musicLevel,type MusicSettings,type MusicScene} from './music-profile';
type MusicStatus={scene:MusicScene;settings:MusicSettings;playing:boolean;blocked:boolean;muted:boolean;ducked:boolean;level:number;error:string};
let state:MusicStatus={scene:'off',settings:musicDefaults,playing:false,blocked:false,muted:false,ducked:false,level:0,error:''};
let context:AudioContext|undefined,gain:GainNode|undefined,source:MediaElementAudioSourceNode|undefined,sourceAudio:HTMLAudioElement|undefined,ready:Promise<void>|undefined,saveQueue=Promise.resolve(),seekIntro=false;
const listeners=new Set<()=>void>();
export const getMusicStatus=()=>state;
export function subscribeMusic(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};}
function emit(patch:Partial<MusicStatus>={}){state={...state,...patch};listeners.forEach(fn=>fn());}
export function musicAudio(){return document.getElementById('sophia-avengers-music') as HTMLAudioElement|null;}
export function initializeMusic(){return ready??=localGet<Partial<MusicSettings>>('sophia-avengers-music-settings').then(value=>{emit({settings:normalizeMusic(value??{})});applyLevel();}).catch(()=>{});}
function graph(audio:HTMLAudioElement){if(sourceAudio===audio)return;source?.disconnect();gain?.disconnect();context??=new AudioContext();sourceAudio=audio;source=context.createMediaElementSource(audio);const compressor=context.createDynamicsCompressor();compressor.threshold.value=-23;compressor.knee.value=18;compressor.ratio.value=3;compressor.attack.value=.012;compressor.release.value=.35;gain=context.createGain();gain.gain.value=0;source.connect(compressor);compressor.connect(gain);gain.connect(context.destination);}
function applyLevel(fade=1.5){const value=musicLevel(state.scene,state.settings,state.muted,state.ducked);if(context&&gain){gain.gain.cancelScheduledValues(context.currentTime);gain.gain.setValueAtTime(gain.gain.value,context.currentTime);gain.gain.linearRampToValueAtTime(value,context.currentTime+fade);}emit({level:value});}
async function play(){const audio=musicAudio();if(!audio||state.scene==='off'||!state.settings.enabled||state.muted)return;try{graph(audio);await context?.resume();if(seekIntro&&audio.readyState>=1){audio.currentTime=Math.min(state.settings.introStart,Math.max(0,audio.duration-5));seekIntro=false;}applyLevel(.55);await audio.play();emit({playing:true,blocked:false,error:''});}catch{emit({playing:false,blocked:true,error:'Bấm Phát thử intro hoặc Bật nhạc Avengers để cho phép trình duyệt phát âm thanh.'});}}
export function requestMusicScene(scene:MusicScene,gesture=false){const previous=state.scene;emit({scene});if(scene==='intro'&&previous!=='intro'){seekIntro=true;const audio=musicAudio();if(audio&&audio.readyState>=1){audio.currentTime=state.settings.introStart;seekIntro=false;}}if(scene==='off'){musicAudio()?.pause();applyLevel(.3);emit({playing:false});return;}applyLevel();if(gesture||!state.playing||musicAudio()?.paused)void initializeMusic().then(()=>{if(state.scene===scene)void play();});}
export function setMusicSuppressed(muted:boolean){emit({muted});applyLevel(.3);if(muted){musicAudio()?.pause();emit({playing:false});}else if(state.scene!=='off')void play();}
export function updateMusicSettings(patch:Partial<MusicSettings>){const settings=normalizeMusic({...state.settings,...patch});emit({settings});applyLevel();saveQueue=saveQueue.catch(()=>{}).then(()=>localSet('sophia-avengers-music-settings',settings));if(!settings.enabled){musicAudio()?.pause();emit({playing:false});}else if(state.scene!=='off')void play();}
export function previewMusic(){seekIntro=true;emit({muted:false});updateMusicSettings({enabled:true});requestMusicScene('intro',true);}
export function attachMusicEvents(){
 const audio=musicAudio();if(!audio)return()=>{};void initializeMusic();
 const metadata=()=>{if(seekIntro){audio.currentTime=Math.min(state.settings.introStart,Math.max(0,audio.duration-5));seekIntro=false;}};
 const playing=()=>emit({playing:true,blocked:false,error:''}),paused=()=>emit({playing:false}),error=()=>emit({playing:false,error:'Chưa tải được nhạc nền. Game vẫn tiếp tục chơi được.'});
 const questionAudio=new Set<HTMLMediaElement>();
 const prune=()=>{for(const item of questionAudio)if(!item.isConnected||item.paused||item.ended)questionAudio.delete(item);const ducked=questionAudio.size>0;if(state.ducked!==ducked){emit({ducked});applyLevel(.35);}};
 const duck=(event:Event)=>{const media=event.target;if(!(media instanceof HTMLMediaElement)||media===audio)return;if(event.type==='play')questionAudio.add(media);else questionAudio.delete(media);prune();};
 const observer=new MutationObserver(()=>{if(questionAudio.size)prune();});observer.observe(document.body,{childList:true,subtree:true});
 let hiddenPause=false;const visibility=()=>{if(document.hidden){hiddenPause=!audio.paused;audio.pause();}else if(hiddenPause){hiddenPause=false;if(state.scene!=='off')void play();}};
 audio.addEventListener('loadedmetadata',metadata);audio.addEventListener('playing',playing);audio.addEventListener('pause',paused);audio.addEventListener('error',error);document.addEventListener('play',duck,true);document.addEventListener('pause',duck,true);document.addEventListener('ended',duck,true);document.addEventListener('visibilitychange',visibility);
 return()=>{observer.disconnect();audio.removeEventListener('loadedmetadata',metadata);audio.removeEventListener('playing',playing);audio.removeEventListener('pause',paused);audio.removeEventListener('error',error);document.removeEventListener('play',duck,true);document.removeEventListener('pause',duck,true);document.removeEventListener('ended',duck,true);document.removeEventListener('visibilitychange',visibility);};
}
