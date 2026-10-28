import {useEffect,useRef,useState} from 'react';
import {ArrowRight} from 'lucide-react';
import {playGameCue} from '../lib/game-audio';
const stones=['space-blue','mind-yellow','reality-red','power-purple','time-green','soul-orange'];
export function RewardReveal({total,motion,sound,paused=false,onContinue}:{total:number;motion:boolean;sound:boolean;paused?:boolean;onContinue:()=>void}){
 const reduced=!motion||window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const [shown,setShown]=useState(reduced?total:0),soundRef=useRef(sound),skipped=useRef(false);soundRef.current=sound;
 useEffect(()=>{if(paused||reduced||shown>=total)return;const timer=setTimeout(()=>{setShown(n=>Math.min(total,n+1));if(soundRef.current)playGameCue('gem',shown);},shown===0?650:800);return()=>clearTimeout(timer);},[total,reduced,shown,paused]);
 const finished=shown>=total;
 return <div className={'reward-display vault-reward '+(finished?'complete':'')}>
  <span className="eyebrow">{finished?'INFINITY STONES COLLECTED':'GATHERING INFINITY STONES…'}</span>
  <h2 aria-live="polite" aria-atomic="true">+{shown}<small> POINTS</small></h2>
  <p className="stone-value"><img src="/assets/stone-space-blue.webp" alt="One stone"/> = 1 point</p>
  <div className="reward-stones" aria-label={`${shown} stones collected`}>
   {Array.from({length:shown},(_,i)=><div className="reward-gem" key={i}><img src={'/assets/stone-'+stones[i%6]+'.webp'} alt=""/><span>+1</span></div>)}
   {!shown&&<div className="summoning-ring" aria-hidden="true"/>}
  </div>
  <div className="reward-actions"><button className="button primary" disabled={!finished||paused} onClick={onContinue}>{finished?'Collect':'Summoning…'}<ArrowRight size={20}/></button>{!finished&&<button className="button glass" onClick={()=>{skipped.current=true;setShown(total);}}>Reveal all</button>}</div>
 </div>;
}
