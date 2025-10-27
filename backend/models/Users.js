import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, 
  role: { type: String, 
          enum: ["aluno", "professor"], 
          default: 'aluno'
  },
  age: Number,
  quizResults: [
    {
      quizId: String,
      answers: [String],
      recommendations: [{ type: String, ref: "Movie" }],
      createdAt: { type: Date, default: Date.now }, // ✅ salva automaticamente a data
    }
  ],
  favorites: [
    {
      type: String,
      ref: "Movie"
    }
  ]
});

export default mongoose.model("Users", UserSchema);
