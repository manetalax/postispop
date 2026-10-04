const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('A stale legacy editor cannot write a plaintext draft for a protected note',()=>{
 const source=fs.readFileSync('_next/static/chunks/Board-BrRAatyY.js','utf8');
 const start=source.indexOf('Ft=e=>{try{'),end=source.indexOf(';async function It',start);
 assert.ok(start>0&&end>start);
 const writes=new Map(),markers=new Map(),context={localStorage:{getItem:k=>markers.get(k),setItem:(k,v)=>writes.set(k,v)},Mt:id=>'draft:'+id,Pt(){},G:{current:{data:{id:'board'}}},z(){},Q:{error(){}},rd:()=>({})};
 vm.createContext(context);vm.runInContext(source.slice(start,end),context);
 context.Ft({id:'note',text:'private value',marks:[],revision:2});assert.match(writes.get('draft:note'),/private value/);writes.clear();
 markers.set('pp:protected-note:note','1');context.Ft({id:'note',text:'private value',marks:[],revision:2});assert.equal(writes.size,0);
});
test('The legacy JSON importer hands the original file to the lossless importer',()=>{
 const source=fs.readFileSync('_next/static/chunks/Board-BrRAatyY.js','utf8'),start=source.indexOf('async function pn(e){if(e){P(``);'),end=source.indexOf('function mn(){if(Ie)',start);
 assert.ok(start>0&&end>start);let dispatched;
 const context={P(){},window:{dispatchEvent:e=>dispatched=e},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}}};vm.createContext(context);vm.runInContext(source.slice(start,end),context);
 const file={name:'encrypted-backup.json',size:3000000};context.pn(file);assert.equal(dispatched.type,'postispop:import-legacy');assert.equal(dispatched.detail.file,file);
});
