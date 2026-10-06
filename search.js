/* Búsqueda de contenido público; nunca lee notas, sesiones ni cuentas. */
(() => {
  'use strict';
  const form=document.getElementById('pp-search');
  const input=document.getElementById('q');
  const results=document.getElementById('pp-search-results');
  const status=document.getElementById('pp-search-status');
  if(!form||!input||!results||!status)return;
  let indexPromise,revision=0;
  const normalize=text=>String(text).normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase('es');
  async function search(query){
    const request=++revision;
    results.replaceChildren();
    if(!query.trim()){status.textContent='Escribe una palabra o una frase.';return;}
    status.textContent='Buscando…';
    try{
      indexPromise ||= fetch('/search-index.json',{credentials:'omit'}).then(response=>{
        if(!response.ok)throw new Error('No se pudo cargar el índice');
        return response.json();
      });
      const index=await indexPromise;
      if(request!==revision)return;
      const terms=normalize(query).split(/\s+/).filter(Boolean);
      const matches=index.filter(item=>terms.every(term=>normalize(item.title+' '+item.description).includes(term)));
      for(const item of matches){
        const url=new URL(item.url,location.origin);
        if(url.origin!==location.origin)continue;
        const li=document.createElement('li');
        const title=document.createElement('a');
        title.href=url.pathname+url.hash;title.textContent=item.title;
        const description=document.createElement('p');description.textContent=item.description;
        li.append(title,description);results.append(li);
      }
      status.textContent=matches.length===1?'1 resultado.':`${matches.length} resultados.`;
    }catch{
      indexPromise=null;
      if(request===revision)status.textContent='No se pudo cargar la búsqueda. Comprueba la conexión y vuelve a intentarlo.';
    }
  }
  input.value=(new URL(location.href).searchParams.get('q')||'').slice(0,150);
  search(input.value);
  form.addEventListener('submit',event=>{
    event.preventDefault();
    history.replaceState(null,'','/search/?q='+encodeURIComponent(input.value));
    search(input.value);
  });
})();
