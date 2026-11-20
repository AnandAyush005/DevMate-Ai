import express from "express";
import cors from "cors";
import { errorMiddleware, notFoundMiddleware } from "./middlewares/error.middleware.ts";
import authRouter from "./routes/auth.route.ts";
import healthRouter from "./routes/health.route.ts";
import projectRouter from "./routes/project.route.ts";

const FRONTEND_ORIGIN = "https://dev-mate-ai-frontend.vercel.app";

const app = express();

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
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
