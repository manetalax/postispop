import {designs, fonts, instruments, papers, palettes, packs, catalogCoverage, designTemplates, boardSvg, paperSvg, svgUrl} from './design-catalog.js';
import './supabase-bridge.js?v=6';
import {drawStrokes,readableInk,paperColor} from './style-model.js';

const $ = selector => document.querySelector(selector);
const fold = value => String(value).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es');
const pageSize = 18;
let visibleCount = pageSize;
let rights = null;
let signedIn = false;
let dialog = null;
let activeDesign = null;
let selectedTool = 'fonts';

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

async function api(endpoint, payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch('/api/' + endpoint, {
      method: payload === undefined ? 'GET' : 'POST',
      headers: {'Content-Type': 'application/json'},
      body: payload === undefined ? undefined : JSON.stringify(payload),
      signal: controller.signal
    });
    const data = await response.json();
    if (!response.ok) throw Object.assign(new Error(data.error || 'UNAVAILABLE'), {status: response.status});
    return data;
  } finally { clearTimeout(timer); }
}

const cart = new Map();
const euros = cents => new Intl.NumberFormat('es-ES', {style:'currency',currency:'EUR'}).format(cents/100);
function renderCart() {
  const list = $('#at-cart-items');
  list.replaceChildren();
  for (const [id, item] of cart) {
    const row=node('article','at-cart-row');
    const remove=node('button','','Quitar '+item.title);
    remove.type='button'; remove.onclick=()=>{cart.delete(id);renderCart();};
    row.append(node('span','',item.title+' · '+euros(item.cents)),remove);list.append(row);
  }
  if(!cart.size)list.append(node('p','','Tu carrito está vacío. Explora las pizarras y los instrumentos para elegir.'));
  $('#at-cart-total').textContent='Total: '+euros([...cart.values()].reduce((sum,item)=>sum+item.cents,0));
  $('#at-cart-link').textContent='Carrito · '+cart.size;
  document.querySelectorAll('[data-cart-id]').forEach(button=>{
    const selected=cart.has(button.dataset.cartId);
    button.textContent=selected?'En el carrito':'Añadir · 0,95 €';
    button.setAttribute('aria-pressed',String(selected));
  });
}
function cartButton(id,title) {
  const button=node('button','at-cart-add',cart.has(id)?'En el carrito':'Añadir · 0,95 €');
  button.type='button';
  button.dataset.cartId=id;
  button.setAttribute('aria-pressed',String(cart.has(id)));
  button.onclick=()=>{cart.set(id,{title,cents:95});renderCart();};
  return button;
}
function shopSection() {
  const anchor=location.hash.slice(1);
  if(anchor==='premios'||anchor==='probabilidades'){location.replace('/premios.html');return;}
  const section=anchor==='probabilidades'?'premios':anchor||'colecciones';
  const groups={colecciones:['#colecciones','.at-pack-section'],herramientas:['#herramientas'],planes:['#planes'],carrito:['#carrito']};
  const selected=groups[section]?section:'colecciones';
  if(anchor==='probabilidades')requestAnimationFrame(()=>{const target=document.getElementById('probabilidades');target?.scrollIntoView({block:'start'});target?.focus({preventScroll:true});});
  for(const [id,selectors] of Object.entries(groups))for(const selector of selectors)$(selector).hidden=id!==selected;
  for(const link of document.querySelectorAll('.at-shop-nav a')) {
    if(link.hash==='#'+selected)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
  }
}
window.addEventListener('hashchange',shopSection);

const owns = design => Boolean(rights?.owner || rights?.premium || rights?.unlocked?.includes(design.id));

function boardImage(design, className = '') {
  const frame = node('div', 'at-board-image ' + className);
  const img = node('img');
  img.src = svgUrl(boardSvg(design, {preview: true}));
  img.alt = `${design.title}: ${design.details.join(', ')}. Vista previa con seis notas.`;
  img.width = 720;
  img.height = 500;
  img.loading = 'lazy';
  img.decoding = 'async';
  frame.append(img);
  return frame;
}

