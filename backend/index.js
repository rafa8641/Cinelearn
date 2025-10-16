require('dotenv').config();
const mongoose = require('mongoose');

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Conectado ao MongoDB!");
    mongoose.connection.close();
  } catch (err) {
    console.error("Erro de conexão:", err);
  }
}

start();

