import { Router } from "express";
import {
  getMe,
  getPasswordReset,
  login,
  logout,
  register,
  requestPasswordReset,
  resetPassword,
} from "../controller/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizePasswordReset } from "../middlewares/password-reset.middleware.js";
import { verifyRequestOrigin } from "../middlewares/origin.middleware.js";

const authRouter = Router();

authRouter.post("/register", verifyRequestOrigin, register);
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
