export type CameraFrame={x:number;y:number;width:number;height:number};
type Point={x:number;y:number};
const boardWidth=1000,boardHeight=1100;
export const wholePlinkoBoard:CameraFrame={x:0,y:0,width:boardWidth,height:boardHeight};
// Fit every current ball, never a preselected winner. Leave room for name labels.
export function framePlinkoBalls(points:readonly Point[],aspect:number,finish=false):CameraFrame{
 if(!points.length)return {...wholePlinkoBoard};
 const safe=points.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y));if(!safe.length)return {...wholePlinkoBoard};
 const ratio=Number.isFinite(aspect)&&aspect>0?aspect:1.5;
 let left=Math.min(...safe.map(p=>p.x))-85,right=Math.max(...safe.map(p=>p.x))+85;
 let top=Math.min(...safe.map(p=>p.y))-75,bottom=Math.max(...safe.map(p=>p.y))+65;
 if(finish){bottom=boardHeight;left=Math.min(left,360);right=Math.max(right,640);}
 let width=Math.max(460,right-left),height=Math.max(310,bottom-top);
 width=Math.min(boardWidth,Math.max(width,height*ratio));height=Math.min(boardHeight,Math.max(height,width/ratio));
 const x=Math.max(0,Math.min(boardWidth-width,(left+right-width)/2));
 const y=Math.max(0,Math.min(boardHeight-height,(top+bottom-height)/2));
 return {x,y,width,height};
}
export function easePlinkoCamera(previous:CameraFrame,target:CameraFrame,seconds:number):CameraFrame{
 const amount=1-Math.exp(-Math.max(0,Math.min(.2,seconds))*7);
 return {x:previous.x+(target.x-previous.x)*amount,y:previous.y+(target.y-previous.y)*amount,width:previous.width+(target.width-previous.width)*amount,height:previous.height+(target.height-previous.height)*amount};
}
