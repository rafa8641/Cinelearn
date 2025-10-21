import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "./models/Movie.js";

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;

const ratingMap = {
  "L": { minAge: 0, maxAge: 99 },
  "0": { minAge: 0, maxAge: 99 },
  "10": { minAge: 10, maxAge: 99 },
  "12": { minAge: 12, maxAge: 99 },
  "14": { minAge: 14, maxAge: 99 },
  "16": { minAge: 16, maxAge: 99 },
  "18": { minAge: 18, maxAge: 99 },
};

const blockedRatings = ["R", "R+", "NR", "NC-17", "TV-MA", "TV-18", "18", "UNRATED", "AO"];

async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Conectado ao MongoDB");
}

async function getCertification(mediaType, tmdbId) {
  let url = "";
  if (mediaType === "tv") {
    url = `https://api.themoviedb.org/3/tv/${tmdbId}/content_ratings?api_key=${TMDB_API_KEY}`;
  } else {
    url = `https://api.themoviedb.org/3/movie/${tmdbId}/release_dates?api_key=${TMDB_API_KEY}`;
  }

  const res = await fetch(url);
  const data = await res.json();

  // Séries
  if (mediaType === "tv" && data.results) {
    const br = data.results.find((r) => r.iso_3166_1 === "BR");
    if (br?.rating) return br.rating;
    const us = data.results.find((r) => r.iso_3166_1 === "US");
    if (us?.rating) return us.rating;
  }

  // Filmes
  if (mediaType === "movie" && data.results) {
    const br = data.results.find((r) => r.iso_3166_1 === "BR");
    if (br?.release_dates?.length > 0)
      return br.release_dates[0].certification;
    const us = data.results.find((r) => r.iso_3166_1 === "US");
    if (us?.release_dates?.length > 0)
      return us.release_dates[0].certification;
  }

  return "L";
}

async function updateMovieAges() {
  const movies = await Movie.find();

  for (const movie of movies) {
    try {
      const type = movie.tmdbData?.media_type || "movie";
      const tmdbId = movie.tmdbData?.id || movie._id.split("_")[1];
      if (!tmdbId) continue;

      const certification = await getCertification(type, tmdbId);
      const rating = certification || "L";

      // ❌ Remove se for classificação adulta
      if (blockedRatings.includes(rating.toUpperCase())) {
        await Movie.deleteOne({ _id: movie._id });
        console.log(`🗑️ Removido: ${movie.title} (${rating})`);
        continue;
      }

      const ageRange = ratingMap[rating] || { minAge: 0, maxAge: 99 };

      movie.rating = rating;
      movie.minAge = ageRange.minAge;
      movie.maxAge = ageRange.maxAge;

      await movie.save();
      console.log(`📌 ${movie.title} (${type}) → ${rating} | ${movie.minAge}+`);
      await new Promise((r) => setTimeout(r, 150));
    } catch (err) {
      console.error(`❌ Erro em ${movie.title}:`, err.message);
    }
  }

  console.log("✅ Atualização de idades e limpeza concluída!");
  mongoose.connection.close();
}

async function main() {
  await connectDB();
  await updateMovieAges();
}

main();
