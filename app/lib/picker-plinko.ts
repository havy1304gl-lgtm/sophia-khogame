export type Terrain='pegs'|'zigzag'|'pinball'|'mixed';
export type Obstacle={kind:'peg'|'bumper'|'bar'|'rotor';x:number;y:number;r:number;length?:number;angle?:number;speed?:number};
export type BallFrame={x:number;y:number;hit:boolean};
export const plinkoWidth=1000,plinkoHeight=1100;
function seeded(seed:string){let state=2166136261;for(const ch of seed)state=Math.imul(state^ch.charCodeAt(0),16777619);return()=>{state+=0x6D2B79F5;let t=state;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function makeObstacles(terrain:Terrain,density:'light'|'normal'|'dense'):Obstacle[]{const out:Obstacle[]=[],rows=density==='light'?5:density==='dense'?9:7,cols=density==='dense'?13:density==='light'?8:10;
 if(terrain==='pegs'||terrain==='mixed')for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){const x=65+col*(870/(cols-1))+(row%2?25:-10),y=110+row*(460/(rows-1));if(terrain==='mixed'&&(row%3===1&&col>1&&col<cols-2))continue;out.push({kind:'peg',x,y,r:terrain==='mixed'?11:13});}
 if(terrain==='zigzag')for(let row=0,total=density==='light'?3:density==='dense'?6:5;row<total;row++){out.push({kind:'bar',x:row%2?680:320,y:120+row*(440/(total-1)),r:9,length:440,angle:row%2?-.2:.2});for(let i=0;i<3;i++)out.push({kind:'peg',x:row%2?110+i*65:760+i*65,y:160+row*(440/(total-1)),r:11});}
 if(terrain==='pinball'||terrain==='mixed'){for(let i=0,total=terrain==='pinball'?(density==='light'?6:density==='dense'?14:10):(density==='light'?2:density==='dense'?6:4);i<total;i++)out.push({kind:'bumper',x:140+(i%4)*240+(Math.floor(i/4)%2)*45,y:130+Math.floor(i/4)*(380/Math.max(1,Math.ceil(total/4)-1))+(i%2)*45,r:terrain==='pinball'?24:19});for(let i=0;i<3;i++)out.push({kind:'rotor',x:240+i*260,y:terrain==='pinball'?465-i%2*160:300+i%2*180,r:8,length:terrain==='pinball'?160:130,angle:i*1.1,speed:(i%2?-.7:.65)});}
 return out.map(o=>({...o,y:o.y*1.4}));
}
export function obstacleSegment(o:Obstacle,time:number){const a=(o.angle??0)+(o.speed??0)*time,half=(o.length??0)/2;return{x1:o.x-Math.cos(a)*half,y1:o.y-Math.sin(a)*half,x2:o.x+Math.cos(a)*half,y2:o.y+Math.sin(a)*half};}
// Fixed-step collision paths; the final funnel preserves the independent fair draw.
export function simulatePlinko(count:number,winnerIndices:number[],obstacles:Obstacle[],radius:number,seed:string):BallFrame[][]{const random=seeded(seed),paths:BallFrame[][]=[];const fps=30,seconds=14,dt=1/90;
 for(let i=0;i<count;i++){let x=70+random()*860,y=24+random()*25,vx=(random()-.5)*100,vy=0,hit=false;const path:BallFrame[]=[],delay=(i%9)*.11;let funnelX=0,funnelY=0;const rank=winnerIndices.indexOf(i),dest=rank>=0?470+(rank+.5)/Math.max(1,winnerIndices.length)*60:(i%2?90:800)+random()*110;
  for(let frame=0;frame<=seconds*fps;frame++){const time=frame/fps;hit=false;
   if(time>=delay&&time<=11){for(let step=0;step<3;step++){const at=time+step*dt;vy=Math.min(500,vy+460*dt);x+=vx*dt;y+=vy*dt;vx*=.998;
     if(x<25+radius){x=25+radius;vx=Math.abs(vx)*.83;}if(x>975-radius){x=975-radius;vx=-Math.abs(vx)*.83;}
     for(const o of obstacles){let nx=x-o.x,ny=y-o.y,limit=radius+o.r;if(o.kind==='bar'||o.kind==='rotor'){const seg=obstacleSegment(o,at),dx=seg.x2-seg.x1,dy=seg.y2-seg.y1,t=Math.max(0,Math.min(1,((x-seg.x1)*dx+(y-seg.y1)*dy)/(dx*dx+dy*dy)));nx=x-(seg.x1+t*dx);ny=y-(seg.y1+t*dy);}
      const dist=Math.hypot(nx,ny);if(dist<limit&&dist>.0001){nx/=dist;ny/=dist;x+=nx*(limit-dist+.2);y+=ny*(limit-dist+.2);const impact=vx*nx+vy*ny;if(impact<0){const bounce=o.kind==='bumper'?1.05:.8;vx-=(1+bounce)*impact*nx;vy-=(1+bounce)*impact*ny;if(o.kind==='rotor')vx+=(o.speed??0)*35;hit=true;}}
     }
     if(y>935){y=935;vy=-Math.abs(vy)*.35;vx+=(500-x)*.0005;}
     if(!Number.isFinite(x+y+vx+vy)){x=500;y=50;vx=20;vy=0;}
    }funnelX=x;funnelY=y;
   }else if(time>11){const p=Math.min(1,(time-11)/3),ease=p*p*(3-2*p);x=funnelX+(dest-funnelX)*ease;y=funnelY+(1045-funnelY)*ease;}
   path.push({x:Math.max(radius,Math.min(1000-radius,x)),y:Math.max(radius,Math.min(1080,y)),hit});
  }paths.push(path);
 }return paths;
}
