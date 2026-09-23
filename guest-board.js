// Guest notes stay on this device. No network session or account is required.
const KEY = 'postispop-guest-board-v1';
const PAPER_COUNT = 6;
const makeNote = (position) => ({id:`guest-note-${position}`,paper:position%5,text:'',marks:[],doodle:'',author:'guest',revision:1,created:Date.now(),updated:Date.now(),lockedUntil:0,editing:'',image:null});
const guestError = (code,status=400) => Object.assign(new Error(code),{status});
export function readGuest() {
  try { const saved=JSON.parse(localStorage.getItem(KEY)); if(saved?.id==='guest-board' && Array.isArray(saved.notes)) return saved; } catch {}
  const notes=Array.from({length:12},(_,i)=>makeNote(i));
  return {id:'guest-board',title:'Mi pizarra',revision:1,order:notes.map(n=>n.id),expires:null,role:'owner',owner:'guest',notes,members:[],trash:[]};
}
export function guestRequest(endpoint, method, payload={}) {
  if (!/^(board\/guest-board(?:\/.*)?|note\/guest-note-\d+(?:\/.*)?|restore\/guest-trash-.*)$/.test(endpoint)) return null;
  const board=readGuest(), parts=endpoint.split('/');
  const save=()=>{board.revision++;localStorage.setItem(KEY,JSON.stringify(board));return board;};
  if(parts[0]==='board') {
    if(method==='GET') return parts[2]==='trash'?{items:board.trash||[]}:board;
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
    const target=board.notes.find(n=>!n.text&&!n.doodle&&!n.image);
    if(!found||!target) throw new Error('BOARD_FULL');
    Object.assign(target,found.note,{id:target.id,lockedUntil:0,editing:''});
    board.trash=board.trash.filter(n=>n.id!==found.id);return save();
  }
  const note=board.notes.find(n=>n.id===parts[1]);
  if(!note) throw new Error('NOT_FOUND');
  const kind=parts[2];
  if(method!=='POST') throw new Error('UNSUPPORTED_OPERATION');
  if(kind==='lock') return {note,lock:'guest-local'};
  if(kind==='unlock') return {ok:true};
  if(kind==='share') throw new Error('SESSION_REQUIRED');
  if(kind==='trash') {
    const id='guest-trash-'+crypto.randomUUID();
    board.trash=[...(board.trash||[]),{id,note:{...note},text:note.text,doodle:note.doodle,expires:Date.now()+2592000000}];
    Object.assign(note,makeNote(Number(note.id.split('-').pop())));
    return {board:save(),trashId:id};
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
