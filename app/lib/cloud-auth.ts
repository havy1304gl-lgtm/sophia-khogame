import {browserSessionPersistence,onIdTokenChanged,setPersistence,signInWithCustomToken,signOut,type User} from 'firebase/auth';
import {firebaseServices,firebaseConfigured} from './firebase';
import {sessionRole,type AccessRole} from './access-policy';
type AuthState={loading:boolean;user:User|null;role:AccessRole|null;expiresAt:number;error:string};
let state:AuthState={loading:true,user:null,role:null,expiresAt:0,error:''},started=false,ready:Promise<void>|undefined,sequence=0,expiry:ReturnType<typeof setTimeout>|undefined;
const listeners=new Set<()=>void>();
export const getAuthState=()=>state;
export function subscribeAuth(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};}
function emit(patch:Partial<AuthState>){state={...state,...patch};listeners.forEach(fn=>fn());}
export function startAuth(){
 if(started)return;started=true;
 if(!firebaseConfigured){emit({loading:false});return;}
 const {auth}=firebaseServices();
 ready=setPersistence(auth,browserSessionPersistence).then(()=>{
  onIdTokenChanged(auth,async user=>{const version=++sequence;clearTimeout(expiry);if(!user){emit({loading:false,user:null,role:null,expiresAt:0,error:''});return;}
   try{const {claims}=await user.getIdTokenResult();if(version!==sequence)return;const role=sessionRole(claims);if(!role){await signOut(auth);return;}const expiresAt=Number(claims.sophiaSessionUntil);emit({loading:false,user,role,expiresAt,error:''});expiry=setTimeout(()=>{void logout();},Math.max(0,expiresAt-Date.now()));}
   catch{if(version===sequence)emit({loading:false,user:null,role:null,error:'Không kiểm tra được phiên đăng nhập. Vui lòng vào lại.'});}
  },()=>emit({loading:false,user:null,role:null,error:'Không kết nối được dịch vụ đăng nhập.'}));
 }).catch(()=>emit({loading:false,user:null,role:null,error:'Trình duyệt không lưu được phiên. Hãy cho phép dữ liệu trang và thử lại.'}));
}
export async function login(password:string){
 startAuth();await ready;
 const response=await fetch('/.netlify/functions/access',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',cache:'no-store',body:JSON.stringify({password})});
 const data=await response.json().catch(()=>null) as {token?:string;error?:string}|null;
 if(!response.ok||!data?.token)throw new Error(data?.error??'Chưa kết nối được cổng đăng nhập. Kiểm tra máy chủ và thử lại.');
 await signInWithCustomToken(firebaseServices().auth,data.token);
}
export async function logout(){clearTimeout(expiry);++sequence;emit({loading:false,user:null,role:null,expiresAt:0,error:''});if(firebaseConfigured)await signOut(firebaseServices().auth);}
export function requireAdmin(){if(state.role!=='admin'||state.expiresAt<=Date.now())throw new Error('Chỉ chế độ Quản lý được thay đổi kho đề.');}
