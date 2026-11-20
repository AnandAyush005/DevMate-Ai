import express from "express";
import cors from "cors";
import { errorMiddleware, notFoundMiddleware } from "./middlewares/error.middleware.js";
import authRouter from "./routes/auth.route.js";
import healthRouter from "./routes/health.route.js";
import projectRouter from "./routes/project.route.js";
import { env } from "./config/env.ts";


const app = express();

app.use(
  cors({
    origin: env.frontendOrigin,
    credentials: true,
  }),
);

app.use(express.json({ limit: "32kb" }));

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
