import type {Quiz} from './engine';
import type {Folder} from './permissions';
export type BankDisplay='compact'|'details'|'grid';
export type BankSort='name'|'updated'|'count';
export function folderTrail(folders:Folder[],id:string|null):Folder[]{
 const result:Folder[]=[],seen=new Set<string>();
 while(id&&!seen.has(id)){seen.add(id);const folder=folders.find(f=>f.id===id&&!f.deletedAt);if(!folder)break;result.unshift(folder);id=folder.parentId;}
 return result;
}
const normalized=(text:string)=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLocaleLowerCase('vi').trim();
export function browseQuizzes(quizzes:Quiz[],options:{folder:string|null;trash:boolean;all:boolean;search:string;sort:BankSort}):Quiz[]{
 const term=normalized(options.search);
 return quizzes.filter(q=>{
  if(options.trash?!q.deletedAt:!!q.deletedAt)return false;
  if(options.trash)return !term||normalized(q.title+' '+q.description).includes(term);
  if(options.folder?q.folderId!==options.folder:!options.all&&!term&&!!q.folderId)return false;
  return !term||normalized([q.title,q.description,...q.questions.map(x=>x.topic)].join(' ')).includes(term);
 }).sort((a,b)=>{const name=a.title.localeCompare(b.title,'vi',{numeric:true});return options.sort==='updated'?b.updatedAt.localeCompare(a.updatedAt)||name:options.sort==='count'?b.questions.length-a.questions.length||name:name;});
}
