const {test}=require('node:test'),assert=require('node:assert/strict');
test('Only existing groups appear, with twelve-note overview at the end',async()=>{
 const {nextBoardView,boardViewNotes,boardViewLabel}=await import('../board-view-model.js');
 for(const count of [12,13,18,19,24,25,30,31,100]){
  const pages=Math.ceil(count/6),notes=Array.from({length:count},(_,i)=>i+1);let view=1;
  for(let p=1;p<=pages;p++){assert.equal(view,p);assert.deepEqual(boardViewNotes(notes,view),notes.slice((p-1)*6,p*6));view=nextBoardView(view,count);}
  assert.equal(view,0);assert.deepEqual(boardViewNotes(notes,0),notes.slice(0,12));assert.equal(nextBoardView(0,count),1);
 }
 assert.equal(boardViewLabel(2,12),'Ver 12 notas · 1–12');assert.equal(boardViewLabel(2,13),'Ver las 6 siguientes · 13–18 →');assert.equal(boardViewLabel(3,18),'Ver 12 notas · 1–12');assert.equal(boardViewLabel(3,19),'Ver las 6 siguientes · 19–24 →');
});