function renderGrid() {
  const query = fold($('#at-search').value.trim());
  const category = $('#at-category').value;
  const access = $('#at-access').value;
  const pack = packs.find(item=>item.id===$('#at-pack').value);
  const edition = $('#at-edition').value;
  const matches = designs.filter(design =>
    (!category || category === design.category) &&
    (!pack || pack.designIds.includes(design.id)) &&
    (!edition || design.edition === edition) &&
    (!access || (access === 'owned' ? owns(design) : design.tier === access)) &&
    (!query || fold([design.title, design.category, ...(design.searchTerms||[]), ...design.details].join(' ')).includes(query))
  );
  const fragment = document.createDocumentFragment();
  for (const design of matches.slice(0, visibleCount)) {
    const card = node('article', 'at-card');
    card.dataset.designId = design.id;
    const preview = node('button', 'at-card-preview');
    preview.type = 'button';
    preview.setAttribute('aria-label', 'Ver ' + design.title);
    preview.append(boardImage(design));
    preview.addEventListener('click', () => showPreview(design));
    const heading = node('div', 'at-card-head');
    const title = node('h3', '', design.title);
    const badge = node('span', 'at-tag ' + design.tier,
      owns(design) ? 'Tu colección' : design.tier === 'reward' ? 'Recompensa' : 'Premium');
    heading.append(title, badge);
    const link = node('button', 'at-preview-link', 'Ver la pizarra completa');
    link.type = 'button';
    link.setAttribute('aria-label', 'Ampliar ' + design.title);
    link.addEventListener('click', () => showPreview(design));
    card.append(preview, heading, node('p', '', design.details.join(' · ')), node('span','at-edition',design.edition==='crafted'?'Composición y papelería propias':'Edición inicial'), link);
    if(!owns(design)&&design.tier!=='reward')card.append(cartButton('design:'+design.id,design.title));
    fragment.append(card);
  }
  if (!matches.length) fragment.append(node('p', 'at-empty', access === 'owned' && !signedIn
    ? 'Inicia sesión para ver tus colecciones.'
    : 'No hay colecciones con esos filtros. Prueba otro tema o país.'));
  $('#at-grid').replaceChildren(fragment);
  $('#at-count').textContent = `${matches.length} ${matches.length === 1 ? 'colección' : 'colecciones'} · ${Math.min(visibleCount, matches.length)} visibles`;
  $('#at-more').hidden = visibleCount >= matches.length;
}

function openDialog(title) {
  dialog?.close();
  const focus = document.activeElement;
  const current = node('dialog', 'at-preview');
  const header = node('header');
  const heading = node('h2', '', title);
  heading.id = 'at-dialog-title';
  current.setAttribute('aria-labelledby', heading.id);
  const close = node('button', '', '×');
  close.type = 'button';
  close.setAttribute('aria-label', 'Cerrar vista previa');
  close.addEventListener('click', () => current.close());
  header.append(heading, close);
  current.append(header);
  current.addEventListener('close', () => {
    current.remove();
    if (dialog === current) { dialog = null; activeDesign = null; }
    if (focus?.isConnected) focus.focus();
  });
  current.addEventListener('click', event => {
    if (event.target !== current) return;
    const rect = current.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) current.close();
  });
  dialog = current;
  document.body.append(current);
  return current;
}

