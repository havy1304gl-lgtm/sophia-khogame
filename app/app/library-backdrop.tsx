import {useState,type CSSProperties} from 'react';
import {Image as ImageIcon} from 'lucide-react';
import './library-backdrop.css';
export type LibrarySection='games'|'questions'|'picker';
const key='sophia-section-backgrounds';
const covers={games:'/assets/library-covers/games.webp',questions:'/assets/student-picker/covers/library.webp',picker:'/assets/library-covers/moments.webp'};
type Preferences={opacity:number;blur:number};
export function readBackdrop(section:LibrarySection):Preferences{try{const v=JSON.parse(localStorage.getItem(key)||'{}')[section];return {opacity:Math.max(0,Math.min(100,Number(v?.opacity??20))),blur:Math.max(0,Math.min(16,Number(v?.blur??1)))};}catch{return {opacity:20,blur:1};}}
export function LibraryBackdrop({section}:{section:LibrarySection}){
 const [preferences,setPreferences]=useState(()=>readBackdrop(section));
 function update(patch:Partial<Preferences>){const next={...preferences,...patch};setPreferences(next);try{const saved=JSON.parse(localStorage.getItem(key)||'{}');localStorage.setItem(key,JSON.stringify({...saved,[section]:next}));}catch{/* The current preview still works when storage is unavailable. */}}
 return <><div className="library-backdrop" aria-hidden="true" style={{'--section-cover':`url("${covers[section]}")`,'--section-opacity':preferences.opacity/100,'--section-blur':preferences.blur+'px'} as CSSProperties}/><details className="library-background-controls"><summary><ImageIcon size={15}/>Ảnh nền</summary><div><strong>Nền bìa phía sau</strong><label>Độ rõ · {preferences.opacity}%<input aria-label="Độ rõ ảnh nền" type="range" min="0" max="100" value={preferences.opacity} onChange={e=>update({opacity:Number(e.target.value)})}/></label><label>Làm mờ · {preferences.blur}px<input aria-label="Độ mờ ảnh nền" type="range" min="0" max="16" value={preferences.blur} onChange={e=>update({blur:Number(e.target.value)})}/></label><small>0% để ẩn ảnh. Lưu riêng cho từng khu trên trình duyệt này.</small><button type="button" onClick={()=>update({opacity:20,blur:1})}>Mặc định</button></div></details></>;
}
