import mongoose from "mongoose";

const ThemeSchema = new mongoose.Schema({
  name: String,
  description: String,
  exampleMovies: [{ type: String, ref: 'Movie' }]
});

export default mongoose.model("Theme", ThemeSchema);
