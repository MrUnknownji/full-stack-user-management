import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import usersRouter from "./routers/usersRouter.js";

const app = express();
app.use(cors());
app.use(express.json()); // Ensure this is *before* your routes
dotenv.config();

const port = process.env.PORT || 5000;
const dbUri = process.env.MONGODB_URI;

if (!dbUri) {
  console.error("Database uri not found. Set MONGODB_URI in .env.");
  process.exit(1);
}

mongoose
  .connect(dbUri)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send("User Management API is running!");
});
app.use("/users", usersRouter);

// Optional global error handler (good practice)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
