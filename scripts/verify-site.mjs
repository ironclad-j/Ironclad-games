import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {catalog} from '../src/catalog.js';
const root=path.resolve(import.meta.dirname,'..');
for(const game of catalog.filter(g=>!g.external)){for(const file of [game.frameUrl,`games/${game.id}/engine.js`])await fs.access(path.join(root,file));}
const files=['flash-player.html','index.html','config.js','src/app.js','src/auth.js','src/cloud.js','src/save-store.js','src/frame-host.js','src/catalog.js','src/records.js','assets/site.css','assets/supabase.js','games/shared/play.js','games/shared/bridge.js','games/shared/game.css'];
for(const file of files){const text=await fs.readFile(path.join(root,file),'utf8');assert.ok(!/sb_secret_[A-Za-z0-9_-]{20,}/.test(text),`Secret key in ${file}`);assert.ok(!/service_role["']?\s*[:=]\s*["'][A-Za-z0-9]/.test(text),`Privileged credential in ${file}`);}
assert.ok((await fs.readFile(path.join(root,'config.js'),'utf8')).includes('sb_publishable_'));
console.log(`PASS: ${catalog.length} iframe games, ${files.length} core assets, publishable-only config`);
