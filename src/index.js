import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { prisma } from "./config/db.js";
import { apiRouter } from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message:
      "Triforge backend running (PostgreSQL + Prisma + Auth + Projects + Contact)",
  });
});

app.use("/api", apiRouter);

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

export { app, prisma, env };
export default app;
