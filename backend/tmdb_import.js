import dotenv from "dotenv";
import axios from "axios";
import mongoose from "mongoose";
import Movie from "./models/Movie.js";

dotenv.config();

// ============================================================
// 🧠 1. Dicionário básico de tradução (mantido igual ao seu)
// ============================================================
const keywordDictionary = {
  revenge: "vingança",
  friendship: "amizade",
  thriller: "suspense",
  school: "escola",
  educational: "educação",
  family: "família",
  children: "crianças",
  science: "ciência",
  adventure: "aventura",
  fantasy: "fantasia",
  magic: "magia",
  flying: "voar",
  warrior: "guerreiro",
  zombie: "zumbi",
  alien: "alienígena",
  battle: "batalha",
  mystery: "mistério",
  detective: "detetive",
  hero: "herói",
  villain: "vilão",
  love: "amor",
  betrayal: "traição",
  courage: "coragem",
  "family bond": "laços familiares",
  mythology: "mitologia",
  history: "história",
  space: "espaço",
  robot: "robô",
  future: "futuro",
  past: "passado",
  music: "música",
  dance: "dança",
  forest: "floresta",
  ocean: "oceano",
  island: "ilha",
  journey: "jornada",
  quest: "missão",
  heroism: "heroísmo",
  survival: "sobrevivência",
  technology: "tecnologia",
  invention: "invenção",
  horror: "terror",
  ghost: "fantasma",
  dragon: "dragão",
  vampire: "vampiro",
  witch: "bruxa",
  wizard: "feiticeiro",
  "magic school": "escola de magia",
  teamwork: "trabalho em equipe",
  sports: "esportes",
  competition: "competição",
  animal: "animal",
  pet: "animal de estimação",
  nature: "natureza",
  planet: "planeta",
  galaxy: "galáxia",
  superhero: "super-herói",
  villainous: "malvado",
  "quest for truth": "busca pela verdade",
  "family drama": "drama familiar",
  "detective work": "trabalho de detetive",
  time: "tempo",
  "journey through space": "viagem pelo espaço",
  "school life": "vida escolar",
  imagination: "imaginação",
  "mystery solving": "resolução de mistérios",
  "friendship adventure": "aventura com amigos",
  sequel: "continuação",
  "based on novel or book": "baseado em romance ou livro",
  duringcreditsstinger: "cena durante os créditos",
  aftercreditsstinger: "cena pós-créditos",
  amused: "divertido",
  "based on comic": "baseado em quadrinhos",
  demon: "demônio",
  hilarious: "hilário",
  "woman director": "diretora",
  "new york city": "cidade de nova york",
  "marvel cinematic universe": "universo cinematográfico marvel",
  cliché: "clichê",
};

function translateKeyword(word) {
  return keywordDictionary[word.toLowerCase()] || word;
}

// ============================================================
// 🛡️ 2. Funções de segurança (bloqueio de conteúdo adulto)
// ============================================================
function isSuspiciousText(text = "") {
  const regex =
    /(hentai|porn|porno|sex|sexual|erotic|adult|sensual|fetish|provocative|ecchi|nsfw|r18|softcore|hardcore|lingerie|裸|애정|부부|키스|人妻|교환|ロマンス|愛|seduction)/i;
  return regex.test(text);
}

function isSuspiciousPoster(posterPath = "") {
  const lower = (posterPath || "").toLowerCase();
  return (
    lower.includes("r18") ||
    lower.includes("adult") ||
    lower.includes("porn") ||
    lower.includes("sex") ||
    lower.includes("nsfw") ||
    lower.includes("erotic") ||
    lower.includes("lingerie") ||
    lower.includes("hentai") ||
    lower.includes("provocative") ||
    lower.includes("fetish")
  );
}

// ============================================================
// 🔗 3. Conexão com o MongoDB
// ============================================================
async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Conectado ao MongoDB");
}

// ============================================================
// 🎬 4. Funções de importação TMDB
// ============================================================
async function fetchMovies(page = 1) {
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}&language=pt-BR&page=${page}`;
  const res = await axios.get(url);
  return res.data.results;
}

async function fetchKeywords(movieId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}/keywords?api_key=${process.env.TMDB_API_KEY}`;
  const res = await axios.get(url);
  return res.data.keywords.map((k) => ({
    id: k.id,
    name: translateKeyword(k.name),
  }));
}

// ============================================================
// 🧩 5. Função principal de salvar filmes (com filtro)
// ============================================================
async function saveMovies(movies) {
  for (const m of movies) {
    try {
      // Bloqueia qualquer filme adulto ou com termos suspeitos
      if (
        m.adult ||
        isSuspiciousPoster(m.poster_path) ||
        isSuspiciousText(m.title) ||
        isSuspiciousText(m.original_title) ||
        isSuspiciousText(m.overview)
      ) {
        console.log(`🚫 Bloqueado: ${m.title}`);
        continue; // pula o filme
      }

      const keywords = await fetchKeywords(m.id);

      const movieDoc = {
        _id: `tmdb_${m.id}`,
        title: m.title,
        originalTitle: m.original_title,
        releaseYear: m.release_date
          ? parseInt(m.release_date.split("-")[0])
          : null,
        genres: [],
        educationalTags: [],
        keywords,
        rating: m.adult ? "18+" : "L+",
        language: m.original_language,
        minAge: null,
        maxAge: null,
        tmdbData: m,
      };

      await Movie.updateOne({ _id: movieDoc._id }, { $set: movieDoc }, { upsert: true });
      console.log(`✅ Salvo: ${movieDoc.title}`);
    } catch (err) {
      console.error(`⚠️ Erro ao salvar ${m.title}:`, err.message);
    }
  }
}

// ============================================================
// 🚀 6. Execução principal
// ============================================================
async function main() {
  await connectDB();

  const totalPages = 10;

  for (let page = 1; page <= totalPages; page++) {
    console.log(`\n📄 Buscando página ${page} de ${totalPages}...`);
    const movies = await fetchMovies(page);
    await saveMovies(movies);
  }

  mongoose.connection.close();
  console.log("🏁 Importação concluída!");
}

main();
