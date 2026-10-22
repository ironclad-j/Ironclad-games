export const catalog = Object.freeze([]);
export function filterGames(games,query='',category='all') {
  const q=query.trim().toLowerCase();
  return games.filter(g=>(category==='all'||g.category===category)&&`${g.title} ${g.description}`.toLowerCase().includes(q));
}

