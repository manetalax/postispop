import { boardPageSize, boardPageCount, boardViewLabel, clampBoardView } from './board-view-model.js?v=20261008a';
import { whenReactReady } from './ui-ready.js';
import { attachmentNoteIds } from './backup-import.js';
import { readBoardLanguage } from './seo-language.js';

const lockedCopy={
 es:{title:'Nota bloqueada',body:n=>`Hazte Premium para seguir leyéndola. Se eliminará en ${n} ${n===1?'día':'días'} si no activas Premium.`,cta:'Ver Premium'},
 en:{title:'Note locked',body:n=>`Get Premium to keep reading. It will be deleted in ${n} ${n===1?'day':'days'} unless you activate Premium.`,cta:'See Premium'},
 de:{title:'Notiz gesperrt',body:n=>`Mit Premium kannst du sie weiterlesen. Ohne Premium wird sie in ${n} ${n===1?'Tag':'Tagen'} gelöscht.`,cta:'Premium ansehen'},
 fr:{title:'Note verrouillée',body:n=>`Passez à Premium pour continuer à la lire. Sans Premium, elle sera supprimée dans ${n} jour${n===1?'':'s'}.`,cta:'Voir Premium'},
 pt:{title:'Nota bloqueada',body:n=>`Ativa o Premium para continuar a ler. Sem Premium, será eliminada dentro de ${n} ${n===1?'dia':'dias'}.`,cta:'Ver Premium'},
 it:{title:'Nota bloccata',body:n=>`Attiva Premium per continuare a leggerla. Senza Premium, verrà eliminata tra ${n} ${n===1?'giorno':'giorni'}.`,cta:'Scopri Premium'},
 ja:{title:'ロックされたノート',body:n=>`読み続けるにはPremiumをご利用ください。Premiumにしない場合、${n}日後に削除されます。`,cta:'Premiumを見る'},
 ko:{title:'잠긴 메모',body:n=>`계속 읽으려면 Premium을 이용하세요. 가입하지 않으면 ${n}일 후 삭제됩니다.`,cta:'Premium 보기'}
};
function installLockedNote(cell,purgeAt,lang){
  let panel=cell.querySelector(':scope > .pp-note-locked');
  const strings=lockedCopy[lang]||lockedCopy.es,days=Math.max(1,Math.ceil((purgeAt-Date.now())/86400000));
  if(!panel){panel=document.createElement('div');panel.className='pp-note-locked';panel.setAttribute('role','group');panel.addEventListener('click',event=>event.stopPropagation());panel.addEventListener('pointerdown',event=>event.stopPropagation());}
  const title=element('strong','pp-note-locked-title',strings.title),body=element('span','pp-note-locked-body',strings.body(days)),link=element('a','pp-note-locked-link',strings.cta);
  link.href='/atelier.html?lang='+encodeURIComponent(lang)+'#planes';link.addEventListener('click',event=>event.stopPropagation());
  panel.replaceChildren(title,body,link);cell.append(panel);
}

