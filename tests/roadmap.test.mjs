import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cleanNote,createBackup,parseBackup,templateNotes,TEMPLATES,calendarFile,filterNotes} from '../app/board-core.js';
import {entitlements} from '../app/plans.js';
test('Backups preserve supported data and exclude accounts or sessions',()=>{
 const n={id:'n1',text:'Una idea <script>',paper:5,marks:[{start:0,end:3,ink:'blue'}],doodle:'M1 2',metadata:{tags:['idea'],pinned:true},author:'private',access_token:'secret'};
 const b=createBackup({title:'Mi día',notes:[n],order:['n1'],members:['private']});
 const copy=parseBackup(JSON.stringify(b));assert.equal(copy.notes[0].text,n.text);assert.equal(copy.notes[0].paper,5);assert.equal(copy.notes[0].metadata.pinned,true);assert.ok(!JSON.stringify(b).includes('secret'));assert.ok(!JSON.stringify(b).includes('private'));
 assert.throws(()=>parseBackup('{"notes":[]}'));assert.throws(()=>cleanNote({text:'x'.repeat(10001)}));assert.throws(()=>cleanNote({text:'x',paper:6}));assert.throws(()=>cleanNote({text:'x',marks:[{start:-1,end:1,ink:'red'}]}));
 assert.equal(cleanNote({text:'x',image:{url:'javascript:alert(1)'}}).image,null);
});
test('All eight templates and combined filters are functional',()=>{
 assert.equal(TEMPLATES.length,8);for(const t of TEMPLATES)assert.ok(templateNotes(t.id).notes.length<=12);
 const notes=[cleanNote({text:'Estudio',paper:1,metadata:{tags:['hoy'],pinned:true}}),cleanNote({text:'Estudio',paper:1,metadata:{tags:['hoy'],archived:true}})];
 assert.equal(filterNotes(notes,{query:'ESTUDIO',paper:'1',tag:'hoy'}).length,1);assert.equal(filterNotes(notes,{archived:true}).length,1);
});
test('Calendar exports absolute UTC instants and escapes user text',()=>{
 const text=calendarFile('Reunión, equipo\nPlan; revisión','2026-10-02T10:30:00+02:00');assert.match(text,/DTSTART:20261002T083000Z/);assert.match(text,/SUMMARY:Reunión\\, equipo\\nPlan\\; revisión/);assert.throws(()=>calendarFile('x','invalid'));
});
test('Paid features derive from server purchases or unexpired server trial',()=>{
 assert.equal(entitlements(null).clock,false);assert.equal(entitlements({products:['postispop-pro']}).rebel,true);assert.equal(entitlements({clock_active:true,trial_expires_at:'2000-01-01'}).clock,false);assert.equal(entitlements({subscription:{status:'canceled',current_period_end:'2099-01-01'}}).subscription,false);
});
