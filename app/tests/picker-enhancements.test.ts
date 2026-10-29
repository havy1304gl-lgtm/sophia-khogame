import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resetClassCalls,normalizePickerSettings,type PickRecord} from '../lib/student-picker.ts';
import {pickerMusic} from '../lib/picker-audio.ts';
import {makeObstacles,simulatePlinko,plinkoHeight} from '../lib/picker-plinko.ts';
test('reset opens the selected class again while retaining other class calls and all history',()=>{
 const records=[{id:'one',classId:'a',session:'today',at:'2026-10-29',mode:'quick',students:[]},{id:'two',classId:'b',session:'today',at:'2026-10-29',mode:'quick',students:[]},{id:'old',classId:'a',session:'yesterday',at:'2026-10-28',mode:'quick',students:[]}] as PickRecord[];
 const next=resetClassCalls(records,'a','today','reset');assert.equal(next.length,3);assert.equal(next.filter(r=>r.classId==='a'&&r.session==='reset').length,0);assert.equal(next.filter(r=>r.classId==='b'&&r.session==='reset').length,1);assert.equal(next[2],records[2]);assert.equal(records[1].session,'today');
});
test('music and effects have independent volume controls, including mute and old save migration',()=>{const old=normalizePickerSettings({music:false});assert.equal(old.music,false);assert.equal(old.musicVolume,40);assert.equal(old.soundVolume,65);const mute=normalizePickerSettings({musicVolume:0,soundVolume:500});assert.equal(mute.musicVolume,0);assert.equal(mute.soundVolume,100);});
test('all six calling modes have distinct original loops in a comfortable pitch range',()=>{assert.equal(Object.keys(pickerMusic).length,6);assert.equal(new Set(Object.values(pickerMusic).map(t=>t.notes.join(','))).size,6);for(const theme of Object.values(pickerMusic)){assert.ok(theme.bpm>=70&&theme.bpm<=150);assert.ok(theme.notes.every(n=>n===0||n>=60&&n<=90));assert.ok(theme.bass.every(n=>n>=36&&n<=60));}});
test('the longer Plinko board keeps collisions and finish zones inside its bounds',()=>{assert.equal(plinkoHeight,1100);for(const terrain of ['pegs','zigzag','pinball','mixed'] as const){const obstacles=makeObstacles(terrain,'dense');assert.ok(Math.max(...obstacles.map(o=>o.y))>600);const paths=simulatePlinko(8,[2],obstacles,10,'long-board');assert.ok(paths.some(path=>path.some(p=>p.hit)));assert.ok(paths.every(path=>path.every(p=>Number.isFinite(p.y)&&p.y>=10&&p.y<=plinkoHeight)));assert.ok(paths[2].at(-1)!.x>450&&paths[2].at(-1)!.x<550);}});
