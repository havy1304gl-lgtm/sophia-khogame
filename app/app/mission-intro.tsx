import {useEffect,useState} from 'react';
import {ArrowRight,Volume2,VolumeX} from 'lucide-react';
import {HeroArt} from './hero-art';
import {playGameCue} from '../lib/game-audio';
import {getMusicStatus,requestMusicScene,setMusicSuppressed} from '../lib/soundtrack';
export function MissionIntro({onEnter,onBack}:{onEnter:()=>void;onBack:()=>void}){
 const [sound,setSound]=useState(true);
 useEffect(()=>{if(!sound)return;const t=setTimeout(()=>playGameCue('open'),150);return()=>clearTimeout(t);},[sound]);
 return <main className="mission-intro"><div className="intro-stars"/><img className="intro-portal" src="/assets/energy-portal.webp" alt=""/><button className="button glass intro-back" onClick={onBack}>← Games library</button><button className="icon glass intro-mute" aria-label={sound?'Tắt âm intro':'Bật âm intro'} onClick={()=>{if(sound&&!getMusicStatus().playing&&!getMusicStatus().muted){requestMusicScene('intro',true);return;}const next=!sound;setSound(next);setMusicSuppressed(!next);}}>{sound?<Volume2 size={21}/>:<VolumeX size={21}/>}</button><div className="intro-brand"><img src="/brand/sophia-logo.png" alt="Sophia English"/><span>SOPHIA PRESENTS</span></div><div className="intro-heroes" aria-hidden="true"><HeroArt hero="cap"/><HeroArt hero="ironman"/><HeroArt hero="panther"/></div><div className="intro-copy"><span className="eyebrow">YOUR CLASSROOM. YOUR HEROES.</span><h1>AVENGERS</h1><h2>INFINITY QUEST</h2><p>Assemble your team. Collect the stones.<br/>Change your destiny.</p><button className="button primary" onClick={onEnter}>Enter classroom<ArrowRight size={21}/></button></div><div className="intro-gems" aria-hidden="true">{['space-blue','mind-yellow','reality-red','power-purple','time-green','soul-orange'].map((id,i)=><img key={id} src={'/assets/stone-'+id+'.webp'} alt="" style={{animationDelay:`${.4+i*.22}s`}}/>)}</div></main>;
}
