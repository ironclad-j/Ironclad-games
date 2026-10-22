import test from 'node:test';
import assert from 'node:assert/strict';
const mod = await import('../src/catalog.js').catch(() => ({}));
test('catalog keeps native saves and embeds Drift Hunters at its HTTPS game URL',()=>{ assert.equal(mod.catalog?.length,4); assert.equal(new Set(mod.catalog.map(g=>g.id)).size,4); assert.ok(mod.catalog.filter(g=>!g.external).every(g=>g.frameUrl.startsWith('./games/')&&g.checkpointVersion===1)); const drift=mod.catalog.find(g=>g.id==='drift-hunters-pro');assert.equal(drift?.external,true);assert.equal(drift?.frameUrl,'https://www.onlinegames.io/games/2023/unity/drift-hunters-pro/index.html'); });
test('search and category combine, case insensitive',()=>{assert.equal(typeof mod.filterGames,'function');assert.equal(mod.filterGames(mod.catalog,'SNA','arcade')[0].id,'snake');assert.equal(mod.filterGames(mod.catalog,'snake','puzzle').length,0);assert.equal(mod.filterGames(mod.catalog,'zzz','all').length,0);});
