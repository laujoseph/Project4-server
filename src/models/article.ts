import mongoose from "mongoose";
import { Schema } from "mongoose";

const articleSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  access: {
    type: String,
    enum: ["Basic", "Standard", "Premium"],
    required: true,
  },
  category: {
    type: String,
    enum: ["Food", "Music", "Sports"],
    required: true,
  },
  bannerUrl: {
    type: String,
  },
  instructor: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Article", articleSchema);
