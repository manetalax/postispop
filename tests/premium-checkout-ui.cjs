/* Isolated purchase journey; Stripe and authentication are fixtures, never real charges. */
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {browserOptions}=require('./browser-options.cjs');
const {isolatedContext,ready}=require('./notes-first-ui.cjs');
const langs=['es','en','de','fr','pt','it','ja','ko'];
const plans=['premium-monthly','premium-quarterly','premium-yearly','premium-lifetime'];
(async()=>{const browser=await chromium.launch(browserOptions());try{for(const width of [390,1366])for(const lang of langs){
 const {context}=await isolatedContext(browser,{width,height:900});const user={id:'00000000-0000-4000-8000-000000000001',email:'purchase-fixture@example.invalid'};let signedIn=false;const requests=[];
 const json=(r,data,status=200)=>r.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
 await context.route('**/functions/v1/postispop-commerce/status',r=>json(r,{checkoutReady:true}));
 await context.route('**/rest/v1/rpc/postispop_access',r=>json(r,{owner:false,premium:false}));
 await context.route('**/auth/v1/user',r=>json(r,user));
 await context.route('**/auth/v1/token?grant_type=password',r=>{signedIn=true;return json(r,{access_token:'test-token-not-real',refresh_token:'test-refresh-not-real',expires_at:Math.floor(Date.now()/1000)+3600,user});});
 await context.route('**/functions/v1/postispop-commerce/portal-status',r=>json(r,{portalReady:false}));
 await context.route('**/functions/v1/postispop-commerce/checkout',r=>{assert.ok(signedIn);requests.push(r.request().postDataJSON());return json(r,{url:'https://checkout.stripe.test/fixture'});});
 await context.route('https://checkout.stripe.test/**',r=>r.fulfill({contentType:'text/html',body:'<h1>Stripe fixture checkout</h1>'}));
 const page=await context.newPage();const plan=plans[langs.indexOf(lang)%4];
 await page.goto('https://postispop.com/atelier.html?lang='+lang);
 await page.waitForFunction(()=>[...document.querySelectorAll('[data-buy]')].every(n=>!n.disabled));
 assert.equal(await page.locator('[data-buy][data-requires-auth="true"]').count(),4);assert.equal(requests.length,0);
 await page.locator(`[data-buy="${plan}"]`).click();await page.waitForURL('**/?lang='+lang+'&premium_login=1&plan='+plan);await ready(page);
 await page.locator('input[type=password]').waitFor();assert.equal(requests.length,0,'Sign in does not charge');
 await page.locator('input[type=email]').fill(user.email);await page.locator('input[type=password]').fill('fixture-password-not-real');
 await page.locator('input[type=password]').press('Enter');
 await page.waitForURL('**/atelier.html?lang='+lang+'&plan='+plan);await page.waitForFunction(()=>[...document.querySelectorAll('[data-buy]')].every(n=>!n.disabled&&n.dataset.requiresAuth!=='true'));
 assert.equal(requests.length,0,'Returning from sign in does not automatically begin a charge');
 await page.locator(`[data-buy="${plan}"]`).click();await page.waitForURL('https://checkout.stripe.test/fixture');assert.deepEqual(requests,[{slug:plan,lang}]);
 console.log(`PASS ${lang} ${width}px ${plan}: sign in, return, explicit checkout`);await context.close();
}
for(const width of [320,390,1366])for(const lang of langs){
 const {context}=await isolatedContext(browser,{width,height:900});let state='guest';let checkoutCalls=0;
 const user={id:'00000000-0000-4000-8000-000000000002',email:'palette-fixture@example.invalid'};
 const json=(r,data,status=200)=>r.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
 await context.route('**/functions/v1/postispop-commerce/status',r=>json(r,{checkoutReady:state!=='off'}));
 await context.route('**/auth/v1/user',r=>json(r,user));
 await context.route('**/rest/v1/rpc/postispop_access',r=>json(r,{owner:false,premium:state==='owned'}));
 await context.route('**/functions/v1/postispop-commerce/portal-status',r=>json(r,{portalReady:state==='owned'}));
 await context.route('**/functions/v1/postispop-commerce/checkout',r=>{checkoutCalls++;return json(r,{error:'PAYMENT_PROVIDER_ERROR'},503);});
 const page=await context.newPage();
 for(state of ['guest','registered','owned','off']){
  await page.goto('https://postispop.com/atelier.html?lang='+lang+'&plan=premium-yearly');
  if(state!=='guest'){await page.evaluate(user=>localStorage.setItem('postispop-supabase-session',JSON.stringify({access_token:'fixture-not-real',expires_at:Math.floor(Date.now()/1000)+3600,user})),user);await page.reload();}
  await page.waitForFunction(state=>{const buttons=[...document.querySelectorAll('[data-buy]')],badge=document.querySelector('[data-premium-state]');return buttons.length===4&& (state==='off'?badge.textContent===document.querySelector('[data-purchase-status]').textContent&&buttons.every(n=>n.disabled):state==='owned'?buttons.every(n=>n.disabled&&n.textContent===badge.textContent):buttons.every(n=>!n.disabled));},state);
  if(state==='owned')assert.equal(await page.locator('[data-portal]').isVisible(),true,'Subscribers can manage their plan');
  if(state==='registered'){await page.locator('[data-buy="premium-yearly"]').click();await page.waitForFunction(()=>!document.querySelector('[data-buy="premium-yearly"]').disabled);}
  for(const theme of ['forest','cinnamon','sage','ocean','lavender','terracotta','graphite','midnight','rose','sand']){
   await page.evaluate(theme=>{localStorage.setItem('postispop-interface-theme',theme);window.dispatchEvent(new StorageEvent('storage',{key:'postispop-interface-theme',newValue:theme}));},theme);
   const result=await page.evaluate(()=>{const paper=getComputedStyle(document.querySelector('.premium-plan')).backgroundColor;const nodes=[...document.querySelectorAll('[data-buy],[data-purchase-status],[data-premium-state],[data-portal]:not([hidden]),.payment-option h3,.payment-option .price,.payment-option .period,.plan-summary,.plan-detail,.plan-footnote,.payment-disclosure,.premium-benefits li,.pricing-questions details p,footer')];return{overflow:document.documentElement.scrollWidth>innerWidth+1,controls:nodes.map(n=>{const s=getComputedStyle(n);return{color:s.color,bg:s.backgroundColor==='rgba(0, 0, 0, 0)'?paper:s.backgroundColor,text:n.textContent,cut:n.getBoundingClientRect().height>0&&(n.scrollWidth>n.clientWidth+1||n.scrollHeight>n.clientHeight+1)};}),outline:getComputedStyle(document.querySelector('.payment-option[data-selected="true"]')).outlineColor,paper};});
   assert.equal(result.overflow,false,`${lang}/${theme}/${width}/${state} page overflow`);
   for(const c of result.controls){assert.ok(contrast(c.color,c.bg)>=4.5,`${lang}/${theme}/${width}/${state}: ${c.text} contrast ${contrast(c.color,c.bg)}`);assert.equal(c.cut,false,`${lang}/${theme}/${width}/${state}: clipped ${c.text}`);}
   assert.ok(contrast(result.outline,result.paper)>=3,'Chosen plan remains visible');
  }
 }
 assert.equal(checkoutCalls,1,'Guest, owned and unavailable states do not create payments');console.log(`PASS visibility ${lang} ${width}px: 10 palettes, guest, signed-in error, subscriber, unavailable`);await context.close();
}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

function contrast(a,b){const l=c=>{const v=c.match(/[\d.]+/g).slice(0,3).map(Number).map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;});return v[0]*.2126+v[1]*.7152+v[2]*.0722;};const x=l(a),y=l(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
