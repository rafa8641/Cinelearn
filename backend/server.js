import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fetch from "node-fetch";
import Movie from "./models/Movie.js";
import Users from "./models/Users.js";
import Recommendation from "./models/Recommendation.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import cors from "cors";
import path from "path";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", recommendationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/movies", movieRoutes);
app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/api/upload", uploadRoutes);

app.get("/ping", (req, res) => {
  res.json({ message: "API está funcionando 🚀" });
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

app.get("/recommendations/:userId", async (req, res) => {
  const rec = await Recommendation.findOne({ userId: req.params.userId });
  res.json(rec || { recommendations: [] });
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

// Recomendação baseada no quiz com peso do score
app.get("/users/:id/recommendations", async (req, res) => {
  try {
    const user = await Users.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const lastQuiz = user.quizResults[user.quizResults.length - 1];
    if (!lastQuiz || !lastQuiz.answers || lastQuiz.answers.length === 0) {
      return res.status(400).json({ error: "Nenhum quiz disponível para recomendações" });
    }

    const userAge = user.preferences?.minAge || 0;

    const score = lastQuiz.score || 1;

    // Peso simples: repete as respostas de acordo com o score
    const weightedKeywords = [];
    lastQuiz.answers.forEach(ans => {
      for (let i = 0; i < score; i++) {
        weightedKeywords.push(ans.toLowerCase());
      }
    });

    // Busca filmes que contenham ao menos uma keyword
    const movies = await Movie.find({
      $and: [
        { "keywords.name": { $in: weightedKeywords } },
        { $or: [{ minAge: null }, { minAge: { $lte: userAge } }] },
        { $or: [{ maxAge: null }, { maxAge: { $gte: userAge } }] }
      ]
    }).limit(5);

    res.json({ recommendations: movies, usedKeywords: weightedKeywords });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar recomendações", details: err.message });
  }
});

// Recomendação com grafos
app.post("/api/recommendations/graph/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { answers } = req.body;
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const age = Number(user.age ?? user.preferences?.minAge ?? 0);

    const lastQuiz = user.quizResults?.[user.quizResults.length - 1];
    if (!lastQuiz || !Array.isArray(lastQuiz.answers) || lastQuiz.answers.length === 0) {
      return res.status(400).json({ error: "Nenhum quiz encontrado para esse usuário" });
    }

    const quizKeywords = lastQuiz.answers.map(s => s.trim().toLowerCase());
    console.log("🔎 Keywords do quiz:", quizKeywords);

    // 🔥 inclui favoritos do usuário como reforço
    let favoriteMovies = [];
    if (user.favorites?.length) {
      favoriteMovies = await Movie.find({ _id: { $in: user.favorites } });
    }

    // Busca inicial por keywords
    let movies = await Movie.find({
      "keywords.name": { $in: quizKeywords }
    }).limit(100);

    if (!movies || movies.length === 0) {
      const genreRegexList = quizKeywords.map(k => new RegExp(k, "i"));
      movies = await Movie.find({ genres: { $in: genreRegexList } }).limit(100);
    }

    if (!movies || movies.length === 0) {
      movies = await Movie.find().limit(30);
    }

    // Aplica pesos
    const weightedMovies = movies.map(doc => {
      const movie = doc.toObject();
      let score = 0;

      // (A) Keywords
      const mkCount = movie.keywords
        ? movie.keywords.filter(k =>
            quizKeywords.includes(String(k.name).toLowerCase())
          ).length
        : 0;
      score += mkCount * 5;

      // (B) Rating
      const voteAvg = movie?.tmdbData?.vote_average || 0;
      score += (voteAvg / 10) * 30;

      // (C) Favoritos → leve influência
      if (favoriteMovies.find(fav => fav._id.toString() === movie._id.toString())) {
        score += 10;
      }

      // (D) Idade → se faixa etária bater, bônus
      if (movie.minAge != null && movie.maxAge != null) {
        if (age >= movie.minAge && age <= movie.maxAge) {
          score += 20;
        }
      }

      return { ...movie, score };
    });

    weightedMovies.sort((a, b) => b.score - a.score);
    
      console.log(
      "🏆 Top 5:",
      weightedMovies.slice(0, 5).map(m => `${m.title} (score ${m.score.toFixed(1)})`)
    );

    res.json({
      recommendations: weightedMovies.slice(0, 5),
      usedKeywords: quizKeywords,
      totalFound: weightedMovies.length
    });
  } catch (err) {
    console.error("❌ Erro (graph):", err);
    res.status(500).json({ error: "Erro ao gerar recomendações", details: err.message });
  }
});

// ✅ Salvar quiz e retornar filmes recomendados corretamente
app.post("/users/:id/quiz", async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const { id } = req.params;

    const user = await Users.findById(id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    // 🔹 1. Buscar recomendações do grafo
    const recResponse = await fetch(`http://localhost:5000/api/recommendations/graph/${id}`, {
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

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ API conectada ao MongoDB"))
.catch(err => console.error("Erro ao conectar:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));

