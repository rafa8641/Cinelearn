require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./models/Movie');
const MovieGraph = require('./models/MovieGraph');

async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Conectado ao MongoDB");
}

function jaccardSimilarity(setA, setB) {
  const intersection = setA.filter(x => setB.includes(x));
  const union = new Set([...setA, ...setB]);
  return intersection.length / union.size;
}

async function buildGraph() {
  const movies = await Movie.find({});
  console.log(`🎬 Processando ${movies.length} filmes para criar o grafo`);

  for (let i = 0; i < movies.length; i++) {
    for (let j = i + 1; j < movies.length; j++) {
      const movieA = movies[i];
      const movieB = movies[j];

      // Similaridade por gêneros
      const genresA = movieA.genres || [];
      const genresB = movieB.genres || [];
      const genreSim = jaccardSimilarity(genresA, genresB);

      // Similaridade por keywords
      const keywordsA = (movieA.keywords || []).map(k => k.name);
      const keywordsB = (movieB.keywords || []).map(k => k.name);
      const keywordSim = jaccardSimilarity(keywordsA, keywordsB);

      // Calcula peso total
      const weight = (genreSim * 0.6) + (keywordSim * 0.4);

      // Só cria conexão se peso for maior que 0.2
      if (weight > 0.2) {
        // Criar relação para movieA -> movieB
        await MovieGraph.updateOne(
          { sourceMovieId: movieA._id, targetMovieId: movieB._id },
          { sourceMovieId: movieA._id, targetMovieId: movieB._id, relationType: 'similar', weight },
          { upsert: true }
        );

        // E a inversa movieB -> movieA
        await MovieGraph.updateOne(
          { sourceMovieId: movieB._id, targetMovieId: movieA._id },
          { sourceMovieId: movieB._id, targetMovieId: movieA._id, relationType: 'similar', weight },
          { upsert: true }
        );
      }
    }
  }
  console.log("✅ Grafo criado com sucesso!");
}

async function main() {
  await connectDB();
  await buildGraph();
  mongoose.connection.close();
}

main();
