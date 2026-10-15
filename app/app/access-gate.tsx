import {useEffect,useState,useSyncExternalStore,type ReactNode} from 'react';
import {LockKeyhole,LogOut,ShieldCheck,ArrowRight} from 'lucide-react';
import {firebaseConfigured} from '../lib/firebase';
import {getAuthState,subscribeAuth,startAuth,login,logout} from '../lib/cloud-auth';
import {SophiaBrand} from './sophia-brand';
import {requestMusicScene} from '../lib/soundtrack';
import './access-gate.css';
export function useAuth(){const state=useSyncExternalStore(subscribeAuth,getAuthState,getAuthState);useEffect(startAuth,[]);return state;}
export function AccessGate({children}:{children:ReactNode}){
 const {role,loading,error:authError}=useAuth(),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{if(!role)requestMusicScene('off');},[role]);
 if(role)return <>{children}<button className="access-signout" onClick={()=>void logout()} title="Đăng xuất và khóa app"><ShieldCheck size={15}/>{role==='admin'?'Quản lý':'Vào chơi'}<LogOut size={15}/></button></>;
 return <main className="access-screen"><div className="access-orbit" aria-hidden="true"/><section className="access-card"><div className="sophia-brand"><SophiaBrand/></div><div className="access-lock"><LockKeyhole size={30}/></div><span className="eyebrow">YOUR CLASSROOM ADVENTURES</span><h1>Welcome to SOPHIA</h1><p>Nhập mật khẩu để mở kho trò chơi và đề chung.</p>{!firebaseConfigured?<div className="access-setup" role="status"><strong>Kho online chưa được kết nối</strong><p>Cần cấu hình Firebase của chủ app để kích hoạt hai mật khẩu và đồng bộ đề.</p><a className="button primary" href="/SOPHIA-FIREBASE.md" download>Tải hướng dẫn kết nối</a></div>:loading?<p role="status">Đang kiểm tra phiên…</p>:<form onSubmit={async e=>{e.preventDefault();if(busy||!password)return;setBusy(true);setError('');try{await login(password);setPassword('');}catch(e){setError((e as Error).message);}finally{setPassword('');setBusy(false);}}}><label htmlFor="access-password">Mật khẩu</label><input id="access-password" name="password" type="password" autoComplete="current-password" maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} autoFocus disabled={busy}/>{(error||authError)&&<p className="access-error" role="alert">{error||authError}</p>}<button className="button primary" disabled={busy||!password}>{busy?'Đang mở…':'Vào SOPHIA'}<ArrowRight size={20}/></button></form>}<small>Mật khẩu do chủ app cung cấp.</small></section></main>;
}
