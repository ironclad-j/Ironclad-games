// SPDX-License-Identifier: AGPL-3.0-only
import {engineOrder,validateEndpoint,toBrowserUrl,runWithFallback} from './browser-policy.js';
import {boundedAttempt} from './browser-attempt.js';
export {engineOrder,validateEndpoint,toBrowserUrl};
const base=new URL('../',import.meta.url),storageKey='ironclad-browser-settings-v1';
const asset=path=>new URL(path,base).href;
export function getSettings(){
 let saved={};try{saved=JSON.parse(localStorage.getItem(storageKey)||'{}');}catch{}
 let endpoint='';try{endpoint=validateEndpoint(saved.endpoint||'');}catch{}
 if(!endpoint&&['localhost','127.0.0.1'].includes(location.hostname)&&location.port==='8080')endpoint='ws://'+location.host+'/wisp/';
 return {preferred:saved.preferred==='ultraviolet'?'ultraviolet':'scramjet',automatic:saved.automatic!==false,endpoint};
}
export function saveSettings(settings){
 const clean={preferred:settings.preferred==='ultraviolet'?'ultraviolet':'scramjet',automatic:settings.automatic!==false,endpoint:validateEndpoint(settings.endpoint)};
 localStorage.setItem(storageKey,JSON.stringify(clean));return clean;
}
const scripts=new Map();
function loadScript(path){const url=asset(path);if(scripts.has(url))return scripts.get(url);
 const pending=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=url;script.onload=resolve;script.onerror=()=>{script.remove();scripts.delete(url);reject(Error('Unable to load browser engine files.'));};document.head.append(script);});scripts.set(url,pending);return pending;
}
let setupPromise,controllerPromise,connection;
async function setup(endpoint){
 if(!endpoint)throw Error('Add a browsing server in Settings. The public site does not have a server connected yet.');
 if(!navigator.serviceWorker)throw Error('This browser does not support the required service worker.');
 if(!setupPromise)setupPromise=(async()=>{
  await loadScript('browser-storage.js');await ensureIroncladStorage();
  await loadScript('vendor/baremux/index.js');
  const registration=await navigator.serviceWorker.register(asset('proxy-sw.js?v=storage-2'),{scope:base.pathname,updateViaCache:'none'});
  await registration.update();await navigator.serviceWorker.ready;
  const activate=()=>registration.waiting?.postMessage({type:'ironclad-activate'});activate();registration.addEventListener('updatefound',()=>registration.installing?.addEventListener('statechange',activate));
  if(navigator.serviceWorker.controller?.scriptURL!==asset('proxy-sw.js?v=storage-2'))await new Promise((resolve,reject)=>{const changed=()=>{if(navigator.serviceWorker.controller?.scriptURL===asset('proxy-sw.js?v=storage-2')){clearTimeout(timer);navigator.serviceWorker.removeEventListener('controllerchange',changed);resolve();}};const timer=setTimeout(()=>{navigator.serviceWorker.removeEventListener('controllerchange',changed);reject(Error('Browser worker update did not start. Reload and try again.'));},10000);navigator.serviceWorker.addEventListener('controllerchange',changed);changed();});
  connection=new BareMux.BareMuxConnection(asset('vendor/baremux/worker.js'));
 })().catch(error=>{setupPromise=null;throw error;});
 await setupPromise;await connection.setTransport(asset('vendor/libcurl/index.mjs'),[{websocket:endpoint}]);
}
async function scramjetController(){
 if(!controllerPromise)controllerPromise=(async()=>{
  await loadScript('vendor/scram/scramjet.all.js?v=storage-2');const {ScramjetController}=$scramjetLoadController();
  const controller=new ScramjetController({prefix:base.pathname+'browser/scramjet/',files:{wasm:base.pathname+'vendor/scram/scramjet.wasm.wasm',all:base.pathname+'vendor/scram/scramjet.all.js?v=storage-2',sync:base.pathname+'vendor/scram/scramjet.sync.js'}});
  await controller.init();return controller;
 })().catch(error=>{controllerPromise=null;throw error;});return controllerPromise;
}
export function createBrowserSession({container,onStatus=()=>{},onLocation=()=>{}}){
 let frame=null,sjFrame=null,abort=null,disposed=false,url='',engine='',waiting=null,tried=new Set(),navigating=false;
 const label=name=>name==='scramjet'?'Scramjet':'Ultraviolet';
 function decodedUrl(){try{
  if(engine==='scramjet'&&sjFrame)return sjFrame.url.href;
  const current=frame?.contentWindow?.location.href,prefix=asset('browser/uv/');if(current?.startsWith(prefix))return __uv$config.decodeUrl(current.slice(prefix.length));
 }catch{}return null;}
 const poll=setInterval(()=>{const current=navigating?null:decodedUrl();if(current&&current!==url&&/^https?:\/\//.test(current)){
  url=current;tried=new Set([engine]);onLocation(url);
 }},500);
 async function failed(target){
  if(waiting){waiting.reject(Error('The engine could not load this document.'));return;}
  if(disposed||!frame)return;
  await go(target,{exclude:new Set(tried)});
 }
 const workerMessage=event=>{
  if(event.origin!==location.origin||event.source!==frame?.contentWindow||event.data?.type!=='ironclad-proxy-failure'||event.data.engine!==engine)return;
  const target=event.data.target;if(!/^https?:\/\//.test(target||''))return;
  void failed(target);
 };
 window.addEventListener('message',workerMessage);

 async function attempt(name,target,signal,endpoint){
  signal.throwIfAborted();tried.add(name);onStatus({state:'loading',engine:name,message:'Loading with '+label(name)+'…'});
  await setup(endpoint);signal.throwIfAborted();let next,sj=null;
  if(name==='scramjet'){const controller=await scramjetController();signal.throwIfAborted();sj=controller.createFrame();next=sj.frame;}
  else{await loadScript('vendor/uv/uv.bundle.js');await loadScript('uv.config.js');signal.throwIfAborted();next=document.createElement('iframe');}
  const previous=frame;frame=next;sjFrame=sj;engine=name;
  next.title='Web browser — '+label(name);next.className='proxy-frame';next.allow='fullscreen; autoplay; gamepad';next.allowFullscreen=true;
  next.sandbox='allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-downloads allow-modals';
  await new Promise((resolve,reject)=>{
   let timer;const cleanup=()=>{clearTimeout(timer);signal.removeEventListener('abort',cancel);next.removeEventListener('load',loaded);next.removeEventListener('error',error);if(waiting?.frame===next)waiting=null;};
   const done=(ok,value)=>{cleanup();ok?resolve(value):reject(value);};
   const loaded=()=>{if(next.contentWindow?.location.href==='about:blank')return;done(true);};
   const error=()=>done(false,Error('The page could not be loaded.'));
   const cancel=()=>done(false,new DOMException('Navigation cancelled','AbortError'));
   waiting={frame:next,reject:error};signal.addEventListener('abort',cancel,{once:true});next.addEventListener('load',loaded);next.addEventListener('error',error);
   timer=setTimeout(()=>done(false,Error('The browsing engine timed out.')),30000);
   // Append only after registering load handlers; about:blank is not a successful page.
   container.replaceChildren(next);previous?.remove();
   if(sj)sj.go(target);else next.src=__uv$config.prefix+__uv$config.encodeUrl(target);
  });
  signal.throwIfAborted();onStatus({state:'ready',engine:name,message:label(name)});return name;
 }
 async function go(input,{exclude=new Set()}={}){
  if(disposed)return;abort?.abort();abort=new AbortController();const signal=abort.signal;const target=toBrowserUrl(input);url=target;navigating=true;tried=new Set(exclude);
  const settings=getSettings();
  if(!settings.endpoint){navigating=false;onStatus({state:'error',message:'Add a browsing server in Settings. No public server is connected yet.'});return;}
  try{await runWithFallback({preferred:settings.preferred,automatic:settings.automatic,signal,
   onSwitch:name=>onStatus({state:'switching',engine:name,message:'Switching to '+label(name)+'…'}),
   attempt:name=>{if(exclude.has(name))throw Error('Engine already tried for this page.');return boundedAttempt(attemptSignal=>attempt(name,target,attemptSignal,settings.endpoint),signal).catch(error=>{if(!signal.aborted)console.warn('Ironclad '+name+': '+error.message);throw error;});}});
  }catch(error){if(!signal.aborted&&!disposed){waiting=null;frame?.remove();frame=null;sjFrame=null;onStatus({state:'error',message:error.message+' Both engines share the same browsing server.'});}}finally{if(!signal.aborted)navigating=false;}
 }
 return {go,reload:()=>go(url),get url(){return url;},get engine(){return engine;},dispose(){disposed=true;abort?.abort();clearInterval(poll);window.removeEventListener('message',workerMessage);frame?.remove();}};
}
