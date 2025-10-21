import dotenv from "dotenv";
import axios from "axios";
import mongoose from "mongoose";
import Movie from "./models/Movie.js";

dotenv.config();

async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Conectado ao MongoDB");
}

function isSuspicious(text = "") {
  return /(porn|sex|erotic|adult|nsfw|fetish|hentai)/i.test(text);
}

async function fetchItems(type, page) {
  const url = `https://api.themoviedb.org/3/${type}/popular?api_key=${process.env.TMDB_API_KEY}&language=pt-BR&page=${page}`;
  const { data } = await axios.get(url);
  return (data.results || []).map((m) => ({ ...m, media_type: type }));
}

async function fetchKeywords(type, id) {
  const endpoint = type === "tv" ? "tv" : "movie";
  const url = `https://api.themoviedb.org/3/${endpoint}/${id}/keywords?api_key=${process.env.TMDB_API_KEY}`;
  try {
    const { data } = await axios.get(url);
    const list = type === "tv" ? data.results : data.keywords;
    return (list || []).map((k) => ({ id: k.id, name: k.name }));
  } catch {
    return [];
  }
}

function normalize(item, keywords) {
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  return {
    _id: `tmdb_${item.id}`,
    title,
    releaseYear: year ? parseInt(year) : null,
    genres: item.genres || [],
    keywords,
    rating: item.adult ? "18" : "L",
    language: item.original_language,
    minAge: null,
    maxAge: null,
    tmdbData: item,
  };
}

async function importAll() {
  await connectDB();

  const TYPES = ["movie", "tv"];
  const TOTAL_PAGES = 600; // ≈ 12.000 títulos levando em consideração que alguns serão excluidos

  for (const type of TYPES) {
    console.log(`\n🎬 Importando ${type === "tv" ? "séries" : "filmes"}...`);

    for (let page = 1; page <= TOTAL_PAGES; page++) {
      try {
        const items = await fetchItems(type, page);

        for (const item of items) {
          if (isSuspicious(item.title || item.name)) continue;

          const keywords = await fetchKeywords(type, item.id);
          const doc = normalize(item, keywords);
          await Movie.updateOne({ _id: doc._id }, { $set: doc }, { upsert: true });

          console.log(`✅ ${type === "tv" ? "[SÉRIE]" : "[FILME]"} ${doc.title}`);
          await new Promise((r) => setTimeout(r, 150)); // pequeno delay
        }
      } catch (err) {
        console.error(`⚠️ Erro na página ${page} (${type}):`, err.message);
        await new Promise((r) => setTimeout(r, 1000)); // pequena pausa para recuperar
      }
    }
  }

  await mongoose.connection.close();
  console.log("🏁 Importação concluída!");
}

importAll();
