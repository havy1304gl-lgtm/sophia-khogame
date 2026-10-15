export type ThemeId='infinity'|'stark'|'wakanda'|'sanctum'|'comic';
export type Appearance={theme:ThemeId;teamLayout:'right'|'left'|'top';cellLabels:'numbers'|'letters';pictureFit:'contain'|'cover';questionFontSize:number};
export const defaultAppearance:Appearance={theme:'infinity',teamLayout:'right',cellLabels:'numbers',pictureFit:'contain',questionFontSize:48};
export const themes:{id:ThemeId;name:string;tagline:string;background:string;accent:string}[]=[
 {id:'infinity',name:'Infinity War',tagline:'Hành trình đá vô cực',background:'/assets/cosmic-board-background.webp',accent:'#e9c67a'},
 {id:'stark',name:'Stark Lab',tagline:'Công nghệ & hologram',background:'/assets/v3/theme-stark-lab.webp',accent:'#66e4ff'},
 {id:'wakanda',name:'Wakanda',tagline:'Vibranium & ánh tím',background:'/assets/v3/theme-wakanda.webp',accent:'#ce98ff'},
 {id:'sanctum',name:'Sanctum',tagline:'Phép thuật & cổng không gian',background:'/assets/v3/theme-sanctum.webp',accent:'#ffbd6b'},
 {id:'comic',name:'Comic Avengers',tagline:'Màu sắc truyện tranh',background:'/assets/v3/theme-comic.webp',accent:'#ffdc59'},
];
export function cellLabel(index:number,mode:Appearance['cellLabels']){let n=index+1,s='';if(mode==='numbers')return String(n).padStart(2,'0');while(n>0){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26);}return s;}
