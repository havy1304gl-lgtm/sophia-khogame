import {verify} from 'node:crypto';
const certificatesUrl='https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
type CertificateCache={expires:number;keys:Record<string,string>};
let cache:CertificateCache|undefined;
// Firebase ID-token constraints: https://firebase.google.com/docs/auth/admin/verify-id-tokens
// Uses Node's RS256 verifier so Lambda does not load the incompatible CJS/ESM JWT chain.
export async function verifyFirebaseIdToken(token:string,project:string,options:{now?:number;fetcher?:typeof fetch}={}){
 const now=options.now??Date.now(),seconds=Math.floor(now/1000),parts=token.split('.');
 if(!project||token.length>16384||parts.length!==3||parts.some(p=>!p||!/^[\w-]+$/.test(p)))throw new Error('Invalid ID token');
 const header=JSON.parse(Buffer.from(parts[0],'base64url').toString()),claims=JSON.parse(Buffer.from(parts[1],'base64url').toString()) as Record<string,unknown>;
 if(header.alg!=='RS256'||typeof header.kid!=='string'||!header.kid||header.kid.length>256)throw new Error('Invalid signing key');
 if(!claims||Array.isArray(claims)||claims.aud!==project||claims.iss!==`https://securetoken.google.com/${project}`||typeof claims.sub!=='string'||!claims.sub||claims.sub.length>128||typeof claims.exp!=='number'||!Number.isFinite(claims.exp)||claims.exp<=seconds||typeof claims.iat!=='number'||!Number.isFinite(claims.iat)||claims.iat>seconds||typeof claims.auth_time!=='number'||!Number.isFinite(claims.auth_time)||claims.auth_time>seconds)throw new Error('Invalid ID-token claims');
 const fetcher=options.fetcher??fetch;
 async function certificates(){const response=await fetcher(certificatesUrl,{signal:AbortSignal.timeout(7000)});if(!response.ok)throw new Error('Signing keys unavailable');const keys=await response.json() as Record<string,unknown>;if(!keys||Array.isArray(keys))throw new Error('Invalid signing keys');const checked:Record<string,string>={};for(const [kid,key] of Object.entries(keys))if(typeof key==='string'&&key.includes('-----BEGIN ')&&key.length<16384)checked[kid]=key;const age=Number(response.headers.get('cache-control')?.match(/max-age=(\d+)/)?.[1]??300);return {keys:checked,expires:now+Math.max(0,Math.min(age,3600))*1000};}
 let current=options.fetcher?await certificates():cache;
 if(!current||current.expires<=now||!Object.hasOwn(current.keys,header.kid)){current=await certificates();if(!options.fetcher)cache=current;}
 if(!Object.hasOwn(current.keys,header.kid)||!verify('RSA-SHA256',Buffer.from(parts[0]+'.'+parts[1]),current.keys[header.kid],Buffer.from(parts[2],'base64url')))throw new Error('Invalid ID-token signature');
 return claims;
}
