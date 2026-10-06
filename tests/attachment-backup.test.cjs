const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises'),path=require('node:path');
const {browserOptions}=require('./browser-options.cjs');

test('Attachment backup rejects malformed metadata and never exposes attachments outside a protected envelope',async()=>{
  const {normalizeBackup,backupNotesForServer}=await import('../backup-import.js');
  const {encryptNote}=await import('../note-crypto.js');
  const attachment={kind:'file',name:'informe.pdf',type:'application/pdf',data:'AAEC_w',size:4,sha256:'a'.repeat(64)};
  const normalized=normalizeBackup({format:'postispop',version:2,notes:[{text:'',attachments:[attachment]}]});
  assert.equal(normalized.notes.length,1,'attachment-only notes survive normalization');
  const server=backupNotesForServer(normalized.notes);
  assert.equal(server[0].text,'📎 Adjuntos');assert.equal(server[0].attachments,undefined);
  assert.equal(JSON.stringify(server).includes('AAEC_w'),false,'ordinary binary data never enters the server payload');
  for(const invalid of [{...attachment,data:'<script>'},{...attachment,size:3},{...attachment,name:'../private.pdf'},{...attachment,type:'text/html\nscript'},{...attachment,sha256:'bad'},{...attachment,size:26*1024*1024},{kind:'link',name:'link',url:'javascript:alert(1)'},{kind:'link',name:'link',url:'https://user:password@example.com/'}]){
    assert.throws(()=>normalizeBackup({version:2,notes:[{text:'data',attachments:[invalid]}]}),/INVALID_ATTACHMENT/);
  }
  const envelope=await encryptNote({text:'private file'},'test-password');
  const protectedCopy=normalizeBackup({version:2,notes:[{paper:2,protectedEnvelope:envelope,text:'discard plaintext',attachments:[attachment]}]});
  assert.deepEqual(Object.keys(protectedCopy.notes[0]).sort(),['paper','protectedEnvelope']);
  assert.equal(JSON.stringify(protectedCopy).includes('AAEC_w'),false);
  assert.equal(normalizeBackup({version:1,notes:[{text:'legacy backup'}]}).version,1);
});

