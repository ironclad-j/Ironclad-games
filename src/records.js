export function summarize(runs,game){
 const sorted=[...runs].sort((a,b)=>game.scoreDirection==='asc'?a.score-b.score||((a.details?.elapsed||0)-(b.details?.elapsed||0)):b.score-a.score);
 return {best:sorted[0]||null,count:runs.length};
}
