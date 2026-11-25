import express from "express";
import cors from "cors";
import { errorMiddleware, notFoundMiddleware } from "./middlewares/error.middleware.js";
import aiRouter from "./routes/ai.route.js";
import authRouter from "./routes/auth.route.js";
import compilerRouter from "./routes/compiler.route.js";
import healthRouter from "./routes/health.route.js";
import projectRouter from "./routes/project.route.js";

const app = express();

app.use(
  cors({
    origin:[ process.env.FRONTEND_URL as string, 'http://localhost:3000'],
    credentials: true,
  }),
);

app.use("/api/v1/compiler", express.json({ limit: "512kb" }), compilerRouter);

app.use(express.json({ limit: "32kb" }));

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/ai", aiRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
