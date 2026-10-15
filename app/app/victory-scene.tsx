import {useEffect,type ReactNode} from 'react';
import type {Game} from '../lib/engine';
import {playGameCue} from '../lib/game-audio';
import {HeroArt} from './hero-art';
export function VictoryScene({game,children}:{game:Game;children:ReactNode}){
 const ranking=[...game.teams].sort((a,b)=>b.score-a.score),top=ranking[0].score,winners=ranking.filter(t=>t.score===top);
 useEffect(()=>{if(!game.config.sound)return;const t=setTimeout(()=>playGameCue('victory'),200);return()=>clearTimeout(t);},[]);
 return <main className="results victory-scene" data-teams={game.teams.length} data-winners={winners.length}>
  <div className="victory-confetti" aria-hidden="true">{Array.from({length:28},(_,i)=><i key={i} style={{left:`${i*37%100}%`,animationDelay:`-${i*.31}s`,'--fall':`${5+i%4}s`} as React.CSSProperties}/>)}</div>
  <div className="champion-portrait"><div className="champion-halo"/><img className="victory-art" src="/assets/victory-emblem.webp" alt="Championship trophy"/><div className="champion-heroes">{winners.slice(0,3).map(t=><HeroArt key={t.id} hero={t.hero}/>)}</div></div>
  <section className="victory-content"><span className="eyebrow">MISSION COMPLETE</span><h2>{winners.length>1?'CHAMPIONS!':'CHAMPION!'}</h2><p className="champion-names">{winners.map(t=>t.name).join(' · ')}</p><div className="champion-score">{top}<span>POINTS</span></div><p className="victory-progress">{game.cells.filter(c=>c.used).length}/{game.cells.length} challenges completed</p>
  <div className="ranking">{ranking.map(t=><div key={t.id} className={t.score===top?'rank-winner':''}><span className="rank-number">{ranking.findIndex(x=>x.score===t.score)+1}</span><span className="dot" style={{background:t.color}}/><strong>{t.name}</strong><b>{t.score}<small> pts</small></b></div>)}</div>
  <div className="actions centered victory-actions">{children}</div></section>
 </main>;
}
