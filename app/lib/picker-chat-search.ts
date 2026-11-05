import type {Student} from './student-picker';
export function searchKey(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim();}
export function filterChatContacts(students:Student[],query:string){const key=searchKey(query);return key?students.filter(s=>searchKey(s.name+' '+s.number).includes(key)):students;}
export function contactSearchFrame(name:string,time:number){const start=.6,duration=Math.max(1.6,Math.min(3.5,name.length*.07)),end=start+duration;return {query:name.slice(0,Math.floor(name.length*Math.max(0,Math.min(1,(time-start)/duration)))),typing:time<end,clicking:time>end+.45,done:time>=end+.9};}
