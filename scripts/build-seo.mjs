import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {SEO_PAGES, normalizeSeoText, tokenizeHtml, htmlAttributes, collectSeoSource} from './seo-source.mjs';

export const SEO_LANGUAGES = ['es', 'en', 'de', 'fr', 'ja', 'pt', 'it', 'ko'];
const SITE = 'https://postispop.com';
const sourceDirectory = fileURLToPath(new URL('seo-content/', import.meta.url));
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const json = value => JSON.stringify(value).replaceAll('<','\\u003c');
export const localizedPath = (path, locale) => locale === 'es' ? path : `/${locale}${path}`;
const fileFor = path => path.endsWith('/') ? `${path.slice(1)}index.html` : path.slice(1);
const canonical = (path, locale) => SITE + localizedPath(path, locale);

export async function loadSeoCatalogs(directory = sourceDirectory) {
  const catalogs = {};
  for (const locale of SEO_LANGUAGES) {
    const catalog = JSON.parse(await readFile(resolve(directory, `${locale}.json`), 'utf8'));
    if (catalog.locale !== locale) throw Error(`Wrong SEO locale: ${locale}`);
    catalogs[locale] = catalog;
  }
  const keys = Object.keys(catalogs.es.translations).sort();
  const uiKeys = Object.keys(catalogs.es.ui).sort();
  for (const [locale, catalog] of Object.entries(catalogs)) {
    if (JSON.stringify(Object.keys(catalog.translations).sort()) !== JSON.stringify(keys)) throw Error(`Incomplete translation keys: ${locale}`);
    if (JSON.stringify(Object.keys(catalog.ui).sort()) !== JSON.stringify(uiKeys)) throw Error(`Incomplete navigation: ${locale}`);
    for (const value of [...Object.values(catalog.translations), ...Object.values(catalog.ui)]) {
      if (typeof value !== 'string' || !value.trim()) throw Error(`Empty translation: ${locale}`);
    }
    if (!catalog.home?.title || !catalog.home.description || !catalog.home.heading || !catalog.home.intro || !catalog.home.cta || !catalog.home.sections?.length) throw Error(`Incomplete homepage: ${locale}`);
    for (const section of catalog.home.sections) if (!section.heading || !section.paragraphs?.length || section.paragraphs.some(p => !p.trim())) throw Error(`Incomplete homepage section: ${locale}`);
  }
  return catalogs;
}

function translate(value, catalog, source) {
  const key = normalizeSeoText(value);
  if (!Object.hasOwn(source.translations, key)) return value;
  const translated = catalog.translations[key];
  if (!translated) throw Error(`Missing ${catalog.locale} translation: ${key}`);
  return translated;
}

function alternates(path) {
  return SEO_LANGUAGES.map(locale => `<link rel="alternate" hreflang="${locale}" href="${canonical(path, locale)}">`).join('\n') +
    `\n<link rel="alternate" hreflang="x-default" href="${canonical(path, 'es')}">`;
}

function languageNav(path, catalog, catalogs) {
  return `<nav class="pp-seo-languages" aria-label="${escape(catalog.ui.language)}">${SEO_LANGUAGES.map(locale => `<a href="${localizedPath(path, locale)}" hreflang="${locale}" lang="${locale}"${locale === catalog.locale ? ' aria-current="page"' : ''}>${escape(catalogs[locale].name)}</a>`).join('')}</nav>`;
}

function mapLink(href, locale, publicPaths) {
  if (!href || href.startsWith('#') || /^(?:mailto:|tel:|data:)/i.test(href)) return href;
  let url;
  try { url = new URL(href, SITE); } catch { return href; }
  if (url.origin !== SITE) return href;
  if (url.pathname === '/' || url.pathname === '/index.html') {
    // Board actions enter the existing app; they never create a second store of notes.
    url.searchParams.set('lang', locale);
    return '/' + url.search + url.hash;
  }
  if(url.pathname==='/atelier.html'){
    url.searchParams.set('lang',locale);
    return url.pathname+url.search+url.hash;
  }
  const path = publicPaths.has(url.pathname) ? url.pathname : publicPaths.has(url.pathname + '.html') ? url.pathname + '.html' : url.pathname;
  return (publicPaths.has(path) ? localizedPath(path, locale) : path) + url.search + url.hash;
}

