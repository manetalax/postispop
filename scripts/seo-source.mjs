import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export const SEO_PAGES=[
  {id:'home',path:'/',file:'index.html'},
  ...['bloc-de-notas-online','pizarra-virtual','notas-adhesivas-online','pizarra-colaborativa','organizador-visual-de-tareas','notas-para-estudiar','pizarra-para-reuniones','lluvia-de-ideas-online','atelier','instalar','ayuda'].map(id=>({id,path:`/${id}.html`,file:`${id}.html`})),
  {id:'descargas',path:'/descargas/',file:'descargas/index.html'},
  ...['privacy','terms','legal','cookies'].map(id=>({id,path:`/${id}.html`,file:`${id}.html`}))
];

// A lossless tokenizer shared with the renderer. Script/style contents stay
// opaque even if they contain '<', quoted HTML or translated-looking text.
export function tokenizeHtml(html){
  const tokens=[];let offset=0;
  const tagPattern=/<!--[\s\S]*?-->|<![^>]*>|<\/?[A-Za-z][\w:-]*(?:"[^"]*"|'[^']*'|[^'">])*>/g;
  while(offset<html.length){
    tagPattern.lastIndex=offset;const match=tagPattern.exec(html);
    if(!match){tokens.push({type:'text',value:html.slice(offset)});break;}
    if(match.index>offset)tokens.push({type:'text',value:html.slice(offset,match.index)});
    const value=match[0],name=value.match(/^<\/?([\w:-]+)/)?.[1]?.toLowerCase();
    const closing=/^<\//.test(value);tokens.push({type:name?'tag':'raw',value,...(name?{name,closing}:{})});offset=tagPattern.lastIndex;
    if(name&&!closing&&['script','style'].includes(name)){
      const end=new RegExp(`</${name}\\s*>`,'gi');end.lastIndex=offset;const close=end.exec(html);
      const rawEnd=close?close.index:html.length;
      if(rawEnd>offset)tokens.push({type:'raw',value:html.slice(offset,rawEnd)});
      if(close)tokens.push({type:'tag',name,closing:true,value:close[0]});
      offset=close?end.lastIndex:html.length;
    }
  }
  return tokens;
}
const entities={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',ndash:'–',mdash:'—',hellip:'…',copy:'©',reg:'®',euro:'€'};
export function decodeSeoEntities(value){
  return String(value).replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi,(all,entity)=>{
    if(entity[0]!=='#')return entities[entity]??all;
    const number=entity[1].toLowerCase()==='x'?parseInt(entity.slice(2),16):Number(entity.slice(1));
    return number>0&&number<=0x10ffff&&!(number>=0xd800&&number<=0xdfff)?String.fromCodePoint(number):'�';
  });
}
export const normalizeSeoText=value=>decodeSeoEntities(value).replace(/\s+/g,' ').trim();
export function htmlAttributes(tag){
  const attributes=[];
  const start=tag.match(/^<\/?[\w:-]+/)?.[0].length||0;
  const pattern=/([^\s=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  pattern.lastIndex=start;let match;
  while((match=pattern.exec(tag)))attributes.push({name:match[1].toLowerCase(),value:match[2]??match[3]??match[4]??'',raw:match[0],index:match.index});
  return attributes;
}
const unchanged=/^(?:PostisPop|Android|iOS|iPadOS|macOS|Windows|Linux|Chrome|Safari|Firefox|Edge|Google|Supabase|Cloudflare|Resend|Stripe|JSON|PDF|APK|AAB|PWA|AppImage|Flatpak|Snap|Google Play|App Store|Microsoft Store|Apple|ES256|RLS|OAuth|JavaScript|HTML|CSS|UTF-8)$/i;
export function shouldTranslate(value){
  const normalized=normalizeSeoText(value);
  return !!normalized&&/\p{L}/u.test(normalized)&&!unchanged.test(normalized)&&!/^https?:\/\/\S+$/.test(normalized)&&!/^\S+@\S+\.\S+$/.test(normalized);
}
export const SPANISH_HOME={
  title:'Notas adhesivas online gratis y pizarra de ideas | PostisPop',
  description:'Escribe ideas, organiza tareas y dibuja en seis notas gratuitas. Conoce cómo guardar, exportar y recuperar tus notas en PostisPop desde la web y Android.',
  heading:'Tus ideas a la vista, una nota cada vez.',
  intro:'PostisPop es una pizarra de notas adhesivas para apuntar ideas, preparar tareas y reunir información que necesitas ver junta. Puedes empezar gratis con seis notas, sin crear una cuenta.',
  sections:[
    {heading:'Escribe primero. Organiza después.',paragraphs:['Abre una nota y empieza a escribir. Utiliza una idea o una acción por nota: una llamada pendiente, una pregunta de estudio o el siguiente paso de un proyecto.','Puedes cambiar el color, añadir una etiqueta escrita como #trabajo y dibujar en el papel. La búsqueda por texto o color incluye las distintas páginas de la pizarra. Las notas protegidas no muestran su contenido en la búsqueda.']},
    {heading:'Entiende dónde se guardan tus notas.',paragraphs:['Sin iniciar sesión, las notas y los adjuntos locales permanecen en ese navegador y dispositivo. No aparecen automáticamente en otro móvil u ordenador. Borrar los datos del navegador puede eliminar esa copia local.','Las notas de tu cuenta necesitan conexión para sincronizarse. Revisa el estado de guardado: tener un cambio guardado en el dispositivo no significa que ya se haya guardado en la nube. Los adjuntos locales de otro dispositivo pueden no estar disponibles aquí.']},
    {heading:'Conserva una copia antes de cambiar de dispositivo.',paragraphs:['En «Opciones avanzadas», guarda una copia JSON para conservar las notas, los dibujos y los adjuntos disponibles en este dispositivo. Las notas protegidas permanecen cifradas. Conserva sus contraseñas aparte: no existe recuperación de contraseña.','La imagen PNG incluye todas las notas de la pizarra hasta un máximo de cien, con texto resumido, colores y trazos; no incluye adjuntos. La impresión permite guardar una copia del texto como PDF. Esas exportaciones no sustituyen una copia de seguridad completa.','La web admite copias de hasta 50 MB. La versión Android guarda archivos de hasta 10 MB. En Android, el guardado solo se confirma cuando termina la escritura del archivo; cancelar el selector no descarga ninguna copia.']},
    {heading:'Comparte con expectativas claras.',paragraphs:['Los enlaces editables y las invitaciones están en revisión. Puedes preparar una pizarra y compartir una exportación por tus propios medios, pero esa copia no se actualiza cuando cambias las notas.','Gratis incluye seis notas. Premium está previsto por 2,95 € al mes, 5,95 € cada 3 meses, 19,95 € al año o 59,95 € de por vida. Las nuevas compras todavía no están activadas.']},
    {heading:'Guías para dar un uso concreto a tus notas.',paragraphs:['Consulta las guías sobre bloc de notas, pizarra virtual y notas adhesivas para empezar. También encontrarás propuestas para organizar tareas, estudiar, preparar reuniones y desarrollar una lluvia de ideas.','Cada guía explica un uso práctico y los límites actuales de la herramienta. Elige un caso que te resulte útil, abre tu pizarra y escribe la primera acción.']}
  ],
  cta:'Abrir mis notas'
};

export async function collectSeoSource(root='_site',out){
  const translations={};const add=value=>{const key=normalizeSeoText(value);if(shouldTranslate(key))translations[key]=key;};
  for(const page of SEO_PAGES.filter(page=>page.id!=='home')){
    const html=await readFile(resolve(root,page.file),'utf8');let body=false,title=false;
    for(const token of tokenizeHtml(html)){
      if(token.type==='tag'){
        if(token.name==='body')body=!token.closing;
        if(token.name==='title')title=!token.closing;
        if(token.closing)continue;
        const attrs=htmlAttributes(token.value);
        if(token.name==='meta'&&attrs.find(item=>item.name==='name')?.value.toLowerCase()==='description')add(attrs.find(item=>item.name==='content')?.value||'');
        if(body)for(const attr of attrs)if(['aria-label','title','alt'].includes(attr.name))add(attr.value);
      }else if(token.type==='text'&&(body||title))add(token.value);
    }
  }
  const data={locale:'es',name:'Español',ogLocale:'es_ES',ui:{language:'Idioma',home:'Inicio',openBoard:'Abrir mis notas',guides:'Guías',help:'Ayuda',privacy:'Privacidad',terms:'Condiciones',legal:'Aviso legal',cookies:'Cookies',skip:'Saltar al contenido',back:'Volver a PostisPop'},translations,home:SPANISH_HOME};
  if(out){await mkdir(dirname(resolve(out)),{recursive:true});await writeFile(out,JSON.stringify(data,null,2)+'\n');}
  return data;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const out=process.argv[3]||'scripts/seo-content/es.json';const data=await collectSeoSource(process.argv[2]||'_site',out);
  console.log(`Wrote ${out}: ${Object.keys(data.translations).length} exact text keys.`);
}
