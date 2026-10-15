import {teamHeroes} from '../lib/team-heroes';
import {HeroArt} from './hero-art';
export function TeamHeroPicker({value,onChange,label}:{value:string;onChange:(id:string)=>void;label:string}){
 return <details className="team-hero-picker"><summary><HeroArt hero={value}/><span>{teamHeroes.find(h=>h.id===value)?.name??'Chọn nhân vật'}<small>Đổi ảnh đội</small></span></summary><fieldset><legend>{label}</legend><div className="team-hero-options">{teamHeroes.map(h=><button type="button" key={h.id} aria-label={label+' · '+h.name} aria-pressed={value===h.id} className={value===h.id?'selected':''} onClick={()=>onChange(h.id)}><HeroArt hero={h.id}/><span>{h.name}</span></button>)}</div><p>Chọn ảnh đội khác đang dùng sẽ đổi ảnh giữa hai đội.</p></fieldset></details>;
}
