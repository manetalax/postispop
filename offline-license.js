// Only server-signed receipts grant offline rights. The empty bundled keyset
// deliberately disables activation until the owner configures a signing key.
const MAX_AGE=7*86400, prefix='pp:offline-license:v1:';
const decode=value=>{if(!/^[A-Za-z0-9_-]+$/.test(value)||value.length%4===1)throw Error('INVALID_LICENSE');return Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-value.length%4)%4)),c=>c.charCodeAt(0));};
const json=value=>JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(decode(value)));
export async function verifyReceipt(token,{userId,keys,now=Date.now()}={}){
 if(typeof token!=='string'||token.length>65536||!userId||!keys)throw Error('INVALID_LICENSE');
 const parts=token.split('.');if(parts.length!==3)throw Error('INVALID_LICENSE');
 const header=json(parts[0]),payload=json(parts[1]);
 if(header.alg!=='ES256'||header.typ!=='JWT'||typeof header.kid!=='string'||!Object.hasOwn(keys,header.kid))throw Error('UNKNOWN_LICENSE_KEY');
 const jwk=keys[header.kid];if(jwk.kty!=='EC'||jwk.crv!=='P-256'||jwk.d)throw Error('INVALID_LICENSE_KEY');
 const key=await crypto.subtle.importKey('jwk',jwk,{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
 const signature=decode(parts[2]);
 if(signature.length!==64||!await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,signature,new TextEncoder().encode(parts[0]+'.'+parts[1])))throw Error('INVALID_LICENSE');
 const seconds=Math.floor(now/1000);
 if(payload.iss!=='postispop'||payload.aud!=='postispop-offline'||payload.sub!==userId||!Number.isSafeInteger(payload.iat)||!Number.isSafeInteger(payload.exp)||payload.iat>seconds+300||payload.exp<=seconds||payload.exp<=payload.iat||payload.exp-payload.iat>MAX_AGE)throw Error('EXPIRED_OR_WRONG_LICENSE');
 const r=payload.rights;
 if(!r||typeof r.premium!=='boolean'||typeof r.owner!=='boolean'||!Array.isArray(r.unlocked)||r.unlocked.length>1000||r.unlocked.some(id=>typeof id!=='string'||!/^[a-z0-9_-]{1,100}$/.test(id)))throw Error('INVALID_LICENSE');
 if(!r.tools||['fonts','pens','papers','palettes'].some(k=>typeof r.tools[k]!=='boolean'))throw Error('INVALID_LICENSE');
 return {...r,offline:true,purchases_enabled:false,offline_expires_at:new Date(payload.exp*1000).toISOString(),server_now:new Date(payload.iat*1000).toISOString()};
}
let publicKeys;
async function keys(){if(!publicKeys)publicKeys=fetch('/license-public-keys.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('KEYSET_UNAVAILABLE');return r.json();}).catch(e=>{publicKeys=null;throw e;});return publicKeys;}
export async function saveOfflineReceipt(userId,token){const rights=await verifyReceipt(token,{userId,keys:await keys()});localStorage.setItem(prefix+userId,token);return rights;}
export async function getOfflineRights(userId){try{const token=localStorage.getItem(prefix+userId);return token?await verifyReceipt(token,{userId,keys:await keys()}):null;}catch{return null;}}
export function clearOfflineReceipt(userId){try{localStorage.removeItem(prefix+userId);}catch{}}
