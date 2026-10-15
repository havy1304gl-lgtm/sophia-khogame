import {defineConfig,loadEnv} from 'vite';
import react from '@vitejs/plugin-react';
import {accessEndpoint} from './server/firebase-admin.ts';
export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),'');
 for(const key of ['FIREBASE_PROJECT_ID','FIREBASE_SERVICE_ACCOUNT_JSON','SOPHIA_ADMIN_PASSWORD','SOPHIA_PLAYER_PASSWORD','SOPHIA_ACCESS_VERSION','SOPHIA_RATE_LIMIT_SECRET','FIREBASE_AUTH_EMULATOR_HOST','FIRESTORE_EMULATOR_HOST'])if(env[key])process.env[key]=env[key];
 return {plugins:[react(),{name:'sophia-access-server',configureServer(server){server.middlewares.use('/.netlify/functions/access',async(req,res)=>{
  try{const chunks:Buffer[]=[];let size=0;for await(const chunk of req){const bytes=Buffer.from(chunk);size+=bytes.length;if(size>1024){res.statusCode=413;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:'Yêu cầu quá lớn.'}));return;}chunks.push(bytes);}
   const headers=new Headers();for(const [name,value] of Object.entries(req.headers))if(value)headers.set(name,Array.isArray(value)?value.join(','):value);
   const request=new Request('http://'+req.headers.host+'/.netlify/functions/access',{method:req.method,headers,...(!['GET','HEAD'].includes(req.method??'GET')?{body:Buffer.concat(chunks)}:{})});
   const response=await accessEndpoint(request,req.socket.remoteAddress??'local');res.statusCode=response.status;response.headers.forEach((v,k)=>res.setHeader(k,v));res.end(await response.text());
  }catch{res.statusCode=503;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:'Không kết nối được cổng đăng nhập.'}));}
 });}}],define:{__STATIC_LIBRARY__:'true'},build:{outDir:'dist-netlify'},server:{host:'127.0.0.1'}};
});
