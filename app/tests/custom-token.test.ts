import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,verify} from 'node:crypto';
import {createFirebaseToken} from '../server/custom-token.ts';
test('Firebase custom token uses verifiable RS256 and binds role, uid, audience and one-hour expiry',()=>{
 const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
 const credential={client_email:'test@example.invalid',private_key:privateKey.export({type:'pkcs8',format:'pem'}).toString()};
 const token=createFirebaseToken('sophia-access-player',{sophiaRole:'player'},credential,false,1700000000000),[header,payload,signature]=token.split('.');
 assert.equal(verify('RSA-SHA256',Buffer.from(header+'.'+payload),publicKey,Buffer.from(signature,'base64url')),true);
 const body=JSON.parse(Buffer.from(payload,'base64url').toString());
 assert.equal(JSON.parse(Buffer.from(header,'base64url').toString()).alg,'RS256');
 assert.equal(body.uid,'sophia-access-player');assert.equal(body.iss,credential.client_email);assert.equal(body.sub,credential.client_email);
 assert.equal(body.aud,'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit');
 assert.equal(body.exp-body.iat,3600);assert.deepEqual(body.claims,{sophiaRole:'player'});
 assert.throws(()=>createFirebaseToken('x',{},null));
});
