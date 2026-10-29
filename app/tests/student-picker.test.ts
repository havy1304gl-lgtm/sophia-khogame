import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chatPlan,defaultPickerSettings,drawStudents,eligibleStudents,todayAttendance,readClassBackup,mergeClassImport,normalizePickerSettings,updatePickerSettings,parseStudentLines,restoreClasses,shuffled,studentLabel,type SchoolClass,type PickRecord} from '../lib/student-picker.ts';
import {buildUfoBeats,ufoBeatAt,chooseDialogue,defaultDialogue,dialogueGroups,renderDialogue} from '../lib/picker-dialogue.ts';
import {makeObstacles,simulatePlinko} from '../lib/picker-plinko.ts';
const c:SchoolClass={id:'class-a',name:'Lớp 7A',students:Array.from({length:8},(_,i)=>({id:`s${i}`,name:i<2?'Nguyễn Minh Anh':`Bạn ${i}`,number:String(i+1),present:i!==7}))};
test('Selection excludes absentees and only excludes calls in the selected class and session',()=>{
 const records:PickRecord[]=[{id:'r',classId:'class-a',session:'today',at:'',mode:'quick',students:[c.students[0]]},{id:'old',classId:'class-a',session:'yesterday',at:'',mode:'chat',students:[c.students[1]]},{id:'other',classId:'class-b',session:'today',at:'',mode:'pasture',students:[c.students[2]]}];
 assert.deepEqual(eligibleStudents(c,records,'today',true).map(s=>s.id),['s1','s2','s3','s4','s5','s6']);
 assert.equal(eligibleStudents(c,records,'today',false).length,7);
 assert.equal(eligibleStudents(c,records.filter(r=>r.id!=='r'),'today',true).length,7);
});
test('A batch contains distinct IDs including students with duplicate names and does not mutate the roster',()=>{
 const before=structuredClone(c.students),draw=drawStudents(c.students,8,()=>0);
 assert.equal(draw.length,8);assert.equal(new Set(draw.map(s=>s.id)).size,8);assert.deepEqual(c.students,before);
 assert.throws(()=>drawStudents(c.students,9));assert.throws(()=>drawStudents(c.students,0));assert.throws(()=>drawStudents(c.students,1.5));
});
test('Fisher-Yates produces every permutation for a three-person roster without index preference',()=>{
 const permutations=new Set<string>();
 for(let first=0;first<3;first++)for(let second=0;second<2;second++){let call=0;permutations.add(shuffled([0,1,2],()=>call++===0?first:second).join(''));}
 assert.equal(permutations.size,6);
});
test('Chat reaches exactly the selected winners with up to three distinct busy contacts and coherent parent roles',()=>{
 const winners=c.students.slice(0,3),contacts=chatPlan(c.students,winners,{...defaultPickerSettings,busy:80,parent:'father'},()=>0);
 assert.deepEqual(contacts.filter(x=>x.accepted).map(x=>x.student.id),winners.map(s=>s.id));
 assert.equal(contacts.filter(x=>!x.accepted).length,3);assert.equal(new Set(contacts.map(x=>x.student.id)).size,contacts.length);assert.ok(contacts.every(x=>x.parent==='father'));
 assert.equal(chatPlan(c.students,winners,{...defaultPickerSettings,busy:0},()=>0).length,3);
 assert.equal(chatPlan(winners,winners,defaultPickerSettings,()=>0).length,3);
});
test('Roster input supports Excel paste, CSV, numbered lines, and preserves names',()=>{
 const rows=parseStudentLines('STT\tHọ tên\n01\tNguyễn Minh Anh\n02\tTrần Gia Bảo\n\n');
 assert.deepEqual(rows.map(({number,name})=>({number,name})),[{number:'01',name:'Nguyễn Minh Anh'},{number:'02',name:'Trần Gia Bảo'}]);
 assert.equal(parseStudentLines('1. Lê Ngọc Châu')[0].name,'Lê Ngọc Châu');
 assert.equal(parseStudentLines('1,"Nguyễn, Minh Anh"')[0].name,'Nguyễn, Minh Anh');
 assert.equal(parseStudentLines('Phạm Đức Duy',9)[0].number,'9');
 assert.notEqual(rows[0].id,rows[1].id);
});
test('Imported classes get fresh IDs and reject invalid rosters and unsafe avatar formats',()=>{
 const restored=restoreClasses([{...c,students:[{...c.students[0],avatar:'data:image/svg+xml;base64,bad'}]}]);
 assert.notEqual(restored[0].id,c.id);assert.notEqual(restored[0].students[0].id,c.students[0].id);assert.equal(restored[0].students[0].avatar,undefined);
 assert.throws(()=>restoreClasses([{name:'A',students:[{name:''}]}]));assert.throws(()=>restoreClasses([]));
});
test('Dialogue respects disabled groups, recent-line avoidance, and replacement variables',()=>{
 const pool=defaultDialogue.filter(l=>l.group==='caught'),picked=chooseDialogue(pool,'caught',[pool[0].id],()=>0);
 assert.equal(picked?.id,pool[1].id);assert.equal(chooseDialogue(pool.map(l=>({...l,enabled:false})),'caught',[]),null);
 assert.equal(renderDialogue('{Thầy/Cô} {TênGV} gọi {TênHS}, lớp {TênLớp}; {thầy/cô} chào em.',{student:c.students[0],className:c.name,settings:{...defaultPickerSettings,teacherGender:'male',teacherName:'Minh'}}),'Thầy Minh gọi Nguyễn Minh Anh, lớp Lớp 7A; thầy chào em.');
 for(const group of dialogueGroups)assert.ok(defaultDialogue.some(l=>l.group===group.id));
 assert.equal(studentLabel(c.students[0],'number'),'1');assert.equal(studentLabel(c.students[0],'name',true),'Minh Anh');
});
test('Each mode remembers its own count and presentation; chat is always a single student',()=>{
 let s=normalizePickerSettings({mode:'pasture',count:5,hold:2});assert.equal(s.count,5);assert.ok(s.hold>=5);
 s=updatePickerSettings(s,{count:4,speed:1.6,hold:9});s=updatePickerSettings(s,{mode:'plinko'});assert.equal(s.count,1);assert.equal(s.speed,1);
 s=updatePickerSettings(s,{count:3,terrain:'zigzag'});s=updatePickerSettings(s,{mode:'chat',count:8});assert.equal(s.count,1);assert.equal(s.counts.chat,1);
 s=updatePickerSettings(s,{mode:'pasture'});assert.equal(s.count,4);assert.equal(s.speed,1.6);assert.equal(s.hold,9);
 s=updatePickerSettings(s,{mode:'plinko'});assert.equal(s.count,3);assert.equal(s.terrain,'zigzag');
});
test('UFO lines keep a full reading interval, including long lines, independently of motion speed',()=>{
 const settings={...defaultPickerSettings,speed:2.5,hold:6};const plan=buildUfoBeats(c.students.slice(0,2),settings,c.name,group=>({id:group,group,enabled:true,text:group==='caught'?'A long readable line. '.repeat(8):'Hello {TênHS}'}));
 assert.equal(plan.beats.length,2);for(const row of plan.beats)for(const beat of row)if(beat.text)assert.ok(beat.end-beat.start>=6);
 const caught=plan.beats[0][4];assert.ok(caught.end-caught.start>10);assert.equal(ufoBeatAt(caught.start+1,plan.duration,plan.beats).text,caught.text);assert.equal(ufoBeatAt(plan.duration+.1,plan.duration,plan.beats).slot,1);
});
test('Plinko terrains differ, collisions are finite and deterministic, and final bins match the independent draw',()=>{
 const terrains=['pegs','zigzag','pinball','mixed'] as const;for(const terrain of terrains)assert.ok(makeObstacles(terrain,'light').length<makeObstacles(terrain,'dense').length);const signatures=terrains.map(t=>JSON.stringify(makeObstacles(t,'normal')));assert.equal(new Set(signatures).size,4);
 const board=makeObstacles('mixed','normal'),paths=simulatePlinko(6,[1,4],board,10,'fixed-seed');assert.equal(paths.length,6);assert.ok(paths.some(p=>p.some(f=>f.hit)));
 for(const [i,path] of paths.entries()){assert.ok(path.every(p=>Number.isFinite(p.x+p.y)&&p.x>=10&&p.x<=990));const last=path[path.length-1];assert.equal(last.y,1045);if([1,4].includes(i))assert.ok(last.x>450&&last.x<550);else assert.ok(last.x<250||last.x>750);}
 assert.deepEqual(paths,simulatePlinko(6,[1,4],board,10,'fixed-seed'));
});

