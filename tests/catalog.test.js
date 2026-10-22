import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog} from '../src/catalog.js';
test('Drive Mad and Moto Road Rash use the requested iframe sources',()=>{assert.equal(catalog.length,2);assert.equal(catalog[0].frameUrl,'https://ubghyper.github.io/GameList.github.io/Drive-Mad/');assert.equal(catalog[1].title,'Moto Road Rash 3D');assert.equal(catalog[1].frameUrl,'https://class811.github.io/g7/moto-road-rash-3d/');assert.ok(catalog.every(g=>g.external));});
