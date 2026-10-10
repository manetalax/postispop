import { readBoardLanguage } from './seo-language.js';

const keyFor = boardId => `postispop:board-preferences:${boardId}`;
const copy = {
  es:{favorite:'Añadir a favoritos',unfavorite:'Quitar de favoritos',pin:'Fijar nota',unpin:'Desfijar nota',note:'Nota',color:'Cambiar color',symbol:'Cambiar símbolo',colors:['Amarillo','Rosa','Azul','Crema','Verde','Lila'],symbols:{none:'Sin símbolo',heart:'Corazón',idea:'Idea',smile:'Sonrisa',cart:'Carrito de la compra',star:'Estrella',check:'Completado',ticket:'Entrada'},saveError:'No se pudo guardar el cambio.'},
  en:{favorite:'Add to favourites',unfavorite:'Remove from favourites',pin:'Pin note',unpin:'Unpin note',note:'Note',color:'Change colour',symbol:'Change symbol',colors:['Yellow','Pink','Blue','Cream','Green','Lilac'],symbols:{none:'No symbol',heart:'Heart',idea:'Idea',smile:'Smile',cart:'Shopping cart',star:'Star',check:'Complete',ticket:'Ticket'},saveError:'Could not save this change.'},
  de:{favorite:'Zu Favoriten hinzufügen',unfavorite:'Aus Favoriten entfernen',pin:'Notiz anheften',unpin:'Notiz lösen',note:'Notiz',color:'Farbe ändern',symbol:'Symbol ändern',colors:['Gelb','Rosa','Blau','Creme','Grün','Lila'],symbols:{none:'Kein Symbol',heart:'Herz',idea:'Idee',smile:'Lächeln',cart:'Einkaufswagen',star:'Stern',check:'Erledigt',ticket:'Ticket'},saveError:'Änderung konnte nicht gespeichert werden.'},
  fr:{favorite:'Ajouter aux favoris',unfavorite:'Retirer des favoris',pin:'Épingler la note',unpin:'Désépingler la note',note:'Note',color:'Changer de couleur',symbol:'Changer de symbole',colors:['Jaune','Rose','Bleu','Crème','Vert','Lilas'],symbols:{none:'Aucun symbole',heart:'Cœur',idea:'Idée',smile:'Sourire',cart:'Panier',star:'Étoile',check:'Terminé',ticket:'Billet'},saveError:'Impossible d’enregistrer cette modification.'},
  pt:{favorite:'Adicionar aos favoritos',unfavorite:'Remover dos favoritos',pin:'Fixar nota',unpin:'Desafixar nota',note:'Nota',color:'Mudar cor',symbol:'Mudar símbolo',colors:['Amarelo','Rosa','Azul','Creme','Verde','Lilás'],symbols:{none:'Sem símbolo',heart:'Coração',idea:'Ideia',smile:'Sorriso',cart:'Carrinho de compras',star:'Estrela',check:'Concluído',ticket:'Bilhete'},saveError:'Não foi possível guardar esta alteração.'},
  it:{favorite:'Aggiungi ai preferiti',unfavorite:'Rimuovi dai preferiti',pin:'Fissa nota',unpin:'Rimuovi nota fissata',note:'Nota',color:'Cambia colore',symbol:'Cambia simbolo',colors:['Giallo','Rosa','Blu','Crema','Verde','Lilla'],symbols:{none:'Nessun simbolo',heart:'Cuore',idea:'Idea',smile:'Sorriso',cart:'Carrello',star:'Stella',check:'Completato',ticket:'Biglietto'},saveError:'Impossibile salvare la modifica.'},
  ja:{favorite:'お気に入りに追加',unfavorite:'お気に入りから削除',pin:'ノートをピン留め',unpin:'ピン留めを解除',note:'ノート',color:'色を変更',symbol:'シンボルを変更',colors:['黄色','ピンク','青','クリーム','緑','ライラック'],symbols:{none:'シンボルなし',heart:'ハート',idea:'アイデア',smile:'笑顔',cart:'買い物カート',star:'星',check:'完了',ticket:'チケット'},saveError:'変更を保存できませんでした。'},
  ko:{favorite:'즐겨찾기에 추가',unfavorite:'즐겨찾기에서 삭제',pin:'메모 고정',unpin:'메모 고정 해제',note:'메모',color:'색상 변경',symbol:'기호 변경',colors:['노랑','분홍','파랑','크림','초록','라일락'],symbols:{none:'기호 없음',heart:'하트',idea:'아이디어',smile:'미소',cart:'장바구니',star:'별',check:'완료',ticket:'티켓'},saveError:'변경 사항을 저장하지 못했습니다.'}
};
const colors=['#ffec86','#ffc5d2','#b9e0f8','#f9f0d7','#c5e7bd','#d9c8f3'];
const contrastColors=[2,4,0,5,1,4];
const symbols={
  heart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8"/></svg>',
  idea:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/></svg>',
  smile:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>',
  cart:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2 2h2l2.7 12.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6L22 7H5"/></svg>',
  star:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8l-6.2 3.3L7 14.2 2 9.3l6.9-1L12 2z"/></svg>',
  check:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m20 6-11 11-5-5"/></svg>',
  ticket:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 9a3 3 0 0 0 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 0 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2zM13 5v2m0 4v2m0 4v2"/></svg>'
};
const pinMarker = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="6.3"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><path d="M12 1.7v3.2M12 19.1v3.2M1.7 12h3.2M19.1 12h3.2"/></svg>';
const pushpin = '<svg viewBox="0 0 40 56" width="34" height="48" aria-hidden="true" focusable="false"><path d="M20 37.5v16" stroke="#89949c" stroke-width="2.4" stroke-linecap="round"/><path d="M19.4 38v14" stroke="#e9eef1" stroke-width=".8" stroke-linecap="round"/><path d="M16 13.5 17.3 31h5.4L24 13.5z" fill="#d73832" stroke="#a92725" stroke-width="1"/><path d="m18.1 15 .9 13.5" stroke="#ff8d7b" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="20" cy="33.7" rx="10.3" ry="4.7" fill="#a72b29"/><ellipse cx="20" cy="32.7" rx="10.3" ry="4.7" fill="#ed4a41" stroke="#a72b29" stroke-width="1"/><path d="M10.8 32.3c.7-2.1 4.4-3.6 9.2-3.6s8.5 1.5 9.2 3.6" fill="none" stroke="#ff8d7b" stroke-width="1.1" stroke-linecap="round"/><ellipse cx="20" cy="12.7" rx="8.4" ry="6.1" fill="#a72b29"/><ellipse cx="20" cy="11.8" rx="8.4" ry="6.1" fill="#ed4a41" stroke="#a72b29" stroke-width="1"/><path d="M13.5 10.8c1.2-2.1 3.7-3.2 6.5-3.2" fill="none" stroke="#ff9a87" stroke-width="1.3" stroke-linecap="round"/></svg>';

