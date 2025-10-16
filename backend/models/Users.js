import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, 
  role: { type: String, 
          enum: ["aluno", "professor", "pai"], 
          default: 'aluno'
  },
  age: Number,
  quizResults: [
    {
      quizId: String,
      date: { type: Date, default: Date.now },
      answers: [String]
    }
  ],
  favorites: [
    {
      type: String,
      ref: "Movie"
    }
  ]
});

export default mongoose.model("User", UserSchema);
