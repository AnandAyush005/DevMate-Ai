import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin : "http://localhost:3000"
}));

app.use(express.json());

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: true, message: "API is healthy" });
});

export default app;