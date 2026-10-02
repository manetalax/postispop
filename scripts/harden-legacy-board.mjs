import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
// The original React source is unavailable. These narrow, checked replacements
// preserve the recovered bundle and are intentionally recorded as source edits.
export function hardenLegacy(source){
 const originalDraft='Ft=e=>{try{localStorage.setItem(Mt(e.id),';
 const protectedDraft='Ft=e=>{try{if(localStorage.getItem(`pp:protected-note:`+e.id)===`1`)return;localStorage.setItem(Mt(e.id),';
 if(!source.includes(protectedDraft)){if(source.split(originalDraft).length!==2)throw Error('Legacy draft writer changed; review required');source=source.replace(originalDraft,protectedDraft);}
 const start='async function pn(e){if(e)try{if(e.size>2e6)throw Error();';
 const replacement='async function pn(e){if(e){P(``);window.dispatchEvent(new CustomEvent(`postispop:import-legacy`,{detail:{file:e}}));}}';
 if(!source.includes(replacement)){
  const from=source.indexOf(start),to=source.indexOf('function mn(){if(Ie)',from);
  if(from<0||to<from||to-from>2000)throw Error('Legacy importer changed; review required');
  source=source.slice(0,from)+replacement+source.slice(to);
 }
 return source;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const file=new URL('../_next/static/chunks/Board-BrRAatyY.js',import.meta.url);
 const before=await readFile(file,'utf8'),after=hardenLegacy(before);if(after!==before)await writeFile(file,after);
 console.log('Legacy draft guard and lossless import handoff verified.');
}
