import test from 'node:test';import assert from 'node:assert/strict';
import {boundedAttempt} from '../src/browser-attempt.js';
test('stalled initialization times out and aborts its continuation',async()=>{
 let inner;await assert.rejects(boundedAttempt(signal=>{inner=signal;return new Promise(()=>{});},new AbortController().signal,10),/timed out/);assert.equal(inner.aborted,true);
});
test('cancelling navigation settles a stalled setup immediately',async()=>{
 const controller=new AbortController();const pending=boundedAttempt(()=>new Promise(()=>{}),controller.signal);controller.abort();await assert.rejects(pending,{name:'AbortError'});
});
