import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "./models/Movie.js";

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;

const ratingMap = {
  "L": { minAge: 0, maxAge: 99 },
  "10": { minAge: 10, maxAge: 99 },
  "12": { minAge: 12, maxAge: 99 },
  "14": { minAge: 14, maxAge: 99 },
  "16": { minAge: 16, maxAge: 99 },
  "18": { minAge: 18, maxAge: 99 }
};

async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Conectado ao MongoDB");
}

async function getCertification(tmdbId) {
  const url = `https://api.themoviedb.org/3/movie/${tmdbId}/release_dates?api_key=${TMDB_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  // Procura classificação do Brasil
  const brRelease = data.results.find(r => r.iso_3166_1 === "BR");
  if (brRelease && brRelease.release_dates.length > 0) {
    return brRelease.release_dates[0].certification;
  }

  // fallback: tenta US
  const usRelease = data.results.find(r => r.iso_3166_1 === "US");
  if (usRelease && usRelease.release_dates.length > 0) {
    return usRelease.release_dates[0].certification;
  }

  return "L"; // fallback
}

async function updateMovieAges() {
  const movies = await Movie.find();

  for (const movie of movies) {
    try {
      // Pega id numérico do TMDB (se for salvo tipo "tmdb_671")
      const tmdbId = movie.tmdbData?.id || (movie._id.startsWith("tmdb_") ? movie._id.split("_")[1] : null);
      if (!tmdbId) continue;

      const certification = await getCertification(tmdbId);
      const rating = certification || "L";

      const ageRange = ratingMap[rating] || { minAge: 0, maxAge: 99 };

      movie.rating = rating;
      movie.minAge = ageRange.minAge;
      movie.maxAge = ageRange.maxAge;

      await movie.save();
      console.log(`📌 ${movie.title} → Rating: ${rating}, minAge: ${movie.minAge}, maxAge: ${movie.maxAge}`);
    } catch (err) {
      console.error(`❌ Erro ao atualizar ${movie.title}:`, err.message);
    }
  }

  console.log("✅ Todas as faixas etárias atualizadas!");
  mongoose.connection.close();
}

async function main() {
  await connectDB();
  await updateMovieAges();
}

main();