import dotenv from "dotenv";
import mongoose from "mongoose";
import Movie from "./models/Movie.js";

dotenv.config();

async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Conectado ao MongoDB");
}

async function cleanupMovies() {
  await connectDB();

  // 1️⃣ Apagar filmes sem descrição (overview vazio, nulo ou ausente)
  const semDescricao = await Movie.deleteMany({
    $or: [
      { "tmdbData.overview": { $exists: false } },
      { "tmdbData.overview": null },
      { "tmdbData.overview": "" }
    ]
  });
  console.log(`🗑️ Removidos ${semDescricao.deletedCount} filmes sem descrição.`);

  // 2️⃣ Encontrar títulos duplicados
  const duplicados = await Movie.aggregate([
    { $group: { _id: "$title", ids: { $push: "$_id" }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);

  console.log(`🔍 Encontrados ${duplicados.length} títulos duplicados.`);

  // 3️⃣ Remover duplicados, mantendo apenas o primeiro
  let removidos = 0;
  for (const grupo of duplicados) {
    const idsParaRemover = grupo.ids.slice(1);
    if (idsParaRemover.length > 0) {
      const resultado = await Movie.deleteMany({ _id: { $in: idsParaRemover } });
      removidos += resultado.deletedCount;
    }
  }

  console.log(`✅ Removidos ${removidos} filmes duplicados.`);
  console.log("🏁 Limpeza concluída com sucesso!");

  await mongoose.connection.close();
}

cleanupMovies().catch((err) => {
  console.error("❌ Erro ao executar limpeza:", err);
  mongoose.connection.close();
});