test('Offline binary attachment roundtrip preserves bytes and links, scopes exports, rejects corruption and rolls back only its own additions',{timeout:30000},async()=>{
  const {chromium}=require('playwright');
  const browser=await chromium.launch(browserOptions());
  const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage(),requests=[];
  const root=process.cwd();
  await page.route('https://backup.test/**',async route=>{
    const url=new URL(route.request().url());requests.push(url.pathname);
    if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:'<!doctype html><html><body><script type="module">window.backup=await import("/backup-import.js");window.cryptoNotes=await import("/note-crypto.js");window.guest=await import("/guest-board.js");window.ready=true;</script></body></html>'});
    const file=path.resolve(root,'.'+url.pathname);
    if(!file.startsWith(root+path.sep))return route.abort();
    try{return route.fulfill({contentType:'text/javascript',body:await fs.readFile(file)});}catch{return route.fulfill({status:404,body:''});}
  });
  try{
    await page.goto('https://backup.test/');await page.waitForFunction(()=>window.ready);await context.setOffline(true);
    const result=await page.evaluate(async()=>{
      const {createBoardBackup,normalizeBackup,restoreBackupAttachments}=window.backup;
      const board=window.guest.readGuest();board.notes[0].text='A note with local files';
      board.notes[1].protectedEnvelope=await window.cryptoNotes.encryptNote({text:'encrypted text',attachments:[{kind:'file',name:'secret.pdf',type:'application/pdf',data:'c2VjcmV0'}]},'test-password');
      localStorage.setItem('postispop-guest-board-v1',JSON.stringify(board));localStorage.setItem('pp:protected-note:guest-note-1','1');
      const db=await new Promise((resolve,reject)=>{const request=indexedDB.open('postispop-note-attachments',1);request.onupgradeneeded=()=>{const store=request.result.createObjectStore('attachments',{keyPath:'key'});store.createIndex('noteId','noteId');};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
      const transact=(mode,work)=>new Promise((resolve,reject)=>{const tx=db.transaction('attachments',mode);work(tx.objectStore('attachments'));tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(tx.error);});
      const original=[0,1,2,127,128,254,255,10,13,37,80,68,70];
      await transact('readwrite',store=>{
        store.put({key:'guest-note-0::pdf',id:'pdf',noteId:'guest-note-0',kind:'file',name:'Informe.pdf',type:'application/pdf',size:original.length,created:123,blob:new Blob([new Uint8Array(original)],{type:'application/pdf'})});
        store.put({key:'guest-note-0::link',id:'link',noteId:'guest-note-0',kind:'link',name:'example.org',url:'https://example.org/documento?a=1',created:124});
        store.put({key:'guest-note-1::stale',id:'stale',noteId:'guest-note-1',kind:'file',name:'STALE-PLAINTEXT-NEVER-EXPORT.pdf',type:'application/pdf',blob:new Blob(['stale plaintext'])});
        store.put({key:'another-board-note::private',id:'private',noteId:'another-board-note',kind:'file',name:'OTHER-BOARD-NEVER-EXPORT.pdf',type:'application/pdf',blob:new Blob(['unrelated private bytes'])});
      });
      const exported=await createBoardBackup(board),serialized=JSON.stringify(exported),normalized=normalizeBackup(JSON.parse(serialized));
      const options={requestId:crypto.randomUUID()};
      const restored=await restoreBackupAttachments(normalized.notes,['guest-note-4','guest-note-5'],options);
      const all=()=>new Promise((resolve,reject)=>{const tx=db.transaction('attachments','readonly'),request=tx.objectStore('attachments').getAll();request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
      const rows=await all(),files=rows.filter(row=>row.noteId==='guest-note-4');
      const bytes=[...new Uint8Array(await files.find(row=>row.kind==='file').blob.arrayBuffer())];
      const replay=await restoreBackupAttachments(normalized.notes,['guest-note-4','guest-note-5'],options);await replay.rollback();
      const countAfterReplay=(await all()).length;
      const corrupted=structuredClone(normalized.notes);corrupted[0].attachments.find(item=>item.kind==='file').data='AQECf4D-_woNJVBERg';
      let corruptionError='';try{await restoreBackupAttachments(corrupted,['guest-note-2','guest-note-3'],{requestId:crypto.randomUUID()});}catch(error){corruptionError=error.message;}
      let switchedError='';try{await restoreBackupAttachments(normalized.notes,['guest-note-2','guest-note-3'],{requestId:crypto.randomUUID(),validate:()=>{throw Error('SESSION_CHANGED');}});}catch(error){switchedError=error.message;}
      const countAfterFailures=(await all()).length;
      const nativeAdd=IDBObjectStore.prototype.add;IDBObjectStore.prototype.add=function(){throw new DOMException('Quota full','QuotaExceededError');};
      let diskError='';try{await restoreBackupAttachments(normalized.notes,['guest-note-2','guest-note-3'],{requestId:crypto.randomUUID()});}catch(error){diskError=error.message;}finally{IDBObjectStore.prototype.add=nativeAdd;}
      const countAfterDiskFailure=(await all()).length;
      await restored.rollback();const final=await all();db.close();
      const nativeBuffer=Blob.prototype.arrayBuffer;let exportSessionError='';
      Blob.prototype.arrayBuffer=function(){localStorage.setItem('postispop-supabase-session',JSON.stringify({user:{id:'different-user'}}));window.dispatchEvent(new Event('postispop:session-change'));return nativeBuffer.call(this);};
      try{await createBoardBackup(board);}catch(error){exportSessionError=error.message;}finally{Blob.prototype.arrayBuffer=nativeBuffer;localStorage.removeItem('postispop-supabase-session');}

      return {original,bytes,exportVersion:exported.version,noteCount:normalized.notes.length,link:files.find(row=>row.kind==='link').url,created:files.find(row=>row.kind==='file').created,metadataName:files.find(row=>row.kind==='file').name,scoped:!serialized.includes('NEVER-EXPORT'),protectedKeys:Object.keys(exported.notes[1]).sort(),rowCount:rows.length,countAfterReplay,countAfterFailures,countAfterDiskFailure,finalCount:final.length,corruptionError,switchedError,diskError,exportSessionError};
    });
    assert.deepEqual(result.bytes,result.original);assert.equal(result.exportVersion,2);assert.equal(result.noteCount,2);assert.equal(result.link,'https://example.org/documento?a=1');assert.equal(result.created,123);assert.equal(result.metadataName,'Informe.pdf');
    assert.equal(result.scoped,true);assert.deepEqual(result.protectedKeys,['paper','protectedEnvelope']);
    assert.equal(result.rowCount,6);assert.equal(result.countAfterReplay,6);assert.equal(result.countAfterFailures,6);assert.equal(result.countAfterDiskFailure,6);assert.equal(result.finalCount,4);
    assert.equal(result.corruptionError,'ATTACHMENT_INTEGRITY');assert.equal(result.switchedError,'SESSION_CHANGED');assert.equal(result.diskError,'ATTACHMENT_RESTORE_FAILED');assert.equal(result.exportSessionError,'SESSION_CHANGED','account changes abort a pending export');
    assert.deepEqual(requests.filter(url=>url.startsWith('/api/')),[],'offline guest backup files never leave the device');
  }finally{await browser.close();}
});
