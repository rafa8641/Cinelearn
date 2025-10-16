import Movie from "../models/Movie.js";

export const getRecommendations = async (req, res) => {
  try {
    const { maxAge, q } = req.query; // vem da query string
    const filter = {};

    if (q) {
      filter.title = { $regex: q, $options: "i" };
    }

    const movies = await Movie.find(filter).lean();

    const ratingToAge = {
      L: 0,
      "L+": 0,
      Livre: 0,
      G: 0,
      PG: 10,
      "PG-13": 12,
      "10": 10,
      "10+": 10,
      "12": 12,
      "12+": 12,
      "14": 14,
      "14+": 14,
      "16": 16,
      "16+": 16,
      R: 16,
      "R+": 18,
      "18": 18,
      "18+": 18,
      "NR+": 18,
      "R18+": 18,
      "XXX": 18,
    };

    const userAge = Number(maxAge || 99);
    const filtered = movies.filter((m) => {
      const requiredAge = ratingToAge[m.rating] ?? 0;
      return requiredAge <= userAge;
    });

    res.json({ movies: filtered });
  } catch (error) {
    console.error("Erro ao obter recomendações:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
