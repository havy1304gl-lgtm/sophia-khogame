import {test} from 'node:test';
import assert from 'node:assert/strict';
import {framePlinkoBalls,easePlinkoCamera,wholePlinkoBoard} from '../lib/plinko-camera.ts';
import {makeObstacles,simulatePlinko} from '../lib/picker-plinko.ts';
test('the camera follows every current ball across terrain and viewport shapes',()=>{
 for(const terrain of ['pegs','zigzag','pinball','mixed'] as const){const paths=simulatePlinko(24,[2,5],makeObstacles(terrain,'normal'),10,'camera');for(const aspect of [.7,1.5,2.8])for(let i=0;i<paths[0].length;i+=7){const points=paths.map(p=>p[i]),frame=framePlinkoBalls(points,aspect,i>400);assert.ok(frame.x>=0&&frame.y>=0&&frame.x+frame.width<=1000.001&&frame.y+frame.height<=1100.001);for(const p of points)assert.ok(p.x>=frame.x&&p.x<=frame.x+frame.width&&p.y>=frame.y&&p.y<=frame.y+frame.height);}}
});
test('group framing zooms into occupied areas and includes finish labels at arrival',()=>{const top=framePlinkoBalls([{x:400,y:40},{x:500,y:60}],1.8),bottom=framePlinkoBalls([{x:475,y:1045},{x:800,y:1045}],1.8,true);assert.ok(top.height<wholePlinkoBoard.height);assert.ok(bottom.y>top.y+500);assert.ok(bottom.y+bottom.height>=1100);assert.deepEqual(framePlinkoBalls([],1),wholePlinkoBoard);});
test('smooth camera tracking has no overshoot and is independent of frame rate',()=>{const target={x:150,y:700,width:600,height:400};let a={...wholePlinkoBoard},b={...wholePlinkoBoard};for(let i=0;i<30;i++)a=easePlinkoCamera(a,target,1/30);for(let i=0;i<60;i++)b=easePlinkoCamera(b,target,1/60);for(const key of ['x','y','width','height'] as const){assert.ok(Math.abs(a[key]-b[key])<.0001);assert.ok(a[key]>=Math.min(wholePlinkoBoard[key],target[key])&&a[key]<=Math.max(wholePlinkoBoard[key],target[key]));}});
