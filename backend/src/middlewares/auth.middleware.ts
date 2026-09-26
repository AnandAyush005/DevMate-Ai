import type { Request, RequestHandler } from "express";
import { ApiError } from "../utils/api-error.ts";
import { readAuthCookie } from "../config/auth-cookie.ts";
import { verifyAuthToken } from "../services/auth-token.service.ts";

export const authenticate: RequestHandler = (req, _res, next) => {
  const token = readAuthCookie(req.headers.cookie);
  const userId = token ? verifyAuthToken(token) : null;

  if (!userId) {
    next(new ApiError(401, "UNAUTHENTICATED", "Authentication is required."));
    return;
  }

  req.authenticatedUserId = userId;
  next();
};

export const getAuthenticatedUserId = (req: Request) => {
  if (!req.authenticatedUserId) {
    throw new ApiError(401, "UNAUTHENTICATED", "Authentication is required.");
  }

  return req.authenticatedUserId;
};
