import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGame,openRound,replaceQuestion,undo,grade,presets,missionSamples,type Config} from '../lib/engine.ts';
import {createMysteryGame,defaultMysteryConfig,mysteryReduce as step,undoMystery} from '../lib/mystery-engine.ts';
import {demo} from '../lib/demo.ts';
import {mysteryDemo} from '../lib/mystery-demo.ts';
import {musicTracks,normalizeMusic} from '../lib/music-profile.ts';
const config:Config={count:9,seconds:30,timerEnabled:false,negative:false,weights:presets.balanced,pkWin:5,pkLose:3,pkDraw:1,missions:missionSamples,sound:false,motion:false};

test('Avengers changes only question; rewards, event, teams and undo remain intact',()=>{
 const g=openRound(createGame(demo,['A','B'],config),0),next=g.spare[0],old=g.cells[0].question;
 const changed=replaceQuestion(g,next.id);assert.equal(changed.cells[0].question.id,next.id);assert.equal(changed.cells[0].reward,g.cells[0].reward);assert.equal(changed.cells[0].event,g.cells[0].event);assert.deepEqual(changed.cells[0].choiceOutcomes,g.cells[0].choiceOutcomes);assert.deepEqual(changed.teams,g.teams);assert.equal(changed.turn,g.turn);assert(changed.spare.some(q=>q.id===old.id));assert(!changed.spare.some(q=>q.id===next.id));
 const restored=undo(changed);assert.equal(restored.cells[0].question.id,old.id);assert.deepEqual(restored.spare,g.spare);
});
test('Avengers cannot replace revealed, previously revealed, graded or used questions',()=>{
 const g=openRound(createGame(demo,['A','B'],config),0),id=g.spare[0].id;
 assert.strictEqual(replaceQuestion({...g,round:{...g.round!,answerShown:true}},id).round?.answerShown,true);
 const seen={...g,round:{...g.round!,answerSeen:true,answerShown:false}};assert.strictEqual(replaceQuestion(seen,id),seen);
 assert.strictEqual(replaceQuestion(g,g.cells[1].question.id),g);const graded=grade(g,0,false);assert.strictEqual(replaceQuestion(graded,id),graded);
});
test('Disabled Avengers clock ignores per-question time; replacement resets selections and stops timer',()=>{
 const g=openRound(createGame({...demo,questions:demo.questions.map(q=>({...q,seconds:90}))},['A','B'],config),0);assert.equal(g.round?.timer,0);
 const active={...g,config:{...g.config,timerEnabled:true},round:{...g.round!,timerRunning:true,selectedOption:1,selectedOptions:[1]}};
 const changed=replaceQuestion(active,active.spare[0].id);assert.equal(changed.round?.timer,90);assert.equal(changed.round?.timerRunning,false);assert.deepEqual(changed.round?.selectedOptions,[]);
});
test('Mystery reserves final questions outside replacement pool and never reassigns outcomes',()=>{
 let g=createMysteryGame(demo,['A','B'],{...defaultMysteryConfig,count:12});assert.equal(g.spare?.length,15);const finalIds=new Set(g.finalCells.map(c=>c.question.id));assert(g.spare!.every(q=>!finalIds.has(q.id)));
 g=step(g,{type:'open',index:0});const effect=g.cells[0].effect,old=g.cells[0].question,id=g.spare![0].id;const changed=step(g,{type:'replace',id});assert.equal(changed.cells[0].question.id,id);assert.deepEqual(changed.cells[0].effect,effect);assert.equal(changed.round?.actor,g.round?.actor);assert.equal(undoMystery(changed).cells[0].question.id,old.id);
 assert.strictEqual(step(changed,{type:'replace',id:g.finalCells[0].question.id}),changed);
 const final=step(step(createMysteryGame(demo,['A','B'],{...defaultMysteryConfig,count:12}),{type:'final'}),{type:'open',index:0});assert.notEqual(step(final,{type:'replace',id:final.spare![0].id}).finalCells[0].question.id,final.finalCells[0].question.id);
});
test('Mystery defaults to no clock even with timed questions, explicit enable/reset works',()=>{
 let g=createMysteryGame({...demo,questions:demo.questions.map(q=>({...q,seconds:90}))},['A','B'],{...defaultMysteryConfig,count:12});g=step(g,{type:'open',index:0});assert.equal(g.round?.secondsLeft,0);assert.strictEqual(step(g,{type:'timer'}),g);
 g=step(g,{type:'timerEnabled',enabled:true});assert.equal(g.round?.secondsLeft,90);g=step(step(g,{type:'timer'}),{type:'tick'});assert.equal(g.round?.secondsLeft,89);g=step(g,{type:'timerReset'});assert.equal(g.round?.secondsLeft,90);assert.equal(g.round?.timerRunning,false);
 g=step(g,{type:'timerEnabled',enabled:false});assert.equal(g.round?.secondsLeft,0);assert.strictEqual(step(g,{type:'tick'}),g);
});
test('Mystery hidden-again answer stays ineligible for replacement; partial never reveals box',()=>{
 let g=step(createMysteryGame(mysteryDemo,['A','B'],{...defaultMysteryConfig,count:12}),{type:'open',index:0});g=step(step(g,{type:'showAnswer'}),{type:'hideAnswer'});assert.equal(g.round?.answerShown,false);assert.equal(g.round?.answerSeen,true);assert.strictEqual(step(g,{type:'replace',id:g.spare![0].id}),g);
 const partial=step(g,{type:'partial',points:2});assert.equal(partial.teams[0].score,2);assert.equal(partial.round,null);assert.equal(partial.cells[0].used,true);assert.equal(partial.turn,1);assert.equal(undoMystery(partial).round?.stage,'question');
});
test('Mystery music source and seek limits are independent from Avengers',()=>{assert.notEqual(musicTracks.mystery.src,musicTracks.avengers.src);assert.equal(normalizeMusic({},'mystery').introStart,0);assert.equal(normalizeMusic({introStart:999},'mystery').introStart,musicTracks.mystery.duration-5);assert.equal(normalizeMusic().introStart,78);});
