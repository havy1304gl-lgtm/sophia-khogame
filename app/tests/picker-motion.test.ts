import {test} from 'node:test';
import assert from 'node:assert/strict';
import {wander,pickerDay,dailySession} from '../lib/picker-motion.ts';
test('wandering stays in the field, repeats deterministically and varies by character',()=>{
 for(let i=0;i<40;i++)for(let t=0;t<120;t+=.3){const p=wander('round',i,t);assert.ok(p.x>=7&&p.x<=93&&p.y>=51&&p.y<=85);assert.deepEqual(p,wander('round',i,t));}
 assert.notDeepEqual(wander('round',0,8),wander('round',1,8));assert.notDeepEqual(wander('round',0,8),wander('other',0,8));
});
test('wandering is continuous across route changes',()=>{for(let t=1;t<100;t++){const a=wander('round',2,t),b=wander('round',2,t+.001);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<.1);}});
test('day follows the local calendar and resets an old manual session',()=>{
 assert.equal(pickerDay(new Date(2026,9,29,0,0)), '2026-10-29');
 assert.equal(dailySession('manual','2026-10-28',[],'2026-10-29'),'2026-10-29');
 assert.equal(dailySession('manual','2026-10-29',[],'2026-10-29'),'manual');
 assert.equal(dailySession('2026-10-28',undefined,[],'2026-10-29'),'2026-10-29');
 assert.equal(dailySession('old-uuid',undefined,[{at:new Date(2026,9,28,15).toISOString()}],'2026-10-29'),'2026-10-29');
});

test('routes spread characters across both axes without a diagonal pattern',()=>{const ps=Array.from({length:40},(_,i)=>wander('round',i,0));const mx=ps.reduce((s,p)=>s+p.x,0)/ps.length,my=ps.reduce((s,p)=>s+p.y,0)/ps.length;const cov=ps.reduce((s,p)=>s+(p.x-mx)*(p.y-my),0),vx=ps.reduce((s,p)=>s+(p.x-mx)**2,0),vy=ps.reduce((s,p)=>s+(p.y-my)**2,0);assert.ok(Math.abs(cov/Math.sqrt(vx*vy))<.6);});
