(function(root){
 const clone=s=>JSON.parse(JSON.stringify(s));
 function initialState(){const cards=Array.from({length:16},(_,i)=>i%8);for(let i=15;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}return {cards,selected:[],matched:[],moves:0,elapsed:0,over:false,paused:false};}
 function step(state,input={}){const s=clone(state);if(s.paused||s.over)return s;if(input.clear){s.selected=[];return s;}const i=input.index;if(!Number.isInteger(i)||i<0||i>15||s.selected.length===2||s.matched.includes(i)||s.selected.includes(i))return s;s.selected.push(i);if(s.selected.length===2){s.moves++;const [a,b]=s.selected;if(s.cards[a]===s.cards[b]){s.matched.push(a,b);s.selected=[];s.over=s.matched.length===16;}}return s;}
 function restore(c){const s=c?.state;const indices=a=>Array.isArray(a)&&new Set(a).size===a.length&&a.every(i=>Number.isInteger(i)&&i>=0&&i<16);if(c?.version!==1||!s||!Array.isArray(s.cards)||s.cards.length!==16||!s.cards.every(n=>Number.isInteger(n)&&n>=0&&n<8)||!Array.from({length:8},(_,i)=>i).every(n=>s.cards.filter(x=>x===n).length===2)||!indices(s.selected)||s.selected.length>2||!indices(s.matched)||s.matched.length%2||!Number.isInteger(s.moves)||s.moves<0||!Number.isFinite(s.elapsed)||s.elapsed<0||typeof s.over!=='boolean'||typeof s.paused!=='boolean')throw Error('This Memory Match save is incompatible. Start a new game to continue.');return clone(s);}
 root.GameEngine={initialState,step,serialize:s=>({version:1,state:clone(s)}),restore};
root.IroncladEngines??={};root.IroncladEngines.memory=root.GameEngine;
})(globalThis);

