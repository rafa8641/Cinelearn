import mongoose from "mongoose";

const MovieSchema = new mongoose.Schema({
  _id: String,
  title: String,
  originalTitle: String,
  releaseYear: Number,
  genres: [String],
  educationalTags: [String],
  keywords: [
    {
      id: Number,
      name: String
    }
  ],
  rating: String,
  language: String,
  minAge: Number,
  maxAge: Number,
  tmdbData: mongoose.Schema.Types.Mixed
});

export default mongoose.model("Movie", MovieSchema);


