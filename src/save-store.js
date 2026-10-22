export function createSaveStore({cloud=null,storage,accountId='guest',onStatus=()=>{},onConflict=()=>{}}){
 const key=`ironclad:v1:${accountId}`;let alive=true,busy=null,conflictMap={};const mutations={};
 let state;try{state=JSON.parse(storage.getItem(key)||'null');}catch{}state={runs:[],pendingRuns:[],checkpoints:{},pendingCheckpoints:{},revisions:{},...state};
 const persist=()=>{try{storage.setItem(key,JSON.stringify(state));}catch{if(alive)onStatus('storage-full');}};
 const status=s=>{if(alive)onStatus(s);};
 async function flush(){
  if(!alive)return;if(busy)return busy;if(!cloud){status('guest');persist();return;}
  busy=(async()=>{try{
   if(state.pendingRuns.length||Object.keys(state.pendingCheckpoints).length)status('saving');
   for(const run of [...state.pendingRuns]){if(!alive)return;await cloud.appendRun({...run,userId:accountId});if(!alive)return;state.pendingRuns=state.pendingRuns.filter(r=>r.runId!==run.runId);persist();}
   for(const gameId of Object.keys(state.pendingCheckpoints)){
    if(!alive)return;if(conflictMap[gameId])continue;
    const data=state.pendingCheckpoints[gameId];const result=await cloud.writeCheckpoint(gameId,state.revisions[gameId]||0,data);
    if(!alive)return;if(result.conflict){conflictMap[gameId]={current:result.current,device:state.pendingCheckpoints[gameId]};onConflict(gameId,conflictMap[gameId]);status('conflict');continue;}
    state.revisions[gameId]=result.current.revision;
    // A newer checkpoint may have arrived while this write was in flight.
    if(state.pendingCheckpoints[gameId]===data)delete state.pendingCheckpoints[gameId];persist();
   }
   if(Object.keys(conflictMap).length)status('conflict');else if(!state.pendingRuns.length&&!Object.keys(state.pendingCheckpoints).length)status('saved');else status('pending');
  }catch{status('offline');}})().finally(()=>{busy=null;});return busy;
 }
 return {
  async queueRun(run){if(!alive)return;if(!state.runs.some(r=>r.runId===run.runId)){state.runs.push(run);if(cloud)state.pendingRuns.push(run);persist();}await flush();},
  async saveCheckpoint(gameId,data){if(!alive)return;mutations[gameId]=(mutations[gameId]||0)+1;state.checkpoints[gameId]=data;if(cloud){state.pendingCheckpoints[gameId]=data;if(conflictMap[gameId])conflictMap[gameId].device=data;}persist();await flush();},
  async load(gameId){if(!alive)return null;if(busy)await busy;if(!alive)return null;const generation=mutations[gameId]||0;if(cloud){try{const remote=await cloud.readCheckpoint(gameId);if(!alive)return null;if(generation!==(mutations[gameId]||0))return state.checkpoints[gameId]||null;if(state.pendingCheckpoints[gameId]){if((remote?.revision||0)!==(state.revisions[gameId]||0)){conflictMap[gameId]={current:remote,device:state.pendingCheckpoints[gameId]};onConflict(gameId,conflictMap[gameId]);}else await flush();}else{state.revisions[gameId]=remote?.revision||0;if(remote)state.checkpoints[gameId]=remote.data;persist();}}catch{status('offline');}}return state.checkpoints[gameId]||null;},
  async allRuns(){if(cloud){try{const remote=await cloud.listRuns();if(!alive)return [];const merged=new Map(state.runs.map(r=>[r.runId,r]));for(const r of remote)merged.set(r.runId,r);state.runs=[...merged.values()];persist();}catch{status('offline');}}return [...state.runs];},
  getCheckpoint:gameId=>state.checkpoints[gameId]||null,
  pendingCount:()=>state.pendingRuns.length+Object.keys(state.pendingCheckpoints).length,
  conflicts:()=>({...conflictMap}),
  async resolveConflict(gameId,choice){const conflict=conflictMap[gameId];if(!conflict||!alive)return;mutations[gameId]=(mutations[gameId]||0)+1;state.revisions[gameId]=conflict.current?.revision||0;if(choice==='cloud'){if(conflict.current)state.checkpoints[gameId]=conflict.current.data;else delete state.checkpoints[gameId];delete state.pendingCheckpoints[gameId];}else if(choice==='device'){state.checkpoints[gameId]=conflict.device;state.pendingCheckpoints[gameId]=conflict.device;}else return;delete conflictMap[gameId];persist();await flush();},
  async importGuest(sourceId='guest'){if(accountId==='guest'||!alive||sourceId===accountId)return;let guest;try{guest=JSON.parse(storage.getItem(`ironclad:v1:${sourceId}`)||'null');}catch{return;}if(!guest)return;for(const run of guest.runs||[]){if(!state.runs.some(r=>r.runId===run.runId)){state.runs.push(run);state.pendingRuns.push(run);}}for(const [gameId,data] of Object.entries(guest.checkpoints||{})){if(!state.checkpoints[gameId]){mutations[gameId]=(mutations[gameId]||0)+1;state.checkpoints[gameId]=data;state.pendingCheckpoints[gameId]=data;}}persist();await flush();},
  flush,dispose(){alive=false;},
 };
}
