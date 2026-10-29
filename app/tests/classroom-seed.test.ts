import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cleanClassroomSeed,initializePickerClasses,type ClassroomSeed} from '../lib/classroom-seed.ts';
import {handleClassroomSeed} from '../server/classroom-seed-handler.ts';
const seed:ClassroomSeed={version:1,classes:[{sourceId:'aura-guild:class-a',name:'Lớp A',students:[{name:'Học sinh A',number:'07'}]}]};
test('default classes are editable, initialize once and preserve saved edits and deletions',()=>{
 const first=initializePickerClasses([],'',[],seed);assert.equal(first.classes.length,1);assert.equal(first.classes[0].students[0].number,'07');
 first.classes[0].students[0].name='Tên đã sửa';first.classes[0].students[0].present=false;
 const again=initializePickerClasses(first.classes,first.selected,first.seedSources,seed);assert.equal(again.added,0);assert.equal(again.classes[0].students[0].name,'Tên đã sửa');assert.equal(again.classes[0].students[0].present,false);
 const removed=initializePickerClasses([],'',first.seedSources,seed);assert.equal(removed.added,0);assert.ok(removed.classes.every(c=>c.sourceId!=='aura-guild:class-a'));
 const expanded=initializePickerClasses(again.classes,again.selected,again.seedSources,{version:1,classes:[...seed.classes,{...seed.classes[0],sourceId:'aura-guild:class-b',name:'Lớp B'}]});assert.equal(expanded.added,1);assert.equal(expanded.classes[0].students[0].name,'Tên đã sửa');
});
test('default payload contains only class names, source keys and student names/numbers',()=>{const raw={classes:[{...seed.classes[0],score:99,notes:'private',students:[{...seed.classes[0].students[0],score:80,notes:'private',avatar:'private',id:'private'}]}]};assert.deepEqual(cleanClassroomSeed(raw),seed);assert.throws(()=>cleanClassroomSeed({classes:[seed.classes[0],seed.classes[0]]}));});
test('rosters require a live session and only admins can publish',async()=>{
 let reads=0,writes=0;const deps={authorize:async(token:string)=>token==='admin'?'admin' as const:token==='player'?'player' as const:null,load:async()=>{reads++;return seed;},save:async()=>{writes++;}};
 const anonymous=await handleClassroomSeed(new Request('https://example.com/.netlify/functions/classroom-seed'),deps);assert.equal(anonymous.status,401);assert.equal(reads,0);
 const expired=await handleClassroomSeed(new Request('https://example.com/.netlify/functions/classroom-seed',{headers:{authorization:'Bearer expired'}}),deps);assert.equal(expired.status,401);
 const player=await handleClassroomSeed(new Request('https://example.com/.netlify/functions/classroom-seed',{headers:{authorization:'Bearer player'}}),deps);assert.equal(player.status,200);assert.deepEqual(await player.json(),seed);assert.equal(player.headers.get('cache-control'),'private, no-store');
 const denied=await handleClassroomSeed(new Request('https://example.com/.netlify/functions/classroom-seed',{method:'POST',headers:{authorization:'Bearer player','content-type':'application/json'},body:JSON.stringify(seed)}),deps);assert.equal(denied.status,403);assert.equal(writes,0);
 const saved=await handleClassroomSeed(new Request('https://example.com/.netlify/functions/classroom-seed',{method:'POST',headers:{authorization:'Bearer admin','content-type':'application/json'},body:JSON.stringify(seed)}),deps);assert.equal(saved.status,200);assert.equal(writes,1);
 const cross=await handleClassroomSeed(new Request('https://example.com/.netlify/functions/classroom-seed',{headers:{authorization:'Bearer admin',origin:'https://other.com'}}),deps);assert.equal(cross.status,403);
});
