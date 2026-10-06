import { readGuest, guestRequest, guestImportSlots } from './guest-board.js';
import { createOfflineStore, sameMutation } from './offline-sync.js';
import { getOfflineRights, saveOfflineReceipt } from './offline-license.js';
import { installOfflineUI } from './offline-ui.js';
import { normalizeBackup, importTicket, withImportSlots, backupNotesForServer, verifyBackupAttachments, restoreBackupAttachments, createBoardBackup, LOCAL_BACKUP_BYTES, CLOUD_BACKUP_BYTES } from './backup-import.js';
const SUPABASE_URL = "https://htfyjefmviwlgmfqrwue.supabase.co";
const SUPABASE_KEY = "sb_publishable_ox1LUYhmz57iSU7mPtGStg_-FZl-zQT";
const originalFetch = window.fetch.bind(window);
const sessionKey = "postispop-supabase-session";
const offline = createOfflineStore(localStorage);
const online = () => typeof navigator === "undefined" || navigator.onLine !== false;
// One Premium offer, three billing choices. Checkout stays disconnected.
const premiumProducts = () => [
  {slug:'premium-monthly',title:'Premium mensual',description:'2,95 € al mes · Próximamente',price_cents:295,currency:'eur',stripe_payment_link:null},
  {slug:'premium-yearly',title:'Premium anual',description:'9,95 € al año · Próximamente',price_cents:995,currency:'eur',stripe_payment_link:null},
  {slug:'premium-lifetime',title:'Premium de por vida',description:'59,95 € · Un único pago · Próximamente',price_cents:5995,currency:'eur',stripe_payment_link:null}
];

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json" }
});

const actorFor = (user) => user ? {
  id: user.id,
  name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "PostisPop",
  email: user.email || "",
  registered: true
} : { id: "guest", name: "", email: "", registered: false };

const session = () => {
  try { return JSON.parse(localStorage.getItem(sessionKey) || "null"); } catch { return null; }
};

const headers = () => {
  const token = session()?.access_token;
  return {
    apikey: SUPABASE_KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json"
  };
};

const rawRest = async (table, query = "", options = {}) => {
  const { metadata = false, ...requestOptions } = options;
  const response = await originalFetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    ...requestOptions,
    headers: { ...headers(), ...(options.headers || {}) }
  });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!response.ok) throw Object.assign(new Error(body?.message || "SUPABASE_ERROR"), { status: body?.code === "40001" || body?.message === "CONFLICT" ? 409 : response.status, body });
  return metadata ? { data:body, contentRange:response.headers.get('Content-Range') } : body;
};

// PostgREST may cap a response below our requested limit. Only its exact
// Content-Range can prove that every authorized style has been collected.
async function readStyleRows(rest,noteId) {
  const styles=[],ids=new Set();let offset=0,total=null,previousId='';
  do {
    const result=await rest('postispop_note_style','?select=*&order=note_id.asc'+(noteId?'&note_id=eq.'+encodeURIComponent(noteId):'')+'&offset='+offset+'&limit=100',{headers:{Prefer:'count=exact'},metadata:true});
    const rows=result.data,range=/^(?:(\d+)-(\d+)|\*)\/(\d+)$/.exec(result.contentRange||'');
    if(!Array.isArray(rows)||!range)throw new Error('STYLES_INCOMPLETE');
    const count=Number(range[3]);
    if(!Number.isSafeInteger(count)||(total!==null&&total!==count))throw new Error('STYLES_INCOMPLETE');
    total=count;
    if(total===0){if(offset!==0||rows.length||range[1]!==undefined)throw new Error('STYLES_INCOMPLETE');return [];}
    const first=Number(range[1]),last=Number(range[2]);
    if(!Number.isSafeInteger(first)||!Number.isSafeInteger(last)||first!==offset||last<first||last>=total||rows.length!==last-first+1)throw new Error('STYLES_INCOMPLETE');
    for(const row of rows){
      if(!row||typeof row.note_id!=='string'||!row.note_id||ids.has(row.note_id)||(previousId&&row.note_id<=previousId)||(noteId&&row.note_id!==noteId))throw new Error('STYLES_INCOMPLETE');
      ids.add(row.note_id);previousId=row.note_id;styles.push(row);
    }
    offset=last+1;
  } while(offset<total);
  if(styles.length!==total)throw new Error('STYLES_INCOMPLETE');
  return styles;
}

const mapNote = (n) => n.protected_envelope ? ({id:n.id,paper:n.paper??0,text:"Nota protegida",marks:[],doodle:"",image:null,author:n.author_id||"",revision:n.revision||1,created:n.created_ms||Date.parse(n.created_at),updated:n.updated_ms||Date.parse(n.updated_at),lockedUntil:0,editing:"",protectedEnvelope:n.protected_envelope}) : ({
  id: n.id, doodle: n.doodle || "", paper: n.paper ?? 0, text: n.text || "",
  marks: n.marks || [], author: n.author_id || "", revision: n.revision || 1,
  created: n.created_ms || Date.parse(n.created_at), image: n.image_url ? { url: n.image_url } : null,
  updated: n.updated_ms || Date.parse(n.updated_at), lockedUntil: n.locked_until ? Date.parse(n.locked_until) : 0,
  editing: n.editing || ""
});

