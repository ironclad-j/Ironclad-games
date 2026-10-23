import test from 'node:test';import assert from 'node:assert/strict';import http from 'node:http';
import {createWispServer,isPublicAddress,resolvePublicHost} from '../scripts/render-wisp.mjs';
import WebSocket from 'ws';import {packet} from '@mercuryworkshop/wisp-js/server';
async function withServer(run){const server=createWispServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));try{await run(server.address().port);}finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}}
function upgrade(port,origin,path='/wisp/'){return new Promise((resolve,reject)=>{const req=http.request({hostname:'127.0.0.1',port,path,headers:{Origin:origin,Connection:'Upgrade',Upgrade:'websocket','Sec-WebSocket-Key':'dGhlIHNhbXBsZSBub25jZQ==','Sec-WebSocket-Version':'13'}});req.on('upgrade',(res,socket)=>{socket.destroy();resolve(res.statusCode);});req.on('response',res=>{res.resume();resolve(res.statusCode);});req.on('error',reject);req.end();});}
test('hosted server exposes health without serving project files',async()=>withServer(async port=>{
 const response=await fetch('http://127.0.0.1:'+port+'/health');assert.equal(response.status,200);assert.equal((await response.json()).status,'ok');
 for(const path of ['/package.json','/.git/config','/src/browser-runtime.js'])assert.equal((await fetch('http://127.0.0.1:'+port+path)).status,404);
}));
test('browsing upgrades accept Ironclad and reject foreign origins and paths',async()=>withServer(async port=>{
 assert.equal(await upgrade(port,'https://ironclad-j.github.io'),101);assert.equal(await upgrade(port,'https://unrelated.example'),403);assert.equal(await upgrade(port,'https://ironclad-j.github.io','/other'),404);
}));
test('private IPv6, mapped private addresses, and private DNS answers are blocked',async()=>{
 for(const address of ['127.0.0.1','10.0.0.1','192.168.1.1','::1','fc00::1','fe80::1','::ffff:127.0.0.1','::ffff:192.168.1.1'])assert.equal(isPublicAddress(address),false,address);
 assert.equal(isPublicAddress('8.8.8.8'),true);assert.equal(isPublicAddress('2606:4700:4700::1111'),true);
 await assert.rejects(resolvePublicHost('private.example',async()=>[{address:'fc00::1'}]));
 assert.equal(await resolvePublicHost('public.example',async()=>[{address:'8.8.8.8'}]),'8.8.8.8');
});
test('an actual Wisp TCP stream can fetch a public HTTP response',{timeout:15000,skip:process.env.IRONCLAD_NETWORK_TEST!=='1'},async()=>withServer(async port=>{
 const ws=new WebSocket('ws://127.0.0.1:'+port+'/wisp/',{origin:'https://ironclad-j.github.io'});
 try{await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Wisp TCP stream timed out')),12000);let sent=false,finished=false,response='';
  const done=(error)=>{if(finished)return;finished=true;clearTimeout(timer);error?reject(error):resolve();};ws.on('error',done);
  ws.on('message',data=>{if(finished)return;const incoming=packet.WispPacket.parse_all(new packet.WispBuffer(new Uint8Array(data)));
   if(incoming.type===3&&incoming.stream_id===0&&!sent){sent=true;
    ws.send(new packet.WispPacket({type:1,stream_id:1,payload:new packet.ConnectPayload({stream_type:1,port:80,hostname:'example.com'})}).serialize().bytes);
    ws.send(new packet.WispPacket({type:2,stream_id:1,payload:new packet.DataPayload({data:new packet.WispBuffer('GET / HTTP/1.1\r\nHost: example.com\r\nConnection: close\r\n\r\n')})}).serialize().bytes);
   }else if(incoming.type===2&&incoming.stream_id===1){response+=new TextDecoder().decode(incoming.payload.data.bytes);if(response.includes('\r\n')){try{assert.match(response,/^HTTP\/1\.[01] /);done();}catch(error){done(error);}}}
   else if(incoming.type===4&&incoming.stream_id===1)done(Error('Wisp stream closed before HTTP response'));
  });
 });}finally{ws.terminate();}
}));
