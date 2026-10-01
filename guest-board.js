// Guest data never leaves this device. Existing v1 storage is preserved.
import { cleanNote, metadata } from './app/board-core.js';
const KEY = 'postispop-guest-board-v1';
const INDEX = 'postispop-guest-boards-v1';
const error = (code,status=400) => Object.assign(new Error(code),{status});
const storageKey = id => id === 'guest-board' ? KEY : KEY+':'+id;
const noteId = (id,position) => id === 'guest-board' ? `guest-note-${position}` : `guest-note-${id.slice(12)}-${position}`;
const makeNote = (id,position) => ({id:noteId(id,position),paper:position%5,text:'',marks:[],doodle:'',author:'guest',revision:1,created:Date.now(),updated:Date.now(),lockedUntil:0,editing:'',image:null,metadata:{tags:[],pinned:false,archived:false}});
function remember(board) {
  let list;try {list=JSON.parse(localStorage.getItem(INDEX)||'[]');}catch {list=[];}
  const rest=list.filter(b=>b.id!==board.id);rest.push({id:board.id,title:board.title,owner:'guest',expires:null,role:'owner'});
  localStorage.setItem(INDEX,JSON.stringify(rest));
}
export function guestBoards() {
  let list;try {list=JSON.parse(localStorage.getItem(INDEX)||'[]');}catch {list=[];}
  if(!list.some(b=>b.id==='guest-board'))list.unshift({id:'guest-board',title:readGuest().title,owner:'guest',expires:null,role:'owner'});
  return list;
}
export function readGuest(id='guest-board') {
  try {const saved=JSON.parse(localStorage.getItem(storageKey(id)));if(saved?.id===id && Array.isArray(saved.notes))return saved;}catch{}
  if(id!=='guest-board')throw error('NOT_FOUND',404);
  const notes=Array.from({length:12},(_,i)=>makeNote(id,i));
  return{id,title:'Mi pizarra',revision:1,order:notes.map(n=>n.id),expires:null,role:'owner',owner:'guest',notes,members:[],trash:[]};
}
export function createGuest(title='Mi pizarra',notes=[]) {
  if(notes.length>12)throw error('BOARD_FULL');
  const clean=notes.map(cleanNote),id='guest-board-'+crypto.randomUUID();
  const board={id,title:String(title).slice(0,120),revision:1,expires:null,role:'owner',owner:'guest',members:[],trash:[],notes:Array.from({length:12},(_,i)=>({...makeNote(id,i),...(clean[i]||{})}))};
  board.order=board.notes.map(n=>n.id);localStorage.setItem(storageKey(id),JSON.stringify(board));remember(board);return board;
}
export function guestRequest(endpoint,method,payload={}) {
  if(!/^(board\/guest-board(?:-[\da-f-]+)?(?:\/.*)?|note\/guest-note-[\da-f-]+(?:\/.*)?|restore\/guest-trash-.*)$/.test(endpoint))return null;
  const parts=endpoint.split('/');let id='guest-board';
  if(parts[0]==='board')id=parts[1];
  else if(parts[0]==='note'){const m=parts[1].match(/^guest-note-(.+)-\d+$/);if(m)id='guest-board-'+m[1];}
  else {const found=guestBoards().find(b=>readGuest(b.id).trash?.some(t=>t.id===parts[1]));if(found)id=found.id;}
  const board=readGuest(id);board.trash=(board.trash||[]).filter(n=>n.expires>Date.now());
  const save=()=>{board.revision++;localStorage.setItem(storageKey(id),JSON.stringify(board));remember(board);return board;};
  if(parts[0]==='board') {
    if(method==='GET')return parts[2]==='trash'?{items:board.trash}:board;
    if(parts[2]==='swap') {
      const a=board.order.indexOf(payload.from),b=board.order.indexOf(payload.to);if(a<0||b<0)throw error('NOT_FOUND',404);
      [board.order[a],board.order[b]]=[board.order[b],board.order[a]];
    }else if(parts[2]==='import') {
      const incoming=(payload.notes||[]).map(cleanNote),empty=board.notes.filter(n=>!n.text&&!n.doodle&&!n.image);
      if(incoming.length>empty.length)throw error('BOARD_FULL');
      incoming.forEach((n,i)=>Object.assign(empty[i],n,{revision:empty[i].revision+1,updated:Date.now()}));
    }else if(typeof payload.title==='string')board.title=payload.title.slice(0,120);
    else throw error('UNSUPPORTED_OPERATION');
    return save();
  }
  if(parts[0]==='restore') {
    const found=board.trash.find(n=>n.id===parts[1]),target=board.notes.find(n=>!n.text&&!n.doodle&&!n.image);
    if(!found||!target)throw error('BOARD_FULL');
    Object.assign(target,found.note,{id:target.id,lockedUntil:0,editing:'',revision:target.revision+1});
    board.trash=board.trash.filter(n=>n.id!==found.id);return save();
  }
  const note=board.notes.find(n=>n.id===parts[1]),kind=parts[2];if(!note)throw error('NOT_FOUND',404);
  if(method!=='POST')throw error('UNSUPPORTED_OPERATION');
  if(kind==='lock')return{note,lock:'guest-local'};if(kind==='unlock')return{ok:true};
  if(kind==='share')throw error('SESSION_REQUIRED',401);
  if(kind==='trash') {
    const trashId='guest-trash-'+crypto.randomUUID();board.trash.push({id:trashId,note:{...note},text:note.text,doodle:note.doodle,expires:Date.now()+2592000000});
    const revision=note.revision+1;Object.assign(note,makeNote(id,board.notes.indexOf(note)),{revision});return{board:save(),trashId};
  }
  if(payload.revision!==undefined&&payload.revision!==note.revision)throw error('CONFLICT',409);
  if(!kind||kind==='text') {const clean=cleanNote({...note,text:payload.text,marks:payload.marks||[]});note.text=clean.text;note.marks=clean.marks;}
  else if(kind==='paper') {if(!Number.isInteger(payload.paper)||payload.paper<0||payload.paper>5)throw error('INVALID_NOTE');note.paper=payload.paper;}
  else if(kind==='doodle')note.doodle=cleanNote({...note,doodle:payload.doodle||''}).doodle;
  else if(kind==='metadata')note.metadata=metadata(payload.metadata);
  else throw error('UNSUPPORTED_OPERATION');
  note.revision++;note.updated=Date.now();save();return{note};
}
