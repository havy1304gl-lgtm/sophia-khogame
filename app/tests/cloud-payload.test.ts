import {test} from 'node:test';import assert from 'node:assert/strict';
import {splitPayload,packQuestions,unpackQuestions,payloadDigest} from '../lib/cloud-payload.ts';
import {blankQuestion} from '../lib/engine.ts';

test('Cloud payload preserves optional hints and accepts legacy questions without hints',()=>{
 const q={...blankQuestion(),question:'Test',answer:'Yes',hint:'Try a verb.\nGợi ý tiếng Việt.'};
 const {hint:omittedHint,...legacy}=q;
 const text=packQuestions([q,legacy]);const parts=splitPayload(text);
 const loaded=unpackQuestions(parts.map((text,index)=>({text,index})),parts.length).questions;
 assert.equal(loaded[0].hint,q.hint);assert.equal(loaded[1].hint,undefined);
});
test('Question payload preserves mixed questions, Unicode, embedded media and explanations across parts',async()=>{const questions=[{...blankQuestion(),question:'Chọn mùa ☀️',answer:'AC',type:'mcq' as const,options:['Spring','Monday','Winter',''],explanation:'Spring and winter.',image:'data:image/png;base64,'+'A'.repeat(300000)},{...blankQuestion(),question:'True?',answer:'true',type:'truefalse' as const}];const text=packQuestions(questions),parts=splitPayload(text),read=unpackQuestions(parts.map((text,index)=>({text,index})).reverse(),parts.length);assert.deepEqual(read.questions,questions);assert.equal(await payloadDigest(read.text),await payloadDigest(text));assert(parts.every(p=>p.length<=128000));});
test('Chunk boundaries never split a Unicode surrogate pair and incomplete data is rejected',()=>{const text='A'.repeat(7)+'😀'+'B'.repeat(15),parts=splitPayload(text,8);assert.equal(parts.join(''),text);assert(parts.every(p=>!/^[\uDC00-\uDFFF]|[\uD800-\uDBFF]$/.test(p)));assert.throws(()=>unpackQuestions([{index:0,text:'{}'}],2));assert.throws(()=>packQuestions([]));});
