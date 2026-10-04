import { stat, mkdir, cp, readFile, writeFile } from 'node:fs/promises';
import { resolve, isAbsolute } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const root = resolve(import.meta.dirname, '..');
const required = ['POSTISPOP_KEYSTORE','POSTISPOP_STORE_PASSWORD','POSTISPOP_KEY_PASSWORD'];
for (const key of required) if (!process.env[key]) throw new Error(`Missing ${key}: restore the EXISTING owner's signing key; never create a replacement.`);
if (!isAbsolute(process.env.POSTISPOP_KEYSTORE)) throw new Error('POSTISPOP_KEYSTORE must be an absolute path outside the source repository.');
if (resolve(process.env.POSTISPOP_KEYSTORE).startsWith(root + '/')) throw new Error('Keep the private signing key outside the source repository.');
await stat(process.env.POSTISPOP_KEYSTORE);
function run(command, args, capture = false) {
  const result = spawnSync(command,args,{cwd:root,env:process.env,encoding:'utf8',stdio:capture?'pipe':'inherit'});
  if (result.error || result.status !== 0) throw new Error(`${command} failed; inspect the local build output. No verified installer was exported.`);
  return result.stdout || '';
}
run(process.execPath,['--run','build']);
run(process.execPath,['scripts/package-mobile.mjs']);
run(process.execPath,['--test','tests/packaging.test.cjs']);
run(process.env.POSTISPOP_GRADLE || 'gradle',['-p','android','--no-daemon','assembleRelease','lintRelease']);
const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
if (!sdk && !process.env.POSTISPOP_APKSIGNER) throw new Error('ANDROID_HOME or POSTISPOP_APKSIGNER is required to verify the installer.');
const signer = process.env.POSTISPOP_APKSIGNER || resolve(sdk,'build-tools/36.0.0/apksigner');
const apk = resolve(root,'android/app/build/outputs/apk/release/app-release.apk');
await stat(apk);
const verification = run(signer,['verify','--verbose','--print-certs',apk],true);
const fingerprint = verification.match(/certificate SHA-256 digest:\s*([a-f0-9]+)/i)?.[1];
if (!fingerprint) throw new Error('APK certificate not verified. No installer exported.');
const expected = process.env.POSTISPOP_CERT_SHA256?.replaceAll(':','').toLowerCase();
if (expected && fingerprint.toLowerCase() !== expected) throw new Error('APK certificate differs from the expected existing identity. No installer exported.');
const target = resolve(root,'android/app/build/verified');
await mkdir(target,{recursive:true});
const name = 'PostisPop-0.4.0-release-signed.apk';
await cp(apk,resolve(target,name));
const bytes = await readFile(apk);
const bundle = JSON.parse(await readFile(resolve(root,'android/app/src/main/assets/www/bundle-manifest.json'),'utf8'));
await writeFile(resolve(target,'verification.json'),JSON.stringify({
  file:name,applicationId:'com.postispop.android',version:'0.4.0',versionCode:4,
  bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),
  certificateSha256:fingerprint,bundledContentHash:bundle.contentHash,
  signatureVerified:true,physicalInstallationTested:false,published:false,
},null,2)+'\n');
console.log(`Verified signed APK exported to ${target}. Physical installation has not been tested.`);