function renderActions(design, target) {
  target.replaceChildren();
  const action = node('button', 'at-primary');
  action.type = 'button';
  const help = node('p', 'at-preview-status');
  help.setAttribute('role', 'status');
  if (owns(design)) {
    action.textContent = rights.selected === design.id ? 'Seleccionada en tu cuenta' : 'Elegir esta pizarra';
    action.disabled = rights.selected === design.id;
    action.addEventListener('click', async () => {
      action.disabled = true;
      try {
        rights = await api('designs/select', {design_id: design.id});
        renderActions(design, target);
        window.dispatchEvent(new CustomEvent('postispop:design-selected',{detail:{designId:design.id}}));
      } catch { help.textContent = 'No se pudo guardar la selección. Vuelve a intentarlo con conexión.'; action.disabled = false; }
    });
    help.textContent = 'La selección y sus papeles se aplican al volver a tu pizarra. Tus notas conservan su contenido.';
  } else if (design.tier === 'reward' && rights?.credits > 0) {
    action.textContent = 'Desbloquear con 1 elección';
    action.addEventListener('click', async () => {
      action.disabled = true;
      try {
        rights = await api('designs/claim', {design_id: design.id});
        renderProgress(); renderGrid(); renderActions(design, target);
      } catch { help.textContent = 'No se pudo confirmar el desbloqueo. Consulta tu progreso antes de reintentarlo.'; action.disabled = false; }
    });
    help.textContent = `Tienes ${rights.credits} elecciones disponibles. Tú decides qué colección conseguir.`;
  } else {
    action.textContent = !signedIn ? 'Acceder a mi cuenta' : design.tier === 'reward' ? 'Sigue completando tus cinco días' : 'Compra aún no disponible';
    action.disabled = signedIn;
    if (!signedIn) action.addEventListener('click', () => { location.href = '/?account=1'; });
    help.textContent = design.tier === 'reward'
      ? 'Al completar cinco días consecutivos, podrás elegir una colección de recompensa.'
      : 'Incluida en el nuevo Premium. También se preparan compras individuales; todavía no se realizan cobros.';
  }
  target.append(action, help);
  if (owns(design)) { const back=node('a','','Abrir mi pizarra'); back.href='/'; target.append(back); }
}

