export type MusicScene='off'|'intro'|'lobby'|'gameplay'|'victory';
export type MusicSettings={enabled:boolean;introStart:number;introVolume:number;gameVolume:number};
export const musicDefaults:MusicSettings={enabled:true,introStart:78,introVolume:.5,gameVolume:.13};
export const musicDuration=123.45;
export function normalizeMusic(value:Partial<MusicSettings>={}):MusicSettings{
 const bounded=(n:unknown,base:number,min:number,max:number)=>typeof n==='number'&&Number.isFinite(n)?Math.max(min,Math.min(max,n)):base;
 return {enabled:typeof value.enabled==='boolean'?value.enabled:true,introStart:bounded(value.introStart,musicDefaults.introStart,0,musicDuration-5),introVolume:bounded(value.introVolume,.5,0,.8),gameVolume:bounded(value.gameVolume,.13,0,.5)};
}
export function musicLevel(scene:MusicScene,settings:MusicSettings,muted=false,ducked=false){if(scene==='off'||!settings.enabled||muted)return 0;const level=scene==='intro'?settings.introVolume:settings.gameVolume;return level*(ducked?.25:1);}
