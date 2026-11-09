import {useState,type CSSProperties} from 'react';
import type {MysteryGame} from '../lib/mystery-engine';
import {mysteryGiftMood} from '../lib/mystery-engine';

export function GiftFlight({game,paused,onDone}:{game:MysteryGame;paused:boolean;onDone:()=>void}){
 const r=game.round!;
 return <div className="mb-box-scene"><span className="mb-kicker">SPECIAL DELIVERY</span><h1>GIVE!</h1><p>Hộp đang tới <strong>{game.teams[r.recipient!].name}</strong></p><div className="mb-gift-flight" style={{'--flight-duration':game.config.animationSpeed==='fast'?'.65s':'1.5s',animationPlayState:paused?'paused':'running'} as CSSProperties}><div className="mb-gift-sender"><span>🦸</span><strong>{game.teams[r.actor].name}</strong></div><div className="mb-gift-parcel" onAnimationEnd={e=>{if(e.target===e.currentTarget)onDone();}}><img src="/assets/v3/choice-loot-crate.webp" alt="Hộp bí ẩn đang bay sang đội nhận"/></div><div className="mb-gift-receiver"><span>🦸‍♀️</span><strong>{game.teams[r.recipient!].name}</strong></div></div><p className="mb-muted">Bí mật vẫn còn trong hộp…</p><button className="mb-btn" onClick={onDone}>Bỏ qua hiệu ứng</button></div>;
}

export function GiftReaction({game}:{game:MysteryGame}){
 const [variant]=useState(()=>Math.floor(Math.random()*3)),r=game.round!,mood=mysteryGiftMood(game);
 if(!mood)return null;
 const happy=['😆','🥳','😁'][variant],sad=['😢','🥺','😩'][variant],surprise=['😮','😲','🤯'][variant];
 const face=(received:boolean)=>mood==='neutral'?surprise:(mood==='benefit')===received?happy:sad;
 const text=(received:boolean)=>mood==='neutral'?'Bất ngờ chưa!':(mood==='benefit')===received?['Quá đã!','Hên quá trời!','Yeah!'][variant]:['Tiếc ghê!','Ôi không…','Trời ơi!'][variant];
 return <div className={'mb-gift-reactions mb-mood-'+mood} aria-label="Phản ứng sau khi mở hộp">{[false,true].map(received=><div key={String(received)} className={'mb-gift-reaction '+(mood==='neutral'?'surprised':(mood==='benefit')===received?'happy':'sad')}><span role="img" aria-label={mood==='neutral'?'Ngạc nhiên':(mood==='benefit')===received?'Vui':'Buồn'}>{face(received)}</span><div><small>{received?'ĐỘI NHẬN':'ĐỘI GỬI'}</small><strong>{game.teams[received?r.recipient!:r.actor].name}</strong><p>{text(received)}</p></div></div>)}</div>;
}