const mapBoard = (b, notes, members = []) => ({
  id: b.id, title: b.title || "", revision: b.revision || 1,
  order: notes.map(n => n.id), expires: b.expires_at ? Date.parse(b.expires_at) : null,
  role: b.owner_id === session()?.user?.id ? "owner" : "member", owner: b.owner_id,
  notes: notes.map(mapNote), members
});

async function createBoard(user, rest, startedAt) {
  // The server owns the account, allowance and initial six/twelve notes. One
  // transaction prevents an empty board if any seed insert fails. Retain the
  // ticket on a lost response so Premium retries do not create duplicates.
  const ticket=await importTicket(localStorage,user.id,'new-board',[],startedAt);
  try {
    const board=await rest('rpc/postispop_create_board','',{method:'POST',body:JSON.stringify({p_request_id:ticket.requestId})});
    ticket.finish();return board;
  } catch(error) {
    if(error.body?.code==='PGRST202'||error.body?.code==='42883')throw Object.assign(new Error('CREATE_BOARD_UNAVAILABLE'),{status:503});
    if(error.message==='BOARD_LIMIT_REACHED')error.status=409;
    throw error;
  }
}

let userCache = null, refreshPromise = null, sessionGeneration = 0;
async function currentUser() {
  const generation = sessionGeneration;
  let saved = session();
  if (!saved?.access_token) { userCache=null; return null; }
  if (saved.expires_at && saved.expires_at * 1000 < Date.now() + 60000 && saved.refresh_token) {
    if (!refreshPromise) refreshPromise=(async()=>{
      const response=await originalFetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:saved.refresh_token})});
      const data=await response.json();
      // A late refresh must not restore credentials after logout or replace a newer session.
      if(generation!==sessionGeneration || session()?.access_token!==saved.access_token) return;
      if(!response.ok) { if(response.status===400||response.status===401) localStorage.removeItem(sessionKey); throw Object.assign(new Error('SESSION_REQUIRED'),{status:response.status}); }
      localStorage.setItem(sessionKey,JSON.stringify(data)); userCache=null;
    })().finally(()=>{refreshPromise=null;});
    await refreshPromise; saved=session();
  }
  if(generation!==sessionGeneration || !saved?.access_token) return null;
  if(userCache?.token===saved.access_token && userCache.until>Date.now()) return userCache.user;
  const response=await originalFetch(`${SUPABASE_URL}/auth/v1/user`,{headers:headers()});
  if(generation!==sessionGeneration || session()?.access_token!==saved.access_token) return null;
  if(!response.ok) { if(response.status===401) {localStorage.removeItem(sessionKey);return null;} throw new Error('AUTH_UNAVAILABLE'); }
  const user=await response.json();
  if(generation!==sessionGeneration || session()?.access_token!==saved.access_token) return null;
  userCache={token:saved.access_token,user,until:Date.now()+30000};offline.rememberIdentity(user);return user;
}

