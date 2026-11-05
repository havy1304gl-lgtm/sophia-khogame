// Vietnamese recordings supplied by the user, split locally on 2026-11-05.
// Low/high voice ranges are grouped for the fictional parent voices; no English TTS fallback.
export const vietnameseGreetings:{male:string[];female:string[]}={"male": ["/audio/picker/vi/vi-greeting-02-v2.mp3", "/audio/picker/vi/vi-greeting-03-v2.mp3", "/audio/picker/vi/vi-greeting-06-v2.mp3"], "female": ["/audio/picker/vi/vi-greeting-01-v2.mp3", "/audio/picker/vi/vi-greeting-04-v2.mp3", "/audio/picker/vi/vi-greeting-05-v2.mp3", "/audio/picker/vi/vi-greeting-07-v2.mp3", "/audio/picker/vi/vi-greeting-08-v2.mp3"]};
export function greetingRecording(voice:'male'|'female',random:()=>number=Math.random){const clips=vietnameseGreetings[voice];return clips.length?clips[Math.min(clips.length-1,Math.floor(random()*clips.length))]:null;}
export const hasVietnameseGreetings=()=>vietnameseGreetings.male.length+vietnameseGreetings.female.length>0;
