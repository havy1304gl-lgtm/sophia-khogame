'use client';
import {useId} from 'react';
import './question-hint.css';

export function QuestionHint({hint,shown,onToggle}:{hint?:string;shown:boolean;onToggle:()=>void}){
 const id=useId();
 if(!hint?.trim())return null;
 return <div className="question-hint">
  <button type="button" className="button" data-no-zoom aria-expanded={shown} aria-controls={id} onClick={onToggle}>{shown?'Ẩn gợi ý':'Hiện gợi ý'}</button>
  {shown&&<div id={id} className="question-hint-content"><strong>Gợi ý</strong><p>{hint}</p></div>}
 </div>;
}
