// routes/movieRoutes.js
import express from "express";
import { getMovies, getMovieById } from "../controllers/movieController.js";

const router = express.Router();

// 🔹 Filtrar filmes por gênero, tipo e ano
router.get("/filter", async (req, res) => {
  try {
    const { genre, type, year } = req.query;
    const query = {};

    if (genre) query.genres = { $regex: genre, $options: "i" };
    if (type) query["tmdbData.media_type"] = { $regex: type, $options: "i" };
    if (year) query["tmdbData.release_date"] = { $regex: year, $options: "i" };

    const movies = await Movie.find(query).limit(100).lean();
    res.json({ movies });
  } catch (err) {
    console.error("❌ Erro ao buscar filmes:", err);
    res.status(500).json({ error: "Erro ao buscar filmes" });
  }
});

router.get("/:id", getMovieById);  // GET /api/movies/:id

export default router;
