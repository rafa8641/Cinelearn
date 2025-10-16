import Users from "../models/Users.js";
import Movie from "../models/Movie.js";

export const getRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const movies = await Movie.find();

    const recommendations = movies.filter(movie => {
      const movieKeywordNames = movie.keywords.map(k => k.name.toLowerCase());
      const userKeywords = user.keywords.map(k => k.toLowerCase());

      const matchKeywords = userKeywords.some(k => movieKeywordNames.includes(k));
      const matchGenres = user.genres.some(g => movie.genres.includes(g));
      const ageOK = !movie.minimumAge || user.age >= movie.minimumAge;

      return (matchKeywords || matchGenres) && ageOK;
    });

    res.json(recommendations);
  } catch (error) {
    console.error("Erro ao obter recomendações:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
