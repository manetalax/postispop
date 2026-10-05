import {normalizeStyle} from './style-model.js';
import {validateEnvelope} from './note-crypto.js';
import {normalizeBackup} from './backup-import.js';
// Guest notes stay on this device. No network session or account is required.
const KEY = 'postispop-guest-board-v1';
const PAPER_COUNT = 6;
const makeNote = (position) => ({id:`guest-note-${position}`,paper:position%5,text:'',marks:[],doodle:'',author:'guest',revision:1,created:Date.now(),updated:Date.now(),lockedUntil:0,editing:'',image:null,style:null,styleRevision:0,protectedEnvelope:null});
const guestError = (code,status=400) => Object.assign(new Error(code),{status});
const reserved = note => Boolean(localStorage.getItem('pp:protected-note:'+note.id));
const markProtection = note => {try{if(note.protectedEnvelope)localStorage.setItem('pp:protected-note:'+note.id,'1');else localStorage.removeItem('pp:protected-note:'+note.id);}catch{/* The persisted envelope remains authoritative if a redundant UI marker cannot be saved. */}};
export function readGuest() {
  try { const saved=JSON.parse(localStorage.getItem(KEY)); if(saved?.id==='guest-board' && Array.isArray(saved.notes)) return {...saved,capacity:Math.max(12,saved.capacity||0,saved.notes.length)}; } catch {}
  const notes=Array.from({length:12},(_,i)=>makeNote(i));
  return {id:'guest-board',title:'Mi pizarra',revision:1,order:notes.map(n=>n.id),expires:null,role:'owner',owner:'guest',notes,members:[],trash:[]};
}
export function guestRequest(endpoint, method, payload={}) {
  if (!/^(board\/guest-board(?:\/.*)?|note\/guest-note-\d+(?:\/.*)?|restore\/guest-trash-.*)$/.test(endpoint)) return null;
  const board=readGuest(), parts=endpoint.split('/');
  const save=()=>{board.revision++;try{localStorage.setItem(KEY,JSON.stringify(board));}catch(error){if(error?.name==='QuotaExceededError')throw guestError('LOCAL_STORAGE_FULL',507);throw error;}return board;};
  if(parts[0]==='board') {
    if(method==='GET') return parts[2]==='trash'?{items:board.trash||[]}:parts[2]==='export'?{format:'postispop',version:1,title:board.title,notes:board.order.map(id=>board.notes.find(n=>n.id===id)).filter(Boolean),exportedAt:new Date().toISOString()}:board;
    if(parts[2]==='notes' && method==='POST'){
      if(board.notes.length>=(board.capacity||12))throw guestError('BOARD_FULL',409);
      const ids=[...board.notes,...(board.trash||[]).map(t=>t.note)];const position=Math.max(11,...ids.map(n=>Number(n.id.split('-').pop())))+1;
      const note=makeNote(position);board.notes.push(note);board.order.push(note.id);return save();
    }
    if(parts[2]==='import' && method==='POST') {
      // Validate the entire copy before saving anything. Only fill empty slots.
      const imported=normalizeBackup(payload,{maxNotes:12,maxBytes:50*1024*1024}).notes.map(n=>n.protectedEnvelope?{text:'Nota protegida',marks:[],paper:n.paper,doodle:'',image:null,style:null,protectedEnvelope:n.protectedEnvelope}:n);
      const empty=board.order.map(id=>board.notes.find(n=>n.id===id)).filter(n=>n&&!n.text&&!n.marks?.length&&!n.doodle&&!n.image&&!n.protectedEnvelope&&!reserved(n)&&!n.style?.drawing?.strokes?.length);
      if(imported.length>empty.length)throw guestError('BOARD_FULL',409);
      imported.forEach((n,i)=>Object.assign(empty[i],n,{revision:empty[i].revision+1,styleRevision:(empty[i].styleRevision||0)+1,updated:Date.now()}));
      const saved=save();imported.forEach((_,i)=>markProtection(empty[i]));return saved;
    }
    if(parts[2]==='swap') {
      const a=board.order.indexOf(payload.from),b=board.order.indexOf(payload.to);
      if(a<0||b<0) throw new Error('NOT_FOUND');
      [board.order[a],board.order[b]]=[board.order[b],board.order[a]];
    } else if(typeof payload.title==='string') board.title=payload.title.slice(0,120);
    else throw new Error('UNSUPPORTED_OPERATION');
    return save();
  }
  if(parts[0]==='restore') {
    const found=(board.trash||[]).find(n=>n.id===parts[1]);
    if(!found||found.expires<=Date.now())throw guestError('TRASH_EXPIRED',404);
    if(found.removed){
      if(board.notes.length>=(board.capacity||12))throw guestError('BOARD_FULL',409);
      if(board.notes.some(n=>n.id===found.note.id))throw guestError('CONFLICT',409);
      const restored={...found.note,revision:found.note.revision+2,styleRevision:(found.note.styleRevision||0)+1,lockedUntil:0,editing:'',updated:Date.now()};
      board.notes.push(restored);board.order.splice(Math.min(found.position||0,board.order.length),0,restored.id);board.trash=board.trash.filter(n=>n.id!==found.id);const saved=save();markProtection(restored);return saved;
    }
    // Backwards compatibility for trash saved before removal of paper slots.
    const target=board.notes.find(n=>!n.text&&!n.doodle&&!n.image&&!n.protectedEnvelope&&!reserved(n)&&!n.style?.drawing?.strokes?.length);
    if(!target)throw guestError('BOARD_FULL',409);
    const revision=target.revision+1,styleRevision=(target.styleRevision||0)+1;
    Object.assign(target,found.note,{id:target.id,revision,styleRevision,lockedUntil:0,editing:''});
    board.trash=board.trash.filter(n=>n.id!==found.id);const saved=save();markProtection(target);return saved;
  }
  const note=board.notes.find(n=>n.id===parts[1]);
  if(!note) throw new Error('NOT_FOUND');
  const kind=parts[2];
  if(method!=='POST') throw new Error('UNSUPPORTED_OPERATION');
  if(kind==='lock'){if(note.protectedEnvelope)throw guestError('NOTE_PROTECTED',423);return {note,lock:'guest-local'};}
  if(kind==='unlock') return {ok:true};
  if(kind==='share') throw new Error('SESSION_REQUIRED');
  if(kind==='trash') {
    if(payload.revision!==undefined&&payload.revision!==note.revision)throw guestError('CONFLICT',409);
    const id='guest-trash-'+crypto.randomUUID(),position=board.order.indexOf(note.id);
    board.trash=[...(board.trash||[]),{id,note:{...note},text:note.text,doodle:note.doodle,image:note.image,removed:true,position,expires:Date.now()+2592000000}];
    board.notes=board.notes.filter(n=>n.id!==note.id);board.order=board.order.filter(id=>id!==note.id);
    const saved=save();markProtection({id:note.id});return {board:saved,trashId:id};
  }
  if(kind==='protect'||kind==='protected-save') {
    if(payload.revision!==note.revision||(payload.styleRevision!==undefined&&payload.styleRevision!==(note.styleRevision||0)))throw guestError('CONFLICT',409);
    if(kind==='protected-save'&&!note.protectedEnvelope)throw guestError('NOT_PROTECTED',409);
    validateEnvelope(payload.protectedEnvelope);
    if(kind==='protect') {
      const previous=(board.trash||[]).some(item=>item.note?.id===note.id&&!item.note.protectedEnvelope);
      if(previous&&!payload.purgeVersions)throw guestError('PREVIOUS_VERSIONS',409);
      if(payload.purgeVersions)board.trash=(board.trash||[]).filter(item=>item.note?.id!==note.id||item.note.protectedEnvelope);
    }
    Object.assign(note,{text:'Nota protegida',marks:[],doodle:'',image:null,style:null,protectedEnvelope:payload.protectedEnvelope,revision:note.revision+1,updated:Date.now()});
    save();markProtection(note);return {note};
  }
  if(note.protectedEnvelope)throw guestError('NOTE_PROTECTED',423);
  if(kind==='style') {
    if(payload.styleRevision!==(note.styleRevision||0))throw guestError('CONFLICT',409);
    note.style=normalizeStyle(payload.style);note.styleRevision=(note.styleRevision||0)+1;note.updated=Date.now();save();return {note,style:note.style,styleRevision:note.styleRevision};
  }
  if(!kind||kind==='text') {
    if(typeof payload.text!=='string'||payload.text.length>10000||!Array.isArray(payload.marks||[])) throw new Error('INVALID_NOTE');
    if(payload.revision!==undefined&&payload.revision!==note.revision) throw new Error('CONFLICT');
    note.text=payload.text;note.marks=payload.marks||[];
  } else if(kind==='paper') {
    if(!Number.isInteger(payload.paper)||payload.paper<0||payload.paper>=PAPER_COUNT) throw guestError('INVALID_NOTE');
    if(payload.revision!==undefined&&payload.revision!==note.revision) throw guestError('CONFLICT',409);
    note.paper=payload.paper;
  } else if(kind==='doodle') note.doodle=payload.doodle||'';
  else throw new Error('UNSUPPORTED_OPERATION');
  note.revision++;note.updated=Date.now();save();return {note};
}
