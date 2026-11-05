import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chooseFreshDialogue,buildUfoBeats,type DialogueLine} from '../lib/picker-dialogue.ts';
import {makeCallPlan,callFrame} from '../lib/picker-call.ts';
import {defaultPickerSettings,normalizePickerSettings,updatePickerSettings} from '../lib/student-picker.ts';
test('a round never repeats text, even when custom lines duplicate it under other groups or IDs',()=>{
 const lines:DialogueLine[]=[{id:'a',group:'notice',text:' Hello  there! ',enabled:true},{id:'b',group:'caught',text:'hello there!',enabled:true},{id:'c',group:'notice',text:'Another line',enabled:true}],used=new Set<string>();
 assert.equal(chooseFreshDialogue(lines,'notice',used,()=>0)?.id,'a');assert.equal(chooseFreshDialogue(lines,'caught',used,()=>0),null);assert.equal(chooseFreshDialogue(lines,'notice',used,()=>0)?.id,'c');assert.equal(chooseFreshDialogue(lines,'notice',used),null);
 assert.equal(chooseFreshDialogue(lines,'notice',new Set(),()=>0)?.id,'a');
});
test('multi-student UFO beats exhaust dialogue without replaying earlier lines',()=>{
 const lines:DialogueLine[]=[{id:'a',group:'notice',text:'Look up!',enabled:true},{id:'b',group:'caught',text:'Here we go!',enabled:true}],used=new Set<string>(),students=Array.from({length:5},(_,i)=>({id:String(i),name:'Student '+i,number:String(i),present:true}));
 const plan=buildUfoBeats(students,defaultPickerSettings,'Class',g=>chooseFreshDialogue(lines,g,used,()=>0));const spoken=plan.beats.flat().map(b=>b.text).filter(Boolean);assert.equal(spoken.length,2);assert.equal(new Set(spoken).size,spoken.length);
});
test('connected calls keep counting while greeting cues remain early; failed calls never connect',()=>{
 for(const n of [.1,.9]){const yes=makeCallPlan(true,()=>n),no=makeCallPlan(false,()=>n);assert.equal(yes.seconds,n<.5?1:2);let max=0;for(let t=0;t<=yes.finishAt+.5;t+=.05){const f=callFrame(yes,t);max=Math.max(max,f.seconds??0);}assert.ok(max>=yes.seconds);assert.equal(callFrame(yes,yes.connectAt+65.9).seconds,65);assert.equal(callFrame(yes,yes.finishAt).finished,true);for(let t=0;t<no.finishAt+1;t+=.1){assert.equal(callFrame(no,t).connected,false);assert.equal(callFrame(no,t).seconds,null);}}
 assert.equal(makeCallPlan(false,()=>.1).failure,'declined');assert.equal(makeCallPlan(false,()=>.9).failure,'unanswered');
});
test('UFO time-of-day preferences survive mode switches and old settings remain compatible',()=>{
 let s=normalizePickerSettings({});assert.equal(s.timeOfDay,'morning');s=updatePickerSettings(s,{timeOfDay:'night'});s=updatePickerSettings(s,{mode:'street'});assert.equal(s.timeOfDay,'morning');s=updatePickerSettings(s,{timeOfDay:'afternoon'});s=updatePickerSettings(s,{mode:'pasture'});assert.equal(s.timeOfDay,'night');s=updatePickerSettings(s,{mode:'street'});assert.equal(s.timeOfDay,'afternoon');
});
