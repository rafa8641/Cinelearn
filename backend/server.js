import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fetch from "node-fetch";
import Movie from "./models/Movie.js";
import Users from "./models/Users.js";
import userRoutes from "./routes/userRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import cors from "cors";

dotenv.config();

const allowedOrigins = [
  "http://localhost:5173",
  "https://cinelearn-three.vercel.app",
];

const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // permite chamadas internas
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn("🚫 CORS bloqueado para:", origin);
        return callback(new Error("CORS não permitido para esta origem: " + origin));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);

app.get("/ping", (req, res) => {
  res.json({ message: "API está funcionando 🚀" });
});

app.get("/api/movies/filter", async (req, res) => {
  try {
    const { genre, q, type, year, maxAge, minAge, cursor, limit: limitStr } = req.query;
    const query = {};

    // 🔎 texto
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { "keywords.name": { $regex: q, $options: "i" } },
        { "genres.name": { $regex: q, $options: "i" } },
      ];
    }

    // 🎭 gênero
    if (genre) query["genres.name"] = { $regex: genre, $options: "i" };

    // 🎬 tipo
    if (type) query["tmdbData.media_type"] = type;

    // 📅 ano
    if (year) {
      query.$or = [
        { "tmdbData.release_date": { $regex: year, $options: "i" } },
        { "tmdbData.first_air_date": { $regex: year, $options: "i" } },
      ];
    }

    // 🧒 faixa etária
    let userAge = null;
    if (maxAge) userAge = parseInt(maxAge, 10);
    else if (minAge) userAge = parseInt(minAge, 10);

    const isTeacher = Boolean(minAge);

    if (userAge && !isNaN(userAge)) {
      if (isTeacher) {
        // professor → compatível com essa idade
        query.$and = [
          {
            $or: [
              { minAge: null },
              { minAge: { $lte: userAge } },
              { minAge: { $exists: false } },
            ],
          },
          {
            $or: [
              { maxAge: null },
              { maxAge: { $gte: userAge } },
              { maxAge: { $exists: false } },
            ],
          },
        ];
      } else {
        // aluno → até a idade do aluno
        query.$and = [
          {
            $or: [
              { minAge: null },
              { minAge: { $lte: userAge } },
              { minAge: { $exists: false } },
            ],
          },
          {
            $or: [
              { maxAge: null },
              { maxAge: { $gte: userAge } },
              { maxAge: { $exists: false } },
            ],
          },
        ];
      }
    }

    // 🔁 cursor por tmdbData.id (numérico)
    const limit = Math.max(10, parseInt(limitStr || "48", 10));
    const sort = { "tmdbData.id": -1, _id: 1 }; // ordena do maior id TMDB p/ menor

    const finalQuery = { ...query, "tmdbData.id": { $exists: true } };
    if (cursor) {
      const c = parseInt(cursor, 10);
      if (!isNaN(c)) {
        finalQuery["tmdbData.id"] = { ...finalQuery["tmdbData.id"], $lt: c };
      }
    }

    const movies = await Movie.find(finalQuery).sort(sort).limit(limit).lean();

    const nextCursor = movies.length ? movies[movies.length - 1]?.tmdbData?.id : null;
    const hasMore = movies.length === limit;

    res.json({
      movies,
      nextCursor,
      hasMore,
    });
  } catch (err) {
    console.error("❌ Erro ao buscar filmes:", err);
    res.status(500).json({ error: "Erro ao buscar filmes" });
  }
});

// Listar todos os filmes
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.find(); // busca todos os filmes
    res.json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar filmes" });
  }
});

// Criar um novo usuário
app.post("/users", async (req, res) => {
  try {
    const { name, email, age } = req.body;
    const user = new Users({ name, email, age, ratings: [] });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Erro ao criar usuário" });
  }
});

// Buscar usuário pelo ID
app.get("/users/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const user = await Users.findById(id)
      .populate("favorites")
      .populate({
        path: "quizResults.recommendations",
        model: "Movie",
      })
      .lean();

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    res.json(user);
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
});

