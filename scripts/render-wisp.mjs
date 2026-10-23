// SPDX-License-Identifier: AGPL-3.0-only
import http from 'node:http';import {pathToFileURL} from 'node:url';
import {lookup} from 'node:dns/promises';import ipaddr from 'ipaddr.js';
import {server as wisp,logging} from '@mercuryworkshop/wisp-js/server';
logging.set_level(logging.NONE);
export function isPublicAddress(address){try{return ipaddr.process(address).range()==='unicast';}catch{return false;}}
export async function resolvePublicHost(hostname,resolve=lookup){
 const addresses=await resolve(hostname,{all:true});
 if(!addresses.length||addresses.some(({address})=>!isPublicAddress(address)))throw Error('Only public internet destinations are allowed.');
 return addresses[0].address;
}
// Disable the per-host cap: Wisp 0.4.1 iterates its stream object incorrectly.
// Retain total limits, and validate every DNS result before opening a socket.
Object.assign(wisp.options,{allow_udp_streams:false,allow_direct_ip:false,allow_private_ips:false,allow_loopback_ips:false,port_whitelist:[80,443],stream_limit_per_host:-1,stream_limit_total:128,dns_method:resolvePublicHost});
export function createWispServer({origin=process.env.ALLOWED_ORIGIN||'https://ironclad-j.github.io',maxConnections=20}={}){
 const sockets=new Set();
 const server=http.createServer((req,res)=>{
  if(req.url!=='/health'&&req.url!=='/'){res.writeHead(404);res.end('Not found');return;}
  res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});
  res.end(JSON.stringify({status:'ok',service:'Ironclad browsing test',source:'https://github.com/ironclad-j/Ironclad-games/blob/main/scripts/render-wisp.mjs'}));
 });
 server.on('upgrade',(req,socket,head)=>{
  const reject=(status,message)=>socket.end('HTTP/1.1 '+status+' '+message+'\r\nConnection: close\r\nContent-Length: 0\r\n\r\n');
  if(req.url!=='/wisp/')return reject(404,'Not Found');
  if(req.headers.origin!==origin)return reject(403,'Forbidden');
  if(sockets.size>=maxConnections)return reject(503,'Service Unavailable');
  sockets.add(socket);socket.once('close',()=>sockets.delete(socket));
  try{wisp.routeRequest(req,socket,head);}catch{socket.destroy();}
 });
 server.on('close',()=>{for(const socket of sockets)socket.destroy();});
 return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const server=createWispServer();const port=Number(process.env.PORT||10000);
 server.listen(port,'0.0.0.0',()=>console.log('Ironclad browsing server listening on '+port));
 for(const signal of ['SIGTERM','SIGINT'])process.once(signal,()=>{server.close();setTimeout(()=>process.exit(0),3000).unref();});
}
