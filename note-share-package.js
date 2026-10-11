import {normalizeBackup,LOCAL_BACKUP_BYTES,verifyBackupAttachments} from './backup-import.js';
import {bytesToBase64,base64ToBytes} from './note-crypto.js';
export const MAX_SHARE_BYTES=LOCAL_BACKUP_BYTES;
export const SHARE_TTL_DAYS=7;
export function validateSharedNote(data){
  if(data?.format!=='postispop'||data.version!==2||data.notes?.length!==1)throw Error('INVALID_SHARED_NOTE');
  const normalized=normalizeBackup(data,{maxNotes:1,maxBytes:MAX_SHARE_BYTES});
  if(normalized.notes.length!==1)throw Error('EMPTY_NOTE');
  return {...data,notes:normalized.notes};
}
export async function sealSharedNote(data){
  validateSharedNote(data);
  const raw=new TextEncoder().encode(JSON.stringify(data));if(raw.length>MAX_SHARE_BYTES)throw Error('SHARE_TOO_LARGE');
  const keyBytes=crypto.getRandomValues(new Uint8Array(32)),iv=crypto.getRandomValues(new Uint8Array(12));
  const token=bytesToBase64(crypto.getRandomValues(new Uint8Array(32)));
  const key=await crypto.subtle.importKey('raw',keyBytes,'AES-GCM',false,['encrypt']);
  const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode('PostisPop/share/v1/'+token)},key,raw);
  raw.fill(0);
  return {token,key:bytesToBase64(keyBytes),blob:new Blob([iv,ciphertext],{type:'application/octet-stream'})};
}
export function parseShareLink(hash){
  const match=/^#([A-Za-z0-9_-]{43})\.([A-Za-z0-9_-]{43})$/.exec(hash);
  if(!match||base64ToBytes(match[1]).length!==32||base64ToBytes(match[2]).length!==32)throw Error('INVALID_SHARE_LINK');
  return {token:match[1],key:match[2]};
}
export async function openSharedNote(blob,token,keyText){
  if(blob.size<29||blob.size>MAX_SHARE_BYTES+28)throw Error('INVALID_SHARED_NOTE');
  const bytes=new Uint8Array(await blob.arrayBuffer());
  const key=await crypto.subtle.importKey('raw',base64ToBytes(keyText),'AES-GCM',false,['decrypt']);
  let raw;
  try{raw=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.subarray(0,12),additionalData:new TextEncoder().encode('PostisPop/share/v1/'+token)},key,bytes.subarray(12)));
    const result=validateSharedNote(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(raw)));await verifyBackupAttachments(result.notes);return result;
  }finally{raw?.fill(0);}
}
