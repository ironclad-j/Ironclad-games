(function(root){
 const clone=s=>JSON.parse(JSON.stringify(s));const dirs={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
 function food(body){const free=[];for(let x=0;x<24;x++)for(let y=0;y<20;y++)if(!body.some(p=>p.x===x&&p.y===y))free.push({x,y});return free[Math.floor(Math.random()*free.length)]||null;}
 function initialState(){return {body:[{x:10,y:10},{x:9,y:10},{x:8,y:10}],food:{x:17,y:8},direction:'right',score:0,over:false,paused:false,ticks:0};}
 function step(state,input={}){const s=clone(state);if(s.paused||s.over)return s;let d=input.direction;if(dirs[d]&&dirs[d].x+dirs[s.direction].x!==0||dirs[d]&&dirs[d].y+dirs[s.direction].y!==0)s.direction=d;const head={x:s.body[0].x+dirs[s.direction].x,y:s.body[0].y+dirs[s.direction].y};const eats=s.food&&head.x===s.food.x&&head.y===s.food.y;const body=eats?s.body:s.body.slice(0,-1);if(head.x<0||head.x>=24||head.y<0||head.y>=20||body.some(p=>p.x===head.x&&p.y===head.y)){s.over=true;return s;}s.body.unshift(head);if(eats){s.score+=10;s.food=food(s.body);if(!s.food)s.over=true;}else s.body.pop();s.ticks++;return s;}
 function restore(c){const s=c?.state;const point=p=>p&&Number.isInteger(p.x)&&p.x>=0&&p.x<24&&Number.isInteger(p.y)&&p.y>=0&&p.y<20;if(c?.version!==1||!s||!Array.isArray(s.body)||s.body.length<3||s.body.length>480||!s.body.every(point)||(!point(s.food)&&!(s.food===null&&s.over))||!dirs[s.direction]||!Number.isInteger(s.score)||s.score<0||!Number.isInteger(s.ticks)||s.ticks<0||typeof s.over!=='boolean'||typeof s.paused!=='boolean')throw Error('This Snake save is incompatible. Start a new game to continue.');return clone(s);}
 root.GameEngine={initialState,step,serialize:s=>({version:1,state:clone(s)}),restore};
root.IroncladEngines??={};root.IroncladEngines.snake=root.GameEngine;
})(globalThis);