export function readBoardPreferences(boardId) {
  if (!boardId) return { favorites: [], pinned: [] };
  try {
    const value=JSON.parse(localStorage.getItem(keyFor(boardId))||'{}');
    return {
      sort:typeof value.sort==='string'?value.sort:'number',
      favorites:Array.isArray(value.favorites)?value.favorites.filter(id=>typeof id==='string'):[],
      pinned:Array.isArray(value.pinned)?value.pinned.filter(id=>typeof id==='string'):[]
    };
  } catch { return { favorites: [], pinned: [] }; }
}

export function sortBoardNotes(notes,boardId) {
  const pinned=new Set(readBoardPreferences(boardId).pinned);
  const mode=readBoardPreferences(boardId).sort||'number',favorites=new Set(readBoardPreferences(boardId).favorites);
  const stamp=(note,key)=>typeof note[key]==='number'?note[key]:Date.parse(note[key])||0;
  return notes.map((note,index)=>({note,index})).sort((a,b)=>{
    const pin=Number(pinned.has(b.note.id))-Number(pinned.has(a.note.id));if(pin)return pin;
    if(mode==='favorites')return Number(favorites.has(b.note.id))-Number(favorites.has(a.note.id))||a.index-b.index;
    const key=mode.startsWith('created')?'created':'updated',direction=mode.endsWith('oldest')?1:-1;
    return (mode==='number'?0:direction*(stamp(a.note,key)-stamp(b.note,key)))||a.index-b.index;
  }).map(item=>item.note);
}

