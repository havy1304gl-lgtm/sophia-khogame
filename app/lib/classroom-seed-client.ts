import {cloudEnabled} from './firebase';
import {getAuthState} from './cloud-auth';
import {cleanClassroomSeed,type ClassroomSeed} from './classroom-seed';
async function headers():Promise<Record<string,string>>{if(!cloudEnabled)return{};const user=getAuthState().user;if(!user)throw new Error('Vui lòng vào lại SOPHIA.');return{Authorization:'Bearer '+await user.getIdToken()};}
export async function loadClassroomSeed():Promise<ClassroomSeed|null>{
 const response=await fetch('/.netlify/functions/classroom-seed',{headers:await headers(),cache:'no-store',signal:AbortSignal.timeout(12000)});if(response.status===404)return null;
 const data=await response.json() as {error?:string};if(!response.ok)throw new Error(data.error||'Chưa tải được lớp có sẵn.');return cleanClassroomSeed(data);
}
export async function publishClassroomSeed(seed:ClassroomSeed){
 const response=await fetch('/.netlify/functions/classroom-seed',{method:'POST',headers:{...await headers(),'Content-Type':'application/json'},body:JSON.stringify(cleanClassroomSeed(seed)),cache:'no-store'}),data=await response.json() as {error?:string;classCount:number;studentCount:number};if(!response.ok)throw new Error(data.error||'Chưa lưu được lớp mặc định.');return data as {classCount:number;studentCount:number};
}
