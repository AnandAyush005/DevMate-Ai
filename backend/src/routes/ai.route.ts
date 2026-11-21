import { Router } from "express";
import { generateAI } from "../controller/ai.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { verifyRequestOrigin } from "../middlewares/origin.middleware.js";

const aiRouter = Router();

aiRouter.post("/generate", verifyRequestOrigin, authenticate, generateAI);

export default aiRouter;