async function api(endpoint, init) {
  const requestStartedAt=Date.now();
  const authGeneration=sessionGeneration;
  const requestUserId=session()?.user?.id;
  const validateSession=()=>{if(authGeneration!==sessionGeneration||session()?.user?.id!==requestUserId)throw Object.assign(new Error('SESSION_CHANGED'),{status:401});};
  const rest=async(table,query='',options={})=>{
    validateSession();
    const result=await rawRest(table,query,options);
    validateSession();
    return result;
  };
  const method = init?.method || "GET";
  const payload = init?.body ? JSON.parse(init.body) : undefined;
  if(endpoint==='board/guest-board/export'&&method==='GET'){
    const backup=await createBoardBackup(readGuest());validateSession();return json(backup);
  }
  if(endpoint==='board/guest-board/import'&&method==='POST'){
    const backup=normalizeBackup(payload,{maxNotes:6,maxBytes:LOCAL_BACKUP_BYTES});
    const ticket=await importTicket(localStorage,'guest','guest-board',backup.notes,requestStartedAt);
    const lockedIds=readGuest().notes.map(note=>note.id);
    return withImportSlots(lockedIds,async excluded=>{
      validateSession();
      const board=readGuest();
      // A response can be lost after localStorage committed. Do not import a
      // second copy when two tabs share the same pending request ticket.
      if(board.importRequests?.[ticket.requestId]){ticket.finish();return json(board);}
      const unavailable=[...new Set([...excluded,...board.notes.filter(note=>!lockedIds.includes(note.id)).map(note=>note.id)])];
      const slots=guestImportSlots(board,unavailable);
      if(backup.notes.length>slots.length||board.notes.length-slots.length+backup.notes.length>6)throw Object.assign(new Error('BOARD_FULL'),{status:409});
      const noteIds=slots.slice(0,backup.notes.length).map(note=>note.id);
      const validate=()=>{
        validateSession();const current=readGuest();
        if(current.revision!==board.revision||noteIds.some(id=>!guestImportSlots(current,unavailable).some(note=>note.id===id)))throw Object.assign(new Error('CONFLICT'),{status:409});
      };
      let restored;
      try{
        restored=await restoreBackupAttachments(backup.notes,noteIds,{requestId:ticket.requestId,validate});
        validate();
        const saved=guestRequest(endpoint,method,{...backup,notes:backupNotesForServer(backup.notes)},{expectedRevision:board.revision,noteIds,excluded:unavailable,requestId:ticket.requestId});
        ticket.finish();return json(saved);
      }catch(error){await restored?.rollback();throw error;}
    });
  }
  const local=guestRequest(endpoint,method,payload);
  if(local) return json(local);

  const publicShare=endpoint.match(/^protected-shares\/([a-f0-9]{64})$/);
  if(publicShare&&method==='GET')return json(await rest('rpc/postispop_read_protected_share','',{method:'POST',body:JSON.stringify({p_token:publicShare[1]})}));

  if(endpoint.startsWith('designs/') || endpoint==='owner/dashboard' || endpoint==='owner/metrics') {
    const user=await currentUser();
    if(!user) return json({error:'SESSION_REQUIRED'},401);
    const rpc={ 'designs/status':'postispop_catalog_status','designs/checkin':'postispop_checkin',
      'designs/claim':'postispop_claim_design','designs/select':'postispop_select_design',
      'owner/dashboard':'postispop_owner_dashboard','owner/metrics':'postispop_owner_metrics' }[endpoint];
    if(rpc) {const status=await rest('rpc/'+rpc,'',{method:'POST',body:JSON.stringify(payload||{})});
      if(endpoint==='designs/status'&&online()) {try {const response=await originalFetch(SUPABASE_URL+'/functions/v1/postispop-offline-license',{method:'POST',headers:headers(),body:'{}'});if(response.ok){const receipt=await response.json();await saveOfflineReceipt(user.id,receipt.token);}}catch{/* Offline Premium remains disabled until a valid signed receipt exists. */}}
      return json(status);}
    if(endpoint==='designs/styles') {
      if(method==='GET') {
        const noteId=new URLSearchParams(init?.search||'').get('note_id');
        if(!noteId)offline.remember(user.id,'designs/styles-complete',{complete:false,version:2});
        const styles=await readStyleRows(rest,noteId);
        return json({styles,...(noteId?{style:styles[0]||null}:{stylesComplete:true})});
      }
      const allowed=['note_id','font','size','italic','underline','ink','paper','drawing','revision'];
      const data=Object.fromEntries(allowed.filter(k=>payload?.[k]!==undefined).map(k=>[k,payload[k]]));
      const row=await rest('rpc/postispop_save_note_style','',{method:'POST',body:JSON.stringify({p_style:data})});
      return json({style:row});
    }
    return json({error:'NOT_FOUND'},404);
  }

  if(endpoint.startsWith('commerce/')) {
    const user=await currentUser();
    if(!user&&endpoint!=='commerce/catalog') return json({error:'SESSION_REQUIRED'},401);
    if(endpoint==='commerce/status') return json(await rest('rpc/postispop_access','',{method:'POST',body:'{}'}));
    if(endpoint==='commerce/catalog') return json({products:premiumProducts(),checkoutReady:false});
    if(endpoint==='commerce/alarms') {
      if(method==='GET') return json({alarms:await rest('note_alarms','?select=*&order=due_at.asc')});
      if(payload.action==='delete') {await rest('note_alarms',`?id=eq.${encodeURIComponent(payload.id)}&user_id=eq.${user.id}`,{method:'DELETE'});return json({ok:true});}
      if(payload.action==='ack') {const rows=await rest('note_alarms',`?id=eq.${encodeURIComponent(payload.id)}&user_id=eq.${user.id}&delivered_at=is.null`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({delivered_at:new Date().toISOString()})});return json({claimed:rows.length>0});}
      const rows=await rest('note_alarms','',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({user_id:user.id,note_id:payload.note_id,label:String(payload.label||'Recordatorio').slice(0,200),due_at:payload.due_at})});return json({alarm:rows[0]});
    }
    if(endpoint!=='commerce/reconcile')return json({error:'COMING_SOON',checkoutReady:false},503);
    return originalFetch(`${SUPABASE_URL}/functions/v1/postispop-commerce/${endpoint.slice(9)}`,{method,headers:headers(),body:method==='GET'?undefined:JSON.stringify(payload)});
  }

  if (endpoint === "config") return json({ features: { notes: 6, textLimit: 10000, guestDays: 90, trashDays: 30, lockSeconds: 45, payments: false, clock: false, games: false, awards: false, phoneRequired: false, captures: true }, authReady: true, currency: "EUR" });

  if (endpoint === "auth/login" && method === "POST") {
    const response = await originalFetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email: payload.email, password: payload.password }) });
    const data = await response.json();
    if (!response.ok) return json({ error: data.error_description || data.msg || "AUTH_FAILED" }, response.status);
    if(authGeneration!==sessionGeneration)return json({error:'SESSION_CHANGED'},401);
    sessionGeneration++;localStorage.setItem(sessionKey, JSON.stringify(data));offline.rememberIdentity(data.user);announce('postispop:session-change',{userId:data.user.id});
    return json({ actor: actorFor(data.user) });
  }

  if (endpoint === "auth/signup" && method === "POST") {
    const response = await originalFetch(`${SUPABASE_URL}/auth/v1/signup`, { method: "POST", headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email: payload.email, password: payload.password }) });
    const data = await response.json();
    if (!response.ok) return json({ error: data.msg || data.message || "AUTH_FAILED" }, response.status);
    if (data.access_token) { if(authGeneration!==sessionGeneration)return json({error:'SESSION_CHANGED'},401);
    sessionGeneration++;localStorage.setItem(sessionKey, JSON.stringify(data));offline.rememberIdentity(data.user);announce('postispop:session-change',{userId:data.user.id}); }
    return json({ confirmation: !data.access_token, actor: actorFor(data.user) });
  }

  if (endpoint === "auth/oauth" && method === "POST") {
    const provider = payload?.provider;
    if (provider !== "google") return json({ error: "PROVIDER_UNAVAILABLE" }, 400);
    const params = new URLSearchParams({
      provider,
      redirect_to: `${location.origin}/`,
      code_challenge: payload.challenge || "",
      code_challenge_method: "S256"
    });
    return json({ url: `${SUPABASE_URL}/auth/v1/authorize?${params.toString()}` });
  }

  if (endpoint === "auth/exchange" && method === "POST") {
    const response = await originalFetch(`${SUPABASE_URL}/auth/v1/token?grant_type=pkce`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ auth_code: payload.code, code_verifier: payload.verifier })
    });
    const data = await response.json();
    if (!response.ok) return json({ error: data.error_description || data.msg || "AUTH_FAILED" }, response.status);
    if(authGeneration!==sessionGeneration)return json({error:'SESSION_CHANGED'},401);
    sessionGeneration++;localStorage.setItem(sessionKey, JSON.stringify(data));offline.rememberIdentity(data.user);announce('postispop:session-change',{userId:data.user.id});
    return json({ actor: actorFor(data.user) });
  }

  if (endpoint === "auth/logout") {
    const token = session()?.access_token;
    // Local logout must succeed even offline; invalidate pending auth responses first.
    sessionGeneration++; userCache = null;
    localStorage.removeItem(sessionKey);announce('postispop:session-change',{userId:null});
    if (!token) return json({ ok: true, serverRevoked: null });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    let serverRevoked = false;
    try {
      const response = await originalFetch(`${SUPABASE_URL}/auth/v1/logout?scope=local`, {
        method: "POST", signal: controller.signal,
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` }
      });
      serverRevoked = response.ok;
    } catch { /* Local credentials stay removed when revocation cannot be confirmed. */ }
    finally { clearTimeout(timeout); }
    return json({ ok: true, serverRevoked, ...(serverRevoked ? {} : { warning: "REMOTE_LOGOUT_UNCONFIRMED" }) });
  }
  if (endpoint === "auth/settings") return json({ google: true, email: true });
  if (endpoint === "store/products" && method === "GET") return json({products:premiumProducts(),checkoutReady:false});
  if (endpoint === "session" && method === "GET") return json({ actor: actorFor(await currentUser()) });

  const user = await currentUser();
  if (endpoint === "me" && method === "GET") {
    if (!user) return json({ actor: actorFor(null), boards: [{ id: "guest-board", title: "Mi pizarra", owner: "guest", expires: null, role: "owner" }] });
    let boards = await rest("boards", "?select=*&order=created_at.asc");
    if (!boards.length) boards = [await createBoard(user,rest,requestStartedAt)];
    return json({ actor: actorFor(user), boards: boards.map(b => ({ id: b.id, title: b.title || "", owner: b.owner_id, expires: b.expires_at, role: b.owner_id===user.id?"owner":"member" })) });
  }
  if (!user && endpoint === "boards" && method === "POST") return json(readGuest());
  if (!user) return json({ error: "SESSION_REQUIRED" }, 401);

  if(init?.accountId && init.accountId!==user.id)return json({error:'SESSION_CHANGED'},401);
  if(endpoint==='roulette/status'&&method==='GET')return json(await rest('rpc/postispop_saturday_status','',{method:'POST',body:'{}'}));
  if(endpoint==='roulette/spin'&&method==='POST')return json(await rest('rpc/postispop_saturday_spin','',{method:'POST',body:'{}'}));
  if(endpoint==='roulette/claim'&&method==='POST')return json(await rest('rpc/postispop_claim_gift','',{method:'POST',body:JSON.stringify({p_day:payload.day,p_name:payload.name,p_email:payload.email,p_brand:payload.brand})}));
  const importMatch=endpoint.match(/^board\/([^/]+)\/import$/);
  if(importMatch&&method==='POST') {
    if(!online())return json({error:'OFFLINE'},503);
    const state=offline.status(user.id);
    if(state.pending||state.conflicts)return json({error:'SYNC_PENDING_BEFORE_IMPORT'},409);
    const boardId=importMatch[1],backup=normalizeBackup(payload,{maxBytes:LOCAL_BACKUP_BYTES});
    await verifyBackupAttachments(backup.notes);validateSession();
    const serverNotes=backupNotesForServer(backup.notes);
    // Large local binaries stay on this device; independently enforce the RPC
    // payload budget so file backups cannot bypass the server's text limits.
    normalizeBackup({...backup,notes:serverNotes},{maxBytes:CLOUD_BACKUP_BYTES});
    const boards=await rest('boards','?id=eq.'+encodeURIComponent(boardId)+'&select=id,owner_id');
    if(boards[0]?.owner_id!==user.id)return json({error:'OWNER_REQUIRED'},403);
    const notes=await rest('notes','?board_id=eq.'+encodeURIComponent(boardId)+'&select=id');
    const ticket=await importTicket(localStorage,user.id,boardId,backup.notes,requestStartedAt);
    return withImportSlots(notes.map(n=>n.id),async excluded=>{
      let result;
      try{result=await rest('rpc/postispop_import_board','',{method:'POST',body:JSON.stringify({p_board_id:boardId,p_request_id:ticket.requestId,p_notes:serverNotes,p_excluded_note_ids:excluded})});}
      catch(error){if(error.body?.code==='PGRST202'||error.body?.code==='42883')return json({error:'IMPORT_UNAVAILABLE'},503);throw error;}
      // If another client added a slot after our snapshot, retry with the new
      // snapshot and the same RPC ticket before writing that slot's local files.
      if(backup.notes.some(note=>note.attachments?.length)&&result.noteIds?.some(id=>!notes.some(note=>note.id===id)))throw Object.assign(new Error('IMPORT_RETRY_REQUIRED'),{status:409});
      let restored;
      try{
        restored=await restoreBackupAttachments(backup.notes,result.noteIds,{requestId:ticket.requestId,validate:validateSession});
        validateSession();
      }catch(error){await restored?.rollback();throw error;}
      for(let i=0;i<(result.noteIds||[]).length;i++)if(backup.notes[i]?.protectedEnvelope){try{localStorage.setItem('pp:protected-note:'+result.noteIds[i],'1');}catch{/* The server envelope is authoritative. */}}
      ticket.finish();return json(result);
    });
  }
  const protectedMatch=endpoint.match(/^note\/([^/]+)\/(protect|protected-save)$/);
  if(protectedMatch&&method==='POST') {
    if(protectedMatch[2]==='protect'&&offline.noteHistory(protectedMatch[1]).pending)return json({error:'SYNC_PENDING_BEFORE_PROTECT'},409);
    if(protectedMatch[2]==='protect'&&offline.noteHistory(protectedMatch[1]).recovery&&!payload.purgeVersions)return json({error:'CONFIRM_RECOVERY_PURGE'},409);
    const row=await rest('rpc/postispop_protect_note','',{method:'POST',body:JSON.stringify({p_note_id:protectedMatch[1],p_revision:payload.revision,p_envelope:payload.protectedEnvelope,p_style_revision:payload.styleRevision||0})});
    const note=mapNote(Array.isArray(row)?row[0]:row);
    if(protectedMatch[2]==='protect')offline.sanitizeProtected(note);else offline.updateNote(user.id,note);
    return json({note});
  }
  if(endpoint==='protected-shares'&&method==='POST')return json(await rest('rpc/postispop_create_protected_share','',{method:'POST',body:JSON.stringify({p_note_id:payload.noteId,p_days:payload.expiresInDays||7})}));
  if(endpoint==='protected-shares/revoke-note'&&method==='POST')return json(await rest('rpc/postispop_revoke_note_shares','',{method:'POST',body:JSON.stringify({p_note_id:payload.noteId})}));
  const revoke=endpoint.match(/^protected-shares\/([^/]+)\/revoke$/);
  if(revoke&&method==='POST')return json(await rest('rpc/postispop_revoke_protected_share','',{method:'POST',body:JSON.stringify({p_share_id:revoke[1]})}));

  if (endpoint === "boards" && method === "POST") {
    const board = await createBoard(user,rest,requestStartedAt);
    return api(`board/${board.id}`, { method: "GET" });
  }

  const exportMatch = endpoint.match(/^board\/([^/]+)\/export$/);
  if (exportMatch && method === 'GET') {
    // Reuse the authorized board read. Never bypass the existing RLS policies.
    const response = await api('board/'+exportMatch[1], {method:'GET'});
    if(!response.ok) return response;
    const board=offline.project(user.id,await response.json());
    const styles=await readStyleRows(rest);
    // Include unsynchronised local strokes just like the board toolbar does.
    // RLS still authorizes the server rows; protected styles stay encrypted.
    const byNote=new Map(styles.map(style=>[style.note_id,style]));
    for(const op of offline.pending(user.id))if(op.kind==='style')byNote.set(op.noteId,op.after);
    for(const note of board.notes)if(!note.protectedEnvelope)note.style=byNote.get(note.id)||null;
    const backup=await createBoardBackup(board);validateSession();return json(backup);
  }

  const addMatch=endpoint.match(/^board\/([^/]+)\/notes$/);
  if(addMatch&&method==='POST'){
    // Keep the six-note client contract while older servers are being migrated.
    // The server admission trigger remains authoritative for concurrent requests.
    const existing=await rest('notes','?board_id=eq.'+encodeURIComponent(addMatch[1])+'&select=id');
    if(existing.length>=6){
      const premium=await rest('rpc/postispop_has_license','',{method:'POST',body:JSON.stringify({subject_id:'premium'})});
      if(premium!==true||existing.length>=100)return json({error:'BOARD_FULL'},409);
    }
    await rest('rpc/postispop_add_board_note','',{method:'POST',body:JSON.stringify({p_board:addMatch[1]})});return api('board/'+addMatch[1],{method:'GET'});
  }
  const trashMatch=endpoint.match(/^note\/([^/]+)\/trash$/);
  if(trashMatch&&method==='POST'){
    const result=await rest('rpc/postispop_remove_board_note','',{method:'POST',body:JSON.stringify({p_note:trashMatch[1],p_revision:payload.revision})});
    const board=await (await api('board/'+result.board_id,{method:'GET'})).json();return json({board,trashId:result.trashId});
  }
  const trashList=endpoint.match(/^board\/([^/]+)\/trash$/);
  if(trashList&&method==='GET')return json(await rest('rpc/postispop_board_note_trash','',{method:'POST',body:JSON.stringify({p_board:trashList[1]})}));
  const restoreMatch=endpoint.match(/^restore\/([^/]+)$/);
  if(restoreMatch&&method==='POST'){
    const result=await rest('rpc/postispop_restore_board_note','',{method:'POST',body:JSON.stringify({p_trash:restoreMatch[1]})});return api('board/'+result.board_id,{method:'GET'});
  }

  const boardMatch = endpoint.match(/^board\/([^/]+)$/);
  if (boardMatch && method === "GET") {
    const id = boardMatch[1];
    if (id === "guest-board") return json(readGuest());
    const boards = await rest("boards", `?id=eq.${id}&select=*`);
    if (!boards.length) return json({ error: "NOT_FOUND" }, 404);
    const notes = await rest("notes", `?board_id=eq.${id}&select=*&order=position.asc`);
    const members = await rest("board_members", `?board_id=eq.${id}&select=*`);
    return json(mapBoard(boards[0], notes, members));
  }

  const swapMatch=endpoint.match(/^board\/([^/]+)\/swap$/);
  if(swapMatch&&method==='POST') {
    try{await rest('rpc/postispop_swap_board_notes','',{method:'POST',body:JSON.stringify({p_board:swapMatch[1],p_from:payload.from,p_to:payload.to,p_revision:payload.revision})});}
    catch(error){if(error.body?.code==='PGRST202'||error.body?.code==='42883')return json({error:'REORDER_UNAVAILABLE'},503);throw error;}
    return api('board/'+swapMatch[1],{method:'GET'});
  }

  const titleMatch=endpoint.match(/^board\/([^/]+)\/title$/);
  if(titleMatch&&method==='POST') {
    const rows=await rest('boards',`?id=eq.${encodeURIComponent(titleMatch[1])}&owner_id=eq.${user.id}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({title:String(payload.title||'').slice(0,80)})});
    if(!rows.length)return json({error:'OWNER_REQUIRED'},403);
    return api('board/'+titleMatch[1],{method:'GET'});
  }

  const noteMatch = endpoint.match(/^note\/([^/]+)(?:\/(text|paper|doodle|image|lock|unlock))?$/);
  if (noteMatch && method === "POST") {
    const id = noteMatch[1];
    const kind = noteMatch[2];
    if(!['lock','unlock'].includes(kind)){const current=await rest('notes','?id=eq.'+encodeURIComponent(id)+'&select=id,protected_envelope');if(current[0]?.protected_envelope)return json({error:'PROTECTED_NOTE'},403);}
    if(kind==='paper'&&(!Number.isInteger(payload?.paper)||payload.paper<0||payload.paper>5||!Number.isInteger(payload.revision))) return json({error:'INVALID_NOTE'},400);
    const update = kind === "paper" ? { paper: payload.paper } : kind === "doodle" ? { doodle: payload.doodle } : kind === "image" ? { image_url: payload.url || payload.image?.url || null } : kind === "lock" ? { locked_until: new Date(Date.now() + 45000).toISOString(), editing: user.id } : kind === "unlock" ? { locked_until: null, editing: null } : { text: payload.text, marks: payload.marks || [], revision: (payload.revision || 0) + 1 };
    update.updated_ms = Date.now();
    const query=`?id=eq.${encodeURIComponent(id)}&protected_envelope=is.null`+(kind==='lock'?`&or=(locked_until.is.null,locked_until.lt.${encodeURIComponent(new Date().toISOString())},editing.eq.${user.id})`:kind==='unlock'?`&editing=eq.${user.id}`:Number.isInteger(payload.revision)?`&revision=eq.${payload.revision}`:'');
    if(!['lock','unlock'].includes(kind)&&Number.isInteger(payload.revision))update.revision=payload.revision+1;
    const rows = await rest("notes", query, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(update) });
    if(!rows?.length) return json({error:kind==='lock'?'NOTE_LOCKED':'CONFLICT'},409);
    return json({ note: mapNote(rows[0]), ...(kind==='lock'?{lock:user.id}:{}) });
  }

  return json({ error: "UNSUPPORTED_OPERATION" }, 400);
}


