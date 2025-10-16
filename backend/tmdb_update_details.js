import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import Movie from "./models/Movie.js"; // ✅ Import ES correto

dotenv.config();

async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Conectado ao MongoDB");
}

async function fetchMovieDetails(movieId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}&language=pt-BR`;
  const res = await axios.get(url);
  return res.data;
}

async function updateMovies() {
  // ✅ Busca filmes com array de gêneros vazio
const movies = await Movie.find({ genres: { $size: 0 } });

  console.log(`🎬 Atualizando ${movies.length} filmes...`);

  for (const m of movies) {
    try {
      const details = await fetchMovieDetails(m.tmdbData.id);
      m.genres = details.genres || [];
      m.tmdbData = { ...m.tmdbData, ...details };
      await m.save();
      console.log(`✅ Atualizado: ${m.title}`);
    } catch (err) {
      console.error(`⚠️ Erro ao atualizar ${m.title}:`, err.message);
    }
  }
}

async function main() {
  await connectDB();
  await updateMovies();
  await mongoose.connection.close();
  console.log("🏁 Atualização concluída!");
}

main();
