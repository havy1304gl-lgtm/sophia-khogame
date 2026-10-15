import {localGet,localSet} from './local';
import {validateQuestion,type Quiz} from './engine';
import type {Folder,Member} from './permissions';
declare const __STATIC_LIBRARY__:boolean;
export const staticLibrary=typeof __STATIC_LIBRARY__!=='undefined'&&__STATIC_LIBRARY__;
const user:Member={id:'local-teacher',name:'Giáo viên',email:'',role:'teacher',enabled:1,canCreate:1};
type Store={quizzes:Quiz[];folders:Folder[]};
let queue:Promise<unknown>=Promise.resolve();
export function libraryAtMachine(body?:any):Promise<any>{
 const run=async()=>{
  const store=await localGet<Store>('library')??{quizzes:[],folders:[]};
  if(!body)return {...store,user,members:[],grants:[]};
  let id=body.id||crypto.randomUUID();const now=new Date().toISOString();
  if(body.action==='quizSave'){
   if(!body.title?.trim()||!body.questions?.length||body.questions.length>500)throw new Error('Bộ đề cần tên và 1–500 câu.');
   for(const q of body.questions){const errors=validateQuestion(q);if(errors.length)throw new Error(errors.join(' · '));}
   const old=store.quizzes.find(q=>q.id===id);
   const quiz:Quiz={...body,id,owner:user.id,permission:'edit',version:(old?.version??0)+1,updatedAt:now};
   store.quizzes=store.quizzes.filter(q=>q.id!==id).concat(quiz);
  }else if(body.action==='folderSave'){
   if(!body.name?.trim())throw new Error('Nhập tên thư mục.');
   let parent=body.parentId;const seen=new Set([id]);
   while(parent){if(seen.has(parent))throw new Error('Không thể đặt thư mục trong chính nó.');seen.add(parent);parent=store.folders.find(f=>f.id===parent)?.parentId;}
   store.folders=store.folders.filter(f=>f.id!==id).concat({id,name:body.name,owner:user.id,parentId:body.parentId||null});
  }else if(['quizDelete','quizRestore'].includes(body.action)){
   store.quizzes=store.quizzes.map(q=>q.id===id?{...q,deletedAt:body.action==='quizDelete'?now:null}:q);
  }else if(['folderDelete','folderRestore'].includes(body.action)){
   const ids=new Set([id]);let size=0;while(size!==ids.size){size=ids.size;store.folders.forEach(f=>{if(f.parentId&&ids.has(f.parentId))ids.add(f.id);});}
   const deletedAt=body.action==='folderDelete'?now:null;
   store.folders=store.folders.map(f=>ids.has(f.id)?{...f,deletedAt}:f);
   store.quizzes=store.quizzes.map(q=>q.folderId&&ids.has(q.folderId)?{...q,deletedAt}:q);
  }else throw new Error('Chức năng này cần kho đề online.');
  await localSet('library',store);return {id};
 };
 const result=queue.catch(()=>{}).then(run);queue=result;return result;
}
