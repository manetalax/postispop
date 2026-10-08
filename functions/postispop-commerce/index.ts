// Secrets are configured in Supabase, never in GitHub or browser code.
const env=(key:string)=>Deno.env.get(key)||'';
const origin='https://postispop.com';
const cors={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, apikey, content-type','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Vary':'Origin'};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
const ready=()=>Boolean(env('STRIPE_PAYMENTS_ENABLED')==='true'&&liveKey()&&env('STRIPE_WEBHOOK_SECRET')&&env('SUPABASE_SERVICE_ROLE_KEY'));
const legacyProducts=new Set(['pack-rebel','pack-minimal','reloj-recordatorios','postispop-pro']);
const liveKey=()=>/^(?:sk|rk)_live_/.test(env('STRIPE_SECRET_KEY'));
const premiumPlans:Record<string,{price:string;amount:number;mode:'payment'|'subscription'}>={
  'premium-monthly':{price:'price_1UOAAH2RcjC8W03mpwqVv18l',amount:295,mode:'subscription'},
  'premium-quarterly':{price:'price_1UOAAI2RcjC8W03myY2Q0eHI',amount:595,mode:'subscription'},
  'premium-yearly':{price:'price_1UOAAJ2RcjC8W03mIglr3zdS',amount:1995,mode:'subscription'},
  'premium-lifetime':{price:'price_1UOAAI2RcjC8W03mwIps4WqY',amount:5995,mode:'payment'}
};
async function catalogReady() {
  if(!ready())return false;
  try {
    for(const [slug,plan] of Object.entries(premiumPlans)) {
      const price=await stripe('prices/'+encodeURIComponent(plan.price));
      const expectedRecurring=slug==='premium-monthly'?['month',1]:slug==='premium-quarterly'?['month',3]:slug==='premium-yearly'?['year',1]:null;
      if(price.id!==plan.price||price.active!==true||price.unit_amount!==plan.amount||price.currency!=='eur')return false;
      if(expectedRecurring&& (price.type!=='recurring'||price.recurring?.interval!==expectedRecurring[0]||price.recurring?.interval_count!==expectedRecurring[1]))return false;
      if(!expectedRecurring&&price.type!=='one_time')return false;
    }
    return true;
  } catch { return false; }
}
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
  const plan=premiumPlans[slug];
  if(plan) {
    if(session.client_reference_id!==user||session.mode!==plan.mode||session.amount_total!==plan.amount||session.currency!=='eur')throw new Error('PURCHASE_MISMATCH');
    if(plan.mode==='payment') {
      const rows=await stripe('checkout/sessions/'+encodeURIComponent(session.id)+'/line_items');
      if(rows.data?.length!==1||rows.data[0].price?.id!==plan.price)throw new Error('PURCHASE_MISMATCH');
      await db('postispop_licenses?on_conflict=user_id,subject','POST',{user_id:user,subject:'premium',expires_at:null,revoked_at:null,payment_reference:session.id},'resolution=merge-duplicates');
      return true;
    }
    if(!session.subscription)throw new Error('PURCHASE_MISMATCH');
    const sub=await stripe('subscriptions/'+encodeURIComponent(typeof session.subscription==='string'?session.subscription:session.subscription.id));
    await mapSubscription(sub,user,plan);
    if(sub.status==='active'&&Number.isFinite(sub.current_period_end)) await setSubscriptionLicense(sub.id,user,new Date(sub.current_period_end*1000).toISOString());
    return true;
  }
  if(!legacyProducts.has(slug))throw new Error('PURCHASE_ACCOUNT_MISMATCH');
  const products=await db('store_products?slug=eq.'+encodeURIComponent(slug)+'&select=slug,price_cents,currency');
  const product=products?.[0];
  if(!product||session.amount_total!==product.price_cents||session.currency!==product.currency||session.client_reference_id!==user) throw new Error('PURCHASE_MISMATCH');
  // Duplicate Stripe deliveries cannot grant twice or change another account.
  await db('store_entitlements?on_conflict=user_id,product_slug','POST',{user_id:user,product_slug:slug,stripe_session_id:session.id},'resolution=ignore-duplicates');
  return true;
}
async function mapSubscription(sub:any,user:string,plan?:{price:string;amount:number;mode:'payment'|'subscription'}) {
  const item=sub.items?.data?.[0];
  if(!sub.id||!item||sub.items?.data?.length!==1||!user)throw new Error('PURCHASE_MISMATCH');
  const configured=plan||Object.values(premiumPlans).find(p=>p.mode==='subscription'&&p.price===item.price?.id);
  if(!configured||configured.mode!=='subscription'||item.price?.id!==configured.price||item.price?.unit_amount!==configured.amount||item.price?.currency!=='eur')throw new Error('PURCHASE_MISMATCH');
  const existing=await db('postispop_billing_subscriptions?stripe_subscription_id=eq.'+encodeURIComponent(sub.id)+'&select=user_id');
  if(existing?.length&&existing[0].user_id!==user)throw new Error('PURCHASE_ACCOUNT_MISMATCH');
  const customer=typeof sub.customer==='string'?sub.customer:sub.customer?.id;
  if(!customer||!Number.isFinite(sub.current_period_end))throw new Error('PURCHASE_MISMATCH');
  await db('postispop_billing_subscriptions?on_conflict=stripe_subscription_id','POST',{stripe_subscription_id:sub.id,user_id:user,stripe_customer_id:customer,price_id:configured.price,status:sub.status,current_period_end:new Date(sub.current_period_end*1000).toISOString(),cancel_at_period_end:sub.cancel_at_period_end===true,updated_at:new Date().toISOString()},'resolution=merge-duplicates');
}
async function setSubscriptionLicense(subscriptionId:string,user:string,expiresAt:string) {
  await db('postispop_licenses?on_conflict=user_id,subject','POST',{user_id:user,subject:'premium',expires_at:expiresAt,revoked_at:null,payment_reference:subscriptionId},'resolution=merge-duplicates');
}
async function syncSubscription(subscriptionId:string,eventType:string) {
  const mappings=await db('postispop_billing_subscriptions?stripe_subscription_id=eq.'+encodeURIComponent(subscriptionId)+'&select=user_id');
  const mapping=mappings?.[0];if(!mapping)return;
  const sub=await stripe('subscriptions/'+encodeURIComponent(subscriptionId));
  await mapSubscription(sub,mapping.user_id);
  if(eventType==='invoice.paid'&&sub.status==='active'&&Number.isFinite(sub.current_period_end)) await setSubscriptionLicense(sub.id,mapping.user_id,new Date(sub.current_period_end*1000).toISOString());
  if(eventType==='customer.subscription.deleted') await db('postispop_licenses?user_id=eq.'+encodeURIComponent(mapping.user_id)+'&subject=eq.premium','PATCH',{revoked_at:new Date().toISOString(),expires_at:new Date().toISOString()});
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
  if(action==='status'&&req.method==='GET') return reply({checkoutReady:await catalogReady()});
  if(!ready()) return reply({error:'PAYMENTS_NOT_CONFIGURED'},503);
  try {
    if(action==='webhook'&&req.method==='POST') {
      const event=await verifiedEvent(req);
      if(['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type)) await grant(await stripe('checkout/sessions/'+encodeURIComponent(event.data.object.id)));
      if(event.type==='invoice.paid') {
        const invoice=event.data.object,subscriptionId=invoice.parent?.subscription_details?.subscription||invoice.subscription;
        if(subscriptionId)await syncSubscription(typeof subscriptionId==='string'?subscriptionId:subscriptionId.id,'invoice.paid');
      }
      if(event.type==='customer.subscription.deleted')await syncSubscription(event.data.object.id,'customer.subscription.deleted');
      return reply({received:true});
    }
    const authorization=req.headers.get('Authorization')||'';
    if(!authorization.startsWith('Bearer ')) return reply({error:'SESSION_REQUIRED'},401);
    const auth=await fetch(env('SUPABASE_URL')+'/auth/v1/user',{headers:{Authorization:authorization,apikey:env('SUPABASE_ANON_KEY')}});
    if(!auth.ok) return reply({error:'SESSION_REQUIRED'},401);
    const user=await auth.json(),body=req.method==='GET'?{}:await req.json();
    if(action==='portal-status'&&req.method==='GET') {
      const customers=await db('postispop_billing_subscriptions?user_id=eq.'+encodeURIComponent(user.id)+'&select=stripe_subscription_id&status=in.(active,past_due,unpaid)&limit=1');
      return reply({portalReady:customers.length>0});
    }
    if(action==='checkout'&&req.method==='POST') {
      const slug=String(body.slug),plan=premiumPlans[slug];
      if(!plan)return reply({error:'PRODUCT_NOT_FOUND'},404);
      const accessResponse=await fetch(env('SUPABASE_URL')+'/rest/v1/rpc/postispop_access',{method:'POST',headers:{Authorization:authorization,apikey:env('SUPABASE_ANON_KEY'),'Content-Type':'application/json'},body:'{}'});
      if(!accessResponse.ok)throw new Error('DATABASE_ERROR');
      const access=await accessResponse.json();
      if(access.owner||access.premium)return reply({error:'ALREADY_OWNED'},409);
      const products=await db('store_products?active=eq.true&slug=eq.'+encodeURIComponent(slug)+'&select=slug,title,price_cents,currency,stripe_price_id'),p=products?.[0];
      if(!p||p.stripe_price_id!==plan.price||p.price_cents!==plan.amount||p.currency!=='eur')return reply({error:'PRODUCT_NOT_CONFIGURED'},503);
      const owned=await db('store_entitlements?user_id=eq.'+user.id+'&select=product_slug');
      if(owned.some((e:any)=>e.product_slug==='postispop-pro'))return reply({error:'ALREADY_OWNED'},409);
      const form=new URLSearchParams({mode:plan.mode,client_reference_id:user.id,customer_email:user.email,success_url:origin+'/?purchase={CHECKOUT_SESSION_ID}',cancel_url:origin+'/atelier.html?cancelled=1','metadata[postispop_user]':user.id,'metadata[postispop_product]':slug,'line_items[0][price]':plan.price,'line_items[0][quantity]':'1'});
      if(plan.mode==='subscription')form.set('subscription_data[metadata][postispop_user]',user.id);
      const session=await stripe('checkout/sessions',form,'pp-'+user.id+'-'+slug+'-'+Math.floor(Date.now()/60000));
      return reply({url:session.url});
    }
    if(action==='portal'&&req.method==='POST') {
      const customers=await db('postispop_billing_subscriptions?user_id=eq.'+encodeURIComponent(user.id)+'&select=stripe_customer_id&order=updated_at.desc&limit=1');
      const customer=customers?.[0]?.stripe_customer_id;
      if(!customer)return reply({error:'SUBSCRIPTION_NOT_FOUND'},404);
      const portal=await stripe('billing_portal/sessions',new URLSearchParams({customer,return_url:origin+'/atelier.html'}));
      return reply({url:portal.url});
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