function translateBody(body, catalog, source, publicPaths, preserveExternalScripts = false) {
  body = body.replace(/<script\b(?=[^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi, match => preserveExternalScripts ? match : '');
  body = body.replace(/<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi, '');
  return tokenizeHtml(body).map(token => {
    if (token.type === 'text') {
      const key = normalizeSeoText(token.value);
      return Object.hasOwn(source.translations, key) ? (token.value.match(/^\s*/)?.[0] || '') + escape(translate(token.value, catalog, source)) + (token.value.match(/\s*$/)?.[0] || '') : token.value;
    }
    if (token.type !== 'tag') return token.value;
    return token.value.replace(/\b(aria-label|title|alt|placeholder)=(['"])(.*?)\2/gi, (_, name, quote, value) => `${name}="${escape(translate(value, catalog, source))}"`)
      .replace(/\bhref=(['"])(.*?)\1/gi, (_, quote, href) => `href="${escape(mapLink(normalizeSeoText(href), catalog.locale, publicPaths))}"`);
  }).join('');
}

function stylesFrom(html) {
  return [...html.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>|<link\b(?=[^>]*\brel=["']stylesheet["'])[^>]*>/gi)]
    .map(match => match[0].replace(/href=["']\.\/?([^"']+)["']/g, 'href="/$1"')).join('\n');
}

function pageHead(path, catalog, title, description, styles, extraSchema = []) {
  const url = canonical(path, catalog.locale);
  const graph = {'@context':'https://schema.org','@graph':[
    {'@type':'Organization','@id':`${SITE}/#organization`,name:'PostisPop',url:SITE+'/',logo:SITE+'/assets/icon-512.png'},
    {'@type':'WebSite','@id':canonical('/',catalog.locale)+'#website',name:'PostisPop',url:canonical('/',catalog.locale),inLanguage:catalog.locale},
    {'@type':'WebPage','@id':url+'#page',url,name:title,description,inLanguage:catalog.locale,isPartOf:{'@id':canonical('/',catalog.locale)+'#website'}},
    {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:catalog.ui.home,item:canonical('/',catalog.locale)},...(path==='/'?[]:[{'@type':'ListItem',position:2,name:title,item:url}])]},
    ...extraSchema
  ]};
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(title)}</title><meta name="description" content="${escape(description)}">
<meta name="robots" content="index,follow"><link rel="canonical" href="${url}">
${alternates(path)}
<link rel="icon" href="/favicon-smiling-note.svg"><meta name="theme-color" content="#f7f8f5">
<meta property="og:type" content="website"><meta property="og:locale" content="${catalog.ogLocale}">
${SEO_LANGUAGES.filter(locale=>locale!==catalog.locale).map(locale=>`<meta property="og:locale:alternate" content="${({es:'es_ES',en:'en_US',de:'de_DE',fr:'fr_FR',ja:'ja_JP',pt:'pt_BR',it:'it_IT',ko:'ko_KR'})[locale]}">`).join('\n')}
<meta property="og:site_name" content="PostisPop"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/postispop-og.webp"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${SITE}/assets/postispop-og.webp">
${styles}<link rel="stylesheet" href="/seo.css"><script type="application/ld+json">${json(graph)}</script>`;
}

function spanishHead(html, path, catalog, title, description) {
  // Preserve React's resource hints and hydration scripts, while replacing the
  // recovered generic sharing metadata with metadata for this exact document.
  const generated=pageHead(path,catalog,title,description,'');
  const selected=[...generated.matchAll(/<meta\b[^>]*>|<link\b[^>]*>|<script\b[^>]*>[\s\S]*?<\/script>/gi)].map(match=>match[0]).filter(tag=>{
    if(tag.startsWith('<script'))return true;
    const attrs=Object.fromEntries(htmlAttributes(tag).map(a=>[a.name,a.value]));
    return /^(?:og:|twitter:)/.test(attrs.property||attrs.name||'') || attrs.name==='robots' || attrs.rel==='alternate';
  }).join('\n');
  return html.replace(/<meta\b[^>]*>/gi,tag=>{
    const attrs=Object.fromEntries(htmlAttributes(tag).map(a=>[a.name,a.value]));
    return /^(?:og:|twitter:)/.test(attrs.property||attrs.name||'') || attrs.name==='robots' ? '' : tag;
  }).replace(/<link\b(?=[^>]*hreflang=)[^>]*>/gi,'')
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,(tag,text)=>JSON.parse(text)['@type']==='FAQPage'?tag:'')
    .replace('</head>',selected+'<link rel="stylesheet" href="/seo.css"></head>');
}

const seoStyles = `html{scroll-padding-top:1rem}.pp-seo-languages{display:flex;flex-wrap:wrap;justify-content:center;gap:.5rem;padding:1rem;margin:1rem auto;max-width:70rem;font:1rem/1.5 system-ui,sans-serif}.pp-seo-languages a{display:inline-block;padding:.4rem .65rem;min-height:2.5rem;box-sizing:border-box;border:1px solid #c5cbd3;border-radius:.5rem;color:#153451;background:#fff;text-decoration:none}.pp-seo-languages a[aria-current]{border:2px solid #970049;font-weight:700}.pp-seo-languages a:focus-visible,.pp-seo-home a:focus-visible{outline:3px solid #176cba;outline-offset:3px}.pp-seo-home{max-width:70rem;margin:auto;padding:clamp(1rem,4vw,3rem);font:1.1rem/1.7 system-ui,sans-serif;color:#192335}.pp-seo-home h1{font-size:clamp(2rem,5vw,3.5rem);line-height:1.15}.pp-seo-home p{max-width:75ch}.pp-seo-home .pp-section{margin:2rem 0}.pp-seo-home ul{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,19rem),1fr));gap:1rem;list-style:none;padding:0}.pp-seo-home li a{display:block;padding:1rem;border:1px solid #cad0d4;border-radius:1rem;color:#153451}.pp-seo-home .pp-start-primary{display:inline-block;background:#970049;color:white;padding:.75rem 1.25rem;border-radius:.75rem;text-decoration:none}.pp-seo-home footer a{margin-right:1rem}.pp-seo-home img{max-width:100%;height:auto}.pp-seo-skip{position:absolute;left:1rem;top:-6rem;background:#fff;color:#111;padding:1rem;z-index:100}.pp-seo-skip:focus{top:1rem}`;

function homeBody(catalog, catalogs, guideLinks) {
  const {home, ui, locale} = catalog;
  const link = path => localizedPath(path, locale);
  return `<a class="pp-seo-skip" href="#content">${escape(ui.skip)}</a>${languageNav('/',catalog,catalogs)}
<main id="content" class="pp-seo-home"><img src="/assets/postispop-logo.svg" width="261" height="64" alt="PostisPop">
<h1>${escape(home.heading)}</h1><p>${escape(home.intro)}</p><a class="pp-start-primary" href="/?lang=${locale}">${escape(home.cta)}</a>
${home.sections.map(section=>`<section class="pp-section"><h2>${escape(section.heading)}</h2>${section.paragraphs.map(p=>`<p>${escape(p)}</p>`).join('')}</section>`).join('')}
<section class="pp-section"><h2>${escape(ui.guides)}</h2><ul>${guideLinks.map(({path,title})=>`<li><a href="${link(path)}">${escape(title)}</a></li>`).join('')}</ul></section>
<p><a href="${link('/ayuda.html')}">${escape(ui.help)}</a> · <a href="${link('/atelier.html')}">Premium</a></p>
<footer>${['privacy','terms','legal','cookies'].map(key=>`<a href="${link('/'+key+'.html')}">${escape(ui[key])}</a>`).join('')}</footer></main>`;
}

function spanishBoardInformation(catalog, catalogs, guides) {
  const {home,ui}=catalog;
  return `<section class="pp-seo-about"><details><summary>${escape(home.heading)}</summary><h2>${escape(home.heading)}</h2><p>${escape(home.intro)}</p>${home.sections.map(section=>`<section class="pp-section"><h3>${escape(section.heading)}</h3>${section.paragraphs.map(p=>`<p>${escape(p)}</p>`).join('')}</section>`).join('')}<nav aria-label="${escape(ui.guides)}">${guides.map(({path,title})=>`<p><a href="${path}">${escape(title)}</a></p>`).join('')}</nav>${languageNav('/',catalog,catalogs)}</details></section>`;
}

export async function buildMultilingualSeo(output, {catalogDirectory=sourceDirectory} = {}) {
  const root = resolve(output);
  const catalogs = await loadSeoCatalogs(catalogDirectory);
  const source = catalogs.es;
  const current = await collectSeoSource(root);
  const missing = Object.keys(current.translations).filter(key => !Object.hasOwn(source.translations,key));
  if (missing.length) throw Error('SEO source changed; translate new content before publishing:\n'+missing.join('\n'));
  const paths = SEO_PAGES.map(page => typeof page === 'string' ? page : page.path);
  const publicPaths = new Set(paths);
  const originals = new Map();
  for (const path of paths) originals.set(path, await readFile(resolve(root,fileFor(path)),'utf8'));
  const titleFrom = html => normalizeSeoText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
  const descriptionFrom = html => normalizeSeoText(html.match(/<meta\b(?=[^>]*name=["']description["'])[^>]*content=["']([^"']*)["'][^>]*>/i)?.[1] || '');
  const guidePaths = paths.filter(path => /(?:-online|pizarra-virtual|pizarra-colaborativa|organizador-visual-de-tareas|notas-para-estudiar|pizarra-para-reuniones)\.html$/.test(path));
  const boardInformation=spanishBoardInformation(source,catalogs,guidePaths.map(path=>({path,title:titleFrom(originals.get(path))})));
  const originalBoard=originals.get('/');
  if(!/<div\b[^>]*id="pp-learn"[^>]*><\/div>/.test(originalBoard))throw Error('Spanish board information mount changed; review hydration before publishing');
  originals.set('/',originalBoard.replace(/(<div\b[^>]*id="pp-learn"[^>]*>)<\/div>/,'$1'+boardInformation+'</div>'));
  // The static document and the recovered React component must share precisely
  // the same HTML. The extra information is below the board and collapsed.
  const experienceFile=resolve(root,'experience-content.js');
  const experience=await readFile(experienceFile,'utf8');
  if(!experience.includes('export const learnContent = ``;'))throw Error('Shared board copy changed; review SEO integration');
  await writeFile(experienceFile,experience.replace('export const learnContent = ``;','export const learnContent = '+json(boardInformation)+';'));
  for (const locale of SEO_LANGUAGES) for (const path of paths) {
    const catalog = catalogs[locale], original = originals.get(path);
    let html;
    if (locale === 'es') {
      html = spanishHead(original,path,catalog,titleFrom(original),descriptionFrom(original));
      // React owns the root document's body. Its language navigation is mounted after hydration.
      if (path !== '/') html = html.replace(/<body\b([^>]*)>([\s\S]*?)<\/body>/i,(_,attributes,body)=>'<body'+attributes+'>'+body.replace(/\bhref=(['"])(.*?)\1/gi,(_,quote,href)=>`href="${escape(mapLink(normalizeSeoText(href),'es',publicPaths))}"`)+languageNav(path,catalog,catalogs)+'</body>');
    } else {
      let title, description, body, styles, schemas=[];
      if (path === '/') {
        title=catalog.home.title; description=catalog.home.description; styles='';
        body=homeBody(catalog,catalogs,guidePaths.map(p=>({path:p,title:translate(titleFrom(originals.get(p)),catalog,source)})));
      } else {
        title=translate(titleFrom(original),catalog,source); description=translate(descriptionFrom(original),catalog,source);
        if (!title || !description) throw Error(`Missing SEO metadata: ${path}`);
        body=translateBody(original.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '',catalog,source,publicPaths,path==='/atelier.html')+languageNav(path,catalog,catalogs);
        styles=stylesFrom(original);
        if(path==='/instalar.html'){
          styles+='<link rel="manifest" href="/manifest.webmanifest">';
          body+='<script src="/install-page.js" defer></script><script src="/wpo-register.js" defer></script>';
        }
        for (const match of original.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
          const schema=JSON.parse(match[1]);
          if(schema['@type']==='FAQPage') {
            const localize=value=>typeof value==='string'?translate(value,catalog,source):Array.isArray(value)?value.map(localize):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([key,item])=>[key,localize(item)])):value;
            schemas.push({...localize(schema),inLanguage:locale});
          }
        }
      }
      html=`<!doctype html>\n<html lang="${locale}"><head>${pageHead(path,catalog,title,description,styles,schemas)}</head><body>${body}</body></html>\n`;
    }
    const destination=resolve(root,fileFor(localizedPath(path,locale)));
    await mkdir(dirname(destination),{recursive:true}); await writeFile(destination,html);
  }
  const urls = SEO_LANGUAGES.flatMap(locale => paths.map(path=>({path,locale})));
  const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.map(({path,locale})=>`  <url><loc>${canonical(path,locale)}</loc>${[...SEO_LANGUAGES,'x-default'].map(lang=>`<xhtml:link rel="alternate" hreflang="${lang}" href="${canonical(path,lang==='x-default'?'es':lang)}"/>`).join('')}</url>`).join('\n')}\n</urlset>\n`;
  await writeFile(resolve(root,'sitemap.xml'),sitemap);
  await writeFile(resolve(root,'seo.css'),seoStyles+'\n.pp-seo-about{max-width:70rem;margin:1rem auto;padding:0 1rem;font:1rem/1.7 system-ui,sans-serif}.pp-seo-about summary{cursor:pointer;font-size:.8rem;min-height:2.75rem;display:list-item;padding:.5rem 0}.pp-seo-about summary:focus-visible{outline:3px solid #176cba;outline-offset:3px}.pp-seo-about a{color:inherit}.pp-seo-about nav p{margin:.5rem 0}\n');
  console.log(`Multilingual SEO: ${paths.length} public pages × ${SEO_LANGUAGES.length} languages = ${urls.length} canonical URLs.`);
  return {languages:SEO_LANGUAGES,pagesPerLanguage:paths.length,urls:urls.length};
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildMultilingualSeo(process.argv[2] || '_site');
