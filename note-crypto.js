// WebCrypto only. No password, key or decrypted payload is persisted by this module.
export const KDF_ITERATIONS = 600000;
export const MAX_PAYLOAD_BYTES = 3 * 1024 * 1024;
export const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', {fatal: true});
const ENVELOPE_KEYS = ['v','alg','kdf','iterations','salt','iv','id','ciphertext'];
const fail = code => { throw new Error(code); };
export function bytesToBase64(bytes) {
  let binary = '';
  for (let i=0;i<bytes.length;i+=32768) binary += String.fromCharCode(...bytes.subarray(i,i+32768));
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
export function base64ToBytes(value) {
  if (typeof value!=='string'||!value||!/^[A-Za-z0-9_-]+$/.test(value)||value.length%4===1) fail('INVALID_ENVELOPE');
  const raw=atob(value.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-value.length%4)%4));
  const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));
  if(bytesToBase64(bytes)!==value) fail('INVALID_ENVELOPE');
  return bytes;
}
export function validatePassword(password) {
  if(typeof password!=='string'||Array.from(password).length<4) fail('PASSWORD_TOO_SHORT');
  if(encoder.encode(password).length>1024) fail('PASSWORD_TOO_LONG');
  return true;
}
export function validateEnvelope(value) {
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==ENVELOPE_KEYS.length||ENVELOPE_KEYS.some(k=>!(k in value))) fail('INVALID_ENVELOPE');
  if(value.v!==1||value.alg!=='AES-256-GCM'||value.kdf!=='PBKDF2-SHA-256'||value.iterations!==KDF_ITERATIONS) fail('INVALID_ENVELOPE');
  if(typeof value.ciphertext!=='string'||value.ciphertext.length>Math.ceil((MAX_PAYLOAD_BYTES+16)*4/3)) fail('INVALID_ENVELOPE');
  if(typeof value.salt!=='string'||value.salt.length!==22||typeof value.iv!=='string'||value.iv.length!==16||typeof value.id!=='string'||value.id.length!==22) fail('INVALID_ENVELOPE');
  if(base64ToBytes(value.salt).length!==16||base64ToBytes(value.iv).length!==12||base64ToBytes(value.id).length!==16) fail('INVALID_ENVELOPE');
  const size=base64ToBytes(value.ciphertext).length;
  if(size<16||size>MAX_PAYLOAD_BYTES+16) fail('INVALID_ENVELOPE');
  return true;
}
function context(e) {return encoder.encode(`PostisPop/protected-note/v1/${e.alg}/${e.kdf}/${e.iterations}/${e.id}`);}
async function derive(password,salt) {
  if(!globalThis.crypto?.subtle) fail('SECURE_CONTEXT_REQUIRED');
  validatePassword(password);const raw=encoder.encode(password);
  try {
    const material=await crypto.subtle.importKey('raw',raw,'PBKDF2',false,['deriveKey']);
    return await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:KDF_ITERATIONS,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  } finally {raw.fill(0);}
}
export function validatePayload(payload) {
  if(!payload||typeof payload!=='object'||Array.isArray(payload)||typeof payload.text!=='string'||payload.text.length>10000||!Array.isArray(payload.attachments||[])) fail('INVALID_NOTE');
  if((payload.attachments||[]).length>100) fail('INVALID_NOTE');
  let size=0;
  for(const item of payload.attachments||[]) {
    if(!item||typeof item.name!=='string'||item.name.length>512) fail('INVALID_NOTE');
    if(item.kind==='file') {size+=base64ToBytes(item.data).length;if(typeof item.type!=='string'||item.type.length>150)fail('INVALID_NOTE');}
    else if(item.kind==='link') {if(typeof item.url!=='string'||!/^https?:\/\//i.test(item.url)||item.url.length>8192)fail('INVALID_NOTE');}
    else fail('INVALID_NOTE');
  }
  if(size>MAX_ATTACHMENT_BYTES)fail('ATTACHMENTS_TOO_LARGE');return true;
}
export async function encryptNote(payload,password) {
  validatePassword(password);validatePayload(payload);
  const raw=encoder.encode(JSON.stringify(payload));if(raw.length>MAX_PAYLOAD_BYTES)fail('NOTE_TOO_LARGE');
  const envelope={v:1,alg:'AES-256-GCM',kdf:'PBKDF2-SHA-256',iterations:KDF_ITERATIONS,
    salt:bytesToBase64(crypto.getRandomValues(new Uint8Array(16))),iv:bytesToBase64(crypto.getRandomValues(new Uint8Array(12))),id:bytesToBase64(crypto.getRandomValues(new Uint8Array(16)))};
  try {
    const key=await derive(password,base64ToBytes(envelope.salt));
    envelope.ciphertext=bytesToBase64(new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:base64ToBytes(envelope.iv),additionalData:context(envelope),tagLength:128},key,raw)));
    return envelope;
  } finally {raw.fill(0);}
}
export async function decryptNote(envelope,password) {
  validateEnvelope(envelope);validatePassword(password);
  const key=await derive(password,base64ToBytes(envelope.salt));let raw;
  try {
    raw=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:base64ToBytes(envelope.iv),additionalData:context(envelope),tagLength:128},key,base64ToBytes(envelope.ciphertext)));
    const payload=JSON.parse(decoder.decode(raw));validatePayload(payload);return payload;
  } catch {fail('UNLOCK_FAILED');} finally {raw?.fill(0);}
}