function showPreview(design) {
  const current = openDialog(design.title);
  activeDesign = design;
  const artwork=boardImage(design);
  const trial=node('button','at-preview-link','Probar en una nota temporal');trial.type='button';trial.addEventListener('click',()=>{if(!current.querySelector('.at-trial-note')){const note=trialNote(current,design.paper);current.append(note);note.scrollIntoView({block:'nearest'});}});current.append(trial);
  const zoom=node('button','at-preview-link','Acercar papel y adornos');zoom.type='button';zoom.setAttribute('aria-pressed','false');
  zoom.addEventListener('click',()=>{const enlarged=artwork.classList.toggle('at-zoomed');zoom.setAttribute('aria-pressed',String(enlarged));zoom.textContent=enlarged?'Ver el conjunto completo':'Acercar papel y adornos';artwork.tabIndex=enlarged?0:-1;artwork.setAttribute('aria-label',enlarged?'Vista ampliada; desplaza horizontalmente para inspeccionar la pizarra':'Vista completa de la pizarra');});
  current.append(artwork,zoom,node('p', '', design.details.join(' · ')));
  if(design.kind==='country'){
    current.append(node('p','at-coverage-note',design.edition==='crafted'?'Edición cultural: un lugar y una propuesta gastronómica ilustrados con referencias verificadas. Es una selección creativa, no una representación completa de la población.':'Edición en desarrollo: incluye bandera, silueta ornamental y papelería de viaje. Los detalles culturales disponibles se muestran en esta vista; seguimos ampliando los restantes.'));
    const references=node('div','at-cultural-references');
    for(const [label,item]of [['Conocer el lugar',design.landmark],['Conocer la tradición gastronómica',design.food]])if(item?.source&&/^https:\/\//.test(item.source)){const link=node('a','',label);link.href=item.source;link.target='_blank';link.rel='noopener noreferrer';references.append(link);}
    if(references.children.length)current.append(references);
  }
  else if(design.edition!=='crafted') current.append(node('p','at-coverage-note','Edición inicial con icono temático y papelería coordinada. Seguimos ampliando sus ilustraciones.'));
  if(design.culturalNote) current.append(node('p','at-coverage-note',design.culturalNote));
  const paperStrip = node('div', 'at-preview-materials');
  const sample = node('img');
  sample.src = svgUrl(paperSvg(design.paper));
  sample.alt = 'Papel coordinado: ' + papers.find(paper => paper.id === design.paper)?.name;
  paperStrip.append(sample, node('p', '', 'El fondo y el papel de esta muestra son los mismos recursos que se aplican a tus notas. Los textos son ejemplos; elegir una colección no sustituye tus apuntes.'));
  if(design.id==='theme-066') paperStrip.append(node('p','at-footnote','La hoja de consulta es papelería para apuntes personales. No es un documento clínico ni una receta médica.'));
  const examples=node('details','at-note-examples'); examples.append(node('summary','','Ideas para organizar esta pizarra'));
  const copyStatus=node('p','at-copy-status');copyStatus.setAttribute('role','status');
  const copy=async(text)=>{
    try{await navigator.clipboard.writeText(text);copyStatus.textContent='Plantilla copiada. Pégala en la nota que elijas.';}
    catch{const field=node('textarea','at-copy-fallback');field.value=text;field.readOnly=true;field.setAttribute('aria-label','Texto de la plantilla para copiar');examples.querySelector('.at-copy-fallback')?.remove();examples.append(field);field.focus();field.select();copyStatus.textContent='Selecciona y copia este texto para pegarlo en tu nota.';}
  };
  const list=node('ul');for(const example of designTemplates(design)){
    const row=node('li');row.append(node('strong','',example.title),node('p','',example.body));
    const button=node('button','at-preview-link','Copiar esta nota');button.type='button';button.setAttribute('aria-label','Copiar '+example.title);button.addEventListener('click',()=>copy(example.title+'\n'+example.body));row.append(button);list.append(row);
  }
  const copyAll=node('button','at-preview-link','Copiar las seis ideas');copyAll.type='button';copyAll.addEventListener('click',()=>copy(designTemplates(design).map(n=>n.title+'\n'+n.body).join('\n\n')));
  examples.append(list,copyAll,copyStatus);current.append(examples);
  current.append(paperStrip);
  const actions = node('div', 'at-preview-actions');
  current.append(actions);
  renderActions(design, actions);
  current.showModal();
}

function renderProgress() {
  $('#at-owner-link').hidden = !rights?.owner;
  if(!$('#at-days'))return;
  const days = document.createDocumentFragment();
  for (let day = 1; day <= 5; day++) {
    const done = day <= Number(rights?.streak || 0);
    const badge = node('span', done ? 'done' : '', done ? '✓' : String(day));
    badge.setAttribute('aria-label', `Día ${day}${done ? ', completado' : ', pendiente'}`);
    days.append(badge);
  }
  $('#at-days').replaceChildren(days);
  $('#at-owner-link').hidden = !rights?.owner;
  if (rights) $('#at-account-status').textContent = rights.owner
    ? 'Cuenta propietaria · Acceso completo confirmado.'
    : `${rights.credits || 0} elecciones disponibles · ${rights.streak || 0} de 5 días para la siguiente.`;
}

function trialNote(current, initialPaper='plain') {
  const area=node('section','at-trial-note');
  area.append(node('h3','','Tu nota de prueba'),node('p','','Prueba libremente. No se guarda y se descarta al cerrar. Probar no compra ni desbloquea productos.'));
  const controls=node('div','at-trial-controls');
  const choice=(label,items,initial)=>{
    const wrapper=node('label','',label),select=node('select');select.setAttribute('aria-label',label);
    for(const item of items){const option=node('option','',item.name);option.value=item.id;select.append(option);}
    select.value=initial;wrapper.append(select);controls.append(wrapper);return select;
  };
  const pen=choice('Instrumento de prueba',instruments,'ballpoint');
  const paper=choice('Papel de prueba',papers,initialPaper);
  const font=choice('Letra de prueba',fonts,'sans');
  const ink=node('input');ink.type='color';ink.value='#163b62';ink.setAttribute('aria-label','Color de prueba');
  const colour=node('label','','Color');colour.append(ink);controls.append(colour);
  const thickness=node('input');thickness.type='range';thickness.min='.5';thickness.max='28';thickness.step='.5';thickness.value='2';thickness.setAttribute('aria-label','Grosor de prueba');controls.append(thickness);
  const text=node('textarea');text.placeholder='Escribe aquí para probar…';text.setAttribute('aria-label','Texto de prueba');text.maxLength=4000;
  const canvas=node('canvas');canvas.width=640;canvas.height=400;canvas.setAttribute('aria-label','Dibujo de prueba');
  let strokes=[],active=null;
  const render=()=>{const bg=paperColor(paper.value);for(const surface of [text,canvas])surface.style.backgroundImage=`url("${svgUrl(paperSvg(paper.value))}")`;text.style.color=readableInk(ink.value,bg);text.style.fontFamily=fonts.find(f=>f.id===font.value).css;drawStrokes(canvas.getContext('2d'),{strokes},640,400,bg);};
  for(const input of [paper,font,ink])input.addEventListener('input',render);
  pen.addEventListener('change',()=>{thickness.value=String(instruments.find(p=>p.id===pen.value).width);if(pen.value==='blood')ink.value='#7d1020';if(pen.value==='stamp')ink.value='#b52335';render();});
  const point=e=>{const r=canvas.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height)),p:e.pointerType==='pen'?e.pressure:.5};};
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0||strokes.length>=120)return;e.preventDefault();canvas.setPointerCapture(e.pointerId);active={instrument:pen.value,color:readableInk(ink.value,paperColor(paper.value)),width:Number(thickness.value),points:[point(e)]};strokes.push(active);render();});
  canvas.addEventListener('pointermove',e=>{if(!active||!canvas.hasPointerCapture(e.pointerId)||strokes.reduce((n,s)=>n+s.points.length,0)>=16000)return;active.points.push(point(e));render();});
  const end=e=>{if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);active=null;};canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  const clear=node('button','','Borrar prueba');clear.type='button';clear.addEventListener('click',()=>{strokes=[];active=null;text.value='';render();});
  const close=node('button','','Cerrar y descartar prueba');close.type='button';close.addEventListener('click',()=>current.close());
  current.addEventListener('close',()=>{strokes=[];active=null;text.value='';canvas.width=canvas.width;},{once:true});
  area.append(controls,text,canvas,clear,close);render();return area;
}

