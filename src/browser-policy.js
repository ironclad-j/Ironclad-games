// SPDX-License-Identifier: AGPL-3.0-only
export function engineOrder(preferred='scramjet',automatic=true){const first=preferred==='ultraviolet'?'ultraviolet':'scramjet';return automatic?[first,first==='scramjet'?'ultraviolet':'scramjet']:[first];}
export function validateEndpoint(value){
 if(!value?.trim())return '';const url=new URL(value.trim());
 if(url.username||url.password||url.hash||url.search)throw Error('Use a server URL without credentials, query parameters, or a fragment.');
 if(url.protocol!=='wss:'&&!(url.protocol==='ws:'&&['127.0.0.1','localhost','[::1]'].includes(url.hostname)))throw Error('Use a secure wss:// server URL. ws:// is allowed only for localhost.');
 return url.href;
}
export function toBrowserUrl(input){
 const text=input.trim();if(!text)throw Error('Enter a web address or search.');
 const explicit=/^[a-z][a-z0-9+.-]*:/i.test(text);
 if(explicit&&!/^https?:\/\//i.test(text))throw Error('Only HTTP and HTTPS websites can be opened.');
 if(explicit||/^(localhost(?::\d+)?|[a-z0-9-]+(?:\.[a-z0-9-]+)+)(?::\d+)?(?:[/?#]|$)/i.test(text)){
  const url=new URL(explicit?text:'https://'+text);if(url.username||url.password)throw Error('Addresses containing passwords are not supported.');return url.href;
 }
 return 'https://duckduckgo.com/?q='+encodeURIComponent(text);
}
export async function runWithFallback({preferred,automatic=true,attempt,signal,onSwitch=()=>{}}){
 const failures=[];
 for(const [index,engine] of engineOrder(preferred,automatic).entries()){
  signal?.throwIfAborted();if(index)onSwitch(engine);
  try{return await attempt(engine);}catch(error){signal?.throwIfAborted();failures.push(error);}
 }
 throw new AggregateError(failures,'The browsing engines could not load this page. Check the server connection or try another website.');
}
