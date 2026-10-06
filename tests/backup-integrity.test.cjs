const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const USER='11111111-1111-4111-8111-111111111111';
const BOARD='22222222-2222-4222-8222-222222222222';
const NOTE='33333333-3333-4333-8333-333333333333';
const PROTECTED='44444444-4444-4444-8444-444444444444';
const SESSION='postispop-supabase-session';
const drawing={version:1,selectedInstrument:'brush',strokes:[{instrument:'brush',color:'#123456',width:4,points:[{x:.2,y:.3,p:.7},{x:.8,y:.6,p:.4}]}]};
const style=()=>({note_id:NOTE,font:'mono',size:24,italic:true,underline:false,ink:'#123456',paper:'grid',drawing,revision:2});
const copy=value=>JSON.parse(JSON.stringify(value));
function disk(){
  const map=new Map();
  return {get length(){return map.size;},key:i=>[...map.keys()][i]??null,getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
}

async function bridge({styles=[style()],styleResponse,envelope}={}){
  const sync=await import('../offline-sync.js');
  const {normalizeBackup}=await import('../backup-import.js');
  const storage=disk(),calls=[],backups=[];
  storage.setItem(SESSION,JSON.stringify({access_token:'test',user:{id:USER},expires_at:Math.floor(Date.now()/1000)+3600}));
  const navigator={onLine:true};
  const window={addEventListener(){},dispatchEvent(){},fetch:async(url,options={})=>{
    calls.push({url,options});
    if(url.includes('/auth/v1/user'))return Response.json({id:JSON.parse(storage.getItem(SESSION)).user.id});
    if(url.includes('/rest/v1/boards'))return Response.json([{id:BOARD,owner_id:USER,title:'Dibujos'}]);
    if(url.includes('/rest/v1/board_members'))return Response.json([]);
    if(url.includes('/rest/v1/notes'))return Response.json([
      {id:NOTE,board_id:BOARD,text:'',paper:2,revision:1},
      ...(envelope?[{id:PROTECTED,board_id:BOARD,protected_envelope:envelope,paper:4,revision:1}]:[])
    ]);
    if(url.includes('/rest/v1/postispop_note_style')){
      if(styleResponse)return styleResponse(url,options,storage);
      const params=new URL(url).searchParams,noteId=params.get('note_id')?.replace('eq.',''),all=styles.filter(row=>!noteId||row.note_id===noteId).sort((a,b)=>a.note_id.localeCompare(b.note_id)),offset=Number(params.get('offset')||0),rows=all.slice(offset,offset+Number(params.get('limit')||100));
      return Response.json(rows,{headers:{'Content-Range':rows.length?`${offset}-${offset+rows.length-1}/${all.length}`:`*/${all.length}`}});
    }
    throw Error('Unexpected request '+url);
  }};
  let offline;
  const context=vm.createContext({window,navigator,localStorage:storage,location:{origin:'https://postispop.com',href:'https://postispop.com/'},Response,URL,URLSearchParams,AbortController,TypeError,Date,JSON,crypto,encodeURIComponent,setTimeout,clearTimeout,
    guestRequest:()=>null,readGuest:()=>({}),...sync,
    createOfflineStore:store=>(offline=sync.createOfflineStore(store)),
    // Capture the board at the backup boundary. Attachment I/O has separate
    // browser coverage; normalization verifies drawing-only note round-trips.
    createBoardBackup:async board=>{backups.push(copy(board));return normalizeBackup({version:2,notes:board.notes});},
    installOfflineUI(){},getOfflineRights:async()=>null,saveOfflineReceipt:async()=>false
  });
  vm.runInContext(fs.readFileSync('supabase-bridge.js','utf8').replace(/^import .*\n/gm,''),context);
  const request=async endpoint=>{const response=await window.fetch('/api/'+endpoint);return {status:response.status,data:await response.json()};};
  return {request,navigator,offline,calls,backups,storage};
}

test('Cloud export preserves drawing-only notes, typography and pending local strokes',async()=>{
  const app=await bridge();
  await app.request('board/'+BOARD);
  await app.request('designs/styles');
  const pendingStyle={...style(),drawing:{...drawing,strokes:[...drawing.strokes,{...drawing.strokes[0],color:'#abcdef'}]}};
  app.offline.enqueue(USER,'designs/styles',pendingStyle);
  app.offline.enqueue(USER,'note/'+NOTE,{text:'Texto sin sincronizar',revision:1});
  const result=await app.request('board/'+BOARD+'/export');
  assert.equal(result.status,200);
  assert.equal(result.data.notes.length,1);
  assert.equal(result.data.notes[0].text,'Texto sin sincronizar');
  assert.deepEqual(result.data.notes[0].style.drawing,pendingStyle.drawing);
  assert.equal(result.data.notes[0].style.font,'mono');
  assert.equal(result.data.notes[0].style.paper,'grid');
  assert.equal(app.offline.pending(USER).length,2,'Export must not acknowledge unsynchronised changes');

  const drawings=await bridge();
  const withoutText=await drawings.request('board/'+BOARD+'/export');
  assert.equal(withoutText.data.notes.length,1,'Drawing-only notes must not disappear during restore normalization');
  assert.deepEqual(withoutText.data.notes[0].style.drawing,drawing);
});

test('Cloud export keeps protected styles inside their encrypted envelope',async()=>{
  const {encryptNote,decryptNote}=await import('../note-crypto.js');
  const envelope=await encryptNote({text:'Privado',style:style()},'clave segura de prueba');
  const app=await bridge({envelope,styles:[style(),{...style(),note_id:PROTECTED}]});
  const result=await app.request('board/'+BOARD+'/export');
  assert.equal(result.status,200);
  assert.deepEqual(Object.keys(result.data.notes[1]).sort(),['paper','protectedEnvelope']);
  assert.equal(app.backups[0].notes.find(note=>note.id===PROTECTED).style,undefined);
  assert.deepEqual((await decryptNote(result.data.notes[1].protectedEnvelope,'clave segura de prueba')).style.drawing,drawing);
});

test('Cloud export fails before creating a backup when style reads fail or are malformed',async()=>{
  for(const styleResponse of [
    ()=>Response.json({message:'Forbidden'},{status:403}),
    ()=>Response.json({message:'Style service unavailable'},{status:503}),
    ()=>{throw new TypeError('Connection lost');},
    ()=>Response.json(null),
    ()=>Response.json({styles:[]})
  ]){
    const app=await bridge({styleResponse});
    const result=await app.request('board/'+BOARD+'/export');
    assert.ok(result.status>=400);
    assert.equal(app.backups.length,0,'A required style read cannot be replaced by empty styles');
    assert.equal(result.data.notes,undefined);
  }
});

test('Offline full-style reads reject absent or partial caches instead of inventing an empty drawing list',async()=>{
  const app=await bridge();
  await app.request('board/'+BOARD);
  app.navigator.onLine=false;
  const absent=await app.request('designs/styles');
  assert.equal(absent.status,503);
  assert.equal(absent.data.error,'OFFLINE_STYLES_NOT_CACHED');

  app.navigator.onLine=true;
  await app.request('designs/styles?note_id='+NOTE);
  app.navigator.onLine=false;
  const partial=await app.request('designs/styles');
  assert.equal(partial.status,503,'Fetching one note does not certify the rest of the board');

  app.navigator.onLine=true;
  await app.request('designs/styles');
  app.navigator.onLine=false;
  const complete=await app.request('designs/styles');
  assert.equal(complete.status,200);
  assert.deepEqual(complete.data.styles[0].drawing,drawing);
  assert.equal(complete.data.offline,true);
});

test('An explicitly empty full style read remains available offline',async()=>{
  const app=await bridge({styles:[]});
  await app.request('designs/styles');
  app.navigator.onLine=false;
  const result=await app.request('designs/styles');
  assert.equal(result.status,200);
  assert.deepEqual(result.data.styles,[]);
});

function toolbar({styleResponse,guest=false,offline=false}={}){
  const downloads=[],backups=[],events=[];
  const id=guest?'guest-board':BOARD;
  const board={id,title:'Mis notas',order:[NOTE],offline,notes:[{id:NOTE,text:'Mi dibujo',paper:0,...(guest?{style:style()}: {})}]};
  const document={addEventListener(){},createElement:()=>({click(){downloads.push(this.download);}})};
  const context=vm.createContext({window:{addEventListener(){}},document,localStorage:disk(),Blob,setTimeout(){},
    URL:{createObjectURL:()=> 'blob:backup',revokeObjectURL(){}},
    fetch:async endpoint=>{
      if(endpoint==='/api/me')return Response.json({boards:[{id}]});
      if(endpoint==='/api/board/'+id)return Response.json(board);
      if(endpoint==='/api/designs/styles')return styleResponse?styleResponse():Response.json({styles:[style()]});
      throw Error('Unexpected request '+endpoint);
    },
    createBoardBackup:async value=>{backups.push(copy(value));return value;},track:kind=>events.push(kind)
  });
  vm.runInContext(fs.readFileSync('board-tools.js','utf8').replace(/^import .*\n/gm,'').replace(/^export /gm,''),context);
  return {export:()=>vm.runInContext('exportJson()',context),downloads,backups,events};
}

test('Toolbar never downloads or reports a complete backup after a style failure',async()=>{
  for(const styleResponse of [
    ()=>Response.json({error:'STYLES_UNAVAILABLE'},{status:503}),
    ()=>Response.json({}),
    ()=>Response.json({styles:[style()],offline:true}),
    ()=>{throw new TypeError('Network error');}
  ]){
    const app=toolbar({styleResponse});
    await assert.rejects(app.export());
    assert.equal(app.downloads.length,0);
    assert.equal(app.backups.length,0);
    assert.equal(app.events.length,0);
  }
});

test('Toolbar can back up a fully cached offline board and its cached drawings',async()=>{
  const app=toolbar({offline:true,styleResponse:()=>Response.json({styles:[style()],offline:true})});
  await app.export();
  assert.deepEqual(app.backups[0].notes[0].style.drawing,drawing);
  assert.equal(app.downloads.length,1);
});

test('Toolbar includes successfully loaded cloud styles and preserves local guest styles',async()=>{
  for(const guest of [false,true]){
    const app=toolbar({guest,styleResponse:guest?()=>assert.fail('Guest backup must use its local style'):undefined});
    await app.export();
    assert.deepEqual(app.backups[0].notes[0].style.drawing,drawing);
    assert.deepEqual(app.downloads,['PostisPop-copia.json']);
    assert.deepEqual(app.events,['export']);
  }
});

const pagedStyles=({rows,cap=50,onPage}={})=>(url,options,storage)=>{
  const params=new URL(url).searchParams,offset=Number(params.get('offset')||0);
  assert.equal(options.headers.Prefer,'count=exact');assert.equal(options.metadata,undefined,'Internal metadata option must not reach fetch');
  const override=onPage?.(offset,options,storage);if(override)return override;
  const batch=rows.slice(offset,offset+Math.min(cap,Number(params.get('limit')||100)));
  return Response.json(batch,{headers:{'Content-Range':batch.length?`${offset}-${offset+batch.length-1}/${rows.length}`:`*/${rows.length}`}});
};
const extraStyle=index=>({...style(),note_id:'00000000-0000-4000-8000-'+String(index).padStart(12,'0')});

test('Exact Content-Range pagination handles over 1000 styles and a server cap below the requested page size',async()=>{
  const rows=[...Array.from({length:1004},(_,index)=>extraStyle(index)),style()],offsets=[];
  const app=await bridge({styleResponse:pagedStyles({rows,cap:50,onPage:offset=>{offsets.push(offset);}})});
  const result=await app.request('designs/styles');assert.equal(result.status,200);assert.equal(result.data.styles.length,1005);
  assert.deepEqual(offsets,Array.from({length:21},(_,index)=>index*50));
  assert.equal(app.offline.cached(USER,'designs/styles-complete').complete,true);
  assert.equal(app.offline.cached(USER,'designs/styles-complete').version,2);
  assert.equal(app.offline.cached(USER,'designs/styles-complete').total,1005);
  const exported=await app.request('board/'+BOARD+'/export');assert.equal(exported.status,200);
  assert.deepEqual(exported.data.notes[0].style.drawing,drawing,'Legacy export must reach the drawing after the first 1000 rows');
});

test('A later-page HTTP or transport failure keeps old styles intact, invalidates completeness and never exports a partial drawing set',async()=>{
  for(const transport of [false,true]){
    const rows=[extraStyle(1),style()];
    const app=await bridge({styleResponse:pagedStyles({rows,cap:1,onPage:offset=>{if(offset){if(transport)throw new TypeError('Connection lost on page two');return Response.json({message:'Style page unavailable'},{status:503});}}})});
    app.offline.cacheStyles(USER,[style()]);app.offline.remember(USER,'designs/styles-complete',{complete:true,version:2,total:1});
    const before=copy(app.offline.cached(USER,'designs/styles'));
    const result=await app.request('designs/styles');assert.ok(result.status>=400);
    assert.deepEqual(app.offline.cached(USER,'designs/styles'),before,'No page may replace the stored list before the whole read succeeds');
    assert.equal(app.offline.cached(USER,'designs/styles-complete').complete,false);
    const exported=await app.request('board/'+BOARD+'/export');assert.ok(exported.status>=400);assert.equal(app.backups.length,0);
    app.navigator.onLine=false;assert.equal((await app.request('designs/styles')).data.error,'OFFLINE_STYLES_NOT_CACHED');
  }
});

test('Missing, estimated, inconsistent and overlapping Content-Range results cannot certify a complete style cache',async()=>{
  for(const response of [
    ()=>Response.json([style()]),
    ()=>Response.json([style()],{headers:{'Content-Range':'0-0/*'}}),
    ()=>Response.json([style()],{headers:{'Content-Range':'0-1/2'}}),
    url=>new URL(url).searchParams.get('offset')==='0'?Response.json([extraStyle(1)],{headers:{'Content-Range':'0-0/2'}}):Response.json([style()],{headers:{'Content-Range':'1-1/3'}}),
    url=>Response.json([extraStyle(1)],{headers:{'Content-Range':new URL(url).searchParams.get('offset')==='0'?'0-0/2':'1-1/2'}}),
    url=>new URL(url).searchParams.get('offset')==='0'?Response.json([extraStyle(1)],{headers:{'Content-Range':'0-0/2'}}):Response.json([],{headers:{'Content-Range':'*/2'}})
  ]){
    const app=await bridge({styleResponse:response}),result=await app.request('designs/styles');
    assert.equal(result.data.error,'STYLES_INCOMPLETE');assert.equal(app.offline.cached(USER,'designs/styles-complete').complete,false);
    assert.equal(app.offline.cached(USER,'designs/styles'),null);
  }
});

test('Legacy completeness flags from unverified global reads never authorize offline full backups',async()=>{
  const app=await bridge();await app.request('board/'+BOARD);
  app.offline.cacheStyles(USER,[]);app.offline.remember(USER,'designs/styles-complete',{complete:true});app.navigator.onLine=false;
  assert.equal((await app.request('designs/styles')).data.error,'OFFLINE_STYLES_NOT_CACHED');
});

test('Pagination and completeness certificates remain isolated across an account switch',async()=>{
  const OTHER='55555555-5555-4555-8555-555555555555',rows=[extraStyle(1),style()];let change=false;
  const app=await bridge({styleResponse:pagedStyles({rows,cap:1,onPage:(offset,options,storage)=>{
    if(change&&offset===1)storage.setItem(SESSION,JSON.stringify({access_token:'other-token',user:{id:OTHER},expires_at:Math.floor(Date.now()/1000)+3600}));
  }})});
  const first=await app.request('designs/styles');assert.equal(first.status,200);const before=copy(app.offline.cached(USER,'designs/styles'));
  change=true;const switched=await app.request('designs/styles');assert.equal(switched.status,401);assert.equal(switched.data.error,'SESSION_CHANGED');
  assert.deepEqual(app.offline.cached(USER,'designs/styles'),before);assert.equal(app.offline.cached(USER,'designs/styles-complete').complete,false);
  assert.equal(app.offline.cached(OTHER,'designs/styles'),null);assert.equal(app.offline.cached(OTHER,'designs/styles-complete'),null);
  app.offline.rememberIdentity({id:OTHER});app.navigator.onLine=false;
  assert.equal((await app.request('designs/styles')).data.error,'OFFLINE_STYLES_NOT_CACHED','The next account cannot use the previous account full cache');
});