function toolPreview(kind) {
  const headings = {fonts: 'Letras con personalidad', pens: 'El trazo que buscas', papers: 'Cada papel, una historia', palettes: 'Colores para tus ideas'};
  const current = openDialog(headings[kind]);
  current.append(node('p', '', 'Explora cada acabado. Esta vista previa no cambia tus notas ni realiza compras.'));
  const grid = node('div', 'at-sample-grid');
  const sampleText = 'Las ideas empiezan aquí.';
  if (kind === 'fonts') for (const font of fonts) {
    const item = node('article', 'at-sample');
    const text = node('p', 'at-font-sample', sampleText); text.style.fontFamily = font.css;
    item.append(node('h3', '', font.name), text); grid.append(item);
  }
  if (kind === 'pens') for (const pen of instruments) {
    const item = node('article', 'at-sample');
    const canvas = node('canvas','at-stroke-sample'); canvas.width=640; canvas.height=160;
    canvas.setAttribute('role','img'); canvas.setAttribute('aria-label',`Muestra de trazo: ${pen.name}`);
    const points=Array.from({length:95},(_,n)=>({x:.05+n/105,y:.5+Math.sin(n/12)*.29,p:.15+.75*(1+Math.sin(n/15))/2}));
    drawStrokes(canvas.getContext('2d'),{strokes:[{instrument:pen.id,color:'#304b3e',width:pen.width,points}]},640,160);
    item.append(node('h3', '', pen.name), canvas);
    if(!rights?.owner&&!rights?.premium&&!rights?.unlocked?.includes('pens'))item.append(cartButton('pen:'+pen.id,pen.name));
    grid.append(item);
  }
  if (kind === 'papers') for (const paper of papers) {
    const item = node('article', 'at-sample');
    const img = node('img', 'at-paper-sample'); img.src = svgUrl(paperSvg(paper.id)); img.alt = paper.name;
    item.append(node('h3', '', paper.name), img); grid.append(item);
  }
  if (kind === 'palettes') for (const palette of palettes) {
    const item = node('article', 'at-sample');
    const swatches = node('div', 'at-swatches');
    for (const color of palette.colors) { const swatch = node('span'); swatch.style.backgroundColor = color; swatch.title = color; swatch.setAttribute('role','img'); swatch.setAttribute('aria-label','Color '+color); swatches.append(swatch); }
    item.append(node('h3', '', palette.name), swatches); grid.append(item);
  }
  current.append(trialNote(current),grid); current.showModal();
}

