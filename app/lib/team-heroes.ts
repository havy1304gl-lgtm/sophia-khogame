export const teamHeroes=[
 {id:'ironman',name:'Iron Man'}, {id:'cap',name:'Captain America'}, {id:'panther',name:'Black Panther'},
 {id:'guardian-sky',name:'Sky Guardian'}, {id:'guardian-solar',name:'Solar Guardian'}, {id:'guardian-jade',name:'Jade Guardian'},
];
export function resolveTeamHeroes(count:number,requested:string[]=[]){const used=new Set<string>();return Array.from({length:count},(_,i)=>{const hero=teamHeroes.some(h=>h.id===requested[i])&&!used.has(requested[i])?requested[i]:teamHeroes.find(h=>!used.has(h.id))!.id;used.add(hero);return hero;});}
export function chooseTeamHero(current:string[],index:number,hero:string){if(index<0||index>=current.length||!teamHeroes.some(h=>h.id===hero))return current;const next=[...current],other=next.findIndex((id,i)=>i!==index&&id===hero);if(other>=0)next[other]=next[index];next[index]=hero;return next;}
