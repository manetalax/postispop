// Optional integration test: npm install --prefix /tmp/postispop-pg-test @electric-sql/pglite
// PGLITE_MODULE=/tmp/postispop-pg-test/node_modules/@electric-sql/pglite/dist/index.js node tests/database-integration.mjs
const {PGlite}=await import(process.env.PGLITE_MODULE||'@electric-sql/pglite');
import fs from 'node:fs';
const db=new PGlite();
await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth; create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,created_at timestamptz default now(),last_sign_in_at timestamptz,raw_app_meta_data jsonb default '{}'); create table public.boards(id uuid primary key,owner_id uuid references auth.users,revision int default 1); create table public.notes(id uuid primary key,board_id uuid references boards,author_id uuid references auth.users, position integer default 0,paper integer default 0,locked_until timestamptz,editing text,revision int default 1,text text default '',marks jsonb default '[]',doodle jsonb,image_url text,updated_ms bigint); create table public.store_products(slug text primary key); grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated; grant select on boards,notes to authenticated; grant update on notes to authenticated;alter table boards enable row level security;alter table notes enable row level security;create policy own_boards on boards for select to authenticated using(owner_id=auth.uid());create policy own_notes_read on notes for select to authenticated using(author_id=auth.uid());create policy own_notes_write on notes for update to authenticated using(author_id=auth.uid()) with check(author_id=auth.uid());`);
await db.exec(fs.readFileSync(new URL('../database/commerce.sql',import.meta.url),'utf8'));
const sql=fs.readFileSync(new URL('../database/designs.sql',import.meta.url),'utf8');
await db.exec(sql);await db.exec(sql);console.log('Migration applied twice successfully');
await db.exec(`insert into auth.users(id,email,email_confirmed_at) values ('00000000-0000-0000-0000-000000000001','normal@example.test',now()),('00000000-0000-0000-0000-000000000002','manetala@gmail.com',now()),('00000000-0000-0000-0000-000000000003','legacy@example.test',now());insert into public.store_products values ('postispop-pro');insert into public.store_entitlements(user_id,product_slug,stripe_session_id) values('00000000-0000-0000-0000-000000000003','postispop-pro','cs_test_legacy');insert into public.postispop_designs(id,title,category,tier,pack) values('reward-one','One','travel','reward','travel'),('reward-two','Two','travel','reward','travel'),('paid-one','Paid','travel','premium','travel');`);
const asUser=async(id,sql,params=[])=>{await db.exec(`set role authenticated;select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-${id.padStart(12,'0')}',false)`);try{return await db.query(sql,params);}finally{await db.exec('reset role');}};
const assert=(yes,msg)=>{if(!yes)throw Error(msg);console.log('PASS '+msg)};
let r=await asUser('1',`select postispop_checkin() as s`);assert(r.rows[0].s.streak===1,'first day visit');r=await asUser('1',`select postispop_checkin() as s`);assert(r.rows[0].s.visits===1,'same-day no duplicate visits');
await db.exec(`update postispop_rewards set last_visit=(now() at time zone 'Europe/Madrid')::date-1,streak=4 where user_id='00000000-0000-0000-0000-000000000001'`);
r=await asUser('1',`select postispop_checkin() as s`);assert(r.rows[0].s.credits===1&&r.rows[0].s.streak===0,'fifth consecutive day earns one credit');r=await asUser('1',`select postispop_checkin() as s`);assert(r.rows[0].s.credits===1,'credit not duplicated');
r=await asUser('1',`select postispop_claim_design('reward-one') as s`);assert(r.rows[0].s.credits===0&&r.rows[0].s.unlocked.includes('reward-one'),'claim consumes one credit');r=await asUser('1',`select postispop_claim_design('reward-one') as s`);assert(r.rows[0].s.credits===0,'claim retry idempotent');
for(const query of [`select postispop_claim_design('reward-two')`,`select postispop_claim_design('paid-one')`,`select postispop_owner_dashboard()`,`update postispop_rewards set credits=99`]){let denied=false;try{await asUser('1',query)}catch{denied=true}assert(denied,'denies '+query);}
r=await asUser('3',`select postispop_catalog_status() as s`);assert(r.rows[0].s.premium&&r.rows[0].s.legacy_pro&&r.rows[0].s.unlocked.length===3,'legacy one-time Pro preserves all rights');
await db.exec(`select postispop_private.bind_owner('00000000-0000-0000-0000-000000000002')`);r=await asUser('2',`select postispop_catalog_status() as s`);assert(r.rows[0].s.owner&&r.rows[0].s.premium,'administrator binds verified owner');
await db.exec(`insert into boards(id,owner_id) values('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001');insert into notes(id,board_id,author_id) values('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001')`);
r=await asUser('1',`select postispop_save_note_style('{"note_id":"20000000-0000-0000-0000-000000000001","revision":0,"font":"sans","size":24,"italic":true}') as s`);assert(r.rows[0].s.revision===1,'free text styles permitted with revision');let denied=false;try{await asUser('1',`select postispop_save_note_style('{"note_id":"20000000-0000-0000-0000-000000000001","revision":0,"font":"sans"}')`)}catch{denied=true}assert(denied,'stale style revision rejected');

