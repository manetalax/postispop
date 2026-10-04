import {readdir,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
const root=new URL('../',import.meta.url),files=[];
async function collect(dir,recursive=false){
 for(const entry of await readdir(new URL(dir,root),{withFileTypes:true})){
  if(entry.isFile()&&/\.(?:js|mjs|cjs|ts)$/.test(entry.name))files.push(dir+entry.name);
  else if(recursive&&entry.isDirectory())await collect(dir+entry.name+'/',true);
 }
}
for(const dir of ['', 'scripts/', 'mobile/', 'tests/'])await collect(dir);
for(const dir of ['assets/designs/','functions/'])await collect(dir,true);
for(const file of files){
 if(file.endsWith('.ts')){
  const result=ts.transpileModule(await readFile(new URL(file,root),'utf8'),{fileName:file,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}});
  const errors=(result.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);
  if(errors.length){for(const error of errors)process.stderr.write(file+': '+ts.flattenDiagnosticMessageText(error.messageText,'\n')+'\n');process.exit(1);}
 }else{const result=spawnSync(process.execPath,['--check',fileURLToPath(new URL(file,root))],{encoding:'utf8'});if(result.status!==0){process.stderr.write(result.stderr);process.exit(1);}}
}
console.log(`Sintaxis comprobada: ${files.length} módulos de aplicación y construcción.`);