const announce=(kind,detail)=>{if(typeof window.dispatchEvent==='function'&&typeof CustomEvent==='function')window.dispatchEvent(new CustomEvent(kind,{detail}));};
const offlineActor=()=>{const id=session()?.user?.id;return id?offline.identity(id):null;};
const outboxStatus=()=>{const id=offlineActor()?.id;return{...(id?offline.status(id):{pending:0,conflicts:0}),online:online(),userId:id||null};};
let flushPromise=null;
async function flushOutbox(userId) {
  if(flushPromise)return flushPromise;
  const work=async()=>{
    if(!online()||session()?.user?.id!==userId)return;
    const blocked=new Set();
    for(const op of offline.pending(userId)) {
      if(session()?.user?.id!==userId||!online())break;
      const target=op.noteId+(op.kind==='style'?':style':':note');
      if(op.state==='conflict'||blocked.has(target)){blocked.add(target);continue;}
      try {
        const response=await api(op.endpoint,{method:'POST',body:JSON.stringify(op.body),accountId:userId});
        if(session()?.user?.id!==userId)break;
        const data=await response.json();
        if(response.ok)offline.acknowledge(userId,op,data);
        else if(response.status===401)break;
        else if(response.status>=500)break;
        else {
          let server=null;
          if(op.kind==='style'){const rows=await rawRest('postispop_note_style','?note_id=eq.'+encodeURIComponent(op.noteId)+'&select=*');server=rows[0]||null;}
          else {const rows=await rawRest('notes','?id=eq.'+encodeURIComponent(op.noteId)+'&select=*');server=rows[0]?mapNote(rows[0]):null;}
          if(session()?.user?.id!==userId)break;
          if(sameMutation(op,server))offline.acknowledge(userId,op,op.kind==='style'?{style:server}:{note:server});
          else {offline.conflict(userId,op,server,data.error||'CONFLICT');blocked.add(target);}
        }
      } catch(error) {
        if(error.status===401||!error.status||error.status>=500)break;
        if(session()?.user?.id!==userId)break;
        let server=null;
        try{const table=op.kind==='style'?'postispop_note_style':'notes',field=op.kind==='style'?'note_id':'id';const rows=await rawRest(table,'?'+field+'=eq.'+encodeURIComponent(op.noteId)+'&select=*');server=rows[0]?(op.kind==='style'?rows[0]:mapNote(rows[0])):null;}catch{}
        if(sameMutation(op,server))offline.acknowledge(userId,op,op.kind==='style'?{style:server}:{note:server});
        else{offline.conflict(userId,op,server,error.message);blocked.add(target);}
      }
    }
    announce('postispop:offline',outboxStatus());
  };
  flushPromise=(typeof navigator!=='undefined'&&navigator.locks?.request?navigator.locks.request('postispop-outbox:'+userId,work):work()).finally(()=>{flushPromise=null;});
  return flushPromise;
}

