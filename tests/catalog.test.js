import test from 'node:test';
import assert from 'node:assert/strict';
const mod = await import('../src/catalog.js').catch(() => ({}));
test('catalog has three unique relative iframe entries',()=>{ assert.equal(mod.catalog?.length,3); assert.equal(new Set(mod.catalog.map(g=>g.id)).size,3); assert.ok(mod.catalog.every(g=>g.frameUrl.startsWith('./games/')&&g.checkpointVersion===1)); });
test('search and category combine, case insensitive',()=>{assert.equal(typeof mod.filterGames,'function');assert.equal(mod.filterGames(mod.catalog,'SNA','arcade')[0].id,'snake');assert.equal(mod.filterGames(mod.catalog,'snake','puzzle').length,0);assert.equal(mod.filterGames(mod.catalog,'zzz','all').length,0);});
