const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../supabase-bridge.js'),'utf8').replace(/^import .*\n/gm,'');
const owner='11111111-1111-4111-8111-111111111111';
const other='22222222-2222-4222-8222-222222222222';

// Small PostgREST transport fake: evaluate the request predicates against the
// current row immediately before applying each PATCH, as a conditional UPDATE does.
// No real account, network request or database is used.
function database(overrides={}) {
 const note={id:'note-1',text:'Original',paper:0,marks:[],doodle:'',metadata:{},revision:7,editing:null,locked_until:null,...overrides};
 const writes=[];
 const predicate=(filter)=>{
  const [,field,op,value]=filter.match(/^([^.]+)\.([^.]+)\.(.*)$/)||[];
  if(op==='eq')return String(note[field])===value;
  if(op==='is'&&value==='null')return note[field]==null;
  if(op==='lt')return note[field]!=null&&Date.parse(note[field])<Date.parse(value);
  throw Error('Unsupported filter: '+filter);
 };
 const fetch=async(input,init={})=>{
  const url=new URL(input);
  if(url.pathname==='/auth/v1/user')return Response.json({id:init.headers.Authorization.slice(7),email:'user@example.invalid'});
  assert.equal(url.pathname,'/rest/v1/notes');
  assert.equal(init.method,'PATCH','Saving must not use a read-then-write sequence');
  const matches=[...url.searchParams].every(([field,filter])=>field==='or'?filter.slice(1,-1).split(',').some(predicate):predicate(field+'.'+filter));
  if(!matches)return Response.json([]);
  const update=JSON.parse(init.body);writes.push(update);Object.assign(note,update);
  return Response.json([{...note}]);
 };
 return{note,writes,fetch};
}
function client(db,id=owner){
 const storage=new Map([['postispop-supabase-session',JSON.stringify({access_token:id,user:{id}})]]);
 const context=vm.createContext({Response,Request,URL,URLSearchParams,Date,JSON,encodeURIComponent,
  localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},
  location:{origin:'https://postispop.com',href:'https://postispop.com/'},window:{fetch:db.fetch},
  guestRequest:()=>null,cleanNote:note=>note,metadata:value=>value||{}
 });
 vm.runInContext(source,context);
 return async(suffix,body)=>{
  const response=await context.window.fetch('/api/note/note-1'+suffix,{method:'POST',body:JSON.stringify(body)});
  return{status:response.status,data:await response.json()};
 };
}
const changes=[['',{text:'Nuevo',marks:[]}],['/text',{text:'Nuevo',marks:[]}],['/paper',{paper:2}],['/doodle',{doodle:'M1 2'}],['/image',{url:'https://example.invalid/image.png'}],['/metadata',{metadata:{tags:['hoy']}}]];

test('Every normal note save rejects a live foreign lock without modifying data',async()=>{
 for(const [suffix,change] of changes){
  const db=database({editing:other,locked_until:new Date(Date.now()+60000).toISOString()});
  const before=JSON.stringify(db.note);
  const result=await client(db)(suffix,{...change,revision:7});
  assert.equal(result.status,409,suffix);assert.equal(result.data.error,'CONFLICT',suffix);
  assert.equal(JSON.stringify(db.note),before);assert.equal(db.writes.length,0);
 }
});
test('Every normal save requires a valid revision and rejects stale changes',async()=>{
 for(const [suffix,change] of changes){
  const db=database(),request=client(db);
  for(const revision of [undefined,null,0,1.5,'7']){
   const result=await request(suffix,{...change,revision});assert.equal(result.status,400,suffix);
  }
  assert.equal((await request(suffix,{...change,revision:6})).status,409,suffix);
  assert.equal(db.writes.length,0);
 }
});
test('Current edits save for unlocked, expired and own locks and advance the revision',async()=>{
 for(const lock of [{},{editing:other,locked_until:new Date(Date.now()-60000).toISOString()},{editing:owner,locked_until:new Date(Date.now()+60000).toISOString()}]){
  const db=database(lock),result=await client(db)('/text',{text:'Guardado',revision:7});
  assert.equal(result.status,200);assert.equal(db.note.text,'Guardado');assert.equal(db.note.revision,8);
 }
});
test('Competing lock acquisitions have one winner and reject the losing stale save',async()=>{
 const db=database(),a=client(db,owner),b=client(db,other);
 const acquired=await Promise.all([a('/lock',{}),b('/lock',{})]);
 assert.deepEqual(acquired.map(r=>r.status).sort(),[200,409]);
 const winner=acquired[0].status===200?a:b,loser=winner===a?b:a;
 assert.equal((await loser('/text',{text:'Sobrescribir',revision:7})).status,409);
 assert.equal((await winner('/text',{text:'Ganador',revision:7})).status,200);
 assert.equal(db.note.text,'Ganador');
 assert.equal((await loser('/unlock',{})).status,409);
 assert.notEqual(db.note.editing,null);
 assert.equal((await winner('/lock',{})).status,200,'The current editor can renew its lease');
 assert.equal((await winner('/unlock',{})).status,200);assert.equal(db.note.editing,null);
});
