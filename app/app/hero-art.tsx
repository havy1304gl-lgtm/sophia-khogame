const frames:Record<string,{box:string;width:number;height:number}>={
 cap:{box:'242 63 330 716',width:800,height:800},
 ironman:{box:'43 0 393 1000',width:480,height:1000},
 panther:{box:'27 2 321 787',width:400,height:789},
 'guardian-sky':{box:'0 0 640 960',width:640,height:960},
 'guardian-solar':{box:'0 0 640 960',width:640,height:960},
 'guardian-jade':{box:'0 0 640 960',width:640,height:960},
};
// Display the actual painted bounds, so transparent source margins do not shrink heroes.
export function HeroArt({hero,className='',label}:{hero:string;className?:string;label?:string}){
 const frame=frames[hero]??frames.ironman;
 return <svg className={'hero-art '+className} viewBox={frame.box} preserveAspectRatio="xMidYMid meet" role={label?'img':undefined} aria-label={label} aria-hidden={label?undefined:true}><image href={'/assets/'+hero+'.webp'} width={frame.width} height={frame.height}/></svg>;
}