function writeBoardPreferences(boardId,preferences) {
  try { localStorage.setItem(keyFor(boardId),JSON.stringify(preferences)); }
  catch { return false; }
  window.dispatchEvent(new CustomEvent('postispop:note-preferences',{detail:{boardId}}));
  return true;
}

function toggle(boardId,noteId,kind) {
  const preferences=readBoardPreferences(boardId),list=kind==='favorite'?'favorites':'pinned',values=new Set(preferences[list]);
  values.has(noteId)?values.delete(noteId):values.add(noteId);
  preferences[list]=[...values];
  return writeBoardPreferences(boardId,preferences);
}

const element=(tag,className,label)=>{const node=document.createElement(tag);node.className=className;node.textContent=label;return node;};
function refreshControls(frame,boardId) {
  const lang=readBoardLanguage(),strings=copy[lang]||copy.es,preferences=readBoardPreferences(boardId);
  for(const cell of frame.querySelectorAll('.note-cell')) {
    const note=cell.querySelector('.sticky-note[data-note-id]');
    if(!note||note.disabled||cell.querySelector('.pp-note-locked')){cell.querySelector('.pp-note-preferences')?.remove();continue;}
    const id=note.dataset.noteId,slot=Number(note.dataset.ppSlot)||0;
    let actions=cell.querySelector(':scope > .pp-note-preferences');
    if(!actions){actions=element('div','pp-note-preferences','');actions.addEventListener('click',event=>event.stopPropagation());actions.addEventListener('pointerdown',event=>event.stopPropagation());cell.append(actions);}
    const favorite=preferences.favorites.includes(id),pinned=preferences.pinned.includes(id);
    const paper=Math.max(0,Math.min(5,Number(note.dataset.paper)||0)),doodle=note.dataset.doodle||'';
    if(actions.dataset.noteId===id&&actions.dataset.favorite===String(favorite)&&actions.dataset.pinned===String(pinned)&&actions.dataset.language===lang&&actions.dataset.paper===String(paper)&&actions.dataset.doodle===doodle)continue;
    actions.dataset.noteId=id;actions.dataset.favorite=String(favorite);actions.dataset.pinned=String(pinned);actions.dataset.language=lang;actions.dataset.paper=String(paper);actions.dataset.doodle=doodle;
    const star=element('button','pp-note-preference pp-note-favorite',favorite?'★':'☆');
    star.type='button';star.setAttribute('aria-pressed',String(favorite));star.setAttribute('aria-label',`${favorite?strings.unfavorite:strings.favorite} · ${strings.note} ${slot}`);star.title=star.getAttribute('aria-label');
    star.addEventListener('click',()=>{if(toggle(boardId,id,'favorite'))refreshControls(frame,boardId);});
    const pin=element('button','pp-note-preference pp-note-pin','');pin.innerHTML=pinned?pushpin:pinMarker;
    pin.type='button';pin.setAttribute('aria-pressed',String(pinned));pin.setAttribute('aria-label',`${pinned?strings.unpin:strings.pin} · ${strings.note} ${slot}`);pin.title=pin.getAttribute('aria-label');
    pin.addEventListener('click',()=>{if(toggle(boardId,id,'pin'))refreshControls(frame,boardId);});
    const colorButton=element('button','pp-note-preference pp-note-color','');colorButton.type='button';colorButton.setAttribute('aria-label',strings.color+' · '+strings.note+' '+slot);colorButton.title=colorButton.getAttribute('aria-label');
    const dot=element('span','pp-note-color-dot','');dot.style.setProperty('--pp-current-paper',colors[paper]);dot.style.setProperty('--pp-contrast-paper',colors[contrastColors[paper]]);colorButton.append(dot);
    const colorMenu=element('div','pp-note-picker pp-note-color-picker','');colorMenu.hidden=true;colorMenu.setAttribute('role','group');colorMenu.setAttribute('aria-label',strings.color);
    colors.forEach((color,index)=>{const option=element('button','pp-note-color-option','');option.type='button';option.style.setProperty('--pp-option-paper',color);option.setAttribute('aria-label',strings.colors[index]);option.setAttribute('aria-pressed',String(index===paper));option.title=strings.colors[index];option.addEventListener('click',()=>saveNoteValue(note,boardId,'paper',index,colorMenu,actions,strings));colorMenu.append(option);});
    colorButton.addEventListener('click',()=>{colorMenu.hidden=!colorMenu.hidden;symbolMenu.hidden=true;});
    const symbolButton=element('button','pp-note-preference pp-note-symbol','');symbolButton.type='button';symbolButton.dataset.selected=String(Boolean(doodle&&symbols[doodle]));symbolButton.setAttribute('aria-label',strings.symbol+' · '+strings.note+' '+slot);symbolButton.title=symbolButton.getAttribute('aria-label');
    if(doodle&&symbols[doodle])symbolButton.innerHTML=symbols[doodle];else symbolButton.textContent='＋';
    const symbolMenu=element('div','pp-note-picker pp-note-symbol-picker','');symbolMenu.hidden=true;symbolMenu.setAttribute('role','group');symbolMenu.setAttribute('aria-label',strings.symbol);
    ['',...Object.keys(symbols)].forEach(value=>{const option=element('button','pp-note-symbol-option','');option.type='button';option.setAttribute('aria-label',strings.symbols[value||'none']);option.setAttribute('aria-pressed',String((doodle||'')===value));option.title=strings.symbols[value||'none'];if(value)option.innerHTML=symbols[value];else option.textContent='×';option.addEventListener('click',()=>saveNoteValue(note,boardId,'doodle',value,symbolMenu,actions,strings));symbolMenu.append(option);});
    symbolButton.addEventListener('click',()=>{symbolMenu.hidden=!symbolMenu.hidden;colorMenu.hidden=true;});
    actions.replaceChildren(colorButton,star,pin,symbolButton,colorMenu,symbolMenu);
  }
}

