// Classroom dates use day/month/year; two-digit years mean 2000–2099.
export function englishLessonDate(value:string){
 const match=/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(value.trim());
 if(!match)return null;
 const day=Number(match[1]),month=Number(match[2]),year=Number(match[3])+(match[3].length===2?2000:0);
 if(year<1000||year>9999)return null;
 const date=new Date(Date.UTC(year,month-1,day));
 if(date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day)return null;
 const suffix=day%100>=11&&day%100<=13?'th':({1:'st',2:'nd',3:'rd'}[day%10]??'th');
 const weekday=new Intl.DateTimeFormat('en-US',{weekday:'long',timeZone:'UTC'}).format(date);
 const monthName=new Intl.DateTimeFormat('en-US',{month:'long',timeZone:'UTC'}).format(date);
 return {day,month,year,suffix,weekday,monthName,text:`${weekday}, ${monthName} ${day}${suffix}, ${year}`,html:`${weekday}, ${monthName} ${day}<sup style="font-size:65%">${suffix}</sup>, ${year}`,iso:`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`};
}
