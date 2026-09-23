const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const {stripTypeScriptTypes}=require('node:module');
const source=stripTypeScriptTypes(fs.readFileSync('functions/postispop-commerce/index.ts','utf8'));
function setup(configured=true,paid=true) {
  let handle;const writes=[];
  const session={id:'cs_test_123',payment_status:paid?'paid':'unpaid',status:'complete',livemode:false,metadata:{postispop_user:'test-user',postispop_product:'reloj-recordatorios'},client_reference_id:'test-user',amount_total:499,currency:'eur'};
  const values={SUPABASE_URL:'https://example.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-service',SUPABASE_ANON_KEY:'test-anon',...(configured?{STRIPE_SECRET_KEY:'sk_test_placeholder',STRIPE_WEBHOOK_SECRET:'test-webhook'}:{})};
  const context=vm.createContext({Response,Request,URL,URLSearchParams,TextEncoder,Uint8Array,crypto,Date,console,Deno:{env:{get:k=>values[k]},serve:f=>handle=f},fetch:async(url,options={})=>{
    if(url.includes('/auth/v1/user'))return Response.json({id:'test-user',email:'test@example.invalid'});
    if(url.includes('/v1/checkout/sessions/'))return Response.json(session);
    if(url.includes('/store_products'))return Response.json([{slug:'reloj-recordatorios',price_cents:499,currency:'eur'}]);
    if(url.includes('/store_entitlements')&&options.method==='POST'){writes.push(JSON.parse(options.body));return new Response(null,{status:201});}
    throw Error('Unexpected request');
  }});vm.runInContext(source,context);return{call:handle,writes,session};
}
test('Checkout disabled when Stripe secrets are absent',async()=>{
  const {call}=setup(false);assert.equal((await (await call(new Request('https://example/status'))).json()).checkoutReady,false);
  assert.equal((await call(new Request('https://example/checkout',{method:'POST'}))).status,503);
});
test('Anonymous users cannot checkout',async()=>{const {call}=setup();assert.equal((await call(new Request('https://example/checkout',{method:'POST'}))).status,401);});
test('A verified paid session grants the matching account and product',async()=>{
  const {call,writes}=setup();const r=await call(new Request('https://example/reconcile',{method:'POST',headers:{Authorization:'Bearer test'},body:JSON.stringify({session_id:'cs_test_123'})}));
  assert.equal((await r.json()).granted,true);assert.deepEqual(writes,[{user_id:'test-user',product_slug:'reloj-recordatorios',stripe_session_id:'cs_test_123'}]);
});
test('Unpaid checkout never unlocks a purchase',async()=>{const {call,writes}=setup(true,false);await call(new Request('https://example/reconcile',{method:'POST',headers:{Authorization:'Bearer test'},body:JSON.stringify({session_id:'cs_test_123'})}));assert.equal(writes.length,0);});
test('A purchase belonging to another account is refused',async()=>{const {call,writes,session}=setup();session.metadata.postispop_user='other-user';const r=await call(new Request('https://example/reconcile',{method:'POST',headers:{Authorization:'Bearer test'},body:JSON.stringify({session_id:'cs_test_123'})}));assert.equal(r.status,500);assert.equal(writes.length,0);});
test('Wrong price cannot unlock the clock',async()=>{const {call,writes,session}=setup();session.amount_total=299;await call(new Request('https://example/reconcile',{method:'POST',headers:{Authorization:'Bearer test'},body:JSON.stringify({session_id:'cs_test_123'})}));assert.equal(writes.length,0);});
test('Forged webhook signatures cannot grant products',async()=>{const {call,writes}=setup();const r=await call(new Request('https://example/webhook',{method:'POST',headers:{'stripe-signature':'t='+Math.floor(Date.now()/1000)+',v1='+'0'.repeat(64)},body:'{}'}));assert.equal(r.status,400);assert.equal(writes.length,0);});
