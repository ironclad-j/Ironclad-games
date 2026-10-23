// SPDX-License-Identifier: AGPL-3.0-only
export async function boundedAttempt(work,signal,timeout=30000){
 const controller=new AbortController();
 const cancel=()=>controller.abort(signal.reason);
 signal.addEventListener('abort',cancel,{once:true});
 if(signal.aborted)cancel();
 let timer;
 try{return await Promise.race([
  Promise.resolve().then(()=>{controller.signal.throwIfAborted();return work(controller.signal);}),
  new Promise((_,reject)=>{
   const fail=()=>reject(controller.signal.reason);
   controller.signal.addEventListener('abort',fail,{once:true});
   if(controller.signal.aborted)fail();
   timer=setTimeout(()=>controller.abort(Error('The browsing engine timed out.')),timeout);
  })
 ]);}finally{clearTimeout(timer);signal.removeEventListener('abort',cancel);}
}
