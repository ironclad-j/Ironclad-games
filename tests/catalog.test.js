import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog} from '../src/catalog.js';
test('sixteen games retain the supplied iframe sources',()=>{assert.equal(catalog.length,16);assert.deepEqual(catalog.slice(0,8).map(g=>g.frameUrl),['https://ubghyper.github.io/GameList.github.io/Drive-Mad/','https://class811.github.io/g7/moto-road-rash-3d/','https://class811.github.io/g/retro-bowl/','https://class811.github.io/g2/big-shot-boxing/','https://class811.github.io/g/slope/','https://class811.github.io/g/drift-hunters/','https://class811.github.io/g8/snow-rider-3d/','https://classroom2111.github.io/g5/class-456/']);assert.equal(catalog[2].title,'Retro Bowl');assert.ok(catalog.every(g=>g.external));});
test("Moto X3M Spooky Land has the supplied source",()=>{const game=catalog.find(g=>g.id==="moto-x3m-spooky-land");assert.equal(game?.frameUrl,"https://classroom2111.github.io/g5/class-461/");assert.equal(game?.title,"Moto X3M Spooky Land");});
test("Stacktris has the supplied source",()=>{const game=catalog.find(g=>g.id==="stacktris");assert.equal(game?.frameUrl,"https://class811.github.io/g6/stacktris/");assert.equal(game?.title,"Stacktris");});
test("Rocket Soccer Derby has the supplied source",()=>{const game=catalog.find(g=>g.id==="rocket-soccer-derby");assert.equal(game?.frameUrl,"https://class811.github.io/g6/rocket-soccer-derby/");assert.equal(game?.title,"Rocket Soccer Derby");});
test("Moto X3M has the supplied source",()=>{const game=catalog.find(g=>g.id==="moto-x3m");assert.equal(game?.frameUrl,"https://class811.github.io/g8/moto-x3m/");assert.equal(game?.title,"Moto X3M");});
test("Eggy Car has the supplied source",()=>{const game=catalog.find(g=>g.id==="eggy-car");assert.equal(game?.frameUrl,"https://class811.github.io/g/eggy-car/");assert.equal(game?.title,"Eggy Car");});
test("Moto X3M 2 has the supplied source",()=>{const game=catalog.find(g=>g.id==="moto-x3m-2");assert.equal(game?.frameUrl,"https://class811.github.io/g8/moto-x3m-2/");assert.equal(game?.title,"Moto X3M 2");});
test("Moto X3M Winter has the supplied source",()=>{const game=catalog.find(g=>g.id==="moto-x3m-winter");assert.equal(game?.frameUrl,"https://class811.github.io/g/moto-x3m-winter/");assert.equal(game?.title,"Moto X3M Winter");});

test("OvO 2 uses the supplied source",()=>{assert.equal(catalog.find(g=>g.id==="ovo-2")?.frameUrl,"https://iogamesweb.com/play/ovo-2/");});
