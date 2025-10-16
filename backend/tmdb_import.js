import dotenv from "dotenv";
import axios from "axios";
import mongoose from "mongoose";
import Movie from "./models/Movie.js";

dotenv.config();

// dicionário básico de tradução
const keywordDictionary = {
  "revenge": "vingança",
  "friendship": "amizade",
  "thriller": "suspense",
  "school": "escola",
  "educational": "educação",
  "family": "família",
  "children": "crianças",
  "science": "ciência",
  "adventure": "aventura",
  "fantasy": "fantasia",
  "magic": "magia",
  "flying": "voar",
  "warrior": "guerreiro",
  "zombie": "zumbi",
  "alien": "alienígena",
  "battle": "batalha",
  "mystery": "mistério",
  "detective": "detetive",
  "hero": "herói",
  "villain": "vilão",
  "love": "amor",
  "betrayal": "traição",
  "courage": "coragem",
  "family bond": "laços familiares",
  "mythology": "mitologia",
  "history": "história",
  "space": "espaço",
  "robot": "robô",
  "future": "futuro",
  "past": "passado",
  "music": "música",
  "dance": "dança",
  "forest": "floresta",
  "ocean": "oceano",
  "island": "ilha",
  "journey": "jornada",
  "quest": "missão",
  "heroism": "heroísmo",
  "survival": "sobrevivência",
  "technology": "tecnologia",
  "invention": "invenção",
  "horror": "terror",
  "ghost": "fantasma",
  "dragon": "dragão",
  "vampire": "vampiro",
  "witch": "bruxa",
  "wizard": "feiticeiro",
  "magic school": "escola de magia",
  "teamwork": "trabalho em equipe",
  "sports": "esportes",
  "competition": "competição",
  "animal": "animal",
  "pet": "animal de estimação",
  "nature": "natureza",
  "planet": "planeta",
  "galaxy": "galáxia",
  "superhero": "super-herói",
  "villainous": "malvado",
  "quest for truth": "busca pela verdade",
  "family drama": "drama familiar",
  "detective work": "trabalho de detetive",
  "time": "tempo",
  "journey through space": "viagem pelo espaço",
  "school life": "vida escolar",
  "imagination": "imaginação",
  "mystery solving": "resolução de mistérios",
  "friendship adventure": "aventura com amigos",
  "sequel": "continuação",
  "based on novel or book": "baseado em romance ou livro",
  "duringcreditsstinger": "cena durante os créditos",
  "aftercreditsstinger": "cena pós-créditos",
  "amused": "divertido",
  "based on comic": "baseado em quadrinhos",
  "demon": "demônio",
  "hilarious": "hilário",
  "woman director": "diretora",
  "new york city": "cidade de nova york",
  "marvel cinematic universe": "universo cinematográfico marvel",
  "cliché": "clichê"
};

function translateKeyword(word) {
  return keywordDictionary[word.toLowerCase()] || word; // mantém original se não tiver no dicionário
}

async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Conectado ao MongoDB");
}

async function fetchMovies(page = 1) {
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}&language=pt-BR&page=${page}`;
  const res = await axios.get(url);
  return res.data.results;
}

async function fetchKeywords(movieId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}/keywords?api_key=${process.env.TMDB_API_KEY}`;
  const res = await axios.get(url);

  return res.data.keywords.map(k => {
    let translated = translateKeyword(k.name); // dicionário
    return {
      id: k.id,
      name: translated
    };
  });
}

async function saveMovies(movies) {
  for (const m of movies) {
    const keywords = await fetchKeywords(m.id);

    const movieDoc = {
      _id: `tmdb_${m.id}`,
      title: m.title,
      originalTitle: m.original_title,
      releaseYear: m.release_date ? parseInt(m.release_date.split("-")[0]) : null,
      genres: [], // podemos preencher depois
      educationalTags: [], // pode ser alimentado a partir das keywords no futuro
      keywords,
      rating: null,
      language: m.original_language,
      minAge: null,
      maxAge: null,
      tmdbData: m
    };

    await Movie.updateOne(
      { _id: movieDoc._id },
      { $set: movieDoc },
      { upsert: true }
    );
    console.log(`📌 Salvo: ${movieDoc.title} (${keywords.length} keywords)`);
  }
}

async function main() {
  await connectDB();

  const totalPages = 10;
  
  for (let page = 1; page <= totalPages; page++) {
    console.log(`\n🚀 Buscando página ${page} de ${totalPages}...`);
    const movies = await fetchMovies(page);
    await saveMovies(movies);
  }

  mongoose.connection.close();
}

main();
