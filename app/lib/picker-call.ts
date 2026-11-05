export type CallPlan={accepted:boolean;connectAt:number;finishAt:number;seconds:1|2;failure:'declined'|'unanswered'};
export function makeCallPlan(accepted:boolean,random:()=>number=Math.random):CallPlan{const seconds=random()<.5?1:2,connectAt=1.6+random()*.9;return {accepted,seconds,connectAt,finishAt:accepted?connectAt+seconds+.65:4+random()*2,failure:random()<.5?'declined':'unanswered'};}
export function callFrame(plan:CallPlan,clock:number){const connected=plan.accepted&&clock>=plan.connectAt;return {connected,finished:clock>=plan.finishAt,seconds:connected?Math.max(0,Math.floor(clock-plan.connectAt)):null};}

export function formatCallClock(seconds:number){const value=Math.max(0,Math.floor(seconds));return `${String(Math.floor(value/60)).padStart(2,'0')}:${String(value%60).padStart(2,'0')}`;}
export function formatCallDuration(seconds:number){const value=Math.max(0,Math.floor(seconds));return `${Math.floor(value/60)} phút ${value%60} giây`;}
