import mongoose from "mongoose";

const keywordSchema = new mongoose.Schema({
  id: Number,
  name: String,
});

const movieSchema = new mongoose.Schema({
  _id: String,
  title: String,
  originalTitle: String,
  releaseYear: Number,
  genres: [Object],
  educationalTags: [String],
  keywords: [keywordSchema],
  rating: String,
  language: String,
  minAge: Number,
  maxAge: Number,
  tmdbData: Object,
});

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;

