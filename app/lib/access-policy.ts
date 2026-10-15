export type AccessRole='admin'|'player';
export const accessHours=12;
export function sessionRole(claims:Record<string,unknown>,now=Date.now()):AccessRole|null{
 if(typeof claims.sophiaSessionUntil!=='number'||!Number.isFinite(claims.sophiaSessionUntil)||claims.sophiaSessionUntil<=now)return null;
 return claims.sophiaRole==='admin'||claims.sophiaRole==='player'?claims.sophiaRole:null;
}
export function canManage(role:AccessRole|null){return role==='admin';}