function renderTools() {
  const specs = [
    ['fonts', 'Aa', 'Letras con personalidad', `${fonts.length} familias incluidas en la aplicación. Combínalas con cursiva, subrayado y tamaño en el editor.`],
    ['pens', '〰', 'Tu trazo, tu estilo', `${instruments.length} instrumentos: grafito, gel, pluma, pincel y más.`],
    ['papers', '▤', 'Papeles que cuentan', `${papers.length} papeles: desde el papiro hasta el pentagrama.`],
    ['palettes', '● ● ●', 'Una paleta para cada idea', `${palettes.length} paletas coordinadas para tus notas.`]
  ];
  for (const [kind, sample, title, description] of specs) {
    const card = node('article', 'at-tool-card');
    const button = node('button', 'at-preview-link', 'Ver todas las muestras');
    button.type = 'button'; button.setAttribute('aria-label', 'Explorar ' + title);
    button.addEventListener('click', () => { selectedTool = kind; toolPreview(selectedTool); });
    card.append(node('div', 'at-tool-sample', sample), node('h3', '', title), node('p', '', description), button);
    $('#at-tools').append(card);
  }
}

async function loadAccount() {
  try {
    const session = await api('session');
    signedIn = Boolean(session.actor?.registered);
    if (!signedIn) return;
    rights = await api('designs/checkin', {});
    if(!rights||!Array.isArray(rights.unlocked)) throw new Error('INVALID_STATUS');
    renderProgress(); renderGrid();
    if (dialog && activeDesign) renderActions(activeDesign, dialog.querySelector('.at-preview-actions'));
  } catch {
    $('#at-account-status').textContent = navigator.onLine
      ? 'El progreso todavía no está disponible. Puedes explorar todas las vistas previas.'
      : 'Sin conexión. El catálogo está disponible; el progreso se confirma al reconectar.';
  }
}

function renderPacks() {
  for(const pack of packs){
    const option=node('option','',pack.title);option.value=pack.id;$('#at-pack').append(option);
    const card=node('article','at-pack-card');card.append(node('h3','',pack.title),node('p','',pack.description));
    const button=node('button','at-preview-link',`Explorar ${pack.designIds.length} colecciones`);button.type='button';
    button.addEventListener('click',()=>{$('#at-pack').value=pack.id;$('#at-category').value='';$('#at-search').value='';$('#at-access').value='';$('#at-edition').value='';visibleCount=pageSize;renderGrid();$('#colecciones').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('#at-pack').focus({preventScroll:true});});
    card.append(button);$('#at-packs').append(card);
  }
  const developed=designs.filter(d=>d.edition==='crafted').length;
  $('#at-coverage').textContent=`${catalogCoverage.initialThemes} temáticas iniciales (50 de recompensa y 50 Premium), ${designs.filter(d=>d.kind==='expansion').length} ampliaciones de profesiones y ${catalogCoverage.countries} países. ${developed===designs.length?'Las '+developed+' colecciones tienen composición y papelería propias.':developed+' colecciones tienen una composición desarrollada; las demás muestran una edición inicial.'}`;
  $('#at-countries-coverage').textContent=`Criterio de países: ${catalogCoverage.countryCriterion}. ${catalogCoverage.territories} ${catalogCoverage.countryStatus}`;
}
renderPacks();
const egypt = designs.find(design => design.title === 'Egipto y papiros');
$('#at-featured-image').src = svgUrl(boardSvg(egypt, {preview: true}));
for (const category of [...new Set(designs.map(design => design.category))]) {
  const option = node('option', '', category); option.value = category; $('#at-category').append(option);
}
for (const id of ['#at-search', '#at-category', '#at-access', '#at-pack', '#at-edition']) $(id).addEventListener('input', () => { visibleCount = pageSize; renderGrid(); });
$('#at-more').addEventListener('click', () => { const firstNew=visibleCount; visibleCount += pageSize; renderGrid(); $('#at-grid').children[firstNew]?.querySelector('button')?.focus(); });
$('#at-reset').addEventListener('click',()=>{for(const id of ['#at-search','#at-category','#at-access','#at-pack','#at-edition'])$(id).value='';visibleCount=pageSize;renderGrid();$('#at-search').focus();});
$('[data-at-account]').addEventListener('click', () => { location.href = '/?account=1'; });
renderProgress(); renderGrid(); renderTools(); loadAccount();

renderCart();
shopSection();

