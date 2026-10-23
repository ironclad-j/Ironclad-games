// SPDX-License-Identifier: AGPL-3.0-only
// Initialize before constructing either the Scramjet controller or worker.
// A separate name preserves any older, incomplete database without deleting it.
globalThis.ensureIroncladStorage=function(){
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open('$ironclad-scramjet-v1',1);
  request.onupgradeneeded=()=>{
   for(const name of ['config','cookies','redirectTrackers','referrerPolicies','publicSuffixList'])
    if(!request.result.objectStoreNames.contains(name))request.result.createObjectStore(name);
  };
  request.onerror=()=>reject(request.error);
  request.onblocked=()=>reject(Error('Close other Ironclad tabs and reload to finish browser setup.'));
  request.onsuccess=()=>{request.result.close();resolve();};
 });
};
