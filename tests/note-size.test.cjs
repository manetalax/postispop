const {test}=require('node:test');
const assert=require('node:assert/strict');
test('Total note budget adds all files, UTF-8 text and drawings without double-counting base64',async()=>{
 const {noteSize,assertNoteSize}=await import('../note-size.js');
 const note={text:'á',style:{drawing:{strokes:[]}},attachments:[{size:6000000,data:'base64 transport'},{size:4000000}]};
 assert.ok(noteSize(note)>10000000);assert.throws(()=>assertNoteSize(note),/NOTE_TOO_LARGE/);
 assert.doesNotThrow(()=>assertNoteSize({...note,attachments:[{size:9999000}]}));
 assert.equal(noteSize({text:'á'})-noteSize({text:'a'}),1);
 assert.equal(noteSize({attachments:[{size:4,data:'aaaa'}]}),noteSize({attachments:[{size:4,data:'aaaaaaaaaaaaaaaa'}]}));
});
test('Oversized notes are always rejected and earlier shared links remain readable',async()=>{
 const {assertNoteSize,noteSize}=await import('../note-size.js');
 const {validateSharedNote,sealSharedNote}=await import('../note-share-package.js');
 const note={text:'ok',attachments:[{kind:'file',name:'x.bin',type:'application/octet-stream',size:10000001,data:'A'.repeat(Math.ceil(10000001*4/3)),sha256:'a'.repeat(64)}]};
 assert.throws(()=>assertNoteSize(note,{previousBytes:noteSize(note)}),/NOTE_TOO_LARGE/);
 assert.throws(()=>assertNoteSize({...note,text:'larger'},{previousBytes:noteSize(note)}),/NOTE_TOO_LARGE/);
 assert.doesNotThrow(()=>validateSharedNote({format:'postispop',version:2,notes:[note]}));
 await assert.rejects(()=>sealSharedNote({format:'postispop',version:2,notes:[note]}),/NOTE_TOO_LARGE/);
});
