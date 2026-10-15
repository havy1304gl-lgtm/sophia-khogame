import {test} from 'node:test';import assert from 'node:assert/strict';
import {chooseTeamHero,resolveTeamHeroes} from '../lib/team-heroes.ts';
import {createGame,missionSamples,presets} from '../lib/engine.ts';
import {demo} from '../lib/demo.ts';
test('Two through six teams receive distinct valid images, including old configurations without image preferences',()=>{for(let count=2;count<=6;count++){const g=createGame(demo,Array.from({length:count},(_,i)=>'Team '+i),{count:9,seconds:30,negative:false,weights:presets.balanced,pkWin:5,pkLose:3,pkDraw:1,missions:missionSamples,sound:false,motion:false});assert.equal(new Set(g.teams.map(t=>t.hero)).size,count);}});
test('Choosing an occupied hero swaps images without mutating or duplicating the original choices',()=>{const ids=resolveTeamHeroes(6),changed=chooseTeamHero(ids,0,'guardian-sky');assert.equal(changed[0],'guardian-sky');assert.equal(changed[3],'ironman');assert.equal(ids[0],'ironman');assert.equal(new Set(changed).size,6);assert.equal(chooseTeamHero(ids,0,'missing'),ids);});
test('Saved image preferences preserve valid choices and repair unknown or duplicate entries',()=>{const ids=resolveTeamHeroes(6,['guardian-jade','cap','cap','unknown']);assert.equal(ids[0],'guardian-jade');assert.equal(ids[1],'cap');assert.equal(new Set(ids).size,6);});
