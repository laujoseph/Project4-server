import express from "express";
import authRoutes from "./routes/auth";
import subsRoutes from "./routes/subs";
import articlesRoutes from "./routes/articles";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
const PORT = process.env.PORT || 8080;
dotenv.config();
// connecting database
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("Connected to mongoDB");

    const app = express();
    app.use(express.json());
    app.use(cors());
    app.use("/auth", authRoutes);
    app.use("/subs", subsRoutes);
    app.use("/articles", articlesRoutes);
    app.listen(PORT, () => {
      console.log(`Now listening to port 8080`);
    });
  })
  .catch((error) => {
    console.log(error);
    throw new Error(error);
  });
