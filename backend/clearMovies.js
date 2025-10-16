import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "./models/Movie.js";

dotenv.config();

async function clearMovies() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado ao MongoDB");

    const result = await Movie.deleteMany({});
    console.log(`🗑️ Removidos ${result.deletedCount} filmes da coleção.`);

    await mongoose.connection.close();
    console.log("🚪 Conexão encerrada.");
  } catch (error) {
    console.error("❌ Erro ao excluir filmes:", error);
  }
}

clearMovies();
