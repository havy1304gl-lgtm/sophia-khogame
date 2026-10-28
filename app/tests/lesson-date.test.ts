import {test} from 'node:test';
import assert from 'node:assert/strict';
import {englishLessonDate} from '../lib/lesson-date.ts';

test('English heading uses the actual weekday and a superscript ordinal',()=>{
 const date=englishLessonDate('15/10/26');
 assert.equal(date?.text,'Thursday, October 15th, 2026');
 assert.equal(date?.iso,'2026-10-15');
 assert.match(date!.html,/15<sup style="font-size:65%">th<\/sup>/);
 assert.equal(englishLessonDate('28/10/2026')?.text,'Wednesday, October 28th, 2026');
});
test('Ordinals include the teen exceptions',()=>{
 for(const [day,suffix] of [[1,'st'],[2,'nd'],[3,'rd'],[11,'th'],[12,'th'],[13,'th'],[21,'st'],[22,'nd'],[23,'rd'],[31,'st']] as const)
  assert.equal(englishLessonDate(`${day}/01/26`)?.suffix,suffix);
});
test('Invalid dates cannot silently roll into the next month',()=>{
 for(const value of ['31/04/26','29/02/26','00/10/26','15/13/26','10/10/1','2026-10-15','<script>'])assert.equal(englishLessonDate(value),null);
 assert.equal(englishLessonDate('29/02/24')?.iso,'2024-02-29');
});
