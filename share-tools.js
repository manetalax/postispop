const MAX_SHARE_BYTES=10*1024*1024;

export async function shareFile(file,{title='PostisPop',text=''}={}){
  if(!(file instanceof File))throw new TypeError('FILE_REQUIRED');
  if(file.size>MAX_SHARE_BYTES)throw new Error('SHARE_FILE_TOO_LARGE');
  if(window.__postispopNativeShare){
    await window.__postispopNativeShare({file,title,text});
    return 'shared';
  }
  if(typeof navigator.share==='function'&&typeof navigator.canShare==='function'&&navigator.canShare({files:[file]})){
    try{await navigator.share({files:[file],title,text});return 'shared';}
    catch(error){if(error?.name==='AbortError')return 'cancelled';throw error;}
  }
  return 'unsupported';
}

export async function shareText(text,{title='PostisPop'}={}){
  if(window.__postispopNativeShare){await window.__postispopNativeShare({title,text});return 'shared';}
  if(typeof navigator.share==='function'){
    try{await navigator.share({title,text});return 'shared';}
    catch(error){if(error?.name==='AbortError')return 'cancelled';throw error;}
  }
  try{await navigator.clipboard.writeText(text);return 'copied';}
  catch{return 'unsupported';}
}

export function openWhatsApp(text){
  const url='https://wa.me/?text='+encodeURIComponent(text);
  const tab=window.open(url,'_blank','noopener,noreferrer');
  if(!tab)location.assign(url);
}
