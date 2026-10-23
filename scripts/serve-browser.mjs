import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import {server as wisp,logging} from '@mercuryworkshop/wisp-js/server';
const root=path.resolve(import.meta.dirname,'..'),types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.wasm':'application/wasm','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.json':'application/json'};
logging.set_level(logging.NONE);wisp.options.allow_udp_streams=false;
const server=http.createServer(async(req,res)=>{try{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),relative=pathname.replace(/^\/+/, '');
 if(relative.split('/').some(part=>part.startsWith('.')||['node_modules','work','supabase'].includes(part)))throw Error();
 const file=path.resolve(root,relative||'index.html');if(!file.startsWith(root+path.sep))throw Error();
 const info=await fs.stat(file),target=info.isDirectory()?path.join(file,'index.html'):file;
 res.setHeader('Content-Type',types[path.extname(target)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(await fs.readFile(target));
 }catch{res.writeHead(404);res.end('Not found');}});
server.on('upgrade',(req,socket,head)=>{if(req.url==='/wisp/')wisp.routeRequest(req,socket,head);else socket.end();});
server.listen(8080,'127.0.0.1',()=>console.log('Ironclad + local Wisp: http://127.0.0.1:8080'));