window.fetch = async (input, init = {}) => {
  const url = new URL(typeof input === 'string' ? input : input.url, location.href);
  const parts = url.pathname.split('/').filter(Boolean), apiIndex=parts.indexOf('api');
  if(url.origin!==location.origin||apiIndex===-1)return originalFetch(input,init);
  const endpoint=parts.slice(apiIndex+1).join('/'), method=(init.method||'GET').toUpperCase();
  const requestGeneration=sessionGeneration, requestAccountId=session()?.user?.id;
  init={...init,method,search:url.search};
  const mutation=method==='POST'&&/^note\/[^/]+(?:\/(?:text|paper|doodle|image|protect|protected-save))?$/.test(endpoint);
  const mode=endpoint.includes('guest-')?'local':'cloud', account=offlineActor();
  if(mutation)announce('postispop:save',{state:'saving',mode});
  try {
    if(endpoint.startsWith('offline/')) {
      if(!account)return json({error:'SESSION_REQUIRED'},401);
      if(endpoint==='offline/status')return json(outboxStatus());
      const noteId=endpoint.match(/^offline\/note\/([^/]+)$/)?.[1];
      if(noteId){const ops=offline.pending(account.id).filter(o=>o.noteId===noteId);return json({...offline.noteHistory(noteId),conflicts:ops.filter(o=>o.state==='conflict').length});}
      if(endpoint==='offline/conflicts')return json({conflicts:offline.pending(account.id).filter(o=>o.state==='conflict'),recovery:offline.recovery(account.id)});
      if(endpoint==='offline/resolve'&&method==='POST'){const body=JSON.parse(init.body||'{}');offline.resolve(account.id,body.id,body.choice);await flushOutbox(account.id);return json(outboxStatus());}
      if(endpoint==='offline/sync'&&method==='POST'){await flushOutbox(account.id);return json(outboxStatus());}
      return json({error:'NOT_FOUND'},404);
    }
    // Write-ahead local save occurs before any network request. No queue is shared across accounts.
    if(account&&mode==='cloud'&&method==='POST'&&offline.isMutation(endpoint)) {
      const body=JSON.parse(init.body||'{}'), result=offline.enqueue(account.id,endpoint,body);
      announce('postispop:offline',outboxStatus());
      if(online())await flushOutbox(account.id);
      if(requestGeneration!==sessionGeneration||session()?.user?.id!==account.id)return json({error:'SESSION_CHANGED'},401);
      const id=body.note_id||endpoint.split('/')[1];
      const updated=endpoint==='designs/styles'?offline.projectStyles(account.id).find(s=>s.note_id===id):offline.findNote(account.id,id)?.note;
      const waiting=offline.pending(account.id).some(o=>o.noteId===id);
      announce('postispop:save',{state:waiting?'pending':'saved',mode:waiting?'offline':'cloud',at:Date.now()});
      return json({...result,...(endpoint==='designs/styles'?{style:updated}:{note:updated}),pending:waiting,offline:waiting},waiting?202:200);
    }
    // Editing locks are transient; offline revision checks protect the durable outbox.
    if(account&&!online()&&/^note\/[^/]+\/(lock|unlock)$/.test(endpoint)){
      const note=offline.findNote(account.id,endpoint.split('/')[1])?.note;if(!note)return json({error:'OFFLINE_NOTE_NOT_CACHED'},503);if(note.protectedEnvelope)return json({error:'PROTECTED_NOTE'},403);
      return json({note,lock:account.id,offline:true});
    }
    if(!online()&&account&&mode==='cloud'&&endpoint!=='auth/logout')throw Object.assign(new Error('OFFLINE'),{offline:true});
    const response=await api(endpoint,init);
    if(!endpoint.startsWith('auth/')&&(requestGeneration!==sessionGeneration||requestAccountId!==session()?.user?.id)){if(endpoint==='session'&&!session()?.access_token)return json({actor:actorFor(null)});return json({error:'SESSION_CHANGED'},401);}
    let result=response;
    const active=offlineActor();
    if(response.ok&&active&&method==='GET'&&['me','session'].includes(endpoint)){const data=await response.clone().json();offline.remember(active.id,endpoint,data);if(session()?.user?.id===active.id)void flushOutbox(active.id);}
    if(response.ok&&active&&method==='GET'&&/^board\/[^/]+$/.test(endpoint)&&mode==='cloud') {
      const board=await response.clone().json();offline.remember(active.id,endpoint,board);result=json(offline.project(active.id,board));announce('postispop:activity',{name:'first_sync'});
    }
    if(response.ok&&active&&endpoint==='designs/styles'&&method==='GET'){
      const data=await response.clone().json(),noteId=new URLSearchParams(url.search).get('note_id');
      if(!Array.isArray(data.styles))throw new Error('STYLES_UNAVAILABLE');
      if(noteId){const existing=offline.cached(active.id,'designs/styles')?.styles||[];offline.cacheStyles(active.id,[...existing.filter(s=>s.note_id!==noteId),...data.styles]);const style=offline.projectStyles(active.id).find(s=>s.note_id===noteId)||null;result=json({styles:style?[style]:[],style});}
      else {
        if(data.stylesComplete!==true)throw new Error('STYLES_INCOMPLETE');
        result=json({styles:offline.cacheStyles(active.id,data.styles)});
        offline.remember(active.id,'designs/styles-complete',{complete:true,version:2,total:data.styles.length});
      }
    }
    if(mutation)announce('postispop:save',{state:response.ok?'saved':'error',mode,at:response.ok?Date.now():null});
    if(response.ok&&endpoint==='auth/signup')announce('postispop:activity',{name:'signup_completed'});
    if(!endpoint.startsWith('auth/')&&(requestGeneration!==sessionGeneration||requestAccountId!==session()?.user?.id)){if(endpoint==='session'&&!session()?.access_token)return json({actor:actorFor(null)});return json({error:'SESSION_CHANGED'},401);}
    if(endpoint.startsWith('auth/'))announce('postispop:offline',outboxStatus());
    return result;
  } catch(error) {
    // Only transport/offline failures may fall back. A 401/403/404 is never masked by local data.
    if(account&&requestGeneration===sessionGeneration&&session()?.user?.id===account.id&&(error.offline||(!error.status&&error instanceof TypeError)||(!online()&&!error.status))) {
      if(endpoint==='designs/status') {const rights=await getOfflineRights(account.id);if(rights)return json({...rights,offline:true});return json({error:'OFFLINE_LICENSE_UNAVAILABLE'},503);}
      if(endpoint==='session')return json({actor:actorFor(account),offline:true});
      if(/^note\/[^/]+\/(lock|unlock)$/.test(endpoint)){const note=offline.findNote(account.id,endpoint.split('/')[1])?.note;if(note?.protectedEnvelope)return json({error:'PROTECTED_NOTE'},403);if(note)return json({note,lock:account.id,offline:true});}
      if(method==='GET'&&endpoint==='designs/styles'){
        const noteId=new URLSearchParams(url.search).get('note_id');
        // An absent or partially populated cache cannot prove that a board has
        // no drawings. Only a successful full read certifies an empty list.
        const certificate=offline.cached(account.id,'designs/styles-complete');
        if(!noteId&&(!certificate?.complete||certificate.version!==2||!Array.isArray(offline.cached(account.id,'designs/styles')?.styles)))return json({error:'OFFLINE_STYLES_NOT_CACHED'},503);
        const styles=offline.projectStyles(account.id);return json({styles:noteId?styles.filter(s=>s.note_id===noteId):styles,...(noteId?{style:styles.find(s=>s.note_id===noteId)||null}:{}),offline:true});
      }
      if(method==='GET'&&(endpoint==='me'||/^board\/[^/]+$/.test(endpoint))){const value=offline.cached(account.id,endpoint);if(value)return json({...value,offline:true});}
    }
    if(mutation)announce('postispop:save',{state:'error',mode});
    return json({error:error.body?.message||error.message||'REQUEST_FAILED'},error.status||(error.offline?503:500));
  }
};
if(typeof window.addEventListener==='function') {
  window.addEventListener('online',()=>{const id=offlineActor()?.id;if(id)void flushOutbox(id);});
  window.addEventListener('storage',event=>{if(event.key===sessionKey){sessionGeneration++;userCache=null;announce('postispop:session-change',{userId:session()?.user?.id||null});}announce('postispop:offline',outboxStatus());});
}
installOfflineUI({status:outboxStatus});