async function saveNoteValue(note,boardId,kind,value,menu,actions,strings){
  const id=note.dataset.noteId,revision=Number(note.dataset.revision)||1;
  try {
    const response=await fetch(`/api/note/${encodeURIComponent(id)}/${kind}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({[kind]:value,revision})});
    if(!response.ok)throw new Error('NOTE_SAVE_FAILED');
    menu.hidden=true;
    window.dispatchEvent(new CustomEvent('postispop:board-reload',{detail:{boardId}}));
  } catch {
    const status=element('span','pp-note-save-error',strings.saveError);status.setAttribute('role','status');actions.append(status);setTimeout(()=>status.remove(),3500);
  }
}


const orderCopy={
es:['Ordenar por','Número de nota','Última edición: recientes','Última edición: antiguas','Creación: recientes','Creación: antiguas','Favoritos primero','Última edición'],
en:['Sort by','Note number','Edited: newest','Edited: oldest','Created: newest','Created: oldest','Favourites first','Last edited'],
de:['Sortieren nach','Notiznummer','Bearbeitet: neueste','Bearbeitet: älteste','Erstellt: neueste','Erstellt: älteste','Favoriten zuerst','Zuletzt bearbeitet'],
fr:['Trier par','Numéro de note','Modification : récentes','Modification : anciennes','Création : récentes','Création : anciennes','Favoris en premier','Dernière modification'],
pt:['Ordenar por','Número da nota','Edição: recentes','Edição: antigas','Criação: recentes','Criação: antigas','Favoritos primeiro','Última edição'],
it:['Ordina per','Numero nota','Modifica: recenti','Modifica: vecchie','Creazione: recenti','Creazione: vecchie','Preferiti prima','Ultima modifica'],
ja:['並べ替え','ノート番号','編集：新しい順','編集：古い順','作成：新しい順','作成：古い順','お気に入り優先','最終編集'],
ko:['정렬','메모 번호','편집: 최신순','편집: 오래된순','생성: 최신순','생성: 오래된순','즐겨찾기 우선','마지막 편집']
};
let editingId='';
if(typeof document!=='undefined')document.addEventListener('click',event=>{const note=event.target.closest('.sticky-note[data-note-id]');if(note)editingId=note.dataset.noteId;},true);
function refreshDatesAndSort(frame,boardId){
 const lang=readBoardLanguage(),t=orderCopy[lang]||orderCopy.es;
 const host=document.querySelector('.pp-note-search');
 if(host){
  let select=host.querySelector('.pp-sort-notes');
  if(!select){select=document.createElement('select');select.className='pp-sort-notes';host.append(select);select.addEventListener('change',()=>{const id=select.dataset.boardId;const p=readBoardPreferences(id);p.sort=select.value;writeBoardPreferences(id,p);});}
  if(select.dataset.language!==lang){const values=['number','updated-newest','updated-oldest','created-newest','created-oldest','favorites'];select.replaceChildren(...values.map((value,i)=>{const o=document.createElement('option');o.value=value;o.textContent=t[0]+': '+t[i+1];return o;}));select.dataset.language=lang;}
  select.dataset.boardId=boardId;select.setAttribute('aria-label',t[0]);select.value=readBoardPreferences(boardId).sort||'number';
 }
 const format=value=>{const d=new Date(/^\d+$/.test(value)?Number(value):value);return Number.isNaN(d.getTime())?null:d;};
 function put(host,value){const d=format(value||'');if(!d)return;let time=host.querySelector(':scope > .pp-note-date');if(!time){time=document.createElement('time');time.className='pp-note-date';host.append(time);}const formatted=new Intl.DateTimeFormat(lang,{dateStyle:'short',timeStyle:'short'}).format(d),label=t[7]+': '+formatted,visibleLabel=host.matches('.sticky-note')?formatted:label;if(time.textContent!==visibleLabel)time.textContent=visibleLabel;time.setAttribute('aria-label',label);time.title=label;time.dateTime=d.toISOString();}
 for(const note of frame.querySelectorAll('.sticky-note[data-note-id]'))put(note,note.dataset.updated);
 const editor=document.querySelector('.editor-dialog');
 if(editor&&editingId){const note=[...frame.querySelectorAll('.sticky-note[data-note-id]')].find(n=>n.dataset.noteId===editingId);if(note)put(editor,note.dataset.updated);}
}

let observer=null,activeFrame=null,activeBoardId='',scheduled=false;
export function initBoardPreferences() {
  const frame=document.querySelector('.board-frame:not(.is-loading)'),data=document.querySelector('.pp-daily-quote-data');
  const boardId=data?.dataset.boardId;
  if(!frame||!boardId)return;
  if(frame!==activeFrame||boardId!==activeBoardId){observer?.disconnect();activeFrame=frame;activeBoardId=boardId;observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;if(activeFrame?.isConnected){refreshControls(activeFrame,activeBoardId);refreshDatesAndSort(activeFrame,activeBoardId);}});});observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-updated']});}
  refreshControls(frame,boardId);
  refreshDatesAndSort(frame,boardId);
}
if (typeof window !== 'undefined') window.addEventListener('storage',event=>{if(event.key?.startsWith('postispop:board-preferences:'))window.dispatchEvent(new CustomEvent('postispop:note-preferences',{detail:{boardId:event.key.slice('postispop:board-preferences:'.length)}}));});
