(function(){
  window.createGameBridge=function(handlers){
    let port,meta;let expectedOrigin;
    try{expectedOrigin=new URL(document.referrer).origin;}catch{return {checkpoint(){},complete(){},paused(){}};}
    function send(type,payload){if(port)port.postMessage({...meta,type,payload});}
    function init(event){
      if(event.source!==window.parent||event.origin!==expectedOrigin||event.data?.protocol!==1||event.data?.type!=='init'||!event.ports[0])return;
      const {gameId,sessionId}=event.data;if(gameId!==document.body.dataset.game||typeof sessionId!=='string')return;
      window.removeEventListener('message',init);meta={protocol:1,gameId,sessionId};port=event.ports[0];
      port.onmessage=({data})=>{if(data?.protocol!==1||data?.gameId!==gameId||data?.sessionId!==sessionId)return;try{if(data.type==='pause')handlers.pause();if(data.type==='resume')handlers.resume(data.payload?.checkpoint);if(data.type==='restart')handlers.restart();}catch(error){send('error',{message:error.message});}};
      try{handlers.init(event.data.payload?.checkpoint);}catch(error){send('error',{message:error.message});}
    }
    window.addEventListener('message',init);window.parent.postMessage({type:'ironclad-ready'},expectedOrigin);
    return {checkpoint(value){send('checkpoint',value);},complete(result){send('complete',result);},paused(value){send('paused',{paused:value});}};
  };
})();
