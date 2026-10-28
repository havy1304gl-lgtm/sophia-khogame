import {test} from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import {readExcel} from '../lib/excel.ts';
import {readJSONQuestions,exportExcel} from '../lib/excel.ts';

async function fixture(headers:string[],rows:unknown[][]){const book=new ExcelJS.Workbook();const sheet=book.addWorksheet('Questions');sheet.addRow(headers);rows.forEach(row=>sheet.addRow(row));const bytes=await book.xlsx.writeBuffer();return new File([bytes as any],'mixed.xlsx');}

test('Optional hints survive Excel, JSON and exported Excel; old files remain compatible',async()=>{
 const hint='Dùng thì hiện tại đơn.\nChú ý chủ ngữ.';
 const [row]=await readExcel(await fixture(['question','answer','hint'],[['She ___ to school.','goes',hint]]));
 assert.equal(row.question.hint,hint);assert.deepEqual(row.errors,[]);
 const [legacy]=await readExcel(await fixture(['question','answer'],[['Hello?','Hello!']]));
 assert.equal(legacy.question.hint,'');
 const [json]=await readJSONQuestions(new File([JSON.stringify({questions:[row.question]})],'hint.json'));
 assert.equal(json.question.hint,hint);
 const previousDocument=globalThis.document,previousCreate=URL.createObjectURL,previousRevoke=URL.revokeObjectURL,previousTimeout=globalThis.setTimeout;
 let saved:Blob|undefined;
 try{
  globalThis.document={createElement:()=>({href:'',download:'',click(){}})} as any;
  URL.createObjectURL=(blob:Blob)=>{saved=blob;return 'blob:test';};URL.revokeObjectURL=()=>{};
  globalThis.setTimeout=(()=>0) as any;
  await exportExcel([row.question]);assert(saved);
  const [roundtrip]=await readExcel(new File([saved],'export.xlsx'));
  assert.equal(roundtrip.question.hint,hint);assert.equal(roundtrip.question.answer,'goes');
 }finally{globalThis.document=previousDocument;URL.createObjectURL=previousCreate;URL.revokeObjectURL=previousRevoke;globalThis.setTimeout=previousTimeout;}
});
test('Excel infers mixed short/AB/ABC/ABCD questions without a type column and keeps explanations',async()=>{
 const file=await fixture(['question','answer','option_a','option_b','option_c','option_d','explanation','answer_image_url'],[
  ['Say hello.','Hello!','','','','','Chấp nhận lời chào đúng.',''],
  ['One option','A','Yes','','','','',''],
  ['Two options','B','Red','Green','','','Green = go.',''],
  ['Three options','AC','Spring','Monday','Winter','','Two seasons.','/assets/seasons-original.webp'],
  ['Four options','D','One','Two','Three','Four','',''],
 ]);
 const rows=await readExcel(file);assert.equal(rows.length,5);assert.deepEqual(rows.map(r=>r.question.type),['open','mcq','mcq','mcq','mcq']);assert(rows.every(r=>r.errors.length===0));assert.equal(rows[3].question.explanation,'Two seasons.');assert.equal(rows[3].question.answerImage,'/assets/seasons-original.webp');
});
test('Excel retains explicit true/false and reports invalid option targets',async()=>{
 const rows=await readExcel(await fixture(['type','question','answer','option_a','option_b'],[['truefalse','There are four seasons.','TRUE','',''],['mcq','Invalid answer','D','Yes','No']]));assert.equal(rows[0].question.answer,'true');assert.equal(rows[0].errors.length,0);assert(rows[1].errors.length>0);
});
test('Minimal quiz accepts only question and answer, with all media and points omitted',async()=>{
 const rows=await readExcel(await fixture(['question','answer'],[['Say one fruit.','Apple.']]));
 assert.equal(rows.length,1);assert.deepEqual(rows[0].errors,[]);assert.equal(rows[0].question.points,5);
 assert.equal(rows[0].question.seconds,0);for(const key of ['image','answerImage','audio','explanation','topic'] as const)assert.equal(rows[0].question[key],'');
});
