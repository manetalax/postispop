const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');

const boardId='11111111-1111-4111-8111-111111111111';
const userId='22222222-2222-4222-8222-222222222222';
const noteIds=['33333333-3333-4333-8333-333333333333','44444444-4444-4444-8444-444444444444'];
const trashId='55555555-5555-4555-8555-555555555555';
const response=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});

function setup(){
  const storage=new Map([['postispop-supabase-session',JSON.stringify({access_token:'test-token',user:{id:userId}})]]);
  const notes=[
    {id:noteIds[0],board_id:boardId,position:0,paper:5,text:'Nota con color lila',marks:[],doodle:null,image_url:null,revision:4,author_id:userId,created_at:'2026-01-01T00:00:00Z',created_ms:1767225600000,updated_at:'2026-01-01T00:00:00Z',updated_ms:1767225600000,locked_until:null,editing:null},
    {id:noteIds[1],board_id:boardId,position:1,paper:0,text:'',marks:[],doodle:null,image_url:null,revision:2,author_id:userId,created_at:'2026-01-01T00:00:00Z',created_ms:1767225600000,updated_at:'2026-01-01T00:00:00Z',updated_ms:1767225600000,locked_until:null,editing:null}
  ];
  const trashRows=[];const calls=[];let boardRevision=9;
  const fetch=async(input,init={})=>{
    const url=new URL(typeof input==='string'?input:input.url);
    const body=init.body?JSON.parse(init.body):{};
    calls.push({url:url.pathname+url.search,method:init.method||'GET',body});
    if(url.pathname.endsWith('/auth/v1/user')) return response({id:userId,email:'test@example.test'});
    if(url.pathname.endsWith('/rpc/postispop_trash_note')){
      const note=notes.find(n=>n.id===body.p_note_id);if(!note)return response({message:'NOT_FOUND'},404);
      trashRows.push({id:trashId,board_id:boardId,user_id:userId,note_data:{...note},expires_at:'2099-01-01T00:00:00Z',created_at:'2026-01-01T00:00:00Z'});
      Object.assign(note,{text:'',paper:0,marks:[],doodle:null,image_url:null,revision:note.revision+1});
      return response({trash_id:trashId,board_id:boardId});
    }
    if(url.pathname.endsWith('/rpc/postispop_restore_note')){
      const row=trashRows.shift();if(!row)return response({message:'NOT_FOUND'},404);
      Object.assign(notes[0],row.note_data,{id:notes[0].id,revision:notes[0].revision+1});
      return response({board_id:boardId});
    }
    if(url.pathname.endsWith('/rpc/postispop_swap_notes')){
      assert.equal(body.p_revision,boardRevision);assert.equal(body.p_from,noteIds[0]);assert.equal(body.p_to,noteIds[1]);
      [notes[0].position,notes[1].position]=[notes[1].position,notes[0].position];boardRevision++;
      return response({board_id:boardId});
    }
    if(url.pathname.endsWith('/rest/v1/boards')) return response([{id:boardId,owner_id:userId,title:'Mi pizarra',revision:boardRevision,expires_at:null}]);
    if(url.pathname.endsWith('/rest/v1/notes')) return response([...notes].sort((a,b)=>a.position-b.position));
    if(url.pathname.endsWith('/rest/v1/board_members')) return response([]);
    if(url.pathname.endsWith('/rest/v1/note_trash')) return response(trashRows);
    return response({message:'Unexpected request '+url.pathname},500);
  };
  const localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
  const context=vm.createContext({console,Response,URL,URLSearchParams,Date,JSON,crypto,localStorage,location:{origin:'https://postispop.com',href:'https://postispop.com/'},window:{fetch}});
  const source=fs.readFileSync('guest-board.js','utf8').replaceAll('export function','function')+'\n'+fs.readFileSync('supabase-bridge.js','utf8').replace(/^import .*\n/,'');
  vm.runInContext(source,context);
  return {context,calls,notes};
}

const request=async(context,path,data)=>{
  const init=data===undefined?{}:{method:'POST',body:JSON.stringify(data)};
  const response=await context.window.fetch('/api/'+path,init);
  return {status:response.status,data:await response.json()};
};

test('Authenticated note colors survive trash, listing, restore and reorder requests',async()=>{
  const {context,calls}=setup();
  const deleted=await request(context,`note/${noteIds[0]}/trash`,{revision:4,lock:''});
  assert.equal(deleted.status,200);assert.equal(deleted.data.trashId,trashId);
  assert.equal(deleted.data.board.notes[0].paper,0);
  const listing=await request(context,`board/${boardId}/trash`);
  assert.equal(listing.data.items[0].note.paper,5);
  const restored=await request(context,`restore/${trashId}`,{});
  assert.equal(restored.status,200);assert.equal(restored.data.notes[0].paper,5);
  const reordered=await request(context,`board/${boardId}/swap`,{from:noteIds[0],to:noteIds[1],revision:9});
  assert.equal(reordered.status,200);assert.equal(reordered.data.notes[0].id,noteIds[1]);
  assert.ok(calls.some(call=>call.url.endsWith('/rpc/postispop_trash_note')));
  assert.ok(calls.some(call=>call.url.endsWith('/rpc/postispop_restore_note')));
  assert.ok(calls.some(call=>call.url.endsWith('/rpc/postispop_swap_notes')));
});
