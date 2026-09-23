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
    Authorization: `Bearer ${token || SUPABASE_KEY}`,
    "Content-Type": "application/json"
  };
};

const rest = async (table, query = "", options = {}) => {
  const response = await originalFetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    ...options,
    headers: { ...headers(), ...(options.headers || {}) }
  });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!response.ok) throw Object.assign(new Error(body?.message || "SUPABASE_ERROR"), { status: response.status, body });
  return body;
};

const mapNote = (n) => ({
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

const guestBoard = () => {
  const id = "guest-board";
  const notes = Array.from({ length: 12 }, (_, position) => ({
    id: `guest-note-${position}`, paper: position % 5, text: "", marks: [], doodle: "",
    author_id: "guest", revision: 1, created_ms: Date.now(), updated_ms: Date.now(),
    locked_until: null, editing: null, image_url: null
  }));
  return { id, title: "Mi pizarra", revision: 1, order: notes.map(n => n.id), expires: null, role: "owner", owner: "guest", notes: notes.map(mapNote), members: [] };
};

async function createBoard(user) {
  const boardRows = await rest("boards", "", {
    method: "POST", headers: { Prefer: "return=representation" },
    body: JSON.stringify({ owner_id: user.id, title: "Mi pizarra" })
  });
  const board = boardRows[0];
  const notes = Array.from({ length: 12 }, (_, position) => ({ board_id: board.id, author_id: user.id, position, paper: position % 5, marks: [], text: "" }));
  await rest("notes", "", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(notes) });
  return board;
}

async function currentUser() {
  const token = session()?.access_token;
  if (!token) return null;
  const response = await originalFetch(`${SUPABASE_URL}/auth/v1/user`, { headers: headers() });
  if (!response.ok) return null;
  return response.json();
}

async function api(endpoint, init) {
  const method = init?.method || "GET";
  const payload = init?.body ? JSON.parse(init.body) : undefined;

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
    const products = await rest("store_products", "?active=eq.true&select=*&order=sort_order.asc");
    return json({ products });
  }
  if (endpoint === "session" && method === "GET") return json({ actor: actorFor(await currentUser()) });

  const user = await currentUser();
  if (!user && endpoint === "board/guest-board" && method === "GET") return json(guestBoard());
  if (endpoint === "me" && method === "GET") {
    if (!user) return json({ actor: actorFor(null), boards: [{ id: "guest-board", title: "Mi pizarra", owner: "guest", expires: null, role: "owner" }] });
    let boards = await rest("boards", `?owner_id=eq.${user.id}&select=*`);
    if (!boards.length) boards = [await createBoard(user)];
    return json({ actor: actorFor(user), boards: boards.map(b => ({ id: b.id, title: b.title || "", owner: b.owner_id, expires: b.expires_at, role: "owner" })) });
  }
  if (!user && endpoint === "boards" && method === "POST") return json(guestBoard());
  if (!user) return json({ error: "SESSION_REQUIRED" }, 401);

  if (endpoint === "boards" && method === "POST") {
    const board = await createBoard(user);
    return json(await api(`board/${board.id}`, { method: "GET" }));
  }

  const boardMatch = endpoint.match(/^board\/([^/]+)$/);
  if (boardMatch && method === "GET") {
    const id = boardMatch[1];
    if (id === "guest-board") return json(guestBoard());
    const boards = await rest("boards", `?id=eq.${id}&select=*`);
    if (!boards.length) return json({ error: "NOT_FOUND" }, 404);
    const notes = await rest("notes", `?board_id=eq.${id}&select=*&order=position.asc`);
    const members = await rest("board_members", `?board_id=eq.${id}&select=*`);
    return json(mapBoard(boards[0], notes, members));
  }

  const noteMatch = endpoint.match(/^note\/([^/]+)(?:\/(text|paper|doodle|image|lock|unlock))?$/);
  if (noteMatch && method === "POST") {
    const id = noteMatch[1];
    const kind = noteMatch[2];
    const update = kind === "paper" ? { paper: payload.paper } : kind === "doodle" ? { doodle: payload.doodle } : kind === "image" ? { image_url: payload.url || payload.image?.url || null } : kind === "lock" ? { locked_until: new Date(Date.now() + 45000).toISOString(), editing: user.id } : kind === "unlock" ? { locked_until: null, editing: null } : { text: payload.text, marks: payload.marks || [], revision: (payload.revision || 0) + 1 };
    update.updated_ms = Date.now();
    const rows = await rest("notes", `?id=eq.${id}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(update) });
    return json({ note: mapNote(rows[0]) });
  }

  return json({ ok: true });
}

window.fetch = async (input, init = {}) => {
  const url = new URL(typeof input === "string" ? input : input.url, location.href);
  const parts = url.pathname.split("/").filter(Boolean);
  const apiIndex = parts.indexOf("api");
  if (apiIndex === -1) return originalFetch(input, init);
  const endpoint = parts.slice(apiIndex + 1).join("/");
  try { return await api(endpoint, init); }
  catch (error) { return json({ error: error.body?.message || error.message || "REQUEST_FAILED" }, error.status || 500); }
};
