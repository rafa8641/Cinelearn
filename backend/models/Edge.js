import mongoose from "mongoose";

const edgeSchema = new mongoose.Schema({
  from: { type: String, required: true }, // id origem
  to: { type: String, required: true },   // id destino
  relation: { type: String, required: true } // exemplo: "likes", "hasTag"
});

export default mongoose.model("Edge", edgeSchema);
