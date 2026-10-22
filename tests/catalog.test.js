import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog} from '../src/catalog.js';
test('only Drive Mad is listed with the requested iframe source',()=>{assert.equal(catalog.length,1);assert.equal(catalog[0].title,'Drive Mad');assert.equal(catalog[0].frameUrl,'https://ubghyper.github.io/GameList.github.io/Drive-Mad/');assert.equal(catalog[0].external,true);});
