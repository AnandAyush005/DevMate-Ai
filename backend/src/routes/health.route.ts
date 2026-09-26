import { Router } from "express";
import { healthCheck } from "../controller/health.controller.ts";

const healthRouter = Router();

healthRouter.get("/", healthCheck);

export default healthRouter;
