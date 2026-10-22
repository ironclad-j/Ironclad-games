export const catalog = Object.freeze([{id:'drive-mad',title:'Drive Mad',category:'driving',frameUrl:'https://ubghyper.github.io/GameList.github.io/Drive-Mad/',external:true,description:'Keep your balance and reach the finish.'}]);
export function filterGames(games,query='',category='all') {
  const q=query.trim().toLowerCase();
  return games.filter(g=>(category==='all'||g.category===category)&&`${g.title} ${g.description}`.toLowerCase().includes(q));
}

