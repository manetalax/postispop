// Regenerate the initial HTML from the exact recovered client component.
// The React instance must match the embedded bundle's dispatcher.
import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {Window} from 'happy-dom';
process.env.NODE_ENV='production';
const dom=new Window({url:'https://postispop.com/'});
for(const key of ['window','document','navigator','localStorage','sessionStorage','location','HTMLElement','MutationObserver'])Object.defineProperty(globalThis,key,{value:key==='window'?dom:dom[key],configurable:true});
const require=createRequire(import.meta.url);
const {i:getReact}=await import('../_next/static/chunks/framework-D_rUT4EX.js');
const React=getReact();require('react');require.cache[require.resolve('react')].exports=React;
const {renderToString}=require('react-dom/server');
const {default:Board}=await import('../_next/static/chunks/Board-5837ee9986f4.js');
const markup=renderToString(React.createElement(Board));
const main=markup.match(/<main[\s\S]*?<\/main>/)?.[0];if(!main)throw Error('Board did not render a main element');
const html=await readFile('index.html','utf8');await writeFile('index.html',html.replace(/<main[\s\S]*?<\/main>/,main));
console.log('Initial board HTML regenerated from the same component as the client.');