test('Aura Guild imports student rosters and individual participants, preserving names and numbers while excluding teams and score data',()=>{
 const backup={format:'aura-guild',version:1,classrooms:[{id:'a',name:'Lớp Á',students:[{id:'p',name:'Nguyễn Ánh',rosterNumber:'007',isTeam:false,currentSessionAura:999,notes:'not roster data'}],participants:[{name:'Đội 1',isTeam:true}]},{id:'b',name:'Lớp B',students:[],participants:[{name:'Trần Bảo',rosterNumber:12,isTeam:false},{name:'Đội 2',isTeam:true}]},{id:'c',name:'Thi đua',students:[],participants:[{name:'Lớp A',isTeam:true}]},{id:'d',name:'Trống',students:[],participants:[]}]};
 const parsed=readClassBackup(backup);assert.equal(parsed.classes.length,2);assert.equal(parsed.skippedEmpty,2);assert.equal(parsed.classes[0].students[0].name,'Nguyễn Ánh');assert.equal(parsed.classes[0].students[0].number,'007');assert.equal(parsed.classes[1].students[0].number,'12');assert.equal('notes' in parsed.classes[0].students[0],false);assert.equal('currentSessionAura' in parsed.classes[0].students[0],false);
 const first=mergeClassImport([c],parsed.classes);assert.equal(first.classes[0],c);assert.equal(first.added.length,2);
 const repeated=mergeClassImport(first.classes,readClassBackup(backup).classes);assert.equal(repeated.added.length,0);assert.equal(repeated.skipped,2);assert.equal(repeated.classes.length,3);
 const roundtrip=readClassBackup({classes:parsed.classes});assert.equal(mergeClassImport(first.classes,roundtrip.classes).added.length,0);
 assert.throws(()=>readClassBackup({format:'aura-guild',classrooms:[{id:'x',name:'X',students:[{name:'',isTeam:false}]}]}));
});

test('Attendance keeps today edits and resets absences on the next day without changing names or IDs',()=>{
 const absent={...c,attendanceDate:'2026-10-28',students:c.students.map(s=>({...s,present:false}))};
 const same=todayAttendance([absent],'2026-10-28')[0];assert.equal(same.students.filter(s=>s.present).length,0);
 const next=todayAttendance([absent],'2026-10-29')[0];assert.equal(next.students.filter(s=>s.present).length,c.students.length);assert.deepEqual(next.students.map(s=>[s.id,s.name,s.number]),c.students.map(s=>[s.id,s.name,s.number]));assert.equal(absent.students[0].present,false);
 const legacy=todayAttendance([{...c,students:[{...c.students[0],present:false}]}],'2026-10-28')[0];assert.equal(legacy.students[0].present,false);assert.equal(legacy.attendanceDate,'2026-10-28');
});
