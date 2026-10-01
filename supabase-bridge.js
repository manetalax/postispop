import { readGuest, guestRequest, guestBoards, createGuest } from './guest-board.js';
import { cleanNote, metadata } from './app/board-core.js';
const SUPABASE_URL = "https://htfyjefmviwlgmfqrwue.supabase.co";
const SUPABASE_KEY = "sb_publishable_ox1LUYhmz57iSU7mPtGStg_-FZl-zQT";
const originalFetch = window.fetch.bind(window);
const sessionKey = "postispop-supabase-session";

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

const rest = async (table, query = "", options = {}) => {
  const response = await originalFetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    ...options,
    headers: { ...headers(), ...(options.headers || {}) }
  });
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!response.ok) throw Object.assign(new Error(body?.message || "SUPABASE_ERROR"), { status: response.status, body });
  return body;
};

const mapNote = (n) => ({
  id: n.id, doodle: n.doodle || "", paper: n.paper ?? 0, text: n.text || "",
  marks: n.marks || [], author: n.author_id || "", revision: n.revision || 1,
  created: n.created_ms || Date.parse(n.created_at), image: n.image_url ? { url: n.image_url } : null,
  updated: n.updated_ms || Date.parse(n.updated_at), lockedUntil: n.locked_until ? Date.parse(n.locked_until) : 0,
  editing: n.editing || "", metadata: metadata(n.metadata)
});

const mapBoard = (b, notes, members = []) => ({
  id: b.id, title: b.title || "", revision: b.revision || 1,
  order: notes.map(n => n.id), expires: b.expires_at ? Date.parse(b.expires_at) : null,
  role: b.owner_id === session()?.user?.id ? "owner" : "member", owner: b.owner_id,
  notes: notes.map(mapNote), members
});

async function createBoard() {
  const id=await rest('rpc/pp_create_board','',{method:'POST',body:JSON.stringify({p_title:'Mi pizarra',p_notes:[]})});
  const rows=await rest('boards',`?id=eq.${encodeURIComponent(id)}&select=*`);return rows[0];
}

let userCache = null, refreshPromise = null;
async function currentUser() {
  let saved = session();
  if (!saved?.access_token) { userCache=null; return null; }
  if (saved.expires_at && saved.expires_at * 1000 < Date.now() + 60000 && saved.refresh_token) {
    if (!refreshPromise) refreshPromise=(async()=>{
      const response=await originalFetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:saved.refresh_token})});
      const data=await response.json();
      if(!response.ok) { if(response.status===400||response.status===401) localStorage.removeItem(sessionKey); throw Object.assign(new Error('SESSION_REQUIRED'),{status:response.status}); }
      localStorage.setItem(sessionKey,JSON.stringify(data)); userCache=null;
    })().finally(()=>{refreshPromise=null;});
    await refreshPromise; saved=session();
  }
  if(userCache?.token===saved.access_token && userCache.until>Date.now()) return userCache.user;
  const response=await originalFetch(`${SUPABASE_URL}/auth/v1/user`,{headers:headers()});
  if(!response.ok) { if(response.status===401) {localStorage.removeItem(sessionKey);return null;} throw new Error('AUTH_UNAVAILABLE'); }
  const user=await response.json();userCache={token:saved.access_token,user,until:Date.now()+30000};return user;
}

