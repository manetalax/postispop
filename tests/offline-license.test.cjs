const {test}=require('node:test');
const assert=require('node:assert/strict');
const encoded=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
test('Offline licences require signature, correct account, key and unexpired policy',async()=>{
 const {verifyReceipt}=await import('../offline-license.js');
 const key=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
 const keys={test:await crypto.subtle.exportKey('jwk',key.publicKey)},now=1800000000000,iat=now/1000;
 const claims={iss:'postispop',aud:'postispop-offline',sub:'account-a',iat,exp:iat+86400,rights:{premium:true,owner:false,unlocked:['country-es'],tools:{fonts:true,pens:true,papers:true,palettes:true}}};
 const sign=async c=>{const s=encoded({alg:'ES256',typ:'JWT',kid:'test'})+'.'+encoded(c);return s+'.'+Buffer.from(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key.privateKey,Buffer.from(s))).toString('base64url');};
 const token=await sign(claims),opts={userId:'account-a',keys,now};
 assert.equal((await verifyReceipt(token,opts)).premium,true);
 await assert.rejects(verifyReceipt(token,{...opts,userId:'account-b'}));
 await assert.rejects(verifyReceipt(token,{...opts,keys:{}}));
 await assert.rejects(verifyReceipt(token,{...opts,now:now+2*86400000}));
 const parts=token.split('.');parts[1]=encoded({...claims,rights:{...claims.rights,owner:true}});await assert.rejects(verifyReceipt(parts.join('.'),opts));
 await assert.rejects(verifyReceipt(await sign({...claims,exp:iat+8*86400}),opts));
 await assert.rejects(verifyReceipt(await sign({...claims,iat:iat+600,exp:iat+86400}),opts));
});
