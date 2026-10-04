/** Durable, account-scoped outbox. The server remains the authority for access and revisions.
 * Each operation owns a separate localStorage key: another tab cannot erase the whole queue.
 * Storage errors are surfaced before a save is acknowledged. No plaintext for protected notes.
 */
const PREFIX='postispop:offline:v1:';
const copy=value=>JSON.parse(JSON.stringify(value));
const fail=(message,status=409)=>Object.assign(new Error(message),{status});
export function createOfflineStore(storage, now=()=>Date.now(), uuid=()=>crypto.randomUUID()) {
  const key=(user,suffix)=>PREFIX+encodeURIComponent(user)+':'+suffix;
  const read=k=>{try{return JSON.parse(storage.getItem(k)||'null');}catch{return null;}};
  const write=(k,value)=>{try{storage.setItem(k,JSON.stringify(value));}catch{throw fail('OFFLINE_STORAGE_FULL',507);}};
  const scan=prefix=>{const values=[];for(let i=0;i<storage.length;i++){const k=storage.key(i);if(k?.startsWith(prefix)){const v=read(k);if(v)values.push(v);}}return values;};
  const pending=user=>scan(key(user,'op:')).sort((a,b)=>a.created-b.created||a.id.localeCompare(b.id));
  const remember=(user,endpoint,value)=>write(key(user,'cache:'+endpoint),value);
  const boards=user=>scan(key(user,'cache:board/')).filter(b=>b?.id&&Array.isArray(b.notes));
  const project=(user,board)=>{
    const result=copy(board);
    for(const op of pending(user)) if(op.boardId===board.id){const note=result.notes.find(n=>n.id===op.noteId);if(note&&op.kind!=='style'&&(!note.protectedEnvelope||op.after.protectedEnvelope))Object.assign(note,copy(op.after));}
    return result;
  };
  const cached=(user,endpoint)=>{const value=read(key(user,'cache:'+endpoint));return value&&/^board\/[^/]+$/.test(endpoint)?project(user,value):value;};
  const findNote=(user,id)=>{for(const board of boards(user)){const note=project(user,board).notes.find(n=>n.id===id);if(note)return{board,note};}return null;};
  const updateNote=(user,note)=>{for(const board of boards(user)) {const i=board.notes.findIndex(n=>n.id===note.id);if(i>=0){board.notes[i]=copy(note);remember(user,'board/'+board.id,board);}}};
  const isMutation=endpoint=>/^note\/[^/]+(?:\/(text|paper|doodle|image|protected-save))?$/.test(endpoint)||endpoint==='designs/styles';
  const enqueue=(user,endpoint,payload)=>{
    if(!isMutation(endpoint))throw fail('OFFLINE_OPERATION_UNAVAILABLE',503);
    const style=endpoint==='designs/styles', match=endpoint.match(/^note\/([^/]+)(?:\/(.+))?$/),id=style?payload.note_id:match[1];
    const found=findNote(user,id);if(!found)throw fail('OFFLINE_NOTE_NOT_CACHED',503);
    const kind=style?'style':match[2]||'text', note=found.note;
    if(note.protectedEnvelope&&kind!=='protected-save')throw fail('PROTECTED_NOTE',403);
    if(kind==='protected-save'&&!note.protectedEnvelope)throw fail('PROTECT_REQUIRES_CONNECTION',503);
    let after=copy(note), body=copy(payload);
    if(style){const styles=cached(user,'designs/styles')?.styles||[];const previous=[...pending(user)].reverse().find(o=>o.noteId===id&&o.kind==='style')?.after||styles.find(s=>s.note_id===id);const rev=previous?.revision||0;if(payload.revision!==undefined&&payload.revision!==rev)throw fail('CONFLICT');body.revision=rev;after={...previous,...body,revision:rev+1};}
    else {
      if(payload.revision!==undefined&&payload.revision!==note.revision)throw fail('CONFLICT');
      body.revision=note.revision;
      if(kind==='text'){if(typeof body.text!=='string'||body.text.length>10000)throw fail('INVALID_NOTE',400);after.text=body.text;after.marks=body.marks||[];}
      if(kind==='paper'){if(!Number.isInteger(body.paper)||body.paper<0||body.paper>5)throw fail('INVALID_NOTE',400);after.paper=body.paper;}
      if(kind==='doodle')after.doodle=body.doodle||'';
      if(kind==='image')after.image=(body.url||body.image?.url)?{url:body.url||body.image.url}:null;
      if(kind==='protected-save'){after={...after,text:'Nota protegida',marks:[],image:null,doodle:'',protectedEnvelope:body.protectedEnvelope};}
      after.revision=note.revision+1;after.updated=now();
    }
    // Monotonic timestamp preserves order within one process; immutable unique key preserves other tabs.
    const created=Math.max(now(),...pending(user).map(o=>o.created+1));
    const op={id:uuid(),userId:user,created,endpoint,body,kind,noteId:id,boardId:found.board.id,after,state:'pending'};
    write(key(user,'op:'+op.id),op);
    return style?{style:after,offline:true,pending:true}:{note:after,offline:true,pending:true};
  };
  const acknowledge=(user,op,data)=>{if(data.note)updateNote(user,data.note);if(data.style){const styles=cached(user,'designs/styles')?.styles||[];const i=styles.findIndex(s=>s.note_id===op.noteId);if(i<0)styles.push(data.style);else styles[i]=data.style;remember(user,'designs/styles',{styles});}storage.removeItem(key(user,'op:'+op.id));};
  const conflict=(user,op,server,error='CONFLICT')=>write(key(user,'op:'+op.id),{...op,state:'conflict',server:server||null,error});
  const status=user=>{const ops=pending(user);return{pending:ops.filter(o=>o.state==='pending').length,conflicts:ops.filter(o=>o.state==='conflict').length};};
  const resolve=(user,id,choice)=>{
    const op=read(key(user,'op:'+id));if(!op||op.userId!==user||op.state!=='conflict')throw fail('CONFLICT_NOT_FOUND',404);
    if(choice==='server'){
      // Preserve a recovery copy of every dependent local edit before accepting server state.
      const related=pending(user).filter(o=>o.noteId===op.noteId&&(o.kind==='style')===(op.kind==='style'));
      write(key(user,'recovery:'+uuid()),{savedAt:now(),operations:related});
      for(const item of related)storage.removeItem(key(user,'op:'+item.id));
      if(op.server){if(op.kind==='style')remember(user,'designs/styles',{styles:[...(cached(user,'designs/styles')?.styles||[]).filter(s=>s.note_id!==op.noteId),op.server]});else updateNote(user,op.server);}
    } else if(choice==='local') {
      if(!op.server?.revision)throw fail('SERVER_VERSION_REQUIRED');
      if(op.server.protectedEnvelope&&op.kind!=='protected-save')throw fail('PROTECTED_NOTE',403);
      const related=pending(user).filter(o=>o.noteId===op.noteId&&(o.kind==='style')===(op.kind==='style'));
      let revision=op.server.revision;
      for(const item of related)write(key(user,'op:'+item.id),{...item,state:'pending',body:{...item.body,revision},after:{...item.after,revision:++revision},server:null,error:null});
    } else throw fail('INVALID_RESOLUTION',400);
  };
  const cacheStyles=(user,styles)=>{remember(user,'designs/styles',{styles});return projectStyles(user);};
  const projectStyles=user=>{const styles=copy(cached(user,'designs/styles')?.styles||[]);for(const op of pending(user).filter(o=>o.kind==='style')){const i=styles.findIndex(s=>s.note_id===op.noteId);if(i<0)styles.push(op.after);else styles[i]=op.after;}return styles;};
  const allEntries=()=>{const entries=[];for(let i=0;i<storage.length;i++){const k=storage.key(i);if(k?.startsWith(PREFIX))entries.push([k,read(k)]);}return entries;};
  const noteHistory=id=>{
    const entries=allEntries();return {pending:entries.filter(([k,v])=>k.includes(':op:')&&v?.noteId===id).length,
      recovery:entries.reduce((n,[k,v])=>n+(k.includes(':recovery:')?(v?.operations||[]).filter(o=>o.noteId===id).length:0),0)};
  };
  const sanitizeProtected=note=>{
    if(!note.protectedEnvelope)throw fail('PROTECTED_ENVELOPE_REQUIRED',400);
    if(noteHistory(note.id).pending)throw fail('SYNC_PENDING_BEFORE_PROTECT');
    for(const [k,value] of allEntries()){
      if(k.includes(':cache:board/')&&Array.isArray(value?.notes)&&value.notes.some(n=>n.id===note.id)){
        value.notes=value.notes.map(n=>n.id===note.id?copy(note):n);write(k,value);
      } else if(k.endsWith(':cache:designs/styles')&&Array.isArray(value?.styles)){
        const styles=value.styles.filter(s=>s.note_id!==note.id);if(styles.length!==value.styles.length)write(k,{...value,styles});
      } else if(k.includes(':recovery:')&&Array.isArray(value?.operations)){
        const operations=value.operations.filter(o=>o.noteId!==note.id);if(operations.length!==value.operations.length){if(operations.length)write(k,{...value,operations});else storage.removeItem(k);}
      }
    }
  };
  const rememberIdentity=user=>remember(user.id,'identity',{id:user.id,email:user.email,user_metadata:user.user_metadata||{},verifiedAt:now()});
  return{remember,cached,pending,project,findNote,updateNote,enqueue,acknowledge,conflict,status,resolve,isMutation,cacheStyles,projectStyles,rememberIdentity,noteHistory,sanitizeProtected,
    identity:user=>cached(user,'identity'), recovery:user=>scan(key(user,'recovery:'))};
}
export function sameMutation(op,server){
 if(!server||server.revision!==op.body.revision+1)return false;
 if(op.kind==='style')return Object.keys(op.body).filter(k=>!['revision','note_id'].includes(k)).every(k=>JSON.stringify(op.body[k])===JSON.stringify(server[k]));
 const fields={text:['text','marks'],paper:['paper'],doodle:['doodle'],image:['image'], 'protected-save':['protectedEnvelope']}[op.kind];
 return !!fields&&fields.every(k=>JSON.stringify(op.after[k])===JSON.stringify(server[k]));
}
