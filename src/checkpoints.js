// Reuse game rule validators so malformed integrations cannot replace a usable save.
import '../games/snake/engine.js';
import '../games/pong/engine.js';
import '../games/memory/engine.js';
export const isRunId=value=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export function validCheckpoint(gameId,value){
 try{if(!isRunId(value?.runId)||!Number.isFinite(value.elapsed)||value.elapsed<0||typeof value.completed!=='boolean')return false;const engine=globalThis.IroncladEngines?.[gameId];if(!engine)return false;engine.restore(value);return true;}catch{return false;}
}
