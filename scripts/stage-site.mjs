import {cp,mkdir,rm,readdir,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url), out=new URL('_site/',root);
await rm(out,{recursive:true,force:true});await mkdir(new URL('tienda/',out),{recursive:true});
const files=['index.html','manifest.json','manifest.webmanifest','robots.txt','sitemap.xml','CNAME','favicon.svg','favicon.ico','privacy.html','terms.html','legal.html','cookies.html','postispop-shop.js','commerce-ui.js','commerce.css','supabase-bridge.js','supabase-config.js','guest-board.js','guest-status.js','note-attachments.js','note-attachments.css','experience-content.js','experience.css','experience.js','usage-metrics.js','board-tools.js'];
for(const name of await readdir(root))if(/(?:-online|pizarra-virtual|pizarra-colaborativa|organizador-visual-de-tareas|notas-para-estudiar|pizarra-para-reuniones)\.html$/.test(name))files.push(name);
for(const name of files)await cp(new URL(name,root),new URL(name,out));
// Never publish the captured /api snapshots from the original exported website.
for(const name of ['assets','_next','.well-known'])await cp(new URL(name,root),new URL(name,out),{recursive:true});
await cp(new URL('astro-dist/',root),new URL('tienda/',out),{recursive:true});
await writeFile(new URL('.nojekyll',out),'');
console.log('Staged app, guides and shop; captured API data excluded.');
