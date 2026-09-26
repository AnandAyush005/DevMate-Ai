import { Router } from "express";
import { getMe, login, register } from "../controller/auth.controller.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";
import { verifyRequestOrigin } from "../middlewares/origin.middleware.ts";

const authRouter = Router();

authRouter.post("/register", verifyRequestOrigin, register);
authRouter.post("/login", verifyRequestOrigin, login);
authRouter.get("/me", authenticate, getMe);

export default authRouter;
