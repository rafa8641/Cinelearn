import Node from "../models/Node.js";
import Edge from "../models/Edge.js";

export async function recommendByGraph(userId, userAge) {
  // 1. Pega tags que o usuário curtiu
  const likedTags = await Edge.find({ from: userId, relation: "likes" }).distinct("to");

  if (!likedTags.length) {
    return [];
  }

  // 2. Busca filmes ligados a essas tags
  const movieEdges = await Edge.find({ to: { $in: likedTags }, relation: "hasTag" });
  const movieIds = movieEdges.map(e => e.from);

  // 3. Filtra por idade
  const movies = await Node.find({
    _id: { $in: movieIds },
    type: "movie",
    ageRestriction: { $lte: userAge }
  });

  // 4. Score de relevância
  const scored = movies.map(m => {
    const movieTags = movieEdges.filter(e => e.from === m._id).map(e => e.to);
    const score = movieTags.filter(t => likedTags.includes(t)).length;
    return { ...m.toObject(), score };
  });

  return scored.sort((a, b) => b.score - a.score);
}