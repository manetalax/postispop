// Transport only: keys and plaintext never reach this function.
// A 10 MB logical note can expand during JSON/base64 transport.
// The encrypted server cannot inspect content; apply a bounded transport cap.
export const MAX_SHARE_BODY=14_000_000+28;
const origins=new Set(['https://postispop.com','https://www.postispop.com','https://appassets.androidplatform.net']);
export async function boundedBytes(body,max){
  if(!body)throw Error('EMPTY_BODY');
  const reader=body.getReader(),chunks=[];let size=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw Error('TOO_LARGE');}chunks.push(value);}const out=new Uint8Array(size);let offset=0;for(const c of chunks){out.set(c,offset);offset+=c.length;}return out;}finally{reader.releaseLock();}
}
export function createNoteShareHandler({base,key,fetchImpl=fetch,cryptoImpl=crypto}){
  const headers={apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'};
  const rest=(path,options={})=>fetchImpl(base+'/rest/v1/'+path,{...options,headers:{...headers,...options.headers}});
  const store=(path,options={})=>fetchImpl(base+'/storage/v1/'+path,{...options,headers:{...headers,...options.headers}});
  async function sweep(){
    const response=await rest('postispop_note_shares?expires_at=lte.'+encodeURIComponent(new Date().toISOString())+'&select=token&limit=20');
    if(!response.ok)return;
    const rows=await response.json();
    if(rows.length){
      const removed=await store('object/postispop-note-shares',{method:'DELETE',body:JSON.stringify({prefixes:rows.map(row=>row.token+'.bin')})});
      if(removed.ok)await rest('postispop_note_shares?token=in.('+rows.map(r=>r.token).join(',')+')',{method:'DELETE'});
    }
    await rest('postispop_share_rate?window_start=lt.'+encodeURIComponent(new Date(Date.now()-8*86400000).toISOString()),{method:'DELETE'});
  }
  return async request=>{
    const origin=request.headers.get('origin');const cors=origin&&origins.has(origin)?{'Access-Control-Allow-Origin':origin,Vary:'Origin'}:{};
    const common={...cors,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Type':'application/json'};
    const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:common});
    if(origin&&!origins.has(origin))return reply({error:'ORIGIN_DENIED'},403);
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...cors,'Access-Control-Allow-Headers':'apikey,content-type,authorization','Access-Control-Allow-Methods':'GET,PUT,POST,OPTIONS'}});
    if(!base||!key)return reply({error:'NOT_CONFIGURED'},503);
    const route=new URL(request.url).pathname.split('/').filter(Boolean).at(-1);
    try{
      if(route==='cleanup'&&request.method==='POST'){
        const authorization=request.headers.get('authorization');
        if(authorization!=='Bearer '+key){
          const secret=authorization?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];if(!secret)return reply({error:'FORBIDDEN'},403);
          const digest=Array.from(new Uint8Array(await cryptoImpl.subtle.digest('SHA-256',new TextEncoder().encode(secret))),n=>n.toString(16).padStart(2,'0')).join('');
          const config=await rest('postispop_share_settings?name=eq.cleanup_sha256&select=value');
          if(!config.ok||(await config.json())[0]?.value!==digest)return reply({error:'FORBIDDEN'},403);
        }
        await sweep();return reply({ok:true});
      }
      if(!/^[A-Za-z0-9_-]{43}$/.test(route||''))return reply({error:'INVALID_TOKEN'},400);
      if(request.method==='GET'){
        const r=await rest(`postispop_note_shares?token=eq.${route}&ready=eq.true&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&select=bytes`);
        if(!r.ok)return reply({error:'UNAVAILABLE'},503);
        const rows=await r.json();if(rows.length!==1)return reply({error:'UNAVAILABLE'},404);
        const file=await store('object/authenticated/postispop-note-shares/'+route+'.bin');if(!file.ok)return reply({error:'UNAVAILABLE'},404);
        return new Response(file.body,{headers:{...common,'Content-Type':'application/octet-stream','Content-Length':String(rows[0].bytes)}});
      }
      if(request.method!=='PUT')return reply({error:'METHOD_NOT_ALLOWED'},405);
      if(request.headers.get('content-type')?.split(';')[0]!=='application/octet-stream')return reply({error:'INVALID_TYPE'},415);
      const declared=Number(request.headers.get('content-length')||0);if(declared>MAX_SHARE_BODY)return reply({error:'TOO_LARGE'},413);
      const bytes=await boundedBytes(request.body,MAX_SHARE_BODY);if(bytes.length<29)return reply({error:'INVALID_BODY'},400);
      // Hash the gateway IP with a server-only HMAC key; never retain raw IPs.
      const ip=(request.headers.get('x-forwarded-for')||'unknown').split(',').at(-1).trim();
      const hmac=await cryptoImpl.subtle.importKey('raw',new TextEncoder().encode(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);
      const subject=Array.from(new Uint8Array(await cryptoImpl.subtle.sign('HMAC',hmac,new TextEncoder().encode(ip))),n=>n.toString(16).padStart(2,'0')).join('');
      const reserve=await rest('rpc/postispop_reserve_note_share',{method:'POST',body:JSON.stringify({p_token:route,p_bytes:bytes.length,p_subject:subject})});
      if(!reserve.ok){const error=await reserve.json().catch(()=>({}));return reply({error:/RATE_LIMITED/.test(error.message||'')?'RATE_LIMITED':'UNAVAILABLE'},/RATE_LIMITED/.test(error.message||'')?429:409);}
      const uploaded=await store('object/postispop-note-shares/'+route+'.bin',{method:'POST',headers:{'Content-Type':'application/octet-stream','x-upsert':'false'},body:bytes});
      if(!uploaded.ok)return reply({error:'UPLOAD_FAILED'},503);
      const ready=await rest('postispop_note_shares?token=eq.'+route,{method:'PATCH',body:'{"ready":true}'});if(!ready.ok)return reply({error:'UPLOAD_FAILED'},503);
      // Bounded expiry cleanup also runs on use. Schedule /cleanup daily for idle periods.
      await sweep().catch(()=>{});
      return reply({token:route,expiresInDays:7});
    }catch(error){return reply({error:error.message==='TOO_LARGE'?'TOO_LARGE':'UNAVAILABLE'},error.message==='TOO_LARGE'?413:503);}
  };
}
