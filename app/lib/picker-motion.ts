// Each character follows its own seeded wandering route, with smooth turns.
function random(seed:string,index:number){let n=2166136261;for(const c of seed+':'+index)n=Math.imul(n^c.charCodeAt(0),16777619);n=Math.imul(n^(n>>>16),0x85ebca6b);n=Math.imul(n^(n>>>13),0xc2b2ae35);return ((n^(n>>>16))>>>0)/4294967296;}
export function wander(seed:string,index:number,time:number){
 const duration=7+random(seed,index*9)*8,clock=Math.max(0,time)/duration+random(seed,index*9+1)*10,step=Math.floor(clock),u=clock-step,ease=u*u*(3-2*u);
 const point=(s:number)=>({x:7+random(seed+':'+index,s*2)*86,y:51+random(seed+':'+index,s*2+1)*34});
 const a=point(step),b=point(step+1);return{x:a.x+(b.x-a.x)*ease,y:a.y+(b.y-a.y)*ease,direction:b.x<a.x?-1:1};
}
export function pickerDay(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function dailySession(session:string|undefined,savedDay:string|undefined,records:{at:string}[],today=pickerDay()){
 const previous=savedDay??(session&&/^\d{4}-\d{2}-\d{2}$/.test(session)?session:records[0]?.at?pickerDay(new Date(records[0].at)):today);
 return previous===today?(session||today):today;
}
