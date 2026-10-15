import {cert,getApps,initializeApp} from 'firebase-admin/app';
import {createFirebaseToken} from './custom-token.ts';
import {getFirestore} from 'firebase-admin/firestore';
import {createHmac} from 'node:crypto';
import {handleAccess,loginBucket} from './access-handler.ts';
export async function accessEndpoint(request:Request,ip:string){
 const env=process.env;
 try{
  const emulator=env.NODE_ENV!=='production'&&env.FIREBASE_AUTH_EMULATOR_HOST==='127.0.0.1:9099'&&env.FIRESTORE_EMULATOR_HOST==='127.0.0.1:8080'&&env.FIREBASE_PROJECT_ID?.startsWith('demo-');
  const credential=emulator?null:JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON??'{}');
  if(!emulator&&(!credential.project_id||!credential.private_key||!credential.client_email||credential.project_id!==env.FIREBASE_PROJECT_ID))throw new Error();
  let app=getApps().find(a=>a.name==='sophia-access');
  if(!app){
   if(emulator)app=initializeApp({projectId:env.FIREBASE_PROJECT_ID},'sophia-access');
   else{app=initializeApp({credential:cert(credential),projectId:credential.project_id},'sophia-access');}
  }
  const db=getFirestore(app),version=env.SOPHIA_ACCESS_VERSION??'v1';
  return handleAccess(request,ip,{
   adminPassword:env.SOPHIA_ADMIN_PASSWORD??'',playerPassword:env.SOPHIA_PLAYER_PASSWORD??'',version,
   reserve:async address=>{
    const secret=env.SOPHIA_RATE_LIMIT_SECRET;if(!secret||secret.length<32)throw new Error();
    const key=createHmac('sha256',secret).update(address||'unknown').digest('hex'),ref=db.doc('_login_limits/'+key);
    return db.runTransaction(async tx=>{const snap=await tx.get(ref),bucket=loginBucket(snap.exists?snap.data() as {count:number;startedAt:number}:undefined,Date.now());if(!bucket.retry)tx.set(ref,{count:bucket.count,startedAt:bucket.startedAt,expiresAt:new Date(bucket.startedAt+24*60*60*1000)});return bucket.retry;});
   },
   mint:async(role,until,accessVersion)=>{
    const control=db.doc('_access/control'),current=await control.get();
    if(!current.exists)await control.create({version:accessVersion}).catch(async error=>{const actual=await control.get();if(!actual.exists)throw error;});
    if((await control.get()).data()?.version!==accessVersion)throw new Error();
    return createFirebaseToken('sophia-access-'+role,{sophiaRole:role,sophiaSessionUntil:until,sophiaAccessVersion:accessVersion},credential,emulator);
   }
  });
 }catch{return new Response(JSON.stringify({error:'Cổng đăng nhập chưa kết nối Firebase. Chủ app cần hoàn tất cấu hình máy chủ.'}),{status:503,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});}
}
