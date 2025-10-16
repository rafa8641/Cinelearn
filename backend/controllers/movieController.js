import Movie from "../models/Movie.js";

// Retorna lista de filmes (com filtros opcionais)
export const getMovies = async (req, res) => {
    try {
    const { maxAge, q } = req.query;
    const filter = {};

    if (q) {
      filter.title = { $regex: q, $options: "i" };
    }

    // Adiciona verificação de poster suspeito
    const isSuspiciousPoster = (posterPath = "") => {
    const lower = posterPath.toLowerCase();
    return (
        lower.includes("r18") ||
        lower.includes("adult") ||
        lower.includes("sex") ||
        lower.includes("nsfw") ||
        lower.includes("ero") ||
        lower.includes("hentai") ||
        lower.includes("av") ||
        lower.includes("bed") ||
        lower.includes("kiss") ||
        lower.includes("underwear") ||
        lower.includes("lingerie")
    );
    };

    // 🔹 Bloqueia explicitamente filmes adultos e títulos sexualizados
    const bannedWords =
      "hentai|porn|porno|sex|sexual|sensual|seduction|ecchi|erotic|adult|mature|fetish|softcore|hardcore|provocative|AV|人妻|교환|키스|부부|러브|女体|爆乳";
    filter.$and = [
      { $or: [{ "tmdbData.adult": { $ne: true } }, { "tmdbData.adult": { $exists: false } }] },
      {
        $and: [
          { title: { $not: new RegExp(bannedWords, "i") } },
          { originalTitle: { $not: new RegExp(bannedWords, "i") } },
          { "tmdbData.overview": { $not: new RegExp(bannedWords, "i") } },
        ],
      },
      // bloqueia URLs suspeitas (alguns posters adultos usam domínios de conteúdo explícito)
      {
        $or: [
          { "tmdbData.poster_path": { $not: /adult|r18|porn|sex/i } },
          { poster: { $not: /adult|r18|porn|sex/i } },
        ],
      },
    ];

    // 🔹 Conversão de rating → idade mínima
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
      "NC-17": 18,
      NR: 18,
      "NR+": 18,
      "R18": 18,
      "R18+": 18,
      "XXX": 18,
    };

    const movies = await Movie.find(filter).lean();

    const filtered = movies.filter((movie) => {
        const rating = movie.rating;
        const requiredAge = ratingToAge[rating] ?? 0;
        const userAge = Number(maxAge || 99);

        // Verifica se o poster é suspeito
        const poster = movie.tmdbData?.poster_path || movie.poster || "";
        if (isSuspiciousPoster(poster)) return false;

        return requiredAge <= userAge;
    });

    res.json({ movies: filtered });
  } catch (error) {
    console.error("Erro ao buscar filmes:", error);
    res.status(500).json({ error: "Erro interno ao buscar filmes" });
  }
};

// Retorna filme por ID
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: "Filme não encontrado" });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar filme" });
  }
};
