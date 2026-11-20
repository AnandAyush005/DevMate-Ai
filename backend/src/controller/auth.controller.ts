import type { Request, Response } from "express";
import { ApiError } from "../utils/api-error.js";
import { setAuthCookie } from "../config/auth-cookie.js";
import { getAuthenticatedUserId } from "../middlewares/auth.middleware.js";
import { getPasswordResetUserId } from "../middlewares/password-reset.middleware.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../schemas/auth.schema.js";
import {
  getCurrentUserService,
  loginUserService,
  registerUserService,
  requestPasswordResetService,
  resetPasswordService,
} from "../services/auth.service.js";
import { getValidationMessage } from "../utils/validation.js";

export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "VALIDATION_ERROR", getValidationMessage(parsed.error));
  }

  const session = await registerUserService(parsed.data);
  setAuthCookie(res, session.token);
  return res.status(201).json({ success: true, data: session.user });
};

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "VALIDATION_ERROR", getValidationMessage(parsed.error));
  }

  const session = await loginUserService(parsed.data);
  setAuthCookie(res, session.token);
  return res.status(200).json({ success: true, data: session.user });
};

export const getMe = async (req: Request, res: Response) => {
  const user = await getCurrentUserService(getAuthenticatedUserId(req));
  return res.status(200).json({ success: true, data: user });
};

export const logout = async (_req : Request, res : Response) => {
  setAuthCookie(res, "");
  return res.status(200).json({
    success : true,
    data : "User is logged out"
  })
}

export const requestPasswordReset = async (req: Request, res: Response) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "VALIDATION_ERROR", getValidationMessage(parsed.error));
  }

  await requestPasswordResetService(parsed.data.email);
  return res.status(200).json({
    success: true,
    data: "If an account exists for this email, a reset link has been sent.",
  });
};

export const getPasswordReset = async (req: Request, res: Response) => {
  getPasswordResetUserId(req);
  return res.status(200).json({ success: true, data: { valid: true } });
};

export const resetPassword = async (req: Request, res: Response) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "VALIDATION_ERROR", getValidationMessage(parsed.error));
  }

  const token = Array.isArray(req.params.token) ? req.params.token[0]! : req.params.token;
  const session = await resetPasswordService(
    getPasswordResetUserId(req),
    token,
    parsed.data.password,
  );
  setAuthCookie(res, session.token);
  return res.status(200).json({ success: true, data: session.user });
};
