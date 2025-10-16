import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "./models/Movie.js";

dotenv.config();

const ratingMap = {
  L: "L",
  "L+": "L",
  "L++": "L",
  Livre: "L",
  "0": "L",
  G: "L",

  "10": "10",
  "10+": "10",
  PG: "10",
  "PG-10": "10",

  "12": "12",
  "12+": "12",
  "PG-12": "12",
  "PG-13": "12",

  "14": "14",
  "14+": "14",

  "16": "16",
  "16+": "16",
  R: "16",
  "R16": "16",

  "18": "18",
  "18+": "18",
  "R18": "18",
  "R18+": "18",
  "NR+": "18",
  "XXX": "18",
  "NC-17": "18",
};

function normalizeRating(rating) {
  if (!rating) return "L";
  const cleaned = rating.toString().trim();
  return ratingMap[cleaned] || "L";
}

async function fixRatings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado ao MongoDB");

    const movies = await Movie.find();
    let updated = 0;

    for (const m of movies) {
      const original = m.rating?.trim();
      const tmdbRating = m.tmdbData?.rating || m.tmdbData?.adult ? "18" : null;
      const toFix = original || tmdbRating || "L";
      const normalized = normalizeRating(toFix);

      if (toFix !== normalized || !m.minAge) {
        m.rating = normalized;

        // Define faixa etária mínima
        const ageMap = { L: 0, "10": 10, "12": 12, "14": 14, "16": 16, "18": 18 };
        m.minAge = ageMap[normalized] ?? 0;

        await m.save();
        updated++;
        console.log(`🔧 Corrigido: ${m.title} (${toFix} → ${normalized})`);
      }
    }

    console.log(`🏁 Total de filmes corrigidos: ${updated}`);
    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Erro ao corrigir ratings:", err);
  }
}

fixRatings();
