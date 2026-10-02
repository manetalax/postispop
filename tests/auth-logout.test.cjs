const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync('supabase-bridge.js','utf8').replace(/^import .*;\n/, '');
const SESSION_KEY='postispop-supabase-session';
const savedSession=()=>({access_token:'test-access',refresh_token:'test-refresh',expires_at:Math.floor(Date.now()/1000)+3600,user:{id:'test-user'}});
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
function setup(upstream,initial=savedSession(),timers={setTimeout,clearTimeout}) {
  const values=new Map(initial?[[SESSION_KEY,JSON.stringify(initial)]]:[]);
  const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
  const calls=[];
  const window={fetch:async(url,options={})=>{calls.push({url,options});return upstream(url,options,storage);}};
  const context=vm.createContext({window,localStorage:storage,location:{origin:'https://postispop.com',href:'https://postispop.com/'},Response,URL,AbortController,guestRequest:()=>null,readGuest:()=>({}),...timers});
  vm.runInContext(source,context);
  return {storage,calls,call:(endpoint,method='GET')=>window.fetch('/api/'+endpoint,{method,...(method==='POST'?{body:'{}'}:{})})};
}

test('Logout removes local credentials first and revokes only the current provider session',async()=>{
  const app=setup(async(url,options,storage)=>{
    assert.equal(storage.getItem(SESSION_KEY),null);
    assert.equal(new URL(url).pathname,'/auth/v1/logout');
    assert.equal(new URL(url).searchParams.get('scope'),'local');
    assert.equal(options.method,'POST');
    assert.equal(options.headers.Authorization,'Bearer test-access');
    assert.ok(options.headers.apikey);
    return new Response(null,{status:204});
  });
  const response=await app.call('auth/logout','POST');
  assert.equal(response.status,200);
  assert.deepEqual(await response.json(),{ok:true,serverRevoked:true});
  assert.equal((await (await app.call('session')).json()).actor.registered,false);
  assert.equal(app.calls.length,1);
});

for(const status of [401,503])test(`Provider HTTP ${status} does not prevent local logout or claim revocation`,async()=>{
  const app=setup(async()=>new Response(null,{status}));
  const response=await app.call('auth/logout','POST');
  assert.equal(response.status,200);
  assert.deepEqual(await response.json(),{ok:true,serverRevoked:false,warning:'REMOTE_LOGOUT_UNCONFIRMED'});
  assert.equal(app.storage.getItem(SESSION_KEY),null);
});

test('Offline logout removes local credentials and marks remote revocation unconfirmed',async()=>{
  const app=setup(async()=>{throw new TypeError('Network unavailable');});
  const body=await (await app.call('auth/logout','POST')).json();
  assert.equal(body.ok,true);assert.equal(body.serverRevoked,false);
  assert.equal(app.storage.getItem(SESSION_KEY),null);
});

test('A stalled provider request times out without restoring local credentials',async()=>{
  let expire;
  const app=setup(async(_url,options)=>new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('Aborted')))),savedSession(),{setTimeout:fn=>{expire=fn;return 1;},clearTimeout:()=>{}});
  const pending=app.call('auth/logout','POST');
  assert.equal(app.storage.getItem(SESSION_KEY),null);
  expire();
  assert.equal((await (await pending).json()).serverRevoked,false);
});

test('Logging out a guest does not make a provider call',async()=>{
  const app=setup(async()=>{throw Error('Unexpected provider request');},null);
  assert.deepEqual(await (await app.call('auth/logout','POST')).json(),{ok:true,serverRevoked:null});
  assert.equal(app.calls.length,0);
});

test('A refreshed token arriving after logout cannot sign the user back in',async()=>{
  const started=deferred(),refresh=deferred();
  const app=setup(async url=>{
    if(url.includes('grant_type=refresh_token')){started.resolve();return refresh.promise;}
    if(url.includes('/logout'))return new Response(null,{status:204});
    throw Error('A logged-out session must not fetch the user');
  },{...savedSession(),expires_at:1});
  const pending=app.call('session');await started.promise;
  await app.call('auth/logout','POST');
  refresh.resolve(Response.json({...savedSession(),access_token:'test-refreshed'}));
  assert.equal((await (await pending).json()).actor.registered,false);
  assert.equal(app.storage.getItem(SESSION_KEY),null);
});

test('A late user response after logout is not returned as an authenticated actor',async()=>{
  const started=deferred(),user=deferred();
  const app=setup(async url=>{
    if(url.endsWith('/user')){started.resolve();return user.promise;}
    return new Response(null,{status:204});
  });
  const pending=app.call('session');await started.promise;
  await app.call('auth/logout','POST');
  user.resolve(Response.json({id:'test-user',email:'test@example.invalid'}));
  assert.equal((await (await pending).json()).actor.registered,false);
  assert.equal(app.storage.getItem(SESSION_KEY),null);
});

test('Logout discards the cached authenticated user',async()=>{
  let userReads=0;
  const app=setup(async url=>{
    if(url.endsWith('/user')){userReads++;return Response.json({id:'test-user',email:'test@example.invalid'});}
    return new Response(null,{status:204});
  });
  await app.call('session');
  await app.call('auth/logout','POST');
  app.storage.setItem(SESSION_KEY,JSON.stringify(savedSession()));
  await app.call('session');
  assert.equal(userReads,2);
});


test('Normal token renewal still authenticates when no logout has occurred',async()=>{
  const app=setup(async(url,options)=>{
    if(url.includes('grant_type=refresh_token'))return Response.json({...savedSession(),access_token:'test-refreshed'});
    assert.equal(options.headers.Authorization,'Bearer test-refreshed');
    return Response.json({id:'test-user',email:'test@example.invalid'});
  },{...savedSession(),expires_at:1});
  assert.equal((await (await app.call('session')).json()).actor.registered,true);
  assert.equal(JSON.parse(app.storage.getItem(SESSION_KEY)).access_token,'test-refreshed');
});
