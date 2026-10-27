import {shuffle,validateQuestion,type Question,type Quiz} from './engine.ts';

export type MysteryEffect={kind:'points';value:number}|{kind:'bomb'|'bombAll'|'swap'|'increase'|'decrease'|'rps'|'finalChoice'};
export type MysteryConfig={count:number;labels:'numbers'|'letters';seconds:number;finalBattle:boolean;sound:boolean;motion:boolean};
export type MysteryTeam={name:string;score:number;color:string};
export type MysteryCell={question:Question;effect:MysteryEffect;used:boolean;correct?:boolean};
export type MysteryRound={index:number;final:boolean;actor:number;stage:'question'|'decision'|'sealed'|'revealing'|'result';answerShown:boolean;selected:number[];recipient:number|null;resolved:boolean;secondsLeft:number;timerRunning:boolean;before:number[];message:string};
type State={version:1;quizId:string;quizTitle:string;config:MysteryConfig;teams:MysteryTeam[];cells:MysteryCell[];finalCells:MysteryCell[];phase:'main'|'final'|'ended';turn:number;round:MysteryRound|null;logs:string[];startedAt:string};
export type MysteryGame=State&{history:State[]};
export const defaultMysteryConfig:MysteryConfig={count:24,labels:'letters',seconds:30,finalBattle:true,sound:true,motion:true};
export const originalEffects:MysteryEffect[]=[1,-2,3,3,4,-3,5,-6,'bomb',-6,10,7,5,-1,-2,'swap',2,4,'bombAll',4,9,'increase','decrease','rps'].map(x=>typeof x==='number'?{kind:'points',value:x}:{kind:x as Exclude<MysteryEffect['kind'],'points'>});
const teamColors=['#56c8ff','#ff787c','#ffd25e','#af99ff','#58e5bd','#ffa35c'];
export function mysteryLabel(i:number,labels:MysteryConfig['labels']){if(labels==='numbers')return String(i+1);let n=i+1,s='';while(n>0){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26);}return s;}
export function effectTitle(effect:MysteryEffect){switch(effect.kind){case 'points':return `${effect.value>0?'+':''}${effect.value} POINTS`;case 'bomb':return 'BOMB!';case 'bombAll':return 'BOMB ALL!';case 'swap':return 'CHANGE!';case 'increase':return '+50%';case 'decrease':return '−50%';case 'rps':return 'ROCK · PAPER · SCISSORS';case 'finalChoice':return 'YOUR SUPERPOWER';}}
export function createMysteryGame(quiz:Quiz,names:string[],config:MysteryConfig,rng=Math.random):MysteryGame{
 if(names.length<2||names.length>6)throw new Error('Chọn từ 2 đến 6 đội.');
 if(!Number.isInteger(config.count)||config.count<1||config.count>100)throw new Error('Chọn từ 1 đến 100 ô.');
 if(!['numbers','letters'].includes(config.labels)||!Number.isInteger(config.seconds)||config.seconds<0||config.seconds>3600)throw new Error('Thiết lập ván chưa hợp lệ.');
 const needed=config.count+(config.finalBattle?3:0);if(quiz.questions.length<needed)throw new Error(`Cần ${needed} câu: ${config.count} câu chính${config.finalBattle?' và 3 câu Final Battle':''}.`);
 const source=structuredClone(quiz.questions);for(const q of source)if(validateQuestion(q).length)throw new Error('Bộ đề có câu hỏi chưa hợp lệ. Vui lòng sửa trong Kho đề.');
 // The supplied deck has a separate three-question finale. Preserve that separation.
 const original=quiz.id==='mystery-ppt';const main=shuffle(original?source.slice(0,24):source,rng);
 const final=original?source.slice(24):main.slice(config.count,config.count+3);
 if(original&&config.count>24)throw new Error('Bộ PPT mẫu có 24 ô chính.');
 const effects:MysteryEffect[]=[];while(effects.length<config.count)effects.push(...shuffle(structuredClone(originalEffects),rng));
 const finalEffects=shuffle<MysteryEffect>([{kind:'finalChoice'},{kind:'bomb'},{kind:'points',value:15}],rng);
 const cell=(question:Question,effect:MysteryEffect):MysteryCell=>({question,effect,used:false});
 return {version:1,quizId:quiz.id,quizTitle:quiz.title,config:{...config},teams:names.map((name,i)=>({name:name.trim().slice(0,50)||`Đội ${i+1}`,score:0,color:teamColors[i]})),cells:main.slice(0,config.count).map((q,i)=>cell(q,effects[i])),finalCells:config.finalBattle?final.slice(0,3).map((q,i)=>cell(q,finalEffects[i])):[],phase:'main',turn:0,round:null,logs:[],history:[],startedAt:new Date().toISOString()};
}
function remember(g:MysteryGame){const {history,...state}=g;const a=structuredClone(g);a.history=[...history.slice(-29),structuredClone(state)];return a;}
export function undoMystery(g:MysteryGame):MysteryGame{const prev=g.history.at(-1);return prev?{...structuredClone(prev),history:g.history.slice(0,-1)}:g;}
export function currentMysteryCell(g:MysteryGame){const r=g.round;return r?(r.final?g.finalCells:g.cells)[r.index]:undefined;}
function finish(g:MysteryGame){const cell=currentMysteryCell(g)!;cell.used=true;g.turn=(g.turn+1)%g.teams.length;g.round=null;if(g.phase==='final'&&g.finalCells.every(c=>c.used))g.phase='ended';else if(g.phase==='main'&&g.cells.every(c=>c.used)&&!g.config.finalBattle)g.phase='ended';return g;}
export type MysteryAction=
 |{type:'open';index:number}|{type:'showAnswer'}|{type:'select';index:number}|{type:'answerTeam';team:number}
 |{type:'grade';correct:boolean}|{type:'recipient';team:number}|{type:'reveal'}|{type:'unveil'}
 |{type:'resolve';target?:number;outcome?:'win'|'lose'|'draw';bonus?:boolean}|{type:'continue'}
 |{type:'final'}|{type:'end'}|{type:'score';team:number;score:number}|{type:'sound'}|{type:'motion'}|{type:'timer'}|{type:'tick'};
