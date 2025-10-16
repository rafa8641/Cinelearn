import mongoose from "mongoose";

const QuizSchema = new mongoose.Schema({
  title: String,
  description: String,
  questions: [
    {
      question: String,
      options: [
        { text: String, value: String }
      ]
    }
  ]
});

export default mongoose.model("Quiz", QuizSchema);
