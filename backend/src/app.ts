import express from "express";

const app = express();

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: true, message: "API is healthy" });
});

export default app;