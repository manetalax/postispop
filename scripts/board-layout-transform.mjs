// Checked transformations of the recovered editor; the original bundle stays intact.
export function transformBoardLayout(source){
 const replace=(from,to)=>{if(source.split(from).length!==2)throw Error('Board layout integration changed: '+from.slice(0,60));source=source.replace(from,to);};
 // Keep the Spanish SSR/first render identical. Apply an explicit entry-page
 // language or saved preference only in React's existing mount effect.
 source='import {readBoardLanguage as ppBoardLanguage,consumeBoardLanguageQuery as ppConsumeBoardLanguage} from "../../../seo-language.js";'+source;
 replace('return n(`es`),i(Pd(`store-theme`,`neutral`)),Rt()', 'return n(ppBoardLanguage()),ppConsumeBoardLanguage(),i(Pd(`store-theme`,`neutral`)),Rt()');
 replace('Object.entries($u).filter(([e])=>e===`es`).map', 'Object.entries($u).map');
 replace('./assets/postispop-logo.png','./assets/postispop-logo.svg');
 source='import {mobileBoardQuery as ppBoardMedia,nextBoardView as ppBoardNext,boardViewNotes as ppBoardSlice,clampBoardView as ppBoardClamp,filterBoardNotes as ppBoardFilter} from "../../../board-view-model.js?v=20261008a";import {sortBoardNotes as ppSortBoardNotes} from "../../../board-preferences.js?v=20261008a";'+source;
 replace('function Nd(e,t){return t===1?e.slice(0,6):t===2?e.slice(6,12):e.slice(0,12)}','function Nd(e,t){return ppBoardSlice(e,t)}');
 replace('onClick:()=>A((O+1)%3)','onClick:()=>A(ppBoardNext(O,xn.length))');
 replace('[O,A]=(0,u.useState)(0)','[O,A]=(0,u.useState)(0),[ppSearch,ppSetSearch]=(0,u.useState)({query:``,color:``})');
 replace('Sn=Nd(xn,O);return',`ppMatches=ppBoardFilter(ppSortBoardNotes(xn,a?.id),{...ppSearch,boardId:a?.id}),Sn=Nd(ppMatches,O);
 (0,u.useEffect)(()=>{
   const mq=matchMedia(ppBoardMedia);
   const change=()=>A(current=>ppBoardClamp(current,G.current.data?.order?.length||0));
   const refresh=async event=>{if(event.detail?.boardId!==G.current.data?.id)return;try{await It(event.detail.boardId);if(Number.isFinite(event.detail.view))A(event.detail.view)}catch(error){jt(error)}};
   const page=event=>A(Number.isFinite(event.detail?.page)?event.detail.page:0);
   const filter=event=>{ppSetSearch(event.detail||{});A(0)};
   const preferences=event=>{if(event.detail?.boardId===G.current.data?.id)ppSetSearch(current=>({...current,refresh:Date.now()}))};
   window.addEventListener('postispop:board-reload',refresh);
   window.addEventListener('postispop:page',page);
   window.addEventListener('postispop:filter',filter);
   window.addEventListener('postispop:note-preferences',preferences);
   mq.addEventListener('change',change);
   return()=>{window.removeEventListener('postispop:board-reload',refresh);window.removeEventListener('postispop:page',page);window.removeEventListener('postispop:filter',filter);window.removeEventListener('postispop:note-preferences',preferences);mq.removeEventListener('change',change)};
 },[]);
 (0,u.useEffect)(()=>{if(a){A(current=>ppBoardClamp(current,ppMatches.length));document.documentElement.dataset.ppReady='true';window.dispatchEvent(new Event('postispop:ui-ready'))}},[a?.id,ppMatches.length]);return`);
 replace('xn.indexOf(e)===11&&hd(e)?(0,V.jsx)(_d,{lang:t},e.id):','');
 replace('"data-note-id":e.id,className:', '"data-note-id":e.id,"data-pp-slot":xn.indexOf(e)+1||n+1,className:');
 replace('function _d({lang:e})','function _d({lang:e,board:b,resultCount:c})');
 const from='return(0,V.jsxs)(`div`,{className:`note-cell daily-quote `+(r?`quote-expanded`:``),children:';
 const start=source.indexOf(from),end=source.indexOf('}var vd=',start);
 if(start<0||end<0)throw Error('Daily quote component changed');
 source=source.slice(0,start)+'return(0,V.jsx)(`div`,{className:`pp-daily-quote-data`,hidden:!0,"data-board-role":b?.role||``,"data-result-count":c??0,"data-note-count":b?.order?.length||0,"data-board-id":b?.id||`` ,"data-favorites-only":ppSearch.favoritesOnly?`true`:`false`,"data-locked-slots":(b?.order||[]).map((id,index)=>b.notes.find(n=>n.id===id)?.trialLocked?index+1:null).filter(Boolean).join(``),"data-purge-at":b?.noteAccess?.purgeAt||`` ,"data-trial-expires":b?.noteAccess?.trialExpiresAt||`` ,"data-server-now":b?.noteAccess?.serverNow||`` ,"data-filled":(b?.order||[]).slice(0,12).map(id=>{const n=b.notes.find(n=>n.id===id);return n&&(n.text?.trim()||n.image||n.doodle||n.alarmAt||n.protectedEnvelope||n.style?.drawing?.strokes?.length)?`1`:`0`}).join(``),"data-text":a?.text||``,"data-author":a?.author||``,"data-source":a?.source||``})'+source.slice(end);
 replace('className:`board-frame zoom-`+O','"data-pp-view":O,className:`board-frame pp-fixed-notes `+(O===0?`pp-twelve-notes `:``)+`zoom-`+O');
 replace('async function It(e){Ot(await $(`board/`+e)),A(0)}','async function It(e){const initial=G.current.data?.id!==e;const board=await $(`board/`+e);Ot(board);A(current=>initial?0:ppBoardClamp(current,board.order.length))}');
 replace('\"aria-busy\":f||H,children:[(0,V.jsx)(`div`,{className:`board-grid`','\"aria-busy\":f||H,children:[a&&(0,V.jsx)(_d,{lang:t,board:a,resultCount:ppMatches.length}),(0,V.jsx)(`div`,{className:`board-grid`');
 replace('kt({...t.note,lock:t.lock,savedText:t.note.text,savedMarks:JSON.stringify(t.note.marks)})','kt({...t.note,ppQuoteDraft:document.querySelector(`[data-note-id="${e}"].pp-quote-host`)?.dataset.ppQuoteText||``,lock:t.lock,savedText:t.note.text,savedMarks:JSON.stringify(t.note.marks)})');
 replace('let n={...t,text:e,marks:cd(t.text,e,t.marks,xt.current)}','let n={...t,ppQuoteDraft:``,text:e,marks:cd(t.text,e,t.marks,xt.current)}');
 replace('text:(L?.text||``)+`\n`','text:(L?.text||L?.ppQuoteDraft||``)+`\n`');
 replace('value:L?.text||``,onScroll:', 'value:L?.text||L?.ppQuoteDraft||``,onScroll:');
 source='import {authPKCE as ppAuthPKCE} from "../../../auth-pkce.js";'+source;
 replace('sessionStorage.setItem(`pp:auth-verifier`,n),sessionStorage.setItem(`pp:auth-return`,location.pathname+location.hash)','ppAuthPKCE.save(n,location.pathname+location.hash)');
 const callbackStart=source.indexOf('if(r){let e=sessionStorage.getItem(`pp:auth-verifier`)');
 const callbackEnd=source.indexOf('c(n.actor)',callbackStart);
 if(callbackStart<0||callbackEnd<0)throw Error('Auth callback integration changed');
 source=source.slice(0,callbackStart)+'if(r){const pending=ppAuthPKCE.read();if(pending){try{await $(`auth/exchange`,{code:r,verifier:pending.verifier});ppAuthPKCE.clear(pending.verifier);location.replace(pending.returnTo);return}catch{ppAuthPKCE.clear(pending.verifier);Q.error(wd(G.current.lang).error)}}history.replaceState(null,``,location.pathname)}'+source.slice(callbackEnd);
 replace('Array.from({length:12},(e,t)=>({id:String(t)','Array.from({length:6},(e,t)=>({id:String(t)');
 return source;
}
