import test from 'node:test';import assert from 'node:assert/strict';
import {engineOrder,toBrowserUrl,validateEndpoint,runWithFallback} from '../src/browser-policy.js';
test('engine order supports fallback in either direction and can disable it',()=>{
 assert.deepEqual(engineOrder('scramjet',true),['scramjet','ultraviolet']);assert.deepEqual(engineOrder('ultraviolet',true),['ultraviolet','scramjet']);assert.deepEqual(engineOrder('ultraviolet',false),['ultraviolet']);
});
test('browser input accepts web addresses and searches but rejects executable schemes',()=>{
 assert.equal(toBrowserUrl('example.org'),'https://example.org/');assert.equal(toBrowserUrl('space flight'),'https://duckduckgo.com/?q=space%20flight');
 assert.throws(()=>toBrowserUrl('javascript:alert(1)'));assert.throws(()=>toBrowserUrl('https://user:pass@example.org'));
});
test('only secure public endpoints or local development WS are accepted',()=>{
 assert.equal(validateEndpoint('wss://proxy.example.org/wisp/'),'wss://proxy.example.org/wisp/');assert.equal(validateEndpoint('ws://127.0.0.1:8080/wisp/'),'ws://127.0.0.1:8080/wisp/');assert.throws(()=>validateEndpoint('ws://proxy.example.org/wisp/'));assert.throws(()=>validateEndpoint('wss://user:pass@proxy.example.org/'));
});
test('failure switches once to the other engine and both failures stop',async()=>{
 for(const preferred of ['scramjet','ultraviolet']){const calls=[];const result=await runWithFallback({preferred,automatic:true,attempt:async engine=>{calls.push(engine);if(calls.length===1)throw Error('engine failed');return engine;}});assert.equal(result,engineOrder(preferred,true)[1]);assert.equal(calls.length,2);}
 let calls=0;await assert.rejects(runWithFallback({preferred:'scramjet',automatic:true,attempt:async()=>{calls++;throw Error('failed');}}));assert.equal(calls,2);
});
test('cancelled navigation never starts the fallback engine',async()=>{
 const controller=new AbortController();let calls=0;
 await assert.rejects(runWithFallback({preferred:'scramjet',automatic:true,signal:controller.signal,attempt:async()=>{calls++;controller.abort();throw Error('cancelled');}}));assert.equal(calls,1);
});
