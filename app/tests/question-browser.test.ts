import {test} from 'node:test';
import assert from 'node:assert/strict';
import {browseQuizzes,folderTrail} from '../lib/question-browser.ts';
import type {Quiz} from '../lib/engine.ts';
import type {Folder} from '../lib/permissions.ts';
const make=(id:string,title:string,folderId:string|null,deletedAt:string|null=null):Quiz=>({id,title,folderId,deletedAt,description:'',owner:'teacher',version:1,updatedAt:'2026-10-29',questions:[]});
const banks=[make('root','Đề lớp 10',null),make('nested','Đề lớp 9','g9'),make('deleted','Đề cũ','g9','2026-10-28')];
const defaults={folder:null,trash:false,all:false,search:'',sort:'name' as const};
test('folder browsing separates root, current folder, all banks and trash',()=>{
 assert.deepEqual(browseQuizzes(banks,defaults).map(q=>q.id),['root']);
 assert.deepEqual(browseQuizzes(banks,{...defaults,folder:'g9'}).map(q=>q.id),['nested']);
 assert.deepEqual(browseQuizzes(banks,{...defaults,all:true}).map(q=>q.id),['nested','root']);
 assert.deepEqual(browseQuizzes(banks,{...defaults,trash:true}).map(q=>q.id),['deleted']);
 assert.equal(banks.length,3);
});
test('accent-insensitive root search finds filed banks; folder search stays scoped',()=>{
 assert.deepEqual(browseQuizzes(banks,{...defaults,search:'de lop 9'}).map(q=>q.id),['nested']);
 assert.deepEqual(browseQuizzes(banks,{...defaults,folder:'other',search:'de lop 9'}),[]);
});
test('nested breadcrumbs follow renames and safely handle deleted ancestors and cycles',()=>{
 const folders:Folder[]=[{id:'g9',name:'Lớp 9',parentId:null,owner:'t'},{id:'term',name:'Học kỳ 1',parentId:'g9',owner:'t'}];
 assert.deepEqual(folderTrail(folders,'term').map(f=>f.name),['Lớp 9','Học kỳ 1']);
 assert.deepEqual(folderTrail([{...folders[0],deletedAt:'now'},folders[1]],'term').map(f=>f.id),['term']);
 assert.equal(folderTrail([{...folders[0],parentId:'term'},folders[1]],'term').length,2);
});
test('newest sorting preserves source order and uses name as a stable fallback',()=>{
 const rows=[{...banks[0],updatedAt:'2026-10-28'},{...banks[1],updatedAt:'2026-10-29'}];
 assert.deepEqual(browseQuizzes(rows,{...defaults,all:true,sort:'updated'}).map(q=>q.id),['nested','root']);
 assert.deepEqual(rows.map(q=>q.id),['root','nested']);
});
