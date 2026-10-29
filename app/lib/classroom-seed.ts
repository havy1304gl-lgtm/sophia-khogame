import {restoreClasses,sampleClass,type SchoolClass} from './student-picker.ts';
export type ClassroomSeed={version:1;classes:{sourceId:string;name:string;students:{name:string;number:string}[]}[]};
// Only roster fields are published. Scores, notes, avatars and backup metadata stay out.
export function cleanClassroomSeed(value:unknown):ClassroomSeed{
 if(!value||typeof value!=='object')throw new Error('Danh sách lớp không hợp lệ.');
 const classes=(value as {classes?:unknown}).classes;if(!Array.isArray(classes)||!classes.length||classes.length>100)throw new Error('Cần từ 1 đến 100 lớp.');
 const sources=new Set<string>();
 return {version:1,classes:classes.map((c:Record<string,unknown>)=>{
  if(!c||typeof c.name!=='string'||!c.name.trim()||c.name.length>100||typeof c.sourceId!=='string'||!/^aura-guild:[\w-]{1,180}$/.test(c.sourceId)||sources.has(c.sourceId)||!Array.isArray(c.students)||!c.students.length||c.students.length>200)throw new Error('Lớp mặc định thiếu tên, mã nguồn hoặc có danh sách không hợp lệ.');
  sources.add(c.sourceId);return {sourceId:c.sourceId,name:c.name,students:c.students.map((s:Record<string,unknown>,i:number)=>{if(!s||typeof s.name!=='string'||!s.name.trim()||s.name.length>100)throw new Error('Tên học sinh không hợp lệ.');const number=String(s.number??i+1);if(number.length>12)throw new Error('Số thứ tự quá dài.');return{name:s.name,number};})};
 })};
}
export function initializePickerClasses(existing:SchoolClass[],selected:string,remembered:string[],seed:ClassroomSeed|null){
 const seen=new Set([...remembered,...existing.map(c=>c.sourceId).filter((s):s is string=>!!s)]),pending=seed?.classes.filter(c=>!seen.has(c.sourceId))??[],incoming=pending.length?restoreClasses(pending.map(c=>({...c,students:c.students.map(s=>({...s,present:true}))}))):[];
 const classes=[...existing,...incoming];if(!classes.length)classes.push(sampleClass());
 return {classes,selected:classes.some(c=>c.id===selected)?selected:classes[0].id,seedSources:[...new Set([...remembered,...(seed?.classes.map(c=>c.sourceId)??[])])],added:incoming.length};
}
