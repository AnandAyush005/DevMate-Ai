import { Router } from "express";
import {
  getMe,
  getPasswordReset,
  login,
  logout,
  register,
  requestPasswordReset,
  resetPassword,
} from "../controller/auth.controller.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";
import { authorizePasswordReset } from "../middlewares/password-reset.middleware.ts";
import { verifyRequestOrigin } from "../middlewares/origin.middleware.ts";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", verifyRequestOrigin, login);
authRouter.get("/me", authenticate, getMe);
authRouter.post("/logout", authenticate, logout);
authRouter.post("/forgot-password", verifyRequestOrigin, requestPasswordReset);
authRouter.get("/reset-password/:token", authorizePasswordReset, getPasswordReset);
authRouter.post(
  "/reset-password/:token",
  verifyRequestOrigin,
  authorizePasswordReset,
  resetPassword,
);

export default authRouter;
