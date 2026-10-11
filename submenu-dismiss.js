/* Dismiss transient controls without intercepting their actions or closing editors. */
(()=>{
 const detailsSelector='details.pp-board-options,details.pp-editor-options,details.pp-global-theme-control,details.pp-content-options';
 function menus(){
  const entries=[...document.querySelectorAll(detailsSelector)].filter(panel=>panel.open).map(panel=>({panel,trigger:panel.querySelector('summary'),contains:target=>panel.contains(target),close:()=>{panel.open=false;}}));
  for(const panel of document.querySelectorAll('.pp-note-picker:not([hidden])')){
   const trigger=panel.parentElement.querySelector(panel.classList.contains('pp-note-color-picker')?'.pp-note-color':'.pp-note-symbol');
   entries.push({panel,trigger,contains:target=>panel.contains(target)||trigger?.contains(target),close:()=>{panel.hidden=true;trigger?.setAttribute('aria-expanded','false');}});
  }
  for(const header of document.querySelectorAll('.app-header.pp-menu-open')){
   const trigger=header.querySelector('.pp-menu-toggle'),panel=header.querySelector('.top-controls');
   entries.push({panel,trigger,contains:target=>panel?.contains(target)||trigger?.contains(target)||header.querySelector('.pp-app-links')?.contains(target),close:()=>{header.classList.remove('pp-menu-open');trigger?.setAttribute('aria-expanded','false');}});
  }
  return entries;
 }
 function outside(event){for(const menu of menus())if(!menu.contains(event.target))menu.close();}
 // Capture handles controls that intentionally stop bubbling (note colour and symbols).
 document.addEventListener('click',event=>{outside(event);pointerActive=false;},true);
 let pointerActive=false;
 document.addEventListener('pointerdown',()=>{pointerActive=true;},true);
 document.addEventListener('pointerup',()=>{setTimeout(()=>{pointerActive=false;},0);},true);
 document.addEventListener('pointercancel',()=>{pointerActive=false;},true);
 document.addEventListener('focusin',event=>{if(!pointerActive)outside(event);},true);
 document.addEventListener('toggle',event=>{
  if(!event.target.matches?.(detailsSelector)||!event.target.open)return;
  for(const menu of menus())if(menu.panel!==event.target&&!menu.contains(event.target))menu.close();
 },true);
 document.addEventListener('keydown',event=>{
  if(event.key!=='Escape'||event.isComposing)return;
  const open=menus();if(!open.length)return;
  const menu=open.find(entry=>entry.contains(document.activeElement))||open.at(-1);
  menu.close();event.preventDefault();event.stopImmediatePropagation();
  if(menu.trigger?.isConnected)menu.trigger.focus({preventScroll:true});
 },true);
})();
