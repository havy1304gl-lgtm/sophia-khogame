import {cleanClassroomSeed,type ClassroomSeed} from '../lib/classroom-seed.ts';
import type {AccessRole} from '../lib/access-policy.ts';
type Dependencies={authorize:(token:string)=>Promise<AccessRole|null>;load:()=>Promise<ClassroomSeed|null>;save:(seed:ClassroomSeed)=>Promise<void>};
const json=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Vary':'Authorization'}});
export async function handleClassroomSeed(request:Request,deps:Dependencies){
 if(!['GET','POST'].includes(request.method))return json(405,{error:'Phương thức không được hỗ trợ.'});
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return json(403,{error:'Yêu cầu không hợp lệ.'});
 const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];if(!token)return json(401,{error:'Vui lòng đăng nhập SOPHIA.'});
 let role:AccessRole|null;try{role=await deps.authorize(token);}catch{return json(401,{error:'Phiên đã hết hạn. Vui lòng đăng nhập lại.'});}if(!role)return json(401,{error:'Phiên đã hết hạn. Vui lòng đăng nhập lại.'});
 if(request.method==='POST'&&role!=='admin')return json(403,{error:'Chỉ Quản lý được cập nhật lớp mặc định.'});
 try{
  if(request.method==='GET'){const seed=await deps.load();return seed?json(200,cleanClassroomSeed(seed)):json(404,{error:'Chưa có lớp mặc định.'});}
  if(!request.headers.get('content-type')?.startsWith('application/json'))return json(415,{error:'Cần dữ liệu JSON.'});
  const text=await request.text();if(new TextEncoder().encode(text).length>256*1024)return json(413,{error:'Danh sách lớp quá lớn.'});
  let seed:ClassroomSeed;try{seed=cleanClassroomSeed(JSON.parse(text));}catch{return json(400,{error:'Danh sách lớp không hợp lệ. Hãy chọn bản sao lưu Aura Guild.'});}
  await deps.save(seed);return json(200,{ok:true,classCount:seed.classes.length,studentCount:seed.classes.reduce((n,c)=>n+c.students.length,0)});
 }catch{return json(503,{error:'Chưa kết nối được kho lớp mặc định. Vui lòng thử lại.'});}
}
