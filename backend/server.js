import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fetch from "node-fetch";
import cors from "cors";
import Movie from "./models/Movie.js";
import Users from "./models/Users.js";
import userRoutes from "./routes/userRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

// ======================
// 🌐 Configuração CORS
// ======================
const allowedOrigins = [
  "http://localhost:5173",
  "https://cinelearn-three.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
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
app.options(/.*/, cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// ✅ Rotas principais externas (userRoutes / movieRoutes)
// ======================
app.use("/api/users", userRoutes);
app.use("/api/movies", movieRoutes);

// ======================
// 🔔 Teste rápido
// ======================
app.get("/ping", (req, res) => {
  res.json({ message: "API está funcionando 🚀" });
});

// ======================
// 🎞️ FILTRO DE FILMES
// ======================
app.get("/api/movies/filter", async (req, res) => {
  try {
    const { genre, q, type, year, maxAge, minAge, cursor, limit: limitStr } = req.query;
    const query = {};

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { "keywords.name": { $regex: q, $options: "i" } },
        { "genres.name": { $regex: q, $options: "i" } },
      ];
    }
    if (genre) query["genres.name"] = { $regex: genre, $options: "i" };
    if (type) query["tmdbData.media_type"] = type;
    if (year) {
      query.$or = [
        { "tmdbData.release_date": { $regex: year, $options: "i" } },
        { "tmdbData.first_air_date": { $regex: year, $options: "i" } },
      ];
    }

    // Faixa etária
    let userAge = null;
    if (maxAge) userAge = parseInt(maxAge, 10);
    else if (minAge) userAge = parseInt(minAge, 10);

    if (userAge && !isNaN(userAge)) {
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

    const limit = Math.max(10, parseInt(limitStr || "48", 10));
    const sort = { "tmdbData.id": -1, _id: 1 };

    const finalQuery = { ...query, "tmdbData.id": { $exists: true } };
    if (cursor) {
      const c = parseInt(cursor, 10);
      if (!isNaN(c)) {
        finalQuery["tmdbData.id"].$lt = c;
      }
    }

    const movies = await Movie.find(finalQuery).sort(sort).limit(limit).lean();
    const nextCursor = movies.length ? movies[movies.length - 1]?.tmdbData?.id : null;

    res.json({
      movies,
      nextCursor,
      hasMore: movies.length === limit,
    });
  } catch (err) {
    console.error("❌ Erro ao buscar filmes:", err);
    res.status(500).json({ error: "Erro ao buscar filmes" });
  }
});

// ======================
// 🧠 SALVAR QUIZ + RECOMENDAÇÃO
// ======================
app.post("/api/users/:id/quiz", async (req, res) => {
  try {
    const { id } = req.params;
    const { quizId, answers } = req.body;

    const user = await Users.findById(id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    // 🔹 Busca recomendações internamente (sem chamar o domínio público)
    const recResponse = await fetch(`http://localhost:${PORT}/api/recommendations/graph/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });

    if (!recResponse.ok) throw new Error("Falha ao gerar recomendações");
    const recData = await recResponse.json();

    const recommendedIds = (recData.recommendations || [])
      .filter(r => r && r._id)
      .map(r => r._id);

    const newQuiz = {
      quizId: quizId || "educacional",
      answers: answers || [],
      recommendations: recommendedIds,
      createdAt: new Date(),
    };

    user.quizResults.push(newQuiz);
    await user.save();

    const fullMovies = await Movie.find({ _id: { $in: recommendedIds } })
      .select("title tmdbData")
      .lean();

    res.json({
      message: "Quiz salvo com sucesso!",
      quiz: { ...newQuiz, recommendations: fullMovies },
    });
  } catch (err) {
    console.error("❌ Erro ao salvar quiz:", err);
    res.status(500).json({ error: "Erro ao salvar quiz", details: err.message });
  }
});

// ======================
// 🧮 GRAFO DE RECOMENDAÇÕES
// ======================
app.post("/api/recommendations/graph/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { answers = [] } = req.body;
    const user = await Users.findById(userId);

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const quizKeywords = (answers || [])
      .flatMap(a => (Array.isArray(a) ? a : [a]))
      .map(s => s.toString().trim().toLowerCase())
      .filter(Boolean);

    if (quizKeywords.length === 0)
      return res.status(400).json({ error: "Nenhuma resposta recebida" });

    const role = (user.role || "").toLowerCase();
    const effectiveAge = role === "professor" ? 18 : Number(user.age) || 0;

    const regexKeywords = quizKeywords.map(k => new RegExp(k, "i"));
    let movies = await Movie.find({
      $or: [
        { "keywords.name": { $in: regexKeywords } },
        { "genres.name": { $in: regexKeywords } },
      ],
    }).lean();

    if (movies.length === 0) {
      movies = await Movie.find().lean();
    }

    const weightedMovies = movies.map(movie => {
      let score = 0;
      const mkCount = Array.isArray(movie.keywords)
        ? movie.keywords.filter(k =>
            quizKeywords.includes(String(k.name || "").toLowerCase())
          ).length
        : 0;
      score += mkCount * 8;
      score += (movie.tmdbData?.vote_average || 0) * 2;
      score += Math.random() * 3;
      return { ...movie, score };
    });

    weightedMovies.sort((a, b) => b.score - a.score);
    res.json({
      recommendations: weightedMovies.slice(0, 5),
      usedKeywords: quizKeywords,
    });
  } catch (err) {
    console.error("❌ Erro (graph):", err);
    res.status(500).json({ error: "Erro ao gerar recomendações", details: err.message });
  }
});

// ======================
// 🎭 LISTAR GÊNEROS
// ======================
app.get("/api/movies/genres", async (req, res) => {
  try {
    const genres = await Movie.distinct("genres");
    res.json({ genres: genres.sort() });
  } catch (err) {
    console.error("❌ Erro ao buscar gêneros:", err);
    res.status(500).json({ error: "Erro ao buscar gêneros" });
  }
});

// ======================
// 🧩 Conexão MongoDB + Inicialização
// ======================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ API conectada ao MongoDB"))
  .catch(err => console.error("Erro ao conectar:", err));

app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
