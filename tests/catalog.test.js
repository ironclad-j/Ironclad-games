import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,filterGames} from '../src/catalog.js';
test('published game library is empty',()=>{assert.deepEqual(catalog,[]);assert.deepEqual(filterGames(catalog),[]);});
