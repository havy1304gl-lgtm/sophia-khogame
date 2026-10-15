import {accessEndpoint} from '../../server/firebase-admin';
export default async function(request:Request,context:{ip:string}){return accessEndpoint(request,context.ip);}
