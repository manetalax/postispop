const { test } = require('node:test');
const assert = require('node:assert/strict');
test('Every note appears once, across bounded pages on phone and desktop', async () => {
  const model = await import('../board-view-model.js');
  for (const compact of [true, false]) for (const count of [0, 1, 6, 7, 12, 13, 24, 25, 100]) {
    const size = model.boardPageSize(count, compact), notes = Array.from({length:count}, (_,i)=>({id:i}));
    const pages = model.boardPageCount(count,size), seen = [];
    for (let page=0;page<pages;page++) seen.push(...model.boardViewNotes(notes,page,size));
    assert.deepEqual(seen,notes);
    assert.equal(model.nextBoardView(pages-1,count,size),pages-1,'End does not wrap unexpectedly');
    assert.equal(model.clampBoardView(-1,count,size),0);
    assert.equal(model.clampBoardView(1000,count,size),pages-1);
    assert.equal(size,compact||count<=6?6:12);
  }
});
test('Search spans all pages and never exposes protected text',async()=>{
  const {filterBoardNotes}=await import('../board-view-model.js');
  const notes=[{text:'Lista #Viaje',paper:1},{text:'Viaje privado',protectedEnvelope:{},paper:1},{text:'compras',paper:0}];
  assert.deepEqual(filterBoardNotes(notes,{query:'VIAJE'}),[notes[0]]);
  assert.deepEqual(filterBoardNotes(notes,{color:'0'}),[notes[2]]);
  assert.deepEqual(filterBoardNotes(notes,{query:'lista',color:'0'}),[]);
});
