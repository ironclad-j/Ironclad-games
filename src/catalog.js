export const catalog = Object.freeze([
  {id:'snake',title:'Snake',category:'arcade',frameUrl:'./games/snake/index.html',checkpointVersion:1,scoreDirection:'desc',tag:'THE CLASSIC, REFORGED',description:'One more bite. One less way out.',controls:'Arrow keys or WASD to turn. Space to pause.',color:'#c7f46b',symbol:'↳'},
  {id:'pong',title:'Pong',category:'arcade',frameUrl:'./games/pong/index.html',checkpointVersion:1,scoreDirection:'desc',tag:'HOLD YOUR LINE',description:'You. The machine. First to seven.',controls:'W / S, ↑ / ↓, or move your mouse. Space to pause.',color:'#a2b9ff',symbol:'Ⅱ'},
  {id:'memory',title:'Memory Match',category:'puzzle',frameUrl:'./games/memory/index.html',checkpointVersion:1,scoreDirection:'asc',tag:'SHARPEN YOUR INSTINCT',description:'Find your focus. Make every move count.',controls:'Click cards or use Tab and Enter. Match all eight pairs.',color:'#ffad75',symbol:'✦'}
]);
export function filterGames(games,query='',category='all') {
  const q=query.trim().toLowerCase();
  return games.filter(g=>(category==='all'||g.category===category)&&`${g.title} ${g.description}`.toLowerCase().includes(q));
}
