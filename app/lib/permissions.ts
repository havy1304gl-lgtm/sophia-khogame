export type Folder={id:string;name:string;owner:string;parentId:string|null;deletedAt?:string|null;permission?:'view'|'edit'};
export type Member={id:string;email:string;name:string;role:string;enabled:number;canCreate:number};
export type Grant={id:string;target:'quiz'|'folder';targetId:string;email:string;level:'view'|'edit'};
export function access(user:Member,target:'quiz'|'folder',item:{id:string;owner:string;folderId?:string|null;parentId?:string|null;deletedAt?:string|null},folders:Folder[],grants:Grant[]):'view'|'edit'|null{
 if(!user.enabled)return null;if(user.role==='admin'||item.owner===user.id)return 'edit';if(item.deletedAt)return null;
 let level:'view'|'edit'|null=null;
 const check=(type:string,id:string)=>{for(const g of grants)if(g.target===type&&g.targetId===id&&g.email.toLowerCase()===user.email.toLowerCase()){if(g.level==='edit')level='edit';else if(!level)level='view';}};
 check(target,item.id);let id=target==='folder'?item.parentId:item.folderId;const seen=new Set<string>();while(id&&!seen.has(id)){seen.add(id);const f=folders.find(f=>f.id===id);if(!f||f.deletedAt)break;if(f.owner===user.id)return 'edit';check('folder',id);id=f.parentId;}return level;
}
