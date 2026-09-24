import './supabase-bridge.js?v=5';

const icons={'pack-rebel':'🎨','pack-minimal':'✨','reloj-recordatorios':'⏰','postispop-pro':'🚀'};
const descriptions={'pack-rebel':'Colores intensos y papel con personalidad para tu pizarra.','pack-minimal':'Un acabado limpio, claro y sin distracciones.','reloj-recordatorios':'Programa alarmas en tus notas. Avisos con PostisPop abierto.','postispop-pro':'Incluye los packs Rebel y Minimal y el reloj con alarmas.'};
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const price=p=>new Intl.NumberFormat('es-ES',{style:'currency',currency:p.currency}).format(p.price_cents/100);
let actor=null,access=null,products=[],checkoutReady=false,alarms=[],dialog=null,lastFocus=null,offset=0,audio=null,busy=false,lastSync=0,expiryTimer;

async function api(endpoint,payload) {
  const response=await fetch('/api/'+endpoint,{method:payload===undefined?'GET':'POST',headers:{'Content-Type':'application/json'},body:payload===undefined?undefined:JSON.stringify(payload)});
  const body=await response.json();if(!response.ok) throw Object.assign(new Error(body.error||'REQUEST_FAILED'),{status:response.status});return body;
}
const owned=slug=>Boolean(access?.products?.includes(slug)||access?.products?.includes('postispop-pro'));
const active=()=>owned('reloj-recordatorios')||Boolean(access?.clock_active&&Date.parse(access.trial_expires_at)>Date.now()+offset);
function message(text) {
  let el=document.querySelector('.pp-toast');if(!el){el=document.createElement('p');el.className='pp-toast';el.setAttribute('role','status');document.body.append(el);}
  el.textContent=text;clearTimeout(el.timer);el.timer=setTimeout(()=>el.remove(),7000);
}
function errorText(error) {
  if(error.status===401||error.message==='SESSION_REQUIRED') return 'Inicia sesión para guardar tus alarmas en tu cuenta.';
  if(error.message==='ALREADY_OWNED') return 'Este artículo ya está activado en tu cuenta.';
  if(error.status===403) return 'No tienes acceso a esa nota o la prueba del reloj ha caducado.';
  if(error.message==='PAYMENTS_NOT_CONFIGURED') return 'Las compras todavía no están disponibles. No se ha realizado ningún cobro.';
  return 'No se pudo completar la operación. Conserva esta pantalla e inténtalo de nuevo.';
}
function trialText() {
  if(!actor?.registered) return 'Regístrate y disfruta del reloj gratis durante 30 días. Sin tarjeta ni cobro automático.';
  if(owned('reloj-recordatorios')) return 'Tu reloj está activado en esta cuenta.';
  if(active()) return `Reloj gratis hasta el ${new Date(access.trial_expires_at).toLocaleString('es-ES',{dateStyle:'medium',timeStyle:'short'})}. Después podrás comprarlo; no habrá cargos automáticos.`;
  return 'Tus 30 días gratis han terminado. Compra el reloj para volver a programar y recibir alarmas. Tus notas se conservan.';
}
function closeDialog() {
  if(!dialog)return;dialog.close();dialog.remove();dialog=null;lastFocus?.focus();
}
function showDialog(title,body) {
  closeDialog();lastFocus=document.activeElement;
  dialog=document.createElement('dialog');dialog.className='pp-dialog';
  dialog.setAttribute('aria-labelledby','pp-dialog-title');
  dialog.innerHTML=`<header class="pp-dialog-head"><h2 id="pp-dialog-title">${escape(title)}</h2><button type="button" data-action="close" aria-label="Cerrar">×</button></header>${body}`;
  document.body.append(dialog);dialog.addEventListener('close',()=>{if(dialog&&!dialog.open)closeDialog();});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();}});
  dialog.showModal();dialog.querySelector('button')?.focus();
}
async function sync() {
  const who=await api('session');actor=who.actor;
  if(actor?.registered) {
    access=await api('commerce/status');offset=Date.parse(access.server_now)-Date.now();
    alarms=(await api('commerce/alarms')).alarms;
  } else {access=null;alarms=[];offset=0;}
  lastSync=Date.now();applyPack();renderClock();
  clearTimeout(expiryTimer);
  if(active()&&!owned('reloj-recordatorios')) expiryTimer=setTimeout(()=>{renderClock();noticeExpiry();},Math.min(2147483647,Math.max(100,Date.parse(access.trial_expires_at)-Date.now()-offset+100)));
  noticeExpiry();
}
function noticeExpiry() {
  if(!actor?.registered||!access||active())return;
  const key='pp:clock-expired:'+actor.id+':'+access.trial_expires_at;
  if(localStorage.getItem(key))return;
  message('Han terminado tus 30 días gratis del reloj. Tus notas siguen guardadas. Abre el reloj para ver las opciones.');
  localStorage.setItem(key,'1');
}
function renderClock() {
  const button=document.querySelector('.pp-clock-trigger');if(!button)return;
  button.classList.toggle('pp-clock-pulse',!active());
  button.setAttribute('aria-label',active()?'Reloj: programar una alarma':'Reloj: prueba gratis y compra');
  button.title=active()?'Programar una alarma':'Reloj · 30 días gratis al registrarte';
  button.querySelector('span').textContent=active()?'Mis alarmas':'Reloj';
}
function applyPack() {
  const key=actor?.registered?'pp:pack:'+actor.id:null;
  const selected=key?localStorage.getItem(key):null;
  document.body.dataset.ppPack=selected&&owned(selected)?selected:'';
}
async function shop(focusSlug) {
  showDialog('Papelería · Tienda PostisPop','<p role="status">Cargando productos…</p>');
  const current=dialog;
  try {
    const results=await Promise.all([api('commerce/catalog'),sync()]);
    ({products,checkoutReady}=results[0]);if(dialog!==current)return;
    const items=focusSlug?[...products].sort((a,b)=>(b.slug===focusSlug)-(a.slug===focusSlug)):products;
    current.querySelector('p').outerHTML=`<p class="pp-trial">${escape(trialText())}</p><section class="pp-products" aria-label="Productos">${items.map(p=>{
      const has=owned(p.slug),clock=p.slug==='reloj-recordatorios';
      let action=has?(p.slug.startsWith('pack-')?`<button class="pp-primary" data-action="apply" data-slug="${escape(p.slug)}">Aplicar estilo</button>`:`<button class="pp-primary" data-action="${clock?'alarms':'pro'}">Usar mejora</button>`):!actor?.registered?'<button class="pp-primary" data-action="register">Crear cuenta / Iniciar sesión</button>':checkoutReady?`<button class="pp-primary" data-action="buy" data-slug="${escape(p.slug)}">Comprar · ${price(p)}</button>`:'<button class="pp-primary" disabled>Compra próximamente</button>';
      if(clock&&active()&&!has)action='<button class="pp-primary" data-action="alarms">Usar reloj gratis</button>'+action;
      return `<article class="pp-product"><span class="pp-product-icon" aria-hidden="true">${icons[p.slug]||'🛍️'}</span><h3>${escape(p.title)}</h3><p>${escape(descriptions[p.slug]||p.description)}</p><strong>${has?'Activado en tu cuenta':price(p)}</strong><small>${has?'Disponible al iniciar sesión': 'Pago único · Sin suscripción'}</small>${action}</article>`;
    }).join('')}</section><a class="pp-secondary" href="/tienda/">Explorar el catálogo completo</a>${!checkoutReady?'<p class="pp-muted">Estamos preparando la compra con activación automática. Todavía no se realizan cobros desde esta tienda.</p>':''}<p class="pp-muted">Las alarmas necesitan PostisPop abierto. El navegador puede retrasarlas si el dispositivo está suspendido. No sustituyen avisos críticos.</p>`;
  } catch(error) {if(dialog===current)current.querySelector('p').textContent=errorText(error);}
}
async function clock() {
  try {await sync();if(active())await alarmDialog();else await shop('reloj-recordatorios');} catch(e){message(errorText(e));}
}
async function alarmDialog() {
  if(!active())return shop('reloj-recordatorios');
  showDialog('Mi reloj · Alarmas','<p role="status">Cargando tus notas…</p>');const current=dialog;
  try {
    const me=await api('me'),boards=await Promise.all(me.boards.map(b=>api('board/'+b.id)));
    if(dialog!==current)return;
    const notes=boards.flatMap(b=>b.notes.map((n,i)=>({...n,label:`${b.title||'Pizarra'} · Nota ${i+1}: ${(n.text||'Sin texto').slice(0,70)}`})));
    const upcoming=alarms.filter(a=>!a.delivered_at);
    current.querySelector('p').outerHTML=`<p class="pp-trial">${escape(trialText())}</p><form id="pp-alarm-form"><label>Nota<select name="note_id" required>${notes.map(n=>`<option value="${escape(n.id)}">${escape(n.label)}</option>`).join('')}</select></label><label>Recordatorio<input name="label" maxlength="200" placeholder="¿Qué necesitas recordar?" required></label><label>Fecha y hora<input name="due_at" type="datetime-local" required></label><p class="pp-muted">Hora local de tu dispositivo. Mantén PostisPop abierto y el dispositivo activo para recibir el aviso.</p><button class="pp-primary" type="submit">Guardar alarma</button><button class="pp-secondary" data-action="notifications" type="button">Permitir notificaciones</button><p class="pp-form-status" role="status"></p></form><section class="pp-alarm-list"><h3>Alarmas pendientes</h3>${upcoming.length?upcoming.map(a=>`<article><p><strong>${escape(a.label)}</strong><br><time>${escape(new Date(a.due_at).toLocaleString('es-ES'))}</time></p><button data-action="delete-alarm" data-id="${escape(a.id)}" aria-label="Eliminar alarma ${escape(a.label)}">Eliminar</button></article>`).join(''):'<p>No tienes alarmas pendientes.</p>'}</section>`;
    const date=current.querySelector('[name=due_at]');const min=new Date(Date.now()+60000);date.min=new Date(+min-min.getTimezoneOffset()*60000).toISOString().slice(0,16);
  }catch(e){if(dialog===current)current.querySelector('p').textContent=errorText(e);}
}
async function buy(slug,button) {
  button.disabled=true;
  try {const data=await api('commerce/checkout',{slug});const url=new URL(data.url);if(url.protocol!=='https:'||url.hostname!=='checkout.stripe.com')throw new Error('INVALID_CHECKOUT');location.assign(url.href);}catch(e){button.disabled=false;message(errorText(e));}
}
function register() {
  closeDialog();document.querySelector('.header-auth-signup')?.click();
  if(!document.querySelector('.header-auth-signup'))message('Abre Cuenta en el menú de la pizarra para registrarte.');
}
document.addEventListener('click',async event=>{
  const stationery=event.target.closest('.store-button');
  if(stationery){event.preventDefault();event.stopImmediatePropagation();shop();return;}
  const button=event.target.closest('[data-pp-action],[data-action]');
  if(!button||(!button.hasAttribute('data-pp-action')&&!button.closest('.pp-dialog')))return;
  const action=button.dataset.ppAction||button.dataset.action;
  try {
    if(action==='close')closeDialog();
    if(action==='shop')await shop();
    if(action==='clock'||action==='alarms')await clock();
    if(action==='register')register();
    if(action==='buy')await buy(button.dataset.slug,button);
    if(action==='apply'){if(!owned(button.dataset.slug))return;localStorage.setItem('pp:pack:'+actor.id,button.dataset.slug);applyPack();message('Estilo aplicado a tu pizarra.');}
    if(action==='pro')showDialog('PostisPop Pro', '<p>Todos tus artículos están activados.</p><button class="pp-primary" data-action="alarms">Programar alarmas</button><button class="pp-secondary" data-action="apply" data-slug="pack-rebel">Aplicar Rebel</button><button class="pp-secondary" data-action="apply" data-slug="pack-minimal">Aplicar Minimal</button>');
    if(action==='delete-alarm'){button.disabled=true;await api('commerce/alarms',{action:'delete',id:button.dataset.id});await sync();await alarmDialog();}
    if(action==='notifications'){if(!('Notification' in window))message('Este navegador no admite notificaciones. Verás el aviso dentro de PostisPop.');else message((await Notification.requestPermission())==='granted'?'Notificaciones permitidas mientras PostisPop esté abierto.':'Verás el aviso dentro de PostisPop.');}
  }catch(e){message(errorText(e));}
},true);
document.addEventListener('submit',async event=>{
  if(event.target.id!=='pp-alarm-form')return;event.preventDefault();
  const form=event.target,button=form.querySelector('[type=submit]'),status=form.querySelector('[role=status]');
  if(button.disabled)return;button.disabled=true;
  try {
    const data=new FormData(form),due=new Date(data.get('due_at'));
    if(!Number.isFinite(+due)||+due<=Date.now()+offset)throw new Error('INVALID_DATE');
    if(!owned('reloj-recordatorios')&&+due>=Date.parse(access.trial_expires_at)){status.textContent='La alarma debe ser anterior al final de tu prueba gratuita.';return;}
    if(!audio&&window.AudioContext)audio=new AudioContext();await audio?.resume();
    await api('commerce/alarms',{note_id:data.get('note_id'),label:String(data.get('label')).trim(),due_at:due.toISOString()});
    await sync();await alarmDialog();message('Alarma guardada en tu cuenta. Mantén PostisPop abierto para recibirla.');
  }catch(e){status.textContent=e.message==='INVALID_DATE'?'Elige una fecha y hora futuras.':errorText(e);}finally{button.disabled=false;}
});
function ring(alarm) {
  const banner=document.createElement('section');banner.className='pp-alarm-alert';banner.setAttribute('role','alert');
  const title=document.createElement('strong');title.textContent='⏰ '+alarm.label;banner.append(title);
  const button=document.createElement('button');button.textContent='Entendido';button.onclick=()=>banner.remove();banner.append(button);document.body.append(banner);
  if(audio?.state==='running'){const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.connect(gain);gain.connect(audio.destination);oscillator.frequency.value=880;gain.gain.value=.15;oscillator.start();gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+1);oscillator.stop(audio.currentTime+1);}
  if('Notification' in window&&Notification.permission==='granted'){try{new Notification('PostisPop · Alarma',{body:alarm.label,tag:alarm.id,icon:'/favicon.svg'});}catch{}}
}
async function tick() {
  if(busy)return;busy=true;
  try {
    if(Date.now()-lastSync>30000)await sync();
    if(!active())return;
    for(const alarm of alarms.filter(a=>!a.delivered_at&&Date.parse(a.due_at)<=Date.now()+offset)) {
      const result=await api('commerce/alarms',{action:'ack',id:alarm.id});
      if(result.claimed){alarm.delivered_at=new Date().toISOString();ring(alarm);}
    }
  }catch{}finally{busy=false;}
}
function mount() {
  const seoTitle='Bloc de notas online y pizarra virtual | PostisPop';
  const retainTitle=()=>{if(document.title!==seoTitle)document.title=seoTitle;};
  retainTitle();
  new MutationObserver(retainTitle).observe(document.head,{childList:true,subtree:true,characterData:true});
  const dock=document.createElement('nav');dock.className='pp-commerce-dock';dock.setAttribute('aria-label','Tienda y recordatorios');
  dock.innerHTML='<button class="pp-clock-trigger pp-clock-pulse" data-pp-action="clock"><svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="17" r="11" fill="white" stroke="currentColor" stroke-width="3"/><path d="M16 10v7l5 3M5 5l-3 4M27 5l3 4M8 27l-2 3M24 27l2 3" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg><span>Reloj</span></button><button class="pp-shop-trigger" data-pp-action="shop">Tienda</button>';
  document.body.append(dock);sync().catch(()=>{});setInterval(tick,1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){lastSync=0;tick();}});
  window.addEventListener('focus',()=>{lastSync=0;tick();});window.addEventListener('storage',()=>{lastSync=0;tick();});
  const params=new URLSearchParams(location.search);
  if(params.has('purchase')) {
    api('commerce/reconcile',{session_id:params.get('purchase')}).then(async result=>{if(result.granted){await sync();message('Compra confirmada. Tu mejora ya está activada.');}else message('El pago está pendiente de confirmación. Tu mejora se activará cuando se confirme.');}).catch(e=>message(errorText(e)));
  } else if(params.has('shop'))shop(params.get('item') || undefined);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
