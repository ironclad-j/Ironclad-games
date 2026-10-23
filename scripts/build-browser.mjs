import fs from 'node:fs/promises';import path from 'node:path';import {build} from 'esbuild';
import {scramjetPath} from '@mercuryworkshop/scramjet/path';import {uvPath} from '@titaniumnetwork-dev/ultraviolet';import {libcurlPath} from '@mercuryworkshop/libcurl-transport';import {baremuxPath} from '@mercuryworkshop/bare-mux/node';
const root=path.resolve(import.meta.dirname,'..');
for(const [name,source] of Object.entries({scram:scramjetPath,uv:uvPath,libcurl:libcurlPath,baremux:baremuxPath})){
 await fs.mkdir(path.join(root,'vendor',name),{recursive:true});await fs.cp(source,path.join(root,'vendor',name),{recursive:true});
}
// Scramjet 1.1 uses a fixed database name in all six controller/worker paths.
// Keep the pinned engine isolated from databases created by the old startup race.
const scramFile=path.join(root,'vendor/scram/scramjet.all.js');
const original=await fs.readFile(scramFile,'utf8');
if(original.split('"$scramjet"').length!==7)throw Error('Scramjet database patch needs review for this package version.');
await fs.writeFile(scramFile,original.replaceAll('"$scramjet"','"$ironclad-scramjet-v1"'));
await build({entryPoints:[path.join(root,'src/browser-runtime.js')],bundle:true,format:'esm',target:'es2022',outfile:path.join(root,'assets/browser.js')});
await fs.mkdir(path.join(root,'licenses'),{recursive:true});
for(const [label,name] of Object.entries({scramjet:'@mercuryworkshop/scramjet',ultraviolet:'@titaniumnetwork-dev/ultraviolet',baremux:'@mercuryworkshop/bare-mux',libcurl:'@mercuryworkshop/libcurl-transport',wisp:'@mercuryworkshop/wisp-js'})){
 await fs.copyFile(path.join(root,'node_modules',name,'LICENSE'),path.join(root,'licenses',label+'.txt'));
}
console.log('Built both browser engines and shared transport.');
