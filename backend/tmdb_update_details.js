import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import Movie from "./models/Movie.js";

dotenv.config();

async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Conectado ao MongoDB");
}

async function fetchDetails(mediaType, id) {
  const url = `https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${process.env.TMDB_API_KEY}&language=pt-BR`;
  const res = await axios.get(url);
  return res.data;
}

async function updateMovies() {
  const movies = await Movie.find({
    $or: [
      { genres: { $exists: false } },
      { genres: { $size: 0 } },
      { "genres.name": { $regex: "^[0-9]+$" } } // gêneros ainda são IDs numéricos
    ]
  });
  console.log(`🎬 Atualizando ${movies.length} títulos (filmes e séries)...`);

  for (const m of movies) {
    try {
      const type = m.tmdbData?.media_type || "movie";
      const details = await fetchDetails(type, m.tmdbData.id);

      m.genres = details.genres || [];
      m.tmdbData = { ...m.tmdbData, ...details };

      await m.save();
      console.log(`✅ Atualizado: ${m.title} (${type})`);
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
