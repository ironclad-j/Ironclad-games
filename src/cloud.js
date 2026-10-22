import {createClient} from '../assets/supabase.js';
import {supabaseUrl,supabasePublishableKey} from '../config.js';
export const client=createClient(supabaseUrl,supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const check=result=>{if(result.error)throw result.error;return result.data;};
export function createCloud(accountId){
 async function scoped(){const {data:{session}}=await client.auth.getSession();if(!session||session.user.id!==accountId)throw Error('Account changed');
 // Freeze the bearer for this request; an account switch cannot redirect queued writes.
 return createClient(supabaseUrl,supabasePublishableKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},accessToken:async()=>session.access_token});}
 return {
  async appendRun(run){const api=await scoped();const result=await api.from('game_runs').insert({user_id:accountId,run_id:run.runId,game_id:run.gameId,version:run.version||1,score:run.score,details:run.details||{}});if(result.error&&result.error.code!=='23505')throw result.error;},
  async listRuns(){const api=await scoped();let offset=0,all=[];while(true){const data=check(await api.from('game_runs').select('*').eq('user_id',accountId).order('created_at',{ascending:false}).range(offset,offset+999));all.push(...data);if(data.length<1000)break;offset+=1000;}return all.map(r=>({runId:r.run_id,gameId:r.game_id,version:r.version,score:r.score,details:r.details,createdAt:r.created_at}));},
  async readCheckpoint(gameId){const api=await scoped();return check(await api.from('game_checkpoints').select('revision,data,updated_at').eq('user_id',accountId).eq('game_id',gameId).maybeSingle());},
  async writeCheckpoint(gameId,revision,data){const api=await scoped();return check(await api.rpc('save_checkpoint',{p_game_id:gameId,p_expected_revision:revision,p_data:data}));},
 };
}
