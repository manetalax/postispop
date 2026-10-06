import { boardPageSize, boardPageCount, boardViewLabel, clampBoardView } from './board-view-model.js';
import { whenReactReady } from './ui-ready.js';
import { attachmentNoteIds } from './backup-import.js';

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
      status.textContent = /BOARD_FULL|PREMIUM_REQUIRED/.test(error.message) ? 'Gratis incluye 6 notas. Premium estará disponible próximamente.' : 'No se pudo crear la nota. Tus notas se conservan.';
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
  const height = Math.max(300, innerHeight - top - 78);
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
  empty.hidden = count !== 0;
  for (const note of frame.querySelectorAll('.sticky-note[data-note-id]')) {
    const text = note.querySelector('.note-text')?.textContent.trim();
    const blank = note.querySelector('.blank-note')?.textContent.trim();
    // Let the note's real text name its button; a truncated label hides content
    // from speech input and assistive technology.
    if (text && !note.classList.contains('pp-vault-locked')) note.removeAttribute('aria-label');
    else if (blank) note.setAttribute('aria-label', blank + '. Nota ' + note.dataset.ppSlot);
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
