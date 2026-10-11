export function installNativeShare(){
  if(window.__postispopNativeShare)return;
let nativeShareSequence=0,nativeSharePending=false;
window.__postispopNativeShare=async ({file,title='PostisPop',text=''}={})=>{
  const bridge=window.PostisPopShare;
  if(!bridge||typeof bridge.postMessage!=='function')throw Error('NATIVE_SHARE_UNAVAILABLE');
  if(nativeSharePending)throw Error('NATIVE_SHARE_BUSY');
  if(file&&(!(file instanceof Blob)||file.size>10000000))throw Error('NATIVE_SHARE_TOO_LARGE');
  nativeSharePending=true;
  try{
    let dataUrl='';
    if(file)dataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>typeof reader.result==='string'?resolve(reader.result):reject(Error('NATIVE_SHARE_READ_FAILED'));reader.onerror=reader.onabort=()=>reject(Error('NATIVE_SHARE_READ_FAILED'));reader.readAsDataURL(file);});
    const id='share-'+Date.now().toString(36)+'-'+(++nativeShareSequence);
    return await new Promise((resolve,reject)=>{
      const previous=bridge.onmessage,cleanup=()=>{if(bridge.onmessage===receive)bridge.onmessage=previous;};
      const receive=event=>{let result;try{result=JSON.parse(event.data);}catch{return;}if(!result||result.id!==id)return;if(result.status==='opened'){cleanup();resolve(true);}else if(result.status==='error'){cleanup();reject(Error(result.error||'NATIVE_SHARE_FAILED'));}};
      bridge.onmessage=receive;
      try{bridge.postMessage(JSON.stringify({id,filename:file?.name||'',mimeType:file?.type||'',title:String(title).slice(0,120),text:String(text).slice(0,4000),dataUrl}));}
      catch{cleanup();reject(Error('NATIVE_SHARE_UNAVAILABLE'));}
    });
  }finally{nativeSharePending=false;}
};

}
