// Checked transformations of the recovered editor; the original bundle stays intact.
export function transformBoardLayout(source){
 const replace=(from,to)=>{if(source.split(from).length!==2)throw Error('Board layout integration changed: '+from.slice(0,60));source=source.replace(from,to);};
 source='import {mobileBoardQuery as ppBoardMedia,nextBoardView as ppBoardNext,boardViewNotes as ppBoardSlice} from "../../../board-view-model.js";'+source;
 replace('function Nd(e,t){return t===1?e.slice(0,6):t===2?e.slice(6,12):e.slice(0,12)}','function Nd(e,t){return ppBoardSlice(e,t)}');
 replace('onClick:()=>A((O+1)%3)','onClick:()=>A(ppBoardNext(O,xn.length))');
 replace('Sn=Nd(xn,O);return','Sn=Nd(xn,O);(0,u.useEffect)(()=>{const mq=matchMedia(ppBoardMedia);const change=()=>A(mq.matches?1:0);change();const first=()=>A(1);window.addEventListener(`postispop:first-page`,first);mq.addEventListener(`change`,change);return()=>{mq.removeEventListener(`change`,change);window.removeEventListener(`postispop:first-page`,first)}},[]);(0,u.useEffect)(()=>{if(a)A(current=>Math.min(current,Math.ceil(xn.length/6)))},[a?.id,xn.length]);return');
 replace('xn.indexOf(e)===11&&hd(e)?(0,V.jsx)(_d,{lang:t},e.id):','');
 replace('"data-note-id":e.id,className:', '"data-note-id":e.id,"data-pp-slot":xn.indexOf(e)+1||n+1,className:');
 replace('function _d({lang:e})','function _d({lang:e,board:b})');
 const from='return(0,V.jsxs)(`div`,{className:`note-cell daily-quote `+(r?`quote-expanded`:``),children:';
 const start=source.indexOf(from),end=source.indexOf('}var vd=',start);
 if(start<0||end<0)throw Error('Daily quote component changed');
 source=source.slice(0,start)+'return(0,V.jsx)(`div`,{className:`pp-daily-quote-data`,hidden:!0,"data-note-count":b?.order?.length||0,"data-board-id":b?.id||``,"data-filled":(b?.order||[]).slice(0,12).map(id=>{const n=b.notes.find(n=>n.id===id);return n&&(n.text?.trim()||n.image||n.doodle||n.alarmAt||n.protectedEnvelope||n.style?.drawing?.strokes?.length)?`1`:`0`}).join(``),"data-text":a?.text||``,"data-author":a?.author||``,"data-source":a?.source||``})'+source.slice(end);
 replace('className:`board-frame zoom-`+O','"data-pp-view":O,className:`board-frame pp-fixed-notes `+(O===0?`pp-twelve-notes `:``)+`zoom-`+O');
 replace('async function It(e){Ot(await $(`board/`+e)),A(0)}','async function It(e){const initial=G.current.data?.id!==e;const board=await $(`board/`+e);Ot(board);A(current=>initial?(matchMedia(ppBoardMedia).matches?1:0):Math.min(current,Math.ceil(board.order.length/6)))}');
 replace('\"aria-busy\":f||H,children:[(0,V.jsx)(`div`,{className:`board-grid`','\"aria-busy\":f||H,children:[a&&(0,V.jsx)(_d,{lang:t,board:a}),(0,V.jsx)(`div`,{className:`board-grid`');
 replace('kt({...t.note,lock:t.lock,savedText:t.note.text,savedMarks:JSON.stringify(t.note.marks)})','kt({...t.note,ppQuoteDraft:document.querySelector(`[data-note-id="${e}"].pp-quote-host`)?.dataset.ppQuoteText||``,lock:t.lock,savedText:t.note.text,savedMarks:JSON.stringify(t.note.marks)})');
 replace('let n={...t,text:e,marks:cd(t.text,e,t.marks,xt.current)}','let n={...t,ppQuoteDraft:``,text:e,marks:cd(t.text,e,t.marks,xt.current)}');
 replace('text:(L?.text||``)+`\n`','text:(L?.text||L?.ppQuoteDraft||``)+`\n`');
 replace('value:L?.text||``,onScroll:', 'value:L?.text||L?.ppQuoteDraft||``,onScroll:');
 return source;
}
