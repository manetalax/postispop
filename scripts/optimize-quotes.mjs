import { readFile, writeFile, mkdir, readdir, cp } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const sourceName = 'Board-BrRAatyY.js';
const digest = value => createHash('sha256').update(value).digest('hex').slice(0, 12);

// The recovered editor has no original source build. Transform only its known
// quote catalog, fail closed if its structure changes, and preserve all entries.
export function extractQuotes(source) {
  const start = source.indexOf('var pd={version:3,complete:!0,target:1e3,languages:JSON.parse(');
  const end = source.indexOf('function md(', start);
  if (start < 0 || end < 0) throw Error('Daily quote catalog changed; review the optimizer.');
  const declaration = source.slice(start, end);
  const languages = vm.runInNewContext(declaration + 'pd.languages', {}, {
    timeout: 1000, contextCodeGeneration: { strings: false, wasm: false }
  });
  const expected = ['de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'pt'];
  if (Object.keys(languages).sort().join() !== expected.join() ||
      Object.values(languages).some(items => !Array.isArray(items) || items.length !== 1000 ||
        items.some(item => !item.id || typeof item.text !== 'string' || typeof item.author !== 'string' || !item.source))) {
    throw Error('Unexpected daily quote catalog; refusing to discard data.');
  }
  return { start, end, languages };
}

export function transformQuotes(source, urls) {
  const { start, end } = extractQuotes(source);
  const oldEffect = '(0,u.useEffect)(()=>{let t=()=>n(md(new Date,pd.languages[e].length));t();let r=setInterval(t,3e4);return document.addEventListener(`visibilitychange`,t),()=>{clearInterval(r),document.removeEventListener(`visibilitychange`,t)}},[e]);';
  if (source.split(oldEffect).length !== 2 || source.split('pd.languages[e][t]').length !== 2) {
    throw Error('Daily quote component changed; review the optimizer.');
  }
  const loader = `var pd={version:3,complete:!0,target:1e3,languages:{},source:'QuoteKG, CC BY-SA 4.0'};
const ppQuoteUrls=${JSON.stringify(urls)},ppQuotePending={};
function ppLoadQuotes(lang){if(pd.languages[lang])return Promise.resolve(pd.languages[lang]);if(!Object.hasOwn(ppQuoteUrls,lang))return Promise.reject(Error('Unknown quote language'));return ppQuotePending[lang]||(ppQuotePending[lang]=import(ppQuoteUrls[lang]).then(module=>{pd.languages[lang]=module.default;return module.default;}).catch(error=>{delete ppQuotePending[lang];throw error;}));}
`;
  const effect = `(0,u.useEffect)(()=>{let disposed=false;n(null);const refresh=()=>{if(disposed||document.visibilityState==='hidden'||!document.querySelector('.pp-quote-host,.pp-daily-quote-banner'))return;ppLoadQuotes(e).then(items=>{if(!disposed)n(md(new Date,items.length));}).catch(()=>{});};const idle=window.requestIdleCallback?window.requestIdleCallback(refresh,{timeout:2000}):setTimeout(refresh,0);const interval=setInterval(refresh,30000);document.addEventListener('visibilitychange',refresh);window.addEventListener('online',refresh);return()=>{disposed=true;window.cancelIdleCallback?window.cancelIdleCallback(idle):clearTimeout(idle);clearInterval(interval);document.removeEventListener('visibilitychange',refresh);window.removeEventListener('online',refresh);};},[e]);`;
  return (source.slice(0, start) + loader + source.slice(end))
    .replace(oldEffect, effect).replace('pd.languages[e][t]', 'pd.languages[e]?.[t]');
}

async function filesBelow(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    if (entry.isDirectory()) files.push(...await filesBelow(file));
    else if (/\.(?:html|js)$/.test(entry.name)) files.push(file);
  }
  return files;
}

export async function optimizeQuotes(output) {
  const original = new URL('_next/static/chunks/' + sourceName, output);
  const source = await readFile(original, 'utf8');
  const { languages } = extractQuotes(source);
  const urls = {};
  await mkdir(new URL('assets/quotes/', output), { recursive: true });
  for (const [language, quotes] of Object.entries(languages)) {
    const code = '// QuoteKG, CC BY-SA 4.0. Original source URL retained for each quote.\nexport default ' + JSON.stringify(quotes) + ';\n';
    const path = `assets/quotes/${language}.${digest(code)}.js`;
    await writeFile(new URL(path, output), code);
    urls[language] = '/' + path;
  }
  const code = transformQuotes(source, urls);
  const originalDirectory=new URL('_next/static/chunks/',output);
  const graphHash=createHash('sha256');
  for(const file of (await filesBelow(originalDirectory)).sort((a,b)=>a.href.localeCompare(b.href))){
    graphHash.update(file.href.slice(originalDirectory.href.length));
    graphHash.update(file.href===original.href?code:await readFile(file));
  }
  const directory='_next/static/chunks-quotes-'+graphHash.digest('hex').slice(0,12)+'/';
  const targetDirectory=new URL(directory,output);
  await cp(originalDirectory,targetDirectory,{recursive:true});
  await writeFile(new URL(sourceName,targetDirectory),code);
  // Version the WHOLE import graph: unchanged hashed helper modules also
  // import the entry point. Never mix those with seven-day cached old modules.
  // Keep the old graph intact for already-open tabs and previously cached HTML.
  for (const file of await filesBelow(output)) {
    if(file.href.startsWith(originalDirectory.href))continue;
    const content = await readFile(file, 'utf8');
    if(content.includes('_next/static/chunks/'))await writeFile(file,content.replaceAll('_next/static/chunks/',directory));
  }
  return { before: Buffer.byteLength(source), after: Buffer.byteLength(code), languages: Object.keys(urls).length, directory };
}
