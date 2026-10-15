import type {Question} from './engine';
export function needsEmbedding(url:string){if(url.startsWith('/api/media/'))return true;try{return ['localhost','127.0.0.1','[::1]'].includes(new URL(url).hostname);}catch{return false;}}
export async function embedLocalMedia(questions:Question[]){
 const result=structuredClone(questions),cache=new Map<string,string>();
 for(const q of result)for(const field of ['image','answerImage','audio'] as const){const url=q[field];if(!url||!needsEmbedding(url))continue;
  if(!cache.has(url)){
   const response=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!response.ok)throw new Error('Không tải được tệp trên máy cũ. Hãy upload lại ảnh/audio trước khi lưu online.');const blob=await response.blob();if(blob.size>10*1024*1024)throw new Error('Mỗi ảnh/audio tối đa 10 MB.');
   if(!/^(image\/(png|jpeg|webp|gif)|audio\/)/i.test(blob.type))throw new Error('Link tệp trên máy không trả về ảnh/audio hợp lệ. Hãy upload lại tệp.');
   const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Không đọc được tệp ảnh/audio.'));reader.readAsDataURL(blob);});cache.set(url,data);
  }
  q[field]=cache.get(url)!;
 }
 return result;
}
