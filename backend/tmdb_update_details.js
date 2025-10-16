require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const Movie = require('./models/Movie');

async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Conectado ao MongoDB");
}

async function fetchMovieDetails(tmdbId) {
  const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${process.env.TMDB_API_KEY}&language=pt-BR`;
  const res = await axios.get(url);
  return res.data;
}

async function fetchKeywords(tmdbId) {
  const url = `https://api.themoviedb.org/3/movie/${tmdbId}/keywords?api_key=${process.env.TMDB_API_KEY}`;
  const res = await axios.get(url);
  return res.data.keywords.map(k => ({
    id: k.id,
    name: k.name
  }));
}

async function fetchRating(tmdbId) {
  const url = `https://api.themoviedb.org/3/movie/${tmdbId}/release_dates?api_key=${process.env.TMDB_API_KEY}`;
  const res = await axios.get(url);
  
  const brData = res.data.results.find(r => r.iso_3166_1 === 'BR');
  if (brData && brData.release_dates.length > 0) {
    return brData.release_dates[0].certification || null;
  }
  return null;
}

async function updateMovies() {
  const movies = await Movie.find({ genres: { $size: 0 } }).limit(10);
  console.log(`🔍 Atualizando detalhes para ${movies.length} filmes`);

  for (const movie of movies) {
    const tmdbId = movie.tmdbData.id;

    try {
      const details = await fetchMovieDetails(tmdbId);
      const keywords = await fetchKeywords(tmdbId);
      const rating = await fetchRating(tmdbId);

      movie.genres = details.genres.map(g => g.name);
      movie.keywords = keywords;
      movie.rating = rating;

      await movie.save();
      console.log(`✅ Atualizado: ${movie.title}`);
    } catch (err) {
      console.error(`❌ Erro ao atualizar ${movie.title}`, err.message);
    }
  }
}

async function main() {
  await connectDB();
  await updateMovies();
  mongoose.connection.close();
}

main();
