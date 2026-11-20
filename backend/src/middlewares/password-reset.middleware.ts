import type { Request, RequestHandler } from "express";
import { ApiError } from "../utils/api-error.js";
import { resetPasswordTokenParamSchema } from "../schemas/auth.schema.js";
import { getPasswordResetUserIdService } from "../services/auth.service.js";
import { getValidationMessage } from "../utils/validation.js";

export const authorizePasswordReset: RequestHandler = async (req, _res, next) => {
  try {
    const parsed = resetPasswordTokenParamSchema.safeParse(req.params.token);
    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", getValidationMessage(parsed.error));
    }

    req.passwordResetUserId = await getPasswordResetUserIdService(parsed.data);
    next();
  } catch (error) {
    next(error);
  }
};

export const getPasswordResetUserId = (req: Request) => {
  if (!req.passwordResetUserId) {
    throw new ApiError(401, "INVALID_RESET_TOKEN", "This reset link is invalid or has expired.");
  }

  return req.passwordResetUserId;
};
