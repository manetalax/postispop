const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Execute the real mobile entry module with the native WebMessage boundary
// mocked. Native document-picker behavior still needs a device check.
const source = fs.readFileSync(path.join(__dirname, '../mobile/mobile-entry.js'), 'utf8')
  .replace(/^import '\.\/supabase-bridge\.js';\s*/, '');
function harness(options = {}) {
  const state = {reads:0, fetches:0, messages:[], blob:options.blob || new Blob(['{"notes":[]}'], {type:'application/json'})};
  let nextMessage;
  const previous = () => {};
  const bridge = {onmessage:previous, postMessage(raw) {
    if (options.postFailure) throw Error('bridge detached');
    const message = JSON.parse(raw); state.messages.push(message);
    if (nextMessage) { const resolve=nextMessage; nextMessage=null; resolve(message); }
  }};
  class Reader {
    readAsDataURL(blob) {
      state.reads++;
      queueMicrotask(async () => {
        if (options.readFailure) { this.onerror(); return; }
        this.result = 'data:' + blob.type + ';base64,' + Buffer.from(await blob.arrayBuffer()).toString('base64');
        this.onload();
      });
    }
  }
  const window = {fetch:async () => {
    state.fetches++;
    if (options.fetchFailure) throw Error('blob unavailable');
    return {blob:async()=>state.blob};
  }, ...(options.missingBridge ? {} : {PostisPopFiles:bridge})};
  const context = vm.createContext({window, FileReader:Reader, location:{origin:'https://postispop.com'}, navigator:{}, localStorage:{}});
  vm.runInContext(source, context);
  return {state, bridge, previous,
    save:(name='PostisPop-copia.json', url='blob:https://postispop.com/test')=>window.__postispopSaveDownload(url,name),
    posted:()=>state.messages.length ? Promise.resolve(state.messages.at(-1)) : new Promise(resolve=>{nextMessage=resolve;}),
    reply:(message)=>bridge.onmessage({data:JSON.stringify(message)})
  };
}

test('Android JSON save waits for its matching successful native write', async () => {
  const h=harness(); let settled=false;
  const pending=h.save().then(result=>{settled=true; return result;});
  const request=await h.posted();
  assert.equal(request.filename,'PostisPop-copia.json');
  assert.equal(request.dataUrl,'data:application/json;base64,'+Buffer.from('{"notes":[]}').toString('base64'));
  h.reply({id:'unrelated-request',status:'saved'});
  h.bridge.onmessage({data:'invalid JSON'});
  h.reply({id:request.id,status:'accepted'});
  await Promise.resolve();
  assert.equal(settled,false,'preparing or accepting a file is not a completed save');
  h.reply({id:request.id,status:'saved'});
  assert.equal(await pending,true);
  assert.equal(h.bridge.onmessage,h.previous);
});

test('Android cancellation resolves false and permits a later export', async () => {
  const h=harness();
  const first=h.save(), request=await h.posted();
  h.reply({id:request.id,status:'cancelled'});
  assert.equal(await first,false);
  h.state.messages.length=0;
  const second=h.save('PostisPop-contadores.json'), next=await h.posted();
  assert.notEqual(next.id,request.id);
  assert.equal(next.filename,'PostisPop-contadores.json');
  h.reply({id:next.id,status:'saved'});
  assert.equal(await second,true);
});

test('Android export rejects concurrent saves without replacing their receiver', async () => {
  const h=harness();
  const first=h.save(), request=await h.posted(), receiver=h.bridge.onmessage;
  await assert.rejects(h.save(),{code:'NATIVE_DOWNLOAD_BUSY'});
  assert.equal(h.state.reads,1);
  assert.equal(h.bridge.onmessage,receiver);
  h.reply({id:request.id,status:'saved'});
  assert.equal(await first,true);
});

test('Android fixes export filenames and accepts only PNG or JSON data', async () => {
  for (const [type, supplied, expected] of [
    ['image/png','../../injected.html','PostisPop-pizarra.png'],
    ['application/json','../../injected.html','PostisPop-copia.json']
  ]) {
    const h=harness({blob:new Blob(['content'],{type})});
    const pending=h.save(supplied), request=await h.posted();
    assert.equal(request.filename,expected);
    assert.ok(request.dataUrl.startsWith('data:'+type+';base64,'));
    h.reply({id:request.id,status:'saved'});
    assert.equal(await pending,true);
  }
  const wrongType=harness({blob:new Blob(['<html>'],{type:'text/html'})});
  await assert.rejects(wrongType.save(),{code:'NATIVE_DOWNLOAD_TYPE'});
  assert.equal(wrongType.state.reads,0);
});

test('Android rejects remote and foreign blob URLs before any fetch', async () => {
  for (const url of ['https://postispop.com/file.json','blob:https://foreign.test/file','blob:https://postispop.com.attacker.test/file','data:text/html;base64,PGh0bWw+']) {
    const h=harness();
    await assert.rejects(h.save(undefined,url),{code:'NATIVE_DOWNLOAD_INVALID'});
    assert.equal(h.state.fetches,0);
  }
});

test('Android rejects files above 10 MB before allocating a base64 copy', async () => {
  const h=harness({blob:new Blob([new Uint8Array(10000001)],{type:'application/json'})});
  await assert.rejects(h.save(),error=>error.code==='NATIVE_DOWNLOAD_TOO_LARGE' && error.message.includes('10 MB') && error.message.includes('versión web'));
  assert.equal(h.state.reads,0);
  assert.equal(h.state.messages.length,0);
});

test('Android exact 10 MB file stays within the native envelope and awaits confirmation', async () => {
  const h=harness({blob:new Blob([new Uint8Array(10000000)],{type:'image/png'})});
  const pending=h.save(), request=await h.posted();
  assert.ok(JSON.stringify(request).length<14000000);
  assert.equal(Buffer.from(request.dataUrl.split(',')[1],'base64').length,10000000);
  h.reply({id:request.id,status:'saved'});
  assert.equal(await pending,true);
});

test('Android transport and file-reader failures reject with actionable safe errors', async () => {
  for (const [options, code] of [
    [{missingBridge:true},'NATIVE_DOWNLOAD_UNAVAILABLE'],
    [{fetchFailure:true},'NATIVE_DOWNLOAD_READ_FAILED'],
    [{readFailure:true},'NATIVE_DOWNLOAD_READ_FAILED'],
    [{postFailure:true},'NATIVE_DOWNLOAD_UNAVAILABLE']
  ]) {
    const h=harness(options);
    await assert.rejects(h.save(),{code});
    assert.equal(h.bridge.onmessage,h.previous);
  }
});

test('Android native write, picker and busy failures do not claim a successful download', async () => {
  for (const code of ['NATIVE_DOWNLOAD_WRITE_FAILED','NATIVE_DOWNLOAD_PICKER_UNAVAILABLE','NATIVE_DOWNLOAD_BUSY','NATIVE_DOWNLOAD_TOO_LARGE']) {
    const h=harness(), pending=h.save(), request=await h.posted();
    h.reply({id:request.id,status:'error',error:code});
    await assert.rejects(pending,{code});
    assert.equal(h.bridge.onmessage,h.previous);
  }
  const h=harness(), pending=h.save(), request=await h.posted();
  h.reply({id:request.id,status:'error',error:'untrusted raw error'});
  await assert.rejects(pending,error=>error.code==='NATIVE_DOWNLOAD_WRITE_FAILED' && !error.message.includes('untrusted'));
});
