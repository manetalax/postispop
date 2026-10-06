/* Independent staged-output audit. Run only after scripts/stage-site.mjs.
 * Every request is fulfilled locally or blocked; production is never contacted.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const http=require('node:http');
const {parse}=require('parse5');
const {chromium}=require('playwright');
const {browserOptions}=require('./browser-options.cjs');
const {fixture}=require('./notes-first-ui.cjs');

const ROOT=path.resolve(process.env.POSTISPOP_TEST_ROOT||process.env.POSTISPOP_SITE_ROOT||'_site');
const ORIGIN='https://postispop.com';
const LANGUAGES=['es','en','de','fr','ja','pt','it','ko'];
const PUBLIC_PATHS=['/','/bloc-de-notas-online.html','/pizarra-virtual.html','/notas-adhesivas-online.html','/pizarra-colaborativa.html','/organizador-visual-de-tareas.html','/notas-para-estudiar.html','/pizarra-para-reuniones.html','/lluvia-de-ideas-online.html','/atelier.html','/instalar.html','/ayuda.html','/descargas/','/privacy.html','/terms.html','/legal.html','/cookies.html'];
const SETTINGS={es:'Ajustes',en:'Settings',de:'Einstellungen',fr:'Réglages',ja:'設定',pt:'Configurações',it:'Impostazioni',ko:'설정'};
const OG_LOCALES={es:'es_ES',en:'en_US',de:'de_DE',fr:'fr_FR',ja:'ja_JP',pt:'pt_BR',it:'it_IT',ko:'ko_KR'};
const KEY='postispop-guest-board-v1';
const localPath=(base,locale)=>locale==='es'?base:'/'+locale+base;
const expectedUrl=(base,locale)=>ORIGIN+localPath(base,locale);
const attrs=node=>Object.fromEntries((node.attrs||[]).map(item=>[item.name,item.value]));
const all=(node,predicate)=>[...(predicate(node)?[node]:[]),...(node.childNodes||[]).flatMap(child=>all(child,predicate))];
const content=node=>node.nodeName==='#text'?node.value:(node.childNodes||[]).map(content).join('');
const clean=value=>value.replace(/\s+/g,' ').trim();
const tags=(document,name)=>all(document,node=>node.tagName===name);
const one=(nodes,label)=>{assert.equal(nodes.length,1,label+' must occur exactly once');return nodes[0];};
const nonempty=(value,label)=>{assert.ok(typeof value==='string'&&value.trim(),label+' must not be empty');return value;};
const schemaNodes=value=>Array.isArray(value)?value.flatMap(schemaNodes):value&&typeof value==='object'?[value,...Object.values(value).flatMap(item=>item&&typeof item==='object'?schemaNodes(item):[])]:[];
const fileFor=urlPath=>path.resolve(ROOT,'.'+(urlPath.endsWith('/')?urlPath+'index.html':urlPath));
const fileTypes={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.woff':'font/woff','.woff2':'font/woff2','.wasm':'application/wasm','.xml':'application/xml'};

async function readPublic(urlPath){
  const filename=fileFor(decodeURIComponent(urlPath));
  if(!filename.startsWith(ROOT+path.sep))throw Error('Path outside staged site');
  return {body:await fs.readFile(filename),type:fileTypes[path.extname(filename)]||'application/octet-stream'};
}

async function run(){
  console.log('SEO phase 1: inspecting canonical documents and sitemap in '+ROOT);
  const report={createdAt:new Date().toISOString(),site:ROOT,urls:0,localTargets:0,languages:LANGUAGES,checks:[],browserCases:[],limitations:['Local staged-output checks do not certify live indexing, search ranking, Supabase accounts, or physical Android devices.']};
  const sitemap=await fs.readFile(path.join(ROOT,'sitemap.xml'),'utf8');
  const entries=[...sitemap.matchAll(/<url>\s*([\s\S]*?)<\/url>/g)].map(match=>({block:match[1],url:match[1].match(/<loc>([^<]+)<\/loc>/)?.[1]}));
  const expected=LANGUAGES.flatMap(locale=>PUBLIC_PATHS.map(base=>expectedUrl(base,locale)));
  assert.equal(expected.length,136);
  assert.deepEqual(entries.map(item=>item.url).sort(),[...expected].sort(),'Sitemap must contain precisely 17 public paths × 8 locales');
  assert.equal(new Set(entries.map(item=>item.url)).size,136,'Sitemap contains no duplicates');
  assert.ok(!entries.some(item=>new URL(item.url).pathname.startsWith('/es/')),'Spanish paths live at the root');

  const documents=new Map(),targets=new Set();
  for(const locale of LANGUAGES)for(const base of PUBLIC_PATHS){
    const url=expectedUrl(base,locale),pathname=localPath(base,locale);
    const {body}=await readPublic(pathname),html=body.toString('utf8'),doc=parse(html);
    const htmlNode=one(tags(doc,'html'),url+' html');
    assert.equal(attrs(htmlNode).lang,locale,url+' document language');
    const title=clean(content(one(tags(doc,'title'),url+' title')));
    nonempty(title,url+' title');
    const h1=one(tags(doc,'h1'),url+' H1');nonempty(clean(content(h1)),url+' H1');
    const metas=tags(doc,'meta').map(attrs),links=tags(doc,'link').map(attrs);
    const meta=name=>one(metas.filter(item=>item.name===name||item.property===name),url+' '+name).content;
    nonempty(meta('description'),url+' description');
    assert.equal(one(links.filter(item=>item.rel==='canonical'),url+' canonical').href,url,url+' canonical is self-referencing');
    for(const robots of metas.filter(item=>item.name==='robots'))assert.ok(!/noindex|nofollow/i.test(robots.content),url+' remains indexable');
    const alternate=links.filter(item=>item.rel==='alternate'&&item.hreflang);
    assert.equal(alternate.length,9,url+' has nine hreflang links');
    for(const language of [...LANGUAGES,'x-default']){
      assert.equal(one(alternate.filter(item=>item.hreflang===language),url+' hreflang '+language).href,expectedUrl(base,language==='x-default'?'es':language));
    }
    const sitemapEntry=entries.find(item=>item.url===url);
    const sitemapLinks=[...sitemapEntry.block.matchAll(/<xhtml:link\b[^>]*>/g)].map(item=>attrs(tags(parse(item[0]),'xhtml:link')[0]||{}));
    assert.equal(sitemapLinks.length,9,url+' sitemap hreflang count');
    for(const language of [...LANGUAGES,'x-default'])assert.equal(one(sitemapLinks.filter(item=>item.hreflang===language),url+' sitemap '+language).href,expectedUrl(base,language==='x-default'?'es':language));
    assert.equal(meta('og:url'),url,url+' Open Graph URL matches canonical');
    assert.equal(meta('og:locale'),OG_LOCALES[locale],url+' Open Graph locale');
    assert.equal(meta('twitter:card'),'summary_large_image',url+' Twitter card');
    for(const field of ['og:type','og:site_name','og:title','og:description','og:image','twitter:title','twitter:description','twitter:image'])nonempty(meta(field),url+' '+field);
    for(const field of ['og:image','twitter:image']){const image=new URL(meta(field),url);assert.equal(image.origin,ORIGIN);targets.add(image.pathname);}
    const schemas=tags(doc,'script').filter(node=>attrs(node).type==='application/ld+json').map(node=>JSON.parse(content(node)));
    assert.ok(schemas.length,url+' has structured data');
    const languageSchemas=schemas.flatMap(schemaNodes).filter(node=>Object.hasOwn(node,'inLanguage'));
    assert.ok(languageSchemas.length,url+' structured data declares inLanguage');
    for(const schema of languageSchemas)assert.equal(String(schema.inLanguage).split(/[-_]/)[0],locale,url+' structured data language');
    for(const schema of schemas.flatMap(schemaNodes).filter(node=>node['@type']==='WebPage'))assert.equal(schema.url,url,url+' structured WebPage URL');
    for(const anchor of tags(doc,'a')){
      const href=attrs(anchor).href;if(!href)continue;
      const link=new URL(href,url);if(!['http:','https:'].includes(link.protocol)||link.origin!==ORIGIN)continue;
      assert.ok(!/^\/(?:api|auth)(?:\/|$)|^\/propietario\.html$/.test(link.pathname),url+' must not link to private endpoints');
      targets.add(link.pathname);
    }
    targets.add(pathname);documents.set(url,{doc,locale,base,title,alternate});report.urls++;
  }
  // Independent pairwise reciprocity check, including the Spanish default.
  for(const [url,{alternate}] of documents)for(const link of alternate){
    const target=documents.get(link.href);assert.ok(target,url+' alternate must be a staged canonical page');
    assert.ok(target.alternate.some(back=>back.href===url),url+' hreflang must be reciprocal');
  }
  report.checks.push('136 canonical documents: titles, descriptions, H1, language, nine reciprocal hreflang links, JSON-LD and Open Graph/Twitter');
  console.log('PASS SEO metadata: '+report.urls+' documents and reciprocal HTML/sitemap hreflang');

  const server=http.createServer(async(req,res)=>{
    try{const item=await readPublic(new URL(req.url,'http://127.0.0.1').pathname);res.writeHead(200,{'Content-Type':item.type});res.end(item.body);}
    catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found in staged site');}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{
    const base='http://127.0.0.1:'+server.address().port;
    for(const target of targets){const response=await fetch(base+target,{signal:AbortSignal.timeout(10000)});assert.equal(response.status,200,'Staged internal link must return HTTP 200: '+target);await response.arrayBuffer();report.localTargets++;}
  }finally{await new Promise(resolve=>server.close(resolve));}
  report.checks.push(report.localTargets+' unique internal links and social images return local HTTP 200; legacy fragment targets are not audited');
  console.log('PASS SEO links: '+report.localTargets+' unique staged HTTP 200 targets');

  const browser=await chromium.launch(browserOptions());
  async function contextFor(javaScriptEnabled){
    const context=await browser.newContext({javaScriptEnabled,viewport:{width:1366,height:900},locale:'es-ES',serviceWorkers:'block'});
    context.setDefaultTimeout(20000);context.setDefaultNavigationTimeout(20000);
    const missing=[];
    await context.route('**/*',async route=>{
      const url=new URL(route.request().url());
      if(url.origin!==ORIGIN||route.request().method()!=='GET')return route.abort();
      try{const item=await readPublic(url.pathname);return route.fulfill({status:200,contentType:item.type,body:item.body});}
      catch{missing.push(url.pathname);return route.fulfill({status:404,body:'Not found in staged site'});}
    });
    return {context,missing};
  }
  const seoCopy=page=>page.evaluate(()=>{
    const container=document.querySelector('#pp-learn')||document.querySelector('main');
    if(!container)return [];
    return [...container.querySelectorAll('h1,h2,h3,p')].filter(node=>!node.closest('script,style,[data-wpo-toolbar]')).map(node=>node.textContent.replace(/\s+/g,' ').trim()).filter(Boolean);
  });
  try{
    for(const locale of LANGUAGES){
      console.log('SEO browser '+locale+': checking landing and guide with/without JavaScript');
      const plain=await contextFor(false),live=await contextFor(true);
      const expectedBoard=JSON.stringify(fixture(6));
      await live.context.addInitScript(({KEY,expectedBoard})=>{
        if(!localStorage.getItem('pp:seo-test-seeded')){
          localStorage.setItem(KEY,expectedBoard);localStorage.setItem('pp:lang','fr');
          localStorage.setItem('pp:onboarding-seen','1');localStorage.setItem('pp:analytics-consent-v2','no');
          localStorage.setItem('pp:seo-test-seeded','1');
        }
      },{KEY,expectedBoard});
      const plainPage=await plain.context.newPage(),livePage=await live.context.newPage(),errors=[];
      livePage.on('pageerror',error=>errors.push(error.message));
      livePage.on('console',message=>{if(message.type()==='error'&&/react|hydrat|minified/i.test(message.text()))errors.push(message.text());});
      try{
        for(const base of ['/','/bloc-de-notas-online.html']){
          const url=expectedUrl(base,locale);
          assert.equal((await plainPage.goto(url)).status(),200);assert.equal((await livePage.goto(url)).status(),200);
          if(locale==='es'&&base==='/')await livePage.waitForFunction(()=>document.documentElement.dataset.ppReady==='true');
          const noJs=await seoCopy(plainPage),withJs=await seoCopy(livePage);
          assert.ok(noJs.join(' ').length>300,url+' contains substantial public text with JavaScript disabled');
          assert.deepEqual(withJs,noJs,url+' SEO headings and paragraphs do not depend on JavaScript');
          assert.equal(await plainPage.locator('html').getAttribute('lang'),locale);
          report.browserCases.push({locale,path:base,noScriptParity:true});
        }
        // Enter from an actual localized guide CTA; the default-language home
        // is the board itself, so guides provide the same real entry for all 8.
        const hrefs=await livePage.locator('a.pp-start-primary[href]').evaluateAll(anchors=>anchors.map(anchor=>anchor.getAttribute('href')));
        const entry=hrefs.find(href=>{try{const u=new URL(href,ORIGIN);return u.origin===ORIGIN&&u.pathname==='/'&&u.searchParams.get('lang')===locale&&!u.searchParams.has('action');}catch{return false;}});
        assert.ok(entry,locale+' guide has a board CTA carrying ?lang='+locale);
        const entryLink=livePage.locator('a.pp-start-primary[href]').filter({visible:true});
        const selected=await entryLink.evaluateAll((anchors,href)=>anchors.findIndex(anchor=>anchor.getAttribute('href')===href),entry);
        assert.ok(selected>=0,locale+' board CTA is visible');
        console.log('SEO browser '+locale+': entering board, checking persistence and note integrity');
        await entryLink.nth(selected).click();
        await livePage.waitForFunction(code=>document.documentElement.dataset.ppReady==='true'&&document.documentElement.lang===code,locale);
        // The compact workspace deliberately keeps account/settings controls
        // inside its menu, even on desktop. Open it as a user would.
        if(!await livePage.locator('.settings-button').isVisible())await livePage.locator('.pp-menu-toggle').click();
        await livePage.locator('.settings-button').waitFor({state:'visible'});
        assert.equal(await livePage.locator('.settings-button').getAttribute('aria-label'),SETTINGS[locale],locale+' core interface label');
        assert.equal(await livePage.evaluate(()=>localStorage.getItem('pp:lang')),locale,locale+' preference is saved');
        assert.equal(await livePage.evaluate(KEY=>localStorage.getItem(KEY),KEY),expectedBoard,locale+' entry preserves stored notes exactly');
        await livePage.reload();
        await livePage.waitForFunction(code=>document.documentElement.dataset.ppReady==='true'&&document.documentElement.lang===code,locale);
        assert.equal(await livePage.locator('.settings-button').getAttribute('aria-label'),SETTINGS[locale],locale+' choice survives reload');
        assert.equal(await livePage.evaluate(KEY=>localStorage.getItem(KEY),KEY),expectedBoard,locale+' reload preserves stored notes exactly');
        assert.equal(await livePage.locator('#pp-language-navigation a').count(),8,locale+' hydrated board has eight public-language links');
        assert.deepEqual(errors,[],locale+' page/hydration errors');
        assert.deepEqual([...new Set([...plain.missing,...live.missing])],[],locale+' missing local browser assets');
        report.browserCases.push({locale,cta:true,coreLabel:true,persisted:true,notesPreserved:true});
        console.log('PASS '+locale+': landing/guide without JavaScript, CTA, core language, persisted preference and unchanged notes');
      }finally{await plain.context.close();await live.context.close();}
    }
  }finally{await browser.close();}
  const output=path.resolve('test-results/seo-ui/report.json');await fs.mkdir(path.dirname(output),{recursive:true});await fs.writeFile(output,JSON.stringify(report,null,2)+'\n');
  console.log('PASS: '+report.urls+' public URLs, '+report.localTargets+' local HTTP targets, 8 language entry/persistence checks. Report: '+output);
}
if(require.main===module)run().catch(error=>{console.error(error);process.exitCode=1;});
module.exports={run};
