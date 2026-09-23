// Secrets are configured in Supabase, never in GitHub or browser code.
const env=(key:string)=>Deno.env.get(key)||'';
const origin='https://postispop.com';
const cors={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, apikey, content-type','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Vary':'Origin'};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
const ready=()=>Boolean(env('STRIPE_PAYMENTS_ENABLED')==='true'&&env('STRIPE_SECRET_KEY')&&env('STRIPE_WEBHOOK_SECRET'));
const liveKey=()=>/^(?:sk|rk)_live_/.test(env('STRIPE_SECRET_KEY'));
async function db(path:string,method='GET',body?:unknown,prefer='') {
  const response=await fetch(env('SUPABASE_URL')+'/rest/v1/'+path,{method,headers:{apikey:env('SUPABASE_SERVICE_ROLE_KEY'),Authorization:'Bearer '+env('SUPABASE_SERVICE_ROLE_KEY'),'Content-Type':'application/json',...(prefer?{Prefer:prefer}:{})},body:body?JSON.stringify(body):undefined});
  if(!response.ok) throw new Error('DATABASE_ERROR');
  const text=await response.text();return text?JSON.parse(text):null;
}
async function stripe(path:string,body?:URLSearchParams,key?:string) {
  const response=await fetch('https://api.stripe.com/v1/'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+env('STRIPE_SECRET_KEY'),...(body?{'Content-Type':'application/x-www-form-urlencoded'}:{}),...(key?{'Idempotency-Key':key}:{})},body});
  const data=await response.json();if(!response.ok) throw new Error('PAYMENT_PROVIDER_ERROR');return data;
}
async function grant(session:any,expectedUser?:string) {
  if(session.payment_status!=='paid'||session.status!=='complete') return false;
  const user=session.metadata?.postispop_user,slug=session.metadata?.postispop_product;
  if(!user||!slug||(expectedUser&&user!==expectedUser)) throw new Error('PURCHASE_ACCOUNT_MISMATCH');
  if(session.livemode!==liveKey()) throw new Error('PAYMENT_MODE_MISMATCH');
  const products=await db('store_products?slug=eq.'+encodeURIComponent(slug)+'&select=slug,price_cents,currency');
  const product=products?.[0];
  if(!product||session.amount_total!==product.price_cents||session.currency!==product.currency||session.client_reference_id!==user) throw new Error('PURCHASE_MISMATCH');
  // Duplicate Stripe deliveries cannot grant twice or change another account.
  await db('store_entitlements?on_conflict=user_id,product_slug','POST',{user_id:user,product_slug:slug,stripe_session_id:session.id},'resolution=ignore-duplicates');
  return true;
}
async function verifiedEvent(req:Request) {
  const raw=await req.text();if(raw.length>1000000) throw new Error('INVALID_WEBHOOK');
  const signature=req.headers.get('stripe-signature')||'';
  const parts=signature.split(',').map(p=>p.split('=')),time=parts.find(p=>p[0]==='t')?.[1];
  if(!time||Math.abs(Date.now()/1000-Number(time))>300) throw new Error('INVALID_WEBHOOK');
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env('STRIPE_WEBHOOK_SECRET')),{name:'HMAC',hash:'SHA-256'},false,['verify']);
  let valid=false;
  for(const [kind,hex] of parts) if(kind==='v1'&&/^[a-f0-9]{64}$/.test(hex)) {
    const bytes=Uint8Array.from(hex.match(/../g)!,v=>parseInt(v,16));
    valid=valid||await crypto.subtle.verify('HMAC',key,bytes,new TextEncoder().encode(time+'.'+raw));
  }
  if(!valid) throw new Error('INVALID_WEBHOOK');return JSON.parse(raw);
}
Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS') return new Response(null,{status:204,headers:cors});
  const action=new URL(req.url).pathname.split('/').pop();
  if(action==='status'&&req.method==='GET') return reply({checkoutReady:ready()});
  if(!ready()) return reply({error:'PAYMENTS_NOT_CONFIGURED'},503);
  try {
    if(action==='webhook'&&req.method==='POST') {
      const event=await verifiedEvent(req);
      if(['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type)) await grant(await stripe('checkout/sessions/'+encodeURIComponent(event.data.object.id)));
      return reply({received:true});
    }
    const authorization=req.headers.get('Authorization')||'';
    if(!authorization.startsWith('Bearer ')) return reply({error:'SESSION_REQUIRED'},401);
    const auth=await fetch(env('SUPABASE_URL')+'/auth/v1/user',{headers:{Authorization:authorization,apikey:env('SUPABASE_ANON_KEY')}});
    if(!auth.ok) return reply({error:'SESSION_REQUIRED'},401);
    const user=await auth.json(),body=await req.json();
    if(action==='checkout'&&req.method==='POST') {
      const products=await db('store_products?active=eq.true&slug=eq.'+encodeURIComponent(String(body.slug))+'&select=*'),p=products?.[0];
      if(!p) return reply({error:'PRODUCT_NOT_FOUND'},404);
      const owned=await db('store_entitlements?user_id=eq.'+user.id+'&select=product_slug');
      if(owned.some((e:any)=>e.product_slug===p.slug||e.product_slug==='postispop-pro')) return reply({error:'ALREADY_OWNED'},409);
      const form=new URLSearchParams({mode:'payment',client_reference_id:user.id,customer_email:user.email,success_url:origin+'/?purchase={CHECKOUT_SESSION_ID}',cancel_url:origin+'/?shop=1','metadata[postispop_user]':user.id,'metadata[postispop_product]':p.slug,'line_items[0][price_data][currency]':p.currency,'line_items[0][price_data][unit_amount]':String(p.price_cents),'line_items[0][price_data][product_data][name]':p.title,'line_items[0][quantity]':'1'});
      const session=await stripe('checkout/sessions',form,'pp-'+user.id+'-'+p.slug+'-'+Math.floor(Date.now()/60000));
      return reply({url:session.url});
    }
    if(action==='reconcile'&&req.method==='POST') {
      if(!/^cs_(live|test)_[A-Za-z0-9]+$/.test(body.session_id)) return reply({error:'INVALID_SESSION'},400);
      return reply({granted:await grant(await stripe('checkout/sessions/'+encodeURIComponent(body.session_id)),user.id)});
    }
    return reply({error:'NOT_FOUND'},404);
  } catch(error) {
    const code=error instanceof Error?error.message:'REQUEST_FAILED';
    return reply({error:code},code==='INVALID_WEBHOOK'?400:500);
  }
});