const protectedSql=fs.readFileSync(new URL('../database/protected-notes.sql',import.meta.url),'utf8');await db.exec(protectedSql);await db.exec(protectedSql);console.log('Protected migration applied twice successfully');
const envelope={v:1,alg:'AES-256-GCM',kdf:'PBKDF2-SHA-256',iterations:600000,salt:'a'.repeat(22),iv:'b'.repeat(16),id:'c'.repeat(22),ciphertext:'d'.repeat(24)};
const protection=`select to_jsonb(postispop_protect_note('20000000-0000-0000-0000-000000000001',1,'${JSON.stringify(envelope)}',1)) as n`;
let staleProtection=false;try{await asUser('1',protection.replace(",1)) as n",",0)) as n"))}catch(error){staleProtection=error.message==='STYLE_CONFLICT'}assert(staleProtection,'stale drawing snapshot blocks protection without loss');
let otherOwner=false;try{await asUser('2',protection)}catch{otherOwner=true}assert(otherOwner,'app owner cannot protect another account note');
r=await asUser('1',protection);assert(r.rows[0].n.text==='Nota protegida'&&r.rows[0].n.protected_envelope.ciphertext===envelope.ciphertext,'protect stores only ciphertext and safe label');
let styleRows=await db.query(`select count(*) as n from postispop_note_style`);assert(+styleRows.rows[0].n===0,'protection erases unciphered style');
for(const query of [`update notes set text='LEAK' where id='20000000-0000-0000-0000-000000000001'`,`update notes set protected_envelope=null where id='20000000-0000-0000-0000-000000000001'`,`select postispop_save_note_style('{"note_id":"20000000-0000-0000-0000-000000000001","revision":0}')`]){let rejected=false;try{await asUser('1',query)}catch{rejected=true}assert(rejected,'protected legacy write blocked: '+query);}
r=await asUser('1',`select postispop_create_protected_share('20000000-0000-0000-0000-000000000001',7) as s`);const share=r.rows[0].s;assert(share.token.length===64&&!share.token.includes(envelope.ciphertext),'random share token excludes password and ciphertext');
await db.exec('set role anon');r=await db.query(`select postispop_read_protected_share('${share.token}') as s`);await db.exec('reset role');assert(r.rows[0].s.envelope.ciphertext===envelope.ciphertext,'anonymous share reads ciphertext only');await asUser('1',`select postispop_revoke_protected_share('${share.id}')`);let revoked=false;try{await db.query(`select postispop_read_protected_share('${share.token}')`)}catch{revoked=true}assert(revoked,'revocation prevents later server reads');
await db.exec(fs.readFileSync(new URL('../database/design-catalog-seed.sql',import.meta.url),'utf8'));await db.exec(fs.readFileSync(new URL('../database/design-catalog-seed.sql',import.meta.url),'utf8'));r=await db.query(`select count(*) as n from postispop_designs where id not in('reward-one','reward-two','paid-one')`);assert(+r.rows[0].n===298,'catalog seed idempotent with 298 real IDs');
await db.exec(`update postispop_designs set default_paper='papyrus' where id='reward-one'`);await asUser('1',`select postispop_select_design('reward-one')`);r=await asUser('1',`select postispop_can_paper('papyrus') as papyrus,postispop_can_paper('washi') as washi`);assert(r.rows[0].papyrus&&!r.rows[0].washi,'selected unlocked theme grants its own material only');
r=await asUser('2',`select postispop_access() as s`);assert(r.rows[0].s.owner&&r.rows[0].s.clock_active&&r.rows[0].s.products.length===0,'owner gets free clock without fabricated purchases');
r=await asUser('2',`select count(*) as n from notes`);assert(+r.rows[0].n===0,'owner dashboard privilege never grants raw note contents');
await db.exec(sql);await db.exec(protectedSql);console.log('Both migrations can reapply together after encrypted records exist');
const importSql=fs.readFileSync(new URL('../database/board-import.sql',import.meta.url),'utf8');
await db.exec(importSql);await db.exec(importSql);console.log('Import migration applied twice successfully');
const userId=n=>'00000000-0000-0000-0000-'+String(n).padStart(12,'0');
const boardId=n=>'30000000-0000-0000-0000-'+String(n).padStart(12,'0');
const slotId=(board,slot)=>'40000000-0000-0000-'+String(board).padStart(4,'0')+'-'+String(slot).padStart(12,'0');
const requestId=n=>'50000000-0000-0000-0000-'+String(n).padStart(12,'0');
async function seedBoard(board,user,count=12){
 await db.query('insert into boards(id,owner_id) values($1,$2)',[boardId(board),userId(user)]);
 for(let i=0;i<count;i++)await db.query('insert into notes(id,board_id,author_id,position) values($1,$2,$3,$4)',[slotId(board,i),boardId(board),userId(user),i]);
}
const importNotes=(user,board,request,notes,excluded=[])=>asUser(String(user),'select postispop_import_board($1,$2,$3::jsonb,$4::uuid[]) as s',[boardId(board),requestId(request),JSON.stringify(notes),excluded]);
async function rejectedImport(user,board,request,notes,message,label,excluded=[]){
 let error;try{await importNotes(user,board,request,notes,excluded)}catch(e){error=e}
 assert(error?.message===message,label+' ('+(error?.message||'unexpected success')+')');
}
await seedBoard(1,1);
await db.query('update notes set text=$2 where id=$1',[slotId(1,0),'Conservar']);
await db.query('update notes set image_url=$2 where id=$1',[slotId(1,1),'https://example.test/capture.png']);
await db.query('update notes set doodle=$2 where id=$1',[slotId(1,2),JSON.stringify('heart')]);
const drawing={version:1,selectedInstrument:'ballpoint',strokes:[{instrument:'ballpoint',color:'#163b62',width:2,points:[{x:0.5,y:0.5,p:0.5}]}]};
await db.query('insert into postispop_note_style(user_id,note_id,drawing) values($1,$2,$3::jsonb)',[userId(1),slotId(1,3),JSON.stringify(drawing)]);
await db.query('update notes set marks=$2::jsonb where id=$1',[slotId(1,4),JSON.stringify([{start:0,end:0,ink:'blue'}])]);
await asUser('1','select postispop_protect_note($1,1,$2::jsonb,0)',[slotId(1,5),JSON.stringify(envelope)]);
await db.query('insert into postispop_note_style(user_id,note_id,size,revision) values($1,$2,18,4)',[userId(1),slotId(1,7)]);
r=await importNotes(1,1,1,[{text:'Nueva 😀',paper:5,marks:[{start:6,end:8,ink:'blue'}],style:{size:22}}],[slotId(1,6)]);
assert(r.rows[0].s.imported===1&&r.rows[0].s.noteIds[0]===slotId(1,7),'import uses one available unreserved slot and preserves UTF-16 mark offsets');
const successful=r.rows[0].s;
r=await db.query('select text,revision from notes where id=$1',[slotId(1,0)]);assert(r.rows[0].text==='Conservar'&&r.rows[0].revision===1,'occupied text remains untouched');
r=await db.query('select size from postispop_note_style where note_id=$1',[slotId(1,7)]);assert(r.rows[0].size===22,'import writes allowed free styling atomically');
let staleImportStyle=false;try{await asUser('1','select postispop_save_note_style($1::jsonb)',[JSON.stringify({note_id:slotId(1,7),revision:4,size:18})])}catch(e){staleImportStyle=e.message==='CONFLICT'}assert(staleImportStyle,'import advances existing style version and rejects stale editor');
r=await importNotes(1,1,1,[{text:'Nueva 😀',paper:5,marks:[{start:6,end:8,ink:'blue'}],style:{size:22}}]);
assert(r.rows[0].s.replayed&&r.rows[0].s.noteIds[0]===successful.noteIds[0],'lost response retry reuses original receipt regardless of changed exclusions');
await rejectedImport(1,1,1,[{text:'Distinta'}],'IDEMPOTENCY_CONFLICT','request ID cannot be reused for another payload');
await rejectedImport(1,1,2,[{text:'Octava'}],'BOARD_FULL','free account cannot import its eighth occupied note');
await rejectedImport(2,1,3,[{text:'Ajena'}],'OWNER_REQUIRED','app administrator cannot import to another user board');
await rejectedImport(3,999,3,[{text:'Ajena'}],'OWNER_REQUIRED','missing and foreign boards disclose no contents');
await seedBoard(2,1);
for(const [notes,message,label] of [
 [[{text:'Primera válida'},{text:'Incorrecta',paper:6}],'INVALID_BACKUP','invalid later row rolls back the entire batch'],
 [[{text:'No cambiar autor',author_id:userId(2)}],'INVALID_BACKUP','backup cannot forge an author'],
 [[{text:'Texto',marks:[{start:0,end:99,ink:'blue'}]}],'INVALID_BACKUP','out-of-range marks rejected'],
 [[{text:'😀',marks:[{start:0,end:3,ink:'blue'}]}],'INVALID_BACKUP','UTF-16 marks still enforce upper bound'],
 [[{text:'x'.repeat(10001)}],'INVALID_BACKUP','oversized text rejected'],
 [[{text:'Texto',image:{url:'javascript:alert(1)'}}],'INVALID_BACKUP','unsafe image URLs rejected'],
 [[{text:'Texto',doodle:'<svg onload=alert(1)>'}],'INVALID_BACKUP','unrecognized doodles rejected'],
 [[{text:'Texto',style:{font:'hand'}}],'STYLE_LOCKED','backup cannot grant paid font'],
 [[{text:'Texto',style:{paper:'washi'}}],'STYLE_LOCKED','backup cannot grant paid material'],
 [[{text:'Texto',style:{drawing:{...drawing,selectedInstrument:'marker'}}}],'INVALID_STYLE','backup cannot grant paid pen'],
 [[{text:'Filtración',protectedEnvelope:envelope}],'PROTECTED_NOTE_REQUIRES_ENCRYPTION','ciphertext cannot accompany plaintext'],
 [[{protectedEnvelope:{...envelope,alg:'fake'}}],'INVALID_ENVELOPE','malformed ciphertext rejected'],
 [[null],'INVALID_BACKUP','null note rejected'],
 [[{text:'Texto',marks:null}],'INVALID_BACKUP','null marks rejected'],
 [[{text:'Texto',style:{size:20.5}}],'INVALID_STYLE','fractional style size rejected instead of silent coercion'],
 [Array.from({length:101},()=>({text:''})),'INVALID_BACKUP','oversized note batch rejected']
])await rejectedImport(1,2,10,notes,message,label);
r=await db.query('select count(*) as n from notes where board_id=$1 and text<>$2',[boardId(2),'']);assert(+r.rows[0].n===0,'all validation failures leave the destination empty');
r=await db.query('select count(*) as n from postispop_private.board_import_requests where board_id=$1',[boardId(2)]);assert(+r.rows[0].n===0,'failed import never commits an idempotency receipt');
await db.query('update notes set locked_until=now()+interval \'5 minutes\' where board_id=$1',[boardId(2)]);
await rejectedImport(1,2,11,[{text:'No robar lock'}],'BOARD_FULL','active edit locks reserve empty slots');
await db.query('update notes set locked_until=null where board_id=$1',[boardId(2)]);
r=await importNotes(1,2,12,[{text:''},{protectedEnvelope:envelope,paper:2}]);assert(r.rows[0].s.imported===1,'blank placeholders are skipped and protected note imports intact');
r=await db.query('select * from notes where id=$1',[slotId(2,0)]);assert(r.rows[0].text==='Nota protegida'&&r.rows[0].protected_envelope.ciphertext===envelope.ciphertext&&r.rows[0].doodle===null&&r.rows[0].image_url===null,'protected import persists ciphertext and safe metadata only');
r=await importNotes(1,2,13,[{text:'Solo dibujo',style:{drawing}}]);assert(r.rows[0].s.imported===1,'free drawing is preserved');
await seedBoard(3,3,101);
r=await importNotes(3,3,20,Array.from({length:100},(_,i)=>({text:'Premium '+i})));assert(r.rows[0].s.imported===100,'legacy Pro grants exactly 100 occupied slots through server entitlement');
await rejectedImport(3,3,21,[{text:'101'}],'BOARD_FULL','Premium import cannot exceed 100 occupied slots');
await seedBoard(4,2,1);
r=await importNotes(2,4,22,[{text:'Owner',style:{font:'hand',paper:'washi'}}]);assert(r.rows[0].s.imported===1,'verified app owner receives existing Premium tooling rights');
await rejectedImport(2,4,23,[{text:'Sin sitio'}],'BOARD_FULL','Premium does not create new rows beyond existing slots');
await db.exec(`insert into postispop_licenses(user_id,subject,expires_at,payment_reference) values('${userId(1)}','premium',now()-interval '1 day','test-expired')`);
await seedBoard(5,1);
await rejectedImport(1,5,24,Array.from({length:8},()=>({text:'Expired'})),'BOARD_FULL','expired license never raises the seven-note cap');
await db.exec(`update postispop_licenses set expires_at=now()+interval '1 day',revoked_at=now() where user_id='${userId(1)}'`);
await rejectedImport(1,5,25,Array.from({length:8},()=>({text:'Revoked'})),'BOARD_FULL','revoked license never raises the seven-note cap');
await db.exec(`update postispop_licenses set revoked_at=null where user_id='${userId(1)}'`);
r=await importNotes(1,5,26,Array.from({length:8},()=>({text:'Current Premium'})));assert(r.rows[0].s.imported===8,'current server Premium license raises the cap');
await db.exec(importSql);
r=await importNotes(3,3,20,Array.from({length:100},(_,i)=>({text:'Premium '+i})));assert(r.rows[0].s.replayed,'migration reapply preserves completed import receipts');
let receiptDenied=false;try{await asUser('1','select * from postispop_private.board_import_requests')}catch{receiptDenied=true}assert(receiptDenied,'private idempotency receipts are inaccessible via user SQL');
await db.exec(`select set_config('request.jwt.claim.sub','',false);set role authenticated`);let anonymousDenied=false;try{await db.query('select postispop_import_board($1,$2,$3)',[boardId(2),requestId(99),'[]'])}catch(e){anonymousDenied=e.message==='SESSION_REQUIRED'}finally{await db.exec('reset role')};assert(anonymousDenied,'RPC fails closed without an authenticated subject');
await db.exec('set role anon');let anonExecuteDenied=false;try{await db.query('select postispop_import_board($1,$2,$3)',[boardId(2),requestId(99),'[]'])}catch(e){anonExecuteDenied=e.code==='42501'}finally{await db.exec('reset role')};assert(anonExecuteDenied,'anonymous role cannot execute import RPC');
await db.close();
