import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog} from '../src/catalog.js';
test('thirty-two games retain the supplied iframe sources',()=>{assert.equal(catalog.length,32);assert.deepEqual(catalog.slice(0,8).map(g=>g.frameUrl),['https://ubghyper.github.io/GameList.github.io/Drive-Mad/','https://class811.github.io/g7/moto-road-rash-3d/','https://class811.github.io/g/retro-bowl/','https://class811.github.io/g2/big-shot-boxing/','https://class811.github.io/g/slope/','https://class811.github.io/g/drift-hunters/','https://class811.github.io/g8/snow-rider-3d/','https://classroom2111.github.io/g5/class-456/']);assert.equal(catalog[2].title,'Retro Bowl');assert.ok(catalog.every(g=>g.external));});
test("Moto X3M Spooky Land has the supplied source",()=>{const game=catalog.find(g=>g.id==="moto-x3m-spooky-land");assert.equal(game?.frameUrl,"https://classroom2111.github.io/g5/class-461/");assert.equal(game?.title,"Moto X3M Spooky Land");});
test("Stacktris has the supplied source",()=>{const game=catalog.find(g=>g.id==="stacktris");assert.equal(game?.frameUrl,"https://class811.github.io/g6/stacktris/");assert.equal(game?.title,"Stacktris");});
test("Rocket Soccer Derby has the supplied source",()=>{const game=catalog.find(g=>g.id==="rocket-soccer-derby");assert.equal(game?.frameUrl,"https://class811.github.io/g6/rocket-soccer-derby/");assert.equal(game?.title,"Rocket Soccer Derby");});
test("Moto X3M has the supplied source",()=>{const game=catalog.find(g=>g.id==="moto-x3m");assert.equal(game?.frameUrl,"https://class811.github.io/g8/moto-x3m/");assert.equal(game?.title,"Moto X3M");});
test("Eggy Car has the supplied source",()=>{const game=catalog.find(g=>g.id==="eggy-car");assert.equal(game?.frameUrl,"https://class811.github.io/g/eggy-car/");assert.equal(game?.title,"Eggy Car");});
test("Moto X3M 2 has the supplied source",()=>{const game=catalog.find(g=>g.id==="moto-x3m-2");assert.equal(game?.frameUrl,"https://class811.github.io/g8/moto-x3m-2/");assert.equal(game?.title,"Moto X3M 2");});
test("Moto X3M Winter has the supplied source",()=>{const game=catalog.find(g=>g.id==="moto-x3m-winter");assert.equal(game?.frameUrl,"https://class811.github.io/g/moto-x3m-winter/");assert.equal(game?.title,"Moto X3M Winter");});

test("OvO 2 uses the supplied source",()=>{assert.equal(catalog.find(g=>g.id==="ovo-2")?.frameUrl,"https://ubg98.github.io/OvO2/");});

test("Potato League uses the official playable embed",()=>{assert.equal(catalog.find(g=>g.id==="potato-league")?.frameUrl,"https://itch.io/embed-upload/19853545?color=0b0b0b");});

test("Stack uses the supplied source",()=>{assert.equal(catalog.find(g=>g.id==="stack")?.frameUrl,"https://class811.github.io/g2/stack/");});

test("Level Devil uses the supplied source",()=>{assert.equal(catalog.find(g=>g.id==="level-devil")?.frameUrl,"https://class811.github.io/g177/level-devil/");});

test("Highway Traffic uses the supplied source",()=>{assert.equal(catalog.find(g=>g.id==="highway-traffic")?.frameUrl,"https://class811.github.io/g7/highway-traffic/");});

test("Rush Race Motocross uses the supplied source",()=>{assert.equal(catalog.find(g=>g.id==="rush-race-motocross")?.frameUrl,"https://class811.github.io/g69/rush-race-motocross/");});

test("Getaway Shootout uses the supplied source",()=>{assert.equal(catalog.find(g=>g.id==="getaway-shootout")?.frameUrl,"https://class811.github.io/g4/getaway-shootout/");});

test("Rooftop Snipers uses the supplied source",()=>{assert.equal(catalog.find(g=>g.id==="rooftop-snipers")?.frameUrl,"https://class811.github.io/g/rooftop-snipers/");});

test("Tag uses the supplied source",()=>{assert.equal(catalog.find(g=>g.id==="tag")?.frameUrl,"https://class811.github.io/g3/tag/");});

test("Stickman Hook uses the supplied source",()=>{assert.equal(catalog.find(g=>g.id==="stickman-hook")?.frameUrl,"https://class811.github.io/g/stickman-hook/");});

test("Flappy Bird uses the supplied source",()=>{assert.equal(catalog.find(g=>g.id==="flappy-bird")?.frameUrl,"https://class811.github.io/g8/flappy-bird-origin/");});

test("Basket Bros uses the supplied source",()=>{assert.equal(catalog.find(g=>g.id==="basket-bros")?.frameUrl,"https://class811.github.io/g7/basket-bros/");});

test("Super Mario Bros. uses the supplied source",()=>{assert.equal(catalog.find(g=>g.id==="super-mario-bros")?.frameUrl,"https://class811.github.io/g9/super-mario-bros/");});

test("Golf Orbit uses the clean playable embed",()=>{assert.equal(catalog.find(g=>g.id==="golf-orbit")?.frameUrl,"https://tapnation.cdn.msnfun.com/9n3vgdv15p8s/v6/index.html");});

test("Happy Wheels uses the Flash iframe player",()=>{assert.equal(catalog.find(g=>g.id==="happy-wheels")?.frameUrl,"./flash-player.html?game=happy-wheels");});

test("Age of War uses the Flash iframe player",()=>{assert.equal(catalog.find(g=>g.id==="age-of-war")?.frameUrl,"./flash-player.html?game=age-of-war");});

test("Age of War 2 uses the Flash iframe player",()=>{assert.equal(catalog.find(g=>g.id==="age-of-war-2")?.frameUrl,"./flash-player.html?game=age-of-war-2");});
