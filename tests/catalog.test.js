import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog} from '../src/catalog.js';
test('seven games retain the supplied iframe sources',()=>{assert.equal(catalog.length,7);assert.deepEqual(catalog.map(g=>g.frameUrl),['https://ubghyper.github.io/GameList.github.io/Drive-Mad/','https://class811.github.io/g7/moto-road-rash-3d/','https://class811.github.io/g/retro-bowl/','https://class811.github.io/g2/big-shot-boxing/','https://class811.github.io/g/slope/','https://class811.github.io/g/drift-hunters/','https://class811.github.io/g8/snow-rider-3d/']);assert.equal(catalog[2].title,'Retro Bowl');assert.ok(catalog.every(g=>g.external));});
