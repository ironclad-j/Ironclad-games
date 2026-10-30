import fs from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const html=await fs.readFile(new URL('../golf-player.html',import.meta.url),'utf8').catch(()=> '');
const code=html.match(/<script id="golf-bridge">([\s\S]*?)<\/script>/)?.[1] || '';
function setup(storage=new Map()) {
 const context=vm.createContext({});vm.runInContext(code,context);
 assert.equal(typeof context.installGolfBridge,'function','The local player must provide the Unity bridge');
 const host={},events=[];
 const adapter=context.installGolfBridge(host,{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},(name,value)=>events.push([name,value]));
 return {host,events,adapter,storage};
}
test('ad requests close without showing ads or granting an unwatched reward',()=>{
 const {host,events}=setup();assert.equal(host.getIsInterstitialSupported(),'false');assert.equal(host.getIsRewardedSupported(),'false');
 host.showInterstitial('before_game');host.showRewarded('coins');host.showBanner('bottom','menu');
 assert.deepEqual(events,[['OnInterstitialStateChanged','closed'],['OnRewardedStateChanged','failed'],['OnBannerStateChanged','hidden']]);
});
test('Golf Orbit saves round trip across bridge instances without touching other saves',()=>{
 const storage=new Map([['another-game','keep']]);const a=setup(storage);
 a.host.setStorageData('progress{bridge_keys_separator}coins','level 2{bridge_values_separator}100','local_storage');
 const b=setup(storage);b.host.getStorageData('progress{bridge_keys_separator}coins','local_storage');
 assert.deepEqual(b.events,[['OnGetStorageDataSuccess','progress{bridge_keys_separator}coins{bridge_data_separator}level 2{bridge_values_separator}100']]);
 b.host.deleteStorageData('coins','local_storage');b.host.getStorageData('coins','local_storage');
 assert.equal(b.events.at(-1)[1],'coins{bridge_data_separator}');assert.equal(storage.get('another-game'),'keep');
});
test('storage denial reports failure without crashing game initialization',()=>{
 const context=vm.createContext({});vm.runInContext(code,context);assert.equal(typeof context.installGolfBridge,'function');
 const host={},events=[];context.installGolfBridge(host,{getItem(){throw Error('blocked')},setItem(){throw Error('blocked')},removeItem(){throw Error('blocked')}},(n,v)=>events.push([n,v]));
 host.getStorageData('save','local_storage');host.setStorageData('save','x','local_storage');
 assert.deepEqual(events,[['OnGetStorageDataFailed','save'],['OnSetStorageDataFailed','save']]);
});
