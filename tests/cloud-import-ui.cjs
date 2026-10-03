const {browserOptions}=require('./browser-options.cjs');
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');

const ORIGIN='https://postispop.com';
const SUPABASE='https://htfyjefmviwlgmfqrwue.supabase.co';
const USER='11111111-1111-4111-8111-111111111111';
const BOARD='22222222-2222-4222-8222-222222222222';
const SESSION='postispop-supabase-session';
const root=path.resolve(process.env.POSTISPOP_TEST_ROOT||path.join(__dirname,'../_site'));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
const fixture=`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Cloud import UI fixture</title></head><body>
<section class="board-frame"><div class="board-grid"><div class="note-cell"><button class="sticky-note" data-note-id="33333333-3333-4333-8333-333333333330">Contenido anterior</button></div></div></section>
<script type="module">import './supabase-bridge.js';import {initBoardTools} from './board-tools.js';initBoardTools();</script></body></html>`;
const deferred=()=>{let resolve;const promise=new Promise(done=>resolve=done);return{promise,resolve};};

(async()=>{
  const browser=await chromium.launch(browserOptions({args:['--no-sandbox','--disable-gpu','--disk-cache-size=1','--media-cache-size=1']}));
  const context=await browser.newContext({locale:'es-ES',viewport:{width:1000,height:800},serviceWorkers:'block'});
  const failures=[],pageErrors=[],requests=[],receipts=new Map();
  const notes=Array.from({length:12},(_,position)=>({id:`33333333-3333-4333-8333-${String(position).padStart(12,'0')}`,board_id:BOARD,author_id:USER,position,paper:position%6,text:position===0?'Contenido anterior':'',marks:[],doodle:'',image_url:null,revision:1,created_ms:1,updated_ms:1,locked_until:null,editing:null}));
  let ready=false,commits=0,holdNext=false,held=null,release=null;
  const session=JSON.stringify({access_token:'test-session-only',expires_at:Math.floor(Date.now()/1000)+3600,user:{id:USER,email:'fixture@example.test'}});
  await context.addInitScript(({key,value,board})=>{localStorage.setItem(key,value);localStorage.setItem('pp:last-board',board);},{key:SESSION,value:session,board:BOARD});
  try{
    // Every request is fulfilled or aborted here. No route.continue()/fetch(),
    // production credentials, real Supabase writes, or service workers are used.
    await context.route('**/*',async route=>{
      const request=route.request(),url=new URL(request.url());
      if(url.origin===SUPABASE){
        const headers={'access-control-allow-origin':ORIGIN,'access-control-allow-headers':'authorization,apikey,content-type','access-control-allow-methods':'GET,POST,OPTIONS'};
        const json=(body,status=200)=>route.fulfill({status,headers,contentType:'application/json',body:JSON.stringify(body)});
        if(request.method()==='OPTIONS')return route.fulfill({status:204,headers,body:''});
        if(url.pathname==='/auth/v1/user')return json({id:USER,email:'fixture@example.test'});
        if(url.pathname==='/rest/v1/boards'&&request.method()==='GET')return json([{id:BOARD,owner_id:USER,title:'Pizarra de prueba',revision:1}]);
        if(url.pathname==='/rest/v1/notes'&&request.method()==='GET')return json(notes);
        if(['/rest/v1/board_members','/rest/v1/postispop_note_style'].includes(url.pathname)&&request.method()==='GET')return json([]);
        if(url.pathname==='/rest/v1/rpc/postispop_import_board'&&request.method()==='POST'){
          const body=request.postDataJSON();requests.push(body);
          if(!ready)return json({code:'PGRST202',message:'Could not find function postispop_import_board'},404);
          if(holdNext){holdNext=false;held.resolve();await release.promise;}
          const previous=receipts.get(body.p_request_id);
          if(previous){assert.equal(previous.payload,JSON.stringify(body.p_notes));return json({...previous.result,replayed:true});}
          const empty=notes.filter(note=>!note.text&&!body.p_excluded_note_ids.includes(note.id));
          assert.ok(empty.length>=body.p_notes.length);
          const imported=body.p_notes.map((note,index)=>{Object.assign(empty[index],{text:note.text,paper:note.paper,marks:note.marks,doodle:note.doodle,image_url:note.image?.url||null,revision:empty[index].revision+1});return empty[index].id;});
          const result={ok:true,requestId:body.p_request_id,imported:imported.length,noteIds:imported,replayed:false};
          receipts.set(body.p_request_id,{payload:JSON.stringify(body.p_notes),result});commits++;
          return json(result);
        }
        failures.push('Unexpected mocked backend request '+request.method()+' '+url.pathname);return json({error:'UNEXPECTED_TEST_REQUEST'},500);
      }
      if(url.origin!==ORIGIN){failures.push('Unexpected external origin '+url.origin);return route.abort('internetdisconnected');}
      if(url.pathname==='/cloud-import-fixture.html')return route.fulfill({contentType:'text/html',body:fixture});
      const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
      if(!file.startsWith(root+path.sep)){failures.push('Invalid staged path');return route.abort();}
      try{return await route.fulfill({contentType:types[path.extname(file)]||'application/octet-stream',body:await fs.readFile(file)});}
      catch{failures.push('Missing staged asset '+url.pathname);return route.fulfill({status:404,body:'Missing staged test asset'});}
    });
    const openPage=async()=>{const page=await context.newPage();page.on('pageerror',error=>pageErrors.push(error.message));await page.goto(ORIGIN+'/cloud-import-fixture.html');await page.waitForSelector('.pp-board-options');return page;};
    const selectBackup=async(page,name,notes)=>{
      await page.getByText('Opciones avanzadas',{exact:true}).click();
      await page.getByRole('button',{name:'Restaurar una copia',exact:true}).click();
      const dialog=page.getByRole('dialog',{name:'Restaurar una copia de seguridad',exact:true});
      await dialog.locator('input[type=file]').setInputFiles({name,mimeType:'application/json',buffer:Buffer.from(JSON.stringify({format:'postispop',version:1,notes}))});
      await page.waitForFunction(()=>document.querySelector('.pp-feature-dialog [role=status]')?.textContent.includes('notas con contenido'));
      return dialog;
    };
    const one=await openPage();
    const copy=[{text:'Restauración de prueba',paper:2,marks:[],style:{drawing:[]}},{text:'Imagen de la copia',paper:3,marks:[],image:{url:'https://example.test/image.png'}}];
    let dialog=await selectBackup(one,'copia-cloud.json',copy);
    assert.match(await dialog.locator('[role=status]').innerText(),/2 notas con contenido/);
    await dialog.getByRole('button',{name:'Añadir a las notas vacías',exact:true}).click();
    await one.waitForFunction(()=>document.querySelector('.pp-feature-dialog [role=status]')?.textContent.includes('aún no está habilitada'));
    assert.equal(commits,0);assert.equal(requests.length,1);
    assert.equal(await dialog.getByRole('button',{name:'Añadir a las notas vacías',exact:true}).isEnabled(),true);
    ready=true;
    await Promise.all([one.waitForNavigation(),dialog.getByRole('button',{name:'Añadir a las notas vacías',exact:true}).click()]);
    await one.waitForSelector('.pp-board-options');
    assert.equal(requests.length,2);assert.equal(requests[0].p_request_id,requests[1].p_request_id,'Unavailable backend retry keeps its idempotency ticket');
    assert.deepEqual(requests[1].p_notes[0].style.drawing,{version:1,selectedInstrument:'ballpoint',strokes:[]});
    assert.equal(requests[1].p_notes[1].image.url,'https://example.test/image.png');
    assert.equal(commits,1);assert.equal(notes[0].text,'Contenido anterior');
    assert.equal(notes.filter(note=>note.text==='Restauración de prueba').length,1);

    const two=await openPage(),simultaneous=[{text:'Copia simultánea',paper:1,marks:[]}];
    const firstDialog=await selectBackup(one,'simultanea.json',simultaneous),secondDialog=await selectBackup(two,'simultanea.json',simultaneous);
    held=deferred();release=deferred();holdNext=true;
    const firstNavigation=one.waitForNavigation(),secondNavigation=two.waitForNavigation();
    await firstDialog.getByRole('button',{name:'Añadir a las notas vacías',exact:true}).click();
    await held.promise;
    await secondDialog.getByRole('button',{name:'Añadir a las notas vacías',exact:true}).click();
    // The second real browser tab has entered import and is waiting behind the
    // first tab's attachment locks before the mocked server acknowledges it.
    await two.waitForFunction(async()=>{const state=await navigator.locks.query();return state.pending.some(lock=>lock.name.startsWith('postispop-note-storage:'));});
    release.resolve();
    await Promise.all([firstNavigation,secondNavigation]);
    await Promise.all([one.waitForSelector('.pp-board-options'),two.waitForSelector('.pp-board-options')]);
    const concurrent=requests.filter(request=>request.p_notes[0]?.text==='Copia simultánea');
    assert.equal(concurrent.length,2);assert.equal(concurrent[0].p_request_id,concurrent[1].p_request_id,'Concurrent tabs submit the same idempotency ticket');
    assert.equal(commits,2,'One successful ordinary import and one concurrent import commit');
    assert.equal(notes.filter(note=>note.text==='Copia simultánea').length,1);
    const stored=await one.evaluate(()=>Object.fromEntries(Object.keys(localStorage).filter(key=>key.startsWith('pp:import-request:')).map(key=>[key,localStorage.getItem(key)])));
    assert.ok(!JSON.stringify(stored).includes('Copia simultánea'),'Tickets never persist backup contents');
    assert.deepEqual(failures,[]);assert.deepEqual(pageErrors,[]);
    console.log('PASS cloud import UI: staged real modules; preview, missing RPC explanation, retry with same ticket, legacy empty drawing and image preserved; simultaneous tabs share one ticket/commit; all backend requests mocked.');
  }finally{release?.resolve();await context.close();await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
