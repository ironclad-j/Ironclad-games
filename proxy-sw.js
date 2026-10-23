// SPDX-License-Identifier: AGPL-3.0-only
let scramjet,uv;
importScripts('./browser-storage.js');
let ScramjetWorker;try{importScripts('./vendor/scram/scramjet.all.js?v=storage-2');ScramjetWorker=$scramjetLoadWorker().ScramjetServiceWorker;}catch{}
const storageReady=ensureIroncladStorage().then(()=>{if(ScramjetWorker)scramjet=new ScramjetWorker();});
try{importScripts('./vendor/uv/uv.bundle.js','./uv.config.js');importScripts(self.__uv$config.sw);uv=new UVServiceWorker();}catch{}
// Version 1's controller message sets instance.config before initializing the
// shared rewriter. Read the persisted config once to initialize both together.
let scramjetReady;
function prepareScramjet(){if(!scramjetReady){scramjet.config=undefined;scramjetReady=scramjet.loadConfig().catch(error=>{scramjetReady=null;throw error;});}return scramjetReady;}
self.addEventListener('message',event=>{if(event.data?.scramjet$type==='loadConfig'){event.waitUntil(storageReady.then(()=>{if(scramjet){scramjetReady=null;return prepareScramjet();}}));}});
self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
const root=new URL('./',self.location.href).pathname;
function failureResponse(event,engine){
 if(event.request.mode!=='navigate'||!['iframe','document'].includes(event.request.destination))return new Response('Unable to load resource.',{status:502});
 const encoded=event.request.url.slice(new URL('./',self.location.href).href.length);
 let target;try{target=engine==='ultraviolet'?__uv$config.decodeUrl(encoded.slice('browser/uv/'.length)):decodeURIComponent(encoded.slice('browser/scramjet/'.length));}catch{}
 const data=JSON.stringify({type:'ironclad-proxy-failure',engine,target}).replaceAll('<','\\u003c');
 return new Response('<!doctype html><title>Page unavailable</title><p>The browsing engine could not load this page.</p><script>parent.postMessage('+data+',location.origin);</script>',{status:502,headers:{'Content-Type':'text/html; charset=utf-8'}});
}
self.addEventListener('fetch',event=>{
 const pathname=new URL(event.request.url).pathname;
 const engine=pathname.startsWith(root+'browser/scramjet/')||pathname===root+'vendor/scram/scramjet.wasm.wasm'?'scramjet':pathname.startsWith(root+'browser/uv/')?'ultraviolet':null;
 if(!engine)return;
 event.respondWith((async()=>{try{
  let response;if(engine==='scramjet'){await storageReady;await prepareScramjet();response=await scramjet.fetch(event);}else response=await uv.fetch(event);
  if(response.status>=500)return failureResponse(event,engine);return response;
 }catch{return failureResponse(event,engine);}})());
});
