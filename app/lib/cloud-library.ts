import {collection,doc,getDoc,getDocs,query,where,onSnapshot,runTransaction,serverTimestamp,writeBatch,increment,type DocumentData,type Unsubscribe} from 'firebase/firestore';
import {firebaseServices} from './firebase';
import {getAuthState,subscribeAuth,requireAdmin,logout} from './cloud-auth';
import {packQuestions,splitPayload,unpackQuestions,payloadDigest} from './cloud-payload';
import {embedLocalMedia} from './cloud-media';
import type {Quiz} from './engine';
import type {Folder,Member,Grant} from './permissions';
export type CloudLibrary={user:Member|null;quizzes:Quiz[];folders:Folder[];members:Member[];grants:Grant[];loading:boolean;error:string};
let state:CloudLibrary={user:null,quizzes:[],folders:[],members:[],grants:[],loading:true,error:''},started=false,identity='',generation=0;
let stops:Unsubscribe[]=[],rows:DocumentData[]|null=null,folders:Folder[]|null=null;
const listeners=new Set<()=>void>(),cache=new Map<string,Quiz>();
export const getCloudLibrary=()=>state;
function emit(patch:Partial<CloudLibrary>){state={...state,...patch};listeners.forEach(fn=>fn());}
export function subscribeCloudLibrary(fn:()=>void){listeners.add(fn);startCloudLibrary();return()=>{listeners.delete(fn);};}
const iso=(value:any)=>value?.toDate?.().toISOString?.()??(typeof value==='string'?value:'');
function stop(){stops.forEach(fn=>fn());stops=[];rows=null;folders=null;++generation;}
function error(error:unknown){const code=(error as {code?:string})?.code;emit({loading:false,error:code==='permission-denied'?'Phiên truy cập không còn hợp lệ. Vui lòng vào lại.':'Chưa tải được kho đề online. Kiểm tra mạng rồi bấm Làm mới.'});if(code==='permission-denied')void logout();}
async function hydrate(version:number){
 if(!rows||!folders)return;
 const snapshot=rows,auth=getAuthState();
 try{
  const quizzes=await Promise.all(snapshot.map(async raw=>{
   const key=raw.id+':'+raw.payloadId;let quiz=cache.get(key);
   if(!quiz){const ref=collection(firebaseServices().db,'question_banks',raw.id,'payloads',raw.payloadId,'parts');const docs=await getDocs(ref),{questions,text}=unpackQuestions(docs.docs.map(d=>d.data() as {index:number;text:string}),raw.partCount);if(await payloadDigest(text)!==raw.digest||questions.length!==raw.questionCount)throw new Error('Đề tải không đầy đủ.');quiz={id:raw.id,title:'',description:'',questions,owner:'',folderId:null,version:0,updatedAt:''};cache.set(key,quiz);}
   return {...quiz,title:raw.title,description:raw.description,folderId:raw.folderId??null,owner:raw.createdBy,version:raw.version,updatedAt:iso(raw.updatedAt),deletedAt:raw.deletedAt??null,permission:auth.role==='admin'?'edit':'view'} as Quiz;
  }));
  if(version!==generation||getAuthState().user?.uid!==auth.user?.uid)return;
  const active=new Set(snapshot.map(r=>r.id+':'+r.payloadId));for(const key of cache.keys())if(!active.has(key))cache.delete(key);
  emit({quizzes:quizzes.sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)),folders,loading:false,error:''});
 }catch(e){if(version===generation)error(e);}
}
function watch(force=false){
 const auth=getAuthState(),next=(auth.user?.uid??'')+':'+(auth.role??'');if(!force&&next===identity)return;identity=next;stop();cache.clear();
 emit({quizzes:[],folders:[],user:auth.user&&auth.role?{id:auth.user.uid,email:'',name:auth.role==='admin'?'Quản lý SOPHIA':'Giáo viên',role:auth.role==='admin'?'admin':'viewer',enabled:1,canCreate:auth.role==='admin'?1:0}:null,loading:!!auth.role,error:''});
 if(!auth.user||!auth.role)return;
 const db=firebaseServices().db,banks=collection(db,'question_banks'),dirs=collection(db,'folders'),admin=auth.role==='admin';
 stops.push(onSnapshot(admin?banks:query(banks,where('deletedAt','==',null)),snap=>{rows=snap.docs.map(d=>({id:d.id,...d.data()}));const version=++generation;void hydrate(version);},error));
 stops.push(onSnapshot(admin?dirs:query(dirs,where('deletedAt','==',null)),snap=>{folders=snap.docs.map(d=>({id:d.id,...d.data()} as Folder));const version=++generation;void hydrate(version);},error));
}
export function startCloudLibrary(){if(started)return;started=true;subscribeAuth(()=>watch());watch(true);}
function waitForLibrary(){startCloudLibrary();if(!state.loading){if(state.error)return Promise.reject(new Error(state.error));return Promise.resolve(state);}return new Promise<CloudLibrary>((resolve,reject)=>{const timer=setTimeout(()=>{listeners.delete(check);reject(new Error('Kho đề phản hồi chậm. Kiểm tra mạng và thử lại.'));},25000);const check=()=>{if(state.loading)return;clearTimeout(timer);listeners.delete(check);if(state.error)reject(new Error(state.error));else if(!state.user)reject(new Error('Phiên đăng nhập đã kết thúc.'));else resolve(state);};listeners.add(check);check();});}
export async function reloadCloudLibrary(){watch(true);return waitForLibrary();}
function requireNetwork(){requireAdmin();if(typeof navigator!=='undefined'&&!navigator.onLine)throw new Error('Cần kết nối mạng để lưu thay đổi vào kho chung.');}
export async function cloudLibrary(body?:any):Promise<any>{
 if(!body)return waitForLibrary();requireNetwork();const db=firebaseServices().db;
 if(body.action==='quizSave'){
  if(typeof body.title!=='string'||!body.title.trim()||body.title.trim().length>200)throw new Error('Tên bộ đề cần 1–200 ký tự.');
  if(String(body.description??'').length>5000)throw new Error('Mô tả tối đa 5.000 ký tự.');
  const id=body.id||crypto.randomUUID(),payloadId=crypto.randomUUID(),questions=await embedLocalMedia(body.questions),text=packQuestions(questions),parts=splitPayload(text),digest=await payloadDigest(text),ref=doc(db,'question_banks',id);
  // Stage an immutable payload first. Publishing the metadata below is atomic.
  for(let offset=0;offset<parts.length;offset+=400){const batch=writeBatch(db);parts.slice(offset,offset+400).forEach((text,i)=>batch.set(doc(db,'question_banks',id,'payloads',payloadId,'parts',String(offset+i).padStart(4,'0')),{index:offset+i,text}));await batch.commit();}
  await runTransaction(db,async tx=>{const current=await tx.get(ref),old=current.data();if(current.exists()&&Number(body.version)!==old?.version)throw new Error('Đề vừa được thay đổi ở máy khác. Đóng bản soạn, mở lại đề mới nhất rồi sửa tiếp.');if(!current.exists()&&body.id&&Number(body.version)>0)throw new Error('Không tìm thấy đề gốc.');const createdBy=old?.createdBy??getAuthState().user!.uid;tx.set(ref,{title:body.title.trim(),description:String(body.description??''),folderId:body.folderId||null,createdBy,createdAt:old?.createdAt??serverTimestamp(),updatedAt:serverTimestamp(),version:(old?.version??0)+1,deletedAt:null,payloadId,partCount:parts.length,digest,questionCount:body.questions.length,...(body.migrationKey?{migrationKey:body.migrationKey}:old?.migrationKey?{migrationKey:old.migrationKey}:{})});});
  await reloadCloudLibrary();return {id};
 }
 if(body.action==='folderSave'){
  if(!body.name?.trim()||body.name.trim().length>200)throw new Error('Tên thư mục cần 1–200 ký tự.');
  const id=body.id||crypto.randomUUID();let parent=body.parentId;const seen=new Set([id]);while(parent){if(seen.has(parent))throw new Error('Không thể đặt thư mục trong chính nó.');seen.add(parent);const found=state.folders.find(f=>f.id===parent&&!f.deletedAt);if(!found)throw new Error('Thư mục cha không còn tồn tại.');parent=found.parentId;}
  await runTransaction(db,async tx=>{const ref=doc(db,'folders',id),old=await tx.get(ref);tx.set(ref,{name:body.name.trim(),parentId:body.parentId||null,deletedAt:old.data()?.deletedAt??null,owner:old.data()?.owner??getAuthState().user!.uid});});await reloadCloudLibrary();return {id};
 }
 if(['quizDelete','quizRestore'].includes(body.action)){
  await runTransaction(db,async tx=>{const ref=doc(db,'question_banks',body.id),snapshot=await tx.get(ref);if(!snapshot.exists())throw new Error('Không tìm thấy bộ đề.');tx.update(ref,{deletedAt:body.action==='quizDelete'?new Date().toISOString():null,updatedAt:serverTimestamp(),version:increment(1)});});await reloadCloudLibrary();return {id:body.id};
 }
 if(['folderDelete','folderRestore'].includes(body.action)){
  const ids=new Set<string>([body.id]);let size=0;while(size!==ids.size){size=ids.size;state.folders.forEach(f=>{if(f.parentId&&ids.has(f.parentId))ids.add(f.id);});}
  const deletedAt=body.action==='folderDelete'?new Date().toISOString():null,changes=[...state.folders.filter(f=>ids.has(f.id)).map(f=>({ref:doc(db,'folders',f.id),data:{deletedAt}})),...state.quizzes.filter(q=>q.folderId&&ids.has(q.folderId)).map(q=>({ref:doc(db,'question_banks',q.id),data:{deletedAt,updatedAt:serverTimestamp(),version:increment(1)}}))];
  for(let offset=0;offset<changes.length;offset+=400){const batch=writeBatch(db);changes.slice(offset,offset+400).forEach(c=>batch.update(c.ref,c.data));await batch.commit();}await reloadCloudLibrary();return {id:body.id};
 }
 throw new Error('Chức năng không áp dụng cho kho dùng hai mật khẩu.');
}