const element = (tag, className, text = '') => {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
};
function iconButton(label, glyph) {
  const button = element('button', 'pp-icon', glyph);
  button.type = 'button';
  button.title = label;
  button.setAttribute('aria-label', label);
  return button;
}
function pageState() {
  const data = document.querySelector('.pp-daily-quote-data');
  const frame = document.querySelector('.board-frame:not(.is-loading)');
  if (!data || !frame) return null;
  const total = Number(data.dataset.noteCount) || 0;
  const count = Number(data.dataset.resultCount) || 0;
  // Page size follows the result set, exactly like the React view model.
  const size = boardPageSize(count);
  const page = clampBoardView(Number(frame.dataset.ppView), count, size);
  return { frame, data, total, count, size, page, pages: boardPageCount(count, size) };
}
function goTo(page) {
  const state = pageState();
  if (!state) return;
  const target = clampBoardView(page, state.count, state.size);
  window.dispatchEvent(new CustomEvent('postispop:page', { detail: { page: target } }));
}
async function boardRequest(boardId,create=false){
  const response=await fetch('/api/board/'+encodeURIComponent(boardId)+(create?'/notes':''),create?{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}:{cache:'no-store'});
  const board=await response.json();if(!response.ok)throw Error(board.error||'UNAVAILABLE');return board;
}
function openBoardNote(board,noteId){
  const position=board.order.indexOf(noteId);
  if(position<0)throw Error('NOTE_NOT_FOUND');
  window.dispatchEvent(new Event('postispop:clear-filter'));
  const view=Math.floor(position/boardPageSize(board.order.length));
  return new Promise((resolve,reject)=>{
    let timer,observer,settled=false;
    const finish=error=>{if(settled)return;settled=true;clearTimeout(timer);observer.disconnect();error?reject(error):resolve();};
    const open=()=>{
      if(settled)return;
      const state=pageState();if(!state||state.data.dataset.boardId!==board.id)return finish(Error('BOARD_CHANGED'));
      const note=[...state.frame.querySelectorAll('.sticky-note[data-note-id]')].find(note=>note.dataset.noteId===noteId&&!note.disabled);
      if(note&&state.page===view&&state.count===board.order.length){note.click();finish();}
    };
    observer=new MutationObserver(open);observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-result-count','data-pp-view','data-note-id']});
    timer=setTimeout(()=>finish(Error('OPEN_NOTE_UNAVAILABLE')),8000);
    window.dispatchEvent(new CustomEvent('postispop:board-reload',{detail:{boardId:board.id,view}}));
    // React owns the cards. Open only after it applies the unfiltered page.
    requestAnimationFrame(open);
  });
}
function installPager(frame) {
  let pager = frame.querySelector('.pp-pagination');
  if (pager) return pager;
  pager = element('nav', 'pp-pagination');
  pager.setAttribute('aria-label', 'Páginas de notas');
  const previous = iconButton('Página anterior', '‹');
  previous.dataset.pagePrevious = '';
  previous.onclick = () => goTo(pageState().page - 1);
  const selector = element('select', 'pp-page-select');
  selector.setAttribute('aria-label', 'Ir a la página');
  selector.onchange = () => goTo(Number(selector.value));
  const next = iconButton('Página siguiente', '›');
  next.dataset.pageNext = '';
  next.onclick = () => goTo(pageState().page + 1);
  const add = iconButton('Añadir nota', '+');
  add.classList.add('pp-add-note');
  add.onclick = async () => {
    const state = pageState();
    add.disabled = true;
    const status = pager.querySelector('[role=status]');
    try {
      let board=await boardRequest(state.data.dataset.boardId);
      if(board.role!=='owner')throw Error('OWNER_REQUIRED');
      const occupied=new Set(await attachmentNoteIds());
      if(board.id!=='guest-board'){
        const response=await fetch('/api/designs/styles',{cache:'no-store'}),data=await response.json();
        if(!response.ok)throw Error(data.error||'UNAVAILABLE');
        for(const note of board.notes)note.style=data.styles?.find(style=>style.note_id===note.id)||note.style;
      }
      let target=board.order.map(id=>board.notes.find(note=>note.id===id)).find(note=>note&&!note.text&&!note.marks?.length&&!note.doodle&&!note.image&&!note.protectedEnvelope&&!note.style?.drawing?.strokes?.length&&!occupied.has(note.id)&&!localStorage.getItem('pp:protected-note:'+note.id));
      if(!target){
        const previous=new Set(board.order);board=await boardRequest(board.id,true);
        target=board.notes.find(note=>!previous.has(note.id)&&board.order.includes(note.id));
        if(!target)throw Error('NOTE_NOT_FOUND');
      }
      await openBoardNote(board,target.id);
      status.textContent='';
    } catch (error) {
      const language=readBoardLanguage(),messages={es:'Gratis: 6 notas después de la prueba. Activa Premium para añadir más.',en:'Free: 6 notes after the trial. Get Premium to add more.',de:'Kostenlos: 6 Notizen nach der Testphase. Mit Premium kannst du weitere hinzufügen.',fr:'Gratuit : 6 notes après l’essai. Passez à Premium pour en ajouter.',pt:'Grátis: 6 notas após o período experimental. Ativa o Premium para adicionar mais.',it:'Gratis: 6 note dopo la prova. Attiva Premium per aggiungerne altre.',ja:'無料期間後は無料で6件までです。追加するにはPremiumをご利用ください。',ko:'체험 기간 후 무료 메모는 6개입니다. 더 추가하려면 Premium을 이용하세요.'};
      status.textContent = /BOARD_FULL|PREMIUM_REQUIRED/.test(error.message) ? (messages[language]||messages.es) : ({es:'No se pudo crear la nota. Tus notas se conservan.',en:'Could not create the note. Your notes are saved.',de:'Die Notiz konnte nicht erstellt werden. Deine Notizen bleiben erhalten.',fr:'Impossible de créer la note. Vos notes sont conservées.',pt:'Não foi possível criar a nota. As tuas notas estão guardadas.',it:'Impossibile creare la nota. Le tue note sono conservate.',ja:'ノートを作成できませんでした。ノートは保存されています。',ko:'메모를 만들지 못했습니다. 메모는 저장되어 있습니다.'}[language]||'No se pudo crear la nota. Tus notas se conservan.');
    } finally { add.disabled = false; }
  };
  const status = element('span', 'pp-note-action-status');
  status.setAttribute('role', 'status');
  pager.append(previous, selector, next, add, status);
  frame.append(pager);
  // Only an intentional horizontal gesture outside editor/input controls pages.
  let start = null;
  frame.addEventListener('touchstart', event => {
    if (event.touches.length !== 1 || event.target.closest('input,textarea,select,canvas,.pp-pagination')) return;
    start = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  frame.addEventListener('touchend', event => {
    if (!start) return;
    const touch = event.changedTouches[0], dx = touch.clientX - start.x, dy = touch.clientY - start.y;
    start = null;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) {
      frame.dataset.swiping = 'true';
      goTo(pageState().page + (dx < 0 ? 1 : -1));
      setTimeout(() => { delete frame.dataset.swiping; }, 350);
    }
  }, { passive: true });
  frame.addEventListener('touchcancel', () => { start = null; }, { passive: true });
  frame.addEventListener('click', event => {
    if (frame.dataset.swiping) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  return pager;
}
function resizePapers({ frame, count, size }) {
  const compact = innerWidth <= 700;
  const gap = compact ? 10 : 16;
  const width = Math.max(200, frame.clientWidth - (compact ? 8 : 24));
  const top = frame.getBoundingClientRect().top;
  const height = Math.max(compact ? 420 : 540, innerHeight - top - 78);
  const candidates = size <= 6 ? [[compact ? 2 : 3, compact ? 3 : 2]] : [[4, 3], [6, 2]];
  let best = null;
  for (const [columns, rows] of candidates) {
    const side = Math.floor(Math.min((width - gap * (columns - 1)) / columns, (height - gap * (rows - 1)) / rows));
    if (!best || side > best.side) best = { columns, rows, side };
  }
  best.side = Math.max(compact ? 128 : 160, best.side);
  const styles = { '--pp-note-size': best.side + 'px', '--pp-columns': best.columns, '--pp-gap': gap + 'px', '--pp-note-font': best.side >= 260 ? '20px' : best.side >= 175 ? '17px' : '14px' };
  for (const [name, value] of Object.entries(styles)) if (frame.style.getPropertyValue(name) !== String(value)) frame.style.setProperty(name, value);
  frame.classList.toggle('pp-empty-results', count === 0);
}
function update() {
  if (!document.querySelector('.pp-note-search')) return;
  const state = pageState();
  if (!state) return;
  const { frame, page, pages, count, size, total, data } = state;
  frame.classList.add('pp-notes-first');
  const pager = installPager(frame), select = pager.querySelector('select');
  if (select.options.length !== pages) {
    select.replaceChildren(...Array.from({ length: pages }, (_, index) => {
      const option = element('option', '', `Página ${index + 1} de ${pages}`);
      option.value = index;
      return option;
    }));
  }
  select.value = String(page);
  select.title = boardViewLabel(page, count, size);
  select.hidden = pages <= 1;
  pager.querySelector('[data-page-previous]').hidden = pages <= 1;
  pager.querySelector('[data-page-next]').hidden = pages <= 1;
  pager.querySelector('[data-page-previous]').disabled = page === 0;
  pager.querySelector('[data-page-next]').disabled = page >= pages - 1;
  const add = pager.querySelector('.pp-add-note');
  add.hidden = data.dataset.boardRole !== 'owner';
  // Existing notes beyond the free limit remain accessible. The API controls creation.
  add.title = total >= 6 ? 'Añadir nota · sujeto al límite de tu cuenta' : 'Añadir nota';
  let empty = frame.querySelector('.pp-empty-search');
  if (!empty) { empty = element('p', 'pp-empty-search', 'No hay notas que coincidan. Prueba otro texto o color.'); frame.append(empty); }
  if(data.dataset.favoritesOnly==='true'){
    const favoritesEmpty={es:'Aún no tienes notas favoritas.',en:'You do not have any favourite notes yet.',de:'Du hast noch keine Favoriten.',fr:'Vous n’avez pas encore de notes favorites.',pt:'Ainda não tens notas favoritas.',it:'Non hai ancora note preferite.',ja:'お気に入りのノートはまだありません。',ko:'아직 즐겨찾는 메모가 없습니다.'};
    empty.textContent=favoritesEmpty[language]||favoritesEmpty.es;
  }else empty.textContent='No hay notas que coincidan. Prueba otro texto o color.';
  empty.hidden = count !== 0;
  for (const note of frame.querySelectorAll('.sticky-note[data-note-id]')) {
    const text = note.querySelector('.note-text')?.textContent.trim();
    const blank = note.querySelector('.blank-note')?.textContent.trim();
    // Let the note's real text name its button; a truncated label hides content
    // from speech input and assistive technology.
    if (text && !note.classList.contains('pp-vault-locked')) note.removeAttribute('aria-label');
    else if (blank) note.setAttribute('aria-label', blank + '. Nota ' + note.dataset.ppSlot);
  }
  const slots=new Set(String(data.dataset.lockedSlots||'').split(',').map(Number).filter(Number.isFinite));
  const purgeAt=Number(data.dataset.purgeAt),language=readBoardLanguage();
  for(const cell of frame.querySelectorAll('.note-cell[data-pp-slot]')){
    const slot=Number(cell.dataset.ppSlot);
    if(slots.has(slot)&&purgeAt>0)installLockedNote(cell,purgeAt,language);
    else cell.querySelector(':scope > .pp-note-locked')?.remove();
  }
  resizePapers(state);
}
let scheduled = false;
function schedule() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => { scheduled = false; update(); });
}
whenReactReady(() => {
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-note-count', 'data-result-count', 'data-pp-view'] });
  window.addEventListener('resize', schedule);
  window.addEventListener('postispop:save', schedule);
  document.addEventListener('keydown', event => {
    if (event.target.closest('input,textarea,select,button,[contenteditable],dialog,[role=dialog]') || event.ctrlKey || event.metaKey || event.altKey) return;
    const state = pageState();
    if (!state) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(state.page + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  update();
});
