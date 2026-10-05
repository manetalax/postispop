// View 0 shows twelve notes; views 1 onward show existing groups of six.
export const mobileBoardQuery='(max-width:700px), (max-width:1000px) and (max-height:500px) and (orientation:landscape)';
export function nextBoardView(view,count){const pages=Math.max(1,Math.ceil(count/6));return view>=pages?0:view+1;}
export function boardViewNotes(notes,view){return view===0?notes.slice(0,12):notes.slice((view-1)*6,view*6);}
export function boardViewLabel(view,count){if(count<=6)return count+' notas';const next=nextBoardView(view,count);return next===0?'Ver '+Math.min(count,12)+' notas · 1–'+Math.min(count,12):next===1?'Ver las 6 primeras · 1–6':'Ver las 6 siguientes · '+((next-1)*6+1)+'–'+(next*6)+' →';}
