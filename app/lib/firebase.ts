import {getApp,getApps,initializeApp} from 'firebase/app';
import {getAuth,connectAuthEmulator} from 'firebase/auth';
import {getFirestore,connectFirestoreEmulator} from 'firebase/firestore';

declare const __STATIC_LIBRARY__:boolean;
const env=import.meta.env??{};
export const cloudEnabled=typeof __STATIC_LIBRARY__!=='undefined'&&__STATIC_LIBRARY__&&env.VITE_LIBRARY_MODE!=='local';
const config={apiKey:env.VITE_FIREBASE_API_KEY,authDomain:env.VITE_FIREBASE_AUTH_DOMAIN,projectId:env.VITE_FIREBASE_PROJECT_ID,appId:env.VITE_FIREBASE_APP_ID};
export const firebaseProjectId=config.projectId??'';
export const firebaseConfigured=!!(config.apiKey&&config.authDomain&&config.projectId&&config.appId);
let services:ReturnType<typeof initialize>|undefined;
function initialize(){
 if(!firebaseConfigured)throw new Error('Chưa kết nối Firebase. Xem hướng dẫn thiết lập kho đề online.');
 const app=getApps().length?getApp():initializeApp(config),auth=getAuth(app),db=getFirestore(app);
 // Emulator connections are permitted only in an explicit development build.
 if(import.meta.env.DEV&&env.VITE_FIREBASE_EMULATORS==='true'){
  connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});
  connectFirestoreEmulator(db,'127.0.0.1',8080);
 }
 return {app,auth,db};
}
export function firebaseServices(){return services??=initialize();}
