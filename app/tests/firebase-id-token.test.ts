import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {verifyFirebaseIdToken} from '../server/firebase-id-token.ts';
const {publicKey,privateKey}=generateKeyPairSync('rsa',{modulusLength:2048}),now=1800000000000,seconds=now/1000;
const claims={sub:'teacher',aud:'test-project',iss:'https://securetoken.google.com/test-project',iat:seconds-1,auth_time:seconds-60,exp:seconds+3600,sophiaRole:'admin',sophiaSessionUntil:now+43200000,sophiaAccessVersion:'v1'};
const encode=(value:unknown)=>Buffer.from(JSON.stringify(value)).toString('base64url');
function token(patch:Record<string,unknown>={},header:Record<string,unknown>={}){const body=encode({alg:'RS256',kid:'known',...header})+'.'+encode({...claims,...patch});return body+'.'+sign('RSA-SHA256',Buffer.from(body),privateKey).toString('base64url');}
const fetcher=(async()=>new Response(JSON.stringify({known:publicKey.export({type:'spki',format:'pem'})}),{headers:{'cache-control':'public, max-age=3600'}})) as typeof fetch;
test('valid Google-key-signed Firebase ID token passes with its original role claims',async()=>{assert.deepEqual(await verifyFirebaseIdToken(token(),'test-project',{now,fetcher}),claims);});
test('wrong project, expired/future claims, empty uid, algorithm confusion and unknown keys fail',async()=>{for(const patch of [{aud:'other'},{iss:'https://other'},{exp:seconds},{iat:seconds+10},{auth_time:seconds+10},{sub:''}])await assert.rejects(verifyFirebaseIdToken(token(patch),'test-project',{now,fetcher}));await assert.rejects(verifyFirebaseIdToken(token({}, {alg:'none'}),'test-project',{now,fetcher}));await assert.rejects(verifyFirebaseIdToken(token({}, {kid:'unknown'}),'test-project',{now,fetcher}));});
test('tampered payloads and unavailable Google signing keys fail closed',async()=>{const parts=token().split('.');parts[1]=encode({...claims,sophiaRole:'player'});await assert.rejects(verifyFirebaseIdToken(parts.join('.'),'test-project',{now,fetcher}));await assert.rejects(verifyFirebaseIdToken(token(),'test-project',{now,fetcher:(async()=>new Response('unavailable',{status:503})) as typeof fetch}));});
