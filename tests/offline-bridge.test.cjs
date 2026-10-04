const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('supabase-bridge.js','utf8').replace(/^import .*\n/gm,'');
const SESSION='postispop-supabase-session';
function disk(){const m=new Map();return{get length(){return m.size},key:i=>[...m.keys()][i]??null,getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k),map:m};}
const saved=id=>({access_token:'token-'+id,refresh_token:'refresh-'+id,expires_at:Math.floor(Date.now()/1000)+3600,user:{id,email:id+'@example.test'}});
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve}};
async function setup({storage=disk(),before}={}){
 const sync=await import('../offline-sync.js');if(!storage.getItem(SESSION))storage.setItem(SESSION,JSON.stringify(saved('A')));
 const server={id:'note-a',board_id:'board-a',author_id:'A',text:'Original',paper:0,marks:[],doodle:'',revision:1,created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
 const navigator={onLine:true}, calls=[],events={};
 const window={addEventListener:(name,f)=>{events[name]=f},dispatchEvent:()=>{},fetch:async(url,options={})=>{
  calls.push({url,options});if(!navigator.onLine)throw new TypeError('Network unreachable');if(before){const response=await before(url,options);if(response)return response;}
  if(url.includes('/auth/v1/user')){const id=options.headers.Authorization.slice(-1);return Response.json({id,email:id+'@example.test'});}
  if(url.includes('/auth/v1/logout'))return new Response(null,{status:204});
  if(url.includes('/rest/v1/boards'))return Response.json([{id:'board-a',owner_id:'A',title:'A private board',revision:1}]);
  if(url.includes('/rest/v1/board_members'))return Response.json([]);
  if(url.includes('/rest/v1/notes')){
   if(options.method==='PATCH'){const rev=new URL(url).searchParams.get('revision')?.replace('eq.','');if(rev&&+rev!==server.revision)return Response.json([]);Object.assign(server,JSON.parse(options.body));return Response.json([server]);}
   return Response.json([server]);
  }
  throw Error('Unexpected '+url);
 }};
 const context=vm.createContext({window,navigator,localStorage:storage,location:{origin:'https://postispop.com',href:'https://postispop.com/'},Response,Request,URL,URLSearchParams,AbortController,TypeError,Date,JSON,crypto,encodeURIComponent,setTimeout,clearTimeout,console,guestRequest:()=>null,readGuest:()=>({}),...sync,installOfflineUI:()=>{},getOfflineRights:async()=>null,saveOfflineReceipt:async()=>false});
 vm.runInContext(source,context);
 const request=async(endpoint,data)=>{const r=await window.fetch('/api/'+endpoint,data===undefined?{}:{method:'POST',body:JSON.stringify(data)});return{status:r.status,data:await r.json()}};
 return{request,storage,server,navigator,calls,window};
}
test('Account note creates offline in an empty cached slot, survives close/reopen, then synchronizes once',async()=>{
 const a=await setup();await a.request('board/board-a');a.navigator.onLine=false;
 const local=await a.request('note/note-a',{text:'Offline draft',marks:[],revision:1});assert.equal(local.status,202);assert.equal(local.data.note.revision,2);assert.equal(a.server.text,'Original');
 const b=await setup({storage:a.storage});b.navigator.onLine=false;const reopened=await b.request('board/board-a');assert.equal(reopened.data.notes[0].text,'Offline draft');
 b.navigator.onLine=true;assert.equal((await b.request('offline/sync',{})).data.pending,0);assert.equal(b.server.text,'Offline draft');assert.equal(b.server.revision,2);await b.request('offline/sync',{});assert.equal(b.calls.filter(c=>c.options.method==='PATCH').length,1);
});
test('Server conflict never overwrites either version and can be explicitly resolved',async()=>{
 const app=await setup();await app.request('board/board-a');app.navigator.onLine=false;await app.request('note/note-a',{text:'Local version',revision:1});app.server.text='Other device';app.server.revision=2;app.navigator.onLine=true;
 const status=await app.request('offline/sync',{});assert.equal(status.data.conflicts,1);assert.equal(app.server.text,'Other device');assert.equal((await app.request('board/board-a')).data.notes[0].text,'Local version');
 const conflict=(await app.request('offline/conflicts')).data.conflicts[0];await app.request('offline/resolve',{id:conflict.id,choice:'local'});assert.equal(app.server.text,'Local version');assert.equal(app.server.revision,3);
});
test('Cached authenticated offline logout clears credentials and never exposes that cache to the next account',async()=>{
 const app=await setup();await app.request('board/board-a');app.navigator.onLine=false;const logout=await app.request('auth/logout',{});assert.equal(logout.data.ok,true);assert.equal(app.storage.getItem(SESSION),null);
 app.storage.setItem(SESSION,JSON.stringify(saved('B')));const board=await app.request('board/board-a');assert.ok(board.status>=400);assert.notEqual(board.data.title,'A private board');
});
test('A board response started in account A is discarded after account B replaces the session',async()=>{
 const started=deferred(),delayed=deferred();const app=await setup({before:async(url)=>{if(url.includes('/rest/v1/boards')){started.resolve();return delayed.promise;}}});
 const pending=app.request('board/board-a');await started.promise;app.storage.setItem(SESSION,JSON.stringify(saved('B')));delayed.resolve(Response.json([{id:'board-a',owner_id:'A',title:'Private A'}]));const response=await pending;assert.equal(response.status,401);assert.equal(response.data.error,'SESSION_CHANGED');assert.equal(app.storage.getItem('postispop:offline:v1:B:cache:board/board-a'),null);
});