async function api(endpoint, init) {
  const method = init?.method || "GET";
  const payload = init?.body ? JSON.parse(init.body) : undefined;
  const local=guestRequest(endpoint,method,payload);
  if(local) return json(local);

  if(endpoint==='tools/create'&&method==='POST') {
    const user=await currentUser();
    if(!Array.isArray(payload?.notes)||payload.notes.length>12) return json({error:'INVALID_BACKUP'},400);
    const notes=payload.notes.map(cleanNote);
    if(!user)return json(createGuest(payload.title,notes));
    const id=await rest('rpc/pp_create_board','',{method:'POST',body:JSON.stringify({p_title:payload.title,p_notes:notes})});
    return api('board/'+id,{method:'GET'});
  }
  if(endpoint==='tools/readshare'&&method==='POST') {
    await currentUser();
    return json(await rest('rpc/pp_read_share','',{method:'POST',body:JSON.stringify({p_token:payload.token})}));
  }
  if(endpoint==='tools/editshared'&&method==='POST') {
    if(!await currentUser())return json({error:'SESSION_REQUIRED'},401);
    return json(await rest('rpc/pp_edit_shared_note','',{method:'POST',body:JSON.stringify({p_token:payload.token,p_note:payload.note_id,p_text:payload.text,p_revision:payload.revision})}));
  }
  if(endpoint.startsWith('commerce/')) {
    const user=await currentUser();
    if(!user&&endpoint!=='commerce/catalog') return json({error:'SESSION_REQUIRED'},401);
    if(endpoint==='commerce/status') return json(await rest('rpc/postispop_access','',{method:'POST',body:'{}'}));
    if(endpoint==='commerce/catalog') {
      const products=await rest('store_products','?active=eq.true&select=slug,title,description,price_cents,currency&order=sort_order.asc');
      const response=await originalFetch(`${SUPABASE_URL}/functions/v1/postispop-commerce/status`,{headers:{apikey:SUPABASE_KEY}});
      const state=response.ok?await response.json():{};
      return json({products,checkoutReady:state.checkoutReady===true});
    }
    if(endpoint==='commerce/alarms') {
      if(method==='GET') return json({alarms:await rest('note_alarms','?select=*&order=due_at.asc')});
      if(payload.action==='delete') {await rest('note_alarms',`?id=eq.${encodeURIComponent(payload.id)}&user_id=eq.${user.id}`,{method:'DELETE'});return json({ok:true});}
      if(payload.action==='ack') {const rows=await rest('note_alarms',`?id=eq.${encodeURIComponent(payload.id)}&user_id=eq.${user.id}&delivered_at=is.null`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({delivered_at:new Date().toISOString()})});return json({claimed:rows.length>0});}
      const rows=await rest('note_alarms','',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({user_id:user.id,note_id:payload.note_id,label:String(payload.label||'Recordatorio').slice(0,200),due_at:payload.due_at})});return json({alarm:rows[0]});
    }
    return originalFetch(`${SUPABASE_URL}/functions/v1/postispop-commerce/${endpoint.slice(9)}`,{method,headers:headers(),body:method==='GET'?undefined:JSON.stringify(payload)});
  }

  if (endpoint === "config") return json({ features: { notes: 12, textLimit: 10000, guestDays: 90, trashDays: 30, lockSeconds: 45, payments: false, clock: false, games: false, awards: false, phoneRequired: false, captures: true }, authReady: true, currency: "EUR" });

  if (endpoint === "auth/login" && method === "POST") {
    const response = await originalFetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email: payload.email, password: payload.password }) });
    const data = await response.json();
    if (!response.ok) return json({ error: data.error_description || data.msg || "AUTH_FAILED" }, response.status);
    localStorage.setItem(sessionKey, JSON.stringify(data));
    return json({ actor: actorFor(data.user) });
  }

  if (endpoint === "auth/signup" && method === "POST") {
    const response = await originalFetch(`${SUPABASE_URL}/auth/v1/signup`, { method: "POST", headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email: payload.email, password: payload.password }) });
    const data = await response.json();
    if (!response.ok) return json({ error: data.msg || data.message || "AUTH_FAILED" }, response.status);
    if (data.access_token) localStorage.setItem(sessionKey, JSON.stringify(data));
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
    localStorage.setItem(sessionKey, JSON.stringify(data));
    return json({ actor: actorFor(data.user) });
  }

  if (endpoint === "auth/logout") { localStorage.removeItem(sessionKey); return json({ ok: true }); }
  if (endpoint === "auth/settings") return json({ google: true, email: true });
  if (endpoint === "store/products" && method === "GET") {
    try {
      const products = await rest("store_products", "?active=eq.true&select=*&order=sort_order.asc");
      return json({ products });
    } catch {
      return json({ products: [
        { slug: "pack-rebel", title: "Pack Rebel", description: "Un estilo más atrevido para tus pizarras y notas.", price_cents: 299, currency: "eur", stripe_payment_link: null },
        { slug: "pack-minimal", title: "Pack Minimal", description: "Un estilo limpio y concentrado para organizarte.", price_cents: 299, currency: "eur", stripe_payment_link: null },
        { slug: "reloj-recordatorios", title: "Reloj y recordatorios", description: "Añade fechas y horas a tus notas para no olvidar nada.", price_cents: 499, currency: "eur", stripe_payment_link: null },
        { slug: "postispop-pro", title: "PostisPop Pro", description: "Incluye Rebel, Minimal y el reloj con alarmas mientras la aplicación está abierta.", price_cents: 999, currency: "eur", stripe_payment_link: null }
      ] });
    }
  }
  if (endpoint === "session" && method === "GET") return json({ actor: actorFor(await currentUser()) });

  const user = await currentUser();
  if (endpoint === "me" && method === "GET") {
    if (!user) return json({ actor: actorFor(null), boards: guestBoards() });
    let boards = await rest("boards", "?select=*&order=created_at.asc");
    if (!boards.length) boards = [await createBoard()];
    return json({ actor: actorFor(user), boards: boards.map(b => ({ id: b.id, title: b.title || "", owner: b.owner_id, expires: b.expires_at, role: b.owner_id===user.id?"owner":"member" })) });
  }
  if (!user && endpoint === "boards" && method === "POST") return json(createGuest());
  if (!user) return json({ error: "SESSION_REQUIRED" }, 401);

  if (endpoint === "boards" && method === "POST") {
    const board = await createBoard();
    return api(`board/${board.id}`, { method: "GET" });
  }

  if(endpoint==='tools/shares'&&method==='POST')return json(await rest('rpc/pp_manage_share','',{method:'POST',body:JSON.stringify({p_board:payload.board_id,p_action:payload.action,p_id:payload.id||null,p_role:payload.role||'viewer',p_email:payload.email||null,p_days:payload.days||7})}));
  const operation=endpoint.match(/^board\/([^/]+)\/(import|swap|trash)$/);
  if(operation) {
    const id=operation[1],kind=operation[2];
    if(kind==='trash'&&method==='GET') {
      const rows=await rest('pp_note_trash',`?board_id=eq.${encodeURIComponent(id)}&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&select=*`);
      return json({items:rows.map(t=>({...mapNote(t.note),id:t.id,expires:Date.parse(t.expires_at)}))});
    }
    if(method==='POST'&&kind==='import') {
      if(!Array.isArray(payload?.notes))return json({error:'INVALID_BACKUP'},400);
      await rest('rpc/pp_import_notes','',{method:'POST',body:JSON.stringify({p_board:id,p_notes:payload.notes.map(cleanNote)})});
    }else if(method==='POST'&&kind==='swap')await rest('rpc/pp_swap_notes','',{method:'POST',body:JSON.stringify({p_board:id,p_from:payload.from,p_to:payload.to})});
    else return json({error:'UNSUPPORTED_OPERATION'},400);
    return api('board/'+id,{method:'GET'});
  }
  const trashMatch=endpoint.match(/^note\/([^/]+)\/trash$/);
  if(trashMatch&&method==='POST') {
    const before=await rest('notes',`?id=eq.${encodeURIComponent(trashMatch[1])}&select=board_id`);
    if(!before.length)return json({error:'NOT_FOUND'},404);
    const trashId=await rest('rpc/pp_trash_note','',{method:'POST',body:JSON.stringify({p_note:trashMatch[1]})});
    const result=await api('board/'+before[0].board_id,{method:'GET'});return json({board:await result.json(),trashId});
  }
  const restoreMatch=endpoint.match(/^restore\/([^/]+)$/);
  if(restoreMatch&&method==='POST') {
    const id=await rest('rpc/pp_restore_note','',{method:'POST',body:JSON.stringify({p_trash:restoreMatch[1]})});return api('board/'+id,{method:'GET'});
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

  const titleMatch=endpoint.match(/^board\/([^/]+)\/title$/);
  if(titleMatch&&method==='POST') {
    const rows=await rest('boards',`?id=eq.${encodeURIComponent(titleMatch[1])}&owner_id=eq.${user.id}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({title:String(payload.title||'').slice(0,80)})});
    if(!rows.length)return json({error:'OWNER_REQUIRED'},403);
    return api('board/'+titleMatch[1],{method:'GET'});
  }

  const noteMatch = endpoint.match(/^note\/([^/]+)(?:\/(text|paper|doodle|image|metadata|lock|unlock))?$/);
  if (noteMatch && method === "POST") {
    const id = noteMatch[1];
    const kind = noteMatch[2];
    if(!['lock','unlock'].includes(kind)&&(!Number.isInteger(payload?.revision)||payload.revision<1)) return json({error:'INVALID_NOTE'},400);
    if(kind==='paper'&&(!Number.isInteger(payload?.paper)||payload.paper<0||payload.paper>5||!Number.isInteger(payload.revision))) return json({error:'INVALID_NOTE'},400);
    if(!kind||kind==='text')cleanNote({text:payload.text,marks:payload.marks||[]});
    const update = kind === "metadata" ? { metadata: metadata(payload.metadata) } : kind === "paper" ? { paper: payload.paper } : kind === "doodle" ? { doodle: payload.doodle } : kind === "image" ? { image_url: payload.url || payload.image?.url || null } : kind === "lock" ? { locked_until: new Date(Date.now() + 45000).toISOString(), editing: user.id } : kind === "unlock" ? { locked_until: null, editing: null } : { text: payload.text, marks: payload.marks || [], revision: (payload.revision || 0) + 1 };
    update.updated_ms = Date.now();
    // Check the revision and editing lease in the same database PATCH. A previous
    // read would leave a race in which another editor could acquire the note.
    const editable=`&or=(locked_until.is.null,locked_until.lt.${encodeURIComponent(new Date().toISOString())},editing.eq.${user.id})`;
    const query=`?id=eq.${encodeURIComponent(id)}`+(kind==='lock'?editable:kind==='unlock'?`&editing=eq.${user.id}`:`&revision=eq.${payload.revision}`+editable);
    if(!['lock','unlock'].includes(kind)&&Number.isInteger(payload.revision))update.revision=payload.revision+1;
    const rows = await rest("notes", query, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(update) });
    if(!rows?.length) return json({error:kind==='lock'?'NOTE_LOCKED':'CONFLICT'},409);
    return json({ note: mapNote(rows[0]), ...(kind==='lock'?{lock:user.id}:{}) });
  }

  return json({ error: "UNSUPPORTED_OPERATION" }, 400);
}

window.fetch = async (input, init = {}) => {
  const url = new URL(typeof input === "string" ? input : input.url, location.href);
  const parts = url.pathname.split("/").filter(Boolean);
  const apiIndex = parts.indexOf("api");
  if (url.origin !== location.origin || apiIndex === -1) return originalFetch(input, init);
  const endpoint = parts.slice(apiIndex + 1).join("/");
  const method=(init.method||(typeof input==='object'?input.method:'GET')||'GET').toUpperCase();
  if(!init.body && typeof input==='object' && method!=='GET')init={...init,body:await input.clone().text()};
  const signal=(stage,ok)=>window.dispatchEvent?.(new CustomEvent('postispop:request',{detail:{stage,endpoint,method,ok}}));
  signal('start');let response;
  try { response=await api(endpoint,{...init,method}); }
  catch (error) {
    const missing=['PGRST202','42703','42P01'].includes(error.body?.code);
    response=json({error:missing?'MIGRATION_REQUIRED':error.body?.message||error.message||'REQUEST_FAILED'},error.status||500);
  }
  signal('end',response.ok);return response;
};