export function mysteryReduce(g:MysteryGame,action:MysteryAction):MysteryGame{
 const r=g.round;const teamValid=(i:number|undefined)=>i!==undefined&&Number.isInteger(i)&&i>=0&&i<g.teams.length;
 const change=(fn:(a:MysteryGame)=>void)=>{const a=remember(g);fn(a);return a;};
 if(action.type==='sound')return {...g,config:{...g.config,sound:!g.config.sound}};
 if(action.type==='motion')return {...g,config:{...g.config,motion:!g.config.motion}};
 if(action.type==='score'){if(r||g.phase==='ended'||!teamValid(action.team)||!Number.isFinite(action.score))return g;return change(a=>{const t=a.teams[action.team];t.score=Math.max(0,Math.min(1000000,Math.floor(action.score)));a.logs.push(`Sửa điểm ${t.name}: ${t.score}.`);});}
 if(action.type==='end'){if(r||g.phase==='ended')return g;return change(a=>{a.phase='ended';a.logs.push('Giáo viên kết thúc ván.');});}
 if(action.type==='final'){if(r||g.phase!=='main'||!g.config.finalBattle)return g;return change(a=>{a.phase='final';a.logs.push('Bắt đầu Final Battle.');});}
 if(action.type==='open'){
  const cells=g.phase==='final'?g.finalCells:g.cells;if(g.phase==='ended'||r||!Number.isInteger(action.index)||!cells[action.index]||cells[action.index].used)return g;
  return change(a=>{const q=(a.phase==='final'?a.finalCells:a.cells)[action.index].question;a.round={index:action.index,final:a.phase==='final',actor:a.turn,stage:'question',answerShown:false,selected:[],recipient:null,resolved:false,secondsLeft:q.seconds||a.config.seconds,timerRunning:false,before:a.teams.map(t=>t.score),message:''};});
 }
 if(!r)return g;
 if(action.type==='tick'){if(r.stage!=='question'||!r.timerRunning||r.secondsLeft<=0)return g;const a=structuredClone(g);a.round!.secondsLeft--;if(a.round!.secondsLeft===0)a.round!.timerRunning=false;return a;}
 if(action.type==='timer'){if(r.stage!=='question'||r.secondsLeft<=0)return g;return {...g,round:{...r,timerRunning:!r.timerRunning}};}
 if(action.type==='showAnswer'){if(r.stage!=='question'||r.answerShown)return g;return {...g,round:{...r,answerShown:true,timerRunning:false}};}
 if(action.type==='select'){const q=currentMysteryCell(g)?.question;if(r.stage!=='question'||r.answerShown||!Number.isInteger(action.index)||!(q?.type==='truefalse'?action.index>=0&&action.index<2:q?.options[action.index]))return g;return {...g,round:{...r,selected:q?.type==='truefalse'?[action.index]:r.selected.includes(action.index)?r.selected.filter(i=>i!==action.index):[...r.selected,action.index]}};}
 if(action.type==='answerTeam'){if(r.stage!=='question'||!teamValid(action.team))return g;return change(a=>{a.round!.actor=action.team;});}
 if(action.type==='grade'){
  if(r.stage!=='question')return g;
  return change(a=>{const c=currentMysteryCell(a)!;c.correct=action.correct;a.round!.timerRunning=false;a.round!.selected=[];if(action.correct){a.round!.stage=r.final?'sealed':'decision';if(r.final)a.round!.recipient=r.actor;}else{a.logs.push(`${a.teams[r.actor].name}: trả lời sai, không mở hộp.`);finish(a);}});
 }
 if(action.type==='recipient'){if(r.stage!=='decision'||!teamValid(action.team))return g;return change(a=>{a.round!.recipient=action.team;a.round!.stage='sealed';a.logs.push(`${a.teams[r.actor].name} ${r.actor===action.team?'giữ hộp':'đưa hộp cho '+a.teams[action.team].name}.`);});}
 if(action.type==='reveal'){if(r.stage!=='sealed'||r.recipient===null)return g;return change(a=>{a.round!.stage='revealing';});}
 if(action.type==='unveil'){
  if(r.stage!=='revealing'||r.recipient===null)return g;
  // Reveal and scoring are a single idempotent transaction, including all-team bombs.
  const a=structuredClone(g),round=a.round!,effect=currentMysteryCell(a)!.effect,t=a.teams[r.recipient];round.stage='result';
  switch(effect.kind){case 'points':t.score=Math.max(0,t.score+effect.value);break;case 'bomb':t.score=0;break;case 'bombAll':a.teams.forEach(team=>team.score=0);break;case 'increase':t.score=Math.floor(t.score*1.5);break;case 'decrease':t.score=Math.floor(t.score*.5);break;default:return a;}
  round.resolved=true;round.message=effect.kind==='bombAll'?'Tất cả các đội mất toàn bộ điểm!':`${t.name}: ${effectTitle(effect)}.`;a.logs.push(round.message);return a;
 }
 if(action.type==='resolve'){
  if(r.stage!=='result'||r.resolved||r.recipient===null)return g;const effect=currentMysteryCell(g)!.effect;
  const target=action.target;if(effect.kind==='swap'||effect.kind==='rps'||(effect.kind==='finalChoice'&&!action.bonus)){if(!teamValid(target)||target===r.recipient)return g;}
  if(effect.kind==='rps'&&!['win','lose','draw'].includes(action.outcome??''))return g;
  if(!['swap','rps','finalChoice'].includes(effect.kind))return g;
  return change(a=>{const t=a.teams[r.recipient!],op=target===undefined?undefined:a.teams[target];let message='';
   if(effect.kind==='swap'){[t.score,op!.score]=[op!.score,t.score];message=`${t.name} đổi điểm với ${op!.name}.`;}
   else if(effect.kind==='rps'){const delta=action.outcome==='win'?5:action.outcome==='lose'?-5:0;t.score=Math.max(0,t.score+delta);op!.score=Math.max(0,op!.score-delta);message=`Oẳn tù tì: ${t.name} ${action.outcome==='win'?'thắng':action.outcome==='lose'?'thua':'hòa'} ${op!.name} (thắng +5, thua −5).`;}
   else if(action.bonus){t.score+=5;message=`${t.name} chọn +5 điểm.`;}else{op!.score=0;message=`${t.name} chọn xóa toàn bộ điểm ${op!.name}.`;}
   a.round!.resolved=true;a.round!.message=message;a.logs.push(message);
  });
 }
 if(action.type==='continue'){if(r.stage!=='result'||!r.resolved)return g;return finish(remember(g));}
 return g;
}
