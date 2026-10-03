// Deploy only after designs.sql and configuring the private signing JWK.
// This function signs database entitlements; it never accepts rights from a client.
const encoder=new TextEncoder();
const b64=(value:Uint8Array)=>{let s='';for(const b of value)s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');};
const part=(value:unknown)=>b64(encoder.encode(JSON.stringify(value)));
Deno.serve(async(request:Request)=>{
 const origin=request.headers.get('origin')||'';
 const allowed=['https://postispop.com','https://www.postispop.com','https://appassets.androidplatform.net'];
 const cors=allowed.includes(origin)?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{};
 const respond=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...cors,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS'}});
 if(request.method!=='POST')return respond({error:'METHOD_NOT_ALLOWED'},405);
 const authorization=request.headers.get('authorization')||'';if(!authorization.startsWith('Bearer '))return respond({error:'SESSION_REQUIRED'},401);
 const privateKey=Deno.env.get('POSTISPOP_LICENSE_PRIVATE_JWK'),kid=Deno.env.get('POSTISPOP_LICENSE_KID');
 if(!privateKey||!kid)return respond({error:'OFFLINE_LICENSE_NOT_CONFIGURED'},503);
 try{
  const base=Deno.env.get('SUPABASE_URL')!,apikey=Deno.env.get('SUPABASE_ANON_KEY')!;
  const headers={Authorization:authorization,apikey,'Content-Type':'application/json'};
  const userResponse=await fetch(base+'/auth/v1/user',{headers});if(!userResponse.ok)return respond({error:'SESSION_REQUIRED'},401);
  const user=await userResponse.json();if(typeof user.id!=='string')return respond({error:'SESSION_REQUIRED'},401);
  const statusResponse=await fetch(base+'/rest/v1/rpc/postispop_design_status',{method:'POST',headers,body:'{}'});if(!statusResponse.ok)return respond({error:'RIGHTS_UNAVAILABLE'},503);
  const status=await statusResponse.json(),iat=Math.floor(Date.now()/1000);
  const expiry=Date.parse(status.offline_valid_until);if(!Number.isFinite(expiry))return respond({error:'OFFLINE_POLICY_UNAVAILABLE'},503);
  const exp=Math.min(iat+7*86400,Math.floor(expiry/1000));if(exp<=iat)return respond({error:'RIGHTS_EXPIRED'},403);
  const rights={owner:status.owner===true,premium:status.premium===true,legacy_pro:status.legacy_pro===true,unlocked:status.unlocked,selected:status.selected,tools:status.tools};
  const signed=part({alg:'ES256',typ:'JWT',kid})+'.'+part({iss:'postispop',aud:'postispop-offline',sub:user.id,iat,exp,rights});
  const jwk=JSON.parse(privateKey);if(jwk.kty!=='EC'||jwk.crv!=='P-256'||!jwk.d)return respond({error:'OFFLINE_LICENSE_NOT_CONFIGURED'},503);
  const key=await crypto.subtle.importKey('jwk',jwk,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
  const signature=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,encoder.encode(signed));
  return respond({token:signed+'.'+b64(new Uint8Array(signature)),expires_at:new Date(exp*1000).toISOString()});
 }catch{return respond({error:'OFFLINE_LICENSE_UNAVAILABLE'},503);}
});
