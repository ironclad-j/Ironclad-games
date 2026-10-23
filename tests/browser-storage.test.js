import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import vm from 'node:vm';import {IDBFactory} from 'fake-indexeddb';
const stores=['config','cookies','publicSuffixList','redirectTrackers','referrerPolicies'];
async function helper(indexedDB){const context=vm.createContext({indexedDB,Error,Promise});vm.runInContext(await fs.readFile(new URL('../browser-storage.js',import.meta.url),'utf8'),context);return context.ensureIroncladStorage;}
function open(factory,name){return new Promise((resolve,reject)=>{const request=factory.open(name,1);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
test('first worker startup creates every store before an engine can open the database',async()=>{
 const factory=new IDBFactory();const ready=await helper(factory);await ready();const db=await open(factory,'$ironclad-scramjet-v1');assert.deepEqual([...db.objectStoreNames],stores);db.close();
});
test('an existing broken upstream database is preserved and cannot poison the repaired engine',async()=>{
 const factory=new IDBFactory();const old=await open(factory,'$scramjet');old.close();const ready=await helper(factory);await Promise.all([ready(),ready()]);const db=await open(factory,'$ironclad-scramjet-v1');assert.deepEqual([...db.objectStoreNames],stores);db.close();const unchanged=await open(factory,'$scramjet');assert.equal(unchanged.objectStoreNames.length,0);unchanged.close();
});
