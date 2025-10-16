import mongoose from "mongoose";

const nodeSchema = new mongoose.Schema({
  _id: String, 
  type: { type: String, enum: ["user", "movie", "tag"], required: true },
  title: String, 
  ageRestriction: Number 
});

export default mongoose.model("Node", nodeSchema);
