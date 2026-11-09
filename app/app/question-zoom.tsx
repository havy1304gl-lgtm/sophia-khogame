'use client';
import {useEffect,useId,useRef,type ReactNode} from 'react';
import {answerKeys,type Question} from '../lib/engine';

export type ZoomQuestionModel={id:string;question:Question;selected:number[];shown:boolean;select:(index:number)=>void;reveal:()=>void};
const interactive='button,input,select,textarea,a,audio,[data-no-zoom]';
export const isZoomControl=(target:EventTarget|null)=>target instanceof Element&&!!target.closest(interactive);

// The viewer receives live state and the same callbacks used by the game.
export function ZoomQuestionSurface({question,selected,shown,select,reveal,children}:{question:Question;selected:number[];shown:boolean;select:(index:number)=>void;reveal:()=>void;children:ReactNode}){
 const key=useId(),id=key+question.id,model={id,question,selected,shown,select,reveal},latest=useRef(model);latest.current=model;
 useEffect(()=>{window.dispatchEvent(new CustomEvent('sophia-question-zoom-update',{detail:latest.current}));});
 useEffect(()=>()=>{window.dispatchEvent(new CustomEvent('sophia-question-zoom-remove',{detail:id}));},[id]);
 return <div data-question-zoom onDoubleClick={e=>{if(isZoomControl(e.target))return;e.preventDefault();e.stopPropagation();window.getSelection()?.removeAllRanges();window.dispatchEvent(new CustomEvent('sophia-question-zoom-open',{detail:latest.current}));}}>{children}</div>;
}

export function ZoomQuestionContent({model}:{model:ZoomQuestionModel}){
 const {question:q,selected,shown,select,reveal}=model,options=q.type==='truefalse'?['True','False']:q.options;
 const correct=q.type==='truefalse'?[q.answer.toLowerCase()==='true'?0:1]:answerKeys(q.answer).map(k=>'ABCD'.indexOf(k));
 return <div className="zoom-live-question"><span className="zoom-topic">{q.topic||'QUESTION'}</span><h2>{q.question}</h2>{q.image&&<img className="question-media" src={q.image} alt="Hình minh họa câu hỏi"/>}{q.type!=='open'&&<div className="answer-options">{options.map((option,i)=>option&&<button type="button" key={i} disabled={shown} aria-pressed={selected.includes(i)} className={[selected.includes(i)?'selected':'',shown&&correct.includes(i)?'zoom-correct':''].join(' ')} onClick={()=>select(i)}><span>{q.type==='truefalse'?(i===0?'T':'F'):'ABCD'[i]}</span>{option}</button>)}</div>}<button type="button" className="zoom-answer-toggle" onClick={reveal}>{shown?'Hide Answer':'Show Answer'}</button>{shown&&<div className="zoom-answer" aria-live="polite"><span>ANSWER</span><strong>{q.type==='mcq'?correct.map(i=>`${'ABCD'[i]} · ${q.options[i]}`).join(' / '):q.answer}</strong>{q.explanation&&<p>{q.explanation}</p>}{q.answerImage&&<img className="question-media" src={q.answerImage} alt="Ảnh đáp án / lời giải"/>}</div>}</div>;
}
