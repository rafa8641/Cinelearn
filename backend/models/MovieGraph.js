import mongoose from "mongoose";

const MovieGraphSchema = new mongoose.Schema({
  sourceMovieId: { type: String, ref: 'Movie' }, // filme de origem
  targetMovieId: { type: String, ref: 'Movie' }, // filme relacionado
  relationType: {
    type: String,
    enum: ['same_theme', 'same_genre', 'similar_age', 'educational_match']
  },
  weight: { type: Number, default: 1 }
});

export default mongoose.model("MovieGraph", MovieGraphSchema);