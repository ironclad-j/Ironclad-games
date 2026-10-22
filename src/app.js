import {catalog,filterGames} from './catalog.js?v=drift-1';
import {gameArt} from './art.js?v=drift-1';
import {mountGame} from './frame-host.js?v=drift-1';
import {createSaveStore} from './save-store.js';
import {summarize} from './records.js';
import {client,createCloud} from './cloud.js';
import {createAuth} from './auth.js';
const $=s=>document.querySelector(s),auth=createAuth(client);
let currentUser=null,store,frame=null,paused=false,category='all',opening=0,accountGeneration=0,choiceResolve=null;
let storage;try{localStorage.setItem('ironclad:storage-test','1');localStorage.removeItem('ironclad:storage-test');storage=localStorage;}catch{const map=new Map();storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};}
const statusLabels={guest:'Saving on this device',saving:'Saving…',saved:'Saved to cloud',offline:'Saved on device · cloud unavailable',conflict:'Choose a save to keep',pending:'Save pending', 'storage-full':'! Device storage unavailable · keep this tab open'};
function setStatus(state){$('#sync-status').textContent=statusLabels[state]||state;}
function createStore(){const generation=++accountGeneration;store=createSaveStore({cloud:currentUser?createCloud(currentUser.id):null,storage,accountId:currentUser?.id||'guest',onStatus:s=>{if(generation===accountGeneration)setStatus(s);},onConflict:()=>{if(generation===accountGeneration)setStatus('conflict');}});setStatus(currentUser?'Cloud connected': 'guest');}
createStore();
function renderGames(){
 const games=filterGames(catalog,$('#search').value,category);
 $('#no-results').hidden=games.length>0;
 $('#game-grid').innerHTML=games.map(game=>`<article class="game-card"><div class="game-art" style="--card-bg:${game.color}">${gameArt(game.id)}</div><div class="game-content"><div class="game-title"><h2>${game.title}</h2><span class="category">${game.category}</span></div><p>${game.description}</p><button class="play-button" data-game="${game.id}" aria-label="Play ${game.title}">Play</button></div></article>`).join('');
}
async function leaveGame(){opening++;if(frame){const old=frame;await old.pause();old.destroy();if(frame===old)frame=null;}}
async function view(name){await leaveGame();for(const id of ['library','records','player'])$(`#${id}-view`).hidden=id!==name;document.querySelectorAll('.nav-item').forEach(button=>{const active=button.dataset.view===name;button.classList.toggle('active',active);if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});if(name==='records')await renderRecords();window.scrollTo({top:0,behavior:'instant'});}
async function choose(title,description,{device='Use device save',cloud='Use cloud save',showCloud=true}={}){
 if(choiceResolve){choiceResolve('cancel');$('#choice-dialog').close();}
 $('#choice-title').textContent=title;$('#choice-description').textContent=description;$('#choice-device').textContent=device;$('#choice-cloud').textContent=cloud;$('#choice-cloud').hidden=!showCloud;$('#choice-dialog').showModal();return new Promise(resolve=>{choiceResolve=resolve;});
}
for(const [selector,value] of [['#choice-cancel','cancel'],['#choice-cloud','cloud'],['#choice-device','device']])$(selector).addEventListener('click',()=>{$('#choice-dialog').close();const resolve=choiceResolve;choiceResolve=null;resolve?.(value);});
$('#choice-dialog').addEventListener('cancel',()=>{choiceResolve?.('cancel');choiceResolve=null;});
async function resolveGameConflict(gameId,owner){const conflict=owner.conflicts()[gameId];if(!conflict)return true;const choice=await choose('Two saves. Your choice.','This device and the cloud have different progress. Choose which one to keep.');if(choice==='cancel')return false;await owner.resolveConflict(gameId,choice);return true;}
async function openGame(gameId){const game=catalog.find(g=>g.id===gameId);if(!game)return;await leaveGame();const request=++opening,owner=store;let checkpoint=game.external?null:await owner.load(gameId);if(request!==opening||owner!==store)return;if(!game.external&&!await resolveGameConflict(gameId,owner))return;if(request!==opening||owner!==store)return;checkpoint=owner.getCheckpoint(gameId);
 for(const name of ['library','records','player'])$(`#${name}-view`).hidden=name!=='player';$('#game-title').textContent=game.title;$('#game-controls').textContent=game.controls;$('#player-message').textContent=game.external?'Hosted by OnlineGames.io. Saves and pause controls are managed by this game.':'Games pause when you click outside them. Your progress saves automatically.';$('#pause-game').hidden=!!game.external;paused=false;$('#pause-game').textContent='Pause';$('#pause-game').disabled=true;$('#restart-game').disabled=true;
 frame=mountGame({container:$('#frame-container'),game,checkpoint,onCheckpoint:data=>{owner.saveCheckpoint(gameId,data);if(owner===store&&owner.conflicts()[gameId])$('#player-message').textContent='A newer cloud save exists. Return to My scores to choose which progress to keep.';},onComplete:run=>owner.queueRun(run),onError:message=>{$('#player-message').textContent=message;},onReady:()=>{$('#pause-game').disabled=false;$('#restart-game').disabled=false;},onPaused:value=>{paused=value;$('#pause-game').textContent=value?'Resume':'Pause';}});window.scrollTo({top:0,behavior:'instant'});
}
async function renderRecords(){const owner=store;const runs=await owner.allRuns();if(owner!==store)return;$('#records-grid').innerHTML=catalog.filter(game=>!game.external).map(game=>{const stats=summarize(runs.filter(r=>r.gameId===game.id),game),save=owner.getCheckpoint(game.id),conflict=owner.conflicts()[game.id];return `<article class="record-card"><h2>${game.title}</h2><strong>${stats.best?stats.best.score:'—'}</strong><p>${stats.best?(game.id==='memory'?'Best moves':'Personal best'):'No completed games yet.'}</p><p>${stats.count} ${stats.count===1?'round':'rounds'} played</p><button class="button" data-game="${game.id}">${save&&!save.state?.over?'Continue':'Play'}</button>${conflict?`<p class="error">Two saves need your choice.</p><button class="button" data-conflict="${game.id}">Resolve save conflict</button>`:''}</article>`;}).join('');}
document.addEventListener('click',event=>{const game=event.target.closest('[data-game]');if(game)openGame(game.dataset.game).catch(showError);const navigation=event.target.closest('[data-view]');if(navigation)view(navigation.dataset.view).catch(showError);const conflict=event.target.closest('[data-conflict]');if(conflict)resolveGameConflict(conflict.dataset.conflict,store).then(renderRecords).catch(showError);});
function showError(error){$('#player-message').textContent=error.message||'Something went wrong. Please try again.';}
$('#search').addEventListener('input',renderGames);document.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.category;document.querySelectorAll('[data-category]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});renderGames();}));
$('#back-library').addEventListener('click',()=>view('library'));$('#pause-game').addEventListener('click',()=>{if(paused)frame?.resume();else frame?.pause();});
$('#restart-game').addEventListener('click',async()=>{await frame?.pause();const choice=await choose('Start a fresh round?','Your personal records stay saved. This replaces the current game in progress.',{device:'Start new game',showCloud:false});if(choice==='device')frame?.restart();});
$('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('#frame-container').requestFullscreen();$('#frame-container iframe')?.focus();}catch{$('#player-message').textContent='Fullscreen is unavailable in this browser. You can keep playing in the page.';}});
document.addEventListener('keydown',event=>{if(event.key==='/'&&!event.target.matches('input,textarea')&&!$('#library-view').hidden&&!$('#choice-dialog').open){event.preventDefault();$('#search').focus();}});
auth.subscribe((event,session)=>{
 setTimeout(async()=>{
  const user=session?.user||null;
  if(user?.id!==currentUser?.id){
   await leaveGame();store.dispose();currentUser=user;createStore();await view('library');
   if(user){if(user.is_anonymous)await store.importGuest();await store.flush();}
  }
  if(event==='SIGNED_OUT'){const guest=await auth.ensureGuest();if(guest.error)setStatus('offline');}
 },0);
});
window.addEventListener('online',()=>store.flush());
setInterval(()=>{if(navigator.onLine)store.flush();},15000);
window.addEventListener('pagehide',()=>frame?.pause());
renderGames();
// A private browser session provides cloud saves without any account interface.
try{const result=await auth.ensureGuest();if(result.error)setStatus('offline');}catch{setStatus('offline');}
