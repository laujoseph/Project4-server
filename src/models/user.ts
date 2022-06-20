import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema({
  email: {
    type: String,
    trim: true, //removes spaces
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 5,
  },
  stripeCustomerId: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
  },
});

export default mongoose.model("User", userSchema);
