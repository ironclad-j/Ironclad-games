import {validCheckpoint,isRunId} from './checkpoints.js';
export function validateEnvelope(data,{gameId,sessionId}) {
  try {
    if(!data||data.protocol!==1||data.gameId!==gameId||data.sessionId!==sessionId||!['checkpoint','complete','error','ready','paused'].includes(data.type)) return false;
    if(new TextEncoder().encode(JSON.stringify(data)).length>65536) return false;
    if(data.type==='complete' && (!isRunId(data.payload?.runId)||!Number.isInteger(data.payload.score)||data.payload.score<0||data.payload.score>1000000000)) return false;
    if(data.type==='checkpoint' && !validCheckpoint(gameId,data.payload))return false;
    return typeof data.payload==='object' && data.payload!==null;
  } catch {return false;}
}
export function createMessageGate({source,gameId,sessionId}) {
  let alive=true;const runs=new Set();
  return {accept(data,sender){if(!alive||sender!==source||!validateEnvelope(data,{gameId,sessionId}))return false;if(data.type==='complete'){if(runs.has(data.payload.runId))return false;runs.add(data.payload.runId);}return true;},destroy(){alive=false;runs.clear();}};
}
export function mountGame({container,game,onCheckpoint,onComplete,onError,onReady,onPaused,checkpoint=null}) {
  const frame=document.createElement('iframe');frame.title=`Play ${game.title}`;frame.sandbox='allow-scripts';frame.allow='fullscreen';frame.referrerPolicy='strict-origin';
  const sessionId=crypto.randomUUID();let port=null,alive=true,ready=false;const pauseWaiters=new Set();
  const loading=document.createElement('span');loading.className='frame-loading';loading.textContent='Loading your next challenge…';container.replaceChildren(loading);
  let gate;
  const timer=setTimeout(()=>{if(alive&&!ready){onError?.('The game took too long to load. Return to the library and try again.');}},15000);
  function send(type,payload={}) {if(alive&&port)port.postMessage({protocol:1,gameId:game.id,sessionId,type,payload});}
  function handshake(event){
    if(!alive||ready||event.source!==frame.contentWindow||event.data?.type!=='ironclad-ready')return;
    ready=true;clearTimeout(timer);window.removeEventListener('message',handshake);const channel=new MessageChannel();port=channel.port1;
    gate=createMessageGate({source:frame.contentWindow,gameId:game.id,sessionId});
    port.onmessage=({data})=>{if(!gate.accept(data,frame.contentWindow))return;if(data.type==='checkpoint'){onCheckpoint?.(data.payload);for(const resolve of pauseWaiters)resolve();pauseWaiters.clear();}if(data.type==='complete')onComplete?.({...data.payload,gameId:game.id,version:game.checkpointVersion});if(data.type==='error')onError?.(String(data.payload.message||'Game error'));if(data.type==='paused')onPaused?.(data.payload.paused===true);};
    frame.contentWindow.postMessage({protocol:1,type:'init',gameId:game.id,sessionId,payload:{checkpoint}},'*',[channel.port2]);loading.remove();frame.focus();onReady?.();
  }
  window.addEventListener('message',handshake);frame.src=game.frameUrl;container.append(frame);
  return {pause(){return new Promise(resolve=>{const finish=()=>{pauseWaiters.delete(finish);resolve();};pauseWaiters.add(finish);setTimeout(finish,400);send('pause');});},resume(value){send('resume',{checkpoint:value??null});},restart(){send('restart');},destroy(){alive=false;clearTimeout(timer);window.removeEventListener('message',handshake);gate?.destroy();port?.close();frame.remove();for(const resolve of pauseWaiters)resolve();pauseWaiters.clear();}};
}
