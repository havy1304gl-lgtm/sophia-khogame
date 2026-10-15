import {validateQuestion,type Question} from './engine.ts';
export const payloadPartSize=128000,maxPayloadBytes=40*1024*1024;
export function splitPayload(text:string,size=payloadPartSize){const parts:string[]=[];for(let start=0;start<text.length;){let end=Math.min(start+size,text.length);const last=text.charCodeAt(end-1);if(end<text.length&&last>=0xD800&&last<=0xDBFF)end--;if(end<=start)throw new Error('Phần dữ liệu quá nhỏ.');parts.push(text.slice(start,end));start=end;}return parts;}
export function packQuestions(questions:Question[]){
 if(!Array.isArray(questions)||questions.length<1||questions.length>500)throw new Error('Bộ đề cần 1–500 câu hỏi.');
 for(const q of questions){const errors=validateQuestion(q);if(errors.length)throw new Error(errors.join(' · '));}
 const text=JSON.stringify({schema:1,questions});if(new TextEncoder().encode(text).byteLength>maxPayloadBytes)throw new Error('Bộ đề kèm ảnh/audio tối đa 40 MB. Hãy giảm dung lượng tệp hoặc tách thành các bộ nhỏ.');return text;
}
export function unpackQuestions(parts:{index:number;text:string}[],expectedCount:number){
 const ordered=[...parts].sort((a,b)=>a.index-b.index);if(ordered.length!==expectedCount||ordered.some((p,i)=>p.index!==i||typeof p.text!=='string'))throw new Error('Đề tải chưa đủ. Vui lòng làm mới kho đề.');
 const text=ordered.map(p=>p.text).join(''),payload=JSON.parse(text);if(payload.schema!==1)throw new Error('Phiên bản đề chưa được hỗ trợ.');packQuestions(payload.questions);return {questions:payload.questions as Question[],text};
}
export async function payloadDigest(text:string){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(bytes)].map(n=>n.toString(16).padStart(2,'0')).join('');}
