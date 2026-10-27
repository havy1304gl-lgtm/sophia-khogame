import {createHash,timingSafeEqual} from 'node:crypto';
import {accessHours,type AccessRole} from '../lib/access-policy.ts';
export class AccessServiceError extends Error {
 readonly diagnostic:string;
 constructor(diagnostic:string,message:string){super(message);this.diagnostic=diagnostic;}
}
export function firebaseFailure(stage:'FIRESTORE'|'TOKEN',error:unknown){
 const raw=error && typeof error==='object' && 'code' in error?String(error.code):'';
 const code=/^(?:[0-9]{1,2}|auth\/[a-z-]+)$/.test(raw)?raw:'UNKNOWN';
 const diagnostic=`${stage}_${code}`;
 console.error('[SOPHIA access]',diagnostic);
 return new AccessServiceError(diagnostic,`Máy chủ chưa kết nối Firebase (${diagnostic}).`);
}
type Dependencies={adminPassword:string;playerPassword:string;version:string;reserve:(ip:string)=>Promise<number>;mint:(role:AccessRole,until:number,version:string)=>Promise<string>;now?:()=>number};
const response=(status:number,body:unknown,retry?:number)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(retry?{'Retry-After':String(retry)}:{})}});
function same(a:string,b:string){return timingSafeEqual(createHash('sha256').update(a).digest(),createHash('sha256').update(b).digest());}
export async function handleAccess(request:Request,ip:string,deps:Dependencies){
 if(request.method!=='POST')return response(405,{error:'Chỉ nhận yêu cầu đăng nhập.'});
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return response(403,{error:'Yêu cầu không hợp lệ.'});
 if(!request.headers.get('content-type')?.startsWith('application/json'))return response(415,{error:'Yêu cầu không hợp lệ.'});
 if(!deps.adminPassword||!deps.playerPassword||deps.adminPassword===deps.playerPassword||!deps.version)return response(503,{error:'Cổng đăng nhập chưa được chủ app cấu hình.'});
 let password:string;try{const text=await request.text();if(new TextEncoder().encode(text).length>1024)return response(413,{error:'Yêu cầu quá lớn.'});const body=JSON.parse(text);if(typeof body.password!=='string'||!body.password||body.password.length>128)throw new Error();password=body.password;}catch{return response(400,{error:'Vui lòng nhập mật khẩu.'});}
 try{
  const wait=await deps.reserve(ip);if(wait>0)return response(429,{error:'Đã thử quá nhiều lần. Vui lòng chờ 15 phút rồi thử lại.'},wait);
  const admin=same(password,deps.adminPassword),player=same(password,deps.playerPassword);
  if(!admin&&!player)return response(401,{error:'Mật khẩu chưa đúng.'});
  const role=admin?'admin':'player',until=(deps.now??Date.now)()+accessHours*60*60*1000;
  return response(200,{token:await deps.mint(role,until,deps.version)});
 }catch(error){return response(503,{error:error instanceof AccessServiceError?error.message:'Chưa kết nối được dịch vụ đăng nhập. Vui lòng thử lại sau.'});}
}
export const loginWindowMs=15*60*1000,loginLimit=10;
export function loginBucket(previous:{count:number;startedAt:number}|undefined,now:number){
 const fresh=!previous||now-previous.startedAt>=loginWindowMs||now<previous.startedAt;
 const bucket=fresh?{count:0,startedAt:now}:previous!;
 return bucket.count>=loginLimit?{...bucket,retry:Math.ceil((bucket.startedAt+loginWindowMs-now)/1000)}:{count:bucket.count+1,startedAt:bucket.startedAt,retry:0};
}
