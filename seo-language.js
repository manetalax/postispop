import {whenReactReady} from './ui-ready.js';

// The public language pages and the board share a strict, explicit allowlist.
// Choosing a language never changes a board, note, account, or cookie.
export const SEO_LANGUAGES = Object.freeze([
  ['es','Español','/'], ['en','English','/en/'], ['de','Deutsch','/de/'],
  ['fr','Français','/fr/'], ['pt','Português','/pt/'], ['it','Italiano','/it/'],
  ['ja','日本語','/ja/'], ['ko','한국어','/ko/']
].map(([code,label,href])=>Object.freeze({code,label,href})));
const supported = new Set(SEO_LANGUAGES.map(language=>language.code));
const valid = value => typeof value==='string' && supported.has(value) ? value : null;
const navigationLabels = {
  es:'PostisPop en otros idiomas', en:'PostisPop in other languages',
  de:'PostisPop in anderen Sprachen', fr:'PostisPop dans d’autres langues',
  pt:'PostisPop em outros idiomas', it:'PostisPop in altre lingue',
  ja:'PostisPopの表示言語', ko:'PostisPop 언어'
};

export function resolveBoardLanguage(search='',saved='') {
  const requested = new URLSearchParams(search).get('lang');
  return valid(requested) || valid(saved) || 'es';
}

export function readBoardLanguage() {
  if(typeof window==='undefined')return 'es';
  let saved='';
  try{saved=window.localStorage.getItem('pp:lang')||'';}catch{}
  return resolveBoardLanguage(window.location.search,saved);
}

// Consume an explicit board-entry preference after hydration. The existing
// React language effect owns persistence; later choices in Settings therefore
// survive reload instead of being overridden by a stale ?lang= entry link.
export function consumeBoardLanguageQuery() {
  if(typeof window==='undefined')return;
  try {
    const url=new URL(window.location.href);
    if(!['/','/index.html'].includes(url.pathname)||!valid(url.searchParams.get('lang')))return;
    url.searchParams.delete('lang');
    window.history.replaceState(window.history.state,'',url.pathname+url.search+url.hash);
  }catch{}
}

let navigationInitialized=false,scheduled=false;
export function initSeoLanguageNavigation() {
  if(navigationInitialized||typeof document==='undefined'||typeof window==='undefined')return;
  navigationInitialized=true;
  whenReactReady(()=>{
    const refresh=()=>{
      // Append after the existing footer only once React has committed. The
      // links do not replace React elements or intercept app interactions.
      const footer=document.querySelector('.postispop .site-legal-links:not(#pp-language-navigation)');
      if(!footer)return;
      let nav=document.getElementById('pp-language-navigation');
      if(!nav){
        nav=document.createElement('nav');nav.id='pp-language-navigation';
        nav.className='site-legal-links pp-language-links';
        for(const {code,label,href} of SEO_LANGUAGES){
          const link=document.createElement('a');link.textContent=label;
          link.href=href;link.hreflang=code;link.lang=code;nav.append(link);
        }
        footer.after(nav);
      }
      const label=navigationLabels[document.documentElement.lang]||navigationLabels.es;
      if(nav.getAttribute('aria-label')!==label)nav.setAttribute('aria-label',label);
    };
    const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;refresh();});};
    new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
    new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    refresh();
  });
}

if(typeof document!=='undefined'&&typeof window!=='undefined')initSeoLanguageNavigation();
