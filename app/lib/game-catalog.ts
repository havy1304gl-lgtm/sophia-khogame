export type CatalogGame={id:string;title:string;description:string;url:string;cover?:string};
export const avengersGame={id:'avengers-infinity',title:'Avengers · Infinity Quest',description:'Assemble your team. Collect the stones. Change your destiny.'};
export const mysteryBoxGame={id:'superhero-mystery-box',title:'Superhero · Mystery Box',description:'Keep it. Give it. Change the game. Trả lời, chọn đội nhận và mở hộp bí ẩn.'};
// Future deployed games placed here appear for everyone, on every browser.
export const publishedGameLinks:CatalogGame[]=[];
export function mergeGameCatalog(local:CatalogGame[],published=publishedGameLinks):CatalogGame[]{const seen=new Set<string>();return [...published,...local].filter(g=>{const url=gameLink(g.url);if(!g.id||!g.title||!url||seen.has(g.id)||seen.has(url))return false;seen.add(g.id);seen.add(url);return true;});}
export function gameLink(input:string):string{
 const value=input.trim();if(value.startsWith('/')&&!value.startsWith('//')&&!/[\\\r\n]/.test(value))return value;
 try{const u=new URL(value);if(!['https:','http:'].includes(u.protocol)||u.username||u.password)return '';return u.href;}catch{return '';}
}
