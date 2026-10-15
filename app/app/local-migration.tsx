import {useState} from 'react';
import {CloudUpload,X} from 'lucide-react';
import {localGet} from '../lib/local';
import {cloudLibrary,getCloudLibrary} from '../lib/cloud-library';
import {payloadDigest} from '../lib/cloud-payload';
import {packQuestions} from '../lib/cloud-payload';
import {requireAdmin} from '../lib/cloud-auth';
import {download} from '../lib/excel';
import type {Quiz} from '../lib/engine';
import type {Folder} from '../lib/permissions';
type Legacy={quizzes:Quiz[];folders:Folder[];sourceOrigin?:string};
export function LocalMigration(){
 const [open,setOpen]=useState(false),[data,setData]=useState<Legacy|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 async function show(){requireAdmin();setOpen(true);setMessage('');setData(null);try{setData(await localGet<Legacy>('library')??{quizzes:[],folders:[]});}catch{setMessage('Không đọc được kho đề cũ trên trình duyệt này. Bạn vẫn có thể nhập bản JSON đã sao lưu.');}}
 async function migrate(){if(!data)return;requireAdmin();setBusy(true);setMessage('Đang chuyển đề…');let done=0,skipped=0;
  try{
   const source=data.sourceOrigin??location.origin,active=data.folders.filter(f=>!f.deletedAt),map=new Map<string,string>();for(const f of active)map.set(f.id,'import-'+(await payloadDigest(source+'\0folder\0'+f.id)).slice(0,40));
   const remaining=[...active],completed=new Set<string>();
   while(remaining.length){const i=remaining.findIndex(f=>!f.parentId||!map.has(f.parentId)||completed.has(f.parentId));if(i<0)throw new Error('Thư mục cũ bị vòng lặp. Hãy nhập đề bằng JSON để chọn lại thư mục.');const [f]=remaining.splice(i,1),id=map.get(f.id)!;if(!getCloudLibrary().folders.some(x=>x.id===id))await cloudLibrary({action:'folderSave',id,name:f.name,parentId:f.parentId?map.get(f.parentId)??null:null});completed.add(f.id);}
   for(const q of data.quizzes.filter(q=>!q.deletedAt)){
    const key=await payloadDigest(source+'\0quiz\0'+q.id),id='import-'+key.slice(0,40);
    if(getCloudLibrary().quizzes.some(x=>x.id===id)){skipped++;continue;}
    await cloudLibrary({...q,action:'quizSave',id,version:0,folderId:q.folderId?map.get(q.folderId)??null:null,migrationKey:key});done++;setMessage(`Đã chuyển ${done} bộ đề${skipped?' · '+skipped+' bộ đã có trên cloud':''}…`);
   }
   setMessage(`Hoàn tất: ${done} bộ đề đã lên online, ${skipped} bộ đã có nên bỏ qua. Bản cũ trên máy vẫn được giữ.`);
  }catch(e){setMessage(`Đã chuyển ${done} bộ. ${(e as Error).message} Có thể thử lại; các bộ đã chuyển sẽ được bỏ qua.`);}finally{setBusy(false);}
 }
 const count=data?.quizzes.filter(q=>!q.deletedAt).length??0;
 return <><button className="button" onClick={()=>void show()}><CloudUpload size={16}/>Đưa đề cũ lên online</button>{open&&<div className="overlay"><section className="modal" role="dialog" aria-modal="true" aria-label="Chuyển đề cũ lên online"><div className="modal-top"><h2>Chuyển đề trên máy lên kho chung</h2><button className="icon" disabled={busy} aria-label="Đóng chuyển đề" onClick={()=>setOpen(false)}><X size={20}/></button></div><p>Nguồn đang chọn có <strong>{count} bộ đề</strong>. Đề, ảnh/audio nhúng và thư mục sẽ được chuyển lên Firebase. Các máy khác sẽ thấy sau khi đăng nhập.</p><p className="muted small">Chuyển lại không ghi đè đề đã có trên cloud. Bản cũ vẫn được giữ để sao lưu. Có thể chọn bản sao toàn kho từ trình duyệt cũ bên dưới.</p><label className="file-pick">Mở bản sao kho cũ JSON<input type="file" accept=".json" disabled={busy} onChange={async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;try{if(file.size>50*1024*1024)throw new Error('Bản sao tối đa 50 MB.');const parsed=JSON.parse(await file.text());if(!Array.isArray(parsed.quizzes)||parsed.quizzes.length>500)throw new Error('Cần bản sao toàn kho. JSON từng bộ đề được nhập bằng nút Nhập đề Excel / JSON.');for(const q of parsed.quizzes){if(typeof q.id!=='string'||!q.title?.trim())throw new Error('Bản sao có bộ đề thiếu tên hoặc mã.');packQuestions(q.questions);}setData({quizzes:parsed.quizzes,folders:Array.isArray(parsed.folders)?parsed.folders:[],sourceOrigin:typeof parsed.sourceOrigin==='string'?parsed.sourceOrigin:undefined});setMessage('Đã mở bản sao. Kiểm tra số bộ đề rồi bấm Chuyển.');}catch(error){setMessage((error as Error).message);}}}/></label>{message&&<p role="status" className="note">{message}</p>}<div className="modal-actions"><button className="button" disabled={!data||busy} onClick={()=>{if(data)download(new Blob([JSON.stringify({...data,sourceOrigin:data.sourceOrigin??location.origin},null,2)],{type:'application/json'}),'sophia-local-backup.json');}}>Sao lưu kho cũ</button><button className="button primary" disabled={!data||!count||busy} onClick={()=>void migrate()}>{busy?'Đang chuyển…':'Chuyển '+count+' bộ đề'}</button></div></section></div>}</>;
}
