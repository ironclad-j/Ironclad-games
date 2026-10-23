export const catalog = Object.freeze([{id:'drive-mad',title:'Drive Mad',category:'driving',frameUrl:'https://ubghyper.github.io/GameList.github.io/Drive-Mad/',external:true,description:'Keep your balance and reach the finish.'},{id:'moto-road-rash-3d',title:'Moto Road Rash 3D',category:'racing',frameUrl:'https://class811.github.io/g7/moto-road-rash-3d/',external:true,description:'Ride through traffic and take on the road.'},{id:'retro-bowl',title:'Retro Bowl',category:'sports',frameUrl:'https://class811.github.io/g/retro-bowl/',external:true,description:'Build your team and lead it to the championship.'},{id:'big-shot-boxing',title:'Big Shot Boxing',category:'sports',frameUrl:'https://class811.github.io/g2/big-shot-boxing/',external:true,description:'Step into the ring and fight your way to the top.'}]);
export function filterGames(games,query='',category='all') {
  const q=query.trim().toLowerCase();
  return games.filter(g=>(category==='all'||g.category===category)&&`${g.title} ${g.description}`.toLowerCase().includes(q));
}

