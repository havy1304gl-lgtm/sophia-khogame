import {createSign} from 'node:crypto';
type Credential={client_email:string;private_key:string};
// Firebase's documented custom-token format. The private key stays server-side.
export function createFirebaseToken(uid:string,claims:Record<string,unknown>,credential:Credential|null,emulator=false,now=Date.now()){
 if(!uid||uid.length>128)throw new Error('Invalid uid');
 if(!credential&&!emulator)throw new Error('Missing signing credential');
 const issued=Math.floor(now/1000),email=credential?.client_email??'emulator@example.invalid';
 const encode=(value:unknown)=>Buffer.from(JSON.stringify(value)).toString('base64url');
 const body=encode({alg:credential?'RS256':'none',typ:'JWT'})+'.'+encode({iss:email,sub:email,aud:'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',iat:issued,exp:issued+3600,uid,claims});
 if(!credential)return body+'.';
 const signer=createSign('RSA-SHA256');signer.update(body);signer.end();
 return body+'.'+signer.sign(credential.private_key).toString('base64url');
}
