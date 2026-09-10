import ts from 'typescript';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url);
const modules=new Map();
function compile(path){
 if(modules.has(path))return modules.get(path);
 let code=ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 code=code.replace(/from ["']([^"']+)["']/g,(_,name)=>{
 const url=name.endsWith('/lib/design')||name==='../lib/design'?compile('../lib/design.ts'):name==='../app/SiteCanvas'?compile('../app/SiteCanvas.tsx'):name.startsWith('node:')?name:pathToFileURL(require.resolve(name)).href;
 return `from ${JSON.stringify(url)}`;
 });
 const url='data:text/javascript;base64,'+Buffer.from(code).toString('base64');modules.set(path,url);return url;
}
await import(compile('./canvas.test.tsx'));
