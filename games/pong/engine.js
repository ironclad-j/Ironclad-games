(function(root){
 const clone=s=>JSON.parse(JSON.stringify(s)),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const serve=()=>({x:320,y:200,vx:Math.random()<.5?-230:230,vy:(Math.random()-.5)*220});
 function initialState(){return {playerY:200,aiY:200,playerScore:0,aiScore:0,ball:serve(),rallies:0,over:false,paused:false};}
 function step(state,input={},dt=.016){const s=clone(state);if(s.paused||s.over)return s;dt=clamp(dt,0,.04);s.playerY=clamp(Number.isFinite(input.paddle)?input.paddle:s.playerY+(input.move||0)*360*dt,40,360);const b=s.ball;s.aiY=clamp(s.aiY+clamp(b.y-s.aiY,-175*dt,175*dt),40,360);b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.y<6||b.y>394){b.y=clamp(b.y,6,394);b.vy*=-1;}if(b.vx<0&&b.x<=33&&b.x>=15&&Math.abs(b.y-s.playerY)<45){b.x=34;b.vx=Math.min(500,-b.vx*1.04);b.vy=(b.y-s.playerY)*5;s.rallies++;}if(b.vx>0&&b.x>=607&&b.x<=625&&Math.abs(b.y-s.aiY)<45){b.x=606;b.vx=-Math.min(500,b.vx*1.04);b.vy=(b.y-s.aiY)*5;}if(b.x<0){s.aiScore++;s.ball=serve();}if(b.x>640){s.playerScore++;s.ball=serve();}s.over=s.playerScore>=7||s.aiScore>=7;return s;}
 function restore(c){const s=c?.state;const nums=s&&[s.playerY,s.aiY,s.playerScore,s.aiScore,s.rallies,s.ball?.x,s.ball?.y,s.ball?.vx,s.ball?.vy];if(c?.version!==1||!nums?.every(Number.isFinite)||s.playerY<40||s.playerY>360||s.aiY<40||s.aiY>360||s.playerScore<0||s.playerScore>7||s.aiScore<0||s.aiScore>7||Math.abs(s.ball.vx)>600||Math.abs(s.ball.vy)>600||typeof s.over!=='boolean'||typeof s.paused!=='boolean')throw Error('This Pong save is incompatible. Start a new game to continue.');return clone(s);}
 root.GameEngine={initialState,step,serialize:s=>({version:1,state:clone(s)}),restore};
root.IroncladEngines??={};root.IroncladEngines.pong=root.GameEngine;
})(globalThis);

