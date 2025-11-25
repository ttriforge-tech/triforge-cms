import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import { prisma } from "../src/config/db.js";
import { apiRouter } from "../src/routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Serverless backend running on Vercel",
  });
});

app.use("/api", apiRouter);

export default serverless(app);
