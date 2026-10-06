/** Isolated accessibility/performance audit. No account or production API access.
 * node scripts/audit-quality.mjs [--lighthouse] [--lighthouse-runs=3]
 * --lighthouse-only --append-lighthouse reuses existing axe evidence for unchanged builds.
 * Requires locally installed axe-core; Lighthouse is opt-in and requires lighthouse.
 */
import { createRequire } from 'node:module';
import { mkdir,writeFile,readFile,stat } from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { gzipSync } from 'node:zlib';
import { chromium } from 'playwright';
const require=createRequire(import.meta.url);
const {browserOptions}=require('../tests/browser-options.cjs');
const {isolatedContext,fixture,ready,VIEWPORTS,ROOT}=require('../tests/notes-first-ui.cjs');
async function settledUI(page,state){
  await page.evaluate(async()=>{
    await document.fonts.ready;
    // Let newly mounted controls commit styles before inspecting animations.
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  });
  await page.waitForFunction(state=>{
    const moving=document.getAnimations().some(animation=>
      animation.effect?.getTiming?.().iterations!==Infinity&&
      (animation.pending||animation.playState==='running'));
    const dialog=document.querySelector('.editor-dialog');
    return !moving&&(state==='board'||(dialog&&Number(getComputedStyle(dialog).opacity)===1));
  },state);
}
const output=path.resolve('test-results/quality');
await mkdir(output,{recursive:true});
const summary={createdAt:new Date().toISOString(),site:ROOT,axe:[],lighthouse:[],limitations:['Automated accessibility checks are partial; no physical device or screen reader is covered.','Lighthouse runs on a gzip-enabled local static server with external host resolution blocked; scores do not represent production network performance.']};
try{summary.stageHash=JSON.parse(await readFile(path.join(ROOT,'bundle-manifest.json'),'utf8')).contentHash;}catch{summary.stageHash=null;}
if(process.argv.includes('--append-lighthouse')){const previous=JSON.parse(await readFile(path.join(output,'summary.json'),'utf8'));if(previous.stageHash&&previous.stageHash!==summary.stageHash)throw Error('Cannot combine Lighthouse runs from different staged builds. Run a fresh audit.');summary.axe=previous.axe;summary.lighthouse=previous.lighthouse;}
if(!process.argv.includes('--lighthouse-only')){
let axePath;
try{axePath=require.resolve('axe-core/axe.min.js');}catch{throw Error('axe-core is required. Install this development-only dependency before auditing.');}
const browser=await chromium.launch(browserOptions());
try {
  for(const [width,height] of VIEWPORTS){
    const {context}=await isolatedContext(browser,{width,height},fixture(6));const page=await context.newPage();
    await page.goto('https://postispop.com/');await ready(page);
    for(const state of ['board','editor','editor-empty']){
      if(state==='editor'){await page.locator('.sticky-note[data-note-id]').first().click();await page.waitForSelector('.pp-editor-toolbar');}
      if(state==='editor-empty')await page.locator('.editor-dialog textarea').fill('');
      // Keep real animations and every axe rule; inspect the settled UI. Empty
      // notes separately cover placeholder contrast, which populated notes hide.
      await settledUI(page,state);
      await page.addScriptTag({path:axePath});
      const result=await page.evaluate(async()=>{
        const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}});
        return {violations:r.violations,incomplete:r.incomplete,passes:r.passes.map(p=>p.id)};
      });
      const name=`${state}-${width}x${height}`;
      const violations=result.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,helpUrl:v.helpUrl,nodes:v.nodes.map(n=>({target:n.target,html:n.html,failureSummary:n.failureSummary}))}));
      await writeFile(path.join(output,`axe-${name}.json`),JSON.stringify(result,null,2));
      await page.screenshot({path:path.join(output,`${name}.png`),fullPage:false});
      summary.axe.push({name,violations,incomplete:result.incomplete.map(v=>({id:v.id,nodes:v.nodes.length})),passes:result.passes.length});
      console.log(`AXE ${name}: ${violations.length} violations (${violations.map(v=>v.id+':'+v.impact).join(', ')})`);
    }
    await context.close();
  }
}finally{await browser.close();}
}
if(process.argv.includes('--lighthouse')||process.argv.includes('--lighthouse-only')){
  const {default:lighthouse}=await import('lighthouse');
  const {default:desktopConfig}=await import('lighthouse/core/config/desktop-config.js');
  const server=http.createServer(async(req,res)=>{
    const url=new URL(req.url,'http://127.0.0.1');let file=path.resolve(ROOT,'.'+(url.pathname==='/'?'/index.html':url.pathname));
    if(!file.startsWith(ROOT+path.sep)||req.method!=='GET'){res.writeHead(403);res.end();return;}
    try{if((await stat(file)).isDirectory())file=path.join(file,'index.html');let content=await readFile(file);const compressed=Boolean(req.headers['accept-encoding']?.includes('gzip')&&/\.(html|css|js|json|svg)$/.test(file));if(compressed)content=gzipSync(content);res.writeHead(200,{...(compressed?{'Content-Encoding':'gzip','Vary':'Accept-Encoding'}:{}),'Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.woff2':'font/woff2'}[path.extname(file)]||'application/octet-stream'});res.end(content);}catch{res.writeHead(404);res.end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const target=`http://127.0.0.1:${server.address().port}/`;
  // DNS blockade covers production and every other named external host.
  // Chromium's isolated temporary profile contains no user account or saved notes.
  const debuggingServer=http.createServer();await new Promise(resolve=>debuggingServer.listen(0,'127.0.0.1',resolve));const debugPort=debuggingServer.address().port;await new Promise(resolve=>debuggingServer.close(resolve));
  const auditBrowser=await chromium.launch(browserOptions({args:[`--remote-debugging-port=${debugPort}`,'--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1, EXCLUDE localhost','--disable-background-networking']}));
  try {
    const runs=Math.max(1,Math.min(5,Number(process.argv.find(arg=>arg.startsWith('--lighthouse-runs='))?.split('=')[1])||1));
    for(let sample=0;sample<runs;sample++)for(const formFactor of ['mobile','desktop']){
      const run=summary.lighthouse.filter(item=>item.formFactor===formFactor).length+1;
      const options={port:debugPort,output:['html','json'],logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo'],disableStorageReset:false,blockedUrlPatterns:['https://*'],formFactor,screenEmulation:formFactor==='mobile'?{mobile:true,width:390,height:844,deviceScaleFactor:1,disabled:false}:{mobile:false,width:1366,height:768,deviceScaleFactor:1,disabled:false}};
      const result=await lighthouse(target,options,formFactor==='desktop'?desktopConfig:undefined);
      for(const [index,extension]of ['html','json'].entries())await writeFile(path.join(output,`lighthouse-${formFactor}${run===1?'':'-run'+run}.${extension}`),result.report[index]);
      const scores=Object.fromEntries(Object.entries(result.lhr.categories).map(([name,value])=>[name,value.score]));
      const item={formFactor,run,scores,metrics:Object.fromEntries(['first-contentful-paint','largest-contentful-paint','cumulative-layout-shift','total-blocking-time','speed-index'].map(id=>[id,result.lhr.audits[id]?.displayValue])),metricValues:Object.fromEntries(['first-contentful-paint','largest-contentful-paint','cumulative-layout-shift','total-blocking-time','speed-index'].map(id=>[id,result.lhr.audits[id]?.numericValue])),transferBytes:result.lhr.audits['total-byte-weight']?.numericValue,warnings:result.lhr.runWarnings,failedAudits:Object.values(result.lhr.audits).filter(a=>a.score!==null&&a.score<1).map(a=>({id:a.id,title:a.title,score:a.score,displayValue:a.displayValue}))};summary.lighthouse.push(item);console.log('LIGHTHOUSE '+formFactor+' '+JSON.stringify(scores));
    }
  }finally{await auditBrowser.close();await new Promise(resolve=>server.close(resolve));}
}
summary.lighthouseMedians=Object.fromEntries(['mobile','desktop'].map(form=>{const rows=summary.lighthouse.filter(r=>r.formFactor===form);const median=values=>{const sorted=values.filter(v=>Number.isFinite(v)).sort((a,b)=>a-b);if(!sorted.length)return null;const middle=Math.floor(sorted.length/2);return sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2;};return [form,{runs:rows.length,scores:Object.fromEntries(['performance','accessibility','best-practices','seo'].map(key=>[key,median(rows.map(r=>r.scores[key]))])),metricValues:Object.fromEntries(['first-contentful-paint','largest-contentful-paint','cumulative-layout-shift','total-blocking-time','speed-index'].map(key=>[key,median(rows.map(r=>r.metricValues?.[key]))])),transferBytes:median(rows.map(r=>r.transferBytes))}];}));
await writeFile(path.join(output,'summary.json'),JSON.stringify(summary,null,2));
const blocking=summary.axe.flatMap(s=>s.violations.filter(v=>['critical','serious'].includes(v.impact)).map(v=>`${s.name}: ${v.id}`));
console.log(`Summary: ${path.join(output,'summary.json')}`);
if(blocking.length){console.error('Blocking accessibility findings:\n'+blocking.join('\n'));process.exitCode=1;}