// Atualizar dados do usuário
app.put("/users/:id", async (req, res) => {
  const id = req.params.id.trim();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const updateData = req.body;
    const user = await Users.findByIdAndUpdate(id, updateData, { new: true }).lean();

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

// Salvar avaliação de filme do usuário
app.post("/users/:id/ratings", async (req, res) => {
  const id = req.params.id.trim();
  const { movieId, rating } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID de usuário inválido" });
  }
  if (!mongoose.Types.ObjectId.isValid(movieId)) {
    return res.status(400).json({ error: "ID de filme inválido" });
  }
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Avaliação deve ser um número entre 1 e 5" });
  }

  try {
    const user = await Users.findById(id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    // Verifica se já tem avaliação para esse filme e atualiza
    const existingRating = user.ratings.find(r => r.movieId.toString() === movieId);
    if (existingRating) {
      existingRating.rating = rating;
    } else {
      user.ratings.push({ movieId, rating });
    }

    await user.save();
    res.json({ message: "Avaliação salva com sucesso", ratings: user.ratings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar avaliação" });
  }
});

app.get("/movies", async (req, res) => {
  const movies = await Movie.find().limit(20);
  res.json(movies);
});

app.get("/movies/:id", async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  res.json(movie);
});

app.post("/ratings", async (req, res) => {
  const { userId, movieId, rating } = req.body;
  const user = await Users.findById(userId);
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

  user.ratings.push({ movieId, rating });
  await user.save();

  res.json({ message: "Avaliação salva" });
});

// Adiciona um filme aos favoritos do usuário
app.post("/users/:id/favorites", async (req, res) => {
  const { id } = req.params;
  const { movieId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID de usuário inválido" });
    }

    try {
    const user = await Users.findById(id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    // Evita duplicados
    if (!user.favorites.includes(movieId)) {
      user.favorites.push(movieId);
      await user.save();
    }

    res.json({ message: "Filme adicionado aos favoritos", favorites: user.favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao adicionar favorito", details: err.message });
  }
});

// Remove um filme dos favoritos do usuário
app.delete("/users/:id/favorites/:movieId", async (req, res) => {
  const { id, movieId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID de usuário inválido" });
    }

  try {
    const user = await Users.findById(id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    user.favorites = user.favorites.filter(fav => fav.toString() !== movieId);
    await user.save();

    res.json({ message: "Filme removido dos favoritos", favorites: user.favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao remover favorito", details: err.message });
  }
});

// Lista os filmes favoritos do usuário
app.get("/users/:id/favorites", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID de usuário inválido" });
    }

  try {
    const user = await Users.findById(id).populate("favorites").lean();
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar favoritos", details: err.message });
  }
});

// Recomendação com grafos
app.post("/api/recommendations/graph/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { answers = [] } = req.body;

    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // 🔹 Extrai e normaliza respostas (em minúsculas)
    const quizKeywords = (answers || [])
      .flatMap(a => (Array.isArray(a) ? a : [a]))
      .map(s => s.toString().trim().toLowerCase())
      .filter(Boolean);

    if (quizKeywords.length === 0) {
      return res.status(400).json({ error: "Nenhuma resposta recebida para gerar recomendações" });
    }

    // 🔹 Detecta tipo (movie / tv / both)
    let selectedType = "both";
    if (quizKeywords.includes("filmes")) selectedType = "movie";
    else if (quizKeywords.includes("séries") || quizKeywords.includes("series")) selectedType = "tv";

    // 🔹 Detecta idade escolhida no quiz (apenas professores têm essa pergunta)
    let quizSelectedAge = 0;
    const ageAnswer = quizKeywords.find(a => a.includes("anos"));
    if (ageAnswer) {
      const m = ageAnswer.match(/\d+/);
      if (m) quizSelectedAge = parseInt(m[0], 10);
    }

    // 🔹 Define a idade efetiva de filtragem:
    // Professores → idade do quiz; Alunos → idade do perfil
    const role = (user.role || "").toLowerCase();
    const effectiveAge =
      role === "professor"
        ? quizSelectedAge || 0
        : Number(user.age) || 0;

    console.log("🔎 Keywords do quiz:", quizKeywords);
    console.log("🎞️ Tipo selecionado:", selectedType);
    console.log("👩‍🏫 Tipo de usuário:", role);
    console.log("🧮 Idade usada para filtragem:", effectiveAge);

    // 1️⃣ FILTRO DE TIPO (movie / tv / both)
    const typeFilter =
      selectedType === "both"
        ? {}
        : selectedType === "movie"
        ? {
            $or: [
              { "tmdbData.media_type": "movie" },
              { "tmdbData.media_type": { $exists: false } }, // ✅ filmes sem tipo marcado
            ],
          }
        : { "tmdbData.media_type": "tv" };

    // 2️⃣ FILTRO DE IDADE
    const ageFilter =
      effectiveAge > 0
        ? {
            $and: [
              // pega filmes SEM faixa etária OU com faixa compatível
              {
                $or: [
                  { minAge: null },
                  { minAge: { $lte: effectiveAge } },
                  { minAge: { $exists: false } },
                ],
              },
              {
                $or: [
                  { maxAge: null },
                  { maxAge: { $gte: effectiveAge } },
                  { maxAge: { $exists: false } },
                ],
              },
            ],
          }
        : {
            // se o usuário não escolheu idade (ex: aluno comum)
            $or: [{ minAge: null }, { minAge: { $lte: 18 } }, { minAge: { $exists: false } }],
          };

    // 3️⃣ BUSCA PRINCIPAL — keywords (com regex)
    const regexKeywords = quizKeywords.map(k => new RegExp(k, "i"));

    let movies = await Movie.find({
      ...typeFilter,
      ...ageFilter,
      $or: [
        { "keywords.name": { $in: regexKeywords } },
        { "genres.name": { $in: regexKeywords } },
        { genres: { $in: regexKeywords } },
      ],
    }).lean();

    // 4️⃣ FALLBACK — se nada encontrado, relaxa o filtro
    if (!movies || movies.length === 0) {
      movies = await Movie.find({
        ...typeFilter,
        ...ageFilter,
      }).lean();
    }

    // 5️⃣ REMOVE REPETIDOS DE QUIZZES ANTERIORES
    const prevIds = new Set(user.quizResults.flatMap(q => q.recommendations || []));
    movies = movies.filter(m => !prevIds.has(String(m._id)));

    // 6️⃣ SCORE (pontuação)
    const weightedMovies = movies.map(movie => {
      let score = 0;

      // (A) similaridade por keyword
      const mkCount = Array.isArray(movie.keywords)
        ? movie.keywords.filter(k =>
            quizKeywords.includes(String(k.name || "").toLowerCase())
          ).length
        : 0;
      score += mkCount * 8;

      // (B) nota TMDB
      score += (movie.tmdbData?.vote_average || 0) * 2;

      // (C) aleatoriedade leve
      score += Math.random() * 3;

      // (D) bônus se idade for compatível
      if (effectiveAge > 0 && movie.minAge && movie.maxAge) {
        if (effectiveAge >= movie.minAge && effectiveAge <= movie.maxAge) {
          score += 10;
        }
      }

      return { ...movie, score };
    });

    // Ordena e retorna os melhores
    weightedMovies.sort((a, b) => b.score - a.score);

    console.log(
      "🏆 Top 5:",
      weightedMovies.slice(0, 5).map(m => `${m.title} (score ${m.score.toFixed(1)})`)
    );

    res.json({
      recommendations: weightedMovies.slice(0, 5),
      usedKeywords: quizKeywords,
      totalFound: weightedMovies.length,
    });
  } catch (err) {
    console.error("❌ Erro (graph):", err);
    res.status(500).json({ error: "Erro ao gerar recomendações", details: err.message });
  }
});

// ✅ Salvar quiz e retornar filmes recomendados corretamente
app.post("/api/users/:id/quiz", async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const { id } = req.params;

    const user = await Users.findById(id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    // 🔹 1. Buscar recomendações do grafo
    const recResponse = await fetch(`https://cinelearn.onrender.com/api/recommendations/graph/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    const recData = await recResponse.json();

    // 🔹 2. Extrair IDs de string
    const recommendedIds = (recData.recommendations || [])
      .filter(r => r && r._id)
      .map(r => r._id);

    console.log("🎬 IDs de filmes recomendados:", recommendedIds);

    // 🔹 3. Criar novo quiz com recomendações (strings)
    const newQuiz = {
      quizId: quizId || "educacional",
      answers: answers || [],
      recommendations: recommendedIds,
      createdAt: new Date(),
    };

    // 🔹 4. Adicionar o quiz ao usuário
    user.quizResults.push(newQuiz);
    await user.save();

    // 🔹 5. Buscar os filmes correspondentes
    const fullMovies = await Movie.find({ _id: { $in: recommendedIds } })
      .select("title tmdbData")
      .lean();

    console.log("📽️ Filmes encontrados:", fullMovies.length);

    // 🔹 6. Atualizar a entrada do quiz com os filmes populados
    const populatedQuiz = {
      ...newQuiz,
      recommendations: fullMovies,
    };

    // 🔹 7. Retornar o quiz populado
    res.json({
      message: "Quiz salvo com sucesso!",
      quiz: populatedQuiz,
    });

  } catch (err) {
    console.error("❌ Erro ao salvar quiz:", err);
    res.status(500).json({ error: "Erro ao salvar quiz", details: err.message });
  }
});

// 🔹 Rota para listar todos os gêneros existentes no banco
app.get("/api/movies/genres", async (req, res) => {
  try {
    const genres = await Movie.distinct("genres"); // busca todos os gêneros únicos
    res.json({ genres: genres.sort() }); // retorna ordenado
  } catch (err) {
    console.error("❌ Erro ao buscar gêneros:", err);
    res.status(500).json({ error: "Erro ao buscar gêneros" });
  }
});

app.use("/api/movies", movieRoutes);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ API conectada ao MongoDB"))
.catch(err => console.error("Erro ao conectar:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));

