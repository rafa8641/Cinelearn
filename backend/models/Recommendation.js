import mongoose from "mongoose";

const RecommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  generatedAt: { type: Date, default: Date.now },
  criteria: {
    themes: [String],
    ageRange: [Number]
  },
  recommendedMovies: [{ type: String, ref: 'Movie' }]
});

export default mongoose.model("Recommendation", RecommendationSchema);

