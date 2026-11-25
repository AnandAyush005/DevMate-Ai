import { Router } from "express";
import { runCode } from "../controller/compiler.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const compilerRouter = Router();

compilerRouter.post("/run", authenticate, runCode);

export default compilerRouter;
