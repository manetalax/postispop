const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const {stripTypeScriptTypes}=require('node:module');
const source=stripTypeScriptTypes(fs.readFileSync('functions/postispop-commerce/index.ts','utf8'));
const plans={
  'premium-monthly':{price:'price_1UOAAH2RcjC8W03mpwqVv18l',amount:295,interval:'month',count:1},
  'premium-quarterly':{price:'price_1UOAAI2RcjC8W03myY2Q0eHI',amount:595,interval:'month',count:3},
  'premium-yearly':{price:'price_1UOAAJ2RcjC8W03mIglr3zdS',amount:1995,interval:'year',count:1},
  'premium-lifetime':{price:'price_1UOAAI2RcjC8W03mwIps4WqY',amount:5995}
};
function setup(configured=true,paid=true) {
  let handle;const writes=[],checkout=[];
  const session={id:'cs_live_123',payment_status:paid?'paid':'unpaid',status:'complete',livemode:true,metadata:{postispop_user:'test-user',postispop_product:'reloj-recordatorios'},client_reference_id:'test-user',amount_total:499,currency:'eur'};
  const values={SUPABASE_URL:'https://example.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-service',SUPABASE_ANON_KEY:'test-anon',...(configured?{STRIPE_PAYMENTS_ENABLED:'true',STRIPE_SECRET_KEY:'sk_live_placeholder',STRIPE_WEBHOOK_SECRET:'test-webhook'}:{})};
  const context=vm.createContext({Response,Request,URL,URLSearchParams,TextEncoder,Uint8Array,crypto,Date,console,Deno:{env:{get:k=>values[k]},serve:f=>handle=f},fetch:async(url,options={})=>{
    if(url.includes('/auth/v1/user'))return Response.json({id:'test-user',email:'test@example.invalid'});
    if(url.includes('/v1/prices/')){const plan=Object.values(plans).find(p=>url.endsWith(p.price));return plan?Response.json({id:plan.price,active:true,unit_amount:plan.amount,currency:'eur',type:plan.interval?'recurring':'one_time',recurring:plan.interval?{interval:plan.interval,interval_count:plan.count}:null}):Response.json({message:'not found'},{status:404});}
    if(url.endsWith('/v1/checkout/sessions')&&options.method==='POST'){checkout.push(new URLSearchParams(options.body));return Response.json({id:'cs_live_checkout',url:'https://checkout.stripe.test/session'});}
    if(url.includes('/v1/checkout/sessions/'))return Response.json(session);
    if(url.includes('/v1/subscriptions/'))return Response.json({id:'sub_1',customer:'cus_1',status:'active',current_period_end:1893456000,items:{data:[{price:{id:plans['premium-monthly'].price,unit_amount:295,currency:'eur'}}]}});
    if(url.includes('/rpc/postispop_access'))return Response.json({owner:false,premium:false});
    if(url.includes('/store_products')){
      const slug=new URL(url).searchParams.get('slug')?.replace('eq.',''),plan=plans[slug];
      if(plan)return Response.json([{slug,title:'Premium',price_cents:plan.amount,currency:'eur',stripe_price_id:plan.price}]);
      return Response.json([{slug:'reloj-recordatorios',price_cents:499,currency:'eur'}]);
    }
    if(url.includes('/store_entitlements')&&options.method==='GET')return Response.json([]);
    if(url.includes('/store_entitlements')&&options.method==='POST'){writes.push(JSON.parse(options.body));return new Response(null,{status:201});}
    if(url.includes('/postispop_billing_subscriptions')&&options.method==='GET')return Response.json([]);
    if(url.includes('/postispop_billing_subscriptions')&&options.method==='POST'){writes.push(JSON.parse(options.body));return new Response(null,{status:201});}
    if(url.includes('/postispop_licenses')&&options.method==='POST'){writes.push(JSON.parse(options.body));return new Response(null,{status:201});}
    throw Error('Unexpected request '+url);
  }});vm.runInContext(source,context);return{call:handle,writes,checkout,session};
}
test('Checkout stays unavailable when Stripe secrets are absent',async()=>{
  const {call}=setup(false);assert.equal((await (await call(new Request('https://example/status'))).json()).checkoutReady,false);
  assert.equal((await call(new Request('https://example/checkout',{method:'POST'}))).status,503);
});
test('Anonymous users cannot checkout',async()=>{const {call}=setup();assert.equal((await call(new Request('https://example/checkout',{method:'POST'}))).status,401);});
test('A verified paid legacy session keeps its existing entitlement',async()=>{
  const {call,writes}=setup();const r=await call(new Request('https://example/reconcile',{method:'POST',headers:{Authorization:'Bearer test'},body:JSON.stringify({session_id:'cs_live_123'})}));
  assert.equal((await r.json()).granted,true);assert.deepEqual(writes,[{user_id:'test-user',product_slug:'reloj-recordatorios',stripe_session_id:'cs_live_123'}]);
});
test('Unpaid checkout never unlocks a purchase',async()=>{const {call,writes}=setup(true,false);await call(new Request('https://example/reconcile',{method:'POST',headers:{Authorization:'Bearer test'},body:JSON.stringify({session_id:'cs_live_123'})}));assert.equal(writes.length,0);});
test('A purchase belonging to another account is refused',async()=>{const {call,writes,session}=setup();session.metadata.postispop_user='other-user';const r=await call(new Request('https://example/reconcile',{method:'POST',headers:{Authorization:'Bearer test'},body:JSON.stringify({session_id:'cs_live_123'})}));assert.equal(r.status,500);assert.equal(writes.length,0);});
test('Wrong price cannot unlock an existing purchase',async()=>{const {call,writes,session}=setup();session.amount_total=299;await call(new Request('https://example/reconcile',{method:'POST',headers:{Authorization:'Bearer test'},body:JSON.stringify({session_id:'cs_live_123'})}));assert.equal(writes.length,0);});
test('Forged webhook signatures cannot grant products',async()=>{const {call,writes}=setup();const r=await call(new Request('https://example/webhook',{method:'POST',headers:{'stripe-signature':'t='+Math.floor(Date.now()/1000)+',v1='+'0'.repeat(64)},body:'{}'}));assert.equal(r.status,400);assert.equal(writes.length,0);});
test('Authenticated annual checkout uses the configured Stripe Price and subscription mode',async()=>{
  const {call,checkout}=setup();const r=await call(new Request('https://example/checkout',{method:'POST',headers:{Authorization:'Bearer test','Content-Type':'application/json'},body:JSON.stringify({slug:'premium-yearly'})}));
  assert.equal(r.status,200);assert.equal((await r.json()).url,'https://checkout.stripe.test/session');assert.equal(checkout.length,1);
  assert.equal(checkout[0].get('mode'),'subscription');assert.equal(checkout[0].get('line_items[0][price]'),plans['premium-yearly'].price);
  assert.equal(checkout[0].get('metadata[postispop_product]'),'premium-yearly');
});
test('Unknown products cannot begin a payment',async()=>{const {call,checkout}=setup();const r=await call(new Request('https://example/checkout',{method:'POST',headers:{Authorization:'Bearer test'},body:JSON.stringify({slug:'theme-100'})}));assert.equal(r.status,404);assert.equal(checkout.length,0);});
test('A live Premium purchase must match its configured price and product',async()=>{const {call,writes,session}=setup();session.metadata.postispop_product='theme-100';const r=await call(new Request('https://example/reconcile',{method:'POST',headers:{Authorization:'Bearer test'},body:JSON.stringify({session_id:'cs_live_123'})}));assert.equal(r.status,500);assert.equal(writes.length,0);});
