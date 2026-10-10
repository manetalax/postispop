import { readBoardLanguage } from './seo-language.js';

const keyFor = boardId => `postispop:board-preferences:${boardId}`;
const copy = {
  es:{favorite:'Favorito',unfavorite:'Quitar de favoritos',pin:'Fijar nota',unpin:'Desfijar nota',note:'Nota'},
  en:{favorite:'Add to favourites',unfavorite:'Remove from favourites',pin:'Pin note',unpin:'Unpin note',note:'Note'},
  de:{favorite:'Zu Favoriten hinzufügen',unfavorite:'Aus Favoriten entfernen',pin:'Notiz anheften',unpin:'Notiz lösen',note:'Notiz'},
  fr:{favorite:'Ajouter aux favoris',unfavorite:'Retirer des favoris',pin:'Épingler la note',unpin:'Désépingler la note',note:'Note'},
  pt:{favorite:'Adicionar aos favoritos',unfavorite:'Remover dos favoritos',pin:'Fixar nota',unpin:'Desafixar nota',note:'Nota'},
  it:{favorite:'Aggiungi ai preferiti',unfavorite:'Rimuovi dai preferiti',pin:'Fissa nota',unpin:'Rimuovi nota fissata',note:'Nota'},
  ja:{favorite:'お気に入りに追加',unfavorite:'お気に入りから削除',pin:'ノートをピン留め',unpin:'ピン留めを解除',note:'ノート'},
  ko:{favorite:'즐겨찾기에 추가',unfavorite:'즐겨찾기에서 삭제',pin:'메모 고정',unpin:'메모 고정 해제',note:'메모'}
};

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
    if(actions.dataset.noteId===id&&actions.dataset.favorite===String(favorite)&&actions.dataset.pinned===String(pinned))continue;
    actions.dataset.noteId=id;actions.dataset.favorite=String(favorite);actions.dataset.pinned=String(pinned);
    const star=element('button','pp-note-preference pp-note-favorite',favorite?'★':'☆');
    star.type='button';star.setAttribute('aria-pressed',String(favorite));star.setAttribute('aria-label',`${favorite?strings.unfavorite:strings.favorite} · ${strings.note} ${slot}`);star.title=star.getAttribute('aria-label');
    star.addEventListener('click',()=>{if(toggle(boardId,id,'favorite'))refreshControls(frame,boardId);});
    const pin=element('button','pp-note-preference pp-note-pin',pinned?'📌':'⌖');
    pin.type='button';pin.setAttribute('aria-pressed',String(pinned));pin.setAttribute('aria-label',`${pinned?strings.unpin:strings.pin} · ${strings.note} ${slot}`);pin.title=pin.getAttribute('aria-label');
    pin.addEventListener('click',()=>{if(toggle(boardId,id,'pin'))refreshControls(frame,boardId);});
    actions.replaceChildren(star,pin);
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
document.addEventListener('click',event=>{const note=event.target.closest('.sticky-note[data-note-id]');if(note)editingId=note.dataset.noteId;},true);
function refreshDatesAndSort(frame,boardId){
 const lang=readBoardLanguage(),t=orderCopy[lang]||orderCopy.es;
 const host=document.querySelector('.pp-note-search');
 if(host){
  let select=host.querySelector('.pp-sort-notes');
  if(!select){select=document.createElement('select');select.className='pp-sort-notes';host.append(select);select.addEventListener('change',()=>{const p=readBoardPreferences(boardId);p.sort=select.value;writeBoardPreferences(boardId,p);});}
  if(select.dataset.language!==lang){const values=['number','updated-newest','updated-oldest','created-newest','created-oldest','favorites'];select.replaceChildren(...values.map((value,i)=>{const o=document.createElement('option');o.value=value;o.textContent=t[0]+': '+t[i+1];return o;}));select.dataset.language=lang;}
  select.setAttribute('aria-label',t[0]);select.value=readBoardPreferences(boardId).sort||'number';
 }
 const format=value=>{const d=new Date(/^\d+$/.test(value)?Number(value):value);return Number.isNaN(d.getTime())?null:d;};
 function put(host,value){const d=format(value||'');if(!d)return;let time=host.querySelector(':scope > .pp-note-date');if(!time){time=document.createElement('time');time.className='pp-note-date';host.append(time);}const label=t[7]+': '+new Intl.DateTimeFormat(lang,{dateStyle:'short',timeStyle:'short'}).format(d);if(time.textContent!==label)time.textContent=label;time.dateTime=d.toISOString();}
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
