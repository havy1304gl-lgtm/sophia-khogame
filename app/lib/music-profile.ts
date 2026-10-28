export type MusicGame='avengers'|'mystery';
export const musicTracks={avengers:{title:'Avengers',src:'/audio/avengers-theme.mp3',duration:123.45,introStart:78,description:'The Avengers · bản MP3 bạn cung cấp'},mystery:{title:'Mystery Box',src:'/audio/mystery-box-theme.wav',duration:38.4,introStart:0,description:'Midnight Boxes · nhạc không lời riêng cho Mystery Box'}} as const;
export type MusicScene='off'|'intro'|'lobby'|'gameplay'|'victory';
export type MusicSettings={enabled:boolean;introStart:number;introVolume:number;gameVolume:number};
export const musicDefaults:MusicSettings={enabled:true,introStart:78,introVolume:.5,gameVolume:.13};
export const musicDuration=123.45;
export function normalizeMusic(value:Partial<MusicSettings>={},game:MusicGame='avengers'):MusicSettings{
 const bounded=(n:unknown,base:number,min:number,max:number)=>typeof n==='number'&&Number.isFinite(n)?Math.max(min,Math.min(max,n)):base;
 return {enabled:typeof value.enabled==='boolean'?value.enabled:true,introStart:bounded(value.introStart,musicTracks[game].introStart,0,musicTracks[game].duration-5),introVolume:bounded(value.introVolume,.5,0,.8),gameVolume:bounded(value.gameVolume,.13,0,.5)};
}
export function musicLevel(scene:MusicScene,settings:MusicSettings,muted=false,ducked=false){if(scene==='off'||!settings.enabled||muted)return 0;const level=scene==='intro'?settings.introVolume:settings.gameVolume;return level*(ducked?.25:1);}
